// lib/prisma.ts
import { PrismaClient } from "@/lib/generated/prisma/client";
import { validateEnvironment } from "./env";

// Validate environment variables before initializing Prisma
validateEnvironment();

// Global holder to cache the PrismaClient instance across hot reloads
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
