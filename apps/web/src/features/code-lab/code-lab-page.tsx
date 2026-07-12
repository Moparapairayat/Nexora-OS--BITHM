"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Command,
  Copy,
  Download,
  FolderOpen,
  Maximize2,
  MoreHorizontal,
  Palette,
  PencilLine,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Upload as UploadIcon,
  X,
  type LucideIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import type { BeforeMount, EditorProps, OnMount } from "@monaco-editor/react";

import { AppShell } from "@/components/layout/app-shell";
import {
  environmentOptions,
  initialFolders,
  initialTests,
  initialConsole,
  languageOptions,
  type EnvironmentId,
  type FileNode,
  type FolderNode,
  type LanguageId,
  type TestCase,
} from "@/features/code-lab/code-lab-data";
import {
  codeRunner,
  type CodeRunResult,
  type CodeRunnerFile,
  type CodeRunnerLanguage,
  type CodeRunnerTestResult,
} from "@/lib/code-runner/code-runner";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/workflow-api";
import { PenguinLoadingSpinner } from "@/components/ui/loading-spinner";
import { roleDashboards, type AppRole } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// ---------- Reusable design tokens (light-mode Code Lab) ----------

const cardClass =
  "rounded-[22px] border border-[#E6EEF0] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]";

const ghostButton =
  "inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[#E6EEF0] bg-white px-3 text-sm font-medium text-[#0B1B33] transition hover:bg-[#EFFFF5] hover:border-[#DFF8EA]";

const primaryButton =
  "inline-flex h-10 items-center justify-center gap-2 rounded-[14px] bg-[#009B5A] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,155,90,0.22)] transition hover:bg-[#00B86B] disabled:opacity-60";

const pillBase =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold";

const CODE_LAB_STORAGE_KEY = "nexora-code-lab:workspace:v1";

type StoredCodeLabWorkspace = {
  workspaceId?: string;
  workspaceTitle?: string;
  folders: FolderNode[];
  fileContents: Record<string, string>;
  openFileIds: string[];
  activeFileId: string;
  language: LanguageId;
  updatedAt: string;
  versions: Array<{
    id: string;
    fileName: string;
    language: string;
    code: string;
    updatedAt: string;
  }>;
};

type FileSnapshot = {
  name: string;
  language: string;
  content: string;
};

type ProblemItem = {
  id: string;
  severity: "error" | "warning";
  source: string;
  message: string;
};

type IdePanelId = "explorer" | "search" | "tests" | "history" | "ai";
type AutosaveStatus = "idle" | "saving" | "saved" | "error";

type TerminalEntry = {
  id: string;
  command: string;
  cwd: string;
  stdout: string;
  stderr: string;
  success: boolean;
  adapter?: string;
  executionTimeMs?: number;
  createdAt: string;
};

type CodeLabApiFile = {
  id: string;
  workspaceId: string;
  name: string;
  folder: string;
  language: string;
  content: string;
  sortOrder: number;
  updatedAt: string;
};

type CodeLabApiWorkspace = {
  id: string;
  title: string;
  activeFileId: string | null;
  status: string;
  updatedAt: string;
  files: CodeLabApiFile[];
  versions?: Array<{
    id: string;
    fileId: string | null;
    version: number;
    title: string;
    language: string;
    code: string;
    createdAt: string;
  }>;
};

type WorkspacesResponse = {
  workspaces: Array<{
    id: string;
    title: string;
    activeFileId: string | null;
    updatedAt: string;
    fileCount: number;
  }>;
};

type WorkspaceResponse = {
  workspace: CodeLabApiWorkspace;
};

type FileResponse = {
  file: CodeLabApiFile;
};

type RunResponse = {
  run: {
    id: string;
    success: boolean;
    createdAt: string;
  };
  execution?: ApiCodeRunResult;
};

type ApiCodeRunResult = Omit<CodeRunResult, "executionTime" | "testResults"> & {
  executionTime?: number;
  executionTimeMs?: number;
  testResults?: Array<
    Omit<CodeRunnerTestResult, "executionTime"> & {
      executionTime?: number;
      executionTimeMs?: number;
    }
  >;
};

type AutosaveResponse = {
  ok: boolean;
  updatedAt: string;
  workspace: CodeLabApiWorkspace;
};

type TerminalResponse = {
  terminal: {
    command: string;
    cwd: string;
    stdout: string;
    stderr: string;
    success: boolean;
    adapter: string;
    executionTimeMs: number;
    errorMessage?: string | null;
  };
  run: {
    id: string;
    success: boolean;
    createdAt: string;
  };
};

type SubmitResponse = {
  submission: {
    id: string;
    status: string;
    reviewStatus: string;
    version: number;
    codeVersionId: string;
  };
};

type AiAction = "explain" | "debug" | "improve";

type AssistantResponse = {
  action: AiAction;
  note: string;
  suggestedCode?: string;
  model?: string;
  mode?: string;
};

function readStoredWorkspace(): StoredCodeLabWorkspace | null {
  if (typeof window === "undefined") return null;

  const saved = window.localStorage.getItem(CODE_LAB_STORAGE_KEY);
  if (!saved) return null;

  try {
    const snapshot = JSON.parse(saved) as StoredCodeLabWorkspace;

    if (!Array.isArray(snapshot.folders) || !snapshot.fileContents) {
      return null;
    }

    return snapshot;
  } catch {
    return null;
  }
}

function flattenFiles(folders: FolderNode[]) {
  return folders.flatMap((folder) => folder.files);
}

function foldersFromApiFiles(files: CodeLabApiFile[]): FolderNode[] {
  const folderMap = new Map<string, FileNode[]>();

  for (const file of files) {
    const folderName = file.folder || "main";
    const current = folderMap.get(folderName) ?? [];
    current.push({
      id: file.id,
      name: file.name,
      language: normalizeStoredFileLanguage(file.language, file.name),
      content: file.content,
    });
    folderMap.set(folderName, current);
  }

  return [...folderMap.entries()].map(([name, folderFiles]) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    files: folderFiles,
  }));
}

function fileContentsFromFolders(folders: FolderNode[]) {
  return Object.fromEntries(
    flattenFiles(folders).map((file) => [file.id, file.content]),
  );
}

function fileSnapshotsFromFolders(
  folders: FolderNode[],
  fileContents: Record<string, string>,
) {
  return Object.fromEntries(
    flattenFiles(folders).map((file) => [
      file.id,
      {
        name: file.name,
        language: file.language,
        content: fileContents[file.id] ?? file.content,
      } satisfies FileSnapshot,
    ]),
  );
}

function inferLanguageFromFileName(
  name: string,
  fallback: LanguageId = "python",
): FileNode["language"] {
  const extension = name.toLowerCase().split(".").pop() ?? "";
  const map: Record<string, FileNode["language"]> = {
    cpp: "cpp",
    css: "html",
    cxx: "cpp",
    htm: "html",
    html: "html",
    js: "javascript",
    json: "json",
    jsx: "javascript",
    md: "markdown",
    py: "python",
    ts: "typescript",
    tsx: "typescript",
    txt: "text",
  };

  return map[extension] ?? fallback;
}

function normalizeStoredFileLanguage(
  language: string | undefined,
  name: string,
): FileNode["language"] {
  const supported: FileNode["language"][] = [
    "cpp",
    "html",
    "javascript",
    "json",
    "markdown",
    "python",
    "text",
    "typescript",
  ];

  return supported.includes(language as FileNode["language"])
    ? (language as FileNode["language"])
    : inferLanguageFromFileName(name);
}

function defaultExtensionForLanguage(language: LanguageId) {
  const map: Record<LanguageId, string> = {
    cpp: "cpp",
    html: "html",
    javascript: "js",
    python: "py",
    typescript: "ts",
  };

  return map[language];
}

function starterContentForLanguage(
  language: FileNode["language"],
  name: string,
) {
  if (language === "javascript") {
    return `const value = Number(input());\nconsole.log(value * 2);\n`;
  }

  if (language === "typescript") {
    return `const value: number = Number(input());\nconsole.log(value * 2);\n`;
  }

  if (language === "html") {
    return `<!doctype html>\n<html>\n  <head>\n    <title>${name}</title>\n    <style>\n      body { font-family: system-ui; padding: 24px; }\n    </style>\n  </head>\n  <body>\n    <h1>Nexora Code Lab</h1>\n    <script>\n      console.log("Preview ready");\n    </script>\n  </body>\n</html>\n`;
  }

  if (language === "json") {
    return `{\n  "name": "${name}",\n  "items": []\n}\n`;
  }

  if (language === "markdown") {
    return `# ${name}\n\nWrite your notes here.\n`;
  }

  if (language === "text") {
    return "";
  }

  return `# ${name}\n\nvalue = int(input())\nprint(value * 2)\n`;
}

function ensureUniqueFileName(name: string, files: FileNode[]) {
  const existing = new Set(files.map((file) => file.name.toLowerCase()));
  const trimmed = name.trim();

  if (!existing.has(trimmed.toLowerCase())) {
    return trimmed;
  }

  const dotIndex = trimmed.lastIndexOf(".");
  const base = dotIndex > 0 ? trimmed.slice(0, dotIndex) : trimmed;
  const extension = dotIndex > 0 ? trimmed.slice(dotIndex) : "";
  let counter = 1;
  let candidate = `${base}-${counter}${extension}`;

  while (existing.has(candidate.toLowerCase())) {
    counter += 1;
    candidate = `${base}-${counter}${extension}`;
  }

  return candidate;
}

function runnerLanguageFor(
  file: FileNode | undefined,
  fallback: LanguageId,
): CodeRunnerLanguage {
  const language = file?.language ?? fallback;

  if (
    language === "python" ||
    language === "javascript" ||
    language === "typescript" ||
    language === "html"
  ) {
    return language;
  }

  return fallback === "cpp" ? "unsupported" : fallback;
}

function outputMatchesExpected(output: string, expected: string) {
  const trimmed = output.trim();
  return (
    trimmed === expected ||
    trimmed.endsWith(expected) ||
    trimmed.split(/\s+/).includes(expected)
  );
}

function shouldUseBackendRunner(language: CodeRunnerLanguage) {
  return language === "python" || language === "javascript";
}

function normalizeApiExecutionResult(
  execution: ApiCodeRunResult,
  fallbackLanguage: CodeRunnerLanguage,
): CodeRunResult {
  return {
    stdout: execution.stdout || "Execution completed without stdout.",
    stderr: execution.stderr ?? "",
    success: execution.success,
    executionTime: Number(
      execution.executionTime ?? execution.executionTimeMs ?? 0,
    ),
    testResults: execution.testResults?.map((test) => ({
      id: test.id,
      input: test.input,
      expected: test.expected,
      stdout: test.stdout,
      stderr: test.stderr,
      passed: test.passed,
      executionTime: Number(test.executionTime ?? test.executionTimeMs ?? 0),
    })),
    errorMessage: execution.errorMessage,
    adapter: execution.adapter || "nexora-api-runner",
    language: execution.language || fallbackLanguage,
    htmlPreview: execution.htmlPreview,
  };
}

function terminalCwdForWorkspace(title: string) {
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "code-lab-workspace";

  return `/workspace/${slug}`;
}

const MonacoEditor = dynamic<EditorProps>(
  () => import("@monaco-editor/react").then((module) => module.default),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full min-h-[420px] place-items-center bg-[#FAFCFC]">
        <PenguinLoadingSpinner
          size="md"
          showText={true}
          text="Loading Monaco Editor"
        />
      </div>
    ),
  },
);

const monacoOptions: EditorProps["options"] = {
  automaticLayout: true,
  bracketPairColorization: { enabled: true },
  contextmenu: true,
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: "on",
  detectIndentation: true,
  fixedOverflowWidgets: true,
  folding: true,
  fontFamily:
    '"Geist Mono", "JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace',
  fontLigatures: true,
  fontSize: 14,
  formatOnPaste: true,
  formatOnType: true,
  glyphMargin: false,
  guides: {
    bracketPairs: true,
    indentation: true,
  },
  lineHeight: 24,
  lineNumbersMinChars: 3,
  matchBrackets: "always",
  minimap: {
    enabled: true,
    renderCharacters: false,
    scale: 0.75,
    showSlider: "mouseover",
    side: "right",
  },
  overviewRulerBorder: false,
  padding: {
    bottom: 18,
    top: 18,
  },
  renderLineHighlight: "all",
  renderWhitespace: "selection",
  roundedSelection: true,
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  suggestOnTriggerCharacters: true,
  tabSize: 2,
  wordWrap: "off",
};

const configureMonaco: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("nexora-code-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6B7A90", fontStyle: "italic" },
      { token: "keyword", foreground: "007A45", fontStyle: "bold" },
      { token: "string", foreground: "B36B00" },
      { token: "number", foreground: "7C3AED" },
      { token: "type", foreground: "1A64D8" },
      { token: "function", foreground: "005F37" },
    ],
    colors: {
      "editor.background": "#FFFFFF",
      "editor.foreground": "#0B1B33",
      "editorCursor.foreground": "#009B5A",
      "editorLineNumber.foreground": "#9AA8B8",
      "editorLineNumber.activeForeground": "#009B5A",
      "editor.lineHighlightBackground": "#EFFFF566",
      "editor.selectionBackground": "#DFF8EACC",
      "editor.inactiveSelectionBackground": "#E6EEF0",
      "editorIndentGuide.background1": "#EDF3F3",
      "editorIndentGuide.activeBackground1": "#BDEFD2",
      "editorBracketMatch.background": "#DFF8EA88",
      "editorBracketMatch.border": "#009B5A",
      "minimap.background": "#FFFFFF",
      "scrollbarSlider.background": "#C9D7D580",
      "scrollbarSlider.hoverBackground": "#9FB8B380",
      "scrollbarSlider.activeBackground": "#009B5A88",
    },
  });

  monaco.editor.defineTheme("nexora-code-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "7B8C82", fontStyle: "italic" },
      { token: "keyword", foreground: "32F59A", fontStyle: "bold" },
      { token: "string", foreground: "FFB45A" },
      { token: "number", foreground: "D9FF57" },
      { token: "type", foreground: "6CF6B3" },
      { token: "function", foreground: "D9FF57" },
    ],
    colors: {
      "editor.background": "#0D1110",
      "editor.foreground": "#F5F7F2",
      "editorCursor.foreground": "#D9FF57",
      "editorLineNumber.foreground": "#6E7A72",
      "editorLineNumber.activeForeground": "#D9FF57",
      "editor.lineHighlightBackground": "#15332680",
      "editor.selectionBackground": "#32F59A33",
      "editor.inactiveSelectionBackground": "#1A241F",
      "editorIndentGuide.background1": "#1C2924",
      "editorIndentGuide.activeBackground1": "#32F59A66",
      "editorBracketMatch.background": "#32F59A22",
      "editorBracketMatch.border": "#32F59A",
      "minimap.background": "#0D1110",
      "scrollbarSlider.background": "#6E7A7244",
      "scrollbarSlider.hoverBackground": "#32F59A44",
      "scrollbarSlider.activeBackground": "#D9FF5766",
    },
  });
};

