import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { listVehicleMakes, listVehicleModels } from "../shared/vehicleCatalog";
import { PATIO_STAGES, PATIO_STAGE_META, type PatioStage } from "../shared/patio";
import { store } from "../lib/trpc";
import { toast } from "sonner";

export interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VehicleFormDialog({ open, onOpenChange }: VehicleFormDialogProps) {
  const makes = listVehicleMakes();

  const [plate, setPlate] = useState("");
  const [make, setMake] = useState("Toyota");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [color, setColor] = useState("");
  const [mileage, setMileage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [stage, setStage] = useState<PatioStage>("triagem");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [notes, setNotes] = useState("");

  const models = listVehicleModels(make);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !customerName) {
      toast.error("Preencha a placa e o nome do cliente.");
      return;
    }

    store.createVehicle({
      plate: plate.toUpperCase().replace(/[^A-Z0-9]/g, ""),
      make,
      model: model || (models[0] || "Modelo"),
      year: parseInt(year) || 2023,
      color,
      mileage: parseInt(mileage) || 0,
      customerName,
      customerPhone,
      currentStage: stage,
      priority,
      notes,
    });

    toast.success("Entrada de veículo registrada no pátio!");
    onOpenChange(false);

    // Reset form
    setPlate("");
    setModel("");
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Entrada no Pátio</DialogTitle>
          <DialogDescription>
            Cadastre os dados básicos do veículo e cliente para iniciar a triagem.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Placa *</Label>
              <Input
                placeholder="Ex: ABC1D23"
                value={plate}
                onChange={e => setPlate(e.target.value.toUpperCase())}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Montadora / Marca</Label>
              <Select value={make} onValueChange={setMake}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {makes.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Modelo</Label>
              {models.length > 0 ? (
                <Select value={model || models[0]} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {models.map(md => (
                      <SelectItem key={md} value={md}>{md}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Ex: Modelo do carro"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Ano</Label>
              <Input
                type="number"
                value={year}
                onChange={e => setYear(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Cor</Label>
              <Input
                placeholder="Ex: Prata"
                value={color}
                onChange={e => setColor(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Km Atual</Label>
              <Input
                type="number"
                placeholder="Ex: 45000"
                value={mileage}
                onChange={e => setMileage(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Nome do Cliente *</Label>
              <Input
                placeholder="Nome completo"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Telefone / WhatsApp</Label>
              <Input
                placeholder="(11) 99999-9999"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Observações / Sintomas relatados</Label>
            <Textarea
              placeholder="Descreva queixas do cliente ou instruções de recepção..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Registrar Entrada
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
