/**
 * Nexora OS — Database Connection & Health Monitor Service
 */

import { prisma } from "@/lib/prisma";
import { DatabaseHealthStatus } from "../types/database.types";

export class DatabaseConnectionService {
  /**
   * Performs a health check against Neon PostgreSQL database.
   */
  public static async checkHealth(): Promise<DatabaseHealthStatus> {
    const startTime = Date.now();
    try {
      // Simple lightweight raw query to test Neon PostgreSQL connectivity
      await prisma.$queryRaw`SELECT 1`;
      const latencyMs = Date.now() - startTime;

      return {
        connected: true,
        provider: "Neon PostgreSQL",
        latencyMs,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      console.error("[DatabaseConnectionService] Health check failed:", err.message);

      return {
        connected: false,
        provider: "Neon PostgreSQL",
        latencyMs,
        error: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
