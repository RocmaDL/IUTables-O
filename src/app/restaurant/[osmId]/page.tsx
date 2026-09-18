import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft, ArrowUpRight, Check, CircleDashed, Minus, Phone, X } from "lucide-react";
import { cn } from "cn";
import { StatusMark, toneOf } from "@/components/opening-status";
import { RestaurantMap } from "@/components/restaurant-map";
import { buttonVariants } from "@/components/ui/button";
import {
  fetchRestaurantById,
  fetchRestaurantsAround,
  GeoapifyUnavailableError,
  geocodeCity,
  osmUrl,
  parseOsmId,
  searchRadius,
} from "@/lib/geo/geoapify";
import { getOpeningStatus, getWeekSchedule, parisWallClock } from "@/lib/opening-hours";
import { KIND_LABELS, labelCuisine, labelYesNo } from "@/lib/labels";
import { KIND_ICONS } from "@/lib/kind-icons";
import type { LiveRestaurant } from "@/lib/geo/types";

// Voir la même constante dans /recherche : Geoapify peut dépasser la
// limite par défaut d'une fonction Vercel.
export const maxDuration = 60;

type Props = PageProps<"/restaurant/[osmId]">;

function readVille(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value.trim().slice(0, 100) || null : null;
}

/**
 * Depuis une page de résultats, la fiche est déjà dans le cache de la
 * recherche (mêmes arguments, donc même clé) : on la reprend là plutôt que
 * de solliciter à nouveau Geoapify. La requête par identifiant ne sert
 * qu'aux liens ouverts sans `?ville=` ou quand l'adresse n'y figure pas.
 */
const findRestaurant = cache(
  async (osmId: string, ville: string | null): Promise<LiveRestaurant | null> => {
    if (ville) {
      const place = await geocodeCity(ville).catch(() => null);
      if (place) {
        const around = await fetchRestaurantsAround(place.lat, place.lon, searchRadius(place));
        const match = around.find((restaurant) => restaurant.osmId === osmId);
        if (match) return match;
      }
    }
    return fetchRestaurantById(osmId);
  }
);

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { osmId } = await params;
  const ville = readVille((await searchParams).ville);
  const restaurant = await findRestaurant(osmId, ville).catch(() => undefined);
  if (restaurant === undefined) return { title: "Fiche restaurant" };
  if (restaurant === null) return { title: "Adresse introuvable" };

  const cuisines = restaurant.cuisine.map(labelCuisine).join(", ");
  const summary = [
    KIND_LABELS[restaurant.kind],
    cuisines && `(${cuisines})`,
    restaurant.city && `à ${restaurant.city}`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title: restaurant.name,
    description: `${summary}. Horaires, accès et contact d'après OpenStreetMap.`,
  };
}

