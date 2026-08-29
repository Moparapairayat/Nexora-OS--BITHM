"use client";

import type { AppRole } from "@/data/dashboard.mock";
import { PlagiarismCheckerPage } from "./plagiarism-checker-page";
import { CitationGeneratorPage } from "./citation-generator-page";
import { AcademicRewritePage } from "./academic-rewrite-page";
import { WebSourceScanPage } from "./web-source-scan-page";

type AcademicShieldMode = "student" | "teacher" | "admin";

/**
 * AcademicShield Router & Modular Page Dispatcher
 * Dispatches each feature to its dedicated, isolated, distraction-free workspace.
 */
export function AcademicShieldPage({
  role,
  mode,
  feature = "academic-shield",
}: {
  role: AppRole;
  mode: AcademicShieldMode;
  feature?: string;
}) {
  if (feature === "citation-generator") {
    return <CitationGeneratorPage role={role} />;
  }

  if (feature === "academic-rewrite") {
    return <AcademicRewritePage role={role} />;
  }

  if (feature === "web-source-scan") {
    return <WebSourceScanPage role={role} />;
  }

  // Combined Plagiarism & AI Checker (Handles "academic-shield", "plagiarism-reports", "ai-writing-risk", "originality-reports")
  return <PlagiarismCheckerPage role={role} />;
}
