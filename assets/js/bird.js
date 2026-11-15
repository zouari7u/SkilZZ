/* ==========================================================================
   ZkilZ — le martin-pêcheur (SVG + GSAP : MorphSVG, DrawSVG)
   Un seul oiseau pour toute la page, dessiné en calques articulés
   (kf-art.js). Ses ailes changent vraiment de forme : cinq poses
   (haute, à plat, basse, plané, repliée) qui se transforment l'une en
   l'autre.

   Le vol
   · décollage : il s'accroupit, saute, premier coup d'aile appuyé ;
   · croisière : rafales de battements entrecoupées de planés, le corps
     s'incline selon la pente, une traînée se dessine derrière lui ;
   · approche : vol stationnaire au-dessus du perchoir (le geste du
     martin-pêcheur), puis il descend ailes ouvertes, queue en éventail,
     pattes en avant, et se pose en amortissant ;
   · accueil : il suit la trajectoire de l'ascension, du roseau au sommet.

   Posé
   · respiration, clignements, hochements (il « pompe » de la queue),
     regard alentour, il étire une aile, se lisse les plumes, ouvre le bec ;
   · de temps en temps, il décolle, fait du sur-place et revient ;
   · la tête suit le curseur ; survol : il s'ébroue ; clic : une boucle.

   Perchoirs : tout élément data-perch="x%" (point d'appui le long du
   bord haut). Il rejoint le plus proche du haut de l'écran quand le
   visiteur s'arrête de défiler.
   API : window.SKZBird.perch(el, { lock }), .unlock(), .celebrate()
   ========================================================================== */
