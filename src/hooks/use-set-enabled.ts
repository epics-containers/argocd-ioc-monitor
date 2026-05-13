import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setServiceEnabled } from "@/api/applications";

interface SetEnabledParams {
  parentName: string;
  serviceName: string;
  enabled: boolean;
  parentNamespace?: string;
}

export function useSetEnabled() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parentName, serviceName, enabled, parentNamespace }: SetEnabledParams) =>
      setServiceEnabled(parentName, serviceName, enabled, parentNamespace),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["application", variables.parentName],
      });
      void queryClient.invalidateQueries({
        queryKey: ["application", variables.serviceName],
      });
      void queryClient.invalidateQueries({ queryKey: ["applications"] });
      void queryClient.invalidateQueries({
        queryKey: ["resourceTree", variables.serviceName],
      });
    },
  });
}
