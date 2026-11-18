#!/usr/bin/env python3
"""
ZkilZ — fabrique les pages du site.

Le site reste statique : les fichiers .html à la racine sont ceux qui sont
servis. Ce script évite seulement de recopier à la main la barre de
navigation, le pied de page et l'assistant dans chaque page.

    python3 tools/build_pages.py

· Le contenu de chaque page est dans tools/pages/<nom>.html (le <main>).
· Une image s'insère avec {{img:nom}} (ou {{img:nom|classe en plus}}) :
  elle est décrite une seule fois dans IMAGES, plus bas. Tant que le
  fichier n'existe pas, la page affiche un cadre « image à venir ».
· Les prompts de toutes les images sont réécrits dans PROMPTS-MASCOTTE.md,
  entre les deux marqueurs « IMAGES DES PAGES ».
"""
import html
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARTS = os.path.join(ROOT, 'tools', 'pages')
IMG_DIR = 'assets/img/pages'

# ---------------------------------------------------------------------------
# PAGES : fichier, titre, description, lien actif dans la navbar
# ---------------------------------------------------------------------------
PAGES = [
    ('index', 'ZkilZ : sites, applications et outils sur mesure',
     "Studio digital : ZkilZ conçoit et développe votre site web, votre application mobile, votre SaaS et vos outils métier sur mesure. Premier échange gratuit.", None),
    ('services', 'Services : site web, application, SaaS et conseil | ZkilZ',
     "Création de site web, application mobile iOS et Android, SaaS et outils métier, conseil : tous les services du studio ZkilZ, conçus et développés sur mesure.", 'services'),
    ('site-web', 'Création de site web sur mesure et e-commerce | ZkilZ',
     "Site vitrine ou boutique en ligne sur mesure : rapide sur téléphone, bien référencé et facile à modifier vous-même. Maquettes validées avec vous avant le code.", 'services'),
    ('application-mobile', 'Création d\'application mobile iOS et Android | ZkilZ',
     "Votre application iOS et Android, testée sur votre téléphone en prototype avant la première ligne de code, puis publiée sur l'App Store et Google Play.", 'services'),
    ('saas', 'Développement SaaS et outils métier sur mesure | ZkilZ',
     "Un logiciel en ligne pour vos clients ou vos équipes : comptes, abonnements, rôles et tableaux de bord. ZkilZ conçoit et développe votre SaaS sur mesure.", 'services'),
    ('conseil', 'Conseil digital et passage au logiciel sur mesure | ZkilZ',
     "Tableurs ou logiciels qui ne collent pas à votre activité ? État des lieux et comparaison des solutions, puis passage à des outils sur mesure.", 'services'),
    ('reseaux-sociaux', 'Réseaux sociaux, marketing, SEO : Studio Moumous | ZkilZ',
     "Réseaux sociaux, marketing et référencement naturel avec Studio Moumous, partenaire de ZkilZ : contenus, campagnes et SEO, avec un seul interlocuteur.", 'services'),
    ('realisations', 'Réalisations : sites et applications sur mesure | ZkilZ',
     "Les projets conçus et développés par le studio ZkilZ : boutiques en ligne, applications et outils sur mesure, avec leurs études de cas détaillées.", 'realisations'),
    ('mm-fragrances', 'MM Fragrances, boutique de parfums : étude de cas | ZkilZ',
     "Étude de cas : comment ZkilZ a conçu la boutique en ligne de MM Fragrances, maison de parfums de niche. Catalogue animé, flacons 3D, quiz et conseiller virtuel.", 'realisations'),
    ('methode', 'Méthode : comment se déroule un projet digital | ZkilZ',
     "Écouter, concevoir, faire grandir : les étapes d'un projet avec ZkilZ, du premier échange gratuit à la mise en ligne, prototype testé avant le développement.", 'methode'),
    ('studio', 'Le studio ZkilZ : design et développement au même endroit',
     "ZkilZ, studio digital : celui qui dessine votre maquette est celui qui la code. Qui nous sommes, comment nous travaillons, et pourquoi un martin-pêcheur.", 'studio'),
    ('contact', 'Contact : parlez-nous de votre projet | ZkilZ',
     "Racontez votre projet de site, d'application ou d'outil sur mesure au studio ZkilZ. Le premier échange est gratuit et vous repartez avec des pistes concrètes.", 'contact'),
    ('mentions-legales', 'Mentions légales | ZkilZ', "Mentions légales du site du studio ZkilZ : éditeur, hébergeur et propriété intellectuelle.", None),
    ('confidentialite', 'Politique de confidentialité | ZkilZ', "Comment le studio ZkilZ collecte, utilise et protège vos données personnelles, et comment exercer vos droits.", None),
    ('404', 'Page introuvable | ZkilZ', "Cette page n'existe pas ou plus. Retrouvez les services, les réalisations et le contact du studio ZkilZ.", None),
]

# Adresse du site en ligne, sans barre finale : sert aux liens canoniques, au
# plan du site (sitemap.xml), à robots.txt et aux données structurées.
# À CHANGER si le nom de domaine est différent.
SITE_URL = 'https://www.zkilz.fr'

# Pages de service : décrites aussi comme « Service » pour les moteurs
SERVICE_PAGES = {
    'site-web': ('Création de site web', 'Création de site internet'),
    'application-mobile': ('Application mobile iOS et Android', 'Développement d\'application mobile'),
    'saas': ('SaaS et outils métier', 'Développement de logiciel SaaS'),
    'conseil': ('Conseil et transition vers le sur mesure', 'Conseil en transformation digitale'),
    'reseaux-sociaux': ('Réseaux sociaux, marketing et référencement', 'Marketing digital et référencement'),
}

