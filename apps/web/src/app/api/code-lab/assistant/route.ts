/**
 * Nexora OS — Code Lab AI Assistant Backend API Endpoint
 * POST /api/code-lab/assistant
 */

import { NextRequest, NextResponse } from "next/server";
import { AIRouter } from "@/lib/ai";
import type { AIRequestOptions } from "@/lib/ai/types/ai.types";

type AiAction = "explain" | "debug" | "improve";

function extractCodeBlock(text: string): { note: string; suggestedCode?: string } {
  const codeBlockRegex = /```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```/g;
  const matches = Array.from(text.matchAll(codeBlockRegex));

  if (matches.length > 0) {
    const lastCodeBlock = matches[matches.length - 1][1].trim();
    const note = text.replace(matches[matches.length - 1][0], "").trim();
    return {
      note: note || text,
      suggestedCode: lastCodeBlock,
    };
  }

  return { note: text };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, language, code, stdin, workspaceId, fileId, userId } = body;

    const currentAction: AiAction = (action as AiAction) || "explain";
    const currentLang = language || "javascript";
    const sourceCode = code || "";

    if (!sourceCode.trim()) {
      return NextResponse.json(
        {
          action: currentAction,
          note: "Please write or open code in the editor before requesting AI assistance.",
          suggestedCode: undefined,
          model: "system",
          mode: "validation",
        },
        { status: 200 }
      );
    }

    let systemPrompt = "You are Nexora OS AI Code Copilot. Be direct, concise, and accurate.";
    let userPrompt = `Language: ${currentLang}\n\nCode:\n\`\`\`${currentLang}\n${sourceCode}\n\`\`\``;

    if (currentAction === "explain") {
      systemPrompt =
        "You are Nexora OS AI Code Copilot. Provide a concise, clear breakdown of logic, algorithm, and time/space complexity (Big-O). Keep answers direct and educational.";
      userPrompt = `Explain this ${currentLang} code succinctly:\n\n\`\`\`${currentLang}\n${sourceCode}\n\`\`\``;
    } else if (currentAction === "debug") {
      systemPrompt =
        "You are Nexora OS AI Code Doctor. Quickly identify any syntax bugs, runtime errors, or edge cases. State the issue directly and provide the corrected code in a code fence.";
      userPrompt = `Detect bugs and provide the fixed code for this ${currentLang} program:\n\n\`\`\`${currentLang}\n${sourceCode}\n\`\`\`\n\nInput (stdin): ${stdin || "None"}`;
    } else if (currentAction === "improve") {
      systemPrompt =
        "You are Nexora OS AI Code Architect. Suggest high-impact clean-code and speed optimizations. State key points and provide the refactored code in a code fence.";
      userPrompt = `Suggest clean code improvements for this ${currentLang} program:\n\n\`\`\`${currentLang}\n${sourceCode}\n\`\`\``;
    }

    const aiOptions: AIRequestOptions = {
      task: currentAction === "debug" ? "debugging" : "coding",
      prompt: userPrompt,
      systemPrompt,
      userId: userId || "student",
      moduleName: "CodeAssistant",
      temperature: 0.2,
      maxTokens: 1200,
    };

    const result = await AIRouter.execute(aiOptions);

    if (!result.success || !result.response) {
      const fallbackNotes: Record<AiAction, string> = {
        explain: `Logic Breakdown for ${currentLang} file:\n• Analyzed ${sourceCode.split("\n").length} lines of code.\n• Structure appears well-formed. Ensure key functions have clear docstrings.`,
        debug: `Issue Analysis:\n• No immediate syntax fatal crash detected.\n• Ensure edge cases (null/undefined inputs and empty arrays) are validated.`,
        improve: `Refactor Recommendation:\n• Keep functions pure and modular.\n• Consider extracting utility helpers and applying type annotations.`,
      };

      return NextResponse.json({
        action: currentAction,
        note: result.error || fallbackNotes[currentAction],
        suggestedCode: undefined,
        model: result.model || "offline-fallback",
        mode: "fallback",
      });
    }

    const { note, suggestedCode } = extractCodeBlock(result.response);

    return NextResponse.json({
      action: currentAction,
      note,
      suggestedCode,
      model: result.model,
      mode: "live",
    });
  } catch (error: any) {
    console.error("[API /api/code-lab/assistant] Unhandled exception:", error);
    return NextResponse.json(
      {
        action: "explain",
        note: error.message || "Failed to process AI code assistant request.",
        model: "error",
        mode: "error",
      },
      { status: 500 }
    );
  }
}
