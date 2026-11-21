# Prompts IA — le martin-pêcheur de ZkilZ

La mascotte est un **martin-pêcheur**, en **bleu et blanc uniquement**, dessiné comme **ton logo**. Il dit trois choses : l'**ascension** (partir d'un roseau au ras de l'eau et monter tout en haut), la **précision** (il vise avant de plonger) et la **technique** (le geste juste, sans éclaboussure).

Ces images servent à **l'assistant** en bas à droite (n° 2 à 5, détectées toutes seules dès qu'elles sont dans `assets/img/mascotte/`), aux **moments forts** du site (plongeon, envol, n° 6 et 7), aux **cartes des services** de l'accueil (n° 8 et 9) et à **l'oiseau animé** qui vole de section en section (planches n° 10 et 11).

Les images des pages (écrans, scènes, Studio Moumous) sont dans **`PROMPTS-IMAGES.md`**.

## Quel modèle, et comment

- **Nano Banana Pro** (Gemini 3 Pro Image) dans Gemini, « Créer des images », modèle **Pro** s'il est proposé ; sinon **Nano Banana 2.1**. Ce sont les meilleurs de Google pour garder le même personnage d'une image à l'autre.
- **Une seule conversation** pour toute la mascotte. Au premier message, **joins ton logo en PNG** ; à partir de la n° 2, joins aussi la planche n° 1.
- **Chaque prompt est complet** : colle-le tel quel (fiche du personnage, scène, rendu, à éviter). Règle le format indiqué.
- **Retouche dans la même conversation**, un détail à la fois : « Garde tout, mais le bec plus long ».

**Pourquoi le fond vert :** c'est la seule couleur absente de l'oiseau, donc `tools/detourer.py` le découpe sans liseré. **Pourquoi ni eau ni éclaboussure :** ce sont des éléments transparents, impossibles à détourer proprement ; le site les dessine lui-même.

## Après chaque image

1. Enregistre-la en PNG avec le **nom indiqué** (par exemple `agent-avatar.png`).
2. Détoure-la :

   ```bash
   python3 tools/detourer.py agent-avatar.png --out assets/img/mascotte
   ```

3. Commite et pousse le `.webp` obtenu. L'assistant (n° 2 à 5) et les images n° 6 à 9 le prennent tout de suite (même nom) ; pour les planches n° 10 et 11, préviens-moi et je refais l'oiseau animé.

---

## 1. Planche de référence → `kf-planche.png`

Sert de référence à toutes les autres images : génère-la en premier, puis joins-la (avec le logo) à chaque prompt.

```text
Brand mascot: the ZkilZ kingfisher, drawn exactly like the attached ZkilZ logo (a kingfisher perched in a circle) and the attached reference sheet. Flat vector illustration with clean geometric shapes and smooth soft gradients inside each shape, no outlines, no texture, no realistic feathers. A compact kingfisher with a large rounded royal-blue crown (#3B82F6 to #1F5FD6), a light-azure cheek patch under the eye (#A6DDF8), a white throat crossed by a light-azure collar band (#76CDF5), a long straight dagger-shaped navy beak (#1D57B8 to #173F86), a round black eye with one white highlight and a small white spot just in front of it, a deep-blue wing (#2A72E8 to #174CA8) with a darker navy lower edge (#14336E) and ten small light-azure spots (#7FD0F6), a bright azure stripe down the back (#8ADAF8 to #46B4EE), a white breast fading to ice blue, a short blue tail of two feathers, small navy feet. Only blues and white on the bird: no orange, red, yellow or green. Calm, precise, focused expression: a bird that aims before it dives. Same proportions, same colours, same character in every image.

Scene: Character turnaround sheet on one row, same scale, evenly spaced, from left to right: (1) perched in side view facing right, wings folded, feet together on a short branch; (2) perched in three-quarter view turned toward the viewer; (3) flying in side view, both wings raised high above the back; (4) flying in side view, both wings lowered below the body; (5) diving straight down, beak first, wings folded tight against the body.

Format: 16:9 aspect ratio.

Rendering for cut-out: one flat uniform chroma-key green background (#00B140), no gradient, no floor, no cast shadow, no vignette. No water, no splash, no glass, no reflections, no particles, no motion lines, no text, no logo, no watermark, no leaves unless asked. Sharp silhouette with crisp edges, no glow, no motion blur. The whole bird is inside the frame with at least 10 % empty margin on every side. High resolution (2K or more).

Avoid: orange belly, red feet, green feathers, yellow, realistic photo, detailed feathers, 3D render, outline, sketch, water, splash, glass, glow, motion blur, gradient background, white background, floor, cast shadow, text, watermark, extra wings, extra legs, open mouth with teeth, oversized cartoon eyes.
```

