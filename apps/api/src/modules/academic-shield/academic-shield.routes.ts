import { Router, type Response } from "express";

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
import { Prisma } from "@prisma/client";

import { aiModelRouter } from "../ai/model-router.service.js";
import type { AITask } from "../ai/ai.types.js";
import { getPrisma } from "../../infrastructure/database/prisma.client.js";
import {
  requireAuth,
  type AuthenticatedRequest,
} from "../../middleware/auth.middleware.js";

import { plagiarismEngine } from "./services/plagiarism-engine.service.js";
import { aiDetectionEngine } from "./services/ai-detection-engine.service.js";
import { citationEngine } from "./services/citation-engine.service.js";

export const academicShieldRouter = Router();

academicShieldRouter.use(requireAuth);

type AuthUser = NonNullable<AuthenticatedRequest["user"]>;
type AcademicTarget = {
  assignmentSubmissionId?: string;
  labReportId?: string;
};

type StoredReportPayload = {
  title?: string;
  overallSimilarity?: number;
  internalSimilarity?: number;
  fuzzySimilarity?: number;
  semanticSimilarity?: number;
  citationGapCount?: number;
  textPreview?: string;
  sourceRanking?: AcademicShieldSourceMatch[];
  writingRisk?: AcademicShieldWritingRisk;
  exportFormats?: AcademicShieldReport["exportFormats"];
};

function currentUser(request: AuthenticatedRequest) {
  return request.user;
}

function canReview(user: AuthUser) {
  return (
    user.role === "TEACHER" ||
    user.role === "ADMIN" ||
    user.role === "SUPER_ADMIN"
  );
}

function asInputJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function parseFormat(value: unknown): AcademicShieldExportResult["format"] {
  const format = String(value ?? "markdown");

  return format === "pdf" ||
    format === "docx" ||
    format === "json" ||
    format === "markdown"
    ? format
    : "markdown";
}

function reportPayload(report: AcademicShieldReport): StoredReportPayload {
  return {
    title: report.title,
    overallSimilarity: report.overallSimilarity,
    internalSimilarity: report.internalSimilarity,
    fuzzySimilarity: report.fuzzySimilarity,
    semanticSimilarity: report.semanticSimilarity,
    citationGapCount: report.citationGapCount,
    textPreview: report.textPreview,
    sourceRanking: report.sourceRanking,
    writingRisk: report.writingRisk,
    exportFormats: report.exportFormats,
  };
}

function reportFromRecord(
  record: Prisma.PlagiarismReportGetPayload<{}>,
): AcademicShieldReport {
  const payload =
    record.matchedSources && typeof record.matchedSources === "object"
      ? (record.matchedSources as StoredReportPayload)
      : {};
  const highlightedMatches = Array.isArray(record.highlightedMatches)
    ? record.highlightedMatches
    : phase4AcademicShieldReport.highlightedMatches;

  return {
    ...phase4AcademicShieldReport,
    id: record.id,
    title: payload.title ?? phase4AcademicShieldReport.title,
    checkedAt: record.createdAt.toISOString(),
    originalityScore: record.originalityScore,
    overallSimilarity:
      payload.overallSimilarity ?? phase4AcademicShieldReport.overallSimilarity,
    internalSimilarity:
      payload.internalSimilarity ??
      phase4AcademicShieldReport.internalSimilarity,
    fuzzySimilarity:
      payload.fuzzySimilarity ?? phase4AcademicShieldReport.fuzzySimilarity,
    semanticSimilarity:
      payload.semanticSimilarity ??
      phase4AcademicShieldReport.semanticSimilarity,
    riskLevel: record.riskLevel,
    citationGapCount:
      payload.citationGapCount ?? phase4AcademicShieldReport.citationGapCount,
    textPreview: payload.textPreview ?? phase4AcademicShieldReport.textPreview,
    sourceRanking:
      payload.sourceRanking ?? phase4AcademicShieldReport.sourceRanking,
    highlightedMatches:
      highlightedMatches as AcademicShieldReport["highlightedMatches"],
    writingRisk: payload.writingRisk ?? phase4AcademicShieldReport.writingRisk,
    exportFormats:
      payload.exportFormats ?? phase4AcademicShieldReport.exportFormats,
  };
}

