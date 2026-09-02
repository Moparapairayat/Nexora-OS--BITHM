import {
  AssignmentStatus,
  LabReportStatus,
  LabTaskStatus,
  PrismaClient,
  RiskLevel,
  SubmissionDecision,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// In production, demo accounts (including a well-known admin@nexora.local /
// password123 login) must be explicitly opted into — never created by default,
// since forgetting to disable this flag before a production seed would ship a
// publicly-known admin credential.
function shouldSeedDemoAccounts() {
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXORA_DEMO_LOGIN_ENABLED === "true";
  }

  return process.env.NEXORA_DEMO_LOGIN_ENABLED !== "false";
}

const rolePermissions: Record<UserRole, string[]> = {
  STUDENT: [
    "dashboard:read",
    "assignments:submit",
    "labs:run",
    "ai-tools:use",
    "academic-shield:scan-own",
    "uploads:create-own",
  ],
  TEACHER: [
    "dashboard:read",
    "submissions:review",
    "fix-requests:create",
    "academic-shield:review",
    "labs:monitor",
  ],
  ADMIN: [
    "admin:manage-users",
    "admin:manage-courses",
    "ops:read",
    "ops:run-jobs",
    "security:audit",
    "storage:manage",
    "data:read",
    "data:export",
    "data:migrate",
  ],
  SUPER_ADMIN: [
    "dashboard:read",
    "assignments:submit",
    "labs:run",
    "ai-tools:use",
    "academic-shield:scan-own",
    "uploads:create-own",
    "submissions:review",
    "fix-requests:create",
    "academic-shield:review",
    "labs:monitor",
    "admin:manage-users",
    "admin:manage-courses",
    "ops:read",
    "ops:run-jobs",
    "security:read",
    "security:audit",
    "storage:manage",
    "data:read",
    "data:export",
    "data:migrate",
    "settings:write",
  ],
};

const demoAccounts: Array<{
  role: Extract<UserRole, "STUDENT" | "TEACHER" | "ADMIN">;
  name: string;
  email: string;
  password: string;
}> = [
  {
    role: "STUDENT",
    name: "Student Nexora",
    email: "student@nexora.local",
    password: "password123",
  },
  {
    role: "TEACHER",
    name: "Teacher Nexora",
    email: "teacher@nexora.local",
    password: "password123",
  },
  {
    role: "ADMIN",
    name: "Admin Nexora",
    email: "admin@nexora.local",
    password: "password123",
  },
];

const assignmentSeeds = [
  {
    id: "assignment-task-1",
    title: "Task 1 Report",
    taskNumber: "Task 1",
    scenario:
      "Prepare an OTHM-style academic report that analyzes requirements, design decisions, implementation evidence and testing outcomes for a web/mobile application.",
    wordLimit: 3500,
    deadline: "2026-07-12",
    checklist: [
      "Brief analyzed",
      "Report structure generated",
      "LO/AC checklist reviewed",
      "Word count checked",
      "Citation style selected",
    ],
    status: AssignmentStatus.FIX_REQUESTED,
    fileName: "task-1-report-draft.docx",
    wordCount: 3120,
    originalityScore: 82,
    aiWritingRiskScore: 61,
    evidence: [
      "Home page screenshot",
      "Responsive layout screenshot",
      "Form validation test notes",
    ],
    coveredCriteriaCodes: ["AC 1.1", "AC 1.2", "AC 4.1"],
    fix: {
      reason:
        "Your submission does not fully cover AC 4.3 because the test plan is incomplete.",
      aiDraft:
        "Add test cases for navigation, form validation, responsive design and performance. Include screenshots or evidence showing actual test results.",
      teacherNote:
        "Focus on evidence. Add a clear test table before resubmission.",
    },
    learningOutcomes: [
      {
        id: "lo-task1-lo1",
        code: "LO1",
        title: "Understand web and mobile application requirements",
        criteria: [
          {
            id: "ac-task1-11",
            code: "AC 1.1",
            description: "Explain project requirements and constraints.",
          },
          {
            id: "ac-task1-12",
            code: "AC 1.2",
            description: "Identify target users and functional needs.",
          },
        ],
      },
      {
        id: "lo-task1-lo4",
        code: "LO4",
        title: "Test and evaluate the implemented solution",
        criteria: [
          {
            id: "ac-task1-41",
            code: "AC 4.1",
            description: "Create a test strategy for the solution.",
          },
          {
            id: "ac-task1-43",
            code: "AC 4.3",
            description:
              "Produce a complete test plan with evidence and outcomes.",
          },
        ],
      },
    ],
  },
  {
    id: "assignment-task-2",
    title: "Task 2 Website and Mobile App Build",
    taskNumber: "Task 2",
    scenario:
      "Develop a working web/mobile application prototype and prepare implementation evidence for core UI, data handling, validation and deployment decisions.",
    wordLimit: 2800,
    deadline: "2026-07-19",
    checklist: [
      "Brief analyzed",
      "Prototype screenshots attached",
      "Implementation notes drafted",
      "Testing section started",
    ],
    status: AssignmentStatus.DRAFT,
    fileName: "task-2-build-evidence.docx",
    wordCount: 1460,
    originalityScore: 94,
    aiWritingRiskScore: 28,
    evidence: [
      "Dashboard prototype screenshot",
      "Mobile navigation screenshot",
    ],
    coveredCriteriaCodes: ["AC 2.1", "AC 2.2", "AC 3.1"],
    learningOutcomes: [
      {
        id: "lo-task2-lo2",
        code: "LO2",
        title: "Design web and mobile application solutions",
        criteria: [
          {
            id: "ac-task2-21",
            code: "AC 2.1",
            description: "Create wireframes and explain the design approach.",
          },
          {
            id: "ac-task2-22",
            code: "AC 2.2",
            description:
              "Justify technology choices for the proposed solution.",
          },
        ],
      },
      {
        id: "lo-task2-lo3",
        code: "LO3",
        title: "Develop web and mobile application features",
        criteria: [
          {
            id: "ac-task2-31",
            code: "AC 3.1",
            description: "Implement core screens and navigation.",
          },
          {
            id: "ac-task2-32",
            code: "AC 3.2",
            description: "Connect form validation and data persistence.",
          },
        ],
      },
    ],
  },
  {
    id: "assignment-task-3",
    title: "Task 3 Evaluation and Deployment Report",
    taskNumber: "Task 3",
    scenario:
      "Evaluate the finished prototype, explain deployment readiness, document limitations and recommend improvements for the next iteration.",
    wordLimit: 2200,
    deadline: "2026-07-26",
    checklist: [
      "Evaluation complete",
      "Deployment notes attached",
      "Limitations explained",
      "References checked",
    ],
    status: AssignmentStatus.PASS,
    fileName: "task-3-evaluation-final.pdf",
    wordCount: 2140,
    originalityScore: 97,
    aiWritingRiskScore: 22,
    evidence: [
      "Deployment readiness checklist",
      "User acceptance test summary",
      "Improvement backlog screenshot",
    ],
    coveredCriteriaCodes: ["AC 4.2", "AC 4.4"],
    learningOutcomes: [
      {
        id: "lo-task3-lo4",
        code: "LO4",
        title: "Test and evaluate the implemented solution",
        criteria: [
          {
            id: "ac-task3-42",
            code: "AC 4.2",
            description: "Evaluate the prototype against user requirements.",
          },
          {
            id: "ac-task3-44",
            code: "AC 4.4",
            description: "Recommend improvements based on test outcomes.",
          },
        ],
      },
    ],
  },
];

