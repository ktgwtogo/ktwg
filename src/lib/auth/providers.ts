import "server-only";

/** Modes de connexion activés dans Supabase (vérifiés toutes les 5 minutes). */
export async function authProviders(): Promise<{ google: boolean; email: boolean }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const none = { google: false, email: false };
  if (!url || !key) return none;
  try {
    const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key }, next: { revalidate: 300 } });
    if (!res.ok) return none;
    const settings = (await res.json()) as { external?: { google?: boolean; email?: boolean }; disable_signup?: boolean };
    return { google: settings.external?.google === true, email: settings.external?.email === true };
  } catch {
    return none;
  }
}
