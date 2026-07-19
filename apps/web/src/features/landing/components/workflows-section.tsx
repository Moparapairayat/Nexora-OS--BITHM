"use client";

import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BarChart3, CheckCircle2, FileCheck2, FlaskConical } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
    kicker: "Plan & Start",
    title: "Brief to practical work",
    bullets: ["Analyze assignment briefs directly", "Kickstart your lab workspace", "Zero setup times, zero delays"],
    status: "Ready for workspace",
    action: "View brief template",
    icon: FileCheck2,
    tone: "emerald",
  },
  {
    step: "02",
    kicker: "Build & Save",
    title: "Together evidence",
    bullets: ["Autosave code runs & outputs", "Compile logs as official evidence", "Keep documents side-by-side"],
    status: "Evidence synced",
    action: "Open Code Lab",
    icon: FlaskConical,
    tone: "cyan",
  },
  {
    step: "03",
    kicker: "Review & Refine",
    title: "Act on feedback",
    bullets: ["Get inline professor reviews", "Resolve comment threads in code", "Resubmit in a single click"],
    status: "Feedback loop active",
    action: "Review flow demo",
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

const glowColors: Record<Tone, string> = {
  emerald: "bg-emerald-500/10 dark:bg-emerald-500/15 light:bg-emerald-500/8",
  cyan: "bg-cyan-500/10 dark:bg-cyan-500/15 light:bg-cyan-500/8",
  amber: "bg-amber-500/10 dark:bg-amber-500/15 light:bg-amber-500/8",
};

export function WorkflowsSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 6000; // 6 seconds per step
    const stepTime = 100; // updates progress bar every 100ms
    const stepsCount = steps.length;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((current) => (current + 1) % stepsCount);
          return 0;
        }
        return prev + (100 / (intervalTime / stepTime));
      });
    }, stepTime);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleStepSelect = (index: number) => {
    setIsPaused(true);
    setActiveStep(index);
    setProgress(100);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    setProgress(0);
  };

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
              A clear path from task brief to final submission
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base light:text-slate-600">
              Move from the brief to practical work, keep your evidence together, and act on feedback — all in one connected flow.
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

        {/* Desktop Split Showcase */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center mt-16 max-w-6xl mx-auto">
          {/* Left: Stepper Accordion list */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {steps.map((stepItem, index) => {
              const Icon = stepItem.icon;
              const isActive = activeStep === index;
              return (
                <div
                  key={stepItem.step}
                  onClick={() => handleStepSelect(index)}
                  onMouseEnter={() => handleStepSelect(index)}
                  onMouseLeave={handleMouseLeave}
                  className={`group cursor-pointer text-left relative overflow-hidden rounded-[22px] border px-6 py-5 transition-all duration-300 ${
                    isActive
                      ? "border-white/15 bg-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.25)] light:border-slate-300 light:bg-[#fbfcfb] light:shadow-[0_20px_40px_rgba(32,65,47,0.06)]"
                      : "border-transparent bg-transparent hover:bg-white/[0.02] light:hover:bg-slate-50"
                  }`}
                >
                  {/* Active Indicator Glow Line */}
                  {isActive && (
                    <motion.span
                      layoutId="activeGlow"
                      className={`absolute left-0 inset-y-4 w-[3px] rounded-r-md ${toneAccent[stepItem.tone]}`}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Neon Connector Segment (runs under the icon to the next step) */}
                  {index < steps.length - 1 && (
                    <div
                      className="absolute w-[2px] bg-white/5 light:bg-slate-200"
                      style={{
                        left: "44px", // horizontal center of icon
                        top: "60px", // bottom of icon
                        bottom: "-16px", // runs down to meet the next card
                        zIndex: 0,
                      }}
                    >
                      <div
                        className={`w-full h-full origin-top transition-transform duration-700 ease-in-out ${
                          activeStep > index
                            ? `scale-y-100 ${toneAccent[stepItem.tone]}`
                            : "scale-y-0 bg-transparent"
                        }`}
                        style={{
                          boxShadow: activeStep > index ? `0 0 10px ${stepItem.tone === 'emerald' ? '#34d399' : stepItem.tone === 'cyan' ? '#67e8f9' : '#f59e0b'}` : 'none'
                        }}
                      />
                    </div>
                  )}

                  {/* Visual Progress Loader Loader bar */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
                      <div
                        className={`h-full transition-[width] ease-linear duration-100 ${toneAccent[stepItem.tone]}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <span
                      className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border text-sm font-semibold font-mono transition-colors duration-300 ${
                        isActive
                          ? toneIcon[stepItem.tone]
                          : "border-white/10 text-slate-400 light:border-slate-300 light:text-slate-500"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${isActive ? toneMeta[stepItem.tone] : "text-slate-500 light:text-slate-400"}`}>
                        {stepItem.kicker}
                      </span>
                      <h3 className="text-lg font-semibold text-white light:text-slate-900 mt-0.5">
                        {stepItem.title}
                      </h3>
                    </div>
                  </div>

                  {/* Expanded content under active step */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isActive ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden min-h-0">
                      <ul className="space-y-2.5">
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

                      <div className="mt-5 flex items-center justify-between gap-4 pt-1">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${tonePill[stepItem.tone]}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${toneDot[stepItem.tone]}`} />
                          {stepItem.status}
                        </span>

                        <Link
                          href="/login"
                          className="landing-focus-ring inline-flex items-center gap-2 text-xs font-semibold text-slate-100 transition-colors hover:text-emerald-200 light:text-slate-800 light:hover:text-emerald-800"
                        >
                          {stepItem.action}
                          <span className="grid h-6 w-6 place-items-center rounded-full border border-white/12 bg-white/5 light:border-slate-300 light:bg-white">
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Mockup browser preview */}
          <div className="lg:col-span-7 relative">
            {/* Pulsing dynamic glow background behind browser */}
            <div className={`absolute -inset-8 rounded-[26px] blur-3xl pointer-events-none opacity-60 transition-all duration-700 ease-in-out ${glowColors[steps[activeStep].tone]}`} />
            
            <div className="relative w-full rounded-2xl border border-white/10 bg-[#060c09] shadow-[0_24px_60px_rgba(0,0,0,0.45)] transition-all duration-300 light:border-slate-200 light:bg-slate-50 light:shadow-[0_20px_50px_rgba(32,65,47,0.08)]">
              {/* Browser header */}
              <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3 light:border-slate-200/70">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500/35 border border-red-500/20" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/35 border border-yellow-500/20" />
                  <span className="h-3 w-3 rounded-full bg-green-500/35 border border-green-500/20" />
                </div>
                <div className="mx-auto flex h-6 w-3/5 items-center justify-center rounded-md border border-white/5 bg-white/5 px-3 text-[10px] text-slate-400 font-mono light:border-slate-200 light:bg-white light:text-slate-500">
                  nexora.os/brief-to-submission
                </div>
              </div>
              {/* Content area */}
              <div className="relative h-[340px] w-full overflow-hidden bg-slate-950/40 light:bg-white">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute inset-0 h-full w-full"
                  >
                    <WorkflowMedia index={activeStep} className="relative h-full w-full overflow-hidden" isActive={true} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet card stack */}
        <div className="mt-10 grid items-stretch gap-5 md:grid-cols-2 lg:hidden">
          {steps.map((stepItem, index) => {
            const Icon = stepItem.icon;
            return (
              <ScrollReveal
                key={stepItem.title}
                delay={index * 120}
                className={
                  index === 2
                    ? "h-full md:col-span-2 md:mx-auto md:w-[calc(50%-0.625rem)]"
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
                      <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${toneDot[stepItem.tone]}`} />
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
      </div>
    </section>
  );
}
