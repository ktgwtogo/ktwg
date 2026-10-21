import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AutoPrint, PrintButton } from "@/components/admin/records-ui";
import { MemberCardView } from "@/components/cards/member-card-view";
import { redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { cardPhotoUrl, cardQrSvg } from "@/lib/cards/card";
import { getMember } from "@/lib/member/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Carte de membre", robots: { index: false } };

/**
 * Carte de membre imprimable, 9 × 5,5 cm.
 * - `?format=carte` : recto et verso sur deux pages de 9 × 5,5 cm (imprimante à cartes, PDF) ;
 * - par défaut : planche A4 avec recto et verso à découper.
 * Accès : l'équipe autorisée à tout moment (contrôle) ; le ou la titulaire après son accord final.
 */
export default async function PrintCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ format?: string; telecharger?: string }>;
}) {
  const { locale, id } = await params;
  const { format, telecharger } = await searchParams;
  const member = await getMember();
  if (!member) return redirect({ href: "/connexion", locale });
  const staff = await getStaff();
  const team = Boolean(staff && (staff.can("cards.manage") || staff.can("members.view")));

  const { data: card } = await member.supabase.from("member_cards").select("*").eq("id", id).maybeSingle();
  if (!card || card.status !== "active") notFound();
  if (!team && !card.member_approved_at) return redirect({ href: "/mon-espace/carte", locale });
  const [photo, qr] = await Promise.all([cardPhotoUrl(member.supabase, card.photo_path), cardQrSvg(card.verification_token)]);
  const cardSize = format === "carte";
  const other = cardSize ? `/impression/carte/${card.id}` : `/impression/carte/${card.id}?format=carte`;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-muted p-6 print:block print:min-h-0 print:bg-white print:p-0">
      <style>
        {cardSize
          ? "@page { size: 90mm 55mm; margin: 0 } @media print { html, body { background: white; margin: 0 } }"
          : "@page { size: A4; margin: 15mm } @media print { html, body { background: white } }"}
      </style>
      {telecharger && <AutoPrint />}
      <MemberCardView card={card} photoUrl={photo} qrSvg={qr} pages={cardSize} />
      <div className="flex flex-col items-center gap-3 print:hidden">
        <PrintButton label={cardSize ? "Télécharger en PDF (9 × 5,5 cm)" : "Télécharger la planche A4 (PDF)"} />
        <p className="max-w-md text-center text-sm text-muted-foreground">
          Dans la fenêtre d&apos;impression, choisissez « Enregistrer au format PDF », taille réelle (100 %), sans marges ajoutées.
          {cardSize
            ? " Chaque page fait exactement 9 × 5,5 cm : page 1 recto, page 2 verso."
            : " Imprimez sur papier cartonné et découpez recto et verso (9 × 5,5 cm chacun)."}
        </p>
        <a href={other} className="text-sm font-semibold text-ktgw-red underline underline-offset-2">
          {cardSize ? "Plutôt une planche A4 à découper" : "Plutôt le format carte 9 × 5,5 cm (une page par face)"}
        </a>
      </div>
    </main>
  );
}
