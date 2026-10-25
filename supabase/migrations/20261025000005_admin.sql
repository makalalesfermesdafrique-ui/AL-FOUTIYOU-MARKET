alter table listings drop constraint if exists listings_status_check;
alter table listings add constraint listings_status_check check (status in ('draft','published','sold','unavailable','archived'));
alter table customer_leads add column if not exists admin_notes text;
alter table customer_leads add column if not exists updated_at timestamptz default now();
alter table profiles add column if not exists email text;
update profiles p set email = u.email from auth.users u where u.id = p.user_id and p.email is null;
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into profiles(user_id, email) values (new.id, new.email) on conflict do nothing; return new; end $$;
