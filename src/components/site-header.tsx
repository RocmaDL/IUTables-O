"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed } from "lucide-react";
import { ParisClock } from "@/components/paris-clock";

const navLink =
  "min-h-11 items-center rounded-md px-3 text-muted-foreground transition-colors duration-150 hover:text-foreground";

export function SiteHeader() {
  const pathname = usePathname();
  // L'horloge sert à lire « ouvert maintenant » : utile sur les pages qui
  // affichent des restaurants, pas sur l'accueil ou la page à-propos, où
  // elle ne fait que renforcer une esthétique de gare sans raison
  // (retour de critique utilisateur, 18/09/2026).
  const showClock = pathname.startsWith("/recherche") || pathname.startsWith("/restaurant/");

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 md:px-8">
        {/* Logotype : couverts croisés seuls comme signal « restaurant ».
            Le « O » ne reprend plus la case « voie » des distances — cette
            case reste réservée aux résultats, où elle a un sens réel. */}
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 rounded-md pr-2 font-display text-2xl font-bold leading-none tracking-[-0.01em]"
        >
          <UtensilsCrossed className="size-5 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
          LesTables
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          <nav aria-label="Principale" className="flex items-center text-sm">
            <Link href="/#recherche" className={`${navLink} hidden sm:inline-flex`}>
              Chercher une ville
            </Link>
            <Link href="/a-propos" className={`${navLink} inline-flex`}>
              À propos
            </Link>
          </nav>
          {showClock && (
            <ParisClock className="hidden border-l border-border pl-6 sm:flex" />
          )}
        </div>
      </div>
    </header>
  );
}
