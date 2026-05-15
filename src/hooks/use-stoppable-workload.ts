import { useQuery } from "@tanstack/react-query";
import { getStoppableWorkload } from "@/api/resources";

export function useStoppableWorkload(appName: string, appNamespace?: string) {
  return useQuery({
    queryKey: ["stoppable", appName, appNamespace],
    queryFn: () => getStoppableWorkload(appName, appNamespace),
    enabled: !!appName,
    staleTime: 60000,
  });
}
