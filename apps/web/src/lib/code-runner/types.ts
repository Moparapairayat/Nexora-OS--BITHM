export type CodeRunnerLanguage =
  | "python"
  | "javascript"
  | "typescript"
  | "html"
  | "c"
  | "cpp"
  | "java"
  | "unsupported";

export type CodeRunnerFile = {
  id: string;
  name: string;
  language: string;
  content: string;
  updatedAt?: string;
};

export type CodeRunnerTestCase = {
  id: string;
  input: string;
  expected: string;
};

export type CodeRunnerTestResult = CodeRunnerTestCase & {
  stdout: string;
  stderr: string;
  passed: boolean;
  executionTime: number;
};

export type CodeRunInput = {
  language: CodeRunnerLanguage | string;
  code: string;
  stdin?: string;
  files?: CodeRunnerFile[];
  testCases?: CodeRunnerTestCase[];
  timeoutMs?: number;
};

export type CodeRunResult = {
  stdout: string;
  stderr: string;
  success: boolean;
  executionTime: number;
  testResults?: CodeRunnerTestResult[];
  errorMessage?: string;
  adapter: string;
  language: string;
  htmlPreview?: string;
};

export interface CodeRunner {
  runCode(input: CodeRunInput): Promise<CodeRunResult>;
  runTests(input: CodeRunInput): Promise<CodeRunResult>;
  getSupportedLanguages(): CodeRunnerLanguage[];
}
