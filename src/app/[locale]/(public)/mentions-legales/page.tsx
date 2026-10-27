import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/shared/legal-page";
import { getSiteConfig } from "@/lib/site/settings";

export const metadata: Metadata = { title: "Mentions légales", robots: { index: false } };

export default async function LegalNoticePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { togo, germany } = await getSiteConfig();

  return (
    <LegalPage title="Mentions légales" updated="octobre 2026">
      <section>
        <h2>Éditeur du site</h2>
        <p>
          <strong>KommTogoGehWeiter Togo (KTGW Togo)</strong>, organisation non gouvernementale.
          <br />
          <strong>Président-Fondateur :</strong> Monsieur Blaise-Pascal D&apos;ALMEIDA
          <br />
          <strong>Siège National :</strong> {togo.address.street}, {togo.address.district}, {togo.address.city} – {togo.address.country}
          <br />
          Téléphone : {togo.phones.map((p) => p.display).join(" · ")}
          <br />
          E-mail : <a href={`mailto:${togo.email}`}>{togo.email}</a>
        </p>
        <p className="mt-3 rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10">
          <strong>Directeur de la publication :</strong> Monsieur Blaise-Pascal D&apos;ALMEIDA, Président-Fondateur de KTGW.
        </p>
      </section>
      <section>
        <h2>Association partenaire en Allemagne</h2>
        <p>
          {germany.name}, {germany.city}. Téléphone : {germany.phone.display}. E-mail : <a href={`mailto:${germany.email}`}>{germany.email}</a>.
          Site : <a href={germany.website}>kommtogogehweiter.de</a>.
        </p>
      </section>
      <section>
        <h2>Hébergement</h2>
        <p>
          Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (vercel.com). Les données des formulaires
          seront hébergées par Supabase, sur des serveurs situés dans l&apos;Union européenne (Francfort).
        </p>
      </section>
      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          Les textes, photographies, logos et éléments graphiques de ce site sont la propriété de KTGW Togo ou de ses partenaires. Toute reproduction
          sans autorisation écrite préalable est interdite. Les logos des partenaires sont utilisés avec leur accord.
        </p>
      </section>
      <section>
        <h2>Responsabilité</h2>
        <p>
          KTGW Togo s&apos;efforce de publier des informations exactes et à jour, mais ne peut garantir l&apos;absence d&apos;erreur. Les liens vers des
          sites externes n&apos;engagent pas la responsabilité de l&apos;association quant à leur contenu.
        </p>
      </section>
    </LegalPage>
  );
}
