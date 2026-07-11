import {
  academicShieldDisclaimer,
  aiModels,
  demoAccounts,
} from "@nexora/config";

export type AppRole = "student" | "teacher" | "admin";
export type Tone = "cyan" | "emerald" | "amber" | "rose" | "violet" | "slate";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  items: NavItem[];
}

export interface StatItem {
  label: string;
  value: string;
  trend: string;
  tone: Tone;
}

export interface WorkflowItem {
  label: string;
  status: string;
  detail: string;
  tone: Tone;
}

export interface RoleDashboardData {
  role: AppRole;
  eyebrow: string;
  title: string;
  subtitle: string;
  accountEmail: string;
  nav: NavItem[];
  navGroups: NavGroup[];
  stats: StatItem[];
  workflows: WorkflowItem[];
  activity: string[];
  skillData: Array<{ skill: string; score: number }>;
}

function flattenNavGroups(navGroups: NavGroup[]): NavItem[] {
  return navGroups.flatMap((group) => group.items);
}

const studentNavGroups: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "LayoutDashboard",
    items: [
      {
        label: "Dashboard",
        href: "/student/dashboard",
        icon: "LayoutDashboard",
      },
      { label: "Activity", href: "/student/activity", icon: "Activity" },
      {
        label: "Notifications",
        href: "/student/notifications",
        icon: "Bell",
        badge: "2",
      },
    ],
  },
  {
    id: "academic-work",
    label: "Academic Work",
    icon: "BookOpen",
    badge: "1",
    items: [
      {
        label: "Assignment Reports",
        href: "/student/assignments",
        icon: "FileText",
      },
      { label: "Lab Classes", href: "/student/labs", icon: "FlaskConical" },
      {
        label: "Lab Reports",
        href: "/student/lab-reports",
        icon: "ClipboardCheck",
      },
      { label: "My Submissions", href: "/student/submissions", icon: "Upload" },
      {
        label: "Teacher Feedback",
        href: "/student/teacher-feedback",
        icon: "MessageSquareText",
        badge: "1",
      },
    ],
  },
  {
    id: "ai-workspace",
    label: "AI Workspace",
    icon: "Bot",
    items: [
      {
        label: "AI Project Architect",
        href: "/student/project-architect",
        icon: "Network",
      },
      {
        label: "AI Code Doctor",
        href: "/student/code-doctor",
        icon: "Stethoscope",
      },
      {
        label: "AI Feedback Engine",
        href: "/student/ai-feedback-engine",
        icon: "MessagesSquare",
      },
      {
        label: "AI Brief Analyzer",
        href: "/student/ai-brief-analyzer",
        icon: "Search",
      },
    ],
  },
  {
    id: "developer-tools",
    label: "Developer Tools",
    icon: "Code2",
    items: [
      { label: "Code Lab", href: "/student/code-lab", icon: "Code2" },
      {
        label: "Database Visualizer",
        href: "/student/database-visualizer",
        icon: "Database",
      },
      { label: "ERD to Code", href: "/student/erd-to-code", icon: "Workflow" },
      { label: "API Tester", href: "/student/api-tester", icon: "ServerCog" },
      {
        label: "GitHub Analyzer",
        href: "/student/github-analyzer",
        icon: "CodeXml",
      },
      {
        label: "Deployment Assistant",
        href: "/student/deployment-assistant",
        icon: "ArchiveRestore",
      },
    ],
  },
  {
    id: "ml-data",
    label: "ML & Data",
    icon: "Database",
    items: [
      {
        label: "Dataset Manager",
        href: "/student/dataset-manager",
        icon: "FolderKanban",
      },
      { label: "ML Studio", href: "/student/ml-studio", icon: "BrainCircuit" },
      {
        label: "AutoML Assistant",
        href: "/student/automl-assistant",
        icon: "Bot",
      },
      { label: "ML Reports", href: "/student/ml-reports", icon: "ChartSpline" },
    ],
  },
  {
    id: "content-studio",
    label: "Content Studio",
    icon: "Presentation",
    items: [
      {
        label: "Slide Maker",
        href: "/student/slide-maker",
        icon: "Presentation",
      },
      {
        label: "Documentation Generator",
        href: "/student/documentation",
        icon: "FileText",
      },
      {
        label: "Research Assistant",
        href: "/student/research-assistant",
        icon: "Search",
      },
      {
        label: "OCR Document Reader",
        href: "/student/ocr-document-reader",
        icon: "Files",
      },
    ],
  },
  {
    id: "academic-shield",
    label: "AcademicShield",
    icon: "ShieldCheck",
    items: [
      {
        label: "Plagiarism Checker",
        href: "/student/academic-shield",
        icon: "ShieldCheck",
      },
      {
        label: "Web Source Scan",
        href: "/student/web-source-scan",
        icon: "Search",
      },
      {
        label: "AI Writing Risk",
        href: "/student/ai-writing-risk",
        icon: "ShieldAlert",
      },
      {
        label: "Academic Rewrite",
        href: "/student/academic-rewrite",
        icon: "FileCheck2",
      },
      {
        label: "Citation Generator",
        href: "/student/citation-generator",
        icon: "FileStack",
      },
      {
        label: "Originality Reports",
        href: "/student/originality-reports",
        icon: "ClipboardList",
      },
    ],
  },
  {
    id: "portfolio-skills",
    label: "Portfolio & Skills",
    icon: "BriefcaseBusiness",
    items: [
      {
        label: "Portfolio Builder",
        href: "/student/portfolio",
        icon: "BriefcaseBusiness",
      },
      { label: "Skill DNA", href: "/student/skill-dna", icon: "Radar" },
      {
        label: "Learning Roadmap",
        href: "/student/learning-roadmap",
        icon: "ChartNoAxesCombined",
      },
      {
        label: "Achievements",
        href: "/student/achievements",
        icon: "GraduationCap",
      },
    ],
  },
  {
    id: "feedback",
    label: "Feedback",
    icon: "MessagesSquare",
    badge: "1",
    items: [
      {
        label: "Feedback Center",
        href: "/student/feedback",
        icon: "MessagesSquare",
      },
      {
        label: "Fix Requests",
        href: "/student/fix-requests",
        icon: "MessageSquareText",
        badge: "1",
      },
    ],
  },
];

