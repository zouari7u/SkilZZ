/* ==========================================================================
   Mascotte du hero — le fennec bleu.
   · flotte doucement et se penche vers le curseur ;
   · au clic : saut de joie (la pose « joie » remplace un instant la pose
     « coucou ») avec quelques confettis bleus et verts.
   ========================================================================== */
(function () {
  'use strict';
  if (!window.gsap) return;
  var host = document.getElementById('heroMascot');
  if (!host) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var base = host.querySelector('.mascot-img');

  var joy = document.createElement('img');
  joy.className = 'mascot-img is-alt';
  joy.src = 'assets/img/mascotte/fennec-joie.webp';
  joy.alt = '';
  joy.setAttribute('aria-hidden', 'true');
  host.appendChild(joy);

  var shadow = document.createElement('span');
  shadow.className = 'hero-shadow';
  host.parentNode.insertBefore(shadow, host);

  if (reduce) return;

  gsap.to(host, { y: -10, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to(shadow, { scaleX: .88, opacity: .75, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  if (finePointer) {
    var rot = gsap.quickTo(host, 'rotation', { duration: .9, ease: 'power3' });
    var mx = gsap.quickTo(host, 'x', { duration: .9, ease: 'power3' });
    window.addEventListener('pointermove', function (e) {
      var r = host.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      dx = Math.max(-1, Math.min(1, dx * 2));
      rot(dx * 3); mx(dx * 8);
    }, { passive: true });
  }

  var busy = false;
  function cheer() {
    if (busy) return;
    busy = true;
    gsap.timeline({ onComplete: function () { busy = false; } })
      .to(base, { scaleY: .92, scaleX: 1.05, duration: .12, ease: 'power2.in' })
      .set(base, { opacity: 0 })
      .set(joy, { opacity: 1, scaleY: .94, scaleX: 1.04 })
      .to(joy, { y: -54, scaleY: 1.03, scaleX: .98, duration: .3, ease: 'power2.out' })
      .to(shadow, { scaleX: .6, opacity: .4, duration: .3 }, '<')
      .to(joy, { y: 0, scaleY: 1, scaleX: 1, duration: .7, ease: 'bounce.out' })
      .to(shadow, { scaleX: 1, opacity: 1, duration: .7, ease: 'bounce.out' }, '<')
      .to(joy, { opacity: 0, duration: .18 }, '+=.45')
      .to(base, { opacity: 1, scaleY: 1, scaleX: 1, duration: .18 }, '<');
    confetti();
  }

  function confetti() {
    var colors = ['#1F6BFF', '#0FA97A', '#8FB6FF'];
    for (var i = 0; i < 12; i++) {
      var c = document.createElement('span');
      var s = 6 + Math.random() * 7;
      c.style.cssText = 'position:absolute;left:50%;top:36%;z-index:5;pointer-events:none;border-radius:50%;width:' + s + 'px;height:' + s + 'px;background:' + colors[i % 3];
      host.parentNode.appendChild(c);
      gsap.fromTo(c, { x: 0, y: 0, scale: .4, opacity: 1 }, {
        x: (Math.random() - .5) * 340, y: -70 - Math.random() * 190, scale: 1,
        duration: 1 + Math.random() * .4, ease: 'power3.out',
        onComplete: (function (el) { return function () { gsap.to(el, { opacity: 0, y: '+=30', duration: .35, onComplete: function () { el.remove(); } }); }; })(c)
      });
    }
  }

  host.addEventListener('click', cheer);
  window.skzCheer = cheer;
})();
