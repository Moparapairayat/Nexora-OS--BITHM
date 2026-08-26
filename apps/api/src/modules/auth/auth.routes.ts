import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";

import {
  createSessionToken,
  permissionsForRole,
  requireAuth,
  type AuthenticatedRequest,
  type SessionAccount,
} from "../../middleware/auth.middleware.js";
import { recordAuditEvent } from "../ops/ops.store.js";
import { getPrisma } from "../../infrastructure/database/prisma.client.js";

export const authRouter = Router();
export const usersRouter = Router();

const credentialsSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8),
});

// Precomputed dummy bcrypt hash to protect against timing attacks for non-existent users
const DUMMY_HASH =
  "$2a$12$e8qR551w7QhN9eK6z8j4.eM9/6N2OQ58kE3Wd7hQo0z4q2Y1K2L3O";

function toSessionAccount(user: {
  id: string;
  name: string;
  email: string;
  role: SessionAccount["role"];
}): SessionAccount {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

authRouter.post("/login", async (request, response) => {
  const parsed = credentialsSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim();

  const user = await getPrisma().user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
      status: true,
      deletedAt: true,
    },
  });

  if (!user) {
    // Perform dummy comparison to equalize response time and prevent user enumeration
    await bcrypt.compare(parsed.data.password, DUMMY_HASH);
    response.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const passwordValid = await bcrypt.compare(
    parsed.data.password,
    user.passwordHash,
  );

  if (!passwordValid) {
    response.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (user.status !== "ACTIVE" || user.deletedAt) {
    response.status(403).json({ error: "Account is not active" });
    return;
  }

  const account = toSessionAccount(user);

  recordAuditEvent({
    actor: account.email,
    role: account.role,
    action: "auth.login",
    target: "session",
    ipAddress: request.ip,
  });

  response.json({
    user: account,
    permissions: permissionsForRole(account.role),
    token: createSessionToken(account),
  });
});

authRouter.post("/refresh", requireAuth, (request, response) => {
  const user = (request as AuthenticatedRequest).user;

  if (!user) {
    response.status(401).json({ error: "Session user not found" });
    return;
  }

  response.json({
    user,
    permissions: user.permissions,
    token: createSessionToken(user),
  });
});

authRouter.post("/logout", requireAuth, (request, response) => {
  const user = (request as AuthenticatedRequest).user;

  if (user) {
    recordAuditEvent({
      actor: user.email,
      role: user.role,
      action: "auth.logout",
      target: "session",
      ipAddress: request.ip,
    });
  }

  response.json({ ok: true });
});

authRouter.all("/register", (_request, response) => {
  response.status(410).json({
    error:
      "Public registration is disabled. User accounts are managed by admin.",
  });
});

usersRouter.get("/me", requireAuth, (request, response) => {
  const user = (request as AuthenticatedRequest).user;

  response.json({
    user,
    permissions: user?.permissions ?? [],
  });
});
