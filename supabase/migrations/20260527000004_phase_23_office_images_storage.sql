-- Create public storage bucket for office images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'office-images',
  'office-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Authenticated users can upload
create policy "office_images_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'office-images');

-- Public can view (bucket is public, but explicit policy for clarity)
create policy "office_images_select"
on storage.objects for select
to public
using (bucket_id = 'office-images');

-- Users can delete only files in their own folder
create policy "office_images_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'office-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);