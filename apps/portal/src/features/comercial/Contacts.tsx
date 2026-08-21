import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { RefreshCw, Users } from "lucide-react";

export default function ComercialContactsPage() {
  const { data: contacts, isLoading, refetch, isFetching } =
    trpc.crm.contacts.list.useQuery();

  return (
    <div className="comercial-surface flex flex-col gap-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Comercial"
        title="Contatos"
        description="Engajamento CRM. Veículos e OS permanecem no ERP (Operação)."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando contatos…</p>
      ) : !contacts?.length ? (
        <EmptyState
          icon={Users}
          title="Sem contatos"
          description="Contatos surgem via inbox, leads ou importação."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {contacts.map(contact => (
            <article
              key={contact.id}
              className="rounded-xl border border-border/70 bg-card/40 p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-snug">{contact.displayName}</h3>
                <Badge variant={contact.isOperationalClient ? "default" : "secondary"}>
                  {contact.isOperationalClient ? "Cliente ERP" : "Lead"}
                </Badge>
              </div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {contact.type} · {contact.temperature}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {contact.identities.map(identity => (
                  <li key={identity.id}>
                    {identity.channel}: {identity.value}
                  </li>
                ))}
              </ul>
              {contact.notes ? (
                <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                  {contact.notes}
                </p>
              ) : null}
              {contact.erpClientId != null ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  ERP client #{contact.erpClientId}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
