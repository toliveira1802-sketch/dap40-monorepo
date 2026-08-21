/**
 * Browser-safe in-memory CRM store for portal mock trpc.
 * Mirrors memory branches of apps/api/src/crm/crmStore.ts (no drizzle / node:crypto).
 */
import {
  CRM_PIPELINE_ID,
  CRM_PIPELINE_STAGES,
  assertAnnaHumanApproval,
  isValidPipelineStage,
  type CrmAnnaFeedbackAction,
  type CrmAnnaIntent,
  type CrmConversionIntentType,
  type CrmIdentityChannel,
  type CrmTemperature,
} from "@dap40/types";

function now() {
  return Date.now();
}

function uuid() {
  return globalThis.crypto.randomUUID();
}

/* ── Local row types (do not import from @dap40/database) ── */

type CrmContact = {
  id: string;
  type: "person" | "organization";
  displayName: string;
  primaryIdentityId: string | null;
  ownerUserId: number | null;
  erpClientId: number | null;
  status: string;
  notes: string | null;
  temperature: CrmTemperature;
  createdAt: number;
  updatedAt: number;
};

type CrmIdentity = {
  id: string;
  contactId: string;
  channel: CrmIdentityChannel;
  value: string;
  normalizedValue: string;
  isPrimary: boolean;
  isVerified: boolean;
  externalId: string | null;
  status: string;
  createdAt: number;
  updatedAt: number;
};

type CrmConversation = {
  id: string;
  channelType: string;
  contactId: string;
  assignedUserId: number | null;
  opportunityId: string | null;
  status: string;
  subject: string | null;
  lastMessageAt: number | null;
  unreadCount: number;
  createdAt: number;
  updatedAt: number;
};

type CrmMessage = {
  id: string;
  conversationId: string;
  contactIdentityId: string | null;
  senderUserId: number | null;
  direction: "inbound" | "outbound";
  status: string;
  body: string;
  externalMessageId: string | null;
  idempotencyKey: string | null;
  sentAt: number | null;
  createdAt: number;
  updatedAt: number;
};

type CrmOpportunity = {
  id: string;
  title: string;
  contactId: string;
  conversationId: string | null;
  pipelineId: string;
  pipelineStageId: string;
  assignedUserId: number | null;
  status: string;
  temperature: CrmTemperature;
  estimatedValueCents: number;
  approvedValueCents: number;
  stageEnteredAt: number;
  lostReason: string | null;
  nextAction: string | null;
  createdAt: number;
  updatedAt: number;
};

type CrmAnnaSuggestion = {
  id: string;
  conversationId: string;
  contactId: string;
  intent: string;
  style: string;
  content: string;
  warnings: string[];
  contextSnapshot: Record<string, unknown>;
  version: number;
  correlationId: string;
  status: string;
  createdAt: number;
};

type CrmErpConversionIntent = {
  id: string;
  type: CrmConversionIntentType;
  sourceProduct: string;
  targetProduct: string;
  correlationId: string;
  crmEntityType: string;
  crmEntityId: string;
  payload: Record<string, unknown>;
  status: string;
  erpExternalId: string | null;
  erpResponse: Record<string, unknown> | null;
  submittedAt: number;
  resolvedAt: number | null;
  createdAt: number;
  updatedAt: number;
};

type MemoryState = {
  contacts: CrmContact[];
  identities: CrmIdentity[];
  conversations: CrmConversation[];
  messages: CrmMessage[];
  opportunities: CrmOpportunity[];
  suggestions: CrmAnnaSuggestion[];
  intents: CrmErpConversionIntent[];
  seeded: boolean;
};

const memory: MemoryState = {
  contacts: [],
  identities: [],
  conversations: [],
  messages: [],
  opportunities: [],
  suggestions: [],
  intents: [],
  seeded: false,
};

const listeners = new Set<() => void>();

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notify() {
  listeners.forEach(fn => fn());
}

