"use client";

import { Sun, Moon } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

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
    ? "Switch to Premium Dark mode"
    : "Switch to Academic Light mode";

  return (
    <button
      type="button"
      className="flex h-[32px] w-[58px] items-center rounded-full border backdrop-blur-xl transition-all duration-300 shadow-xl bg-black/40 light:bg-white/85 border-white/10 light:border-black/10 shadow-black/10 dark:shadow-black/40 hover:scale-105 active:scale-95 group/theme-toggle"
      style={{
        borderColor: isLight
          ? "rgba(16, 185, 129, 0.3)"
          : "rgba(50, 245, 154, 0.3)",
        boxShadow: isLight
          ? "0 0 20px rgba(16, 185, 129, 0.08), 0 8px 30px rgba(0,0,0,0.15)"
          : "0 0 20px rgba(50, 245, 154, 0.08), 0 8px 30px rgba(0,0,0,0.25)",
      }}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      data-cursor="hover"
    >
      {/* Sliding Knob */}
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 shadow-md ${
          !isLight
            ? "translate-x-[26px] bg-[rgba(50,245,154,0.1)] border border-[rgba(50,245,154,0.25)]"
            : "translate-x-[4px] bg-amber-500/10 border border-amber-500/30"
        }`}
      >
        {!isLight ? (
          <Moon
            className="w-3.5 h-3.5 text-[var(--cursor-accent-color)] transition-transform duration-300 group-hover/theme-toggle:scale-110"
            style={{
              filter: "drop-shadow(0 0 3px var(--cursor-accent-color))",
            }}
          />
        ) : (
          <Sun
            className="w-3.5 h-3.5 text-amber-500 light:text-amber-600 transition-transform duration-300 group-hover/theme-toggle:scale-110"
            style={{
              filter: "drop-shadow(0 0 3px rgba(245,158,11,0.8))",
            }}
          />
        )}
      </div>
    </button>
  );
}
