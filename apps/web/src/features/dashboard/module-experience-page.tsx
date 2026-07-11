"use client";

import {
  ArchiveRestore,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Database,
  FileText,
  FolderKanban,
  LockKeyhole,
  MessageSquareText,
  Palette,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import {
  AIButton,
  BentoCard,
  CommandLinkRow,
  DashboardCard,
  DataTable,
  MetricRail,
  PageHeader,
  ScoreRing,
  SkillScoreCard,
} from "@/components/ui/command-primitives";
import { Badge } from "@/components/ui/badge";
import type { AppRole, Tone } from "@/lib/mock-data";
import { roleDashboards } from "@/lib/mock-data";
import { titleFromSlug } from "@/lib/utils";

const moduleCopy: Record<
  string,
  { eyebrow: string; subtitle: string; tone: Tone }
> = {
  "academic-shield": {
    eyebrow: "AcademicShield",
    subtitle:
      "Review originality, AI writing risk, matched sources, highlighted paragraphs, rewrite guidance and citations.",
    tone: "rose",
  },
  "ml-studio": {
    eyebrow: "ML Experiment Studio",
    subtitle:
      "Dataset upload, data preview, model selection, training progress and metric reporting for university ML labs.",
    tone: "emerald",
  },
  portfolio: {
    eyebrow: "Portfolio Builder",
    subtitle:
      "Preview your portfolio with project cards, skills, links and AI-assisted descriptions.",
    tone: "cyan",
  },
  "skill-dna": {
    eyebrow: "Skill DNA",
    subtitle:
      "See skill scores, recommended next steps and how recent work affects your progress.",
    tone: "violet",
  },
  feedback: {
    eyebrow: "Feedback Center",
    subtitle:
      "Review teacher feedback, fix drafts, resubmission history and student replies.",
    tone: "amber",
  },
};

export function ModuleExperiencePage({
  role,
  slug,
}: {
  role: AppRole;
  slug: string[];
}) {
  const key = slug[0] ?? "overview";
  const data = roleDashboards[role];
  const title = titleFromSlug(slug);
  const copy = moduleCopy[key] ?? {
    eyebrow: title,
    subtitle:
      "This page is ready for the next set of module-specific actions and data.",
    tone: role === "admin" ? "violet" : role === "teacher" ? "amber" : "cyan",
  };

  return (
    <AppShell
      role={role}
      title={title}
      subtitle={copy.subtitle}
      nav={data.nav}
      navGroups={data.navGroups}
      accountEmail={data.accountEmail}
    >
      <div className="grid gap-5">
        <PageHeader
          eyebrow={copy.eyebrow}
          title={title}
          subtitle={copy.subtitle}
          tone={copy.tone}
          action={<AIButton>Generate insight</AIButton>}
        />
        {renderModuleBody(key, role)}
      </div>
    </AppShell>
  );
}

function renderModuleBody(key: string, role: AppRole) {
  if (key === "academic-shield") {
    return <AcademicShieldSurface />;
  }

  if (key === "ml-studio") {
    return <MLStudioSurface />;
  }

  if (key === "portfolio") {
    return <PortfolioSurface />;
  }

  if (key === "skill-dna") {
    return <SkillDnaSurface />;
  }

  if (key === "feedback") {
    return <FeedbackSurface />;
  }

  return <GenericCommandSurface role={role} />;
}

function AcademicShieldSurface() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
      <div className="grid gap-5">
        <MetricRail
          items={[
            {
              label: "Originality",
              value: "82%",
              tone: "emerald",
              icon: ShieldCheck,
            },
            {
              label: "AI advisory",
              value: "61%",
              tone: "amber",
              icon: ShieldAlert,
            },
            {
              label: "Matched sources",
              value: "3",
              tone: "rose",
              icon: FileText,
            },
            {
              label: "Citation gaps",
              value: "5",
              tone: "violet",
              icon: BookOpen,
            },
          ]}
        />
        <BentoCard
          title="Highlighted Source Matches"
          detail="Matched paragraphs are shown with source evidence and review notes."
          icon={ShieldAlert}
          tone="rose"
        >
          <div className="grid gap-3">
            {[
              "Paragraph 3 overlaps with internal-demo://othm-task-1",
              "Testing section needs citation for performance criteria",
              "Definitions section shows high phrase similarity",
            ].map((item) => (
              <CommandLinkRow
                key={item}
                title={item}
                detail="Check the evidence and citations"
                tone="rose"
              />
            ))}
          </div>
        </BentoCard>
      </div>
      <DashboardCard
        title="Integrity Report"
        detail="Use this as guidance alongside teacher review."
        icon={ShieldCheck}
        tone="amber"
      >
        <div className="grid place-items-center py-4">
          <ScoreRing value={61} tone="amber" />
        </div>
        <p className="mt-4 rounded-xl border border-amber-200/20 bg-amber-300/8 p-4 text-sm leading-6 text-slate-300">
          This AI writing risk score is advisory and should not be used as final
          proof of academic misconduct.
        </p>
      </DashboardCard>
    </div>
  );
}

