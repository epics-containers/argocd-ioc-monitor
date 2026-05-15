import { useQuery } from "@tanstack/react-query";
import { getApplication } from "@/api/applications";
import { getResourceTree } from "@/api/resources";

export function useApplication(
  name: string,
  appNamespace?: string,
  refetchInterval: number = 15000,
) {
  return useQuery({
    queryKey: ["application", name, appNamespace],
    queryFn: () => getApplication(name, appNamespace),
    enabled: !!name,
    refetchInterval,
  });
}

export function useResourceTree(
  appName: string,
  appNamespace?: string,
  refetchInterval: number = 15000,
) {
  return useQuery({
    queryKey: ["resourceTree", appName, appNamespace],
    queryFn: () => getResourceTree(appName, appNamespace),
    enabled: !!appName,
    refetchInterval,
  });
}
