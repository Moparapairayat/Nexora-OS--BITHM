"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { NexoraLogo } from "@/components/brand/nexora-logo";
import { Badge } from "@/components/ui/badge";
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
    <main
      style={{ background: "var(--theme-page-aura), var(--theme-page-bg)" }}
      className="relative grid min-h-dvh w-full place-items-center overflow-x-hidden px-3 py-4 sm:px-6 sm:py-6 md:px-8 transition-colors duration-500 light:bg-[linear-gradient(135deg,#f9fdf8_0%,#fffdf3_46%,#edf9f3_100%)]"
    >
      <AuthBackgroundBranding />

      <div className="absolute right-3 top-4 z-30 sm:right-5 sm:top-8">
        <ThemeToggle />
      </div>

      <motion.section
        initial={{ opacity: 0, scale: 0.97, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="command-border relative grid w-full max-w-[460px] lg:max-w-[980px] xl:max-w-[1080px] overflow-hidden rounded-[22px] sm:rounded-[28px] lg:rounded-[34px] border border-[rgba(var(--theme-accent-primary-rgb-raw),0.25)] bg-[rgba(14,18,16,0.82)] shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_90px_rgba(var(--theme-accent-primary-rgb-raw),0.16)] sm:shadow-[0_28px_90px_rgba(0,0,0,0.48),0_0_90px_rgba(var(--theme-accent-primary-rgb-raw),0.18)] lg:shadow-[0_34px_120px_rgba(0,0,0,0.55),0_0_100px_rgba(var(--theme-accent-primary-rgb-raw),0.22)] backdrop-blur-2xl lg:min-h-[580px] lg:max-h-[calc(100dvh-32px)] lg:grid-cols-[0.46fr_0.54fr] light:border-emerald-100 light:bg-slate-50 light:shadow-[0_16px_50px_rgba(21,92,61,0.12)] sm:light:shadow-[0_20px_70px_rgba(21,92,61,0.14)] lg:light:shadow-[0_28px_90px_rgba(21,92,61,0.16)]"
      >
        <div className="relative flex min-w-0 flex-col overflow-y-auto scrollbar-none rounded-[22px] sm:rounded-[28px] lg:rounded-l-none lg:rounded-r-[34px] bg-[linear-gradient(180deg,rgba(245,247,242,0.055),rgba(var(--theme-accent-primary-rgb-raw),0.035)),rgba(5,7,6,0.35)] p-5 sm:p-7 lg:order-2 lg:px-7 lg:py-6 xl:px-8 xl:py-7 light:bg-[linear-gradient(180deg,#ffffff_0%,#fbfff8_64%,#fff8e8_100%)]">
          <AuthMascot />
          <div className="flex w-full min-w-0 flex-1 flex-col">
            {children}
          </div>
        </div>
        <div className="hidden lg:block lg:order-1 h-full w-full">
          <AuthPreviewPanel mode={mode} />
        </div>
      </motion.section>
    </main>
  );
}

function AuthBackgroundBranding() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -left-[13rem] top-[7%] h-16 w-[46rem] -rotate-[31deg] bg-[linear-gradient(90deg,transparent_0%,#32f59a_18%,#36d9ff_72%,transparent_100%)] opacity-55 blur-[0.2px] sm:-left-[9rem] sm:h-20 light:opacity-65" />
      <div className="absolute -left-[10rem] top-[11%] h-5 w-[42rem] -rotate-[31deg] bg-[#d9ff57] opacity-75 sm:h-7 light:opacity-85" />
      <div className="absolute -left-8 -top-24 h-64 w-64 rotate-[24deg] rounded-[42px] bg-[linear-gradient(145deg,#8b5cf6,#5b3df5)] opacity-45 sm:-left-2 sm:-top-20 light:opacity-65" />

      <div className="absolute -right-[17rem] top-[9%] h-24 w-[46rem] -rotate-[29deg] bg-[linear-gradient(90deg,transparent_0%,#18d4ff_20%,#32f59a_78%,transparent_100%)] opacity-50 sm:-right-[10rem] sm:h-28 light:opacity-70" />
      <div className="absolute -right-[15rem] top-[16%] h-6 w-[42rem] -rotate-[29deg] bg-[#6cf6b3] opacity-70 sm:-right-[8rem] light:opacity-80" />

      <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full border-[44px] border-cyan-400/35 sm:-bottom-16 sm:left-[5%] light:border-cyan-400/55" />
      <div className="absolute -bottom-10 left-[8%] h-40 w-40 rounded-full bg-violet-500/30 mix-blend-screen sm:bottom-[5%] sm:left-[13%] light:bg-violet-500/45 light:mix-blend-multiply" />

      <div className="absolute -bottom-28 right-[5%] h-28 w-[34rem] -rotate-[28deg] bg-[linear-gradient(90deg,transparent,#d9ff57_35%,#32f59a_72%,transparent)] opacity-35 light:opacity-55" />
      <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/[0.055] blur-3xl light:bg-emerald-300/15" />
    </div>
  );
}

