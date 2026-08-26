"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem("nexora-theme");
      const isLight = storedTheme === "light";
      document.documentElement.classList.toggle("light", isLight);
      document.documentElement.classList.toggle("dark", !isLight);
    } catch {}
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouteLoadingProvider />
      {children}
      <AccentPicker />
    </QueryClientProvider>
  );
}
