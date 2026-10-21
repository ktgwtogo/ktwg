import { CheckCircle2, Clock, Download, IdCard } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CardApproval } from "@/components/cards/card-member-ui";
import { MemberCardView } from "@/components/cards/member-card-view";
import { Link, redirect } from "@/i18n/navigation";
import { cardPhotoUrl, cardQrSvg } from "@/lib/cards/card";
import { getMember } from "@/lib/member/session";

export const metadata: Metadata = {
  title: "Ma carte de membre",
  robots: { index: false },
};

/**
 * Carte de membre de la personne connectée, visible une fois transmise par le bureau.
 * Le membre la vérifie et donne son accord ; le téléchargement s'ouvre ensuite.
 */
export default async function MyCardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const member = await getMember();
  if (!member) return redirect({ href: "/connexion", locale });

  // RLS : la carte n'est visible qu'une fois transmise par le bureau (sent_at renseigné).
  const { data: card } = await member.supabase.from("member_cards").select("*").eq("user_id", member.user.id).eq("status", "active").maybeSingle();

  if (!card) {
    return (
      <section className="flex flex-col items-center gap-3 rounded-3xl bg-card p-10 text-center shadow-soft ring-1 ring-foreground/5">
        <IdCard aria-hidden className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">Pas encore de carte de membre</h2>
        <p className="max-w-md text-muted-foreground">
          {member.profile.membership_status === "validee"
            ? "Votre adhésion est validée : votre carte est en cours de préparation par le secrétariat. Vous serez prévenu·e dès qu'elle sera prête."
            : "La carte de membre est délivrée une fois votre adhésion validée."}
        </p>
        {member.profile.membership_status !== "validee" && (
          <Link href="/mon-espace/adhesion" className="font-semibold text-ktgw-red underline underline-offset-2">
            Voir mon adhésion
          </Link>
        )}
      </section>
    );
  }

  const [photo, qr] = await Promise.all([cardPhotoUrl(member.supabase, card.photo_path), cardQrSvg(card.verification_token)]);
  return (
    <section className="flex flex-col items-center gap-6 rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 sm:p-10">
      <h2 className="text-2xl font-bold">Ma carte de membre</h2>
      <div className="max-w-full overflow-x-auto">
        <MemberCardView card={card} photoUrl={photo} qrSvg={qr} />
      </div>
      {card.member_approved_at ? (
        <>
          <p className="flex items-center gap-2 text-sm font-semibold text-ktgw-green-strong">
            <CheckCircle2 aria-hidden className="size-5" />
            Carte confirmée : vous pouvez la télécharger.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={`/impression/carte/${card.id}?format=carte&telecharger=1`}
              target="_blank"
              rel="noopener"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-ktgw-green-strong px-6 font-semibold text-white"
            >
              <Download aria-hidden className="size-5" />
              Télécharger (9 × 5,5 cm)
            </a>
            <a
              href={`/impression/carte/${card.id}?telecharger=1`}
              target="_blank"
              rel="noopener"
              className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-border px-6 font-semibold"
            >
              <Download aria-hidden className="size-5" />
              Planche A4 à imprimer
            </a>
          </div>
        </>
      ) : card.member_feedback ? (
        <div className="flex max-w-xl flex-col gap-2 rounded-2xl bg-muted p-5 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <Clock aria-hidden className="size-5 text-ktgw-orange" />
            Correction demandée : le secrétariat met votre carte à jour.
          </p>
          <p className="whitespace-pre-line text-muted-foreground">« {card.member_feedback} »</p>
          <p className="text-muted-foreground">Vous serez prévenu·e dès que la carte corrigée vous sera transmise.</p>
        </div>
      ) : (
        <CardApproval cardId={card.id} />
      )}
    </section>
  );
}
