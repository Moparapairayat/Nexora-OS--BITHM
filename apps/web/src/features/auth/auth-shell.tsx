"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { NexoraLogo } from "@/components/brand/nexora-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

export function AuthShell({
  children,
  mode,
}: {
  children: ReactNode;
  mode: "login" | "register";
}) {
  return (
    <main className="relative min-h-dvh w-full flex items-center justify-center overflow-x-hidden p-2.5 sm:p-4 md:p-6 lg:p-6 xl:p-8 bg-[#060907] dark:bg-[#060907] light:bg-[#f2f6f3] transition-colors duration-300">
      {/* Dark mode glowing radial backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(50,245,154,0.14),transparent_50rem),linear-gradient(180deg,#060907_0%,#040605_100%)] opacity-100 dark:opacity-100 light:opacity-0 transition-opacity duration-300" />

      {/* Light mode soft clean radial backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.09),transparent_42rem),linear-gradient(180deg,#f8fbf9_0%,#eef4f0_100%)] opacity-0 dark:opacity-0 light:opacity-100 transition-opacity duration-300" />

      {/* Dynamic Theme Glow Beams */}
      <AuthBackgroundBranding />

      {/* Top Floating Theme Switcher */}
      <div className="absolute right-3 top-3 z-40 sm:right-6 sm:top-5">
        <ThemeToggle />
      </div>

      {/* Main Wide Split Showcase Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[1140px] xl:max-w-[1180px] overflow-hidden rounded-[22px] sm:rounded-[30px] lg:rounded-[36px] border border-white/10 bg-[#0d1210]/95 shadow-[0_32px_100px_rgba(0,0,0,0.6),0_0_80px_rgba(50,245,154,0.08)] backdrop-blur-2xl grid lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.04fr_0.96fr] items-stretch light:border-slate-200/90 light:bg-white light:shadow-[0_24px_80px_rgba(20,50,35,0.08),0_4px_20px_rgba(0,0,0,0.04)]"
      >
        {/* Left Side: Visual Showcase Panel - Gently compacted height */}
        <div className="relative min-h-[190px] sm:min-h-[230px] lg:min-h-[490px] xl:min-h-[530px] overflow-hidden flex flex-col justify-between p-4 sm:p-5 lg:p-6 xl:p-7 rounded-t-[22px] sm:rounded-t-[30px] lg:rounded-t-none lg:rounded-l-[36px] bg-slate-100 dark:bg-[#070e0a]">
          {/* Background Photograph of Student/Campus */}
          <Image
            src="/landing/auth_showcase_hero.jpg"
            alt="Nexora OS Academic Learning"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />

          {/* Light Mode: Soft Luminous Bottom Fade with Warm Sunset Peach Glow in the bottom right corner */}
          <div className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-0 light:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-x-0 top-0 h-18 sm:h-22 bg-gradient-to-b from-white/70 via-white/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-white/95 via-white/75 to-transparent" />
            <div className="absolute -bottom-10 -right-10 h-60 w-60 sm:h-72 sm:w-72 rounded-full bg-[radial-gradient(circle,rgba(254,215,170,0.65)_0%,rgba(254,205,211,0.5)_40%,transparent_70%)] blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-52 w-52 sm:h-64 sm:w-64 rounded-full bg-[radial-gradient(circle,rgba(167,243,208,0.5)_0%,transparent_70%)] blur-2xl" />
          </div>

          {/* Dark Mode: Deep Obsidian Emerald Cinematic Overlays */}
          <div className="absolute inset-0 pointer-events-none opacity-100 dark:opacity-100 light:opacity-0 transition-opacity duration-300">
            <div className="absolute inset-x-0 top-0 h-20 sm:h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-[#040806] via-[#040806]/85 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.25),transparent_70%)]" />
          </div>

          {/* Top Row: Nexora Logo */}
          <div className="relative z-20 flex items-center justify-between gap-3">
            <Link href="/" className="nexora-focus inline-flex items-center gap-2">
              <NexoraLogo size="sm" priority className="h-7 w-[115px] sm:h-8 sm:w-[130px]" />
            </Link>
          </div>

          {/* Mascot Feature: Free-Floating Pengu Mascot */}
          <div className="relative z-20 my-auto flex justify-end pr-1 pt-1">
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative select-none"
            >
              <Image
                src="/mascots/nexora-auth-penguin.gif"
                alt="Nexora Pengu Mascot"
                width={120}
                height={120}
                unoptimized
                priority
                className="h-16 w-16 sm:h-19 sm:w-19 lg:h-21 lg:w-21 xl:h-23 xl:w-23 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
              />
              <span className="absolute -bottom-1 right-0 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8.5px] sm:text-[9px] font-extrabold text-white shadow-md">
                Hi there! 👋
              </span>
            </motion.div>
          </div>

          {/* Bottom Row: Inspiring Typography matching the reference screenshot */}
          <div className="relative z-20 max-w-[440px]">
            <h2 className="text-lg sm:text-xl lg:text-[30px] xl:text-[34px] font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.14]">
              Learn, connect & <br className="hidden sm:inline" />
              grow with <span className="text-emerald-600 dark:text-emerald-400">Nexora OS</span>.
            </h2>
            <p className="mt-1 sm:mt-2 text-xs sm:text-[13.5px] font-medium leading-relaxed text-slate-700/90 dark:text-slate-200/90 max-w-[390px]">
              Your all-in-one platform for courses, community and continuous learning.
            </p>
          </div>
        </div>

        {/* Right Side: Auth Form Pod - Subtly more compact */}
        <div className="relative flex flex-col justify-between p-4 sm:p-5 lg:p-6 xl:p-7 light:bg-white dark:bg-[#0d1210]/95 rounded-b-[22px] sm:rounded-b-[30px] lg:rounded-b-none lg:rounded-r-[36px]">
          <div className="my-auto w-full max-w-[385px] lg:max-w-[395px] mx-auto">
            {children}
          </div>

          {/* Bottom Right Copyright */}
          <div className="mt-2 text-center lg:text-right text-[10px] sm:text-[10.5px] font-medium text-slate-400 dark:text-slate-500 light:text-slate-400">
            © Nexora OS 2026 • BITHM Academic Intelligence
          </div>
        </div>
      </motion.div>
    </main>
  );
}