NAV = [('services', 'Services'), ('realisations', 'Réalisations'), ('methode', 'Méthode'), ('studio', 'Studio')]

SERVICES = [
    ('site-web', 'Site web'), ('application-mobile', 'Application mobile'),
    ('saas', 'SaaS et outils métier'), ('conseil', 'Conseil et transition'),
]

# ---------------------------------------------------------------------------
# IMAGES : nom → (format, texte alternatif, famille, prompt)
#   famille « scene »  : illustration en aplats, fond compris
#   famille « device » : écran ou appareil, interface inventée sans texte lisible
#   famille « mascot » : le martin-pêcheur dans une scène (fiche n° 0 + référence n° 1)
#   famille « capture »: capture d'écran réelle à faire (pas d'IA)
#   famille « photo »  : vraie photo à fournir (pas d'IA)
# ---------------------------------------------------------------------------
# Les images, leurs descriptions et leurs prompts : tools/images_prompts.py
import sys as _sys
_sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from images_prompts import IMAGES, full_prompt, FAMILY_NAMES, GEMINI_RATIO  # noqa: E402

# Tant qu'une de ces images manque, la page affiche l'image existante indiquée.
# Dès qu'elle est déposée (tools/convertir_images.py relance ce script), elle
# prend sa place.
FALLBACK = {
    'svc-conseil': 'col-saas',
    'conseil-etat-des-lieux': 'methode-ecouter', 'conseil-solutions': 'saas-onboarding',
    'conseil-transition': 'saas-dashboard', 'conseil-equipe': 'saas-roles',
    'moumous-hero': 'svc-reseaux', 'moumous-reseaux': 'reseaux-storyboard',
    'moumous-identite': 'reseaux-charte', 'moumous-referencement': 'col-grille',
}


def has_image(name):
    return os.path.exists(os.path.join(ROOT, IMG_DIR, name + '.webp'))


def ratio_px(r, w=1600):
    a, b = (int(x) for x in r.split('/'))
    return w, round(w * b / a)


def figure(name, extra=''):
    if name not in IMAGES:
        raise SystemExit('Image inconnue : ' + name)
    r, alt, fam, _ = IMAGES[name]
    w, h = ratio_px(r)
    cls = ('shot ' + ('shot--real ' if fam in ('capture', 'photo') else '') + extra).strip()
    src = name if (has_image(name) or name not in FALLBACK) else FALLBACK[name]
    # version 800 px : le navigateur la prend quand l'image s'affiche petite
    small = ''
    if has_image(src + '-800'):
        small = ' srcset="%s/%s-800.webp 800w, %s/%s.webp 1600w" sizes="(max-width: 980px) 92vw, 50vw"' % (IMG_DIR, src, IMG_DIR, src)
    return ('<figure class="%s" style="--r:%s"><img src="%s/%s.webp"%s alt="%s" width="%d" height="%d" loading="lazy" '
            'decoding="async"><figcaption class="shot-ph" aria-hidden="true"><span>Image à venir</span><b>%s.webp</b>'
            '</figcaption></figure>') % (cls, r, IMG_DIR, src, small, html.escape(alt, quote=True), w, h, name)


# ---------------------------------------------------------------------------
# GABARIT COMMUN
# ---------------------------------------------------------------------------
HEAD = '''<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta name="robots" content="{robots}">
  <link rel="canonical" href="{url}">
  <meta name="author" content="ZkilZ">
  <meta name="theme-color" content="#F5F8FF" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#070C1C" media="(prefers-color-scheme: dark)">
  <meta property="og:type" content="{og_type}">
  <meta property="og:site_name" content="ZkilZ">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="{site}/assets/img/og-zkilz.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="ZkilZ, studio digital : sites, applications et outils sur mesure">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{desc}">
  <meta name="twitter:image" content="{site}/assets/img/og-zkilz.jpg">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="assets/img/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
  <script type="application/ld+json">{jsonld}</script>

  <!-- Thème appliqué avant le premier rendu (pas de flash). -->
  <script>
    (function () {{
      var t = null;
      try {{ t = localStorage.getItem('skz-theme'); }} catch (e) {{}}
      if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = t;
      document.documentElement.classList.add('js');
    }})();
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/main.css">
</head>
<body class="page-{page}">
<!-- Page générée par tools/build_pages.py : modifiez tools/pages/{page}.html puis relancez le script. -->

  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-out" viewBox="0 0 24 24"><path d="M8 16L16 8M9 8h7v7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
    <symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  </svg>

  <div class="cursor" id="cursor" aria-hidden="true"></div>
  <div class="fx-layer" id="fxLayer" aria-hidden="true"></div>

  <nav class="nav" id="nav" aria-label="Navigation principale">
    <div class="nav-glow" aria-hidden="true"><svg preserveAspectRatio="none"><rect class="nav-glow-rect" fill="none"/><rect class="nav-glow-rect" fill="none"/></svg></div>

    <a href="index.html" class="nav-brand" aria-label="ZkilZ, accueil">
      <span class="nav-mark"><svg class="nav-ring" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="25" pathLength="100"/></svg><span class="nav-logo">{logo}</span></span>
      <span class="nav-word"><b>Z</b>kil<b>Z</b></span>
    </a>

    <div class="nav-mid">
      <button type="button" class="nav-arrow nav-arrow--l" aria-label="Lien précédent" tabindex="-1"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <ul class="nav-links" id="navLinks">
        <li class="nav-pill" aria-hidden="true"></li>
{nav}
      </ul>
      <button type="button" class="nav-arrow nav-arrow--r" aria-label="Lien suivant" tabindex="-1"><svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </div>

    <div class="nav-end">
      <a href="contact.html" class="nav-cta fill-btn" data-fill="#DCE8FF"{cta_current}><span>Parler de votre projet</span><svg class="nav-cta-arrow" aria-hidden="true"><use href="#i-arrow"/></svg></a>
      <label class="theme-switch" title="Thème clair ou sombre">
        <input type="checkbox" id="themeToggle" aria-label="Thème sombre">
        <span class="ts-btn" aria-hidden="true">
          <svg class="ts-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2.1M12 19.1v2.1M2.8 12h2.1M19.1 12h2.1M5.5 5.5l1.5 1.5M17 17l1.5 1.5M5.5 18.5L7 17M17 7l1.5-1.5"/></svg>
          <svg class="ts-moon" viewBox="0 0 24 24"><path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1z"/></svg>
        </span>
      </label>
    </div>
  </nav>
'''

