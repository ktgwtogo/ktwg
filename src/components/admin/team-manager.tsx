"use client";

import { Copy, KeyRound, Plus, Save, ShieldOff, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { ServerError } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { permissionGroups } from "@/lib/admin/permissions";
import { assignPosition, createStaffAccount, deletePosition, resetStaffPassword, savePosition, setAccountActive } from "@/lib/admin/team-actions";

const field =
  "h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-ktgw-orange focus-visible:ring-3 focus-visible:ring-ktgw-sun/40";

export type PositionOption = { id: string; name: string };

/** Mot de passe provisoire affiché une seule fois, avec bouton de copie. */
function TemporaryPassword({ password, email }: { password: string; email: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div role="status" className="rounded-2xl bg-ktgw-green/10 p-4 text-sm">
      <p className="font-semibold text-ktgw-green-strong">Mot de passe provisoire de {email} (envoyé aussi par e-mail) :</p>
      <div className="mt-2 flex items-center gap-2">
        <code className="rounded-lg bg-card px-3 py-2 font-mono text-base font-bold tracking-wider">{password}</code>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigator.clipboard.writeText(password).then(() => setCopied(true))}
        >
          <Copy aria-hidden />
          {copied ? "Copié" : "Copier"}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Il ne sera plus affiché. La personne devra le changer à sa première connexion.</p>
    </div>
  );
}

/** Création du compte d'un membre du bureau. */
export function CreateAccountForm({ positions }: { positions: PositionOption[] }) {
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ password: string; email: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setError(null);
    setCreated(null);
    startTransition(async () => {
      const result = await createStaffAccount({ fullName: data.get("fullName"), email: data.get("email"), positionId: data.get("positionId") });
      if (!result.ok) return setError(result.error);
      setCreated({ password: result.password!, email: String(data.get("email")) });
      form.reset();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Nom complet
          <input name="fullName" required minLength={2} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          E-mail
          <input name="email" type="email" required className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Poste
          <select name="positionId" required defaultValue="" className={field}>
            <option value="" disabled>
              Choisir…
            </option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ServerError message={error} />
      {created && <TemporaryPassword {...created} />}
      <div>
        <Button type="submit" size="lg" disabled={pending}>
          <UserPlus aria-hidden />
          {pending ? "Création…" : "Créer le compte"}
        </Button>
      </div>
    </form>
  );
}

/** Poste, suspension et mot de passe d'un compte du bureau. */
export function StaffControls({
  userId,
  email,
  positionId,
  active,
  positions,
  isSelf,
}: {
  userId: string;
  email: string;
  positionId: string | null;
  active: boolean;
  positions: PositionOption[];
  isSelf: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string; password?: string }>) =>
    startTransition(async () => {
      setError(null);
      const r = await fn();
      if (!r.ok) setError(r.error ?? "Erreur.");
      else if (r.password) setPassword(r.password);
    });

  if (isSelf) return <p className="text-sm text-muted-foreground">Votre compte</p>;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label={`Poste de ${email}`}
          defaultValue={positionId ?? ""}
          disabled={pending}
          onChange={(e) => run(() => assignPosition(userId, e.target.value || null))}
          className={`${field} h-9 w-auto`}
        >
          <option value="">Aucun poste (membre simple)</option>
          {positions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => window.confirm(`Envoyer un nouveau mot de passe provisoire à ${email} ?`) && run(() => resetStaffPassword(userId))}
        >
          <KeyRound aria-hidden />
          Mot de passe
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => window.confirm(active ? `Suspendre le compte de ${email} ?` : `Réactiver le compte de ${email} ?`) && run(() => setAccountActive(userId, !active))}
          className={active ? "text-destructive" : "text-ktgw-green-strong"}
        >
          {active ? <ShieldOff aria-hidden /> : <ShieldCheck aria-hidden />}
          {active ? "Suspendre" : "Réactiver"}
        </Button>
      </div>
      <ServerError message={error} />
      {password && <TemporaryPassword password={password} email={email} />}
    </div>
  );
}

/** Donne un poste à un compte déjà inscrit sur le site. */
export function AssignExisting({ people, positions }: { people: { id: string; label: string }[]; positions: PositionOption[] }) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);
    setDone(false);
    startTransition(async () => {
      const r = await assignPosition(String(data.get("userId")), String(data.get("positionId")));
      if (!r.ok) setError(r.error);
      else setDone(true);
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Compte inscrit
          <select name="userId" required defaultValue="" className={field}>
            <option value="" disabled>
              Choisir…
            </option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Poste
          <select name="positionId" required defaultValue="" className={field}>
            <option value="" disabled>
              Choisir…
            </option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ServerError message={error} />
      {done && <p className="text-sm font-semibold text-ktgw-green-strong">Poste attribué. La personne a été notifiée.</p>}
      <div>
        <Button type="submit" size="lg" variant="outline" disabled={pending}>
          Attribuer le poste
        </Button>
      </div>
    </form>
  );
}

/** Nom, description et permissions d'un poste (création si `position` est absent). */
export function PositionEditor({
  position,
}: {
  position?: { id: string; name: string; description: string; permissions: string[]; is_system: boolean };
}) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const isNew = !position;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const r = await savePosition({
        id: position?.id ?? data.get("id"),
        name: data.get("name"),
        description: data.get("description"),
        permissions: data.getAll("permissions"),
      });
      if (!r.ok) return setError(r.error);
      setSaved(true);
      if (isNew) form.reset();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {isNew && (
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Identifiant (ex. vice-president)
            <input name="id" required pattern="[a-z0-9-]{2,40}" className={field} />
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Nom du poste
          <input name="name" required defaultValue={position?.name} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold sm:col-span-2">
          Description
          <input name="description" defaultValue={position?.description} maxLength={300} className={field} />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {permissionGroups.map((g) => (
          <fieldset key={g.label} className="flex flex-col gap-2">
            <legend className="mb-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">{g.label}</legend>
            {g.items.map((p) => (
              <label key={p.id} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  name="permissions"
                  value={p.id}
                  defaultChecked={position?.permissions.includes(p.id)}
                  className="mt-0.5 size-4 accent-[var(--ktgw-green-strong)]"
                />
                {p.label}
              </label>
            ))}
          </fieldset>
        ))}
      </div>
      <ServerError message={error} />
      {saved && <p className="text-sm font-semibold text-ktgw-green-strong">Poste enregistré.</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="lg" disabled={pending}>
          {isNew ? <Plus aria-hidden /> : <Save aria-hidden />}
          {isNew ? "Créer le poste" : "Enregistrer"}
        </Button>
        {position && !position.is_system && (
          <Button
            type="button"
            size="lg"
            variant="outline"
            disabled={pending}
            className="text-destructive"
            onClick={() =>
              window.confirm(`Supprimer le poste « ${position.name} » ? Les comptes concernés n'auront plus de poste.`) &&
              startTransition(async () => {
                const r = await deletePosition(position.id);
                if (!r.ok) setError(r.error);
              })
            }
          >
            <Trash2 aria-hidden />
            Supprimer
          </Button>
        )}
      </div>
    </form>
  );
}
