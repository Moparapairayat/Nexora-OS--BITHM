import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  UserCog,
  UsersRound,
} from "lucide-react";

import { DemoLoginButtons } from "@/features/auth/demo-login-buttons";
import { NexoraLogo } from "@/components/brand/nexora-logo";
import { HeroScene } from "@/features/landing/hero-scene";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const subtitle =
  "One place for assignments, labs, feedback, and hands-on coding work.";

const roleAccess = [
  {
    label: "Student",
    href: "/login",
    detail: "Work on assignments, labs, and practical projects",
    icon: GraduationCap,
  },
  {
    label: "Teacher",
    href: "/login",
    detail: "Review work, give feedback, and track progress",
    icon: UsersRound,
  },
  {
    label: "Admin",
    href: "/login",
    detail: "Manage users, courses, access, and system settings",
    icon: UserCog,
  },
];

export function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <HeroScene />
      <div className="absolute right-5 top-8 z-20">
        <ThemeToggle />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-6 sm:px-8 md:py-8">
        <section className="command-surface-strong command-border mx-auto grid w-full max-w-5xl gap-6 overflow-hidden rounded-[20px] p-4 sm:rounded-[28px] sm:gap-8 sm:p-8 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_360px] light:border-emerald-100/80 light:bg-[linear-gradient(145deg,#fffdf5_0%,#ffffff_42%,#effbf4_100%)] light:shadow-[0_28px_80px_rgba(21,92,61,0.14)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(217,255,87,0.12),transparent_28rem),radial-gradient(circle_at_80%_18%,rgba(50,245,154,0.14),transparent_24rem),linear-gradient(145deg,rgba(138,95,61,0.14),transparent_52%)] light:bg-[radial-gradient(circle_at_18%_10%,rgba(184,243,79,0.18),transparent_25rem),radial-gradient(circle_at_84%_18%,rgba(7,167,93,0.14),transparent_24rem),linear-gradient(145deg,rgba(255,246,219,0.78),transparent_56%)]" />

          <div className="relative min-w-0">
            <div className="flex items-center gap-3">
              <div>
                <NexoraLogo
                  size="md"
                  priority
                  className="h-12 w-[185px] sm:w-[210px]"
                />
                <p className="mt-1.5 text-xs font-semibold text-[var(--muted)] light:text-slate-600">
                  Sign in to your account
                </p>
              </div>
            </div>

            <Badge tone="emerald" className="mt-8">
              BITHM Academic Platform
            </Badge>
            <h1 className="command-text-gradient mt-4 text-balance text-3xl font-semibold leading-[1.1] sm:mt-5 sm:text-5xl md:text-6xl">
              Study, build, and submit your work
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 sm:text-base sm:mt-5 sm:leading-7 text-[#dfe8df] light:text-slate-700">
              {subtitle}
            </p>
            <p className="mt-2 max-w-xl text-xs leading-5 sm:text-sm sm:mt-3 sm:leading-6 text-[var(--muted)] light:text-slate-600">
              Sign in with your student, teacher, or admin account to continue.
            </p>

            <div className="mt-6 sm:mt-8 grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-3">
              {roleAccess.map((role) => {
                const Icon = role.icon;

                return (
                  <Link
                    key={role.label}
                    href={role.href}
                    className="nexora-focus group rounded-xl sm:rounded-2xl border border-[var(--line)] bg-white/[0.035] p-3 sm:p-4 transition hover:border-[color:var(--border-emerald)] hover:bg-[rgba(217,255,87,0.055)] light:border-slate-200 light:bg-white/84 light:shadow-[0_12px_28px_rgba(21,92,61,0.06)] light:hover:border-emerald-200 light:hover:bg-emerald-50/70"
                  >
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                      <Icon
                        className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--brand-lime)] light:text-emerald-700"
                        aria-hidden="true"
                      />
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--brand-lime)] light:text-slate-500 light:group-hover:text-emerald-700" />
                    </div>
                    <p className="mt-2 sm:mt-4 text-xs sm:text-sm font-semibold text-[var(--foreground)] light:text-slate-950">
                      {role.label}
                    </p>
                    <p className="mt-1 sm:mt-2 text-xs leading-4 sm:leading-5 text-[var(--muted)] light:text-slate-600">
                      {role.detail}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          <aside className="relative flex min-w-0 flex-col justify-between gap-4 sm:gap-6 rounded-lg sm:rounded-[22px] border border-[var(--line)] bg-[rgba(5,7,6,0.42)] p-4 sm:p-5 shadow-[inset_0_1px_0_rgba(245,247,242,0.05)] light:border-emerald-100/80 light:bg-[linear-gradient(180deg,#ffffff_0%,#f4fbf5_100%)] light:shadow-[0_22px_55px_rgba(21,92,61,0.12),inset_0_1px_0_rgba(255,255,255,0.94)]">
            <div className="grid gap-2 sm:gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-lime)] light:text-emerald-700">
                  Explore the demo
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)] light:text-slate-600">
                  Choose a demo role to see how the platform works.
                </p>
              </div>
              <DemoLoginButtons variant="portal" />
            </div>

            <div className="flex justify-center py-2 sm:py-4">
              <Image
                src="/pengu.gif"
                alt="Join Us Penguin"
                width={220}
                height={220}
                className="h-auto w-48 sm:w-56 md:w-64"
                priority
              />
            </div>

            <Link
              href="/login"
              className="nexora-focus inline-flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-lg sm:rounded-xl bg-[linear-gradient(135deg,#d9ff57_0%,#6cf6b3_46%,#32f59a_100%)] px-4 text-xs sm:text-sm font-semibold !text-black shadow-[0_14px_42px_rgba(50,245,154,0.22)] transition hover:brightness-110 light:bg-[linear-gradient(135deg,#0ba85d_0%,#24d482_56%,#b8f34f_100%)] light:!text-white light:shadow-[0_16px_32px_rgba(7,154,86,0.24)]"
            >
              Sign in
              <ShieldCheck
                className="h-3 w-3 sm:h-4 sm:w-4"
                aria-hidden="true"
              />
            </Link>
          </aside>
        </section>
      </div>
    </main>
  );
}
