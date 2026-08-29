"use client";

import type { CitationRecord } from "@nexora/types";
import {
  BookOpen,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileStack,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldLabel, inputClass } from "@/components/ui/form-field";
import type { AppRole } from "@/data/dashboard.mock";
import { roleDashboards } from "@/data/dashboard.mock";
import { apiGet, apiPost } from "@/services/api-client";
import { cn } from "@/lib/utils";

export function CitationGeneratorPage({ role }: { role: AppRole }) {
  const roleData = roleDashboards[role];

  const [style, setStyle] = useState("Harvard");
  const [sourceTitle, setSourceTitle] = useState("Responsive Web Design Principles");
  const [author, setAuthor] = useState("Ethan Marcotte");
  const [url, setUrl] = useState("https://alistapart.com/article/responsive-web-design/");
  const [year, setYear] = useState("2026");

  const [generatedCitation, setGeneratedCitation] = useState<CitationRecord | null>({
    id: "cite-default",
    style: "Harvard",
    sourceTitle: "Responsive Web Design Principles",
    url: "https://alistapart.com/article/responsive-web-design/",
    reference: "Marcotte, E. (2026) 'Responsive Web Design Principles', A List Apart. Available at: https://alistapart.com/article/responsive-web-design/ (Accessed: 29 August 2026).",
    inText: "(Marcotte, 2026)",
    createdAt: new Date().toISOString(),
  });

  const [citations, setCitations] = useState<CitationRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStyle, setFilterStyle] = useState("ALL");
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedInText, setCopiedInText] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let active = true;
    void apiGet<{ citations?: CitationRecord[] }>("/citations/library").then((res) => {
      if (!active || !res?.citations) return;
      setCitations(res.citations);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleGenerate() {
    if (!sourceTitle.trim()) return;
    setIsGenerating(true);

    const response = await apiPost<{
      citation: CitationRecord;
      citations: CitationRecord[];
    }>("/citations/generate", {
      style,
      sourceTitle,
      author,
      url,
      year,
    });

    if (response?.citation) {
      setGeneratedCitation(response.citation);
      setCitations(response.citations ?? [response.citation, ...citations]);
    }
    setIsGenerating(false);
  }

  function handleCopy(textToCopy: string, isRef: boolean) {
    navigator.clipboard.writeText(textToCopy);
    if (isRef) {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedInText(true);
      setTimeout(() => setCopiedInText(false), 2000);
    }
  }

  const filteredCitations = citations.filter((c) => {
    const matchesSearch =
      c.sourceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStyle = filterStyle === "ALL" || c.style === filterStyle;
    return matchesSearch && matchesStyle;
  });

  function exportBibliography() {
    const bibContent = [
      `# Bibliography & References (${style})`,
      `Generated via Nexora AcademicShield on ${new Date().toLocaleDateString("en-GB")}`,
      "",
      ...citations.map((c, i) => `${i + 1}. [${c.style}] ${c.reference}`),
    ].join("\n\n");

    const blob = new Blob([bibContent], { type: "text/markdown;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "bibliography.md";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  }

  return (
    <AppShell
      role={role}
      title="Citation Generator & Reference Library"
      subtitle="Generate compliant Harvard, APA 7th, IEEE, and MLA academic references and manage your source library."
      nav={roleData.nav}
      navGroups={roleData.navGroups}
      accountEmail={roleData.accountEmail}
    >
      <div className="grid gap-6 max-w-7xl mx-auto">
        
        {/* ZEN TOP HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/70 dark:border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400">
                <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                Referencing Standards Active
              </span>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Harvard &bull; APA 7th &bull; IEEE &bull; MLA 9th
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Citation Generator
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Build full bibliographic references and in-text citation keys from DOIs, journal articles, or web resources.
            </p>
          </div>

          <Button
            type="button"
            onClick={exportBibliography}
            disabled={citations.length === 0}
            className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-xs dark:bg-teal-600 dark:hover:bg-teal-500 self-start sm:self-auto"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export Bibliography ({citations.length})
          </Button>
        </div>

        {/* 2-COLUMN CITATION WORKSPACE */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          {/* CITATION FORM */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/[0.08] dark:bg-[#0c1015]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 dark:border-white/[0.05]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Source Metadata
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Enter metadata or DOI to format citation according to institutional rules.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                {style} Style
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldLabel label="Referencing Standard">
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className={inputClass}
                  >
                    <option value="Harvard">Harvard Referencing</option>
                    <option value="APA">APA 7th Edition</option>
                    <option value="IEEE">IEEE Transactions</option>
                    <option value="MLA">MLA 9th Edition</option>
                  </select>
                </FieldLabel>

                <FieldLabel label="Author Name(s)">
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Ethan Marcotte"
                    className={inputClass}
                  />
                </FieldLabel>
              </div>

              <FieldLabel label="Document / Article Title">
                <input
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder="e.g. Responsive Web Design Principles"
                  className={inputClass}
                />
              </FieldLabel>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
                <FieldLabel label="Source URL or DOI">
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://doi.org/10.1002/..."
                    className={inputClass}
                  />
                </FieldLabel>

                <FieldLabel label="Year">
                  <input
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2026"
                    className={inputClass}
                  />
                </FieldLabel>
              </div>

              <Button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold h-10 rounded-xl shadow-xs transition-all mt-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                {isGenerating ? "Formatting Citation..." : "Generate & Save to Library"}
              </Button>
            </div>
          </div>

          {/* GENERATED PREVIEW */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/[0.08] dark:bg-[#0c1015] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 dark:border-white/[0.05]">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Formatted Output Preview
                </h3>
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                  Ready to Copy
                </span>
              </div>

              {generatedCitation ? (
                <div className="space-y-4">
                  {/* Full Reference */}
                  <div className="rounded-2xl border border-teal-200/70 bg-teal-50/40 p-4 dark:border-teal-900/30 dark:bg-teal-950/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-teal-900 dark:text-teal-300">
                        Full Bibliography Entry:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(generatedCitation.reference, true)}
                        className="flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900 font-semibold dark:text-teal-400 dark:hover:text-teal-200"
                      >
                        {copiedRef ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedRef ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="mt-2 font-serif text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                      {generatedCitation.reference}
                    </p>
                  </div>

                  {/* In-Text Citation */}
                  <div className="rounded-2xl border border-slate-200/60 bg-slate-50/40 p-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        In-Text Citation Key:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(generatedCitation.inText, false)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold dark:text-slate-400 dark:hover:text-white"
                      >
                        {copiedInText ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedInText ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="mt-2 font-mono text-sm font-bold text-teal-700 dark:text-teal-400">
                      {generatedCitation.inText}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-10 text-center">
                  Fill in the details on the left to preview formatted citation output.
                </p>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/40 p-3 text-xs text-slate-500 dark:border-white/[0.04] dark:bg-white/[0.02] dark:text-slate-400">
              💡 <strong>Usage Note:</strong> Place the In-Text Citation in your paragraph text, and add the Full Bibliography Entry to your references list.
            </div>
          </div>
        </div>

        {/* SAVED CITATIONS LIBRARY TABLE */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/[0.08] dark:bg-[#0c1015]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-white/[0.05]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Stored Reference Library ({filteredCitations.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Saved citations from current workspace session.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter saved citations..."
                  className="h-8.5 w-48 rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 outline-none focus:border-teal-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
                />
              </div>

              {/* Style filter */}
              <select
                value={filterStyle}
                onChange={(e) => setFilterStyle(e.target.value)}
                className="h-8.5 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
              >
                <option value="ALL">All Standards</option>
                <option value="Harvard">Harvard</option>
                <option value="APA">APA</option>
                <option value="IEEE">IEEE</option>
                <option value="MLA">MLA</option>
              </select>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filteredCitations.length > 0 ? (
              filteredCitations.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200/60 bg-slate-50/30 p-4 transition-all hover:border-slate-300 dark:border-white/[0.05] dark:bg-white/[0.02] dark:hover:border-white/10"
                >
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                        {c.style}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                    <h5 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                      {c.sourceTitle}
                    </h5>
                    <p className="mt-1 font-serif text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {c.reference}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(c.reference, true)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10"
                    >
                      <Copy className="h-3 w-3" />
                      Copy Reference
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">
                No citations found in library. Use the generator above to format and save references.
              </p>
            )}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
