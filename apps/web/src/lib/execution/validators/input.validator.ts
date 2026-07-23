/**
 * Nexora OS — Input Validator for Code Execution
 */

import { ExecutionInput } from "../types/execution.types";
import { EXECUTION_CONFIG } from "../config/execution.config";

export function validateExecutionInput(input: ExecutionInput): { valid: boolean; reason?: string } {
  if (!input) {
    return { valid: false, reason: "Execution payload is missing." };
  }

  if (!input.language || typeof input.language !== "string") {
    return { valid: false, reason: "Language specification is required." };
  }

  const code = input.code || (input.files && input.files[0]?.content) || "";
  if (!code || !code.trim()) {
    return { valid: false, reason: "Source code cannot be empty." };
  }

  if (code.length > EXECUTION_CONFIG.maxCodeLengthChars) {
    return {
      valid: false,
      reason: `Source code exceeds maximum permitted length of ${EXECUTION_CONFIG.maxCodeLengthChars} characters.`,
    };
  }

  return { valid: true };
}

export function sanitizeStdout(rawOutput: string): string {
  if (!rawOutput) return "";
  let clean = rawOutput.replace(/\0/g, "");
  if (clean.length > EXECUTION_CONFIG.maxOutputLengthChars) {
    clean = clean.substring(0, EXECUTION_CONFIG.maxOutputLengthChars) + "\n... [Output truncated due to size limit]";
  }
  return clean;
}
