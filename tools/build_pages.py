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
    ('index', 'ZkilZ — Studio digital : sites, applications et réseaux sociaux',
     'ZkilZ conçoit et développe des sites, des applications mobiles, des SaaS et des contenus pour les réseaux sociaux.', None),
    ('services', 'Services — ZkilZ',
     'Sites, applications mobiles, SaaS et réseaux sociaux : ce que le studio ZkilZ conçoit et développe pour vous.', 'services'),
    ('site-web', 'Création de site web — ZkilZ',
     'Site vitrine ou boutique en ligne, sur-mesure, rapide sur téléphone et facile à modifier vous-même.', 'services'),
    ('application-mobile', 'Application mobile iOS et Android — ZkilZ',
     "Une application iOS et Android testée sur votre téléphone avant la première ligne de code, puis publiée sur les stores.", 'services'),
    ('saas', 'SaaS et outils métier — ZkilZ',
     "Un logiciel en ligne pour vos clients ou vos équipes : comptes, abonnements, tableaux de bord.", 'services'),
    ('reseaux-sociaux', 'Contenus pour les réseaux sociaux — ZkilZ',
     'Reels, motion design et visuels dans la même identité que votre site.', 'services'),
    ('realisations', 'Réalisations — ZkilZ',
     'Les projets conçus et développés par le studio ZkilZ.', 'realisations'),
    ('mm-fragrances', 'MM Fragrances, étude de cas — ZkilZ',
     "Comment le studio a conçu la boutique en ligne de MM Fragrances, maison de parfums de niche.", 'realisations'),
    ('methode', 'Méthode — ZkilZ',
     "Écouter, concevoir, faire grandir : comment se déroule un projet avec ZkilZ, étape par étape.", 'methode'),
    ('studio', 'Le studio — ZkilZ',
     "ZkilZ, studio digital : qui nous sommes, comment nous travaillons et pourquoi un martin-pêcheur.", 'studio'),
    ('contact', 'Contact — ZkilZ',
     'Racontez votre projet au studio ZkilZ. Le premier échange est gratuit.', 'contact'),
    ('mentions-legales', 'Mentions légales — ZkilZ', 'Mentions légales du site ZkilZ.', None),
    ('confidentialite', 'Politique de confidentialité — ZkilZ', 'Comment ZkilZ traite vos données personnelles.', None),
    ('404', 'Page introuvable — ZkilZ', "Cette page n'existe pas ou plus.", None),
]

NAV = [('services', 'Services'), ('realisations', 'Réalisations'), ('methode', 'Méthode'), ('studio', 'Studio')]

SERVICES = [
    ('site-web', 'Site web'), ('application-mobile', 'Application mobile'),
    ('saas', 'SaaS et outils métier'), ('reseaux-sociaux', 'Réseaux sociaux'),
]

