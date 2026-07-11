import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import type {
  BackendRunInput,
  BackendRunResult,
  BackendRunnerFile,
  BackendRunnerLanguage,
  BackendRunnerTestResult,
} from "./code-runner.types.js";

type DockerPlan = {
  image: string;
  args: string[];
  label: string;
  language: BackendRunnerLanguage | string;
};

const dockerTimeoutMs = Number(process.env.CODE_RUN_TIMEOUT_MS ?? 4000);
const maxOutputLength = 12000;

function appendOutput(current: string, chunk: Buffer) {
  const next = current + chunk.toString("utf8");

  return next.length > maxOutputLength
    ? `${next.slice(0, maxOutputLength)}\n... output truncated ...`
    : next;
}

function normalizeLanguage(language: string): BackendRunnerLanguage {
  const value = language.toLowerCase().trim();

  if (["py", "python", "python3"].includes(value)) return "python";
  if (["js", "javascript", "node"].includes(value)) return "javascript";
  if (["ts", "typescript"].includes(value)) return "typescript";
  if (["html", "html/css/js"].includes(value)) return "html";

  return "unsupported";
}

function sanitizePath(folder: string, name: string) {
  const normalized = path.posix.normalize(
    path.posix.join(folder === "main" ? "" : folder, name),
  );

  if (
    normalized.startsWith("../") ||
    normalized.includes("/../") ||
    normalized === ".." ||
    path.posix.isAbsolute(normalized)
  ) {
    return null;
  }

  return normalized;
}

function dockerPathForFile(file: BackendRunnerFile) {
  return sanitizePath(file.folder, file.name) ?? file.name;
}

function activeFile(input: BackendRunInput) {
  return (
    input.files.find((file) => file.id === input.fileId) ??
    input.files.find((file) => file.name === "main.py") ??
    input.files.find((file) => file.name === "main.js") ??
    input.files[0]
  );
}

function outputMatchesExpected(stdout: string, expected: string) {
  const output = stdout.trim();

  return (
    output === expected ||
    output.endsWith(expected) ||
    output.split(/\s+/).includes(expected)
  );
}

function unsupportedResult(
  input: BackendRunInput,
  message: string,
): BackendRunResult {
  return {
    stdout: "",
    stderr: message,
    success: false,
    adapter: "nexora-docker-sandbox",
    executionTimeMs: 0,
    errorMessage: message,
  };
}

function imageMissingMessage(stderr: string) {
  if (
    /No such image|pull access denied|image.*not found|unable to find image/i.test(
      stderr,
    )
  ) {
    return [
      stderr.trim(),
      "",
      "Docker sandbox image is not installed locally.",
      "Run: docker pull python:3.12-alpine",
      "Run: docker pull node:22-alpine",
    ].join("\n");
  }

  return stderr;
}

function planDockerRun(input: BackendRunInput): DockerPlan | null {
  const language = normalizeLanguage(String(input.language));
  const active = activeFile(input);

  if (!active) return null;

  const filePath = dockerPathForFile(active);

  if (language === "python" || active.name.endsWith(".py")) {
    return {
      image: process.env.CODE_RUN_PYTHON_IMAGE ?? "python:3.12-alpine",
      args: ["python", filePath],
      label: `python ${filePath}`,
      language: "python",
    };
  }

  if (language === "javascript" || active.name.endsWith(".js")) {
    return {
      image: process.env.CODE_RUN_NODE_IMAGE ?? "node:22-alpine",
      args: ["node", filePath],
      label: `node ${filePath}`,
      language: "javascript",
    };
  }

  return null;
}

async function writeWorkspace(root: string, files: BackendRunnerFile[]) {
  for (const file of files) {
    const relativePath = sanitizePath(file.folder, file.name);

    if (!relativePath) continue;

    const absolutePath = path.join(root, ...relativePath.split("/"));

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.content, "utf8");
  }
}

