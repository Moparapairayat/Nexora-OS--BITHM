"use client";

import type { AcademicRewriteSuggestion } from "@nexora/types";
import {
  Check,
  CheckCircle2,
  Copy,
  FileCheck2,
  FileText,
  FileUp,
  History,
  Lock,
  RefreshCw,
  Sparkles,
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

const defaultDraft = `This report evaluates the requirements, design, testing evidence and implementation decisions for a web and mobile application project.

The application requirements and constraints are analyzed for web/mobile usage and responsive behavior. Testing should include navigation, form validation, responsive design and performance checks.`;

export function AcademicRewritePage({ role }: { role: AppRole }) {
  const roleData = roleDashboards[role];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [rewrite, setRewrite] = useState<AcademicRewriteSuggestion | null>(null);

  const [history, setHistory] = useState<AcademicRewriteSuggestion[]>([]);

  useEffect(() => {
    let active = true;
    void apiGet<{ rewrites?: AcademicRewriteSuggestion[] }>("/citations/library").then((res) => {
      if (!active || !res?.rewrites) return;
      setHistory(res.rewrites);
    });
    return () => {
      active = false;
    };
  }, []);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const rewrittenWordCount = rewrite ? rewrite.rewrittenText.trim().split(/\s+/).length : 0;

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

  async function runAcademicRewrite() {
    if (!text.trim()) return;
    setIsRewriting(true);

    const response = await apiPost<{
      rewrite: AcademicRewriteSuggestion;
      history: AcademicRewriteSuggestion[];
    }>("/writing/rewrite", { text });

    if (response?.rewrite) {
      setRewrite(response.rewrite);
      setHistory(response.history ?? [response.rewrite, ...history]);
    }
    setIsRewriting(false);
  }

  function handleCopy() {
    if (!rewrite) return;
    navigator.clipboard.writeText(rewrite.rewrittenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AppShell
      role={role}
      title="Academic Rewrite Studio"
      subtitle="Transform rough drafts into formal academic prose while preserving citation keys, test numbers, and empirical data."
      nav={roleData.nav}
      navGroups={roleData.navGroups}
      accountEmail={roleData.accountEmail}
    >
      <div className="grid gap-6 max-w-7xl mx-auto">
        
        {/* CLEAN MINIMALIST TOP HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 dark:border-white/[0.06] pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Academic Rewrite Studio
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Elevate linguistic precision while strictly preserving citations and empirical test data.
            </p>
          </div>
        </div>

        {/* SPLIT-SCREEN PARAPHRASER (ZEN DUAL PANE) */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* LEFT: ORIGINAL DRAFT */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/[0.08] dark:bg-[#0c1015] min-h-[440px]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-white/[0.05]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Original Draft
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {wordCount} words
                </span>
              </div>

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

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste draft text to polish into formal academic prose..."
                className="w-full min-h-[260px] resize-none border-none bg-transparent p-0 font-sans text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none focus:ring-0 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.docx,.pdf,.doc,.csv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-white/[0.05]">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={runAcademicRewrite}
                  disabled={isRewriting}
                  className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-xs transition-all dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  {isRewriting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Polishing Prose...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Academic Rewrite
                    </>
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
              </div>

              <button
                type="button"
                onClick={() => setText(defaultDraft)}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                Reset Sample
              </button>
            </div>
          </div>

          {/* RIGHT: REWRITTEN FORMAL OUTPUT */}
          <div className="flex flex-col justify-between rounded-3xl border border-emerald-200/70 bg-emerald-50/15 p-6 sm:p-8 shadow-xs dark:border-emerald-900/30 dark:bg-[#07130f] min-h-[440px]">
            <div>
              <div className="flex items-center justify-between border-b border-emerald-200/50 pb-3 mb-4 dark:border-emerald-900/40">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Formal Academic Output
                  </span>
                  <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                    &bull; {rewrittenWordCount} words
                  </span>
                </div>

                {rewrite && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-xs hover:bg-emerald-50 transition-all dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy Text"}
                  </button>
                )}
              </div>

              {rewrite ? (
                <div className="font-sans text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {rewrite.rewrittenText}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
                    <Wand2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Awaiting Academic Rewrite</h4>
                  <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
                    Enter or paste draft text on the left, then click <strong>Generate Academic Rewrite</strong>.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setText(defaultDraft)}
                    className="mt-4 h-8 px-3 text-xs rounded-xl"
                  >
                    <Sparkles className="mr-1.5 h-3 w-3 text-emerald-600" />
                    Load Sample Draft
                  </Button>
                </div>
              )}
            </div>

            {rewrite && (
              <div className="mt-6 pt-4 border-t border-emerald-200/50 dark:border-emerald-900/40 grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-2xl bg-white/80 p-3.5 shadow-xs dark:bg-white/[0.02] dark:border dark:border-white/[0.04]">
                  <span className="font-bold text-slate-900 dark:text-white">Preserved Elements:</span>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                    {rewrite.citationPreservationNotes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-white/80 p-3.5 shadow-xs dark:bg-white/[0.02] dark:border dark:border-white/[0.04]">
                  <span className="font-bold text-slate-900 dark:text-white">Academic Integrity Note:</span>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                    {rewrite.riskWarnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SESSION HISTORY */}
        {history.length > 0 && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/[0.08] dark:bg-[#0c1015]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Session Rewrite History ({history.length})
            </h3>
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/60 bg-slate-50/30 p-4 text-xs dark:border-white/[0.05] dark:bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Generated at {new Date(item.createdAt).toLocaleTimeString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setText(item.originalText);
                        setRewrite(item);
                      }}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white underline"
                    >
                      Restore to Editor
                    </button>
                  </div>
                  <p className="line-clamp-2 text-slate-600 dark:text-slate-300 font-sans">
                    {item.rewrittenText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
