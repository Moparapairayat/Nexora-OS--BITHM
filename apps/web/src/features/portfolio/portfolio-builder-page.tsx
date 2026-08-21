"use client";

import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Boxes,
  Briefcase,
  BriefcaseBusiness,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Compass,
  Copy,
  Cpu,
  Database,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileCode2,
  FileText,
  Fingerprint,
  Flame,
  FolderGit2,
  GitBranch,
  Github,
  Globe,
  GraduationCap,
  HardDrive,
  Layers,
  Layout,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  MoreVertical,
  MoveUpRight,
  Network,
  PenTool,
  Play,
  Plus,
  QrCode,
  Radar,
  RefreshCw,
  Rocket,
  Save,
  Send,
  Server,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
  TrendingUp,
  Undo2,
  Upload,
  User,
  Workflow,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { roleDashboards, type AppRole, type Tone } from "@/data/dashboard.mock";
import { cn } from "@/lib/utils";

interface ArchitectureCaseStudy {
  id: string;
  systemName: string;
  unitCode: string;
  category: string;
  leadRole: string;
  period: string;
  tagline: string;
  problemStatement: string;
  architecturalSolution: string;
  architectureLayers: { layer: string; component: string; tech: string }[];
  keyEngineeringMetrics: { label: string; value: string; detail: string }[];
  coreTechStack: string[];
  testAssertions: { file: string; testsPassed: number; durationMs: number }[];
  codeHighlight: { filename: string; language: string; code: string };
  demoUrl?: string;
  githubUrl?: string;
}

