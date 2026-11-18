/* ==========================================================================
   ZkilZ — le décor du fond : le ciel de l'oiseau
   Derrière tout le contenu, section après section, en alternant les marges :
   de grands disques pâles (le soleil, le motif du cercle), des nuages qui
   dérivent, des vols de petits oiseaux au loin, des trames de points (la
   table à dessin) et, en bas de page, des roseaux au bord de l'eau.
   Chaque élément a sa profondeur : plus il est loin, moins il bouge quand
   on défile (parallaxe). Aplats uniquement, très pâles, jamais sous le texte
   en contraste gênant. Téléphone : décor allégé ; mouvement réduit : figé.
   ========================================================================== */
(function () {
  'use strict';
  function scrollNow() { return window.SKZ && window.SKZ.y != null ? window.SKZ.y : window.scrollY; }
  var VH = window.innerHeight;
  window.addEventListener('resize', function () { VH = window.innerHeight; });
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = window.gsap;
  var NS = 'http://www.w3.org/2000/svg';
  var layer = document.createElement('div');
  layer.className = 'sky';
  layer.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(layer, document.body.firstChild);
  var items = [], loops = [];

  function tag(tw, el) { tw._el = el; return tw; }
  var CLOUD = 'M10 40 h92 a20 20 0 0 0 -20 -20 a26 26 0 0 0 -46 -6 a17 17 0 0 0 -26 26z';
  function svg(w, h, inner, cls) {
    return '<svg class="' + cls + '" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + inner + '</svg>';
  }
  function add(html, x, y, depth, extra) {
    var el = document.createElement('div');
    el.className = 'sky-it' + (extra ? ' ' + extra : '');
    el.style.left = x + 'px'; el.style.top = y + 'px';
    el.innerHTML = html;
    layer.appendChild(el);
    // seuls les éléments qui bougent au défilement ont leur propre couche :
    // le navigateur les déplace sans repeindre le calque du décor
    if (depth && !reduce) el.style.willChange = 'transform';
    items.push({ el: el, y: y, d: depth, h: 0 });
    return el;
  }
  function docTop(n) { return n.getBoundingClientRect().top + window.scrollY; }
  // aléatoire stable : le décor ne change pas d'un chargement à l'autre
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  var builtW = 0, builtH = 0;
  function build(force) {
    var W = document.documentElement.clientWidth, foot = document.querySelector('.footer');
    var H = foot ? Math.ceil(docTop(foot)) : document.body.offsetHeight;
    if (force !== true && W === builtW && Math.abs(H - builtH) < 2) return;
    builtW = W; builtH = H; seed = 7;
    loops.forEach(function (l) { l.kill(); }); loops = [];
    layer.innerHTML = ''; items = [];
    layer.style.height = H + 'px';
    var narrow = W < 760;
    var inner = Math.min(1180, W - 40), margin = Math.max(0, (W - inner) / 2);
    var secs = Array.prototype.slice.call(document.querySelectorAll('main > section, main > .pin-spacer'))
      .filter(function (s) { return s.offsetHeight > 200; });
    secs.forEach(function (s, i) {
      var top = docTop(s), h = s.offsetHeight, left = i % 2 === 0;
      // 1. grand disque, à moitié hors de l'écran
      var R = narrow ? 180 + rnd() * 80 : 300 + rnd() * 240;
      var cx = left ? -R * (.32 + rnd() * .12) : W - R * (.68 - rnd() * .12);
      add('<span class="sky-disc' + (i % 3 === 1 ? ' sky-disc--b' : '') + '" style="width:' + R + 'px;height:' + R + 'px"></span>',
        Math.round(cx), Math.round(top + h * (.15 + rnd() * .4)), .22 + rnd() * .1);
      // un second disque, plus petit, de l'autre côté et plus bas
      var r2 = R * (.4 + rnd() * .2);
      add('<span class="sky-disc sky-disc--b" style="width:' + r2 + 'px;height:' + r2 + 'px"></span>',
        Math.round(left ? W - r2 * (narrow ? .45 : .7) : -r2 * (narrow ? .55 : .3)), Math.round(top + h * (.62 + rnd() * .25)), .32);
      // anneau fin autour, un peu plus près
      if (!narrow && i % 2) add('<span class="sky-ring" style="width:' + (R * 1.35) + 'px;height:' + (R * 1.35) + 'px"></span>',
        Math.round(cx - R * .175), Math.round(top + h * .2), 0);
      if (narrow && i % 2) return;
      // 2. nuages, dans la marge opposée
      var cw = narrow ? 100 : 170 + rnd() * 90;
      var nx = left ? W - Math.max(margin * .9, cw * .6) - cw * .2 : Math.max(-cw * .3, margin * .1 - cw * .3);
      var cl = add(svg(112, 44, '<path d="' + CLOUD + '"/>', 'sky-cloud') , Math.round(nx), Math.round(top + h * (.05 + rnd() * .25)), .4 + rnd() * .15);
      cl.firstChild.style.width = cw + 'px'; cl.firstChild.style.height = (cw * 44 / 112) + 'px';
      if (!reduce && G) loops.push(tag(G.to(cl.firstChild, { paused: true,  x: left ? -40 : 40, duration: 14 + rnd() * 8, ease: 'sine.inOut', yoyo: true, repeat: -1 }), cl));
      if (i % 2 === 0 && !narrow) {
        var c2 = add(svg(112, 44, '<path d="' + CLOUD + '"/>', 'sky-cloud sky-cloud--b'), Math.round(nx + (left ? -70 : 60)), Math.round(top + h * .45), .55);
        c2.firstChild.style.width = cw * .6 + 'px'; c2.firstChild.style.height = (cw * .6 * 44 / 112) + 'px';
        if (!reduce && G) loops.push(tag(G.to(c2.firstChild, { paused: true,  x: left ? 30 : -30, duration: 11, ease: 'sine.inOut', yoyo: true, repeat: -1 }), c2));
      }
      // 3. un vol d'oiseaux au loin (une section sur deux)
      if (i % 2 === 1 || i === 0 || (!narrow && i % 3 === 0)) {
        var n = 3 + Math.floor(rnd() * 3), birds = '';
        for (var k = 0; k < n; k++) {
          var bx = k * 22 + rnd() * 8, by = Math.abs(k - (n - 1) / 2) * 10 + rnd() * 5, s = .7 + rnd() * .5;
          birds += '<path class="sky-b" style="--s:' + s.toFixed(2) + '" d="M' + bx.toFixed(1) + ' ' + (by + 8).toFixed(1) + ' q5 -6 10 0 q5 -6 10 0"/>';
        }
        var fl = add(svg(140, 70, birds, 'sky-flock'), Math.round(left ? W - margin - 150 : margin + 10), Math.round(top + 40 + rnd() * 60), .6);
        if (!reduce && G) {
          loops.push(tag(G.to(fl.firstChild, { paused: true,  x: left ? -120 : 120, y: -30, duration: 22 + rnd() * 8, ease: 'sine.inOut', yoyo: true, repeat: -1 }), fl));
          loops.push(tag(G.to(fl.querySelectorAll('.sky-b'), { paused: true,  scaleY: .45, transformOrigin: '50% 60%', transformBox: 'fill-box', duration: .42, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: .13, from: 'random' } }), fl));
        }
      }
      // 4. trame de points (table à dessin)
      if (!narrow && i % 3 === 2) add('<span class="sky-dots"></span>', Math.round(left ? W - margin - 60 : margin - 140), Math.round(top + h * .6), 0);
    });
    // 5. en bas : l'eau et les roseaux, au pied du pied de page
    if (foot) {
      var y = H - 120, reeds = '';
      for (var r = 0; r < (narrow ? 5 : 9); r++) {
        var x = (narrow ? 14 : 24) + r * (narrow ? 9 : 11) + rnd() * 4, hh = 38 + rnd() * 46;
        reeds += '<path class="sky-reed" d="M' + x.toFixed(1) + ' 120 C ' + (x + 1).toFixed(1) + ' ' + (120 - hh * .5).toFixed(1) + ' ' + (x - 1).toFixed(1) + ' ' + (120 - hh * .8).toFixed(1) + ' ' + (x + 3).toFixed(1) + ' ' + (120 - hh).toFixed(1) + '"/>';
        if (r % 3 === 1) reeds += '<ellipse class="sky-cat" cx="' + (x + 3).toFixed(1) + '" cy="' + (120 - hh).toFixed(1) + '" rx="2.6" ry="7"/>';
      }
      var water = '<path class="sky-water" d="M0 112 q 20 -5 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0"/>';
      add(svg(240, 124, water + reeds, 'sky-shore'), W - (narrow ? 130 : 260), y, 0);
      add(svg(240, 124, water + reeds, 'sky-shore sky-shore--l'), narrow ? -110 : 0, y + 6, 0);
    }
    measure();
    update(true);
    buildFooter();
  }

  // -------------------------------------------------------------------------
  // LE PIED DE PAGE, LA NUIT : étoiles (quelques-unes scintillent), une lune,
  // la route de vol en pointillés qui finit sur le « l » où l'oiseau se pose,
  // et l'eau avec des roseaux, de part et d'autre du logotype.
  // -------------------------------------------------------------------------
  function buildFooter() {
    var f = document.querySelector('.footer'), s = document.getElementById('footerDeco');
    if (!f || !s) return;
    var W = f.clientWidth, H = f.clientHeight, narrow = W < 760;
    s.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var fr = f.getBoundingClientRect();
    var word = document.getElementById('footerWord');
    var wr = word ? word.getBoundingClientRect() : null;
    var wTop = wr ? wr.top - fr.top : H * .6, wBot = wr ? wr.bottom - fr.top : H - 80;
    // position du « l » sans les transformations de l'animation d'entrée
    var l = word && word.querySelector('[data-perch]');
    var lx = l && wr ? wr.left - fr.left + l.offsetLeft + l.offsetWidth / 2 : 0;
    // zones de contenu : pas d'étoile dessus (on les prendrait pour des points)
    var busy = Array.prototype.map.call(f.querySelectorAll('.footer-pledges, .footer-grid > *, .footer-bottom, .footer-word'), function (e) {
      var r = e.getBoundingClientRect();
      return { l: r.left - fr.left - 14, t: r.top - fr.top - 14, r: r.right - fr.left + 14, b: r.bottom - fr.top + 14 };
    });
    function free(x, y) { for (var q = 0; q < busy.length; q++) { var z = busy[q]; if (x > z.l && x < z.r && y > z.t && y < z.b) return false; } return true; }
    var o = [];
    // étoiles : seulement dans les zones libres (bords, au-dessus du logotype)
    seed = 31;
    var n = narrow ? 26 : 70;
    for (var i = 0; i < n; i++) {
      var x = rnd() * W, y = rnd() * (wBot - 20);
      var r = rnd() < .15 ? 1.6 : .7 + rnd() * .6;
      if (!free(x, y)) { rnd(); rnd(); continue; }
      o.push('<circle class="fd-star' + (rnd() < .35 ? ' tw' : '') + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(2) + '" opacity="' + (.25 + rnd() * .5).toFixed(2) + '" style="animation-delay:' + (rnd() * 3.6).toFixed(2) + 's"/>');
    }
    // lune en croissant, en haut à droite, avec deux halos
    var mx = W - (narrow ? 46 : Math.max(90, (W - 1180) / 2 * .55)), my = narrow ? 40 : 70, mr = narrow ? 20 : 30;
    o.push('<circle class="fd-halo" cx="' + mx + '" cy="' + my + '" r="' + mr * 2 + '"/><circle class="fd-halo" cx="' + mx + '" cy="' + my + '" r="' + mr * 3.2 + '"/>');
    o.push('<circle class="fd-moon" cx="' + mx + '" cy="' + my + '" r="' + mr + '"/><circle class="fd-moon-cut" cx="' + (mx + mr * .42) + '" cy="' + (my - mr * .28) + '" r="' + mr * .86 + '"/>');
    // route de vol : part du bas à gauche et monte se poser sur le « l »
    // (elle passe au-dessus des lettres et s'arrête juste derrière l'oiseau)
    if (l && wr && !narrow) {
      var tx = lx - 70, ty = wTop - 14;
      var sx = Math.max(30, (W - 1180) / 2 - 30), sy = wBot - 30;
      o.push('<path class="fd-route" d="M' + sx + ' ' + sy + ' C ' + (sx + 60) + ' ' + (wTop - 40) + ', ' + (tx - 260) + ' ' + (wTop - 110) + ', ' + tx + ' ' + ty + '"/>');
    }
    // l'eau sous le logotype, et des roseaux dans les deux coins
    var wy = wBot + 6;
    for (var k = 0; k < 3; k++) {
      var yy = wy + k * 10, d = 'M0 ' + yy;
      for (var xx = 0; xx < W; xx += 60) d += ' q 15 ' + (k % 2 ? 3 : -3) + ' 30 0 t 30 0';
      o.push('<path class="fd-water" d="' + d + '" opacity="' + (1 - k * .3) + '"/>');
    }
    function reeds(x0, dir) {
      var g = '';
      for (var j = 0; j < (narrow ? 4 : 7); j++) {
        var x = x0 + dir * j * 10 + rnd() * 4, h = 40 + rnd() * (narrow ? 30 : 60), b = wy + 4;
        g += '<path class="fd-reed" d="M' + x.toFixed(1) + ' ' + b + ' C ' + (x + 1).toFixed(1) + ' ' + (b - h * .5).toFixed(1) + ' ' + (x - 2).toFixed(1) + ' ' + (b - h * .8).toFixed(1) + ' ' + (x + dir * 3).toFixed(1) + ' ' + (b - h).toFixed(1) + '"/>';
        if (j % 3 === 1) g += '<ellipse class="fd-cat" cx="' + (x + dir * 3).toFixed(1) + '" cy="' + (b - h).toFixed(1) + '" rx="2.6" ry="7"/>';
      }
      return g;
    }
    o.push(reeds(narrow ? 10 : 30, 1), reeds(W - (narrow ? 10 : 30), -1));
    s.innerHTML = o.join('');
  }
  function measure() { items.forEach(function (it) { it.h = it.el.offsetHeight || 200; }); }

  // parallaxe : un élément de profondeur d remonte de d × (défilement) de
  // moins que le contenu, compté depuis le moment où il passe au centre
  var lastY = -1;
  function update(force) {
    var sy = scrollNow();
    if (!force && sy === lastY) return;
    lastY = sy;
    if (reduce) return;
    var vh = VH, mid = sy + vh / 2;
    // les boucles (nuages, vols d'oiseaux) ne tournent que près de l'écran
    for (var j = 0; j < loops.length; j++) {
      var lp = loops[j], ly = lp._el ? parseFloat(lp._el.style.top) : 0;
      var near = ly > sy - vh && ly < sy + vh * 2;
      if (near && lp.paused()) lp.play(); else if (!near && !lp.paused()) lp.pause();
    }
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it.d) continue;
      var off = (mid - (it.y + it.h / 2)) * it.d;
      // seulement près de l'écran (les autres ne bougent pas pour rien)
      if (it.y + off > sy + vh + 400 || it.y + it.h + off < sy - 400) continue;
      it.el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
    }
  }
  if (G) G.ticker.add(function () { update(false); });
  else window.addEventListener('scroll', function () { update(false); }, { passive: true });

  var rt = null;
  function soon() { clearTimeout(rt); rt = setTimeout(function () { build(false); buildFooter(); }, 220); }
  window.addEventListener('resize', soon);
  if ('ResizeObserver' in window) new ResizeObserver(soon).observe(document.querySelector('main') || document.body);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { build(true); });
  else build(true);
  window.addEventListener('load', function () { build(false); buildFooter(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildFooter);
})();
