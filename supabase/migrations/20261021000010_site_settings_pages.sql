-- ─────────────────────────────────────────────────────────────
-- KTGW Togo — étape C : paramètres du site et pages personnalisées
--
-- site_settings : coordonnées, réseaux sociaux, menus, diaporama de l'accueil,
--                 textes modifiés (clés « texts.fr », « texts.de », « texts.en »).
-- pages         : pages créées depuis l'administration, construites par blocs.
-- Lecture publique ; écriture par le poste « pages.manage » (et la présidence).
-- ─────────────────────────────────────────────────────────────

create table public.site_settings (
  key text primary key check (key ~ '^[a-z0-9.]{2,60}$'),
  value jsonb not null,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

create policy "paramètres : lecture publique"
  on public.site_settings for select to anon, authenticated
  using (true);

create policy "paramètres : écriture par la gestion du site"
  on public.site_settings for all to authenticated
  using (public.has_permission('pages.manage'))
  with check (public.has_permission('pages.manage'));

grant select on public.site_settings to anon;
grant select, insert, update, delete on public.site_settings to authenticated;
grant all on public.site_settings to service_role;

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) <= 160),
  description text not null default '' check (char_length(description) <= 300),
  hero_image jsonb,
  blocks jsonb not null default '[]',
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger pages_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

alter table public.pages enable row level security;

create policy "pages : lecture publique des pages publiées"
  on public.pages for select to anon, authenticated
  using (published or public.has_permission('pages.manage'));

create policy "pages : écriture par la gestion du site"
  on public.pages for all to authenticated
  using (public.has_permission('pages.manage'))
  with check (public.has_permission('pages.manage'));

grant select on public.pages to anon;
grant select, insert, update, delete on public.pages to authenticated;
grant all on public.pages to service_role;
