import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { withDepartmentName } from "./departments";
import type { GeocodedPlace, LiveRestaurant, OsmType, PlaceKind } from "./types";

/** Geoapify a répondu en erreur ou n'a pas répondu à temps. */
export class GeoapifyUnavailableError extends Error {
  constructor(cause: unknown) {
    super("Geoapify indisponible", { cause });
    this.name = "GeoapifyUnavailableError";
  }
}

// Rétrocompatibilité : les deux pages appelantes distinguaient un échec de
// géocodage d'un échec de recherche. Les deux passent désormais par le même
// fournisseur et la même classe d'erreur.
export const GeocodingUnavailableError = GeoapifyUnavailableError;

const ATTEMPT_TIMEOUT_MS = 10_000;
/** Un second essai absorbe un pic de charge passager. */
const ATTEMPTS = 2;

function apiKey(): string {
  const key = process.env.GEOAPIFY_API_KEY;
  if (!key) throw new Error("GEOAPIFY_API_KEY manquante (voir .env.example)");
  return key;
}

type GeoapifyFeature = {
  properties: Record<string, unknown> & {
    datasource?: { raw?: Record<string, string | number | boolean | undefined> };
  };
  geometry: { coordinates: [number, number] };
  bbox?: [number, number, number, number];
};

async function fetchGeoapify(
  url: URL,
  cacheOptions?: NextFetchRequestConfig
): Promise<{ features: GeoapifyFeature[] }> {
  let lastError: unknown;
  for (let tries = 0; tries < ATTEMPTS; tries++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
        // La mise en cache se fait au niveau de la fonction appelante pour
        // les recherches (`unstable_cache`, qui ne garde que les réponses
        // complètes) ; le cache `fetch` suffit pour le géocodage.
        ...(cacheOptions ? { next: cacheOptions } : { cache: "no-store" }),
      });
      if (response.ok) return response.json();
      lastError = `HTTP ${response.status}`;
      // Une erreur serveur (5xx) ou un 429 mérite un second essai ; une
      // requête mal formée (4xx hors 429) ne changera pas de résultat.
      if (response.status < 500 && response.status !== 429) break;
    } catch (error) {
      lastError = error;
    }
  }
  throw new GeoapifyUnavailableError(lastError);
}

/**
 * Cherche une commune française. Renvoie `null` si aucune ne correspond,
 * lève `GeoapifyUnavailableError` si le service ne répond pas après deux
 * essais.
 */
export async function geocodeCity(query: string): Promise<GeocodedPlace | null> {
  const url = new URL("https://api.geoapify.com/v1/geocode/search");
  // Limite aux communes : sans ce filtre, « Orléans » peut renvoyer une
  // adresse ou une voie du même nom. La reformulation lève l'ambiguïté des
  // noms partagés par plusieurs communes (« Saint-Denis 93 »), que ce
  // géocodeur lit sinon comme une adresse postale.
  url.searchParams.set("text", withDepartmentName(query));
  url.searchParams.set("type", "city");
  url.searchParams.set("filter", "countrycode:fr");
  url.searchParams.set("limit", "1");
  url.searchParams.set("apiKey", apiKey());

  const data = await fetchGeoapify(url, { revalidate: 60 * 60 * 24 }); // le centre d'une commune ne bouge pas
  const first = data.features[0];
  if (!first) return null;

  const p = first.properties as {
    name?: string;
    city?: string;
    county?: string;
    state?: string;
    lat?: number;
    lon?: number;
  };
  const [west, south, east, north] = first.bbox ?? [0, 0, 0, 0];
  const city = p.city ?? p.name ?? query;
  // Reconstruit une chaîne au format Nominatim (« Ville, Département,
  // Région, France ») pour que la mise en forme de la région à l'affichage
  // (garder les deux premiers segments non numériques, hors « France »)
  // reste identique quel que soit le fournisseur.
  const displayName = [city, p.county, p.state, "France"].filter(Boolean).join(", ");

  return {
    displayName,
    city,
    lat: p.lat ?? first.geometry.coordinates[1],
    lon: p.lon ?? first.geometry.coordinates[0],
    boundingBox: { south, north, west, east },
  };
}

/**
 * Rayon de recherche autour du centre de la commune : la moitié de la plus
 * petite dimension de son emprise, bornée pour rester rapide en ville dense
 * et utile dans un village.
 */
const MIN_RADIUS_M = 500;
const MAX_RADIUS_M = 1_500;

export function searchRadius(place: GeocodedPlace): number {
  const { south, north, west, east } = place.boundingBox;
  const metersPerDegree = 111_320;
  const height = (north - south) * metersPerDegree;
  const width = (east - west) * metersPerDegree * Math.cos((place.lat * Math.PI) / 180);
  const half = Math.min(height, width) / 2;
  return Math.round(Math.min(MAX_RADIUS_M, Math.max(MIN_RADIUS_M, half)));
}

