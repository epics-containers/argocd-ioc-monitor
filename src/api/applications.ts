import { argocdFetch, ApiError } from "./argocd-client";
import type {
  Application,
  ApplicationList,
  HelmParameter,
} from "@/types/application";

export async function listApplications(
  project?: string,
): Promise<ApplicationList> {
  const params = new URLSearchParams();
  if (project) {
    params.set("project", project);
  }
  const query = params.toString();
  const path = `/api/v1/applications${query ? `?${query}` : ""}`;
  return argocdFetch<ApplicationList>(path);
}

export async function getApplication(name: string, appNamespace?: string): Promise<Application> {
  const params = new URLSearchParams();
  if (appNamespace) {
    params.set("appNamespace", appNamespace);
  }
  const query = params.toString();
  return argocdFetch<Application>(
    `/api/v1/applications/${encodeURIComponent(name)}${query ? `?${query}` : ""}`,
  );
}

function putApplication(
  name: string,
  body: Application,
  appNamespace?: string,
): Promise<Application> {
  const params = new URLSearchParams();
  if (appNamespace) {
    params.set("appNamespace", appNamespace);
  }
  const query = params.toString();
  return argocdFetch<Application>(
    `/api/v1/applications/${encodeURIComponent(name)}${query ? `?${query}` : ""}`,
    { method: "PUT", body: JSON.stringify(body) },
  );
}

function withServiceEnabled(
  parent: Application,
  serviceName: string,
  enabled: boolean,
): Application {
  if (!parent.spec.source) {
    throw new Error(
      `Parent application ${parent.metadata.name} has no spec.source; multi-source parents are not supported`,
    );
  }
  const key = `services.${serviceName}.enabled`;
  const current = parent.spec.source.helm?.parameters ?? [];
  const value = String(enabled);
  const next: HelmParameter[] = [
    ...current.filter((p) => p.name !== key),
    { name: key, value },
  ];
  return {
    ...parent,
    spec: {
      ...parent.spec,
      source: {
        ...parent.spec.source,
        helm: {
          ...(parent.spec.source.helm ?? {}),
          parameters: next,
        },
      },
    },
  };
}

/**
 * Set `services.<serviceName>.enabled=<enabled>` on the parent ArgoCD Application.
 * Performs a read-modify-write of the full spec because ArgoCD has no narrower endpoint.
 * Retries once on 409 (resourceVersion mismatch) by refetching the parent.
 */
export async function setServiceEnabled(
  parentName: string,
  serviceName: string,
  enabled: boolean,
  parentNamespace?: string,
): Promise<void> {
  let parent = await getApplication(parentName, parentNamespace);
  try {
    await putApplication(
      parentName,
      withServiceEnabled(parent, serviceName, enabled),
      parentNamespace,
    );
    return;
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 409) throw err;
  }
  parent = await getApplication(parentName, parentNamespace);
  await putApplication(
    parentName,
    withServiceEnabled(parent, serviceName, enabled),
    parentNamespace,
  );
}
