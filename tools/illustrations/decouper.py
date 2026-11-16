#!/usr/bin/env python3
"""
Découpe la capture pleine page d'un groupe de l'atelier en une image .webp
par illustration, dans assets/img/pages/.

    python3 tools/illustrations/decouper.py <capture.png> <groupe 1-4 | nom1,nom2>

Les illustrations sont empilées dans l'atelier, à 1600 px de large ; leur
hauteur vient de leur format. Une image déjà déposée dans
assets/img/pages/src/ (version IA ou capture réelle) n'est pas écrasée.
"""
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
html = open(os.path.join(ROOT, 'tools', 'illustrations', 'atelier.html'), encoding='utf-8').read()
items = re.findall(r"^\s*\['([\w-]+)', '(\d+)/(\d+)'", html, re.M)
groups = {'1': items[0:6], '2': items[6:14], '3': items[14:22], '4': items[22:]}
png, g = sys.argv[1], sys.argv[2]
# un numéro de groupe, ou une liste de noms séparés par des virgules (dans l'ordre de l'atelier)
chosen = groups[g] if g in groups else [it for it in items if it[0] in g.split(',')]
y = 0
for name, a, b in chosen:
    h = round(1600 * int(b) / int(a))
    src = os.path.join(ROOT, 'assets', 'img', 'pages', 'src')
    if any(os.path.exists(os.path.join(src, name + ext)) for ext in ('.png', '.jpg', '.jpeg')):
        print('garde la version déposée :', name)
    else:
        out = os.path.join(ROOT, 'assets', 'img', 'pages', name + '.webp')
        subprocess.run(['cwebp', '-quiet', '-q', '84', '-crop', '0', str(y), '1600', str(h), png, '-o', out], check=True)
        print('ok', name + '.webp')
    y += h
