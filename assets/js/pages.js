/* ==========================================================================
   ZkilZ — ce qui est commun aux pages intérieures
   · images pas encore générées : cadre « Image à venir » à leur place ;
   · apparition des blocs [data-reveal] au défilement ;
   · images des blocs texte + image : léger décalage au défilement ;
   · mosaïque de l'accueil : défilement continu, ralenti au survol.
   ========================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Images manquantes -----------------------------------------------------
  function missing(img) {
    var f = img.closest('.shot');
    if (f) f.classList.add('is-missing');
  }
  document.querySelectorAll('.shot img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) missing(img);
    img.addEventListener('error', function () { missing(img); });
    img.addEventListener('load', function () { var f = img.closest('.shot'); if (f) f.classList.remove('is-missing'); });
  });

  // --- Mosaïque de l'accueil -------------------------------------------------
  // Chaque rangée glisse d'un seul bloc, piloté ici : sa position est
  // recalculée à chaque image, modulo la largeur d'une bande. Les bandes ne
  // peuvent donc pas se décaler entre elles, et le retour au début ne se voit
  // pas. (Avec une animation CSS par bande, une copie se décalait au
  // rebouclage et la rangée se vidait une seconde.)
  // Images chargées tout de suite : en différé, la copie qui entre arrivait vide.
  document.querySelectorAll('.collage img').forEach(function (img) { img.loading = 'eager'; });
  var rows = Array.prototype.map.call(document.querySelectorAll('.collage-row'), function (row) {
    return { el: row, rev: row.classList.contains('collage-row--rev'), w: 0, speed: 1, target: 1, x: 0, on: true };
  });
  // vitesse en px par seconde (une bande défile en ~60 s sur ordinateur)
  function pxPerSec(r) { return r.w / (r.rev ? 70 : 60); }
  function measure() {
    rows.forEach(function (r) {
      var tracks = r.el.querySelectorAll('.collage-track');
      var first = tracks[0];
      r.w = first.getBoundingClientRect().width;
      if (!r.w) return;
      // assez de copies pour couvrir l'écran plus une bande, quelle que soit la position
      var need = Math.ceil(window.innerWidth / r.w) + 1;
      for (var k = tracks.length; k < need; k++) {
        var c = first.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        r.el.appendChild(c);
      }
    });
  }
  if (rows.length && !reduce) {
    document.documentElement.classList.add('collage-js');
    measure();
    window.addEventListener('load', measure);
    var mTimer = null;
    window.addEventListener('resize', function () { clearTimeout(mTimer); mTimer = setTimeout(measure, 150); });
    // une image qui finit de charger change la largeur des bandes
    document.querySelectorAll('.collage img').forEach(function (img) { if (!img.complete) img.addEventListener('load', measure); });
    rows.forEach(function (r) {
      r.el.addEventListener('pointerenter', function () { r.target = .25; });
      r.el.addEventListener('pointerleave', function () { r.target = 1; });
    });
    // hors de l'écran, on ne calcule rien
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { rows.forEach(function (r) { if (r.el === e.target) r.on = e.isIntersecting; }); }); });
      rows.forEach(function (r) { io.observe(r.el); });
    }
    var last = performance.now();
    (function tick(now) {
      var dt = Math.min(.1, (now - last) / 1000); last = now;
      rows.forEach(function (r) {
        if (!r.w || !r.on) return;
        r.speed += (r.target - r.speed) * Math.min(1, dt * 4);   // ralentit en douceur
        r.x = (r.x + pxPerSec(r) * r.speed * dt) % r.w;
        // à gauche : de 0 à -w ; à droite (rangée inverse) : de -w à 0
        var tx = r.rev ? r.x - r.w : -r.x;
        r.el.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,0,0)';
      });
      requestAnimationFrame(tick);
    })(last);
  }

  if (!(window.gsap && window.ScrollTrigger) || reduce) return;
  gsap.registerPlugin(ScrollTrigger);

  // --- Apparition au défilement --------------------------------------------
  var items = gsap.utils.toArray('[data-reveal]');
  if (items.length) {
    gsap.set(items, { y: 40, opacity: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 88%',
      onEnter: function (batch) { gsap.to(batch, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: .09, overwrite: true }); }
    });
  }

  // --- Images des blocs texte + image : léger décalage ---------------------
  gsap.utils.toArray('.split-media .shot img, .phase-media .shot img, .wide-media .shot img').forEach(function (img) {
    gsap.fromTo(img, { yPercent: -5, scale: 1.1 }, {
      yPercent: 5, scale: 1.1, ease: 'none',
      scrollTrigger: { trigger: img.closest('.shot'), start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  // --- En-tête des pages : l'image entre en douceur ------------------------
  var hm = document.querySelector('.page-hero-media .shot, .page-hero-media img');
  if (hm) gsap.from(hm, { scale: .92, rotation: -2, opacity: 0, duration: 1.4, ease: 'expo.out', delay: .3 });

  // les images arrivent après coup : on recalcule les positions
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
