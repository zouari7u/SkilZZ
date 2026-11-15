/* ==========================================================================
   SkilZZ — le martin-pêcheur (SVG + GSAP, skill « animate-2d »)
   Un seul oiseau pour toute la page. Calques articulés (kf-art.js) :
   tête, bec, paupière, aile repliée, deux ailes de vol, queue, pattes,
   chacun avec son pivot en coordonnées SVG (svgOrigin).

   · Accueil : il part du roseau, au ras de l'eau, suit la trajectoire
     tracée et se pose tout en haut (l'ascension).
   · Ensuite il se pose sur le bord des encarts (data-perch="x%" : point
     d'appui le long du bord haut) : quand le visiteur s'arrête de
     défiler, il s'envole vers l'encart le plus proche du haut de l'écran.
   · Posé : il respire, cligne des yeux, hoche la tête, remue la queue,
     suit le curseur du regard. Survol : il s'ébroue. Clic : il fait un
     tour en l'air et revient.
   · « Réduire les animations » : il reste posé, sans mouvement.
   API : window.SKZBird.celebrate() (tour de joie), .perch(el)
   ========================================================================== */
(function () {
  'use strict';
  if (!window.gsap || !window.KF_SVG) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // --- Construction ----------------------------------------------------------
  var VB_W = 220, VB_H = 200;          // viewBox du dessin
  var FOOT_X = 107, FOOT_Y = 159;      // point d'appui (sous les pattes)
  var root = document.createElement('div');
  root.className = 'kf';
  root.setAttribute('role', 'img');
  root.setAttribute('aria-label', 'Le martin-pêcheur, mascotte de SkilZZ');
  root.innerHTML = '<div class="kf-flip"><div class="kf-tilt"><svg viewBox="0 0 ' + VB_W + ' ' + VB_H + '" aria-hidden="true">' + window.KF_SVG + '</svg></div></div>';
  document.body.appendChild(root);

  var flip = root.querySelector('.kf-flip');
  var tilt = root.querySelector('.kf-tilt');
  var q = function (s) { return root.querySelector(s); };
  var P = {
    head: q('.kf-head'), beakLow: q('.kf-beak-low'), lid: q('.kf-lid'),
    fold: q('.kf-wing-fold'), near: q('.kf-wing-near'), far: q('.kf-wing-far'),
    tail: q('.kf-tail'), feet: q('.kf-feet'), body: q('.kf-body')
  };
  // pivots (coordonnées SVG)
  gsap.set(P.head, { svgOrigin: '116 88' });
  gsap.set(P.beakLow, { svgOrigin: '152 72' });
  gsap.set(P.lid, { svgOrigin: '138 55.2', scaleY: 0 });
  gsap.set(P.tail, { svgOrigin: '82 132' });
  gsap.set([P.near, P.far], { svgOrigin: '92 98', opacity: 0, scaleY: .2 });
  gsap.set(P.feet, { svgOrigin: '107 146' });
  gsap.set(P.body, { svgOrigin: '104 150' });

  function size() { return window.innerWidth < 640 ? 64 : window.innerWidth < 1100 ? 84 : 100; }
  var W = size(), H = W * VB_H / VB_W;
  function applySize() {
    W = size(); H = W * VB_H / VB_W;
    root.style.width = W + 'px'; root.style.height = H + 'px';
    gsap.set(flip, { transformOrigin: (FOOT_X / VB_W * 100) + '% ' + (FOOT_Y / VB_H * 100) + '%' });
    gsap.set(tilt, { transformOrigin: '50% 55%' });
  }
  applySize();

  // position : (x, y) = point d'appui en coordonnées document
  var pos = { x: 0, y: 0 }, facing = 1;
  function place() { gsap.set(root, { x: pos.x - W * FOOT_X / VB_W, y: pos.y - H * FOOT_Y / VB_H }); }
  function face(dir) {
    if (dir === facing) return;
    facing = dir;
    gsap.to(flip, { scaleX: dir, duration: .22, ease: 'power2.inOut' });
  }

  // --- Perchoirs -------------------------------------------------------------
  function perchPoint(el) {
    var r = el.getBoundingClientRect();
    var at = parseFloat(el.dataset.perch);
    if (isNaN(at)) at = 85;
    return { x: r.left + window.scrollX + r.width * at / 100, y: r.top + window.scrollY + 1 };
  }
  var current = null, flying = false;

  // --- Attente (posé) -----------------------------------------------------------
  var idle = null, look = { r: 0 };
  function startIdle() {
    stopIdle();
    if (reduce) return;
    idle = gsap.timeline({ repeat: -1 });
    idle.to(P.body, { scaleY: 1.025, scaleX: .99, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0);
    var t = 0;
    for (var i = 0; i < 4; i++) {
      t += 1.2 + Math.random() * 1.6;
      var pick = Math.random();
      if (pick < .3) idle.add(blink(), t);
      else if (pick < .55) idle.add(nod(), t);
      else if (pick < .75) idle.add(tailFlick(), t);
      else if (pick < .9) idle.add(tiltHead(), t);
      else idle.add(chirp(), t);
    }
    idle.to({}, { duration: .5 });
  }
  function stopIdle() { if (idle) { idle.kill(); idle = null; } }
  function blink() { return gsap.timeline().to(P.lid, { scaleY: 1, duration: .07, ease: 'power2.in' }).to(P.lid, { scaleY: 0, duration: .12, ease: 'power2.out' }); }
  function nod() { return gsap.timeline().to(P.head, { rotation: 8, duration: .14, ease: 'power2.out' }).to(P.head, { rotation: -2, duration: .14 }).to(P.head, { rotation: 0, duration: .5, ease: 'elastic.out(1, .5)' }); }
  function tailFlick() { return gsap.timeline().to(P.tail, { rotation: -16, duration: .12, ease: 'power2.out' }).to(P.tail, { rotation: 0, duration: .7, ease: 'elastic.out(1.2, .4)' }); }
  function tiltHead() { var s = Math.random() > .5 ? 1 : -1; return gsap.timeline().to(P.head, { rotation: 12 * s, duration: .35, ease: 'power2.out' }).to(P.head, { rotation: 0, duration: .8, ease: 'elastic.out(1, .5)' }, '+=.7'); }
  function chirp() { return gsap.timeline().to(P.beakLow, { rotation: 10, duration: .08 }).to(P.beakLow, { rotation: 0, duration: .1 }).to(P.beakLow, { rotation: 8, duration: .08 }).to(P.beakLow, { rotation: 0, duration: .25, ease: 'power2.out' }); }

  // --- Vol -----------------------------------------------------------------------
  var flap = null;
  function wingsOut() {
    gsap.to(P.fold, { opacity: 0, duration: .08 });
    gsap.to([P.near, P.far], { opacity: 1, duration: .06 });
    gsap.to(P.feet, { scaleY: .3, duration: .2 });
    if (flap) flap.kill();
    flap = gsap.timeline({ repeat: -1 })
      .fromTo(P.near, { scaleY: 1 }, { scaleY: -.55, duration: .11, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0)
      .fromTo(P.far, { scaleY: .85 }, { scaleY: -.4, duration: .11, ease: 'sine.inOut', yoyo: true, repeat: 1 }, .02);
  }
  function wingsIn() {
    if (flap) { flap.kill(); flap = null; }
    gsap.to([P.near, P.far], { scaleY: .2, opacity: 0, duration: .14, ease: 'power2.in' });
    gsap.to(P.fold, { opacity: 1, duration: .12, delay: .06 });
    gsap.to(P.feet, { scaleY: 1, duration: .25, ease: 'back.out(2)' });
  }

  // Trajet le long d'une courbe de Bézier cubique (coordonnées document)
  function flyCurve(a, c1, c2, b, opts) {
    opts = opts || {};
    flying = true; stopIdle();
    var o = { t: 0 };
    var dist = Math.hypot(b.x - a.x, b.y - a.y);
    var dur = opts.duration || Math.max(.75, Math.min(1.9, dist / 650));
    if (Math.abs(b.x - a.x) > 16) face(b.x > a.x ? 1 : -1);
    var tl = gsap.timeline({ onComplete: function () { land(opts.onLand); } });
    tl.to(P.body, { scaleY: .88, scaleX: 1.06, duration: .1, ease: 'power2.in' })
      .add(wingsOut)
      .to(P.body, { scaleY: 1, scaleX: 1, duration: .2 })
      .to(o, {
        t: 1, duration: dur, ease: opts.ease || 'power1.inOut',
        onUpdate: function () {
          var t = o.t, u = 1 - t;
          pos.x = u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x;
          pos.y = u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y;
          // tangente → inclinaison du corps
          var dx = 3 * u * u * (c1.x - a.x) + 6 * u * t * (c2.x - c1.x) + 3 * t * t * (b.x - c2.x);
          var dy = 3 * u * u * (c1.y - a.y) + 6 * u * t * (c2.y - c1.y) + 3 * t * t * (b.y - c2.y);
          var ang = Math.atan2(dy, Math.abs(dx) + .001) * 180 / Math.PI;
          gsap.set(tilt, { rotation: Math.max(-35, Math.min(35, ang * .55)) });
          place();
        }
      }, '<');
    return tl;
  }
  function land(cb) {
    wingsIn();
    gsap.timeline()
      .to(tilt, { rotation: 0, duration: .3, ease: 'power2.out' }, 0)
      .to(P.body, { scaleY: .9, scaleX: 1.05, duration: .1, ease: 'power2.out' }, .05)
      .to(P.body, { scaleY: 1, scaleX: 1, duration: .6, ease: 'elastic.out(1.1, .4)' })
      .add(function () { flying = false; startIdle(); if (cb) cb(); });
    // l'encart accuse le coup
    if (current && current.el && !reduce) gsap.fromTo(current.el, { y: 0 }, { y: 3, duration: .12, yoyo: true, repeat: 1, ease: 'power2.out', clearProps: 'transform' });
  }

  function flyTo(el, opts) {
    var b = perchPoint(el), a = { x: pos.x, y: pos.y };
    var lift = 70 + Math.min(260, Math.abs(b.x - a.x) * .25 + Math.abs(b.y - a.y) * .15);
    var top = Math.min(a.y, b.y) - lift;
    current = { el: el };
    return flyCurve(a, { x: a.x + (b.x - a.x) * .25, y: top }, { x: a.x + (b.x - a.x) * .75, y: top }, b, opts);
  }
  function snapTo(el) {
    var b = perchPoint(el);
    pos.x = b.x; pos.y = b.y; current = { el: el }; place();
  }

  // Le suivi d'un tracé SVG (la trajectoire de l'accueil)
  function followPath(pathEl, endEl, cb) {
    var len = pathEl.getTotalLength();
    var svg = pathEl.ownerSVGElement;
    function toDoc(p) {
      var m = pathEl.getScreenCTM();
      var pt = svg.createSVGPoint(); pt.x = p.x; pt.y = p.y;
      var s = pt.matrixTransform(m);
      return { x: s.x + window.scrollX, y: s.y + window.scrollY };
    }
    flying = true; stopIdle();
    var o = { d: 0 }, prev = toDoc(pathEl.getPointAtLength(0));
    face(1);
    gsap.timeline({ onComplete: function () { current = { el: endEl }; var b = perchPoint(endEl); pos.x = b.x; pos.y = b.y; place(); land(cb); } })
      .to(P.body, { scaleY: .86, scaleX: 1.07, duration: .14, ease: 'power2.in' })
      .add(wingsOut)
      .to(P.body, { scaleY: 1, scaleX: 1, duration: .2 })
      .to(o, {
        d: len, duration: 2.6, ease: 'power1.inOut',
        onUpdate: function () {
          var p = toDoc(pathEl.getPointAtLength(o.d));
          var ang = Math.atan2(p.y - prev.y, Math.abs(p.x - prev.x) + .001) * 180 / Math.PI;
          prev = p; pos.x = p.x; pos.y = p.y; place();
          gsap.set(tilt, { rotation: Math.max(-35, Math.min(35, ang * .5)) });
        }
      }, '<');
  }

  // Tour en l'air (clic sur l'oiseau)
  function loop() {
    if (flying || !current) return;
    var a = { x: pos.x, y: pos.y }, r = 90 * (W / 100);
    flyCurve(a, { x: a.x + r * 1.6 * facing, y: a.y - r * 2.4 }, { x: a.x - r * 1.6 * facing, y: a.y - r * 2.4 }, a, { duration: 1.4, ease: 'sine.inOut' });
  }

  // --- Choix du perchoir au fil du défilement -------------------------------------
  var perches = [];
  function collect() { perches = Array.prototype.slice.call(document.querySelectorAll('[data-perch]')); }
  function best() {
    var vh = window.innerHeight, target = vh * .32, pick = null, d = 1e9;
    perches.forEach(function (el) {
      if (el.offsetParent === null) return;
      // pas de perchoir sur un élément encore invisible (entrée en cours)
      for (var n = el, k = 0; n && k < 4; n = n.parentElement, k++) { if (parseFloat(getComputedStyle(n).opacity) < .6) return; }
      var r = el.getBoundingClientRect();
      if (r.top < vh * .1 || r.top > vh * .78 || r.bottom < 0) return;
      var dd = Math.abs(r.top - target);
      if (dd < d) { d = dd; pick = el; }
    });
    return pick;
  }
  var settleTimer = null, ready = false;
  function onScrollEnd() {
    if (!ready || flying) return;
    var el = best();
    if (el && (!current || current.el !== el)) flyTo(el);
  }
  window.addEventListener('scroll', function () {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(onScrollEnd, reduce ? 0 : 220);
  }, { passive: true });
  window.addEventListener('resize', function () {
    applySize();
    if (current && current.el && !flying) snapTo(current.el);
  });

  // --- Réactions au pointeur --------------------------------------------------------
  if (fine && !reduce) {
    root.addEventListener('pointerenter', function () {
      if (flying) return;
      gsap.timeline()
        .to(P.body, { scaleX: 1.06, scaleY: .94, duration: .08 })
        .to(P.body, { scaleX: .97, scaleY: 1.03, duration: .08 })
        .to(P.body, { scaleX: 1, scaleY: 1, duration: .5, ease: 'elastic.out(1.2, .4)' });
      chirp();
    });
    // la tête suit le curseur quand il est proche
    window.addEventListener('pointermove', function (e) {
      if (flying || !current) return;
      var r = root.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * .3);
      if (Math.hypot(dx, dy) > 320) return;
      var a = Math.max(-14, Math.min(14, (dy / 12) * facing));
      gsap.to(P.head, { rotation: a, duration: .4, ease: 'power2.out', overwrite: 'auto' });
    }, { passive: true });
  }
  root.addEventListener('click', function () { if (!reduce) loop(); });

  // --- Démarrage ----------------------------------------------------------------------
  function start() {
    collect();
    var startEl = document.getElementById('perchStart');
    var topEl = document.getElementById('perchTop');
    var path = document.getElementById('ascentPath');
    if (!startEl || !topEl) { var b = best(); if (b) snapTo(b); ready = true; startIdle(); return; }
    if (reduce) { snapTo(topEl); ready = true; return; }
    snapTo(startEl);
    startIdle();
    gsap.from(root, { opacity: 0, y: '+=20', duration: .6, ease: 'power2.out' });
    setTimeout(function () {
      if (window.scrollY > 200) { ready = true; onScrollEnd(); return; }
      if (path) followPath(path, topEl, function () { ready = true; });
      else flyTo(topEl, { onLand: function () { ready = true; } });
    }, 1700);
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);

  window.SKZBird = {
    celebrate: function () { loop(); },
    perch: function (el) { if (!flying) flyTo(el); }
  };
})();
