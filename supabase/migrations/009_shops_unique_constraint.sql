-- Add unique constraint on (collection_id, domain) so upserts work correctly
-- First deduplicate any existing rows
delete from public.shops a
  using public.shops b
  where a.id > b.id
    and a.collection_id = b.collection_id
    and a.domain = b.domain;

alter table public.shops
  add constraint shops_collection_domain_unique unique (collection_id, domain);
