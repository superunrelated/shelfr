alter table public.products add column if not exists archived boolean not null default false;
create index if not exists products_collection_archived on public.products(collection_id, archived);