const liveLabSeeds = [
  {
    sessionId: "lab-session-js-validation",
    taskId: "lab-js-validation",
    workspaceId: "workspace-lab-js-validation-student",
    mainFileId: "file-lab-js-validation-main",
    versionId: "version-lab-js-validation-v1",
    submissionId: "submission-lab-js-validation-student",
    fixId: "fix-lab-js-validation-input",
    feedbackId: "feedback-lab-js-validation-fix",
    title: "JavaScript Form Validation Lab",
    prompt:
      "Build browser-side validation for required fields, email format, password length and invalid numeric input.",
    language: "JavaScript",
    sessionCode: "LAB-JS-24",
    sessionStatus: LabTaskStatus.IN_PROGRESS,
    submissionStatus: LabTaskStatus.FIX_REQUESTED,
    deadline: "2026-07-14",
    durationMinutes: 90,
    code: "function validateForm(form) {\n  if (!form.email || !form.email.includes('@')) return false;\n  return true;\n}\n\nconsole.log(validateForm({ email: 'student@nexora.local', age: 22 }));",
    output:
      "Visible tests passed. Hidden tests failed: empty values and negative age.",
    visibleTests: [
      {
        name: "Valid form returns true",
        input: "email=student@nexora.local age=22",
        expected: "true",
        passed: true,
      },
      {
        name: "Invalid email returns false",
        input: "email=student age=22",
        expected: "false",
        passed: true,
      },
    ],
    hiddenTests: [
      { name: "Empty values are rejected", passed: false },
      { name: "Negative age is rejected", passed: false },
    ],
    fix: {
      reason:
        "Your code works for normal input, but it does not handle empty or invalid input.",
      aiDraft:
        "Add guard clauses for missing fields, malformed email, weak password and negative numeric values before resubmitting.",
      teacherNote:
        "Add guard clauses for missing fields and invalid numeric values.",
    },
  },
  {
    sessionId: "lab-session-python-api",
    taskId: "lab-python-api",
    workspaceId: "workspace-lab-python-api-student",
    mainFileId: "file-lab-python-api-main",
    versionId: "version-lab-python-api-v1",
    submissionId: "submission-lab-python-api-student",
    title: "Python API Response Lab",
    prompt:
      "Create a small API handler that validates a request body and returns structured JSON responses for success and error cases.",
    language: "Python",
    sessionCode: "LAB-API-31",
    sessionStatus: LabTaskStatus.NOT_STARTED,
    submissionStatus: LabTaskStatus.NOT_STARTED,
    deadline: "2026-07-21",
    durationMinutes: 75,
    code: "def handle_request(payload):\n    if not payload.get('name'):\n        return {'ok': False, 'error': 'name required'}\n    return {'ok': True, 'message': 'accepted'}\n\nprint(handle_request({'name': 'Nadia'}))",
    output: "Session is scheduled. Join the lab before submitting code.",
    visibleTests: [
      {
        name: "Valid request returns ok true",
        input: "name=Nadia score=82",
        expected: "{ ok: true }",
        passed: false,
      },
      {
        name: "Missing name returns validation error",
        input: "score=82",
        expected: "{ ok: false }",
        passed: false,
      },
    ],
    hiddenTests: [
      { name: "Negative score is rejected", passed: false },
      { name: "Response contains message field", passed: false },
    ],
  },
];

const labReportSeeds = [
  {
    id: "lab-report-validation",
    labTaskId: "lab-js-validation",
    status: LabReportStatus.CORRECTION_REQUESTED,
    objective:
      "Document how the validation task was implemented, tested and corrected.",
    toolsUsed: "Nexora Code Lab, browser console, HTML, CSS and JavaScript",
    implementation:
      "The form validates email format, required fields and user input before submission.",
    testingEvidence:
      "Visible tests passed. Hidden tests need correction evidence after code fix.",
    problemsFaced:
      "Initial validation did not reject empty fields or negative age values.",
    solution:
      "Add explicit checks for missing values, invalid email and invalid numeric input.",
    conclusion:
      "The validation workflow improves data quality before form submission.",
    screenshotUrls: ["validation-output.png"],
    codeAttachmentUrls: ["validate-form-v1.js"],
    originalityScore: 91,
    aiWritingRiskScore: 38,
    fix: {
      id: "fix-lab-report-validation-evidence",
      feedbackId: "feedback-lab-report-validation-evidence",
      reason:
        "The report needs clearer testing evidence for empty input and negative age cases.",
      aiDraft:
        "Attach screenshots or console logs for failed hidden tests and explain the correction approach.",
      teacherNote:
        "Add output screenshots and update the testing evidence paragraph before resubmission.",
    },
  },
  {
    id: "lab-report-python-api",
    labTaskId: "lab-python-api",
    status: LabReportStatus.DRAFT,
    objective:
      "Explain how the API handler validates request data and returns predictable JSON responses.",
    toolsUsed: "Nexora Code Lab, Python and pytest-style checks",
    implementation:
      "The handler checks required fields and returns structured success or error objects.",
    testingEvidence:
      "Visible request validation checks are ready to run after joining the lab.",
    problemsFaced:
      "The negative-score guard and response message field still need evidence.",
    solution:
      "Add negative score validation and show final JSON response structure.",
    conclusion:
      "The report draft is ready for test evidence after the lab run.",
    screenshotUrls: [],
    codeAttachmentUrls: ["handle-request.py"],
    originalityScore: 0,
    aiWritingRiskScore: 0,
  },
];

const codeLabSeed = {
  workspaceId: "workspace-code-lab-factorial-student",
  mainFileId: "file-code-lab-factorial-main",
  utilsFileId: "file-code-lab-factorial-utils",
  runId: "run-code-lab-factorial-tests",
  versionId: "version-code-lab-factorial-v1",
  snippetId: "snippet-code-lab-factorial",
  snippetVersionId: "snippet-version-code-lab-factorial-v1",
  title: "Factorial Calculator Workspace",
  language: "python",
  code: "def factorial(n):\n    if n < 0:\n        raise ValueError('n must be non-negative')\n    result = 1\n    for value in range(2, n + 1):\n        result *= value\n    return result\n\nprint(factorial(5))",
  utilsCode: "def parse_number(value):\n    return int(str(value).strip())\n",
  stdout: "120\n",
  tests: [
    {
      id: "test-code-lab-factorial-0",
      input: "0",
      expected: "1",
      stdout: "1\n",
      passed: true,
    },
    {
      id: "test-code-lab-factorial-5",
      input: "5",
      expected: "120",
      stdout: "120\n",
      passed: true,
    },
    {
      id: "test-code-lab-factorial-7",
      input: "7",
      expected: "5040",
      stdout: "5040\n",
      passed: true,
    },
  ],
};

const academicShieldSeed = {
  plagiarismReportId: "academic-shield-plagiarism-task-1",
  writingRiskReportId: "academic-shield-writing-risk-task-1",
  citationId: "academic-shield-citation-testing-guidance",
  webScanId: "academic-shield-web-scan-testing-guidance",
  rewriteId: "academic-shield-rewrite-task-1",
  exportId: "academic-shield-export-task-1",
  title: "Task 1 Report Integrity Review",
  textPreview:
    "This report evaluates the requirements, design, testing evidence and implementation decisions for a web and mobile application project.",
  sourceRanking: [
    {
      id: "seed-source-internal-task-1",
      title: "OTHM Web and Mobile Applications Task 1 Archive",
      kind: "internal-submission",
      url: "internal-demo://othm-task-1",
      author: "Internal submission archive",
      similarity: 0.22,
      fuzzyScore: 0.34,
      semanticScore: 0.46,
      internalOverlap: 0.27,
      rank: 1,
      citationStatus: "missing",
      matchedPhrases: [
        "requirements and constraints for a web/mobile application",
        "testing evidence and responsive design outcomes",
      ],
      recommendation:
        "Review paragraph 3 and add original analysis with clear evidence references.",
    },
    {
      id: "seed-source-lab-report",
      title: "JavaScript Form Validation Lab Report",
      kind: "lab-report",
      url: "internal-demo://lab-report-validation",
      author: "Student Nexora",
      similarity: 0.17,
      fuzzyScore: 0.24,
      semanticScore: 0.39,
      internalOverlap: 0.22,
      rank: 2,
      citationStatus: "partial",
      matchedPhrases: [
        "visible tests passed",
        "hidden tests failed for empty values",
      ],
      recommendation:
        "Keep reused lab evidence, but cite the lab artifact and clarify what changed.",
    },
  ],
  highlightedMatches: [
    {
      id: "seed-match-p3",
      paragraph: 3,
      excerpt:
        "The application requirements and constraints are analyzed for web/mobile usage and responsive behavior.",
      matchedSourceId: "seed-source-internal-task-1",
      severity: "MEDIUM",
      reason: "High semantic similarity to an internal archived submission.",
    },
    {
      id: "seed-match-p7",
      paragraph: 7,
      excerpt:
        "Visible tests passed while hidden tests failed for empty input and negative age values.",
      matchedSourceId: "seed-source-lab-report",
      severity: "LOW",
      reason:
        "Expected reuse of lab evidence, but citation context is incomplete.",
    },
  ],
  writingRisk: {
    id: "academic-shield-writing-risk-task-1",
    score: 61,
    riskLevel: "MEDIUM",
    confidence: "advisory",
    features: [
      {
        label: "Sentence variation",
        value: "Moderate",
        impact: "MEDIUM",
      },
      {
        label: "Citation grounding",
        value: "Needs review",
        impact: "MEDIUM",
      },
    ],
    disclaimer:
      "This AI writing risk score is advisory and should not be used as final proof of academic misconduct.",
  },
};

