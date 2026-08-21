import {
  boolean,
  index,
  integer,
  jsonb,
  pgSchema,
  text,
  uniqueIndex,
  uuid,
  bigint,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import {
  CRM_ANNA_FEEDBACK_ACTIONS,
  CRM_ANNA_INTENTS,
  CRM_ANNA_STYLES,
  CRM_ANNA_SUGGESTION_STATUSES,
  CRM_CHANNEL_TYPES,
  CRM_CONTACT_TYPES,
  CRM_CONVERSATION_STATUSES,
  CRM_CONVERSION_INTENT_STATUSES,
  CRM_CONVERSION_INTENT_TYPES,
  CRM_IDENTITY_CHANNELS,
  CRM_MESSAGE_DIRECTIONS,
  CRM_MESSAGE_STATUSES,
  CRM_OPPORTUNITY_STATUSES,
  CRM_TEMPERATURES,
} from "@dap40/types";

export const dapCrmSchema = pgSchema("dap_crm");

export const crmContactTypeEnum = dapCrmSchema.enum(
  "contact_type",
  CRM_CONTACT_TYPES
);
export const crmIdentityChannelEnum = dapCrmSchema.enum(
  "identity_channel",
  CRM_IDENTITY_CHANNELS
);
export const crmChannelTypeEnum = dapCrmSchema.enum(
  "channel_type",
  CRM_CHANNEL_TYPES
);
export const crmConversationStatusEnum = dapCrmSchema.enum(
  "conversation_status",
  CRM_CONVERSATION_STATUSES
);
export const crmMessageDirectionEnum = dapCrmSchema.enum(
  "message_direction",
  CRM_MESSAGE_DIRECTIONS
);
export const crmMessageStatusEnum = dapCrmSchema.enum(
  "message_status",
  CRM_MESSAGE_STATUSES
);
export const crmOpportunityStatusEnum = dapCrmSchema.enum(
  "opportunity_status",
  CRM_OPPORTUNITY_STATUSES
);
export const crmTemperatureEnum = dapCrmSchema.enum(
  "temperature",
  CRM_TEMPERATURES
);
export const crmAnnaIntentEnum = dapCrmSchema.enum(
  "anna_intent",
  CRM_ANNA_INTENTS
);
export const crmAnnaStyleEnum = dapCrmSchema.enum("anna_style", CRM_ANNA_STYLES);
export const crmAnnaSuggestionStatusEnum = dapCrmSchema.enum(
  "anna_suggestion_status",
  CRM_ANNA_SUGGESTION_STATUSES
);
export const crmAnnaFeedbackActionEnum = dapCrmSchema.enum(
  "anna_feedback_action",
  CRM_ANNA_FEEDBACK_ACTIONS
);
export const crmConversionIntentTypeEnum = dapCrmSchema.enum(
  "conversion_intent_type",
  CRM_CONVERSION_INTENT_TYPES
);
export const crmConversionIntentStatusEnum = dapCrmSchema.enum(
  "conversion_intent_status",
  CRM_CONVERSION_INTENT_STATUSES
);

/** CRM contact (engagement identity). Links to ERP client when converted. */
export const crmContacts = dapCrmSchema.table(
  "contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: crmContactTypeEnum("type").default("person").notNull(),
    displayName: text("displayName").notNull(),
    primaryIdentityId: uuid("primaryIdentityId"),
    /** References dap_patio.users.id (no cross-schema FK in V1). */
    ownerUserId: integer("ownerUserId"),
    erpClientId: integer("erpClientId"),
    status: text("status").default("active").notNull(),
    notes: text("notes"),
    temperature: crmTemperatureEnum("temperature").default("warm").notNull(),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
    updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  },
  table => ({ crm_contacts_owner_idx: index("crm_contacts_owner_idx").on(table.ownerUserId) })
);

export const crmContactIdentities = dapCrmSchema.table(
  "contact_identities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contactId: uuid("contactId")
      .notNull()
      .references(() => crmContacts.id, { onDelete: "cascade" }),
    channel: crmIdentityChannelEnum("channel").notNull(),
    value: text("value").notNull(),
    normalizedValue: text("normalizedValue").notNull(),
    isPrimary: boolean("isPrimary").default(false).notNull(),
    isVerified: boolean("isVerified").default(false).notNull(),
    externalId: text("externalId"),
    status: text("status").default("active").notNull(),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
    updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  },
  table => ({
    crm_identities_contact_idx: index("crm_identities_contact_idx").on(table.contactId),
    crm_identities_channel_value_uidx: uniqueIndex("crm_identities_channel_value_uidx").on(
      table.channel,
      table.normalizedValue
    ),
  })
);

