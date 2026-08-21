import { useLocation } from "wouter";
import { Button } from "@dap40/ui";
import { Bell, LogOut } from "lucide-react";
import { store } from "../../../lib/trpc";
import { useSession, LOGIN_PATH } from "../auth";
import { BrandLogo } from "./BrandLogo";

function firstName(fullName: string | undefined | null): string {
  const trimmed = (fullName || "").trim();
  if (!trimmed) return "usuário";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

export function Header() {
  const [, setLocation] = useLocation();
  const { session, signOut } = useSession();

  const pendingCount = store.occurrences.filter(
    o => o.status === "open" || o.status === "in_progress",
  ).length;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-dap-red-deep/50 bg-dap-black px-4">
      <div className="flex min-w-0 items-center gap-3">
        <BrandLogo variant="header" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-dap-white">
            Olá, {firstName(session?.fullName)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="relative px-2 normal-case tracking-normal"
          aria-label={
            pendingCount > 0
              ? `${pendingCount} pendências`
              : "Pendências"
          }
          onClick={() => setLocation("/ocorrencias")}
        >
          <Bell className="h-4 w-4" />
          {pendingCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-sm bg-dap-red px-1 text-[0.65rem] font-bold text-dap-white">
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          ) : null}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await signOut();
            setLocation(LOGIN_PATH);
          }}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}