function AuthMascot() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-2.5 top-2.5 sm:right-4 sm:top-4 z-30 lg:right-5 lg:top-5"
    >
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [-3, 2, -3] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <Image
          src="/mascots/nexora-auth-penguin.gif"
          alt=""
          width={200}
          height={200}
          unoptimized
          priority
          className="h-[105px] w-[105px] sm:h-[125px] sm:w-[125px] md:h-[135px] md:w-[135px] lg:h-[145px] lg:w-[145px] xl:h-[170px] xl:w-[170px] object-contain drop-shadow-md"
        />
      </motion.div>
    </div>
  );
}

export function AuthBrand() {
  return (
    <Link
      href="/"
      className="nexora-focus flex min-w-0 max-w-full items-start gap-2 sm:gap-3 rounded-xl"
    >
      <div className="min-w-0">
        <NexoraLogo
          size="sm"
          priority
          className="h-8 w-[140px] sm:h-10 sm:w-[168px] md:w-[190px]"
        />
      </div>
    </Link>
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
      className="grid min-w-0 gap-1 rounded-lg sm:rounded-2xl border border-[var(--line)] bg-black/20 p-1 light:border-emerald-100 light:bg-emerald-50/70"
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
            className={cn(
              "nexora-focus relative h-11 sm:h-12 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition",
              active
                ? "text-[#07100b] light:text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)] light:text-slate-600 light:hover:text-emerald-900",
            )}
            onClick={() => onChange(option.value)}
          >
            {active ? (
              <motion.span
                layoutId="auth-role-pill"
                className="absolute inset-0 rounded-lg sm:rounded-xl bg-[linear-gradient(135deg,var(--theme-accent-secondary),var(--theme-accent-primary))] shadow-[0_8px_24px_rgba(var(--theme-accent-primary-rgb-raw),0.25)] sm:shadow-[0_10px_30px_rgba(var(--theme-accent-primary-rgb-raw),0.3)] light:bg-[linear-gradient(135deg,var(--theme-accent-solid),var(--theme-accent-primary))] light:shadow-[0_8px_20px_rgba(var(--theme-accent-primary-rgb-raw),0.25)] sm:light:shadow-[0_10px_22px_rgba(var(--theme-accent-primary-rgb-raw),0.3)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            ) : null}
            <span className="relative font-bold text-slate-950 light:text-white">{option.label}</span>
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
    <label className="grid gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[#dfe8df] light:text-slate-700">
      <span className="font-semibold">{label}</span>
      {children}
      {error ? (
        <span
          role="alert"
          className="text-[10px] sm:text-xs font-medium text-rose-300 light:text-rose-600 animate-pulse"
        >
          ⚠️ {error}
        </span>
      ) : null}
    </label>
  );
}

export const authInputClass =
  "nexora-focus h-11 sm:h-[46px] w-full min-w-0 rounded-xl sm:rounded-2xl border border-[var(--line)] bg-[rgba(245,247,242,0.055)] px-3.5 sm:px-4 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-muted)] transition-all duration-200 focus:border-[var(--theme-accent-primary)] focus:bg-[rgba(var(--theme-accent-primary-rgb-raw),0.08)] focus:shadow-[0_0_0_3px_rgba(var(--theme-accent-primary-rgb-raw),0.15)] light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:light:shadow-[0_4px_12px_rgba(0,0,0,0.06)] light:focus:border-[var(--theme-accent-primary)] light:focus:bg-emerald-50/40 light:focus:ring-4 light:focus:ring-emerald-100/50";

function AuthPreviewPanel({ mode }: { mode: "login" | "register" }) {
  const title = mode === "register" ? "Create your account" : "Welcome back";
  const subtitle =
    mode === "register"
      ? "Request access to your BITHM courses and tools."
      : "Sign in to pick up where you left off.";

  return (
    <div className="relative h-full w-full overflow-hidden p-0">
      <motion.div
        initial={{ opacity: 0, y: 18, rotate: -1 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ background: "var(--auth-preview-bg)" }}
        className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden rounded-l-[34px] rounded-r-none p-6 md:p-8 lg:p-10 text-white shadow-none light:shadow-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_8%,rgba(255,255,255,0.64),transparent_9rem),radial-gradient(circle_at_44%_16%,rgba(255,147,197,0.5),transparent_12rem),linear-gradient(135deg,rgba(255,255,255,0.14),transparent_46%)]" />
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-[44%] bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,0.78),rgba(255,147,197,0.52)_32%,rgba(139,35,255,0.74)_66%,rgba(94,33,205,0.92))] shadow-[inset_18px_22px_50px_rgba(255,255,255,0.22),0_24px_80px_rgba(76,16,176,0.38)] blur-[0.2px] sm:h-48 sm:w-48 md:h-52 md:w-52" />
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [-8, -3, -8] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-12 top-2 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_32%_30%,rgba(71,232,255,0.98),rgba(8,173,223,0.88)_38%,rgba(26,68,255,0.94)_72%,rgba(33,22,190,0.98))] shadow-[inset_18px_18px_42px_rgba(255,255,255,0.18),0_24px_70px_rgba(0,126,255,0.34)] sm:h-36 sm:w-36 sm:top-4 md:h-44 md:w-44 lg:h-44 lg:w-44"
        >
          <div className="absolute left-[36%] top-[18%] h-14 w-14 rounded-full bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.55),rgba(19,141,161,0.72)_45%,rgba(20,54,115,0.84))] shadow-[0_18px_42px_rgba(0,30,80,0.28)] sm:h-16 sm:w-16 md:h-20 md:w-20" />
        </motion.div>
        <div className="absolute bottom-3 right-2 text-white/12 sm:bottom-4 md:bottom-6 md:right-4">
          <ArrowRight className="h-24 w-24 stroke-[1.25] sm:h-32 sm:w-32 md:h-36 md:w-36" />
        </div>

        <div className="relative z-10 flex h-full min-h-[210px] flex-col justify-end sm:min-h-[260px] md:min-h-[280px]">
          <div className="mb-auto flex items-center justify-between gap-2 sm:gap-3">
            <Badge className="border-white/20 bg-white/14 text-white shadow-none text-xs sm:text-sm">
              Nexora OS
            </Badge>
            <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/20 bg-white/14 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white/90 backdrop-blur-md">
              <Sparkles
                className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                aria-hidden="true"
              />
              Academic Portal
            </span>
          </div>

          <div className="max-w-full sm:max-w-[340px] pb-1 sm:pb-2">
            <h2 className="text-balance text-xl sm:text-2xl md:text-[2.5rem] md:leading-[1] lg:text-5xl font-semibold leading-tight tracking-normal">
              {title}
            </h2>
            <p className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base lg:text-lg font-medium leading-5 sm:leading-6 md:leading-7 text-white/88">
              {subtitle}
            </p>
          </div>

          <div className="mt-4 sm:mt-6 md:mt-8 grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
            <div className="rounded-xl sm:rounded-2xl border border-white/16 bg-white/12 p-2.5 sm:p-3 backdrop-blur-md">
              <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] text-white/62">
                Secure access
              </p>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-semibold text-white">
                Student, Teacher, Admin
              </p>
            </div>
            <div className="rounded-xl sm:rounded-2xl border border-white/16 bg-white/12 p-2.5 sm:p-3 backdrop-blur-md">
              <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] text-white/62">
                Workspace
              </p>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-semibold text-white">
                Labs, reports, and code
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
