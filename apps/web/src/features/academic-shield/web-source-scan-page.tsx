"use client";

import type { AcademicShieldWebScan, CitationStatus } from "@nexora/types";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe2,
  History,
  Quote,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/data/dashboard.mock";
import { roleDashboards } from "@/data/dashboard.mock";
import { apiGet, apiPost } from "@/services/api-client";
import { cn } from "@/lib/utils";

const defaultSample = `This report evaluates the requirements, design, testing evidence and implementation decisions for a web and mobile application project.

The application requirements and constraints are analyzed for web/mobile usage and responsive behavior. Testing should include navigation, form validation, responsive design and performance checks.`;

export function WebSourceScanPage({ role }: { role: AppRole }) {
  const roleData = roleDashboards[role];

  const [url, setUrl] = useState("https://en.wikipedia.org/wiki/Responsive_web_design");
  const [submissionText, setSubmissionText] = useState(defaultSample);
  const [isScanning, setIsScanning] = useState(false);

  const [scanResult, setScanResult] = useState<AcademicShieldWebScan | null>({
    id: "web-scan-initial",
    url: "https://en.wikipedia.org/wiki/Responsive_web_design",
    title: "Responsive web design - Wikipedia",
    checkedAt: new Date().toISOString(),
    similarity: 28,
    semanticScore: 32,
    citationStatus: "partial",
    matchedPhrases: [
      "responsive web design",
      "web and mobile application",
      "performance checks and validation",
    ],
    recommendation:
      "Partial reference detected. Add a formal citation for 'Responsive web design - Wikipedia' and acknowledge definitions in your references.",
  });

  const [scanHistory, setScanHistory] = useState<AcademicShieldWebScan[]>([]);

  useEffect(() => {
    let active = true;
    void apiGet<{ webScans?: AcademicShieldWebScan[] }>("/citations/library").then((res) => {
      if (!active || !res?.webScans) return;
      setScanHistory(res.webScans);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleScan() {
    if (!url.trim() || !submissionText.trim()) return;
    setIsScanning(true);

    const response = await apiPost<{
      scan: AcademicShieldWebScan;
      history: AcademicShieldWebScan[];
    }>("/plagiarism/web-scan", {
      url,
      text: submissionText,
    });

    if (response?.scan) {
      setScanResult(response.scan);
      setScanHistory(response.history ?? [response.scan, ...scanHistory]);
    }
    setIsScanning(false);
  }

  return (
    <AppShell
      role={role}
      title="Target Web Source Scanner"
      subtitle="Compare your submission text against any live target webpage, documentation, or online journal URL."
      nav={roleData.nav}
      navGroups={roleData.navGroups}
      accountEmail={roleData.accountEmail}
    >
      <div className="grid gap-6 max-w-7xl mx-auto">
        
        {/* ZEN TOP HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/70 dark:border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                <Globe2 className="h-3.5 w-3.5 inline" />
                Live HTML Scraper Active
              </span>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Real-Time Document Comparator
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Web Source Scanner
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Extract and cross-examine live web content directly against your submission text in real time.
            </p>
          </div>
        </div>

        {/* ZEN URL SEARCH BAR */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-white/[0.08] dark:bg-[#0c1015]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-white/[0.05]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Target Webpage URL
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Paste any documentation, Wikipedia article, or research portal URL.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              GET /html
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://en.wikipedia.org/wiki/Responsive_web_design"
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
            />
            <Button
              type="button"
              onClick={handleScan}
              disabled={isScanning}
              className="h-10 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-xs transition-all dark:bg-cyan-600 dark:hover:bg-cyan-500 shrink-0"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Fetching &amp; Comparing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Scan URL
                </>
              )}
            </Button>
          </div>
        </div>

        {/* COMPARISON RESULTS & SUBMISSION PREVIEW */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* TARGET WEB EXTRACTION */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/[0.08] dark:bg-[#0c1015] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-white/[0.05]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Target Web Extraction
                </span>
                {scanResult && (
                  <Badge tone={citationTone(scanResult.citationStatus)}>
                    Citation: {scanResult.citationStatus}
                  </Badge>
                )}
              </div>

              {scanResult ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {scanResult.title}
                    </h4>
                    <a
                      href={scanResult.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      {scanResult.url}
                    </a>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-slate-50/40 p-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
                    <div className="text-center shrink-0 pr-4 border-r border-slate-200 dark:border-white/10">
                      <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
                        {scanResult.similarity}%
                      </span>
                      <p className="text-[11px] text-slate-400">overlap</p>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {scanResult.recommendation}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Overlapping Phrase Matches:
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {scanResult.matchedPhrases.map((phrase) => (
                        <span
                          key={phrase}
                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                        >
                          &ldquo;{phrase}&rdquo;
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-16 text-center">
                  Click 'Scan URL' above to fetch and compare the live webpage.
                </p>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/40 p-3 text-xs text-slate-500 dark:border-white/[0.04] dark:bg-white/[0.02] dark:text-slate-400">
              ✓ Automated HTML tag stripping, script elimination, and TF-IDF cosine comparison.
            </div>
          </div>

          {/* SUBMISSION TEXT UNDER EVALUATION */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/[0.08] dark:bg-[#0c1015] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-white/[0.05]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Submission Text Under Evaluation
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {submissionText.split(/\s+/).length} words
                </span>
              </div>

              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Paste the text to compare against the target URL..."
                className="w-full min-h-[240px] resize-none border-none bg-transparent p-0 font-sans text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none focus:ring-0 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/[0.05] text-xs text-slate-500 dark:text-slate-400">
              <span>Edit text anytime to re-evaluate overlap.</span>
              <button
                type="button"
                onClick={() => setSubmissionText(defaultSample)}
                className="text-cyan-600 hover:underline dark:text-cyan-400 font-medium"
              >
                Reset Sample
              </button>
            </div>
          </div>
        </div>

        {/* SCAN HISTORY */}
        {scanHistory.length > 0 && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/[0.08] dark:bg-[#0c1015]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Recent Web Scan History ({scanHistory.length})
            </h3>
            <div className="space-y-3">
              {scanHistory.map((scan) => (
                <div
                  key={scan.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-slate-50/30 p-4 text-xs dark:border-white/[0.05] dark:bg-white/[0.02]"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{scan.title}</span>
                    <p className="font-mono text-[11px] text-slate-400 mt-0.5">{scan.url}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={citationTone(scan.citationStatus)}>{scan.citationStatus}</Badge>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {scan.similarity}% overlap
                    </span>
                  </div>
                </div>
              ))}
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
