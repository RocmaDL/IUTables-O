import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CitySearchForm } from "@/components/city-search-form";
import { StatusMark, type StatusTone } from "@/components/opening-status";
import { KIND_ICONS } from "@/lib/kind-icons";
import { KIND_LABELS } from "@/lib/labels";
import type { PlaceKind } from "@/lib/geo/types";

const VILLES_SUGGEREES = [
  { nom: "Paris", departement: "75" },
  { nom: "Lyon", departement: "69" },
  { nom: "Marseille", departement: "13" },
  { nom: "Toulouse", departement: "31" },
  { nom: "Bordeaux", departement: "33" },
  { nom: "Lille", departement: "59" },
];

const KINDS: PlaceKind[] = ["restaurant", "fast_food", "cafe"];

const LEGENDE: { tone: StatusTone; texte: string }[] = [
  { tone: "open", texte: "D’après les horaires saisis sur OpenStreetMap, à l’heure de Paris." },
  { tone: "soon", texte: "Encore ouvert, mais ferme dans moins de 45 minutes." },
  { tone: "closed", texte: "Avec l’heure de réouverture quand elle est connue." },
  { tone: "missing", texte: "Personne ne les a encore saisis : l’adresse reste affichée." },
];

export default function Home() {
  return (
    <main id="contenu" className="flex-1">
      <section
        id="recherche"
        aria-labelledby="titre-accueil"
        className="mx-auto grid max-w-7xl scroll-mt-4 gap-14 px-4 pb-16 pt-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-16 md:px-8 md:pb-24 md:pt-20"
      >
        <div>
          <h1
            id="titre-accueil"
            className="max-w-[16ch] font-display text-[clamp(3rem,7.4vw,6rem)] font-bold leading-[0.92] tracking-[-0.025em]"
          >
            Un restaurant, dans n&rsquo;importe quelle ville de France.
          </h1>

          {/* Trois catégories, tout de suite après le titre : ce que le
              site couvre doit se voir avant même le paragraphe d'intro
              (retour de tests utilisateurs : trop petit et trop tardif
              auparavant pour rivaliser avec le reste de la page). */}
          <ul className="mt-6 flex flex-wrap gap-3">
            {KINDS.map((kind) => {
              const Icon = KIND_ICONS[kind];
              return (
                <li key={kind}>
                  <span className="inline-flex items-center gap-2.5 rounded-md border-2 border-primary px-4 py-2.5 text-lg font-semibold leading-none">
                    <Icon className="size-7 text-primary" strokeWidth={2.25} aria-hidden />
                    {KIND_LABELS[kind]}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 max-w-[36rem] text-lg leading-relaxed text-muted-foreground">
            Cherchez une ville, IUTables&rsquo;O interroge OpenStreetMap en
            direct et vous montre les restaurants sur place : cuisine, régime
            alimentaire, accessibilité, horaires.
          </p>

          <CitySearchForm
            id="ville-accueil"
            size="lg"
            showLabel
            placeholder="Rennes, Strasbourg, Nice…"
            className="mt-10"
          />
        </div>

        <section aria-labelledby="villes" className="self-start">
          <div className="flex items-baseline justify-between border-b border-input px-3 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <h2 id="villes" className="font-sans">
              Quelques villes
            </h2>
            <span aria-hidden className="pr-9">
              Dépt
            </span>
          </div>
          <ul>
            {VILLES_SUGGEREES.map(({ nom, departement }) => (
              <li key={nom} className="border-b border-border even:bg-row-alt">
                <Link
                  href={`/recherche?ville=${encodeURIComponent(nom)}`}
                  className="group grid min-h-12 grid-cols-[minmax(0,1fr)_auto_1.5rem] items-center gap-3 px-3 outline-offset-[-2px] transition-colors duration-150 hover:bg-accent"
                >
                  <span className="font-display text-2xl font-semibold leading-none tracking-[-0.01em] transition-colors duration-150 group-hover:text-primary">
                    {nom}
                  </span>
                  {/* Texte nu, sans case : réservée aux distances des
                      résultats, cette case ne doit pas se répéter ici. */}
                  <span className="font-sans text-sm font-medium tabular-nums text-muted-foreground">
                    <span className="sr-only">, département </span>
                    {departement}
                  </span>
                  <ArrowRight
                    className="size-5 -translate-x-1 text-primary opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <section aria-labelledby="legende" className="border-t border-border bg-row-alt">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-16 md:px-8">
          <div>
            <h2 id="legende" className="font-display text-4xl font-bold tracking-[-0.015em]">
              Lire le tableau
            </h2>
            <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">
              Les adresses sont rangées de la plus proche à la plus éloignée du
              centre-ville. La case blanche donne la distance à vol
              d&rsquo;oiseau :{" "}
              <span className="inline-grid h-6 place-items-center rounded-md bg-voie px-1.5 align-[-0.1em] font-display text-base font-bold tabular-nums text-voie-foreground">
                350 m
              </span>
              .
            </p>
          </div>

          <dl className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {LEGENDE.map(({ tone, texte }) => (
              <div key={tone} className="border-t border-input pt-4">
                <dt className="text-lg">
                  <StatusMark tone={tone} iconClassName="size-5" />
                </dt>
                <dd className="mt-2 leading-relaxed text-muted-foreground">{texte}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
