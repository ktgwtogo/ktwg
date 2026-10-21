import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Téléchargement d'un document officiel.
 * Les droits sont vérifiés par RLS (lecture de la ligne avec la session de la personne),
 * puis une URL signée valable 60 secondes est générée.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/connexion?next=/mon-espace/documents", request.url));

  const { data: doc } = await supabase.from("documents").select("file_path, file_name").eq("id", id).maybeSingle();
  if (!doc?.file_path) return new NextResponse("Document introuvable ou accès refusé.", { status: 404 });

  const { data } = await createAdminClient().storage.from("documents").createSignedUrl(doc.file_path, 60, { download: doc.file_name ?? true });
  if (!data) return new NextResponse("Document indisponible.", { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
