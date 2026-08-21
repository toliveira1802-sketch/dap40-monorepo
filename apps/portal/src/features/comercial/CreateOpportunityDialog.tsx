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
import { trpc } from "@/lib/trpc";
import type { CrmPipelineStageId } from "@dap40/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

const TEMPERATURE_OPTIONS = [
  { value: "hot", label: "Quente" },
  { value: "warm", label: "Morno" },
  { value: "cold", label: "Frio" },
] as const;

type StageOption = {
  id: string;
  name: string;
  isLost?: boolean;
  isWon?: boolean;
};

/** Aceita "1.234,56", "1234,56", "12.345" (milhar BR) ou "1234.56". */
export function parseBrlReais(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed === "") return 0;
  if (trimmed.includes(",")) {
    return Number(trimmed.replace(/\./g, "").replace(",", "."));
  }
  // SÃ³ pontos em grupos de milhar (ex.: 12.345 ou 1.234.567)
  if (/^\d{1,3}(\.\d{3})+$/.test(trimmed)) {
    return Number(trimmed.replace(/\./g, ""));
  }
  return Number(trimmed);
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: readonly StageOption[];
  defaultStageId?: string;
};

export function CreateOpportunityDialog({
  open,
  onOpenChange,
  stages,
  defaultStageId = "stage_novo_lead",
}: Props) {
  const utils = trpc.useUtils();
  const { data: contacts = [], isLoading: contactsLoading } =
    trpc.crm.contacts.list.useQuery(undefined, { enabled: open });

  const [title, setTitle] = useState("");
  const [contactId, setContactId] = useState("");
  const [stageId, setStageId] = useState(defaultStageId);
  const [valueReais, setValueReais] = useState("");
  const [temperature, setTemperature] = useState<"hot" | "warm" | "cold">("warm");
  const [nextAction, setNextAction] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setContactId("");
    setStageId(defaultStageId);
    setValueReais("");
    setTemperature("warm");
    setNextAction("");
  }, [open, defaultStageId]);

  const create = trpc.crm.pipeline.create.useMutation({
    onSuccess: async () => {
      toast.success("Oportunidade criada");
      await utils.crm.pipeline.list.invalidate();
      await utils.crm.dashboard.overview.invalidate();
      onOpenChange(false);
    },
    onError: error => toast.error(error.message),
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !contactId) {
      toast.error("Preencha tÃ­tulo e contato");
      return;
    }
    const reais = parseBrlReais(valueReais);
    if (Number.isNaN(reais) || reais < 0) {
      toast.error("Valor estimado invÃ¡lido");
      return;
    }
    create.mutate({
      title: title.trim(),
      contactId,
      pipelineStageId: stageId as CrmPipelineStageId,
      estimatedValueReais: reais,
      temperature,
      nextAction: nextAction.trim() || undefined,
    });
  }

  const openStages = stages.filter(s => !s.isLost && !s.isWon);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-popover sm:max-w-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Nova oportunidade</DialogTitle>
            <DialogDescription>
              Cria um card no pipeline comercial a partir de um contato existente.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="opp-title">TÃ­tulo</Label>
              <Input
                id="opp-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex.: RevisÃ£o Civic â€” Maria"
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label>Contato</Label>
              <Select value={contactId || undefined} onValueChange={setContactId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      contactsLoading ? "Carregandoâ€¦" : "Selecione o contato"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.displayName}
                      {contact.isOperationalClient ? " (ERP)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!contactsLoading && contacts.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum contato ainda. Use o Inbox ou o Lago de leads primeiro.
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>EstÃ¡gio</Label>
                <Select value={stageId} onValueChange={setStageId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {openStages.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Temperatura</Label>
                <Select
                  value={temperature}
                  onValueChange={v =>
                    setTemperature(v as "hot" | "warm" | "cold")
                  }
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="opp-value">Valor estimado (R$)</Label>
              <Input
                id="opp-value"
                inputMode="decimal"
                value={valueReais}
                onChange={e => setValueReais(e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opp-next">PrÃ³xima aÃ§Ã£o (opcional)</Label>
              <Input
                id="opp-next"
                value={nextAction}
                onChange={e => setNextAction(e.target.value)}
                placeholder="Ex.: Ligar amanhÃ£"
                maxLength={500}
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
            <Button
              type="submit"
              disabled={create.isPending || contacts.length === 0}
            >
              {create.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
