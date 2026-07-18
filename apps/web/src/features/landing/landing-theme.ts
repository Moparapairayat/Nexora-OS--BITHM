export type ToolCardStyle = {
  bgClass: string;
  hoverShadow: string;
  textClass: string;
  textMutedClass: string;
  badgeClass: string;
  svgStroke: string;
  iconCircleBg: string;
};

const sharedCardStyle = {
  bgClass:
    "border border-white/10 bg-[#0a1711] light:border-emerald-950/10 light:bg-white",
  hoverShadow:
    "hover:border-emerald-300/25 hover:shadow-[0_18px_42px_rgba(0,0,0,0.18)] light:hover:border-emerald-700/20 light:hover:shadow-[0_16px_36px_rgba(25,75,50,0.08)]",
  textClass: "text-white light:text-slate-900",
  textMutedClass: "font-normal text-slate-400 light:text-slate-600",
  badgeClass:
    "border border-white/8 bg-white/5 text-slate-300 light:border-slate-200 light:bg-slate-50 light:text-slate-600",
  svgStroke: "rgba(110,231,183,0.14)",
};

function createToolCardStyle(iconCircleBg: string): ToolCardStyle {
  return { ...sharedCardStyle, iconCircleBg };
}

export const toolCardStyles: Record<string, ToolCardStyle> = {
  violet: createToolCardStyle("bg-violet-400/10 text-violet-300 light:bg-violet-50 light:text-violet-700"),
  emerald: createToolCardStyle("bg-emerald-400/10 text-emerald-300 light:bg-emerald-50 light:text-emerald-700"),
  cyan: createToolCardStyle("bg-cyan-400/10 text-cyan-300 light:bg-cyan-50 light:text-cyan-700"),
  amber: createToolCardStyle("bg-amber-400/10 text-amber-300 light:bg-amber-50 light:text-amber-700"),
  rose: createToolCardStyle("bg-rose-400/10 text-rose-300 light:bg-rose-50 light:text-rose-700"),
  sky: createToolCardStyle("bg-sky-400/10 text-sky-300 light:bg-sky-50 light:text-sky-700"),
  orange: createToolCardStyle("bg-orange-400/10 text-orange-300 light:bg-orange-50 light:text-orange-700"),
  lime: createToolCardStyle("bg-lime-400/10 text-lime-300 light:bg-lime-50 light:text-lime-700"),
  fuchsia: createToolCardStyle("bg-fuchsia-400/10 text-fuchsia-300 light:bg-fuchsia-50 light:text-fuchsia-700"),
};
