-- ─────────────────────────────────────────────────────────────
-- KTGW Togo — demandes reçues par les formulaires publics
-- Reprend les schémas zod de src/lib/validations/forms.ts.
--
-- Aucune écriture anonyme : les formulaires passent par une Server Action
-- (Phase 6) qui vérifie Turnstile puis insère avec la clé service_role.
-- L'équipe lit et traite les demandes ; un membre connecté voit les siennes.
-- ─────────────────────────────────────────────────────────────

create type public.submission_status as enum ('nouveau', 'en_cours', 'traite', 'archive');

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  country text not null,
  subject text not null,
  message text not null check (char_length(message) <= 4000),
  status public.submission_status not null default 'nouveau',
  admin_notes text,
  user_id uuid references public.profiles (id) on delete set null,
  locale text not null default 'fr',
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.partnership_requests (
  id uuid primary key default gen_random_uuid(),
  partner_type text not null,
  organization text not null,
  country text not null,
  website text,
  contact_name text not null,
  contact_role text,
  email text not null,
  phone text,
  interests text[] not null default '{}',
  contributions text[] not null default '{}',
  budget text not null,
  message text not null check (char_length(message) <= 4000),
  status public.submission_status not null default 'nouveau',
  admin_notes text,
  user_id uuid references public.profiles (id) on delete set null,
  locale text not null default 'fr',
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  organization text,
  seats integer not null default 1 check (seats between 1 and 10),
  needs text,
  status public.submission_status not null default 'nouveau',
  admin_notes text,
  user_id uuid references public.profiles (id) on delete set null,
  locale text not null default 'fr',
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, email)
);

create table public.engagement_applications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('Bénévolat', 'Adhésion')),
  name text not null,
  email text not null,
  phone text,
  country text not null,
  profile text not null,
  skills text,
  availability text[] not null default '{}',
  message text,
  status public.submission_status not null default 'nouveau',
  admin_notes text,
  user_id uuid references public.profiles (id) on delete set null,
  locale text not null default 'fr',
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.training_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age integer not null check (age between 14 and 40),
  city text not null,
  phone text not null,
  email text,
  level text not null,
  track text not null,
  boarding boolean not null default false,
  motivation text,
  status public.submission_status not null default 'nouveau',
  admin_notes text,
  user_id uuid references public.profiles (id) on delete set null,
  locale text not null default 'fr',
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.donation_declarations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  amount_fcfa bigint not null check (amount_fcfa > 0),
  method text not null check (method in ('T-Money', 'Moov Money (Flooz)', 'Virement', 'Espèces')),
  frequency text not null check (frequency in ('Ponctuel', 'Mensuel')),
  project text,
  reference text,
  status public.submission_status not null default 'nouveau',
  admin_notes text,
  user_id uuid references public.profiles (id) on delete set null,
  locale text not null default 'fr',
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  token uuid not null default gen_random_uuid() unique,
  locale text not null default 'fr',
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index event_registrations_event_idx on public.event_registrations (event_id);

do $$
declare
  t text;
begin
  foreach t in array array[
    'contact_messages', 'partnership_requests', 'event_registrations',
    'engagement_applications', 'training_applications', 'donation_declarations',
    'newsletter_subscribers'
  ] loop
    execute format(
      'create trigger %1$s_updated_at before update on public.%1$I
         for each row execute function public.set_updated_at()', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create index %1$s_created_at_idx on public.%1$I (created_at desc)', t);
    execute format(
      'create policy "lecture par l''équipe" on public.%I
         for select to authenticated using (public.is_staff())', t);
    execute format(
      'create policy "traitement par l''équipe" on public.%I
         for update to authenticated using (public.is_staff()) with check (public.is_staff())', t);
    execute format(
      'create policy "suppression par un admin" on public.%I
         for delete to authenticated using (public.is_admin())', t);
    execute format('grant select, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    if t <> 'newsletter_subscribers' then
      execute format('create index %1$s_status_idx on public.%1$I (status)', t);
    end if;
  end loop;
end;
$$;

-- Un membre connecté retrouve ses propres demandes dans /mon-espace.
do $$
declare
  t text;
begin
  foreach t in array array[
    'contact_messages', 'partnership_requests', 'event_registrations',
    'engagement_applications', 'training_applications', 'donation_declarations'
  ] loop
    execute format(
      'create policy "lecture de ses propres demandes" on public.%I
         for select to authenticated using (user_id = auth.uid())', t);
  end loop;
end;
$$;

/** Places réservées pour un événement (affichage public de la jauge). */
create function public.event_seats_taken(p_event_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(seats), 0)::integer
  from public.event_registrations
  where event_id = p_event_id and status <> 'archive';
$$;

grant execute on function public.event_seats_taken(uuid) to anon, authenticated;
