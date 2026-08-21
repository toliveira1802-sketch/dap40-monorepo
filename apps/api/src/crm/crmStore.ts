import { and, desc, eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import {
  crmAnnaFeedback,
  crmAnnaSuggestions,
  crmContactIdentities,
  crmContacts,
  crmConversations,
  crmErpConversionIntents,
  crmMessages,
  crmOpportunities,
  crmOpportunityStageHistory,
  type CrmContact,
  type CrmConversation,
  type CrmMessage,
  type CrmOpportunity,
  type CrmAnnaSuggestion,
  type CrmErpConversionIntent,
} from "@dap40/database";
import {
  CRM_PIPELINE_ID,
  CRM_PIPELINE_STAGES,
  assertAnnaHumanApproval,
  isValidPipelineStage,
  type CrmAnnaFeedbackAction,
  type CrmAnnaIntent,
  type CrmChannelType,
  type CrmConversionIntentType,
  type CrmIdentityChannel,
  type CrmTemperature,
} from "@dap40/types";
import { getDb } from "./db";

function now() {
  return Date.now();
}

/** In-memory demo store used when DB is empty or unavailable (dev UX). */
type MemoryState = {
  contacts: CrmContact[];
  identities: Array<typeof crmContactIdentities.$inferSelect>;
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

function ensureMemorySeed() {
  if (memory.seeded) return;
  memory.seeded = true;
  const t = now();
  const contactId = randomUUID();
  const identityId = randomUUID();
  const conversationId = randomUUID();
  const opportunityId = randomUUID();
  const suggestionId = randomUUID();
  const correlationId = randomUUID();

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
    id: randomUUID(),
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
    pipelineId: "pipeline_dap_prime_default",
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

async function useDatabase(): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    const rows = await db
      .select({ id: crmContacts.id })
      .from(crmContacts)
      .limit(1);
    // Empty dap_crm → in-memory demo store (dev UX); schema missing also falls through catch.
    return rows.length > 0;
  } catch {
    return false;
  }
}

export async function listCrmContacts() {
  const dbOk = await useDatabase();
  if (!dbOk) {
    ensureMemorySeed();
    return memory.contacts.map(contact => ({
      ...contact,
      identities: memory.identities.filter(i => i.contactId === contact.id),
      isOperationalClient: contact.erpClientId != null,
    }));
  }
  const db = await getDb();
  if (!db) {
    ensureMemorySeed();
    return memory.contacts.map(contact => ({
      ...contact,
      identities: memory.identities.filter(i => i.contactId === contact.id),
      isOperationalClient: contact.erpClientId != null,
    }));
  }
  const contacts = await db
    .select()
    .from(crmContacts)
    .orderBy(desc(crmContacts.updatedAt));
  const identities = await db.select().from(crmContactIdentities);
  return contacts.map(contact => ({
    ...contact,
    identities: identities.filter(i => i.contactId === contact.id),
    isOperationalClient: contact.erpClientId != null,
  }));
}

export async function getCrmContact(id: string) {
  const all = await listCrmContacts();
  return all.find(c => c.id === id) ?? null;
}

export async function listCrmConversations() {
  const dbOk = await useDatabase();
  if (!dbOk) {
    ensureMemorySeed();
    return memory.conversations
      .map(conversation => {
        const contact = memory.contacts.find(
          c => c.id === conversation.contactId
        );
        return {
          ...conversation,
          contactName: contact?.displayName ?? "Contato",
          temperature: contact?.temperature ?? "warm",
        };
      })
      .sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
  }
  const db = await getDb();
  if (!db) {
    ensureMemorySeed();
    return memory.conversations
      .map(conversation => {
        const contact = memory.contacts.find(
          c => c.id === conversation.contactId
        );
        return {
          ...conversation,
          contactName: contact?.displayName ?? "Contato",
          temperature: contact?.temperature ?? ("warm" as const),
        };
      })
      .sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
  }
  const rows = await db
    .select({
      conversation: crmConversations,
      contactName: crmContacts.displayName,
      temperature: crmContacts.temperature,
    })
    .from(crmConversations)
    .innerJoin(crmContacts, eq(crmConversations.contactId, crmContacts.id))
    .orderBy(desc(crmConversations.lastMessageAt));
  return rows.map(row => ({
    ...row.conversation,
    contactName: row.contactName,
    temperature: row.temperature,
  }));
}

export async function listCrmMessages(conversationId: string) {
  const dbOk = await useDatabase();
  if (!dbOk) {
    ensureMemorySeed();
    return memory.messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(crmMessages)
    .where(eq(crmMessages.conversationId, conversationId))
    .orderBy(crmMessages.createdAt);
}

export async function sendCrmOutboundMessage(input: {
  conversationId: string;
  body: string;
  senderUserId: number;
  idempotencyKey?: string;
}) {
  const t = now();
  const dbOk = await useDatabase();
  if (!dbOk) {
    ensureMemorySeed();
    const message: CrmMessage = {
      id: randomUUID(),
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
    return message;
  }
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");
  const [message] = await db
    .insert(crmMessages)
    .values({
      conversationId: input.conversationId,
      senderUserId: input.senderUserId,
      direction: "outbound",
      status: "sent_mock",
      body: input.body,
      idempotencyKey: input.idempotencyKey,
      sentAt: t,
      createdAt: t,
      updatedAt: t,
    })
    .returning();
  await db
    .update(crmConversations)
    .set({ lastMessageAt: t, updatedAt: t, unreadCount: 0 })
    .where(eq(crmConversations.id, input.conversationId));
  return message;
}

export async function ingestInboundMessage(input: {
  channelType: CrmChannelType;
  externalContactId: string;
  displayName: string;
  body: string;
  externalMessageId?: string;
}) {
  const t = now();
  const dbOk = await useDatabase();
  if (!dbOk) {
    ensureMemorySeed();
    let identity = memory.identities.find(
      i =>
        i.channel === "whatsapp" &&
        i.normalizedValue ===
          normalizeIdentityValue(input.externalContactId, "whatsapp")
    );
    let contactId = identity?.contactId;
    if (!contactId) {
      contactId = randomUUID();
      const identityId = randomUUID();
      memory.contacts.push({
        id: contactId,
        type: "person",
        displayName: input.displayName,
        primaryIdentityId: identityId,
        ownerUserId: null,
        erpClientId: null,
        status: "active",
        notes: null,
        temperature: "warm",
        createdAt: t,
        updatedAt: t,
      });
      identity = {
        id: identityId,
        contactId,
        channel: "whatsapp",
        value: input.externalContactId,
        normalizedValue: normalizeIdentityValue(
          input.externalContactId,
          "whatsapp"
        ),
        isPrimary: true,
        isVerified: false,
        externalId: input.externalContactId,
        status: "active",
        createdAt: t,
        updatedAt: t,
      };
      memory.identities.push(identity);
    }
    let conversation = memory.conversations.find(
      c => c.contactId === contactId && c.status === "open"
    );
    if (!conversation) {
      conversation = {
        id: randomUUID(),
        channelType: input.channelType,
        contactId,
        assignedUserId: null,
        opportunityId: null,
        status: "open",
        subject: null,
        lastMessageAt: t,
        unreadCount: 1,
        createdAt: t,
        updatedAt: t,
      };
      memory.conversations.push(conversation);
    } else {
      conversation.lastMessageAt = t;
      conversation.unreadCount += 1;
      conversation.updatedAt = t;
    }
    const message: CrmMessage = {
      id: randomUUID(),
      conversationId: conversation.id,
      contactIdentityId: identity!.id,
      senderUserId: null,
      direction: "inbound",
      status: "delivered",
      body: input.body,
      externalMessageId: input.externalMessageId ?? null,
      idempotencyKey: null,
      sentAt: t,
      createdAt: t,
      updatedAt: t,
    };
    memory.messages.push(message);
    return { conversation, message, contactId };
  }
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");
  const normalized = normalizeIdentityValue(
    input.externalContactId,
    "whatsapp"
  );
  const existingIdentity = await db
    .select()
    .from(crmContactIdentities)
    .where(
      and(
        eq(crmContactIdentities.channel, "whatsapp"),
        eq(crmContactIdentities.normalizedValue, normalized)
      )
    )
    .limit(1);
  let contactId = existingIdentity[0]?.contactId;
  let identityId = existingIdentity[0]?.id;
  if (!contactId) {
    const [contact] = await db
      .insert(crmContacts)
      .values({
        displayName: input.displayName,
        type: "person",
        temperature: "warm",
        createdAt: t,
        updatedAt: t,
      })
      .returning();
    contactId = contact.id;
    const [identity] = await db
      .insert(crmContactIdentities)
      .values({
        contactId,
        channel: "whatsapp",
        value: input.externalContactId,
        normalizedValue: normalized,
        isPrimary: true,
        externalId: input.externalContactId,
        createdAt: t,
        updatedAt: t,
      })
      .returning();
    identityId = identity.id;
    await db
      .update(crmContacts)
      .set({ primaryIdentityId: identityId, updatedAt: t })
      .where(eq(crmContacts.id, contactId));
  }
  const openConversations = await db
    .select()
    .from(crmConversations)
    .where(
      and(
        eq(crmConversations.contactId, contactId),
        eq(crmConversations.status, "open")
      )
    )
    .limit(1);
  let conversation = openConversations[0];
  if (!conversation) {
    const [created] = await db
      .insert(crmConversations)
      .values({
        channelType: input.channelType,
        contactId,
        status: "open",
        lastMessageAt: t,
        unreadCount: 1,
        createdAt: t,
        updatedAt: t,
      })
      .returning();
    conversation = created;
  } else {
    await db
      .update(crmConversations)
      .set({
        lastMessageAt: t,
        unreadCount: sql`${crmConversations.unreadCount} + 1`,
        updatedAt: t,
      })
      .where(eq(crmConversations.id, conversation.id));
  }
  const [message] = await db
    .insert(crmMessages)
    .values({
      conversationId: conversation.id,
      contactIdentityId: identityId,
      direction: "inbound",
      status: "delivered",
      body: input.body,
      externalMessageId: input.externalMessageId,
      sentAt: t,
      createdAt: t,
      updatedAt: t,
    })
    .returning();
  return { conversation, message, contactId };
}

export async function listCrmOpportunities() {
  const dbOk = await useDatabase();
  if (!dbOk) {
    ensureMemorySeed();
    return memory.opportunities.map(opp => {
      const contact = memory.contacts.find(c => c.id === opp.contactId);
      return {
        ...opp,
        contactName: contact?.displayName ?? "Contato",
      };
    });
  }
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      opportunity: crmOpportunities,
      contactName: crmContacts.displayName,
    })
    .from(crmOpportunities)
    .innerJoin(crmContacts, eq(crmOpportunities.contactId, crmContacts.id))
    .orderBy(desc(crmOpportunities.updatedAt));
  return rows.map(row => ({
    ...row.opportunity,
    contactName: row.contactName,
  }));
}

export async function moveCrmOpportunityStage(input: {
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
  const t = now();
  const dbOk = await useDatabase();
  if (!dbOk) {
    ensureMemorySeed();
    const opp = memory.opportunities.find(o => o.id === input.opportunityId);
    if (!opp) throw new Error("Oportunidade não encontrada");
    const from = opp.pipelineStageId;
    opp.pipelineStageId = input.toStageId;
    opp.stageEnteredAt = t;
    opp.updatedAt = t;
    if (stage?.isWon) opp.status = "won";
    if (stage?.isLost) opp.status = "lost";
    opp.lostReason = stage?.isLost ? input.lostReason!.trim() : null;
    return opp;
  }
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");
  const [current] = await db
    .select()
    .from(crmOpportunities)
    .where(eq(crmOpportunities.id, input.opportunityId))
    .limit(1);
  if (!current) throw new Error("Oportunidade não encontrada");
  const status = stage?.isWon ? "won" : stage?.isLost ? "lost" : "open";
  const [updated] = await db
    .update(crmOpportunities)
    .set({
      pipelineStageId: input.toStageId,
      stageEnteredAt: t,
      updatedAt: t,
      status,
      lostReason: stage?.isLost ? input.lostReason!.trim() : null,
    })
    .where(eq(crmOpportunities.id, input.opportunityId))
    .returning();
  await db.insert(crmOpportunityStageHistory).values({
    opportunityId: input.opportunityId,
    fromStageId: current.pipelineStageId,
    toStageId: input.toStageId,
    changedByUserId: input.userId,
    note: input.note,
    createdAt: t,
  });
  return updated;
}

export async function createCrmOpportunity(input: {
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
  const contact = await getCrmContact(input.contactId);
  if (!contact) {
    throw new Error("Contato não encontrado");
  }

  const t = now();
  const estimatedValueCents = Math.max(
    0,
    Math.round(input.estimatedValueCents ?? 0)
  );
  const temperature = input.temperature ?? "warm";
  const stage = CRM_PIPELINE_STAGES.find(s => s.id === input.pipelineStageId);
  const status = stage?.isWon ? "won" : stage?.isLost ? "lost" : "open";

  const dbOk = await useDatabase();
  if (!dbOk) {
    ensureMemorySeed();
    const id = randomUUID();
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
    return {
      ...opportunity,
      contactName: contact.displayName,
    };
  }

  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");

  const [created] = await db
    .insert(crmOpportunities)
    .values({
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
    })
    .returning();

  await db.insert(crmOpportunityStageHistory).values({
    opportunityId: created.id,
    fromStageId: null,
    toStageId: input.pipelineStageId,
    changedByUserId: input.userId,
    note: "Criação",
    createdAt: t,
  });

  return {
    ...created,
    contactName: contact.displayName,
  };
}

export async function listCrmLeads() {
  const contacts = await listCrmContacts();
  return contacts.filter(c => !c.isOperationalClient);
}

function normalizeIdentityValue(value: string, channel?: CrmIdentityChannel) {
  const trimmed = value.trim();
  if (channel === "whatsapp" || channel === "phone") {
    const digits = trimmed.replace(/\D/g, "");
    return digits.length >= 8 ? digits : trimmed.toLowerCase();
  }
  return trimmed.toLowerCase();
}

export async function createCrmLead(input: {
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
  const t = now();

  const dbOk = await useDatabase();
  if (!dbOk) {
    ensureMemorySeed();
    const contactId = randomUUID();
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
      identityId = randomUUID();
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
    return {
      ...contact,
      identities: memory.identities.filter(i => i.contactId === contactId),
      isOperationalClient: false,
    };
  }

  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");

  const identityChannel = input.identityChannel;
  const identityValue = input.identityValue?.trim();
  const normalized =
    hasIdentity && identityChannel && identityValue
      ? normalizeIdentityValue(identityValue, identityChannel)
      : null;

  if (hasIdentity && identityChannel && normalized) {
    const [existing] = await db
      .select()
      .from(crmContactIdentities)
      .where(
        and(
          eq(crmContactIdentities.channel, identityChannel),
          eq(crmContactIdentities.normalizedValue, normalized)
        )
      )
      .limit(1);
    if (existing) throw new Error("Identidade já cadastrada neste canal");
  }

  return db.transaction(async tx => {
    const [contact] = await tx
      .insert(crmContacts)
      .values({
        displayName,
        type: "person",
        temperature,
        notes,
        ownerUserId: input.ownerUserId ?? null,
        createdAt: t,
        updatedAt: t,
      })
      .returning();

    let identities: Array<typeof crmContactIdentities.$inferSelect> = [];
    if (hasIdentity && identityChannel && identityValue && normalized) {
      const [identity] = await tx
        .insert(crmContactIdentities)
        .values({
          contactId: contact.id,
          channel: identityChannel,
          value: identityValue,
          normalizedValue: normalized,
          isPrimary: true,
          isVerified: false,
          createdAt: t,
          updatedAt: t,
        })
        .returning();
      await tx
        .update(crmContacts)
        .set({ primaryIdentityId: identity.id, updatedAt: t })
        .where(eq(crmContacts.id, contact.id));
      identities = [identity];
      return {
        ...contact,
        primaryIdentityId: identity.id,
        identities,
        isOperationalClient: false as const,
      };
    }

    return {
      ...contact,
      identities,
      isOperationalClient: false as const,
    };
  });
}

export async function updateCrmLead(input: {
  id: string;
  displayName?: string;
  temperature?: CrmTemperature;
  notes?: string | null;
}) {
  const existing = await getCrmContact(input.id);
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
  const t = now();

  const dbOk = await useDatabase();
  if (!dbOk) {
    ensureMemorySeed();
    const contact = memory.contacts.find(c => c.id === input.id);
    if (!contact) throw new Error("Lead não encontrado");
    contact.displayName = displayName;
    contact.temperature = temperature;
    contact.notes = notes;
    contact.updatedAt = t;
    return {
      ...contact,
      identities: memory.identities.filter(i => i.contactId === contact.id),
      isOperationalClient: false,
    };
  }

  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");
  const [updated] = await db
    .update(crmContacts)
    .set({
      displayName,
      temperature,
      notes,
      updatedAt: t,
    })
    .where(eq(crmContacts.id, input.id))
    .returning();
  if (!updated) throw new Error("Lead não encontrado");
  const identities = await db
    .select()
    .from(crmContactIdentities)
    .where(eq(crmContactIdentities.contactId, input.id));
  return {
    ...updated,
    identities,
    isOperationalClient: false,
  };
}

export async function getCrmDashboardOverview() {
  await seedCrmDemoIfEmpty();
  const [conversations, opportunities, leads, contacts] = await Promise.all([
    listCrmConversations(),
    listCrmOpportunities(),
    listCrmLeads(),
    listCrmContacts(),
  ]);
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

export async function listAnnaSuggestions(conversationId: string) {
  const dbOk = await useDatabase();
  if (!dbOk) {
    ensureMemorySeed();
    return memory.suggestions.filter(
      s => s.conversationId === conversationId && s.status === "generated"
    );
  }
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(crmAnnaSuggestions)
    .where(
      and(
        eq(crmAnnaSuggestions.conversationId, conversationId),
        eq(crmAnnaSuggestions.status, "generated")
      )
    )
    .orderBy(desc(crmAnnaSuggestions.createdAt));
}

export async function generateAnnaSuggestion(input: {
  conversationId: string;
  contactId: string;
  intent?: CrmAnnaIntent;
}) {
  const t = now();
  const intent = input.intent ?? "general_question";
  const content =
    intent === "quote_request"
      ? "Posso montar um orçamento preliminar. Qual o modelo/ano e a quilometragem?"
      : intent === "appointment_request"
        ? "Temos horários nesta semana. Prefere manhã ou tarde para o check-in?"
        : "Obrigado pela mensagem! Em que posso ajudar com o seu veículo hoje?";
  const suggestion: CrmAnnaSuggestion = {
    id: randomUUID(),
    conversationId: input.conversationId,
    contactId: input.contactId,
    intent,
    style: "consultative",
    content,
    warnings: ["Envio exige aprovação humana"],
    contextSnapshot: {},
    version: 1,
    correlationId: randomUUID(),
    status: "generated",
    createdAt: t,
  };
  const dbOk = await useDatabase();
  if (!dbOk) {
    ensureMemorySeed();
    memory.suggestions.push(suggestion);
    return suggestion;
  }
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");
  const [row] = await db
    .insert(crmAnnaSuggestions)
    .values({
      conversationId: input.conversationId,
      contactId: input.contactId,
      intent: suggestion.intent,
      style: suggestion.style,
      content: suggestion.content,
      warnings: suggestion.warnings,
      contextSnapshot: suggestion.contextSnapshot,
      correlationId: suggestion.correlationId,
      createdAt: t,
    })
    .returning();
  return row;
}

export async function decideAnnaSuggestion(input: {
  suggestionId: string;
  userId: number;
  action: CrmAnnaFeedbackAction;
  finalContent?: string;
  reasons?: string[];
}) {
  assertAnnaHumanApproval(input.action);
  const t = now();
  const dbOk = await useDatabase();
  if (!dbOk) {
    ensureMemorySeed();
    const suggestion = memory.suggestions.find(
      s => s.id === input.suggestionId
    );
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
      await sendCrmOutboundMessage({
        conversationId: suggestion.conversationId,
        body: input.finalContent ?? suggestion.content,
        senderUserId: input.userId,
      });
      suggestion.status = "sent";
    }
    return suggestion;
  }
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");
  const [suggestion] = await db
    .select()
    .from(crmAnnaSuggestions)
    .where(eq(crmAnnaSuggestions.id, input.suggestionId))
    .limit(1);
  if (!suggestion) throw new Error("Sugestão não encontrada");
  const status =
    input.action === "accepted"
      ? "accepted"
      : input.action === "edited"
        ? "edited"
        : input.action === "rejected"
          ? "rejected"
          : "accepted";
  await db.insert(crmAnnaFeedback).values({
    suggestionId: suggestion.id,
    conversationId: suggestion.conversationId,
    userId: input.userId,
    action: input.action,
    reasons: input.reasons ?? [],
    originalContent: suggestion.content,
    finalContent: input.finalContent ?? suggestion.content,
    correlationId: suggestion.correlationId,
    createdAt: t,
  });
  let nextStatus: "generated" | "accepted" | "edited" | "rejected" | "sent" =
    status;
  if (input.action === "accepted" || input.action === "edited") {
    await sendCrmOutboundMessage({
      conversationId: suggestion.conversationId,
      body: input.finalContent ?? suggestion.content,
      senderUserId: input.userId,
    });
    nextStatus = "sent";
  }
  const [updated] = await db
    .update(crmAnnaSuggestions)
    .set({ status: nextStatus })
    .where(eq(crmAnnaSuggestions.id, suggestion.id))
    .returning();
  return updated;
}

export async function createErpConversionIntent(input: {
  type: CrmConversionIntentType;
  crmEntityType: string;
  crmEntityId: string;
  payload?: Record<string, unknown>;
}) {
  const t = now();
  const intent: CrmErpConversionIntent = {
    id: randomUUID(),
    type: input.type,
    sourceProduct: "crm_commercial",
    targetProduct: "erp_consultor",
    correlationId: randomUUID(),
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
  const dbOk = await useDatabase();
  if (!dbOk) {
    ensureMemorySeed();
    memory.intents.push(intent);
    return intent;
  }
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");
  const [row] = await db
    .insert(crmErpConversionIntents)
    .values({
      type: intent.type,
      crmEntityType: intent.crmEntityType,
      crmEntityId: intent.crmEntityId,
      payload: intent.payload,
      submittedAt: t,
      createdAt: t,
      updatedAt: t,
    })
    .returning();
  return row;
}

export async function listErpConversionIntents() {
  const dbOk = await useDatabase();
  if (!dbOk) {
    ensureMemorySeed();
    return memory.intents;
  }
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(crmErpConversionIntents)
    .orderBy(desc(crmErpConversionIntents.submittedAt));
}

export async function resolveErpConversionIntent(input: {
  intentId: string;
  status: "accepted" | "rejected" | "completed" | "failed";
  erpExternalId?: string;
  erpResponse?: Record<string, unknown>;
}) {
  const t = now();
  const dbOk = await useDatabase();
  if (!dbOk) {
    ensureMemorySeed();
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
    return intent;
  }
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");
  const [updated] = await db
    .update(crmErpConversionIntents)
    .set({
      status: input.status,
      erpExternalId: input.erpExternalId,
      erpResponse: input.erpResponse,
      resolvedAt: t,
      updatedAt: t,
    })
    .where(eq(crmErpConversionIntents.id, input.intentId))
    .returning();
  if (
    updated?.type === "lead_to_customer" &&
    input.status === "completed" &&
    input.erpExternalId
  ) {
    await db
      .update(crmContacts)
      .set({
        erpClientId: Number(input.erpExternalId) || null,
        updatedAt: t,
      })
      .where(eq(crmContacts.id, updated.crmEntityId));
  }
  return updated;
}

export function getPipelineConfig() {
  return {
    pipelineId: "pipeline_dap_prime_default",
    stages: CRM_PIPELINE_STAGES,
  };
}

export async function seedCrmDemoIfEmpty(ownerUserId?: number) {
  const db = await getDb();
  if (!db) {
    ensureMemorySeed();
    return { mode: "memory" as const };
  }
  const existing = await db
    .select({ id: crmContacts.id })
    .from(crmContacts)
    .limit(1);
  if (existing.length > 0) return { mode: "skipped" as const };
  const t = now();
  const [contact] = await db
    .insert(crmContacts)
    .values({
      displayName: "Maria Silva",
      type: "person",
      temperature: "hot",
      notes: "Lead demo — WhatsApp",
      ownerUserId: ownerUserId ?? null,
      createdAt: t,
      updatedAt: t,
    })
    .returning();
  const [identity] = await db
    .insert(crmContactIdentities)
    .values({
      contactId: contact.id,
      channel: "whatsapp",
      value: "+5511999990001",
      normalizedValue: "+5511999990001",
      isPrimary: true,
      isVerified: true,
      createdAt: t,
      updatedAt: t,
    })
    .returning();
  await db
    .update(crmContacts)
    .set({ primaryIdentityId: identity.id })
    .where(eq(crmContacts.id, contact.id));
  const [conversation] = await db
    .insert(crmConversations)
    .values({
      channelType: "whatsapp",
      contactId: contact.id,
      status: "open",
      subject: "Orçamento revisão",
      lastMessageAt: t,
      unreadCount: 1,
      createdAt: t,
      updatedAt: t,
    })
    .returning();
  await db.insert(crmMessages).values({
    conversationId: conversation.id,
    contactIdentityId: identity.id,
    direction: "inbound",
    status: "delivered",
    body: "Oi! Queria um orçamento para revisão do meu Civic.",
    sentAt: t,
    createdAt: t,
    updatedAt: t,
  });
  const [opportunity] = await db
    .insert(crmOpportunities)
    .values({
      title: "Revisão Civic — Maria Silva",
      contactId: contact.id,
      conversationId: conversation.id,
      pipelineStageId: "stage_novo_lead",
      temperature: "hot",
      estimatedValueCents: 85000,
      stageEnteredAt: t,
      nextAction: "Responder com disponibilidade",
      createdAt: t,
      updatedAt: t,
    })
    .returning();
  await db
    .update(crmConversations)
    .set({ opportunityId: opportunity.id })
    .where(eq(crmConversations.id, conversation.id));
  await db.insert(crmAnnaSuggestions).values({
    conversationId: conversation.id,
    contactId: contact.id,
    intent: "quote_request",
    style: "consultative",
    content:
      "Olá Maria! Posso te ajudar com o orçamento da revisão do Civic. Qual a quilometragem aproximada e a unidade preferida?",
    warnings: ["Envio exige aprovação humana"],
    createdAt: t,
  });
  return { mode: "database" as const, contactId: contact.id };
}

export type { CrmTemperature };
