"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpenCheck,
  ChevronRight,
  FlaskConical,
  LogOut,
  Menu,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CommandPalette } from "@/components/layout/command-palette";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AccentPicker } from "@/components/layout/accent-picker";
import { NexoraLogo } from "@/components/brand/nexora-logo";
import {
  AIButton,
  CommandSearch,
  RoleBadge,
} from "@/components/ui/command-primitives";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/data/dashboard.mock";
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

const roleAvatar: Record<AppRole, string> = {
  student: "/landing/team/emre_avatar.png",
  teacher: "/landing/team/emre_avatar.png",
  admin: "/landing/team/emre_avatar.png",
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
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState<
    "notifications" | "quick" | "profile" | null
  >(null);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function toggleMenu(menu: typeof openMenu) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  function signOut() {
    window.localStorage.removeItem("nexora_token");
    window.sessionStorage.removeItem("nexora_token");
    router.replace("/login");
  }

  return (
    <>
      <header className="nexora-app-topbar sticky top-0 z-20 -mx-4 rounded-t-3xl border-b border-[var(--line)] bg-[rgba(5,7,6,0.76)] px-4 py-2 sm:py-3 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl light:rounded-t-[28px] light:border-[color:var(--line)] light:bg-[rgba(250,253,251,0.88)] light:shadow-[0_10px_30px_rgba(31,67,49,0.055)] sm:-mx-6 sm:px-6">
        <div className="flex min-h-11 sm:min-h-14 items-center gap-1.5 sm:gap-2.5">
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
            className="h-7.5 w-[112px] sm:h-9 sm:w-[150px] lg:hidden"
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

          <div className="hidden min-w-0 flex-1 xl:flex xl:justify-center">
            <CommandSearch onClick={() => setCommandOpen(true)} />
          </div>
          <Button
            type="button"
            variant="ghost"
            className="ml-auto h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl px-0 light:bg-white light:shadow-[0_10px_24px_rgba(33,45,74,0.06)] xl:hidden"
            onClick={() => setCommandOpen(true)}
            aria-label="Search Nexora"
            title="Search Nexora"
          >
            <Search className="h-4 w-4" />
          </Button>

          <div ref={menuRef} className="contents">
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl px-0 light:bg-white light:shadow-[0_10px_24px_rgba(33,45,74,0.06)]"
                aria-label="Open notifications"
                title="Open notifications"
                aria-expanded={openMenu === "notifications"}
                onClick={() => toggleMenu("notifications")}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 sm:-right-1 sm:-top-1 grid h-4.5 min-w-[18px] sm:h-5 sm:min-w-[20px] place-items-center rounded-full border-2 border-white bg-emerald-600 px-0.5 font-mono text-[8px] sm:text-[10px] font-bold text-white">
                  3
                </span>
              </Button>
              {openMenu === "notifications" ? (
                <HeaderMenu title="Notifications" className="right-0">
                  <MenuNotice
                    title="Task 1 Report is under review"
                    detail="Updated 2 hours ago"
                  />
                  <MenuNotice
                    title="Your lab report was submitted"
                    detail="Updated yesterday"
                  />
                  <Link
                    href={`/${role}/notifications`}
                    onClick={() => setOpenMenu(null)}
                    className="nexora-focus mt-1 flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-[var(--brand-emerald)] hover:bg-white/[0.05] light:text-emerald-700 light:hover:bg-emerald-50"
                  >
                    View all notifications
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </HeaderMenu>
              ) : null}
            </div>

            <AccentPicker />
            <ThemeToggle />

            <div className="relative hidden md:block">
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-10 rounded-2xl px-0 light:bg-white light:shadow-[0_10px_24px_rgba(33,45,74,0.06)]"
                aria-label="Open quick access"
                title="Open quick access"
                aria-expanded={openMenu === "quick"}
                onClick={() => toggleMenu("quick")}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
              {openMenu === "quick" ? (
                <HeaderMenu title="Quick access" className="right-0">
                  <HeaderMenuLink
                    href={`/${role}/assignments`}
                    label="Assignments"
                    icon={BookOpenCheck}
                    onClick={() => setOpenMenu(null)}
                  />
                  <HeaderMenuLink
                    href={`/${role}/${role === "admin" ? "lab-management" : "labs"}`}
                    label="Lab classes"
                    icon={FlaskConical}
                    onClick={() => setOpenMenu(null)}
                  />
                  <HeaderMenuLink
                    href={`/${role}/${role === "student" ? "submissions" : role === "teacher" ? "pending-reviews" : "submissions"}`}
                    label={
                      role === "teacher" ? "Pending reviews" : "Submissions"
                    }
                    icon={Upload}
                    onClick={() => setOpenMenu(null)}
                  />
                </HeaderMenu>
              ) : null}
            </div>

            <div className="relative hidden md:block">
              <Button
                type="button"
                variant="secondary"
                className={cn(
                  "h-10 w-10 sm:h-11 sm:w-11 rounded-full p-0 overflow-hidden border border-white/20 shadow-md transition-transform hover:scale-105 active:scale-95",
                  "light:border-emerald-200/80 light:shadow-[0_10px_24px_rgba(20,150,92,0.12)]",
                )}
                aria-label="Open user menu"
                title="Open user menu"
                aria-expanded={openMenu === "profile"}
                onClick={() => toggleMenu("profile")}
              >
                <img
                  src={roleAvatar[role]}
                  alt={`${role} profile avatar`}
                  className="h-full w-full object-cover"
                />
              </Button>
              {openMenu === "profile" ? (
                <HeaderMenu title={workspaceLabel[role]} className="right-0">
                  <div className="flex items-center gap-3 rounded-xl bg-white/[0.045] p-3 light:bg-emerald-50/70">
                    <span className="relative grid h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/20 light:border-emerald-200">
                      <img
                        src={roleAvatar[role]}
                        alt={`${role} profile`}
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white light:text-slate-950">
                        {role === "student"
                          ? "Mopara Pair Ayat"
                          : role === "teacher"
                            ? "Teacher Nexora"
                            : "Admin Nexora"}
                      </p>
                      <p className="truncate text-[11px] text-slate-400 light:text-slate-500">
                        {role} account
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="nexora-focus mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10 light:text-rose-700 light:hover:bg-rose-50"
                    onClick={signOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </HeaderMenu>
              ) : null}
            </div>
          </div>
          <AIButton className="hidden min-[1440px]:inline-flex">Ask Nexora</AIButton>
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

function HeaderMenu({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="menu"
      aria-label={title}
      className={cn(
        "absolute top-[calc(100%+10px)] z-50 w-72 rounded-2xl border border-white/10 bg-[rgba(9,13,11,0.97)] p-2.5 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-xl light:border-slate-200 light:bg-white/98 light:shadow-[0_24px_60px_rgba(31,67,49,0.14)]",
        className,
      )}
    >
      <p className="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 light:text-slate-500">
        {title}
      </p>
      {children}
    </div>
  );
}

function MenuNotice({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex gap-2.5 rounded-xl px-3 py-2.5 hover:bg-white/[0.045] light:hover:bg-emerald-50/65">
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-emerald)]" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-100 light:text-slate-900">
          {title}
        </p>
        <p className="mt-0.5 text-[10px] text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

function HeaderMenuLink({
  href,
  label,
  icon: Icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="nexora-focus flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.055] hover:text-white light:text-slate-700 light:hover:bg-emerald-50 light:hover:text-emerald-950"
    >
      <Icon className="h-4 w-4 text-[var(--brand-emerald)]" />
      {label}
      <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-500" />
    </Link>
  );
}
