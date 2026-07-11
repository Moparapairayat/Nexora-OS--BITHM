"use client";

import { useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { AppRole, NavGroup, NavItem } from "@/lib/mock-data";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <div
      data-nexora-role={role}
      className={`min-h-screen px-3 py-3 transition-[grid-template-columns] duration-300 light:bg-[#f7faf6]/70 lg:grid lg:gap-4 ${
        sidebarCollapsed
          ? "lg:grid-cols-[92px_minmax(0,1fr)]"
          : "lg:grid-cols-[304px_minmax(0,1fr)]"
      }`}
    >
      <Sidebar
        role={role}
        nav={nav}
        navGroups={navGroups}
        accountEmail={accountEmail}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
      />
      <main className="min-w-0 rounded-[24px] px-2 pb-8 sm:px-4 lg:px-6 light:rounded-[28px] light:bg-white/45 light:shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
        <Topbar
          role={role}
          title={title}
          commandOpen={commandOpen}
          setCommandOpen={setCommandOpen}
          onMenu={() => setSidebarOpen(true)}
        />
        <div className={cn("mx-auto max-w-[1500px] pt-5", contentClassName)}>
          {children}
        </div>
      </main>
    </div>
  );
}