/** Plafond d'adresses renvoyées ; Paris en compte plus de 14 000. */
export const RESULT_CAP = 400;

const OSM_TYPES: Record<string, OsmType> = { n: "node", w: "way", r: "relation" };

/** `n123` → { type: "node", id: 123 } ; `null` si l'identifiant est invalide. */
export function parseOsmId(osmId: string): { type: OsmType; id: number } | null {
  const match = /^([nwr])(\d{1,12})$/.exec(osmId);
  if (!match) return null;
  return { type: OSM_TYPES[match[1]], id: Number(match[2]) };
}

export function osmUrl(restaurant: Pick<LiveRestaurant, "osmType" | "osmId">): string {
  return `https://www.openstreetmap.org/${restaurant.osmType}/${restaurant.osmId.slice(1)}`;
}

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(";").map((v) => v.trim()).filter(Boolean);
}

function str(value: string | number | boolean | undefined): string | null {
  return typeof value === "string" ? value : value != null ? String(value) : null;
}

/**
 * Reconstruit une adresse OSM à partir des tags bruts renvoyés par
 * Geoapify. Les deux points d'entrée (recherche par rayon, fiche par
 * identifiant) préfixent différemment ces tags : la recherche les rend tels
 * quels (`street`), la fiche garde le préfixe OSM (`addr:street`).
 */
function toRestaurant(
  feature: GeoapifyFeature,
  addrPrefix: "" | "addr:"
): LiveRestaurant | null {
  const raw = feature.properties.datasource?.raw;
  const name = raw?.name;
  const osmType = raw?.osm_type as OsmType | undefined;
  const osmId = raw?.osm_id;
  if (!raw || typeof name !== "string" || !osmType || osmId == null) return null;

  const street = str(raw[`${addrPrefix}street`]) ?? str(raw[`${addrPrefix}place`]);
  const housenumber = str(raw[`${addrPrefix}housenumber`]);
  const [lon, lat] = feature.geometry.coordinates;

  return {
    osmId: `${osmType[0]}${osmId}`,
    osmType,
    name,
    kind: raw.amenity as PlaceKind,
    lat,
    lon,
    cuisine: splitList(str(raw.cuisine)?.toLowerCase() ?? undefined),
    vegetarian: str(raw["diet:vegetarian"]),
    vegan: str(raw["diet:vegan"]),
    wheelchair: str(raw.wheelchair),
    openingHours: str(raw.opening_hours),
    delivery: str(raw.delivery),
    takeaway: str(raw.takeaway),
    outdoorSeating: str(raw.outdoor_seating),
    internetAccess: str(raw.internet_access),
    phone: str(raw.phone) ?? str(raw["contact:phone"]),
    website: str(raw.website) ?? str(raw["contact:website"]),
    address: street ? [housenumber, street].filter(Boolean).join(" ") : null,
    postcode: str(raw[`${addrPrefix}postcode`]),
    city: str(raw[`${addrPrefix}city`]),
  };
}

const AMENITY_CATEGORIES = "catering.restaurant,catering.cafe,catering.fast_food";

/**
 * Restaurants, fast-foods et cafés dans un rayon autour d'un point.
 * Mis en cache 30 minutes par position : une erreur levée n'est jamais
 * mise en cache, la recherche suivante retentera donc Geoapify.
 */
export const fetchRestaurantsAround = unstable_cache(
  async (lat: number, lon: number, radius: number): Promise<LiveRestaurant[]> => {
    const url = new URL("https://api.geoapify.com/v2/places");
    url.searchParams.set("categories", AMENITY_CATEGORIES);
    url.searchParams.set("filter", `circle:${lon},${lat},${radius}`);
    url.searchParams.set("limit", String(RESULT_CAP));
    url.searchParams.set("apiKey", apiKey());

    const data = await fetchGeoapify(url);
    return data.features
      .map((feature) => toRestaurant(feature, ""))
      .filter((r): r is LiveRestaurant => r !== null);
  },
  ["geoapify-places-v1"],
  { revalidate: 60 * 30 }
);

const fetchRestaurantByIdCached = unstable_cache(
  async (type: OsmType, id: number): Promise<LiveRestaurant | null> => {
    const url = new URL("https://api.geoapify.com/v2/place-details");
    url.searchParams.set("osm_id", String(id));
    url.searchParams.set("osm_type", type[0]);
    url.searchParams.set("apiKey", apiKey());

    const data = await fetchGeoapify(url);
    const first = data.features[0];
    return first ? toRestaurant(first, "addr:") : null;
  },
  ["geoapify-details-v1"],
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
