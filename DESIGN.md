---
name: IUTables'O
description: Les restaurants autour du centre de n'importe quelle commune française, lus comme un tableau des départs.
colors:
  nuit-afficheur: "#0a1430"
  nuit-ligne-alternee: "#0e1a3b"
  nuit-panneau: "#0f1c40"
  nuit-survol: "#16274f"
  filet: "#22345e"
  filet-champ: "#6072a0"
  gris-non-renseigne: "#8391b3"
  bleu-gris-meta: "#a7b3cf"
  blanc-afficheur: "#eef2fa"
  jaune-afficheur: "#ffd23f"
  jaune-afficheur-survol: "#ffe07a"
  statut-ouvert: "#74e3a6"
  statut-bientot: "#ffb35c"
  statut-ferme: "#ff9585"
  palette-haut: "#1a2b5e"
  palette-bas: "#121f47"
  palette-charniere: "#040918"
typography:
  display:
    fontFamily: "Sofia Sans Condensed, Sofia Sans, sans-serif"
    fontSize: "clamp(3rem, 7.4vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Sofia Sans Condensed, Sofia Sans, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 4.75rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Sofia Sans Condensed, Sofia Sans, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
  board-figure:
    fontFamily: "Sofia Sans Condensed, Sofia Sans, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "\"tnum\""
  body:
    fontFamily: "Sofia Sans, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  body-sm:
    fontFamily: "Sofia Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.375
  label:
    fontFamily: "Sofia Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.14em"
rounded:
  sm: "2px"
  md: "3px"
  lg: "4px"
spacing:
  row-y: "14px"
  row-y-desktop: "16px"
  gutter: "16px"
  gutter-desktop: "32px"
  column-gap: "64px"
components:
  button-primary:
    backgroundColor: "{colors.jaune-afficheur}"
    textColor: "{colors.nuit-afficheur}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.jaune-afficheur-survol}"
    textColor: "{colors.nuit-afficheur}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.blanc-afficheur}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.nuit-survol}"
  case-voie:
    backgroundColor: "{colors.blanc-afficheur}"
    textColor: "{colors.nuit-afficheur}"
    typography: "{typography.board-figure}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 8px"
  ligne-tableau:
    backgroundColor: "{colors.nuit-afficheur}"
    textColor: "{colors.blanc-afficheur}"
    padding: "14px 12px"
  ligne-tableau-alternee:
    backgroundColor: "{colors.nuit-ligne-alternee}"
  ligne-tableau-hover:
    backgroundColor: "{colors.nuit-survol}"
  commutateur:
    backgroundColor: "transparent"
    rounded: "{rounded.md}"
    width: "40px"
    height: "24px"
  commutateur-actif:
    backgroundColor: "{colors.jaune-afficheur}"
  pastille-service:
    backgroundColor: "transparent"
    textColor: "{colors.blanc-afficheur}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  select-trigger:
    backgroundColor: "transparent"
    textColor: "{colors.blanc-afficheur}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "44px"
---

# Design System: IUTables'O

## Overview

**Creative North Star: "Le tableau des départs"**

Chaque écran se lit comme l'afficheur rétroéclairé d'un hall de gare : un fond bleu nuit plein, des lignes alternées d'un cran plus claires, des filets d'un pixel, des noms en blanc condensé, la distance dans une case blanche comme un numéro de voie et l'heure de Paris en jaune dans le bandeau. Les adresses sont rangées par distance et leur statut d'ouverture s'affiche en face, de façon à ce qu'un coup d'œil suffise.

La densité est celle d'un tableau d'information, pas d'une page vitrine. Pas de carte flottante, pas d'ombre, pas de photo. La profondeur vient uniquement de l'écart de luminosité entre les bleus. Le jaune est rare, et c'est ce qui lui donne son poids : il désigne ce qui compte maintenant (l'heure, le focus, la sélection, l'action principale, le jour même dans un horaire, la tranche de distance courante).

Le système refuse deux voisins directs : la grille de cartes avec plan à droite des annuaires, et le bistrot crème, serif et terracotta. Il n'existe qu'un thème, sombre, déclaré au navigateur (`color-scheme: dark`, `themeColor` égal au fond).

