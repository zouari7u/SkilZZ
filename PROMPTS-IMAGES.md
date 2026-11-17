# Prompts des images du site

Ce fichier est réécrit par `tools/build_pages.py` à partir de `tools/images_prompts.py` (modifier les prompts là-bas). Il contient toutes les images générées du site (33), regroupées par style.

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

---

# Style B — rendu produit 3D (17 images)

## 1. Un site vitrine affiché sur un ordinateur portable → `col-site.png`

*Style B — rendu produit 3D · format Gemini **4:3** · pages : index · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, written plainly (never inside quotation marks or guillemets), large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: An open laptop in three-quarter front view, standing on a low rounded ice-blue pedestal. The screen shows a finished showcase website for a local bakery-café: a wide hero photo area filled with a soft abstract royal-blue and azure composition of overlapping circles, the large headline Bienvenue in navy, one royal-blue pill button Réserver, and below it a row of three rounded cards with small blue illustrations. A small white ceramic cup and a closed navy notebook sit next to the laptop, slightly out of focus. Laptop occupies about 70 % of the width, centred.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 2. Deux écrans d'une application de réservation sur téléphone → `col-app.png`

*Style B — rendu produit 3D · format Gemini **4:3** · pages : index · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, written plainly (never inside quotation marks or guillemets), large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: Two modern smartphones standing upright side by side on an ice-blue surface, slightly turned toward each other, the left one a little in front. Left screen: a booking app home with a horizontal calendar strip, three rounded time-slot chips, the middle one filled royal blue, and a large button Réserver. Right screen: a confirmation screen with a big white check mark inside a royal-blue circle, the word Confirmé and a summary card. A soft white geometric block behind them adds depth.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 3. Un tableau de bord de logiciel en ligne sur un grand écran → `col-saas.png`

*Style B — rendu produit 3D · format Gemini **4:3** · pages : index · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, written plainly (never inside quotation marks or guillemets), large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: A large thin-bezel desktop monitor on a slim aluminium stand, front three-quarter view, on a white desk surface against the ice-blue backdrop. The screen shows a polished SaaS dashboard in light mode: a navy left sidebar with simple icons, four KPI cards on top (one shows +24 % in royal blue), a smooth royal-blue line chart with a pale azure area beneath, and a tidy table with small status pills. A wireless keyboard in front, slightly blurred.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 4. Deux pistes comparées côte à côte : un logiciel existant et un outil sur mesure → `conseil-solutions.png`

*Style B — rendu produit 3D · format Gemini **16:9** · pages : conseil · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, written plainly (never inside quotation marks or guillemets), large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: Two laptops side by side on a long ice-blue pedestal, a thin vertical white divider panel between them. Left laptop: a generic off-the-shelf software screen crowded with grey menus, tabs and tiny icons. Right laptop: a simple custom app with only three large rounded royal-blue cards and a clear button Valider. In front of each laptop, a small white card with three bars and a check mark, like a comparison sheet.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 5. La bascule : les données d'un tableur passent dans le nouvel outil → `conseil-transition.png`

*Style B — rendu produit 3D · format Gemini **16:9** · pages : conseil · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, written plainly (never inside quotation marks or guillemets), large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: On the left, a laptop showing a dense grey spreadsheet; on the right, a laptop and a phone showing the same data in a clean custom app with royal-blue cards. Between them, a gentle stream of small rounded white and azure tiles (data rows) floats along a thin curved dotted path from left to right, getting more organised as it travels. Ice-blue set, soft shadows.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 6. De la maquette en gris au site final, sur ordinateur et téléphone → `site-maquettes.png`

*Style B — rendu produit 3D · format Gemini **16:9** · pages : services, site-web · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, written plainly (never inside quotation marks or guillemets), large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: Three stages of the same web page, left to right, on three floating panels at different depths: a grey wireframe of boxes, then a coloured design mock-up in navy, royal blue and white, then the finished page on a laptop with a phone beside it showing the mobile version, headline Bienvenue. A thin dotted line connects the three stages. Airy, ice-blue set.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 7. Un site vu sur téléphone, avec le menu ouvert → `site-mobile.png`

*Style B — rendu produit 3D · format Gemini **3:4** · pages : index, site-web · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, written plainly (never inside quotation marks or guillemets), large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: A smartphone seen straight on, standing on an ice-blue pedestal, showing a mobile website with a rounded navigation sheet opened from the bottom: four menu rows with small icons and a large royal-blue button Contact. The page behind the sheet is softly dimmed. A finger-shaped soft shadow suggests a tap.

