import { MapPin } from "lucide-react";
import { cities } from "@/content/organization";

/**
 * Carte stylisée du Togo avec les 6 villes d'intervention (points pulsants)
 * et l'arc qui relie Lomé au siège de l'association à Cologne.
 * Le contour est volontairement simplifié (illustration, pas une carte géographique précise).
 */

// Projection simple longitude/latitude → coordonnées SVG
const W0 = -0.35;
const N0 = 11.3;
const K = 100;
const project = (lng: number, lat: number) => [(lng - W0) * K + 30, (N0 - lat) * K + 20] as const;

// Contour simplifié du Togo (longitude, latitude), dans le sens horaire depuis le nord-ouest
const outline: [number, number][] = [
  [-0.14, 11.1], [0.35, 11.12], [0.55, 10.98], [0.92, 10.99], [0.78, 10.55], [0.8, 10.25], [1.35, 10.0],
  [1.4, 9.4], [1.62, 9.05], [1.62, 7.0], [1.65, 6.6], [1.8, 6.28], [1.2, 6.1], [1.05, 6.28], [0.9, 6.45],
  [0.74, 6.6], [0.53, 6.95], [0.62, 7.4], [0.52, 7.6], [0.65, 8.2], [0.48, 8.6], [0.37, 8.8], [0.5, 9.05],
  [0.23, 9.5], [0.38, 10.0], [0.3, 10.3], [-0.08, 10.6], [0.0, 10.9],
];
const path = `M${outline.map(([lng, lat]) => project(lng, lat).join(" ")).join(" L")} Z`;
const lome = project(1.22, 6.13);
const cologne = [420, 70] as const;

export function PresenceMap() {
  return (
    <figure className="relative mx-auto w-full max-w-lg">
      <svg viewBox="0 0 480 580" role="img" aria-labelledby="map-title map-desc" className="h-auto w-full">
        <title id="map-title">Carte de présence de KTGW Togo</title>
        <desc id="map-desc">
          Six villes d&apos;intervention au Togo : {cities.map((c) => c.name).join(", ")}. Un arc relie Lomé au siège de l&apos;association à
          Cologne, en Allemagne.
        </desc>
        <defs>
          <linearGradient id="togo-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ktgw-green)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--ktgw-sun)" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Pays */}
        <path d={path} fill="url(#togo-fill)" stroke="var(--ktgw-green)" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Arc Lomé → Cologne */}
        <path
          d={`M${lome[0]} ${lome[1]} C 420 520, 470 260, ${cologne[0]} ${cologne[1] + 14}`}
          fill="none"
          stroke="var(--ktgw-red)"
          strokeWidth="2"
          strokeDasharray="6 6"
          opacity="0.8"
        />
        <g transform={`translate(${cologne[0]} ${cologne[1]})`}>
          <circle r="22" className="fill-ktgw-red/15" />
          <circle r="7" fill="var(--ktgw-red)" stroke="white" strokeWidth="2.5" />
          <text y="-30" textAnchor="middle" className="fill-foreground font-heading text-[15px] font-bold">
            Cologne
          </text>
          <text y="38" textAnchor="middle" className="fill-muted-foreground text-[11px]">
            Allemagne · e.V.
          </text>
        </g>

        {/* Villes */}
        {cities.map((c) => {
          const [x, y] = project(c.lng, c.lat);
          // Placement des étiquettes pour éviter les chevauchements (Lomé et Aného sont proches)
          const labelLeft = c.name === "Kpalimé" || c.name === "Dapaong" || c.name === "Lomé";
          const dy = c.name === "Lomé" ? 22 : c.name === "Aného" ? -10 : 5;
          return (
            <g key={c.name} transform={`translate(${x} ${y})`}>
              <circle r="8" fill="var(--ktgw-red)" className="origin-center motion-safe:animate-pulse-ring [transform-box:fill-box]" />
              <circle r={c.hq ? 8 : 6} fill={c.hq ? "var(--ktgw-red)" : "var(--ktgw-green-strong)"} stroke="white" strokeWidth="2.5" />
              <text
                x={labelLeft ? -14 : 14}
                y={dy}
                textAnchor={labelLeft ? "end" : "start"}
                className="fill-foreground font-heading text-[14px] font-bold"
              >
                {c.name}
                {c.hq && " (siège)"}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <MapPin aria-hidden className="size-3.5" />
        Carte stylisée, non à l&apos;échelle
      </figcaption>
    </figure>
  );
}
