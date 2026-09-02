/**
 * Nexora OS — Session verification for this app's own /api/* route handlers.
 *
 * Tokens are issued by apps/api (POST /api/auth/login) and must share the
 * same JWT_SECRET. Mirrors the account-status checks in
 * apps/api/src/middleware/auth.middleware.ts so a deactivated/deleted user
 * loses access here too, even with a still-unexpired token.
 */
import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import type { UserRole } from "@nexora/types";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production.");
  }

  return "dev-only-nexora-secret-change-me";
}

function tokenFromRequest(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

/**
 * Returns the authenticated user, or null if the request has no valid
 * session (missing/invalid/expired token, or an inactive/deleted account).
 * Never throws — callers can treat null as "unauthenticated".
 */
export async function getSessionUser(
  request: NextRequest,
): Promise<SessionUser | null> {
  const token = tokenFromRequest(request);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, jwtSecret()) as { sub: string };

    const account = await prisma.user.findUnique({
      where: { email: decoded.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        deletedAt: true,
      },
    });

    if (!account || account.status !== "ACTIVE" || account.deletedAt) {
      return null;
    }

    return {
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role as UserRole,
    };
  } catch {
    return null;
  }
}

/**
 * Best-effort caller identifier for rate limiting / usage logging on routes
 * that allow anonymous/guest access. Never trusts client-supplied identity —
 * uses the verified session id when present, otherwise the request's network
 * address, so a caller cannot spoof a fresh identifier just by changing a
 * field in the JSON body.
 */
export function getRateLimitIdentifier(
  request: NextRequest,
  sessionUser: SessionUser | null,
): string {
  if (sessionUser) return `user:${sessionUser.id}`;

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  return `ip:${ip}`;
}
