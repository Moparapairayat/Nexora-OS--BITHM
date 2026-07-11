import type {
  AIModelDescriptor,
  AcademicShieldReport,
  ProductionHardeningStatus,
  Phase6DataLayerStatus,
  CodeDoctorOutput,
  DocumentationOutput,
  DemoAccount,
  DiagramOutput,
  Phase2WorkflowData,
  ProjectArchitectOutput,
  SlideDeckOutput,
} from "@nexora/types";

export const demoAccounts: DemoAccount[] = [
  {
    role: "STUDENT",
    name: "Nadia Rahman",
    email: "student@nexora.local",
    password: "password123",
  },
  {
    role: "TEACHER",
    name: "Dr. Arif Chowdhury",
    email: "teacher@nexora.local",
    password: "password123",
  },
  {
    role: "ADMIN",
    name: "Nexora Admin",
    email: "admin@nexora.local",
    password: "password123",
  },
];

export const aiModels: AIModelDescriptor[] = [
  {
    id: "glm-4.7-flash",
    name: "GLM-4.7-Flash",
    provider: "Zhipu",
    purpose: "General planning and academic workflow drafting",
    mode: "mock",
  },
  {
    id: "devstral-small-2",
    name: "Devstral Small 2",
    provider: "Mistral",
    purpose: "Code review, debugging and refactoring",
    mode: "mock",
  },
  {
    id: "minimax-m2.7",
    name: "MiniMax-M2.7",
    provider: "MiniMax",
    purpose: "Slides, documents and office automation",
    mode: "mock",
  },
  {
    id: "qwen3-thinking",
    name: "Qwen3 Thinking / DeepSeek-R1",
    provider: "Local reasoning",
    purpose: "Long reasoning, rubric mapping and evidence planning",
    mode: "mock",
  },
  {
    id: "qwen3-embedding-reranker",
    name: "Qwen3 Embedding + Reranker",
    provider: "Local retrieval",
    purpose: "Similarity, source ranking and plagiarism checks",
    mode: "mock",
  },
  {
    id: "minicpm-v-4.6",
    name: "MiniCPM-V 4.6",
    provider: "Local vision",
    purpose: "OCR, screenshot and diagram analysis",
    mode: "mock",
  },
];

export const academicShieldDisclaimer =
  "This AI writing risk score is advisory and should not be used as final proof of academic misconduct.";