function ensureMemorySeed() {
  if (memory.seeded) return;
  memory.seeded = true;
  const t = now();
  const contactId = uuid();
  const identityId = uuid();
  const conversationId = uuid();
  const opportunityId = uuid();
  const suggestionId = uuid();
  const correlationId = uuid();

  memory.contacts.push({
    id: contactId,
    type: "person",
    displayName: "Maria Silva",
    primaryIdentityId: identityId,
    ownerUserId: null,
    erpClientId: null,
    status: "active",
    notes: "Lead demo — WhatsApp",
    temperature: "hot",
    createdAt: t,
    updatedAt: t,
  });
  memory.identities.push({
    id: identityId,
    contactId,
    channel: "whatsapp",
    value: "+5511999990001",
    normalizedValue: "+5511999990001",
    isPrimary: true,
    isVerified: true,
    externalId: null,
    status: "active",
    createdAt: t,
    updatedAt: t,
  });
  memory.conversations.push({
    id: conversationId,
    channelType: "whatsapp",
    contactId,
    assignedUserId: null,
    opportunityId,
    status: "open",
    subject: "Orçamento revisão",
    lastMessageAt: t,
    unreadCount: 1,
    createdAt: t,
    updatedAt: t,
  });
  memory.messages.push({
    id: uuid(),
    conversationId,
    contactIdentityId: identityId,
    senderUserId: null,
    direction: "inbound",
    status: "delivered",
    body: "Oi! Queria um orçamento para revisão do meu Civic.",
    externalMessageId: null,
    idempotencyKey: null,
    sentAt: t,
    createdAt: t,
    updatedAt: t,
  });
  memory.opportunities.push({
    id: opportunityId,
    title: "Revisão Civic — Maria Silva",
    contactId,
    conversationId,
    pipelineId: CRM_PIPELINE_ID,
    pipelineStageId: "stage_novo_lead",
    assignedUserId: null,
    status: "open",
    temperature: "hot",
    estimatedValueCents: 85000,
    approvedValueCents: 0,
    stageEnteredAt: t,
    lostReason: null,
    nextAction: "Responder com disponibilidade",
    createdAt: t,
    updatedAt: t,
  });
  memory.suggestions.push({
    id: suggestionId,
    conversationId,
    contactId,
    intent: "quote_request",
    style: "consultative",
    content:
      "Olá Maria! Posso te ajudar com o orçamento da revisão do Civic. Qual a quilometragem aproximada e a unidade preferida?",
    warnings: [],
    contextSnapshot: {},
    version: 1,
    correlationId,
    status: "generated",
    createdAt: t,
  });
}

function normalizeIdentityValue(value: string, channel?: CrmIdentityChannel) {
  const trimmed = value.trim();
  if (channel === "whatsapp" || channel === "phone") {
    const digits = trimmed.replace(/\D/g, "");
    return digits.length >= 8 ? digits : trimmed.toLowerCase();
  }
  return trimmed.toLowerCase();
}

/** Apply optimistic pipeline stage patches (used by trpc utils setData). */
export function patchOpportunityStages(
  patches: Array<{ id: string; pipelineStageId: string }>
) {
  ensureMemorySeed();
  for (const patch of patches) {
    const opp = memory.opportunities.find(o => o.id === patch.id);
    if (opp) opp.pipelineStageId = patch.pipelineStageId;
  }
  notify();
}

export function listCrmContacts() {
  ensureMemorySeed();
  return memory.contacts.map(contact => ({
    ...contact,
    identities: memory.identities.filter(i => i.contactId === contact.id),
    isOperationalClient: contact.erpClientId != null,
  }));
}

export function getCrmContact(id: string) {
  return listCrmContacts().find(c => c.id === id) ?? null;
}

export function listCrmConversations() {
  ensureMemorySeed();
  return memory.conversations
    .map(conversation => {
      const contact = memory.contacts.find(c => c.id === conversation.contactId);
      return {
        ...conversation,
        contactName: contact?.displayName ?? "Contato",
        temperature: (contact?.temperature ?? "warm") as CrmTemperature,
      };
    })
    .sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
}