## 2. Assistant, avatar → `agent-avatar.png`

La pastille ronde en bas à droite. Le site la découpe en cercle : la tête doit être bien centrée.

```text
Brand mascot: the ZkilZ kingfisher, drawn exactly like the attached ZkilZ logo (a kingfisher perched in a circle) and the attached reference sheet. Flat vector illustration with clean geometric shapes and smooth soft gradients inside each shape, no outlines, no texture, no realistic feathers. A compact kingfisher with a large rounded royal-blue crown (#3B82F6 to #1F5FD6), a light-azure cheek patch under the eye (#A6DDF8), a white throat crossed by a light-azure collar band (#76CDF5), a long straight dagger-shaped navy beak (#1D57B8 to #173F86), a round black eye with one white highlight and a small white spot just in front of it, a deep-blue wing (#2A72E8 to #174CA8) with a darker navy lower edge (#14336E) and ten small light-azure spots (#7FD0F6), a bright azure stripe down the back (#8ADAF8 to #46B4EE), a white breast fading to ice blue, a short blue tail of two feathers, small navy feet. Only blues and white on the bird: no orange, red, yellow or green. Calm, precise, focused expression: a bird that aims before it dives. Same proportions, same colours, same character in every image.

Scene: Head and upper chest only, three-quarter view turned slightly toward the viewer, the long beak pointing to the right, eye looking at the viewer, beak closed, friendly and attentive. The head is centred and fills about 70 % of the frame; crop at mid-chest.

Format: 1:1 aspect ratio.

Rendering for cut-out: one flat uniform chroma-key green background (#00B140), no gradient, no floor, no cast shadow, no vignette. No water, no splash, no glass, no reflections, no particles, no motion lines, no text, no logo, no watermark, no leaves unless asked. Sharp silhouette with crisp edges, no glow, no motion blur. The whole bird is inside the frame with at least 10 % empty margin on every side. High resolution (2K or more).

Avoid: orange belly, red feet, green feathers, yellow, realistic photo, detailed feathers, 3D render, outline, sketch, water, splash, glass, glow, motion blur, gradient background, white background, floor, cast shadow, text, watermark, extra wings, extra legs, open mouth with teeth, oversized cartoon eyes.
```

## 3. Assistant, clin d'œil → `agent-avatar-clin.png`

**La même image que la n° 2, seul l'œil change.** Dans la même conversation, juste après la n° 2, envoie seulement ce texte (pas la fiche) :

```text
Exactly the same image as the previous one: same framing, same pose, same colours, identical everywhere except the eye, which is now closed, drawn as a short curved navy line. Keep the flat chroma-key green background (#00B140).
```

## 4. Assistant, réfléchit → `agent-reflechit.png`

Affiché pendant que l'assistant prépare sa réponse. Même conversation que la n° 2.

```text
Brand mascot: the ZkilZ kingfisher, drawn exactly like the attached ZkilZ logo (a kingfisher perched in a circle) and the attached reference sheet. Flat vector illustration with clean geometric shapes and smooth soft gradients inside each shape, no outlines, no texture, no realistic feathers. A compact kingfisher with a large rounded royal-blue crown (#3B82F6 to #1F5FD6), a light-azure cheek patch under the eye (#A6DDF8), a white throat crossed by a light-azure collar band (#76CDF5), a long straight dagger-shaped navy beak (#1D57B8 to #173F86), a round black eye with one white highlight and a small white spot just in front of it, a deep-blue wing (#2A72E8 to #174CA8) with a darker navy lower edge (#14336E) and ten small light-azure spots (#7FD0F6), a bright azure stripe down the back (#8ADAF8 to #46B4EE), a white breast fading to ice blue, a short blue tail of two feathers, small navy feet. Only blues and white on the bird: no orange, red, yellow or green. Calm, precise, focused expression: a bird that aims before it dives. Same proportions, same colours, same character in every image.

Scene: Exactly the same framing, size and position as the avatar (head and upper chest, three-quarter view, beak pointing right), but the head is tilted up and slightly to the side, the eye looks up, beak closed, thoughtful.

Format: 1:1 aspect ratio.

Rendering for cut-out: one flat uniform chroma-key green background (#00B140), no gradient, no floor, no cast shadow, no vignette. No water, no splash, no glass, no reflections, no particles, no motion lines, no text, no logo, no watermark, no leaves unless asked. Sharp silhouette with crisp edges, no glow, no motion blur. The whole bird is inside the frame with at least 10 % empty margin on every side. High resolution (2K or more).

Avoid: orange belly, red feet, green feathers, yellow, realistic photo, detailed feathers, 3D render, outline, sketch, water, splash, glass, glow, motion blur, gradient background, white background, floor, cast shadow, text, watermark, extra wings, extra legs, open mouth with teeth, oversized cartoon eyes.
```