**Key Characteristics:**
- Un seul fond bleu nuit, profondeur par paliers de luminosité, jamais par ombre.
- Jaune afficheur réservé à l'instant présent et à l'action.
- Sofia Sans Condensed pour tout ce qui s'affiche au tableau, Sofia Sans pour la prose et les contrôles.
- Case « voie » blanche pour les nombres de repérage (distance, département, le « O » du logotype).
- Chaque état porte un libellé et un pictogramme ; la couleur ne fait que confirmer.
- Palettes à bascule comme unique mouvement signature.

## Colors

Une nuit bleue saturée en paliers serrés, un blanc légèrement froid, un seul jaune franc et trois couleurs de statut pastel lisibles sur fond sombre.

### Primary
- **Jaune afficheur** (jaune-afficheur) : l'heure de Paris, l'anneau de focus (2 px, décalé de 2 px), `::selection`, le curseur de saisie, le bouton principal, le soulignement du champ de l'accueil, le type d'adresse sélectionné, le commutateur actif, le titre et le segment de la tranche de distance courante, la plage horaire du jour et sa pastille « aujourd'hui ». Contraste mesuré 12,6:1 sur le fond.
- **Jaune afficheur éclairci** (jaune-afficheur-survol) : survol du bouton principal et du bouton de recherche, nulle part ailleurs.

### Secondary
- **Vert ouvert** (statut-ouvert) : libellé « Ouvert » et coches « oui » des services.
- **Ambre bientôt** (statut-bientot) : « Ferme bientôt » et valeurs partielles (« limité »).
- **Corail fermé** (statut-ferme) : « Fermé » ; sert aussi de couleur destructive.

### Neutral
- **Nuit afficheur** (nuit-afficheur) : le fond unique de toutes les pages, et le texte posé sur jaune ou sur case voie.
- **Nuit ligne alternée** (nuit-ligne-alternee) : une ligne de tableau sur deux, la bande « Lire le tableau » de l'accueil, les bâtiments et parcs du plan.
- **Nuit panneau** (nuit-panneau) : menus déroulants et contrôles MapLibre.
- **Nuit survol** (nuit-survol) : survol des lignes, des options et des boutons secondaires ; ligne du jour dans l'horaire ; eau et grands axes du plan ; squelettes de chargement.
- **Filet** (filet) : séparateurs d'un pixel entre lignes, en-tête et pied de page.
- **Filet de champ** (filet-champ) : contours des champs, commutateurs, boutons contour, pastilles de service, filets sous les en-têtes de colonnes et les titres de section ; barre de défilement. Contraste 3,8:1 (WCAG 1.4.11).
- **Bleu-gris métadonnées** (bleu-gris-meta) : type, cuisine, adresse, précisions de statut, légendes. Contraste 8,7:1.
- **Gris non renseigné** (gris-non-renseigne) : l'information absente d'OpenStreetMap (« Horaires non renseignés », « Rue non renseignée »), les placeholders et les noms de rues du plan. Contraste 5,8:1 : lisible mais visiblement en retrait.
- **Blanc afficheur** (blanc-afficheur) : noms, titres, texte courant ; et fond de la case voie. Contraste 16,2:1.
- **Palettes** (palette-haut, palette-bas, palette-charniere) : les trois teintes d'une case à bascule, moitié haute plus claire, charnière de 2 px presque noire.

### Named Rules
**La règle du jaune qui désigne.** Le jaune marque ce qui concerne le visiteur maintenant ou ce qu'il peut actionner. Il n'est jamais décoratif, jamais un fond de section, jamais une couleur de texte courant.

**La règle de l'absence lisible.** Une donnée manquante s'écrit en gris non renseigné avec le pictogramme cercle pointillé. Elle ne se cache pas et ne se confond pas avec le bleu-gris des métadonnées réelles.

**La règle des jetons repeints.** Tout ce qui n'est pas du DOM, comme le fond de carte OpenFreeMap, est repeint depuis les propriétés CSS du site à l'exécution, jamais avec des couleurs recopiées.

## Typography

**Display Font:** Sofia Sans Condensed (via `next/font`, variable `--font-display`, repli Sofia Sans puis sans-serif)
**Body Font:** Sofia Sans (variable `--font-sans`)

