import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

import { BrandedBackground } from "@/components/brand/branded-background";
import { NexoraLogo } from "@/components/brand/nexora-logo";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-12 light:bg-[#f7faf8]">
      <BrandedBackground variant="playful" />

      <section className="command-surface-strong command-border relative z-10 w-full max-w-xl rounded-[28px] p-7 text-center shadow-[0_28px_90px_rgba(0,0,0,0.36)] sm:p-10 light:bg-white/90">
        <NexoraLogo size="md" priority className="mx-auto h-11 w-auto" />
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-lime)] light:text-emerald-700">
          Error 404
        </p>
        <h1 className="command-text-gradient mt-3 text-balance text-4xl font-semibold sm:text-5xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-400 light:text-slate-600 sm:text-base">
          The link may be outdated, or the page may have moved. Head back home
          and choose where you want to go next.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="nexora-focus inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#d9ff57,#32f59a)] px-5 text-sm font-semibold text-[#07100b] shadow-[0_14px_36px_rgba(50,245,154,0.2)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
          <Link
            href="/login"
            className="nexora-focus inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.055] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.1] light:border-slate-200 light:bg-white light:text-slate-900"
          >
            <Compass className="h-4 w-4" aria-hidden="true" />
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
