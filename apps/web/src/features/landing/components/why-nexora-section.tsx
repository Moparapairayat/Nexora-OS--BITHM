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
import { NextGenBrandDivider } from "./nextgen-brand-divider";

type Benefit = {
  detail: string;
  icon: LucideIcon;
  title: string;
  customImage?: string;
};

const leftBenefits: Benefit[] = [
  {
    title: "Coursework stays structured",
    detail: "Briefs, evidence, and reports remain together.",
    icon: FileCheck2,
    customImage: "/landing/icons/coursework-structured-v2.png",
  },
  {
    title: "Lab work keeps its context",
    detail: "Code, testing, and documentation follow one flow.",
    icon: FlaskConical,
    customImage: "/landing/icons/lab-work.png",
  },
  {
    title: "Feedback points forward",
    detail: "Every comment leads to a clear next step.",
    icon: MessageSquareText,
    customImage: "/landing/icons/feedback.png",
  },
];

const rightBenefits: Benefit[] = [
  {
    title: "A workspace for every role",
    detail: "Students, teachers, and admins see what matters.",
    icon: UsersRound,
    customImage: "/landing/icons/workspace-role.png",
  },
  {
    title: "Practical tools, ready when needed",
    detail: "Work moves from planning to building without clutter.",
    icon: Braces,
    customImage: "/landing/icons/practical-tools.png",
  },
  {
    title: "Progress stays easy to follow",
    detail: "Deadlines, revisions, and submissions remain visible.",
    icon: ChartNoAxesCombined,
    customImage: "/landing/icons/progress-chart.png",
  },
];

