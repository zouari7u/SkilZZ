"""Fabrique assets/img/mascotte/kf-vol.webp, la planche des poses du
martin-pêcheur utilisée par assets/js/bird.js, et met à jour les repères de
bird.js (taille des cases, œil, point d'appui des pattes, pointe du bec).

  python3 tools/kf_sprite.py      (depuis la racine du dépôt ; numpy, scipy, Pillow)

Sources : les deux planches dessinées dans le style du logo (fond vert uni) :
  assets/mascotte/kf-vol-profil.jpg        12 poses de profil
  assets/mascotte/kf-vol-orientations.jpg   6 vues (face, dos, virage, piqué, montée)

1. détoure les planches et efface la branche marron des poses posées ;
2. sépare chaque oiseau ;
3. cale toutes les poses de profil sur la tête (corrélation sur la tête de la
   pose « level », échelle cherchée pour chaque pose) : la tête reste fixe, le
   corps bouge avec les ailes ; les vues de face, de dos et le piqué sont
   centrés sur la silhouette, à l'échelle mesurée sur la pose de profil de
   leur planche ;
4. assemble les 16 poses dans une seule image, dans l'ordre attendu par bird.js ;
5. mesure l'œil, les pattes et la pointe du bec, et les écrit dans bird.js.
"""
import re

import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.signal import fftconvolve

REF = 'assets/mascotte/'
SHEETS = {'P': 'kf-vol-profil.jpg', 'O': 'kf-vol-orientations.jpg'}
OUT = 'assets/img/mascotte/kf-vol.webp'
BIRD_JS = 'assets/js/bird.js'
# (nom dans bird.js, oiseau de la planche, calage) — l'ordre fixe la place dans la planche
FRAMES = [('perch', 'P8', 'tete'), ('perchUp', 'P10', 'tete'),
          ('up', 'P0', 'tete'), ('mid', 'P1', 'tete'), ('down', 'P3', 'tete'),
          ('down2', 'P6', 'tete'), ('level', 'P5', 'tete'), ('rise', 'P11', 'tete'),
          ('upFeet', 'P4', 'tete'), ('flare', 'P7', 'tete'), ('upAlt', 'P2', 'tete'),
          ('crouch', 'P8', 'tete'), ('land', 'P7', 'tete'),
          ('front', 'O0', 'centre'), ('back', 'O1', 'centre'), ('dive', 'O4', 'centre')]
# pose de profil de la planche « O », qui donne son échelle
O_PROFILE = 'O3'


def key(im):
    f = np.asarray(im.convert('RGB')).astype(np.float32) / 255
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    gx = g - np.maximum(r, b)
    a = np.clip(1 - (gx - .08) / .22, 0, 1)
    g = np.where(gx > 0, np.maximum(r, b), g)          # retire le reflet vert
    # la branche marron (rouge > bleu) disparaît, avec son liseré : l'oiseau se
    # pose sur le site
    branch = ndi.binary_dilation((r > b + .04) & (a > .1), iterations=4)
    a = np.where(branch & ~((b > r + .12) & (r + g + b < 1.2)), 0, a)
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
    if g.shape[0] < tpl.shape[0] or g.shape[1] < tpl.shape[1]:
        return -1, 0, 0
    t = tpl - tpl.mean(); ones = np.ones_like(tpl)
    num = fftconvolve(g, t[::-1, ::-1], mode='valid')
    s = fftconvolve(g, ones, mode='valid'); s2 = fftconvolve(g ** 2, ones, mode='valid')
    r = num / (np.sqrt(np.maximum(s2 - s ** 2 / tpl.size, 1e-6)) * np.sqrt((t ** 2).sum()))
    i = np.unravel_index(r.argmax(), r.shape)
    return r[i], i[1], i[0]


def scaled(im, s):
    return im if s == 1 else im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)


def fit_head(im, tpl):
    """Meilleure échelle et position de la tête (deux passes : large puis fine)."""
    best = None
    for s in np.arange(.88, 1.15, .03):
        r = locate(scaled(im, s), tpl)
        if best is None or r[0] > best[0][0]: best = (r, s)
    s0 = best[1]
    for s in np.arange(s0 - .04, s0 + .045, .01):
        r = locate(scaled(im, s), tpl)
        if r[0] > best[0][0]: best = (r, s)
    (score, hx, hy), s = best
    return s, hx, hy, score


def centroid(im, ox=0, oy=0):
    a = np.asarray(im)[..., 3]
    ys, xs = np.nonzero(a > 128)
    return ox + xs.mean(), oy + ys.mean()


