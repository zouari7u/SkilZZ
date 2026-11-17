"""
ZkilZ — les images des pages : description, direction artistique et prompts.

Utilisé par tools/build_pages.py (emplacements des images, PROMPTS-*.md) et
tools/convertir_images.py (recadrage au format exact de chaque emplacement).

Chaque image : nom → (format de l'emplacement, texte alternatif, famille, scène)
  famille device : rendu produit 3D (écrans, appareils)
  famille scene  : illustration éditoriale en couches
  famille mascot : le martin-pêcheur dans une scène
  famille mono   : Studio Moumous, noir et blanc
  famille capture / photo : vraie image à fournir, pas d'IA

Les prompts sont en anglais : les modèles d'image le suivent plus fidèlement.
Le prompt complet (direction commune + style + scène + format) est assemblé par
full_prompt() : une seule chose à copier-coller par image.
"""

# ---------------------------------------------------------------------------
# DIRECTION ARTISTIQUE COMMUNE (familles bleues)
# ---------------------------------------------------------------------------
BRAND = (
    "Art direction for ZkilZ, a small premium digital studio (websites, mobile apps, SaaS). "
    "Colour palette, strictly: deep navy #0B1B3F, royal blue #1F6BFF, azure #1E9BFF, light azure #8FDBFF, "
    "ice blue #E1EBFF and white, with soft neutral greys. No orange, red, yellow, green or purple anywhere. "
    "Mood: calm, precise, optimistic, high-end; one clear focal point, generous negative space, nothing cluttered. "
    "Light: soft diffused key light from the upper left, gentle contact shadows, no harsh contrast.")

STYLES = {
    'device': (
        "Style: premium 3D product render in the spirit of a keynote presentation. Generic modern devices "
        "(no real brand, no logo, no camera bump details), thin dark bezels, satin aluminium and glass rendered "
        "with realistic materials. The devices stand on a minimal set: an ice-blue seamless backdrop (#E1EBFF) "
        "with one or two rounded matte pedestals or soft geometric blocks in ice blue and white. 50 mm lens, eye "
        "level or slight three-quarter view, very shallow depth of field on the background only, soft ambient "
        "occlusion, subtle floor reflection. The on-screen interfaces are invented but look like a real, finished "
        "product: clean grid, rounded cards, generous spacing, navy titles, royal-blue buttons, crisp icons. "
        "On-screen text: only the few short French words given in the scene, written plainly (never inside quotation "
        "marks or guillemets), large and perfectly spelled; every "
        "other line of text is a soft grey placeholder line, never fake gibberish words."),
    'scene': (
        "Style: refined editorial vector illustration, like the illustrations of a premium software brand. Flat "
        "shapes built in layers with real depth: each object has two or three tones of the same blue, soft long "
        "shadows at low opacity, gentle ambient occlusion where objects touch. Matte finish, perfectly clean "
        "edges, no outlines, no texture, no gradient backgrounds. Objects have believable proportions and are "
        "arranged with care, like a styled flat-lay photographed from above. Any writing is drawn as soft rounded "
        "lines, never readable letters."),
    'mascot': (
        "Style: the same flat vector style as the attached ZkilZ logo (a kingfisher inside a circle): clean "
        "geometric shapes, smooth soft gradients inside each shape, small light-azure spots on the wing, "
        "a few stylised leaves. The scene around the bird is a refined editorial illustration with layered depth, "
        "soft long shadows at low opacity, matte finish, no outlines, no texture. Any writing is drawn as soft "
        "rounded lines, never readable letters."),
    'mono': (
        "Art direction for Studio Moumous, a content and marketing studio: strictly black, white and greys, no "
        "colour at all. Style: high-end black-and-white editorial studio photography (or a photoreal 3D render "
        "that looks like it), seamless light-grey backdrop (#F2F2F2), one large soft key light with crisp but "
        "soft shadows, strong graphic composition, deep blacks and clean whites, like a fashion or design "
        "magazine still life. Generic objects only: no real brand, no real logo. On-screen or printed text: only "
        "the few short French words given in the scene, perfectly spelled; everything else is solid black or grey "
        "bars. No kingfisher, no blue."),
}