// ---------- Sub-components ----------

function IconChip({
  icon: Icon,
  tone = "emerald",
  size = "md",
}: {
  icon: LucideIcon;
  tone?: "emerald" | "blue" | "purple" | "orange";
  size?: "sm" | "md" | "lg";
}) {
  const tones: Record<string, string> = {
    emerald: "bg-[#DFF8EA] text-[#009B5A]",
    blue: "bg-[#E5F0FF] text-[#1A7CFF]",
    purple: "bg-[#EEE7FF] text-[#7C4DFF]",
    orange: "bg-[#FFE9D6] text-[#FF7A1A]",
  };
  const sizes: Record<string, string> = {
    sm: "h-8 w-8 rounded-xl",
    md: "h-10 w-10 rounded-2xl",
    lg: "h-14 w-14 rounded-[20px]",
  };
  return (
    <span className={cn("grid place-items-center", sizes[size], tones[tone])}>
      <Icon
        className={size === "lg" ? "h-6 w-6" : "h-4 w-4"}
        aria-hidden="true"
      />
    </span>
  );
}

function LanguageSelect({
  value,
  onChange,
}: {
  value: LanguageId;
  onChange: (id: LanguageId) => void;
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Language</span>
      <select
        aria-label="Programming language"
        title="Programming language"
        value={value}
        onChange={(event) => onChange(event.target.value as LanguageId)}
        className="h-10 appearance-none rounded-xl border border-[#E6EEF0] bg-white pl-3 pr-9 text-sm font-medium text-[#0B1B33] shadow-[0_4px_12px_rgba(15,23,42,0.04)] outline-none transition hover:border-[#DFF8EA] focus:border-[#009B5A] focus:ring-2 focus:ring-[#DFF8EA]"
      >
        {languageOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4 text-[#5D6B82]" />
    </label>
  );
}

function EnvironmentSelect({
  value,
  onChange,
}: {
  value: EnvironmentId;
  onChange: (id: EnvironmentId) => void;
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Environment</span>
      <select
        aria-label="Execution environment"
        title="Execution environment"
        value={value}
        onChange={(event) => onChange(event.target.value as EnvironmentId)}
        className="h-10 appearance-none rounded-xl border border-[#E6EEF0] bg-white pl-3 pr-9 text-sm font-medium text-[#0B1B33] shadow-[0_4px_12px_rgba(15,23,42,0.04)] outline-none transition hover:border-[#DFF8EA] focus:border-[#009B5A] focus:ring-2 focus:ring-[#DFF8EA]"
      >
        {environmentOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4 text-[#5D6B82]" />
    </label>
  );
}

function CodeLabHeader({
  language,
  environment,
  dbStatus,
  autosaveStatus,
  dirtyCount,
  onLanguageChange,
  onEnvironmentChange,
  onRun,
  onSave,
  onSubmit,
  isRunning,
  isSubmitting,
}: {
  language: LanguageId;
  environment: EnvironmentId;
  dbStatus: "loading" | "ready" | "draft";
  autosaveStatus: AutosaveStatus;
  dirtyCount: number;
  onLanguageChange: (id: LanguageId) => void;
  onEnvironmentChange: (id: EnvironmentId) => void;
  onRun: () => void;
  onSave: () => void;
  onSubmit: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
}) {
  return (
    <section className={cn(cardClass, "relative overflow-hidden px-4 py-3")}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(0,184,107,0.14),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-32 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(26,124,255,0.08),transparent_60%)]"
      />

      <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <IconChip icon={Code2} tone="emerald" size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#009B5A]">
                Code Lab
              </span>
              <span className={cn(pillBase, "bg-[#DFF8EA] text-[#009B5A]")}>
                <span className="h-1.5 w-1.5 rounded-full bg-[#009B5A]" />
                Live workspace
              </span>
              <span
                className={cn(
                  pillBase,
                  dbStatus === "ready"
                    ? "bg-[#E5F8ED] text-[#007A45]"
                    : dbStatus === "loading"
                      ? "bg-[#E5F0FF] text-[#1A55B8]"
                      : "bg-[#FFF6E8] text-[#A36A00]",
                )}
              >
                {dbStatus === "ready"
                  ? "Database saved"
                  : dbStatus === "loading"
                    ? "Loading DB"
                    : "Draft fallback"}
              </span>
              {dirtyCount > 0 ? (
                <span className={cn(pillBase, "bg-[#FFF6E8] text-[#A36A00]")}>
                  {dirtyCount} unsaved
                </span>
              ) : null}
              <span
                className={cn(
                  pillBase,
                  autosaveStatus === "saving"
                    ? "bg-[#E5F0FF] text-[#1A55B8]"
                    : autosaveStatus === "saved"
                      ? "bg-[#E5F8ED] text-[#007A45]"
                      : autosaveStatus === "error"
                        ? "bg-[#FFE4E1] text-[#B91C1C]"
                        : "bg-[#F2F6F5] text-[#5D6B82]",
                )}
              >
                {autosaveStatus === "saving"
                  ? "Autosaving"
                  : autosaveStatus === "saved"
                    ? "Autosaved"
                    : autosaveStatus === "error"
                      ? "Autosave error"
                      : "Autosave idle"}
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#0B1B33]">
              Write, run, and test code without leaving the page.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <LanguageSelect value={language} onChange={onLanguageChange} />
          <EnvironmentSelect
            value={environment}
            onChange={onEnvironmentChange}
          />
          <button type="button" onClick={onSave} className={ghostButton}>
            <Save className="h-4 w-4" />{" "}
            {dirtyCount > 0 ? "Save changes" : "Save"}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className={ghostButton}
          >
            <UploadIcon className="h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit Lab Task"}
          </button>
          <button
            type="button"
            onClick={onRun}
            disabled={isRunning}
            className={primaryButton}
          >
            <Play className="h-4 w-4" />
            {isRunning ? "Running..." : "Run"}
          </button>
        </div>
      </div>
    </section>
  );
}

function FileTypeIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const extension = name.toLowerCase().startsWith(".env")
    ? "env"
    : (name.toLowerCase().split(".").pop() ?? "");
  const meta: Record<string, { label: string; className: string }> = {
    py: {
      label: "PY",
      className: "border-[#BDEFD2] bg-[#EFFFF5] text-[#007A45]",
    },
    js: {
      label: "JS",
      className: "border-[#F8E7A6] bg-[#FFF9DB] text-[#A36A00]",
    },
    jsx: {
      label: "JSX",
      className: "border-[#C9E5FF] bg-[#EAF6FF] text-[#0877C8]",
    },
    ts: {
      label: "TS",
      className: "border-[#BFD9FF] bg-[#EAF2FF] text-[#1A64D8]",
    },
    tsx: {
      label: "TSX",
      className: "border-[#BFD9FF] bg-[#EAF2FF] text-[#1A64D8]",
    },
    html: {
      label: "HTML",
      className: "border-[#FFD7B8] bg-[#FFF0E5] text-[#C84E12]",
    },
    css: {
      label: "CSS",
      className: "border-[#D8C8FF] bg-[#F1ECFF] text-[#6E3AD8]",
    },
    scss: {
      label: "SCSS",
      className: "border-[#FFD0E4] bg-[#FFF0F7] text-[#B52C69]",
    },
    cpp: {
      label: "C++",
      className: "border-[#C8D7FF] bg-[#EEF3FF] text-[#3457D5]",
    },
    cc: {
      label: "C++",
      className: "border-[#C8D7FF] bg-[#EEF3FF] text-[#3457D5]",
    },
    cxx: {
      label: "C++",
      className: "border-[#C8D7FF] bg-[#EEF3FF] text-[#3457D5]",
    },
    c: {
      label: "C",
      className: "border-[#C8D7FF] bg-[#EEF3FF] text-[#3457D5]",
    },
    json: {
      label: "{}",
      className: "border-[#FFE0A8] bg-[#FFF6E8] text-[#B06300]",
    },
    md: {
      label: "MD",
      className: "border-[#D8E0EA] bg-[#F5F8FB] text-[#475569]",
    },
    mdx: {
      label: "MDX",
      className: "border-[#D8E0EA] bg-[#F5F8FB] text-[#475569]",
    },
    txt: {
      label: "TXT",
      className: "border-[#D8E0EA] bg-[#F7F9FB] text-[#64748B]",
    },
    sql: {
      label: "SQL",
      className: "border-[#BDEFD2] bg-[#EFFFF5] text-[#007A45]",
    },
    prisma: {
      label: "DB",
      className: "border-[#BDEFD2] bg-[#EFFFF5] text-[#007A45]",
    },
    env: {
      label: "ENV",
      className: "border-[#D9F99D] bg-[#F7FFE8] text-[#5F8200]",
    },
  };
  const fallbackLabel = extension
    ? extension.slice(0, 3).toUpperCase()
    : "FILE";
  const icon = meta[extension] ?? {
    label: fallbackLabel,
    className: "border-[#D8E0EA] bg-[#F7F9FB] text-[#64748B]",
  };

  return (
    <span
      className={cn(
        "grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border text-[7px] font-black leading-none shadow-[0_4px_10px_rgba(15,23,42,0.06)]",
        icon.className,
        className,
      )}
      aria-hidden="true"
      title={`${icon.label} file`}
    >
      {icon.label}
    </span>
  );
}

function monacoLanguageFor(file: FileNode | undefined, fallback: LanguageId) {
  const fileName = file?.name.toLowerCase() ?? "";
  const extension = fileName.startsWith(".env")
    ? "env"
    : (fileName.split(".").pop() ?? "");
  const byExtension: Record<string, string> = {
    c: "c",
    cc: "cpp",
    cpp: "cpp",
    css: "css",
    cxx: "cpp",
    env: "plaintext",
    html: "html",
    js: "javascript",
    json: "json",
    jsx: "javascript",
    md: "markdown",
    mdx: "markdown",
    prisma: "graphql",
    py: "python",
    scss: "scss",
    sql: "sql",
    ts: "typescript",
    tsx: "typescript",
    txt: "plaintext",
  };
  const byLanguage: Record<string, string> = {
    cpp: "cpp",
    html: "html",
    javascript: "javascript",
    json: "json",
    markdown: "markdown",
    python: "python",
    text: "plaintext",
    typescript: "typescript",
  };
  const explicitLanguage = file?.language ?? fallback;

  return byLanguage[explicitLanguage] ?? byExtension[extension] ?? "plaintext";
}

function useMonacoTheme() {
  const [theme, setTheme] = useState("nexora-code-light");

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      setTheme(
        root.classList.contains("light")
          ? "nexora-code-light"
          : "nexora-code-dark",
      );
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return theme;
}

