import bcrypt from "bcryptjs";
import { Prisma, type UserRole, type UserStatus } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { Router, type Response } from "express";
import { z } from "zod";

import { getPrisma } from "../../infrastructure/database/prisma.client.js";
import {
  requireRole,
  type AuthenticatedRequest,
} from "../../middleware/auth.middleware.js";
import { recordAuditEvent } from "../ops/ops.store.js";

export const adminRouter = Router();

adminRouter.use(requireRole("ADMIN", "SUPER_ADMIN"));

const adminAssignableRoles = ["STUDENT", "TEACHER", "ADMIN"] as const;
const userStatuses = ["ACTIVE", "INACTIVE"] as const;

const nullableIdSchema = z
  .union([z.string().min(1), z.literal(""), z.null()])
  .optional()
  .transform((value) => (value ? value : null));

const departmentSchema = z.object({
  name: z.string().trim().min(2),
  code: z.string().trim().min(2).optional(),
});

const courseSchema = z.object({
  title: z.string().trim().min(2),
  code: z.string().trim().min(2).optional(),
  departmentId: z.string().min(1),
});

const userCreateSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).optional(),
  role: z.enum(adminAssignableRoles).default("STUDENT"),
  status: z.enum(userStatuses).default("ACTIVE"),
  departmentId: nullableIdSchema,
  courseId: nullableIdSchema,
  unitId: nullableIdSchema,
  batchId: nullableIdSchema,
});

const userUpdateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  departmentId: nullableIdSchema,
  courseId: nullableIdSchema,
  unitId: nullableIdSchema,
  batchId: nullableIdSchema,
});

const userStatusSchema = z.object({
  status: z.enum(userStatuses),
});

const userRoleSchema = z.object({
  role: z.enum(adminAssignableRoles),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8).optional(),
});

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  departmentId: true,
  courseId: true,
  unitId: true,
  batchId: true,
  department: {
    select: { id: true, name: true, code: true },
  },
  course: {
    select: { id: true, title: true, code: true },
  },
  unit: {
    select: { id: true, title: true, code: true },
  },
  batch: {
    select: { id: true, name: true },
  },
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.UserSelect;

function actorFrom(request: AuthenticatedRequest) {
  return request.user;
}

function audit(request: AuthenticatedRequest, action: string, target: string) {
  const actor = actorFrom(request);

  if (!actor) {
    return;
  }

  recordAuditEvent({
    actor: actor.email,
    role: actor.role,
    action,
    target,
    ipAddress: request.ip,
  });
}

function generatedPassword() {
  return `Nexora-${randomBytes(4).toString("hex")}`;
}

function normalizeRole(value: unknown): UserRole | undefined {
  const role = String(value ?? "").toUpperCase();

  return adminAssignableRoles.includes(
    role as (typeof adminAssignableRoles)[number],
  )
    ? (role as UserRole)
    : undefined;
}

function normalizeStatus(value: unknown): UserStatus | undefined {
  const status = String(value ?? "").toUpperCase();

  return ["ACTIVE", "INACTIVE", "DELETED"].includes(status)
    ? (status as UserStatus)
    : undefined;
}

function sendPrismaError(response: Response, error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      response
        .status(409)
        .json({ error: "A user already exists for this email." });
      return;
    }

    if (error.code === "P2003") {
      response
        .status(400)
        .json({ error: "One of the selected records does not exist." });
      return;
    }
  }

  response.status(500).json({ error: "Admin user operation failed." });
}

async function findManageableUser(id: string) {
  return getPrisma().user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      deletedAt: true,
    },
  });
}

async function assertCanRemoveAdminAccess(
  response: Response,
  targetId: string,
  action: "deactivate" | "delete" | "change-role",
) {
  const target = await findManageableUser(targetId);

  if (!target || target.deletedAt || target.status === "DELETED") {
    response.status(404).json({ error: "User not found." });
    return false;
  }

  const targetIsActiveAdmin =
    (target.role === "ADMIN" || target.role === "SUPER_ADMIN") &&
    target.status === "ACTIVE";

  if (!targetIsActiveAdmin) {
    return true;
  }

  const activeAdminCount = await getPrisma().user.count({
    where: {
      role: { in: ["ADMIN", "SUPER_ADMIN"] },
      status: "ACTIVE",
      deletedAt: null,
    },
  });

  if (activeAdminCount <= 1) {
    response.status(400).json({
      error: `Cannot ${action} the last active admin account.`,
    });
    return false;
  }

  return true;
}

