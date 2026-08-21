import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import type { CrmTemperature } from "@dap40/types";
import {
  ArrowRightLeft,
  Check,
  Pencil,
  Plus,
  RefreshCw,
  SearchX,
  Waves,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { FilterBar } from "./FilterBar";
import { LeadFormDialog, type LeadFormValues } from "./LeadFormDialog";
import { QueryState, TableSkeleton } from "./QueryState";

const temperatureLabel = {
  hot: "Quente",
  warm: "Morno",
  cold: "Frio",
} as const;

type Temperature = keyof typeof temperatureLabel;

export default function ComercialLeadsPage() {
  const utils = trpc.useUtils();
  const { data: capabilities } = trpc.access.capabilities.useQuery();
  const canWriteCrm = capabilities?.canWriteCrm ?? false;
  const {
    data: leads,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = trpc.crm.leads.list.useQuery();
  const { data: conversionIntents } = trpc.crm.conversion.list.useQuery();

  const [search, setSearch] = useState("");
  const [temperature, setTemperature] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LeadFormValues | null>(null);
  const [, setLocation] = useLocation();
  const [erpIds, setErpIds] = useState<Record<string, string>>({});

  const createIntent = trpc.crm.conversion.create.useMutation({
    onSuccess: async () => {
      await utils.crm.conversion.list.invalidate();
      toast.success("Intent de conversÃ£o enviado ao ERP (pendente)");
    },
    onError: error => toast.error(error.message),
  });
  const resolveIntent = trpc.crm.conversion.resolve.useMutation({
    onSuccess: async () => {
      await utils.crm.conversion.list.invalidate();
      toast.success("Handoff atualizado");
    },
    onError: error => toast.error(error.message),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (leads ?? []).filter(lead => {
      if (temperature !== "all" && lead.temperature !== temperature) {
        return false;
      }
      if (!q) return true;
      return lead.displayName.toLowerCase().includes(q);
    });
  }, [leads, search, temperature]);

  const hasData = (leads?.length ?? 0) > 0;
  const filterEmpty = hasData && filtered.length === 0;
  const openIntents = (conversionIntents ?? []).filter(
    intent => intent.status === "pending" || intent.status === "accepted"
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(lead: {
    id: string;
    displayName: string;
    temperature: CrmTemperature;
    notes: string | null;
  }) {
    setEditing({
      id: lead.id,
      displayName: lead.displayName,
      temperature: lead.temperature,
      notes: lead.notes,
    });
    setFormOpen(true);
  }

  return (
    <div className="comercial-surface flex flex-col gap-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Comercial"
        title="Lago de leads"
        description="Pessoas ainda sem OS no ERP. Ao converter, o CRM sÃ³ grava ErpConversionIntent."
        actions={
          <div className="flex flex-wrap gap-2">
            {canWriteCrm ? (
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-2 size-4" />
                Novo lead
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
          </div>
        }
      />

      {!isLoading && !isError && hasData ? (
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por nomeâ€¦"
          selectValue={temperature}
          onSelectChange={setTemperature}
          selectAllLabel="Todas as temperaturas"
          selectOptions={(Object.keys(temperatureLabel) as Temperature[]).map(
            key => ({
              value: key,
              label: temperatureLabel[key],
            })
          )}
        />
      ) : null}

      {openIntents.length > 0 ? (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300">
              <ArrowRightLeft className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold">Handoffs CRM â†’ ERP</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Acompanhe conversÃµes aguardando aceite ou materializaÃ§Ã£o no ERP.
              </p>
              <div className="mt-3 space-y-2">
                {openIntents.map(intent => (
                  <div
                    key={intent.id}
                    className="flex flex-col gap-3 rounded-lg border border-border/60 bg-background/40 p-3 md:flex-row md:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {intent.type}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Entidade {intent.crmEntityId} Â· enviado{" "}
                        {new Date(intent.submittedAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        intent.status === "accepted" ? "secondary" : "outline"
                      }
                    >
                      {intent.status === "accepted"
                        ? "Aceito pelo ERP"
                        : "Pendente"}
                    </Badge>
                    {canWriteCrm && intent.status === "pending" ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={resolveIntent.isPending}
                          onClick={() =>
                            resolveIntent.mutate({
                              intentId: intent.id,
                              status: "accepted",
                            })
                          }
                        >
                          <Check className="mr-1 size-3.5" /> Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={resolveIntent.isPending}
                          onClick={() =>
                            resolveIntent.mutate({
                              intentId: intent.id,
                              status: "rejected",
                            })
                          }
                        >
                          <X className="mr-1 size-3.5" /> Rejeitar
                        </Button>
                      </div>
                    ) : null}
                    {canWriteCrm && intent.status === "accepted" ? (
                      <div className="flex w-full gap-2 md:w-auto">
                        <Input
                          className="h-8 md:w-32"
                          placeholder="ID no ERP"
                          value={erpIds[intent.id] ?? ""}
                          onChange={event =>
                            setErpIds(current => ({
                              ...current,
                              [intent.id]: event.target.value,
                            }))
                          }
                        />
                        <Button
                          size="sm"
                          disabled={
                            !erpIds[intent.id]?.trim() ||
                            resolveIntent.isPending
                          }
                          onClick={() =>
                            resolveIntent.mutate({
                              intentId: intent.id,
                              status: "completed",
                              erpExternalId: erpIds[intent.id].trim(),
                            })
                          }
                        >
                          Concluir
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!hasData}
        onRetry={() => refetch()}
        errorIcon={Waves}
        errorTitle="NÃ£o foi possÃ­vel carregar os leads"
        emptyIcon={Waves}
        emptyTitle="Lago vazio"
        emptyDescription="Crie o primeiro lead ou aguarde contatos sem OS aparecerem aqui."
        loadingFallback={<TableSkeleton />}
      >
        {filterEmpty ? (
          <EmptyState
            icon={SearchX}
            title="Nenhum resultado"
            description="Nenhum lead corresponde aos filtros."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setTemperature("all");
                }}
              >
                Limpar filtros
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/70">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/60 bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Temperatura</th>
                  <th className="px-4 py-3 font-semibold">Identidades</th>
                  <th className="px-4 py-3 font-semibold">AÃ§Ãµes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => (
                  <tr
                    key={lead.id}
                    className="border-b border-border/40 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">
                      {lead.displayName}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">
                        {temperatureLabel[lead.temperature]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {lead.identities
                        .map(
                          identity => `${identity.channel}: ${identity.value}`
                        )
                        .join(" Â· ") || "â€”"}
                    </td>
                    <td className="px-4 py-3">
                      {canWriteCrm ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setLocation(`/comercial/leads/${lead.id}`)
                            }
                          >
                            Abrir ficha
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEdit(lead)}
                          >
                            <Pencil className="mr-1 size-3.5" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={createIntent.isPending}
                            onClick={() =>
                              createIntent.mutate({
                                type: "lead_to_customer",
                                crmEntityType: "contact",
                                crmEntityId: lead.id,
                                payload: { displayName: lead.displayName },
                              })
                            }
                          >
                            Converter â†’ ERP
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">â€”</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </QueryState>

      <LeadFormDialog
        open={formOpen}
        onOpenChange={open => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        lead={editing}
      />
    </div>
  );
}
