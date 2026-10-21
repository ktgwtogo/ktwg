import { UserRound } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { membershipTypeLabels } from "@/lib/validations/member";

type CardData = {
  card_number: string;
  full_name: string;
  membership_type: keyof typeof membershipTypeLabels;
  birth_date: string | null;
  nationality: string | null;
  issued_at: string;
  expires_at: string;
};

const dmy = (iso: string) => iso.split("-").reverse().join("/");

/**
 * Carte de membre au format carte de visite 9 × 5,5 cm : recto (identité, photo) et verso (QR code, validité).
 * Les dimensions en mm donnent la taille exacte à l'impression. Disposition :
 * - `sheet` : recto et verso côte à côte ou l'un sous l'autre (planche A4) ;
 * - `pages` : une page par face, au format de la carte (imprimante à cartes, imprimeur) ;
 * - `stack` : recto au-dessus du verso, sur une seule page.
 */
export function MemberCardView({
  card,
  photoUrl,
  qrSvg,
  layout = "sheet",
}: {
  card: CardData;
  photoUrl: string | null;
  qrSvg: string;
  layout?: "sheet" | "pages" | "stack";
}) {
  const face =
    layout === "pages"
      ? "print:rounded-none print:ring-0"
      : layout === "stack"
        ? "print:rounded-none print:break-inside-avoid"
        : "print:break-inside-avoid";
  const wrapper = {
    sheet: "flex flex-wrap justify-center gap-6 print:gap-[6mm]",
    pages: "flex flex-col items-center gap-6 print:block",
    stack: "flex flex-col items-center gap-6 print:gap-[5mm]",
  }[layout];
  return (
    <div className={wrapper}>
      {/* Recto */}
      <article
        aria-label={`Carte de membre de ${card.full_name} (recto)`}
        className={`relative flex h-[55mm] w-[90mm] shrink-0 overflow-hidden rounded-[3mm] bg-gradient-to-br from-ktgw-green-dark to-ktgw-green-strong text-white shadow-2xl print:shadow-none ${face} ${layout === "pages" ? "print:break-after-page" : ""}`}
      >
        <div className="absolute inset-x-0 bottom-0 h-[2.2mm] bg-gradient-to-r from-ktgw-red via-ktgw-sun to-ktgw-green" />
        <div className="flex w-[28mm] shrink-0 flex-col items-center justify-center gap-[1.5mm] bg-white/10 p-[2.5mm]">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-[31mm] w-[24mm] rounded-[1.5mm] object-cover ring-2 ring-white/70" />
          ) : (
            <span className="flex h-[31mm] w-[24mm] items-center justify-center rounded-[1.5mm] bg-white/20">
              <UserRound aria-hidden className="size-10" />
            </span>
          )}
          <span className="text-center text-[2.3mm] leading-tight font-bold tracking-wide">{card.card_number}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between p-[3mm] pb-[4mm]">
          <div className="flex items-center gap-[2mm]">
            <span className="rounded-[1mm] bg-white p-[0.8mm]">
              <Logo className="h-[8mm] w-auto" />
            </span>
            <div className="leading-tight">
              <p className="text-[2.8mm] font-extrabold">KTGW Togo</p>
              <p className="text-[1.9mm] text-white/80">Carte de membre</p>
            </div>
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[3.8mm] font-extrabold">{card.full_name}</p>
            <p className="mt-[0.8mm] inline-block rounded-full bg-ktgw-sun px-[2mm] py-[0.4mm] text-[2.2mm] font-bold text-ink">
              {membershipTypeLabels[card.membership_type]}
            </p>
          </div>
          <div className="text-[2mm] leading-snug text-white/85">
            {card.birth_date && (
              <p>
                Né·e le {dmy(card.birth_date)}
                {card.nationality ? ` · ${card.nationality}` : ""}
              </p>
            )}
            <p>
              Émise le {dmy(card.issued_at)} · <strong className="text-white">Valable jusqu&apos;au {dmy(card.expires_at)}</strong>
            </p>
          </div>
        </div>
      </article>

      {/* Verso */}
      <article
        aria-label="Carte de membre (verso)"
        className={`relative flex h-[55mm] w-[90mm] shrink-0 items-center gap-[4mm] overflow-hidden rounded-[3mm] bg-white p-[4mm] text-ink shadow-2xl ring-1 ring-black/10 print:shadow-none ${face}`}
      >
        <div className="absolute inset-x-0 top-0 h-[2.2mm] bg-gradient-to-r from-ktgw-red via-ktgw-sun to-ktgw-green" />
        <div className="size-[35mm] shrink-0 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
        <div className="flex min-w-0 flex-col gap-[1.5mm] text-[2.1mm] leading-snug">
          <p className="text-[2.8mm] font-extrabold text-ktgw-green-dark">Carte vérifiable</p>
          <p>Scannez le QR code pour vérifier la validité de cette carte auprès de KTGW Togo.</p>
          <p className="font-semibold">N° {card.card_number}</p>
          <p className="text-neutral-600">KommTogoGehWeiter Togo — ONG d&apos;éducation et de formation · www.ktgw.tg</p>
          <p className="text-neutral-500">Carte personnelle et incessible. En cas de perte, prévenez l&apos;association.</p>
        </div>
      </article>
    </div>
  );
}
