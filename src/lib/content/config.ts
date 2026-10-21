import type { Permission } from "@/lib/admin/permissions";

/**
 * Description des contenus modifiables dans /admin/contenus : champs du formulaire,
 * colonnes Supabase et poste autorisé. Partagée par l'éditeur, le serveur et les validations.
 */
export type FieldType =
  | "text"
  | "slug"
  | "textarea"
  | "paragraphs"
  | "date"
  | "datetime"
  | "number"
  | "select"
  | "checkbox"
  | "url"
  | "image"
  | "imageUrl"
  | "images"
  | "facts"
  | "milestones"
  | "progress"
  | "blocks";

/** Blocs d'une page personnalisée. */
export type PageBlock =
  | { type: "text"; heading: string; body: string }
  | { type: "imageText"; heading: string; body: string; image: { src: string; alt: string; width: number; height: number } | null; imageRight: boolean }
  | { type: "image"; image: { src: string; alt: string; width: number; height: number } | null; caption: string }
  | { type: "button"; label: string; href: string; style: "primary" | "outline" };

export const blockLabels: Record<PageBlock["type"], string> = {
  text: "Texte",
  imageText: "Image et texte",
  image: "Grande image",
  button: "Bouton",
};

/** Adresses déjà utilisées par le site : interdites pour une page personnalisée. */
export const reservedSlugs = [
  "a-propos", "objectifs", "projets", "formations", "actualites", "evenements", "galerie", "partenariat",
  "s-engager", "faire-un-don", "transparence", "contact", "mentions-legales", "confidentialite", "connexion",
  "mon-espace", "admin", "api", "auth", "de", "en", "fr", "sitemap", "robots",
];

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: readonly { value: string; label: string }[];
  hint?: string;
  max?: number;
};

export type ContentType = {
  id: string;
  table: "posts" | "events" | "projects" | "gallery_items" | "partners" | "testimonials" | "announcements" | "pages";
  label: string;
  singular: string;
  description: string;
  permissions: Permission[];
  /** Champ affiché comme titre dans les listes. */
  titleField: string;
  /** Tri de la liste dans l'administration. */
  orderBy: { column: string; ascending: boolean };
  fields: Field[];
  /** Adresse publique d'un élément, pour le lien « Voir sur le site ». */
  publicPath?: (row: Record<string, unknown>) => string;
};

const opts = (...values: string[]) => values.map((v) => ({ value: v, label: v }));
const published: Field = { name: "published", label: "Publié sur le site", type: "checkbox" };
const sortOrder: Field = { name: "sort_order", label: "Ordre d'affichage", type: "number", hint: "Les plus petits nombres s'affichent en premier." };

