import type { FastifyPluginAsync, FastifyRequest } from "fastify";

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export type InboxChannel = "whatsapp" | "messenger" | "instagram";

export type NormalizedInbound = {
  channel: InboxChannel;
  sender_id: string;
  recipient_id: string;
  text: string;
  message_id: string;
  timestamp: string;
  raw: unknown;
};

type SendBody = {
  channel?: string;
  to?: string;
  text?: string;
};

type SalesEventBody = {
  channel?: string;
  conversation_id?: string;
  text?: string;
  sender_id?: string;
  draft_hint?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

/** Normaliza payloads Meta (WhatsApp Cloud, Messenger, Instagram Messaging). */
export function normalizeMetaWebhook(payload: unknown): NormalizedInbound[] {
  const root = asRecord(payload);
  if (!root) return [];

  const objectType = str(root.object);
  const entry = Array.isArray(root.entry) ? root.entry : [];
  const out: NormalizedInbound[] = [];

  if (objectType === "whatsapp_business_account") {
    for (const item of entry) {
      const entryObj = asRecord(item);
      const changes = Array.isArray(entryObj?.changes) ? entryObj!.changes : [];
      for (const change of changes) {
        const changeObj = asRecord(change);
        const value = asRecord(changeObj?.value);
        if (!value) continue;
        const metadata = asRecord(value.metadata);
        const recipientId = str(metadata?.phone_number_id);
        const messages = Array.isArray(value.messages) ? value.messages : [];
        for (const msg of messages) {
          const m = asRecord(msg);
          if (!m) continue;
          const textObj = asRecord(m.text);
          out.push({
            channel: "whatsapp",
            sender_id: str(m.from),
            recipient_id: recipientId,
            text: str(textObj?.body),
            message_id: str(m.id),
            timestamp: str(m.timestamp),
            raw: msg,
          });
        }
      }
    }
    return out;
  }

  if (objectType === "page" || objectType === "instagram") {
    const channel: InboxChannel = objectType === "instagram" ? "instagram" : "messenger";
    for (const item of entry) {
      const entryObj = asRecord(item);
      if (!entryObj) continue;

      const messaging = Array.isArray(entryObj.messaging)
        ? entryObj.messaging
        : Array.isArray(entryObj.standby)
          ? entryObj.standby
          : [];

      for (const event of messaging) {
        const ev = asRecord(event);
        if (!ev) continue;
        const message = asRecord(ev.message);
        if (!message || message.is_echo === true) continue;
        const sender = asRecord(ev.sender);
        const recipient = asRecord(ev.recipient);
        out.push({
          channel: objectType === "instagram" ? "instagram" : channel,
          sender_id: str(sender?.id),
          recipient_id: str(recipient?.id),
          text: str(message.text),
          message_id: str(message.mid),
          timestamp: str(ev.timestamp),
          raw: event,
        });
      }
    }
    return out;
  }

  return out;
}

function buildGraphPayload(channel: InboxChannel, to: string, text: string) {
  if (channel === "whatsapp") {
    return {
      url: `${GRAPH_BASE}/${process.env.META_PHONE_NUMBER_ID}/messages`,
      body: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body: text },
      },
    };
  }

  // Messenger + Instagram Messaging usam Page ID
  return {
    url: `${GRAPH_BASE}/${process.env.META_PAGE_ID}/messages`,
    body: {
      recipient: { id: to },
      messaging_type: "RESPONSE",
      message: { text },
    },
  };
}

function hubParam(query: unknown, key: "mode" | "verify_token" | "challenge"): string {
  const rec = asRecord(query);
  if (!rec) return "";
  const dotted = rec[`hub.${key}`];
  if (typeof dotted === "string") return dotted;
  if (Array.isArray(dotted) && typeof dotted[0] === "string") return dotted[0];
  const hub = asRecord(rec.hub);
  const nested = hub?.[key];
  if (typeof nested === "string") return nested;
  if (Array.isArray(nested) && typeof nested[0] === "string") return nested[0];
  return nested == null ? "" : String(nested);
}

const metaInboxPlugin: FastifyPluginAsync = async server => {
  // logLevel silent: GET traz hub.verify_token na query — não logar token.
  server.get("/webhooks/meta", { logLevel: "silent" }, async (request, reply) => {
    const mode = hubParam(request.query, "mode");
    const token = hubParam(request.query, "verify_token");
    const challenge = hubParam(request.query, "challenge");
    const expected = process.env.META_VERIFY_TOKEN;

    if (mode === "subscribe" && expected && token === expected && challenge) {
      return reply.code(200).type("text/plain").send(challenge);
    }
    return reply.code(403).send({ error: "Forbidden" });
  });

  server.post("/webhooks/meta", async (request, reply) => {
    // 200 rápido — processamento síncrono leve (normalização); persistência fica para o implantador
    const normalized = normalizeMetaWebhook(request.body);
    request.log.info(
      { count: normalized.length, channels: [...new Set(normalized.map(n => n.channel))] },
      "meta webhook received"
    );
    return reply.code(200).send({ ok: true, received: normalized.length });
  });

  server.post("/inbox/send", async (request, reply) => {
    const body = (request.body ?? {}) as SendBody;
    const channelRaw = str(body.channel).toLowerCase();
    const to = str(body.to).trim();
    const text = str(body.text).trim();

    if (!["whatsapp", "messenger", "instagram"].includes(channelRaw) || !to || !text) {
      return reply.code(400).send({
        error: "Body inválido. Exige { channel: whatsapp|messenger|instagram, to, text }.",
      });
    }

    const channel = channelRaw as InboxChannel;
    const payload = buildGraphPayload(channel, to, text);
    const token = process.env.META_GRAPH_TOKEN;

    if (!token) {
      return reply.code(501).send({
        error: "META_GRAPH_TOKEN ausente — envio não executado.",
        would_send: payload,
      });
    }

    if (channel === "whatsapp" && !process.env.META_PHONE_NUMBER_ID) {
      return reply.code(500).send({ error: "META_PHONE_NUMBER_ID não configurado." });
    }
    if ((channel === "messenger" || channel === "instagram") && !process.env.META_PAGE_ID) {
      return reply.code(500).send({ error: "META_PAGE_ID não configurado." });
    }

    const graphRes = await fetch(payload.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload.body),
    });

    const graphJson = await graphRes.json().catch(() => ({}));
    if (!graphRes.ok) {
      return reply.code(502).send({
        error: "Falha no Graph API",
        status: graphRes.status,
        graph: graphJson,
      });
    }

    return reply.code(200).send({ ok: true, channel, graph: graphJson });
  });

  server.post("/agent/sales/events", async (request: FastifyRequest, reply) => {
    const body = (request.body ?? {}) as SalesEventBody;
    const channel = str(body.channel) || "whatsapp";
    const conversationId = str(body.conversation_id) || "unknown";
    const inbound = str(body.text);
    const hint = str(body.draft_hint);

    // Porta da Anna: NÃO envia ao cliente. Só rascunho + pending_approval.
    const draft_reply =
      hint ||
      (inbound
        ? `Olá! Recebemos sua mensagem ("${inbound.slice(0, 120)}"). Em breve um consultor retorna.`
        : "Olá! Em breve um consultor da DAP retorna o contato.");

    return reply.code(200).send({
      status: "pending_approval",
      draft_reply,
      warnings: ["Envio exige aprovação humana"],
      channel,
      conversation_id: conversationId,
    });
  });
};

export default metaInboxPlugin;
