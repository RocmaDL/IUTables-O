import { ArrowRight } from "lucide-react";
import { cn } from "cn";

export function CitySearchForm({
  id = "ville-recherche",
  defaultValue,
  placeholder = "Une autre ville…",
  size = "md",
  showLabel = false,
  className,
}: {
  id?: string;
  defaultValue?: string;
  placeholder?: string;
  /** `lg` : ligne de saisie de l'accueil ; `md` : en-tête des pages. */
  size?: "md" | "lg";
  showLabel?: boolean;
  className?: string;
}) {
  const large = size === "lg";

  return (
    <form
      action="/recherche"
      role="search"
      className={cn("w-full", large ? "max-w-xl" : "max-w-sm", className)}
    >
      <label
        htmlFor={id}
        className={showLabel ? "mb-1 block text-sm text-muted-foreground" : "sr-only"}
      >
        Ville
      </label>
      {/* Indicateur de focus : le soulignement passe au jaune (12,6:1) ; sur
          l'accueil, déjà jaune, il double d'épaisseur. */}
      <div
        className={cn(
          "flex items-end gap-3 border-b-2 transition-[border-color,box-shadow] duration-200",
          large
            ? "border-primary pb-3 focus-within:shadow-[0_2px_0_0_var(--primary)]"
            : "border-input pb-1.5 hover:border-muted-foreground focus-within:border-primary focus-within:hover:border-primary md:pb-2"
        )}
      >
        <input
          id={id}
          type="search"
          name="ville"
          defaultValue={defaultValue}
          placeholder={placeholder}
          required
          minLength={2}
          autoComplete="off"
          enterKeyHint="search"
          className={cn(
            "w-full min-w-0 bg-transparent font-display font-semibold tracking-[-0.01em] text-foreground focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden",
            large ? "text-3xl sm:text-4xl md:text-5xl" : "text-xl md:text-2xl"
          )}
        />
        <button
          type="submit"
          aria-label="Chercher"
          className={cn(
            "grid shrink-0 place-items-center rounded-md bg-primary text-primary-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-[#ffe07a] active:translate-y-px",
            large ? "size-14" : "size-11"
          )}
        >
          <ArrowRight className={large ? "size-6" : "size-5"} strokeWidth={2.5} aria-hidden />
        </button>
      </div>
    </form>
  );
}