const phase7Seed = {
  diagramId: "diagram-nexora-academic-workflow",
  diagramExportId: "diagram-export-nexora-academic-workflow-svg",
  datasetId: "dataset-student-performance",
  experimentId: "ml-experiment-student-performance-random-forest",
  reportId: "ml-report-student-performance-random-forest",
  diagramTitle: "Nexora Academic Workflow ERD",
  diagramSource: `// Nexora OS academic workflow schema
Table users {
  id uuid [pk]
  name varchar(100)
  email varchar(150) [unique]
  role varchar(40)
  created_at timestamp
}

Table assignment_briefs {
  id uuid [pk]
  title varchar(180)
  unit_code varchar(40)
  due_date timestamp
}

Table assignment_submissions {
  id uuid [pk]
  assignment_id uuid [ref: > assignment_briefs.id]
  student_id uuid [ref: > users.id]
  status varchar(40)
  originality_score integer
  submitted_at timestamp
}

Table lab_sessions {
  id uuid [pk]
  title varchar(180)
  teacher_id uuid [ref: > users.id]
  session_code varchar(32)
}

Table lab_submissions {
  id uuid [pk]
  lab_session_id uuid [ref: > lab_sessions.id]
  student_id uuid [ref: > users.id]
  status varchar(40)
  score integer
}`,
  diagramNodes: [
    {
      name: "users",
      fields: [
        { name: "id", type: "uuid", isPrimaryKey: true },
        { name: "name", type: "varchar(100)" },
        { name: "email", type: "varchar(150)" },
        { name: "role", type: "varchar(40)" },
        { name: "created_at", type: "timestamp" },
      ],
    },
    {
      name: "assignment_briefs",
      fields: [
        { name: "id", type: "uuid", isPrimaryKey: true },
        { name: "title", type: "varchar(180)" },
        { name: "unit_code", type: "varchar(40)" },
        { name: "due_date", type: "timestamp" },
      ],
    },
    {
      name: "assignment_submissions",
      fields: [
        { name: "id", type: "uuid", isPrimaryKey: true },
        {
          name: "assignment_id",
          type: "uuid",
          isForeignKey: true,
          references: "assignment_briefs.id",
        },
        {
          name: "student_id",
          type: "uuid",
          isForeignKey: true,
          references: "users.id",
        },
        { name: "status", type: "varchar(40)" },
        { name: "originality_score", type: "integer" },
        { name: "submitted_at", type: "timestamp" },
      ],
    },
    {
      name: "lab_sessions",
      fields: [
        { name: "id", type: "uuid", isPrimaryKey: true },
        { name: "title", type: "varchar(180)" },
        {
          name: "teacher_id",
          type: "uuid",
          isForeignKey: true,
          references: "users.id",
        },
        { name: "session_code", type: "varchar(32)" },
      ],
    },
    {
      name: "lab_submissions",
      fields: [
        { name: "id", type: "uuid", isPrimaryKey: true },
        {
          name: "lab_session_id",
          type: "uuid",
          isForeignKey: true,
          references: "lab_sessions.id",
        },
        {
          name: "student_id",
          type: "uuid",
          isForeignKey: true,
          references: "users.id",
        },
        { name: "status", type: "varchar(40)" },
        { name: "score", type: "integer" },
      ],
    },
  ],
  diagramRelationships: [
    "assignment_submissions.assignment_id -> assignment_briefs.id",
    "assignment_submissions.student_id -> users.id",
    "lab_sessions.teacher_id -> users.id",
    "lab_submissions.lab_session_id -> lab_sessions.id",
    "lab_submissions.student_id -> users.id",
  ],
  csv: `student_id,attendance,lab_score,assignment_score,shield_risk,result
S001,92,84,78,18,Pass
S002,76,69,72,24,Pass
S003,,51,61,62,Refer
S004,88,91,86,14,Pass
S005,63,,58,71,Refer
S006,95,89,92,11,Pass`,
  columns: [
    "student_id",
    "attendance",
    "lab_score",
    "assignment_score",
    "shield_risk",
    "result",
  ],
  previewRows: [
    {
      student_id: "S001",
      attendance: 92,
      lab_score: 84,
      assignment_score: 78,
      shield_risk: 18,
      result: "Pass",
    },
    {
      student_id: "S002",
      attendance: 76,
      lab_score: 69,
      assignment_score: 72,
      shield_risk: 24,
      result: "Pass",
    },
    {
      student_id: "S003",
      attendance: null,
      lab_score: 51,
      assignment_score: 61,
      shield_risk: 62,
      result: "Refer",
    },
    {
      student_id: "S004",
      attendance: 88,
      lab_score: 91,
      assignment_score: 86,
      shield_risk: 14,
      result: "Pass",
    },
    {
      student_id: "S005",
      attendance: 63,
      lab_score: null,
      assignment_score: 58,
      shield_risk: 71,
      result: "Refer",
    },
    {
      student_id: "S006",
      attendance: 95,
      lab_score: 89,
      assignment_score: 92,
      shield_risk: 11,
      result: "Pass",
    },
  ],
  missingRows: [
    {
      column: "student_id",
      missingCount: 0,
      missingPercent: 0,
      type: "category",
    },
    {
      column: "attendance",
      missingCount: 1,
      missingPercent: 17,
      type: "number",
    },
    {
      column: "lab_score",
      missingCount: 1,
      missingPercent: 17,
      type: "number",
    },
    {
      column: "assignment_score",
      missingCount: 0,
      missingPercent: 0,
      type: "number",
    },
    {
      column: "shield_risk",
      missingCount: 0,
      missingPercent: 0,
      type: "number",
    },
    {
      column: "result",
      missingCount: 0,
      missingPercent: 0,
      type: "category",
    },
  ],
  metrics: {
    accuracy: 0.89,
    precision: 0.86,
    recall: 0.84,
    f1: 0.85,
  },
  confusionMatrix: [
    [42, 4],
    [5, 18],
  ],
  featureImportance: [
    { feature: "attendance", importance: 0.34 },
    { feature: "lab_score", importance: 0.29 },
    { feature: "assignment_score", importance: 0.24 },
    { feature: "shield_risk", importance: 0.13 },
  ],
};

async function seedRoles() {
  for (const [role, permissions] of Object.entries(rolePermissions) as Array<
    [UserRole, string[]]
  >) {
    await prisma.role.upsert({
      where: { name: role },
      update: { permissions },
      create: {
        name: role,
        description: `${role.replace("_", " ")} access policy`,
        permissions,
      },
    });
  }
}

