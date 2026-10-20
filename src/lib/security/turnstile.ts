import "server-only";

/**
 * Vérifie un jeton Cloudflare Turnstile.
 * Sans TURNSTILE_SECRET_KEY (développement, ou clé pas encore créée), la vérification est
 * ignorée : le champ piège et la limitation d'envois restent actifs.
 */
export async function verifyTurnstile(token: string | undefined, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (error) {
    console.error("[turnstile] vérification impossible", error);
    return false;
  }
}
