"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RestaurantRow } from "@/components/restaurant-row";
import { SplitFlap } from "@/components/split-flap";
import { formatDistance, isYes, KIND_LABELS, labelCuisine } from "@/lib/labels";
import { KIND_ICONS } from "@/lib/kind-icons";
import type { PlaceKind, RestaurantSummary } from "@/lib/geo/types";

const PAGE_SIZE = 24;
const ALL = "all";

type Criterion = "openNow" | "vegetarian" | "vegan" | "wheelchair" | "takeaway";

type Filters = {
  kind: PlaceKind | typeof ALL;
  cuisine: string;
  criteria: Record<Criterion, boolean>;
};

const DEFAULT_FILTERS: Filters = {
  kind: ALL,
  cuisine: ALL,
  criteria: {
    openNow: false,
    vegetarian: false,
    vegan: false,
    wheelchair: false,
    takeaway: false,
  },
};

const CRITERIA: { key: Criterion; label: string }[] = [
  { key: "openNow", label: "Ouvert maintenant" },
  { key: "vegetarian", label: "Végétarien" },
  { key: "vegan", label: "Vegan" },
  { key: "wheelchair", label: "Accès fauteuil roulant" },
  { key: "takeaway", label: "À emporter" },
];

const KINDS: (PlaceKind | typeof ALL)[] = [ALL, "restaurant", "fast_food", "cafe"];

// Les graduations de la règle : la liste, déjà triée par distance, se lit
// tranche par tranche.
const BANDS = [
  { max: 250, label: "Moins de 250 m" },
  { max: 500, label: "De 250 à 500 m" },
  { max: 1000, label: "De 500 m à 1 km" },
  { max: Infinity, label: "Au-delà de 1 km" },
];

const panelLabel =
  "mb-3 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground";

function matches(r: RestaurantSummary, { kind, cuisine, criteria }: Filters): boolean {
  if (kind !== ALL && r.kind !== kind) return false;
  if (cuisine !== ALL && !r.cuisine.includes(cuisine)) return false;
  if (criteria.openNow && r.status?.state !== "open") return false;
  // Une adresse vegan convient aussi à qui cherche du végétarien.
  if (criteria.vegetarian && !isYes(r.vegetarian) && !isYes(r.vegan)) return false;
  if (criteria.vegan && !isYes(r.vegan)) return false;
  if (criteria.wheelchair && r.wheelchair !== "yes") return false;
  if (criteria.takeaway && !isYes(r.takeaway)) return false;
  return true;
}

function capitalize(label: string): string {
  return label.charAt(0).toLocaleUpperCase("fr-FR") + label.slice(1);
}

function countActive({ kind, cuisine, criteria }: Filters): number {
  return (
    Number(kind !== ALL) +
    Number(cuisine !== ALL) +
    Object.values(criteria).filter(Boolean).length
  );
}

/** Libellés de la règle : « 0 », « 250 m », « 1 km », « 1,5 km ». */
function rulerLabel(meters: number): string {
  return meters === 0 ? "0" : formatDistance(meters);
}

/**
 * Règle graduée du centre jusqu'au rayon de recherche : un trait tous les
 * 100 m, les limites de tranches chiffrées, et la portion occupée par la
 * tranche en jaune. Les chiffres sont déjà dans le titre : règle masquée
 * aux lecteurs d'écran.
 */
function DistanceRuler({ from, to, radius }: { from: number; to: number; radius: number }) {
  const scale = Math.max(radius, 100);
  const at = (meters: number) => `${(Math.min(meters, scale) / scale) * 100}%`;
  const ticks = Array.from({ length: Math.floor(scale / 100) + 1 }, (_, i) => i * 100);
  const labelled = [0, ...BANDS.map((band) => band.max).filter((max) => max < scale), scale];
  // Sur mobile, la règle est courte : seuls 0, la borne de fin de la tranche
  // et le rayon restent chiffrés (la borne de début est dans le titre), les
  // autres repères gardent leur trait.
  const keptOnMobile = new Set([0, to, scale]);

  return (
    <span aria-hidden className="relative mb-0.5 block h-7 min-w-0 flex-1">
      {labelled.map((meters, index) => (
        <span
          key={meters}
          className={cn(
            "absolute top-0 whitespace-nowrap font-sans text-[11px] font-normal leading-none tabular-nums",
            index === 0 ? "translate-x-0" : index === labelled.length - 1 ? "-translate-x-full" : "-translate-x-1/2",
            meters === from || meters === to ? "text-primary" : "text-muted-foreground",
            !keptOnMobile.has(meters) && "hidden md:block"
          )}
          style={{ left: at(meters) }}
        >
          {rulerLabel(meters)}
        </span>
      ))}
      <span className="absolute inset-x-0 bottom-0 h-px bg-input" />
      {ticks.map((meters) => (
        <span
          key={meters}
          className={cn(
            "absolute bottom-0 w-px bg-input",
            labelled.includes(meters) ? "h-3" : "h-1.5"
          )}
          style={{ left: at(meters) }}
        />
      ))}
      <span
        className="absolute bottom-0 h-1 bg-primary"
        style={{ left: at(from), width: `calc(${at(to)} - ${at(from)})` }}
      />
    </span>
  );
}