CHARACTER = (
    "Main character: the ZkilZ kingfisher, exactly as in the attached logo and reference sheet. A compact "
    "kingfisher with a large rounded royal-blue crown (#2F7BFF to #1F5FD6), a light-azure cheek patch, a white "
    "throat with a light-azure collar band, a long straight dagger-shaped navy beak, a round black eye with one "
    "white highlight and a small white spot in front of it, a deep-blue wing (#1E5CC8 to #174CA8) with a darker "
    "navy lower edge and a few small light-azure spots, a bright azure stripe down the back, a short blue tail, "
    "small navy feet. Only blues and white on the bird. Calm, precise, focused expression. Same proportions in "
    "every image.")

AVOID = (
    "Avoid: text other than the words specified, misspelled words, quotation marks or guillemets around words, real brand logos, watermark, people's faces, "
    "extra fingers, warped or melted device shapes, cluttered composition, neon glow, lens flare, colours outside "
    "the palette.")

# format de l'emplacement → format à choisir dans Gemini
GEMINI_RATIO = {'4/3': '4:3', '3/4': '3:4', '16/9': '16:9', '16/10': '16:9', '33/14': '21:9', '4/5': '4:5'}


def full_prompt(name):
    r, alt, fam, scene = IMAGES[name]
    parts = []
    if fam == 'mono':
        parts.append(STYLES['mono'])
    else:
        parts.append(BRAND)
        if fam == 'mascot':
            parts.append(CHARACTER)
        parts.append(STYLES[fam])
    parts.append('Scene: ' + scene)
    parts.append('Format: %s aspect ratio, high resolution (2K or more), the whole subject inside the frame with '
                 'a comfortable margin.' % GEMINI_RATIO.get(r, r.replace('/', ':')))
    parts.append(AVOID if fam != 'mono' else AVOID.replace(', colours outside the palette', ', any colour'))
    return '\n\n'.join(parts)


