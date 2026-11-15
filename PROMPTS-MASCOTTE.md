# Prompts IA — mascotte fennec SkilZZ (v2)

Tout ce qu'il faut pour refaire les images du fennec **avec un détourage parfait**, plus les nouvelles poses qui
servent aux animations (le fennec qui sort des cadres) et à l'agent IA en bas à droite.

Les prompts sont en anglais (les générateurs le comprennent mieux) : colle-les tels quels.

---

## Pourquoi les détourages actuels ne sont pas parfaits

| Problème vu sur le site | Cause | Règle v2 |
|---|---|---|
| Bulle du fennec « coupée droite » (accueil) | L'image contenait une grande bulle **transparente** collée au museau. Le détourage ne sait pas séparer un objet transparent du fond : il a tranché net. | **Jamais d'objet transparent** dans l'image (bulle, verre, reflets). Le site dessine les bulles lui-même. |
| Reflets de bulle sur les oreilles (`dans-bulle`) | Le fennec était dessiné *dans* une bulle. | Le fennec seul, en boule ; la bulle est en CSS. |
| Léger liseré clair autour du pelage | Fond blanc : le blanc du ventre et de la queue se confond avec le fond. | **Fond vert chroma uni `#00B140`** : aucun vert dans le personnage, découpe nette. |
| Pastille verte « ✓ » sur `laptop`, icônes sur `selfie` | Éléments posés en dehors du personnage. | Pas de pictos ni de confettis : le site les anime. |

> En attendant les nouvelles images, j'ai réparé la pose `fennec-bulle.webp` à la main (joue redessinée, anneau
> de la baguette refermé, tige reconstruite). Elle n'a plus de coupe droite, mais une image refaite avec les
> règles ci-dessous sera meilleure.

---

## 0. Fiche du personnage (à coller au début de CHAQUE prompt)

Elle décrit le fennec **tel qu'il est sur le site aujourd'hui** (bleu), pour que toutes les poses se ressemblent.

```text
A cute brand mascot: a young fennec fox, stylised 3D cartoon (Pixar-lite, soft studio lighting, smooth shading,
no outlines, no realistic fur, only a few soft fur tufts). Vivid royal-blue fur (#1F6BFF to #1452D9), pure white
muzzle, cheeks, chest and belly, white zigzag tip on a big fluffy tail. Huge tall pointed ears (about as tall as
the head) with light sky-blue insides (#8FC8FF) and small white fur tufts. Navy-blue paws and lower legs
(#0B1B3F). Large glossy navy eyes with two white highlights, small white eyebrow marks, small navy nose, gentle
closed smile. Head large (about 45 % of body height), compact body. Friendly, curious, premium and calm.
Same character in every image: use the attached reference image.
```

## 0 bis. Règles de rendu (à coller à la FIN de chaque prompt)

```text
Background: one flat uniform chroma-key green (#00B140), no gradient, no floor, no cast shadow, no vignette.
The character must contain no green at all. No transparent or glass objects, no soap bubbles, no reflections,
no particles, no confetti, no icons, no text, no logo, no watermark. Sharp clean silhouette with crisp edges,
no glow and no motion blur. Square 2048 × 2048.
```

Pour les poses **en pied** (sauf celles qui sortent du cadre), ajoute :

```text
The whole character is fully inside the frame with at least 10 % empty margin on every side.
```

## Négatif (si l'outil a un champ « negative prompt »)

```text
green fur, green objects, soap bubble, transparent bubble, glass, reflections, glow, motion blur, gradient
background, white background, floor, cast shadow, text, logo, watermark, extra limbs, extra ears, extra tail,
orange fox, realistic fur, scary, sharp teeth, cropped ears
```

## Réglages conseillés

- **Image de référence** : joins `assets/img/mascotte/fennec-coucou.webp` (ou la planche `fennec-planche.webp`)
  comme *character reference* / *image prompt* à **chaque** génération. Sans référence, le fennec change d'une
  image à l'autre.
- **Variantes** (yeux fermés, etc.) : utilise l'**image-to-image / édition** sur la pose de base et ne demande que
  le changement indiqué, pour que tout le reste reste identique au pixel près.
- Génère 3 ou 4 essais et garde celui dont les oreilles et la queue sont entières.

---

## A. Poses à refaire (mêmes noms de fichiers)

### A1. Souffle dans la baguette (accueil)  →  `fennec-bulle.png`
La grande bulle et les petites bulles qui s'envolent sont dessinées par le site, à partir de l'anneau.

```text
[FICHE] Full body, sitting in three-quarter view facing right, holding a small sky-blue bubble wand with both
front paws, the empty ring of the wand right in front of its mouth, cheeks slightly puffed, lips pursed as if
blowing gently, eyes looking at the ring. NO bubble at all: the ring is empty and nothing comes out of it.
Tail curled on the left side. [RÈGLES] [EN PIED]
```

