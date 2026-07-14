"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Code2,
  Database,
  FileCheck2,
  FlaskConical,
  GraduationCap,
  Layers3,
  ShieldCheck,
  UserCog,
  UsersRound,
} from "lucide-react";

import { NexoraLogo } from "@/components/brand/nexora-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { DemoLoginButtons } from "@/features/auth/demo-login-buttons";
import { PandaCTA } from "@/components/ui/panda-cta";

const cardShape: Record<string, string> = {
  violet: "border-violet-300/30",
  emerald: "border-emerald-300/30",
  cyan: "border-cyan-300/30",
  amber: "border-amber-300/30",
  rose: "border-rose-300/30",
  sky: "border-sky-300/30",
  orange: "border-orange-300/30",
};

const cardRingFrom: Record<string, string> = {
  violet: "from-violet-400/70",
  emerald: "from-emerald-400/70",
  cyan: "from-cyan-400/70",
  amber: "from-amber-400/70",
  rose: "from-rose-400/70",
  sky: "from-sky-400/70",
  orange: "from-orange-400/70",
};

const cardDot: Record<string, string> = {
  violet: "bg-violet-300",
  emerald: "bg-emerald-300",
  cyan: "bg-cyan-300",
  amber: "bg-amber-300",
  rose: "bg-rose-300",
  sky: "bg-sky-300",
  orange: "bg-orange-300",
};

const cardGlow: Record<string, string> = {
  violet: "bg-violet-500/20",
  emerald: "bg-emerald-500/20",
  cyan: "bg-cyan-500/20",
  amber: "bg-amber-500/20",
  rose: "bg-rose-500/20",
  sky: "bg-sky-500/20",
  orange: "bg-orange-500/20",
};

const platformAreas = [
  {
    title: "Student essentials",
    detail: "Your dashboard, updates, and notices in one place.",
    icon: GraduationCap,
    tone: "bg-violet-500/10 text-violet-300 light:bg-violet-50 light:text-violet-700",
    tools: ["Dashboard", "Activity", "Notifications"],
  },
  {
    title: "Academic work",
    detail: "Follow coursework from the first brief to final feedback.",
    icon: BookOpen,
    tone: "bg-emerald-500/10 text-emerald-300 light:bg-emerald-50 light:text-emerald-700",
    tools: [
      "Assignment Reports",
      "Lab Classes",
      "Lab Reports",
      "My Submissions",
      "Teacher Feedback",
    ],
  },
  {
    title: "AI workspace",
    detail: "Planned tools for project planning, code, briefs, and feedback.",
    icon: Layers3,
    tone: "bg-cyan-500/10 text-cyan-300 light:bg-cyan-50 light:text-cyan-700",
    tools: [
      "AI Project Architect",
      "AI Code Doctor",
      "AI Feedback Engine",
      "AI Brief Analyzer",
    ],
  },
  {
    title: "Developer tools",
    detail:
      "Write code, inspect databases, test APIs, and prepare deployments.",
    icon: Code2,
    tone: "bg-amber-500/10 text-amber-300 light:bg-amber-50 light:text-amber-700",
    tools: [
      "Code Lab",
      "Database Visualizer",
      "ERD to Code",
      "API Tester",
      "GitHub Analyzer",
      "Deployment Assistant",
    ],
  },
  {
    title: "ML & data",
    detail: "Prepare datasets and keep machine-learning work organized.",
    icon: Database,
    tone: "bg-rose-500/10 text-rose-300 light:bg-rose-50 light:text-rose-700",
    tools: ["Dataset Manager", "ML Studio", "AutoML Assistant", "ML Reports"],
  },
  {
    title: "Content studio",
    detail: "Work on slides, documentation, research, and scanned documents.",
    icon: FileCheck2,
    tone: "bg-sky-500/10 text-sky-300 light:bg-sky-50 light:text-sky-700",
    tools: [
      "Slide Maker",
      "Documentation Generator",
      "Research Assistant",
      "OCR Document Reader",
    ],
  },
  {
    title: "AcademicShield",
    detail:
      "Check sources, citations, originality, and possible writing risks.",
    icon: ShieldCheck,
    tone: "bg-orange-500/10 text-orange-300 light:bg-orange-50 light:text-orange-700",
    tools: [
      "Plagiarism Checker",
      "Web Source Scan",
      "AI Writing Risk",
      "Academic Rewrite",
      "Citation Generator",
      "Originality Reports",
    ],
  },
  {
    title: "Portfolio & skills",
    detail: "Present completed work and keep track of developing skills.",
    icon: BarChart3,
    tone: "bg-lime-500/10 text-lime-300 light:bg-lime-50 light:text-lime-700",
    tools: [
      "Portfolio Builder",
      "Skill DNA",
      "Learning Roadmap",
      "Achievements",
    ],
  },
  {
    title: "Feedback",
    detail: "Keep teacher comments and requested changes easy to find.",
    icon: UsersRound,
    tone: "bg-fuchsia-500/10 text-fuchsia-300 light:bg-fuchsia-50 light:text-fuchsia-700",
    tools: ["Feedback Center", "Fix Requests"],
  },
];

const workflows = [
  {
    title: "Assignment reports",
    detail:
      "Prepare reports, organize evidence, submit work, and follow its status.",
    icon: FileCheck2,
    label: "Plan · Write · Submit",
  },
  {
    title: "Practical lab work",
    detail:
      "Turn a task brief into tested code and a well-structured lab report.",
    icon: FlaskConical,
    label: "Build · Test · Report",
  },
  {
    title: "Progress and feedback",
    detail:
      "Keep up with deadlines, requested changes, submissions, and progress.",
    icon: BarChart3,
    label: "Review · Improve · Resubmit",
  },
];

