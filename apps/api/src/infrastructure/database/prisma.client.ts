import { PrismaClient } from "@prisma/client";

let prismaClient: PrismaClient | null = null;

export function getPrisma() {
  if (!prismaClient) {
    prismaClient = new PrismaClient();

    const disconnect = () => {
      void prismaClient?.$disconnect();
    };

    process.once("SIGINT", disconnect);
    process.once("SIGTERM", disconnect);
    process.once("beforeExit", disconnect);
  }

  return prismaClient;
}

export function isDatabaseMode() {
  return process.env.NEXORA_DATA_MODE === "database";
}
