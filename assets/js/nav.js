/* ==========================================================================
   Navbar
   · contour : un filet, et le trait de lecture qui part du haut, au centre,
     dans les deux sens, et se referme en bas en fin de page ;
   · au survol, une lueur suit le pointeur le long de la bordure ;
   · le logo vit : clignement, hochement de tête, reflet sur le bec ;
   · toujours visible : se resserre vers le centre quand on descend, reprend
     sa largeur en haut de page ; entrée animée au chargement ;
   · bulle qui glisse sous le lien de la page ou de la section en cours ;
   · téléphone : un lien à la fois, flèches ‹ › ; interrupteur de thème.
   ========================================================================== */
(function () {
  'use strict';
  var nav = document.getElementById('nav');
  if (!nav) return;
  var root = document.documentElement;
  var mq = window.matchMedia('(max-width: 640px)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = window.gsap;

  // --- Trait de lecture ------------------------------------------------------
  // Deux rectangles arrondis superposés au contour : l'un se dessine dans le
  // sens horaire, l'autre en miroir. Le tracé d'un rectangle commence en
  // haut à gauche (après l'arrondi) : on le décale d'une demi-largeur pour
  // qu'il parte du milieu du bord haut.
  var rects = Array.prototype.slice.call(nav.querySelectorAll('.nav-glow-rect'));
  var half = 0, offset = 0, shown = -1, want = 0;
  function sizeGlow() {
    var w = nav.offsetWidth, h = nav.offsetHeight;
    var W = w - 1.5, H = h - 1.5, R = H / 2;
    half = (2 * (W - 2 * R) + 2 * Math.PI * R) / 2;
    offset = -(W - 2 * R) / 2;
    rects.forEach(function (r, i) {
      r.setAttribute('x', .75); r.setAttribute('y', .75);
      r.setAttribute('width', W); r.setAttribute('height', H); r.setAttribute('rx', R);
      r.setAttribute('stroke-dashoffset', offset);
      if (i === 1) r.setAttribute('transform', 'translate(' + w + ' 0) scale(-1 1)');
    });
    shown = -1;
  }
  function progress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  }
  function drawGlow(p) {
    var L = p * half;
    rects.forEach(function (r) {
      r.setAttribute('stroke-dasharray', L.toFixed(1) + ' ' + (half * 2).toFixed(1));
      r.classList.toggle('is-empty', L < .5);
    });
  }
  sizeGlow();
  // le trait rattrape la lecture en douceur
  (function loop() {
    want = progress();
    if (shown < 0) shown = want;
    shown += (want - shown) * (reduce ? 1 : .12);
    if (Math.abs(want - shown) < .0005) shown = want;
    drawGlow(shown);
    requestAnimationFrame(loop);
  })();
  window.addEventListener('resize', sizeGlow, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeGlow);
  // la barre change de largeur en se resserrant : le contour suit
  if (window.ResizeObserver) new ResizeObserver(function () { sizeGlow(); movePill(active); }).observe(nav);

  // --- Lueur qui suit le pointeur -------------------------------------------
  nav.addEventListener('pointermove', function (e) {
    var r = nav.getBoundingClientRect();
    nav.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
    nav.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
  }, { passive: true });

  // --- Le logo vit -----------------------------------------------------------
  var kf = nav.querySelector('.nav-kf');
  var head = kf && kf.querySelector('.kf-head');
  var lid = kf && kf.querySelector('.kf-lid');
  var glint = kf && kf.querySelector('.kf-glint');
  var nod = function () {};
  if (kf && G && !reduce) {
    // paupière : s = 0 ouverte, 1 fermée ; le haut de la paupière reste en place
    var eye = { s: 0 };
    var setLid = function () { lid.setAttribute('transform', 'matrix(1 0 0 ' + eye.s.toFixed(3) + ' 0 ' + (55.2 * (1 - eye.s)).toFixed(2) + ')'); };
    var blink = function (twice) {
      var tl = G.timeline();
      tl.to(eye, { s: 1, duration: .07, ease: 'power2.in', onUpdate: setLid })
        .to(eye, { s: 0, duration: .12, ease: 'power2.out', onUpdate: setLid });
      if (twice) tl.to(eye, { s: 1, duration: .07, ease: 'power2.in', onUpdate: setLid }, '+=.08')
        .to(eye, { s: 0, duration: .12, ease: 'power2.out', onUpdate: setLid });
      return tl;
    };
    // hochement : il « pompe » comme le vrai martin-pêcheur
    // hochement discret : il « pompe » comme le vrai martin-pêcheur
    nod = function () {
      G.timeline()
        .to(head, { rotation: 4, y: .6, duration: .45, ease: 'sine.inOut' })
        .to(head, { rotation: 0, y: 0, duration: .7, ease: 'sine.inOut' });
    };
    var shine = function (slow) {
      G.fromTo(glint, { strokeDashoffset: 14, opacity: .9 }, { strokeDashoffset: -100, duration: slow ? 1.2 : .9, ease: 'sine.inOut' });
      G.to(glint, { opacity: 0, duration: .3, delay: slow ? .95 : .7 });
    };
    // vie au repos, à intervalles irréguliers
    (function idle() {
      setTimeout(function () {
        if (!document.hidden) {
          var r = Math.random();
          if (r < .55) blink(Math.random() < .3); else if (r < .85) nod(); else shine();
        }
        idle();
      }, 2600 + Math.random() * 4200);
    })();
    // au survol : l'anneau se trace (CSS), un reflet glisse lentement le
    // long du bec, puis un seul clignement
    var brand = nav.querySelector('.nav-brand'), hoverT = null;
    brand.addEventListener('pointerenter', function () {
      shine(true);
      clearTimeout(hoverT); hoverT = setTimeout(function () { blink(); }, 650);
    });
    brand.addEventListener('pointerleave', function () { clearTimeout(hoverT); });
    setTimeout(function () { blink(true); }, 1300);
  }

  // Liens, bulle glissante, section en cours
  var list = document.getElementById('navLinks');
  var pill = list.querySelector('.nav-pill');
  var links = Array.prototype.slice.call(list.querySelectorAll('a'));
  // lien d'une autre page : actif s'il porte aria-current ; lien d'ancre :
  // actif quand sa section est à l'écran
  var sections = links.map(function (a) { var h = a.getAttribute('href'); return h.charAt(0) === '#' ? document.querySelector(h) : null; });
  var current = links.filter(function (a) { return a.getAttribute('aria-current') === 'page'; })[0] || null;
  var active = null;

  function movePill(a) {
    if (!a) { pill.style.opacity = 0; return; }
    pill.style.opacity = 1;
    pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + a.parentElement.offsetLeft + 'px)';
  }
  links.forEach(function (a) { a.addEventListener('mouseenter', function () { movePill(a); }); });
  list.addEventListener('mouseleave', function () { movePill(active); });

  function setActive(a) {
    if (a === active) return;
    links.forEach(function (l) { l.classList.toggle('is-active', l === a); });
    active = a;
    movePill(a);
    if (a && mq.matches) list.scrollTo({ left: a.parentElement.offsetLeft, behavior: 'smooth' });
  }

  var ticking = false, scrolled = null;
  function onScroll() {
    var y = window.scrollY;
    var s = y > 60;
    if (s !== scrolled) {
      // de retour en haut de page : l'oiseau salue d'un hochement
      if (scrolled && !s) setTimeout(nod, 300);
      scrolled = s;
      nav.classList.toggle('is-scrolled', s);
    }

    var mid = window.innerHeight * .4, found = current;
    sections.forEach(function (s, i) {
      if (!s) return;
      var r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) found = links[i];
    });
    setActive(found);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  if (current) { setActive(current); if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { movePill(active); }); }
  window.addEventListener('resize', function () { movePill(active); }, { passive: true });
  onScroll();

  // --- Entrée : la barre descend en s'élargissant, puis les liens arrivent un
  // à un.
  if (G && !reduce) {
    var items = nav.querySelectorAll('.nav-brand, .nav-links li:not(.nav-pill), .nav-end > *');
    G.timeline({ delay: .1 })
      .fromTo(nav, { y: -28, opacity: 0, scaleX: .86 }, { y: 0, opacity: 1, scaleX: 1, duration: 1, ease: 'expo.out', clearProps: 'transform,opacity' })
      .fromTo(items, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .05, ease: 'power3.out', clearProps: 'transform,opacity' }, .25);
  }

  // Téléphone : ‹ lien ›
  function step(dir) {
    var w = list.clientWidth;
    var i = Math.round(list.scrollLeft / w) + dir;
    if (i < 0) i = links.length - 1;
    if (i >= links.length) i = 0;
    list.scrollTo({ left: i * w, behavior: 'smooth' });
  }
  nav.querySelector('.nav-arrow--l').addEventListener('click', function () { step(-1); });
  nav.querySelector('.nav-arrow--r').addEventListener('click', function () { step(1); });

  // Thème
  var toggle = document.getElementById('themeToggle');
  toggle.checked = root.dataset.theme === 'dark';
  // Le nouveau thème arrive en bulle qui part de l'interrupteur
  // (View Transitions API ; ailleurs, simple fondu des couleurs).
  toggle.addEventListener('change', function () {
    var t = toggle.checked ? 'dark' : 'light';
    function apply() {
      root.dataset.theme = t;
      try { localStorage.setItem('skz-theme', t); } catch (e) {}
    }
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) { apply(); return; }
    var r = toggle.parentElement.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(apply).ready.then(function () {
      document.documentElement.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + end + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 750, easing: 'cubic-bezier(.22, 1, .36, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  });
})();
