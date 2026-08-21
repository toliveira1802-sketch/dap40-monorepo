import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  LayoutGrid,
  Settings2,
} from "lucide-react";
import { Button } from "@dap40/ui";
import { useSession } from "../auth";
import {
  MEU_DAP_WIDGETS,
  type MeuDapWidgetId,
  type MeuDapWidgetPrefs,
} from "./catalog";
import {
  loadPrefs,
  moveWidget,
  resolveVisibleWidgets,
  savePrefs,
  toggleWidgetVisible,
} from "./preferences";
import { WIDGET_RENDERERS } from "./widgets";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function MeuDapPage() {
  const { session } = useSession();
  const userId = session?.id ?? "anon";
  const [prefs, setPrefs] = useState<MeuDapWidgetPrefs>(() => loadPrefs(userId));
  const [customize, setCustomize] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs(userId));
  }, [userId]);

  const visible = resolveVisibleWidgets(prefs);

  function commit(next: MeuDapWidgetPrefs) {
    setPrefs(next);
    if (session?.id) savePrefs(session.id, next);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="dap-kicker">Home comum</p>
          <h1 className="dap-display text-3xl text-dap-white">
            Meu <span className="text-dap-red">DAP</span>
          </h1>
          <p className="max-w-xl text-sm text-dap-gray">
            Olá, {session?.fullName || session?.email}. Widgets comuns e pessoais —
            você só controla visibilidade e ordem.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setCustomize(v => !v)}
        >
          <Settings2 className="h-4 w-4" />
          {customize ? "Fechar" : "Personalizar"}
        </Button>
      </header>

      {customize ? (
        <section className="rounded-sm border border-dap-red-deep/40 bg-dap-graphite p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-dap-gray">
            Preferências (salvas neste dispositivo)
          </p>
          <ul className="space-y-2">
            {prefs.order.map((id, index) => {
              const def = MEU_DAP_WIDGETS.find(w => w.id === id);
              if (!def) return null;
              const visibleNow = !prefs.hidden.includes(id);
              return (
                <li
                  key={id}
                  className="flex flex-wrap items-center gap-2 rounded-sm border border-dap-red-deep/30 bg-dap-black/40 px-3 py-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-dap-white">{def.title}</span>
                    <span className="text-[0.65rem] text-dap-gray">
                      {def.kind === "common" ? "Comum" : "Pessoal"} · {def.description}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="rounded-sm p-1.5 text-dap-gray hover:text-dap-white disabled:opacity-30"
                    disabled={index === 0}
                    aria-label="Mover para cima"
                    onClick={() => commit(moveWidget(prefs, id, "up"))}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-sm p-1.5 text-dap-gray hover:text-dap-white disabled:opacity-30"
                    disabled={index === prefs.order.length - 1}
                    aria-label="Mover para baixo"
                    onClick={() => commit(moveWidget(prefs, id, "down"))}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-xs",
                      visibleNow
                        ? "border-emerald-500/30 text-emerald-400"
                        : "border-dap-red-deep/40 text-dap-gray"
                    )}
                    onClick={() =>
                      commit(
                        toggleWidgetVisible(prefs, id as MeuDapWidgetId, !visibleNow)
                      )
                    }
                  >
                    {visibleNow ? (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Visível
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Oculto
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {visible.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-sm border border-dap-red-deep/40 bg-dap-graphite p-6">
          <LayoutGrid className="h-5 w-5 text-dap-gray" />
          <p className="text-sm text-dap-white">Nenhum widget visível.</p>
          <Button type="button" onClick={() => setCustomize(true)}>
            Personalizar grade
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map(def => {
            const Render = WIDGET_RENDERERS[def.id];
            return (
              <div key={def.id} className="min-h-[11rem]">
                <Render />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
