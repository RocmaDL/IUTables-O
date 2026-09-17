import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-10">
      <p className="sr-only" role="status">
        Chargement de la fiche…
      </p>
      <Skeleton className="my-3 h-5 w-44" />
      <div className="mt-6 border-b border-input pb-8">
        <Skeleton className="h-14 w-3/4 md:h-20" />
        <Skeleton className="mt-4 h-5 w-48" />
      </div>
      <div className="mt-10 grid gap-12 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-16">
        <div className="space-y-12">
          <div className="grid gap-10 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-5 w-40" />
              </div>
            ))}
          </div>
          <div>
            <Skeleton className="h-8 w-32" />
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex justify-between border-b border-border px-3 py-3.5">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="aspect-[4/3] w-full md:aspect-square" />
      </div>
    </main>
  );
}