export function listCrmMessages(conversationId: string) {
  ensureMemorySeed();
  return memory.messages
    .filter(m => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function sendCrmOutboundMessage(input: {
  conversationId: string;
  body: string;
  senderUserId: number;
  idempotencyKey?: string;
}) {
  ensureMemorySeed();
  const t = now();
  const message: CrmMessage = {
    id: uuid(),
    conversationId: input.conversationId,
    contactIdentityId: null,
    senderUserId: input.senderUserId,
    direction: "outbound",
    status: "sent_mock",
    body: input.body,
    externalMessageId: null,
    idempotencyKey: input.idempotencyKey ?? null,
    sentAt: t,
    createdAt: t,
    updatedAt: t,
  };
  memory.messages.push(message);
  const conversation = memory.conversations.find(
    c => c.id === input.conversationId
  );
  if (conversation) {
    conversation.lastMessageAt = t;
    conversation.updatedAt = t;
    conversation.unreadCount = 0;
  }
  notify();
  return message;
}

export function listCrmOpportunities() {
  ensureMemorySeed();
  return memory.opportunities.map(opp => {
    const contact = memory.contacts.find(c => c.id === opp.contactId);
    return {
      ...opp,
      contactName: contact?.displayName ?? "Contato",
    };
  });
}

export function moveCrmOpportunityStage(input: {
  opportunityId: string;
  toStageId: string;
  userId: number;
  note?: string;
  lostReason?: string;
}) {
  if (!isValidPipelineStage(input.toStageId)) {
    throw new Error("Estágio de pipeline inválido");
  }
  const stage = CRM_PIPELINE_STAGES.find(s => s.id === input.toStageId);
  if (stage?.isLost && !input.lostReason?.trim()) {
    throw new Error("Informe o motivo da perda");
  }
  ensureMemorySeed();
  const t = now();
  const opp = memory.opportunities.find(o => o.id === input.opportunityId);
  if (!opp) throw new Error("Oportunidade não encontrada");
  opp.pipelineStageId = input.toStageId;
  opp.stageEnteredAt = t;
  opp.updatedAt = t;
  if (stage?.isWon) opp.status = "won";
  if (stage?.isLost) opp.status = "lost";
  opp.lostReason = stage?.isLost ? input.lostReason!.trim() : null;
  notify();
  return opp;
}

export function createCrmOpportunity(input: {
  title: string;
  contactId: string;
  pipelineStageId: string;
  estimatedValueCents?: number;
  temperature?: CrmTemperature;
  nextAction?: string;
  userId: number;
}) {
  if (!isValidPipelineStage(input.pipelineStageId)) {
    throw new Error("Estágio de pipeline inválido");
  }
  const contact = getCrmContact(input.contactId);
  if (!contact) {
    throw new Error("Contato não encontrado");
  }

  ensureMemorySeed();
  const t = now();
  const estimatedValueCents = Math.max(
    0,
    Math.round(input.estimatedValueCents ?? 0)
  );
  const temperature = input.temperature ?? "warm";
  const stage = CRM_PIPELINE_STAGES.find(s => s.id === input.pipelineStageId);
  const status = stage?.isWon ? "won" : stage?.isLost ? "lost" : "open";
  const id = uuid();
  const opportunity: CrmOpportunity = {
    id,
    title: input.title.trim(),
    contactId: input.contactId,
    conversationId: null,
    pipelineId: CRM_PIPELINE_ID,
    pipelineStageId: input.pipelineStageId,
    assignedUserId: input.userId,
    status,
    temperature,
    estimatedValueCents,
    approvedValueCents: 0,
    stageEnteredAt: t,
    lostReason: null,
    nextAction: input.nextAction?.trim() || null,
    createdAt: t,
    updatedAt: t,
  };
  memory.opportunities.push(opportunity);
  notify();
  return {
    ...opportunity,
    contactName: contact.displayName,
  };
}

export function listCrmLeads() {
  return listCrmContacts().filter(c => !c.isOperationalClient);
}

export function createCrmLead(input: {
  displayName: string;
  temperature?: CrmTemperature;
  notes?: string;
  identityChannel?: CrmIdentityChannel;
  identityValue?: string;
  ownerUserId?: number;
}) {
  const displayName = input.displayName.trim();
  if (displayName.length < 2) {
    throw new Error("Nome do lead é obrigatório");
  }
  const temperature = input.temperature ?? "warm";
  const notes = input.notes?.trim() || null;
  const hasIdentity =
    Boolean(input.identityChannel) && Boolean(input.identityValue?.trim());
  if (Boolean(input.identityChannel) !== Boolean(input.identityValue?.trim())) {
    throw new Error("Informe canal e valor da identidade juntos");
  }
  ensureMemorySeed();
  const t = now();
  const contactId = uuid();
  let identityId: string | null = null;
  if (hasIdentity && input.identityChannel && input.identityValue) {
    const normalized = normalizeIdentityValue(
      input.identityValue,
      input.identityChannel
    );
    const dup = memory.identities.find(
      i =>
        i.channel === input.identityChannel &&
        i.normalizedValue === normalized
    );
    if (dup) throw new Error("Identidade já cadastrada neste canal");
    identityId = uuid();
    memory.identities.push({
      id: identityId,
      contactId,
      channel: input.identityChannel,
      value: input.identityValue.trim(),
      normalizedValue: normalized,
      isPrimary: true,
      isVerified: false,
      externalId: null,
      status: "active",
      createdAt: t,
      updatedAt: t,
    });
  }
  const contact: CrmContact = {
    id: contactId,
    type: "person",
    displayName,
    primaryIdentityId: identityId,
    ownerUserId: input.ownerUserId ?? null,
    erpClientId: null,
    status: "active",
    notes,
    temperature,
    createdAt: t,
    updatedAt: t,
  };
  memory.contacts.push(contact);
  notify();
  return {
    ...contact,
    identities: memory.identities.filter(i => i.contactId === contactId),
    isOperationalClient: false as const,
  };
}

export function updateCrmLead(input: {
  id: string;
  displayName?: string;
  temperature?: CrmTemperature;
  notes?: string | null;
}) {
  const existing = getCrmContact(input.id);
  if (!existing) throw new Error("Lead não encontrado");
  if (existing.isOperationalClient) {
    throw new Error("Contato já é cliente ERP — edite no ERP");
  }

  const displayName =
    input.displayName !== undefined
      ? input.displayName.trim()
      : existing.displayName;
  if (displayName.length < 2) {
    throw new Error("Nome do lead é obrigatório");
  }
  const temperature = input.temperature ?? existing.temperature;
  const notes =
    input.notes === undefined ? existing.notes : input.notes?.trim() || null;
  ensureMemorySeed();
  const t = now();
  const contact = memory.contacts.find(c => c.id === input.id);
  if (!contact) throw new Error("Lead não encontrado");
  contact.displayName = displayName;
  contact.temperature = temperature;
  contact.notes = notes;
  contact.updatedAt = t;
  notify();
  return {
    ...contact,
    identities: memory.identities.filter(i => i.contactId === contact.id),
    isOperationalClient: false as const,
  };
}

export function getCrmDashboardOverview() {
  seedCrmDemoIfEmpty();
  const conversations = listCrmConversations();
  const opportunities = listCrmOpportunities();
  const leads = listCrmLeads();
  const contacts = listCrmContacts();
  const openConversations = conversations.filter(c => c.status === "open");
  const openOpps = opportunities.filter(o => o.status === "open");
  const funnel = CRM_PIPELINE_STAGES.map(stage => ({
    stageId: stage.id,
    name: stage.name,
    count: opportunities.filter(o => o.pipelineStageId === stage.id).length,
  }));
  const estimatedPipelineCents = openOpps.reduce(
    (sum, o) => sum + o.estimatedValueCents,
    0
  );
  return {
    contactsTotal: contacts.length,
    leadsTotal: leads.length,
    openConversations: openConversations.length,
    openOpportunities: openOpps.length,
    estimatedPipelineCents,
    unreadMessages: conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    funnel,
  };
}

export function listAnnaSuggestions(conversationId: string) {
  ensureMemorySeed();
  return memory.suggestions.filter(
    s => s.conversationId === conversationId && s.status === "generated"
  );
}

export function generateAnnaSuggestion(input: {
  conversationId: string;
  contactId: string;
  intent?: CrmAnnaIntent;
}) {
  ensureMemorySeed();
  const t = now();
  const intent = input.intent ?? "general_question";
  const content =
    intent === "quote_request"
      ? "Posso montar um orçamento preliminar. Qual o modelo/ano e a quilometragem?"
      : intent === "appointment_request"
        ? "Temos horários nesta semana. Prefere manhã ou tarde para o check-in?"
        : "Obrigado pela mensagem! Em que posso ajudar com o seu veículo hoje?";
  const suggestion: CrmAnnaSuggestion = {
    id: uuid(),
    conversationId: input.conversationId,
    contactId: input.contactId,
    intent,
    style: "consultative",
    content,
    warnings: ["Envio exige aprovação humana"],
    contextSnapshot: {},
    version: 1,
    correlationId: uuid(),
    status: "generated",
    createdAt: t,
  };
  memory.suggestions.push(suggestion);
  notify();
  return suggestion;
}

export function decideAnnaSuggestion(input: {
  suggestionId: string;
  userId: number;
  action: CrmAnnaFeedbackAction;
  finalContent?: string;
  reasons?: string[];
}) {
  assertAnnaHumanApproval(input.action);
  ensureMemorySeed();
  const suggestion = memory.suggestions.find(s => s.id === input.suggestionId);
  if (!suggestion) throw new Error("Sugestão não encontrada");
  const status =
    input.action === "accepted"
      ? "accepted"
      : input.action === "edited"
        ? "edited"
        : input.action === "rejected"
          ? "rejected"
          : "accepted";
  suggestion.status = status;
  if (
    (input.action === "accepted" || input.action === "edited") &&
    (input.finalContent || suggestion.content)
  ) {
    sendCrmOutboundMessage({
      conversationId: suggestion.conversationId,
      body: input.finalContent ?? suggestion.content,
      senderUserId: input.userId,
    });
    suggestion.status = "sent";
  }
  notify();
  return suggestion;
}

export function createErpConversionIntent(input: {
  type: CrmConversionIntentType;
  crmEntityType: string;
  crmEntityId: string;
  payload?: Record<string, unknown>;
}) {
  ensureMemorySeed();
  const t = now();
  const intent: CrmErpConversionIntent = {
    id: uuid(),
    type: input.type,
    sourceProduct: "crm_commercial",
    targetProduct: "erp_consultor",
    correlationId: uuid(),
    crmEntityType: input.crmEntityType,
    crmEntityId: input.crmEntityId,
    payload: input.payload ?? {},
    status: "pending",
    erpExternalId: null,
    erpResponse: null,
    submittedAt: t,
    resolvedAt: null,
    createdAt: t,
    updatedAt: t,
  };
  memory.intents.push(intent);
  notify();
  return intent;
}

export function listErpConversionIntents() {
  ensureMemorySeed();
  return [...memory.intents];
}

export function resolveErpConversionIntent(input: {
  intentId: string;
  status: "accepted" | "rejected" | "completed" | "failed";
  erpExternalId?: string;
  erpResponse?: Record<string, unknown>;
}) {
  ensureMemorySeed();
  const t = now();
  const intent = memory.intents.find(i => i.id === input.intentId);
  if (!intent) throw new Error("Intent não encontrado");
  intent.status = input.status;
  intent.erpExternalId = input.erpExternalId ?? null;
  intent.erpResponse = input.erpResponse ?? null;
  intent.resolvedAt = t;
  intent.updatedAt = t;
  if (
    intent.type === "lead_to_customer" &&
    input.status === "completed" &&
    input.erpExternalId
  ) {
    const contact = memory.contacts.find(c => c.id === intent.crmEntityId);
    if (contact) {
      contact.erpClientId = Number(input.erpExternalId) || null;
      contact.updatedAt = t;
    }
  }
  notify();
  return intent;
}

export function getPipelineConfig() {
  return {
    pipelineId: CRM_PIPELINE_ID,
    stages: CRM_PIPELINE_STAGES,
  };
}

export function seedCrmDemoIfEmpty(_ownerUserId?: number) {
  ensureMemorySeed();
  return { mode: "memory" as const };
}

// Seed on module load so sync readers always have demo data.
ensureMemorySeed();
