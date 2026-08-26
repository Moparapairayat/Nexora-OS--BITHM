"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Code2,
  Command,
  Copy,
  Download,
  FolderOpen,
  GitBranch,
  GripHorizontal,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Palette,
  PencilLine,
  Play,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload as UploadIcon,
  X,
  type LucideIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ChangeEvent,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
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
import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api-client";
import { PenguinLoadingSpinner } from "@/components/ui/loading-spinner";
import { roleDashboards, type AppRole } from "@/data/dashboard.mock";
import { cn } from "@/lib/utils";

// ---------- Reusable design tokens (Code Lab Pro IDE) ----------

const idePanelClass =
  "bg-white dark:bg-[#0B101B] text-[#0F172A] dark:text-[#E2E8F0] border-[#E2E8F0] dark:border-[#1E293B]";

const ghostButton =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] px-3 text-xs font-semibold text-[#334155] dark:text-[#CBD5E1] transition-all hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-white hover:border-[#CBD5E1] dark:hover:border-[#334155] active:scale-[0.98]";

const primaryButton =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#059669] to-[#10B981] px-3.5 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(5,150,105,0.25)] transition-all hover:from-[#047857] hover:to-[#059669] hover:shadow-[0_4px_14px_rgba(5,150,105,0.35)] active:scale-[0.98] disabled:opacity-60";

const pillBase =
  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold";


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

type CodeLabCommand = {
  id: string;
  label: string;
  detail: string;
  shortcut?: string;
  icon: LucideIcon;
  action: () => void;
};

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
      },
    ]),
  );
}

function inferLanguageFromFileName(
  name: string,
  fallback: LanguageId = "python",
): FileNode["language"] {
  const extension = name.toLowerCase().split(".").pop() ?? "";
  const map: Record<string, FileNode["language"]> = {
    c: "c",
    cpp: "cpp",
    css: "html",
    cxx: "cpp",
    htm: "html",
    html: "html",
    java: "java",
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
    "c",
    "cpp",
    "html",
    "java",
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
    c: "c",
    cpp: "cpp",
    html: "html",
    java: "java",
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
  if (language === "c") {
    return `#include <stdio.h>\n\nint main() {\n    printf("Hello from Nexora Code Lab!\\n");\n    return 0;\n}\n`;
  }

  if (language === "cpp") {
    return `#include <iostream>\n\nint main() {\n    std::cout << "Hello from Nexora Code Lab!" << std::endl;\n    return 0;\n}\n`;
  }

  if (language === "java") {
    return `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Nexora Code Lab!");\n    }\n}\n`;
  }

  if (language === "javascript") {
    return `const value = Number(input());\nconsole.log(value * 2);\n`;
  }

  if (language === "typescript") {
    return `const value: number = Number(input());\nconsole.log(value * 2);\n`;
  }

  if (language === "html") {
    return `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title>${name}</title>\n  <style>\n    body { font-family: sans-serif; padding: 24px; }\n    h1 { color: #009B5A; }\n  </style>\n</head>\n<body>\n  <h1>Hello from Nexora Code Lab</h1>\n  <p>Live preview enabled.</p>\n</body>\n</html>\n`;
  }

  if (language === "json") {
    return `{\n  "name": "${name}",\n  "version": "1.0.0"\n}\n`;
  }

  if (language === "markdown") {
    return `# ${name}\n\nDocument your lab solution here.\n`;
  }

  return `def factorial(n):\n    if n < 0:\n        raise ValueError('n must be non-negative')\n    result = 1\n    for value in range(2, n + 1):\n        result *= value\n    return result\n\nprint(factorial(10))\n`;
}

function languageForFile(file: FileNode): LanguageId {
  if (
    file.language === "python" ||
    file.language === "javascript" ||
    file.language === "typescript" ||
    file.language === "html" ||
    file.language === "c" ||
    file.language === "cpp" ||
    file.language === "java"
  ) {
    return file.language;
  }

  return "python";
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
    language === "c" ||
    language === "cpp" ||
    language === "java" ||
    language === "python" ||
    language === "javascript" ||
    language === "typescript" ||
    language === "html"
  ) {
    return language as any;
  }

  return fallback as any;
}

function outputMatchesExpected(actualStdout: string, expected: string): boolean {
  const cleanActual = (actualStdout || "").trim();
  const cleanExpected = (expected || "").trim();

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

function normalizeApiExecutionResult(
  execution: ApiCodeRunResult,
  language: CodeRunnerLanguage,
): CodeRunResult {
  return {
    success: execution.success,
    language: execution.language ?? language,
    stdout: execution.stdout ?? "",
    stderr: execution.stderr ?? "",
    executionTime:
      execution.executionTime ?? execution.executionTimeMs ?? 0,
    adapter: execution.adapter ?? "nexora-cloud-engine",
    errorMessage: execution.errorMessage ?? undefined,
    htmlPreview: execution.htmlPreview ?? undefined,
    testResults: execution.testResults?.map((testResult) => {
      const anyResult = testResult as unknown as Record<string, unknown>;
      return {
        id: testResult.id,
        input: testResult.input,
        expected: testResult.expected,
        stdout:
          typeof anyResult.stdout === "string"
            ? anyResult.stdout
            : typeof anyResult.actual === "string"
              ? String(anyResult.actual)
              : "",
        stderr:
          typeof anyResult.stderr === "string"
            ? anyResult.stderr
            : typeof anyResult.errorMessage === "string"
              ? String(anyResult.errorMessage)
              : "",
        passed: Boolean(testResult.passed),
        executionTime:
          testResult.executionTime ??
          (typeof anyResult.executionTimeMs === "number"
            ? anyResult.executionTimeMs
            : 0),
      };
    }),
  };
}

function fileForWorkspace(
  workspace: CodeLabApiWorkspace,
  activeFile: FileNode,
) {
  return (
    workspace.files.find((file) => file.name === activeFile.name) ??
    workspace.files.find((file) => file.id === activeFile.id) ??
    workspace.files[0] ??
    null
  );
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

// ---------- Monaco Editor Configuration ----------

const monacoOptions: EditorProps["options"] = {
  fontSize: 13.5,
  lineHeight: 22,
  fontFamily: "'Geist Mono', 'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace",
  fontLigatures: true,
  minimap: { enabled: true, maxColumn: 80, scale: 0.85, renderCharacters: false },
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: "on",
  renderLineHighlight: "all",
  renderWhitespace: "selection",
  roundedSelection: true,
  automaticLayout: true,
  padding: { top: 14, bottom: 14 },
  folding: true,
  bracketPairColorization: { enabled: true },
  guides: { bracketPairs: true, indentation: true },
  tabSize: 4,
};

const configureMonaco: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("nexora-code-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "64748B", fontStyle: "italic" },
      { token: "keyword", foreground: "059669", fontStyle: "bold" },
      { token: "string", foreground: "0284C7" },
      { token: "number", foreground: "D97706" },
      { token: "type", foreground: "7C3AED" },
      { token: "identifier", foreground: "0F172A" },
      { token: "delimiter", foreground: "475569" },
    ],
    colors: {
      "editor.background": "#FFFFFF",
      "editor.foreground": "#0F172A",
      "editor.lineHighlightBackground": "#F8FAFC",
      "editor.lineHighlightBorder": "#F1F5F9",
      "editorLineNumber.foreground": "#94A3B8",
      "editorLineNumber.activeForeground": "#059669",
      "editorCursor.foreground": "#059669",
      "editor.selectionBackground": "#CCFBF1",
      "editor.inactiveSelectionBackground": "#E6FFFA",
      "editorGutter.background": "#FFFFFF",
      "editorIndentGuide.background": "#F1F5F9",
      "editorIndentGuide.activeBackground": "#CBD5E1",
    },
  });

  monaco.editor.defineTheme("nexora-code-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "64748B", fontStyle: "italic" },
      { token: "keyword", foreground: "34D399", fontStyle: "bold" },
      { token: "string", foreground: "38BDF8" },
      { token: "number", foreground: "FBBF24" },
      { token: "type", foreground: "A78BFA" },
      { token: "identifier", foreground: "F8FAFC" },
      { token: "delimiter", foreground: "94A3B8" },
    ],
    colors: {
      "editor.background": "#0B101B",
      "editor.foreground": "#F8FAFC",
      "editor.lineHighlightBackground": "#111927",
      "editor.lineHighlightBorder": "#1E293B",
      "editorLineNumber.foreground": "#475569",
      "editorLineNumber.activeForeground": "#34D399",
      "editorCursor.foreground": "#34D399",
      "editor.selectionBackground": "#064E3B66",
      "editorGutter.background": "#0B101B",
      "editorIndentGuide.background": "#1E293B",
      "editorIndentGuide.activeBackground": "#334155",
    },
  });

  monaco.editor.defineTheme("nexora-one-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "5C6370", fontStyle: "italic" },
      { token: "keyword", foreground: "C678DD", fontStyle: "bold" },
      { token: "string", foreground: "98C379" },
      { token: "number", foreground: "D19A66" },
      { token: "type", foreground: "E5C07B" },
      { token: "identifier", foreground: "ABB2BF" },
      { token: "delimiter", foreground: "ABB2BF" },
    ],
    colors: {
      "editor.background": "#1E222A",
      "editor.foreground": "#ABB2BF",
      "editor.lineHighlightBackground": "#232731",
      "editor.lineHighlightBorder": "#282C34",
      "editorLineNumber.foreground": "#4B5263",
      "editorLineNumber.activeForeground": "#61AFEF",
      "editorCursor.foreground": "#528BFF",
      "editor.selectionBackground": "#3E4451",
      "editorGutter.background": "#1E222A",
      "editorIndentGuide.background": "#282C34",
      "editorIndentGuide.activeBackground": "#3E4451",
    },
  });

  monaco.editor.defineTheme("nexora-catppuccin", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6E738D", fontStyle: "italic" },
      { token: "keyword", foreground: "C6A0F6", fontStyle: "bold" },
      { token: "string", foreground: "A6DA95" },
      { token: "number", foreground: "F5A97F" },
      { token: "type", foreground: "8AADF4" },
      { token: "identifier", foreground: "CAD3F5" },
      { token: "delimiter", foreground: "939AB7" },
    ],
    colors: {
      "editor.background": "#181926",
      "editor.foreground": "#CAD3F5",
      "editor.lineHighlightBackground": "#1E2030",
      "editor.lineHighlightBorder": "#24273A",
      "editorLineNumber.foreground": "#5B6078",
      "editorLineNumber.activeForeground": "#C6A0F6",
      "editorCursor.foreground": "#F4B8E4",
      "editor.selectionBackground": "#363A4F88",
      "editorGutter.background": "#181926",
      "editorIndentGuide.background": "#24273A",
      "editorIndentGuide.activeBackground": "#363A4F",
    },
  });
};

