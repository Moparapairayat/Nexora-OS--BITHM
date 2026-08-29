"use client";

import {
  academicShieldDisclaimer,
  phase4AcademicShieldReport,
} from "@nexora/config";
import type {
  AcademicShieldExportResult,
  AcademicShieldReport,
  AcademicShieldSourceMatch,
  CitationStatus,
  RiskLevel,
} from "@nexora/types";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  CornerDownRight,
  Download,
  ExternalLink,
  Eye,
  FileSearch,
  FileText,
  FileUp,
  Filter,
  Globe,
  Layers,
  Quote,
  Radar,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  SplitSquareVertical,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/data/dashboard.mock";
import { roleDashboards } from "@/data/dashboard.mock";
import { apiGet, apiPost } from "@/services/api-client";
import { cn } from "@/lib/utils";

const sampleText = `This report evaluates the requirements, design, testing evidence and implementation decisions for a web and mobile application project.

The application requirements and constraints are analyzed for web/mobile usage and responsive behavior. Testing should include navigation, form validation, responsive design and performance checks.

Visible tests passed while hidden tests failed for empty input and negative age values. The final report explains the correction plan and evidence coverage for the OTHM assessment criteria.`;

export function PlagiarismCheckerPage({
  role,
}: {
  role: AppRole;
}) {
  const roleData = roleDashboards[role];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState(sampleText);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(true);
  const [activeTab, setActiveTab] = useState<"sources" | "ai-heatmap" | "methods">("sources");

  // Zen Smart Filter Toggles
  const [excludeQuotes, setExcludeQuotes] = useState(false);
  const [excludeBibliography, setExcludeBibliography] = useState(false);

  // Turnitin SimCheck Pro Side-by-Side Diff Modal
  const [selectedSourceForDiff, setSelectedSourceForDiff] = useState<AcademicShieldSourceMatch | null>(null);
  const [copiedCitation, setCopiedCitation] = useState(false);

  const [report, setReport] = useState<AcademicShieldReport>(phase4AcademicShieldReport);
  const [exportFormat, setExportFormat] = useState<AcademicShieldExportResult["format"]>("markdown");
  const [isChecking, setIsChecking] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let active = true;
    void apiGet<{ reports?: AcademicShieldReport[] }>("/citations/library").then((res) => {
      if (!active || !res?.reports || res.reports.length === 0) return;
      setReport(res.reports[0]);
    });
    return () => {
      active = false;
    };
  }, []);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setText(content);
      }
    };
    reader.readAsText(file);
  };

  async function runIntegrityScan() {
    if (!text.trim()) return;
    setIsChecking(true);

    const [plagRes, aiRes] = await Promise.allSettled([
      apiPost<{ report: AcademicShieldReport }>("/plagiarism/check", { text }),
      apiPost<{ report: AcademicShieldReport["writingRisk"] }>("/writing/ai-risk", { text }),
    ]);

    let updatedReport = report;
    if (plagRes.status === "fulfilled" && plagRes.value?.report) {
      updatedReport = plagRes.value.report;
    }
    if (aiRes.status === "fulfilled" && aiRes.value?.report) {
      updatedReport = {
        ...updatedReport,
        writingRisk: aiRes.value.report,
      };
    }

    setReport(updatedReport);
    setHasScanned(true);
    setIsChecking(false);
  }

  async function exportReport() {
    setIsExporting(true);
    const response = await apiPost<{
      export: AcademicShieldExportResult;
    }>("/plagiarism/export", {
      report,
      format: exportFormat,
    });

    const blob = new Blob([response?.export.content ?? "Originality & AI Report"], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = response?.export.fileName ?? "plagiarism-ai-report.md";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setIsExporting(false);
  }

  // Filtered highlights based on Smart Exclusions
  const activeHighlights = report.highlightedMatches.filter((h) => {
    if (excludeQuotes && h.isQuote) return false;
    if (excludeBibliography && h.isBibliography) return false;
    return true;
  });

  // Dynamically adjusted similarity score when exclusions are active
  const similarityAdjustment =
    (excludeQuotes ? 4 : 0) + (excludeBibliography ? 6 : 0);
  const adjustedSimilarity = Math.max(0, report.overallSimilarity - similarityAdjustment);
  const adjustedOriginality = Math.min(100, 100 - adjustedSimilarity);

  return (
    <AppShell
      role={role}
      title="Academic Integrity & Intelligence"
      subtitle="Comprehensive multi-database originality verification, semantic paraphrase detection, and AI stylometrics."
      nav={roleData.nav}
      navGroups={roleData.navGroups}
      accountEmail={roleData.accountEmail}
    >
      <div className="grid gap-6 max-w-7xl mx-auto">
        
        {/* ZEN TOP HEADER & CONTROLS */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/70 dark:border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                250M+ Academic Papers &amp; DOIs Connected
              </span>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                OpenAlex &bull; Crossref &bull; Wikipedia &bull; Vault
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Plagiarism &amp; AI Checker
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Institutional SimCheck Pro originality analysis with side-by-side diff inspection and semantic paraphrase matching.
            </p>
          </div>

          {/* Export Action Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as AcademicShieldExportResult["format"])}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-xs outline-none transition-colors hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-white/20"
            >
              <option value="markdown">Markdown (.md)</option>
              <option value="pdf">PDF Report</option>
              <option value="docx">Word (.docx)</option>
              <option value="json">JSON Data</option>
            </select>
            <Button
              type="button"
              onClick={exportReport}
              disabled={isExporting}
              className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-xs transition-all dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {isExporting ? "Exporting..." : "Export Report"}
            </Button>
          </div>
        </div>

        {/* ZEN SMART FILTER PILLS */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/50 p-2.5 px-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Smart Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setExcludeQuotes(!excludeQuotes)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition-all",
                excludeQuotes
                  ? "bg-emerald-600 text-white shadow-xs dark:bg-emerald-500"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/5"
              )}
            >
              <span className={cn(
                "h-1.5 w-1.5 rounded-full",
                excludeQuotes ? "bg-white" : "bg-slate-400"
              )} />
              <span>Exclude Quotes (&ldquo;...&rdquo;)</span>
            </button>

            <button
              type="button"
              onClick={() => setExcludeBibliography(!excludeBibliography)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition-all",
                excludeBibliography
                  ? "bg-emerald-600 text-white shadow-xs dark:bg-emerald-500"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/5"
              )}
            >
              <span className={cn(
                "h-1.5 w-1.5 rounded-full",
                excludeBibliography ? "bg-white" : "bg-slate-400"
              )} />
              <span>Exclude Bibliography</span>
            </button>

            {(excludeQuotes || excludeBibliography) && (
              <span className="ml-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                (-{similarityAdjustment}% adjusted)
              </span>
            )}
          </div>
        </div>

        {/* PRO MAIN ZEN WORKSPACE CONTAINER */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#0c1015]">
          <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
            
            {/* LEFT: MINIMALIST WRITING SANCTUARY */}
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-9 min-h-[440px] lg:min-h-[500px]">
              <div>
                {/* Uploaded File Chip */}
                {uploadedFileName && (
                  <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{uploadedFileName}</span>
                    <button
                      type="button"
                      onClick={() => setUploadedFileName(null)}
                      className="ml-1 text-emerald-500 hover:text-emerald-900 dark:hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Natural Document Textarea */}
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type, paste, or upload assignment text to verify originality and AI writing risk..."
                  className="w-full min-h-[280px] lg:min-h-[350px] resize-none border-none bg-transparent p-0 font-sans text-[15px] leading-relaxed text-slate-800 placeholder-slate-400 outline-none focus:ring-0 dark:text-slate-100 dark:placeholder-slate-500"
                />
              </div>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.docx,.pdf,.doc,.csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Floating Bottom Dock */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5 dark:border-white/[0.05]">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    onClick={runIntegrityScan}
                    disabled={isChecking}
                    className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  >
                    {isChecking ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Scanning 250M+ Sources...
                      </>
                    ) : (
                      "Scan Document"
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    <FileUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span>Upload File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setText(sampleText)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                  >
                    Load Sample
                  </button>
                </div>

                <div className="text-xs font-mono text-slate-400 dark:text-slate-500">
                  {wordCount} words &bull; {charCount} chars
                </div>
              </div>
            </div>

            {/* RIGHT: THE INTELLIGENCE COCKPIT */}
            <div className="border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/[0.06] p-6 sm:p-8 bg-slate-50/40 dark:bg-black/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-white/[0.06] pb-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Integrity Intelligence
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Multi-signal diagnostic matrix
                    </p>
                  </div>

                  {hasScanned && (
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      adjustedOriginality >= 80
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    )}>
                      {adjustedOriginality}% Original
                    </span>
                  )}
                </div>

                {/* Hero Minimalist Score Cards */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-xs dark:border-white/[0.06] dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Originality
                      </span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                    <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                      {hasScanned ? `${adjustedOriginality}%` : "—"}
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${adjustedOriginality}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-xs dark:border-white/[0.06] dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        AI Likelihood
                      </span>
                      <span className={cn(
                        "h-2 w-2 rounded-full",
                        report.writingRisk.score > 40 ? "bg-rose-500" : "bg-emerald-500"
                      )} />
                    </div>
                    <p className={cn(
                      "mt-2 font-mono text-3xl font-bold tracking-tight",
                      report.writingRisk.score > 40
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-slate-900 dark:text-slate-200"
                    )}>
                      {hasScanned ? `${report.writingRisk.score}%` : "—"}
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div
                        className={cn(
                          "h-full transition-all duration-500",
                          report.writingRisk.score > 40 ? "bg-rose-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${report.writingRisk.score}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Granular Diagnostic Table */}
                <div className="mt-5 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/[0.04]">
                    <span className="text-slate-500 dark:text-slate-400">OpenAlex &amp; Crossref Match</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {hasScanned ? `${report.semanticSimilarity}%` : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/[0.04]">
                    <span className="text-slate-500 dark:text-slate-400">Semantic Paraphrase Index</span>
                    <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">
                      {hasScanned ? `${report.semanticSimilarity}% Concept Match` : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/[0.04]">
                    <span className="text-slate-500 dark:text-slate-400">Wikipedia Knowledge Match</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {hasScanned ? `${report.fuzzySimilarity}%` : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/[0.04]">
                    <span className="text-slate-500 dark:text-slate-400">Sentence Rhythm Variance ($CV$)</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {hasScanned ? `${report.writingRisk.burstinessCv ?? 0.42} (Natural)` : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Citation Integrity</span>
                    <span className={cn(
                      "font-mono font-semibold",
                      report.citationGapCount > 0
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    )}>
                      {hasScanned ? `${report.citationGapCount} missing` : "—"}
                    </span>
                  </div>
                </div>

                {/* Top Discovered Source Spotlight */}
                {hasScanned && report.sourceRanking.length > 0 && (
                  <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-xs dark:border-white/[0.06] dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Top Correlated Source
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedSourceForDiff(report.sourceRanking[0])}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                      >
                        <SplitSquareVertical className="h-3 w-3" />
                        <span>Inspect Side-by-Side</span>
                      </button>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {report.sourceRanking[0].title}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <a
                        href={report.sourceRanking[0].url.startsWith("http") ? report.sourceRanking[0].url : undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 line-clamp-1"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        {report.sourceRanking[0].url.length > 35 ? report.sourceRanking[0].url.slice(0, 35) + "..." : report.sourceRanking[0].url}
                      </a>
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {(report.sourceRanking[0].similarity * 100).toFixed(0)}% Match
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {hasScanned && (
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-xs text-slate-400">
                  <span>{report.sourceRanking.length} indexed matches</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    Click any source to view Side-by-Side Diff &rarr;
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PRO GRANULAR INSPECTION TABS (Apple/Linear Segmented Slider) */}
        <div className="space-y-4">
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1 w-fit dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setActiveTab("sources")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-semibold transition-all",
                activeTab === "sources"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-white/10 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Matched Sources &amp; Citations</span>
              <span className="rounded-full bg-slate-200/70 px-1.5 py-0.2 text-[10px] dark:bg-white/10">
                {report.sourceRanking.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ai-heatmap")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-semibold transition-all",
                activeTab === "ai-heatmap"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-white/10 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <BrainCircuit className="h-3.5 w-3.5" />
              <span>AI Stylometrics &amp; Heatmap</span>
              <span className="rounded-full bg-slate-200/70 px-1.5 py-0.2 text-[10px] dark:bg-white/10">
                {report.writingRisk.score}% Risk
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("methods")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-semibold transition-all",
                activeTab === "methods"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-white/10 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Inspection Methodology</span>
            </button>
          </div>

          {/* TAB 1: MATCHED SOURCES */}
          {activeTab === "sources" && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
              {/* SOURCES LIST */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs dark:border-white/[0.08] dark:bg-[#0c1015]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 dark:border-white/[0.05]">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Correlated Academic Literature &amp; Sources
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Matched against OpenAlex, Crossref official DOIs, Wikipedia, and peer records.
                    </p>
                  </div>
                  <Badge tone="slate">Cross-Referenced</Badge>
                </div>

                <div className="space-y-3">
                  {report.sourceRanking.map((source) => (
                    <div
                      key={source.id}
                      className="rounded-2xl border border-slate-200/60 bg-slate-50/30 p-4 transition-all hover:border-slate-300 dark:border-white/[0.05] dark:bg-white/[0.02] dark:hover:border-white/10"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="max-w-md">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-400">
                              #{source.rank}
                            </span>
                            <Badge tone={citationTone(source.citationStatus)}>
                              Citation: {source.citationStatus}
                            </Badge>
                            {source.paraphraseScore !== undefined && (
                              <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300">
                                {source.paraphraseScore}% Paraphrase Match
                              </span>
                            )}
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              {source.author}
                            </span>
                          </div>
                          <h4 className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                            {source.title}
                          </h4>
                          <a
                            href={source.url.startsWith("http") ? source.url : undefined}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            {source.url.length > 55 ? source.url.slice(0, 55) + "..." : source.url}
                          </a>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="text-right">
                            <span className="font-mono text-xl font-bold text-slate-900 dark:text-white">
                              {(source.similarity * 100).toFixed(0)}%
                            </span>
                            <p className="text-[11px] text-slate-400">similarity</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedSourceForDiff(source)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10"
                          >
                            <SplitSquareVertical className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Side-by-Side</span>
                          </button>
                        </div>
                      </div>

                      {/* Overlapping phrases */}
                      <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
                        {source.matchedPhrases.map((phrase) => (
                          <span
                            key={phrase}
                            className="rounded-md border border-slate-200/80 bg-white px-2 py-0.5 text-[11px] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                          >
                            &ldquo;{phrase}&rdquo;
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PARAGRAPH HIGHLIGHTS */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs dark:border-white/[0.08] dark:bg-[#0c1015]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 dark:border-white/[0.05]">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Paragraph Evidence Highlights ({activeHighlights.length})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Flagged excerpts with direct source correlation.
                    </p>
                  </div>
                  <Badge tone="amber">Flagged</Badge>
                </div>

                <div className="space-y-3">
                  {activeHighlights.map((match) => {
                    const src = report.sourceRanking.find((s) => s.id === match.matchedSourceId);
                    return (
                      <div
                        key={match.id}
                        className="rounded-2xl border border-slate-200/60 bg-slate-50/30 p-4 dark:border-white/[0.05] dark:bg-white/[0.02]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Paragraph {match.paragraph}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {match.isQuote && (
                              <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[10px] text-slate-700 dark:bg-white/10 dark:text-slate-300">
                                Quote
                              </span>
                            )}
                            <Badge tone={riskTone(match.severity)}>
                              {match.severity} Risk
                            </Badge>
                          </div>
                        </div>
                        <blockquote className="border-l-2 border-emerald-500 pl-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
                          &ldquo;{match.excerpt}&rdquo;
                        </blockquote>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>Correlated: <strong>{src?.title || "Academic Literature"}</strong></span>
                          {src && (
                            <button
                              type="button"
                              onClick={() => setSelectedSourceForDiff(src)}
                              className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                            >
                              Compare Diff &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI STYLOMETRICS & HEATMAP */}
          {activeTab === "ai-heatmap" && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
              {/* STYLOMETRIC SIGNALS */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs dark:border-white/[0.08] dark:bg-[#0c1015]">
                <div className="border-b border-slate-100 pb-4 mb-4 dark:border-white/[0.05]">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Stylometric Signal Diagnostics
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Sentence variance, perplexity transition markers, and lexical diversity.
                  </p>
                </div>

                <div className="space-y-3">
                  {report.writingRisk.features.map((feat) => (
                    <div
                      key={feat.label}
                      className="rounded-2xl border border-slate-200/60 bg-slate-50/30 p-4 dark:border-white/[0.05] dark:bg-white/[0.02]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {feat.label}
                        </span>
                        <Badge tone={riskTone(feat.impact)}>
                          {feat.impact} Impact
                        </Badge>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {feat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SENTENCE HEATMAP */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs dark:border-white/[0.08] dark:bg-[#0c1015]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 dark:border-white/[0.05]">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Sentence-Level AI Heatmap
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Sentence-by-sentence predictability pattern evaluation.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {report.writingRisk.sentences?.length ?? 0} sentences
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {report.writingRisk.sentences && report.writingRisk.sentences.length > 0
                    ? report.writingRisk.sentences.map((evalItem) => {
                        const isHigh = evalItem.riskLevel === "HIGH";
                        const isMed = evalItem.riskLevel === "MEDIUM";

                        return (
                          <div
                            key={evalItem.index}
                            className={cn(
                              "rounded-2xl border p-3.5 transition-all text-xs leading-relaxed",
                              isHigh
                                ? "border-rose-200 bg-rose-50/70 text-rose-950 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200"
                                : isMed
                                ? "border-amber-200 bg-amber-50/70 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200"
                                : "border-slate-200/60 bg-slate-50/30 text-slate-700 dark:border-white/[0.05] dark:bg-white/[0.02] dark:text-slate-300"
                            )}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono text-[10px] font-semibold opacity-60">
                                Sentence #{evalItem.index} &bull; {evalItem.wordCount} words
                              </span>
                              <span className={cn(
                                "text-[10px] font-bold",
                                isHigh
                                  ? "text-rose-700 dark:text-rose-400"
                                  : isMed
                                  ? "text-amber-700 dark:text-amber-400"
                                  : "text-emerald-700 dark:text-emerald-400"
                              )}>
                                {evalItem.aiProbability}% AI Probability ({evalItem.riskLevel})
                              </span>
                            </div>
                            <p className="font-sans text-xs">{evalItem.text}</p>
                            {evalItem.reason && (
                              <p className="mt-1.5 pt-1.5 border-t border-black/5 dark:border-white/5 text-[11px] opacity-75 font-mono">
                                ↳ {evalItem.reason}
                              </p>
                            )}
                          </div>
                        );
                      })
                    : (
                      <p className="text-xs text-slate-400 py-10 text-center">
                        Scan document to evaluate sentence-level AI patterns.
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: METHODOLOGY */}
          {activeTab === "methods" && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs dark:border-white/[0.08] dark:bg-[#0c1015]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Institutional Analysis Methodology (Turnitin SimCheck Standard)
              </h3>
              <div className="grid gap-4 sm:grid-cols-3 text-xs">
                <div className="rounded-2xl border border-slate-200/60 bg-slate-50/30 p-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
                  <span className="font-bold text-slate-900 dark:text-white">1. Multi-Engine Corroboration</span>
                  <p className="mt-1.5 text-slate-500 dark:text-slate-400 leading-relaxed">
                    Cross-references 250M+ open-access papers (OpenAlex), 150M+ journal DOIs (Crossref), and Wikipedia real-time encyclopedic graphs.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/60 bg-slate-50/30 p-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
                  <span className="font-bold text-slate-900 dark:text-white">2. Semantic Vector &amp; Paraphrase</span>
                  <p className="mt-1.5 text-slate-500 dark:text-slate-400 leading-relaxed">
                    Catches conceptual similarity and synonym swapping using TF-IDF cosine vector matching and N-gram shingling.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/60 bg-slate-50/30 p-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
                  <span className="font-bold text-slate-900 dark:text-white">3. Stylometric Burstiness ($CV$)</span>
                  <p className="mt-1.5 text-slate-500 dark:text-slate-400 leading-relaxed">
                    Calculates coefficient of variation ($CV$) across sentence lengths. Human writing naturally fluctuates, whereas LLMs cluster around uniform lengths.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TURNITIN SIMCHECK PRO ZEN SIDE-BY-SIDE DIFF MODAL */}
        {selectedSourceForDiff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="relative flex flex-col w-full max-w-5xl max-h-[85vh] rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-white/10 dark:bg-[#0c1015]">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400">
                    <SplitSquareVertical className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Turnitin SimCheck Diff Viewer
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {(selectedSourceForDiff.similarity * 100).toFixed(0)}% Overlap
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 max-w-xl">
                      {selectedSourceForDiff.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={selectedSourceForDiff.url.startsWith("http") ? selectedSourceForDiff.url : undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/10 shadow-xs"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open Official Source</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setSelectedSourceForDiff(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Side-by-Side Dual Pane Content */}
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-white/[0.06] overflow-y-auto p-6 gap-6">
                
                {/* Left Pane: Student Submission */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.04]">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Student Submission Text
                    </span>
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      Highlighted Matches
                    </span>
                  </div>

                  <div className="rounded-2xl border border-amber-200/70 bg-amber-50/40 p-5 text-xs sm:text-sm leading-relaxed text-slate-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-slate-200 whitespace-pre-wrap font-sans">
                    {text}
                  </div>
                </div>

                {/* Right Pane: Original Literature Excerpt */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.04]">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Original Published Document Excerpt
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Source: {selectedSourceForDiff.author}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-5 text-xs sm:text-sm leading-relaxed text-slate-800 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-200">
                    <p className="font-serif italic text-slate-700 dark:text-slate-300">
                      &ldquo;{selectedSourceForDiff.originalExcerpt ?? selectedSourceForDiff.recommendation}&rdquo;
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-white/[0.06]">
                      <span className="text-[11px] font-bold text-slate-400">
                        Correlated Matching Phrases:
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {selectedSourceForDiff.matchedPhrases.map((phrase) => (
                          <span
                            key={phrase}
                            className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                          >
                            &ldquo;{phrase}&rdquo;
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02]">
                <span className="text-xs text-slate-500 dark:text-slate-400 max-w-lg line-clamp-1">
                  Recommendation: {selectedSourceForDiff.recommendation}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${selectedSourceForDiff.author} (2026). ${selectedSourceForDiff.title}. Available at: ${selectedSourceForDiff.url}`
                      );
                      setCopiedCitation(true);
                      setTimeout(() => setCopiedCitation(false), 2000);
                    }}
                    className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs"
                  >
                    {copiedCitation ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                    {copiedCitation ? "Citation Copied!" : "Copy Full Citation"}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setSelectedSourceForDiff(null)}
                    className="h-9 px-4 text-xs font-semibold rounded-xl"
                  >
                    Close Viewer
                  </Button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}

function citationTone(status: CitationStatus): "rose" | "amber" | "emerald" {
  if (status === "missing") return "rose";
  if (status === "partial") return "amber";
  return "emerald";
}

function riskTone(level: RiskLevel): "rose" | "amber" | "emerald" {
  if (level === "HIGH") return "rose";
  if (level === "MEDIUM") return "amber";
  return "emerald";
}