async function seedDemoAccounts() {
  if (!shouldSeedDemoAccounts()) {
    console.log(
      "Demo login users skipped because NEXORA_DEMO_LOGIN_ENABLED=false.",
    );
    return;
  }

  for (const account of demoAccounts) {
    const passwordHash = await bcrypt.hash(account.password, 12);

    await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        passwordHash,
        role: account.role,
      },
      create: {
        name: account.name,
        email: account.email,
        passwordHash,
        role: account.role,
      },
    });
  }

  console.log(
    `Demo login users ready: ${demoAccounts.map((account) => account.email).join(", ")}`,
  );
}

async function seedAcademicAssignments() {
  if (!shouldSeedDemoAccounts()) {
    console.log("Academic assignment seed skipped with demo login disabled.");
    return;
  }

  const teacher = await prisma.user.findFirst({
    where: { role: { in: ["TEACHER", "ADMIN", "SUPER_ADMIN"] } },
    orderBy: { createdAt: "asc" },
  });
  const student = await prisma.user.findFirst({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "asc" },
  });

  if (!teacher || !student) {
    console.log(
      "Academic assignment seed skipped because student/teacher users are missing.",
    );
    return;
  }

  const department = await prisma.department.upsert({
    where: { name: "Information Technology" },
    update: { code: "IT" },
    create: { name: "Information Technology", code: "IT" },
  });
  const course = await prisma.course.upsert({
    where: { code: "WEB-MOBILE" },
    update: {
      title: "Web and Mobile Applications",
      departmentId: department.id,
    },
    create: {
      title: "Web and Mobile Applications",
      code: "WEB-MOBILE",
      departmentId: department.id,
    },
  });
  const unit = await prisma.othmUnit.upsert({
    where: { code: "H/650/3385" },
    update: {
      title: "Web and Mobile Applications",
      courseId: course.id,
    },
    create: {
      code: "H/650/3385",
      title: "Web and Mobile Applications",
      courseId: course.id,
    },
  });

  for (const seed of assignmentSeeds) {
    await prisma.assignmentBrief.upsert({
      where: { id: seed.id },
      update: {
        title: seed.title,
        scenario: seed.scenario,
        taskNumber: seed.taskNumber,
        wordLimit: seed.wordLimit,
        referencingStyle: "Harvard",
        deadline: new Date(seed.deadline),
        checklist: seed.checklist,
        unitId: unit.id,
        createdById: teacher.id,
      },
      create: {
        id: seed.id,
        title: seed.title,
        scenario: seed.scenario,
        taskNumber: seed.taskNumber,
        wordLimit: seed.wordLimit,
        referencingStyle: "Harvard",
        deadline: new Date(seed.deadline),
        checklist: seed.checklist,
        unitId: unit.id,
        createdById: teacher.id,
      },
    });

    for (const outcome of seed.learningOutcomes) {
      await prisma.learningOutcome.upsert({
        where: { id: outcome.id },
        update: {
          code: outcome.code,
          title: outcome.title,
          assignmentId: seed.id,
        },
        create: {
          id: outcome.id,
          code: outcome.code,
          title: outcome.title,
          assignmentId: seed.id,
        },
      });

      for (const criteria of outcome.criteria) {
        await prisma.assessmentCriteria.upsert({
          where: { id: criteria.id },
          update: {
            code: criteria.code,
            description: criteria.description,
            learningOutcomeId: outcome.id,
          },
          create: {
            id: criteria.id,
            code: criteria.code,
            description: criteria.description,
            learningOutcomeId: outcome.id,
          },
        });
      }
    }

    const submissionId = `${seed.id}-student-submission`;
    await prisma.assignmentSubmission.upsert({
      where: { id: submissionId },
      update: {
        status: seed.status,
        fileName: seed.fileName,
        fileUrl: seed.fileName,
        wordCount: seed.wordCount,
        originalityScore: seed.originalityScore,
        aiWritingRiskScore: seed.aiWritingRiskScore,
        checklist: seed.checklist,
        evidence: seed.evidence,
        coveredCriteriaCodes: seed.coveredCriteriaCodes,
        submittedAt: seed.status === AssignmentStatus.DRAFT ? null : new Date(),
      },
      create: {
        id: submissionId,
        status: seed.status,
        fileName: seed.fileName,
        fileUrl: seed.fileName,
        wordCount: seed.wordCount,
        originalityScore: seed.originalityScore,
        aiWritingRiskScore: seed.aiWritingRiskScore,
        checklist: seed.checklist,
        evidence: seed.evidence,
        coveredCriteriaCodes: seed.coveredCriteriaCodes,
        submittedAt: seed.status === AssignmentStatus.DRAFT ? null : new Date(),
        studentId: student.id,
        assignmentBriefId: seed.id,
      },
    });

    if (seed.fix) {
      await prisma.fixRequest.upsert({
        where: { id: `${seed.id}-fix-request` },
        update: {
          reason: seed.fix.reason,
          aiDraft: seed.fix.aiDraft,
          teacherNote: seed.fix.teacherNote,
          status: "OPEN",
          teacherId: teacher.id,
          studentId: student.id,
          assignmentSubmissionId: submissionId,
        },
        create: {
          id: `${seed.id}-fix-request`,
          reason: seed.fix.reason,
          aiDraft: seed.fix.aiDraft,
          teacherNote: seed.fix.teacherNote,
          status: "OPEN",
          teacherId: teacher.id,
          studentId: student.id,
          assignmentSubmissionId: submissionId,
        },
      });
    }

    if (seed.status === AssignmentStatus.PASS) {
      await prisma.teacherFeedback.upsert({
        where: { id: `${seed.id}-pass-feedback` },
        update: {
          content: "Submission accepted with sufficient evidence.",
          decision: SubmissionDecision.PASS,
          teacherId: teacher.id,
          studentId: student.id,
          assignmentSubmissionId: submissionId,
        },
        create: {
          id: `${seed.id}-pass-feedback`,
          content: "Submission accepted with sufficient evidence.",
          decision: SubmissionDecision.PASS,
          teacherId: teacher.id,
          studentId: student.id,
          assignmentSubmissionId: submissionId,
        },
      });
    }
  }

  console.log(
    `Academic assignment seed ready: ${assignmentSeeds.length} briefs.`,
  );
}

function labSessionDescription(seed: (typeof liveLabSeeds)[number]) {
  return JSON.stringify({
    description: `${seed.title} live coding session`,
    sessionCode: seed.sessionCode,
    durationMinutes: seed.durationMinutes,
    language: seed.language,
    deadline: seed.deadline,
  });
}

