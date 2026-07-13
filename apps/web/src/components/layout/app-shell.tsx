"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { AppRole, NavGroup, NavItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const laptopQuery = "(min-width: 1280px) and (max-width: 1535px)";

function subscribeToLaptopViewport(onChange: () => void) {
  const mediaQuery = window.matchMedia(laptopQuery);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getLaptopViewportSnapshot() {
  return window.matchMedia(laptopQuery).matches;
}

function getServerLaptopViewportSnapshot() {
  return false;
}

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
  const isLaptopViewport = useSyncExternalStore(
    subscribeToLaptopViewport,
    getLaptopViewportSnapshot,
    getServerLaptopViewportSnapshot,
  );
  const effectiveSidebarCollapsed =
    sidebarCollapsed ?? (isLaptopViewport ? true : false);

  function toggleSidebar() {
    const next = !effectiveSidebarCollapsed;
    setSidebarCollapsed(next);
    window.localStorage.setItem(sidebarPreferenceKey, String(next));
  }

  return (
    <div
      data-nexora-role={role}
      style={
        effectiveSidebarCollapsed
          ? { gridTemplateColumns: "92px minmax(0, 1fr)" }
          : undefined
      }
      className={`min-h-dvh px-3 py-3 transition-[grid-template-columns] duration-300 light:bg-[#edf3ef]/55 lg:grid lg:gap-4 ${
        effectiveSidebarCollapsed
          ? "lg:grid-cols-[92px_minmax(0,1fr)]"
          : "lg:grid-cols-[248px_minmax(0,1fr)] 2xl:grid-cols-[304px_minmax(0,1fr)]"
      }`}
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
        className="min-w-0 rounded-[24px] px-2 pb-8 outline-none sm:px-4 lg:px-6 light:rounded-[28px] light:border light:border-white/70 light:bg-[#f8fbf9]/72 light:shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_14px_40px_rgba(31,67,49,0.04)]"
      >
        <Topbar
          role={role}
          title={title}
          commandOpen={commandOpen}
          setCommandOpen={setCommandOpen}
          onMenu={() => setSidebarOpen(true)}
        />
        <div className={cn("nexora-container pt-5", contentClassName)}>
          {children}
        </div>
      </main>
    </div>
  );
}
