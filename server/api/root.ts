// server/api/root.ts
import { router } from "./trpc";
import { empleadosRouter } from "./routers/empleados";

export const appRouter = router({
  empleados: empleadosRouter,
});

export type AppRouter = typeof appRouter;
