"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Code2,
  Download,
  ExternalLink,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PortfolioRecord, PortfolioProject } from "./types";
import { PORTFOLIO_THEMES } from "./themes";

type RyanCvTab = "about" | "skills" | "works" | "resume" | "contact";

export function RyanCvView({
  portfolio,
  isOwnerView = false,
  isMobileView = false,
}: {
  portfolio: PortfolioRecord;
  isOwnerView?: boolean;
  isMobileView?: boolean;
}) {
  const {
    name,
    headline,
    bio,
    projects = [],
    education = [],
    contact,
    theme = "obsidian",
    skills = [],
    verifiedProofOfWork = [],
  } = portfolio;

  const activeTheme = PORTFOLIO_THEMES[theme] || PORTFOLIO_THEMES.obsidian;
  const [activeTab, setActiveTab] = useState<RyanCvTab>("about");
  const [projectFilter, setProjectFilter] = useState<"all" | "featured">("all");

  // Rotating subtitle role rotator (RyanCV style)
  const rotatingRoles = [
    headline || "Software Engineer",
    "DataOps & Systems Specialist",
    "Fullstack Architect",
    "Cloud & AI Engineer",
  ];
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % rotatingRoles.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [rotatingRoles.length]);

  const initials = (name || "?")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const filteredProjects =
    projectFilter === "featured"
      ? projects.filter((p) => p.featured)
      : projects;

  // Derive skill percentages for the RyanCV progress bar display
  const skillPercentages = skills.map((skill, i) => {
    const defaultPercents = [95, 90, 85, 80, 75, 88, 92, 84];
    return {
      name: skill,
      percentage: defaultPercents[i % defaultPercents.length],
    };
  });

  const isStacked = isMobileView;

  return (
    <div className={cn("relative mx-auto max-w-6xl w-full transition-colors duration-500", activeTheme.wrapperClass)}>
      {/* Ambient Mesh Glow */}
      <div className={cn(activeTheme.ambientGlowClass, "print:hidden")} aria-hidden="true" />

      <div className={cn("grid gap-5 sm:gap-6", isStacked ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12")}>
        {/* ===================== LEFT COLUMN: STICKY PROFILE VCARD ===================== */}
        <div className={cn(isStacked ? "col-span-1" : "lg:col-span-4")}>
          <div className={cn("sticky top-28 overflow-hidden rounded-[28px] border shadow-2xl transition-all", activeTheme.cardClass)}>
            {/* Top Sheen */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent print:hidden" />

            {/* Avatar / Portrait Image */}
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-black p-4 flex flex-col justify-between">
              {/* Live Preview Indicator */}
              <div className="flex items-center justify-between z-10">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: `${activeTheme.accentColor}20`,
                    border: `1px solid ${activeTheme.accentColor}50`,
                    color: activeTheme.accentColor,
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeTheme.accentColor }} />
                  RYANCV VCARD
                </span>

                {isOwnerView && (
                  <span className="rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-mono text-white/80 print:hidden">
                    LIVE
                  </span>
                )}
              </div>

              {/* Big Stylized Monogram / Avatar Graphic */}
              <div className="my-auto flex justify-center">
                <div
                  className="grid h-24 w-24 sm:h-28 sm:w-28 place-items-center rounded-3xl text-3xl sm:text-4xl font-black text-white shadow-2xl ring-2 ring-white/20 transition-transform duration-300 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${activeTheme.accentColor}, #2563eb)`,
                  }}
                >
                  {initials}
                </div>
              </div>

              {/* Verified Ribbon */}
              <div className="z-10 flex items-center justify-center gap-1 text-[11px] font-mono font-bold text-white/90">
                <ShieldCheck className="h-3.5 w-3.5" style={{ color: activeTheme.accentColor }} />
                <span>NEXORA OS VERIFIED</span>
              </div>
            </div>

            {/* Candidate Identity */}
            <div className="p-5 sm:p-6 text-center">
              <h1 className={cn("text-2xl sm:text-3xl font-black tracking-tight", activeTheme.headerNameClass)}>
                {name || "Untitled Engineer"}
              </h1>

              {/* Dynamic Typewriter / Rotating Subtitle */}
              <div className="mt-1.5 h-6 flex items-center justify-center overflow-hidden">
                <p
                  key={roleIndex}
                  className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider animate-in fade-in slide-in-from-bottom-2 duration-300 truncate max-w-[280px]"
                  style={{ color: activeTheme.accentColor }}
                >
                  {rotatingRoles[roleIndex]}
                </p>
              </div>

              {/* Location Pill */}
              {contact.location && (
                <p className={cn("mt-2 flex items-center justify-center gap-1.5 text-xs", activeTheme.subtextClass)}>
                  <MapPin className="h-3 w-3 opacity-70" />
                  <span>{contact.location}</span>
                </p>
              )}

              {/* Social Icons Bar */}
              <div className={cn("mt-5 flex items-center justify-center gap-2 border-t pt-4", activeTheme.dividerClass)}>
                {contact.github && (
                  <a
                    href={contact.github}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/15 hover:text-white"
                    title="GitHub"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
                {contact.linkedin && (
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/15 hover:text-white"
                    title="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {contact.website && (
                  <a
                    href={contact.website}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/15 hover:text-white"
                    title="Website"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/15 hover:text-white"
                    title="Email"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* Bottom Actions: Download CV & Contact Me */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300/80 bg-slate-100/90 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-200/90 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 print:hidden"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download CV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("contact")}
                  className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-slate-950 shadow-md transition hover:opacity-90"
                  style={{ backgroundColor: activeTheme.accentColor }}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Contact Me</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== RIGHT COLUMN: DYNAMIC CONTENT PANEL ===================== */}
        <div className={cn(isStacked ? "col-span-1" : "lg:col-span-8", "space-y-4")}>
          {/* TOP NAVIGATION BAR (RyanCV Tabs) */}
          <div className="sticky top-28 z-20 flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white/90 p-1.5 shadow-md backdrop-blur-2xl scrollbar-none dark:border-white/10 dark:bg-[#0c121e]/90 print:hidden">
            {[
              { id: "about", label: "About", icon: User },
              { id: "skills", label: "Skills", icon: Code2 },
              { id: "works", label: "Projects", icon: Briefcase },
              { id: "resume", label: "Resume", icon: GraduationCap },
              { id: "contact", label: "Contact", icon: Mail },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as RyanCvTab)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 sm:px-4 py-2 text-xs font-bold whitespace-nowrap transition-all",
                    isActive
                      ? "text-slate-950 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
                  )}
                  style={{
                    backgroundColor: isActive ? activeTheme.accentColor : "transparent",
                  }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT CONTAINER */}
          <div className={cn("overflow-hidden rounded-[28px] border p-6 sm:p-8 shadow-xl min-h-[500px]", activeTheme.cardClass)}>
            {/* ===================== TAB 1: ABOUT ===================== */}
            {activeTab === "about" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-mono font-bold uppercase tracking-wider"
                      style={{ color: activeTheme.accentColor }}
                    >
                      Hello, I’m
                    </span>
                  </div>
                  <h2 className={cn("text-2xl sm:text-3xl font-extrabold tracking-tight", activeTheme.headerNameClass)}>
                    {headline || "Senior Data Engineer & Solutions Architect"}
                  </h2>
                  <div
                    className="mt-2 h-1 w-16 rounded-full"
                    style={{ backgroundColor: activeTheme.accentColor }}
                  />
                </div>

                {bio && (
                  <p className={cn("text-sm sm:text-base leading-relaxed", activeTheme.bioClass)}>
                    {bio}
                  </p>
                )}

                {/* RyanCV 3-Metric Stats Counter */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className={activeTheme.itemCardClass}>
                    <p className="text-3xl sm:text-4xl font-black font-mono" style={{ color: activeTheme.accentColor }}>
                      {projects.length > 0 ? `${projects.length}+` : "12+"}
                    </p>
                    <p className={cn("mt-1 text-xs font-semibold uppercase tracking-wider", activeTheme.subtextClass)}>
                      Completed Projects
                    </p>
                  </div>

                  <div className={activeTheme.itemCardClass}>
                    <p className="text-3xl sm:text-4xl font-black font-mono" style={{ color: activeTheme.accentColor }}>
                      {verifiedProofOfWork.length > 0 ? `${verifiedProofOfWork.length}` : "4"}
                    </p>
                    <p className={cn("mt-1 text-xs font-semibold uppercase tracking-wider", activeTheme.subtextClass)}>
                      Verified Proof of Work
                    </p>
                  </div>

                  <div className={activeTheme.itemCardClass}>
                    <p className="text-3xl sm:text-4xl font-black font-mono" style={{ color: activeTheme.accentColor }}>
                      100%
                    </p>
                    <p className={cn("mt-1 text-xs font-semibold uppercase tracking-wider", activeTheme.subtextClass)}>
                      Cryptographic Authenticity
                    </p>
                  </div>
                </div>

                {/* Core Competencies Preview */}
                <div className={cn("pt-4 border-t", activeTheme.dividerClass)}>
                  <h3 className={cn("text-xs font-mono font-bold uppercase tracking-wider mb-3", activeTheme.sectionTitleClass)}>
                    Verified Core Competencies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.slice(0, 8).map((skill, index) => (
                      <span key={index} className={activeTheme.techChipClass}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===================== TAB 2: SKILLS ===================== */}
            {activeTab === "skills" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className={cn("text-xl sm:text-2xl font-bold tracking-tight", activeTheme.headerNameClass)}>
                    Technical Skills & Tools Stack
                  </h2>
                  <p className={cn("text-xs mt-1", activeTheme.subtextClass)}>
                    Quantitative proficiency validated by Nexora OS Code Labs & Projects.
                  </p>
                  <div
                    className="mt-2 h-1 w-14 rounded-full"
                    style={{ backgroundColor: activeTheme.accentColor }}
                  />
                </div>

                {/* RyanCV Percentage Progress Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {skillPercentages.map((item, idx) => (
                    <div key={idx} className={cn("p-3.5 rounded-xl border", activeTheme.dividerClass)}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                        <span className="text-xs font-mono font-bold" style={{ color: activeTheme.accentColor }}>
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: activeTheme.accentColor,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tool Stack Badges */}
                <div className={cn("pt-4 border-t", activeTheme.dividerClass)}>
                  <h3 className={cn("text-xs font-mono font-bold uppercase tracking-wider mb-3", activeTheme.sectionTitleClass)}>
                    Tools & Technologies Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, idx) => (
                      <div
                        key={idx}
                        className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border", activeTheme.dividerClass)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" style={{ color: activeTheme.accentColor }} />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===================== TAB 3: PROJECTS (WORKS) ===================== */}
            {activeTab === "works" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className={cn("text-xl sm:text-2xl font-bold tracking-tight", activeTheme.headerNameClass)}>
                      Portfolio Showcase
                    </h2>
                    <div
                      className="mt-1.5 h-1 w-12 rounded-full"
                      style={{ backgroundColor: activeTheme.accentColor }}
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-100/80 p-1 dark:border-white/10 dark:bg-white/5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setProjectFilter("all")}
                      className={cn(
                        "rounded-lg px-2.5 py-1 transition",
                        projectFilter === "all"
                          ? "bg-white text-slate-900 shadow-xs dark:bg-white/20 dark:text-white"
                          : "text-slate-500 hover:text-slate-900 dark:text-slate-400",
                      )}
                    >
                      All ({projects.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setProjectFilter("featured")}
                      className={cn(
                        "rounded-lg px-2.5 py-1 transition",
                        projectFilter === "featured"
                          ? "bg-white text-slate-900 shadow-xs dark:bg-white/20 dark:text-white"
                          : "text-slate-500 hover:text-slate-900 dark:text-slate-400",
                      )}
                    >
                      Featured
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProjects.map((p) => (
                    <div
                      key={p.id}
                      className={cn(
                        "group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                        p.featured ? activeTheme.featuredCardClass : activeTheme.itemCardClass,
                      )}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={cn("text-base font-bold line-clamp-1", activeTheme.headerNameClass)}>
                            {p.title}
                          </h3>
                          {p.featured && (
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold shrink-0"
                              style={{
                                backgroundColor: `${activeTheme.accentColor}20`,
                                color: activeTheme.accentColor,
                              }}
                            >
                              <Sparkles className="h-2.5 w-2.5" />
                              SPOTLIGHT
                            </span>
                          )}
                        </div>

                        {p.role && (
                          <p className="mt-1 text-xs font-semibold font-mono" style={{ color: activeTheme.accentColor }}>
                            {p.role} {p.period && `• ${p.period}`}
                          </p>
                        )}

                        {p.summary && (
                          <p className={cn("mt-2 text-xs leading-relaxed line-clamp-3", activeTheme.bioClass)}>
                            {p.summary}
                          </p>
                        )}

                        {p.stack && p.stack.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {p.stack.map((item, idx) => (
                              <span key={idx} className={activeTheme.techChipClass}>
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {p.links && p.links.length > 0 && (
                        <div className={cn("mt-4 pt-3 border-t flex flex-wrap gap-2", activeTheme.dividerClass)}>
                          {p.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold hover:underline"
                              style={{ color: activeTheme.accentColor }}
                            >
                              <span>{link.label || "Live Project"}</span>
                              <ArrowUpRight className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===================== TAB 4: RESUME & TIMELINE ===================== */}
            {activeTab === "resume" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className={cn("text-xl sm:text-2xl font-bold tracking-tight", activeTheme.headerNameClass)}>
                    Career & Academic Timeline
                  </h2>
                  <div
                    className="mt-1.5 h-1 w-12 rounded-full"
                    style={{ backgroundColor: activeTheme.accentColor }}
                  />
                </div>

                {/* Education Timeline */}
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider mb-4 text-slate-700 dark:text-slate-300">
                    <GraduationCap className="h-4 w-4" style={{ color: activeTheme.accentColor }} />
                    <span>Education & Certifications</span>
                  </h3>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300 dark:before:bg-white/10">
                    {education.map((edu) => (
                      <div key={edu.id} className="relative">
                        <span
                          className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white dark:border-black"
                          style={{ backgroundColor: activeTheme.accentColor }}
                        />
                        <span
                          className="inline-block rounded-full px-2 py-0.5 text-[10px] font-mono font-bold mb-1"
                          style={{
                            backgroundColor: `${activeTheme.accentColor}18`,
                            color: activeTheme.accentColor,
                          }}
                        >
                          {edu.period || "Current"}
                        </span>
                        <h4 className={cn("text-sm sm:text-base font-bold", activeTheme.headerNameClass)}>
                          {edu.degree}
                        </h4>
                        <p className={cn("text-xs font-medium", activeTheme.subtextClass)}>{edu.institution}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verified Proof of Work Timeline */}
                {verifiedProofOfWork.length > 0 && (
                  <div className={cn("pt-5 border-t", activeTheme.dividerClass)}>
                    <h3 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider mb-4 text-slate-700 dark:text-slate-300">
                      <ShieldCheck className="h-4 w-4" style={{ color: activeTheme.accentColor }} />
                      <span>Verified Lab Proofs</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {verifiedProofOfWork.map((proof) => (
                        <div key={proof.id} className={activeTheme.itemCardClass}>
                          <div className="flex items-start justify-between gap-1">
                            <p className={activeTheme.itemTitleClass}>{proof.title}</p>
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: activeTheme.accentColor }} />
                          </div>
                          <p className="mt-1 text-[11px] font-mono font-bold" style={{ color: activeTheme.accentColor }}>
                            {proof.score} • {proof.badgeLabel}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===================== TAB 5: CONTACT ===================== */}
            {activeTab === "contact" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className={cn("text-xl sm:text-2xl font-bold tracking-tight", activeTheme.headerNameClass)}>
                    Get in Touch
                  </h2>
                  <p className={cn("text-xs mt-1", activeTheme.subtextClass)}>
                    Open for engineering roles, technical consultations, and research collaborations.
                  </p>
                  <div
                    className="mt-1.5 h-1 w-12 rounded-full"
                    style={{ backgroundColor: activeTheme.accentColor }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className={cn("p-4 rounded-2xl border transition-all hover:border-emerald-500/50", activeTheme.itemCardClass)}
                    >
                      <Mail className="h-5 w-5 mb-2" style={{ color: activeTheme.accentColor }} />
                      <p className={activeTheme.subtextClass}>Email Address</p>
                      <p className="text-sm font-bold truncate mt-0.5 text-slate-900 dark:text-white">{contact.email}</p>
                    </a>
                  )}

                  {contact.location && (
                    <div className={cn("p-4 rounded-2xl border", activeTheme.itemCardClass)}>
                      <MapPin className="h-5 w-5 mb-2" style={{ color: activeTheme.accentColor }} />
                      <p className={activeTheme.subtextClass}>Location</p>
                      <p className="text-sm font-bold truncate mt-0.5 text-slate-900 dark:text-white">{contact.location}</p>
                    </div>
                  )}

                  {contact.github && (
                    <a
                      href={contact.github}
                      target="_blank"
                      rel="noreferrer"
                      className={cn("p-4 rounded-2xl border transition-all hover:border-emerald-500/50", activeTheme.itemCardClass)}
                    >
                      <Github className="h-5 w-5 mb-2" style={{ color: activeTheme.accentColor }} />
                      <p className={activeTheme.subtextClass}>GitHub Repository</p>
                      <p className="text-sm font-bold truncate mt-0.5 text-slate-900 dark:text-white">{contact.github}</p>
                    </a>
                  )}

                  {contact.linkedin && (
                    <a
                      href={contact.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className={cn("p-4 rounded-2xl border transition-all hover:border-emerald-500/50", activeTheme.itemCardClass)}
                    >
                      <Linkedin className="h-5 w-5 mb-2" style={{ color: activeTheme.accentColor }} />
                      <p className={activeTheme.subtextClass}>LinkedIn Profile</p>
                      <p className="text-sm font-bold truncate mt-0.5 text-slate-900 dark:text-white">{contact.linkedin}</p>
                    </a>
                  )}
                </div>

                {/* Direct Message Action */}
                {contact.email && (
                  <div className="pt-3">
                    <a
                      href={`mailto:${contact.email}?subject=${encodeURIComponent(`Inquiry for ${name}`)}`}
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg transition hover:opacity-90"
                      style={{ backgroundColor: activeTheme.accentColor }}
                    >
                      <Send className="h-4 w-4" />
                      <span>Send Direct Email Inquiry</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

