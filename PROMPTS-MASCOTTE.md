# Prompts IA — le martin-pêcheur de ZkilZ

La mascotte est maintenant un **martin-pêcheur**, en **bleu et blanc uniquement**. Il dit trois choses :
l'**ascension** (partir d'un roseau au ras de l'eau et monter tout en haut), la **précision** (il vise avant de
plonger) et la **technique** (le geste juste, sans éclaboussure).

Sur le site, l'oiseau qui vole d'encart en encart est **dessiné en SVG et animé en code**
(`assets/js/kf-art.js` + `assets/js/bird.js`, skill `animate-2d`). Les images ci-dessous servent à :

- **affiner ce dessin SVG** (planche de référence, n° 1) ;
- **l'assistant en bas à droite** (n° 2 à 5) : le site les détecte tout seul dès qu'elles sont dans
  `assets/img/mascotte/` ;
- **les moments forts** : plongeon, envol, image de partage (n° 6 à 8) ;
- **les services sur téléphone** (n° 9 à 11), où le cadran animé n'est pas affiché.

Génère-les **une par une, dans l'ordre**. Commence par la n° 1 et donne-la ensuite en **image de référence** pour
toutes les autres, sinon l'oiseau change d'une image à l'autre.

Les prompts sont en anglais (les générateurs le comprennent mieux) : colle-les tels quels.
Si ton outil sait exporter en **SVG vectoriel** (par exemple Recraft en mode « vector »), choisis-le pour la
n° 1 : je pourrai reprendre les formes exactes dans l'animation.

---

## 0. Fiche du personnage — à coller au DÉBUT de chaque prompt

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

## 0 bis. Règles de rendu — à coller à la FIN de chaque prompt (sauf n° 8)

```text
Background: one flat uniform chroma-key green (#00B140), no gradient, no floor, no cast shadow, no vignette.
No water, no splash, no transparent or glass objects, no reflections, no particles, no motion lines,
no icons, no text, no logo, no watermark. Sharp silhouette with crisp edges, no glow, no motion blur.
The whole bird is fully inside the frame with at least 10 % empty margin on every side.
Square 2048 × 2048.
```

