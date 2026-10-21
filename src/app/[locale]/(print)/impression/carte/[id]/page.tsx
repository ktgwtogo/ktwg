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

/** Formats de téléchargement proposés. */
const formats = {
  carte: {
    label: "Carte de visite 9 × 5,5 cm",
    hint: "Format d'impression « business card » : chaque page fait exactement 9 × 5,5 cm (page 1 recto, page 2 verso). Pour un imprimeur ou une imprimante à cartes.",
    page: "@page { size: 90mm 55mm; margin: 0 }",
    layout: "pages",
  },
  duo: {
    label: "Recto + verso sur une page",
    hint: "Un seul PDF d'une page : le recto au-dessus du verso, chacun en 9 × 5,5 cm.",
    page: "@page { size: 100mm 130mm; margin: 5mm }",
    layout: "stack",
  },
  a4: {
    label: "Planche A4 à découper",
    hint: "Recto et verso (9 × 5,5 cm chacun) sur une feuille A4 : imprimez sur papier cartonné et découpez.",
    page: "@page { size: A4; margin: 15mm }",
    layout: "sheet",
  },
} as const;

type Format = keyof typeof formats;

/**
 * Carte de membre imprimable au format carte de visite 9 × 5,5 cm, en trois mises en page
 * (`?format=carte`, `duo` ou `a4`, par défaut). `?telecharger=1` ouvre directement la fenêtre PDF.
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
  const current: Format = format === "carte" || format === "duo" ? format : "a4";
  const f = formats[current];

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-muted p-6 print:block print:min-h-0 print:bg-white print:p-0">
      <style>{`${f.page} @media print { html, body { background: white; margin: 0 } }`}</style>
      {telecharger && <AutoPrint />}
      <nav aria-label="Format de téléchargement" className="flex flex-wrap justify-center gap-2 print:hidden">
        {(Object.keys(formats) as Format[]).map((k) => (
          <a
            key={k}
            href={`/impression/carte/${card.id}?format=${k}`}
            aria-current={k === current ? "page" : undefined}
            className={
              k === current
                ? "rounded-full bg-ktgw-green-strong px-4 py-2 text-sm font-semibold text-white"
                : "rounded-full bg-card px-4 py-2 text-sm font-semibold ring-1 ring-foreground/10 hover:ring-ktgw-green/40"
            }
          >
            {formats[k].label}
          </a>
        ))}
      </nav>
      <MemberCardView card={card} photoUrl={photo} qrSvg={qr} layout={f.layout} />
      <div className="flex flex-col items-center gap-3 print:hidden">
        <PrintButton label={`Télécharger en PDF : ${f.label.toLowerCase()}`} />
        <p className="max-w-md text-center text-sm text-muted-foreground">
          {f.hint} Dans la fenêtre d&apos;impression, choisissez « Enregistrer au format PDF », échelle 100 %, sans marges ajoutées.
        </p>
      </div>
    </main>
  );
}
