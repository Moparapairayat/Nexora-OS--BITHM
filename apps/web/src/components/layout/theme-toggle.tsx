"use client";

import { GraduationCap, Moon } from "lucide-react";
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
  }, [isLight]);

  function toggleTheme() {
    const next = !isLight;
    document.documentElement.classList.toggle("light", next);
    window.localStorage.setItem("nexora-theme", next ? "light" : "dark");
    window.dispatchEvent(new Event("nexora-theme-change"));
  }

  const Icon = isLight ? Moon : GraduationCap;
  const label = isLight
    ? "Switch to Premium Dark mode"
    : "Switch to Academic Light mode";

  return (
    <Button
      type="button"
      variant="ghost"
      className="h-10 w-10 px-0 rounded-xl border border-white/12 bg-white/[0.045] hover:bg-white/[0.08] transition-all duration-200 light:border-emerald-950/10 light:bg-white light:hover:bg-emerald-50 text-slate-300 light:text-slate-700 hover:text-white light:hover:text-emerald-900"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <Icon className="h-4.5 w-4.5" aria-hidden="true" />
    </Button>
  );
}
