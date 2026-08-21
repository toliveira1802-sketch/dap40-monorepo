import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type { CrmApiUser, CrmTrpcContext } from "./trpc";

/**
 * Minimal context for CRM procedures.
 * Auth wiring (session/JWT) lives in the casco; until then, optional
 * x-dap-user-id / x-dap-user-role headers support local/dev callers.
 */
export async function createContext({
  req,
}: CreateFastifyContextOptions): Promise<CrmTrpcContext> {
  const headers = req.headers;
  const idRaw = headers["x-dap-user-id"];
  const roleRaw = headers["x-dap-user-role"];
  const idHeader = Array.isArray(idRaw) ? idRaw[0] : idRaw;
  const roleHeader = Array.isArray(roleRaw) ? roleRaw[0] : roleRaw;

  let user: CrmApiUser | null = null;
  if (idHeader) {
    const id = Number(idHeader);
    if (Number.isFinite(id) && id > 0) {
      user = {
        id,
        companyRole: roleHeader?.trim() || "CONSULTOR",
      };
    }
  }

  return { user };
}