**Character:** Une même famille en deux largeurs. La version condensée donne la voix de l'afficheur, serrée, grasse et chiffrée ; la largeur normale reste calme pour la prose, les libellés et les contrôles.

### Hierarchy
- **Display** (700, clamp(3rem, 7.4vw, 6rem), interligne 0.92, -0.025em) : titre de l'accueil seulement, limité à 15ch.
- **Headline** (700, clamp de 2.25rem à 4.75rem selon la page, interligne 0.95 à 1, -0.02em) : nom de ville des résultats, nom d'établissement de la fiche, titres de message (ville inconnue, panne, 404, erreur), à propos.
- **Title** (600, 1.375rem mobile à 1.5rem desktop, interligne serré) : nom d'établissement dans une ligne ; 700 en 1.5rem pour les titres de section de la fiche, soulignés d'un filet de champ ; 1.75rem pour les villes suggérées.
- **Chiffres du tableau** (board-figure : 600 à 700, 1.125rem à 1.5rem, chiffres tabulaires) : distances en case voie, compteurs du filtre de type, plages horaires (1.25rem), horloge (1.5rem), titres de tranche de distance (1.125rem, jaune).
- **Body** (400, 1.125rem, interligne 1.625 à 1.7) : chapeaux et prose, 36rem à 65ch au plus.
- **Body small** (400, 0.875rem) : métadonnées de ligne, statuts, notes de filtre, pied de page.
- **Label** (600, 0.75rem, 0.14em, majuscules) : en-têtes de colonnes du tableau (« Établissement / Statut / Distance », « Quelques villes / Dépt ») et légendes du panneau de filtres. Rien d'autre.

### Named Rules
**La règle de l'afficheur condensé.** Ce qui s'afficherait sur le tableau d'une gare (noms, titres, chiffres, horaires) est en Sofia Sans Condensed ; ce qui s'expliquerait au guichet est en Sofia Sans. Tous les `h1` à `h4` sont condensés et équilibrés (`text-wrap: balance`).

**La règle des chiffres alignés.** Distances, compteurs, heures et plages horaires utilisent toujours les chiffres tabulaires.

## Layout

Conteneur de 80rem (max-w-7xl) centré, marges de 16 px sur mobile et 32 px à partir de 768 px. Tout est aligné à gauche ; aucune section n'est centrée.

Les compositions sont asymétriques : accueil 7/5 (titre et saisie à gauche, villes suggérées en lignes de tableau à droite, calées en bas), légende 4/8, fiche 7/5 avec plan collant à droite, à propos 5/7 avec titre collant. Les résultats placent une colonne de filtres de 15rem, collante, à gauche du tableau (écart de 48 px, 64 px en grand écran).

La ligne du tableau est une grille nommée. Sur mobile : nom et distance, puis métadonnées, statut et services empilés. À partir de 768 px : trois colonnes (établissement, statut de 11.5rem, distance de 5.5rem), alignées sur la rangée d'en-têtes de colonnes. Les lignes font 14 px de marge verticale (16 px desktop) et sont regroupées par tranches de distance (moins de 250 m, 250 à 500 m, 500 m à 1 km, au-delà), chacune ouverte par un titre jaune suivi d'une règle graduée (un trait tous les 100 m, bornes chiffrées, segment jaune de 4 px pour la tranche). Sur mobile, la règle ne chiffre que 0, la borne de fin de la tranche et le rayon.

Sur mobile, les filtres se replient derrière un bouton contour « Filtrer » posé sur la même ligne que le compteur, pour que les premières adresses tiennent dans le premier écran. Toutes les cibles tactiles font au moins 44 px (lignes de ville 56 px, commutateurs 48 px). Testé à 390 px.

## Elevation & Depth

Le système est plat. La profondeur se lit par paliers de luminosité du bleu : fond, ligne alternée, panneau, survol. Les filets d'un pixel séparent ; rien ne flotte au-dessus du tableau.

