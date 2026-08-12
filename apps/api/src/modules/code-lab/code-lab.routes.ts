import type {
  CodeLabSnippet,
  CodeLabVersion,
  CodeRunResult,
} from "@nexora/types";
import {
  LabTaskStatus,
  Prisma,
  SubmissionDecision,
  UserRole,
} from "@prisma/client";
import { Router } from "express";

import { MockAIAdapter } from "../ai/adapters/mock-ai.adapter.js";
import { aiModelRouter } from "../ai/model-router.service.js";
import {
  runDockerCode,
  runDockerTests,
} from "../../infrastructure/code-runner/docker-code.runner.js";
import { runDockerTerminalCommand } from "../../infrastructure/code-runner/docker-terminal.runner.js";
import type { AIResponse } from "../ai/ai.types.js";
import type { BackendRunResult } from "../../infrastructure/code-runner/code-runner.types.js";
import { runSafeTerminalCommand } from "../../infrastructure/code-runner/safe-terminal.runner.js";
import { getPrisma } from "../../infrastructure/database/prisma.client.js";
import {
  requireAuth,
  type AuthenticatedRequest,
} from "../../middleware/auth.middleware.js";

export const codeLabRouter = Router();

type AuthUser = NonNullable<AuthenticatedRequest["user"]>;

type CodeFileInput = {
  id?: string;
  name?: string;
  folder?: string;
  language?: string;
  content?: string;
  sortOrder?: number;
};

type BrowserRunResult = {
  stdout?: string;
  stderr?: string;
  success?: boolean;
  executionTime?: number;
  executionTimeMs?: number;
  errorMessage?: string;
  adapter?: string;
  language?: string;
  testResults?: Array<{
    id?: string;
    input?: string;
    expected?: string;
    stdout?: string;
    stderr?: string;
    passed?: boolean;
    executionTime?: number;
    executionTimeMs?: number;
  }>;
};

const workspaceInclude = {
  files: {
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
  },
  runs: {
    orderBy: { createdAt: "desc" as const },
    take: 20,
    include: { testResults: { orderBy: { createdAt: "asc" as const } } },
  },
  versions: { orderBy: { createdAt: "desc" as const }, take: 25 },
  submissions: {
    orderBy: { updatedAt: "desc" as const },
    take: 10,
    include: {
      feedback: { orderBy: { createdAt: "desc" as const }, take: 5 },
      fixRequests: { orderBy: { createdAt: "desc" as const }, take: 5 },
      codeVersion: true,
    },
  },
} satisfies Prisma.CodeWorkspaceInclude;

const submissionInclude = {
  student: { select: { id: true, name: true, email: true, role: true } },
  reviewer: { select: { id: true, name: true, email: true, role: true } },
  labTask: {
    select: {
      id: true,
      title: true,
      prompt: true,
      visibleTestCases: true,
      hiddenTestCases: true,
    },
  },
  workspace: {
    select: {
      id: true,
      title: true,
      status: true,
      activeFileId: true,
      updatedAt: true,
      files: {
        orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
      },
    },
  },
  codeVersion: true,
  feedback: {
    orderBy: { createdAt: "desc" as const },
    include: { teacher: { select: { id: true, name: true, email: true } } },
  },
  fixRequests: {
    orderBy: { createdAt: "desc" as const },
    include: { teacher: { select: { id: true, name: true, email: true } } },
  },
  codeReviews: { orderBy: { createdAt: "desc" as const } },
} satisfies Prisma.LabSubmissionInclude;

function getUser(request: AuthenticatedRequest) {
  return request.user;
}

function canReview(user: AuthUser) {
  return (
    user.role === UserRole.TEACHER ||
    user.role === UserRole.ADMIN ||
    user.role === UserRole.SUPER_ADMIN
  );
}

function workspaceWhere(user: AuthUser, id: string) {
  if (canReview(user)) return { id };

  return { id, ownerId: user.id };
}

function sanitizeFileInput(file: CodeFileInput, index = 0) {
  const name = String(file.name ?? `file-${index + 1}.txt`).trim();

  return {
    name: name || `file-${index + 1}.txt`,
    folder: String(file.folder ?? "main").trim() || "main",
    language: String(file.language ?? "text").trim() || "text",
    content: String(file.content ?? ""),
    sortOrder: Number.isFinite(Number(file.sortOrder))
      ? Number(file.sortOrder)
      : index,
  };
}

function normalizeTestResults(
  result: BrowserRunResult,
  body: Record<string, unknown>,
) {
  const fromResult = Array.isArray(result.testResults)
    ? result.testResults
    : [];
  const fromBody = Array.isArray(body.testResults)
    ? (body.testResults as BrowserRunResult["testResults"])
    : [];
  const source = fromBody && fromBody.length > 0 ? fromBody : fromResult;

  return source.map((test, index) => ({
    input: String(test?.input ?? ""),
    expected: String(test?.expected ?? ""),
    stdout: String(test?.stdout ?? ""),
    stderr: test?.stderr ? String(test.stderr) : null,
    passed: Boolean(test?.passed),
    executionTimeMs: Number(test?.executionTime ?? test?.executionTimeMs ?? 0),
    sortOrder: index,
  }));
}

