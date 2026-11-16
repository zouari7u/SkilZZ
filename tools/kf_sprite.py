"""Fabrique assets/img/mascotte/kf-vol.webp, la planche des poses du
martin-pêcheur utilisée par assets/js/bird.js.

  python3 tools/kf_sprite.py      (depuis la racine du dépôt ; numpy, scipy, Pillow)

1. détoure les planches de référence (fond vert uni) ;
2. sépare chaque oiseau ;
3. cale toutes les poses sur la tête (corrélation sur le patch de la tête
   de la pose « level ») : la tête reste fixe, le corps bouge avec les ailes ;
4. assemble les 11 poses dans une seule image, dans l'ordre attendu par bird.js.
"""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.signal import fftconvolve

REF = 'assets/mascotte/'
SHEETS = {'A': 'Gemini_Generated_Image_ywyda8ywyda8ywyd.jpg',   # cycle de vol
          'C': 'Gemini_Generated_Image_su5kqmsu5kqmsu5k.jpg',   # orientations (face, dos, profil)
          'B': 'Gemini_Generated_Image_8pue638pue638pue.jpg',   # vol, décollage, freinage, sur-place
          'E': 'Gemini_Generated_Image_me9k50me9k50me9k-6.jpg'}  # le piqué
OUT = 'assets/img/mascotte/kf-vol.webp'
# (nom dans bird.js, planche+index, miroir, décalage x/y en px de planche)
FRAMES = [('perch', 'C2', True, 0, 0), ('perchUp', 'C4', True, 37, 8),
          ('up', 'A3', False, 0, 0), ('mid', 'A8', False, 0, 0), ('down', 'A4', False, 0, 0),
          ('down2', 'A1', False, 0, 0), ('level', 'A9', False, 0, 0), ('rise', 'A2', False, 0, 0),
          ('upFeet', 'A0', False, 0, 0), ('flare', 'A7', False, 0, 0), ('upAlt', 'C1', False, 0, 0)]
# Poses ajoutées : (nom, source, miroir, échelle, décalage x/y, calage)
#   calage « tete » : comme les poses de profil, sur la tête (échelles essayées autour de « échelle »)
#   calage « centre » : le centre de la silhouette sur celui de la pose « level » (face, dos, piqué)
EXTRA = [('crouch', 'B6', False, 1.12, 0, 0, 'tete'), ('land', 'B14', False, 1.12, 0, 0, 'tete'),
         ('front', 'C8', False, .92, 0, 0, 'centre'), ('back', 'C12', False, .92, 0, 0, 'centre'),
         ('dive', 'E0', True, .30, 0, 0, 'centre')]


def key(im):
    f = np.asarray(im.convert('RGB')).astype(np.float32) / 255
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    gx = g - np.maximum(r, b)
    a = np.clip(1 - (gx - .08) / .22, 0, 1)
    g = np.where(gx > 0, np.maximum(r, b), g)          # retire le reflet vert
    return (np.dstack([r, g, b, a]) * 255).astype(np.uint8)


def birds(rgba):
    lab, _ = ndi.label(ndi.binary_dilation(rgba[..., 3] > 128, iterations=10))
    objs = [(sl, i + 1) for i, sl in enumerate(ndi.find_objects(lab)) if sl[0].stop - sl[0].start >= 150]
    objs.sort(key=lambda t: (round(t[0][0].start / 400), t[0][1].start))
    out = []
    for sl, l in objs:
        c = rgba[sl].copy(); c[..., 3] = np.where(lab[sl] == l, c[..., 3], 0); out.append(Image.fromarray(c))
    return out


def gray(im):
    a = np.asarray(im.convert('RGBA')).astype(float) / 255
    return (a[..., :3] * a[..., 3:] + (1 - a[..., 3:])).mean(-1)


def locate(im, tpl):
    g = gray(im)
    t = tpl - tpl.mean(); ones = np.ones_like(tpl)
    num = fftconvolve(g, t[::-1, ::-1], mode='valid')
    s = fftconvolve(g, ones, mode='valid'); s2 = fftconvolve(g ** 2, ones, mode='valid')
    r = num / (np.sqrt(np.maximum(s2 - s ** 2 / tpl.size, 1e-6)) * np.sqrt((t ** 2).sum()))
    i = np.unravel_index(r.argmax(), r.shape)
    return r[i], i[1], i[0]


def main():
    pool = {}
    for k, fn in SHEETS.items():
        for j, b in enumerate(birds(key(Image.open(REF + fn)))):
            pool[f'{k}{j}'] = b
    ref = pool['A9']; W, H = ref.size
    tpl = gray(ref.crop((int(W * .55), 0, W, int(H * .42))))
    placed = []
    for name, src, mirror, dx, dy in FRAMES:
        im = pool[src].transpose(Image.FLIP_LEFT_RIGHT) if mirror else pool[src]
        best = max(((locate(im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS) if s != 1 else im, tpl), s)
                    for s in ((1,) if src[0] == 'A' else (.94, .97, 1, 1.03, 1.06))), key=lambda t: t[0][0])
        (_, hx, hy), s = best
        if s != 1: im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        placed.append((name, im, -hx + dx, -hy + dy))
    x0 = min(p[2] for p in placed) - 24; y0 = min(p[3] for p in placed) - 24
    x1 = max(p[2] + p[1].width for p in placed) + 24; y1 = max(p[3] + p[1].height for p in placed) + 24
    # poses ajoutées : placées dans le même cadre (la taille des cases et les
    # repères des 11 premières ne changent pas)
    def centroid(im, ox, oy):
        a = np.asarray(im)[..., 3].astype(float)
        ys, xs = np.nonzero(a > 128)
        return ox + xs.mean(), oy + ys.mean()
    lvl = [p for p in placed if p[0] == 'level'][0]
    cx, cy = centroid(lvl[1], lvl[2], lvl[3])
    for name, src, mirror, sc, dx, dy, how in EXTRA:
        im = pool[src].transpose(Image.FLIP_LEFT_RIGHT) if mirror else pool[src]
        if how == 'tete':
            best = max(((locate(im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS), tpl), s)
                        for s in (sc * .94, sc * .97, sc, sc * 1.03, sc * 1.06)), key=lambda t: t[0][0])
            (_, hx, hy), s = best
            im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
            placed.append((name, im, -hx + dx, -hy + dy))
        else:
            im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
            mx, my = centroid(im, 0, 0)
            placed.append((name, im, round(cx - mx) + dx, round(cy - my) + dy))
    cw, ch = round((x1 - x0) / 2), round((y1 - y0) / 2)
    cols = 4; rows = (len(placed) + cols - 1) // cols
    atlas = Image.new('RGBA', (cw * cols, ch * rows))
    for i, (name, im, ox, oy) in enumerate(placed):
        big = Image.new('RGBA', (x1 - x0, y1 - y0)); big.paste(im, (ox - x0, oy - y0), im)
        atlas.paste(big.resize((cw, ch), Image.LANCZOS), ((i % cols) * cw, (i // cols) * ch))
    atlas.save(OUT, 'WEBP', quality=88, method=6, alpha_quality=100)
    # repères mesurés sur la pose posée, relatifs au coin du patch de tête
    eye = ((62 - x0) / 2, (50 - y0) / 2); foot = ((-71 - x0) / 2, (275 - y0) / 2)
    print(OUT, atlas.size)
    print('bird.js → CELL = { w: %d, h: %d }, EYE = { x: %.1f, y: %.1f, r: 6 }, FOOT = { x: %.1f, y: %.1f }' % (cw, ch, eye[0], eye[1], foot[0], foot[1]))


if __name__ == '__main__':
    main()
