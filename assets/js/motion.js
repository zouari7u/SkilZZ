/* ==========================================================================
   ZkilZ — animations d'apparition et de survol, sur tout le site
   Tout est déclenché une seule fois, quand le bloc arrive à l'écran
   (IntersectionObserver), puis joué par des transitions CSS sur transform
   et opacity : le navigateur les anime sans recalculer la page, et rien ne
   tourne pendant le défilement.
   · images : un rideau de couleur se retire, l'image se resserre ;
   · titres : les mots montent un à un dans leur masque ;
   · étiquettes : un trait se dessine devant ;
   · grilles de cartes : les cartes basculent en place, l'une après l'autre
     (une seule animation par élément : celles-ci n'en ont plus en GSAP) ;
   · blocs [data-reveal] : ils montent.
   Survol (souris) : cartes et images s'inclinent vers le pointeur, avec un
   reflet ; les boutons principaux sont attirés par le pointeur.
   « Réduire les animations » : rien de tout cela.
   ========================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;
  root.classList.add('mx');

  function $$(s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: .08 });
  function watch(el, cls) { if (!el || el.classList.contains('mx-' + cls)) return; el.classList.add('mx-' + cls); io.observe(el); }

  // 1. images
  $$('main .shot').forEach(function (s) {
    if (s.closest('.collage, .svc-tile, .bento, .page-hero, .mm-plateau')) return;
    watch(s, 'img');
  });
  $$('main .svc-tile .shot, main .project-media').forEach(function (s) { watch(s, 'img'); });

  // 2. titres : mots dans des masques
  $$('main .split-copy h2, main .cta-copy h2, main .case-copy h2, main .moumous-copy h2, main .mono-col h2, main .tiles-sec .head h2:not(.split)').forEach(function (h) {
    if (h.querySelector('.wm')) return;
    var i = 0;
    h.innerHTML = h.innerHTML.split(/(<[^>]+>|\s+)/).map(function (part) {
      if (!part || /^\s+$/.test(part) || part.charAt(0) === '<') return part;
      return '<span class="wm"><span class="wi" style="--w:' + (i++) + '">' + part + '</span></span>';
    }).join('');
    watch(h, 'words');
  });

  // 3. étiquettes (hors en-têtes de section, déjà animées)
  $$('main .label').forEach(function (l) { if (!l.closest('.head, .hero, .work')) watch(l, 'label'); });

  // 4. grilles de cartes
  $$('main .svc-cards, main .extras, main .incl, main .values, main .ways, main .mm-sig-rules, main .moumous-list, main .faq-list, main .pledges, .footer-pledges, main .projects, main .gallery, main .mono-split-inner, main .case-facts').forEach(function (g) {
    $$(':scope > *', g).forEach(function (c, i) { c.style.setProperty('--i', i); c.removeAttribute('data-reveal'); });
    watch(g, 'grid');
  });

  // 5. blocs [data-reveal] restants
  $$('[data-reveal]').forEach(function (el) { watch(el, 'rise'); });

  if (!fine) return;

  // --- Survol : inclinaison vers le pointeur, avec reflet --------------------
  $$('main .svc-tile, main a.project, main .split-media .shot, main .mm-sig-shot .shot, main .partner, main .phase').forEach(function (el) {
    el.classList.add('mx-tilt');
    var raf = 0, nx = 0, ny = 0;
    function apply() {
      raf = 0;
      el.style.setProperty('--rx', (-ny * 5).toFixed(2) + 'deg');
      el.style.setProperty('--ry', (nx * 6).toFixed(2) + 'deg');
      el.style.setProperty('--gx', ((nx + .5) * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', ((ny + .5) * 100).toFixed(1) + '%');
    }
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      nx = (e.clientX - r.left) / r.width - .5; ny = (e.clientY - r.top) / r.height - .5;
      el.classList.add('is-tilt');
      if (!raf) raf = requestAnimationFrame(apply);
    });
    el.addEventListener('pointerleave', function () {
      el.classList.remove('is-tilt'); nx = 0; ny = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    });
  });

  // --- Boutons principaux : attirés par le pointeur --------------------------
  $$('main .btn--primary, main .btn--light, .cta-band .btn').forEach(function (b) {
    b.classList.add('mx-mag');
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect();
      b.style.setProperty('--mgx', ((e.clientX - r.left - r.width / 2) * .1).toFixed(1) + 'px');
      b.style.setProperty('--mgy', '0px');   // horizontal seulement : pas de saut vertical
    });
    b.addEventListener('pointerleave', function () { b.style.setProperty('--mgx', '0px'); b.style.setProperty('--mgy', '0px'); });
  });
})();
