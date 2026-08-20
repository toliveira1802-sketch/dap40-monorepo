import type { AccessLevel, AccessSystem, UserRole } from "@dap40/types";
import { supabase } from "../../../lib/supabase";
import { MANAGED_SYSTEMS, type ManagedSystem } from "./systems";

export type AccessPageRow = {
  pageId: string;
  system: AccessSystem;
  path: string;
  label: string;
};

export type AccessUserRow = {
  id: string;
  fullName: string;
  role: UserRole | null;
  mustChangePassword: boolean;
  grants: Partial<Record<AccessSystem, AccessLevel>>;
  pageIds: string[];
};

export async function fetchAccessPages(): Promise<AccessPageRow[]> {
  const { data, error } = await supabase
    .from("access_pages")
    .select("page_id, system, path, label")
    .order("system")
    .order("page_id");

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map(row => ({
      pageId: row.page_id as string,
      system: row.system as AccessSystem,
      path: row.path as string,
      label: row.label as string,
    }))
    .filter(row => (MANAGED_SYSTEMS as readonly string[]).includes(row.system));
}

export async function fetchAccessUsers(): Promise<AccessUserRow[]> {
  const [profilesRes, rolesRes, grantsRes, pagesRes] = await Promise.all([
    supabase.from("profiles").select("id, full_name, must_change_password"),
    supabase.from("user_roles").select("user_id, role"),
    supabase.from("access_grants").select("user_id, system, level"),
    supabase.from("access_page_grants").select("user_id, page_id"),
  ]);

  for (const res of [profilesRes, rolesRes, grantsRes, pagesRes]) {
    if (res.error) throw new Error(res.error.message);
  }

  const roleByUser = new Map(
    (rolesRes.data ?? []).map(r => [r.user_id as string, r.role as UserRole])
  );
  const grantsByUser = new Map<string, Partial<Record<AccessSystem, AccessLevel>>>();
  for (const g of grantsRes.data ?? []) {
    const uid = g.user_id as string;
    const map = grantsByUser.get(uid) ?? {};
    map[g.system as AccessSystem] = g.level as AccessLevel;
    grantsByUser.set(uid, map);
  }
  const pagesByUser = new Map<string, string[]>();
  for (const p of pagesRes.data ?? []) {
    const uid = p.user_id as string;
    const list = pagesByUser.get(uid) ?? [];
    list.push(p.page_id as string);
    pagesByUser.set(uid, list);
  }

  return (profilesRes.data ?? [])
    .map(p => {
      const id = p.id as string;
      const role = roleByUser.get(id) ?? null;
      return {
        id,
        fullName: (p.full_name as string) || "Sem nome",
        role,
        mustChangePassword: Boolean(p.must_change_password),
        grants: grantsByUser.get(id) ?? {},
        pageIds: pagesByUser.get(id) ?? [],
      } satisfies AccessUserRow;
    })
    .filter(u => u.role && u.role !== "CLIENTE")
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "pt-BR"));
}

export async function setPortalGrant(
  userId: string,
  system: ManagedSystem,
  level: AccessLevel
): Promise<void> {
  const { error } = await supabase.rpc("set_access_grant", {
    p_user_id: userId,
    p_system: system,
    p_level: level,
  });
  if (error) throw new Error(error.message);
}

/** Substitui todos os page grants do usuário (RPC set_page_grants). */
export async function setUserPageGrants(
  userId: string,
  pageIds: string[]
): Promise<void> {
  const { error } = await supabase.rpc("set_page_grants", {
    p_user_id: userId,
    p_page_ids: pageIds,
  });
  if (error) throw new Error(error.message);
}

export async function hasPageGrant(pageId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_page", { p_page_id: pageId });
  if (error) throw new Error(error.message);
  return Boolean(data);
}
