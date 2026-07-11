"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Code2,
  Database,
  FileText,
  MessageSquareText,
  Radar,
  Send,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AppRole, Tone } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const roleTone: Record<AppRole, Tone> = {
  student: "cyan",
  teacher: "amber",
  admin: "violet",
};

const roleLabel: Record<AppRole, string> = {
  student: "Student",
  teacher: "Teacher",
  admin: "Admin",
};

const toneGlow: Record<Tone, string> = {
  cyan: "from-[rgba(217,255,87,0.22)] via-[rgba(50,245,154,0.08)] to-transparent",
  emerald:
    "from-[rgba(50,245,154,0.26)] via-[rgba(108,246,179,0.08)] to-transparent",
  amber:
    "from-[rgba(255,180,90,0.22)] via-[rgba(138,95,61,0.08)] to-transparent",
  rose: "from-[rgba(255,143,128,0.2)] via-[rgba(138,95,61,0.07)] to-transparent",
  violet:
    "from-[rgba(138,95,61,0.2)] via-[rgba(217,255,87,0.07)] to-transparent",
  slate: "from-slate-300/18 via-slate-300/6 to-transparent",
};

const toneText: Record<Tone, string> = {
  cyan: "text-[var(--brand-lime)] light:text-cyan-700",
  emerald: "text-[var(--brand-emerald)] light:text-emerald-700",
  amber: "text-[#ffd29b] light:text-amber-700",
  rose: "text-[#ffb1a6] light:text-rose-700",
  violet: "text-[#f0c98d] light:text-violet-700",
  slate: "text-[#dfe8df] light:text-slate-700",
};

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  tone = "cyan",
  compact = false,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
  tone?: Tone;
  compact?: boolean;
}) {
  return (
    <motion.section
      className={cn(
        "command-surface-strong command-border relative overflow-hidden rounded-[32px]",
        compact ? "rounded-[24px] p-3 sm:px-4 sm:py-3" : "p-5 sm:p-6",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b",
          compact ? "h-16" : "h-32",
          toneGlow[tone],
        )}
      />
      <div
        className={cn(
          "relative flex flex-col lg:flex-row lg:justify-between",
          compact ? "gap-2 lg:items-center" : "gap-5 lg:items-end",
        )}
      >
        <div>
          <Badge tone={tone}>{eyebrow}</Badge>
          <h1
            className={cn(
              "command-text-gradient max-w-4xl text-balance font-semibold tracking-normal",
              compact
                ? "mt-1.5 text-xl sm:text-2xl"
                : "mt-4 text-3xl sm:text-4xl",
            )}
          >
            {title}
          </h1>
          <p
            className={cn(
              "max-w-3xl text-sm text-slate-400 light:text-slate-600",
              compact ? "mt-1 text-xs leading-4 sm:text-sm" : "mt-3 leading-6",
            )}
          >
            {subtitle}
          </p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </motion.section>
  );
}

export function DashboardCard({
  title,
  detail,
  icon: Icon = Sparkles,
  tone = "cyan",
  children,
  className,
}: {
  title: string;
  detail?: string;
  icon?: LucideIcon;
  tone?: Tone;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className={cn("h-full", className)}
    >
      <Card className="relative h-full overflow-hidden">
        <div
          className={cn(
            "pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br blur-2xl",
            toneGlow[tone],
          )}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)] light:text-slate-950">
              {title}
            </p>
            {detail ? (
              <p className="mt-2 text-sm leading-6 text-slate-400 light:text-slate-600">
                {detail}
              </p>
            ) : null}
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-[rgba(217,255,87,0.07)] shadow-[inset_0_1px_0_rgba(245,247,242,0.08)] light:border-slate-200 light:bg-white/85">
            <Icon
              className={cn("h-5 w-5", toneText[tone])}
              aria-hidden="true"
            />
          </div>
        </div>
        {children ? <div className="relative mt-5">{children}</div> : null}
      </Card>
    </motion.div>
  );
}

export function BentoCard(props: Parameters<typeof DashboardCard>[0]) {
  return <DashboardCard {...props} />;
}

export function StatCard({
  label,
  value,
  trend,
  tone = "cyan",
  icon,
}: {
  label: string;
  value: string;
  trend?: string;
  tone?: Tone;
  icon?: LucideIcon;
}) {
  const Icon = icon ?? Activity;

  return (
    <DashboardCard title={label} tone={tone} icon={Icon}>
      <div className="flex items-end justify-between gap-3">
        <p className={cn("font-mono text-4xl font-semibold", toneText[tone])}>
          {value}
        </p>
        {trend ? <Badge tone={tone}>{trend}</Badge> : null}
      </div>
    </DashboardCard>
  );
}