FOOT = '''
  <footer class="footer" id="footer">
    <!-- Décor de nuit : étoiles, lune, route de vol jusqu'à l'oiseau posé sur le « l », eau et roseaux -->
    <svg class="footer-deco" id="footerDeco" aria-hidden="true" preserveAspectRatio="none"></svg>

    <ul class="footer-pledges" aria-label="Nos engagements">
      <li><span class="fp-ico"><svg><use href="#i-check"/></svg></span><span><b>Premier échange gratuit</b>Vous repartez avec des pistes concrètes.</span></li>
      <li><span class="fp-ico"><svg><use href="#i-check"/></svg></span><span><b>Devis détaillé</b>Ligne par ligne, sans frais cachés.</span></li>
      <li><span class="fp-ico"><svg><use href="#i-check"/></svg></span><span><b>Un seul interlocuteur</b>Du premier croquis à la mise en ligne.</span></li>
    </ul>

    <div class="footer-grid">
      <div class="footer-about">
        <a href="index.html" class="footer-brand" aria-label="ZkilZ, accueil"><img class="footer-logo" src="assets/img/favicon.svg" width="56" height="56" alt="" loading="lazy" decoding="async"><span><b>Z</b>kil<b>Z</b></span></a>
        <p class="footer-tag">Studio digital. Sites, applications et outils sur mesure, conçus et développés au même endroit.</p>
        <a href="contact.html" class="btn btn--light fill-btn" data-fill="#8FB6FF"><span>Parler de votre projet</span><svg><use href="#i-arrow"/></svg></a>
      </div>
      <nav class="footer-col" aria-label="Services">
        <p class="footer-h">Services</p>
{svc_links}
      </nav>
      <nav class="footer-col" aria-label="Le studio">
        <p class="footer-h">Le studio</p>
        <a href="realisations.html">Réalisations</a><a href="methode.html">Méthode</a><a href="studio.html">Studio</a><a href="contact.html">Contact</a>
      </nav>
      <div class="footer-col footer-col--partner">
        <p class="footer-h">Partenaire</p>
        <a href="reseaux-sociaux.html" class="footer-partner">
          <img src="assets/img/moumous/moumous-logo.webp" width="48" height="48" alt="" loading="lazy" decoding="async">
          <span class="fpa-copy"><b>Studio Moumous</b><span>Réseaux sociaux, marketing et référencement.</span><i>Découvrir<svg aria-hidden="true"><use href="#i-arrow"/></svg></i></span>
        </a>
      </div>
    </div>

    <p class="footer-word" id="footerWord" aria-label="ZkilZ"><b>Z</b><span>k</span><span>i</span><span data-perch="50" data-perch-ink>l</span><b>Z</b></p>

    <div class="footer-bottom">
      <p class="footer-legal">© 2026 ZkilZ · Studio digital</p>
      <nav class="footer-links footer-links--small" aria-label="Informations légales"><a href="mentions-legales.html">Mentions légales</a><a href="confidentialite.html">Confidentialité</a><a href="sitemap.xml">Plan du site</a></nav>
      <button type="button" class="footer-totop" id="toTop">Haut de page<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </div>
  </footer>

  <!-- ASSISTANT IA — en bas à droite (assets/js/agent.js).
       Réponses : renseignez data-endpoint sur #agentPanel (ex. /api/chat) ;
       sans adresse, un moteur local répond à partir du contenu du site. -->
  <div class="agent-tip" id="agentTip" hidden>
    <span id="agentTipText"></span>
    <button type="button" class="agent-tip-x" aria-label="Ne plus afficher ces messages"><svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
  </div>
  <button type="button" class="agent-fab" id="agentFab" aria-controls="agentPanel" aria-expanded="false" aria-label="Poser une question à l'assistant ZkilZ">
    <span class="agent-fab-av" aria-hidden="true"><img src="assets/img/mascotte/agent-avatar.webp" alt="" width="1100" height="1100" decoding="async"></span>
    <span class="agent-fab-label" aria-hidden="true">Une question&nbsp;?</span>
    <span class="agent-fab-dot" aria-hidden="true"></span>
    <svg class="agent-fab-x" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
  </button>

  <section class="agent-panel" id="agentPanel" role="dialog" aria-modal="false" aria-labelledby="agentTitle" aria-hidden="true" hidden data-lenis-prevent data-endpoint="">
    <header class="agent-head">
      <span class="agent-av" aria-hidden="true"><img id="agentAv" src="assets/img/mascotte/agent-avatar.webp" alt="" width="1100" height="1100" decoding="async"></span>
      <div class="agent-id">
        <p class="agent-title" id="agentTitle">Le martin-pêcheur</p>
        <p class="agent-status"><i aria-hidden="true"></i><span id="agentStatus" aria-live="polite">Assistant de ZkilZ · en ligne</span></p>
      </div>
      <button type="button" class="agent-icon" id="agentReset" aria-label="Nouvelle conversation" title="Nouvelle conversation"><svg viewBox="0 0 24 24"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.8v3.6h3.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <button type="button" class="agent-icon" id="agentClose" aria-label="Fermer l'assistant"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
    </header>
    <div class="agent-log" id="agentLog" role="log" aria-live="polite" aria-relevant="additions"></div>
    <div class="agent-chips" id="agentChips"></div>
    <form class="agent-form" id="agentForm" autocomplete="off">
      <label class="sr-only" for="agentInput">Votre question</label>
      <input id="agentInput" type="text" maxlength="500" placeholder="Posez votre question…" enterkeyhint="send">
      <button type="submit" id="agentSend" class="agent-send" aria-label="Envoyer" disabled><svg viewBox="0 0 24 24"><path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </form>
    <p class="agent-foot">Assistant virtuel&nbsp;: il répond à partir du contenu du site. Pour un devis, <a href="contact.html">écrivez au studio</a>.</p>
  </section>

  <script src="assets/vendor/gsap.min.js"></script>
  <script src="assets/vendor/ScrollTrigger.min.js"></script>
  <script src="assets/vendor/DrawSVGPlugin.min.js"></script>
  <script src="assets/vendor/lenis.min.js"></script>
  <script src="assets/js/nav.js"></script>
  <script src="assets/js/fx.js"></script>
  <script src="assets/js/main.js"></script>
  <script src="assets/js/scenes.js"></script>
  <script src="assets/js/pages.js"></script>
  <script src="assets/js/reel.js"></script>
  <script src="assets/js/motion.js"></script>
  <script src="assets/js/sky.js"></script>
  <script src="assets/js/deco.js"></script>
  <script src="assets/js/bird.js"></script>
  <script src="assets/js/moumous.js"></script>
  <script src="assets/js/agent.js"></script>
</body>
</html>
'''

