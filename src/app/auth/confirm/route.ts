import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/safe-next";
import { createClient } from "@/lib/supabase/server";

/**
 * Liens des e-mails Supabase (confirmation d'inscription, mot de passe oublié) au format
 * token_hash : fonctionne même si le lien est ouvert sur un autre appareil.
 * Modèle d'e-mail : {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const fallback = type === "recovery" ? "/mon-espace/mot-de-passe" : "/mon-espace/profil";
  const next = safeNext(searchParams.get("next"), fallback);

  if (tokenHash && type) {
    const { error } = await (await createClient()).auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/connexion?erreur=lien`);
}
