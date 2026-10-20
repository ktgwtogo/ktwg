-- ─────────────────────────────────────────────────────────────
-- KTGW Togo — adhésion, profil détaillé, notifications, documents
--
-- Parcours : inscription (Google ou e-mail) → profil à compléter →
-- demande d'adhésion (adhérent, membre, donateur) → décision d'un admin →
-- notification dans l'espace membre → accès aux documents officiels.
-- ─────────────────────────────────────────────────────────────

create type public.membership_type as enum ('adherent', 'membre', 'donateur');
create type public.membership_status as enum ('aucune', 'en_attente', 'validee', 'refusee');

-- ── Profil détaillé ──

alter table public.profiles
  add column civility text check (civility in ('Mme', 'M.', 'Autre')),
  add column first_name text,
  add column last_name text,
  add column birth_date date,
  add column nationality text,
  add column profession text,
  add column organization text,
  add column phone text,
  add column whatsapp text,
  add column address text,
  add column city text,
  add column country text,
  add column bio text check (char_length(bio) <= 2000),
  add column photo_path text,
  add column membership_status public.membership_status not null default 'aucune',
  add column membership_type public.membership_type,
  add column member_number text unique,
  add column member_since date;

-- Le garde-fou empêche aussi un·e membre de modifier son statut d'adhésion.
create or replace function public.guard_profile_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.id := old.id;
  new.email := old.email;
  new.created_at := old.created_at;

  -- auth.uid() est nul pour le service_role et l'éditeur SQL : changement autorisé.
  -- ktgw.trusted : posé le temps d'une mise à jour par une fonction interne (dépôt de demande).
  if auth.uid() is not null and not public.is_admin() and current_setting('ktgw.trusted', true) is distinct from 'on' then
    if new.role is distinct from old.role then
      raise exception 'Seul un administrateur peut modifier un rôle.';
    end if;
    new.membership_status := old.membership_status;
    new.membership_type := old.membership_type;
    new.member_number := old.member_number;
    new.member_since := old.member_since;
  end if;
  if new.role is distinct from old.role and auth.uid() is not null
     and 'super_admin' in (new.role, old.role) and public.my_role() <> 'super_admin' then
    raise exception 'Seul un super administrateur peut attribuer ou retirer ce rôle.';
  end if;
  return new;
end;
$$;

-- Numéro de membre attribué à la validation : KTGW-2026-0001
create sequence public.member_number_seq;

create function public.assign_member_number()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.membership_status = 'validee' and new.member_number is null then
    new.member_number := 'KTGW-' || extract(year from now())::int || '-' || lpad(nextval('public.member_number_seq')::text, 4, '0');
    new.member_since := coalesce(new.member_since, current_date);
  end if;
  return new;
end;
$$;

create trigger profiles_member_number
  before update on public.profiles
  for each row execute function public.assign_member_number();

-- ── Demandes d'adhésion ──

