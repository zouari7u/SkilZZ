/* ==========================================================================
   ZkilZ — effets partagés (survol, clic, curseur)
   · window.SKZ.burst(x, y) : petites bulles qui jaillissent d'un point ;
   · window.SKZ.jelly(el)   : l'élément se déforme comme une bulle puis
     reprend sa forme ;
   · boutons : remplissage arrondi qui part du point d'entrée de la souris
     et repart par le point de sortie, onde au clic, aimant léger ;
   · clic dans le vide : une bulle naît sous le doigt, monte et éclate ;
   · encarts : lueur douce qui suit la souris.
   ========================================================================== */
(function () {
  'use strict';
  if (!window.gsap) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var COLORS = ['#1F6BFF', '#1E9BFF', '#5BB8FF', '#8FB6FF'];

  function bubbleStyle(el, size) {
    el.style.width = el.style.height = size + 'px';
    el.style.marginLeft = el.style.marginTop = (-size / 2) + 'px';
    // petit point net (DA martin-pêcheur : bleu et blanc, pas de reflet)
    el.style.background = Math.random() > .5 ? '#1F6BFF' : '#5BB8FF';
  }

  // Calque attaché au document : les éclats restent à leur place dans la
  // page quand on défile (au lieu de flotter, collés à l'écran)
  var docLayer = document.createElement('div');
  docLayer.className = 'fx-doc';
  docLayer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(docLayer);

  // Petits éclats qui partent d'un point (coordonnées écran) et s'éteignent vite
  function burst(x, y, opts) {
    if (reduce) return;
    opts = opts || {};
    var n = opts.count || 10, spread = opts.spread || 90;
    x += window.scrollX; y += window.scrollY;
    for (var i = 0; i < n; i++) {
      var b = document.createElement('span');
      b.className = 'fx-bub';
      var s = (opts.min || 5) + Math.random() * ((opts.max || 12) - (opts.min || 5));
      bubbleStyle(b, s);
      docLayer.appendChild(b);
      var a = (i / n) * Math.PI * 2 + Math.random() * .6;
      var d = spread * (.55 + Math.random() * .5);
      gsap.fromTo(b, { x: x, y: y, scale: .4, opacity: 1 }, {
        x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, scale: 0, opacity: 0,
        duration: .6 + Math.random() * .25, ease: 'power3.out',
        onComplete: (function (el) { return function () { el.remove(); }; })(b)
      });
    }
  }

  // Éclat de points (bulle qui éclate)
  function pop(x, y, size) {
    if (reduce) return;
    x += window.scrollX; y += window.scrollY;
    for (var i = 0; i < 7; i++) {
      var d = document.createElement('span');
      d.className = 'fx-dot';
      d.style.background = COLORS[i % COLORS.length];
      docLayer.appendChild(d);
      var a = (i / 7) * Math.PI * 2;
      var r = size / 2 + 14 + Math.random() * 10;
      gsap.fromTo(d, { x: x, y: y, scale: 1, opacity: 1 }, {
        x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, scale: .2, opacity: 0,
        duration: .5, ease: 'power3.out', onComplete: (function (el) { return function () { el.remove(); }; })(d)
      });
    }
  }

  // Déformation « gelée »
  function jelly(el, strength) {
    if (reduce || !el) return;
    var k = strength || 1;
    gsap.timeline({ overwrite: true })
      .to(el, { scaleX: 1 + .12 * k, scaleY: 1 - .1 * k, duration: .12, ease: 'power2.out' })
      .to(el, { scaleX: 1, scaleY: 1, duration: .9, ease: 'elastic.out(1.1, .35)' });
  }

  window.SKZ = { burst: burst, pop: pop, jelly: jelly, bubbleStyle: bubbleStyle };

  // --- Boutons : remplissage depuis le point d'entrée ------------------------
  document.querySelectorAll('.fill-btn').forEach(function (btn) {
    var fill = document.createElement('span');
    fill.className = 'btn-fill';
    if (btn.dataset.fill) fill.style.setProperty('--fill', btn.dataset.fill);
    btn.insertBefore(fill, btn.firstChild);
    function place(e) {
      var r = btn.getBoundingClientRect();
      var d = Math.hypot(r.width, r.height) * 2.1;
      fill.style.width = fill.style.height = d + 'px';
      fill.style.left = (e.clientX - r.left) + 'px';
      fill.style.top = (e.clientY - r.top) + 'px';
    }
    if (fine) {
      btn.addEventListener('pointerenter', function (e) { place(e); fill.offsetWidth; btn.classList.add('is-hover'); });
      btn.addEventListener('pointerleave', function (e) { place(e); btn.classList.remove('is-hover'); });
    }
    // Onde au clic + petit enfoncement
    btn.addEventListener('pointerdown', function (e) {
      if (reduce) return;
      var r = btn.getBoundingClientRect();
      var ring = document.createElement('span');
      ring.className = 'btn-ripple';
      var s = Math.max(r.width, r.height);
      ring.style.width = ring.style.height = s + 'px';
      ring.style.left = (e.clientX - r.left - s / 2) + 'px';
      ring.style.top = (e.clientY - r.top - s / 2) + 'px';
      btn.appendChild(ring);
      gsap.fromTo(ring, { scale: .1, opacity: .55 }, { scale: 2.2, opacity: 0, duration: .7, ease: 'power3.out', onComplete: function () { ring.remove(); } });
      gsap.to(btn, { scale: .96, duration: .12, ease: 'power2.out' });
    });
    btn.addEventListener('pointerup', function () { gsap.to(btn, { scale: 1, duration: .6, ease: 'elastic.out(1, .4)' }); });
    btn.addEventListener('pointercancel', function () { gsap.to(btn, { scale: 1, duration: .3 }); });
    btn.addEventListener('pointerleave', function () { gsap.to(btn, { scale: 1, duration: .4, ease: 'power3.out' }); });
  });

  // --- Clic dans le vide : une onde, comme l'oiseau qui touche l'eau --------
  var INTERACTIVE = 'a, button, input, textarea, label, summary, select, .kf, .qa, .cell, .mark, .footer-word, .agent-panel, .agent-tip, .agent-fab';
  document.addEventListener('pointerdown', function (e) {
    if (reduce || e.button !== 0 || e.target.closest(INTERACTIVE)) return;
    var x = e.clientX + window.scrollX, y = e.clientY + window.scrollY;
    for (var i = 0; i < 3; i++) {
      var r = document.createElement('span');
      r.className = 'fx-ring';
      docLayer.appendChild(r);
      gsap.fromTo(r, { x: x, y: y, scale: .1, opacity: .75 }, {
        scale: 1, opacity: 0, duration: .9 + i * .25, delay: i * .12, ease: 'power2.out',
        onComplete: (function (el) { return function () { el.remove(); }; })(r)
      });
    }
  });

  // --- Curseur -----------------------------------------------------------------
  var cur = document.getElementById('cursor');
  if (cur && fine) {
    var cx = gsap.quickTo(cur, 'x', { duration: .22, ease: 'power3' });
    var cy = gsap.quickTo(cur, 'y', { duration: .22, ease: 'power3' });
    window.addEventListener('pointermove', function (e) { cur.classList.add('is-on'); cx(e.clientX); cy(e.clientY); }, { passive: true });
    document.documentElement.addEventListener('mouseleave', function () { cur.classList.remove('is-on'); });
    document.addEventListener('pointerover', function (e) {
      cur.classList.toggle('is-over', !!e.target.closest('a, button, summary, label, .kf, .mark, .footer-word span, .footer-word b'));
    });
    document.addEventListener('pointerdown', function () { cur.classList.add('is-down'); });
    document.addEventListener('pointerup', function () { cur.classList.remove('is-down'); });
  }

  // --- Encarts : lueur qui suit la souris ------------------------------------
  if (fine) {
    document.querySelectorAll('.qa, .form, .pledges li, .cell, .svc-card, .step, .why-copy').forEach(function (el) {
      el.classList.add('glow-card');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--gx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--gy', (e.clientY - r.top) + 'px');
      });
    });
  }

  // --- Gelée au survol : pastilles, étiquettes, lettres du pied de page ------
  if (fine && !reduce) {
    document.querySelectorAll('.chip, .tags li, .pledges li, .choices span, .deliv li svg, .morph-labels span').forEach(function (el) {
      el.addEventListener('pointerenter', function () { jelly(el, .8); });
    });
  }
})();
