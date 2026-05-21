// lib/prisma.ts
import { PrismaClient } from "@/lib/generated/prisma/client";
import { validateEnvironment } from "./env";

// Validar el entorno antes de inicializar Prisma
validateEnvironment();

const prisma = new PrismaClient();

export default prisma;
