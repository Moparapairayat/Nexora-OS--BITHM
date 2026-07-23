/**
 * Nexora OS — Code Execution Rate Limiter Service
 */

import { EXECUTION_CONFIG } from "../config/execution.config";

interface ExecutionWindow {
  timestamps: number[];
}

export class ExecutionRateLimiterService {
  private static userWindows: Map<string, ExecutionWindow> = new Map();

  public static isAllowed(identifier: string = "anonymous"): { allowed: boolean; retryAfterMs?: number } {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = EXECUTION_CONFIG.rateLimitPerMinute;

    let window = this.userWindows.get(identifier);
    if (!window) {
      window = { timestamps: [] };
      this.userWindows.set(identifier, window);
    }

    // Filter out timestamps older than windowMs
    window.timestamps = window.timestamps.filter((ts) => now - ts < windowMs);

    if (window.timestamps.length >= maxRequests) {
      const oldestTs = window.timestamps[0];
      const retryAfterMs = windowMs - (now - oldestTs);
      return { allowed: false, retryAfterMs };
    }

    window.timestamps.push(now);
    return { allowed: true };
  }
}
