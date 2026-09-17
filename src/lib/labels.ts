import type { PlaceKind } from "@/lib/geo/types";

// Valeurs du tag OSM `cuisine` les plus fréquentes en France. Les autres
// s'affichent telles quelles, underscores remplacés par des espaces.
const CUISINE_LABELS: Record<string, string> = {
  french: "française",
  regional: "régionale",
  italian: "italienne",
  pizza: "pizza",
  japanese: "japonaise",
  sushi: "sushi",
  ramen: "ramen",
  chinese: "chinoise",
  asian: "asiatique",
  vietnamese: "vietnamienne",
  thai: "thaïlandaise",
  korean: "coréenne",
  indian: "indienne",
  lebanese: "libanaise",
  turkish: "turque",
  greek: "grecque",
  moroccan: "marocaine",
  african: "africaine",
  mexican: "mexicaine",
  spanish: "espagnole",
  portuguese: "portugaise",
  american: "américaine",
  kebab: "kebab",
  burger: "burger",
  sandwich: "sandwichs",
  crepe: "crêpes",
  seafood: "fruits de mer",
  fish: "poisson",
  steak_house: "grillades",
  bagel: "bagels",
  coffee_shop: "café",
  tea: "salon de thé",
  ice_cream: "glaces",
  cake: "pâtisserie",
  pastry: "pâtisserie",
  breakfast: "petit-déjeuner",
  brunch: "brunch",
  salad: "salades",
  vegetarian: "végétarienne",
  vegan: "vegan",
  tacos: "tacos",
  chicken: "poulet",
  friture: "friterie",
  bubble_tea: "bubble tea",
  international: "internationale",
  european: "européenne",
  mediterranean: "méditerranéenne",
  traditional: "traditionnelle",
  local: "locale",
  corsican: "corse",
  german: "allemande",
  bavarian: "bavaroise",
  belgian: "belge",
  irish: "irlandaise",
  arab: "arabe",
  syrian: "syrienne",
  ethiopian: "éthiopienne",
  senegalese: "sénégalaise",
  argentinian: "argentine",
  brazilian: "brésilienne",
  peruvian: "péruvienne",
  georgian: "géorgienne",
  grill: "grillades",
  barbecue: "barbecue",
  pasta: "pâtes",
  poke: "poké",
  tapas: "tapas",
  couscous: "couscous",
  savory_pancakes: "galettes",
  french_tacos: "french tacos",
  fries: "frites",
  donut: "donuts",
  chocolate: "chocolat",
  juice: "jus de fruits",
  brasserie: "brasserie",
};

export function labelCuisine(tag: string): string {
  const key = tag.toLowerCase().trim();
  return CUISINE_LABELS[key] ?? key.replace(/_/g, " ");
}

export const KIND_LABELS: Record<PlaceKind, string> = {
  restaurant: "Restaurant",
  fast_food: "Restauration rapide",
  cafe: "Café",
};

/** Le tag vaut « yes » ou « only » (ex. `diet:vegetarian=only`). */
export function isYes(value: string | null): boolean {
  return value === "yes" || value === "only";
}

/** Traduction d'une valeur OSM oui/non pour la fiche détail. */
export function labelYesNo(value: string | null): string {
  switch (value) {
    case null:
      return "Non renseigné";
    case "yes":
      return "Oui";
    case "no":
      return "Non";
    case "only":
      return "Exclusivement";
    case "limited":
      return "Partiel";
    case "wlan":
      return "Wi-Fi";
    case "terminal":
      return "Borne";
    case "wired":
      return "Filaire";
    default:
      return value;
  }
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
  return `${(meters / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} km`;
}

/** Distance à vol d'oiseau (formule de haversine), en mètres. */
export function distanceInMeters(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}
