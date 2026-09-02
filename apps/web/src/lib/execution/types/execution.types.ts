/**
 * Nexora OS — Production Code Execution Engine Types
 */

export type SupportedLanguage =
  | "c"
  | "cpp"
  | "java"
  | "python"
  | "javascript"
  | "typescript"
  | "html";

export type ExecutionProviderId = "piston" | "judge0" | "docker";

export interface CodeFile {
  id?: string;
  name: string;
  content: string;
  language?: string;
}

export interface TestCaseInput {
  id?: string;
  input: string;
  expected: string;
  isHidden?: boolean;
}

export interface ExecutionInput {
  language: string;
  code?: string;
  files?: CodeFile[];
  stdin?: string;
  testCases?: TestCaseInput[];
  timeoutMs?: number;
  workspaceId?: string;
  userId?: string;
  /**
   * Server-derived identifier used for rate limiting (verified session id or
   * request IP — never a client-supplied value). Falls back to `userId` when
   * omitted for backward compatibility, but every route handler should set
   * this explicitly rather than trusting request-body `userId` for limiting.
   */
  rateLimitKey?: string;
  taskTitle?: string;
  submissionId?: string;
  preferredProvider?: ExecutionProviderId;
}

export interface TestCaseResult {
  id?: string;
  input: string;
  expected: string;
  stdout: string;
  stderr: string;
  passed: boolean;
  isHidden?: boolean;
  executionTimeMs: number;
}

export interface StandardExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  compileOutput?: string;
  status: "success" | "compile_error" | "runtime_error" | "time_limit_exceeded" | "error";
  exitCode?: number;
  executionTimeMs: number;
  memoryUsageKb?: number;
  provider: ExecutionProviderId;
  language: SupportedLanguage;
  version?: string;
  testResults?: TestCaseResult[];
  errorMessage?: string;
  timestamp: string;
}

export interface PistonRuntimeInfo {
  language: string;
  version: string;
  aliases: string[];
}

export interface PistonExecuteResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}
