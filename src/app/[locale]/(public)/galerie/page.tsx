import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { GalleryGrid } from "@/components/sections/gallery-grid";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { getGallery } from "@/lib/content/repository";
import { images } from "@/content/images";

export const metadata: Metadata = {
  title: "Galerie photos",
  description: "Les actions de KTGW Togo en images : internat, cérémonies, plantations et partenaires.",
};

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHeader
        image={images.blessing}
        eyebrow="Galerie"
        title="Nos actions en images"
        description="Moments de fête, de travail et d'engagement, sur le terrain avec nos partenaires."
        breadcrumbs={[{ label: "À propos", href: "/a-propos" }, { label: "Galerie" }]}
      />
      <Section>
        <GalleryGrid items={await getGallery()} />
      </Section>
    </>
  );
}
