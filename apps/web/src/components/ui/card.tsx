import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "command-surface command-border rounded-[var(--radius-command)] p-5 light:rounded-[22px] light:border-slate-200/80 light:bg-white light:shadow-[0_18px_44px_rgba(33,45,74,0.07)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