function reportToMarkdown(report: AcademicShieldReport) {
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
    "## Ranked Sources",
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

function buildExport(
  report: AcademicShieldReport,
  format: AcademicShieldExportResult["format"],
): AcademicShieldExportResult {
  const markdown = reportToMarkdown(report);
  const content =
    format === "json"
      ? JSON.stringify(report, null, 2)
      : format === "pdf"
        ? `PDF export adapter generated for Nexora storage.\n\n${markdown}`
        : format === "docx"
          ? `DOCX export adapter generated for Nexora storage.\n\n${markdown}`
          : markdown;
  const extension = format === "markdown" ? "md" : format;

  return {
    id: `academic-shield-export-${Date.now()}`,
    format,
    fileName: `academic-shield-report.${extension}`,
    content,
    availableFormats: report.exportFormats,
  };
}

async function resolveTarget(
  user: AuthUser,
  body: Record<string, unknown>,
): Promise<AcademicTarget> {
  const assignmentSubmissionId = body.assignmentSubmissionId
    ? String(body.assignmentSubmissionId)
    : undefined;
  const labReportId = body.labReportId ? String(body.labReportId) : undefined;

  if (assignmentSubmissionId) {
    const assignment = await getPrisma().assignmentSubmission.findFirst({
      where: canReview(user)
        ? { id: assignmentSubmissionId }
        : { id: assignmentSubmissionId, studentId: user.id },
      select: { id: true },
    });

    if (!assignment) {
      throw Object.assign(new Error("Assignment submission not found"), {
        statusCode: 404,
      });
    }
  }

  if (labReportId) {
    const labReport = await getPrisma().labReport.findFirst({
      where: canReview(user)
        ? { id: labReportId }
        : { id: labReportId, studentId: user.id },
      select: { id: true },
    });

    if (!labReport) {
      throw Object.assign(new Error("Lab report not found"), {
        statusCode: 404,
      });
    }
  }

  return { assignmentSubmissionId, labReportId };
}

async function updateLinkedScores(
  target: AcademicTarget,
  scores: { originalityScore?: number; aiWritingRiskScore?: number },
) {
  const data = {
    ...(scores.originalityScore === undefined
      ? {}
      : { originalityScore: scores.originalityScore }),
    ...(scores.aiWritingRiskScore === undefined
      ? {}
      : { aiWritingRiskScore: scores.aiWritingRiskScore }),
  };

  if (Object.keys(data).length === 0) {
    return;
  }

  if (target.assignmentSubmissionId) {
    await getPrisma().assignmentSubmission.update({
      where: { id: target.assignmentSubmissionId },
      data,
    });
  }

  if (target.labReportId) {
    await getPrisma().labReport.update({
      where: { id: target.labReportId },
      data,
    });
  }
}

async function logAiRequest(
  user: AuthUser,
  task: string,
  prompt: string,
  startedAt: number,
  response: unknown,
  model = "local",
  mode = "local",
) {
  await getPrisma()
    .aIRequestLog.create({
      data: {
        userId: user.id,
        task,
        model,
        mode,
        prompt,
        response: asInputJson(response ?? {}),
        executionTime: Date.now() - startedAt,
      },
    })
    .catch(() => undefined);
}

async function runAiWithLog(
  user: AuthUser,
  task: AITask,
  prompt: string,
  context?: Record<string, unknown>,
) {
  const startedAt = Date.now();

  try {
    const aiResponse = await aiModelRouter.run({ task, prompt, context });
    void logAiRequest(
      user,
      task,
      prompt,
      startedAt,
      aiResponse.output,
      aiResponse.model,
      aiResponse.mode,
    );
    return aiResponse;
  } catch (error) {
    void logAiRequest(user, task, prompt, startedAt, {
      error: error instanceof Error ? error.message : "AI request failed",
    });
    return null;
  }
}

function serializeCitation(
  citation: Prisma.CitationGetPayload<{}>,
): CitationRecord {
  const source =
    citation.source && typeof citation.source === "object"
      ? (citation.source as { sourceTitle?: string; url?: string })
      : {};

  return {
    id: citation.id,
    style: citation.style,
    sourceTitle: source.sourceTitle ?? "Title of source",
    url: source.url ?? "https://example.com",
    reference: citation.reference,
    inText: citation.inText,
    createdAt: citation.createdAt.toISOString(),
  };
}

function serializeWebScan(
  scan: Prisma.AcademicWebScanGetPayload<{}>,
): AcademicShieldWebScan {
  return {
    id: scan.id,
    url: scan.url,
    title: scan.title,
    checkedAt: scan.createdAt.toISOString(),
    similarity: scan.similarity,
    semanticScore: scan.semanticScore,
    citationStatus: scan.citationStatus as CitationStatus,
    matchedPhrases: scan.matchedPhrases,
    recommendation: scan.recommendation,
  };
}

function serializeRewrite(
  rewrite: Prisma.AcademicRewriteGetPayload<{}>,
): AcademicRewriteSuggestion {
  return {
    id: rewrite.id,
    originalText: rewrite.originalText,
    rewrittenText: rewrite.rewrittenText,
    citationPreservationNotes: rewrite.citationPreservationNotes,
    riskWarnings: rewrite.riskWarnings,
    createdAt: rewrite.createdAt.toISOString(),
  };
}

function sendRouteError(response: Response, error: unknown) {
  const statusCode =
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
      ? error.statusCode
      : 500;

  response.status(statusCode).json({
    error:
      error instanceof Error ? error.message : "AcademicShield request failed",
  });
}

/**
 * Real Plagiarism and Originality Check Endpoint
 */
academicShieldRouter.post("/check", async (request, response) => {
  const user = currentUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const text = String(request.body?.text ?? "").trim();
    if (!text) {
      response.status(400).json({ error: "Submission text is required for originality analysis" });
      return;
    }

    const target = await resolveTarget(user, request.body ?? {});

    // 1. Real Plagiarism & Corpus Overlap Analysis
    const plagiarismReport = await plagiarismEngine.checkOriginality(text, user.id);

    // 2. Real AI Writing & Stylometrics Analysis
    const writingRisk = aiDetectionEngine.detectAIWriting(text);

    // Combine into full report
    const fullReport: AcademicShieldReport = {
      ...plagiarismReport,
      writingRisk,
    };

    // Log AI/ML activity
    const aiResponse = await runAiWithLog(user, "similarity", text, {
      assignmentSubmissionId: target.assignmentSubmissionId,
      labReportId: target.labReportId,
      originalityScore: fullReport.originalityScore,
      aiRiskScore: writingRisk.score,
    });

    // Save to Database
    const saved = await getPrisma().plagiarismReport.create({
      data: {
        originalityScore: fullReport.originalityScore,
        riskLevel: fullReport.riskLevel,
        matchedSources: asInputJson(reportPayload(fullReport)),
        highlightedMatches: asInputJson(fullReport.highlightedMatches),
        userId: user.id,
        assignmentSubmissionId: target.assignmentSubmissionId,
        labReportId: target.labReportId,
      },
    });

    const persistedReport: AcademicShieldReport = {
      ...fullReport,
      id: saved.id,
      checkedAt: saved.createdAt.toISOString(),
    };

    await updateLinkedScores(target, {
      originalityScore: persistedReport.originalityScore,
      aiWritingRiskScore: persistedReport.writingRisk.score,
    });

    response.status(201).json({
      report: persistedReport,
      model: aiResponse?.model ?? "local-stylometric-nlp",
      mode: aiResponse?.mode ?? "local",
    });
  } catch (error) {
    sendRouteError(response, error);
  }
});