function AuthBackgroundBranding() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-95 dark:opacity-95 light:opacity-100 transition-opacity duration-500"
    >
      {/* Top Left Neon Cyan-Emerald Gradient Streak */}
      <div
        style={{ background: "var(--beam-1, linear-gradient(90deg, transparent 0%, #32f59a 18%, #36d9ff 72%, transparent 100%))" }}
        className="absolute -left-[13rem] top-[7%] h-16 w-[46rem] -rotate-[31deg] opacity-60 light:opacity-90 blur-[0.2px] sm:-left-[9rem] sm:h-20 transition-all duration-500"
      />

      {/* Top Left Lime Accent Stripe */}
      <div
        style={{ background: "var(--beam-2, #d9ff57)" }}
        className="absolute -left-[10rem] top-[11%] h-5 w-[42rem] -rotate-[31deg] opacity-80 light:opacity-95 light:bg-[#84cc16] sm:h-7 transition-all duration-500 shadow-sm"
      />

      {/* Top Left Geometric Rounded Prism Shape (The large purple/indigo shape) */}
      <div
        style={{ background: "var(--beam-3, linear-gradient(145deg, #8b5cf6, #5b3df5))" }}
        className="absolute -left-8 -top-24 h-64 w-64 rotate-[24deg] rounded-[42px] opacity-55 light:opacity-85 sm:-left-2 sm:-top-20 transition-all duration-500 shadow-[0_20px_50px_rgba(99,102,241,0.25)]"
      />

      {/* Top Right Cyan-Emerald Beam Streak */}
      <div
        style={{ background: "var(--beam-4, linear-gradient(90deg, transparent 0%, #18d4ff 20%, #32f59a 78%, transparent 100%))" }}
        className="absolute -right-[17rem] top-[9%] h-24 w-[46rem] -rotate-[29deg] opacity-55 light:opacity-90 sm:-right-[10rem] sm:h-28 transition-all duration-500"
      />

      {/* Top Right Mint Accent Stripe */}
      <div
        style={{ background: "var(--beam-5, #6cf6b3)" }}
        className="absolute -right-[15rem] top-[16%] h-6 w-[42rem] -rotate-[29deg] opacity-75 light:opacity-95 light:bg-[#059669] sm:h-8 transition-all duration-500 shadow-sm"
      />

      {/* Bottom Left Thick Orbiting Geometric Ring */}
      <div
        style={{ borderColor: "var(--beam-ring, rgba(6, 182, 212, 0.45))" }}
        className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full border-[44px] sm:-bottom-16 sm:left-[5%] light:border-[#0284c7]/55 light:shadow-[0_0_40px_rgba(2,132,199,0.2)] transition-all duration-500"
      />

      {/* Bottom Left Glowing Purple Sphere */}
      <div
        style={{ background: "var(--beam-circle, rgba(139, 92, 246, 0.45))" }}
        className="absolute -bottom-10 left-[8%] h-40 w-40 rounded-full mix-blend-screen sm:bottom-[5%] sm:left-[13%] light:mix-blend-multiply light:bg-[#7c3aed]/55 transition-all duration-500"
      />

      {/* Bottom Right Ambient Beam Streak */}
      <div
        style={{ background: "var(--beam-1, linear-gradient(90deg, transparent 0%, #32f59a 18%, #36d9ff 72%, transparent 100%))" }}
        className="absolute -bottom-28 right-[5%] h-28 w-[34rem] -rotate-[28deg] opacity-40 light:opacity-85 transition-all duration-500"
      />

      {/* Central Ambient Glow */}
      <div
        style={{ background: "var(--beam-glow, rgba(50, 245, 154, 0.1))" }}
        className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl light:bg-emerald-500/15 transition-all duration-500"
      />
    </div>
  );
}

