# Prompts IA — le martin-pêcheur de ZkilZ

La mascotte est maintenant un **martin-pêcheur**, en **bleu et blanc uniquement**. Il dit trois choses :
l'**ascension** (partir d'un roseau au ras de l'eau et monter tout en haut), la **précision** (il vise avant de
plonger) et la **technique** (son bec a inspiré le nez du Shinkansen 500).

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
| 9-11 | `kf-site`, `kf-app`, `kf-reseaux` | services sur téléphone | je l'intègre |
