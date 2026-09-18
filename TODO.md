# TODO — LesTables nouvelle version

Projet vitrine (portfolio) : recherche de restaurants sur toute la France,
sans compte utilisateur ni backend applicatif. Next.js + shadcn/ui + Tailwind,
données live via des API publiques gratuites, déploiement Vercel.

## Décisions actées

- **Pas de base de données, pas de compte utilisateur.** Toute donnée
  restaurant vient en direct d'API publiques à chaque recherche — rien n'est
  stocké. Le schéma Supabase créé pendant une itération précédente a été
  supprimé (`DROP SCHEMA iutableso`) : aucune trace ne reste dans le projet
  Supabase (qui héberge par ailleurs le portfolio personnel, non affecté).
- **Portée nationale.** Recherche par ville plutôt qu'un dataset statique
  limité à Orléans : géocodage et résultats via Geoapify depuis le
  18/09/2026 (clé gratuite, 3000 crédits/jour ; remplace Nominatim et
  Overpass, saturés et lents en usage réel).
- **shadcn/ui + Tailwind CSS v4**, direction artistique « tableau des
  départs » depuis le 17/09/2026 : fond bleu nuit, jaune d'afficheur,
  nom de ville en palettes à bascule, Sofia Sans + Sofia Sans Condensed.
  Remplace la palette brique/vert sur crème et Fraunces/Work Sans. Faits
  produit dans `PRODUCT.md`, contrat de direction dans
  `.impeccable/surfaces/src-app-page-tsx.md`.
- **Pas de photos** (décision du 17/09/2026) : l'identité repose sur la
  carte, la typographie et les données OSM. La piste Unsplash plus bas
  n'est plus prioritaire.
- **Sécurité :** la clé `service_role` Supabase compromise sur l'ancien
  dépôt (voir mémoire `leaked_supabase_key`) reste à régénérer même si ce
  projet ne l'utilise plus — elle protège le projet portfolio existant.

## Fait

- [x] Ancien code PHP archivé dans `legacy-php/`
- [x] Scaffold Next.js 16 (App Router, TypeScript, Tailwind v4, src/)
- [x] shadcn/ui initialisé manuellement (`components.json`), composants de
      base installés (button, card, input, badge, dialog, sheet, avatar,
      skeleton, dropdown-menu, label, textarea, select, tabs...)
- [x] Palette et typographie personnalisées dans `globals.css` + `layout.tsx`
- [x] `next.config.ts` : `images.remotePatterns` pour Unsplash
- [x] Géocodage Nominatim (`src/lib/geo/nominatim.ts`) et recherche
      Overpass (`src/lib/geo/overpass.ts`)

### Session du 17 septembre 2026

- [x] Build réparé : `class-variance-authority`, `lucide-react` et
      `tw-animate-css` manquaient (`cn` est bien le paquet officiel shadcn)
- [x] Page d'accueil : label caché, focus visible, lien « Aller au contenu »
- [x] Page résultats en liste éditoriale plutôt qu'en grille de cartes :
      rayon autour du centre (500 m à 1,5 km), 400 adresses max, tri par
      distance, pagination par 24
- [x] Cas limites : ville introuvable, zone vide, Nominatim ou Overpass
      indisponible (message dédié + bouton pour relancer)
- [x] Overpass : bascule entre 3 instances publiques, nouvel essai sur
      connexion coupée, budget de 30 s, cache 30 min (fiche : 24 h) qui ne
      garde que les réponses complètes
- [x] Filtres côté client : type, cuisine, ouvert maintenant, végétarien,
      vegan, fauteuil roulant, à emporter
- [x] Statut « ouvert maintenant » et horaires de la semaine
      (`opening_hours`, côté serveur, heure de Paris)
- [x] Page détail `/restaurant/[osmId]` (`n123`, `w456`, `r789`) avec carte
      MapLibre + OpenFreeMap. La fiche reprend la recherche en cache quand
      on vient des résultats
- [x] MapLibre 6 servi depuis `public/vendor/` (worker cassé par Turbopack
      sinon ; la v5 est exclue, faille XSS GHSA-jrc7-96c5-q579)
- [x] `generateMetadata` sur recherche (noindex) et fiche
- [x] Pages `not-found.tsx` et `error.tsx`
- [x] Contrastes vérifiés (jeton `--status-open` ajouté), cibles tactiles
      de 44 px, pages recherche, fiche et 404 testées à 390 px de large
- [x] README réécrit, page à-propos corrigée (mention du cache)
- [x] `.gitignore` : `.env.example` n'était plus versionné, `public/vendor/`
      ignoré

### Session du 17 septembre 2026 (suite) — refonte visuelle et robustesse

- [x] Refonte « tableau des départs » (voir DESIGN.md et
      `.impeccable/surfaces/`), skill Impeccable, revue indépendante
- [x] Défilement infini (IntersectionObserver) à la place du bouton
      « Afficher plus » dans la liste de résultats
