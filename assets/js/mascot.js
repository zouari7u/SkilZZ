/* ==========================================================================
   Mascotte du hero — le fennec souffle des bulles.
   · toutes les quelques secondes, une bulle se gonfle au bout de la
     baguette, se détache et monte en ondulant ; un clic la fait éclater ;
   · la grande bulle derrière lui respire et s'étire avec la souris ;
   · clic sur le fennec : la grande bulle éclate, il saute de joie, puis une
     nouvelle bulle se gonfle autour de lui.
   ========================================================================== */
(function () {
  'use strict';
  if (!window.gsap) return;
  var host = document.getElementById('heroMascot');
  var box = document.getElementById('mascotBox');
  var bubble = document.getElementById('heroBubble');
  var blow = document.getElementById('blow');
  if (!host || !box || !bubble) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var base = box.querySelector('.mascot-img');

  var joy = document.createElement('img');
  joy.className = 'mascot-img is-alt';
  joy.src = 'assets/img/mascotte/fennec-joie.webp';
  joy.alt = '';
  box.appendChild(joy);

  var shadow = document.createElement('span');
  shadow.className = 'hero-shadow';
  host.parentNode.insertBefore(shadow, host);

  if (reduce) return;

  // --- Respiration -------------------------------------------------------------
  var float = gsap.to(box, { y: -10, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to(shadow, { scaleX: .88, opacity: .75, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  var breathe = gsap.to(bubble, { scale: 1.025, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  // --- Bulles soufflées --------------------------------------------------------
  // Repères mesurés sur l'image : anneau de la baguette (63,6 % ; 45,4 %),
  // bulle gonflée centrée en (82,9 % ; 42,2 %), diamètre 32,6 % de la largeur.
  var live = 0, paused = false, timer = null;
  function popBubble(b) {
    if (b._done) return;
    b._done = true;
    gsap.killTweensOf(b);
    var r = b.getBoundingClientRect();
    if (window.SKZ) window.SKZ.pop(r.left + r.width / 2, r.top + r.height / 2, r.width);
    gsap.to(b, { scale: 1.3, opacity: 0, duration: .14, ease: 'power2.out', onComplete: function () { b.remove(); live--; } });
  }
  function blowOne() {
    if (paused || live >= 3 || document.hidden) return;
    var W = box.offsetWidth, H = box.offsetHeight;
    if (!W) return;
    var D = W * .326 * (.75 + Math.random() * .35);
    var b = document.createElement('span');
    b.className = 'blown';
    b.style.width = b.style.height = D + 'px';
    b.style.left = (W * .655) + 'px';
    b.style.top = (H * .454 - D / 2) + 'px';
    b.style.transformOrigin = '0% 50%';
    blow.appendChild(b);
    live++;
    var stop = function (e) { e.stopPropagation(); e.preventDefault(); };
    b.addEventListener('click', stop);
    b.addEventListener('pointerdown', function (e) { stop(e); popBubble(b); });

    var dx = 40 + Math.random() * 160, dy = -(H * (.45 + Math.random() * .35));
    gsap.timeline({ onComplete: function () { popBubble(b); } })
      // le fennec souffle : la bulle gonfle en tremblant un peu
      .fromTo(b, { scale: .06, opacity: 0 }, { scale: .55, opacity: 1, duration: .5, ease: 'power1.out' })
      .to(b, { scaleX: .82, scaleY: .74, duration: .35, ease: 'sine.inOut' })
      .to(b, { scaleX: 1, scaleY: 1, duration: .55, ease: 'elastic.out(1, .5)' })
      // elle se détache et monte en ondulant
      .to(b, { x: dx, y: dy, duration: 5 + Math.random() * 2.5, ease: 'sine.inOut' }, '+=.1')
      .to(b, { scaleX: 1.06, scaleY: .95, duration: .9, ease: 'sine.inOut', yoyo: true, repeat: 5 }, '<')
      .to(b, { opacity: .85, duration: 1 }, '<2');
  }
  function loop() {
    blowOne();
    timer = setTimeout(loop, 2600 + Math.random() * 1800);
  }
  setTimeout(loop, 2200);

  // --- La grande bulle s'étire avec la vitesse de la souris -------------------
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

  // --- Clic sur le fennec : saut de joie ---------------------------------------
  var busy = false;
  function cheer() {
    if (busy) return;
    busy = true; paused = true;
    blow.querySelectorAll('.blown').forEach(popBubble);
    var r = bubble.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (var i = 0; i < 18; i++) {
      var a = (i / 18) * Math.PI * 2;
      if (window.SKZ) window.SKZ.burst(cx + Math.cos(a) * r.width / 2, cy + Math.sin(a) * r.height / 2, { count: 1, spread: 40, min: 8, max: 16 });
    }
    breathe.pause();
    gsap.timeline({ onComplete: function () { busy = false; paused = false; breathe.progress(0).resume(); } })
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
      .fromTo(bubble, { scale: .35, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'elastic.out(1, .45)' }, 1.3);
  }

  host.addEventListener('click', cheer);
  window.skzCheer = cheer;
})();
