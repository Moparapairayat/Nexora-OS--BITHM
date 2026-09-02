/**
 * Nexora OS — Backend AI Router API Endpoint
 * POST /api/ai
 */

import { NextRequest, NextResponse } from "next/server";
import { AIRouter } from "@/lib/ai";
import { AIRequestOptions, AITaskCategory } from "@/lib/ai/types/ai.types";
import { getRateLimitIdentifier, getSessionUser } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { task, prompt, systemPrompt, moduleName, preferredProvider, temperature, maxTokens } = body;
    const sessionUser = await getSessionUser(req);

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Prompt string is required.",
          provider: "none",
          model: "none",
          response: "",
          tokens: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          executionTime: 0,
          timestamp: new Date().toISOString(),
          error: "Prompt string is required.",
        },
        { status: 400 }
      );
    }

    const taskCategory: AITaskCategory = task || "general";

    const options: AIRequestOptions = {
      task: taskCategory,
      prompt,
      systemPrompt,
      userId: sessionUser?.id,
      rateLimitKey: getRateLimitIdentifier(req, sessionUser),
      moduleName: moduleName || "General",
      preferredProvider,
      temperature,
      maxTokens,
    };

    const result = await AIRouter.execute(options);

    const httpStatus = result.success ? 200 : result.error?.includes("Rate limit") ? 429 : 500;

    return NextResponse.json(result, { status: httpStatus });
  } catch (error: unknown) {
    console.error("[API /api/ai] Unhandled exception:", error);
    const message = error instanceof Error ? error.message : "Unknown internal error.";
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error processing AI request.",
        provider: "none",
        model: "none",
        response: "",
        tokens: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        executionTime: 0,
        timestamp: new Date().toISOString(),
        error: message,
      },
      { status: 500 }
    );
  }
}
