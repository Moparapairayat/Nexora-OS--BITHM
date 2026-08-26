"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { iconMap } from "@/components/layout/icon-map";
import { NexoraIcon, NexoraLogo } from "@/components/brand/nexora-logo";
import { RoleBadge } from "@/components/ui/command-primitives";
import { apiPost } from "@/services/api-client";
import { cn } from "@/lib/utils";
import type { AppRole, NavGroup, NavItem } from "@/data/dashboard.mock";

const collapsedRoleClass: Record<AppRole, string> = {
  student:
    "border-[color:var(--border-lime)] bg-[rgba(217,255,87,0.18)] shadow-[0_0_20px_rgba(217,255,87,0.18)]",
  teacher:
    "border-[rgba(255,180,90,0.34)] bg-[rgba(138,95,61,0.2)] shadow-[0_0_20px_rgba(255,180,90,0.16)]",
  admin:
    "border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.16)] shadow-[0_0_20px_rgba(50,245,154,0.18)]",
};

const roleProfileLabel: Record<AppRole, string> = {
  student: "Mopara Pair Ayat",
  teacher: "Teacher Nexora",
  admin: "Admin Nexora",
};

const roleIdMap: Record<AppRole, string> = {
  student: "NX-2026-8821",
  teacher: "NX-FAC-4019",
  admin: "NX-ADM-001",
};

const roleAvatar: Record<AppRole, string> = {
  student: "/landing/team/emre_avatar.png",
  teacher: "/landing/team/emre_avatar.png",
  admin: "/landing/team/emre_avatar.png",
};

function normalizeHref(href: string) {
  return href.endsWith("/") && href !== "/" ? href.slice(0, -1) : href;
}

function isItemActive(item: NavItem, pathname: string) {
  const itemHref = normalizeHref(item.href);
  const currentPath = normalizeHref(pathname);

  return currentPath === itemHref || currentPath.startsWith(`${itemHref}/`);
}

function fallbackNavGroups(nav: NavItem[]): NavGroup[] {
  return [
    {
      id: "workspace",
      label: "Workspace",
      icon: "LayoutDashboard",
      items: nav,
    },
  ];
}

function badge({
  value,
  compact = false,
  active = false,
}: {
  value?: string;
  compact?: boolean;
  active?: boolean;
}) {
  if (!value) {
    return null;
  }

  return (
    <span
      className={cn(
        "rounded-md font-mono font-bold transition-all shrink-0",
        active
          ? "bg-white/20 !text-white"
          : "bg-slate-900 !text-white dark:bg-white/10 dark:!text-slate-300",
        compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
      )}
    >
      {value}
    </span>
  );
}

