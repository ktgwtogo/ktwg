export type Partner = {
  name: string;
  /** Sigle affiché dans le badge tant qu'aucun logo n'est fourni. */
  initials: string;
  country: "Togo" | "Allemagne";
  description: string;
  url?: string;
  /** Couleur du badge (jeton de marque). */
  tone: "red" | "green" | "sun" | "ink";
  /** Logo officiel (à ajouter dans /public/images/partners puis renseigner ici). */
  logo?: string;
};

/**
 * Partenaires de KTGW Togo.
 * Logos : à déposer dans public/images/partners/ (ou via le dashboard en Phase 8).
 * En attendant, un badge typographique aux initiales est affiché.
 * Descriptions de LCH Informatique et Miss Artisanal Togo : à compléter par l'équipe.
 */
export const partners: Partner[] = [
  {
    name: "kommTOGOgehweiter e.V.",
    initials: "KTGW",
    country: "Allemagne",
    description: "Association d'utilité publique fondée à Cologne, à l'origine de KTGW Togo.",
    url: "https://kommtogogehweiter.de",
    tone: "red",
  },
  {
    name: "Togohilfe",
    initials: "TH",
    country: "Allemagne",
    description: "Partenaire du projet d'internat pour jeunes filles.",
    tone: "green",
  },
  {
    name: "Chambre des métiers de Cologne",
    initials: "HWK",
    country: "Allemagne",
    description: "Handwerkskammer zu Köln : expertise de l'artisanat allemand pour la formation.",
    url: "https://www.hwk-koeln.de",
    tone: "ink",
  },
  {
    name: "Ambassade d'Allemagne au Togo",
    initials: "DE",
    country: "Allemagne",
    description: "Soutien institutionnel aux projets d'éducation et de formation.",
    url: "https://lome.diplo.de",
    tone: "sun",
  },
  {
    name: "CCBD",
    initials: "CCBD",
    country: "Togo",
    description: "Partenaire de terrain sur le chantier de l'internat.",
    tone: "green",
  },
  {
    name: "CEFOPEXD",
    initials: "CFX",
    country: "Togo",
    description: "Centre de formation professionnelle de Devikinme.",
    url: "/projets/cefopexd",
    tone: "red",
  },
  {
    name: "LCH Informatique",
    initials: "LCH",
    country: "Togo",
    description: "Partenaire togolais de KTGW Togo.",
    tone: "ink",
  },
  {
    name: "Miss Artisanal Togo",
    initials: "MAT",
    country: "Togo",
    description: "Partenaire togolais de KTGW Togo.",
    tone: "sun",
  },
];
