import { ExternalLink, KeyRound, LifeBuoy, LogOut, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { navIcons, type AdminNavItem } from "./nav-icons";

const row = "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-muted";

/** Colonne « Accès rapide » de la vue d'ensemble : rubriques du poste, compte, aide, déconnexion. */
export function QuickAccess({ items, user }: { items: AdminNavItem[]; user: { name: string; position: string } }) {
  const shortcuts = items.filter((i) => i.href !== "/admin" && i.href !== "/admin/guide");
  return (
    <aside aria-label="Accès rapide" className="flex flex-col gap-4 xl:sticky xl:top-6">
      <div className="rounded-3xl bg-gradient-to-br from-ktgw-green-dark to-ktgw-green-strong p-5 text-white shadow-soft">
        <p className="text-xs font-extrabold tracking-widest text-ktgw-sun uppercase">Connecté·e</p>
        <p className="mt-1 truncate text-lg font-bold">{user.name}</p>
        <p className="truncate text-sm text-white/80">{user.position}</p>
        <form action="/auth/signout" method="post" className="mt-4">
          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-ktgw-green-dark hover:bg-white/90"
          >
            <LogOut aria-hidden className="size-4" />
            Se déconnecter
          </button>
        </form>
      </div>

      <nav aria-label="Mes rubriques" className="rounded-3xl bg-card p-3 shadow-soft ring-1 ring-foreground/5">
        <p className="px-3 pt-2 pb-1 text-xs font-extrabold tracking-widest text-ktgw-orange uppercase">Accès rapide</p>
        <ul className="flex flex-col">
          {shortcuts.map((item) => {
            const Icon = navIcons[item.icon];
            return (
              <li key={item.href}>
                <Link href={item.href} className={row}>
                  <Icon aria-hidden className="size-4 shrink-0 text-ktgw-green-strong" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? <span className="rounded-full bg-ktgw-sun px-2 py-0.5 text-[11px] leading-none font-bold text-ink">{item.badge}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 border-t px-3 pt-3 pb-1 text-xs font-extrabold tracking-widest text-ktgw-orange uppercase">Mon compte et aide</p>
        <ul className="flex flex-col">
          <li>
            <Link href="/admin/guide" className={row}>
              <LifeBuoy aria-hidden className="size-4 shrink-0 text-ktgw-green-strong" />
              Mode d&apos;emploi
            </Link>
          </li>
          <li>
            <Link href="/mon-espace" className={row}>
              <UserRound aria-hidden className="size-4 shrink-0 text-ktgw-green-strong" />
              Mon espace personnel
            </Link>
          </li>
          <li>
            <Link href="/mon-espace/mot-de-passe" className={row}>
              <KeyRound aria-hidden className="size-4 shrink-0 text-ktgw-green-strong" />
              Changer mon mot de passe
            </Link>
          </li>
          <li>
            <a href="/" target="_blank" rel="noopener" className={row}>
              <ExternalLink aria-hidden className="size-4 shrink-0 text-ktgw-green-strong" />
              Voir le site
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
