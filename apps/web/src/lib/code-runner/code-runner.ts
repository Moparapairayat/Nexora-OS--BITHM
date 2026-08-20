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

    // Send execution payload to backend Piston API execution engine if in browser environment
    if (typeof window !== "undefined" && ["c", "cpp", "java", "python", "javascript", "typescript"].includes(language)) {
      try {
        const res = await fetch("/api/code/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language,
            code: input.code,
            stdin: input.stdin,
            timeoutMs: input.timeoutMs,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success || (data.stdout && !data.stderr && !data.errorMessage)) {
            return {
              stdout: data.stdout || (data.success ? "Execution completed without stdout." : ""),
              stderr: data.stderr || "",
              success: data.success,
              executionTime: data.executionTimeMs || 0,
              errorMessage: data.errorMessage,
              adapter: `piston-engine:${data.provider || "api"}`,
              language,
            };
          }

          // Fall back to client browser runner for JavaScript/TypeScript when backend fails
          if (language === "javascript" || language === "typescript") {
            console.warn("[codeRunner] Backend returned error, falling back to local browser runner:", data.errorMessage || data.stderr);
            return runnerFor(language).runCode({
              ...input,
              language,
            });
          }

          return {
            stdout: data.stdout || "",
            stderr: data.stderr || "",
            success: data.success,
            executionTime: data.executionTimeMs || 0,
            errorMessage: data.errorMessage,
            adapter: `piston-engine:${data.provider || "api"}`,
            language,
          };
        }
      } catch (err) {
        console.warn("[codeRunner] Backend execution failed, resorting to client runner fallback:", err);
      }
    }

    return runnerFor(language).runCode({
      ...input,
      language,
    });
  },

  async runTests(input: CodeRunInput): Promise<CodeRunResult> {
    const language = normalizeLanguage(String(input.language));

    if (typeof window !== "undefined" && ["c", "cpp", "java", "python", "javascript", "typescript"].includes(language)) {
      try {
        const res = await fetch("/api/code/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language,
            code: input.code,
            testCases: input.testCases,
            timeoutMs: input.timeoutMs,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            return {
              stdout: data.stdout || "",
              stderr: data.stderr || "",
              success: data.success,
              executionTime: data.executionTimeMs || 0,
              testResults: data.testResults,
              errorMessage: data.errorMessage,
              adapter: `piston-engine:${data.provider || "api"}`,
              language,
            };
          }

          if (language === "javascript" || language === "typescript") {
            console.warn("[codeRunner] Backend test runner returned error, falling back to local browser test runner:", data.errorMessage);
            return runnerFor(language).runTests({
              ...input,
              language,
            });
          }

          return {
            stdout: data.stdout || "",
            stderr: data.stderr || "",
            success: data.success,
            executionTime: data.executionTimeMs || 0,
            testResults: data.testResults,
            errorMessage: data.errorMessage,
            adapter: `piston-engine:${data.provider || "api"}`,
            language,
          };
        }
      } catch (err) {
        console.warn("[codeRunner] Backend test suite execution failed, resorting to client fallback:", err);
      }
    }

    return runnerFor(language).runTests({
      ...input,
      language,
    });
  },

  getSupportedLanguages() {
    return [
      "javascript",
      "typescript",
      "python",
      "c" as any,
      "cpp" as any,
      "java" as any,
      "html",
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
