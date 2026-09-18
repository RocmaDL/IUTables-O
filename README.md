# IUTables'O

Recherche de restaurants dans n'importe quelle commune française, à partir
des données ouvertes d'OpenStreetMap. Pas de base de données ni de compte
utilisateur : chaque recherche interroge les services publics d'OSM, et le
serveur ne garde qu'un cache temporaire.

Le projet a commencé comme un exercice de l'IUT d'Orléans (PHP, PostgreSQL,
382 restaurants orléanais chargés depuis un fichier JSON). Cette version le
reconstruit en Next.js. L'ancien code est archivé dans
[`legacy-php/`](legacy-php/).

## Ce que fait le site

- **Recherche par ville.** Nominatim trouve la commune, puis
  Overpass liste les restaurants, fast-foods et cafés dans un rayon de
  500 m à 1,5 km autour du centre, triés par distance.
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
| Géocodage | [Nominatim](https://nominatim.org/) |
| Données restaurants | [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) |
| Horaires | [`opening_hours`](https://github.com/opening-hours/opening_hours.js), côté serveur uniquement |
| Carte | [MapLibre GL JS](https://maplibre.org/) et fonds [OpenFreeMap](https://openfreemap.org/) |

Aucune de ces API ne demande de clé.

## Lancer le projet

Node.js 20 ou plus récent.

```bash
npm install
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

**Plusieurs instances Overpass, avec un second essai sur surcharge.** Les
serveurs publics d'Overpass sont gratuits mais souvent saturés : pendant le
développement, on a vu passer des 429, des 504 et des connexions coupées
sur l'instance principale — parfois deux 504 de suite suivis d'une réponse
en moins de 2 secondes au troisième essai sur la même instance, preuve
qu'il s'agissait d'un pic passager plutôt que d'une panne. `src/lib/geo/overpass.ts`
retente donc une fois la même instance sur un 429, un 5xx, une connexion
coupée net ou un dépassement de délai signalé par Overpass lui-même (`remark`
dans une réponse 200), avant de passer à l'instance suivante. Trois
instances, un budget total de 42 secondes, un message clair plutôt qu'une
page d'erreur au-delà.

**Cache côté serveur.** Les résultats d'une recherche restent en cache
30 minutes, une fiche 24 heures (`unstable_cache`). Seules les réponses
complètes sont gardées : Overpass signale un dépassement de délai dans une
réponse HTTP 200 avec des résultats partiels, qui sont écartés. Le statut
« ouvert maintenant » n'est jamais mis en cache, il est recalculé à chaque
affichage.

**Fiche servie depuis la recherche.** Un lien depuis les résultats porte
`?ville=`. La fiche relit alors la recherche en cache au lieu de relancer
Overpass, et reste consultable pendant une panne de l'API.

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

Aucune variable d'environnement n'est requise (`UNSPLASH_ACCESS_KEY` dans
`.env.example` n'est utilisée par aucun code pour l'instant).

1. Importer le dépôt GitHub dans Vercel ; le framework Next.js est détecté
   automatiquement, commande de build `npm run build` (elle déclenche
   `prebuild`, qui copie MapLibre avant `next build`).
2. Nœud 20.9 ou plus récent (voir `engines` dans `package.json`).
3. Les pages `/recherche` et `/restaurant/[osmId]` déclarent
   `export const maxDuration = 60` : Nominatim (deux essais,
   8 s chacun) puis Overpass (jusqu'à 42 s) peuvent dépasser la limite par défaut d'une
   fonction (10 s sur l'offre Hobby). Vérifiez le plafond autorisé par votre
   offre Vercel si le déploiement refuse cette valeur.
4. Vérifier les déploiements de prévisualisation sur chaque pull request.

## Limites connues

- Les données dépendent des contributeurs OpenStreetMap : horaires, régime
  alimentaire ou accessibilité manquent souvent. Les filtres n'affichent que
  les adresses renseignées.
- **Limites de débit des API publiques.** Nominatim tolère
  1 requête par seconde ; largement suffisant ici (une recherche = un appel,
  mis en cache 24 h). Overpass est plus sensible : toutes les recherches du site passent
  par le serveur, jamais par le navigateur du visiteur, donc c'est une seule
  adresse IP (celle du serveur, pas celle de chaque visiteur) qui envoie
  toutes les requêtes vers ses instances publiques. Un usage normal
  (recherches espacées) reste sous leur seuil de tolérance ; des tests
  répétés en rafale depuis la même adresse peuvent déclencher un 429 qui
  n'apparaîtrait pas en usage réel.
- **Villes très denses.** Sur un rayon au maximum (1,5 km) dans un centre
  très dense (Marseille, Nice…), le calcul Overpass dépasse parfois le
  budget même sans limite de débit : mesuré en frappant Overpass
  directement, deux 504 de suite puis un succès en moins de 2 secondes au
  troisième essai sur la même instance.
- Quand toutes les instances Overpass sont indisponibles, une nouvelle
  recherche échoue. Les recherches déjà en cache restent accessibles ; le
  bouton « Relancer la recherche » couvre justement ce cas.
- Une adresse inconnue renvoie la page 404 du site, mais avec un code HTTP
  200 : l'écran de chargement a déjà envoyé les en-têtes. Next.js ajoute
  `noindex` sur cette page.

## Données et licences

Données restaurants © contributeurs OpenStreetMap, sous licence
[ODbL](https://www.openstreetmap.org/copyright). Fonds de carte
OpenFreeMap © OpenMapTiles.
