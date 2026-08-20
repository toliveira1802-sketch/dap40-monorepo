import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  parseYardVehicleIdParam,
  prefillWizardFromYardVehicle,
} from "@/lib/osWizardPrefill";
import { formatMileage, formatPlate } from "@/lib/patio";
import { trpc } from "@/lib/trpc";
import { cn, formatPhoneBr, isValidEmail, phoneDigits } from "@/lib/utils";
import {
  CAMPAIGN_ORIGINS,
  SERVICE_TYPES,
  type WizardStep,
} from "@shared/serviceOrderWizard";
import {
  OTHER_MAKE,
  listVehicleMakes,
  listVehicleModels,
} from "@shared/vehicleCatalog";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  Check,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  User,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { useLocation, useSearch } from "wouter";
import { toast } from "sonner";

const OTHER_MODEL = "Outro";
const VEHICLE_MAKES = listVehicleMakes();

type ClientSelection = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
};

type VehicleSelection = {
  registeredVehicleId?: number;
  plate: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  lastServiceMileage?: number | null;
  lastServiceAt?: number | null;
};

const STEPS: Array<{ id: WizardStep; label: string; icon: typeof User }> = [
  { id: "cliente", label: "Cliente", icon: User },
  { id: "veiculo", label: "Veículo", icon: Car },
  { id: "servico", label: "Serviço", icon: Wrench },
  { id: "confirmacao", label: "Confirmação", icon: ClipboardList },
];

function formatShortDate(ts: number | null | undefined) {
  if (!ts) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(ts));
}

function resolveNewVehicleIdentity(form: {
  plate: string;
  make: string;
  model: string;
  customMake: string;
  customModel: string;
  year: string;
  mileage: string;
}): VehicleSelection | null {
  const plate = form.plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const make =
    form.make === OTHER_MAKE ? form.customMake.trim() : form.make.trim();
  const model =
    form.make === OTHER_MAKE || form.model === OTHER_MODEL
      ? form.customModel.trim()
      : form.model.trim();
  if (
    !/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate) ||
    make.length < 1 ||
    model.length < 1 ||
    Number(form.year) < 1950 ||
    form.mileage.trim() === "" ||
    Number(form.mileage) < 0
  ) {
    return null;
  }
  return {
    plate,
    make,
    model,
    year: Number(form.year),
    mileage: Number(form.mileage),
  };
}

