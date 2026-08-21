CREATE SCHEMA IF NOT EXISTS "dap_crm";
--> statement-breakpoint
CREATE TYPE "dap_crm"."contact_type" AS ENUM('person', 'organization');
--> statement-breakpoint
CREATE TYPE "dap_crm"."identity_channel" AS ENUM('phone', 'whatsapp', 'email', 'instagram', 'facebook', 'google', 'external');
--> statement-breakpoint
CREATE TYPE "dap_crm"."channel_type" AS ENUM('whatsapp', 'instagram_direct', 'facebook_messenger', 'facebook_comments', 'instagram_comments', 'meta_lead_ads', 'google_business_messages', 'web_form', 'phone', 'manual');
--> statement-breakpoint
CREATE TYPE "dap_crm"."conversation_status" AS ENUM('open', 'pending', 'resolved', 'archived');
--> statement-breakpoint
CREATE TYPE "dap_crm"."message_direction" AS ENUM('inbound', 'outbound');
--> statement-breakpoint
CREATE TYPE "dap_crm"."message_status" AS ENUM('draft', 'queued', 'sent_mock', 'failed_mock', 'pending', 'sent', 'delivered', 'read', 'failed');
--> statement-breakpoint
CREATE TYPE "dap_crm"."opportunity_status" AS ENUM('open', 'won', 'lost', 'archived');
--> statement-breakpoint
CREATE TYPE "dap_crm"."temperature" AS ENUM('hot', 'warm', 'cold');
--> statement-breakpoint
CREATE TYPE "dap_crm"."anna_intent" AS ENUM('greeting', 'price_request', 'quote_request', 'appointment_request', 'diagnostic_request', 'service_status', 'vehicle_dropoff', 'approval_followup', 'post_sale', 'complaint', 'warranty', 'general_question');
--> statement-breakpoint
CREATE TYPE "dap_crm"."anna_style" AS ENUM('concise', 'consultative', 'technical', 'friendly', 'premium');
--> statement-breakpoint
CREATE TYPE "dap_crm"."anna_suggestion_status" AS ENUM('generated', 'accepted', 'edited', 'rejected', 'sent');
--> statement-breakpoint
CREATE TYPE "dap_crm"."anna_feedback_action" AS ENUM('accepted', 'edited', 'rejected', 'manual_reply');
--> statement-breakpoint
CREATE TYPE "dap_crm"."conversion_intent_type" AS ENUM('lead_to_customer', 'opportunity_to_service_request', 'opportunity_won_handoff', 'quote_approval_request', 'appointment_scheduling_request');
--> statement-breakpoint
CREATE TYPE "dap_crm"."conversion_intent_status" AS ENUM('pending', 'accepted', 'rejected', 'completed', 'failed');
--> statement-breakpoint
CREATE TABLE "dap_crm"."contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "dap_crm"."contact_type" DEFAULT 'person' NOT NULL,
	"displayName" text NOT NULL,
	"primaryIdentityId" uuid,
	"ownerUserId" integer,
	"erpClientId" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"temperature" "dap_crm"."temperature" DEFAULT 'warm' NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dap_crm"."contact_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contactId" uuid NOT NULL,
	"channel" "dap_crm"."identity_channel" NOT NULL,
	"value" text NOT NULL,
	"normalizedValue" text NOT NULL,
	"isPrimary" boolean DEFAULT false NOT NULL,
	"isVerified" boolean DEFAULT false NOT NULL,
	"externalId" text,
	"status" text DEFAULT 'active' NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dap_crm"."conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channelType" "dap_crm"."channel_type" NOT NULL,
	"contactId" uuid NOT NULL,
	"assignedUserId" integer,
	"opportunityId" uuid,
	"status" "dap_crm"."conversation_status" DEFAULT 'open' NOT NULL,
	"subject" text,
	"lastMessageAt" bigint,
	"unreadCount" integer DEFAULT 0 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dap_crm"."opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"contactId" uuid NOT NULL,
	"conversationId" uuid,
	"pipelineId" text DEFAULT 'pipeline_dap_prime_default' NOT NULL,
	"pipelineStageId" text NOT NULL,
	"assignedUserId" integer,
	"status" "dap_crm"."opportunity_status" DEFAULT 'open' NOT NULL,
	"temperature" "dap_crm"."temperature" DEFAULT 'warm' NOT NULL,
	"estimatedValueCents" integer DEFAULT 0 NOT NULL,
	"approvedValueCents" integer DEFAULT 0 NOT NULL,
	"stageEnteredAt" bigint NOT NULL,
	"lostReason" text,
	"nextAction" text,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dap_crm"."opportunity_stage_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunityId" uuid NOT NULL,
	"fromStageId" text,
	"toStageId" text NOT NULL,
	"changedByUserId" integer,
	"note" text,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dap_crm"."messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversationId" uuid NOT NULL,
	"contactIdentityId" uuid,
	"senderUserId" integer,
	"direction" "dap_crm"."message_direction" NOT NULL,
	"status" "dap_crm"."message_status" DEFAULT 'pending' NOT NULL,
	"body" text NOT NULL,
	"externalMessageId" text,
	"idempotencyKey" text,
	"sentAt" bigint,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dap_crm"."channel_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channelType" "dap_crm"."channel_type" NOT NULL,
	"displayName" text NOT NULL,
	"externalAccountId" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dap_crm"."anna_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversationId" uuid NOT NULL,
	"contactId" uuid NOT NULL,
	"intent" "dap_crm"."anna_intent" NOT NULL,
	"style" "dap_crm"."anna_style" NOT NULL,
	"content" text NOT NULL,
	"warnings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"contextSnapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"correlationId" uuid DEFAULT gen_random_uuid() NOT NULL,
	"status" "dap_crm"."anna_suggestion_status" DEFAULT 'generated' NOT NULL,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dap_crm"."anna_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"suggestionId" uuid,
	"conversationId" uuid NOT NULL,
	"userId" integer NOT NULL,
	"action" "dap_crm"."anna_feedback_action" NOT NULL,
	"reasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"originalContent" text,
	"finalContent" text,
	"correlationId" uuid NOT NULL,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dap_crm"."audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actorUserId" integer,
	"entityType" text NOT NULL,
	"entityId" uuid NOT NULL,
	"action" text NOT NULL,
	"correlationId" uuid DEFAULT gen_random_uuid() NOT NULL,
	"metadata" jsonb,
	"changes" jsonb,
	"occurredAt" bigint NOT NULL,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dap_crm"."erp_conversion_intents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "dap_crm"."conversion_intent_type" NOT NULL,
	"sourceProduct" text DEFAULT 'crm_commercial' NOT NULL,
	"targetProduct" text DEFAULT 'erp_consultor' NOT NULL,
	"correlationId" uuid DEFAULT gen_random_uuid() NOT NULL,
	"crmEntityType" text NOT NULL,
	"crmEntityId" uuid NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "dap_crm"."conversion_intent_status" DEFAULT 'pending' NOT NULL,
	"erpExternalId" text,
	"erpResponse" jsonb,
	"submittedAt" bigint NOT NULL,
	"resolvedAt" bigint,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dap_crm"."contact_identities" ADD CONSTRAINT "contact_identities_contactId_contacts_id_fk" FOREIGN KEY ("contactId") REFERENCES "dap_crm"."contacts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dap_crm"."conversations" ADD CONSTRAINT "conversations_contactId_contacts_id_fk" FOREIGN KEY ("contactId") REFERENCES "dap_crm"."contacts"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dap_crm"."opportunities" ADD CONSTRAINT "opportunities_contactId_contacts_id_fk" FOREIGN KEY ("contactId") REFERENCES "dap_crm"."contacts"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dap_crm"."opportunities" ADD CONSTRAINT "opportunities_conversationId_conversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "dap_crm"."conversations"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dap_crm"."opportunity_stage_history" ADD CONSTRAINT "opportunity_stage_history_opportunityId_opportunities_id_fk" FOREIGN KEY ("opportunityId") REFERENCES "dap_crm"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dap_crm"."messages" ADD CONSTRAINT "messages_conversationId_conversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "dap_crm"."conversations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dap_crm"."messages" ADD CONSTRAINT "messages_contactIdentityId_contact_identities_id_fk" FOREIGN KEY ("contactIdentityId") REFERENCES "dap_crm"."contact_identities"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dap_crm"."anna_suggestions" ADD CONSTRAINT "anna_suggestions_conversationId_conversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "dap_crm"."conversations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dap_crm"."anna_suggestions" ADD CONSTRAINT "anna_suggestions_contactId_contacts_id_fk" FOREIGN KEY ("contactId") REFERENCES "dap_crm"."contacts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dap_crm"."anna_feedback" ADD CONSTRAINT "anna_feedback_suggestionId_anna_suggestions_id_fk" FOREIGN KEY ("suggestionId") REFERENCES "dap_crm"."anna_suggestions"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dap_crm"."anna_feedback" ADD CONSTRAINT "anna_feedback_conversationId_conversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "dap_crm"."conversations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "crm_contacts_owner_idx" ON "dap_crm"."contacts" USING btree ("ownerUserId");
