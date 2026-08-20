import type { ReactNode } from "react";
import { Redirect, useLocation } from "wouter";
import type { AccessSystem } from "@dap40/types";
import { useSession, type SessionSystems } from "./session";
import { CHANGE_PASSWORD_PATH, LOGIN_PATH, loginUrl } from "./paths";

function LoadingScreen() {
  return (
    <div className="dap-motion-bg flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-dap-gray border-t-dap-red" />
    </div>
  );
}

/** Exige sessão; redireciona para /trocar-senha se must_change_password. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, session } = useSession();
  const [location] = useLocation();

  if (loading) return <LoadingScreen />;
  if (!session) return <Redirect to={loginUrl(location)} />;
  if (session.mustChangePassword && location !== CHANGE_PASSWORD_PATH) {
    return <Redirect to={CHANGE_PASSWORD_PATH} />;
  }
  return <>{children}</>;
}

/** Sem grant no sistema, não renderiza (redirect /). */
export function RequirePortal({
  system,
  children,
}: {
  system: AccessSystem;
  children: ReactNode;
}) {
  const { session } = useSession();
  const level = (session?.systems as SessionSystems | undefined)?.[system];
  if (!level || level === "none") {
    return <Redirect to="/" />;
  }
  return <>{children}</>;
}

/** Só visitantes — se já autenticado, sai do /login. */
export function PublicOnly({ children }: { children: ReactNode }) {
  const { loading, session } = useSession();
  if (loading) return <LoadingScreen />;
  if (session?.mustChangePassword) {
    return <Redirect to={CHANGE_PASSWORD_PATH} />;
  }
  if (session) {
    return <Redirect to="/" />;
  }
  return <>{children}</>;
}

export { LOGIN_PATH, CHANGE_PASSWORD_PATH, loginUrl };
