"use client";

import {
  Activity,
  ArrowRight,
  Bell,
  Bot,
  BookOpenCheck,
  CalendarClock,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronRight,
  ClipboardCheck,
  Code2,
  FilePlus2,
  FileText,
  FlaskConical,
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
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
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
import { PenguinLoadingSpinner } from "@/components/ui/loading-spinner";
import {
  modelCatalog,
  roleDashboards,
  writingRiskDisclaimer,
  type AppRole,
  type RoleDashboardData,
} from "@/lib/mock-data";
import { apiGet } from "@/lib/workflow-api";

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

  return (
    <AppShell
      role={role}
      title={data.title}
      subtitle={data.subtitle}
      nav={data.nav}
      navGroups={data.navGroups}
      accountEmail={data.accountEmail}
    >
      <p className="sr-only" role="status" aria-live="polite">
        {dashboardStatus === "loading"
          ? "Loading dashboard updates."
          : dashboardStatus === "live"
            ? "Dashboard is up to date."
            : "Showing your most recent dashboard information."}
      </p>
      {role === "student" ? (
        <StudentAcademicDashboard data={data} />
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

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
            <div className="grid gap-5">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
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

function StudentAcademicDashboard({ data }: { data: RoleDashboardData }) {
  const statIcons = [FileText, FlaskConical, Bell, ChartNoAxesCombined];
  const quickActions = [
    {
      title: "Assignment Reports",
      detail: "Review your coursework",
      href: "/student/assignments",
      icon: FilePlus2,
      tone: "bg-[linear-gradient(145deg,#6b62cc,#5148aa)] shadow-[0_7px_16px_rgba(81,72,170,0.20)]",
      comingSoon: true,
    },
    {
      title: "Coding Lab",
      detail: "Resume your practice",
      href: "/student/code-lab",
      icon: Code2,
      tone: "bg-[linear-gradient(145deg,#3298aa,#25798d)] shadow-[0_7px_16px_rgba(37,121,141,0.18)]",
      comingSoon: false,
    },
    {
      title: "Code Support",
      detail: "Review coding guidance",
      href: "/student/code-doctor",
      icon: Bot,
      tone: "bg-[linear-gradient(145deg,#6b62cc,#5148aa)] shadow-[0_7px_16px_rgba(81,72,170,0.20)]",
      comingSoon: true,
    },
    {
      title: "Lab Reports",
      detail: "Review your reports",
      href: "/student/lab-reports",
      icon: ClipboardCheck,
      tone: "bg-[linear-gradient(145deg,#238e6a,#176f53)] shadow-[0_7px_16px_rgba(23,111,83,0.18)]",
      comingSoon: true,
    },
    {
      title: "Originality Check",
      detail: "Review your writing",
      href: "/student/academic-shield",
      icon: ShieldCheck,
      tone: "bg-[linear-gradient(145deg,#6b62cc,#5148aa)] shadow-[0_7px_16px_rgba(81,72,170,0.20)]",
      comingSoon: false,
    },
    {
      title: "Research Resources",
      detail: "Explore study materials",
      href: "/student/research-assistant",
      icon: Search,
      tone: "bg-[linear-gradient(145deg,#3298aa,#25798d)] shadow-[0_7px_16px_rgba(37,121,141,0.18)]",
      comingSoon: true,
    },
  ];
  const deadlines = [
    ["Assignment Report (LO3)", "Due 15 July at 23:59", "2 days left"],
    ["Lab Report - Validation", "Due 18 July at 23:59", "5 days left"],
    ["LiveLab Task - DOM", "Due 20 July at 18:00", "7 days left"],
  ];
  const submissions = [
    ["Task 1 Report - LO2 & LO3", "Submitted 2h ago", "Under Review"],
    ["Lab Report - Validation", "Submitted 1d ago", "Submitted"],
    ["LiveLab Task - DOM Manipulation", "Submitted 2d ago", "Reviewed"],
  ];

  return (
    <div className="student-dashboard grid gap-4 2xl:gap-5">
      <section className="relative overflow-hidden rounded-[24px] border border-[color:var(--border-emerald)] bg-[linear-gradient(180deg,#10201a_0%,#0b1915_48%,#040c0c_100%)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.36),0_0_70px_rgba(50,245,154,0.08)] backdrop-blur light:border-slate-200/80 light:bg-[linear-gradient(180deg,#f6fcf2_0%,#f5fcf2_50%,#f4fcef_100%)] light:shadow-[0_20px_54px_rgba(33,45,74,0.08)]">
        <div className="absolute inset-0 bg-transparent" />
        <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)] lg:items-stretch">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-300 light:text-slate-700">
              Welcome back,{" "}
              <span className="font-semibold text-[var(--brand-emerald)] light:text-emerald-700">
                Ayat!
              </span>{" "}
              👋
            </p>
            <h1 className="mt-2 max-w-3xl text-2xl font-semibold tracking-normal text-[var(--foreground)] sm:text-3xl light:text-slate-950">
              Here&apos;s your{" "}
              <span className="text-[var(--brand-lime)] light:text-emerald-600">
                academic work for today
              </span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-400 light:text-slate-600">
              Review your deadlines, continue your lab work, and check your
              latest feedback.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/student/code-lab"
                className="student-hero-primary nexora-focus inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-[rgba(217,255,87,0.58)] bg-[linear-gradient(135deg,#d9ff57_0%,#6cf6b3_46%,#32f59a_100%)] px-4 text-sm font-semibold text-[#07100b] shadow-[0_14px_42px_rgba(50,245,154,0.22)] transition hover:brightness-110 sm:w-auto light:border-emerald-800 light:bg-[linear-gradient(135deg,#087a49_0%,#0aa75f_58%,#16bb70_100%)] light:text-white light:shadow-[0_10px_24px_rgba(7,122,73,0.2)]"
              >
                Resume lab
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/student/assignments"
                className="nexora-focus inline-flex h-9 w-full items-center justify-center rounded-xl border border-[var(--line)] bg-[rgba(18,24,21,0.72)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[color:var(--border-emerald)] sm:w-auto light:bg-white/88 light:text-[#15251f]"
              >
                View deadlines
              </Link>
            </div>
          </div>

          <AcademicHeroVisual />
        </div>
      </section>

      <nav
        aria-label="Quick actions"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6"
      >
        {quickActions.map(
          ({ title, detail, href, icon: Icon, tone, comingSoon }) => (
            <Link
              key={title}
              href={href}
              className="quick-action-card nexora-focus group flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-elevated)] px-3 py-3 shadow-[var(--shadow-command)] transition hover:border-[var(--line-strong)]"
            >
              <span
                className={`quick-action-icon relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl text-white ${tone}`}
              >
                <Icon
                  className="quick-action-glyph relative z-10 h-5 w-5 text-white"
                  aria-hidden="true"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="quick-action-title block truncate text-xs font-semibold text-[var(--foreground)]">
                    {title}
                  </span>
                  {comingSoon ? (
                    <span className="shrink-0 rounded-full bg-white/8 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-slate-400 light:bg-slate-100 light:text-slate-500">
                      Soon
                    </span>
                  ) : null}
                </span>
                <span className="quick-action-detail mt-1 block truncate text-[11px] text-[var(--text-muted)]">
                  {detail}
                </span>
              </span>
              <ChevronRight className="quick-action-chevron h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
            </Link>
          ),
        )}
      </nav>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 2xl:gap-4">
        {data.stats.map((stat, index) => {
          const Icon = statIcons[index] ?? Activity;
          return (
            <section
              key={stat.label}
              className="student-standard-card relative min-w-0 overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,21,0.88)_0%,rgba(9,13,11,0.92)_100%)] p-3 shadow-[0_18px_44px_rgba(0,0,0,0.26)] light:border-slate-200/80 light:bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_100%)] light:shadow-[0_18px_44px_rgba(33,45,74,0.07)]"
            >
              <div className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[rgba(50,245,154,0.14)] blur-2xl light:bg-emerald-100/70" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)] light:text-slate-900">
                    {stat.label}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-semibold text-[var(--brand-emerald)] light:text-emerald-600">
                    {stat.value}
                  </p>
                </div>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] text-[var(--brand-lime)] light:border-transparent light:bg-emerald-50 light:text-emerald-600">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <div className="relative mt-1.5 flex min-w-0 items-center justify-between gap-2 sm:gap-3">
                <p className="min-w-0 truncate text-xs text-slate-400 light:text-slate-500">
                  {stat.trend}
                </p>
                <MiniSparkline
                  variant={index}
                  tone={
                    index === 2 ? "amber" : index === 3 ? "violet" : "emerald"
                  }
                />
              </div>
            </section>
          );
        })}
        <section className="student-standard-card relative min-w-0 overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,21,0.88)_0%,rgba(9,13,11,0.92)_100%)] p-3 shadow-[0_18px_44px_rgba(0,0,0,0.26)] light:border-slate-200/80 light:bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_100%)] light:shadow-[0_18px_44px_rgba(33,45,74,0.07)]">
          <div className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-violet-500/12 blur-2xl light:bg-violet-100/70" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--foreground)] light:text-slate-900">
                Weekly Goal Progress
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[#a78bfa] light:text-violet-600">
                75%
              </p>
            </div>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-violet-300/20 bg-violet-500/10 text-violet-300 light:border-transparent light:bg-violet-50 light:text-violet-600">
              <Target className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>
          <div className="relative mt-1">
            <p className="text-[11px] text-slate-400 light:text-slate-500">
              You&apos;ve completed most of this week&apos;s planned work.
            </p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/8 light:bg-slate-200">
              <div className="h-full w-3/4 rounded-full bg-[linear-gradient(90deg,#8b5cf6,#6cf6b3)]" />
            </div>
            <p className="mt-1 text-[11px] text-slate-400 light:text-slate-500">
              6 of 8 planned tasks complete
            </p>
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:gap-5 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_minmax(340px,0.75fr)]">
        <WorkflowTimeline items={data.workflows} />

        <DashboardCard
          title="Weekly Progress"
          detail="A summary of your coursework, labs, and feedback this week."
          icon={CalendarDays}
          tone="emerald"
        >
          <div className="h-32 min-w-0">
            <ThroughputChart />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {[
              ["3", "Due this week"],
              ["2", "Feedback notes"],
              ["6/8", "Weekly tasks"],
              ["4h 12m", "Study time"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl border border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.08)] px-1.5 py-1.5 text-center light:border-transparent light:bg-emerald-50/80"
              >
                <p className="font-mono text-base font-semibold text-[var(--brand-lime)] light:text-emerald-700">
                  {value}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-slate-400 light:text-slate-600">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Skills Overview"
          detail="How your recent work is contributing to key academic and technical skills."
          icon={ChartNoAxesCombined}
          tone="violet"
          className="lg:col-span-2 xl:col-span-1"
        >
          <div className="h-36">
            <SkillRadarChart data={data.skillData} />
          </div>
        </DashboardCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:gap-5 2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(380px,1fr)]">
        <StudentListCard
          title="Upcoming Deadlines"
          icon={CalendarClock}
          rows={deadlines}
          action="View all deadlines"
          href="/student/assignments"
        />
        <StudentListCard
          title="Recent Submissions"
          icon={ClipboardCheck}
          rows={submissions}
          action="View all submissions"
          href="/student/submissions"
        />
        <div className="lg:col-span-2 xl:col-span-1">
          <StudentAssistantPanel activity={data.activity} />
        </div>
      </div>
    </div>
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
        sizes="(min-width: 1024px) 400px, 100vw"
        className="z-0 object-cover object-right light:hidden"
      />
      <Image
        src="/dashboard/nexora-ai-assistant.png"
        alt=""
        fill
        priority
        unoptimized
        sizes="(min-width: 1024px) 400px, 100vw"
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
