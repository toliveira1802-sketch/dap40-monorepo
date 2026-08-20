import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  OCCURRENCE_SEVERITIES,
  OCCURRENCE_SEVERITY_META,
  OCCURRENCE_TYPES,
  OCCURRENCE_TYPE_META,
  type OccurrenceSeverity,
  type OccurrenceType,
} from "../shared/patio";
import { store } from "../lib/trpc";
import { toast } from "sonner";

export interface OccurrenceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OccurrenceFormDialog({ open, onOpenChange }: OccurrenceFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<OccurrenceType>("part_delay");
  const [severity, setSeverity] = useState<OccurrenceSeverity>("medium");
  const [vehicleId, setVehicleId] = useState("");
  const [responsibleId, setResponsibleId] = useState("");

  const vehicles = store.vehicles.filter(v => v.status === "active");
  const collaborators = store.collaborators.filter(c => c.active);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Informe o título e a descrição da ocorrência.");
      return;
    }

    const selectedVehicle = vehicles.find(v => String(v.id) === String(vehicleId));
    const selectedCollab = collaborators.find(c => String(c.id) === String(responsibleId));

    const nextId = store.occurrences.length > 0 ? Math.max(...store.occurrences.map(o => o.id)) + 1 : 1;

    const newOcc = {
      id: nextId,
      title,
      description,
      type,
      severity,
      status: "open" as const,
      yardVehicleId: selectedVehicle?.id,
      vehicleId: selectedVehicle?.id,
      vehiclePlate: selectedVehicle?.plate,
      vehicleModel: selectedVehicle?.model,
      serviceOrderId: selectedVehicle?.serviceOrderId,
      responsibleId: selectedCollab?.id,
      responsibleName: selectedCollab?.name,
      createdAt: new Date(),
    };

    store.occurrences.unshift(newOcc);
    if (selectedVehicle) {
      selectedVehicle.occurrencesCount = (selectedVehicle.occurrencesCount || 0) + 1;
    }
    store.notify();

    toast.success("Ocorrência registrada com sucesso!");
    onOpenChange(false);

    // Reset
    setTitle("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Ocorrência / Alerta</DialogTitle>
          <DialogDescription>
            Comunique problemas técnicos, atrasos de peças ou pendências com clientes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Título do Alerta / Ocorrência *</Label>
            <Input
              placeholder="Ex: Atraso na entrega das pastilhas de freio"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Tipo de Ocorrência</Label>
              <Select value={type} onValueChange={(v: OccurrenceType) => setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OCCURRENCE_TYPES.map(t => (
                    <SelectItem key={t} value={t}>
                      {OCCURRENCE_TYPE_META[t].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Severidade</Label>
              <Select value={severity} onValueChange={(v: OccurrenceSeverity) => setSeverity(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OCCURRENCE_SEVERITIES.map(s => (
                    <SelectItem key={s} value={s}>
                      {OCCURRENCE_SEVERITY_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Veículo Vinculado</Label>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum / Geral</SelectItem>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.plate} — {v.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Responsável</Label>
              <Select value={responsibleId} onValueChange={setResponsibleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">A definir</SelectItem>
                  {collaborators.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Descrição Detalhada *</Label>
            <Textarea
              placeholder="Explique o que aconteceu, fornecedores contatados, prazos revistos..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Ocorrência
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