export default function NewServiceOrderWizardPage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const yardVehicleId = useMemo(
    () => parseYardVehicleIdParam(searchString),
    [searchString]
  );
  const [step, setStep] = useState<WizardStep>("cliente");
  const [yardPrefillApplied, setYardPrefillApplied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [client, setClient] = useState<ClientSelection | null>(null);
  const [registeringClient, setRegisteringClient] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: "",
    phone: "",
    email: "",
    campaignOrigin: "" as (typeof CAMPAIGN_ORIGINS)[number] | "",
  });
  const [vehicle, setVehicle] = useState<VehicleSelection | null>(null);
  const [registeringVehicle, setRegisteringVehicle] = useState(false);
  const [newVehicleForm, setNewVehicleForm] = useState({
    plate: "",
    make: "",
    model: "",
    customMake: "",
    customModel: "",
    year: String(new Date().getFullYear()),
    mileage: "",
  });
  const [serviceForm, setServiceForm] = useState({
    complaint: "",
    serviceType: "" as (typeof SERVICE_TYPES)[number] | "",
    campaignOrigin: "" as (typeof CAMPAIGN_ORIGINS)[number] | "",
    internalNotes: "",
  });
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedQuery(searchQuery.trim()),
      300
    );
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const searchEnabled =
    debouncedQuery.length >= 2 && !client && !registeringClient;
  const searchQuery_ = trpc.clients.search.useQuery(
    { query: debouncedQuery },
    { enabled: searchEnabled }
  );

  const vehiclesQuery = trpc.clients.listVehicles.useQuery(
    { clientId: client?.id ?? 0 },
    { enabled: Boolean(client?.id) }
  );

  const yardQuery = trpc.patio.get.useQuery(
    { id: yardVehicleId ?? 0 },
    { enabled: Boolean(yardVehicleId) && !yardPrefillApplied }
  );

  useEffect(() => {
    if (!yardVehicleId || yardPrefillApplied) return;
    if (yardQuery.isError) {
      toast.error(
        yardQuery.error.message ||
          "Não foi possível carregar a passagem do pátio"
      );
      setYardPrefillApplied(true);
      return;
    }
    if (!yardQuery.data) return;

    const result = prefillWizardFromYardVehicle(yardQuery.data);
    if (result.kind === "already_open") {
      setYardPrefillApplied(true);
      setLocation(`/ordens-servico/${result.orderId}`);
      return;
    }
    if (result.kind === "inactive") {
      toast.error(
        "Esta passagem já foi encerrada. Abra uma OS pelo fluxo normal."
      );
      setYardPrefillApplied(true);
      return;
    }

    setClient(result.client);
    setVehicle(result.vehicle);
    if (result.complaint) {
      setServiceForm(prev => ({ ...prev, complaint: result.complaint ?? "" }));
    }
    setNewClientForm(prev => ({
      ...prev,
      name: result.client.name || prev.name,
      phone: result.client.phone ?? prev.phone,
      email: result.client.email ?? prev.email,
    }));
    setStep(result.step);
    setYardPrefillApplied(true);
  }, [
    setLocation,
    yardPrefillApplied,
    yardQuery.data,
    yardQuery.error,
    yardQuery.isError,
    yardVehicleId,
  ]);

  const catalogModels = useMemo(
    () => listVehicleModels(newVehicleForm.make),
    [newVehicleForm.make]
  );

  const openMutation = trpc.serviceOrders.openWizard.useMutation({
    onSuccess: result => {
      toast.success(`OS ${result.order.code} aberta — Diagnóstico no pátio`);
      setCreatedOrderId(result.order.id);
    },
    onError: error => toast.error(error.message),
  });

  useEffect(() => {
    if (createdOrderId) {
      setLocation("/patio/kanban");
    }
  }, [createdOrderId, setLocation]);

  function canAdvanceFromClient() {
    if (registeringClient) {
      return (
        newClientForm.name.trim().length >= 2 &&
        phoneDigits(newClientForm.phone).length === 11 &&
        isValidEmail(newClientForm.email) &&
        Boolean(newClientForm.campaignOrigin)
      );
    }
    return Boolean(client && phoneDigits(client.phone ?? "").length >= 8);
  }

  function canAdvanceFromVehicle() {
    if (registeringVehicle) {
      return Boolean(resolveNewVehicleIdentity(newVehicleForm));
    }
    return Boolean(vehicle);
  }

  const serviceValid =
    serviceForm.complaint.trim().length >= 3 && Boolean(serviceForm.serviceType);

  function goNext() {
    if (step === "cliente") {
      if (registeringClient) {
        setClient({
          id: 0,
          name: newClientForm.name.trim(),
          phone: newClientForm.phone.trim(),
          email: newClientForm.email.trim(),
        });
        setRegisteringClient(false);
      }
      setStep("veiculo");
      return;
    }
    if (step === "veiculo") {
      if (registeringVehicle) {
        const next = resolveNewVehicleIdentity(newVehicleForm);
        if (!next) return;
        setVehicle(next);
        setRegisteringVehicle(false);
      }
      setStep("servico");
      return;
    }
    if (step === "servico" && serviceValid) {
      setStep("confirmacao");
    }
  }

  function goBack() {
    if (step === "veiculo") setStep("cliente");
    else if (step === "servico") setStep("veiculo");
    else if (step === "confirmacao") setStep("servico");
    else setLocation("/ordens-servico");
  }

  function handleOpenOs() {
    if (!client || !vehicle || !serviceValid || !serviceForm.serviceType) return;
    const campaign =
      serviceForm.campaignOrigin || newClientForm.campaignOrigin || null;
    const phone = (client.phone || newClientForm.phone).trim();
    const emailRaw = (client.email || newClientForm.email).trim();
    const email = emailRaw && isValidEmail(emailRaw) ? emailRaw : null;

    if (phoneDigits(phone).length < 8) {
      toast.error("Informe um telefone válido com DDD");
      return;
    }

    openMutation.mutate({
      client: {
        id: client.id > 0 ? client.id : undefined,
        name: client.name,
        phone,
        email,
        campaignOrigin: newClientForm.campaignOrigin || null,
      },
      vehicle: {
        registeredVehicleId: vehicle.registeredVehicleId,
        plate: vehicle.plate,
        make: vehicle.make || null,
        model: vehicle.model,
        year: vehicle.year,
        mileage: vehicle.mileage,
        lastServiceMileage: vehicle.lastServiceMileage ?? null,
        lastServiceAt: vehicle.lastServiceAt ?? null,
      },
      service: {
        complaint: serviceForm.complaint.trim(),
        serviceType: serviceForm.serviceType,
        campaignOrigin: campaign || null,
        internalNotes: serviceForm.internalNotes.trim() || null,
      },
    });
  }

  if (createdOrderId) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (yardVehicleId && !yardPrefillApplied) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col gap-6 px-4 py-6">
      <header className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 gap-2 text-muted-foreground"
          onClick={() => setLocation("/ordens-servico")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Nova Ordem de Serviço
        </h1>
        <p className="text-sm text-muted-foreground">
          Cliente, veículo e tipo de serviço — o restante fica para o pátio
        </p>
      </header>

      <WizardStepper current={step} />

      <Card className="border-border/70 bg-card/80 shadow-panel">
        <CardContent className="space-y-5 p-6">
          {step === "cliente" && (
            <ClientStep
              client={client}
              registeringClient={registeringClient}
              searchQuery={searchQuery}
              searchEnabled={searchEnabled}
              debouncedQuery={debouncedQuery}
              searchLoading={searchQuery_.isLoading}
              searchResults={searchQuery_.data ?? []}
              newClientForm={newClientForm}
              canAdvance={canAdvanceFromClient()}
              onSearchChange={setSearchQuery}
              onSelectClient={setClient}
              onStartRegister={() => {
                setRegisteringClient(true);
                setNewClientForm(prev => ({
                  ...prev,
                  name: searchQuery.trim() || prev.name,
                }));
              }}
              onCancelRegister={() => setRegisteringClient(false)}
              onSaveRegister={() => {
                setClient({
                  id: 0,
                  name: newClientForm.name.trim(),
                  phone: newClientForm.phone.trim(),
                  email: newClientForm.email.trim(),
                });
                setRegisteringClient(false);
              }}
              onChangeClientForm={setNewClientForm}
              onClearClient={() => {
                setClient(null);
                setVehicle(null);
              }}
            />
          )}

          {step === "veiculo" && client && (
            <VehicleStep
              clientName={client.name}
              vehicle={vehicle}
              registeringVehicle={registeringVehicle}
              vehicles={vehiclesQuery.data ?? []}
              newVehicleForm={newVehicleForm}
              catalogModels={catalogModels}
              canAdvance={canAdvanceFromVehicle()}
              onSelectVehicle={setVehicle}
              onClearVehicle={() => setVehicle(null)}
              onStartRegister={() => setRegisteringVehicle(true)}
              onCancelRegister={() => setRegisteringVehicle(false)}
              onChangeForm={setNewVehicleForm}
              onSaveRegister={() => {
                const next = resolveNewVehicleIdentity(newVehicleForm);
                if (!next) return;
                setVehicle(next);
                setRegisteringVehicle(false);
              }}
            />
          )}

          {step === "servico" && (
            <ServiceStep
              serviceForm={serviceForm}
              serviceValid={serviceValid}
              onChange={setServiceForm}
            />
          )}

          {step === "confirmacao" && client && vehicle && (
            <>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ClipboardList className="size-4 text-primary" />
                Revisão da OS
              </div>
              <ReviewSection title="Cliente">
                <p className="font-semibold">{client.name}</p>
                <p className="text-sm text-muted-foreground">
                  {[client.phone, client.email].filter(Boolean).join(" · ")}
                </p>
                {(serviceForm.campaignOrigin ||
                  newClientForm.campaignOrigin) && (
                  <p className="mt-1 text-xs text-amber-300">
                    Origem:{" "}
                    {serviceForm.campaignOrigin || newClientForm.campaignOrigin}
                  </p>
                )}
              </ReviewSection>
              <ReviewSection title="Veículo">
                <p className="font-semibold">
                  {formatPlate(vehicle.plate)} — {vehicle.make} {vehicle.model}
                </p>
                <p className="text-sm text-muted-foreground">
                  {vehicle.year} · {formatMileage(vehicle.mileage)}
                </p>
              </ReviewSection>
              <ReviewSection title="Serviço">
                <p className="font-semibold">{serviceForm.complaint}</p>
                <p className="text-sm text-muted-foreground">
                  Tipo: {serviceForm.serviceType}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Após abrir, o veículo entra em Diagnóstico no kanban do pátio.
                </p>
              </ReviewSection>
            </>
          )}
        </CardContent>
      </Card>

      <footer className="flex items-center justify-between gap-3 pb-8">
        <Button variant="outline" onClick={goBack}>
          <ArrowLeft className="size-4" />
          {step === "cliente" ? "Cancelar" : "Voltar"}
        </Button>
        {step === "confirmacao" ? (
          <Button
            className="bg-emerald-600 hover:bg-emerald-500"
            disabled={openMutation.isPending}
            onClick={handleOpenOs}
          >
            {openMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Abrir OS
          </Button>
        ) : (
          <Button
            onClick={goNext}
            disabled={
              (step === "cliente" && !canAdvanceFromClient()) ||
              (step === "veiculo" && !canAdvanceFromVehicle()) ||
              (step === "servico" && !serviceValid)
            }
          >
            {step === "cliente" && "Próximo: Veículo"}
            {step === "veiculo" && "Próximo: Serviço"}
            {step === "servico" && "Revisar OS"}
            <ArrowRight className="size-4" />
          </Button>
        )}
      </footer>
    </div>
  );
}

