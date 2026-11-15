/* ==========================================================================
   Le fennec — mascotte vivante du hero.
   · les yeux (et un peu la tête) suivent le curseur ;
   · clignements aléatoires, oreilles qui frémissent ;
   · au clic : petit saut de joie, yeux rieurs et bulles de cœur.
   ========================================================================== */
(function () {
  'use strict';
  var svg = document.getElementById('fennec');
  if (!svg || !window.gsap) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var head = svg.querySelector('.fx-head');
  var eyes = svg.querySelectorAll('.fx-eye');
  var glints = svg.querySelectorAll('.fx-glint');
  var eyesGroup = svg.querySelector('.fx-eyes');
  var happy = svg.querySelector('.fx-happy-eyes');
  var earL = svg.querySelector('.fx-ear--l');
  var earR = svg.querySelector('.fx-ear--r');
  var brows = svg.querySelector('.fx-brows');

  // Respiration permanente (très légère)
  gsap.to(head, { y: -4, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  if (reduce) return;

  // --- Regard qui suit le curseur ------------------------------------------
  var eyeX = gsap.quickTo(eyesGroup, 'x', { duration: .5, ease: 'power3' });
  var eyeY = gsap.quickTo(eyesGroup, 'y', { duration: .5, ease: 'power3' });
  var glX = gsap.quickTo(glints, 'x', { duration: .6, ease: 'power3' });
  var glY = gsap.quickTo(glints, 'y', { duration: .6, ease: 'power3' });
  var headR = gsap.quickTo(head, 'rotation', { duration: .9, ease: 'power3' });
  var headX = gsap.quickTo(head, 'x', { duration: .9, ease: 'power3' });

  window.addEventListener('pointermove', function (e) {
    var r = svg.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height * .55;
    var dx = (e.clientX - cx) / window.innerWidth;
    var dy = (e.clientY - cy) / window.innerHeight;
    dx = Math.max(-1, Math.min(1, dx * 2));
    dy = Math.max(-1, Math.min(1, dy * 2));
    eyeX(dx * 9); eyeY(dy * 7);
    glX(dx * 3); glY(dy * 2);
    headR(dx * 6); headX(dx * 6);
  }, { passive: true });

  // --- Clignements ---------------------------------------------------------
  function blink() {
    var double = Math.random() < .25;
    var tl = gsap.timeline({ onComplete: function () { gsap.delayedCall(2 + Math.random() * 3.5, blink); } });
    tl.to(eyes, { scaleY: .08, duration: .07, ease: 'power2.in' })
      .to(eyes, { scaleY: 1, duration: .12, ease: 'power2.out' });
    if (double) tl.to(eyes, { scaleY: .08, duration: .07, delay: .08 }).to(eyes, { scaleY: 1, duration: .12 });
  }
  gsap.delayedCall(1.8, blink);

  // --- Oreilles qui frémissent ---------------------------------------------
  function twitch() {
    var ear = Math.random() < .5 ? earL : earR;
    var dir = ear === earL ? -1 : 1;
    gsap.timeline({ onComplete: function () { gsap.delayedCall(1.5 + Math.random() * 3, twitch); } })
      .to(ear, { rotation: dir * 9, duration: .09, ease: 'power2.out' })
      .to(ear, { rotation: dir * -4, duration: .1 })
      .to(ear, { rotation: 0, duration: .5, ease: 'elastic.out(1.2, .4)' });
  }
  gsap.delayedCall(2.6, twitch);

  // --- Clic : saut de joie + cœurs ----------------------------------------
  var busy = false;
  function cheer() {
    if (busy) return;
    busy = true;
    gsap.timeline({ onComplete: function () { busy = false; } })
      .to(head, { y: 6, scaleY: .94, duration: .12, ease: 'power2.in', transformOrigin: '50% 100%' })
      .to(head, { y: -34, scaleY: 1.04, duration: .28, ease: 'power2.out' })
      .to([earL, earR], { rotation: function (i) { return i ? 14 : -14; }, duration: .2 }, '<')
      .to(eyesGroup, { opacity: 0, duration: .05 }, '<')
      .to(happy, { opacity: 1, duration: .05 }, '<')
      .to(brows, { y: -6, duration: .2 }, '<')
      .to(head, { y: 0, scaleY: 1, duration: .7, ease: 'bounce.out' })
      .to([earL, earR], { rotation: 0, duration: .8, ease: 'elastic.out(1, .35)' }, '<')
      .to(brows, { y: 0, duration: .3 }, '<.4')
      .to(happy, { opacity: 0, duration: .05 }, '+=.2')
      .to(eyesGroup, { opacity: 1, duration: .05 }, '<');
    hearts();
  }

  function hearts() {
    var host = svg.parentElement;
    for (var i = 0; i < 7; i++) {
      var h = document.createElement('span');
      h.textContent = ['♥', '✦', '●'][i % 3];
      h.style.cssText = 'position:absolute;left:50%;top:40%;font-size:' + (14 + Math.random() * 16) + 'px;color:' +
        ['#F0743A', '#E8467C', '#6AA9FF'][i % 3] + ';pointer-events:none;z-index:5;';
      host.appendChild(h);
      gsap.fromTo(h, { x: 0, y: 0, scale: 0, opacity: 1 }, {
        x: (Math.random() - .5) * 260, y: -120 - Math.random() * 120, scale: 1, rotation: (Math.random() - .5) * 90,
        opacity: 0, duration: 1.2 + Math.random() * .5, ease: 'power2.out',
        onComplete: (function (el) { return function () { el.remove(); }; })(h)
      });
    }
  }

  svg.addEventListener('click', cheer);
  window.skzFennecCheer = cheer;
})();
