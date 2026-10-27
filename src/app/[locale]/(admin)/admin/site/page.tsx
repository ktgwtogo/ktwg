import { setRequestLocale } from "next-intl/server";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { SiteBuilderStudio } from "@/components/admin/site-builder-studio";
import { ContactSettings, HeroSettings, MenuSettings, SocialSettings, TextSettings } from "@/components/admin/site-settings";
import { Link, redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { getPages } from "@/lib/content/repository";
import { getGlobalSiteData, getSiteDesignerEmail } from "@/lib/site/actions";
import { flatMessages } from "@/lib/site/schemas";
import { getHeroSlides, getMainNav, getSiteConfig, getTextOverrides } from "@/lib/site/settings";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "builder", label: "Studio Visual Builder (Divi / Astra)" },
  { id: "coordonnees", label: "Coordonnées et Siège Togo" },
  { id: "menu", label: "Menu principal" },
  { id: "accueil", label: "Diaporama de l'accueil" },
  { id: "textes", label: "Textes du site" },
] as const;

const languages = [
  { id: "fr", label: "Français" },
  { id: "de", label: "Deutsch" },
  { id: "en", label: "English" },
] as const;

/** Gestion globale et constructeur du site web : réservé à la gestion du site et à la présidence. */
export default async function SiteSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ onglet?: string; langue?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });

  const designerEmail = await getSiteDesignerEmail();
  const isAuthorized =
    staff.presidency ||
    staff.can("pages.manage") ||
    staff.user.email?.toLowerCase() === designerEmail.toLowerCase();

  if (!isAuthorized) return <Forbidden />;

  const { onglet, langue } = await searchParams;
  const tab = tabs.find((t) => t.id === onglet)?.id ?? "builder";
  const lang = languages.find((l) => l.id === langue)?.id ?? "fr";
  const presidency = staff.presidency;

  let body: React.ReactNode = null;

  if (tab === "builder") {
    const builderData = await getGlobalSiteData();
    body = (
      <SiteBuilderStudio
        initialData={builderData}
        isPresidency={presidency}
        currentUserEmail={staff.user.email}
        designerEmail={designerEmail}
      />
    );
  } else if (tab === "coordonnees") {
    const config = await getSiteConfig();
    body = (
      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <Panel title="Coordonnées & Siège National (Tokoin Lomé)">
          <ContactSettings initial={{ togo: config.togo, germany: config.germany }} presidency={presidency} />
        </Panel>
        <Panel title="Réseaux sociaux & Partage">
          <SocialSettings initial={config.socials} presidency={presidency} />
        </Panel>
      </div>
    );
  } else if (tab === "menu") {
    const [nav, pages] = await Promise.all([getMainNav(), getPages()]);
    const sitePages = [
      "/a-propos",
      "/objectifs",
      "/projets",
      "/formations",
      "/actualites",
      "/evenements",
      "/galerie",
      "/partenariat",
      "/s-engager",
      "/faire-un-don",
      "/transparence",
      "/contact",
    ].map((href) => ({ href, title: href }));
    body = (
      <Panel
        title="Menu principal"
        description="Un libellé vide garde la traduction d'origine dans les trois langues (FR/DE/EN). Les liens proposés incluent vos pages personnalisées."
      >
        <MenuSettings
          initial={nav}
          labels={flatMessages("fr")}
          pages={[...sitePages, ...pages.map((p) => ({ href: `/${p.slug}`, title: p.title }))]}
          presidency={presidency}
        />
      </Panel>
    );
  } else if (tab === "accueil") {
    body = (
      <Panel
        title="Diaporama de l'accueil"
        description="Les grandes bannières défilantes en haut de la page d'accueil de KTGW Togo."
      >
        <HeroSettings initial={await getHeroSlides()} presidency={presidency} />
      </Panel>
    );
  } else {
    body = (
      <>
        <div className="flex flex-wrap gap-2">
          {languages.map((l) => (
            <Link
              key={l.id}
              href={{ pathname: "/admin/site", query: { onglet: "textes", langue: l.id } }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                l.id === lang
                  ? "bg-ktgw-green-strong text-white shadow"
                  : "bg-card ring-1 ring-foreground/10 hover:bg-muted"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <Panel
          title={`Textes du site — ${languages.find((l) => l.id === lang)!.label}`}
          description="Tous les textes, boutons, bandeau, pied de page et formulaires dans la langue sélectionnée."
        >
          <TextSettings
            key={lang}
            locale={lang}
            base={flatMessages(lang)}
            overrides={await getTextOverrides(lang)}
            presidency={presidency}
          />
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeading
        title="Gestion globale du site"
        description={
          presidency
            ? "Espace de reconstruction totale du site (style Divi / Astra). Vos publications prennent effet immédiat."
            : "Espace réservé au Web Designer désigné par le Président-Fondateur Monsieur Blaise-Pascal D'ALMEIDA."
        }
      />
      <div role="tablist" aria-label="Rubriques de gestion du site" className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={{ pathname: "/admin/site", query: { onglet: t.id } }}
            role="tab"
            aria-selected={t.id === tab}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-bold transition-all",
              t.id === tab
                ? "bg-ktgw-green-strong text-white shadow-md ring-2 ring-ktgw-green"
                : "bg-card ring-1 ring-foreground/10 hover:bg-muted"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
      {body}
    </>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
      <h2 className="font-heading text-xl font-bold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
