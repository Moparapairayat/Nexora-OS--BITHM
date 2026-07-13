"use client";

import {
  Activity,
  ArrowRight,
  Bell,
  Bot,
  BookOpen,
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
  AIButton,
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

  useEffect(() => {
    let active = true;

    void apiGet<DashboardRuntimeData>(`/dashboard/${role}`).then((response) => {
      if (active && response) {
        setRuntimeData(response);
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
      {role === "student" ? (
        <StudentAcademicDashboard data={data} />
      ) : (
        <div className="grid gap-5">
          <PageHeader
            eyebrow={roleEyebrow[role]}
            title={data.title}
            subtitle={data.subtitle}
            tone={roleHeroTone[role]}
            action={<AIButton>{roleAction[role]}</AIButton>}
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
      title: "New Assignment",
      detail: "Create assignment",
      href: "/student/assignments",
      icon: FilePlus2,
      tone: "bg-[linear-gradient(145deg,#8b5cf6,#5b35d5)] shadow-[0_8px_18px_rgba(109,69,219,0.28)]",
    },
    {
      title: "Live Coding Lab",
      detail: "Start coding session",
      href: "/student/code-lab",
      icon: Code2,
      tone: "bg-[linear-gradient(145deg,#62d4e9,#25a9c9)] shadow-[0_8px_18px_rgba(37,169,201,0.25)]",
    },
    {
      title: "AI Code Assistant",
      detail: "Get coding help",
      href: "/student/code-doctor",
      icon: Bot,
      tone: "bg-[linear-gradient(145deg,#7777f5,#4e46d7)] shadow-[0_8px_18px_rgba(78,70,215,0.28)]",
    },
    {
      title: "Lab Report",
      detail: "Create new report",
      href: "/student/lab-reports",
      icon: ClipboardCheck,
      tone: "bg-[linear-gradient(145deg,#1db982,#078a5c)] shadow-[0_8px_18px_rgba(7,138,92,0.25)]",
    },
    {
      title: "Check Plagiarism",
      detail: "Verify originality",
      href: "/student/academic-shield",
      icon: ShieldCheck,
      tone: "bg-[linear-gradient(145deg,#f5679a,#df3775)] shadow-[0_8px_18px_rgba(223,55,117,0.24)]",
    },
    {
      title: "Search Documents",
      detail: "Find in resources",
      href: "/student/research-assistant",
      icon: Search,
      tone: "bg-[linear-gradient(145deg,#6689ee,#3c5ed5)] shadow-[0_8px_18px_rgba(60,94,213,0.25)]",
    },
  ];
  const deadlines = [
    ["Assignment Report (LO3)", "Submit by July 15, 2026", "3 days left"],
    ["Lab Report - Validation", "Submit by July 18, 2026", "6 days left"],
    ["LiveLab Task - DOM", "Submit by July 20, 2026", "8 days left"],
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
              Your{" "}
              <span className="text-[var(--brand-lime)] light:text-emerald-600">
                work for today
              </span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-400 light:text-slate-600">
              Check upcoming deadlines, continue your lab work, and review
              recent feedback.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                className="h-9 w-full rounded-xl px-4 sm:w-auto"
              >
                Continue task
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-9 w-full rounded-xl px-4 sm:w-auto"
              >
                Deadlines
              </Button>
            </div>
          </div>

          <AcademicHeroVisual />
        </div>
      </section>

      <nav
        aria-label="Quick actions"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6"
      >
        {quickActions.map(({ title, detail, href, icon: Icon, tone }) => (
          <Link
            key={title}
            href={href}
            className="quick-action-card nexora-focus group flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-elevated)] px-3 py-3 shadow-[var(--shadow-command)] transition hover:border-[var(--line-strong)]"
          >
            <span
              className={`relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl text-white ring-1 ring-white/25 after:absolute after:inset-x-1 after:top-0 after:h-1/2 after:rounded-full after:bg-white/20 after:blur-sm ${tone}`}
            >
              <Icon
                className="relative z-10 h-5 w-5 text-white"
                aria-hidden="true"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="quick-action-title block truncate text-xs font-semibold text-[var(--foreground)]">
                {title}
              </span>
              <span className="quick-action-detail mt-1 block truncate text-[11px] text-[var(--text-muted)]">
                {detail}
              </span>
            </span>
            <ChevronRight className="quick-action-chevron h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
          </Link>
        ))}
      </nav>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 2xl:gap-4">
        {data.stats.map((stat, index) => {
          const Icon = statIcons[index] ?? Activity;
          return (
            <section
              key={stat.label}
              className="relative min-w-0 overflow-hidden rounded-[20px] border border-[color:var(--border-emerald)] bg-[linear-gradient(180deg,rgba(18,24,21,0.88)_0%,rgba(9,13,11,0.92)_100%)] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.3),0_0_42px_rgba(50,245,154,0.055)] light:border-slate-200/80 light:bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_100%)] light:shadow-[0_18px_44px_rgba(33,45,74,0.07)]"
            >
              <div className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[rgba(50,245,154,0.14)] blur-2xl light:bg-emerald-100/70" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)] light:text-slate-900">
                    {stat.label}
                  </p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-[var(--brand-emerald)] sm:text-3xl light:text-emerald-600">
                    {stat.value}
                  </p>
                </div>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] text-[var(--brand-lime)] light:border-transparent light:bg-emerald-50 light:text-emerald-600">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <div className="relative mt-2 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <p className="text-xs text-slate-400 light:text-slate-500">
                  {stat.trend}
                </p>
                <MiniSparkline
                  tone={
                    index === 2 ? "amber" : index === 3 ? "violet" : "emerald"
                  }
                />
              </div>
            </section>
          );
        })}
        <section className="relative min-w-0 overflow-hidden rounded-[20px] border border-[color:var(--border-emerald)] bg-[linear-gradient(180deg,rgba(18,24,21,0.88)_0%,rgba(9,13,11,0.92)_100%)] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.3),0_0_42px_rgba(50,245,154,0.055)] light:border-slate-200/80 light:bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_100%)] light:shadow-[0_18px_44px_rgba(33,45,74,0.07)]">
          <div className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-violet-500/12 blur-2xl light:bg-violet-100/70" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--foreground)] light:text-slate-900">
                Weekly Goal Progress
              </p>
              <p className="mt-2 font-mono text-2xl font-semibold text-[#a78bfa] sm:text-3xl light:text-violet-600">
                75%
              </p>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-violet-300/20 bg-violet-500/10 text-violet-300 light:border-transparent light:bg-violet-50 light:text-violet-600">
              <Target className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>
          <div className="relative mt-2">
            <p className="text-[11px] text-slate-400 light:text-slate-500">
              Keep going — you&apos;re doing well.
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8 light:bg-slate-200">
              <div className="h-full w-3/4 rounded-full bg-[linear-gradient(90deg,#8b5cf6,#6cf6b3)]" />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400 light:text-slate-500">
              6 of 8 tasks completed
            </p>
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:gap-5 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_minmax(340px,0.75fr)]">
        <WorkflowTimeline items={data.workflows} />

        <DashboardCard
          title="This Week's Activity"
          detail="Assignments, labs and feedback updated this week."
          icon={CalendarDays}
          tone="emerald"
        >
          <div className="h-32 min-w-0">
            <ThroughputChart />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {[
              ["14", "Assignments"],
              ["9", "Feedback"],
              ["87%", "Completion"],
              ["4.2h", "Study Time"],
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
          title="Skill DNA Radar"
          detail="Your recent work mapped to academic and technical skills."
          icon={Sparkles}
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
        />
        <StudentListCard
          title="Recent Submissions"
          icon={ClipboardCheck}
          rows={submissions}
          action="View all submissions"
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

function MiniSparkline({ tone }: { tone: "emerald" | "amber" | "violet" }) {
  const color =
    tone === "amber" ? "#f97316" : tone === "violet" ? "#8d6cff" : "#07a75d";

  return (
    <svg viewBox="0 0 92 28" className="h-8 w-24" aria-hidden="true">
      <path
        d="M2 22 C 14 18, 18 16, 28 15 S 42 7, 50 10 S 62 25, 70 15 S 82 12, 90 9"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function StudentListCard({
  title,
  icon: Icon,
  rows,
  action,
}: {
  title: string;
  icon: LucideIcon;
  rows: string[][];
  action: string;
}) {
  return (
    <section className="min-w-0 rounded-[20px] border border-[color:var(--border-emerald)] bg-[linear-gradient(180deg,rgba(18,24,21,0.88)_0%,rgba(9,13,11,0.92)_100%)] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.3),0_0_42px_rgba(50,245,154,0.055)] light:border-slate-200/80 light:bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_100%)] light:shadow-[0_18px_44px_rgba(33,45,74,0.07)]">
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
      <button
        type="button"
        className="nexora-focus mt-3 inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-[var(--brand-lime)] transition hover:text-[var(--brand-emerald)] light:text-emerald-700 light:hover:text-emerald-900"
      >
        {action}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </section>
  );
}

function StudentAssistantPanel({ activity }: { activity: string[] }) {
  return (
    <section className="min-w-0 rounded-[20px] border border-[color:var(--border-emerald)] bg-[linear-gradient(180deg,rgba(18,24,21,0.88)_0%,rgba(9,13,11,0.92)_100%)] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.3),0_0_42px_rgba(50,245,154,0.055)] light:border-slate-200/80 light:bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_100%)] light:shadow-[0_18px_44px_rgba(33,45,74,0.07)]">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-2xl border border-[color:var(--border-lime)] bg-[rgba(217,255,87,0.10)] text-[var(--brand-lime)] light:border-transparent light:bg-violet-50 light:text-violet-600">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--foreground)] light:text-slate-950">
              AI Assistant
            </h2>
            <Badge tone="slate">Coming soon</Badge>
          </div>
          <p className="text-xs text-slate-400 light:text-slate-500">
            These tools are not available yet.
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
          Ask anything...
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
