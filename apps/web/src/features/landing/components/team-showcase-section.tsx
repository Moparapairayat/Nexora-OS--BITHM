"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

type ProfileCardProps = {
  name: string;
  role: string;
  imageSrc: string;
};

function ProfileCard({ name, role, imageSrc }: ProfileCardProps) {
  return (
    <article className="group relative mt-10 min-w-0 rounded-[26px] border border-emerald-200/12 bg-[#0b2119]/78 px-5 pb-6 pt-[76px] text-center shadow-[0_18px_45px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-colors duration-300 hover:border-emerald-300/28 light:border-[#1b5b43]/12 light:bg-white/82 light:shadow-[0_16px_36px_rgba(42,76,60,0.09)] light:hover:border-emerald-700/24">
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/35 to-transparent light:via-emerald-700/20" />
      <div className="absolute left-1/2 top-0 h-[126px] w-[106px] -translate-x-1/2 -translate-y-[42%] overflow-hidden rounded-[55px_55px_22px_22px] border border-white/45 bg-[#18362b] shadow-[0_12px_28px_rgba(0,0,0,0.3)] light:border-white light:bg-[#dcebe3] light:shadow-[0_12px_26px_rgba(31,70,51,0.16)]">
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="106px"
          draggable={false}
          className="pointer-events-none select-none object-cover object-top"
        />
        <span
          className="absolute inset-0 z-10 select-none"
          aria-hidden="true"
          onContextMenu={(event) => event.preventDefault()}
        />
      </div>
      <h3 className="mt-2 break-words font-serif text-[1.35rem] font-semibold leading-tight text-[#f7fff9] light:text-[#10281f]">
        {name}
      </h3>
      <p className="mt-2 text-[10px] font-bold uppercase leading-5 tracking-[0.16em] text-emerald-300/75 light:text-emerald-800/70">
        {role}
      </p>
    </article>
  );
}