/** Les tags OSM sont libres : on n'ouvre que du http(s). */
function externalUrl(value: string): URL | null {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

const linkClass =
  "text-foreground underline decoration-primary underline-offset-[0.22em] transition-colors duration-150 hover:text-primary";

const sectionTitle = "border-b border-input pb-2 font-display text-2xl font-bold";

/** Pictogramme d'une valeur oui/non OSM, pour ne pas dépendre de la couleur. */
function ServiceIcon({ value }: { value: string }) {
  if (value === "yes" || value === "only")
    return <Check className="size-4 text-status-open" strokeWidth={2.5} aria-hidden />;
  if (value === "no") return <X className="size-4 text-muted-foreground" strokeWidth={2.5} aria-hidden />;
  if (value === "limited")
    return <Minus className="size-4 text-status-soon" strokeWidth={2.5} aria-hidden />;
  return null;
}

export default async function RestaurantPage({ params, searchParams }: Props) {
  const { osmId } = await params;
  const ville = readVille((await searchParams).ville);

  if (!parseOsmId(osmId)) notFound();

  let restaurant: LiveRestaurant | null;
  try {
    restaurant = await findRestaurant(osmId, ville);
  } catch (error) {
    if (error instanceof GeoapifyUnavailableError) {
      console.error(error.message);
      return (
        <Shell ville={ville}>
          <h1 className="mt-8 max-w-3xl font-display text-[clamp(2.5rem,5.5vw,4rem)] font-bold leading-[0.95] tracking-[-0.02em]">
            OpenStreetMap ne répond pas pour l&rsquo;instant.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Impossible de charger cette fiche. Réessayez dans quelques minutes.
          </p>
        </Shell>
      );
    }
    throw error;
  }

  if (!restaurant) notFound();

  const now = parisWallClock();
  const { lat, lon, openingHours } = restaurant;
  const status = openingHours ? getOpeningStatus(openingHours, lat, lon, now) : null;
  const schedule = openingHours ? getWeekSchedule(openingHours, lat, lon, now) : null;
  const tone = toneOf(status);

  const cuisines = restaurant.cuisine.map(labelCuisine).join(", ");
  const KindIcon = KIND_ICONS[restaurant.kind];
  const phone = restaurant.phone?.split(";")[0].trim() ?? null;
  const website = restaurant.website ? externalUrl(restaurant.website) : null;
  const locality = [restaurant.postcode, restaurant.city].filter(Boolean).join(" ");

  const services: { label: string; value: string | null }[] = [
    { label: "Végétarien", value: restaurant.vegetarian },
    { label: "Vegan", value: restaurant.vegan },
    { label: "Accès fauteuil roulant", value: restaurant.wheelchair },
    { label: "À emporter", value: restaurant.takeaway },
    { label: "Livraison", value: restaurant.delivery },
    { label: "Terrasse", value: restaurant.outdoorSeating },
    { label: "Accès internet", value: restaurant.internetAccess },
  ];
  const knownServices = services.filter(
    (service): service is { label: string; value: string } => service.value !== null
  );
  const unknownServices = services.filter((service) => service.value === null);

  return (
    <Shell ville={ville}>
      <header className="mt-6 grid gap-6 border-b border-input pb-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-12">
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.02em]">
            {restaurant.name}
          </h1>
          <p className="mt-4 flex items-center gap-2 text-lg text-muted-foreground">
            <KindIcon className="size-5 shrink-0" strokeWidth={2.25} aria-hidden />
            {KIND_LABELS[restaurant.kind]}
            {cuisines && ` · ${cuisines}`}
          </p>
        </div>
        <div className="md:text-right">
          <StatusMark
            tone={tone}
            className={cn("font-display", tone === "missing" ? "text-xl" : "text-3xl")}
            iconClassName={tone === "missing" ? "size-5" : "size-7"}
          />
          {status?.detail && (
            <p className="mt-1 text-lg text-muted-foreground">{status.detail}</p>
          )}
        </div>
      </header>

      <div className="mt-10 grid gap-12 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-16">
        <div className="min-w-0 space-y-12">
          <div className="grid gap-10 sm:grid-cols-2">
            <section aria-labelledby="adresse">
              <h2 id="adresse" className={sectionTitle}>
                Adresse
              </h2>
              <address className="mt-4 text-lg not-italic leading-relaxed">
                {restaurant.address ?? <span className="text-slack">Rue non renseignée</span>}
                {locality && (
                  <>
                    <br />
                    {locality}
                  </>
                )}
              </address>
              <a
                href={`https://www.openstreetmap.org/directions?to=${lat}%2C${lon}`}
                target="_blank"
                rel="noreferrer noopener"
                className={buttonVariants({ className: "mt-5" })}
              >
                Itinéraire
                <ArrowUpRight aria-hidden />
                <span className="sr-only">(nouvel onglet)</span>
              </a>
            </section>

            <section aria-labelledby="contact">
              <h2 id="contact" className={sectionTitle}>
                Contact
              </h2>
              {phone || website ? (
                <ul className="mt-4 space-y-3 text-lg">
                  {phone && (
                    <li>
                      <a
                        href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                        className={cn(linkClass, "inline-flex min-h-11 items-center gap-2 tabular-nums")}
                      >
                        <Phone className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        {phone}
                      </a>
                    </li>
                  )}
                  {website && (
                    <li>
                      <a
                        href={website.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={cn(linkClass, "inline-flex min-h-11 items-center gap-1 break-all")}
                      >
                        {website.hostname.replace(/^www\./, "")}
                        <ArrowUpRight className="size-4 shrink-0" aria-hidden />
                        <span className="sr-only">(nouvel onglet)</span>
                      </a>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="mt-4 inline-flex items-center gap-1.5 text-slack">
                  <CircleDashed className="size-4" aria-hidden />
                  Ni téléphone ni site renseignés.
                </p>
              )}
            </section>
          </div>

          <section aria-labelledby="horaires">
            <h2 id="horaires" className={sectionTitle}>
              Horaires
            </h2>
            {schedule ? (
              <>
                <table className="w-full">
                  <caption className="sr-only">Horaires de la semaine en cours</caption>
                  <tbody>
                    {schedule.map((day) => (
                      <tr
                        key={day.label}
                        className={cn(
                          "border-b border-border",
                          day.isToday ? "bg-accent" : "even:bg-row-alt"
                        )}
                      >
                        <th
                          scope="row"
                          className={cn(
                            "py-3 pl-3 pr-4 text-left align-top",
                            day.isToday ? "font-semibold" : "font-normal"
                          )}
                        >
                          <span className="capitalize">{day.label}</span>
                          {day.isToday && (
                            <span className="ml-2 whitespace-nowrap rounded-sm bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                              aujourd&rsquo;hui
                            </span>
                          )}
                        </th>
                        <td className="py-2.5 pr-3 text-right align-top">
                          {day.ranges.length > 0 ? (
                            // Le jaune est réservé au jour même : c'est la ligne qu'on cherche.
                            <span
                              className={cn(
                                "inline-flex flex-wrap justify-end gap-x-4 font-display text-xl font-semibold tabular-nums",
                                day.isToday ? "text-primary" : "text-foreground"
                              )}
                            >
                              {day.ranges.map((range) => (
                                <span key={range} className="whitespace-nowrap">
                                  {range}
                                </span>
                              ))}
                            </span>
                          ) : (
                            !day.note && (
                              <span className="font-display text-xl text-muted-foreground">Fermé</span>
                            )
                          )}
                          {day.note && (
                            <span className="block text-sm text-muted-foreground">{day.note}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <details className="group mt-4 text-sm text-muted-foreground">
                  <summary className="inline-flex min-h-11 cursor-pointer items-center rounded-sm underline decoration-input underline-offset-4 hover:text-foreground">
                    Semaine en cours, jours fériés compris
                  </summary>
                  <p className="mt-1">
                    Valeur saisie sur OpenStreetMap :{" "}
                    <code className="break-words rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                      {openingHours}
                    </code>
                  </p>
                </details>
              </>
            ) : openingHours ? (
              <>
                <p className="mt-4 text-lg">{openingHours}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Texte saisi tel quel sur OpenStreetMap, dans un format que le
                  site ne sait pas interpréter.
                </p>
              </>
            ) : (
              <p className="mt-4 inline-flex items-center gap-1.5 text-slack">
                <CircleDashed className="size-4" aria-hidden />
                Non renseignés sur OpenStreetMap.
              </p>
            )}
          </section>

          <section aria-labelledby="sur-place">
            <h2 id="sur-place" className={sectionTitle}>
              Sur place
            </h2>
            {knownServices.length > 0 && (
              <dl>
                {knownServices.map((service) => (
                  <div
                    key={service.label}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 border-b border-border px-3 py-3 even:bg-row-alt"
                  >
                    <dt>{service.label}</dt>
                    <dd className="inline-flex items-center gap-1.5 font-semibold">
                      <ServiceIcon value={service.value} />
                      {labelYesNo(service.value)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {unknownServices.length > 0 && (
              <p className="mt-4 flex gap-1.5 text-sm leading-relaxed text-slack">
                <CircleDashed className="mt-[0.2em] size-4 shrink-0" aria-hidden />
                <span>
                  Non renseigné :{" "}
                  {unknownServices.map((service) => service.label.toLowerCase()).join(", ")}.
                </span>
              </p>
            )}
          </section>
        </div>

        <aside className="md:sticky md:top-6 md:self-start" aria-label="Carte et source">
          <RestaurantMap lat={lat} lon={lon} name={restaurant.name} />
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Une information manque ou a changé ? Elle se corrige directement sur{" "}
            <a
              href={osmUrl(restaurant)}
              target="_blank"
              rel="noreferrer noopener"
              className={linkClass}
            >
              la fiche OpenStreetMap
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
            , que ce site relit automatiquement.
          </p>
        </aside>
      </div>
    </Shell>
  );
}

function Shell({ ville, children }: { ville: string | null; children: React.ReactNode }) {
  return (
    <main id="contenu" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-10">
      <Link
        href={ville ? `/recherche?ville=${encodeURIComponent(ville)}` : "/"}
        className="-ml-1 inline-flex min-h-11 items-center gap-2 rounded-sm px-1 text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {ville ? `Restaurants à ${ville}` : "Nouvelle recherche"}
      </Link>
      {children}
    </main>
  );
}