export function PortfolioBuilderPage({ role = "student" }: { role?: AppRole }) {
  const data = roleDashboards[role] ?? roleDashboards.student;

  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("nexora-os");
  const [activeTab, setActiveTab] = useState<"architecture" | "metrics" | "code" | "tests">("architecture");

  // Verified Senior Developer Case Studies
  const caseStudies: ArchitectureCaseStudy[] = [
    {
      id: "nexora-os",
      systemName: "Nexora OS — Academic Microservice Architecture",
      unitCode: "Unit 04 • Web Application Development",
      category: "Distributed Web Architecture",
      leadRole: "Lead Software Architect & Full-Stack Developer",
      period: "Jan 2026 – Present",
      tagline:
        "High-concurrency academic platform combining Next.js 16 SSR, Fastify REST APIs, and isolated Piston code execution sandboxes.",
      problemStatement:
        "Traditional higher-education portals suffer from slow server response times (>800ms) and lack secure, real-time code execution environments for programming lab coursework.",
      architecturalSolution:
        "Architected a multi-tier microservice system separating server-side rendered UI layers from an asynchronous Piston sandbox execution worker pool, communicating via low-latency REST and WebSocket protocols.",
      architectureLayers: [
        { layer: "Presentation Layer", component: "Next.js 16 App Router + React 19 Client Components", tech: "SSR & Streaming" },
        { layer: "API Gateway & Auth", component: "Fastify REST Server with scoped JWT token validation", tech: "<40ms latency" },
        { layer: "Persistence Layer", component: "PostgreSQL 16 Relational Schema with Prisma ORM", tech: "3NF Normalized" },
        { layer: "Sandbox Execution", component: "Piston Container Worker Pool + WebAssembly Pyodide", tech: "Isolated Sandboxes" },
      ],
      keyEngineeringMetrics: [
        { label: "Lab Test Coverage", value: "100%", detail: "14/14 automated assertions passing" },
        { label: "Hydration Speedup", value: "+43%", detail: "Next.js 16 selective hydration" },
        { label: "Token Verification", value: "<35ms", detail: "In-memory scoped session caching" },
        { label: "Sandbox Cold Start", value: "0ms", detail: "Pre-warmed Piston worker pool" },
      ],
      coreTechStack: ["Next.js 16", "React 19", "Fastify", "PostgreSQL 16", "Docker", "Prisma ORM", "TypeScript", "Tailwind CSS"],
      testAssertions: [
        { file: "apps/web/src/tests/auth.test.ts", testsPassed: 4, durationMs: 280 },
        { file: "apps/api/src/routes/modules.test.ts", testsPassed: 6, durationMs: 410 },
        { file: "packages/database/src/schema.test.ts", testsPassed: 4, durationMs: 190 },
      ],
      codeHighlight: {
        filename: "apps/api/src/modules/code-lab/piston-runner.ts",
        language: "typescript",
        code: `export async function executeLabSubmission(code: string, language: string) {
  // Dispatch execution job to pre-warmed isolated container sandbox
  const sandbox = await pistonClient.execute({
    language,
    version: "*",
    files: [{ content: code }],
    run_timeout: 3000
  });

  // Evaluate stdout assertions against grading matrix
  return evaluateTestAssertions(sandbox.run.stdout);
}`,
      },
      demoUrl: "https://nexora.bithm.dev",
      githubUrl: "https://github.com/moparapairayat/nexora-os",
    },
    {
      id: "postgres-3nf",
      systemName: "Relational PostgreSQL 16 Schema & 3NF Visualizer",
      unitCode: "Unit 16 • Database Engineering",
      category: "Database Design & Normalization",
      leadRole: "Database Systems Engineer",
      period: "Nov 2025 – Dec 2025",
      tagline:
        "Enterprise academic database engine featuring 3NF normalized relations, composite indexing, and zero data redundancy.",
      problemStatement:
        "Student enrollment and grading systems frequently encounter update anomalies and severe query degradation due to non-normalized tabular structures.",
      architecturalSolution:
        "Engineered a strictly 3NF normalized PostgreSQL 16 schema with composite B-tree indexes, foreign key cascade constraints, and automated Prisma migration scripts inside Docker containers.",
      architectureLayers: [
        { layer: "Entity Modeling", component: "Students, CourseUnits, Grades, PlagiarismAudit", tech: "Third Normal Form" },
        { layer: "Indexing Layer", component: "Composite B-tree indexes on (studentId, courseUnitId)", tech: "<12ms lookups" },
        { layer: "Data Integrity", component: "Foreign key ON DELETE CASCADE & check constraints", tech: "Zero Redundancy" },
        { layer: "Migration Engine", component: "Prisma Migrate with shadow database validation", tech: "Automated CI" },
      ],
      keyEngineeringMetrics: [
        { label: "Normalization Level", value: "3NF", detail: "Zero transitive dependencies" },
        { label: "Query Execution", value: "<12ms", detail: "Indexed multi-table joins" },
        { label: "Data Redundancy", value: "0.0%", detail: "Strict primary/foreign key relations" },
        { label: "Faculty Approval", value: "100%", detail: "Approved by Prof. Michael Chen" },
      ],
      coreTechStack: ["PostgreSQL 16", "Prisma ORM", "Docker", "SQL", "Database ERD", "TypeScript"],
      testAssertions: [
        { file: "prisma/tests/normalization.test.ts", testsPassed: 5, durationMs: 210 },
        { file: "prisma/tests/cascade_integrity.test.ts", testsPassed: 3, durationMs: 140 },
      ],
      codeHighlight: {
        filename: "packages/database/prisma/schema.prisma",
        language: "prisma",
        code: `model StudentSubmission {
  id           String       @id @default(cuid())
  studentId    String
  courseUnitId String
  testScore    Float
  createdAt    DateTime     @default(now())
  student      Student      @relation(fields: [studentId], references: [id], onDelete: Cascade)
  courseUnit   CourseUnit   @relation(fields: [courseUnitId], references: [id])
  @@index([studentId, courseUnitId])
}`,
      },
      demoUrl: "https://db-visualizer.bithm.dev",
      githubUrl: "https://github.com/moparapairayat/bithm-database",
    },
    {
      id: "pyodide-dsa",
      systemName: "Pyodide Binary Search Tree & Complexity Engine",
      unitCode: "Unit 19 • Data Structures & Algorithms",
      category: "WebAssembly & Algorithms",
      leadRole: "Algorithm Engineer",
      period: "Oct 2025 – Nov 2025",
      tagline:
        "In-browser WebAssembly Python sandbox measuring Big-O time and space complexity with recursive AVL self-balancing visualizers.",
      problemStatement:
        "Understanding recursive data structures and algorithmic complexity is challenging without real-time memory and recursion stack visualization.",
      architecturalSolution:
        "Compiled Python 3.12 into browser-native WebAssembly via Pyodide, bridging memory pointers to HTML5 Canvas for real-time AVL self-balancing tree animations.",
      architectureLayers: [
        { layer: "Runtime Engine", component: "Pyodide WebAssembly Python 3.12 VM", tech: "Browser-Native" },
        { layer: "Data Structures", component: "Self-Balancing AVL Binary Search Trees & Heaps", tech: "O(log n) Guarantees" },
        { layer: "Memory Profiler", component: "Real-time recursion stack memory allocation tracker", tech: "Big-O Analysis" },
        { layer: "Renderer", component: "High-frame-rate Canvas 2D tree layout engine", tech: "60 FPS Render" },
      ],
      keyEngineeringMetrics: [
        { label: "Runtime Sandbox", value: "Wasm", detail: "Zero-latency in-browser execution" },
        { label: "Tree Balance Guarantee", value: "O(log n)", detail: "Strict AVL height delta <= 1" },
        { label: "Rendering Performance", value: "60 FPS", detail: "Canvas step-by-step animator" },
        { label: "Test Assertions", value: "12/12", detail: "All sorting & BST suites passed" },
      ],
      coreTechStack: ["Python 3.12", "WebAssembly (Pyodide)", "Data Structures", "Big-O Analysis", "Canvas API"],
      testAssertions: [
        { file: "tests/test_bst.py", testsPassed: 8, durationMs: 420 },
        { file: "tests/test_avl_rotations.py", testsPassed: 4, durationMs: 180 },
      ],
      codeHighlight: {
        filename: "algorithm/bst_visualizer.py",
        language: "python",
        code: `class AVLNode:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.height = 1

def get_balance(node):
    if not node: return 0
    return get_height(node.left) - get_height(node.right)`,
      },
      demoUrl: "https://algo-sandbox.bithm.dev",
      githubUrl: "https://github.com/moparapairayat/algo-bench",
    },
  ];

  const activeCase = caseStudies.find((c) => c.id === selectedCaseId) ?? caseStudies[0];

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://nexora.bithm.edu.bd/p/mopara-ayat");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <AppShell
      role={role}
      title="Senior Developer Portfolio & Engineering Dossier"
      subtitle="Verified coursework architectures, system specifications, and academic credentials evaluated under Level 5 Computing standards."
      nav={data.nav}
      navGroups={data.navGroups}
      accountEmail={data.accountEmail}
    >
      <div className="student-dashboard max-w-[1600px] mx-auto w-full min-w-0 pb-16 space-y-7">
        {/* ========================================================================= */}
        {/* 1. TOP HEADER & VERIFIED SHOWCASE COMMAND BAR                             */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                SENIOR DEVELOPER DOSSIER
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">BITHM CSE Faculty Directory</span>
            </div>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Engineering Showcase & System Dossier
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-2xl">
              Verified software architectures, technical specifications, and continuous integration evidence for recruiters and engineering leads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300 dark:border-white/10 dark:bg-[#121715] dark:text-slate-200 dark:hover:bg-white/5"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>nexora.bithm.edu.bd/p/mopara-ayat</span>
                </>
              )}
            </button>

            <Link
              href="/student/skill-dna"
              className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-white/10 dark:bg-[#121715] dark:text-slate-200"
            >
              <Radar className="h-3.5 w-3.5 text-emerald-500" />
              <span>Skill DNA</span>
            </Link>

            <button
              type="button"
              onClick={() => alert("Downloading verified PDF resume with lab test assertions...")}
              className="bento-primary-btn inline-flex h-9.5 items-center gap-2 rounded-xl px-4 text-xs font-bold !text-white shadow-[0_4px_16px_rgba(8,122,73,0.28)] transition hover:brightness-110 active:scale-[0.98]"
            >
              <Download className="h-3.5 w-3.5 fill-white !text-white" />
              <span className="!text-white font-bold">Download Verified CV</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. EXECUTIVE DEVELOPER DOSSIER & IMPACT METRICS PODS                      */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-[#111714]">
          <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Monogram Avatar with Verified Status */}
              <div className="relative grid h-16 w-16 sm:h-20 sm:w-20 shrink-0 place-items-center rounded-[22px] bg-gradient-to-tr from-emerald-500 via-teal-500 to-lime-300 text-slate-950 font-black text-2xl sm:text-3xl shadow-[0_8px_24px_rgba(16,185,129,0.3)]">
                MA
                <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-slate-950 text-emerald-400 border-2 border-white dark:border-[#111714]">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    Mopara Pair Ayat
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10.5px] font-extrabold text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                    <CheckCircle2 className="h-3 w-3" />
                    BITHM Verified Scholar
                  </span>
                </div>

                <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Full-Stack Software Engineer & Systems Architect • Level 5 BITHM CSE
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Dhaka, Bangladesh
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    Open for Junior SWE Roles & Internships
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Standing */}
            <div className="hidden sm:flex flex-col items-end rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/20 text-right shrink-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                ACADEMIC TIER
              </span>
              <p className="font-mono text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                84.8<span className="text-base font-bold text-emerald-500">%</span>
              </p>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Level 5 Distinction Track
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-4xl">
            Designing type-safe distributed web architectures, high-concurrency Fastify REST APIs, and normalized relational PostgreSQL database schemas with 100% automated CI test validation. Currently completing Level 5 Higher National Diploma in Computing on the Distinction track at BITHM.
          </p>

          {/* Social Links Hub */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-slate-200/70 dark:border-white/10 pt-4">
            <a
              href="https://github.com/moparapairayat"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 transition"
            >
              <Github className="h-3.5 w-3.5" />
              <span>github.com/moparapairayat</span>
            </a>

            <a
              href="https://linkedin.com/in/mopara-ayat"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 transition"
            >
              <Linkedin className="h-3.5 w-3.5 text-cyan-500" />
              <span>linkedin.com/in/mopara-ayat</span>
            </a>

            <a
              href="mailto:ayat@bithm.edu.bd"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 transition"
            >
              <Mail className="h-3.5 w-3.5 text-amber-500" />
              <span>ayat@bithm.edu.bd</span>
            </a>
          </div>
        </div>

        {/* 4 Impact Summary Pods */}
        <div className="grid gap-3.5 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-xs dark:border-white/10 dark:bg-[#121715] border-t-2 !border-t-emerald-500">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Automated Test Rigor
            </span>
            <p className="font-mono text-2xl font-black text-slate-900 dark:text-white mt-1">
              100<span className="text-base font-bold text-emerald-500">%</span>
            </p>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              38/38 Lab Suites Passing
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-xs dark:border-white/10 dark:bg-[#121715] border-t-2 !border-t-cyan-500">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Database Normalization
            </span>
            <p className="font-mono text-2xl font-black text-slate-900 dark:text-white mt-1">
              3NF<span className="text-base font-bold text-cyan-500"> Strict</span>
            </p>
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
              Zero Data Redundancy
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-xs dark:border-white/10 dark:bg-[#121715] border-t-2 !border-t-amber-500">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Piston Engine Runtime
            </span>
            <p className="font-mono text-2xl font-black text-slate-900 dark:text-white mt-1">
              1.42<span className="text-base font-bold text-amber-500">s</span>
            </p>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              Fast Isolation Benchmarks
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-xs dark:border-white/10 dark:bg-[#121715] border-t-2 !border-t-purple-500">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Academic Authorship
            </span>
            <p className="font-mono text-2xl font-black text-slate-900 dark:text-white mt-1">
              98<span className="text-base font-bold text-purple-500">%</span>
            </p>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
              AcademicShield Clean
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MASTER ARCHITECTURE CASE STUDY INSPECTOR & RIGHT SIDEBAR              */}
        {/* ========================================================================= */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* ======================================================================= */}
          {/* LEFT 8 COLUMNS: DEEP-DIVE SYSTEM ARCHITECTURE INSPECTOR                 */}
          {/* ======================================================================= */}
          <div className="lg:col-span-8 space-y-5">
            {/* System Selector Header */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Coursework System Architectures & Case Studies
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a system below to inspect architectural tiers, engineering metrics, and source implementations
                </p>
              </div>
            </div>

            {/* System Selection Tab Bar */}
            <div className="flex flex-wrap gap-2">
              {caseStudies.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCaseId(c.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-xs font-bold transition text-left",
                    selectedCaseId === c.id
                      ? "border-emerald-500 bg-emerald-50/60 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-500/50 dark:text-emerald-300 shadow-xs"
                      : "border-slate-200/80 bg-white/90 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-[#121715] dark:text-slate-300",
                  )}
                >
                  <Boxes className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="truncate max-w-[200px]">{c.systemName}</span>
                </button>
              ))}
            </div>

            {/* Selected System Master Dossier Card */}
            <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-[#121715] space-y-6">
              {/* Top Banner */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/70 dark:border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[10.5px] font-bold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                      {activeCase.unitCode}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {activeCase.leadRole}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {activeCase.systemName}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {activeCase.tagline}
                  </p>
                </div>

                {/* External Action Links */}
                <div className="flex items-center gap-2">
                  {activeCase.githubUrl && (
                    <a
                      href={activeCase.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    >
                      <Github className="h-3.5 w-3.5" />
                      <span>Source</span>
                    </a>
                  )}
                  {activeCase.demoUrl && (
                    <a
                      href={activeCase.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bento-primary-btn inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold !text-white shadow-xs hover:brightness-110"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Sub-tab Navigation */}
              <div className="flex items-center gap-1 border-b border-slate-200/70 dark:border-white/10 pb-2 text-xs font-bold">
                {[
                  { id: "architecture", label: "System Architecture", icon: Workflow },
                  { id: "metrics", label: "Engineering Metrics", icon: Activity },
                  { id: "code", label: "Core Implementation", icon: Code2 },
                  { id: "tests", label: "CI Test Assertions", icon: ShieldCheck },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id as any)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition",
                        activeTab === t.id
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:text-slate-400",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: SYSTEM ARCHITECTURE */}
              {activeTab === "architecture" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-white/[0.02] space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500">
                        PROBLEM STATEMENT
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {activeCase.problemStatement}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-white/[0.02] space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        ARCHITECTURAL SOLUTION
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {activeCase.architecturalSolution}
                      </p>
                    </div>
                  </div>

                  {/* Architecture Layer Stack */}
                  <div>
                    <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                      Multi-Tier Architecture Breakdown
                    </h5>
                    <div className="space-y-2">
                      {activeCase.architectureLayers.map((layer, idx) => (
                        <div
                          key={idx}
                          className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs dark:border-white/10 dark:bg-[#111714]"
                        >
                          <div className="flex items-center gap-3">
                            <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/10 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              L{idx + 1}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                {layer.layer}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {layer.component}
                              </p>
                            </div>
                          </div>

                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[10.5px] font-bold text-slate-700 dark:bg-white/10 dark:text-slate-300 shrink-0">
                            {layer.tech}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ENGINEERING METRICS */}
              {activeTab === "metrics" && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {activeCase.keyEngineeringMetrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-white/[0.02] text-center"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {m.label}
                      </span>
                      <p className="font-mono text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {m.value}
                      </p>
                      <p className="text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                        {m.detail}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: CORE IMPLEMENTATION */}
              {activeTab === "code" && (
                <div className="rounded-2xl border border-slate-300/80 bg-[#0d1117] text-white p-5 font-mono text-xs overflow-x-auto shadow-inner space-y-2">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[11px] text-slate-400">
                    <span>{activeCase.codeHighlight.filename}</span>
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase font-bold text-slate-300">
                      {activeCase.codeHighlight.language}
                    </span>
                  </div>
                  <pre className="text-emerald-300 pt-2 leading-relaxed">
                    <code>{activeCase.codeHighlight.code}</code>
                  </pre>
                </div>
              )}

              {/* TAB 4: CI TEST ASSERTIONS */}
              {activeTab === "tests" && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/20 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/10 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Continuous Integration Test Verification Suite
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      Piston Remote Runner
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeCase.testAssertions.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs dark:border-white/5 dark:bg-white/[0.02]"
                      >
                        <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[320px]">
                          {t.file}
                        </span>
                        <div className="flex items-center gap-3 text-[11px] font-mono">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            ✓ {t.testsPassed} passed
                          </span>
                          <span className="text-slate-400">({t.durationMs}ms)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================================= */}
          {/* RIGHT 4 COLUMNS: SKILLS, DEGREE ACCREDITATION & SECURE CONNECT          */}
          {/* ======================================================================= */}
          <div className="lg:col-span-4 space-y-5">
            {/* 1. Verified Competencies Matrix */}
            <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-[#121715]">
              <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-emerald-500" />
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Verified Competencies
                  </h4>
                </div>
                <Link
                  href="/student/skill-dna"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-0.5"
                >
                  Skill DNA <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { name: "React 19 & Next.js 16", score: 92, tone: "emerald" },
                  { name: "JavaScript DOM Engine", score: 96, tone: "emerald" },
                  { name: "PostgreSQL 16 & 3NF", score: 84, tone: "cyan" },
                  { name: "Fastify & Express APIs", score: 76, tone: "cyan" },
                  { name: "Data Structures & Big-O", score: 68, tone: "amber" },
                  { name: "Academic Integrity", score: 98, tone: "emerald" },
                ].map((skill) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{skill.name}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{skill.score}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          skill.score >= 90 ? "bg-emerald-500" : skill.score >= 75 ? "bg-cyan-500" : "bg-amber-500",
                        )}
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Institutional Degree Credential */}
            <div className="rounded-[28px] border-2 border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.06] via-white to-white p-5 shadow-xs dark:from-emerald-950/20 dark:via-[#121715] dark:to-[#121715] dark:border-emerald-500/25">
              <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Official Degree Credential
                  </h4>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[9.5px] font-bold text-emerald-700 dark:text-emerald-300">
                  VERIFIED
                </span>
              </div>

              <p className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                OTHM LEVEL 5 HIGHER NATIONAL DIPLOMA
              </p>
              <h5 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                BSc (Hons) Computer Science & Engineering
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                British Institute of Technology & Management (BITHM)
              </p>

              <div className="mt-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 dark:border-white/10 dark:bg-white/[0.02] text-[10.5px] font-mono text-slate-500 dark:text-slate-400">
                <p>CANDIDATE: BITHM-2026-0052</p>
                <p className="truncate mt-0.5">HASH: sha256:4f8e91c7a2b6d0e8...</p>
              </div>
            </div>

            {/* 3. Secure Contact & PDF Download Bar */}
            <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-[#121715] space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-500" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Get in Touch
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Available for junior full-stack software engineer roles, internships, or academic research collaborations.
              </p>

              <div className="pt-1 space-y-2">
                <a
                  href="mailto:ayat@bithm.edu.bd"
                  className="bento-primary-btn inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold !text-white shadow-xs transition hover:brightness-110"
                >
                  <Send className="h-3.5 w-3.5 !text-white" />
                  <span>Send Message to Ayat</span>
                </a>

                <button
                  type="button"
                  onClick={() => alert("Downloading verified PDF resume with lab test assertions...")}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <Download className="h-3.5 w-3.5 text-slate-400" />
                  <span>Download Verified CV (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
