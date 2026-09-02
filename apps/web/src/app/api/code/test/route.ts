/**
 * Nexora OS — Code Test Cases Execution Backend API Endpoint
 * POST /api/code/test
 */

import { NextRequest, NextResponse } from "next/server";
import { ExecutionRouter, ExecutionInput } from "@/lib/execution";
import { getRateLimitIdentifier, getSessionUser } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, code, files, testCases, timeoutMs, workspaceId, preferredProvider } = body;

    const sessionUser = await getSessionUser(req);

    const input: ExecutionInput = {
      language,
      code,
      files,
      testCases,
      timeoutMs,
      workspaceId,
      userId: sessionUser?.id || "anonymous",
      rateLimitKey: getRateLimitIdentifier(req, sessionUser),
      preferredProvider,
    };

    const result = await ExecutionRouter.execute(input);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("[API /api/code/test] Unhandled exception:", error);
    const message = error instanceof Error ? error.message : "Internal server error running test suite.";
    return NextResponse.json(
      {
        success: false,
        stdout: "",
        stderr: message,
        status: "error",
        executionTimeMs: 0,
        provider: "piston",
        language: "c",
        errorMessage: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
