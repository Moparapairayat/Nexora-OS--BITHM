import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Code2,
  Database,
  FileCheck2,
  FlaskConical,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  UserCog,
  UsersRound,
} from "lucide-react";

import { NexoraLogo } from "@/components/brand/nexora-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { DemoLoginButtons } from "@/features/auth/demo-login-buttons";

const platformAreas = [
  {
    title: "Student essentials",
    detail: "Start with the pages you use every day.",
    icon: GraduationCap,
    tone: "bg-violet-500/10 text-violet-300 light:bg-violet-50 light:text-violet-700",
    tools: ["Dashboard", "Activity", "Notifications"],
  },
  {
    title: "Academic work",
    detail: "Manage coursework from brief to reviewed submission.",
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
    detail: "Planned assistants for project, code, brief, and feedback work.",
    icon: Sparkles,
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
    detail: "Build, inspect, test, and prepare software projects.",
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
    detail: "Prepare datasets and organize machine-learning work.",
    icon: Database,
    tone: "bg-rose-500/10 text-rose-300 light:bg-rose-50 light:text-rose-700",
    tools: ["Dataset Manager", "ML Studio", "AutoML Assistant", "ML Reports"],
  },
  {
    title: "Content studio",
    detail: "Create presentation, documentation, research, and OCR content.",
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
    detail: "Review sources, originality, citations, and writing risks.",
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
    detail: "Show completed work and plan the skills to develop next.",
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
    detail: "Keep teacher comments and requested changes easy to follow.",
    icon: UsersRound,
    tone: "bg-fuchsia-500/10 text-fuchsia-300 light:bg-fuchsia-50 light:text-fuchsia-700",
    tools: ["Feedback Center", "Fix Requests"],
  },
];

const workflows = [
  {
    title: "Assignment reports",
    detail:
      "Draft reports, map evidence, submit work, and follow review status.",
    icon: FileCheck2,
    label: "Plan · Write · Submit",
  },
  {
    title: "Practical lab work",
    detail:
      "Move from a task brief to tested code and a structured lab report.",
    icon: FlaskConical,
    label: "Build · Test · Report",
  },
  {
    title: "Progress and feedback",
    detail:
      "See deadlines, requested fixes, recent submissions, and skill progress.",
    icon: BarChart3,
    label: "Review · Improve · Resubmit",
  },
];

const roleCards = [
  {
    title: "Students",
    detail: "Complete academic work, code projects, and track feedback.",
    icon: GraduationCap,
  },
  {
    title: "Teachers",
    detail: "Review submissions, monitor labs, and give clear guidance.",
    icon: UsersRound,
  },
  {
    title: "Administrators",
    detail: "Manage users, courses, access, data, and system operations.",
    icon: UserCog,
  },
];

const latestAreas = [
  {
    label: "Available now",
    title: "Code Lab workspace",
    detail:
      "A focused editor, console, file explorer, tests, and browser draft saving.",
    icon: Code2,
  },
  {
    label: "Available now",
    title: "Database Visualizer",
    detail:
      "Turn DBML, SQL DDL, Prisma, or Mongoose schemas into an interactive ERD.",
    icon: Database,
  },
  {
    label: "Academic integrity",
    title: "AcademicShield",
    detail:
      "Inspect matched sources, citation gaps, originality, and writing-risk indicators.",
    icon: ShieldCheck,
  },
  {
    label: "Role based",
    title: "Connected dashboards",
    detail:
      "Students, teachers, and admins get the information and controls they need.",
    icon: UsersRound,
  },
];

