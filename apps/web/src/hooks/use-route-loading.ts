"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

let globalLoadingState = false;
let loadingListeners: Array<(isLoading: boolean) => void> = [];

export function triggerRouteLoading() {
  globalLoadingState = true;
  loadingListeners.forEach((listener) => listener(true));
  // Set minimum visible time for loader (3 seconds for better visibility during testing)
  setTimeout(() => {
    globalLoadingState = false;
    loadingListeners.forEach((listener) => listener(false));
  }, 3000);
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
  (window as any).__nexoraRouteLoading = {
    triggerLoading: triggerRouteLoading,
  };
}
