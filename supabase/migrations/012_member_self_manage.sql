-- Allow members to update their own membership (e.g. accept invite)
create policy "Users can update own membership"
  on public.collection_members for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow members to delete their own membership (decline invite / leave collection)
create policy "Users can delete own membership"
  on public.collection_members for delete
  using (auth.uid() = user_id);
