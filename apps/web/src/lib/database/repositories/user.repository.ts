/**
 * Nexora OS — User Repository (Neon / Prisma)
 */

import { prisma } from "@/lib/prisma";
import { UserCreateInput, UserUpdateInput } from "../types/database.types";
import { UserRole } from "@prisma/client";

export class UserRepository {
  public static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
        course: true,
        unit: true,
        batch: true,
      },
    });
  }

  public static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  public static async create(data: UserCreateInput) {
    return prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
      },
    });
  }

  public static async update(id: string, data: UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  public static async listByRole(role: UserRole) {
    return prisma.user.findMany({
      where: { role },
      orderBy: { createdAt: "desc" },
    });
  }
}