(function () {
  'use strict';
  if (!window.gsap || !window.KF_SVG) return;
  if (window.MorphSVGPlugin) gsap.registerPlugin(MorphSVGPlugin);
  if (window.DrawSVGPlugin) gsap.registerPlugin(DrawSVGPlugin);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var WING = window.KF_WINGS;
  var canMorph = !!window.MorphSVGPlugin && !!WING;

  // =========================================================================
  // CONSTRUCTION
  // =========================================================================
  var VB_W = 220, VB_H = 200, FOOT_X = 107, FOOT_Y = 159;
  var root = document.createElement('div');
  root.className = 'kf';
  root.setAttribute('role', 'img');
  root.setAttribute('aria-label', 'Le martin-pêcheur, mascotte de ZkilZ');
  root.innerHTML = '<div class="kf-flip"><div class="kf-tilt"><div class="kf-bob"><svg viewBox="0 0 ' + VB_W + ' ' + VB_H + '" aria-hidden="true">' + window.KF_SVG + '</svg></div></div></div>';
  document.body.appendChild(root);

  // Traînée de vol : un tracé fin dans un calque à l'échelle du document
  var NS = 'http://www.w3.org/2000/svg';
  var trailSvg = document.createElementNS(NS, 'svg');
  trailSvg.setAttribute('class', 'kf-trail');
  trailSvg.setAttribute('aria-hidden', 'true');
  var trail = document.createElementNS(NS, 'path');
  trailSvg.appendChild(trail);
  document.body.appendChild(trailSvg);
  function sizeTrail() {
    var w = document.documentElement.scrollWidth, h = document.documentElement.scrollHeight;
    trailSvg.setAttribute('width', w); trailSvg.setAttribute('height', h);
    trailSvg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  }
  sizeTrail();

  var flip = root.querySelector('.kf-flip');
  var tilt = root.querySelector('.kf-tilt');
  var bob = root.querySelector('.kf-bob');
  var q = function (s) { return root.querySelector(s); };
  var P = {
    head: q('.kf-head'), beakLow: q('.kf-beak-low'), lid: q('.kf-lid'),
    fold: q('.kf-wing-fold'), nearG: q('.kf-wing-near'), farG: q('.kf-wing-far'),
    wn: q('.kf-wn'), wf: q('.kf-wf'),
    tail: q('.kf-tail'), feet: q('.kf-feet'), body: q('.kf-body')
  };
  gsap.set(P.head, { svgOrigin: '116 88' });
  gsap.set(P.beakLow, { svgOrigin: '152 72' });
  gsap.set(P.lid, { svgOrigin: '138 55.2', scaleY: 0 });
  gsap.set(P.tail, { svgOrigin: '82 132' });
  gsap.set(P.feet, { svgOrigin: '107 146' });
  gsap.set(P.body, { svgOrigin: '104 150' });
  gsap.set(P.nearG, { opacity: 0 });
  gsap.set(P.farG, { opacity: 0 });

  function size() { return window.innerWidth < 640 ? 66 : window.innerWidth < 1100 ? 86 : 104; }
  var W = size(), H = W * VB_H / VB_W;
  function applySize() {
    W = size(); H = W * VB_H / VB_W;
    root.style.width = W + 'px'; root.style.height = H + 'px';
    gsap.set(flip, { transformOrigin: (FOOT_X / VB_W * 100) + '% ' + (FOOT_Y / VB_H * 100) + '%' });
    gsap.set(tilt, { transformOrigin: '48% 58%' });
  }
  applySize();

  // Position = point d'appui (sous les pattes), en coordonnées document
  var pos = { x: 0, y: 0 }, facing = 1;
  function place() { gsap.set(root, { x: pos.x - W * FOOT_X / VB_W, y: pos.y - H * FOOT_Y / VB_H }); }
  function face(dir) {
    if (dir === facing) return;
    facing = dir;
    gsap.to(flip, { scaleX: dir, duration: .2, ease: 'power2.inOut' });
  }

  // =========================================================================
  // LES AILES
  // =========================================================================
  var flapTl = null, gait = 'off';
  function wingTo(pose, dur) {
    if (!canMorph) return;
    gsap.to(P.wn, { morphSVG: WING[pose], duration: dur, ease: 'sine.inOut', overwrite: true });
    gsap.to(P.wf, { morphSVG: WING[pose], duration: dur, delay: .02, ease: 'sine.inOut', overwrite: true });
  }
  function buildFlap() {
    if (!canMorph) return null;
    var tl = gsap.timeline({ repeat: -1, paused: true });
    // haute → à plat → basse → à plat → haute ; le corps monte au coup d'aile vers le bas
    tl.to(P.wn, { morphSVG: WING.mid, duration: .055, ease: 'none' })
      .to(P.wn, { morphSVG: WING.down, duration: .065, ease: 'power1.out' })
      .to(P.wn, { morphSVG: WING.mid, duration: .06, ease: 'none' })
      .to(P.wn, { morphSVG: WING.up, duration: .07, ease: 'power1.out' })
      .to(P.wf, { morphSVG: WING.mid, duration: .055, ease: 'none' }, .025)
      .to(P.wf, { morphSVG: WING.down, duration: .065, ease: 'power1.out' }, .08)
      .to(P.wf, { morphSVG: WING.mid, duration: .06, ease: 'none' }, .145)
      .to(P.wf, { morphSVG: WING.up, duration: .07, ease: 'power1.out' }, .205)
      .to(bob, { y: -3, duration: .12, ease: 'sine.out' }, .055)
      .to(bob, { y: 1.5, duration: .13, ease: 'sine.in' }, .175);
    return tl;
  }
  function setGait(g) {
    if (g === gait) return;
    gait = g;
    if (g === 'off') {
      if (flapTl) flapTl.pause();
      gsap.to([P.nearG, P.farG], { opacity: 0, duration: .1 });
      gsap.to(P.fold, { opacity: 1, duration: .1, delay: .05 });
      gsap.to(bob, { y: 0, duration: .2 });
      return;
    }
    gsap.to(P.fold, { opacity: 0, duration: .06 });
    gsap.to([P.nearG, P.farG], { opacity: 1, duration: .06 });
    if (!flapTl) flapTl = buildFlap();
    if (g === 'flap' || g === 'hover') {
      if (!flapTl) return;
      gsap.killTweensOf([P.wn, P.wf]);
      flapTl.timeScale(g === 'hover' ? 1.7 : 1).play();
    } else {
      if (flapTl) flapTl.pause();
      wingTo(g === 'glide' ? 'glide' : g === 'tuck' ? 'tuck' : g === 'flare' ? 'up' : 'mid', g === 'flare' ? .12 : .18);
      gsap.to(bob, { y: 0, duration: .2 });
    }
  }
  // Rythme de croisière : rafale de battements, plané, rafale…
  var rhythm = null;
  function startRhythm() {
    stopRhythm();
    rhythm = gsap.timeline({ repeat: -1 })
      .add(function () { setGait('flap'); })
      .to({}, { duration: .5 + Math.random() * .25 })
      .add(function () { setGait('glide'); })
      .to({}, { duration: .32 + Math.random() * .2 });
  }
  function stopRhythm() { if (rhythm) { rhythm.kill(); rhythm = null; } }

  // =========================================================================
  // TRAJECTOIRES (Catmull-Rom échantillonnée à vitesse constante)
  // =========================================================================
  function spline(pts, n) {
    var out = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (var k = 0; k < n; k++) {
        var t = k / n, t2 = t * t, t3 = t2 * t;
        out.push({
          x: .5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y: .5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
        });
      }
    }
    out.push(pts[pts.length - 1]);
    var len = [0];
    for (var j = 1; j < out.length; j++) len.push(len[j - 1] + Math.hypot(out[j].x - out[j - 1].x, out[j].y - out[j - 1].y));
    return { pts: out, len: len, total: len[len.length - 1] };
  }
  function at(sp, d) {
    var L = sp.len, i = 1;
    while (i < L.length - 1 && L[i] < d) i++;
    var a = sp.pts[i - 1], b = sp.pts[i], seg = (L[i] - L[i - 1]) || 1, t = Math.max(0, Math.min(1, (d - L[i - 1]) / seg));
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }
  function pathD(sp) { return 'M' + sp.pts.map(function (p) { return p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' L'); }

  // Suit une trajectoire ; inclinaison lissée selon la pente, traînée.
  // `make` est appelée au départ du segment (la position de l'oiseau est
  // alors connue) ; `opts.el` : la cible peut bouger pendant le vol (section
  // épinglée, mise en page qui change), l'écart est rattrapé progressivement.
  var tiltNow = 0;
  function travel(make, dur, ease, opts) {
    opts = opts || {};
    var o = { t: 0 }, sp, prev, vxs = 0, b0 = null;
    return gsap.to(o, {
      t: 1, duration: dur, ease: ease || 'power1.inOut',
      onStart: function () {
        sp = typeof make === 'function' ? make() : make;
        prev = { x: pos.x, y: pos.y }; vxs = 0;
        b0 = opts.el ? perchPoint(opts.el) : null;
        if (opts.trail) {
          sizeTrail();
          trail.setAttribute('d', pathD(sp));
          gsap.killTweensOf(trail);
          gsap.set(trail, { opacity: 1, drawSVG: '0% 0%' });
        }
      },
      onUpdate: function () {
        if (!sp) return;
        var p = at(sp, o.t * sp.total);
        if (b0) { var c = perchPoint(opts.el); p = { x: p.x + (c.x - b0.x) * o.t, y: p.y + (c.y - b0.y) * o.t }; }
        var vx = p.x - prev.x, vy = p.y - prev.y;
        vxs = vxs * .8 + vx * .2;
        if (Math.abs(vxs) > .6) face(vxs > 0 ? 1 : -1);
        var target = Math.max(-32, Math.min(32, Math.atan2(vy, Math.abs(vx) + .01) * 180 / Math.PI * .6));
        if (opts.tilt !== undefined) target = opts.tilt;
        tiltNow += (target - tiltNow) * .2;
        gsap.set(tilt, { rotation: tiltNow });
        prev = p; pos.x = p.x; pos.y = p.y; place();
        if (opts.trail && window.DrawSVGPlugin) {
          var f = o.t * 100;
          gsap.set(trail, { drawSVG: Math.max(0, f - 22) + '% ' + f + '%' });
        }
      }
    });
  }
  function fadeTrail() { gsap.to(trail, { opacity: 0, duration: .8, ease: 'power2.out' }); }

  // =========================================================================
  // VOLS COMPOSÉS
  // =========================================================================
  var flying = false, current = null, idle = null;

  function takeoff(tl) {
    tl.to(P.body, { scaleY: .86, scaleX: 1.06, duration: .12, ease: 'power2.in' })
      .to(P.feet, { scaleY: .3, duration: .2 }, '>')
      .add(function () { setGait('flap'); }, '<')
      .to(P.body, { scaleY: 1, scaleX: 1, duration: .25, ease: 'power2.out' }, '<');
  }
  function landSeq(tl, b, el) {
    // descente finale ailes ouvertes, queue en éventail, pattes en avant
    tl.add(function () { stopRhythm(); setGait('flare'); })
      .to(P.tail, { rotation: -18, duration: .2 }, '<')
      .to(P.feet, { scaleY: 1, duration: .2 }, '<')
      .add(travel(function () { var e = el ? perchPoint(el) : b; return spline([{ x: pos.x, y: pos.y }, e], 6); }, .34, 'power2.out', { tilt: -18 }))
      .add(function () { setGait('off'); fadeTrail(); })
      .to(tilt, { rotation: 0, duration: .3, ease: 'power2.out' })
      .to(P.tail, { rotation: 0, duration: .5, ease: 'elastic.out(1, .4)' }, '<')
      .to(P.body, { scaleY: .88, scaleX: 1.06, duration: .09, ease: 'power2.out' }, '<')
      .to(P.body, { scaleY: 1, scaleX: 1, duration: .6, ease: 'elastic.out(1.1, .4)' });
  }
  function hoverAt(tl, dur) {
    tl.add(function () { stopRhythm(); setGait('hover'); })
      .to(tilt, { rotation: -22, duration: .25, ease: 'power2.out' }, '<')
      .to(P.tail, { rotation: -14, duration: .25 }, '<')
      .to(bob, { y: -4, duration: dur / 4, ease: 'sine.inOut', yoyo: true, repeat: 3 });
  }

  // Vol vers un élément perchoir
  function flyTo(el, done) {
    var b = perchPoint(el);
    // parti loin hors de l'écran : il rentre par le bord le plus proche
    // au lieu de traverser toute la page
    var top0 = window.scrollY, vh = window.innerHeight;
    if (pos.y < top0 - 120 || pos.y > top0 + vh + 160) {
      var above = pos.y < top0;
      pos.x = Math.max(60, Math.min(window.innerWidth - 60, pos.x + (b.x - pos.x) * .3));
      pos.y = above ? top0 - H * .4 : top0 + vh + H;
      place();
    }
    var a = { x: pos.x, y: pos.y };
    var dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy), dir = dx >= 0 ? 1 : -1;
    stopIdle(); flying = true; current = { el: el };
    var tl = gsap.timeline({ onComplete: function () { flying = false; tiltNow = 0; afterLand(el); if (done) done(); } });
    takeoff(tl);
    if (dist < 150) {
      // petit saut d'un point à l'autre
      var sp = spline([a, { x: a.x + dx * .5, y: Math.min(a.y, b.y) - 46 }, { x: b.x - dir * 10, y: b.y - 30 }], 10);
      tl.add(travel(sp, .5, 'power1.inOut', { el: el }));
      landSeq(tl, b, el);
      return tl;
    }
    var lift = 60 + Math.min(240, Math.abs(dx) * .22 + Math.abs(dy) * .12);
    var top = Math.min(a.y, b.y) - lift;
    var hover = { x: b.x - dir * 26, y: b.y - 74 };
    var pts = [a, { x: a.x + dir * 30, y: a.y - 46 }, { x: a.x + dx * .5, y: top }, hover];
    var sp2 = spline(pts, 14);
    tl.add(function () { startRhythm(); })
      .add(travel(sp2, Math.max(.9, Math.min(2.2, sp2.total / 620)), 'power1.inOut', { trail: true, el: el }));
    hoverAt(tl, .45);
    landSeq(tl, b, el);
    return tl;
  }

  // Sur-place au-dessus du perchoir, puis retour (le geste du martin-pêcheur)
  function sortie() {
    if (flying || !current || reduce) return;
    var home = { x: pos.x, y: pos.y };
    stopIdle(); flying = true;
    var tl = gsap.timeline({ onComplete: function () { flying = false; tiltNow = 0; afterLand(current && current.el); } });
    takeoff(tl);
    var f0 = facing;
    tl.add(travel(spline([home, { x: home.x - f0 * 20, y: home.y - 60 }, { x: home.x, y: home.y - 96 }], 10), .6, 'power2.out', { el: current.el }));
    hoverAt(tl, 1.1);
    tl.add(function () { face(-facing); }, '-=.5');
    landSeq(tl, home, current.el);
  }

  // Boucle (clic sur l'oiseau)
  function loop() {
    if (flying || !current || reduce) return;
    var a = { x: pos.x, y: pos.y }, r = 70 * (W / 100), f = facing;
    stopIdle(); flying = true;
    var tl = gsap.timeline({ onComplete: function () { flying = false; tiltNow = 0; afterLand(current && current.el); } });
    takeoff(tl);
    var pts = [a, { x: a.x + f * r, y: a.y - r * .9 }, { x: a.x + f * r * 1.6, y: a.y - r * 2.2 }, { x: a.x + f * r * .6, y: a.y - r * 3.1 }, { x: a.x - f * r * .4, y: a.y - r * 2.3 }, { x: a.x - f * r * .2, y: a.y - r * 1.2 }, { x: a.x, y: a.y - 70 }];
    tl.add(function () { startRhythm(); })
      .add(travel(spline(pts, 12), 1.5, 'sine.inOut', { trail: true, el: current.el }));
    hoverAt(tl, .4);
    landSeq(tl, a, current.el);
  }

  // Ascension de l'accueil : il suit le tracé, du roseau au sommet
  function ascend(pathEl, endEl, done) {
    var svg = pathEl.ownerSVGElement, len = pathEl.getTotalLength();
    function toDoc(d) {
      var p = pathEl.getPointAtLength(d), m = pathEl.getScreenCTM(), pt = svg.createSVGPoint();
      pt.x = p.x; pt.y = p.y; var s = pt.matrixTransform(m);
      return { x: s.x + window.scrollX, y: s.y + window.scrollY };
    }
    var pts = [];
    for (var i = 0; i <= 14; i++) pts.push(toDoc(len * i / 14));
    var end = perchPoint(endEl);
    pts[pts.length - 1] = { x: end.x - 22, y: end.y - 62 };
    var sp = spline(pts, 8);
    gsap.set(pathEl, { strokeDasharray: len, strokeDashoffset: len });
    stopIdle(); flying = true; current = { el: endEl };
    var tl = gsap.timeline({ onComplete: function () { flying = false; tiltNow = 0; afterLand(endEl); if (done) done(); } });
    takeoff(tl);
    var o = { p: 0 };
    tl.add(function () { startRhythm(); })
      .add(travel(sp, 2.6, 'power1.inOut'))
      .to(o, { p: 1, duration: 2.6, ease: 'power1.inOut', onUpdate: function () { gsap.set(pathEl, { strokeDashoffset: len * (1 - o.p) }); } }, '<');
    hoverAt(tl, .5);
    landSeq(tl, end, endEl);
  }

  // =========================================================================
  // POSÉ : ATTENTE
  // =========================================================================
  var sortieTimer = null;
  function afterLand(el) {
    if (el) document.dispatchEvent(new CustomEvent('kf:land', { detail: el }));
    // une demande arrivée pendant le vol : il repart aussitôt
    if (queued && queued !== el) { var n = queued; queued = null; setTimeout(function () { go(n); }, 120); return; }
    queued = null;
    if (el && !reduce) gsap.fromTo(el, { y: 0 }, { y: 3, duration: .12, yoyo: true, repeat: 1, ease: 'power2.out', clearProps: 'transform' });
    startIdle();
  }
  function startIdle() {
    stopIdle();
    if (reduce) return;
    idle = gsap.timeline({ repeat: -1 });
    idle.to(P.body, { scaleY: 1.025, scaleX: .99, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0);
    var acts = [blink, blink, pump, tiltHead, lookBack, chirp, stretch, preen, pump];
    var t = .6;
    for (var i = 0; i < 4; i++) {
      t += 1 + Math.random() * 1.6;
      idle.add(acts[Math.floor(Math.random() * acts.length)](), t);
    }
    idle.to({}, { duration: .4 });
    clearTimeout(sortieTimer);
    sortieTimer = setTimeout(function () { if (!flying && Date.now() - lastScroll > 4000 && onScreen()) sortie(); }, 14000 + Math.random() * 12000);
  }
  function stopIdle() { if (idle) { idle.kill(); idle = null; } clearTimeout(sortieTimer); }
  function blink() { return gsap.timeline().to(P.lid, { scaleY: 1, duration: .07, ease: 'power2.in' }).to(P.lid, { scaleY: 0, duration: .12, ease: 'power2.out' }); }
  // le martin-pêcheur « pompe » : tête qui plonge et queue qui remonte
  function pump() {
    return gsap.timeline()
      .to(P.head, { rotation: 10, duration: .12, ease: 'power2.out' })
      .to(P.tail, { rotation: -14, duration: .12, ease: 'power2.out' }, '<')
      .to(P.head, { rotation: 0, duration: .45, ease: 'elastic.out(1, .5)' })
      .to(P.tail, { rotation: 0, duration: .6, ease: 'elastic.out(1.2, .4)' }, '<');
  }
  function tiltHead() { var s = Math.random() > .5 ? 1 : -1; return gsap.timeline().to(P.head, { rotation: 12 * s, duration: .35, ease: 'power2.out' }).to(P.head, { rotation: 0, duration: .8, ease: 'elastic.out(1, .5)' }, '+=.7'); }
  function lookBack() { return gsap.timeline().add(function () { face(-facing); }).add(function () { face(-facing); }, '+=1.1'); }
  function chirp() { return gsap.timeline().to(P.beakLow, { rotation: 10, duration: .08 }).to(P.beakLow, { rotation: 0, duration: .1 }).to(P.beakLow, { rotation: 8, duration: .08 }).to(P.beakLow, { rotation: 0, duration: .25, ease: 'power2.out' }); }
  // il étire une aile vers le bas, puis la replie
  function stretch() {
    if (!canMorph) return blink();
    return gsap.timeline()
      .add(function () { gsap.set(P.wn, { morphSVG: WING.mid }); })
      .to(P.fold, { opacity: 0, duration: .1 })
      .to(P.nearG, { opacity: 1, duration: .1 }, '<')
      .to(P.wn, { morphSVG: WING.down, duration: .35, ease: 'power2.out' })
      .to(P.wn, { morphSVG: WING.mid, duration: .3, ease: 'power2.in' }, '+=.35')
      .to(P.nearG, { opacity: 0, duration: .1 })
      .to(P.fold, { opacity: 1, duration: .1 }, '<');
  }
  // il se lisse les plumes : tête vers l'aile
  function preen() {
    return gsap.timeline()
      .to(P.head, { rotation: 38, x: -6, y: 6, duration: .3, ease: 'power2.out' })
      .to(P.head, { rotation: 32, duration: .12, yoyo: true, repeat: 3 })
      .to(P.head, { rotation: 0, x: 0, y: 0, duration: .5, ease: 'elastic.out(1, .6)' });
  }

  // =========================================================================
  // PERCHOIRS
  // =========================================================================
  function perchPoint(el) {
    var r = el.getBoundingClientRect(), at2 = parseFloat(el.dataset.perch);
    if (isNaN(at2)) at2 = 85;
    return { x: r.left + window.scrollX + r.width * at2 / 100, y: r.top + window.scrollY + 1 };
  }
  function snapTo(el) { var b = perchPoint(el); pos.x = b.x; pos.y = b.y; current = { el: el }; place(); }
  function onScreen() { var r = root.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; }
  var perches = [], lock = null;
  function collect() { perches = Array.prototype.slice.call(document.querySelectorAll('[data-perch]')); }
  function best() {
    var vh = window.innerHeight, target = vh * .32, pick = null, d = 1e9;
    perches.forEach(function (el) {
      if (el.offsetParent === null) return;
      for (var n = el, k = 0; n && k < 4; n = n.parentElement, k++) { if (parseFloat(getComputedStyle(n).opacity) < .6) return; }
      var r = el.getBoundingClientRect();
      if (r.top < vh * .1 || r.top > vh * .78 || r.bottom < 0) return;
      var px = r.left + r.width * (parseFloat(el.dataset.perch) || 85) / 100;
      if (px < 40 || px > window.innerWidth - 40) return;
      var dd = Math.abs(r.top - target);
      if (dd < d) { d = dd; pick = el; }
    });
    return pick;
  }
  var settle = null, ready = false, lastScroll = 0, queued = null;
  function go(el) {
    if (!el || (current && current.el === el)) return;
    if (flying) { queued = el; return; }
    flyTo(el);
  }
  function onScrollEnd() {
    if (!ready || lock) return;
    go(best());
  }
  window.addEventListener('scroll', function () {
    lastScroll = Date.now();
    if (!flying && lock && current && current.el === lock) snapTo(lock);
    clearTimeout(settle);
    settle = setTimeout(onScrollEnd, reduce ? 0 : 200);
  }, { passive: true });
  window.addEventListener('resize', function () {
    applySize(); sizeTrail();
    if (current && current.el && !flying) snapTo(current.el);
  });

  // =========================================================================
  // POINTEUR
  // =========================================================================
  if (fine && !reduce) {
    root.addEventListener('pointerenter', function () {
      if (flying) return;
      gsap.timeline()
        .to(P.body, { scaleX: 1.07, scaleY: .93, duration: .07 })
        .to(P.body, { scaleX: .96, scaleY: 1.04, duration: .07 })
        .to(P.body, { scaleX: 1, scaleY: 1, duration: .5, ease: 'elastic.out(1.2, .4)' });
      chirp();
    });
    window.addEventListener('pointermove', function (e) {
      if (flying || !current) return;
      var r = root.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * .3);
      if (Math.hypot(dx, dy) > 340) return;
      if (Math.abs(dx) > 60) face(dx > 0 ? 1 : -1);
      gsap.to(P.head, { rotation: Math.max(-16, Math.min(16, dy / 12)), duration: .4, ease: 'power2.out', overwrite: 'auto' });
    }, { passive: true });
  }
  root.addEventListener('click', function () { loop(); });

  // =========================================================================
  // DÉMARRAGE
  // =========================================================================
  function start() {
    collect();
    var startEl = document.getElementById('perchStart');
    var topEl = document.getElementById('perchTop');
    var path = document.getElementById('ascentPath');
    if (reduce) { var e = topEl || best(); if (e) snapTo(e); ready = true; return; }
    if (!startEl || !topEl) { var b = best(); if (b) snapTo(b); ready = true; startIdle(); return; }
    snapTo(startEl);
    startIdle();
    gsap.from(root, { opacity: 0, duration: .6, ease: 'power2.out' });
    setTimeout(function () {
      if (window.scrollY > 200) { ready = true; onScrollEnd(); return; }
      if (path) ascend(path, topEl, function () { ready = true; onScrollEnd(); });
      else flyTo(topEl, function () { ready = true; });
    }, 1700);
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);

  window.SKZBird = {
    perch: function (el, o) { if (o && o.lock) lock = el; go(el); },
    unlock: function () { lock = null; onScrollEnd(); },
    celebrate: loop,
    isFlying: function () { return flying; }
  };
})();
