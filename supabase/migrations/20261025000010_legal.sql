alter table company_settings add column if not exists terms text;
alter table company_settings add column if not exists privacy text;
notify pgrst, 'reload schema';
