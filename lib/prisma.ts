// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { validateEnvironment } from "./env";

// Validar el entorno antes de inicializar Prisma
validateEnvironment();

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const logLevels: ("query" | "info" | "warn" | "error")[] = ["warn", "error"];

if (process.env.LOG_QUERIES === "true") {
  logLevels.push("query", "info");
}

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: logLevels,
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
