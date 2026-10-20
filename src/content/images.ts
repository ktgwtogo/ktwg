/**
 * Registre des photos du site, avec leurs textes alternatifs (accessibilité).
 * Toujours référencer une photo via ce registre pour garder des `alt` cohérents.
 */
export type SiteImage = { src: string; alt: string; width: number; height: number };

const photo = (file: string, alt: string, width = 1600, height = 1066): SiteImage => ({
  src: `/images/${file}`,
  alt,
  width,
  height,
});

export const images = {
  ribbon: photo(
    "inauguration-ruban.webp",
    "Coupe du ruban devant le bâtiment de l'internat, en présence d'un représentant de l'ambassade d'Allemagne"
  ),
  workersGroup: photo(
    "photo-groupe-ouvriers.webp",
    "Photo de groupe des officiels, partenaires et ouvriers en casques jaunes sous le chapiteau",
    850,
    560
  ),
  speech: photo(
    "discours-ouvriers.webp",
    "Discours devant les ouvriers du chantier en gilets de sécurité, entre deux drapeaux du Togo"
  ),
  guests: photo(
    "invites-ceremonie.webp",
    "Invités et partenaires togolais et allemands assis sous le chapiteau pendant la cérémonie"
  ),
  priest: photo("pretre-discours.webp", "Un prêtre s'adresse à l'assemblée réunie sous le chapiteau"),
  plantingEmbassy: photo(
    "plantation-ambassade.webp",
    "Plantation d'un arbre avec des officiels, un représentant de l'ambassade d'Allemagne et de jeunes femmes"
  ),
  plantingHibiscus: photo(
    "plantation-hibiscus.webp",
    "Deux personnes accroupies plantent un hibiscus en fleur"
  ),
  plantingPartners: photo(
    "plantation-partenaires.webp",
    "Plantation d'un arbuste avec des partenaires allemands, une apprentie et les ouvriers du chantier"
  ),
  plantingWoman: photo(
    "plantation-femme-ouvriers.webp",
    "Une femme en tenue verte plante un arbre, entourée des ouvriers du chantier"
  ),
  blessing: photo(
    "benediction-plantation.webp",
    "Bénédiction de la plantation par un prêtre, devant les ouvriers et les invités"
  ),
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof images;
