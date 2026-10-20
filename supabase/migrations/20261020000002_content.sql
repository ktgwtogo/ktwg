-- ─────────────────────────────────────────────────────────────
-- KTGW Togo — contenus éditables depuis le dashboard
-- Reprend les modèles de src/content/*.ts. Les images sont stockées
-- au format SiteImage : { "src", "alt", "width", "height" }.
-- Lecture publique des contenus publiés ; écriture réservée à l'équipe.
-- ─────────────────────────────────────────────────────────────

create type public.project_status as enum ('en-preparation', 'en-cours', 'realise');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text not null default '',
  location text not null default '',
  status public.project_status not null default 'en-cours',
  image jsonb,
  summary text not null default '',
  body text[] not null default '{}',
  facts jsonb not null default '[]',
  progress jsonb,
  milestones jsonb not null default '[]',
  gallery jsonb not null default '[]',
  budget_eur numeric(12, 2),
  raised_eur numeric(12, 2),
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  published_on date not null default current_date,
  category text not null check (category in ('Projets', 'Environnement', 'Vie de l''ONG')),
  image jsonb,
  excerpt text not null default '',
  body text[] not null default '{}',
  gallery jsonb not null default '[]',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text not null default '',
  city text not null default '',
  format text not null default 'presentiel' check (format in ('presentiel', 'en-ligne')),
  capacity integer check (capacity > 0),
  image jsonb,
  summary text not null default '',
  body text[] not null default '{}',
  is_sample boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  image jsonb not null,
  category text not null check (category in ('Internat', 'Cérémonies', 'Environnement', 'Partenaires')),
  caption text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  initials text not null,
  country text not null check (country in ('Togo', 'Allemagne')),
  description text not null default '',
  url text,
  tone text not null default 'ink' check (tone in ('red', 'green', 'sun', 'ink')),
  logo text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  role text not null default '',
  initials text not null default '',
  photo text,
  is_sample boolean not null default false,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_published_on_idx on public.posts (published_on desc);
create index events_starts_at_idx on public.events (starts_at);

-- updated_at + RLS + droits, identiques pour chaque table de contenu
do $$
declare
  t text;
begin
  foreach t in array array['projects', 'posts', 'events', 'gallery_items', 'partners', 'testimonials'] loop
    execute format(
      'create trigger %1$s_updated_at before update on public.%1$I
         for each row execute function public.set_updated_at()', t);
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "lecture publique des contenus publiés" on public.%I
         for select to anon, authenticated using (published or public.is_staff())', t);
    execute format(
      'create policy "ajout par l''équipe" on public.%I
         for insert to authenticated with check (public.is_staff())', t);
    execute format(
      'create policy "modification par l''équipe" on public.%I
         for update to authenticated using (public.is_staff()) with check (public.is_staff())', t);
    execute format(
      'create policy "suppression par l''équipe" on public.%I
         for delete to authenticated using (public.is_staff())', t);
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end;
$$;
