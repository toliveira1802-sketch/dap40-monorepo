import { useState, type FormEvent } from "react";
import { Inbox as InboxIcon, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_DAP_API_URL || "http://localhost:3001";

type Channel = "whatsapp" | "messenger" | "instagram";

const CHANNELS: Array<{ id: Channel; label: string }> = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "messenger", label: "Messenger" },
  { id: "instagram", label: "Instagram" },
];

export default function InboxPage() {
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedTo = to.trim();
    const trimmedText = text.trim();
    if (!trimmedTo || !trimmedText) {
      toast.error("Informe destino e mensagem.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/inbox/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, to: trimmedTo, text: trimmedText }),
      });
      const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        const msg =
          typeof body.error === "string"
            ? body.error
            : res.status === 501
              ? "Token Graph ausente — payload preparado, envio não executado."
              : `Falha ao enviar (${res.status}).`;
        toast.error(msg);
        return;
      }
      toast.success("Mensagem enviada.");
      setText("");
    } catch {
      toast.error("API indisponível. Verifique VITE_DAP_API_URL.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-dap-black text-dap-gray">
      <header className="border-b border-dap-carbon px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-dap-red">Comercial</p>
        <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-dap-white">
          Inbox
        </h1>
        <p className="mt-1 text-sm text-dap-gray/80">
          WhatsApp, Messenger e Instagram — envio só via API DAP (sem Graph no browser).
        </p>
      </header>

      <div className="grid flex-1 lg:grid-cols-[1fr_minmax(280px,380px)]">
        <section className="flex flex-col items-center justify-center gap-3 border-b border-dap-carbon px-6 py-16 lg:border-b-0 lg:border-r">
          <div className="grid size-14 place-items-center rounded-2xl bg-dap-carbon text-dap-red">
            <InboxIcon className="size-7" />
          </div>
          <h2 className="font-display text-lg font-semibold uppercase text-dap-white">
            Nenhuma conversa
          </h2>
          <p className="max-w-sm text-center text-sm text-dap-gray/70">
            Conversas entram pelos webhooks Meta e ficam em crm_*. Use o composer para responder
            após aprovação humana.
          </p>
        </section>

        <aside className="flex flex-col bg-dap-graphite px-5 py-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-dap-white">
            Composer
          </h2>
          <form className="flex flex-1 flex-col gap-4" onSubmit={onSubmit}>
            <label className="grid gap-1.5 text-xs uppercase tracking-wide text-dap-gray/70">
              Canal
              <select
                className="rounded-lg border border-dap-carbon bg-dap-black px-3 py-2 text-sm normal-case text-dap-white outline-none focus:border-dap-red"
                value={channel}
                onChange={e => setChannel(e.target.value as Channel)}
              >
                {CHANNELS.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-xs uppercase tracking-wide text-dap-gray/70">
              Destino (to)
              <input
                className="rounded-lg border border-dap-carbon bg-dap-black px-3 py-2 text-sm normal-case text-dap-white outline-none focus:border-dap-red"
                value={to}
                onChange={e => setTo(e.target.value)}
                placeholder={channel === "whatsapp" ? "5511999999999" : "PSID / IGSID"}
                autoComplete="off"
              />
            </label>

            <label className="grid flex-1 gap-1.5 text-xs uppercase tracking-wide text-dap-gray/70">
              Mensagem
              <textarea
                className="min-h-[140px] flex-1 resize-y rounded-lg border border-dap-carbon bg-dap-black px-3 py-2 text-sm normal-case text-dap-white outline-none focus:border-dap-red"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Texto da resposta…"
              />
            </label>

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-dap-red px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-dap-white transition hover:bg-dap-red-bright disabled:opacity-60"
            >
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Enviar
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