function normalizeRunPayload(body: Record<string, unknown>) {
  const result =
    body.result && typeof body.result === "object"
      ? (body.result as BrowserRunResult)
      : ({} as BrowserRunResult);
  const stdout = String(result.stdout ?? body.stdout ?? "");
  const stderr = String(result.stderr ?? body.stderr ?? "");
  const success =
    typeof result.success === "boolean"
      ? result.success
      : typeof body.success === "boolean"
        ? body.success
        : !stderr;

  return {
    language: String(body.language ?? result.language ?? "javascript"),
    code: String(body.code ?? ""),
    stdin: body.stdin === undefined ? null : String(body.stdin),
    stdout: stdout || "Execution completed without stdout.",
    stderr: stderr || null,
    success,
    adapter: String(result.adapter ?? body.adapter ?? "browser-runner"),
    executionTimeMs: Number(
      result.executionTime ??
        result.executionTimeMs ??
        body.executionTimeMs ??
        0,
    ),
    errorMessage:
      result.errorMessage || body.errorMessage
        ? String(result.errorMessage ?? body.errorMessage)
        : null,
    result,
    testResults: normalizeTestResults(result, body),
  };
}

type CodeWorkspaceWithRelations = Prisma.CodeWorkspaceGetPayload<{
  include: typeof workspaceInclude;
}>;

function activeWorkspaceFile(
  workspace: CodeWorkspaceWithRelations,
  fileId?: string | null,
) {
  return (
    workspace.files.find((file) => file.id === fileId) ??
    workspace.files.find((file) => file.id === workspace.activeFileId) ??
    workspace.files[0] ??
    null
  );
}

function runnerInputFromRequest(
  workspace: CodeWorkspaceWithRelations,
  body: Record<string, unknown>,
) {
  const fileId = body.fileId ? String(body.fileId) : workspace.activeFileId;
  const activeFile = activeWorkspaceFile(workspace, fileId);
  const code =
    body.code === undefined ? (activeFile?.content ?? "") : String(body.code);
  const language = String(
    body.language ?? activeFile?.language ?? "unsupported",
  );
  const testCases = Array.isArray(body.testCases)
    ? (
        body.testCases as Array<{
          id?: string;
          input?: string;
          expected?: string;
        }>
      ).map((test, index) => ({
        id: String(test.id ?? `test-${index + 1}`),
        input: String(test.input ?? ""),
        expected: String(test.expected ?? ""),
      }))
    : [];

  return {
    workspaceId: workspace.id,
    fileId: activeFile?.id ?? fileId,
    language,
    code,
    stdin: body.stdin === undefined ? null : String(body.stdin),
    files: workspace.files.map((file) => ({
      id: file.id,
      name: file.name,
      folder: file.folder,
      language: file.id === activeFile?.id ? language : file.language,
      content: file.id === activeFile?.id ? code : file.content,
    })),
    testCases,
  };
}

function runPayloadFromExecution(
  body: Record<string, unknown>,
  result: BrowserRunResult | BackendRunResult,
) {
  return normalizeRunPayload({
    ...body,
    result,
    testResults: result.testResults ?? [],
  });
}

function toLegacyRunResult(run: {
  id: string;
  language: string;
  stdout: string;
  stderr: string | null;
  success: boolean;
  executionTimeMs: number;
  testResults?: Array<{
    input: string;
    expected: string;
    passed: boolean;
    stderr: string | null;
  }>;
}): CodeRunResult {
  return {
    status: run.success ? "success" : "error",
    language: run.language,
    output: run.stdout,
    diagnostics: run.stderr ? [run.stderr] : [],
    historyId: run.id,
    terminal: [
      `$ nexora-run ${run.language}`,
      run.success ? "Nexora execution result persisted." : "Execution failed.",
    ],
    tests:
      run.testResults?.map((test, index) => ({
        name: `Test ${index + 1}`,
        status: test.passed ? "passed" : "failed",
        detail: test.passed
          ? `Input ${test.input} matched ${test.expected}.`
          : (test.stderr ??
            `Input ${test.input} did not match ${test.expected}.`),
      })) ?? [],
    executionTimeMs: run.executionTimeMs,
  };
}

function formatAssistantNote(output: AIResponse["output"]) {
  if (typeof output.explanation === "string") {
    return output.explanation;
  }

  if (typeof output.text === "string") {
    return output.text;
  }

  const sections = [
    Array.isArray(output.issues) && output.issues.length > 0
      ? `Issues: ${output.issues.slice(0, 3).join("; ")}`
      : null,
    Array.isArray(output.fixes) && output.fixes.length > 0
      ? `Fixes: ${output.fixes.slice(0, 3).join("; ")}`
      : null,
    Array.isArray(output.refactorNotes) && output.refactorNotes.length > 0
      ? `Refactor: ${output.refactorNotes.slice(0, 2).join("; ")}`
      : null,
    Array.isArray(output.securityWarnings) && output.securityWarnings.length > 0
      ? `Security: ${output.securityWarnings.slice(0, 2).join("; ")}`
      : null,
  ].filter(Boolean);

  return sections.length > 0
    ? sections.join("\n")
    : "AI code assistance completed.";
}

function serializeRun(
  run: Prisma.CodeRunGetPayload<{ include: { testResults: true } }>,
) {
  return {
    id: run.id,
    workspaceId: run.workspaceId,
    fileId: run.fileId,
    language: run.language,
    code: run.code,
    stdin: run.stdin,
    stdout: run.stdout,
    stderr: run.stderr,
    success: run.success,
    adapter: run.adapter,
    executionTimeMs: run.executionTimeMs,
    errorMessage: run.errorMessage,
    result: run.result,
    testResults: run.testResults.map((test) => ({
      id: test.id,
      input: test.input,
      expected: test.expected,
      stdout: test.stdout,
      stderr: test.stderr,
      passed: test.passed,
      executionTimeMs: test.executionTimeMs,
      createdAt: test.createdAt.toISOString(),
    })),
    createdAt: run.createdAt.toISOString(),
  };
}