def main():
    pool = {}
    for k, fn in SHEETS.items():
        for j, b in enumerate(birds(key(Image.open(REF + fn)))):
            pool[f'{k}{j}'] = b
    lvl = dict((n, s) for n, s, _ in FRAMES)['level']
    ref = pool[lvl]; W, H = ref.size
    tpl = gray(ref.crop((int(W * .5), 0, W, int(H * .45))))
    o_scale = fit_head(pool[O_PROFILE], tpl)[0]
    placed = {}
    for name, src, how in FRAMES:
        if how != 'tete':
            continue
        im = pool[src]
        s, hx, hy, score = fit_head(im, tpl)
        placed[name] = (scaled(im, s), -hx, -hy)
        print('%-8s %-4s échelle %.2f  corrélation %.2f' % (name, src, s, score))
    # cadre commun : les poses de profil décident ; face, dos et piqué y tiennent
    prof = [placed[n] for n, _, h in FRAMES if h == 'tete']
    x0 = min(p[1] for p in prof) - 24; y0 = min(p[2] for p in prof) - 24
    x1 = max(p[1] + p[0].width for p in prof) + 24; y1 = max(p[2] + p[0].height for p in prof) + 24
    lx, ly = centroid(*placed['level'])
    for name, src, how in FRAMES:
        if how != 'centre':
            continue
        src_im = pool[src]
        s = min(o_scale, (x1 - x0 - 16) / src_im.width, (y1 - y0 - 16) / src_im.height)
        im = scaled(src_im, s)
        mx, my = centroid(im)
        ox = min(max(round(lx - mx), x0 + 8), x1 - 8 - im.width)
        oy = min(max(round(ly - my), y0 + 8), y1 - 8 - im.height)
        placed[name] = (im, ox, oy)
        print('%-8s %-4s échelle %.2f  (centrée)' % (name, src, s))
    cw, ch = round((x1 - x0) / 2), round((y1 - y0) / 2)
    cols = 4; rows = (len(FRAMES) + cols - 1) // cols
    atlas = Image.new('RGBA', (cw * cols, ch * rows))
    for i, (name, _, _) in enumerate(FRAMES):
        im, ox, oy = placed[name]
        big = Image.new('RGBA', (x1 - x0, y1 - y0)); big.paste(im, (ox - x0, oy - y0), im)
        atlas.paste(big.resize((cw, ch), Image.LANCZOS), ((i % cols) * cw, (i // cols) * ch))
    atlas.save(OUT, 'WEBP', quality=88, method=6, alpha_quality=100)
    print(OUT, atlas.size)

    # --- repères, mesurés dans les cases (coordonnées de la case) ---------------
    A = np.asarray(atlas)
    def cell(name):
        i = [n for n, _, _ in FRAMES].index(name)
        return A[(i // cols) * ch:(i // cols + 1) * ch, (i % cols) * cw:(i % cols + 1) * cw]
    p = cell('perch').astype(float)
    alpha = p[..., 3] > 128
    lum = p[..., :3].mean(-1)
    # œil : le plus grand amas noir de la tête (moitié haute de l'oiseau)
    ys, xs = np.nonzero(alpha)
    top, bot = ys.min(), ys.max()
    dark = alpha & (lum < 45)
    dark[int(top + (bot - top) * .45):] = False
    lab, n = ndi.label(dark)
    sizes = ndi.sum(dark, lab, range(1, n + 1))
    k = int(np.argmax(sizes)) + 1
    ey, ex = ndi.center_of_mass(dark, lab, k)
    er = max(4, (sizes[k - 1] / np.pi) ** .5 * 1.25)
    # pattes : les pixels bleu marine les plus bas de la moitié avant (la queue,
    # plus claire et en arrière, n'en fait pas partie)
    navy = alpha & (lum < 95) & (p[..., 2] > p[..., 0] + 15)
    navy[:int(top + (bot - top) * .55)] = False
    navy[:, :int(xs.min() + (xs.max() - xs.min()) * .3)] = False
    fys, fxs = np.nonzero(navy)
    fy = fys.max(); fx = fxs[fys >= fy - 6].mean()
    # pointe du bec : le pixel le plus à droite de la pose « level »
    lv = cell('level')[..., 3] > 128
    tys, txs = np.nonzero(lv)
    j = txs.argmax(); tx, ty = txs[j], tys[j]
    print('repères : œil (%.1f, %.1f) r %.1f · pattes (%.1f, %d) · bec (%d, %d)' % (ex, ey, er, fx, fy, tx, ty))

    js = open(BIRD_JS, encoding='utf-8').read()
    js = re.sub(r'var CELL = \{ w: [\d.]+, h: [\d.]+ \}, COLS = \d+, ROWS = \d+;',
                'var CELL = { w: %d, h: %d }, COLS = %d, ROWS = %d;' % (cw, ch, cols, rows), js)
    js = re.sub(r'var EYE = \{[^}]*\}, FOOT = \{[^}]*\};',
                'var EYE = { x: %.1f, y: %.1f, r: %.1f }, FOOT = { x: %.1f, y: %d };' % (ex, ey, er, fx, fy), js)
    js = re.sub(r'var TIP = \{ x: [\d.]+, y: [\d.]+ \}', 'var TIP = { x: %d, y: %d }' % (tx, ty), js)
    open(BIRD_JS, 'w', encoding='utf-8').write(js)
    print('bird.js mis à jour')


if __name__ == '__main__':
    main()
