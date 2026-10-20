"use client";

import { Camera, CheckCircle2, Save, UserRound } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { SelectField, ServerError, SubmitButton, TextAreaField, TextField } from "@/components/forms/fields";
import { zodResolver } from "@/lib/forms/zod-resolver";
import { updateProfile } from "@/lib/member/actions";
import { createClient } from "@/lib/supabase/client";
import { civilities, profileSchema, type ProfileValues } from "@/lib/validations/member";

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PHOTO_MAX = 3 * 1024 * 1024;

/** Formulaire du profil : identité, coordonnées, présentation et photo. */
export function ProfileForm({ userId, defaults, photoUrl }: { userId: string; defaults: Partial<ProfileValues>; photoUrl: string | null }) {
  const form = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: defaults, mode: "onTouched" });
  const { register, formState } = form;
  const errors = formState.errors;
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [preview, setPreview] = useState(photoUrl);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const onPhoto = async (file: File | undefined) => {
    setPhotoError(null);
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) return setPhotoError("Format accepté : JPG, PNG ou WebP.");
    if (file.size > PHOTO_MAX) return setPhotoError("Photo trop lourde : 3 Mo maximum.");
    setUploading(true);
    const path = `${userId}/photo-${Date.now()}.${file.type.split("/")[1].replace("jpeg", "jpg")}`;
    const { error } = await createClient().storage.from("avatars").upload(path, file, { contentType: file.type });
    setUploading(false);
    if (error) return setPhotoError("Le dépôt de la photo a échoué. Réessayez.");
    setPhotoPath(path);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = form.handleSubmit((values) => {
    setError(null);
    setSaved(false);
    if (!preview) return setPhotoError("Ajoutez une photo de vous.");
    startTransition(async () => {
      const result = await updateProfile(values, photoPath);
      if (!result.ok) return setError(result.error);
      setSaved(true);
      setPhotoPath(null);
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-bold">Photo</legend>
        <div className="flex items-center gap-5">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Votre photo de profil" className="size-24 rounded-full object-cover ring-2 ring-ktgw-green/40" />
          ) : (
            <span className="flex size-24 items-center justify-center rounded-full bg-muted">
              <UserRound aria-hidden className="size-10 text-muted-foreground" />
            </span>
          )}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-border px-4 text-sm font-semibold disabled:opacity-60"
            >
              <Camera aria-hidden className="size-4" />
              {uploading ? "Envoi…" : preview ? "Changer la photo" : "Ajouter une photo"}
            </button>
            <p className="text-xs text-muted-foreground">Photo d&apos;identité récente, JPG ou PNG, 3 Mo maximum. Visible uniquement par vous et l&apos;association.</p>
            <input ref={fileRef} type="file" accept={PHOTO_TYPES.join(",")} className="sr-only" tabIndex={-1} onChange={(e) => onPhoto(e.target.files?.[0])} />
            {photoError && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {photoError}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-2 text-lg font-bold">Identité</legend>
        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField label="Civilité" required options={civilities} registration={register("civility")} error={errors.civility} />
          <TextField label="Prénom" required autoComplete="given-name" registration={register("firstName")} error={errors.firstName} />
          <TextField label="Nom" required autoComplete="family-name" registration={register("lastName")} error={errors.lastName} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Date de naissance" required type="date" autoComplete="bday" registration={register("birthDate")} error={errors.birthDate} />
          <TextField label="Nationalité" required registration={register("nationality")} error={errors.nationality} />
          <TextField label="Profession ou études" required autoComplete="organization-title" registration={register("profession")} error={errors.profession} />
          <TextField label="Organisation / employeur" autoComplete="organization" registration={register("organization")} error={errors.organization} />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-2 text-lg font-bold">Coordonnées</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Téléphone" required type="tel" autoComplete="tel" placeholder="+228 90 00 00 00" registration={register("phone")} error={errors.phone} />
          <TextField label="WhatsApp (si différent)" type="tel" registration={register("whatsapp")} error={errors.whatsapp} />
        </div>
        <TextField label="Adresse" required autoComplete="street-address" registration={register("address")} error={errors.address} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Ville" required autoComplete="address-level2" registration={register("city")} error={errors.city} />
          <TextField label="Pays" required autoComplete="country-name" registration={register("country")} error={errors.country} />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-2 text-lg font-bold">Présentation</legend>
        <TextAreaField
          label="Ma bio"
          required
          rows={6}
          hint="Qui êtes-vous ? Votre parcours, vos centres d'intérêt, votre lien avec le Togo ou l'Allemagne…"
          registration={register("bio")}
          error={errors.bio}
        />
      </fieldset>

      <ServerError message={error} />
      {saved && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-ktgw-green/10 px-4 py-3 text-sm font-semibold text-ktgw-green-strong">
          <CheckCircle2 aria-hidden className="size-5" />
          Profil enregistré.
        </p>
      )}
      <div>
        <SubmitButton pending={pending || uploading} captcha={false}>
          <Save aria-hidden />
          Enregistrer mon profil
        </SubmitButton>
      </div>
    </form>
  );
}
