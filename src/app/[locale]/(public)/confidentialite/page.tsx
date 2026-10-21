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
        <p>
          KTGW Togo attache une grande importance à la protection de vos données personnelles. Cette politique explique quelles données nous
          collectons, pourquoi, et quels sont vos droits, conformément au Règlement général sur la protection des données (RGPD) et à la loi
          togolaise n° 2019-014 relative à la protection des données à caractère personnel.
        </p>
      </section>
      <section>
        <h2>Données collectées</h2>
        <ul>
          <li>Formulaires (contact, partenariat, inscription, bénévolat, candidature, don, newsletter) : nom, coordonnées et informations que vous saisissez.</li>
          <li>Espace membre (connexion Google) : nom, adresse e-mail et photo de profil fournis par Google.</li>
          <li>Statistiques de fréquentation anonymes (Vercel Analytics, sans cookie publicitaire).</li>
        </ul>
      </section>
      <section>
        <h2>Finalités</h2>
        <ul>
          <li>Répondre à vos demandes et assurer le suivi des partenariats, inscriptions, candidatures et dons.</li>
          <li>Vous envoyer la newsletter si vous l&apos;avez demandé (désinscription possible à tout moment).</li>
          <li>Établir des statistiques anonymes et rendre compte de nos actions aux bailleurs.</li>
        </ul>
        <p>Vos données ne sont jamais vendues ni cédées à des fins commerciales.</p>
      </section>
      <section>
        <h2>Durée de conservation</h2>
        <p>
          Les demandes de contact sont conservées 3 ans après le dernier échange ; les données des donateurs et membres, le temps de la relation puis
          selon les obligations légales ; les inscriptions à la newsletter, jusqu&apos;à votre désinscription.
        </p>
      </section>
      <section>
        <h2>Services tiers</h2>
        <ul>
          <li>Google Maps : la carte n&apos;est chargée qu&apos;après votre clic sur « Afficher la carte ». Google peut alors déposer des cookies.</li>
          <li>WhatsApp et votre messagerie : lorsque vous choisissez d&apos;envoyer un formulaire par ces moyens, le message transite par ces services.</li>
          <li>Hébergement : Vercel (site) et Supabase (base de données, Union européenne).</li>
        </ul>
      </section>
      <section>
        <h2>Vos droits</h2>
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, d&apos;opposition et de portabilité de vos données. Pour
          l&apos;exercer, écrivez-nous à <a href={`mailto:${email}`}>{email}</a>. Les membres connectés pourront aussi supprimer leurs données depuis
          « Mon espace ».
        </p>
      </section>
    </LegalPage>
  );
}
