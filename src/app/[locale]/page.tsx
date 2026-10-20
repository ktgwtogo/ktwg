import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Link } from "@/i18n/navigation";
import { localeLabels, routing } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Page provisoire de la Phase 1 : vérifie polices, couleurs de marque et i18n.
 * Remplacée par la vraie page d'accueil en Phase 3.
 */
export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations();

  const swatches = [
    { name: "ktgw-red", className: "bg-ktgw-red" },
    { name: "ktgw-sun", className: "bg-ktgw-sun" },
    { name: "ktgw-orange", className: "bg-ktgw-orange" },
    { name: "ktgw-green", className: "bg-ktgw-green" },
    { name: "ktgw-green-dark", className: "bg-ktgw-green-dark" },
    { name: "ink", className: "bg-ink" },
  ];

  return (
    <main id="main" className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-12 sm:px-6 sm:py-20">
      <nav aria-label={t("Common.language")} className="flex gap-2 self-end">
        {routing.locales.map((l) => (
          <Link
            key={l}
            href="/"
            locale={l}
            aria-current={l === locale ? "true" : undefined}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium transition-colors",
              l === locale ? "bg-ink text-paper" : "text-muted-foreground hover:bg-muted"
            )}
          >
            {localeLabels[l].short}
          </Link>
        ))}
      </nav>

      <header className="flex flex-col items-start gap-8">
        <Image
          src="/images/logo-ktgw.png"
          alt="Logo KTGW — Komm Togo geh weiter"
          width={240}
          height={96}
          priority
          className="h-auto w-48 sm:w-60"
        />
        <h1 className="max-w-3xl text-4xl font-extrabold text-ktgw-red sm:text-5xl">
          {t("Home.heroTitle")}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{t("Home.heroSubtitle")}</p>
        <div className="flex flex-wrap gap-3">
          <a href="#" className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-xl px-5")}>
            {t("Common.donate")}
          </a>
          <a
            href="#"
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "h-11 rounded-xl px-5")}
          >
            {t("Common.becomePartner")}
          </a>
          <a
            href="#"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 rounded-xl px-5")}
          >
            {t("Common.ourProjects")}
          </a>
        </div>
      </header>

      <blockquote className="rounded-2xl border-l-4 border-ktgw-sun bg-accent p-6 font-heading text-lg font-semibold italic shadow-soft">
        « {t("Common.motto")} »
      </blockquote>

      <section aria-labelledby="palette" className="flex flex-col gap-4">
        <h2 id="palette" className="text-xl font-bold">Palette</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {swatches.map((s) => (
            <li key={s.name} className="overflow-hidden rounded-2xl border bg-card shadow-soft">
              <div className={cn("h-16", s.className)} />
              <p className="px-3 py-2 font-mono text-xs">{s.name}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="relative aspect-[3/2] overflow-hidden rounded-2xl shadow-soft">
          <Image
            src="/images/inauguration-ruban.webp"
            alt="Coupe du ruban lors de l'inauguration du bâtiment de l'internat"
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="relative aspect-[3/2] overflow-hidden rounded-2xl shadow-soft">
          <Image
            src="/images/plantation-ambassade.webp"
            alt="Plantation d'un arbre avec des officiels et de jeunes femmes"
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <p className="text-sm text-muted-foreground">{t("Home.wip")}</p>
    </main>
  );
}
