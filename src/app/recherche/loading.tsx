import { SplitFlap } from "@/components/split-flap";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-8 md:py-14">
      <div className="border-b border-input pb-8">
        {/* Le tableau cherche : les cases défilent jusqu'à l'arrivée des données. */}
        <SplitFlap
          text="Recherche"
          idle
          className="block font-display text-[clamp(2.25rem,6.5vw,4.75rem)] font-bold leading-none"
        />
        <p role="status" className="mt-4 text-lg text-muted-foreground">
          Recherche des restaurants en cours…
        </p>
        <p className="mt-1 text-sm text-slack">
          OpenStreetMap peut mettre quelques secondes à répondre.
        </p>
      </div>

      <div className="mt-8 md:grid md:grid-cols-[15rem_minmax(0,1fr)] md:gap-12 lg:gap-16">
        <div className="hidden space-y-1 md:block">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </div>
        <div>
          <Skeleton className="mb-5 h-8 w-72 max-w-full" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-border px-3 py-4 even:bg-row-alt md:px-4"
            >
              <div className="space-y-2.5">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-8 w-[4.5rem]" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
