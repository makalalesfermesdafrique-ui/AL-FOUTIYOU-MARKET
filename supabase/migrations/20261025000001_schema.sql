create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text, role text not null default 'agent' check (role in ('super_admin','admin','agent')),
  active boolean not null default false);
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into profiles(user_id) values (new.id) on conflict do nothing; return new; end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
create table if not exists categories (id serial primary key, slug text unique not null, name text not null);
create table if not exists listings (
  id uuid primary key default gen_random_uuid(), title text not null, description text,
  category_id int references categories(id), price numeric, city text, image_url text,
  status text not null default 'draft' check (status in ('draft','published','sold')),
  owner_id uuid, created_at timestamptz not null default now());
create table if not exists customer_leads (
  id uuid primary key default gen_random_uuid(), listing_id uuid references listings(id) on delete set null,
  name text not null, phone text not null, message text,
  status text not null default 'new', created_at timestamptz not null default now());
create or replace view public_listings as
  select id, title, description, category_id, price, city, image_url, created_at
  from listings where status = 'published';
