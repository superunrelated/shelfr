-- Add archived flag to collections
alter table public.collections add column archived boolean not null default false;
create index collections_user_archived on public.collections(user_id, archived);

-- Add accepted flag to collection_members (invitations must be accepted)
alter table public.collection_members add column accepted boolean not null default false;
