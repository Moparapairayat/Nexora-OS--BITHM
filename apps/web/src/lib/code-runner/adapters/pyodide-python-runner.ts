import type {
  CodeRunInput,
  CodeRunResult,
  CodeRunner,
  CodeRunnerLanguage,
  CodeRunnerTestResult,
} from "../types";

type PyodideRuntime = {
  runPythonAsync(code: string): Promise<unknown>;
};

type LoadPyodideOptions = {
  indexURL: string;
  stdin?: () => string;
  stdout?: (text: string) => void;
  stderr?: (text: string) => void;
};

declare global {
  interface Window {
    loadPyodide?: (options: LoadPyodideOptions) => Promise<PyodideRuntime>;
  }
}

const PYODIDE_VERSION = "0.28.3";
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodidePromise: Promise<PyodideRuntime> | null = null;
let stdoutBuffer: string[] = [];
let stderrBuffer: string[] = [];
let stdinLines: string[] = [];

function elapsedFrom(startedAt: number) {
  return Math.max(1, Math.round(performance.now() - startedAt));
}

function outputMatchesExpected(stdout: string, expected: string) {
  const output = stdout.trim();
  return (
    output === expected ||
    output.endsWith(expected) ||
    output.split(/\s+/).includes(expected)
  );
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Pyodide script failed to load.")),
        {
          once: true,
        },
      );

      if (window.loadPyodide) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Pyodide script failed to load."));
    document.head.appendChild(script);
  });
}

async function getPyodide() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Pyodide is only available in the browser.");
  }

  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      await loadScript(`${PYODIDE_INDEX_URL}pyodide.js`);

      if (!window.loadPyodide) {
        throw new Error("loadPyodide was not exposed by the Pyodide bundle.");
      }

      return window.loadPyodide({
        indexURL: PYODIDE_INDEX_URL,
        stdin: () => stdinLines.shift() ?? "",
        stdout: (text) => stdoutBuffer.push(text),
        stderr: (text) => stderrBuffer.push(text),
      });
    })();
  }

  return pyodidePromise;
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
    adapter: "pyodide-python-runner",
    language: "python",
  };
}

export function createPyodidePythonRunner(
  fallbackRunner: CodeRunner,
): CodeRunner {
  const runner: CodeRunner = {
    async runCode(input) {
      const startedAt = performance.now();
      stdoutBuffer = [];
      stderrBuffer = [];
      stdinLines = String(input.stdin ?? "").split(/\r?\n/);

      try {
        const pyodide = await getPyodide();
        await pyodide.runPythonAsync(input.code);
        const stdout = stdoutBuffer.join("\n").trim();
        const stderr = stderrBuffer.join("\n").trim();

        return {
          stdout: stdout || "Execution completed without stdout.",
          stderr,
          success: !stderr,
          executionTime: elapsedFrom(startedAt),
          adapter: "pyodide-python-runner",
          language: "python",
        };
      } catch (error) {
        const fallback = await fallbackRunner.runCode({
          ...input,
          language: "python",
        });

        return {
          ...fallback,
          stderr: [
            error instanceof Error
              ? error.message
              : "Pyodide execution failed.",
            fallback.stderr,
          ]
            .filter(Boolean)
            .join("\n"),
          adapter: "pyodide-python-runner:fallback",
          executionTime: elapsedFrom(startedAt),
        };
      }
    },
    async runTests(input) {
      return runTestCases(runner, input);
    },
    getSupportedLanguages(): CodeRunnerLanguage[] {
      return ["python"];
    },
  };

  return runner;
}
