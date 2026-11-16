/* ==========================================================================
   ZkilZ — le martin-pêcheur (animation image par image + GSAP)
   Les poses viennent des planches de référence (assets/mascotte/Gemini_*),
   détourées et calées sur la tête : comme chez un vrai oiseau, la tête
   reste stable pendant que le corps monte et descend avec les ailes.
   Une seule image (kf-vol.webp) contient les 11 poses ; on change de pose
   en déplaçant le fond, sans rien recharger.

   Le vol
   · décollage : il se tourne vers la cible, s'accroupit, lève les ailes
     sur place, saute et donne son premier coup d'aile ;
   · croisière : battements rapides (6 images par battement, descente
     plus rapide que la remontée) ; en descente il alterne rafales et
     courts planés ailes repliées, comme les petits oiseaux ; en montée
     il bat sans arrêt ; le corps penche selon la pente ;
   · approche : sur-place au-dessus du perchoir, corps redressé ;
   · atterrissage : ailes levées en frein, pattes tendues, contact avec
     les ailes encore ouvertes, puis il les replie et se rééquilibre ;
   · accueil : il remonte la trajectoire, du roseau jusqu'au sommet.

   Posé : respiration, clignements, hochements (il « pompe » comme le vrai),
   coup d'œil derrière lui, ailes levées pour s'étirer, petit saut en
   demi-tour, ébrouement. Parfois il décolle, fait du sur-place et revient.
   Clic : une boucle complète, le corps suit la courbe.

   Perchoirs : tout élément data-perch="x%" (point d'appui sur le bord
   haut). API : window.SKZBird.perch(el, { lock }), .unlock(), .celebrate()
   ========================================================================== */
