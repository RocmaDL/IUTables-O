import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { USER_AGENT } from "./http";
import type { GeocodedPlace, LiveRestaurant, OsmType, PlaceKind } from "./types";

// Instances publiques essayées dans l'ordre. Chacune a ses mauvais moments
// (429, 504, connexions coupées) : en enchaîner trois évite d'afficher une
// erreur pour un pic de charge sur l'une d'elles.
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

// Délai côté Overpass (secondes) et délai par tentative (millisecondes) :
// le second est plus long pour laisser Overpass répondre par une erreur
// explicite plutôt que de couper la connexion. Mesuré sur Marseille et
// Nice (denses, rayon au maximum) : à 10 s, Overpass s'auto-interrompt
// (504/429) avant d'avoir fini un calcul qui aurait pu aboutir avec plus
// de temps ; 25 s laisse la marge de le terminer.
const QUERY_TIMEOUT_S = 25;
const ATTEMPT_TIMEOUT_MS = 28_000;
/**
 * Au-delà, l'utilisateur attend trop : on affiche l'erreur. Reste sous
 * `maxDuration` (60 s, voir les pages recherche et fiche) une fois ajouté
 * le pire cas de Nominatim (2 × 8 s).
 */
const TOTAL_BUDGET_MS = 42_000;
/** Une connexion coupée en moins de ce délai mérite un second essai. */
const FAST_FAILURE_MS = 2_000;

/** Plafond d'adresses renvoyées ; Paris en compte plus de 14 000. */
export const RESULT_CAP = 400;

const MIN_RADIUS_M = 500;
const MAX_RADIUS_M = 1_500;

const AMENITY_FILTER = `["amenity"~"^(restaurant|fast_food|cafe)$"]["name"]`;

const OSM_TYPES: Record<string, OsmType> = { n: "node", w: "way", r: "relation" };

type OverpassElement = {
  type: OsmType;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

/** Aucune instance Overpass n'a renvoyé de résultat exploitable. */
export class OverpassUnavailableError extends Error {
  constructor(details: string) {
    super(`Overpass indisponible (${details})`);
    this.name = "OverpassUnavailableError";
  }
}

/**
 * Rayon de recherche autour du centre de la commune : la moitié de la plus
 * petite dimension de son emprise, bornée pour rester rapide en ville dense
 * et utile dans un village.
 */
export function searchRadius(place: GeocodedPlace): number {
  const { south, north, west, east } = place.boundingBox;
  const metersPerDegree = 111_320;
  const height = (north - south) * metersPerDegree;
  const width = (east - west) * metersPerDegree * Math.cos((place.lat * Math.PI) / 180);
  const half = Math.min(height, width) / 2;
  return Math.round(Math.min(MAX_RADIUS_M, Math.max(MIN_RADIUS_M, half)));
}

/** `n123` → { type: "node", id: 123 } ; `null` si l'identifiant est invalide. */
export function parseOsmId(osmId: string): { type: OsmType; id: number } | null {
  const match = /^([nwr])(\d{1,12})$/.exec(osmId);
  if (!match) return null;
  return { type: OSM_TYPES[match[1]], id: Number(match[2]) };
}

export function osmUrl(restaurant: Pick<LiveRestaurant, "osmType" | "osmId">): string {
  return `https://www.openstreetmap.org/${restaurant.osmType}/${restaurant.osmId.slice(1)}`;
}

type Attempt =
  | { ok: true; elements: OverpassElement[] }
  | { ok: false; reason: string; retry: boolean };

/** 429 et 5xx signalent une surcharge passagère du serveur, pas une requête invalide. */
function isOverloadStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600);
}

async function attempt(endpoint: string, query: string, timeoutMs: number): Promise<Attempt> {
  const startedAt = Date.now();
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "User-Agent": USER_AGENT },
      body: new URLSearchParams({ data: query }),
      // La mise en cache se fait au niveau de la fonction appelante, qui
      // ne garde que les réponses complètes.
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      // Une instance surchargée répond parfois par un 504 après avoir
      // presque terminé le calcul (observé : deux 504 puis un 200 en
      // moins de 2 s) : retenter la même instance vaut mieux que passer
      // aussitôt à la suivante.
      return { ok: false, reason: `HTTP ${response.status}`, retry: isOverloadStatus(response.status) };
    }

    const data = (await response.json()) as { elements: OverpassElement[]; remark?: string };

    // Un dépassement de délai ou de mémoire arrive dans une réponse 200,
    // signalé par un `remark` et des résultats partiels : même cause
    // passagère qu'un 504, même second essai.
    if (data.remark?.includes("error")) {
      return { ok: false, reason: data.remark, retry: true };
    }

    return { ok: true, elements: data.elements };
  } catch (error) {
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
    return {
      ok: false,
      reason: `${error instanceof Error ? error.name : "erreur"} ${cause}`.trim(),
      // Une connexion coupée net en moins de deux secondes vaut la peine
      // d'être retentée ; un abandon au bout du délai complet signale une
      // instance muette, où retenter ne ferait que perdre le même temps.
      retry: Date.now() - startedAt < FAST_FAILURE_MS,
    };
  }
}

