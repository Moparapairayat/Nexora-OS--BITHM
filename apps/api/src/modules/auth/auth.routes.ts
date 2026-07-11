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
  email: z.string().email(),
  password: z.string().min(8),
});

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

  const user = await getPrisma().user.findUnique({
    where: { email: parsed.data.email },
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
