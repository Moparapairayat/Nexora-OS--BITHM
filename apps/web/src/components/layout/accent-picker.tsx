"use client";

import { useEffect, useRef, useState } from "react";
import { Palette, Check, X, GripVertical } from "lucide-react";
import { motion } from "framer-motion";

type ThemeOption = {
  id: string;
  name: string;
  colorClass: string;
  glowClass: string;
  borderColor: string;
  accentHex: string;
};

const THEMES: ThemeOption[] = [
  {
    id: "emerald",
    name: "Neo Emerald",
    colorClass: "bg-[#32f59a]",
    glowClass: "shadow-[0_0_12px_rgba(50,245,154,0.6)]",
    borderColor: "border-[#32f59a]",
    accentHex: "#32f59a",
  },
  {
    id: "purple",
    name: "Cyber Purple",
    colorClass: "bg-[#a855f7]",
    glowClass: "shadow-[0_0_12px_rgba(168,85,247,0.6)]",
    borderColor: "border-[#a855f7]",
    accentHex: "#a855f7",
  },
  {
    id: "amber",
    name: "Amber Gold",
    colorClass: "bg-[#fb923c]",
    glowClass: "shadow-[0_0_12px_rgba(251,146,92,0.6)]",
    borderColor: "border-[#fb923c]",
    accentHex: "#fb923c",
  },
  {
    id: "rose",
    name: "Liquid Rose",
    colorClass: "bg-[#f43f5e]",
    glowClass: "shadow-[0_0_12px_rgba(244,63,94,0.6)]",
    borderColor: "border-[#f43f5e]",
    accentHex: "#f43f5e",
  },
];

interface AccentPickerProps {
  variant?: "floating" | "inline";
}

export function AccentPicker({ variant = "floating" }: AccentPickerProps) {
  const [activeTheme, setActiveTheme] = useState<string>("emerald");
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Load theme preference on mount & listen for changes
  useEffect(() => {
    const saved = localStorage.getItem("nexora-accent-theme") || "emerald";
    setActiveTheme(saved);
    applyTheme(saved);

    const handleAccentChange = () => {
      const current = localStorage.getItem("nexora-accent-theme") || "emerald";
      setActiveTheme(current);
    };

    window.addEventListener("nexora-accent-change", handleAccentChange);
    window.addEventListener("storage", handleAccentChange);
    return () => {
      window.removeEventListener("nexora-accent-change", handleAccentChange);
      window.removeEventListener("storage", handleAccentChange);
    };
  }, []);

  // Close floating popover when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

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

  const currentTheme = THEMES.find((t) => t.id === activeTheme) || THEMES[0];

  // Inline Variant (Compact Dot Picker for menus/settings)
  if (variant === "inline") {
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
            >
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 scale-75 rounded bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 whitespace-nowrap shadow-md z-50">
                {theme.name}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Floating Draggable Variant (Option 3: Movable Floating Theme Widget)
  return (
    <motion.div
      ref={widgetRef}
      drag
      dragMomentum={false}
      dragElastic={0.05}
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      onDragEnd={() => {
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 150);
      }}
      whileDrag={{ scale: 1.08 }}
      className="fixed top-20 right-3.5 sm:top-24 sm:right-6 z-40 font-sans cursor-grab active:cursor-grabbing select-none"
    >
      {/* Floating Popover Dock */}
      {isOpen && (
        <div className="absolute top-14 right-0 mt-2 w-64 rounded-2xl border border-white/15 light:border-slate-200/90 bg-[rgba(10,15,12,0.94)] light:bg-[rgba(255,255,255,0.96)] p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] light:shadow-[0_15px_35px_rgba(0,0,0,0.12)] backdrop-blur-2xl animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 cursor-default">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10 light:border-slate-200">
            <div className="flex items-center gap-2">
              <GripVertical className="h-3.5 w-3.5 text-slate-400/80 cursor-grab" title="Drag widget anywhere" />
              <Palette className="h-4 w-4" style={{ color: currentTheme.accentHex }} />
              <span className="text-xs font-bold tracking-wide text-slate-200 light:text-slate-800">
                Accent Theme
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-white/10 transition"
              aria-label="Close picker"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Theme Color Options */}
          <div className="space-y-1.5">
            {THEMES.map((theme) => {
              const isActive = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    handleSelect(theme.id);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/10 light:bg-slate-100 text-white light:text-slate-900 font-semibold shadow-inner"
                      : "text-slate-400 light:text-slate-600 hover:bg-white/5 light:hover:bg-slate-50 hover:text-slate-200 light:hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-4 w-4 rounded-full transition-transform ${theme.colorClass} ${
                        isActive ? `${theme.glowClass} scale-110` : "opacity-75"
                      }`}
                    />
                    <span>{theme.name}</span>
                  </div>
                  {isActive && (
                    <Check
                      className="h-3.5 w-3.5"
                      style={{ color: theme.accentHex }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => {
          if (!isDraggingRef.current) {
            setIsOpen((prev) => !prev);
          }
        }}
        className={`group relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border backdrop-blur-xl transition-all duration-300 shadow-xl ${
          isOpen
            ? "border-white/30 light:border-slate-400 bg-white/20 light:bg-slate-200 scale-105"
            : "border-white/15 light:border-slate-300/80 bg-[rgba(10,16,13,0.85)] light:bg-white/90 hover:scale-110 active:scale-95"
        }`}
        aria-label="Toggle accent theme picker"
        title="Drag to move • Click to choose theme"
      >
        {/* Glow Ring Indicator matching active theme */}
        <span
          className={`absolute inset-0 rounded-2xl opacity-40 transition-opacity group-hover:opacity-80 ${currentTheme.glowClass}`}
        />

        <Palette
          className="relative h-4.5 w-4.5 transition-transform duration-300 group-hover:rotate-12 pointer-events-none"
          style={{ color: currentTheme.accentHex }}
        />

        {/* Small Active Color Dot Badge */}
        <span
          className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-[#0a100d] light:border-white ${currentTheme.colorClass}`}
        />
      </button>
    </motion.div>
  );
}