export function Sidebar({
  role,
  nav,
  navGroups,
  accountEmail,
  open,
  onClose,
  collapsed,
  onToggleCollapsed,
}: {
  role: AppRole;
  nav: NavItem[];
  navGroups?: NavGroup[];
  accountEmail: string;
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const groups = useMemo(
    () =>
      navGroups && navGroups.length > 0 ? navGroups : fallbackNavGroups(nav),
    [nav, navGroups],
  );
  const activeGroupId = groups.find((group) =>
    group.items.some((item) => isItemActive(item, pathname)),
  )?.id;
  const initialExpandedId = activeGroupId ?? groups[0]?.id;
  const storageKey = `nexora-sidebar-expanded-${role}`;
  const defaultExpandedIds = useMemo(
    () => (initialExpandedId ? [initialExpandedId] : []),
    [initialExpandedId],
  );
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpandedIds);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as string[];
          if (Array.isArray(parsed)) setExpandedIds(parsed);
        }
      } catch {
        // Non-critical preference persistence.
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [storageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(expandedIds));
    } catch {
      // Non-critical preference persistence.
    }
  }, [expandedIds, storageKey]);

  useEffect(() => {
    onClose();
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function toggleGroup(groupId: string) {
    setExpandedIds((current) =>
      current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId],
    );
  }

  function signOut() {
    void apiPost("/auth/logout", {});
    window.localStorage.removeItem("nexora_token");
    window.sessionStorage.removeItem("nexora_token");
    onClose();
    router.replace("/login");
  }

  return (
    <>
      <button
        type="button"
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-label="Close navigation"
        onClick={onClose}
      />
      <aside
        style={collapsed ? { width: 78 } : undefined}
        className={cn(
          "command-surface-strong nexora-sidebar fixed inset-y-3 left-3 z-50 flex w-[275px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[22px] sm:rounded-[24px] shadow-2xl transition-[transform,width] duration-300 ease-out light:rounded-[26px] light:border-slate-200/80 lg:sticky lg:left-auto lg:z-30 lg:top-3 lg:h-[calc(100vh-24px)] lg:w-[var(--nexora-sidebar-width)]",
          collapsed && "lg:w-[78px] lg:overflow-visible",
          open ? "translate-x-0" : "-translate-x-[115%] lg:translate-x-0",
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 rounded-t-[22px] sm:rounded-t-[24px] bg-[radial-gradient(circle_at_50%_0%,rgba(50,245,154,0.18),transparent_60%),radial-gradient(circle_at_16%_8%,rgba(138,95,61,0.18),transparent_48%)] light:rounded-t-[26px] light:bg-[radial-gradient(circle_at_18%_0%,rgba(10,169,91,0.13),transparent_56%),radial-gradient(circle_at_78%_4%,rgba(217,255,87,0.16),transparent_50%)]" />
        {/* Expanded Header View */}
        <div
          className={cn(
            "relative flex items-center justify-between border-b border-white/10 px-3 py-2.5 light:border-slate-200/70 shrink-0",
            collapsed && "lg:hidden",
          )}
        >
          <Link
            href="/"
            className="nexora-focus flex min-w-0 items-center gap-2 rounded-md"
          >
            <div className="min-w-0">
              <NexoraLogo size="sm" priority className="h-6.5 w-[116px]" />
              <div className="sidebar-muted mt-0.5 truncate text-[10px] text-slate-400 light:text-slate-500">
                Academic Intelligence Platform
              </div>
            </div>
          </Link>
          <button
            type="button"
            className="nexora-focus hidden rounded-xl border border-white/10 bg-white/[0.05] p-1.5 text-slate-300 transition hover:bg-white/[0.09] light:border-slate-200 light:bg-white light:text-slate-500 light:shadow-[0_8px_18px_rgba(33,45,74,0.06)] light:hover:bg-emerald-50 lg:block cursor-pointer"
            onClick={onToggleCollapsed}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="nexora-focus rounded-xl p-1.5 text-slate-300 light:text-slate-600 lg:hidden cursor-pointer"
            onClick={onClose}
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Collapsed Header View - Centered Favicon & Expand Toggle */}
        {collapsed ? (
          <div className="relative hidden lg:flex flex-col items-center justify-center gap-1.5 border-b border-white/10 py-2 px-1 light:border-slate-200/70 shrink-0">
            <Link
              href="/"
              className="nexora-focus grid place-items-center rounded-xl p-0.5 transition-transform hover:scale-105"
              title="Nexora OS Home"
            >
              <NexoraIcon size={30} priority className="shadow-xs" />
            </Link>
            <button
              type="button"
              className="nexora-focus grid h-6 w-6 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-emerald-500/20 hover:text-emerald-300 light:border-slate-200 light:bg-white light:text-slate-600 light:shadow-xs light:hover:bg-emerald-50 light:hover:text-emerald-700 cursor-pointer"
              onClick={onToggleCollapsed}
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}

        {/* Next-Gen Natural Floating Profile Island - Right-Aligned Avatar Style */}
        <div
          className={cn("relative px-2 py-1.5 shrink-0", collapsed && "lg:px-1.5 lg:py-2")}
        >
          <div
            className={cn(
              "group/profile relative flex items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white/95 to-slate-50/80 p-2.5 shadow-xs transition-all duration-200 hover:border-emerald-400/40 hover:shadow-md dark:border-white/[0.08] dark:bg-gradient-to-b dark:from-white/[0.06] dark:to-white/[0.02] dark:hover:border-emerald-400/30",
              collapsed && "lg:hidden",
            )}
          >
            {/* Left Side: 3-Tier Identity Information */}
            <div className="min-w-0 flex-1 space-y-0.5">
              {/* Line 1: Full Name */}
              <p className="truncate text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">
                {roleProfileLabel[role]}
              </p>

              {/* Line 2: Email */}
              <p className="truncate text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                {accountEmail}
              </p>

              {/* Line 3: Role Badge + Student ID */}
              <div className="flex items-center gap-1 pt-0.5">
                <span className="inline-flex shrink-0 items-center rounded-md bg-emerald-50 px-1.5 py-0.2 font-mono text-[8.5px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
                  {role}
                </span>
                <span className="inline-flex shrink-0 items-center rounded-md bg-slate-100/90 px-1.5 py-0.2 font-mono text-[8.5px] font-semibold text-slate-600 border border-slate-200/60 dark:bg-white/[0.05] dark:text-slate-400 dark:border-white/10">
                  ID: {roleIdMap[role]}
                </span>
              </div>
            </div>

            {/* Right Side: Avatar with Radiant Gradient Ring & Live Corner Pulse */}
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 shadow-xs transition-transform duration-200 group-hover/profile:scale-105">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white dark:border-slate-900 bg-white">
                  <img
                    src={roleAvatar[role]}
                    alt={`${role} profile`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              {/* Live Online Pulse Dot */}
              <span
                className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-white ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-black shadow-xs"
                title="Online"
              >
                <span className="h-2 w-2 rounded-full bg-[#009B5A] shadow-[0_0_6px_rgba(0,155,90,0.6)] animate-pulse" />
              </span>
            </div>
          </div>

          {/* Collapsed Role Indicator */}
          <div
            className={cn(
              "hidden",
              collapsed && "lg:grid lg:place-items-center",
            )}
          >
            <div
              className="relative group/avatar cursor-pointer"
              title={`${roleProfileLabel[role]} (${roleIdMap[role]})`}
            >
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 shadow-xs">
                <div className="h-8 w-8 overflow-hidden rounded-full border border-white dark:border-slate-900">
                  <img
                    src={roleAvatar[role]}
                    alt={`${role} profile`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-black">
                <span className="h-1.5 w-1.5 rounded-full bg-[#009B5A] animate-pulse" />
              </span>
            </div>
          </div>
        </div>

        <nav
          className={cn(
            "sidebar-scroll relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-2.5 pb-2",
            collapsed ? "lg:overflow-visible" : "overflow-y-auto",
          )}
        >
          <div
            className={cn(
              "grid gap-1",
              collapsed && "lg:place-items-center lg:gap-2.5",
            )}
          >
            {groups.map((group) => {
              const isDirectLink = group.items.length === 0 && Boolean(group.href);

              if (isDirectLink && group.href) {
                const active =
                  normalizeHref(pathname) === normalizeHref(group.href) ||
                  normalizeHref(pathname).startsWith(`${normalizeHref(group.href)}/`);

                return (
                  <div
                    key={group.id}
                    className={cn("relative", collapsed && "lg:group/flyout")}
                  >
                    <SidebarChildLink
                      item={{
                        label: group.label,
                        href: group.href,
                        icon: group.icon,
                        badge: group.badge,
                      }}
                      active={active}
                      onClick={onClose}
                      collapsed={collapsed}
                    />
                    {collapsed ? (
                      <div className="pointer-events-none absolute left-[calc(100%+12px)] top-0 z-50 hidden rounded-xl border border-slate-200/80 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 opacity-0 shadow-xl backdrop-blur-xl transition dark:border-white/10 dark:bg-[#0B101B]/95 dark:text-white group-hover/flyout:pointer-events-auto group-hover/flyout:block group-hover/flyout:opacity-100 group-focus-within/flyout:pointer-events-auto group-focus-within/flyout:block group-focus-within/flyout:opacity-100 animate-in fade-in zoom-in-95 duration-150">
                        {group.label}
                      </div>
                    ) : null}
                  </div>
                );
              }

              const Icon = iconMap[group.icon] ?? iconMap.LayoutDashboard;
              const isActiveGroup = group.items.some((item) =>
                isItemActive(item, pathname),
              );
              const isExpanded =
                expandedIds.includes(group.id) ||
                (isActiveGroup && !expandedIds.includes(group.id));

              return (
                <div
                  key={group.id}
                  className={cn("relative", collapsed && "lg:group/flyout")}
                >
                  <button
                    type="button"
                    className={cn(
                      "nexora-focus group/parent relative flex min-h-[36px] w-full items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left text-[13px] font-semibold transition-all select-none",
                      isActiveGroup && !isExpanded
                        ? "bg-slate-100/80 text-slate-900 dark:bg-white/[0.08] dark:text-white"
                        : "text-slate-700 hover:bg-slate-100/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.04] dark:hover:text-white",
                      collapsed && "lg:h-11 lg:w-11 lg:justify-center lg:px-0",
                    )}
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isExpanded}
                    title={collapsed ? group.label : undefined}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActiveGroup
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-500 group-hover/parent:text-slate-900 dark:text-slate-400 dark:group-hover/parent:text-white",
                        )}
                        aria-hidden="true"
                      />
                      <span className={cn("truncate", collapsed && "lg:hidden")}>
                        {group.label}
                      </span>
                    </div>
                    <div className={cn("flex items-center gap-1.5", collapsed && "lg:hidden")}>
                      {badge({ value: group.badge, compact: true })}
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200",
                          isExpanded && "rotate-180 text-slate-700 dark:text-slate-200",
                        )}
                        aria-hidden="true"
                      />
                    </div>
                  </button>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                      isExpanded
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                      collapsed && "lg:hidden",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="my-0.5 ml-3 grid gap-0.5 border-l border-slate-200/80 pl-2 dark:border-white/10">
                        {group.items.map((item) => {
                          const active = isItemActive(item, pathname);

                          return (
                            <SidebarChildLink
                              key={item.href}
                              item={item}
                              active={active}
                              onClick={onClose}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {collapsed ? (
                    <SidebarFlyout
                      group={group}
                      pathname={pathname}
                      onClose={onClose}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </nav>

        <div
          className={cn(
            "relative border-t border-white/10 p-2.5 light:border-slate-200/70 shrink-0",
            collapsed && "lg:grid lg:place-items-center",
          )}
        >
          <button
            type="button"
            className={cn(
              "nexora-focus flex min-h-[36px] w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-[13px] font-medium text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400",
              collapsed && "lg:h-11 lg:w-11 lg:justify-center lg:px-0",
            )}
            onClick={signOut}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className={cn(collapsed && "lg:hidden")}>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarChildLink({
  item,
  active,
  onClick,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  collapsed?: boolean;
}) {
  const Icon = iconMap[item.icon] ?? null;

  return (
    <Link
      href={item.href}
      className={cn(
        "nexora-focus group/child relative flex min-h-[33px] items-center justify-between gap-2 rounded-xl px-2 py-1 text-[12.5px] font-medium transition-all select-none",
        active
          ? "bg-[#044b3b] border border-emerald-400/40 !text-white font-bold shadow-[0_4px_12px_rgba(4,75,59,0.3)]"
          : "text-slate-700 hover:bg-slate-100/90 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white",
        collapsed && "lg:h-11 lg:w-11 lg:justify-center lg:px-0",
      )}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
    >
      <div className={cn("flex min-w-0 items-center gap-2", collapsed && "lg:justify-center")}>
        {Icon ? (
          <Icon
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-colors",
              active
                ? "!text-white"
                : "text-slate-400 group-hover/child:text-slate-900 dark:text-slate-500 dark:group-hover/child:text-white",
            )}
            aria-hidden="true"
          />
        ) : (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full shrink-0 transition-all",
              active ? "bg-white" : "bg-slate-400 dark:bg-slate-600",
            )}
          />
        )}
        <span className={cn("truncate", active && "!text-white font-bold", collapsed && "lg:hidden")}>
          {item.label}
        </span>
      </div>
      <span className={cn(collapsed && "lg:hidden")}>
        {badge({ value: item.badge, compact: true, active })}
      </span>
    </Link>
  );
}

function SidebarFlyout({
  group,
  pathname,
  onClose,
}: {
  group: NavGroup;
  pathname: string;
  onClose: () => void;
}) {
  return (
    <div className="pointer-events-none absolute left-[calc(100%+12px)] top-0 z-50 hidden w-64 max-h-[calc(100vh-32px)] overflow-y-auto scrollbar-thin rounded-2xl border border-slate-200/80 bg-white/95 p-2.5 opacity-0 shadow-2xl backdrop-blur-xl transition dark:border-white/10 dark:bg-[#0B101B]/95 group-hover/flyout:pointer-events-auto group-hover/flyout:block group-hover/flyout:opacity-100 group-focus-within/flyout:pointer-events-auto group-focus-within/flyout:block group-focus-within/flyout:opacity-100 animate-in fade-in zoom-in-95 duration-150">
      <div className="mb-1.5 flex items-center justify-between gap-3 px-2 py-1">
        <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
          {group.label}
        </p>
        {group.badge ? (
          <span className="rounded-md bg-slate-900 text-white dark:bg-white/10 dark:text-slate-300 px-1.5 py-0.5 font-mono text-[10px] font-bold">
            {group.badge}
          </span>
        ) : null}
      </div>
      <div className="grid gap-1">
        {group.items.map((item) => (
          <SidebarChildLink
            key={item.href}
            item={item}
            active={isItemActive(item, pathname)}
            onClick={onClose}
          />
        ))}
      </div>
    </div>
  );
}