function FileTreeItem({
  file,
  active,
  dirty,
  onClick,
  onRename,
  onDelete,
}: {
  file: FileNode;
  active: boolean;
  dirty: boolean;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex w-full items-center gap-1 rounded-xl px-1 py-1 text-left text-sm transition",
        active
          ? "bg-[#DFF8EA] text-[#005F37]"
          : "text-[#3D4A63] hover:bg-[#EFFFF5]",
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1 text-left"
      >
        <FileTypeIcon
          name={file.name}
          className={cn(
            "h-5 w-5",
            active ? "shadow-[0_0_0_2px_rgba(0,155,90,0.12)]" : "",
          )}
        />
        <span className="min-w-0 flex-1 truncate font-medium">{file.name}</span>
        {dirty ? (
          <span
            className="h-2 w-2 rounded-full bg-[#FFB020] shadow-[0_0_8px_rgba(255,176,32,0.45)]"
            aria-label="Unsaved changes"
          />
        ) : active ? (
          <span
            className="h-2 w-2 rounded-full bg-[#009B5A] shadow-[0_0_8px_rgba(0,155,90,0.5)]"
            aria-hidden="true"
          />
        ) : null}
      </button>
      <button
        type="button"
        onClick={onRename}
        aria-label={`Rename ${file.name}`}
        title="Rename"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#5D6B82] opacity-0 transition hover:bg-white hover:text-[#009B5A] group-hover:opacity-100"
      >
        <PencilLine className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${file.name}`}
        title="Delete"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#5D6B82] opacity-0 transition hover:bg-[#FFE9D6] hover:text-[#FF7A1A] group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function FileExplorerPanel({
  folders,
  activeFileId,
  dirtyFileIds,
  onSelectFile,
  onCreateFile,
  onDuplicateFile,
  onRenameFile,
  onDeleteFile,
  onDownloadFile,
  onUploadFiles,
}: {
  folders: FolderNode[];
  activeFileId: string;
  dirtyFileIds: Set<string>;
  onSelectFile: (file: FileNode) => void;
  onCreateFile: () => void;
  onDuplicateFile: (file?: FileNode) => void;
  onRenameFile: (file: FileNode) => void;
  onDeleteFile: (file: FileNode) => void;
  onDownloadFile: (file?: FileNode) => void;
  onUploadFiles: () => void;
}) {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(folders.map((folder) => [folder.id, true])),
  );
  const [query, setQuery] = useState("");
  const activeFile = flattenFiles(folders).find(
    (file) => file.id === activeFileId,
  );
  const filteredFolders = folders
    .map((folder) => ({
      ...folder,
      files: folder.files.filter((file) =>
        file.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    }))
    .filter((folder) => folder.files.length > 0 || !query.trim());

  function toggleFolder(id: string) {
    setOpenFolders((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <aside
      className={cn(cardClass, "flex h-full min-h-0 flex-col overflow-hidden")}
    >
      <header className="flex items-center justify-between border-b border-[#F0F4F4] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <IconChip icon={FolderOpen} tone="emerald" size="sm" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1B33]">
            Explorer
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCreateFile}
            title="New file"
            aria-label="New file"
            className="grid h-8 w-8 place-items-center rounded-lg text-[#5D6B82] transition hover:bg-[#EFFFF5] hover:text-[#009B5A]"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onUploadFiles}
            title="Upload files"
            aria-label="Upload files"
            className="grid h-8 w-8 place-items-center rounded-lg text-[#5D6B82] transition hover:bg-[#EFFFF5] hover:text-[#009B5A]"
          >
            <UploadIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDownloadFile(activeFile)}
            title="Download active file"
            aria-label="Download active file"
            className="grid h-8 w-8 place-items-center rounded-lg text-[#5D6B82] transition hover:bg-[#EFFFF5] hover:text-[#009B5A]"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (activeFile) onRenameFile(activeFile);
            }}
            title="Rename active file"
            aria-label="Rename active file"
            className="grid h-8 w-8 place-items-center rounded-lg text-[#5D6B82] transition hover:bg-[#EFFFF5] hover:text-[#009B5A]"
          >
            <PencilLine className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <label className="relative mb-3 block">
          <span className="sr-only">Search files</span>
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#8A99AA]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search files..."
            className="h-9 w-full rounded-xl border border-[#E6EEF0] bg-[#FAFCFC] pl-9 pr-3 text-sm font-medium text-[#0B1B33] outline-none transition focus:border-[#009B5A] focus:bg-white focus:ring-2 focus:ring-[#DFF8EA]"
          />
        </label>
        <div className="grid gap-3">
          {filteredFolders.map((folder) => {
            const isOpen = openFolders[folder.id] ?? true;
            return (
              <div key={folder.id}>
                <button
                  type="button"
                  onClick={() => toggleFolder(folder.id)}
                  className="flex w-full items-center gap-1.5 rounded-lg px-1.5 py-1 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5D6B82] transition hover:text-[#0B1B33]"
                  aria-expanded={isOpen}
                >
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                  {folder.name}
                </button>
                {isOpen ? (
                  <div className="mt-1 grid gap-0.5 pl-2">
                    {folder.files.map((file) => (
                      <FileTreeItem
                        key={file.id}
                        file={file}
                        active={file.id === activeFileId}
                        dirty={dirtyFileIds.has(file.id)}
                        onClick={() => onSelectFile(file)}
                        onRename={() => onRenameFile(file)}
                        onDelete={() => onDeleteFile(file)}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <footer className="flex items-center gap-1 border-t border-[#F0F4F4] px-3 py-2">
        {[
          { label: "New file", icon: Plus, action: onCreateFile },
          {
            label: "Rename active file",
            icon: PencilLine,
            action: () => {
              const activeFile = flattenFiles(folders).find(
                (file) => file.id === activeFileId,
              );
              if (activeFile) onRenameFile(activeFile);
            },
          },
          {
            label: "Duplicate active file",
            icon: Copy,
            action: () => {
              if (activeFile) onDuplicateFile(activeFile);
            },
          },
          {
            label: "Delete active file",
            icon: Trash2,
            action: () => {
              if (activeFile) onDeleteFile(activeFile);
            },
          },
        ].map((action) => {
          const ActionIcon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={action.action}
              className="grid h-8 w-8 place-items-center rounded-lg text-[#5D6B82] transition hover:bg-[#EFFFF5] hover:text-[#009B5A]"
              aria-label={action.label}
              title={action.label}
            >
              <ActionIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          );
        })}
      </footer>
    </aside>
  );
}

function ActivityBar({
  activePanel,
  dirtyCount,
  problemCount,
  onSelectPanel,
}: {
  activePanel: IdePanelId;
  dirtyCount: number;
  problemCount: number;
  onSelectPanel: (panel: IdePanelId) => void;
}) {
  const items: {
    id: IdePanelId;
    label: string;
    icon: LucideIcon;
    badge?: number;
  }[] = [
    { id: "explorer", label: "Explorer", icon: FolderOpen, badge: dirtyCount },
    { id: "search", label: "Search", icon: Search },
    { id: "tests", label: "Tests", icon: CheckCircle2, badge: problemCount },
    { id: "history", label: "History", icon: RefreshCw },
    { id: "ai", label: "AI", icon: Sparkles },
  ];

  return (
    <nav
      aria-label="Code Lab panels"
      className="flex h-full min-h-0 flex-col items-center gap-2 rounded-[22px] border border-[#E6EEF0] bg-[#F8FCFA] px-1.5 py-2 shadow-[0_12px_40px_rgba(15,23,42,0.05)]"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.id === activePanel;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectPanel(item.id)}
            aria-label={item.label}
            aria-pressed={active}
            title={item.label}
            className={cn(
              "relative grid h-10 w-10 place-items-center rounded-2xl text-[#5D6B82] transition",
              active
                ? "bg-[#DFF8EA] text-[#005F37] shadow-[inset_0_0_0_1px_rgba(0,155,90,0.12)]"
                : "hover:bg-white hover:text-[#009B5A]",
            )}
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            {item.badge && item.badge > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#FFB020] px-1 text-[9px] font-black text-white shadow-[0_5px_12px_rgba(255,176,32,0.35)]">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            ) : null}
          </button>
        );
      })}
      <div className="mt-auto grid h-10 w-10 place-items-center rounded-2xl text-[#8A99AA]">
        <Code2 className="h-[18px] w-[18px]" aria-hidden="true" />
      </div>
    </nav>
  );
}

function SearchPanel({
  files,
  fileContents,
  onSelectFile,
}: {
  files: FileNode[];
  fileContents: Record<string, string>;
  onSelectFile: (file: FileNode) => void;
}) {
  const [query, setQuery] = useState("");
  const results = query.trim()
    ? files
        .map((file) => {
          const content = fileContents[file.id] ?? file.content;
          const index = content
            .toLowerCase()
            .indexOf(query.trim().toLowerCase());

          return index >= 0 ||
            file.name.toLowerCase().includes(query.trim().toLowerCase())
            ? {
                file,
                preview:
                  index >= 0
                    ? content.slice(
                        Math.max(0, index - 28),
                        index + query.length + 48,
                      )
                    : file.name,
              }
            : null;
        })
        .filter((item): item is { file: FileNode; preview: string } =>
          Boolean(item),
        )
    : [];

  return (
    <aside
      className={cn(cardClass, "flex h-full min-h-0 flex-col overflow-hidden")}
    >
      <header className="border-b border-[#F0F4F4] px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1B33]">
          Search
        </p>
        <label className="relative mt-3 block">
          <span className="sr-only">Search workspace</span>
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#8A99AA]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search files and code..."
            className="h-9 w-full rounded-xl border border-[#E6EEF0] bg-[#FAFCFC] pl-9 pr-3 text-sm font-medium text-[#0B1B33] outline-none transition focus:border-[#009B5A] focus:bg-white focus:ring-2 focus:ring-[#DFF8EA]"
          />
        </label>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {query.trim() ? (
          results.length > 0 ? (
            <div className="grid gap-2">
              {results.map((result) => (
                <button
                  key={result.file.id}
                  type="button"
                  onClick={() => onSelectFile(result.file)}
                  className="rounded-2xl border border-[#E6EEF0] bg-[#FAFCFC] p-3 text-left transition hover:border-[#BDEFD2] hover:bg-[#EFFFF5]"
                >
                  <div className="flex items-center gap-2">
                    <FileTypeIcon name={result.file.name} />
                    <span className="min-w-0 truncate text-sm font-semibold text-[#0B1B33]">
                      {result.file.name}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 font-mono text-[11px] leading-5 text-[#5D6B82]">
                    {result.preview || "Name match"}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-[#E6EEF0] bg-[#FAFCFC] p-4 text-sm font-medium text-[#5D6B82]">
              No results.
            </p>
          )
        ) : (
          <p className="rounded-2xl border border-[#E6EEF0] bg-[#FAFCFC] p-4 text-sm font-medium text-[#5D6B82]">
            Search file names and code content across this workspace.
          </p>
        )}
      </div>
    </aside>
  );
}

function TestsPanel({
  tests,
  onRunTests,
}: {
  tests: TestCase[];
  onRunTests: () => void;
}) {
  const passed = tests.filter((test) => test.status === "passed").length;

  return (
    <aside
      className={cn(cardClass, "flex h-full min-h-0 flex-col overflow-hidden")}
    >
      <header className="flex items-center justify-between border-b border-[#F0F4F4] px-3 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1B33]">
            Tests
          </p>
          <p className="mt-1 text-xs font-medium text-[#5D6B82]">
            {passed}/{tests.length} passing
          </p>
        </div>
        <button
          type="button"
          onClick={onRunTests}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#009B5A] px-3 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(0,155,90,0.22)] transition hover:bg-[#00B86B]"
        >
          <Play className="h-3.5 w-3.5" />
          Run
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="grid gap-2">
          {tests.map((test) => (
            <TestCaseItem key={test.id} test={test} />
          ))}
        </div>
      </div>
    </aside>
  );
}

function HistoryPanel({
  versions,
  onSelectVersion,
}: {
  versions: StoredCodeLabWorkspace["versions"];
  onSelectVersion: (
    version: StoredCodeLabWorkspace["versions"][number],
  ) => void;
}) {
  return (
    <aside
      className={cn(cardClass, "flex h-full min-h-0 flex-col overflow-hidden")}
    >
      <header className="border-b border-[#F0F4F4] px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1B33]">
          Versions
        </p>
        <p className="mt-1 text-xs font-medium text-[#5D6B82]">
          Recent saves and submissions
        </p>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {versions.length > 0 ? (
          <div className="grid gap-2">
            {versions.map((version) => (
              <button
                key={version.id}
                type="button"
                onClick={() => onSelectVersion(version)}
                className="rounded-2xl border border-[#E6EEF0] bg-[#FAFCFC] p-3 text-left transition hover:border-[#BDEFD2] hover:bg-[#EFFFF5]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-sm font-semibold text-[#0B1B33]">
                    {version.fileName}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-[#009B5A]">
                    {version.language}
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-[#5D6B82]">
                  {new Date(version.updatedAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-[#E6EEF0] bg-[#FAFCFC] p-4 text-sm font-medium text-[#5D6B82]">
            No versions saved yet.
          </p>
        )}
      </div>
    </aside>
  );
}

function AiPanel({
  activeAiAction,
  onAiAction,
}: {
  activeAiAction: AiAction | null;
  onAiAction: (action: AiAction) => void;
}) {
  const actions: { id: AiAction; label: string; detail: string }[] = [
    {
      id: "explain",
      label: "Explain Code",
      detail: "Summarize logic and flow.",
    },
    {
      id: "debug",
      label: "Debug Code",
      detail: "Find runtime and test issues.",
    },
    {
      id: "improve",
      label: "Improve Code",
      detail: "Suggest cleaner implementation.",
    },
  ];

  return (
    <aside
      className={cn(cardClass, "flex h-full min-h-0 flex-col overflow-hidden")}
    >
      <header className="border-b border-[#F0F4F4] px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1B33]">
          AI Assistant
        </p>
        <p className="mt-1 text-xs font-medium text-[#5D6B82]">
          Code Doctor actions for the active file
        </p>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="grid gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onAiAction(action.id)}
              disabled={activeAiAction !== null}
              className="rounded-2xl border border-[#E6EEF0] bg-[#FAFCFC] p-3 text-left transition hover:border-[#BDEFD2] hover:bg-[#EFFFF5] disabled:opacity-60"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#7C4DFF]" />
                <span className="text-sm font-semibold text-[#0B1B33]">
                  {activeAiAction === action.id ? "Thinking..." : action.label}
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-[#5D6B82]">
                {action.detail}
              </p>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function CodeLabSidebar({
  activePanel,
  folders,
  files,
  fileContents,
  activeFileId,
  dirtyFileIds,
  tests,
  versions,
  activeAiAction,
  onSelectPanel,
  onSelectFile,
  onCreateFile,
  onDuplicateFile,
  onRenameFile,
  onDeleteFile,
  onDownloadFile,
  onUploadFiles,
  onRunTests,
  onSelectVersion,
  onAiAction,
}: {
  activePanel: IdePanelId;
  folders: FolderNode[];
  files: FileNode[];
  fileContents: Record<string, string>;
  activeFileId: string;
  dirtyFileIds: Set<string>;
  tests: TestCase[];
  versions: StoredCodeLabWorkspace["versions"];
  activeAiAction: AiAction | null;
  onSelectPanel: (panel: IdePanelId) => void;
  onSelectFile: (file: FileNode) => void;
  onCreateFile: () => void;
  onDuplicateFile: (file?: FileNode) => void;
  onRenameFile: (file: FileNode) => void;
  onDeleteFile: (file: FileNode) => void;
  onDownloadFile: (file?: FileNode) => void;
  onUploadFiles: () => void;
  onRunTests: () => void;
  onSelectVersion: (
    version: StoredCodeLabWorkspace["versions"][number],
  ) => void;
  onAiAction: (action: AiAction) => void;
}) {
  const problemCount = tests.filter((test) => test.status === "failed").length;

  return (
    <div className="grid h-full min-h-0 grid-cols-[52px_minmax(0,1fr)] gap-2">
      <ActivityBar
        activePanel={activePanel}
        dirtyCount={dirtyFileIds.size}
        problemCount={problemCount}
        onSelectPanel={onSelectPanel}
      />
      {activePanel === "explorer" ? (
        <FileExplorerPanel
          folders={folders}
          activeFileId={activeFileId}
          dirtyFileIds={dirtyFileIds}
          onSelectFile={onSelectFile}
          onCreateFile={onCreateFile}
          onDuplicateFile={onDuplicateFile}
          onRenameFile={onRenameFile}
          onDeleteFile={onDeleteFile}
          onDownloadFile={onDownloadFile}
          onUploadFiles={onUploadFiles}
        />
      ) : null}
      {activePanel === "search" ? (
        <SearchPanel
          files={files}
          fileContents={fileContents}
          onSelectFile={onSelectFile}
        />
      ) : null}
      {activePanel === "tests" ? (
        <TestsPanel tests={tests} onRunTests={onRunTests} />
      ) : null}
      {activePanel === "history" ? (
        <HistoryPanel versions={versions} onSelectVersion={onSelectVersion} />
      ) : null}
      {activePanel === "ai" ? (
        <AiPanel activeAiAction={activeAiAction} onAiAction={onAiAction} />
      ) : null}
    </div>
  );
}

function CodeStatusBar({
  workspaceTitle,
  activeFile,
  language,
  dbStatus,
  autosaveStatus,
  lastAutosavedAt,
  dirtyCount,
  runStatus,
  executionMs,
  tests,
  problems,
  fileCount,
}: {
  workspaceTitle: string;
  activeFile?: FileNode;
  language: LanguageId;
  dbStatus: "loading" | "ready" | "draft";
  autosaveStatus: AutosaveStatus;
  lastAutosavedAt?: string | null;
  dirtyCount: number;
  runStatus: "idle" | "success" | "error";
  executionMs: number;
  tests: TestCase[];
  problems: ProblemItem[];
  fileCount: number;
}) {
  const passed = tests.filter((test) => test.status === "passed").length;

  return (
    <footer className="flex min-h-9 flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#DCEBE5] bg-[#063F2B] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(6,63,43,0.14)]">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <span className="max-w-[220px] truncate">{workspaceTitle}</span>
        <span className="text-[#A7F3D0]">{activeFile?.name ?? "No file"}</span>
        <span className="text-[#D9FF57]">{language}</span>
        <span>{fileCount} files</span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[#D6F7E7]">
        <span>
          DB:{" "}
          {dbStatus === "ready"
            ? "saved"
            : dbStatus === "loading"
              ? "loading"
              : "draft"}
        </span>
        <span>
          Autosave: {autosaveStatus}
          {lastAutosavedAt
            ? ` ${new Date(lastAutosavedAt).toLocaleTimeString()}`
            : ""}
        </span>
        <span>{dirtyCount > 0 ? `${dirtyCount} unsaved` : "clean"}</span>
        <span>
          Tests: {passed}/{tests.length}
        </span>
        <span>Problems: {problems.length}</span>
        <span>
          Run: {runStatus}
          {executionMs > 0 ? ` ${(executionMs / 1000).toFixed(2)}s` : ""}
        </span>
      </div>
    </footer>
  );
}

function EditorTab({
  file,
  active,
  dirty,
  onSelect,
  onClose,
  closable,
}: {
  file: FileNode;
  active: boolean;
  dirty: boolean;
  onSelect: () => void;
  onClose: () => void;
  closable: boolean;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-t-xl border-x border-t px-3 py-2 text-sm font-medium transition",
        active
          ? "border-[#E6EEF0] bg-white text-[#0B1B33] shadow-[0_-2px_0_#009B5A_inset]"
          : "border-transparent bg-transparent text-[#5D6B82] hover:bg-white/60",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex items-center gap-2"
      >
        <FileTypeIcon name={file.name} className="h-5 w-5" />
        {file.name}
        {dirty ? (
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#FFB020]"
            aria-label="Unsaved changes"
          />
        ) : null}
      </button>
      {closable ? (
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${file.name}`}
          className="grid h-5 w-5 place-items-center rounded-md text-[#5D6B82] opacity-60 transition hover:bg-[#FFE9D6] hover:text-[#FF7A1A] group-hover:opacity-100"
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  );
}

