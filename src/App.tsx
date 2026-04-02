import { useEffect, useSyncExternalStore } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/layout";
import { ApplicationsPage } from "@/pages/applications";
import { ApplicationDetailPage } from "@/pages/application-detail";
import { LogsPage } from "@/pages/logs";
import { TokenDialog } from "@/components/shared/token-dialog";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import {
  subscribeToken,
  getTokenSnapshot,
  subscribeAuthMode,
  getAuthModeSnapshot,
  fetchAuthMode,
} from "@/lib/auth-token";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const hasToken = useSyncExternalStore(subscribeToken, getTokenSnapshot);
  const authMode = useSyncExternalStore(subscribeAuthMode, getAuthModeSnapshot);

  useEffect(() => {
    void fetchAuthMode();
  }, []);

  // Don't show dialog while auth mode is loading, or in oauth2-proxy mode
  const needsManualToken = authMode === "manual" && !hasToken;

  return (
    <>
      <TokenDialog
        open={needsManualToken}
        onTokenSubmit={() => void queryClient.invalidateQueries()}
      />
      {children}
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthGate>
            <ErrorBoundary>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<ApplicationsPage />} />
                <Route path="apps/:name" element={<ApplicationDetailPage />} />
                <Route
                  path="apps/:name/logs/:podName"
                  element={<LogsPage />}
                />
              </Route>
            </Routes>
            </ErrorBoundary>
          </AuthGate>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
