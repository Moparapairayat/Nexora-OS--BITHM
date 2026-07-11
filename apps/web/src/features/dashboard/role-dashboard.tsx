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
  ClipboardCheck,
  FileText,
  FlaskConical,
  ShieldAlert,
  Sparkles,
  Send,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
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

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
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
  const deadlines = [
    ["Assignment Report (LO3)", "Submit by May 25, 2025", "2 days left"],
    ["Lab Report - Validation", "Submit by May 28, 2025", "5 days left"],
    ["LiveLab Task - DOM", "Submit by May 30, 2025", "7 days left"],
  ];
  const submissions = [
    ["Task 1 Report - LO2 & LO3", "Submitted 2h ago", "Under Review"],
    ["Lab Report - Validation", "Submitted 1d ago", "Submitted"],
    ["LiveLab Task - DOM Manipulation", "Submitted 2d ago", "Reviewed"],
  ];

  return (
    <div className="grid gap-4 sm:gap-5">
      <section className="relative overflow-hidden rounded-[24px] border border-[color:var(--border-emerald)] bg-[linear-gradient(145deg,rgba(18,24,21,0.94)_0%,rgba(9,13,11,0.9)_48%,rgba(5,7,6,0.96)_100%)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.36),0_0_70px_rgba(50,245,154,0.08)] backdrop-blur sm:p-6 light:border-slate-200/80 light:bg-[linear-gradient(145deg,#ffffff_0%,#f4fff6_56%,#ffffff_100%)] light:shadow-[0_20px_54px_rgba(33,45,74,0.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(50,245,154,0.17),transparent_34%),radial-gradient(circle_at_90%_12%,rgba(217,255,87,0.14),transparent_24%),linear-gradient(120deg,rgba(138,95,61,0.12),transparent_42%)] light:bg-[radial-gradient(circle_at_78%_24%,rgba(11,191,106,0.15),transparent_34%),radial-gradient(circle_at_90%_12%,rgba(184,243,79,0.16),transparent_24%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,430px)] lg:items-center">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-300 light:text-slate-700">
              Welcome back
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-normal text-[var(--foreground)] sm:text-5xl light:text-slate-950">
              Your{" "}
              <span className="text-[var(--brand-lime)] light:text-emerald-600">
                work for today
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 light:text-slate-600">
              Check upcoming deadlines, continue your lab work, and review
              recent feedback.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                className="h-11 w-full rounded-2xl sm:w-auto"
              >
                Open next task
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-11 w-full rounded-2xl sm:w-auto"
              >
                View timeline
              </Button>
            </div>
          </div>

          <AcademicHeroVisual />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat, index) => {
          const Icon = statIcons[index] ?? Activity;
          return (
            <section
              key={stat.label}
              className="relative min-w-0 overflow-hidden rounded-[22px] border border-[color:var(--border-emerald)] bg-[linear-gradient(180deg,rgba(18,24,21,0.88)_0%,rgba(9,13,11,0.92)_100%)] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.3),0_0_42px_rgba(50,245,154,0.055)] sm:p-5 light:border-slate-200/80 light:bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_100%)] light:shadow-[0_18px_44px_rgba(33,45,74,0.07)]"
            >
              <div className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[rgba(50,245,154,0.14)] blur-2xl light:bg-emerald-100/70" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)] light:text-slate-900">
                    {stat.label}
                  </p>
                  <p className="mt-3 font-mono text-3xl font-semibold text-[var(--brand-emerald)] sm:text-4xl light:text-emerald-600">
                    {stat.value}
                  </p>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] text-[var(--brand-lime)] light:border-transparent light:bg-emerald-50 light:text-emerald-600">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
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
      </div>

      <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_minmax(340px,0.75fr)]">
        <WorkflowTimeline items={data.workflows} />

        <DashboardCard
          title="This Week's Activity"
          detail="Assignments, labs and feedback updated this week."
          icon={CalendarDays}
          tone="emerald"
        >
          <div className="h-56 min-w-0">
            <ThroughputChart />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["14", "Assignments"],
              ["9", "Feedback"],
              ["87%", "Completion"],
              ["4.2h", "Study Time"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.08)] px-3 py-3 text-center light:border-transparent light:bg-emerald-50/80"
              >
                <p className="font-mono text-lg font-semibold text-[var(--brand-lime)] light:text-emerald-700">
                  {value}
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-400 light:text-slate-600">
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
          className="lg:col-span-2 2xl:col-span-1"
        >
          <div className="h-64">
            <SkillRadarChart data={data.skillData} />
          </div>
        </DashboardCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(380px,1fr)]">
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
        <div className="lg:col-span-2 2xl:col-span-1">
          <StudentAssistantPanel activity={data.activity} />
        </div>
      </div>
    </div>
  );
}

