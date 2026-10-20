-- ─────────────────────────────────────────────────────────────
-- KTGW Togo — rôles, profils et fonctions d'autorisation
-- Rôles : member (compte Google) < editor < admin < super_admin.
-- « staff » = editor et au-dessus (accès à /admin).
-- ─────────────────────────────────────────────────────────────

create type public.user_role as enum ('member', 'editor', 'admin', 'super_admin');

/** Met à jour `updated_at` à chaque modification. */
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Un profil par compte connecté (créé automatiquement à l''inscription).';

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

/**
 * Invitations : une adresse listée ici reçoit ce rôle dès sa première connexion.
 * Le premier super administrateur (SUPER_ADMIN_EMAIL) est ajouté ici.
 */
create table public.role_invitations (
  email text primary key check (email = lower(email)),
  role public.user_role not null,
  invited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ── Fonctions d'autorisation (utilisées par les politiques RLS) ──

create function public.my_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.my_role() in ('editor', 'admin', 'super_admin'), false);
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.my_role() in ('admin', 'super_admin'), false);
$$;

-- ── Création automatique du profil à l'inscription ──

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  invited public.user_role;
begin
  delete from public.role_invitations
  where email = lower(new.email)
  returning role into invited;

  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(invited, 'member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Garde-fou : personne ne s'attribue un rôle lui-même ──

create function public.guard_profile_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.id := old.id;
  new.email := old.email;
  new.created_at := old.created_at;

  -- auth.uid() est nul pour le service_role et l'éditeur SQL : changement autorisé.
  if new.role is distinct from old.role and auth.uid() is not null then
    if not public.is_admin() then
      raise exception 'Seul un administrateur peut modifier un rôle.';
    end if;
    if 'super_admin' in (new.role, old.role) and public.my_role() <> 'super_admin' then
      raise exception 'Seul un super administrateur peut attribuer ou retirer ce rôle.';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_guard
  before update on public.profiles
  for each row execute function public.guard_profile_changes();

-- ── Sécurité (RLS) ──

alter table public.profiles enable row level security;
alter table public.role_invitations enable row level security;

create policy "profil : lecture de soi ou par l'équipe"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff());

create policy "profil : modification de soi ou par un admin"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "profil : suppression par un admin"
  on public.profiles for delete to authenticated
  using (public.is_admin());

create policy "invitations : gérées par les admins"
  on public.role_invitations for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.role_invitations to authenticated;
grant all on public.profiles, public.role_invitations to service_role;
grant execute on function public.my_role(), public.is_staff(), public.is_admin() to anon, authenticated;
