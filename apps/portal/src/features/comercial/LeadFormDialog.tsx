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
import { trpc } from "@/lib/trpc";
import type { CrmIdentityChannel, CrmTemperature } from "@dap40/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

const TEMPERATURE_OPTIONS: Array<{ value: CrmTemperature; label: string }> = [
  { value: "hot", label: "Quente" },
  { value: "warm", label: "Morno" },
  { value: "cold", label: "Frio" },
];

const IDENTITY_OPTIONS: Array<{ value: CrmIdentityChannel; label: string }> = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Telefone" },
  { value: "email", label: "E-mail" },
];

export type LeadFormValues = {
  id: string;
  displayName: string;
  temperature: CrmTemperature;
  notes: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: LeadFormValues | null;
};

export function LeadFormDialog({ open, onOpenChange, lead }: Props) {
  const utils = trpc.useUtils();
  const isEdit = Boolean(lead);

  const [displayName, setDisplayName] = useState("");
  const [temperature, setTemperature] = useState<CrmTemperature>("warm");
  const [notes, setNotes] = useState("");
  const [identityChannel, setIdentityChannel] = useState<string>("none");
  const [identityValue, setIdentityValue] = useState("");

  useEffect(() => {
    if (!open) return;
    setDisplayName(lead?.displayName ?? "");
    setTemperature(lead?.temperature ?? "warm");
    setNotes(lead?.notes ?? "");
    setIdentityChannel("none");
    setIdentityValue("");
  }, [open, lead]);

  const create = trpc.crm.leads.create.useMutation({
    onSuccess: async () => {
      toast.success("Lead criado");
      await utils.crm.leads.list.invalidate();
      await utils.crm.dashboard.overview.invalidate();
      await utils.crm.contacts.list.invalidate();
      onOpenChange(false);
    },
    onError: error => toast.error(error.message),
  });

  const update = trpc.crm.leads.update.useMutation({
    onSuccess: async () => {
      toast.success("Lead atualizado");
      await utils.crm.leads.list.invalidate();
      await utils.crm.dashboard.overview.invalidate();
      await utils.crm.contacts.list.invalidate();
      onOpenChange(false);
    },
    onError: error => toast.error(error.message),
  });

  const pending = create.isPending || update.isPending;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (displayName.trim().length < 2) {
      toast.error("Informe o nome do lead");
      return;
    }

    if (isEdit && lead) {
      update.mutate({
        id: lead.id,
        displayName: displayName.trim(),
        temperature,
        notes: notes.trim() || null,
      });
      return;
    }

    const channel =
      identityChannel === "none"
        ? undefined
        : (identityChannel as CrmIdentityChannel);
    if (channel && !identityValue.trim()) {
      toast.error("Informe o valor da identidade");
      return;
    }
    if (!channel && identityValue.trim()) {
      toast.error("Selecione o canal da identidade");
      return;
    }

    create.mutate({
      displayName: displayName.trim(),
      temperature,
      notes: notes.trim() || undefined,
      identityChannel: channel,
      identityValue: channel ? identityValue.trim() : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-popover sm:max-w-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar lead" : "Novo lead"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Atualiza nome, temperatura e notas no lago comercial."
                : "Cadastra um contato sem OS no ERP. Identidade opcional (WhatsApp, telefone ou e-mail)."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lead-name">Nome</Label>
              <Input
                id="lead-name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Ex.: JoÃ£o Pereira"
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label>Temperatura</Label>
              <Select
                value={temperature}
                onValueChange={v => setTemperature(v as CrmTemperature)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPERATURE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isEdit ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Identidade (opcional)</Label>
                  <Select
                    value={identityChannel}
                    onValueChange={setIdentityChannel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem identidade</SelectItem>
                      {IDENTITY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-identity">Valor</Label>
                  <Input
                    id="lead-identity"
                    value={identityValue}
                    onChange={e => setIdentityValue(e.target.value)}
                    placeholder="+55â€¦ ou e-mail"
                    disabled={identityChannel === "none"}
                    maxLength={200}
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="lead-notes">Notas</Label>
              <Textarea
                id="lead-notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Contexto comercialâ€¦"
                rows={3}
                maxLength={2000}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              {isEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
