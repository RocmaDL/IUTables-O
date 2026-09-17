import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Comment IUTables'O trouve des restaurants dans toute la France, et pourquoi les données sont parfois incomplètes.",
};

const linkClass =
  "text-foreground underline decoration-primary underline-offset-[0.22em] transition-colors duration-150 hover:text-primary";

export default function AProposPage() {
  return (
    <main id="contenu" className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 md:px-8 md:py-20">
      <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
        <h1 className="font-display text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.02em] md:sticky md:top-10 md:self-start">
          D&rsquo;où viennent les restaurants affichés ?
        </h1>

        <div className="max-w-[65ch] space-y-6 text-lg leading-[1.7] text-foreground/90 md:pt-3">
          <p>
            IUTables&rsquo;O n&rsquo;a pas sa propre base de restaurants.
            Chaque recherche interroge OpenStreetMap : Nominatim pour
            retrouver la ville, Overpass pour lister les établissements
            autour. Pour ne pas surcharger ces services gratuits, le site
            garde une recherche en cache pendant une demi-heure, puis la
            refait. Les cartes utilisent les fonds d&rsquo;OpenFreeMap, eux
            aussi tirés d&rsquo;OpenStreetMap.
          </p>
          <p>
            OpenStreetMap est construit par des contributeurs bénévoles.
            Certaines villes sont cartographiées en détail, d&rsquo;autres
            beaucoup moins : un restaurant existant peut manquer, ou une
            information (horaires, régime alimentaire, accès PMR) peut être
            absente ou dépassée. Les données sont publiées sous licence{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer noopener"
              className={linkClass}
            >
              ODbL
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
            .
          </p>
          <p>
            Ce projet est né d&rsquo;un exercice scolaire (IUT d&rsquo;Orléans)
            reconstruit comme démonstration technique : Next.js, shadcn/ui,
            et deux API publiques gratuites plutôt qu&rsquo;une base de
            données maison.
          </p>
        </div>
      </div>
    </main>
  );
}
