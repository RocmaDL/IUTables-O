"use client";

import { useEffect, useRef, useState } from "react";
import type * as MapLibre from "maplibre-gl";
import maplibrePackage from "maplibre-gl/package.json";
import "maplibre-gl/dist/maplibre-gl.css";

// Module servi depuis public/ plutôt que bundlé : voir
// scripts/copy-maplibre.mjs pour la raison.
const MAPLIBRE_URL = `/vendor/maplibre-gl/${maplibrePackage.version}/maplibre-gl.mjs`;

// Fonds OpenFreeMap : gratuits, sans clé ; l'attribution OpenStreetMap
// arrive avec les tuiles et s'affiche dans le coin de la carte.
// Fond sombre uniquement : le site n'a qu'un thème, bleu nuit.
const STYLE = "https://tiles.openfreemap.org/styles/dark";

const LOCALE_FR = {
  "Map.Title": "Carte",
  "Marker.Title": "Emplacement du restaurant",
  "NavigationControl.ZoomIn": "Zoomer",
  "NavigationControl.ZoomOut": "Dézoomer",
  "AttributionControl.ToggleAttribution": "Afficher les crédits",
  "AttributionControl.MapFeedback": "Signaler une erreur sur la carte",
  "CooperativeGesturesHandler.WindowsHelpText": "Ctrl + molette pour zoomer",
  "CooperativeGesturesHandler.MacHelpText": "⌘ + molette pour zoomer",
  "CooperativeGesturesHandler.MobileHelpText": "Deux doigts pour déplacer la carte",
};

/**
 * Repeint le fond OpenFreeMap « dark », gris neutre, aux couleurs du
 * tableau : sol bleu nuit, bâtiments et rues un cran plus clairs, noms de
 * rues en bleu-gris. Les couleurs viennent des jetons CSS du site.
 */
function paintBoard(map: MapLibre.Map, tokens: CSSStyleDeclaration) {
  const token = (name: string) => tokens.getPropertyValue(name).trim();
  const ground = token("--background");
  const raised = token("--row-alt");
  const accent = token("--accent");
  const border = token("--border");
  const input = token("--input");
  const slack = token("--slack");

  for (const { id, type } of map.getStyle().layers) {
    if (type === "background") {
      map.setPaintProperty(id, "background-color", ground);
    } else if (type === "fill") {
      const color =
        id === "water" ? accent : id === "building" ? raised : /park|wood/.test(id) ? raised : ground;
      map.setPaintProperty(id, "fill-color", color);
      if (id === "building") map.setPaintProperty(id, "fill-outline-color", border);
    } else if (type === "line") {
      // Même logique que le style d'origine : bordure de route claire,
      // chaussée sombre, chemins discrets.
      const color = /casing|boundary/.test(id)
        ? input
        : /major|motorway|path|waterway|taxiway/.test(id)
          ? accent
          : /dashline|pier|runway/.test(id)
            ? ground
            : border;
      map.setPaintProperty(id, "line-color", color);
    } else if (type === "symbol" && map.getPaintProperty(id, "text-color") !== undefined) {
      map.setPaintProperty(id, "text-color", slack);
      map.setPaintProperty(id, "text-halo-color", ground);
    }
  }
}

export function RestaurantMap({ lat, lon, name }: { lat: number; lon: number; name: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let map: MapLibre.Map | undefined;
    let cancelled = false;

    // Import dynamique : MapLibre pèse lourd et ne sert que sur cette page.
    (import(/* turbopackIgnore: true */ /* webpackIgnore: true */ MAPLIBRE_URL) as Promise<
      typeof MapLibre
    >)
      .then((maplibre) => {
        if (cancelled) return;
        const tokens = getComputedStyle(document.documentElement);
        const primary = tokens.getPropertyValue("--primary").trim();

        map = new maplibre.Map({
          container,
          style: STYLE,
          center: [lon, lat],
          zoom: 16,
          // Évite que la carte capture le défilement de la page.
          cooperativeGestures: true,
          attributionControl: { compact: true },
          locale: LOCALE_FR,
        });
        const loaded = map;
        loaded.on("style.load", () => paintBoard(loaded, tokens));
        loaded.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
        new maplibre.Marker({ color: primary || undefined })
          .setLngLat([lon, lat])
          .addTo(map);
      })
      // WebGL indisponible ou script bloqué : on garde les liens texte.
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lon]);

  if (failed) {
    return (
      <div className="grid aspect-[4/3] w-full place-items-center rounded-md border border-input p-6 text-center text-sm text-muted-foreground md:aspect-square">
        La carte n&rsquo;a pas pu s&rsquo;afficher sur cet appareil.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={`Carte : emplacement de ${name}`}
      className="aspect-[4/3] w-full overflow-hidden rounded-md border border-input bg-muted md:aspect-square"
    />
  );
}