# Blocs réutilisables dans les contenus : {{cta}}, {{services-grid}}
CTA = '''    <section class="cta-sec">
      <div class="cta-band" data-reveal>
        <img class="cta-bird" src="assets/img/mascotte/kf-envol.webp" alt="" width="1126" height="1100" loading="lazy" decoding="async">
        <div class="cta-copy">
          <h2>Un projet en tête&nbsp;?</h2>
          <p>Dites ce que vous vendez et ce qui coince aujourd'hui. Le premier échange est gratuit, et vous repartez avec des pistes concrètes.</p>
        </div>
        <a href="contact.html" class="btn btn--light fill-btn" data-fill="#8FB6FF"><span>Parler de votre projet</span><svg><use href="#i-arrow"/></svg></a>
      </div>
    </section>'''

SVC_CARDS = [
    ('site-web', 'svc-site', '01', 'Site web', "Vitrine ou boutique, rapide sur téléphone, que vous modifiez vous-même."),
    ('application-mobile', 'svc-app', '02', 'Application mobile', "iOS et Android, testée sur votre téléphone avant d'être développée."),
    ('saas', 'svc-saas', '03', 'SaaS et outils métier', "Un logiciel en ligne pour vos clients ou vos équipes."),
    ('conseil', 'svc-conseil', '04', 'Conseil et transition', "On cherche la bonne solution, puis on passe au sur mesure."),
]


PARTNER = '''    <section class="partner-sec">
      <a class="partner" href="reseaux-sociaux.html" data-reveal>
        <span class="partner-media">%s</span>
        <span class="partner-copy">
          <span class="partner-brand"><img src="assets/img/moumous/moumous-logo.webp" width="56" height="56" alt="Studio Moumous" loading="lazy" decoding="async"><span class="partner-label">Partenaire</span></span>
          <span class="partner-title">Réseaux sociaux, marketing et référencement&nbsp;: Studio Moumous.</span>
          <span class="partner-text">ZkilZ développe vos outils, Studio Moumous les fait connaître. Un seul point de contact, et des équipes qui se parlent.</span>
          <span class="partner-go">Découvrir le partenariat<svg><use href="#i-arrow"/></svg></span>
        </span>
      </a>
    </section>'''



# Studio Moumous : le reel (il a son propre viseur : REC, TALLY, timecode) et
# la caméra-logo en 3D, sous un viseur dessiné en CSS. Les vidéos ne
# démarrent qu'à l'écran, en muet (assets/js/moumous.js).
SOUND = """<button type="button" class="vf-sound" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path class="vf-on" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path class="vf-off" d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span>Activer le son</span></button>"""
VISEUR = """<figure class="vf%s" data-vf>
          <video class="vf-video" muted loop playsinline preload="none" poster="assets/video/moumous-reel.jpg" width="480" height="854" aria-label="Le reel de Studio Moumous : le logo M apparaît dans le viseur d'une caméra, puis les mots marketing, audiovisuel, création de contenu et promotion.">
            <source src="assets/video/moumous-reel.mp4" type="video/mp4">
          </video>
          """ + SOUND + """
        </figure>"""
