-- CRM inbox / Meta messaging
-- public.clients = cliente da oficina (ERP), NÃO contato CRM.
-- Contatos comerciais vivem em crm_contacts (+ identidades por canal).

create extension if not exists pgcrypto;

create table if not exists public.crm_channel_accounts (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('whatsapp', 'messenger', 'instagram')),
  external_id text not null,
  display_name text,
  meta_phone_number_id text,
  meta_page_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (channel, external_id)
);

comment on table public.crm_channel_accounts is
  'Contas Meta (WABA/Page/IG) usadas no inbox comercial. Distinto de public.clients (oficina).';

create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  email text,
  phone_e164 text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.crm_contacts is
  'Contato CRM. NÃO confundir com public.clients (cliente da oficina / ERP).';

create table if not exists public.crm_contact_identities (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.crm_contacts (id) on delete cascade,
  channel text not null check (channel in ('whatsapp', 'messenger', 'instagram')),
  channel_account_id uuid references public.crm_channel_accounts (id) on delete set null,
  external_user_id text not null,
  created_at timestamptz not null default now(),
  unique (channel, external_user_id)
);

comment on table public.crm_contact_identities is
  'IDs de canal (WA wa_id, PSID, IGSID) ligados a crm_contacts.';

create table if not exists public.crm_conversations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.crm_contacts (id) on delete cascade,
  channel_account_id uuid references public.crm_channel_accounts (id) on delete set null,
  channel text not null check (channel in ('whatsapp', 'messenger', 'instagram')),
  status text not null default 'open' check (status in ('open', 'pending', 'closed')),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_conversations_contact_idx on public.crm_conversations (contact_id);
create index if not exists crm_conversations_last_msg_idx on public.crm_conversations (last_message_at desc nulls last);

create table if not exists public.crm_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.crm_conversations (id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  channel text not null check (channel in ('whatsapp', 'messenger', 'instagram')),
  external_message_id text,
  body text,
  status text not null default 'received'
    check (status in ('received', 'queued', 'sent', 'delivered', 'failed', 'pending_approval')),
  sent_by_profile_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists crm_messages_external_id_uidx
  on public.crm_messages (external_message_id)
  where external_message_id is not null;

create index if not exists crm_messages_conversation_idx
  on public.crm_messages (conversation_id, created_at);

create table if not exists public.crm_agent_suggestions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.crm_conversations (id) on delete cascade,
  message_id uuid references public.crm_messages (id) on delete set null,
  draft_reply text not null,
  status text not null default 'pending_approval'
    check (status in ('pending_approval', 'approved', 'rejected', 'expired')),
  warnings jsonb not null default '[]'::jsonb,
  agent_meta jsonb,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by_profile_id uuid
);

comment on table public.crm_agent_suggestions is
  'Rascunhos da Anna (/agent/sales/events). Envio ao cliente exige aprovação humana.';

create table if not exists public.crm_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'meta',
  object_type text,
  payload jsonb not null,
  normalized jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists crm_webhook_events_created_idx
  on public.crm_webhook_events (created_at desc);

-- RLS
alter table public.crm_channel_accounts enable row level security;
alter table public.crm_contacts enable row level security;
alter table public.crm_contact_identities enable row level security;
alter table public.crm_conversations enable row level security;
alter table public.crm_messages enable row level security;
alter table public.crm_agent_suggestions enable row level security;
alter table public.crm_webhook_events enable row level security;

-- Páginas do portal Comercial (grants via access_page_grants)
insert into public.access_pages (page_id, system, path, label)
values
  ('crm.inbox', 'CRM', '/comercial/inbox', 'Inbox'),
  ('crm.dashboard', 'CRM', '/comercial/dashboard', 'Dashboard'),
  ('crm.pipeline', 'CRM', '/comercial/pipeline', 'Pipeline'),
  ('crm.leads', 'CRM', '/comercial/leads', 'Leads')
on conflict (page_id) do update
  set path = excluded.path,
      label = excluded.label,
      system = excluded.system;
