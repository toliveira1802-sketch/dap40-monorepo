import { useAuth as usePortalAuth } from "@/features/shared/auth";

/** Adapts DAP40 session to the Manus Gestao screens (`user` / `logout`). */
export function useAuth() {
  const { loading, session, signOut } = usePortalAuth();
  const user = session
    ? {
        ...session,
        name: session.fullName,
      }
    : null;

  return {
    user,
    loading,
    error: null,
    isAuthenticated: Boolean(session),
    logout: signOut,
    refresh: async () => user,
  };
}
