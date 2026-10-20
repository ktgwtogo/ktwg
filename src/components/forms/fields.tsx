"use client";

import { CheckCircle2, Loader2, Mail, RotateCcw } from "lucide-react";
import { useId, type ComponentProps, type MouseEvent, type ReactNode } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { FaWhatsapp } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Delivery } from "@/lib/forms/deliver";
import { cn } from "@/lib/utils";
import { Turnstile } from "./turnstile";
import type { FormOutcome } from "./use-delivery-form";

const control =
  "w-full min-w-0 rounded-xl border border-input bg-card px-4 text-base text-foreground shadow-xs transition-colors outline-none placeholder:text-muted-foreground/70 focus-visible:border-ktgw-orange focus-visible:ring-3 focus-visible:ring-ktgw-sun/40 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15";

type BaseProps = {
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  hint?: string;
  required?: boolean;
  className?: string;
};

/** Gabarit commun : libellé, champ, aide et message d'erreur reliés par aria. */
function FieldShell({
  id,
  label,
  error,
  hint,
  required,
  className,
  children,
}: Omit<BaseProps, "registration"> & { id: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {required && (
          <span aria-hidden className="ml-0.5 text-ktgw-red">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error?.message && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}

const describedBy = (id: string, error?: FieldError, hint?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

export function TextField({
  label,
  registration,
  error,
  hint,
  required,
  className,
  ...input
}: BaseProps & Omit<ComponentProps<"input">, "className">) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-required={required}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(control, "h-12")}
        {...input}
        {...registration}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  registration,
  error,
  hint,
  required,
  className,
  ...textarea
}: BaseProps & Omit<ComponentProps<"textarea">, "className">) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <textarea
        id={id}
        rows={5}
        aria-invalid={error ? true : undefined}
        aria-required={required}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(control, "min-h-32 resize-y py-3")}
        {...textarea}
        {...registration}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  registration,
  error,
  hint,
  required,
  className,
  options,
  placeholder = "Choisir…",
}: BaseProps & { options: readonly string[] | { value: string; label: string }[]; placeholder?: string }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <select
        id={id}
        defaultValue=""
        aria-invalid={error ? true : undefined}
        aria-required={required}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(control, "h-12 appearance-none bg-[length:1.1rem] bg-[right_0.9rem_center] bg-no-repeat pr-10", "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]")}
        {...registration}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
    </FieldShell>
  );
}

/** Groupe de cases à cocher (choix multiples) ou de boutons radio. */
export function ChoiceGroup({
  legend,
  registration,
  error,
  options,
  type = "checkbox",
  required,
  className,
}: {
  legend: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  options: readonly string[];
  type?: "checkbox" | "radio";
  required?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined} className={cn("flex flex-col gap-2", className)}>
      <legend className="mb-1.5 text-sm font-semibold">
        {legend}
        {required && (
          <span aria-hidden className="ml-0.5 text-ktgw-red">
            *
          </span>
        )}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-input bg-card px-4 py-2.5 text-sm transition-colors has-checked:border-ktgw-green has-checked:bg-ktgw-green/10 has-checked:font-semibold has-focus-visible:ring-3 has-focus-visible:ring-ktgw-sun/40"
          >
            <input type={type} value={o} className="size-4 accent-[var(--ktgw-green-strong)]" {...registration} />
            {o}
          </label>
        ))}
      </div>
      {error?.message && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-destructive">
          {error.message}
        </p>
      )}
    </fieldset>
  );
}

/** Consentement RGPD obligatoire. */
export function ConsentField({ registration, error }: { registration: UseFormRegisterReturn; error?: FieldError }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted-foreground">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-1 size-4 shrink-0 accent-[var(--ktgw-green-strong)]"
          {...registration}
        />
        <span>
          J&apos;accepte que KTGW Togo utilise ces informations pour répondre à ma demande, conformément à la{" "}
          <Link href="/confidentialite" className="font-medium text-foreground underline underline-offset-2">
            politique de confidentialité
          </Link>
          .<span aria-hidden className="ml-0.5 text-ktgw-red">*</span>
        </span>
      </label>
      {error?.message && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}

/** Champ piège invisible : les robots le remplissent, les humains non. */
export function Honeypot({ registration }: { registration: UseFormRegisterReturn }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Ne pas remplir ce champ
        <input type="text" tabIndex={-1} autoComplete="off" {...registration} />
      </label>
    </div>
  );
}

