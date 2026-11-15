# Prompts IA — mascotte fennec SkilZZ

Le fennec actuellement visible sur le site est un **dessin SVG provisoire**. Ces prompts servent à générer la mascotte définitive
(images puis vidéos), dans l'esprit des mascottes de marque récentes du type « Kit » de Firefox : formes pleines et arrondies,
dégradés doux, visage minimal, très lisible en petit. **C'est un fennec, pas un renard** : oreilles immenses, museau court,
pelage crème / sable.

> Ne cite pas « Firefox » ni « Kit » dans le prompt : les générateurs copieraient le renard de Mozilla (marque déposée).
> Les prompts ci-dessous décrivent le *style*, ce qui suffit.

Les prompts sont en anglais (les générateurs comprennent mieux). Colle-les tels quels.

---

## 0. Fiche du personnage (à coller au début de CHAQUE prompt image)

```text
A cute, friendly fennec fox mascot for a premium digital agency. Modern brand-mascot style: simple, smooth, rounded
geometric shapes with soft gradients, clean silhouette, no outlines, no fur texture, minimal face. Oversized tall
pointed ears (signature trait, about as tall as the head), inner ears soft peach-pink. Fur: warm cream to sand
gradient (#FBE6C6 to #EBB16F), white muzzle, chest and tail tip (#FFFDF8). Small compact body, short legs, big fluffy
tail that curls like a soft flame. Face: two small glossy navy-blue oval eyes (#0B1B3F) with a tiny white highlight,
small navy nose, no visible mouth unless the pose needs an expression. Subtle soft 3D shading like a premium app
illustration (Apple / Pixar-lite), gentle rim light in light blue (#5BB8FF). Playful but serious and elegant.
Consistent proportions: head large (about 45% of total height), body small.
```

## Négatif (si l'outil a un champ « negative prompt »)

```text
realistic fur, photorealistic, scary, sharp teeth, outlines, thick black lines, clutter, text, watermark, logo,
extra limbs, extra ears, red fox orange colour, Firefox logo, globe, flames, deformed paws, busy background
```

## Réglages conseillés

- **Format** : PNG 2048 × 2048 (carré) ; 1536 × 2048 pour les poses en pied.
- **Fond** : *uniform pure white background* (je détoure ensuite), ou fond vert `#00B140` pour les vidéos.
- Garde **la même image de référence** (la fiche personnage n°1) en image-référence / « character reference »
  pour toutes les poses suivantes, sinon le fennec change d'une image à l'autre.

---

## 1. Planche personnage (à faire en premier, sert de référence)

```text
[FICHE DU PERSONNAGE] Character turnaround sheet: front view, three-quarter view, side view and back view of the same
fennec mascot, standing, neutral friendly expression, evenly spaced on a pure white background, flat even lighting,
consistent proportions across all views.
```

## 2. Hero — assis, salue de la patte  →  `hero-fennec.png`

```text
[FICHE DU PERSONNAGE] Full body, sitting, facing the viewer, one front paw raised in a friendly wave, ears up and
alert, eyes looking at the camera, tail curled around the side like a soft flame. Pure white background, soft
contact shadow under the body.
```

## 3. Approche « On écoute » — patte derrière l'oreille  →  `fennec-ecoute.png`

```text
[FICHE DU PERSONNAGE] Upper body, head slightly tilted, one paw cupped behind a giant ear as if listening carefully,
curious attentive eyes, small light-blue sound-wave arcs near the ear. Pure white background.
```

## 4. Sites & SaaS — devant un ordinateur portable  →  `fennec-laptop.png`

```text
[FICHE DU PERSONNAGE] Sitting behind a sleek silver laptop, typing happily, the screen glows soft blue (#1F6BFF)
and lights its face, a small green (#12B886) check bubble floats above. Three-quarter view. Pure white background.
```

## 5. Réseaux sociaux — selfie au smartphone  →  `fennec-selfie.png`

```text
[FICHE DU PERSONNAGE] Holding a modern smartphone at arm's length taking a selfie, cheerful expression with a small
open smile, tail up. Small floating rounded bubbles around it: a heart, a play button and a star, in blue (#1F6BFF),
sky blue (#5BB8FF) and green (#12B886). Pure white background.
```

## 6. Applications mobiles — tient un téléphone géant  →  `fennec-app.png`

```text
[FICHE DU PERSONNAGE] Standing next to a giant smartphone almost its own height, pointing at the screen with one paw,
the screen shows a simple clean app interface in blue and white. Pure white background.
```

## 7. Contact — saute de joie  →  `fennec-joie.png`

