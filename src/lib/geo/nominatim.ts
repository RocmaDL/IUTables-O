import "server-only";
import { USER_AGENT } from "./http";
import type { GeocodedPlace } from "./types";

/** Nominatim a répondu en erreur ou n'a pas répondu à temps. */
export class GeocodingUnavailableError extends Error {
  constructor(cause: unknown) {
    super("Nominatim indisponible", { cause });
    this.name = "GeocodingUnavailableError";
  }
}

const ATTEMPT_TIMEOUT_MS = 8_000;
/** Un second essai absorbe une coupure ou un pic de charge passagers. */
const ATTEMPTS = 2;

async function fetchNominatim(url: URL): Promise<Response> {
  let lastError: unknown;
  for (let tries = 0; tries < ATTEMPTS; tries++) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
        next: { revalidate: 60 * 60 * 24 }, // les frontières d'une ville ne bougent pas
      });
      if (response.ok) return response;
      lastError = `HTTP ${response.status}`;
      // Une erreur serveur (5xx) ou un 429 mérite un second essai ; une
      // requête mal formée (4xx hors 429) ne changera pas de résultat.
      if (response.status < 500 && response.status !== 429) break;
    } catch (error) {
      lastError = error;
    }
  }
  throw new GeocodingUnavailableError(lastError);
}

/**
 * Cherche une commune française. Renvoie `null` si aucune ne correspond,
 * lève `GeocodingUnavailableError` si le service ne répond pas après deux
 * essais : les deux cas appellent des messages différents côté interface.
 */
export async function geocodeCity(query: string): Promise<GeocodedPlace | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("countrycodes", "fr");
  // Limite aux villes, bourgs et villages : sans ce filtre, « Orléans »
  // peut renvoyer une rue ou un commerce du même nom.
  url.searchParams.set("featureType", "settlement");
  url.searchParams.set("limit", "1");

  const response = await fetchNominatim(url);

  const results = (await response.json()) as Array<{
    name: string;
    display_name: string;
    lat: string;
    lon: string;
    boundingbox: [string, string, string, string];
  }>;

  const first = results[0];
  if (!first) return null;

  const [south, north, west, east] = first.boundingbox.map(Number);

  return {
    displayName: first.display_name,
    city: first.name || first.display_name.split(",")[0].trim(),
    lat: Number(first.lat),
    lon: Number(first.lon),
    boundingBox: { south, north, west, east },
  };
}
