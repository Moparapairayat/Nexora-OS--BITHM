import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-[linear-gradient(135deg,#d9ff57_0%,#6cf6b3_46%,#32f59a_100%)] text-[#07100b] shadow-[0_14px_42px_rgba(50,245,154,0.22)] hover:brightness-110 light:bg-[linear-gradient(135deg,#07a75d_0%,#11c979_52%,#b8f34f_100%)] light:text-white light:shadow-[0_14px_28px_rgba(7,154,86,0.2)]",
  secondary:
    "border border-[var(--line)] bg-[rgba(18,24,21,0.72)] text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(245,247,242,0.08),0_12px_34px_rgba(0,0,0,0.24)] hover:border-[color:var(--border-emerald)] hover:bg-[rgba(32,40,35,0.78)] light:border-slate-200 light:bg-white/90 light:text-slate-950 light:shadow-[0_10px_24px_rgba(39,53,86,0.06)] light:hover:border-emerald-100 light:hover:bg-emerald-50/60",
  ghost:
    "text-[#dfe8df] hover:bg-[rgba(217,255,87,0.08)] hover:text-[var(--brand-lime)] light:text-slate-700 light:hover:bg-emerald-50 light:hover:text-emerald-700",
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
