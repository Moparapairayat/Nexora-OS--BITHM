"use client";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  BookOpenCheck,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Cpu,
  Database,
  Download,
  ExternalLink,
  FileCode2,
  FileSearch,
  FileText,
  Fingerprint,
  Flame,
  FlaskConical,
  GraduationCap,
  Layers,
  Lightbulb,
  LockKeyhole,
  Play,
  Radar as RadarIcon,
  Rocket,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/command-primitives";
import { roleDashboards, type AppRole, type Tone } from "@/data/dashboard.mock";
import { cn } from "@/lib/utils";

export function SkillDnaPage({ role = "student" }: { role?: AppRole }) {
  const data = roleDashboards[role] ?? roleDashboards.student;

  const [activeDossier, setActiveDossier] = useState<number>(0);

  const dossiers = [
    {
      term: "3NF Normalization",
      type: "database engineering",
      phonetic: "[THRE-EN-EF NOR-MUH-LY-ZAY-SHUN]",
      definition:
        "A relational database schema design where all attributes are fully functionally dependent on the primary key, eliminating data redundancy.",
      evidence: "Verified in Unit 16 Database Visualizer with PostgreSQL 16.",
      score: 88,
    },
    {
      term: "Server-Side Hydration",
      type: "frontend architecture",
      phonetic: "[HY-DRAY-SHUN]",
      definition:
        "The React 19 process where static HTML generated on the server is converted into a fully interactive DOM with active client event listeners.",
      evidence: "Passed 3/3 hydration test suites in CodeLab Sandbox.",
      score: 92,
    },
    {
      term: "Asymptotic Big-O",
      type: "algorithmic logic",
      phonetic: "[BIG-OH COM-PLEK-SI-TEE]",
      definition:
        "Mathematical notation used to describe the limiting behavior and execution scalability of an algorithm as the input size grows.",
      evidence: "Formal complexity brief approved for Unit 19 Data Structures.",
      score: 72,
    },
  ];

  return (
    <AppShell
      role={role}
      title="Skill DNA & Competency Diagnostic"
      subtitle="Fluently-inspired multi-concentric skill diagnostics, live code performance, and growth points."
      nav={data.nav}
      navGroups={data.navGroups}
      accountEmail={data.accountEmail}
    >
      <div className="student-dashboard max-w-[1550px] mx-auto w-full min-w-0 pb-12 space-y-5">
        {/* 1. Header: Clean App Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 text-white font-black shadow-[0_0_24px_rgba(139,92,246,0.35)]">
              <RadarIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Nexora<span className="text-purple-500">DNA</span>
                </span>
                <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  Fluently Diagnostic Matrix
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-arc technical competency audit & continuous live test validation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/student/learning-roadmap"
              className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300 dark:border-white/10 dark:bg-[#121715] dark:text-slate-200 dark:hover:bg-white/5"
            >
              Learning Roadmap →
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

        {/* 2. Master Fluently Dual-Panel Grid (55:45 Ratio) */}
        <div className="grid gap-5 lg:grid-cols-12 items-start">
          {/* ========================================================================= */}
          {/* LEFT PANEL (7 Cols / 58%): MULTI-CONCENTRIC ARCS & SKILL SPECTRUM         */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. Hero Fluently Diagnostic Card (Multi-Concentric Rainbow Arcs) */}
            <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-[#0f131a]">
              {/* Top Level Stepper Strip (A1, A2, B1, 66%, C1, C2 Style) */}
              <div className="flex items-center justify-between max-w-md mx-auto mb-5 pb-3 border-b border-slate-200/70 dark:border-white/10">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span className="font-mono text-[10.5px] font-bold text-slate-500">L4 Base</span>
                </div>

                <div className="h-0.5 w-4 sm:w-8 bg-slate-200 dark:bg-white/10" />

                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span className="font-mono text-[10.5px] font-bold text-slate-500">Unit 04</span>
                </div>

                <div className="h-0.5 w-4 sm:w-8 bg-slate-200 dark:bg-white/10" />

                {/* Active Level Pill Ring (85%) */}
                <div className="flex items-center gap-1.5 rounded-full border-2 border-purple-500 bg-purple-500/10 px-3 py-1 text-purple-600 dark:text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
                  <span className="font-mono text-xs font-black">84.8%</span>
                </div>

                <div className="h-0.5 w-4 sm:w-8 bg-slate-200 dark:bg-white/10" />

                <div className="flex items-center gap-1 sm:gap-2 opacity-40">
                  <div className="grid h-7 w-7 place-items-center rounded-full border border-slate-300 dark:border-white/20 font-mono text-[11px] font-bold text-slate-400">
                    »
                  </div>
                  <span className="font-mono text-[10.5px] font-semibold text-slate-400">Unit 19</span>
                </div>

                <div className="h-0.5 w-4 sm:w-8 bg-slate-200 dark:bg-white/10" />

                <div className="flex items-center gap-1 sm:gap-2 opacity-40">
                  <div className="grid h-7 w-7 place-items-center rounded-full border border-slate-300 dark:border-white/20 font-mono text-[11px] font-bold text-slate-400">
                    ★
                  </div>
                  <span className="font-mono text-[10.5px] font-semibold text-slate-400">BSc Degree</span>
                </div>
              </div>

              {/* Current Level Title */}
              <div className="text-center">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                  CURRENT TECHNICAL TIER
                </span>
                <h3 className="mt-0.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Advanced Practitioner <span className="text-purple-500 dark:text-purple-400 font-extrabold">(Level 5 Distinction Track)</span>
                </h3>
              </div>

              {/* Fluently Rainbow Multi-Concentric Semicircular Arcs */}
              <div className="relative my-4 flex flex-col items-center justify-center">
                <svg viewBox="0 0 400 220" className="w-full max-w-[420px] h-auto select-none overflow-visible">
                  <defs>
                    <linearGradient id="arc-yellow" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                    <linearGradient id="arc-magenta" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                    <linearGradient id="arc-cyan" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                    <linearGradient id="arc-emerald" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                    <linearGradient id="arc-purple" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>

                  {/* Arc 1: Outermost (Frontend 92% - Yellow/Gold) */}
                  <path d="M 40 200 A 160 160 0 0 1 360 200" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" className="text-slate-100 dark:text-white/5" />
                  <path d="M 40 200 A 160 160 0 0 1 346 138" fill="none" stroke="url(#arc-yellow)" strokeWidth="16" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]" />

                  {/* Arc 2: (DOM & Reactive State 96% - Neon Pink/Magenta) */}
                  <path d="M 70 200 A 130 130 0 0 1 330 200" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" className="text-slate-100 dark:text-white/5" />
                  <path d="M 70 200 A 130 130 0 0 1 324 162" fill="none" stroke="url(#arc-magenta)" strokeWidth="16" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]" />

                  {/* Arc 3: (PostgreSQL & Database 84% - Cyan) */}
                  <path d="M 100 200 A 100 100 0 0 1 300 200" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" className="text-slate-100 dark:text-white/5" />
                  <path d="M 100 200 A 100 100 0 0 1 285 145" fill="none" stroke="url(#arc-cyan)" strokeWidth="16" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]" />

                  {/* Arc 4: (Backend APIs 76% - Emerald) */}
                  <path d="M 130 200 A 70 70 0 0 1 270 200" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" className="text-slate-100 dark:text-white/5" />
                  <path d="M 130 200 A 70 70 0 0 1 248 152" fill="none" stroke="url(#arc-emerald)" strokeWidth="16" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" />

                  {/* Arc 5: Innermost (Algorithms 68% - Purple) */}
                  <path d="M 160 200 A 40 40 0 0 1 240 200" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" className="text-slate-100 dark:text-white/5" />
                  <path d="M 160 200 A 40 40 0 0 1 223 167" fill="none" stroke="url(#arc-purple)" strokeWidth="16" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]" />
                </svg>

                {/* Dynamic Callout Tags around the Arc (Fluently Exact Style) */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full pt-2 text-center text-xs">
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 dark:border-amber-500/30">
                    <span className="font-mono text-base font-black text-amber-500">92%</span>
                    <p className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 truncate">Frontend</p>
                  </div>

                  <div className="rounded-xl border border-pink-500/20 bg-pink-500/10 p-2 dark:border-pink-500/30">
                    <span className="font-mono text-base font-black text-pink-500">96%</span>
                    <p className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 truncate">DOM & State</p>
                  </div>

                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2 dark:border-cyan-500/30">
                    <span className="font-mono text-base font-black text-cyan-500">84%</span>
                    <p className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 truncate">Databases</p>
                  </div>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 dark:border-emerald-500/30">
                    <span className="font-mono text-base font-black text-emerald-500">76%</span>
                    <p className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 truncate">Backend APIs</p>
                  </div>

                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2 dark:border-purple-500/30">
                    <span className="font-mono text-base font-black text-purple-500">68%</span>
                    <p className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 truncate">Algorithms</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Fluently Vocabulary / Skill Distribution Spectrum */}
            <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-[#0f131a]">
              <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-white/10 pb-3 mb-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Syllabus Mastery Distribution
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Active competencies mapped across Higher National Diploma tiers
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                  18 Learning Outcomes
                </span>
              </div>

              {/* Segmented Distribution Spectrum Bar (Orange, Cyan, Magenta, Purple, Blue) */}
              <div className="flex h-3 w-full overflow-hidden rounded-full gap-1 p-0.5 bg-slate-100 dark:bg-white/5">
                <div className="h-full rounded-full bg-amber-400 w-[8%]" title="Level 4 (8%)" />
                <div className="h-full rounded-full bg-cyan-400 w-[18%]" title="Level 5 Core (18%)" />
                <div className="h-full rounded-full bg-emerald-400 w-[44%]" title="Level 5 Advanced (44%)" />
                <div className="h-full rounded-full bg-purple-500 w-[20%]" title="Level 6 Ready (20%)" />
                <div className="h-full rounded-full bg-pink-500 w-[10%]" title="Mastery (10%)" />
              </div>

              {/* Spectrum Key Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">L4 Base (8%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">L5 Core (18%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Advanced (44%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">L6 Ready (20%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-pink-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Mastery (10%)</span>
                </div>
              </div>
            </div>

            {/* 3. Fluently Featured Competency Dossier Card (Interactive Word/Concept) */}
            <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-[#0f131a]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  MY VERIFIED COMPETENCY DOSSIER
                </span>
                <div className="flex items-center gap-1">
                  {dossiers.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveDossier(i)}
                      className={cn(
                        "h-2 rounded-full transition-all",
                        activeDossier === i ? "w-6 bg-purple-500" : "w-2 bg-slate-200 dark:bg-white/20"
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h5 className="text-lg font-black text-slate-900 dark:text-white">
                      {dossiers[activeDossier].term}
                    </h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="rounded-md bg-purple-500/10 px-2 py-0.5 font-mono text-[10.5px] font-bold text-purple-600 dark:text-purple-400">
                        {dossiers[activeDossier].type}
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        {dossiers[activeDossier].phonetic}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {dossiers[activeDossier].score}%
                  </span>
                </div>

                <p className="mt-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {dossiers[activeDossier].definition}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-slate-200/80 dark:border-white/10 pt-2.5 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Evidence: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{dossiers[activeDossier].evidence}</strong>
                  </span>
                  <Link
                    href="/student/code-lab"
                    className="font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 inline-flex items-center gap-1"
                  >
                    Run Test <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT PANEL (5 Cols / 42%): GROWTH POINTS, DRILLS & BENCHMARK DENSITY     */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Fluently "Growth Points" Section */}
            <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-[#0f131a]">
              <div className="mb-4">
                <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Growth points
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Work on these topics to improve your overall Nexora DNA score.
                </p>
              </div>

              {/* Group 1: Web Architecture */}
              <div className="space-y-2 mb-4">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Web & Frontend Architecture
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/[0.02]">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      React 19 SSR
                    </p>
                    <span className="text-[10.5px] text-slate-400 font-medium">3/5 lab tests done</span>
                    {/* Segmented Pill Dots (Fluently Style) */}
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((seg) => (
                        <div
                          key={seg}
                          className={cn(
                            "h-1.5 flex-1 rounded-full",
                            seg <= 3 ? "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]" : "bg-slate-200 dark:bg-white/10"
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/[0.02]">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Form Validation
                    </p>
                    <span className="text-[10.5px] text-slate-400 font-medium">5/7 lab tests done</span>
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7].map((seg) => (
                        <div
                          key={seg}
                          className={cn(
                            "h-1.5 flex-1 rounded-full",
                            seg <= 5 ? "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]" : "bg-slate-200 dark:bg-white/10"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: Algorithms & Logic */}
              <div className="space-y-2 mb-4">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Data Structures & Algorithmic Logic
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/[0.02]">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Binary Search Trees
                    </p>
                    <span className="text-[10.5px] text-slate-400 font-medium">2/6 exercises done</span>
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5, 6].map((seg) => (
                        <div
                          key={seg}
                          className={cn(
                            "h-1.5 flex-1 rounded-full",
                            seg <= 2 ? "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]" : "bg-slate-200 dark:bg-white/10"
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/[0.02]">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Hash Map Collisions
                    </p>
                    <span className="text-[10.5px] text-slate-400 font-medium">1/4 exercises done</span>
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4].map((seg) => (
                        <div
                          key={seg}
                          className={cn(
                            "h-1.5 flex-1 rounded-full",
                            seg <= 1 ? "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]" : "bg-slate-200 dark:bg-white/10"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Share / Export Button (Fluently Purple CTA) */}
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-[0_8px_24px_rgba(139,92,246,0.35)] transition hover:brightness-110 active:scale-[0.98]"
              >
                <Share2 className="h-4 w-4" />
                <span>Share Competency Certificate</span>
              </button>
            </div>

            {/* 2. Fluently High-Density Frequency Benchmark (Dense Bars + Cursor Marker) */}
            <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-[#0f131a]">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                LIVE EXECUTION VELOCITY
              </span>
              <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                Your lab test pace is <span className="text-pink-500 font-black">160 runs/month</span>, which is <strong className="text-emerald-500">24% faster</strong> than class cohort median.
              </h4>

              {/* Dense Frequency Strip Visualizer (Fluently Exact Aesthetic) */}
              <div className="mt-4 relative">
                <div className="flex items-end justify-between gap-[2px] h-10 w-full overflow-hidden">
                  {Array.from({ length: 60 }).map((_, idx) => {
                    const isUserCursor = idx === 45;
                    const isOptimal = idx >= 30 && idx <= 42;
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "w-1 rounded-full transition-all",
                          isUserCursor
                            ? "bg-pink-500 h-10 shadow-[0_0_10px_rgba(236,72,153,0.8)] scale-110"
                            : isOptimal
                            ? "bg-cyan-400/80 h-7"
                            : "bg-slate-200 dark:bg-white/15 h-4"
                        )}
                      />
                    );
                  })}
                </div>

                {/* Sub-Legend */}
                <div className="flex items-center justify-between mt-2 text-[10.5px] font-mono text-slate-400">
                  <span>Median: 135-139</span>
                  <span className="text-pink-500 font-black flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-pink-500" />
                    160 (You)
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Academic Integrity Mini Dial */}
            <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-[#0f131a] flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  ACADEMIC INTEGRITY PURITY
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  You have only <strong className="text-emerald-500">2% citation variance</strong>. AcademicShield clean!
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 100% Human Authenticity Verified
                </span>
              </div>

              <div className="relative grid h-16 w-16 shrink-0 place-items-center">
                <svg className="h-full w-full -rotate-90 select-none" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" className="text-slate-100 dark:text-white/10" strokeWidth="8" stroke="currentColor" fill="none" />
                  <circle cx="50" cy="50" r="38" className="text-emerald-500" strokeWidth="8" strokeDasharray="238.7" strokeDashoffset={238.7 * (1 - 0.98)} strokeLinecap="round" stroke="currentColor" fill="none" />
                </svg>
                <span className="absolute font-mono text-sm font-black text-slate-900 dark:text-white">
                  98%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