function runDocker(
  plan: DockerPlan,
  workspaceDir: string,
  stdin?: string | null,
) {
  return new Promise<BackendRunResult>((resolve) => {
    const containerName = `nexora-run-${randomUUID().slice(0, 12)}`;
    const startedAt = Date.now();
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const dockerArgs = [
      "run",
      "--rm",
      "-i",
      "--pull",
      process.env.CODE_RUN_DOCKER_PULL_POLICY ?? "never",
      "--name",
      containerName,
      "--network",
      "none",
      "--memory",
      process.env.CODE_RUN_MEMORY_LIMIT ?? "256m",
      "--cpus",
      process.env.CODE_RUN_CPU_LIMIT ?? "0.5",
      "--pids-limit",
      process.env.CODE_RUN_PIDS_LIMIT ?? "128",
      "--workdir",
      "/workspace",
      "--tmpfs",
      "/tmp:rw,nosuid,nodev,size=64m",
      "-v",
      `${workspaceDir}:/workspace:ro`,
      plan.image,
      ...plan.args,
    ];
    const child = spawn("docker", dockerArgs, {
      shell: false,
      windowsHide: true,
    });
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
      const cleanup = spawn("docker", ["rm", "-f", containerName], {
        shell: false,
        windowsHide: true,
      });

      cleanup.on("error", () => undefined);
    }, dockerTimeoutMs);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout = appendOutput(stdout, chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr = appendOutput(stderr, chunk);
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      resolve({
        stdout,
        stderr: error.message,
        success: false,
        adapter: "nexora-docker-sandbox",
        executionTimeMs: Date.now() - startedAt,
        errorMessage: error.message,
      });
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      const rawError = timedOut
        ? `${stderr}\nCommand timed out after ${dockerTimeoutMs}ms.`.trim()
        : code === 0
          ? ""
          : stderr || `Docker command exited with code ${code}.`;
      const normalizedError = rawError ? imageMissingMessage(rawError) : "";

      resolve({
        stdout,
        stderr: normalizedError,
        success: code === 0 && !timedOut,
        adapter: "nexora-docker-sandbox",
        executionTimeMs: Date.now() - startedAt,
        errorMessage: normalizedError || null,
      });
    });

    if (child.stdin.writable) {
      child.stdin.write(stdin ?? "");
      child.stdin.end();
    }
  });
}

export async function runDockerCode(
  input: BackendRunInput,
): Promise<BackendRunResult> {
  const plan = planDockerRun(input);

  if (!plan) {
    return unsupportedResult(
      input,
      `${input.language} is not supported by the Docker runner yet.`,
    );
  }

  const workspaceDir = path.join(tmpdir(), `nexora-run-${randomUUID()}`);

  await mkdir(workspaceDir, { recursive: true });

  try {
    await writeWorkspace(workspaceDir, input.files);
    const result = await runDocker(plan, workspaceDir, input.stdin);

    return {
      ...result,
      stdout:
        result.stdout ||
        (result.success ? "Execution completed without stdout." : ""),
    };
  } finally {
    await rm(workspaceDir, { recursive: true, force: true });
  }
}

export async function runDockerTests(
  input: BackendRunInput,
): Promise<BackendRunResult> {
  const startedAt = Date.now();
  const testCases = input.testCases ?? [];
  const testResults: BackendRunnerTestResult[] = [];

  if (testCases.length === 0) {
    return {
      stdout: "No test cases configured.",
      stderr: "Add test cases before running tests.",
      success: false,
      adapter: "nexora-docker-sandbox",
      executionTimeMs: 0,
      testResults,
      errorMessage: "No test cases configured.",
    };
  }

  for (const testCase of testCases) {
    const result = await runDockerCode({
      ...input,
      stdin: testCase.input,
      testCases: [],
    });
    const passed =
      result.success && outputMatchesExpected(result.stdout, testCase.expected);

    testResults.push({
      ...testCase,
      stdout: result.stdout,
      stderr: result.stderr,
      passed,
      executionTimeMs: result.executionTimeMs,
    });
  }

  const passedCount = testResults.filter((test) => test.passed).length;
  const total = testResults.length;
  const failures = testResults
    .filter((test) => !test.passed)
    .map((test) => {
      const actual = test.stdout.trim() || test.stderr.trim() || "no output";

      return `Input ${test.input}: expected ${test.expected}, got ${actual}`;
    });

  return {
    stdout: [
      `${passedCount}/${total} tests passed.`,
      ...testResults.map(
        (test, index) =>
          `Test ${index + 1}: ${test.passed ? "PASSED" : "FAILED"}`,
      ),
    ].join("\n"),
    stderr: failures.join("\n"),
    success: passedCount === total,
    adapter: "nexora-docker-sandbox",
    executionTimeMs: Date.now() - startedAt,
    testResults,
    errorMessage: failures.length > 0 ? failures.join("\n") : null,
  };
}
