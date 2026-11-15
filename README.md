# SkilZZ — studio digital

Site vitrine du studio SkilZZ : sites, applications mobiles, SaaS et contenus pour les réseaux sociaux.
Mascotte : un fennec. Style : bulles cartoon mais sérieuses, animations façon iPhone.

## Lancer en local

```bash
npm run dev
```

Puis ouvrir http://localhost:4000. Le site est 100 % statique (HTML / CSS / JS), sans étape de build.

## Structure

```
index.html              page d'accueil
assets/css/main.css     styles (tokens clair / sombre, bulles, navbar, sections)
assets/js/nav.js        navbar : anneau lumineux, bulle du lien actif, menu ···, thème
assets/js/fennec.js     mascotte : regard qui suit le curseur, clignements, oreilles, saut au clic
assets/js/main.js       animations GSAP / ScrollTrigger + défilement doux Lenis
assets/vendor/          gsap 3.15, ScrollTrigger, lenis 1.3 (copies locales, pas de CDN)
assets/img/work/        captures de MM Fragrances (réalisation)
assets/video/           reel produit MM Fragrances (compressé)
```

## À compléter

- **Formulaire de contact** : renseigner `data-endpoint` sur `#contactForm` (Formspree, route Express…).
  Sans adresse, il affiche un message d'aperçu.
- **Liens** Instagram / LinkedIn / TikTok, mentions légales et confidentialité (actuellement `#`).
- Pages suivantes : réalisations détaillées, expertises, contact.
