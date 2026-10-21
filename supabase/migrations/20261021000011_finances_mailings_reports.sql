-- ─────────────────────────────────────────────────────────────
-- KTGW Togo — étapes D, E, F : finances, e-mails groupés, rapports d'activité
-- ─────────────────────────────────────────────────────────────

-- ── D. Dons et cotisations ──
-- Les déclarations du site et les saisies de la trésorerie partagent la même table.
alter table public.donation_declarations
  add column kind text not null default 'don' check (kind in ('don', 'cotisation')),
  add column receipt_number text unique,
  add column received_at date,
  add column recorded_by uuid references public.profiles (id) on delete set null;

create sequence public.receipt_number_seq;

/** Numéro de reçu attribué quand le paiement est confirmé (statut « traite ») : REC-2026-0001. */
create function public.assign_receipt_number()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'traite' and new.receipt_number is null then
    new.receipt_number := 'REC-' || extract(year from now())::int || '-' || lpad(nextval('public.receipt_number_seq')::text, 4, '0');
    new.received_at := coalesce(new.received_at, current_date);
  end if;
  return new;
end;
$$;

create trigger donation_declarations_receipt
  before insert or update on public.donation_declarations
  for each row execute function public.assign_receipt_number();

revoke execute on function public.assign_receipt_number() from public, anon, authenticated;

-- La trésorerie saisit aussi les paiements reçus directement (espèces, virement).
create policy "dons : saisie par la trésorerie"
  on public.donation_declarations for insert to authenticated
  with check (public.has_permission('donations.manage'));
grant insert on public.donation_declarations to authenticated;

-- ── E. E-mails groupés et newsletter ──
create table public.mailings (
  id uuid primary key default gen_random_uuid(),
  subject text not null check (char_length(subject) <= 200),
  body text not null check (char_length(body) <= 20000),
  audience text not null,
  recipients_count integer not null default 0,
  status text not null default 'en_attente' check (status in ('en_attente', 'envoye', 'refuse', 'echec')),
  created_by uuid references public.profiles (id) on delete set null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.mailings enable row level security;

create policy "envois : lecture par la communication"
  on public.mailings for select to authenticated
  using (public.has_permission('newsletter.manage'));

grant select on public.mailings to authenticated;
grant all on public.mailings to service_role;

-- ── F. Rapports d'activité ──
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 200),
  period text not null default '' check (char_length(period) <= 80),
  category text not null default 'activite' check (category in ('activite', 'financier', 'projet', 'reunion', 'autre')),
  summary text not null default '' check (char_length(summary) <= 1000),
  body text not null default '' check (char_length(body) <= 50000),
  file_path text,
  file_name text,
  -- Postes destinataires ; vide = tout le bureau.
  audience text[] not null default '{}',
  status text not null default 'brouillon' check (status in ('brouillon', 'soumis', 'valide', 'refuse')),
  author_id uuid references public.profiles (id) on delete set null,
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reports_status_idx on public.reports (status, created_at desc);

create trigger reports_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

alter table public.reports enable row level security;

/** Poste de la personne connectée (null si aucun). */
create function public.my_position()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select position_id from public.profiles where id = auth.uid();
$$;
grant execute on function public.my_position() to authenticated;

create policy "rapports : lecture par l'auteur, la présidence et les destinataires"
  on public.reports for select to authenticated
  using (
    author_id = auth.uid()
    or public.is_admin()
    or (status = 'valide' and public.has_permission('reports.view')
        and (cardinality(audience) = 0 or public.my_position() = any (audience)))
  );

create policy "rapports : rédaction par les auteurs"
  on public.reports for insert to authenticated
  with check (author_id = auth.uid() and status in ('brouillon', 'soumis') and public.has_permission('reports.write'));

create policy "rapports : modification de ses brouillons"
  on public.reports for update to authenticated
  using (author_id = auth.uid() and status in ('brouillon', 'refuse'))
  with check (author_id = auth.uid() and status in ('brouillon', 'soumis'));

create policy "rapports : suppression de ses brouillons ou par la présidence"
  on public.reports for delete to authenticated
  using ((author_id = auth.uid() and status = 'brouillon') or public.is_admin());

grant select, insert, update, delete on public.reports to authenticated;
grant all on public.reports to service_role;

-- Pièces jointes des rapports : dossier « rapports/ » du bucket privé « documents ».
create policy "rapports : dépôt des pièces jointes"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = 'rapports' and public.has_permission('reports.write'));
