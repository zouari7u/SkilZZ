# Images à faire

Ce fichier ne liste que les images qui manquent encore (9 à générer, 2 vraies à fournir). Pour refaire toutes les images du site en mieux : `PROMPTS-IMAGES.md`.

## Quel modèle utiliser

**Nano Banana Pro** (Gemini 3 Pro Image) : c'est le plus soigné des modèles d'image de Google, le meilleur pour
les rendus produit, la cohérence d'un personnage et les mots écrits sur les écrans. Dans l'application Gemini,
choisis « Créer des images » puis le modèle **Pro** (ou « Réflexion ») s'il est proposé. À défaut, **Nano Banana
2.1** (le modèle par défaut, plus rapide) donne de très bons résultats avec ces prompts.

« Hydrogen » (Gemini 4 Hydrogen) n'est pas un modèle d'image : il ne fait que du texte.

## Comment travailler

1. **Une conversation Gemini par style** (A, B, C, D, plus bas). La première image réussie fixe le rendu : les
   suivantes de la même conversation lui ressembleront.
2. **Joins des images de référence** au premier message de chaque conversation :
   - style C (le martin-pêcheur) : ton logo en PNG et la planche `assets/img/mascotte/kf-planche.webp` ;
   - styles A, B et D : la première image que tu trouves réussie, pour les suivantes (« même rendu, même lumière »).
3. **Choisis le format indiqué** pour chaque image (menu de format de Gemini, ou ajoute « 16:9 » au message).
4. **Colle le prompt en entier**, tel quel : il contient la direction artistique, le style, la scène et le format.
5. **Retouche dans la même conversation**, une chose à la fois : « Garde tout, mais rends le bouton plus grand »,
   « Même image, sans la tasse », « Corrige le mot du bouton : Réserver ». Ne relance pas de zéro pour un détail.
6. **Vérifie les mots** sur les écrans (accents, fautes) : demande une correction si besoin.

## Livrer une image

Enregistre-la en PNG avec le nom indiqué (par exemple `col-site.png`) dans `assets/img/pages/src/`, puis :

```bash
python3 tools/convertir_images.py
```

Le script la recadre au format exact de son emplacement, la convertit en WebP (1600 et 800 px) et régénère les
pages : elle remplace aussitôt l'ancienne.

## 1. Le martin-pêcheur penché sur un plan de travail, entre l'ancien tableur et le nouvel outil → `svc-conseil.png`

*Style C — le martin-pêcheur · format Gemini **16:9** · pages : 404, application-mobile, conseil, realisations, reseaux-sociaux, saas, services, site-web · manque encore*

*En attendant : l'image `col-saas` tient la place.*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Main character: the ZkilZ kingfisher, exactly as in the attached logo and reference sheet. A compact kingfisher with a large rounded royal-blue crown (#2F7BFF to #1F5FD6), a light-azure cheek patch, a white throat with a light-azure collar band, a long straight dagger-shaped navy beak, a round black eye with one white highlight and a small white spot in front of it, a deep-blue wing (#1E5CC8 to #174CA8) with a darker navy lower edge and a few small light-azure spots, a bright azure stripe down the back, a short blue tail, small navy feet. Only blues and white on the bird. Calm, precise, focused expression. Same proportions in every image.

Style: the same flat vector style as the attached ZkilZ logo (a kingfisher inside a circle): clean geometric shapes, smooth soft gradients inside each shape, small light-azure spots on the wing, a few stylised leaves. The scene around the bird is a refined editorial illustration with layered depth, soft long shadows at low opacity, matte finish, no outlines, no texture. Any writing is drawn as soft rounded lines, never readable letters.

Scene: On a clean desk, two screens side by side: on the left an old cluttered spreadsheet drawn as a dense grey grid with a few highlighted cells, on the right a clean custom app with three rounded royal-blue cards. A thin dotted arrow curves from the spreadsheet to the app, and the kingfisher stands between them, pointing its beak along the arrow. Flat ice-blue background with one large pale circle. Wide composition, subject in the right half, empty space on the left.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 2. L'état des lieux : les tâches d'une journée de travail posées sur la table → `conseil-etat-des-lieux.png`

*Style A — illustration éditoriale · format Gemini **4:3** · pages : conseil · manque encore*

