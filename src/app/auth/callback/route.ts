import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/safe-next";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Retour de Google : échange le code contre une session, puis redirige. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (!code) return NextResponse.redirect(`${origin}/connexion?erreur=code`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(`${origin}/connexion?erreur=session`);

  // Premier super administrateur, désigné par SUPER_ADMIN_EMAIL.
  const superAdmin = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  if (superAdmin && data.user.email?.toLowerCase() === superAdmin) {
    await createAdminClient().from("profiles").update({ role: "super_admin" }).eq("id", data.user.id);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
