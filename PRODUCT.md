# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Deux publics, avec une priorité claire :

1. **Quelqu'un qui cherche une table** dans une commune française, souvent
   sur mobile, parfois dans une ville qu'il ne connaît pas. Il veut savoir
   vite ce qui est proche, ouvert maintenant, compatible avec son régime ou
   accessible en fauteuil roulant. C'est l'usage qui décide.
2. **Un recruteur ou un visiteur du portfolio** de l'auteur. Il passe
   quelques minutes, teste une ville, et doit percevoir le soin apporté à
   l'interface et aux cas limites. Il ne doit jamais être servi au détriment
   du premier public.

## Product Purpose

Trouver un restaurant, un fast-food ou un café autour du centre de
n'importe quelle commune française, à partir des données ouvertes
d'OpenStreetMap, sans compte ni base de données. Réussite : une ville
saisie, une adresse choisie, avec horaires et accès, en quelques secondes.

## Positioning

Tout vient d'OpenStreetMap en direct : couverture nationale, aucune donnée
maison, aucun avis ni classement sponsorisé. Le site montre ce que les
contributeurs bénévoles ont saisi, dit clairement quand une information
manque, et renvoie vers la fiche OSM pour la corriger.

## Operating Context

- Recherche par nom de commune (Nominatim), puis liste des établissements
  dans un rayon de 500 m à 1,5 km autour du centre (Overpass), triés par
  distance, 400 adresses au plus, affichées par 24.
- Filtres côté client sur les résultats chargés : type d'adresse, cuisine,
  ouvert maintenant, végétarien, vegan, accès fauteuil roulant, à emporter.
- Fiche détaillée : adresse et itinéraire, contact, horaires de la semaine
  (heure de Paris, jours fériés compris), services sur place, carte
  MapLibre + OpenFreeMap, lien vers OSM.
- Les API publiques sont parfois saturées : attentes de plusieurs secondes,
  pannes temporaires. Les états de chargement et d'erreur font partie de
  l'expérience normale, pas d'un cas rare.

## Capabilities and Constraints

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4,
  composants shadcn/ui, icônes Lucide. Déploiement prévu sur Vercel.
- Aucune base de données, aucun compte, aucun avis, aucun favori persistant.
  Décision de l'auteur, à ne pas remettre en cause.
- Données incomplètes par nature : horaires, régime, accessibilité et
  adresse manquent souvent. L'interface doit rendre l'absence lisible sans
  la maquiller.
- Pas de photos : Unsplash n'est pas branché, et l'identité visuelle ne
  s'appuie pas sur la photographie (décision du 17/09/2026).
- Géocodage : Nominatim reste la source, malgré sa fiabilité inférieure à
  la Base Adresse Nationale (BAN) de l'État. Testée puis abandonnée le
  17/09/2026 : le point que la BAN renvoie pour une commune est celui de sa
  mairie, parfois à 1-3 km du centre historique/commercial — sur Orléans,
  ça fait tomber les résultats de 256 à 31 sur le même rayon. Le nœud
  Nominatim, placé à la main par les contributeurs OSM, reste mieux choisi
  pour « trouver ce qui est proche du centre ». Ne pas re-basculer sans
  revérifier ce point précis.
- MapLibre servi depuis `public/vendor/` (voir README).
- Attribution OpenStreetMap (licence ODbL) obligatoire.

## Brand Commitments

- Nom : IUTables'O (clin d'œil à l'IUT d'Orléans, origine scolaire du
  projet).
- Interface entièrement en français, ton direct et concret.
- La palette brique/vert sur fond crème et le couple Fraunces/Work Sans de
  la version précédente ne sont plus des engagements : l'auteur a demandé
  un nouvel univers visuel le 17/09/2026.

## Evidence on Hand

- Données réelles et vivantes : n'importe quelle commune, via OSM.
- Origine : exercice de l'IUT d'Orléans (PHP, 382 restaurants orléanais),
  archivé dans `legacy-php/`.
- Aucun témoignage, chiffre d'usage, client ou classement. Ne jamais en
  inventer.

## Product Principles

1. **La recherche d'abord.** Rien ne s'interpose entre la saisie d'une ville
   et les résultats, ni entre les résultats et les filtres.
2. **Montrer la donnée telle qu'elle est.** Une information absente est
   dite absente ; jamais de valeur devinée.
3. **Le caractère sans le gabarit.** Le soin se voit dans la composition et
   les détails propres à ce produit, pas dans un habillage de template.
4. **Honnête sur la source.** OpenStreetMap et ses contributeurs sont
   crédités et l'on peut corriger une fiche en un clic.

## Accessibility & Inclusion

- Le filtre « accès fauteuil roulant » est une fonction du produit : les
  pages elles-mêmes doivent tenir WCAG 2.2 AA (contrastes, clavier, focus
  visible, cibles tactiles de 44 px).
- Usage mobile fréquent : pages testées à 390 px de large.
