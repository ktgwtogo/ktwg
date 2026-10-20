import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Liens envoyés par e-mail : /api/newsletter?action=confirm|unsubscribe&token=…
 * Le jeton (UUID aléatoire, propre à chaque abonné·e) tient lieu d'authentification.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get("action");
  const token = searchParams.get("token") ?? "";
  const done = (status: string) => NextResponse.redirect(new URL(`/?newsletter=${status}`, request.url));

  if (!UUID.test(token) || (action !== "confirm" && action !== "unsubscribe")) return done("invalide");

  const now = new Date().toISOString();
  const { data, error } = await createAdminClient()
    .from("newsletter_subscribers")
    .update(action === "confirm" ? { confirmed_at: now, unsubscribed_at: null } : { unsubscribed_at: now })
    .eq("token", token)
    .select("id");

  if (error || !data?.length) return done("invalide");
  return done(action === "confirm" ? "confirmee" : "desinscrit");
}
