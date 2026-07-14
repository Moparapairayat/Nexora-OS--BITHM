"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { RouteLoadingProvider } from "@/components/providers/route-loading-provider";
import { client } from "@/lib/appwrite";

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

  useEffect(() => {
    client
      .ping()
      .then(() =>
        console.info("[Appwrite] Backend ping successful (setup verified)."),
      )
      .catch((error) =>
        console.error("[Appwrite] Backend ping failed:", error),
      );
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouteLoadingProvider />
      {children}
    </QueryClientProvider>
  );
}
