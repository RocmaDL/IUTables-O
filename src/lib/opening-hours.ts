import "server-only";
import opening_hours from "opening_hours";
import type { OpeningStatus } from "@/lib/geo/types";

const TIME_ZONE = "Europe/Paris";
const DAY_MS = 24 * 60 * 60 * 1000;
/** En deçà, un établissement ouvert s'affiche « ferme bientôt ». */
const CLOSING_SOON_MS = 45 * 60 * 1000;
const WEEKDAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

/**
 * `opening_hours` lit les champs locaux d'un `Date` (getHours, getDay…).
 * Le serveur tourne en UTC sur Vercel : on fabrique un `Date` dont les
 * champs locaux valent l'heure affichée à Paris au même instant.
 */
export function parisWallClock(instant = new Date()): Date {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(instant)
      .map((part) => [part.type, part.value])
  );
  return new Date(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
}

function parse(value: string, lat: number, lon: number): opening_hours | null {
  try {
    // Le pays suffit pour les jours fériés nationaux (PH) ; mode 0 = plages
    // horaires, le cas des restaurants.
    return new opening_hours(value, { lat, lon, address: { country_code: "fr", state: "" } }, 0);
  } catch {
    // Valeur saisie à la main hors syntaxe OSM : on affichera le texte brut.
    return null;
  }
}

/** « 12 h », « 14 h 30 » ; minuit en fin de plage s'écrit « 24 h ». */
function formatTime(date: Date, isEnd = false): string {
  const hours = isEnd && date.getHours() === 0 && date.getMinutes() === 0 ? 24 : date.getHours();
  const minutes = date.getMinutes();
  return minutes === 0 ? `${hours} h` : `${hours} h ${String(minutes).padStart(2, "0")}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function describeMoment(target: Date, now: Date): string {
  // Un changement à 0 h se lit « à minuit » le jour d'avant : « ferme
  // vendredi à minuit » plutôt que « ferme samedi à 0 h ».
  const isMidnight = target.getHours() === 0 && target.getMinutes() === 0;
  const day = isMidnight ? new Date(target.getTime() - 1) : target;
  const days = Math.round((startOfDay(day).getTime() - startOfDay(now).getTime()) / DAY_MS);
  const time = isMidnight ? "minuit" : formatTime(target);
  if (days === 0) return isMidnight ? "à minuit" : `à ${time}`;
  if (days === 1) return `demain à ${time}`;
  return `${WEEKDAYS[day.getDay()]} à ${time}`;
}

/** Statut à l'instant `now` (heure de Paris, voir `parisWallClock`). */
export function getOpeningStatus(
  value: string,
  lat: number,
  lon: number,
  now: Date
): OpeningStatus {
  const oh = parse(value, lat, lon);
  if (!oh) return { state: "unknown", detail: null };

  if (oh.getUnknown(now)) {
    return { state: "unknown", detail: oh.getComment(now) ?? null };
  }

  const isOpen = oh.getState(now);
  const nextChange = oh.getNextChange(now, new Date(now.getTime() + 7 * DAY_MS));

  if (isOpen) {
    return {
      state: "open",
      soon: nextChange !== undefined && nextChange.getTime() - now.getTime() <= CLOSING_SOON_MS,
      detail: nextChange ? `ferme ${describeMoment(nextChange, now)}` : "24 h/24",
    };
  }
  return {
    state: "closed",
    detail: nextChange ? `ouvre ${describeMoment(nextChange, now)}` : null,
  };
}

export type DaySchedule = {
  label: string;
  isToday: boolean;
  /** Plages d'ouverture formatées, ex. « 12 h – 14 h ». Vide = fermé. */
  ranges: string[];
  /** Commentaire OSM quand l'ouverture est incertaine (« sur réservation »). */
  note: string | null;
};

/**
 * Horaires de la semaine en cours, du lundi au dimanche, jours fériés
 * compris. `null` si la valeur ne suit pas la syntaxe OSM.
 */
export function getWeekSchedule(
  value: string,
  lat: number,
  lon: number,
  now: Date
): DaySchedule[] | null {
  const oh = parse(value, lat, lon);
  if (!oh) return null;

  const today = startOfDay(now);
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  return Array.from({ length: 7 }, (_, index) => {
    const dayStart = new Date(monday);
    dayStart.setDate(monday.getDate() + index);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const intervals = oh.getOpenIntervals(dayStart, dayEnd);
    const ranges = intervals
      .filter(([, , unknown]) => !unknown)
      .map(([from, to]) => `${formatTime(from)} – ${formatTime(to, true)}`);
    const note = intervals.find(([, , unknown, comment]) => unknown && comment)?.[3] ?? null;

    return {
      label: WEEKDAYS[dayStart.getDay()],
      isToday: dayStart.getTime() === today.getTime(),
      ranges: ranges.length === 1 && ranges[0] === "0 h – 24 h" ? ["24 h/24"] : ranges,
      note,
    };
  });
}
