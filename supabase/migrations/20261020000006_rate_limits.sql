-- ─────────────────────────────────────────────────────────────
-- KTGW Togo — limitation du nombre d'envois de formulaires
-- La clé est un hachage (IP + formulaire) calculé côté serveur :
-- aucune adresse IP n'est stockée en clair.
-- ─────────────────────────────────────────────────────────────

create table public.rate_limits (
  key text not null,
  hit_at timestamptz not null default now()
);

create index rate_limits_key_hit_at_idx on public.rate_limits (key, hit_at desc);

-- RLS sans politique : table invisible pour anon et authenticated.
alter table public.rate_limits enable row level security;
grant all on public.rate_limits to service_role;

/**
 * Enregistre une tentative et indique si elle est autorisée
 * (au plus `p_max` tentatives sur `p_window`). Purge au passage les entrées périmées.
 */
create function public.rate_limit_hit(p_key text, p_max integer, p_window interval)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent integer;
begin
  delete from public.rate_limits where hit_at < now() - interval '1 day';
  select count(*) into recent from public.rate_limits where key = p_key and hit_at > now() - p_window;
  if recent >= p_max then
    return false;
  end if;
  insert into public.rate_limits (key) values (p_key);
  return true;
end;
$$;

revoke execute on function public.rate_limit_hit(text, integer, interval) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, interval) to service_role;

