create table if not exists form_links (
  id uuid primary key default gen_random_uuid(), token_hash text unique not null,
  category_id int references categories(id), label text, created_by uuid,
  expires_at timestamptz, revoked_at timestamptz, created_at timestamptz not null default now());
create table if not exists owner_submissions (
  id uuid primary key default gen_random_uuid(), link_id uuid references form_links(id) on delete set null,
  category_id int references categories(id), owner_name text not null, owner_phone text not null, owner_email text,
  city text, region text, title text not null, description text, price numeric, price_negotiable boolean not null default false,
  form_data jsonb not null default '{}', consent boolean not null,
  status text not null default 'new' check (status in ('new','in_review','info_requested','contacted','validated','refused','converted')),
  admin_notes text, listing_id uuid references listings(id) on delete set null, reviewed_by uuid,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table form_links enable row level security; alter table owner_submissions enable row level security;
drop policy if exists fl_all on form_links; drop policy if exists os_sel on owner_submissions; drop policy if exists os_upd on owner_submissions; drop policy if exists os_del on owner_submissions;
create policy fl_all on form_links for all to authenticated using (is_staff()) with check (is_staff());
create policy os_sel on owner_submissions for select to authenticated using (is_staff());
create policy os_upd on owner_submissions for update to authenticated using (is_staff()) with check (is_staff());
create policy os_del on owner_submissions for delete to authenticated using (is_super());
revoke all on form_links, owner_submissions from anon;
grant select, insert, update, delete on form_links to authenticated;
grant select, update, delete on owner_submissions to authenticated;

create or replace function create_form_link(p_category int, p_label text, p_days int) returns text
language plpgsql security definer set search_path=public as $$
declare t text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
begin
  if not is_staff() then raise exception 'Accès refusé'; end if;
  insert into form_links(token_hash, category_id, label, created_by, expires_at)
  values (encode(sha256(convert_to(t,'UTF8')),'hex'), p_category, nullif(trim(p_label),''), auth.uid(),
          case when coalesce(p_days,0) > 0 then now() + make_interval(days => p_days) end);
  return t;
end $$;

create or replace function get_form_link(p_token text) returns json
language sql security definer stable set search_path=public as $$
  select json_build_object('category_id', c.id, 'slug', c.slug, 'name', c.name)
  from form_links l join categories c on c.id = l.category_id
  where l.token_hash = encode(sha256(convert_to(p_token,'UTF8')),'hex')
    and l.revoked_at is null and (l.expires_at is null or l.expires_at > now())
$$;

create or replace function submit_owner_proposal(p_token text, p jsonb) returns uuid
language plpgsql security definer set search_path=public as $$
declare l form_links%rowtype; sid uuid;
begin
  select * into l from form_links where token_hash = encode(sha256(convert_to(p_token,'UTF8')),'hex')
    and revoked_at is null and (expires_at is null or expires_at > now());
  if not found then raise exception 'Lien invalide, expiré ou révoqué'; end if;
  if (select count(*) from owner_submissions where link_id = l.id and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Trop de propositions envoyées. Réessayez plus tard.'; end if;
  if coalesce(trim(p->>'owner_name'),'') = '' or length(p->>'owner_name') > 120 then raise exception 'Nom invalide'; end if;
  if length(regexp_replace(coalesce(p->>'owner_phone',''),'\D','','g')) < 8 or length(p->>'owner_phone') > 30 then raise exception 'Téléphone invalide'; end if;
  if coalesce(trim(p->>'title'),'') = '' or length(p->>'title') > 160 then raise exception 'Titre invalide'; end if;
  if coalesce((p->>'consent')::boolean,false) is not true then raise exception 'Le consentement est obligatoire'; end if;
  if length(coalesce(p->>'description','')) > 5000 or length(coalesce((p->'form_data')::text,'')) > 5000 then raise exception 'Texte trop long'; end if;
  insert into owner_submissions(link_id, category_id, owner_name, owner_phone, owner_email, city, region, title, description, price, price_negotiable, form_data, consent)
  values (l.id, l.category_id, trim(p->>'owner_name'), trim(p->>'owner_phone'), nullif(trim(p->>'owner_email'),''), nullif(trim(p->>'city'),''), nullif(trim(p->>'region'),''),
          trim(p->>'title'), nullif(trim(p->>'description'),''), nullif(p->>'price','')::numeric, coalesce((p->>'price_negotiable')::boolean,false),
          coalesce(p->'form_data','{}'::jsonb), true)
  returning id into sid;
  return sid;
end $$;

create or replace function convert_submission(p_id uuid) returns uuid
language plpgsql security definer set search_path=public as $$
declare s owner_submissions%rowtype; lid uuid;
begin
  if not is_staff() then raise exception 'Accès refusé'; end if;
  select * into s from owner_submissions where id = p_id;
  if not found then raise exception 'Proposition introuvable'; end if;
  if s.listing_id is not null then return s.listing_id; end if;
  insert into listings(title, description, category_id, city, region, price, price_negotiable, status)
  values (s.title, s.description, s.category_id, s.city, s.region, s.price, s.price_negotiable, 'draft') returning id into lid;
  update owner_submissions set listing_id = lid, status = 'converted', reviewed_by = auth.uid(), updated_at = now() where id = p_id;
  return lid;
end $$;

revoke all on function create_form_link(int,text,int), convert_submission(uuid), get_form_link(text), submit_owner_proposal(text,jsonb) from public;
grant execute on function create_form_link(int,text,int), convert_submission(uuid) to authenticated;
grant execute on function get_form_link(text), submit_owner_proposal(text,jsonb) to anon, authenticated;
