import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-gradient-to-r from-accent-secondary to-accent-primary text-[#07100b] shadow-[0_12px_32px_rgba(var(--theme-accent-primary-rgb-raw),0.22)] hover:brightness-110 light:bg-gradient-to-r light:from-accent-solid light:to-accent-primary light:text-white light:shadow-[0_10px_24px_rgba(var(--theme-accent-primary-rgb-raw),0.18)] light:hover:brightness-105",
  secondary:
    "border border-[var(--line)] bg-[rgba(18,24,21,0.72)] text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(245,247,242,0.08),0_12px_34px_rgba(0,0,0,0.24)] hover:border-accent-primary/40 hover:bg-accent-primary/8 light:border-[color:var(--line)] light:bg-white/88 light:text-[#15251f] light:shadow-[0_1px_2px_rgba(26,58,43,0.04),0_8px_20px_rgba(31,67,49,0.055)] light:hover:border-accent-primary/30 light:hover:bg-accent-primary/5",
  ghost:
    "text-[#dfe8df] hover:bg-accent-secondary/10 hover:text-accent-secondary light:text-slate-700 light:hover:bg-accent-primary/8 light:hover:text-accent-solid",
  danger:
    "border border-rose-300/25 bg-rose-400/12 text-rose-100 hover:bg-rose-400/18 light:bg-rose-50 light:text-rose-700 light:hover:bg-rose-100",
};

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <button
      className={cn(
        "nexora-focus inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
