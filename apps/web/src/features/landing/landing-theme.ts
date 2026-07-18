export type ToolCardStyle = {
  bgClass: string;
  hoverShadow: string;
  textClass: string;
  textMutedClass: string;
  badgeClass: string;
  svgStroke: string;
  iconCircleBg: string;
};

export const toolCardStyles: Record<string, ToolCardStyle> = {
  violet: {
    bgClass: "bg-[#6355E6]",
    hoverShadow: "hover:shadow-[0_20px_40px_rgba(99,85,230,0.32)]",
    textClass: "text-white",
    textMutedClass: "text-purple-100/80 font-medium",
    badgeClass: "bg-white/12 text-white border border-white/5",
    svgStroke: "rgba(255,255,255,0.22)",
    iconCircleBg: "bg-white/12 text-white",
  },
  emerald: {
    bgClass: "bg-[#10B981]",
    hoverShadow: "hover:shadow-[0_20px_40px_rgba(16,185,129,0.32)]",
    textClass: "text-white",
    textMutedClass: "text-emerald-50/80 font-medium",
    badgeClass: "bg-white/12 text-white border border-white/5",
    svgStroke: "rgba(255,255,255,0.22)",
    iconCircleBg: "bg-white/12 text-white",
  },
  cyan: {
    bgClass: "bg-[#06B6D4]",
    hoverShadow: "hover:shadow-[0_20px_40px_rgba(6,182,212,0.32)]",
    textClass: "text-white",
    textMutedClass: "text-cyan-50/80 font-medium",
    badgeClass: "bg-white/12 text-white border border-white/5",
    svgStroke: "rgba(255,255,255,0.22)",
    iconCircleBg: "bg-white/12 text-white",
  },
  amber: {
    bgClass: "bg-[#FED97B]",
    hoverShadow: "hover:shadow-[0_20px_40px_rgba(254,217,123,0.32)]",
    textClass: "text-amber-950",
    textMutedClass: "text-amber-900/80 font-medium",
    badgeClass: "bg-black/7 text-amber-950 border border-black/5",
    svgStroke: "rgba(120,80,20,0.18)",
    iconCircleBg: "bg-black/7 text-amber-950",
  },
  rose: {
    bgClass: "bg-[#FDA4AF]",
    hoverShadow: "hover:shadow-[0_20px_40px_rgba(253,164,175,0.32)]",
    textClass: "text-rose-950",
    textMutedClass: "text-rose-900/80 font-medium",
    badgeClass: "bg-black/7 text-rose-950 border border-black/5",
    svgStroke: "rgba(150,50,70,0.18)",
    iconCircleBg: "bg-black/7 text-rose-950",
  },
  sky: {
    bgClass: "bg-[#BAC8FF]",
    hoverShadow: "hover:shadow-[0_20px_40px_rgba(186,200,255,0.32)]",
    textClass: "text-indigo-950",
    textMutedClass: "text-indigo-900/80 font-medium",
    badgeClass: "bg-black/7 text-indigo-950 border border-black/5",
    svgStroke: "rgba(50,60,150,0.16)",
    iconCircleBg: "bg-black/7 text-indigo-950",
  },
  orange: {
    bgClass: "bg-[#FFD8A8]",
    hoverShadow: "hover:shadow-[0_20px_40px_rgba(255,216,168,0.32)]",
    textClass: "text-orange-950",
    textMutedClass: "text-orange-900/80 font-medium",
    badgeClass: "bg-black/7 text-orange-950 border border-black/5",
    svgStroke: "rgba(150,80,20,0.16)",
    iconCircleBg: "bg-black/7 text-orange-950",
  },
  lime: {
    bgClass: "bg-[#E2F9A7]",
    hoverShadow: "hover:shadow-[0_20px_40px_rgba(226,249,167,0.32)]",
    textClass: "text-lime-950",
    textMutedClass: "text-lime-900/80 font-medium",
    badgeClass: "bg-black/7 text-lime-950 border border-black/5",
    svgStroke: "rgba(80,120,20,0.16)",
    iconCircleBg: "bg-black/7 text-lime-950",
  },
  fuchsia: {
    bgClass: "bg-[#FAA2C1]",
    hoverShadow: "hover:shadow-[0_20px_40px_rgba(250,162,193,0.32)]",
    textClass: "text-fuchsia-950",
    textMutedClass: "text-fuchsia-900/80 font-medium",
    badgeClass: "bg-black/7 text-fuchsia-950 border border-black/5",
    svgStroke: "rgba(150,40,90,0.16)",
    iconCircleBg: "bg-black/7 text-fuchsia-950",
  },
};

