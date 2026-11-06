import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { EditMode } from "@/components/edit/edit-mode";
import { EditsProvider } from "@/components/edit/editable";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteConfigProvider } from "@/components/layout/site-config-provider";
import { getEdits, getMainNav, getSiteConfig } from "@/lib/site/settings";
import { NewsletterNotice } from "@/components/layout/newsletter-notice";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { TopBar } from "@/components/layout/top-bar";
import { VisitTracker } from "@/components/layout/visit-tracker";

/** Gabarit des pages publiques : top bar, header collant, contenu, footer. */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("Common");
  const [config, nav, edits] = await Promise.all([getSiteConfig(), getMainNav(), getLocale().then(getEdits)]);

  return (
    <EditsProvider value={edits}>
      {/* Lien d'évitement : premier élément focusable (WCAG 2.4.1) */}
      <a
        href="#main"
        className="sr-only z-50 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t("skipToContent")}
      </a>
      <Suspense>
        <NewsletterNotice />
      </Suspense>
      <AnnouncementBar />
      <TopBar config={config} />
      <SiteHeader nav={nav} config={config} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <SiteConfigProvider value={config}>{children}</SiteConfigProvider>
      </main>
      <SiteFooter config={config} />
      <VisitTracker />
      <EditMode />
    </EditsProvider>
  );
}
