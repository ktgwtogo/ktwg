-- ─────────────────────────────────────────────────────────────
-- KTGW Togo — cartes de membre (numéro, photo, QR code vérifiable, validité 5 ans)
-- ─────────────────────────────────────────────────────────────

create table public.member_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  card_number text not null unique check (char_length(card_number) between 3 and 40),
  full_name text not null check (char_length(full_name) between 2 and 120),
  membership_type public.membership_type not null,
  birth_date date,
  nationality text check (char_length(nationality) <= 80),
  photo_path text,
  issued_at date not null default current_date,
  expires_at date not null,
  -- Jeton secret imprimé dans le QR code : la page publique /verifier/<jeton> confirme la carte.
  verification_token uuid not null unique default gen_random_uuid(),
  status text not null default 'active' check (status in ('active', 'revoquee')),
  notes text check (char_length(notes) <= 1000),
  sent_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at > issued_at)
);

-- Une seule carte active par membre.
create unique index member_cards_one_active on public.member_cards (user_id) where status = 'active';
create index member_cards_user_idx on public.member_cards (user_id, created_at desc);

create trigger member_cards_updated_at
  before update on public.member_cards
  for each row execute function public.set_updated_at();

alter table public.member_cards enable row level security;

create policy "cartes : lecture de la sienne ou par le secrétariat"
  on public.member_cards for select to authenticated
  using (user_id = auth.uid() or public.has_permission('members.view') or public.has_permission('cards.manage'));

create policy "cartes : gestion par le responsable des cartes"
  on public.member_cards for all to authenticated
  using (public.has_permission('cards.manage'))
  with check (public.has_permission('cards.manage'));

grant select, insert, update, delete on public.member_cards to authenticated;
grant all on public.member_cards to service_role;

/** Vérification publique d'une carte par son QR code (sans donnée sensible). */
create function public.verify_member_card(p_token uuid)
returns table (full_name text, card_number text, membership_type public.membership_type, issued_at date, expires_at date, status text)
language sql
stable
security definer
set search_path = ''
as $$
  select c.full_name, c.card_number, c.membership_type, c.issued_at, c.expires_at,
         case when c.status = 'revoquee' then 'revoquee' when c.expires_at < current_date then 'expiree' else 'valide' end
  from public.member_cards c
  where c.verification_token = p_token;
$$;

grant execute on function public.verify_member_card(uuid) to anon, authenticated;

-- Le responsable des cartes peut remplacer la photo d'un membre (dossier du membre).
create policy "avatars : dépôt par le responsable des cartes"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and public.has_permission('cards.manage'));
create policy "avatars : lecture par le responsable des cartes"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and public.has_permission('cards.manage'));

-- Nouvelle permission « cards.manage » confiée par défaut au secrétariat.
update public.positions
set permissions = array_append(permissions, 'cards.manage')
where id = 'secretaire' and not ('cards.manage' = any (permissions));
