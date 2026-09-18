import type { Metadata } from "next";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { CitySearchForm } from "@/components/city-search-form";
import { RestaurantResults } from "@/components/restaurant-results";
import { SplitFlap } from "@/components/split-flap";
import { buttonVariants } from "@/components/ui/button";
import {
  fetchRestaurantsAround,
  GeoapifyUnavailableError,
  geocodeCity,
  RESULT_CAP,
  searchRadius,
} from "@/lib/geo/geoapify";
import { getOpeningStatus, parisWallClock } from "@/lib/opening-hours";
import { distanceInMeters, formatDistance } from "@/lib/labels";
import type { GeocodedPlace, LiveRestaurant, RestaurantSummary } from "@/lib/geo/types";

// Geocodage et recherche passent par Geoapify (deux essais, jusqu'à 10 s
// chacun) : sur Vercel, la limite par défaut d'une fonction (10 s en
// Hobby) couperait la requête avant la fin. Ajustez si votre offre
// plafonne en dessous de 60 s.
export const maxDuration = 60;

type SearchParams = Awaited<PageProps<"/recherche">["searchParams"]>;

function readVille(searchParams: SearchParams): string | null {
  const value = searchParams.ville;
  const ville = (Array.isArray(value) ? value[0] : value)?.trim();
  return ville ? ville.slice(0, 100) : null;
}

export async function generateMetadata(props: PageProps<"/recherche">): Promise<Metadata> {
  const ville = readVille(await props.searchParams);
  return {
    title: ville ? `Restaurants à ${ville}` : "Recherche",
    // Une page par saisie possible : rien d'utile à indexer.
    robots: { index: false },
  };
}

/** « Loiret, Centre-Val de Loire » à partir du nom complet renvoyé par le géocodeur. */
function regionOf(place: GeocodedPlace): string | null {
  const parts = place.displayName
    .split(",")
    .slice(1)
    .map((part) => part.trim())
    .filter((part) => !/^\d/.test(part) && !part.startsWith("France"));
  return parts.slice(0, 2).join(", ") || null;
}

const messageTitle =
  "max-w-3xl font-display text-[clamp(2.5rem,5.5vw,4rem)] font-bold leading-[0.95] tracking-[-0.02em]";

export default async function RecherchePage(props: PageProps<"/recherche">) {
  const ville = readVille(await props.searchParams);

  if (!ville) {
    return (
      <Shell>
        <h1 className={messageTitle}>Quelle ville ?</h1>
        <CitySearchForm size="lg" placeholder="Rennes, Strasbourg, Nice…" className="mt-10" />
      </Shell>
    );
  }

  let place: GeocodedPlace | null;
  try {
    place = await geocodeCity(ville);
  } catch (error) {
    if (error instanceof GeoapifyUnavailableError) return <ServiceUnavailable ville={ville} />;
    throw error;
  }

  if (!place) {
    return (
      <Shell>
        <h1 className={messageTitle}>Aucune commune ne s&rsquo;appelle « {ville} ».</h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
          Vérifiez l&rsquo;orthographe, ou ajoutez le département pour les noms
          partagés par plusieurs communes (« Saint-Denis 93 »).
        </p>
        <CitySearchForm size="lg" defaultValue={ville} className="mt-10" />
      </Shell>
    );
  }

  const radius = searchRadius(place);

  let restaurants: LiveRestaurant[];
  try {
    restaurants = await fetchRestaurantsAround(place.lat, place.lon, radius);
  } catch (error) {
    if (error instanceof GeoapifyUnavailableError) {
      console.error(error.message);
      return <ServiceUnavailable ville={ville} />;
    }
    throw error;
  }

  // Calculé à chaque requête : le cache ne contient que les données OSM,
  // jamais un statut « ouvert » figé.
  const now = parisWallClock();
  const summaries: RestaurantSummary[] = restaurants
    .map((restaurant) => ({
      ...restaurant,
      distance: distanceInMeters(place, restaurant),
      status: restaurant.openingHours
        ? getOpeningStatus(restaurant.openingHours, restaurant.lat, restaurant.lon, now)
        : null,
    }))
    .sort((a, b) => a.distance - b.distance);

  const region = regionOf(place);

  return (
    <Shell>
      {/* Sur mobile, le soulignement du champ sert déjà de séparateur. */}
      <header className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-12 md:border-b md:border-input md:pb-8">
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(2.25rem,6.5vw,4.75rem)] font-bold leading-none">
            <SplitFlap text={place.city} />
          </h1>
          {region && <p className="mt-3 text-lg text-muted-foreground md:mt-4">{region}</p>}
          {summaries.length > 0 && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {`Restaurants, fast-foods et cafés à moins de ${formatDistance(radius)} du centre`}
              {summaries.length >= RESULT_CAP &&
                `, limités aux ${RESULT_CAP} premiers renvoyés par OpenStreetMap`}
              .
            </p>
          )}
        </div>
        <CitySearchForm className="md:mb-1 md:w-80" />
      </header>

      {summaries.length === 0 ? (
        <div className="py-16">
          <p className="max-w-2xl font-display text-3xl font-semibold">
            Aucune adresse à moins de {formatDistance(radius)} du centre.
          </p>
          <p className="mt-3 max-w-lg leading-relaxed text-muted-foreground">
            Les restaurants sont ajoutés sur OpenStreetMap par des bénévoles :
            certaines communes sont moins cartographiées que d&rsquo;autres.
          </p>
        </div>
      ) : (
        <RestaurantResults restaurants={summaries} ville={ville} />
      )}
    </Shell>
  );
}

function ServiceUnavailable({ ville }: { ville: string }) {
  return (
    <Shell>
      <h1 className={messageTitle}>OpenStreetMap ne répond pas pour l&rsquo;instant.</h1>
      <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
        Les serveurs publics qui fournissent les données sont saturés ou en
        maintenance. Ça se règle en général en quelques minutes.
      </p>
      <Link
        href={`/recherche?ville=${encodeURIComponent(ville)}`}
        className={buttonVariants({ size: "lg", className: "mt-10" })}
      >
        <RotateCw aria-hidden />
        Relancer la recherche « {ville} »
      </Link>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main id="contenu" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-14">
      {children}
    </main>
  );
}
