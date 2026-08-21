import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ingestInboundMessage } from "./crmStore";

async function handleMetaVerify(req: FastifyRequest, reply: FastifyReply) {
  const query = req.query as Record<string, string | undefined>;
  const mode = query["hub.mode"];
  const token = query["hub.verify_token"];
  const challenge = query["hub.challenge"];
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
  if (mode === "subscribe" && verifyToken && token === verifyToken) {
    return reply.status(200).send(String(challenge ?? ""));
  }
  return reply.status(403).send();
}

async function handleMetaInbound(req: FastifyRequest, reply: FastifyReply) {
  try {
    const body = req.body as {
      entry?: Array<{
        changes?: Array<{
          value?: {
            messages?: Array<{
              from?: string;
              id?: string;
              text?: { body?: string };
            }>;
            contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>;
          };
        }>;
      }>;
    };

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        const messages = value?.messages ?? [];
        const contacts = value?.contacts ?? [];
        for (const message of messages) {
          if (!message.from || !message.text?.body) continue;
          const contact = contacts.find(c => c.wa_id === message.from);
          await ingestInboundMessage({
            channelType: "whatsapp",
            externalContactId: message.from,
            displayName: contact?.profile?.name ?? message.from,
            body: message.text.body,
            externalMessageId: message.id,
          });
        }
      }
    }
    return reply.status(200).send();
  } catch (error) {
    console.error("[crm webhook meta]", error);
    return reply.status(500).send();
  }
}

/** Public Meta/WhatsApp webhook endpoints (not tRPC). */
export async function registerCrmWebhookRoutes(app: FastifyInstance) {
  app.get("/api/webhooks/meta", handleMetaVerify);
  app.post("/api/webhooks/meta", handleMetaInbound);
  app.get("/api/webhooks/whatsapp", handleMetaVerify);
  app.post("/api/webhooks/whatsapp", handleMetaInbound);
}
