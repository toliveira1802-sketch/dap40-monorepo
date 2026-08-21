-- Move criador de acessos: PORTAL-GESTAO → PORTAL-EMPRESA (AIOS / Dev)
insert into public.access_pages (page_id, system, path, label)
values ('empresa.acessos', 'PORTAL-EMPRESA', '/aios/acessos', 'Acessos e cargos')
on conflict (page_id) do update
  set system = excluded.system,
      path = excluded.path,
      label = excluded.label;

update public.access_page_grants
set page_id = 'empresa.acessos'
where page_id = 'gestao.acessos';

delete from public.access_pages where page_id = 'gestao.acessos';