function MLStudioSurface() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
      <DashboardCard
        title="Dataset Upload"
        detail="Upload a CSV, preview rows, find missing values and choose the target column."
        icon={Upload}
        tone="emerald"
      >
        <div className="rounded-2xl border border-dashed border-emerald-200/25 bg-emerald-300/8 p-8 text-center">
          <Upload className="mx-auto h-8 w-8 text-emerald-200" />
          <p className="mt-4 text-sm text-slate-300">Drop CSV dataset here</p>
        </div>
      </DashboardCard>
      <div className="grid gap-5">
        <MetricRail
          items={[
            { label: "Rows", value: "1.2k", tone: "cyan", icon: Database },
            {
              label: "Missing",
              value: "3.4%",
              tone: "amber",
              icon: ShieldAlert,
            },
            {
              label: "Accuracy",
              value: "87%",
              tone: "emerald",
              icon: ChartNoAxesCombined,
            },
            {
              label: "F1 Score",
              value: "0.83",
              tone: "violet",
              icon: BrainCircuit,
            },
          ]}
        />
        <DataTable
          columns={["Column", "Type", "Signal"]}
          rows={[
            { Column: "age", Type: "number", Signal: "clean" },
            { Column: "attendance", Type: "number", Signal: "missing 2%" },
            { Column: "result", Type: "category", Signal: "target" },
          ]}
        />
      </div>
    </div>
  );
}

function PortfolioSurface() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
      <DashboardCard
        title="Public Portfolio Preview"
        detail="A portfolio preview with project outcomes, skills and live links."
        icon={BriefcaseBusiness}
        tone="cyan"
      >
        <div className="rounded-2xl border border-[color:var(--border-lime)] bg-[rgba(217,255,87,0.08)] p-5">
          <p className="text-2xl font-semibold text-white">Nadia Rahman</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            CSE student building academic web, AI and database projects.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Frontend", "Validation", "Documentation", "Database"].map(
              (item) => (
                <Badge key={item} tone="cyan">
                  {item}
                </Badge>
              ),
            )}
          </div>
        </div>
      </DashboardCard>
      <div className="grid gap-5">
        {[
          "Task 2 Website/Mobile App",
          "Form Validation Lab",
          "Database ERD Project",
        ].map((project) => (
          <BentoCard
            key={project}
            title={project}
            detail="Description drafted from your Nexora activity."
            icon={Sparkles}
            tone="violet"
          />
        ))}
      </div>
    </div>
  );
}

function SkillDnaSurface() {
  return (
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
      {[
        ["Frontend", 82],
        ["Backend", 68],
        ["Database", 74],
        ["Documentation", 88],
      ].map(([label, score]) => (
        <SkillScoreCard
          key={label}
          label={String(label)}
          score={Number(score)}
          tone="violet"
        />
      ))}
      <BentoCard
        title="Learning Path"
        detail="Recommended next steps based on your labs and assignments."
        icon={BrainCircuit}
        tone="emerald"
        className="xl:col-span-4"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <CommandLinkRow
            title="Improve backend APIs"
            detail="Build routes protected by auth"
            tone="emerald"
          />
          <CommandLinkRow
            title="Strengthen testing"
            detail="Add evidence for hidden cases"
            tone="amber"
          />
          <CommandLinkRow
            title="Polish documentation"
            detail="Export the README and user guide"
            tone="cyan"
          />
        </div>
      </BentoCard>
    </div>
  );
}

function FeedbackSurface() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
      <DashboardCard
        title="Feedback Timeline"
        detail="Teacher feedback, fix drafts and resubmission status in one place."
        icon={MessageSquareText}
        tone="amber"
      >
        <div className="grid gap-3">
          <CommandLinkRow
            title="AC 4.3 test evidence missing"
            detail="Open fix request"
            tone="amber"
          />
          <CommandLinkRow
            title="Code validation feedback"
            detail="Hidden tests require guard clauses"
            tone="rose"
          />
          <CommandLinkRow
            title="Portfolio description approved"
            detail="Ready for public page"
            tone="emerald"
          />
        </div>
      </DashboardCard>
      <DashboardCard
        title="Response Composer"
        detail="Write a response before you resubmit."
        icon={Sparkles}
        tone="cyan"
      >
        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-400">
          I have added the missing test evidence and attached screenshots for
          navigation, validation and responsive checks.
        </div>
      </DashboardCard>
    </div>
  );
}

function GenericCommandSurface({ role }: { role: AppRole }) {
  const roleIcon =
    role === "admin"
      ? LockKeyhole
      : role === "teacher"
        ? FolderKanban
        : Palette;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
      <BentoCard
        title="Module page ready"
        detail="This page has the shared Nexora layout and is ready for live module data."
        icon={roleIcon}
        tone={
          role === "admin" ? "violet" : role === "teacher" ? "amber" : "cyan"
        }
      >
        <div className="grid min-h-64 place-items-center rounded-2xl border border-white/10 bg-black/15 p-6 text-center">
          <div className="max-w-md">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[color:var(--border-lime)] bg-[rgba(217,255,87,0.1)]">
              <Sparkles
                className="h-6 w-6 text-[var(--brand-lime)]"
                aria-hidden="true"
              />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-white">
              Ready to connect module logic
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Connect the data, forms and actions when this module is ready for
              deeper workflow logic.
            </p>
          </div>
        </div>
      </BentoCard>
      <div className="grid gap-5">
        <BentoCard
          title="Module Status"
          detail="Basic status for this role and page."
          icon={ArchiveRestore}
          tone="emerald"
        >
          <DataTable
            columns={["Signal", "State"]}
            rows={[
              { Signal: "Route", State: "active" },
              { Signal: "Layout", State: "applied" },
              { Signal: "API connection", State: "ready" },
            ]}
          />
        </BentoCard>
        <BentoCard
          title="Next Action"
          detail="Generate the next workflow steps for this module."
          icon={Sparkles}
          tone="cyan"
        />
      </div>
    </div>
  );
}
