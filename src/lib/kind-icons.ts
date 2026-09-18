import { Coffee, Hamburger, UtensilsCrossed, type LucideIcon } from "lucide-react";
import type { PlaceKind } from "@/lib/geo/types";

/**
 * Une icône par type d'adresse, partagée entre l'accueil, le panneau de
 * filtres et les lignes de résultats : repérer « c'est un site de
 * restaurants » doit être immédiat, retour de tests utilisateurs.
 * Hamburger plutôt que Sandwich (retour de critique, 18/09/2026) : testé
 * à la taille réelle d'affichage (28px), le sandwich se lit comme une
 * boîte à couvercle sans le mot à côté, le hamburger se reconnaît seul.
 */
export const KIND_ICONS: Record<PlaceKind, LucideIcon> = {
  restaurant: UtensilsCrossed,
  fast_food: Hamburger,
  cafe: Coffee,
};
