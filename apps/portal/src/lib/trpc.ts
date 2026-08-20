import React, { useState, useEffect, useCallback } from "react";
import type {
  YardVehicleItem,
  CollaboratorItem,
  AppointmentItem,
  ServiceOrderItem,
  OccurrenceItem,
} from "./routerTypes";
import type { WorkshopBay, WorkshopResourceRow } from "../shared/workshop";
import type { PatioStage, CollaboratorPosition } from "../shared/patio";

// Initial Mock Data with numeric IDs
const initialCollaborators: CollaboratorItem[] = [
  {
    id: 1,
    name: "Carlos Eduardo Silva",
    email: "carlos.silva@dap40.com.br",
    phone: "(11) 98765-4321",
    position: "mecanico_chefe",
    active: true,
    specialty: "Motor & Câmbio",
    specialties: ["Motor", "Câmbio Automático", "Diagnóstico Avançado"],
    maxSimultaneousVehicles: 4,
    currentWorkload: 2,
    completedStages: 38,
    vehiclesHandled: 42,
    createdAt: new Date("2025-01-10"),
  },
  {
    id: 2,
    name: "Roberto Mendes",
    email: "roberto.mendes@dap40.com.br",
    phone: "(11) 97654-3210",
    position: "tecnico",
    active: true,
    specialty: "Suspensão & Freios",
    specialties: ["Suspensão", "Freios", "Alinhamento"],
    maxSimultaneousVehicles: 3,
    currentWorkload: 2,
    completedStages: 29,
    vehiclesHandled: 34,
    createdAt: new Date("2025-02-01"),
  },
  {
    id: 3,
    name: "Marcos Oliveira",
    email: "marcos.oliveira@dap40.com.br",
    phone: "(11) 96543-2109",
    position: "eletricista",
    active: true,
    specialty: "Elétrica & Injeção",
    specialties: ["Injeção Eletrônica", "Módulos ECU", "Ar Condicionado"],
    maxSimultaneousVehicles: 3,
    currentWorkload: 1,
    completedStages: 22,
    vehiclesHandled: 25,
    createdAt: new Date("2025-02-15"),
  },
  {
    id: 4,
    name: "Juliana Costa",
    email: "juliana.costa@dap40.com.br",
    phone: "(11) 95432-1098",
    position: "consultor",
    active: true,
    specialty: "Consultoria Técnica",
    specialties: ["Recepção Técnica", "Orçamento", "Atendimento VIP"],
    maxSimultaneousVehicles: 10,
    currentWorkload: 5,
    completedStages: 56,
    vehiclesHandled: 60,
    createdAt: new Date("2025-01-05"),
  },
  {
    id: 5,
    name: "Fernando Ramos",
    email: "fernando.ramos@dap40.com.br",
    phone: "(11) 94321-0987",
    position: "qualidade",
    active: true,
    specialty: "Qualidade & Testes",
    specialties: ["Teste de Rodagem", "Checklist Final", "Emissões"],
    maxSimultaneousVehicles: 5,
    currentWorkload: 1,
    completedStages: 45,
    vehiclesHandled: 48,
    createdAt: new Date("2025-01-20"),
  },
];

const initialVehicles: YardVehicleItem[] = [
  {
    id: 1,
    plate: "ABC1D23",
    make: "Toyota",
    model: "Corolla 2.0 Altis",
    year: 2022,
    color: "Prata",
    mileage: 45200,
    currentStage: "triagem",
    status: "active",
    customerName: "Alexandre Pires",
    customerPhone: "(11) 98123-4567",
    customerEmail: "alexandre.pires@gmail.com",
    serviceOrderId: 1,
    assignedMechanicId: 4,
    assignedMechanicName: "Juliana Costa",
    collaboratorId: 4,
    collaboratorName: "Juliana Costa",
    currentCollaboratorId: 4,
    priority: "normal",
    entryAt: new Date(Date.now() - 3600000 * 2),
    stageEnteredAt: new Date(Date.now() - 3600000 * 2),
    estimatedDeliveryAt: new Date(Date.now() + 3600000 * 24),
    bayId: null,
    totalAmount: 1850.0,
    notes: "Revisão dos 45.000 km e barulho leve na suspensão dianteira direita.",
    occurrencesCount: 0,
    missingOpenOs: false,
    version: 1,
  },
  {
    id: 2,
    plate: "BRA2E19",
    make: "Volkswagen",
    model: "T-Cross 1.4 TSI",
    year: 2023,
    color: "Branco",
    mileage: 28900,
    currentStage: "diagnostico",
    status: "active",
    customerName: "Beatriz Nogueira",
    customerPhone: "(11) 99234-5678",
    customerEmail: "beatriz.n@outlook.com",
    serviceOrderId: 2,
    assignedMechanicId: 3,
    assignedMechanicName: "Marcos Oliveira",
    collaboratorId: 3,
    collaboratorName: "Marcos Oliveira",
    currentCollaboratorId: 3,
    priority: "high",
    entryAt: new Date(Date.now() - 3600000 * 5),
    stageEnteredAt: new Date(Date.now() - 3600000 * 3),
    estimatedDeliveryAt: new Date(Date.now() + 3600000 * 8),
    bayId: "bay-2",
    bayName: "Baía 2 - Elétrica / Scanner",
    totalAmount: 920.0,
    notes: "Luz de injeção acesa e oscilação na marcha lenta.",
    occurrencesCount: 0,
    missingOpenOs: false,
    version: 1,
  },
  {
    id: 3,
    plate: "DAP4O26",
    make: "Jeep",
    model: "Compass 1.3 Turbo Longitude",
    year: 2023,
    color: "Cinza Granite",
    mileage: 34100,
    currentStage: "execucao",
    status: "active",
    customerName: "Claudio Mendonça",
    customerPhone: "(11) 97345-6789",
    customerEmail: "claudio.m@empresa.com.br",
    serviceOrderId: 3,
    assignedMechanicId: 1,
    assignedMechanicName: "Carlos Eduardo Silva",
    collaboratorId: 1,
    collaboratorName: "Carlos Eduardo Silva",
    currentCollaboratorId: 1,
    priority: "urgent",
    entryAt: new Date(Date.now() - 3600000 * 18),
    stageEnteredAt: new Date(Date.now() - 3600000 * 6),
    estimatedDeliveryAt: new Date(Date.now() + 3600000 * 3),
    bayId: "bay-1",
    bayName: "Elevador 1 - Principal",
    totalAmount: 3450.0,
    notes: "Troca de pastilhas, discos dianteiros e amortecedores.",
    occurrencesCount: 1,
    missingOpenOs: false,
    version: 1,
  },
  {
    id: 4,
    plate: "XYZ9K88",
    make: "Honda",
    model: "Civic Touring 1.5 Turbo",
    year: 2021,
    color: "Preto Cristal",
    mileage: 62000,
    currentStage: "aguardando_peca",
    status: "active",
    customerName: "Daniele Camargo",
    customerPhone: "(11) 96456-7890",
    customerEmail: "dani.camargo@uol.com.br",
    serviceOrderId: 4,
    assignedMechanicId: 2,
    assignedMechanicName: "Roberto Mendes",
    collaboratorId: 2,
    collaboratorName: "Roberto Mendes",
    currentCollaboratorId: 2,
    priority: "normal",
    entryAt: new Date(Date.now() - 3600000 * 36),
    stageEnteredAt: new Date(Date.now() - 3600000 * 14),
    estimatedDeliveryAt: new Date(Date.now() + 3600000 * 48),
    bayId: null,
    totalAmount: 4100.0,
    notes: "Aguardando chegada do coxim hidráulico do motor.",
    occurrencesCount: 1,
    missingOpenOs: false,
    version: 1,
  },
  {
    id: 5,
    plate: "RST3H44",
    make: "BMW",
    model: "320i M Sport 2.0 Turbo",
    year: 2022,
    color: "Azul Portimão",
    mileage: 39500,
    currentStage: "qualidade",
    status: "active",
    customerName: "Eduardo Fonseca",
    customerPhone: "(11) 95567-8901",
    customerEmail: "eduardo.fonseca@invest.com",
    serviceOrderId: 5,
    assignedMechanicId: 5,
    assignedMechanicName: "Fernando Ramos",
    collaboratorId: 5,
    collaboratorName: "Fernando Ramos",
    currentCollaboratorId: 5,
    priority: "high",
    entryAt: new Date(Date.now() - 3600000 * 22),
    stageEnteredAt: new Date(Date.now() - 3600000 * 2),
    estimatedDeliveryAt: new Date(Date.now() + 3600000 * 4),
    bayId: "bay-4",
    bayName: "Baía 4 - Teste & Qualidade",
    totalAmount: 5800.0,
    notes: "Revisão geral, troca de fluido de transmissão e alinhamento 3D.",
    occurrencesCount: 0,
    missingOpenOs: false,
    version: 1,
  },
  {
    id: 6,
    plate: "MNO7P55",
    make: "Chevrolet",
    model: "Tracker Premier 1.2 Turbo",
    year: 2023,
    color: "Vermelho Carmim",
    mileage: 18400,
    currentStage: "pronto",
    status: "active",
    customerName: "Fernanda Lima",
    customerPhone: "(11) 94678-9012",
    customerEmail: "fernanda.lima@advocacia.com",
    serviceOrderId: 6,
    assignedMechanicId: 4,
    assignedMechanicName: "Juliana Costa",
    collaboratorId: 4,
    collaboratorName: "Juliana Costa",
    currentCollaboratorId: 4,
    priority: "normal",
    entryAt: new Date(Date.now() - 3600000 * 30),
    stageEnteredAt: new Date(Date.now() - 3600000 * 1),
    estimatedDeliveryAt: new Date(Date.now() - 3600000 * 1),
    bayId: null,
    totalAmount: 1250.0,
    notes: "Higienização e revisão básica concluídas.",
    occurrencesCount: 0,
    missingOpenOs: false,
    version: 1,
  },
];