create table public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.membership_type not null,
  motivation text not null check (char_length(motivation) between 20 and 3000),
  interests text[] not null default '{}',
  skills text,
  availability text,
  contribution text,
  referral text,
  statutes_accepted_at timestamptz not null default now(),
  status public.membership_status not null default 'en_attente' check (status <> 'aucune'),
  decision_note text,
  decided_by uuid references public.profiles (id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Une seule demande en attente à la fois.
create unique index membership_applications_one_pending on public.membership_applications (user_id) where status = 'en_attente';
create index membership_applications_status_idx on public.membership_applications (status, created_at desc);

create trigger membership_applications_updated_at
  before update on public.membership_applications
  for each row execute function public.set_updated_at();

alter table public.membership_applications enable row level security;

create policy "adhésion : dépôt par la personne connectée"
  on public.membership_applications for insert to authenticated
  with check (user_id = auth.uid() and status = 'en_attente' and decided_by is null and decided_at is null);

create policy "adhésion : lecture de la sienne ou par l'équipe"
  on public.membership_applications for select to authenticated
  using (user_id = auth.uid() or public.is_staff());

create policy "adhésion : décision par un admin"
  on public.membership_applications for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select, insert, update on public.membership_applications to authenticated;
grant all on public.membership_applications to service_role;

-- Statut « en attente » reporté sur le profil au dépôt de la demande.
create function public.on_membership_application()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform set_config('ktgw.trusted', 'on', true);
  update public.profiles
  set membership_status = 'en_attente', membership_type = coalesce(membership_type, new.type)
  where id = new.user_id and membership_status <> 'validee';
  perform set_config('ktgw.trusted', 'off', true);
  return new;
end;
$$;

create trigger membership_applications_after_insert
  after insert on public.membership_applications
  for each row execute function public.on_membership_application();

-- ── Notifications de l'espace membre ──

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null default '',
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications : lecture des siennes"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());

create policy "notifications : marquer comme lues"
  on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "notifications : envoi par l'équipe"
  on public.notifications for insert to authenticated
  with check (public.is_staff());

grant select, insert, update (read_at) on public.notifications to authenticated;
grant all on public.notifications to service_role;

/**
 * Décision sur une demande d'adhésion (admin uniquement), en une transaction :
 * demande, profil et notification. Renvoie l'id du ou de la demandeur·se.
 */
create function public.decide_membership(p_application_id uuid, p_approve boolean, p_note text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  app public.membership_applications;
  labels jsonb := '{"adherent": "adhérent·e", "membre": "membre", "donateur": "donateur·rice"}';
begin
  if not public.is_admin() then
    raise exception 'Réservé aux administrateurs.';
  end if;

  update public.membership_applications
  set status = case when p_approve then 'validee' else 'refusee' end::public.membership_status,
      decision_note = nullif(trim(p_note), ''),
      decided_by = auth.uid(),
      decided_at = now()
  where id = p_application_id and status = 'en_attente'
  returning * into app;

  if app.id is null then
    raise exception 'Demande introuvable ou déjà traitée.';
  end if;

  if p_approve then
    update public.profiles set membership_status = 'validee', membership_type = app.type where id = app.user_id;
  else
    update public.profiles set membership_status = 'refusee'
    where id = app.user_id and membership_status <> 'validee';
  end if;

  insert into public.notifications (user_id, title, body, link)
  values (
    app.user_id,
    case when p_approve then 'Votre adhésion est validée !' else 'Réponse à votre demande d''adhésion' end,
    case
      when p_approve then 'Bienvenue dans l''association en tant que ' || (labels ->> app.type::text) || '. Vous avez maintenant accès aux documents réservés aux membres.'
      else 'Votre demande n''a pas pu être acceptée pour le moment.'
    end || coalesce(E'\n\nMessage de l''association : ' || nullif(trim(p_note), ''), ''),
    '/mon-espace'
  );
  return app.user_id;
end;
$$;

revoke execute on function public.decide_membership(uuid, boolean, text) from public, anon;
grant execute on function public.decide_membership(uuid, boolean, text) to authenticated;

-- ── Documents officiels ──

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_path text not null,
  file_name text not null,
  -- 'members' : tous les membres validés ; 'user' : une seule personne (recipient_id)
  audience text not null check (audience in ('members', 'user')),
  recipient_id uuid references public.profiles (id) on delete cascade,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check ((audience = 'user') = (recipient_id is not null))
);

create index documents_created_at_idx on public.documents (created_at desc);

alter table public.documents enable row level security;

create function public.is_validated_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select membership_status = 'validee' from public.profiles where id = auth.uid()), false);
$$;

grant execute on function public.is_validated_member() to authenticated;

create policy "documents : lecture par les destinataires ou l'équipe"
  on public.documents for select to authenticated
  using (
    public.is_staff()
    or recipient_id = auth.uid()
    or (audience = 'members' and public.is_validated_member())
  );

create policy "documents : publication par un admin"
  on public.documents for insert to authenticated
  with check (public.is_admin());

create policy "documents : suppression par un admin"
  on public.documents for delete to authenticated
  using (public.is_admin());

grant select, insert, delete on public.documents to authenticated;
grant all on public.documents to service_role;

-- Notification automatique des destinataires d'un nouveau document.
create function public.on_document_published()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (user_id, title, body, link)
  select p.id, 'Nouveau document : ' || new.title, coalesce(new.description, ''), '/mon-espace/documents'
  from public.profiles p
  where (new.audience = 'user' and p.id = new.recipient_id)
     or (new.audience = 'members' and p.membership_status = 'validee');
  return new;
end;
$$;

create trigger documents_after_insert
  after insert on public.documents
  for each row execute function public.on_document_published();

revoke execute on function public.on_document_published() from public, anon, authenticated;
revoke execute on function public.on_membership_application() from public, anon, authenticated;
revoke execute on function public.assign_member_number() from public, anon, authenticated;

-- ── Stockage privé : photos de profil et documents ──

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 3145728, array['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 20971520, array[
    'application/pdf', 'image/jpeg', 'image/png',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]);

-- Photo : chacun·e dépose dans son dossier « <id>/… » ; l'équipe peut tout voir.
create policy "avatars : dépôt dans son dossier"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars : remplacement dans son dossier"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars : suppression dans son dossier"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars : lecture de la sienne ou par l'équipe"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff()));

-- Documents : dépôt et suppression par un admin ; le téléchargement passe par
-- une URL signée générée côté serveur après vérification des droits.
create policy "documents : dépôt par un admin"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and public.is_admin());

create policy "documents : suppression par un admin"
  on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and public.is_admin());

create policy "documents : lecture par l'équipe"
  on storage.objects for select to authenticated
  using (bucket_id = 'documents' and public.is_staff());
