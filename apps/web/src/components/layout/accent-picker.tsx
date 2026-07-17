"use client";

import { useEffect, useState } from "react";

type ThemeOption = {
  id: string;
  name: string;
  colorClass: string;
  glowClass: string;
  borderColor: string;
};

const THEMES: ThemeOption[] = [
  {
    id: "emerald",
    name: "Neo Emerald",
    colorClass: "bg-[#32f59a]",
    glowClass: "shadow-[0_0_12px_rgba(50,245,154,0.5)]",
    borderColor: "border-[#32f59a]/30",
  },
  {
    id: "purple",
    name: "Cyber Purple",
    colorClass: "bg-[#a855f7]",
    glowClass: "shadow-[0_0_12px_rgba(168,85,247,0.5)]",
    borderColor: "border-[#a855f7]/30",
  },
  {
    id: "amber",
    name: "Amber Gold",
    colorClass: "bg-[#fb923c]",
    glowClass: "shadow-[0_0_12px_rgba(251,146,92,0.5)]",
    borderColor: "border-[#fb923c]/30",
  },
  {
    id: "rose",
    name: "Liquid Rose",
    colorClass: "bg-[#f43f5e]",
    glowClass: "shadow-[0_0_12px_rgba(244,63,94,0.5)]",
    borderColor: "border-[#f43f5e]/30",
  },
];

export function AccentPicker() {
  const [activeTheme, setActiveTheme] = useState<string>("emerald");

  // Load theme preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("nexora-accent-theme") || "emerald";
    setActiveTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (themeId: string) => {
    const root = document.documentElement;
    
    // Remove all existing theme classes
    THEMES.forEach((t) => {
      if (t.id !== "emerald") {
        root.classList.remove(`theme-${t.id}`);
      }
    });

    // Add selected theme class (emerald is default, so no class needed)
    if (themeId !== "emerald") {
      root.classList.add(`theme-${themeId}`);
    }

    localStorage.setItem("nexora-accent-theme", themeId);
    window.dispatchEvent(new Event("nexora-accent-change"));
  };

  const handleSelect = (themeId: string) => {
    setActiveTheme(themeId);
    applyTheme(themeId);
  };

  return (
    <div 
      className="flex items-center gap-1.5 rounded-full border border-white/10 light:border-black/10 bg-black/30 light:bg-white/70 px-2 py-1 backdrop-blur-md shadow-lg"
      title="Choose Accent Glow Theme"
    >
      {THEMES.map((theme) => {
        const isActive = activeTheme === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => handleSelect(theme.id)}
            className={`group relative h-4 w-4 rounded-full transition-all duration-300 hover:scale-125 ${
              theme.colorClass
            } ${isActive ? `${theme.glowClass} scale-110 ring-2 ring-white light:ring-slate-900 ring-offset-1 ring-offset-black/20` : "opacity-65 hover:opacity-100"}`}
            aria-label={`Switch to ${theme.name} theme`}
            title={theme.name}
            data-cursor="hover"
          >
            {/* Tooltip */}
            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 scale-75 rounded bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 whitespace-nowrap shadow-md z-50">
              {theme.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