function ClientStep({
  client,
  registeringClient,
  searchQuery,
  searchEnabled,
  debouncedQuery,
  searchLoading,
  searchResults,
  newClientForm,
  canAdvance,
  onSearchChange,
  onSelectClient,
  onStartRegister,
  onCancelRegister,
  onSaveRegister,
  onChangeClientForm,
  onClearClient,
}: {
  client: ClientSelection | null;
  registeringClient: boolean;
  searchQuery: string;
  searchEnabled: boolean;
  debouncedQuery: string;
  searchLoading: boolean;
  searchResults: Array<{
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    documentHint: string | null;
  }>;
  newClientForm: {
    name: string;
    phone: string;
    email: string;
    campaignOrigin: (typeof CAMPAIGN_ORIGINS)[number] | "";
  };
  canAdvance: boolean;
  onSearchChange: (value: string) => void;
  onSelectClient: (client: ClientSelection) => void;
  onStartRegister: () => void;
  onCancelRegister: () => void;
  onSaveRegister: () => void;
  onChangeClientForm: Dispatch<
    SetStateAction<{
      name: string;
      phone: string;
      email: string;
      campaignOrigin: (typeof CAMPAIGN_ORIGINS)[number] | "";
    }>
  >;
  onClearClient: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <User className="size-4 text-primary" />
        Identificar Cliente
      </div>

      {!registeringClient && !client && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome, CPF ou telefone..."
              value={searchQuery}
              onChange={event => onSearchChange(event.target.value)}
              autoFocus
            />
          </div>
          {searchEnabled && (
            <div className="space-y-1 rounded-xl border border-border/60 bg-background/40">
              {searchLoading ? (
                <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Buscando...
                </div>
              ) : searchResults.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">
                  Nenhum cliente encontrado para &quot;{debouncedQuery}&quot;
                </p>
              ) : (
                searchResults.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full flex-col gap-0.5 border-b border-border/40 px-4 py-3 text-left last:border-0 hover:bg-muted/40"
                    onClick={() => {
                      onSelectClient({
                        id: item.id,
                        name: item.name,
                        phone: item.phone,
                        email: item.email,
                      });
                      onSearchChange("");
                    }}
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {[item.documentHint, item.phone].filter(Boolean).join(" · ")}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={onStartRegister}
          >
            <Plus className="size-4" />
            Cadastrar Novo Cliente
          </Button>
        </>
      )}

      {client && !registeringClient && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 text-emerald-400" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{client.name}</p>
              <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {client.phone ? (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3.5" /> {client.phone}
                  </span>
                ) : null}
                {client.email ? (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="size-3.5" /> {client.email}
                  </span>
                ) : null}
              </div>
              {phoneDigits(client.phone ?? "").length < 8 ? (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-amber-200">
                    Este cliente não tem telefone válido. Informe o WhatsApp
                    para continuar.
                  </p>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    value={newClientForm.phone}
                    onChange={event => {
                      const phone = formatPhoneBr(event.target.value);
                      onChangeClientForm(prev => ({ ...prev, phone }));
                      onSelectClient({ ...client, phone });
                    }}
                  />
                </div>
              ) : null}
            </div>
            <Button variant="ghost" size="sm" onClick={onClearClient}>
              Trocar
            </Button>
          </div>
        </div>
      )}

      {registeringClient && (
        <div className="space-y-4">
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            Campos marcados com * são obrigatórios para o CRM
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome Completo *">
              <Input
                value={newClientForm.name}
                onChange={event =>
                  onChangeClientForm(prev => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Telefone / WhatsApp *">
              <Input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(11) 99999-9999"
                maxLength={15}
                value={newClientForm.phone}
                onChange={event =>
                  onChangeClientForm(prev => ({
                    ...prev,
                    phone: formatPhoneBr(event.target.value),
                  }))
                }
              />
            </Field>
            <Field label="E-mail *">
              <Input
                type="email"
                value={newClientForm.email}
                onChange={event =>
                  onChangeClientForm(prev => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Origem / Campanha *">
              <Select
                value={newClientForm.campaignOrigin || undefined}
                onValueChange={value =>
                  onChangeClientForm(prev => ({
                    ...prev,
                    campaignOrigin: value as (typeof CAMPAIGN_ORIGINS)[number],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {CAMPAIGN_ORIGINS.map(origin => (
                    <SelectItem key={origin} value={origin}>
                      {origin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="flex gap-2">
            <Button onClick={onSaveRegister} disabled={!canAdvance}>
              Salvar Cliente
            </Button>
            <Button variant="outline" onClick={onCancelRegister}>
              Cancelar
            </Button>
          </div>
          {!canAdvance && (
            <p className="text-xs text-amber-200">
              Preencha nome, telefone no formato (11) 99999-9999, e-mail válido
              e origem/campanha.
            </p>
          )}
        </div>
      )}
    </>
  );
}

function VehicleStep({
  clientName,
  vehicle,
  registeringVehicle,
  vehicles,
  newVehicleForm,
  catalogModels,
  canAdvance,
  onSelectVehicle,
  onClearVehicle,
  onStartRegister,
  onCancelRegister,
  onChangeForm,
  onSaveRegister,
}: {
  clientName: string;
  vehicle: VehicleSelection | null;
  registeringVehicle: boolean;
  vehicles: Array<{
    id: number;
    plate: string;
    make: string | null;
    model: string;
    year: number | null;
    mileage: number | null;
    lastServiceMileage: number | null;
    lastServiceAt: number | null;
  }>;
  newVehicleForm: {
    plate: string;
    make: string;
    model: string;
    customMake: string;
    customModel: string;
    year: string;
    mileage: string;
  };
  catalogModels: readonly string[];
  canAdvance: boolean;
  onSelectVehicle: (vehicle: VehicleSelection) => void;
  onClearVehicle: () => void;
  onStartRegister: () => void;
  onCancelRegister: () => void;
  onChangeForm: Dispatch<
    SetStateAction<{
      plate: string;
      make: string;
      model: string;
      customMake: string;
      customModel: string;
      year: string;
      mileage: string;
    }>
  >;
  onSaveRegister: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Car className="size-4 text-primary" />
          Selecionar Veículo
        </div>
        <Badge variant="secondary">{clientName}</Badge>
      </div>

      {!registeringVehicle && !vehicle && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Veículos do cliente
          </p>
          <div className="space-y-2">
            {vehicles.map(item => (
              <button
                key={item.id}
                type="button"
                className="w-full rounded-xl border border-border/60 bg-background/40 p-4 text-left hover:border-primary/40 hover:bg-primary/5"
                onClick={() =>
                  onSelectVehicle({
                    registeredVehicleId: item.id,
                    plate: item.plate,
                    make: item.make ?? "",
                    model: item.model,
                    year: item.year ?? new Date().getFullYear(),
                    mileage: item.mileage ?? 0,
                    lastServiceMileage: item.lastServiceMileage,
                    lastServiceAt: item.lastServiceAt,
                  })
                }
              >
                <p className="font-semibold">{formatPlate(item.plate)}</p>
                <p className="text-sm text-muted-foreground">
                  {[item.make, item.model, item.year].filter(Boolean).join(" ")}
                  {item.mileage != null ? ` · ${formatMileage(item.mileage)}` : ""}
                </p>
                {item.lastServiceMileage || item.lastServiceAt ? (
                  <p className="mt-1 text-xs text-amber-300">
                    Última revisão:{" "}
                    {item.lastServiceMileage
                      ? formatMileage(item.lastServiceMileage)
                      : "—"}
                    {item.lastServiceAt
                      ? ` · ${formatShortDate(item.lastServiceAt)}`
                      : ""}
                  </p>
                ) : null}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={onStartRegister}
          >
            <Plus className="size-4" />
            Cadastrar Novo Veículo
          </Button>
        </>
      )}

      {vehicle && !registeringVehicle && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">
                {formatPlate(vehicle.plate)} — {vehicle.make} {vehicle.model}
              </p>
              <p className="text-sm text-muted-foreground">
                {vehicle.year} · {formatMileage(vehicle.mileage)}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClearVehicle}>
              Trocar
            </Button>
          </div>
        </div>
      )}

      {registeringVehicle && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Placa *">
            <Input
              value={newVehicleForm.plate}
              onChange={event =>
                onChangeForm(prev => ({
                  ...prev,
                  plate: event.target.value.toUpperCase(),
                }))
              }
              placeholder="ABC1D23"
            />
          </Field>
          <Field label="Marca *">
            <Select
              value={newVehicleForm.make || undefined}
              onValueChange={value =>
                onChangeForm(prev => ({
                  ...prev,
                  make: value,
                  model: "",
                  customModel: "",
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar marca..." />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_MAKES.map(make => (
                  <SelectItem key={make} value={make}>
                    {make}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {newVehicleForm.make === OTHER_MAKE ? (
            <Field label="Marca (texto) *">
              <Input
                value={newVehicleForm.customMake}
                onChange={event =>
                  onChangeForm(prev => ({
                    ...prev,
                    customMake: event.target.value,
                  }))
                }
                placeholder="Informe a marca"
              />
            </Field>
          ) : null}
          {newVehicleForm.make === OTHER_MAKE ? (
            <Field label="Modelo *">
              <Input
                value={newVehicleForm.customModel}
                onChange={event =>
                  onChangeForm(prev => ({
                    ...prev,
                    customModel: event.target.value,
                  }))
                }
                placeholder="Informe o modelo"
              />
            </Field>
          ) : (
            <Field label="Modelo *">
              <Select
                value={newVehicleForm.model || undefined}
                onValueChange={value =>
                  onChangeForm(prev => ({
                    ...prev,
                    model: value,
                    customModel:
                      value === OTHER_MODEL ? prev.customModel : "",
                  }))
                }
                disabled={!newVehicleForm.make}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar modelo..." />
                </SelectTrigger>
                <SelectContent>
                  {catalogModels.map(model => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                  <SelectItem value={OTHER_MODEL}>{OTHER_MODEL}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
          {newVehicleForm.make !== OTHER_MAKE &&
          newVehicleForm.model === OTHER_MODEL ? (
            <Field label="Modelo (texto) *">
              <Input
                value={newVehicleForm.customModel}
                onChange={event =>
                  onChangeForm(prev => ({
                    ...prev,
                    customModel: event.target.value,
                  }))
                }
                placeholder="Informe o modelo"
              />
            </Field>
          ) : null}
          <Field label="Ano *">
            <Input
              type="number"
              value={newVehicleForm.year}
              onChange={event =>
                onChangeForm(prev => ({
                  ...prev,
                  year: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="Quilometragem *">
            <Input
              type="number"
              value={newVehicleForm.mileage}
              onChange={event =>
                onChangeForm(prev => ({
                  ...prev,
                  mileage: event.target.value,
                }))
              }
            />
          </Field>
          <div className="flex items-end gap-2 sm:col-span-2">
            <Button onClick={onSaveRegister} disabled={!canAdvance}>
              Salvar Veículo
            </Button>
            <Button variant="outline" onClick={onCancelRegister}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function ServiceStep({
  serviceForm,
  serviceValid,
  onChange,
}: {
  serviceForm: {
    complaint: string;
    serviceType: (typeof SERVICE_TYPES)[number] | "";
    campaignOrigin: (typeof CAMPAIGN_ORIGINS)[number] | "";
    internalNotes: string;
  };
  serviceValid: boolean;
  onChange: Dispatch<
    SetStateAction<{
      complaint: string;
      serviceType: (typeof SERVICE_TYPES)[number] | "";
      campaignOrigin: (typeof CAMPAIGN_ORIGINS)[number] | "";
      internalNotes: string;
    }>
  >;
}) {
  return (
    <>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Wrench className="size-4 text-primary" />
        Dados do Serviço
      </div>
      <Field label="Motivo da Visita / Queixa do Cliente *">
        <Textarea
          rows={4}
          placeholder="Descreva o que o cliente relatou, barulhos, falhas, solicitações..."
          value={serviceForm.complaint}
          onChange={event =>
            onChange(prev => ({
              ...prev,
              complaint: event.target.value,
            }))
          }
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de Serviço *">
          <Select
            value={serviceForm.serviceType || undefined}
            onValueChange={value =>
              onChange(prev => ({
                ...prev,
                serviceType: value as (typeof SERVICE_TYPES)[number],
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar..." />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Campanha / Promoção aplicada (opcional)">
          <Select
            value={serviceForm.campaignOrigin || undefined}
            onValueChange={value =>
              onChange(prev => ({
                ...prev,
                campaignOrigin: value as (typeof CAMPAIGN_ORIGINS)[number],
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Nenhuma" />
            </SelectTrigger>
            <SelectContent>
              {CAMPAIGN_ORIGINS.map(origin => (
                <SelectItem key={origin} value={origin}>
                  {origin}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Observações Internas">
        <Textarea
          rows={2}
          placeholder="Notas internas, histórico relevante..."
          value={serviceForm.internalNotes}
          onChange={event =>
            onChange(prev => ({
              ...prev,
              internalNotes: event.target.value,
            }))
          }
        />
      </Field>
      <p className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        Responsável pela abertura: você (usuário logado). Mecânico e recurso
        podem ser definidos depois no pátio.
      </p>
      {!serviceValid && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Preencha motivo da visita e tipo de serviço para continuar
        </p>
      )}
    </>
  );
}

function WizardStepper({ current }: { current: WizardStep }) {
  const currentIndex = STEPS.findIndex(step => step.id === current);
  return (
    <div className="flex items-center justify-center gap-0 px-2">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const done = index < currentIndex;
        const active = step.id === current;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2",
                  done && "border-emerald-500 bg-emerald-500 text-white",
                  active &&
                    !done &&
                    "border-primary bg-primary text-primary-foreground",
                  !done &&
                    !active &&
                    "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {done ? <Check className="size-4" /> : <Icon className="size-4" />}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 mb-5 h-0.5 w-10 sm:w-16",
                  index < currentIndex ? "bg-emerald-500" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
      <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}
