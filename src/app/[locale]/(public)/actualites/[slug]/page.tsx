import { ArrowLeft, CalendarDays, ExternalLink, PenLine, Tag } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button-link";
import { PostCard } from "@/components/shared/cards";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { ShareBar } from "@/components/shared/share-bar";
import { VideoEmbed } from "@/components/shared/video-embed";
import { getPost, getPosts } from "@/lib/content/repository";
import { routing } from "@/i18n/routing";
import { formatDate } from "@/lib/format";
import { getSiteConfig } from "@/lib/site/settings";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts();
  return routing.locales.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: "article", publishedTime: post.date, images: [{ url: post.image.src, alt: post.image.alt }] },
  };
}

export default async function PostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await getPost(slug);
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const url = `${siteUrl}/actualites/${post.slug}`;
  const { socials } = await getSiteConfig();

  return (
    <>
      <PageHeader
        image={post.image}
        eyebrow={post.category}
        title={post.title}
        breadcrumbs={[{ label: "Actualités", href: "/actualites" }, { label: post.title }]}
      >
        <div className="flex flex-wrap items-center gap-4 text-sm text-white/85">
          <time dateTime={post.date} className="flex items-center gap-1.5">
            <CalendarDays aria-hidden className="size-4" />
            {formatDate(post.date, locale, post.date.endsWith("-01") ? "month" : "long")}
          </time>
          <span className="flex items-center gap-1.5">
            <Tag aria-hidden className="size-4" />
            {post.category}
          </span>
          {post.author && (
            <span className="flex items-center gap-1.5">
              <PenLine aria-hidden className="size-4" />
              {post.author}
            </span>
          )}
        </div>
      </PageHeader>

      <Section width="narrow">
        <article className="flex flex-col gap-6">
          <p className="font-accent text-xl leading-relaxed font-semibold italic sm:text-2xl">{post.excerpt}</p>
          {post.body.map((para, i) => (
            <p key={i} className="text-lg leading-relaxed text-foreground/85">
              {para}
            </p>
          ))}

          {post.videoUrl && <VideoEmbed url={post.videoUrl} title={post.title} />}

          {post.gallery && post.gallery.length > 0 && (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {post.gallery.map((img) => (
                <li key={img.src} className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image src={img.src} alt={img.alt} fill sizes="(min-width: 640px) 240px, 50vw" className="object-cover" />
                </li>
              ))}
            </ul>
          )}

          {post.links && post.links.length > 0 && (
            <aside aria-label="Liens utiles" className="rounded-2xl bg-muted/60 p-5">
              <p className="mb-3 font-bold">Liens utiles</p>
              <ul className="flex flex-col gap-2">
                {post.links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-ktgw-red underline-offset-2 hover:underline">
                      <ExternalLink aria-hidden className="size-4" />
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t pt-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Partager cette publication :</span>
              <ShareBar url={url} title={post.title} text={post.excerpt} instagram={socials.instagram || undefined} tiktok={socials.tiktok || undefined} size="sm" />
            </div>
            <ButtonLink href="/actualites" variant="ghost" size="lg">
              <ArrowLeft aria-hidden />
              Toutes les actualités
            </ButtonLink>
          </div>
        </article>
      </Section>

      <Section tone="muted" aria-labelledby="more-news">
        <h2 id="more-news" className="mb-8 text-2xl font-bold">
          À lire aussi
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {(await getPosts())
            .filter((p) => p.slug !== post.slug)
            .slice(0, 2)
            .map((p) => (
              <li key={p.slug}>
                <PostCard post={p} />
              </li>
            ))}
        </ul>
      </Section>
    </>
  );
}