function FeaturedInstructor() {
  return (
    <article className="group relative mx-auto flex min-h-[548px] w-full max-w-[430px] min-w-0 flex-col items-center px-7 pb-9 pt-14 text-center sm:px-10 sm:pt-16">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full drop-shadow-[0_24px_50px_rgba(0,0,0,0.22)] light:drop-shadow-[0_22px_42px_rgba(42,76,60,0.12)]"
        viewBox="0 0 430 560"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 558V102L215 2l213 100v456H2Z"
          fill="url(#team-featured-fill)"
          stroke="url(#team-featured-stroke)"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
        <defs>
          <linearGradient id="team-featured-fill" x1="215" y1="0" x2="215" y2="560" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--team-featured-start)" />
            <stop offset="1" stopColor="var(--team-featured-end)" />
          </linearGradient>
          <linearGradient id="team-featured-stroke" x1="20" y1="12" x2="420" y2="548" gradientUnits="userSpaceOnUse">
            <stop stopColor="#d6c28f" stopOpacity="0.55" />
            <stop offset="0.48" stopColor="#71ddb0" stopOpacity="0.75" />
            <stop offset="1" stopColor="#d6c28f" stopOpacity="0.38" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative z-10 h-[214px] w-[168px] overflow-hidden rounded-[88px_88px_28px_28px] border border-white/55 bg-[#24352f] shadow-[0_18px_40px_rgba(0,0,0,0.34)] light:border-white light:bg-[#e2e9e4] light:shadow-[0_16px_34px_rgba(42,76,60,0.18)]">
        <Image
          src="/landing/team/afsana_tabassum.png"
          alt="Afsana Tabassum Tamishra"
          fill
          sizes="168px"
          draggable={false}
          className="pointer-events-none select-none object-cover object-top"
        />
        <span
          className="absolute inset-0 z-10 select-none"
          aria-hidden="true"
          onContextMenu={(event) => event.preventDefault()}
        />
      </div>

      <div className="relative z-10 mt-5 flex min-w-0 flex-1 flex-col items-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200/75 light:text-emerald-800/70">
          Instructor &amp; project advisor
        </p>
        <h3 className="mt-2 max-w-[330px] break-words font-serif text-[clamp(1.65rem,4vw,2.15rem)] font-semibold leading-[1.04] tracking-[-0.025em] text-[#fbfff9] light:text-[#10281f]">
          Afsana Tabassum Tamishra
        </h3>
        <p className="mt-3 text-sm font-medium text-[#d3e2d9] light:text-[#38564a]">
          Lecturer · Department of Information Technology
        </p>
        <p className="mt-4 max-w-[320px] text-[13px] leading-6 text-[#a8bcb1] light:text-[#607168]">
          Provides academic guidance and oversees the direction of the Nexora OS coursework project.
        </p>

        <a
          href="#academic-project"
          className="mt-auto inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d6c28f]/40 bg-[#d6c28f]/8 px-5 py-2.5 text-xs font-semibold text-[#f5ead0] transition-colors hover:border-emerald-200/45 hover:bg-emerald-200/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 light:border-emerald-800/18 light:bg-white/75 light:text-[#214d3b] light:hover:border-emerald-700/30 light:hover:bg-emerald-50"
        >
          Project details
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

function HeadingOrnament({ reverse = false }: { reverse?: boolean }) {
  return (
    <span
      className={`hidden items-center sm:flex ${reverse ? "flex-row-reverse" : ""}`}
      aria-hidden="true"
    >
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#d6c28f]/70 md:w-24" />
      <span className="mx-2 h-3 w-3 rotate-45 border border-[#d6c28f]/70 bg-emerald-300/10 light:bg-emerald-700/5" />
      <span className="h-1.5 w-1.5 rotate-45 bg-emerald-300/70 light:bg-emerald-700/65" />
    </span>
  );
}

export function TeamShowcaseSection() {
  return (
    <section
      id="team"
      className="relative isolate overflow-hidden border-y border-emerald-300/10 bg-[#050b08] py-20 text-white [--team-featured-end:#05110c] [--team-featured-start:#123428] light:border-emerald-950/8 light:bg-[#f3eee4] light:text-[#10281f] light:[--team-featured-end:#eef5ef] light:[--team-featured-start:#ffffff] sm:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 light:hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 42%, rgba(16,185,129,0.13), transparent 34%), radial-gradient(circle at 8% 10%, rgba(214,194,143,0.08), transparent 24%), repeating-linear-gradient(115deg, transparent 0 32px, rgba(255,255,255,0.012) 33px 34px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 hidden light:block"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 40%, rgba(16,185,129,0.12), transparent 34%), radial-gradient(circle at 10% 12%, rgba(181,145,77,0.12), transparent 25%), repeating-linear-gradient(115deg, transparent 0 32px, rgba(28,80,56,0.025) 33px 34px)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300/75 light:text-emerald-800/70">
            Academic project team
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 sm:gap-6">
            <HeadingOrnament />
            <h2 className="font-serif text-[clamp(2.7rem,7vw,4.8rem)] font-medium leading-none tracking-[-0.045em] text-[#fbfff9] light:text-[#10281f]">
              Our Team
            </h2>
            <HeadingOrnament reverse />
          </div>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[#9eb2a8] light:text-[#607168] sm:text-[15px]">
            The people and academic context behind Nexora OS.
          </p>
        </header>

        <div className="relative mx-auto mt-12 max-w-[1180px] px-0 py-4 sm:px-4 lg:px-8">
          <div className="pointer-events-none absolute left-1/2 top-[44%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/7 blur-3xl light:bg-emerald-600/7" />

          <svg
            className="pointer-events-none absolute inset-10 hidden h-[calc(100%-5rem)] w-[calc(100%-5rem)] lg:block"
            viewBox="0 0 1100 620"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path d="M236 160C342 160 376 222 438 248" stroke="url(#team-connector)" strokeWidth="1.2" />
            <path d="M236 455C346 455 378 389 438 365" stroke="url(#team-connector)" strokeWidth="1.2" />
            <path d="M864 160C758 160 724 222 662 248" stroke="url(#team-connector)" strokeWidth="1.2" />
            <path d="M864 455C754 455 722 389 662 365" stroke="url(#team-connector)" strokeWidth="1.2" />
            <defs>
              <linearGradient id="team-connector" x1="236" y1="310" x2="864" y2="310" gradientUnits="userSpaceOnUse">
                <stop stopColor="#d6c28f" stopOpacity="0.2" />
                <stop offset="0.5" stopColor="#71ddb0" stopOpacity="0.62" />
                <stop offset="1" stopColor="#d6c28f" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>

          <div className="relative grid min-w-0 items-center gap-6 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
            <div className="order-2 grid min-w-0 gap-6 sm:grid-cols-2 md:col-span-2 lg:order-1 lg:col-span-3 lg:grid-cols-1">
              <ProfileCard
                name="Mopara Pair Ayat"
                role="Founder & Lead Developer"
                imageSrc="/landing/team/ayat.png"
              />
              <ProfileCard
                name="Emre Demir"
                role="Database Architect"
                imageSrc="/landing/team/emre_avatar.png"
              />
            </div>

            <div className="order-1 min-w-0 md:col-span-2 lg:order-2 lg:col-span-6">
              <FeaturedInstructor />
            </div>

            <div className="order-3 grid min-w-0 gap-6 sm:grid-cols-2 md:col-span-2 lg:col-span-3 lg:grid-cols-1">
              <ProfileCard
                name="Taen Ahammed"
                role="UI/UX Designer"
                imageSrc="/landing/team/tomas_avatar.png"
              />
              <ProfileCard
                name="Fatima Rahman"
                role="Lead Frontend Engineer"
                imageSrc="/landing/team/kati_avatar.png"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
