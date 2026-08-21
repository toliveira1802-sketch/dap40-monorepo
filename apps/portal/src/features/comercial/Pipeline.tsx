import { Kanban } from "lucide-react";

export default function PipelinePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-dap-black px-6 py-8 text-dap-gray">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-dap-red">Comercial</p>
      <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-dap-white">
        Pipeline
      </h1>
      <p className="mt-2 max-w-xl text-sm text-dap-gray/80">
        Funil de oportunidades — shell do CRM no casco.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dap-carbon bg-dap-graphite px-6 py-16">
        <Kanban className="size-10 text-dap-red" />
        <p className="text-sm text-dap-gray/70">Pipeline vazio. Sem integração Kommo.</p>
      </div>
    </div>
  );
}
