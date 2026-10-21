"use client";

import { createContext, useContext } from "react";
import { defaultSiteConfig, type SiteConfigData } from "@/lib/site/types";

const SiteConfigContext = createContext<SiteConfigData>(defaultSiteConfig);

/** Coordonnées du site (modifiables dans /admin) pour les composants client. */
export function SiteConfigProvider({ value, children }: { value: SiteConfigData; children: React.ReactNode }) {
  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export const useSiteConfig = () => useContext(SiteConfigContext);