export function WorkflowTimeline({
  items,
}: {
  items: Array<{ label: string; status: string; detail: string; tone?: Tone }>;
}) {
  return (
    <DashboardCard title="Work Timeline" icon={CircleDot} tone="cyan">
      <div className="grid gap-4">
        {items.map((item, index) => (
          <div
            key={item.label}
            className="grid grid-cols-[22px_minmax(0,1fr)] gap-4"
          >
            <div className="flex flex-col items-center">
              <span className="mt-1 h-3.5 w-3.5 rounded-full border border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.18)] shadow-[0_0_18px_rgba(50,245,154,0.34)] light:border-cyan-500/30 light:bg-cyan-100" />
              {index < items.length - 1 ? (
                <span className="mt-2 h-full min-h-12 w-px bg-gradient-to-b from-[rgba(50,245,154,0.38)] to-transparent light:from-cyan-500/25" />
              ) : null}
            </div>
            <div className="pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[var(--foreground)] light:text-slate-950">
                  {item.label}
                </p>
                <StatusBadge tone={item.tone ?? "slate"}>
                  {item.status}
                </StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400 light:text-slate-600">
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

export function StatusBadge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return <Badge tone={tone}>{children}</Badge>;
}

export function RoleBadge({ role }: { role: AppRole }) {
  return <Badge tone={roleTone[role]}>{roleLabel[role]} Workspace</Badge>;
}

export function AIButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      type="button"
      className={cn("h-11 shadow-[0_0_35px_rgba(50,245,154,0.2)]", className)}
      {...props}
    >
      <Sparkles className="h-4 w-4" aria-hidden="true" />
      {children}
    </Button>
  );
}

export function CommandSearch({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="nexora-focus hidden h-11 min-w-[280px] max-w-[520px] flex-1 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[rgba(18,24,21,0.68)] px-4 text-left text-sm text-[var(--muted)] shadow-[inset_0_1px_0_rgba(245,247,242,0.06),0_12px_34px_rgba(0,0,0,0.2)] transition hover:border-[color:var(--border-emerald)] hover:bg-[rgba(32,40,35,0.78)] light:border-slate-200 light:bg-white/92 light:text-slate-500 light:shadow-[0_10px_24px_rgba(39,53,86,0.06)] light:hover:border-emerald-100 light:hover:bg-white lg:flex"
    >
      <Sparkles
        className="h-4 w-4 text-[var(--brand-lime)] light:text-emerald-600"
        aria-hidden="true"
      />
      <span className="truncate">Search pages, ask AI, jump to a module</span>
      <span className="ml-auto rounded-lg border border-white/10 px-1.5 py-0.5 font-mono text-[10px] light:border-slate-200 light:bg-slate-50 light:text-slate-500">
        Ctrl K
      </span>
    </button>
  );
}

export function NotificationPanel() {
  return (
    <DashboardCard title="Notifications" icon={MessageSquareText} tone="amber">
      <div className="grid gap-2">
        {[
          "Fix request pending",
          "AI router is using local mode",
          "Lab report draft saved",
        ].map((item) => (
          <div
            key={item}
            className="rounded-lg border border-[var(--line)] bg-[rgba(255,255,255,0.035)] px-3 py-2 text-sm text-[#dfe8df] light:border-slate-200 light:bg-white/70 light:text-slate-700"
          >
            {item}
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Array<Record<string, ReactNode>>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)]">
      <div
        className="grid bg-white/[0.055] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 light:bg-slate-950/[0.035]"
        style={{
          gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>
      {rows.map((row) => {
        const rowKey = columns
          .map((column) => String(row[column] ?? ""))
          .join("|");

        return (
          <div
            key={rowKey}
            className="grid border-t border-[var(--line)] px-4 py-3 text-sm text-[#dfe8df] light:border-slate-200/80 light:text-slate-700"
            style={{
              gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
            }}
          >
            {columns.map((column) => (
              <span key={column} className="min-w-0 truncate">
                {row[column]}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function ReviewPanel({
  title,
  children,
  tone = "amber",
}: {
  title: string;
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <DashboardCard title={title} icon={FileText} tone={tone}>
      {children}
    </DashboardCard>
  );
}

export function FixRequestModal({ reason }: { reason: string }) {
  return (
    <ReviewPanel title="Fix Request Draft" tone="amber">
      <p className="text-sm leading-6 text-[#dfe8df]">{reason}</p>
    </ReviewPanel>
  );
}

export function FeedbackComposer({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[rgba(5,7,6,0.35)] p-3 shadow-[inset_0_1px_0_rgba(245,247,242,0.04)] light:bg-white/70">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 w-full resize-y bg-transparent text-sm leading-6 text-[var(--foreground)] outline-none placeholder:text-[var(--text-muted)] light:text-slate-800"
      />
      <div className="mt-3 flex justify-end">
        <Button type="button" onClick={onSend}>
          Send Feedback
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

export function CodeEditorShell({
  title,
  language,
  children,
}: {
  title: string;
  language: string;
  children: ReactNode;
}) {
  return (
    <div className="nexora-code-shell overflow-hidden rounded-[16px] border border-[var(--line-strong)] bg-[#050706] shadow-[0_24px_80px_rgba(0,0,0,0.46),0_0_46px_rgba(50,245,154,0.06)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] bg-[rgba(217,255,87,0.04)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Code2
            className="h-4 w-4 text-[var(--brand-lime)]"
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-slate-200">{title}</span>
        </div>
        <Badge tone="slate">{language}</Badge>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function DiagramCanvasShell({ children }: { children: ReactNode }) {
  return (
    <div className="nexora-dark-canvas command-grid relative min-h-[420px] overflow-hidden rounded-[16px] border border-[var(--line-strong)] bg-[#050706]/95 p-4 light:bg-[#07111f]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(50,245,154,0.13),transparent_35%),radial-gradient(circle_at_84%_10%,rgba(138,95,61,0.16),transparent_34%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function ReportPreviewCard({
  title,
  sections,
}: {
  title: string;
  sections: Array<{ heading: string; body: string }>;
}) {
  return (
    <DashboardCard title={title} icon={FileText} tone="cyan">
      <div className="grid gap-3">
        {sections.map((section) => (
          <div
            key={section.heading}
            className="rounded-lg border border-[var(--line)] bg-white/[0.035] p-3 light:border-slate-200 light:bg-white/70"
          >
            <p className="text-sm font-semibold text-[var(--foreground)] light:text-slate-950">
              {section.heading}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400 light:text-slate-600">
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

export function SkillScoreCard({
  label,
  score,
  tone = "violet",
}: {
  label: string;
  score: number;
  tone?: Tone;
}) {
  return (
    <DashboardCard title={label} icon={Radar} tone={tone}>
      <div className="flex items-center gap-4">
        <ScoreRing value={score} tone={tone} />
        <p className="text-sm leading-6 text-slate-400 light:text-slate-600">
          Activity-weighted score with roadmap suggestions.
        </p>
      </div>
    </DashboardCard>
  );
}

export function ModelStatusCard({
  model,
  detail,
  status = "online",
}: {
  model: string;
  detail: string;
  status?: string;
}) {
  return (
    <DashboardCard title={model} detail={detail} icon={Bot} tone="emerald">
      <div className="flex items-center gap-2 text-sm text-[var(--brand-emerald)] light:text-emerald-700">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        {status}
      </div>
    </DashboardCard>
  );
}

export function EmptyState({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <Card className="grid min-h-64 place-items-center text-center">
      <div className="max-w-md">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[color:var(--border-lime)] bg-[rgba(217,255,87,0.1)]">
          <Sparkles
            className="h-6 w-6 text-[var(--brand-lime)]"
            aria-hidden="true"
          />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-[var(--foreground)] light:text-slate-950">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-400 light:text-slate-600">
          {detail}
        </p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </Card>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="grid gap-4">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-24 animate-pulse rounded-[var(--radius-command)] border border-white/10 bg-white/[0.055]"
        />
      ))}
    </div>
  );
}

export function ScoreRing({
  value,
  tone = "cyan",
}: {
  value: number;
  tone?: Tone;
}) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className="grid h-24 w-24 shrink-0 place-items-center rounded-full shadow-[0_0_36px_rgba(50,245,154,0.1)]"
      style={{
        background: `conic-gradient(var(--brand-${tone === "slate" ? "cyan" : tone}) ${clamped}%, rgba(255,255,255,0.08) 0)`,
      }}
    >
      <div className="grid h-[76px] w-[76px] place-items-center rounded-full bg-[#050706] font-mono text-lg font-semibold text-[var(--foreground)] light:bg-white light:text-slate-950">
        {clamped}
      </div>
    </div>
  );
}

export function MetricRail({
  items,
}: {
  items: Array<{
    label: string;
    value: string;
    tone?: Tone;
    icon?: LucideIcon;
  }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={item.value}
          tone={item.tone}
          icon={item.icon}
        />
      ))}
    </div>
  );
}

export function CommandLinkRow({
  title,
  detail,
  icon: Icon = ChevronRight,
  tone = "cyan",
}: {
  title: string;
  detail: string;
  icon?: LucideIcon;
  tone?: Tone;
}) {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-white/[0.035] p-3 transition hover:border-[color:var(--border-emerald)] hover:bg-[rgba(217,255,87,0.055)] light:border-slate-200/80 light:bg-white/70 light:hover:border-cyan-500/25 light:hover:bg-white">
      <div>
        <p className="text-sm font-semibold text-[var(--foreground)] light:text-slate-950">
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
      </div>
      <Icon
        className={cn(
          "h-4 w-4 transition group-hover:translate-x-0.5",
          toneText[tone],
        )}
      />
    </div>
  );
}

export { Database, ShieldCheck };
