alter table categories add column if not exists image_url text;
drop policy if exists cat_upd on categories;
create policy cat_upd on categories for update to authenticated using (is_staff()) with check (is_staff());
grant update on categories to authenticated;
notify pgrst, 'reload schema';
