"use client";

import { useSyncExternalStore } from "react";
import { cn } from "cn";

const formatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  hour: "2-digit",
  minute: "2-digit",
});

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 10_000);
  return () => window.clearInterval(id);
}

const readTime = () => formatter.format(new Date());

/**
 * Horloge du tableau : l'heure de Paris, celle qui sert à calculer
 * « ouvert maintenant ». Rien au rendu serveur, pour éviter un écart
 * d'hydratation.
 */
export function ParisClock({ className }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, readTime, () => null);

  return (
    <p className={cn("flex items-baseline gap-2", className)}>
      <span className="text-xs text-muted-foreground">Paris</span>
      <span className="sr-only">, il est </span>
      <span className="min-w-[4.5ch] font-display text-2xl font-semibold leading-none tabular-nums text-primary">
        {time ?? "--:--"}
      </span>
    </p>
  );
}
