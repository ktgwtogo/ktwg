import { T } from "@/components/edit/editable";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { GalleryGrid } from "@/components/sections/gallery-grid";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { getGallery } from "@/lib/content/repository";
import { getSiteImages } from "@/lib/site/settings";

export const metadata: Metadata = {
  title: "Galerie photos",
  description: "Les actions de KTGW Togo en images : internat, cérémonies, plantations et partenaires.",
};

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const siteImages = await getSiteImages();
  setRequestLocale(locale);

  return (
    <>
      <PageHeader
        image={siteImages["banner.galerie"]} imageId="banner.galerie"
        eyebrow={<T s="galerie">{"Galerie"}</T>}
        title={<T s="galerie">{"Nos actions en images"}</T>}
        description={<T s="galerie">{"Moments de fête, de travail et d'engagement, sur le terrain avec nos partenaires."}</T>}
        breadcrumbs={[{ label: "À propos", href: "/a-propos" }, { label: "Galerie" }]}
      />
      <Section>
        <GalleryGrid items={await getGallery()} />
      </Section>
    </>
  );
}