export function RestaurantResults({
  restaurants,
  ville,
  radius,
}: {
  restaurants: RestaurantSummary[];
  ville: string;
  /** Rayon de recherche en mètres, fin de la règle graduée. */
  radius: number;
}) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [panelOpen, setPanelOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const panelId = useId();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const kindCounts = useMemo(() => {
    const counts: Record<string, number> = { [ALL]: restaurants.length };
    for (const r of restaurants) counts[r.kind] = (counts[r.kind] ?? 0) + 1;
    return counts;
  }, [restaurants]);

  const cuisineOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of restaurants) {
      for (const c of r.cuisine) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [restaurants]);

  const filtered = useMemo(
    () => restaurants.filter((r) => matches(r, filters)),
    [restaurants, filters]
  );

  const activeCount = countActive(filters);
  const visible = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visible.length;

  // Défilement continu : la sentinelle en bas de liste déclenche l'affichage
  // du lot suivant avant même d'atteindre le bas de l'écran (marge 640px),
  // sans bouton ni rupture de page. Toutes les adresses sont déjà chargées
  // depuis le serveur ; seul le nombre de lignes affichées augmente.
  const loadMore = useCallback(() => {
    setVisibleCount((count) => {
      const next = Math.min(count + PAGE_SIZE, filtered.length);
      if (next > count) {
        setAnnouncement(`${next - count} adresses supplémentaires affichées.`);
      }
      return next;
    });
  }, [filtered.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || remaining <= 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "640px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [remaining, loadMore]);

  const bands = BANDS.map((band, index) => {
    const min = BANDS[index - 1]?.max ?? 0;
    return {
      ...band,
      min,
      items: visible.filter((r) => r.distance >= min && r.distance < band.max),
    };
  }).filter((band) => band.items.length > 0);

  function update(next: Partial<Filters>) {
    setFilters((current) => ({ ...current, ...next }));
    setVisibleCount(PAGE_SIZE);
  }

  function toggle(key: Criterion) {
    setFilters((current) => ({
      ...current,
      criteria: { ...current.criteria, [key]: !current.criteria[key] },
    }));
    setVisibleCount(PAGE_SIZE);
  }

  function reset() {
    setFilters(DEFAULT_FILTERS);
    setVisibleCount(PAGE_SIZE);
  }

  const noun = filtered.length > 1 ? "adresses" : "adresse";

  return (
    <div className="mt-6 md:grid md:grid-cols-[15rem_minmax(0,1fr)] md:gap-x-12 lg:gap-x-16">
      {/* Mobile : compteur et bouton « Filtrer » sur une même ligne, pour que
          les premières adresses tiennent dans le premier écran. */}
      <div className="flex items-center justify-between gap-4 md:col-start-2 md:row-start-1 md:block md:pb-5">
        <p aria-live="polite" className="text-muted-foreground">
          <SplitFlap
            key={filtered.length}
            text={String(filtered.length)}
            className="mr-2.5 inline-block align-[-0.15em] font-display text-3xl font-bold leading-none text-foreground"
          />{" "}
          {activeCount > 0 ? `${noun} sur ${restaurants.length}` : noun}
          {activeCount === 0 && (
            <span className="hidden md:inline">, de la plus proche à la plus éloignée du centre</span>
          )}
        </p>
        <Button
          variant="outline"
          aria-expanded={panelOpen}
          aria-controls={panelId}
          onClick={() => setPanelOpen((open) => !open)}
          className="shrink-0 md:hidden"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filtrer
          {activeCount > 0 && (
            <span className="grid h-6 min-w-6 place-items-center rounded-sm bg-primary px-1 text-sm tabular-nums text-primary-foreground">
              <span className="sr-only">, filtres actifs : </span>
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      <div
        id={panelId}
        className={cn(
          "mt-5 space-y-8 border-b border-input pb-8 md:sticky md:top-6 md:col-start-1 md:row-span-2 md:row-start-1 md:mt-1 md:block md:self-start md:border-0 md:pb-0",
          !panelOpen && "hidden"
        )}
      >
          <fieldset>
            <legend className={panelLabel}>Type d&rsquo;adresse</legend>
            <div className="grid gap-1">
              {KINDS.map((kind) => {
                const selected = filters.kind === kind;
                const Icon = kind === ALL ? null : KIND_ICONS[kind];
                return (
                  <button
                    key={kind}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => update({ kind })}
                    disabled={!kindCounts[kind]}
                    className={cn(
                      "flex min-h-11 items-center justify-between gap-3 rounded-md px-3 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:text-slack",
                      selected
                        ? "bg-primary font-semibold text-primary-foreground"
                        : "text-foreground hover:bg-accent"
                    )}
                  >
                    <span className="inline-flex items-center gap-2">
                      {Icon && <Icon className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />}
                      {kind === ALL ? "Tout" : KIND_LABELS[kind]}
                    </span>
                    <span
                      className={cn(
                        "font-display text-lg tabular-nums",
                        !selected && "text-muted-foreground"
                      )}
                    >
                      {kindCounts[kind] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {cuisineOptions.length > 0 && (
            <div>
              <span id={`${panelId}-cuisine`} className={panelLabel}>
                Cuisine
              </span>
              <Select value={filters.cuisine} onValueChange={(cuisine) => update({ cuisine })}>
                <SelectTrigger aria-labelledby={`${panelId}-cuisine`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-80">
                  <SelectItem value={ALL}>Toutes les cuisines</SelectItem>
                  {cuisineOptions.map(([cuisine, count]) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {capitalize(labelCuisine(cuisine))} ({count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <fieldset>
            <legend className={panelLabel}>Critères</legend>
            <div className="divide-y divide-border border-y border-border">
              {CRITERIA.map(({ key, label }) => {
                const on = filters.criteria[key];
                return (
                  <button
                    key={key}
                    type="button"
                    role="switch"
                    aria-checked={on}
                    onClick={() => toggle(key)}
                    className="group flex min-h-12 w-full items-center justify-between gap-4 text-left outline-offset-[-2px]"
                  >
                    <span
                      className={cn(
                        "transition-colors duration-150",
                        on ? "font-semibold text-foreground" : "text-foreground/85 group-hover:text-foreground"
                      )}
                    >
                      {label}
                    </span>
                    {/* Commutateur : la position du plot dit l'état, la couleur le confirme. */}
                    <span
                      aria-hidden
                      className={cn(
                        "relative h-6 w-10 shrink-0 rounded-md border transition-colors duration-150",
                        on
                          ? "border-primary bg-primary"
                          : "border-input group-hover:border-muted-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-[3px] size-4 rounded-sm transition-[left,background-color] duration-200 ease-out-expo",
                          on ? "left-[calc(100%-1.1875rem)] bg-primary-foreground" : "left-[3px] bg-input"
                        )}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Seules les adresses dont l&rsquo;information est renseignée sur
              OpenStreetMap passent ces filtres.
            </p>
          </fieldset>

          {activeCount > 0 && (
            <Button variant="link" onClick={reset} className="h-auto px-0">
              Effacer les filtres
            </Button>
          )}
      </div>

      <section
        aria-labelledby={`${panelId}-titre`}
        className="mt-3 min-w-0 md:col-start-2 md:row-start-2 md:mt-0"
      >
        <h2 id={`${panelId}-titre`} className="sr-only">
          Adresses
        </h2>

        {filtered.length === 0 ? (
          <div className="border-t border-input py-16">
            <p className="font-display text-3xl font-semibold">Aucune adresse ne correspond.</p>
            <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
              Les informations comme le régime alimentaire ou l&rsquo;accessibilité
              manquent souvent sur OpenStreetMap. Retirez un critère pour élargir.
            </p>
            <Button variant="outline" className="mt-8" onClick={reset}>
              Effacer les filtres
            </Button>
          </div>
        ) : (
          <>
            <div
              aria-hidden
              className="hidden grid-cols-[minmax(0,1fr)_11.5rem_5.5rem] gap-x-6 border-b border-input px-4 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground md:grid"
            >
              <span>Établissement</span>
              <span>Statut</span>
              <span className="text-right">Distance</span>
            </div>

            {bands.map((band) => (
              <section key={band.label} aria-label={band.label}>
                <h3 className="flex items-end gap-4 px-3 pb-1.5 pt-6 font-display text-lg font-semibold leading-none text-primary md:gap-6 md:px-4">
                  <span className="shrink-0 pb-0.5">{band.label}</span>
                  <DistanceRuler from={band.min} to={Math.min(band.max, radius)} radius={radius} />
                </h3>
                <ol>
                  {band.items.map((restaurant) => (
                    <li key={restaurant.osmId} className="border-b border-border even:bg-row-alt">
                      <RestaurantRow restaurant={restaurant} ville={ville} />
                    </li>
                  ))}
                </ol>
              </section>
            ))}

            {remaining > 0 ? (
              // Élément invisible : dès qu'il entre dans la zone de
              // préchargement, le lot suivant s'affiche. Un clavier qui
              // défile (flèches, Page suivante) le traverse comme une souris.
              <div ref={sentinelRef} aria-hidden className="h-px" />
            ) : (
              visibleCount > PAGE_SIZE && (
                <p className="mt-8 text-center text-sm text-muted-foreground">
                  Toutes les adresses sont affichées.
                </p>
              )
            )}
            <p role="status" aria-live="polite" className="sr-only">
              {announcement}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
