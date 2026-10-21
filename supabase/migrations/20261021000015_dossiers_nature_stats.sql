-- ─────────────────────────────────────────────────────────────
-- KTGW Togo — dossiers des membres, dons en nature, reçus dans l'espace membre,
-- statistiques de fréquentation du site
-- ─────────────────────────────────────────────────────────────

-- ── Pièces du dossier d'un membre (internes à l'association) ──
create table public.member_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 2 and 160),
  category text not null default 'autre'
    check (category in ('identite', 'adhesion', 'paiement', 'courrier', 'photo', 'attestation', 'autre')),
  notes text check (char_length(notes) <= 1000),
  file_path text not null,
  file_name text not null,
  size_bytes bigint,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index member_files_user_idx on public.member_files (user_id, created_at desc);

alter table public.member_files enable row level security;

create policy "dossiers : lecture par le secrétariat"
  on public.member_files for select to authenticated
  using (public.has_permission('members.view'));

create policy "dossiers : ajout par le secrétariat"
  on public.member_files for insert to authenticated
  with check (public.has_permission('members.manage') or public.has_permission('documents.manage'));

create policy "dossiers : suppression par le secrétariat"
  on public.member_files for delete to authenticated
  using (public.has_permission('members.manage') or public.has_permission('documents.manage'));

grant select, insert, delete on public.member_files to authenticated;
grant all on public.member_files to service_role;

-- Fichiers rangés dans « documents/dossiers/<membre>/… » (bucket privé).
create policy "dossiers : dépôt des pièces"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'documents' and (storage.foldername(name))[1] = 'dossiers'
    and (public.has_permission('members.manage') or public.has_permission('documents.manage'))
  );

-- ── Dons en nature (objets, matériel, vivres…) ──
alter table public.donation_declarations drop constraint if exists donation_declarations_kind_check;
alter table public.donation_declarations add constraint donation_declarations_kind_check check (kind in ('don', 'cotisation', 'nature'));
alter table public.donation_declarations drop constraint if exists donation_declarations_amount_fcfa_check;
alter table public.donation_declarations add constraint donation_declarations_amount_fcfa_check check (amount_fcfa >= 0 and (kind = 'nature' or amount_fcfa > 0));
alter table public.donation_declarations drop constraint if exists donation_declarations_method_check;
alter table public.donation_declarations add constraint donation_declarations_method_check
  check (method in ('T-Money', 'Moov Money (Flooz)', 'Virement', 'Espèces', 'Chèque', 'Carte bancaire', 'En nature'));
alter table public.donation_declarations
  add column if not exists item_description text check (char_length(item_description) <= 2000),
  add column if not exists receipt_sent_at timestamptz;

-- Chaque personne voit ses propres dons et reçus (compte ou adresse e-mail du compte).
create policy "dons : lecture des siens"
  on public.donation_declarations for select to authenticated
  using (
    user_id = auth.uid()
    or lower(email) = (select lower(p.email) from public.profiles p where p.id = auth.uid())
  );

-- ── Statistiques de fréquentation (sans adresse IP ni donnée personnelle des visiteurs) ──
create table public.page_views (
  id bigint generated always as identity primary key,
  path text not null check (char_length(path) <= 300),
  -- Identifiant aléatoire conservé par le navigateur (aucune donnée personnelle).
  visitor text not null check (char_length(visitor) <= 64),
  user_id uuid references public.profiles (id) on delete set null,
  referrer text check (char_length(referrer) <= 200),
  device text check (device in ('mobile', 'ordinateur', 'tablette')),
  created_at timestamptz not null default now()
);

create index page_views_created_idx on public.page_views (created_at desc);
create index page_views_user_idx on public.page_views (user_id, created_at desc) where user_id is not null;

alter table public.page_views enable row level security;
grant all on public.page_views to service_role;

/** Enregistre une page vue (appelé par le site ; anonyme ou connecté). */
create function public.record_page_view(p_path text, p_visitor text, p_referrer text default null, p_device text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_path is null or p_path !~ '^/' or p_path ~ '^/(admin|api|auth|impression)' then return; end if;
  if p_visitor is null or p_visitor !~ '^[a-zA-Z0-9-]{8,64}$' then return; end if;
  insert into public.page_views (path, visitor, user_id, referrer, device)
  values (left(p_path, 300), p_visitor, auth.uid(), nullif(left(p_referrer, 200), ''),
          case when p_device in ('mobile', 'ordinateur', 'tablette') then p_device end);
end;
$$;

grant execute on function public.record_page_view(text, text, text, text) to anon, authenticated;

/** Statistiques agrégées pour le tableau de bord. */
create function public.site_stats(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  since timestamptz := now() - make_interval(days => greatest(1, least(p_days, 365)));
begin
  if not public.has_permission('dashboard.view') then
    raise exception 'Accès réservé au bureau.';
  end if;
  return jsonb_build_object(
    'views', (select count(*) from public.page_views where created_at >= since),
    'visitors', (select count(distinct visitor) from public.page_views where created_at >= since),
    'members', (select count(distinct user_id) from public.page_views where created_at >= since and user_id is not null),
    'today', (select count(distinct visitor) from public.page_views where created_at >= date_trunc('day', now())),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', d, 'views', v, 'visitors', u) order by d)
      from (select date_trunc('day', created_at)::date d, count(*) v, count(distinct visitor) u
            from public.page_views where created_at >= since group by 1) t), '[]'),
    'pages', coalesce((
      select jsonb_agg(jsonb_build_object('path', path, 'views', v) order by v desc)
      from (select path, count(*) v from public.page_views where created_at >= since group by 1 order by 2 desc limit 15) t), '[]'),
    'referrers', coalesce((
      select jsonb_agg(jsonb_build_object('source', r, 'views', v) order by v desc)
      from (select coalesce(referrer, 'Accès direct') r, count(*) v from public.page_views where created_at >= since group by 1 order by 2 desc limit 8) t), '[]'),
    'devices', coalesce((
      select jsonb_agg(jsonb_build_object('device', coalesce(device, 'inconnu'), 'visitors', u))
      from (select device, count(distinct visitor) u from public.page_views where created_at >= since group by 1) t), '[]'),
    'active_members', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'email', email, 'last_seen', last_seen, 'views', v) order by last_seen desc)
      from (select p.id, coalesce(nullif(trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')), ''), p.full_name, p.email) name,
                   p.email, max(pv.created_at) last_seen, count(*) v
            from public.page_views pv join public.profiles p on p.id = pv.user_id
            where pv.created_at >= since group by p.id order by 4 desc limit 50) t), '[]')
  );
end;
$$;

grant execute on function public.site_stats(integer) to authenticated;