export function RoleTabs<TValue extends string>({
  value,
  options,
  onChange,
}: {
  value: TValue;
  options: Array<{ value: TValue; label: string }>;
  onChange: (value: TValue) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Account role"
      className="grid min-w-0 gap-1 rounded-xl border border-[var(--line)] bg-black/25 p-1 light:border-slate-200 light:bg-slate-100"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            className="nexora-focus relative h-9 sm:h-10 rounded-lg text-xs sm:text-[13px] font-bold transition-colors duration-200"
            onClick={() => onChange(option.value)}
          >
            {active ? (
              <motion.span
                layoutId="auth-role-pill"
                className="absolute inset-0 rounded-lg border border-emerald-400/40 bg-[#044b3b] shadow-[0_6px_16px_rgba(4,75,59,0.35)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 transition-colors duration-200 font-extrabold",
                active
                  ? "!text-white"
                  : "text-slate-400 hover:text-white light:text-slate-600 light:hover:text-slate-950"
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function AuthField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-xs sm:text-[13px] font-medium text-slate-300 light:text-slate-700">
      <span className="font-semibold">{label}</span>
      {children}
      {error ? (
        <span
          role="alert"
          className="text-[11px] font-medium text-rose-400 light:text-rose-600 animate-pulse"
        >
          ⚠️ {error}
        </span>
      ) : null}
    </label>
  );
}

export const authInputClass =
  "nexora-focus h-10 sm:h-11 w-full min-w-0 rounded-xl border border-[var(--line)] bg-[rgba(245,247,242,0.055)] px-3.5 text-xs sm:text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-muted)] transition-all duration-200 focus:border-[var(--theme-accent-primary)] focus:bg-[rgba(var(--theme-accent-primary-rgb-raw),0.08)] focus:shadow-[0_0_0_3px_rgba(var(--theme-accent-primary-rgb-raw),0.15)] light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:shadow-[0_1px_3px_rgba(0,0,0,0.03)] light:focus:border-emerald-500 light:focus:bg-white light:focus:ring-3 light:focus:ring-emerald-100";
