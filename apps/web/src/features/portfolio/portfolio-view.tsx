"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Globe,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PortfolioRecord } from "./types";
import { PORTFOLIO_THEMES, type ThemeConfig } from "./themes";
import { RyanCvView } from "./ryancv-view";

function ContactPill({
  href,
  icon: Icon,
  label,
  themeConfig,
}: {
  href: string;
  icon: typeof Github;
  label: string;
  themeConfig: ThemeConfig;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className={cn(themeConfig.contactPillClass, "max-w-full truncate")}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: themeConfig.accentColor }} />
      <span className="truncate">{label}</span>
      {href.startsWith("http") && <ArrowUpRight className="h-3 w-3 shrink-0 opacity-60" />}
    </a>
  );
}

export function PortfolioView({
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
    layout = "bento",
    statusPill,
    skills = [],
    verifiedProofOfWork = [],
  } = portfolio;

  const activeTheme = PORTFOLIO_THEMES[theme] || PORTFOLIO_THEMES.obsidian;

  const initials = (name || "?")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const featuredProject =
    projects.find((p) => p.featured) || projects[0] || null;
  const standardProjects = featuredProject
    ? projects.filter((p) => p.id !== featuredProject.id)
    : projects;

  // If isMobileView is forced (inside the phone mockup), we enforce 100% 1-column layout
  // regardless of the laptop window's desktop media queries!
  const gridLayoutClass = isMobileView
    ? "grid-cols-1 gap-3.5"
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5";

  const heroSpanClass = isMobileView
    ? "col-span-1"
    : "md:col-span-2 lg:col-span-3";

  const verifiedProofSpanClass = isMobileView
    ? "col-span-1"
    : "md:col-span-2 lg:col-span-1";

  const skillsSpanClass = isMobileView
    ? "col-span-1"
    : "md:col-span-2 lg:col-span-4";

  const featuredProjectSpanClass = isMobileView
    ? "col-span-1"
    : "md:col-span-2 lg:col-span-3";

  const educationSpanClass = isMobileView
    ? "col-span-1"
    : featuredProject
    ? "md:col-span-2 lg:col-span-1"
    : "md:col-span-2 lg:col-span-4";

  const standardProjectSpanClass = isMobileView
    ? "col-span-1"
    : "md:col-span-1 lg:col-span-2";
  const getProjectSpanClass = (p: (typeof projects)[number]) => {
    if (isMobileView) return "col-span-1";
    if (p.bentoSize === "1x1") return "col-span-1 md:col-span-1 lg:col-span-1";
    if (p.bentoSize === "2x2") return "col-span-1 md:col-span-2 lg:col-span-2 row-span-2";
    return "col-span-1 md:col-span-1 lg:col-span-2";
  };

  if (layout === "ryancv") {
    return (
      <RyanCvView
        portfolio={portfolio}
        isOwnerView={isOwnerView}
        isMobileView={isMobileView}
      />
    );
  }

  return (
    <div className={cn("relative mx-auto max-w-6xl w-full transition-colors duration-500", activeTheme.wrapperClass)}>
      {/* Ambient Mesh Glow Layer */}
      <div className={cn(activeTheme.ambientGlowClass, "print:hidden")} aria-hidden="true" />

      {/* ===================== BENTO GRID LAYOUT ===================== */}
      {layout === "bento" ? (
        <div className={cn("relative grid", gridLayoutClass)}>
          {/* Card 1: HERO DOSSIER */}
          <div className={cn(heroSpanClass, "group p-5 sm:p-6 lg:p-7", activeTheme.cardClass)}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent print:hidden" />
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
                <div
                  className="grid h-14 w-14 sm:h-20 sm:w-20 shrink-0 place-items-center rounded-2xl sm:rounded-[22px] font-black text-xl sm:text-3xl shadow-lg ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${activeTheme.accentColor}, #3b82f6)`,
                    color: "#ffffff",
                  }}
                >
                  {initials || "?"}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className={cn("text-xl sm:text-3xl font-black tracking-tight truncate", activeTheme.headerNameClass)}>
                      {name || "Untitled"}
                    </h1>
                    {isOwnerView && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-mono font-bold shrink-0 print:hidden"
                        style={{
                          backgroundColor: `${activeTheme.accentColor}18`,
                          border: `1px solid ${activeTheme.accentColor}40`,
                          color: activeTheme.accentColor,
                        }}
                      >
                        LIVE PREVIEW
                      </span>
                    )}
                  </div>
                  {headline && <p className={cn("mt-1 text-xs sm:text-sm line-clamp-2", activeTheme.headlineClass)}>{headline}</p>}
                </div>
              </div>

              {/* Status Pill */}
              {statusPill?.text && (
                <div className={cn("self-start inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-3 py-1 text-xs font-semibold shadow-xs max-w-full", activeTheme.pillBadgeClass)}>
                  <span
                    className="h-2 w-2 shrink-0 rounded-full animate-pulse"
                    style={{ backgroundColor: statusPill.dotColor || activeTheme.accentColor }}
                  />
                  <span className="truncate max-w-[220px]">{statusPill.text}</span>
                </div>
              )}
            </div>

            {/* Bio text */}
            {bio && (
              <p className={cn("mt-4 sm:mt-5 text-xs sm:text-sm leading-relaxed", activeTheme.bioClass)}>
                {bio}
              </p>
            )}

            {/* Location & Social Contact Badges */}
            <div className={cn("mt-5 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-2.5 border-t pt-3.5 sm:pt-4", activeTheme.dividerClass)}>
              {contact.location && (
                <span className={cn("inline-flex items-center gap-1.5 text-xs mr-2 shrink-0", activeTheme.subtextClass)}>
                  <MapPin className="h-3.5 w-3.5 opacity-70" />
                  <span>{contact.location}</span>
                </span>
              )}
              {contact.github && <ContactPill href={contact.github} icon={Github} label="GitHub" themeConfig={activeTheme} />}
              {contact.linkedin && <ContactPill href={contact.linkedin} icon={Linkedin} label="LinkedIn" themeConfig={activeTheme} />}
              {contact.website && <ContactPill href={contact.website} icon={Globe} label="Website" themeConfig={activeTheme} />}
              {contact.email && <ContactPill href={`mailto:${contact.email}`} icon={Mail} label={contact.email} themeConfig={activeTheme} />}
            </div>
          </div>

          {/* Card 2: VERIFIED PROOF OF WORK */}
          <div className={cn(verifiedProofSpanClass, "group relative flex flex-col justify-between p-5 sm:p-6", activeTheme.cardClass)}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent print:hidden" />
            <div>
              <div className={cn("flex items-center justify-between pb-3 border-b", activeTheme.dividerClass)}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" style={{ color: activeTheme.accentColor }} />
                  <h3 className={activeTheme.sectionTitleClass}>
                    Verified Proof
                  </h3>
                </div>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${activeTheme.accentColor}18`,
                    border: `1px solid ${activeTheme.accentColor}40`,
                    color: activeTheme.accentColor,
                  }}
                >
                  NEXORA OS
                </span>
              </div>

              <div className="mt-3.5 space-y-2.5">
                {verifiedProofOfWork.length > 0 ? (
                  verifiedProofOfWork.map((proof) => (
                    <div key={proof.id} className={activeTheme.itemCardClass}>
                      <div className="flex items-start justify-between gap-1.5">
                        <p className={activeTheme.itemTitleClass}>{proof.title}</p>
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: activeTheme.accentColor }} />
                      </div>
                      <p className="mt-1 text-[11px] font-mono font-semibold" style={{ color: activeTheme.accentColor }}>
                        {proof.score}
                      </p>
                      <p className={activeTheme.subtextClass}>{proof.badgeLabel}</p>
                    </div>
                  ))
                ) : (
                  <p className={cn("py-3", activeTheme.subtextClass)}>
                    Completed Code Labs and Assignments appear here with cryptographic verification.
                  </p>
                )}
              </div>
            </div>

            <div className={cn("mt-4 pt-3 border-t flex items-center justify-between text-[11px]", activeTheme.dividerClass)}>
              <span className={activeTheme.subtextClass}>Authenticity</span>
              <span className="font-mono font-bold" style={{ color: activeTheme.accentColor }}>
                100% Verified
              </span>
            </div>
          </div>

          {/* Card 3: SKILLS & TECH STACK */}
          {skills.length > 0 && (
            <div className={cn(skillsSpanClass, "group relative p-5 sm:p-6", activeTheme.cardClass)}>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent print:hidden" />
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="h-4 w-4" style={{ color: activeTheme.accentColor }} />
                <h3 className={activeTheme.sectionTitleClass}>
                  Competency DNA & Tech Stack
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className={activeTheme.techChipClass}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Card 4: FEATURED PROJECT SPOTLIGHT */}
          {featuredProject && (
            <div className={cn(featuredProjectSpanClass, "group relative p-5 sm:p-7", activeTheme.featuredCardClass)}>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent print:hidden" />
              <div className="flex items-center justify-between gap-2">
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-mono font-bold"
                  style={{
                    backgroundColor: `${activeTheme.accentColor}18`,
                    border: `1px solid ${activeTheme.accentColor}40`,
                    color: activeTheme.accentColor,
                  }}
                >
                  <Sparkles className="h-3 w-3 shrink-0" />
                  <span className="truncate">FEATURED PROJECT SPOTLIGHT</span>
                </div>
                {featuredProject.period && (
                  <span className={cn("font-mono text-xs shrink-0", activeTheme.subtextClass)}>{featuredProject.period}</span>
                )}
              </div>

              <h2 className={cn("mt-3 text-lg sm:text-2xl font-bold tracking-tight", activeTheme.headerNameClass)}>
                {featuredProject.title}
              </h2>
              {featuredProject.role && (
                <p className="mt-0.5 text-xs sm:text-sm font-medium" style={{ color: activeTheme.accentColor }}>
                  Role: {featuredProject.role}
                </p>
              )}

              {featuredProject.summary && (
                <p className={cn("mt-2.5 sm:mt-3 text-xs sm:text-sm leading-relaxed max-w-3xl", activeTheme.bioClass)}>
                  {featuredProject.summary}
                </p>
              )}

              {featuredProject.stack && featuredProject.stack.length > 0 && (
                <div className="mt-3.5 sm:mt-4 flex flex-wrap gap-1.5">
                  {featuredProject.stack.map((item, idx) => (
                    <span key={idx} className={activeTheme.techChipClass}>
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {featuredProject.links && featuredProject.links.length > 0 && (
                <div className={cn("mt-4 sm:mt-5 flex flex-wrap gap-2 sm:gap-2.5 pt-3 border-t", activeTheme.dividerClass)}>
                  {featuredProject.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className={activeTheme.projectLinkClass}
                    >
                      <span>{link.label || "View Project"}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Card 5: EDUCATION & CERTIFICATIONS */}
          <div className={cn(educationSpanClass, "group relative p-5 sm:p-6", activeTheme.cardClass)}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent print:hidden" />
            <div className={cn("flex items-center gap-2 pb-3 border-b", activeTheme.dividerClass)}>
              <GraduationCap className="h-4 w-4" style={{ color: activeTheme.accentColor }} />
              <h3 className={activeTheme.sectionTitleClass}>
                Education
              </h3>
            </div>

            <div className="mt-3.5 space-y-3">
              {education.length > 0 ? (
                education.map((edu) => (
                  <div
                    key={edu.id}
                    className="relative pl-3 border-l-2"
                    style={{ borderColor: `${activeTheme.accentColor}60` }}
                  >
                    <p className={activeTheme.itemTitleClass}>{edu.degree}</p>
                    <p className={activeTheme.subtextClass}>{edu.institution}</p>
                    {edu.period && (
                      <p className={cn("text-[10px] font-mono mt-0.5 opacity-80", activeTheme.subtextClass)}>
                        {edu.period}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className={activeTheme.subtextClass}>Add degree or certifications.</p>
              )}
            </div>
          </div>

          {/* Card 6+: ADDITIONAL PROJECTS */}
          {standardProjects.map((project) => (
            <div
              key={project.id}
              className={cn(
                standardProjectSpanClass,
                getProjectSpanClass(project),
                "group relative flex flex-col justify-between p-4 sm:p-6",
                activeTheme.cardClass,
              )}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent print:hidden" />
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className={cn("text-sm sm:text-base font-bold line-clamp-1", activeTheme.headerNameClass)}>
                    {project.title}
                  </h3>
                  {project.period && (
                    <span className={cn("text-[10px] font-mono shrink-0", activeTheme.subtextClass)}>
                      {project.period}
                    </span>
                  )}
                </div>
                {project.role && (
                  <p className="text-xs font-medium mt-0.5" style={{ color: activeTheme.accentColor }}>
                    {project.role}
                  </p>
                )}

                {project.summary && (
                  <p className={cn("mt-2 text-xs leading-relaxed line-clamp-3", activeTheme.bioClass)}>
                    {project.summary}
                  </p>
                )}

                {project.stack && project.stack.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {project.stack.map((item, idx) => (
                      <span key={idx} className={activeTheme.techChipClass}>
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {project.links && project.links.length > 0 && (
                <div className={cn("mt-4 pt-3 border-t flex flex-wrap gap-2", activeTheme.dividerClass)}>
                  {project.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold hover:underline transition-colors"
                      style={{ color: activeTheme.accentColor }}
                    >
                      <span>{link.label || "Link"}</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* ===================== CLASSIC VERTICAL RESUME LAYOUT ===================== */
        <div className="space-y-4 sm:space-y-6">
          {/* Classic Hero */}
          <div className={cn("p-5 sm:p-6", activeTheme.cardClass)}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div
                className="grid h-16 w-16 sm:h-20 sm:w-20 shrink-0 place-items-center rounded-2xl text-2xl sm:text-3xl font-black text-white"
                style={{ backgroundColor: activeTheme.accentColor }}
              >
                {initials || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className={cn("text-2xl sm:text-3xl font-bold truncate", activeTheme.headerNameClass)}>{name}</h1>
                <p className={activeTheme.headlineClass}>{headline}</p>
                {contact.location && <p className={cn("text-xs mt-1", activeTheme.subtextClass)}>{contact.location}</p>}
              </div>
            </div>
            {bio && <p className={cn("mt-4 text-xs sm:text-sm leading-relaxed", activeTheme.bioClass)}>{bio}</p>}
          </div>

          {/* Classic Projects */}
          <div className={cn("p-5 sm:p-6", activeTheme.cardClass)}>
            <h2 className={cn("text-base sm:text-lg font-bold mb-4", activeTheme.headerNameClass)}>Projects</h2>
            <div className="space-y-4">
              {projects.map((p) => (
                <div key={p.id} className={cn("border-b pb-4 last:border-0 last:pb-0", activeTheme.dividerClass)}>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={cn("font-bold text-sm sm:text-base truncate", activeTheme.headerNameClass)}>{p.title}</h3>
                    <span className={cn("text-xs shrink-0", activeTheme.subtextClass)}>{p.period}</span>
                  </div>
                  <p className="text-xs font-medium" style={{ color: activeTheme.accentColor }}>{p.role}</p>
                  <p className={cn("text-xs mt-1 leading-relaxed", activeTheme.bioClass)}>{p.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className={cn("mt-10 sm:mt-12 text-center text-xs pb-8 flex items-center justify-center gap-2", activeTheme.subtextClass)}>
        <span>Powered by Nexora OS Academic Shield</span>
        <span>•</span>
        <span className="font-mono font-semibold" style={{ color: activeTheme.accentColor }}>
          Proof of Work Verified
        </span>
      </footer>
    </div>
  );
}
