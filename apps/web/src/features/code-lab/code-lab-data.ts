// Starter workspace + shared types for the Code Lab page.

export type LanguageId =
  | "python"
  | "javascript"
  | "typescript"
  | "html"
  | "cpp";

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
  { id: "html", label: "HTML/CSS/JS" },
  { id: "cpp", label: "C++" },
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
        content: `# Nexora OS - Code Lab
# Write your code here

def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

def main():
    num = int(input("Enter a number: "))
    result = factorial(num)
    print(f"Factorial of {num} is {result}")

if __name__ == "__main__":
    main()
`,
      },
      {
        id: "utils.py",
        name: "utils.py",
        language: "python",
        content: `# Helper utilities for the factorial lab.

def is_non_negative_int(value):
    try:
        return int(value) >= 0
    except (TypeError, ValueError):
        return False
`,
      },
      {
        id: "data.json",
        name: "data.json",
        language: "json",
        content: `{
  "sample_inputs": [0, 1, 5, 7, 10],
  "expected_outputs": [1, 1, 120, 5040, 3628800]
}
`,
      },
    ],
  },
  {
    id: "modules",
    name: "modules",
    files: [
      {
        id: "requirements.txt",
        name: "requirements.txt",
        language: "text",
        content: `# Python dependencies for this workspace
# (No external libraries required for the factorial lab)
`,
      },
      {
        id: "README.md",
        name: "README.md",
        language: "markdown",
        content: `# Factorial Calculator

Write a program that reads an integer \`n\` from input and prints \`n!\`.

## Run

\`\`\`bash
python main.py
\`\`\`
`,
      },
    ],
  },
];

export const initialTests: TestCase[] = [
  { id: "t1", input: "0", expected: "1", status: "pending" },
  { id: "t2", input: "5", expected: "120", status: "pending" },
  { id: "t3", input: "7", expected: "5040", status: "pending" },
];

export const initialConsole =
  "Ready. Write code, provide input, then run or test.";

export const recentWorkspaces: RecentWorkspace[] = [
  {
    id: "w1",
    title: "Sorting Algorithm",
    language: "python",
    lastOpened: "2h ago",
  },
  {
    id: "w2",
    title: "Data Structure Lab",
    language: "python",
    lastOpened: "1 day ago",
  },
  {
    id: "w3",
    title: "Web Scraper",
    language: "python",
    lastOpened: "3 days ago",
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
