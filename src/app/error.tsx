"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="contenu" className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 md:px-8 md:py-24">
      <h1 className="max-w-3xl font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.02em]">
        La page a planté.
      </h1>
      <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
        Une erreur inattendue s&rsquo;est produite pendant le chargement. Un
        nouvel essai suffit souvent.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
        <button type="button" onClick={() => retry()} className={buttonVariants({ size: "lg" })}>
          <RotateCw aria-hidden />
          Réessayer
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-foreground underline decoration-primary underline-offset-[0.22em] transition-colors duration-150 hover:text-primary"
        >
          Retour à l&rsquo;accueil
        </Link>
      </div>
    </main>
  );
}
