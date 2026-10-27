"use client";

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Award,
  CheckCircle2,
  Copy,
  Eye,
  Globe2,
  Layers,
  LayoutTemplate,
  Link as LinkIcon,
  Mail,
  MapPin,
  Megaphone,
  Monitor,
  MoveDown,
  MoveUp,
  Palette,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Send,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useState, useTransition } from "react";
import { FaFacebook, FaLinkedin, FaTiktok, FaWhatsapp } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { presidentFounder } from "@/content/organization";
import { assignSiteDesigner, publishGlobalSiteBuilder } from "@/lib/site/actions";
import type { GlobalSiteData, SectionBlock, SiteAnnouncement, ThemeSettings } from "@/lib/site/builder-state";
import { cn } from "@/lib/utils";

type SiteBuilderStudioProps = {
  initialData: GlobalSiteData;
  isPresidency: boolean;
  currentUserEmail?: string;
  designerEmail: string;
};

const inputClass =
  "h-10 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none transition-all focus:border-ktgw-green-strong focus:ring-2 focus:ring-ktgw-sun/30";

export function SiteBuilderStudio({
  initialData,
  isPresidency,
  currentUserEmail,
  designerEmail: initialDesignerEmail,
}: SiteBuilderStudioProps) {
  const [data, setData] = useState<GlobalSiteData>(initialData);
  const [activeTab, setActiveTab] = useState<"sections" | "annonces" | "theme" | "designer" | "preview">("sections");
  const [selectedPage, setSelectedPage] = useState<string>("accueil");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewLocale, setPreviewLocale] = useState<"fr" | "de" | "en">("fr");
  const [designerEmailInput, setDesignerEmailInput] = useState(initialDesignerEmail);

  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isDesigner =
    isPresidency || (currentUserEmail && currentUserEmail.toLowerCase() === data.designerEmail.toLowerCase());

  // Sauvegarde & Publication immédiate
  const handlePublish = () => {
    startTransition(async () => {
      setNotification(null);
      const res = await publishGlobalSiteBuilder(data);
      if (res.ok) {
        setData((prev) => ({
          ...prev,
          lastPublishedAt: new Date().toISOString(),
          publishedBy: currentUserEmail ?? presidentFounder.name,
        }));
        setNotification({
          type: "success",
          message: "Site publié avec succès ! Toutes les modifications sont désormais en ligne immédiatement.",
        });
      } else {
        setNotification({ type: "error", message: res.error });
      }
    });
  };

  // Attribution par le Président
  const handleAssignDesigner = () => {
    startTransition(async () => {
      setNotification(null);
      const res = await assignSiteDesigner(designerEmailInput);
      if (res.ok) {
        setData((prev) => ({ ...prev, designerEmail: designerEmailInput.trim().toLowerCase() }));
        setNotification({
          type: "success",
          message: `L'administrateur (${designerEmailInput}) a été désigné avec succès par le Président pour la gestion du site.`,
        });
      } else {
        setNotification({ type: "error", message: res.error });
      }
    });
  };

  // Gestion des sections
  const updateSection = (id: string, patch: Partial<SectionBlock>) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.sections.length) return;
    const newSections = [...data.sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);
    setData((prev) => ({ ...prev, sections: newSections }));
  };

  const addCustomSection = () => {
    const newSec: SectionBlock = {
      id: `custom-sec-${Date.now()}`,
      page: selectedPage,
      name: "Nouvelle Section Personnalisée",
      category: "content",
      enabled: true,
      title: "Titre de la nouvelle section",
      subtitle: "Description ou sous-titre de la section à personnaliser.",
      eyebrow: "Rubrique",
      ctaText: "En savoir plus",
      ctaUrl: "#",
    };
    setData((prev) => ({ ...prev, sections: [...prev.sections, newSec] }));
  };

  const deleteSection = (id: string) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }));
  };

  // Gestion du Thème
  const updateTheme = (patch: Partial<ThemeSettings>) => {
    setData((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...patch },
    }));
  };

  // Filtrage des sections par page
  const pageSections = data.sections.filter((s) => s.page === selectedPage || s.page === "global");

  return (
    <div className="flex flex-col gap-6">
      {/* ── BARRE SUPÉRIEURE STRATÉGIQUE AVEC BOUTON PUBLIER ── */}
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/20 bg-gradient-to-r from-slate-950 via-slate-900 to-ktgw-green-dark p-5 text-white shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ktgw-sun text-slate-950 shadow-lg">
            <LayoutTemplate className="size-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-lg font-extrabold sm:text-xl">
                Gestion Globale du Site &amp; Studio Builder
              </h1>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/30">
                Mode Divi / Astra
              </span>
            </div>
            <p className="text-xs text-white/70">
              Dernière publication :{" "}
              {data.lastPublishedAt ? new Date(data.lastPublishedAt).toLocaleString("fr-FR") : "Jamais"} · Par{" "}
              <strong className="text-white">{data.publishedBy ?? presidentFounder.name}</strong>
            </p>
          </div>
        </div>

        {/* Boutons d'action : Publier & Aperçu */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-semibold text-white transition-colors hover:bg-white/20"
          >
            <Eye className="size-4" />
            Voir le site en ligne
          </a>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isPending}
            className="inline-flex h-11 items-center gap-2.5 rounded-xl bg-gradient-to-r from-ktgw-red to-rose-600 px-6 text-sm font-extrabold text-white shadow-xl ring-2 ring-ktgw-sun transition-all hover:scale-105 hover:shadow-ktgw-red/50 active:scale-95 disabled:opacity-60"
          >
            {isPending ? <RefreshCw className="size-5 animate-spin" /> : <Send className="size-5" />}
            <span>PUBLIER LES MODIFICATIONS</span>
            <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-bold text-ktgw-sun uppercase">
              Immédiat
            </span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl p-4 text-sm font-semibold shadow-md",
            notification.type === "success"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
              : "border border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-300"
          )}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="size-5 shrink-0 text-red-500" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* ── ONGLETS PRINCIPAUX ── */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          { id: "sections", label: "Constructeur de Sections", icon: Layers },
          { id: "annonces", label: "Annonces & Réseaux Sociaux", icon: Megaphone },
          { id: "theme", label: "Design Contour & Thème", icon: Palette },
          { id: "designer", label: "Attribution Web Designer (Président)", icon: ShieldCheck },
          { id: "preview", label: "Prévisualisation en Direct", icon: Monitor },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm",
                active
                  ? "bg-ktgw-green-strong text-white shadow-md ring-2 ring-ktgw-green"
                  : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── CONTENU DES ONGLETS ── */}

      {/* 1. CONSTRUCTEUR DE SECTIONS */}
      {activeTab === "sections" && (
        <div className="flex flex-col gap-6">
          {/* Sélecteur de page */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">Page à éditer :</span>
              {[
                { id: "accueil", label: "Page d'Accueil (/)" },
                { id: "formations", label: "Formations (/formations)" },
                { id: "objectifs", label: "Objectifs ODD (/objectifs)" },
                { id: "a-propos", label: "À propos (/a-propos)" },
                { id: "projets", label: "Projets (/projets)" },
                { id: "contact", label: "Contact (/contact)" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPage(p.id)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-bold transition-colors",
                    selectedPage === p.id
                      ? "bg-ktgw-red text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Button onClick={addCustomSection} size="sm" variant="outline" className="gap-1.5 font-bold">
              <Plus className="size-4" />
              Ajouter une section
            </Button>
          </div>

          {/* Liste des sections modulaires */}
          <div className="flex flex-col gap-4">
            {pageSections.map((sec, idx) => (
              <div
                key={sec.id}
                className={cn(
                  "flex flex-col gap-4 rounded-2xl border p-5 shadow-sm transition-all",
                  sec.enabled ? "border-border bg-card" : "border-dashed border-muted bg-muted/30 opacity-70"
                )}
              >
                {/* Header de section */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-ktgw-green/10 text-xs font-bold text-ktgw-green-strong">
                      #{idx + 1}
                    </span>
                    <div>
                      <h3 className="font-heading text-base font-bold text-foreground">{sec.name}</h3>
                      <span className="text-xs text-muted-foreground">Catégorie : {sec.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateSection(sec.id, { enabled: !sec.enabled })}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold transition-colors",
                        sec.enabled ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                      )}
                    >
                      {sec.enabled ? "Active" : "Masquée"}
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(idx, "up")}
                      disabled={idx === 0}
                      className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-30"
                      title="Monter"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(idx, "down")}
                      disabled={idx === pageSections.length - 1}
                      className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-30"
                      title="Descendre"
                    >
                      <ArrowDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSection(sec.id)}
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10"
                      title="Supprimer la section"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Champs éditables de la section */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="flex flex-col gap-1 text-xs font-bold">
                    Titre principal :
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                      className={inputClass}
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-bold">
                    Surtitre / Rubrique :
                    <input
                      type="text"
                      value={sec.eyebrow ?? ""}
                      onChange={(e) => updateSection(sec.id, { eyebrow: e.target.value })}
                      className={inputClass}
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-bold">
                    Badge d'alerte :
                    <input
                      type="text"
                      value={sec.badge ?? ""}
                      onChange={(e) => updateSection(sec.id, { badge: e.target.value })}
                      className={inputClass}
                      placeholder="Ex: Bourse 65% · 50 Places"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-bold sm:col-span-2">
                    Sous-titre / Description :
                    <input
                      type="text"
                      value={sec.subtitle ?? sec.text ?? ""}
                      onChange={(e) => updateSection(sec.id, { subtitle: e.target.value, text: e.target.value })}
                      className={inputClass}
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-bold">
                    Texte du bouton CTA :
                    <input
                      type="text"
                      value={sec.ctaText ?? ""}
                      onChange={(e) => updateSection(sec.id, { ctaText: e.target.value })}
                      className={inputClass}
                      placeholder="Ex: Postuler en ligne"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-bold sm:col-span-2">
                    Lien du bouton CTA :
                    <input
                      type="text"
                      value={sec.ctaUrl ?? ""}
                      onChange={(e) => updateSection(sec.id, { ctaUrl: e.target.value })}
                      className={inputClass}
                      placeholder="Ex: /formations#bourse-mecatronique"
                    />
                  </label>

                  {sec.image && (
                    <label className="flex flex-col gap-1 text-xs font-bold sm:col-span-3">
                      URL de l'image :
                      <input
                        type="text"
                        value={sec.image}
                        onChange={(e) => updateSection(sec.id, { image: e.target.value })}
                        className={inputClass}
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. ANNONCES & LIENS RÉSEAUX SOCIAUX */}
      {activeTab === "annonces" && (
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
              <Megaphone className="size-5 text-ktgw-red" />
              Bandeau d'Annonces Urgentes &amp; Articles à la Une
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Configurez les annonces prioritaires (ex: Bourse Mécatronique Industrielle) avec diffusion automatique et boutons de partage sur les réseaux sociaux.
            </p>

            <div className="mt-6 flex flex-col gap-6">
              {data.announcements.map((ann) => (
                <div key={ann.id} className="rounded-2xl border border-ktgw-sun/40 bg-ktgw-sun/5 p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs font-bold">
                      Titre de l'annonce :
                      <input
                        type="text"
                        value={ann.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setData((prev) => ({
                            ...prev,
                            announcements: prev.announcements.map((a) => (a.id === ann.id ? { ...a, title: val } : a)),
                          }));
                        }}
                        className={inputClass}
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-bold">
                      Badge :
                      <input
                        type="text"
                        value={ann.badge}
                        onChange={(e) => {
                          const val = e.target.value;
                          setData((prev) => ({
                            ...prev,
                            announcements: prev.announcements.map((a) => (a.id === ann.id ? { ...a, badge: val } : a)),
                          }));
                        }}
                        className={inputClass}
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-bold sm:col-span-2">
                      Contenu détaillé de l'annonce :
                      <textarea
                        rows={3}
                        value={ann.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setData((prev) => ({
                            ...prev,
                            announcements: prev.announcements.map((a) => (a.id === ann.id ? { ...a, text: val } : a)),
                          }));
                        }}
                        className="w-full rounded-xl border border-input bg-card p-3 text-sm outline-none focus:border-ktgw-green-strong focus:ring-2 focus:ring-ktgw-sun/30"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-bold sm:col-span-2">
                      Lien d'atterrissage :
                      <input
                        type="text"
                        value={ann.url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setData((prev) => ({
                            ...prev,
                            announcements: prev.announcements.map((a) => (a.id === ann.id ? { ...a, url: val } : a)),
                          }));
                        }}
                        className={inputClass}
                      />
                    </label>
                  </div>

                  {/* Boutons de Partage Réseaux Sociaux */}
                  <div className="mt-5 border-t border-border/60 pt-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Boutons de partage direct configurés :
                    </span>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`${ann.title} - ${ann.text} Voir sur : https://ktgw-togo.org${ann.url}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-bold text-slate-950 shadow hover:opacity-90"
                      >
                        <FaWhatsapp className="size-4" /> Partager sur WhatsApp
                      </a>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://ktgw-togo.org${ann.url}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1877F2] px-4 py-2 text-xs font-bold text-white shadow hover:opacity-90"
                      >
                        <FaFacebook className="size-4" /> Partager sur Facebook
                      </a>
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://ktgw-togo.org${ann.url}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0A66C2] px-4 py-2 text-xs font-bold text-white shadow hover:opacity-90"
                      >
                        <FaLinkedin className="size-4" /> Partager sur LinkedIn
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://ktgw-togo.org${ann.url}`);
                          setNotification({ type: "success", message: "Lien copié dans le presse-papiers !" });
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-xs font-bold text-foreground hover:bg-muted/80"
                      >
                        <Copy className="size-4" /> Copier le lien
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. DESIGN CONTOUR & THÈME */}
      {activeTab === "theme" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Couleurs */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="font-heading text-base font-bold text-foreground">Palette de Couleurs Officielle</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Ajustez les couleurs maîtresses du site qui s'appliquent sur les boutons, bandeaux et cartes.
            </p>

            <div className="mt-6 flex flex-col gap-4">
              <label className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-xs font-bold">Vert KTGW (Primaire)</span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={data.theme.primaryColor}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="size-8 cursor-pointer rounded-lg border-0 bg-transparent"
                  />
                  <span className="font-mono text-xs">{data.theme.primaryColor}</span>
                </div>
              </label>

              <label className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-xs font-bold">Rouge KTGW (Accent &amp; Bourse)</span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={data.theme.accentColor}
                    onChange={(e) => updateTheme({ accentColor: e.target.value })}
                    className="size-8 cursor-pointer rounded-lg border-0 bg-transparent"
                  />
                  <span className="font-mono text-xs">{data.theme.accentColor}</span>
                </div>
              </label>

              <label className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-xs font-bold">Or Soleil KTGW (Mise en valeur)</span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={data.theme.sunColor}
                    onChange={(e) => updateTheme({ sunColor: e.target.value })}
                    className="size-8 cursor-pointer rounded-lg border-0 bg-transparent"
                  />
                  <span className="font-mono text-xs">{data.theme.sunColor}</span>
                </div>
              </label>
            </div>
          </div>

          {/* Formes & Contours (Divi/Astra style) */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="font-heading text-base font-bold text-foreground">Design Contour &amp; Arrondis</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Personnalisez les rayons de courbure, le style des boutons et des ombres.
            </p>

            <div className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-xs font-bold">
                Style des contours (Border Radius) :
                <select
                  value={data.theme.borderRadius}
                  onChange={(e) => updateTheme({ borderRadius: e.target.value as ThemeSettings["borderRadius"] })}
                  className={inputClass}
                >
                  <option value="sm">Arrondis discrets (8px)</option>
                  <option value="md">Arrondis doux (12px)</option>
                  <option value="lg">Arrondis modernes (20px - Recommandé)</option>
                  <option value="full">Style Pilule (Capsule arrondie)</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold">
                Style des ombres :
                <select
                  value={data.theme.shadowStyle}
                  onChange={(e) => updateTheme({ shadowStyle: e.target.value as ThemeSettings["shadowStyle"] })}
                  className={inputClass}
                >
                  <option value="soft">Ombre douce et raffinée (Soft 3D)</option>
                  <option value="crisp">Contour net et contrasté</option>
                  <option value="glow">Lueur chaleureuse KTGW</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold">
                Style des boutons :
                <select
                  value={data.theme.buttonStyle}
                  onChange={(e) => updateTheme({ buttonStyle: e.target.value as ThemeSettings["buttonStyle"] })}
                  className={inputClass}
                >
                  <option value="gradient">Dégradé dynamique (Recommandé)</option>
                  <option value="solid">Aplat de couleur franc</option>
                  <option value="outline">Contour élégant</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 4. ATTRIBUTION PAR LE PRÉSIDENT */}
      {activeTab === "designer" && (
        <div className="rounded-3xl border-2 border-ktgw-green-strong/40 bg-gradient-to-br from-card via-card to-ktgw-green/5 p-6 shadow-xl sm:p-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-ktgw-green-strong text-white shadow-lg">
                <ShieldCheck className="size-8" />
              </span>
              <div>
                <span className="text-xs font-bold tracking-widest text-ktgw-red uppercase">
                  Attribution Exclusive · Présidence
                </span>
                <h2 className="font-heading text-xl font-black text-foreground sm:text-2xl">
                  {presidentFounder.name}
                </h2>
                <p className="text-xs font-semibold text-ktgw-green-strong">{presidentFounder.title}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-muted/60 p-5 text-sm leading-relaxed text-muted-foreground">
              Conformément aux directives statutaires de l&apos;ONG,{" "}
              <strong>seul le Président-Fondateur</strong> a la prérogative d&apos;accorder l&apos;accès administrateur
              spécial au Web Designer / Gestionnaire du site. Lorsque cet administrateur se connecte avec son adresse
              e-mail, il accède immédiatement à cet espace complet de reconstruction et publication du site web.
            </div>

            {isPresidency ? (
              <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
                <label className="flex flex-col gap-2 text-xs font-bold text-foreground">
                  Adresse e-mail du Gestionnaire Web Designer habilité :
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="email"
                      value={designerEmailInput}
                      onChange={(e) => setDesignerEmailInput(e.target.value)}
                      placeholder="ex: webmaster@ktgw-togo.org"
                      className={cn(inputClass, "max-w-md")}
                    />
                    <Button onClick={handleAssignDesigner} disabled={isPending} className="gap-2 font-bold">
                      <Save className="size-4" />
                      Attribuer l'autorisation
                    </Button>
                  </div>
                </label>
                <p className="text-xs text-muted-foreground">
                  Gestionnaire actuel habilité :{" "}
                  <strong className="text-ktgw-green-strong font-mono">{data.designerEmail}</strong>
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/10 p-5 text-sm font-medium text-amber-800 dark:text-amber-200">
                Vous êtes actuellement connecté en tant que gestionnaire habilité (
                <span className="font-mono font-bold">{currentUserEmail}</span>). Les modifications de délégation
                d&apos;e-mail sont réservées au Président-Fondateur M. Blaise-Pascal D&apos;ALMEIDA.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. PRÉVISUALISATION EN DIRECT */}
      {activeTab === "preview" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-foreground/5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">Format d'écran :</span>
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold",
                  previewDevice === "desktop" ? "bg-ktgw-green-strong text-white" : "bg-muted text-muted-foreground"
                )}
              >
                <Monitor className="size-4" /> PC Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("tablet")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold",
                  previewDevice === "tablet" ? "bg-ktgw-green-strong text-white" : "bg-muted text-muted-foreground"
                )}
              >
                <Tablet className="size-4" /> Tablette
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold",
                  previewDevice === "mobile" ? "bg-ktgw-green-strong text-white" : "bg-muted text-muted-foreground"
                )}
              >
                <Smartphone className="size-4" /> Mobile
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">Langue :</span>
              {(["fr", "de", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setPreviewLocale(l)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold uppercase",
                    previewLocale === l ? "bg-ktgw-sun text-slate-950 font-black shadow" : "bg-muted text-muted-foreground"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center rounded-3xl bg-slate-950 p-4 sm:p-8">
            <div
              className={cn(
                "overflow-hidden rounded-2xl bg-background shadow-2xl transition-all duration-300 ring-1 ring-white/10",
                previewDevice === "desktop" && "w-full max-w-5xl",
                previewDevice === "tablet" && "w-[768px] max-w-full",
                previewDevice === "mobile" && "w-[390px] max-w-full"
              )}
            >
              <iframe
                src={`/${previewLocale}`}
                title="Aperçu en direct du site"
                className="h-[650px] w-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
