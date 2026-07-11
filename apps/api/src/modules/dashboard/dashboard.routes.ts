import { Router } from "express";

import { getPrisma } from "../../infrastructure/database/prisma.client.js";
import {
  requireAuth,
  type AuthenticatedRequest,
} from "../../middleware/auth.middleware.js";

export const dashboardRouter = Router();

const toneByIndex = ["cyan", "emerald", "amber", "violet", "rose"] as const;

dashboardRouter.get("/:role", requireAuth, async (request, response) => {
  const roleParam = request.params.role;
  const role = Array.isArray(roleParam) ? roleParam[0] : roleParam;

  if (!["student", "teacher", "admin"].includes(role)) {
    response.status(404).json({ error: "Dashboard role not found" });
    return;
  }

  const user = (request as AuthenticatedRequest).user;
  const allowedRoles =
    role === "student"
      ? ["STUDENT", "ADMIN", "SUPER_ADMIN"]
      : role === "teacher"
        ? ["TEACHER", "ADMIN", "SUPER_ADMIN"]
        : ["ADMIN", "SUPER_ADMIN"];

  if (!user || !allowedRoles.includes(user.role)) {
    response.status(403).json({ error: "Dashboard role access denied" });
    return;
  }

  const [
    users,
    assignments,
    assignmentSubmissions,
    pendingFixes,
    labs,
    labSubmissions,
    labReports,
    plagiarismReports,
    aiRequests,
    skillScores,
  ] = await Promise.all([
    getPrisma().user.count(),
    getPrisma().assignmentBrief.count(),
    getPrisma().assignmentSubmission.count(),
    getPrisma().fixRequest.count({ where: { status: "OPEN" } }),
    getPrisma().labSession.count(),
    getPrisma().labSubmission.count(),
    getPrisma().labReport.count(),
    getPrisma().plagiarismReport.count(),
    getPrisma().aIRequestLog.count(),
    getPrisma().skillScore.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: { category: true, score: true },
    }),
  ]);

  const studentStats = [
    {
      label: "Assignment briefs",
      value: `${assignments}`,
      trend: "From database",
      tone: "cyan",
    },
    {
      label: "Lab submissions",
      value: `${labSubmissions}`,
      trend: "Saved runs",
      tone: "emerald",
    },
    {
      label: "Open fixes",
      value: `${pendingFixes}`,
      trend: "Action required",
      tone: "amber",
    },
    {
      label: "Skill records",
      value: `${skillScores.length}`,
      trend: "Portfolio linked",
      tone: "violet",
    },
  ];
  const teacherStats = [
    {
      label: "Pending reviews",
      value: `${assignmentSubmissions + labReports}`,
      trend: "Database queue",
      tone: "amber",
    },
    {
      label: "Lab sessions",
      value: `${labs}`,
      trend: "Live records",
      tone: "emerald",
    },
    {
      label: "Fix requests",
      value: `${pendingFixes}`,
      trend: "Open",
      tone: "cyan",
    },
    {
      label: "Risk reports",
      value: `${plagiarismReports}`,
      trend: "AcademicShield",
      tone: "rose",
    },
  ];
  const adminStats = [
    { label: "Users", value: `${users}`, trend: "Postgres", tone: "emerald" },
    {
      label: "Assignment submissions",
      value: `${assignmentSubmissions}`,
      trend: "Workflow data",
      tone: "cyan",
    },
    {
      label: "AI requests",
      value: `${aiRequests}`,
      trend: "Logged model calls",
      tone: "violet",
    },
    {
      label: "Lab reports",
      value: `${labReports}`,
      trend: "Evidence records",
      tone: "amber",
    },
  ];
  const workflows = [
    {
      label: "Assignment workflow",
      status: `${assignmentSubmissions} submissions`,
      detail: `${assignments} assignment briefs are available in the database.`,
      tone: "cyan",
    },
    {
      label: "LiveLab workflow",
      status: `${labs} sessions`,
      detail: `${labSubmissions} code submissions have been stored.`,
      tone: "emerald",
    },
    {
      label: "AcademicShield workflow",
      status: `${plagiarismReports} reports`,
      detail: `${pendingFixes} open fix requests require follow-up.`,
      tone: "amber",
    },
  ];
  const activity = [
    `Database mode active at ${new Date().toISOString()}.`,
    `${users} users and ${aiRequests} AI requests are persisted.`,
    `${assignmentSubmissions + labSubmissions + labReports} academic workflow records are available.`,
  ];
  const skillData =
    skillScores.length > 0
      ? skillScores.map((item, index) => ({
          skill: item.category,
          score: item.score,
          tone: toneByIndex[index % toneByIndex.length],
        }))
      : [
          { skill: "Assignments", score: assignmentSubmissions, tone: "cyan" },
          { skill: "Labs", score: labSubmissions, tone: "emerald" },
          { skill: "Reports", score: labReports, tone: "amber" },
          { skill: "AI Logs", score: aiRequests, tone: "violet" },
        ];

  response.json({
    role,
    source: "postgres-prisma",
    syncedAt: new Date().toISOString(),
    stats:
      role === "admin"
        ? adminStats
        : role === "teacher"
          ? teacherStats
          : studentStats,
    workflows,
    activity,
    skillData,
  });
});
