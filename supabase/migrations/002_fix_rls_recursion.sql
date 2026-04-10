-- Fix infinite recursion in RLS policies
-- The issue: collections policies reference collection_members,
-- and collection_members policies reference collections = circular

-- Drop the problematic policies
drop policy if exists "Collection owners can manage members" on public.collection_members;
drop policy if exists "Members can view their memberships" on public.collection_members;
drop policy if exists "Members can view shared collections" on public.collections;

-- Recreate collection_members policies WITHOUT referencing collections table
-- Instead, use a direct user_id check (the invited_by or owner check happens at app level)
create policy "Users can view their memberships"
  on public.collection_members for select
  using (auth.uid() = user_id);

create policy "Users can manage memberships they created"
  on public.collection_members for all
  using (auth.uid() = invited_by)
  with check (auth.uid() = invited_by);

-- Recreate the shared collections policy using a security definer function
-- to break the RLS recursion cycle
create or replace function public.is_collection_member(cid uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.collection_members
    where collection_id = cid and user_id = auth.uid()
  );
$$;

create policy "Members can view shared collections"
  on public.collections for select
  using (public.is_collection_member(id));
