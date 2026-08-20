import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  cockpitAreaLabels,
  cockpitAreaOrder,
  cockpitTemplateShortcuts,
  type CockpitArea,
  type CockpitRecordType,
  type CockpitSection,
} from "@/features/gestao/lib/cockpit";
import { trpc } from "@/features/gestao/lib/trpc";
import {
  Bell,
  BriefcaseBusiness,
  ClipboardCheck,
  FileWarning,
  FlaskConical,
  Gauge,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type CockpitRegisterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeSection: CockpitSection;
  templateKey: string | null;
  onCreated: () => void;
};

const recordTypes: {
  value: CockpitRecordType;
  label: string;
  description: string;
  icon: typeof Bell;
}[] = [
  { value: "routine", label: "Rotina", description: "Atividade recorrente ou procedimento", icon: ClipboardCheck },
  { value: "decision", label: "DecisÃ£o", description: "Comparar cenÃ¡rios e acompanhar impacto", icon: Gauge },
  { value: "project", label: "Projeto", description: "Objetivo, prazo e prÃ³ximos passos", icon: BriefcaseBusiness },
  { value: "test", label: "Teste", description: "HipÃ³tese, mÃ©trica e conclusÃ£o", icon: FlaskConical },
  { value: "occurrence", label: "OcorrÃªncia", description: "Fato, documento e acompanhamento", icon: FileWarning },
  { value: "reminder", label: "Lembrete", description: "AÃ§Ã£o interna com vencimento", icon: Bell },
];

const occurrenceLabels = {
  lateness: "Atraso",
  absence: "Falta",
  medical_certificate: "Atestado",
  conversation: "Conversa",
  praise: "Elogio",
  guidance: "OrientaÃ§Ã£o",
  warning: "AdvertÃªncia",
  penalty: "Penalidade",
  reminder: "Lembrete",
} as const;

const decisionLabels = {
  supplier_discount: "Desconto com fornecedor",
  debt_payment: "Pagamento de dÃ­vida",
  customer_advance: "Adiantamento de cliente",
  renegotiation: "RenegociaÃ§Ã£o",
  anticipation: "AntecipaÃ§Ã£o",
  custom: "Outra decisÃ£o",
} as const;

type ScenarioDraft = {
  id: string;
  label: string;
  description: string;
  isBaseline: boolean;
  isSelected: boolean;
  negotiatedAmount: string;
  terms: string;
  cashImpactNow: string;
  cashImpact30: string;
  cashImpact60: string;
  cashImpact90: string;
  savingsAmount: string;
  marginImpactPct: string;
  operationalRisk: "low" | "medium" | "high";
  riskNotes: string;
};

function createScenario(isBaseline = false): ScenarioDraft {
  return {
    id: crypto.randomUUID(),
    label: isBaseline ? "CenÃ¡rio normal" : "Nova alternativa",
    description: isBaseline ? "O que aconteceria sem intervenÃ§Ã£o gerencial" : "",
    isBaseline,
    isSelected: false,
    negotiatedAmount: "",
    terms: "",
    cashImpactNow: "",
    cashImpact30: "",
    cashImpact60: "",
    cashImpact90: "",
    savingsAmount: "",
    marginImpactPct: "",
    operationalRisk: "medium",
    riskNotes: "",
  };
}

function dateToTimestamp(value: string) {
  return value ? new Date(`${value}T12:00:00`).getTime() : undefined;
}

function normalizeMoney(value: string) {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  return normalized || undefined;
}

