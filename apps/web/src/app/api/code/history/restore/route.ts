/**
 * Nexora OS — Restore Code from Historical Run API Endpoint
 * POST /api/code/history/restore
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { runId, workspaceId, fileId } = body;

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
  } catch (error: any) {
    console.error("[API /api/code/history/restore] Exception:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to restore historical run." },
      { status: 500 }
    );
  }
}
