/**
 * Nexora OS — Code Test Cases Execution Backend API Endpoint
 * POST /api/code/test
 */

import { NextRequest, NextResponse } from "next/server";
import { ExecutionRouter, ExecutionInput } from "@/lib/execution";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, code, files, testCases, timeoutMs, workspaceId, userId, preferredProvider } = body;

    const input: ExecutionInput = {
      language,
      code,
      files,
      testCases,
      timeoutMs,
      workspaceId,
      userId: userId || "anonymous",
      preferredProvider,
    };

    const result = await ExecutionRouter.execute(input);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[API /api/code/test] Unhandled exception:", error);
    return NextResponse.json(
      {
        success: false,
        stdout: "",
        stderr: error.message || "Internal server error running test suite.",
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