## 5. Assistant, a trouvé → `agent-idee.png`

Affiché quand une réponse arrive. Même conversation que la n° 2.

```text
Brand mascot: the ZkilZ kingfisher, drawn exactly like the attached ZkilZ logo (a kingfisher perched in a circle) and the attached reference sheet. Flat vector illustration with clean geometric shapes and smooth soft gradients inside each shape, no outlines, no texture, no realistic feathers. A compact kingfisher with a large rounded royal-blue crown (#3B82F6 to #1F5FD6), a light-azure cheek patch under the eye (#A6DDF8), a white throat crossed by a light-azure collar band (#76CDF5), a long straight dagger-shaped navy beak (#1D57B8 to #173F86), a round black eye with one white highlight and a small white spot just in front of it, a deep-blue wing (#2A72E8 to #174CA8) with a darker navy lower edge (#14336E) and ten small light-azure spots (#7FD0F6), a bright azure stripe down the back (#8ADAF8 to #46B4EE), a white breast fading to ice blue, a short blue tail of two feathers, small navy feet. Only blues and white on the bird: no orange, red, yellow or green. Calm, precise, focused expression: a bird that aims before it dives. Same proportions, same colours, same character in every image.

Scene: Exactly the same framing, size and position as the avatar (head and upper chest, three-quarter view, beak pointing right), head raised, crown feathers slightly lifted, eye bright and wide, beak slightly open as if about to speak, pleased.

Format: 1:1 aspect ratio.

Rendering for cut-out: one flat uniform chroma-key green background (#00B140), no gradient, no floor, no cast shadow, no vignette. No water, no splash, no glass, no reflections, no particles, no motion lines, no text, no logo, no watermark, no leaves unless asked. Sharp silhouette with crisp edges, no glow, no motion blur. The whole bird is inside the frame with at least 10 % empty margin on every side. High resolution (2K or more).

Avoid: orange belly, red feet, green feathers, yellow, realistic photo, detailed feathers, 3D render, outline, sketch, water, splash, glass, glow, motion blur, gradient background, white background, floor, cast shadow, text, watermark, extra wings, extra legs, open mouth with teeth, oversized cartoon eyes.
```

## 6. Le plongeon → `kf-plongeon.png`

Pages Méthode, Réalisations et Studio.

```text
Brand mascot: the ZkilZ kingfisher, drawn exactly like the attached ZkilZ logo (a kingfisher perched in a circle) and the attached reference sheet. Flat vector illustration with clean geometric shapes and smooth soft gradients inside each shape, no outlines, no texture, no realistic feathers. A compact kingfisher with a large rounded royal-blue crown (#3B82F6 to #1F5FD6), a light-azure cheek patch under the eye (#A6DDF8), a white throat crossed by a light-azure collar band (#76CDF5), a long straight dagger-shaped navy beak (#1D57B8 to #173F86), a round black eye with one white highlight and a small white spot just in front of it, a deep-blue wing (#2A72E8 to #174CA8) with a darker navy lower edge (#14336E) and ten small light-azure spots (#7FD0F6), a bright azure stripe down the back (#8ADAF8 to #46B4EE), a white breast fading to ice blue, a short blue tail of two feathers, small navy feet. Only blues and white on the bird: no orange, red, yellow or green. Calm, precise, focused expression: a bird that aims before it dives. Same proportions, same colours, same character in every image.

Scene: Diving almost vertically downward, beak first, body perfectly straight and streamlined, wings folded tight against the body, tail closed, eye focused on the target below. Side view, the beak pointing to the bottom.

Format: 1:1 aspect ratio.

Rendering for cut-out: one flat uniform chroma-key green background (#00B140), no gradient, no floor, no cast shadow, no vignette. No water, no splash, no glass, no reflections, no particles, no motion lines, no text, no logo, no watermark, no leaves unless asked. Sharp silhouette with crisp edges, no glow, no motion blur. The whole bird is inside the frame with at least 10 % empty margin on every side. High resolution (2K or more).

Avoid: orange belly, red feet, green feathers, yellow, realistic photo, detailed feathers, 3D render, outline, sketch, water, splash, glass, glow, motion blur, gradient background, white background, floor, cast shadow, text, watermark, extra wings, extra legs, open mouth with teeth, oversized cartoon eyes.
```

