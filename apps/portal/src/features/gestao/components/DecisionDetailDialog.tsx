import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { trpc, type RouterOutputs } from "@/features/gestao/lib/trpc";
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  History,
  Loader2,
  Plus,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type FinancialDecision =
  RouterOutputs["cockpit"]["financialDecisions"][number];

type DecisionDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: FinancialDecision | null;
  onUpdated: () => Promise<void>;
};

const decisionStatusLabels = {
  draft: "Rascunho",
  analyzing: "Em anÃ¡lise",
  decided: "Decidida",
  reviewing: "Em revisÃ£o",
  closed: "Encerrada",
} as const;

const riskLabels = { low: "Baixo", medium: "MÃ©dio", high: "Alto" } as const;

const auditEventLabels = {
  decision_created: "CriaÃ§Ã£o",
  scenario_added: "CenÃ¡rio",
  scenario_selected: "Escolha",
  status_changed: "Status",
  impact_reviewed: "RevisÃ£o",
  decision_closed: "Encerramento",
} as const;

function formatMoney(value: string | null | undefined) {
  if (!value) return "â€”";
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function normalizeMoney(value: string) {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  return normalized || undefined;
}

export function DecisionDetailDialog({
  open,
  onOpenChange,
  decision,
  onUpdated,
}: DecisionDetailDialogProps) {
  const [showNewScenario, setShowNewScenario] = useState(false);
  const [scenarioLabel, setScenarioLabel] = useState("");
  const [scenarioDescription, setScenarioDescription] = useState("");
  const [negotiatedAmount, setNegotiatedAmount] = useState("");
  const [savingsAmount, setSavingsAmount] = useState("");
  const [cashNow, setCashNow] = useState("");
  const [cash30, setCash30] = useState("");
  const [cash60, setCash60] = useState("");
  const [cash90, setCash90] = useState("");
  const [marginImpact, setMarginImpact] = useState("");
  const [risk, setRisk] = useState<"low" | "medium" | "high">("medium");
  const [terms, setTerms] = useState("");
  const [riskNotes, setRiskNotes] = useState("");
  const [rationale, setRationale] = useState("");
  const [actualCash, setActualCash] = useState("");
  const [actualSavings, setActualSavings] = useState("");
  const [actualMargin, setActualMargin] = useState("");
  const [actualOperational, setActualOperational] = useState("");
  const [variance, setVariance] = useState("");
  const [learning, setLearning] = useState("");
  const [closeDecision, setCloseDecision] = useState(false);

  const addScenario = trpc.cockpit.addDecisionScenario.useMutation();
  const chooseScenario = trpc.cockpit.chooseDecisionScenario.useMutation();
  const addReview = trpc.cockpit.addImpactReview.useMutation();

  useEffect(() => {
    if (!open) return;
    setShowNewScenario(false);
    setScenarioLabel("");
    setScenarioDescription("");
    setNegotiatedAmount("");
    setSavingsAmount("");
    setCashNow("");
    setCash30("");
    setCash60("");
    setCash90("");
    setMarginImpact("");
    setRisk("medium");
    setTerms("");
    setRiskNotes("");
    setRationale(decision?.decision.rationale ?? "");
    setActualCash("");
    setActualSavings("");
    setActualMargin("");
    setActualOperational("");
    setVariance("");
    setLearning("");
    setCloseDecision(false);
  }, [open, decision]);

  if (!decision) return null;
  const currentDecision = decision;

  async function handleAddScenario() {
    if (!scenarioLabel.trim()) {
      toast.error("Informe o nome da alternativa.");
      return;
    }
    try {
      await addScenario.mutateAsync({
        decisionRecordId: currentDecision.record.id,
        scenario: {
          label: scenarioLabel.trim(),
          description: scenarioDescription.trim() || undefined,
          negotiatedAmount: normalizeMoney(negotiatedAmount),
          savingsAmount: normalizeMoney(savingsAmount),
          cashImpactNow: normalizeMoney(cashNow),
          cashImpact30: normalizeMoney(cash30),
          cashImpact60: normalizeMoney(cash60),
          cashImpact90: normalizeMoney(cash90),
          marginImpactPct: marginImpact.trim().replace(",", ".") || undefined,
          operationalRisk: risk,
          terms: terms.trim() || undefined,
          riskNotes: riskNotes.trim() || undefined,
        },
      });
      await onUpdated();
      setShowNewScenario(false);
      toast.success("Alternativa adicionada Ã  comparaÃ§Ã£o.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "NÃ£o foi possÃ­vel adicionar a alternativa.");
    }
  }

  async function handleChooseScenario(scenarioId: string) {
    try {
      await chooseScenario.mutateAsync({
        decisionRecordId: currentDecision.record.id,
        scenarioId,
        rationale: rationale.trim() || undefined,
      });
      await onUpdated();
      toast.success("DecisÃ£o registrada e cenÃ¡rio escolhido.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "NÃ£o foi possÃ­vel registrar a decisÃ£o.");
    }
  }

  async function handleAddReview() {
    if (
      !actualCash.trim() &&
      !actualSavings.trim() &&
      !actualOperational.trim() &&
      !variance.trim() &&
      !learning.trim()
    ) {
      toast.error("Registre ao menos um resultado realizado ou aprendizado.");
      return;
    }
    try {
      await addReview.mutateAsync({
        decisionRecordId: currentDecision.record.id,
        scenarioId: currentDecision.decision.chosenScenarioId ?? undefined,
        actualCashImpact: normalizeMoney(actualCash),
        actualSavingsAmount: normalizeMoney(actualSavings),
        actualMarginImpactPct: actualMargin.trim().replace(",", ".") || undefined,
        actualOperationalImpact: actualOperational.trim() || undefined,
        varianceSummary: variance.trim() || undefined,
        learning: learning.trim() || undefined,
        closeDecision,
      });
      await onUpdated();
      toast.success(closeDecision ? "DecisÃ£o revisada e encerrada." : "Impacto realizado registrado.");
      setActualCash("");
      setActualSavings("");
      setActualMargin("");
      setActualOperational("");
      setVariance("");
      setLearning("");
      setCloseDecision(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "NÃ£o foi possÃ­vel registrar o impacto.");
    }
  }

  const selectedScenario = decision.scenarios.find(scenario => scenario.isSelected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94vh] overflow-y-auto border-primary/20 bg-card sm:max-w-6xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/15 text-primary hover:bg-primary/15">DecisÃ£o financeira</Badge>
            <Badge variant="outline" className="border-border/70 text-muted-foreground">
              {decisionStatusLabels[decision.decision.decisionStatus]}
            </Badge>
          </div>
          <DialogTitle className="dap-heading pt-2 text-2xl md:text-3xl">
            {decision.record.title}
          </DialogTitle>
          <DialogDescription>{decision.decision.context}</DialogDescription>
        </DialogHeader>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Valor original" value={formatMoney(decision.decision.originalAmount)} />
          <Metric label="Contraparte" value={decision.decision.counterpartyName || "NÃ£o informada"} />
          <Metric label="Alternativas" value={String(Math.max(0, decision.scenarios.length - 1))} />
          <Metric label="RevisÃµes realizadas" value={String(decision.reviews.length)} />
        </section>

        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-condensed text-lg font-bold text-foreground">CenÃ¡rio normal Ã— alternativas</h3>
              <p className="text-xs text-muted-foreground">Compare caixa, economia, margem e risco antes de registrar a decisÃ£o.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowNewScenario(value => !value)} className="gap-2">
              <Plus className="h-4 w-4" /> Nova alternativa
            </Button>
          </div>

          {showNewScenario && (
            <div className="rounded-lg border border-primary/25 bg-primary/[0.035] p-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Nome da alternativa"><Input value={scenarioLabel} onChange={event => setScenarioLabel(event.target.value)} placeholder="Ex.: pagar Ã  vista com 8%" /></Field>
                <Field label="Valor negociado"><Input inputMode="decimal" value={negotiatedAmount} onChange={event => setNegotiatedAmount(event.target.value)} placeholder="0,00" /></Field>
                <Field label="Economia / custo evitado"><Input inputMode="decimal" value={savingsAmount} onChange={event => setSavingsAmount(event.target.value)} placeholder="0,00" /></Field>
                <Field label="Impacto na margem (%)"><Input inputMode="decimal" value={marginImpact} onChange={event => setMarginImpact(event.target.value)} placeholder="0,000" /></Field>
                <Field label="Caixa agora"><Input inputMode="decimal" value={cashNow} onChange={event => setCashNow(event.target.value)} placeholder="0,00" /></Field>
                <Field label="Caixa 30 dias"><Input inputMode="decimal" value={cash30} onChange={event => setCash30(event.target.value)} placeholder="0,00" /></Field>
                <Field label="Caixa 60 dias"><Input inputMode="decimal" value={cash60} onChange={event => setCash60(event.target.value)} placeholder="0,00" /></Field>
                <Field label="Caixa 90 dias"><Input inputMode="decimal" value={cash90} onChange={event => setCash90(event.target.value)} placeholder="0,00" /></Field>
                <Field label="Risco operacional"><Select value={risk} onValueChange={value => setRisk(value as typeof risk)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Baixo</SelectItem><SelectItem value="medium">MÃ©dio</SelectItem><SelectItem value="high">Alto</SelectItem></SelectContent></Select></Field>
                <div className="md:col-span-2 xl:col-span-3"><Field label="CondiÃ§Ãµes"><Input value={terms} onChange={event => setTerms(event.target.value)} placeholder="Prazos, parcelas e contrapartidas" /></Field></div>
                <div className="md:col-span-2"><Field label="DescriÃ§Ã£o"><Textarea value={scenarioDescription} onChange={event => setScenarioDescription(event.target.value)} rows={2} /></Field></div>
                <div className="md:col-span-2"><Field label="Riscos e observaÃ§Ãµes"><Textarea value={riskNotes} onChange={event => setRiskNotes(event.target.value)} rows={2} /></Field></div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowNewScenario(false)}>Cancelar</Button>
                <Button size="sm" onClick={handleAddScenario} disabled={addScenario.isPending}>{addScenario.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Adicionar Ã  comparaÃ§Ã£o</Button>
              </div>
            </div>
          )}

          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {decision.scenarios.map(scenario => (
              <div key={scenario.id} className={`rounded-lg border p-4 ${scenario.isSelected ? "border-primary bg-primary/[0.06]" : scenario.isBaseline ? "border-amber-500/25 bg-amber-500/[0.035]" : "border-border/60 bg-background/35"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="outline" className={scenario.isBaseline ? "border-amber-500/30 text-amber-300" : "border-primary/20 text-primary"}>{scenario.isBaseline ? "Normal" : "Alternativa"}</Badge>
                    <h4 className="mt-3 font-condensed text-base font-bold text-foreground">{scenario.label}</h4>
                  </div>
                  {scenario.isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
                {scenario.description && <p className="mt-2 text-xs text-muted-foreground">{scenario.description}</p>}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <ScenarioMetric label="Valor" value={formatMoney(scenario.negotiatedAmount)} />
                  <ScenarioMetric label="Economia" value={formatMoney(scenario.savingsAmount)} />
                  <ScenarioMetric label="Caixa agora" value={formatMoney(scenario.cashImpactNow)} />
                  <ScenarioMetric label="Caixa 30d" value={formatMoney(scenario.cashImpact30)} />
                  <ScenarioMetric label="Caixa 60d" value={formatMoney(scenario.cashImpact60)} />
                  <ScenarioMetric label="Caixa 90d" value={formatMoney(scenario.cashImpact90)} />
                  <ScenarioMetric label="Margem" value={scenario.marginImpactPct ? `${scenario.marginImpactPct}%` : "â€”"} />
                  <ScenarioMetric label="Risco" value={riskLabels[scenario.operationalRisk]} />
                </div>
                {scenario.terms && <p className="mt-3 rounded-md bg-background/45 p-2 text-xs text-muted-foreground">{scenario.terms}</p>}
                {!scenario.isSelected && (
                  <Button variant="outline" size="sm" className="mt-4 w-full gap-2" onClick={() => handleChooseScenario(scenario.id)} disabled={chooseScenario.isPending}>
                    Escolher cenÃ¡rio <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Field label="Motivo da decisÃ£o"><Textarea value={rationale} onChange={event => setRationale(event.target.value)} rows={2} placeholder="Por que este cenÃ¡rio foi escolhido?" /></Field>
        </section>

        <section className="rounded-lg border border-border/60 bg-background/30 p-4">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-condensed text-lg font-bold text-foreground">Impacto realizado</h3>
              <p className="text-xs text-muted-foreground">Confronte o resultado efetivo com o cenÃ¡rio escolhido.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Impacto real no caixa"><Input inputMode="decimal" value={actualCash} onChange={event => setActualCash(event.target.value)} placeholder="0,00" /></Field>
            <Field label="Economia real"><Input inputMode="decimal" value={actualSavings} onChange={event => setActualSavings(event.target.value)} placeholder="0,00" /></Field>
            <Field label="Impacto real na margem (%)"><Input inputMode="decimal" value={actualMargin} onChange={event => setActualMargin(event.target.value)} placeholder="0,000" /></Field>
            <div className="md:col-span-3"><Field label="Impacto operacional"><Textarea value={actualOperational} onChange={event => setActualOperational(event.target.value)} rows={2} /></Field></div>
            <div className="md:col-span-3"><Field label="DiferenÃ§a contra a previsÃ£o"><Textarea value={variance} onChange={event => setVariance(event.target.value)} rows={2} /></Field></div>
            <div className="md:col-span-3"><Field label="Aprendizado"><Textarea value={learning} onChange={event => setLearning(event.target.value)} rows={2} /></Field></div>
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={closeDecision} onChange={event => setCloseDecision(event.target.checked)} className="accent-[var(--primary)]" />
            Encerrar a decisÃ£o apÃ³s registrar esta revisÃ£o
          </label>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleAddReview} disabled={addReview.isPending} className="gap-2">
              {addReview.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Registrar impacto realizado
            </Button>
          </div>
        </section>

        {decision.timeline.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <div>
                <h3 className="font-condensed text-lg font-bold">Timeline auditÃ¡vel</h3>
                <p className="text-xs text-muted-foreground">Eventos append-only em ordem cronolÃ³gica.</p>
              </div>
            </div>
            <div className="relative space-y-0 pl-4 before:absolute before:bottom-3 before:left-[7px] before:top-3 before:w-px before:bg-border">
              {decision.timeline.map(event => (
                <div key={event.id} className="relative pb-4 pl-5 last:pb-0">
                  <span className="absolute left-[-12px] top-3 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
                  <div className="rounded-lg border border-border/60 bg-background/35 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-primary/20 text-primary">
                          {auditEventLabels[event.eventType]}
                        </Badge>
                        <span className="font-condensed text-sm font-semibold text-foreground">
                          {event.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(event.occurredAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    {event.description && (
                      <p className="mt-2 text-xs text-muted-foreground">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border/60 bg-background/35 p-3"><p className="text-[10px] font-condensed font-semibold uppercase tracking-[0.15em] text-muted-foreground">{label}</p><p className="mt-2 font-condensed text-lg font-bold text-foreground">{value}</p></div>;
}

function ScenarioMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-border/50 bg-background/40 p-2"><p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 font-condensed font-semibold text-foreground">{value}</p></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label className="font-condensed text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>{children}</div>;
}
