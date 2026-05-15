import { argocdFetch, ApiError } from "./argocd-client";
import type {
  Application,
  ApplicationList,
  ApplicationSpec,
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

function putApplicationSpec(
  name: string,
  spec: ApplicationSpec,
  appNamespace?: string,
): Promise<unknown> {
  // Per ArgoCD's grpc-gateway annotation `body: "spec"`, the HTTP body is the
  // ApplicationSpec itself — not a wrapping {name, spec, validate, ...}
  // envelope. Sending the envelope causes ArgoCD to parse it as the spec,
  // resolve project="" and deny on the empty-project RBAC subject.
  const params = new URLSearchParams();
  if (appNamespace) params.set("appNamespace", appNamespace);
  params.set("validate", "false");
  const query = params.toString();
  return argocdFetch<unknown>(
    `/api/v1/applications/${encodeURIComponent(name)}/spec?${query}`,
    { method: "PUT", body: JSON.stringify(spec) },
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
 *
 * Writes via PUT /api/v1/applications/{name}/spec (the UpdateSpec RPC, matching
 * `argocd app set -p`). The whole-app Update RPC re-validates destination, sources
 * and pending operation fields, which can trip RBAC checks the user isn't expected
 * to satisfy for a parameter override; UpdateSpec with validate=false skips that.
 */
export async function setServiceEnabled(
  parentName: string,
  serviceName: string,
  enabled: boolean,
  parentNamespace?: string,
): Promise<void> {
  let parent = await getApplication(parentName, parentNamespace);
  try {
    await putApplicationSpec(
      parentName,
      withServiceEnabled(parent, serviceName, enabled).spec,
      parentNamespace,
    );
    return;
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 409) throw err;
  }
  parent = await getApplication(parentName, parentNamespace);
  await putApplicationSpec(
    parentName,
    withServiceEnabled(parent, serviceName, enabled).spec,
    parentNamespace,
  );
}
