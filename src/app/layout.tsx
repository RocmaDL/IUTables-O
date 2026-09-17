import type { Metadata, Viewport } from "next";
import { Sofia_Sans, Sofia_Sans_Condensed } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

// Sofia Sans pour la prose et les contrôles, sa version condensée pour
// tout ce qui s'affiche « au tableau » : noms, titres, horaires, distances.
const sofiaSans = Sofia_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const sofiaSansCondensed = Sofia_Sans_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://iutableso.vercel.app"),
  title: {
    default: "IUTables'O — trouver un resto, où que vous soyez en France",
    template: "%s — IUTables'O",
  },
  description:
    "IUTables'O recense les restaurants de toutes les villes de France : cuisine, régime alimentaire, accessibilité PMR, horaires. Cherchez une ville, trouvez une table.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "IUTables'O",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1430",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`dark ${sofiaSans.variable} ${sofiaSansCondensed.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <a
          href="#contenu"
          className="sr-only rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Aller au contenu
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