### A2. En boule, comme s'il flottait (section Réalisation)  →  `fennec-flotte.png`
Remplace `fennec-dans-bulle` : le site le place dans sa propre bulle.

```text
[FICHE] Full body, curled up in a relaxed seated ball as if floating weightless, hind paws tucked, front paws
resting softly in front of the chest, tail wrapped around the body, calm happy expression, looking at the viewer.
No bubble, no sphere around it. [RÈGLES] [EN PIED]
```

### A3. Tend l'oreille (Pourquoi un fennec)  →  `fennec-ecoute.png`

```text
[FICHE] Upper body from the waist up, head slightly tilted, one paw cupped behind a giant ear as if listening
carefully, curious attentive eyes looking at the viewer. No sound-wave lines. [RÈGLES]
The body is cut by the bottom edge of the image at waist level; ears fully inside the frame.
```

### A4. Devant un ordinateur (Sites)  →  `fennec-laptop.png`

```text
[FICHE] Sitting cross-legged behind a sleek silver laptop seen in three-quarter view, typing happily, the screen
faces away from the viewer, soft blue screen light on its face. No icons, no check mark. [RÈGLES] [EN PIED]
```

### A5. Montre un grand téléphone (Applications)  →  `fennec-app.png`

```text
[FICHE] Standing next to a giant modern smartphone almost its own height, pointing at the screen with one paw,
looking at the viewer. The screen shows a clean app interface in blue and white only (no green). [RÈGLES]
[EN PIED]
```

### A6. Selfie (Réseaux sociaux)  →  `fennec-selfie.png`

```text
[FICHE] Upper body, holding a navy smartphone at arm's length taking a selfie, cheerful expression with a small
open smile, one ear bent playfully. No floating icons. [RÈGLES] [EN PIED]
```

### A7. Saute de joie (Contact, clic sur la mascotte)  →  `fennec-joie.png`

```text
[FICHE] Jumping in the air with joy, both front paws raised, eyes closed in happy upside-down arcs, open smile,
ears bouncing, tail swirling. No confetti. [RÈGLES] [EN PIED]
```

### A8. Montre le bas de la page  →  `fennec-indique.png`

```text
[FICHE] Upper body leaning forward toward the viewer, one paw pointing down, ears up, friendly encouraging look.
[RÈGLES] The body is cut by the bottom edge of the image at chest level; ears fully inside the frame.
```

### A9. Coucou (pose de base, sert aussi de référence)  →  `fennec-coucou.png`

```text
[FICHE] Full body, sitting, facing the viewer, one front paw raised in a friendly wave, ears up and alert, tail
curled around the side. [RÈGLES] [EN PIED]
```

### A10. Tête seule (logo, avatar de l'agent)  →  `fennec-tete.png`

```text
[FICHE] Head only, front view, perfectly symmetrical, centred, friendly calm expression, ears fully visible,
designed to read clearly at 32 px. [RÈGLES] At least 6 % margin above the ear tips.
```

---

## B. Le fennec qui sort des cadres (nouveau)

Ces poses sont **volontairement coupées par un bord de l'image** : ce bord sera collé contre le bord d'un encart,
d'une fenêtre ou de l'écran, et le fennec aura l'air de dépasser de derrière. Le détoureur garde ce bord net.

### B1. Passe la tête par-dessus un bord  →  `fennec-peek.png`  (refaire)

```text
[FICHE] Only the top of the head peeking up from behind a horizontal edge: giant ears, eyebrows and eyes fully
visible, curious look to the side, two front paw tips gripping the edge on each side. [RÈGLES]
The image is cut exactly by the bottom edge, just below the eyes, as if the rest of the body is hidden behind a
wall. Ears fully inside the frame with margin above.
```

### B2. Penche la tête sur le côté  →  `fennec-peek-cote.png`  (nouveau)
Sert pour les bords gauche et droit (le site le retourne en miroir).

```text
[FICHE] The head and one front paw peeking out from behind a vertical edge on the left of the image, head tilted
about 30° so that the face comes out sideways, one paw gripping the edge, giant ears, curious mischievous look
toward the viewer. [RÈGLES] The image is cut exactly by its LEFT edge, as if the body is hidden behind a wall on
the left. Ears fully inside the frame.
```

### B3. Pendu la tête en bas  →  `fennec-pendu.png`  (nouveau)
Pour descendre du haut de l'écran ou d'une fenêtre.

```text
[FICHE] Hanging upside down from a horizontal edge at the top of the image, gripping it with both hind paws,
head and giant ears hanging down, front paws dangling, playful surprised smile, tail hanging. [RÈGLES]
The image is cut exactly by the TOP edge at the paws, as if hanging from a shelf above.
```

### B4. Escalade un bord  →  `fennec-grimpe.png`  (nouveau)

```text
[FICHE] Climbing over a horizontal edge from below: both front paws resting flat on the edge, chin on the paws,
ears up, happy determined look at the viewer. [RÈGLES] The image is cut exactly by the bottom edge, at the
height of the paws, as if the rest of the body is hidden below.
```

