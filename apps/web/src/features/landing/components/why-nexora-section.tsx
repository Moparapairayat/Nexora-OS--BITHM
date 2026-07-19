"use client";

import type { LucideIcon } from "lucide-react";
import {
  Braces,
  ChartNoAxesCombined,
  FileCheck2,
  FlaskConical,
  MessageSquareText,
  UsersRound,
} from "lucide-react";
import Image from "next/image";

import { ScrollReveal } from "./landing-primitives";

type Benefit = {
  detail: string;
  icon: LucideIcon;
  title: string;
};

const leftBenefits: Benefit[] = [
  {
    title: "Coursework stays structured",
    detail: "Briefs, evidence, and reports remain together.",
    icon: FileCheck2,
  },
  {
    title: "Lab work keeps its context",
    detail: "Code, testing, and documentation follow one flow.",
    icon: FlaskConical,
  },
  {
    title: "Feedback points forward",
    detail: "Every comment leads to a clear next step.",
    icon: MessageSquareText,
  },
];

const rightBenefits: Benefit[] = [
  {
    title: "A workspace for every role",
    detail: "Students, teachers, and admins see what matters.",
    icon: UsersRound,
  },
  {
    title: "Practical tools, ready when needed",
    detail: "Work moves from planning to building without clutter.",
    icon: Braces,
  },
  {
    title: "Progress stays easy to follow",
    detail: "Deadlines, revisions, and submissions remain visible.",
    icon: ChartNoAxesCombined,
  },
];

function BenefitItem({ benefit, side, index }: { benefit: Benefit; side: "left" | "right"; index: number }) {
  const Icon = benefit.icon;

  return (
    <div
      className={`relative flex min-h-[106px] items-center gap-4 overflow-hidden rounded-2xl border border-white/14 bg-white/[0.055] px-5 py-4 shadow-[0_18px_42px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:px-6 light:border-emerald-900/12 light:bg-white/76 light:shadow-[0_18px_40px_rgba(32,78,52,0.09)] ${
        side === "left" ? "lg:flex-row-reverse lg:text-right" : "lg:text-left"
      }`}
    >
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/45 to-transparent light:via-emerald-700/24" />
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-emerald-300/18 bg-emerald-300/8 text-emerald-200 shadow-[inset_0_0_18px_rgba(52,211,153,0.08)] light:border-emerald-700/14 light:bg-emerald-100/80 light:text-emerald-700 light:shadow-none">
        <Icon className="h-[19px] w-[19px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className={`flex items-center gap-2 ${side === "left" ? "lg:justify-end" : ""}`}>
          <span className="font-mono text-[9px] font-semibold tracking-[0.12em] text-emerald-300/55 light:text-emerald-700/60">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-base font-semibold leading-5 tracking-[-0.02em] text-white sm:text-[1.05rem] light:text-slate-900">
            {benefit.title}
          </h3>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-300/68 sm:text-[13px] light:text-slate-600">
          {benefit.detail}
        </p>
      </div>
    </div>
  );
}

function NexoraOrbit({ idPrefix }: { idPrefix: string }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[440px]">
      <div className="pointer-events-none absolute inset-[14%] rounded-full bg-emerald-400/16 blur-[70px] light:bg-cyan-300/20" />
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 520 520"
        fill="none"
      >
        <defs>
          <linearGradient id={`${idPrefix}-orbit-a`} x1="95" y1="86" x2="421" y2="224" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB" />
            <stop offset="0.52" stopColor="#0EA5E9" />
            <stop offset="1" stopColor="#22D3A5" />
          </linearGradient>
          <linearGradient id={`${idPrefix}-orbit-b`} x1="94" y1="229" x2="425" y2="331" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4F46E5" />
            <stop offset="0.5" stopColor="#0891B2" />
            <stop offset="1" stopColor="#34D399" />
          </linearGradient>
          <linearGradient id={`${idPrefix}-orbit-c`} x1="103" y1="344" x2="415" y2="456" gradientUnits="userSpaceOnUse">
            <stop stopColor="#14B8A6" />
            <stop offset="0.56" stopColor="#0F766E" />
            <stop offset="1" stopColor="#84CC16" />
          </linearGradient>
        </defs>

        <g opacity="0.94">
          <ellipse cx="260" cy="157" rx="170" ry="90" stroke={`url(#${idPrefix}-orbit-a)`} strokeWidth="72" />
          <ellipse cx="260" cy="260" rx="170" ry="90" stroke={`url(#${idPrefix}-orbit-b)`} strokeWidth="72" />
          <ellipse cx="260" cy="363" rx="170" ry="90" stroke={`url(#${idPrefix}-orbit-c)`} strokeWidth="72" />
        </g>

        <g opacity="0.82">
          <ellipse cx="260" cy="157" rx="205" ry="108" stroke="#5EEAD4" strokeWidth="1.8" strokeDasharray="4 6" />
          <ellipse cx="260" cy="260" rx="205" ry="108" stroke="#BAE6FD" strokeWidth="1.8" strokeDasharray="4 6" />
          <ellipse cx="260" cy="363" rx="205" ry="108" stroke="#86EFAC" strokeWidth="1.8" strokeDasharray="4 6" />
        </g>
      </svg>

      <div className="absolute left-1/2 top-1/2 grid h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[28px] border border-white/18 bg-[#04120d]/78 shadow-[0_20px_55px_rgba(0,0,0,0.34)] backdrop-blur-xl light:border-emerald-900/12 light:bg-white/88 light:shadow-[0_18px_42px_rgba(31,91,57,0.16)]">
        <Image
          src="/brand/nexora-os-icon.png"
          alt=""
          width={52}
          height={52}
          className="h-12 w-12 object-contain"
        />
      </div>

      <span className="absolute left-[6%] top-[18%] rounded-full border border-white/12 bg-[#06140f]/72 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100 backdrop-blur-md light:border-cyan-800/14 light:bg-white/88 light:text-cyan-800">
        Brief
      </span>
      <span className="absolute right-[2%] top-[47%] rounded-full border border-white/12 bg-[#06140f]/72 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100 backdrop-blur-md light:border-emerald-800/14 light:bg-white/88 light:text-emerald-800">
        Build
      </span>
      <span className="absolute bottom-[13%] left-[9%] rounded-full border border-white/12 bg-[#06140f]/72 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100 backdrop-blur-md light:border-lime-800/14 light:bg-white/88 light:text-lime-800">
        Review
      </span>
    </div>
  );
}

