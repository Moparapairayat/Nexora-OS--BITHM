import type { PortfolioTheme } from "./types";

export type ThemeConfig = {
  id: PortfolioTheme;
  name: string;
  tagline: string;
  previewColor: string;
  wrapperClass: string;
  canvasBg: string;
  cardClass: string;
  featuredCardClass: string;
  headerNameClass: string;
  headlineClass: string;
  bioClass: string;
  pillBadgeClass: string;
  techChipClass: string;
  verifiedBadgeClass: string;
  borderClass: string;
  accentColor: string;
  sectionTitleClass: string;
  subtextClass: string;
  itemCardClass: string;
  itemTitleClass: string;
  contactPillClass: string;
  dividerClass: string;
  projectLinkClass: string;
  ambientGlowClass: string;
  ambientGlowColor: string;
};

export const PORTFOLIO_THEMES: Record<PortfolioTheme, ThemeConfig> = {
  obsidian: {
    id: "obsidian",
    name: "Obsidian Studio",
    tagline: "Linear & Vercel dark mode with emerald neon accents",
    previewColor: "#10b981",
    wrapperClass: "font-sans text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200",
    canvasBg: "bg-[#070b10] text-slate-100",
    cardClass:
      "relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0e131b]/90 backdrop-blur-xl p-6 text-slate-100 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10 print:border-slate-300 print:bg-white print:text-black print:shadow-none",
    featuredCardClass:
      "relative overflow-hidden rounded-[28px] border border-emerald-500/30 bg-gradient-to-br from-[#0e1722] via-[#0d141e] to-[#090e15] p-7 text-slate-100 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/60 hover:shadow-emerald-500/15 print:border-slate-300 print:bg-white print:text-black print:shadow-none",
    headerNameClass: "font-black tracking-tight text-white",
    headlineClass: "font-semibold text-emerald-400 font-mono text-sm",
    bioClass: "text-slate-300 leading-relaxed font-normal",
    pillBadgeClass: "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-mono text-xs",
    techChipClass:
      "rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-mono font-medium text-slate-300 hover:border-emerald-500/30 hover:text-emerald-300 transition-colors print:border-slate-300 print:bg-slate-100 print:text-black",
    verifiedBadgeClass:
      "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    borderClass: "border-white/[0.08]",
    accentColor: "#10b981",
    sectionTitleClass: "text-xs font-mono font-bold uppercase tracking-wider text-slate-300",
    subtextClass: "text-slate-400 text-xs",
    itemCardClass: "group relative rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 transition hover:bg-white/[0.06] print:border-slate-200 print:bg-slate-50",
    itemTitleClass: "text-xs font-semibold text-white line-clamp-1 print:text-black",
    contactPillClass:
      "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/12 transition-all print:border-slate-300 print:bg-slate-100 print:text-black",
    dividerClass: "border-white/[0.08] print:border-slate-200",
    projectLinkClass:
      "inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 print:border-slate-300 print:bg-slate-100 print:text-black",
    ambientGlowClass: "pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-emerald-500/10 blur-[130px]",
    ambientGlowColor: "rgba(16, 185, 129, 0.12)",
  },
  "apple-glass": {
    id: "apple-glass",
    name: "Apple Glassmorphic",
    tagline: "Ultra-smooth frosted glass, soft blurred light & rounded-3xl",
    previewColor: "#0284c7",
    wrapperClass: "font-sans text-slate-800 dark:text-slate-100 selection:bg-sky-500/20",
    canvasBg:
      "bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 dark:from-[#090d16] dark:via-[#0c121e] dark:to-[#080a10] text-slate-800 dark:text-slate-100",
    cardClass:
      "relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/80 shadow-md backdrop-blur-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-sky-400/40 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none dark:hover:border-sky-500/40 text-slate-800 dark:text-slate-100 print:border-slate-300 print:bg-white print:text-black print:shadow-none",
    featuredCardClass:
      "relative overflow-hidden rounded-[32px] border border-sky-500/30 bg-gradient-to-br from-white/95 via-sky-50/60 to-white/85 p-7 shadow-xl backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/60 hover:shadow-2xl dark:border-sky-500/30 dark:bg-gradient-to-br dark:from-sky-950/20 dark:via-white/[0.03] dark:to-transparent text-slate-900 dark:text-slate-100 print:border-slate-300 print:bg-white print:text-black print:shadow-none",
    headerNameClass: "font-bold tracking-tight text-slate-900 dark:text-white",
    headlineClass: "font-semibold text-sky-600 dark:text-sky-400 text-sm",
    bioClass: "text-slate-600 dark:text-slate-300 leading-relaxed font-normal",
    pillBadgeClass:
      "border border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300 font-medium text-xs rounded-full",
    techChipClass:
      "rounded-full border border-slate-200/90 bg-slate-100/70 px-3 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 hover:border-sky-400/50 transition-colors print:border-slate-300 print:bg-slate-100 print:text-black",
    verifiedBadgeClass:
      "border border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 rounded-full",
    borderClass: "border-slate-200/80 dark:border-white/10",
    accentColor: "#0284c7",
    sectionTitleClass: "text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300",
    subtextClass: "text-slate-500 dark:text-slate-400 text-xs",
    itemCardClass:
      "group relative rounded-xl border border-slate-200/80 bg-slate-100/60 p-2.5 transition hover:bg-slate-100 dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.06] print:border-slate-200 print:bg-slate-50",
    itemTitleClass: "text-xs font-semibold text-slate-900 dark:text-slate-200 line-clamp-1 print:text-black",
    contactPillClass:
      "inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-white transition-all dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 print:border-slate-300 print:bg-slate-100 print:text-black",
    dividerClass: "border-slate-200/80 dark:border-white/[0.08] print:border-slate-200",
    projectLinkClass:
      "inline-flex items-center gap-1.5 rounded-xl border border-slate-300/80 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-900 shadow-xs transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 print:border-slate-300 print:bg-slate-100 print:text-black",
    ambientGlowClass: "pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-sky-400/15 blur-[130px] dark:bg-sky-500/10",
    ambientGlowColor: "rgba(2, 132, 199, 0.12)",
  },
  editorial: {
    id: "editorial",
    name: "Swiss Editorial",
    tagline: "Classic serif typography, high-contrast monochrome elegance",
    previewColor: "#d97706",
    wrapperClass: "font-sans text-stone-900 dark:text-stone-100 selection:bg-amber-500/20",
    canvasBg: "bg-[#fbfaf8] dark:bg-[#121110] text-stone-900 dark:text-stone-100",
    cardClass:
      "relative overflow-hidden rounded-[18px] border border-stone-300/80 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-stone-800 hover:shadow-xl dark:border-stone-800 dark:bg-[#1a1816] dark:hover:border-stone-500 text-stone-900 dark:text-stone-100 print:border-stone-300 print:bg-white print:text-black print:shadow-none",
    featuredCardClass:
      "relative overflow-hidden rounded-[20px] border-2 border-stone-900 bg-stone-50/90 p-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-stone-300 dark:bg-[#201d19] text-stone-900 dark:text-stone-100 print:border-stone-300 print:bg-white print:text-black print:shadow-none",
    headerNameClass: "font-serif font-black tracking-tight text-stone-950 dark:text-stone-50 text-3xl sm:text-4xl",
    headlineClass: "font-serif italic text-stone-700 dark:text-stone-300 text-sm",
    bioClass: "font-serif text-stone-700 dark:text-stone-300 leading-relaxed text-sm sm:text-base",
    pillBadgeClass: "border border-stone-400/40 bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200 font-serif text-xs",
    techChipClass:
      "rounded-md border border-stone-300 bg-white px-2.5 py-0.5 text-xs font-serif font-semibold text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 print:border-stone-300 print:bg-stone-100 print:text-black",
    verifiedBadgeClass: "border border-amber-600/30 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 font-serif",
    borderClass: "border-stone-300 dark:border-stone-800",
    accentColor: "#d97706",
    sectionTitleClass: "text-xs font-serif font-bold uppercase tracking-wider text-stone-800 dark:text-stone-300",
    subtextClass: "text-stone-500 dark:text-stone-400 text-xs font-serif",
    itemCardClass:
      "group relative rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900/60 dark:hover:bg-stone-900 print:border-stone-200 print:bg-stone-50",
    itemTitleClass: "text-xs font-serif font-bold text-stone-900 dark:text-stone-100 line-clamp-1 print:text-black",
    contactPillClass:
      "inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-1.5 text-xs font-serif font-semibold text-stone-800 hover:bg-stone-100 transition-all dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 print:border-stone-300 print:bg-stone-100 print:text-black",
    dividerClass: "border-stone-200 dark:border-stone-800 print:border-stone-200",
    projectLinkClass:
      "inline-flex items-center gap-1.5 rounded-xl border border-stone-800 bg-stone-900 px-3.5 py-1.5 text-xs font-serif font-semibold text-white transition hover:bg-stone-800 dark:border-stone-300 dark:bg-stone-100 dark:text-stone-900 print:border-stone-300 print:bg-stone-100 print:text-black",
    ambientGlowClass: "pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-amber-500/10 blur-[130px]",
    ambientGlowColor: "rgba(217, 119, 6, 0.10)",
  },
  cyber: {
    id: "cyber",
    name: "Cyber Terminal",
    tagline: "Developer matrix monospace, neon terminal tabs & status pills",
    previewColor: "#06b6d4",
    wrapperClass: "font-mono text-cyan-100 selection:bg-cyan-500/30 selection:text-cyan-100",
    canvasBg: "bg-[#060a0f] text-cyan-100",
    cardClass:
      "relative overflow-hidden rounded-[20px] border border-cyan-500/20 bg-[#09111a]/90 backdrop-blur-xl p-6 text-cyan-100 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] print:border-slate-300 print:bg-white print:text-black print:shadow-none",
    featuredCardClass:
      "relative overflow-hidden rounded-[22px] border-2 border-cyan-500/40 bg-gradient-to-b from-[#0c1824] to-[#081018] p-7 text-cyan-100 shadow-[0_0_35px_rgba(6,182,212,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_45px_rgba(6,182,212,0.3)] print:border-slate-300 print:bg-white print:text-black print:shadow-none",
    headerNameClass: "font-mono font-bold tracking-tight text-white",
    headlineClass: "font-mono text-cyan-400 text-sm",
    bioClass: "font-mono text-cyan-200/90 leading-relaxed text-xs sm:text-sm",
    pillBadgeClass: "border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 font-mono text-xs",
    techChipClass:
      "rounded-sm border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-xs font-mono text-cyan-300 hover:border-cyan-400 transition-colors print:border-slate-300 print:bg-slate-100 print:text-black",
    verifiedBadgeClass: "border border-cyan-400/50 bg-cyan-950/60 text-cyan-300 font-mono",
    borderClass: "border-cyan-500/20",
    accentColor: "#06b6d4",
    sectionTitleClass: "text-xs font-mono font-bold uppercase tracking-wider text-cyan-300",
    subtextClass: "text-cyan-400/70 text-xs font-mono",
    itemCardClass: "group relative rounded-xl border border-cyan-500/20 bg-cyan-950/30 p-2.5 transition hover:bg-cyan-950/50 print:border-slate-200 print:bg-slate-50",
    itemTitleClass: "text-xs font-mono font-semibold text-cyan-100 line-clamp-1 print:text-black",
    contactPillClass:
      "inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1.5 text-xs font-mono font-semibold text-cyan-200 hover:bg-cyan-900/50 transition-all print:border-slate-300 print:bg-slate-100 print:text-black",
    dividerClass: "border-cyan-500/20 print:border-slate-200",
    projectLinkClass:
      "inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-950/70 px-3.5 py-1.5 text-xs font-mono font-semibold text-cyan-200 transition hover:bg-cyan-900/70 print:border-slate-300 print:bg-slate-100 print:text-black",
    ambientGlowClass: "pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-cyan-500/15 blur-[130px]",
    ambientGlowColor: "rgba(6, 182, 212, 0.15)",
  },
  "minimal-paper": {
    id: "minimal-paper",
    name: "Minimal Paper",
    tagline: "Clean enterprise monochrome aesthetic, recruiter-friendly",
    previewColor: "#475569",
    wrapperClass: "font-sans text-slate-900 dark:text-slate-100 selection:bg-slate-200 dark:selection:bg-slate-800",
    canvasBg: "bg-[#f8fafc] dark:bg-[#0f1115] text-slate-900 dark:text-slate-100",
    cardClass:
      "relative overflow-hidden rounded-[22px] border border-slate-300/80 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-slate-400 hover:shadow-xl dark:border-white/10 dark:bg-[#15181e] text-slate-900 dark:text-slate-100 print:border-slate-300 print:bg-white print:text-black print:shadow-none",
    featuredCardClass:
      "relative overflow-hidden rounded-[24px] border-2 border-slate-900 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/30 dark:bg-white/[0.03] text-slate-900 dark:text-slate-100 print:border-slate-300 print:bg-white print:text-black print:shadow-none",
    headerNameClass: "font-bold tracking-tight text-slate-950 dark:text-white text-3xl",
    headlineClass: "font-medium text-slate-600 dark:text-slate-400 text-sm",
    bioClass: "text-slate-700 dark:text-slate-300 leading-relaxed font-normal text-sm",
    pillBadgeClass: "border border-slate-300 bg-slate-100 text-slate-800 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 font-medium text-xs",
    techChipClass:
      "rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 print:border-slate-300 print:bg-slate-100 print:text-black",
    verifiedBadgeClass: "border border-slate-400 bg-slate-100 text-slate-800 dark:border-white/20 dark:bg-white/10 dark:text-slate-200",
    borderClass: "border-slate-200 dark:border-white/10",
    accentColor: "#475569",
    sectionTitleClass: "text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300",
    subtextClass: "text-slate-500 dark:text-slate-400 text-xs",
    itemCardClass: "group relative rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 print:border-slate-200 print:bg-slate-50",
    itemTitleClass: "text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 print:text-black",
    contactPillClass:
      "inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-200 transition-all dark:border-white/10 dark:bg-white/5 dark:text-slate-200 print:border-slate-300 print:bg-slate-100 print:text-black",
    dividerClass: "border-slate-200 dark:border-white/10 print:border-slate-200",
    projectLinkClass:
      "inline-flex items-center gap-1.5 rounded-xl border border-slate-900 bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-950 print:border-slate-300 print:bg-slate-100 print:text-black",
    ambientGlowClass: "pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-slate-400/10 blur-[130px] dark:bg-white/5",
    ambientGlowColor: "rgba(71, 85, 105, 0.08)",
  },
};
