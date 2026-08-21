/**
 * Nexora OS — Assignment Repository (Neon / Prisma)
 */

import { prisma } from "@/lib/prisma";

export class AssignmentRepository {
  public static async findBriefById(id: string) {
    return prisma.assignmentBrief.findUnique({
      where: { id },
      include: {
        unit: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        submissions: true,
      },
    });
  }

  public static async listBriefsByUnit(unitId: string) {
    return prisma.assignmentBrief.findMany({
      where: { unitId },
      orderBy: { createdAt: "desc" },
    });
  }

  public static async findSubmission(studentId: string, assignmentBriefId: string) {
    return prisma.assignmentSubmission.findFirst({
      where: { studentId, assignmentBriefId },
      include: {
        assignmentBrief: true,
        feedback: true,
      },
    });
  }
}