/**
 * Real AI Writing Risk Endpoint
 */
academicShieldRouter.post("/ai-risk", async (request, response) => {
  const user = currentUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const text = String(request.body?.text ?? "").trim();
    if (!text) {
      response.status(400).json({ error: "Text is required for AI writing analysis" });
      return;
    }

    const target = await resolveTarget(user, request.body ?? {});

    // Real Stylometric & Burstiness AI Detection
    const report = aiDetectionEngine.detectAIWriting(text);

    const aiResponse = await runAiWithLog(user, "similarity", text, {
      analyzer: "writing-risk",
      score: report.score,
    });

    const saved = await getPrisma().writingRiskReport.create({
      data: {
        riskScore: report.score,
        riskLevel: report.riskLevel,
        confidence: report.confidence,
        explanation:
          "Advisory writing signal generated from real sentence rhythm, burstiness, vocabulary diversity and AI marker analysis.",
        disclaimer: report.disclaimer,
        features: asInputJson(report.features),
        userId: user.id,
        assignmentSubmissionId: target.assignmentSubmissionId,
        labReportId: target.labReportId,
      },
    });

    const persistedReport = {
      ...report,
      id: saved.id,
    };

    await updateLinkedScores(target, {
      aiWritingRiskScore: persistedReport.score,
    });

    response.status(201).json({
      report: persistedReport,
      textPreview: text.slice(0, 240),
      model: aiResponse?.model ?? "local-stylometric-nlp",
      mode: aiResponse?.mode ?? "local",
    });
  } catch (error) {
    sendRouteError(response, error);
  }
});