Format: 3:4 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 8. L'écran d'administration où l'on change un texte et une photo → `site-admin.png`

*Style B — rendu produit 3D · format Gemini **16:9** · pages : site-web · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, written plainly (never inside quotation marks or guillemets), large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: A laptop in three-quarter view showing a simple, friendly content editor: a list of pages on the left, a form in the centre with a title field, an image upload box with a thumbnail, a price field, and a royal-blue toggle labelled Publier. A small floating card next to the laptop shows Enregistré with a check mark. Ice-blue set.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 9. Une fiche produit de boutique en ligne avec le bouton d'achat → `site-boutique.png`

*Style B — rendu produit 3D · format Gemini **4:3** · pages : index, site-web · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, written plainly (never inside quotation marks or guillemets), large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: A laptop and a phone showing the same online shop product page: a large product photo of an elegant glass bottle on a pale blue background, a price, size chips and a big royal-blue button Ajouter au panier. The phone leans against a rounded white block in front of the laptop. Ice-blue set.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 10. Le parcours d'une application : cinq écrans reliés par des flèches → `app-prototype.png`

*Style B — rendu produit 3D · format Gemini **16:9** · pages : application-mobile · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, written plainly (never inside quotation marks or guillemets), large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: Five smartphone screens floating in a gentle wave from left to right on an ice-blue canvas, linked by thin curved navy arrows like a clickable prototype: welcome, sign-up, home, detail, confirmation. Rounded cards and royal-blue buttons; the welcome screen says Bonjour. Soft shadows under each screen.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 11. L'écran d'accueil de l'application, entouré de deux cartes → `app-main.png`

*Style B — rendu produit 3D · format Gemini **3:4** · pages : application-mobile, index · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, written plainly (never inside quotation marks or guillemets), large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: A smartphone slightly tilted, standing on an ice-blue pedestal, showing an app home: a greeting Bonjour Léa, a large royal-blue card with a white progress ring at 72 %, and two smaller cards below. Two rounded white cards float around the phone at different depths: a reminder card with a small blue dot and a progress card with a ring.

Format: 3:4 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 12. L'écran verrouillé d'un téléphone avec les notifications de l'application → `app-notif.png`

*Style B — rendu produit 3D · format Gemini **3:4** · pages : application-mobile · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, written plainly (never inside quotation marks or guillemets), large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: A smartphone lock screen seen straight on: a large clock 9:41, a soft abstract blue wallpaper of overlapping circles, and three stacked rounded notification cards from the same app, each with a small royal-blue round icon. The phone rests on an ice-blue pedestal.

Format: 3:4 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 13. L'icône de l'application sur l'écran d'accueil d'un téléphone → `app-icone.png`

*Style B — rendu produit 3D · format Gemini **4:3** · pages : application-mobile · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, written plainly (never inside quotation marks or guillemets), large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: Close-up, slightly angled, of a smartphone home screen grid of app icons, all in muted light greys, except one glossy royal-blue rounded icon with a simple white geometric symbol, raised above the screen with a soft shadow as if it has just been installed. Shallow depth of field on the other icons.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 14. Le tableau de bord d'un logiciel en ligne, avec graphiques et indicateurs → `saas-dashboard.png`

*Style B — rendu produit 3D · format Gemini **16:9** · pages : saas · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, written plainly (never inside quotation marks or guillemets), large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: A wide browser window floating in three-quarter view above an ice-blue set, showing a polished SaaS dashboard: left sidebar, a header with a search field, four KPI cards, a bar chart and a line chart in royal blue and azure, and a recent activity list. Title Tableau de bord. A second smaller window peeks from behind, slightly blurred.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 15. Les trois étapes d'inscription d'un logiciel en ligne → `saas-onboarding.png`

*Style B — rendu produit 3D · format Gemini **16:9** · pages : index, saas · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, written plainly (never inside quotation marks or guillemets), large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: Three browser windows overlapping diagonally like cards in a hand, showing the steps of an onboarding: Créer un compte with two fields, Choisir une offre with three plan cards (the middle one in royal blue), Inviter l'équipe with round avatars as plain coloured circles. Ice-blue set, soft shadows.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 16. La gestion des accès : chaque membre de l'équipe a son rôle → `saas-roles.png`

