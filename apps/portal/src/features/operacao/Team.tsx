import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
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
import { Switch } from "@/components/ui/switch";
import { POSITION_LABELS } from "@/lib/patio";
import type { CollaboratorItem } from "@/lib/routerTypes";
import { trpc } from "@/lib/trpc";
import { COLLABORATOR_POSITIONS } from "@shared/patio";
import { AlertTriangle, Loader2, Plus, RefreshCw, Search, ShieldAlert, UserRoundCog, Users } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

const emptyForm = {
  name: "",
  position: "mechanic" as (typeof COLLABORATOR_POSITIONS)[number],
  specialty: "",
  phone: "",
  email: "",
  active: true,
};

export default function TeamPage() {
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CollaboratorItem | null>(null);
  const { data: access, isLoading: accessLoading } = trpc.access.capabilities.useQuery();
  const { data: team = [], isLoading, isError, error, refetch } = trpc.collaborators.list.useQuery({
    includeInactive,
    search: search || undefined,
  });

  if (accessLoading) return <div className="h-40 animate-pulse rounded-2xl bg-card" />;
  if (!access?.canManageTeam) {
    return <EmptyState icon={ShieldAlert} title="Acesso restrito" description="A gestão da equipe é exclusiva do perfil administrador." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administração"
        title="Equipe"
        description="Cadastre responsáveis operacionais e preserve o histórico mesmo após a desativação."
        actions={<Button onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="size-4" /> Novo colaborador</Button>}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/75 p-4 shadow-panel sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou especialidade" />
        </div>
        <label className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground">
          <Switch checked={includeInactive} onCheckedChange={setIncludeInactive} />
          Exibir inativos
        </label>
      </div>

      {isError ? (
        <EmptyState icon={AlertTriangle} title="Falha ao carregar a equipe" description={error.message} action={<Button variant="outline" onClick={() => void refetch()}><RefreshCw className="size-4" /> Tentar novamente</Button>} />
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-2xl bg-card" />)}</div>
      ) : team.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {team.map(member => (
            <button key={member.id} type="button" onClick={() => { setEditing(member); setDialogOpen(true); }} className="group rounded-2xl border border-border bg-card/80 p-5 text-left shadow-panel transition hover:-translate-y-0.5 hover:border-primary/35">
              <div className="flex items-start justify-between gap-4">
                <div className="grid size-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary"><UserRoundCog className="size-5" /></div>
                <Badge variant="outline" className={member.active ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-400" : "text-muted-foreground"}>{member.active ? "Ativo" : "Inativo"}</Badge>
              </div>
              <h3 className="mt-5 font-display text-xl font-bold uppercase tracking-wide">{member.name}</h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-primary">{POSITION_LABELS[member.position as keyof typeof POSITION_LABELS] || member.position}</p>
              <p className="mt-3 min-h-10 text-sm leading-5 text-muted-foreground">{member.specialty || "Especialidade não informada"}</p>
              <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">{member.phone || member.email || "Contato não informado"}</div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState icon={Users} title="Nenhum colaborador encontrado" description="Cadastre a equipe para atribuir responsáveis aos veículos e medir produtividade." action={<Button onClick={() => setDialogOpen(true)}><Plus className="size-4" /> Cadastrar colaborador</Button>} />
      )}

      <CollaboratorDialog open={dialogOpen} onOpenChange={setDialogOpen} collaborator={editing} />
    </div>
  );
}

function CollaboratorDialog({ open, onOpenChange, collaborator }: { open: boolean; onOpenChange: (open: boolean) => void; collaborator: CollaboratorItem | null }) {
  const [form, setForm] = useState(emptyForm);
  const utils = trpc.useUtils();
  const createMutation = trpc.collaborators.create.useMutation();
  const updateMutation = trpc.collaborators.update.useMutation();
  const pending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;
    setForm(collaborator ? {
      name: collaborator.name,
      position: (collaborator.position as any) || "tecnico",
      specialty: collaborator.specialty ?? "",
      phone: collaborator.phone ?? "",
      email: collaborator.email ?? "",
      active: collaborator.active,
    } : emptyForm);
  }, [open, collaborator]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const data = { ...form, specialty: form.specialty || null, phone: form.phone || null, email: form.email || null };
    try {
      if (collaborator) {
        await updateMutation.mutateAsync({ id: collaborator.id, data });
        toast.success("Colaborador atualizado");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Colaborador cadastrado");
      }
      await utils.collaborators.list.invalidate();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-popover sm:max-w-lg">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold uppercase tracking-wide">{collaborator ? "Editar colaborador" : "Novo colaborador"}</DialogTitle>
            <DialogDescription>Defina função e especialidade para organizar as atribuições do pátio.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2"><Label>Nome</Label><Input value={form.name} onChange={e => setForm(current => ({ ...current, name: e.target.value }))} required /></div>
            <div className="grid gap-2"><Label>Função</Label><Select value={form.position} onValueChange={value => setForm(current => ({ ...current, position: value as typeof form.position }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COLLABORATOR_POSITIONS.map(position => <SelectItem key={position} value={position}>{POSITION_LABELS[position]}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label>Especialidade</Label><Input value={form.specialty} onChange={e => setForm(current => ({ ...current, specialty: e.target.value }))} placeholder="Remap, diagnóstico..." /></div>
            <div className="grid gap-2"><Label>Telefone</Label><Input value={form.phone} onChange={e => setForm(current => ({ ...current, phone: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>E-mail</Label><Input type="email" value={form.email} onChange={e => setForm(current => ({ ...current, email: e.target.value }))} /></div>
            {collaborator ? <label className="flex items-center justify-between rounded-xl border border-border p-3 sm:col-span-2"><span><span className="block text-sm font-medium">Colaborador ativo</span><span className="text-xs text-muted-foreground">Inativos permanecem no histórico.</span></span><Switch checked={form.active} onCheckedChange={active => setForm(current => ({ ...current, active }))} /></label> : null}
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={pending}>{pending ? <Loader2 className="size-4 animate-spin" /> : null} Salvar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
