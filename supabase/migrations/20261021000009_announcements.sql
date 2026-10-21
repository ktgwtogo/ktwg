-- ─────────────────────────────────────────────────────────────
-- KTGW Togo — étape B : annonces (bandeau en haut du site)
-- Les autres contenus (actualités, événements, projets, galerie, partenaires,
-- témoignages) existent déjà depuis la migration 2.
-- ─────────────────────────────────────────────────────────────

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 160),
  body text not null default '' check (char_length(body) <= 500),
  link_label text,
  link_url text check (link_url is null or link_url ~ '^(/|https://)'),
  tone text not null default 'info' check (tone in ('info', 'urgent', 'success')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

create index announcements_window_idx on public.announcements (starts_at desc);

create trigger announcements_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

alter table public.announcements enable row level security;

create policy "annonces : lecture publique des annonces en cours"
  on public.announcements for select to anon, authenticated
  using (
    (published and starts_at <= now() and (ends_at is null or ends_at > now()))
    or public.has_permission('content.manage')
  );

create policy "annonces : écriture par la communication"
  on public.announcements for all to authenticated
  using (public.has_permission('content.manage'))
  with check (public.has_permission('content.manage'));

grant select on public.announcements to anon;
grant select, insert, update, delete on public.announcements to authenticated;
grant all on public.announcements to service_role;
