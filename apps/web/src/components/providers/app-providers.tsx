"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { RouteLoadingProvider } from "@/components/providers/route-loading-provider";
import { AccentPicker } from "@/components/layout/accent-picker";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RouteLoadingProvider />
      {children}
      <AccentPicker />
    </QueryClientProvider>
  );
}
