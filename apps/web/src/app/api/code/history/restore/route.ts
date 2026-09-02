/**
 * Nexora OS — Restore Code from Historical Run API Endpoint
 * POST /api/code/history/restore
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";

const REVIEWER_ROLES = new Set(["TEACHER", "ADMIN", "SUPER_ADMIN"]);

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);

    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { runId, fileId } = body;

    if (!runId) {
      return NextResponse.json(
        { success: false, message: "runId parameter is required." },
        { status: 400 }
      );
    }

    // 1. Fetch historical code run from database
    const codeRun = await prisma.codeRun.findUnique({
      where: { id: runId },
      include: { file: true, workspace: true },
    });

    if (!codeRun) {
      return NextResponse.json(
        { success: false, message: "Execution run record not found." },
        { status: 404 }
      );
    }

    const isOwner = codeRun.workspace.ownerId === sessionUser.id;
    const isReviewer = REVIEWER_ROLES.has(sessionUser.role);

    if (!isOwner && !isReviewer) {
      return NextResponse.json(
        { success: false, message: "Execution run record not found." },
        { status: 404 }
      );
    }

    // Restoring into a file must stay inside the run's own workspace —
    // never let a caller redirect the restore at an arbitrary fileId.
    if (fileId && codeRun.workspaceId) {
      const targetBelongsToWorkspace = await prisma.codeFile.findFirst({
        where: { id: fileId, workspaceId: codeRun.workspaceId },
        select: { id: true },
      });

      if (!targetBelongsToWorkspace) {
        return NextResponse.json(
          { success: false, message: "Target file does not belong to this workspace." },
          { status: 400 }
        );
      }
    }

    // 2. If target fileId exists, update content in database
    const targetFileId = fileId || codeRun.fileId;
    let updatedFile = null;

    if (targetFileId) {
      updatedFile = await prisma.codeFile.update({
        where: { id: targetFileId },
        data: {
          content: codeRun.code,
          language: codeRun.language,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Restored code from execution run ${codeRun.id.slice(-8)}.`,
        code: codeRun.code,
        language: codeRun.language,
        file: updatedFile,
        timestamp: codeRun.createdAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[API /api/code/history/restore] Exception:", error);
    const message = error instanceof Error ? error.message : "Failed to restore historical run.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
