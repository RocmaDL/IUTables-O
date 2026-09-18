# IUTables'O

Recherche de restaurants dans n'importe quelle commune française, à partir
des données ouvertes d'OpenStreetMap. Pas de base de données ni de compte
utilisateur : chaque recherche interroge Geoapify (qui sert OpenStreetMap
en direct) en temps réel, et le serveur ne garde qu'un cache temporaire.

Le projet a commencé comme un exercice de l'IUT d'Orléans (PHP, PostgreSQL,
382 restaurants orléanais chargés depuis un fichier JSON). Cette version le
reconstruit en Next.js. L'ancien code est archivé dans
[`legacy-php/`](legacy-php/).

## Ce que fait le site

- **Recherche par ville.** Geoapify trouve la commune, puis liste les
  restaurants, fast-foods et cafés dans un rayon de 500 m à 1,5 km autour
  du centre, triés par distance.
- **Filtres** sur les résultats déjà chargés : type d'adresse, cuisine,
  ouvert maintenant, végétarien, vegan, accès fauteuil roulant, à emporter.
- **Statut d'ouverture** calculé à chaque requête depuis le tag
  `opening_hours`, à l'heure de Paris, jours fériés compris.
- **Fiche détaillée** : horaires de la semaine, contact, services, carte, et
  lien vers la fiche OpenStreetMap pour corriger une information.

## Stack

