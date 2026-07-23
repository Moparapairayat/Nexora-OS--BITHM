/**
 * Nexora OS — Multi-Provider Fallback Manager Service
 */

import { BaseAIProvider } from "../providers/base.provider";
import { AIProviderId, AIProviderResponse, AIRequestOptions } from "../types/ai.types";

export class FallbackManagerService {
  /**
   * Execute request with fallback across an ordered array of providers.
   */
  public static async executeWithFallback(
    providers: BaseAIProvider[],
    options: AIRequestOptions
  ): Promise<{ response: AIProviderResponse; fallbackUsed: boolean; attemptedProviders: AIProviderId[] }> {
    const attemptedProviders: AIProviderId[] = [];
    let lastError: Error | null = null;

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      attemptedProviders.push(provider.id);

      if (!provider.isConfigured()) {
        console.warn(`[FallbackManager] Provider "${provider.name}" (${provider.id}) is not configured (missing API Key). Skipping...`);
        continue;
      }

      try {
        console.log(`[FallbackManager] Attempting provider "${provider.name}" (${provider.id}) for task "${options.task}"...`);
        const result = await provider.generateContent(options);
        const fallbackUsed = i > 0;
        return { response: result, fallbackUsed, attemptedProviders };
      } catch (err: any) {
        lastError = err;
        console.error(`[FallbackManager] Provider "${provider.name}" (${provider.id}) failed:`, err.message);
      }
    }

    throw lastError || new Error(`All configured AI providers failed. Attempted: ${attemptedProviders.join(", ")}`);
  }
}
