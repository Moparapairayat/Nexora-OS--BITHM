import { Router } from "express";

import { phase6DataLayerStatus } from "@nexora/config";

import {
  createDataExportPacket,
  getDataReadiness,
  getInstitutionSnapshot,
  listDataQualityChecks,
  runDataQualityCheck,
} from "./data-layer.service.js";
import {
  auditAction,
  requirePermission,
} from "../../middleware/auth.middleware.js";

export const dataRouter = Router();

dataRouter.get(
  "/readiness",
  requirePermission("data:read"),
  auditAction("data.readiness", "institution data layer"),
  (_request, response) => {
    response.json(getDataReadiness());
  },
);

dataRouter.get(
  "/institution-snapshot",
  requirePermission("data:read"),
  auditAction("data.snapshot", "institution data snapshot"),
  (_request, response) => {
    response.json({ snapshot: getInstitutionSnapshot() });
  },
);

dataRouter.get(
  "/quality-checks",
  requirePermission("data:read"),
  auditAction("data.quality-checks", "data quality checks"),
  (_request, response) => {
    response.json({ checks: listDataQualityChecks() });
  },
);

dataRouter.post(
  "/quality-checks/:id/run",
  requirePermission("data:migrate"),
  auditAction("data.quality-check.run", "data quality checks"),
  (request, response) => {
    const checkId = Array.isArray(request.params.id)
      ? request.params.id[0]
      : request.params.id;
    const check = runDataQualityCheck(checkId);

    if (!check) {
      response.status(404).json({ error: "Data quality check not found" });
      return;
    }

    response.json({ check });
  },
);

dataRouter.get(
  "/repositories",
  requirePermission("data:read"),
  auditAction("data.repositories", "data repository boundaries"),
  (_request, response) => {
    response.json({ repositories: phase6DataLayerStatus.repositoryBoundaries });
  },
);

dataRouter.get(
  "/export",
  requirePermission("data:export"),
  auditAction("data.export", "institution data export"),
  (_request, response) => {
    response.json(createDataExportPacket());
  },
);