(function () {
  'use strict';
  if (!window.gsap) return;
  if (window.DrawSVGPlugin) gsap.registerPlugin(DrawSVGPlugin);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // =========================================================================
  // LA PLANCHE (fabriquée par tools/kf_sprite.py, qui affiche ces repères)
  // =========================================================================
  var SRC = 'assets/img/mascotte/kf-vol.webp';
  var CELL = { w: 300, h: 284 }, COLS = 4, ROWS = 3;
  var F = { perch: 0, perchUp: 1, up: 2, mid: 3, down: 4, down2: 5, level: 6, rise: 7, upFeet: 8, flare: 9, upAlt: 10 };
  var EYE = { x: 186, y: 124.5, r: 6 }, FOOT = { x: 119.5, y: 237 };
  var CAP = '#2861b1';

  // =========================================================================
  // CONSTRUCTION
  // =========================================================================
  var root = document.createElement('div');
  root.className = 'kf';
  root.setAttribute('role', 'img');
  root.setAttribute('aria-label', 'Le martin-pêcheur, mascotte de ZkilZ');
  root.innerHTML = '<div class="kf-flip"><div class="kf-tilt"><div class="kf-bob"><div class="kf-spr"></div><i class="kf-lid"></i></div></div></div>';
  var flip = root.querySelector('.kf-flip');
  var tilt = root.querySelector('.kf-tilt');
  var bob = root.querySelector('.kf-bob');
  var spr = root.querySelector('.kf-spr');
  var lid = root.querySelector('.kf-lid');
  spr.style.backgroundImage = 'url(' + SRC + ')';
  spr.style.backgroundSize = (COLS * 100) + '% ' + (ROWS * 100) + '%';
  lid.style.cssText = 'left:' + ((EYE.x - EYE.r) / CELL.w * 100) + '%;top:' + ((EYE.y - EYE.r) / CELL.h * 100) + '%;width:' + (EYE.r * 2 / CELL.w * 100) + '%;height:' + (EYE.r * 2 / CELL.h * 100) + '%;background:' + CAP;
  gsap.set(lid, { scaleY: 0, transformOrigin: '50% 0%' });

  // Traînée de vol, dans un calque à l'échelle du document
  var NS = 'http://www.w3.org/2000/svg';
  var trailSvg = document.createElementNS(NS, 'svg');
  trailSvg.setAttribute('class', 'kf-trail');
  trailSvg.setAttribute('aria-hidden', 'true');
  var trail = document.createElementNS(NS, 'path');
  trailSvg.appendChild(trail);
  function sizeTrail() {
    var w = document.documentElement.scrollWidth, h = document.documentElement.scrollHeight;
    trailSvg.setAttribute('width', w); trailSvg.setAttribute('height', h);
    trailSvg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  }

  var frameNow = -1;
  function frame(name) {
    var i = F[name];
    if (i === frameNow) return;
    frameNow = i;
    spr.style.backgroundPosition = ((i % COLS) / (COLS - 1) * 100) + '% ' + (Math.floor(i / COLS) / (ROWS - 1) * 100) + '%';
    lid.style.visibility = name === 'perchUp' ? 'hidden' : '';
  }
  frame('perch');

  function size() { return window.innerWidth < 640 ? 88 : window.innerWidth < 1100 ? 116 : 136; }
  var W, H;
  function applySize() {
    W = size(); H = W * CELL.h / CELL.w;
    root.style.width = W + 'px'; root.style.height = H + 'px';
    var foot = (FOOT.x / CELL.w * 100) + '% ' + (FOOT.y / CELL.h * 100) + '%';
    gsap.set(flip, { transformOrigin: foot });
    gsap.set(bob, { transformOrigin: foot });
    gsap.set(tilt, { transformOrigin: '52% 58%' });
  }
  applySize();

  // Position = point d'appui (sous les pattes), en coordonnées document
  var pos = { x: 0, y: 0 }, facing = 1;
  function place() { gsap.set(root, { x: pos.x - W * FOOT.x / CELL.w, y: pos.y - H * FOOT.y / CELL.h }); }
  function face(dir, fast) {
    if (dir === facing) return;
    facing = dir;
    gsap.to(flip, { scaleX: dir, duration: fast ? .12 : .2, ease: 'power2.inOut', overwrite: true });
  }

  // =========================================================================
  // LES AILES : battement image par image
  // =========================================================================
  // descente (puissante) plus courte que la remontée (aile repliée)
  var FLAP = [['up', .034], ['mid', .026], ['down', .028], ['down2', .04], ['level', .038], ['rise', .036]];
  var HOVER = [['upFeet', .03], ['mid', .024], ['down', .028], ['mid', .026]];
  function cycle(seq) {
    var tl = gsap.timeline({ repeat: -1, paused: true }), t = 0;
    seq.forEach(function (s) { tl.call(frame, [s[0]], t); t += s[1]; });
    // le corps se soulève un peu à chaque coup d'aile vers le bas
    tl.to(bob, { y: -1.6, duration: t * .3, ease: 'sine.out' }, t * .25)
      .to(bob, { y: 0, duration: t * .4, ease: 'sine.inOut' }, t * .55)
      .to({}, { duration: 0 }, t);
    return tl;
  }
  var flapTl = cycle(FLAP), hoverTl = cycle(HOVER);
  var gait = 'off';
  function setGait(g) {
    if (g === gait) return;
    gait = g;
    flapTl.pause(); hoverTl.pause();
    if (g === 'flap') flapTl.timeScale(.95 + Math.random() * .15).play();
    else if (g === 'hover') hoverTl.play();
    else {
      gsap.to(bob, { y: 0, duration: .12 });
      if (g === 'glide') frame('level');
      else if (g === 'flare') frame('flare');
      else if (g === 'off') frame('perch');
    }
  }
  // Croisière : en montée il bat sans arrêt ; ailleurs, rafales et courts
  // planés ailes repliées (le vol « en bonds » des petits oiseaux)
  var climbing = false, rhythm = null;
  function startRhythm() {
    stopRhythm();
    var loopFn = function () {
      setGait('flap');
      rhythm = gsap.delayedCall(.42 + Math.random() * .3, function () {
        if (!climbing) setGait('glide');
        rhythm = gsap.delayedCall(climbing ? .05 : .2 + Math.random() * .16, loopFn);
      });
    };
    loopFn();
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
    return { pts: out, len: len, total: len[len.length - 1] || 1 };
  }
  function at(sp, d) {
    var L = sp.len, i = 1;
    while (i < L.length - 1 && L[i] < d) i++;
    var a = sp.pts[i - 1], b = sp.pts[i] || a, seg = (L[i] - L[i - 1]) || 1, t = Math.max(0, Math.min(1, (d - L[i - 1]) / seg));
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }
  function pathD(sp) { return 'M' + sp.pts.map(function (p) { return p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' L'); }

  // Suit une trajectoire. `make` est appelée au départ du segment ;
  // opts.el : la cible peut bouger pendant le vol (section épinglée…),
  // l'écart est rattrapé progressivement ; opts.spin : le corps suit la
  // courbe sur 360° (boucle) ; opts.tilt : inclinaison imposée.
  var tiltNow = 0;
  function travel(make, dur, ease, opts) {
    opts = opts || {};
    var o = { t: 0 }, sp, prev, vxs = 0, vys = 0, b0 = null;
    return gsap.to(o, {
      t: 1, duration: dur, ease: ease || 'power1.inOut',
      onStart: function () {
        sp = typeof make === 'function' ? make() : make;
        prev = { x: pos.x, y: pos.y }; vxs = 0; vys = 0;
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
        vxs = vxs * .75 + vx * .25; vys = vys * .75 + vy * .25;
        climbing = vys < -1.2;
        var target;
        if (opts.spin) {
          var ang = Math.atan2(vys, vxs) * 180 / Math.PI;
          target = facing === 1 ? ang : 180 - ang;
          while (target - tiltNow > 180) target -= 360;
          while (target - tiltNow < -180) target += 360;
          tiltNow += (target - tiltNow) * .3;
        } else {
          if (Math.abs(vxs) > .8) face(vxs > 0 ? 1 : -1);
          target = opts.tilt !== undefined ? opts.tilt : Math.max(-28, Math.min(24, Math.atan2(vys, Math.abs(vxs) + .01) * 180 / Math.PI * .55));
          tiltNow += (target - tiltNow) * .16;
        }
        gsap.set(tilt, { rotation: tiltNow });
        prev = p; pos.x = p.x; pos.y = p.y; place();
        if (opts.trail && window.DrawSVGPlugin) {
          var f = o.t * 100;
          gsap.set(trail, { drawSVG: Math.max(0, f - 18) + '% ' + f + '%' });
        }
      }
    });
  }
  function fadeTrail() { gsap.to(trail, { opacity: 0, duration: .7, ease: 'power2.out' }); }
  function normTilt() {
    tiltNow = ((tiltNow % 360) + 540) % 360 - 180;
    gsap.set(tilt, { rotation: tiltNow });
  }

  // =========================================================================
  // VOLS COMPOSÉS
  // =========================================================================
  var flying = false, current = null, idle = null;

  function takeoff(tl, dir) {
    tl.add(function () { stopIdle(); gsap.set(bob, { rotation: 0, y: 0, scaleX: 1, scaleY: 1 }); if (dir) face(dir, true); })
      // anticipation : il s'accroupit
      .to(bob, { scaleY: .9, scaleX: 1.05, duration: .11, ease: 'power2.in' })
      .call(frame, ['perchUp'])
      .to(bob, { scaleY: 1, scaleX: 1, duration: .14, ease: 'power2.out' })
      .call(frame, ['upFeet'], '-=.04')
      .add(function () { setGait('flap'); });
  }
  function landSeq(tl, b, el) {
    tl.add(function () { normTilt(); stopRhythm(); setGait('flare'); })
      .add(travel(function () { var e = el ? perchPoint(el) : b; return spline([{ x: pos.x, y: pos.y }, { x: (pos.x + e.x) / 2, y: e.y - 18 }, e], 6); }, .38, 'power2.out', { tilt: -16 }))
      // contact : ailes encore levées, le corps amortit
      .add(function () { setGait('frozen'); frame('perchUp'); fadeTrail(); })
      .to(tilt, { rotation: 0, duration: .22, ease: 'power2.out', onComplete: function () { tiltNow = 0; } })
      .to(bob, { scaleY: .9, scaleX: 1.06, duration: .08, ease: 'power2.out' }, '<')
      .call(frame, ['perch'], '+=.03')
      .to(bob, { scaleY: 1, scaleX: 1, duration: .5, ease: 'elastic.out(1.1, .4)' }, '<')
      // il se rééquilibre : bascule en avant puis revient
      .to(bob, { rotation: 7, duration: .12, ease: 'power2.out' }, '<')
      .to(bob, { rotation: 0, duration: .7, ease: 'elastic.out(1, .35)' });
  }
  function hoverAt(tl, dur) {
    tl.add(function () { stopRhythm(); setGait('hover'); })
      .to(tilt, { rotation: -20, duration: .3, ease: 'power2.out', onComplete: function () { tiltNow = -20; } }, '<')
      .to(bob, { y: -5, duration: dur / 4, ease: 'sine.inOut', yoyo: true, repeat: 3 });
  }
  function endFlight(el, done) {
    return function () { flying = false; afterLand(el); if (done) done(); };
  }

  // Vol vers un élément perchoir
  function flyTo(el, done) {
    var b = perchPoint(el);
    // parti loin hors de l'écran : il rentre par le bord le plus proche
    var top0 = window.scrollY, vh = window.innerHeight;
    if (pos.y < top0 - 120 || pos.y > top0 + vh + 160) {
      var above = pos.y < top0;
      pos.x = Math.max(60, Math.min(window.innerWidth - 60, pos.x + (b.x - pos.x) * .3));
      pos.y = above ? top0 - H * .5 : top0 + vh + H;
      place();
    }
    var a = { x: pos.x, y: pos.y };
    var dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy), dir = dx >= 0 ? 1 : -1;
    flying = true; current = { el: el };
    var tl = gsap.timeline({ onComplete: endFlight(el, done) });
    takeoff(tl, Math.abs(dx) > 20 ? dir : 0);
    if (dist < 170) {
      // petit saut d'un point à l'autre
      tl.add(travel(spline([a, { x: a.x + dx * .45, y: Math.min(a.y, b.y) - 52 }, { x: b.x - dir * 12, y: b.y - 34 }], 10), .46, 'power1.inOut', { el: el }));
      landSeq(tl, b, el);
      return tl;
    }
    // trajectoire directe et tendue, une légère montée puis l'approche
    var lift = 40 + Math.min(160, Math.abs(dx) * .12 + Math.abs(dy) * .08);
    var top = Math.min(a.y, b.y) - lift;
    var hover = { x: b.x - dir * 28, y: b.y - 78 };
    var pts = [a, { x: a.x + dir * 34, y: a.y - 40 }, { x: a.x + dx * .5, y: top }, hover];
    var sp = spline(pts, 14);
    tl.add(function () { startRhythm(); })
      .add(travel(sp, Math.max(.75, Math.min(1.9, sp.total / 720)), 'power1.inOut', { trail: true, el: el }));
    hoverAt(tl, .4);
    landSeq(tl, b, el);
    return tl;
  }

  // Sur-place au-dessus du perchoir, puis retour
  function sortie() {
    if (flying || !current || reduce) return;
    var home = { x: pos.x, y: pos.y }, f0 = facing;
    flying = true;
    var tl = gsap.timeline({ onComplete: endFlight(current.el) });
    takeoff(tl, 0);
    tl.add(travel(spline([home, { x: home.x - f0 * 26, y: home.y - 58 }, { x: home.x + f0 * 6, y: home.y - 104 }], 10), .62, 'power2.out', { el: current.el }));
    hoverAt(tl, 1.2);
    tl.add(function () { face(-facing); }, '-=.55');
    landSeq(tl, home, current.el);
  }

  // Boucle (clic sur l'oiseau)
  function loop() {
    if (flying || !current || reduce) return;
    var a = { x: pos.x, y: pos.y }, r = 72 * (W / 130), f = facing;
    flying = true;
    var tl = gsap.timeline({ onComplete: endFlight(current.el) });
    takeoff(tl, 0);
    var pts = [a, { x: a.x + f * r * .9, y: a.y - r * .7 }, { x: a.x + f * r * 1.7, y: a.y - r * 2 }, { x: a.x + f * r * .8, y: a.y - r * 3 }, { x: a.x - f * r * .2, y: a.y - r * 2.2 }, { x: a.x + f * r * .1, y: a.y - r * 1.1 }, { x: a.x + f * r * .9, y: a.y - r * .9 }, { x: a.x + f * r * .3, y: a.y - 76 }];
    tl.add(function () { setGait('flap'); flapTl.timeScale(1.25); })
      .add(travel(spline(pts, 12), 1.55, 'sine.inOut', { trail: true, el: current.el, spin: true }));
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
    pts[pts.length - 1] = { x: end.x - 24, y: end.y - 66 };
    var sp = spline(pts, 8);
    gsap.set(pathEl, { strokeDasharray: len, strokeDashoffset: len });
    flying = true; current = { el: endEl };
    var tl = gsap.timeline({ onComplete: endFlight(endEl, done) });
    takeoff(tl, 1);
    var o = { p: 0 };
    tl.add(function () { startRhythm(); })
      .add(travel(sp, 2.5, 'power1.inOut'))
      .to(o, { p: 1, duration: 2.5, ease: 'power1.inOut', onUpdate: function () { gsap.set(pathEl, { strokeDashoffset: len * (1 - o.p) }); } }, '<');
    hoverAt(tl, .45);
    landSeq(tl, end, endEl);
  }

  // =========================================================================
  // POSÉ : ATTENTE
  // =========================================================================
  var sortieTimer = null;
  function afterLand(el) {
    if (el) document.dispatchEvent(new CustomEvent('kf:land', { detail: el }));
    if (queued && queued !== el) { var n = queued; queued = null; setTimeout(function () { go(n); }, 140); return; }
    queued = null;
    startIdle();
  }
  function startIdle() {
    stopIdle();
    setGait('off');
    if (reduce) return;
    idle = gsap.timeline({ repeat: -1 });
    // respiration
    idle.to(bob, { scaleY: 1.018, scaleX: .994, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0);
    var acts = [blink, blink, pump, pump, lookBack, stretch, hopTurn, ruffle, doubleBlink];
    var t = .5;
    for (var i = 0; i < 4; i++) {
      t += .9 + Math.random() * 1.5;
      idle.add(acts[Math.floor(Math.random() * acts.length)](), t);
    }
    idle.to({}, { duration: .3 });
    clearTimeout(sortieTimer);
    sortieTimer = setTimeout(function () { if (!flying && !lock && Date.now() - lastScroll > 4000 && onScreen()) sortie(); }, 15000 + Math.random() * 12000);
  }
  function stopIdle() { if (idle) { idle.kill(); idle = null; } clearTimeout(sortieTimer); gsap.set(lid, { scaleY: 0 }); }
  function blink() { return gsap.timeline().to(lid, { scaleY: 1, duration: .06, ease: 'power2.in' }).to(lid, { scaleY: 0, duration: .11, ease: 'power2.out' }); }
  function doubleBlink() { return gsap.timeline().add(blink()).add(blink(), '+=.12'); }
  // le martin-pêcheur « pompe » : il plonge le buste et relève la queue
  function pump() {
    return gsap.timeline()
      .to(bob, { rotation: 8, duration: .1, ease: 'power2.out' })
      .to(bob, { rotation: 0, duration: .55, ease: 'elastic.out(1, .45)' })
      .to(bob, { rotation: 6, duration: .09, ease: 'power2.out' }, '+=.25')
      .to(bob, { rotation: 0, duration: .5, ease: 'elastic.out(1, .45)' });
  }
  function lookBack() { return gsap.timeline().add(function () { face(-facing, true); }).add(function () { face(-facing, true); }, '+=1.2'); }
  // il lève les ailes sur place, comme pour s'étirer
  function stretch() {
    return gsap.timeline()
      .to(bob, { scaleY: .94, duration: .1 })
      .call(frame, ['perchUp'])
      .to(bob, { scaleY: 1.03, duration: .16, ease: 'power2.out' })
      .call(frame, ['perch'], '+=.42')
      .to(bob, { scaleY: 1, duration: .4, ease: 'elastic.out(1, .5)' });
  }
  // petit saut en demi-tour
  function hopTurn() {
    return gsap.timeline()
      .to(bob, { scaleY: .9, scaleX: 1.05, duration: .09, ease: 'power2.in' })
      .to(bob, { y: -12, scaleY: 1.05, scaleX: .97, duration: .14, ease: 'power2.out' })
      .add(function () { face(-facing, true); }, '<')
      .to(bob, { y: 0, scaleY: 1, scaleX: 1, duration: .14, ease: 'power2.in' })
      .to(bob, { scaleY: .93, scaleX: 1.04, duration: .06 })
      .to(bob, { scaleY: 1, scaleX: 1, duration: .35, ease: 'elastic.out(1, .5)' });
  }
  // il s'ébroue
  function ruffle() {
    return gsap.timeline()
      .to(bob, { scaleX: 1.06, scaleY: .96, duration: .05 })
      .to(bob, { scaleX: .97, scaleY: 1.03, duration: .05 })
      .to(bob, { scaleX: 1.04, scaleY: .98, duration: .05 })
      .to(bob, { scaleX: 1, scaleY: 1, duration: .4, ease: 'elastic.out(1.2, .4)' });
  }

  // =========================================================================
  // PERCHOIRS
  // =========================================================================
  // data-perch-ink : le perchoir est le haut du dessin de la lettre, pas
  // celui de sa boîte (interligne et marges internes compris)
  var inkCtx = null;
  function inkTop(el) {
    var cs = getComputedStyle(el);
    inkCtx = inkCtx || document.createElement('canvas').getContext('2d');
    inkCtx.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    var m = inkCtx.measureText(el.textContent.trim() || 'l');
    var fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
    if (!fa) return 0;
    var lh = parseFloat(cs.lineHeight) || (fa + fd);
    return parseFloat(cs.paddingTop) + (lh - (fa + fd)) / 2 + fa - m.actualBoundingBoxAscent;
  }
  function perchPoint(el) {
    var r = el.getBoundingClientRect(), at2 = parseFloat(el.dataset.perch);
    if (isNaN(at2)) at2 = 85;
    var dy = el.hasAttribute('data-perch-ink') ? inkTop(el) : 0;
    return { x: r.left + window.scrollX + r.width * at2 / 100, y: r.top + window.scrollY + dy + 1 };
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
  // le perchoir a bougé après l'atterrissage (lettre qui finit d'entrer,
  // lettre soulevée au survol…) : il le suit au lieu de rester en l'air
  setInterval(function () {
    if (flying || !current || !current.el || !ready || reduce) return;
    var b = perchPoint(current.el);
    if (Math.abs(b.x - pos.x) > 3 || Math.abs(b.y - pos.y) > 3) {
      gsap.to(pos, { x: b.x, y: b.y, duration: .3, ease: 'power2.out', onUpdate: place, overwrite: true });
    }
  }, 250);
  window.addEventListener('resize', function () {
    applySize(); sizeTrail();
    if (current && current.el && !flying) snapTo(current.el);
  });

  // =========================================================================
  // POINTEUR
  // =========================================================================
  if (fine && !reduce) {
    root.addEventListener('pointerenter', function () { if (!flying) { ruffle(); blink(); } });
    window.addEventListener('pointermove', function (e) {
      if (flying || !current) return;
      var r = root.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * .4);
      if (Math.hypot(dx, dy) > 320 || Math.abs(dx) < 70) return;
      face(dx > 0 ? 1 : -1, true);
    }, { passive: true });
  }
  root.addEventListener('click', function () { loop(); });

  // =========================================================================
  // DÉMARRAGE (après chargement de la planche)
  // =========================================================================
  function start() {
    document.body.appendChild(trailSvg);
    document.body.appendChild(root);
    sizeTrail();
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
    }, 1500);
  }
  var img = new Image();
  var go0 = function () { if (document.readyState === 'complete') start(); else window.addEventListener('load', start); };
  img.onload = go0; img.onerror = go0;
  img.src = SRC;

  window.SKZBird = {
    perch: function (el, o) { if (o && o.lock) lock = el; go(el); },
    unlock: function () { lock = null; onScrollEnd(); },
    celebrate: loop,
    isFlying: function () { return flying; }
  };
})();
