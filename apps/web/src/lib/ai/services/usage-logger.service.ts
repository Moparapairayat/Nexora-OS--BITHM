/**
 * Nexora OS — AI Usage Logger Service
 */

import { AIRequestLogData } from "../types/ai.types";
import { prisma } from "@/lib/prisma";

export class UsageLoggerService {
  public static async logRequest(data: AIRequestLogData): Promise<void> {
    try {
      // Log to console in structured format
      console.log(
        `[AI_LOGGER] task="${data.task}" provider="${data.provider}" model="${data.model}" status="${data.status}" latencyMs=${data.executionTime} tokens=${data.totalTokens}`
      );

      // Attempt to save to PostgreSQL database
      if (prisma && prisma.aIRequestLog) {
        await prisma.aIRequestLog.create({
          data: {
            task: data.task,
            provider: data.provider,
            model: data.model,
            mode: data.mode || "api",
            status: data.status,
            prompt: data.prompt.substring(0, 4000), // Protect DB from huge prompts
            response: typeof data.response === "string" ? { text: data.response.substring(0, 8000) } : data.response,
            promptLength: data.promptLength,
            responseLength: data.responseLength,
            executionTime: data.executionTime,
            promptTokens: data.promptTokens,
            completionTokens: data.completionTokens,
            totalTokens: data.totalTokens,
            moduleName: data.moduleName || "General",
            userId: data.userId || null,
          },
        });
      }
    } catch (err: any) {
      console.warn("[UsageLoggerService] Failed to persist AI request log to PostgreSQL:", err.message);
    }
  }
}
