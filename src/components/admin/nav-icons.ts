import {
  Archive,
  BadgeCheck,
  BarChart3,
  ClipboardCheck,
  Contact,
  FileText,
  HandCoins,
  History,
  IdCard,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Megaphone,
  Newspaper,
  NotebookText,
  Palette,
  PenSquare,
  UsersRound,
} from "lucide-react";

/** Icônes des rubriques du tableau de bord (menu latéral et accès rapides). */
export const navIcons = {
  overview: LayoutDashboard,
  approvals: ClipboardCheck,
  content: Newspaper,
  stats: BarChart3,
  publications: PenSquare,
  announcements: Megaphone,
  site: Palette,
  reports: NotebookText,
  archives: Archive,
  mail: Mail,
  members: Contact,
  inbox: Inbox,
  donations: HandCoins,
  cards: IdCard,
  memberships: BadgeCheck,
  documents: FileText,
  team: UsersRound,
  journal: History,
  guide: LifeBuoy,
} as const;

export type AdminNavItem = {
  href: string;
  label: string;
  icon: keyof typeof navIcons;
  badge?: number;
  section: string;
};