function CodeEditorPanel({
  openFiles,
  activeFileId,
  dirtyFileIds,
  workspaceExpanded,
  onToggleWorkspaceExpanded,
  onSelectTab,
  onCloseTab,
  onCreateFile,
  language,
  content,
  onContentChange,
}: {
  openFiles: FileNode[];
  activeFileId: string;
  dirtyFileIds: Set<string>;
  workspaceExpanded: boolean;
  onToggleWorkspaceExpanded: () => void;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCreateFile: () => void;
  language: LanguageId;
  content: string;
  onContentChange: (value: string) => void;
}) {
  const activeFile = openFiles.find((file) => file.id === activeFileId);
  const systemMonacoTheme = useMonacoTheme();
  const [editorThemeOverride, setEditorThemeOverride] = useState<
    "light" | "dark" | null
  >(null);
  const [isSplitView, setIsSplitView] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoTheme =
    editorThemeOverride === "dark"
      ? "nexora-code-dark"
      : editorThemeOverride === "light"
        ? "nexora-code-light"
        : systemMonacoTheme;
  const editorLanguage = monacoLanguageFor(activeFile, language);
  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };
  const handleFormatDocument = () => {
    void editorRef.current?.getAction("editor.action.formatDocument")?.run();
    setMoreOpen(false);
  };
  const handleCopyFileName = () => {
    if (
      activeFile?.name &&
      typeof navigator !== "undefined" &&
      navigator.clipboard
    ) {
      void navigator.clipboard.writeText(activeFile.name);
    }
    setMoreOpen(false);
  };

  return (
    <section
      className={cn(
        cardClass,
        "flex h-full flex-col overflow-hidden",
        workspaceExpanded
          ? "min-h-0 rounded-[18px] shadow-none"
          : "min-h-[520px]",
      )}
    >
      <header className="flex shrink-0 items-end justify-between gap-3 border-b border-[#F0F4F4] bg-[#F8FCFA] px-3 pt-2">
        <div className="flex min-w-0 items-end gap-1 overflow-x-auto">
          {openFiles.map((file) => (
            <EditorTab
              key={file.id}
              file={file}
              active={file.id === activeFileId}
              dirty={dirtyFileIds.has(file.id)}
              onSelect={() => onSelectTab(file.id)}
              onClose={() => onCloseTab(file.id)}
              closable={openFiles.length > 1}
            />
          ))}
          <button
            type="button"
            title="Add tab"
            aria-label="Add tab"
            onClick={onCreateFile}
            className="ml-1 mb-1 grid h-7 w-7 place-items-center rounded-md text-[#5D6B82] transition hover:bg-white hover:text-[#009B5A]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="mb-2 flex items-center gap-1">
          <button
            type="button"
            title="Toggle editor theme"
            aria-label="Toggle editor theme"
            aria-pressed={editorThemeOverride === "dark"}
            onClick={() =>
              setEditorThemeOverride((current) =>
                current === "dark" ? "light" : "dark",
              )
            }
            className="grid h-8 w-8 place-items-center rounded-lg text-[#5D6B82] transition hover:bg-white hover:text-[#009B5A]"
          >
            <Palette className="h-4 w-4" />
          </button>
          <button
            type="button"
            title={
              workspaceExpanded
                ? "Collapse editor"
                : "Expand editor with terminal"
            }
            aria-label={workspaceExpanded ? "Collapse editor" : "Expand editor"}
            aria-pressed={workspaceExpanded}
            onClick={onToggleWorkspaceExpanded}
            className="grid h-8 w-8 place-items-center rounded-lg text-[#5D6B82] transition hover:bg-white hover:text-[#009B5A]"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <div className="relative">
            <button
              type="button"
              title="More"
              aria-label="More actions"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((current) => !current)}
              className="grid h-8 w-8 place-items-center rounded-lg text-[#5D6B82] transition hover:bg-white hover:text-[#009B5A]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {moreOpen ? (
              <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-[#E6EEF0] bg-white p-1.5 text-sm font-semibold text-[#0B1B33] shadow-[0_16px_36px_rgba(15,23,42,0.14)]">
                <button
                  type="button"
                  onClick={handleFormatDocument}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-left transition hover:bg-[#EFFFF5] hover:text-[#005F37]"
                >
                  Format document
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSplitView((current) => !current);
                    setMoreOpen(false);
                  }}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-left transition hover:bg-[#EFFFF5] hover:text-[#005F37]"
                >
                  {isSplitView ? "Close split editor" : "Split editor"}
                </button>
                <button
                  type="button"
                  onClick={handleCopyFileName}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-left transition hover:bg-[#EFFFF5] hover:text-[#005F37]"
                >
                  Copy file name
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div
        className={cn(
          "relative min-h-0 flex-1 overflow-hidden bg-white font-mono text-[14px] leading-[24px] light:bg-white",
          isSplitView &&
            "grid grid-cols-1 divide-[#E6EEF0] md:grid-cols-2 md:divide-x",
        )}
      >
        {["primary", ...(isSplitView ? ["split"] : [])].map((pane) => (
          <MonacoEditor
            key={`${activeFile?.id ?? activeFileId}-${pane}`}
            beforeMount={configureMonaco}
            defaultLanguage={editorLanguage}
            height="100%"
            keepCurrentModel
            language={editorLanguage}
            onChange={(value) => onContentChange(value ?? "")}
            onMount={pane === "primary" ? handleEditorMount : undefined}
            options={monacoOptions}
            path={`file:///nexora-code-lab/${activeFile?.id ?? activeFileId}-${pane}`}
            saveViewState
            theme={monacoTheme}
            value={content}
            width="100%"
          />
        ))}
      </div>
    </section>
  );
}

type ConsoleTab =
  | "console"
  | "terminal"
  | "input"
  | "output"
  | "errors"
  | "problems";

function TerminalPanel({
  command,
  cwd,
  history,
  suggestions,
  isRunning,
  onCommandChange,
  onRun,
  onClear,
}: {
  command: string;
  cwd: string;
  history: TerminalEntry[];
  suggestions: string[];
  isRunning: boolean;
  onCommandChange: (value: string) => void;
  onRun: () => void;
  onClear: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const commandHistory = useMemo(
    () => history.map((entry) => entry.command).filter(Boolean),
    [history],
  );
  const promptCwd = history.at(-1)?.cwd ?? cwd;
  const matchingSuggestions = useMemo(() => {
    const query = command.trim().toLowerCase();

    if (!query) return suggestions.slice(0, 6);

    return suggestions
      .filter((item) => item.toLowerCase().startsWith(query))
      .slice(0, 6);
  }, [command, suggestions]);

  useEffect(() => {
    const node = scrollRef.current;

    if (!node) return;

    node.scrollTop = node.scrollHeight;
  }, [history, isRunning]);

  function recallCommand(direction: "up" | "down") {
    if (commandHistory.length === 0) return;

    if (direction === "up") {
      const nextIndex =
        historyIndex === null
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);

      setHistoryIndex(nextIndex);
      onCommandChange(commandHistory[nextIndex] ?? "");
      return;
    }

    if (historyIndex === null) return;

    const nextIndex = historyIndex + 1;

    if (nextIndex >= commandHistory.length) {
      setHistoryIndex(null);
      onCommandChange("");
      return;
    }

    setHistoryIndex(nextIndex);
    onCommandChange(commandHistory[nextIndex] ?? "");
  }

  function autocompleteCommand() {
    const query = command.trim();
    const match = suggestions.find((item) =>
      item.toLowerCase().startsWith(query.toLowerCase()),
    );

    if (match) {
      onCommandChange(match);
    }
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      recallCommand("up");
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      recallCommand("down");
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      autocompleteCommand();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "l") {
      event.preventDefault();
      onClear();
    }
  }

  return (
    <div className="grid h-full min-h-[150px] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-xl border border-[#24342F] bg-[#0D1110] text-[#D6F7E7] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex min-h-9 items-center justify-between gap-2 border-b border-[#1F2B27] bg-[#111816] px-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className="inline-flex h-7 max-w-[180px] items-center gap-2 rounded-md bg-[#1E2B26] px-2 text-xs font-semibold text-[#F5F7F2]"
            title="nexora-sandbox"
          >
            <span className="h-2 w-2 rounded-full bg-[#32F59A]" />
            <span className="truncate">nexora-sandbox</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onCommandChange("help");
              inputRef.current?.focus();
            }}
            className="grid h-7 w-7 place-items-center rounded-md text-[#A7B3AA] transition hover:bg-[#1E2B26] hover:text-[#D9FF57]"
            aria-label="New terminal"
            title="New terminal"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-md text-[#6E7A72]"
            aria-label="Split terminal"
            title="Split terminal will be available with streaming sessions"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7B8C82]">
          <span>{isRunning ? "running" : "ready"}</span>
          <button
            type="button"
            onClick={onClear}
            className="grid h-7 w-7 place-items-center rounded-md text-[#A7B3AA] transition hover:bg-[#2A1515] hover:text-[#FFB4A8]"
            aria-label="Kill terminal"
            title="Kill terminal"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 overflow-auto px-3 py-2 font-mono text-[12.5px] leading-[21px]"
        onClick={() => inputRef.current?.focus()}
      >
        {history.length === 0 ? (
          <div className="text-[#7B8C82]">
            Nexora Code Lab terminal. Type{" "}
            <span className="text-[#D9FF57]">help</span>.
          </div>
        ) : null}
        {history.map((entry) => (
          <div key={entry.id} className="py-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[#32F59A]">{entry.cwd}</span>
              <span className="text-[#D9FF57]">$</span>
              <span className="text-[#F5F7F2]">{entry.command}</span>
              {entry.executionTimeMs !== undefined ? (
                <span className="ml-auto text-[10px] uppercase text-[#6E7A72]">
                  {entry.adapter === "nexora-docker-sandbox"
                    ? "docker"
                    : "safe"}{" "}
                  · {entry.executionTimeMs}ms
                </span>
              ) : null}
            </div>
            {entry.stdout ? (
              <pre className="mt-1 whitespace-pre-wrap break-words text-[#D6F7E7]">
                {entry.stdout}
              </pre>
            ) : null}
            {entry.stderr ? (
              <pre className="mt-1 whitespace-pre-wrap break-words text-[#FFB4A8]">
                {entry.stderr}
              </pre>
            ) : null}
          </div>
        ))}
        {isRunning ? (
          <div className="py-1">
            <PenguinLoadingSpinner
              size="sm"
              showText={true}
              text="Executing command"
            />
          </div>
        ) : null}
      </div>

      <div className="border-t border-[#1F2B27] bg-[#0B0F0D] px-3 py-2">
        {matchingSuggestions.length > 0 && command.trim() ? (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {matchingSuggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  onCommandChange(item);
                  inputRef.current?.focus();
                }}
                className="rounded-md border border-[#263E34] bg-[#101A16] px-2 py-0.5 text-[11px] font-semibold text-[#A7B3AA] transition hover:border-[#32F59A66] hover:text-[#D9FF57]"
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setHistoryIndex(null);
            onRun();
          }}
          className="flex items-center gap-2"
        >
          <span className="shrink-0 text-[#32F59A]">{promptCwd}</span>
          <span className="shrink-0 text-[#D9FF57]">$</span>
          <input
            ref={inputRef}
            value={command}
            onChange={(event) => onCommandChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="python main.py"
            disabled={isRunning}
            className="h-7 min-w-0 flex-1 bg-transparent font-mono text-[13px] text-[#F5F7F2] caret-[#D9FF57] outline-none placeholder:text-[#4E5B54] disabled:opacity-60"
          />
        </form>
      </div>
    </div>
  );
}

