import { ArrowRight } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { PageHeading } from "@/components/admin/page-heading";
import { ValidationRule } from "@/components/admin/validation-rule";
import { Link, redirect } from "@/i18n/navigation";
import { guides } from "@/lib/admin/guides";
import { getAdminNav } from "@/lib/admin/nav";
import { getStaff } from "@/lib/admin/staff";

/** Mode d'emploi : la marche à suivre de chaque rubrique accessible au poste connecté. */
export default async function GuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  const items = await getAdminNav(staff);
  const mine = guides.filter((g) => items.some((i) => i.href === g.href));

  return (
    <>
      <PageHeading
        title="Mode d'emploi"
        description={`Comment faire chaque tâche de votre poste${staff.position ? ` (${staff.position.name})` : ""}, et comment elle est validée.`}
      />
      <ValidationRule presidency={staff.presidency} />
      <nav aria-label="Sommaire" className="flex flex-wrap gap-2">
        {mine.map((g) => (
          <a
            key={g.href}
            href={`#${g.href.replaceAll("/", "-").slice(1)}`}
            className="rounded-full bg-card px-3 py-1.5 text-sm font-semibold ring-1 ring-foreground/10 hover:ring-ktgw-green/40"
          >
            {g.title}
          </a>
        ))}
      </nav>
      <div className="grid gap-4 lg:grid-cols-2">
        {mine.map((g) => (
          <section
            key={g.href}
            id={g.href.replaceAll("/", "-").slice(1)}
            className="flex scroll-mt-24 flex-col gap-3 rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5"
          >
            <h2 className="text-lg font-bold text-ktgw-green-dark dark:text-ktgw-green">{g.title}</h2>
            <p className="text-sm text-muted-foreground">{g.summary}</p>
            <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm marker:font-bold marker:text-ktgw-green-strong">
              {g.steps.map((step) => (
                <li key={step}>{step.replace(/^\d\.\s/, "")}</li>
              ))}
            </ol>
            <Link href={g.href} className="mt-auto inline-flex w-fit items-center gap-1 text-sm font-semibold text-ktgw-red">
              Ouvrir la rubrique
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </section>
        ))}
      </div>
    </>
  );
}
