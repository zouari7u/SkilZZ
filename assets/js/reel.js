/* ==========================================================================
   ZkilZ — « Inclus dans chaque projet »
   1. Chaque visuel des encarts se met à l'échelle de sa case : la section
      tient dans l'écran, quelle que soit sa hauteur.
   2. L'encart « Animations » : une scène de particules calculée en direct.
      ~1 200 points s'assemblent tour à tour en quatre tableaux — le logo
      (ses vraies couleurs), le mot ZkilZ, une sphère en 3D qui tourne, une
      galaxie en spirale. À chaque passage, ils éclatent puis se recomposent
      en vague depuis le centre (ressorts légèrement amortis : un petit
      dépassement, puis ils se posent). La souris les repousse, un clic
      envoie une onde de choc. Une frise façon logiciel d'animation montre
      les images clés ; un clic sur une étape y saute. Le compteur affiche
      les images par seconde mesurées. Hors de l'écran : arrêt complet.
      « Réduire les animations » : le logo, immobile.
   ========================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -------------------------------------------------------------------------
  // 1. VISUELS À L'ÉCHELLE DE LEUR CASE
  // -------------------------------------------------------------------------
  var ins = Array.prototype.slice.call(document.querySelectorAll('.cell-visual > .cv-in'));
  function fit() {
    ins.forEach(function (el) {
      el.style.transform = '';
      var box = el.parentElement, w = el.offsetWidth, h = el.offsetHeight;
      var s = Math.min(1, (box.clientHeight - 4) / h, (box.clientWidth - 4) / w);
      if (s < 1) el.style.transform = 'scale(' + Math.max(.4, s).toFixed(3) + ')';
    });
  }
  if (ins.length) {
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(document.querySelector('.bento') || document.body);
    window.addEventListener('load', fit);
  }

  // -------------------------------------------------------------------------
  // 2. LA SCÈNE DE PARTICULES
  // -------------------------------------------------------------------------
  var root = document.getElementById('reel'), cv = document.getElementById('reelCanvas');
  if (!root || !cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var fpsEl = document.getElementById('reelFps'), headEl = document.getElementById('reelHead');
  var keys = Array.prototype.slice.call(root.querySelectorAll('.reel-keys button'));

  var PAL = ['#14336E', '#0B3BA8', '#1F5FD6', '#1F6BFF', '#2F7BFF', '#4F8DFF', '#1E9BFF', '#46B4EE', '#7FD0F6', '#A6DDF8', '#BFD6FF', '#FFFFFF'];
  var PRGB = PAL.map(function (h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; });
  function nearest(r, g, b) {
    var best = 0, d = 1e9;
    for (var i = 0; i < PRGB.length; i++) {
      var c = PRGB[i], e = (c[0] - r) * (c[0] - r) * .3 + (c[1] - g) * (c[1] - g) * .59 + (c[2] - b) * (c[2] - b) * .11;
      if (e < d) { d = e; best = i; }
    }
    return best;
  }

  var SCENE_T = 3.8, SCENES = 4;
  var DPR = 1, W = 0, H = 0, N = 0;
  var px, py, vx, vy, tx, ty, kk, dl, col, sz, ph, rnd;
  var shapes = [null, null, null, null];     // tableaux fixes : [x, y, couleur]
  var logoImg = new Image(), logoReady = false;
  var t = 0, scene = -1, running = false, visible = false, last = 0;
  var pointer = { x: -1e4, y: -1e4, on: false }, waves = [];

  function alloc(n) {
    N = n;
    px = new Float32Array(n); py = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n);
    tx = new Float32Array(n); ty = new Float32Array(n); kk = new Float32Array(n); dl = new Float32Array(n);
    col = new Uint8Array(n); sz = new Float32Array(n); ph = new Float32Array(n); rnd = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      px[i] = Math.random() * W; py[i] = Math.random() * H;
      vx[i] = (Math.random() - .5) * 40; vy[i] = (Math.random() - .5) * 40;
      tx[i] = px[i]; ty[i] = py[i];
      kk[i] = 55 + Math.random() * 45; dl[i] = 0; col[i] = 10; sz[i] = 1.6; ph[i] = Math.random() * 6.283; rnd[i] = Math.random();
    }
  }

  // Échantillonne un dessin : un point tous les « step » pixels opaques
  function sample(draw, step, dust) {
    var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(W)); c.height = Math.max(1, Math.round(H));
    var g = c.getContext('2d'); draw(g);
    var d = g.getImageData(0, 0, c.width, c.height).data, pts = [];
    for (var yy = 0; yy < c.height; yy += step) {
      for (var xx = 0; xx < c.width; xx += step) {
        var x = Math.round(xx), y = Math.round(yy), o = (y * c.width + x) * 4;
        if (d[o + 3] < 128) continue;
        var lum = (d[o] + d[o + 1] + d[o + 2]) / 3;
        if (dust && lum > 232 && Math.random() > .1) continue;   // le fond pâle du disque du logo : une poussière légère
        var ci = dust && lum > 232 ? 9 : nearest(d[o], d[o + 1], d[o + 2]);
        if (ci < 3) ci += 3;                                   // sur fond nuit, les bleus foncés s'éclaircissent
        pts.push(x, y, ci);
      }
    }
    pts.dot = step * .82;
    return pts;
  }
  function areaStep(target) { return Math.max(3, Math.round(Math.sqrt(W * H * .2 / target))); }
  function buildShapes() {
    var S = Math.min(W * .94, H * .7), cx = W / 2, cy = H * .47;
    if (logoReady) shapes[0] = sample(function (g) { g.drawImage(logoImg, cx - S / 2, cy - S / 2, S, S); }, Math.max(2.4, S / 52), true);
    var fs = Math.min(W * .37, H * .26);
    shapes[1] = sample(function (g) {
      g.font = '800 ' + fs + 'px "Bricolage Grotesque", system-ui, sans-serif';
      g.textBaseline = 'middle';
      var parts = [['Z', '#4F8DFF'], ['kil', '#FFFFFF'], ['Z', '#4F8DFF']], w = 0;
      parts.forEach(function (p) { w += g.measureText(p[0]).width; });
      var x = cx - w / 2;
      parts.forEach(function (p) { g.fillStyle = p[1]; g.fillText(p[0], x, cy); x += g.measureText(p[0]).width; });
    }, Math.max(2.2, fs / 34));
  }

  // Tableaux en mouvement : leurs cibles sont recalculées à chaque image
  var GA = Math.PI * (3 - Math.sqrt(5));
  function sphereTarget(i, time) {
    var R = Math.min(W * .4, H * .3), cx = W / 2, cy = H * .47;
    var y = 1 - 2 * (i + .5) / N, r = Math.sqrt(1 - y * y), a = i * GA;
    var x = Math.cos(a) * r, z = Math.sin(a) * r;
    var ra = time * .55, cr = Math.cos(ra), sr = Math.sin(ra);
    var x1 = x * cr + z * sr, z1 = -x * sr + z * cr;
    var b = .42 + Math.sin(time * .4) * .12, cb = Math.cos(b), sb = Math.sin(b);
    var y2 = y * cb - z1 * sb, z2 = y * sb + z1 * cb;
    var p = 2.6 / (2.6 - z2);
    tx[i] = cx + x1 * R * p; ty[i] = cy + y2 * R * p;
    sz[i] = .9 + (z2 + 1) * 1.05;
    col[i] = z2 > .55 ? 11 : z2 > .2 ? 9 : z2 > -.2 ? 6 : z2 > -.6 ? 3 : 1;
  }
  function spiralTarget(i, time) {
    var R = Math.min(W * .46, H * .34), cx = W / 2, cy = H * .47;
    var u = (i + .5) / N, arm = i % 3, r = R * Math.pow(u, .62);
    var a = arm * 2.0944 + u * 7.2 + time * .65 + (rnd[i] - .5) * .5 * (1 - u * .5);
    var spread = (rnd[i] - .5) * R * .09 * u;
    var x = Math.cos(a) * (r + spread), y = Math.sin(a) * (r + spread);
    var tilt = .5 + Math.sin(time * .3) * .08;
    tx[i] = cx + x; ty[i] = cy + y * tilt;
    sz[i] = 1.1 + (1 - u) * 1.5;
    col[i] = u < .08 ? 11 : u < .25 ? 9 : u < .5 ? 7 : u < .75 ? 5 : 3;
  }

  function enter(s) {
    scene = s;
    keys.forEach(function (k, i) { k.classList.toggle('is-on', i === s); });
    var cx = W / 2, cy = H * .47, md = Math.hypot(W, H) / 2;
    var shape = shapes[s];
    if ((s === 0 && !shape) || (s === 1 && !shape)) buildShapes(), shape = shapes[s];
    for (var i = 0; i < N; i++) {
      // l'éclatement : chaque point repart vers l'extérieur
      var dx = px[i] - cx, dy = py[i] - cy, d = Math.hypot(dx, dy) || 1;
      var kick = 140 + rnd[i] * 260;
      vx[i] += dx / d * kick + (Math.random() - .5) * 80; vy[i] += dy / d * kick + (Math.random() - .5) * 80;
      if (shape && shape.length) {
        var m = shape.length / 3, j = ((i * 7919) % m) * 3;
        tx[i] = shape[j] + (Math.random() - .5) * 1.2; ty[i] = shape[j + 1] + (Math.random() - .5) * 1.2;
        col[i] = shape[j + 2]; sz[i] = shape.dot || 1.7;
      } else if (s === 2) sphereTarget(i, t); else if (s === 3) spiralTarget(i, t);
      // la vague : les points proches du centre de l'image arrivent d'abord
      dl[i] = Math.hypot(tx[i] - cx, ty[i] - cy) / md * .55 + rnd[i] * .14 + .12;
    }
  }

  function step(dt) {
    t += dt;
    var s = Math.floor(t / SCENE_T) % SCENES;
    if (s !== scene) enter(s);
    var dyn = scene === 2 ? sphereTarget : scene === 3 ? spiralTarget : null;
    var pr = 78, pr2 = pr * pr;
    for (var i = 0; i < N; i++) {
      if (dyn) dyn(i, t);
      var ax = 0, ay = 0;
      if (dl[i] > 0) dl[i] -= dt;
      else {
        var k = kk[i];
        ax = (tx[i] - px[i]) * k; ay = (ty[i] - py[i]) * k;
      }
      // la souris repousse
      if (pointer.on) {
        var ex = px[i] - pointer.x, ey = py[i] - pointer.y, e2 = ex * ex + ey * ey;
        if (e2 < pr2) { var e = Math.sqrt(e2) || 1, f = (1 - e / pr); f = f * f * 5200; ax += ex / e * f; ay += ey / e * f; }
      }
      var damp = dl[i] > 0 ? 2.2 : 2 * Math.sqrt(kk[i]) * .58;
      vx[i] += (ax - vx[i] * damp) * dt; vy[i] += (ay - vy[i] * damp) * dt;
      px[i] += vx[i] * dt; py[i] += vy[i] * dt;
    }
    // ondes de choc
    for (var w = waves.length - 1; w >= 0; w--) { waves[w].r += 520 * dt; waves[w].a -= dt * 1.4; if (waves[w].a <= 0) waves.splice(w, 1); }
  }

  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // traînées : l'image précédente s'efface sans disparaître d'un coup
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,' + (reduce ? 1 : .34) + ')';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (var c = 0; c < PAL.length; c++) {
      ctx.fillStyle = PAL[c];
      ctx.beginPath();
      var any = false;
      for (var i = 0; i < N; i++) {
        if (col[i] !== c) continue;
        var s = sz[i] * (scene === 0 || scene === 1 ? 1 + Math.sin(t * 2.4 + ph[i]) * .12 : 1);
        ctx.rect(px[i] - s / 2, py[i] - s / 2, s, s); any = true;
      }
      if (any) ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    waves.forEach(function (wv) {
      ctx.strokeStyle = 'rgba(143,182,255,' + Math.max(0, wv.a) * .7 + ')'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(wv.x, wv.y, wv.r, 0, 6.283); ctx.stroke();
    });
  }

  // compteur d'images par seconde, mesuré
  var fpsAcc = 0, fpsN = 0, fpsT = 0;
  function loop(now) {
    if (!running) return;
    var dt = last ? Math.min(.05, (now - last) / 1000) : .016;
    last = now;
    step(dt); draw();
    if (headEl) headEl.style.left = (((t / SCENE_T) % SCENES) / SCENES * 100).toFixed(2) + '%';
    fpsAcc += dt; fpsN++; fpsT += dt;
    if (fpsT > .5 && fpsEl) { fpsEl.textContent = Math.min(120, Math.round(fpsN / fpsAcc)); fpsAcc = 0; fpsN = 0; fpsT = 0; }
    requestAnimationFrame(loop);
  }
  function play() { if (running || reduce || !visible || document.hidden) return; running = true; last = 0; requestAnimationFrame(loop); }
  function stop() { running = false; }

  function resize() {
    var r = root.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) return;
    var first = !W;
    W = r.width; H = r.height - 44;          // la frise occupe le bas
    DPR = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cv.style.height = H + 'px';
    var n = Math.round(Math.min(1800, Math.max(600, W * H / 75)));
    if (first || Math.abs(n - N) > 80) alloc(n);
    shapes = [null, null, null, null];
    buildShapes();
    var s = scene < 0 ? 0 : scene; scene = -1;
    t = s * SCENE_T + (first ? 0 : SCENE_T * .5);
    enter(s);
    if (reduce) {
      for (var i = 0; i < N; i++) { px[i] = tx[i]; py[i] = ty[i]; }
      draw();
    }
  }

  // interactions
  root.addEventListener('pointermove', function (e) {
    var r = cv.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.on = true;
  }, { passive: true });
  root.addEventListener('pointerleave', function () { pointer.on = false; });
  root.addEventListener('pointerdown', function (e) {
    if (e.target.closest('.reel-keys')) return;
    var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    waves.push({ x: x, y: y, r: 4, a: 1 });
    for (var i = 0; i < N; i++) {
      var dx = px[i] - x, dy = py[i] - y, d = Math.hypot(dx, dy) || 1;
      if (d < 190) { var f = (1 - d / 190) * 1100; vx[i] += dx / d * f; vy[i] += dy / d * f; dl[i] = Math.max(dl[i], .25 + rnd[i] * .2); }
    }
    if (!running) { step(.016); draw(); }
  });
  keys.forEach(function (k, i) {
    k.addEventListener('click', function () { t = i * SCENE_T + .001; scene = -1; enter(i); if (reduce) { for (var j = 0; j < N; j++) { px[j] = tx[j]; py[j] = ty[j]; } draw(); } });
  });

  function start() {
    resize();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) play(); else stop(); }, { threshold: .05 }).observe(root);
    } else { visible = true; play(); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else play(); });
    var rt = null;
    if ('ResizeObserver' in window) new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(resize, 150); }).observe(root);
  }
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  logoImg.onload = function () { logoReady = true; fontsReady.then(start); };
  logoImg.onerror = function () { fontsReady.then(start); };
  logoImg.src = 'assets/img/favicon.svg';
})();
