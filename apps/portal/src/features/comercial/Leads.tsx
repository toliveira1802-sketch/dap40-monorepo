import { UserPlus } from "lucide-react";

export default function LeadsPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-dap-black px-6 py-8 text-dap-gray">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-dap-red">Comercial</p>
      <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-dap-white">
        Leads
      </h1>
      <p className="mt-2 max-w-xl text-sm text-dap-gray/80">
        Contatos comerciais em crm_contacts — distinto de public.clients (oficina).
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dap-carbon bg-dap-graphite px-6 py-16">
        <UserPlus className="size-10 text-dap-red" />
        <p className="text-sm text-dap-gray/70">Nenhum lead cadastrado.</p>
      </div>
    </div>
  );
}
