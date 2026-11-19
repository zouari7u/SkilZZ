/* ==========================================================================
   ZkilZ — le martin-pêcheur (animation image par image + GSAP)
   Les poses viennent des planches dessinées dans le style du logo
   détourées et calées sur la tête : comme chez un vrai oiseau, la tête
   reste stable pendant que le corps monte et descend avec les ailes.
   Une seule image (kf-vol.webp) contient les 16 poses ; on change de pose
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
  var CELL = { w: 302, h: 313 }, COLS = 4, ROWS = 4;
  var F = { perch: 0, perchUp: 1, up: 2, mid: 3, down: 4, down2: 5, level: 6, rise: 7, upFeet: 8, flare: 9, upAlt: 10,
    crouch: 11, land: 12, front: 13, back: 14, dive: 15 };
  // poses où l'œil n'est pas à sa place de profil : pas de paupière
  var NOLID = { perchUp: 1, front: 1, back: 1, dive: 1 };
  var EYE = { x: 190.7, y: 109.7, r: 9.3 }, FOOT = { x: 169.4, y: 249 };
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
  // Hauteur du contenu : le bas du pied de page. (La hauteur du document
  // inclut ce calque : il ne pouvait jamais rapetisser, et une page devenue
  // plus courte — fenêtre élargie, image masquée — gardait un vide sous le
  // pied de page.)
  function contentHeight() {
    var f = document.querySelector('.footer');
    return f ? Math.ceil(f.getBoundingClientRect().bottom + window.scrollY) : document.body.offsetHeight;
  }
  function sizeTrail() {
    var w = document.documentElement.clientWidth, h = contentHeight();
    trailSvg.setAttribute('width', w); trailSvg.setAttribute('height', h);
    trailSvg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  }

  var frameNow = -1;
  function frame(name) {
    var i = F[name];
    if (i === frameNow) return;
    frameNow = i;
    spr.style.backgroundPosition = ((i % COLS) / (COLS - 1) * 100) + '% ' + (Math.floor(i / COLS) / (ROWS - 1) * 100) + '%';
    lid.style.visibility = NOLID[name] ? 'hidden' : '';
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
  // Hôte : posé sur un perchoir dans un bloc collant (sticky) ou fixe,
  // l'oiseau devient l'enfant de ce bloc. Le navigateur les déplace alors
  // ensemble pendant le défilement (Safari défile hors du JS : recaler
  // l'oiseau à chaque image laissait une image de retard).
  var host = null;
  function hostOf(el) {
    for (var n = el; n && n !== document.body; n = n.parentElement) {
      var cs = getComputedStyle(n), p = cs.position;
      // un bloc qui rogne son contenu couperait l'oiseau : on reste dans la page
      if (p === 'sticky' || p === 'fixed') return cs.overflow === 'visible' ? n : null;
    }
    return null;
  }
  function hostOrigin() {
    if (!host) return { x: 0, y: 0 };
    var r = host.getBoundingClientRect();
    return { x: r.left + host.clientLeft + window.scrollX, y: r.top + host.clientTop + window.scrollY };
  }
  function setHost(h) {
    if (h === host) return;
    host = h;
    (h || document.body).appendChild(root);
    place();
  }
  // Suivi de la cible pendant un vol : la trajectoire est calculée au
  // départ ; si la cible bouge ensuite autrement que la page (bloc collant,
  // écran qui s'anime, section épinglée), son déplacement est ajouté à
  // chaque image (poids w : 0 au décollage → 1 à l'arrivée, puis pendant le
  // sur-place et l'atterrissage).
  var trk = null;
  function drift() {
    if (!trk) return { x: 0, y: 0 };
    var c = perchPoint(trk.el);
    return { x: (c.x - trk.b0.x) * trk.w, y: (c.y - trk.b0.y) * trk.w };
  }
  function track(el, b0, w) { trk = el ? { el: el, b0: b0, w: w } : null; }
  // fin du suivi : le déplacement acquis est intégré à la position
  function bake() { if (!trk) return; var d = drift(); pos.x += d.x; pos.y += d.y; trk = null; }
  function place() {
    var o = hostOrigin(), d = drift();
    gsap.set(root, { x: pos.x + d.x - o.x - W * FOOT.x / CELL.w, y: pos.y + d.y - o.y - H * FOOT.y / CELL.h });
  }
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
      else if (g === 'flare') frame('land');
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
        b0 = opts.el ? perchPoint(opts.el) : opts.fn ? opts.fn() : null;
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
        if (b0) { var c = opts.el ? perchPoint(opts.el) : opts.fn(); p = { x: p.x + (c.x - b0.x) * o.t, y: p.y + (c.y - b0.y) * o.t }; }
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
        if (opts.progress) opts.progress(o.t);
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
  var flying = false, current = null, idle = null, flight = null, mode = null;

  function takeoff(tl, dir) {
    tl.add(function () { stopIdle(); gsap.set(bob, { rotation: 0, y: 0, scaleX: 1, scaleY: 1 }); if (dir) face(dir, true); })
      // anticipation : il s'accroupit
      .call(frame, ['crouch'])
      .to(bob, { scaleY: .92, scaleX: 1.04, duration: .08, ease: 'power2.in' })
      .call(frame, ['perchUp'])
      .to(bob, { scaleY: 1, scaleX: 1, duration: .1, ease: 'power2.out' })
      .call(frame, ['upFeet'], '-=.04')
      .add(function () { setGait('flap'); });
  }
  function landSeq(tl, b, el) {
    tl.add(function () { normTilt(); stopRhythm(); setGait('flare'); })
      .add(travel(function () { var e = trk ? b : el ? perchPoint(el) : b; return spline([{ x: pos.x, y: pos.y }, { x: (pos.x + e.x) / 2, y: e.y - 18 }, e], 6); }, .3, 'power2.out', { tilt: -16 }))
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
    return function () { bake(); flying = false; flight = null; afterLand(el); if (done) done(); };
  }

  // Vol vers un élément perchoir
  function flyTo(el, done, o) {
    o = o || {};
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
    track(el, b, 0);
    var tl = flight = gsap.timeline({ onComplete: endFlight(el, done) });
    if (o.air) tl.add(function () { stopIdle(); setGait('flap'); });
    else takeoff(tl, Math.abs(dx) > 20 ? dir : 0);
    // petit saut : perchoirs proches, ou d'un écran à l'autre dans la même scène
    if (dist < 170 || o.hop) {
      // petit saut d'un point à l'autre
      tl.add(travel(spline([a, { x: a.x + dx * .45, y: Math.min(a.y, b.y) - 52 }, { x: b.x - dir * 12, y: b.y - 34 }], 10), .46, 'power1.inOut'))
        .to(trk, { w: 1, duration: .46, ease: 'power1.inOut' }, '<');
      landSeq(tl, b, el);
      return tl;
    }
    // trajectoire directe et tendue, une légère montée puis l'approche
    var lift = 40 + Math.min(160, Math.abs(dx) * .12 + Math.abs(dy) * .08);
    var top = Math.min(a.y, b.y) - lift;
    var hover = { x: b.x - dir * 28, y: b.y - 78 };
    var pts = [a, { x: a.x + dir * 34, y: a.y - 40 }, { x: a.x + dx * .5, y: top }, hover];
    var sp = spline(pts, 14);
    var cruise = Math.max(.75, Math.min(1.9, sp.total / 720));
    tl.add(function () { startRhythm(); })
      .add(travel(sp, cruise, 'power1.inOut', { trail: true }))
      .to(trk, { w: 1, duration: cruise, ease: 'power1.inOut' }, '<');
    hoverAt(tl, .2);
    landSeq(tl, b, el);
    return tl;
  }

  // Sur-place au-dessus du perchoir, puis retour
  function sortie() {
    if (flying || !current || reduce) return;
    var home = { x: pos.x, y: pos.y }, f0 = facing;
    flying = true; track(current.el, perchPoint(current.el), 1);
    var tl = flight = gsap.timeline({ onComplete: endFlight(current.el) });
    takeoff(tl, 0);
    tl.add(travel(spline([home, { x: home.x - f0 * 26, y: home.y - 58 }, { x: home.x + f0 * 6, y: home.y - 104 }], 10), .62, 'power2.out'));
    hoverAt(tl, 1.2);
    tl.add(function () { face(-facing); }, '-=.55');
    landSeq(tl, home, current.el);
  }

  // Boucle (clic sur l'oiseau)
  function loop() {
    if (flying || !current || reduce) return;
    var a = { x: pos.x, y: pos.y }, r = 72 * (W / 130), f = facing;
    flying = true; track(current.el, perchPoint(current.el), 1);
    var tl = flight = gsap.timeline({ onComplete: endFlight(current.el) });
    takeoff(tl, 0);
    var pts = [a, { x: a.x + f * r * .9, y: a.y - r * .7 }, { x: a.x + f * r * 1.7, y: a.y - r * 2 }, { x: a.x + f * r * .8, y: a.y - r * 3 }, { x: a.x - f * r * .2, y: a.y - r * 2.2 }, { x: a.x + f * r * .1, y: a.y - r * 1.1 }, { x: a.x + f * r * .9, y: a.y - r * .9 }, { x: a.x + f * r * .3, y: a.y - 76 }];
    tl.add(function () { setGait('flap'); flapTl.timeScale(1.25); })
      .add(travel(spline(pts, 12), 1.55, 'sine.inOut', { trail: true, spin: true }));
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
    track(endEl, end, 0);
    var tl = flight = gsap.timeline({ onComplete: endFlight(endEl, function () { if (done) done(); }) });
    takeoff(tl, 1);
    tl.add(function () { ascentEvt({ p: 0 }); }, 0);
    var o = { p: 0 };
    tl.add(function () { startRhythm(); })
      .add(travel(sp, 1.8, 'power1.inOut', { progress: function (t) { ascentEvt({ p: t * .96 }); } }))
      .to(trk, { w: 1, duration: 1.8, ease: 'power1.inOut' }, '<')
      .to(o, { p: 1, duration: 1.8, ease: 'power1.inOut', onUpdate: function () { gsap.set(pathEl, { strokeDashoffset: len * (1 - o.p) }); } }, '<');
    hoverAt(tl, .25);
    landSeq(tl, end, endEl);
    // il touche le site : « en ligne »
    tl.add(function () { ascentEvt({ p: 1, landed: true }); }, tl.duration() - 1.15);
  }
  function ascentEvt(d) { document.dispatchEvent(new CustomEvent('kf:ascent', { detail: d })); }

  // =========================================================================
  // LE PLONGEON (section Réalisation) : il vole au-dessus du cercle, fait du
  // sur-place en visant, puis le défilement pilote son piqué jusqu'à ce que
  // le bec entre au centre. Plus loin, il ressort de l'eau et repart.
  // =========================================================================
  var TIP = { x: 283, y: 120 }, DIVE = 64, HOVER_T = -14;
  // position des pattes pour que la pointe du bec soit en T, corps tourné de θ
  function footForTip(T, th) {
    var r = th * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    var ox = W * .52, oy = H * .58;
    var vx = W * TIP.x / CELL.w - ox, vy = H * TIP.y / CELL.h - oy;
    var lx = T.x - ox - (vx * c - vy * s), ly = T.y - oy - (vx * s + vy * c);
    return { x: lx + W * FOOT.x / CELL.w, y: ly + H * FOOT.y / CELL.h };
  }
  var BACK = { x: -Math.cos(DIVE * Math.PI / 180), y: -Math.sin(DIVE * Math.PI / 180) };
  function diveTip(k) {
    var C = mode.center(), d = mode.radius() + W * .55;
    return { x: C.x + BACK.x * d * k, y: C.y + BACK.y * d * k };
  }
  function hoverFoot() { return footForTip(diveTip(1), HOVER_T); }
  function diveStart(center, radius) {
    if (reduce || mode) return;
    chase = null;
    if (flight) { flight.kill(); flight = null; }
    bake();
    stopRhythm(); stopIdle();
    var perched = gait === 'off' || gait === 'frozen';
    flying = true; lock = null; queued = null; current = null; ready = true;
    mode = { center: center, radius: radius, p: 0, ready: false };
    gsap.set(root, { opacity: 1 });
    var tl = mode.tl = flight = gsap.timeline({ onComplete: function () { flight = null; if (mode) mode.ready = true; } });
    if (perched) takeoff(tl, 0); else tl.add(function () { setGait('flap'); });
    tl.add(function () { startRhythm(); })
      .add(travel(function () {
        var h = hoverFoot();
        return spline([{ x: pos.x, y: pos.y }, { x: (pos.x + h.x) / 2, y: Math.min(pos.y, h.y) - 60 }, h], 10);
      }, 1.1, 'power1.inOut', { fn: hoverFoot, trail: true }))
      .add(function () { if (mode) mode.hovering = true; stopRhythm(); setGait('hover'); face(1, true); fadeTrail(); })
      .to(tilt, { rotation: HOVER_T, duration: .3, ease: 'power2.out', onComplete: function () { tiltNow = HOVER_T; } }, '<');
  }
  function diveTo(p) {
    if (!mode) return;
    mode.p = p;
    if (p <= 0) {
      if (mode.ready) { setGait('hover'); gsap.set(root, { opacity: 1 }); gsap.set(spr, { scale: 1 }); gsap.set(tilt, { rotation: HOVER_T }); tiltNow = HOVER_T; }
      return;
    }
    if (!mode.ready) { if (mode.tl) mode.tl.kill(); flight = null; mode.ready = true; stopRhythm(); fadeTrail(); }
    setGait('frozen');
    frame(p < .1 ? 'upFeet' : 'level');            // dernier coup d'aile, puis ailes collées
    facing = 1; gsap.set(flip, { scaleX: 1 }); gsap.set(bob, { y: 0, rotation: 0, scaleX: 1, scaleY: 1 });
    var turn = Math.min(1, p / .3), th = HOVER_T + (DIVE - HOVER_T) * (1 - (1 - turn) * (1 - turn));
    tiltNow = th; gsap.set(tilt, { rotation: th });
    var k = 1 - p * p;                               // il accélère en piquant
    var f = footForTip(diveTip(k), th);
    pos.x = f.x; pos.y = f.y; place();
    // une fois le bec dans l'eau, il s'enfonce : il rapetisse et s'efface
    var r = mode.radius(), inside = Math.max(0, Math.min(1, 1 - (r + W * .55) * k / r));
    gsap.set(spr, { scale: 1 - .5 * inside, transformOrigin: (TIP.x / CELL.w * 100) + '% ' + (TIP.y / CELL.h * 100) + '%' });
    gsap.set(root, { opacity: p >= .985 ? 0 : 1 - .85 * Math.pow(inside, 1.4) });
  }
  function diveEnd() {
    if (!mode) return;
    if (mode.tl) mode.tl.kill();
    var under = mode.p >= .985;
    mode = null; flight = null; flying = false;
    // il ressort de l'eau : il grandit en remontant
    gsap.set(root, { opacity: 1 });
    if (under) gsap.fromTo(spr, { scale: .5 }, { scale: 1, duration: .5, ease: 'back.out(1.6)' });
    else gsap.set(spr, { scale: 1 });
    normTilt();
    var t = best() || bestAny() || fabPerch();
    if (t) flyTo(t, null, { air: true });
    else { setGait('hover'); }
  }


  // =========================================================================
  // POURSUITE : pendant le défilement, il vole avec la page, en temps réel.
  // Un ressort amorti le tire vers le perchoir qui sera le bon à l'arrêt
  // (au-dessus de lui, en sur-place) ; il ne sort jamais de l'écran. La pose
  // suit la vitesse : piqué quand on descend vite, vue de dos quand on
  // remonte vite, vue de face pendant un demi-tour, sur-place au ralenti.
  // À l'arrêt du défilement, il se pose aussitôt.
  // =========================================================================
  var chase = null, ascending = false;
  function chaseStart() {
    if (chase || mode || reduce || lock) return;
    if (ascending) { ascending = false; ascentEvt({ p: 1, skip: true }); }
    var wasPerched = !flying;
    if (flight) { flight.kill(); flight = null; }
    bake(); stopRhythm(); stopIdle(); normTilt();
    gsap.killTweensOf(bob); gsap.set(bob, { rotation: 0, y: 0, scaleX: 1, scaleY: 1 });
    flying = true; current = null; queued = null;
    chase = { vx: 0, vy: 0, el: null, pick: 0, front: 0, settled: false, since: 0, launch: wasPerched ? .07 : 0 };
    if (wasPerched) { setGait('frozen'); frame('crouch'); gsap.to(bob, { scaleY: .92, scaleX: 1.04, duration: .07, yoyo: true, repeat: 1 }); }
    else setGait('flap');
  }
  function chaseTarget() {
    var vh = window.innerHeight, sy = window.scrollY;
    if (chase.el) {
      var b = perchPoint(chase.el);
      return { x: b.x - facing * 18, y: b.y - 58, b: b };
    }
    return { x: Math.max(80, Math.min(window.innerWidth - 80, pos.x)), y: sy + vh * .38 };
  }
  function chaseTick(dt) {
    var c = chase;
    var launching = c.launch > 0;
    if (launching) {
      c.launch -= dt;
      if (c.launch <= 0) { frame('upFeet'); c.vy = -320; setGait('flap'); launching = false; }
    }
    c.since += dt;
    // nouvelle cible seulement si elle reste la meilleure 0,3 s (sinon il
    // zigzaguerait entre les perchoirs pendant le défilement)
    c.pick -= dt;
    if (c.pick <= 0) {
      c.pick = .08;
      var nb = best() || null;
      if (nb === c.el || !c.el || c.settled) { c.el = nb || (c.settled ? bestAny() : c.el) || c.el; c.cand = null; }
      else if (nb !== c.cand) { c.cand = nb; c.candT = 0; }
      else if ((c.candT += .08) >= .3) { c.el = nb; c.cand = null; }
    }
    var T = chaseTarget();
    // ressort amorti : rapide, un peu d'élan, pas d'oscillation ; plus
    // ferme une fois le défilement arrêté, pour se poser vite
    // ressort à amortissement critique : il rejoint sa cible au plus vite, sans osciller
    var k = c.settled ? 140 : 90, damp = 2 * Math.sqrt(k);
    if (launching) { c.vx = 0; c.vy = 0; k = 0; }
    c.vx += ((T.x - pos.x) * k - c.vx * damp) * dt;
    c.vy += ((T.y - pos.y) * k - c.vy * damp) * dt;
    var sp = Math.hypot(c.vx, c.vy), max = 3200;
    if (sp > max) { c.vx *= max / sp; c.vy *= max / sp; sp = max; }
    pos.x += c.vx * dt; pos.y += c.vy * dt;
    // il vole avec la page : le défilement l'emporte presque entièrement,
    // le ressort ne fait que le rapprocher de sa cible
    var sy = window.scrollY;
    if (c.sy !== undefined) pos.y += sy - c.sy;
    c.sy = sy;
    // l'écran l'entraîne : il reste toujours visible, sous la barre de navigation
    var navEl = document.getElementById('nav'), navB = navEl ? navEl.getBoundingClientRect().bottom : 0;
    var top = sy + navB + H * .85 + 6, bottom = window.scrollY + window.innerHeight - 12;
    if (pos.y < top) { pos.y = top; c.vy = Math.max(c.vy, 0); }
    if (pos.y > bottom) { pos.y = bottom; c.vy = Math.min(c.vy, 0); }
    pos.x = Math.max(W * .5, Math.min(window.innerWidth - W * .5, pos.x));
    place();
    if (launching) return;

    // orientation : demi-tour en passant par la vue de face
    if (Math.abs(c.vx) > 140) {
      var dir = c.vx > 0 ? 1 : -1;
      if (dir !== facing) { if (sp > 260) c.front = .13; face(dir, true); }
    }
    var tiltTarget;
    if (c.front > 0) { c.front -= dt; setGait('frozen'); frame('front'); tiltTarget = 0; }
    else if (c.vy > 650 && c.vy > Math.abs(c.vx) * 1.4) { setGait('frozen'); frame('dive'); tiltTarget = 0; }
    else if (c.vy < -1300 && -c.vy > Math.abs(c.vx) * 1.4) { setGait('frozen'); frame('back'); tiltTarget = 0; }
    else if (sp < 150) { setGait('hover'); tiltTarget = -14; }
    else {
      setGait('flap');
      flapTl.timeScale(.85 + Math.min(1, sp / 1400) * .9);
      tiltTarget = Math.max(-30, Math.min(26, Math.atan2(c.vy, Math.abs(c.vx) + 60) * 180 / Math.PI * .6));
    }
    tiltNow += (tiltTarget - tiltNow) * Math.min(1, dt * 12);
    gsap.set(tilt, { rotation: tiltNow });

    // arrêt du défilement : il se pose dès qu'il est au-dessus du perchoir
    if (c.settled && c.el && T.b) {
      var d = Math.hypot(T.x - pos.x, T.y - pos.y);
      if ((d < 48 && sp < 900) || c.settled > .35) chaseLand(c.el);
      else c.settled += dt;
    } else if (c.settled) {
      // aucun perchoir à l'écran : il ne reste pas en l'air, il se pose sur
      // la pastille de l'assistant (toujours là, en bas à droite)
      c.settled += dt;
      if (c.settled > .6 && fabPerch()) chaseLand(fabPerch());
    }
  }
  function fabPerch() {
    var f = document.getElementById('agentFab');
    if (!f || f.classList.contains('is-open') || getComputedStyle(f).visibility === 'hidden') return null;
    var r = f.getBoundingClientRect();
    return r.width ? f : null;
  }
  function chaseLand(el) {
    chase = null;
    current = { el: el };
    var b = perchPoint(el);
    track(el, b, 1);
    var tl = flight = gsap.timeline({ onComplete: endFlight(el) });
    landSeq(tl, b, el);
  }
  // le perchoir actuel convient-il encore ?
  function needsMove() {
    if (ascending) return window.scrollY > 260;
    if (flying) return !!flight;
    if (!current || !current.el) return true;
    var r = current.el.getBoundingClientRect(), vh = window.innerHeight;
    if (r.top < vh * .06 || r.top > vh * .86) return true;
    var b = best();
    return !!b && b !== current.el;
  }

  // =========================================================================
  // POSÉ : ATTENTE
  // =========================================================================
  var sortieTimer = null;
  function afterLand(el) {
    if (el) document.dispatchEvent(new CustomEvent('kf:land', { detail: el }));
    // une demande en attente n'est suivie que si son perchoir est encore à l'écran
    if (queued && queued !== el) { var n = queued, qr = n.getBoundingClientRect(); queued = null; if (qr.bottom > 0 && qr.top < window.innerHeight) { setTimeout(function () { go(n); }, 140); return; } }
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
    sortieTimer = setTimeout(function () { if (!flying && !mode && !lock && Date.now() - lastScroll > 4000 && onScreen()) sortie(); }, 15000 + Math.random() * 12000);
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
  // les pattes s'enfoncent de 3 px dans la surface : il paraît agrippé, même
  // sur un rebord sombre à peine visible
  var GRIP = 3;
  var inkCtx = null;
  function inkTop(el) {
    var cs = getComputedStyle(el), key = cs.fontSize + cs.lineHeight;
    if (el._ink && el._ink.key === key) return el._ink.v;
    var v = measureInk(el, cs);
    el._ink = { key: key, v: v };
    return v;
  }
  function measureInk(el, cs) {
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
    return { x: r.left + window.scrollX + r.width * at2 / 100, y: r.top + window.scrollY + dy + GRIP };
  }
  function snapTo(el) { var b = perchPoint(el); pos.x = b.x; pos.y = b.y; current = { el: el }; place(); }
  function onScreen() { var r = root.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; }
  var perches = [], lock = null;
  // perchoirs automatiques : le haut des cartes, encarts et images de toutes
  // les pages (un data-perch posé à la main garde la priorité)
  var AUTO = 'main .moumous-list li, main .mm-sig-rules li, main .pledges li, main .svc-relay, main .svc-tile, main .extra, main .value, main .phase, main .way, main .mono-col, main .split-media .shot, main .page-hero-media, main .project, main .qa, main .incl li, main .partner, main .moumous-panel, main .cta-band, main .contact-panel, main .legal-body, main .case-shot, main .gallery .shot';
  function px(v, w) { var n = parseFloat(v) || 0; return /%/.test(v) ? n / 100 * w : n; }
  function collect() {
    document.querySelectorAll(AUTO).forEach(function (el, i) {
      if (!el.hasAttribute('data-perch') && !el.closest('[data-perch]')) el.setAttribute('data-perch', String(i % 2 ? 22 : 80));
    });
    perches = Array.prototype.slice.call(document.querySelectorAll('[data-perch]'));
    // jamais dans le vide : sur un disque, au sommet ; sur un encart arrondi,
    // hors des coins (là où le bord haut est encore droit)
    perches.forEach(function (el) {
      if (el.classList.contains('perch-pt') || el.hasAttribute('data-perch-ink')) return;
      if (el._p0 === undefined) el._p0 = parseFloat(el.dataset.perch) || 85;
      var w = el.offsetWidth; if (!w) return;
      var cs = getComputedStyle(el), rad = Math.min(el.offsetHeight / 2, Math.max(px(cs.borderTopLeftRadius, w), px(cs.borderTopRightRadius, w)));
      if (rad >= w / 2 - 1 && el.offsetHeight >= w - 1) { el.dataset.perch = '50'; return; }
      var lo = (rad + 14) / w * 100, hi = 100 - lo;
      el.dataset.perch = String(Math.max(lo, Math.min(hi, el._p0)).toFixed(1));
    });
  }
  // n'importe quel perchoir visible, faute de mieux (sortie du plongeon)
  function bestAny() {
    var vh = window.innerHeight, pick = null, d = 1e9;
    perches.forEach(function (el) {
      if (el.id === 'agentFab') return;
      if (el.offsetParent === null) return;
      var r = el.getBoundingClientRect();
      if (r.top < 40 || r.top > vh - 40) return;
      var dd = Math.abs(r.top - vh * .4);
      if (dd < d) { d = dd; pick = el; }
    });
    return pick;
  }
  function best() {
    var vh = window.innerHeight, target = vh * .32, pick = null, d = 1e9;
    perches.forEach(function (el) {
      if (el.id === 'agentFab') return;          // la pastille : seulement en dernier recours
      // d'abord la position (bon marché), puis seulement l'opacité des parents
      var r = el.getBoundingClientRect();
      if (r.top < vh * .1 || r.top > vh * .78 || r.bottom < 0 || (!r.width && !r.height)) return;
      for (var n = el, k = 0; n && k < 4; n = n.parentElement, k++) { if (parseFloat(getComputedStyle(n).opacity) < .6) return; }
      var px = r.left + r.width * (parseFloat(el.dataset.perch) || 85) / 100;
      if (px < 40 || px > window.innerWidth - 40) return;
      var dd = Math.abs(r.top - target);
      if (dd < d) { d = dd; pick = el; }
    });
    return pick;
  }
  var settle = null, ready = false, lastScroll = 0, queued = null;
  function go(el, o) {
    if (!el || (current && current.el === el)) return;
    if (mode) return;
    if (flying) { queued = el; return; }
    flyTo(el, null, o);
  }
  function onScrollEnd() {
    if (!ready || lock || mode) return;
    // à l'arrêt : toujours le meilleur perchoir visible (l'ancienne cible a pu sortir de l'écran)
    if (chase) { if (!chase.settled) chase.settled = .001; chase.el = best() || bestAny() || null; chase.cand = null; return; }
    go(best());
  }
  var moveCheck = 0;
  window.addEventListener('scroll', function () {
    lastScroll = Date.now();
    if (ready && !lock && !mode && !reduce) {
      if (chase) chase.settled = false;
      else if (Date.now() - moveCheck > 90) { moveCheck = Date.now(); if (needsMove()) chaseStart(); }
    }
    clearTimeout(settle);
    settle = setTimeout(onScrollEnd, reduce ? 0 : 120);
  }, { passive: true });
  // À chaque image (juste après le défilement doux) : posé, il colle à son
  // perchoir, même s'il est fixe à l'écran (téléphone des services) ou s'il
  // bouge (lettre soulevée) ; en sur-place au-dessus du cercle, il suit le
  // cercle.
  gsap.ticker.add(function (time, deltaMs) {
    if (chase) { if (host) setHost(null); chaseTick(Math.min(.05, (deltaMs || 16) / 1000)); return; }
    if (host && (flying || mode || !current || !current.el)) setHost(null);
    if (!flying && !mode && current && current.el) setHost(hostOf(current.el));
    if (reduce) return;
    if (mode) {
      if ((mode.ready || mode.hovering) && mode.p <= 0) { var h = hoverFoot(); pos.x = h.x; pos.y = h.y; place(); }
      return;
    }
    if (flying) { if (trk) place(); return; }
    if (!current || !current.el) return;
    // écart mesuré à l'écran, dans une seule lecture de la mise en page
    // (sans passer par la position de défilement, que Safari peut mettre à
    // jour avec un temps de retard pendant un défilement)
    var el = current.el, r = el.getBoundingClientRect(), k = root.getBoundingClientRect();
    var at3 = parseFloat(el.dataset.perch); if (isNaN(at3)) at3 = 85;
    var tx = r.left + r.width * at3 / 100, ty = r.top + (el.hasAttribute('data-perch-ink') ? inkTop(el) : 0) + GRIP;
    var dx = tx - (k.left + W * FOOT.x / CELL.w), dy = ty - (k.top + H * FOOT.y / CELL.h);
    var moved = Math.abs(dx) > .3 || Math.abs(dy) > .3;
    if (host) {
      // dans un bloc collant, il ne bouge pas à l'écran quand on défile :
      // sa position dans la page est remise à jour ici, et l'écart est
      // corrigé sur place (relatif) pour ne pas mélanger les deux repères
      pos.x = tx + window.scrollX; pos.y = ty + window.scrollY;
      if (moved) gsap.set(root, { x: '+=' + dx, y: '+=' + dy });
    } else if (moved) { pos.x += dx; pos.y += dy; place(); }
  });
  if ('ResizeObserver' in window) new ResizeObserver(function () { sizeTrail(); }).observe(document.querySelector('main') || document.body);
  window.addEventListener('resize', function () {
    applySize(); sizeTrail(); collect();
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
  root.addEventListener('click', function (e) { e.stopPropagation(); e.preventDefault(); loop(); });

  // =========================================================================
  // DÉMARRAGE (après chargement de la planche)
  // =========================================================================
  function start() {
    if (started) return;
    started = true;
    document.body.appendChild(trailSvg);
    document.body.appendChild(root);
    sizeTrail();
    collect();
    var startEl = document.getElementById('perchStart');
    var topEl = document.getElementById('perchTop');
    var path = document.getElementById('ascentPath');
    if (reduce) { var e = topEl || best(); if (e) snapTo(e); ready = true; ascentEvt({ p: 1, skip: true }); return; }
    ready = true;
    if (!startEl || !topEl || window.scrollY > 200) {
      if (startEl) ascentEvt({ p: 1, skip: true });
      // il arrive tout de suite en volant, par le haut de l'écran
      pos.x = window.innerWidth * (Math.random() < .5 ? .15 : .85); pos.y = window.scrollY + H; place();
      chaseStart(); if (chase) { chase.settled = .001; chase.vy = 600; }
      return;
    }
    snapTo(startEl);
    startIdle();
    gsap.from(root, { opacity: 0, duration: .4, ease: 'power2.out' });
    setTimeout(function () {
      if (mode || chase || flying) return;
      if (window.scrollY > 200) { ascentEvt({ p: 1, skip: true }); onScrollEnd(); return; }
      ascending = true;
      ascend(path, topEl, function () { ascending = false; onScrollEnd(); });
    }, 550);
  }
  var started = false;
  var img = new Image();
  // dès que la page est lisible (sans attendre toutes ses images)
  var go0 = function () { if (document.readyState !== 'loading') start(); else document.addEventListener('DOMContentLoaded', start); };
  img.onload = go0; img.onerror = go0;
  img.src = SRC;

  window.SKZBird = {
    perch: function (el, o) { if (o && o.lock) { lock = el; if (chase) chaseLand(el); } go(el, o); },
    unlock: function () { lock = null; onScrollEnd(); },
    celebrate: loop,
    diveStart: diveStart,
    diveTo: diveTo,
    diveEnd: diveEnd,
    isFlying: function () { return flying; },
    state: function () { return chase ? (chase.settled ? 'poursuite-arrêt' : 'poursuite') : mode ? 'plongeon' : flying ? 'vol' : 'posé'; },
    perchedOn: function () { return !flying && current ? current.el : null; },
    target: function () { return current ? current.el : null; }
  };
})();
