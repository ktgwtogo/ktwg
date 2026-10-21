import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Pièce du dossier d'un membre : droits vérifiés par RLS (secrétariat), puis URL signée de 60 s.
 * « ?voir=1 » ouvre le fichier dans le navigateur au lieu de le télécharger.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: file } = await supabase.from("member_files").select("file_path, file_name").eq("id", id).maybeSingle();
  if (!file) return new NextResponse("Pièce introuvable ou accès refusé.", { status: 404 });
  const view = request.nextUrl.searchParams.get("voir") === "1";
  const { data } = await createAdminClient()
    .storage.from("documents")
    .createSignedUrl(file.file_path, 60, view ? undefined : { download: file.file_name });
  if (!data) return new NextResponse("Fichier indisponible.", { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
