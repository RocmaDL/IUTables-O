import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { ParisClock } from "@/components/paris-clock";

// Sans `display` ici : chaque lien choisit le sien (le premier est masqué
// sur mobile, faute de place à côté de la marque).
const navLink =
  "min-h-11 items-center rounded-md px-3 text-muted-foreground transition-colors duration-150 hover:text-foreground";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 md:px-8">
        {/* Logotype : couverts croisés (identifie « restaurant » d'un coup
            d'œil, retour d'utilisateurs testeurs), « O » final dans une
            case de voie comme les distances. */}
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 rounded-md pr-2 font-display text-2xl font-bold leading-none tracking-[-0.01em]"
        >
          <UtensilsCrossed className="size-5 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
          IUTables&rsquo;
          <span className="-ml-1 grid h-7 w-6 place-items-center rounded-md bg-voie text-voie-foreground">
            O
          </span>
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
          <ParisClock className="hidden border-l border-border pl-6 sm:flex" />
        </div>
      </div>
    </header>
  );
}
