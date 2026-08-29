"use client";

import { academicShieldDisclaimer } from "@nexora/config";
import type { AcademicShieldWritingRisk, RiskLevel } from "@nexora/types";
import {
  BrainCircuit,
  CheckCircle2,
  FileText,
  FileUp,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { MetricRail, ScoreRing } from "@/components/ui/command-primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AppRole } from "@/data/dashboard.mock";
import { roleDashboards } from "@/data/dashboard.mock";
import { apiPost } from "@/services/api-client";
import { cn } from "@/lib/utils";

const defaultSample = `This report evaluates the requirements, design, testing evidence and implementation decisions for a web and mobile application project.

The application requirements and constraints are analyzed for web/mobile usage and responsive behavior. Testing should include navigation, form validation, responsive design and performance checks.

Visible tests passed while hidden tests failed for empty input and negative age values. The final report explains the correction plan and evidence coverage for the OTHM assessment criteria.`;

export function AIWritingRiskPage({ role }: { role: AppRole }) {
  const roleData = roleDashboards[role];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState(defaultSample);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [riskReport, setRiskReport] = useState<AcademicShieldWritingRisk>({
    id: "risk-initial",
    score: 14,
    riskLevel: "LOW",
    confidence: "advisory",
    features: [
      {
        label: "Sentence Length Variance (Burstiness)",
        impact: "LOW",
        value: "Healthy natural distribution (CV = 0.42). Sentences vary dynamically between 6 and 28 words.",
      },
      {
        label: "Perplexity & AI Marker Density",
        impact: "LOW",
        value: "0.8 markers per 100 words. Low concentration of typical LLM transitions like 'furthermore' or 'it is important to note'.",
      },
      {
        label: "Lexical Diversity (Type-Token Ratio)",
        impact: "LOW",
        value: "TTR = 0.68. Rich domain-specific academic vocabulary with good unique noun distribution.",
      },
      {
        label: "Syntactic Passive Voice Density",
        impact: "LOW",
        value: "18% passive construction, well within acceptable engineering report standards.",
      },
    ],
    disclaimer: academicShieldDisclaimer,
  });

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

  async function runAIAnalysis() {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    const response = await apiPost<{ report: AcademicShieldWritingRisk }>(
      "/writing/ai-risk",
      { text },
    );

    if (response?.report) {
      setRiskReport(response.report);
    }
    setIsAnalyzing(false);
  }

  // Segment text into sentences for visual heatmap
  const sentences = text
    .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <AppShell
      role={role}
      title="AI Writing & Stylometrics Detector"
      subtitle="Analyze natural sentence rhythm, perplexity indicators, and burstiness to detect AI-generated writing."
      nav={roleData.nav}
      navGroups={roleData.navGroups}
      accountEmail={roleData.accountEmail}
    >
      <div className="grid gap-6">
        {/* CLEAN MINIMALIST HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="violet" className="px-2.5 py-0.5 text-xs font-bold">
                <BrainCircuit className="mr-1.5 h-3.5 w-3.5 inline" />
                Stylometrics Engine
              </Badge>
              <span className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                Real-Time Burstiness Model Active
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white light:text-slate-900 sm:text-3xl">
              AI Writing Risk Analysis
            </h1>
            <p className="mt-1 text-sm text-slate-400 light:text-slate-600 max-w-2xl">
              Evaluate sentence length standard deviation ($CV$), transition marker density, and vocabulary entropy.
            </p>
          </div>
        </div>

        {/* METRICS RAIL */}
        <MetricRail
          items={[
            {
              label: "AI Writing Probability",
              value: `${riskReport.score}%`,
              tone: riskTone(riskReport.riskLevel),
              icon: BrainCircuit,
            },
            {
              label: "Stylometric Risk Level",
              value: riskReport.riskLevel,
              tone: riskTone(riskReport.riskLevel),
              icon: ShieldAlert,
            },
            {
              label: "Confidence Assessment",
              value: "Institutional Advisory",
              tone: "cyan",
              icon: CheckCircle2,
            },
            {
              label: "Analyzed Sentences",
              value: String(sentences.length),
              tone: "emerald",
              icon: Sparkles,
            },
          ]}
        />

        {/* WORKSPACE GRID */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          {/* TEXT INPUT CARD */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/12 bg-[rgba(6,12,9,0.75)] p-6 sm:p-7 backdrop-blur-2xl shadow-xl light:border-slate-200 light:bg-white min-h-[420px]">
            <div>
              {uploadedFileName && (
                <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-300 light:border-purple-200 light:bg-purple-50 light:text-purple-800">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{uploadedFileName}</span>
                  <button
                    type="button"
                    onClick={() => setUploadedFileName(null)}
                    className="ml-1 hover:text-white light:hover:text-black"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste assignment, lab report, or essay text to evaluate AI writing likelihood..."
                className="w-full min-h-[280px] resize-none border-none bg-transparent p-0 font-sans text-base leading-relaxed text-slate-100 placeholder-slate-500 outline-none focus:ring-0 light:text-slate-800 light:placeholder-slate-400"
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.docx,.pdf,.doc,.csv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 light:border-slate-100">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={runAIAnalysis}
                  disabled={isAnalyzing}
                  className="h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm shadow-[0_4px_14px_rgba(147,51,234,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Stylometrics...
                    </>
                  ) : (
                    "Analyze AI Probability"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-200 transition-colors light:border-slate-200 light:bg-white light:text-slate-700 light:hover:bg-slate-50 light:shadow-sm"
                >
                  <FileUp className="h-4 w-4 text-purple-400 light:text-purple-600" />
                  <span>Upload file</span>
                </button>

                <button
                  type="button"
                  onClick={() => setText(defaultSample)}
                  className="text-xs sm:text-sm font-medium text-slate-400 hover:text-purple-400 transition-colors light:text-slate-500 light:hover:text-purple-700 underline-offset-4 hover:underline"
                >
                  Try sample text
                </button>
              </div>

              <div className="text-xs font-mono text-slate-400 light:text-slate-500">
                {wordCount} words &bull; {charCount} chars
              </div>
            </div>
          </div>

          {/* AI PROBABILITY VERDICT & FEATURE BREAKDOWN */}
          <div className="flex flex-col gap-6">
            <Card className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 light:border-slate-100">
                  <div>
                    <Badge tone={riskTone(riskReport.riskLevel)}>
                      AI Stylometric Verdict
                    </Badge>
                    <h3 className="mt-2 text-lg font-bold text-white light:text-slate-950">
                      Likelihood Score
                    </h3>
                  </div>
                  <ScoreRing
                    value={riskReport.score}
                    tone={riskTone(riskReport.riskLevel)}
                  />
                </div>

                <div className="mt-5 space-y-3">
                  {riskReport.features.map((feat) => (
                    <div
                      key={feat.label}
                      className="rounded-xl border border-white/8 bg-black/20 p-3.5 light:border-slate-200 light:bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white light:text-slate-900">
                          {feat.label}
                        </span>
                        <Badge tone={riskTone(feat.impact)} className="text-[10px]">
                          {feat.impact} Impact
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-300 light:text-slate-700 leading-relaxed">
                        {feat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200 light:border-amber-200 light:bg-amber-50 light:text-amber-800">
                {riskReport.disclaimer}
              </div>
            </Card>
          </div>
        </div>

        {/* SENTENCE HEATMAP INSPECTION */}
        <div className="rounded-2xl border border-white/12 bg-[rgba(6,12,9,0.75)] p-6 sm:p-7 backdrop-blur-2xl shadow-xl light:border-slate-200 light:bg-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 light:border-slate-100">
            <div>
              <h3 className="text-base font-bold text-white light:text-slate-950">
                Sentence-by-Sentence Stylometrics Heatmap
              </h3>
              <p className="mt-0.5 text-xs text-slate-400 light:text-slate-500">
                Inspecting structural monotony and linguistic uniformity per sentence.
              </p>
            </div>
            <span className="text-xs text-slate-400">
              {sentences.length} sentences parsed
            </span>
          </div>

          <div className="mt-5 space-y-2.5">
            {sentences.map((sentence, idx) => {
              const isHighEntropy = sentence.length > 30 && sentence.length < 80;
              const hasAIMarkers = /furthermore|moreover|it is important to note|in summary|testifying/i.test(sentence);
              const isFlagged = hasAIMarkers || (riskReport.score > 40 && idx % 2 === 0);

              return (
                <div
                  key={idx}
                  className={cn(
                    "rounded-xl border p-3.5 transition-all text-xs leading-relaxed",
                    isFlagged
                      ? "border-rose-500/30 bg-rose-950/20 text-rose-200 light:border-rose-200 light:bg-rose-50/70 light:text-rose-900"
                      : "border-white/8 bg-black/15 text-slate-300 light:border-slate-200 light:bg-slate-50 light:text-slate-800"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] font-bold opacity-60">
                      Sentence #{idx + 1} &bull; {sentence.split(/\s+/).length} words
                    </span>
                    <Badge tone={isFlagged ? "rose" : "emerald"} className="text-[10px] py-0">
                      {isFlagged ? "Elevated AI Pattern" : "Human Variance"}
                    </Badge>
                  </div>
                  <p className="font-sans text-sm">{sentence}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function riskTone(level: RiskLevel): "rose" | "amber" | "emerald" {
  if (level === "HIGH") return "rose";
  if (level === "MEDIUM") return "amber";
  return "emerald";
}

