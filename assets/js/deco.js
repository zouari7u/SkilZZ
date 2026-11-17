/* ==========================================================================
   ZkilZ — le fond : la route de l'oiseau
   Un fil très fin part du sommet de l'accueil et descend jusqu'au bas de
   la page en passant d'une marge à l'autre, dans les espaces entre les
   sections. Il se dessine au rythme du défilement ; à chaque section, un
   repère s'allume quand le fil l'atteint. Dans les marges, quelques traits
   de vent glissent lentement. Le tout passe derrière le contenu.
   ========================================================================== */
(function () {
  'use strict';
  function scrollNow() { return window.SKZ && window.SKZ.y != null ? window.SKZ.y : window.scrollY; }
  var VH = window.innerHeight;
  window.addEventListener('resize', function () { VH = window.innerHeight; });
  if (!(window.gsap && window.ScrollTrigger)) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'route');
  svg.setAttribute('aria-hidden', 'true');
  document.body.appendChild(svg);
  var guide, line, marks = [], winds = [], table = [], total = 0, samp = [], segs = [];

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(e);
    return e;
  }
  function docTop(n) { return n.getBoundingClientRect().top + window.scrollY; }

  // Catmull-Rom → courbes de Bézier
  function curve(p) {
    var d = 'M' + p[0].x.toFixed(1) + ' ' + p[0].y.toFixed(1);
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
      d += ' C' + (p1.x + (p2.x - p0.x) / 6).toFixed(1) + ' ' + (p1.y + (p2.y - p0.y) / 6).toFixed(1) + ' ' +
        (p2.x - (p3.x - p1.x) / 6).toFixed(1) + ' ' + (p2.y - (p3.y - p1.y) / 6).toFixed(1) + ' ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1);
    }
    return d;
  }

  var builtW = 0, builtH = 0;
  function build(force) {
    // un recalcul des déclencheurs ne change pas forcément la page : on ne
    // redessine le fil que si sa taille a changé (le redessiner coûte cher)
    var fw = document.documentElement.clientWidth, ff = document.querySelector('.footer');
    var fh = ff ? Math.ceil(docTop(ff) + ff.offsetHeight) : document.body.offsetHeight;
    if (force !== true && fw === builtW && Math.abs(fh - builtH) < 2) return;
    builtW = fw; builtH = fh;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    marks = []; winds.forEach(function (w) { w.kill(); }); winds = [];
    // hauteur du contenu = bas du pied de page (pas la hauteur du document,
    // qui inclut ce calque et l'empêchait de rapetisser)
    var foot0 = document.querySelector('.footer');
    var W = document.documentElement.clientWidth, H = foot0 ? Math.ceil(docTop(foot0) + foot0.offsetHeight) : document.body.offsetHeight;
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var narrow = W < 700, m = narrow ? 10 : Math.max(26, (W - 1180) / 4);
    var L = m, R = W - m;
    var secs = Array.prototype.slice.call(document.querySelectorAll('main > section:not(#top)'))
      .filter(function (s) { return s.offsetHeight > 160; });
    var hero = document.getElementById('top');
    if (!hero || !secs.length) return;
    // départ : dans l'espace sous le bandeau, côté droit (le fil ne coupe
    // ni l'illustration de l'accueil ni le bandeau)
    var strip = document.getElementById('strip');
    var y0 = strip ? docTop(strip) + strip.offsetHeight + 18 : docTop(hero) + hero.offsetHeight;
    var pts = [{ x: R, y: y0 }], stops = [];
    var side = 1;
    secs.forEach(function (s, i) {
      var top = docTop(s), h = s.offsetHeight;
      // passage d'une marge à l'autre dans l'espace au-dessus de la section
      pts.push({ x: W * (side > 0 ? .62 : .38), y: top + Math.min(70, h * .08) });
      side = -side;
      var p = { x: side > 0 ? R : L, y: top + Math.min(h * .45, 520) };
      pts.push(p); stops.push(p);
    });
    var foot = document.querySelector('.footer') || document.body;
    pts.push({ x: W * .5, y: docTop(foot) - 10 });

    var d = curve(pts);
    guide = el('path', { d: d, class: 'route-guide' });
    // le tracé sert de mesure ; on dessine des tronçons : pendant le
    // défilement, seul le tronçon en cours change (et se redessine), pas
    // un tracé de la hauteur de toute la page
    line = el('path', { d: d, class: 'route-measure' });
    total = line.getTotalLength();
    table = []; samp = [];
    for (var l = 0; l <= total; l += 12) { var q = line.getPointAtLength(l); samp.push([q.x, q.y, l]); if (l % 36 === 0) table.push([q.y, l]); }
    var qe = line.getPointAtLength(total); samp.push([qe.x, qe.y, total]); table.push([qe.y, total]);
    segs = [];
    for (var s0 = 0; s0 < samp.length - 1; s0 += 40) {
      var s1 = Math.min(samp.length - 1, s0 + 40), dd = 'M' + samp[s0][0].toFixed(1) + ' ' + samp[s0][1].toFixed(1);
      for (var k = s0 + 1; k <= s1; k++) dd += 'L' + samp[k][0].toFixed(1) + ' ' + samp[k][1].toFixed(1);
      var sp = el('path', { d: dd, class: 'route-line' }), sl = sp.getTotalLength();
      sp.style.strokeDasharray = sl + ' ' + (sl + 2); sp.style.strokeDashoffset = reduce ? 0 : sl;
      segs.push({ p: sp, a: samp[s0][2], len: sl, span: samp[s1][2] - samp[s0][2], v: reduce ? sl : 0 });
    }
    stops.forEach(function (p) {
      // ronds dans l'eau autour du repère (la précision du plongeon)
      var rg = el('g', { class: 'route-rings', transform: 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')' });
      var rings = [70, 130, 210].map(function (r, k) { return el('ellipse', { rx: r, ry: r * .92, class: 'rr rr' + k }, rg); });
      var g = el('g', { class: 'route-mark', transform: 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')' });
      el('circle', { r: 9, class: 'rm-halo' }, g);
      el('circle', { r: 4.5, class: 'rm-dot' }, g);
      marks.push({ g: g, y: p.y, on: false, rings: rings });
      if (!reduce) { gsap.set(g, { scale: 0, transformOrigin: '0 0' }); gsap.set(rings, { scale: .2, opacity: 0, transformOrigin: '0 0' }); }
    });

    // traits de vent dans les marges (ordinateur seulement)
    if (!narrow && !reduce) stops.forEach(function (p, i) {
      var dir = p.x > W / 2 ? -1 : 1, x = p.x + dir * 18, y = p.y - 150 - (i % 2) * 60;
      var g = el('g', { class: 'wind' });
      [0, 14, 28].forEach(function (dy, k) {
        var len = 90 - k * 22;
        el('path', { d: 'M' + x + ' ' + (y + dy) + ' q ' + (dir * len * .5) + ' -10 ' + (dir * len) + ' 0', class: 'wind-l', 'stroke-dasharray': '30 ' + (len + 20) }, g);
      });
      var wl = gsap.to(g.querySelectorAll('.wind-l'), { strokeDashoffset: -120, duration: 3.4, ease: 'none', repeat: -1, stagger: .5, paused: true });
      wl._y = y; winds.push(wl);
      winds.push(gsap.fromTo(g, { x: -dir * 10 }, { x: dir * 10, ease: 'none', scrollTrigger: { trigger: document.body, start: p.y - window.innerHeight + ' top', end: p.y + ' top', scrub: true } }));
    });
    update();
  }

  function lengthAt(y) {
    if (!table.length) return 0;
    var best = 0, prev = null;
    for (var i = 0; i < table.length; i++) {
      var t = table[i];
      if (t[0] <= y) best = Math.max(best, t[1]);
      else if (prev && prev[0] <= y && t[1] === prev[1] + 36) best = Math.max(best, prev[1] + (y - prev[0]) / Math.max(1, t[0] - prev[0]) * 36);
      prev = t;
    }
    return Math.min(total, best);
  }
  var drawn = 0;
  function update() {
    if (!line || reduce) return;
    var y = scrollNow() + VH * .62;
    var target = lengthAt(y);
    drawn += (target - drawn) * .14;
    if (Math.abs(target - drawn) < .5) drawn = target;
    for (var s = 0; s < segs.length; s++) {
      var sg = segs[s], v = Math.max(0, Math.min(sg.len, (drawn - sg.a) / (sg.span || 1) * sg.len));
      if (Math.abs(v - sg.v) > .3 || (v === 0) !== (sg.v === 0)) { sg.v = v; sg.p.style.strokeDashoffset = sg.len - v; }
    }
    var si = Math.min(samp.length - 1, Math.round(drawn / 12)), tipY = samp.length ? samp[si][1] : 0;
    // le vent ne souffle que près de l'écran
    var vy = scrollNow(), vh = VH;
    for (var w = 0; w < winds.length; w++) {
      var wt = winds[w]; if (wt._y === undefined) continue;
      var near = wt._y > vy - 300 && wt._y < vy + vh + 300;
      if (near && wt.paused()) wt.play(); else if (!near && !wt.paused()) wt.pause();
    }
    marks.forEach(function (mk) {
      var on = tipY >= mk.y - 2;
      if (on !== mk.on) {
        mk.on = on;
        gsap.to(mk.g, { scale: on ? 1 : 0, duration: on ? .7 : .3, ease: on ? 'elastic.out(1, .45)' : 'power2.in', overwrite: true });
        if (on) gsap.fromTo(mk.rings, { scale: .2, opacity: 1 }, { scale: 1, opacity: 1, duration: 2.2, stagger: .18, ease: 'expo.out', overwrite: true });
        else gsap.to(mk.rings, { opacity: 0, duration: .4, overwrite: true });
      }
    });
  }
  gsap.ticker.add(update);
  ScrollTrigger.addEventListener('refresh', build);

  // le contenu change de hauteur sans redimensionnement (image masquée,
  // question ouverte…) : on redessine
  if ('ResizeObserver' in window) {
    var lastH = 0, rTimer = null;
    new ResizeObserver(function () {
      var h = document.querySelector('main') ? document.querySelector('main').offsetHeight : 0;
      if (Math.abs(h - lastH) < 2) return;
      lastH = h; clearTimeout(rTimer); rTimer = setTimeout(build, 200);
    }).observe(document.querySelector('main') || document.body);
  }
  build(true);
})();
