import { CitySearchForm } from "@/components/city-search-form";
import { SplitFlap } from "@/components/split-flap";

export default function NotFound() {
  return (
    <main id="contenu" className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 md:px-8 md:py-24">
      <h1 className="max-w-4xl font-display text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-none">
        <SplitFlap text="Rien à cette adresse." />
      </h1>
      <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
        Le lien est incomplet, ou l&rsquo;établissement a été retiré
        d&rsquo;OpenStreetMap depuis. Une nouvelle recherche le retrouvera
        s&rsquo;il existe toujours.
      </p>
      <CitySearchForm size="lg" placeholder="Chercher une ville…" className="mt-12" />
    </main>
  );
}
