import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { cockpitTemplateShortcuts } from "@/features/gestao/lib/cockpit";
import { getOpenPeopleReminders } from "@/features/gestao/lib/cockpitPeople";
import { trpc, type RouterOutputs } from "@/features/gestao/lib/trpc";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FileText,
  History,
  Inbox,
  Loader2,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type PeopleData = RouterOutputs["cockpit"]["peopleWorkspace"];
type Person = PeopleData["people"][number];
type OccurrenceRow = Person["occurrences"][number];
type PeopleReminder = PeopleData["reminders"][number];
type VisiblePeopleReminder = PeopleReminder & { isOverdue: boolean };

type PeopleWorkspaceProps = {
  onRegister: (templateKey?: string | null) => void;
};

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

export function PeopleWorkspace({ onRegister }: PeopleWorkspaceProps) {
  const utils = trpc.useUtils();
  const peopleQuery = trpc.cockpit.peopleWorkspace.useQuery();
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [resolveRow, setResolveRow] = useState<OccurrenceRow | null>(null);
  const completeReminder = trpc.cockpit.setStatus.useMutation({
    onSuccess: async () => {
      await invalidatePeople();
      toast.success("Lembrete concluÃ­do.");
    },
    onError: error => toast.error(error.message),
  });

  const people = peopleQuery.data?.people ?? [];
  const reminders = peopleQuery.data?.reminders ?? [];
  const openReminders = getOpenPeopleReminders(reminders);

  useEffect(() => {
    if (!selectedPersonId && people[0]) setSelectedPersonId(people[0].id);
    if (selectedPersonId && !people.some(person => person.id === selectedPersonId)) {
      setSelectedPersonId(people[0]?.id ?? null);
    }
  }, [people, selectedPersonId]);

  const selectedPerson =
    people.find(person => person.id === selectedPersonId) ?? null;
  const allOccurrences = people.flatMap(person => person.occurrences);
  const openOccurrences = allOccurrences.filter(
    row => row.record.status !== "completed"
  );
  const dueFollowUps = openOccurrences.filter(
    row => row.occurrence.followUpAt && row.occurrence.followUpAt < Date.now()
  ).length;
  const medicalCertificates = allOccurrences.filter(
    row => row.occurrence.occurrenceType === "medical_certificate"
  ).length;

  async function invalidatePeople() {
    await Promise.all([
      utils.cockpit.peopleWorkspace.invalidate(),
      utils.cockpit.dashboard.invalidate(),
      utils.cockpit.list.invalidate(),
    ]);
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <PeopleMetric label="FuncionÃ¡rios ativos" value={people.length} />
        <PeopleMetric label="OcorrÃªncias abertas" value={openOccurrences.length} />
        <PeopleMetric label="Lembretes abertos" value={openReminders.length} />
        <PeopleMetric label="Acompanhamentos vencidos" value={dueFollowUps} alert={dueFollowUps > 0} />
        <PeopleMetric label="Atestados registrados" value={medicalCertificates} />
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3 font-condensed text-lg">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Equipe
              </span>
              <Button size="sm" variant="outline" onClick={() => setPersonDialogOpen(true)} className="gap-2">
                <UserPlus className="h-4 w-4" /> Cadastrar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {peopleQuery.isLoading ? (
              <div className="flex min-h-64 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : people.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-background/30 p-6 text-center">
                <Users className="mb-4 h-8 w-8 text-primary/55" />
                <h3 className="font-condensed text-lg font-semibold text-foreground">Equipe ainda nÃ£o cadastrada</h3>
                <p className="mt-2 text-sm text-muted-foreground">A base comeÃ§a vazia. Cadastre o primeiro funcionÃ¡rio para criar a timeline.</p>
                <Button className="mt-5" onClick={() => setPersonDialogOpen(true)}>Cadastrar funcionÃ¡rio</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {people.map(person => {
                  const openCount = person.occurrences.filter(row => row.record.status !== "completed").length;
                  const overdue = person.occurrences.filter(row => row.record.status !== "completed" && row.occurrence.followUpAt && row.occurrence.followUpAt < Date.now()).length;
                  const selected = person.id === selectedPersonId;
                  return (
                    <button key={person.id} type="button" onClick={() => setSelectedPersonId(person.id)} className={`w-full rounded-lg border p-3 text-left transition-colors ${selected ? "border-primary bg-primary/[0.07]" : "border-border/60 bg-background/35 hover:border-primary/30"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-condensed text-sm font-bold text-foreground">{person.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{person.roleTitle || "FunÃ§Ã£o nÃ£o informada"}</p>
                        </div>
                        {overdue > 0 ? (
                          <Badge className="bg-primary/15 text-primary hover:bg-primary/15">{overdue} alerta{overdue > 1 ? "s" : ""}</Badge>
                        ) : (
                          <Badge variant="outline" className="border-border/70 text-muted-foreground">{openCount} aberto{openCount === 1 ? "" : "s"}</Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-h-[470px] border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="flex flex-col gap-3 font-condensed text-lg sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                {selectedPerson ? `Linha do tempo Â· ${selectedPerson.name}` : "Linha do tempo"}
              </span>
              {selectedPerson && (
                <Button size="sm" onClick={() => onRegister("people-lateness")} className="gap-2">
                  <Plus className="h-4 w-4" /> Nova ocorrÃªncia
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedPerson ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-background/30 p-6 text-center">
                <Inbox className="mb-3 h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Selecione ou cadastre um funcionÃ¡rio para consultar sua timeline.</p>
              </div>
            ) : selectedPerson.occurrences.length === 0 ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-background/30 p-6 text-center">
                <CheckCircle2 className="mb-3 h-7 w-7 text-primary/55" />
                <h3 className="font-condensed text-lg font-semibold text-foreground">Nenhum registro para este funcionÃ¡rio</h3>
                <p className="mt-2 text-sm text-muted-foreground">Use um modelo rÃ¡pido ou o formulÃ¡rio adaptÃ¡vel para iniciar a linha do tempo.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedPerson.occurrences.map(row => (
                  <OccurrenceTimelineItem key={row.record.id} row={row} onResolve={() => setResolveRow(row)} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PeopleReminders
        reminders={openReminders}
        onCreate={() => onRegister("people-follow-up")}
        onComplete={id => completeReminder.mutate({ id, status: "completed" })}
        completing={completeReminder.isPending}
      />

      <section className="grid gap-3 md:grid-cols-3">
        {cockpitTemplateShortcuts.filter(template => template.area === "people").map(template => (
          <button key={template.key} type="button" onClick={() => onRegister(template.key)} className="group flex items-center justify-between rounded-lg border border-border/60 bg-card p-4 text-left transition-colors hover:border-primary/40">
            <div><p className="text-[10px] font-condensed font-semibold uppercase tracking-[0.15em] text-primary">Rotina rÃ¡pida</p><p className="mt-1 font-condensed text-sm font-semibold text-foreground">{template.title}</p></div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </button>
        ))}
      </section>

      <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.045] p-3 text-xs text-amber-100/80">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        Este mÃ³dulo organiza fatos, documentos e acompanhamentos. AdvertÃªncias e penalidades permanecem sob decisÃ£o humana e validaÃ§Ã£o das regras internas aplicÃ¡veis.
      </div>

      <CreatePersonDialog open={personDialogOpen} onOpenChange={setPersonDialogOpen} onCreated={invalidatePeople} />
      <ResolveOccurrenceDialog row={resolveRow} onOpenChange={open => !open && setResolveRow(null)} onResolved={invalidatePeople} />
    </div>
  );
}

function PeopleReminders({
  reminders,
  onCreate,
  onComplete,
  completing,
}: {
  reminders: VisiblePeopleReminder[];
  onCreate: () => void;
  onComplete: (id: string) => void;
  completing: boolean;
}) {
  const sorted = reminders;

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3 font-condensed text-lg">
          <span className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" /> Lembretes internos
          </span>
          <Button size="sm" variant="outline" onClick={onCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Novo lembrete
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 bg-background/30 p-5 text-center text-sm text-muted-foreground">
            Nenhum lembrete interno aberto. Os jobs manuais do dia aparecerÃ£o aqui em ordem FIFO.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map(reminder => {
              const overdue = reminder.isOverdue;
              return (
                <div key={reminder.id} className={`rounded-lg border p-3 ${overdue ? "border-primary/45 bg-primary/[0.055]" : "border-border/60 bg-background/35"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant="outline" className={overdue ? "border-primary/30 text-primary" : "border-amber-500/25 text-amber-300"}>{overdue ? "Vencido" : "Pendente"}</Badge>
                      <h4 className="mt-2 font-condensed text-sm font-bold text-foreground">{reminder.title}</h4>
                      {reminder.summary && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{reminder.summary}</p>}
                    </div>
                    {reminder.dueAt && <span className="shrink-0 text-[10px] text-muted-foreground">{new Date(reminder.dueAt).toLocaleDateString("pt-BR")}</span>}
                  </div>
                  <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => onComplete(reminder.id)} disabled={completing}>Concluir</Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OccurrenceTimelineItem({ row, onResolve }: { row: OccurrenceRow; onResolve: () => void }) {
  const open = row.record.status !== "completed";
  const overdue = open && row.occurrence.followUpAt && row.occurrence.followUpAt < Date.now();
  return (
    <div className={`relative rounded-lg border p-4 ${overdue ? "border-primary/45 bg-primary/[0.055]" : "border-border/60 bg-background/35"}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/20 text-primary">{occurrenceLabels[row.occurrence.occurrenceType]}</Badge>
            <Badge variant="outline" className={open ? "border-amber-500/25 text-amber-300" : "border-emerald-500/25 text-emerald-300"}>{open ? "Em acompanhamento" : "Encerrada"}</Badge>
            {overdue && <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Atrasado</Badge>}
          </div>
          <h4 className="mt-2 font-condensed text-base font-bold text-foreground">{row.record.title}</h4>
          {row.occurrence.details && <p className="mt-1 text-xs text-muted-foreground">{row.occurrence.details}</p>}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{new Date(row.occurrence.occurredAt).toLocaleDateString("pt-BR")}</span>
      </div>
      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        {row.occurrence.nextStep && <div className="rounded-md border border-border/50 bg-background/40 p-2"><span className="text-muted-foreground">PrÃ³ximo passo</span><p className="mt-1 text-foreground">{row.occurrence.nextStep}</p></div>}
        {row.occurrence.followUpAt && <div className="rounded-md border border-border/50 bg-background/40 p-2"><span className="flex items-center gap-1 text-muted-foreground"><CalendarClock className="h-3.5 w-3.5" /> Acompanhar em</span><p className="mt-1 text-foreground">{new Date(row.occurrence.followUpAt).toLocaleDateString("pt-BR")}</p></div>}
      </div>
      {row.occurrence.documentUrl && <a href={row.occurrence.documentUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"><FileText className="h-4 w-4" /> Abrir documento <ExternalLink className="h-3 w-3" /></a>}
      {row.occurrence.outcome && <div className="mt-3 border-l-2 border-primary pl-3 text-xs text-foreground"><span className="text-muted-foreground">Desfecho: </span>{row.occurrence.outcome}</div>}
      {open && <div className="mt-4 flex justify-end"><Button size="sm" variant="outline" onClick={onResolve}>Registrar desfecho</Button></div>}
    </div>
  );
}

function CreatePersonDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (open: boolean) => void; onCreated: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [notes, setNotes] = useState("");
  const mutation = trpc.cockpit.createPerson.useMutation();

  useEffect(() => { if (open) { setName(""); setRoleTitle(""); setStartedAt(""); setNotes(""); } }, [open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return toast.error("Informe o nome do funcionÃ¡rio.");
    try {
      await mutation.mutateAsync({ name: name.trim(), roleTitle: roleTitle.trim() || undefined, startedAt: startedAt ? new Date(`${startedAt}T12:00:00`).getTime() : undefined, notes: notes.trim() || undefined });
      await onCreated();
      onOpenChange(false);
      toast.success("FuncionÃ¡rio adicionado ao workspace de homologaÃ§Ã£o.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "NÃ£o foi possÃ­vel cadastrar."); }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="border-primary/20 bg-card sm:max-w-lg"><DialogHeader><DialogTitle className="dap-heading text-2xl">NOVO <span className="text-primary">FUNCIONÃRIO</span></DialogTitle><DialogDescription>Cadastro exclusivo da base de homologaÃ§Ã£o.</DialogDescription></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><Field label="Nome"><Input value={name} onChange={event => setName(event.target.value)} autoFocus /></Field><Field label="FunÃ§Ã£o"><Input value={roleTitle} onChange={event => setRoleTitle(event.target.value)} /></Field><Field label="Data de inÃ­cio"><Input type="date" value={startedAt} onChange={event => setStartedAt(event.target.value)} /></Field><Field label="ObservaÃ§Ãµes"><Textarea value={notes} onChange={event => setNotes(event.target.value)} rows={3} /></Field><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Cadastrar</Button></DialogFooter></form></DialogContent></Dialog>;
}

function ResolveOccurrenceDialog({ row, onOpenChange, onResolved }: { row: OccurrenceRow | null; onOpenChange: (open: boolean) => void; onResolved: () => Promise<void> }) {
  const [outcome, setOutcome] = useState("");
  const mutation = trpc.cockpit.resolveOccurrence.useMutation();
  useEffect(() => { if (row) setOutcome(""); }, [row]);
  async function handleSubmit(event: React.FormEvent) { event.preventDefault(); if (!row || !outcome.trim()) return toast.error("Informe o desfecho."); try { await mutation.mutateAsync({ recordId: row.record.id, outcome: outcome.trim() }); await onResolved(); onOpenChange(false); toast.success("OcorrÃªncia encerrada com desfecho registrado."); } catch (error) { toast.error(error instanceof Error ? error.message : "NÃ£o foi possÃ­vel encerrar."); } }
  return <Dialog open={Boolean(row)} onOpenChange={onOpenChange}><DialogContent className="border-primary/20 bg-card sm:max-w-lg"><DialogHeader><DialogTitle className="dap-heading text-2xl">REGISTRAR <span className="text-primary">DESFECHO</span></DialogTitle><DialogDescription>{row?.record.title}</DialogDescription></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><Field label="Desfecho e aprendizado"><Textarea value={outcome} onChange={event => setOutcome(event.target.value)} rows={5} autoFocus /></Field><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Encerrar ocorrÃªncia</Button></DialogFooter></form></DialogContent></Dialog>;
}

function PeopleMetric({ label, value, alert = false }: { label: string; value: number; alert?: boolean }) {
  return <div className={`rounded-lg border p-4 ${alert ? "border-primary/45 bg-primary/[0.07]" : "border-border/60 bg-card"}`}><p className="text-[10px] font-condensed font-semibold uppercase tracking-[0.15em] text-muted-foreground">{label}</p><p className={`mt-2 font-condensed text-2xl font-bold ${alert ? "text-primary" : "text-foreground"}`}>{value}</p></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label className="font-condensed text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>{children}</div>;
}
