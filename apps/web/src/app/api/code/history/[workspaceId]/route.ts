/**
 * Nexora OS — Code Workspace Execution History API Endpoint
 * GET /api/code/history/[workspaceId]
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> | { workspaceId: string } }
) {
  try {
    const resolvedParams = await (params as any);
    const workspaceId = typeof resolvedParams === "object" ? resolvedParams?.workspaceId : undefined;

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
    console.warn("[API /api/code/history] Non-critical exception fetching runs:", error.message);
    return NextResponse.json({ success: true, runs: [], error: error.message }, { status: 200 });
  }
}
