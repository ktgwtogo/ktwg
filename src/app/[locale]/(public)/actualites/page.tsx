import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, CalendarDays } from "lucide-react";
import { NewsletterSection } from "@/components/sections/home-interactive";
import { PostCard } from "@/components/shared/cards";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { images } from "@/content/images";
import { posts } from "@/content/news";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Les dernières nouvelles de KTGW Togo : projets, cérémonies, environnement et vie de l'ONG.",
};

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHeader
        image={images.priest}
        eyebrow="Actualités"
        title="Les nouvelles du terrain"
        description="Chantiers, cérémonies, plantations et formations : suivez la vie de KTGW Togo."
        breadcrumbs={[{ label: "Actualités" }]}
      />

      <Section aria-label="Articles">
        {/* Article à la une */}
        <article className="group relative grid overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-foreground/5 lg:grid-cols-2">
          <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-96">
            <Image src={featured.image.src} alt={featured.image.alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div className="flex flex-col justify-center gap-4 p-8 sm:p-12">
            <span className="w-fit rounded-full bg-ktgw-sun px-3 py-1 text-xs font-semibold text-ink">À la une · {featured.category}</span>
            <time dateTime={featured.date} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays aria-hidden className="size-4" />
              {formatDate(featured.date, locale, "month")}
            </time>
            <h2 className="text-2xl leading-tight font-extrabold sm:text-3xl">
              <Link href={`/actualites/${featured.slug}`} className="after:absolute after:inset-0">
                {featured.title}
              </Link>
            </h2>
            <p className="leading-relaxed text-muted-foreground">{featured.excerpt}</p>
            <span className="inline-flex items-center gap-1.5 font-semibold text-ktgw-red">
              Lire l&apos;article
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </article>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <li key={p.slug}>
              <PostCard post={p} />
            </li>
          ))}
        </ul>
      </Section>

      <NewsletterSection />
    </>
  );
}
