# Images à faire

Ce fichier ne liste que les images qui manquent encore sur le site (9 à générer, 2 vraies à fournir). Il est réécrit par `tools/build_pages.py` : une image livrée disparaît de la liste.

**Comment les livrer :** enregistre chaque image en PNG ou JPG dans `assets/img/pages/src/` avec le nom indiqué (par exemple `conseil-solutions.png`), puis lance :

```bash
python3 tools/convertir_images.py
```

Le script les convertit en WebP et régénère les pages. En attendant, chaque emplacement affiche l'image actuelle (indiquée sous chaque prompt).

**Pour chaque prompt :** colle le texte du prompt, puis le style indiqué (en bas de ce fichier), et règle le format. Pour une image avec le martin-pêcheur, colle aussi la fiche du personnage au début et joins la planche de référence (`assets/img/mascotte/kf-planche.webp`).

## 1. Le martin-pêcheur penché sur un plan de travail, entre l'ancien tableur et le nouvel outil → `svc-conseil.png`

*Format 16:9 · style C — le martin-pêcheur dans une scène · pages : 404, application-mobile, conseil, realisations, reseaux-sociaux, saas, services, site-web*

*En attendant : l'image `col-saas` tient la place.*

```text
The kingfisher stands on a desk next to two screens: on the left an old cluttered spreadsheet drawn as a dense grey grid, on the right a clean custom app with rounded royal-blue cards; a thin dotted arrow goes from the spreadsheet to the app, and the bird points its beak along the arrow. Flat ice-blue background (#E1EBFF). Wide composition, subject on the right half.
```

## 2. L'état des lieux : les tâches d'une journée de travail posées sur la table → `conseil-etat-des-lieux.png`

*Format 4:3 · style A — illustration en aplats · pages : conseil*

*En attendant : l'image `methode-ecouter` tient la place.*

```text
A top-down view of a work table during an audit session: printed spreadsheets with dense grey grids, sticky notes in two blues grouped into columns (today, problems, ideas), a hand-drawn flow of boxes and arrows on a large sheet, a laptop showing a cluttered spreadsheet, a pen and a cup. Calm, organised, ice-blue background.
```

## 3. Deux pistes comparées côte à côte : un logiciel existant et un outil sur mesure → `conseil-solutions.png`

*Format 16:9 · style B — écran ou appareil · pages : conseil*

*En attendant : l'image `saas-onboarding` tient la place.*

```text
Two browser windows side by side with a thin vertical divider between them. Left: a generic off-the-shelf software screen with many grey menus and features. Right: a simple custom app screen with only three rounded royal-blue cards. Under each window, a small card with three bars and a check mark, like a comparison sheet. Ice-blue background.
```

## 4. La bascule : les données d'un tableur passent dans le nouvel outil → `conseil-transition.png`

*Format 16:9 · style B — écran ou appareil · pages : conseil*

*En attendant : l'image `saas-dashboard` tient la place.*

```text
A laptop on the left showing a dense grey spreadsheet; a phone and a laptop on the right showing a clean custom app with royal-blue cards; between them, a gentle flow of small rounded rectangles (data rows) travelling along a thin curved dotted path from left to right. Ice-blue background.
```

## 5. La prise en main : l'outil montré à l'équipe sur un grand écran → `conseil-equipe.png`

*Format 4:3 · style A — illustration en aplats · pages : conseil*

*En attendant : l'image `saas-roles` tient la place.*

```text
A small meeting room seen from behind: a large wall screen showing a simple custom app dashboard in royal blue, three people seen from behind as simple flat silhouettes (navy and blue clothes, no faces), one pointing at the screen, laptops on the table. Flat vector, calm, ice-blue walls.
```

## 6. Trois téléphones qui affichent des contenus de réseaux sociaux, en noir et blanc → `moumous-hero.png`

*Format 16:9 · style D — Studio Moumous, noir et blanc · pages : reseaux-sociaux, services, site-web, studio*

*En attendant : l'image `svc-reseaux` tient la place.*

```text
Three smartphones standing in a gentle arc, each showing a different vertical social media frame: a bold typographic quote drawn as thick black bars, a product photo in high-contrast black and white, a profile grid of nine squares. Clean studio light, soft shadows on a light grey background.
```

## 7. Le storyboard d'un reel, en noir et blanc → `moumous-reseaux.png`

*Format 16:9 · style D — Studio Moumous, noir et blanc · pages : reseaux-sociaux*

