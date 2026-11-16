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
  // Images chargées tout de suite (en différé, la copie qui entre à l'écran
  // arrivait vide) ; chaque rangée a assez de copies de sa bande pour couvrir
  // l'écran pendant toute la boucle, sinon un trou traversait la rangée.
  document.querySelectorAll('.collage img').forEach(function (img) { img.loading = 'eager'; });
  function fillRows() {
    if (reduce) return;
    document.querySelectorAll('.collage-row').forEach(function (row) {
      var tracks = row.querySelectorAll('.collage-track');
      var first = tracks[0], w = first.getBoundingClientRect().width;
      if (!w) return;
      var need = Math.ceil(window.innerWidth / w) + 1;
      for (var k = tracks.length; k < need; k++) {
        var c = first.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        row.appendChild(c);
      }
      // toutes les bandes repartent ensemble (une copie ajoutée en cours de
      // route serait décalée)
      row.querySelectorAll('.collage-track').forEach(function (t) { t.getAnimations().forEach(function (a) { a.currentTime = 0; }); });
    });
  }
  window.addEventListener('load', fillRows);
  var fillTimer = null;
  window.addEventListener('resize', function () { clearTimeout(fillTimer); fillTimer = setTimeout(fillRows, 200); });

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

  // --- Mosaïque : ralentit au survol ----------------------------------------
  document.querySelectorAll('.collage-row').forEach(function (row) {
    // les bandes sont relues à chaque fois : des copies s'ajoutent après coup
    function rate(r) { row.querySelectorAll('.collage-track').forEach(function (t) { t.getAnimations().forEach(function (a) { a.updatePlaybackRate(r); }); }); }
    row.addEventListener('pointerenter', function () { rate(.25); });
    row.addEventListener('pointerleave', function () { rate(1); });
  });

  // les images arrivent après coup : on recalcule les positions
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
