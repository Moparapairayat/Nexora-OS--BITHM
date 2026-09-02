/**
 * Nexora OS — Code Execution Backend API Endpoint
 * POST /api/code/execute
 */

import { NextRequest, NextResponse } from "next/server";
import { ExecutionRouter, ExecutionInput } from "@/lib/execution";
import { getRateLimitIdentifier, getSessionUser } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, code, files, stdin, timeoutMs, workspaceId, preferredProvider } = body;

    // userId is never taken from the client body: it doubles as the
    // ownerId attributed to the persisted CodeRun record, so an unverified
    // value would let anyone attribute (or rate-limit-dodge) runs under an
    // arbitrary user id.
    const sessionUser = await getSessionUser(req);

    const input: ExecutionInput = {
      language,
      code,
      files,
      stdin,
      timeoutMs,
      workspaceId,
      userId: sessionUser?.id || "anonymous",
      rateLimitKey: getRateLimitIdentifier(req, sessionUser),
      preferredProvider,
    };

    const result = await ExecutionRouter.execute(input);

    const httpStatus = result.success ? 200 : result.stderr.includes("rate limit") ? 429 : 200;

    return NextResponse.json(result, { status: httpStatus });
  } catch (error: unknown) {
    console.error("[API /api/code/execute] Unhandled exception:", error);
    const message = error instanceof Error ? error.message : "Internal server error executing code.";
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
