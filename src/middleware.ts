import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Middleware racine.
 * Phase 1 : détection / redirection de langue uniquement.
 * Phase 7 : ajout du rafraîchissement de session Supabase et de la
 * protection de /mon-espace (member+) et /admin (staff+).
 */
export default createMiddleware(routing);

export const config = {
  // Toutes les routes sauf API, fichiers internes Next.js et fichiers statiques
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