```text
[FICHE DU PERSONNAGE] Jumping in the air with joy, both front paws up, eyes closed in happy upside-down arcs, ears
bouncing, tail swirling, little blue and green confetti bubbles around. Pure white background.
```

## 8. Pied de page — tête qui dépasse  →  `fennec-peek.png`

```text
[FICHE DU PERSONNAGE] Only the top of the head, eyes and giant ears peeking up from the bottom edge of the frame,
curious look, cropped exactly at the bottom of the eyes. Pure white background.
```

## 9. Logo / avatar — tête seule  →  `fennec-tete.png`

```text
[FICHE DU PERSONNAGE] Head only, front view, perfectly symmetrical, centered, friendly calm expression, designed to
read clearly at 32 px as an app icon. Pure white background.
```

Variante logo plat (pour le favicon) :

```text
Flat vector logo of a fennec fox head, front view, symmetrical, minimal geometric shapes, two-tone cream and sand,
navy eyes and nose, huge ears, no gradients, no outline, centered on white.
```

---

## Vidéos (Kling « image to video » à partir des images ci-dessus)

Réglages : **5 s**, 1080 × 1080 (ou 1080 × 1920 pour les reels), mouvement **faible à moyen**, caméra fixe.
Pour les boucles, utilise la **même image en première et dernière frame** (option *first / last frame*).
Fond : refais l'image sur **fond vert uni `#00B140`** avant de l'animer : je détourerai la vidéo pour l'incruster
sans fond sur le site (WebM transparent).

### V1. Boucle d'attente (hero)  ←  image n°2

```text
The fennec mascot sits and breathes gently, blinks twice, its giant ears twitch one after the other, the tail sways
slowly like a soft flame. Subtle, calm, seamless loop. Static camera, plain background, no camera movement.
```

### V2. Coucou  ←  image n°2

```text
The fennec mascot waves its paw hello twice, tilts its head with a happy smile, ears bounce softly, then returns to
the starting pose. Static camera, plain background.
```

### V3. Écoute  ←  image n°3

```text
The fennec mascot slowly turns its huge ear toward the viewer, cups its paw behind the ear, eyes widen with interest,
small light-blue sound-wave arcs pulse near the ear. Static camera, plain background, seamless loop.
```

### V4. Saut de joie (formulaire envoyé)  ←  image n°7

```text
The fennec mascot crouches, jumps happily into the air with both paws up, ears flapping, small blue and green
confetti bubbles pop around it, lands softly and smiles. Bouncy cartoon timing, static camera, plain background.
```

### V5. Reel réseaux sociaux 9:16  ←  image n°5

```text
The fennec mascot takes a selfie with a smartphone, winks, then rounded heart and star bubbles float up and pop
around it. Vertical 9:16, bright clean white and light-blue set, gentle camera push-in, joyful and premium.
```

---

## Où déposer les fichiers

Mets les fichiers dans `assets/img/mascotte/` (images) et `assets/video/` (vidéos), avec les noms indiqués ci-dessus.
Je les intègre ensuite : hero (V1 + clic → V2), section Approche (n°3), Expertises (n°4, 5, 6),
Contact (n°7 / V4), pied de page (n°8), logo et favicon (n°9).

---

## Poses supplémentaires pour les animations (bulles)

Même fiche personnage que plus haut (fennec bleu, ventre et museau blancs, oreilles bleu clair,
pattes bleu nuit), fond blanc uni. Je détoure et j'intègre.

### 10. Souffle une bulle  →  `fennec-bulle.png`
Remplacerait la pose « coucou » au chargement : le fennec souffle, la bulle de l'accueil se gonfle.

```text
[FICHE DU PERSONNAGE] Full body, sitting, holding a small bubble wand with both front paws, cheeks
slightly puffed, blowing a large transparent soap bubble with a thin blue and green iridescent rim,
eyes looking at the bubble with delight. Pure white background, soft contact shadow.
```

### 11. Assis dans une bulle qui flotte  →  `fennec-dans-bulle.png`
Pour la section Réalisation : la bulle qui grandit jusqu'à remplir l'écran porterait le fennec entier.

```text
[FICHE DU PERSONNAGE] Full body, curled up and sitting comfortably inside a big floating transparent
soap bubble, paws resting on the inner wall, tail wrapped around, calm happy expression, bubble with
a thin blue and green iridescent rim and one white highlight. Pure white background.
```

### 12. Montre le bas de la page  →  `fennec-indique.png`
Pour l'invitation à défiler sous l'accueil.

```text
[FICHE DU PERSONNAGE] Upper body leaning forward, one paw pointing down, ears up, friendly
encouraging look toward the viewer. Pure white background.
```