export const phase2WorkflowData: Phase2WorkflowData = {
  assignments: [
    {
      id: "assignment-task-1",
      title: "Task 1 Report",
      unitCode: "H/650/3385",
      unitTitle: "Web and Mobile Applications",
      taskNumber: "Task 1",
      scenario:
        "Prepare an OTHM-style academic report that analyzes requirements, design decisions, implementation evidence and testing outcomes for a web/mobile application.",
      status: "UNDER_REVIEW",
      wordLimit: 3500,
      wordCount: 3120,
      referencingStyle: "Harvard",
      deadline: "2026-07-05",
      learningOutcomes: [
        {
          code: "LO1",
          title: "Understand web and mobile application requirements",
          coverage: 88,
          criteria: [
            {
              code: "AC 1.1",
              description: "Explain project requirements and constraints.",
              covered: true,
            },
            {
              code: "AC 1.2",
              description: "Identify target users and functional needs.",
              covered: true,
            },
          ],
        },
        {
          code: "LO4",
          title: "Test and evaluate the implemented solution",
          coverage: 62,
          criteria: [
            {
              code: "AC 4.1",
              description: "Create a test strategy for the solution.",
              covered: true,
            },
            {
              code: "AC 4.3",
              description:
                "Produce a complete test plan with evidence and outcomes.",
              covered: false,
            },
          ],
        },
      ],
      checklist: [
        "Brief analyzed",
        "Report structure generated",
        "LO/AC checklist reviewed",
        "Word count checked",
        "Citation style selected",
      ],
      evidence: [
        "Home page screenshot",
        "Responsive layout screenshot",
        "Form validation test notes",
      ],
      originalityScore: 82,
      aiWritingRiskScore: 61,
      fileName: "task-1-report-draft.docx",
      fixRequests: [
        {
          id: "fix-ac43",
          workflow: "assignment-report",
          targetId: "assignment-task-1",
          status: "OPEN",
          reason:
            "Your submission does not fully cover AC 4.3 because the test plan is incomplete. Please add test cases for navigation, form validation, responsive design and performance.",
          aiDraft:
            "Add test cases for navigation, form validation, responsive design and performance. Include screenshots or evidence showing actual test results.",
          teacherNote:
            "Focus on evidence. Add a clear test table before resubmission.",
          createdAt: "2026-06-20T10:30:00.000Z",
        },
      ],
    },
    {
      id: "assignment-task-2",
      title: "Task 2 Website and Mobile App Build",
      unitCode: "H/650/3385",
      unitTitle: "Web and Mobile Applications",
      taskNumber: "Task 2",
      scenario:
        "Develop a working web/mobile application prototype and prepare implementation evidence for core UI, data handling, validation and deployment decisions.",
      status: "DRAFT",
      wordLimit: 2800,
      wordCount: 1460,
      referencingStyle: "Harvard",
      deadline: "2026-07-14",
      learningOutcomes: [
        {
          code: "LO2",
          title: "Design web and mobile application solutions",
          coverage: 74,
          criteria: [
            {
              code: "AC 2.1",
              description: "Create wireframes and explain the design approach.",
              covered: true,
            },
            {
              code: "AC 2.2",
              description:
                "Justify technology choices for the proposed solution.",
              covered: true,
            },
          ],
        },
        {
          code: "LO3",
          title: "Develop web and mobile application features",
          coverage: 48,
          criteria: [
            {
              code: "AC 3.1",
              description: "Implement core screens and navigation.",
              covered: true,
            },
            {
              code: "AC 3.2",
              description: "Connect form validation and data persistence.",
              covered: false,
            },
          ],
        },
      ],
      checklist: [
        "Brief analyzed",
        "Prototype screenshots attached",
        "Implementation notes drafted",
        "Testing section started",
      ],
      evidence: [
        "Dashboard prototype screenshot",
        "Mobile navigation screenshot",
      ],
      originalityScore: 94,
      aiWritingRiskScore: 28,
      fileName: "task-2-build-evidence.docx",
      fixRequests: [],
    },
    {
      id: "assignment-task-3",
      title: "Task 3 Evaluation and Deployment Report",
      unitCode: "H/650/3385",
      unitTitle: "Web and Mobile Applications",
      taskNumber: "Task 3",
      scenario:
        "Evaluate the finished prototype, explain deployment readiness, document limitations and recommend improvements for the next iteration.",
      status: "PASS",
      wordLimit: 2200,
      wordCount: 2140,
      referencingStyle: "Harvard",
      deadline: "2026-07-21",
      learningOutcomes: [
        {
          code: "LO4",
          title: "Test and evaluate the implemented solution",
          coverage: 92,
          criteria: [
            {
              code: "AC 4.2",
              description: "Evaluate the prototype against user requirements.",
              covered: true,
            },
            {
              code: "AC 4.4",
              description: "Recommend improvements based on test outcomes.",
              covered: true,
            },
          ],
        },
      ],
      checklist: [
        "Evaluation complete",
        "Deployment notes attached",
        "Limitations explained",
        "References checked",
      ],
      evidence: [
        "Deployment readiness checklist",
        "User acceptance test summary",
        "Improvement backlog screenshot",
      ],
      originalityScore: 97,
      aiWritingRiskScore: 22,
      fileName: "task-3-evaluation-final.pdf",
      fixRequests: [
        {
          id: "fix-task3-resolved",
          workflow: "assignment-report",
          targetId: "assignment-task-3",
          status: "RESOLVED",
          reason:
            "The first draft needed clearer deployment risk notes and user acceptance evidence.",
          aiDraft:
            "Add a short deployment risk section and show how user acceptance evidence supports the final recommendation.",
          teacherNote: "Resolved after final evidence update.",
          createdAt: "2026-06-18T14:40:00.000Z",
        },
      ],
    },
  ],
  labs: [
    {
      id: "lab-js-validation",
      title: "JavaScript Form Validation Lab",
      status: "FIX_REQUESTED",
      sessionCode: "LAB-JS-24",
      sessionStatus: "live",
      startsAt: "2026-06-24T09:30:00.000Z",
      durationMinutes: 90,
      participants: 12,
      task: "Build browser-side validation for required fields, email format, password length and invalid numeric input.",
      language: "JavaScript",
      deadline: "2026-06-24",
      visibleTests: [
        {
          name: "Valid form returns true",
          input: "email=user@nexora.local, age=22",
          expected: "true",
          passed: true,
        },
        {
          name: "Invalid email returns false",
          input: "email=user, age=22",
          expected: "false",
          passed: true,
        },
      ],
      hiddenTests: [
        {
          name: "Empty values are rejected",
          passed: false,
        },
        {
          name: "Negative age is rejected",
          passed: false,
        },
      ],
      code: "function validateForm(form) {\n  if (!form.email || !form.email.includes('@')) return false;\n  return true;\n}",
      output:
        "Visible tests passed. Hidden tests failed: empty values and negative age.",
      version: 2,
      versionHistory: [
        {
          version: 1,
          label: "Initial submission",
          author: "Nadia Rahman",
          createdAt: "2026-06-21T07:55:00.000Z",
          status: "SUBMITTED",
          summary:
            "Submitted base email validation with visible tests passing.",
          code: "function validateForm(form) {\n  if (!form.email || !form.email.includes('@')) return false;\n  return true;\n}",
          output: "Visible tests passed. Hidden tests failed for empty values.",
        },
        {
          version: 2,
          label: "Teacher fix request",
          author: "Dr. Arif Chowdhury",
          createdAt: "2026-06-21T08:15:00.000Z",
          status: "FIX_REQUESTED",
          summary:
            "Teacher requested guard clauses for missing fields and invalid numeric values.",
          code: "function validateForm(form) {\n  if (!form.email || !form.email.includes('@')) return false;\n  return true;\n}",
          output:
            "Visible tests passed. Hidden tests failed: empty values and negative age.",
        },
      ],
      fixRequests: [
        {
          id: "fix-lab-input",
          workflow: "live-lab",
          targetId: "lab-js-validation",
          status: "OPEN",
          reason:
            "Your code works for normal input, but it does not handle empty or invalid input.",
          aiDraft:
            "Add input validation and test the program with valid, empty and negative values before resubmitting.",
          teacherNote:
            "Add guard clauses for missing fields and invalid numeric values.",
          createdAt: "2026-06-21T08:15:00.000Z",
        },
      ],
    },
    {
      id: "lab-python-api",
      title: "Python API Response Lab",
      status: "NOT_STARTED",
      sessionCode: "LAB-API-31",
      sessionStatus: "scheduled",
      startsAt: "2026-06-26T10:00:00.000Z",
      durationMinutes: 75,
      participants: 0,
      task: "Create a small API handler that validates a request body and returns structured JSON responses for success and error cases.",
      language: "Python",
      deadline: "2026-06-26",
      visibleTests: [
        {
          name: "Valid request returns ok true",
          input: "name=Nadia, score=82",
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
        {
          name: "Negative score is rejected",
          passed: false,
        },
        {
          name: "Response contains message field",
          passed: false,
        },
      ],
      code: "def handle_request(payload):\n    if not payload.get('name'):\n        return {'ok': False, 'error': 'name required'}\n    return {'ok': True, 'message': 'accepted'}",
      output:
        "Session is scheduled. Join the lab before running hidden checks.",
      version: 1,
      versionHistory: [
        {
          version: 1,
          label: "Teacher task created",
          author: "Dr. Arif Chowdhury",
          createdAt: "2026-06-23T12:00:00.000Z",
          status: "NOT_STARTED",
          summary: "Lab task created with request validation requirements.",
          code: "def handle_request(payload):\n    if not payload.get('name'):\n        return {'ok': False, 'error': 'name required'}\n    return {'ok': True, 'message': 'accepted'}",
          output: "Ready for student join.",
        },
      ],
      fixRequests: [],
    },
  ],
  labReports: [
    {
      id: "lab-report-validation",
      title: "Lab Report for Form Validation",
      status: "DRAFT",
      linkedLabTitle: "JavaScript Form Validation Lab",
      objective:
        "Document how the validation task was implemented, tested and corrected.",
      toolsUsed: "VS Code, browser console, HTML, CSS and JavaScript",
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
      screenshots: ["validation-output.png"],
      codeAttachments: ["validate-form-v2.js"],
      originalityScore: 91,
      aiWritingRiskScore: 38,
      fixRequests: [],
    },
    {
      id: "lab-report-api",
      title: "Lab Report for API Response Handler",
      status: "CORRECTION_REQUESTED",
      linkedLabTitle: "Python API Response Lab",
      objective:
        "Explain how the API handler validates request data and returns predictable JSON responses.",
      toolsUsed: "VS Code, Python, pytest-style checks and API response logs",
      implementation:
        "The handler checks required fields, rejects invalid scores and returns structured success or error objects.",
      testingEvidence:
        "Visible request validation passed, but hidden negative-score evidence still needs a screenshot.",
      problemsFaced:
        "Initial output did not document the negative score guard and response message field.",
      solution:
        "Add negative score test evidence and show the final JSON response structure.",
      conclusion:
        "The API handler is stable after adding request validation and response shape checks.",
      screenshots: ["api-valid-response.png"],
      codeAttachments: ["handle-request.py"],
      originalityScore: 88,
      aiWritingRiskScore: 44,
      fixRequests: [
        {
          id: "fix-api-evidence",
          workflow: "lab-report",
          targetId: "lab-report-api",
          status: "OPEN",
          reason:
            "The report needs clearer testing evidence for the negative score case and final JSON response.",
          aiDraft:
            "Attach a screenshot or log showing negative score rejection and include a short explanation of the JSON response fields.",
          teacherNote:
            "Add one screenshot and update the testing evidence paragraph before resubmission.",
          createdAt: "2026-06-23T09:10:00.000Z",
        },
      ],
    },
    {
      id: "lab-report-final",
      title: "Lab Report for Deployment Checklist",
      status: "ACCEPTED",
      linkedLabTitle: "Deployment Readiness Lab",
      objective:
        "Document deployment checks, environment setup and verification evidence for the prototype.",
      toolsUsed:
        "Next.js build output, browser console, deployment checklist and screenshots",
      implementation:
        "The deployment workflow validates build output, route health and key user journeys.",
      testingEvidence:
        "Build and route checks passed with screenshots attached for dashboard and login flows.",
      problemsFaced:
        "Initial build failed because a required environment value was missing.",
      solution:
        "Added environment defaults and verified the build again before submission.",
      conclusion:
        "The prototype is ready for pilot deployment with documented checks.",
      screenshots: ["build-success.png", "route-smoke-check.png"],
      codeAttachments: ["deployment-checklist.md"],
      originalityScore: 96,
      aiWritingRiskScore: 21,
      fixRequests: [],
    },
  ],
};

export const phase3ProjectBlueprint: ProjectArchitectOutput = {
  title: "Smart Academic Task Tracker",
  problemStatement:
    "Students need one reliable workspace to track assignments, lab tasks, evidence, feedback and resubmission history.",
  objectives: [
    "Centralize academic tasks and deadlines",
    "Track LO/AC evidence coverage",
    "Support teacher feedback and fix requests",
    "Generate clear documentation for submission",
  ],
  userRoles: ["Student", "Teacher", "Admin"],
  functionalRequirements: [
    "Students can submit reports and lab evidence",
    "Teachers can review submissions and request fixes",
    "Admins can manage courses, users and units",
    "AI tools can draft project plans and feedback",
  ],
  nonFunctionalRequirements: [
    "Responsive UI",
    "Role-based access control",
    "Audit-ready logs",
    "Own-hosted deployment support",
  ],
  techStack: [
    "Next.js",
    "Express.js",
    "PostgreSQL",
    "Prisma",
    "FastAPI",
    "Local AI model router",
  ],
  databaseSchema: [
    "User(id, name, email, role)",
    "AssignmentSubmission(id, userId, status, fileUrl)",
    "LabSubmission(id, labTaskId, code, status)",
    "FixRequest(id, targetId, reason, status)",
  ],
  apiRoutes: [
    "POST /api/assignments/submit",
    "POST /api/labs/submit-code",
    "POST /api/ai/project-architect",
    "POST /api/ai/code-doctor",
  ],
  testPlan: [
    "Validate role routing",
    "Test assignment submission state changes",
    "Test lab hidden-case feedback",
    "Test fix request resubmission flow",
  ],
  futureEnhancements: [
    "PDF/DOCX export",
    "Live collaboration",
    "Vector search for evidence",
    "Model performance analytics",
  ],
};

export const phase3CodeDoctorReport: CodeDoctorOutput = {
  explanation:
    "The function validates part of the form, but it does not consistently guard against missing fields, invalid numeric values or weak password input.",
  issues: [
    "Missing null/undefined checks for the form object",
    "Email validation only checks for @",
    "Negative age values are not rejected",
    "Password length is not validated",
  ],
  fixes: [
    "Add guard clauses for missing form fields",
    "Use a stricter email pattern",
    "Reject age values below 0",
    "Return structured error messages for the UI",
  ],
  refactorNotes: [
    "Split validation into small reusable functions",
    "Return an object with ok and errors instead of a boolean",
  ],
  securityWarnings: [
    "Client-side validation must be repeated on the server",
    "Never trust browser-only validation for sensitive data",
  ],
  complexity: {
    time: "O(1)",
    space: "O(1)",
  },
  unitTests: [
    "valid form returns ok",
    "empty email returns error",
    "negative age returns error",
    "short password returns error",
  ],
};

export const phase3DiagramSample: DiagramOutput = {
  entities: [
    {
      name: "users",
      fields: [
        { name: "id", type: "uuid", isPrimaryKey: true, isForeignKey: false },
        {
          name: "email",
          type: "text",
          isPrimaryKey: false,
          isForeignKey: false,
        },
      ],
    },
    {
      name: "submissions",
      fields: [
        { name: "id", type: "uuid", isPrimaryKey: true, isForeignKey: false },
        {
          name: "user_id",
          type: "uuid",
          isPrimaryKey: false,
          isForeignKey: true,
          references: "users.id",
        },
      ],
    },
  ],
  relationships: ["submissions.user_id -> users.id"],
  code: "CREATE TABLE users (id UUID PRIMARY KEY, email TEXT UNIQUE NOT NULL);\nCREATE TABLE submissions (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id));",
};

export const phase3SlideDeck: SlideDeckOutput = {
  id: "deck-smart-academic-tracker",
  title: "Smart Academic Task Tracker",
  sourceType: "project",
  audience: "teacher",
  template: "academic",
  durationMinutes: 8,
  exportFormats: ["pptx", "pdf", "markdown"],
  slides: [
    {
      id: "slide-problem",
      title: "Problem",
      bullets: ["Fragmented submission tools", "Weak evidence tracking"],
      speakerNotes: "Explain the academic workflow gap.",
      layout: "title",
      visualCue: "Dark academic workspace with disconnected submission cards.",
    },
    {
      id: "slide-objectives",
      title: "Objectives",
      bullets: ["Centralize work", "Improve feedback", "Track skill growth"],
      speakerNotes: "Connect objectives to student and teacher outcomes.",
      layout: "bullets",
      visualCue: "Three connected workflow pillars.",
    },
    {
      id: "slide-architecture",
      title: "Architecture",
      bullets: ["Next.js frontend", "Express API", "PostgreSQL database"],
      speakerNotes: "Summarize the technical structure.",
      layout: "split",
      visualCue: "Layered system diagram with web, API and data services.",
    },
  ],
};

export const phase3Documentation: DocumentationOutput = {
  id: "doc-smart-academic-tracker",
  title: "Smart Academic Task Tracker Documentation",
  documentType: "readme",
  exportFormats: ["docx", "pdf", "markdown"],
  updatedAt: "2026-06-22T09:30:00.000Z",
  sections: [
    {
      id: "doc-overview",
      heading: "Overview",
      body: "This project tracks assignment reports, lab tasks, evidence and feedback in one academic workspace.",
    },
    {
      id: "doc-installation",
      heading: "Installation",
      body: "Install dependencies, configure environment variables, run database migrations and start the web/API services.",
    },
    {
      id: "doc-api-summary",
      heading: "API Summary",
      body: "The API includes routes for assignments, labs, lab reports, AI tools and AcademicShield reports.",
    },
    {
      id: "doc-deployment",
      heading: "Deployment",
      body: "The project is own-hosting friendly and can run with Docker Compose, PostgreSQL and local AI fallback adapters.",
    },
  ],
};

export const phase4AcademicShieldReport: AcademicShieldReport = {
  id: "academic-shield-report-demo",
  title: "Task 1 Report Integrity Review",
  checkedAt: "2026-06-22T10:30:00.000Z",
  originalityScore: 82,
  overallSimilarity: 18,
  internalSimilarity: 12,
  fuzzySimilarity: 21,
  semanticSimilarity: 27,
  riskLevel: "MEDIUM",
  citationGapCount: 5,
  textPreview:
    "This report evaluates the requirements, design, testing evidence and implementation decisions for a web and mobile application project.",
  sourceRanking: [
    {
      id: "src-internal-task-1",
      title: "OTHM Web and Mobile Applications Task 1 Archive",
      kind: "internal-submission",
      url: "internal-demo://othm-task-1",
      author: "Internal submission archive",
      similarity: 0.18,
      fuzzyScore: 0.31,
      semanticScore: 0.42,
      internalOverlap: 0.24,
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
      id: "src-lab-report",
      title: "JavaScript Form Validation Lab Report",
      kind: "lab-report",
      url: "internal-demo://lab-report-validation",
      author: "Nadia Rahman",
      similarity: 0.14,
      fuzzyScore: 0.22,
      semanticScore: 0.36,
      internalOverlap: 0.2,
      rank: 2,
      citationStatus: "partial",
      matchedPhrases: [
        "visible tests passed",
        "hidden tests failed for empty values",
      ],
      recommendation:
        "Keep reused lab evidence, but cite the lab artifact and clarify what changed in this submission.",
    },
    {
      id: "src-web-guidance",
      title: "Responsive Testing Guidance",
      kind: "web-source",
      url: "https://example.edu/testing-guidance",
      author: "Academic learning resource",
      similarity: 0.09,
      fuzzyScore: 0.17,
      semanticScore: 0.28,
      internalOverlap: 0.04,
      rank: 3,
      citationStatus: "ok",
      matchedPhrases: ["navigation, form validation and performance testing"],
      recommendation:
        "Citation is present. Confirm page number or retrieval date if required by the rubric.",
    },
  ],
  highlightedMatches: [
    {
      id: "match-p3",
      paragraph: 3,
      excerpt:
        "The application requirements and constraints are analyzed for web/mobile usage and responsive behavior.",
      matchedSourceId: "src-internal-task-1",
      severity: "MEDIUM",
      reason: "High semantic similarity to an internal archived submission.",
    },
    {
      id: "match-p7",
      paragraph: 7,
      excerpt:
        "Visible tests passed while hidden tests failed for empty input and negative age values.",
      matchedSourceId: "src-lab-report",
      severity: "LOW",
      reason:
        "Expected reuse of lab evidence, but citation context is incomplete.",
    },
    {
      id: "match-p11",
      paragraph: 11,
      excerpt:
        "Testing should include navigation, form validation, responsive design and performance checks.",
      matchedSourceId: "src-web-guidance",
      severity: "LOW",
      reason: "Common rubric phrasing with acceptable source attribution.",
    },
  ],
  writingRisk: {
    id: "writing-risk-demo",
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
        label: "Vocabulary diversity",
        value: "Low-medium",
        impact: "MEDIUM",
      },
      {
        label: "Repetition pattern",
        value: "Noticeable",
        impact: "LOW",
      },
      {
        label: "Citation grounding",
        value: "Needs review",
        impact: "MEDIUM",
      },
    ],
    disclaimer: academicShieldDisclaimer,
  },
  exportFormats: ["pdf", "docx", "markdown", "json"],
};

