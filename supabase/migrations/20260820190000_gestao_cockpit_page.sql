-- Ensure Gestao cockpit page exists (BI portal)
insert into public.access_pages (page_id, system, path, label)
values
  ('gestao.cockpit', 'PORTAL-GESTAO', '/gestao/cockpit', 'Cockpit'),
  ('gestao.painel', 'PORTAL-GESTAO', '/gestao', 'Painel gerencial')
on conflict (page_id) do update
  set path = excluded.path,
      label = excluded.label,
      system = excluded.system;
