"use client";

import Link from "next/link";
import { ArrowLeft, Clock3, Layers3, Sparkles } from "lucide-react";
import Image from "next/image";

import { AppShell } from "@/components/layout/app-shell";
import { BrandedBackground } from "@/components/brand/branded-background";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { roleDashboards, type AppRole, type Tone } from "@/data/dashboard.mock";

export type ComingSoonSection =
  | "Academic Work"
  | "AI Workspace"
  | "ML & Data"
  | "Content Studio"
  | "Feedback"
  | "Activity & Notifications"
  | "Developer Tools"
  | "AcademicShield";

const sectionTone: Record<ComingSoonSection, Tone> = {
  "Academic Work": "cyan",
  "AI Workspace": "violet",
  "ML & Data": "emerald",
  "Content Studio": "rose",
  Feedback: "amber",
  "Activity & Notifications": "slate",
  "Developer Tools": "cyan",
  AcademicShield: "rose",
};

const mascotByRoute: Record<string, string> = {
  activity: "/mascots/pengu-for-you-love.gif",
  notifications: "/mascots/pengu-notifications-cleaning.gif",
  assignments: "/mascots/pengu-assignments-dancing.gif",
  labs: "/mascots/pengu-labs-love.gif",
  "lab-management": "/mascots/pengu-labs-love.gif",
  "lab-reports": "/mascots/pengu-lab-reports-working.gif",
  submissions: "/mascots/pengu-submissions-angry.gif",
  "teacher-feedback": "/mascots/pengu-teacher-feedback-thinking.gif",
  "project-architect": "/mascots/pengu-project-architect-eating.gif",
  "code-doctor": "/mascots/pengu-code-doctor-angry.gif",
  "ai-feedback-engine": "/mascots/pengu-ai-feedback-traveling.gif",
  "ai-brief-analyzer": "/mascots/pengu-brief-analyzer-sleepy.gif",
  "erd-to-code": "/mascots/pengu-erd-waiting.gif",
  "api-tester": "/mascots/pengu-api-tester-tired.gif",
  "github-analyzer": "/mascots/pengu-github-analyzer-bored.gif",
  "deployment-assistant": "/mascots/pengu-deployment-no.gif",
  "dataset-manager": "/mascots/pengu-dataset-pain.gif",
  "ml-studio": "/mascots/pengu-ml-studio-ping-pong.gif",
  "automl-assistant": "/mascots/pengu-automl-hello.gif",
  "ml-reports": "/mascots/pengu-ml-reports-dance.gif",
  "slide-maker": "/mascots/pengu-slide-maker-waiting.gif",
  documentation: "/mascots/pengu-documentation-shocked.gif",
  "research-assistant": "/mascots/pengu-research-dance.gif",
  "ocr-document-reader": "/mascots/pengu-ocr-rainy.gif",
};

export function ComingSoonPage({
  role,
  section,
  requestedHref,
}: {
  role: AppRole;
  section: ComingSoonSection;
  requestedHref: string;
}) {
  const data = roleDashboards[role];
  const activeItem = data.nav.find((item) => item.href === requestedHref);
  const title = activeItem?.label ?? section;
  const tone = sectionTone[section];
  const [, routeKey = ""] = requestedHref.split("/").filter(Boolean);
  const mascotSrc = mascotByRoute[routeKey];

  return (
    <AppShell
      role={role}
      title={title}
      subtitle={`${title} is not available yet.`}
      nav={data.nav}
      navGroups={data.navGroups}
      accountEmail={data.accountEmail}
    >
      <Card className="relative overflow-hidden p-0">
        <BrandedBackground variant="subtle" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(50,245,154,0.12),transparent_48%)]" />
        <div className="absolute right-4 top-4 z-10 sm:right-5 sm:top-5">
          <Link
            href={`/${role}/dashboard`}
            className="nexora-focus inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-3 text-xs font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.1] light:border-slate-200 light:bg-white light:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to dashboard
          </Link>
        </div>

        <div className="relative flex min-h-[430px] flex-col items-center justify-center px-6 py-14 text-center">
          {mascotSrc ? (
            <div className="relative -mb-3 w-full max-w-[320px]">
              <div className="absolute inset-x-12 bottom-10 h-24 rounded-full bg-cyan-300/15 blur-3xl" />
              <Image
                src={mascotSrc}
                alt={`Pengu mascot for the ${title} coming soon page`}
                width={480}
                height={480}
                unoptimized
                priority
                className="relative h-auto w-full drop-shadow-[0_28px_50px_rgba(0,0,0,0.32)]"
              />
            </div>
          ) : (
            <div className="relative grid h-24 w-24 place-items-center rounded-[28px] border border-[color:var(--border-lime)] bg-[rgba(217,255,87,0.08)] shadow-[0_0_55px_rgba(50,245,154,0.16)]">
              <Clock3
                className="h-11 w-11 text-[color:var(--brand-lime)]"
                aria-hidden="true"
              />
              <Sparkles
                className="absolute -right-3 -top-3 h-7 w-7 text-cyan-300"
                aria-hidden="true"
              />
            </div>
          )}

          <Badge tone={tone} className="mt-7">
            {section} · Coming Soon
          </Badge>
          <h1 className="command-text-gradient mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {title} is coming soon
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 light:text-slate-600 sm:text-base">
            This page is still in development. We will add it once the core
            workflow is ready to use.
          </p>

          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300 light:border-slate-200 light:bg-white/70 light:text-slate-700">
            <Layers3 className="h-4 w-4 text-cyan-300" aria-hidden="true" />
            Planned for a future release
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