const roleCards = [
  {
    title: "Students",
    detail: "Complete coursework and code projects, then follow feedback.",
    icon: GraduationCap,
    tone: "bg-emerald-500/10 text-emerald-300 light:bg-emerald-50 light:text-emerald-700",
  },
  {
    title: "Teachers",
    detail: "Review submissions, oversee lab work, and give useful feedback.",
    icon: UsersRound,
    tone: "bg-cyan-500/10 text-cyan-300 light:bg-cyan-50 light:text-cyan-700",
  },
  {
    title: "Administrators",
    detail: "Manage users, courses, permissions, and day-to-day operations.",
    icon: UserCog,
    tone: "bg-violet-500/10 text-violet-300 light:bg-violet-50 light:text-violet-700",
  },
];

const latestAreas = [
  {
    label: "Available now",
    title: "Code Lab workspace",
    detail:
      "Write and test code with an editor, console, file explorer, and saved drafts.",
    icon: Code2,
  },
  {
    label: "Available now",
    title: "Database Visualizer",
    detail:
      "View DBML, SQL DDL, Prisma, or Mongoose schemas as an interactive ERD.",
    icon: Database,
  },
  {
    label: "Academic integrity",
    title: "AcademicShield",
    detail:
      "Review matched sources, citation gaps, originality, and writing-risk indicators.",
    icon: ShieldCheck,
  },
  {
    label: "Role based",
    title: "Connected dashboards",
    detail: "Each role sees the information and controls relevant to its work.",
    icon: UsersRound,
  },
];

const platformNotes = [
  {
    category: "Student workflow",
    title: "Keep deadlines, submissions, and requested changes in view",
    detail:
      "The dashboard shows current work and teacher feedback without making students search for it.",
  },
  {
    category: "Practical learning",
    title: "Keep practical work and its evidence together",
    detail:
      "Students can complete a practical task in Code Lab and use the result in their report.",
  },
  {
    category: "Clear product status",
    title: "Be clear about what is ready and what is planned",
    detail:
      "Coming Soon pages distinguish available tools from modules that are still being developed.",
  },
];

const workJourney = [
  {
    step: "01",
    title: "Understand the brief",
    detail: "Keep requirements, deadlines, and expected evidence together.",
    icon: BookOpen,
    accent: "from-violet-400 to-fuchsia-400",
  },
  {
    step: "02",
    title: "Build the work",
    detail: "Write the report, complete the lab, or develop the project.",
    icon: Layers3,
    accent: "from-cyan-400 to-emerald-400",
  },
  {
    step: "03",
    title: "Check the evidence",
    detail: "Review code, sources, files, and submission requirements.",
    icon: ShieldCheck,
    accent: "from-amber-300 to-lime-400",
  },
  {
    step: "04",
    title: "Submit with confidence",
    detail: "Send the final work and follow feedback from one clear view.",
    icon: CheckCircle2,
    accent: "from-emerald-400 to-lime-300",
  },
];

const faqs = [
  {
    question: "Who can use Nexora OS?",
    answer:
      "Nexora OS has dedicated workspaces for students, teachers, and administrators. Each role only sees the pages and actions relevant to their work.",
  },
  {
    question: "Can students write and run code in the platform?",
    answer:
      "Yes. Code Lab provides a browser-based editor, console, test workflow, files, and draft saving for practical programming tasks.",
  },
  {
    question: "Does the platform support database design?",
    answer:
      "Yes. Database Visualizer accepts common schema formats and turns them into an interactive relationship diagram that can be inspected and exported.",
  },
  {
    question: "Are all modules available now?",
    answer:
      "Core dashboards and selected tools are available. Modules still in development are clearly marked as Coming Soon instead of showing simulated functionality.",
  },
];

