import { PrismaClient } from "@prisma/client";

let prismaClient: PrismaClient | null = null;

export function getPrisma() {
  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }

  return prismaClient;
}

export function isDatabaseMode() {
  return process.env.NEXORA_DATA_MODE === "database";
}
