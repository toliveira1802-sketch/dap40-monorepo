# Comercial (CRM) — Meta Inbox

Um app Meta, três produtos:

1. **WhatsApp Cloud API** (WABA + número)
2. **Messenger**
3. **Instagram Messaging** (Page + conta IG professional)

## Setup Meta

1. Crie / use **um** App no Meta for Developers.
2. Adicione os produtos: WhatsApp, Messenger, Instagram.
3. Vincule a **Page** e a conta **Instagram professional**.
4. Vincule a **WABA** e o número de telefone.
5. Callback URL: `https://<API_HOST>/webhooks/meta`
6. Verify token: mesmo valor de `META_VERIFY_TOKEN` no `.env` da API.
7. Subscribe em **messages** nos três produtos.

## Env (API)

| Variável | Uso |
|----------|-----|
| `META_VERIFY_TOKEN` | Challenge do webhook GET |
| `META_GRAPH_TOKEN` | Bearer Graph v21.0 (sem token → `/inbox/send` retorna 501 + payload) |
| `META_PHONE_NUMBER_ID` | Envio WhatsApp |
| `META_PAGE_ID` | Envio Messenger / Instagram |

Portal: `VITE_DAP_API_URL` (default `http://localhost:3001`).

## Fluxo

```
cliente → Meta → POST /webhooks/meta → crm_* (persistência)
                 → POST /agent/sales/events (rascunho Anna, pending_approval)
                 → consultor aprova em /comercial/inbox
                 → POST /inbox/send → Graph API
```

- **Sem Kommo.**
- **Sem auto-send** — `/agent/sales/events` nunca envia ao cliente.
- Browser **não** chama Graph; só a API DAP.

## Banco

Tabelas `crm_*` (ver migration `20260821060000_crm_inbox.sql`).  
`public.clients` = cliente da **oficina** (ERP), não contato CRM.