# ---------------------------------------------------------------------------
# IMAGES : nom → (format, texte alternatif, famille, prompt)
#   famille « scene »  : illustration en aplats, fond compris
#   famille « device » : écran ou appareil, interface inventée sans texte lisible
#   famille « mascot » : le martin-pêcheur dans une scène (fiche n° 0 + référence n° 1)
#   famille « capture »: capture d'écran réelle à faire (pas d'IA)
#   famille « photo »  : vraie photo à fournir (pas d'IA)
# ---------------------------------------------------------------------------
IMAGES = {
    # --- Accueil : la mosaïque -------------------------------------------
    'col-site': ('4/3', "Un site vitrine affiché sur un ordinateur portable", 'device',
        "A modern laptop seen from a three-quarter front angle, standing on a plain ice-blue surface. The screen shows a "
        "clean showcase website for a small local business: a large hero photo area filled with a soft abstract blue shape, "
        "a short bold headline drawn as thick navy bars, one rounded royal-blue button, and a row of three rounded cards below."),
    'col-app': ('4/3', "Deux écrans d'une application de réservation sur téléphone", 'device',
        "Two modern smartphones side by side, slightly tilted toward each other. Left screen: a booking app home with a "
        "calendar strip, three rounded time-slot chips, one highlighted in royal blue. Right screen: a confirmation screen "
        "with a large check mark in a blue circle and a summary card."),
    'col-saas': ('4/3', "Un tableau de bord de logiciel en ligne sur un grand écran", 'device',
        "A large desktop monitor with a thin bezel. The screen shows a SaaS dashboard: a left sidebar with icons, four KPI "
        "cards on top, a smooth royal-blue line chart with a light-blue area underneath, and a table of rows with small "
        "status pills."),
    'col-reel': ('3/4', "Un reel vertical sur un téléphone", 'device',
        "A modern smartphone held upright, shown straight on. The screen shows a vertical short video frame: a bold "
        "abstract blue composition with a large circle and a diagonal shape, a heart icon, a comment icon and a share "
        "icon stacked on the right edge, a thin progress bar at the bottom."),
    'col-marque': ('4/3', "Une planche d'identité visuelle : logo, couleurs, typographie", 'scene',
        "A flat-lay brand identity board seen from above on an ice-blue desk: a round logo mark made of simple geometric "
        "shapes, four colour swatches (navy, royal blue, azure, white), a large sample letter 'Aa' drawn as shapes, a "
        "business card and a small notebook, all neatly aligned on a grid."),
    'col-grille': ('3/4', "Le profil d'une marque sur un réseau social : une grille de publications", 'device',
        "A modern smartphone shown straight on. The screen shows a social media profile: a round avatar, three counters "
        "drawn as short bars, and below a 3 x 3 grid of square posts that all share the same blue and white style "
        "(circles, diagonals, a product silhouette, a quote card), clearly one coherent brand."),

    # --- Services : une scène par métier ---------------------------------
    'svc-site': ('16/9', "Le martin-pêcheur posé sur l'écran d'un ordinateur portable qui affiche un site", 'mascot',
        "The kingfisher is perched on the top edge of an open laptop screen, looking down at the website on the screen "
        "(clean showcase site with a big blue hero shape and three cards). Flat ice-blue background (#E1EBFF), a few "
        "floating rounded interface cards around the laptop. Wide composition, the laptop on the right half, empty space "
        "on the left for text."),
    'svc-app': ('16/9', "Le martin-pêcheur à côté d'un téléphone qui affiche une application", 'mascot',
        "The kingfisher stands next to a smartphone that is as tall as it is, one wing pointing at the screen, which shows "
        "a simple app home with rounded cards and a blue tab bar. Flat ice-blue background (#E1EBFF). Wide composition, "
        "subject on the right half."),
    'svc-saas': ('16/9', "Le martin-pêcheur devant un tableau de bord avec des graphiques", 'mascot',
        "The kingfisher is perched on the corner of a floating dashboard panel showing a rising royal-blue line chart and "
        "three KPI cards; small rounded panels float around it like a workspace. Flat ice-blue background (#E1EBFF). Wide "
        "composition, subject on the right half."),
    'svc-reseaux': ('16/9', "Le martin-pêcheur au milieu de trois téléphones qui affichent des reels", 'mascot',
        "Three vertical smartphones stand in a gentle arc, each showing a different vertical video frame in blue and "
        "white; the kingfisher hovers in front of the middle one, wings up, as if it just flew out of the screen. Flat "
        "ice-blue background (#E1EBFF). Wide composition, subject on the right half."),

    # --- Site web ---------------------------------------------------------
    'site-maquettes': ('16/9', "De la maquette en gris au site final, sur ordinateur et téléphone", 'device',
        "Three stages of the same web page side by side from left to right: a grey wireframe of boxes, a coloured design "
        "mock-up in navy, royal blue and white, then the final page on a laptop with a phone next to it showing the "
        "mobile version. Clean, airy, on an ice-blue background."),
    'site-mobile': ('3/4', "Un site vu sur téléphone, avec le menu ouvert", 'device',
        "A smartphone shown straight on, displaying a mobile website with a rounded navigation sheet opened from the "
        "bottom: four menu rows and a large royal-blue call-to-action button. Ice-blue background."),
    'site-admin': ('16/9', "L'écran d'administration où l'on change un texte et une photo", 'device',
        "A laptop showing a simple content editor: on the left a list of pages, in the centre a form with a title field, "
        "an image upload box showing a thumbnail, a price field, and a toggle switch 'publish' in royal blue. Friendly, "
        "uncluttered. Ice-blue background."),
    'site-boutique': ('4/3', "Une fiche produit de boutique en ligne avec le bouton d'achat", 'device',
        "A laptop and a phone showing the same online shop product page: a large product photo area with an abstract "
        "bottle silhouette, a price drawn as a bold bar, size chips and a big royal-blue add-to-cart button. Ice-blue "
        "background."),

    # --- Application mobile ----------------------------------------------
    'app-prototype': ('16/9', "Le parcours d'une application : cinq écrans reliés par des flèches", 'device',
        "Five smartphone screens laid out in a row on an ice-blue canvas, linked by thin curved navy arrows like a "
        "clickable prototype: welcome, sign-up, home, detail, confirmation. Each screen uses rounded cards and royal-blue "
        "buttons, text drawn as grey bars."),
    'app-main': ('3/4', "L'écran d'accueil de l'application, entouré de deux cartes", 'device',
        "A modern smartphone slightly tilted, showing an app home: a greeting bar, a large royal-blue card with a "
        "progress ring and two smaller cards. Two rounded white cards float around the phone: a reminder card with a "
        "small blue dot, and a progress card with a ring. Ice-blue background."),
    'app-notif': ('3/4', "L'écran verrouillé d'un téléphone avec les notifications de l'application", 'device',
        "A smartphone lock screen with a large clock drawn as shapes and three stacked rounded notification cards from the "
        "same app (a small blue round icon on each). Soft blue abstract wallpaper. Ice-blue background."),
    'app-icone': ('4/3', "L'icône de l'application sur l'écran d'accueil d'un téléphone", 'device',
        "Close-up of a smartphone home screen grid of app icons, all in muted grey, except one bright royal-blue rounded "
        "icon with a simple white geometric symbol in the centre, slightly raised with a soft shadow, as if just "
        "installed. Ice-blue background."),

    # --- SaaS -------------------------------------------------------------
    'saas-dashboard': ('16/9', "Le tableau de bord d'un logiciel en ligne, avec graphiques et indicateurs", 'device',
        "A wide browser window showing a SaaS dashboard: left sidebar, a header with a search bar, four KPI cards, a bar "
        "chart and a line chart in royal blue and azure, and a recent activity list. Calm, readable hierarchy. Ice-blue "
        "background."),
    'saas-onboarding': ('16/9', "Les trois étapes d'inscription d'un logiciel en ligne", 'device',
        "Three browser windows overlapping diagonally, showing the steps of an onboarding: create an account (two fields), "
        "choose a plan (three plan cards, the middle one highlighted in royal blue), invite your team (avatars as "
        "circles). Ice-blue background."),
    'saas-roles': ('4/3', "La gestion des accès : chaque membre de l'équipe a son rôle", 'device',
        "A browser window showing a team settings table: rows with round avatars (plain coloured circles, no faces), "
        "names as grey bars, a role dropdown pill on each row (admin, editor, viewer drawn as pills of different blues), "
        "and an 'invite' button in royal blue. Ice-blue background."),
    'saas-mobile': ('3/4', "Le même logiciel, sur téléphone", 'device',
        "A smartphone showing the mobile version of a SaaS dashboard: a stacked column of KPI cards and a compact line "
        "chart in royal blue, a bottom tab bar. Ice-blue background."),

    # --- Réseaux sociaux -------------------------------------------------
    'reseaux-storyboard': ('16/9', "Le storyboard d'un reel : six images clés", 'scene',
        "A storyboard sheet on an ice-blue desk: six vertical frames in two rows, each frame a simple flat blue and white "
        "composition showing the steps of a short video (product appears, zoom, text card drawn as bars, logo reveal), "
        "with small arrows between frames and a pencil next to the sheet."),
    'reseaux-charte': ('4/3', "La charte des réseaux : couleurs, typographies, modèles de publication", 'scene',
        "A social media style guide board laid flat: colour swatches, two type samples drawn as shapes, and four post "
        "templates (quote, product, announcement, carousel cover) all in navy, royal blue, azure and white. Top-down view, "
        "ice-blue background."),
    'reseaux-motion': ('16/9', "Les étapes d'une animation de logo, image par image", 'scene',
        "A horizontal sequence of five frames showing a simple round logo mark being drawn: a dot, a growing arc, a full "
        "circle, an inner shape appearing, the final mark with a small bounce. Flat vector, navy and royal blue on white "
        "frames, ice-blue background, thin motion guide lines between frames."),
    'reseaux-telephones': ('3/4', "Une story et une publication de la même marque sur deux téléphones", 'device',
        "Two smartphones overlapping slightly: one shows a vertical story with a big blue shape and a sticker-like rounded "
        "label, the other shows a square post from the same brand. Same colours, same shapes: one coherent identity. "
        "Ice-blue background."),

    # --- Méthode -----------------------------------------------------------
    'methode-ecouter': ('4/3', "Le premier échange : un carnet, des notes et un appel en visio", 'scene',
        "A flat-lay of a first project meeting seen from above: an open notebook with simple sketches (boxes, arrows), a "
        "laptop showing a video call with two plain circular avatars, a cup and a pen, on an ice-blue desk."),
    'methode-concevoir': ('4/3', "Le prototype testé sur un téléphone, à côté des maquettes", 'scene',
        "A desk seen from above with printed screen mock-ups pinned around, and in the centre a hand holding a smartphone "
        "running the prototype, a finger about to tap a royal-blue button. Flat vector, navy, blues and white."),
    'methode-grandir': ('4/3', "Après la mise en ligne : le suivi et les nouvelles fonctions", 'scene',
        "A laptop showing a simple analytics chart going up in royal blue, next to a small checklist card with three "
        "ticked items and one new item being added, and a phone showing a new post ready to publish. Ice-blue desk."),

    # --- Studio --------------------------------------------------------------
    'studio-lac': ('33/14', "Le martin-pêcheur posé sur un roseau, au-dessus d'un lac calme au lever du jour", 'mascot',
        "Panoramic landscape: a calm lake at sunrise in shades of blue only (navy hills in the distance, pale blue sky, "
        "ice-blue water with a few horizontal ripple lines). On the right third, the kingfisher is perched on a single "
        "reed just above the water, looking far ahead. Lots of open sky on the left. No text."),
    'studio-bureau': ('4/3', "Le bureau du studio : ordinateur, croquis et téléphone de test", 'scene',
        "A tidy studio desk seen from above: a laptop with code drawn as coloured bars, a sketchbook with a kingfisher "
        "doodle in navy ink, a phone used for testing, a colour swatch fan in blues, a plant with blue pot. Ice-blue desk."),
    'studio-portrait': ('4/5', "Portrait du fondateur du studio", 'photo',
        "Vraie photo à fournir (pas d'IA) : un portrait de toi, de face ou de trois quarts, lumière naturelle, fond "
        "uni clair. Format vertical 4:5, au moins 1200 px de large."),

    # --- MM Fragrances (vraies captures) -----------------------------------
    'mm-catalogue': ('16/10', "Le catalogue de MM Fragrances sur ordinateur", 'capture',
        "Capture d'écran réelle : la page catalogue / collection de mm-fragrances.fr, sur ordinateur (fenêtre de "
        "1440 × 900), en mode sombre, sans barre d'adresse."),
    'mm-quiz': ('16/10', "Le quiz qui aide à trouver son parfum", 'capture',
        "Capture d'écran réelle : le quiz « trouver son parfum » de mm-fragrances.fr, sur ordinateur, une question "
        "affichée avec ses réponses."),
    'mm-flacon': ('16/10', "Un flacon en 3D sur la fiche produit", 'capture',
        "Capture d'écran réelle : une fiche produit de mm-fragrances.fr sur ordinateur, avec le flacon en 3D bien visible."),
    'mm-conseiller': ('3/4', "Le conseiller virtuel qui répond aux questions, sur téléphone", 'capture',
        "Capture d'écran réelle : le conseiller virtuel de mm-fragrances.fr ouvert sur téléphone (390 × 844), avec une "
        "question et sa réponse."),
}

