"use client";

import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Bot,
  BookOpen,
  BookOpenCheck,
  CalendarClock,
  CalendarDays,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Code2,
  FilePlus2,
  FileSearch,
  FileText,
  FlaskConical,
  GraduationCap,
  Play,
  ShieldAlert,
  Sparkles,
  Target,
  Send,
  Search,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";
import {
  BentoCard,
  CommandLinkRow,
  DataTable,
  DashboardCard,
  MetricRail,
  ModelStatusCard,
  PageHeader,
  ScoreRing,
  SkillScoreCard,
  WorkflowTimeline,
} from "@/components/ui/command-primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  modelCatalog,
  roleDashboards,
  type AppRole,
  type RoleDashboardData,
  type StatItem,
} from "@/data/dashboard.mock";
import { apiGet } from "@/services/api-client";
import { PenguinLoadingSpinner } from "@/components/ui/loading-spinner";

const writingRiskDisclaimer = "Analysis is generated using academic metrics and evaluation criteria.";

const ThroughputChart = dynamic(
  () =>
    import("@/features/dashboard/charts").then(
      (module) => module.ThroughputChart,
    ),
  {
    ssr: false,
    loading: () => <ChartPlaceholder />,
  },
);

const SkillRadarChart = dynamic(
  () =>
    import("@/features/dashboard/charts").then(
      (module) => module.SkillRadarChart,
    ),
  {
    ssr: false,
    loading: () => <ChartPlaceholder />,
  },
);

const roleAction = {
  student: "Open next task",
  teacher: "Start reviewing",
  admin: "Check system",
} satisfies Record<AppRole, string>;

const roleActionHref = {
  student: "/student/code-lab",
  teacher: "/teacher/pending-reviews",
  admin: "/admin/production-ops",
} satisfies Record<AppRole, string>;

const roleEyebrow = {
  student: "Student Dashboard",
  teacher: "Teacher Dashboard",
  admin: "Admin Dashboard",
} satisfies Record<AppRole, string>;

const roleHeroTone = {
  student: "cyan",
  teacher: "amber",
  admin: "violet",
} as const;

type DashboardRuntimeData = Pick<
  RoleDashboardData,
  "stats" | "workflows" | "activity" | "skillData"
> & {
  source?: string;
  syncedAt?: string;
};

