import { useLocation } from "wouter";
import { Button } from "@dap40/ui";
import { LogOut, Plus } from "lucide-react";
import { store } from "../../../lib/trpc";
import { useSession, LOGIN_PATH } from "../auth";

export function Header() {
  const [, setLocation] = useLocation();
  const { session, signOut } = useSession();

  const activeVehicles = store.vehicles.filter(v => v.status === "active").length;
  const overdueCount = store.vehicles.filter(v => {
    if (!v.estimatedDeliveryAt) return false;
    return new Date(v.estimatedDeliveryAt).getTime() < Date.now();
  }).length;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-dap-red-deep/50 bg-dap-black px-4">
      <div>
        <p className="text-sm font-semibold text-dap-white">
          {session?.fullName || "Oficina Conectada"}
        </p>
        <p className="text-xs uppercase tracking-wide text-dap-gray">
          {activeVehicles} veículos em operação
          {overdueCount > 0 ? (
            <span className="text-dap-red"> · {overdueCount} atrasados</span>
          ) : null}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setLocation("/ordens-servico/nova")}
        >
          <Plus className="h-4 w-4" />
          Nova OS
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
