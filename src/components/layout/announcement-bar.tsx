import { ArrowRight, Award, Megaphone } from "lucide-react";
import { getAnnouncements } from "@/lib/content/repository";
import { getGlobalSiteData } from "@/lib/site/actions";
import { cn } from "@/lib/utils";

const tones = {
  info: "bg-ktgw-green-strong text-white",
  urgent: "bg-ktgw-red-strong text-white",
  success: "bg-ktgw-sun text-ink",
} as const;

/** Bandeau d'annonce en haut des pages : connecté aux annonces ou au Site Builder. */
export async function AnnouncementBar() {
  const [repoAnnouncement] = await getAnnouncements().catch(() => []);
  const globalData = await getGlobalSiteData().catch(() => null);
  const builderAnnouncement = globalData?.announcements?.find((a) => a.enabled);

  const announcement = repoAnnouncement ?? (builderAnnouncement ? {
    title: builderAnnouncement.title,
    body: builderAnnouncement.text,
    linkUrl: builderAnnouncement.url,
    linkLabel: "Voir les conditions & postuler",
    tone: "urgent" as const,
  } : null);

  if (!announcement) return null;

  return (
    <aside aria-label="Annonce officielle" className={cn("px-4 py-2.5 text-center text-sm shadow-md", tones[announcement.tone])}>
      <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20">
          <Award aria-hidden className="size-3.5 text-white" />
        </span>
        <strong className="font-extrabold tracking-wide uppercase">{announcement.title}</strong>
        {announcement.body && <span className="opacity-95 text-xs sm:text-sm font-medium">{announcement.body}</span>}
        {announcement.linkUrl && (
          <a
            href={announcement.linkUrl}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-0.5 text-xs font-bold text-slate-950 shadow-sm transition-transform hover:scale-105"
          >
            {announcement.linkLabel || "En savoir plus"}
            <ArrowRight aria-hidden className="size-3.5" />
          </a>
        )}
      </p>
    </aside>
  );
}