*En attendant : l'image `reseaux-storyboard` tient la place.*

```text
A storyboard sheet on a light grey desk: six vertical frames in two rows, each a bold black and white composition (product appears, close-up, text card drawn as bars, logo reveal), small arrows between frames, a black marker next to the sheet.
```

## 8. Une planche d'identité visuelle : logo, typographies et papeterie, en noir et blanc → `moumous-identite.png`

*Format 4:3 · style D — Studio Moumous, noir et blanc · pages : reseaux-sociaux*

*En attendant : l'image `reseaux-charte` tient la place.*

```text
A flat-lay brand identity board on a light grey surface: a bold abstract monogram logo, black and white colour swatches with grey steps, a large type specimen drawn as shapes, a business card, an envelope and a notebook, all perfectly aligned on a grid.
```

## 9. Une page de résultats de recherche avec une courbe de visites qui monte, en noir et blanc → `moumous-referencement.png`

*Format 3:4 · style D — Studio Moumous, noir et blanc · pages : reseaux-sociaux*

*En attendant : l'image `col-grille` tient la place.*

```text
A smartphone shown straight on: the screen shows a list of search results drawn as black and grey bars, the first result highlighted with a thick black outline; next to the phone, a small floating card with a black line chart rising to the right. Light grey background.
```

## Vraies images à fournir (pas d'IA)

- **`studio-portrait.png`** — Portrait du fondateur du studio (format 4:5). Vraie photo à fournir (pas d'IA) : un portrait de toi, de face ou de trois quarts, lumière naturelle, fond uni clair. Format vertical 4:5, au moins 1200 px de large.
- **`mm-conseiller.png`** — Le conseiller virtuel qui répond aux questions, sur téléphone (format 3:4). Capture d'écran réelle : le conseiller virtuel de mm-fragrances.fr ouvert sur téléphone (390 × 844), avec une question et sa réponse.

---

# Styles à coller à la fin des prompts

## Style A — illustration en aplats

```text
Flat vector editorial illustration, geometric and minimal, crisp shapes, very subtle gradients only, no outlines, no texture. Palette strictly blue and white: navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF, white. No orange, red, yellow or green. Any text is drawn as rounded grey or navy bars, never readable letters. No logos of real brands, no watermark.
```

## Style B — écran ou appareil

```text
Clean product mock-up, soft studio lighting, minimal and premium, devices with thin dark bezels, gentle soft shadow on a flat ice-blue background (#E1EBFF). The on-screen interface is invented: palette navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, ice blue and white, rounded corners, generous spacing. All text on screen is drawn as rounded grey bars, never readable letters. No real brand, no real logo, no watermark, no people's faces.
```

## Style C — le martin-pêcheur dans une scène

```text
Flat vector editorial illustration, geometric and minimal, crisp shapes, very subtle gradients only, no outlines, no texture. Palette strictly blue and white: navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF, white. No orange, red, yellow or green. Any text is drawn as rounded grey or navy bars, never readable letters. No logos of real brands, no watermark.
```

## Style D — Studio Moumous, noir et blanc

```text
Studio Moumous art direction: strictly black, white and greys, no colour at all, high contrast, clean editorial look, flat shapes or crisp product mock-up, soft studio shadows on a light grey background (#F2F2F2). Any text is drawn as black or grey bars, never readable letters. No real brand, no real logo, no watermark, no kingfisher.
```

# 0. Fiche du personnage — à coller au DÉBUT de chaque prompt

```text
A brand mascot: a common kingfisher, flat vector illustration, geometric and minimal, crisp clean shapes,
very subtle gradients only, no outlines, no texture, no realistic feathers. Colour palette strictly blue and
white: royal-blue crown and back (#2F7BFF to #1450D8), a bright azure stripe running down the back (#8FDBFF
to #2FA8FF), deep-blue wings (#1B5FE8 to #0B3BA8) with a few small light-blue spots (#5BB8FF), pure white
throat and belly fading to ice blue (#D8E8FF), light azure cheek patch (#8FDBFF), a long straight
dagger-shaped navy beak (#0B1B3F), a small round navy eye with one white highlight, a small white spot just
in front of the eye, tiny navy feet. No orange, no red, no yellow, no green anywhere on the bird. Compact
body, large head, short tail. Calm, precise, focused expression: a bird that aims before it dives.
The same character in every image: use the attached reference image.
```
