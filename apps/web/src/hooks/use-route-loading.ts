"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

let loadingListeners: Array<(isLoading: boolean) => void> = [];

export function triggerRouteLoading() {
  loadingListeners.forEach((listener) => listener(true));
  // Keep route feedback visible briefly without slowing navigation.
  setTimeout(() => {
    loadingListeners.forEach((listener) => listener(false));
  }, 650);
}

export function subscribeToRouteLoading(
  callback: (isLoading: boolean) => void,
) {
  loadingListeners.push(callback);
  return () => {
    loadingListeners = loadingListeners.filter((l) => l !== callback);
  };
}

export function useRouteLoading() {
  const router = useRouter();

  const navigateTo = useCallback(
    (href: string, options?: { replace?: boolean }) => {
      triggerRouteLoading();
      if (options?.replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    },
    [router],
  );

  return {
    navigateTo,
    triggerLoading: triggerRouteLoading,
  };
}

// Expose to window for debugging and manual triggering
if (typeof window !== "undefined") {
  const debugWindow = window as Window & {
    __nexoraRouteLoading?: { triggerLoading: typeof triggerRouteLoading };
  };
  debugWindow.__nexoraRouteLoading = {
    triggerLoading: triggerRouteLoading,
  };
}
