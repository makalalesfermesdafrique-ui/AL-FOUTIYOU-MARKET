alter table listings add column if not exists details jsonb not null default '{}';
drop view if exists public_listings;
create view public_listings as
  select id, title, description, category_id, price, city, region, price_negotiable, image_url, published_at, created_at, details
  from listings where status = 'published';
grant select on public_listings to anon, authenticated;
notify pgrst, 'reload schema';
