import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  MessageSquare,
  RefreshCw,
  Target,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useLocation, useRoute } from "wouter";
import {
  buildInboxConversationPath,
  buildPipelineOpportunityPath,
} from "./crmNavigation";
import { resolveLeadDetailErrorState } from "./leadDetailState";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  accepted: "Aceito",
  completed: "Concluído",
  rejected: "Rejeitado",
  failed: "Falhou",
};

const contactTypeLabels: Record<string, string> = {
  person: "Pessoa",
  organization: "Empresa",
};

const temperatureLabels: Record<string, string> = {
  hot: "Quente",
  warm: "Morno",
  cold: "Frio",
};

const opportunityStatusLabels: Record<string, string> = {
  open: "Aberta",
  won: "Ganha",
  lost: "Perdida",
  archived: "Arquivada",
};

const conversationStatusLabels: Record<string, string> = {
  open: "Aberta",
  pending: "Pendente",
  resolved: "Resolvida",
  archived: "Arquivada",
};

const pipelineStageLabels: Record<string, string> = {
  stage_novo_lead: "Novo lead",
  stage_primeiro_contato: "Primeiro contato",
  stage_diagnostico_necessidade: "Diagnóstico de necessidade",
  stage_agendamento_sugerido: "Agendamento sugerido",
  stage_agendado: "Agendado",
  stage_veiculo_recebido: "Veículo recebido",
  stage_orcamento_enviado: "Orçamento enviado",
  stage_negociacao: "Negociação",
  stage_aprovado: "Aprovado",
  stage_em_execucao: "Em execução",
  stage_finalizado: "Finalizado",
  stage_entregue: "Entregue",
  stage_pos_venda: "Pós-venda",
  stage_perdido: "Perdido",
};