// ---------- Sub-components ----------

function LanguageSelect({
  value,
  onChange,
}: {
  value: LanguageId;
  onChange: (id: LanguageId) => void;
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        aria-label="Programming language"
        title="Programming language"
        value={value}
        onChange={(event) => onChange(event.target.value as LanguageId)}
        className="h-8 appearance-none rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] pl-2.5 pr-7 text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] shadow-xs outline-none transition hover:border-[#CBD5E1] dark:hover:border-[#334155] focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/20 cursor-pointer"
      >
        {languageOptions.map((option) => (
          <option key={option.id} value={option.id} className="dark:bg-[#0B101B] dark:text-[#E2E8F0]">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-[#64748B] dark:text-[#94A3B8]" />
    </div>
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
    <div className="relative inline-flex items-center">
      <select
        aria-label="Execution environment"
        title="Execution environment"
        value={value}
        onChange={(event) => onChange(event.target.value as EnvironmentId)}
        className="h-8 appearance-none rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] pl-2.5 pr-7 text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] shadow-xs outline-none transition hover:border-[#CBD5E1] dark:hover:border-[#334155] focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/20 cursor-pointer"
      >
        {environmentOptions.map((option) => (
          <option key={option.id} value={option.id} className="dark:bg-[#0B101B] dark:text-[#E2E8F0]">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-[#64748B] dark:text-[#94A3B8]" />
    </div>
  );
}

function CodeLabHeader({
  language,
  environment,
  onLanguageChange,
  onEnvironmentChange,
  onOpenCommandPalette,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
}: {
  language: LanguageId;
  environment: EnvironmentId;
  onLanguageChange: (id: LanguageId) => void;
  onEnvironmentChange: (id: EnvironmentId) => void;
  onOpenCommandPalette: () => void;
  onRun: () => void;
  onSubmit: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0B101B] px-3.5 py-2 select-none">
      {/* Left: Window Controls + Brand */}
      <div className="flex items-center gap-3">
        {/* macOS Window Controls */}
        <div className="flex items-center gap-1.5 pr-2 border-r border-[#E2E8F0] dark:border-[#1E293B]">
          <span className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-2xs" />
          <span className="h-3 w-3 rounded-full bg-[#FFBD2E] border-[#DEA123] shadow-2xs" />
          <span className="h-3 w-3 rounded-full bg-[#27C93F] border-[#1AAB29] shadow-2xs" />
        </div>

        {/* Code Lab Title & Status */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Code Lab
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-[#F1F5F9] dark:bg-[#1E293B] px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#64748B] dark:text-[#94A3B8]">
            v2.4
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-[#059669] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#064E3B]/30 px-2 py-0.5 rounded-full border border-[#A7F3D0] dark:border-[#059669]/30">
            <span className="h-1.5 w-1.5 rounded-full bg-[#059669] dark:bg-[#34D399] animate-pulse" />
            Live Cloud
          </span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <button
        type="button"
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center gap-2 h-7.5 w-72 max-w-sm rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#111827] px-2.5 text-xs text-[#64748B] dark:text-[#94A3B8] transition hover:border-[#CBD5E1] dark:hover:border-[#334155] hover:bg-white dark:hover:bg-[#0B101B] shadow-2xs"
        aria-label="Open command palette"
        title="Open command palette (Ctrl+K)"
      >
        <Search className="h-3.5 w-3.5 text-[#64748B] dark:text-[#94A3B8]" />
        <span className="flex-1 text-left truncate text-[11px]">Search files & commands...</span>
        <kbd className="rounded border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#475569] dark:text-[#94A3B8]">
          ⌘K
        </kbd>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <LanguageSelect value={language} onChange={onLanguageChange} />
        <div className="hidden sm:block">
          <EnvironmentSelect
            value={environment}
            onChange={onEnvironmentChange}
          />
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={ghostButton}
          title="Submit assignment for assessment"
        >
          <UploadIcon className="h-3.5 w-3.5 text-[#059669]" />
          <span className="hidden sm:inline">{isSubmitting ? "Submitting..." : "Submit Task"}</span>
        </button>

        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className={primaryButton}
          title="Execute code (Ctrl+Enter)"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>{isRunning ? "Running..." : "Run (⌘↵)"}</span>
        </button>
      </div>
    </header>
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

  const icons: Record<string, { label: string; bg: string; text: string }> = {
    py: { label: "PY", bg: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400" },
    js: { label: "JS", bg: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400" },
    ts: { label: "TS", bg: "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400" },
    tsx: { label: "TSX", bg: "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400" },
    jsx: { label: "JSX", bg: "bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800", text: "text-sky-700 dark:text-sky-400" },
    c: { label: "C", bg: "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800", text: "text-indigo-700 dark:text-indigo-400" },
    cpp: { label: "C++", bg: "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800", text: "text-indigo-700 dark:text-indigo-400" },
    java: { label: "JV", bg: "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-400" },
    html: { label: "HTML", bg: "bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800", text: "text-orange-700 dark:text-orange-400" },
    css: { label: "CSS", bg: "bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-800", text: "text-violet-700 dark:text-violet-400" },
    json: { label: "{}", bg: "bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800", text: "text-yellow-700 dark:text-yellow-400" },
    md: { label: "MD", bg: "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700", text: "text-slate-700 dark:text-slate-400" },
    env: { label: "ENV", bg: "bg-lime-50 dark:bg-lime-950/50 border-lime-200 dark:border-lime-800", text: "text-lime-700 dark:text-lime-400" },
    sql: { label: "SQL", bg: "bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800", text: "text-cyan-700 dark:text-cyan-400" },
    prisma: { label: "DB", bg: "bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800", text: "text-teal-700 dark:text-teal-400" },
  };

  const fileInfo = icons[extension] ?? {
    label: extension.slice(0, 3).toUpperCase() || "DOC",
    bg: "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700",
    text: "text-slate-600 dark:text-slate-400",
  };

  return (
    <span
      className={cn(
        "grid h-4.5 w-4.5 shrink-0 place-items-center rounded border text-[7px] font-black leading-none",
        fileInfo.bg,
        fileInfo.text,
        className,
      )}
      aria-hidden="true"
      title={`${fileInfo.label} file`}
    >
      {fileInfo.label}
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
  const [theme, setTheme] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("light")
        ? "nexora-code-light"
        : "nexora-code-dark";
    }
    return "nexora-code-light";
  });

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

    window.addEventListener("nexora-theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener("nexora-theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
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
        "group relative flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs transition-all select-none",
        active
          ? "bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium shadow-2xs"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/50",
      )}
    >
      {active ? (
        <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r bg-[#059669] dark:bg-[#34D399]" />
      ) : null}

      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <FileTypeIcon name={file.name} className="h-4 w-4" />
        <span className="min-w-0 flex-1 truncate font-mono text-[12px]">{file.name}</span>
        {dirty ? (
          <span
            className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"
            aria-label="Unsaved changes"
            title="Unsaved changes"
          />
        ) : null}
      </button>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRename();
          }}
          aria-label={`Rename ${file.name}`}
          title="Rename file"
          className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white"
        >
          <PencilLine className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${file.name}`}
          title="Delete file"
          className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-600 dark:hover:text-rose-400"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
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
      className={cn(
        idePanelClass,
        "flex h-full min-h-0 flex-col overflow-hidden select-none",
      )}
    >
      {/* Section Header */}
      <header className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0B101B] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <FolderOpen className="h-3.5 w-3.5 text-[#059669] dark:text-[#34D399]" aria-hidden="true" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Explorer
          </span>
          <span className="rounded bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-slate-600 dark:text-slate-400">
            {flattenFiles(folders).length}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onCreateFile}
            title="New File"
            aria-label="New File"
            className="grid h-6 w-6 place-items-center rounded text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-[#1E293B] hover:text-[#059669]"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onUploadFiles}
            title="Upload Files"
            aria-label="Upload Files"
            className="grid h-6 w-6 place-items-center rounded text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-[#1E293B] hover:text-[#059669]"
          >
            <UploadIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDownloadFile(activeFile)}
            title="Download Active File"
            aria-label="Download Active File"
            className="grid h-6 w-6 place-items-center rounded text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-[#1E293B] hover:text-[#059669]"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (activeFile) onDuplicateFile(activeFile);
            }}
            title="Duplicate File"
            aria-label="Duplicate File"
            className="grid h-6 w-6 place-items-center rounded text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-[#1E293B] hover:text-[#059669]"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* File Search Filter */}
      <div className="p-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter files..."
            className="h-7.5 w-full rounded-md border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] pl-7 pr-2 text-xs text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400 focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/20"
          />
        </div>
      </div>

      {/* Tree Hierarchy */}
      <div className="min-h-0 flex-1 overflow-y-auto px-1.5 py-2">
        <div className="grid gap-1">
          {filteredFolders.map((folder) => {
            const isOpen = openFolders[folder.id] ?? true;
            return (
              <div key={folder.id}>
                <button
                  type="button"
                  onClick={() => toggleFolder(folder.id)}
                  className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
                  aria-expanded={isOpen}
                >
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 text-slate-400 transition-transform duration-150",
                      !isOpen && "-rotate-90",
                    )}
                  />
                  <span className="truncate">{folder.name}</span>
                </button>
                {isOpen ? (
                  <div className="mt-0.5 grid gap-0.5 pl-3.5 border-l border-slate-200/80 dark:border-slate-800/80 ml-2">
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
    </aside>
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
      className={cn(
        idePanelClass,
        "flex h-full min-h-0 flex-col overflow-hidden",
      )}
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

function TestCaseItem({ test }: { test: TestCase }) {
  const isPassed = test.status === "passed";
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#1E293B] py-2 last:border-b-0">
      <div className="min-w-0 font-mono text-xs text-slate-700 dark:text-slate-300">
        <span className="text-slate-400">In:</span>{" "}
        <span className="font-semibold">{test.input}</span>
        <span className="mx-2 text-slate-300 dark:text-slate-700">|</span>
        <span className="text-slate-400">Exp:</span>{" "}
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{test.expected}</span>
      </div>
      <span
        className={cn(
          "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase",
          isPassed
            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
            : test.status === "failed"
              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500",
        )}
      >
        {isPassed ? "Pass" : test.status === "failed" ? "Fail" : "Wait"}
      </span>
    </div>
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
      className={cn(
        idePanelClass,
        "flex h-full min-h-0 flex-col overflow-hidden",
      )}
    >
      <header className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] px-3 py-2.5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Tests
          </p>
          <p className="text-xs font-medium text-slate-500">
            {passed}/{tests.length} passing
          </p>
        </div>
        <button
          type="button"
          onClick={onRunTests}
          className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-[#059669] px-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#047857]"
        >
          <Play className="h-3 w-3 fill-current" />
          Run
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="grid">
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
      className={cn(
        idePanelClass,
        "flex h-full min-h-0 flex-col overflow-hidden",
      )}
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

type AiResultData = {
  action: AiAction;
  title: string;
  note: string;
  suggestedCode?: string;
  model?: string;
  mode?: string;
  timestamp: string;
};

function AiPanel({
  activeAiAction,
  aiResult,
  onAiAction,
  onClearAiResult,
  onApplyCode,
}: {
  activeAiAction: AiAction | null;
  aiResult: AiResultData | null;
  onAiAction: (action: AiAction) => void;
  onClearAiResult: () => void;
  onApplyCode: (code: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  const actions: { id: AiAction; label: string; detail: string; icon: string }[] = [
    {
      id: "explain",
      label: "Explain Active Code",
      detail: "Deep analysis of logic, complexity, and flow.",
      icon: "💡",
    },
    {
      id: "debug",
      label: "Detect Bugs & Issues",
      detail: "Check for runtime failures, nulls, and syntax.",
      icon: "🔍",
    },
    {
      id: "improve",
      label: "Suggest Clean Refactor",
      detail: "Optimize memory, readability, and speed.",
      icon: "⚡",
    },
  ];

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = (code: string) => {
    onApplyCode(code);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  return (
    <aside
      className={cn(
        idePanelClass,
        "flex h-full min-h-0 flex-col overflow-hidden",
      )}
    >
      <header className="border-b border-[#F0F4F4] dark:border-[#1E293B] bg-[#FAFCFC] dark:bg-[#0E1726] px-3.5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-[#EFFFF5] dark:bg-[#009B5A]/20 text-[#009B5A] border border-[#DFF8EA] dark:border-[#009B5A]/40">
              🤖
            </span>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#0B1B33] dark:text-white">
                AI Assistant
              </h2>
              <p className="text-[11px] font-medium text-[#5D6B82] dark:text-[#94A3B8]">
                Nexora AI Copilot
              </p>
            </div>
          </div>
          <span className="rounded-full border border-[#DFF8EA] dark:border-[#009B5A]/40 bg-[#EFFFF5] dark:bg-[#009B5A]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#00804A] dark:text-[#32F59A]">
            {aiResult?.model || "Groq / Gemini"}
          </span>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-3.5 space-y-3">
        {/* Instant Active AI Skeleton Loader */}
        {activeAiAction ? (
          <div className="rounded-xl border border-emerald-300/80 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/50 p-3.5 space-y-3 shadow-sm animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#009B5A] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#009B5A]" />
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {activeAiAction === "explain"
                    ? "Analyzing Code Logic..."
                    : activeAiAction === "debug"
                      ? "Diagnosing Issues & Bugs..."
                      : "Generating Clean Refactor..."}
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">
                Thinking...
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="h-3 bg-emerald-200/60 dark:bg-emerald-800/40 rounded w-4/5" />
              <div className="h-3 bg-emerald-200/60 dark:bg-emerald-800/40 rounded w-full" />
              <div className="h-3 bg-emerald-200/60 dark:bg-emerald-800/40 rounded w-3/5" />
            </div>
            <div className="h-14 rounded-lg bg-slate-900/10 dark:bg-black/30 border border-emerald-200/40 dark:border-emerald-900/30 flex items-center justify-center text-[10px] text-slate-500 font-mono">
              Synthesizing response...
            </div>
          </div>
        ) : null}

        {/* Dynamic AI Response Card */}
        {aiResult ? (
          <div className="rounded-xl border border-emerald-300/80 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/40 p-3.5 space-y-2.5 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            {/* Header with Title & Action */}
            <div className="flex items-center justify-between gap-2 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm">
                  {aiResult.action === "explain" ? "💡" : aiResult.action === "debug" ? "🔍" : "⚡"}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {aiResult.title}
                </span>
              </div>
              <button
                type="button"
                onClick={onClearAiResult}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition"
                title="Clear AI result"
                aria-label="Clear result"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Note / Explanation Body */}
            <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
              {aiResult.note}
            </div>

            {/* Suggested Code Container (if present) */}
            {aiResult.suggestedCode ? (
              <div className="space-y-2 pt-1 border-t border-emerald-200/60 dark:border-emerald-900/40">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <span>Suggested Code:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(aiResult.suggestedCode!)}
                      className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-95 shadow-2xs"
                    >
                      {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApply(aiResult.suggestedCode!)}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-600 dark:bg-emerald-500 px-2.5 py-0.5 text-[10px] font-semibold text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition shadow-xs active:scale-95"
                    >
                      {applied ? <CheckCircle2 className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
                      <span>{applied ? "Applied!" : "Apply to Editor"}</span>
                    </button>
                  </div>
                </div>
                <pre className="max-h-56 overflow-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-black/90 p-2.5 font-mono text-[11px] text-emerald-300 dark:text-emerald-400 leading-normal select-text">
                  <code>{aiResult.suggestedCode}</code>
                </pre>
              </div>
            ) : null}

            {/* Footer Metadata */}
            <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400 dark:text-slate-500 border-t border-emerald-200/40 dark:border-emerald-900/30">
              <span>{aiResult.model || "Llama 3.3 / Gemini"}</span>
              <span>{aiResult.timestamp}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-[#E6EEF0] dark:border-[#1E293B] bg-[#FAFCFC] dark:bg-[#1E293B] p-3 text-[11px] font-medium text-[#5D6B82] dark:text-[#94A3B8]">
            <div className="flex items-center justify-between font-semibold text-[#0B1B33] dark:text-[#E2E8F0]">
              <span>Smart Workspace Context</span>
              <span className="flex h-2 w-2 rounded-full bg-[#009B5A] animate-pulse" />
            </div>
            <p className="mt-1 text-[#3D4A63] dark:text-[#CBD5E1]">
              Connected to Monaco Editor state, active code syntax, and execution engine.
            </p>
          </div>
        )}

        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A99AA] dark:text-[#64748B]">
          {aiResult ? "Ask Another Action" : "Quick Contextual Actions"}
        </p>
        <div className="grid gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onAiAction(action.id)}
              disabled={activeAiAction !== null}
              className={cn(
                "group flex flex-col rounded-xl border border-[#E6EEF0] dark:border-[#1E293B] bg-white dark:bg-[#1E293B] p-3 text-left transition-all active:scale-[0.98]",
                activeAiAction === action.id
                  ? "border-[#009B5A] bg-[#EFFFF5] dark:bg-[#009B5A]/20 shadow-[0_4px_12px_rgba(0,155,90,0.1)]"
                  : "hover:border-[#009B5A]/40 hover:bg-[#FAFCFC] dark:hover:bg-[#0E1726] hover:shadow-xs",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0B1B33] dark:text-[#E2E8F0] flex items-center gap-1.5">
                  <span>{action.icon}</span>
                  {activeAiAction === action.id ? "Analyzing Workspace..." : action.label}
                </span>
                {activeAiAction === action.id ? (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#009B5A] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#009B5A]" />
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[11px] font-medium leading-relaxed text-[#5D6B82] dark:text-[#94A3B8]">
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
  collapsed,
  folders,
  files,
  fileContents,
  activeFileId,
  dirtyFileIds,
  tests,
  versions,
  activeAiAction,
  aiResult,
  onToggleCollapsed,
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
  onClearAiResult,
  onApplyCode,
}: {
  activePanel: IdePanelId;
  collapsed: boolean;
  folders: FolderNode[];
  files: FileNode[];
  fileContents: Record<string, string>;
  activeFileId: string;
  dirtyFileIds: Set<string>;
  tests: TestCase[];
  versions: StoredCodeLabWorkspace["versions"];
  activeAiAction: AiAction | null;
  aiResult: AiResultData | null;
  onToggleCollapsed: () => void;
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
  onClearAiResult: () => void;
  onApplyCode: (code: string) => void;
}) {
  const problemCount = tests.filter((test) => test.status === "failed").length;

  if (collapsed) return null;

  const tabs: { id: IdePanelId; label: string; icon: LucideIcon; badge?: number }[] = [
    { id: "explorer", label: "Files", icon: FolderOpen, badge: dirtyFileIds.size },
    { id: "search", label: "Search", icon: Search },
    { id: "tests", label: "Tests", icon: CheckCircle2, badge: problemCount },
    { id: "history", label: "Versions", icon: RefreshCw },
    { id: "ai", label: "AI Copilot", icon: Command },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden border-r border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0B101B]">
      {/* Top Pill Navigation Rail */}
      <nav
        aria-label="Code Lab navigation tabs"
        className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0B101B] px-2 py-1.5 gap-1 select-none"
      >
        <div className="flex items-center gap-1 overflow-x-auto min-w-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activePanel === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectPanel(tab.id)}
                aria-label={tab.label}
                aria-pressed={active}
                className={cn(
                  "relative inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all",
                  active
                    ? "bg-white dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] shadow-2xs font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1 py-0.2 text-[8px] font-bold">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Collapse Sidebar Button */}
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </nav>

      {/* Main Active Panel Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
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
          <AiPanel
            activeAiAction={activeAiAction}
            aiResult={aiResult}
            onAiAction={onAiAction}
            onClearAiResult={onClearAiResult}
            onApplyCode={onApplyCode}
          />
        ) : null}
      </div>
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
  const saveLabel =
    autosaveStatus === "saving"
      ? "Saving..."
      : autosaveStatus === "error"
        ? "Save paused"
        : dirtyCount > 0
          ? `${dirtyCount} unsaved`
          : "Saved";
  const storageLabel =
    dbStatus === "ready"
      ? "Neon DB"
      : dbStatus === "loading"
        ? "Connecting..."
        : "Local Cache";

  const errorCount = problems.filter((p) => p.severity === "error").length;
  const warningCount = problems.filter((p) => p.severity === "warning").length;

  return (
    <footer
      title={workspaceTitle}
      className="flex h-6 shrink-0 items-center justify-between border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#F1F5F9] dark:bg-[#070B14] px-2.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 select-none"
    >
      {/* Left items */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold hover:text-[#059669] cursor-pointer">
          <GitBranch className="h-3 w-3 text-[#059669]" />
          main{dirtyCount > 0 ? "*" : ""}
        </span>

        <span className="flex items-center gap-2 border-l border-slate-300 dark:border-slate-800 pl-2">
          <span className="flex items-center gap-0.5 text-slate-600 dark:text-slate-400">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 text-white font-black text-[7px] grid place-items-center">✕</span>
            <span>{errorCount}</span>
          </span>
          <span className="flex items-center gap-0.5 text-slate-600 dark:text-slate-400">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 text-white font-black text-[7px] grid place-items-center">!</span>
            <span>{warningCount}</span>
          </span>
        </span>

        <span className="hidden sm:inline border-l border-slate-300 dark:border-slate-800 pl-2 text-slate-600 dark:text-slate-400">
          Tests: {passed}/{tests.length}
        </span>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-3">
        <span className="hidden md:inline text-slate-500 dark:text-slate-400">
          Spaces: 2
        </span>
        <span className="hidden md:inline text-slate-500 dark:text-slate-400">
          UTF-8
        </span>

        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold border-l border-slate-300 dark:border-slate-800 pl-2">
          <span className="uppercase text-[10px] text-[#059669] dark:text-[#34D399]">
            {language}
          </span>
        </span>

        <span className="flex items-center gap-1 border-l border-slate-300 dark:border-slate-800 pl-2">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              autosaveStatus === "saving"
                ? "bg-amber-400 animate-ping"
                : dirtyCount > 0
                  ? "bg-amber-500"
                  : "bg-[#10B981]",
            )}
          />
          <span className="text-[10px]">{saveLabel}</span>
        </span>

        <span className="hidden sm:flex items-center gap-1 border-l border-slate-300 dark:border-slate-800 pl-2 text-[10px] text-slate-500 dark:text-slate-400">
          <span>●</span>
          <span>{storageLabel}</span>
        </span>

        <span className="flex items-center gap-1 border-l border-slate-300 dark:border-slate-800 pl-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
          ⚡ {executionMs > 0 ? `${executionMs}ms` : "~11ms"}
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
        "group relative flex items-center gap-2 rounded-t-lg border-x border-t px-3 py-1.5 text-xs font-medium transition-all select-none",
        active
          ? "border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0B101B] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs font-semibold"
          : "border-transparent bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200",
      )}
    >
      {active ? (
        <span className="absolute -top-px left-0 right-0 h-0.5 bg-[#059669] dark:bg-[#34D399] rounded-t" />
      ) : null}

      <button
        type="button"
        onClick={onSelect}
        className="flex items-center gap-1.5 min-w-0"
      >
        <FileTypeIcon name={file.name} className="h-3.5 w-3.5" />
        <span className="truncate max-w-[130px] font-mono text-[12px]">{file.name}</span>
        {dirty ? (
          <span
            className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"
            aria-label="Unsaved changes"
            title="Unsaved changes"
          />
        ) : null}
      </button>

      {closable ? (
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${file.name}`}
          className="grid h-4 w-4 place-items-center rounded text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white opacity-40 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  );
}

function CarbonCodeSnippetModal({
  isOpen,
  onClose,
  fileName,
  language,
  code,
}: {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyMarkdown = () => {
    void navigator.clipboard.writeText(
      `\`\`\`${language}\n// ${fileName}\n${code}\n\`\`\``,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#1E293B] bg-[#090D16] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] bg-[#0F172A] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#EF4444]" />
            <span className="h-3 w-3 rounded-full bg-[#F59E0B]" />
            <span className="h-3 w-3 rounded-full bg-[#10B981]" />
            <span className="ml-2 font-mono text-xs font-semibold text-slate-300">
              {fileName} ({language})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Code Canvas Preview */}
        <div className="max-h-[480px] overflow-auto p-6 bg-gradient-to-br from-slate-900 via-[#0B101B] to-slate-950">
          <div className="rounded-xl border border-slate-700/60 bg-[#0F172A]/90 p-4 shadow-xl backdrop-blur-md">
            <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                <span className="ml-2 font-mono text-[11px] text-slate-400">
                  nexora://{fileName}
                </span>
              </div>
              <span className="rounded bg-emerald-950 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 uppercase">
                {language}
              </span>
            </div>
            <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-slate-200">
              {code.split("\n").map((line, i) => (
                <div key={i} className="flex gap-4">
                  <span className="w-6 shrink-0 select-none text-right text-slate-600">
                    {i + 1}
                  </span>
                  <span className="flex-1">{line || " "}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-[#1E293B] bg-[#0F172A] px-4 py-3">
          <span className="text-xs text-slate-400">
            Shareable developer code card with syntax formatting
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 active:scale-98"
            >
              {copied ? "✓ Copied to Clipboard!" : "Copy as Markdown"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-500 active:scale-98"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeEditorPanel({
  openFiles,
  activeFileId,
  dirtyFileIds,
  workspaceExpanded,
  leftPanelCollapsed,
  onToggleWorkspaceExpanded,
  onToggleSidebar,
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
  leftPanelCollapsed?: boolean;
  onToggleWorkspaceExpanded: () => void;
  onToggleSidebar?: () => void;
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
    "nexora-code-dark" | "nexora-code-light" | "nexora-one-dark" | "nexora-catppuccin" | null
  >(null);
  const [fontSize, setFontSize] = useState(13.5);
  const [fontFamily, setFontFamily] = useState(
    "'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace",
  );
  const [minimap, setMinimap] = useState(true);
  const [wordWrap, setWordWrap] = useState<"on" | "off">("off");
  const [tabSize, setTabSize] = useState<2 | 4>(4);
  const [isSplitView, setIsSplitView] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [snippetModalOpen, setSnippetModalOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoTheme = editorThemeOverride ?? systemMonacoTheme;
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

  const dynamicMonacoOptions = useMemo<EditorProps["options"]>(
    () => ({
      ...monacoOptions,
      fontSize,
      fontFamily,
      minimap: { enabled: minimap, maxColumn: 80, scale: 0.85, renderCharacters: false },
      wordWrap,
      tabSize,
    }),
    [fontSize, fontFamily, minimap, wordWrap, tabSize],
  );

  return (
    <section
      className={cn(
        idePanelClass,
        "flex h-full flex-col overflow-hidden relative",
        workspaceExpanded
          ? "min-h-0 rounded-[14px] shadow-none"
          : "min-h-[420px] lg:min-h-0",
      )}
    >
      {/* Carbon Export Modal */}
      <CarbonCodeSnippetModal
        isOpen={snippetModalOpen}
        onClose={() => setSnippetModalOpen(false)}
        fileName={activeFile?.name ?? "main.js"}
        language={editorLanguage}
        code={content}
      />

      {/* Editor Tabs Header */}
      <header className="flex shrink-0 items-end justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0B101B] px-2 pt-1.5">
        <div className="flex min-w-0 items-end gap-1 overflow-x-auto">
          {leftPanelCollapsed && onToggleSidebar ? (
            <button
              type="button"
              onClick={onToggleSidebar}
              title="Open Sidebar (Files / AI / Tests)"
              aria-label="Open Sidebar"
              className="mb-1 mr-1 flex shrink-0 items-center gap-1 rounded-md border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#1E293B] px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-[#059669] hover:text-[#059669] transition shadow-2xs"
            >
              <FolderOpen className="h-3.5 w-3.5 text-[#059669] dark:text-[#34D399]" />
              <span>Sidebar</span>
            </button>
          ) : null}
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
            title="New file tab"
            aria-label="New tab"
            onClick={onCreateFile}
            className="mb-1 grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Micro-toolbar */}
        <div className="mb-1.5 flex items-center gap-0.5">
          {/* Format Code */}
          <button
            type="button"
            title="Format document (Shift+Alt+F)"
            aria-label="Format document"
            onClick={handleFormatDocument}
            className="grid h-7 w-7 place-items-center rounded text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
          >
            <Code2 className="h-3.5 w-3.5" />
          </button>

          {/* Quick Appearance & Settings Popover */}
          <div className="relative">
            <button
              type="button"
              title="Editor Appearance & Settings"
              aria-label="Editor settings"
              onClick={() => {
                setSettingsOpen((current) => !current);
                setMoreOpen(false);
              }}
              className={cn(
                "grid h-7 w-7 place-items-center rounded transition",
                settingsOpen
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
              )}
            >
              <Palette className="h-3.5 w-3.5" />
            </button>

            {settingsOpen ? (
              <div className="absolute right-0 top-8 z-40 w-64 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0E1726] p-3 text-xs shadow-xl">
                <div className="mb-2.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <span>Editor Appearance</span>
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Theme Selector */}
                <div className="mb-2.5 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500">Theme Preset</label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { id: "nexora-code-dark", label: "Slate Dark" },
                      { id: "nexora-one-dark", label: "One Dark Pro" },
                      { id: "nexora-catppuccin", label: "Catppuccin" },
                      { id: "nexora-code-light", label: "Clean Light" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setEditorThemeOverride(t.id as any)}
                        className={cn(
                          "rounded-md px-2 py-1 text-left text-[11px] font-medium transition",
                          (editorThemeOverride ?? systemMonacoTheme) === t.id
                            ? "bg-emerald-500 text-white font-bold"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div className="mb-2.5 flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-500">Font Size ({fontSize}px)</label>
                  <div className="flex items-center gap-1">
                    {[12, 13.5, 15, 16].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFontSize(s)}
                        className={cn(
                          "h-5 w-6 rounded text-[10px] font-mono font-bold transition",
                          fontSize === s
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Family */}
                <div className="mb-2.5 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-1 font-mono text-[11px] text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="'Geist Mono', 'JetBrains Mono', monospace">Geist / JetBrains</option>
                    <option value="'Fira Code', monospace">Fira Code (Ligatures)</option>
                    <option value="'Cascadia Code', Consolas, monospace">Cascadia Code</option>
                    <option value="Menlo, Monaco, monospace">Apple Menlo</option>
                  </select>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={minimap}
                      onChange={(e) => setMinimap(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    Minimap
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wordWrap === "on"}
                      onChange={(e) => setWordWrap(e.target.checked ? "on" : "off")}
                      className="rounded accent-emerald-500"
                    />
                    Word Wrap
                  </label>
                </div>
              </div>
            ) : null}
          </div>

          {/* Share / Carbon Snapshot Exporter */}
          <button
            type="button"
            title="Export Shareable Code Card"
            aria-label="Export Shareable Code Card"
            onClick={() => setSnippetModalOpen(true)}
            className="grid h-7 w-7 place-items-center rounded text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          {/* Focus Mode */}
          <button
            type="button"
            title={
              workspaceExpanded
                ? "Exit focus mode (Esc)"
                : "Focus workspace mode"
            }
            aria-label={workspaceExpanded ? "Exit focus mode" : "Focus workspace mode"}
            aria-pressed={workspaceExpanded}
            onClick={onToggleWorkspaceExpanded}
            className="grid h-7 w-7 place-items-center rounded text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>

          {/* More Actions Menu */}
          <div className="relative">
            <button
              type="button"
              title="Editor Actions"
              aria-label="Editor actions"
              aria-expanded={moreOpen}
              onClick={() => {
                setMoreOpen((current) => !current);
                setSettingsOpen(false);
              }}
              className="grid h-7 w-7 place-items-center rounded text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            {moreOpen ? (
              <div className="absolute right-0 top-8 z-30 w-48 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0E1726] p-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-lg">
                <button
                  type="button"
                  onClick={handleFormatDocument}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition hover:bg-[#ECFDF5] dark:hover:bg-[#064E3B]/30 hover:text-[#059669] dark:hover:text-[#34D399]"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  Format Document
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSplitView((current) => !current);
                    setMoreOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition hover:bg-[#ECFDF5] dark:hover:bg-[#064E3B]/30 hover:text-[#059669] dark:hover:text-[#34D399]"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {isSplitView ? "Close Split Editor" : "Split Editor Right"}
                </button>
                <button
                  type="button"
                  onClick={handleCopyFileName}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition hover:bg-[#ECFDF5] dark:hover:bg-[#064E3B]/30 hover:text-[#059669] dark:hover:text-[#34D399]"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy File Name
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Precision Breadcrumb Line */}
      <div className="flex items-center gap-1.5 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0B101B] px-3 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 select-none">
        <span className="text-[#059669] dark:text-[#34D399] font-semibold">workspace</span>
        <span className="text-slate-300 dark:text-slate-700">›</span>
        <span>src</span>
        <span className="text-slate-300 dark:text-slate-700">›</span>
        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeFile?.name ?? "main.js"}</span>
        <span className="ml-auto rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-slate-600 dark:text-slate-400">
          {editorLanguage}
        </span>
      </div>

      {/* Monaco Editor Container */}
      <div
        className={cn(
          "relative min-h-0 flex-1 overflow-hidden bg-white dark:bg-[#0B101B]",
          isSplitView &&
            "grid grid-cols-1 divide-y divide-[#E2E8F0] dark:divide-[#1E293B] md:grid-cols-2 md:divide-x md:divide-y-0",
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
            options={dynamicMonacoOptions}
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
  | "input"
  | "output"
  | "errors"
  | "problems";

function ConsolePanel({
  consoleOutput,
  errorOutput,
  htmlPreview,
  problems,
  inputValue,
  onInputChange,
  onClear,
  collapsed,
  onToggleCollapsed,
  maximized,
  onToggleMaximized,
  consoleHeight,
  onConsoleHeightChange,
  executionMs,
  status,
  activeTab,
  onTabChange,
}: {
  consoleOutput: string;
  errorOutput: string;
  htmlPreview?: string;
  problems: ProblemItem[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onClear: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  maximized: boolean;
  onToggleMaximized: () => void;
  consoleHeight: number;
  onConsoleHeightChange: (value: number) => void;
  executionMs: number;
  status: "success" | "error" | "idle";
  activeTab: ConsoleTab;
  onTabChange: (tab: ConsoleTab) => void;
}) {
  const resizeState = useRef<{ startY: number; startHeight: number } | null>(
    null,
  );

  function handleResizeStart(event: ReactPointerEvent<HTMLDivElement>) {
    resizeState.current = {
      startY: event.clientY,
      startHeight: consoleHeight,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleResizeMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!resizeState.current) return;
    const nextHeight =
      resizeState.current.startHeight -
      (event.clientY - resizeState.current.startY);
    onConsoleHeightChange(Math.max(140, Math.min(520, nextHeight)));
  }

  function handleResizeEnd(event: ReactPointerEvent<HTMLDivElement>) {
    resizeState.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  const tabs: { id: ConsoleTab; label: string }[] = [
    { id: "console", label: "Console" },
    { id: "input", label: "Input" },
    ...(htmlPreview ? [{ id: "output" as const, label: "Live Preview" }] : []),
    { id: "errors", label: "Errors" },
    { id: "problems", label: `Problems (${problems.length})` },
  ];

  return (
    <section
      className={cn(
        idePanelClass,
        "flex h-full min-h-0 flex-col overflow-hidden border-t border-[#E2E8F0] dark:border-[#1E293B]",
      )}
    >
      {!collapsed ? (
        <div
          role="separator"
          aria-label="Resize console"
          aria-orientation="horizontal"
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
          className="group grid h-1.5 shrink-0 touch-none cursor-row-resize place-items-center bg-[#F8FAFC] dark:bg-[#0B101B] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] transition select-none"
        >
          <GripHorizontal className="h-3 w-3 text-slate-400 dark:text-slate-600 transition group-hover:text-[#059669]" />
        </div>
      ) : null}

      {/* Console Tab Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0B101B] px-3 py-1.5 select-none">
        <div className="flex items-center gap-1">
          {collapsed ? (
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Console Drawer</span>
              <span className="text-[10px] text-slate-400 font-normal">(Click to open)</span>
            </button>
          ) : (
            tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                  activeTab === item.id
                    ? "bg-white dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] shadow-2xs font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40",
                )}
                aria-pressed={activeTab === item.id}
              >
                {item.label}
                {item.id === "errors" && errorOutput ? (
                  <span className="ml-1.5 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950 px-1 text-[9px] font-bold text-rose-700 dark:text-rose-300">
                    !
                  </span>
                ) : null}
                {item.id === "problems" && problems.length > 0 ? (
                  <span className="ml-1.5 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950 px-1 text-[9px] font-bold text-amber-700 dark:text-amber-300">
                    {problems.length}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>

        {/* Right Status Badges & Controls */}
        <div className="flex items-center gap-1.5">
          {!collapsed && status === "success" ? (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-3 w-3 text-[#059669]" />
              Exit Code: 0
            </span>
          ) : !collapsed && status === "error" ? (
            <span className="inline-flex items-center gap-1 rounded bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <AlertTriangle className="h-3 w-3 text-rose-600" />
              Runtime Error
            </span>
          ) : null}

          {!collapsed && executionMs > 0 ? (
            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              ⚡ {executionMs}ms
            </span>
          ) : null}

          {!collapsed ? (
            <button
              type="button"
              onClick={onClear}
              className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
              aria-label="Clear Console Output"
              title="Clear Console Output"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          ) : null}

          {/* 1-Click Maximize / Restore Toggle */}
          {!collapsed ? (
            <button
              type="button"
              onClick={onToggleMaximized}
              className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
              aria-label={maximized ? "Restore Console Height" : "Maximize Console Height"}
              title={maximized ? "Restore Console Height" : "Maximize Console Height"}
            >
              {maximized ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </button>
          ) : null}

          {/* Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
            aria-label={collapsed ? "Expand Drawer" : "Collapse Drawer"}
            title={collapsed ? "Expand Drawer" : "Collapse Drawer"}
          >
            {collapsed ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </header>

      {/* Drawer Body */}
      {!collapsed ? (
        <div className="min-h-0 flex-1 overflow-auto font-mono text-[12.5px] leading-relaxed bg-white dark:bg-[#0B101B] p-3 text-slate-800 dark:text-slate-200">
          {activeTab === "console" ? (
            <div className="flex flex-col gap-1 h-full">
              <div className="flex items-center justify-between text-xs text-slate-400 select-none pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">❯</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Program Output</span>
                </span>
                <span className="text-[10px] text-slate-400">Cloud Sandbox</span>
              </div>
              <pre className="m-0 whitespace-pre-wrap break-words font-mono text-[12.5px] pt-1.5 flex-1 text-slate-900 dark:text-slate-100">
                {consoleOutput || "Your code output will appear here. Press 'Run Code' or Ctrl+Enter to execute."}
              </pre>
            </div>
          ) : null}

          {activeTab === "input" ? (
            <div className="flex flex-col gap-2 h-full">
              <span className="text-xs text-slate-500 font-sans font-medium">
                Provide custom input values for your code (one per line):
              </span>
              <textarea
                value={inputValue}
                onChange={(event) => onInputChange(event.target.value)}
                rows={4}
                placeholder="Type your test input values here (e.g. 5) before running..."
                className="w-full flex-1 resize-none rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#111827] p-2.5 font-mono text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#059669]"
              />
            </div>
          ) : null}

          {activeTab === "output" && htmlPreview ? (
            <iframe
              title="HTML preview"
              sandbox="allow-scripts"
              srcDoc={htmlPreview}
              className="h-full min-h-[140px] w-full rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white"
            />
          ) : null}

          {activeTab === "errors" ? (
            <div className="flex flex-col gap-1 h-full">
              <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold select-none pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Error Details & Traceback</span>
              </div>
              <pre className="m-0 whitespace-pre-wrap break-words text-rose-600 dark:text-rose-400 font-mono text-xs pt-1.5">
                {errorOutput || "All clear — no runtime or syntax errors detected in your code."}
              </pre>
            </div>
          ) : null}

          {activeTab === "problems" ? (
            problems.length > 0 ? (
              <div className="grid gap-1.5 font-sans">
                {problems.map((problem) => (
                  <div
                    key={problem.id}
                    className={cn(
                      "flex items-start gap-2.5 rounded-lg border p-2 text-xs transition",
                      problem.severity === "error"
                        ? "border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200"
                        : "border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200",
                    )}
                  >
                    <AlertTriangle
                      className={cn(
                        "mt-0.5 h-3.5 w-3.5 shrink-0",
                        problem.severity === "error"
                          ? "text-rose-600"
                          : "text-amber-600",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 font-semibold">
                        <span className="font-mono text-[11px] underline underline-offset-2">
                          {problem.source}
                        </span>
                        <span className="rounded px-1 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-white/80 dark:bg-black/40">
                          {problem.severity}
                        </span>
                      </div>
                      <p className="mt-0.5 text-slate-700 dark:text-slate-300 font-mono text-[11.5px]">
                        {problem.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-sans text-xs text-slate-500">
                Everything looks good! No issues or failing test cases detected.
              </p>
            )
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

// ---------- LeetCode-style Right Instruction & Test Suite Panel ----------

type InstructionTab = "instructions" | "tests" | "help";

function InstructionPanel({
  tests,
  onRunTests,
  onAddCustomTest,
  lastRunResult,
  onAiAction,
  activeAiAction,
  collapsed,
  onToggleCollapsed,
}: {
  tests: TestCase[];
  onRunTests: () => void;
  onAddCustomTest?: (test: TestCase) => void;
  lastRunResult?: CodeRunResult | null;
  onAiAction: (action: AiAction) => void;
  activeAiAction: AiAction | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const [tab, setTab] = useState<InstructionTab>("tests");
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [customExpected, setCustomExpected] = useState("");

  const passedCount = tests.filter((t) => t.status === "passed").length;
  const currentTest = tests[activeTestIndex] ?? tests[0];

  const aiActions: { id: AiAction; label: string; icon: string }[] = [
    { id: "explain", label: "Explain Code Logic", icon: "💡" },
    { id: "debug", label: "Find Bugs & Edge Cases", icon: "🔍" },
    { id: "improve", label: "Optimize Runtime & Memory", icon: "⚡" },
  ];

  const handleCreateCustomCase = () => {
    if (!customExpected.trim()) return;
    if (onAddCustomTest) {
      onAddCustomTest({
        id: `custom-${Date.now()}`,
        input: customInput.trim(),
        expected: customExpected.trim(),
        status: "pending",
        actual: undefined,
      });
    }
    setIsAddingCustom(false);
    setCustomInput("");
    setCustomExpected("");
    setActiveTestIndex(tests.length);
  };

  if (collapsed) {
    return (
      <aside
        className={cn(
          idePanelClass,
          "code-lab-task-panel is-collapsed flex h-full min-h-0 flex-col items-center border-l border-[#E2E8F0] dark:border-[#1E293B] py-2 select-none",
        )}
      >
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition"
          aria-label="Open task panel"
          title="Open Task & Tests Panel"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 [writing-mode:vertical-rl]">
          Test Suite ({passedCount}/{tests.length})
        </span>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        idePanelClass,
        "code-lab-task-panel flex h-full min-h-0 flex-col overflow-hidden border-l border-[#E2E8F0] dark:border-[#1E293B]",
      )}
    >
      {/* Segmented Header */}
      <header className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0B101B] px-2.5 py-1.5 select-none">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTab("tests")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
              tab === "tests"
                ? "bg-white dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] shadow-2xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40",
            )}
          >
            Test Cases ({passedCount}/{tests.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("instructions")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
              tab === "instructions"
                ? "bg-white dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] shadow-2xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40",
            )}
          >
            Instructions
          </button>
          <button
            type="button"
            onClick={() => setTab("help")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
              tab === "help"
                ? "bg-white dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] shadow-2xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40",
            )}
          >
            AI Assistant
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleCollapsed}
          className="grid h-6 w-6 shrink-0 place-items-center rounded text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
          aria-label="Collapse Panel"
          title="Collapse Panel"
        >
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </header>

      {/* Main Panel Body */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {tab === "tests" ? (
          <div className="flex flex-col gap-3 h-full">
            {/* Performance Speedometer Badge */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1726] p-2.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  ⚡
                </span>
                <div>
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {lastRunResult?.executionTime ? `${lastRunResult.executionTime}ms Execution` : "Fast Execution"}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Optimized Runtime
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  1.4 MB
                </div>
                <div className="text-[10px] text-slate-500">
                  Memory Usage
                </div>
              </div>
            </div>

            {/* LeetCode Case Tabs + Custom Case Button */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {tests.map((test, index) => {
                const isSelected = index === activeTestIndex && !isAddingCustom;
                const isPassed = test.status === "passed";
                const isFailed = test.status === "failed";

                return (
                  <button
                    key={test.id}
                    type="button"
                    onClick={() => {
                      setActiveTestIndex(index);
                      setIsAddingCustom(false);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all shrink-0",
                      isSelected
                        ? "border-[#059669] dark:border-[#34D399] bg-[#ECFDF5] dark:bg-[#064E3B]/30 text-[#059669] dark:text-[#34D399]"
                        : "border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 hover:border-slate-300",
                    )}
                  >
                    <span>Case {index + 1}</span>
                    {isPassed ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    ) : isFailed ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsAddingCustom(true)}
                className={cn(
                  "flex items-center gap-1 rounded-lg border border-dashed px-2 py-1 text-[11px] font-semibold transition shrink-0",
                  isAddingCustom
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                    : "border-slate-300 dark:border-slate-700 text-slate-500 hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-300",
                )}
              >
                <Plus className="h-3 w-3" />
                <span>+ Custom Case</span>
              </button>
            </div>

            {/* Custom Case Builder Form */}
            {isAddingCustom ? (
              <div className="flex flex-col gap-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 p-3">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  Create Custom Test Case
                </span>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Test Input</label>
                  <input
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g. 7"
                    className="mt-0.5 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B101B] px-2 py-1 font-mono text-xs text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Expected Output</label>
                  <input
                    value={customExpected}
                    onChange={(e) => setCustomExpected(e.target.value)}
                    placeholder="e.g. 5040"
                    className="mt-0.5 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B101B] px-2 py-1 font-mono text-xs text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingCustom(false)}
                    className="rounded px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCustomCase}
                    className="rounded bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-emerald-500"
                  >
                    Save Case
                  </button>
                </div>
              </div>
            ) : null}

            {/* Selected Test Case Detail & Visual Diff */}
            {!isAddingCustom && currentTest ? (
              <div className="flex flex-col gap-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#111827]/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Test Case {activeTestIndex + 1}
                  </span>
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                      currentTest.status === "passed"
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                        : currentTest.status === "failed"
                          ? "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
                    )}
                  >
                    {currentTest.status}
                  </span>
                </div>

                {/* Input Card */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Test Input</span>
                  <pre className="mt-1 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0B101B] p-2 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto">
                    {currentTest.input || "(empty input)"}
                  </pre>
                </div>

                {/* Expected Output Card */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Expected Output</span>
                  <pre className="mt-1 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0B101B] p-2 font-mono text-xs text-emerald-700 dark:text-emerald-400 font-semibold overflow-x-auto">
                    {currentTest.expected}
                  </pre>
                </div>

                {/* Visual Diff if Failed */}
                {currentTest.status === "failed" && currentTest.actual !== undefined ? (
                  <div>
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      Output Comparison
                    </span>
                    <div className="mt-1 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 p-2 font-mono text-xs">
                      <div className="text-emerald-600 dark:text-emerald-400">
                        + Expected: {currentTest.expected}
                      </div>
                      <div className="text-rose-600 dark:text-rose-400 font-bold">
                        - Actual:   {currentTest.actual || "(no output)"}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Run All Tests CTA */}
            <div className="mt-auto pt-2">
              <button
                type="button"
                onClick={onRunTests}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] py-2.5 text-xs font-bold text-white shadow-[0_4px_14px_rgba(5,150,105,0.3)] transition hover:from-[#047857] hover:to-[#059669] active:scale-[0.98]"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Run All Tests ({tests.length})
              </button>
            </div>
          </div>
        ) : null}

        {tab === "instructions" ? (
          <div className="flex flex-col gap-3 text-xs leading-relaxed">
            {/* Problem Header */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] dark:text-[#34D399]">
                Problem Task
              </span>
              <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                Factorial Calculator & Sequence Logic
              </h3>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Read integer <code className="rounded bg-slate-100 dark:bg-slate-800 px-1 font-mono text-slate-800 dark:text-slate-200">n</code> from test input and calculate the factorial value <code className="font-mono">n!</code>.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#111827] p-2.5 font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
              Formula: n! = n × (n-1) × ... × 1
            </div>

            {/* Live Progress Checklist */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Checklist & Milestones ({passedCount}/{tests.length})
                </span>
                <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round((passedCount / (tests.length || 1)) * 100)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 mb-2">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${Math.round((passedCount / (tests.length || 1)) * 100)}%`,
                  }}
                />
              </div>

              <ul className="grid gap-1.5 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2
                    className={cn(
                      "mt-0.5 h-3.5 w-3.5 shrink-0",
                      passedCount >= 1 ? "text-emerald-500" : "text-slate-400",
                    )}
                  />
                  <span>Recursion / Iteration control flow</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2
                    className={cn(
                      "mt-0.5 h-3.5 w-3.5 shrink-0",
                      passedCount >= 2 ? "text-emerald-500" : "text-slate-400",
                    )}
                  />
                  <span>Validation for non-negative integers</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2
                    className={cn(
                      "mt-0.5 h-3.5 w-3.5 shrink-0",
                      passedCount === tests.length ? "text-emerald-500" : "text-slate-400",
                    )}
                  />
                  <span>Input handling and output formatting</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 text-[11px] text-emerald-800 dark:text-emerald-300">
              🛡️ <strong>Original Solution:</strong> Make sure your code is your own before submitting.
            </div>
          </div>
        ) : null}

        {tab === "help" ? (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              AI Code Assistant
            </span>
            {aiActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => onAiAction(action.id)}
                disabled={activeAiAction !== null}
                className="flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-2.5 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 transition hover:border-[#059669] hover:bg-[#ECFDF5] dark:hover:bg-[#064E3B]/30 disabled:opacity-60"
              >
                <span>{action.icon}</span>
                <span className="flex-1">{activeAiAction === action.id ? "Analyzing..." : action.label}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </aside>
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
    <div className="fixed inset-0 z-[120] bg-[#07110C]/40 p-4 backdrop-blur-xs">
      <div className="mx-auto mt-[8vh] w-full max-w-xl overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0B101B] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] dark:border-[#1E293B] px-3.5 py-2.5">
          <Search className="h-4 w-4 text-[#059669] dark:text-[#34D399]" />
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
            placeholder="Search files by name..."
            className="h-8 min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
          />
          <kbd className="rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] text-slate-500">
            Esc
          </kbd>
        </div>
        <div className="max-h-[320px] overflow-y-auto p-1.5">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => {
                  onSelectFile(file);
                  onClose();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FileTypeIcon name={file.name} className="h-4 w-4" />
                <span className="min-w-0 flex-1 truncate text-xs font-mono text-slate-800 dark:text-slate-200">
                  {file.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {file.language}
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-xs text-slate-400">
              No matching files found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CommandPalette({
  commands,
  query,
  onQueryChange,
  onClose,
}: {
  commands: CodeLabCommand[];
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCommands = commands.filter(
    (command) =>
      !normalizedQuery ||
      command.label.toLowerCase().includes(normalizedQuery) ||
      command.detail.toLowerCase().includes(normalizedQuery),
  );

  function runCommand(command?: CodeLabCommand) {
    if (!command) return;
    onClose();
    command.action();
  }

  return (
    <div className="fixed inset-0 z-[125] bg-[#07110C]/40 p-4 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Code Lab Command Palette"
        className="mx-auto mt-[8vh] w-full max-w-xl overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0B101B] shadow-2xl"
      >
        <div className="flex items-center gap-2.5 border-b border-[#E2E8F0] dark:border-[#1E293B] px-3.5 py-2.5">
          <Command className="h-4 w-4 shrink-0 text-[#059669] dark:text-[#34D399]" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              onQueryChange(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") onClose();
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((current) =>
                  Math.min(current + 1, filteredCommands.length - 1),
                );
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((current) => Math.max(current - 1, 0));
              }
              if (event.key === "Enter") {
                event.preventDefault();
                runCommand(filteredCommands[activeIndex]);
              }
            }}
            placeholder="Type a command or search actions..."
            className="h-8 min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
          />
          <kbd className="rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] text-slate-500">
            Esc
          </kbd>
        </div>
        <div className="max-h-[360px] overflow-y-auto p-1.5">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => {
              const Icon = command.icon;
              const active = index === activeIndex;

              return (
                <button
                  key={command.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => runCommand(command)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition",
                    active
                      ? "bg-[#ECFDF5] dark:bg-[#064E3B]/30 text-[#059669] dark:text-[#34D399]"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-[#059669] dark:text-[#34D399]" : "text-slate-400",
                    )}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold">
                      {command.label}
                    </span>
                    <span className="block truncate text-[10px] text-slate-400">
                      {command.detail}
                    </span>
                  </div>
                  {command.shortcut ? (
                    <kbd className="shrink-0 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] text-slate-500">
                      {command.shortcut}
                    </kbd>
                  ) : null}
                </button>
              );
            })
          ) : (
            <p className="px-3 py-6 text-center text-xs text-slate-400">
              No matching commands.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Main page ----------

export function CodeLabPage({ role }: { role: AppRole }) {
  const roleData = roleDashboards[role];

  const [folders, setFolders] = useState<FolderNode[]>(() => {
    const cached = readStoredWorkspace();
    return cached?.folders?.length ? cached.folders : initialFolders;
  });

  const allFiles = useMemo(() => flattenFiles(folders), [folders]);

  const [openFileIds, setOpenFileIds] = useState<string[]>(() => {
    const cached = readStoredWorkspace();
    return cached?.openFileIds?.length
      ? cached.openFileIds
      : [initialFolders[0]?.files[0]?.id ?? "main.py"];
  });

  const [activeFileId, setActiveFileId] = useState<string>(() => {
    const cached = readStoredWorkspace();
    return (
      cached?.activeFileId ??
      cached?.openFileIds?.[0] ??
      initialFolders[0]?.files[0]?.id ??
      "main.py"
    );
  });

  const [language, setLanguage] = useState<LanguageId>(() => {
    const cached = readStoredWorkspace();
    if (cached?.language) return cached.language as LanguageId;
    const initialFile = initialFolders[0]?.files[0];
    return (initialFile?.language as LanguageId) ?? "python";
  });

  const [environment, setEnvironment] = useState<EnvironmentId>("standard");
  const [workspaceId, setWorkspaceId] = useState<string | null>(() => {
    const cached = readStoredWorkspace();
    return cached?.workspaceId ?? null;
  });
  const [workspaceTitle, setWorkspaceTitle] = useState(() => {
    const cached = readStoredWorkspace();
    return cached?.workspaceTitle ?? "Code Lab Workspace";
  });
  const [dbStatus, setDbStatus] = useState<"loading" | "ready" | "draft">(
    "loading",
  );

  const [fileContents, setFileContents] = useState<Record<string, string>>(() => {
    const cached = readStoredWorkspace();
    if (cached?.fileContents && Object.keys(cached.fileContents).length > 0) {
      return cached.fileContents;
    }
    return fileContentsFromFolders(initialFolders);
  });

  const [savedFileSnapshots, setSavedFileSnapshots] = useState<
    Record<string, FileSnapshot>
  >(() => {
    const cached = readStoredWorkspace();
    if (cached?.folders && cached?.fileContents) {
      return fileSnapshotsFromFolders(cached.folders, cached.fileContents);
    }
    return fileSnapshotsFromFolders(
      initialFolders,
      fileContentsFromFolders(initialFolders),
    );
  });

  const [versionHistory, setVersionHistory] = useState<
    StoredCodeLabWorkspace["versions"]
  >(() => {
    const cached = readStoredWorkspace();
    return cached?.versions ?? [];
  });
  const [consoleHeight, setConsoleHeight] = useState(250);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [consoleMaximized, setConsoleMaximized] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<ConsoleTab>("console");
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [taskPanelCollapsed, setTaskPanelCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [taskPanelWidth, setTaskPanelWidth] = useState(300);

  const leftResizeRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const rightResizeRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const handleLeftResizeStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    leftResizeRef.current = { startX: e.clientX, startWidth: sidebarWidth };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleLeftResizeMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!leftResizeRef.current) return;
    const delta = e.clientX - leftResizeRef.current.startX;
    const nextWidth = Math.max(180, Math.min(420, leftResizeRef.current.startWidth + delta));
    setSidebarWidth(nextWidth);
  };

  const handleLeftResizeEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (leftResizeRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      leftResizeRef.current = null;
    }
  };

  const handleRightResizeStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    rightResizeRef.current = { startX: e.clientX, startWidth: taskPanelWidth };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleRightResizeMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!rightResizeRef.current) return;
    const delta = rightResizeRef.current.startX - e.clientX;
    const nextWidth = Math.max(220, Math.min(480, rightResizeRef.current.startWidth + delta));
    setTaskPanelWidth(nextWidth);
  };

  const handleRightResizeEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (rightResizeRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      rightResizeRef.current = null;
    }
  };

  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState("");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [workspaceExpanded, setWorkspaceExpanded] = useState(true);
  const [activeIdePanel, setActiveIdePanel] = useState<IdePanelId>("explorer");
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle");
  const [lastAutosavedAt, setLastAutosavedAt] = useState<string | null>(null);
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
  const [aiResult, setAiResult] = useState<AiResultData | null>(null);

  function handleApplyAiCode(code: string) {
    if (!activeFile) return;
    setFileContents((current) => ({
      ...current,
      [activeFile.id]: code,
    }));
    setSavedFileSnapshots((current) => ({
      ...current,
      [activeFile.id]: {
        name: activeFile.name,
        language: activeFile.language,
        content: code,
      },
    }));
  }
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
        } else if (!cancelled) {
          setDbStatus("draft");
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
      activeFileName: activeFile?.name ?? "main.js",
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
        activeFileName: activeFile?.name ?? "main.js",
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
    setConsoleCollapsed(false);
    if (!result.success && (result.stderr || result.errorMessage)) {
      setActiveConsoleTab("errors");
    } else {
      setActiveConsoleTab("console");
    }
  }

  async function handleRun() {
    if (!activeFile) return;
    const code = fileContents[activeFile.id] ?? activeFile.content;
    const currentLanguage = runnerLanguageFor(activeFile, language);
    setIsRunning(true);
    setConsoleCollapsed(false);
    setHtmlPreview(undefined);

    try {
      const workspace = await persistWorkspaceToDatabase();
      const serverFile = workspace
        ? fileForWorkspace(workspace, activeFile)
        : null;

      const result: CodeRunResult = await codeRunner.runCode({
        language: currentLanguage,
        code,
        stdin,
        files: buildRunnerFiles(),
        testCases: tests.map(({ id, input, expected }: TestCase) => ({
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

      applyRunResult(result);
    } catch (error) {
      setConsoleOutput("");
      setErrorOutput(
        error instanceof Error ? error.message : "Code execution failed.",
      );
      setRunStatus("error");
      setExecutionMs(0);
      setHtmlPreview(undefined);
      setConsoleCollapsed(false);
      setActiveConsoleTab("errors");
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
      setDbStatus("ready");
      setAutosaveStatus("saved");
      setLastAutosavedAt(workspace.updatedAt);
    } else {
      saveEmergencyDraft(nextVersions);
      window.localStorage.setItem(
        `nexora-code-lab:file:${activeFile.id}`,
        JSON.stringify(version),
      );
    }
  }

  async function handleRunTests() {
    if (!activeFile) return;
    const code = fileContents[activeFile.id] ?? activeFile.content;
    const currentLanguage = runnerLanguageFor(activeFile, language);
    setIsRunning(true);
    setConsoleCollapsed(false);
    setHtmlPreview(undefined);

    try {
      const workspace = await persistWorkspaceToDatabase();
      const serverFile = workspace
        ? fileForWorkspace(workspace, activeFile)
        : null;

      const result: CodeRunResult = await codeRunner.runTests({
        language: currentLanguage,
        code,
        stdin,
        files: buildRunnerFiles(),
        testCases: tests.map(({ id, input, expected }: TestCase) => ({
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

      const resultMap = new Map(
        (result.testResults ?? []).map((item) => [item.id, item]),
      );
      const nextTests: TestCase[] = tests.map((test: TestCase) => {
        const resultItem = resultMap.get(test.id);
        const passed =
          resultItem?.passed ??
          outputMatchesExpected(result.stdout, test.expected);
        const actual = resultItem?.stdout ?? result.stdout.trim();

        return {
          ...test,
          status: passed ? "passed" : "failed",
          actual,
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
      setConsoleCollapsed(false);
      if (passed < nextTests.length) {
        setActiveConsoleTab("problems");
      } else {
        setActiveConsoleTab("console");
      }
    } catch (error) {
      setConsoleOutput("");
      setErrorOutput(
        error instanceof Error ? error.message : "Test suite failed.",
      );
      setRunStatus("error");
      setExecutionMs(0);
      setHtmlPreview(undefined);
      setConsoleCollapsed(false);
      setActiveConsoleTab("errors");
    } finally {
      setIsRunning(false);
    }
  }

  async function handleAiAction(action: AiAction) {
    if (!activeFile) return;
    const code = fileContents[activeFile.id] ?? activeFile.content;
    const labels: Record<AiAction, string> = {
      explain: "Code Explanation",
      debug: "Bug Diagnosis & Fix",
      improve: "Refactor Recommendation",
    };

    setActiveAiAction(action);
    setActiveIdePanel("ai");
    setLeftPanelCollapsed(false);
    setAiResult(null);

    // Sync database asynchronously in background without blocking the AI call
    void persistWorkspaceToDatabase().catch(() => {});

    try {
      const payload = {
        action,
        workspaceId: workspaceId || undefined,
        fileId: activeFile.id,
        language: runnerLanguageFor(activeFile, language),
        code,
        stdin,
      };

      let response: AssistantResponse | null = null;

      // 1. Primary: Live Next.js AI Router (Groq / OpenRouter / Gemini LLM)
      try {
        const nextRes = await fetch("/api/code-lab/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (nextRes.ok) {
          response = (await nextRes.json()) as AssistantResponse;
        }
      } catch {
        // Fall through to Express backend API
      }

      // 2. Secondary Fallback: Express Backend API
      if (!response?.note) {
        response = await apiPost<AssistantResponse>("/code-lab/assistant", payload);
      }

      if (!response?.note) {
        setAiResult({
          action,
          title: `${labels[action]} Failed`,
          note: "AI code assistance is currently unreachable. Please check your network connection or try again.",
          model: "offline",
          mode: "error",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        setActiveIdePanel("ai");
        setLeftPanelCollapsed(false);
        return;
      }

      setAiResult({
        action,
        title: labels[action],
        note: response.note,
        suggestedCode: response.suggestedCode,
        model: response.model,
        mode: response.mode,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      setActiveIdePanel("ai");
      setLeftPanelCollapsed(false);
    } catch (error) {
      setAiResult({
        action,
        title: `${labels[action]} Error`,
        note: error instanceof Error ? error.message : "Code help failed.",
        model: "error",
        mode: "error",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      setActiveIdePanel("ai");
      setLeftPanelCollapsed(false);
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

      if ((key === "p" && event.shiftKey) || key === "k") {
        event.preventDefault();
        setCommandPaletteOpen(true);
        setCommandQuery("");
        return;
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
    const laptopQuery = window.matchMedia(
      "(min-width: 1024px) and (max-width: 1279px)",
    );
    const keepEditorReadable = (event?: MediaQueryListEvent) => {
      const isCompactLaptop = event?.matches ?? laptopQuery.matches;
      if (isCompactLaptop) setTaskPanelCollapsed(true);
    };

    const frameId = window.requestAnimationFrame(() => keepEditorReadable());
    laptopQuery.addEventListener("change", keepEditorReadable);

    return () => {
      window.cancelAnimationFrame(frameId);
      laptopQuery.removeEventListener("change", keepEditorReadable);
    };
  }, []);

  useEffect(() => {
    if (!workspaceExpanded) return;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !quickOpen && !commandPaletteOpen) {
        setWorkspaceExpanded(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [commandPaletteOpen, quickOpen, workspaceExpanded]);

  const workspaceColumnClass = leftPanelCollapsed
    ? taskPanelCollapsed
      ? "lg:grid-cols-[46px_minmax(0,1fr)_46px]"
      : "lg:grid-cols-[46px_minmax(0,1fr)_46px] xl:grid-cols-[46px_minmax(420px,1fr)_clamp(226px,18vw,280px)] 2xl:grid-cols-[46px_minmax(0,1fr)_clamp(248px,19vw,290px)]"
    : taskPanelCollapsed
      ? "lg:grid-cols-[clamp(210px,22vw,240px)_minmax(420px,1fr)_46px] xl:grid-cols-[clamp(220px,17vw,270px)_minmax(420px,1fr)_46px] 2xl:grid-cols-[clamp(248px,18vw,286px)_minmax(0,1fr)_46px]"
      : "lg:grid-cols-[clamp(210px,22vw,240px)_minmax(420px,1fr)_46px] xl:grid-cols-[clamp(220px,17vw,270px)_minmax(420px,1fr)_clamp(226px,18vw,280px)] 2xl:grid-cols-[clamp(248px,18vw,286px)_minmax(0,1fr)_clamp(248px,19vw,290px)]";

  const commands: CodeLabCommand[] = [
    {
      id: "run-code",
      label: "Run current file",
      detail: "Run the active file with the selected environment.",
      shortcut: "Ctrl Enter",
      icon: Play,
      action: () => void handleRun(),
    },
    {
      id: "save-workspace",
      label: "Save workspace",
      detail: "Save the latest file changes and create a version.",
      shortcut: "Ctrl S",
      icon: CheckCircle2,
      action: () => void handleSave(),
    },
    {
      id: "run-tests",
      label: "Run all tests",
      detail: "Check the current solution against the lab test cases.",
      icon: RefreshCw,
      action: handleRunTests,
    },
    {
      id: "open-files",
      label: "Go to file",
      detail: "Search and open a file in this workspace.",
      shortcut: "Ctrl P",
      icon: Search,
      action: () => {
        setQuickOpen(true);
        setQuickQuery("");
      },
    },
    {
      id: "open-code-help",
      label: "Show code help",
      detail: "Open explanations, issue checks, and improvement suggestions.",
      icon: Command,
      action: () => {
        setActiveIdePanel("ai");
        setLeftPanelCollapsed(false);
      },
    },
    {
      id: "toggle-console",
      label: consoleCollapsed ? "Open console" : "Collapse console",
      detail: "Show or hide the terminal and output area.",
      icon: ChevronUp,
      action: () => setConsoleCollapsed((current) => !current),
    },
    {
      id: "toggle-task-panel",
      label: taskPanelCollapsed ? "Open task panel" : "Collapse task panel",
      detail: "Show or hide the lab brief and test cases.",
      icon: ChevronRight,
      action: () => setTaskPanelCollapsed((current) => !current),
    },
    {
      id: "toggle-fullscreen",
      label: workspaceExpanded ? "Exit focus mode" : "Enter focus mode",
      detail: "Use the available screen for the Code Lab workspace.",
      icon: Maximize2,
      action: () => setWorkspaceExpanded((current) => !current),
    },
    {
      id: "submit-lab",
      label: "Submit lab task",
      detail: "Send the current workspace for review.",
      icon: UploadIcon,
      action: () => void handleSubmitLabTask(),
    },
  ];

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
          "nexora-code-lab code-lab-ide-shell grid grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[18px] border border-[#DCE7E2] dark:border-[#1E293B] bg-white dark:bg-[#0E1726] shadow-[0_12px_34px_rgba(15,23,42,0.06)] dark:shadow-none",
          workspaceExpanded
            ? "nexora-code-lab-fullscreen fixed inset-3 z-[100] h-[calc(100dvh-1.5rem)] min-h-0 max-h-[calc(100dvh-1.5rem)] rounded-[24px] border border-[#DDEAE5] dark:border-[#1E293B] bg-[#F8FCFA] dark:bg-[#0B111E] shadow-[0_30px_90px_rgba(15,23,42,0.22)] lg:h-[calc(100dvh-1.5rem)] lg:min-h-0 2xl:min-h-0"
            : "lg:h-[calc(100dvh-132px)] lg:min-h-[620px] 2xl:min-h-[720px]",
        )}
      >
        <CodeLabHeader
          language={language}
          environment={environment}
          onLanguageChange={handleLanguageChange}
          onEnvironmentChange={handleEnvironmentChange}
          onOpenCommandPalette={() => {
            setCommandPaletteOpen(true);
            setCommandQuery("");
          }}
          onRun={handleRun}
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
        {commandPaletteOpen ? (
          <CommandPalette
            commands={commands}
            query={commandQuery}
            onQueryChange={setCommandQuery}
            onClose={() => setCommandPaletteOpen(false)}
          />
        ) : null}

        <section
          className={cn(
            "flex min-h-0 flex-col overflow-hidden bg-white dark:bg-[#0E1726]",
            workspaceExpanded ? "h-full" : "lg:h-full",
          )}
        >
          <div className="flex min-h-0 flex-1 overflow-hidden relative">
            {/* Left Sidebar */}
            <div
              style={{
                width: leftPanelCollapsed ? 0 : sidebarWidth,
                minWidth: leftPanelCollapsed ? 0 : 200,
                maxWidth: leftPanelCollapsed ? 0 : 450,
              }}
              className="shrink-0 h-full overflow-hidden transition-[width] duration-75"
            >
              <CodeLabSidebar
                activePanel={activeIdePanel}
                collapsed={leftPanelCollapsed}
                folders={folders}
                files={allFiles}
                fileContents={fileContents}
                activeFileId={activeFileId}
                dirtyFileIds={dirtyFileIds}
                tests={tests}
                versions={versionHistory}
                activeAiAction={activeAiAction}
                aiResult={aiResult}
                onToggleCollapsed={() =>
                  setLeftPanelCollapsed((current) => !current)
                }
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
                onClearAiResult={() => setAiResult(null)}
                onApplyCode={handleApplyAiCode}
              />
            </div>

            {/* Left Resizer Handle */}
            {!leftPanelCollapsed ? (
              <div
                role="separator"
                aria-label="Resize left sidebar"
                onPointerDown={handleLeftResizeStart}
                onPointerMove={handleLeftResizeMove}
                onPointerUp={handleLeftResizeEnd}
                onPointerCancel={handleLeftResizeEnd}
                className="group relative w-1.5 shrink-0 touch-none cursor-col-resize hover:bg-emerald-500/30 active:bg-emerald-500/50 transition z-20 select-none flex items-center justify-center"
              >
                <div className="h-6 w-0.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-emerald-500 transition" />
              </div>
            ) : null}

            {/* Center Area: Editor & Bottom Console Drawer */}
            <div
              className={cn("flex flex-1 min-w-0 flex-col overflow-hidden h-full")}
              style={{
                display: "grid",
                gridTemplateRows: `minmax(0,1fr) ${
                  consoleCollapsed
                    ? "38px"
                    : consoleMaximized
                      ? "minmax(340px, 48vh)"
                      : `${consoleHeight}px`
                }`,
              }}
            >
              <CodeEditorPanel
                openFiles={openFiles}
                activeFileId={activeFileId}
                dirtyFileIds={dirtyFileIds}
                workspaceExpanded={workspaceExpanded}
                leftPanelCollapsed={leftPanelCollapsed}
                onToggleSidebar={() => setLeftPanelCollapsed((current) => !current)}
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
                onInputChange={setStdin}
                onClear={() => {
                  setConsoleOutput("");
                  setErrorOutput("");
                  setHtmlPreview(undefined);
                  setRunStatus("idle");
                  setExecutionMs(0);
                }}
                collapsed={consoleCollapsed}
                onToggleCollapsed={() =>
                  setConsoleCollapsed((current) => !current)
                }
                maximized={consoleMaximized}
                onToggleMaximized={() =>
                  setConsoleMaximized((current) => !current)
                }
                consoleHeight={consoleHeight}
                onConsoleHeightChange={setConsoleHeight}
                executionMs={executionMs}
                status={runStatus}
                activeTab={activeConsoleTab}
                onTabChange={setActiveConsoleTab}
              />
            </div>

            {/* Right Resizer Handle */}
            {!taskPanelCollapsed ? (
              <div
                role="separator"
                aria-label="Resize right task panel"
                onPointerDown={handleRightResizeStart}
                onPointerMove={handleRightResizeMove}
                onPointerUp={handleRightResizeEnd}
                onPointerCancel={handleRightResizeEnd}
                className="group relative w-1.5 shrink-0 touch-none cursor-col-resize hover:bg-emerald-500/30 active:bg-emerald-500/50 transition z-20 select-none flex items-center justify-center"
              >
                <div className="h-6 w-0.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-emerald-500 transition" />
              </div>
            ) : null}

            {/* Right Instruction & LeetCode Test Suite Panel */}
            <div
              style={{
                width: taskPanelCollapsed ? 46 : taskPanelWidth,
                minWidth: taskPanelCollapsed ? 46 : 220,
                maxWidth: taskPanelCollapsed ? 46 : 500,
              }}
              className="shrink-0 h-full overflow-hidden transition-[width] duration-75"
            >
              <InstructionPanel
                tests={tests}
                onRunTests={handleRunTests}
                onAddCustomTest={(customCase) =>
                  setTests((curr) => [...curr, customCase])
                }
                lastRunResult={lastRunResult}
                onAiAction={handleAiAction}
                activeAiAction={activeAiAction}
                collapsed={taskPanelCollapsed}
                onToggleCollapsed={() =>
                  setTaskPanelCollapsed((current) => !current)
                }
              />
            </div>
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
        </section>
      </div>
    </AppShell>
  );
}