function AcademicHeroVisual() {
  return (
    <div className="relative min-h-[220px] min-w-0 overflow-hidden rounded-[28px] border border-[color:var(--border-emerald)] bg-[linear-gradient(145deg,rgba(5,7,6,0.92)_0%,rgba(13,17,16,0.9)_48%,rgba(18,24,21,0.82)_100%)] p-3 shadow-[inset_0_1px_0_rgba(245,247,242,0.08),0_20px_60px_rgba(0,0,0,0.28),0_0_42px_rgba(50,245,154,0.08)] sm:p-5 light:border-emerald-100 light:bg-[linear-gradient(145deg,#f7fff9_0%,#e8fff0_46%,#ffffff_100%)] light:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_20px_50px_rgba(11,191,106,0.12)]">
      <div className="absolute left-10 top-10 h-28 w-28 rounded-full bg-[rgba(217,255,87,0.18)] blur-3xl light:bg-lime-200/70" />
      <div className="absolute right-8 top-6 h-36 w-36 rounded-full bg-[rgba(50,245,154,0.18)] blur-3xl light:bg-emerald-300/30" />
      <div className="relative mx-auto mt-3 w-full max-w-72">
        <div className="absolute left-10 top-8 h-28 w-40 rotate-[-10deg] rounded-[24px] bg-emerald-300 shadow-[0_20px_48px_rgba(7,154,86,0.16)]" />
        <div className="absolute left-20 top-3 h-32 w-44 rotate-[8deg] rounded-[24px] bg-lime-200 shadow-[0_20px_48px_rgba(7,154,86,0.12)]" />
        <div className="relative mx-auto h-36 w-48 rounded-[26px] border border-white/80 bg-[linear-gradient(145deg,#05a95b,#39e2a1)] p-4 text-white shadow-[0_24px_54px_rgba(7,154,86,0.24)]">
          <div className="flex items-center justify-between">
            <span className="h-2 w-14 rounded-full bg-white/60" />
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="mt-8 grid gap-2">
            <span className="h-2 rounded-full bg-white/75" />
            <span className="h-2 w-3/4 rounded-full bg-white/45" />
            <span className="h-2 w-1/2 rounded-full bg-white/35" />
          </div>
        </div>
      </div>
      <div className="absolute left-5 top-8 rounded-2xl border border-[color:var(--border-emerald)] bg-[rgba(18,24,21,0.78)] p-3 shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur light:border-emerald-100 light:bg-white/90 light:shadow-[0_14px_30px_rgba(33,45,74,0.08)]">
        <FileText
          className="h-5 w-5 text-[var(--brand-lime)] light:text-emerald-600"
          aria-hidden="true"
        />
      </div>
      <div className="absolute right-6 top-10 rounded-2xl border border-[color:var(--border-lime)] bg-[rgba(18,24,21,0.78)] p-3 shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur light:border-lime-100 light:bg-white/90 light:shadow-[0_14px_30px_rgba(33,45,74,0.08)]">
        <Sparkles
          className="h-5 w-5 text-[var(--brand-lime)] light:text-emerald-600"
          aria-hidden="true"
        />
      </div>
      <div className="absolute bottom-5 left-7 rounded-2xl border border-white/10 bg-[rgba(18,24,21,0.82)] px-4 py-3 shadow-[0_14px_34px_rgba(0,0,0,0.24)] backdrop-blur light:border-slate-200 light:bg-white/92 light:shadow-[0_14px_30px_rgba(33,45,74,0.08)]">
        <p className="text-xs font-semibold text-[var(--foreground)] light:text-slate-900">
          AcademicShield
        </p>
        <p className="mt-1 text-[11px] text-[var(--brand-emerald)] light:text-emerald-700">
          Originality clear
        </p>
      </div>
      <div className="absolute bottom-5 right-6 rounded-2xl border border-white/10 bg-[rgba(18,24,21,0.82)] px-4 py-3 shadow-[0_14px_34px_rgba(0,0,0,0.24)] backdrop-blur light:border-slate-200 light:bg-white/92 light:shadow-[0_14px_30px_rgba(33,45,74,0.08)]">
        <p className="text-xs font-semibold text-[var(--foreground)] light:text-slate-900">
          LiveLab
        </p>
        <p className="mt-1 text-[11px] text-[#ffd29b] light:text-amber-600">
          1 fix pending
        </p>
      </div>
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
    <section className="min-w-0 rounded-[22px] border border-[color:var(--border-emerald)] bg-[linear-gradient(180deg,rgba(18,24,21,0.88)_0%,rgba(9,13,11,0.92)_100%)] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.3),0_0_42px_rgba(50,245,154,0.055)] sm:p-5 light:border-slate-200/80 light:bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_100%)] light:shadow-[0_18px_44px_rgba(33,45,74,0.07)]">
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
      <div className="mt-5 grid gap-3">
        {rows.map(([name, detail, status]) => (
          <div
            key={name}
            className="grid grid-cols-[34px_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-3 sm:grid-cols-[34px_minmax(0,1fr)_auto] light:border-slate-200 light:bg-slate-50/70"
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-black/20 text-slate-300 shadow-sm light:border-transparent light:bg-white light:text-slate-500">
              <FileText className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--foreground)] light:text-slate-900">
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
        className="nexora-focus mt-5 inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-[var(--brand-lime)] transition hover:text-[var(--brand-emerald)] light:text-emerald-700 light:hover:text-emerald-900"
      >
        {action}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </section>
  );
}

function StudentAssistantPanel({ activity }: { activity: string[] }) {
  return (
    <section className="min-w-0 rounded-[22px] border border-[color:var(--border-emerald)] bg-[linear-gradient(180deg,rgba(18,24,21,0.88)_0%,rgba(9,13,11,0.92)_100%)] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.3),0_0_42px_rgba(50,245,154,0.055)] sm:p-5 light:border-slate-200/80 light:bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_100%)] light:shadow-[0_18px_44px_rgba(33,45,74,0.07)]">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-2xl border border-[color:var(--border-lime)] bg-[rgba(217,255,87,0.10)] text-[var(--brand-lime)] light:border-transparent light:bg-violet-50 light:text-violet-600">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)] light:text-slate-950">
            AI Assistant
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-500">
            How can I help you today?
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
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
            className="nexora-focus rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-[color:var(--border-emerald)] hover:bg-[rgba(50,245,154,0.08)] hover:text-[var(--brand-lime)] light:border-slate-200 light:bg-white light:text-slate-700 light:hover:border-emerald-100 light:hover:bg-emerald-50 light:hover:text-emerald-700"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-2">
        {activity.slice(0, 2).map((item) => (
          <p
            key={item}
            className="rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs leading-5 text-slate-300 light:border-transparent light:bg-slate-50 light:text-slate-600"
          >
            {item}
          </p>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 shadow-[inset_0_1px_0_rgba(245,247,242,0.05)] light:border-slate-200 light:bg-white light:shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <span className="min-w-0 flex-1 text-sm text-slate-500 light:text-slate-400">
          Ask anything...
        </span>
        <Button type="button" className="h-10 w-10 rounded-xl px-0">
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
