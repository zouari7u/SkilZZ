#!/usr/bin/env python3
"""
Convertit les images des pages en .webp.

    python3 tools/convertir_images.py

Prend chaque PNG / JPG de assets/img/pages/src/, le met à 1600 px de
large, puis régénère les pages et l'écrit en .webp dans assets/img/pages/, avec
le même nom. Il faut cwebp (brew install webp).
"""
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'img', 'pages', 'src')
OUT = os.path.join(ROOT, 'assets', 'img', 'pages')

if not shutil.which('cwebp'):
    sys.exit('cwebp introuvable : installe-le avec « brew install webp ».')
done = 0
for name in sorted(os.listdir(SRC)):
    base, ext = os.path.splitext(name)
    if ext.lower() not in ('.png', '.jpg', '.jpeg'):
        continue
    src, dst = os.path.join(SRC, name), os.path.join(OUT, base + '.webp')
    subprocess.run(['cwebp', '-quiet', '-q', '82', '-resize', '1600', '0', src, '-o', dst], check=True)
    print('ok', base + '.webp')
    done += 1
print(done, 'image(s) convertie(s).' if done else 'Aucune image dans assets/img/pages/src/.')
# les pages pointent sur les nouvelles images, et la liste des images à faire se met à jour
if done:
    subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'build_pages.py')], check=True)