export default function ComercialLeadDetailPage() {
  const [, params] = useRoute("/comercial/leads/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ?? "";
  const contactQuery = trpc.crm.contacts.get.useQuery(
    { id },
    { enabled: Boolean(id) }
  );
  const opportunitiesQuery = trpc.crm.pipeline.list.useQuery();
  const conversationsQuery = trpc.crm.inbox.listConversations.useQuery();
  const intentsQuery = trpc.crm.conversion.list.useQuery();
  const contact = contactQuery.data;
  const opportunities = opportunitiesQuery.data;
  const conversations = conversationsQuery.data;
  const intents = intentsQuery.data;

  const isLoading =
    contactQuery.isLoading ||
    opportunitiesQuery.isLoading ||
    conversationsQuery.isLoading ||
    intentsQuery.isLoading;
  const isFetching =
    contactQuery.isFetching ||
    opportunitiesQuery.isFetching ||
    conversationsQuery.isFetching ||
    intentsQuery.isFetching;
  const errorState = resolveLeadDetailErrorState({
    contactCode: contactQuery.error?.data?.code,
    queries: [
      {
        hasError: contactQuery.isError,
        hasData: contact !== undefined,
        code: contactQuery.error?.data?.code,
      },
      {
        hasError: opportunitiesQuery.isError,
        hasData: opportunities !== undefined,
        code: opportunitiesQuery.error?.data?.code,
      },
      {
        hasError: conversationsQuery.isError,
        hasData: conversations !== undefined,
        code: conversationsQuery.error?.data?.code,
      },
      {
        hasError: intentsQuery.isError,
        hasData: intents !== undefined,
        code: intentsQuery.error?.data?.code,
      },
    ],
  });

  const contactOpportunities = (opportunities ?? []).filter(
    opportunity => opportunity.contactId === id
  );
  const contactConversations = (conversations ?? []).filter(
    conversation => conversation.contactId === id
  );
  const contactIntents = (intents ?? []).filter(
    intent => intent.crmEntityId === id
  );

  async function retryAll() {
    await Promise.all([
      contactQuery.refetch(),
      opportunitiesQuery.refetch(),
      conversationsQuery.refetch(),
      intentsQuery.refetch(),
    ]);
  }

  const notFoundState = (
    <div className="comercial-surface flex flex-col gap-4 p-6">
      <Button
        variant="ghost"
        className="w-fit"
        onClick={() => setLocation("/comercial/leads")}
      >
        <ArrowLeft className="mr-2 size-4" /> Voltar para leads
      </Button>
      <EmptyState
        title="Lead não encontrado"
        description="A ficha comercial não está disponível."
        icon={UserRound}
      />
    </div>
  );

  if (isLoading) {
    return <LeadDetailSkeleton />;
  }

  if (errorState === "not-found") return notFoundState;

  if (errorState === "unavailable") {
    return (
      <div className="comercial-surface flex flex-col gap-4 p-6">
        <Button
          variant="ghost"
          className="w-fit"
          onClick={() => setLocation("/comercial/leads")}
        >
          <ArrowLeft className="mr-2 size-4" /> Voltar para leads
        </Button>
        <EmptyState
          title="Ficha indisponível"
          description="Sua sessão ou permissão não permite carregar estes dados."
          icon={UserRound}
        />
      </div>
    );
  }

  if (errorState === "retryable") {
    return (
      <div className="comercial-surface flex flex-col gap-4 p-6">
        <Button
          variant="ghost"
          className="w-fit"
          onClick={() => setLocation("/comercial/leads")}
        >
          <ArrowLeft className="mr-2 size-4" /> Voltar para leads
        </Button>
        <EmptyState
          title="Não foi possível carregar a ficha"
          description="Verifique a conexão e tente novamente."
          icon={UserRound}
          action={
            <Button
              variant="outline"
              onClick={() => void retryAll()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Tentar novamente
            </Button>
          }
        />
      </div>
    );
  }

  if (!contact) return notFoundState;

  return (
    <div className="comercial-surface flex flex-col gap-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Comercial · Ficha"
        title={contact.displayName}
        description="Visão consolidada do relacionamento comercial. Dados operacionais permanecem no ERP."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/comercial/leads")}
          >
            <ArrowLeft className="mr-2 size-4" /> Voltar
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="rounded-xl border border-border/70 bg-card/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Contato
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                {contact.displayName}
              </h2>
            </div>
            <Badge
              variant={contact.isOperationalClient ? "default" : "secondary"}
            >
              {contact.isOperationalClient ? "Cliente ERP" : "Lead"}
            </Badge>
          </div>
          <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
            {contactTypeLabels[contact.type] ?? contact.type} · Temperatura{" "}
            {temperatureLabels[contact.temperature] ?? contact.temperature}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {contact.identities.map(identity => (
              <li key={identity.id}>
                {identity.channel}: {identity.value}
              </li>
            ))}
          </ul>
          {contact.notes ? (
            <p className="mt-4 border-t border-border/60 pt-4 text-sm leading-relaxed">
              {contact.notes}
            </p>
          ) : null}
          {contact.erpClientId != null ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Cliente ERP #{contact.erpClientId}
            </p>
          ) : null}
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={Target}
            label="Oportunidades"
            value={contactOpportunities.length}
          />
          <SummaryCard
            icon={MessageSquare}
            label="Conversas"
            value={contactConversations.length}
          />
          <SummaryCard
            icon={ArrowLeft}
            label="Handoffs"
            value={contactIntents.length}
          />
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DetailList title="Oportunidades" icon={Target}>
          {contactOpportunities.length ? (
            contactOpportunities.map(opportunity => (
              <div
                key={opportunity.id}
                className="rounded-lg border border-border/60 bg-background/40 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{opportunity.title}</p>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Badge variant="outline">
                      {opportunityStatusLabels[opportunity.status] ??
                        opportunity.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setLocation(
                          buildPipelineOpportunityPath(opportunity.id)
                        )
                      }
                    >
                      Abrir no Pipeline
                    </Button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Estágio:{" "}
                  {pipelineStageLabels[opportunity.pipelineStageId] ??
                    opportunity.pipelineStageId}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma oportunidade vinculada.
            </p>
          )}
        </DetailList>

        <DetailList title="Conversas" icon={MessageSquare}>
          {contactConversations.length ? (
            contactConversations.map(conversation => (
              <div
                key={conversation.id}
                className="rounded-lg border border-border/60 bg-background/40 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">
                    {conversation.subject || "Conversa sem assunto"}
                  </p>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Badge variant="outline">
                      {conversationStatusLabels[conversation.status] ??
                        conversation.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setLocation(buildInboxConversationPath(conversation.id))
                      }
                    >
                      Abrir no Inbox
                    </Button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {conversation.channelType} · {conversation.unreadCount} não
                  lidas
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma conversa vinculada.
            </p>
          )}
        </DetailList>
      </div>

      <DetailList title="Histórico de handoffs CRM → ERP" icon={ArrowLeft}>
        {contactIntents.length ? (
          contactIntents.map(intent => (
            <div
              key={intent.id}
              className="flex flex-col gap-2 rounded-lg border border-border/60 bg-background/40 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{intent.type}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(intent.submittedAt).toLocaleString("pt-BR")}
                </p>
              </div>
              <Badge
                variant={intent.status === "completed" ? "default" : "outline"}
              >
                {statusLabels[intent.status] ?? intent.status}
              </Badge>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum handoff registrado.
          </p>
        )}
      </DetailList>
    </div>
  );
}

function LeadDetailSkeleton() {
  return (
    <div
      className="comercial-surface space-y-6 p-4 md:p-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Carregando ficha comercial…</span>
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
      <Skeleton className="h-44 w-full rounded-xl" />
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/40 p-4">
      <Icon className="size-4 text-primary" />
      <p className="mt-4 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function DetailList({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/70 bg-card/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
