import { CockpitRegisterDialog } from "@/features/gestao/components/CockpitRegisterDialog";
import { DecisionDetailDialog, type FinancialDecision } from "@/features/gestao/components/DecisionDetailDialog";
import { PeopleWorkspace } from "@/features/gestao/components/PeopleWorkspace";
import { InfrastructureAlertsPanel } from "@/features/gestao/components/InfrastructureAlertsPanel";
import { CockpitTopNav } from "@/features/gestao/components/CockpitTopNav";
import DashboardLayout from "@/features/gestao/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  cockpitAllNav,
  cockpitAreaLabels,
  cockpitAreaOrder,
  cockpitTemplateShortcuts,
  getCockpitSection,
  type CockpitArea,
} from "@/features/gestao/lib/cockpit";
import { trpc } from "@/features/gestao/lib/trpc";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  Gauge,
  Inbox,
  Loader2,
  Plus,
  ScanLine,
  Sparkles,
  PackageSearch,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type CockpitRecordView = {
  id: string;
  area: CockpitArea;
  type: "routine" | "decision" | "project" | "test" | "occurrence" | "reminder" | "task";
  title: string;
  summary: string | null;
  priority: "urgent" | "high" | "medium" | "low";
  status: "planned" | "open" | "in_progress" | "waiting" | "completed" | "cancelled" | "archived";
  dueAt: number | null;
  templateKey: string | null;
  createdAt: Date;
};

const typeLabels: Record<CockpitRecordView["type"], string> = {
  routine: "Rotina",
  decision: "DecisÃ£o",
  project: "Projeto",
  test: "Teste",
  occurrence: "OcorrÃªncia",
  reminder: "Lembrete",
  task: "Tarefa",
};

const activeStatuses = new Set(["planned", "open", "in_progress", "waiting"]);

export default function Cockpit() {
  const [location] = useLocation();
  const activeSection = getCockpitSection(location);
  const activeItem = cockpitAllNav.find(item => item.key === activeSection) ?? cockpitAllNav[0];
  const [registerOpen, setRegisterOpen] = useState(false);
  const [templateKey, setTemplateKey] = useState<string | null>(null);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  const utils = trpc.useUtils();
  const dashboardQuery = trpc.cockpit.dashboard.useQuery();
  const financialQuery = trpc.cockpit.financialDecisions.useQuery(undefined, {
    enabled: activeSection === "financial",
  });
  const statusMutation = trpc.cockpit.setStatus.useMutation({
    onSuccess: async () => {
      await utils.cockpit.dashboard.invalidate();
      toast.success("Item concluÃ­do.");
    },
    onError: error => toast.error(error.message),
  });

  const records = (dashboardQuery.data?.records ?? []) as CockpitRecordView[];

  function openRegister(nextTemplateKey: string | null = null) {
    setTemplateKey(nextTemplateKey);
    setRegisterOpen(true);
  }

  async function refreshData() {
    await Promise.all([
      utils.cockpit.dashboard.invalidate(),
      utils.cockpit.list.invalidate(),
      utils.cockpit.financialDecisions.invalidate(),
      utils.cockpit.peopleWorkspace.invalidate(),
    ]);
  }

  const selectedDecision =
    financialQuery.data?.find(item => item.record.id === selectedDecisionId) ?? null;

  return (
    <DashboardLayout>
      <CockpitTopNav activeSection={activeSection} onRegister={() => openRegister()} />

      <div className="space-y-6">
        <header className="flex flex-col gap-4 border-b border-border/50 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Cockpit de OperaÃ§Ã£o</Badge>
              <span className="text-xs font-condensed uppercase tracking-[0.18em] text-muted-foreground">Workspace pessoal</span>
            </div>
            <h1 className="dap-heading text-3xl text-foreground md:text-4xl">
              {activeSection === "today" ? "COMANDO DO " : "ÃREA "}
              <span className="text-primary">{activeItem.label.toUpperCase()}</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{activeItem.description}</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-xs text-amber-200">
            <Sparkles className="h-4 w-4" />
            {dashboardQuery.data?.workspace.name ?? "Inicializando homologaÃ§Ã£o"}
          </div>
        </header>

        {activeSection === "today" ? (
          <TodayWorkspace
            records={records}
            loading={dashboardQuery.isLoading}
            onRegister={openRegister}
            onComplete={id => statusMutation.mutate({ id, status: "completed" })}
          />
        ) : activeSection === "financial" ? (
          <FinancialWorkspace
            decisions={financialQuery.data ?? []}
            loading={financialQuery.isLoading}
            onRegister={openRegister}
            onOpenDecision={decision => setSelectedDecisionId(decision.record.id)}
          />
        ) : activeSection === "people" ? (
          <PeopleWorkspace onRegister={openRegister} />
        ) : activeSection === "infrastructure" ? (
          <InfrastructureWorkspace
            records={records.filter(record => record.area === "infrastructure")}
            loading={dashboardQuery.isLoading}
            onRegister={openRegister}
            onComplete={id => statusMutation.mutate({ id, status: "completed" })}
          />
        ) : (
          <AreaWorkspace
            area={activeSection}
            records={records.filter(record => record.area === activeSection)}
            loading={dashboardQuery.isLoading}
            onRegister={openRegister}
            onComplete={id => statusMutation.mutate({ id, status: "completed" })}
          />
        )}
      </div>

      <CockpitRegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        activeSection={activeSection}
        templateKey={templateKey}
        onCreated={refreshData}
      />
      <DecisionDetailDialog
        open={Boolean(selectedDecisionId)}
        onOpenChange={open => !open && setSelectedDecisionId(null)}
        decision={selectedDecision}
        onUpdated={refreshData}
      />
    </DashboardLayout>
  );
}

