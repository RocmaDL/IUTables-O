import { Coffee, Sandwich, UtensilsCrossed, type LucideIcon } from "lucide-react";
import type { PlaceKind } from "@/lib/geo/types";

/**
 * Une icône par type d'adresse, partagée entre l'accueil, le panneau de
 * filtres et les lignes de résultats : repérer « c'est un site de
 * restaurants » doit être immédiat, retour de tests utilisateurs.
 */
export const KIND_ICONS: Record<PlaceKind, LucideIcon> = {
  restaurant: UtensilsCrossed,
  fast_food: Sandwich,
  cafe: Coffee,
};
