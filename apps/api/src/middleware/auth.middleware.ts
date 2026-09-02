import type { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { phase5ProductionStatus } from "@nexora/config";
import type { UserRole } from "@nexora/types";
import { getPrisma } from "../infrastructure/database/prisma.client.js";
import { recordAuditEvent } from "../modules/ops/ops.store.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    permissions: string[];
  };
}

export interface SessionAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const rolePermissions = new Map(
  phase5ProductionStatus.permissionPolicies.map((policy) => [
    policy.role,
    policy.permissions,
  ]),
);
const superAdminPermissions = Array.from(
  new Set([
    ...phase5ProductionStatus.permissionPolicies.flatMap(
      (policy) => policy.permissions,
    ),
    "admin:manage-users",
    "admin:manage-courses",
    "ops:read",
    "ops:run-jobs",
    "security:read",
    "security:audit",
    "storage:manage",
    "data:read",
    "data:export",
    "data:migrate",
    "settings:write",
  ]),
);

function jwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production.");
  }

  return "dev-only-nexora-secret-change-me";
}

export function permissionsForRole(role: UserRole) {
  if (role === "SUPER_ADMIN") {
    return superAdminPermissions;
  }

  return rolePermissions.get(role) ?? [];
}

export function createSessionToken(account: SessionAccount) {
  const sessionTtlHours =
    phase5ProductionStatus.permissionPolicies.find(
      (policy) => policy.role === account.role,
    )?.sessionTtlHours ?? 8;

  return jwt.sign(
    {
      sub: account.email,
      userId: account.id,
      role: account.role,
      permissions: permissionsForRole(account.role),
    },
    jwtSecret(),
    { expiresIn: `${sessionTtlHours}h` },
  );
}

export const optionalAuth: RequestHandler = async (request, _response, next) => {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    (request as AuthenticatedRequest).user = {
      id: "guest-student-id",
      email: "student@nexora.bithm.edu",
      name: "Guest Student",
      role: "STUDENT",
      permissions: permissionsForRole("STUDENT"),
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, jwtSecret()) as {
      sub: string;
      userId?: string;
      role: UserRole;
      permissions?: string[];
    };
    const account = await getPrisma().user.findUnique({
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

    if (account && account.status === "ACTIVE" && !account.deletedAt) {
      (request as AuthenticatedRequest).user = {
        id: account.id,
        email: account.email,
        name: account.name,
        role: account.role,
        permissions: decoded.permissions ?? permissionsForRole(account.role),
      };
    } else {
      (request as AuthenticatedRequest).user = {
        id: "guest-student-id",
        email: decoded.sub || "student@nexora.bithm.edu",
        name: "Guest Student",
        role: decoded.role || "STUDENT",
        permissions: decoded.permissions ?? permissionsForRole("STUDENT"),
      };
    }
    next();
  } catch {
    (request as AuthenticatedRequest).user = {
      id: "guest-student-id",
      email: "student@nexora.bithm.edu",
      name: "Guest Student",
      role: "STUDENT",
      permissions: permissionsForRole("STUDENT"),
    };
    next();
  }
};

export const requireAuth: RequestHandler = async (request, response, next) => {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    response.status(401).json({ error: "Authentication token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret()) as {
      sub: string;
      userId?: string;
      role: UserRole;
      permissions?: string[];
    };
    const account = await getPrisma().user.findUnique({
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

    if (!account) {
      response.status(401).json({ error: "Session user not found" });
      return;
    }

    if (account.status !== "ACTIVE" || account.deletedAt) {
      response.status(403).json({ error: "Account is not active" });
      return;
    }

    (request as AuthenticatedRequest).user = {
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
      permissions: decoded.permissions ?? permissionsForRole(account.role),
    };
    next();
  } catch {
    response.status(401).json({ error: "Invalid or expired session token" });
  }
};

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (request, response, next) => {
    requireAuth(request, response, () => {
      const user = (request as AuthenticatedRequest).user;

      if (!user || !roles.includes(user.role)) {
        response.status(403).json({ error: "Insufficient role permissions" });
        return;
      }

      next();
    });
  };
}

export function requirePermission(permission: string): RequestHandler {
  return (request, response, next) => {
    requireAuth(request, response, () => {
      const user = (request as AuthenticatedRequest).user;

      if (!user?.permissions.includes(permission)) {
        response
          .status(403)
          .json({ error: "Missing required permission", permission });
        return;
      }

      next();
    });
  };
}

export function auditAction(action: string, target: string): RequestHandler {
  return (request, _response, next) => {
    const user = (request as AuthenticatedRequest).user;

    if (user) {
      recordAuditEvent({
        actor: user.email,
        role: user.role,
        action,
        target,
        ipAddress: request.ip,
      });
    }

    next();
  };
}