FAMILY_RULES = {
    'scene': "SCENE",
    'device': "DEVICE",
    'mascot': "MASCOT",
}

STYLE_SCENE = (
    "Flat vector editorial illustration, geometric and minimal, crisp shapes, very subtle gradients only, no outlines, "
    "no texture. Palette strictly blue and white: navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure "
    "#8FDBFF, ice blue #E1EBFF, white. No orange, red, yellow or green. Any text is drawn as rounded grey or navy bars, "
    "never readable letters. No logos of real brands, no watermark.")
STYLE_DEVICE = (
    "Clean product mock-up, soft studio lighting, minimal and premium, devices with thin dark bezels, gentle soft "
    "shadow on a flat ice-blue background (#E1EBFF). The on-screen interface is invented: palette navy #0B1B3F, royal "
    "blue #1F6BFF, azure #1E9BFF, ice blue and white, rounded corners, generous spacing. All text on screen is drawn "
    "as rounded grey bars, never readable letters. No real brand, no real logo, no watermark, no people's faces.")


def ratio_px(r, w=1600):
    a, b = (int(x) for x in r.split('/'))
    return w, round(w * b / a)


def figure(name, extra=''):
    if name not in IMAGES:
        raise SystemExit('Image inconnue : ' + name)
    r, alt, fam, _ = IMAGES[name]
    w, h = ratio_px(r)
    cls = ('shot ' + ('shot--real ' if fam in ('capture', 'photo') else '') + extra).strip()
    return ('<figure class="%s" style="--r:%s"><img src="%s/%s.webp" alt="%s" width="%d" height="%d" loading="lazy" '
            'decoding="async"><figcaption class="shot-ph" aria-hidden="true"><span>Image à venir</span><b>%s.webp</b>'
            '</figcaption></figure>') % (cls, r, IMG_DIR, name, html.escape(alt, quote=True), w, h, name)


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
  <meta name="theme-color" content="#F5F8FF" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#070C1C" media="(prefers-color-scheme: dark)">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="assets/img/og-zkilz.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="assets/img/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">

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
      <span class="nav-logo">{logo}</span>
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
      <a href="contact.html" class="nav-cta fill-btn" data-fill="#DCE8FF"{cta_current}>Parler de votre projet</a>
      <label class="theme-switch" aria-label="Thème clair ou sombre">
        <input type="checkbox" id="themeToggle">
        <span class="slider" aria-hidden="true">
          <svg class="ts" viewBox="0 0 56 30">
            <defs><mask id="tsMoon" maskUnits="userSpaceOnUse"><rect width="56" height="30" fill="#fff"/><circle class="ts-bite" cx="15" cy="15" r="6.2" fill="#000"/></mask></defs>
            <g class="ts-stars"><circle cx="11" cy="10" r="1"/><circle cx="20" cy="19" r=".85"/><circle cx="9" cy="20" r=".65"/><circle cx="23" cy="9" r=".6"/></g>
            <g class="ts-knob">
              <g class="ts-rays"><path d="M15 4.2v2.4M15 23.4v2.4M4.2 15h2.4M23.4 15h2.4M7.4 7.4l1.7 1.7M20.9 20.9l1.7 1.7M7.4 22.6l1.7-1.7M20.9 9.1l1.7-1.7"/></g>
              <circle class="ts-core" cx="15" cy="15" r="6" mask="url(#tsMoon)"/>
            </g>
          </svg>
        </span>
      </label>
    </div>
  </nav>
