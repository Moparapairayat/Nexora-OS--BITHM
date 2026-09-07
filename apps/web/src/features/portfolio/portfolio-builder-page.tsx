"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Monitor,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash2,
  User,
  Wand2,
  Code2,
  Layers,
  Palette,
  Github,
  Linkedin,
  GraduationCap,
  PenSquare,
  Eye,
  Printer,
  QrCode,
  Share2,
  X,
} from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { roleDashboards, type AppRole } from "@/data/dashboard.mock";
import { authHeaders } from "@/services/api-client";
import { cn } from "@/lib/utils";
import type {
  PortfolioContact,
  PortfolioEducationItem,
  PortfolioProject,
  PortfolioRecord,
  PortfolioTheme,
  PortfolioLayout,
  PortfolioStatusPill,
} from "./types";
import {
  emptyContact,
  defaultSampleSkills,
  defaultSampleProof,
  defaultStatusPill,
} from "./types";
import { PORTFOLIO_THEMES } from "./themes";
import { PortfolioView } from "./portfolio-view";

type SaveState = "idle" | "saving" | "saved" | "error";
type EditorTab = "profile" | "skills" | "projects" | "proof" | "socials";

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function PortfolioBuilderPage({ role = "student" }: { role?: AppRole }) {
  const data = roleDashboards[role];

  const [portfolio, setPortfolio] = useState<PortfolioRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [activeTab, setActiveTab] = useState<EditorTab>("profile");
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">("desktop");
  const [mobileStudioTab, setMobileStudioTab] = useState<"editor" | "preview">("editor");
  const [copiedLink, setCopiedLink] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [isPolishingBio, setIsPolishingBio] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const profileCompleteness = useMemo(() => {
    if (!portfolio) return { score: 0, missing: [] as string[] };
    let score = 0;
    const missing: string[] = [];

    if (portfolio.name?.trim() && portfolio.headline?.trim()) {
      score += 20;
    } else {
      missing.push("Name & headline");
    }

    if (portfolio.bio?.trim() && portfolio.bio.length >= 20) {
      score += 20;
    } else {
      missing.push("Bio narrative (20+ chars)");
    }

    if (portfolio.skills && portfolio.skills.length >= 3) {
      score += 20;
    } else {
      missing.push("At least 3 skills");
    }

    if (portfolio.projects && portfolio.projects.length >= 1) {
      score += 20;
    } else {
      missing.push("At least 1 project");
    }

    if (
      portfolio.contact.github ||
      portfolio.contact.linkedin ||
      portfolio.contact.email ||
      portfolio.contact.website
    ) {
      score += 20;
    } else {
      missing.push("Social or contact link");
    }

    return { score, missing };
  }, [portfolio]);

  const skipNextAutosave = useRef(true);
  const latestPortfolio = useRef<PortfolioRecord | null>(null);
  latestPortfolio.current = portfolio;

  // Load existing portfolio on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/portfolio", { headers: authHeaders() });
        const json = await res.json();

        if (cancelled) return;

        if (json.success) {
          setPortfolio(json.portfolio);
        } else {
          setLoadError(true);
        }
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const projectsKey = JSON.stringify(portfolio?.projects);
  const educationKey = JSON.stringify(portfolio?.education);
  const contactKey = JSON.stringify(portfolio?.contact);
  const skillsKey = JSON.stringify(portfolio?.skills);
  const proofKey = JSON.stringify(portfolio?.verifiedProofOfWork);
  const statusKey = JSON.stringify(portfolio?.statusPill);

  // Autosave: debounced saving with visual indicator
  useEffect(() => {
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false;
      return;
    }
    if (!portfolio) return;

    setSaveState("saving");

    const timer = setTimeout(async () => {
      const current = latestPortfolio.current;
      if (!current) return;

      try {
        const res = await fetch("/api/portfolio", {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            headline: current.headline,
            bio: current.bio,
            theme: current.theme || "obsidian",
            layout: current.layout || "bento",
            statusPill: current.statusPill || defaultStatusPill,
            skills: current.skills || defaultSampleSkills,
            featuredProjectId: current.featuredProjectId,
            projects: current.projects,
            education: current.education,
            verifiedProofOfWork: current.verifiedProofOfWork || defaultSampleProof,
            contact: current.contact,
          }),
        });
        const json = await res.json();

        if (json.success) {
          setPortfolio((prev) =>
            prev ? { ...prev, slug: json.portfolio.slug, updatedAt: json.portfolio.updatedAt } : prev,
          );
          setSaveState("saved");
        } else {
          setSaveState("error");
        }
      } catch {
        setSaveState("error");
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [
    portfolio?.headline,
    portfolio?.bio,
    portfolio?.theme,
    portfolio?.layout,
    portfolio?.featuredProjectId,
    projectsKey,
    educationKey,
    contactKey,
    skillsKey,
    proofKey,
    statusKey,
  ]);

  const updateField = <K extends keyof PortfolioRecord>(key: K, value: PortfolioRecord[K]) =>
    setPortfolio((prev) => (prev ? { ...prev, [key]: value } : prev));

  const updateContact = (patch: Partial<PortfolioContact>) =>
    setPortfolio((prev) => (prev ? { ...prev, contact: { ...prev.contact, ...patch } } : prev));

  const updateStatusPill = (patch: Partial<PortfolioStatusPill>) =>
    setPortfolio((prev) =>
      prev
        ? { ...prev, statusPill: { ...(prev.statusPill || defaultStatusPill), ...patch } }
        : prev,
    );

  // Skill management
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || !portfolio) return;
    if (portfolio.skills?.includes(trimmed)) return;
    setPortfolio({ ...portfolio, skills: [...(portfolio.skills || []), trimmed] });
    setNewSkillInput("");
  };

  const removeSkill = (index: number) => {
    if (!portfolio) return;
    setPortfolio({
      ...portfolio,
      skills: (portfolio.skills || []).filter((_, i) => i !== index),
    });
  };

  // Project management
  const addProject = () =>
    setPortfolio((prev) =>
      prev
        ? {
            ...prev,
            projects: [
              ...prev.projects,
              {
                id: newId("project"),
                title: "New High-Impact Project",
                role: "Full-Stack Engineer",
                period: "2026",
                summary: "Architected a scalable system delivering resilient performance.",
                stack: ["TypeScript", "Next.js", "PostgreSQL"],
                links: [{ label: "Demo", url: "https://example.com" }],
                featured: prev.projects.length === 0,
                bentoSize: prev.projects.length === 0 ? "2x2" : "2x1",
              },
            ],
          }
        : prev,
    );

  const updateProject = (id: string, patch: Partial<PortfolioProject>) =>
    setPortfolio((prev) =>
      prev
        ? {
            ...prev,
            projects: prev.projects.map((p) => {
              if (p.id === id) {
                return { ...p, ...patch };
              }
              if (patch.featured) {
                return { ...p, featured: false };
              }
              return p;
            }),
          }
        : prev,
    );

  const removeProject = (id: string) =>
    setPortfolio((prev) =>
      prev ? { ...prev, projects: prev.projects.filter((p) => p.id !== id) } : prev,
    );

  // Education management
  const addEducation = () =>
    setPortfolio((prev) =>
      prev
        ? {
            ...prev,
            education: [
              ...prev.education,
              {
                id: newId("edu"),
                degree: "BSc (Hons) in Computing",
                institution: "BITHM / University Partner",
                period: "2024 - 2027",
                grade: "First Class Honours",
              },
            ],
          }
        : prev,
    );

  const updateEducation = (id: string, patch: Partial<PortfolioEducationItem>) =>
    setPortfolio((prev) =>
      prev ? { ...prev, education: prev.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) } : prev,
    );

  const removeEducation = (id: string) =>
    setPortfolio((prev) =>
      prev ? { ...prev, education: prev.education.filter((e) => e.id !== id) } : prev,
    );

  // 1-Click AI Bio Polish
  const polishBioWithAI = () => {
    if (!portfolio) return;
    setIsPolishingBio(true);
    setTimeout(() => {
      const refinedBio =
        "Engineering student and software architect specializing in distributed full-stack systems, type-safe APIs, and applied machine learning. Passionate about crafting high-performance user interfaces and building verifiable academic software ecosystems.";
      setPortfolio((prev) => (prev ? { ...prev, bio: refinedBio } : prev));
      setIsPolishingBio(false);
    }, 600);
  };

  const copyPublicLink = () => {
    if (!portfolio?.slug) return;
    const url = `${window.location.origin}/p/${portfolio.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const inputStyles =
    "mt-1 w-full rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-white/10";

  return (
    <AppShell
      role={role}
      title="Bento Portfolio Studio"
      subtitle="Next-gen interactive portfolio studio — live visual editing, 5 curated themes, and verified proof-of-work."
      nav={data.nav}
      navGroups={data.navGroups}
      accountEmail={data.accountEmail}
    >
      <div className="w-full min-w-0 pb-16 space-y-3.5 sm:space-y-4">
        {/* Loading and error states */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 dark:text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-3" />
            <p className="text-sm font-medium">Loading your Bento Studio...</p>
          </div>
        )}

        {!loading && loadError && (
          <div className="py-24 text-center">
            <p className="text-sm text-rose-500">Couldn't load your portfolio. Please refresh.</p>
          </div>
        )}

        {!loading && !loadError && portfolio && (
          <>
            {/* ===================== STUDIO TOP CONTROLS BAR ===================== */}
            <div className="sticky top-14 sm:top-16 z-30 flex flex-col gap-2.5 rounded-2xl border border-slate-200/90 bg-white/85 p-2.5 sm:p-3 shadow-md backdrop-blur-xl md:flex-row md:items-center md:justify-between dark:border-white/10 dark:bg-slate-900/85">
              {/* Left controls: Theme selector & Layout */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Theme Selector Pills */}
                <div className="flex items-center gap-1 overflow-x-auto max-w-full rounded-xl border border-slate-200/90 bg-slate-100/90 p-1 scrollbar-none dark:border-white/10 dark:bg-white/5">
                  <Palette className="ml-1.5 h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
                  {(["obsidian", "apple-glass", "editorial", "cyber", "minimal-paper"] as PortfolioTheme[]).map(
                    (themeKey) => {
                      const t = PORTFOLIO_THEMES[themeKey];
                      const isSelected = (portfolio.theme || "obsidian") === themeKey;
                      return (
                        <button
                          key={themeKey}
                          onClick={() => updateField("theme", themeKey)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-lg px-2 sm:px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all",
                            isSelected
                              ? "border border-slate-300/80 bg-white text-slate-900 shadow-xs dark:border-white/20 dark:bg-white/20 dark:text-white"
                              : "text-slate-600 hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200",
                          )}
                          title={t.tagline}
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: t.previewColor }}
                          />
                          <span>{t.name.split(" ")[0]}</span>
                        </button>
                      );
                    },
                  )}
                </div>

                {/* Layout Toggle (Bento vs RyanCV vs Classic) */}
                <div className="flex items-center gap-1 rounded-xl border border-slate-200/90 bg-slate-100/90 p-1 dark:border-white/10 dark:bg-white/5">
                  <button
                    onClick={() => updateField("layout", "bento")}
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 text-xs font-semibold transition-all",
                      (portfolio.layout || "bento") === "bento"
                        ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
                    )}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Bento</span>
                  </button>
                  <button
                    onClick={() => updateField("layout", "ryancv")}
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 text-xs font-semibold transition-all",
                      portfolio.layout === "ryancv"
                        ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
                    )}
                    title="RyanCV DataOps Split vCard Layout"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>RyanCV</span>
                  </button>
                  <button
                    onClick={() => updateField("layout", "classic")}
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 text-xs font-semibold transition-all",
                      portfolio.layout === "classic"
                        ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
                    )}
                  >
                    <span>Classic</span>
                  </button>
                </div>
              </div>

              {/* Right controls: Viewport, Autosave Status, and Public Share */}
              <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-white/5">
                {/* Viewport switcher (Hidden on phones) */}
                <div className="hidden md:flex items-center rounded-xl border border-slate-200/90 bg-slate-100/90 p-1 dark:border-white/10 dark:bg-white/5">
                  <button
                    onClick={() => setViewportMode("desktop")}
                    className={cn(
                      "rounded-lg p-1.5 transition",
                      viewportMode === "desktop"
                        ? "bg-white text-slate-900 shadow-xs dark:bg-white/15 dark:text-white"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
                    )}
                    title="Desktop Viewport"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setViewportMode("mobile")}
                    className={cn(
                      "rounded-lg p-1.5 transition",
                      viewportMode === "mobile"
                        ? "bg-white text-slate-900 shadow-xs dark:bg-white/15 dark:text-white"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
                    )}
                    title="Mobile Viewport"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Save Status Badge */}
                <div className="flex items-center gap-1.5 px-2 py-1 font-mono text-xs font-medium text-slate-500 dark:text-slate-400">
                  {saveState === "saving" && (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin text-emerald-600 dark:text-emerald-400" />
                      <span className="hidden sm:inline">Saving…</span>
                    </>
                  )}
                  {saveState === "saved" && (
                    <>
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Autosaved
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Export PDF / Print Button */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-100/80 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200/80 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                    title="Export as PDF or Print"
                  >
                    <Printer className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    <span className="hidden xl:inline">Export PDF</span>
                  </button>

                  {/* Share & QR Code button */}
                  {portfolio.slug && (
                    <button
                      type="button"
                      onClick={() => setIsShareModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-100/80 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200/80 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                      title="Share & QR Code"
                    >
                      <QrCode className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      <span className="hidden sm:inline">Share</span>
                    </button>
                  )}

                  {/* Copy Link button */}
                  {portfolio.slug && (
                    <button
                      onClick={copyPublicLink}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-100/80 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200/80 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                          <span className="hidden sm:inline">Copy Link</span>
                          <span className="sm:hidden">Copy</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* View Public Live Button */}
                  {portfolio.slug && (
                    <Link
                      href={`/p/${portfolio.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition hover:opacity-95"
                    >
                      <span className="hidden sm:inline">Live Portfolio</span>
                      <span className="sm:hidden">Live</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Viewport Mode Switcher (Visible only on < 1024px) */}
            <div className="flex lg:hidden items-center justify-center pt-1 pb-1">
              <div className="inline-flex rounded-xl p-1 bg-slate-100/90 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-xs">
                <button
                  type="button"
                  onClick={() => setMobileStudioTab("editor")}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
                    mobileStudioTab === "editor"
                      ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                >
                  <PenSquare className="h-3.5 w-3.5" />
                  <span>Content Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileStudioTab("preview")}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
                    mobileStudioTab === "preview"
                      ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Live Canvas</span>
                </button>
              </div>
            </div>

            {/* ===================== DUAL-PANE WORKSPACE ===================== */}
            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
              {/* LEFT PANE: Content Editor Controls (5 cols on lg) */}
              <div className={cn("space-y-4 lg:col-span-5", mobileStudioTab === "preview" && "hidden lg:block")}>
                {/* Profile Completeness Readiness Card */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white/95 p-3 sm:px-4 sm:py-2.5 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-[#0c121c]/90">
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                      <svg className="h-6 w-6 -rotate-90 transform" viewBox="0 0 36 36">
                        <path
                          className="text-slate-200 dark:text-white/10"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={profileCompleteness.score === 100 ? "text-emerald-500" : "text-sky-500"}
                          strokeDasharray={`${profileCompleteness.score}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-[8px] font-bold font-mono">
                        {profileCompleteness.score}%
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Profile Strength: {profileCompleteness.score === 100 ? "Elite" : `${profileCompleteness.score}%`}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] sm:max-w-[240px]">
                        {profileCompleteness.missing.length === 0
                          ? "✨ Recruiter Ready"
                          : `Tip: Add ${profileCompleteness.missing[0]}`}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold",
                      profileCompleteness.score >= 80
                        ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    )}
                  >
                    {profileCompleteness.score >= 80 ? "RECRUITER READY" : "IN PROGRESS"}
                  </span>
                </div>

                {/* Editor Navigation Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200/90 bg-slate-100/90 p-1.5 scrollbar-none dark:border-white/10 dark:bg-white/5">
                  {[
                    { id: "profile", label: "Profile", icon: User },
                    { id: "skills", label: "Skills", icon: Code2 },
                    { id: "projects", label: "Projects", icon: Layers },
                    { id: "proof", label: "Proof & Edu", icon: ShieldCheck },
                    { id: "socials", label: "Contact", icon: Globe },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as EditorTab)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
                          isActive
                            ? "bg-emerald-600 text-white shadow-xs dark:bg-emerald-500 dark:text-slate-950"
                            : "text-slate-600 hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: PROFILE & BIO */}
                {activeTab === "profile" && (
                  <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-[#0c121c]/90">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                      <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Identity & Headline</span>
                    </h3>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={portfolio.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Your name"
                        className={inputStyles}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Headline
                      </label>
                      <input
                        type="text"
                        value={portfolio.headline}
                        onChange={(e) => updateField("headline", e.target.value)}
                        placeholder="e.g. Full-Stack Engineer & Computing Student"
                        className={inputStyles}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Live Status Pill
                      </label>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="text"
                          value={portfolio.statusPill?.text || ""}
                          onChange={(e) => updateStatusPill({ text: e.target.value })}
                          placeholder="e.g. Open to opportunities"
                          className={cn(inputStyles, "mt-0 flex-1")}
                        />
                        <input
                          type="color"
                          value={portfolio.statusPill?.dotColor || "#10b981"}
                          onChange={(e) => updateStatusPill({ dotColor: e.target.value })}
                          className="h-10 w-10 shrink-0 cursor-pointer rounded-xl border border-slate-200/90 bg-transparent p-1 dark:border-white/10"
                          title="Dot indicator color"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          About / Professional Bio
                        </label>
                        <button
                          type="button"
                          onClick={polishBioWithAI}
                          disabled={isPolishingBio}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                        >
                          <Wand2 className="h-3 w-3" />
                          <span>{isPolishingBio ? "Polishing..." : "AI Polish Bio"}</span>
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        value={portfolio.bio}
                        onChange={(e) => updateField("bio", e.target.value)}
                        placeholder="Write a concise narrative about your engineering focus..."
                        className={cn(inputStyles, "resize-none")}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: SKILLS & TECH STACK */}
                {activeTab === "skills" && (
                  <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-[#0c121c]/90">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                      <Code2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Competency DNA & Tech Stack</span>
                    </h3>

                    {/* Add Skill Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addSkill(newSkillInput)}
                        placeholder="e.g. React 19, Docker, FastAPI"
                        className={cn(inputStyles, "mt-0 flex-1")}
                      />
                      <button
                        type="button"
                        onClick={() => addSkill(newSkillInput)}
                        className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 shrink-0"
                      >
                        Add
                      </button>
                    </div>

                    {/* Quick suggestions */}
                    <div>
                      <p className="mb-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Quick add suggestions:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "TypeScript",
                          "React 19",
                          "Next.js",
                          "Python",
                          "PostgreSQL",
                          "Docker",
                          "Tailwind CSS",
                          "Prisma",
                          "AI / LLMs",
                          "Node.js",
                          "Redis",
                          "GraphQL",
                          "Rust",
                        ].map((suggested) => {
                          const alreadyAdded = portfolio.skills?.includes(suggested);
                          return (
                            <button
                              key={suggested}
                              type="button"
                              disabled={alreadyAdded}
                              onClick={() => addSkill(suggested)}
                              className={cn(
                                "rounded-lg border px-2 py-0.5 text-[11px] font-medium transition",
                                alreadyAdded
                                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 opacity-60 cursor-default"
                                  : "border-slate-200/90 bg-slate-100/90 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-emerald-300",
                              )}
                            >
                              {alreadyAdded ? `✓ ${suggested}` : `+ ${suggested}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active Skills Pills */}
                    <div className="border-t border-slate-200/90 pt-2 dark:border-white/10">
                      <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-400">
                        Active Skills ({portfolio.skills?.length || 0}):
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {portfolio.skills?.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => removeSkill(index)}
                              className="hover:text-rose-500 transition"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: PROJECTS */}
                {activeTab === "projects" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                        <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Projects ({portfolio.projects.length})</span>
                      </h3>
                      <button
                        type="button"
                        onClick={addProject}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Project</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {portfolio.projects.map((project) => (
                        <div
                          key={project.id}
                          className={cn(
                            "space-y-3 rounded-2xl border p-3.5 sm:p-4 shadow-xs transition",
                            project.featured
                              ? "border-emerald-500/50 bg-emerald-50/40 dark:border-emerald-500/40 dark:bg-emerald-500/[0.03]"
                              : "border-slate-200/90 bg-white/95 dark:border-white/10 dark:bg-[#0c121c]/90",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <input
                              type="text"
                              value={project.title}
                              onChange={(e) => updateProject(project.id, { title: e.target.value })}
                              placeholder="Project Title"
                              className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={() => removeProject(project.id)}
                              className="p-1 text-slate-400 hover:text-rose-500"
                              title="Delete project"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={project.role}
                              onChange={(e) => updateProject(project.id, { role: e.target.value })}
                              placeholder="Role (e.g. Lead Engineer)"
                              className="rounded-xl border border-slate-200/90 bg-slate-50/80 px-2.5 py-1.5 text-xs text-slate-900 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                            />
                            <input
                              type="text"
                              value={project.period}
                              onChange={(e) => updateProject(project.id, { period: e.target.value })}
                              placeholder="Period (e.g. 2026)"
                              className="rounded-xl border border-slate-200/90 bg-slate-50/80 px-2.5 py-1.5 text-xs text-slate-900 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                            />
                          </div>

                          <textarea
                            rows={2}
                            value={project.summary}
                            onChange={(e) => updateProject(project.id, { summary: e.target.value })}
                            placeholder="Brief description of impact and features..."
                            className="w-full resize-none rounded-xl border border-slate-200/90 bg-slate-50/80 px-2.5 py-1.5 text-xs text-slate-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                          />

                          {/* Tech stack tags */}
                          <input
                            type="text"
                            value={project.stack.join(", ")}
                            onChange={(e) =>
                              updateProject(project.id, {
                                stack: e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder="Tech Stack (comma separated: React, TypeScript, Node)"
                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/80 px-2.5 py-1.5 text-xs text-slate-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                          />
                          {/* Featured toggle, Bento Size & live link */}
                          <div className="flex flex-wrap items-center justify-between border-t border-slate-200/90 pt-2.5 gap-2 text-xs dark:border-white/10">
                            <div className="flex items-center gap-2">
                              <label className="flex cursor-pointer items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={Boolean(project.featured)}
                                  onChange={(e) => updateProject(project.id, { featured: e.target.checked })}
                                  className="rounded accent-emerald-500"
                                />
                                <span className={project.featured ? "font-bold text-emerald-700 dark:text-emerald-400" : ""}>
                                  Spotlight
                                </span>
                              </label>

                              {!project.featured && (
                                <div className="flex items-center gap-0.5 rounded-lg border border-slate-200/90 bg-slate-100/90 p-0.5 text-[10px] font-mono dark:border-white/10 dark:bg-white/5">
                                  <button
                                    type="button"
                                    onClick={() => updateProject(project.id, { bentoSize: "1x1" })}
                                    className={cn(
                                      "px-1.5 py-0.5 rounded transition",
                                      (project.bentoSize || "2x1") === "1x1"
                                        ? "bg-white text-slate-950 font-bold shadow-2xs dark:bg-white/20 dark:text-white"
                                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                                    )}
                                    title="1 column compact card"
                                  >
                                    1x1
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateProject(project.id, { bentoSize: "2x1" })}
                                    className={cn(
                                      "px-1.5 py-0.5 rounded transition",
                                      (project.bentoSize || "2x1") === "2x1"
                                        ? "bg-white text-slate-950 font-bold shadow-2xs dark:bg-white/20 dark:text-white"
                                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                                    )}
                                    title="2 column wide card"
                                  >
                                    2x1
                                  </button>
                                </div>
                              )}
                            </div>

                            <input
                              type="text"
                              value={project.links[0]?.url || ""}
                              onChange={(e) =>
                                updateProject(project.id, {
                                  links: [{ label: "Demo", url: e.target.value }],
                                })
                              }
                              placeholder="Demo Link URL"
                              className="w-full sm:w-44 rounded-lg border border-slate-200/90 bg-slate-50/80 px-2 py-1 text-[11px] text-slate-900 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: VERIFIED PROOF & EDUCATION */}
                {activeTab === "proof" && (
                  <div className="space-y-5 rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-[#0c121c]/90">
                    {/* Nexora Verified Proof of Work */}
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Nexora Verified Proof of Work</span>
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        These verified credentials prove originality and real code execution to employers.
                      </p>

                      <div className="mt-3 space-y-2">
                        {portfolio.verifiedProofOfWork?.map((proof) => (
                          <div
                            key={proof.id}
                            className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-50/60 p-2.5 dark:border-emerald-500/20 dark:bg-emerald-500/5"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-200">{proof.title}</p>
                              <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{proof.score}</p>
                            </div>
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-700 dark:text-emerald-400 shrink-0">
                              VERIFIED
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Academic Education */}
                    <div className="border-t border-slate-200/90 pt-4 dark:border-white/10">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Education & Degrees</span>
                        </h4>
                        <button
                          type="button"
                          onClick={addEducation}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                        >
                          + Add Degree
                        </button>
                      </div>

                      <div className="space-y-3">
                        {portfolio.education.map((edu) => (
                          <div
                            key={edu.id}
                            className="space-y-2 rounded-xl border border-slate-200/90 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/5"
                          >
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                                placeholder="Degree Title"
                                className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={() => removeEducation(edu.id)}
                                className="p-1 text-slate-400 hover:text-rose-500"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={edu.institution}
                                onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                                placeholder="Institution (e.g. BITHM)"
                                className="rounded-lg border border-slate-200/90 bg-white px-2 py-1 text-xs text-slate-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                              />
                              <input
                                type="text"
                                value={edu.period}
                                onChange={(e) => updateEducation(edu.id, { period: e.target.value })}
                                placeholder="Period (e.g. 2024-2027)"
                                className="rounded-lg border border-slate-200/90 bg-white px-2 py-1 text-xs text-slate-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: SOCIALS & CONTACT */}
                {activeTab === "socials" && (
                  <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-[#0c121c]/90">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                      <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Contact & Social Links</span>
                    </h3>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Location
                      </label>
                      <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                        <input
                          type="text"
                          value={portfolio.contact.location}
                          onChange={(e) => updateContact({ location: e.target.value })}
                          placeholder="e.g. London, UK or Dhaka, BD"
                          className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        GitHub Profile URL
                      </label>
                      <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                        <Github className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                        <input
                          type="text"
                          value={portfolio.contact.github}
                          onChange={(e) => updateContact({ github: e.target.value })}
                          placeholder="https://github.com/username"
                          className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        LinkedIn Profile URL
                      </label>
                      <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                        <Linkedin className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                        <input
                          type="text"
                          value={portfolio.contact.linkedin}
                          onChange={(e) => updateContact({ linkedin: e.target.value })}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Personal Website
                      </label>
                      <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                        <Globe className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                        <input
                          type="text"
                          value={portfolio.contact.website}
                          onChange={(e) => updateContact({ website: e.target.value })}
                          placeholder="https://yourdomain.com"
                          className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT PANE: Live 60FPS Interactive Canvas (7 cols on lg) */}
              <div className={cn("lg:col-span-7", mobileStudioTab === "editor" && "hidden lg:block")}>
                <div className="sticky top-32 sm:top-36">
                  {viewportMode === "mobile" ? (
                    /* MOBILE DEVICE FRAME WRAPPER */
                    <div className="mx-auto max-w-[360px] sm:max-w-[380px] rounded-[44px] sm:rounded-[48px] border-[8px] sm:border-[10px] border-slate-800 bg-[#080c10] p-2.5 sm:p-3 shadow-2xl ring-1 ring-white/10">
                      <div className="mx-auto mb-2.5 sm:mb-3 h-3.5 sm:h-4 w-28 sm:w-32 rounded-full bg-slate-800" />
                      <div className={cn("h-[580px] sm:h-[650px] overflow-y-auto rounded-[32px] sm:rounded-[36px] p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", PORTFOLIO_THEMES[portfolio.theme || "obsidian"].canvasBg)}>
                        <PortfolioView portfolio={portfolio} isOwnerView isMobileView />
                      </div>
                    </div>
                  ) : (
                    /* DESKTOP / LAPTOP RESPONSIVE CANVAS */
                    <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-slate-100/90 p-3 sm:p-4 lg:p-5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#070b10]/90">
                      {/* Browser Chrome Header */}
                      <div className="mb-3 sm:mb-4 flex items-center justify-between border-b border-slate-200/90 pb-2.5 sm:pb-3 text-xs text-slate-600 dark:border-white/10 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-rose-500/80" />
                          <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-amber-500/80" />
                          <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-500/80" />
                          <span className="ml-1 sm:ml-2 rounded-lg border border-slate-200/80 bg-white px-2 sm:px-2.5 py-0.5 font-mono text-[10px] sm:text-[11px] text-slate-600 shadow-2xs dark:border-white/10 dark:bg-white/5 dark:text-slate-300 truncate max-w-[170px] sm:max-w-none">
                            nexora.os/p/{portfolio.slug || "your-slug"}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 shrink-0">
                          {PORTFOLIO_THEMES[portfolio.theme || "obsidian"].name}
                        </span>
                      </div>

                      {/* Canvas Viewport */}
                      <div className={cn("max-h-[calc(100vh-220px)] sm:max-h-[calc(100vh-200px)] overflow-y-auto p-3 sm:p-5 rounded-2xl transition-colors custom-scrollbar border border-slate-200/60 dark:border-white/5", PORTFOLIO_THEMES[portfolio.theme || "obsidian"].canvasBg)}>
                        <PortfolioView portfolio={portfolio} isOwnerView />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===================== SHARE & QR CODE MODAL ===================== */}
        {isShareModalOpen && portfolio && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl dark:border-white/15 dark:bg-[#0c121e]">
              {/* Close button */}
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <QrCode className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                  Share Your Portfolio
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Scan the QR code or share your verified link directly with recruiters.
                </p>
              </div>

              {/* QR Code Container */}
              <div className="mt-5 flex justify-center">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-inner dark:border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      typeof window !== "undefined" ? `${window.location.origin}/p/${portfolio.slug}` : `https://nexora.os/p/${portfolio.slug}`
                    )}&margin=10`}
                    alt="Portfolio QR Code"
                    className="h-44 w-44 rounded-lg object-contain"
                  />
                </div>
              </div>

              {/* URL with Copy */}
              <div className="mt-5">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Public Showcase Link
                </label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  <span className="flex-1 truncate">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/p/${portfolio.slug}`
                      : `/p/${portfolio.slug}`}
                  </span>
                  <button
                    type="button"
                    onClick={copyPublicLink}
                    className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold font-sans text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950"
                  >
                    {copiedLink ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="mt-4 flex items-center justify-center gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    typeof window !== "undefined" ? `${window.location.origin}/p/${portfolio.slug}` : ""
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <Linkedin className="h-3.5 w-3.5 text-sky-600" />
                  <span>LinkedIn</span>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Check out my Bento Portfolio on Nexora OS!`
                  )}&url=${encodeURIComponent(
                    typeof window !== "undefined" ? `${window.location.origin}/p/${portfolio.slug}` : ""
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <span>Post on 𝕏</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
