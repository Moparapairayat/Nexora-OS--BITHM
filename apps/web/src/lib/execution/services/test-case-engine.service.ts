/**
 * Nexora OS — Test Case Engine
 */

import { BaseExecutionProvider } from "../providers/base.provider";
import { ExecutionInput, TestCaseInput, TestCaseResult, StandardExecutionResult, SupportedLanguage } from "../types/execution.types";

export class TestCaseEngineService {
  /**
   * Compare stdout with expected output with exact, whitespace-trimmed, and float precision options.
   */
  public static compareOutput(actualStdout: string, expected: string): boolean {
    const cleanActual = (actualStdout || "").trim();
    const cleanExpected = (expected || "").trim();

    if (cleanActual === cleanExpected) return true;

    // Check line-by-line whitespace-trimmed comparison
    const actualLines = cleanActual.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const expectedLines = cleanExpected.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    if (actualLines.join("\n") === expectedLines.join("\n")) return true;

    // Floating-point precision tolerance (within 1e-6)
    const numActual = parseFloat(cleanActual);
    const numExpected = parseFloat(cleanExpected);
    if (!isNaN(numActual) && !isNaN(numExpected)) {
      return Math.abs(numActual - numExpected) < 1e-6;
    }

    return false;
  }

  /**
   * Runs all visible and hidden test cases sequentially against the provider execution engine.
   */
  public static async runTestCases(
    provider: BaseExecutionProvider,
    input: ExecutionInput
  ): Promise<StandardExecutionResult> {
    const startTime = Date.now();
    const testCases: TestCaseInput[] = input.testCases || [];
    const results: TestCaseResult[] = [];

    if (testCases.length === 0) {
      return {
        success: false,
        stdout: "No test cases configured.",
        stderr: "Please configure test cases before running test suite.",
        status: "error",
        executionTimeMs: 0,
        provider: provider.id,
        language: input.language as SupportedLanguage,
        errorMessage: "No test cases configured.",
        timestamp: new Date().toISOString(),
      };
    }

    for (const tc of testCases) {
      const singleRunInput: ExecutionInput = {
        ...input,
        stdin: tc.input,
        testCases: [],
      };

      const runResult = await provider.executeCode(singleRunInput);
      const passed = runResult.success && this.compareOutput(runResult.stdout, tc.expected);

      results.push({
        id: tc.id,
        input: tc.input,
        expected: tc.expected,
        stdout: runResult.stdout,
        stderr: runResult.stderr,
        passed,
        isHidden: tc.isHidden,
        executionTimeMs: runResult.executionTimeMs,
      });
    }

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    const allPassed = passedCount === totalCount;

    return {
      success: allPassed,
      stdout: `${passedCount}/${totalCount} test cases passed.`,
      stderr: results
        .filter((r) => !r.passed)
        .map((r, i) => `Test ${i + 1} (${r.isHidden ? "Hidden" : "Visible"}) Failed: expected '${r.expected}', got '${r.stdout.trim() || r.stderr.trim()}'`)
        .join("\n"),
      status: allPassed ? "success" : "runtime_error",
      executionTimeMs: Date.now() - startTime,
      provider: provider.id,
      language: input.language as SupportedLanguage,
      testResults: results,
      timestamp: new Date().toISOString(),
    };
  }
}