### Shadow Vocabulary
- **Liseré de palette** (`box-shadow: inset 0 -1px 0 rgb(0 0 0 / 0.35)`) : bord inférieur d'une case à bascule, rendu de la matière de l'afficheur.
- **Menu déroulant** (`box-shadow: 0 18px 40px -16px rgb(2 6 20 / 0.8)`) : seule ombre portée du site, sous la liste du sélecteur de cuisine, qui recouvre réellement le contenu.
- **Soulignement renforcé** (`box-shadow: 0 2px 0 0 var(--primary)`) : double l'épaisseur du soulignement jaune du grand champ au focus. Indicateur d'état, pas d'élévation.

### Named Rules
**La règle de l'afficheur plat.** Aucune ombre sur les lignes, sections, boutons ou contrôles de carte (les ombres MapLibre sont retirées). Seul un calque qui recouvre le contenu, comme un menu ouvert, a droit à une ombre.

## Shapes

Des angles à peine adoucis, comme des plaques émaillées : 2 px pour les petites pastilles et le plot des commutateurs, 3 px pour boutons, champs, cases voie, commutateurs, lignes de type et contrôles de carte, 4 px en réserve. Rien n'est arrondi en pilule ni en cercle. Les séparations sont des filets horizontaux d'un pixel ; les boîtes fermées sont réservées aux contrôles (pastilles de service, commutateurs, sélecteur, bouton contour). Le champ de recherche n'a pas de cadre, seulement un soulignement de 2 px.

## Components

