---
name: web-2d-animator
description: Génère des animations 2D vectorielles légères et interactives (SVG + GSAP) pour le web.
---

# Règles de génération d'animation 2D

1. **Architecture SVG modulaire** :
   - Crée un `<svg>` avec un `viewBox` carré propre et des calques `<g id="...">` distincts pour chaque partie articulée (ex: `head`, `ear-left`, `ear-right`, `eyes`, `paw-wave`, `tail`, `bubbles`).
   - Définis explicitement `transform-origin` en coordonnées SVG (`transform-box: fill-box`) sur chaque élément articulé pour éviter les décalages de pivot.

2. **Moteur d'animation (GSAP)** :
   - Produis un module JS autonome utilisant `gsap.timeline()` avec `repeat: -1` et `yoyo: true` pour les boucles d'attente (*idle* : respiration, battement d'oreilles décalé, clignement des yeux aléatoire).
   - Ajoute des déclencheurs interactifs (`mouseenter`, `click`, ou `ScrollTrigger`) pour les réactions (coucou, bulle qui gonfle, saut).
   - Utilise des courbes organiques (`power1.inOut`, `elastic.out(1, 0.5)`).

3. **Performance & Accessibilité** :
   - Anime uniquement les propriétés GPU (`transform`, `opacity`).
   - Encapsule l'animation dans `gsap.matchMedia()` pour respecter `(prefers-reduced-motion: reduce)`.