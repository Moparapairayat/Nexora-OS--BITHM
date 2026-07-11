"use client";

import { useEffect, useState } from "react";
import { PenguinLoadingSpinner } from "@/components/ui/loading-spinner";
import {
  subscribeToRouteLoading,
  triggerRouteLoading,
} from "@/hooks/use-route-loading";

export function RouteLoadingProvider() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to global loading state changes
    const unsubscribe = subscribeToRouteLoading((loading) => {
      setIsLoading(loading);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Intercept all link clicks and form submissions
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      // Only trigger for internal links
      if (href && href.startsWith("/") && !href.startsWith("//")) {
        triggerRouteLoading();
      }
    };

    const handleSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      const action = form.getAttribute("action");
      // Only trigger for internal forms
      if (action && action.startsWith("/")) {
        triggerRouteLoading();
      }
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <PenguinLoadingSpinner size="2xl" showText={true} text="Loading page" />
    </div>
  );
}
