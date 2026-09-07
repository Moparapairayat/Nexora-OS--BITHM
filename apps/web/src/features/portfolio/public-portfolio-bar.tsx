"use client";

import { useState } from "react";
import { Check, Copy, Mail, Printer, ShieldCheck } from "lucide-react";
import type { PortfolioRecord } from "./types";
import { PORTFOLIO_THEMES } from "./themes";

export function PublicPortfolioBar({ portfolio }: { portfolio: PortfolioRecord }) {
  const [copied, setCopied] = useState(false);
  const activeTheme = PORTFOLIO_THEMES[portfolio.theme || "obsidian"] || PORTFOLIO_THEMES.obsidian;

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed bottom-5 inset-x-0 z-40 flex justify-center px-4 pointer-events-none print:hidden">
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 rounded-full border border-white/15 bg-slate-900/90 dark:bg-black/90 p-1.5 sm:px-4 sm:py-2 text-white shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-4">
        {/* Verification badge */}
        <div className="hidden sm:flex items-center gap-1.5 pl-1 pr-2 border-r border-white/10 text-xs font-mono font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="text-slate-300">Nexora OS Verified</span>
        </div>

        {/* Contact CTA */}
        {portfolio.contact.email ? (
          <a
            href={`mailto:${portfolio.contact.email}?subject=${encodeURIComponent(`Inquiry from Nexora Portfolio: ${portfolio.name}`)}`}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold text-slate-950 shadow-xs transition hover:opacity-90"
            style={{ backgroundColor: activeTheme.accentColor }}
          >
            <Mail className="h-3 w-3" />
            <span>Contact</span>
          </a>
        ) : (
          portfolio.contact.linkedin && (
            <a
              href={portfolio.contact.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold text-slate-950 shadow-xs transition hover:opacity-90"
              style={{ backgroundColor: activeTheme.accentColor }}
            >
              <span>Connect</span>
            </a>
          )
        )}

        {/* Quick Copy Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs font-medium text-slate-300 hover:bg-white/10 transition"
          title="Copy Link to Clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 opacity-70" />
              <span className="hidden sm:inline text-[11px]">Share</span>
            </>
          )}
        </button>

        {/* Print / Save PDF button */}
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs font-medium text-slate-300 hover:bg-white/10 transition"
          title="Print or Export as PDF"
        >
          <Printer className="h-3 w-3 opacity-70" />
          <span className="hidden sm:inline text-[11px]">PDF</span>
        </button>
      </div>
    </div>
  );
}