### Buttons
Carrés, pleins, sans fioriture.
- **Shape:** angles de 3 px (rounded.md).
- **Primary:** fond jaune afficheur, texte nuit, 600 en 1rem, hauteur 44 px (48 px en `lg`), marge horizontale de 20 px.
- **Hover / Focus:** jaune éclairci au survol ; enfoncement de 1 px au clic ; transitions de 150 ms ciblées sur fond, bordure, couleur et position ; focus par anneau jaune de 2 px.
- **Outline:** contour filet de champ, texte blanc ; au survol la bordure passe au bleu-gris et le fond au bleu de survol. Sert à « Filtrer », « Afficher 24 adresses de plus », « Effacer les filtres ».
- **Link:** texte jaune souligné à 40 % d'opacité, soulignement plein au survol.
- **Bouton de recherche:** carré jaune de 44 px (56 px sur l'accueil) avec une flèche Lucide, collé au soulignement du champ.

### Case voie
La signature typographique : un rectangle blanc afficheur, texte nuit en Sofia Sans Condensed grasse à chiffres tabulaires, angles de 3 px. Distance d'une ligne (hauteur 32 px, largeur minimale 4.5rem), numéro de département (28 px), exemple dans la légende (24 px), et le « O » final du logotype. Elle ne porte que des nombres de repérage ou ce « O ».

### Chips (pastilles de service)
- **Style:** contour filet de champ, fond transparent, texte blanc en 0.75rem, angles de 2 px, marge de 2 px sur 6 px.
- **State:** purement informatif (« Végétarien », « Accès fauteuil roulant », « À emporter »), jamais cliquable.

### Ligne du tableau
- **Background:** fond nuit, une ligne sur deux en ligne alternée, filet d'un pixel en bas.
- **Hover:** fond de survol et nom en jaune ; toute la ligne est cliquable par un pseudo-élément du lien, avec anneau de focus jaune intérieur.
- **Contenu:** nom en titre condensé, métadonnées en bleu-gris jointes par « · », statut, pastilles, case voie.

### Statut d'ouverture
Un vocabulaire fermé de cinq états, chacun avec libellé et pictogramme Lucide de 16 px : Ouvert (cercle coché, vert, 600), Ferme bientôt (horloge, ambre, 600), Fermé (cercle barré, corail, 600), Horaires incertains (cercle interrogation, bleu-gris), Horaires non renseignés (cercle pointillé, gris non renseigné). La précision (« ferme à 14 h ») suit en bleu-gris, en ligne après « · » avec un écart de 4 px, ou empilée et alignée sur le libellé.

### Inputs / Fields
- **Style:** champ de recherche sans cadre, soulignement de 2 px ; texte saisi en Sofia Sans Condensed 600 (1.25 à 1.5rem en en-tête de page, jusqu'à 3rem sur l'accueil). Placeholder en gris non renseigné.
- **Focus:** en en-tête, le soulignement filet de champ passe au jaune ; sur l'accueil, déjà jaune, il double d'épaisseur.
- **Sélecteur:** contour filet de champ, 44 px, angles de 3 px ; bordure jaune quand il est ouvert ; liste sur fond panneau.

### Commutateurs de filtres
Rangées libellées de 48 px séparées par des filets. Le commutateur mesure 40 × 24 px, angles de 3 px ; éteint : contour filet de champ et plot de 16 px en filet de champ à gauche ; allumé : fond jaune et plot nuit à droite, glissement de 200 ms en `cubic-bezier(0.16, 1, 0.3, 1)`. Le libellé passe en 600 quand le filtre est actif. Le filtre de type est une liste de boutons pleine largeur avec compteur condensé ; la sélection est un fond jaune plein.

### Navigation
Bandeau fermé par un filet : logotype condensé à gauche (« IUTables' » plus le « O » en case voie), liens en bleu-gris 0.875rem qui passent au blanc au survol, cibles de 44 px, puis l'horloge de Paris séparée par un filet vertical (libellé « Paris » en 0.75rem, heure en condensé jaune tabulaire). Sur mobile, seul « À propos » reste et l'horloge disparaît. Pied de page : attribution OpenStreetMap et lien « D'où viennent les données », liens blancs soulignés en filet de champ, soulignement jaune au survol.

### Palettes à bascule (signature)
Le texte s'affiche en cases de 0.66 × 1.12 em, en capitales. Chaque case contient une bande verticale de trois lettres de passage puis la lettre finale, déjà calée sur la lettre finale sans animation : le texte n'attend jamais le mouvement et reste lu par les lecteurs d'écran via une copie masquée. À l'arrivée, la bande roule en 210 ms par trois crans, avec un décalage légèrement irrégulier par lettre plafonné pour finir sous 700 ms. En mode attente (« Recherche »), les cases défilent en boucle. Coupé sous `prefers-reduced-motion`. Utilisé pour le nom de la ville des résultats, le compteur d'adresses et l'écran de chargement, pas ailleurs.

### Plan du quartier
MapLibre sur OpenFreeMap « dark », repeint aux jetons du site : sol nuit, bâtiments et parcs en ligne alternée, eau et grands axes en bleu de survol, bords de route en filet de champ, noms de rues en gris non renseigné avec halo nuit. Contrôles sur fond panneau, contour filet de champ, sans ombre.

## Do's and Don'ts

### Do:
- **Do** poser toute nouvelle page sur le fond nuit afficheur, dans le conteneur de 80rem, aligné à gauche, avec une grille asymétrique.
- **Do** présenter toute liste d'éléments comparables en lignes de tableau alternées séparées par des filets d'un pixel, avec en-têtes de colonnes en label majuscule espacé (0.14em).
- **Do** mettre les nombres de repérage (distance, département) dans une case voie blanche, en condensé gras tabulaire.
- **Do** accompagner chaque état d'un libellé et d'un pictogramme Lucide ; la couleur de statut ne fait que confirmer.
- **Do** écrire l'absence de donnée en gris non renseigné avec le cercle pointillé.
- **Do** garder l'anneau de focus jaune de 2 px décalé de 2 px et des cibles de 44 px minimum.
- **Do** cibler les propriétés animées (couleur, fond, bordure, position) en 150 à 200 ms, et couper tout défilement sous mouvement réduit.

### Don't:
- **Don't** empiler des cartes arrondies avec ombre portée, ni placer une grille de cartes à côté d'un plan : le résultat est un tableau, pas un annuaire.
- **Don't** introduire un fond crème, une serif ou une teinte terracotta.
- **Don't** utiliser le jaune pour décorer, remplir une section ou colorer de la prose.
- **Don't** arrondir en pilule ou en cercle ; rester entre 2 et 4 px.
- **Don't** ajouter de photographie.
- **Don't** étendre les palettes à bascule au-delà des arrivées de données et de l'attente : un seul mouvement signature.
- **Don't** mettre de libellé en majuscules au-dessus d'un titre : les majuscules espacées sont réservées aux en-têtes de colonnes et aux légendes de filtres.