async function seedLiveLabs() {
  if (!shouldSeedDemoAccounts()) {
    console.log("LiveLab seed skipped with demo login disabled.");
    return;
  }

  const teacher = await prisma.user.findFirst({
    where: { role: { in: ["TEACHER", "ADMIN", "SUPER_ADMIN"] } },
    orderBy: { createdAt: "asc" },
  });
  const student = await prisma.user.findFirst({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "asc" },
  });

  if (!teacher || !student) {
    console.log(
      "LiveLab seed skipped because student/teacher users are missing.",
    );
    return;
  }

  for (const seed of liveLabSeeds) {
    await prisma.labSession.upsert({
      where: { id: seed.sessionId },
      update: {
        title: seed.title,
        description: labSessionDescription(seed),
        startsAt: new Date(seed.deadline),
        status: seed.sessionStatus,
        teacherId: teacher.id,
      },
      create: {
        id: seed.sessionId,
        title: seed.title,
        description: labSessionDescription(seed),
        startsAt: new Date(seed.deadline),
        status: seed.sessionStatus,
        teacherId: teacher.id,
      },
    });

    await prisma.labTask.upsert({
      where: { id: seed.taskId },
      update: {
        title: seed.title,
        prompt: seed.prompt,
        starterCode: seed.code,
        visibleTestCases: seed.visibleTests,
        hiddenTestCases: seed.hiddenTests,
        labSessionId: seed.sessionId,
      },
      create: {
        id: seed.taskId,
        title: seed.title,
        prompt: seed.prompt,
        starterCode: seed.code,
        visibleTestCases: seed.visibleTests,
        hiddenTestCases: seed.hiddenTests,
        labSessionId: seed.sessionId,
      },
    });

    await prisma.codeWorkspace.upsert({
      where: { id: seed.workspaceId },
      update: {
        title: `${seed.title} Workspace`,
        status:
          seed.submissionStatus === LabTaskStatus.NOT_STARTED
            ? "DRAFT"
            : seed.submissionStatus,
        ownerId: student.id,
        labTaskId: seed.taskId,
      },
      create: {
        id: seed.workspaceId,
        title: `${seed.title} Workspace`,
        status:
          seed.submissionStatus === LabTaskStatus.NOT_STARTED
            ? "DRAFT"
            : seed.submissionStatus,
        ownerId: student.id,
        labTaskId: seed.taskId,
      },
    });

    await prisma.codeFile.upsert({
      where: { id: seed.mainFileId },
      update: {
        name: seed.language === "Python" ? "main.py" : "main.js",
        folder: "main",
        language: seed.language,
        content: seed.code,
        sortOrder: 0,
        workspaceId: seed.workspaceId,
      },
      create: {
        id: seed.mainFileId,
        name: seed.language === "Python" ? "main.py" : "main.js",
        folder: "main",
        language: seed.language,
        content: seed.code,
        sortOrder: 0,
        workspaceId: seed.workspaceId,
      },
    });

    await prisma.codeWorkspace.update({
      where: { id: seed.workspaceId },
      data: { activeFileId: seed.mainFileId },
    });

    await prisma.codeVersion.upsert({
      where: { id: seed.versionId },
      update: {
        workspaceId: seed.workspaceId,
        fileId: seed.mainFileId,
        createdById: student.id,
        version: 1,
        title: "Initial LiveLab submission",
        language: seed.language,
        code: seed.code,
        runResult: {
          stdout: seed.output,
          stderr: "",
          success: !seed.fix,
          executionTimeMs: 48,
        },
        testResults: seed.visibleTests,
        summary:
          seed.submissionStatus === LabTaskStatus.NOT_STARTED
            ? "Starter workspace prepared for the scheduled lab."
            : "Student submitted code for teacher review.",
      },
      create: {
        id: seed.versionId,
        workspaceId: seed.workspaceId,
        fileId: seed.mainFileId,
        createdById: student.id,
        version: 1,
        title: "Initial LiveLab submission",
        language: seed.language,
        code: seed.code,
        runResult: {
          stdout: seed.output,
          stderr: "",
          success: !seed.fix,
          executionTimeMs: 48,
        },
        testResults: seed.visibleTests,
        summary:
          seed.submissionStatus === LabTaskStatus.NOT_STARTED
            ? "Starter workspace prepared for the scheduled lab."
            : "Student submitted code for teacher review.",
      },
    });

    if (seed.submissionStatus !== LabTaskStatus.NOT_STARTED) {
      await prisma.labSubmission.upsert({
        where: { id: seed.submissionId },
        update: {
          status: seed.submissionStatus,
          language: seed.language,
          code: seed.code,
          output: seed.output,
          error: seed.fix ? "Hidden validation cases failed." : null,
          version: 1,
          studentId: student.id,
          labTaskId: seed.taskId,
          workspaceId: seed.workspaceId,
          codeVersionId: seed.versionId,
          reviewStatus: seed.fix ? "FIX_REQUESTED" : "PENDING",
          reviewerId: seed.fix ? teacher.id : null,
          teacherNote: seed.fix?.teacherNote,
          fixReason: seed.fix?.reason,
          reviewedAt: seed.fix ? new Date() : null,
        },
        create: {
          id: seed.submissionId,
          status: seed.submissionStatus,
          language: seed.language,
          code: seed.code,
          output: seed.output,
          error: seed.fix ? "Hidden validation cases failed." : null,
          version: 1,
          studentId: student.id,
          labTaskId: seed.taskId,
          workspaceId: seed.workspaceId,
          codeVersionId: seed.versionId,
          reviewStatus: seed.fix ? "FIX_REQUESTED" : "PENDING",
          reviewerId: seed.fix ? teacher.id : null,
          teacherNote: seed.fix?.teacherNote,
          fixReason: seed.fix?.reason,
          reviewedAt: seed.fix ? new Date() : null,
        },
      });
    }

    if (seed.fix && seed.fixId && seed.feedbackId) {
      await prisma.fixRequest.upsert({
        where: { id: seed.fixId },
        update: {
          reason: seed.fix.reason,
          aiDraft: seed.fix.aiDraft,
          teacherNote: seed.fix.teacherNote,
          status: "OPEN",
          teacherId: teacher.id,
          studentId: student.id,
          labSubmissionId: seed.submissionId,
        },
        create: {
          id: seed.fixId,
          reason: seed.fix.reason,
          aiDraft: seed.fix.aiDraft,
          teacherNote: seed.fix.teacherNote,
          status: "OPEN",
          teacherId: teacher.id,
          studentId: student.id,
          labSubmissionId: seed.submissionId,
        },
      });

      await prisma.teacherFeedback.upsert({
        where: { id: seed.feedbackId },
        update: {
          content: seed.fix.teacherNote,
          decision: SubmissionDecision.FIX_REQUESTED,
          teacherId: teacher.id,
          studentId: student.id,
          labSubmissionId: seed.submissionId,
        },
        create: {
          id: seed.feedbackId,
          content: seed.fix.teacherNote,
          decision: SubmissionDecision.FIX_REQUESTED,
          teacherId: teacher.id,
          studentId: student.id,
          labSubmissionId: seed.submissionId,
        },
      });
    }
  }

  console.log(`LiveLab seed ready: ${liveLabSeeds.length} tasks.`);
}

async function seedLabReports() {
  if (!shouldSeedDemoAccounts()) {
    console.log("Lab report seed skipped with demo login disabled.");
    return;
  }

  const teacher = await prisma.user.findFirst({
    where: { role: { in: ["TEACHER", "ADMIN", "SUPER_ADMIN"] } },
    orderBy: { createdAt: "asc" },
  });
  const student = await prisma.user.findFirst({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "asc" },
  });

  if (!teacher || !student) {
    console.log(
      "Lab report seed skipped because student/teacher users are missing.",
    );
    return;
  }

  for (const seed of labReportSeeds) {
    await prisma.labReport.upsert({
      where: { id: seed.id },
      update: {
        status: seed.status,
        objective: seed.objective,
        toolsUsed: seed.toolsUsed,
        implementation: seed.implementation,
        testingEvidence: seed.testingEvidence,
        problemsFaced: seed.problemsFaced,
        solution: seed.solution,
        conclusion: seed.conclusion,
        screenshotUrls: seed.screenshotUrls,
        codeAttachmentUrls: seed.codeAttachmentUrls,
        originalityScore: seed.originalityScore,
        aiWritingRiskScore: seed.aiWritingRiskScore,
        studentId: student.id,
        labTaskId: seed.labTaskId,
      },
      create: {
        id: seed.id,
        status: seed.status,
        objective: seed.objective,
        toolsUsed: seed.toolsUsed,
        implementation: seed.implementation,
        testingEvidence: seed.testingEvidence,
        problemsFaced: seed.problemsFaced,
        solution: seed.solution,
        conclusion: seed.conclusion,
        screenshotUrls: seed.screenshotUrls,
        codeAttachmentUrls: seed.codeAttachmentUrls,
        originalityScore: seed.originalityScore,
        aiWritingRiskScore: seed.aiWritingRiskScore,
        studentId: student.id,
        labTaskId: seed.labTaskId,
      },
    });

    if (seed.fix) {
      await prisma.fixRequest.upsert({
        where: { id: seed.fix.id },
        update: {
          reason: seed.fix.reason,
          aiDraft: seed.fix.aiDraft,
          teacherNote: seed.fix.teacherNote,
          status: "OPEN",
          teacherId: teacher.id,
          studentId: student.id,
          labReportId: seed.id,
        },
        create: {
          id: seed.fix.id,
          reason: seed.fix.reason,
          aiDraft: seed.fix.aiDraft,
          teacherNote: seed.fix.teacherNote,
          status: "OPEN",
          teacherId: teacher.id,
          studentId: student.id,
          labReportId: seed.id,
        },
      });

      await prisma.teacherFeedback.upsert({
        where: { id: seed.fix.feedbackId },
        update: {
          content: seed.fix.teacherNote,
          decision: SubmissionDecision.FIX_REQUESTED,
          teacherId: teacher.id,
          studentId: student.id,
          labReportId: seed.id,
        },
        create: {
          id: seed.fix.feedbackId,
          content: seed.fix.teacherNote,
          decision: SubmissionDecision.FIX_REQUESTED,
          teacherId: teacher.id,
          studentId: student.id,
          labReportId: seed.id,
        },
      });
    }
  }

  console.log(`Lab report seed ready: ${labReportSeeds.length} reports.`);
}

