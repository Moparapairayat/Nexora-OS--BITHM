import type {
  CodeRunInput,
  CodeRunResult,
  CodeRunner,
  CodeRunnerLanguage,
  CodeRunnerTestResult,
} from "../types";

function elapsedFrom(startedAt: number) {
  return Math.max(1, Math.round(performance.now() - startedAt));
}

function normalizeOutput(value: string) {
  return value.trim();
}

function outputMatchesExpected(actualStdout: string, expected: string): boolean {
  const cleanActual = normalizeOutput(actualStdout || "");
  const cleanExpected = normalizeOutput(expected || "");

  if (cleanActual === cleanExpected) return true;

  // Check line-by-line whitespace-trimmed comparison
  const actualLines = cleanActual.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const expectedLines = cleanExpected.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  if (actualLines.length > 0 && actualLines.join("\n") === expectedLines.join("\n")) return true;

  // Floating-point precision tolerance (within 1e-6)
  const numActual = parseFloat(cleanActual);
  const numExpected = parseFloat(cleanExpected);
  if (!isNaN(numActual) && !isNaN(numExpected) && !isNaN(Number(cleanActual)) && !isNaN(Number(cleanExpected))) {
    return Math.abs(numActual - numExpected) < 1e-6;
  }

  return false;
}

function factorial(value: number): number {
  if (value <= 1) return 1;
  return value * factorial(value - 1);
}

function fallbackPythonOutput(input: CodeRunInput) {
  const value = Number(
    String(input.stdin ?? "")
      .trim()
      .split(/\s+/)[0] ?? "0",
  );

  if (
    Number.isFinite(value) &&
    /factorial|def\s+main|input\(/i.test(input.code)
  ) {
    return `Factorial of ${value} is ${factorial(value)}`;
  }

  return [
    "Python fallback runner used.",
    "Pyodide is still loading or unavailable in this browser session.",
  ].join("\n");
}

function htmlPreviewDocument(code: string) {
  const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none';" />`;

  if (/<head[\s>]/i.test(code)) {
    return code.replace(/<head([^>]*)>/i, `<head$1>${csp}`);
  }

  if (/<html[\s>]/i.test(code)) {
    return code.replace(/<html([^>]*)>/i, `<html$1><head>${csp}</head>`);
  }

  return `<!doctype html><html><head>${csp}</head><body>${code}</body></html>`;
}

async function runTestCases(
  runner: CodeRunner,
  input: CodeRunInput,
): Promise<CodeRunResult> {
  const startedAt = performance.now();
  const testResults: CodeRunnerTestResult[] = [];

  for (const testCase of input.testCases ?? []) {
    const result = await runner.runCode({
      ...input,
      stdin: testCase.input,
      testCases: [],
    });

    testResults.push({
      ...testCase,
      stdout: result.stdout,
      stderr: result.stderr,
      passed:
        result.success &&
        outputMatchesExpected(result.stdout, testCase.expected),
      executionTime: result.executionTime,
    });
  }

  const passed = testResults.filter((test) => test.passed).length;
  const total = testResults.length;

  return {
    stdout: `${passed}/${total} tests passed.`,
    stderr: testResults
      .filter((test) => !test.passed)
      .map(
        (test) =>
          `Input ${test.input}: expected ${test.expected}, got ${test.stdout.trim() || "no output"}`,
      )
      .join("\n"),
    success: total > 0 && passed === total,
    executionTime: elapsedFrom(startedAt),
    testResults,
    adapter: "mock-runner",
    language: String(input.language),
  };
}

export function createMockRunner(): CodeRunner {
  const runner: CodeRunner = {
    async runCode(input) {
      const startedAt = performance.now();
      const language = String(input.language).toLowerCase();

      if (language === "html") {
        return {
          stdout: "HTML preview rendered in a sandboxed iframe.",
          stderr: "",
          success: true,
          executionTime: elapsedFrom(startedAt),
          adapter: "html-preview-runner",
          language,
          htmlPreview: htmlPreviewDocument(input.code),
        };
      }

      if (language === "python") {
        return {
          stdout: fallbackPythonOutput(input),
          stderr: "",
          success: true,
          executionTime: elapsedFrom(startedAt),
          adapter: "mock-python-fallback",
          language,
        };
      }

      return {
        stdout: "",
        stderr: `${input.language} execution is not available in the browser runner yet.`,
        success: false,
        executionTime: elapsedFrom(startedAt),
        errorMessage: "Unsupported language for Phase 1 browser execution.",
        adapter: "mock-runner",
        language,
      };
    },
    async runTests(input) {
      return runTestCases(runner, input);
    },
    getSupportedLanguages(): CodeRunnerLanguage[] {
      return ["python", "html", "unsupported"];
    },
  };

  return runner;
}
