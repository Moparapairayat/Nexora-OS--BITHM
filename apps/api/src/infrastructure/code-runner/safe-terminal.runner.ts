import type {
  BackendRunnerFile,
  TerminalCommandInput,
  TerminalCommandResult,
} from "./code-runner.types.js";

const allowedCommands = [
  "help",
  "pwd",
  "ls",
  "cat",
  "run",
  "test",
  "status",
  "submit-status",
  "clear",
] as const;

function normalizeWorkspaceName(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "code-lab-workspace"
  );
}

function findFile(files: BackendRunnerFile[], target?: string) {
  if (!target) return undefined;

  const normalized = target.replace(/^\.?\//, "").toLowerCase();

  return files.find((file) => {
    const path = `${file.folder}/${file.name}`.toLowerCase();
    return file.name.toLowerCase() === normalized || path === normalized;
  });
}

function formatFileList(files: BackendRunnerFile[]) {
  if (files.length === 0) return "No files in this workspace.";

  return files
    .map((file) => {
      const path =
        file.folder === "main" ? file.name : `${file.folder}/${file.name}`;
      return `${path.padEnd(28)} ${file.language}`;
    })
    .join("\n");
}

function filePreview(file: BackendRunnerFile) {
  const maxLength = 4000;
  const content =
    file.content.length > maxLength
      ? `${file.content.slice(0, maxLength)}\n... truncated ...`
      : file.content;

  return `# ${file.name}\n${content}`;
}

function blockedExecution(command: string, files: BackendRunnerFile[]) {
  const activeFiles = files.map((file) => file.name).join(", ");

  return [
    `Command accepted: ${command}`,
    "",
    "Server-side arbitrary code execution is intentionally blocked until a Docker/Judge0 sandbox is configured.",
    "Use the Code Lab Run and Run Tests buttons for browser/Pyodide execution now.",
    "",
    "Required production sandbox policy:",
    "- isolated container per run",
    "- CPU, memory and timeout limits",
    "- disabled network by default",
    "- workspace copied into a temporary directory",
    "- container cleanup after completion",
    "",
    `Workspace files: ${activeFiles || "none"}`,
  ].join("\n");
}

function success(
  command: string,
  cwd: string,
  stdout: string,
): TerminalCommandResult {
  return {
    command,
    cwd,
    stdout,
    stderr: "",
    success: true,
    adapter: "nexora-safe-terminal",
    executionTimeMs: 0,
  };
}

function failure(
  command: string,
  cwd: string,
  stderr: string,
): TerminalCommandResult {
  return {
    command,
    cwd,
    stdout: "",
    stderr,
    success: false,
    adapter: "nexora-safe-terminal",
    executionTimeMs: 0,
    errorMessage: stderr,
  };
}

export function runSafeTerminalCommand(
  input: TerminalCommandInput,
): TerminalCommandResult {
  const startedAt = Date.now();
  const command = input.command.trim();
  const cwd = `/workspace/${normalizeWorkspaceName(input.workspaceTitle)}`;

  if (!command) {
    return success("", cwd, "");
  }

  const [name = "", ...args] = command.split(/\s+/);
  const commandName = name.toLowerCase();

  if (
    !allowedCommands.includes(commandName as (typeof allowedCommands)[number])
  ) {
    return failure(
      command,
      cwd,
      `Unknown or blocked command: ${name}. Type "help" for allowed commands.`,
    );
  }

  let result: TerminalCommandResult;

  if (commandName === "help") {
    result = success(
      command,
      cwd,
      [
        "Nexora Code Lab safe terminal",
        "",
        "Allowed commands:",
        "  help                  Show this help",
        "  pwd                   Print workspace path",
        "  ls                    List workspace files",
        "  cat <file>            Print a file",
        "  python main.py        Run Python in Docker sandbox",
        "  node main.js          Run JavaScript in Docker sandbox",
        "  npm test              Run package tests in Docker sandbox",
        "  run                   Run active file in Docker sandbox",
        "  test                  Run package test command when package.json exists",
        "  status                Show workspace status",
        "  submit-status         Show latest submission status",
        "  clear                 Clear terminal output in the UI",
      ].join("\n"),
    );
  } else if (commandName === "pwd") {
    result = success(command, cwd, cwd);
  } else if (commandName === "ls") {
    result = success(command, cwd, formatFileList(input.files));
  } else if (commandName === "cat") {
    const file = findFile(input.files, args[0]);
    result = file
      ? success(command, cwd, filePreview(file))
      : failure(command, cwd, `File not found: ${args[0] ?? ""}`.trim());
  } else if (commandName === "run" || commandName === "test") {
    result = success(command, cwd, blockedExecution(command, input.files));
  } else if (commandName === "status") {
    result = success(
      command,
      cwd,
      [
        `Workspace: ${input.workspaceTitle}`,
        `Status: ${input.workspaceStatus}`,
        `Files: ${input.files.length}`,
        `Runs: ${input.runCount}`,
        `Submissions: ${input.submissionCount}`,
      ].join("\n"),
    );
  } else if (commandName === "submit-status") {
    result = success(
      command,
      cwd,
      input.latestSubmissionStatus
        ? `Latest submission: ${input.latestSubmissionStatus}`
        : "No lab submissions found for this workspace.",
    );
  } else {
    result = success(command, cwd, "");
  }

  return {
    ...result,
    executionTimeMs: Date.now() - startedAt,
  };
}
