/* ==========================================================================
   Mascotte du hero — le fennec dans sa bulle.
   · la bulle respire, et se déforme comme une gelée selon la vitesse de la
     souris ; le fennec flotte et se penche vers le curseur ;
   · clic : la bulle éclate en petites bulles, le fennec saute de joie
     (pose « joie »), puis une nouvelle bulle se gonfle autour de lui.
   ========================================================================== */
(function () {
  'use strict';
  if (!window.gsap) return;
  var host = document.getElementById('heroMascot');
  var bubble = document.getElementById('heroBubble');
  if (!host || !bubble) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var base = host.querySelector('.mascot-img');

  var joy = document.createElement('img');
  joy.className = 'mascot-img is-alt';
  joy.src = 'assets/img/mascotte/fennec-joie.webp';
  joy.alt = '';
  host.appendChild(joy);

  var shadow = document.createElement('span');
  shadow.className = 'hero-shadow';
  host.parentNode.insertBefore(shadow, host);

  if (reduce) return;

  // Respiration lente
  var float = gsap.to(host, { y: -10, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to(shadow, { scaleX: .88, opacity: .75, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  var breathe = gsap.to(bubble, { scale: 1.025, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  // Gelée : la bulle s'étire dans le sens du mouvement de la souris
  if (fine) {
    var sx = gsap.quickTo(bubble, 'scaleX', { duration: .9, ease: 'elastic.out(1, .4)' });
    var sy = gsap.quickTo(bubble, 'scaleY', { duration: .9, ease: 'elastic.out(1, .4)' });
    var rot = gsap.quickTo(host, 'rotation', { duration: 1, ease: 'power3' });
    var mx = gsap.quickTo(host, 'x', { duration: 1, ease: 'power3' });
    var bx = gsap.quickTo(bubble, 'x', { duration: 1.2, ease: 'power3' });
    var by = gsap.quickTo(bubble, 'y', { duration: 1.2, ease: 'power3' });
    var lastX = 0, lastY = 0, lastT = 0, settle = null;
    window.addEventListener('pointermove', function (e) {
      var now = performance.now(), dt = Math.max(16, now - lastT);
      var vx = (e.clientX - lastX) / dt, vy = (e.clientY - lastY) / dt;
      lastX = e.clientX; lastY = e.clientY; lastT = now;
      var r = bubble.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var v = Math.min(1, Math.hypot(vx, vy) / 2.5);
      var horiz = Math.abs(vx) >= Math.abs(vy);
      breathe.pause();
      sx(1 + (horiz ? .07 : -.05) * v);
      sy(1 + (horiz ? -.05 : .07) * v);
      var dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      var dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      rot(Math.max(-1, Math.min(1, dx * 2)) * 3);
      mx(Math.max(-1, Math.min(1, dx * 2)) * 8);
      bx(dx * 14); by(dy * 10);
      clearTimeout(settle);
      settle = setTimeout(function () { sx(1); sy(1); breathe.resume(); }, 140);
    }, { passive: true });
  }

  // Clic : la bulle éclate, le fennec saute, une bulle se reforme
  var busy = false;
  function cheer() {
    if (busy) return;
    busy = true;
    var r = bubble.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;

    // éclats répartis sur le contour de la bulle
    var n = 18;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      window.SKZ && window.SKZ.burst(cx + Math.cos(a) * r.width / 2, cy + Math.sin(a) * r.height / 2, { count: 1, spread: 40, min: 8, max: 16 });
    }
    breathe.pause();
    gsap.timeline({ onComplete: function () { busy = false; breathe.progress(0).resume(); } })
      .to(bubble, { scaleX: 1.08, scaleY: .94, duration: .1, ease: 'power2.out' })
      .to(bubble, { scale: 1.18, opacity: 0, duration: .16, ease: 'power2.out' })
      .add(function () { float.pause(); }, 0)
      .to(base, { scaleY: .9, scaleX: 1.06, duration: .12, ease: 'power2.in' }, 0)
      .set(base, { opacity: 0 }, .12)
      .set(joy, { opacity: 1, scaleY: .92, scaleX: 1.05 }, .12)
      .to(joy, { y: -64, scaleY: 1.04, scaleX: .97, duration: .32, ease: 'power2.out' }, .12)
      .to(shadow, { scaleX: .55, opacity: .35, duration: .32 }, .12)
      .to(joy, { y: 0, scaleY: 1, scaleX: 1, duration: .75, ease: 'bounce.out' }, .44)
      .to(shadow, { scaleX: 1, opacity: 1, duration: .75, ease: 'bounce.out' }, .44)
      .to(joy, { opacity: 0, duration: .2 }, 1.55)
      .to(base, { opacity: 1, scaleY: 1, scaleX: 1, duration: .2 }, 1.55)
      .add(function () { float.resume(); }, 1.6)
      // la nouvelle bulle se gonfle, avec un petit rebond de savon
      .fromTo(bubble, { scale: .35, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'elastic.out(1, .45)' }, 1.3);
  }

  host.addEventListener('click', cheer);
  window.skzCheer = cheer;
})();