| Rôle | Choix |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Interface | Tailwind CSS v4, composants shadcn/ui retouchés, icônes Lucide |
| Typographie | Sofia Sans Condensed (tableau, titres), Sofia Sans (texte) |
| Géocodage et restaurants | [Geoapify](https://www.geoapify.com/) (Places + Geocoding API, sert OpenStreetMap) |
| Horaires | [`opening_hours`](https://github.com/opening-hours/opening_hours.js), côté serveur uniquement |
| Carte | [MapLibre GL JS](https://maplibre.org/) et fonds [OpenFreeMap](https://openfreemap.org/) |

Geoapify demande une clé gratuite (`GEOAPIFY_API_KEY`, voir plus bas) ;
aucune autre de ces API n'en demande.

## Lancer le projet

Node.js 20 ou plus récent, une clé Geoapify gratuite (créée sans carte sur
[myprojects.geoapify.com](https://myprojects.geoapify.com/), 3000 crédits/jour).

```bash
npm install
cp .env.example .env.local   # puis coller la clé dans GEOAPIFY_API_KEY
npm run dev      # http://localhost:3000
```

Autres commandes :

```bash
npm run build    # build de production
npm run start    # sert le build
npm run lint
```

`npm run dev` et `npm run build` copient d'abord MapLibre dans
`public/vendor/` (voir plus bas). Ce dossier est ignoré par git.

## Choix techniques

**Geoapify pour le géocodage et la recherche, avec un second essai sur
surcharge.** `src/lib/geo/geoapify.ts` interroge Geoapify (infrastructure
dédiée, 3000 crédits/jour gratuits) pour retrouver une commune et pour
lister les restaurants autour. Un 5xx ou un 429 déclenche un second essai
avant d'abandonner. Avant Geoapify, le site utilisait Nominatim et jusqu'à
quatre instances Overpass publiques, partagées et parfois saturées
(504, 429, connexions coupées, mesuré en direct pendant le développement) :
Marseille et Nice, les cas les plus denses, échouaient par intermittence à
plus de 40 secondes ; avec Geoapify, les deux répondent en 4-5 secondes à
froid.

**Recherche par identifiant OSM direct.** La fiche d'un établissement
(`/restaurant/n123`) peut être ouverte sans passer par une recherche de
ville : Geoapify sait retrouver un nœud, une way ou une relation OSM par
son identifiant (`osm_id` + `osm_type`), sans clé de recherche préalable.

**Cache côté serveur.** Les résultats d'une recherche restent en cache
30 minutes, une fiche 24 heures (`unstable_cache`). Seules les réponses
complètes sont gardées : une erreur levée n'est jamais mise en cache. Le
statut « ouvert maintenant » n'est jamais mis en cache non plus, il est
recalculé à chaque affichage.

**Fiche servie depuis la recherche.** Un lien depuis les résultats porte
`?ville=`. La fiche relit alors la recherche en cache au lieu de relancer
Geoapify, et reste consultable pendant une panne de l'API.

**« Ville 93 » reformulé pour le géocodeur.** Nominatim comprenait
nativement une commune suivie de son département ; le géocodeur Geoapify
lit ça comme une adresse postale (« 93 rue Ville ») et peut renvoyer une
tout autre commune. `src/lib/geo/departments.ts` reformule la requête en
« Ville, Nom-du-département » avant l'appel (table figée des 101
départements, source geo.api.gouv.fr).

**Rayon et plafond.** Une commune entière peut compter des milliers
d'établissements (plus de 14 000 pour Paris lors d'un comptage en septembre
2026). La recherche se limite donc à un rayon autour du centre et à 400
adresses, et la page le dit.

**MapLibre servi depuis `public/`.** Depuis la version 6, MapLibre lance son
Web Worker à partir de fichiers voisins. Turbopack les renomme avec un hash
et le worker ne trouve plus ses imports : la carte reste noire, sans erreur
en console. `scripts/copy-maplibre.mjs` copie ces fichiers dans un dossier
versionné, servi avec un cache long, et la carte les importe directement.

## Déploiement sur Vercel

`GEOAPIFY_API_KEY` est requise (voir `.env.example`) : sans elle,
`/recherche` échoue systématiquement. `UNSPLASH_ACCESS_KEY` n'est utilisée
par aucun code pour l'instant.

1. Importer le dépôt GitHub dans Vercel ; le framework Next.js est détecté
   automatiquement, commande de build `npm run build` (elle déclenche
   `prebuild`, qui copie MapLibre avant `next build`).
2. Ajouter `GEOAPIFY_API_KEY` dans les variables d'environnement du projet
   Vercel (jamais commitée).
3. Nœud 20.9 ou plus récent (voir `engines` dans `package.json`).
4. Les pages `/recherche` et `/restaurant/[osmId]` déclarent
   `export const maxDuration = 60` : Geoapify peut dépasser la limite par
   défaut d'une fonction (10 s sur l'offre Hobby). Vérifiez le plafond
   autorisé par votre offre Vercel si le déploiement refuse cette valeur.
5. Vérifier les déploiements de prévisualisation sur chaque pull request.

## Limites connues

- Les données dépendent des contributeurs OpenStreetMap : horaires, régime
  alimentaire ou accessibilité manquent souvent. Les filtres n'affichent que
  les adresses renseignées.
- **Quota Geoapify.** 3000 crédits gratuits par jour et par clé ; une
  recherche coûte entre 1 et 20 crédits selon la densité de la ville, plus
  1 crédit de géocodage (le cache de 30 minutes évite de repayer une
  recherche répétée). Largement suffisant pour un site vitrine ; au-delà,
  Geoapify propose des paliers payants. Toutes les recherches du site
  passent par le serveur, jamais par le navigateur du visiteur : c'est la
  clé du projet qui est comptée, pas chaque visiteur séparément.
- **Villes très denses.** Marseille et Nice, les cas les plus difficiles
  avec l'ancienne infrastructure (Overpass public), répondent maintenant en
  4-5 secondes à froid avec Geoapify (mesuré en direct, trois essais
  consécutifs réussis). Un ralentissement ou une panne ponctuelle du
  service reste possible.
- Quand Geoapify est indisponible, une nouvelle recherche échoue. Les
  recherches déjà en cache restent accessibles ; le bouton « Relancer la
  recherche » couvre justement ce cas.
- Une adresse inconnue renvoie la page 404 du site, mais avec un code HTTP
  200 : l'écran de chargement a déjà envoyé les en-têtes. Next.js ajoute
  `noindex` sur cette page.

## Données et licences

Données restaurants © contributeurs OpenStreetMap, sous licence
[ODbL](https://www.openstreetmap.org/copyright). Fonds de carte
OpenFreeMap © OpenMapTiles. Géocodage et recherche propulsés par
[Geoapify](https://www.geoapify.com/), requis par son offre gratuite.
