# SkilZZ — studio digital

Site vitrine du studio SkilZZ : sites, applications mobiles, SaaS et contenus pour les réseaux sociaux.
Mascotte : un fennec. DA : bleu, touches de vert, blanc. Style : bulles cartoon mais sérieuses, animations façon iPhone.
La mascotte (fennec bleu) : sources Gemini dans `assets/mascotte/`, versions détourées (WebP transparents) dans `assets/img/mascotte/`.
Prompts pour de nouvelles poses : `PROMPTS-MASCOTTE.md`.

## Lancer en local

```bash
npm run dev
```

Puis ouvrir **http://localhost:4000** dans le navigateur (le terminal affiche aussi l'adresse). Le site est 100 % statique (HTML / CSS / JS), sans étape de build.

## Structure

```
index.html              page d'accueil
assets/css/main.css     styles (tokens clair / sombre, échelle de texte, bulles, navbar, maquettes CSS)
assets/js/nav.js        navbar : anneau lumineux, bulle du lien actif, menu ···, thème
assets/js/mascot.js     mascotte : flotte, se penche vers le curseur, saut de joie au clic
assets/js/main.js       animations GSAP / ScrollTrigger + défilement doux Lenis
assets/img/work/        captures réelles de MM Fragrances (réalisation)
assets/video/           reel produit MM Fragrances
assets/vendor/          gsap 3.15, ScrollTrigger, lenis 1.3 (copies locales, pas de CDN)
```

## À compléter

- **Formulaire de contact** : renseigner `data-endpoint` sur `#contactForm` (Formspree, route Express…).
  Sans adresse, il affiche un message d'aperçu.
- **Liens** Instagram / LinkedIn / TikTok, mentions légales et confidentialité (actuellement `#`).
- Pages suivantes : réalisations détaillées, expertises, contact.
