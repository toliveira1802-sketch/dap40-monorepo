import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { AccessLevel, AccessSystem } from "@dap40/types";
import {
  CRM_ANNA_FEEDBACK_ACTIONS,
  CRM_ANNA_INTENTS,
  CRM_CONVERSION_INTENT_TYPES,
  CRM_IDENTITY_CHANNELS,
  CRM_PIPELINE_STAGES,
  CRM_TEMPERATURES,
} from "@dap40/types";
import { canAccess, getAccessLevel } from "./access";
import { listAccessGrantsByUserId } from "./accessGrantStore";
import { protectedProcedure, router } from "../trpc";
import * as crmStore from "./crmStore";

async function resolveGrants(userId: number) {
  const grantRows = await listAccessGrantsByUserId(userId);
  return Object.fromEntries(
    grantRows.map(grant => [grant.system, grant.level])
  ) as Partial<Record<AccessSystem, AccessLevel>>;
}

async function requireCrmAccess(
  companyRole: string,
  userId: number,
  minLevel: AccessLevel
) {
  const grants = await resolveGrants(userId);
  const level = getAccessLevel(companyRole, "CRM", grants);
  if (!canAccess(level, minLevel)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Sem permissão para o módulo Comercial (CRM)",
    });
  }
  return level;
}

const stageIdSchema = z.enum(
  CRM_PIPELINE_STAGES.map(s => s.id) as [
    (typeof CRM_PIPELINE_STAGES)[number]["id"],
    ...(typeof CRM_PIPELINE_STAGES)[number]["id"][],
  ]
);

export const crmRouter = router({
  dashboard: router({
    overview: protectedProcedure.query(async ({ ctx }) => {
      await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "read");
      return crmStore.getCrmDashboardOverview();
    }),
  }),

  inbox: router({
    listConversations: protectedProcedure.query(async ({ ctx }) => {
      await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "read");
      return crmStore.listCrmConversations();
    }),
    listMessages: protectedProcedure
      .input(z.object({ conversationId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "read");
        return crmStore.listCrmMessages(input.conversationId);
      }),
    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.string().uuid(),
          body: z.string().trim().min(1).max(8000),
          idempotencyKey: z.string().max(120).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "write");
        return crmStore.sendCrmOutboundMessage({
          conversationId: input.conversationId,
          body: input.body,
          senderUserId: ctx.user.id,
          idempotencyKey: input.idempotencyKey,
        });
      }),
  }),

  anna: router({
    listSuggestions: protectedProcedure
      .input(z.object({ conversationId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "read");
        return crmStore.listAnnaSuggestions(input.conversationId);
      }),
    generate: protectedProcedure
      .input(
        z.object({
          conversationId: z.string().uuid(),
          contactId: z.string().uuid(),
          intent: z.enum(CRM_ANNA_INTENTS).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "write");
        return crmStore.generateAnnaSuggestion(input);
      }),
    decide: protectedProcedure
      .input(
        z.object({
          suggestionId: z.string().uuid(),
          action: z.enum(CRM_ANNA_FEEDBACK_ACTIONS),
          finalContent: z.string().trim().min(1).max(8000).optional(),
          reasons: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "write");
        return crmStore.decideAnnaSuggestion({
          ...input,
          userId: ctx.user.id,
        });
      }),
  }),

  leads: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "read");
      return crmStore.listCrmLeads();
    }),
    create: protectedProcedure
      .input(
        z.object({
          displayName: z.string().trim().min(2).max(200),
          temperature: z.enum(CRM_TEMPERATURES).optional(),
          notes: z.string().trim().max(2000).optional(),
          identityChannel: z.enum(CRM_IDENTITY_CHANNELS).optional(),
          identityValue: z.string().trim().min(3).max(200).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "write");
        try {
          return await crmStore.createCrmLead({
            ...input,
            ownerUserId: ctx.user.id,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Falha ao criar lead";
          throw new TRPCError({
            code: message.includes("já cadastrada")
              ? "CONFLICT"
              : "BAD_REQUEST",
            message,
          });
        }
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.string().uuid(),
          displayName: z.string().trim().min(2).max(200).optional(),
          temperature: z.enum(CRM_TEMPERATURES).optional(),
          notes: z.string().trim().max(2000).nullable().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "write");
        try {
          return await crmStore.updateCrmLead(input);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Falha ao atualizar lead";
          throw new TRPCError({
            code: message.includes("não encontrado")
              ? "NOT_FOUND"
              : "BAD_REQUEST",
            message,
          });
        }
      }),
  }),

  pipeline: router({
    config: protectedProcedure.query(async ({ ctx }) => {
      await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "read");
      return crmStore.getPipelineConfig();
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "read");
      return crmStore.listCrmOpportunities();
    }),
    moveStage: protectedProcedure
      .input(
        z.object({
          opportunityId: z.string().uuid(),
          toStageId: stageIdSchema,
          note: z.string().max(500).optional(),
          lostReason: z.string().trim().min(3).max(500).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "write");
        return crmStore.moveCrmOpportunityStage({
          opportunityId: input.opportunityId,
          toStageId: input.toStageId,
          userId: ctx.user.id,
          note: input.note,
          lostReason: input.lostReason,
        });
      }),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().trim().min(2).max(200),
          contactId: z.string().uuid(),
          pipelineStageId: stageIdSchema.optional(),
          estimatedValueReais: z.number().min(0).max(10_000_000).optional(),
          temperature: z.enum(CRM_TEMPERATURES).optional(),
          nextAction: z.string().trim().max(500).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "write");
        try {
          return await crmStore.createCrmOpportunity({
            title: input.title,
            contactId: input.contactId,
            pipelineStageId: input.pipelineStageId ?? "stage_novo_lead",
            estimatedValueCents: Math.round(
              (input.estimatedValueReais ?? 0) * 100
            ),
            temperature: input.temperature,
            nextAction: input.nextAction,
            userId: ctx.user.id,
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Falha ao criar oportunidade";
          throw new TRPCError({
            code: message.includes("não encontrado")
              ? "NOT_FOUND"
              : "BAD_REQUEST",
            message,
          });
        }
      }),
  }),

  contacts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "read");
      return crmStore.listCrmContacts();
    }),
    get: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "read");
        const contact = await crmStore.getCrmContact(input.id);
        if (!contact) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Contato não encontrado",
          });
        }
        return contact;
      }),
  }),

  conversion: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "read");
      return crmStore.listErpConversionIntents();
    }),
    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(CRM_CONVERSION_INTENT_TYPES),
          crmEntityType: z.string().min(1).max(64),
          crmEntityId: z.string().uuid(),
          payload: z.record(z.string(), z.unknown()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "write");
        return crmStore.createErpConversionIntent(input);
      }),
    resolve: protectedProcedure
      .input(
        z.object({
          intentId: z.string().uuid(),
          status: z.enum(["accepted", "rejected", "completed", "failed"]),
          erpExternalId: z.string().optional(),
          erpResponse: z.record(z.string(), z.unknown()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "write");
        return crmStore.resolveErpConversionIntent(input);
      }),
  }),

  seedDemo: protectedProcedure.mutation(async ({ ctx }) => {
    await requireCrmAccess(ctx.user.companyRole, ctx.user.id, "admin");
    return crmStore.seedCrmDemoIfEmpty(ctx.user.id);
  }),
});
