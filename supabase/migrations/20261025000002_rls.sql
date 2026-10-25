create or replace function is_staff() returns boolean language sql security definer stable set search_path=public as
$$ select exists(select 1 from profiles where user_id = auth.uid() and active) $$;
create or replace function is_super() returns boolean language sql security definer stable set search_path=public as
$$ select exists(select 1 from profiles where user_id = auth.uid() and active and role='super_admin') $$;
alter table profiles enable row level security; alter table categories enable row level security;
alter table listings enable row level security; alter table customer_leads enable row level security;
create policy cat_read on categories for select using (true);
create policy prof_self on profiles for select to authenticated using (user_id = auth.uid() or is_staff());
create policy prof_super on profiles for update to authenticated using (is_super()) with check (is_super());
create policy lst_sel on listings for select to authenticated using (is_staff());
create policy lst_ins on listings for insert to authenticated with check (is_staff());
create policy lst_upd on listings for update to authenticated using (is_staff()) with check (is_staff());
create policy lst_del on listings for delete to authenticated using (is_super());
create policy lead_ins on customer_leads for insert to anon, authenticated with check (status = 'new');
create policy lead_sel on customer_leads for select to authenticated using (is_staff());
create policy lead_upd on customer_leads for update to authenticated using (is_staff());
create policy lead_del on customer_leads for delete to authenticated using (is_super());
revoke all on listings, customer_leads, profiles from anon;
grant select on categories, public_listings to anon, authenticated;
grant insert (listing_id, name, phone, message) on customer_leads to anon, authenticated;
grant select, insert, update, delete on listings, customer_leads to authenticated;
grant select, update on profiles to authenticated;
