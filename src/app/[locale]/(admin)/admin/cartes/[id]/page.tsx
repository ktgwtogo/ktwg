import { ArrowLeft, Printer, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { DocumentUpload } from "@/components/admin/document-upload";
import { CardActions, CardEditor, IssueCardButton } from "@/components/cards/card-admin-ui";
import { MemberCardView } from "@/components/cards/member-card-view";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { Link, redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { cardPhotoUrl, cardQrSvg, cardStatus, cardStatusLabels, verifyUrl } from "@/lib/cards/card";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Fiche d'une carte : aperçu recto/verso, corrections, impression, envoi, révocation. */
export default async function CardPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  if (!staff.can("cards.manage") && !staff.can("members.view")) return <Forbidden />;

  const { data: card } = await staff.supabase.from("member_cards").select("*").eq("id", id).maybeSingle();
  if (!card) notFound();
  const [{ data: person }, photo, qr] = await Promise.all([
    staff.supabase.from("profiles").select("email, membership_status").eq("id", card.user_id).maybeSingle(),
    cardPhotoUrl(staff.supabase, card.photo_path),
    cardQrSvg(card.verification_token),
  ]);
  const status = cardStatus(card);
  const [label, tone] = cardStatusLabels[status];
  const active = card.status === "active" && staff.can("cards.manage");

  return (
    <>
      <Link href="/admin/cartes" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden className="size-4" />
        Cartes de membre
      </Link>
      <PageHeading title={`Carte ${card.card_number}`} description={`${card.full_name} · émise le ${formatDate(card.issued_at, locale)}`}>
        <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", tone)}>{label}</span>
      </PageHeading>

      <section className="flex flex-col items-center gap-5 rounded-3xl bg-muted/60 p-6">
        <MemberCardView card={card} photoUrl={photo} qrSvg={qr} />
        <div className="flex flex-wrap justify-center gap-3">
          <a href={`/impression/carte/${card.id}`} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-white dark:bg-white dark:text-ink">
            <Printer aria-hidden className="size-4" />
            Imprimer / télécharger en PDF
          </a>
          <a href={verifyUrl(card.verification_token)} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-border bg-card px-5 text-sm font-semibold">
            <ShieldCheck aria-hidden className="size-4" />
            Tester la vérification
          </a>
          <Link href={`/admin/membres/${card.user_id}`} className="inline-flex h-11 items-center rounded-xl border-2 border-border bg-card px-5 text-sm font-semibold">
            Dossier du membre
          </Link>
        </div>
        {card.sent_at && <p className="text-sm text-muted-foreground">Envoyée au membre le {formatDate(card.sent_at, locale)}.</p>}
      </section>

      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <section className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
          <h2 className="mb-4 text-xl font-bold">Données de la carte</h2>
          <CardEditor
            cardId={card.id}
            userId={card.user_id}
            active={active}
            initial={{
              card_number: card.card_number,
              full_name: card.full_name,
              membership_type: card.membership_type,
              birth_date: card.birth_date ?? "",
              nationality: card.nationality ?? "",
              issued_at: card.issued_at,
              expires_at: card.expires_at,
              notes: card.notes ?? "",
              photo_path: card.photo_path,
            }}
          />
        </section>
        <section className="flex h-fit flex-col gap-4 rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
          <h2 className="text-xl font-bold">Actions</h2>
          {staff.can("cards.manage") ? (
            <>
              <CardActions cardId={card.id} email={person?.email ?? ""} active={card.status === "active"} />
              {person?.membership_status === "validee" && (
                <div className="border-t pt-4">
                  <p className="mb-2 text-sm text-muted-foreground">Carte perdue ou renouvellement : une nouvelle carte remplace celle-ci (nouveau QR code).</p>
                  <IssueCardButton userId={card.user_id} label="Émettre une nouvelle carte" />
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">La gestion des cartes est réservée au responsable des cartes.</p>
          )}
        </section>
      </div>

      {staff.can("documents.manage") && (
        <section className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
          <h2 className="mb-1 text-xl font-bold">Envoyer un document ou un message au titulaire</h2>
          <p className="mb-4 text-sm text-muted-foreground">Déposé dans son espace membre et envoyé à {person?.email}.</p>
          <DocumentUpload presidency={staff.presidency} recipient={{ id: card.user_id, label: `${card.full_name} (${person?.email ?? ""})` }} />
        </section>
      )}
    </>
  );
}
