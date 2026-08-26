"use client";

import { useEffect, useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { AppRole, NavGroup, NavItem } from "@/data/dashboard.mock";
import { cn } from "@/lib/utils";

export function AppShell({
  role,
  title,
  nav,
  navGroups,
  accountEmail,
  contentClassName,
  children,
}: {
  role: AppRole;
  title: string;
  subtitle: string;
  nav: NavItem[];
  navGroups?: NavGroup[];
  accountEmail: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarPreferenceKey = `nexora-sidebar-collapsed-${role}`;
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean | null>(
    null,
  );
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem(sidebarPreferenceKey);
      if (stored === "true" || stored === "false") {
        setSidebarCollapsed(stored === "true");
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [sidebarPreferenceKey]);
  const effectiveSidebarCollapsed = sidebarCollapsed ?? false;

  function toggleSidebar() {
    const next = !effectiveSidebarCollapsed;
    setSidebarCollapsed(next);
    window.localStorage.setItem(sidebarPreferenceKey, String(next));
  }

  return (
    <div
      data-nexora-role={role}
      className={cn(
        "nexora-app-frame min-h-dvh transition-all duration-300 light:bg-[#edf3ef]/55 flex flex-col lg:grid",
        effectiveSidebarCollapsed
          ? "lg:grid-cols-[78px_minmax(0,1fr)]"
          : "lg:grid-cols-[var(--nexora-sidebar-width)_minmax(0,1fr)]",
      )}
    >
      <a
        href="#nexora-main-content"
        className="nexora-focus fixed left-4 top-4 z-[100] -translate-y-24 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-xl transition focus:translate-y-0"
      >
        Skip to main content
      </a>
      <Sidebar
        role={role}
        nav={nav}
        navGroups={navGroups}
        accountEmail={accountEmail}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={effectiveSidebarCollapsed}
        onToggleCollapsed={toggleSidebar}
      />
      <main
        id="nexora-main-content"
        tabIndex={-1}
        className="nexora-app-main min-w-0 rounded-[18px] sm:rounded-[24px] px-2.5 xs:px-3.5 pb-8 outline-none sm:px-6 light:rounded-[28px] light:border light:border-white/70 light:bg-[#f8fbf9]/72 light:shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_14px_40px_rgba(31,67,49,0.04)]"
      >
        <Topbar
          role={role}
          title={title}
          commandOpen={commandOpen}
          setCommandOpen={setCommandOpen}
          onMenu={() => setSidebarOpen(true)}
        />
        <div className={cn("nexora-container pt-3 xs:pt-4 sm:pt-5", contentClassName)}>
          {children}
        </div>
      </main>
    </div>
  );
}