function BenefitItem({ benefit, side, index }: { benefit: Benefit; side: "left" | "right"; index: number }) {
  const Icon = benefit.icon;

  return (
    <div
      className={`group flex items-start gap-4 sm:gap-5 transition-transform duration-300 hover:translate-x-1 ${
        side === "left" ? "lg:flex-row-reverse lg:text-right" : "lg:text-left"
      }`}
    >
      {/* Circular Icon Container matching How It Works section */}
      <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-[#0e241c] text-emerald-400 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:bg-emerald-900/60 light:border-transparent light:bg-[#e2efe9] light:text-[#1b5042] light:group-hover:bg-[#d4e8df]">
        {benefit.customImage ? (
          <Image
            src={benefit.customImage}
            alt={benefit.title}
            width={40}
            height={40}
            className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
          />
        ) : (
          <Icon className="h-7 w-7 stroke-[2.2]" />
        )}
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className={`flex items-center gap-2 ${side === "left" ? "lg:justify-end" : ""}`}>
          <span className="inline-flex items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-950/80 px-2.5 py-0.5 font-mono text-[10px] font-extrabold text-emerald-300 shadow-sm light:border-transparent light:bg-[#e2efe9] light:text-[#1b5042]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white transition-colors duration-300 group-hover:text-emerald-300 light:text-slate-900 light:group-hover:text-[#1b5042]">
            {benefit.title}
          </h3>
        </div>
        <p className="mt-1 text-xs sm:text-sm leading-snug text-slate-400 light:text-slate-600">
          {benefit.detail}
        </p>
      </div>
    </div>
  );
}

function NexoraOrbit({ idPrefix }: { idPrefix: string }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[370px]">
      {/* Ambient Glassmorphism Glow Spheres */}
      <div className="pointer-events-none absolute inset-[5%] rounded-full bg-gradient-to-tr from-emerald-500/18 via-teal-500/12 to-cyan-500/18 blur-[50px] light:from-emerald-400/22 light:via-teal-300/18 light:to-cyan-400/22" />
      <div className="pointer-events-none absolute inset-[22%] rounded-full bg-gradient-to-br from-emerald-400/20 via-cyan-400/15 to-blue-500/20 blur-[36px] light:from-emerald-500/18 light:to-cyan-300/20" />

      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 520 520"
        fill="none"
      >
        <defs>
          <linearGradient id={`${idPrefix}-orbit-a`} x1="95" y1="86" x2="421" y2="224" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB" stopOpacity="0.7" />
            <stop offset="0.52" stopColor="#0EA5E9" stopOpacity="0.85" />
            <stop offset="1" stopColor="#22D3A5" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id={`${idPrefix}-orbit-b`} x1="94" y1="229" x2="425" y2="331" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4F46E5" stopOpacity="0.7" />
            <stop offset="0.5" stopColor="#0891B2" stopOpacity="0.85" />
            <stop offset="1" stopColor="#34D399" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id={`${idPrefix}-orbit-c`} x1="103" y1="344" x2="415" y2="456" gradientUnits="userSpaceOnUse">
            <stop stopColor="#14B8A6" stopOpacity="0.7" />
            <stop offset="0.56" stopColor="#0F766E" stopOpacity="0.85" />
            <stop offset="1" stopColor="#84CC16" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        <g opacity="0.65">
          <ellipse cx="260" cy="157" rx="170" ry="90" stroke={`url(#${idPrefix}-orbit-a)`} strokeWidth="1.8" />
          <ellipse cx="260" cy="260" rx="170" ry="90" stroke={`url(#${idPrefix}-orbit-b)`} strokeWidth="1.8" />
          <ellipse cx="260" cy="363" rx="170" ry="90" stroke={`url(#${idPrefix}-orbit-c)`} strokeWidth="1.8" />
        </g>

        <g opacity="0.45">
          <ellipse cx="260" cy="157" rx="205" ry="108" stroke="#5EEAD4" strokeWidth="1.2" strokeDasharray="4 6" />
          <ellipse cx="260" cy="260" rx="205" ry="108" stroke="#BAE6FD" strokeWidth="1.2" strokeDasharray="4 6" />
          <ellipse cx="260" cy="363" rx="205" ry="108" stroke="#86EFAC" strokeWidth="1.2" strokeDasharray="4 6" />
        </g>
      </svg>

      <div className="absolute left-1/2 top-1/2 grid h-[84px] w-[84px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[24px] border border-white/18 bg-[#04120d]/78 shadow-[0_18px_48px_rgba(0,0,0,0.34)] backdrop-blur-xl light:border-emerald-900/12 light:bg-white/88 light:shadow-[0_16px_36px_rgba(31,91,57,0.16)]">
        <Image
          src="/brand/nexora-os-icon.png"
          alt=""
          width={46}
          height={46}
          className="h-11 w-11 object-contain"
        />
      </div>

      <span className="absolute left-[6%] top-[18%] rounded-full border border-white/12 bg-[#06140f]/72 px-3 py-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-cyan-100 backdrop-blur-md light:border-cyan-800/14 light:bg-white/88 light:text-cyan-800">
        Brief
      </span>
      <span className="absolute right-[2%] top-[47%] rounded-full border border-white/12 bg-[#06140f]/72 px-3 py-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-emerald-100 backdrop-blur-md light:border-emerald-800/14 light:bg-white/88 light:text-emerald-800">
        Build
      </span>
      <span className="absolute bottom-[13%] left-[9%] rounded-full border border-white/12 bg-[#06140f]/72 px-3 py-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-lime-100 backdrop-blur-md light:border-lime-800/14 light:bg-white/88 light:text-lime-800">
        Review
      </span>
    </div>
  );
}

function NextGenCyberDividerTop() {
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 w-full overflow-hidden leading-none select-none">
      <svg className="relative block w-full h-12 sm:h-16 md:h-20" viewBox="0 0 1440 160" preserveAspectRatio="none" fill="none">
        <defs>
          <linearGradient id="nextgen-why-top-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#06b6d4" stopOpacity="1" />
            <stop offset="70%" stopColor="#84cc16" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.7" />
          </linearGradient>
          <filter id="laser-glow-why-top" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Laser Glow Backing Cut */}
        <path
          d="M0,0 L0,75 C240,150 480,-10 720,90 C960,190 1200,20 1440,70 L1440,0 Z"
          fill="url(#nextgen-why-top-grad)"
          opacity="0.3"
          filter="url(#laser-glow-why-top)"
        />

        {/* Main Solid Cut Body matching top section background */}
        <path
          d="M0,0 L0,48 C240,120 480,-20 720,70 C960,160 1200,10 1440,50 L1440,0 Z"
          className="fill-[#040b08] light:fill-[#ffffff]"
        />

        {/* Glowing Laser Circuit Trace Line */}
        <path
          d="M0,49 C240,121 480,-19 720,71 C960,161 1200,11 1440,51"
          stroke="url(#nextgen-why-top-grad)"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Pulsing Cyber Particle Nodes */}
        <circle cx="240" cy="121" r="5" fill="#34d399" className="animate-pulse" />
        <circle cx="720" cy="71" r="6" fill="#06b6d4" className="animate-pulse" />
        <circle cx="1200" cy="11" r="5" fill="#a3e635" className="animate-pulse" />
      </svg>
    </div>
  );
}