async function seedCodeLabWorkspace() {
  if (!shouldSeedDemoAccounts()) {
    console.log("Code Lab seed skipped with demo login disabled.");
    return;
  }

  const student = await prisma.user.findFirst({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "asc" },
  });

  if (!student) {
    console.log("Code Lab seed skipped because student user is missing.");
    return;
  }

  await prisma.codeWorkspace.upsert({
    where: { id: codeLabSeed.workspaceId },
    update: {
      title: codeLabSeed.title,
      status: "DRAFT",
      ownerId: student.id,
      activeFileId: codeLabSeed.mainFileId,
    },
    create: {
      id: codeLabSeed.workspaceId,
      title: codeLabSeed.title,
      status: "DRAFT",
      ownerId: student.id,
      activeFileId: codeLabSeed.mainFileId,
    },
  });

  await prisma.codeFile.upsert({
    where: { id: codeLabSeed.mainFileId },
    update: {
      workspaceId: codeLabSeed.workspaceId,
      name: "main.py",
      folder: "main",
      language: "python",
      content: codeLabSeed.code,
      sortOrder: 0,
    },
    create: {
      id: codeLabSeed.mainFileId,
      workspaceId: codeLabSeed.workspaceId,
      name: "main.py",
      folder: "main",
      language: "python",
      content: codeLabSeed.code,
      sortOrder: 0,
    },
  });

  await prisma.codeFile.upsert({
    where: { id: codeLabSeed.utilsFileId },
    update: {
      workspaceId: codeLabSeed.workspaceId,
      name: "utils.py",
      folder: "main",
      language: "python",
      content: codeLabSeed.utilsCode,
      sortOrder: 1,
    },
    create: {
      id: codeLabSeed.utilsFileId,
      workspaceId: codeLabSeed.workspaceId,
      name: "utils.py",
      folder: "main",
      language: "python",
      content: codeLabSeed.utilsCode,
      sortOrder: 1,
    },
  });

  await prisma.codeRun.upsert({
    where: { id: codeLabSeed.runId },
    update: {
      workspaceId: codeLabSeed.workspaceId,
      fileId: codeLabSeed.mainFileId,
      ownerId: student.id,
      language: codeLabSeed.language,
      code: codeLabSeed.code,
      stdin: null,
      stdout: codeLabSeed.stdout,
      stderr: null,
      success: true,
      adapter: "seeded-browser-runner",
      executionTimeMs: 18,
      errorMessage: null,
      result: {
        stdout: codeLabSeed.stdout,
        success: true,
        testResults: codeLabSeed.tests,
      },
    },
    create: {
      id: codeLabSeed.runId,
      workspaceId: codeLabSeed.workspaceId,
      fileId: codeLabSeed.mainFileId,
      ownerId: student.id,
      language: codeLabSeed.language,
      code: codeLabSeed.code,
      stdin: null,
      stdout: codeLabSeed.stdout,
      stderr: null,
      success: true,
      adapter: "seeded-browser-runner",
      executionTimeMs: 18,
      errorMessage: null,
      result: {
        stdout: codeLabSeed.stdout,
        success: true,
        testResults: codeLabSeed.tests,
      },
    },
  });

  for (const test of codeLabSeed.tests) {
    await prisma.codeTestResult.upsert({
      where: { id: test.id },
      update: {
        codeRunId: codeLabSeed.runId,
        input: test.input,
        expected: test.expected,
        stdout: test.stdout,
        stderr: null,
        passed: test.passed,
        executionTimeMs: 5,
      },
      create: {
        id: test.id,
        codeRunId: codeLabSeed.runId,
        input: test.input,
        expected: test.expected,
        stdout: test.stdout,
        stderr: null,
        passed: test.passed,
        executionTimeMs: 5,
      },
    });
  }

  await prisma.codeVersion.upsert({
    where: { id: codeLabSeed.versionId },
    update: {
      workspaceId: codeLabSeed.workspaceId,
      fileId: codeLabSeed.mainFileId,
      createdById: student.id,
      version: 1,
      title: "Factorial Calculator v1",
      language: codeLabSeed.language,
      code: codeLabSeed.code,
      runResult: {
        stdout: codeLabSeed.stdout,
        success: true,
        executionTimeMs: 18,
      },
      testResults: codeLabSeed.tests,
      summary: "Seeded factorial implementation with passing tests.",
    },
    create: {
      id: codeLabSeed.versionId,
      workspaceId: codeLabSeed.workspaceId,
      fileId: codeLabSeed.mainFileId,
      createdById: student.id,
      version: 1,
      title: "Factorial Calculator v1",
      language: codeLabSeed.language,
      code: codeLabSeed.code,
      runResult: {
        stdout: codeLabSeed.stdout,
        success: true,
        executionTimeMs: 18,
      },
      testResults: codeLabSeed.tests,
      summary: "Seeded factorial implementation with passing tests.",
    },
  });

  await prisma.codeSnippet.upsert({
    where: { id: codeLabSeed.snippetId },
    update: {
      title: "Factorial Calculator",
      language: codeLabSeed.language,
      code: codeLabSeed.code,
      version: 1,
      lastRun: {
        status: "success",
        language: codeLabSeed.language,
        output: codeLabSeed.stdout,
        diagnostics: [],
        historyId: codeLabSeed.runId,
        terminal: ["$ nexora-run python", "Nexora execution result persisted."],
        tests: codeLabSeed.tests.map((test) => ({
          name: `Input ${test.input}`,
          status: "passed",
          detail: `Expected ${test.expected}`,
        })),
        executionTimeMs: 18,
      },
      ownerId: student.id,
    },
    create: {
      id: codeLabSeed.snippetId,
      title: "Factorial Calculator",
      language: codeLabSeed.language,
      code: codeLabSeed.code,
      version: 1,
      lastRun: {
        status: "success",
        language: codeLabSeed.language,
        output: codeLabSeed.stdout,
        diagnostics: [],
        historyId: codeLabSeed.runId,
        terminal: ["$ nexora-run python", "Nexora execution result persisted."],
        tests: codeLabSeed.tests.map((test) => ({
          name: `Input ${test.input}`,
          status: "passed",
          detail: `Expected ${test.expected}`,
        })),
        executionTimeMs: 18,
      },
      ownerId: student.id,
    },
  });

  await prisma.codeSnippetVersion.upsert({
    where: { id: codeLabSeed.snippetVersionId },
    update: {
      title: "Factorial Calculator",
      language: codeLabSeed.language,
      code: codeLabSeed.code,
      result: {
        status: "success",
        language: codeLabSeed.language,
        output: codeLabSeed.stdout,
        diagnostics: [],
        historyId: codeLabSeed.runId,
        terminal: ["$ nexora-run python", "Nexora execution result persisted."],
        tests: codeLabSeed.tests.map((test) => ({
          name: `Input ${test.input}`,
          status: "passed",
          detail: `Expected ${test.expected}`,
        })),
        executionTimeMs: 18,
      },
      version: 1,
      summary: "Seeded factorial implementation with passing tests.",
      snippetId: codeLabSeed.snippetId,
    },
    create: {
      id: codeLabSeed.snippetVersionId,
      title: "Factorial Calculator",
      language: codeLabSeed.language,
      code: codeLabSeed.code,
      result: {
        status: "success",
        language: codeLabSeed.language,
        output: codeLabSeed.stdout,
        diagnostics: [],
        historyId: codeLabSeed.runId,
        terminal: ["$ nexora-run python", "Nexora execution result persisted."],
        tests: codeLabSeed.tests.map((test) => ({
          name: `Input ${test.input}`,
          status: "passed",
          detail: `Expected ${test.expected}`,
        })),
        executionTimeMs: 18,
      },
      version: 1,
      summary: "Seeded factorial implementation with passing tests.",
      snippetId: codeLabSeed.snippetId,
    },
  });

  console.log("Code Lab seed ready: factorial workspace.");
}

