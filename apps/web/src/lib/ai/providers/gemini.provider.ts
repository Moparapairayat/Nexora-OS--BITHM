/**
 * Nexora OS — Google Gemini API Provider
 */

import { BaseAIProvider } from "./base.provider";
import { AIProviderId, AIProviderResponse, AIRequestOptions } from "../types/ai.types";
import { AI_CONFIG } from "../configuration/ai.config";

export class GeminiProvider extends BaseAIProvider {
  public readonly id: AIProviderId = "gemini";
  public readonly name: string = AI_CONFIG.providers.gemini.name;

  private getApiKey(): string {
    // Never fall back to a NEXT_PUBLIC_ variable here — Next.js inlines those
    // into the client bundle, which would ship this secret key to the browser.
    return process.env.GEMINI_API_KEY || "";
  }

  public isConfigured(): boolean {
    return !!this.getApiKey();
  }

  public async generateContent(options: AIRequestOptions): Promise<AIProviderResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }

    const startTime = Date.now();
    const modelsToTry = [
      AI_CONFIG.providers.gemini.models.primary,
      AI_CONFIG.providers.gemini.models.fallback || "gemini-2.0-flash",
    ];

    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        const url = `${AI_CONFIG.providers.gemini.baseUrl}/models/${model}:generateContent?key=${apiKey}`;

        const systemInstructionText = options.systemPrompt ? `${options.systemPrompt}\n\n` : "";
        const fullPromptText = `${systemInstructionText}${options.prompt}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.providers.gemini.timeoutMs);

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: fullPromptText }],
              },
            ],
            generationConfig: {
              temperature: options.temperature ?? AI_CONFIG.security.defaultTemperature,
              maxOutputTokens: options.maxTokens ?? AI_CONFIG.security.maxResponseTokens,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini API HTTP ${response.status} (${model}): ${errText}`);
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
          throw new Error(`Gemini response returned empty text for model ${model}`);
        }

        const executionTime = Date.now() - startTime;
        const promptTokens = data.usageMetadata?.promptTokenCount || Math.ceil(fullPromptText.length / 4);
        const completionTokens = data.usageMetadata?.candidatesTokenCount || Math.ceil(generatedText.length / 4);

        return {
          rawResponse: generatedText,
          provider: this.id,
          model,
          tokens: {
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
          },
          executionTime,
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`[GeminiProvider] Attempt with model failed:`, lastError.message);
      }
    }

    throw lastError || new Error("GeminiProvider: All model attempts failed.");
  }
}
