-- ─────────────────────────────────────────────────────────────
-- KTGW Togo — module Publications : rubriques libres, emplacements, liens, vidéo
-- ─────────────────────────────────────────────────────────────

-- Rubriques libres (journalisme, annonces, immobilier, opportunités…).
alter table public.posts drop constraint if exists posts_category_check;
alter table public.posts add constraint posts_category_check check (char_length(category) between 2 and 60);

alter table public.posts
  -- Où l'article apparaît : 'actualites' (page Actualités), 'accueil' (page d'accueil),
  -- 'page:<adresse>' (section d'une page personnalisée).
  add column if not exists placements text[] not null default '{actualites,accueil}',
  -- Liens utiles affichés sous l'article : [{ "label": "...", "url": "https://..." }].
  add column if not exists links jsonb not null default '[]',
  -- Vidéo YouTube / Facebook / TikTok (lien).
  add column if not exists video_url text check (video_url is null or video_url ~ '^https://'),
  add column if not exists author text check (char_length(author) <= 120),
  add column if not exists pinned boolean not null default false;

create index if not exists posts_placements_idx on public.posts using gin (placements);
