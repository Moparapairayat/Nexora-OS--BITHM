/**
 * Nexora OS — Groq Cloud API Provider
 */

import { BaseAIProvider } from "./base.provider";
import { AIProviderId, AIProviderResponse, AIRequestOptions } from "../types/ai.types";
import { AI_CONFIG } from "../configuration/ai.config";

export class GroqProvider extends BaseAIProvider {
  public readonly id: AIProviderId = "groq";
  public readonly name: string = AI_CONFIG.providers.groq.name;

  private getApiKey(): string {
    // Never fall back to a NEXT_PUBLIC_ variable here — Next.js inlines those
    // into the client bundle, which would ship this secret key to the browser.
    return process.env.GROQ_API_KEY || "";
  }

  public isConfigured(): boolean {
    return !!this.getApiKey();
  }

  public async generateContent(options: AIRequestOptions): Promise<AIProviderResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not configured in environment variables.");
    }

    const startTime = Date.now();
    const model = AI_CONFIG.providers.groq.models.primary;

    const messages = [];
    if (options.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }

    if (options.messages && options.messages.length > 0) {
      messages.push(...options.messages);
    } else {
      messages.push({ role: "user", content: options.prompt });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.providers.groq.timeoutMs);

    try {
      const response = await fetch(`${AI_CONFIG.providers.groq.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? AI_CONFIG.security.defaultTemperature,
          max_tokens: options.maxTokens ?? AI_CONFIG.security.maxResponseTokens,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content;

      if (!generatedText) {
        throw new Error("Groq API returned empty message content.");
      }

      const executionTime = Date.now() - startTime;
      const promptTokens = data.usage?.prompt_tokens || Math.ceil(options.prompt.length / 4);
      const completionTokens = data.usage?.completion_tokens || Math.ceil(generatedText.length / 4);

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
      clearTimeout(timeoutId);
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`GroqProvider Error: ${message}`);
    }
  }
}
