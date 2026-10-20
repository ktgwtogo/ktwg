import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter, Montserrat } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { routing } from "@/i18n/routing";
import "../globals.css";

// Polices auto-hébergées par next/font (aucune requête vers Google côté visiteur)
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL(siteUrl),
    title: { default: t("title"), template: t("titleTemplate") },
    description: t("description"),
    // Favicon et icône iOS : src/app/icon.png et src/app/apple-icon.png (générés par scripts/prepare-logo.mjs)
    openGraph: {
      type: "website",
      siteName: "KTGW Togo",
      locale,
      images: [{ url: "/images/og-default.png", width: 1200, height: 630, alt: "KTGW — Komm Togo geh weiter" }],
    },
    twitter: { card: "summary_large_image", images: ["/images/og-default.png"] },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFDF8" },
    { media: "(prefers-color-scheme: dark)", color: "#141210" },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Active le rendu statique pour cette langue
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body id="top" className="flex min-h-dvh flex-col bg-background font-sans text-foreground antialiased">
        <NextIntlClientProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
