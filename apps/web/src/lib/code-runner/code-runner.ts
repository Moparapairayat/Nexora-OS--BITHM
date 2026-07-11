import { createBrowserJsRunner } from "./adapters/browser-js-runner";
import { createMockRunner } from "./adapters/mock-runner";
import { createPyodidePythonRunner } from "./adapters/pyodide-python-runner";
import type {
  CodeRunInput,
  CodeRunResult,
  CodeRunner,
  CodeRunnerLanguage,
} from "./types";

const mockRunner = createMockRunner();
const browserJsRunner = createBrowserJsRunner();
const pyodidePythonRunner = createPyodidePythonRunner(mockRunner);

function normalizeLanguage(language: string): CodeRunnerLanguage {
  const value = language.toLowerCase().trim();

  if (["js", "javascript", "node"].includes(value)) return "javascript";
  if (["ts", "typescript"].includes(value)) return "typescript";
  if (["py", "python", "python3"].includes(value)) return "python";
  if (["html", "html/css/js"].includes(value)) return "html";

  return "unsupported";
}

function runnerFor(language: string): CodeRunner {
  const normalized = normalizeLanguage(language);

  if (normalized === "javascript" || normalized === "typescript") {
    return browserJsRunner;
  }

  if (normalized === "python") {
    return pyodidePythonRunner;
  }

  return mockRunner;
}

export const codeRunner: CodeRunner = {
  async runCode(input: CodeRunInput): Promise<CodeRunResult> {
    const language = normalizeLanguage(String(input.language));

    return runnerFor(language).runCode({
      ...input,
      language,
    });
  },
  async runTests(input: CodeRunInput): Promise<CodeRunResult> {
    const language = normalizeLanguage(String(input.language));

    return runnerFor(language).runTests({
      ...input,
      language,
    });
  },
  getSupportedLanguages() {
    return [
      ...new Set<CodeRunnerLanguage>([
        ...browserJsRunner.getSupportedLanguages(),
        ...pyodidePythonRunner.getSupportedLanguages(),
        "html",
      ]),
    ];
  },
};

export type {
  CodeRunInput,
  CodeRunResult,
  CodeRunner,
  CodeRunnerFile,
  CodeRunnerLanguage,
  CodeRunnerTestCase,
  CodeRunnerTestResult,
} from "./types";
