-- ─────────────────────────────────────────────────────────────
-- KTGW Togo — envois aux membres : documents, statuts, règlements, annonces,
-- événements, publicités… déposés dans l'espace membre et envoyés par e-mail.
-- ─────────────────────────────────────────────────────────────

alter table public.documents
  add column category text not null default 'document'
    check (category in ('document', 'statuts', 'reglement', 'convocation', 'compte-rendu', 'annonce', 'evenement', 'publicite', 'information')),
  add column body text check (char_length(body) <= 10000),
  add column emailed_count integer not null default 0,
  alter column file_path drop not null,
  alter column file_name drop not null;

-- Nouveau public « accounts » : tous les comptes inscrits (membres validés ou non).
alter table public.documents drop constraint documents_audience_check;
alter table public.documents add constraint documents_audience_check check (audience in ('members', 'user', 'accounts'));

-- Un envoi sans pièce jointe doit au moins contenir un message.
alter table public.documents add constraint documents_content_check check (file_path is not null or coalesce(body, '') <> '');

drop policy "documents : lecture par les destinataires ou le secrétariat" on public.documents;
create policy "documents : lecture par les destinataires ou le secrétariat"
  on public.documents for select to authenticated
  using (
    public.has_permission('documents.manage')
    or recipient_id = auth.uid()
    or audience = 'accounts'
    or (audience = 'members' and public.is_validated_member())
  );

create or replace function public.on_document_published()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  label text := case new.category
    when 'statuts' then 'Statuts'
    when 'reglement' then 'Règlement'
    when 'convocation' then 'Convocation'
    when 'compte-rendu' then 'Compte rendu'
    when 'annonce' then 'Annonce'
    when 'evenement' then 'Événement'
    when 'publicite' then 'À découvrir'
    when 'information' then 'Information'
    else 'Nouveau document'
  end;
begin
  insert into public.notifications (user_id, title, body, link)
  select p.id, label || ' : ' || new.title, coalesce(new.description, ''), '/mon-espace/documents'
  from public.profiles p
  where (new.audience = 'user' and p.id = new.recipient_id)
     or (new.audience = 'members' and p.membership_status = 'validee')
     or (new.audience = 'accounts' and p.is_active);
  return new;
end;
$$;

revoke execute on function public.on_document_published() from public, anon, authenticated;
