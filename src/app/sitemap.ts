import type { MetadataRoute } from "next";
import { events } from "@/content/events";
import { posts } from "@/content/news";
import { projects } from "@/content/projects";
import { routing } from "@/i18n/routing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const staticPaths = [
  "",
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
  "/mentions-legales",
  "/confidentialite",
];

/** Adresse d'une page dans une langue (le français est servi sans préfixe). */
const localized = (path: string, locale: string) =>
  `${siteUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}${path}` || siteUrl;

function entry(path: string, lastModified?: string): MetadataRoute.Sitemap[number] {
  return {
    url: localized(path, routing.defaultLocale),
    lastModified: lastModified ? new Date(lastModified) : undefined,
    alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, localized(path, l)])) },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPaths.map((p) => entry(p)),
    ...projects.map((p) => entry(`/projets/${p.slug}`)),
    ...posts.map((p) => entry(`/actualites/${p.slug}`, p.date)),
    ...events.filter((e) => !e.sample).map((e) => entry(`/evenements/${e.slug}`)),
  ];
}
