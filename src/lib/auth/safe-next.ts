/** Chemin de retour après connexion : uniquement un chemin interne (pas de redirection ouverte). */
export function safeNext(next: string | null | undefined, fallback = "/mon-espace") {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}
