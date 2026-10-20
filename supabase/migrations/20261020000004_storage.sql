-- ─────────────────────────────────────────────────────────────
-- KTGW Togo — stockage des fichiers (photos, logos, rapports PDF)
-- Bucket public « media » : lecture libre, dépôt réservé à l'équipe.
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760, -- 10 Mo
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml', 'application/pdf']
);

create policy "media : dépôt par l'équipe"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff());

create policy "media : modification par l'équipe"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_staff())
  with check (bucket_id = 'media' and public.is_staff());

create policy "media : suppression par l'équipe"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_staff());
