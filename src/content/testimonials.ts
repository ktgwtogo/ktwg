export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  /** Initiales affichées en avatar tant qu'aucune photo n'est fournie. */
  initials: string;
  /** Témoignage d'illustration à remplacer par un vrai témoignage (badge « Exemple »). */
  sample?: boolean;
};

/**
 * ⚠️ Témoignages d'ILLUSTRATION : à remplacer par de vrais témoignages d'apprenant·e·s
 * (avec leur accord écrit) avant la mise en ligne. Ils sont signalés par un badge « Exemple ».
 */
export const testimonials: Testimonial[] = [
  {
    quote:
      "Avant, je n'avais pas de solution après l'école. Aujourd'hui, j'ai un métier entre les mains et je peux aider ma famille.",
    name: "Apprentie",
    role: "Formation en mécanique",
    initials: "AM",
    sample: true,
  },
  {
    quote:
      "L'internat a tout changé : je ne fais plus des heures de route chaque jour, je peux me concentrer sur ma formation.",
    name: "Pensionnaire de l'internat",
    role: "Formation en comptabilité",
    initials: "PI",
    sample: true,
  },
  {
    quote:
      "Apprendre l'allemand au club m'a ouvert l'esprit. J'ai échangé avec des jeunes de Cologne et je rêve de grands projets pour le Togo.",
    name: "Élève du club d'allemand",
    role: "Club de langue allemande",
    initials: "CA",
    sample: true,
  },
];