- [x] Overpass : nouvel essai sur 429/5xx/remarque de dépassement (pas
      seulement une connexion coupée), délai relevé à 25 s par requête,
      budget total 42 s, 4ᵉ instance ajoutée (`overpass.osm.ch`)
- [x] `maxDuration = 60` sur `/recherche` et `/restaurant/[osmId]`
      (limite d'exécution des fonctions Vercel)
- [x] Essai de remplacement de Nominatim par la Base Adresse Nationale
      (plus rapide, aucune clé), abandonné : son point pour une commune
      est celui de la mairie, parfois à 1-3 km du centre historique —
      256 → 31 résultats sur Orléans avec le même rayon. Détail dans
      PRODUCT.md, section Capabilities and Constraints
- [x] Retour de tests utilisateurs : site pas identifié comme un
      outil de recherche de restaurants (manque de vocabulaire/icônes) —
      favicon et `src/lib/kind-icons.ts` (icônes sur l'accueil/filtres/
      résultats/fiche) ne suffisaient pas : un nouveau test a confirmé le
      même problème. Deux critiques dual-agent (`.impeccable/critique/`,
      18/09/2026, 18/28 puis 21/28) ont isolé la cause : l'esthétique
      « tableau de gare » de l'accueil (horloge, case voie, liste de
      villes tabulaire) primait sur le signal restaurant. Corrigé :
      horloge et case voie retirées de l'accueil (gardées sur
      recherche/fiche, où elles ont un sens réel), icône Sandwich →
      Hamburger, liste de villes en nuage de puces sans numéro visible

### Session du 18 septembre 2026 — migration Geoapify

- [x] Nominatim et Overpass remplacés par Geoapify (`GEOAPIFY_API_KEY`,
      3000 crédits/jour gratuits, sans carte) : `src/lib/geo/geoapify.ts`
      couvre géocodage, recherche par rayon et fiche par identifiant OSM
      direct (`/v2/place-details`). Vérifié en direct : mêmes coordonnées
      et même emprise que Nominatim sur Orléans, tous les tags OSM utiles
      présents (`opening_hours`, `wheelchair`, `diet:vegetarian`,
      `diet:vegan`, `takeaway`, `delivery`, `internet_access`)
- [x] `src/lib/geo/departments.ts` : reformule « Ville 93 » en
      « Ville, Nom-du-département » — Geoapify lit sinon ce format comme
      une adresse postale et peut renvoyer une tout autre commune (testé :
      Saint-Denis 93 tombait sur La Réunion sans cette reformulation)
- [x] Marseille et Nice (cas les plus denses, en échec fréquent avec
      Overpass) répondent en 4-5 s à froid avec Geoapify, testé trois fois
      de suite avec succès
- [x] Attribution Geoapify ajoutée (pied de page, page à-propos), requise
      par son offre gratuite

## À faire

### Outillage (à faire à la main)

- [ ] Ajouter `"public/vendor/**"` et `"legacy-php/**"` aux `globalIgnores`
      de `eslint.config.mjs` : sans ça, `npm run lint` remonte 2 328
      avertissements venant des copies MapLibre et de l'archive PHP (0
      erreur). Modification bloquée pour l'agent par le hook
      `config-protection`

### Recherche et affichage

- [ ] Carte de tous les résultats sur la page de recherche (optionnel)
- [ ] Garder les filtres dans l'URL pour partager une recherche filtrée
      (optionnel)
- [ ] Code HTTP 404 réel pour une fiche inconnue : aujourd'hui 200 +
      `noindex`, à cause du streaming de `loading.tsx`

### API gratuite « vraie valeur »

- [ ] Intégration Unsplash pour une photo de couverture par type de cuisine
      (clé `UNSPLASH_ACCESS_KEY` à créer sur unsplash.com/developers,
      gratuite ; vide dans `.env.local` au 17/09/2026)
- [ ] Fallback propre si aucune photo ne correspond (jamais de boîte grise
      à dégradé — cf. règles anti-slop)

### Déploiement Vercel

- [ ] Connecter le dépôt GitHub à Vercel
- [ ] Variable d'environnement `UNSPLASH_ACCESS_KEY` dans le dashboard
      Vercel (jamais committée)
- [ ] Vérifier les preview deployments sur chaque pull request
- [ ] Vérifier en production que le cache `unstable_cache` persiste entre
      deux requêtes (Data Cache Vercel)

## Stack retenue

| Aujourd'hui (archivé) | Nouvelle version |
|---|---|
| PHP procédural + autoloader maison | Next.js 16 (App Router, TypeScript) |
| PDO direct vers PostgreSQL | Aucune base — données live via API publiques |
| Session PHP + mdp en clair | Aucun compte utilisateur |
| HTML statique + JS inline | Composants React + Tailwind CSS v4 |
| Bootstrap 5 générique | shadcn/ui personnalisé |
| Dataset statique Orléans (382 restaurants) | Recherche nationale live (Geoapify) |
| Hébergement manuel | Vercel |
| Carte Leaflet | MapLibre GL JS + OpenFreeMap |
| — | API Unsplash (photos), pas encore branchée |
