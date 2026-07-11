export type BackendRunnerLanguage =
  | "python"
  | "javascript"
  | "typescript"
  | "html"
  | "cpp"
  | "unsupported";

export type BackendRunnerFile = {
  id: string;
  name: string;
  folder: string;
  language: string;
  content: string;
};

export type BackendRunnerTestCase = {
  id: string;
  input: string;
  expected: string;
};

export type BackendRunnerTestResult = BackendRunnerTestCase & {
  stdout: string;
  stderr: string;
  passed: boolean;
  executionTimeMs: number;
};

export type BackendRunInput = {
  workspaceId: string;
  fileId?: string | null;
  language: BackendRunnerLanguage | string;
  code: string;
  stdin?: string | null;
  files: BackendRunnerFile[];
  testCases?: BackendRunnerTestCase[];
};

export type BackendRunResult = {
  stdout: string;
  stderr: string;
  success: boolean;
  adapter: string;
  executionTimeMs: number;
  testResults?: BackendRunnerTestResult[];
  errorMessage?: string | null;
};

export type TerminalCommandInput = {
  command: string;
  workspaceTitle: string;
  workspaceStatus: string;
  activeFileId?: string | null;
  files: BackendRunnerFile[];
  runCount: number;
  submissionCount: number;
  latestSubmissionStatus?: string | null;
};

export type TerminalCommandResult = BackendRunResult & {
  command: string;
  cwd: string;
};
