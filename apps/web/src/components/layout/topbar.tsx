"use client";

import { Bell, Menu, SlidersHorizontal } from "lucide-react";

import { CommandPalette } from "@/components/layout/command-palette";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NexoraLogo } from "@/components/brand/nexora-logo";
import {
  AIButton,
  CommandSearch,
  RoleBadge,
} from "@/components/ui/command-primitives";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const workspaceLabel: Record<AppRole, string> = {
  student: "Student Workspace",
  teacher: "Teacher Workspace",
  admin: "Admin Workspace",
};

const roleInitial: Record<AppRole, string> = {
  student: "S",
  teacher: "T",
  admin: "A",
};

const serviceLabel: Record<AppRole, string> = {
  student: "Workspace ready",
  teacher: "Review tools ready",
  admin: "Local services online",
};

export function Topbar({
  role,
  title,
  commandOpen,
  setCommandOpen,
  onMenu,
}: {
  role: AppRole;
  title: string;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  onMenu: () => void;
}) {
  return (
    <>
      <header className="sticky top-0 z-20 -mx-4 rounded-t-3xl border-b border-[var(--line)] bg-[rgba(5,7,6,0.76)] px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl light:rounded-t-[28px] light:border-[color:var(--line)] light:bg-[rgba(250,253,251,0.88)] light:shadow-[0_10px_30px_rgba(31,67,49,0.055)] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-h-14 items-center gap-2.5">
          <button
            type="button"
            className="nexora-focus rounded-2xl p-2 text-slate-300 transition hover:bg-white/[0.06] light:text-slate-700 light:hover:bg-emerald-50 lg:hidden"
            aria-label="Open navigation"
            title="Open navigation"
            onClick={onMenu}
          >
            <Menu className="h-5 w-5" />
          </button>
          <NexoraLogo
            size="sm"
            priority
            className="h-9 w-[134px] sm:w-[150px] lg:hidden"
          />
          <div className="hidden min-w-0 shrink-0 items-center gap-3 lg:flex">
            <RoleBadge role={role} />
            <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-500 light:text-slate-600">
              <span className="truncate">{workspaceLabel[role]}</span>
              <span className="text-slate-600 light:text-slate-300">/</span>
              <span className="truncate text-slate-400 light:text-slate-800">
                {title}
              </span>
            </div>
          </div>

          <div className="hidden min-w-0 flex-1 min-[1360px]:flex min-[1360px]:justify-center">
            <CommandSearch onClick={() => setCommandOpen(true)} />
          </div>
          <div className="hidden items-center gap-2 rounded-2xl border border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.08)] px-3 py-2 text-xs font-semibold text-[var(--brand-emerald)] light:border-emerald-100 light:bg-white light:text-emerald-700 light:shadow-[0_10px_24px_rgba(20,150,92,0.08)] xl:flex">
            <span className="h-2 w-2 rounded-full bg-[var(--brand-emerald)] shadow-[0_0_12px_rgba(50,245,154,0.9)]" />
            {serviceLabel[role]}
          </div>

          <Button
            type="button"
            variant="ghost"
            className="relative h-10 w-10 rounded-2xl px-0 light:bg-white light:shadow-[0_10px_24px_rgba(33,45,74,0.06)]"
            aria-label="Open notifications"
            title="Open notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-emerald-600 px-1 font-mono text-[10px] font-bold text-white">
              3
            </span>
          </Button>
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            className="hidden h-10 w-10 rounded-2xl px-0 light:bg-white light:shadow-[0_10px_24px_rgba(33,45,74,0.06)] md:inline-flex"
            aria-label="Open quick filters"
            title="Open quick filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            className={cn(
              "hidden h-11 w-11 rounded-full px-0 font-semibold md:inline-flex",
              "light:border-emerald-100 light:bg-emerald-50 light:text-emerald-800 light:shadow-[0_10px_24px_rgba(20,150,92,0.1)]",
            )}
            aria-label="Open user profile"
            title="Open user profile"
          >
            {roleInitial[role]}
          </Button>
          <AIButton className="hidden 2xl:inline-flex">Ask Nexora</AIButton>
        </div>
      </header>
      <CommandPalette
        role={role}
        open={commandOpen}
        onOpenChange={setCommandOpen}
      />
    </>
  );
}
