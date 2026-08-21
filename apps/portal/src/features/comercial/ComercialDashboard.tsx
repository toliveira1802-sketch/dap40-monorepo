import { EmptyState } from "@/components/EmptyState";
import { MetricCard } from "@/components/MetricCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  Handshake,
  Inbox,
  Kanban,
  RefreshCw,
  Waves,
} from "lucide-react";
import { useLocation } from "wouter";
import { MetricCardsSkeleton, QueryState } from "./QueryState";

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ComercialDashboardPage() {
  const [, setLocation] = useLocation();
  const { data, isLoading, isError, refetch, isFetching } =
    trpc.crm.dashboard.overview.useQuery(undefined, { refetchInterval: 15_000 });

  return (
    <div className="comercial-surface flex flex-col gap-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Comercial"
        title="Dashboard Comercial"
        description="Funil, inbox e lago de leads no portal único — conforme sua autorização CRM."
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

      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={false}
        onRetry={() => refetch()}
        errorIcon={Handshake}
        errorTitle="Não foi possível carregar o dashboard"
        errorDescription="Verifique a conexão e tente novamente."
        emptyIcon={Handshake}
        loadingFallback={
          <div className="space-y-6">
            <MetricCardsSkeleton />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Leads no lago"
            value={String(data?.leadsTotal ?? 0)}
            caption="Sem OS no ERP"
            icon={Waves}
          />
          <MetricCard
            label="Conversas abertas"
            value={String(data?.openConversations ?? 0)}
            caption="Inbox ativo"
            icon={Inbox}
          />
          <MetricCard
            label="Oportunidades abertas"
            value={String(data?.openOpportunities ?? 0)}
            caption="Pipeline comercial"
            icon={Kanban}
          />
          <MetricCard
            label="Pipeline estimado"
            value={formatMoney(data?.estimatedPipelineCents ?? 0)}
            caption="Soma das abertas"
            icon={Handshake}
          />
        </div>

        <section className="rounded-xl border border-border/70 bg-card/40 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold uppercase italic tracking-tight">
              Funil por estágio
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/comercial/pipeline")}
            >
              Abrir pipeline
            </Button>
          </div>
          {(data?.funnel ?? []).length === 0 ? (
            <EmptyState
              compact
              icon={Kanban}
              title="Funil sem estágios"
              description="Quando houver oportunidades, o funil aparece aqui."
            />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(data?.funnel ?? []).map(stage => (
                <div
                  key={stage.stageId}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-background/40 px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{stage.name}</span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {stage.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setLocation("/comercial/inbox")}>
            <Inbox className="mr-2 size-4" /> Inbox
          </Button>
          <Button
            variant="secondary"
            onClick={() => setLocation("/comercial/leads")}
          >
            <Waves className="mr-2 size-4" /> Lago de leads
          </Button>
          <Button
            variant="secondary"
            onClick={() => setLocation("/comercial/pipeline")}
          >
            <Kanban className="mr-2 size-4" /> Pipeline
          </Button>
        </div>
      </QueryState>
    </div>
  );
}
