// Starter workspace + shared types for the Code Lab page.

export type LanguageId =
  | "python"
  | "javascript"
  | "typescript"
  | "html"
  | "c"
  | "cpp"
  | "java";

export type EnvironmentId =
  | "standard"
  | "lab-task"
  | "assignment-practice"
  | "sandbox";

export type FileNode = {
  id: string;
  name: string;
  language: LanguageId | "json" | "text" | "markdown";
  content: string;
};

export type FolderNode = {
  id: string;
  name: string;
  files: FileNode[];
};

export type TestCase = {
  id: string;
  input: string;
  expected: string;
  status: "passed" | "failed" | "pending";
  actual?: string;
};

export type RecentWorkspace = {
  id: string;
  title: string;
  language: LanguageId;
  lastOpened: string;
};

export const languageOptions: { id: LanguageId; label: string }[] = [
  { id: "python", label: "Python 3.11" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "c", label: "C (GCC)" },
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java 15" },
  { id: "html", label: "HTML/CSS/JS" },
];

export const environmentOptions: { id: EnvironmentId; label: string }[] = [
  { id: "standard", label: "Standard" },
  { id: "lab-task", label: "Lab Task" },
  { id: "assignment-practice", label: "Assignment Practice" },
  { id: "sandbox", label: "Sandbox Mode" },
];

export const initialFolders: FolderNode[] = [
  {
    id: "main",
    name: "main",
    files: [
      {
        id: "main.py",
        name: "main.py",
        language: "python",
        content: `def factorial(n):
    if n < 0:
        raise ValueError('n must be non-negative')
    result = 1
    for value in range(2, n + 1):
        result *= value
    return result

print(factorial(5))
`,
      },
      {
        id: "utils.py",
        name: "utils.py",
        language: "python",
        content: `# Helper utilities for algorithm benchmarking and verification.

def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True
`,
      },
    ],
  },
];

export const initialTests: TestCase[] = [
  { id: "t1", input: "5", expected: "120", status: "pending" },
  { id: "t2", input: "3", expected: "6", status: "pending" },
  { id: "t3", input: "0", expected: "1", status: "pending" },
];

export const initialConsole =
  "Ready. Click 'Run Code' or press Ctrl+Enter to execute.";

export const recentWorkspaces: RecentWorkspace[] = [
  {
    id: "w1",
    title: "Academic Evaluation Engine",
    language: "javascript",
    lastOpened: "10m ago",
  },
  {
    id: "w2",
    title: "Student CGPA Analytics",
    language: "javascript",
    lastOpened: "2h ago",
  },
  {
    id: "w3",
    title: "Algorithm & Sorting Lab",
    language: "javascript",
    lastOpened: "1 day ago",
  },
];

export const codeStats = {
  totalRuns: 24,
  successful: 21,
  errors: 3,
  accuracy: 87,
  // 14-day mini trend used by the sparkline (relative values, 0–100).
  trend: [42, 55, 48, 62, 70, 65, 74, 78, 72, 84, 80, 88, 91, 87],
};

