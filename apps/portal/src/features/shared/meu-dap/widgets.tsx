import type { ReactElement, ReactNode } from "react";
import { Bell, Cake, CalendarOff, FileHeart, Link2, Wrench } from "lucide-react";
import type { MeuDapWidgetId } from "./catalog";

function WidgetShell({
  title,
  icon: Icon,
  children,
  badge,
}: {
  title: string;
  icon: typeof Bell;
  children: ReactNode;
  badge?: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-sm border border-dap-red-deep/40 bg-dap-graphite p-4">
      <header className="mb-3 flex items-start justify-between gap-2 border-b border-dap-red-deep/30 pb-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-sm border border-dap-red-deep/40 bg-dap-black/40 text-dap-red">
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <h2 className="text-sm font-semibold text-dap-white">{title}</h2>
        </div>
        {badge ? (
          <span className="rounded-sm border border-dap-red-deep/40 px-2 py-0.5 text-[0.65rem] text-dap-gray">
            {badge}
          </span>
        ) : null}
      </header>
      <div className="flex-1 text-sm text-dap-gray">{children}</div>
    </article>
  );
}

export function AvisosWidget() {
  return (
    <WidgetShell title="Avisos da empresa" icon={Bell} badge="Comum">
      <p className="text-dap-white">Nenhum aviso no momento.</p>
    </WidgetShell>
  );
}

export function AtalhosWidget() {
  return (
    <WidgetShell title="Atalhos rápidos" icon={Link2} badge="Comum">
      <ul className="grid gap-2 sm:grid-cols-2">
        {[
          { label: "Pátio", hint: "Operação" },
          { label: "Agenda", hint: "Consultoria" },
          { label: "Inbox CRM", hint: "Comercial" },
          { label: "Acessos", hint: "Dev / MASTER" },
        ].map(item => (
          <li
            key={item.label}
            className="rounded-sm border border-dap-red-deep/30 bg-dap-black/40 px-3 py-2"
          >
            <p className="text-sm font-medium text-dap-white">{item.label}</p>
            <p className="text-[0.65rem] text-dap-gray">{item.hint}</p>
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}

export function StatusOficinaWidget() {
  return (
    <WidgetShell title="Status da oficina" icon={Wrench} badge="Comum">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "No pátio", value: "—" },
          { label: "Em execução", value: "—" },
          { label: "Prontos", value: "—" },
        ].map(kpi => (
          <div
            key={kpi.label}
            className="rounded-sm border border-dap-red-deep/30 bg-dap-black/40 px-2 py-3"
          >
            <p className="text-lg font-semibold text-dap-white">{kpi.value}</p>
            <p className="text-[0.65rem] text-dap-gray">{kpi.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-dap-gray/80">Sem dados — aguardando integração operacional.</p>
    </WidgetShell>
  );
}

export function FaltasWidget() {
  return (
    <WidgetShell title="Faltas" icon={CalendarOff} badge="Pessoal">
      <p className="text-dap-white">
        <span className="text-2xl font-semibold text-dap-red">0</span>
        <span className="ml-2 text-sm text-dap-gray">faltas no mês</span>
      </p>
      <p className="mt-2 text-xs">Sem registros.</p>
    </WidgetShell>
  );
}

export function AtestadoWidget() {
  return (
    <WidgetShell title="Atestado" icon={FileHeart} badge="Pessoal">
      <p className="text-dap-white">Nenhum atestado ativo</p>
      <p className="mt-2 text-xs">Integração RH pendente.</p>
    </WidgetShell>
  );
}

export function AniversarioWidget() {
  return (
    <WidgetShell title="Aniversário do colaborador" icon={Cake} badge="Pessoal">
      <p className="text-dap-white">Nenhum aniversário listado.</p>
    </WidgetShell>
  );
}

export const WIDGET_RENDERERS: Record<MeuDapWidgetId, () => ReactElement> = {
  avisos: AvisosWidget,
  atalhos: AtalhosWidget,
  status_oficina: StatusOficinaWidget,
  faltas: FaltasWidget,
  atestado: AtestadoWidget,
  aniversario: AniversarioWidget,
};
