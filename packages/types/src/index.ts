export type UserRole = "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export type AssignmentStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "FIX_REQUESTED"
  | "RESUBMITTED"
  | "PASS"
  | "REFER";

export type LabTaskStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "FIX_REQUESTED"
  | "FIXING"
  | "RESUBMITTED"
  | "COMPLETED";

export type LabReportStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "EVIDENCE_CHECK"
  | "CORRECTION_REQUESTED"
  | "RESUBMITTED"
  | "ACCEPTED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type SubmissionDecision =
  | "PASS"
  | "REFER"
  | "ACCEPTED"
  | "FIX_REQUESTED";

export interface DemoAccount {
  role: UserRole;
  name: string;
  email: string;
  password: string;
}

export interface AIModelDescriptor {
  id: string;
  name: string;
  provider: string;
  purpose: string;
  mode: "mock" | "local" | "remote";
}

export interface DashboardMetric {
  label: string;
  value: string;
  trend: string;
  tone: "cyan" | "emerald" | "amber" | "rose" | "violet" | "slate";
}

export interface AcademicFixRequest {
  id: string;
  workflow: "assignment-report" | "live-lab" | "lab-report";
  targetId: string;
  status: "OPEN" | "RESOLVED";
  reason: string;
  aiDraft: string;
  teacherNote: string;
  createdAt: string;
}

export interface AssignmentWorkflow {
  id: string;
  title: string;
  unitCode: string;
  unitTitle: string;
  taskNumber: string;
  scenario: string;
  status: AssignmentStatus;
  wordLimit: number;
  wordCount: number;
  referencingStyle: "Harvard" | "APA" | "IEEE";
  deadline: string;
  learningOutcomes: Array<{
    code: string;
    title: string;
    coverage: number;
    criteria: Array<{
      code: string;
      description: string;
      covered: boolean;
    }>;
  }>;
  checklist: string[];
  evidence: string[];
  originalityScore: number;
  aiWritingRiskScore: number;
  fileName?: string;
  fixRequests: AcademicFixRequest[];
}

export interface LabWorkflow {
  id: string;
  title: string;
  status: LabTaskStatus;
  sessionCode: string;
  sessionStatus: "scheduled" | "live" | "closed";
  startsAt: string;
  durationMinutes: number;
  participants: number;
  task: string;
  language: string;
  deadline: string;
  visibleTests: Array<{
    name: string;
    input: string;
    expected: string;
    passed: boolean;
  }>;
  hiddenTests: Array<{
    name: string;
    passed: boolean;
  }>;
  code: string;
  output: string;
  version: number;
  versionHistory: Array<{
    version: number;
    label: string;
    author: string;
    createdAt: string;
    status: LabTaskStatus;
    summary: string;
    code: string;
    output: string;
  }>;
  fixRequests: AcademicFixRequest[];
}

export interface LabReportWorkflow {
  id: string;
  title: string;
  status: LabReportStatus;
  linkedLabTitle: string;
  objective: string;
  toolsUsed: string;
  implementation: string;
  testingEvidence: string;
  problemsFaced: string;
  solution: string;
  conclusion: string;
  screenshots: string[];
  codeAttachments: string[];
  originalityScore: number;
  aiWritingRiskScore: number;
  fixRequests: AcademicFixRequest[];
}

export interface Phase2WorkflowData {
  assignments: AssignmentWorkflow[];
  labs: LabWorkflow[];
  labReports: LabReportWorkflow[];
}

export interface ProjectArchitectOutput {
  title: string;
  problemStatement: string;
  objectives: string[];
  userRoles: string[];
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  techStack: string[];
  databaseSchema: string[];
  apiRoutes: string[];
  testPlan: string[];
  futureEnhancements: string[];
}

export interface CodeDoctorOutput {
  explanation: string;
  issues: string[];
  fixes: string[];
  refactorNotes: string[];
  securityWarnings: string[];
  complexity: {
    time: string;
    space: string;
  };
  unitTests: string[];
}

export interface CodeRunResult {
  status: "success" | "error";
  language: string;
  output: string;
  diagnostics: string[];
  historyId: string;
  terminal: string[];
  tests: Array<{
    name: string;
    status: "passed" | "failed";
    detail: string;
  }>;
  executionTimeMs: number;
}

export interface CodeLabSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  savedAt: string;
  version: number;
  result?: CodeRunResult;
}

export interface CodeLabVersion {
  id: string;
  snippetId: string;
  title: string;
  language: string;
  code: string;
  result: CodeRunResult;
  createdAt: string;
  version: number;
  summary: string;
}

