import { crmRouter } from "./crm/crmRouter";
import { router } from "./trpc";

/** Root tRPC router for the existing Fastify API server. */
export const appRouter = router({
  crm: crmRouter,
});

export type AppRouter = typeof appRouter;
