import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "@/api/session";
import { subscribeAuthMode, getAuthModeSnapshot } from "@/lib/auth-token";

export function useAuth() {
  const authMode = useSyncExternalStore(subscribeAuthMode, getAuthModeSnapshot);

  const query = useQuery({
    queryKey: ["auth", "userinfo", authMode],
    queryFn: getUserInfo,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: authMode !== null,
  });

  return {
    user: query.data,
    // Use isFetching so loading is true during refetches, not just initial load
    isLoading: query.isFetching,
    isAuthenticated: query.data?.loggedIn ?? false,
    error: query.error,
  };
}
