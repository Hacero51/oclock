// server/api/routers/empleados.ts
import { router, publicProcedure } from "../trpc";

export const empleadosRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.empleado.findMany();
  }),
});
