import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  saveTokens,
  getStoredToken,
  getStoredRefreshToken,
  clearStoredToken,
  onAuthFailure,
  fetchAuthMode,
  __resetAuthModeForTests,
} from "@/lib/auth-token";

describe("auth-token", () => {
  beforeEach(() => {
    localStorage.clear();
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
  });

  it("saves and retrieves auth token", () => {
    saveTokens("my-auth-token");

    expect(getStoredToken()).toBe("my-auth-token");
  });

  it("saves and retrieves refresh token", () => {
    saveTokens("auth", "my-refresh-token");

    expect(getStoredRefreshToken()).toBe("my-refresh-token");
  });

  it("clearStoredToken removes both tokens", () => {
    saveTokens("auth", "refresh");

    clearStoredToken();

    expect(getStoredToken()).toBeNull();
    expect(getStoredRefreshToken()).toBeNull();
  });

  it("onAuthFailure clears auth token but preserves refresh token", () => {
    saveTokens("auth", "refresh");

    onAuthFailure();

    expect(getStoredToken()).toBeNull();
    expect(getStoredRefreshToken()).toBe("refresh");
  });
});

describe("fetchAuthMode", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    __resetAuthModeForTests();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the served mode when nginx responds with valid JSON", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('{"mode":"oauth2-proxy"}', { status: 200, headers: { "Content-Type": "application/json" } }),
    );

    await expect(fetchAuthMode()).resolves.toBe("oauth2-proxy");
  });

  it("falls back to manual when the endpoint isn't found (dev/devcontainer)", async () => {
    fetchMock.mockResolvedValueOnce(new Response("Not Found", { status: 404 }));

    await expect(fetchAuthMode()).resolves.toBe("manual");
  });

  it("falls back to manual when the response is valid JSON without a recognised mode", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('{"error":"unknown route"}', { status: 200, headers: { "Content-Type": "application/json" } }),
    );

    await expect(fetchAuthMode()).resolves.toBe("manual");
  });

  it("falls back to manual when fetch rejects (network error)", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network down"));

    await expect(fetchAuthMode()).resolves.toBe("manual");
  });
});