export interface DiagramEntity {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
    references?: string;
  }>;
}

export interface DiagramOutput {
  entities: DiagramEntity[];
  relationships: string[];
  code: string;
  sourceType?: "dbml" | "sql" | "prisma" | "mongoose";
  exportFormats?: Array<"png" | "svg" | "pdf">;
}

export interface SlideDeckOutput {
  id?: string;
  title: string;
  sourceType?: "project" | "assignment" | "lab-report" | "research";
  audience?: "student" | "teacher" | "admin" | "external";
  template?: "academic" | "technical" | "defense" | "executive";
  durationMinutes?: number;
  slides: Array<{
    id?: string;
    title: string;
    bullets: string[];
    speakerNotes: string;
    layout?: "title" | "bullets" | "split" | "metric" | "closing";
    visualCue?: string;
  }>;
  exportFormats?: Array<"pptx" | "pdf" | "markdown">;
}

export interface SlideDeckExport {
  id: string;
  deckId: string;
  format: "pptx" | "pdf" | "markdown";
  fileName: string;
  content: string;
  createdAt: string;
}

export interface DocumentationOutput {
  id?: string;
  title: string;
  documentType?: "readme" | "api" | "user-manual" | "testing" | "deployment";
  sections: Array<{
    id?: string;
    heading: string;
    body: string;
  }>;
  exportFormats?: Array<"docx" | "pdf" | "markdown">;
  updatedAt?: string;
}

export interface DocumentationExport {
  id: string;
  documentId: string;
  format: "docx" | "pdf" | "markdown";
  fileName: string;
  content: string;
  createdAt: string;
}

export interface MlDatasetPreview {
  id: string;
  name: string;
  rows: number;
  columns: string[];
  previewRows: Array<Record<string, string | number | null>>;
  missingValues: Array<{
    column: string;
    missingCount: number;
    missingPercent: number;
    type: "number" | "category" | "text";
  }>;
  targetColumn: string;
}

export interface MlExperimentResult {
  id: string;
  datasetId: string;
  algorithm: string;
  targetColumn: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  trainingRows: number;
  confusionMatrix: number[][];
  featureImportance: Array<{
    feature: string;
    importance: number;
  }>;
  createdAt: string;
}

export interface MlReportExport {
  id: string;
  fileName: string;
  format: "markdown" | "json";
  content: string;
}

export type AcademicShieldSourceKind =
  | "internal-submission"
  | "lab-report"
  | "web-source"
  | "citation";

export type CitationStatus = "ok" | "partial" | "missing";

export interface AcademicShieldSourceMatch {
  id: string;
  title: string;
  kind: AcademicShieldSourceKind;
  url: string;
  author: string;
  similarity: number;
  fuzzyScore: number;
  semanticScore: number;
  paraphraseScore?: number;
  internalOverlap: number;
  rank: number;
  citationStatus: CitationStatus;
  matchedPhrases: string[];
  originalExcerpt?: string;
  recommendation: string;
}

export interface AcademicShieldHighlight {
  id: string;
  paragraph: number;
  excerpt: string;
  matchedSourceId: string;
  originalPassage?: string;
  severity: RiskLevel;
  reason: string;
  isQuote?: boolean;
  isBibliography?: boolean;
}

export interface AcademicShieldWritingFeature {
  label: string;
  value: string;
  impact: RiskLevel;
}

export interface AcademicShieldSentenceEvaluation {
  index: number;
  text: string;
  wordCount: number;
  aiProbability: number;
  riskLevel: RiskLevel;
  reason: string;
  flaggedFeatures: string[];
}

export interface AcademicShieldWritingRisk {
  id: string;
  score: number;
  riskLevel: RiskLevel;
  confidence: "advisory";
  features: AcademicShieldWritingFeature[];
  sentences?: AcademicShieldSentenceEvaluation[];
  perplexityScore?: number;
  burstinessCv?: number;
  disclaimer: string;
}

export interface AcademicShieldReport {
  id: string;
  title: string;
  checkedAt: string;
  originalityScore: number;
  overallSimilarity: number;
  internalSimilarity: number;
  fuzzySimilarity: number;
  semanticSimilarity: number;
  riskLevel: RiskLevel;
  citationGapCount: number;
  textPreview: string;
  sourceRanking: AcademicShieldSourceMatch[];
  highlightedMatches: AcademicShieldHighlight[];
  writingRisk: AcademicShieldWritingRisk;
  exportFormats: Array<"pdf" | "docx" | "markdown" | "json">;
}

