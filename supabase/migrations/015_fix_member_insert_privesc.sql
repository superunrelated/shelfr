-- Fix privilege escalation: "Users can manage memberships they created" was
-- FOR ALL with WITH CHECK (auth.uid() = invited_by), which let ANY authenticated
-- user insert a membership row for themselves into ANY collection (just set
-- invited_by = their own uid) and grant themselves editor/viewer access.
-- INSERT must additionally require that the caller actually owns the collection.

drop policy if exists "Users can manage memberships they created" on public.collection_members;

create or replace function public.owns_collection(cid uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.collections
    where id = cid and user_id = auth.uid()
  );
$$;

create policy "Owners can insert memberships"
  on public.collection_members for insert
  with check (auth.uid() = invited_by and public.owns_collection(collection_id));

create policy "Owners can update memberships"
  on public.collection_members for update
  using (public.owns_collection(collection_id))
  with check (public.owns_collection(collection_id));

create policy "Owners can delete memberships"
  on public.collection_members for delete
  using (public.owns_collection(collection_id));
