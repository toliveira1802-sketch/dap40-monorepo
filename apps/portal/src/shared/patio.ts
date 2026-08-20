export const PATIO_STAGES = [
  "triagem",
  "diagnostico",
  "orcamento",
  "aprovacao",
  "aguardando_peca",
  "execucao",
  "qualidade",
  "lavagem",
  "pronto",
] as const;

export type PatioStage = (typeof PATIO_STAGES)[number];

export const PATIO_STAGE_META: Record<
  PatioStage,
  {
    label: string;
    shortLabel: string;
    description: string;
    color: string;
    slaHours: number;
  }
> = {
  triagem: {
    label: "Triagem / Check-in",
    shortLabel: "Triagem",
    description: "Recepção e inspeção inicial",
    color: "amber",
    slaHours: 2,
  },
  diagnostico: {
    label: "Diagnóstico",
    shortLabel: "Diagnóstico",
    description: "Análise técnica detalhada",
    color: "blue",
    slaHours: 4,
  },
  orcamento: {
    label: "Orçamento",
    shortLabel: "Orçamento",
    description: "Precificação de peças e serviços",
    color: "purple",
    slaHours: 4,
  },
  aprovacao: {
    label: "Aprovação do Cliente",
    shortLabel: "Aprovação",
    description: "Aguardando aceite do orçamento",
    color: "indigo",
    slaHours: 8,
  },
  aguardando_peca: {
    label: "Aguardando Peça",
    shortLabel: "Peças",
    description: "Peças encomendadas ou em trânsito",
    color: "orange",
    slaHours: 24,
  },
  execucao: {
    label: "Execução Mecânica",
    shortLabel: "Execução",
    description: "Serviço em andamento na baía",
    color: "sky",
    slaHours: 8,
  },
  qualidade: {
    label: "Controle de Qualidade",
    shortLabel: "Qualidade",
    description: "Inspeção pós-serviço e teste de rodagem",
    color: "teal",
    slaHours: 2,
  },
  lavagem: {
    label: "Lavagem e Detalhamento",
    shortLabel: "Lavagem",
    description: "Preparação final estética",
    color: "cyan",
    slaHours: 2,
  },
  pronto: {
    label: "Pronto para Entrega",
    shortLabel: "Pronto",
    description: "Aguardando retirada pelo cliente",
    color: "emerald",
    slaHours: 12,
  },
};

export function canTransitionStage(from: PatioStage, to: PatioStage): boolean {
  if (from === to) return false;
  return true;
}

export function canRejectApprovalFromStage(stage: PatioStage): boolean {
  return stage === "aprovacao" || stage === "orcamento";
}

export const APPOINTMENT_STATUSES = [
  "scheduled",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
  "no_show",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_STATUS_META: Record<
  AppointmentStatus,
  { label: string; tone: "default" | "success" | "warning" | "destructive" | "info" }
> = {
  scheduled: { label: "Agendado", tone: "default" },
  confirmed: { label: "Confirmado", tone: "info" },
  checked_in: { label: "Check-in Realizado", tone: "success" },
  completed: { label: "Concluído", tone: "success" },
  cancelled: { label: "Cancelado", tone: "destructive" },
  no_show: { label: "Não Compareceu", tone: "warning" },
};

export type AppointmentAction = "confirm" | "checkin" | "check_in" | "cancel" | "no_show" | "reschedule";

export const APPOINTMENT_ACTION_META: Record<
  AppointmentAction,
  { label: string; description: string; triggerLabel?: string; triggerId?: string }
> = {
  confirm: { label: "Confirmar Agendamento", description: "Notifica o cliente e reserva a vaga", triggerLabel: "Confirmar", triggerId: "confirm" },
  checkin: { label: "Iniciar Check-in", description: "Cria entrada no pátio e direciona para triagem", triggerLabel: "Check-in", triggerId: "checkin" },
  check_in: { label: "Iniciar Check-in", description: "Cria entrada no pátio e direciona para triagem", triggerLabel: "Check-in", triggerId: "check_in" },
  cancel: { label: "Cancelar", description: "Cancela o agendamento no sistema", triggerLabel: "Cancelar", triggerId: "cancel" },
  no_show: { label: "Não Compareceu", description: "Registra ausência do cliente", triggerLabel: "Não compareceu", triggerId: "no_show" },
  reschedule: { label: "Reagendar", description: "Altera data e horário do serviço", triggerLabel: "Reagendar", triggerId: "reschedule" },
};

export const OCCURRENCE_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type OccurrenceSeverity = (typeof OCCURRENCE_SEVERITIES)[number];

export const OCCURRENCE_SEVERITY_META: Record<
  OccurrenceSeverity,
  { label: string; color: string }
> = {
  low: { label: "Baixa", color: "emerald" },
  medium: { label: "Média", color: "amber" },
  high: { label: "Alta", color: "orange" },
  critical: { label: "Crítica / Urgente", color: "rose" },
};

export const OCCURRENCE_STATUSES = ["open", "in_progress", "resolved", "dismissed"] as const;
export type OccurrenceStatus = (typeof OCCURRENCE_STATUSES)[number];

export const OCCURRENCE_STATUS_META: Record<
  OccurrenceStatus,
  { label: string }
> = {
  open: { label: "Aberta" },
  in_progress: { label: "Em Tratamento" },
  resolved: { label: "Resolvida" },
  dismissed: { label: "Descartada" },
};

export const OCCURRENCE_TYPES = [
  "part_delay",
  "client_contact",
  "technical_issue",
  "rework",
  "approval_pending",
  "other",
] as const;

export type OccurrenceType = (typeof OCCURRENCE_TYPES)[number];

export const OCCURRENCE_TYPE_META: Record<
  OccurrenceType,
  { label: string }
> = {
  part_delay: { label: "Atraso de Peça" },
  client_contact: { label: "Contato com Cliente" },
  technical_issue: { label: "Imprevisto Técnico" },
  rework: { label: "Retrabalho / Garantia" },
  approval_pending: { label: "Pendente Aprovação" },
  other: { label: "Outro" },
};

export const COLLABORATOR_POSITIONS = [
  "consultor",
  "tecnico",
  "mecanico_chefe",
  "eletricista",
  "funileiro",
  "pintor",
  "qualidade",
  "lavador",
  "mechanic",
] as const;

export type CollaboratorPosition = (typeof COLLABORATOR_POSITIONS)[number];

export const SERVICE_ORDER_STATUSES = [
  "draft",
  "open",
  "in_progress",
  "waiting_parts",
  "waiting_approval",
  "completed",
  "delivered",
  "cancelled",
] as const;

export type ServiceOrderStatus = (typeof SERVICE_ORDER_STATUSES)[number];

export const SERVICE_ORDER_STATUS_META: Record<
  ServiceOrderStatus,
  { label: string; color: string }
> = {
  draft: { label: "Rascunho", color: "slate" },
  open: { label: "Aberta", color: "blue" },
  in_progress: { label: "Em Execução", color: "sky" },
  waiting_parts: { label: "Aguardando Peças", color: "amber" },
  waiting_approval: { label: "Aguardando Aprovação", color: "purple" },
  completed: { label: "Concluída", color: "teal" },
  delivered: { label: "Entregue", color: "emerald" },
  cancelled: { label: "Cancelada", color: "rose" },
};