Pourquoi le vert : c'est la seule couleur absente de l'oiseau, donc `tools/detourer.py` le découpe sans liseré.
Pourquoi ni eau ni éclaboussure : ce sont des éléments transparents, impossibles à détourer proprement. Le site
les dessine lui-même (rides sur l'eau, onde du plongeon).

## Négatif (si l'outil a un champ « negative prompt »)

```text
orange belly, red feet, green feathers, yellow, realistic photo, detailed feathers, 3D render, outline, sketch,
water, splash, bubbles, glass, reflections, glow, motion blur, gradient background, white background, floor,
cast shadow, text, logo, watermark, extra wings, extra legs, open mouth with teeth, cartoon eyes too big
```

## Après chaque image

1. Enregistre-la en PNG avec le **nom indiqué** (par exemple `agent-avatar.png`).
2. Détoure-la :
   ```bash
   python3 tools/detourer.py agent-avatar.png --out assets/img/mascotte
   ```
3. Commite le fichier `.webp` obtenu. Pour les n° 2 à 5, l'assistant l'utilise tout de suite ; pour les autres,
   préviens-moi et je les intègre.

---

## 1. Planche de référence → `kf-planche.png`

Sert à garder le même oiseau partout et à affiner le dessin SVG animé. Format paysage, exception aux 2048 × 2048.

```text
[FICHE] Character turnaround sheet on one row, same scale, evenly spaced, from left to right:
(1) perched in side view facing right, wings folded, feet together;
(2) perched in three-quarter view facing the viewer;
(3) flying in side view, both wings raised high above the back;
(4) flying in side view, both wings lowered below the body;
(5) diving straight down, beak first, wings folded tight against the body.
Landscape 2752 × 1536. [RÈGLES]
```

## 2. Assistant, avatar → `agent-avatar.png`

La pastille ronde en bas à droite. Le site la découpe en cercle : garde la tête bien centrée.

```text
[FICHE] Head and upper chest only, three-quarter view turned slightly toward the viewer, the long beak
pointing to the right, eye looking at the viewer, beak closed, friendly and attentive. The head is centred
and fills about 70 % of the frame; crop at mid-chest. [RÈGLES]
```

## 3. Assistant, clin d'œil → `agent-avatar-clin.png`

**Indispensable : la même image que la n° 2, seul l'œil change.** Donne la n° 2 en référence et demande
uniquement la modification.

```text
Exactly the same image as the reference, same framing, same pose, same colours, pixel-identical everywhere
except the eye: the eye is closed, drawn as a short curved navy line. [RÈGLES]
```

## 4. Assistant, réfléchit → `agent-reflechit.png`

Affiché pendant que l'assistant prépare sa réponse.

```text
[FICHE] Same framing as the avatar (head and upper chest, three-quarter view, beak pointing right), head
tilted up and slightly to the side, eye looking up, beak closed, thoughtful. [RÈGLES]
```

## 5. Assistant, a trouvé → `agent-idee.png`

Affiché quand une réponse arrive.

```text
[FICHE] Same framing as the avatar (head and upper chest, three-quarter view, beak pointing right), head
raised, crest feathers slightly lifted, eye bright and wide, beak slightly open as if about to speak,
pleased. [RÈGLES]
```

## 6. Le plongeon → `kf-plongeon.png`

Pour la section Réalisation : l'oiseau pique dans le cercle bleu nuit qui s'agrandit jusqu'à remplir l'écran.

```text
[FICHE] Diving almost vertically downward, beak first, body perfectly straight and streamlined, wings folded
tight against the body, tail closed, eye focused on the target below. Side view. [RÈGLES]
```

## 7. L'envol → `kf-envol.png`

Pour l'image de partage et la fin de page : l'oiseau qui monte.

```text
[FICHE] Taking off and climbing steeply upward to the upper right, both wings fully spread and raised,
tail fanned, feet tucked, body angled about 45 degrees upward, determined. Side view. [RÈGLES]
```

## 8. Image de partage (réseaux, messageries) → `og-zkilz.png`

L'aperçu affiché quand on partage le lien du site. **Pas de fond vert ici** : c'est l'image finale.

```text
[FICHE] Wide banner. On the left, the kingfisher flies upward along a thin dashed curved line that rises from
the bottom-left corner to the upper middle; three small hollow circles sit on the line like milestones.
Background flat ice white (#F5F8FF) with a very large pale-blue circle (#E8F1FF) behind the bird. The right
half is empty for text. No text, no logo, no watermark. 1200 × 630.
```

Le texte (« ZkilZ — Studio digital ») est ajouté par le site, pas par le générateur : les textes générés sont
souvent déformés.

## 9. Service « Sites » → `kf-site.png`

```text
[FICHE] Perched on the top edge of an open laptop seen from the front, looking down at the screen. The laptop
is drawn in the same flat style, white body and pale-blue screen (#E8F1FF) with a few simple blue interface
blocks, no logo, no readable text. [RÈGLES]
```

## 10. Service « Applications » → `kf-app.png`

```text
[FICHE] Perched on the top edge of a large smartphone standing upright, looking down at it. The phone is drawn
in the same flat style, navy frame, pale-blue screen with a few rounded blue interface blocks and a small
line chart, no logo, no readable text. [RÈGLES]
```

## 11. Service « Réseaux sociaux » → `kf-reseaux.png`

```text
[FICHE] Perched on the top edge of a tall vertical video frame (9:16) with rounded corners, white frame and
pale-blue picture area, a simple blue play triangle in the centre and a thin progress bar at the bottom,
looking down at it. No logo, no readable text. [RÈGLES]
```

---

## Où va chaque image

| N° | Fichier | Où | Intégration |
|---|---|---|---|
| 1 | `kf-planche` | référence du dessin SVG | je reprends les formes |
| 2 | `agent-avatar` | assistant, pastille et fenêtre | automatique |
| 3 | `agent-avatar-clin` | assistant, clignement | automatique |
| 4 | `agent-reflechit` | assistant, pendant la réponse | automatique |
| 5 | `agent-idee` | assistant, quand la réponse arrive | automatique |
| 6 | `kf-plongeon` | Réalisation, le plongeon | je l'intègre |
| 7 | `kf-envol` | pied de page, image de partage | je l'intègre |
| 8 | `og-zkilz` | aperçu des liens partagés | je l'intègre |
| 9-11 | `kf-site`, `kf-app`, `kf-reseaux` | services sur téléphone | intégrées |

---

<!-- IMAGES DES PAGES : début -->

# Images des pages du site

Ces images remplissent les pages du site (accueil, services, méthode, studio…). En attendant tes versions, des illustrations dessinées en code (`tools/illustrations/`) occupent déjà les emplacements : une image IA déposée avec le même nom les remplace. Les vraies images (captures, photo) affichent un cadre « Image à venir » tant qu'elles manquent.

**Où les mettre :** exporte chaque image en PNG ou JPG dans `assets/img/pages/src/` avec le nom indiqué, puis lance `python3 tools/convertir_images.py` : il les redimensionne à 1600 px de large et les convertit en `.webp` dans `assets/img/pages/`.

**Trois styles** : le titre de chaque image dit lequel utiliser.

### Style A — illustration en aplats

```text
Flat vector editorial illustration, geometric and minimal, crisp shapes, very subtle gradients only, no outlines, no texture. Palette strictly blue and white: navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF, white. No orange, red, yellow or green. Any text is drawn as rounded grey or navy bars, never readable letters. No logos of real brands, no watermark.
```

### Style B — écran ou appareil

```text
Clean product mock-up, soft studio lighting, minimal and premium, devices with thin dark bezels, gentle soft shadow on a flat ice-blue background (#E1EBFF). The on-screen interface is invented: palette navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, ice blue and white, rounded corners, generous spacing. All text on screen is drawn as rounded grey bars, never readable letters. No real brand, no real logo, no watermark, no people's faces.
```

### Style C — le martin-pêcheur dans une scène

Colle la **fiche du personnage (n° 0)** au début, joins la **planche n° 1** en image de référence, puis termine par le style A. Pas de fond vert ici : la scène a son propre fond.

Le format (largeur:hauteur) est donné pour chaque image : règle ton générateur dessus.

### Style D — Studio Moumous, noir et blanc

```text
Studio Moumous art direction: strictly black, white and greys, no colour at all, high contrast, clean editorial look, flat shapes or crisp product mock-up, soft studio shadows on a light grey background (#F2F2F2). Any text is drawn as black or grey bars, never readable letters. No real brand, no real logo, no watermark, no kingfisher.
```

## P1. Une planche d'identité visuelle : logo, couleurs, typographie → `col-marque.png`

*Pages : services · format 4:3 · Style A*

```text
A flat-lay brand identity board seen from above on an ice-blue desk: a round logo mark made of simple geometric shapes, four colour swatches (navy, royal blue, azure, white), a large sample letter 'Aa' drawn as shapes, a business card and a small notebook, all neatly aligned on a grid.
```

## P2. L'état des lieux : les tâches d'une journée de travail posées sur la table → `conseil-etat-des-lieux.png`

*Pages : conseil · format 4:3 · Style A*

```text
A top-down view of a work table during an audit session: printed spreadsheets with dense grey grids, sticky notes in two blues grouped into columns (today, problems, ideas), a hand-drawn flow of boxes and arrows on a large sheet, a laptop showing a cluttered spreadsheet, a pen and a cup. Calm, organised, ice-blue background.
```

## P3. La prise en main : l'outil montré à l'équipe sur un grand écran → `conseil-equipe.png`

*Pages : conseil · format 4:3 · Style A*

```text
A small meeting room seen from behind: a large wall screen showing a simple custom app dashboard in royal blue, three people seen from behind as simple flat silhouettes (navy and blue clothes, no faces), one pointing at the screen, laptops on the table. Flat vector, calm, ice-blue walls.
```

## P4. Le premier échange : un carnet, des notes et un appel en visio → `methode-ecouter.png`

*Pages : methode · format 4:3 · Style A*

```text
A flat-lay of a first project meeting seen from above: an open notebook with simple sketches (boxes, arrows), a laptop showing a video call with two plain circular avatars, a cup and a pen, on an ice-blue desk.
```

## P5. Le prototype testé sur un téléphone, à côté des maquettes → `methode-concevoir.png`

*Pages : methode · format 4:3 · Style A*

```text
A desk seen from above with printed screen mock-ups pinned around, and in the centre a hand holding a smartphone running the prototype, a finger about to tap a royal-blue button. Flat vector, navy, blues and white.
```

## P6. Après la mise en ligne : le suivi et les nouvelles fonctions → `methode-grandir.png`

*Pages : methode · format 4:3 · Style A*

```text
A laptop showing a simple analytics chart going up in royal blue, next to a small checklist card with three ticked items and one new item being added, and a phone showing a new post ready to publish. Ice-blue desk.
```

## P7. Le bureau du studio : ordinateur, croquis et téléphone de test → `studio-bureau.png`

*Pages : index, studio · format 4:3 · Style A*

```text
A tidy studio desk seen from above: a laptop with code drawn as coloured bars, a sketchbook with a kingfisher doodle in navy ink, a phone used for testing, a colour swatch fan in blues, a plant with blue pot. Ice-blue desk.
```

## P8. Un site vitrine affiché sur un ordinateur portable → `col-site.png`

*Pages : index · format 4:3 · Style B*

```text
A modern laptop seen from a three-quarter front angle, standing on a plain ice-blue surface. The screen shows a clean showcase website for a small local business: a large hero photo area filled with a soft abstract blue shape, a short bold headline drawn as thick navy bars, one rounded royal-blue button, and a row of three rounded cards below.
```

## P9. Deux écrans d'une application de réservation sur téléphone → `col-app.png`

*Pages : index · format 4:3 · Style B*

```text
Two modern smartphones side by side, slightly tilted toward each other. Left screen: a booking app home with a calendar strip, three rounded time-slot chips, one highlighted in royal blue. Right screen: a confirmation screen with a large check mark in a blue circle and a summary card.
```

## P10. Un tableau de bord de logiciel en ligne sur un grand écran → `col-saas.png`

*Pages : index · format 4:3 · Style B*

```text
A large desktop monitor with a thin bezel. The screen shows a SaaS dashboard: a left sidebar with icons, four KPI cards on top, a smooth royal-blue line chart with a light-blue area underneath, and a table of rows with small status pills.
```

## P11. Deux pistes comparées côte à côte : un logiciel existant et un outil sur mesure → `conseil-solutions.png`

*Pages : conseil · format 16:9 · Style B*

```text
Two browser windows side by side with a thin vertical divider between them. Left: a generic off-the-shelf software screen with many grey menus and features. Right: a simple custom app screen with only three rounded royal-blue cards. Under each window, a small card with three bars and a check mark, like a comparison sheet. Ice-blue background.
```

## P12. La bascule : les données d'un tableur passent dans le nouvel outil → `conseil-transition.png`

*Pages : conseil · format 16:9 · Style B*

```text
A laptop on the left showing a dense grey spreadsheet; a phone and a laptop on the right showing a clean custom app with royal-blue cards; between them, a gentle flow of small rounded rectangles (data rows) travelling along a thin curved dotted path from left to right. Ice-blue background.
```

## P13. De la maquette en gris au site final, sur ordinateur et téléphone → `site-maquettes.png`

*Pages : services, site-web · format 16:9 · Style B*

```text
Three stages of the same web page side by side from left to right: a grey wireframe of boxes, a coloured design mock-up in navy, royal blue and white, then the final page on a laptop with a phone next to it showing the mobile version. Clean, airy, on an ice-blue background.
```

## P14. Un site vu sur téléphone, avec le menu ouvert → `site-mobile.png`

*Pages : index, site-web · format 3:4 · Style B*

```text
A smartphone shown straight on, displaying a mobile website with a rounded navigation sheet opened from the bottom: four menu rows and a large royal-blue call-to-action button. Ice-blue background.
```

## P15. L'écran d'administration où l'on change un texte et une photo → `site-admin.png`

*Pages : site-web · format 16:9 · Style B*

```text
A laptop showing a simple content editor: on the left a list of pages, in the centre a form with a title field, an image upload box showing a thumbnail, a price field, and a toggle switch 'publish' in royal blue. Friendly, uncluttered. Ice-blue background.
```

## P16. Une fiche produit de boutique en ligne avec le bouton d'achat → `site-boutique.png`

*Pages : index, site-web · format 4:3 · Style B*

```text
A laptop and a phone showing the same online shop product page: a large product photo area with an abstract bottle silhouette, a price drawn as a bold bar, size chips and a big royal-blue add-to-cart button. Ice-blue background.
```

## P17. Le parcours d'une application : cinq écrans reliés par des flèches → `app-prototype.png`

*Pages : application-mobile · format 16:9 · Style B*

```text
Five smartphone screens laid out in a row on an ice-blue canvas, linked by thin curved navy arrows like a clickable prototype: welcome, sign-up, home, detail, confirmation. Each screen uses rounded cards and royal-blue buttons, text drawn as grey bars.
```

## P18. L'écran d'accueil de l'application, entouré de deux cartes → `app-main.png`

*Pages : application-mobile, index · format 3:4 · Style B*

```text
A modern smartphone slightly tilted, showing an app home: a greeting bar, a large royal-blue card with a progress ring and two smaller cards. Two rounded white cards float around the phone: a reminder card with a small blue dot, and a progress card with a ring. Ice-blue background.
```

## P19. L'écran verrouillé d'un téléphone avec les notifications de l'application → `app-notif.png`

*Pages : application-mobile · format 3:4 · Style B*

```text
A smartphone lock screen with a large clock drawn as shapes and three stacked rounded notification cards from the same app (a small blue round icon on each). Soft blue abstract wallpaper. Ice-blue background.
```

## P20. L'icône de l'application sur l'écran d'accueil d'un téléphone → `app-icone.png`

*Pages : application-mobile · format 4:3 · Style B*

```text
Close-up of a smartphone home screen grid of app icons, all in muted grey, except one bright royal-blue rounded icon with a simple white geometric symbol in the centre, slightly raised with a soft shadow, as if just installed. Ice-blue background.
```

## P21. Le tableau de bord d'un logiciel en ligne, avec graphiques et indicateurs → `saas-dashboard.png`

*Pages : saas · format 16:9 · Style B*

```text
A wide browser window showing a SaaS dashboard: left sidebar, a header with a search bar, four KPI cards, a bar chart and a line chart in royal blue and azure, and a recent activity list. Calm, readable hierarchy. Ice-blue background.
```

## P22. Les trois étapes d'inscription d'un logiciel en ligne → `saas-onboarding.png`

*Pages : index, saas · format 16:9 · Style B*

```text
Three browser windows overlapping diagonally, showing the steps of an onboarding: create an account (two fields), choose a plan (three plan cards, the middle one highlighted in royal blue), invite your team (avatars as circles). Ice-blue background.
```

## P23. La gestion des accès : chaque membre de l'équipe a son rôle → `saas-roles.png`

*Pages : saas · format 4:3 · Style B*

```text
A browser window showing a team settings table: rows with round avatars (plain coloured circles, no faces), names as grey bars, a role dropdown pill on each row (admin, editor, viewer drawn as pills of different blues), and an 'invite' button in royal blue. Ice-blue background.
```

## P24. Le même logiciel, sur téléphone → `saas-mobile.png`

*Pages : index, saas · format 3:4 · Style B*

```text
A smartphone showing the mobile version of a SaaS dashboard: a stacked column of KPI cards and a compact line chart in royal blue, a bottom tab bar. Ice-blue background.
```

## P25. Le martin-pêcheur posé sur l'écran d'un ordinateur portable qui affiche un site → `svc-site.png`

*Pages : 404, application-mobile, conseil, realisations, reseaux-sociaux, saas, services, site-web · format 16:9 · Style C*

```text
The kingfisher is perched on the top edge of an open laptop screen, looking down at the website on the screen (clean showcase site with a big blue hero shape and three cards). Flat ice-blue background (#E1EBFF), a few floating rounded interface cards around the laptop. Wide composition, the laptop on the right half, empty space on the left for text.
```

## P26. Le martin-pêcheur à côté d'un téléphone qui affiche une application → `svc-app.png`

*Pages : 404, application-mobile, conseil, realisations, reseaux-sociaux, saas, services, site-web · format 16:9 · Style C*

```text
The kingfisher stands next to a smartphone that is as tall as it is, one wing pointing at the screen, which shows a simple app home with rounded cards and a blue tab bar. Flat ice-blue background (#E1EBFF). Wide composition, subject on the right half.
```

## P27. Le martin-pêcheur devant un tableau de bord avec des graphiques → `svc-saas.png`

*Pages : 404, application-mobile, conseil, realisations, reseaux-sociaux, saas, services, site-web · format 16:9 · Style C*

```text
The kingfisher is perched on the corner of a floating dashboard panel showing a rising royal-blue line chart and three KPI cards; small rounded panels float around it like a workspace. Flat ice-blue background (#E1EBFF). Wide composition, subject on the right half.
```

## P28. Le martin-pêcheur penché sur un plan de travail, entre l'ancien tableur et le nouvel outil → `svc-conseil.png`

*Pages : 404, application-mobile, conseil, realisations, reseaux-sociaux, saas, services, site-web · format 16:9 · Style C*

```text
The kingfisher stands on a desk next to two screens: on the left an old cluttered spreadsheet drawn as a dense grey grid, on the right a clean custom app with rounded royal-blue cards; a thin dotted arrow goes from the spreadsheet to the app, and the bird points its beak along the arrow. Flat ice-blue background (#E1EBFF). Wide composition, subject on the right half.
```

## P29. Le martin-pêcheur posé sur un roseau, au-dessus d'un lac calme au lever du jour → `studio-lac.png`

*Pages : studio · format 33:14 · Style C*

```text
Panoramic landscape: a calm lake at sunrise in shades of blue only (navy hills in the distance, pale blue sky, ice-blue water with a few horizontal ripple lines). On the right third, the kingfisher is perched on a single reed just above the water, looking far ahead. Lots of open sky on the left. No text.
```

## P30. Trois téléphones qui affichent des contenus de réseaux sociaux, en noir et blanc → `moumous-hero.png`

*Pages : reseaux-sociaux, services, site-web, studio · format 16:9 · Style D*

```text
Three smartphones standing in a gentle arc, each showing a different vertical social media frame: a bold typographic quote drawn as thick black bars, a product photo in high-contrast black and white, a profile grid of nine squares. Clean studio light, soft shadows on a light grey background.
```

## P31. Le storyboard d'un reel, en noir et blanc → `moumous-reseaux.png`

*Pages : reseaux-sociaux · format 16:9 · Style D*

```text
A storyboard sheet on a light grey desk: six vertical frames in two rows, each a bold black and white composition (product appears, close-up, text card drawn as bars, logo reveal), small arrows between frames, a black marker next to the sheet.
```

## P32. Une planche d'identité visuelle : logo, typographies et papeterie, en noir et blanc → `moumous-identite.png`

*Pages : reseaux-sociaux · format 4:3 · Style D*

```text
A flat-lay brand identity board on a light grey surface: a bold abstract monogram logo, black and white colour swatches with grey steps, a large type specimen drawn as shapes, a business card, an envelope and a notebook, all perfectly aligned on a grid.
```

## P33. Une page de résultats de recherche avec une courbe de visites qui monte, en noir et blanc → `moumous-referencement.png`

*Pages : reseaux-sociaux · format 3:4 · Style D*

```text
A smartphone shown straight on: the screen shows a list of search results drawn as black and grey bars, the first result highlighted with a thick black outline; next to the phone, a small floating card with a black line chart rising to the right. Light grey background.
```

## Vraies images à fournir (pas d'IA)

Ces images doivent être vraies : une capture de ton site client ou ta photo. Mets-les aussi dans `assets/img/pages/src/` puis lance le script de conversion.

- **`studio-portrait.png`** (Portrait du fondateur du studio, format 4:5) — Vraie photo à fournir (pas d'IA) : un portrait de toi, de face ou de trois quarts, lumière naturelle, fond uni clair. Format vertical 4:5, au moins 1200 px de large.
- **`mm-catalogue.png`** (Le catalogue de MM Fragrances sur ordinateur, format 16:10) — Capture d'écran réelle : la page catalogue / collection de mm-fragrances.fr, sur ordinateur (fenêtre de 1440 × 900), en mode sombre, sans barre d'adresse.
- **`mm-quiz.png`** (Le quiz qui aide à trouver son parfum, format 16:10) — Capture d'écran réelle : le quiz « trouver son parfum » de mm-fragrances.fr, sur ordinateur, une question affichée avec ses réponses.
- **`mm-flacon.png`** (Un flacon en 3D sur la fiche produit, format 16:10) — Capture d'écran réelle : une fiche produit de mm-fragrances.fr sur ordinateur, avec le flacon en 3D bien visible.
- **`mm-conseiller.png`** (Le conseiller virtuel qui répond aux questions, sur téléphone, format 3:4) — Capture d'écran réelle : le conseiller virtuel de mm-fragrances.fr ouvert sur téléphone (390 × 844), avec une question et sa réponse.

<!-- IMAGES DES PAGES : fin -->
