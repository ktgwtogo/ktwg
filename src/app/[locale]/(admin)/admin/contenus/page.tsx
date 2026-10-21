import { ArrowRight } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { Link, redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { canEdit, contentTypes } from "@/lib/content/config";

/** Contenus du site modifiables par le poste connecté. */
export default async function ContentHub({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  const types = contentTypes.filter((t) => canEdit(t, staff.can));
  if (!types.length) return <Forbidden />;

  const counts = await Promise.all(
    types.map(async (t) => {
      const { count } = await staff.supabase.from(t.table as "posts").select("id", { count: "exact", head: true });
      return count ?? 0;
    })
  );

  return (
    <>
      <PageHeading
        title="Contenus du site"
        description={
          staff.presidency
            ? "Modifiez les textes, images et publications du site. Vos changements sont en ligne immédiatement."
            : "Proposez des modifications : elles sont publiées sur le site après validation par la présidence."
        }
      />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {types.map((t, i) => (
          <li key={t.id}>
            <Link
              href={`/admin/contenus/${t.id}`}
              className="group flex h-full flex-col gap-2 rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 hover:ring-ktgw-green/40"
            >
              <p className="text-3xl font-extrabold tabular-nums">{counts[i]}</p>
              <p className="flex items-center gap-1 text-lg font-bold">
                {t.label}
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
              </p>
              <p className="text-sm text-muted-foreground">{t.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
