/**
 * Nexora OS — Execution Database Logger Service
 */

import { StandardExecutionResult, ExecutionInput } from "../types/execution.types";
import { prisma } from "@/lib/prisma";

export class ExecutionLoggerService {
  public static async logExecution(input: ExecutionInput, result: StandardExecutionResult): Promise<void> {
    try {
      console.log(
        `[EXECUTION_LOGGER] language="${result.language}" provider="${result.provider}" status="${result.status}" latencyMs=${result.executionTimeMs}`
      );

      if (prisma && prisma.codeRun && input.workspaceId) {
        await prisma.codeRun.create({
          data: {
            workspaceId: input.workspaceId,
            fileId: input.files?.[0]?.id || null,
            language: result.language,
            code: input.code || input.files?.[0]?.content || "",
            stdin: input.stdin || null,
            stdout: result.stdout.substring(0, 8000),
            stderr: result.stderr.substring(0, 8000),
            success: result.success,
            executionTimeMs: result.executionTimeMs,
            adapter: result.provider,
            testResults: result.testResults
              ? {
                  create: result.testResults.map((tr) => ({
                    input: tr.input,
                    expected: tr.expected,
                    stdout: tr.stdout.substring(0, 4000),
                    stderr: tr.stderr.substring(0, 4000),
                    passed: tr.passed,
                    executionTimeMs: tr.executionTimeMs,
                  })),
                }
              : undefined,
          },
        });
      }
    } catch (err: any) {
      console.warn("[ExecutionLoggerService] Failed to persist code run to database:", err.message);
    }
  }
}