/** Résultat d'un envoi : confirmation, ou envoi de secours par WhatsApp / e-mail. */
export function FormResult({
  outcome,
  onReset,
  sentTitle,
  sentText = "Notre équipe vous répondra dans les meilleurs délais. Un accusé de réception vous a été envoyé par e-mail.",
}: {
  outcome: FormOutcome;
  onReset: () => void;
  sentTitle: string;
  sentText?: string;
}) {
  return (
    <div id="form-result">
      {outcome.status === "sent" ? (
        <div role="status" className="flex flex-col items-center gap-5 rounded-2xl bg-card p-8 text-center shadow-soft ring-1 ring-foreground/5 animate-in fade-in zoom-in-95 duration-500">
          <span className="flex size-16 items-center justify-center rounded-full bg-ktgw-green/15 text-ktgw-green-strong">
            <CheckCircle2 aria-hidden className="size-9" />
          </span>
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold">{sentTitle}</h3>
            <p className="max-w-md text-muted-foreground">{sentText}</p>
          </div>
          <Button variant="ghost" onClick={onReset} className="gap-2 text-muted-foreground">
            <RotateCcw aria-hidden />
            Faire une nouvelle demande
          </Button>
        </div>
      ) : (
        <DeliveryPanel delivery={outcome.delivery} onReset={onReset} title="Envoyez-nous votre demande" />
      )}
    </div>
  );
}

/** Message d'erreur renvoyé par le serveur (anti-robot, trop d'envois…). */
export function ServerError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
      {message}
    </p>
  );
}

/** Envoi de secours : propose l'envoi du message préparé par WhatsApp ou e-mail. */
export function DeliveryPanel({ delivery, onReset, title }: { delivery: Delivery; onReset: () => void; title: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-5 rounded-2xl bg-card p-8 text-center shadow-soft ring-1 ring-foreground/5 animate-in fade-in zoom-in-95 duration-500">
      <span className="flex size-16 items-center justify-center rounded-full bg-ktgw-sun/20 text-ktgw-orange">
        <Mail aria-hidden className="size-9" />
      </span>
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="max-w-md text-muted-foreground">
          L&apos;envoi automatique n&apos;a pas abouti. Votre message est déjà rédigé : choisissez comment nous l&apos;envoyer.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <a
          href={delivery.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 font-semibold text-ink transition-opacity hover:opacity-90"
        >
          <FaWhatsapp aria-hidden className="size-5" />
          Envoyer par WhatsApp
        </a>
        <a
          href={delivery.mailto}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ink px-6 font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-ink"
        >
          <Mail aria-hidden className="size-5" />
          Envoyer par e-mail
        </a>
      </div>
      <Button variant="ghost" onClick={onReset} className="gap-2 text-muted-foreground">
        <RotateCcw aria-hidden />
        Modifier ou faire une nouvelle demande
      </Button>
    </div>
  );
}

/**
 * Empêche le bouton de prendre le focus à l'appui de la souris.
 * Sinon, le champ quitté est revalidé, son message d'erreur disparaît, la page
 * remonte d'une ligne et le clic « tombe » à côté du bouton. Sans effet au clavier.
 */
export const keepFieldFocus = (e: MouseEvent) => e.preventDefault();

/** Bouton d'envoi pleine largeur sur mobile, précédé de la vérification anti-robot. */
export function SubmitButton({ children, pending, captcha = true }: { children: ReactNode; pending?: boolean; captcha?: boolean }) {
  return (
    <>
      {captcha && <Turnstile />}
      <Button type="submit" size="xl" disabled={pending} aria-busy={pending} onMouseDown={keepFieldFocus} className="w-full sm:w-auto">
        {pending ? <Loader2 aria-hidden className="animate-spin" /> : null}
        {pending ? "Envoi en cours…" : children}
      </Button>
    </>
  );
}
