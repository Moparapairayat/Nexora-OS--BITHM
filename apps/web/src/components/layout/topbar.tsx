"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpenCheck,
  ChevronDown,
  ChevronRight,
  FlaskConical,
  LogOut,
  Menu,
  Search,
  SlidersHorizontal,
  Sparkles,
  Upload,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CommandPalette } from "@/components/layout/command-palette";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NexoraLogo } from "@/components/brand/nexora-logo";
import {
  AIButton,
  CommandSearch,
  RoleBadge,
} from "@/components/ui/command-primitives";
import type { AppRole } from "@/data/dashboard.mock";
import { apiPost } from "@/services/api-client";
import { cn } from "@/lib/utils";

const workspaceLabel: Record<AppRole, string> = {
  student: "Student Workspace",
  teacher: "Teacher Workspace",
  admin: "Admin Workspace",
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
    void apiPost("/auth/logout", {});
    window.localStorage.removeItem("nexora_token");
    window.sessionStorage.removeItem("nexora_token");
    router.replace("/login");
  }

  return (
    <>
      <header className="nexora-app-topbar sticky top-0 z-30 -mx-2.5 xs:-mx-3.5 sm:-mx-6 px-2.5 xs:px-3.5 sm:px-6 py-2 sm:py-3 border-b border-slate-200/80 dark:border-white/[0.08] bg-[#f8fbf9]/90 dark:bg-[#070b09]/85 backdrop-blur-2xl transition-colors duration-200 rounded-t-[18px] sm:rounded-t-3xl shadow-[0_4px_24px_rgba(20,50,35,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
        <div className="flex min-h-10 sm:min-h-11 items-center justify-between gap-2 sm:gap-3">
          
          {/* Left: Mobile Navigation Trigger / Desktop Clean Breadcrumb */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              className="nexora-focus flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.08] transition lg:hidden"
              aria-label="Open navigation"
              title="Open navigation"
              onClick={onMenu}
            >
              <Menu className="h-5 w-5" />
            </button>

            <NexoraLogo
              size="sm"
              priority
              className="h-7 w-[105px] sm:h-8 sm:w-[130px] lg:hidden"
            />

            <div className="hidden min-w-0 shrink-0 items-center gap-2 lg:flex">
              <RoleBadge role={role} />
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="truncate text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-slate-200 max-w-[220px]">
                {title}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden 2xl:inline">Live</span>
              </span>
            </div>
          </div>

          {/* Center: Command Capsule */}
          <div className="hidden min-w-0 flex-1 lg:flex lg:justify-center px-2">
            <CommandSearch onClick={() => setCommandOpen(true)} />
          </div>

          {/* Right: Harmonious Action Dock */}
          <div ref={menuRef} className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile Search Button */}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-600 shadow-xs transition hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white lg:hidden"
              onClick={() => setCommandOpen(true)}
              aria-label="Search Nexora"
              title="Search Nexora"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                type="button"
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95",
                  openMenu === "notifications"
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-slate-200/80 bg-white/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white",
                )}
                aria-label="Open notifications"
                title="Open notifications"
                aria-expanded={openMenu === "notifications"}
                onClick={() => toggleMenu("notifications")}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 font-mono text-[9px] font-bold text-white shadow-xs">
                  3
                </span>
              </button>

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
                    className="nexora-focus mt-1 flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-[var(--brand-emerald)] hover:bg-slate-100 dark:hover:bg-white/[0.05] light:text-emerald-700 light:hover:bg-emerald-50"
                  >
                    View all notifications
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </HeaderMenu>
              ) : null}
            </div>

            {/* Tactile Theme Switcher */}
            <ThemeToggle />

            {/* Quick Access Utility */}
            <div className="relative hidden md:block">
              <button
                type="button"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95",
                  openMenu === "quick"
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-slate-200/80 bg-white/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white",
                )}
                aria-label="Open quick access"
                title="Open quick access"
                aria-expanded={openMenu === "quick"}
                onClick={() => toggleMenu("quick")}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>

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

            {/* Profile Capsule */}
            <div className="relative hidden md:block">
              <button
                type="button"
                className={cn(
                  "flex items-center gap-2 rounded-full border pl-1 pr-2.5 py-1 text-xs font-semibold shadow-xs transition-all duration-200 active:scale-95 cursor-pointer",
                  openMenu === "profile"
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-slate-200/80 bg-white/80 text-slate-700 hover:bg-slate-100 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]",
                )}
                aria-label="Open user menu"
                title="Open user menu"
                aria-expanded={openMenu === "profile"}
                onClick={() => toggleMenu("profile")}
              >
                <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-emerald-500/30">
                  <img
                    src={roleAvatar[role]}
                    alt={`${role} profile avatar`}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-white dark:border-[#070b09]" />
                </span>
                <div className="hidden lg:flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {role === "student"
                      ? "Mopara Pair Ayat"
                      : role === "teacher"
                        ? "Teacher Nexora"
                        : "Admin Nexora"}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize mt-0.5">{role}</span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
                    openMenu === "profile" && "rotate-180",
                  )}
                />
              </button>

              {openMenu === "profile" ? (
                <HeaderMenu title={workspaceLabel[role]} className="right-0">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-100/70 p-2.5 dark:bg-white/[0.05]">
                    <span className="relative grid h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-200 dark:border-white/20">
                      <img
                        src={roleAvatar[role]}
                        alt={`${role} profile`}
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                        {role === "student"
                          ? "Mopara Pair Ayat"
                          : role === "teacher"
                            ? "Teacher Nexora"
                            : "Admin Nexora"}
                      </p>
                      <p className="truncate text-[10.5px] text-slate-500 dark:text-slate-400">
                        {role} account
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="nexora-focus mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 transition hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
                    onClick={signOut}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </HeaderMenu>
              ) : null}
            </div>

            {/* Signature Ask Nexora AI Button */}
            <AIButton
              onClick={() => setCommandOpen(true)}
              className="hidden min-[1380px]:inline-flex"
            >
              Ask Nexora
            </AIButton>
          </div>
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
        "absolute top-[calc(100%+8px)] z-50 w-72 rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0c120f]/95 dark:shadow-[0_24px_70px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-150",
        className,
      )}
    >
      <p className="px-2.5 pb-1.5 pt-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
        {title}
      </p>
      {children}
    </div>
  );
}

function MenuNotice({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex gap-2.5 rounded-xl px-2.5 py-2 hover:bg-slate-100/80 dark:hover:bg-white/[0.045] transition-colors">
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </p>
        <p className="mt-0.5 text-[10.5px] text-slate-500 dark:text-slate-400">{detail}</p>
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
      className="nexora-focus flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-white/[0.055] hover:text-slate-950 dark:hover:text-white"
    >
      <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      <span>{label}</span>
      <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-400" />
    </Link>
  );
}
