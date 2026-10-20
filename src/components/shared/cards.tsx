import { ArrowRight, CalendarDays, Clock, MapPin, Monitor, Users } from "lucide-react";
import Image from "next/image";
import { useLocale } from "next-intl";
import type { KtgwEvent } from "@/content/events";
import type { Post } from "@/content/news";
import { statusLabels, type Project } from "@/content/projects";
import { Link } from "@/i18n/navigation";
import { dateParts, formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProgressBar, SampleBadge } from "./badges";

const cardBase =
  "group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card text-card-foreground shadow-soft ring-1 ring-foreground/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl";

/** Carte projet : image, statut, avancement et lien « Soutenir ». */
export function ProjectCard({ project, priority }: { project: Project; priority?: boolean }) {
  return (
    <article className={cardBase}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={project.image.src}
          alt={project.image.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent" />
        <span
          className={cn(
            "absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-semibold shadow-soft",
            project.status === "realise" ? "bg-ktgw-green-strong text-white" : "bg-ktgw-sun text-ink"
          )}
        >
          {statusLabels[project.status]}
        </span>
        <p className="absolute bottom-4 left-4 flex items-center gap-1.5 text-sm font-medium text-white">
          <MapPin aria-hidden className="size-4" />
          {project.location}
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="text-xs font-semibold tracking-wider text-(--eyebrow) uppercase">{project.tagline}</p>
        <h3 className="text-xl font-bold">
          <Link href={`/projets/${project.slug}`} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>
        {project.progress && (
          <ProgressBar
            className="mt-1"
            value={project.progress.current}
            max={project.progress.target}
            label={`${project.progress.label} : ${project.progress.current} / ${project.progress.target} ${project.progress.unit}`}
          />
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ktgw-red">
            Découvrir
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
          <Link
            href={`/faire-un-don?projet=${project.slug}`}
            className="relative z-10 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
          >
            Soutenir ce projet
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Carte actualité. */
export function PostCard({ post }: { post: Post }) {
  const locale = useLocale();
  return (
    <article className={cardBase}>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={post.image.src}
          alt={post.image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink">
          {post.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <time dateTime={post.date} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <CalendarDays aria-hidden className="size-3.5" />
          {formatDate(post.date, locale, "month")}
        </time>
        <h3 className="text-lg leading-snug font-bold">
          <Link href={`/actualites/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-ktgw-red">
          Lire l&apos;article
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}

/** Carte événement : pastille de date, lieu, places restantes. */
export function EventCard({ event, past = false }: { event: KtgwEvent; past?: boolean }) {
  const locale = useLocale();
  const { day, month, year } = dateParts(event.start, locale);
  const remaining =
    event.capacity !== undefined ? Math.max(event.capacity - (event.registered ?? 0), 0) : undefined;

  return (
    <article className={cn(cardBase, past && "opacity-90")}>
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={event.image.src}
          alt={event.image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={cn("object-cover transition-transform duration-700 group-hover:scale-105", past && "grayscale-[40%]")}
        />
        <div className="absolute top-4 left-4 flex flex-col items-center rounded-2xl bg-white px-3 py-2 text-center text-ink shadow-soft">
          <span className="font-heading text-2xl leading-none font-extrabold">{day}</span>
          <span className="text-xs font-semibold text-ktgw-red uppercase">{month}</span>
          <span className="text-[10px] text-muted-foreground">{year}</span>
        </div>
        {event.sample && <SampleBadge className="absolute top-4 right-4 bg-ink/70 text-white" />}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="text-lg leading-snug font-bold">
          <Link href={`/evenements/${event.slug}`} className="after:absolute after:inset-0">
            {event.title}
          </Link>
        </h3>
        <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Clock aria-hidden className="size-4 shrink-0 text-ktgw-green" />
            {formatDate(event.start, locale)} · {formatTime(event.start, locale)}
          </li>
          <li className="flex items-center gap-2">
            {event.format === "en-ligne" ? (
              <Monitor aria-hidden className="size-4 shrink-0 text-ktgw-green" />
            ) : (
              <MapPin aria-hidden className="size-4 shrink-0 text-ktgw-green" />
            )}
            {event.venue}, {event.city}
          </li>
          {!past && remaining !== undefined && (
            <li className="flex items-center gap-2">
              <Users aria-hidden className="size-4 shrink-0 text-ktgw-green" />
              {remaining > 0 ? `${remaining} places restantes` : "Complet : liste d'attente"}
            </li>
          )}
        </ul>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-ktgw-red">
          {past ? "Revoir l'événement" : "S'inscrire"}
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
