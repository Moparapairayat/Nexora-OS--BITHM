import { Router } from "express";
import { z } from "zod";

import {
  completeUpload,
  createUploadIntent,
  findUpload,
  listUploads,
  recordAuditEvent,
} from "../ops/ops.store.js";
import {
  requireAuth,
  requirePermission,
  type AuthenticatedRequest,
} from "../../middleware/auth.middleware.js";

export const uploadsRouter = Router();

const uploadIntentSchema = z.object({
  fileName: z.string().min(3),
  purpose: z.enum(["assignment", "lab-report", "evidence", "profile"]),
});

uploadsRouter.get("/", requirePermission("storage:manage"), (_request, response) => {
  response.json({ uploads: listUploads() });
});

uploadsRouter.post("/intent", requireAuth, (request, response) => {
  const parsed = uploadIntentSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const user = (request as AuthenticatedRequest).user;

  if (!user) {
    response.status(401).json({ error: "Authentication token required" });
    return;
  }

  if (
    !user.permissions.includes("uploads:create-own") &&
    !user.permissions.includes("storage:manage")
  ) {
    response.status(403).json({ error: "Missing upload permission" });
    return;
  }

  const upload = createUploadIntent({
    ...parsed.data,
    ownerEmail: user.email,
  });

  recordAuditEvent({
    actor: user.email,
    role: user.role,
    action: "upload.intent",
    target: upload.fileName,
    ipAddress: request.ip,
  });

  response.status(201).json({
    upload,
    uploadUrl: `/api/uploads/${upload.id}/complete`,
    storageMode: process.env.STORAGE_MODE ?? "local",
  });
});

uploadsRouter.post("/:id/complete", requireAuth, (request, response) => {
  const user = (request as AuthenticatedRequest).user;
  const uploadId = Array.isArray(request.params.id)
    ? request.params.id[0]
    : request.params.id;
  const existingUpload = findUpload(uploadId);

  if (!existingUpload) {
    response.status(404).json({ error: "Upload record not found" });
    return;
  }

  if (
    user &&
    existingUpload.ownerEmail !== user.email &&
    !user.permissions.includes("storage:manage")
  ) {
    response.status(403).json({ error: "Upload ownership check failed" });
    return;
  }

  const upload = completeUpload(uploadId);

  if (!upload) {
    response.status(404).json({ error: "Upload record not found" });
    return;
  }

  if (user) {
    recordAuditEvent({
      actor: user.email,
      role: user.role,
      action: "upload.complete",
      target: upload.fileName,
      ipAddress: request.ip,
    });
  }

  response.json({ upload });
});