*En attendant : l'image `methode-ecouter` tient la place.*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: refined editorial vector illustration, like the illustrations of a premium software brand. Flat shapes built in layers with real depth: each object has two or three tones of the same blue, soft long shadows at low opacity, gentle ambient occlusion where objects touch. Matte finish, perfectly clean edges, no outlines, no texture, no gradient backgrounds. Objects have believable proportions and are arranged with care, like a styled flat-lay photographed from above. Any writing is drawn as soft rounded lines, never readable letters.

Scene: A top-down view of a work table during an audit session: printed spreadsheets with dense grey grids, sticky notes in two blues grouped into three neat columns, a large sheet with a hand-drawn flow of boxes and arrows, an open laptop showing a cluttered spreadsheet, a pen and a white cup. Calm and organised, even spacing, ice-blue table.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 3. Deux pistes comparées côte à côte : un logiciel existant et un outil sur mesure → `conseil-solutions.png`

*Style B — rendu produit 3D · format Gemini **16:9** · pages : conseil · manque encore*

*En attendant : l'image `saas-onboarding` tient la place.*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: Two laptops side by side on a long ice-blue pedestal, a thin vertical white divider panel between them. Left laptop: a generic off-the-shelf software screen crowded with grey menus, tabs and tiny icons. Right laptop: a simple custom app with only three large rounded royal-blue cards and a clear button « Valider ». In front of each laptop, a small white card with three bars and a check mark, like a comparison sheet.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 4. La bascule : les données d'un tableur passent dans le nouvel outil → `conseil-transition.png`

*Style B — rendu produit 3D · format Gemini **16:9** · pages : conseil · manque encore*

*En attendant : l'image `saas-dashboard` tient la place.*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: On the left, a laptop showing a dense grey spreadsheet; on the right, a laptop and a phone showing the same data in a clean custom app with royal-blue cards. Between them, a gentle stream of small rounded white and azure tiles (data rows) floats along a thin curved dotted path from left to right, getting more organised as it travels. Ice-blue set, soft shadows.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 5. La prise en main : l'outil montré à l'équipe sur un grand écran → `conseil-equipe.png`

*Style A — illustration éditoriale · format Gemini **4:3** · pages : conseil · manque encore*

*En attendant : l'image `saas-roles` tient la place.*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: refined editorial vector illustration, like the illustrations of a premium software brand. Flat shapes built in layers with real depth: each object has two or three tones of the same blue, soft long shadows at low opacity, gentle ambient occlusion where objects touch. Matte finish, perfectly clean edges, no outlines, no texture, no gradient backgrounds. Objects have believable proportions and are arranged with care, like a styled flat-lay photographed from above. Any writing is drawn as soft rounded lines, never readable letters.

Scene: A small bright meeting room seen from behind the team: a large wall screen shows a simple custom app dashboard in royal blue; three people seen from behind as simple flat silhouettes in navy and blue clothes (no faces), one standing and pointing at the screen, two seated with laptops open on a white table. A plant with a blue pot in the corner. Ice-blue walls, calm and friendly.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 6. Trois téléphones qui affichent des contenus de réseaux sociaux, en noir et blanc → `moumous-hero.png`

*Style D — Studio Moumous, noir et blanc · format Gemini **16:9** · pages : reseaux-sociaux, services, site-web, studio · manque encore*

*En attendant : l'image `svc-reseaux` tient la place.*

```text
Art direction for Studio Moumous, a content and marketing studio: strictly black, white and greys, no colour at all. Style: high-end black-and-white editorial studio photography (or a photoreal 3D render that looks like it), seamless light-grey backdrop (#F2F2F2), one large soft key light with crisp but soft shadows, strong graphic composition, deep blacks and clean whites, like a fashion or design magazine still life. Generic objects only: no real brand, no real logo. On-screen or printed text: only the few short French words given in the scene, perfectly spelled; everything else is solid black or grey bars. No kingfisher, no blue.

Scene: Three smartphones standing in a gentle arc on a low matte black plinth, each showing a different vertical social media frame: a bold typographic quote card with the word « Nouveau » in heavy black type, a high-contrast black-and-white product photo of a perfume bottle, a profile grid of nine squares. Large soft key light from the left, long soft shadows to the right. Wide composition with space on the left.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, any colour.
```

