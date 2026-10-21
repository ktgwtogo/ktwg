import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { ButtonLink } from "@/components/ui/button-link";
import { images } from "@/content/images";
import { PostCard } from "@/components/shared/cards";
import { getPage, getPostsFor } from "@/lib/content/repository";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ locale: string; rest: string[] }> };

/** Une seule partie d'adresse : candidate à une page personnalisée. */
const slugOf = (rest: string[]) => (rest.length === 1 ? rest[0] : null);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = slugOf((await params).rest);
  const page = slug ? await getPage(slug) : undefined;
  return page ? { title: page.title, description: page.description || undefined } : {};
}

const paragraphs = (text: string) => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

/**
 * Pages personnalisées créées dans /admin → Contenus → Pages (adresse « /mon-adresse »).
 * Toute autre URL inconnue affiche la page 404 du gabarit public.
 */
export default async function CustomPageRoute({ params }: Props) {
  const { locale, rest } = await params;
  setRequestLocale(locale);
  const slug = slugOf(rest);
  const page = slug ? await getPage(slug) : undefined;
  if (!page) notFound();
  const posts = await getPostsFor(`page:${page.slug}`);

  return (
    <>
      <PageHeader title={page.title} description={page.description || undefined} image={page.heroImage ?? images.workersGroup} breadcrumbs={[{ label: page.title }]} />
      <Section>
        <div className="mx-auto flex max-w-4xl flex-col gap-12">
          {page.blocks.map((b, i) => {
            switch (b.type) {
              case "text":
                return (
                  <div key={i} className="flex flex-col gap-4">
                    {b.heading && <h2 className="text-3xl font-extrabold">{b.heading}</h2>}
                    {paragraphs(b.body).map((p, j) => (
                      <p key={j} className="text-lg leading-relaxed text-foreground/85">
                        {p}
                      </p>
                    ))}
                  </div>
                );
              case "imageText":
                return (
                  <div key={i} className="grid items-center gap-8 md:grid-cols-2">
                    {b.image && (
                      <Image
                        src={b.image.src}
                        alt={b.image.alt}
                        width={b.image.width}
                        height={b.image.height}
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className={cn("w-full rounded-3xl object-cover shadow-soft", b.imageRight && "md:order-2")}
                      />
                    )}
                    <div className="flex flex-col gap-4">
                      {b.heading && <h2 className="text-3xl font-extrabold">{b.heading}</h2>}
                      {paragraphs(b.body).map((p, j) => (
                        <p key={j} className="leading-relaxed text-foreground/85">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              case "image":
                return b.image ? (
                  <figure key={i} className="flex flex-col gap-3">
                    <Image src={b.image.src} alt={b.image.alt} width={b.image.width} height={b.image.height} sizes="(min-width: 896px) 896px, 100vw" className="w-full rounded-3xl object-cover shadow-soft" />
                    {b.caption && <figcaption className="text-center text-sm text-muted-foreground">{b.caption}</figcaption>}
                  </figure>
                ) : null;
              case "button":
                return (
                  <div key={i} className="flex justify-center">
                    <ButtonLink href={b.href} size="xl" variant={b.style === "outline" ? "outline" : "default"}>
                      {b.label}
                    </ButtonLink>
                  </div>
                );
            }
          })}
        </div>
      </Section>
      {posts.length > 0 && (
        <Section tone="muted" aria-labelledby="publications">
          <h2 id="publications" className="mb-8 text-3xl font-extrabold">
            Publications
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.slug}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
