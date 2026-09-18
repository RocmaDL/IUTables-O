import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
        <p>
          Données restaurants ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer noopener"
            className="text-foreground underline decoration-input hover:decoration-primary"
          >
            contributeurs OpenStreetMap
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
          , licence ODbL. Propulsé par{" "}
          <a
            href="https://www.geoapify.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="text-foreground underline decoration-input hover:decoration-primary"
          >
            Geoapify
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
          .
        </p>
        <Link
          href="/a-propos"
          className="self-start text-foreground underline decoration-input hover:decoration-primary md:self-auto"
        >
          D&rsquo;où viennent les données
        </Link>
      </div>
    </footer>
  );
}