const teacherNavGroups: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "LayoutDashboard",
    items: [
      {
        label: "Dashboard",
        href: "/teacher/dashboard",
        icon: "LayoutDashboard",
      },
      { label: "Activity", href: "/teacher/activity", icon: "Activity" },
      {
        label: "Notifications",
        href: "/teacher/notifications",
        icon: "Bell",
        badge: "7",
      },
    ],
  },
  {
    id: "academic-work",
    label: "Academic Work",
    icon: "BookOpen",
    badge: "24",
    items: [
      {
        label: "Assignment Reports",
        href: "/teacher/assignments",
        icon: "FileCheck2",
      },
      { label: "Lab Classes", href: "/teacher/labs", icon: "FlaskConical" },
      {
        label: "Lab Reports",
        href: "/teacher/lab-reports",
        icon: "ClipboardList",
      },
      {
        label: "Submissions",
        href: "/teacher/submissions",
        icon: "Upload",
        badge: "24",
      },
      {
        label: "Teacher Feedback",
        href: "/teacher/teacher-feedback",
        icon: "MessageSquareText",
      },
    ],
  },
  {
    id: "ai-workspace",
    label: "AI Workspace",
    icon: "Bot",
    items: [
      {
        label: "AI Project Architect",
        href: "/teacher/project-architect",
        icon: "Network",
      },
      {
        label: "AI Code Doctor",
        href: "/teacher/code-doctor",
        icon: "Stethoscope",
      },
      {
        label: "AI Feedback Engine",
        href: "/teacher/ai-feedback-engine",
        icon: "MessagesSquare",
      },
      {
        label: "AI Brief Analyzer",
        href: "/teacher/ai-brief-analyzer",
        icon: "Search",
      },
    ],
  },
  {
    id: "developer-tools",
    label: "Developer Tools",
    icon: "Code2",
    items: [
      { label: "Code Lab", href: "/teacher/code-lab", icon: "Code2" },
      {
        label: "Database Visualizer",
        href: "/teacher/database-visualizer",
        icon: "Database",
      },
      { label: "ERD to Code", href: "/teacher/erd-to-code", icon: "Workflow" },
      { label: "API Tester", href: "/teacher/api-tester", icon: "ServerCog" },
      {
        label: "GitHub Analyzer",
        href: "/teacher/github-analyzer",
        icon: "CodeXml",
      },
      {
        label: "Deployment Assistant",
        href: "/teacher/deployment-assistant",
        icon: "ArchiveRestore",
      },
    ],
  },
  {
    id: "academic-shield",
    label: "AcademicShield",
    icon: "ShieldCheck",
    badge: "5",
    items: [
      {
        label: "Plagiarism Checker",
        href: "/teacher/plagiarism-reports",
        icon: "ShieldAlert",
      },
      {
        label: "Web Source Scan",
        href: "/teacher/web-source-scan",
        icon: "Search",
      },
      {
        label: "AI Writing Risk",
        href: "/teacher/ai-writing-risk",
        icon: "ShieldAlert",
        badge: "5",
      },
      {
        label: "Academic Rewrite",
        href: "/teacher/academic-rewrite",
        icon: "FileCheck2",
      },
      {
        label: "Citation Generator",
        href: "/teacher/citation-generator",
        icon: "FileStack",
      },
      {
        label: "Originality Reports",
        href: "/teacher/originality-reports",
        icon: "ClipboardList",
      },
    ],
  },
  {
    id: "review-queue",
    label: "Review Queue",
    icon: "ClipboardList",
    badge: "24",
    items: [
      {
        label: "Pending Reviews",
        href: "/teacher/pending-reviews",
        icon: "ClipboardList",
        badge: "24",
      },
      {
        label: "Fix Requests",
        href: "/teacher/fix-requests",
        icon: "MessageSquareText",
        badge: "11",
      },
      { label: "Code Reviews", href: "/teacher/code-reviews", icon: "CodeXml" },
    ],
  },
  {
    id: "students",
    label: "Students",
    icon: "Users",
    items: [
      { label: "Students", href: "/teacher/students", icon: "Users" },
      { label: "Courses", href: "/teacher/courses", icon: "GraduationCap" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "ChartNoAxesCombined",
    items: [
      {
        label: "Analytics",
        href: "/teacher/analytics",
        icon: "ChartNoAxesCombined",
      },
      {
        label: "Progress Reports",
        href: "/teacher/progress-reports",
        icon: "ChartSpline",
      },
    ],
  },
  {
    id: "feedback",
    label: "Feedback",
    icon: "MessageSquareText",
    items: [
      {
        label: "Feedback Center",
        href: "/teacher/feedback",
        icon: "MessageSquareText",
      },
      {
        label: "Feedback Templates",
        href: "/teacher/feedback-templates",
        icon: "FileText",
      },
    ],
  },
];

const adminNavGroups: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "LayoutDashboard",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
      { label: "Activity", href: "/admin/activity", icon: "Activity" },
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: "Bell",
        badge: "9",
      },
    ],
  },
  {
    id: "management",
    label: "Management",
    icon: "UsersRound",
    items: [
      { label: "Users", href: "/admin/users", icon: "UsersRound" },
      { label: "Departments", href: "/admin/departments", icon: "Building2" },
      { label: "Courses / Units", href: "/admin/courses", icon: "LibraryBig" },
      { label: "OTHM Units", href: "/admin/othm-units", icon: "FileStack" },
      {
        label: "Roles & Permissions",
        href: "/admin/roles-permissions",
        icon: "KeyRound",
      },
    ],
  },
  {
    id: "academic-work",
    label: "Academic Work",
    icon: "BookOpen",
    items: [
      {
        label: "Assignment Reports",
        href: "/admin/assignments",
        icon: "FileCheck2",
      },
      {
        label: "Lab Classes",
        href: "/admin/lab-management",
        icon: "FlaskConical",
      },
      {
        label: "Lab Reports",
        href: "/admin/lab-reports",
        icon: "ClipboardList",
      },
      { label: "Submissions", href: "/admin/submissions", icon: "Upload" },
      {
        label: "Teacher Feedback",
        href: "/admin/teacher-feedback",
        icon: "MessageSquareText",
      },
    ],
  },
  {
    id: "academic-shield",
    label: "AcademicShield",
    icon: "ShieldCheck",
    items: [
      {
        label: "Plagiarism Checker",
        href: "/admin/academic-shield",
        icon: "ShieldCheck",
      },
      {
        label: "Web Source Scan",
        href: "/admin/web-source-scan",
        icon: "Search",
      },
      {
        label: "AI Writing Risk",
        href: "/admin/ai-writing-risk",
        icon: "ShieldAlert",
      },
      {
        label: "Academic Rewrite",
        href: "/admin/academic-rewrite",
        icon: "FileCheck2",
      },
      {
        label: "Citation Generator",
        href: "/admin/citation-generator",
        icon: "FileStack",
      },
      {
        label: "Originality Reports",
        href: "/admin/originality-reports",
        icon: "ClipboardList",
      },
    ],
  },
  {
    id: "ai-model-settings",
    label: "AI Model Settings",
    icon: "Bot",
    items: [
      { label: "AI Model Settings", href: "/admin/ai-models", icon: "Bot" },
      { label: "Model Routing", href: "/admin/model-routing", icon: "Network" },
      {
        label: "Prompt Policies",
        href: "/admin/prompt-policies",
        icon: "FileText",
      },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: "Files",
    items: [
      { label: "Reports", href: "/admin/reports", icon: "Files" },
      { label: "Analytics", href: "/admin/analytics", icon: "ChartSpline" },
      { label: "Data Hub", href: "/admin/data-hub", icon: "Database" },
      {
        label: "Production Ops",
        href: "/admin/production-ops",
        icon: "ServerCog",
      },
    ],
  },
  {
    id: "system",
    label: "System",
    icon: "Settings2",
    items: [
      { label: "Storage", href: "/admin/documents", icon: "FolderKanban" },
      {
        label: "Security Logs",
        href: "/admin/security-logs",
        icon: "LockKeyhole",
      },
      { label: "Backup", href: "/admin/backup", icon: "ArchiveRestore" },
      { label: "Branding", href: "/admin/branding", icon: "Palette" },
      { label: "Settings", href: "/admin/settings", icon: "Settings2" },
    ],
  },
];