export interface AcademicShieldWebScan {
  id: string;
  url: string;
  title: string;
  checkedAt: string;
  similarity: number;
  semanticScore: number;
  citationStatus: CitationStatus;
  matchedPhrases: string[];
  recommendation: string;
}

export interface AcademicRewriteSuggestion {
  id: string;
  originalText: string;
  rewrittenText: string;
  citationPreservationNotes: string[];
  riskWarnings: string[];
  createdAt: string;
}

export interface CitationRecord {
  id: string;
  style: string;
  sourceTitle: string;
  url: string;
  reference: string;
  inText: string;
  createdAt: string;
}

export interface AcademicShieldExportResult {
  id: string;
  format: "pdf" | "docx" | "markdown" | "json";
  fileName: string;
  content: string;
  availableFormats: Array<"pdf" | "docx" | "markdown" | "json">;
}

export type ProductionServiceState = "healthy" | "degraded" | "offline";
export type BackgroundJobStatus = "queued" | "running" | "completed" | "failed";
export type UploadStatus = "requested" | "uploaded" | "attached" | "rejected";
export type AuditSeverity = "INFO" | "WARN" | "CRITICAL";

export interface PermissionPolicy {
  role: UserRole;
  permissions: string[];
  sessionTtlHours: number;
  protectedAreas: string[];
}

export interface AuditEvent {
  id: string;
  actor: string;
  role: UserRole;
  action: string;
  target: string;
  severity: AuditSeverity;
  createdAt: string;
  ipAddress: string;
}

export interface BackgroundJob {
  id: string;
  name: string;
  queue: "reports" | "academic-shield" | "notifications" | "backups";
  status: BackgroundJobStatus;
  attempts: number;
  scheduledFor: string;
  lastRunAt?: string;
  result?: string;
}

export interface UploadRecord {
  id: string;
  fileName: string;
  ownerEmail: string;
  purpose: "assignment" | "lab-report" | "evidence" | "profile";
  status: UploadStatus;
  storageKey: string;
  maxSizeMb: number;
  createdAt: string;
}

export interface ProductionServiceStatus {
  id: string;
  name: string;
  state: ProductionServiceState;
  uptime: string;
  region: string;
  detail: string;
}

export interface DeploymentChecklistItem {
  id: string;
  label: string;
  status: "complete" | "manual" | "pending";
  owner: "admin" | "devops" | "academic";
  detail: string;
}

export interface ProductionHardeningStatus {
  permissionPolicies: PermissionPolicy[];
  services: ProductionServiceStatus[];
  auditEvents: AuditEvent[];
  backgroundJobs: BackgroundJob[];
  uploads: UploadRecord[];
  deploymentChecklist: DeploymentChecklistItem[];
}

export type DataSourceMode = "memory" | "database" | "hybrid";
export type DataHealthState = "ready" | "needs-attention" | "blocked";
export type DataQualityStatus = "passed" | "warning" | "failed";

export interface InstitutionDataMetric {
  id: string;
  label: string;
  value: number;
  detail: string;
}

export interface InstitutionDataSnapshot {
  id: string;
  sourceMode: DataSourceMode;
  generatedAt: string;
  metrics: InstitutionDataMetric[];
}

export interface DataSourceConnector {
  id: string;
  name: string;
  mode: DataSourceMode;
  state: DataHealthState;
  detail: string;
}

export interface DataQualityCheck {
  id: string;
  label: string;
  scope: string;
  status: DataQualityStatus;
  detail: string;
  owner: "admin" | "teacher" | "devops";
  lastRunAt: string;
}

export interface DataMigrationTask {
  id: string;
  label: string;
  status: "complete" | "manual" | "pending";
  command?: string;
  detail: string;
}

export interface DataRepositoryBoundary {
  id: string;
  workflow: string;
  readModel: string;
  writeModel: string;
  status: "integrated" | "adapter-ready" | "manual";
}

export interface DataExportPacket {
  id: string;
  name: string;
  format: "json" | "csv" | "zip";
  includes: string[];
  generatedAt: string;
}

export interface Phase6DataLayerStatus {
  sourceMode: DataSourceMode;
  snapshot: InstitutionDataSnapshot;
  connectors: DataSourceConnector[];
  qualityChecks: DataQualityCheck[];
  migrationTasks: DataMigrationTask[];
  repositoryBoundaries: DataRepositoryBoundary[];
  exportPackets: DataExportPacket[];
}
