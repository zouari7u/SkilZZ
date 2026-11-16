# Atelier d'illustrations

`atelier.html` dessine en HTML et CSS les 31 illustrations des pages (écrans, appareils, planches, scènes avec le
martin-pêcheur), à 1600 px de large, aux couleurs du site. Elles occupent les emplacements en attendant les
versions générées par IA (prompts dans `PROMPTS-MASCOTTE.md`).

## Refaire les images

1. `npm start`, puis ouvrir `http://localhost:4000/tools/illustrations/atelier#1` (groupes `#1` à `#4`,
   ou `#col-site` pour une seule illustration).
2. Faire une capture **pleine page** de chaque groupe, fenêtre de 1600 px de large, en PNG.
3. Découper : `python3 tools/illustrations/decouper.py capture.png 1` (le numéro du groupe).

Une image déposée dans `assets/img/pages/src/` (version IA, capture réelle) n'est jamais écrasée par le
découpage : passe-la par `python3 tools/convertir_images.py`.
