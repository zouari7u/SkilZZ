/* ==========================================================================
   ZkilZ — « Inclus dans chaque projet »
   1. Chaque visuel des encarts se met à l'échelle de sa case : la section
      tient dans l'écran, quelle que soit sa hauteur.
   2. L'encart « Animations » : une mini-page qui montre, en boucle, quatre
      animations courantes d'un site : apparition au défilement,
      micro-interaction sur un bouton, chargement (squelette, chiffre qui
      compte, barres), transition de page (une carte devient la page).
      Une frise montre l'étape en cours ; un clic y saute. Hors de l'écran :
      pause. « Réduire les animations » : une image fixe par étape.
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
  // 2. LA MINI-PAGE : quatre animations courantes d'un site, en boucle
  // -------------------------------------------------------------------------
  var demo = document.getElementById('demo');
  if (!demo || !window.gsap) return;
  var G = window.gsap;
  function q(s) { return demo.querySelector(s); }
  function qa(s) { return demo.querySelectorAll(s); }
  var scenes = qa('.ds'), chip = document.getElementById('demoChip'), head = document.getElementById('reelHead');
  var keys = Array.prototype.slice.call(qa('.reel-keys button')), cursor = q('.demo-cursor');
  var NAMES = ['Apparition au défilement', 'Micro-interaction', 'Chargement du contenu', 'Transition de page'];
  var D = 3.6, current = -1;

  function show(i) {
    if (i === current) return;
    current = i;
    keys.forEach(function (k, j) { k.classList.toggle('is-on', j === i); });
    chip.textContent = NAMES[i];
    G.fromTo(chip.parentElement, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: .35, ease: 'power2.out' });
  }
  function cur(x, y, d) { return G.to(cursor, { left: x, top: y, duration: d || .7, ease: 'power2.inOut' }); }
  function press() { return G.timeline().to(cursor, { scale: .82, duration: .08 }).to(cursor, { scale: 1, duration: .18, ease: 'back.out(3)' }); }

  // état de départ de chaque scène (rejoué à chaque tour)
  function reset() {
    G.set(scenes, { autoAlpha: 0 });
    G.set(cursor, { autoAlpha: 0, left: '78%', top: '86%', scale: 1 });
    G.set(qa('.dr-title .m > span'), { yPercent: 110 });
    G.set(qa('.ds--reveal .dr-line, .ds--reveal .dr-cards i, .dr-nav'), { y: 18, autoAlpha: 0 });
    G.set(q('.ds--reveal'), { y: 0 });
    q('.db-text').textContent = '';
    G.set(q('.db-btn'), { scale: 1, backgroundColor: '' });
    G.set(q('.db-t1'), { autoAlpha: 1, y: 0 });
    G.set(q('.db-t2'), { autoAlpha: 0, y: 10 });
    G.set(q('.db-ripple'), { scale: 0, autoAlpha: 1 });
    G.set(q('.dl-skel'), { autoAlpha: 1 });
    G.set(q('.dl-real'), { autoAlpha: 0 });
    q('.dl-num').textContent = '0';
    G.set(qa('.dl-bars i'), { scaleY: 0 });
    q('.ds--load').classList.remove('is-done');
    G.set(q('.dt-page'), { clipPath: 'inset(48px 50% 50% 16px round 12px)', autoAlpha: 1 });
    G.set(qa('.dt-l, .dt-btn'), { autoAlpha: 0, y: 8 });
  }

  var tl = G.timeline({ repeat: -1, paused: true, onRepeat: reset, onUpdate: function () {
    if (head) head.style.left = (tl.time() / tl.duration() * 100).toFixed(2) + '%';
    show(Math.min(3, Math.floor(tl.time() / D)));
  } });

  // 1. apparition au défilement : la page monte, le titre se révèle mot par mot, les cartes suivent
  tl.addLabel('s0', 0)
    .set(scenes[0], { autoAlpha: 1 }, 's0')
    .to(q('.dr-nav'), { y: 0, autoAlpha: 1, duration: .5, ease: 'power3.out' }, 's0+=.15')
    .to(qa('.dr-title .m > span'), { yPercent: 0, duration: .8, stagger: .09, ease: 'expo.out' }, 's0+=.3')
    .to(qa('.ds--reveal .dr-line'), { y: 0, autoAlpha: 1, duration: .6, stagger: .08, ease: 'power3.out' }, 's0+=.75')
    .to(qa('.ds--reveal .dr-cards i'), { y: 0, autoAlpha: 1, duration: .7, stagger: .07, ease: 'back.out(1.6)' }, 's0+=1')
    .to(q('.ds--reveal'), { y: -64, duration: 1.5, ease: 'sine.inOut' }, 's0+=1.5')
    .to(scenes[0], { autoAlpha: 0, duration: .3 }, D - .3);

  // 2. micro-interaction : on tape, le curseur survole puis clique, onde, confirmation
  var typed = { n: 0 }, msg = 'Bonjour, un devis ?';
  tl.addLabel('s1', D)
    .set(scenes[1], { autoAlpha: 1 }, 's1')
    .fromTo(typed, { n: 0 }, { n: msg.length, duration: 1, ease: 'none', onUpdate: function () { q('.db-text').textContent = msg.slice(0, Math.round(typed.n)); } }, 's1+=.2')
    .set(cursor, { autoAlpha: 1, left: '80%', top: '88%' }, 's1+=.6')
    .add(cur('48%', '64%', .8), 's1+=.9')
    .to(q('.db-btn'), { scale: 1.03, duration: .25, ease: 'power2.out' }, 's1+=1.55')
    .add(press(), 's1+=1.85')
    .to(q('.db-btn'), { scale: .96, duration: .08 }, 's1+=1.85')
    .to(q('.db-btn'), { scale: 1, duration: .5, ease: 'elastic.out(1, .45)' }, 's1+=1.93')
    .to(q('.db-ripple'), { scale: 9, autoAlpha: 0, duration: .7, ease: 'power2.out' }, 's1+=1.88')
    .to(q('.db-t1'), { autoAlpha: 0, y: -10, duration: .25 }, 's1+=2')
    .to(q('.db-t2'), { autoAlpha: 1, y: 0, duration: .45, ease: 'back.out(2)' }, 's1+=2.1')
    .to(q('.db-btn'), { backgroundColor: '#0B1B3F', duration: .4 }, 's1+=2.1')
    .to(cursor, { autoAlpha: 0, duration: .3 }, 's1+=2.9')
    .to(scenes[1], { autoAlpha: 0, duration: .3 }, 2 * D - .3);

  // 3. chargement : squelette qui scintille, puis le contenu ; le chiffre compte, les barres montent
  var num = { v: 0 };
  tl.addLabel('s2', 2 * D)
    .set(scenes[2], { autoAlpha: 1 }, 's2')
    .to(q('.dl-skel'), { autoAlpha: 0, duration: .35 }, 's2+=1.1')
    .to(q('.dl-real'), { autoAlpha: 1, duration: .45 }, 's2+=1.2')
    .call(function () { q('.ds--load').classList.add('is-done'); }, null, 's2+=1.3')
    .fromTo(num, { v: 0 }, { v: 1284, duration: 1.2, ease: 'power3.out', onUpdate: function () { q('.dl-num').textContent = Math.round(num.v).toLocaleString('fr-FR'); } }, 's2+=1.25')
    .to(qa('.dl-bars i'), { scaleY: 1, duration: .8, stagger: .06, ease: 'back.out(1.5)' }, 's2+=1.35')
    .to(scenes[2], { autoAlpha: 0, duration: .3 }, 3 * D - .3);

  // 4. transition de page : on touche une carte, elle s'agrandit et devient la page suivante
  tl.addLabel('s3', 3 * D)
    .set(scenes[3], { autoAlpha: 1 }, 's3')
    .set(cursor, { autoAlpha: 1, left: '78%', top: '86%' }, 's3+=.1')
    .add(cur('30%', '34%', .8), 's3+=.2')
    .add(press(), 's3+=1.05')
    .to(q('.dt-grid i:first-child'), { scale: .95, duration: .1, yoyo: true, repeat: 1 }, 's3+=1.05')
    .to(cursor, { autoAlpha: 0, duration: .2 }, 's3+=1.25')
    .to(q('.dt-page'), { clipPath: 'inset(0px 0% 0% 0px round 0px)', duration: .8, ease: 'expo.inOut' }, 's3+=1.25')
    .to(qa('.dt-l, .dt-btn'), { autoAlpha: 1, y: 0, duration: .5, stagger: .08, ease: 'power3.out' }, 's3+=1.85')
    .to(q('.dt-page'), { clipPath: 'inset(48px 50% 50% 16px round 12px)', duration: .7, ease: 'expo.inOut' }, 's3+=2.75')
    .to(qa('.dt-l, .dt-btn'), { autoAlpha: 0, duration: .2 }, 's3+=2.75')
    .to(scenes[3], { autoAlpha: 0, duration: .25 }, 4 * D - .25);

  reset();
  function jump(i, play) { reset(); current = -1; tl.seek(i * D + (play ? 0 : D * .8), false); if (play) tl.play(); else tl.pause(); }
  keys.forEach(function (k, i) { k.addEventListener('click', function () { jump(i, !reduce); }); });
  if (reduce) { jump(0, false); return; }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) tl.play(); else tl.pause(); }, { threshold: .2 }).observe(demo);
  } else tl.play();
})();
