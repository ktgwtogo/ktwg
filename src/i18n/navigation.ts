import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Wrappers de navigation conscients de la langue.
 * Toujours importer Link / useRouter depuis ce fichier plutôt que depuis `next/*`.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