function FinancialWorkspace({
  decisions,
  loading,
  onRegister,
  onOpenDecision,
}: {
  decisions: FinancialDecision[];
  loading: boolean;
  onRegister: (templateKey?: string | null) => void;
  onOpenDecision: (decision: FinancialDecision) => void;
}) {
  const active = decisions.filter(item => item.decision.decisionStatus !== "closed");
  const originalValue = active.reduce(
    (total, item) => total + Number(item.decision.originalAmount ?? 0),
    0
  );
  const alternatives = active.reduce(
    (total, item) =>
      total + item.scenarios.filter(scenario => !scenario.isBaseline).length,
    0
  );
  const reviewAlerts = active.filter(
    item => item.decision.reviewAt && item.decision.reviewAt < Date.now()
  ).length;

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FinancialMetric label="DecisÃµes abertas" value={String(active.length)} />
        <FinancialMetric
          label="Valor sob decisÃ£o"
          value={originalValue.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        />
        <FinancialMetric
          label="Alternativas comparadas"
          value={String(alternatives)}
        />
        <FinancialMetric
          label="RevisÃµes vencidas"
          value={String(reviewAlerts)}
          alert={reviewAlerts > 0}
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="min-h-[450px] border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3 font-condensed text-lg">
              <span className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                DecisÃµes financeiras
              </span>
              {active.length > 0 && (
                <Badge variant="outline" className="border-primary/20 text-primary">
                  {active.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex min-h-72 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : active.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-background/30 p-6 text-center">
                <Gauge className="mb-4 h-8 w-8 text-primary/55" />
                <h3 className="font-condensed text-lg font-semibold text-foreground">
                  Nenhuma decisÃ£o financeira aberta
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Crie o cenÃ¡rio normal, compare alternativas e acompanhe o impacto real.
                </p>
                <Button
                  className="mt-5"
                  onClick={() => onRegister("supplier-discount")}
                >
                  Criar primeira simulaÃ§Ã£o
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {active.map(item => {
                  const selected = item.scenarios.find(scenario => scenario.isSelected);
                  const baseline = item.scenarios.find(scenario => scenario.isBaseline);
                  return (
                    <button
                      key={item.record.id}
                      type="button"
                      onClick={() => onOpenDecision(item)}
                      className="group w-full rounded-lg border border-border/60 bg-background/35 p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.035]"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="border-primary/20 text-primary">
                              {item.decision.decisionStatus === "analyzing"
                                ? "Em anÃ¡lise"
                                : item.decision.decisionStatus === "decided"
                                  ? "Decidida"
                                  : "Em revisÃ£o"}
                            </Badge>
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              {item.scenarios.length} cenÃ¡rio
                              {item.scenarios.length === 1 ? "" : "s"}
                            </span>
                          </div>
                          <h3 className="mt-2 font-condensed text-base font-bold text-foreground">
                            {item.record.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {item.decision.context}
                          </p>
                        </div>
                        <div className="shrink-0 text-left sm:text-right">
                          <p className="font-condensed text-lg font-bold text-foreground">
                            {Number(item.decision.originalAmount ?? 0).toLocaleString(
                              "pt-BR",
                              { style: "currency", currency: "BRL" }
                            )}
                          </p>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            valor original
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-md border border-amber-500/15 bg-amber-500/[0.025] p-2">
                          <p className="text-[9px] uppercase tracking-wide text-amber-300">
                            CenÃ¡rio normal
                          </p>
                          <p className="mt-1 font-condensed text-sm text-foreground">
                            {baseline?.label ?? "NÃ£o informado"}
                          </p>
                        </div>
                        <div className="rounded-md border border-primary/15 bg-primary/[0.025] p-2">
                          <p className="text-[9px] uppercase tracking-wide text-primary">
                            DecisÃ£o tomada
                          </p>
                          <p className="mt-1 font-condensed text-sm text-foreground">
                            {selected?.label ?? "Aguardando escolha"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-end gap-2 font-condensed text-xs font-semibold text-primary">
                        Abrir anÃ¡lise
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/15 bg-primary/[0.025]">
          <CardHeader>
            <CardTitle className="font-condensed text-lg">Modelos financeiros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cockpitTemplateShortcuts
              .filter(template => template.area === "financial")
              .map(template => (
                <button
                  key={template.key}
                  type="button"
                  onClick={() => onRegister(template.key)}
                  className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/40 p-3 text-left transition-colors hover:border-primary/40"
                >
                  <span className="font-condensed text-sm font-semibold text-foreground">
                    {template.title}
                  </span>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </button>
              ))}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => onRegister()}
            >
              <Plus className="h-4 w-4" />
              DecisÃ£o do zero
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FinancialMetric({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        alert
          ? "border-primary/45 bg-primary/[0.07]"
          : "border-border/60 bg-card"
      }`}
    >
      <p className="text-[10px] font-condensed font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-2 font-condensed text-2xl font-bold ${
          alert ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TodayWorkspace({
  records,
  loading,
  onRegister,
  onComplete,
}: {
  records: CockpitRecordView[];
  loading: boolean;
  onRegister: (templateKey?: string | null) => void;
  onComplete: (id: string) => void;
}) {
  const active = useMemo(
    () => records.filter(record => activeStatuses.has(record.status)),
    [records]
  );
  const priorities = useMemo(
    () =>
      active
        .filter(record => record.dueAt)
        .sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0) || a.createdAt.getTime() - b.createdAt.getTime()),
    [active]
  );
  const decisions = active.filter(record => record.type === "decision");
  const projectsAndTests = active.filter(record => record.type === "project" || record.type === "test");

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3">
          <h2 className="font-condensed text-lg font-bold text-foreground">AÃ§Ãµes rÃ¡pidas</h2>
          <p className="text-xs text-muted-foreground">Comece por um modelo ou registre algo do zero.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {cockpitTemplateShortcuts.map(template => (
            <button
              key={template.key}
              type="button"
              onClick={() => onRegister(template.key)}
              className="group flex min-h-24 items-center justify-between rounded-lg border border-border/60 bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div>
                <p className="mb-1 text-[10px] font-condensed font-semibold uppercase tracking-[0.16em] text-primary">
                  {cockpitAreaLabels[template.area]}
                </p>
                <p className="font-condensed text-base font-semibold text-foreground">{template.title}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </button>
          ))}
        </div>
      </section>

      <AreaPulse records={active} />

      <section className="grid gap-4 lg:grid-cols-3">
        <WorkList
          title="Prioridades do dia"
          description="Itens vencidos e de hoje, preservando ordem FIFO."
          icon={ClipboardList}
          records={priorities}
          loading={loading}
          onComplete={onComplete}
        />
        <WorkList
          title="DecisÃµes em acompanhamento"
          description="Impacto previsto, realizado e diferenÃ§a."
          icon={Gauge}
          records={decisions}
          loading={loading}
          onComplete={onComplete}
        />
        <WorkList
          title="Projetos e testes ativos"
          description="PrÃ³ximos passos, prazos e resultados esperados."
          icon={FlaskConical}
          records={projectsAndTests}
          loading={loading}
          onComplete={onComplete}
        />
      </section>
    </div>
  );
}

function AreaWorkspace({
  area,
  records,
  loading,
  onRegister,
  onComplete,
}: {
  area: CockpitArea;
  records: CockpitRecordView[];
  loading: boolean;
  onRegister: (templateKey?: string | null) => void;
  onComplete: (id: string) => void;
}) {
  const templates = cockpitTemplateShortcuts.filter(template => template.area === area);
  const active = records.filter(record => activeStatuses.has(record.status));
  const overdue = active.filter(record => record.dueAt && record.dueAt < Date.now());
  const projects = active.filter(record => record.type === "project");
  const tests = active.filter(record => record.type === "test");

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AreaMetric label="Itens abertos" value={active.length} tone="neutral" />
        <AreaMetric label="Alertas vencidos" value={overdue.length} tone={overdue.length > 0 ? "alert" : "neutral"} />
        <AreaMetric label="Projetos ativos" value={projects.length} tone="neutral" />
        <AreaMetric label="Testes ativos" value={tests.length} tone="neutral" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <WorkList
          title={`Trabalho de ${cockpitAreaLabels[area]}`}
          description="Registros abertos deste workspace de homologaÃ§Ã£o."
          icon={ClipboardList}
          records={active}
          loading={loading}
          onComplete={onComplete}
          large
        />

        <Card className="border-primary/15 bg-primary/[0.025]">
          <CardHeader><CardTitle className="font-condensed text-lg">Modelos da Ã¡rea</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {templates.length > 0 ? (
              templates.map(template => (
                <button key={template.key} type="button" onClick={() => onRegister(template.key)} className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/40 p-3 text-left transition-colors hover:border-primary/40">
                  <span className="font-condensed text-sm font-semibold text-foreground">{template.title}</span>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </button>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                Os modelos desta Ã¡rea serÃ£o adicionados conforme o uso real do Cockpit.
              </div>
            )}
            <Button variant="outline" className="w-full gap-2" onClick={() => onRegister()}>
              <Plus className="h-4 w-4" />
              Registrar do zero
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfrastructureWorkspace({
  records,
  loading,
  onRegister,
  onComplete,
}: {
  records: CockpitRecordView[];
  loading: boolean;
  onRegister: (templateKey?: string | null) => void;
  onComplete: (id: string) => void;
}) {
  const active = records.filter(record => activeStatuses.has(record.status));
  const physicalChanges = active.filter(record =>
    record.templateKey === "infrastructure-physical-change" ||
    /obra|layout|fÃ­sica|galpÃ£o|box/i.test(`${record.title} ${record.summary ?? ""}`)
  );
  const licenses = active.filter(record =>
    record.templateKey === "scanner-license-acquisition" ||
    /licenÃ§a|scanner|odis|autel|vcds/i.test(`${record.title} ${record.summary ?? ""}`)
  );
  const acquisitions = active.filter(record =>
    record.templateKey === "infrastructure-equipment" || record.type === "decision"
  );
  const projects = active.filter(record => record.type === "project");
  const decisions = active.filter(record => record.type === "decision");
  const routines = active.filter(record => record.type === "routine");
  const tests = active.filter(record => record.type === "test");
  const overdue = active.filter(record => record.dueAt && record.dueAt < Date.now());
  const templates = cockpitTemplateShortcuts.filter(template => template.area === "infrastructure");

  const workstreams = [
    {
      key: "infrastructure-physical-change",
      title: "AlteraÃ§Ãµes fÃ­sicas",
      description: "Obras, layout, boxes, elÃ©trica e adequaÃ§Ãµes do galpÃ£o.",
      icon: Building2,
      count: physicalChanges.length,
    },
    {
      key: "scanner-license-acquisition",
      title: "LicenÃ§as de scanners",
      description: "AquisiÃ§Ã£o, validade, renovaÃ§Ã£o e fornecedor de cada licenÃ§a.",
      icon: ScanLine,
      count: licenses.length,
    },
    {
      key: "infrastructure-equipment",
      title: "Equipamentos e aquisiÃ§Ãµes",
      description: "Comparar alternativas, custo, impacto e decisÃ£o de compra.",
      icon: PackageSearch,
      count: acquisitions.length,
    },
  ] as const;

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <AreaMetric label="Itens abertos" value={active.length} tone="neutral" />
        <AreaMetric label="Projetos" value={projects.length} tone="neutral" />
        <AreaMetric label="DecisÃµes" value={decisions.length} tone="neutral" />
        <AreaMetric label="Rotinas" value={routines.length} tone="neutral" />
        <AreaMetric label="Testes" value={tests.length} tone="neutral" />
        <AreaMetric label="Prazos vencidos" value={overdue.length} tone={overdue.length > 0 ? "alert" : "neutral"} />
      </section>

      <InfrastructureAlertsPanel
        records={active}
        onRegister={template => onRegister(template)}
        onComplete={onComplete}
      />

      <section className="grid gap-3 lg:grid-cols-3">
        {workstreams.map(workstream => {
          const Icon = workstream.icon;
          return (
            <button
              key={workstream.key}
              type="button"
              onClick={() => onRegister(workstream.key)}
              className="group rounded-xl border border-border/60 bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/[0.06]">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                <Badge variant="outline" className="border-border/70 text-muted-foreground">
                  {workstream.count} aberto{workstream.count === 1 ? "" : "s"}
                </Badge>
              </div>
              <h3 className="mt-4 font-condensed text-base font-bold text-foreground">{workstream.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{workstream.description}</p>
              <span className="mt-4 flex items-center gap-2 font-condensed text-xs font-semibold text-primary">
                Registrar agora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          );
        })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <WorkList
          title="Projetos, aquisiÃ§Ãµes e melhorias"
          description="A base comeÃ§a vazia; registre a primeira intervenÃ§Ã£o, licenÃ§a ou aquisiÃ§Ã£o."
          icon={Building2}
          records={active}
          loading={loading}
          onComplete={onComplete}
          large
        />

        <Card className="border-primary/15 bg-primary/[0.025]">
          <CardHeader>
            <CardTitle className="font-condensed text-lg">Modelos de Infraestrutura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.map(template => (
              <button
                key={template.key}
                type="button"
                onClick={() => onRegister(template.key)}
                className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/40 p-3 text-left transition-colors hover:border-primary/40"
              >
                <span className="font-condensed text-sm font-semibold text-foreground">{template.title}</span>
                <ArrowRight className="h-4 w-4 text-primary" />
              </button>
            ))}
            <Button variant="outline" className="w-full gap-2" onClick={() => onRegister()}>
              <Plus className="h-4 w-4" />
              Registrar do zero
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AreaPulse({ records }: { records: CockpitRecordView[] }) {
  const [, setLocation] = useLocation();

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-condensed text-lg font-bold text-foreground">Pulso operacional por Ã¡rea</h2>
          <p className="text-xs text-muted-foreground">PendÃªncias e alertas do seu trabalho, sem misturar com os indicadores executivos.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cockpitAreaOrder.map(area => {
          const areaRecords = records.filter(record => record.area === area);
          const overdue = areaRecords.filter(record => record.dueAt && record.dueAt < Date.now()).length;
          const navItem = cockpitAllNav.find(item => item.key === area);
          const Icon = navItem?.icon ?? ClipboardList;
          return (
            <button
              key={area}
              type="button"
              onClick={() => navItem && setLocation(navItem.path)}
              className={`rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                overdue > 0
                  ? "border-primary/45 bg-primary/[0.06]"
                  : "border-border/60 bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <Icon className={`h-4 w-4 ${overdue > 0 ? "text-primary" : "text-muted-foreground"}`} />
                {overdue > 0 && <Badge className="h-5 bg-primary/15 px-1.5 text-[9px] text-primary hover:bg-primary/15">{overdue} alerta{overdue > 1 ? "s" : ""}</Badge>}
              </div>
              <p className="mt-3 font-condensed text-sm font-semibold text-foreground">{cockpitAreaLabels[area]}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{areaRecords.length} item{areaRecords.length === 1 ? "" : "s"} aberto{areaRecords.length === 1 ? "" : "s"}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function AreaMetric({ label, value, tone }: { label: string; value: number; tone: "neutral" | "alert" }) {
  return (
    <div className={`rounded-lg border p-4 ${tone === "alert" ? "border-primary/45 bg-primary/[0.07]" : "border-border/60 bg-card"}`}>
      <p className="text-[10px] font-condensed font-semibold uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <p className={`mt-2 font-condensed text-2xl font-bold ${tone === "alert" ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function WorkList({
  title,
  description,
  icon: Icon,
  records,
  loading,
  onComplete,
  large = false,
}: {
  title: string;
  description: string;
  icon: typeof ClipboardList;
  records: CockpitRecordView[];
  loading: boolean;
  onComplete: (id: string) => void;
  large?: boolean;
}) {
  return (
    <Card className={`${large ? "min-h-[430px]" : "min-h-64"} border-border/60 bg-card/80`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 font-condensed text-base">
          <span className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{title}</span>
          {records.length > 0 && <Badge variant="outline" className="border-primary/20 text-primary">{records.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex min-h-32 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : records.length === 0 ? (
          <div className={`${large ? "min-h-72" : "min-h-36"} flex flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-background/30 px-5 text-center`}>
            <Inbox className="mb-3 h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map(record => (
              <div key={record.id} className="group flex items-start gap-3 rounded-lg border border-border/60 bg-background/35 p-3">
                <button type="button" onClick={() => onComplete(record.id)} aria-label={`Concluir ${record.title}`} className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-transparent transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="h-5 border-border/70 px-1.5 text-[9px] uppercase text-muted-foreground">{typeLabels[record.type]}</Badge>
                    <Badge variant="outline" className="h-5 border-primary/20 px-1.5 text-[9px] uppercase text-primary">{cockpitAreaLabels[record.area]}</Badge>
                  </div>
                  <p className="mt-2 font-condensed text-sm font-semibold text-foreground">{record.title}</p>
                  {record.summary && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{record.summary}</p>}
                  <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <span>{record.priority === "urgent" ? "Urgente" : record.priority === "high" ? "Alta" : record.priority === "medium" ? "MÃ©dia" : "Baixa"}</span>
                    {record.dueAt && <><span>Â·</span><span>{new Date(record.dueAt).toLocaleDateString("pt-BR")}</span></>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