export function LandingPage() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const amount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      sliderRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_50%_0%,rgba(50,245,154,0.13),transparent_42rem),radial-gradient(circle_at_92%_32%,rgba(20,184,108,0.07),transparent_30rem),linear-gradient(180deg,rgba(18,24,21,0.98)_0%,rgba(7,13,10,0.99)_38%,rgba(5,7,6,1)_100%)] text-white light:bg-[radial-gradient(circle_at_10%_7%,rgba(139,92,246,0.08),transparent_24%),radial-gradient(circle_at_88%_14%,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,#fbfdfb_0%,#eff8f3_48%,#f8fbf9_100%)] light:text-[#15251f]">
      <LandingNav />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pb-16 pt-32 sm:pt-36 lg:pb-20">
        <div className="nexora-brand-arc pointer-events-none absolute -left-[500px] top-[-120px] h-[620px] w-[620px] -rotate-12 opacity-75 sm:-left-[455px]" />
        <div className="nexora-brand-arc pointer-events-none absolute -right-[540px] bottom-[-150px] h-[680px] w-[680px] rotate-[148deg] opacity-65 sm:-right-[490px]" />
        <div className="pointer-events-none absolute -left-20 -top-20 z-0 h-[380px] w-[380px] rounded-full bg-emerald-500/10 blur-[130px] light:bg-violet-500/5" />
        <div className="pointer-events-none absolute -right-20 bottom-10 z-0 h-[380px] w-[380px] rounded-full bg-emerald-500/15 blur-[130px] light:bg-emerald-400/8" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 px-5 md:flex-row md:px-8 lg:gap-16">
          <div className="relative w-full max-w-[560px]">
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300 shadow-[0_2px_10px_rgba(16,185,129,0.05)] light:border-emerald-600/15 light:bg-emerald-50 light:text-emerald-700">
                Nexora OS · BITHM Academic Platform
              </span>
            </div>
            <h1 className="text-balance text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-[54px] text-white light:text-slate-800">
              A practical place to{" "}
              <span className="bg-gradient-to-r from-[#d9ff57] to-[#32f59a] bg-clip-text text-transparent light:from-emerald-700 light:to-emerald-500">
                study, build, and submit
              </span>{" "}
              your work.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 light:text-slate-600 sm:text-lg">
              Keep assignments, lab work, coding tools, feedback, and course
              administration close at hand.
            </p>

            <div className="relative mt-8 flex flex-wrap items-center gap-4 z-10">
              <div className="relative inline-block">
                <div className="pointer-events-none absolute top-1/2 -left-6 h-[72px] w-[72px] -translate-y-1/2 rounded-full bg-[#167553]/16 blur-[24px]" />
                <Link
                  href="/login"
                  className="relative z-10 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-300/15 bg-[#087a55] px-6 text-sm font-semibold !text-white shadow-[0_12px_28px_rgba(5,68,46,0.22)] hover:bg-[#066b4a] light:bg-[#087a55] light:!text-white light:hover:bg-[#066b4a]"
                >
                  Open Nexora OS
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <a
                href="#contact"
                className="hk-button !h-12"
              >
                <span>Contact Us</span>
              </a>
            </div>

            <div className="mt-12 flex items-center gap-4 text-sm text-slate-400 light:text-slate-600">
              <div className="flex -space-x-2">
                {["S", "T", "A"].map((initial, index) => (
                  <span
                    key={initial}
                    className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#060907] bg-[linear-gradient(145deg,#d9ff57,#32f59a)] text-xs font-bold text-[#07100b] light:border-[#f8fbf9]"
                    style={{ zIndex: 3 - index }}
                  >
                    {initial}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-emerald-300 light:text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                  Role-based access
                </div>
                <p className="mt-0.5">Students, teachers, and administrators</p>
              </div>
            </div>
          </div>

          <div className="landing-float relative w-full max-w-[660px]">
            <div className="landing-orbit absolute -inset-8 rounded-full border border-emerald-300/10 before:absolute before:left-1/2 before:top-0 before:h-2 before:w-2 before:-translate-y-1/2 before:rounded-full before:bg-emerald-300 before:shadow-[0_0_18px_rgba(110,255,185,0.9)]" />
            <Image
              src="/landing/mentor-modern-1/hero-image.png"
              alt="Student using Nexora OS for academic work"
              width={720}
              height={620}
              priority
              className="relative z-10 h-auto w-full"
            />
          </div>
        </div>
      </section>

      {/* PARTNERS SECTION */}
      <section className="relative z-10 border-b border-white/8 py-10 light:border-emerald-950/8 light:bg-white/30">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent light:via-slate-200" />
            <h2 className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 light:text-slate-600 sm:text-sm">
              Academic pathways supported in Nexora OS
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent light:via-slate-200" />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-4">
            {[
              "/landing/mentor-modern-1/logos/bithm-logo.png",
              "/landing/mentor-modern-1/logos/othm-logo.png",
              "/landing/mentor-modern-1/logos/bithm-shield-logo.png",
              "/landing/mentor-modern-1/logos/standard-logo.png",
              "/landing/mentor-modern-1/logos/logo-4.png",
              "/landing/mentor-modern-1/logos/logo-8.png",
              "/landing/mentor-modern-1/logos/logo-6.png",
              "/landing/mentor-modern-1/logos/logo-7.png",
            ].map((src, index) => {
              const isBithmText = src.includes("bithm-logo.png");
              const isBithmShield = src.includes("bithm-shield-logo.png");
              const isOthm = src.includes("othm-logo.png");
              const isStandard = src.includes("standard-logo.png");
              const isEastTexas = src.includes("logo-4.png");

              let containerClass = "w-[130px] h-12";
              let pxClass = "px-4 py-2";

              if (isBithmText) {
                containerClass = "w-[320px] h-12";
              } else if (isBithmShield) {
                containerClass = "w-[150px] h-12";
              } else if (isOthm) {
                containerClass = "w-[160px] h-12";
              } else if (isStandard) {
                containerClass = "w-[260px] h-14";
              } else if (isEastTexas) {
                containerClass = "w-[240px] h-12";
                pxClass = "px-2 py-1";
              }

              return (
                <div
                  key={index}
                  className={`flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-default bg-white/95 border border-white/5 shadow-sm rounded-2xl light:bg-transparent light:border-transparent light:shadow-none light:p-0 ${pxClass} ${containerClass}`}
                >
                  <Image
                    src={src}
                    alt={`Partner ${index + 1}`}
                    width={320}
                    height={48}
                    unoptimized
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative z-10 overflow-hidden pb-8 pt-14">
        <div className="absolute left-1/2 top-0 h-40 w-[70%] -translate-x-1/2 rounded-full bg-emerald-400/8 blur-3xl light:bg-emerald-300/15" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300 light:text-emerald-700">
            The academic workflow, from start to finish
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {[
              "Assignments",
              "Lab work",
              "Code projects",
              "Feedback",
              "Integrity",
              "Administration",
            ].map((item, index) => (
              <div
                key={item}
                className="flex min-h-14 items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.025] px-3 text-sm font-medium text-slate-300 light:border-emerald-950/8 light:bg-white light:text-slate-700 light:shadow-sm"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-400/10 text-[10px] font-bold text-emerald-300 light:bg-emerald-100 light:text-emerald-700">
                  {index + 1}
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="platform"
        className="relative z-10 overflow-hidden border-t border-white/8 py-14 light:border-emerald-950/8 sm:py-16"
      >
        <div className="absolute -left-32 top-24 h-80 w-80 rounded-full bg-emerald-500/9 blur-[120px]" />
        <div className="absolute -right-32 bottom-16 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Explore Nexora OS"
            title="The tools students use throughout their course"
            detail="Core tools are available now. Modules still in development are clearly marked Coming Soon."
          />
          {/* Slide Arrow Controls */}
          <div className="mt-6 flex items-center justify-end gap-3 px-1">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none light:border-emerald-950/10 light:bg-emerald-50/50 light:text-emerald-800 light:hover:bg-[#e8f3ee]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none light:border-emerald-950/10 light:bg-emerald-50/50 light:text-emerald-800 light:hover:bg-[#e8f3ee]"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="mt-6 flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-6"
          >
            {platformAreas.map(({ title, detail, icon: Icon, tone, tools }) => (
              <article
                key={title}
                className="group relative flex w-[310px] sm:w-[350px] shrink-0 snap-start h-auto flex-col overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-3.5 backdrop-blur-sm transition duration-300 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-emerald-300/55 before:to-transparent hover:-translate-y-0.5 hover:border-emerald-300/25 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] light:border-emerald-950/9 light:bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(241,249,244,0.9))] light:shadow-[0_14px_35px_rgba(31,67,49,0.055)] light:hover:shadow-[0_18px_42px_rgba(31,67,49,0.1)] sm:p-4"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute right-3 top-3 h-14 w-14 rounded-full bg-gradient-to-tr to-transparent p-[2px] ${cardRingFrom[tone.split(" ").find((c) => c.startsWith("bg-"))?.split("-")[1] ?? "emerald"] ?? "from-emerald-400/70"}`}
                >
                  <span className="block h-full w-full rounded-full bg-[#0b120e]/90 light:bg-white/90" />
                </span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute right-5 top-5 h-6 w-6 animate-[spin_16s_linear_infinite] rounded-full border border-dashed ${cardShape[tone.split(" ").find((c) => c.startsWith("bg-"))?.split("-")[1] ?? "emerald"] ?? "border-emerald-300/30"}`}
                >
                  <span className="block h-full w-full rounded-full" />
                </span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute right-[28px] top-[28px] h-1.5 w-1.5 rounded-full ${cardDot[tone.split(" ").find((c) => c.startsWith("bg-"))?.split("-")[1] ?? "emerald"] ?? "bg-emerald-300"}`}
                />
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                 <h3 className="mt-3 text-base font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-5 text-slate-400 light:text-slate-600">
                  {detail}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full border border-white/9 bg-black/15 px-2.5 py-1 text-xs font-medium text-slate-300 light:border-emerald-950/8 light:bg-[#f5f9f6] light:text-slate-700"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/8 text-xs text-slate-400 light:border-emerald-950/8 light:text-slate-600">
                  <span>{tools.length} tools</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 overflow-hidden px-5 py-14 md:px-8 sm:py-16">
        <div className="absolute left-1/2 top-1/2 h-72 w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/8 blur-[100px] light:bg-emerald-300/20" />
        <div className="relative mx-auto max-w-7xl border-y border-white/10 py-8 light:border-emerald-950/10">
          <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <span className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-400/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-300 light:border-emerald-700/15 light:bg-emerald-50 light:text-emerald-700">
                How the work moves
              </span>
              <h2 className="mt-4 max-w-md text-3xl font-bold tracking-tight sm:text-4xl">
                From the first brief to final feedback
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-400 light:text-slate-600">
                Each stage stays easy to follow, so students can see what is
                ready, what needs attention, and what comes next.
              </p>
            </div>
            <div className="grid sm:grid-cols-2">
              {workJourney.map(
                ({ step, title, detail, icon: Icon, accent }) => (
                  <article
                    key={step}
                    className="group relative border-b border-white/8 p-4 odd:sm:border-r light:border-emerald-950/8"
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accent}`}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-[0.16em] text-slate-500">
                        STEP {step}
                      </span>
                      <span className="grid h-9 w-9 place-items-center rounded-full border border-emerald-300/15 text-emerald-300 transition duration-300 group-hover:-rotate-6 group-hover:scale-110 light:border-emerald-700/15 light:text-emerald-700">
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                    <h3 className="mt-5 font-semibold">{title}</h3>
                    <p className="mt-1.5 text-sm leading-5 text-slate-400 light:text-slate-600">
                      {detail}
                    </p>
                  </article>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        id="workflows"
        className="relative overflow-hidden border-y border-white/8 bg-[url('/landing/mentor-modern-1/bg-line.png')] bg-cover bg-center py-14 light:border-emerald-950/8 sm:py-16"
      >
        <div className="absolute inset-0 bg-[#07100b]/88 light:bg-[#f2f8f4]/88" />
        <div className="nexora-flow-line pointer-events-none absolute -left-[8%] top-[24%] h-[300px] w-[112%] -rotate-[7deg]" />
        <div className="pointer-events-none absolute left-[16%] top-[20%] h-56 w-56 rounded-full bg-violet-500/8 blur-[90px] light:bg-violet-500/22" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Core workflows"
            title="A straightforward path from task to submission"
            detail="Keep the steps, files, feedback, and status of each piece of work together."
          />
          <div className="mt-10 grid lg:grid-cols-3">
            {workflows.map(({ title, detail, icon: Icon, label }) => (
              <article
                key={title}
                className="group border-b border-white/10 px-5 py-7 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0 light:border-emerald-950/10"
              >
                <div className="grid h-12 w-12 place-items-center rounded-full border border-emerald-300/20 bg-emerald-400/6 light:border-emerald-700/15 light:bg-emerald-50">
                  <Icon className="h-5 w-5 text-emerald-300 transition duration-300 group-hover:scale-110 light:text-emerald-700" />
                </div>
                <div className="pt-5">
                  <p className="flex items-center gap-2 text-xs text-emerald-300 light:text-emerald-700">
                    <UsersRound className="h-3.5 w-3.5" /> {label}
                  </p>
                  <h3 className="mt-3 text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-5 text-slate-400 light:text-slate-600">
                    {detail}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-emerald-300 light:text-emerald-700">
                      Nexora module
                    </span>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-emerald-300 light:text-slate-600 light:hover:text-emerald-700"
                    >
                      View access <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[url('/landing/mentor-modern-1/bg-line.png')] bg-cover bg-center py-14 sm:py-16">
        <div className="absolute inset-0 bg-[#060907]/90 light:bg-[#f8fbf9]/91" />
        <div className="nexora-flow-line pointer-events-none absolute -right-[14%] bottom-[-18%] h-[340px] w-[86%] rotate-[16deg] opacity-80" />
        <div className="absolute right-[8%] top-10 h-72 w-72 rounded-full bg-emerald-500/13 blur-[110px]" />
        <div className="absolute bottom-4 left-[8%] h-72 w-72 rounded-full bg-cyan-500/8 blur-[110px]" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Inside the platform"
            title="Start with the tools available today"
            detail="These areas are ready to use. Planned modules remain clearly separated until they are complete."
          />
          <div className="mt-10 grid border-y border-white/10 md:grid-cols-2 xl:grid-cols-4 light:border-emerald-950/10">
            {latestAreas.map(({ label, title, detail, icon: Icon }) => (
              <article
                key={title}
                className="group border-b border-white/10 p-5 md:odd:border-r xl:border-b-0 xl:border-r xl:last:border-r-0 light:border-emerald-950/10"
              >
                <div className="grid h-11 w-11 place-items-center rounded-full border border-emerald-300/15 text-emerald-300 light:border-emerald-700/15 light:text-emerald-700">
                  <Icon className="h-5 w-5 text-emerald-300 transition group-hover:scale-110 light:text-emerald-700" />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 light:text-emerald-700">
                  {label}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400 light:text-slate-600">
                  {detail}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="h-2 w-5 rounded-full bg-emerald-400" />
              <span className="h-2 w-2 rounded-full bg-slate-600" />
              <span className="h-2 w-2 rounded-full bg-slate-600" />
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 light:text-emerald-700"
            >
              Open the platform <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="roles"
        className="mx-auto max-w-7xl px-5 py-14 md:px-8 sm:py-16"
      >
        <SectionHeading
          eyebrow="Built for your institution"
          title="A workspace that reflects each role"
          detail="Students, teachers, and administrators use the same system with the controls relevant to their work."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* Card 1: Students */}
          <Link
            href="/login"
            className="group relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[28px] bg-[#FED97B] p-8 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(254,217,123,0.22)]"
          >
            {/* Wavy lines SVG overlay */}
            <svg viewBox="0 0 100 100" fill="none" stroke="rgba(120,80,20,0.18)" strokeWidth="3" strokeLinecap="round" className="absolute top-0 right-0 w-32 h-32 pointer-events-none translate-x-4 -translate-y-4">
              <path d="M30 20 C40 10, 50 30, 60 20 C70 10, 80 30, 90 20" />
              <path d="M25 35 C35 25, 45 45, 55 35 C65 25, 75 45, 85 35" />
              <path d="M20 50 C30 40, 40 60, 50 50 C60 40, 70 60, 80 50" />
            </svg>

            {/* Icon inside circle */}
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-black/7 text-amber-950">
              <GraduationCap className="h-6 w-6 stroke-[1.8]" />
            </div>

            {/* Card Content */}
            <div className="relative z-10 mt-8">
              <h3 className="text-2xl font-bold text-amber-950 tracking-tight">
                Students
              </h3>
              <p className="mt-2 text-sm leading-6 text-amber-900/80 font-medium">
                Complete coursework and code projects, then follow feedback in real-time.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-950">
                Sign in
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* Card 2: Teachers */}
          <Link
            href="/login"
            className="group relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[28px] bg-[#6355E6] p-8 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(99,85,230,0.28)]"
          >
            {/* Topographic contour lines SVG overlay */}
            <svg viewBox="0 0 100 100" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" strokeLinecap="round" className="absolute top-0 right-0 w-32 h-32 pointer-events-none translate-x-4 -translate-y-4">
              <path d="M50 15 C 65 17, 85 35, 85 55 C 85 70, 68 85, 50 85 C 32 85, 15 70, 15 55 C 15 35, 35 15, 50 15 Z" />
              <path d="M50 30 C 60 32, 70 42, 70 55 C 70 64, 58 72, 50 72 C 42 72, 30 64, 30 55 C 30 42, 40 30, 50 30 Z" />
              <path d="M50 45 C 54 46, 58 50, 58 55 C 58 59, 54 62, 50 62 C 46 62, 42 59, 42 55 C 42 50, 46 45, 50 45 Z" />
            </svg>

            {/* Icon inside circle */}
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/12 text-white">
              <UsersRound className="h-6 w-6 stroke-[1.8]" />
            </div>

            {/* Card Content */}
            <div className="relative z-10 mt-8">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Teachers
              </h3>
              <p className="mt-2 text-sm leading-6 text-purple-100/80 font-medium">
                Review submissions, oversee lab work, and give useful feedback.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
                Sign in
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* Card 3: Administrators */}
          <Link
            href="/login"
            className="group relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[28px] bg-[#E5DBFF] p-8 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(229,219,255,0.32)]"
          >
            {/* Swirl/spiral line SVG overlay */}
            <svg viewBox="0 0 100 100" fill="none" stroke="rgba(110,80,200,0.18)" strokeWidth="2.5" strokeLinecap="round" className="absolute top-0 right-0 w-32 h-32 pointer-events-none translate-x-4 -translate-y-4">
              <path d="M50 50 A 10 10 0 1 0 60 60 A 20 20 0 1 0 40 70 A 30 30 0 1 0 70 30 A 40 40 0 1 0 10 70" />
            </svg>

            {/* Icon inside circle */}
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-black/6 text-violet-950">
              <UserCog className="h-6 w-6 stroke-[1.8]" />
            </div>

            {/* Card Content */}
            <div className="relative z-10 mt-8">
              <h3 className="text-2xl font-bold text-violet-950 tracking-tight">
                Administrators
              </h3>
              <p className="mt-2 text-sm leading-6 text-violet-900/80 font-medium">
                Manage users, courses, permissions, and day-to-day college operations.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-950">
                Sign in
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section id="about" className="relative overflow-hidden py-14 sm:py-16">
        <div className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-emerald-500/8 blur-[100px] light:bg-emerald-300/18" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <div className="max-w-lg">
            <p className="inline-flex rounded-full border border-emerald-300/15 bg-emerald-400/7 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300 light:border-emerald-700/12 light:bg-emerald-50 light:text-emerald-700">
              About this project
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Built as an academic project for real coursework
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400 light:text-slate-600 sm:text-base">
              Nexora OS brings coursework, practical development, submission
              evidence, and feedback into a single working space.
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-slate-400 light:text-slate-600">
              <span className="h-px w-10 bg-emerald-400/70" />
              Summer 2026 · Academic project
            </div>
          </div>
          <dl className="grid border-y border-white/10 sm:grid-cols-2 light:border-emerald-950/10">
            {[
              {
                label: "Institution",
                value: "BITHM College of Professionals",
                note: "Academic institution",
                icon: GraduationCap,
              },
              {
                label: "Student",
                value: "Mopara Pair Ayat",
                note: "IT202510001 · Summer 2026 · Information Technology",
                icon: UsersRound,
              },
              {
                label: "Instructor",
                value: "Afsana Tabassum Tamishra",
                note: "Lecturer · Department of Information Technology (IT)",
                icon: UserCog,
              },
              {
                label: "Course",
                value: "Web and Mobile Applications",
                note: "OTHM Unit H/650/3385",
                icon: BookOpen,
              },
            ].map(({ label, value, note, icon: Icon }) => (
              <div
                key={label}
                className="border-b border-white/10 p-5 odd:sm:border-r light:border-emerald-950/10 sm:[&:nth-last-child(-n+2)]:border-b-0"
              >
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 light:text-emerald-700">
                    {label}
                  </dt>
                  <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                </div>
                <dd className="mt-3 font-semibold leading-6">{value}</dd>
                <p className="mt-1 text-sm text-slate-500">{note}</p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="relative overflow-hidden py-14 sm:py-16">
        <div className="absolute left-[5%] top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-amber-200/8 blur-[110px] light:bg-amber-200/35" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300 light:text-emerald-700">
              Try the workflow
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Take a look around the student workspace
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400 light:text-slate-600 sm:text-base">
              Use a demo account to review the dashboard, visit Code Lab, and
              see which tools are available to each role.
            </p>
            <Link
              href="/login"
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl border border-emerald-300/15 bg-[#087a55] px-6 text-sm font-semibold !text-white shadow-[0_12px_28px_rgba(5,68,46,0.22)] hover:bg-[#066b4a] light:bg-[#087a55] light:!text-white light:hover:bg-[#066b4a]"
            >
              Explore a demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative min-h-[360px] overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_50%_30%,rgba(50,245,154,0.18),transparent_60%),rgba(255,255,255,0.025)] light:border-emerald-950/8 light:bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.14),transparent_60%),white]">
            <Image
              src="/pengu.gif"
              alt="Nexora guide"
              width={420}
              height={420}
              unoptimized
              className="absolute bottom-0 left-1/2 h-[340px] w-auto -translate-x-1/2 object-contain"
            />
            <div className="absolute left-5 top-5 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm backdrop-blur-md light:border-emerald-950/8 light:bg-white/80">
              Student workspace ready
            </div>
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="border-y border-white/8 py-14 light:border-emerald-950/8 light:bg-white/55 sm:py-16"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300 light:text-emerald-700">
              Questions
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              A few things to know before signing in
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400 light:text-slate-600">
              These answers explain how Nexora is organized and which tools are
              currently available.
            </p>
            <Image
              src="/landing/mentor-modern-1/faqs.png"
              alt="Student reviewing common questions"
              width={360}
              height={300}
              className="mx-auto mt-8 h-auto w-full max-w-[300px]"
            />
          </div>
          <div className="grid content-start gap-3">
            {faqs.map(({ question, answer }, index) => (
              <details
                key={question}
                open={index === 0}
                className="group rounded-2xl border border-white/10 bg-white/[0.035] px-5 backdrop-blur-sm transition open:border-emerald-300/20 open:bg-white/[0.05] light:border-emerald-950/9 light:bg-white/85 light:shadow-[0_10px_28px_rgba(31,67,49,0.04)] light:open:bg-white"
              >
                <summary className="cursor-pointer list-none py-5 text-sm font-semibold marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {question}
                    <span className="text-xl text-emerald-300 transition group-open:rotate-45 light:text-emerald-700">
                      +
                    </span>
                  </span>
                </summary>
                <p className="pb-5 text-sm leading-6 text-slate-400 light:text-slate-600">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-14 sm:py-16">
        <div className="absolute -right-28 top-16 h-80 w-80 rounded-full bg-emerald-500/8 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="From Nexora OS"
            title="Decisions behind the platform"
            detail="The project follows a few simple principles drawn from day-to-day academic work."
          />
          <div className="mt-10 grid lg:grid-cols-3">
            {platformNotes.map(({ category, title, detail }, index) => (
              <article
                key={title}
                className="border-b border-white/10 px-6 py-5 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0 light:border-emerald-950/10"
              >
                <div
                  className={`h-1 w-12 rounded-full ${
                    index === 0
                      ? "bg-emerald-400"
                      : index === 1
                        ? "bg-violet-400"
                        : "bg-amber-400"
                  }`}
                />
                <div className="pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 light:text-emerald-700">
                    {category}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold leading-7">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400 light:text-slate-600">
                    {detail}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-white/8 py-12 light:border-emerald-950/8 sm:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_50%,rgba(50,245,154,0.1),transparent_30%),radial-gradient(circle_at_30%_50%,rgba(67,56,202,0.08),transparent_28%)] light:bg-[radial-gradient(circle_at_72%_50%,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.06),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300 light:text-emerald-700">
              One shared workspace
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Academic work is easier when its parts stay together
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400 light:text-slate-600 sm:text-base">
              Nexora keeps tools, roles, evidence, and feedback within the same
              academic workspace.
            </p>
          </div>

          <div className="relative mx-auto h-[310px] w-full max-w-[560px] overflow-hidden sm:h-[360px]">
            <div className="nexora-capsule left-[4%] top-[22%] w-28 -rotate-[34deg] bg-[linear-gradient(90deg,#086d70,#20b99b)]" />
            <div className="nexora-capsule bottom-[21%] left-[10%] w-36 -rotate-[30deg] bg-[linear-gradient(90deg,#4338a8,#25b99b)]" />
            <div className="nexora-capsule right-[5%] top-[27%] w-32 -rotate-[28deg] bg-[linear-gradient(90deg,#176f50,#b5db42)]" />
            <div className="nexora-capsule bottom-[17%] right-[12%] w-24 rotate-[28deg] bg-[linear-gradient(90deg,#5b3da5,#198e70)]" />
            <div className="nexora-system-orb absolute left-1/2 top-1/2 grid h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 place-items-center sm:h-[250px] sm:w-[250px]">
              <div className="relative z-10 rounded-2xl border border-white/12 bg-[#050806]/78 px-5 py-4 text-center shadow-2xl backdrop-blur-xl">
                <NexoraLogo size="sm" className="mx-auto h-8 w-[126px]" />
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">
                  Connected workspace
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="px-5 py-14 md:px-8 sm:py-16">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-emerald-200/20 bg-[linear-gradient(125deg,#075c42_0%,#07865a_52%,#0aa66e_100%)] px-6 py-14 text-center shadow-[0_30px_90px_rgba(4,96,65,0.3)] sm:px-10">
          <div className="absolute inset-0 bg-[url('/landing/mentor-modern-1/cta-bg-vector.png')] bg-cover bg-center opacity-35" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Explore Nexora OS with a demo account
            </h2>
            <p className="mt-4 text-sm leading-7 text-emerald-50/85 sm:text-base">
              Open a student, teacher, or admin workspace to see how the
              platform is organized.
            </p>
            <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/15 bg-black/15 p-3">
              <DemoLoginButtons onDark />
            </div>
          </div>
        </div>
      </section>
      <PandaCTA />

      <footer className="px-5 py-12 md:px-8 bg-[#0b0d14] light:bg-[#f1f6f3]">
        <style dangerouslySetInnerHTML={{ __html: `
          .footer-card {
            position: relative;
            background: linear-gradient(145deg, #0c120e 0%, #080d0a 100%);
            border: 1px solid rgba(50,245,154,0.12);
            border-radius: 20px;
            padding: 0;
            max-width: 1280px; /* Matched to 7xl header width */
            margin: 0 auto;
            overflow: hidden;
            box-shadow: 0 0 0 1px rgba(0,0,0,0.5), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(50,245,154,0.04);
          }
          .light .footer-card {
            background: linear-gradient(145deg, #ffffff 0%, #f6fbf7 100%);
            border: 1px solid rgba(16,185,129,0.18);
            box-shadow: 0 0 0 1px rgba(0,0,0,0.02), 0 20px 48px rgba(16,185,129,0.08);
          }
          .footer-card-inner {
            padding: 24px 20px 20px; /* Small screen padding */
          }
          @media (min-width: 768px) {
            .footer-card-inner {
              padding: 36px 40px 28px; /* Desktop padding */
            }
          }
          .footer-accent-bar {
            height: 2px;
            background: linear-gradient(90deg, transparent 0%, rgba(50,245,154,0.7) 30%, rgba(217,255,87,0.6) 65%, transparent 100%);
          }
          .light .footer-accent-bar {
            background: linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.5) 30%, rgba(5,150,105,0.4) 65%, transparent 100%);
          }
          .footer-social-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.10);
            color: rgba(255,255,255,0.45);
            transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
          }
          .light .footer-social-icon {
            border-color: rgba(15,23,42,0.12);
            color: rgba(15,23,42,0.55);
          }
          .footer-social-icon:hover {
            border-color: rgba(50,245,154,0.5);
            color: #32f59a;
            background: rgba(50,245,154,0.06);
          }
          .light .footer-social-icon:hover {
            border-color: rgba(16,185,129,0.6);
            color: #059669;
            background: rgba(16,185,129,0.05);
          }
          .footer-nav-link {
            font-size: 13px;
            color: rgba(255,255,255,0.4);
            transition: color 0.18s ease;
            text-decoration: none;
          }
          .light .footer-nav-link {
            color: rgba(15,23,42,0.6);
          }
          .footer-nav-link:hover { color: #32f59a; }
          .light .footer-nav-link:hover { color: #059669; }
          
          .footer-divider {
            border: none;
            border-top: 1px solid rgba(255,255,255,0.06);
            margin: 24px 0 20px;
          }
          .light .footer-divider {
            border-top-color: rgba(16,185,129,0.12);
          }
          
          .footer-bithm-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: rgba(50,245,154,0.55);
            border: 1px solid rgba(50,245,154,0.15);
            border-radius: 999px;
            padding: 3px 10px;
          }
          .light .footer-bithm-badge {
            color: #047857;
            border-color: rgba(16,185,129,0.25);
          }
          .footer-logo-container img {
            mix-blend-mode: screen;
            filter: brightness(1.1) saturate(1.5);
          }
          .light .footer-logo-container img {
            mix-blend-mode: normal !important;
            filter: none !important;
          }
        ` }} />

        <div className="footer-card">
          <div className="footer-accent-bar" />

          <div className="footer-card-inner">
            {/* Top row: Brand | Social icons */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

              {/* Brand mark — actual logo image with blend mode container */}
              <div className="max-w-xs">
                <div className="footer-logo-container">
                  <NexoraLogo
                    size="md"
                    className="h-11 w-[168px]"
                  />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-400 light:text-slate-600">
                  Assignments, lab work, coding tools, feedback, and course
                  administration — all in one place.
                </p>
                <div className="mt-4">
                  <span className="footer-bithm-badge">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <circle cx="4" cy="4" r="3" fill="#32f59a" className="light:fill-[#059669]"/>
                    </svg>
                    Built for BITHM
                  </span>
                </div>
              </div>

              {/* Social icons */}
              <div className="flex shrink-0 items-center gap-2">
                <a href="#" aria-label="Facebook" className="footer-social-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="#" aria-label="X / Twitter" className="footer-social-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Instagram" className="footer-social-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <a href="#" aria-label="LinkedIn" className="footer-social-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Nav links */}
            <nav className="mt-7 flex flex-wrap gap-x-7 gap-y-2">
              <a href="#" className="footer-nav-link">Home</a>
              <a href="#platform" className="footer-nav-link">Platform</a>
              <a href="#workflows" className="footer-nav-link">Workflows</a>
              <a href="#roles" className="footer-nav-link">Roles</a>
              <a href="#faq" className="footer-nav-link">FAQ</a>
              <a href="#contact" className="footer-nav-link">Contact Us</a>
            </nav>

            {/* Divider */}
            <hr className="footer-divider" />

            {/* Bottom: copyright | tagline */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
              <p className="text-xs text-slate-500">
                © 2026 Nexora OS · BITHM. All Rights Reserved.
              </p>
              <span className="text-xs text-slate-600">Designed for students. Built for institutions.</span>
            </div>
          </div>
        </div>
      </footer>


    </main>
  );
}

function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-transparent px-3 pt-3 sm:px-5 md:px-8">
      <style dangerouslySetInnerHTML={{ __html: `
        .hk-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          padding: 0 20px;
          background: #000;
          color: #fff;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(.2,.8,.2,1),
                      box-shadow 0.4s ease,
                      filter 0.4s ease;
          box-shadow: 0 0 0 rgba(170, 60, 220, 0);
          z-index: 10;
          text-decoration: none;
        }

        .hk-button::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          aspect-ratio: 1/1;
          width: 220%;
          height: auto;
          border-radius: 50%;
          background: conic-gradient(#32f59a 0%, #000 15%, #9333ea 50%, #32f59a 100%);
          animation: spin linear 3s infinite;
          transform: translate(-50%, -50%);
          transition: filter 0.4s ease;
        }

        .hk-button::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: calc(100% - 5px);
          height: calc(100% - 5px);
          background: rgba(6, 9, 7, 0.9);
          transform: translate(-50%, -50%);
          border-radius: 9999px;
          backdrop-filter: blur(4px);
          transition: background 0.4s ease;
        }

        .light .hk-button::after {
          background: rgba(255, 255, 255, 0.95);
        }

        .hk-button span {
          display: block;
          position: relative;
          z-index: 2;
          font-family: inherit;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #ffffff;
          transition: letter-spacing 0.4s ease, text-shadow 0.4s ease, color 0.4s ease;
        }

        .light .hk-button span {
          color: #042f1a;
        }

        .hk-button:hover {
          transform: scale(1.05);
          box-shadow: 0 0 16px rgba(50, 245, 154, 0.35);
        }
        .hk-button:hover::before {
          animation-duration: 1.5s;
          filter: saturate(1.4) brightness(1.1);
        }
        .hk-button:hover::after {
          background: rgba(6, 9, 7, 0.82);
        }
        .light .hk-button:hover::after {
          background: rgba(255, 255, 255, 0.88);
        }
        .hk-button:hover span {
          letter-spacing: 0.08em;
          text-shadow: 0 0 8px rgba(50, 245, 154, 0.6);
        }

        .hk-button:active {
          transform: scale(0.96);
        }

        .hk-button:focus-visible {
          outline: 2px solid #32f59a;
          outline-offset: 4px;
        }

        @keyframes spin {
          0%   { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .nav-link {
          position: relative;
          color: #cbd5e1;
          text-decoration: none;
          padding: 6px 0;
          font-weight: 500;
          transition: color 0.3s ease;
        }
        .light .nav-link {
          color: #475569;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 2px;
          bottom: 0;
          left: 0;
          background: linear-gradient(90deg, #32f59a, #d9ff57);
          transform-origin: bottom right;
          transition: transform 0.3s cubic-bezier(0.86, 0, 0.07, 1);
        }
        .light .nav-link::after {
          background: linear-gradient(90deg, #059669, #10b981);
        }
        .nav-link:hover {
          color: #ffffff;
        }
        .light .nav-link:hover {
          color: #064e3b;
        }
        .nav-link:hover::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
      ` }} />
      <div className="command-border mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 rounded-2xl border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.075),rgba(50,245,154,0.025)),rgba(6,9,7,0.68)] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_46px_rgba(0,0,0,0.24),0_0_34px_rgba(50,245,154,0.055)] backdrop-blur-2xl backdrop-saturate-150 sm:px-5 md:px-6 light:border-white/75 light:bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(236,253,245,0.62)),rgba(255,255,255,0.68)] light:shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_14px_38px_rgba(31,67,49,0.11),0_0_28px_rgba(16,185,129,0.06)]">
        <div className="flex shrink-0 items-center">
          <Link href="/" aria-label="Nexora OS home">
            <NexoraLogo size="md" priority className="h-10 w-[158px]" />
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm lg:flex xl:gap-8">
          <a
            href="#about"
            className="nav-link"
          >
            About
          </a>
          <a
            href="#platform"
            className="nav-link"
          >
            Platform
          </a>
          <a
            href="#workflows"
            className="nav-link"
          >
            Workflows
          </a>
          <a
            href="#faq"
            className="nav-link"
          >
            FAQ
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <div>
            <ThemeToggle />
          </div>

          <a
            href="#contact"
            className="hk-button"
          >
            <span>Contact Us</span>
          </a>

          <Link
            href="/login"
            className="nexora-focus inline-flex h-10 items-center justify-center rounded-md border border-emerald-300/15 bg-[#087a55] px-5 text-sm font-semibold !text-white shadow-none hover:bg-[#066b4a] light:bg-[#087a55] light:!text-white light:hover:bg-[#066b4a]"
          >
            Log In
          </Link>
        </div>
      </div>
    </header>
  );
}

function SectionHeading({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="inline-flex rounded-full border border-emerald-300/15 bg-emerald-400/7 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300 light:border-emerald-700/12 light:bg-emerald-50 light:text-emerald-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-slate-400 light:text-slate-600 sm:text-base">
        {detail}
      </p>
    </div>
  );
}