const platformNotes = [
  {
    category: "Student workflow",
    title: "Keep every deadline, submission, and requested fix visible",
    detail:
      "The dashboard brings current work and teacher feedback into one clear view.",
  },
  {
    category: "Practical learning",
    title: "Move from code to evidence without changing tools",
    detail:
      "Use Code Lab for practical tasks, then carry the result into structured academic work.",
  },
  {
    category: "Clear product status",
    title: "Planned modules are marked instead of simulated",
    detail:
      "Coming Soon pages make it clear which workflows are available and which are still being built.",
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
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#060907] text-white light:bg-[#f8fbf9] light:text-[#15251f]">
      <LandingNav />

      <section className="relative overflow-hidden border-b border-white/8 light:border-emerald-950/8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_22%,rgba(50,245,154,0.16),transparent_32rem),radial-gradient(circle_at_14%_8%,rgba(139,92,246,0.13),transparent_27rem)] light:bg-[radial-gradient(circle_at_76%_22%,rgba(16,185,129,0.13),transparent_30rem),radial-gradient(circle_at_12%_10%,rgba(139,92,246,0.08),transparent_25rem)]" />
        <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-5 py-16 md:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] lg:py-20">
          <div className="max-w-xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300 light:text-emerald-700">
              Built for academic work
            </p>
            <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[58px]">
              One place to learn, build, and submit your work.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300 light:text-slate-600 sm:text-lg">
              Nexora OS brings assignments, labs, coding tools, feedback, and
              academic administration into one focused platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="nexora-focus inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#16b877,#0c8f5b)] px-6 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(12,143,91,0.24)] transition hover:-translate-y-0.5"
              >
                Open Nexora OS
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#platform"
                className="nexora-focus inline-flex h-12 items-center justify-center rounded-xl border border-white/12 bg-white/[0.045] px-6 text-sm font-semibold transition hover:bg-white/[0.08] light:border-emerald-950/10 light:bg-white light:hover:bg-emerald-50"
              >
                Explore the platform
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-slate-400 light:text-slate-600">
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
                <div className="flex items-center gap-1 text-amber-300">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index}>★</span>
                  ))}
                </div>
                <p className="mt-0.5">One platform for every academic role</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[660px]">
            <div className="absolute -inset-8 rounded-full border border-emerald-300/10" />
            <Image
              src="/landing/mentor-modern-1/hero-image.png"
              alt="Student using Nexora OS for academic work"
              width={720}
              height={620}
              priority
              className="relative z-10 h-auto w-full"
            />
            <div className="absolute left-0 top-[18%] z-20 rounded-2xl border border-white/15 bg-[#111814]/88 p-3 shadow-2xl backdrop-blur-xl light:border-emerald-950/10 light:bg-white/92">
              <p className="text-2xl font-bold text-emerald-300 light:text-emerald-700">
                3 roles
              </p>
              <p className="mt-1 text-xs text-slate-400 light:text-slate-500">
                One connected system
              </p>
            </div>
            <div className="absolute bottom-[8%] right-0 z-20 rounded-2xl border border-white/15 bg-[#111814]/88 p-3 shadow-2xl backdrop-blur-xl light:border-emerald-950/10 light:bg-white/92">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-300 light:text-emerald-600" />
                Work stays organized
              </p>
              <p className="mt-1 text-xs text-slate-400 light:text-slate-500">
                From brief to feedback
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-14">
        <div className="absolute left-1/2 top-0 h-40 w-[70%] -translate-x-1/2 rounded-full bg-emerald-400/8 blur-3xl light:bg-emerald-300/15" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <p className="text-center text-sm font-medium text-slate-500">
            One platform connecting the full academic workflow
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {[
              "Assignments",
              "Lab work",
              "Code projects",
              "Feedback",
              "Integrity",
              "Administration",
            ].map((item) => (
              <div
                key={item}
                className="flex min-h-16 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.025] px-3 text-center text-sm font-semibold text-slate-300 light:border-emerald-950/8 light:bg-white light:text-slate-700 light:shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/8 py-10 light:border-emerald-950/8 light:bg-white/55">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 md:grid-cols-4 md:px-8">
          {[
            ["3", "Role-based workspaces"],
            ["2", "Live developer tools"],
            ["6", "Academic workflows"],
            ["1", "Connected platform"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-2xl bg-white/[0.035] p-5 text-center light:bg-emerald-50/65"
            >
              <p className="text-3xl font-bold text-emerald-300 light:text-emerald-700">
                {value}
              </p>
              <p className="mt-2 text-sm text-slate-400 light:text-slate-600">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="platform" className="relative overflow-hidden py-20">
        <div className="absolute -left-32 top-24 h-80 w-80 rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute -right-32 bottom-16 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Explore Nexora OS"
            title="The tools students need, without the clutter"
            detail="Every student area is listed below. Core tools are available now, while planned modules are clearly marked Coming Soon when opened."
          />
          <div className="mt-10 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
            {platformAreas.map(({ title, detail, icon: Icon, tone, tools }) => (
              <article
                key={title}
                className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-emerald-300/25 light:border-emerald-950/9 light:bg-white light:shadow-[0_18px_45px_rgba(31,67,49,0.07)]"
              >
                <span
                  className={`grid h-12 w-12 place-items-center rounded-2xl ${tone}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400 light:text-slate-600">
                  {detail}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full border border-white/9 bg-black/15 px-2.5 py-1.5 text-xs font-medium text-slate-300 light:border-emerald-950/8 light:bg-[#f5f9f6] light:text-slate-700"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="workflows"
        className="relative overflow-hidden border-y border-white/8 bg-[url('/landing/mentor-modern-1/bg-line.png')] bg-cover bg-center py-20 light:border-emerald-950/8"
      >
        <div className="absolute inset-0 bg-[#07100b]/88 light:bg-[#f2f8f4]/88" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Core workflows"
            title="Move from task to submission with less friction"
            detail="Nexora keeps the steps, files, feedback, and status of each piece of work in one place."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {workflows.map(({ title, detail, icon: Icon, label }, index) => (
              <article
                key={title}
                className="rounded-3xl border border-white/10 bg-[#101612]/90 p-6 shadow-xl light:border-emerald-950/9 light:bg-white"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-500/12 text-emerald-300 light:bg-emerald-50 light:text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    0{index + 1}
                  </span>
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 light:text-emerald-700">
                  {label}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400 light:text-slate-600">
                  {detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[url('/landing/mentor-modern-1/bg-line.png')] bg-cover bg-center py-20">
        <div className="absolute inset-0 bg-[#060907]/90 light:bg-[#f8fbf9]/91" />
        <div className="absolute right-[8%] top-10 h-72 w-72 rounded-full bg-emerald-500/13 blur-[110px]" />
        <div className="absolute bottom-4 left-[8%] h-72 w-72 rounded-full bg-violet-500/12 blur-[110px]" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Inside the platform"
            title="Start with the tools that are ready today"
            detail="These areas already have real UI and workflows, while the rest of the roadmap stays clearly separated."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {latestAreas.map(({ label, title, detail, icon: Icon }) => (
              <article
                key={title}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-[#101612]/92 p-5 transition hover:-translate-y-1 hover:border-emerald-300/25 light:border-emerald-950/8 light:bg-white light:shadow-[0_18px_45px_rgba(31,67,49,0.07)]"
              >
                <div className="flex h-40 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_50%_30%,rgba(50,245,154,0.18),transparent_65%),rgba(255,255,255,0.025)] light:bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.16),transparent_65%),#f3f8f5]">
                  <Icon className="h-12 w-12 text-emerald-300 transition group-hover:scale-110 light:text-emerald-700" />
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

      <section id="roles" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <SectionHeading
          eyebrow="Built for your institution"
          title="A focused workspace for every role"
          detail="Students, teachers, and administrators share one system without sharing the same controls."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {roleCards.map(({ title, detail, icon: Icon }) => (
            <Link
              key={title}
              href="/login"
              className="group rounded-3xl border border-white/10 bg-white/[0.035] p-7 transition hover:border-emerald-300/30 hover:bg-emerald-300/[0.045] light:border-emerald-950/9 light:bg-white light:shadow-[0_18px_45px_rgba(31,67,49,0.07)]"
            >
              <Icon className="h-7 w-7 text-emerald-300 light:text-emerald-700" />
              <h3 className="mt-8 text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400 light:text-slate-600">
                {detail}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 light:text-emerald-700">
                Sign in
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div className="absolute left-[5%] top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-amber-200/8 blur-[110px] light:bg-amber-200/35" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300 light:text-emerald-700">
              Try the workflow
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              See how Nexora fits into a real academic day
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400 light:text-slate-600 sm:text-base">
              Open a demo workspace, review the dashboard, visit Code Lab, and
              inspect the tools available to each role.
            </p>
            <Link
              href="/login"
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#16b877,#0c8f5b)] px-6 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(12,143,91,0.22)]"
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
        className="border-y border-white/8 py-20 light:border-emerald-950/8 light:bg-white/55"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300 light:text-emerald-700">
              Questions
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              What to know before you sign in
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400 light:text-slate-600">
              A quick overview of how Nexora OS is organized and which tools are
              available.
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
                className="group rounded-2xl border border-white/10 bg-white/[0.035] px-5 light:border-emerald-950/9 light:bg-white"
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

      <section className="relative overflow-hidden py-20">
        <div className="absolute -right-28 top-16 h-80 w-80 rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="From Nexora OS"
            title="Designed around practical academic work"
            detail="A few principles behind the platform and the experience students see every day."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {platformNotes.map(({ category, title, detail }, index) => (
              <article
                key={title}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] light:border-emerald-950/8 light:bg-white light:shadow-[0_18px_45px_rgba(31,67,49,0.07)]"
              >
                <div
                  className={`h-2 ${
                    index === 0
                      ? "bg-emerald-400"
                      : index === 1
                        ? "bg-violet-400"
                        : "bg-amber-400"
                  }`}
                />
                <div className="p-6">
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

      <section className="px-5 py-20 md:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[#087a55] px-6 py-14 text-center shadow-2xl sm:px-10">
          <div className="absolute inset-0 bg-[url('/landing/mentor-modern-1/cta-bg-vector.png')] bg-cover bg-center opacity-35" />
          <div className="relative mx-auto max-w-2xl">
            <Sparkles className="mx-auto h-7 w-7 text-emerald-100" />
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              See Nexora OS from the inside
            </h2>
            <p className="mt-4 text-sm leading-7 text-emerald-50/85 sm:text-base">
              Use a demo role to explore the dashboard, navigation, and
              available tools without setting up an account.
            </p>
            <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/15 bg-black/15 p-3">
              <DemoLoginButtons />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8 bg-[#030504] py-12 light:border-emerald-950/8 light:bg-[#eaf2ed]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 md:flex-row md:items-end md:justify-between md:px-8">
          <div className="max-w-sm">
            <NexoraLogo size="md" className="h-11 w-[168px]" />
            <p className="mt-4 text-sm leading-6 text-slate-400 light:text-slate-600">
              Academic work, practical tools, feedback, and administration in
              one connected platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400 light:text-slate-600">
            <a
              href="#platform"
              className="hover:text-emerald-300 light:hover:text-emerald-700"
            >
              Platform
            </a>
            <a
              href="#workflows"
              className="hover:text-emerald-300 light:hover:text-emerald-700"
            >
              Workflows
            </a>
            <a
              href="#roles"
              className="hover:text-emerald-300 light:hover:text-emerald-700"
            >
              Roles
            </a>
            <a
              href="#faq"
              className="hover:text-emerald-300 light:hover:text-emerald-700"
            >
              FAQ
            </a>
            <Link
              href="/login"
              className="hover:text-emerald-300 light:hover:text-emerald-700"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/8 px-5 pt-6 text-xs text-slate-500 md:px-8 light:border-emerald-950/8">
          © 2026 Nexora OS. Built for BITHM academic workflows.
        </div>
      </footer>
    </main>
  );
}

function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#060907]/88 backdrop-blur-xl light:border-emerald-950/8 light:bg-[#f8fbf9]/90">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-5 px-5 md:px-8">
        <Link href="/" aria-label="Nexora OS home">
          <NexoraLogo size="md" priority className="h-11 w-[168px]" />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex light:text-slate-600">
          <a
            href="#platform"
            className="transition hover:text-emerald-300 light:hover:text-emerald-700"
          >
            Platform
          </a>
          <a
            href="#workflows"
            className="transition hover:text-emerald-300 light:hover:text-emerald-700"
          >
            Workflows
          </a>
          <a
            href="#roles"
            className="transition hover:text-emerald-300 light:hover:text-emerald-700"
          >
            Roles
          </a>
          <a
            href="#faq"
            className="transition hover:text-emerald-300 light:hover:text-emerald-700"
          >
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="nexora-focus inline-flex h-10 items-center justify-center rounded-xl border border-white/12 bg-white/[0.045] px-4 text-sm font-semibold transition hover:bg-white/[0.08] light:border-emerald-950/10 light:bg-white"
          >
            Sign in
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
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300 light:text-emerald-700">
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