async function runQuery(query: string): Promise<OverpassElement[]> {
  const deadline = Date.now() + TOTAL_BUDGET_MS;
  const failures: string[] = [];

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const host = new URL(endpoint).host;
    for (let tries = 0; tries < 2; tries++) {
      const remaining = deadline - Date.now();
      if (remaining < FAST_FAILURE_MS) {
        throw new OverpassUnavailableError([...failures, "budget épuisé"].join(" ; "));
      }

      const result = await attempt(endpoint, query, Math.min(ATTEMPT_TIMEOUT_MS, remaining));
      if (result.ok) return result.elements;

      failures.push(`${host} ${result.reason}`);
      if (!result.retry) break;
    }
  }

  throw new OverpassUnavailableError(failures.join(" ; "));
}

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(";").map((v) => v.trim()).filter(Boolean);
}

function buildAddress(tags: Record<string, string>): string | null {
  const street = tags["addr:street"] ?? tags["addr:place"];
  if (!street) return null;
  return [tags["addr:housenumber"], street].filter(Boolean).join(" ");
}

function toRestaurant(el: OverpassElement): LiveRestaurant | null {
  const tags = el.tags;
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (!tags?.name || lat == null || lon == null) return null;

  return {
    osmId: `${el.type[0]}${el.id}`,
    osmType: el.type,
    name: tags.name,
    kind: tags.amenity as PlaceKind,
    lat,
    lon,
    cuisine: splitList(tags.cuisine?.toLowerCase()),
    vegetarian: tags["diet:vegetarian"] ?? null,
    vegan: tags["diet:vegan"] ?? null,
    wheelchair: tags.wheelchair ?? null,
    openingHours: tags.opening_hours ?? null,
    delivery: tags.delivery ?? null,
    takeaway: tags.takeaway ?? null,
    outdoorSeating: tags.outdoor_seating ?? null,
    internetAccess: tags.internet_access ?? null,
    phone: tags.phone ?? tags["contact:phone"] ?? null,
    website: tags.website ?? tags["contact:website"] ?? null,
    address: buildAddress(tags),
    postcode: tags["addr:postcode"] ?? null,
    city: tags["addr:city"] ?? null,
  };
}

/**
 * Restaurants, fast-foods et cafés dans un rayon autour d'un point.
 * Mis en cache 30 minutes par position : une erreur levée n'est jamais
 * mise en cache, la recherche suivante retentera donc Overpass.
 */
export const fetchRestaurantsAround = unstable_cache(
  async (lat: number, lon: number, radius: number): Promise<LiveRestaurant[]> => {
    const elements = await runQuery(`
      [out:json][timeout:${QUERY_TIMEOUT_S}];
      nwr${AMENITY_FILTER}(around:${radius},${lat},${lon});
      out center tags ${RESULT_CAP};
    `);
    return elements.map(toRestaurant).filter((r): r is LiveRestaurant => r !== null);
  },
  ["overpass-around-v1"],
  { revalidate: 60 * 30 }
);

const fetchRestaurantByIdCached = unstable_cache(
  async (type: OsmType, id: number): Promise<LiveRestaurant | null> => {
    const elements = await runQuery(`
      [out:json][timeout:${QUERY_TIMEOUT_S}];
      ${type}(${id})${AMENITY_FILTER};
      out center tags;
    `);
    const first = elements[0];
    return first ? toRestaurant(first) : null;
  },
  ["overpass-by-id-v1"],
  { revalidate: 60 * 60 * 24 }
);

/**
 * Fiche d'un établissement à partir de son identifiant court. `cache` de
 * React évite une double requête quand `generateMetadata` et la page
 * demandent la même fiche pendant un rendu.
 */
export const fetchRestaurantById = cache(async (osmId: string) => {
  const parsed = parseOsmId(osmId);
  if (!parsed) return null;
  return fetchRestaurantByIdCached(parsed.type, parsed.id);
});
