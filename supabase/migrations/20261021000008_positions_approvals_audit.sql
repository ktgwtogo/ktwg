-- ─────────────────────────────────────────────────────────────
-- KTGW Togo — postes du bureau, permissions, validations, journal
--
-- Présidence = rôles admin / super_admin : tous les droits, valide les publications.
-- Les autres membres du bureau ont un poste (position) qui regroupe des permissions.
-- Tout ce qui est public (pages, articles, newsletters, documents, rapports) passe par
-- une demande de validation (approval_requests) avant d'être effectif.
-- ─────────────────────────────────────────────────────────────

-- ── Postes ──

create table public.positions (
  id text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  name text not null,
  description text not null default '',
  permissions text[] not null default '{}',
  is_system boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger positions_updated_at
  before update on public.positions
  for each row execute function public.set_updated_at();

insert into public.positions (id, name, description, permissions, is_system, sort_order) values
  ('president', 'Président·e', 'Contrôle total : postes, comptes, validations, journal d''activité.', '{}', true, 0),
  ('secretaire', 'Secrétaire général·e', 'Adhésions, fichier des membres, documents officiels, procès-verbaux.',
    array['dashboard.view', 'members.view', 'members.manage', 'documents.manage', 'inbox.manage', 'reports.write', 'reports.view'], true, 1),
  ('tresorier', 'Trésorier·ère', 'Dons, cotisations, reçus et rapports financiers.',
    array['dashboard.view', 'donations.manage', 'reports.write', 'reports.view'], true, 2),
  ('communication', 'Chargé·e de communication', 'Pages, menus, textes, images, actualités, événements, annonces, newsletter.',
    array['dashboard.view', 'content.manage', 'pages.manage', 'newsletter.manage', 'reports.write', 'reports.view'], true, 3),
  ('projets', 'Responsable des projets', 'Projets, formations, événements et inscriptions, rapports de terrain.',
    array['dashboard.view', 'projects.manage', 'reports.write', 'reports.view'], true, 4),
  ('bureau', 'Membre du bureau', 'Consultation du tableau de bord et des rapports validés.',
    array['dashboard.view', 'reports.view'], true, 5);

alter table public.profiles
  add column position_id text references public.positions (id) on delete set null,
  add column must_change_password boolean not null default false,
  add column is_active boolean not null default true;

/** Droit précis de la personne connectée. La présidence (admin, super_admin) a tous les droits. */
create function public.has_permission(p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select pr.is_active and (
       pr.role in ('admin', 'super_admin')
       or p_permission = any (coalesce(po.permissions, '{}'))
     )
     from public.profiles pr
     left join public.positions po on po.id = pr.position_id
     where pr.id = auth.uid()),
    false);
$$;

grant execute on function public.has_permission(text) to anon, authenticated;

-- Le garde-fou protège aussi le poste, le statut actif et l'obligation de changer de mot de passe.
create or replace function public.guard_profile_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.id := old.id;
  new.created_at := old.created_at;
  -- L'e-mail suit celui du compte (synchronisé par sync_profile_email), jamais saisi à la main.
  if current_setting('ktgw.trusted', true) is distinct from 'on' then
    new.email := old.email;
  end if;

  -- auth.uid() est nul pour le service_role et l'éditeur SQL : changement autorisé.
  -- ktgw.trusted : posé le temps d'une mise à jour par une fonction interne.
  if auth.uid() is not null and not public.is_admin() and current_setting('ktgw.trusted', true) is distinct from 'on' then
    if new.role is distinct from old.role or new.position_id is distinct from old.position_id or new.is_active is distinct from old.is_active then
      raise exception 'Seule la présidence peut modifier un rôle ou un poste.';
    end if;
    new.must_change_password := old.must_change_password;
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

