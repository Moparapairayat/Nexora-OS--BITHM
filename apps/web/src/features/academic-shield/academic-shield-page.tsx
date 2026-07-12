"use client";

import {
  academicShieldDisclaimer,
  phase4AcademicShieldReport,
} from "@nexora/config";
import type {
  AcademicRewriteSuggestion,
  AcademicShieldExportResult,
  AcademicShieldReport,
  AcademicShieldSourceMatch,
  AcademicShieldWebScan,
  AcademicShieldWritingRisk,
  CitationRecord,
  CitationStatus,
  RiskLevel,
} from "@nexora/types";
import {
  AlertTriangle,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCheck2,
  FileSearch,
  FileStack,
  Globe2,
  ListChecks,
  Radar,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Wand2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import {
  DataTable,
  MetricRail,
  PageHeader,
  ScoreRing,
} from "@/components/ui/command-primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabel, inputClass } from "@/components/ui/form-field";
import type { AppRole, Tone } from "@/lib/mock-data";
import { roleDashboards } from "@/lib/mock-data";
import { apiGet, apiPost } from "@/lib/workflow-api";
import { cn } from "@/lib/utils";

type AcademicShieldMode = "student" | "teacher" | "admin";

const sampleText = `This report evaluates the requirements, design, testing evidence and implementation decisions for a web and mobile application project.

The application requirements and constraints are analyzed for web/mobile usage and responsive behavior. Testing should include navigation, form validation, responsive design and performance checks.

Visible tests passed while hidden tests failed for empty input and negative age values. The final report explains the correction plan and evidence coverage for the OTHM assessment criteria.`;

const modeCopy: Record<
  AcademicShieldMode,
  { eyebrow: string; title: string; subtitle: string }
> = {
  student: {
    eyebrow: "AcademicShield",
    title: "Check originality before you submit",
    subtitle:
      "Review matched sources, citation gaps, and writing-risk indicators in your assignment.",
  },
  teacher: {
    eyebrow: "Academic Integrity Review",
    title: "Review originality reports and evidence",
    subtitle:
      "Inspect matched sources, highlighted passages, and citation gaps before making a decision.",
  },
  admin: {
    eyebrow: "AcademicShield Administration",
    title: "Manage originality checks and policies",
    subtitle:
      "Review check results, adjust thresholds, manage citation policy, and export reports.",
  },
};

export function AcademicShieldPage({
  role,
  mode,
}: {
  role: AppRole;
  mode: AcademicShieldMode;
}) {
  const roleData = roleDashboards[role];
  const copy = modeCopy[mode];
  const [text, setText] = useState(sampleText);
  const [citationStyle, setCitationStyle] = useState("Harvard");
  const [sourceTitle, setSourceTitle] = useState("Responsive Testing Guidance");
  const [sourceUrl, setSourceUrl] = useState(
    "https://example.edu/testing-guidance",
  );
  const [webScanUrl, setWebScanUrl] = useState(
    "https://example.edu/testing-guidance",
  );
  const [exportFormat, setExportFormat] =
    useState<AcademicShieldExportResult["format"]>("markdown");
  const [report, setReport] = useState<AcademicShieldReport>(
    phase4AcademicShieldReport,
  );
  const [citation, setCitation] = useState(
    "Author, A. (2026) Title of source. Publisher. Available at: https://example.com",
  );
  const [citations, setCitations] = useState<CitationRecord[]>([]);
  const [webScan, setWebScan] = useState<AcademicShieldWebScan | null>(null);
  const [webScanHistory, setWebScanHistory] = useState<AcademicShieldWebScan[]>(
    [],
  );
  const [rewrite, setRewrite] = useState<AcademicRewriteSuggestion | null>(
    null,
  );
  const [rewriteHistory, setRewriteHistory] = useState<
    AcademicRewriteSuggestion[]
  >([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isRiskChecking, setIsRiskChecking] = useState(false);
  const [isWebScanning, setIsWebScanning] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let active = true;

    void apiGet<{
      citations: CitationRecord[];
      webScans: AcademicShieldWebScan[];
      rewrites: AcademicRewriteSuggestion[];
    }>("/citations/library").then((response) => {
      if (!active || !response) {
        return;
      }

      setCitations(response.citations ?? []);
      setWebScanHistory(response.webScans ?? []);
      setRewriteHistory(response.rewrites ?? []);
    });

    return () => {
      active = false;
    };
  }, []);

  async function runIntegrityScan() {
    setIsChecking(true);
    const response = await apiPost<{ report: AcademicShieldReport }>(
      "/plagiarism/check",
      { text },
    );

    setReport(response?.report ?? phase4AcademicShieldReport);
    setIsChecking(false);
  }

  async function runWritingRisk() {
    setIsRiskChecking(true);
    const response = await apiPost<{ report: AcademicShieldWritingRisk }>(
      "/writing/ai-risk",
      { text },
    );

    setReport((current) => ({
      ...current,
      writingRisk: response?.report ?? current.writingRisk,
    }));
    setIsRiskChecking(false);
  }

  async function generateCitation() {
    const response = await apiPost<{
      citation: CitationRecord;
      citations: CitationRecord[];
    }>("/citations/generate", {
      style: citationStyle,
      text,
      sourceTitle,
      url: sourceUrl,
    });

    if (response?.citation) {
      setCitation(`${response.citation.reference} ${response.citation.inText}`);
      setCitations(response.citations ?? [response.citation, ...citations]);
    }
  }

  async function runWebSourceScan() {
    setIsWebScanning(true);
    const response = await apiPost<{
      scan: AcademicShieldWebScan;
      history: AcademicShieldWebScan[];
    }>("/plagiarism/web-scan", {
      url: webScanUrl,
      text,
    });

    if (response?.scan) {
      setWebScan(response.scan);
      setWebScanHistory(response.history ?? [response.scan, ...webScanHistory]);
    }

    setIsWebScanning(false);
  }

  async function runAcademicRewrite() {
    setIsRewriting(true);
    const response = await apiPost<{
      rewrite: AcademicRewriteSuggestion;
      history: AcademicRewriteSuggestion[];
    }>("/writing/rewrite", { text });

    if (response?.rewrite) {
      setRewrite(response.rewrite);
      setRewriteHistory(
        response.history ?? [response.rewrite, ...rewriteHistory],
      );
    }

    setIsRewriting(false);
  }

  async function exportReport() {
    setIsExporting(true);
    const response = await apiPost<{
      export: AcademicShieldExportResult;
    }>("/plagiarism/export", {
      report,
      format: exportFormat,
    });

    downloadTextFile(
      response?.export.fileName ?? "academic-shield-report.md",
      response?.export.content ?? academicShieldReportToMarkdown(report),
    );
    setIsExporting(false);
  }

  return (
    <AppShell
      role={role}
      title={copy.title}
      subtitle={copy.subtitle}
      nav={roleData.nav}
      navGroups={roleData.navGroups}
      accountEmail={roleData.accountEmail}
    >
      <div className="grid gap-5">
        <PageHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          subtitle={copy.subtitle}
          tone="rose"
          action={
            <div className="flex flex-wrap gap-2">
              <select
                value={exportFormat}
                onChange={(event) =>
                  setExportFormat(
                    event.target.value as AcademicShieldExportResult["format"],
                  )
                }
                className={`${inputClass} h-11 w-32`}
              >
                <option value="markdown">Markdown</option>
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="json">JSON</option>
              </select>
              <Button
                type="button"
                onClick={exportReport}
                disabled={isExporting}
              >
                {isExporting ? "Exporting..." : "Export Report"}
                <Download className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          }
        />

        <MetricRail
          items={[
            {
              label: "Originality",
              value: `${report.originalityScore}%`,
              tone: "emerald",
              icon: ShieldCheck,
            },
            {
              label: "Similarity",
              value: `${report.overallSimilarity}%`,
              tone: riskTone(report.riskLevel),
              icon: Radar,
            },
            {
              label: "AI writing risk",
              value: `${report.writingRisk.score}%`,
              tone: riskTone(report.writingRisk.riskLevel),
              icon: BrainCircuit,
            },
            {
              label: "Citation gaps",
              value: String(report.citationGapCount),
              tone: report.citationGapCount > 0 ? "amber" : "emerald",
              icon: BookOpen,
            },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.18fr)]">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge tone="rose">Integrity input</Badge>
                <h2 className="mt-3 text-xl font-semibold text-white light:text-slate-950">
                  Submission text
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400 light:text-slate-600">
                  Run an institutional check before the final academic review.
                </p>
              </div>
              <ShieldAlert className="h-5 w-5 text-[var(--brand-lime)]" />
            </div>
            <FieldLabel label="Assignment or report content">
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                className={`${inputClass} min-h-[280px] resize-y leading-6`}
              />
            </FieldLabel>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                onClick={runIntegrityScan}
                disabled={isChecking}
              >
                {isChecking ? "Checking..." : "Run Full Scan"}
                <FileSearch className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={runWritingRisk}
                disabled={isRiskChecking}
              >
                {isRiskChecking ? "Analyzing..." : "AI Risk Only"}
                <BrainCircuit className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <div className="mt-4 grid gap-3 rounded-xl border border-amber-200/20 bg-amber-300/8 p-4">
              <p className="text-sm font-semibold text-amber-100 light:text-amber-800">
                Advisory policy
              </p>
              <p className="text-sm leading-6 text-slate-300 light:text-slate-700">
                {academicShieldDisclaimer}
              </p>
            </div>
          </Card>

          <div className="grid gap-5">
            <MethodScoreGrid report={report} />
            <WritingRiskPanel report={report} />
          </div>
        </div>

        <ProMaxWorkflowPanel
          webScanUrl={webScanUrl}
          setWebScanUrl={setWebScanUrl}
          runWebSourceScan={runWebSourceScan}
          isWebScanning={isWebScanning}
          webScan={webScan}
          webScanHistory={webScanHistory}
          runAcademicRewrite={runAcademicRewrite}
          isRewriting={isRewriting}
          rewrite={rewrite}
          rewriteHistory={rewriteHistory}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(300px,0.88fr)]">
          <SourceRankingPanel sources={report.sourceRanking} />
          <HighlightPanel report={report} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
          <CitationPanel
            citation={citation}
            citationStyle={citationStyle}
            setCitationStyle={setCitationStyle}
            sourceTitle={sourceTitle}
            setSourceTitle={setSourceTitle}
            sourceUrl={sourceUrl}
            setSourceUrl={setSourceUrl}
            citations={citations}
            generateCitation={generateCitation}
          />
          <RoleContextPanel mode={mode} report={report} />
        </div>
      </div>
    </AppShell>
  );
}

