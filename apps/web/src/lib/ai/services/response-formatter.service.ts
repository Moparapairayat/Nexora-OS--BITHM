/**
 * Nexora OS — Response Formatter Service
 */

import { AIProviderResponse, StandardAIResponse, AIProviderId } from "../types/ai.types";

export class ResponseFormatterService {
  public static formatSuccess(
    response: AIProviderResponse,
    message: string = "AI response generated successfully."
  ): StandardAIResponse {
    return {
      success: true,
      message,
      provider: response.provider,
      model: response.model,
      response: response.rawResponse,
      tokens: response.tokens,
      executionTime: response.executionTime,
      timestamp: new Date().toISOString(),
    };
  }

  public static formatError(
    error: Error | string,
    executionTime: number = 0,
    attemptedProvider: AIProviderId | "none" = "none"
  ): StandardAIResponse {
    const errorMsg = typeof error === "string" ? error : error.message;

    return {
      success: false,
      message: "Failed to generate AI response across all providers.",
      provider: attemptedProvider,
      model: "none",
      response: "",
      tokens: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      executionTime,
      timestamp: new Date().toISOString(),
      error: errorMsg,
    };
  }
}