## 7. L'envol → `kf-envol.png`

Le bandeau « Un projet en tête ? » en bas de chaque page.

```text
Brand mascot: the ZkilZ kingfisher, drawn exactly like the attached ZkilZ logo (a kingfisher perched in a circle) and the attached reference sheet. Flat vector illustration with clean geometric shapes and smooth soft gradients inside each shape, no outlines, no texture, no realistic feathers. A compact kingfisher with a large rounded royal-blue crown (#3B82F6 to #1F5FD6), a light-azure cheek patch under the eye (#A6DDF8), a white throat crossed by a light-azure collar band (#76CDF5), a long straight dagger-shaped navy beak (#1D57B8 to #173F86), a round black eye with one white highlight and a small white spot just in front of it, a deep-blue wing (#2A72E8 to #174CA8) with a darker navy lower edge (#14336E) and ten small light-azure spots (#7FD0F6), a bright azure stripe down the back (#8ADAF8 to #46B4EE), a white breast fading to ice blue, a short blue tail of two feathers, small navy feet. Only blues and white on the bird: no orange, red, yellow or green. Calm, precise, focused expression: a bird that aims before it dives. Same proportions, same colours, same character in every image.

Scene: Taking off and climbing steeply upward to the upper right, both wings fully spread and raised, tail fanned, feet tucked, body angled about 45 degrees upward, determined. Side view.

Format: 1:1 aspect ratio.

Rendering for cut-out: one flat uniform chroma-key green background (#00B140), no gradient, no floor, no cast shadow, no vignette. No water, no splash, no glass, no reflections, no particles, no motion lines, no text, no logo, no watermark, no leaves unless asked. Sharp silhouette with crisp edges, no glow, no motion blur. The whole bird is inside the frame with at least 10 % empty margin on every side. High resolution (2K or more).

Avoid: orange belly, red feet, green feathers, yellow, realistic photo, detailed feathers, 3D render, outline, sketch, water, splash, glass, glow, motion blur, gradient background, white background, floor, cast shadow, text, watermark, extra wings, extra legs, open mouth with teeth, oversized cartoon eyes.
```

## 8. Service « Sites » → `kf-site.png`

La carte « Sites » de l'accueil.

```text
Brand mascot: the ZkilZ kingfisher, drawn exactly like the attached ZkilZ logo (a kingfisher perched in a circle) and the attached reference sheet. Flat vector illustration with clean geometric shapes and smooth soft gradients inside each shape, no outlines, no texture, no realistic feathers. A compact kingfisher with a large rounded royal-blue crown (#3B82F6 to #1F5FD6), a light-azure cheek patch under the eye (#A6DDF8), a white throat crossed by a light-azure collar band (#76CDF5), a long straight dagger-shaped navy beak (#1D57B8 to #173F86), a round black eye with one white highlight and a small white spot just in front of it, a deep-blue wing (#2A72E8 to #174CA8) with a darker navy lower edge (#14336E) and ten small light-azure spots (#7FD0F6), a bright azure stripe down the back (#8ADAF8 to #46B4EE), a white breast fading to ice blue, a short blue tail of two feathers, small navy feet. Only blues and white on the bird: no orange, red, yellow or green. Calm, precise, focused expression: a bird that aims before it dives. Same proportions, same colours, same character in every image.

Scene: Perched on the top edge of an open laptop seen from the front, leaning forward and looking down at the screen. The laptop is drawn in the same flat style: white body, pale-blue screen (#E8F1FF) with a few simple blue interface blocks (a hero shape, three cards), no logo, no readable text.

Format: 9:10 (ou 4:5) aspect ratio.

Rendering for cut-out: one flat uniform chroma-key green background (#00B140), no gradient, no floor, no cast shadow, no vignette. No water, no splash, no glass, no reflections, no particles, no motion lines, no text, no logo, no watermark, no leaves unless asked. Sharp silhouette with crisp edges, no glow, no motion blur. The whole bird is inside the frame with at least 10 % empty margin on every side. High resolution (2K or more).

Avoid: orange belly, red feet, green feathers, yellow, realistic photo, detailed feathers, 3D render, outline, sketch, water, splash, glass, glow, motion blur, gradient background, white background, floor, cast shadow, text, watermark, extra wings, extra legs, open mouth with teeth, oversized cartoon eyes.
```