export function RoleDashboard({ role }: { role: AppRole }) {
  const baseData = roleDashboards[role];
  const [runtimeData, setRuntimeData] = useState<DashboardRuntimeData>({
    stats: baseData.stats,
    workflows: baseData.workflows,
    activity: baseData.activity,
    skillData: baseData.skillData,
  });
  const data = { ...baseData, ...runtimeData };
  const [dashboardStatus, setDashboardStatus] = useState<
    "loading" | "live" | "saved"
  >("loading");

  useEffect(() => {
    let active = true;

    void apiGet<DashboardRuntimeData>(`/dashboard/${role}`).then((response) => {
      if (!active) return;
      if (response) {
        setRuntimeData(response);
        setDashboardStatus("live");
      } else {
        setDashboardStatus("saved");
      }
    });

    return () => {
      active = false;
    };
  }, [role]);

  const effectiveData: RoleDashboardData = {
    ...data,
    stats: runtimeData?.stats?.length ? runtimeData.stats : data.stats,
    workflows: runtimeData?.workflows?.length ? runtimeData.workflows : data.workflows,
    activity: runtimeData?.activity?.length ? runtimeData.activity : data.activity,
    skillData: runtimeData?.skillData?.length ? runtimeData.skillData : data.skillData,
  };

  return (
    <AppShell
      role={role}
      title={effectiveData.title}
      subtitle={effectiveData.subtitle}
      nav={effectiveData.nav}
      navGroups={effectiveData.navGroups}
      accountEmail={effectiveData.accountEmail}
    >
      <p className="sr-only" role="status" aria-live="polite">
        {dashboardStatus === "loading"
          ? "Loading dashboard updates."
          : dashboardStatus === "live"
            ? "Dashboard is up to date."
            : "Showing your most recent dashboard information."}
      </p>
      {role === "student" ? (
        <StudentAcademicDashboard
          data={effectiveData}
          runtimeData={runtimeData}
          status={dashboardStatus}
        />
      ) : (
        <div className="grid gap-5">
          <PageHeader
            eyebrow={roleEyebrow[role]}
            title={data.title}
            subtitle={data.subtitle}
            tone={roleHeroTone[role]}
            action={
              <Link
                href={roleActionHref[role]}
                className="nexora-focus inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#d9ff57_0%,#6cf6b3_46%,#32f59a_100%)] px-4 text-sm font-semibold text-[#07100b] shadow-[0_0_35px_rgba(50,245,154,0.2)] transition hover:brightness-110 light:bg-[linear-gradient(135deg,#087a49_0%,#0aa75f_58%,#16bb70_100%)] light:text-white"
              >
                {roleAction[role]}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />

          <MetricRail
            items={data.stats.map((stat, index) => ({
              label: stat.label,
              value: stat.value,
              tone: stat.tone,
              icon:
                [FileText, FlaskConical, Bell, ChartNoAxesCombined][index] ??
                Activity,
            }))}
          />

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
            <div className="grid gap-5">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <WorkflowTimeline items={data.workflows} />
                <DashboardCard
                  title="This Week's Activity"
                  detail="Assignments, labs and feedback updated this week."
                  icon={ChartNoAxesCombined}
                  tone="emerald"
                >
                  <div className="h-56">
                    <ThroughputChart />
                  </div>
                </DashboardCard>
              </div>

              <BentoGrid role={role} />
            </div>

            <div className="grid gap-5">
              <DashboardCard
                title="Skill DNA Radar"
                detail="Your recent work mapped to academic and technical skills."
                icon={Sparkles}
                tone="violet"
              >
                <div className="h-56">
                  <SkillRadarChart data={data.skillData} />
                </div>
              </DashboardCard>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                {data.skillData.slice(0, 2).map((skill) => (
                  <SkillScoreCard
                    key={skill.skill}
                    label={skill.skill}
                    score={skill.score}
                    tone="violet"
                  />
                ))}
              </div>

              <ModelStatusStack />
              <AssistantPanel activity={data.activity} />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function StudentAcademicDashboard({
  data,
  runtimeData,
  status,
}: {
  data: RoleDashboardData;
  runtimeData?: DashboardRuntimeData | null;
  status?: "loading" | "live" | "saved";
}) {
  const currentDateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const emailPrefix = data.accountEmail?.split("@")[0] || "student";
  const nickname = emailPrefix === "student" ? "Alex" : emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

  return (
    <div className="student-dashboard grid gap-3 sm:gap-4">
      {/* Top Personalized Welcome Heading & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-3.5 pb-1 px-0.5">
        <div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, <span className="text-emerald-600 dark:text-emerald-400">{nickname}</span> 👋
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            <span>Today is {currentDateStr}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {status === "live"
                ? "Everything is synced and up to date"
                : "All systems ready"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <Link
            href="/student/code-lab"
            className="bento-primary-btn flex-1 sm:flex-none inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-emerald-400/40 bg-[#044b3b] px-3.5 sm:px-4 text-xs font-bold !text-white shadow-[0_4px_16px_rgba(4,75,59,0.38)] transition hover:bg-[#033b2e] hover:border-emerald-300/60 active:scale-[0.98]"
          >
            <Play className="h-3.5 w-3.5 fill-white !text-white" />
            <span className="!text-white font-bold">Continue Lab</span>
          </Link>
          <Link
            href="/student/assignments"
            className="flex-1 sm:flex-none inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 sm:px-3.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300 dark:border-white/10 dark:bg-[#121715] dark:text-slate-200 dark:hover:bg-white/5"
          >
            <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
            <span>Deadlines</span>
          </Link>
        </div>
      </div>

      {/* 1. Academic Overview (Hero 4-Column Bento Stat Cards) */}
      <AcademicOverviewStats stats={data.stats} />

      {/* 2. Middle Visual Analytics Grid (Responsive Split on Large Displays, Graceful Stack on Laptops/Tablets) */}
      <div className="grid gap-3 sm:gap-4 xl:grid-cols-12 w-full min-w-0">
        <div className="xl:col-span-7 2xl:col-span-8 w-full min-w-0">
          <WeeklyStudyStackedChart />
        </div>
        <div className="xl:col-span-5 2xl:col-span-4 w-full min-w-0">
          <RadialHealthMeter stats={data.stats} />
        </div>
      </div>

      {/* 3. Bottom Unified Bento Workspace (Expansive 2-Card Layout matching Analytics Grid) */}
      <div className="grid gap-3 sm:gap-4 xl:grid-cols-12 w-full min-w-0">
        <div className="xl:col-span-7 2xl:col-span-8 w-full min-w-0">
          <UnifiedLearningAndLabHub skillData={data.skillData} labStat={data.stats?.[1]} />
        </div>
        <div className="xl:col-span-5 2xl:col-span-4 w-full min-w-0">
          <UpcomingDeadlinesCard workflows={data.workflows} />
        </div>
      </div>
    </div>
  );
}

function Coursework3DIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="book-cover-left-3d" x1="6" y1="16" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="40%" stopColor="#0aa75f" />
          <stop offset="100%" stopColor="#04432c" />
        </linearGradient>
        <linearGradient id="book-cover-right-3d" x1="42" y1="16" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="45%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#065f46" />
        </linearGradient>
        <linearGradient id="page-stack-3d" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#ecfdf5" />
          <stop offset="100%" stopColor="#a7f3d0" />
        </linearGradient>
        <linearGradient id="cap-top-3d" x1="12" y1="4" x2="36" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="cap-base-3d" x1="18" y1="14" x2="30" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>

      {/* 3D Book Left Wing */}
      <path
        d="M6 34C13 32 19 33 24 36.5V18C19 14.5 13 13.5 6 15.5V34Z"
        fill="url(#book-cover-left-3d)"
      />
      {/* 3D Book Right Wing */}
      <path
        d="M42 34C35 32 29 33 24 36.5V18C29 14.5 35 13.5 42 15.5V34Z"
        fill="url(#book-cover-right-3d)"
      />

      {/* 3D Inner Stack Pages Left */}
      <path
        d="M7.5 32.5C14 30.7 19.5 31.7 23.5 34.7V16.5C19.5 13.5 14 12.5 7.5 14.3V32.5Z"
        fill="url(#page-stack-3d)"
      />
      <path d="M10 20C13.5 19 17 19.5 20 21" stroke="#0aa75f" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M10 24C13.5 23 17 23.5 20 25" stroke="#0aa75f" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M10 28C13.5 27 17 27.5 20 29" stroke="#0aa75f" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

      {/* 3D Inner Stack Pages Right */}
      <path
        d="M40.5 32.5C34 30.7 28.5 31.7 24.5 34.7V16.5C28.5 13.5 34 12.5 40.5 14.3V32.5Z"
        fill="#ffffff"
      />
      <path d="M28 21C31 19.5 34.5 19 38 20" stroke="#0aa75f" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M28 25C31 23.5 34.5 23 38 24" stroke="#0aa75f" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M28 29C31 27.5 34.5 27 38 28" stroke="#0aa75f" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

      {/* 3D Spine Center Ridge */}
      <path d="M24 16.5V37" stroke="#032b1d" strokeWidth="1.6" strokeLinecap="round" />

      {/* 3D Graduation Cap Base */}
      <path
        d="M18.5 12C18.5 14.2 21 16 24 16C27 16 29.5 14.2 29.5 12V10H18.5V12Z"
        fill="url(#cap-base-3d)"
      />

      {/* 3D Graduation Cap Diamond Top */}
      <polygon
        points="24,3 37,8.5 24,14 11,8.5"
        fill="url(#cap-top-3d)"
        stroke="#fef08a"
        strokeWidth="0.8"
      />
      {/* 3D Gloss Highlight */}
      <polygon
        points="24,3 37,8.5 24,10 11,8.5"
        fill="#ffffff"
        opacity="0.32"
      />

      {/* 3D Cap Button & Golden Tassel */}
      <circle cx="24" cy="8.5" r="1.3" fill="#fef08a" />
      <path
        d="M24 8.5 Q32 10 33.5 16 Q34 18.5 34.5 20.5"
        fill="none"
        stroke="#fef08a"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="34.5" cy="20.5" r="1.2" fill="#fbbf24" />
    </svg>
  );
}

function LabSessions3DIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="flask-glass-3d" x1="16" y1="6" x2="36" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#34d399" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="flask-liquid-3d" x1="10" y1="26" x2="38" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="45%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="flask-meniscus-3d" x1="14" y1="24" x2="34" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="flask-rim-3d" x1="20" y1="6" x2="28" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* 3D Outer Glass Flask */}
      <path
        d="M21 8H27V18L37.5 35.5C39 38 37 41 34 41H14C11 41 9 38 10.5 35.5L21 18V8Z"
        fill="url(#flask-glass-3d)"
      />

      {/* 3D Glowing Liquid Bottom Reservoir */}
      <path
        d="M14.5 27.5L10.5 35.5C9.3 37.6 10.8 40.5 13.5 40.5H34.5C37.2 40.5 38.7 37.6 37.5 35.5L33.5 27.5C30 29 18 29 14.5 27.5Z"
        fill="url(#flask-liquid-3d)"
      />

      {/* 3D Liquid Surface Meniscus */}
      <ellipse cx="24" cy="27.5" rx="9.5" ry="2.2" fill="url(#flask-meniscus-3d)" />

      {/* Floating 3D Bubbles */}
      <circle cx="20" cy="34" r="1.8" fill="#d1fae5" opacity="0.9" />
      <circle cx="27" cy="32" r="1.4" fill="#d1fae5" opacity="0.85" />
      <circle cx="23" cy="22" r="1.2" fill="#a7f3d0" opacity="0.75" />

      {/* Glass Light Reflection / Sheen */}
      <path
        d="M14 36L22.5 20V9"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />
      <path
        d="M34 38L30 31"
        stroke="#6ee7b7"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />

      {/* 3D Top Rim Ring */}
      <ellipse cx="24" cy="8" rx="4.5" ry="1.5" fill="url(#flask-rim-3d)" stroke="#d1fae5" strokeWidth="0.6" />
    </svg>
  );
}

function ReviewTasks3DIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="board-wood-3d" x1="10" y1="10" x2="38" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="doc-paper-3d" x1="12" y1="14" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="80%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="clip-metal-3d" x1="18" y1="4" x2="30" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="check-badge-3d" x1="28" y1="28" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* 3D Back Clipboard Body */}
      <rect
        x="9"
        y="9"
        width="30"
        height="32"
        rx="5"
        fill="url(#board-wood-3d)"
      />

      {/* 3D Document Sheet */}
      <rect
        x="13"
        y="13"
        width="22"
        height="26"
        rx="3"
        fill="url(#doc-paper-3d)"
      />

      {/* Document Text Line Highlights */}
      <line x1="17" y1="19" x2="27" y2="19" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="17" y1="24" x2="31" y2="24" stroke="#d97706" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
      <line x1="17" y1="29" x2="29" y2="29" stroke="#d97706" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
      <line x1="17" y1="34" x2="25" y2="34" stroke="#d97706" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />

      {/* 3D Metallic Top Clip */}
      <rect x="18" y="5" width="12" height="7" rx="2" fill="url(#clip-metal-3d)" />
      <ellipse cx="24" cy="6" rx="2.5" ry="1.2" fill="#78350f" opacity="0.6" />

      {/* 3D Floating Checkmark Bubble Badge */}
      <circle cx="34" cy="34" r="6.5" fill="url(#check-badge-3d)" stroke="#ffffff" strokeWidth="1.2" />
      <path
        d="M31 34L33 36L37.5 31.5"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SkillMastery3DIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ring-outer-3d" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id="ring-inner-3d" x1="14" y1="14" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#a5f3fc" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="bullseye-center-3d" x1="19" y1="19" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="40%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#164e63" />
        </linearGradient>
        <linearGradient id="dart-body-3d" x1="26" y1="10" x2="42" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* 3D Outer Orbit Ring */}
      <circle
        cx="24"
        cy="24"
        r="17"
        fill="url(#ring-outer-3d)"
      />
      {/* 3D Middle Groove */}
      <circle cx="24" cy="24" r="12.5" fill="url(#ring-inner-3d)" />

      {/* 3D Inner Ring */}
      <circle cx="24" cy="24" r="8.5" fill="url(#ring-outer-3d)" />

      {/* 3D Central Bullseye Sphere */}
      <circle cx="24" cy="24" r="4.5" fill="url(#bullseye-center-3d)" />
      <circle cx="22.5" cy="22.5" r="1.5" fill="#ffffff" opacity="0.85" />

      {/* 3D Precision Dart */}
      <path
        d="M38 10L30 18L24.5 23.5L25.5 24.5L31 19L39 11Z"
        fill="url(#dart-body-3d)"
      />
      {/* Dart Flight Wings */}
      <polygon points="38,10 44,7 41,13" fill="#fbbf24" />
      <polygon points="38,10 35,4 39,7" fill="#f59e0b" />
      <circle cx="24.5" cy="23.5" r="1.2" fill="#ffffff" />
    </svg>
  );
}

