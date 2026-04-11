-- Allow users to delete their own account.
-- All data cascades via foreign key ON DELETE CASCADE.
create or replace function public.delete_own_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;