## 9. Service « Applications » → `kf-app.png`

La carte « Applications et SaaS » de l'accueil.

```text
Brand mascot: the ZkilZ kingfisher, drawn exactly like the attached ZkilZ logo (a kingfisher perched in a circle) and the attached reference sheet. Flat vector illustration with clean geometric shapes and smooth soft gradients inside each shape, no outlines, no texture, no realistic feathers. A compact kingfisher with a large rounded royal-blue crown (#3B82F6 to #1F5FD6), a light-azure cheek patch under the eye (#A6DDF8), a white throat crossed by a light-azure collar band (#76CDF5), a long straight dagger-shaped navy beak (#1D57B8 to #173F86), a round black eye with one white highlight and a small white spot just in front of it, a deep-blue wing (#2A72E8 to #174CA8) with a darker navy lower edge (#14336E) and ten small light-azure spots (#7FD0F6), a bright azure stripe down the back (#8ADAF8 to #46B4EE), a white breast fading to ice blue, a short blue tail of two feathers, small navy feet. Only blues and white on the bird: no orange, red, yellow or green. Calm, precise, focused expression: a bird that aims before it dives. Same proportions, same colours, same character in every image.

Scene: Perched on the top edge of a large smartphone standing upright, looking down at it. The phone is drawn in the same flat style: navy frame, pale-blue screen with a few rounded blue interface blocks and a small rising line chart, no logo, no readable text.

Format: 3:5 (ou 9:16) aspect ratio.

Rendering for cut-out: one flat uniform chroma-key green background (#00B140), no gradient, no floor, no cast shadow, no vignette. No water, no splash, no glass, no reflections, no particles, no motion lines, no text, no logo, no watermark, no leaves unless asked. Sharp silhouette with crisp edges, no glow, no motion blur. The whole bird is inside the frame with at least 10 % empty margin on every side. High resolution (2K or more).

Avoid: orange belly, red feet, green feathers, yellow, realistic photo, detailed feathers, 3D render, outline, sketch, water, splash, glass, glow, motion blur, gradient background, white background, floor, cast shadow, text, watermark, extra wings, extra legs, open mouth with teeth, oversized cartoon eyes.
```

## 10. Planche de vol, profil → `kf-vol-profil.png`

**Nouveau.** Pour refaire l'oiseau animé du site dans le style exact du logo (il est aujourd'hui tiré de tes anciennes planches). Une fois livrée, j'adapte `tools/kf_sprite.py`.

```text
Brand mascot: the ZkilZ kingfisher, drawn exactly like the attached ZkilZ logo (a kingfisher perched in a circle) and the attached reference sheet. Flat vector illustration with clean geometric shapes and smooth soft gradients inside each shape, no outlines, no texture, no realistic feathers. A compact kingfisher with a large rounded royal-blue crown (#3B82F6 to #1F5FD6), a light-azure cheek patch under the eye (#A6DDF8), a white throat crossed by a light-azure collar band (#76CDF5), a long straight dagger-shaped navy beak (#1D57B8 to #173F86), a round black eye with one white highlight and a small white spot just in front of it, a deep-blue wing (#2A72E8 to #174CA8) with a darker navy lower edge (#14336E) and ten small light-azure spots (#7FD0F6), a bright azure stripe down the back (#8ADAF8 to #46B4EE), a white breast fading to ice blue, a short blue tail of two feathers, small navy feet. Only blues and white on the bird: no orange, red, yellow or green. Calm, precise, focused expression: a bird that aims before it dives. Same proportions, same colours, same character in every image.

Scene: Animation sprite sheet, 4 columns × 3 rows, all twelve birds at exactly the same scale, all in side view facing right, evenly spaced on a regular grid, each bird well separated from the others. Row 1, flapping flight cycle: (1) wings fully up above the back, (2) wings halfway down, (3) wings level with the body, (4) wings fully down below the body. Row 2: (5) wings coming back up, folded close to the body; (6) gliding with wings half open; (7) taking off: legs pushing, wings raised, body tilted up; (8) braking before landing: body upright, wings spread forward, legs stretched forward. Row 3: (9) perched, wings folded; (10) perched, crouched before jumping; (11) perched with wings raised as if stretching; (12) hovering in place, body upright, wings blurred-free and spread. The head stays the same size and shape in every pose.

Format: 4:3 aspect ratio.

Rendering for cut-out: one flat uniform chroma-key green background (#00B140), no gradient, no floor, no cast shadow, no vignette. No water, no splash, no glass, no reflections, no particles, no motion lines, no text, no logo, no watermark, no leaves unless asked. Sharp silhouette with crisp edges, no glow, no motion blur. The whole bird is inside the frame with at least 10 % empty margin on every side. High resolution (2K or more).

Avoid: orange belly, red feet, green feathers, yellow, realistic photo, detailed feathers, 3D render, outline, sketch, water, splash, glass, glow, motion blur, gradient background, white background, floor, cast shadow, text, watermark, extra wings, extra legs, open mouth with teeth, oversized cartoon eyes.
```

