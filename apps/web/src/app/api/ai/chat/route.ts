/**
 * Nexora OS — Backend AI Chat API Endpoint
 * POST /api/ai/chat
 */

import { NextRequest, NextResponse } from "next/server";
import { AIRouter, ConversationContextService } from "@/lib/ai";
import { AIRequestOptions, ChatMessage } from "@/lib/ai/types/ai.types";
import { getRateLimitIdentifier, getSessionUser } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, prompt, systemPrompt, moduleName } = body;
    const sessionUser = await getSessionUser(req);

    const chatHistory: ChatMessage[] = Array.isArray(messages) ? messages : [];
    const userPrompt = prompt || (chatHistory.length > 0 ? chatHistory[chatHistory.length - 1].content : "");

    if (!userPrompt) {
      return NextResponse.json(
        {
          success: false,
          message: "Prompt or chat messages are required.",
          provider: "none",
          model: "none",
          response: "",
          tokens: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          executionTime: 0,
          timestamp: new Date().toISOString(),
          error: "No prompt text provided.",
        },
        { status: 400 }
      );
    }

    const fittedMessages = ConversationContextService.fitMessageHistory(chatHistory, 6000);

    const options: AIRequestOptions = {
      task: "general",
      prompt: userPrompt,
      systemPrompt,
      messages: fittedMessages,
      userId: sessionUser?.id,
      rateLimitKey: getRateLimitIdentifier(req, sessionUser),
      moduleName: moduleName || "PandaChat",
    };

    const result = await AIRouter.execute(options);

    const httpStatus = result.success ? 200 : result.error?.includes("Rate limit") ? 429 : 500;

    return NextResponse.json(result, { status: httpStatus });
  } catch (error: unknown) {
    console.error("[API /api/ai/chat] Unhandled exception:", error);
    const message = error instanceof Error ? error.message : "Unknown error.";
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error processing chat request.",
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