/** Report de la nouvelle adresse dans le profil quand le changement d'e-mail est confirmé. */
create function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email and new.email is not null then
    perform set_config('ktgw.trusted', 'on', true);
    update public.profiles set email = lower(new.email) where id = new.id;
    perform set_config('ktgw.trusted', 'off', true);
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.sync_profile_email();

revoke execute on function public.sync_profile_email() from public, anon, authenticated;

alter table public.positions enable row level security;

create policy "postes : lecture par l'équipe"
  on public.positions for select to authenticated
  using (public.is_staff() or id = (select position_id from public.profiles where id = auth.uid()));

create policy "postes : gestion par la présidence"
  on public.positions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select, insert, update, delete on public.positions to authenticated;
grant all on public.positions to service_role;

-- ── Droits par domaine (remplacent « toute l'équipe ») ──

-- Profils : chacun le sien ; le fichier des membres pour members.view.
drop policy "profil : lecture de soi ou par l'équipe" on public.profiles;
create policy "profil : lecture de soi ou fichier des membres"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_permission('members.view'));

-- Adhésions
drop policy "adhésion : lecture de la sienne ou par l'équipe" on public.membership_applications;
create policy "adhésion : lecture de la sienne ou par le secrétariat"
  on public.membership_applications for select to authenticated
  using (user_id = auth.uid() or public.has_permission('members.view'));

drop policy "adhésion : décision par un admin" on public.membership_applications;
create policy "adhésion : décision par le secrétariat"
  on public.membership_applications for update to authenticated
  using (public.has_permission('members.manage')) with check (public.has_permission('members.manage'));

create or replace function public.decide_membership(p_application_id uuid, p_approve boolean, p_note text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  app public.membership_applications;
  labels jsonb := '{"adherent": "adhérent·e", "membre": "membre", "donateur": "donateur·rice"}';
begin
  if not public.has_permission('members.manage') then
    raise exception 'Réservé au secrétariat et à la présidence.';
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

  perform set_config('ktgw.trusted', 'on', true);
  if p_approve then
    update public.profiles set membership_status = 'validee', membership_type = app.type where id = app.user_id;
  else
    update public.profiles set membership_status = 'refusee'
    where id = app.user_id and membership_status <> 'validee';
  end if;
  perform set_config('ktgw.trusted', 'off', true);

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

-- Demandes reçues par les formulaires : chaque table à son responsable.
do $$
declare
  t text;
  perm text;
begin
  foreach t in array array[
    'contact_messages', 'partnership_requests', 'event_registrations',
    'engagement_applications', 'training_applications', 'donation_declarations', 'newsletter_subscribers'
  ] loop
    perm := case t
      when 'donation_declarations' then 'donations.manage'
      when 'event_registrations' then 'projects.manage'
      when 'training_applications' then 'projects.manage'
      when 'engagement_applications' then 'members.manage'
      when 'newsletter_subscribers' then 'newsletter.manage'
      else 'inbox.manage'
    end;
    execute format('drop policy "lecture par l''équipe" on public.%I', t);
    execute format('drop policy "traitement par l''équipe" on public.%I', t);
    execute format(
      'create policy "lecture par le responsable" on public.%I
         for select to authenticated using (public.has_permission(%L))', t, perm);
    execute format(
      'create policy "traitement par le responsable" on public.%I
         for update to authenticated using (public.has_permission(%L)) with check (public.has_permission(%L))', t, perm, perm);
  end loop;
end;
$$;

-- Contenus du site : écriture par la communication (projets et événements : responsable des projets aussi).
do $$
declare
  t text;
  perm text;
begin
  foreach t in array array['projects', 'posts', 'events', 'gallery_items', 'partners', 'testimonials'] loop
    perm := case when t in ('projects', 'events') then 'projects.manage' else 'content.manage' end;
    execute format('drop policy "lecture publique des contenus publiés" on public.%I', t);
    execute format('drop policy "ajout par l''équipe" on public.%I', t);
    execute format('drop policy "modification par l''équipe" on public.%I', t);
    execute format('drop policy "suppression par l''équipe" on public.%I', t);
    execute format(
      'create policy "lecture publique des contenus publiés" on public.%I
         for select to anon, authenticated
         using (published or public.has_permission(%L) or public.has_permission(''content.manage''))', t, perm);
    execute format(
      'create policy "écriture par le responsable" on public.%I
         for all to authenticated
         using (public.has_permission(%L) or public.has_permission(''content.manage''))
         with check (public.has_permission(%L) or public.has_permission(''content.manage''))', t, perm, perm);
  end loop;
end;
$$;

-- Médias du site : dépôt par la communication et les projets.
drop policy "media : dépôt par l'équipe" on storage.objects;
drop policy "media : modification par l'équipe" on storage.objects;
drop policy "media : suppression par l'équipe" on storage.objects;
create policy "media : dépôt par les responsables"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (public.has_permission('content.manage') or public.has_permission('projects.manage')));
create policy "media : modification par les responsables"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and (public.has_permission('content.manage') or public.has_permission('projects.manage')));
create policy "media : suppression par la présidence"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- Photos des membres : visibles par le secrétariat.
drop policy "avatars : lecture de la sienne ou par l'équipe" on storage.objects;
create policy "avatars : lecture de la sienne ou par le secrétariat"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_permission('members.view')));

-- Documents : le secrétariat dépose les fichiers ; la publication passe par la présidence.
drop policy "documents : dépôt par un admin" on storage.objects;
drop policy "documents : lecture par l'équipe" on storage.objects;
create policy "documents : dépôt par le secrétariat"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and public.has_permission('documents.manage'));
create policy "documents : lecture par le secrétariat"
  on storage.objects for select to authenticated
  using (bucket_id = 'documents' and public.has_permission('documents.manage'));

