/**
 * Nexora OS — Production Central AI Router
 */

import {
  AIRequestOptions,
  StandardAIResponse,
  AIProviderId,
  AITaskCategory,
} from "../types/ai.types";
import { getRouteMappingForTask } from "../configuration/ai.config";
import { GeminiProvider } from "../providers/gemini.provider";
import { GroqProvider } from "../providers/groq.provider";
import { OpenRouterProvider } from "../providers/openrouter.provider";
import { BaseAIProvider } from "../providers/base.provider";
import { PromptBuilderService } from "../services/prompt-builder.service";
import { FallbackManagerService } from "../services/fallback-manager.service";
import { ResponseFormatterService } from "../services/response-formatter.service";
import { UsageLoggerService } from "../services/usage-logger.service";
import { RateLimiterService } from "../services/rate-limiter.service";
import { validateAIRequest } from "../utils/sanitizer";

export class AIRouter {
  private static geminiProvider = new GeminiProvider();
  private static groqProvider = new GroqProvider();
  private static openRouterProvider = new OpenRouterProvider();

  private static providerMap: Record<AIProviderId, BaseAIProvider> = {
    gemini: AIRouter.geminiProvider,
    groq: AIRouter.groqProvider,
    openrouter: AIRouter.openRouterProvider,
  };

  /**
   * Main entry point for executing any AI task inside Nexora OS.
   */
  public static async execute(options: AIRequestOptions): Promise<StandardAIResponse> {
    const startTime = Date.now();

    // 1. Rate Limiting Check
    const rateLimit = RateLimiterService.isAllowed(
      options.rateLimitKey || options.userId || "global",
    );
    if (!rateLimit.allowed) {
      const errorMsg = `Rate limit exceeded. Please wait ${Math.ceil((rateLimit.retryAfterMs || 1000) / 1000)} seconds.`;
      return ResponseFormatterService.formatError(errorMsg, 0, "none");
    }

    // 2. Validate Input
    const validation = validateAIRequest(options.prompt);
    if (!validation.valid) {
      return ResponseFormatterService.formatError(validation.reason || "Invalid request.", 0, "none");
    }

    // 3. Build Prompts
    const { prompt: cleanPrompt, systemPrompt } = PromptBuilderService.buildPrompt(
      options.prompt,
      options.task,
      options.systemPrompt
    );

    const preparedOptions: AIRequestOptions = {
      ...options,
      prompt: cleanPrompt,
      systemPrompt,
    };

    // 4. Resolve Provider Chain (Primary + Fallbacks)
    const providerChain = this.resolveProviderChain(options.task, options.preferredProvider);

    if (providerChain.length === 0) {
      return ResponseFormatterService.formatError(
        "No AI providers are configured with valid API keys.",
        Date.now() - startTime,
        "none"
      );
    }

    // 5. Execute with Automatic Provider Fallback
    try {
      const { response: providerResponse, fallbackUsed } = await FallbackManagerService.executeWithFallback(
        providerChain,
        preparedOptions
      );

      const formatted = ResponseFormatterService.formatSuccess(
        providerResponse,
        fallbackUsed ? "Response generated successfully using fallback AI provider." : "Response generated successfully."
      );

      // 6. Log Request Data to Database & Console
      await UsageLoggerService.logRequest({
        task: options.task,
        provider: providerResponse.provider,
        model: providerResponse.model,
        mode: "api",
        status: fallbackUsed ? "fallback_success" : "success",
        prompt: cleanPrompt,
        response: providerResponse.rawResponse,
        promptLength: cleanPrompt.length,
        responseLength: providerResponse.rawResponse.length,
        executionTime: providerResponse.executionTime,
        promptTokens: providerResponse.tokens.promptTokens,
        completionTokens: providerResponse.tokens.completionTokens,
        totalTokens: providerResponse.tokens.totalTokens,
        moduleName: options.moduleName || "General",
        userId: options.userId,
      });

      return formatted;
    } catch (err: unknown) {
      const executionTime = Date.now() - startTime;
      const normalizedError = err instanceof Error ? err : String(err);
      const errorResponse = ResponseFormatterService.formatError(normalizedError, executionTime, providerChain[0]?.id || "none");

      // Log failure to database
      await UsageLoggerService.logRequest({
        task: options.task,
        provider: providerChain[0]?.id || "none",
        model: "none",
        mode: "api",
        status: "error",
        prompt: cleanPrompt,
        response: { error: errorResponse.error },
        promptLength: cleanPrompt.length,
        responseLength: 0,
        executionTime,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        moduleName: options.moduleName || "General",
        userId: options.userId,
      });

      return errorResponse;
    }
  }

  /**
   * Determine ordered list of providers for a given task.
   */
  private static resolveProviderChain(task: AITaskCategory, preferred?: AIProviderId): BaseAIProvider[] {
    const routeMapping = getRouteMappingForTask(task);
    const orderedIds: AIProviderId[] = [];

    if (preferred && this.providerMap[preferred]?.isConfigured()) {
      orderedIds.push(preferred);
    }

    if (!orderedIds.includes(routeMapping.primaryProvider)) {
      orderedIds.push(routeMapping.primaryProvider);
    }

    for (const fb of routeMapping.fallbackProviders) {
      if (!orderedIds.includes(fb)) {
        orderedIds.push(fb);
      }
    }

    // Return instances that have API keys configured
    return orderedIds
      .map((id) => this.providerMap[id])
      .filter((provider) => provider && provider.isConfigured());
  }
}
