/**
 * Nexora OS — Piston API Execution Provider
 */

import { BaseExecutionProvider } from "./base.provider";
import { ExecutionInput, ExecutionProviderId, StandardExecutionResult } from "../types/execution.types";
import { EXECUTION_CONFIG } from "../config/execution.config";
import { OutputParser } from "../parsers/output.parser";
import { normalizeLanguage } from "../router/language.resolver";

export class PistonProvider extends BaseExecutionProvider {
  public readonly id: ExecutionProviderId = "piston";
  public readonly name: string = "Piston Code Execution API v2";

  public isConfigured(): boolean {
    return !!EXECUTION_CONFIG.pistonApiUrl;
  }

  public async executeCode(input: ExecutionInput): Promise<StandardExecutionResult> {
    const startTime = Date.now();
    const normalizedLang = normalizeLanguage(input.language);

    if (normalizedLang === "html") {
      return OutputParser.formatErrorResult("HTML/CSS execution is rendered locally in the sandboxed preview component.", "html", 0, this.id);
    }

    const runtime = EXECUTION_CONFIG.languageRuntimes[normalizedLang as keyof typeof EXECUTION_CONFIG.languageRuntimes];
    if (!runtime) {
      return OutputParser.formatErrorResult(`Language '${input.language}' is not supported by PistonProvider.`, normalizedLang, 0, this.id);
    }

    const mainCode = input.code || (input.files && input.files[0]?.content) || "";
    const files = input.files && input.files.length > 0
      ? input.files.map((f) => ({ name: f.name, content: f.content }))
      : [{ name: runtime.mainFileName, content: mainCode }];

    const payload = {
      language: runtime.pistonLanguage,
      version: runtime.version,
      files,
      stdin: input.stdin || "",
    };

    const timeoutMs = input.timeoutMs || EXECUTION_CONFIG.defaultTimeoutMs;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs + 2000);

    try {
      const response = await fetch(`${EXECUTION_CONFIG.pistonApiUrl}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Piston API HTTP ${response.status}: ${errBody}`);
      }

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      return OutputParser.parsePistonResponse(data, normalizedLang, executionTime, this.id);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const executionTime = Date.now() - startTime;
      const errorMsg =
        err instanceof Error
          ? err.name === "AbortError"
            ? `Execution timed out after ${timeoutMs}ms.`
            : err.message
          : "Piston API request failed.";
      return OutputParser.formatErrorResult(errorMsg, normalizedLang, executionTime, this.id);
    }
  }
}
