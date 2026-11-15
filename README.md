# SkilZZ — studio digital

Site vitrine du studio SkilZZ : sites, applications, SaaS et contenus pour les réseaux sociaux.
Direction artistique : bleu et blanc. Mascotte : un martin-pêcheur (l'ascension, la précision, la technique),
dessiné en SVG et animé avec GSAP (skill `.claude/animate-2d`).

## Lancer en local

```bash
npm start
```

Puis ouvrir **http://localhost:4000**. Le site est statique (HTML, CSS, JS), sans étape de build.

## Structure

```
index.html              page d'accueil
assets/css/main.css     styles : tokens clair / sombre, échelle de texte, sections, maquette iPhone
assets/js/nav.js        navbar : anneau lumineux, bulle du lien actif, thème
assets/js/kf-art.js     dessin SVG du martin-pêcheur, en calques articulés
assets/js/bird.js       l'oiseau : ascension de l'accueil, vol d'encart en encart, attente, réactions
assets/js/agent.js      assistant en bas à droite
assets/img/kf*.svg      l'oiseau en fichiers statiques (logo, avatar, favicon)
assets/js/main.js       animations (GSAP, ScrollTrigger, Lenis), FAQ, formulaire
assets/img/mascotte/    images générées et détourées (tools/detourer.py), voir PROMPTS-MASCOTTE.md
assets/mascotte/        anciennes images sources du fennec (plus utilisées)
assets/img/work/        captures de la réalisation MM Fragrances
assets/vendor/          gsap 3.15, ScrollTrigger, lenis 1.3 (copies locales)
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
- **Mentions légales** et **politique de confidentialité** (pages à créer, puis lien dans le pied de page).
- Liens vers les réseaux sociaux du studio.
