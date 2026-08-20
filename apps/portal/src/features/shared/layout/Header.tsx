import React from "react";
import { useLocation } from "wouter";
import { Button } from "@dap40/ui";
import { Plus } from "lucide-react";
import { store } from "../../../lib/trpc";

export function Header() {
  const [, setLocation] = useLocation();

  const activeVehicles = store.vehicles.filter(v => v.status === "active").length;
  const overdueCount = store.vehicles.filter(v => {
    if (!v.estimatedDeliveryAt) return false;
    return new Date(v.estimatedDeliveryAt).getTime() < Date.now();
  }).length;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-dap-red-deep/50 bg-dap-black px-4">
      <div>
        <p className="text-sm font-semibold text-dap-white">Oficina Conectada</p>
        <p className="text-xs uppercase tracking-wide text-dap-gray">
          {activeVehicles} veículos em operação
          {overdueCount > 0 ? (
            <span className="text-dap-red"> · {overdueCount} atrasados</span>
          ) : null}
        </p>
      </div>

      <Button
        variant="primary"
        size="sm"
        onClick={() => setLocation("/ordens-servico/nova")}
      >
        <Plus className="h-4 w-4" />
        Nova OS
      </Button>
    </header>
  );
}