CAMERA = """<figure class="vf vf--cam%s" data-vf>
          <video class="vf-video" muted loop playsinline preload="none" poster="assets/video/moumous-camera.jpg" width="486" height="480" aria-label="La caméra-logo de Studio Moumous, en 3D, qui tourne sur elle-même.">
            <source src="assets/video/moumous-camera.mp4" type="video/mp4">
          </video>
          <span class="vf-hud" aria-hidden="true">
            <i class="vf-c vf-c--tl"></i><i class="vf-c vf-c--tr"></i><i class="vf-c vf-c--bl"></i><i class="vf-c vf-c--br"></i>
            <span class="vf-rec"><b></b>REC</span><span class="vf-tally">TALLY</span>
            <span class="vf-fmt"><b>4K</b>24 FPS</span><span class="vf-tc">00:04:12:09</span>
            <span class="vf-meter"><i></i><i></i></span>
          </span>
        </figure>"""


def services_grid(exclude=None):
    out = ['      <div class="svc-cards">']
    for slug, img, num, title, text in SVC_CARDS:
        if slug == exclude:
            continue
        out.append('''        <a class="svc-tile" href="%s.html" data-reveal data-perch="86">
          %s
          <span class="svc-tile-body"><span class="svc-tile-num">%s</span><span class="svc-tile-title">%s</span><span class="svc-tile-text">%s</span></span>
          <span class="svc-tile-go" aria-hidden="true"><svg><use href="#i-arrow"/></svg></span>
        </a>''' % (slug, figure(img), num, title, text))
    out.append('      </div>')
    return '\n'.join(out)


def expand(text):
    text = text.replace('{{cta}}', CTA)
    text = re.sub(r'\{\{viseur(?:\|([\w -]+))?\}\}', lambda m: VISEUR % ((' ' + m.group(1)) if m.group(1) else ''), text)
    text = re.sub(r'\{\{camera(?:\|([\w -]+))?\}\}', lambda m: CAMERA % ((' ' + m.group(1)) if m.group(1) else ''), text)
    text = text.replace('{{partner}}', PARTNER % figure('moumous-hero'))
    text = re.sub(r'\{\{services-grid(?:\|([\w-]+))?\}\}', lambda m: services_grid(m.group(1)), text)
    text = re.sub(r'\{\{img:([\w-]+)(?:\|([^}]*))?\}\}', lambda m: figure(m.group(1), m.group(2) or ''), text)
    return text


def versioned(out):
    """Ajoute ?v=<empreinte du fichier> aux CSS et JS du site : après une
    modification, le navigateur recharge le fichier au lieu de garder
    l'ancienne version en cache."""
    import hashlib
    def rep(m):
        path = os.path.join(ROOT, m.group(2))
        if not os.path.exists(path):
            return m.group(0)
        h = hashlib.md5(open(path, 'rb').read()).hexdigest()[:8]
        return '%s="%s?v=%s"' % (m.group(1), m.group(2), h)
    return re.sub(r'(href|src)="((?:assets/(?:css|js)/[\w.-]+\.(?:css|js))|(?:assets/img/(?:favicon[\w-]*|apple-touch-icon|icon-[\w-]+)\.(?:svg|png))|site\.webmanifest)"', rep, out)


def logo_svg(prefix='nv', cls='nav-kf', view='25 24 152 152'):
    """Le logo (assets/img/logo.svg) en SVG dans la page, et non en image,
    pour que nav.js anime la tête, la paupière et le reflet du bec.
    view : cadrage (par défaut le disque seul, pour la pastille ronde)."""
    t = open(os.path.join(ROOT, 'assets', 'img', 'logo.svg'), encoding='utf-8').read()
    t = re.sub(r'<title>.*?</title>\s*', '', t)
    t = re.sub(r'id="lg(\w+)"', r'id="%s\1"' % prefix, t).replace('url(#lg', 'url(#' + prefix)
    t = t.replace('viewBox="0 0 200 200"', 'viewBox="%s"' % view, 1)
    t = t.replace('<svg xmlns="http://www.w3.org/2000/svg"', '<svg class="%s" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"' % cls, 1)
    # reflet qui glisse le long du bec
    t = t.replace('<!-- œil, reflet, narine -->', '<path class="kf-glint" d="M134 60.5 C150 62.4 166 64.4 180 66" stroke="#fff" stroke-width="1.4" stroke-linecap="round" fill="none" pathLength="100"/>', 1)
    t = re.sub(r'\s*<!--.*?-->', '', t, flags=re.S)
    return '\n'.join(l.strip() for l in t.strip().splitlines() if l.strip())



# ---------------------------------------------------------------------------
# RÉFÉRENCEMENT : données structurées, plan du site, robots, manifeste
# ---------------------------------------------------------------------------
def page_url(page):
    return SITE_URL + '/' if page == 'index' else '%s/%s.html' % (SITE_URL, page)


def plain(s):
    s = re.sub(r'<[^>]+>', '', s)
    return re.sub(r'\s+', ' ', html.unescape(s).replace('\xa0', ' ')).strip()


ORG_ID = SITE_URL + '/#organisation'
MOUMOUS = {'@type': 'Organization', '@id': SITE_URL + '/reseaux-sociaux.html#studio-moumous', 'name': 'Studio Moumous',
           'description': 'Studio de contenus et de marketing : réseaux sociaux, marketing et référencement.',
           'logo': SITE_URL + '/assets/img/moumous/moumous-logo.webp'}


