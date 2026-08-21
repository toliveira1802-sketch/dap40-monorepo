import { canAccess, getAccessLevel } from "./access";
import { listAccessGrantsByUserId } from "./accessGrantStore";
import { protectedProcedure, router } from "../trpc";
import type { AccessLevel, AccessSystem } from "@dap40/types";

export const accessRouter = router({
  capabilities: protectedProcedure.query(async ({ ctx }) => {
    const grantRows = await listAccessGrantsByUserId(ctx.user.profileId);
    const grants = Object.fromEntries(
      grantRows.map(grant => [grant.system, grant.level])
    ) as Partial<Record<AccessSystem, AccessLevel>>;
    const crmLevel = getAccessLevel(ctx.user.companyRole, "CRM", grants);
    return {
      canWriteCrm: canAccess(crmLevel, "write"),
      canManageTeam: false,
      canEditPricing: false,
      canApproveOrders: false,
      canDeleteOrders: false,
      canOperatePatio: false,
      canCancelServiceOrder: false,
      userRole: ctx.user.companyRole,
    };
  }),
});