function assertNotSelfDestructive(
  request: AuthenticatedRequest,
  response: Response,
  targetId: string,
  action: string,
) {
  const actor = actorFrom(request);

  if (actor?.id !== targetId) {
    return true;
  }

  response
    .status(400)
    .json({ error: `Admins cannot ${action} their own account.` });
  return false;
}

adminRouter.get("/departments", async (_request, response) => {
  const departments = await getPrisma().department.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true },
  });

  response.json({ departments });
});

adminRouter.post("/departments", async (request, response) => {
  const parsed = departmentSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const department = await getPrisma().department.create({
    data: parsed.data,
  });

  audit(
    request as AuthenticatedRequest,
    "admin.department.create",
    department.id,
  );
  response.status(201).json({ department });
});

adminRouter.get("/courses", async (_request, response) => {
  const courses = await getPrisma().course.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      code: true,
      departmentId: true,
      department: { select: { id: true, name: true, code: true } },
    },
  });

  response.json({ courses });
});

adminRouter.post("/courses", async (request, response) => {
  const parsed = courseSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const course = await getPrisma().course.create({
    data: parsed.data,
  });

  audit(request as AuthenticatedRequest, "admin.course.create", course.id);
  response.status(201).json({ course });
});

adminRouter.get("/units", async (_request, response) => {
  const units = await getPrisma().othmUnit.findMany({
    orderBy: [{ code: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      code: true,
      courseId: true,
      course: { select: { id: true, title: true, code: true } },
    },
  });

  response.json({ units });
});

adminRouter.get("/batches", async (_request, response) => {
  const batches = await getPrisma().batch.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      departmentId: true,
      courseId: true,
      department: { select: { id: true, name: true, code: true } },
      course: { select: { id: true, title: true, code: true } },
    },
  });

  response.json({ batches });
});

adminRouter.get("/users", async (request, response) => {
  const search =
    typeof request.query.search === "string" ? request.query.search.trim() : "";
  const role = normalizeRole(request.query.role);
  const status = normalizeStatus(request.query.status);

  const where: Prisma.UserWhereInput = {};

  if (status) {
    where.status = status;
  } else {
    where.status = { in: ["ACTIVE", "INACTIVE"] };
    where.deletedAt = null;
  }

  if (role) {
    where.role = role;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total, activeAdmins] = await Promise.all([
    getPrisma().user.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      select: userSelect,
    }),
    getPrisma().user.count({ where }),
    getPrisma().user.count({
      where: {
        role: { in: ["ADMIN", "SUPER_ADMIN"] },
        status: "ACTIVE",
        deletedAt: null,
      },
    }),
  ]);

  response.json({ users, total, activeAdmins });
});

adminRouter.post("/users", async (request, response) => {
  const parsed = userCreateSchema.safeParse({
    ...request.body,
    role: String(request.body?.role ?? "STUDENT").toUpperCase(),
    status: String(request.body?.status ?? "ACTIVE").toUpperCase(),
  });

  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const temporaryPassword = parsed.data.password ?? generatedPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  try {
    const user = await getPrisma().user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: parsed.data.role,
        status: parsed.data.status,
        departmentId: parsed.data.departmentId,
        courseId: parsed.data.courseId,
        unitId: parsed.data.unitId,
        batchId: parsed.data.batchId,
      },
      select: userSelect,
    });

    audit(request as AuthenticatedRequest, "admin.user.create", user.id);

    response.status(201).json({
      user,
      temporaryPassword: parsed.data.password ? undefined : temporaryPassword,
      temporaryPasswordGenerated: !parsed.data.password,
    });
  } catch (error) {
    sendPrismaError(response, error);
  }
});

adminRouter.get("/users/:id", async (request, response) => {
  const user = await getPrisma().user.findUnique({
    where: { id: request.params.id },
    select: userSelect,
  });

  if (!user || user.deletedAt || user.status === "DELETED") {
    response.status(404).json({ error: "User not found." });
    return;
  }

  response.json({ user });
});

adminRouter.patch("/users/:id", async (request, response) => {
  const parsed = userUpdateSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await findManageableUser(request.params.id);

  if (!existing || existing.deletedAt || existing.status === "DELETED") {
    response.status(404).json({ error: "User not found." });
    return;
  }

  try {
    const user = await getPrisma().user.update({
      where: { id: request.params.id },
      data: parsed.data,
      select: userSelect,
    });

    audit(request as AuthenticatedRequest, "admin.user.update", user.id);
    response.json({ user });
  } catch (error) {
    sendPrismaError(response, error);
  }
});

