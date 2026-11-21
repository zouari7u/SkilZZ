#!/usr/bin/env python3
"""
Convertit les images des pages en .webp.

    python3 tools/convertir_images.py

Prend chaque PNG / JPG de assets/img/pages/src/ (nommé comme son emplacement,
par exemple col-site.png), le recadre au centre au format exact de cet
emplacement (tools/images_prompts.py), l'enregistre en .webp dans
assets/img/pages/ en 1600 px et en 800 px de large, puis régénère les pages.
Utilise cwebp s'il est installé (brew install webp), sinon Pillow.
"""
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'img', 'pages', 'src')
OUT = os.path.join(ROOT, 'assets', 'img', 'pages')
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from images_prompts import IMAGES  # noqa: E402

CWEBP = shutil.which('cwebp')


def crop_to(im, ratio):
    """Recadre au centre au format a/b (ne touche à rien si c'est déjà le bon)."""
    a, b = (int(x) for x in ratio.split('/'))
    w, h = im.size
    if abs(w / h - a / b) < .005:
        return im
    if w / h > a / b:
        nw = round(h * a / b)
        return im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    nh = round(w * b / a)
    return im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))


def save(im, dst, width, q):
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS) if im.width > width else im
    if CWEBP:
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
            im.save(tmp.name)
        subprocess.run([CWEBP, '-quiet', '-q', str(q), tmp.name, '-o', dst], check=True)
        os.unlink(tmp.name)
    else:
        im.save(dst, 'WEBP', quality=q, method=6)


done = 0
for name in sorted(os.listdir(SRC)):
    base, ext = os.path.splitext(name)
    if ext.lower() not in ('.png', '.jpg', '.jpeg', '.webp'):
        continue
    im = Image.open(os.path.join(SRC, name)).convert('RGB')
    if base in IMAGES:
        im = crop_to(im, IMAGES[base][0])
    else:
        print('attention :', name, "ne correspond à aucun emplacement (voir PROMPTS-IMAGES.md) ; pas de recadrage")
    dst = os.path.join(OUT, base + '.webp')
    save(im, dst, 1600, 82)
    # et une version 800 px pour les affichages plus petits (mosaïque, tuiles)
    save(im, dst.replace('.webp', '-800.webp'), 800, 80)
    print('ok', base + '.webp', '%d × %d' % im.size)
    done += 1
print(done, 'image(s) convertie(s).' if done else 'Aucune image dans assets/img/pages/src/.')
# les pages pointent sur les nouvelles images, et la liste des images à faire se met à jour
if done:
    subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'build_pages.py')], check=True)
