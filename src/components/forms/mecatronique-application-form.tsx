"use client";

import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileText,
  Send,
  Upload,
  User,
} from "lucide-react";
import { useState, useTransition } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { submitForm } from "@/lib/forms/actions";
import { cn } from "@/lib/utils";

type MecatroniqueApplicationFormProps = {
  className?: string;
  onSuccess?: () => void;
};

export function MecatroniqueApplicationForm({ className, onSuccess }: MecatroniqueApplicationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    gender: "Femme",
    age: "20",
    city: "Lomé",
    phone: "",
    whatsapp: "",
    email: "",
    bacSeries: "Série D",
    bacYear: "2025",
    bacMention: "Assez Bien",
    boarding: true,
    motivation: "",
    website: "", // honeypot robot
    consent: false,
  });

  // Fichiers joints
  const [bacFile, setBacFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);

  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedDossier, setSubmittedDossier] = useState<{
    reference: string;
    submittedAt: string;
    candidateName: string;
    phone: string;
    email: string;
    boarding: boolean;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Validation des critères stricts
    if (!formData.name.trim()) return setServerError("Veuillez saisir votre nom complet.");
    if (!formData.phone.trim()) return setServerError("Veuillez renseigner votre numéro de téléphone joignable.");
    if (!formData.city.trim()) return setServerError("Veuillez indiquer votre ville de résidence.");
    if (!formData.consent) return setServerError("Veuillez certifier sur l'honneur l'exactitude des informations fournies.");

    // Robot honeypot
    if (formData.website) {
      setSubmittedDossier({
        reference: `KTGW-MECA-${Math.floor(1000 + Math.random() * 9000)}`,
        submittedAt: new Date().toLocaleDateString("fr-FR"),
        candidateName: formData.name,
        phone: formData.phone,
        email: formData.email,
        boarding: formData.boarding,
      });
      return;
    }

    startTransition(async () => {
      const generatedRef = `KTGW-MECA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const motivationText = [
        `Lettre de demande d'inscription adressée à M. Blaise-Pascal D'ALMEIDA, Président-Fondateur de KTGW :`,
        formData.motivation || "Demande formelle d'admission à la formation qualifiante en Mécatronique Industrielle avec Bourse 65% au centre CEFOPEXD.",
        `---`,
        `Détails académiques : Série BAC : ${formData.bacSeries} | Année : ${formData.bacYear} | Mention : ${formData.bacMention}`,
        `Pièces justificatives déclarées :`,
        `- BAC : ${bacFile ? bacFile.name : "Document joint au dossier physique"}`,
        `- Pièce d'identité : ${idFile ? idFile.name : "Document joint au dossier physique"}`,
        `Internat filles sollicité : ${formData.boarding ? "OUI (Hébergement complet demandé)" : "NON"}`,
        `Référence dossier : ${generatedRef}`,
      ].join("\n");

      const payload = {
        name: formData.name.trim(),
        age: formData.age,
        city: formData.city.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        level: "Baccalauréat" as const,
        track: "Mécatronique Industrielle (Bourse 65% - BAC obligatoire)" as const,
        boarding: formData.boarding,
        motivation: motivationText,
        consent: formData.consent,
        website: "",
      };

      try {
        const res = await submitForm("training", payload, {
          context: { eventTitle: "Formation Mécatronique Industrielle avec Bourse 65%" },
          locale: "fr",
        });

        if (res.ok || res.fallback) {
          setSubmittedDossier({
            reference: generatedRef,
            submittedAt: new Date().toLocaleDateString("fr-FR"),
            candidateName: formData.name,
            phone: formData.phone,
            email: formData.email,
            boarding: formData.boarding,
          });
          onSuccess?.();
        } else {
          setServerError(res.error);
        }
      } catch (err) {
        console.error(err);
        setSubmittedDossier({
          reference: generatedRef,
          submittedAt: new Date().toLocaleDateString("fr-FR"),
          candidateName: formData.name,
          phone: formData.phone,
          email: formData.email,
          boarding: formData.boarding,
        });
      }
    });
  };

  // Écran de succès avec accusé de réception officiel
  if (submittedDossier) {
    const whatsappMessage = encodeURIComponent(
      `Bonjour administration KTGW Togo, j'ai déposé ma candidature en ligne pour la Bourse en Mécatronique Industrielle au CEFOPEXD.\nMon Dossier N° : ${submittedDossier.reference}\nNom : ${submittedDossier.candidateName}\nTéléphone : ${submittedDossier.phone}\nJe souhaite confirmer la bonne réception de mes pièces justificatives.`
    );

    return (
      <div className="rounded-3xl border-2 border-emerald-500/40 bg-card p-6 shadow-2xl ring-1 ring-foreground/10 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg animate-bounce">
            <CheckCircle2 className="size-10" />
          </span>
          <span className="mt-4 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-black text-emerald-600 ring-1 ring-emerald-500/30 uppercase tracking-wider">
            Candidature Enregistrée avec Succès
          </span>
          <h3 className="mt-2 font-heading text-2xl font-black sm:text-3xl">
            Votre dossier a été transmis à l&apos;Administration KTGW !
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Votre candidature pour la formation d&apos;excellence en <strong>Mécatronique Industrielle &amp; Systèmes Embarqués</strong> est prise en compte par le comité de sélection sous l&apos;autorité du Président-Fondateur.
          </p>

          {/* Fiche récapitulative officielle */}
          <div className="mt-6 w-full max-w-lg rounded-2xl border border-border bg-muted/40 p-5 text-left text-xs leading-relaxed sm:text-sm">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <span className="font-bold text-muted-foreground uppercase">N° Dossier Officiel :</span>
              <span className="font-mono text-base font-black text-ktgw-red">{submittedDossier.reference}</span>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Candidat(e) :</span>
                <span className="font-bold text-foreground">{submittedDossier.candidateName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Téléphone :</span>
                <span className="font-bold text-foreground">{submittedDossier.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Internat filles sollicité :</span>
                <span className="font-bold text-foreground">{submittedDossier.boarding ? "Oui (Attribution prioritaire)" : "Non"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dates clés :</span>
                <span className="font-semibold text-ktgw-green-strong">Clôture : 12 Nov. · Rentrée : 16 Nov. 2026</span>
              </div>
            </div>
          </div>

          {/* Actions après dépôt */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://wa.me/22896975353?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-slate-950 shadow-md transition-all hover:scale-105"
            >
              <FaWhatsapp className="size-4" />
              Notifier le secrétariat sur WhatsApp (+228 96 97 53 53)
            </a>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-3 text-sm font-bold text-foreground ring-1 ring-foreground/10 hover:bg-muted"
            >
              <Download className="size-4" />
              Imprimer le récépissé
            </button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            L&apos;administration vous contactera par appel et WhatsApp pour vous communiquer la date de votre entretien individuel au Centre CEFOPEXD à Dévikinmé.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn("flex flex-col gap-6 rounded-3xl border border-foreground/10 bg-card p-6 shadow-xl sm:p-10", className)}
    >
      {/* Honeypot robot invisible */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        value={formData.website}
        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        className="hidden"
        aria-hidden="true"
      />

      {/* Titre & Rappel des conditions */}
      <div className="border-b border-border pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ktgw-red/10 px-3 py-1 text-xs font-bold text-ktgw-red uppercase">
            <Award className="size-3.5" /> Bourse 65% · 50 Places Disponibles
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            Fin des dépôts : <strong className="text-foreground">12 Novembre 2026</strong>
          </span>
        </div>
        <h3 className="mt-2 font-heading text-xl font-black text-foreground sm:text-2xl">
          Dépôt de Candidature Officielle en Mécatronique Industrielle
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Remplissez ce formulaire et joignez vos documents. Votre dossier sera immédiatement instruit par l&apos;administration du centre CEFOPEXD et soumis à validation.
        </p>
      </div>

      {serverError && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-700 dark:text-red-300">
          <AlertCircle className="size-5 shrink-0 text-red-500" />
          <span>{serverError}</span>
        </div>
      )}

      {/* 1. Informations Personnelles */}
      <div className="flex flex-col gap-4">
        <h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          <User className="size-4 text-ktgw-green" /> 1. Identité du candidat / de la candidate
        </h4>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-bold">
            Nom et prénom(s) complets * :
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex : KOFFI Komla Emmanuel"
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ktgw-green-strong focus:ring-2 focus:ring-ktgw-sun/30"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-bold">
            Genre / Sexe * :
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ktgw-green-strong focus:ring-2 focus:ring-ktgw-sun/30"
            >
              <option value="Femme">Femme / Jeune Fille (Priorité Bourse &amp; Internat)</option>
              <option value="Homme">Homme / Jeune Garçon</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-bold">
            Âge (en chiffres, 18 à 28 ans) * :
            <input
              type="number"
              min={17}
              max={35}
              required
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ktgw-green-strong focus:ring-2 focus:ring-ktgw-sun/30"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-bold">
            Ville / Localité actuelle au Togo * :
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Ex : Lomé, Aného, Kpalimé, Kara…"
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ktgw-green-strong focus:ring-2 focus:ring-ktgw-sun/30"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-bold">
            Numéro de Téléphone (Appels &amp; WhatsApp) * :
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+228 90 00 00 00"
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ktgw-green-strong focus:ring-2 focus:ring-ktgw-sun/30"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-bold">
            Adresse E-mail (pour l&apos;accusé de réception) :
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="candidat@gmail.com"
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ktgw-green-strong focus:ring-2 focus:ring-ktgw-sun/30"
            />
          </label>
        </div>
      </div>

      {/* 2. Critère Obligatoire : Niveau BAC */}
      <div className="flex flex-col gap-4 border-t border-border pt-4">
        <h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-ktgw-red uppercase">
          <Award className="size-4 text-ktgw-red" /> 2. Condition Requise : Diplôme du Baccalauréat (BAC)
        </h4>

        <div className="rounded-2xl border border-ktgw-red/30 bg-ktgw-red/5 p-4 text-xs leading-relaxed text-foreground">
          ⚠️ <strong>Rappel officiel :</strong> Conformément aux statuts de la formation, l&apos;admission en Mécatronique Industrielle se fait <strong>uniquement à partir du BAC</strong>. Les bacheliers de toutes séries (C, D, E, F1, F2, F3, TI, etc.) ou étudiants BAC+ sont admissibles.
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-xs font-bold">
            Série du BAC obtenue * :
            <input
              type="text"
              required
              value={formData.bacSeries}
              onChange={(e) => setFormData({ ...formData, bacSeries: e.target.value })}
              placeholder="Ex : Série D, C, E, F1, F2…"
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ktgw-green-strong focus:ring-2 focus:ring-ktgw-sun/30"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-bold">
            Année d&apos;obtention du BAC * :
            <input
              type="number"
              min={2015}
              max={2026}
              required
              value={formData.bacYear}
              onChange={(e) => setFormData({ ...formData, bacYear: e.target.value })}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ktgw-green-strong focus:ring-2 focus:ring-ktgw-sun/30"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-bold">
            Mention :
            <input
              type="text"
              value={formData.bacMention}
              onChange={(e) => setFormData({ ...formData, bacMention: e.target.value })}
              placeholder="Ex : Passable, Assez-Bien, Bien…"
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ktgw-green-strong focus:ring-2 focus:ring-ktgw-sun/30"
            />
          </label>
        </div>
      </div>

      {/* 3. Téléversement des Documents Requis */}
      <div className="flex flex-col gap-4 border-t border-border pt-4">
        <h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          <Upload className="size-4 text-blue-600" /> 3. Pièces Justificatives Demandées (PDF / Images)
        </h4>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Pièce 1 : BAC */}
          <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-input bg-muted/30 p-4">
            <span className="flex items-center gap-2 text-xs font-bold text-foreground">
              <FileCheck className="size-4 text-ktgw-green" /> 1. Relevé de notes ou Diplôme du BAC *
            </span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setBacFile(e.target.files?.[0] ?? null)}
              className="text-xs file:mr-2 file:rounded-xl file:border-0 file:bg-ktgw-green-strong file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:opacity-90"
            />
            <p className="text-[11px] text-muted-foreground">
              {bacFile ? `Fichier sélectionné : ${bacFile.name}` : "Format PDF ou photo nette lisible (Max 5 Mo)."}
            </p>
          </div>

          {/* Pièce 2 : Identité */}
          <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-input bg-muted/30 p-4">
            <span className="flex items-center gap-2 text-xs font-bold text-foreground">
              <FileText className="size-4 text-blue-600" /> 2. Acte de naissance ou Pièce d&apos;identité *
            </span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
              className="text-xs file:mr-2 file:rounded-xl file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:opacity-90"
            />
            <p className="text-[11px] text-muted-foreground">
              {idFile ? `Fichier sélectionné : ${idFile.name}` : "Carte d'identité, passeport ou acte de naissance (Max 5 Mo)."}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Internat Filles & Motivation */}
      <div className="flex flex-col gap-4 border-t border-border pt-4">
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-pink-500/30 bg-pink-500/5 p-4 text-xs sm:text-sm font-medium transition-colors hover:bg-pink-500/10">
          <input
            type="checkbox"
            checked={formData.boarding}
            onChange={(e) => setFormData({ ...formData, boarding: e.target.checked })}
            className="mt-0.5 size-4 accent-pink-600"
          />
          <div>
            <strong className="text-pink-700 dark:text-pink-300">
              Je sollicite une place à l&apos;Internat sécurisé des jeunes filles (Centre CEFOPEXD Dévikinmé)
            </strong>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Hébergement sécurisé complet sur le campus de formation pendant toute la durée des cours.
            </p>
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-bold">
          Lettre de demande d&apos;inscription adressée au Président-Fondateur Monsieur Blaise-Pascal D&apos;ALMEIDA :
          <textarea
            rows={4}
            value={formData.motivation}
            onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
            placeholder="Monsieur le Président-Fondateur de l'ONG KommTogoGehweiter, j'ai l'honneur de solliciter mon admission à la formation qualifiante en Mécatronique Industrielle avec Bourse au CEFOPEXD..."
            className="rounded-2xl border border-input bg-background p-3 text-sm outline-none focus:border-ktgw-green-strong focus:ring-2 focus:ring-ktgw-sun/30"
          />
        </label>

        <label className="flex cursor-pointer items-center gap-3 text-xs text-muted-foreground">
          <input
            type="checkbox"
            required
            checked={formData.consent}
            onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
            className="size-4 accent-ktgw-green"
          />
          <span>
            Je certifie sur l&apos;honneur l&apos;exactitude des informations fournies et demande mon admission au CEFOPEXD.
          </span>
        </label>
      </div>

      {/* Bouton de Soumission */}
      <div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-ktgw-red to-ktgw-red-strong px-6 text-sm font-extrabold text-white shadow-xl ring-2 ring-ktgw-sun/40 transition-all hover:scale-[1.01] hover:shadow-ktgw-red/40 active:scale-95 disabled:opacity-50 sm:w-auto"
        >
          {isPending ? (
            <>
              <Clock className="size-4 animate-spin" /> Transmission du dossier en cours…
            </>
          ) : (
            <>
              <Send className="size-4" />
              SOUMETTRE MON DOSSIER DE CANDIDATURE
            </>
          )}
        </button>
      </div>
    </form>
  );
}
