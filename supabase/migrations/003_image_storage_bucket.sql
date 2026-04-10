-- Create a public storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload
create policy "Authenticated users can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

-- Allow public read access
create policy "Public read access for product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Allow authenticated users to delete their uploads
create policy "Authenticated users can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');
