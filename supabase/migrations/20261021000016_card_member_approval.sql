-- ─────────────────────────────────────────────────────────────
-- KTGW Togo — cartes : contrôle par le bureau, puis accord du membre avant téléchargement
-- 1. La carte créée reste interne (le membre ne la voit pas) tant qu'elle n'est pas transmise.
-- 2. Le bureau la transmet (e-mail ou espace membre) pour vérification.
-- 3. Le membre confirme ou demande une correction ; une fois confirmée, il peut la télécharger.
-- ─────────────────────────────────────────────────────────────

alter table public.member_cards
  add column if not exists member_approved_at timestamptz,
  add column if not exists member_feedback text check (char_length(member_feedback) <= 1000),
  add column if not exists feedback_at timestamptz;

drop policy if exists "cartes : lecture de la sienne ou par le secrétariat" on public.member_cards;
create policy "cartes : lecture de la sienne (une fois transmise) ou par le secrétariat"
  on public.member_cards for select to authenticated
  using (
    (user_id = auth.uid() and sent_at is not null)
    or public.has_permission('members.view')
    or public.has_permission('cards.manage')
  );

/** Réponse du membre à la carte transmise : accord final ou demande de correction. */
create or replace function public.respond_to_my_card(p_card uuid, p_approve boolean, p_comment text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_number text;
begin
  update public.member_cards
  set member_approved_at = case when p_approve then now() else null end,
      member_feedback = case when p_approve then null else left(nullif(trim(coalesce(p_comment, '')), ''), 1000) end,
      feedback_at = now()
  where id = p_card and user_id = auth.uid() and status = 'active' and sent_at is not null
  returning card_number into v_number;

  if v_number is null then
    raise exception 'Carte introuvable.';
  end if;
  if not p_approve and nullif(trim(coalesce(p_comment, '')), '') is null then
    raise exception 'Indiquez la correction souhaitée.';
  end if;

  insert into public.audit_log (actor_id, action, entity, entity_id, details)
  values (auth.uid(), case when p_approve then 'carte.approuvee_membre' else 'carte.correction_demandee' end,
          'member_cards', p_card::text, jsonb_build_object('title', v_number, 'comment', p_comment));
end;
$$;

revoke execute on function public.respond_to_my_card(uuid, boolean, text) from public, anon;
grant execute on function public.respond_to_my_card(uuid, boolean, text) to authenticated;
