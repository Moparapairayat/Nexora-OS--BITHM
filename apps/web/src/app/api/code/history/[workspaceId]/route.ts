/**
 * Nexora OS — Code Workspace Execution History API Endpoint
 * GET /api/code/history/[workspaceId]
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";

const REVIEWER_ROLES = new Set(["TEACHER", "ADMIN", "SUPER_ADMIN"]);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> | { workspaceId: string } }
) {
  try {
    const resolvedParams = await params;
    const workspaceId = typeof resolvedParams === "object" ? resolvedParams?.workspaceId : undefined;

    if (!workspaceId) {
      return NextResponse.json({ success: false, runs: [] }, { status: 400 });
    }

    const sessionUser = await getSessionUser(req);

    if (!sessionUser) {
      return NextResponse.json(
        { success: false, runs: [], message: "Authentication required." },
        { status: 401 }
      );
    }

    const workspace = await prisma.codeWorkspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    const isOwner = workspace?.ownerId === sessionUser.id;
    const isReviewer = REVIEWER_ROLES.has(sessionUser.role);

    if (!workspace || (!isOwner && !isReviewer)) {
      return NextResponse.json({ success: true, runs: [] }, { status: 200 });
    }

    const runs = await prisma.codeRun.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 25,
      include: {
        testResults: true,
      },
    });

    return NextResponse.json({ success: true, runs }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    console.warn("[API /api/code/history] Non-critical exception fetching runs:", message);
    return NextResponse.json({ success: true, runs: [], error: message }, { status: 200 });
  }
}