export const contentTypes: ContentType[] = [
  {
    id: "pages",
    table: "pages",
    label: "Pages",
    singular: "page",
    description: "Nouvelles pages du site, construites par blocs, à ajouter ensuite au menu.",
    permissions: ["pages.manage"],
    titleField: "title",
    orderBy: { column: "sort_order", ascending: true },
    publicPath: (r) => `/${r.slug}`,
    fields: [
      { name: "title", label: "Titre de la page", type: "text", required: true, max: 160 },
      { name: "slug", label: "Adresse de la page", type: "slug", required: true, hint: "La page sera visible à l'adresse www.ktgw.tg/adresse." },
      { name: "description", label: "Introduction (et description pour Google)", type: "textarea", max: 300 },
      { name: "hero_image", label: "Image d'en-tête", type: "image" },
      { name: "blocks", label: "Contenu de la page", type: "blocks", required: true },
      sortOrder,
      published,
    ],
  },
  {
    id: "actualites",
    table: "posts",
    label: "Actualités",
    singular: "actualité",
    description: "Articles de la page Actualités et de l'accueil.",
    permissions: ["content.manage"],
    titleField: "title",
    orderBy: { column: "published_on", ascending: false },
    publicPath: (r) => `/actualites/${r.slug}`,
    fields: [
      { name: "title", label: "Titre", type: "text", required: true, max: 160 },
      { name: "slug", label: "Adresse de la page", type: "slug", required: true, hint: "Générée depuis le titre : lettres, chiffres et tirets." },
      { name: "published_on", label: "Date de publication", type: "date", required: true },
      { name: "category", label: "Catégorie", type: "select", required: true, options: opts("Projets", "Environnement", "Vie de l'ONG") },
      { name: "image", label: "Image principale", type: "image", required: true },
      { name: "excerpt", label: "Résumé (cartes et référencement)", type: "textarea", required: true, max: 400 },
      { name: "body", label: "Texte de l'article", type: "paragraphs", required: true, hint: "Laissez une ligne vide entre deux paragraphes." },
      { name: "gallery", label: "Galerie de l'article", type: "images" },
      published,
    ],
  },
  {
    id: "evenements",
    table: "events",
    label: "Événements",
    singular: "événement",
    description: "Agenda, inscriptions en ligne et accueil.",
    permissions: ["projects.manage", "content.manage"],
    titleField: "title",
    orderBy: { column: "starts_at", ascending: false },
    publicPath: (r) => `/evenements/${r.slug}`,
    fields: [
      { name: "title", label: "Titre", type: "text", required: true, max: 160 },
      { name: "slug", label: "Adresse de la page", type: "slug", required: true },
      { name: "starts_at", label: "Début (heure de Lomé)", type: "datetime", required: true },
      { name: "ends_at", label: "Fin (heure de Lomé)", type: "datetime" },
      { name: "venue", label: "Lieu", type: "text", required: true },
      { name: "city", label: "Ville", type: "text", required: true },
      { name: "format", label: "Format", type: "select", required: true, options: [{ value: "presentiel", label: "Présentiel" }, { value: "en-ligne", label: "En ligne" }] },
      { name: "capacity", label: "Nombre de places", type: "number", hint: "Laisser vide si illimité." },
      { name: "image", label: "Image", type: "image", required: true },
      { name: "summary", label: "Résumé", type: "textarea", required: true, max: 400 },
      { name: "body", label: "Description", type: "paragraphs", required: true },
      { name: "is_sample", label: "Exemple de démonstration (badge « Exemple »)", type: "checkbox" },
      published,
    ],
  },
  {
    id: "projets",
    table: "projects",
    label: "Projets",
    singular: "projet",
    description: "Pages Projets, accueil et dons fléchés.",
    permissions: ["projects.manage", "content.manage"],
    titleField: "title",
    orderBy: { column: "sort_order", ascending: true },
    publicPath: (r) => `/projets/${r.slug}`,
    fields: [
      { name: "title", label: "Titre", type: "text", required: true, max: 160 },
      { name: "slug", label: "Adresse de la page", type: "slug", required: true },
      { name: "tagline", label: "Accroche (cartes)", type: "text", required: true, max: 160 },
      { name: "location", label: "Lieu", type: "text", required: true },
      {
        name: "status",
        label: "État",
        type: "select",
        required: true,
        options: [
          { value: "en-preparation", label: "En préparation" },
          { value: "en-cours", label: "En cours" },
          { value: "realise", label: "Réalisé" },
        ],
      },
      { name: "image", label: "Image principale", type: "image", required: true },
      { name: "summary", label: "Résumé", type: "textarea", required: true, max: 500 },
      { name: "body", label: "Présentation", type: "paragraphs", required: true },
      { name: "facts", label: "Faits clés", type: "facts", hint: "Une ligne par fait, au format « Libellé : valeur »." },
      { name: "progress", label: "Avancement (barre de progression)", type: "progress" },
      { name: "milestones", label: "Étapes marquantes", type: "milestones", hint: "Une ligne par étape, au format « AAAA-MM-JJ : texte »." },
      { name: "gallery", label: "Photos du projet", type: "images" },
      { name: "budget_eur", label: "Budget (€)", type: "number" },
      { name: "raised_eur", label: "Montant collecté (€)", type: "number" },
      sortOrder,
      published,
    ],
  },
  {
    id: "galerie",
    table: "gallery_items",
    label: "Galerie photos",
    singular: "photo",
    description: "Photothèque de la page Galerie.",
    permissions: ["content.manage"],
    titleField: "caption",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "image", label: "Photo", type: "image", required: true },
      { name: "category", label: "Catégorie", type: "select", required: true, options: opts("Internat", "Cérémonies", "Environnement", "Partenaires") },
      { name: "caption", label: "Légende", type: "text", required: true, max: 200 },
      sortOrder,
      published,
    ],
  },
  {
    id: "partenaires",
    table: "partners",
    label: "Partenaires",
    singular: "partenaire",
    description: "Bandeau de l'accueil et page Partenariat.",
    permissions: ["content.manage"],
    titleField: "name",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "name", label: "Nom", type: "text", required: true, max: 160 },
      { name: "initials", label: "Sigle (affiché sans logo)", type: "text", required: true, max: 8 },
      { name: "country", label: "Pays", type: "select", required: true, options: opts("Togo", "Allemagne") },
      { name: "description", label: "Description", type: "textarea", required: true, max: 400 },
      { name: "url", label: "Site web", type: "url" },
      {
        name: "tone",
        label: "Couleur du badge",
        type: "select",
        required: true,
        options: [
          { value: "red", label: "Rouge" },
          { value: "green", label: "Vert" },
          { value: "sun", label: "Jaune" },
          { value: "ink", label: "Noir" },
        ],
      },
      { name: "logo", label: "Logo", type: "imageUrl" },
      sortOrder,
      published,
    ],
  },
  {
    id: "temoignages",
    table: "testimonials",
    label: "Témoignages",
    singular: "témoignage",
    description: "Carrousel de l'accueil.",
    permissions: ["content.manage"],
    titleField: "name",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "quote", label: "Témoignage", type: "textarea", required: true, max: 600 },
      { name: "name", label: "Nom (ou description)", type: "text", required: true, max: 120 },
      { name: "role", label: "Rôle", type: "text", required: true, max: 120 },
      { name: "initials", label: "Initiales (avatar)", type: "text", required: true, max: 4 },
      { name: "is_sample", label: "Témoignage d'illustration (badge « Exemple »)", type: "checkbox" },
      sortOrder,
      published,
    ],
  },
  {
    id: "annonces",
    table: "announcements",
    label: "Annonces",
    singular: "annonce",
    description: "Bandeau d'information en haut de toutes les pages.",
    permissions: ["content.manage"],
    titleField: "title",
    orderBy: { column: "starts_at", ascending: false },
    fields: [
      { name: "title", label: "Message principal", type: "text", required: true, max: 160 },
      { name: "body", label: "Précision (facultatif)", type: "textarea", max: 500 },
      { name: "link_label", label: "Texte du lien", type: "text", max: 60 },
      { name: "link_url", label: "Lien (page du site « /… » ou https://…)", type: "url" },
      {
        name: "tone",
        label: "Style",
        type: "select",
        required: true,
        options: [
          { value: "info", label: "Information (vert)" },
          { value: "urgent", label: "Important (rouge)" },
          { value: "success", label: "Bonne nouvelle (jaune)" },
        ],
      },
      { name: "starts_at", label: "Début d'affichage", type: "datetime", required: true },
      { name: "ends_at", label: "Fin d'affichage", type: "datetime" },
      published,
    ],
  },
];

export const getContentType = (id: string) => contentTypes.find((t) => t.id === id);

/** Le poste peut-il modifier ce type de contenu ? */
export const canEdit = (type: ContentType, can: (p: Permission) => boolean) => type.permissions.some(can);

/** Adresse générée depuis un titre : « Fête des ouvriers 2023 » → « fete-des-ouvriers-2023 ». */
export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
