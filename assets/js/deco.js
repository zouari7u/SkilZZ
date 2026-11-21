/* ==========================================================================
   ZkilZ — le fond : la route de l'oiseau
   Un fil très fin part du sommet de l'accueil et descend jusqu'au bas de
   la page en passant d'une marge à l'autre, dans les espaces entre les
   sections. Il se dessine au rythme du défilement ; à chaque section, un
   repère s'allume quand le fil l'atteint. Dans les marges, quelques traits
   de vent glissent lentement. Le tout passe derrière le contenu.

   Stabilité : chaque point du fil est accroché à sa section (écart en
   pixels depuis le haut de la section, fixé au premier tracé). Quand une
   section change de hauteur (question dépliée, image chargée…), on ne
   reconstruit rien : les points suivent leur section dans la même image,
   le fil se recalcule en JS pur (sans mesure SVG) et seuls les tronçons
   qui ont réellement changé sont réécrits. Les repères allumés le restent.
   Reconstruction complète : seulement si la largeur change.
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
  // le tracé en pointillés, fixe, dans sa propre couche
  var svgBg = document.createElementNS(NS, 'svg');
  svgBg.setAttribute('class', 'route route--bg');
  svgBg.setAttribute('aria-hidden', 'true');
  document.body.appendChild(svgBg);
  document.body.appendChild(svg);

  var anchors = [], pts = [], stops = [], marks = [], winds = [], segs = [];
  var segBox = null, table = [], total = 0, samp = [];
  var builtW = 0, builtH = 0, ready = false, settled = false;

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(e);
    return e;
  }
  function docTop(n) { return n.getBoundingClientRect().top + window.scrollY; }
  function contentH() {
    var f = document.querySelector('.footer');
    return f ? Math.ceil(docTop(f) + f.offsetHeight) : document.body.offsetHeight;
  }
  function anchor(node) { var a = { n: node, top: docTop(node) }; anchors.push(a); return a; }
  // un point accroché : x fixe, y = haut de son ancre + écart
  function pin(x, y, a) { return { x: x, a: a, off: y - a.top }; }
  function ptsNow() { return pts.map(function (p) { return { x: p.x, y: p.a.top + p.off }; }); }

  // ---- géométrie, en JS pur (Catmull-Rom → Bézier, longueur d'arc) ------
  // échantillons tous les 12 px le long du fil : [x, y, longueur]
  function sample(p) {
    var fine = [[p[0].x, p[0].y, 0]], len = 0;
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
      var c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      var n = Math.max(8, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / 3));
      var px = p1.x, py = p1.y;
      for (var k = 1; k <= n; k++) {
        var t = k / n, u = 1 - t;
        var x = u * u * u * p1.x + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * p2.x;
        var y = u * u * u * p1.y + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * p2.y;
        len += Math.hypot(x - px, y - py); px = x; py = y;
        fine.push([x, y, len]);
      }
    }
    var out = [], j = 0;
    for (var l = 0; l <= len; l += 12) {
      while (j < fine.length - 2 && fine[j + 1][2] < l) j++;
      var a = fine[j], b = fine[j + 1] || a, f = b[2] > a[2] ? (l - a[2]) / (b[2] - a[2]) : 0;
      out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, l]);
    }
    var e = fine[fine.length - 1]; out.push([e[0], e[1], len]);
    total = len; samp = out; table = [];
    for (var q = 0; q < out.length - 1; q += 3) table.push([out[q][1], out[q][2]]);
    table.push([e[1], len]);
  }
  // tronçons de 40 échantillons : seul le tronçon en cours se redessine
  function segData() {
    var list = [];
    for (var s0 = 0; s0 < samp.length - 1; s0 += 40) {
      var s1 = Math.min(samp.length - 1, s0 + 40), dd = 'M' + samp[s0][0].toFixed(1) + ' ' + samp[s0][1].toFixed(1), ln = 0;
      for (var k = s0 + 1; k <= s1; k++) {
        dd += 'L' + samp[k][0].toFixed(1) + ' ' + samp[k][1].toFixed(1);
        ln += Math.hypot(samp[k][0] - samp[k - 1][0], samp[k][1] - samp[k - 1][1]);
      }
      list.push({ d: dd, a: samp[s0][2], len: Math.max(.01, ln), span: samp[s1][2] - samp[s0][2] });
    }
    return list;
  }
  function applySegs() {
    var list = segData();
    if (list.length !== segs.length) {
      // le nombre de tronçons change (page nettement plus longue/courte)
      segs.forEach(function (s) { s.p.remove(); s.g.remove(); }); segs = [];
      list.forEach(function (d) {
        var sp = el('path', { d: d.d, class: 'route-line' }, segBox);
        var gp = el('path', { d: d.d, class: 'route-guide' }, svgBg);
        d.p = sp; d.g = gp; d.v = -1; segs.push(d);
        sp.style.strokeDasharray = d.len + ' ' + (d.len + 2);
      });
    } else {
      list.forEach(function (d, i) {
        var s = segs[i];
        s.a = d.a; s.span = d.span;
        if (d.d === s.d) return;   // tronçon inchangé (au-dessus du changement)
        s.d = d.d; s.p.setAttribute('d', d.d); s.g.setAttribute('d', d.d);
        if (Math.abs(d.len - s.len) > .05) { s.len = d.len; s.p.style.strokeDasharray = d.len + ' ' + (d.len + 2); }
        s.v = -1;
      });
    }
  }
  function placeStops() {
    var P = ptsNow();
    stops.forEach(function (st, i) {
      var p = P[st.i];
      if (p.y === st.y) return;
      st.y = p.y; st.g.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')');
      if (marks[i]) marks[i].y = p.y;
      if (winds[i]) winds[i].y = p.y;
    });
  }

  function build() {
    builtW = document.documentElement.clientWidth; builtH = contentH();
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    while (svgBg.firstChild) svgBg.removeChild(svgBg.firstChild);
    anchors = []; pts = []; stops = []; marks = []; winds = []; segs = [];
    var W = builtW, H = builtH;
    [svg, svgBg].forEach(function (s) { s.setAttribute('width', W); s.setAttribute('height', H); s.setAttribute('viewBox', '0 0 ' + W + ' ' + H); });
    var narrow = W < 700, m = narrow ? 10 : Math.max(26, (W - 1180) / 4);
    var L = m, R = W - m;
    var secs = Array.prototype.slice.call(document.querySelectorAll('main > section:not(#top)'))
      .filter(function (s) { return s.offsetHeight > 160; });
    var hero = document.getElementById('top');
    if (!hero || !secs.length) { ready = false; return; }
    // départ : dans l'espace sous le bandeau, côté droit
    var strip = document.getElementById('strip');
    var a0 = anchor(strip || hero);
    var y0 = strip ? a0.top + strip.offsetHeight + 18 : a0.top + hero.offsetHeight;
    pts.push(pin(R, y0, a0));
    var side = 1;
    secs.forEach(function (s) {
      var a = anchor(s), h = s.offsetHeight;
      // passage d'une marge à l'autre dans l'espace au-dessus de la section
      pts.push(pin(W * (side > 0 ? .62 : .38), a.top + Math.min(70, h * .08), a));
      side = -side;
      // repère : écart figé depuis le haut de la section (il ne bouge plus
      // quand la section grandit)
      pts.push(pin(side > 0 ? R : L, a.top + Math.min(h * .45, 520), a));
      stops.push({ i: pts.length - 1, y: null });
    });
    var foot = document.querySelector('.footer') || document.body, af = anchor(foot);
    pts.push(pin(W * .5, af.top - 10, af));

    segBox = el('g', {});
    sample(ptsNow());
    applySegs();
    stops.forEach(function (st) {
      var p = pts[st.i], g = el('g', { class: 'route-stop' });
      st.g = g;
      // ronds dans l'eau autour du repère (la précision du plongeon)
      var rg = el('g', { class: 'route-rings' }, g);
      var rings = [70, 130, 210].map(function (r, k) { return el('ellipse', { rx: r, ry: r * .92, class: 'rr rr' + k }, rg); });
      var mg = el('g', { class: 'route-mark' }, g);
      el('circle', { r: 9, class: 'rm-halo' }, mg);
      el('circle', { r: 4.5, class: 'rm-dot' }, mg);
      marks.push({ g: mg, y: 0, on: false, rings: rings });
      if (!reduce) { gsap.set(mg, { scale: 0, transformOrigin: '0 0' }); gsap.set(rings, { opacity: 0 }); }
      // traits de vent dans les marges (ordinateur seulement), placés par
      // rapport au repère : ils suivent sa section
      if (!narrow && !reduce) {
        var dir = p.x > W / 2 ? -1 : 1, wy = -150 - (winds.length % 2) * 60;
        var wg = el('g', { class: 'wind' }, g);
        [0, 14, 28].forEach(function (dy, k) {
          var len = 90 - k * 22;
          el('path', { d: 'M' + (dir * 18) + ' ' + (wy + dy) + ' q ' + (dir * len * .5) + ' -10 ' + (dir * len) + ' 0', class: 'wind-l', 'stroke-dasharray': '30 ' + (len + 20) }, wg);
        });
        winds.push({ g: wg, dir: dir, y: 0, x: null });
      } else winds.push(null);
    });
    placeStops();
    ready = true;
    // état immédiat, sans animation : rien ne « reclignote » après un tracé
    drawn = lengthAt(scrollNow() + VH * .62);
    syncMarks(true);
    update();
  }

  // la page a changé de hauteur sans changer de largeur : on suit, dans la
  // même image, sans rien recréer
  function relayout() {
    if (!ready) return build();
    var moved = false;
    for (var i = 0; i < anchors.length; i++) {
      var t = docTop(anchors[i].n);
      if (Math.abs(t - anchors[i].top) > .1) { anchors[i].top = t; moved = true; }
    }
    var H = contentH();
    if (H !== builtH) {
      builtH = H;
      [svg, svgBg].forEach(function (s) { s.setAttribute('height', H); s.setAttribute('viewBox', '0 0 ' + builtW + ' ' + H); });
    }
    if (!moved) return;
    sample(ptsNow());
    applySegs();
    placeStops();
    update();
  }
  function onChange() {
    if (document.documentElement.clientWidth !== builtW) return build();
    // avant la fin du chargement, les hauteurs bougent encore beaucoup :
    // on retrace ; ensuite, on ne fait plus que suivre
    if (!settled && Math.abs(contentH() - builtH) >= 2) return build();
    relayout();
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
  function tipY() {
    var si = Math.min(samp.length - 1, Math.round(drawn / 12));
    return samp.length ? samp[si][1] : 0;
  }
  function syncMarks(instant) {
    var ty = tipY();
    marks.forEach(function (mk) {
      var on = ty >= mk.y - 2;
      if (on === mk.on) return;
      mk.on = on;
      if (reduce) return;
      if (instant) { gsap.set(mk.g, { scale: on ? 1 : 0 }); gsap.set(mk.rings, { opacity: on ? 1 : 0 }); return; }
      gsap.to(mk.g, { scale: on ? 1 : 0, duration: on ? .7 : .3, ease: on ? 'elastic.out(1, .45)' : 'power2.in', overwrite: true });
      if (on) gsap.fromTo(mk.rings, { opacity: 0 }, { opacity: 1, duration: .8, stagger: .15, ease: 'power2.out', overwrite: true });
      else gsap.to(mk.rings, { opacity: 0, duration: .4, overwrite: true });
    });
  }
  var drawn = 0;
  function update() {
    if (!ready || reduce) return;
    var sy = scrollNow(), vh = VH;
    var target = lengthAt(sy + vh * .62);
    drawn += (target - drawn) * .14;
    if (Math.abs(target - drawn) < .5) drawn = target;
    for (var s = 0; s < segs.length; s++) {
      var sg = segs[s], v = Math.max(0, Math.min(sg.len, (drawn - sg.a) / (sg.span || 1) * sg.len));
      if (sg.v < 0 || Math.abs(v - sg.v) > .3 || (v === 0) !== (sg.v === 0)) { sg.v = v; sg.p.style.strokeDashoffset = sg.len - v; }
    }
    // vent : glisse de -10 à +10 px pendant que son repère traverse l'écran
    for (var w = 0; w < winds.length; w++) {
      var wd = winds[w]; if (!wd) continue;
      if (wd.y < sy - 300 || wd.y > sy + vh + 300) continue;
      var k = Math.max(0, Math.min(1, (sy - (wd.y - vh)) / vh));
      var x = Math.round(wd.dir * (k * 20 - 10) * 10) / 10;
      if (x !== wd.x) { wd.x = x; wd.g.setAttribute('transform', 'translate(' + x + ' 0)'); }
    }
    syncMarks(false);
  }
  gsap.ticker.add(update);
  ScrollTrigger.addEventListener('refresh', onChange);
  window.addEventListener('resize', onChange);

  // le contenu change de hauteur sans redimensionnement (image chargée,
  // question ouverte…) : le rappel arrive après la mise en page et avant
  // l'affichage, le fil suit donc dans la même image
  if ('ResizeObserver' in window) new ResizeObserver(onChange).observe(document.querySelector('main') || document.body);
  build();
  function settle() { onChange(); settled = true; }
  if (document.readyState === 'complete') settled = true;
  else window.addEventListener('load', settle);
})();