function ConsolePanel({
  consoleOutput,
  errorOutput,
  htmlPreview,
  problems,
  inputValue,
  terminalCommand,
  terminalHistory,
  terminalCwd,
  terminalSuggestions,
  isTerminalRunning,
  onInputChange,
  onTerminalCommandChange,
  onRunTerminal,
  onClearTerminal,
  onClear,
  consoleHeight,
  onConsoleHeightChange,
  executionMs,
  status,
}: {
  consoleOutput: string;
  errorOutput: string;
  htmlPreview?: string;
  problems: ProblemItem[];
  inputValue: string;
  terminalCommand: string;
  terminalHistory: TerminalEntry[];
  terminalCwd: string;
  terminalSuggestions: string[];
  isTerminalRunning: boolean;
  onInputChange: (value: string) => void;
  onTerminalCommandChange: (value: string) => void;
  onRunTerminal: () => void;
  onClearTerminal: () => void;
  onClear: () => void;
  consoleHeight: number;
  onConsoleHeightChange: (value: number) => void;
  executionMs: number;
  status: "success" | "error" | "idle";
}) {
  const [tab, setTab] = useState<ConsoleTab>("console");

  const tabs: { id: ConsoleTab; label: string }[] = [
    { id: "console", label: "Console" },
    { id: "terminal", label: "Terminal" },
    { id: "input", label: "Input" },
    { id: "output", label: "Output" },
    { id: "errors", label: "Errors" },
    { id: "problems", label: "Problems" },
  ];

  return (
    <section
      className={cn(
        cardClass,
        "flex h-full min-h-[190px] flex-col overflow-hidden",
      )}
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#F0F4F4] px-3 py-2">
        <div className="flex items-center gap-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                tab === item.id
                  ? "bg-[#DFF8EA] text-[#005F37]"
                  : "text-[#5D6B82] hover:bg-[#EFFFF5] hover:text-[#0B1B33]",
              )}
              aria-pressed={tab === item.id}
            >
              {item.label}
              {item.id === "errors" && errorOutput ? (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FFE9D6] px-1 text-[10px] font-bold text-[#FF7A1A]">
                  1
                </span>
              ) : item.id === "problems" && problems.length > 0 ? (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FFE9D6] px-1 text-[10px] font-bold text-[#FF7A1A]">
                  {problems.length}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center rounded-lg border border-[#E6EEF0] bg-white p-0.5">
            <button
              type="button"
              onClick={() =>
                onConsoleHeightChange(Math.max(160, consoleHeight - 40))
              }
              className="grid h-7 w-7 place-items-center rounded-md text-sm font-bold text-[#5D6B82] transition hover:bg-[#EFFFF5] hover:text-[#009B5A]"
              aria-label="Shrink console"
              title="Shrink console"
            >
              -
            </button>
            <button
              type="button"
              onClick={() =>
                onConsoleHeightChange(Math.min(420, consoleHeight + 40))
              }
              className="grid h-7 w-7 place-items-center rounded-md text-sm font-bold text-[#5D6B82] transition hover:bg-[#EFFFF5] hover:text-[#009B5A]"
              aria-label="Expand console"
              title="Expand console"
            >
              +
            </button>
          </div>
          {status === "success" ? (
            <span className={cn(pillBase, "bg-[#DFF8EA] text-[#005F37]")}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Success
            </span>
          ) : status === "error" ? (
            <span className={cn(pillBase, "bg-[#FFE9D6] text-[#A8420C]")}>
              <AlertTriangle className="h-3.5 w-3.5" />
              Errors
            </span>
          ) : null}
          <span className="text-xs font-medium text-[#5D6B82]">
            {executionMs > 0 ? `${(executionMs / 1000).toFixed(2)}s` : "—"}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E6EEF0] bg-white px-2.5 text-xs font-medium text-[#5D6B82] transition hover:border-[#FFE9D6] hover:text-[#FF7A1A]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto bg-[#FAFCFC] p-3 font-mono text-[13px] leading-[22px] text-[#0B1B33]">
        {tab === "console" ? (
          <pre className="m-0 whitespace-pre-wrap break-words">
            {consoleOutput || "Ready."}
          </pre>
        ) : null}
        {tab === "terminal" ? (
          <TerminalPanel
            command={terminalCommand}
            cwd={terminalCwd}
            history={terminalHistory}
            suggestions={terminalSuggestions}
            isRunning={isTerminalRunning}
            onCommandChange={onTerminalCommandChange}
            onRun={onRunTerminal}
            onClear={onClearTerminal}
          />
        ) : null}
        {tab === "input" ? (
          <textarea
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            rows={5}
            placeholder="Provide stdin for your program..."
            className="w-full resize-y rounded-xl border border-[#E6EEF0] bg-white px-3 py-2 font-mono text-[13px] text-[#0B1B33] outline-none focus:border-[#009B5A] focus:ring-2 focus:ring-[#DFF8EA]"
          />
        ) : null}
        {tab === "output" ? (
          htmlPreview ? (
            <iframe
              title="HTML preview"
              sandbox="allow-scripts"
              srcDoc={htmlPreview}
              className="h-full min-h-[150px] w-full rounded-xl border border-[#E6EEF0] bg-white"
            />
          ) : (
            <pre className="m-0 whitespace-pre-wrap break-words text-[#0B1B33]">
              {consoleOutput.split("\n\n")[0] || "—"}
            </pre>
          )
        ) : null}
        {tab === "errors" ? (
          <pre className="m-0 whitespace-pre-wrap break-words text-[#A8420C]">
            {errorOutput || "No errors in the last run."}
          </pre>
        ) : null}
        {tab === "problems" ? (
          problems.length > 0 ? (
            <div className="grid gap-2 font-sans">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className="rounded-xl border border-[#FFE9D6] bg-white px-3 py-2 text-sm text-[#0B1B33]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{problem.source}</span>
                    <span
                      className={cn(
                        pillBase,
                        problem.severity === "error"
                          ? "bg-[#FFE4E1] text-[#B91C1C]"
                          : "bg-[#FFF6E8] text-[#A36A00]",
                      )}
                    >
                      {problem.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-[#3D4A63]">{problem.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-sans text-sm font-medium text-[#5D6B82]">
              No problems detected in the latest run.
            </p>
          )
        ) : null}
      </div>
    </section>
  );
}

function QuickOpenPalette({
  files,
  query,
  onQueryChange,
  onSelectFile,
  onClose,
}: {
  files: FileNode[];
  query: string;
  onQueryChange: (value: string) => void;
  onSelectFile: (file: FileNode) => void;
  onClose: () => void;
}) {
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-[120] bg-[#07110C]/35 p-4 backdrop-blur-sm">
      <div className="mx-auto mt-[8vh] w-full max-w-xl overflow-hidden rounded-3xl border border-[#DFF8EA] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.24)]">
        <div className="flex items-center gap-3 border-b border-[#E6EEF0] px-4 py-3">
          <Command className="h-4 w-4 text-[#009B5A]" />
          <input
            autoFocus
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") onClose();
              if (event.key === "Enter" && filteredFiles[0]) {
                onSelectFile(filteredFiles[0]);
                onClose();
              }
            }}
            placeholder="Jump to file..."
            className="h-9 min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#0B1B33] outline-none placeholder:text-[#8A99AA]"
          />
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-[#5D6B82] transition hover:bg-[#EFFFF5] hover:text-[#009B5A]"
            aria-label="Close quick open"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[360px] overflow-y-auto p-2">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => {
                  onSelectFile(file);
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-[#EFFFF5]"
              >
                <FileTypeIcon name={file.name} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#0B1B33]">
                  {file.name}
                </span>
                <span className="text-xs font-medium text-[#5D6B82]">
                  {file.language}
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-sm font-medium text-[#5D6B82]">
              No matching files.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

type InstructionTab = "instructions" | "examples" | "help";

function TestCaseItem({ test }: { test: TestCase }) {
  const isPassed = test.status === "passed";
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E6EEF0] bg-[#FAFCFC] px-3 py-2">
      <div className="min-w-0 font-mono text-xs text-[#3D4A63]">
        <span className="text-[#5D6B82]">In:</span>{" "}
        <span className="font-semibold text-[#0B1B33]">{test.input}</span>
        <span className="mx-2 text-[#CBD5E1]">|</span>
        <span className="text-[#5D6B82]">Exp:</span>{" "}
        <span className="font-semibold text-[#0B1B33]">{test.expected}</span>
      </div>
      <span
        className={cn(
          pillBase,
          isPassed
            ? "bg-[#DFF8EA] text-[#005F37]"
            : test.status === "failed"
              ? "bg-[#FFE4E1] text-[#B91C1C]"
              : "bg-[#FFE9D6] text-[#A8420C]",
        )}
      >
        {isPassed ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : test.status === "failed" ? (
          <AlertTriangle className="h-3.5 w-3.5" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" />
        )}
        {isPassed ? "Passed" : test.status === "failed" ? "Failed" : "Pending"}
      </span>
    </div>
  );
}

function InstructionPanel({
  tests,
  onRunTests,
  onAiAction,
  activeAiAction,
}: {
  tests: TestCase[];
  onRunTests: () => void;
  onAiAction: (action: AiAction) => void;
  activeAiAction: AiAction | null;
}) {
  const [tab, setTab] = useState<InstructionTab>("instructions");

  const tabs: { id: InstructionTab; label: string }[] = [
    { id: "instructions", label: "Task" },
    { id: "examples", label: "Examples" },
    { id: "help", label: "Tips" },
  ];

  const requirements = [
    "Read an integer input",
    "Return factorial",
    "Handle invalid inputs",
  ];
  const aiActions: { id: AiAction; label: string }[] = [
    { id: "explain", label: "Explain Code" },
    { id: "debug", label: "Debug Code" },
    { id: "improve", label: "Improve Code" },
  ];

  return (
    <aside
      className={cn(cardClass, "flex h-full min-h-0 flex-col overflow-hidden")}
    >
      <header className="flex items-center gap-1 border-b border-[#F0F4F4] px-3 py-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
              tab === item.id
                ? "bg-[#DFF8EA] text-[#005F37]"
                : "text-[#5D6B82] hover:bg-[#EFFFF5] hover:text-[#0B1B33]",
            )}
            aria-pressed={tab === item.id}
          >
            {item.label}
          </button>
        ))}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {tab === "instructions" ? (
          <div className="grid gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#009B5A]">
                Problem
              </p>
              <h3 className="mt-1 text-base font-semibold text-[#0B1B33]">
                Factorial Calculator
              </h3>
              <p className="mt-1 text-sm leading-5 text-[#3D4A63]">
                Read{" "}
                <code className="rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-xs text-[#0B1B33]">
                  n
                </code>{" "}
                and print <span className="font-semibold">n!</span>.
              </p>
            </div>

            <div className="rounded-xl border border-[#DFF8EA] bg-[#EFFFF5] px-3 py-2">
              <p className="font-mono text-[12px] leading-5 text-[#005F37]">
                Factorial of n = n × (n−1) × (n−2) × ... × 1
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5D6B82]">
                Requirements
              </p>
              <ul className="mt-2 grid gap-1.5">
                {requirements.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm leading-5 text-[#3D4A63]"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#009B5A]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5D6B82]">
                  Test cases
                </p>
                <button
                  type="button"
                  onClick={onRunTests}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#009B5A] px-3 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(0,155,90,0.22)] transition hover:bg-[#00B86B]"
                >
                  <Play className="h-3.5 w-3.5" />
                  Run Tests
                </button>
              </div>
              <div className="mt-2 grid gap-2">
                {tests.map((test) => (
                  <TestCaseItem key={test.id} test={test} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#E6EEF0] bg-[#FAFCFC] p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5D6B82]">
                    AI actions
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#5D6B82]">
                    Route current code through Nexora Code Doctor.
                  </p>
                </div>
                <Sparkles className="h-4 w-4 shrink-0 text-[#7C4DFF]" />
              </div>
              <div className="mt-3 grid gap-2">
                {aiActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => onAiAction(action.id)}
                    disabled={activeAiAction !== null}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#DFF8EA] bg-white px-3 text-xs font-semibold text-[#005F37] transition hover:border-[#BDEFD2] hover:bg-[#EFFFF5] disabled:opacity-60"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {activeAiAction === action.id
                      ? "Thinking..."
                      : action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {tab === "examples" ? (
          <div className="grid gap-3">
            {[
              { input: "0", output: "1" },
              { input: "5", output: "120" },
              { input: "7", output: "5040" },
            ].map((example) => (
              <div
                key={example.input}
                className="rounded-xl border border-[#E6EEF0] bg-[#FAFCFC] p-3 font-mono text-[12.5px] leading-6 text-[#0B1B33]"
              >
                <div className="text-[#5D6B82]">{`>>> Input: ${example.input}`}</div>
                <div className="text-[#005F37]">{`Output: ${example.output}`}</div>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "help" ? (
          <div className="grid gap-3 text-sm text-[#3D4A63]">
            <ul className="grid gap-2">
              {[
                "Use a base case: factorial(0) returns 1",
                "Validate the input is a non-negative integer",
                "Print the formatted result with f-strings",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#7C4DFF]" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

// ---------- Main page ----------

export function CodeLabPage({ role }: { role: AppRole }) {
  const roleData = roleDashboards[role];

  const [language, setLanguage] = useState<LanguageId>("python");
  const [environment, setEnvironment] = useState<EnvironmentId>("standard");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceTitle, setWorkspaceTitle] = useState("Code Lab Workspace");
  const [dbStatus, setDbStatus] = useState<"loading" | "ready" | "draft">(
    "loading",
  );
  const [folders, setFolders] = useState<FolderNode[]>(initialFolders);

  const allFiles = useMemo(() => flattenFiles(folders), [folders]);

  const [openFileIds, setOpenFileIds] = useState<string[]>(["main.py"]);
  const [activeFileId, setActiveFileId] = useState<string>("main.py");
  const [fileContents, setFileContents] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      flattenFiles(initialFolders).map((file) => [file.id, file.content]),
    ),
  );
  const [savedFileSnapshots, setSavedFileSnapshots] = useState<
    Record<string, FileSnapshot>
  >(() =>
    fileSnapshotsFromFolders(
      initialFolders,
      fileContentsFromFolders(initialFolders),
    ),
  );
  const [versionHistory, setVersionHistory] = useState<
    StoredCodeLabWorkspace["versions"]
  >([]);
  const [consoleHeight, setConsoleHeight] = useState(240);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState("");
  const [workspaceExpanded, setWorkspaceExpanded] = useState(false);
  const [activeIdePanel, setActiveIdePanel] = useState<IdePanelId>("explorer");
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle");
  const [lastAutosavedAt, setLastAutosavedAt] = useState<string | null>(null);
  const [terminalCommand, setTerminalCommand] = useState("help");
  const [terminalHistory, setTerminalHistory] = useState<TerminalEntry[]>([]);
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const saveShortcutRef = useRef<() => void>(() => undefined);
  const runShortcutRef = useRef<() => void>(() => undefined);

  const openFiles = openFileIds
    .map((id) => {
      const base = allFiles.find((file) => file.id === id);
      if (!base) return undefined;
      return { ...base, content: fileContents[id] ?? base.content };
    })
    .filter((value): value is FileNode => Boolean(value));

  const activeFile =
    openFiles.find((file) => file.id === activeFileId) ?? openFiles[0];

  const [consoleOutput, setConsoleOutput] = useState<string>(initialConsole);
  const [errorOutput, setErrorOutput] = useState<string>("");
  const [htmlPreview, setHtmlPreview] = useState<string | undefined>();
  const [stdin, setStdin] = useState<string>("5");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionMs, setExecutionMs] = useState<number>(0);
  const [runStatus, setRunStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [tests, setTests] = useState<TestCase[]>(initialTests);
  const [lastRunResult, setLastRunResult] = useState<CodeRunResult | null>(
    null,
  );
  const [activeAiAction, setActiveAiAction] = useState<AiAction | null>(null);
  const dirtyFileIds = useMemo(() => {
    return new Set(
      allFiles
        .filter((file) => {
          const snapshot = savedFileSnapshots[file.id];

          return (
            !snapshot ||
            snapshot.name !== file.name ||
            snapshot.language !== file.language ||
            snapshot.content !== (fileContents[file.id] ?? file.content)
          );
        })
        .map((file) => file.id),
    );
  }, [allFiles, fileContents, savedFileSnapshots]);
  const problems = useMemo<ProblemItem[]>(() => {
    const items: ProblemItem[] = [];

    if (errorOutput.trim()) {
      items.push({
        id: "runtime-error",
        severity: "error",
        source: activeFile?.name ?? "Runtime",
        message: errorOutput.trim().split("\n")[0] ?? "Runtime error.",
      });
    }

    for (const test of tests.filter((item) => item.status === "failed")) {
      items.push({
        id: `test-${test.id}`,
        severity: "warning",
        source: "Test case",
        message: `Input ${test.input} expected ${test.expected}.`,
      });
    }

    return items;
  }, [activeFile?.name, errorOutput, tests]);
  const terminalCwd = useMemo(
    () =>
      terminalHistory.at(-1)?.cwd ?? terminalCwdForWorkspace(workspaceTitle),
    [terminalHistory, workspaceTitle],
  );
  const terminalSuggestions = useMemo(() => {
    const fileCommands = allFiles.flatMap((file) => {
      const commands = [`cat ${file.name}`];

      if (file.name.endsWith(".py")) {
        commands.push(`python ${file.name}`);
      }

      if (file.name.endsWith(".js")) {
        commands.push(`node ${file.name}`);
      }

      return commands;
    });

    return [
      "help",
      "pwd",
      "ls",
      "status",
      "submit-status",
      "run",
      "test",
      "npm test",
      ...fileCommands,
    ];
  }, [allFiles]);

  function applyDatabaseWorkspace(workspace: CodeLabApiWorkspace) {
    const nextFolders = foldersFromApiFiles(workspace.files);
    const nextActiveFileId =
      workspace.activeFileId ?? workspace.files[0]?.id ?? "main.py";
    const hydratedFolders =
      nextFolders.length > 0 ? nextFolders : initialFolders;
    const hydratedContents = fileContentsFromFolders(hydratedFolders);

    setWorkspaceId(workspace.id);
    setWorkspaceTitle(workspace.title);
    setFolders(hydratedFolders);
    setFileContents(hydratedContents);
    setSavedFileSnapshots(
      fileSnapshotsFromFolders(hydratedFolders, hydratedContents),
    );
    setOpenFileIds([nextActiveFileId]);
    setActiveFileId(nextActiveFileId);
    setLanguage(
      runnerLanguageFor(
        flattenFiles(nextFolders).find((file) => file.id === nextActiveFileId),
        "python",
      ) as LanguageId,
    );
    setVersionHistory(
      (workspace.versions ?? []).map((version) => ({
        id: version.id,
        fileName:
          workspace.files.find((file) => file.id === version.fileId)?.name ??
          version.title,
        language: version.language,
        code: version.code,
        updatedAt: version.createdAt,
      })),
    );
    setLastAutosavedAt(workspace.updatedAt);
    setDbStatus("ready");
  }

  function buildApiFiles() {
    return folders.flatMap((folder) =>
      folder.files.map((file, index) => ({
        id: file.id,
        name: file.name,
        folder: folder.name,
        language: file.id === activeFileId ? language : file.language,
        content: fileContents[file.id] ?? file.content,
        sortOrder: index,
      })),
    );
  }

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      async function loadWorkspace() {
        const list = await apiGet<WorkspacesResponse>("/code-lab/workspaces");

        if (cancelled) return;

        if (list) {
          const latestWorkspace = list.workspaces[0];
          const response = latestWorkspace
            ? await apiGet<WorkspaceResponse>(
                `/code-lab/workspaces/${latestWorkspace.id}`,
              )
            : await apiPost<WorkspaceResponse>("/code-lab/workspaces", {
                title: "Code Lab Workspace",
                activeFileName: "main.py",
                files: initialFolders.flatMap((folder) =>
                  folder.files.map((file, index) => ({
                    id: file.id,
                    name: file.name,
                    folder: folder.name,
                    language: file.language,
                    content: file.content,
                    sortOrder: index,
                  })),
                ),
              });

          if (!cancelled && response?.workspace) {
            applyDatabaseWorkspace(response.workspace);
            setConsoleOutput(
              `Loaded ${response.workspace.title} from PostgreSQL.`,
            );
            return;
          }
        }

        const restoredWorkspace = readStoredWorkspace();
        if (!cancelled && restoredWorkspace) {
          setWorkspaceId(restoredWorkspace.workspaceId ?? null);
          setWorkspaceTitle(
            restoredWorkspace.workspaceTitle ?? "Code Lab Workspace",
          );
          setFolders(restoredWorkspace.folders);
          setFileContents(restoredWorkspace.fileContents);
          setSavedFileSnapshots(
            fileSnapshotsFromFolders(
              restoredWorkspace.folders,
              restoredWorkspace.fileContents,
            ),
          );
          setOpenFileIds(
            restoredWorkspace.openFileIds?.length
              ? restoredWorkspace.openFileIds
              : ["main.py"],
          );
          setActiveFileId(
            restoredWorkspace.activeFileId ??
              restoredWorkspace.openFileIds?.[0] ??
              "main.py",
          );
          setLanguage(restoredWorkspace.language ?? "python");
          setVersionHistory(restoredWorkspace.versions ?? []);
          setDbStatus("draft");
          setConsoleOutput(
            `API unavailable. Restored emergency draft from ${new Date(restoredWorkspace.updatedAt).toLocaleString()}.`,
          );
        } else if (!cancelled) {
          setDbStatus("draft");
          setConsoleOutput(
            "The server is unavailable. Your changes are saved in this browser for now.",
          );
        }
      }

      void loadWorkspace();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  function buildRunnerFiles(): CodeRunnerFile[] {
    return allFiles.map((file) => ({
      id: file.id,
      name: file.name,
      language: file.id === activeFileId ? language : file.language,
      content: fileContents[file.id] ?? file.content,
      updatedAt: new Date().toISOString(),
    }));
  }

  function languageForFile(
    file: FileNode | undefined,
    fallback: LanguageId = language,
  ) {
    const nextLanguage = runnerLanguageFor(file, fallback);

    return nextLanguage === "unsupported"
      ? fallback
      : (nextLanguage as LanguageId);
  }

  function handleLanguageChange(nextLanguage: LanguageId) {
    setLanguage(nextLanguage);

    if (!activeFile) return;

    setFolders((current) =>
      current.map((folder) => ({
        ...folder,
        files: folder.files.map((file) =>
          file.id === activeFile.id
            ? { ...file, language: nextLanguage }
            : file,
        ),
      })),
    );
    setConsoleOutput(
      `Programming language set to ${
        languageOptions.find((option) => option.id === nextLanguage)?.label ??
        nextLanguage
      } for ${activeFile.name}. Save to persist this change.`,
    );
    setErrorOutput("");
    setRunStatus("idle");
  }

  function handleEnvironmentChange(nextEnvironment: EnvironmentId) {
    setEnvironment(nextEnvironment);
    setConsoleOutput(
      `Execution environment set to ${
        environmentOptions.find((option) => option.id === nextEnvironment)
          ?.label ?? nextEnvironment
      }.`,
    );
    setErrorOutput("");
    setRunStatus("idle");
  }

  function handleSelectFile(file: FileNode) {
    if (!openFileIds.includes(file.id)) {
      setOpenFileIds((current) => [...current, file.id]);
    }
    setActiveFileId(file.id);
    setLanguage(languageForFile(file));
  }

  function handleSelectTab(id: string) {
    const file = allFiles.find((item) => item.id === id);

    setActiveFileId(id);
    setLanguage(languageForFile(file));
  }

  function handleSelectVersion(
    version: StoredCodeLabWorkspace["versions"][number],
  ) {
    const targetFile =
      allFiles.find((file) => file.name === version.fileName) ?? activeFile;

    if (!targetFile) return;

    handleSelectFile(targetFile);
    setFileContents((current) => ({
      ...current,
      [targetFile.id]: version.code,
    }));
    setLanguage(
      runnerLanguageFor(
        targetFile,
        version.language as LanguageId,
      ) as LanguageId,
    );
    setConsoleOutput(
      `Loaded ${version.fileName} from ${new Date(version.updatedAt).toLocaleString()}. Save to persist this version.`,
    );
    setErrorOutput("");
    setRunStatus("idle");
  }

  function handleCloseTab(id: string) {
    setOpenFileIds((current) => {
      const next = current.filter((value) => value !== id);
      if (id === activeFileId && next.length > 0) {
        const nextActiveId = next[next.length - 1];
        const nextFile = allFiles.find((file) => file.id === nextActiveId);

        setActiveFileId(nextActiveId);
        setLanguage(languageForFile(nextFile));
      }
      return next.length > 0 ? next : current;
    });
  }

  async function createWorkspaceFile(
    nextFile: FileNode,
    folderName = folders[0]?.name ?? "main",
  ) {
    let fileToInsert = nextFile;

    if (workspaceId) {
      const response = await apiPost<FileResponse>(
        `/code-lab/workspaces/${workspaceId}/files`,
        {
          name: nextFile.name,
          folder: folderName,
          language: nextFile.language,
          content: nextFile.content,
          sortOrder: allFiles.length,
        },
      );

      if (response?.file) {
        fileToInsert = {
          id: response.file.id,
          name: response.file.name,
          language: normalizeStoredFileLanguage(
            response.file.language,
            response.file.name,
          ),
          content: response.file.content,
        };
        setDbStatus("ready");
      } else {
        setDbStatus("draft");
        saveEmergencyDraft(versionHistory);
      }
    }

    setFolders((current) => {
      const targetIndex = Math.max(
        0,
        current.findIndex((folder) => folder.name === folderName),
      );
      const targetFolder = current[targetIndex] ?? {
        id: "main",
        name: folderName,
        files: [],
      };
      const nextFolders = current.length > 0 ? [...current] : [targetFolder];

      nextFolders[targetIndex] = {
        ...targetFolder,
        files: [...targetFolder.files, fileToInsert],
      };

      return nextFolders;
    });
    setFileContents((current) => ({
      ...current,
      [fileToInsert.id]: fileToInsert.content,
    }));
    if (workspaceId) {
      setSavedFileSnapshots((current) => ({
        ...current,
        [fileToInsert.id]: {
          name: fileToInsert.name,
          language: fileToInsert.language,
          content: fileToInsert.content,
        },
      }));
    }
    setOpenFileIds((current) => [...new Set([...current, fileToInsert.id])]);
    setActiveFileId(fileToInsert.id);
    setLanguage(languageForFile(fileToInsert));
    return fileToInsert;
  }

  async function handleCreateFile() {
    const rawName = window.prompt(
      "New file name",
      `main.${defaultExtensionForLanguage(language)}`,
    );
    if (!rawName) return;

    const requestedName = rawName.includes(".")
      ? rawName.trim()
      : `${rawName.trim()}.${defaultExtensionForLanguage(language)}`;
    if (!requestedName) return;

    const name = ensureUniqueFileName(requestedName, allFiles);
    const fileLanguage = inferLanguageFromFileName(name, language);
    const nextFile: FileNode = {
      id: name,
      name,
      language: fileLanguage,
      content: starterContentForLanguage(fileLanguage, name),
    };
    const folderName = folders[0]?.name ?? "main";
    const fileToInsert = await createWorkspaceFile(nextFile, folderName);

    setConsoleOutput(
      `Created ${fileToInsert.name}${workspaceId ? " in database" : " as draft"}.`,
    );
    setRunStatus("idle");
  }

  async function handleDuplicateFile(file = activeFile) {
    if (!file) return;

    const dotIndex = file.name.lastIndexOf(".");
    const base = dotIndex > 0 ? file.name.slice(0, dotIndex) : file.name;
    const extension = dotIndex > 0 ? file.name.slice(dotIndex) : "";
    const name = ensureUniqueFileName(`${base}-copy${extension}`, allFiles);
    const nextFile: FileNode = {
      id: name,
      name,
      language: file.language,
      content: fileContents[file.id] ?? file.content,
    };
    const folderName =
      folders.find((folder) => folder.files.some((item) => item.id === file.id))
        ?.name ??
      folders[0]?.name ??
      "main";
    const fileToInsert = await createWorkspaceFile(nextFile, folderName);

    setConsoleOutput(`Duplicated ${file.name} as ${fileToInsert.name}.`);
    setErrorOutput("");
    setRunStatus("idle");
  }

  function handleDownloadFile(file = activeFile) {
    if (!file || typeof document === "undefined") return;

    const content = fileContents[file.id] ?? file.content;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setConsoleOutput(`Downloaded ${file.name}.`);
    setRunStatus("idle");
  }

  async function handleUploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) return;

    const createdFiles: FileNode[] = [];

    for (const selectedFile of selectedFiles) {
      const name = ensureUniqueFileName(selectedFile.name, [
        ...allFiles,
        ...createdFiles,
      ]);
      const fileLanguage = inferLanguageFromFileName(name, language);
      const content = await selectedFile.text();
      const nextFile: FileNode = {
        id: name,
        name,
        language: fileLanguage,
        content,
      };

      createdFiles.push(
        await createWorkspaceFile(nextFile, folders[0]?.name ?? "main"),
      );
    }

    event.target.value = "";
    setConsoleOutput(
      `Uploaded ${createdFiles.length} file${createdFiles.length === 1 ? "" : "s"}.`,
    );
    setErrorOutput("");
    setRunStatus("idle");
  }

  async function handleRenameFile(file: FileNode) {
    const rawName = window.prompt("Rename file", file.name);
    if (!rawName || rawName.trim() === file.name) return;

    const nextName = ensureUniqueFileName(
      rawName.trim(),
      allFiles.filter((item) => item.id !== file.id),
    );
    const nextLanguage = inferLanguageFromFileName(nextName, language);
    const currentContent = fileContents[file.id] ?? file.content;
    const nextFile = {
      ...file,
      name: nextName,
      language: nextLanguage,
      content: currentContent,
    };
    let updatedFile = nextFile;

    if (workspaceId) {
      const response = await apiPatch<FileResponse>(
        `/code-lab/files/${file.id}`,
        {
          name: nextFile.name,
          language: nextFile.language,
          content: currentContent,
        },
      );

      if (response?.file) {
        updatedFile = {
          id: response.file.id,
          name: response.file.name,
          language: normalizeStoredFileLanguage(
            response.file.language,
            response.file.name,
          ),
          content: response.file.content,
        };
        setDbStatus("ready");
      } else {
        setDbStatus("draft");
        saveEmergencyDraft(versionHistory);
      }
    }

    setFolders((current) =>
      current.map((folder) => ({
        ...folder,
        files: folder.files.map((item) =>
          item.id === file.id ? updatedFile : item,
        ),
      })),
    );
    setFileContents((current) => {
      return {
        ...current,
        [updatedFile.id]: currentContent,
      };
    });
    if (workspaceId) {
      setSavedFileSnapshots((current) => {
        const next = { ...current };
        delete next[file.id];
        next[updatedFile.id] = {
          name: updatedFile.name,
          language: updatedFile.language,
          content: currentContent,
        };
        return next;
      });
    }
    setOpenFileIds((current) =>
      current.map((id) => (id === file.id ? updatedFile.id : id)),
    );
    if (activeFileId === file.id) {
      setActiveFileId(updatedFile.id);
      setLanguage(languageForFile(updatedFile));
    }
    setConsoleOutput(`Renamed ${file.name} to ${updatedFile.name}.`);
    setRunStatus("idle");
  }

  async function handleDeleteFile(file: FileNode) {
    if (allFiles.length <= 1) {
      setConsoleOutput("At least one workspace file is required.");
      setRunStatus("error");
      return;
    }

    if (!window.confirm(`Delete ${file.name}?`)) return;

    if (workspaceId) {
      const deleted = await apiDelete(`/code-lab/files/${file.id}`);

      if (deleted) {
        setDbStatus("ready");
      } else {
        setDbStatus("draft");
        saveEmergencyDraft(versionHistory);
      }
    }

    const remainingFiles = allFiles.filter((item) => item.id !== file.id);
    const nextActiveId = remainingFiles[0]?.id ?? "";

    setFolders((current) =>
      current.map((folder) => ({
        ...folder,
        files: folder.files.filter((item) => item.id !== file.id),
      })),
    );
    setFileContents((current) => {
      const rest = { ...current };
      delete rest[file.id];
      return rest;
    });
    setSavedFileSnapshots((current) => {
      const next = { ...current };
      delete next[file.id];
      return next;
    });
    setOpenFileIds((current) => {
      const next = current.filter((id) => id !== file.id);
      return next.length > 0 ? next : [nextActiveId];
    });
    if (activeFileId === file.id) {
      const nextActiveFile = remainingFiles.find(
        (item) => item.id === nextActiveId,
      );

      setActiveFileId(nextActiveId);
      setLanguage(languageForFile(nextActiveFile));
    }
    setConsoleOutput(`Deleted ${file.name}.`);
    setRunStatus("idle");
  }

  function saveEmergencyDraft(
    nextVersions: StoredCodeLabWorkspace["versions"],
  ) {
    const updatedAt = new Date().toISOString();
    const snapshot: StoredCodeLabWorkspace = {
      workspaceId: workspaceId ?? undefined,
      workspaceTitle,
      folders: folders.map((folder) => ({
        ...folder,
        files: folder.files.map((file) => ({
          ...file,
          content: fileContents[file.id] ?? file.content,
        })),
      })),
      fileContents,
      openFileIds,
      activeFileId,
      language,
      updatedAt,
      versions: nextVersions,
    };

    window.localStorage.setItem(CODE_LAB_STORAGE_KEY, JSON.stringify(snapshot));
    return updatedAt;
  }

  async function persistWorkspaceToDatabase() {
    const payload = {
      title: workspaceTitle,
      activeFileId,
      activeFileName: activeFile?.name ?? "main.py",
      files: buildApiFiles(),
    };
    const response = workspaceId
      ? await apiPatch<WorkspaceResponse>(
          `/code-lab/workspaces/${workspaceId}`,
          payload,
        )
      : await apiPost<WorkspaceResponse>("/code-lab/workspaces", payload);

    if (!response?.workspace) {
      setDbStatus("draft");
      saveEmergencyDraft(versionHistory);
      return null;
    }

    applyDatabaseWorkspace(response.workspace);
    window.localStorage.removeItem(CODE_LAB_STORAGE_KEY);
    return response.workspace;
  }

  const autosaveWorkspaceToDatabase = useCallback(async () => {
    if (!workspaceId || dirtyFileIds.size === 0 || dbStatus === "loading")
      return;

    setAutosaveStatus("saving");

    const files = folders.flatMap((folder) =>
      folder.files.map((file, index) => ({
        id: file.id,
        name: file.name,
        folder: folder.name,
        language: file.id === activeFileId ? language : file.language,
        content: fileContents[file.id] ?? file.content,
        sortOrder: index,
      })),
    );
    const response = await apiPost<AutosaveResponse>(
      `/code-lab/workspaces/${workspaceId}/autosave`,
      {
        title: workspaceTitle,
        activeFileId,
        activeFileName: activeFile?.name ?? "main.py",
        files,
      },
    );

    if (!response?.ok) {
      setAutosaveStatus("error");
      setDbStatus("draft");
      const updatedAt = new Date().toISOString();
      const snapshot: StoredCodeLabWorkspace = {
        workspaceId,
        workspaceTitle,
        folders: folders.map((folder) => ({
          ...folder,
          files: folder.files.map((file) => ({
            ...file,
            content: fileContents[file.id] ?? file.content,
          })),
        })),
        fileContents,
        openFileIds,
        activeFileId,
        language,
        updatedAt,
        versions: versionHistory,
      };

      window.localStorage.setItem(
        CODE_LAB_STORAGE_KEY,
        JSON.stringify(snapshot),
      );
      return;
    }

    setSavedFileSnapshots(fileSnapshotsFromFolders(folders, fileContents));
    setLastAutosavedAt(response.updatedAt);
    setAutosaveStatus("saved");
    setDbStatus("ready");
    window.localStorage.removeItem(CODE_LAB_STORAGE_KEY);
  }, [
    activeFile?.name,
    activeFileId,
    dbStatus,
    dirtyFileIds.size,
    fileContents,
    folders,
    language,
    openFileIds,
    versionHistory,
    workspaceId,
    workspaceTitle,
  ]);

  useEffect(() => {
    if (!workspaceId || dbStatus === "loading" || dirtyFileIds.size === 0)
      return;

    const timer = window.setTimeout(() => {
      void autosaveWorkspaceToDatabase();
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [autosaveWorkspaceToDatabase, dbStatus, dirtyFileIds.size, workspaceId]);

  function fileForWorkspace(
    workspace: CodeLabApiWorkspace,
    localFile: FileNode | undefined,
  ) {
    return (
      workspace.files.find((file) => file.name === localFile?.name) ??
      workspace.files.find((file) => file.id === localFile?.id) ??
      workspace.files.find((file) => file.id === workspace.activeFileId) ??
      workspace.files[0]
    );
  }

  function applyRunResult(result: CodeRunResult) {
    setConsoleOutput(result.stdout || "Execution completed without stdout.");
    setErrorOutput(result.stderr || result.errorMessage || "");
    setRunStatus(result.success ? "success" : "error");
    setExecutionMs(result.executionTime);
    setHtmlPreview(result.htmlPreview);
    setLastRunResult(result);
  }

  async function handleRun() {
    if (!activeFile) return;
    const code = fileContents[activeFile.id] ?? activeFile.content;
    const currentLanguage = runnerLanguageFor(activeFile, language);
    setIsRunning(true);
    setHtmlPreview(undefined);

    try {
      const workspace = await persistWorkspaceToDatabase();
      const serverFile = workspace
        ? fileForWorkspace(workspace, activeFile)
        : null;
      let result: CodeRunResult;

      if (workspace && shouldUseBackendRunner(currentLanguage)) {
        const response = await apiPost<RunResponse>("/code-lab/run", {
          workspaceId: workspace.id,
          fileId: serverFile?.id,
          language: currentLanguage,
          code,
          stdin,
          testCases: tests.map(({ id, input, expected }) => ({
            id,
            input,
            expected,
          })),
        });

        if (!response?.run || !response.execution) {
          setDbStatus("draft");
          saveEmergencyDraft(versionHistory);
          throw new Error("Backend execution did not return a run result.");
        } else {
          setDbStatus("ready");
          result = normalizeApiExecutionResult(
            response.execution,
            currentLanguage,
          );
        }
      } else {
        result = await codeRunner.runCode({
          language: currentLanguage,
          code,
          stdin,
          files: buildRunnerFiles(),
          testCases: tests.map(({ id, input, expected }) => ({
            id,
            input,
            expected,
          })),
        });

        if (workspace) {
          const response = await apiPost<RunResponse>("/code-lab/run", {
            workspaceId: workspace.id,
            fileId: serverFile?.id,
            language: result.language,
            code,
            stdin,
            result,
          });

          if (!response?.run) {
            setDbStatus("draft");
            saveEmergencyDraft(versionHistory);
          } else {
            setDbStatus("ready");
          }
        }
      }

      applyRunResult(result);
    } catch (error) {
      setConsoleOutput("");
      setErrorOutput(
        error instanceof Error ? error.message : "Code execution failed.",
      );
      setRunStatus("error");
      setExecutionMs(0);
      setHtmlPreview(undefined);
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSave() {
    if (!activeFile) return;
    const code = fileContents[activeFile.id] ?? activeFile.content;
    const version = {
      id: `${activeFile.id}-${Date.now()}`,
      fileName: activeFile.name,
      language: runnerLanguageFor(activeFile, language),
      code,
      updatedAt: new Date().toISOString(),
    };
    const nextVersions = [version, ...versionHistory].slice(0, 25);

    setVersionHistory(nextVersions);
    const workspace = await persistWorkspaceToDatabase();

    if (workspace) {
      setConsoleOutput(
        `Saved ${workspace.title} to PostgreSQL at ${new Date(workspace.updatedAt).toLocaleTimeString()}.`,
      );
      setDbStatus("ready");
      setAutosaveStatus("saved");
      setLastAutosavedAt(workspace.updatedAt);
    } else {
      const updatedAt = saveEmergencyDraft(nextVersions);
      window.localStorage.setItem(
        `nexora-code-lab:file:${activeFile.id}`,
        JSON.stringify(version),
      );
      setConsoleOutput(
        `Database save failed. Emergency draft cached at ${new Date(updatedAt).toLocaleTimeString()}.`,
      );
    }
    setErrorOutput("");
    setRunStatus("success");
    setExecutionMs(0);
  }

  async function handleRunTests() {
    if (!activeFile) return;
    const code = fileContents[activeFile.id] ?? activeFile.content;
    const currentLanguage = runnerLanguageFor(activeFile, language);
    setIsRunning(true);
    setHtmlPreview(undefined);

    try {
      const workspace = await persistWorkspaceToDatabase();
      const serverFile = workspace
        ? fileForWorkspace(workspace, activeFile)
        : null;
      let result: CodeRunResult;

      if (workspace && shouldUseBackendRunner(currentLanguage)) {
        const response = await apiPost<RunResponse>("/code-lab/run-tests", {
          workspaceId: workspace.id,
          fileId: serverFile?.id,
          language: currentLanguage,
          code,
          stdin,
          testCases: tests.map(({ id, input, expected }) => ({
            id,
            input,
            expected,
          })),
        });

        if (!response?.run || !response.execution) {
          setDbStatus("draft");
          saveEmergencyDraft(versionHistory);
          throw new Error("Backend test runner did not return a result.");
        }

        setDbStatus("ready");
        result = normalizeApiExecutionResult(
          response.execution,
          currentLanguage,
        );
      } else {
        result = await codeRunner.runTests({
          language: currentLanguage,
          code,
          stdin,
          files: buildRunnerFiles(),
          testCases: tests.map(({ id, input, expected }) => ({
            id,
            input,
            expected,
          })),
        });

        if (workspace) {
          const response = await apiPost<RunResponse>("/code-lab/run-tests", {
            workspaceId: workspace.id,
            fileId: serverFile?.id,
            language: result.language,
            code,
            stdin,
            result,
            testResults: result.testResults ?? [],
          });

          if (!response?.run) {
            setDbStatus("draft");
            saveEmergencyDraft(versionHistory);
          } else {
            setDbStatus("ready");
          }
        }
      }
      const resultMap = new Map(
        (result.testResults ?? []).map((item) => [item.id, item]),
      );
      const nextTests: TestCase[] = tests.map((test) => {
        const resultItem = resultMap.get(test.id);
        const passed =
          resultItem?.passed ??
          outputMatchesExpected(result.stdout, test.expected);

        return {
          ...test,
          status: passed ? "passed" : "failed",
        };
      });
      const passed = nextTests.filter(
        (test) => test.status === "passed",
      ).length;

      setTests(nextTests);
      setConsoleOutput(
        `${passed}/${nextTests.length} tests passed.\n${result.stdout}`,
      );
      setErrorOutput(result.stderr);
      setRunStatus(passed === nextTests.length ? "success" : "error");
      setExecutionMs(result.executionTime);
      setLastRunResult(result);
    } catch (error) {
      setConsoleOutput("");
      setErrorOutput(
        error instanceof Error ? error.message : "Test execution failed.",
      );
      setRunStatus("error");
      setExecutionMs(0);
    } finally {
      setIsRunning(false);
    }
  }

  async function handleRunTerminal() {
    const command = terminalCommand.trim();

    if (!command) return;

    if (command.toLowerCase() === "clear") {
      setTerminalHistory([]);
      setTerminalCommand("");
      return;
    }

    setIsTerminalRunning(true);

    try {
      const workspace = await persistWorkspaceToDatabase();

      if (!workspace) {
        const entry: TerminalEntry = {
          id: `terminal-${Date.now()}`,
          command,
          cwd: "/workspace/draft",
          stdout: "",
          stderr: "Terminal requires an active database workspace.",
          success: false,
          adapter: "nexora-terminal",
          executionTimeMs: 0,
          createdAt: new Date().toISOString(),
        };

        setTerminalHistory((current) => [...current, entry].slice(-30));
        setRunStatus("error");
        return;
      }

      const response = await apiPost<TerminalResponse>("/code-lab/terminal", {
        workspaceId: workspace.id,
        command,
      });

      if (!response?.terminal) {
        const entry: TerminalEntry = {
          id: `terminal-${Date.now()}`,
          command,
          cwd: `/workspace/${workspace.title.toLowerCase().replace(/\s+/g, "-")}`,
          stdout: "",
          stderr: "Terminal command failed.",
          success: false,
          adapter: "nexora-terminal",
          executionTimeMs: 0,
          createdAt: new Date().toISOString(),
        };

        setTerminalHistory((current) => [...current, entry].slice(-30));
        setRunStatus("error");
        return;
      }

      const entry: TerminalEntry = {
        id: response.run.id,
        command: response.terminal.command,
        cwd: response.terminal.cwd,
        stdout: response.terminal.stdout,
        stderr: response.terminal.stderr,
        success: response.terminal.success,
        adapter: response.terminal.adapter,
        executionTimeMs: response.terminal.executionTimeMs,
        createdAt: response.run.createdAt,
      };

      setTerminalHistory((current) => [...current, entry].slice(-30));
      setTerminalCommand("");
      setExecutionMs(response.terminal.executionTimeMs);
      setRunStatus(response.terminal.success ? "success" : "error");
      setErrorOutput(response.terminal.stderr || "");
      setDbStatus("ready");
    } catch (error) {
      const entry: TerminalEntry = {
        id: `terminal-${Date.now()}`,
        command,
        cwd: "/workspace/error",
        stdout: "",
        stderr:
          error instanceof Error ? error.message : "Terminal command failed.",
        success: false,
        adapter: "nexora-terminal",
        executionTimeMs: 0,
        createdAt: new Date().toISOString(),
      };

      setTerminalHistory((current) => [...current, entry].slice(-30));
      setRunStatus("error");
    } finally {
      setIsTerminalRunning(false);
    }
  }

  async function handleAiAction(action: AiAction) {
    if (!activeFile) return;
    const code = fileContents[activeFile.id] ?? activeFile.content;
    const labels: Record<AiAction, string> = {
      explain: "Explain Code",
      debug: "Debug Code",
      improve: "Improve Code",
    };

    setActiveAiAction(action);
    setErrorOutput("");
    setRunStatus("idle");

    try {
      const workspace = await persistWorkspaceToDatabase();
      const serverFile = workspace
        ? fileForWorkspace(workspace, activeFile)
        : null;
      const response = await apiPost<AssistantResponse>("/code-lab/assistant", {
        action,
        workspaceId: workspace?.id,
        fileId: serverFile?.id,
        language: runnerLanguageFor(activeFile, language),
        code,
        stdin,
      });

      if (!response?.note) {
        setConsoleOutput(
          `${labels[action]} failed: AI assistant is unavailable.`,
        );
        setRunStatus("error");
        return;
      }

      const metadata = [response.model, response.mode]
        .filter(Boolean)
        .join(" / ");
      const suggestedCode = response.suggestedCode
        ? `\n\nSuggested code:\n${response.suggestedCode}`
        : "";

      setConsoleOutput(
        [
          `${labels[action]}${metadata ? ` (${metadata})` : ""}`,
          response.note,
          suggestedCode,
        ]
          .filter(Boolean)
          .join("\n\n"),
      );
      setRunStatus("success");
      setExecutionMs(0);
      setDbStatus(workspace ? "ready" : "draft");
    } catch (error) {
      setConsoleOutput("");
      setErrorOutput(
        error instanceof Error ? error.message : "AI assistant failed.",
      );
      setRunStatus("error");
    } finally {
      setActiveAiAction(null);
    }
  }

  async function handleSubmitLabTask() {
    if (!activeFile) return;
    setIsSubmitting(true);

    try {
      const workspace = await persistWorkspaceToDatabase();
      const serverFile = workspace
        ? fileForWorkspace(workspace, activeFile)
        : null;

      if (!workspace || !serverFile) {
        setConsoleOutput(
          "Submit blocked: database workspace is not available.",
        );
        setRunStatus("error");
        return;
      }

      const response = await apiPost<SubmitResponse>("/code-lab/submit", {
        workspaceId: workspace.id,
        fileId: serverFile.id,
        title: workspace.title,
        language: runnerLanguageFor(activeFile, language),
        code: fileContents[activeFile.id] ?? activeFile.content,
        output: consoleOutput,
        error: errorOutput,
        result: lastRunResult ?? undefined,
        testResults: tests,
        summary: "Submitted from Nexora OS Code Lab.",
      });

      if (!response?.submission) {
        setDbStatus("draft");
        saveEmergencyDraft(versionHistory);
        setConsoleOutput("Submit failed. Emergency draft cache updated.");
        setRunStatus("error");
        return;
      }

      setDbStatus("ready");
      setConsoleOutput(
        `Lab task submitted to PostgreSQL. Submission #${response.submission.version} is ${response.submission.reviewStatus}.`,
      );
      setErrorOutput("");
      setRunStatus("success");
    } finally {
      setIsSubmitting(false);
    }
  }

  saveShortcutRef.current = () => {
    void handleSave();
  };
  runShortcutRef.current = () => {
    void handleRun();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifier = event.ctrlKey || event.metaKey;

      if (!isModifier) return;

      const key = event.key.toLowerCase();

      if (key === "s") {
        event.preventDefault();
        saveShortcutRef.current();
      }

      if (key === "enter") {
        event.preventDefault();
        runShortcutRef.current();
      }

      if (key === "p") {
        event.preventDefault();
        setQuickOpen(true);
        setQuickQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!workspaceExpanded) return;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setWorkspaceExpanded(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [workspaceExpanded]);

  return (
    <AppShell
      role={role}
      title="Code Lab"
      subtitle="Write, run, and test code for your lab tasks."
      nav={roleData.nav}
      navGroups={roleData.navGroups}
      accountEmail={roleData.accountEmail}
      contentClassName="max-w-none pt-2"
    >
      <div
        className={cn(
          "nexora-code-lab grid gap-3",
          workspaceExpanded &&
            "nexora-code-lab-fullscreen fixed inset-3 z-[100] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[28px] border border-[#DDEAE5] bg-[#F8FCFA] p-3 shadow-[0_30px_90px_rgba(15,23,42,0.22)]",
        )}
      >
        <CodeLabHeader
          language={language}
          environment={environment}
          dbStatus={dbStatus}
          autosaveStatus={autosaveStatus}
          dirtyCount={dirtyFileIds.size}
          onLanguageChange={handleLanguageChange}
          onEnvironmentChange={handleEnvironmentChange}
          onRun={handleRun}
          onSave={handleSave}
          onSubmit={handleSubmitLabTask}
          isRunning={isRunning}
          isSubmitting={isSubmitting}
        />

        <input
          ref={uploadInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleUploadFiles}
        />
        {quickOpen ? (
          <QuickOpenPalette
            files={allFiles}
            query={quickQuery}
            onQueryChange={setQuickQuery}
            onSelectFile={handleSelectFile}
            onClose={() => setQuickOpen(false)}
          />
        ) : null}

        <div
          className={cn(
            "code-lab-workspace-grid grid gap-3",
            workspaceExpanded
              ? "min-h-0 grid-cols-1 [&>:first-child]:hidden [&>:last-child]:hidden lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)_minmax(220px,280px)] lg:[&>:first-child]:flex lg:[&>:last-child]:block 2xl:grid-cols-[340px_minmax(0,1fr)_320px]"
              : "lg:min-h-[680px] lg:h-[calc(100dvh-166px)] lg:min-h-[700px] lg:grid-cols-[minmax(220px,250px)_minmax(0,1fr)] lg:[&>:last-child]:hidden 2xl:grid-cols-[340px_minmax(0,1fr)_320px] 2xl:[&>:last-child]:block",
          )}
        >
          <CodeLabSidebar
            activePanel={activeIdePanel}
            folders={folders}
            files={allFiles}
            fileContents={fileContents}
            activeFileId={activeFileId}
            dirtyFileIds={dirtyFileIds}
            tests={tests}
            versions={versionHistory}
            activeAiAction={activeAiAction}
            onSelectPanel={setActiveIdePanel}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onDuplicateFile={handleDuplicateFile}
            onRenameFile={handleRenameFile}
            onDeleteFile={handleDeleteFile}
            onDownloadFile={handleDownloadFile}
            onUploadFiles={() => uploadInputRef.current?.click()}
            onRunTests={handleRunTests}
            onSelectVersion={handleSelectVersion}
            onAiAction={handleAiAction}
          />

          <div
            className={cn("grid min-h-0 gap-3", workspaceExpanded && "h-full")}
            style={{
              gridTemplateRows: `minmax(0,1fr) ${
                workspaceExpanded ? Math.max(consoleHeight, 260) : consoleHeight
              }px`,
            }}
          >
            <CodeEditorPanel
              openFiles={openFiles}
              activeFileId={activeFileId}
              dirtyFileIds={dirtyFileIds}
              workspaceExpanded={workspaceExpanded}
              onToggleWorkspaceExpanded={() =>
                setWorkspaceExpanded((current) => !current)
              }
              onSelectTab={handleSelectTab}
              onCloseTab={handleCloseTab}
              onCreateFile={handleCreateFile}
              language={language}
              content={activeFile?.content ?? ""}
              onContentChange={(nextContent) => {
                if (!activeFile) return;
                setFileContents((current) => ({
                  ...current,
                  [activeFile.id]: nextContent,
                }));
              }}
            />
            <ConsolePanel
              consoleOutput={consoleOutput}
              errorOutput={errorOutput}
              htmlPreview={htmlPreview}
              problems={problems}
              inputValue={stdin}
              terminalCommand={terminalCommand}
              terminalHistory={terminalHistory}
              terminalCwd={terminalCwd}
              terminalSuggestions={terminalSuggestions}
              isTerminalRunning={isTerminalRunning}
              onInputChange={setStdin}
              onTerminalCommandChange={setTerminalCommand}
              onRunTerminal={handleRunTerminal}
              onClearTerminal={() => {
                setTerminalHistory([]);
                setTerminalCommand("");
              }}
              onClear={() => {
                setConsoleOutput("");
                setErrorOutput("");
                setHtmlPreview(undefined);
                setTerminalHistory([]);
                setRunStatus("idle");
                setExecutionMs(0);
              }}
              consoleHeight={consoleHeight}
              onConsoleHeightChange={setConsoleHeight}
              executionMs={executionMs}
              status={runStatus}
            />
          </div>

          <InstructionPanel
            tests={tests}
            onRunTests={handleRunTests}
            onAiAction={handleAiAction}
            activeAiAction={activeAiAction}
          />
        </div>
        <CodeStatusBar
          workspaceTitle={workspaceTitle}
          activeFile={activeFile}
          language={language}
          dbStatus={dbStatus}
          autosaveStatus={autosaveStatus}
          lastAutosavedAt={lastAutosavedAt}
          dirtyCount={dirtyFileIds.size}
          runStatus={runStatus}
          executionMs={executionMs}
          tests={tests}
          problems={problems}
          fileCount={allFiles.length}
        />
      </div>
    </AppShell>
  );
}