function serializeFrontendExecution(
  run: Prisma.CodeRunGetPayload<{ include: { testResults: true } }>,
) {
  return {
    stdout: run.stdout,
    stderr: run.stderr ?? "",
    success: run.success,
    executionTime: run.executionTimeMs,
    executionTimeMs: run.executionTimeMs,
    testResults: run.testResults.map((test) => ({
      id: test.id,
      input: test.input,
      expected: test.expected,
      stdout: test.stdout,
      stderr: test.stderr ?? "",
      passed: test.passed,
      executionTime: test.executionTimeMs,
      executionTimeMs: test.executionTimeMs,
    })),
    errorMessage: run.errorMessage ?? undefined,
    adapter: run.adapter,
    language: run.language,
  };
}

function serializeSubmission(
  submission: Prisma.LabSubmissionGetPayload<{
    include: typeof submissionInclude;
  }>,
) {
  return {
    id: submission.id,
    status: submission.status,
    language: submission.language,
    code: submission.code,
    output: submission.output,
    error: submission.error,
    version: submission.version,
    reviewStatus: submission.reviewStatus,
    teacherNote: submission.teacherNote,
    fixReason: submission.fixReason,
    reviewedAt: submission.reviewedAt?.toISOString() ?? null,
    createdAt: submission.createdAt.toISOString(),
    updatedAt: submission.updatedAt.toISOString(),
    student: submission.student,
    reviewer: submission.reviewer,
    labTask: submission.labTask,
    workspace: submission.workspace
      ? {
          ...submission.workspace,
          updatedAt: submission.workspace.updatedAt.toISOString(),
        }
      : null,
    codeVersion: submission.codeVersion
      ? {
          ...submission.codeVersion,
          createdAt: submission.codeVersion.createdAt.toISOString(),
        }
      : null,
    feedback: submission.feedback.map((item) => ({
      id: item.id,
      content: item.content,
      decision: item.decision,
      teacher: item.teacher,
      createdAt: item.createdAt.toISOString(),
    })),
    fixRequests: submission.fixRequests.map((item) => ({
      id: item.id,
      reason: item.reason,
      aiDraft: item.aiDraft,
      status: item.status,
      teacher: item.teacher,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    codeReviews: submission.codeReviews.map((item) => ({
      id: item.id,
      summary: item.summary,
      issues: item.issues,
      complexity: item.complexity,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

function serializeWorkspace(
  workspace: Prisma.CodeWorkspaceGetPayload<{
    include: typeof workspaceInclude;
  }>,
) {
  return {
    id: workspace.id,
    title: workspace.title,
    activeFileId: workspace.activeFileId,
    status: workspace.status,
    ownerId: workspace.ownerId,
    labTaskId: workspace.labTaskId,
    createdAt: workspace.createdAt.toISOString(),
    updatedAt: workspace.updatedAt.toISOString(),
    files: workspace.files.map((file) => ({
      id: file.id,
      workspaceId: file.workspaceId,
      name: file.name,
      folder: file.folder,
      language: file.language,
      content: file.content,
      sortOrder: file.sortOrder,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString(),
    })),
    runs: workspace.runs.map(serializeRun),
    versions: workspace.versions.map((version) => ({
      id: version.id,
      workspaceId: version.workspaceId,
      fileId: version.fileId,
      version: version.version,
      title: version.title,
      language: version.language,
      code: version.code,
      runResult: version.runResult,
      testResults: version.testResults,
      summary: version.summary,
      createdAt: version.createdAt.toISOString(),
    })),
    submissions: workspace.submissions.map((submission) => ({
      id: submission.id,
      status: submission.status,
      reviewStatus: submission.reviewStatus,
      language: submission.language,
      code: submission.code,
      output: submission.output,
      error: submission.error,
      version: submission.version,
      labTaskId: submission.labTaskId,
      codeVersionId: submission.codeVersionId,
      teacherNote: submission.teacherNote,
      fixReason: submission.fixReason,
      reviewedAt: submission.reviewedAt?.toISOString() ?? null,
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
      feedback: submission.feedback,
      fixRequests: submission.fixRequests,
      codeVersion: submission.codeVersion,
    })),
  };
}

async function findAccessibleWorkspace(user: AuthUser, id: string) {
  return getPrisma().codeWorkspace.findFirst({
    where: workspaceWhere(user, id),
    include: workspaceInclude,
  });
}

async function persistWorkspaceFiles(
  workspaceId: string,
  files: CodeFileInput[],
  activeFileName?: string,
) {
  const prisma = getPrisma();
  const incomingIds = files.map((file) => file.id).filter(Boolean) as string[];

  if (incomingIds.length > 0) {
    await prisma.codeFile.deleteMany({
      where: {
        workspaceId,
        id: { notIn: incomingIds },
      },
    });
  }

  for (const [index, file] of files.entries()) {
    const data = sanitizeFileInput(file, index);

    if (file.id) {
      const existing = await prisma.codeFile.findFirst({
        where: { id: file.id, workspaceId },
        select: { id: true },
      });

      if (existing) {
        await prisma.codeFile.update({ where: { id: file.id }, data });
        continue;
      }
    }

    await prisma.codeFile.create({
      data: {
        ...data,
        workspaceId,
      },
    });
  }

  if (activeFileName) {
    const activeFile = await prisma.codeFile.findFirst({
      where: { workspaceId, name: activeFileName },
      select: { id: true },
    });

    if (activeFile) {
      await prisma.codeWorkspace.update({
        where: { id: workspaceId },
        data: { activeFileId: activeFile.id },
      });
    }
  }
}

async function nextVersionForWorkspace(workspaceId: string) {
  const aggregate = await getPrisma().codeVersion.aggregate({
    where: { workspaceId },
    _max: { version: true },
  });

  return (aggregate._max.version ?? 0) + 1;
}

async function saveCodeLabSubmission(input: {
  workspace: CodeWorkspaceWithRelations;
  user: AuthUser;
  codeVersionId: string;
  status: LabTaskStatus;
  language: string;
  code: string;
  output: string | null;
  error: string | null;
  version: number;
  labTaskId: string | null;
}) {
  const existing = await getPrisma().labSubmission.findFirst({
    where: {
      workspaceId: input.workspace.id,
      studentId: input.user.id,
    },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    return getPrisma().labSubmission.update({
      where: { id: existing.id },
      data: {
        status: input.status,
        language: input.language,
        code: input.code,
        output: input.output,
        error: input.error,
        version: input.version,
        labTaskId: input.labTaskId,
        codeVersionId: input.codeVersionId,
        reviewStatus: "PENDING",
        reviewerId: null,
        reviewedAt: null,
      },
      include: {
        codeVersion: true,
        feedback: true,
        fixRequests: true,
      },
    });
  }

  return getPrisma().labSubmission.create({
    data: {
      status: input.status,
      language: input.language,
      code: input.code,
      output: input.output,
      error: input.error,
      version: input.version,
      studentId: input.user.id,
      labTaskId: input.labTaskId,
      workspaceId: input.workspace.id,
      codeVersionId: input.codeVersionId,
      reviewStatus: "PENDING",
    },
    include: {
      codeVersion: true,
      feedback: true,
      fixRequests: true,
    },
  });
}

codeLabRouter.get("/workspaces", requireAuth, async (request, response) => {
  const user = getUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const workspaces = await getPrisma().codeWorkspace.findMany({
    where: canReview(user) ? {} : { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      files: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      _count: { select: { runs: true, versions: true, submissions: true } },
    },
  });

  response.json({
    workspaces: workspaces.map((workspace) => ({
      id: workspace.id,
      title: workspace.title,
      activeFileId: workspace.activeFileId,
      status: workspace.status,
      ownerId: workspace.ownerId,
      labTaskId: workspace.labTaskId,
      updatedAt: workspace.updatedAt.toISOString(),
      fileCount: workspace.files.length,
      files: workspace.files,
      counts: workspace._count,
    })),
  });
});

codeLabRouter.post("/workspaces", requireAuth, async (request, response) => {
  const user = getUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const files = Array.isArray(request.body?.files)
    ? (request.body.files as CodeFileInput[])
    : [];
  const title = String(request.body?.title ?? "Code Lab Workspace");
  const labTaskId = request.body?.labTaskId
    ? String(request.body.labTaskId)
    : null;
  const workspace = await getPrisma().codeWorkspace.create({
    data: {
      title,
      ownerId: user.id,
      labTaskId,
      files: {
        create: files.map((file, index) => sanitizeFileInput(file, index)),
      },
    },
    include: workspaceInclude,
  });
  const activeFileName = request.body?.activeFileName
    ? String(request.body.activeFileName)
    : files[0]?.name;

  if (activeFileName) {
    const activeFile = await getPrisma().codeFile.findFirst({
      where: { workspaceId: workspace.id, name: activeFileName },
      select: { id: true },
    });

    if (activeFile) {
      await getPrisma().codeWorkspace.update({
        where: { id: workspace.id },
        data: { activeFileId: activeFile.id },
      });
    }
  }

  const saved = await getPrisma().codeWorkspace.findUniqueOrThrow({
    where: { id: workspace.id },
    include: workspaceInclude,
  });

  response.status(201).json({ workspace: serializeWorkspace(saved) });
});

codeLabRouter.get("/workspaces/:id", requireAuth, async (request, response) => {
  const user = getUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const workspace = await findAccessibleWorkspace(
    user,
    String(request.params.id),
  );

  if (!workspace) {
    response.status(404).json({ error: "Workspace not found" });
    return;
  }

  response.json({ workspace: serializeWorkspace(workspace) });
});

codeLabRouter.patch(
  "/workspaces/:id",
  requireAuth,
  async (request, response) => {
    const user = getUser(request as AuthenticatedRequest);

    if (!user) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }

    const existing = await findAccessibleWorkspace(
      user,
      String(request.params.id),
    );

    if (!existing) {
      response.status(404).json({ error: "Workspace not found" });
      return;
    }

    const files = Array.isArray(request.body?.files)
      ? (request.body.files as CodeFileInput[])
      : null;
    const title = request.body?.title
      ? String(request.body.title)
      : existing.title;
    const activeFileId = request.body?.activeFileId
      ? String(request.body.activeFileId)
      : existing.activeFileId;

    await getPrisma().codeWorkspace.update({
      where: { id: existing.id },
      data: {
        title,
        activeFileId,
        status: String(request.body?.status ?? existing.status),
      },
    });

    if (files) {
      await persistWorkspaceFiles(
        existing.id,
        files,
        request.body?.activeFileName
          ? String(request.body.activeFileName)
          : undefined,
      );
    }

    const workspace = await getPrisma().codeWorkspace.findUniqueOrThrow({
      where: { id: existing.id },
      include: workspaceInclude,
    });

    response.json({ workspace: serializeWorkspace(workspace) });
  },
);

codeLabRouter.post(
  "/workspaces/:id/autosave",
  requireAuth,
  async (request, response) => {
    const user = getUser(request as AuthenticatedRequest);

    if (!user) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }

    const existing = await findAccessibleWorkspace(
      user,
      String(request.params.id),
    );

    if (!existing) {
      response.status(404).json({ error: "Workspace not found" });
      return;
    }

    const files = Array.isArray(request.body?.files)
      ? (request.body.files as CodeFileInput[])
      : null;
    const title = request.body?.title
      ? String(request.body.title)
      : existing.title;
    const activeFileId = request.body?.activeFileId
      ? String(request.body.activeFileId)
      : existing.activeFileId;

    await getPrisma().codeWorkspace.update({
      where: { id: existing.id },
      data: {
        title,
        activeFileId,
        status: String(request.body?.status ?? existing.status),
      },
    });

    if (files) {
      await persistWorkspaceFiles(
        existing.id,
        files,
        request.body?.activeFileName
          ? String(request.body.activeFileName)
          : undefined,
      );
    }

    const workspace = await getPrisma().codeWorkspace.findUniqueOrThrow({
      where: { id: existing.id },
      include: workspaceInclude,
    });

    response.json({
      ok: true,
      workspaceId: workspace.id,
      activeFileId: workspace.activeFileId,
      updatedAt: workspace.updatedAt.toISOString(),
      workspace: serializeWorkspace(workspace),
    });
  },
);

codeLabRouter.post(
  "/workspaces/:id/files",
  requireAuth,
  async (request, response) => {
    const user = getUser(request as AuthenticatedRequest);

    if (!user) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }

    const workspace = await findAccessibleWorkspace(
      user,
      String(request.params.id),
    );

    if (!workspace) {
      response.status(404).json({ error: "Workspace not found" });
      return;
    }

    const file = await getPrisma().codeFile.create({
      data: {
        ...sanitizeFileInput(request.body ?? {}),
        workspaceId: workspace.id,
      },
    });

    await getPrisma().codeWorkspace.update({
      where: { id: workspace.id },
      data: { activeFileId: file.id },
    });

    response.status(201).json({ file });
  },
);

codeLabRouter.patch("/files/:id", requireAuth, async (request, response) => {
  const user = getUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const file = await getPrisma().codeFile.findUnique({
    where: { id: String(request.params.id) },
    include: { workspace: true },
  });

  if (!file || (!canReview(user) && file.workspace.ownerId !== user.id)) {
    response.status(404).json({ error: "File not found" });
    return;
  }

  const updated = await getPrisma().codeFile.update({
    where: { id: file.id },
    data: {
      name: request.body?.name ? String(request.body.name) : file.name,
      folder: request.body?.folder ? String(request.body.folder) : file.folder,
      language: request.body?.language
        ? String(request.body.language)
        : file.language,
      content:
        request.body?.content === undefined
          ? file.content
          : String(request.body.content),
      sortOrder:
        request.body?.sortOrder === undefined
          ? file.sortOrder
          : Number(request.body.sortOrder),
    },
  });

  response.json({ file: updated });
});

codeLabRouter.delete("/files/:id", requireAuth, async (request, response) => {
  const user = getUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const file = await getPrisma().codeFile.findUnique({
    where: { id: String(request.params.id) },
    include: { workspace: { include: { files: true } } },
  });

  if (!file || (!canReview(user) && file.workspace.ownerId !== user.id)) {
    response.status(404).json({ error: "File not found" });
    return;
  }

  if (file.workspace.files.length <= 1) {
    response
      .status(400)
      .json({ error: "A workspace must keep at least one file" });
    return;
  }

  await getPrisma().codeFile.delete({ where: { id: file.id } });
  const replacement = await getPrisma().codeFile.findFirst({
    where: { workspaceId: file.workspaceId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  if (file.workspace.activeFileId === file.id) {
    await getPrisma().codeWorkspace.update({
      where: { id: file.workspaceId },
      data: { activeFileId: replacement?.id ?? null },
    });
  }

  response.status(204).send();
});

codeLabRouter.post("/run", requireAuth, async (request, response) => {
  const user = getUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const workspaceId = request.body?.workspaceId
    ? String(request.body.workspaceId)
    : "";
  const workspace = workspaceId
    ? await findAccessibleWorkspace(user, workspaceId)
    : null;

  if (!workspace) {
    response.status(404).json({ error: "Workspace not found" });
    return;
  }

  const requestBody = (request.body ?? {}) as Record<string, unknown>;
  const clientResult =
    requestBody.result && typeof requestBody.result === "object"
      ? (requestBody.result as BrowserRunResult)
      : null;
  const execution = clientResult
    ? clientResult
    : await runDockerCode(runnerInputFromRequest(workspace, requestBody));
  const payload = clientResult
    ? normalizeRunPayload(requestBody)
    : runPayloadFromExecution(requestBody, execution);
  const run = await getPrisma().codeRun.create({
    data: {
      workspaceId: workspace.id,
      fileId: requestBody.fileId
        ? String(requestBody.fileId)
        : workspace.activeFileId,
      ownerId: user.id,
      language: payload.language,
      code: payload.code,
      stdin: payload.stdin,
      stdout: payload.stdout,
      stderr: payload.stderr,
      success: payload.success,
      adapter: payload.adapter,
      executionTimeMs: payload.executionTimeMs,
      errorMessage: payload.errorMessage,
      result: payload.result as Prisma.InputJsonValue,
      testResults: {
        create: payload.testResults.map((test) => ({
          input: test.input,
          expected: test.expected,
          stdout: test.stdout,
          stderr: test.stderr,
          passed: test.passed,
          executionTimeMs: test.executionTimeMs,
        })),
      },
    },
    include: { testResults: true },
  });

  await getPrisma().codeWorkspace.update({
    where: { id: workspace.id },
    data: { status: "DRAFT" },
  });

  response.status(201).json({
    run: serializeRun(run),
    result: toLegacyRunResult(run),
    execution: serializeFrontendExecution(run),
  });
});

codeLabRouter.post("/run-tests", requireAuth, async (request, response) => {
  const user = getUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const workspaceId = request.body?.workspaceId
    ? String(request.body.workspaceId)
    : "";
  const workspace = workspaceId
    ? await findAccessibleWorkspace(user, workspaceId)
    : null;

  if (!workspace) {
    response.status(404).json({ error: "Workspace not found" });
    return;
  }

  const requestBody = (request.body ?? {}) as Record<string, unknown>;
  const clientResult =
    requestBody.result && typeof requestBody.result === "object"
      ? (requestBody.result as BrowserRunResult)
      : null;
  const execution = clientResult
    ? clientResult
    : await runDockerTests(runnerInputFromRequest(workspace, requestBody));
  const payload = clientResult
    ? normalizeRunPayload(requestBody)
    : runPayloadFromExecution(requestBody, execution);
  const run = await getPrisma().codeRun.create({
    data: {
      workspaceId: workspace.id,
      fileId: requestBody.fileId
        ? String(requestBody.fileId)
        : workspace.activeFileId,
      ownerId: user.id,
      language: payload.language,
      code: payload.code,
      stdin: payload.stdin,
      stdout: payload.stdout,
      stderr: payload.stderr,
      success: payload.success,
      adapter: payload.adapter,
      executionTimeMs: payload.executionTimeMs,
      errorMessage: payload.errorMessage,
      result: payload.result as Prisma.InputJsonValue,
      testResults: {
        create: payload.testResults.map((test) => ({
          input: test.input,
          expected: test.expected,
          stdout: test.stdout,
          stderr: test.stderr,
          passed: test.passed,
          executionTimeMs: test.executionTimeMs,
        })),
      },
    },
    include: { testResults: true },
  });

  response.status(201).json({
    run: serializeRun(run),
    result: toLegacyRunResult(run),
    execution: serializeFrontendExecution(run),
  });
});

codeLabRouter.post("/terminal", requireAuth, async (request, response) => {
  const user = getUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const workspaceId = request.body?.workspaceId
    ? String(request.body.workspaceId)
    : "";
  const workspace = workspaceId
    ? await findAccessibleWorkspace(user, workspaceId)
    : null;

  if (!workspace) {
    response.status(404).json({ error: "Workspace not found" });
    return;
  }

  const command = String(request.body?.command ?? "");
  const terminalInput = {
    command,
    workspaceTitle: workspace.title,
    workspaceStatus: workspace.status,
    activeFileId: workspace.activeFileId,
    runCount: workspace.runs.length,
    submissionCount: workspace.submissions.length,
    latestSubmissionStatus:
      workspace.submissions[0]?.reviewStatus ??
      workspace.submissions[0]?.status ??
      null,
    files: workspace.files.map((file) => ({
      id: file.id,
      name: file.name,
      folder: file.folder,
      language: file.language,
      content: file.content,
    })),
  };
  const result =
    (await runDockerTerminalCommand(terminalInput)) ??
    runSafeTerminalCommand(terminalInput);
  const activeFile =
    workspace.files.find((file) => file.id === workspace.activeFileId) ??
    workspace.files[0] ??
    null;
  const run = await getPrisma().codeRun.create({
    data: {
      workspaceId: workspace.id,
      fileId: activeFile?.id ?? null,
      ownerId: user.id,
      language: "terminal",
      code: command,
      stdin: null,
      stdout: result.stdout || "Command completed.",
      stderr: result.stderr || null,
      success: result.success,
      adapter: result.adapter,
      executionTimeMs: result.executionTimeMs,
      errorMessage: result.errorMessage ?? null,
      result: result as unknown as Prisma.InputJsonValue,
    },
    include: { testResults: true },
  });

  response.status(201).json({
    terminal: result,
    run: serializeRun(run),
  });
});

codeLabRouter.get("/submissions", requireAuth, async (request, response) => {
  const user = getUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const reviewStatus = request.query.reviewStatus
    ? String(request.query.reviewStatus).toUpperCase()
    : null;
  const workspaceId = request.query.workspaceId
    ? String(request.query.workspaceId)
    : null;
  const where: Prisma.LabSubmissionWhereInput = canReview(user)
    ? {}
    : { studentId: user.id };

  if (reviewStatus) {
    where.reviewStatus = reviewStatus;
  }

  if (workspaceId) {
    where.workspaceId = workspaceId;
  }

  const submissions = await getPrisma().labSubmission.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 80,
    include: submissionInclude,
  });

  response.json({
    submissions: submissions.map(serializeSubmission),
    counts: {
      total: submissions.length,
      pending: submissions.filter((item) => item.reviewStatus === "PENDING")
        .length,
      fixRequested: submissions.filter(
        (item) => item.reviewStatus === "FIX_REQUESTED",
      ).length,
      accepted: submissions.filter((item) => item.reviewStatus === "ACCEPTED")
        .length,
    },
  });
});

codeLabRouter.get(
  "/submissions/:id",
  requireAuth,
  async (request, response) => {
    const user = getUser(request as AuthenticatedRequest);

    if (!user) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }

    const submission = await getPrisma().labSubmission.findUnique({
      where: { id: String(request.params.id) },
      include: submissionInclude,
    });

    if (!submission || (!canReview(user) && submission.studentId !== user.id)) {
      response.status(404).json({ error: "Submission not found" });
      return;
    }

    response.json({ submission: serializeSubmission(submission) });
  },
);

codeLabRouter.post("/submit", requireAuth, async (request, response) => {
  const user = getUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const workspaceId = request.body?.workspaceId
    ? String(request.body.workspaceId)
    : "";
  const workspace = workspaceId
    ? await findAccessibleWorkspace(user, workspaceId)
    : null;

  if (!workspace) {
    response.status(404).json({ error: "Workspace not found" });
    return;
  }

  const activeFile =
    workspace.files.find((file) => file.id === String(request.body?.fileId)) ??
    workspace.files.find((file) => file.id === workspace.activeFileId) ??
    workspace.files[0];

  if (!activeFile) {
    response.status(400).json({ error: "Workspace has no files to submit" });
    return;
  }

  const code = String(request.body?.code ?? activeFile.content);
  const language = String(request.body?.language ?? activeFile.language);
  const versionNumber = await nextVersionForWorkspace(workspace.id);
  const previousSubmissions = await getPrisma().labSubmission.findMany({
    where: { workspaceId: workspace.id, studentId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { fixRequests: true },
  });
  const openFixSubmissionIds = previousSubmissions
    .filter((item) => item.fixRequests.some((fix) => fix.status === "OPEN"))
    .map((item) => item.id);
  const latestSubmission = previousSubmissions[0] ?? null;
  const isResubmission =
    latestSubmission?.reviewStatus === "FIX_REQUESTED" ||
    openFixSubmissionIds.length > 0 ||
    workspace.status === "FIX_REQUESTED";
  const runResult =
    request.body?.result && typeof request.body.result === "object"
      ? (request.body.result as Prisma.InputJsonValue)
      : Prisma.JsonNull;
  const testResults = Array.isArray(request.body?.testResults)
    ? (request.body.testResults as Prisma.InputJsonValue)
    : Prisma.JsonNull;

  const codeVersion = await getPrisma().codeVersion.create({
    data: {
      workspaceId: workspace.id,
      fileId: activeFile.id,
      createdById: user.id,
      version: versionNumber,
      title: String(request.body?.title ?? workspace.title),
      language,
      code,
      runResult,
      testResults,
      summary: String(request.body?.summary ?? "Submitted from Code Lab."),
    },
  });
  const submission = await saveCodeLabSubmission({
    workspace,
    user,
    codeVersionId: codeVersion.id,
    status: isResubmission
      ? LabTaskStatus.RESUBMITTED
      : LabTaskStatus.SUBMITTED,
    language,
    code,
    output: request.body?.output ? String(request.body.output) : null,
    error: request.body?.error ? String(request.body.error) : null,
    version: versionNumber,
    labTaskId: request.body?.labTaskId
      ? String(request.body.labTaskId)
      : workspace.labTaskId,
  });

  await getPrisma().codeWorkspace.update({
    where: { id: workspace.id },
    data: {
      status: isResubmission ? "RESUBMITTED" : "SUBMITTED",
      activeFileId: activeFile.id,
    },
  });

  if (openFixSubmissionIds.length > 0) {
    await getPrisma().fixRequest.updateMany({
      where: {
        labSubmissionId: { in: openFixSubmissionIds },
        status: "OPEN",
      },
      data: { status: "RESOLVED" },
    });
  }

  response.status(201).json({
    submission: {
      id: submission.id,
      status: submission.status,
      reviewStatus: submission.reviewStatus,
      version: submission.version,
      codeVersionId: submission.codeVersionId,
      isResubmission,
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
    },
    version: codeVersion,
  });
});

codeLabRouter.patch(
  "/submissions/:id/review",
  requireAuth,
  async (request, response) => {
    const user = getUser(request as AuthenticatedRequest);

    if (!user || !canReview(user)) {
      response.status(403).json({ error: "Teacher or admin access required" });
      return;
    }

    const submission = await getPrisma().labSubmission.findUnique({
      where: { id: String(request.params.id) },
      include: { fixRequests: true },
    });

    if (!submission) {
      response.status(404).json({ error: "Submission not found" });
      return;
    }

    const decisionValue = String(
      request.body?.decision ?? "ACCEPTED",
    ).toUpperCase();
    const decision = Object.values(SubmissionDecision).includes(
      decisionValue as SubmissionDecision,
    )
      ? (decisionValue as SubmissionDecision)
      : SubmissionDecision.ACCEPTED;
    const isFixRequest = decision === SubmissionDecision.FIX_REQUESTED;
    const teacherNote = String(request.body?.teacherNote ?? "");
    const fixReason = String(request.body?.fixReason ?? teacherNote);
    const acceptedReviewStatus =
      decision === SubmissionDecision.REFER ? "REFER" : "ACCEPTED";

    const updated = await getPrisma().labSubmission.update({
      where: { id: submission.id },
      data: {
        status: isFixRequest
          ? LabTaskStatus.FIX_REQUESTED
          : LabTaskStatus.COMPLETED,
        reviewStatus: isFixRequest ? "FIX_REQUESTED" : acceptedReviewStatus,
        teacherNote,
        fixReason: isFixRequest ? fixReason : null,
        reviewerId: user.id,
        reviewedAt: new Date(),
        codeReviews: {
          create: {
            summary:
              teacherNote ||
              (isFixRequest
                ? "Teacher requested corrections for this Code Lab submission."
                : "Teacher accepted this Code Lab submission."),
            issues: isFixRequest
              ? [
                  fixReason ||
                    "Submission requires correction before acceptance.",
                ]
              : [],
            complexity: String(request.body?.complexity ?? "Not assessed"),
            reviewerId: user.id,
          },
        },
        feedback: {
          create: {
            content:
              teacherNote ||
              (isFixRequest ? fixReason : "Submission accepted."),
            decision,
            teacherId: user.id,
            studentId: submission.studentId,
          },
        },
        fixRequests: isFixRequest
          ? {
              create: {
                reason: fixReason || "Teacher requested corrections.",
                aiDraft: request.body?.aiDraft
                  ? String(request.body.aiDraft)
                  : null,
                status: "OPEN",
                teacherId: user.id,
                studentId: submission.studentId,
              },
            }
          : undefined,
      },
      include: {
        ...submissionInclude,
      },
    });

    if (
      !isFixRequest &&
      submission.fixRequests.some((fix) => fix.status === "OPEN")
    ) {
      await getPrisma().fixRequest.updateMany({
        where: { labSubmissionId: submission.id, status: "OPEN" },
        data: { status: "RESOLVED" },
      });
    }

    const refreshed = await getPrisma().labSubmission.findUniqueOrThrow({
      where: { id: submission.id },
      include: submissionInclude,
    });

    response.json({
      submission: serializeSubmission(refreshed),
      review: updated,
    });
  },
);

codeLabRouter.get("/history", requireAuth, async (request, response) => {
  const user = getUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const snippets = await getPrisma().codeSnippet.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      versions: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  response.json({
    snippets: snippets.map(
      (item): CodeLabSnippet => ({
        id: item.id,
        title: item.title,
        language: item.language,
        code: item.code,
        savedAt: item.updatedAt.toISOString(),
        version: item.version,
        result:
          item.lastRun && typeof item.lastRun === "object"
            ? (item.lastRun as unknown as CodeRunResult)
            : undefined,
      }),
    ),
    versions: snippets.flatMap((snippet) =>
      snippet.versions.map(
        (version): CodeLabVersion => ({
          id: version.id,
          snippetId: version.snippetId,
          title: version.title,
          language: version.language,
          code: version.code,
          result: version.result as unknown as CodeRunResult,
          createdAt: version.createdAt.toISOString(),
          version: version.version,
          summary: version.summary,
        }),
      ),
    ),
  });
});

codeLabRouter.post("/history", requireAuth, async (request, response) => {
  const user = getUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const code = String(request.body?.code ?? "");
  const language = String(request.body?.language ?? "javascript");
  const title = String(request.body?.title ?? "Untitled snippet");
  const result =
    request.body?.result && typeof request.body.result === "object"
      ? (request.body.result as CodeRunResult)
      : toLegacyRunResult({
          id: `run-${Date.now()}`,
          language,
          stdout: "Saved without executing on server.",
          stderr: null,
          success: true,
          executionTimeMs: 0,
          testResults: [],
        });
  const existing = await getPrisma().codeSnippet.findFirst({
    where: { ownerId: user.id, title },
    select: { id: true, version: true },
  });
  const version = (existing?.version ?? 0) + 1;
  const snippet = existing
    ? await getPrisma().codeSnippet.update({
        where: { id: existing.id },
        data: {
          language,
          code,
          version,
          lastRun: result as unknown as Prisma.InputJsonValue,
        },
      })
    : await getPrisma().codeSnippet.create({
        data: {
          title,
          language,
          code,
          version,
          lastRun: result as unknown as Prisma.InputJsonValue,
          ownerId: user.id,
        },
      });
  const versionEntry = await getPrisma().codeSnippetVersion.create({
    data: {
      snippetId: snippet.id,
      title,
      language,
      code,
      version,
      result: result as unknown as Prisma.InputJsonValue,
      summary:
        result.status === "success"
          ? "Saved after successful execution."
          : "Saved with execution diagnostics.",
    },
  });

  response.status(201).json({
    snippet: {
      id: snippet.id,
      title: snippet.title,
      language: snippet.language,
      code: snippet.code,
      savedAt: snippet.updatedAt.toISOString(),
      version: snippet.version,
      result,
    } satisfies CodeLabSnippet,
    version: {
      id: versionEntry.id,
      snippetId: versionEntry.snippetId,
      title: versionEntry.title,
      language: versionEntry.language,
      code: versionEntry.code,
      result: versionEntry.result as unknown as CodeRunResult,
      createdAt: versionEntry.createdAt.toISOString(),
      version: versionEntry.version,
      summary: versionEntry.summary,
    } satisfies CodeLabVersion,
  });
});

codeLabRouter.post("/assistant", requireAuth, async (request, response) => {
  const action = String(request.body?.action ?? "explain").toLowerCase();
  const code = String(request.body?.code ?? "");
  const language = String(request.body?.language ?? "javascript");
  const startedAt = Date.now();
  const prompt = [
    `Action: ${action}`,
    `Language: ${language}`,
    "Return an explanation and suggestedCode if code should change.",
    code,
  ].join("\n\n");
  const result = toLegacyRunResult({
    id: `run-${Date.now()}`,
    language,
    stdout: "AI review only. Server execution disabled.",
    stderr: null,
    success: true,
    executionTimeMs: 0,
    testResults: [],
  });
  let aiResponse;

  try {
    aiResponse = await aiModelRouter.run({
      task: "code-doctor",
      prompt,
      context: { action, runResult: result },
    });
  } catch (error) {
    const fallbackAdapter = new MockAIAdapter("code-lab-mock", ["code-doctor"]);
    aiResponse = await fallbackAdapter.run({
      task: "code-doctor",
      prompt,
      context: {
        action,
        runResult: result,
        fallbackReason:
          error instanceof Error ? error.message : "AI code assistant failed",
      },
    });
  }

  void getPrisma().aIRequestLog.create({
    data: {
      userId: getUser(request as AuthenticatedRequest)?.id,
      task: "code-doctor",
      model: aiResponse.model,
      mode: aiResponse.mode,
      prompt,
      response: aiResponse.output as Prisma.InputJsonValue,
      executionTime: Date.now() - startedAt,
    },
  });

  response.json({
    action,
    note: formatAssistantNote(aiResponse.output),
    suggestedCode:
      typeof aiResponse.output.suggestedCode === "string"
        ? aiResponse.output.suggestedCode
        : undefined,
    result,
    model: aiResponse.model,
    mode: aiResponse.mode,
  });
});
