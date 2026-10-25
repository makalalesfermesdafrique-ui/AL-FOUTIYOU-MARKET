-- Retire les annonces de démonstration
delete from listings where title in ('Terrain 300 m² viabilisé','Villa 4 chambres','Toyota Corolla 2018');
alter table listings add column if not exists region text;
alter table listings add column if not exists price_negotiable boolean not null default false;
alter table listings add column if not exists published_at timestamptz;
update listings set published_at = created_at where status='published' and published_at is null;
create or replace function set_published_at() returns trigger language plpgsql as $$
begin if new.status='published' and new.published_at is null then new.published_at := now(); end if; return new; end $$;
drop trigger if exists trg_published_at on listings;
create trigger trg_published_at before insert or update on listings for each row execute function set_published_at();
drop view if exists public_listings;
create view public_listings as
  select id, title, description, category_id, price, city, region, price_negotiable, image_url, published_at, created_at
  from listings where status = 'published';
grant select on public_listings to anon, authenticated;
create table if not exists company_settings (
  id int primary key default 1 check (id = 1),
  company_name text not null default 'AL FOUTIYOU MARKET',
  phone text, whatsapp text, email text, address text, description text, updated_at timestamptz default now());
insert into company_settings(id) values (1) on conflict do nothing;
alter table company_settings enable row level security;
create policy cs_read on company_settings for select using (true);
create policy cs_upd on company_settings for update to authenticated using (is_staff()) with check (is_staff());
grant select on company_settings to anon, authenticated;
grant update on company_settings to authenticated;
