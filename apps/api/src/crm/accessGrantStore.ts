import type { AccessLevel, AccessSystem } from "@dap40/types";

/**
 * Stub until accessGrantStore is migrated into apps/api.
 * Returns empty grants → requireCrmAccess relies on MASTER/DEV role or explicit grants in tests.
 *
 * TODO(casco): replace with real listAccessGrantsByUserId from access package.
 */
export async function listAccessGrantsByUserId(
  _userId: number
): Promise<Array<{ system: AccessSystem; level: AccessLevel }>> {
  return [];
}