const studentNav = flattenNavGroups(studentNavGroups);
const teacherNav = flattenNavGroups(teacherNavGroups);
const adminNav = flattenNavGroups(adminNavGroups);

export const roleDashboards: Record<AppRole, RoleDashboardData> = {
  student: {
    role: "student",
    eyebrow: "Student Dashboard",
    title: "BITHM academic workspace",
    subtitle:
      "Your academic command center for reports, labs, AI tools and progress.",
    accountEmail: "student@nexora.local",
    nav: studentNav,
    navGroups: studentNavGroups,
    stats: [
      {
        label: "Active assignments",
        value: "3",
        trend: "+1 this week",
        tone: "cyan",
      },
      {
        label: "Live lab sessions",
        value: "2",
        trend: "1 in progress",
        tone: "emerald",
      },
      {
        label: "Pending fixes",
        value: "1",
        trend: "Due in 18h",
        tone: "amber",
      },
      {
        label: "Skill DNA score",
        value: "78",
        trend: "+6 after labs",
        tone: "violet",
      },
    ],
    workflows: [
      {
        label: "Task 1 Report",
        status: "Under Review",
        detail: "Your LO2 and AC 4.3 evidence is waiting for teacher feedback.",
        tone: "cyan",
      },
      {
        label: "JavaScript Form Validation Lab",
        status: "Fix Requested",
        detail:
          "Add checks for empty fields and negative values before resubmitting.",
        tone: "amber",
      },
      {
        label: "Lab Report for Form Validation",
        status: "Draft",
        detail:
          "The objective and tools sections were filled from your lab session.",
        tone: "emerald",
      },
    ],
    activity: [
      "AcademicShield marked the writing risk as medium.",
      "AI Code Doctor explained the JavaScript validation issue.",
      "Task 2 Website/Mobile App Project was added to your portfolio draft.",
    ],
    skillData: [
      { skill: "Frontend", score: 82 },
      { skill: "Backend", score: 68 },
      { skill: "Database", score: 74 },
      { skill: "ML", score: 56 },
      { skill: "Docs", score: 88 },
    ],
  },
  teacher: {
    role: "teacher",
    eyebrow: "Teacher Dashboard",
    title: "Review student work with clearer feedback",
    subtitle:
      "Create briefs, monitor live labs, review submissions and send fix requests with editable AI drafts.",
    accountEmail: "teacher@nexora.local",
    nav: teacherNav,
    navGroups: teacherNavGroups,
    stats: [
      {
        label: "Pending reviews",
        value: "24",
        trend: "7 high priority",
        tone: "amber",
      },
      {
        label: "Active labs",
        value: "4",
        trend: "2 live today",
        tone: "emerald",
      },
      {
        label: "Fix requests sent",
        value: "11",
        trend: "-8% vs last week",
        tone: "cyan",
      },
      {
        label: "Risk alerts",
        value: "5",
        trend: "Needs moderation",
        tone: "rose",
      },
    ],
    workflows: [
      {
        label: "Task 1 Report Batch A",
        status: "Under Review",
        detail: "18 submissions are ready with LO/AC coverage summaries.",
        tone: "cyan",
      },
      {
        label: "JavaScript Form Validation Lab",
        status: "Live",
        detail:
          "12 students are coding now, and 4 still have hidden test failures.",
        tone: "emerald",
      },
      {
        label: "Lab Report Evidence Check",
        status: "Correction Requested",
        detail: "3 reports still need screenshot evidence.",
        tone: "amber",
      },
    ],
    activity: [
      "A feedback draft is ready for the AC 4.3 test plan gap.",
      "Hidden tests found input validation issues for 4 students.",
      "Class analytics updated frontend and documentation progress.",
    ],
    skillData: [
      { skill: "Reviewed", score: 76 },
      { skill: "Passed", score: 64 },
      { skill: "Fixes", score: 28 },
      { skill: "High Risk", score: 12 },
      { skill: "On Time", score: 84 },
    ],
  },
  admin: {
    role: "admin",
    eyebrow: "Admin Dashboard",
    title: "Manage Nexora OS for your institution",
    subtitle:
      "Manage users, departments, courses, OTHM units, AI model settings, storage and AcademicShield.",
    accountEmail: "admin@nexora.local",
    nav: adminNav,
    navGroups: adminNavGroups,
    stats: [
      {
        label: "Active users",
        value: "1,284",
        trend: "+42 this month",
        tone: "emerald",
      },
      {
        label: "Courses / units",
        value: "18",
        trend: "4 OTHM mapped",
        tone: "cyan",
      },
      {
        label: "AI requests",
        value: "8.7k",
        trend: "Local router online",
        tone: "violet",
      },
      {
        label: "Security events",
        value: "9",
        trend: "No critical alerts",
        tone: "amber",
      },
    ],
    workflows: [
      {
        label: "Information Technology Department",
        status: "Ready",
        detail: "Course, batch and sample accounts are ready.",
        tone: "emerald",
      },
      {
        label: "AcademicShield",
        status: "Ready",
        detail: "Internal, fuzzy and semantic checks are available.",
        tone: "violet",
      },
      {
        label: "Institution Data Layer",
        status: "Ready",
        detail:
          "Data Hub tracks snapshots, quality checks, API connections and migration steps.",
        tone: "cyan",
      },
    ],
    activity: [
      "Seeded sample OTHM unit H/650/3385 Web and Mobile Applications.",
      "AI model routing is set to local fallback mode.",
      "Data Hub now shows institution data, exports and database readiness.",
    ],
    skillData: [
      { skill: "Users", score: 92 },
      { skill: "Courses", score: 68 },
      { skill: "Storage", score: 54 },
      { skill: "AI Logs", score: 81 },
      { skill: "Security", score: 72 },
    ],
  },
};

