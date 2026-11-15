/* ==========================================================================
   Mascotte SkilZZ — le fennec bleu (images détourées, assets/img/mascotte/)
   · hero : flotte doucement, se penche vers le curseur, et au clic saute
     de joie (la pose « joie » remplace un instant la pose « coucou ») ;
   · sections : chaque pose apparaît avec un petit rebond au défilement.
   ========================================================================== */
(function () {
  'use strict';
  if (!window.gsap) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var host = document.getElementById('heroMascot');
  if (!host) return;
  var base = host.querySelector('.mascot-img');

  // Pose « joie », préchargée et superposée pour le clic
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

  // Flottement + ombre qui respire
  gsap.to(host, { y: -12, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to(shadow, { scaleX: .85, opacity: .7, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  // Se penche vers le curseur
  if (finePointer) {
    var rot = gsap.quickTo(host, 'rotation', { duration: 1, ease: 'power3' });
    var mx = gsap.quickTo(host, 'x', { duration: 1, ease: 'power3' });
    window.addEventListener('pointermove', function (e) {
      var r = host.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      dx = Math.max(-1, Math.min(1, dx * 2));
      rot(dx * 4); mx(dx * 10);
    }, { passive: true });
  }

  // Petit coucou de bienvenue (étirement élastique)
  gsap.fromTo(base, { scaleY: .9, scaleX: 1.06 }, { scaleY: 1, scaleX: 1, duration: 1.2, ease: 'elastic.out(1, .4)', delay: 1.4 });

  // Clic : saut de joie + confettis bleus et verts
  var busy = false;
  function cheer() {
    if (busy) return;
    busy = true;
    gsap.timeline({ onComplete: function () { busy = false; } })
      .to(base, { scaleY: .88, scaleX: 1.08, duration: .14, ease: 'power2.in' })
      .set(base, { opacity: 0 })
      .set(joy, { opacity: 1, scaleY: .9, scaleX: 1.06 })
      .to(joy, { y: -60, scaleY: 1.04, scaleX: .97, duration: .32, ease: 'power2.out' })
      .to(shadow, { scaleX: .55, opacity: .4, duration: .32 }, '<')
      .to(joy, { y: 0, scaleY: 1, scaleX: 1, duration: .8, ease: 'bounce.out' })
      .to(shadow, { scaleX: 1, opacity: 1, duration: .8, ease: 'bounce.out' }, '<')
      .to(joy, { opacity: 0, duration: .2 }, '+=.5')
      .to(base, { opacity: 1, duration: .2 }, '<')
      .fromTo(base, { scaleY: .94 }, { scaleY: 1, duration: .8, ease: 'elastic.out(1, .4)' });
    confetti();
  }
  function confetti() {
    var colors = ['#1F6BFF', '#12B886', '#5BB8FF', '#0B1B3F'];
    for (var i = 0; i < 14; i++) {
      var c = document.createElement('span');
      var star = i % 3 === 0;
      c.textContent = star ? '★' : '';
      c.style.cssText = 'position:absolute;left:50%;top:38%;z-index:5;pointer-events:none;' +
        (star ? 'font-size:' + (14 + Math.random() * 12) + 'px;color:' + colors[i % 4] + ';'
              : 'width:' + (6 + Math.random() * 8) + 'px;height:' + (6 + Math.random() * 8) + 'px;border-radius:50%;background:' + colors[i % 4] + ';');
      host.parentNode.appendChild(c);
      gsap.fromTo(c, { x: 0, y: 0, scale: 0 }, {
        x: (Math.random() - .5) * 360, y: -80 - Math.random() * 200, scale: 1, rotation: (Math.random() - .5) * 180,
        duration: 1.1 + Math.random() * .5, ease: 'power3.out',
        onComplete: (function (el) { return function () { gsap.to(el, { opacity: 0, y: '+=40', duration: .4, onComplete: function () { el.remove(); } }); }; })(c)
      });
    }
  }
  host.addEventListener('click', cheer);
  window.skzFennecCheer = cheer;

  // Poses des sections : apparition avec rebond
  if (window.ScrollTrigger) {
    gsap.utils.toArray('.svc-mascot, .mascot--cta .mascot-img').forEach(function (img) {
      gsap.from(img, { scale: .7, y: 40, opacity: 0, rotation: -4, duration: 1.1, ease: 'back.out(1.8)', scrollTrigger: { trigger: img, start: 'top 88%' } });
    });
  }
})();
