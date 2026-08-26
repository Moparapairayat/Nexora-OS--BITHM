"use client";

import { Sun, Moon } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("nexora-theme-change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("nexora-theme-change", callback);
  };
}

function getSnapshot() {
  return window.localStorage.getItem("nexora-theme") === "light";
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const isLight = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    document.documentElement.classList.toggle("light", isLight);
    document.documentElement.classList.toggle("dark", !isLight);
  }, [isLight]);

  function toggleTheme() {
    const next = !isLight;
    document.documentElement.classList.toggle("light", next);
    document.documentElement.classList.toggle("dark", !next);
    window.localStorage.setItem("nexora-theme", next ? "light" : "dark");
    window.dispatchEvent(new Event("nexora-theme-change"));
  }

  const label = isLight
    ? "Switch to Dark mode"
    : "Switch to Light mode";

  return (
    <button
      type="button"
      className="relative flex h-[32px] w-[56px] items-center rounded-full border border-slate-200/90 bg-slate-100/90 p-0.5 shadow-xs transition-all duration-300 hover:border-slate-300 active:scale-95 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 group/theme-toggle cursor-pointer"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      data-cursor="hover"
    >
      {/* Sliding Knob */}
      <div
        className={cn(
          "flex h-[24px] w-[24px] items-center justify-center rounded-full transition-all duration-300 shadow-xs",
          !isLight
            ? "translate-x-[24px] bg-emerald-500/15 border border-emerald-400/30 text-emerald-400"
            : "translate-x-[2px] bg-white border border-amber-400/30 text-amber-500 shadow-sm",
        )}
      >
        {!isLight ? (
          <Moon
            className="w-3.5 h-3.5 transition-transform duration-300 group-hover/theme-toggle:scale-110"
          />
        ) : (
          <Sun
            className="w-3.5 h-3.5 transition-transform duration-300 group-hover/theme-toggle:scale-110"
          />
        )}
      </div>
    </button>
  );
}
