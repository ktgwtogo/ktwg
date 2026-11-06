import { T } from "@/components/edit/editable";
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
        <h2><T s="mentions-legales">{"Éditeur du site"}</T></h2>
        <p>
          <strong><T s="mentions-legales">{"KommTogoGehWeiter Togo (KTGW Togo)"}</T></strong><T s="mentions-legales">{", organisation non gouvernementale."}</T><br />
          <strong><T s="mentions-legales">{"Président-Fondateur :"}</T></strong>{" "}<T s="mentions-legales">{"Monsieur Blaise-Pascal D'ALMEIDA"}</T><br />
          <strong><T s="mentions-legales">{"Siège National :"}</T></strong> {togo.address.street}, {togo.address.district}, {togo.address.city} – {togo.address.country}
          <br /><T s="mentions-legales">{"Téléphone :"}</T>{" "}{togo.phones.map((p) => p.display).join(" · ")}
          <br /><T s="mentions-legales">{"E-mail :"}</T>{" "}<a href={`mailto:${togo.email}`}>{togo.email}</a>
        </p>
        <p className="mt-3 rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10">
          <strong><T s="mentions-legales">{"Directeur de la publication :"}</T></strong>{" "}<T s="mentions-legales">{"Monsieur Blaise-Pascal D'ALMEIDA, Président-Fondateur de KTGW."}</T></p>
      </section>
      <section>
        <h2><T s="mentions-legales">{"Association partenaire en Allemagne"}</T></h2>
        <p>
          {germany.name}, {germany.city}<T s="mentions-legales">{". Téléphone :"}</T>{" "}{germany.phone.display}<T s="mentions-legales">{". E-mail :"}</T>{" "}<a href={`mailto:${germany.email}`}>{germany.email}</a><T s="mentions-legales">{". Site :"}</T>{" "}<a href={germany.website}><T s="mentions-legales">{"kommtogogehweiter.de"}</T></a>.
        </p>
      </section>
      <section>
        <h2><T s="mentions-legales">{"Hébergement"}</T></h2>
        <p><T s="mentions-legales">{"Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (vercel.com). Les données des formulaires seront hébergées par Supabase, sur des serveurs situés dans l'Union européenne (Francfort)."}</T></p>
      </section>
      <section>
        <h2><T s="mentions-legales">{"Propriété intellectuelle"}</T></h2>
        <p><T s="mentions-legales">{"Les textes, photographies, logos et éléments graphiques de ce site sont la propriété de KTGW Togo ou de ses partenaires. Toute reproduction sans autorisation écrite préalable est interdite. Les logos des partenaires sont utilisés avec leur accord."}</T></p>
      </section>
      <section>
        <h2><T s="mentions-legales">{"Responsabilité"}</T></h2>
        <p><T s="mentions-legales">{"KTGW Togo s'efforce de publier des informations exactes et à jour, mais ne peut garantir l'absence d'erreur. Les liens vers des sites externes n'engagent pas la responsabilité de l'association quant à leur contenu."}</T></p>
      </section>
    </LegalPage>
  );
}
