/* ==========================================================================
   SkilZZ — le fennec qui sort des cadres
   Un élément marqué data-peek="top|left|right" (data-peek-at : position
   le long du bord, en %) cache un fennec derrière son bord. Quand il est
   à l'écran, le fennec en dépasse de temps en temps : d'abord le bout
   des oreilles, puis la tête ; il regarde autour, puis replonge.
   Il dépasse aussi des bords de l'écran quand le visiteur s'arrête de
   défiler. Un seul fennec à la fois.
   · survol : il est timide, il replonge aussitôt ;
   · clic : petit saut et bulles.
   Le bord coupe l'image net (débordement masqué par le bord), comme si
   le corps était caché derrière.
   Images : fennec-peek (bord du haut) ; fennec-peek-cote si elle existe
   (bords gauche / droit), sinon fennec-peek tourné d'un quart de tour.
   ========================================================================== */
(function () {
  'use strict';
  if (!window.gsap) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var IMG = 'assets/img/mascotte/';
  var TOP = IMG + 'fennec-peek.webp', TOP_RATIO = 858 / 1100;
  var side = null; // { src, ratio } quand fennec-peek-cote.webp existe
  (function () { var i = new Image(); i.onload = function () { side = { src: i.src, ratio: i.naturalHeight / i.naturalWidth }; peeks.forEach(build); }; i.src = IMG + 'fennec-peek-cote.webp'; })();

  var peeks = [];
  var active = null, lastPeek = null, lastAt = 0;

  // --- Construction d'une cachette sur un bord ------------------------------
  function size() { return Math.round(Math.min(130, Math.max(86, window.innerWidth * .085))); }
  function build(p) {
    if (p.holder) p.holder.remove();
    var w = size(), edge = p.edge, at = p.at;
    var h = document.createElement('span');
    h.className = 'peek peek--' + edge + (p.screen ? ' peek--screen' : '');
    h.setAttribute('aria-hidden', 'true');
    var img = document.createElement('img');
    img.alt = ''; img.decoding = 'async'; img.draggable = false;
    h.appendChild(img);
    var st = h.style;
    var useSide = side && edge !== 'top';
    if (!useSide) {
      // boîte « bord du haut » : sa base est collée au bord ; pour un côté,
      // on la fait pivoter d'un quart de tour autour de ce point
      var hh = Math.round(w * TOP_RATIO);
      img.src = TOP;
      st.width = w + 'px'; st.height = hh + 'px';
      st.transformOrigin = '50% 100%';
      if (edge === 'top') { st.left = 'calc(' + at + '% - ' + w / 2 + 'px)'; st.top = -hh + 'px'; }
      else if (edge === 'right') { st.left = 'calc(100% - ' + w / 2 + 'px)'; st.top = 'calc(' + at + '% - ' + hh + 'px)'; st.rotate = '90deg'; }
      else { st.left = -w / 2 + 'px'; st.top = 'calc(' + at + '% - ' + hh + 'px)'; st.rotate = '-90deg'; }
      p.hide = { yPercent: 102, xPercent: 0 };
    } else {
      var sw = Math.round(w * .9), sh = Math.round(sw * side.ratio);
      img.src = side.src;
      st.width = sw + 'px'; st.height = sh + 'px';
      st.top = 'calc(' + at + '% - ' + sh / 2 + 'px)';
      if (edge === 'right') st.left = '100%';
      else { st.right = '100%'; img.style.scale = '-1 1'; }
      p.hide = { yPercent: 0, xPercent: edge === 'right' ? -102 : 102 };
    }
    gsap.set(img, p.hide);
    p.host.appendChild(h);
    p.holder = h; p.img = img;

    if (fine) img.addEventListener('pointerenter', function () { if (active === p && p.tl) shy(p); });
    img.addEventListener('click', function (e) { e.stopPropagation(); hop(p); });
  }

  function register(host, edge, at, screen) {
    if (!screen && getComputedStyle(host).position === 'static') host.style.position = 'relative';
    var p = { host: host, edge: edge, at: at, screen: !!screen, visible: !!screen };
    peeks.push(p);
    build(p);
    return p;
  }

  // --- Les gestes -----------------------------------------------------------
  function show(p) {
    active = p; lastPeek = p; lastAt = Date.now();
    var out = { yPercent: 0, xPercent: 0 };
    var ears = p.hide.yPercent ? { yPercent: 58, xPercent: 0 } : { yPercent: 0, xPercent: p.hide.xPercent * .55 };
    var tilt = (Math.random() > .5 ? 1 : -1) * (7 + Math.random() * 6);
    p.tl = gsap.timeline({ onComplete: function () { if (active === p) active = null; p.tl = null; } })
      // le bout des oreilles…
      .to(p.img, Object.assign({ duration: .45, ease: 'power3.out' }, ears))
      .to(p.img, { rotation: tilt * .5, duration: .18, yoyo: true, repeat: 3, ease: 'sine.inOut', transformOrigin: '50% 100%' })
      // …puis la tête
      .to(p.img, Object.assign({ duration: .7, ease: 'back.out(2.2)' }, out), '+=.15')
      .to(p.img, { rotation: tilt, duration: .55, ease: 'power2.inOut' }, '+=.5')
      .to(p.img, { rotation: -tilt * .6, duration: .7, ease: 'power2.inOut' }, '+=.9')
      .to(p.img, { rotation: 0, duration: .5, ease: 'power2.out' }, '+=.5')
      // et replonge
      .to(p.img, Object.assign({ duration: .38, ease: 'power3.in' }, p.hide), '+=1.2');
  }
  function shy(p) {
    p.tl && p.tl.kill(); p.tl = null;
    gsap.to(p.img, Object.assign({ rotation: 0, duration: .22, ease: 'power3.in', onComplete: function () { if (active === p) active = null; } }, p.hide));
    lastAt = Date.now();
  }
  function hop(p) {
    if (active !== p) return;
    p.tl && p.tl.kill(); p.tl = null;
    var r = p.img.getBoundingClientRect();
    if (window.SKZ) window.SKZ.burst(r.left + r.width / 2, r.top + r.height / 3, { count: 12, spread: 90 });
    var up = p.hide.yPercent ? { yPercent: -16 } : { xPercent: p.hide.xPercent * -.18 };
    gsap.timeline({ onComplete: function () { if (active === p) active = null; } })
      .to(p.img, Object.assign({ rotation: 0, duration: .2, ease: 'power2.out' }, up))
      .to(p.img, { yPercent: 0, xPercent: 0, duration: .6, ease: 'bounce.out' })
      .to(p.img, Object.assign({ duration: .35, ease: 'power3.in' }, p.hide), '+=.8');
    lastAt = Date.now();
  }

  // --- Qui sort, et quand --------------------------------------------------
  var idleSince = Date.now();
  window.addEventListener('scroll', function () { idleSince = Date.now(); }, { passive: true });
  function agentOpen() { var a = document.getElementById('agentPanel'); return a && !a.hidden; }

  function tick() {
    var now = Date.now();
    if (!active && !document.hidden && !agentOpen() && now - lastAt > 5200) {
      var pool = peeks.filter(function (p) {
        if (!p.visible || p === lastPeek) return false;
        if (p.screen) return now - idleSince > 3500;          // bords de l'écran : visiteur arrêté
        if (p.host.closest('.svc') && !p.host.closest('.svc.is-active')) return false;
        var r = p.host.getBoundingClientRect();
        var y = p.edge === 'top' ? r.top : r.top + r.height * p.at / 100;
        return y > 90 && y < window.innerHeight - 60;          // le bord lui-même est à l'écran
      });
      // les cadres de la page passent avant les bords de l'écran
      var inPage = pool.filter(function (p) { return !p.screen; });
      if (inPage.length) pool = inPage;
      if (pool.length) {
        var p = pool[Math.floor(Math.random() * pool.length)];
        if (p.screen) { p.at = 25 + Math.random() * 45; build(p); }
        show(p);
      }
    }
    setTimeout(tick, 900 + Math.random() * 900);
  }

  // --- Les cachettes ---------------------------------------------------------
  document.querySelectorAll('[data-peek]').forEach(function (el) {
    register(el, el.dataset.peek, parseFloat(el.dataset.peekAt) || 50, false);
  });
  if (window.innerWidth > 980) {
    // bords de l'écran : deux bandes de largeur nulle, collées dehors, à
    // droite et à gauche ; le fennec en sort vers l'intérieur
    ['r', 'l'].forEach(function (s) {
      var strip = document.createElement('div');
      strip.className = 'peek-screen peek-screen--' + s;
      document.body.appendChild(strip);
      register(strip, s === 'r' ? 'left' : 'right', 50, true);
    });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        peeks.forEach(function (p) {
          if (p.host !== en.target) return;
          var was = p.visible;
          p.visible = en.isIntersecting;
          // première apparition d'un cadre : le fennec s'y montre vite
          if (!was && p.visible && !p.seen) { p.seen = true; lastAt = Math.min(lastAt, Date.now() - 3800); }
        });
      });
    }, { threshold: .3 });
    peeks.forEach(function (p) { if (!p.screen) io.observe(p.host); });
  } else peeks.forEach(function (p) { p.visible = true; });

  var rt = null;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { peeks.forEach(function (p) { if (p !== active) build(p); }); }, 250); });
  setTimeout(tick, 3000);
})();
