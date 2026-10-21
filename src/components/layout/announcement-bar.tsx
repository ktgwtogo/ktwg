import { ArrowRight, Megaphone } from "lucide-react";
import { getAnnouncements } from "@/lib/content/repository";
import { cn } from "@/lib/utils";

const tones = {
  info: "bg-ktgw-green-strong text-white",
  urgent: "bg-ktgw-red-strong text-white",
  success: "bg-ktgw-sun text-ink",
} as const;

/** Bandeau d'annonce en haut des pages (géré dans /admin/contenus/annonces). */
export async function AnnouncementBar() {
  const [announcement] = await getAnnouncements();
  if (!announcement) return null;

  return (
    <aside aria-label="Annonce" className={cn("px-4 py-2.5 text-center text-sm", tones[announcement.tone])}>
      <p className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <Megaphone aria-hidden className="size-4 shrink-0" />
        <strong className="font-semibold">{announcement.title}</strong>
        {announcement.body && <span className="opacity-90">{announcement.body}</span>}
        {announcement.linkUrl && (
          <a href={announcement.linkUrl} className="inline-flex items-center gap-1 font-semibold underline underline-offset-2">
            {announcement.linkLabel || "En savoir plus"}
            <ArrowRight aria-hidden className="size-4" />
          </a>
        )}
      </p>
    </aside>
  );
}
