import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/mock-data";

const toneClass: Record<Tone, string> = {
  cyan: "border-[color:var(--border-lime)] bg-[rgba(217,255,87,0.10)] text-[var(--brand-lime)] shadow-[0_0_24px_rgba(217,255,87,0.13)] light:border-cyan-500/20 light:bg-cyan-50 light:text-cyan-700",
  emerald:
    "border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] text-[var(--brand-emerald)] shadow-[0_0_24px_rgba(50,245,154,0.13)] light:border-emerald-500/20 light:bg-emerald-50 light:text-emerald-700",
  amber:
    "border-[rgba(255,180,90,0.30)] bg-[rgba(138,95,61,0.18)] text-[#ffd29b] shadow-[0_0_24px_rgba(255,180,90,0.09)] light:border-amber-500/20 light:bg-amber-50 light:text-amber-700",
  rose: "border-[rgba(255,143,128,0.28)] bg-[rgba(255,143,128,0.10)] text-[#ffb1a6] light:border-rose-500/20 light:bg-rose-50 light:text-rose-700",
  violet:
    "border-[rgba(217,255,87,0.24)] bg-[rgba(138,95,61,0.16)] text-[#f0c98d] shadow-[0_0_24px_rgba(138,95,61,0.11)] light:border-violet-500/20 light:bg-violet-50 light:text-violet-700",
  slate:
    "border-slate-300/20 bg-slate-300/10 text-slate-100 light:border-slate-300 light:bg-white light:text-slate-700",
};

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-md",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
