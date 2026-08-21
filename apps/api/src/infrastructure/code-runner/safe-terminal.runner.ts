import type {
  BackendRunnerFile,
  TerminalCommandInput,
  TerminalCommandResult,
} from "./code-runner.types.js";

const allowedCommands = [
  "help",
  "man",
  "pwd",
  "ls",
  "dir",
  "cat",
  "touch",
  "rm",
  "delete",
  "mv",
  "cp",
  "echo",
  "grep",
  "wc",
  "whoami",
  "date",
  "time",
  "run",
  "test",
  "submit",
  "status",
  "submit-status",
  "clear",
  "cls",
  "python",
  "node",
  "nodejs",
  "ts-node",
  "tsc",
  "gcc",
  "g++",
  "javac",
  "java",
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

function formatFileList(files: BackendRunnerFile[], detailed = false) {
  if (files.length === 0) return "total 0\n(no files)";

  if (!detailed) {
    return files.map((f) => f.name).join("    ");
  }

  return files
    .map((file) => {
      const size = Buffer.byteLength(file.content || "", "utf8");
      return `-rw-r--r-- 1 student nexora ${String(size).padStart(6, " ")}B ${file.name}`;
    })
    .join("\n");
}

function filePreview(file: BackendRunnerFile) {
  const maxLength = 8000;
  const content =
    file.content.length > maxLength
      ? `${file.content.slice(0, maxLength)}\n... [truncated] ...`
      : file.content;

  return content;
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
    adapter: "nexora-cloud-cli",
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
    adapter: "nexora-cloud-cli",
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
      `Unknown command: ${name}. Type "help" to view allowed commands.`,
    );
  }

  let result: TerminalCommandResult;

  if (commandName === "help" || commandName === "man") {
    result = success(
      command,
      cwd,
      [
        "╔══════════════════════════════════════════════════════════════════════╗",
        "║                 ⚡ NEXORA CODE LAB CLOUD CLI v2.4                    ║",
        "╚══════════════════════════════════════════════════════════════════════╝",
        "",
        "  [EXECUTION COMMANDS]",
        "  python <file>            Execute Python script via Cloud Engine (Piston v2)",
        "  node <file>              Execute JavaScript file via Node.js Cloud Engine",
        "  ts-node <file>           Execute TypeScript file",
        "  gcc <file> / g++ <file>  Compile & run C/C++ source code",
        "  javac <file>             Compile & run Java program",
        "  run [file]               Run active or specified file",
        "  test / npm test          Execute all lab test cases with live validation",
        "  submit                   Submit workspace solution to teacher for grading",
        "",
        "  [WORKSPACE & FILE COMMANDS]",
        "  ls / ls -la              List all files in workspace with size and language",
        "  pwd                      Print current working directory path",
        "  cat <file>               Display file content with line count",
        "  touch <file>             Create a new file in workspace",
        "  rm <file>                Delete a file from workspace",
        "  mv <old> <new>           Rename a workspace file",
        "  cp <src> <dst>           Duplicate a file",
        "  echo <text> > <file>     Write content to a file",
        "  grep <pattern> <file>    Search for text pattern in file",
        "  wc <file>                Count lines, words, and characters",
        "  status                   Show workspace health, database & runner telemetry",
        "  whoami                   Show active student identity and role",
        "  date                     Display current UTC timestamp",
        "  clear / cls              Clear terminal history (Ctrl+L)",
      ].join("\n"),
    );
  } else if (commandName === "pwd") {
    result = success(command, cwd, cwd);
  } else if (commandName === "whoami") {
    result = success(command, cwd, "student (authenticated)");
  } else if (commandName === "date" || commandName === "time") {
    result = success(command, cwd, new Date().toUTCString());
  } else if (commandName === "ls" || commandName === "dir") {
    const isDetailed = command.includes("-l") || command.includes("-la");
    result = success(command, cwd, formatFileList(input.files, isDetailed));
  } else if (commandName === "cat") {
    const file = findFile(input.files, args[0]);
    result = file
      ? success(command, cwd, filePreview(file))
      : failure(command, cwd, `cat: ${args[0] ?? ""}: No such file`);
  } else if (commandName === "wc") {
    const file = findFile(input.files, args[0]);
    if (!file) {
      result = failure(command, cwd, `wc: ${args[0] ?? ""}: No such file`);
    } else {
      const lines = file.content.split("\n").length;
      const words = file.content.trim().split(/\s+/).filter(Boolean).length;
      const chars = file.content.length;
      result = success(command, cwd, `  ${lines}  ${words}  ${chars} ${file.name}`);
    }
  } else if (commandName === "grep") {
    const pattern = args[0] || "";
    const target = findFile(input.files, args[1]);
    const searchFiles = target ? [target] : input.files;
    const matches: string[] = [];

    for (const f of searchFiles) {
      const lines = f.content.split("\n");
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(pattern.toLowerCase())) {
          matches.push(`${f.name}:${idx + 1}: ${line}`);
        }
      });
    }

    result = success(
      command,
      cwd,
      matches.length > 0 ? matches.join("\n") : `grep: no matches for '${pattern}'`,
    );
  } else if (commandName === "status") {
    result = success(
      command,
      cwd,
      [
        `Workspace:       ${input.workspaceTitle}`,
        `Status:          ${input.workspaceStatus}`,
        `Files Count:     ${input.files.length}`,
        `Total Runs:      ${input.runCount}`,
        `Submissions:     ${input.submissionCount}`,
        `Database:        Neon PostgreSQL (Active)`,
        `Execution Engine: Piston v2 / Judge0 Cloud Engine (Ready)`,
      ].join("\n"),
    );
  } else if (commandName === "submit-status") {
    result = success(
      command,
      cwd,
      input.latestSubmissionStatus
        ? `Latest submission review: ${input.latestSubmissionStatus}`
        : "No lab submissions recorded yet.",
    );
  } else {
    result = success(command, cwd, `Command queued: ${command}`);
  }

  return {
    ...result,
    executionTimeMs: Date.now() - startedAt,
  };
}
