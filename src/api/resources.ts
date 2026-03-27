import { argocdFetch } from "./argocd-client";
import type { ResourceTree, PodResource } from "@/types/resource";

export async function getResourceTree(appName: string, appNamespace?: string): Promise<ResourceTree> {
  const params = new URLSearchParams();
  if (appNamespace) {
    params.set("appNamespace", appNamespace);
  }
  const query = params.toString();
  return argocdFetch<ResourceTree>(
    `/api/v1/applications/${encodeURIComponent(appName)}/resource-tree${query ? `?${query}` : ""}`,
  );
}

export async function getPodResource(
  appName: string,
  podName: string,
  namespace: string,
  appNamespace?: string,
): Promise<PodResource> {
  const params = new URLSearchParams({
    name: podName,
    namespace,
    kind: "Pod",
    version: "v1",
  });
  if (appNamespace) {
    params.set("appNamespace", appNamespace);
  }
  const result = await argocdFetch<{ manifest: string }>(
    `/api/v1/applications/${encodeURIComponent(appName)}/resource?${params}`,
  );
  return JSON.parse(result.manifest) as PodResource;
}

export async function deletePod(
  appName: string,
  podName: string,
  namespace: string,
  appNamespace?: string,
): Promise<void> {
  const params = new URLSearchParams({
    name: podName,
    namespace,
    kind: "Pod",
    version: "v1",
    force: "false",
  });
  if (appNamespace) {
    params.set("appNamespace", appNamespace);
  }
  await argocdFetch<unknown>(
    `/api/v1/applications/${encodeURIComponent(appName)}/resource?${params}`,
    { method: "DELETE" },
  );
}
