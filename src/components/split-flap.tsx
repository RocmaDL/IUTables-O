import { cn } from "cn";

const PASSING = "ABCDEFGHIJKLMNOPRSTUVZ0123456789";

/** Hachage FNV-1a : mêmes lettres de passage au rendu serveur et client. */
function hash(text: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Texte affiché en palettes à bascule, comme la ligne d'un tableau des
 * départs. Le texte réel reste lisible par les lecteurs d'écran ; les
 * cases, purement visuelles, sont masquées. Composant sans état : il sert
 * aussi bien côté serveur que dans un composant client (changer sa `key`
 * rejoue l'animation).
 */
export function SplitFlap({
  text,
  idle = false,
  className,
}: {
  text: string;
  /** Défilement continu, pour un chargement en cours. */
  idle?: boolean;
  className?: string;
}) {
  // Un mot par groupe insécable ; les noms composés se coupent après
  // chaque trait d'union (« Saint- / Rémy- / de- / Provence »).
  const words = text
    .toLocaleUpperCase("fr-FR")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.split(/(?<=-)/));

  let position = 0;

  return (
    <span className={className}>
      {!idle && <span className="sr-only">{text}</span>}
      <span
        aria-hidden
        className={cn("inline-flex flex-wrap gap-x-[0.3em] gap-y-[0.1em]", idle && "flap-idle")}
      >
        {words.map((segments, w) => (
          <span key={w} className="inline-flex flex-wrap gap-y-[0.1em]">
            {segments.map((segment, s) => (
              <span key={s} className="flap-word mr-[0.06em] last:mr-0">
                {[...segment].map((char) => {
                  const i = position++;
                  const seed = hash(text, i);
                  const passing = [0, 1, 2].map(
                    (k) => PASSING[(seed >>> (k * 6)) % PASSING.length]
                  );
                  // Décalage légèrement irrégulier, plafonné pour que les
                  // noms longs finissent en moins de 700 ms.
                  const delay = idle ? i * 70 : Math.min(i * 30, 480) + (seed % 45);
                  return (
                    <span key={i} className="flap">
                      <span
                        className="flap-strip"
                        style={{ "--flap-delay": `${delay}ms` } as React.CSSProperties}
                      >
                        {passing.map((letter, k) => (
                          <span key={k}>{letter}</span>
                        ))}
                        <span>{char}</span>
                      </span>
                    </span>
                  );
                })}
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}
