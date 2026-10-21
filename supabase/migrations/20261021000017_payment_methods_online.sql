-- ─────────────────────────────────────────────────────────────
-- KTGW Togo — moyens de paiement du lien SasPay : Mobile Money hors Togo et cryptomonnaie
-- ─────────────────────────────────────────────────────────────

alter table public.donation_declarations drop constraint if exists donation_declarations_method_check;
alter table public.donation_declarations add constraint donation_declarations_method_check
  check (method in ('T-Money', 'Moov Money (Flooz)', 'Mobile Money (autre pays)', 'Cryptomonnaie',
                    'Virement', 'Espèces', 'Chèque', 'Carte bancaire', 'En nature'));
