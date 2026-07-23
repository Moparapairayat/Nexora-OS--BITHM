/**
 * Nexora OS — Code Execution Backend API Endpoint
 * POST /api/code/execute
 */

import { NextRequest, NextResponse } from "next/server";
import { ExecutionRouter, ExecutionInput } from "@/lib/execution";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, code, files, stdin, timeoutMs, workspaceId, userId, preferredProvider } = body;

    const input: ExecutionInput = {
      language,
      code,
      files,
      stdin,
      timeoutMs,
      workspaceId,
      userId: userId || "anonymous",
      preferredProvider,
    };

    const result = await ExecutionRouter.execute(input);

    const httpStatus = result.success ? 200 : result.stderr.includes("rate limit") ? 429 : 200;

    return NextResponse.json(result, { status: httpStatus });
  } catch (error: any) {
    console.error("[API /api/code/execute] Unhandled exception:", error);
    return NextResponse.json(
      {
        success: false,
        stdout: "",
        stderr: error.message || "Internal server error executing code.",
        status: "error",
        executionTimeMs: 0,
        provider: "piston",
        language: "c",
        errorMessage: error.message || "Internal error.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
