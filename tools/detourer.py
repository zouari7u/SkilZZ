#!/usr/bin/env python3
"""
Détoure les poses de la mascotte générées sur fond vert uni (#00B140).

    python3 tools/detourer.py image.png [autre.png ...] [--out assets/img/mascotte] [--h 1100] [--cadre]

Pour chaque image :
  1. alpha calculé sur la « dominance du vert » (vert - max(rouge, bleu)),
     avec une rampe douce : bords nets, sans liseré ni coupure droite ;
  2. suppression du reflet vert sur les bords (despill) : le pelage bleu
     et blanc ne prend pas de teinte verte ;
  3. recadrage serré sur le personnage (marge de 2 %), sauf sur les bords
     où il touche le cadre (poses « sort du cadre ») : ces bords restent
     collés pour que la coupe tombe pile sur le bord du conteneur ;
  4. export WebP transparent, hauteur max --h.

Le nom de sortie reprend celui du fichier source (fennec-joie.png -> fennec-joie.webp).
Nécessite Pillow et numpy.
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def key(path, out_dir, max_h, frame=False):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]

    # 1. alpha : plus le vert domine, plus le pixel est transparent
    dom = g - np.maximum(r, b)
    alpha = 1 - smoothstep(18, 70, dom)

    # 2. despill : le vert ne dépasse jamais le max(rouge, bleu)
    g2 = np.minimum(g, np.maximum(r, b) + 4)
    rgb = np.stack([r, g2, b], -1)

    # contraction d'un demi-pixel du masque pour avaler le halo
    A = Image.fromarray((alpha * 255).astype(np.uint8)).filter(
        __import__('PIL.ImageFilter', fromlist=['MinFilter']).MinFilter(3))
    alpha = np.minimum(alpha, np.asarray(A).astype(np.float32) / 255 * .5 + alpha * .5)

    out = np.dstack([rgb, alpha * 255]).clip(0, 255).astype(np.uint8)
    img = Image.fromarray(out, 'RGBA')

    # 3. recadrage : marge partout, sauf sur un bord touché par le personnage
    ys, xs = np.where(alpha > .5)
    if not len(ys):
        print('  rien trouvé (le fond est-il bien vert ?)', path)
        return
    H, W = alpha.shape
    m = int(max(H, W) * .02)
    edge = 3
    x0 = 0 if xs.min() <= edge else max(0, xs.min() - m)
    y0 = 0 if ys.min() <= edge else max(0, ys.min() - m)
    x1 = W if xs.max() >= W - 1 - edge else min(W, xs.max() + m)
    y1 = H if ys.max() >= H - 1 - edge else min(H, ys.max() + m)
    if frame:
        x0, y0, x1, y1 = 0, 0, W, H   # --cadre : image entière (poses à superposer)
    img = img.crop((x0, y0, x1, y1))
    touches = [n for n, t in (('gauche', x0 == 0 and xs.min() <= edge), ('haut', y0 == 0 and ys.min() <= edge),
                              ('droite', x1 == W and xs.max() >= W - 1 - edge), ('bas', y1 == H and ys.max() >= H - 1 - edge)) if t]

    # 4. export
    if img.height > max_h:
        img = img.resize((round(img.width * max_h / img.height), max_h), Image.LANCZOS)
    name = os.path.splitext(os.path.basename(path))[0] + '.webp'
    dst = os.path.join(out_dir, name)
    img.save(dst, 'WEBP', quality=90, alpha_quality=100, method=6, exact=True)
    print(f'  {dst}  {img.width}×{img.height}' + (f'  (coupé au bord : {", ".join(touches)})' if touches else ''))


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('images', nargs='+')
    p.add_argument('--out', default='assets/img/mascotte')
    p.add_argument('--h', type=int, default=1100, help='hauteur maximale en pixels')
    p.add_argument('--cadre', action='store_true', help='garde l\'image entière, sans recadrage (avatars à superposer)')
    args = p.parse_args()
    os.makedirs(args.out, exist_ok=True)
    for f in args.images:
        print(f)
        key(f, args.out, args.h, args.cadre)


if __name__ == '__main__':
    sys.exit(main())