adminRouter.patch("/users/:id/status", async (request, response) => {
  const parsed = userStatusSchema.safeParse({
    status: String(request.body?.status ?? "").toUpperCase(),
  });

  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (
    parsed.data.status !== "ACTIVE" &&
    !assertNotSelfDestructive(
      request as AuthenticatedRequest,
      response,
      request.params.id,
      "deactivate",
    )
  ) {
    return;
  }

  if (
    parsed.data.status !== "ACTIVE" &&
    !(await assertCanRemoveAdminAccess(
      response,
      request.params.id,
      "deactivate",
    ))
  ) {
    return;
  }

  const user = await getPrisma().user.update({
    where: { id: request.params.id },
    data: { status: parsed.data.status, deletedAt: null },
    select: userSelect,
  });

  audit(request as AuthenticatedRequest, "admin.user.status", user.id);
  response.json({ user });
});

adminRouter.patch("/users/:id/role", async (request, response) => {
  const parsed = userRoleSchema.safeParse({
    role: String(request.body?.role ?? "").toUpperCase(),
  });

  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await findManageableUser(request.params.id);

  if (!existing || existing.deletedAt || existing.status === "DELETED") {
    response.status(404).json({ error: "User not found." });
    return;
  }

  const removesAdminAccess =
    (existing.role === "ADMIN" || existing.role === "SUPER_ADMIN") &&
    parsed.data.role !== "ADMIN";

  if (
    removesAdminAccess &&
    !assertNotSelfDestructive(
      request as AuthenticatedRequest,
      response,
      request.params.id,
      "change the role of",
    )
  ) {
    return;
  }

  if (
    removesAdminAccess &&
    !(await assertCanRemoveAdminAccess(
      response,
      request.params.id,
      "change-role",
    ))
  ) {
    return;
  }

  const user = await getPrisma().user.update({
    where: { id: request.params.id },
    data: { role: parsed.data.role },
    select: userSelect,
  });

  audit(request as AuthenticatedRequest, "admin.user.role", user.id);
  response.json({ user });
});

adminRouter.post("/users/:id/reset-password", async (request, response) => {
  const parsed = resetPasswordSchema.safeParse(request.body ?? {});

  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await findManageableUser(request.params.id);

  if (!existing || existing.deletedAt || existing.status === "DELETED") {
    response.status(404).json({ error: "User not found." });
    return;
  }

  const temporaryPassword = parsed.data.password ?? generatedPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);
  const user = await getPrisma().user.update({
    where: { id: request.params.id },
    data: { passwordHash },
    select: userSelect,
  });

  audit(request as AuthenticatedRequest, "admin.user.reset-password", user.id);
  response.json({
    user,
    temporaryPassword: parsed.data.password ? undefined : temporaryPassword,
    temporaryPasswordGenerated: !parsed.data.password,
  });
});

adminRouter.delete("/users/:id", async (request, response) => {
  if (
    !assertNotSelfDestructive(
      request as AuthenticatedRequest,
      response,
      request.params.id,
      "delete",
    )
  ) {
    return;
  }

  if (
    !(await assertCanRemoveAdminAccess(response, request.params.id, "delete"))
  ) {
    return;
  }

  const user = await getPrisma().user.update({
    where: { id: request.params.id },
    data: { status: "DELETED", deletedAt: new Date() },
    select: userSelect,
  });

  audit(request as AuthenticatedRequest, "admin.user.delete", user.id);
  response.json({ user, deleted: true });
});

adminRouter.get("/analytics", async (_request, response) => {
  const [
    users,
    departments,
    courses,
    activeLabs,
    aiRequests,
    assignmentSubmissions,
    labReports,
  ] = await Promise.all([
    getPrisma().user.count({ where: { status: "ACTIVE", deletedAt: null } }),
    getPrisma().department.count(),
    getPrisma().course.count(),
    getPrisma().labSession.count({
      where: { status: { in: ["IN_PROGRESS", "UNDER_REVIEW"] } },
    }),
    getPrisma().aIRequestLog.count(),
    getPrisma().assignmentSubmission.count(),
    getPrisma().labReport.count(),
  ]);

  response.json({
    users,
    departments,
    courses,
    activeLabs,
    aiRequests,
    assignmentSubmissions,
    labReports,
  });
});
