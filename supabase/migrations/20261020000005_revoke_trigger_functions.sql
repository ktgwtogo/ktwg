-- Les fonctions de déclencheur ne doivent pas être appelables via l'API (/rest/v1/rpc).
-- my_role / is_staff / is_admin restent exécutables : les politiques RLS les appellent
-- avec les droits du visiteur, et elles ne révèlent que son propre rôle.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.guard_profile_changes() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
