import { phase6DataLayerStatus } from "@nexora/config";
import type {
  DataQualityCheck,
  DataSourceMode,
  InstitutionDataSnapshot,
} from "@nexora/types";

const qualityChecks: DataQualityCheck[] = [
  ...phase6DataLayerStatus.qualityChecks,
];

function nowIso() {
  return new Date().toISOString();
}

function configuredDataMode(): DataSourceMode {
  const mode = process.env.NEXORA_DATA_MODE;

  if (mode === "database" || mode === "hybrid") {
    return mode;
  }

  return "memory";
}

export function getInstitutionSnapshot(): InstitutionDataSnapshot {
  return {
    ...phase6DataLayerStatus.snapshot,
    id: "runtime-institution-snapshot",
    sourceMode: configuredDataMode(),
    generatedAt: nowIso(),
    metrics: phase6DataLayerStatus.snapshot.metrics.map((item) => ({
      ...item,
    })),
  };
}

export function getDataReadiness() {
  const mode = configuredDataMode();
  const databaseUrlConfigured = Boolean(process.env.DATABASE_URL);
  const databaseModeReady = mode === "memory" || databaseUrlConfigured;

  return {
    ready: databaseModeReady,
    mode,
    databaseUrlConfigured,
    exportMode: process.env.DATA_EXPORT_MODE ?? "memory-json",
    syncStrategy: process.env.DATA_SYNC_STRATEGY ?? "manual-admin",
    blockers: databaseModeReady
      ? []
      : [
          "DATABASE_URL is required when NEXORA_DATA_MODE is database or hybrid.",
        ],
  };
}

export function listDataQualityChecks() {
  return qualityChecks;
}

export function runDataQualityCheck(id: string) {
  const check = qualityChecks.find((item) => item.id === id);

  if (!check) {
    return null;
  }

  check.lastRunAt = nowIso();

  if (check.id === "database-mode") {
    check.status = getDataReadiness().ready ? "passed" : "warning";
  }

  return check;
}

export function createDataExportPacket() {
  return {
    packet: phase6DataLayerStatus.exportPackets[0],
    snapshot: getInstitutionSnapshot(),
    repositories: phase6DataLayerStatus.repositoryBoundaries,
    qualityChecks,
  };
}