### B5. Bondit hors du cadre  →  `fennec-bond.png`  (nouveau)

```text
[FICHE] Full body leaping diagonally to the upper right, stretched out in mid-air like a playful jump, front
paws forward, ears swept back, tail streaming behind, joyful face. [RÈGLES] [EN PIED]
```

### B6. Le bout des oreilles qui dépasse  →  `fennec-oreilles.png`  (nouveau)
Pour les teasers : seules les oreilles dépassent, puis la tête monte.

```text
[FICHE] Only the two giant ear tips poking up from behind a horizontal edge, slightly tilted toward each other,
no eyes visible. [RÈGLES] The image is cut exactly by the bottom edge at the base of the ears.
```

---

## C. Agent IA (bulle en bas à droite)

L'agent s'affiche dans une bulle ronde ; ses oreilles dépassent de la bulle. Les expressions changent selon ce
qu'il fait (il écoute, il réfléchit, il a trouvé).

### C1. Avatar de l'agent  →  `agent-avatar.png`

```text
[FICHE] Head and shoulders, three-quarter view, wearing a small navy headset with a tiny microphone arm near the
muzzle, warm attentive look at the viewer, closed smile, ears up. [RÈGLES]
Ears fully inside the frame; the shoulders are cut by the bottom edge.
```

### C2. Réfléchit  →  `agent-reflechit.png`

```text
[FICHE] Same framing and headset as the reference, one paw on the chin, eyes looking up and to the side,
thoughtful expression, one ear slightly bent. [RÈGLES] Shoulders cut by the bottom edge.
```

### C3. A trouvé  →  `agent-idee.png`

```text
[FICHE] Same framing and headset as the reference, one paw raised with the index claw up, eyes bright and wide,
small open smile, both ears straight up. [RÈGLES] Shoulders cut by the bottom edge.
```

---

## D. Clignement des yeux (variantes par édition)

Le site fait cligner le fennec en échangeant deux images identiques à 0,1 s d'intervalle. Fais-les en
**image-to-image** à partir de la pose finale, sans rien changer d'autre.

| Base | Fichier | Prompt d'édition |
|---|---|---|
| `fennec-bulle.png` | `fennec-bulle-clin.png` | `Same image, identical in every way, only the eyes are closed in gentle curved lines.` |
| `fennec-tete.png` | `fennec-tete-clin.png` | idem |
| `agent-avatar.png` | `agent-avatar-clin.png` | idem |

> Le code les utilise **dès qu'ils existent** : dépose-les et le clignement s'active tout seul.

---

## E. Vidéos (Kling « image to video »)

Réglages : **5 s**, mouvement **faible à moyen**, **caméra fixe**, même image en première et dernière frame pour
les boucles. Pars toujours d'une image **sur fond vert** (sections A à C) et ajoute au prompt :

```text
Static camera, flat chroma-key green background (#00B140) for the whole clip, no camera movement, no particles,
no bubbles, no shadow on the background.
```

| Vidéo | Image de départ | Prompt |
|---|---|---|
| `hero-souffle.mp4` | A1 | `The fennec breathes calmly, blows gently into the wand ring three times with puffed cheeks, blinks, its ears twitch one after the other, the tail sways. Seamless loop.` |
| `peek-cote.mp4` | B2 | `The fennec slides its head out from behind the left edge, looks around curiously, tilts its head, blinks, then quickly hides back behind the edge.` |
| `agent-attente.mp4` | C1 | `The fennec with the headset listens, nods softly, blinks, one ear twitches, small friendly smile. Seamless loop.` |
| `joie.mp4` | A7 | `The fennec crouches, jumps happily with both paws up, ears flapping, lands softly and smiles.` |

---

## Où déposer et comment détourer

1. Mets les PNG générés (fond vert) dans un dossier, par exemple `~/Desktop/fennec/`, avec les noms ci-dessus.
2. Lance le détoureur (Pillow et numpy requis ; le `python3.13` de Homebrew les a déjà) :

   ```bash
   /opt/homebrew/bin/python3.13 tools/detourer.py ~/Desktop/fennec/*.png
   ```

   Il écrit les WebP transparents dans `assets/img/mascotte/`, recadrés serré, avec le vert retiré des bords. Il
   signale les poses coupées par un bord (« coupé au bord : bas ») : c'est voulu pour la section B.
3. Les vidéos se détourent en WebM transparent :

   ```bash
   ffmpeg -i peek-cote.mp4 -vf "chromakey=0x00B140:0.12:0.06,despill=type=green" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 32 -an assets/video/peek-cote.webm
   ```

Dis-moi quand les fichiers sont là : je branche les nouvelles poses (le site utilise déjà `fennec-peek` et les
versions retournées en attendant `fennec-peek-cote`, `fennec-grimpe` et `fennec-pendu`).