'''

FOOT = '''
  <footer class="footer" id="footer">
    <div class="footer-grid">
      <div class="footer-about">
        <p class="footer-tag">Studio digital. Sites, applications et réseaux sociaux.</p>
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
    </div>
    <p class="footer-word" id="footerWord" aria-label="ZkilZ"><b>Z</b><span>k</span><span>i</span><span data-perch="50" data-perch-ink>l</span><b>Z</b></p>
    <div class="footer-bottom">
      <p class="footer-legal">© 2026 ZkilZ</p>
      <nav class="footer-links footer-links--small" aria-label="Informations légales"><a href="mentions-legales.html">Mentions légales</a><a href="confidentialite.html">Confidentialité</a></nav>
    </div>
  </footer>

  <!-- AGENT IA — bulle en bas à droite (assets/js/agent.js).
       Réponses : renseignez data-endpoint sur #agentPanel (ex. /api/chat) ;
       sans adresse, un moteur local répond. -->
  <div class="agent-tip" id="agentTip" hidden>
    <span id="agentTipText"></span>
    <button type="button" class="agent-tip-x" aria-label="Ne plus afficher ces messages"><svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
  </div>
  <button type="button" class="agent-fab" id="agentFab" aria-controls="agentPanel" aria-expanded="false" aria-label="Poser une question à l'assistant ZkilZ">
    <span class="agent-fab-bubble soap" aria-hidden="true"><span class="soap-rim"></span></span>
    <span class="agent-fab-head" aria-hidden="true"><img src="assets/img/kf-head.svg" alt="" width="124" height="124" decoding="async"></span>
    <span class="agent-fab-shine" aria-hidden="true"></span>
    <span class="agent-fab-dot" aria-hidden="true"></span>
  </button>

  <section class="agent-panel" id="agentPanel" role="dialog" aria-modal="false" aria-labelledby="agentTitle" aria-hidden="true" hidden data-lenis-prevent data-endpoint="">
    <div class="agent-peek" aria-hidden="true"><img src="assets/img/kf-head.svg" alt="" width="124" height="124"></div>
    <header class="agent-head">
      <div class="agent-id">
        <p class="agent-title" id="agentTitle">Assistant ZkilZ</p>
        <p class="agent-status"><i aria-hidden="true"></i><span id="agentStatus" aria-live="polite">En ligne</span></p>
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
    <p class="agent-foot">Assistant virtuel du studio. Pour un devis, le formulaire de contact.</p>
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
  <script src="assets/js/deco.js"></script>
  <script src="assets/js/bird.js"></script>
  <script src="assets/js/agent.js"></script>
