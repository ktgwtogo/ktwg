import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);
const localePrefix = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

/**
 * Middleware racine :
 * 1. langue (next-intl) ;
 * 2. rafraîchissement de la session Supabase, seulement si un cookie de session existe ;
 * 3. protection de /mon-espace (connecté·e) et /admin (équipe : editor et au-dessus).
 */
export default async function middleware(request: NextRequest) {
  const response = intl(request);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname } = request.nextUrl;
  const locale = pathname.match(localePrefix)?.[1];
  const path = pathname.replace(localePrefix, "") || "/";
  const isProtected = /^\/(mon-espace|admin)(\/|$)/.test(path);
  const hasSession = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));

  if (!url || !key || (!isProtected && !hasSession)) return response;

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isProtected) return response;

  const localized = (p: string) => new URL(`${locale ? `/${locale}` : ""}${p}`, request.url);
  if (!user) {
    const target = localized("/connexion");
    target.searchParams.set("next", pathname);
    return NextResponse.redirect(target);
  }
  if (path.startsWith("/admin")) {
    const { data: isStaff } = await supabase.rpc("is_staff");
    if (!isStaff) return NextResponse.redirect(localized("/mon-espace"));
  }
  return response;
}

export const config = {
  // Toutes les routes sauf API, retour de connexion, fichiers internes Next.js et fichiers statiques
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
