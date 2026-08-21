"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { AcademicShieldPage } from "@/features/academic-shield/academic-shield-page";
import { AdminUsersPage } from "@/features/admin/admin-users-page";
import { AppShell } from "@/components/layout/app-shell";
import { CodeLabPage } from "@/features/code-lab/code-lab-page";
import {
  ComingSoonPage,
  type ComingSoonSection,
} from "@/features/coming-soon/coming-soon-page";
import { DatabaseVisualizerPage } from "@/features/database-visualizer/database-visualizer-page";
import { ModuleExperiencePage } from "@/features/dashboard/module-experience-page";
import { DashboardCard, PageHeader } from "@/components/ui/command-primitives";
import { DataHubPage } from "@/features/data-hub/data-hub-page";
import { OperationsPage } from "@/features/operations/operations-page";
import { SkillDnaPage } from "@/features/skill-dna/skill-dna-page";
import { LearningRoadmapPage } from "@/features/learning-roadmap/learning-roadmap-page";
import { PortfolioBuilderPage } from "@/features/portfolio/portfolio-builder-page";
import {
  isRoleRouteAllowed,
  roleDashboards,
  type AppRole,
} from "@/data/dashboard.mock";

export function ModulePage({ role, slug }: { role: AppRole; slug: string[] }) {
  const requestedHref = `/${role}/${slug.join("/")}`;

  if (!isRoleRouteAllowed(role, requestedHref)) {
    return <RestrictedModulePage role={role} requestedHref={requestedHref} />;
  }

  const comingSoonSection = resolveComingSoonSection(slug[0]);
  const academicShieldMode = resolveAcademicShieldMode(role, slug);
  const operations = role === "admin" && slug[0] === "production-ops";
  const dataHub = role === "admin" && slug[0] === "data-hub";
  const adminUsers = role === "admin" && slug[0] === "users";
  const isCodeLab =
    (role === "student" || role === "teacher") && slug[0] === "code-lab";
  const isDatabaseVisualizer =
    (role === "student" || role === "teacher") &&
    slug[0] === "database-visualizer";
  const isSkillDna =
    (role === "student" || role === "teacher") && slug[0] === "skill-dna";
  const isLearningRoadmap =
    (role === "student" || role === "teacher") && slug[0] === "learning-roadmap";
  const isPortfolio =
    (role === "student" || role === "teacher") && slug[0] === "portfolio";

  if (isSkillDna) {
    return <SkillDnaPage role={role} />;
  }

  if (isLearningRoadmap) {
    return <LearningRoadmapPage role={role} />;
  }

  if (isPortfolio) {
    return <PortfolioBuilderPage role={role} />;
  }

  if (comingSoonSection) {
    return (
      <ComingSoonPage
        role={role}
        section={comingSoonSection}
        requestedHref={requestedHref}
      />
    );
  }

  if (isCodeLab) {
    return <CodeLabPage role={role} />;
  }

  if (isDatabaseVisualizer) {
    return <DatabaseVisualizerPage role={role} />;
  }

  if (adminUsers) {
    return <AdminUsersPage role={role} />;
  }

  if (operations) {
    return <OperationsPage role={role} />;
  }

  if (dataHub) {
    return <DataHubPage role={role} />;
  }

  if (academicShieldMode) {
    return (
      <AcademicShieldPage
        role={role}
        mode={academicShieldMode}
        feature={slug[0]}
      />
    );
  }

  return <ModuleExperiencePage role={role} slug={slug} />;
}

function RestrictedModulePage({
  role,
  requestedHref,
}: {
  role: AppRole;
  requestedHref: string;
}) {
  const data = roleDashboards[role];

  return (
    <AppShell
      role={role}
      title="Page not available"
      subtitle="Your account does not have access to this page."
      nav={data.nav}
      navGroups={data.navGroups}
      accountEmail={data.accountEmail}
    >
      <div className="grid gap-5">
        <PageHeader
          eyebrow="Role protected"
          title="You do not have access to this page"
          subtitle="Use the sidebar to open a page available to your account."
          tone="amber"
          action={
            <Link
              href={`/${role}/dashboard`}
              className="nexora-focus inline-flex h-11 items-center justify-center rounded-xl border border-[color:var(--border-lime)] bg-[linear-gradient(135deg,var(--brand-lime),var(--brand-emerald))] px-4 text-sm font-semibold text-[#07100b] shadow-[0_0_35px_rgba(50,245,154,0.2)] transition hover:translate-y-[-1px]"
            >
              Back to dashboard
            </Link>
          }
        />
        <DashboardCard
          title="Requested route"
          detail={requestedHref}
          icon={LockKeyhole}
          tone="amber"
        >
          <p className="text-sm leading-6 text-slate-400 light:text-slate-600">
            Access is based on your account role. If you think you should be
            able to open this page, contact an administrator.
          </p>
        </DashboardCard>
      </div>
    </AppShell>
  );
}

function resolveComingSoonSection(key: string): ComingSoonSection | null {
  const sections: Array<[ComingSoonSection, Set<string>]> = [
    [
      "Academic Work",
      new Set([
        "assignments",
        "labs",
        "lab-management",
        "lab-reports",
        "submissions",
      ]),
    ],
    [
      "AI Workspace",
      new Set([
        "project-architect",
        "code-doctor",
        "ai-feedback-engine",
        "ai-brief-analyzer",
      ]),
    ],
    [
      "ML & Data",
      new Set([
        "dataset-manager",
        "ml-studio",
        "automl-assistant",
        "ml-reports",
      ]),
    ],
    [
      "Content Studio",
      new Set([
        "slide-maker",
        "documentation",
        "research-assistant",
        "ocr-document-reader",
        "readme-generator",
        "api-docs",
        "user-manual",
        "testing-docs",
      ]),
    ],
    [
      "Feedback",
      new Set([
        "feedback",
        "feedback-templates",
        "fix-requests",
        "teacher-feedback",
        "pending-reviews",
      ]),
    ],
    ["Activity & Notifications", new Set(["activity", "notifications"])],
    ["AcademicShield", new Set(["academic-rewrite"])],
    [
      "Developer Tools",
      new Set([
        "erd-to-code",
        "api-tester",
        "github-analyzer",
        "deployment-assistant",
      ]),
    ],
  ];

  return sections.find(([, routes]) => routes.has(key))?.[0] ?? null;
}

function resolveAcademicShieldMode(
  role: AppRole,
  slug: string[],
): "student" | "teacher" | "admin" | null {
  const key = slug[0];
  const academicShieldKeys = new Set([
    "academic-shield",
    "plagiarism-reports",
    "web-source-scan",
    "ai-writing-risk",
    "academic-rewrite",
    "citation-generator",
    "originality-reports",
  ]);

  if (role === "student" && academicShieldKeys.has(key)) {
    return "student";
  }

  if (role === "teacher" && academicShieldKeys.has(key)) {
    return "teacher";
  }

  if (role === "admin" && academicShieldKeys.has(key)) {
    return "admin";
  }

  return null;
}
