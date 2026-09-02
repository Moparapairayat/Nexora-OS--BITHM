import { randomUUID } from "node:crypto";

import { phase5ProductionStatus } from "@nexora/config";
import type {
  AuditEvent,
  BackgroundJob,
  UploadRecord,
  UserRole,
} from "@nexora/types";

import { getPrisma } from "../../infrastructure/database/prisma.client.js";

const backgroundJobs: BackgroundJob[] = [
  ...phase5ProductionStatus.backgroundJobs,
];
const uploads: UploadRecord[] = [...phase5ProductionStatus.uploads];

// Fallback seed data, used only if the SystemLog table is empty (fresh DB) so
// the audit view isn't blank before any real events have been recorded.
const seedAuditEvents: AuditEvent[] = [...phase5ProductionStatus.auditEvents];

function nowIso() {
  return new Date().toISOString();
}

function maxUploadMb() {
  const parsed = Number(process.env.MAX_UPLOAD_MB ?? 25);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 25;
}

export async function listAuditEvents(): Promise<AuditEvent[]> {
  try {
    const rows = await getPrisma().systemLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    if (rows.length === 0) {
      return seedAuditEvents.slice(0, 100);
    }

    return rows.map((row) => {
      const metadata = (row.metadata as Record<string, unknown> | null) ?? {};

      return {
        id: row.id,
        actor: typeof metadata.actor === "string" ? metadata.actor : "unknown",
        role: (metadata.role as UserRole) ?? "STUDENT",
        action: row.event,
        target: typeof metadata.target === "string" ? metadata.target : "",
        severity: (row.level as AuditEvent["severity"]) ?? "INFO",
        createdAt: row.createdAt.toISOString(),
        ipAddress:
          typeof metadata.ipAddress === "string" ? metadata.ipAddress : "unknown",
      };
    });
  } catch (error) {
    console.error("[ops.store] Failed to read audit log from database:", error);
    return seedAuditEvents.slice(0, 100);
  }
}

export function recordAuditEvent(input: {
  actor: string;
  role: UserRole;
  action: string;
  target: string;
  severity?: AuditEvent["severity"];
  ipAddress?: string;
  actorId?: string;
}) {
  const event: AuditEvent = {
    id: randomUUID(),
    actor: input.actor,
    role: input.role,
    action: input.action,
    target: input.target,
    severity: input.severity ?? "INFO",
    createdAt: nowIso(),
    ipAddress: input.ipAddress ?? "unknown",
  };

  // Persist for durability across restarts/instances; never let a logging
  // failure break the request that triggered it.
  getPrisma()
    .systemLog.create({
      data: {
        level: event.severity,
        event: event.action,
        actorId: input.actorId,
        metadata: {
          actor: event.actor,
          role: event.role,
          target: event.target,
          ipAddress: event.ipAddress,
        },
      },
    })
    .catch((error) => {
      console.error("[ops.store] Failed to persist audit event:", error);
    });

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
    id: `job-${randomUUID()}`,
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
    id: `upload-${randomUUID()}`,
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
