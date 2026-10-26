alter table listings add column if not exists updated_at timestamptz not null default now();
create table if not exists listing_images (
  id uuid primary key default gen_random_uuid(), listing_id uuid not null references listings(id) on delete cascade,
  storage_path text not null, thumbnail_path text, alt_text text, sort_order int not null default 0,
  is_primary boolean not null default false, created_at timestamptz not null default now());
alter table listing_images enable row level security;
drop policy if exists li_staff on listing_images;
create policy li_staff on listing_images for all to authenticated using (is_staff()) with check (is_staff());
revoke all on listing_images from anon;
grant select, insert, update, delete on listing_images to authenticated;
create or replace view public_listing_images as
  select i.id, i.listing_id, i.storage_path, i.thumbnail_path, i.alt_text, i.sort_order, i.is_primary
  from listing_images i join listings l on l.id = i.listing_id where l.status = 'published';
grant select on public_listing_images to anon, authenticated;
alter table owner_submissions add column if not exists photos text[] not null default '{}';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
 ('listing-images','listing-images', true, 2097152, array['image/webp','image/jpeg','image/png']),
 ('submission-photos','submission-photos', false, 2097152, array['image/webp','image/jpeg','image/png'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create or replace function valid_link_hash(h text) returns boolean language sql security definer stable set search_path=public as $$
  select exists(select 1 from form_links where token_hash = h and revoked_at is null and (expires_at is null or expires_at > now())) $$;
revoke all on function valid_link_hash(text) from public;
grant execute on function valid_link_hash(text) to anon, authenticated;

drop policy if exists li_w_ins on storage.objects; drop policy if exists li_w_upd on storage.objects; drop policy if exists li_w_del on storage.objects;
drop policy if exists sp_ins on storage.objects; drop policy if exists sp_sel on storage.objects; drop policy if exists sp_del on storage.objects;
create policy li_w_ins on storage.objects for insert to authenticated with check (bucket_id = 'listing-images' and is_staff());
create policy li_w_upd on storage.objects for update to authenticated using (bucket_id = 'listing-images' and is_staff());
create policy li_w_del on storage.objects for delete to authenticated using (bucket_id = 'listing-images' and is_staff());
create policy sp_ins on storage.objects for insert to anon, authenticated with check (bucket_id = 'submission-photos' and valid_link_hash((storage.foldername(name))[1]));
create policy sp_sel on storage.objects for select to authenticated using (bucket_id = 'submission-photos' and is_staff());
create policy sp_del on storage.objects for delete to authenticated using (bucket_id = 'submission-photos' and is_staff());

create or replace function submit_owner_proposal(p_token text, p jsonb) returns uuid
language plpgsql security definer set search_path=public as $$
declare l form_links%rowtype; sid uuid; ph text[]; x text;
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
  ph := coalesce(array(select jsonb_array_elements_text(coalesce(p->'photos','[]'::jsonb))), '{}');
  if array_length(ph,1) > 8 then raise exception 'Huit photos maximum'; end if;
  foreach x in array ph loop
    if x !~ ('^' || encode(sha256(convert_to(p_token,'UTF8')),'hex') || '/[0-9a-f-]{36}\.(webp|jpg)$') then raise exception 'Photo invalide'; end if;
  end loop;
  insert into owner_submissions(link_id, category_id, owner_name, owner_phone, owner_email, city, region, title, description, price, price_negotiable, form_data, consent, photos)
  values (l.id, l.category_id, trim(p->>'owner_name'), trim(p->>'owner_phone'), nullif(trim(p->>'owner_email'),''), nullif(trim(p->>'city'),''), nullif(trim(p->>'region'),''),
          trim(p->>'title'), nullif(trim(p->>'description'),''), nullif(p->>'price','')::numeric, coalesce((p->>'price_negotiable')::boolean,false),
          coalesce(p->'form_data','{}'::jsonb), true, ph)
  returning id into sid;
  return sid;
end $$;
notify pgrst, 'reload schema';