export const phase5ProductionStatus: ProductionHardeningStatus = {
  permissionPolicies: [
    {
      role: "STUDENT",
      permissions: [
        "dashboard:read",
        "assignments:submit",
        "labs:run",
        "ai-tools:use",
        "academic-shield:scan-own",
        "uploads:create-own",
      ],
      sessionTtlHours: 8,
      protectedAreas: [
        "student dashboard",
        "student submissions",
        "student uploads",
      ],
    },
    {
      role: "TEACHER",
      permissions: [
        "dashboard:read",
        "submissions:review",
        "fix-requests:create",
        "academic-shield:review",
        "labs:monitor",
      ],
      sessionTtlHours: 8,
      protectedAreas: ["teacher dashboard", "plagiarism reports", "live labs"],
    },
    {
      role: "ADMIN",
      permissions: [
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
      sessionTtlHours: 4,
      protectedAreas: [
        "admin dashboard",
        "security logs",
        "production operations",
      ],
    },
  ],
  services: [
    {
      id: "web",
      name: "Next.js web",
      state: "healthy",
      uptime: "99.95%",
      region: "local / primary",
      detail: "The web app builds cleanly and role dashboards are ready.",
    },
    {
      id: "api",
      name: "Express API",
      state: "healthy",
      uptime: "99.93%",
      region: "local / primary",
      detail:
        "Login sessions, role checks, audit logs and workflow APIs are active.",
    },
    {
      id: "ml-nlp",
      name: "ML/NLP service",
      state: "healthy",
      uptime: "99.80%",
      region: "local / worker",
      detail:
        "AcademicShield and ML tools are available through local demo APIs.",
    },
    {
      id: "storage",
      name: "Upload storage",
      state: "degraded",
      uptime: "local-first",
      region: "local volume",
      detail:
        "Local uploads are active; S3 or MinIO can replace them for production.",
    },
  ],
  auditEvents: [
    {
      id: "audit-login-admin",
      actor: "admin@nexora.local",
      role: "ADMIN",
      action: "auth.login",
      target: "admin dashboard",
      severity: "INFO",
      createdAt: "2026-06-22T08:00:00.000Z",
      ipAddress: "127.0.0.1",
    },
    {
      id: "audit-risk-review",
      actor: "teacher@nexora.local",
      role: "TEACHER",
      action: "academic-shield.review",
      target: "Task 1 Report",
      severity: "WARN",
      createdAt: "2026-06-22T08:12:00.000Z",
      ipAddress: "127.0.0.1",
    },
    {
      id: "audit-upload",
      actor: "student@nexora.local",
      role: "STUDENT",
      action: "upload.request",
      target: "task-1-report-draft.docx",
      severity: "INFO",
      createdAt: "2026-06-22T08:18:00.000Z",
      ipAddress: "127.0.0.1",
    },
  ],
  backgroundJobs: [
    {
      id: "job-nightly-backup",
      name: "Nightly database backup",
      queue: "backups",
      status: "queued",
      attempts: 0,
      scheduledFor: "2026-06-23T01:00:00.000Z",
      result: "Awaiting next scheduled run",
    },
    {
      id: "job-academic-shield-export",
      name: "AcademicShield report export",
      queue: "academic-shield",
      status: "completed",
      attempts: 1,
      scheduledFor: "2026-06-22T08:20:00.000Z",
      lastRunAt: "2026-06-22T08:21:00.000Z",
      result: "Markdown packet generated",
    },
    {
      id: "job-notification-digest",
      name: "Teacher notification digest",
      queue: "notifications",
      status: "running",
      attempts: 1,
      scheduledFor: "2026-06-22T09:00:00.000Z",
      lastRunAt: "2026-06-22T09:00:00.000Z",
      result: "Preparing review queue summary",
    },
  ],
  uploads: [
    {
      id: "upload-task-1",
      fileName: "task-1-report-draft.docx",
      ownerEmail: "student@nexora.local",
      purpose: "assignment",
      status: "attached",
      storageKey: "uploads/student/task-1-report-draft.docx",
      maxSizeMb: 25,
      createdAt: "2026-06-22T08:18:00.000Z",
    },
    {
      id: "upload-lab-evidence",
      fileName: "validation-output.png",
      ownerEmail: "student@nexora.local",
      purpose: "evidence",
      status: "uploaded",
      storageKey: "uploads/student/validation-output.png",
      maxSizeMb: 25,
      createdAt: "2026-06-22T08:24:00.000Z",
    },
  ],
  deploymentChecklist: [
    {
      id: "env-secrets",
      label: "Production secrets are configured",
      status: "manual",
      owner: "devops",
      detail:
        "JWT_SECRET, DATABASE_URL, WEB_ORIGIN, ML_NLP_URL and storage credentials need real environment values.",
    },
    {
      id: "rbac",
      label: "Role checks protect the API",
      status: "complete",
      owner: "admin",
      detail:
        "Protected admin routes require a signed session and the right role permissions.",
    },
    {
      id: "uploads",
      label: "Upload storage is ready",
      status: "complete",
      owner: "devops",
      detail:
        "Upload records and storage keys are ready for S3 or MinIO later.",
    },
    {
      id: "jobs",
      label: "Background jobs are tracked",
      status: "complete",
      owner: "devops",
      detail:
        "Report exports, notifications and backups show status and run history.",
    },
    {
      id: "observability",
      label: "Health checks and audit logs",
      status: "complete",
      owner: "admin",
      detail:
        "Health status, service status and audit events are available through the ops API.",
    },
    {
      id: "deployment-playbook",
      label: "Deployment steps are documented",
      status: "complete",
      owner: "devops",
      detail:
        "Docker Compose, environment setup, migration, seed and smoke-test steps are documented.",
    },
  ],
};

export const phase6DataLayerStatus: Phase6DataLayerStatus = {
  sourceMode: "memory",
  snapshot: {
    id: "phase6-institution-snapshot",
    sourceMode: "memory",
    generatedAt: "2026-06-23T09:00:00.000Z",
    metrics: [
      {
        id: "users",
        label: "Demo users",
        value: demoAccounts.length,
        detail: "Student, teacher and admin sample accounts.",
      },
      {
        id: "departments",
        label: "Departments",
        value: 1,
        detail: "Information Technology is ready as the sample department.",
      },
      {
        id: "courses",
        label: "Courses",
        value: 1,
        detail: "Web and Mobile Applications is ready as the sample course.",
      },
      {
        id: "othm-units",
        label: "OTHM units",
        value: 1,
        detail: "H/650/3385 is linked to the academic workflow.",
      },
      {
        id: "assignments",
        label: "Assignments",
        value: phase2WorkflowData.assignments.length,
        detail: "Assignment report data is available through the API.",
      },
      {
        id: "live-labs",
        label: "Live labs",
        value: phase2WorkflowData.labs.length,
        detail: "LiveLab data includes visible and hidden checks.",
      },
      {
        id: "lab-reports",
        label: "Lab reports",
        value: phase2WorkflowData.labReports.length,
        detail: "Lab report drafts and correction status are available.",
      },
      {
        id: "fix-requests",
        label: "Fix requests",
        value:
          phase2WorkflowData.assignments.reduce(
            (total, item) => total + item.fixRequests.length,
            0,
          ) +
          phase2WorkflowData.labs.reduce(
            (total, item) => total + item.fixRequests.length,
            0,
          ) +
          phase2WorkflowData.labReports.reduce(
            (total, item) => total + item.fixRequests.length,
            0,
          ),
        detail: "Open teacher feedback and resubmission requests.",
      },
    ],
  },
  connectors: [
    {
      id: "memory-repository",
      name: "In-memory workflow data",
      mode: "memory",
      state: "ready",
      detail:
        "Current APIs read and update the sample workflow data in memory.",
    },
    {
      id: "prisma-schema",
      name: "Prisma database schema",
      mode: "database",
      state: "ready",
      detail:
        "User, department, course, assignment, lab and AcademicShield models are defined.",
    },
    {
      id: "postgres-runtime",
      name: "Postgres runtime",
      mode: "database",
      state: "needs-attention",
      detail: "DATABASE_URL is needed before switching to database mode.",
    },
    {
      id: "export-pipeline",
      name: "Admin data exports",
      mode: "hybrid",
      state: "ready",
      detail:
        "Snapshot exports are available for pilot review and migration checks.",
    },
  ],
  qualityChecks: [
    {
      id: "demo-accounts-unique",
      label: "Sample account emails are unique",
      scope: "identity",
      status: "passed",
      detail: "Student, teacher and admin emails do not overlap.",
      owner: "admin",
      lastRunAt: "2026-06-23T09:00:00.000Z",
    },
    {
      id: "workflow-links",
      label: "Workflow links are complete",
      scope: "academic workflow",
      status: "passed",
      detail:
        "Assignments, labs, lab reports and fix requests all point to the right records.",
      owner: "teacher",
      lastRunAt: "2026-06-23T09:00:00.000Z",
    },
    {
      id: "storage-durability",
      label: "Storage is ready for durable hosting",
      scope: "uploads",
      status: "warning",
      detail: "Local uploads work now; real deployment should use S3 or MinIO.",
      owner: "devops",
      lastRunAt: "2026-06-23T09:00:00.000Z",
    },
    {
      id: "database-mode",
      label: "Database mode is ready to test",
      scope: "persistence",
      status: "warning",
      detail:
        "Use memory mode for demos. Run db push and seed before enabling database mode.",
      owner: "devops",
      lastRunAt: "2026-06-23T09:00:00.000Z",
    },
  ],
  migrationTasks: [
    {
      id: "generate-prisma",
      label: "Generate Prisma client",
      status: "complete",
      command: "npm run db:generate",
      detail: "Prisma client generation is part of local setup and deployment.",
    },
    {
      id: "push-schema",
      label: "Push schema to Postgres",
      status: "manual",
      command: "npm run db:push",
      detail:
        "Run this against the chosen Postgres database after reviewing schema changes.",
    },
    {
      id: "seed-institution",
      label: "Seed institution baseline",
      status: "manual",
      command: "npm run db:seed",
      detail:
        "Creates sample users, department, course, unit and workflow data.",
    },
    {
      id: "rotate-demo-credentials",
      label: "Rotate demo credentials",
      status: "manual",
      detail: "Replace shared sample credentials before pilot usage.",
    },
  ],
  repositoryBoundaries: [
    {
      id: "assignments-repository",
      workflow: "Assignment reports",
      readModel: "/api/assignments/student and /api/assignments/teacher",
      writeModel: "submit, review, request-fix and resubmit transitions",
      status: "integrated",
    },
    {
      id: "labs-repository",
      workflow: "LiveLab sessions",
      readModel: "/api/labs/student and /api/labs/teacher",
      writeModel:
        "run-code, submit-code, request-fix, resubmit and complete transitions",
      status: "integrated",
    },
    {
      id: "lab-reports-repository",
      workflow: "Lab reports",
      readModel: "/api/lab-reports/student and /api/lab-reports/teacher",
      writeModel: "generate, submit, review and request-correction transitions",
      status: "integrated",
    },
    {
      id: "academic-shield-repository",
      workflow: "AcademicShield reports",
      readModel: "/api/plagiarism/demo-report",
      writeModel: "check, settings, export and citation generation actions",
      status: "adapter-ready",
    },
  ],
  exportPackets: [
    {
      id: "institution-snapshot-json",
      name: "Institution snapshot",
      format: "json",
      includes: ["users", "departments", "courses", "units", "workflow counts"],
      generatedAt: "2026-06-23T09:00:00.000Z",
    },
    {
      id: "workflow-seed-json",
      name: "Workflow seed packet",
      format: "json",
      includes: ["assignments", "labs", "lab reports", "fix requests"],
      generatedAt: "2026-06-23T09:00:00.000Z",
    },
    {
      id: "ops-audit-json",
      name: "Ops audit packet",
      format: "json",
      includes: [
        "audit event summary",
        "service status",
        "deployment checklist",
      ],
      generatedAt: "2026-06-23T09:00:00.000Z",
    },
  ],
};