--> statement-breakpoint
CREATE INDEX "crm_identities_contact_idx" ON "dap_crm"."contact_identities" USING btree ("contactId");
--> statement-breakpoint
CREATE UNIQUE INDEX "crm_identities_channel_value_uidx" ON "dap_crm"."contact_identities" USING btree ("channel","normalizedValue");
--> statement-breakpoint
CREATE INDEX "crm_conversations_contact_idx" ON "dap_crm"."conversations" USING btree ("contactId");
--> statement-breakpoint
CREATE INDEX "crm_conversations_status_idx" ON "dap_crm"."conversations" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "crm_opportunities_contact_idx" ON "dap_crm"."opportunities" USING btree ("contactId");
--> statement-breakpoint
CREATE INDEX "crm_opportunities_stage_idx" ON "dap_crm"."opportunities" USING btree ("pipelineStageId");
--> statement-breakpoint
CREATE INDEX "crm_opp_stage_history_opp_idx" ON "dap_crm"."opportunity_stage_history" USING btree ("opportunityId");
--> statement-breakpoint
CREATE INDEX "crm_messages_conversation_idx" ON "dap_crm"."messages" USING btree ("conversationId");
--> statement-breakpoint
CREATE UNIQUE INDEX "crm_messages_idempotency_uidx" ON "dap_crm"."messages" USING btree ("idempotencyKey") WHERE "idempotencyKey" is not null;
--> statement-breakpoint
CREATE UNIQUE INDEX "crm_channel_accounts_external_uidx" ON "dap_crm"."channel_accounts" USING btree ("channelType","externalAccountId");
--> statement-breakpoint
CREATE INDEX "crm_anna_suggestions_conversation_idx" ON "dap_crm"."anna_suggestions" USING btree ("conversationId");
--> statement-breakpoint
CREATE INDEX "crm_anna_feedback_conversation_idx" ON "dap_crm"."anna_feedback" USING btree ("conversationId");
--> statement-breakpoint
CREATE INDEX "crm_audit_logs_entity_idx" ON "dap_crm"."audit_logs" USING btree ("entityType","entityId");
--> statement-breakpoint
CREATE INDEX "crm_conversion_intents_entity_idx" ON "dap_crm"."erp_conversion_intents" USING btree ("crmEntityType","crmEntityId");
--> statement-breakpoint
CREATE INDEX "crm_conversion_intents_status_idx" ON "dap_crm"."erp_conversion_intents" USING btree ("status");
