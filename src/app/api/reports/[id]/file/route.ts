import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Pièce jointe d'un rapport : droits vérifiés par RLS, puis URL signée de 60 secondes. */
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: report } = await supabase.from("reports").select("file_path, file_name").eq("id", id).maybeSingle();
  if (!report?.file_path) return new NextResponse("Fichier introuvable ou accès refusé.", { status: 404 });
  const { data } = await createAdminClient().storage.from("documents").createSignedUrl(report.file_path, 60, { download: report.file_name ?? true });
  if (!data) return new NextResponse("Fichier indisponible.", { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
