"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowRight, BarChart3, CheckCircle2, FileCheck2, FlaskConical } from "lucide-react";
import Link from "next/link";

import { ScrollReveal } from "./landing-primitives";
import { WorkflowMedia } from "./workflow-card";

type Tone = "emerald" | "cyan" | "amber";

type Step = {
  step: string;
  kicker: string;
  title: string;
  bullets: string[];
  status: string;
  action: string;
  icon: LucideIcon;
  tone: Tone;
};

const steps: Step[] = [
  {
    step: "01",
    kicker: "Plan",
    title: "Assignment reports",
    bullets: ["Prepare the report", "Organize evidence", "Submit & track status"],
    status: "Drafts auto-saved",
    action: "Open reports",
    icon: FileCheck2,
    tone: "emerald",
  },
  {
    step: "02",
    kicker: "Build",
    title: "Practical lab work",
    bullets: ["Read the brief", "Write & run tests", "Generate the lab report"],
    status: "Evidence bundled",
    action: "Open Code Lab",
    icon: FlaskConical,
    tone: "cyan",
  },
  {
    step: "03",
    kicker: "Review",
    title: "Progress & feedback",
    bullets: ["See deadlines at a glance", "Act on feedback in context", "Resubmit in one click"],
    status: "Feedback linked to work",
    action: "Review progress",
    icon: BarChart3,
    tone: "amber",
  },
];

const toneAccent: Record<Tone, string> = {
  emerald: "bg-emerald-400 light:bg-emerald-600",
  cyan: "bg-cyan-300 light:bg-cyan-600",
  amber: "bg-amber-300 light:bg-amber-500",
};

const toneIcon: Record<Tone, string> = {
  emerald: "border-emerald-300/18 bg-emerald-300/8 text-emerald-300 light:border-emerald-700/12 light:bg-emerald-50 light:text-emerald-700",
  cyan: "border-cyan-300/18 bg-cyan-300/8 text-cyan-200 light:border-cyan-700/12 light:bg-cyan-50 light:text-cyan-700",
  amber: "border-amber-300/18 bg-amber-300/8 text-amber-200 light:border-amber-700/12 light:bg-amber-50 light:text-amber-700",
};

const toneMeta: Record<Tone, string> = {
  emerald: "text-emerald-300 light:text-emerald-700",
  cyan: "text-cyan-200 light:text-cyan-700",
  amber: "text-amber-200 light:text-amber-700",
};

const tonePill: Record<Tone, string> = {
  emerald: "border-emerald-300/15 bg-emerald-300/5 text-emerald-200 light:border-emerald-700/15 light:bg-emerald-50 light:text-emerald-700",
  cyan: "border-cyan-300/15 bg-cyan-300/5 text-cyan-200 light:border-cyan-700/15 light:bg-cyan-50 light:text-cyan-700",
  amber: "border-amber-300/15 bg-amber-300/5 text-amber-200 light:border-amber-700/15 light:bg-amber-50 light:text-amber-700",
};

const toneDot: Record<Tone, string> = {
  emerald: "bg-emerald-400 light:bg-emerald-600",
  cyan: "bg-cyan-300 light:bg-cyan-600",
  amber: "bg-amber-300 light:bg-amber-500",
};

const toneBadge: Record<Tone, string> = {
  emerald: "border-emerald-300/18 text-emerald-200 light:border-emerald-700/18 light:text-emerald-700",
  cyan: "border-cyan-300/18 text-cyan-200 light:border-cyan-700/18 light:text-cyan-700",
  amber: "border-amber-300/18 text-amber-200 light:border-amber-700/18 light:text-amber-700",
};