const initialServiceOrders: ServiceOrderItem[] = [
  {
    id: 1,
    code: "OS-2025-0101",
    displayCode: "OS-0101",
    title: "Revisão Geral e Manutenção Preventiva",
    status: "open",
    currentStage: "triagem",
    yardVehicleId: 1,
    vehicleId: 1,
    vehiclePlate: "ABC1D23",
    vehicleMake: "Toyota",
    vehicleModel: "Corolla 2.0 Altis",
    vehicleYear: 2022,
    vehicleColor: "Prata",
    mileage: 45200,
    fuelLevel: "3/4",
    customerName: "Alexandre Pires",
    customerPhone: "(11) 98123-4567",
    customerEmail: "alexandre.pires@gmail.com",
    responsibleId: 4,
    responsibleName: "Juliana Costa",
    responsiblePosition: "consultor",
    responsibleCollaboratorId: 4,
    createdByName: "Juliana Costa",
    serviceType: "Revisão",
    serviceDescription: "Revisão Completa 45.000 km",
    reportedDefects: "Revisão dos 45k km e verificação de ruído na dianteira.",
    diagnosticNotes: "Triagem em andamento. Checklist inicial sem avarias aparentes.",
    diagnosis: "Triagem em andamento. Checklist inicial sem avarias aparentes.",
    items: [
      {
        id: "item-1",
        kind: "service",
        description: "Revisão Completa 45.000 km",
        quantity: 1,
        unitPrice: 450.0,
        totalPrice: 450.0,
        status: "approved",
      },
      {
        id: "item-2",
        kind: "part",
        description: "Kit Filtros (Óleo, Ar, Combustível, Cabine)",
        quantity: 1,
        unitPrice: 380.0,
        totalPrice: 380.0,
        status: "approved",
      },
      {
        id: "item-3",
        kind: "fluid",
        description: "Óleo Sintético 0W20 100% Sintético (4.5L)",
        quantity: 4.5,
        unitPrice: 70.0,
        totalPrice: 315.0,
        status: "approved",
      },
    ],
    totalServices: 450.0,
    totalParts: 695.0,
    totalAmount: 1145.0,
    laborAmountCents: 45000,
    partsAmountCents: 69500,
    totalAmountCents: 114500,
    entryAt: new Date(Date.now() - 3600000 * 2),
    estimatedDeliveryAt: new Date(Date.now() + 3600000 * 24),
    expectedCompletionAt: new Date(Date.now() + 3600000 * 24),
    comments: [
      {
        id: "c-1",
        authorName: "Juliana Costa",
        text: "Cliente solicitou entrega até amanhã às 17h.",
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
    ],
    updates: [
      {
        id: "u-1",
        authorName: "Juliana Costa",
        text: "Abertura da OS e triagem inicial.",
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
    ],
    version: 1,
    createdAt: new Date(Date.now() - 3600000 * 2),
    updatedAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    id: 3,
    code: "OS-2025-0103",
    displayCode: "OS-0103",
    title: "Reparo de Freios e Suspensão Dianteira",
    status: "in_progress",
    currentStage: "execucao",
    yardVehicleId: 3,
    vehicleId: 3,
    vehiclePlate: "DAP4O26",
    vehicleMake: "Jeep",
    vehicleModel: "Compass 1.3 Turbo Longitude",
    vehicleYear: 2023,
    vehicleColor: "Cinza Granite",
    mileage: 34100,
    fuelLevel: "1/2",
    customerName: "Claudio Mendonça",
    customerPhone: "(11) 97345-6789",
    customerEmail: "claudio.m@empresa.com.br",
    responsibleId: 1,
    responsibleName: "Carlos Eduardo Silva",
    responsiblePosition: "mecanico_chefe",
    responsibleCollaboratorId: 1,
    createdByName: "Carlos Eduardo Silva",
    serviceType: "Freios e Suspensão",
    serviceDescription: "Substituição do Par de Discos, Pastilhas e Buchas",
    reportedDefects: "Vibração ao frear e estalo na suspensão ao passar em lombadas.",
    diagnosticNotes: "Discos dianteiros empenados e buchas da bandeja com folga excessiva.",
    diagnosis: "Discos dianteiros empenados e buchas da bandeja com folga excessiva.",
    items: [
      {
        id: "item-301",
        kind: "service",
        description: "Substituição do Par de Discos e Pastilhas Dianteiras",
        quantity: 1,
        unitPrice: 350.0,
        totalPrice: 350.0,
        status: "in_progress",
      },
      {
        id: "item-302",
        kind: "part",
        description: "Jogo de Discos de Freio Ventilados Dianteiros",
        quantity: 1,
        unitPrice: 1200.0,
        totalPrice: 1200.0,
        status: "in_progress",
      },
      {
        id: "item-303",
        kind: "part",
        description: "Jogo de Pastilhas Cerâmica Dianteiras",
        quantity: 1,
        unitPrice: 650.0,
        totalPrice: 650.0,
        status: "in_progress",
      },
      {
        id: "item-304",
        kind: "service",
        description: "Substituição de Buchas da Bandeja e Alinhamento 3D",
        quantity: 1,
        unitPrice: 450.0,
        totalPrice: 450.0,
        status: "in_progress",
      },
      {
        id: "item-305",
        kind: "part",
        description: "Kit Buchas de Suspensão Poliuretano Reforçadas",
        quantity: 2,
        unitPrice: 400.0,
        totalPrice: 800.0,
        status: "in_progress",
      },
    ],
    totalServices: 800.0,
    totalParts: 2650.0,
    totalAmount: 3450.0,
    laborAmountCents: 80000,
    partsAmountCents: 265000,
    totalAmountCents: 345000,
    entryAt: new Date(Date.now() - 3600000 * 18),
    estimatedDeliveryAt: new Date(Date.now() + 3600000 * 3),
    expectedCompletionAt: new Date(Date.now() + 3600000 * 3),
    comments: [
      {
        id: "c-301",
        authorName: "Carlos Eduardo Silva",
        text: "Desmontagem concluída. Iniciando instalação das peças novas.",
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
    ],
    updates: [
      {
        id: "u-301",
        authorName: "Carlos Eduardo Silva",
        text: "Execução iniciada no Elevador 1.",
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
    ],
    version: 1,
    createdAt: new Date(Date.now() - 3600000 * 18),
    updatedAt: new Date(Date.now() - 3600000 * 1),
  },
];

const initialAppointments: AppointmentItem[] = [
  {
    id: 1,
    customerName: "Guilherme Siqueira",
    customerPhone: "(11) 98888-1122",
    customerEmail: "guilherme.s@gmail.com",
    vehiclePlate: "KJH4G56",
    vehicleMake: "Hyundai",
    vehicleModel: "Creta 1.0 TGDI Ultimate",
    vehicleYear: 2023,
    status: "scheduled",
    scheduledAt: Date.now() + 3600000 * 3,
    estimatedDurationMinutes: 120,
    serviceType: "Revisão Periódica",
    serviceRequested: "Revisão Periódica 30k km",
    notes: "Cliente aguarda no local.",
    assignedCollaboratorId: 4,
    assignedCollaboratorName: "Juliana Costa",
    responsibleName: "Juliana Costa",
    responsibleCollaboratorId: 4,
    version: 1,
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: 2,
    customerName: "Helena Moreira",
    customerPhone: "(11) 97777-3344",
    customerEmail: "helena.moreira@uol.com.br",
    vehiclePlate: "PLM8N90",
    vehicleMake: "Nissan",
    vehicleModel: "Kicks 1.6 Exclusive",
    vehicleYear: 2022,
    status: "confirmed",
    scheduledAt: Date.now() + 3600000 * 6,
    estimatedDurationMinutes: 180,
    serviceType: "Diagnóstico de Ar Condicionado",
    serviceRequested: "Ar condicionado parou de gelar",
    notes: "Ar parou de gelar após viagem.",
    assignedCollaboratorId: 3,
    assignedCollaboratorName: "Marcos Oliveira",
    responsibleName: "Marcos Oliveira",
    responsibleCollaboratorId: 3,
    version: 1,
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
];

const initialOccurrences: OccurrenceItem[] = [
  {
    id: 1,
    title: "Atraso no envio do coxim do motor",
    description: "Distribuidor informou atraso na remessa do coxim hidráulico.",
    type: "part_delay",
    severity: "medium",
    status: "in_progress",
    yardVehicleId: 4,
    vehicleId: 4,
    vehiclePlate: "XYZ9K88",
    vehicleModel: "Honda Civic Touring",
    serviceOrderId: 4,
    responsibleId: 2,
    responsibleName: "Roberto Mendes",
    createdAt: new Date(Date.now() - 3600000 * 12),
  },
  {
    id: 2,
    title: "Aprovação pendente de complemento",
    description: "Enviada cotação de buchas adicionais via WhatsApp, aguardando retorno.",
    type: "approval_pending",
    severity: "high",
    status: "open",
    yardVehicleId: 3,
    vehicleId: 3,
    vehiclePlate: "DAP4O26",
    vehicleModel: "Jeep Compass",
    serviceOrderId: 3,
    responsibleId: 4,
    responsibleName: "Juliana Costa",
    createdAt: new Date(Date.now() - 3600000 * 4),
  },
];

const initialWorkshopBays: WorkshopBay[] = [
  {
    id: "bay-1",
    code: "ELEV-01",
    name: "Elevador 1 - Suspensão e Freios",
    type: "elevator",
    status: "occupied",
    currentVehicleId: 3,
    allocatedVehicle: initialVehicles[2],
    assignedMechanicId: 1,
    assignedMechanicName: "Carlos Eduardo Silva",
  },
  {
    id: "bay-2",
    code: "ELEV-02",
    name: "Elevador 2 - Diagnóstico e Scanner",
    type: "elevator",
    status: "occupied",
    currentVehicleId: 2,
    allocatedVehicle: initialVehicles[1],
    assignedMechanicId: 3,
    assignedMechanicName: "Marcos Oliveira",
  },
  {
    id: "bay-3",
    code: "ELEV-03",
    name: "Elevador 3 - Motor e Transmissão",
    type: "elevator",
    status: "available",
    currentVehicleId: null,
    allocatedVehicle: null,
  },
  {
    id: "bay-4",
    code: "QUAL-01",
    name: "Baía 4 - Controle de Qualidade & Teste",
    type: "bench",
    status: "occupied",
    currentVehicleId: 5,
    allocatedVehicle: initialVehicles[4],
    assignedMechanicId: 5,
    assignedMechanicName: "Fernando Ramos",
  },
  {
    id: "bay-5",
    code: "ALIN-01",
    name: "Rampa de Alinhamento 3D",
    type: "alignment",
    status: "available",
    currentVehicleId: null,
    allocatedVehicle: null,
  },
  {
    id: "bay-6",
    code: "LAV-01",
    name: "Box de Lavagem e Estética",
    type: "wash",
    status: "available",
    currentVehicleId: null,
    allocatedVehicle: null,
  },
];

// Global Reactive State Store
class WorkshopStateStore {
  collaborators = [...initialCollaborators];
  vehicles = [...initialVehicles];
  serviceOrders = [...initialServiceOrders];
  appointments = [...initialAppointments];
  occurrences = [...initialOccurrences];
  bays = [...initialWorkshopBays];
  listeners = new Set<() => void>();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  // Actions
  moveVehicleStage(vehicleId: number | string, toStage: PatioStage) {
    const vh = this.vehicles.find(v => String(v.id) === String(vehicleId));
    if (vh) {
      vh.currentStage = toStage;
      vh.stageEnteredAt = new Date();
      if (toStage === "pronto") {
        vh.status = "active";
      }
      const os = this.serviceOrders.find(o => String(o.yardVehicleId) === String(vehicleId) || String(o.id) === String(vh.serviceOrderId));
      if (os) {
        os.currentStage = toStage;
      }
      this.notify();
    }
  }

  createVehicle(data: Partial<YardVehicleItem>) {
    const nextId = this.vehicles.length > 0 ? Math.max(...this.vehicles.map(v => v.id)) + 1 : 1;
    const newVh: YardVehicleItem = {
      id: nextId,
      plate: data.plate || "ABC1234",
      make: data.make || "Desconhecida",
      model: data.model || "Modelo",
      year: data.year || new Date().getFullYear(),
      color: data.color || "Prata",
      mileage: data.mileage || 0,
      currentStage: data.currentStage || "triagem",
      status: "active",
      customerName: data.customerName || "Cliente",
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      priority: data.priority || "normal",
      entryAt: new Date(),
      stageEnteredAt: new Date(),
      estimatedDeliveryAt: data.estimatedDeliveryAt || new Date(Date.now() + 86400000),
      notes: data.notes,
      totalAmount: 0,
      occurrencesCount: 0,
      missingOpenOs: false,
      version: 1,
    };
    this.vehicles.unshift(newVh);
    this.notify();
    return newVh;
  }

  createServiceOrder(data: any) {
    const nextId = this.serviceOrders.length > 0 ? Math.max(...this.serviceOrders.map(o => Number(o.id) || 0)) + 1 : 1;
    const newOs: ServiceOrderItem = {
      id: nextId,
      code: `OS-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "open",
      currentStage: data.currentStage || "triagem",
      yardVehicleId: data.yardVehicleId || nextId,
      vehiclePlate: data.vehiclePlate || data.plate || "ABC1234",
      vehicleMake: data.vehicleMake || data.make || "",
      vehicleModel: data.vehicleModel || data.model || "Veículo",
      vehicleYear: data.vehicleYear || data.year || 2023,
      mileage: data.mileage || 0,
      customerName: data.customerName || "Cliente",
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      reportedDefects: data.reportedDefects || data.observations || data.complaint,
      items: data.items || [],
      totalServices: data.totalServices || 0,
      totalParts: data.totalParts || 0,
      totalAmount: data.totalAmount || 0,
      laborAmountCents: Math.round((data.totalServices || 0) * 100),
      partsAmountCents: Math.round((data.totalParts || 0) * 100),
      totalAmountCents: Math.round((data.totalAmount || 0) * 100),
      entryAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.serviceOrders.unshift(newOs);

    // Also ensure vehicle exists in yard
    let vh = this.vehicles.find(v => String(v.id) === String(newOs.yardVehicleId) || v.plate === newOs.vehiclePlate);
    if (!vh) {
      vh = {
        id: Number(newOs.yardVehicleId),
        plate: newOs.vehiclePlate,
        make: newOs.vehicleMake || "",
        model: newOs.vehicleModel,
        year: newOs.vehicleYear,
        currentStage: newOs.currentStage,
        status: "active",
        customerName: newOs.customerName,
        customerPhone: newOs.customerPhone,
        customerEmail: newOs.customerEmail,
        serviceOrderId: newOs.id,
        priority: "normal",
        entryAt: new Date(),
        stageEnteredAt: new Date(),
        totalAmount: newOs.totalAmount,
      };
      this.vehicles.unshift(vh);
    } else {
      vh.serviceOrderId = newOs.id;
    }

    this.notify();
    return newOs;
  }

  allocateBay(bayId: string, vehicleId: number | string) {
    const bay = this.bays.find(b => b.id === bayId);
    const vh = this.vehicles.find(v => String(v.id) === String(vehicleId));
    if (bay && vh) {
      bay.status = "occupied";
      bay.currentVehicleId = vh.id;
      bay.allocatedVehicle = vh;
      vh.bayId = bay.id;
      vh.bayName = bay.name;
      this.notify();
    }
  }

  releaseBay(bayId: string) {
    const bay = this.bays.find(b => b.id === bayId);
    if (bay) {
      if (bay.currentVehicleId) {
        const vh = this.vehicles.find(v => String(v.id) === String(bay.currentVehicleId));
        if (vh) {
          vh.bayId = null;
          vh.bayName = null;
        }
      }
      bay.status = "available";
      bay.currentVehicleId = null;
      bay.allocatedVehicle = null;
      this.notify();
    }
  }
}

export const store = new WorkshopStateStore();

// React hook to trigger re-renders when store updates
function useStoreSubscription() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsubscribe = store.subscribe(() => setTick(t => t + 1));
    return () => {
      unsubscribe();
    };
  }, []);
}

// Query hook factory
function createQueryHook<TData, TVariables = any>(
  fetcher: (variables?: TVariables) => TData
) {
  return function useQuery(
    variables?: TVariables,
    options?: { enabled?: boolean; refetchInterval?: number | false; refetchIntervalInBackground?: boolean }
  ) {
    useStoreSubscription();
    const enabled = options?.enabled !== false;
    const [data, setData] = useState<TData>(() => (enabled ? fetcher(variables) : (undefined as any)));
    const [isLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
      if (enabled) {
        setData(fetcher(variables));
      }
    }, [variables, enabled]);

    const refetch = useCallback(async () => {
      setIsFetching(true);
      const res = fetcher(variables);
      setData(res);
      setIsFetching(false);
      return { data: res };
    }, [variables]);

    return {
      data,
      isLoading,
      isFetching,
      isSuccess: true,
      isError: false,
      error: null as any,
      dataUpdatedAt: Date.now(),
      refetch,
    };
  };
}

// Mutation hook factory
function createMutationHook<TVariables = any, TResult = any>(
  mutator: (variables: TVariables) => TResult | Promise<TResult>
) {
  return function useMutation(options?: {
    onMutate?: (variables: TVariables) => any;
    onSuccess?: (data: TResult, variables: TVariables, context?: any) => void;
    onError?: (error: any, variables: TVariables, context?: any) => void;
    onSettled?: (data: TResult | undefined, error: any, variables: TVariables, context?: any) => void;
  }) {
    const [isPending, setIsPending] = useState(false);

    const mutate = useCallback(
      (variables: TVariables, callOptions?: { onSuccess?: (data: TResult) => void }) => {
        setIsPending(true);
        let ctx: any = undefined;
        try {
          if (options?.onMutate) {
            ctx = options.onMutate(variables);
          }
          const res = mutator(variables);
          setIsPending(false);
          options?.onSuccess?.(res as TResult, variables, ctx);
          options?.onSettled?.(res as TResult, null, variables, ctx);
          callOptions?.onSuccess?.(res as TResult);
          return res;
        } catch (err: any) {
          setIsPending(false);
          options?.onError?.(err, variables, ctx);
          options?.onSettled?.(undefined, err, variables, ctx);
          throw err;
        }
      },
      [options]
    );

    const mutateAsync = useCallback(
      async (variables: TVariables) => {
        setIsPending(true);
        let ctx: any = undefined;
        try {
          if (options?.onMutate) {
            ctx = options.onMutate(variables);
          }
          const res = await mutator(variables);
          setIsPending(false);
          options?.onSuccess?.(res as TResult, variables, ctx);
          options?.onSettled?.(res as TResult, null, variables, ctx);
          return res;
        } catch (err: any) {
          setIsPending(false);
          options?.onError?.(err, variables, ctx);
          options?.onSettled?.(undefined, err, variables, ctx);
          throw err;
        }
      },
      [options]
    );

    return {
      mutate,
      mutateAsync,
      isPending,
      isLoading: isPending,
    };
  };
}

export const trpc = {
  useUtils() {
    return {
      invalidate: (_params?: any) => store.notify(),
      dashboard: {
        overview: {
          invalidate: (_params?: any) => store.notify(),
        },
      },
      appointments: {
        list: {
          cancel: async () => {},
          getData: () => store.appointments,
          setData: (updater: any) => {
            if (typeof updater === "function") store.appointments = updater(store.appointments);
            store.notify();
          },
          invalidate: (_params?: any) => store.notify(),
        },
      },
      patio: {
        list: {
          cancel: async (_params?: any) => {},
          getData: (_params?: any) => store.vehicles,
          setData: (paramsOrUpdater: any, maybeUpdater?: any) => {
            const updater = typeof paramsOrUpdater === "function" ? paramsOrUpdater : maybeUpdater;
            if (typeof updater === "function") store.vehicles = updater(store.vehicles);
            store.notify();
          },
          invalidate: (_params?: any) => store.notify(),
        },
        get: {
          invalidate: (_params?: any) => store.notify(),
        },
      },
      serviceOrders: {
        list: {
          cancel: async () => {},
          getData: () => store.serviceOrders,
          setData: (updater: any) => {
            if (typeof updater === "function") store.serviceOrders = updater(store.serviceOrders);
            store.notify();
          },
          invalidate: (_params?: any) => store.notify(),
        },
        get: { invalidate: (_params?: any) => store.notify() },
        workspace: { invalidate: (_params?: any) => store.notify() },
      },
      collaborators: {
        list: {
          cancel: async () => {},
          getData: () => store.collaborators,
          setData: (updater: any) => {
            if (typeof updater === "function") store.collaborators = updater(store.collaborators);
            store.notify();
          },
          invalidate: (_params?: any) => store.notify(),
        },
      },
      occurrences: {
        list: {
          cancel: async () => {},
          getData: () => store.occurrences,
          setData: (updater: any) => {
            if (typeof updater === "function") store.occurrences = updater(store.occurrences);
            store.notify();
          },
          invalidate: (_params?: any) => store.notify(),
        },
        summary: { invalidate: (_params?: any) => store.notify() },
      },
      workshop: {
        capacity: {
          summary: { invalidate: (_params?: any) => store.notify() },
        },
        resources: {
          list: {
            cancel: async () => {},
            invalidate: (_params?: any) => store.notify(),
          },
        },
      },
    };
  },
  useContext() {
    return this.useUtils();
  },

  // Dashboard procedures
  dashboard: {
    overview: {
      useQuery: createQueryHook(() => {
        const activeVehicles = store.vehicles.filter(v => v.status === "active");
        const totalActive = activeVehicles.length;
        const yardCapacity = 16;
        const occupancyPct = Math.round((totalActive / yardCapacity) * 100);
        const occupancyTone: "green" | "yellow" | "red" =
          occupancyPct > 90 ? "red" : occupancyPct > 70 ? "yellow" : "green";

        const overdue = activeVehicles.filter(v => {
          if (!v.estimatedDeliveryAt) return false;
          return new Date(v.estimatedDeliveryAt).getTime() < Date.now();
        }).length;

        const dueSoon = activeVehicles.filter(v => {
          if (!v.estimatedDeliveryAt) return false;
          const diff = (new Date(v.estimatedDeliveryAt).getTime() - Date.now()) / (1000 * 60 * 60);
          return diff >= 0 && diff <= 6;
        }).length;

        const completedToday = 4;
        const activeOccurrences = store.occurrences.filter(o => o.status === "open" || o.status === "in_progress").length;
        const totalBudget = activeVehicles.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

        const stageBreakdown = {
          triagem: activeVehicles.filter(v => v.currentStage === "triagem").length,
          diagnostico: activeVehicles.filter(v => v.currentStage === "diagnostico").length,
          orcamento: activeVehicles.filter(v => v.currentStage === "orcamento").length,
          aprovacao: activeVehicles.filter(v => v.currentStage === "aprovacao").length,
          aguardando_peca: activeVehicles.filter(v => v.currentStage === "aguardando_peca").length,
          execucao: activeVehicles.filter(v => v.currentStage === "execucao").length,
          qualidade: activeVehicles.filter(v => v.currentStage === "qualidade").length,
          lavagem: activeVehicles.filter(v => v.currentStage === "lavagem").length,
          pronto: activeVehicles.filter(v => v.currentStage === "pronto").length,
        };

        const stagePlates: Record<string, string[]> = {};
        activeVehicles.forEach(v => {
          if (!stagePlates[v.currentStage]) stagePlates[v.currentStage] = [];
          stagePlates[v.currentStage].push(v.plate);
        });

        const overduePlates = activeVehicles
          .filter(v => v.estimatedDeliveryAt && new Date(v.estimatedDeliveryAt).getTime() < Date.now())
          .map(v => ({ id: v.id, plate: v.plate, model: v.model, stage: v.currentStage }));

        const dueSoonPlates = activeVehicles
          .filter(v => {
            if (!v.estimatedDeliveryAt) return false;
            const diff = (new Date(v.estimatedDeliveryAt).getTime() - Date.now()) / (1000 * 60 * 60);
            return diff >= 0 && diff <= 6;
          })
          .map(v => ({ id: v.id, plate: v.plate, model: v.model, stage: v.currentStage }));

        const moneyInYardVehicles = activeVehicles.map(v => ({
          id: v.id,
          plate: v.plate,
          model: v.model,
          stage: v.currentStage,
          approvedCents: Math.round((v.totalAmount || 1500) * 100),
          totalCents: Math.round((v.totalAmount || 1500) * 100),
        }));

        const appointmentsToday = store.appointments.map(a => ({
          id: a.id,
          plate: a.vehiclePlate,
          model: a.vehicleModel,
          customer: a.customerName,
          label: a.serviceType || "Revisão",
          time: new Date(a.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        }));

        const activePlates = activeVehicles.map(v => ({
          id: v.id,
          plate: v.plate,
          model: v.model,
          stage: v.currentStage,
        }));

        const stageDistribution = [
          { stage: "triagem", count: stageBreakdown.triagem, total: totalActive, label: "Triagem", color: "#f59e0b" },
          { stage: "diagnostico", count: stageBreakdown.diagnostico, total: totalActive, label: "Diagnóstico", color: "#3b82f6" },
          { stage: "orcamento", count: stageBreakdown.orcamento, total: totalActive, label: "Orçamento", color: "#a855f7" },
          { stage: "aprovacao", count: stageBreakdown.aprovacao, total: totalActive, label: "Aprovação", color: "#6366f1" },
          { stage: "aguardando_peca", count: stageBreakdown.aguardando_peca, total: totalActive, label: "Peças", color: "#f97316" },
          { stage: "execucao", count: stageBreakdown.execucao, total: totalActive, label: "Execução", color: "#0ea5e9" },
          { stage: "qualidade", count: stageBreakdown.qualidade, total: totalActive, label: "Qualidade", color: "#14b8a6" },
          { stage: "lavagem", count: stageBreakdown.lavagem, total: totalActive, label: "Lavagem", color: "#06b6d4" },
          { stage: "pronto", count: stageBreakdown.pronto, total: totalActive, label: "Pronto", color: "#10b981" },
        ];

        const averageStageTime = [
          { stage: "triagem", label: "Triagem", averageMs: 2700000, averageMinutes: 45, averageHours: 0.75, count: stageBreakdown.triagem },
          { stage: "diagnostico", label: "Diagnóstico", averageMs: 7200000, averageMinutes: 120, averageHours: 2, count: stageBreakdown.diagnostico },
          { stage: "execucao", label: "Execução", averageMs: 16800000, averageMinutes: 280, averageHours: 4.6, count: stageBreakdown.execucao },
          { stage: "qualidade", label: "Qualidade", averageMs: 2400000, averageMinutes: 40, averageHours: 0.6, count: stageBreakdown.qualidade },
        ];

        const productivity = store.collaborators.map(c => ({
          collaboratorId: c.id,
          name: c.name,
          position: (c.position as CollaboratorPosition) || "tecnico",
          completedStages: c.completedStages || 15,
          vehiclesHandled: c.vehiclesHandled || 18,
          averageDurationMs: 3600000 * 2.5,
          vehicles: activeVehicles.map(v => ({ id: v.id, plate: v.plate, model: v.model, stage: v.currentStage })),
        }));

        return {
          totalActive,
          yardCapacity,
          occupancyPct,
          occupancyTone,
          overdue,
          dueSoon,
          completedToday,
          activeOccurrences,
          totalBudget,
          moneyInYardCents: Math.round(totalBudget * 100),
          moneyInYardVehicles,
          cashForecastCents: Math.round((totalBudget * 1.35) * 100),
          cashForecastVehicles: moneyInYardVehicles,
          appointmentsTodayCount: appointmentsToday.length,
          appointmentsToday,
          activePlates,
          stageBreakdown,
          stagePlates,
          overduePlates,
          dueSoonPlates,
          stageDistribution,
          averageStageTime,
          productivity,
          collaboratorRanking: productivity,
          flowChartData: [
            { name: "Seg", entradas: 6, concluidos: 5 },
            { name: "Ter", entradas: 8, concluidos: 7 },
            { name: "Qua", entradas: 5, concluidos: 6 },
            { name: "Qui", entradas: 9, concluidos: 8 },
            { name: "Sex", entradas: 7, concluidos: 7 },
            { name: "Sáb", entradas: 4, concluidos: 4 },
          ],
        };
      }),
    },
  },

  // Patio procedures
  patio: {
    list: {
      useQuery: createQueryHook((params?: any) => {
        let result = [...store.vehicles];
        if (params?.status && params.status !== "all") {
          result = result.filter(v => v.status === params.status);
        }
        if (params?.stage && params.stage !== "all") {
          result = result.filter(v => v.currentStage === params.stage);
        }
        return result;
      }),
    },
    get: {
      useQuery: createQueryHook((params: { id?: number | string } | undefined) => {
        if (!params?.id) return null;
        return store.vehicles.find(v => String(v.id) === String(params.id)) || null;
      }),
    },
    directory: {
      useQuery: createQueryHook(() => {
        return store.vehicles.map(v => ({
          id: v.id,
          plate: v.plate,
          make: v.make,
          model: v.model,
          customerName: v.customerName,
          serviceOrderId: v.serviceOrderId,
        }));
      }),
    },
    move: {
      useMutation: createMutationHook((vars: { id?: number | string; vehicleId?: number | string; toStage: PatioStage; expectedVersion?: number }) => {
        const targetId = vars.vehicleId || vars.id || "";
        store.moveVehicleStage(targetId, vars.toStage);
        return { success: true };
      }),
    },
    confirmDelivery: {
      useMutation: createMutationHook((vars: { vehicleId?: number | string; id?: number | string; expectedVersion?: number }) => {
        const targetId = vars.vehicleId || vars.id;
        const vh = store.vehicles.find(v => String(v.id) === String(targetId));
        if (vh) {
          vh.status = "delivered";
          store.notify();
        }
        return { success: true };
      }),
    },
    cancel: {
      useMutation: createMutationHook((vars: { vehicleId?: number | string; id?: number | string; reason?: string; expectedVersion?: number }) => {
        const targetId = vars.vehicleId || vars.id;
        const vh = store.vehicles.find(v => String(v.id) === String(targetId));
        if (vh) {
          vh.status = "cancelled";
          store.notify();
        }
        return { success: true };
      }),
    },
  },

  // Service Orders
  serviceOrders: {
    list: {
      useQuery: createQueryHook((params?: any) => {
        let result = [...store.serviceOrders];
        if (params?.status && params.status !== "all") {
          result = result.filter(o => o.status === params.status);
        }
        return result;
      }),
    },
    get: {
      useQuery: createQueryHook((params: { id?: number | string } | undefined) => {
        if (!params?.id) return null;
        return store.serviceOrders.find(o => String(o.id) === String(params.id)) || null;
      }),
    },
    workspace: {
      useQuery: createQueryHook((params: { id?: number | string; orderId?: number | string } | undefined) => {
        const queryId = params?.id || params?.orderId;
        const os = (queryId ? store.serviceOrders.find(o => String(o.id) === String(queryId)) : store.serviceOrders[0]) || store.serviceOrders[0];
        if (!os) return null;
        const vehicle = store.vehicles.find(v => String(v.id) === String(os.yardVehicleId) || v.plate === os.vehiclePlate) || store.vehicles[0];

        const budgetItems = os.items.map(item => ({
          ...item,
          quantity: item.quantity,
          unitPriceCents: Math.round(item.unitPrice * 100),
          totalPriceCents: Math.round(item.totalPrice * 100),
          costPriceCents: Math.round(item.unitPrice * 0.6 * 100),
          amountCents: Math.round(item.totalPrice * 100),
          costCents: Math.round(item.unitPrice * 0.6 * 100),
          priorityLabel: "Normal",
        }));

        const totalAmountCents = Math.round(os.totalAmount * 100);
        const totalServicesCents = Math.round(os.totalServices * 100);
        const totalPartsCents = Math.round(os.totalParts * 100);

        return {
          ...os,
          id: Number(os.id),
          version: 1,
          vehicleId: vehicle ? vehicle.id : 1,
          yardCurrentStage: vehicle ? vehicle.currentStage : os.currentStage,
          yardStageEnteredAt: vehicle?.stageEnteredAt ? new Date(vehicle.stageEnteredAt).getTime() : Date.now() - 3600000 * 2,
          yardCreatedAt: vehicle?.entryAt ? new Date(vehicle.entryAt).getTime() : Date.now() - 3600000 * 4,
          yardVersion: vehicle?.version || 1,
          diagnosis: os.diagnosticNotes || "Diagnóstico técnico realizado. Revisão geral e substituição de componentes conforme orçamento.",
          budgetItems,
          budgetSummary: {
            totalCents: totalAmountCents,
            totalBudgeted: totalAmountCents,
            approvedCents: totalAmountCents,
            approved: totalAmountCents,
            pendingCents: 0,
            pending: 0,
            rejectedCents: 0,
            rejected: 0,
            totalOs: totalAmountCents,
            itemsCount: os.items.length,
          },
          consultantName: "Juliana Costa",
          responsibleSpecialty: "Motor & Suspensão",
          workshopResourceName: "Elevador 1 - Principal",
          totalAmountCents,
          totalServicesCents,
          totalPartsCents,
          isFirstVisit: false,
          campaignOrigin: "Google / Busca",
          yardVehicle: vehicle || null,
        };
      }),
    },
    openWizard: {
      useMutation: createMutationHook((vars: any) => {
        const newOs = store.createServiceOrder(vars);
        return { id: newOs.id, code: newOs.code, order: newOs };
      }),
    },
    create: {
      useMutation: createMutationHook((vars: any) => {
        const newOs = store.createServiceOrder(vars);
        return newOs;
      }),
    },
    update: {
      useMutation: createMutationHook((vars: any) => {
        const os = store.serviceOrders.find(o => String(o.id) === String(vars.id));
        if (os) {
          Object.assign(os, vars, { updatedAt: new Date() });
          store.notify();
        }
        return os;
      }),
    },
    addComment: {
      useMutation: createMutationHook((vars: { id?: number | string; serviceOrderId?: number | string; text?: string; body?: string; authorName?: string }) => {
        const orderId = vars.serviceOrderId || vars.id;
        const os = store.serviceOrders.find(o => String(o.id) === String(orderId));
        if (os) {
          if (!os.comments) os.comments = [];
          if (!os.updates) os.updates = [];
          const commentText = vars.body || vars.text || "";
          const newEntry = {
            id: "c-" + Date.now(),
            authorName: vars.authorName || "Usuário",
            text: commentText,
            createdAt: new Date(),
          };
          os.comments.push(newEntry);
          os.updates.push(newEntry);
          store.notify();
        }
        return { success: true };
      }),
    },
    updateBudgetItemStatus: {
      useMutation: createMutationHook((vars: { id?: string | number; orderId?: number | string; serviceOrderId?: number | string; itemId?: string | number; status: any }) => {
        const orderId = vars.orderId || vars.serviceOrderId;
        const itemId = vars.itemId || vars.id;
        const os = store.serviceOrders.find(o => String(o.id) === String(orderId));
        if (os) {
          const item = os.items.find(i => String(i.id) === String(itemId));
          if (item) {
            item.status = vars.status;
            store.notify();
          }
        }
        return { success: true };
      }),
    },
  },

  // Appointments
  appointments: {
    list: {
      useQuery: createQueryHook(() => {
        return [...store.appointments];
      }),
    },
    action: {
      useMutation: createMutationHook((vars: {
        appointmentId?: number | string;
        id?: number | string;
        action: string;
        version?: number;
        expectedVersion?: number;
        scheduledAt?: string | number | Date;
      }) => {
        const targetId = vars.appointmentId || vars.id;
        const apt = store.appointments.find(a => String(a.id) === String(targetId));
        if (apt) {
          if (vars.action === "confirm") apt.status = "confirmed";
          if (vars.action === "cancel") apt.status = "cancelled";
          if (vars.action === "no_show") apt.status = "no_show";
          if (vars.action === "checkin" || vars.action === "check_in") {
            apt.status = "checked_in";
            // Create yard vehicle
            const vh = store.createVehicle({
              plate: apt.vehiclePlate,
              make: apt.vehicleMake || "",
              model: apt.vehicleModel,
              year: apt.vehicleYear,
              customerName: apt.customerName,
              customerPhone: apt.customerPhone,
              customerEmail: apt.customerEmail,
              currentStage: "triagem",
            });
            apt.yardVehicleId = vh.id;
          }
          store.notify();
        }
        return { success: true, triggerId: vars.action, triggerLabel: vars.action };
      }),
    },
    create: {
      useMutation: createMutationHook((vars: any) => {
        const nextId = store.appointments.length > 0 ? Math.max(...store.appointments.map(a => a.id)) + 1 : 1;
        const newApt: AppointmentItem = {
          id: nextId,
          customerName: vars.customerName,
          customerPhone: vars.customerPhone,
          customerEmail: vars.customerEmail,
          vehiclePlate: vars.vehiclePlate,
          vehicleMake: vars.vehicleMake,
          vehicleModel: vars.vehicleModel,
          vehicleYear: vars.vehicleYear,
          status: "scheduled",
          scheduledAt: vars.scheduledAt ? (typeof vars.scheduledAt === "number" ? vars.scheduledAt : new Date(vars.scheduledAt).getTime()) : Date.now(),
          estimatedDurationMinutes: Number(vars.estimatedDurationMinutes) || 120,
          serviceType: vars.serviceType || vars.serviceRequested || "Geral",
          serviceRequested: vars.serviceRequested || vars.serviceType || "Geral",
          notes: vars.notes,
          assignedCollaboratorId: vars.assignedCollaboratorId || vars.responsibleCollaboratorId,
          assignedCollaboratorName: vars.assignedCollaboratorName || vars.responsibleName,
          responsibleName: vars.responsibleName || vars.assignedCollaboratorName,
          responsibleCollaboratorId: vars.responsibleCollaboratorId || vars.assignedCollaboratorId,
          version: 1,
          createdAt: new Date(),
        };
        store.appointments.unshift(newApt);
        store.notify();
        return newApt;
      }),
    },
    update: {
      useMutation: createMutationHook((vars: any) => {
        const apt = store.appointments.find(a => String(a.id) === String(vars.id));
        if (apt) {
          Object.assign(apt, vars);
          store.notify();
        }
        return apt;
      }),
    },
  },

  // Collaborators / Team
  collaborators: {
    list: {
      useQuery: createQueryHook(() => {
        return [...store.collaborators];
      }),
    },
    create: {
      useMutation: createMutationHook((vars: any) => {
        const nextId = store.collaborators.length > 0 ? Math.max(...store.collaborators.map(c => c.id)) + 1 : 1;
        const newCollab: CollaboratorItem = {
          id: nextId,
          name: vars.name,
          email: vars.email,
          phone: vars.phone,
          position: vars.position || "tecnico",
          active: vars.active ?? true,
          specialty: vars.specialty || (vars.specialties && vars.specialties[0]) || "Geral",
          specialties: vars.specialties || [vars.specialty || "Geral"],
          maxSimultaneousVehicles: vars.maxSimultaneousVehicles || 3,
          currentWorkload: 0,
          completedStages: 0,
          vehiclesHandled: 0,
          createdAt: new Date(),
        };
        store.collaborators.push(newCollab);
        store.notify();
        return newCollab;
      }),
    },
    update: {
      useMutation: createMutationHook((vars: any) => {
        const collab = store.collaborators.find(c => String(c.id) === String(vars.id));
        if (collab) {
          Object.assign(collab, vars);
          store.notify();
        }
        return collab;
      }),
    },
  },

  // Occurrences
  occurrences: {
    list: {
      useQuery: createQueryHook(() => {
        return [...store.occurrences];
      }),
    },
    summary: {
      useQuery: createQueryHook(() => {
        const active = store.occurrences.filter(o => o.status === "open" || o.status === "in_progress");
        const byType: Record<string, number> = {
          part_delay: 0,
          client_contact: 0,
          technical_issue: 0,
          rework: 0,
          approval_pending: 0,
          other: 0,
        };
        active.forEach(o => {
          byType[o.type] = (byType[o.type] || 0) + 1;
        });

        return {
          totalOpen: active.length,
          active: active.length,
          criticalCount: active.filter(o => o.severity === "critical").length,
          critical: active.filter(o => o.severity === "critical").length,
          highCount: active.filter(o => o.severity === "high").length,
          high: active.filter(o => o.severity === "high").length,
          mediumCount: active.filter(o => o.severity === "medium").length,
          medium: active.filter(o => o.severity === "medium").length,
          lowCount: active.filter(o => o.severity === "low").length,
          low: active.filter(o => o.severity === "low").length,
          unassigned: active.filter(o => !o.responsibleId).length,
          byType,
        };
      }),
    },
  },

  // Workshop / Map / Bays
  workshop: {
    resources: {
      list: {
        useQuery: createQueryHook((): WorkshopResourceRow[] => {
          return [
            { id: 1, name: "Elevador 1 - Suspensão", type: "elevator", status: "occupied", isServicePost: true, mapColumn: "left", mapOrder: 1, currentYardVehicleId: 3, assignedCollaboratorName: "Carlos Eduardo Silva" },
            { id: 2, name: "Elevador 2 - Diagnóstico", type: "elevator", status: "occupied", isServicePost: true, mapColumn: "left", mapOrder: 2, currentYardVehicleId: 2, assignedCollaboratorName: "Marcos Oliveira" },
            { id: 3, name: "Elevador 3 - Mecânica", type: "elevator", status: "available", isServicePost: true, mapColumn: "center", mapOrder: 1, currentYardVehicleId: null },
            { id: 4, name: "Box 4 - Controle Qualidade", type: "bench", status: "occupied", isServicePost: true, mapColumn: "right", mapOrder: 1, currentYardVehicleId: 5, assignedCollaboratorName: "Fernando Ramos" },
            { id: 5, name: "Rampa Alinhamento 3D", type: "alignment", status: "available", isServicePost: true, mapColumn: "top", mapOrder: 1, currentYardVehicleId: null },
            { id: 6, name: "Box Lavagem / Detalhamento", type: "wash", status: "available", isServicePost: true, mapColumn: "bottom-left", mapOrder: 1, currentYardVehicleId: null },
          ];
        }),
      },
      allocate: {
        useMutation: createMutationHook((vars: {
          bayId?: string;
          resourceId?: string | number;
          vehicleId?: number | string;
          yardVehicleId?: number | string;
          collaboratorId?: number | string | null;
        }) => {
          const bayId = vars.bayId || String(vars.resourceId);
          const vehicleId = vars.vehicleId || vars.yardVehicleId || 1;
          store.allocateBay(bayId, vehicleId);
          return { success: true };
        }),
      },
      release: {
        useMutation: createMutationHook((vars: { bayId?: string; resourceId?: string | number }) => {
          const bayId = vars.bayId || String(vars.resourceId);
          store.releaseBay(bayId);
          return { success: true };
        }),
      },
    },
    capacity: {
      summary: {
        useQuery: createQueryHook(() => {
          const occupied = store.bays.filter(b => b.status === "occupied").length;
          const total = store.bays.length;
          return {
            totalBays: total,
            occupiedBays: occupied,
            availableBays: total - occupied,
            occupancyRate: Math.round((occupied / total) * 100),
            servicePosts: { total, occupied, available: total - occupied, capacity: total },
            slots: { total, occupied, available: total - occupied, capacity: total },
          };
        }),
      },
    },
  },

  // Clients
  clients: {
    search: {
      useQuery: createQueryHook((params?: { query?: string }) => {
        const q = (params?.query || "").toLowerCase();
        const clients = [
          { id: 1, name: "Alexandre Pires", phone: "(11) 98123-4567", email: "alexandre.pires@gmail.com", documentHint: "CPF ***.456.789-**" },
          { id: 2, name: "Beatriz Nogueira", phone: "(11) 99234-5678", email: "beatriz.n@outlook.com", documentHint: "CPF ***.567.890-**" },
          { id: 3, name: "Claudio Mendonça", phone: "(11) 97345-6789", email: "claudio.m@empresa.com.br", documentHint: "CPF ***.678.901-**" },
          { id: 4, name: "Daniele Camargo", phone: "(11) 96456-7890", email: "dani.camargo@uol.com.br", documentHint: "CPF ***.789.012-**" },
          { id: 5, name: "Eduardo Fonseca", phone: "(11) 95567-8901", email: "eduardo.fonseca@invest.com", documentHint: "CPF ***.890.123-**" },
        ];
        if (!q) return clients;
        return clients.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q)));
      }),
    },
    listVehicles: {
      useQuery: createQueryHook((params?: { clientId?: number | string }) => {
        return [
          { id: 101, plate: "ABC1D23", make: "Toyota", model: "Corolla 2.0 Altis", year: 2022, mileage: 45200, lastServiceMileage: 35000, lastServiceAt: Date.now() - 86400000 * 180 },
          { id: 102, plate: "BRA2E19", make: "Volkswagen", model: "T-Cross 1.4 TSI", year: 2023, mileage: 28900, lastServiceMileage: 20000, lastServiceAt: Date.now() - 86400000 * 120 },
          { id: 103, plate: "DAP4O26", make: "Jeep", model: "Compass 1.3 Turbo Longitude", year: 2023, mileage: 34100, lastServiceMileage: 25000, lastServiceAt: Date.now() - 86400000 * 90 },
        ];
      }),
    },
  },

  // Access & capabilities
  access: {
    capabilities: {
      useQuery: createQueryHook(() => {
        return {
          canManageTeam: true,
          canEditPricing: true,
          canApproveOrders: true,
          canDeleteOrders: true,
          canOperatePatio: true,
          canCancelServiceOrder: true,
          userRole: "ADMIN",
        };
      }),
    },
  },
};