# ---------------------------------------------------------------------------
# LES IMAGES
# ---------------------------------------------------------------------------
IMAGES = {
    # --- Accueil : la mosaïque --------------------------------------------
    'col-site': ('4/3', "Un site vitrine affiché sur un ordinateur portable", 'device',
        "An open laptop in three-quarter front view, standing on a low rounded ice-blue pedestal. The screen shows "
        "a finished showcase website for a local bakery-café: a wide hero photo area filled with a soft abstract "
        "royal-blue and azure composition of overlapping circles, the large headline Bienvenue in navy, one "
        "royal-blue pill button Réserver, and below it a row of three rounded cards with small blue "
        "illustrations. A small white ceramic cup and a closed navy notebook sit next to the laptop, slightly out "
        "of focus. Laptop occupies about 70 % of the width, centred."),
    'col-app': ('4/3', "Deux écrans d'une application de réservation sur téléphone", 'device',
        "Two modern smartphones standing upright side by side on an ice-blue surface, slightly turned toward each "
        "other, the left one a little in front. Left screen: a booking app home with a horizontal calendar strip, "
        "three rounded time-slot chips, the middle one filled royal blue, and a large button Réserver. Right "
        "screen: a confirmation screen with a big white check mark inside a royal-blue circle, the word "
        "Confirmé and a summary card. A soft white geometric block behind them adds depth."),
    'col-saas': ('4/3', "Un tableau de bord de logiciel en ligne sur un grand écran", 'device',
        "A large thin-bezel desktop monitor on a slim aluminium stand, front three-quarter view, on a white desk "
        "surface against the ice-blue backdrop. The screen shows a polished SaaS dashboard in light mode: a navy "
        "left sidebar with simple icons, four KPI cards on top (one shows +24 % in royal blue), a smooth "
        "royal-blue line chart with a pale azure area beneath, and a tidy table with small status pills. A wireless "
        "keyboard in front, slightly blurred."),
    'col-reel': ('3/4', "Un reel vertical sur un téléphone", 'device',
        "A smartphone held upright, seen straight on, floating slightly above an ice-blue pedestal with a soft "
        "shadow. The screen shows a vertical short video frame: a bold abstract composition with a large royal-blue "
        "circle and an azure diagonal band, a heart, a comment and a share icon stacked on the right edge, a thin "
        "white progress bar at the bottom. Two small rounded ice-blue shapes float around the phone."),
    'col-marque': ('4/3', "Une planche d'identité visuelle : logo, couleurs, typographie", 'scene',
        "A carefully styled flat-lay seen from directly above on an ice-blue desk: a large round logo mark made of "
        "simple geometric shapes, a fan of four colour swatch cards (navy, royal blue, azure, white), a big type "
        "specimen card with a bold Aa drawn as clean shapes, two stacked business cards, a closed notebook "
        "with an elastic band, and a pencil, all aligned on an invisible grid with even spacing."),
    'col-grille': ('3/4', "Le profil d'une marque sur un réseau social : une grille de publications", 'device',
        "A smartphone seen straight on, standing on an ice-blue pedestal. The screen shows a social media profile: "
        "a round avatar with a simple blue geometric logo, three counters as short bars, and a 3 × 3 grid of square "
        "posts that clearly belong to one coherent brand: blue and white circles, diagonals, a product silhouette, "
        "a quote card with large quotation marks, alternating light and navy tiles."),

    # --- Services : le martin-pêcheur dans chaque métier ------------------
    'svc-site': ('16/9', "Le martin-pêcheur posé sur l'écran d'un ordinateur portable qui affiche un site", 'mascot',
        "The kingfisher is perched on the top edge of an open laptop, leaning forward and looking down at the "
        "screen with interest. The screen shows a clean showcase website: a big blue hero shape and three rounded "
        "cards. Around the laptop, three small rounded interface cards float at different depths (an image card, a "
        "text card, a toggle), casting soft shadows. Flat ice-blue background (#E1EBFF) with one large pale circle "
        "behind the scene. Wide composition: laptop and bird in the right half, calm empty space on the left."),
    'svc-app': ('16/9', "Le martin-pêcheur à côté d'un téléphone qui affiche une application", 'mascot',
        "The kingfisher stands on a small rounded block next to a smartphone that is as tall as it is, touching "
        "the screen with the tip of one wing as if tapping a button. The screen shows a simple app home: rounded "
        "cards, a progress ring and a royal-blue tab bar. A few stylised blue leaves at the base. Flat ice-blue "
        "background with one large pale circle. Wide composition, subject in the right half, empty space on the left."),
    'svc-saas': ('16/9', "Le martin-pêcheur devant un tableau de bord avec des graphiques", 'mascot',
        "The kingfisher is perched on the top corner of a large floating dashboard panel, looking at a rising "
        "royal-blue line chart with a small glowing dot at its highest point. Three KPI cards and two small round "
        "charts float around like a tidy workspace, at different depths with soft shadows. Flat ice-blue "
        "background with one large pale circle. Wide composition, subject in the right half, empty space on the left."),
    'svc-reseaux': ('16/9', "Le martin-pêcheur au milieu de trois téléphones qui affichent des reels", 'mascot',
        "Three vertical smartphones stand in a gentle arc, each showing a different bold vertical video frame in "
        "blue and white. The kingfisher hovers in front of the middle phone, wings raised, as if it had just flown "
        "out of the screen, with two small blue leaves drifting behind it. Flat ice-blue background with one large "
        "pale circle. Wide composition, subject in the right half, empty space on the left."),
    'svc-conseil': ('16/9', "Le martin-pêcheur penché sur un plan de travail, entre l'ancien tableur et le nouvel outil", 'mascot',
        "On a clean desk, two screens side by side: on the left an old cluttered spreadsheet drawn as a dense grey "
        "grid with a few highlighted cells, on the right a clean custom app with three rounded royal-blue cards. A "
        "thin dotted arrow curves from the spreadsheet to the app, and the kingfisher stands between them, pointing "
        "its beak along the arrow. Flat ice-blue background with one large pale circle. Wide composition, subject "
        "in the right half, empty space on the left."),

    # --- Conseil et transition --------------------------------------------
    'conseil-etat-des-lieux': ('4/3', "L'état des lieux : les tâches d'une journée de travail posées sur la table", 'scene',
        "A top-down view of a work table during an audit session: printed spreadsheets with dense grey grids, "
        "sticky notes in two blues grouped into three neat columns, a large sheet with a hand-drawn flow of boxes "
        "and arrows, an open laptop showing a cluttered spreadsheet, a pen and a white cup. Calm and organised, "
        "even spacing, ice-blue table."),
    'conseil-solutions': ('16/9', "Deux pistes comparées côte à côte : un logiciel existant et un outil sur mesure", 'device',
        "Two laptops side by side on a long ice-blue pedestal, a thin vertical white divider panel between them. "
        "Left laptop: a generic off-the-shelf software screen crowded with grey menus, tabs and tiny icons. Right "
        "laptop: a simple custom app with only three large rounded royal-blue cards and a clear button Valider. "
        "In front of each laptop, a small white card with three bars and a check mark, like a comparison sheet."),
    'conseil-transition': ('16/9', "La bascule : les données d'un tableur passent dans le nouvel outil", 'device',
        "On the left, a laptop showing a dense grey spreadsheet; on the right, a laptop and a phone showing the same "
        "data in a clean custom app with royal-blue cards. Between them, a gentle stream of small rounded white "
        "and azure tiles (data rows) floats along a thin curved dotted path from left to right, getting more "
        "organised as it travels. Ice-blue set, soft shadows."),
    'conseil-equipe': ('4/3', "La prise en main : l'outil montré à l'équipe sur un grand écran", 'scene',
        "A small bright meeting room seen from behind the team: a large wall screen shows a simple custom app "
        "dashboard in royal blue; three people seen from behind as simple flat silhouettes in navy and blue "
        "clothes (no faces), one standing and pointing at the screen, two seated with laptops open on a white "
        "table. A plant with a blue pot in the corner. Ice-blue walls, calm and friendly."),

    # --- Studio Moumous (noir et blanc) ------------------------------------
    'moumous-hero': ('16/9', "Trois téléphones qui affichent des contenus de réseaux sociaux, en noir et blanc", 'mono',
        "Three smartphones standing in a gentle arc on a low matte black plinth, each showing a different vertical "
        "social media frame: a bold typographic quote card with the word Nouveau in heavy black type, a "
        "high-contrast black-and-white product photo of a perfume bottle, a profile grid of nine squares. Large "
        "soft key light from the left, long soft shadows to the right. Wide composition with space on the left."),
    'moumous-reseaux': ('16/9', "Le storyboard d'un reel, en noir et blanc", 'mono',
        "A storyboard sheet lying on a light-grey desk, seen from above at a slight angle: six vertical frames in "
        "two rows, each a bold black-and-white composition (product appears, close-up, text card drawn as bars, "
        "logo reveal), small hand-drawn arrows between frames, a thick black marker and a few loose paper strips "
        "next to the sheet. Crisp shadows from a single soft light."),
    'moumous-identite': ('4/3', "Une planche d'identité visuelle : logo, typographies et papeterie, en noir et blanc", 'mono',
        "A flat-lay brand identity board on a light-grey surface, seen from directly above: a bold abstract "
        "monogram logo printed large on a black card, black, white and grey swatches in even steps, a type "
        "specimen card with a huge Aa, a business card, an envelope and a black notebook, all perfectly "
        "aligned on a grid with crisp shadows."),
    'moumous-referencement': ('3/4', "Une page de résultats de recherche avec une courbe de visites qui monte, en noir et blanc", 'mono',
        "A smartphone standing upright on a black plinth, seen straight on: the screen shows a list of search "
        "results drawn as black and grey bars, the first result highlighted with a thick black outline and a small "
        "1 badge. Next to the phone, a small white card floats with a bold black line chart rising to the "
        "right. Soft key light from the upper left."),

    # --- Site web ----------------------------------------------------------
    'site-maquettes': ('16/9', "De la maquette en gris au site final, sur ordinateur et téléphone", 'device',
        "Three stages of the same web page, left to right, on three floating panels at different depths: a grey "
        "wireframe of boxes, then a coloured design mock-up in navy, royal blue and white, then the finished page "
        "on a laptop with a phone beside it showing the mobile version, headline Bienvenue. A thin dotted line "
        "connects the three stages. Airy, ice-blue set."),
    'site-mobile': ('3/4', "Un site vu sur téléphone, avec le menu ouvert", 'device',
        "A smartphone seen straight on, standing on an ice-blue pedestal, showing a mobile website with a rounded "
        "navigation sheet opened from the bottom: four menu rows with small icons and a large royal-blue button "
        "Contact. The page behind the sheet is softly dimmed. A finger-shaped soft shadow suggests a tap."),
    'site-admin': ('16/9', "L'écran d'administration où l'on change un texte et une photo", 'device',
        "A laptop in three-quarter view showing a simple, friendly content editor: a list of pages on the left, a "
        "form in the centre with a title field, an image upload box with a thumbnail, a price field, and a "
        "royal-blue toggle labelled Publier. A small floating card next to the laptop shows Enregistré with "
        "a check mark. Ice-blue set."),
    'site-boutique': ('4/3', "Une fiche produit de boutique en ligne avec le bouton d'achat", 'device',
        "A laptop and a phone showing the same online shop product page: a large product photo of an elegant "
        "glass bottle on a pale blue background, a price, size chips and a big royal-blue button Ajouter au "
        "panier. The phone leans against a rounded white block in front of the laptop. Ice-blue set."),

    # --- Application mobile ------------------------------------------------
    'app-prototype': ('16/9', "Le parcours d'une application : cinq écrans reliés par des flèches", 'device',
        "Five smartphone screens floating in a gentle wave from left to right on an ice-blue canvas, linked by thin "
        "curved navy arrows like a clickable prototype: welcome, sign-up, home, detail, confirmation. Rounded "
        "cards and royal-blue buttons; the welcome screen says Bonjour. Soft shadows under each screen."),
    'app-main': ('3/4', "L'écran d'accueil de l'application, entouré de deux cartes", 'device',
        "A smartphone slightly tilted, standing on an ice-blue pedestal, showing an app home: a greeting Bonjour "
        "Léa, a large royal-blue card with a white progress ring at 72 %, and two smaller cards below. Two rounded "
        "white cards float around the phone at different depths: a reminder card with a small blue dot and a "
        "progress card with a ring."),
    'app-notif': ('3/4', "L'écran verrouillé d'un téléphone avec les notifications de l'application", 'device',
        "A smartphone lock screen seen straight on: a large clock 9:41, a soft abstract blue wallpaper of "
        "overlapping circles, and three stacked rounded notification cards from the same app, each with a small "
        "royal-blue round icon. The phone rests on an ice-blue pedestal."),
    'app-icone': ('4/3', "L'icône de l'application sur l'écran d'accueil d'un téléphone", 'device',
        "Close-up, slightly angled, of a smartphone home screen grid of app icons, all in muted light greys, except "
        "one glossy royal-blue rounded icon with a simple white geometric symbol, raised above the screen with a "
        "soft shadow as if it has just been installed. Shallow depth of field on the other icons."),

    # --- SaaS ----------------------------------------------------------------
    'saas-dashboard': ('16/9', "Le tableau de bord d'un logiciel en ligne, avec graphiques et indicateurs", 'device',
        "A wide browser window floating in three-quarter view above an ice-blue set, showing a polished SaaS "
        "dashboard: left sidebar, a header with a search field, four KPI cards, a bar chart and a line chart in "
        "royal blue and azure, and a recent activity list. Title Tableau de bord. A second smaller window "
        "peeks from behind, slightly blurred."),
    'saas-onboarding': ('16/9', "Les trois étapes d'inscription d'un logiciel en ligne", 'device',
        "Three browser windows overlapping diagonally like cards in a hand, showing the steps of an onboarding: "
        "Créer un compte with two fields, Choisir une offre with three plan cards (the middle one in royal "
        "blue), Inviter l'équipe with round avatars as plain coloured circles. Ice-blue set, soft shadows."),
    'saas-roles': ('4/3', "La gestion des accès : chaque membre de l'équipe a son rôle", 'device',
        "A browser window showing a team settings table: rows with round avatars (plain blue circles, no faces), "
        "names as grey lines, and a role pill on each row Admin, Éditeur, Lecteur in different blues, "
        "plus a royal-blue button Inviter. A small floating permission card with a toggle sits in front."),
    'saas-mobile': ('3/4', "Le même logiciel, sur téléphone", 'device',
        "A smartphone on an ice-blue pedestal showing the mobile version of a SaaS dashboard: a stacked column of "
        "KPI cards, a compact royal-blue line chart, a bottom tab bar. Behind it, out of focus, a laptop shows the "
        "same dashboard, to suggest the same product on every screen."),

    # --- Réseaux sociaux -------------------------------------------------
    'reseaux-storyboard': ('16/9', "Le storyboard d'un reel : six images clés", 'scene',
        "A storyboard sheet on an ice-blue desk, seen from above: six vertical frames in two rows, each a simple "
        "blue and white composition showing the steps of a short video (product appears, zoom, text card drawn as "
        "lines, logo reveal), small arrows between frames, a pencil and two sticky notes next to the sheet."),
    'reseaux-charte': ('4/3', "La charte des réseaux : couleurs, typographies, modèles de publication", 'scene',
        "A social media style guide board laid flat, seen from above: colour swatches, two type samples drawn as "
        "shapes, and four post templates (quote, product, announcement, carousel cover) in navy, royal blue, "
        "azure and white, neatly aligned with even gutters."),
    'reseaux-motion': ('16/9', "Les étapes d'une animation de logo, image par image", 'scene',
        "A horizontal sequence of five white frames on an ice-blue background showing a simple round logo mark "
        "being drawn: a dot, a growing arc, a full circle, an inner shape appearing, the final mark with a small "
        "bounce. Thin motion guide lines and easing curves link the frames, like an animator's sheet."),
    'reseaux-telephones': ('3/4', "Une story et une publication de la même marque sur deux téléphones", 'device',
        "Two smartphones overlapping slightly, one in front of the other, on an ice-blue pedestal: one shows a "
        "vertical story with a big blue circle and a rounded sticker Nouveau, the other a square post from the "
        "same brand. Same colours, same shapes: one coherent identity."),

    # --- Méthode -----------------------------------------------------------
    'methode-ecouter': ('4/3', "Le premier échange : un carnet, des notes et un appel en visio", 'scene',
        "A flat-lay of a first project meeting seen from above: an open notebook with simple sketches of boxes and "
        "arrows, a laptop showing a video call with two plain circular avatars, a white cup of coffee, a pen and "
        "two sticky notes, on an ice-blue desk. Warm, welcoming, tidy."),
    'methode-concevoir': ('4/3', "Le prototype testé sur un téléphone, à côté des maquettes", 'scene',
        "A desk seen from above with printed screen mock-ups pinned around, and in the centre a simplified flat hand "
        "in a navy sleeve holding a smartphone running the prototype, a "
        "finger about to tap a royal-blue button. Navy, blues and white."),
    'methode-grandir': ('4/3', "Après la mise en ligne : le suivi et les nouvelles fonctions", 'scene',
        "A laptop showing an analytics chart going up in royal blue, next to a small checklist card with three "
        "ticked items and one new item being added, and a phone showing a new post ready to publish. Two small "
        "plants in blue pots. Ice-blue desk, seen from slightly above."),

    # --- Studio --------------------------------------------------------------
    'studio-lac': ('33/14', "Le martin-pêcheur posé sur un roseau, au-dessus d'un lac calme au lever du jour", 'mascot',
        "A panoramic landscape at sunrise in shades of blue only: layered navy hills in the distance, a pale white "
        "sun low on the horizon with a soft halo, a pale blue sky, ice-blue water with a few horizontal ripple "
        "lines and the reflection of the hills. On the right third, the kingfisher is perched on a single reed "
        "just above the water, looking far ahead into the light. Lots of open sky on the left. Very calm."),
    'studio-bureau': ('4/3', "Le bureau du studio : ordinateur, croquis et téléphone de test", 'scene',
        "A tidy studio desk seen from above: a laptop with code drawn as coloured lines, an open sketchbook with a "
        "kingfisher doodle in navy ink, a phone used for testing, a fan of blue colour swatches, two pens, and a "
        "plant in a blue pot. Ice-blue desk, everything aligned with even spacing."),
    'studio-portrait': ('4/5', "Portrait du fondateur du studio", 'photo',
        "Vraie photo à fournir (pas d'IA) : un portrait de toi, de face ou de trois quarts, lumière naturelle, fond "
        "uni clair. Format vertical 4:5, au moins 1200 px de large."),

    # --- MM Fragrances (vraies captures) ---------------------------------------
    'mm-catalogue': ('16/10', "Le catalogue de MM Fragrances sur ordinateur", 'capture',
        "Capture d'écran réelle : la page catalogue / collection de mm-fragrances.fr, sur ordinateur (fenêtre de "
        "1440 × 900), en mode sombre, sans barre d'adresse."),
    'mm-quiz': ('16/10', "Le quiz qui aide à trouver son parfum", 'capture',
        "Capture d'écran réelle : le quiz trouver son parfum de mm-fragrances.fr, sur ordinateur, une question "
        "affichée avec ses réponses."),
    'mm-flacon': ('16/10', "Un flacon en 3D sur la fiche produit", 'capture',
        "Capture d'écran réelle : une fiche produit de mm-fragrances.fr sur ordinateur, avec le flacon en 3D bien visible."),
    'mm-conseiller': ('3/4', "Le conseiller virtuel qui répond aux questions, sur téléphone", 'capture',
        "Capture d'écran réelle : le conseiller virtuel de mm-fragrances.fr ouvert sur téléphone (390 × 844), avec une "
        "question et sa réponse."),
}

FAMILY_NAMES = {
    'device': 'B — rendu produit 3D', 'scene': 'A — illustration éditoriale', 'mascot': 'C — le martin-pêcheur',
    'mono': 'D — Studio Moumous, noir et blanc',
}