## 11. Planche de vol, orientations → `kf-vol-orientations.png`

**Nouveau.** Les vues qui rendent le vol vivant pendant le défilement (demi-tour, piqué, montée).

```text
Brand mascot: the ZkilZ kingfisher, drawn exactly like the attached ZkilZ logo (a kingfisher perched in a circle) and the attached reference sheet. Flat vector illustration with clean geometric shapes and smooth soft gradients inside each shape, no outlines, no texture, no realistic feathers. A compact kingfisher with a large rounded royal-blue crown (#3B82F6 to #1F5FD6), a light-azure cheek patch under the eye (#A6DDF8), a white throat crossed by a light-azure collar band (#76CDF5), a long straight dagger-shaped navy beak (#1D57B8 to #173F86), a round black eye with one white highlight and a small white spot just in front of it, a deep-blue wing (#2A72E8 to #174CA8) with a darker navy lower edge (#14336E) and ten small light-azure spots (#7FD0F6), a bright azure stripe down the back (#8ADAF8 to #46B4EE), a white breast fading to ice blue, a short blue tail of two feathers, small navy feet. Only blues and white on the bird: no orange, red, yellow or green. Calm, precise, focused expression: a bird that aims before it dives. Same proportions, same colours, same character in every image.

Scene: Animation sprite sheet, 3 columns × 2 rows, all six birds at exactly the same scale, evenly spaced on a regular grid, each well separated: (1) flying straight toward the viewer, front view, wings spread up; (2) same front view, wings spread down; (3) flying away from the viewer, back view, wings spread, beak pointing up; (4) three-quarter view in a banking turn, one wing high and one wing low; (5) diving head first toward the bottom right, wings folded tight; (6) climbing steeply toward the upper right, wings spread.

Format: 3:2 aspect ratio.

Rendering for cut-out: one flat uniform chroma-key green background (#00B140), no gradient, no floor, no cast shadow, no vignette. No water, no splash, no glass, no reflections, no particles, no motion lines, no text, no logo, no watermark, no leaves unless asked. Sharp silhouette with crisp edges, no glow, no motion blur. The whole bird is inside the frame with at least 10 % empty margin on every side. High resolution (2K or more).

Avoid: orange belly, red feet, green feathers, yellow, realistic photo, detailed feathers, 3D render, outline, sketch, water, splash, glass, glow, motion blur, gradient background, white background, floor, cast shadow, text, watermark, extra wings, extra legs, open mouth with teeth, oversized cartoon eyes.
```

---

## Où va chaque image

| N° | Fichier | Où | Intégration |
|---|---|---|---|
| 1 | `kf-planche` | référence pour toutes les autres | — |
| 2 | `agent-avatar` | assistant, pastille et fenêtre | automatique |
| 3 | `agent-avatar-clin` | assistant, clignement | automatique |
| 4 | `agent-reflechit` | assistant, pendant la réponse | automatique |
| 5 | `agent-idee` | assistant, quand la réponse arrive | automatique |
| 6 | `kf-plongeon` | Méthode, Réalisations, Studio | automatique (même nom) |
| 7 | `kf-envol` | bandeau « Un projet en tête ? » | automatique (même nom) |
| 8-9 | `kf-site`, `kf-app` | cartes des services, accueil | automatique (même nom) |
| 10-11 | `kf-vol-profil`, `kf-vol-orientations` | l'oiseau animé | je refais la planche d'animation |

L'image de partage (`og-zkilz.jpg`) est maintenant fabriquée à partir du logo : plus besoin de la générer.

---

<!-- IMAGES DES PAGES : début -->

# Images des pages du site

Les prompts des images des pages sont dans **`PROMPTS-IMAGES.md`** (et ceux qui manquent encore dans `PROMPTS-A-FAIRE.md`).

<!-- IMAGES DES PAGES : fin -->