async function seedAcademicShield() {
  if (!shouldSeedDemoAccounts()) {
    console.log("AcademicShield seed skipped with demo login disabled.");
    return;
  }

  const student = await prisma.user.findFirst({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "asc" },
  });

  if (!student) {
    console.log("AcademicShield seed skipped because student user is missing.");
    return;
  }

  const assignmentSubmission = await prisma.assignmentSubmission.findUnique({
    where: { id: "assignment-task-1-student-submission" },
    select: { id: true },
  });
  const labReport = await prisma.labReport.findUnique({
    where: { id: "lab-report-validation" },
    select: { id: true },
  });
  const reportPayload = {
    title: academicShieldSeed.title,
    overallSimilarity: 18,
    internalSimilarity: 12,
    fuzzySimilarity: 21,
    semanticSimilarity: 27,
    citationGapCount: 2,
    textPreview: academicShieldSeed.textPreview,
    sourceRanking: academicShieldSeed.sourceRanking,
    writingRisk: academicShieldSeed.writingRisk,
    exportFormats: ["pdf", "docx", "markdown", "json"],
  };
  const exportMarkdown = [
    `# ${academicShieldSeed.title}`,
    "",
    "Originality: 82%",
    "Overall similarity: 18%",
    "AI writing risk: 61% (MEDIUM)",
    "",
    "## Ranked Sources",
    ...academicShieldSeed.sourceRanking.map(
      (source) =>
        `- #${source.rank} ${source.title}: ${(source.similarity * 100).toFixed(0)}% similarity, citation ${source.citationStatus}`,
    ),
  ].join("\n");

  await prisma.plagiarismReport.upsert({
    where: { id: academicShieldSeed.plagiarismReportId },
    update: {
      originalityScore: 82,
      riskLevel: RiskLevel.MEDIUM,
      matchedSources: reportPayload,
      highlightedMatches: academicShieldSeed.highlightedMatches,
      userId: student.id,
      assignmentSubmissionId: assignmentSubmission?.id ?? null,
      labReportId: labReport?.id ?? null,
    },
    create: {
      id: academicShieldSeed.plagiarismReportId,
      originalityScore: 82,
      riskLevel: RiskLevel.MEDIUM,
      matchedSources: reportPayload,
      highlightedMatches: academicShieldSeed.highlightedMatches,
      userId: student.id,
      assignmentSubmissionId: assignmentSubmission?.id ?? null,
      labReportId: labReport?.id ?? null,
    },
  });

  await prisma.writingRiskReport.upsert({
    where: { id: academicShieldSeed.writingRiskReportId },
    update: {
      riskScore: academicShieldSeed.writingRisk.score,
      riskLevel: RiskLevel.MEDIUM,
      confidence: academicShieldSeed.writingRisk.confidence,
      explanation:
        "Advisory writing signal generated from sentence rhythm, repetition, vocabulary diversity and citation grounding.",
      disclaimer: academicShieldSeed.writingRisk.disclaimer,
      features: academicShieldSeed.writingRisk.features,
      userId: student.id,
      assignmentSubmissionId: assignmentSubmission?.id ?? null,
      labReportId: labReport?.id ?? null,
    },
    create: {
      id: academicShieldSeed.writingRiskReportId,
      riskScore: academicShieldSeed.writingRisk.score,
      riskLevel: RiskLevel.MEDIUM,
      confidence: academicShieldSeed.writingRisk.confidence,
      explanation:
        "Advisory writing signal generated from sentence rhythm, repetition, vocabulary diversity and citation grounding.",
      disclaimer: academicShieldSeed.writingRisk.disclaimer,
      features: academicShieldSeed.writingRisk.features,
      userId: student.id,
      assignmentSubmissionId: assignmentSubmission?.id ?? null,
      labReportId: labReport?.id ?? null,
    },
  });

  await prisma.citation.upsert({
    where: { id: academicShieldSeed.citationId },
    update: {
      style: "Harvard",
      source: {
        sourceTitle: "Responsive Testing Guidance",
        url: "https://example.edu/testing-guidance",
        textPreview: academicShieldSeed.textPreview,
      },
      reference:
        "Author, A. (2026) Responsive Testing Guidance. Available at: https://example.edu/testing-guidance",
      inText: "(Author, 2026)",
      userId: student.id,
    },
    create: {
      id: academicShieldSeed.citationId,
      style: "Harvard",
      source: {
        sourceTitle: "Responsive Testing Guidance",
        url: "https://example.edu/testing-guidance",
        textPreview: academicShieldSeed.textPreview,
      },
      reference:
        "Author, A. (2026) Responsive Testing Guidance. Available at: https://example.edu/testing-guidance",
      inText: "(Author, 2026)",
      userId: student.id,
    },
  });

  await prisma.academicWebScan.upsert({
    where: { id: academicShieldSeed.webScanId },
    update: {
      url: "https://example.edu/testing-guidance",
      title: "Web Source Scan for example.edu",
      similarity: 26,
      semanticScore: 37,
      citationStatus: "partial",
      matchedPhrases: [
        "requirements and constraints",
        "testing evidence",
        "responsive design outcomes",
      ],
      recommendation:
        "Review the matched source, add a direct citation and rewrite overlapping explanation using your own analysis.",
      textPreview: academicShieldSeed.textPreview,
      plagiarismReportId: academicShieldSeed.plagiarismReportId,
      userId: student.id,
    },
    create: {
      id: academicShieldSeed.webScanId,
      url: "https://example.edu/testing-guidance",
      title: "Web Source Scan for example.edu",
      similarity: 26,
      semanticScore: 37,
      citationStatus: "partial",
      matchedPhrases: [
        "requirements and constraints",
        "testing evidence",
        "responsive design outcomes",
      ],
      recommendation:
        "Review the matched source, add a direct citation and rewrite overlapping explanation using your own analysis.",
      textPreview: academicShieldSeed.textPreview,
      plagiarismReportId: academicShieldSeed.plagiarismReportId,
      userId: student.id,
    },
  });

  await prisma.academicRewrite.upsert({
    where: { id: academicShieldSeed.rewriteId },
    update: {
      originalText: academicShieldSeed.textPreview,
      rewrittenText:
        "This submission critically discusses the requirements, design, testing evidence and implementation decisions for the application while keeping source meaning and assessment evidence clear.",
      citationPreservationNotes: [
        "Do not remove existing source attributions.",
        "Keep lab evidence references attached to the relevant test result.",
        "Add a citation where source status is missing or partial.",
      ],
      riskWarnings: [
        "Rewrite support is academic guidance, not misconduct evidence.",
        "Student must verify meaning, citations and assessment criteria coverage.",
      ],
      model: "seeded-local-adapter",
      mode: "mock",
      userId: student.id,
    },
    create: {
      id: academicShieldSeed.rewriteId,
      originalText: academicShieldSeed.textPreview,
      rewrittenText:
        "This submission critically discusses the requirements, design, testing evidence and implementation decisions for the application while keeping source meaning and assessment evidence clear.",
      citationPreservationNotes: [
        "Do not remove existing source attributions.",
        "Keep lab evidence references attached to the relevant test result.",
        "Add a citation where source status is missing or partial.",
      ],
      riskWarnings: [
        "Rewrite support is academic guidance, not misconduct evidence.",
        "Student must verify meaning, citations and assessment criteria coverage.",
      ],
      model: "seeded-local-adapter",
      mode: "mock",
      userId: student.id,
    },
  });

  await prisma.academicShieldExport.upsert({
    where: { id: academicShieldSeed.exportId },
    update: {
      format: "markdown",
      fileName: "academic-shield-report.md",
      content: exportMarkdown,
      report: {
        id: academicShieldSeed.plagiarismReportId,
        ...reportPayload,
        originalityScore: 82,
        riskLevel: "MEDIUM",
      },
      plagiarismReportId: academicShieldSeed.plagiarismReportId,
      userId: student.id,
    },
    create: {
      id: academicShieldSeed.exportId,
      format: "markdown",
      fileName: "academic-shield-report.md",
      content: exportMarkdown,
      report: {
        id: academicShieldSeed.plagiarismReportId,
        ...reportPayload,
        originalityScore: 82,
        riskLevel: "MEDIUM",
      },
      plagiarismReportId: academicShieldSeed.plagiarismReportId,
      userId: student.id,
    },
  });

  console.log(
    "AcademicShield seed ready: reports, citations, scans, rewrites and exports.",
  );
}

