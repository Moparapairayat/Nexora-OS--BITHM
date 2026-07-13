"use client";

import Link from "next/link";
import { ArrowRight, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { iconMap } from "@/components/layout/icon-map";
import { Badge } from "@/components/ui/badge";
import { roleDashboards, type AppRole, type Tone } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const roleMeta: Record<AppRole, { label: string; tone: Tone }> = {
  student: { label: "Student", tone: "cyan" },
  teacher: { label: "Teacher", tone: "amber" },
  admin: { label: "Admin", tone: "violet" },
};

export function CommandPalette({
  role,
  open,
  onOpenChange,
}: {
  role: AppRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(true);
      }

      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function keepFocusInside(event: KeyboardEvent) {
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", keepFocusInside);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keepFocusInside);
    };
  }, [open]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const unique = Array.from(
      new Map(
        roleDashboards[role].nav.map((item) => [item.href, item]),
      ).values(),
    );

    if (!normalized) {
      return unique.slice(0, 12);
    }

    return unique
      .filter((item) => {
        const roleLabel = roleMeta[role].label;
        return `${item.label} ${item.href} ${roleLabel}`
          .toLowerCase()
          .includes(normalized);
      })
      .slice(0, 12);
  }, [query, role]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 px-4 py-6 backdrop-blur-xl sm:pt-20"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Nexora command palette"
        className="command-surface-strong command-border w-full max-w-3xl overflow-hidden rounded-[24px] shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
      >
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[color:var(--border-lime)] bg-[rgba(217,255,87,0.1)]">
              <Search
                className="h-5 w-5 text-[var(--brand-lime)]"
                aria-hidden="true"
              />
            </div>
            <input
              autoFocus
              aria-label="Search pages and tools"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pages, labs, reports, and tools..."
              className="h-12 min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-500 light:text-slate-950"
            />
            <button
              type="button"
              className="nexora-focus rounded-xl border border-white/10 bg-white/[0.055] p-2 text-slate-300 transition hover:bg-white/[0.09]"
              aria-label="Close command palette"
              title="Close command palette"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Badge tone="cyan">Ctrl K</Badge>
            <span>Open any page available to your account.</span>
          </div>
        </div>

        <div className="grid max-h-[62vh] gap-2 overflow-y-auto p-3">
          {results.length > 0 ? (
            results.map((item) => {
              const Icon = iconMap[item.icon] ?? iconMap.LayoutDashboard;
              const meta = roleMeta[role];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nexora-focus group grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm transition hover:border-[color:var(--border-emerald)] hover:bg-[rgba(217,255,87,0.055)]"
                  onClick={() => onOpenChange(false)}
                >
                  <div
                    className={cn(
                      "grid h-11 w-11 place-items-center rounded-xl border bg-white/[0.045]",
                      meta.tone === "amber" && "border-[rgba(255,180,90,0.2)]",
                      meta.tone === "cyan" &&
                        "border-[color:var(--border-lime)]",
                      meta.tone === "violet" && "border-[rgba(138,95,61,0.24)]",
                    )}
                  >
                    <Icon
                      className="h-4 w-4 text-[var(--brand-lime)]"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white light:text-slate-950">
                        {item.label}
                      </span>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </div>
                    <p className="mt-1 truncate font-mono text-xs text-slate-500">
                      {item.href}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-[var(--brand-lime)]" />
                </Link>
              );
            })
          ) : (
            <div className="grid min-h-40 place-items-center rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center">
              <div>
                <Sparkles
                  className="mx-auto h-6 w-6 text-[var(--brand-lime)]"
                  aria-hidden="true"
                />
                <p className="mt-4 text-sm font-semibold text-white">
                  No command found
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Try a role, route or module name.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
