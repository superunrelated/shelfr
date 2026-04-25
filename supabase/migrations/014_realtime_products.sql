-- Enable Postgres Realtime for the products table so clients (web app) get
-- live INSERT/UPDATE/DELETE events when rows change — e.g. when the browser
-- extension inserts a product on a different device.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'products'
  ) then
    alter publication supabase_realtime add table public.products;
  end if;
end
$$;
