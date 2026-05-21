// server/db.ts
import { PrismaClient } from "@prisma/client";
import { validateEnvironment } from "../lib/env";

// Validar el entorno antes de inicializar Prisma
validateEnvironment();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