function AcademicOverviewStats({ stats }: { stats?: StatItem[] }) {
  const stat0 = stats?.[0] ?? { label: "Active Assignments", value: "3", trend: "Next due 15 July" };
  const stat1 = stats?.[1] ?? { label: "Lab Sessions", value: "2", trend: "Next lab: Thursday at 10:00" };
  const stat2 = stats?.[2] ?? { label: "Feedback to Check", value: "1", trend: "1 note from teacher" };
  const stat3 = stats?.[3] ?? { label: "Skill Mastery", value: "78%", trend: "Great progress this week!" };

  return (
    <div className="grid gap-3 sm:gap-3.5 xl:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 w-full min-w-0">
      {/* 1. Vibrant Aurora Emerald Hero Card */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-[18px] sm:rounded-[22px] border border-emerald-400/30 bg-[linear-gradient(135deg,#0aa75f_0%,#087a49_45%,#043d27_100%)] p-3.5 sm:p-4 text-white shadow-[0_10px_26px_rgba(8,122,73,0.22)] transition-all duration-300 hover:shadow-[0_14px_34px_rgba(8,122,73,0.30)] hover:-translate-y-0.5 w-full min-w-0">
        {/* Vector Topographical Wave Mesh Background */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-30 overflow-hidden select-none"
          viewBox="0 0 320 160"
          fill="none"
          preserveAspectRatio="none"
        >
          <path d="M-20 30 C50 10 110 50 180 35 C240 20 280 45 340 25" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.25" />
          <path d="M-20 55 C50 35 110 75 180 60 C240 45 280 70 340 50" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.35" />
          <path d="M-20 80 C50 60 110 100 180 85 C240 70 280 95 340 75" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.45" />
          <path d="M-20 105 C50 85 110 125 180 110 C240 95 280 120 340 100" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.55" />
          <path d="M-20 130 C50 110 110 150 180 135 C240 120 280 145 340 125" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.65" />
        </svg>

        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(217,255,87,0.25),transparent_70%)] blur-md" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="relative flex items-center transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
            <Coursework3DIcon className="h-7 w-7 xs:h-8 xs:w-8 sm:h-8.5 sm:w-8.5" />
          </div>
          <span className="rounded-full border border-white/20 bg-white/20 px-2 xs:px-2.5 py-0.5 text-[8.5px] xs:text-[9px] sm:text-[9.5px] font-bold text-white backdrop-blur-sm shadow-xs">
            Core Unit
          </span>
        </div>
        <div className="relative z-10 mt-1.5 sm:mt-2 flex items-end justify-between gap-1">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] xs:text-[9.5px] sm:text-[10px] xl:text-[10.5px] font-semibold uppercase tracking-wider text-emerald-100 whitespace-nowrap truncate">
              Active Coursework
            </p>
            <p className="mt-0.5 font-mono text-lg xs:text-xl sm:text-2xl xl:text-3xl font-extrabold tracking-tight !text-white">
              {stat0.value} <span className="text-[10.5px] xs:text-xs sm:text-sm font-medium text-emerald-200">Ongoing</span>
            </p>
          </div>
          {/* Sparkline */}
          <div className="hidden xs:block h-5 sm:h-6 xl:h-6.5 w-10 sm:w-14 xl:w-18 shrink-0">
            <svg viewBox="0 0 100 32" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="hero-spark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 26 Q 25 22, 45 24 T 75 14 T 100 4 L 100 32 L 0 32 Z"
                fill="url(#hero-spark)"
              />
              <path
                d="M 0 26 Q 25 22, 45 24 T 75 14 T 100 4"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="100" cy="4" r="3" fill="#ffffff" />
            </svg>
          </div>
        </div>
        <div className="relative z-10 mt-1.5 sm:mt-2 flex items-center gap-1 text-[9.5px] xs:text-[10px] sm:text-[10.5px] font-medium text-emerald-100 truncate">
          <span className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-white/20 text-white">
            <ArrowUpRight className="h-2.5 w-2.5 stroke-[3]" />
          </span>
          <span className="truncate">{stat0.trend}</span>
        </div>
      </div>

      {/* 2. Active Labs Card */}
      <div className="command-surface group relative flex flex-col justify-between overflow-hidden rounded-[18px] sm:rounded-[22px] p-3.5 sm:p-4 shadow-[0_6px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-0.5 w-full min-w-0">
        {/* Vector Matrix Circuit Traces */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-10 dark:opacity-20 overflow-hidden select-none"
          viewBox="0 0 320 160"
          fill="none"
          preserveAspectRatio="none"
        >
          <path d="M0 25 H80 L110 55 H190 L220 25 H320" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M0 65 H50 L85 100 H165 L190 75 H260 L285 100 H320" stroke="#10b981" strokeWidth="1.3" />
          <path d="M0 120 H105 L130 95 H210 L235 120 H320" stroke="#10b981" strokeWidth="1.2" strokeDasharray="4 4" />
          <circle cx="110" cy="55" r="3.5" fill="#10b981" />
          <circle cx="190" cy="75" r="3.5" fill="#10b981" />
        </svg>

        <div className="relative z-10 flex items-center justify-between">
          <div className="relative flex items-center transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
            <LabSessions3DIcon className="h-7.5 w-7.5 sm:h-8.5 sm:w-8.5" />
          </div>
          <span className="grid h-5.5 w-5.5 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
            <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
          </span>
        </div>
        <div className="relative z-10 mt-1.5 sm:mt-2 flex items-end justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <p className="text-[9.5px] sm:text-[10px] xl:text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap truncate">
              Lab Sessions
            </p>
            <p className="mt-0.5 font-mono text-xl sm:text-2xl xl:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stat1.value} <span className="text-xs sm:text-sm font-normal text-slate-400">Booked</span>
            </p>
          </div>
          {/* Sparkline */}
          <div className="h-5 sm:h-6 xl:h-6.5 w-12 sm:w-14 xl:w-18 shrink-0">
            <svg viewBox="0 0 100 32" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="lab-spark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 28 Q 20 26, 40 18 T 75 16 T 100 4 L 100 32 L 0 32 Z"
                fill="url(#lab-spark)"
              />
              <path
                d="M 0 28 Q 20 26, 40 18 T 75 16 T 100 4"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="100" cy="4" r="3" fill="#10b981" />
            </svg>
          </div>
        </div>
        <div className="relative z-10 mt-1.5 sm:mt-2 text-[10px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{stat1.trend}</span>
        </div>
      </div>

      {/* 3. Revisions Needed / Fix Requests */}
      <div className="command-surface group relative flex flex-col justify-between overflow-hidden rounded-[18px] sm:rounded-[22px] p-3.5 sm:p-4 shadow-[0_6px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-0.5 w-full min-w-0">
        {/* Vector Diamond Wireframe Grid */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08] dark:opacity-[0.16] overflow-hidden select-none"
          viewBox="0 0 320 160"
          fill="none"
          preserveAspectRatio="none"
        >
          <path d="M40 -30 L180 190 M110 -30 L250 190 M180 -30 L320 190 M-30 -30 L110 190" stroke="#f59e0b" strokeWidth="1.1" />
          <path d="M180 -30 L40 190 M250 -30 L110 190 M320 -30 L180 190 M390 -30 L250 190" stroke="#f59e0b" strokeWidth="1.1" />
          <circle cx="180" cy="80" r="3.5" fill="#f59e0b" />
          <circle cx="110" cy="80" r="3" fill="#f59e0b" />
        </svg>

        <div className="relative z-10 flex items-center justify-between">
          <div className="relative flex items-center transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
            <ReviewTasks3DIcon className="h-7.5 w-7.5 sm:h-8.5 sm:w-8.5" />
          </div>
          <span className="grid h-5.5 w-5.5 place-items-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
            <ArrowDownRight className="h-3 w-3 stroke-[2.5]" />
          </span>
        </div>
        <div className="relative z-10 mt-1.5 sm:mt-2 flex items-end justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <p className="text-[9.5px] sm:text-[10px] xl:text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap truncate">
              Tasks to Review
            </p>
            <p className="mt-0.5 font-mono text-xl sm:text-2xl xl:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stat2.value} <span className="text-xs sm:text-sm font-normal text-slate-400">Pending</span>
            </p>
          </div>
          {/* Sparkline */}
          <div className="h-5 sm:h-6 xl:h-6.5 w-12 sm:w-14 xl:w-18 shrink-0">
            <svg viewBox="0 0 100 32" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="amber-spark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 6 Q 25 8, 50 16 T 80 20 T 100 26 L 100 32 L 0 32 Z"
                fill="url(#amber-spark)"
              />
              <path
                d="M 0 6 Q 25 8, 50 16 T 80 20 T 100 26"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="100" cy="26" r="3" fill="#f59e0b" />
            </svg>
          </div>
        </div>
        <div className="relative z-10 mt-1.5 sm:mt-2 text-[10px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
          <span className="font-bold text-amber-600 dark:text-amber-400">{stat2.trend}</span>
        </div>
      </div>

      {/* 4. Skills Progress */}
      <div className="command-surface group relative flex flex-col justify-between overflow-hidden rounded-[18px] sm:rounded-[22px] p-3.5 sm:p-4 shadow-[0_6px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-0.5 w-full min-w-0">
        {/* Vector Radar Element */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-10 dark:opacity-20 overflow-hidden select-none"
          viewBox="0 0 320 160"
          fill="none"
        >
          <circle cx="270" cy="35" r="45" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="270" cy="35" r="85" stroke="#06b6d4" strokeWidth="1.2" />
          <circle cx="270" cy="35" r="125" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="185" cy="35" r="3.5" fill="#06b6d4" />
        </svg>

        <div className="relative z-10 flex items-center justify-between">
          <div className="relative flex items-center transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
            <SkillMastery3DIcon className="h-7.5 w-7.5 sm:h-8.5 sm:w-8.5" />
          </div>
          <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[9px] sm:text-[9.5px] font-bold text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400">
            Goal: 85%
          </span>
        </div>
        <div className="relative z-10 mt-1.5 sm:mt-2 flex items-end justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <p className="text-[9.5px] sm:text-[10px] xl:text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap truncate">
              Skill Mastery
            </p>
            <p className="mt-0.5 font-mono text-xl sm:text-2xl xl:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stat3.value.includes("%") ? stat3.value : `${stat3.value}%`}
            </p>
          </div>
          {/* Sparkline */}
          <div className="h-5 sm:h-6 xl:h-6.5 w-12 sm:w-14 xl:w-18 shrink-0">
            <svg viewBox="0 0 100 32" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="cyan-spark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 26 Q 25 24, 50 16 T 80 14 T 100 4 L 100 32 L 0 32 Z"
                fill="url(#cyan-spark)"
              />
              <path
                d="M 0 26 Q 25 24, 50 16 T 80 14 T 100 4"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="100" cy="4" r="3" fill="#06b6d4" />
            </svg>
          </div>
        </div>
        <div className="relative z-10 mt-1.5 sm:mt-2 text-[10px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
          {stat3.trend}
        </div>
      </div>
    </div>
  );
}

function WeeklyStudyStackedChart() {
  const [activeDayIndex, setActiveDayIndex] = useState(2); // Wednesday active

  const daysData = [
    { day: "Mon", fullDay: "Monday", hours: "6.5h", val: 6.5 },
    { day: "Tue", fullDay: "Tuesday", hours: "5.2h", val: 5.2 },
    { day: "Wed", fullDay: "Wednesday", hours: "7.8h", val: 7.8, isPeak: true },
    { day: "Thu", fullDay: "Thursday", hours: "4.0h", val: 4.0 },
    { day: "Fri", fullDay: "Friday", hours: "6.0h", val: 6.0 },
    { day: "Sat", fullDay: "Saturday", hours: "3.0h", val: 3.0 },
    { day: "Sun", fullDay: "Sunday", hours: "1.5h", val: 1.5 },
  ];

  const yBase = 180;
  const maxVal = 8.0;
  const maxH = 120;
  const colW = 50;
  const startX = 55;
  const stepX = 78;
  const slantX = 14;
  const slantY = -9;

  return (
    <section className="command-surface relative flex h-full flex-col justify-between rounded-[20px] sm:rounded-[22px] p-3.5 sm:p-5 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm xs:text-base font-bold text-slate-900 dark:text-white">
            Your Weekly Study Rhythm
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Daily study hours and hands-on coding practice
          </p>
        </div>
        <div className="flex items-center gap-2 self-start xs:self-auto">
          <span className="rounded-full bg-emerald-500/10 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10.5px] sm:text-xs font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            34.0 hours logged this week
          </span>
        </div>
      </div>

      {/* 3D Isometric Chart Container (Expansive & Responsive fluid vector scaling) */}
      <div className="relative my-auto py-2 w-full min-w-0">
        <svg viewBox="0 0 620 215" className="w-full h-44 xs:h-48 sm:h-56 md:h-64 select-none overflow-visible">
          <defs>
            {/* Diagonal Hatch Stripe Pattern for Normal Bars */}
            <pattern
              id="diagonal-stripes"
              width="8"
              height="8"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="8"
                stroke="#ffffff"
                strokeWidth="3.2"
                strokeOpacity="0.45"
              />
            </pattern>

            {/* Normal 3D Bar Base Gradient */}
            <linearGradient id="bar-emerald-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            {/* Active Hero 3D Bar Gradient */}
            <linearGradient id="active-bar-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#04432c" />
              <stop offset="60%" stopColor="#0aa75f" />
              <stop offset="100%" stopColor="#65a30d" />
            </linearGradient>

            {/* Active Column Frosted Spotlight Backdrop */}
            <linearGradient id="spotlight-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Y-Axis Grid Lines & Labels */}
          {[
            { val: "8h", y: yBase - maxH },
            { val: "6h", y: yBase - (maxH * 6) / 8 },
            { val: "4h", y: yBase - (maxH * 4) / 8 },
            { val: "2h", y: yBase - (maxH * 2) / 8 },
            { val: "0h", y: yBase },
          ].map((g) => (
            <g key={g.val}>
              <text
                x="32"
                y={g.y + 4}
                textAnchor="end"
                className="fill-slate-400 dark:fill-slate-500 font-mono text-[11px] font-semibold"
              >
                {g.val}
              </text>
              <line
                x1="42"
                y1={g.y}
                x2="610"
                y2={g.y}
                stroke="currentColor"
                strokeDasharray="4 4"
                className="text-slate-200/80 dark:text-white/10"
              />
            </g>
          ))}

          {/* 3D Columns */}
          {daysData.map((d, i) => {
            const x = startX + i * stepX;
            const barH = (d.val / maxVal) * maxH;
            const yTop = yBase - barH;
            const isActive = activeDayIndex === i;

            return (
              <g
                key={d.day}
                className="cursor-pointer transition-all duration-300 group"
                onClick={() => setActiveDayIndex(i)}
              >
                {/* Spotlight Backdrop for Active / Hovered Column */}
                {isActive && (
                  <rect
                    x={x - 8}
                    y={10}
                    width={colW + 16}
                    height={yBase - 10 + 4}
                    rx={10}
                    fill="url(#spotlight-grad)"
                    className="transition-all duration-300"
                  />
                )}

                {/* Header Label & Value above Bar */}
                <text
                  x={x + colW / 2}
                  y="25"
                  textAnchor="middle"
                  className={`text-xs font-semibold transition ${isActive
                      ? "fill-slate-950 dark:fill-white font-extrabold"
                      : "fill-slate-500 dark:fill-slate-400"
                    }`}
                >
                  {d.day}
                </text>
                <text
                  x={x + colW / 2}
                  y="42"
                  textAnchor="middle"
                  className={`font-mono text-sm font-extrabold transition ${isActive
                      ? "fill-slate-950 dark:fill-white text-base font-black"
                      : "fill-slate-700 dark:fill-slate-300"
                    }`}
                >
                  {d.hours}
                </text>

                {/* 3D Right Side Extrusion (Shadow Depth) */}
                <polygon
                  points={`${x + colW},${yTop} ${x + colW + slantX},${yTop + slantY} ${x + colW + slantX},${yBase + slantY} ${x + colW},${yBase}`}
                  fill={isActive ? "#033221" : "#045239"}
                  opacity={isActive ? 0.95 : 0.7}
                  className="transition-all duration-300 group-hover:brightness-110"
                />

                {/* 3D Top Cap (Perspective Reflection) */}
                <polygon
                  points={`${x},${yTop} ${x + slantX},${yTop + slantY} ${x + colW + slantX},${yTop + slantY} ${x + colW},${yTop}`}
                  fill={isActive ? "#86efac" : "#6ee7b7"}
                  className="transition-all duration-300 group-hover:brightness-110"
                />

                {/* Front Face (Solid for Active, Diagonal Stripes for Others) */}
                <rect
                  x={x}
                  y={yTop}
                  width={colW}
                  height={barH}
                  fill={isActive ? "url(#active-bar-grad)" : "url(#bar-emerald-grad)"}
                  className="transition-all duration-300 group-hover:brightness-105"
                />
                {!isActive && (
                  <rect
                    x={x}
                    y={yTop}
                    width={colW}
                    height={barH}
                    fill="url(#diagonal-stripes)"
                    className="pointer-events-none"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Metrics */}
      <div className="mt-2 flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 border-t border-slate-200/80 dark:border-white/10 pt-2.5 text-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1.5 truncate">
            <span className="h-3 w-3 shrink-0 rounded-xs bg-[linear-gradient(135deg,#0aa75f_0%,#04432c_100%)] shadow-xs" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              Peak: {daysData[activeDayIndex]?.fullDay} ({daysData[activeDayIndex]?.hours})
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#10b981]/60" />
            <span>Target</span>
          </div>
        </div>
        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
          Daily avg: <strong className="text-emerald-600 dark:text-emerald-400">4.85h/day</strong>
        </span>
      </div>
    </section>
  );
}

function RadialHealthMeter({ stats }: { stats?: StatItem[] }) {
  const skillVal = Number(stats?.[3]?.value?.replace(/[^0-9]/g, "")) || 78;
  const revisionsCount = Number(stats?.[2]?.value?.replace(/[^0-9]/g, "")) || 1;
  const healthScore = Math.min(98, Math.max(65, Math.round(skillVal * 0.4 + (100 - revisionsCount * 6) * 0.3 + 98 * 0.3)));

  const totalTicks = 28;
  const activeTicks = Math.round((healthScore / 100) * totalTicks);

  return (
    <section className="command-surface relative flex h-full flex-col justify-between rounded-[20px] sm:rounded-[22px] p-3.5 sm:p-5 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm xs:text-base font-bold text-slate-900 dark:text-white">
            Academic Health
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Originality score, lab tests &amp; timely progress
          </p>
        </div>
        <Link
          href="/student/academic-shield"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50/80 px-2.5 py-1 text-xs font-bold text-emerald-600 shadow-2xs transition hover:bg-emerald-50 dark:border-white/10 dark:bg-white/5 dark:text-emerald-400"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span className="hidden xs:inline">Shield Active →</span>
          <span className="xs:hidden">Active →</span>
        </Link>
      </div>

      {/* High-Tech Radial Dial SVG (Large & Responsive) */}
      <div className="relative my-auto flex flex-col items-center justify-center py-2">
        <svg viewBox="0 0 240 215" className="h-44 xs:h-52 sm:h-60 w-full overflow-visible select-none">
          <defs>
            <radialGradient id="center-pod-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.10)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Center Ambient Pod Background */}
          <circle cx="120" cy="110" r="66" fill="url(#center-pod-grad)" />

          {/* Concentric Inner Baseline Track */}
          <path
            d="M 46 142 A 76 76 0 1 1 194 142"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="text-slate-200 dark:text-white/15"
          />

          {/* 28 Segmented Radial Dial Ticks */}
          {Array.from({ length: totalTicks }).map((_, i) => {
            const angle = -215 + (i / (totalTicks - 1)) * 250;
            const rad = (angle * Math.PI) / 180;
            const rInner = 76;
            const rOuter = 95;
            const x1 = Math.round((120 + rInner * Math.cos(rad)) * 100) / 100;
            const y1 = Math.round((110 + rInner * Math.sin(rad)) * 100) / 100;
            const x2 = Math.round((120 + rOuter * Math.cos(rad)) * 100) / 100;
            const y2 = Math.round((110 + rOuter * Math.sin(rad)) * 100) / 100;
            const isActive = i < activeTicks;

            const strokeColor = isActive
              ? i < 7
                ? "#06b6d4" // Cyan
                : i < 15
                  ? "#0aa75f" // Aurora Emerald
                  : i < 22
                    ? "#10b981" // Mint Emerald
                    : "#a3e635" // Neon Lime
              : "rgba(148, 163, 184, 0.18)";

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={strokeColor}
                strokeWidth={isActive ? "5.5" : "3.8"}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>

        {/* Center Content Badge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <div className="flex flex-col items-center pb-2">
            <span className="font-mono text-3xl xs:text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              {healthScore}<span className="text-xl xs:text-2xl font-bold text-emerald-600 dark:text-emerald-400">%</span>
            </span>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 xs:px-2.5 py-0.5 text-[9.5px] xs:text-[10.5px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 xs:h-2 xs:w-2 rounded-full bg-emerald-500 animate-pulse" />
              All Clear &amp; On Track
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Mini Metrics Pods */}
      <div className="mt-2 grid grid-cols-2 gap-2 sm:gap-2.5 border-t border-slate-200/80 dark:border-white/10 pt-2.5 sm:pt-3">
        <Link
          href="/student/academic-shield"
          className="group rounded-xl border border-slate-200/70 bg-slate-50/70 p-2 transition hover:border-emerald-300 dark:border-white/5 dark:bg-[#121715] dark:hover:border-emerald-500/30"
        >
          <div className="flex items-center justify-between text-[11px] sm:text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium group-hover:text-emerald-600 truncate">Originality</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">98%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/60 dark:bg-white/10">
            <div className="h-full w-[98%] rounded-full bg-emerald-500" />
          </div>
        </Link>

        <Link
          href="/student/code-lab"
          className="group rounded-xl border border-slate-200/70 bg-slate-50/70 p-2 transition hover:border-cyan-300 dark:border-white/5 dark:bg-[#121715] dark:hover:border-cyan-500/30"
        >
          <div className="flex items-center justify-between text-[11px] sm:text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium group-hover:text-cyan-600 truncate">Code Pass</span>
            <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 shrink-0">100%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/60 dark:bg-white/10">
            <div className="h-full w-full rounded-full bg-cyan-500" />
          </div>
        </Link>
      </div>
    </section>
  );
}

function UnifiedLearningAndLabHub({
  skillData,
  labStat,
}: {
  skillData?: RoleDashboardData["skillData"];
  labStat?: StatItem;
}) {
  const defaultSubjects = [
    { name: "Web Application Dev", pct: "35%", color: "bg-[#0aa75f]" },
    { name: "Data Structures & Algo", pct: "30%", color: "bg-cyan-500" },
    { name: "Database & SQL", pct: "20%", color: "bg-amber-400" },
    { name: "Software Architecture", pct: "15%", color: "bg-emerald-400" },
  ];

  const subjects =
    skillData && skillData.length > 0
      ? skillData.slice(0, 4).map((s, idx) => ({
        name: s.skill,
        pct: typeof s.score === "number" ? `${Math.round(s.score)}%` : String(s.score),
        color: [
          "bg-[#0aa75f]",
          "bg-cyan-500",
          "bg-amber-400",
          "bg-emerald-400",
        ][idx % 4] ?? "bg-[#0aa75f]",
      }))
      : defaultSubjects;

  return (
    <section className="command-surface group relative flex h-full flex-col justify-between overflow-hidden rounded-[20px] sm:rounded-[22px] p-3.5 sm:p-5 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
      {/* Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-white/10 pb-2.5 sm:pb-3">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h2 className="text-sm xs:text-base font-bold text-slate-900 dark:text-white">
              Learning &amp; Lab Workspace
            </h2>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9.5px] sm:text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              4 Core Units
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Curriculum mastery &amp; instant browser coding sandbox
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/student/assignments"
            className="text-[11px] sm:text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            All Modules →
          </Link>
        </div>
      </div>

      {/* 2-Column Split Body inside this unified card */}
      <div className="relative z-10 my-auto grid grid-cols-1 gap-3.5 py-3 md:grid-cols-2 xl:grid-cols-12 md:items-center">
        {/* Left Side: Curriculum Unit Audit & Progress Ledger */}
        <div className="md:col-span-1 xl:col-span-6 2xl:col-span-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-white/10 pb-3 md:pb-0 md:pr-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <BookOpenCheck className="h-3.5 w-3.5 text-emerald-500" />
              Unit Progress Ledger
            </span>
            <Link
              href="/student/assignments"
              className="text-[10.5px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              Audit Log →
            </Link>
          </div>

          <div className="grid gap-2">
            {[
              { code: "WA", name: "Web Application Dev", pct: 82, status: "Active", tone: "emerald" },
              { code: "DS", name: "Data Structures & Algo", pct: 68, status: "Active", tone: "cyan" },
              { code: "DB", name: "Database Design & SQL", pct: 74, status: "Verified", tone: "emerald" },
              { code: "SA", name: "Software Architecture", pct: 88, status: "Verified", tone: "emerald" },
            ].map((u) => (
              <div
                key={u.code}
                className="grid grid-cols-[26px_minmax(0,1fr)_auto] sm:grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2 sm:gap-2.5 rounded-xl border border-slate-200/60 bg-white/60 dark:bg-white/[0.03] dark:border-white/5 p-1.5 sm:p-2 transition hover:border-emerald-400/30"
              >
                <span className={cn(
                  "grid h-6.5 w-6.5 sm:h-7 sm:w-7 shrink-0 place-items-center rounded-lg font-mono text-[9.5px] sm:text-[10px] font-black text-white shadow-2xs",
                  u.tone === "cyan" ? "bg-cyan-600" : "bg-[#0aa75f]"
                )}>
                  {u.code}
                </span>
                <div className="min-w-0 overflow-hidden">
                  <p className="truncate text-[11.5px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">{u.name}</p>
                  <div className="mt-0.5 flex items-center gap-1.5 sm:gap-2">
                    <div className="h-1.5 min-w-[32px] flex-1 max-w-[80px] sm:max-w-[120px] overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                      <div
                        className={cn("h-full rounded-full", u.tone === "cyan" ? "bg-cyan-500" : "bg-[#0aa75f]")}
                        style={{ width: `${u.pct}%` }}
                      />
                    </div>
                    <span className="font-mono text-[9.5px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">{u.pct}%</span>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 text-[8.5px] sm:text-[9px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  {u.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Active Code Lab Launcher & Sandbox */}
        <div className="md:col-span-1 xl:col-span-6 2xl:col-span-7 flex flex-col justify-between gap-2.5 md:pl-2">
          <Link
            href="/student/code-lab"
            className="group block rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 sm:p-3 shadow-xs transition hover:border-emerald-300 dark:border-white/10 dark:bg-[#121715] dark:hover:border-emerald-500/30"
          >
            <div className="grid grid-cols-[32px_minmax(0,1fr)_auto] sm:grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-2 sm:gap-2.5">
              <span className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs group-hover:scale-105 transition-transform">
                <Code2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </span>
              <div className="min-w-0 overflow-hidden">
                <p className="truncate text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  JavaScript Form Validation
                </p>
                <p className="truncate text-[10.5px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  DOM APIs • LiveLab Sandbox
                </p>
              </div>
              <span className="shrink-0 flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] sm:text-[9.5px] font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                {labStat?.value ? `${labStat.value} Booked` : "Ready"}
              </span>
            </div>

            <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/80 dark:border-white/10 pt-2 text-[11px] sm:text-xs">
              <span className="font-medium text-slate-500 dark:text-slate-400">Test Suite:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">3 of 3 Passing (100%)</span>
            </div>
          </Link>

          <Link
            href="/student/code-lab"
            className="bento-primary-btn nexora-focus group inline-flex h-9.5 sm:h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-[#044b3b] px-3.5 sm:px-4 text-xs font-bold !text-white shadow-[0_4px_16px_rgba(4,75,59,0.38)] transition hover:bg-[#033b2e] hover:border-emerald-300/60 active:scale-[0.98]"
          >
            <Play className="h-3.5 w-3.5 fill-white !text-white" />
            <span className="!text-white font-bold">Continue Coding Lab</span>
            <ArrowRight className="h-3.5 w-3.5 !text-white transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-1 border-t border-slate-200/80 dark:border-white/10 pt-2 sm:pt-2.5 text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400">
        <span>Sandbox: <strong className="font-semibold text-slate-800 dark:text-slate-200">Piston &amp; Pyodide</strong></span>
        <span>Autosave: <strong className="font-semibold text-emerald-600 dark:text-emerald-400">Synced &amp; Saved</strong></span>
      </div>
    </section>
  );
}

function UpcomingDeadlinesCard({ workflows }: { workflows?: RoleDashboardData["workflows"] }) {
  // Normalize backend/mock records into natural, human student milestones
  const defaultMilestones = [
    {
      title: "Web Architecture & System Design",
      subtitle: "OTHM Unit 4 • Assignment Brief 1",
      detail: "Submission under review by course tutor",
      status: "Under Review",
      tone: "cyan" as const,
      dueText: "Feedback Soon",
      icon: FileSearch,
      iconBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
      badgeClass: "border-cyan-400/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
      href: "/student/submissions",
    },
    {
      title: "JavaScript Form Validation Lab",
      subtitle: "LiveLab DOM Sandbox • Practical Task",
      detail: "1 revision note from Dr. Sarah • Field check fix",
      status: "Action Required",
      tone: "amber" as const,
      dueText: "Due in 2 days",
      icon: AlertCircle,
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      badgeClass: "border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      href: "/student/teacher-feedback",
    },
    {
      title: "Database Design & SQL Brief",
      subtitle: "Database Unit 16 • Coursework",
      detail: "Objective & ERD schema sections ready to draft",
      status: "Draft Ready",
      tone: "emerald" as const,
      dueText: "Due 24 July",
      icon: BookOpen,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      badgeClass: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      href: "/student/assignments",
    },
  ];

  const items = (workflows && workflows.length > 0 ? workflows : []).map((w, idx) => {
    const fallback = defaultMilestones[idx % defaultMilestones.length];
    const isAmber = w.tone === "amber" || w.status?.toLowerCase().includes("action") || w.status?.toLowerCase().includes("revision") || w.label?.toLowerCase().includes("lab");
    const isCyan = w.tone === "cyan" || w.status?.toLowerCase().includes("review") || w.label?.toLowerCase().includes("architecture") || w.label?.toLowerCase().includes("task");

    return {
      title: w.label || fallback.title,
      detail: w.detail || fallback.detail,
      status: w.status?.includes("submission") ? "Under Review" : w.status?.includes("session") ? "In Progress" : w.status?.includes("report") ? "Action Required" : w.status || fallback.status,
      tone: isAmber ? ("amber" as const) : isCyan ? ("cyan" as const) : ("emerald" as const),
      dueText: isAmber ? "Due in 2 days" : isCyan ? "Review Pending" : "Due 24 July",
      icon: isAmber ? AlertCircle : isCyan ? FileSearch : BookOpen,
      iconBg: isAmber
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
        : isCyan
          ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      badgeClass: isAmber
        ? "border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : isCyan
          ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
          : "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      href: isAmber
        ? "/student/teacher-feedback"
        : isCyan
          ? "/student/submissions"
          : "/student/assignments",
    };
  });

  const displayItems = items.length > 0 ? items : defaultMilestones;

  return (
    <section className="command-surface group relative flex h-full flex-col justify-between overflow-hidden rounded-[20px] sm:rounded-[22px] p-3.5 sm:p-5 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
      {/* Header Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-2.5 sm:pb-3">
        <div>
          <h2 className="text-sm xs:text-base font-bold text-slate-900 dark:text-white">
            What&apos;s Coming Up
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Upcoming tasks and submission milestones
          </p>
        </div>
        <Link
          href="/student/assignments"
          className="text-[11px] sm:text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
        >
          View All →
        </Link>
      </div>

      {/* Task Milestones List */}
      <div className="relative z-10 my-auto grid gap-2 sm:gap-2.5 py-2.5 sm:py-3">
        {displayItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group grid grid-cols-[32px_minmax(0,1fr)_auto] sm:grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3 rounded-xl border border-slate-200/80 bg-white/80 dark:bg-[#121715] dark:border-white/10 px-2.5 py-2 sm:px-3.5 sm:py-3 shadow-2xs transition-all duration-200 hover:border-emerald-400/40 hover:bg-emerald-50/15 dark:hover:border-emerald-500/30 dark:hover:bg-white/5"
          >
            <span className={cn("grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl border shadow-xs transition-transform group-hover:scale-105", item.iconBg)}>
              <item.icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </span>

            <div className="min-w-0 overflow-hidden">
              <p className="truncate text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {item.title}
              </p>
              <p className="truncate text-[10.5px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {item.detail}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1 pl-1 text-right">
              <span className={cn("rounded-full px-1.5 sm:px-2 py-0.5 text-[8.5px] sm:text-[9.5px] font-bold border whitespace-nowrap shadow-2xs", item.badgeClass)}>
                {item.status}
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                {item.dueText}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer Alert */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-1 border-t border-slate-200/80 dark:border-white/10 pt-2 sm:pt-2.5 text-[10.5px] sm:text-[11px]">
        <span className="text-slate-500 dark:text-slate-400 font-medium">Priority milestone:</span>
        <span className="font-bold text-amber-600 dark:text-amber-400">⚡ 15 July (in 2 days)</span>
      </div>
    </section>
  );
}

function AcademicHeroVisual() {
  return (
    <div className="relative min-h-[140px] min-w-0 overflow-hidden rounded-[18px] lg:-my-4 lg:-mr-4 lg:rounded-none lg:rounded-r-[23px]">
      <Image
        src="/dashboard/nexora-ai-assistant-dark.png"
        alt="Nexora assistant devices"
        fill
        priority
        unoptimized
        sizes="(min-width: 1024px) 36vw, 100vw"
        className="z-0 object-cover object-right light:hidden"
      />
      <Image
        src="/dashboard/nexora-ai-assistant.png"
        alt=""
        fill
        priority
        unoptimized
        sizes="(min-width: 1024px) 36vw, 100vw"
        className="z-0 hidden object-cover object-right light:block"
      />
    </div>
  );
}

const sparklineData = [
  {
    path: "M2 22 C12 20 18 17 27 17 S40 9 49 12 S62 20 70 13 S82 10 90 8",
    endY: 8,
  },
  {
    path: "M2 23 C11 21 18 20 27 16 S42 13 50 9 S62 8 69 15 S80 10 90 7",
    endY: 7,
  },
  {
    path: "M2 22 C13 18 20 17 29 14 S43 8 51 11 S62 23 70 16 S81 14 90 12",
    endY: 12,
  },
  {
    path: "M2 23 C10 19 21 18 29 15 S43 12 51 14 S62 22 70 15 S82 10 90 11",
    endY: 11,
  },
];

function MiniSparkline({
  tone,
  variant,
}: {
  tone: "emerald" | "amber" | "violet";
  variant: number;
}) {
  const color =
    tone === "amber" ? "#f97316" : tone === "violet" ? "#8d6cff" : "#07c875";
  const series = sparklineData[variant] ?? sparklineData[0];
  const gradientId = `metric-sparkline-${variant}-${tone}`;

  return (
    <svg viewBox="0 0 94 30" className="h-7 w-20 shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.24" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M2 26 H92"
        fill="none"
        stroke="currentColor"
        strokeDasharray="2 4"
        strokeOpacity="0.12"
      />
      <path
        d={`${series.path} L90 28 L2 28 Z`}
        fill={`url(#${gradientId})`}
        stroke="none"
      />
      <path
        d={series.path}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.25"
      />
      <circle cx="90" cy={series.endY} r="4" fill={color} fillOpacity="0.16" />
      <circle cx="90" cy={series.endY} r="2" fill={color} />
    </svg>
  );
}

function StudentListCard({
  title,
  icon: Icon,
  rows,
  action,
  href,
}: {
  title: string;
  icon: LucideIcon;
  rows: string[][];
  action: string;
  href: string;
}) {
  return (
    <section className="student-standard-card min-w-0 rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,21,0.88)_0%,rgba(9,13,11,0.92)_100%)] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.26)] light:border-slate-200/80 light:bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_100%)] light:shadow-[0_18px_44px_rgba(33,45,74,0.07)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-2xl border border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] text-[var(--brand-lime)] light:border-transparent light:bg-emerald-50 light:text-emerald-600">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="text-sm font-semibold text-[var(--foreground)] light:text-slate-950">
            {title}
          </h2>
        </div>
        <Badge tone="emerald">Live</Badge>
      </div>
      <div className="mt-3 grid gap-2">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-slate-500 light:border-slate-200">
            You&apos;re all caught up for now.
          </div>
        ) : null}
        {rows.map(([name, detail, status]) => (
          <div
            key={name}
            className="grid grid-cols-[32px_minmax(0,1fr)] items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 sm:grid-cols-[32px_minmax(0,1fr)_auto] light:border-slate-200 light:bg-slate-50/70"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-black/20 text-slate-300 shadow-sm light:border-transparent light:bg-white light:text-slate-500">
              <FileText className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold leading-5 text-[var(--foreground)] light:text-slate-900">
                {name}
              </p>
              <p className="mt-1 truncate text-xs text-slate-400 light:text-slate-500">
                {detail}
              </p>
            </div>
            <span className="col-start-2 justify-self-start whitespace-nowrap rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[11px] font-semibold text-[#ffd29b] sm:col-start-auto sm:justify-self-auto light:border-transparent light:bg-amber-50 light:text-amber-700">
              {status}
            </span>
          </div>
        ))}
      </div>
      <Link
        href={href}
        className="nexora-focus mt-3 inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-[var(--brand-lime)] transition hover:text-[var(--brand-emerald)] light:text-emerald-700 light:hover:text-emerald-900"
      >
        {action}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

function StudentAssistantPanel({ activity }: { activity: string[] }) {
  return (
    <section className="student-standard-card min-w-0 rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,21,0.88)_0%,rgba(9,13,11,0.92)_100%)] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.26)] light:border-slate-200/80 light:bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_100%)] light:shadow-[0_18px_44px_rgba(33,45,74,0.07)]">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-2xl border border-[color:var(--border-lime)] bg-[rgba(217,255,87,0.10)] text-[var(--brand-lime)] light:border-transparent light:bg-violet-50 light:text-violet-600">
          <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--foreground)] light:text-slate-950">
              Study Assistant
            </h2>
            <Badge tone="slate">Coming soon</Badge>
          </div>
          <p className="text-xs text-slate-400 light:text-slate-500">
            Guided study tools will be available here soon.
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          "Explain this code",
          "Check my report",
          "Improve writing",
          "Generate brief",
          "Find references",
          "Analyze feedback",
        ].map((item) => (
          <button
            key={item}
            type="button"
            disabled
            title="Coming soon"
            className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs font-semibold text-slate-500 opacity-70 light:border-slate-200 light:bg-slate-50 light:text-slate-400"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-2">
        {activity.slice(0, 2).map((item) => (
          <p
            key={item}
            className="rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs leading-5 text-slate-300 light:border-transparent light:bg-slate-50 light:text-slate-600"
          >
            {item}
          </p>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-1.5 opacity-60 shadow-[inset_0_1px_0_rgba(245,247,242,0.05)] light:border-slate-200 light:bg-slate-50 light:shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <span className="min-w-0 flex-1 text-sm text-slate-500 light:text-slate-400">
          Ask about your coursework...
        </span>
        <Button
          type="button"
          disabled
          title="Coming soon"
          className="h-10 w-10 rounded-xl px-0"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}

function BentoGrid({ role }: { role: AppRole }) {
  if (role === "admin") {
    return (
      <div className="grid gap-5 lg:grid-cols-3">
        <BentoCard
          title="Model Health"
          detail="AI tools are running through the local fallback router."
          icon={Bot}
          tone="emerald"
          className="lg:col-span-1"
        >
          <ScoreRing value={96} tone="emerald" />
        </BentoCard>
        <BentoCard
          title="Security Activity"
          detail="Recent login, storage and audit activity."
          icon={ShieldAlert}
          tone="amber"
          className="lg:col-span-2"
        >
          <DataTable
            columns={["Event", "Severity", "Time"]}
            rows={[
              { Event: "Login policy checked", Severity: "Low", Time: "09:20" },
              { Event: "Storage path scanned", Severity: "Low", Time: "10:05" },
              { Event: "Model router audit", Severity: "Info", Time: "11:30" },
            ]}
          />
        </BentoCard>
      </div>
    );
  }

  if (role === "teacher") {
    return (
      <div className="grid gap-5 lg:grid-cols-3">
        <BentoCard
          title="Review Queue"
          detail="Submissions, alerts and fix requests that need attention."
          icon={ClipboardCheck}
          tone="amber"
          className="lg:col-span-2"
        >
          <div className="grid gap-3">
            <CommandLinkRow
              title="Task 1 report review"
              detail="18 submissions with LO/AC summaries"
              tone="amber"
            />
            <CommandLinkRow
              title="LiveLab hidden test failures"
              detail="4 students need targeted code feedback"
              tone="rose"
            />
          </div>
        </BentoCard>
        <BentoCard
          title="Student Progress"
          detail="Class progress across labs and reports."
          icon={UsersRound}
          tone="cyan"
        >
          <ScoreRing value={74} tone="cyan" />
        </BentoCard>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <BentoCard
        title="Upcoming Tasks"
        detail="Academic workload ordered by urgency."
        icon={CalendarClock}
        tone="cyan"
        className="lg:col-span-2"
      >
        <div className="grid gap-3">
          <CommandLinkRow
            title="Fix AC 4.3 evidence"
            detail="Add test plan screenshots before resubmission"
            tone="amber"
          />
          <CommandLinkRow
            title="Complete LiveLab validation"
            detail="Resolve hidden test failures"
            tone="emerald"
          />
        </div>
      </BentoCard>
      <BentoCard
        title="AcademicShield"
        detail="Originality and AI writing advisory signal."
        icon={ShieldAlert}
        tone="rose"
      >
        <ScoreRing value={61} tone="amber" />
      </BentoCard>
    </div>
  );
}

function ModelStatusStack() {
  return (
    <div className="grid gap-4">
      {modelCatalog.slice(0, 3).map((model) => (
        <ModelStatusCard
          key={model.id}
          model={model.name}
          detail={model.purpose}
          status={readableModelMode(model.mode)}
        />
      ))}
    </div>
  );
}

function readableModelMode(mode: string) {
  if (mode === "mock") {
    return "local demo";
  }

  return mode;
}

function AssistantPanel({ activity }: { activity: string[] }) {
  return (
    <DashboardCard
      title="Recent suggestions"
      detail="Warnings, explanations, and useful next steps from your recent work."
      icon={Sparkles}
      tone="emerald"
    >
      <div className="grid gap-3">
        {activity.map((item) => (
          <div
            key={item}
            className="rounded-xl border border-white/10 bg-white/[0.035] p-3"
          >
            <p className="text-sm leading-6 text-slate-300 light:text-slate-700">
              {item}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs leading-5 text-slate-500">
        {writingRiskDisclaimer}
      </p>
    </DashboardCard>
  );
}

function ChartPlaceholder() {
  return (
    <Card className="grid h-full place-items-center">
      <div className="text-center">
        <PenguinLoadingSpinner
          size="md"
          showText={true}
          text="Preparing chart"
        />
      </div>
    </Card>
  );
}
