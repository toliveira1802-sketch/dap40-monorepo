import { useLocation } from "wouter";
import { Card } from "@dap40/ui";
import { useSession } from "./auth";
import { listUnlockedPortals } from "../../lib/portals";

export default function HubPage() {
  const [, setLocation] = useLocation();
  const { session } = useSession();
  const unlocked = listUnlockedPortals(session?.systems, session?.role);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-2">
        <p className="dap-kicker">Portal Único</p>
        <h1 className="dap-display text-3xl text-dap-white">
          Hub <span className="text-dap-red">Oficina</span>
        </h1>
        <p className="max-w-2xl text-sm text-dap-gray">
          Olá, {session?.fullName || session?.email}. Escolha um portal liberado.
        </p>
      </header>

      {unlocked.length === 0 ? (
        <Card className="p-6 text-sm text-dap-gray">
          Nenhum portal liberado. Peça ao MASTER para conceder acesso.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {unlocked.map(portal => (
            <button
              key={portal.id}
              type="button"
              onClick={() => setLocation(portal.path)}
              className="text-left"
            >
              <Card className="flex h-full flex-col justify-between gap-4 p-4 transition hover:border-dap-red/40">
                <div>
                  <p className="text-sm font-semibold text-dap-white">{portal.label}</p>
                  <p className="mt-1 text-xs text-dap-gray">{portal.description}</p>
                </div>
                <span className="text-xs font-medium text-dap-red">Abrir →</span>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
