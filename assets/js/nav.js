/* ==========================================================================
   Navbar — comportements repris de MM Fragrances :
   · anneau lumineux calé au pixel sur le contour de la pilule ;
   · flou dès qu'on quitte le haut de page, masquage en descente rapide ;
   · bulle « segmented control » qui glisse sous le lien actif (scrollspy) ;
   · menu ··· (survol + clic + Échap) ; interrupteur clair / sombre ;
   · téléphone : un lien à la fois, flèches ‹ › pour passer au suivant.
   ========================================================================== */
(function () {
  'use strict';
  var nav = document.getElementById('nav');
  if (!nav) return;
  var root = document.documentElement;

  // --- Anneau lumineux ------------------------------------------------------
  var rect = nav.querySelector('.nav-glow-rect');
  function sizeGlow() {
    var w = nav.offsetWidth + 4, h = nav.offsetHeight + 4;
    var r = Math.min(52, h / 2);
    rect.setAttribute('x', 1); rect.setAttribute('y', 1);
    rect.setAttribute('width', w - 2); rect.setAttribute('height', h - 2);
    rect.setAttribute('rx', r);
    var p = 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r;
    var seg = p * .12;
    rect.setAttribute('stroke-dasharray', seg + ' ' + (p - seg));
    rect.style.setProperty('--nav-perimeter', p + 'px');
  }
  sizeGlow();
  window.addEventListener('resize', sizeGlow, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeGlow);

  // --- États de défilement --------------------------------------------------
  var lastY = window.scrollY, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 4);
    var down = y > lastY + 6, up = y < lastY - 6;
    if (down && y > 500) nav.classList.add('is-hidden');
    else if (up || y < 200) nav.classList.remove('is-hidden');
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  nav.addEventListener('focusin', function () { nav.classList.remove('is-hidden'); });

  // --- Bulle glissante + scrollspy -----------------------------------------
  var list = document.getElementById('navLinks');
  var pill = list.querySelector('.nav-pill');
  var links = Array.prototype.slice.call(list.querySelectorAll('a'));
  var active = null;

  function movePill(a) {
    if (!a) { pill.style.opacity = 0; return; }
    pill.style.opacity = 1;
    pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + a.parentElement.offsetLeft + 'px)';
  }
  links.forEach(function (a) {
    a.addEventListener('mouseenter', function () { movePill(a); });
  });
  list.addEventListener('mouseleave', function () { movePill(active); });

  function setActive(a) {
    if (a === active) return;
    links.forEach(function (l) { l.classList.toggle('is-active', l === a); });
    active = a;
    movePill(a);
    // téléphone : amène le lien actif dans la fenêtre du carrousel
    if (a && mq.matches) list.scrollTo({ left: a.parentElement.offsetLeft, behavior: 'smooth' });
  }

  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function spy() {
    var mid = window.innerHeight * .4, found = null;
    sections.forEach(function (s, i) {
      if (!s) return;
      var r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) found = links[i];
    });
    setActive(found);
  }
  window.addEventListener('scroll', function () { requestAnimationFrame(spy); }, { passive: true });
  window.addEventListener('resize', function () { movePill(active); }, { passive: true });

  // --- Téléphone : ‹ lien › --------------------------------------------------
  var mq = window.matchMedia('(max-width: 640px)');
  function step(dir) {
    var w = list.clientWidth;
    var i = Math.round(list.scrollLeft / w) + dir;
    if (i < 0) i = links.length - 1;
    if (i >= links.length) i = 0;
    list.scrollTo({ left: i * w, behavior: 'smooth' });
  }
  nav.querySelector('.nav-arrow--l').addEventListener('click', function () { step(-1); });
  nav.querySelector('.nav-arrow--r').addEventListener('click', function () { step(1); });

  // --- Menu ··· --------------------------------------------------------------
  var more = nav.querySelector('.nav-more');
  var trigger = more.querySelector('.nav-more-trigger');
  function setOpen(o) { more.classList.toggle('is-open', o); trigger.setAttribute('aria-expanded', o ? 'true' : 'false'); }
  var hoverCapable = window.matchMedia('(hover: hover)').matches;
  if (hoverCapable) {
    more.addEventListener('mouseenter', function () { setOpen(true); });
    more.addEventListener('mouseleave', function () { setOpen(false); });
  }
  trigger.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!more.classList.contains('is-open')); });
  document.addEventListener('click', function (e) { if (!more.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  more.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });

  // --- Thème -----------------------------------------------------------------
  var toggle = document.getElementById('themeToggle');
  toggle.checked = root.dataset.theme === 'dark';
  toggle.addEventListener('change', function () {
    var t = toggle.checked ? 'dark' : 'light';
    root.dataset.theme = t;
    try { localStorage.setItem('skz-theme', t); } catch (e) {}
  });
})();
