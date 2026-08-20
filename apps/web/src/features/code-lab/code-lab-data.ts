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
        id: "main.js",
        name: "main.js",
        language: "javascript",
        content: `// Nexora OS - Academic Code Lab
// Student Evaluation & CGPA Calculation Engine

function calculateGPA(marks) {
  if (!marks || marks.length === 0) return 0;
  const total = marks.reduce((sum, mark) => sum + mark, 0);
  const average = total / marks.length;
  // Scaled 4.0 GPA scale (e.g. 100 -> 4.0, 85 -> 3.4)
  return Number(((average / 100) * 4.0).toFixed(2));
}

function evaluateStudent(student) {
  const gpa = calculateGPA(student.marks);
  let status = "Needs Improvement";
  let grade = "C";

  if (gpa >= 3.75) {
    status = "Distinction (Honors)";
    grade = "A+";
  } else if (gpa >= 3.50) {
    status = "Excellent";
    grade = "A";
  } else if (gpa >= 3.00) {
    status = "Passed with Merit";
    grade = "B";
  } else if (gpa >= 2.00) {
    status = "Passed";
    grade = "C";
  } else {
    status = "Failed";
    grade = "F";
  }

  return { ...student, gpa, grade, status };
}

function main() {
  // If test input is provided via stdin (e.g. Test Suite)
  const rawInput = typeof input === "function" ? input() : "";
  if (rawInput && rawInput.trim() !== "") {
    const marks = rawInput
      .split(",")
      .map((n) => parseFloat(n.trim()))
      .filter((n) => !isNaN(n));
    if (marks.length > 0) {
      console.log(calculateGPA(marks));
      return;
    }
  }

  console.log("==================================================");
  console.log("🎓 NEXORA OS — ACADEMIC EVALUATION & LAB ENGINE 🎓");
  console.log("==================================================\\n");

  const students = [
    { id: "NX-101", name: "Sadia Khan", dept: "Computer Science", marks: [95, 92, 88, 94, 98] },
    { id: "NX-102", name: "Rafiq Ahmed", dept: "Software Engineering", marks: [85, 78, 90, 82, 86] },
    { id: "NX-103", name: "Tanvir Hasan", dept: "Data Science", marks: [74, 80, 78, 85, 72] }
  ];

  console.log("📊 [1/2] Processing Batch Student Evaluations...\\n");

  const evaluated = students.map(evaluateStudent);

  evaluated.forEach((s) => {
    console.log(\`👤 [\${s.id}] \${s.name} (\${s.dept})\`);
    console.log(\`   ├─ CGPA: \${s.gpa.toFixed(2)} / 4.00 (Grade: \${s.grade})\`);
    console.log(\`   └─ Status: \${s.status}\\n\`);
  });

  const avgCGPA = (
    evaluated.reduce((sum, s) => sum + s.gpa, 0) / evaluated.length
  ).toFixed(2);

  console.log("--------------------------------------------------");
  console.log(\`✨ Total Evaluated: \${evaluated.length} Students\`);
  console.log(\`📈 Batch Average CGPA: \${avgCGPA} / 4.00\`);
  console.log("✅ Academic Integrity & Evaluation Audit Complete!");
  console.log("==================================================");
}

main();
`,
      },
      {
        id: "utils.js",
        name: "utils.js",
        language: "javascript",
        content: `// Helper utilities for the Academic Evaluation Lab.

function isValidScore(score) {
  return typeof score === "number" && score >= 0 && score <= 100;
}

function getLetterGrade(gpa) {
  if (gpa >= 3.75) return "A+";
  if (gpa >= 3.50) return "A";
  if (gpa >= 3.00) return "B";
  if (gpa >= 2.00) return "C";
  return "F";
}
`,
      },
      {
        id: "data.json",
        name: "data.json",
        language: "json",
        content: `{
  "academic_year": "2025-2026",
  "course": "BITHM / OTHM Level 5 - Software Engineering",
  "students": [
    {
      "id": "NX-101",
      "name": "Sadia Khan",
      "marks": [95, 92, 88, 94, 98]
    },
    {
      "id": "NX-102",
      "name": "Rafiq Ahmed",
      "marks": [85, 78, 90, 82, 86]
    },
    {
      "id": "NX-103",
      "name": "Tanvir Hasan",
      "marks": [74, 80, 78, 85, 72]
    }
  ]
}
`,
      },
    ],
  },
  {
    id: "config",
    name: "config",
    files: [
      {
        id: "package.json",
        name: "package.json",
        language: "json",
        content: `{
  "name": "nexora-academic-evaluation-lab",
  "version": "1.0.0",
  "description": "Student grading and CGPA analytics module for Nexora OS",
  "main": "main.js",
  "scripts": {
    "start": "node main.js",
    "test": "node main.js"
  }
}
`,
      },
      {
        id: "README.md",
        name: "README.md",
        language: "markdown",
        content: `# Nexora OS - Academic Evaluation Lab

Calculate student grade points, weighted CGPA averages, and academic performance classifications.

## Execution

\`\`\`bash
node main.js
\`\`\`

## Features
- Real-time CGPA Calculation (4.00 scale)
- Distinction & Honors status classification
- Multi-student batch evaluation audit
`,
      },
    ],
  },
];

export const initialTests: TestCase[] = [
  { id: "t1", input: "100, 100, 100", expected: "4", status: "pending" },
  { id: "t2", input: "85, 90, 95", expected: "3.6", status: "pending" },
  { id: "t3", input: "75, 75, 75", expected: "3", status: "pending" },
];

export const initialConsole =
  "Ready. Write code, provide input, then run or test.";

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

