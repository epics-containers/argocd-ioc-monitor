import { describe, it, expect, vi, beforeEach } from "vitest";
import { setServiceEnabled } from "@/api/applications";
import type { Application } from "@/types/application";

vi.mock("@/lib/auth-token", () => ({
  applyStoredTokens: vi.fn(),
  getStoredRefreshToken: vi.fn(() => null),
  getAuthModeSnapshot: vi.fn(() => "manual"),
  onAuthFailure: vi.fn(),
  redirectToLogin: vi.fn(() => true),
  saveTokens: vi.fn(),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function textResponse(body: string, status: number): Response {
  return new Response(body, { status });
}

function makeParent(parameters: { name: string; value: string }[] = []): Application {
  return {
    metadata: { name: "parent-app", namespace: "argocd", resourceVersion: "1" },
    spec: {
      project: "parent-app",
      destination: { namespace: "argocd" },
      source: {
        repoURL: "https://example/repo",
        path: ".",
        targetRevision: "main",
        helm: { parameters },
      },
    },
    status: {
      health: { status: "Healthy" },
      sync: { status: "Synced" },
    },
  } as unknown as Application;
}

function lastPutBody(): Application {
  const calls = mockFetch.mock.calls as [string, RequestInit | undefined][];
  const putCall = [...calls].reverse().find((c) => c[1]?.method === "PUT");
  if (!putCall) throw new Error("no PUT call recorded");
  return JSON.parse(putCall[1]!.body as string) as Application;
}

describe("setServiceEnabled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds the parameter when absent", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(makeParent([])));
    mockFetch.mockResolvedValueOnce(jsonResponse(makeParent([])));

    await setServiceEnabled("parent-app", "svc-a", false, "argocd");

    const params = lastPutBody().spec.source!.helm!.parameters!;
    expect(params).toEqual([{ name: "services.svc-a.enabled", value: "false" }]);
  });

  it("replaces the parameter when present with a different value", async () => {
    const existing = [
      { name: "services.svc-a.enabled", value: "true" },
      { name: "global.commitHash", value: "abc" },
    ];
    mockFetch.mockResolvedValueOnce(jsonResponse(makeParent(existing)));
    mockFetch.mockResolvedValueOnce(jsonResponse(makeParent(existing)));

    await setServiceEnabled("parent-app", "svc-a", false, "argocd");

    const params = lastPutBody().spec.source!.helm!.parameters!;
    expect(params).toContainEqual({ name: "services.svc-a.enabled", value: "false" });
    expect(params).toContainEqual({ name: "global.commitHash", value: "abc" });
    expect(params.filter((p) => p.name === "services.svc-a.enabled")).toHaveLength(1);
  });

  it("replaces the parameter when present with the same value (idempotent PUT)", async () => {
    const existing = [{ name: "services.svc-a.enabled", value: "false" }];
    mockFetch.mockResolvedValueOnce(jsonResponse(makeParent(existing)));
    mockFetch.mockResolvedValueOnce(jsonResponse(makeParent(existing)));

    await setServiceEnabled("parent-app", "svc-a", false, "argocd");

    const params = lastPutBody().spec.source!.helm!.parameters!;
    expect(params).toEqual([{ name: "services.svc-a.enabled", value: "false" }]);
  });

  it("retries once on 409 by refetching the parent", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(makeParent([])));
    mockFetch.mockResolvedValueOnce(textResponse("conflict", 409));
    mockFetch.mockResolvedValueOnce(jsonResponse(makeParent([])));
    mockFetch.mockResolvedValueOnce(jsonResponse(makeParent([])));

    await setServiceEnabled("parent-app", "svc-a", true, "argocd");

    expect(mockFetch).toHaveBeenCalledTimes(4);
    const params = lastPutBody().spec.source!.helm!.parameters!;
    expect(params).toEqual([{ name: "services.svc-a.enabled", value: "true" }]);
  });

  it("propagates non-409 errors without retrying", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(makeParent([])));
    mockFetch.mockResolvedValueOnce(textResponse("forbidden", 403));

    await expect(
      setServiceEnabled("parent-app", "svc-a", false, "argocd"),
    ).rejects.toThrow(/403/);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("throws when parent has no spec.source", async () => {
    const parent = makeParent([]);
    delete parent.spec.source;
    mockFetch.mockResolvedValueOnce(jsonResponse(parent));

    await expect(
      setServiceEnabled("parent-app", "svc-a", false, "argocd"),
    ).rejects.toThrow(/no spec\.source/);
  });
});
