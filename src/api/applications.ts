import { argocdFetch } from "./argocd-client";
import type { Application, ApplicationList } from "@/types/application";

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
