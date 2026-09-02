/**
 * Nexora OS — Production Code Execution Router
 */

import { ExecutionInput, StandardExecutionResult } from "../types/execution.types";
import { validateExecutionInput } from "../validators/input.validator";
import { ExecutionRateLimiterService } from "../services/rate-limiter.service";
import { ExecutionFactory } from "./execution.factory";
import { TestCaseEngineService } from "../services/test-case-engine.service";
import { ExecutionLoggerService } from "../services/execution-logger.service";
import { OutputParser } from "../parsers/output.parser";
import { normalizeLanguage } from "./language.resolver";

export class ExecutionRouter {
  /**
   * Main entry point for executing code payload.
   */
  public static async execute(input: ExecutionInput): Promise<StandardExecutionResult> {
    const startTime = Date.now();

    // 1. Rate Limiting Check
    const rateLimit = ExecutionRateLimiterService.isAllowed(
      input.rateLimitKey || input.userId || "anonymous",
    );
    if (!rateLimit.allowed) {
      const retrySec = Math.ceil((rateLimit.retryAfterMs || 1000) / 1000);
      return OutputParser.formatErrorResult(`Execution rate limit reached. Please wait ${retrySec}s before running again.`, normalizeLanguage(input.language), 0);
    }

    // 2. Input Validation
    const validation = validateExecutionInput(input);
    if (!validation.valid) {
      return OutputParser.formatErrorResult(validation.reason || "Invalid code execution request.", normalizeLanguage(input.language), 0);
    }

    // 3. Resolve Provider Chain (Piston -> Judge0)
    const providerChain = ExecutionFactory.getFallbackChain(input.preferredProvider);

    let lastResult: StandardExecutionResult | null = null;

    for (const provider of providerChain) {
      try {
        console.log(`[ExecutionRouter] Attempting provider "${provider.name}" (${provider.id}) for language "${input.language}"...`);

        let result: StandardExecutionResult;
        if (input.testCases && input.testCases.length > 0) {
          result = await TestCaseEngineService.runTestCases(provider, input);
        } else {
          result = await provider.executeCode(input);
        }

        const isWhitelistError =
          result.errorMessage?.includes("whitelist") ||
          result.errorMessage?.includes("401") ||
          result.stderr?.includes("whitelist") ||
          result.stderr?.includes("401");

        // If execution succeeded without 401/whitelist errors, use this result
        if (result.success || (!isWhitelistError && result.status !== "error")) {
          await ExecutionLoggerService.logExecution(input, result);
          return result;
        }

        lastResult = result;
        console.warn(`[ExecutionRouter] Provider "${provider.name}" returned error (${result.errorMessage || result.stderr}). Triggering failover...`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[ExecutionRouter] Provider "${provider.name}" exception:`, message);
      }
    }

    const executionTimeMs = Date.now() - startTime;
    const errorResult = lastResult || OutputParser.formatErrorResult("All execution providers failed.", normalizeLanguage(input.language), executionTimeMs);
    await ExecutionLoggerService.logExecution(input, errorResult);
    return errorResult;
  }
}
