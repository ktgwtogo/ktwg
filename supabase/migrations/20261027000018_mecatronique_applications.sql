-- ─────────────────────────────────────────────────────────────
-- KTGW Togo — Extension candidatures mécatronique & pièces jointes
-- ─────────────────────────────────────────────────────────────

alter table public.training_applications
  add column if not exists has_bac boolean default false,
  add column if not exists bac_series text,
  add column if not exists bac_year text,
  add column if not exists gender text,
  add column if not exists diploma_bac text,
  add column if not exists id_card text,
  add column if not exists application_ref text;

comment on column public.training_applications.has_bac is 'Titulaire du BAC certifié (impératif pour Mécatronique)';
comment on column public.training_applications.diploma_bac is 'Référence ou fichier du diplôme ou relevé du BAC';
comment on column public.training_applications.id_card is 'Référence ou fichier de la pièce d''identité / acte';
comment on column public.training_applications.application_ref is 'Numéro de dossier officiel généré (ex: KTGW-MECA-2026-XXXX)';
