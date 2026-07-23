/**
 * Nexora OS — Code Workspace Execution History API Endpoint
 * GET /api/code/history/[workspaceId]
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

    if (!workspaceId) {
      return NextResponse.json({ success: false, runs: [] }, { status: 400 });
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
  } catch (error: any) {
    console.error("[API /api/code/history] Unhandled exception:", error);
    return NextResponse.json({ success: false, runs: [], error: error.message }, { status: 500 });
  }
}
