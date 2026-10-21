import { Bitcoin, ExternalLink, Gift, Globe2, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { FaWhatsapp } from "react-icons/fa6";
import { DonationDeclarationForm, DonationInKindForm } from "@/components/forms/other-forms";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { mobileMoneyPaymentUrl, whatsappUrl } from "@/config/site";
import { getSiteConfig } from "@/lib/site/settings";
import { images } from "@/content/images";
import { getProject } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Faire un don",
  description:
    "Soutenez la formation des jeunes au Togo : don en ligne, montant libre, par Mobile Money (Yas, Moov Money au Togo et dans d'autres pays) ou en cryptomonnaie, ou par virement via kommTOGOgehweiter e.V.",
};

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ projet?: string }> };

export default async function DonatePage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { projet } = await searchParams;
  const project = projet ? await getProject(projet) : undefined;
  const siteConfig = await getSiteConfig();
  const phone = siteConfig.togo.phones[0];

  return (
    <>
      <PageHeader
        image={images.plantingWoman}
        eyebrow="Faire un don"
        title={
          <>
            Chaque centime pour l&apos;éducation <span className="font-accent text-ktgw-sun italic">compte</span>
          </>
        }
        description="Votre don finance des formations, l'internat des apprenties et l'équipement des ateliers. Merci pour votre générosité !"
        breadcrumbs={[{ label: "S'engager", href: "/s-engager" }, { label: "Faire un don" }]}
      />

      <Section>
        {project && (
          <p className="mb-10 rounded-2xl border-l-4 border-ktgw-sun bg-accent p-5 font-medium">
            Vous soutenez le projet : <strong>{project.title}</strong>
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Depuis le Togo */}
          <section aria-labelledby="togo-title" className="flex flex-col gap-5 rounded-3xl bg-card p-8 shadow-soft ring-1 ring-foreground/5">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-ktgw-sun text-ink">
              <Smartphone aria-hidden className="size-7" />
            </span>
            <h2 id="togo-title" className="text-2xl font-bold">
              Paiement en ligne : Mobile Money et cryptomonnaie
            </h2>
            <ul aria-label="Moyens de paiement disponibles" className="flex flex-col gap-2">
              <li className="flex items-center gap-3 rounded-2xl bg-ktgw-sun/20 p-3 ring-1 ring-ktgw-sun/50">
                <span aria-hidden className="text-2xl">🇹🇬</span>
                <span className="flex-1">
                  <span className="block font-bold">Togo</span>
                  <span className="text-sm text-muted-foreground">Yas · Moov Money</span>
                </span>
              </li>
              <li className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
                <Globe2 aria-hidden className="size-6 shrink-0 text-ktgw-green-strong" />
                <span className="flex-1">
                  <span className="block font-semibold">Autres pays</span>
                  <span className="text-sm text-muted-foreground">Mobile Money : choisissez votre pays et votre opérateur sur la page de paiement</span>
                </span>
              </li>
              <li className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
                <Bitcoin aria-hidden className="size-6 shrink-0 text-ktgw-orange" />
                <span className="flex-1">
                  <span className="block font-semibold">Cryptomonnaie</span>
                  <span className="text-sm text-muted-foreground">Paiement en cryptomonnaie depuis le monde entier</span>
                </span>
              </li>
            </ul>
            <ol className="flex flex-col gap-3 text-muted-foreground">
              {[
                "Cliquez sur « Payer maintenant » : la page de paiement sécurisée SasPay de KTGW Togo s'ouvre.",
                "Saisissez le montant de votre choix, puis votre pays et votre moyen de paiement (Yas, Moov Money, autre opérateur ou cryptomonnaie).",
                "Votre paiement nous parvient automatiquement. Pour recevoir un reçu à votre nom, déclarez votre don ci-dessous avec le même numéro de téléphone.",
              ].map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ktgw-red-strong text-sm font-bold text-white">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <div className="mt-auto flex flex-col gap-3">
              <a
                href={mobileMoneyPaymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-ktgw-red-strong px-6 text-lg font-bold text-white shadow-soft hover:opacity-90 sm:w-fit"
              >
                <Wallet aria-hidden className="size-6" />
                Payer maintenant
                <ExternalLink aria-hidden className="size-4" />
              </a>
              <p className="text-sm font-semibold">Montant libre · Mobile Money · Cryptomonnaie</p>
              <a
                href={whatsappUrl(phone.e164)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                <FaWhatsapp aria-hidden className="size-4 text-[#25D366]" />
                Une question ? Écrivez-nous sur WhatsApp
              </a>
            </div>
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck aria-hidden className="size-4 shrink-0 text-ktgw-green" />
              Paiement sécurisé par SasPay, au profit de KTGW Togo.
            </p>
          </section>

          {/* Depuis l'international */}
          <section aria-labelledby="intl-title" className="flex flex-col gap-5 rounded-3xl bg-ktgw-green-dark p-8 text-white shadow-soft">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-ktgw-sun">
              <Globe2 aria-hidden className="size-7" />
            </span>
            <h2 id="intl-title" className="text-2xl font-bold">
              Depuis l&apos;international
            </h2>
            <p className="leading-relaxed text-white/85">
              Depuis l&apos;Allemagne, la France ou tout autre pays, faites votre don par virement à l&apos;association mère{" "}
              <strong>kommTOGOgehweiter e.V.</strong> à Cologne. L&apos;association est reconnue d&apos;utilité publique en Allemagne, ce qui permet
              d&apos;obtenir un reçu fiscal (Spendenquittung).
            </p>
            <a
              href={siteConfig.germany.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex h-12 w-fit items-center gap-2 rounded-xl bg-ktgw-sun px-5 font-semibold text-ink hover:bg-ktgw-orange"
            >
              Donner via kommtogogehweiter.de
              <ExternalLink aria-hidden className="size-4" />
            </a>
            <p className="text-xs text-white/60">Le paiement en ligne par carte (Stripe, FedaPay, CinetPay) sera bientôt disponible directement sur ce site.</p>
          </section>
        </div>
      </Section>

      <Section tone="muted" aria-labelledby="declare-title">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <SectionTitle
              id="declare-title"
              eyebrow="Déclaration de don"
              title="Vous avez fait un don ? Dites-le-nous"
              description="Votre déclaration nous permet de vous remercier, de vous envoyer un reçu et d'affecter votre don au bon projet."
            />
            <div className="flex items-start gap-3 rounded-2xl bg-card p-5 shadow-soft ring-1 ring-foreground/5">
              <Gift aria-hidden className="size-6 shrink-0 text-ktgw-red" />
              <p className="text-sm text-muted-foreground">
                Vous préférez offrir du matériel (outils, ordinateurs, panneaux solaires, fournitures) ? Utilisez le formulaire « Don en nature » ci-dessous : un reçu officiel vous sera remis.
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 sm:p-10 lg:col-span-3">
            <DonationDeclarationForm project={project?.title} />
          </div>
        </div>
      </Section>

      <Section aria-labelledby="nature-title">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <SectionTitle
              id="nature-title"
              eyebrow="Don en nature"
              title="Offrir du matériel ou des fournitures"
              description="Outils, ordinateurs, matériel solaire, fournitures scolaires, vivres pour l'internat… Décrivez votre don : nous organisons la remise et vous envoyons un reçu officiel."
            />
          </div>
          <div className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 sm:p-10 lg:col-span-3">
            <DonationInKindForm project={project?.title} />
          </div>
        </div>
      </Section>
    </>
  );
}
