import { useAuth } from "@/features/gestao/auth/useAuth";
import { Button } from "@/components/ui/button";
import { DapLogo } from "@/features/gestao/components/DapLogo";
import { startPortalLogin } from "@/features/gestao/auth/constants";
import { managementPath } from "@/features/gestao/paths";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

/** GestÃ£o module landing â€” redirects authenticated users to the dashboard. */
export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      setLocation(managementPath());
    }
  }, [loading, user, setLocation]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background dap-motion-lines p-8">
      <div className="flex max-w-md flex-col items-center gap-8">
        <DapLogo />
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="dap-heading text-2xl text-foreground">
            Portal de <span className="text-primary">GestÃ£o</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Acesso restrito a usuÃ¡rios autorizados do Doctor Auto Prime.
          </p>
        </div>
        <Button
          onClick={() => startPortalLogin()}
          size="lg"
          className="w-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
        >
          Entrar
        </Button>
      </div>
    </div>
  );
}
