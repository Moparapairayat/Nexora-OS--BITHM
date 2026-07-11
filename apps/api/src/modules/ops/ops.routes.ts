import { Router } from "express";
import { z } from "zod";

import { phase5ProductionStatus } from "@nexora/config";

import {
  enqueueBackgroundJob,
  listAuditEvents,
  listBackgroundJobs,
  runBackgroundJob,
} from "./ops.store.js";
import {
  auditAction,
  requirePermission,
  requireRole,
} from "../../middleware/auth.middleware.js";

export const opsRouter = Router();

const jobSchema = z.object({
  name: z.string().min(3),
  queue: z.enum(["reports", "academic-shield", "notifications", "backups"]),
});

opsRouter.get(
  "/readiness",
  requirePermission("ops:read"),
  auditAction("ops.readiness", "production readiness"),
  (_request, response) => {
    const blockingItems = phase5ProductionStatus.deploymentChecklist.filter(
      (item) => item.status !== "complete",
    );

    response.json({
      ready: blockingItems.length === 0,
      mode: process.env.AI_MODE ?? "mock",
      storageMode: process.env.STORAGE_MODE ?? "local",
      blockingItems,
    });
  },
);

opsRouter.get(
  "/status",
  requirePermission("ops:read"),
  auditAction("ops.status", "service status"),
  (_request, response) => {
    response.json({
      services: phase5ProductionStatus.services,
      checklist: phase5ProductionStatus.deploymentChecklist,
      generatedAt: new Date().toISOString(),
    });
  },
);

opsRouter.get(
  "/audit",
  requirePermission("security:audit"),
  auditAction("ops.audit", "audit trail"),
  (_request, response) => {
    response.json({ events: listAuditEvents() });
  },
);

opsRouter.get(
  "/jobs",
  requirePermission("ops:read"),
  auditAction("ops.jobs", "background jobs"),
  (_request, response) => {
    response.json({ jobs: listBackgroundJobs() });
  },
);

opsRouter.post(
  "/jobs",
  requirePermission("ops:run-jobs"),
  auditAction("ops.jobs.enqueue", "background jobs"),
  (request, response) => {
    const parsed = jobSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    response.status(201).json({ job: enqueueBackgroundJob(parsed.data) });
  },
);

opsRouter.post(
  "/jobs/:id/run",
  requirePermission("ops:run-jobs"),
  auditAction("ops.jobs.run", "background jobs"),
  (request, response) => {
    const jobId = Array.isArray(request.params.id)
      ? request.params.id[0]
      : request.params.id;
    const job = runBackgroundJob(jobId);

    if (!job) {
      response.status(404).json({ error: "Background job not found" });
      return;
    }

    response.json({ job });
  },
);

opsRouter.get(
  "/deployment-checklist",
  requireRole("ADMIN"),
  auditAction("ops.deployment-checklist", "deployment checklist"),
  (_request, response) => {
    response.json({ checklist: phase5ProductionStatus.deploymentChecklist });
  },
);
