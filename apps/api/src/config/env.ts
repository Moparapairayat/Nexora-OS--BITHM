import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const configDirectory = dirname(fileURLToPath(import.meta.url));

export const monorepoRoot = resolve(configDirectory, "../../../..");
export const rootEnvPath = resolve(monorepoRoot, ".env");

dotenv.config({ path: rootEnvPath });

const corsOrigins = (
  process.env.CORS_ORIGIN ??
  process.env.WEB_ORIGIN ??
  "http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = Object.freeze({
  port: Number(process.env.PORT ?? 8311),
  corsOrigins,
  aiMode: process.env.AI_MODE ?? "local",
  dataMode: process.env.NEXORA_DATA_MODE ?? "database",
  storageMode: process.env.STORAGE_MODE ?? "local",
});
