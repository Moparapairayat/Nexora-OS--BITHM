/**
 * Nexora OS — Code Execution Output Parser & Formatter
 */

import { PistonExecuteResponse, StandardExecutionResult, SupportedLanguage, ExecutionProviderId } from "../types/execution.types";
import { sanitizeStdout } from "../validators/input.validator";

export class OutputParser {
  public static parsePistonResponse(
    response: PistonExecuteResponse,
    language: SupportedLanguage,
    executionTimeMs: number,
    provider: ExecutionProviderId = "piston"
  ): StandardExecutionResult {
    const compileOutput = response.compile?.stderr || response.compile?.stdout || "";
    const runStdout = sanitizeStdout(response.run?.stdout || "");
    const runStderr = sanitizeStdout(response.run?.stderr || "");
    const exitCode = response.run?.code ?? response.compile?.code ?? 0;

    let status: StandardExecutionResult["status"] = "success";
    let errorMessage: string | undefined;

    if (compileOutput && exitCode !== 0) {
      status = "compile_error";
      errorMessage = compileOutput;
    } else if (response.run?.signal === "SIGKILL" || response.run?.signal === "SIGTERM") {
      status = "time_limit_exceeded";
      errorMessage = "Execution timed out (Time Limit Exceeded).";
    } else if (exitCode !== 0 || runStderr) {
      status = "runtime_error";
      errorMessage = runStderr || `Process exited with code ${exitCode}`;
    }

    return {
      success: status === "success",
      stdout: runStdout,
      stderr: runStderr,
      compileOutput,
      status,
      exitCode,
      executionTimeMs,
      provider,
      language,
      version: response.version,
      errorMessage,
      timestamp: new Date().toISOString(),
    };
  }

  public static formatErrorResult(
    error: Error | string,
    language: SupportedLanguage = "c",
    executionTimeMs: number = 0,
    provider: ExecutionProviderId = "piston"
  ): StandardExecutionResult {
    const errorMsg = typeof error === "string" ? error : error.message;

    return {
      success: false,
      stdout: "",
      stderr: errorMsg,
      status: "error",
      exitCode: 1,
      executionTimeMs,
      provider,
      language,
      errorMessage: errorMsg,
      timestamp: new Date().toISOString(),
    };
  }
}
