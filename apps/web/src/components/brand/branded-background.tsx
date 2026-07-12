import { cn } from "@/lib/utils";

export function BrandedBackground({
  variant = "subtle",
  className,
}: {
  variant?: "hero" | "subtle" | "playful";
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:46px_46px] opacity-45 light:bg-[linear-gradient(rgba(5,95,55,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(5,95,55,0.035)_1px,transparent_1px)]" />

      <div
        className={cn(
          "absolute -left-52 top-[9%] h-16 w-[48rem] -rotate-[31deg] bg-[linear-gradient(90deg,transparent,#32f59a_22%,#36d9ff_72%,transparent)] blur-[0.2px]",
          variant === "subtle" ? "opacity-20" : "opacity-55 light:opacity-70",
        )}
      />
      <div
        className={cn(
          "absolute -left-48 top-[13%] h-5 w-[44rem] -rotate-[31deg] bg-[#d9ff57]",
          variant === "subtle" ? "opacity-25" : "opacity-75",
        )}
      />
      <div
        className={cn(
          "absolute -right-60 top-[10%] h-24 w-[48rem] -rotate-[29deg] bg-[linear-gradient(90deg,transparent,#18d4ff_20%,#32f59a_78%,transparent)]",
          variant === "subtle" ? "opacity-15" : "opacity-50 light:opacity-70",
        )}
      />

      <div
        className={cn(
          "absolute rounded-full border-cyan-400/40 light:border-cyan-500/50",
          variant === "playful"
            ? "-bottom-20 left-[6%] h-72 w-72 border-[48px]"
            : "-bottom-24 left-[8%] h-52 w-52 border-[34px]",
          variant === "subtle" && "opacity-30",
        )}
      />
      <div
        className={cn(
          "absolute rounded-full bg-violet-500/35 mix-blend-screen light:bg-violet-500/40 light:mix-blend-multiply",
          variant === "playful"
            ? "bottom-[5%] left-[16%] h-44 w-44"
            : "-bottom-8 left-[15%] h-32 w-32",
          variant === "subtle" && "opacity-30",
        )}
      />

      {variant !== "subtle" ? (
        <div className="absolute -right-12 -top-28 h-72 w-72 rotate-[24deg] rounded-[48px] bg-[linear-gradient(145deg,#8b5cf6,#5b3df5)] opacity-35 light:opacity-55" />
      ) : null}

      <div className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/[0.045] blur-3xl light:bg-emerald-300/10" />
    </div>
  );
}
