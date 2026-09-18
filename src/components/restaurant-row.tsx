import Link from "next/link";
import { OpeningStatusLine } from "@/components/opening-status";
import { formatDistance, isYes, KIND_LABELS, labelCuisine } from "@/lib/labels";
import { KIND_ICONS } from "@/lib/kind-icons";
import type { RestaurantSummary } from "@/lib/geo/types";

/**
 * Une ligne du tableau : établissement, statut, distance. La disposition
 * (zones de grille) est dans `.board-row`, globals.css : sur mobile, le
 * statut remonte juste sous les métadonnées, avant les services.
 */
export function RestaurantRow({
  restaurant,
  ville,
}: {
  restaurant: RestaurantSummary;
  /** Recherche d'origine, pour proposer le retour depuis la fiche. */
  ville: string;
}) {
  const cuisines = restaurant.cuisine.slice(0, 3).map(labelCuisine).join(", ");
  const meta = [cuisines, restaurant.address].filter(Boolean).join(" · ");
  const KindIcon = KIND_ICONS[restaurant.kind];

  const services = [
    isYes(restaurant.vegan) ? "Vegan" : isYes(restaurant.vegetarian) && "Végétarien",
    restaurant.wheelchair === "yes" && "Accès fauteuil roulant",
    isYes(restaurant.takeaway) && "À emporter",
  ].filter((service): service is string => Boolean(service));

  const href = `/restaurant/${restaurant.osmId}?ville=${encodeURIComponent(ville)}`;

  return (
    <article className="board-row group relative grid gap-x-4 px-3 py-3.5 transition-colors duration-150 hover:bg-accent md:gap-x-6 md:px-4 md:py-4">
      <h4 className="font-display text-[1.375rem] font-semibold leading-tight [grid-area:name] md:text-2xl">
        <Link
          href={href}
          className="transition-colors duration-150 after:absolute after:inset-0 group-hover:text-primary focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-primary"
        >
          {restaurant.name}
        </Link>
      </h4>

      <p className="mt-1 flex items-center gap-1.5 text-sm leading-snug text-muted-foreground [grid-area:meta]">
        <KindIcon className="size-[15px] shrink-0" strokeWidth={2.25} aria-hidden />
        {KIND_LABELS[restaurant.kind]}
        {meta && <span aria-hidden>·</span>}
        {meta}
      </p>

      <OpeningStatusLine
        status={restaurant.status}
        stacked="md"
        className="mt-1.5 [grid-area:status] md:mt-0 md:pt-1.5"
      />

      {services.length > 0 && (
        <ul className="mt-2.5 flex flex-wrap gap-1.5 [grid-area:tags]" aria-label="Services">
          {services.map((service) => (
            <li
              key={service}
              className="rounded-sm border border-input px-1.5 py-0.5 text-xs leading-tight text-foreground"
            >
              {service}
            </li>
          ))}
        </ul>
      )}

      <p className="justify-self-end [grid-area:dist] md:pt-1">
        <span className="inline-grid h-8 min-w-[4.5rem] place-items-center rounded-md bg-voie px-2 font-display text-lg font-bold tabular-nums text-voie-foreground">
          <span className="sr-only">À </span>
          {formatDistance(restaurant.distance)}
        </span>
      </p>
    </article>
  );
}
