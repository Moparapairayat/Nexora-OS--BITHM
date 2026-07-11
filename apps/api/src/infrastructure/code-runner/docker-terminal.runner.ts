import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import type {
  BackendRunnerFile,
  TerminalCommandInput,
  TerminalCommandResult,
} from "./code-runner.types.js";

type DockerPlan = {
  image: string;
  args: string[];
  label: string;
};

const dockerTimeoutMs = Number(process.env.CODE_RUN_TIMEOUT_MS ?? 4000);
const maxOutputLength = 12000;

function normalizeWorkspaceName(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "code-lab-workspace"
  );
}

function appendOutput(current: string, chunk: Buffer) {
  const next = current + chunk.toString("utf8");

  return next.length > maxOutputLength
    ? `${next.slice(0, maxOutputLength)}\n... output truncated ...`
    : next;
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

function fileExists(files: BackendRunnerFile[], candidate: string) {
  const normalized = candidate.replace(/^\.?\//, "").toLowerCase();

  return files.some((file) => {
    const filePath = dockerPathForFile(file).toLowerCase();

    return file.name.toLowerCase() === normalized || filePath === normalized;
  });
}

function activeFile(files: BackendRunnerFile[], activeFileId?: string | null) {
  return (
    files.find((file) => file.id === activeFileId) ??
    files.find((file) => file.name === "main.py") ??
    files.find((file) => file.name === "main.js") ??
    files[0]
  );
}

function splitCommand(command: string) {
  return (
    command
      .match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)
      ?.map((part) => part.replace(/^["']|["']$/g, "")) ?? []
  );
}

function planDockerCommand(input: TerminalCommandInput): DockerPlan | null {
  const parts = splitCommand(input.command.trim());
  const [name = "", ...args] = parts;
  const command = name.toLowerCase();
  const active = activeFile(input.files, input.activeFileId);

  if (command === "run" && active) {
    const filePath = dockerPathForFile(active);

    if (active.name.endsWith(".py")) {
      return {
        image: process.env.CODE_RUN_PYTHON_IMAGE ?? "python:3.12-alpine",
        args: ["python", filePath],
        label: `python ${filePath}`,
      };
    }

    if (active.name.endsWith(".js")) {
      return {
        image: process.env.CODE_RUN_NODE_IMAGE ?? "node:22-alpine",
        args: ["node", filePath],
        label: `node ${filePath}`,
      };
    }
  }

  if ((command === "python" || command === "python3") && args[0]) {
    if (!fileExists(input.files, args[0]) || !args[0].endsWith(".py"))
      return null;

    return {
      image: process.env.CODE_RUN_PYTHON_IMAGE ?? "python:3.12-alpine",
      args: ["python", ...args],
      label: `python ${args.join(" ")}`,
    };
  }

  if (command === "node" && args[0]) {
    if (!fileExists(input.files, args[0]) || !args[0].endsWith(".js"))
      return null;

    return {
      image: process.env.CODE_RUN_NODE_IMAGE ?? "node:22-alpine",
      args: ["node", ...args],
      label: `node ${args.join(" ")}`,
    };
  }

  if (command === "npm" && (args[0] === "test" || args[0] === "run")) {
    if (!fileExists(input.files, "package.json")) return null;

    return {
      image: process.env.CODE_RUN_NODE_IMAGE ?? "node:22-alpine",
      args: ["npm", ...args],
      label: `npm ${args.join(" ")}`,
    };
  }

  if (command === "test" && fileExists(input.files, "package.json")) {
    return {
      image: process.env.CODE_RUN_NODE_IMAGE ?? "node:22-alpine",
      args: ["npm", "test"],
      label: "npm test",
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

function runDocker(plan: DockerPlan, workspaceDir: string, cwd: string) {
  return new Promise<TerminalCommandResult>((resolve) => {
    const containerName = `nexora-code-${randomUUID().slice(0, 12)}`;
    const startedAt = Date.now();
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const dockerArgs = [
      "run",
      "--rm",
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
        command: plan.label,
        cwd,
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
      const errorMessage = timedOut
        ? `Command timed out after ${dockerTimeoutMs}ms.`
        : code === 0
          ? null
          : stderr || `Docker command exited with code ${code}.`;

      resolve({
        command: plan.label,
        cwd,
        stdout,
        stderr: timedOut ? `${stderr}\n${errorMessage}`.trim() : stderr,
        success: code === 0 && !timedOut,
        adapter: "nexora-docker-sandbox",
        executionTimeMs: Date.now() - startedAt,
        errorMessage,
      });
    });
  });
}

export async function runDockerTerminalCommand(
  input: TerminalCommandInput,
): Promise<TerminalCommandResult | null> {
  const plan = planDockerCommand(input);

  if (!plan) return null;

  const workspaceName = normalizeWorkspaceName(input.workspaceTitle);
  const cwd = `/workspace/${workspaceName}`;
  const workspaceDir = path.join(tmpdir(), `nexora-code-${randomUUID()}`);

  await mkdir(workspaceDir, { recursive: true });

  try {
    await writeWorkspace(workspaceDir, input.files);
    return await runDocker(plan, workspaceDir, cwd);
  } finally {
    await rm(workspaceDir, { recursive: true, force: true });
  }
}
