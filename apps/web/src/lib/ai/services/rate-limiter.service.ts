/**
 * Nexora OS — In-Memory Rate Limiter Service
 */

import { AI_CONFIG } from "../configuration/ai.config";

interface RequestWindow {
  timestamps: number[];
}

export class RateLimiterService {
  private static userWindows: Map<string, RequestWindow> = new Map();

  public static isAllowed(identifier: string = "anonymous"): { allowed: boolean; retryAfterMs?: number } {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = AI_CONFIG.security.rateLimitRequestsPerMin;

    let window = this.userWindows.get(identifier);
    if (!window) {
      window = { timestamps: [] };
      this.userWindows.set(identifier, window);
    }

    // Filter out timestamps outside the 1-minute window
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
