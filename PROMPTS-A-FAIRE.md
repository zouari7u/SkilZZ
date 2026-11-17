# Images à faire

Ce fichier ne liste que les images qui manquent encore (4 à générer, 2 vraies à fournir). Pour refaire toutes les images du site en mieux : `PROMPTS-IMAGES.md`.

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

## 1. Trois téléphones qui affichent des contenus de réseaux sociaux, en noir et blanc → `moumous-hero.png`

*Style D — Studio Moumous, noir et blanc · format Gemini **16:9** · pages : reseaux-sociaux, services, site-web, studio · manque encore*

*En attendant : l'image `svc-reseaux` tient la place.*

```text
Art direction for Studio Moumous, a content and marketing studio: strictly black, white and greys, no colour at all. Style: high-end black-and-white editorial studio photography (or a photoreal 3D render that looks like it), seamless light-grey backdrop (#F2F2F2), one large soft key light with crisp but soft shadows, strong graphic composition, deep blacks and clean whites, like a fashion or design magazine still life. Generic objects only: no real brand, no real logo. On-screen or printed text: only the few short French words given in the scene, perfectly spelled; everything else is solid black or grey bars. No kingfisher, no blue.

Scene: Three smartphones standing in a gentle arc on a low matte black plinth, each showing a different vertical social media frame: a bold typographic quote card with the word Nouveau in heavy black type, a high-contrast black-and-white product photo of a perfume bottle, a profile grid of nine squares. Large soft key light from the left, long soft shadows to the right. Wide composition with space on the left.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, any colour.
```

## 2. Le storyboard d'un reel, en noir et blanc → `moumous-reseaux.png`

*Style D — Studio Moumous, noir et blanc · format Gemini **16:9** · pages : reseaux-sociaux · manque encore*

*En attendant : l'image `reseaux-storyboard` tient la place.*

```text
Art direction for Studio Moumous, a content and marketing studio: strictly black, white and greys, no colour at all. Style: high-end black-and-white editorial studio photography (or a photoreal 3D render that looks like it), seamless light-grey backdrop (#F2F2F2), one large soft key light with crisp but soft shadows, strong graphic composition, deep blacks and clean whites, like a fashion or design magazine still life. Generic objects only: no real brand, no real logo. On-screen or printed text: only the few short French words given in the scene, perfectly spelled; everything else is solid black or grey bars. No kingfisher, no blue.

Scene: A storyboard sheet lying on a light-grey desk, seen from above at a slight angle: six vertical frames in two rows, each a bold black-and-white composition (product appears, close-up, text card drawn as bars, logo reveal), small hand-drawn arrows between frames, a thick black marker and a few loose paper strips next to the sheet. Crisp shadows from a single soft light.

Format: 16:9 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, any colour.
```

## 3. Une planche d'identité visuelle : logo, typographies et papeterie, en noir et blanc → `moumous-identite.png`

*Style D — Studio Moumous, noir et blanc · format Gemini **4:3** · pages : reseaux-sociaux · manque encore*

*En attendant : l'image `reseaux-charte` tient la place.*

```text
Art direction for Studio Moumous, a content and marketing studio: strictly black, white and greys, no colour at all. Style: high-end black-and-white editorial studio photography (or a photoreal 3D render that looks like it), seamless light-grey backdrop (#F2F2F2), one large soft key light with crisp but soft shadows, strong graphic composition, deep blacks and clean whites, like a fashion or design magazine still life. Generic objects only: no real brand, no real logo. On-screen or printed text: only the few short French words given in the scene, perfectly spelled; everything else is solid black or grey bars. No kingfisher, no blue.

Scene: A flat-lay brand identity board on a light-grey surface, seen from directly above: a bold abstract monogram logo printed large on a black card, black, white and grey swatches in even steps, a type specimen card with a huge Aa, a business card, an envelope and a black notebook, all perfectly aligned on a grid with crisp shadows.

Format: 4:3 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, any colour.
```

## 4. Une page de résultats de recherche avec une courbe de visites qui monte, en noir et blanc → `moumous-referencement.png`

*Style D — Studio Moumous, noir et blanc · format Gemini **3:4** · pages : reseaux-sociaux · manque encore*

*En attendant : l'image `col-grille` tient la place.*

```text
Art direction for Studio Moumous, a content and marketing studio: strictly black, white and greys, no colour at all. Style: high-end black-and-white editorial studio photography (or a photoreal 3D render that looks like it), seamless light-grey backdrop (#F2F2F2), one large soft key light with crisp but soft shadows, strong graphic composition, deep blacks and clean whites, like a fashion or design magazine still life. Generic objects only: no real brand, no real logo. On-screen or printed text: only the few short French words given in the scene, perfectly spelled; everything else is solid black or grey bars. No kingfisher, no blue.

Scene: A smartphone standing upright on a black plinth, seen straight on: the screen shows a list of search results drawn as black and grey bars, the first result highlighted with a thick black outline and a small 1 badge. Next to the phone, a small white card floats with a bold black line chart rising to the right. Soft key light from the upper left.

Format: 3:4 aspect ratio, high resolution (2K or more), the whole subject inside the frame with a comfortable margin.

Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, any colour.
```

## Vraies images à fournir (pas d'IA)

- **`studio-portrait.png`** — Portrait du fondateur du studio (format 4:5). Vraie photo à fournir (pas d'IA) : un portrait de toi, de face ou de trois quarts, lumière naturelle, fond uni clair. Format vertical 4:5, au moins 1200 px de large.
- **`mm-conseiller.png`** — Le conseiller virtuel qui répond aux questions, sur téléphone (format 3:4). Capture d'écran réelle : le conseiller virtuel de mm-fragrances.fr ouvert sur téléphone (390 × 844), avec une question et sa réponse.
