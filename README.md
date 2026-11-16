# ZkilZ — studio digital

Site du studio ZkilZ : sites, applications, SaaS, outils sur mesure et conseil. Réseaux sociaux, marketing et référencement : partenaire Studio Moumous.
Direction artistique : bleu et blanc. Mascotte : un martin-pêcheur (l'ascension, la précision, la technique),
dessiné en SVG et animé avec GSAP (skill `.claude/animate-2d`).

## Lancer en local

```bash
npm start
```

Puis ouvrir **http://localhost:4000**. Le site est statique (HTML, CSS, JS), sans étape de build.

## Les pages

| Page | Fichier |
|---|---|
| Accueil | `index.html` |
| Services, puis un service par page | `services.html`, `site-web.html`, `application-mobile.html`, `saas.html`, `conseil.html` |
| Partenaire Studio Moumous (réseaux, marketing, référencement ; noir et blanc) | `reseaux-sociaux.html` |
| Réalisations et étude de cas | `realisations.html`, `mm-fragrances.html` |
| Méthode, Studio, Contact | `methode.html`, `studio.html`, `contact.html` |
| Légal | `mentions-legales.html`, `confidentialite.html` |

**Modifier une page :** son contenu est dans `tools/pages/<nom>.html`. La barre de navigation, le pied de page et
l'assistant sont communs, dans `tools/build_pages.py`. Après une modification, relancer :

```bash
python3 tools/build_pages.py
```

Le script réécrit les pages `.html` à la racine (le site reste statique, rien à lancer pour le servir) et met à
jour la liste des images dans `PROMPTS-MASCOTTE.md`.

**Ajouter les images :** chaque image manquante s'affiche comme un cadre « Image à venir » avec son nom. Générer
l'image avec son prompt (`PROMPTS-MASCOTTE.md`, partie « Images des pages »), la déposer en PNG ou JPG dans
`assets/img/pages/src/`, puis :

```bash
python3 tools/convertir_images.py
```

## Structure

```
index.html              page d'accueil (et les autres pages .html, voir plus haut)
tools/build_pages.py    fabrique les pages : gabarit commun + tools/pages/*.html + liste des images
tools/convertir_images.py  PNG / JPG de assets/img/pages/src/ → .webp dans assets/img/pages/
assets/js/pages.js      pages : cadres « image à venir », apparition au défilement, mosaïque
assets/css/main.css     styles : tokens clair / sombre, échelle de texte, sections, maquette iPhone
assets/js/nav.js        navbar : anneau lumineux, bulle du lien actif, thème
assets/js/deco.js       le fond : la route de l'oiseau qui se dessine au défilement, repères, ronds dans l'eau, vent
assets/js/bird.js       l'oiseau, animé image par image (planche kf-vol.webp) + GSAP : décollage, battements, planés, sur-place, atterrissage, attente, perchoirs
tools/kf_sprite.py      refait kf-vol.webp à partir des planches de référence (assets/mascotte/Gemini_*)
assets/js/agent.js      assistant en bas à droite
assets/img/kf*.svg      l'oiseau en fichiers statiques (logo, avatar, favicon)
assets/js/main.js       animations (GSAP, ScrollTrigger, Lenis), FAQ, formulaire
assets/img/mascotte/    images générées et détourées (tools/detourer.py), voir PROMPTS-MASCOTTE.md
assets/mascotte/        anciennes images sources du fennec (plus utilisées)
assets/img/work/        captures de la réalisation MM Fragrances
assets/vendor/          gsap 3.15, ScrollTrigger, DrawSVGPlugin, lenis 1.3 (copies locales)
PROMPTS-MASCOTTE.md     prompts pour générer de nouvelles poses
```

## Règles de design suivies

- Aplats de couleur, une seule couleur d'accent, pas de dégradés décoratifs ni d'émojis.
- Texte simple : chaque titre nomme ce dont parle la section, chaque bouton dit ce qu'il fait.
- Rien d'inventé : pas de chiffres, d'avis clients ni de logos qui n'existent pas.
- Mouvements courts, en sortie douce, désactivés avec « réduire les animations ».

## À compléter avant mise en ligne

- **Formulaire de contact** : sur `#contactForm`, renseigner `data-endpoint` (Formspree, route serveur)
  ou `data-email` (ouvre la messagerie du visiteur avec le message prérempli).
- **Mentions légales** et **politique de confidentialité** : compléter les passages entre crochets dans
  `tools/pages/mentions-legales.html` et `tools/pages/confidentialite.html`.
- **Images des pages** : 36 emplacements attendent leur image (voir plus haut).
- **mm-fragrances.fr** : le domaine ne répondait pas lors de la création des pages ; l'étude de cas n'a donc
  plus de lien vers le site en ligne. À remettre quand il est en ligne.
- Liens vers les réseaux sociaux du studio.