export function WhyNexoraSection() {
  const mobileBenefits = [...leftBenefits, ...rightBenefits];

  return (
    <section
      id="why-nexora"
      className="relative overflow-hidden border-y border-emerald-300/10 bg-[radial-gradient(circle_at_50%_48%,rgba(6,182,212,0.13),transparent_28%),radial-gradient(circle_at_18%_50%,rgba(16,185,129,0.1),transparent_30%),linear-gradient(180deg,#020906_0%,#03110c_100%)] px-5 py-20 text-white sm:py-24 md:px-8 light:border-emerald-900/10 light:bg-[radial-gradient(circle_at_50%_46%,rgba(34,211,238,0.15),transparent_29%),radial-gradient(circle_at_17%_48%,rgba(16,185,129,0.12),transparent_31%),linear-gradient(180deg,#f8fcf9_0%,#eaf5ee_100%)] light:text-slate-900"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/55 to-transparent light:via-emerald-700/30" />
      <div className="pointer-events-none absolute left-1/2 top-[46%] h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/6 light:border-emerald-900/7" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.13] light:opacity-[0.1]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(110,231,183,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(110,231,183,0.18) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
          maskImage: "radial-gradient(circle at center, black, transparent 76%)",
        }}
      />

      <div className="relative mx-auto max-w-[1320px]">
        <ScrollReveal>
          <div className="mx-auto max-w-5xl text-center">
            <div className="flex items-center justify-center gap-3 text-xs font-semibold text-emerald-200 light:text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-400 light:bg-emerald-600" />
              <span>Why Nexora</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 light:bg-emerald-600" />
            </div>

            <h2 className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.045em] text-white sm:text-5xl lg:text-[4rem] light:text-slate-900">
              <span>One workspace</span>
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-white/7 sm:h-14 sm:w-14 light:border-emerald-900/12 light:bg-white/80 light:shadow-[0_10px_28px_rgba(31,91,57,0.12)]">
                <Image src="/brand/nexora-os-icon.png" alt="" width={34} height={34} className="h-8 w-8 object-contain sm:h-9 sm:w-9" />
              </span>
              <span>every step connected.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300/74 sm:text-base light:text-slate-600">
              Coursework, practical tools, feedback, and progress stay in the same academic context.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12 hidden items-center gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)_minmax(0,1fr)] xl:gap-12">
          <div className="space-y-6">
            {leftBenefits.map((benefit, index) => (
              <ScrollReveal key={benefit.title} delay={index * 90}>
                <BenefitItem benefit={benefit} side="left" index={index} />
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={100}>
            <NexoraOrbit idPrefix="desktop-nexora" />
          </ScrollReveal>

          <div className="space-y-6">
            {rightBenefits.map((benefit, index) => (
              <ScrollReveal key={benefit.title} delay={(index + 1) * 90}>
                <BenefitItem benefit={benefit} side="right" index={index + 3} />
              </ScrollReveal>
            ))}
          </div>
        </div>

        <div className="mt-10 lg:hidden">
          <ScrollReveal>
            <NexoraOrbit idPrefix="mobile-nexora" />
          </ScrollReveal>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {mobileBenefits.map((benefit, index) => (
              <ScrollReveal key={benefit.title} delay={(index % 2) * 80}>
                <BenefitItem benefit={benefit} side="right" index={index} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
