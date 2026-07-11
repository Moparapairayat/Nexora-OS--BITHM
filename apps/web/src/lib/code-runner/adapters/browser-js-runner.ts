import type {
  CodeRunInput,
  CodeRunResult,
  CodeRunner,
  CodeRunnerLanguage,
  CodeRunnerTestResult,
} from "../types";

type SandboxResultMessage = {
  type: "nexora-js-result";
  runId: string;
  stdout: string;
  stderr: string;
  success: boolean;
  errorMessage?: string;
};

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

function transpileTypeScriptForBrowser(code: string) {
  return code
    .replace(/^\s*import\s+type\s+.*$/gm, "")
    .replace(/^\s*export\s+type\s+.*$/gm, "")
    .replace(/^\s*type\s+\w+[\s\S]*?;\s*$/gm, "")
    .replace(/^\s*interface\s+\w+\s*{[\s\S]*?^\s*}\s*$/gm, "")
    .replace(/\b(public|private|protected|readonly)\s+/g, "")
    .replace(/:\s*[A-Za-z_$][\w$<>{}\[\]|&,\s]*(?=[,)=;])/g, "")
    .replace(/\sas\s+[A-Za-z_$][\w$<>{}\[\]|&,\s]*/g, "")
    .replace(/<[^>\n]+>(?=\()/g, "");
}

function sandboxDocument() {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none';" />
  </head>
  <body>
    <script>
      const formatValue = (value) => {
        if (typeof value === "string") return value;
        try { return JSON.stringify(value); } catch { return String(value); }
      };

      window.addEventListener("message", async (event) => {
        if (!event.data || event.data.type !== "nexora-js-run") return;
        const { runId, code, stdin } = event.data;
        const logs = [];
        const errors = [];
        const inputLines = String(stdin || "").split(/\\r?\\n/);
        const consoleBridge = {
          log: (...items) => logs.push(items.map(formatValue).join(" ")),
          info: (...items) => logs.push(items.map(formatValue).join(" ")),
          warn: (...items) => logs.push(items.map(formatValue).join(" ")),
          error: (...items) => errors.push(items.map(formatValue).join(" "))
        };
        const readInput = () => inputLines.shift() || "";

        try {
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          await new AsyncFunction("console", "input", "prompt", '"use strict";\\n' + code)(
            consoleBridge,
            readInput,
            readInput
          );
          parent.postMessage({
            type: "nexora-js-result",
            runId,
            stdout: logs.join("\\n"),
            stderr: errors.join("\\n"),
            success: errors.length === 0
          }, "*");
        } catch (error) {
          parent.postMessage({
            type: "nexora-js-result",
            runId,
            stdout: logs.join("\\n"),
            stderr: error && error.stack ? error.stack : String(error),
            success: false,
            errorMessage: error && error.message ? error.message : String(error)
          }, "*");
        }
      });
    </script>
  </body>
</html>`;
}

function runInSandbox(input: CodeRunInput): Promise<CodeRunResult> {
  const startedAt = performance.now();

  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve({
      stdout: "",
      stderr: "Browser JavaScript runner is only available in the browser.",
      success: false,
      executionTime: elapsedFrom(startedAt),
      adapter: "browser-js-runner",
      language: String(input.language),
      errorMessage: "Browser runtime unavailable.",
    });
  }

  const runId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `run-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const iframe = document.createElement("iframe");
  const timeoutMs = input.timeoutMs ?? 4000;
  const code =
    String(input.language).toLowerCase() === "typescript"
      ? transpileTypeScriptForBrowser(input.code)
      : input.code;

  iframe.setAttribute("sandbox", "allow-scripts");
  iframe.style.position = "fixed";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.left = "-9999px";
  iframe.srcdoc = sandboxDocument();
  document.body.appendChild(iframe);

  return new Promise((resolve) => {
    let settled = false;
    let timeout = 0;

    function cleanup() {
      window.removeEventListener("message", onMessage);
      iframe.remove();
    }

    const finish = (result: CodeRunResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      cleanup();
      resolve(result);
    };

    function onMessage(event: MessageEvent<SandboxResultMessage>) {
      if (
        event.data?.type !== "nexora-js-result" ||
        event.data.runId !== runId
      ) {
        return;
      }

      finish({
        stdout: event.data.stdout || "Execution completed without stdout.",
        stderr: event.data.stderr,
        success: event.data.success,
        executionTime: elapsedFrom(startedAt),
        errorMessage: event.data.errorMessage,
        adapter: "browser-js-runner",
        language: String(input.language).toLowerCase(),
      });
    }

    window.addEventListener("message", onMessage);
    timeout = window.setTimeout(() => {
      finish({
        stdout: "",
        stderr: `Execution timed out after ${timeoutMs}ms.`,
        success: false,
        executionTime: elapsedFrom(startedAt),
        errorMessage: "Execution timed out.",
        adapter: "browser-js-runner",
        language: String(input.language).toLowerCase(),
      });
    }, timeoutMs);

    iframe.addEventListener("load", () => {
      iframe.contentWindow?.postMessage(
        {
          type: "nexora-js-run",
          runId,
          code,
          stdin: input.stdin ?? "",
        },
        "*",
      );
    });
  });
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
    adapter: "browser-js-runner",
    language: String(input.language).toLowerCase(),
  };
}

export function createBrowserJsRunner(): CodeRunner {
  const runner: CodeRunner = {
    async runCode(input) {
      return runInSandbox(input);
    },
    async runTests(input) {
      return runTestCases(runner, input);
    },
    getSupportedLanguages(): CodeRunnerLanguage[] {
      return ["javascript", "typescript"];
    },
  };

  return runner;
}