## 7. Le storyboard d'un reel, en noir et blanc → `moumous-reseaux.png`

*Style D — Studio Moumous, noir et blanc · format Gemini **16:9** · pages : reseaux-sociaux · manque encore*

*En attendant : l'image `reseaux-storyboard` tient la place.*

```text
Art direction for Studio Moumous, a content and marketing studio: strictly black, white and greys, no colour at all. Style: high-end black-and-white editorial studio photography (or a photoreal 3D render that looks like it), seamless light-grey backdrop (#F2F2F2), one large soft key light with crisp but soft shadows, strong graphic composition, deep blacks and clean whites, like a fashion or design magazine still life. Generic objects only: no real brand, no real logo. On-screen or printed text: only the few short French words given in the scene, perfectly spelled; everything else is solid black or grey bars. No kingfisher, no blue.

Scene: A storyboard sheet lying on a light-grey desk, seen from above at a slight angle: six vertical frames in two rows, each a bold black-and-white composition (product appears, close-up, text card drawn as bars, logo reveal), small hand-drawn arrows between frames, a thick black marker and a few loose paper strips next to the sheet. Crisp shadows from a single soft light.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, any colour.
```

## 8. Une planche d'identité visuelle : logo, typographies et papeterie, en noir et blanc → `moumous-identite.png`

*Style D — Studio Moumous, noir et blanc · format Gemini **4:3** · pages : reseaux-sociaux · manque encore*

*En attendant : l'image `reseaux-charte` tient la place.*

```text
Art direction for Studio Moumous, a content and marketing studio: strictly black, white and greys, no colour at all. Style: high-end black-and-white editorial studio photography (or a photoreal 3D render that looks like it), seamless light-grey backdrop (#F2F2F2), one large soft key light with crisp but soft shadows, strong graphic composition, deep blacks and clean whites, like a fashion or design magazine still life. Generic objects only: no real brand, no real logo. On-screen or printed text: only the few short French words given in the scene, perfectly spelled; everything else is solid black or grey bars. No kingfisher, no blue.

Scene: A flat-lay brand identity board on a light-grey surface, seen from directly above: a bold abstract monogram logo printed large on a black card, black, white and grey swatches in even steps, a type specimen card with a huge « Aa », a business card, an envelope and a black notebook, all perfectly aligned on a grid with crisp shadows.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, any colour.
```

## 9. Une page de résultats de recherche avec une courbe de visites qui monte, en noir et blanc → `moumous-referencement.png`

*Style D — Studio Moumous, noir et blanc · format Gemini **3:4** · pages : reseaux-sociaux · manque encore*

*En attendant : l'image `col-grille` tient la place.*

```text
Art direction for Studio Moumous, a content and marketing studio: strictly black, white and greys, no colour at all. Style: high-end black-and-white editorial studio photography (or a photoreal 3D render that looks like it), seamless light-grey backdrop (#F2F2F2), one large soft key light with crisp but soft shadows, strong graphic composition, deep blacks and clean whites, like a fashion or design magazine still life. Generic objects only: no real brand, no real logo. On-screen or printed text: only the few short French words given in the scene, perfectly spelled; everything else is solid black or grey bars. No kingfisher, no blue.

Scene: A smartphone standing upright on a black plinth, seen straight on: the screen shows a list of search results drawn as black and grey bars, the first result highlighted with a thick black outline and a small « 1 » badge. Next to the phone, a small white card floats with a bold black line chart rising to the right. Soft key light from the upper left.

Format: 3:4 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, any colour.
```

## Vraies images à fournir (pas d'IA)

- **`studio-portrait.png`** — Portrait du fondateur du studio (format 4:5). Vraie photo à fournir (pas d'IA) : un portrait de toi, de face ou de trois quarts, lumière naturelle, fond uni clair. Format vertical 4:5, au moins 1200 px de large.
- **`mm-conseiller.png`** — Le conseiller virtuel qui répond aux questions, sur téléphone (format 3:4). Capture d'écran réelle : le conseiller virtuel de mm-fragrances.fr ouvert sur téléphone (390 × 844), avec une question et sa réponse.