async function seedDatabaseAndMlStudio() {
  if (!shouldSeedDemoAccounts()) {
    console.log(
      "Database Visualizer and ML Studio seed skipped with demo login disabled.",
    );
    return;
  }

  const student = await prisma.user.findFirst({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "asc" },
  });

  if (!student) {
    console.log(
      "Database Visualizer and ML Studio seed skipped because student user is missing.",
    );
    return;
  }

  const diagramSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="520" viewBox="0 0 960 520"><rect width="960" height="520" fill="#f8fcfa"/><text x="32" y="42" fill="#047857" font-size="22" font-weight="800">Nexora Academic Workflow ERD</text><text x="32" y="78" fill="#475569" font-size="14">Seeded DB-backed diagram export</text></svg>`;
  const reportContent = [
    "# Student Performance ML Report",
    "",
    "Dataset: student-performance.csv",
    "Rows: 6",
    "Target: result",
    "Algorithm: Random Forest",
    "",
    "## Metrics",
    "- Accuracy: 89%",
    "- Precision: 0.86",
    "- Recall: 0.84",
    "- F1: 0.85",
    "",
    "## Feature Importance",
    "- attendance: 34%",
    "- lab_score: 29%",
    "- assignment_score: 24%",
    "- shield_risk: 13%",
  ].join("\n");

  await prisma.diagram.upsert({
    where: { id: phase7Seed.diagramId },
    update: {
      title: phase7Seed.diagramTitle,
      source: phase7Seed.diagramSource,
      format: "dbml",
      nodes: phase7Seed.diagramNodes,
      edges: phase7Seed.diagramRelationships,
      ownerId: student.id,
    },
    create: {
      id: phase7Seed.diagramId,
      title: phase7Seed.diagramTitle,
      source: phase7Seed.diagramSource,
      format: "dbml",
      nodes: phase7Seed.diagramNodes,
      edges: phase7Seed.diagramRelationships,
      ownerId: student.id,
    },
  });

  await prisma.diagramExport.upsert({
    where: { id: phase7Seed.diagramExportId },
    update: {
      format: "svg",
      fileName: "nexora-academic-workflow.svg",
      content: diagramSvg,
      diagramId: phase7Seed.diagramId,
    },
    create: {
      id: phase7Seed.diagramExportId,
      format: "svg",
      fileName: "nexora-academic-workflow.svg",
      content: diagramSvg,
      diagramId: phase7Seed.diagramId,
    },
  });

  await prisma.dataset.upsert({
    where: { id: phase7Seed.datasetId },
    update: {
      name: "student-performance.csv",
      fileUrl: "database://datasets/student-performance.csv",
      rowCount: phase7Seed.previewRows.length,
      columnCount: phase7Seed.columns.length,
      columns: phase7Seed.columns,
      rawCsv: phase7Seed.csv,
      previewRows: phase7Seed.previewRows,
      missingRows: phase7Seed.missingRows,
      targetColumn: "result",
      ownerId: student.id,
    },
    create: {
      id: phase7Seed.datasetId,
      name: "student-performance.csv",
      fileUrl: "database://datasets/student-performance.csv",
      rowCount: phase7Seed.previewRows.length,
      columnCount: phase7Seed.columns.length,
      columns: phase7Seed.columns,
      rawCsv: phase7Seed.csv,
      previewRows: phase7Seed.previewRows,
      missingRows: phase7Seed.missingRows,
      targetColumn: "result",
      ownerId: student.id,
    },
  });

  await prisma.mLExperiment.upsert({
    where: { id: phase7Seed.experimentId },
    update: {
      name: "Random Forest on student-performance.csv",
      taskType: "classification",
      algorithm: "Random Forest",
      targetColumn: "result",
      trainingRows: phase7Seed.previewRows.length,
      metrics: phase7Seed.metrics,
      confusionMatrix: phase7Seed.confusionMatrix,
      featureImportance: phase7Seed.featureImportance,
      reportUrl: `database://ml-reports/${phase7Seed.reportId}`,
      reportContent,
      datasetId: phase7Seed.datasetId,
    },
    create: {
      id: phase7Seed.experimentId,
      name: "Random Forest on student-performance.csv",
      taskType: "classification",
      algorithm: "Random Forest",
      targetColumn: "result",
      trainingRows: phase7Seed.previewRows.length,
      metrics: phase7Seed.metrics,
      confusionMatrix: phase7Seed.confusionMatrix,
      featureImportance: phase7Seed.featureImportance,
      reportUrl: `database://ml-reports/${phase7Seed.reportId}`,
      reportContent,
      datasetId: phase7Seed.datasetId,
    },
  });

  await prisma.mLReport.upsert({
    where: { id: phase7Seed.reportId },
    update: {
      format: "markdown",
      fileName: "student-performance-ml-report.md",
      content: reportContent,
      experimentId: phase7Seed.experimentId,
    },
    create: {
      id: phase7Seed.reportId,
      format: "markdown",
      fileName: "student-performance-ml-report.md",
      content: reportContent,
      experimentId: phase7Seed.experimentId,
    },
  });

  console.log(
    "Phase 7 seed ready: database diagrams, ERD exports, datasets, ML experiments and reports.",
  );
}

async function seedBootstrapAdmin() {
  const email = process.env.NEXORA_BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.NEXORA_BOOTSTRAP_ADMIN_PASSWORD;
  const name =
    process.env.NEXORA_BOOTSTRAP_ADMIN_NAME ?? "Nexora Administrator";

  if (!email || !password) {
    console.log(
      "No bootstrap admin created. Set NEXORA_BOOTSTRAP_ADMIN_EMAIL and NEXORA_BOOTSTRAP_ADMIN_PASSWORD to create one.",
    );
    return;
  }

  if (password.length < 12) {
    throw new Error(
      "NEXORA_BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: "SUPER_ADMIN",
    },
    create: {
      name,
      email,
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`Bootstrap admin ready: ${email}`);
}

async function main() {
  await seedRoles();
  await seedDemoAccounts();
  await seedAcademicAssignments();
  await seedLiveLabs();
  await seedLabReports();
  await seedCodeLabWorkspace();
  await seedAcademicShield();
  await seedDatabaseAndMlStudio();
  await seedBootstrapAdmin();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
