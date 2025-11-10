// server/api/trpc.ts
import { initTRPC } from "@trpc/server";
import { prisma } from "../db";

const t = initTRPC.context<{ prisma: typeof prisma }>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