export function isRoleRouteAllowed(role: AppRole, href: string) {
  const normalizedHref =
    href.endsWith("/") && href !== "/" ? href.slice(0, -1) : href;

  return roleDashboards[role].nav.some((item) => {
    const itemHref =
      item.href.endsWith("/") && item.href !== "/"
        ? item.href.slice(0, -1)
        : item.href;
    return (
      normalizedHref === itemHref || normalizedHref.startsWith(`${itemHref}/`)
    );
  });
}

export const allNavItems = Array.from(
  new Map(
    Object.values(roleDashboards)
      .flatMap((dashboard) => dashboard.nav)
      .map((item) => [item.href, item]),
  ).values(),
);
export const modelCatalog = aiModels;
export const accounts = demoAccounts;
export const writingRiskDisclaimer = academicShieldDisclaimer;

export const phaseRoadmap = [
  {
    phase: "Phase 1",
    label: "Foundation",
    status: "Complete",
    detail:
      "Project structure, UI foundation, auth pages, dashboards, Prisma and local AI support.",
  },
  {
    phase: "Phase 2",
    label: "Academic workflows",
    status: "Complete",
    detail:
      "Assignment reports, live labs, lab reports and teacher fix requests.",
  },
  {
    phase: "Phase 3",
    label: "AI tools",
    status: "Complete",
    detail:
      "Project Architect, Code Doctor, Code Lab, Database Visualizer, Slide Maker and Documentation Generator are ready.",
  },
  {
    phase: "Phase 4",
    label: "AcademicShield",
    status: "Complete",
    detail:
      "Similarity checks, source ranking, AI writing advisory and report exports are ready.",
  },
  {
    phase: "Phase 5",
    label: "Production hardening",
    status: "Complete",
    detail:
      "Role permissions, sessions, protected ops APIs, uploads, jobs, audit trail and deployment notes.",
  },
  {
    phase: "Phase 6",
    label: "Institution data layer",
    status: "Complete",
    detail:
      "Data Hub, readiness APIs, quality checks, exports, API connections and database migration steps.",
  },
];
