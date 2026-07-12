"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PenguinLoadingSpinner } from "@/components/ui/loading-spinner";
import {
  subscribeToRouteLoading,
  triggerRouteLoading,
} from "@/hooks/use-route-loading";

function isPublicRoute(route: string) {
  return ["/", "/login", "/register", "/signup"].includes(
    route.split(/[?#]/)[0],
  );
}

export function RouteLoadingProvider() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

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
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !isPublicRoute(pathname) &&
        !isPublicRoute(href)
      ) {
        triggerRouteLoading();
      }
    };

    const handleSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      const action = form.getAttribute("action");
      // Only trigger for internal forms
      if (
        action &&
        action.startsWith("/") &&
        !isPublicRoute(pathname) &&
        !isPublicRoute(action)
      ) {
        triggerRouteLoading();
      }
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-[#050706]/28 px-4 backdrop-blur-[3px] light:bg-slate-900/10"
      role="status"
      aria-live="polite"
      aria-label="Opening page"
    >
      <div className="command-border relative w-full max-w-[190px] overflow-hidden rounded-[24px] border border-white/12 bg-[rgba(13,17,16,0.92)] px-5 pb-5 pt-4 text-center shadow-[0_24px_70px_rgba(0,0,0,0.38),0_0_44px_rgba(50,245,154,0.1)] backdrop-blur-2xl light:border-emerald-100 light:bg-white/94 light:shadow-[0_20px_54px_rgba(31,67,49,0.15)]">
        <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,#32f59a,transparent)]" />
        <PenguinLoadingSpinner size="lg" showText={false} />
        <p className="mt-1 text-sm font-semibold text-slate-100 light:text-[#15251f]">
          Opening…
        </p>
        <div className="mx-auto mt-3 h-1 w-24 overflow-hidden rounded-full bg-white/10 light:bg-emerald-950/10">
          <span className="block h-full w-1/2 animate-[nexora-loader_1.05s_ease-in-out_infinite] rounded-full bg-[linear-gradient(90deg,#d9ff57,#32f59a)]" />
        </div>
      </div>
    </div>
  );
}
