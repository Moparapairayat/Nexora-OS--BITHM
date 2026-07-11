import { phase5ProductionStatus } from "@nexora/config";
import type {
  AuditEvent,
  BackgroundJob,
  UploadRecord,
  UserRole,
} from "@nexora/types";

const auditEvents: AuditEvent[] = [...phase5ProductionStatus.auditEvents];
const backgroundJobs: BackgroundJob[] = [
  ...phase5ProductionStatus.backgroundJobs,
];
const uploads: UploadRecord[] = [...phase5ProductionStatus.uploads];

function nowIso() {
  return new Date().toISOString();
}

function maxUploadMb() {
  const parsed = Number(process.env.MAX_UPLOAD_MB ?? 25);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 25;
}

export function listAuditEvents() {
  return auditEvents.slice(0, 100);
}

export function recordAuditEvent(input: {
  actor: string;
  role: UserRole;
  action: string;
  target: string;
  severity?: AuditEvent["severity"];
  ipAddress?: string;
}) {
  const event: AuditEvent = {
    id: `audit-${Date.now()}`,
    actor: input.actor,
    role: input.role,
    action: input.action,
    target: input.target,
    severity: input.severity ?? "INFO",
    createdAt: nowIso(),
    ipAddress: input.ipAddress ?? "unknown",
  };

  auditEvents.unshift(event);
  return event;
}

export function listBackgroundJobs() {
  return backgroundJobs;
}

export function enqueueBackgroundJob(input: {
  name: string;
  queue: BackgroundJob["queue"];
}) {
  const job: BackgroundJob = {
    id: `job-${Date.now()}`,
    name: input.name,
    queue: input.queue,
    status: "queued",
    attempts: 0,
    scheduledFor: nowIso(),
  };

  backgroundJobs.unshift(job);
  return job;
}

export function runBackgroundJob(id: string) {
  const job = backgroundJobs.find((item) => item.id === id);

  if (!job) {
    return null;
  }

  job.status = "completed";
  job.attempts += 1;
  job.lastRunAt = nowIso();
  job.result = "Completed in mock production queue.";
  return job;
}

export function listUploads() {
  return uploads;
}

export function findUpload(id: string) {
  return uploads.find((item) => item.id === id) ?? null;
}

export function createUploadIntent(input: {
  fileName: string;
  ownerEmail: string;
  purpose: UploadRecord["purpose"];
}) {
  const safeName = input.fileName.replace(/[^\w.-]+/g, "-").toLowerCase();
  const record: UploadRecord = {
    id: `upload-${Date.now()}`,
    fileName: input.fileName,
    ownerEmail: input.ownerEmail,
    purpose: input.purpose,
    status: "requested",
    storageKey: `uploads/${input.ownerEmail}/${safeName}`,
    maxSizeMb: maxUploadMb(),
    createdAt: nowIso(),
  };

  uploads.unshift(record);
  return record;
}

export function completeUpload(id: string) {
  const upload = uploads.find((item) => item.id === id);

  if (!upload) {
    return null;
  }

  upload.status = "attached";
  return upload;
}