def jsonld(page, title, desc, main):
    import json
    url = page_url(page)
    graph = []
    if page == 'index':
        graph.append({
            '@type': 'ProfessionalService', '@id': ORG_ID, 'name': 'ZkilZ', 'url': SITE_URL + '/',
            'logo': {'@type': 'ImageObject', 'url': SITE_URL + '/assets/img/icon-512.png', 'width': 512, 'height': 512},
            'image': SITE_URL + '/assets/img/og-zkilz.jpg',
            'description': desc, 'slogan': 'Sites, applications et outils sur mesure pour votre activité.',
            'areaServed': {'@type': 'Country', 'name': 'France'}, 'inLanguage': 'fr-FR',
            'knowsAbout': ['Création de site web', 'E-commerce', 'Application mobile iOS et Android', 'SaaS',
                           'Outils métier sur mesure', 'Conseil digital', 'UX et UI design'],
            'hasOfferCatalog': {'@type': 'OfferCatalog', 'name': 'Services', 'itemListElement': [
                {'@type': 'Offer', 'itemOffered': {'@type': 'Service', 'name': n, 'url': page_url(s)}}
                for s, (n, _) in SERVICE_PAGES.items()]},
            'contactPoint': {'@type': 'ContactPoint', 'contactType': 'customer service', 'url': page_url('contact'),
                             'availableLanguage': 'French'},
        })
        graph.append({'@type': 'WebSite', '@id': SITE_URL + '/#site', 'url': SITE_URL + '/', 'name': 'ZkilZ',
                      'inLanguage': 'fr-FR', 'publisher': {'@id': ORG_ID}})
    else:
        graph.append({'@type': 'Organization', '@id': ORG_ID, 'name': 'ZkilZ', 'url': SITE_URL + '/',
                      'logo': SITE_URL + '/assets/img/icon-512.png'})
        graph.append({'@type': 'WebSite', '@id': SITE_URL + '/#site', 'url': SITE_URL + '/', 'name': 'ZkilZ'})
    kind = {'contact': 'ContactPage', 'studio': 'AboutPage', 'realisations': 'CollectionPage'}.get(page, 'WebPage')
    graph.append({'@type': kind, '@id': url + '#page', 'url': url, 'name': title, 'description': desc,
                  'inLanguage': 'fr-FR', 'isPartOf': {'@id': SITE_URL + '/#site'}, 'about': {'@id': ORG_ID},
                  'primaryImageOfPage': SITE_URL + '/assets/img/og-zkilz.jpg'})
    # fil d'Ariane : celui affiché dans la page
    m = re.search(r'<nav class="crumbs"[^>]*>(.*?)</nav>', main, re.S)
    if m:
        items, pos = [], 1
        for href, label in re.findall(r'<a href="([\w.-]+)">(.*?)</a>', m.group(1)):
            items.append({'@type': 'ListItem', 'position': pos, 'name': plain(label),
                          'item': page_url(href[:-5]) if href.endswith('.html') else SITE_URL + '/'})
            pos += 1
        cur = re.search(r'aria-current="page">(.*?)<', m.group(1))
        if cur:
            items.append({'@type': 'ListItem', 'position': pos, 'name': plain(cur.group(1)), 'item': url})
        graph.append({'@type': 'BreadcrumbList', '@id': url + '#ariane', 'itemListElement': items})
    if page in SERVICE_PAGES:
        name, stype = SERVICE_PAGES[page]
        svc = {'@type': 'Service', '@id': url + '#service', 'name': name, 'serviceType': stype, 'description': desc,
               'url': url, 'provider': {'@id': ORG_ID}, 'areaServed': {'@type': 'Country', 'name': 'France'},
               'inLanguage': 'fr-FR'}
        if page == 'reseaux-sociaux':
            svc['provider'] = [{'@id': ORG_ID}, MOUMOUS]
        graph.append(svc)
    if page == 'mm-fragrances':
        graph.append({'@type': 'CreativeWork', '@id': url + '#projet', 'name': 'Boutique en ligne MM Fragrances',
                      'creator': {'@id': ORG_ID}, 'description': desc, 'inLanguage': 'fr-FR',
                      'image': SITE_URL + '/assets/img/work/mm-home-dark.webp'})
    # questions fréquentes affichées dans la page
    qa = re.findall(r'<summary>(.*?)<span class="qa-ico">.*?</summary>\s*<div class="qa-body">(.*?)</div>', main, re.S)
    if qa:
        graph.append({'@type': 'FAQPage', '@id': url + '#questions', 'mainEntity': [
            {'@type': 'Question', 'name': plain(q), 'acceptedAnswer': {'@type': 'Answer', 'text': plain(a)}} for q, a in qa]})
    data = {'@context': 'https://schema.org', '@graph': graph}
    return json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def write_seo_files():
    import datetime, subprocess
    today = datetime.date.today().isoformat()
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">']
    prio = {'index': '1.0', 'services': '0.9', 'site-web': '0.9', 'application-mobile': '0.9', 'saas': '0.9',
            'conseil': '0.8', 'reseaux-sociaux': '0.8', 'realisations': '0.8', 'mm-fragrances': '0.7',
            'methode': '0.7', 'studio': '0.7', 'contact': '0.8', 'mentions-legales': '0.2', 'confidentialite': '0.2'}
    for page, *_ in PAGES:
        if page == '404':
            continue
        # date de dernière modification : celle du contenu de la page dans git
        try:
            d = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', 'tools/pages/%s.html' % page],
                               cwd=ROOT, capture_output=True, text=True).stdout.strip() or today
        except OSError:
            d = today
        src = open(os.path.join(PARTS, page + '.html'), encoding='utf-8').read()
        imgs = []
        for n in dict.fromkeys(re.findall(r'\{\{img:([\w-]+)', src)):
            if n in IMAGES and has_image(n):
                imgs.append('    <image:image><image:loc>%s/%s/%s.webp</image:loc></image:image>' % (SITE_URL, IMG_DIR, n))
        lines += ['  <url>', '    <loc>%s</loc>' % page_url(page), '    <lastmod>%s</lastmod>' % d,
                  '    <changefreq>%s</changefreq>' % ('weekly' if page in ('index', 'realisations') else 'monthly'),
                  '    <priority>%s</priority>' % prio.get(page, '0.5')] + imgs + ['  </url>']
    lines.append('</urlset>')
    open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
    open(os.path.join(ROOT, 'robots.txt'), 'w', encoding='utf-8').write(
        '# ZkilZ : tout le site est ouvert aux moteurs de recherche.\n'
        'User-agent: *\nAllow: /\n'
        '# fichiers de travail, pas des pages\n'
        'Disallow: /api/\nDisallow: /tools/\nDisallow: /skills/\nDisallow: /PROMPTS-MASCOTTE.md\nDisallow: /PROMPTS-A-FAIRE.md\n\n'
        'Sitemap: %s/sitemap.xml\n' % SITE_URL)
    import json
    manifest = {'name': 'ZkilZ, studio digital', 'short_name': 'ZkilZ', 'lang': 'fr', 'start_url': '/', 'scope': '/',
                'display': 'standalone', 'background_color': '#F6F9FE', 'theme_color': '#0B1B3F',
                'description': PAGES[0][2],
                'icons': [{'src': '/assets/img/icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
                          {'src': '/assets/img/icon-512.png', 'sizes': '512x512', 'type': 'image/png'},
                          {'src': '/assets/img/icon-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'},
                          {'src': '/assets/img/favicon.svg', 'sizes': 'any', 'type': 'image/svg+xml'}]}
    open(os.path.join(ROOT, 'site.webmanifest'), 'w', encoding='utf-8').write(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print('ok sitemap.xml, robots.txt, site.webmanifest')


LOGO = None


def build():
    global LOGO
    LOGO = logo_svg()
    for page, title, desc, active in PAGES:
        src = os.path.join(PARTS, page + '.html')
        with open(src, encoding='utf-8') as f:
            main = expand(f.read())
        nav = '\n'.join('        <li><a href="%s.html"%s>%s</a></li>' % (
            slug, ' aria-current="page"' if slug == active else '', label) for slug, label in NAV)
        svc_links = '\n'.join('        <a href="%s.html">%s</a>' % s for s in SERVICES)
        out = HEAD.format(title=html.escape(title), desc=html.escape(desc, quote=True), page=page, nav=nav, logo=LOGO,
                          url=page_url(page), site=SITE_URL, og_type='article' if page == 'mm-fragrances' else 'website',
                          robots='noindex, follow' if page == '404' else 'index, follow, max-image-preview:large, max-snippet:-1',
                          jsonld=jsonld(page, title, desc, main),
                          cta_current=' aria-current="page"' if active == 'contact' else '')
        out += '\n  <main>\n' + main.rstrip() + '\n  </main>\n' + FOOT.format(svc_links=svc_links)
        out = versioned(out)
        if page == '404':
            # servie à n'importe quelle adresse : liens absolus
            out = re.sub(r'(href|src)="(?![a-z]+:|#|/)', r'\1="/', out)
            # et les chemins construits en JavaScript (oiseau, assistant) aussi
            out = out.replace('<head>\n', '<head>\n  <base href="/">\n', 1)
        with open(os.path.join(ROOT, page + '.html'), 'w', encoding='utf-8') as f:
            f.write(out)
        print('ok', page + '.html')
    write_prompts()
    write_seo_files()


GUIDE = """## Quel modèle utiliser

**Nano Banana Pro** (Gemini 3 Pro Image) : c'est le plus soigné des modèles d'image de Google, le meilleur pour
les rendus produit, la cohérence d'un personnage et les mots écrits sur les écrans. Dans l'application Gemini,
choisis « Créer des images » puis le modèle **Pro** (ou « Réflexion ») s'il est proposé. À défaut, **Nano Banana
2.1** (le modèle par défaut, plus rapide) donne de très bons résultats avec ces prompts.

« Hydrogen » (Gemini 4 Hydrogen) n'est pas un modèle d'image : il ne fait que du texte.

## Comment travailler

1. **Une conversation Gemini par style** (A, B, C, D, plus bas). La première image réussie fixe le rendu : les
   suivantes de la même conversation lui ressembleront.
2. **Joins des images de référence** au premier message de chaque conversation :
   - style C (le martin-pêcheur) : ton logo en PNG et la planche `assets/img/mascotte/kf-planche.webp` ;
   - styles A, B et D : la première image que tu trouves réussie, pour les suivantes (« même rendu, même lumière »).
3. **Choisis le format indiqué** pour chaque image (menu de format de Gemini, ou ajoute « 16:9 » au message).
4. **Colle le prompt en entier**, tel quel : il contient la direction artistique, le style, la scène et le format.
5. **Retouche dans la même conversation**, une chose à la fois : « Garde tout, mais rends le bouton plus grand »,
   « Même image, sans la tasse », « Corrige le mot du bouton : Réserver ». Ne relance pas de zéro pour un détail.
6. **Vérifie les mots** sur les écrans (accents, fautes) : demande une correction si besoin.

## Livrer une image

Enregistre-la en PNG avec le nom indiqué (par exemple `col-site.png`) dans `assets/img/pages/src/`, puis :

```bash
python3 tools/convertir_images.py
```

Le script la recadre au format exact de son emplacement, la convertit en WebP (1600 et 800 px) et régénère les
pages : elle remplace aussitôt l'ancienne.
"""

FAMILY_ORDER = ('device', 'scene', 'mascot', 'mono')


def images_used():
    used = {}
    for page, *_ in PAGES:
        with open(os.path.join(PARTS, page + '.html'), encoding='utf-8') as f:
            t = f.read()
        names = re.findall(r'\{\{img:([\w-]+)', t)
        if '{{services-grid' in t:
            names += [c[1] for c in SVC_CARDS]
        if '{{partner}}' in t:
            names.append('moumous-hero')
        for n in names:
            used.setdefault(n, []).append(page)
    return used


def prompt_block(n, used, num):
    r, alt, fam, _ = IMAGES[n]
    L = ['## %s. %s → `%s.png`' % (num, alt, n), '',
         '*Style %s · format Gemini **%s** · pages : %s · %s*' % (
             FAMILY_NAMES[fam], GEMINI_RATIO.get(r, r.replace('/', ':')), ', '.join(sorted(set(used[n]))),
             'déjà en ligne, à refaire en mieux' if has_image(n) else 'manque encore')]
    if not has_image(n) and n in FALLBACK:
        L += ['', "*En attendant : l'image `%s` tient la place.*" % FALLBACK[n]]
    L += ['', '```text', full_prompt(n), '```', '']
    return L


def write_prompts():
    used = images_used()
    ai = [n for n in IMAGES if n in used and IMAGES[n][2] not in ('capture', 'photo')]
    real = [n for n in IMAGES if n in used and IMAGES[n][2] in ('capture', 'photo')]
    # 1. PROMPTS-IMAGES.md : toutes les images IA du site, par style
    L = ['# Prompts des images du site', '',
         "Ce fichier est réécrit par `tools/build_pages.py` à partir de `tools/images_prompts.py` (modifier les "
         "prompts là-bas). Il contient toutes les images générées du site (%d), regroupées par style." % len(ai), '',
         GUIDE.strip(), '']
    num = 0
    for fam in FAMILY_ORDER:
        names = [n for n in ai if IMAGES[n][2] == fam]
        if not names:
            continue
        L += ['---', '', '# Style %s (%d images)' % (FAMILY_NAMES[fam], len(names)), '']
        for n in names:
            num += 1
            L += prompt_block(n, used, num)
    if real:
        L += ['---', '', "# Vraies images à fournir (pas d'IA)", '']
        for n in real:
            r, alt, fam, prompt = IMAGES[n]
            L += ['- **`%s.png`** — %s (format %s). %s%s' % (n, alt, r.replace('/', ':'), prompt,
                                                           '' if not has_image(n) else ' *(déjà fournie)*')]
        L += ['']
    with open(os.path.join(ROOT, 'PROMPTS-IMAGES.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(L))
    print('ok PROMPTS-IMAGES.md (%d images)' % len(ai))

    # 2. PROMPTS-MASCOTTE.md : la partie « images des pages » renvoie au nouveau fichier
    path = os.path.join(ROOT, 'PROMPTS-MASCOTTE.md')
    doc = open(path, encoding='utf-8').read()
    start, end = '<!-- IMAGES DES PAGES : début -->', '<!-- IMAGES DES PAGES : fin -->'
    block = '\n'.join([start, '', '# Images des pages du site', '',
                       "Les prompts des images des pages sont dans **`PROMPTS-IMAGES.md`** (et ceux qui manquent "
                       "encore dans `PROMPTS-A-FAIRE.md`).", '', end])
    if start in doc:
        doc = doc[:doc.index(start)] + block + doc[doc.index(end) + len(end):]
    else:
        doc = doc.rstrip() + '\n\n---\n\n' + block + '\n'
    open(path, 'w', encoding='utf-8').write(doc)

    # 3. PROMPTS-A-FAIRE.md : seulement ce qui manque encore
    todo_ai = [n for n in ai if not has_image(n)]
    todo_real = [n for n in real if not has_image(n)]
    L = ['# Images à faire', '',
         "Ce fichier ne liste que les images qui manquent encore (%d à générer, %d vraies à fournir). Pour refaire "
         "toutes les images du site en mieux : `PROMPTS-IMAGES.md`." % (len(todo_ai), len(todo_real)), '',
         GUIDE.strip(), '']
    for i, n in enumerate(todo_ai, 1):
        L += prompt_block(n, used, i)
    if todo_real:
        L += ["## Vraies images à fournir (pas d'IA)", '']
        for n in todo_real:
            r, alt, fam, prompt = IMAGES[n]
            L += ['- **`%s.png`** — %s (format %s). %s' % (n, alt, r.replace('/', ':'), prompt)]
        L += ['']
    with open(os.path.join(ROOT, 'PROMPTS-A-FAIRE.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(L))
    print('ok PROMPTS-A-FAIRE.md (%d à générer, %d à fournir)' % (len(todo_ai), len(todo_real)))


if __name__ == '__main__':
    build()
