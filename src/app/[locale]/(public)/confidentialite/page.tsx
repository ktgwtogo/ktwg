import { T } from "@/components/edit/editable";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/shared/legal-page";
import { getSiteConfig } from "@/lib/site/settings";

export const metadata: Metadata = { title: "Politique de confidentialité", robots: { index: false } };

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { email } = (await getSiteConfig()).togo;

  return (
    <LegalPage title="Politique de confidentialité" updated="octobre 2026">
      <section>
        <p><T s="confidentialite">{"KTGW Togo attache une grande importance à la protection de vos données personnelles. Cette politique explique quelles données nous collectons, pourquoi, et quels sont vos droits, conformément au Règlement général sur la protection des données (RGPD) et à la loi togolaise n° 2019-014 relative à la protection des données à caractère personnel."}</T></p>
      </section>
      <section>
        <h2><T s="confidentialite">{"Données collectées"}</T></h2>
        <ul>
          <li><T s="confidentialite">{"Formulaires (contact, partenariat, inscription, bénévolat, candidature, don, newsletter) : nom, coordonnées et informations que vous saisissez."}</T></li>
          <li><T s="confidentialite">{"Espace membre (connexion Google) : nom, adresse e-mail et photo de profil fournis par Google."}</T></li>
          <li><T s="confidentialite">{"Statistiques de fréquentation anonymes (Vercel Analytics, sans cookie publicitaire)."}</T></li>
        </ul>
      </section>
      <section>
        <h2><T s="confidentialite">{"Finalités"}</T></h2>
        <ul>
          <li><T s="confidentialite">{"Répondre à vos demandes et assurer le suivi des partenariats, inscriptions, candidatures et dons."}</T></li>
          <li><T s="confidentialite">{"Vous envoyer la newsletter si vous l'avez demandé (désinscription possible à tout moment)."}</T></li>
          <li><T s="confidentialite">{"Établir des statistiques anonymes et rendre compte de nos actions aux bailleurs."}</T></li>
        </ul>
        <p><T s="confidentialite">{"Vos données ne sont jamais vendues ni cédées à des fins commerciales."}</T></p>
      </section>
      <section>
        <h2><T s="confidentialite">{"Durée de conservation"}</T></h2>
        <p><T s="confidentialite">{"Les demandes de contact sont conservées 3 ans après le dernier échange ; les données des donateurs et membres, le temps de la relation puis selon les obligations légales ; les inscriptions à la newsletter, jusqu'à votre désinscription."}</T></p>
      </section>
      <section>
        <h2><T s="confidentialite">{"Services tiers"}</T></h2>
        <ul>
          <li><T s="confidentialite">{"Google Maps : la carte n'est chargée qu'après votre clic sur « Afficher la carte ». Google peut alors déposer des cookies."}</T></li>
          <li><T s="confidentialite">{"WhatsApp et votre messagerie : lorsque vous choisissez d'envoyer un formulaire par ces moyens, le message transite par ces services."}</T></li>
          <li><T s="confidentialite">{"Hébergement : Vercel (site) et Supabase (base de données, Union européenne)."}</T></li>
        </ul>
      </section>
      <section>
        <h2><T s="confidentialite">{"Vos droits"}</T></h2>
        <p><T s="confidentialite">{"Vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition et de portabilité de vos données. Pour l'exercer, écrivez-nous à"}</T>{" "}<a href={`mailto:${email}`}>{email}</a><T s="confidentialite">{". Les membres connectés pourront aussi supprimer leurs données depuis « Mon espace »."}</T></p>
      </section>
    </LegalPage>
  );
}
