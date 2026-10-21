import { PlayCircle } from "lucide-react";

/** Adresse d'intégration pour YouTube et Facebook ; null pour les autres (TikTok…). */
function embedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  if (/facebook\.com|fb\.watch/.test(url)) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
  return null;
}

/** Vidéo d'une publication : lecteur intégré (YouTube, Facebook) ou lien (TikTok, autres). */
export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const src = embedUrl(url);
  if (!src)
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl bg-ink p-5 font-semibold text-white hover:bg-ink/90">
        <PlayCircle aria-hidden className="size-8 text-ktgw-sun" />
        Voir la vidéo
      </a>
    );
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink">
      <iframe src={src} title={`Vidéo : ${title}`} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" className="absolute inset-0 size-full border-0" />
    </div>
  );
}
