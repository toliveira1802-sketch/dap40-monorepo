import { useEffect, useState, type ReactNode } from "react";
import { Redirect } from "wouter";
import { useSession } from "../shared/auth";
import {
  canAccessPortal,
  hasProjectFloatAccess,
} from "../empresa/admin/canAccess";
import { hasPageGrant } from "../empresa/admin/api";

function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-dap-black">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-dap-gray border-t-dap-red" />
    </div>
  );
}

/**
 * Sem grant ERP ou da página (access_page_grants / has_page), não renderiza.
 * MASTER e grant PORTAL-EMPRESA (Dev) passam direto — flutuação livre.
 */
export function RequireErpPage({
  pageId,
  children,
}: {
  pageId: string;
  children: ReactNode;
}) {
  const { loading, session } = useSession();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (loading) return;
      if (!session) {
        if (!cancelled) setAllowed(false);
        return;
      }
      if (hasProjectFloatAccess(session.systems, session.role)) {
        if (!cancelled) setAllowed(true);
        return;
      }
      if (!canAccessPortal(session.systems, "ERP", session.role)) {
        if (!cancelled) setAllowed(false);
        return;
      }
      try {
        const ok = await hasPageGrant(pageId);
        if (!cancelled) setAllowed(ok);
      } catch {
        if (!cancelled) setAllowed(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, session, pageId]);

  if (loading || allowed === null) return <Loading />;
  if (!allowed) return <Redirect to="/hub" />;
  return <>{children}</>;
}
