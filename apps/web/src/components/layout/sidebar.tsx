"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { iconMap } from "@/components/layout/icon-map";
import { NexoraLogo } from "@/components/brand/nexora-logo";
import { RoleBadge } from "@/components/ui/command-primitives";
import { cn } from "@/lib/utils";
import type { AppRole, NavGroup, NavItem } from "@/lib/mock-data";

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
}: {
  value?: string;
  compact?: boolean;
}) {
  if (!value) {
    return null;
  }

  return (
    <span
      className={cn(
        "rounded-full border border-[color:var(--border-lime)] bg-[rgba(217,255,87,0.12)] font-mono font-semibold text-[var(--brand-lime)] shadow-[0_0_16px_rgba(217,255,87,0.1)]",
        compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
      )}
    >
      {value}
    </span>
  );
}

function childLinkClass(active: boolean) {
  return cn(
    "nexora-focus group/child relative grid min-h-9 grid-cols-[14px_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border px-2.5 py-2 text-xs transition light:text-[13px]",
    active
      ? "border-[color:var(--border-lime)] bg-[rgba(217,255,87,0.105)] text-white shadow-[0_0_26px_rgba(217,255,87,0.1)] light:border-emerald-100 light:bg-emerald-50 light:text-emerald-950 light:shadow-[inset_3px_0_0_#05a95b,0_10px_22px_rgba(20,150,92,0.08)]"
      : "border-transparent text-slate-400 hover:border-[color:var(--border-emerald)] hover:bg-white/[0.055] hover:text-white light:text-slate-600 light:hover:border-emerald-100 light:hover:bg-emerald-50/70 light:hover:text-emerald-950",
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
    // Sync with localStorage after hydration
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed)) {
          setExpandedIds(parsed);
          return;
        }
      }
    } catch {
      // Non-critical preference persistence.
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(expandedIds));
    } catch {
      // Non-critical preference persistence.
    }
  }, [expandedIds, storageKey]);

  function toggleGroup(groupId: string) {
    setExpandedIds((current) =>
      current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId],
    );
  }

  return (
    <>
      <button
        type="button"
        className={cn(
          "fixed inset-0 z-30 bg-black/60 transition lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-label="Close navigation"
        onClick={onClose}
      />
      <aside
        style={collapsed ? { width: 92 } : undefined}
        className={cn(
          "command-surface-strong nexora-sidebar fixed inset-y-3 left-3 z-40 flex w-[304px] flex-col overflow-visible rounded-[24px] transition-[transform,width] duration-300 light:rounded-[28px] light:border-slate-200/80 lg:sticky lg:top-3 lg:z-auto lg:h-[calc(100dvh-24px)] lg:w-[248px] lg:translate-x-0 2xl:w-[304px]",
          collapsed && "lg:w-[92px] 2xl:w-[92px]",
          open ? "translate-x-0" : "-translate-x-[110%]",
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 rounded-t-[24px] bg-[radial-gradient(circle_at_50%_0%,rgba(50,245,154,0.18),transparent_60%),radial-gradient(circle_at_16%_8%,rgba(138,95,61,0.18),transparent_48%)] light:rounded-t-[28px] light:bg-[radial-gradient(circle_at_18%_0%,rgba(10,169,91,0.13),transparent_56%),radial-gradient(circle_at_78%_4%,rgba(217,255,87,0.16),transparent_50%)]" />
        <div className="relative flex items-center justify-between border-b border-white/10 px-4 py-4 light:border-slate-200/70">
          <Link
            href="/"
            className={cn(
              "nexora-focus flex min-w-0 items-center rounded-md",
              collapsed ? "lg:justify-center" : "gap-3",
            )}
          >
            <div className={cn("min-w-0", collapsed && "lg:hidden")}>
              <NexoraLogo size="sm" priority className="h-10 w-[158px]" />
              <div className="sidebar-muted mt-0.5 truncate text-xs text-slate-400 light:text-slate-500">
                Academic Intelligence Platform
              </div>
            </div>
            <NexoraLogo
              size="sm"
              className={cn(
                "hidden",
                collapsed && "lg:inline-flex lg:h-9 lg:w-14",
              )}
              imageClassName="object-left"
            />
          </Link>
          <button
            type="button"
            className="nexora-focus hidden rounded-xl border border-white/10 bg-white/[0.05] p-2 text-slate-300 transition hover:bg-white/[0.09] light:border-slate-200 light:bg-white light:text-slate-500 light:shadow-[0_8px_18px_rgba(33,45,74,0.06)] light:hover:bg-emerald-50 lg:block"
            onClick={onToggleCollapsed}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            className="nexora-focus rounded-xl p-2 text-slate-300 light:text-slate-600 lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={cn("relative px-4 py-4", collapsed && "lg:px-3")}>
          <div
            className={cn(
              "rounded-[22px] border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] light:border-slate-200/80 light:bg-white light:shadow-[0_16px_34px_rgba(33,45,74,0.07)]",
              collapsed && "lg:hidden",
            )}
          >
            <RoleBadge role={role} />
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(145deg,#d9ff57,#32f59a)] font-semibold text-[#07100b] light:bg-[linear-gradient(145deg,#00a65e,#35dc8b)] light:text-white">
                {role.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="sidebar-strong truncate text-sm font-semibold text-white light:text-slate-950">
                  {roleProfileLabel[role]}
                </p>
                <p className="sidebar-muted truncate text-xs text-slate-400 light:text-slate-500">
                  {accountEmail}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(50,245,154,0.1)] px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-emerald)] light:bg-emerald-50 light:text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-emerald)]" />
                Online
              </span>
              <span className="rounded-full bg-[rgba(217,255,87,0.1)] px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-lime)] light:bg-lime-50 light:text-emerald-700">
                {role}
              </span>
            </div>
          </div>
          <div
            className={cn(
              "hidden",
              collapsed && "lg:grid lg:place-items-center",
            )}
          >
            <span
              className={cn(
                "h-3 w-3 rounded-full border",
                collapsedRoleClass[role],
              )}
              aria-label={`${role} workspace`}
              title={`${role} workspace`}
            />
          </div>
        </div>

        <nav
          className={cn(
            "scrollbar-thin relative min-h-0 flex-1 px-3 pb-4",
            collapsed
              ? "overflow-y-auto lg:overflow-visible"
              : "overflow-y-auto",
          )}
        >
          <div
            className={cn(
              "grid gap-2",
              collapsed && "lg:place-items-center lg:gap-3",
            )}
          >
            {groups.map((group) => {
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
                      "nexora-focus group/parent flex min-h-11 w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm transition light:min-h-10",
                      isActiveGroup
                        ? "border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.1)] text-white shadow-[0_0_30px_rgba(50,245,154,0.1)] light:border-emerald-100 light:bg-emerald-50 light:text-emerald-950 light:shadow-[0_10px_24px_rgba(20,150,92,0.08)]"
                        : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.055] hover:text-white light:text-slate-600 light:hover:border-emerald-100 light:hover:bg-emerald-50/65 light:hover:text-emerald-950",
                      collapsed && "lg:h-12 lg:w-12 lg:justify-center lg:px-0",
                    )}
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isExpanded}
                    title={collapsed ? group.label : undefined}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition",
                        isActiveGroup
                          ? "text-[var(--brand-lime)] light:text-emerald-600"
                          : "text-slate-500 group-hover/parent:text-[var(--brand-emerald)] light:text-slate-500 light:group-hover/parent:text-emerald-600",
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate font-medium",
                        collapsed && "lg:hidden",
                      )}
                    >
                      {group.label}
                    </span>
                    <span className={cn(collapsed && "lg:hidden")}>
                      {badge({ value: group.badge, compact: true })}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-slate-500 transition light:text-slate-400",
                        isExpanded &&
                          "rotate-180 text-[var(--brand-lime)] light:text-emerald-600",
                        collapsed && "lg:hidden",
                      )}
                      aria-hidden="true"
                    />
                  </button>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                      isExpanded
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                      collapsed && "lg:hidden",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-5 mt-1 grid gap-1 border-l border-white/10 pl-3 light:border-slate-200/80">
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
      </aside>
    </>
  );
}

function SidebarChildLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link href={item.href} className={childLinkClass(active)} onClick={onClick}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full transition",
          active
            ? "bg-[var(--brand-lime)] shadow-[0_0_12px_rgba(217,255,87,0.7)] light:bg-emerald-600 light:shadow-[0_0_12px_rgba(5,169,91,0.32)]"
            : "bg-slate-600 group-hover/child:bg-[var(--brand-emerald)] light:bg-slate-300 light:group-hover/child:bg-emerald-500",
        )}
        aria-hidden="true"
      />
      <span className="min-w-0 truncate">{item.label}</span>
      {badge({ value: item.badge, compact: true })}
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
    <div className="pointer-events-none absolute left-[calc(100%+12px)] top-0 z-50 hidden w-72 rounded-2xl border border-[color:var(--border-emerald)] bg-[rgba(9,13,11,0.96)] p-3 opacity-0 shadow-[0_24px_80px_rgba(0,0,0,0.55),0_0_42px_rgba(50,245,154,0.12)] backdrop-blur-xl transition light:border-slate-200 light:bg-white/96 light:shadow-[0_24px_70px_rgba(33,45,74,0.16)] group-hover/flyout:pointer-events-auto group-hover/flyout:block group-hover/flyout:opacity-100 group-focus-within/flyout:pointer-events-auto group-focus-within/flyout:block group-focus-within/flyout:opacity-100">
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-lime)] light:text-emerald-700">
          {group.label}
        </p>
        {badge({ value: group.badge, compact: true })}
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
