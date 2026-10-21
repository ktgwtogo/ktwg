import "server-only";
import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { events as staticEvents, type KtgwEvent } from "@/content/events";
import { gallery as staticGallery, type GalleryCategory, type GalleryItem } from "@/content/gallery";
import type { SiteImage } from "@/content/images";
import { posts as staticPosts, type Post } from "@/content/news";
import { partners as staticPartners, type Partner } from "@/content/partners";
import { projects as staticProjects, type Project, type ProjectStatus } from "@/content/projects";
import { testimonials as staticTestimonials, type Testimonial } from "@/content/testimonials";
import type { Database } from "@/types/database";
import type { PageBlock } from "./config";

/**
 * Lecture des contenus du site depuis Supabase (modifiés dans /admin).
 * Mis en cache et invalidés par le tag CONTENT_TAG à chaque modification ;
 * repli sur les contenus d'origine (src/content) si la base est indisponible.
 */
export const CONTENT_TAG = "content";

export type Announcement = { id: string; title: string; body: string; linkLabel: string | null; linkUrl: string | null; tone: "info" | "urgent" | "success" };

function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function cached<T>(key: string, load: (db: NonNullable<ReturnType<typeof publicClient>>) => Promise<T>, fallback: T) {
  return unstable_cache(
    async () => {
      const db = publicClient();
      if (!db) return fallback;
      try {
        return await load(db);
      } catch (error) {
        console.error(`[contenus] ${key}`, error);
        return fallback;
      }
    },
    ["content", key],
    { tags: [CONTENT_TAG], revalidate: 3600 }
  );
}

const asImage = (v: unknown): SiteImage => (v ?? { src: "/images/og-default.png", alt: "", width: 1200, height: 630 }) as SiteImage;
const asImages = (v: unknown): SiteImage[] => (Array.isArray(v) ? (v as SiteImage[]) : []);
/** Heure de Lomé (UTC+0) au format local « AAAA-MM-JJTHH:mm » attendu par les composants. */
const lomeLocal = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : undefined);

function unwrap<T>(r: { data: T | null; error: { message: string } | null }) {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

export const getPosts = cached(
  "posts",
  async (db) =>
    unwrap(await db.from("posts").select("*").eq("published", true).order("published_on", { ascending: false })).map(
      (p): Post => ({
        slug: p.slug,
        title: p.title,
        date: p.published_on,
        category: p.category as Post["category"],
        image: asImage(p.image),
        excerpt: p.excerpt,
        body: p.body,
        gallery: asImages(p.gallery),
      })
    ),
  staticPosts
);

export const getEvents = cached(
  "events",
  async (db) => {
    const rows = unwrap(await db.from("events").select("*").eq("published", true).order("starts_at"));
    return Promise.all(
      rows.map(async (e): Promise<KtgwEvent> => {
        const { data: taken } = e.capacity ? await db.rpc("event_seats_taken", { p_event_id: e.id }) : { data: 0 };
        return {
          slug: e.slug,
          title: e.title,
          start: lomeLocal(e.starts_at)!,
          end: lomeLocal(e.ends_at),
          venue: e.venue,
          city: e.city,
          format: e.format as KtgwEvent["format"],
          capacity: e.capacity ?? undefined,
          registered: taken ?? 0,
          image: asImage(e.image),
          summary: e.summary,
          body: e.body,
          sample: e.is_sample,
        };
      })
    );
  },
  staticEvents
);

export const getProjects = cached(
  "projects",
  async (db) =>
    unwrap(await db.from("projects").select("*").eq("published", true).order("sort_order")).map(
      (p): Project => ({
        slug: p.slug,
        title: p.title,
        tagline: p.tagline,
        location: p.location,
        status: p.status as ProjectStatus,
        image: asImage(p.image),
        summary: p.summary,
        body: p.body,
        facts: (p.facts as Project["facts"]) ?? [],
        progress: (p.progress as Project["progress"]) ?? undefined,
        milestones: (p.milestones as Project["milestones"]) ?? [],
        gallery: asImages(p.gallery),
      })
    ),
  staticProjects
);

export const getGallery = cached(
  "gallery",
  async (db) =>
    unwrap(await db.from("gallery_items").select("*").eq("published", true).order("sort_order")).map(
      (g): GalleryItem => ({ ...asImage(g.image), category: g.category as GalleryCategory, caption: g.caption })
    ),
  staticGallery
);

export const getPartners = cached(
  "partners",
  async (db) =>
    unwrap(await db.from("partners").select("*").eq("published", true).order("sort_order")).map(
      (p): Partner => ({
        name: p.name,
        initials: p.initials,
        country: p.country as Partner["country"],
        description: p.description,
        url: p.url ?? undefined,
        tone: p.tone as Partner["tone"],
        logo: p.logo ?? undefined,
      })
    ),
  staticPartners
);

export const getTestimonials = cached(
  "testimonials",
  async (db) =>
    unwrap(await db.from("testimonials").select("*").eq("published", true).order("sort_order")).map(
      (t): Testimonial => ({ quote: t.quote, name: t.name, role: t.role, initials: t.initials, sample: t.is_sample })
    ),
  staticTestimonials
);

export const getAnnouncements = cached(
  "announcements",
  async (db) =>
    unwrap(await db.from("announcements").select("*").order("starts_at", { ascending: false }).limit(3)).map(
      (a): Announcement => ({ id: a.id, title: a.title, body: a.body, linkLabel: a.link_label, linkUrl: a.link_url, tone: a.tone as Announcement["tone"] })
    ),
  [] as Announcement[]
);

export type CustomPage = { slug: string; title: string; description: string; heroImage: SiteImage | null; blocks: PageBlock[] };

export const getPages = cached(
  "pages",
  async (db) =>
    unwrap(await db.from("pages").select("*").eq("published", true).order("sort_order")).map(
      (p): CustomPage => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        heroImage: (p.hero_image as SiteImage | null) ?? null,
        blocks: (p.blocks as PageBlock[]) ?? [],
      })
    ),
  [] as CustomPage[]
);

export async function getPage(slug: string) {
  return (await getPages()).find((p) => p.slug === slug);
}

// ── Aides dérivées (mêmes règles que src/content) ──

export async function getPost(slug: string) {
  return (await getPosts()).find((p) => p.slug === slug);
}
export async function getProject(slug: string) {
  return (await getProjects()).find((p) => p.slug === slug);
}
export async function getEvent(slug: string) {
  return (await getEvents()).find((e) => e.slug === slug);
}
export async function upcomingEvents() {
  const now = new Date();
  return (await getEvents()).filter((e) => new Date(e.end ?? e.start) >= now).sort((a, b) => a.start.localeCompare(b.start));
}
export async function pastEvents() {
  const now = new Date();
  return (await getEvents()).filter((e) => new Date(e.end ?? e.start) < now).sort((a, b) => b.start.localeCompare(a.start));
}
