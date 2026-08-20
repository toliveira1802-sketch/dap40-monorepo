import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AccessLevel, AccessSystem, UserRole } from "@dap40/types";
import { validateDefinitivePassword } from "@dap40/utils";
import { supabase } from "../../../lib/supabase";

export type SessionSystems = Partial<Record<AccessSystem, AccessLevel>>;

export type PortalSession = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole | null;
  mustChangePassword: boolean;
  systems: SessionSystems;
};

type SessionContextValue = {
  loading: boolean;
  session: PortalSession | null;
  refresh: () => Promise<PortalSession | null>;
  signIn: (email: string, password: string) => Promise<PortalSession>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function parseSession(raw: unknown): PortalSession | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const systemsRaw = (data.systems ?? {}) as Record<string, string>;
  const systems: SessionSystems = {};
  for (const [key, value] of Object.entries(systemsRaw)) {
    systems[key as AccessSystem] = value as AccessLevel;
  }
  return {
    id: String(data.id ?? ""),
    email: String(data.email ?? ""),
    fullName: String(data.fullName ?? ""),
    role: (data.role as UserRole | null) ?? null,
    mustChangePassword: Boolean(data.mustChangePassword),
    systems,
  };
}

async function fetchSession(): Promise<PortalSession | null> {
  const { data: auth } = await supabase.auth.getSession();
  if (!auth.session) return null;

  const { data, error } = await supabase.rpc("get_my_session");
  if (error) {
    console.error("[auth] get_my_session", error.message);
    return null;
  }
  return parseSession(data);
}

/** Provider de sessão (auth.users + profiles + user_roles via RPC). */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PortalSession | null>(null);

  const refresh = useCallback(async () => {
    const next = await fetchSession();
    setSession(next);
    return next;
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const next = await fetchSession();
      if (mounted) {
        setSession(next);
        setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event: string) => {
      if (event === "SIGNED_OUT") {
        setSession(null);
        return;
      }
      const next = await fetchSession();
      setSession(next);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      throw new Error("Usuário ou senha inválidos");
    }
    const next = await fetchSession();
    if (!next) {
      await supabase.auth.signOut();
      throw new Error("Sessão sem perfil. Contate o MASTER.");
    }
    setSession(next);
    return next;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const check = validateDefinitivePassword(newPassword);
      if (!check.ok) {
        throw new Error(check.message);
      }
      const { error } = await supabase.rpc("change_own_password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (error) {
        throw new Error(error.message || "Não foi possível trocar a senha");
      }
      await refresh();
    },
    [refresh]
  );

  const value = useMemo(
    () => ({ loading, session, refresh, signIn, signOut, changePassword }),
    [loading, session, refresh, signIn, signOut, changePassword]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/** Hook canônico de sessão do portal. */
export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession deve ser usado dentro de AuthProvider");
  }
  return ctx;
}

/** @deprecated Use useSession */
export const useAuth = useSession;
