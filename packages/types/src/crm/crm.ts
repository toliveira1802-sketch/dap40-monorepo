/** Shared CRM domain constants for the unified portal (single-company V1). */

export const CRM_PIPELINE_ID = "pipeline_dap_prime_default" as const;

export const CRM_PIPELINE_STAGES = [
  {
    id: "stage_novo_lead",
    name: "Novo lead",
    order: 1,
    isTerminal: false,
    isWon: false,
    isLost: false,
  },
  {
    id: "stage_primeiro_contato",
    name: "Primeiro contato",
    order: 2,
    isTerminal: false,
    isWon: false,
    isLost: false,
  },
  {
    id: "stage_diagnostico_necessidade",
    name: "Diagnóstico de necessidade",
    order: 3,
    isTerminal: false,
    isWon: false,
    isLost: false,
  },
  {
    id: "stage_agendamento_sugerido",
    name: "Agendamento sugerido",
    order: 4,
    isTerminal: false,
    isWon: false,
    isLost: false,
  },
  {
    id: "stage_agendado",
    name: "Agendado",
    order: 5,
    isTerminal: false,
    isWon: false,
    isLost: false,
  },
  {
    id: "stage_veiculo_recebido",
    name: "Veículo recebido",
    order: 6,
    isTerminal: false,
    isWon: false,
    isLost: false,
  },
  {
    id: "stage_orcamento_enviado",
    name: "Orçamento enviado",
    order: 7,
    isTerminal: false,
    isWon: false,
    isLost: false,
  },
  {
    id: "stage_negociacao",
    name: "Negociação",
    order: 8,
    isTerminal: false,
    isWon: false,
    isLost: false,
  },
  {
    id: "stage_aprovado",
    name: "Aprovado",
    order: 9,
    isTerminal: false,
    isWon: false,
    isLost: false,
  },
  {
    id: "stage_em_execucao",
    name: "Em execução",
    order: 10,
    isTerminal: false,
    isWon: false,
    isLost: false,
  },
  {
    id: "stage_finalizado",
    name: "Finalizado",
    order: 11,
    isTerminal: false,
    isWon: false,
    isLost: false,
  },
  {
    id: "stage_entregue",
    name: "Entregue",
    order: 12,
    isTerminal: true,
    isWon: true,
    isLost: false,
  },
  {
    id: "stage_pos_venda",
    name: "Pós-venda",
    order: 13,
    isTerminal: true,
    isWon: true,
    isLost: false,
  },
  {
    id: "stage_perdido",
    name: "Perdido",
    order: 14,
    isTerminal: true,
    isWon: false,
    isLost: true,
  },
] as const;

export type CrmPipelineStageId = (typeof CRM_PIPELINE_STAGES)[number]["id"];

export const CRM_CHANNEL_TYPES = [
  "whatsapp",
  "instagram_direct",
  "facebook_messenger",
  "facebook_comments",
  "instagram_comments",
  "meta_lead_ads",
  "google_business_messages",
  "web_form",
  "phone",
  "manual",
] as const;
export type CrmChannelType = (typeof CRM_CHANNEL_TYPES)[number];

export const CRM_CONVERSATION_STATUSES = [
  "open",
  "pending",
  "resolved",
  "archived",
] as const;
export type CrmConversationStatus = (typeof CRM_CONVERSATION_STATUSES)[number];

export const CRM_MESSAGE_DIRECTIONS = ["inbound", "outbound"] as const;
export type CrmMessageDirection = (typeof CRM_MESSAGE_DIRECTIONS)[number];

export const CRM_MESSAGE_STATUSES = [
  "draft",
  "queued",
  "sent_mock",
  "failed_mock",
  "pending",
  "sent",
  "delivered",
  "read",
  "failed",
] as const;
export type CrmMessageStatus = (typeof CRM_MESSAGE_STATUSES)[number];

export const CRM_OPPORTUNITY_STATUSES = [
  "open",
  "won",
  "lost",
  "archived",
] as const;
export type CrmOpportunityStatus = (typeof CRM_OPPORTUNITY_STATUSES)[number];

export const CRM_TEMPERATURES = ["hot", "warm", "cold"] as const;
export type CrmTemperature = (typeof CRM_TEMPERATURES)[number];

export const CRM_CONTACT_TYPES = ["person", "organization"] as const;
export type CrmContactType = (typeof CRM_CONTACT_TYPES)[number];

export const CRM_IDENTITY_CHANNELS = [
  "phone",
  "whatsapp",
  "email",
  "instagram",
  "facebook",
  "google",
  "external",
] as const;
export type CrmIdentityChannel = (typeof CRM_IDENTITY_CHANNELS)[number];

export const CRM_ANNA_INTENTS = [
  "greeting",
  "price_request",
  "quote_request",
  "appointment_request",
  "diagnostic_request",
  "service_status",
  "vehicle_dropoff",
  "approval_followup",
  "post_sale",
  "complaint",
  "warranty",
  "general_question",
] as const;
export type CrmAnnaIntent = (typeof CRM_ANNA_INTENTS)[number];

export const CRM_ANNA_STYLES = [
  "concise",
  "consultative",
  "technical",
  "friendly",
  "premium",
] as const;
export type CrmAnnaStyle = (typeof CRM_ANNA_STYLES)[number];

export const CRM_ANNA_SUGGESTION_STATUSES = [
  "generated",
  "accepted",
  "edited",
  "rejected",
  "sent",
] as const;
export type CrmAnnaSuggestionStatus =
  (typeof CRM_ANNA_SUGGESTION_STATUSES)[number];

export const CRM_ANNA_FEEDBACK_ACTIONS = [
  "accepted",
  "edited",
  "rejected",
  "manual_reply",
] as const;
export type CrmAnnaFeedbackAction = (typeof CRM_ANNA_FEEDBACK_ACTIONS)[number];

export const CRM_CONVERSION_INTENT_TYPES = [
  "lead_to_customer",
  "opportunity_to_service_request",
  "opportunity_won_handoff",
  "quote_approval_request",
  "appointment_scheduling_request",
] as const;
export type CrmConversionIntentType =
  (typeof CRM_CONVERSION_INTENT_TYPES)[number];

export const CRM_CONVERSION_INTENT_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "completed",
  "failed",
] as const;
export type CrmConversionIntentStatus =
  (typeof CRM_CONVERSION_INTENT_STATUSES)[number];

/** Anna never auto-sends — human decision required. */
export function assertAnnaHumanApproval(
  action: CrmAnnaFeedbackAction
): asserts action is CrmAnnaFeedbackAction {
  if (!CRM_ANNA_FEEDBACK_ACTIONS.includes(action)) {
    throw new Error("Decisão Anna inválida");
  }
}

export function getPipelineStage(stageId: string) {
  return CRM_PIPELINE_STAGES.find(stage => stage.id === stageId);
}

export function isValidPipelineStage(stageId: string): stageId is CrmPipelineStageId {
  return CRM_PIPELINE_STAGES.some(stage => stage.id === stageId);
}
