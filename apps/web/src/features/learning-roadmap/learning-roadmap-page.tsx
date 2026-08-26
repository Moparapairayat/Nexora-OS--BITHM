"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  BrainCircuit,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  Database,
  Download,
  ExternalLink,
  FileCode2,
  FileText,
  Fingerprint,
  Flame,
  GitBranch,
  GraduationCap,
  Layers,
  Lightbulb,
  Lock,
  LockKeyhole,
  Milestone,
  Play,
  Radar,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { roleDashboards, type AppRole } from "@/data/dashboard.mock";
import { cn } from "@/lib/utils";

interface SkillMetric {
  name: string;
  score: number;
  color: string;
}

export function LearningRoadmapPage({ role = "student" }: { role?: AppRole }) {
  const data = roleDashboards[role] ?? roleDashboards.student;

  const skillsList: SkillMetric[] = [
    { name: "React 19 & Next.js Ecosystem", score: 92, color: "bg-emerald-400" },
    { name: "JavaScript DOM & Form Validation", score: 96, color: "bg-emerald-400" },
    { name: "PostgreSQL & Database Normalization", score: 84, color: "bg-emerald-400" },
    { name: "Backend APIs & Express Controllers", score: 76, color: "bg-cyan-400" },
    { name: "Data Structures & Big-O Complexity", score: 68, color: "bg-amber-400" },
    { name: "Academic Integrity & Research", score: 98, color: "bg-emerald-400" },
  ];

  return (
    <AppShell
      role={role}
      title="Personalized Learning Roadmap"
      subtitle="Step-by-step curriculum milestones and personalized path to your dream engineering role."
      nav={data.nav}
      navGroups={data.navGroups}
      accountEmail={data.accountEmail}
    >
      <div className="student-dashboard max-w-[1500px] mx-auto w-full min-w-0 pb-12 space-y-6">
        {/* Top Floating App Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 text-slate-950 font-black shadow-[0_0_20px_rgba(50,245,154,0.3)]">
              <CompassIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Nexora<span className="text-emerald-500">Pilot</span>
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  AI Milestone Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalized curriculum progression & target role alignment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/student/skill-dna"
              className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300 dark:border-white/10 dark:bg-[#121715] dark:text-slate-200 dark:hover:bg-white/5"
            >
              <Radar className="h-3.5 w-3.5 text-emerald-500" />
              View Skill DNA
            </Link>
            <Link
              href="/student/code-lab"
              className="bento-primary-btn inline-flex h-9.5 items-center gap-2 rounded-xl border border-emerald-400/40 bg-[#044b3b] px-4 text-xs font-bold !text-white shadow-[0_4px_16px_rgba(4,75,59,0.38)] transition hover:bg-[#033b2e] hover:border-emerald-300/60 active:scale-[0.98]"
            >
              <Play className="h-3.5 w-3.5 fill-white !text-white" />
              <span className="!text-white font-bold">Practice in CodeLab</span>
            </Link>
          </div>
        </div>

        {/* Master Dual-Panel Canvas (CareerPilot Master Layout) */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* ========================================================================= */}
          {/* LEFT PANEL (5 Cols / 42%): "YOUR LEARNING SNAPSHOT"                       */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Your Learning<br />Snapshot
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Real-time overview of your coursework pacing and milestone readiness.
              </p>
            </div>

            {/* 1. Hero Circular Readiness Card */}
            <div className="relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-[#121715]">
              <div className="flex items-center gap-4 sm:gap-5">
                {/* Neon Circular Progress Meter */}
                <div className="relative grid h-20 w-20 sm:h-24 sm:w-24 shrink-0 place-items-center">
                  <svg className="h-full w-full -rotate-90 select-none" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-slate-100 dark:text-white/10"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-emerald-500 transition-all duration-1000 ease-out"
                      strokeWidth="10"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - 0.85)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      85<span className="text-sm font-bold text-emerald-500">%</span>
                    </span>
                  </div>
                </div>

                {/* Hero Description */}
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    CAREER & DEGREE ROADMAP
                  </span>
                  <h3 className="mt-0.5 text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    You&apos;re on the right track! 🚀
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Keep building your practical skills to reach your Distinction goal faster.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Two Compact Sub-Metrics (Estimated Timeline & Top Skill Gap) */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* Pod 1: Timeline */}
              <div className="rounded-[20px] border border-slate-200/80 bg-white/90 p-4 dark:border-white/10 dark:bg-[#121715]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  ESTIMATED TIMELINE
                </span>
                <p className="mt-1 font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  4 Months
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  To Level 5 HND completion.
                </p>
              </div>

              {/* Pod 2: Top Skill Gap */}
              <div className="rounded-[20px] border border-slate-200/80 bg-white/90 p-4 dark:border-white/10 dark:bg-[#121715]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
                  TOP SKILL FOCUS
                </span>
                <p className="mt-1 text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  Data Structures
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Practice trees to level up.
                </p>
              </div>
            </div>

            {/* 3. Skills Overview Progress List */}
            <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-[#121715]">
              <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-white/10 pb-3 mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                  SKILLS OVERVIEW
                </span>
                <Link
                  href="/student/skill-dna"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1"
                >
                  View Skill DNA <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-3.5">
                {skillsList.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[220px]">
                        {skill.name}
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {skill.score}%
                      </span>
                    </div>
                    {/* Sleek Rounded Progress Pill */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          skill.score >= 90
                            ? "bg-gradient-to-r from-emerald-500 to-lime-400 shadow-[0_0_8px_rgba(50,245,154,0.4)]"
                            : skill.score >= 75
                            ? "bg-cyan-500"
                            : "bg-amber-500"
                        )}
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT PANEL (7 Cols / 58%): "YOUR LEARNING ROADMAP" (Spine Timeline)       */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Your Learning<br />Roadmap
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Personalized milestone pathway to your dream role & target degree.
              </p>
            </div>

            {/* Connected Vertical Milestone Spine */}
            <div className="relative pl-6 sm:pl-8 space-y-5 pt-2">
              {/* Vertical Spine Dashed Line */}
              <div className="absolute left-3.5 sm:left-4.5 top-5 bottom-8 w-0.5 -translate-x-1/2 border-l-2 border-dashed border-emerald-500/40 dark:border-emerald-500/30" />

              {/* NODE 1: Completed Stage */}
              <div className="relative group">
                <div className="absolute -left-6 sm:-left-8 top-3.5 grid h-7 w-7 sm:h-8 sm:w-8 -translate-x-1/2 place-items-center rounded-full bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(50,245,154,0.5)] z-10">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>

                <div className="rounded-[20px] border border-slate-200/80 bg-white/90 p-4 dark:border-white/10 dark:bg-[#121715] shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Level 4 Computing Foundations
                      </h4>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Completed • Distinction Track (100%)
                      </span>
                    </div>
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    </span>
                  </div>
                </div>
              </div>

              {/* NODE 2: Completed Stage */}
              <div className="relative group">
                <div className="absolute -left-6 sm:-left-8 top-3.5 grid h-7 w-7 sm:h-8 sm:w-8 -translate-x-1/2 place-items-center rounded-full bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(50,245,154,0.5)] z-10">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>

                <div className="rounded-[20px] border border-slate-200/80 bg-white/90 p-4 dark:border-white/10 dark:bg-[#121715] shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Unit 04: Web Architecture & Reactive Systems
                      </h4>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Completed • 92% Verified (React 19 & Next.js 16)
                      </span>
                    </div>
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    </span>
                  </div>
                </div>
              </div>

              {/* NODE 3: Active In-Progress Milestone (Expanding Hero Node) */}
              <div className="relative group">
                <div className="absolute -left-6 sm:-left-8 top-5 grid h-7 w-7 sm:h-8 sm:w-8 -translate-x-1/2 place-items-center rounded-full border-2 border-emerald-400 bg-slate-950 text-emerald-400 shadow-[0_0_16px_rgba(50,245,154,0.6)] z-10 animate-pulse">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>

                <div className="rounded-[24px] border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-500/[0.08] via-white to-white p-5 shadow-[0_12px_36px_rgba(8,122,73,0.08)] dark:from-emerald-950/25 dark:via-[#121715] dark:to-[#121715] dark:border-emerald-500/30">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="relative grid h-12 w-12 shrink-0 place-items-center">
                        <svg className="h-full w-full -rotate-90 select-none" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="38" className="text-slate-200 dark:text-white/10" strokeWidth="8" stroke="currentColor" fill="none" />
                          <circle cx="50" cy="50" r="38" className="text-emerald-500" strokeWidth="8" strokeDasharray="238.7" strokeDashoffset={238.7 * (1 - 0.84)} strokeLinecap="round" stroke="currentColor" fill="none" />
                        </svg>
                        <span className="absolute font-mono text-xs font-black text-slate-900 dark:text-white">
                          84%
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                          Unit 16: Database Design & Relational SQL
                        </h4>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                          84% Complete • In Progress
                        </span>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10.5px] font-extrabold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      ACTIVE TERM
                    </span>
                  </div>

                  <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Master PostgreSQL 16 schema design, 3NF normalization, referential integrity constraints, and Prisma ORM migrations.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 dark:border-white/10 pt-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>Faculty: <strong>Prof. Michael Chen</strong></span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Verified in Visualizer</span>
                    </div>

                    <Link
                      href="/student/database-visualizer"
                      className="bento-primary-btn inline-flex h-8.5 items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold !text-white shadow-xs transition hover:brightness-110"
                    >
                      <span>Open Database Visualizer</span>
                      <ArrowRight className="h-3 w-3 !text-white" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* NODE 4: Upcoming / Locked Milestone */}
              <div className="relative group opacity-75 hover:opacity-100 transition-opacity">
                <div className="absolute -left-6 sm:-left-8 top-3.5 grid h-7 w-7 sm:h-8 sm:w-8 -translate-x-1/2 place-items-center rounded-full border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-[#121715] text-slate-400 z-10">
                  <Lock className="h-3.5 w-3.5" />
                </div>

                <div className="rounded-[20px] border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-[#121715]/70 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Unit 19: Data Structures & Algorithmic Logic
                      </h4>
                      <span className="text-xs font-medium text-slate-400">
                        Upcoming • Unlocks in Term 2
                      </span>
                    </div>
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* NODE 5: Upcoming / Locked Milestone */}
              <div className="relative group opacity-75 hover:opacity-100 transition-opacity">
                <div className="absolute -left-6 sm:-left-8 top-3.5 grid h-7 w-7 sm:h-8 sm:w-8 -translate-x-1/2 place-items-center rounded-full border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-[#121715] text-slate-400 z-10">
                  <Lock className="h-3.5 w-3.5" />
                </div>

                <div className="rounded-[20px] border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-[#121715]/70 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Software Engineering Capstone Brief
                      </h4>
                      <span className="text-xs font-medium text-slate-400">
                        Upcoming • Final Assessment
                      </span>
                    </div>
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* NODE 6: Your Dream Role Goal Target */}
              <div className="relative group pt-1">
                <div className="absolute -left-6 sm:-left-8 top-4 grid h-7 w-7 sm:h-8 sm:w-8 -translate-x-1/2 place-items-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-[0_0_16px_rgba(245,158,11,0.5)] z-10">
                  <Target className="h-4 w-4 stroke-[2.5]" />
                </div>

                <div className="rounded-[24px] border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/[0.08] via-white to-white p-4 sm:p-5 dark:from-amber-950/20 dark:via-[#121715] dark:to-[#121715] shadow-xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    YOUR TARGET DESTINATION
                  </span>
                  <h4 className="mt-0.5 text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Junior Full-Stack Software Engineer • BSc (Hons) Degree
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Your ultimate academic milestone and verified industry passport qualification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" />
    </svg>
  );
}