export const crmConversations = dapCrmSchema.table(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    channelType: crmChannelTypeEnum("channelType").notNull(),
    contactId: uuid("contactId")
      .notNull()
      .references(() => crmContacts.id, { onDelete: "restrict" }),
    assignedUserId: integer("assignedUserId"),
    opportunityId: uuid("opportunityId"),
    status: crmConversationStatusEnum("status").default("open").notNull(),
    subject: text("subject"),
    lastMessageAt: bigint("lastMessageAt", { mode: "number" }),
    unreadCount: integer("unreadCount").default(0).notNull(),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
    updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  },
  table => ({
    crm_conversations_contact_idx: index("crm_conversations_contact_idx").on(table.contactId),
    crm_conversations_status_idx: index("crm_conversations_status_idx").on(table.status),
  })
);

export const crmOpportunities = dapCrmSchema.table(
  "opportunities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    contactId: uuid("contactId")
      .notNull()
      .references(() => crmContacts.id, { onDelete: "restrict" }),
    conversationId: uuid("conversationId").references(
      () => crmConversations.id,
      { onDelete: "set null" }
    ),
    pipelineId: text("pipelineId")
      .default("pipeline_dap_prime_default")
      .notNull(),
    pipelineStageId: text("pipelineStageId").notNull(),
    assignedUserId: integer("assignedUserId"),
    status: crmOpportunityStatusEnum("status").default("open").notNull(),
    temperature: crmTemperatureEnum("temperature").default("warm").notNull(),
    estimatedValueCents: integer("estimatedValueCents").default(0).notNull(),
    approvedValueCents: integer("approvedValueCents").default(0).notNull(),
    stageEnteredAt: bigint("stageEnteredAt", { mode: "number" }).notNull(),
    lostReason: text("lostReason"),
    nextAction: text("nextAction"),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
    updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  },
  table => ({
    crm_opportunities_contact_idx: index("crm_opportunities_contact_idx").on(table.contactId),
    crm_opportunities_stage_idx: index("crm_opportunities_stage_idx").on(table.pipelineStageId),
  })
);

export const crmOpportunityStageHistory = dapCrmSchema.table(
  "opportunity_stage_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    opportunityId: uuid("opportunityId")
      .notNull()
      .references(() => crmOpportunities.id, { onDelete: "cascade" }),
    fromStageId: text("fromStageId"),
    toStageId: text("toStageId").notNull(),
    changedByUserId: integer("changedByUserId"),
    note: text("note"),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  },
  table => ({
    crm_opp_stage_history_opp_idx: index("crm_opp_stage_history_opp_idx").on(table.opportunityId),
  })
);

export const crmMessages = dapCrmSchema.table(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversationId")
      .notNull()
      .references(() => crmConversations.id, { onDelete: "cascade" }),
    contactIdentityId: uuid("contactIdentityId").references(
      () => crmContactIdentities.id,
      { onDelete: "set null" }
    ),
    senderUserId: integer("senderUserId"),
    direction: crmMessageDirectionEnum("direction").notNull(),
    status: crmMessageStatusEnum("status").default("pending").notNull(),
    body: text("body").notNull(),
    externalMessageId: text("externalMessageId"),
    idempotencyKey: text("idempotencyKey"),
    sentAt: bigint("sentAt", { mode: "number" }),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
    updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  },
  table => ({
    crm_messages_conversation_idx: index("crm_messages_conversation_idx").on(table.conversationId),
    crm_messages_idempotency_uidx: uniqueIndex("crm_messages_idempotency_uidx")
      .on(table.idempotencyKey)
      .where(sql`${table.idempotencyKey} is not null`),
  })
);

export const crmChannelAccounts = dapCrmSchema.table(
  "channel_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    channelType: crmChannelTypeEnum("channelType").notNull(),
    displayName: text("displayName").notNull(),
    externalAccountId: text("externalAccountId").notNull(),
    status: text("status").default("active").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
    updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  },
  table => ({
    crm_channel_accounts_external_uidx: uniqueIndex("crm_channel_accounts_external_uidx").on(
      table.channelType,
      table.externalAccountId
    ),
  })
);