export function WorkflowsSection() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden border-y border-white/8 bg-[radial-gradient(circle_at_50%_18%,rgba(52,211,153,0.09),transparent_34%),linear-gradient(180deg,#050b08_0%,#06100c_100%)] px-5 py-20 light:border-slate-200 light:bg-[radial-gradient(circle_at_50%_18%,rgba(16,185,129,0.1),transparent_34%),linear-gradient(180deg,#fbfdfb_0%,#f3f7f4_100%)] sm:py-24 md:px-8"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[62%] -translate-x-1/2 rounded-full border border-emerald-300/7 light:border-emerald-800/6" />

      <div className="relative mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-7 bg-emerald-300/55 light:bg-emerald-700/40" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 light:text-emerald-700">
                Core workflows
              </p>
              <span className="h-px w-7 bg-emerald-300/55 light:bg-emerald-700/40" />
            </div>
            <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.06] tracking-[-0.04em] text-white sm:text-5xl light:text-slate-900">
              From brief to submission — without losing the thread.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base light:text-slate-600">
              Plan the work, build it, gather your evidence, and respond to feedback — all in one connected flow.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400 light:text-slate-600">
              <span className="font-semibold text-slate-200 light:text-slate-800">3 connected steps</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-200 light:text-slate-800">0 context switches</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-200 light:text-slate-800">1 timeline</span>
            </div>
          </div>
        </ScrollReveal>

        <div className="hidden items-center justify-between gap-4 max-w-5xl mx-auto mt-12 mb-2 lg:flex">
          {steps.flatMap((stepItem, index) => {
            const node = (
              <div key={`node-${stepItem.step}`} className="flex flex-col items-center">
                <span
                  className={`grid h-11 w-11 place-items-center rounded-full border text-sm font-semibold font-mono ${toneBadge[stepItem.tone]}`}
                >
                  {stepItem.step}
                </span>
                <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-300 light:text-slate-700">
                  {stepItem.kicker}
                </span>
              </div>
            );
            const connector =
              index < steps.length - 1 ? (
                <div
                  key={`connector-${stepItem.step}`}
                  className="h-px flex-1 border-t border-dashed border-white/15 light:border-slate-300"
                />
              ) : null;
            return [node, connector];
          })}
        </div>

        <div className="mt-10 grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((stepItem, index) => {
            const Icon = stepItem.icon;
            return (
              <ScrollReveal
                key={stepItem.title}
                delay={index * 120}
                className={
                  index === 2
                    ? "h-full md:col-span-2 md:mx-auto md:w-[calc(50%-0.625rem)] lg:col-span-1 lg:mx-0 lg:w-auto"
                    : "h-full"
                }
              >
                <article
                  className="group relative flex h-full min-h-[480px] flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#0b1510] shadow-[0_24px_54px_rgba(0,0,0,0.18)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-white/18 light:border-slate-200/90 light:bg-[#fbfcfb] light:shadow-[0_22px_48px_rgba(32,65,47,0.08)] light:hover:border-emerald-900/18"
                >
                  <span aria-hidden="true" className={`absolute inset-x-7 top-0 h-[2px] ${toneAccent[stepItem.tone]}`} />

                  <div className="relative shrink-0 overflow-hidden transition-transform duration-500 group-hover:scale-[1.02] border-b border-white/9 light:border-slate-200/90">
                    <WorkflowMedia index={index} />
                  </div>

                  <div className="flex flex-1 flex-col px-6 pb-6 pt-6 sm:px-7">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${toneIcon[stepItem.tone]}`}>
                          <Icon className="h-[18px] w-[18px]" />
                        </span>
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${toneMeta[stepItem.tone]}`}>
                            {stepItem.kicker}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 light:text-slate-400">
                            Step {stepItem.step}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-2xl font-semibold text-white/8 light:text-slate-900/10">
                        {stepItem.step}
                      </span>
                    </div>

                    <h3 className="mt-5 text-[1.5rem] font-semibold leading-[1.14] tracking-[-0.035em] text-white light:text-slate-900">
                      {stepItem.title}
                    </h3>

                    <ul className="mt-4 space-y-2.5">
                      {stepItem.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2.5 text-sm leading-6 text-slate-300 light:text-slate-600"
                        >
                          <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${toneMeta[stepItem.tone]}`} />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    <span
                      className={`mt-5 inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${tonePill[stepItem.tone]}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${toneDot[stepItem.tone]}`} />
                      {stepItem.status}
                    </span>

                    <Link
                      href="/login"
                      className="landing-focus-ring mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-100 transition-colors hover:text-emerald-200 light:text-slate-800 light:hover:text-emerald-800"
                    >
                      {stepItem.action}
                      <span className="grid h-7 w-7 place-items-center rounded-full border border-white/12 bg-white/5 light:border-slate-300 light:bg-white">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={120}>
          <div className="flex justify-center">
            <Link
              href="/login"
              className="landing-focus-ring mx-auto mt-12 inline-flex h-11 items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/8 px-5 text-sm font-semibold text-emerald-100 transition-colors hover:border-emerald-300/45 hover:bg-emerald-300/14 hover:text-white light:border-emerald-700/25 light:bg-emerald-50 light:text-emerald-800 light:hover:border-emerald-700/45 light:hover:bg-emerald-100"
            >
              See how a real assignment flows through Nexora OS
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