export function CockpitRegisterDialog({
  open,
  onOpenChange,
  activeSection,
  templateKey,
  onCreated,
}: CockpitRegisterDialogProps) {
  const template = useMemo(
    () => cockpitTemplateShortcuts.find(item => item.key === templateKey),
    [templateKey]
  );
  const defaultArea: CockpitArea =
    activeSection === "today" ? "operations" : activeSection;

  const [type, setType] = useState<CockpitRecordType>("routine");
  const [area, setArea] = useState<CockpitArea>(defaultArea);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [priority, setPriority] = useState<"urgent" | "high" | "medium" | "low">("medium");
  const [dueDate, setDueDate] = useState("");
  const [objective, setObjective] = useState("");
  const [expectedResult, setExpectedResult] = useState("");
  const [expectedImpact, setExpectedImpact] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [changedVariable, setChangedVariable] = useState("");
  const [baseline, setBaseline] = useState("");
  const [successMetric, setSuccessMetric] = useState("");
  const [successCriterion, setSuccessCriterion] = useState("");
  const [projectRecordId, setProjectRecordId] = useState("independent");
  const [occurrenceType, setOccurrenceType] = useState<keyof typeof occurrenceLabels>("lateness");
  const [personId, setPersonId] = useState("unassigned");
  const [documentUrl, setDocumentUrl] = useState("");
  const [occurredDate, setOccurredDate] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [decisionType, setDecisionType] = useState<keyof typeof decisionLabels>("custom");
  const [counterpartyType, setCounterpartyType] = useState<"supplier" | "customer" | "creditor" | "other">("other");
  const [counterpartyName, setCounterpartyName] = useState("");
  const [originalAmount, setOriginalAmount] = useState("");
  const [originalDueDate, setOriginalDueDate] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [scenarios, setScenarios] = useState<ScenarioDraft[]>([
    createScenario(true),
  ]);

  const createMutation = trpc.cockpit.create.useMutation();
  const projectFilter = useMemo(() => ({ type: "project" as const }), []);
  const projectQuery = trpc.cockpit.list.useQuery(projectFilter, {
    enabled: open && type === "test",
  });
  const peopleQuery = trpc.cockpit.peopleWorkspace.useQuery(undefined, {
    enabled: open && type === "occurrence",
  });

  useEffect(() => {
    if (!open) return;
    const today = new Date().toISOString().slice(0, 10);
    setType(template?.type ?? "routine");
    setArea(template?.area ?? defaultArea);
    setTitle(template?.title ?? "");
    setSummary("");
    setPriority("medium");
    setDueDate("");
    setObjective("");
    setExpectedResult("");
    setExpectedImpact("");
    setNextStep("");
    setHypothesis("");
    setChangedVariable("");
    setBaseline("");
    setSuccessMetric("");
    setSuccessCriterion("");
    setProjectRecordId("independent");
    setOccurrenceType(
      template && "occurrenceType" in template ? template.occurrenceType ?? "lateness" : "lateness"
    );
    setPersonId("unassigned");
    setDocumentUrl("");
    setOccurredDate(today);
    setFollowUpDate("");
    setDecisionType(
      template && "decisionType" in template ? template.decisionType ?? "custom" : "custom"
    );
    setCounterpartyType(
      template && "counterpartyType" in template ? template.counterpartyType ?? "other" : "other"
    );
    setCounterpartyName("");
    setOriginalAmount("");
    setOriginalDueDate("");
    setReviewDate("");
    setScenarios([createScenario(true)]);
  }, [open, template, defaultArea]);

  function updateScenario(id: string, patch: Partial<ScenarioDraft>) {
    setScenarios(current =>
      current.map(scenario =>
        scenario.id === id
          ? { ...scenario, ...patch }
          : patch.isSelected
            ? { ...scenario, isSelected: false }
            : scenario
      )
    );
  }

  function removeScenario(id: string) {
    setScenarios(current => current.filter(scenario => scenario.id !== id));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Informe um tÃ­tulo para o registro.");
      return;
    }

    const common = {
      area,
      type,
      title: title.trim(),
      summary: summary.trim() || undefined,
      priority,
      dueAt: dateToTimestamp(dueDate),
      templateKey: template?.key,
    };

    try {
      if (type === "project") {
        if (!objective.trim()) throw new Error("Informe o objetivo do projeto.");
        await createMutation.mutateAsync({
          ...common,
          project: {
            objective: objective.trim(),
            expectedResult: expectedResult.trim() || undefined,
            expectedImpact: expectedImpact.trim() || undefined,
            nextStep: nextStep.trim() || undefined,
            targetAt: dateToTimestamp(dueDate),
          },
        });
      } else if (type === "test") {
        if (!hypothesis.trim()) throw new Error("Informe a hipÃ³tese do teste.");
        await createMutation.mutateAsync({
          ...common,
          test: {
            projectRecordId:
              projectRecordId === "independent" ? undefined : projectRecordId,
            hypothesis: hypothesis.trim(),
            changedVariable: changedVariable.trim() || undefined,
            baseline: baseline.trim() || undefined,
            successMetric: successMetric.trim() || undefined,
            successCriterion: successCriterion.trim() || undefined,
            startedAt: Date.now(),
          },
        });
      } else if (type === "occurrence") {
        await createMutation.mutateAsync({
          ...common,
          occurrence: {
            personId: personId === "unassigned" ? undefined : personId,
            occurrenceType,
            occurredAt: dateToTimestamp(occurredDate) ?? Date.now(),
            details: summary.trim() || undefined,
            documentUrl: documentUrl.trim() || undefined,
            nextStep: nextStep.trim() || undefined,
            followUpAt: dateToTimestamp(followUpDate),
          },
        });
      } else if (type === "decision") {
        const context = summary.trim();
        if (!context) throw new Error("Descreva a situaÃ§Ã£o que exige a decisÃ£o.");
        await createMutation.mutateAsync({
          ...common,
          decision: {
            decisionType,
            counterpartyType,
            counterpartyName: counterpartyName.trim() || undefined,
            context,
            originalAmount: normalizeMoney(originalAmount),
            originalDueAt: dateToTimestamp(originalDueDate),
            reviewAt: dateToTimestamp(reviewDate),
            scenarios: scenarios.map(scenario => ({
              label: scenario.label.trim(),
              description: scenario.description.trim() || undefined,
              isBaseline: scenario.isBaseline,
              isSelected: scenario.isSelected,
              negotiatedAmount: normalizeMoney(scenario.negotiatedAmount),
              terms: scenario.terms.trim() || undefined,
              cashImpactNow: normalizeMoney(scenario.cashImpactNow),
              cashImpact30: normalizeMoney(scenario.cashImpact30),
              cashImpact60: normalizeMoney(scenario.cashImpact60),
              cashImpact90: normalizeMoney(scenario.cashImpact90),
              savingsAmount: normalizeMoney(scenario.savingsAmount),
              marginImpactPct: scenario.marginImpactPct.trim().replace(",", ".") || undefined,
              operationalRisk: scenario.operationalRisk,
              riskNotes: scenario.riskNotes.trim() || undefined,
            })),
          },
        });
      } else {
        await createMutation.mutateAsync(common);
      }

      toast.success("Registro criado no ambiente de homologaÃ§Ã£o.");
      onOpenChange(false);
      onCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "NÃ£o foi possÃ­vel criar o registro.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-primary/20 bg-card sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="dap-heading text-2xl">
            NOVO <span className="text-primary">REGISTRO</span>
          </DialogTitle>
          <DialogDescription>
            FormulÃ¡rio Ãºnico adaptÃ¡vel. O registro serÃ¡ salvo somente no workspace de homologaÃ§Ã£o.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2 sm:grid-cols-3">
            {recordTypes.map(option => {
              const Icon = option.icon;
              const selected = type === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={`rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border/60 bg-background/40 hover:border-primary/35"
                  }`}
                >
                  <Icon className={`mb-2 h-4 w-4 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-condensed text-sm font-semibold text-foreground">{option.label}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{option.description}</p>
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Ãrea">
              <Select value={area} onValueChange={value => setArea(value as CockpitArea)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cockpitAreaOrder.map(value => (
                    <SelectItem key={value} value={value}>{cockpitAreaLabels[value]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Prioridade">
              <Select value={priority} onValueChange={value => setPriority(value as typeof priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">MÃ©dia</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="TÃ­tulo" htmlFor="cockpit-title">
            <Input id="cockpit-title" value={title} onChange={event => setTitle(event.target.value)} placeholder="O que precisa ser feito ou decidido?" autoFocus />
          </Field>

          <Field label={type === "decision" ? "SituaÃ§Ã£o e contexto" : "DescriÃ§Ã£o"} htmlFor="cockpit-summary">
            <Textarea id="cockpit-summary" value={summary} onChange={event => setSummary(event.target.value)} rows={4} placeholder={type === "decision" ? "Explique a situaÃ§Ã£o, o impacto operacional e o que aconteceria sem intervenÃ§Ã£o." : "Registre o contexto necessÃ¡rio para executar este item."} />
          </Field>

          {(type === "routine" || type === "reminder") && (
            <Field label="Vencimento" htmlFor="cockpit-due">
              <Input id="cockpit-due" type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} />
            </Field>
          )}

          {type === "project" && (
            <div className="grid gap-4 rounded-lg border border-border/60 bg-background/30 p-4 md:grid-cols-2">
              <Field label="Objetivo" htmlFor="project-objective"><Textarea id="project-objective" value={objective} onChange={event => setObjective(event.target.value)} rows={3} /></Field>
              <Field label="Resultado esperado" htmlFor="project-result"><Textarea id="project-result" value={expectedResult} onChange={event => setExpectedResult(event.target.value)} rows={3} /></Field>
              <Field label="Impacto esperado" htmlFor="project-impact"><Textarea id="project-impact" value={expectedImpact} onChange={event => setExpectedImpact(event.target.value)} rows={3} /></Field>
              <Field label="PrÃ³ximo passo" htmlFor="project-next"><Textarea id="project-next" value={nextStep} onChange={event => setNextStep(event.target.value)} rows={3} /></Field>
              <Field label="Prazo" htmlFor="project-due"><Input id="project-due" type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} /></Field>
            </div>
          )}

          {type === "test" && (
            <div className="grid gap-4 rounded-lg border border-border/60 bg-background/30 p-4 md:grid-cols-2">
              <Field label="Projeto vinculado">
                <Select value={projectRecordId} onValueChange={setProjectRecordId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="independent">Teste independente</SelectItem>
                    {(projectQuery.data ?? []).map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="HipÃ³tese" htmlFor="test-hypothesis"><Textarea id="test-hypothesis" value={hypothesis} onChange={event => setHypothesis(event.target.value)} rows={3} /></Field>
              <Field label="VariÃ¡vel alterada" htmlFor="test-variable"><Textarea id="test-variable" value={changedVariable} onChange={event => setChangedVariable(event.target.value)} rows={3} /></Field>
              <Field label="CenÃ¡rio-base" htmlFor="test-baseline"><Textarea id="test-baseline" value={baseline} onChange={event => setBaseline(event.target.value)} rows={3} /></Field>
              <Field label="MÃ©trica de sucesso" htmlFor="test-metric"><Input id="test-metric" value={successMetric} onChange={event => setSuccessMetric(event.target.value)} /></Field>
              <Field label="CritÃ©rio de sucesso" htmlFor="test-criterion"><Textarea id="test-criterion" value={successCriterion} onChange={event => setSuccessCriterion(event.target.value)} rows={3} /></Field>
              <Field label="Data de revisÃ£o" htmlFor="test-due"><Input id="test-due" type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} /></Field>
            </div>
          )}

          {type === "occurrence" && (
            <div className="grid gap-4 rounded-lg border border-border/60 bg-background/30 p-4 md:grid-cols-2">
              <Field label="FuncionÃ¡rio">
                <Select value={personId} onValueChange={setPersonId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Sem vÃ­nculo</SelectItem>
                    {(peopleQuery.data?.people ?? []).map(person => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}{person.roleTitle ? ` Â· ${person.roleTitle}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Tipo de ocorrÃªncia">
                <Select value={occurrenceType} onValueChange={value => setOccurrenceType(value as keyof typeof occurrenceLabels)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(occurrenceLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Data do fato" htmlFor="occurrence-date"><Input id="occurrence-date" type="date" value={occurredDate} onChange={event => setOccurredDate(event.target.value)} /></Field>
              <Field label="PrÃ³ximo passo" htmlFor="occurrence-next"><Textarea id="occurrence-next" value={nextStep} onChange={event => setNextStep(event.target.value)} rows={3} /></Field>
              <Field label="Acompanhar em" htmlFor="occurrence-follow"><Input id="occurrence-follow" type="date" value={followUpDate} onChange={event => setFollowUpDate(event.target.value)} /></Field>
              <div className="md:col-span-2"><Field label="Link do documento" htmlFor="occurrence-document"><Input id="occurrence-document" type="url" value={documentUrl} onChange={event => setDocumentUrl(event.target.value)} placeholder="https://... (opcional)" /></Field></div>
            </div>
          )}

          {type === "decision" && (
            <div className="space-y-5 rounded-lg border border-primary/20 bg-primary/[0.025] p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tipo de decisÃ£o">
                  <Select value={decisionType} onValueChange={value => setDecisionType(value as keyof typeof decisionLabels)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(decisionLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Relacionamento">
                  <Select value={counterpartyType} onValueChange={value => setCounterpartyType(value as typeof counterpartyType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplier">Fornecedor</SelectItem>
                      <SelectItem value="customer">Cliente</SelectItem>
                      <SelectItem value="creditor">Credor</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Nome da contraparte" htmlFor="decision-counterparty"><Input id="decision-counterparty" value={counterpartyName} onChange={event => setCounterpartyName(event.target.value)} /></Field>
                <Field label="Valor original" htmlFor="decision-amount"><Input id="decision-amount" inputMode="decimal" value={originalAmount} onChange={event => setOriginalAmount(event.target.value)} placeholder="0,00" /></Field>
                <Field label="Vencimento original" htmlFor="decision-due"><Input id="decision-due" type="date" value={originalDueDate} onChange={event => setOriginalDueDate(event.target.value)} /></Field>
                <Field label="Revisar decisÃ£o em" htmlFor="decision-review"><Input id="decision-review" type="date" value={reviewDate} onChange={event => setReviewDate(event.target.value)} /></Field>
              </div>

              <div className="flex items-end justify-between gap-3 border-t border-border/60 pt-4">
                <div>
                  <p className="font-condensed text-base font-semibold text-foreground">ComparaÃ§Ã£o de cenÃ¡rios</p>
                  <p className="text-xs text-muted-foreground">Mantenha o cenÃ¡rio normal e adicione quantas alternativas precisar.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setScenarios(current => [...current, createScenario(false)])}>Adicionar alternativa</Button>
              </div>

              <div className="space-y-4">
                {scenarios.map((scenario, index) => (
                  <div key={scenario.id} className={`rounded-lg border p-4 ${scenario.isSelected ? "border-primary bg-primary/[0.06]" : "border-border/60 bg-background/45"}`}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-condensed text-xs font-bold text-primary">{index + 1}</span>
                        <Badge variant="outline" className={scenario.isBaseline ? "border-amber-500/30 text-amber-300" : "border-primary/20 text-primary"}>{scenario.isBaseline ? "CenÃ¡rio normal" : "Alternativa"}</Badge>
                      </div>
                      {!scenario.isBaseline && <Button type="button" size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => removeScenario(scenario.id)}>Remover</Button>}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <Field label="Nome"><Input value={scenario.label} onChange={event => updateScenario(scenario.id, { label: event.target.value })} /></Field>
                      <Field label="Valor negociado"><Input inputMode="decimal" value={scenario.negotiatedAmount} onChange={event => updateScenario(scenario.id, { negotiatedAmount: event.target.value })} placeholder="0,00" /></Field>
                      <Field label="Economia / custo evitado"><Input inputMode="decimal" value={scenario.savingsAmount} onChange={event => updateScenario(scenario.id, { savingsAmount: event.target.value })} placeholder="0,00" /></Field>
                      <Field label="Impacto na margem (%)"><Input inputMode="decimal" value={scenario.marginImpactPct} onChange={event => updateScenario(scenario.id, { marginImpactPct: event.target.value })} placeholder="0,000" /></Field>
                      <Field label="Caixa agora"><Input inputMode="decimal" value={scenario.cashImpactNow} onChange={event => updateScenario(scenario.id, { cashImpactNow: event.target.value })} placeholder="0,00" /></Field>
                      <Field label="Caixa 30 dias"><Input inputMode="decimal" value={scenario.cashImpact30} onChange={event => updateScenario(scenario.id, { cashImpact30: event.target.value })} placeholder="0,00" /></Field>
                      <Field label="Caixa 60 dias"><Input inputMode="decimal" value={scenario.cashImpact60} onChange={event => updateScenario(scenario.id, { cashImpact60: event.target.value })} placeholder="0,00" /></Field>
                      <Field label="Caixa 90 dias"><Input inputMode="decimal" value={scenario.cashImpact90} onChange={event => updateScenario(scenario.id, { cashImpact90: event.target.value })} placeholder="0,00" /></Field>
                      <Field label="Risco operacional">
                        <Select value={scenario.operationalRisk} onValueChange={value => updateScenario(scenario.id, { operationalRisk: value as ScenarioDraft["operationalRisk"] })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="low">Baixo</SelectItem><SelectItem value="medium">MÃ©dio</SelectItem><SelectItem value="high">Alto</SelectItem></SelectContent>
                        </Select>
                      </Field>
                      <div className="md:col-span-2 xl:col-span-3"><Field label="CondiÃ§Ãµes"><Input value={scenario.terms} onChange={event => updateScenario(scenario.id, { terms: event.target.value })} placeholder="Parcelas, datas, desconto, contrapartidas..." /></Field></div>
                      <div className="md:col-span-2"><Field label="DescriÃ§Ã£o"><Textarea value={scenario.description} onChange={event => updateScenario(scenario.id, { description: event.target.value })} rows={2} /></Field></div>
                      <div className="md:col-span-2"><Field label="Riscos e observaÃ§Ãµes"><Textarea value={scenario.riskNotes} onChange={event => updateScenario(scenario.id, { riskNotes: event.target.value })} rows={2} /></Field></div>
                    </div>
                    <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm text-muted-foreground hover:border-primary/30">
                      <input type="radio" name="selected-scenario" checked={scenario.isSelected} onChange={() => updateScenario(scenario.id, { isSelected: true })} className="accent-[var(--primary)]" />
                      Marcar como decisÃ£o tomada
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending} className="gap-2">
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar em homologaÃ§Ã£o
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="font-condensed text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