export const crmAnnaSuggestions = dapCrmSchema.table(
  "anna_suggestions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversationId")
      .notNull()
      .references(() => crmConversations.id, { onDelete: "cascade" }),
    contactId: uuid("contactId")
      .notNull()
      .references(() => crmContacts.id, { onDelete: "cascade" }),
    intent: crmAnnaIntentEnum("intent").notNull(),
    style: crmAnnaStyleEnum("style").notNull(),
    content: text("content").notNull(),
    warnings: jsonb("warnings").$type<string[]>().default([]).notNull(),
    contextSnapshot: jsonb("contextSnapshot")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    version: integer("version").default(1).notNull(),
    correlationId: uuid("correlationId").defaultRandom().notNull(),
    status: crmAnnaSuggestionStatusEnum("status")
      .default("generated")
      .notNull(),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  },
  table => ({
    crm_anna_suggestions_conversation_idx: index("crm_anna_suggestions_conversation_idx").on(table.conversationId),
  })
);

export const crmAnnaFeedback = dapCrmSchema.table(
  "anna_feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    suggestionId: uuid("suggestionId").references(() => crmAnnaSuggestions.id, {
      onDelete: "set null",
    }),
    conversationId: uuid("conversationId")
      .notNull()
      .references(() => crmConversations.id, { onDelete: "cascade" }),
    userId: integer("userId").notNull(),
    action: crmAnnaFeedbackActionEnum("action").notNull(),
    reasons: jsonb("reasons").$type<string[]>().default([]).notNull(),
    originalContent: text("originalContent"),
    finalContent: text("finalContent"),
    correlationId: uuid("correlationId").notNull(),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  },
  table => ({ crm_anna_feedback_conversation_idx: index("crm_anna_feedback_conversation_idx").on(table.conversationId) })
);

export const crmAuditLogs = dapCrmSchema.table(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: integer("actorUserId"),
    entityType: text("entityType").notNull(),
    entityId: uuid("entityId").notNull(),
    action: text("action").notNull(),
    correlationId: uuid("correlationId").defaultRandom().notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    changes: jsonb("changes").$type<Record<string, unknown>>(),
    occurredAt: bigint("occurredAt", { mode: "number" }).notNull(),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  },
  table => ({
    crm_audit_logs_entity_idx: index("crm_audit_logs_entity_idx").on(table.entityType, table.entityId),
  })
);

/** CRM writes intent only — ERP materializes clients/OS. */
export const crmErpConversionIntents = dapCrmSchema.table(
  "erp_conversion_intents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: crmConversionIntentTypeEnum("type").notNull(),
    sourceProduct: text("sourceProduct").default("crm_commercial").notNull(),
    targetProduct: text("targetProduct").default("erp_consultor").notNull(),
    correlationId: uuid("correlationId").defaultRandom().notNull(),
    crmEntityType: text("crmEntityType").notNull(),
    crmEntityId: uuid("crmEntityId").notNull(),
    payload: jsonb("payload")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    status: crmConversionIntentStatusEnum("status")
      .default("pending")
      .notNull(),
    erpExternalId: text("erpExternalId"),
    erpResponse: jsonb("erpResponse").$type<Record<string, unknown>>(),
    submittedAt: bigint("submittedAt", { mode: "number" }).notNull(),
    resolvedAt: bigint("resolvedAt", { mode: "number" }),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
    updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  },
  table => ({
    crm_conversion_intents_entity_idx: index("crm_conversion_intents_entity_idx").on(
      table.crmEntityType,
      table.crmEntityId
    ),
    crm_conversion_intents_status_idx: index("crm_conversion_intents_status_idx").on(table.status),
  })
);

export type CrmContact = typeof crmContacts.$inferSelect;
export type InsertCrmContact = typeof crmContacts.$inferInsert;
export type CrmConversation = typeof crmConversations.$inferSelect;
export type CrmMessage = typeof crmMessages.$inferSelect;
export type CrmOpportunity = typeof crmOpportunities.$inferSelect;
export type CrmAnnaSuggestion = typeof crmAnnaSuggestions.$inferSelect;
export type CrmErpConversionIntent = typeof crmErpConversionIntents.$inferSelect;
