---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/recherche/page.tsx","src/app/restaurant/[osmId]/page.tsx"]
---

# Surface : application LesTables (accueil, résultats, fiche, pages annexes)

Mode : Operate. Le visiteur cherche une table ; le recruteur de passage voit le soin, jamais au détriment de la tâche.

Tâche : saisir une commune, repérer ce qui est proche et ouvert, filtrer, ouvrir une fiche (horaires, accès, contact, plan). États fréquents : attente d'Overpass, panne d'API, ville inconnue, zone vide, filtres sans résultat, info absente.

Contraintes : pas de photo, pas de donnée inventée, WCAG 2.2 AA, 44 px tactiles, 390 px testé, attribution OSM.

Décisions ouvertes : aucune carte de l'ensemble des résultats pour l'instant (TODO optionnel).

## Direction contract

THESIS: Les adresses autour du centre se lisent comme un tableau des départs de gare : triées par distance, statut en face, lisibles d'un coup d'œil. Refuse la grille de cartes + carte à droite des annuaires, et le bistrot crème, serif et terracotta.

OWN-WORLD: Afficheur rétroéclairé bleu nuit plein écran, lignes alternées d'un cran plus claires, filets d'un pixel, ni ombre ni carte. Jaune afficheur pour l'heure, le focus, la sélection et l'action principale ; blanc pour les noms ; bleu-gris pour les métadonnées ; gris « non renseigné » distinct. Distance dans une case blanche façon « voie ». Sofia Sans Condensed pour tout ce qui s'affiche au tableau, Sofia Sans pour la prose. Filtres en commutateurs libellés. Chaque état porte un libellé et un pictogramme, jamais la couleur seule.

STORY: Le visiteur saisit une ville, voit aussitôt ce qui est proche et ouvert, filtre sans perdre la liste, ouvre une fiche lue comme un horaire de ligne, avec plan du quartier et lien pour corriger OSM.

FIRST VIEWPORT: Accueil : bandeau du tableau (marque à gauche, horloge de Paris en jaune à droite) ; colonne gauche, titre condensé blanc très grand puis ligne de saisie soulignée jaune et bouton jaune carré ; colonne droite, villes suggérées en lignes de tableau avec numéro de département en case « voie ». Résultats : nom de la ville en palettes à bascule, champ « autre ville » à droite, puis commutateurs à gauche et tableau des adresses groupé par tranches de distance sur une règle graduée.

FORM: Tableau des départs, candidat 3 de ma liste ordonnée, seed 3ee366e1. Interaction signature : le nom de la ville se retourne en palettes à l'arrivée des résultats (moins de 700 ms, texte présent d'emblée, coupé en mouvement réduit).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
