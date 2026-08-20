/**
 * Nexora OS — Judge0 CE Execution Provider
 */

import { BaseExecutionProvider } from "./base.provider";
import { ExecutionInput, ExecutionProviderId, StandardExecutionResult, SupportedLanguage } from "../types/execution.types";
import { OutputParser } from "../parsers/output.parser";
import { normalizeLanguage } from "../router/language.resolver";

// Judge0 Language ID Mapping
const JUDGE0_LANGUAGE_IDS: Record<SupportedLanguage, number> = {
  c: 50,          // C (GCC 9.2.0)
  cpp: 54,        // C++ (GCC 9.2.0)
  java: 62,       // Java (OpenJDK 13.0.1)
  python: 71,     // Python (3.8.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  typescript: 74, // TypeScript (3.7.4)
  html: 0,
};

function encodeBase64(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf-8").toString("base64");
  }
  return btoa(unescape(encodeURIComponent(str)));
}

function decodeBase64(str: string | null | undefined): string {
  if (!str) return "";
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(str, "base64").toString("utf-8");
    }
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return str;
  }
}

export class Judge0Provider extends BaseExecutionProvider {
  public readonly id: ExecutionProviderId = "judge0";
  public readonly name: string = "Judge0 CE Execution API";

  public isConfigured(): boolean {
    return true;
  }

  public async executeCode(input: ExecutionInput): Promise<StandardExecutionResult> {
    const startTime = Date.now();
    const lang = normalizeLanguage(input.language);
    const languageId = JUDGE0_LANGUAGE_IDS[lang];

    if (!languageId) {
      return OutputParser.formatErrorResult(`Language '${input.language}' is not supported by Judge0Provider.`, lang, 0, this.id);
    }

    const code = input.code || (input.files && input.files[0]?.content) || "";
    const payload = {
      language_id: languageId,
      source_code: encodeBase64(code),
      stdin: encodeBase64(input.stdin || ""),
    };

    const timeoutMs = input.timeoutMs || 8000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch("https://ce.judge0.com/submissions?base64_encoded=true&wait=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Judge0 API HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const executionTimeMs = Date.now() - startTime;
      const stdout = decodeBase64(data.stdout);
      const stderr = decodeBase64(data.stderr) || decodeBase64(data.compile_output);
      const compileOutput = decodeBase64(data.compile_output);
      const isSuccess = data.status?.id === 3; // 3 = Accepted in Judge0

      let status: StandardExecutionResult["status"] = isSuccess ? "success" : "runtime_error";
      if (data.status?.id === 6) status = "compile_error"; // 6 = Compilation Error
      if (data.status?.id === 5) status = "time_limit_exceeded"; // 5 = Time Limit Exceeded

      return {
        success: isSuccess,
        stdout,
        stderr,
        compileOutput,
        status,
        exitCode: isSuccess ? 0 : 1,
        executionTimeMs: Math.round(parseFloat(data.time || "0") * 1000) || executionTimeMs,
        memoryUsageKb: data.memory || 0,
        provider: this.id,
        language: lang,
        errorMessage: isSuccess ? undefined : decodeBase64(data.message) || data.status?.description || stderr,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const executionTimeMs = Date.now() - startTime;
      return OutputParser.formatErrorResult(err.message || "Judge0 API request failed.", lang, executionTimeMs, this.id);
    }
  }
}

