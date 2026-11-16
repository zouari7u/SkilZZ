/* ==========================================================================
   Navbar — comportements repris de MM Fragrances :
   · anneau lumineux calé au pixel sur le contour de la pilule ;
   · se range quand on descend, revient dès qu'on remonte ;
   · bulle qui glisse sous le lien de la section en cours ;
   · téléphone : un lien à la fois, flèches ‹ › ; interrupteur de thème.
   ========================================================================== */
(function () {
  'use strict';
  var nav = document.getElementById('nav');
  if (!nav) return;
  var root = document.documentElement;
  var mq = window.matchMedia('(max-width: 640px)');

  // Anneau lumineux
  var rect = nav.querySelector('.nav-glow-rect');
  function sizeGlow() {
    var w = nav.offsetWidth, h = nav.offsetHeight, r = h / 2;
    rect.setAttribute('x', .75); rect.setAttribute('y', .75);
    rect.setAttribute('width', w - 1.5); rect.setAttribute('height', h - 1.5);
    rect.setAttribute('rx', r);
    var p = 2 * (w - 2 * r) + 2 * Math.PI * r;
    rect.setAttribute('stroke-dasharray', (p * .1) + ' ' + (p * .9));
    rect.style.setProperty('--nav-perimeter', p + 'px');
  }
  sizeGlow();
  window.addEventListener('resize', sizeGlow, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeGlow);

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

  var lastY = window.scrollY, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (y > lastY + 6 && y > 500) nav.classList.add('is-hidden');
    else if (y < lastY - 6 || y < 200) nav.classList.remove('is-hidden');
    lastY = y;

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
  nav.addEventListener('focusin', function () { nav.classList.remove('is-hidden'); });

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