</body>
</html>
'''

# Blocs réutilisables dans les contenus : {{cta}}, {{services-grid}}
CTA = '''    <section class="cta-sec">
      <div class="cta-band" data-reveal>
        <img class="cta-bird" src="assets/img/mascotte/kf-envol.webp" alt="" width="1184" height="1100" loading="lazy" decoding="async">
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
    ('reseaux-sociaux', 'svc-reseaux', '04', 'Réseaux sociaux', "Reels, motion design et visuels dans votre identité."),
]


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
    return re.sub(r'(href|src)="(assets/(?:css|js)/[\w.-]+\.(?:css|js))"', rep, out)


def logo_svg():
    """Le martin-pêcheur du logo, en SVG dans la page (et non en image) pour
    que nav.js anime la tête, la paupière et le reflet du bec."""
    t = open(os.path.join(ROOT, 'assets', 'img', 'kf-head.svg'), encoding='utf-8').read()
    t = re.sub(r'id="kf(\w+)"', r'id="nv\1"', t).replace('url(#kf', 'url(#nv')
    t = t.replace('<svg xmlns="http://www.w3.org/2000/svg"', '<svg class="nav-kf" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"', 1)
    # reflet qui glissera le long du bec au survol
    t = t.replace('opacity=".8"/></g>', 'opacity=".8"/><path class="kf-glint" d="M156 62.4 C172 63.4 188 66 202 69" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none" pathLength="100"/></g>', 1)
    # la paupière est animée par nav.js (transform en attribut)
    return '\n'.join(l.strip() for l in t.strip().splitlines())


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


