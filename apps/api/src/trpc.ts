import { initTRPC, TRPCError } from "@trpc/server";
import type { AccessLevel, AccessSystem, UserRole } from "@dap40/types";

export type CrmApiUser = {
  id: number;
  /** DAP-REAL role (MASTER…) or legacy DEV for tests. */
  companyRole: UserRole | "DEV" | string;
  role?: string;
};

export type CrmTrpcContext = {
  user: CrmApiUser | null;
};

const t = initTRPC.context<CrmTrpcContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Não autenticado",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export type { AccessLevel, AccessSystem };