/**
 * Real Web Source Scan Endpoint
 */
academicShieldRouter.post("/web-scan", async (request, response) => {
  const user = currentUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const url = String(
      request.body?.url ?? "https://example.edu/testing-guidance",
    ).trim();
    const text = String(
      request.body?.text ?? phase4AcademicShieldReport.textPreview,
    ).trim();

    // Real Web Fetch & Comparison Scan
    const scan = await plagiarismEngine.scanWebSource(url, text);

    const saved = await getPrisma().academicWebScan.create({
      data: {
        url: scan.url,
        title: scan.title,
        similarity: scan.similarity,
        semanticScore: scan.semanticScore,
        citationStatus: scan.citationStatus,
        matchedPhrases: scan.matchedPhrases,
        recommendation: scan.recommendation,
        textPreview: text.slice(0, 360),
        plagiarismReportId: request.body?.plagiarismReportId
          ? String(request.body.plagiarismReportId)
          : null,
        userId: user.id,
      },
    });

    const history = await getPrisma().academicWebScan.findMany({
      where: canReview(user) ? {} : { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    response.status(201).json({
      scan: serializeWebScan(saved),
      history: history.map(serializeWebScan),
    });
  } catch (error) {
    sendRouteError(response, error);
  }
});

/**
 * Real Academic Rewrite Endpoint
 */
academicShieldRouter.post("/rewrite", async (request, response) => {
  const user = currentUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const text = String(
      request.body?.text ?? phase4AcademicShieldReport.textPreview,
    );

    // Call real academic rewrite engine
    const rewrite = citationEngine.academicRewrite(text);

    const aiResponse = await runAiWithLog(user, "rewrite", text, {
      preserveCitations: true,
      initialDraft: rewrite.rewrittenText,
    });

    const finalRewrittenText =
      typeof aiResponse?.output.suggestedCode === "string" && aiResponse.output.suggestedCode.length > 20
        ? aiResponse.output.suggestedCode
        : rewrite.rewrittenText;

    const saved = await getPrisma().academicRewrite.create({
      data: {
        originalText: rewrite.originalText,
        rewrittenText: finalRewrittenText,
        citationPreservationNotes: rewrite.citationPreservationNotes,
        riskWarnings: rewrite.riskWarnings,
        model: aiResponse?.model ?? "local-academic-enhancer",
        mode: aiResponse?.mode ?? "local",
        userId: user.id,
      },
    });

    const history = await getPrisma().academicRewrite.findMany({
      where: canReview(user) ? {} : { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    response.status(201).json({
      rewrite: serializeRewrite(saved),
      model: saved.model ?? "local",
      mode: saved.mode ?? "local",
      history: history.map(serializeRewrite),
    });
  } catch (error) {
    sendRouteError(response, error);
  }
});

/**
 * Real Citation Generation Endpoint
 */
academicShieldRouter.post("/generate", async (request, response) => {
  const user = currentUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const style = String(request.body?.style ?? "Harvard");
    const sourceTitle = String(request.body?.sourceTitle ?? "Title of source");
    const url = String(request.body?.url ?? "https://example.com");
    const author = request.body?.author ? String(request.body.author) : undefined;
    const year = request.body?.year ? String(request.body.year) : undefined;
    const publisher = request.body?.publisher ? String(request.body.publisher) : undefined;

    // Real Citation Engine Formatting
    const formatted = citationEngine.formatCitation({
      style,
      sourceTitle,
      url,
      author,
      year,
      publisher,
    });

    const saved = await getPrisma().citation.create({
      data: {
        style,
        source: asInputJson({
          sourceTitle,
          url,
          author,
          year,
          publisher,
          textPreview: request.body?.text
            ? String(request.body.text).slice(0, 240)
            : null,
        }),
        reference: formatted.reference,
        inText: formatted.inText,
        userId: user.id,
      },
    });

    const citations = await getPrisma().citation.findMany({
      where: canReview(user) ? {} : { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    response.status(201).json({
      citation: serializeCitation(saved),
      citations: citations.map(serializeCitation),
    });
  } catch (error) {
    sendRouteError(response, error);
  }
});

/**
 * Export Originality Report
 */
academicShieldRouter.post("/export", async (request, response) => {
  const user = currentUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const incomingReport = request.body?.report as
      | AcademicShieldReport
      | undefined;
    const report = incomingReport?.sourceRanking
      ? incomingReport
      : await plagiarismEngine.checkOriginality(String(request.body?.text ?? ""), user.id);
    const format = parseFormat(request.body?.format);
    const exportResult = buildExport(report, format);
    const saved = await getPrisma().academicShieldExport.create({
      data: {
        format,
        fileName: exportResult.fileName,
        content: exportResult.content,
        report: asInputJson(report),
        plagiarismReportId:
          report.id && report.id !== phase4AcademicShieldReport.id
            ? report.id
            : null,
        userId: user.id,
      },
    });

    response.status(201).json({
      export: {
        ...exportResult,
        id: saved.id,
        fileName: saved.fileName,
      },
    });
  } catch (error) {
    sendRouteError(response, error);
  }
});

academicShieldRouter.get("/demo-report", async (request, response) => {
  const user = currentUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const latest = await getPrisma().plagiarismReport.findFirst({
    where: canReview(user) ? {} : { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  response.json({
    report: latest ? reportFromRecord(latest) : phase4AcademicShieldReport,
  });
});

academicShieldRouter.get("/settings", (_request, response) => {
  response.json({
    settings: {
      internalSimilarityThreshold: 18,
      fuzzyMatchThreshold: 24,
      semanticMatchThreshold: 32,
      aiWritingRiskThreshold: 65,
      sourceRankingModel: "nexora-academic-shield-stylometric-nlp",
      citationStyles: ["Harvard", "APA", "IEEE", "MLA"],
      disclaimer: academicShieldDisclaimer,
    },
  });
});

academicShieldRouter.get("/library", async (request, response) => {
  const user = currentUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const where = canReview(user) ? {} : { userId: user.id };
  const [citations, webScans, rewrites, reports, writingReports, exports] =
    await Promise.all([
      getPrisma().citation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
      getPrisma().academicWebScan.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      getPrisma().academicRewrite.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      getPrisma().plagiarismReport.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      getPrisma().writingRiskReport.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      getPrisma().academicShieldExport.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  response.json({
    citations: citations.map(serializeCitation),
    webScans: webScans.map(serializeWebScan),
    rewrites: rewrites.map(serializeRewrite),
    reports: reports.map(reportFromRecord),
    writingReports: writingReports.map((report) => ({
      id: report.id,
      score: report.riskScore,
      riskLevel: report.riskLevel,
      confidence: report.confidence,
      explanation: report.explanation,
      disclaimer: report.disclaimer,
      features: report.features,
      createdAt: report.createdAt.toISOString(),
    })),
    exports: exports.map((item) => ({
      id: item.id,
      format: item.format,
      fileName: item.fileName,
      createdAt: item.createdAt.toISOString(),
    })),
  });
});
