import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/admin/records-ui";
import { MemberCardView } from "@/components/cards/member-card-view";
import { redirect } from "@/i18n/navigation";
import { cardPhotoUrl, cardQrSvg } from "@/lib/cards/card";
import { getMember } from "@/lib/member/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Carte de membre", robots: { index: false } };

/**
 * Carte de membre imprimable (recto et verso au format carte bancaire).
 * Accès : le ou la titulaire, ou l'équipe autorisée (RLS sur member_cards et la photo).
 */
export default async function PrintCardPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const member = await getMember();
  if (!member) return redirect({ href: "/connexion", locale });

  const { data: card } = await member.supabase.from("member_cards").select("*").eq("id", id).maybeSingle();
  if (!card || card.status !== "active") notFound();
  const [photo, qr] = await Promise.all([cardPhotoUrl(member.supabase, card.photo_path), cardQrSvg(card.verification_token)]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-muted p-6 print:block print:bg-white print:p-[10mm]">
      <style>{"@page { size: A4; margin: 0 } @media print { html, body { background: white } }"}</style>
      <MemberCardView card={card} photoUrl={photo} qrSvg={qr} />
      <div className="flex flex-col items-center gap-2 print:hidden">
        <PrintButton />
        <p className="max-w-md text-center text-sm text-muted-foreground">
          Choisissez « Enregistrer au format PDF » pour la télécharger. Pour une carte rigide, imprimez sur papier cartonné et découpez recto et verso.
        </p>
      </div>
    </main>
  );
}
