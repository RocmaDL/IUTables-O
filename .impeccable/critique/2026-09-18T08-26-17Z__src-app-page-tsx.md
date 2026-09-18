---
target: page d'accueil, pourquoi le but restaurant n'est pas compris immédiatement
total_score: 18
max_score: 28
na_heuristics: 7,10
p0_count: 2
p1_count: 2
target_identity: "file:/home/rocma/Documents/IUTables-O/src/app/page.tsx"
target_fingerprint: "sha256:e83e92053cde7868cc0949cb90233d2641e911d300c4fc142c8dd4140563d9c1"
target_path: /home/rocma/Documents/IUTables-O/src/app/page.tsx
timestamp: 2026-09-18T08-26-17Z
slug: src-app-page-tsx
---
Méthode : dual-agent (A: af033549f347dcb38 · B: a702ea8905319f629)

## Verdict de spécificité
Design non générique (vrai parti pris : Sofia Sans Condensed, palette marine/jaune, split-flap maison), mais appliqué au mauvais endroit : l'habillage "tableau des départs" pensé pour la page de résultats (fonctionnel : tri par distance, case "voie") est repris tel quel sur l'accueil, qui n'affiche aucune donnée triée.

## Test des 5 secondes
Sans lire le texte, première lecture = panneau de gare/aéroport, pas restaurant. Ordre de perception : bandeau marine + horloge jaune -> tableau des villes à cases blanches numérotées (53% hauteur, 33% largeur, mesuré) -> logo lui-même (case "voie" identique au badge distance).

## Score Nielsen (7 heuristiques applicables, /28)
1. Visibilité du statut : 3/4
2. Corrélation système/monde réel : 2/4 — texte correct, système de signes code le transport
3. Contrôle utilisateur : 3/4
4. Cohérence : 3/4 — cohérent mais reproduit le motif gare à 3 endroits
5. Prévention d'erreurs : 3/4
6. Reconnaissance plutôt que rappel : 2/4 — ratio icônes/H1 6:1 desktop, 3:1 mobile (mesuré), signal tardif
8. Esthétique minimaliste : 2/4 — exécution 4/4, pertinence au message 2/4
Total : 18/28 (64%) — Acceptable, proche de Bien
(7 et 10 non applicables : page d'accueil)

Détecteur : 1 résultat mineur (font-size hors grille, page.tsx:93, advisory). Pas de conflit avec la revue design ; le détecteur ne voit pas les problèmes de métaphore/sémantique.

## Points forts
- Identité visuelle originale, aux antipodes du gabarit générique
- Accessibilité documentée et mesurée (contrastes, focus, sémantique)
- Hiérarchie typographique interne cohérente

## Problèmes prioritaires
[P0] Le système de signes dominant code "transport" pas "nourriture" (bandeau+horloge+tableau villes, aucun contrepoids nourriture à taille comparable). Fix: signal chaud large avant/à hauteur du titre. -> /impeccable layout
[P0] Le tableau "Quelques villes" pèse 53% de la hauteur d'écran (mesuré), plus que H1+intro réunis, même badge que "distance". Fix: réduire son poids, le repousser, le distinguer du composant distance. -> /impeccable layout
[P1] Icônes de catégorie trop petites/tardives : 16px/18px vs H1 96px, ratio 6:1 desktop (mesuré), placées après le paragraphe. Fix: agrandir (32-40px), rapprocher du titre. -> /impeccable bolder
[P1] Le logo réutilise le badge "case voie" -> marque lue comme numéro de quai dès la zone scannée en premier. -> /impeccable colorize
[P2] Horloge de Paris sur l'accueil : signal gare gratuit, aucune utilité avant une recherche. -> /impeccable distill
[P2] Bug mesuré mobile : ligne de catégories cassée en 2 lignes ("Café" isolé, 57.7px). -> /impeccable adapt
[P3] Séquence de lecture mise sur le texte pour lever l'ambiguïté alors que le test des 5 secondes se joue avant toute lecture.

## Persona
Jordan (première utilisation) : classe la page "transport" avant de lire le paragraphe qui le détromperait ; abandon probable avant la ligne d'icônes.

## Questions provocantes
- Le contrat de direction dit que ce sont les résultats qui doivent se lire comme un tableau de gare. L'accueil en a-t-il besoin ?
- Le mot "table" du H1 pose-t-il problème seulement à cause du fond marine/gare qui lui donne une résonance ferroviaire concurrente ?