function ProMaxWorkflowPanel({
  webScanUrl,
  setWebScanUrl,
  runWebSourceScan,
  isWebScanning,
  webScan,
  webScanHistory,
  runAcademicRewrite,
  isRewriting,
  rewrite,
  rewriteHistory,
}: {
  webScanUrl: string;
  setWebScanUrl: (value: string) => void;
  runWebSourceScan: () => void;
  isWebScanning: boolean;
  webScan: AcademicShieldWebScan | null;
  webScanHistory: AcademicShieldWebScan[];
  runAcademicRewrite: () => void;
  isRewriting: boolean;
  rewrite: AcademicRewriteSuggestion | null;
  rewriteHistory: AcademicRewriteSuggestion[];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge tone="cyan">Web source scan</Badge>
            <h2 className="mt-3 text-xl font-semibold text-white light:text-slate-950">
              External source verification
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400 light:text-slate-600">
              Compare the current submission text against a target URL and
              decide whether citation repair is needed.
            </p>
          </div>
          <Globe2
            className="h-5 w-5 text-[var(--brand-lime)]"
            aria-hidden="true"
          />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <FieldLabel label="Source URL">
            <input
              value={webScanUrl}
              onChange={(event) => setWebScanUrl(event.target.value)}
              className={inputClass}
              placeholder="https://example.edu/source"
            />
          </FieldLabel>
          <Button
            type="button"
            className="self-end"
            onClick={runWebSourceScan}
            disabled={isWebScanning}
          >
            {isWebScanning ? "Scanning..." : "Scan URL"}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="mt-5 grid gap-3">
          {webScan ? (
            <WebScanCard scan={webScan} active />
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm text-slate-400 light:border-slate-200 light:bg-white/70 light:text-slate-600">
              Run a web source scan to see similarity, citation status and
              source repair guidance.
            </div>
          )}
          {webScanHistory.slice(0, 3).map((scan) => (
            <WebScanCard key={scan.id} scan={scan} />
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge tone="emerald">Academic rewrite</Badge>
            <h2 className="mt-3 text-xl font-semibold text-white light:text-slate-950">
              Source-safe rewrite assistant
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400 light:text-slate-600">
              Generate a rewrite draft that preserves assessment meaning,
              evidence links and citation responsibility.
            </p>
          </div>
          <Wand2
            className="h-5 w-5 text-[var(--brand-lime)]"
            aria-hidden="true"
          />
        </div>
        <Button
          type="button"
          className="mt-5"
          onClick={runAcademicRewrite}
          disabled={isRewriting}
        >
          {isRewriting ? "Rewriting..." : "Generate Academic Rewrite"}
          <FileCheck2 className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div className="mt-5 grid gap-4">
          {rewrite ? (
            <RewriteCard rewrite={rewrite} />
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm text-slate-400 light:border-slate-200 light:bg-white/70 light:text-slate-600">
              Rewrite output will appear here with citation-preservation notes
              and risk warnings.
            </div>
          )}
          {rewriteHistory.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-white/10 bg-white/[0.035] p-4 light:border-slate-200 light:bg-white/70"
            >
              <div className="flex items-center justify-between gap-3">
                <Badge tone="slate">Rewrite history</Badge>
                <span className="text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400 light:text-slate-600">
                {item.rewrittenText}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function WebScanCard({
  scan,
  active = false,
}: {
  scan: AcademicShieldWebScan;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 light:border-slate-200 light:bg-white/70",
        active
          ? "border-[color:var(--border-lime)] bg-[rgba(217,255,87,0.075)]"
          : "border-white/10 bg-white/[0.035]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="cyan">Web scan</Badge>
            <Badge tone={citationTone(scan.citationStatus)}>
              Citation {scan.citationStatus}
            </Badge>
          </div>
          <h3 className="mt-3 text-base font-semibold text-white light:text-slate-950">
            {scan.title}
          </h3>
          <p className="mt-1 font-mono text-xs text-slate-500">{scan.url}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-semibold text-[var(--brand-lime)]">
            {scan.similarity}%
          </p>
          <p className="text-xs text-slate-500">web overlap</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {scan.matchedPhrases.map((phrase) => (
          <span
            key={phrase}
            className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-300 light:border-slate-200 light:bg-slate-950/[0.04] light:text-slate-700"
          >
            {phrase}
          </span>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400 light:text-slate-600">
        {scan.recommendation}
      </p>
    </div>
  );
}

function RewriteCard({ rewrite }: { rewrite: AcademicRewriteSuggestion }) {
  return (
    <div className="rounded-xl border border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.045)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge tone="emerald">Rewrite draft</Badge>
        <span className="text-xs text-slate-500">
          {new Date(rewrite.createdAt).toLocaleString()}
        </span>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300 light:text-slate-700">
        {rewrite.rewrittenText}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <GuidanceList
          title="Citation preservation"
          items={rewrite.citationPreservationNotes}
          tone="cyan"
        />
        <GuidanceList
          title="Risk warnings"
          items={rewrite.riskWarnings}
          tone="amber"
        />
      </div>
    </div>
  );
}

function GuidanceList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: Tone;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/15 p-3 light:border-slate-200 light:bg-white/70">
      <Badge tone={tone}>{title}</Badge>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <ActionRow key={item} text={item} tone={tone} />
        ))}
      </div>
    </div>
  );
}

function MethodScoreGrid({ report }: { report: AcademicShieldReport }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MethodScoreCard
        label="Internal similarity"
        value={report.internalSimilarity}
        detail="Compares against previous submissions, lab reports and internal evidence archives."
        tone="rose"
      />
      <MethodScoreCard
        label="Fuzzy matching"
        value={report.fuzzySimilarity}
        detail="Catches close paraphrases, phrase overlap and near-duplicate wording."
        tone="amber"
      />
      <MethodScoreCard
        label="Semantic matching"
        value={report.semanticSimilarity}
        detail="Ranks concept-level overlap even when wording is changed."
        tone="violet"
      />
    </div>
  );
}

function MethodScoreCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  tone: Tone;
}) {
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between gap-4">
        <Badge tone={tone}>{label}</Badge>
        <span className="font-mono text-xl font-semibold text-[var(--brand-lime)]">
          {value}%
        </span>
      </div>
      <ProgressBar value={value} tone={tone} />
      <p className="mt-4 text-sm leading-6 text-slate-400 light:text-slate-600">
        {detail}
      </p>
    </Card>
  );
}

