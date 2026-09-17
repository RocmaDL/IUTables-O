import { CircleCheck, CircleDashed, CircleHelp, CircleMinus, Clock3 } from "lucide-react";
import { cn } from "cn";
import type { OpeningStatus } from "@/lib/geo/types";

export type StatusTone = "open" | "soon" | "closed" | "unknown" | "missing";

// Chaque état a son libellé et sa forme d'icône : la couleur n'est jamais
// le seul indice.
export const STATUS_APPEARANCE: Record<
  StatusTone,
  { label: string; Icon: typeof CircleCheck; className: string }
> = {
  open: { label: "Ouvert", Icon: CircleCheck, className: "font-semibold text-status-open" },
  soon: { label: "Ferme bientôt", Icon: Clock3, className: "font-semibold text-status-soon" },
  closed: { label: "Fermé", Icon: CircleMinus, className: "font-semibold text-status-closed" },
  unknown: { label: "Horaires incertains", Icon: CircleHelp, className: "text-muted-foreground" },
  missing: { label: "Horaires non renseignés", Icon: CircleDashed, className: "text-slack" },
};

export function toneOf(status: OpeningStatus | null): StatusTone {
  if (!status) return "missing";
  if (status.state === "open") return status.soon ? "soon" : "open";
  return status.state;
}

export function StatusMark({
  tone,
  className,
  iconClassName,
}: {
  tone: StatusTone;
  className?: string;
  iconClassName?: string;
}) {
  const { label, Icon, className: toneClass } = STATUS_APPEARANCE[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5", toneClass, className)}>
      <Icon className={cn("size-4 shrink-0", iconClassName)} strokeWidth={2.25} aria-hidden />
      {label}
    </span>
  );
}

/**
 * Statut d'ouverture et précision (« ferme à 14 h »), en ligne, empilés,
 * ou en ligne sur mobile puis empilés à partir de `md`.
 */
export function OpeningStatusLine({
  status,
  stacked = false,
  className,
}: {
  status: OpeningStatus | null;
  stacked?: boolean | "md";
  className?: string;
}) {
  const tone = toneOf(status);
  const detail = status?.detail;

  return (
    <p
      className={cn(
        "text-sm",
        stacked === true && "flex flex-col gap-0.5",
        // En ligne, l'espace du « · » suffit : pas d'écart supplémentaire.
        stacked === false && "flex flex-wrap items-center gap-x-1",
        stacked === "md" &&
          "flex flex-wrap items-center gap-x-1 md:flex-col md:items-start md:gap-0.5",
        className
      )}
    >
      <StatusMark tone={tone} />
      {detail && (
        <span
          className={cn(
            "text-muted-foreground",
            stacked === true && "pl-[1.375rem]",
            stacked === "md" && "md:pl-[1.375rem]"
          )}
        >
          {stacked !== true && (
            <span aria-hidden className={cn(stacked === "md" && "md:hidden")}>
              ·{" "}
            </span>
          )}
          {detail}
        </span>
      )}
    </p>
  );
}