def write_prompts():
    path = os.path.join(ROOT, 'PROMPTS-MASCOTTE.md')
    with open(path, encoding='utf-8') as f:
        doc = f.read()
    start, end = '<!-- IMAGES DES PAGES : début -->', '<!-- IMAGES DES PAGES : fin -->'
    used = {}
    for page, *_ in PAGES:
        with open(os.path.join(PARTS, page + '.html'), encoding='utf-8') as f:
            t = f.read()
        names = re.findall(r'\{\{img:([\w-]+)', t)
        if '{{services-grid' in t:
            names += [c[1] for c in SVC_CARDS]
        for n in names:
            used.setdefault(n, []).append(page)
    lines = [start, '', '# Images des pages du site', '',
             "Ces images remplissent les pages du site (accueil, services, méthode, studio…). En attendant tes "
             "versions, des illustrations dessinées en code (`tools/illustrations/`) occupent déjà les emplacements : "
             "une image IA déposée avec le même nom les remplace. Les vraies images (captures, photo) affichent un "
             "cadre « Image à venir » tant qu'elles manquent.", '',
             '**Où les mettre :** exporte chaque image en PNG ou JPG dans `assets/img/pages/src/` avec le nom indiqué, '
             'puis lance `python3 tools/convertir_images.py` : il les redimensionne à 1600 px de large et les '
             'convertit en `.webp` dans `assets/img/pages/`.', '',
             "**Trois styles** : le titre de chaque image dit lequel utiliser.", '',
             '### Style A — illustration en aplats', '', '```text', STYLE_SCENE, '```', '',
             '### Style B — écran ou appareil', '', '```text', STYLE_DEVICE, '```', '',
             "### Style C — le martin-pêcheur dans une scène", '',
             "Colle la **fiche du personnage (n° 0)** au début, joins la **planche n° 1** en image de référence, puis "
             "termine par le style A. Pas de fond vert ici : la scène a son propre fond.", '',
             "Le format (largeur:hauteur) est donné pour chaque image : règle ton générateur dessus.", '']
    groups = [('scene', 'Style A'), ('device', 'Style B'), ('mascot', 'Style C')]
    n = 0
    for fam, style in groups:
        for name, (r, alt, f, prompt) in IMAGES.items():
            if f != fam or name not in used:
                continue
            n += 1
            lines += ['## P%d. %s → `%s.png`' % (n, alt, name), '',
                      '*Pages : %s · format %s · %s*' % (', '.join(sorted(set(used[name]))), r.replace('/', ':'), style),
                      '', '```text', prompt, '```', '']
    lines += ['## Vraies images à fournir (pas d\'IA)', '',
              "Ces images doivent être vraies : une capture de ton site client ou ta photo. Mets-les aussi dans "
              "`assets/img/pages/src/` puis lance le script de conversion.", '']
    for name, (r, alt, f, prompt) in IMAGES.items():
        if f in ('capture', 'photo') and name in used:
            lines += ['- **`%s.png`** (%s, format %s) — %s' % (name, alt, r.replace('/', ':'), prompt)]
    lines += ['', end]
    block = '\n'.join(lines)
    if start in doc:
        doc = doc[:doc.index(start)] + block + doc[doc.index(end) + len(end):]
    else:
        doc = doc.rstrip() + '\n\n---\n\n' + block + '\n'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(doc)
    print('ok PROMPTS-MASCOTTE.md (%d images)' % len(used))


if __name__ == '__main__':
    build()
