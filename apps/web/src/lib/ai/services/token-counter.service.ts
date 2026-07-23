/**
 * Nexora OS — Token Counter Service
 */

import { TokenUsage } from "../types/ai.types";

export class TokenCounterService {
  /**
   * Estimate token count based on string length (approx 4 chars per token).
   */
  public static estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  public static calculateUsage(prompt: string, completion: string): TokenUsage {
    const promptTokens = this.estimateTokens(prompt);
    const completionTokens = this.estimateTokens(completion);
    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
  }
}
