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
        "command-surface command-border rounded-[var(--radius-command)] p-5 light:rounded-[22px] light:border-[color:var(--line)] light:bg-[rgba(250,253,251,0.92)] light:shadow-[0_1px_2px_rgba(26,58,43,0.035),0_14px_36px_rgba(31,67,49,0.065)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