*Style B — rendu produit 3D · format Gemini **4:3** · pages : saas · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, written plainly (never inside quotation marks or guillemets), large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: A browser window showing a team settings table: rows with round avatars (plain blue circles, no faces), names as grey lines, and a role pill on each row Admin, Éditeur, Lecteur in different blues, plus a royal-blue button Inviter. A small floating permission card with a toggle sits in front.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 17. Le même logiciel, sur téléphone → `saas-mobile.png`

*Style B — rendu produit 3D · format Gemini **3:4** · pages : index, saas · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices (no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye level or slight three-quarter view, very shallow depth of field on the background only, soft ambient occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. On-screen text: only the few short French words given in the scene, written plainly (never inside quotation marks or guillemets), large and perfectly spelled; every other line of text is a soft grey placeholder line, never fake gibberish words.

Scene: A smartphone on an ice-blue pedestal showing the mobile version of a SaaS dashboard: a stacked column of KPI cards, a compact royal-blue line chart, a bottom tab bar. Behind it, out of focus, a laptop shows the same dashboard, to suggest the same product on every screen.

Format: 3:4 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

---

# Style A — illustration éditoriale (7 images)

## 18. Une planche d'identité visuelle : logo, couleurs, typographie → `col-marque.png`

*Style A — illustration éditoriale · format Gemini **4:3** · pages : services · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: refined editorial vector illustration, like the illustrations of a premium software brand. Flat shapes built in layers with real depth: each object has two or three tones of the same blue, soft long shadows at low opacity, gentle ambient occlusion where objects touch. Matte finish, perfectly clean edges, no outlines, no texture, no gradient backgrounds. Objects have believable proportions and are arranged with care, like a styled flat-lay photographed from above. Any writing is drawn as soft rounded lines, never readable letters.

Scene: A carefully styled flat-lay seen from directly above on an ice-blue desk: a large round logo mark made of simple geometric shapes, a fan of four colour swatch cards (navy, royal blue, azure, white), a big type specimen card with a bold Aa drawn as clean shapes, two stacked business cards, a closed notebook with an elastic band, and a pencil, all aligned on an invisible grid with even spacing.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 19. L'état des lieux : les tâches d'une journée de travail posées sur la table → `conseil-etat-des-lieux.png`

*Style A — illustration éditoriale · format Gemini **4:3** · pages : conseil · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: refined editorial vector illustration, like the illustrations of a premium software brand. Flat shapes built in layers with real depth: each object has two or three tones of the same blue, soft long shadows at low opacity, gentle ambient occlusion where objects touch. Matte finish, perfectly clean edges, no outlines, no texture, no gradient backgrounds. Objects have believable proportions and are arranged with care, like a styled flat-lay photographed from above. Any writing is drawn as soft rounded lines, never readable letters.

Scene: A top-down view of a work table during an audit session: printed spreadsheets with dense grey grids, sticky notes in two blues grouped into three neat columns, a large sheet with a hand-drawn flow of boxes and arrows, an open laptop showing a cluttered spreadsheet, a pen and a white cup. Calm and organised, even spacing, ice-blue table.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 20. La prise en main : l'outil montré à l'équipe sur un grand écran → `conseil-equipe.png`

*Style A — illustration éditoriale · format Gemini **4:3** · pages : conseil · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: refined editorial vector illustration, like the illustrations of a premium software brand. Flat shapes built in layers with real depth: each object has two or three tones of the same blue, soft long shadows at low opacity, gentle ambient occlusion where objects touch. Matte finish, perfectly clean edges, no outlines, no texture, no gradient backgrounds. Objects have believable proportions and are arranged with care, like a styled flat-lay photographed from above. Any writing is drawn as soft rounded lines, never readable letters.

Scene: A small bright meeting room seen from behind the team: a large wall screen shows a simple custom app dashboard in royal blue; three people seen from behind as simple flat silhouettes in navy and blue clothes (no faces), one standing and pointing at the screen, two seated with laptops open on a white table. A plant with a blue pot in the corner. Ice-blue walls, calm and friendly.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 21. Le premier échange : un carnet, des notes et un appel en visio → `methode-ecouter.png`

*Style A — illustration éditoriale · format Gemini **4:3** · pages : methode · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: refined editorial vector illustration, like the illustrations of a premium software brand. Flat shapes built in layers with real depth: each object has two or three tones of the same blue, soft long shadows at low opacity, gentle ambient occlusion where objects touch. Matte finish, perfectly clean edges, no outlines, no texture, no gradient backgrounds. Objects have believable proportions and are arranged with care, like a styled flat-lay photographed from above. Any writing is drawn as soft rounded lines, never readable letters.

Scene: A flat-lay of a first project meeting seen from above: an open notebook with simple sketches of boxes and arrows, a laptop showing a video call with two plain circular avatars, a white cup of coffee, a pen and two sticky notes, on an ice-blue desk. Warm, welcoming, tidy.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 22. Le prototype testé sur un téléphone, à côté des maquettes → `methode-concevoir.png`

*Style A — illustration éditoriale · format Gemini **4:3** · pages : methode · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: refined editorial vector illustration, like the illustrations of a premium software brand. Flat shapes built in layers with real depth: each object has two or three tones of the same blue, soft long shadows at low opacity, gentle ambient occlusion where objects touch. Matte finish, perfectly clean edges, no outlines, no texture, no gradient backgrounds. Objects have believable proportions and are arranged with care, like a styled flat-lay photographed from above. Any writing is drawn as soft rounded lines, never readable letters.

Scene: A desk seen from above with printed screen mock-ups pinned around, and in the centre a simplified flat hand in a navy sleeve holding a smartphone running the prototype, a finger about to tap a royal-blue button. Navy, blues and white.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 23. Après la mise en ligne : le suivi et les nouvelles fonctions → `methode-grandir.png`

*Style A — illustration éditoriale · format Gemini **4:3** · pages : methode · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: refined editorial vector illustration, like the illustrations of a premium software brand. Flat shapes built in layers with real depth: each object has two or three tones of the same blue, soft long shadows at low opacity, gentle ambient occlusion where objects touch. Matte finish, perfectly clean edges, no outlines, no texture, no gradient backgrounds. Objects have believable proportions and are arranged with care, like a styled flat-lay photographed from above. Any writing is drawn as soft rounded lines, never readable letters.

Scene: A laptop showing an analytics chart going up in royal blue, next to a small checklist card with three ticked items and one new item being added, and a phone showing a new post ready to publish. Two small plants in blue pots. Ice-blue desk, seen from slightly above.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 24. Le bureau du studio : ordinateur, croquis et téléphone de test → `studio-bureau.png`

*Style A — illustration éditoriale · format Gemini **4:3** · pages : index, studio · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Style: refined editorial vector illustration, like the illustrations of a premium software brand. Flat shapes built in layers with real depth: each object has two or three tones of the same blue, soft long shadows at low opacity, gentle ambient occlusion where objects touch. Matte finish, perfectly clean edges, no outlines, no texture, no gradient backgrounds. Objects have believable proportions and are arranged with care, like a styled flat-lay photographed from above. Any writing is drawn as soft rounded lines, never readable letters.

Scene: A tidy studio desk seen from above: a laptop with code drawn as coloured lines, an open sketchbook with a kingfisher doodle in navy ink, a phone used for testing, a fan of blue colour swatches, two pens, and a plant in a blue pot. Ice-blue desk, everything aligned with even spacing.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

---

# Style C — le martin-pêcheur (5 images)

## 25. Le martin-pêcheur posé sur l'écran d'un ordinateur portable qui affiche un site → `svc-site.png`

*Style C — le martin-pêcheur · format Gemini **16:9** · pages : 404, application-mobile, conseil, realisations, reseaux-sociaux, saas, services, site-web · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Main character: the ZkilZ kingfisher, exactly as in the attached logo and reference sheet. A compact kingfisher with a large rounded royal-blue crown (#2F7BFF to #1F5FD6), a light-azure cheek patch, a white throat with a light-azure collar band, a long straight dagger-shaped navy beak, a round black eye with one white highlight and a small white spot in front of it, a deep-blue wing (#1E5CC8 to #174CA8) with a darker navy lower edge and a few small light-azure spots, a bright azure stripe down the back, a short blue tail, small navy feet. Only blues and white on the bird. Calm, precise, focused expression. Same proportions in every image.

Style: the same flat vector style as the attached ZkilZ logo (a kingfisher inside a circle): clean geometric shapes, smooth soft gradients inside each shape, small light-azure spots on the wing, a few stylised leaves. The scene around the bird is a refined editorial illustration with layered depth, soft long shadows at low opacity, matte finish, no outlines, no texture. Any writing is drawn as soft rounded lines, never readable letters.

Scene: The kingfisher is perched on the top edge of an open laptop, leaning forward and looking down at the screen with interest. The screen shows a clean showcase website: a big blue hero shape and three rounded cards. Around the laptop, three small rounded interface cards float at different depths (an image card, a text card, a toggle), casting soft shadows. Flat ice-blue background (#E1EBFF) with one large pale circle behind the scene. Wide composition: laptop and bird in the right half, calm empty space on the left.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 26. Le martin-pêcheur à côté d'un téléphone qui affiche une application → `svc-app.png`

*Style C — le martin-pêcheur · format Gemini **16:9** · pages : 404, application-mobile, conseil, realisations, reseaux-sociaux, saas, services, site-web · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Main character: the ZkilZ kingfisher, exactly as in the attached logo and reference sheet. A compact kingfisher with a large rounded royal-blue crown (#2F7BFF to #1F5FD6), a light-azure cheek patch, a white throat with a light-azure collar band, a long straight dagger-shaped navy beak, a round black eye with one white highlight and a small white spot in front of it, a deep-blue wing (#1E5CC8 to #174CA8) with a darker navy lower edge and a few small light-azure spots, a bright azure stripe down the back, a short blue tail, small navy feet. Only blues and white on the bird. Calm, precise, focused expression. Same proportions in every image.

Style: the same flat vector style as the attached ZkilZ logo (a kingfisher inside a circle): clean geometric shapes, smooth soft gradients inside each shape, small light-azure spots on the wing, a few stylised leaves. The scene around the bird is a refined editorial illustration with layered depth, soft long shadows at low opacity, matte finish, no outlines, no texture. Any writing is drawn as soft rounded lines, never readable letters.

Scene: The kingfisher stands on a small rounded block next to a smartphone that is as tall as it is, touching the screen with the tip of one wing as if tapping a button. The screen shows a simple app home: rounded cards, a progress ring and a royal-blue tab bar. A few stylised blue leaves at the base. Flat ice-blue background with one large pale circle. Wide composition, subject in the right half, empty space on the left.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 27. Le martin-pêcheur devant un tableau de bord avec des graphiques → `svc-saas.png`

*Style C — le martin-pêcheur · format Gemini **16:9** · pages : 404, application-mobile, conseil, realisations, reseaux-sociaux, saas, services, site-web · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Main character: the ZkilZ kingfisher, exactly as in the attached logo and reference sheet. A compact kingfisher with a large rounded royal-blue crown (#2F7BFF to #1F5FD6), a light-azure cheek patch, a white throat with a light-azure collar band, a long straight dagger-shaped navy beak, a round black eye with one white highlight and a small white spot in front of it, a deep-blue wing (#1E5CC8 to #174CA8) with a darker navy lower edge and a few small light-azure spots, a bright azure stripe down the back, a short blue tail, small navy feet. Only blues and white on the bird. Calm, precise, focused expression. Same proportions in every image.

Style: the same flat vector style as the attached ZkilZ logo (a kingfisher inside a circle): clean geometric shapes, smooth soft gradients inside each shape, small light-azure spots on the wing, a few stylised leaves. The scene around the bird is a refined editorial illustration with layered depth, soft long shadows at low opacity, matte finish, no outlines, no texture. Any writing is drawn as soft rounded lines, never readable letters.

Scene: The kingfisher is perched on the top corner of a large floating dashboard panel, looking at a rising royal-blue line chart with a small glowing dot at its highest point. Three KPI cards and two small round charts float around like a tidy workspace, at different depths with soft shadows. Flat ice-blue background with one large pale circle. Wide composition, subject in the right half, empty space on the left.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 28. Le martin-pêcheur penché sur un plan de travail, entre l'ancien tableur et le nouvel outil → `svc-conseil.png`

*Style C — le martin-pêcheur · format Gemini **16:9** · pages : 404, application-mobile, conseil, realisations, reseaux-sociaux, saas, services, site-web · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Main character: the ZkilZ kingfisher, exactly as in the attached logo and reference sheet. A compact kingfisher with a large rounded royal-blue crown (#2F7BFF to #1F5FD6), a light-azure cheek patch, a white throat with a light-azure collar band, a long straight dagger-shaped navy beak, a round black eye with one white highlight and a small white spot in front of it, a deep-blue wing (#1E5CC8 to #174CA8) with a darker navy lower edge and a few small light-azure spots, a bright azure stripe down the back, a short blue tail, small navy feet. Only blues and white on the bird. Calm, precise, focused expression. Same proportions in every image.

Style: the same flat vector style as the attached ZkilZ logo (a kingfisher inside a circle): clean geometric shapes, smooth soft gradients inside each shape, small light-azure spots on the wing, a few stylised leaves. The scene around the bird is a refined editorial illustration with layered depth, soft long shadows at low opacity, matte finish, no outlines, no texture. Any writing is drawn as soft rounded lines, never readable letters.

Scene: On a clean desk, two screens side by side: on the left an old cluttered spreadsheet drawn as a dense grey grid with a few highlighted cells, on the right a clean custom app with three rounded royal-blue cards. A thin dotted arrow curves from the spreadsheet to the app, and the kingfisher stands between them, pointing its beak along the arrow. Flat ice-blue background with one large pale circle. Wide composition, subject in the right half, empty space on the left.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

## 29. Le martin-pêcheur posé sur un roseau, au-dessus d'un lac calme au lever du jour → `studio-lac.png`

*Style C — le martin-pêcheur · format Gemini **21:9** · pages : studio · déjà en ligne, à refaire en mieux*

```text
Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.

Main character: the ZkilZ kingfisher, exactly as in the attached logo and reference sheet. A compact kingfisher with a large rounded royal-blue crown (#2F7BFF to #1F5FD6), a light-azure cheek patch, a white throat with a light-azure collar band, a long straight dagger-shaped navy beak, a round black eye with one white highlight and a small white spot in front of it, a deep-blue wing (#1E5CC8 to #174CA8) with a darker navy lower edge and a few small light-azure spots, a bright azure stripe down the back, a short blue tail, small navy feet. Only blues and white on the bird. Calm, precise, focused expression. Same proportions in every image.

Style: the same flat vector style as the attached ZkilZ logo (a kingfisher inside a circle): clean geometric shapes, smooth soft gradients inside each shape, small light-azure spots on the wing, a few stylised leaves. The scene around the bird is a refined editorial illustration with layered depth, soft long shadows at low opacity, matte finish, no outlines, no texture. Any writing is drawn as soft rounded lines, never readable letters.

Scene: A panoramic landscape at sunrise in shades of blue only: layered navy hills in the distance, a pale white sun low on the horizon with a soft halo, a pale blue sky, ice-blue water with a few horizontal ripple lines and the reflection of the hills. On the right third, the kingfisher is perched on a single reed just above the water, looking far ahead into the light. Lots of open sky on the left. Very calm.

Format: 21:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside the palette.
```

---

# Style D — Studio Moumous, noir et blanc (4 images)

## 30. Trois téléphones qui affichent des contenus de réseaux sociaux, en noir et blanc → `moumous-hero.png`

*Style D — Studio Moumous, noir et blanc · format Gemini **16:9** · pages : reseaux-sociaux, services, site-web, studio · manque encore*

*En attendant : l'image `svc-reseaux` tient la place.*

```text
Art direction for Studio Moumous, a content and marketing studio: strictly black, white and greys, no colour at all. Style: high-end black-and-white editorial studio photography (or a photoreal 3D render that looks like it), seamless light-grey backdrop (#F2F2F2), one large soft key light with crisp but soft shadows, strong graphic composition, deep blacks and clean whites, like a fashion or design magazine still life. Generic objects only: no real brand, no real logo. On-screen or printed text: only the few short French words given in the scene, perfectly spelled; everything else is solid black or grey bars. No kingfisher, no blue.

Scene: Three smartphones standing in a gentle arc on a low matte black plinth, each showing a different vertical social media frame: a bold typographic quote card with the word Nouveau in heavy black type, a high-contrast black-and-white product photo of a perfume bottle, a profile grid of nine squares. Large soft key light from the left, long soft shadows to the right. Wide composition with space on the left.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, any colour.
```

## 31. Le storyboard d'un reel, en noir et blanc → `moumous-reseaux.png`

*Style D — Studio Moumous, noir et blanc · format Gemini **16:9** · pages : reseaux-sociaux · manque encore*

*En attendant : l'image `reseaux-storyboard` tient la place.*

```text
Art direction for Studio Moumous, a content and marketing studio: strictly black, white and greys, no colour at all. Style: high-end black-and-white editorial studio photography (or a photoreal 3D render that looks like it), seamless light-grey backdrop (#F2F2F2), one large soft key light with crisp but soft shadows, strong graphic composition, deep blacks and clean whites, like a fashion or design magazine still life. Generic objects only: no real brand, no real logo. On-screen or printed text: only the few short French words given in the scene, perfectly spelled; everything else is solid black or grey bars. No kingfisher, no blue.

Scene: A storyboard sheet lying on a light-grey desk, seen from above at a slight angle: six vertical frames in two rows, each a bold black-and-white composition (product appears, close-up, text card drawn as bars, logo reveal), small hand-drawn arrows between frames, a thick black marker and a few loose paper strips next to the sheet. Crisp shadows from a single soft light.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, any colour.
```

## 32. Une planche d'identité visuelle : logo, typographies et papeterie, en noir et blanc → `moumous-identite.png`

*Style D — Studio Moumous, noir et blanc · format Gemini **4:3** · pages : reseaux-sociaux · manque encore*

*En attendant : l'image `reseaux-charte` tient la place.*

```text
Art direction for Studio Moumous, a content and marketing studio: strictly black, white and greys, no colour at all. Style: high-end black-and-white editorial studio photography (or a photoreal 3D render that looks like it), seamless light-grey backdrop (#F2F2F2), one large soft key light with crisp but soft shadows, strong graphic composition, deep blacks and clean whites, like a fashion or design magazine still life. Generic objects only: no real brand, no real logo. On-screen or printed text: only the few short French words given in the scene, perfectly spelled; everything else is solid black or grey bars. No kingfisher, no blue.

Scene: A flat-lay brand identity board on a light-grey surface, seen from directly above: a bold abstract monogram logo printed large on a black card, black, white and grey swatches in even steps, a type specimen card with a huge Aa, a business card, an envelope and a black notebook, all perfectly aligned on a grid with crisp shadows.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, any colour.
```

## 33. Une page de résultats de recherche avec une courbe de visites qui monte, en noir et blanc → `moumous-referencement.png`

*Style D — Studio Moumous, noir et blanc · format Gemini **3:4** · pages : reseaux-sociaux · manque encore*

*En attendant : l'image `col-grille` tient la place.*

```text
Art direction for Studio Moumous, a content and marketing studio: strictly black, white and greys, no colour at all. Style: high-end black-and-white editorial studio photography (or a photoreal 3D render that looks like it), seamless light-grey backdrop (#F2F2F2), one large soft key light with crisp but soft shadows, strong graphic composition, deep blacks and clean whites, like a fashion or design magazine still life. Generic objects only: no real brand, no real logo. On-screen or printed text: only the few short French words given in the scene, perfectly spelled; everything else is solid black or grey bars. No kingfisher, no blue.

Scene: A smartphone standing upright on a black plinth, seen straight on: the screen shows a list of search results drawn as black and grey bars, the first result highlighted with a thick black outline and a small 1 badge. Next to the phone, a small white card floats with a bold black line chart rising to the right. Soft key light from the upper left.

Format: 3:4 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, any colour.
```

---

# Vraies images à fournir (pas d'IA)

- **`studio-portrait.png`** — Portrait du fondateur du studio (format 4:5). Vraie photo à fournir (pas d'IA) : un portrait de toi, de face ou de trois quarts, lumière naturelle, fond uni clair. Format vertical 4:5, au moins 1200 px de large.
- **`mm-catalogue.png`** — Le catalogue de MM Fragrances sur ordinateur (format 16:10). Capture d'écran réelle : la page catalogue / collection de mm-fragrances.fr, sur ordinateur (fenêtre de 1440 × 900), en mode sombre, sans barre d'adresse. *(déjà fournie)*
- **`mm-quiz.png`** — Le quiz qui aide à trouver son parfum (format 16:10). Capture d'écran réelle : le quiz trouver son parfum de mm-fragrances.fr, sur ordinateur, une question affichée avec ses réponses. *(déjà fournie)*
- **`mm-flacon.png`** — Un flacon en 3D sur la fiche produit (format 16:10). Capture d'écran réelle : une fiche produit de mm-fragrances.fr sur ordinateur, avec le flacon en 3D bien visible. *(déjà fournie)*
- **`mm-conseiller.png`** — Le conseiller virtuel qui répond aux questions, sur téléphone (format 3:4). Capture d'écran réelle : le conseiller virtuel de mm-fragrances.fr ouvert sur téléphone (390 × 844), avec une question et sa réponse.