export function WhyNexoraSection() {
  const mobileBenefits = [...leftBenefits, ...rightBenefits];

  return (
    <section
      id="why-nexora"
      style={{ background: "var(--theme-page-bg)" }}
      className="relative overflow-hidden px-5 py-14 sm:py-16 md:px-8 transition-colors duration-500 light:bg-[radial-gradient(circle_at_50%_46%,rgba(34,211,238,0.15),transparent_29%),radial-gradient(circle_at_17%_48%,rgba(16,185,129,0.12),transparent_31%),linear-gradient(180deg,#f8fcf9_0%,#eaf5ee_100%)] light:text-slate-900"
    >
      {/* Next-Gen Brand Divider with Running Laser & HUD Seal */}
      <NextGenBrandDivider toBgColorClass="fill-[#07100b] light:fill-[#ffffff]" badgeText="WHY NEXORA" />

      <div className="pointer-events-none absolute left-1/2 top-[46%] h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/6 light:border-emerald-900/7 hidden md:block" />

      <div className="relative mx-auto max-w-[1320px]">
        <ScrollReveal>
          <div className="mx-auto max-w-4xl text-center">
            {/* 3D Volumetric Script "Why Nexora" Headline */}
            <div className="overflow-visible inline-flex items-center justify-center">
              <span className="font-3d-neon-script text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal tracking-wide transform -rotate-2 select-none">
                Why Nexora
              </span>
            </div>

            <h2 className="mt-3 flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 text-balance text-3xl font-black leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[3.2rem] light:text-slate-900">
              <span className="font-extrabold tracking-tight">One workspace</span>
              <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 p-1.5 shadow-[0_0_20px_rgba(52,211,153,0.25)] backdrop-blur-xl sm:h-12 sm:w-12 light:border-emerald-600/20 light:bg-white/90 light:shadow-[0_8px_22px_rgba(31,91,57,0.15)]">
                <Image src="/brand/nexora-os-icon.png" alt="" width={30} height={30} className="h-7 w-7 object-contain sm:h-8 sm:w-8" />
              </span>
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(52,211,153,0.3)] light:from-emerald-700 light:via-teal-600 light:to-emerald-800">
                every step connected.
              </span>
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-xs font-medium leading-relaxed text-slate-300/85 sm:text-sm light:text-slate-600">
              Coursework, practical code tools, instructor feedback, and progress stay in one unified academic context.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-8 hidden items-center gap-7 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)_minmax(0,1fr)] xl:gap-10">
          <div className="space-y-4.5">
            {leftBenefits.map((benefit, index) => (
              <ScrollReveal key={benefit.title} delay={index * 60}>
                <BenefitItem benefit={benefit} side="left" index={index} />
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={80}>
            <NexoraOrbit idPrefix="desktop-nexora" />
          </ScrollReveal>

          <div className="space-y-4.5">
            {rightBenefits.map((benefit, index) => (
              <ScrollReveal key={benefit.title} delay={(index + 1) * 60}>
                <BenefitItem benefit={benefit} side="right" index={index + 3} />
              </ScrollReveal>
            ))}
          </div>
        </div>

        <div className="mt-8 lg:hidden">
          <div className="grid gap-3.5 sm:grid-cols-2">
            {mobileBenefits.map((benefit, index) => (
              <ScrollReveal key={benefit.title} delay={(index % 2) * 60}>
                <BenefitItem benefit={benefit} side="right" index={index} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
