export type OsmType = "node" | "way" | "relation";

export type PlaceKind = "restaurant" | "fast_food" | "cafe";

export type LiveRestaurant = {
  /** Identifiant court utilisé dans les URL : `n123`, `w456` ou `r789`. */
  osmId: string;
  osmType: OsmType;
  name: string;
  kind: PlaceKind;
  lat: number;
  lon: number;
  cuisine: string[];
  vegetarian: string | null;
  vegan: string | null;
  wheelchair: string | null;
  openingHours: string | null;
  delivery: string | null;
  takeaway: string | null;
  outdoorSeating: string | null;
  internetAccess: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  postcode: string | null;
  city: string | null;
};

export type GeocodedPlace = {
  displayName: string;
  city: string;
  lat: number;
  lon: number;
  boundingBox: { south: number; north: number; west: number; east: number };
};

/** Statut d'ouverture calculé côté serveur au moment de la requête. */
export type OpeningStatus = {
  state: "open" | "closed" | "unknown";
  /** Ex. « ferme à 14:00 », « ouvre demain à 12:00 ». */
  detail: string | null;
  /** Ouvert, mais ferme dans moins de 45 minutes. */
  soon?: boolean;
};

/** Restaurant tel qu'envoyé à la page de résultats. */
export type RestaurantSummary = LiveRestaurant & {
  /** Distance au centre de la ville recherchée, en mètres. */
  distance: number;
  status: OpeningStatus | null;
};