function WritingRiskPanel({ report }: { report: AcademicShieldReport }) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge tone={riskTone(report.writingRisk.riskLevel)}>
            AI writing advisory
          </Badge>
          <h2 className="mt-3 text-xl font-semibold text-white light:text-slate-950">
            Writing risk viewer
          </h2>
        </div>
        <ScoreRing
          value={report.writingRisk.score}
          tone={riskTone(report.writingRisk.riskLevel)}
        />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {report.writingRisk.features.map((feature) => (
          <div
            key={feature.label}
            className="rounded-xl border border-white/10 bg-white/[0.035] p-3 light:border-slate-200 light:bg-white/70"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white light:text-slate-950">
                {feature.label}
              </p>
              <Badge tone={riskTone(feature.impact)}>{feature.impact}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-400 light:text-slate-600">
              {feature.value}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-5 rounded-xl border border-amber-200/20 bg-amber-300/8 p-4 text-sm leading-6 text-slate-300 light:text-slate-700">
        {report.writingRisk.disclaimer}
      </p>
    </Card>
  );
}

function SourceRankingPanel({
  sources,
}: {
  sources: AcademicShieldSourceMatch[];
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge tone="rose">Source ranking</Badge>
          <h2 className="mt-3 text-xl font-semibold text-white light:text-slate-950">
            Matched source evidence
          </h2>
        </div>
        <Scale className="h-5 w-5 text-[var(--brand-lime)]" />
      </div>
      <div className="mt-5 grid gap-3">
        {sources.map((source) => (
          <SourceCard key={source.id} source={source} />
        ))}
      </div>
    </Card>
  );
}

function SourceCard({ source }: { source: AcademicShieldSourceMatch }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 light:border-slate-200 light:bg-white/70">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="slate">Rank {source.rank}</Badge>
            <Badge tone={citationTone(source.citationStatus)}>
              Citation {source.citationStatus}
            </Badge>
          </div>
          <h3 className="mt-3 text-base font-semibold text-white light:text-slate-950">
            {source.title}
          </h3>
          <p className="mt-1 font-mono text-xs text-slate-500">{source.url}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-semibold text-[var(--brand-lime)]">
            {(source.similarity * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-slate-500">similarity</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <MiniMetric
          label="Fuzzy"
          value={`${(source.fuzzyScore * 100).toFixed(0)}%`}
        />
        <MiniMetric
          label="Semantic"
          value={`${(source.semanticScore * 100).toFixed(0)}%`}
        />
        <MiniMetric
          label="Internal"
          value={`${(source.internalOverlap * 100).toFixed(0)}%`}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {source.matchedPhrases.map((phrase) => (
          <span
            key={phrase}
            className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-300 light:border-slate-200 light:bg-slate-950/[0.04] light:text-slate-700"
          >
            {phrase}
          </span>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400 light:text-slate-600">
        {source.recommendation}
      </p>
    </div>
  );
}

function HighlightPanel({ report }: { report: AcademicShieldReport }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge tone={riskTone(report.riskLevel)}>Highlighted matches</Badge>
          <h2 className="mt-3 text-xl font-semibold text-white light:text-slate-950">
            Paragraph evidence
          </h2>
        </div>
        <AlertTriangle className="h-5 w-5 text-[var(--brand-lime)]" />
      </div>
      <div className="mt-5 grid gap-3">
        {report.highlightedMatches.map((match) => {
          const source = report.sourceRanking.find(
            (item) => item.id === match.matchedSourceId,
          );

          return (
            <div
              key={match.id}
              className="rounded-xl border border-white/10 bg-white/[0.035] p-4 light:border-slate-200 light:bg-white/70"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge tone={riskTone(match.severity)}>
                  Paragraph {match.paragraph}
                </Badge>
                <span className="text-xs text-slate-500">
                  {source?.title ?? "Matched source"}
                </span>
              </div>
              <blockquote className="mt-3 border-l-2 border-[var(--brand-lime)] pl-3 text-sm leading-6 text-slate-300 light:text-slate-700">
                {match.excerpt}
              </blockquote>
              <p className="mt-3 text-sm leading-6 text-slate-400 light:text-slate-600">
                {match.reason}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function CitationPanel({
  citation,
  citationStyle,
  setCitationStyle,
  sourceTitle,
  setSourceTitle,
  sourceUrl,
  setSourceUrl,
  citations,
  generateCitation,
}: {
  citation: string;
  citationStyle: string;
  setCitationStyle: (value: string) => void;
  sourceTitle: string;
  setSourceTitle: (value: string) => void;
  sourceUrl: string;
  setSourceUrl: (value: string) => void;
  citations: CitationRecord[];
  generateCitation: () => void;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge tone="cyan">Citation assistant</Badge>
          <h2 className="mt-3 text-xl font-semibold text-white light:text-slate-950">
            Citation manager
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400 light:text-slate-600">
            Generate citation records for missing or partial sources and keep a
            small source library for report repair.
          </p>
        </div>
        <FileStack className="h-5 w-5 text-[var(--brand-lime)]" />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
        <FieldLabel label="Style">
          <select
            value={citationStyle}
            onChange={(event) => setCitationStyle(event.target.value)}
            className={inputClass}
          >
            <option value="Harvard">Harvard</option>
            <option value="APA">APA</option>
            <option value="IEEE">IEEE</option>
          </select>
        </FieldLabel>
        <FieldLabel label="Source title">
          <input
            value={sourceTitle}
            onChange={(event) => setSourceTitle(event.target.value)}
            className={inputClass}
          />
        </FieldLabel>
      </div>
      <FieldLabel label="Source URL">
        <input
          value={sourceUrl}
          onChange={(event) => setSourceUrl(event.target.value)}
          className={inputClass}
        />
      </FieldLabel>
      <div className="mt-4">
        <div>
          <p className="text-sm font-medium text-slate-200 light:text-slate-800">
            Generated reference
          </p>
          <p className="mt-2 rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 text-slate-300 light:border-slate-200 light:bg-white/70 light:text-slate-700">
            {citation}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={generateCitation}>
          Generate Citation
          <BookOpen className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Badge tone="slate">{citations.length} saved</Badge>
      </div>
      <div className="mt-5 grid gap-3">
        {citations.length > 0 ? (
          citations.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-white/10 bg-white/[0.035] p-3 light:border-slate-200 light:bg-white/70"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge tone="cyan">{item.style}</Badge>
                <span className="text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-white light:text-slate-950">
                {item.sourceTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400 light:text-slate-600">
                {item.reference} {item.inText}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm text-slate-400 light:border-slate-200 light:bg-white/70 light:text-slate-600">
            Generated citations will be stored here for the current review
            session.
          </div>
        )}
      </div>
    </Card>
  );
}

function RoleContextPanel({
  mode,
  report,
}: {
  mode: AcademicShieldMode;
  report: AcademicShieldReport;
}) {
  if (mode === "teacher") {
    return (
      <Card>
        <Badge tone="amber">Teacher queue</Badge>
        <h2 className="mt-3 text-xl font-semibold text-white light:text-slate-950">
          Academic decision support
        </h2>
        <div className="mt-5 grid gap-3">
          {[
            "Review highlighted matches before issuing a fix request.",
            "Check citation gaps separately from AI writing risk.",
            "Use the advisory score as evidence context, not a misconduct verdict.",
          ].map((item) => (
            <ActionRow key={item} text={item} tone="amber" />
          ))}
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="secondary">
            Request Fix
            <ListChecks className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button type="button">
            Mark Reviewed
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </Card>
    );
  }

  if (mode === "admin") {
    return (
      <Card>
        <Badge tone="violet">Policy settings</Badge>
        <h2 className="mt-3 text-xl font-semibold text-white light:text-slate-950">
          Threshold control
        </h2>
        <div className="mt-5">
          <DataTable
            columns={["Signal", "Threshold", "Model"]}
            rows={[
              {
                Signal: "Internal similarity",
                Threshold: "18%",
                Model: "internal index",
              },
              {
                Signal: "Fuzzy matching",
                Threshold: "24%",
                Model: "phrase matcher",
              },
              {
                Signal: "Semantic ranking",
                Threshold: "32%",
                Model: "qwen3 reranker",
              },
              {
                Signal: "AI writing risk",
                Threshold: "65%",
                Model: "advisory classifier",
              },
            ]}
          />
        </div>
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-slate-400 light:border-slate-200 light:bg-white/70 light:text-slate-600">
          Reports can be exported as {report.exportFormats.join(", ")} for
          institutional review.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Badge tone="emerald">Student guidance</Badge>
      <h2 className="mt-3 text-xl font-semibold text-white light:text-slate-950">
        Before submission
      </h2>
      <div className="mt-5 grid gap-3">
        {[
          "Rewrite highlighted paragraphs using your own analysis and evidence.",
          "Add citations where source status is missing or partial.",
          "Keep lab evidence, but explain what changed in your final report.",
        ].map((item) => (
          <ActionRow key={item} text={item} tone="emerald" />
        ))}
      </div>
    </Card>
  );
}

function ActionRow({ text, tone }: { text: string; tone: Tone }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 light:border-slate-200 light:bg-white/70">
      <CheckCircle2
        className={cn("mt-0.5 h-4 w-4 shrink-0", toneTextClass(tone))}
        aria-hidden="true"
      />
      <p className="text-sm leading-6 text-slate-300 light:text-slate-700">
        {text}
      </p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3 light:border-slate-200 light:bg-white/60">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-[var(--brand-lime)]">
        {value}
      </p>
    </div>
  );
}

function ProgressBar({ value, tone }: { value: number; tone: Tone }) {
  return (
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10 light:bg-slate-950/10">
      <div
        className={cn(
          "h-full rounded-full",
          tone === "emerald" && "bg-[var(--brand-emerald)]",
          tone === "amber" && "bg-[var(--brand-amber)]",
          tone === "rose" && "bg-[var(--brand-rose)]",
          tone === "violet" && "bg-[var(--accent-bronze)]",
          tone === "cyan" && "bg-[var(--brand-lime)]",
          tone === "slate" && "bg-slate-400",
        )}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function riskTone(level: RiskLevel): Tone {
  if (level === "HIGH") {
    return "rose";
  }

  if (level === "MEDIUM") {
    return "amber";
  }

  return "emerald";
}

function citationTone(status: CitationStatus): Tone {
  if (status === "missing") {
    return "rose";
  }

  if (status === "partial") {
    return "amber";
  }

  return "emerald";
}

function toneTextClass(tone: Tone) {
  const classes: Record<Tone, string> = {
    cyan: "text-[var(--brand-lime)]",
    emerald: "text-[var(--brand-emerald)]",
    amber: "text-[var(--brand-amber)]",
    rose: "text-[var(--brand-rose)]",
    violet: "text-[#f0c98d]",
    slate: "text-slate-300",
  };

  return classes[tone];
}

function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function academicShieldReportToMarkdown(report: AcademicShieldReport) {
  return [
    `# ${report.title}`,
    "",
    `Checked at: ${report.checkedAt}`,
    `Originality: ${report.originalityScore}%`,
    `Overall similarity: ${report.overallSimilarity}%`,
    `Internal similarity: ${report.internalSimilarity}%`,
    `Fuzzy similarity: ${report.fuzzySimilarity}%`,
    `Semantic similarity: ${report.semanticSimilarity}%`,
    `AI writing risk: ${report.writingRisk.score}% (${report.writingRisk.riskLevel})`,
    "",
    "## Source Ranking",
    ...report.sourceRanking.map(
      (source) =>
        `- #${source.rank} ${source.title}: ${(source.similarity * 100).toFixed(0)}% similarity, citation ${source.citationStatus}`,
    ),
    "",
    "## Highlighted Matches",
    ...report.highlightedMatches.map(
      (match) => `- Paragraph ${match.paragraph}: ${match.reason}`,
    ),
    "",
    `> ${report.writingRisk.disclaimer}`,
  ].join("\n");
}