drop policy "documents : lecture par les destinataires ou l'équipe" on public.documents;
create policy "documents : lecture par les destinataires ou le secrétariat"
  on public.documents for select to authenticated
  using (
    public.has_permission('documents.manage')
    or recipient_id = auth.uid()
    or (audience = 'members' and public.is_validated_member())
  );

-- ── Demandes de validation adressées à la présidence ──

create type public.approval_status as enum ('en_attente', 'approuvee', 'rejetee');

create table public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  title text not null,
  summary text not null default '',
  payload jsonb not null default '{}',
  status public.approval_status not null default 'en_attente',
  requested_by uuid references public.profiles (id) on delete set null,
  decided_by uuid references public.profiles (id) on delete set null,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz not null default now()
);

create index approval_requests_status_idx on public.approval_requests (status, created_at desc);

alter table public.approval_requests enable row level security;

create policy "validations : lecture des siennes ou par la présidence"
  on public.approval_requests for select to authenticated
  using (requested_by = auth.uid() or public.is_admin());

grant select on public.approval_requests to authenticated;
grant all on public.approval_requests to service_role;

-- La présidence est prévenue dans son espace à chaque nouvelle demande.
create function public.on_approval_requested()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (user_id, title, body, link)
  select p.id, 'À valider : ' || new.title, new.summary, '/admin/validations'
  from public.profiles p
  where p.role in ('admin', 'super_admin') and p.is_active and p.id is distinct from new.requested_by;
  return new;
end;
$$;

create trigger approval_requests_after_insert
  after insert on public.approval_requests
  for each row execute function public.on_approval_requested();

revoke execute on function public.on_approval_requested() from public, anon, authenticated;

-- ── Journal d'activité (lecture : présidence uniquement ; écriture : serveur) ──

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity text not null default '',
  entity_id text,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index audit_log_created_at_idx on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;

create policy "journal : lecture par la présidence"
  on public.audit_log for select to authenticated
  using (public.is_admin());

grant select on public.audit_log to authenticated;
grant all on public.audit_log to service_role;

-- La personne qui préside actuellement reçoit le poste « president ».
update public.profiles set position_id = 'president' where role in ('admin', 'super_admin');
