/* ==========================================================================
   SkilZZ — animations de la page d'accueil (GSAP + ScrollTrigger + Lenis)
   ========================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (!hasGsap) return;
  gsap.registerPlugin(ScrollTrigger);

  // --- Défilement doux (Lenis), synchronisé sur l'horloge GSAP --------------
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: id === '#top' ? 0 : -90, duration: 1.4 });
      });
    });
  }

  // --- Barre de progression -------------------------------------------------
  gsap.to('#scrollProgress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

  if (reduce) { document.querySelectorAll('.story-step').forEach(function (s) { s.style.position = 'relative'; s.style.opacity = 1; s.style.transform = 'none'; }); return; }

  // --- Intro : la nav tombe, le titre se révèle, le fennec sort de sa bulle --
  var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .from('#nav', { y: -90, scale: .85, opacity: 0, duration: 1.2, ease: 'elastic.out(1, .75)' })
    .from('.hero-title .line > span', { yPercent: 110, rotation: 3, duration: 1.2, stagger: .12 }, '-=.9')
    .from('.word-bubble i', { scale: 0, duration: 1.1, ease: 'elastic.out(1, .45)' }, '-=.7')
    .from('[data-intro]', { y: 26, opacity: 0, duration: 1, stagger: .08 }, '-=1')
    .from('.stage-bubble', { scale: .2, opacity: 0, duration: 1.4, ease: 'elastic.out(1, .6)' }, '-=1.2')
    .from('.fennec', { yPercent: 70, duration: 1.1, ease: 'back.out(1.6)' }, '-=1')
    .from('.float-card', { scale: 0, opacity: 0, duration: 1, stagger: .09, ease: 'back.out(2.2)' }, '-=.7');

  // Bulle-mot qui « respire »
  gsap.to('.word-bubble i', { scaleX: 1.04, scaleY: .96, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 });

  // Cartes flottantes : dérive permanente + parallaxe souris
  document.querySelectorAll('.float-card').forEach(function (el, i) {
    gsap.to(el, { y: (i % 2 ? 12 : -12), rotation: (i % 2 ? 2 : -2), duration: 2.6 + i * .4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 + i * .2 });
  });
  var stage = document.getElementById('heroStage');
  if (finePointer && stage) {
    var layers = Array.prototype.map.call(stage.querySelectorAll('[data-depth]'), function (el) {
      var d = parseFloat(el.dataset.depth);
      return { x: gsap.quickTo(el, 'xPercent', { duration: 1, ease: 'power3' }), y: gsap.quickTo(el, 'yPercent', { duration: 1, ease: 'power3' }), d: d, el: el };
    });
    window.addEventListener('pointermove', function (e) {
      var nx = e.clientX / window.innerWidth - .5, ny = e.clientY / window.innerHeight - .5;
      layers.forEach(function (l) { var k = l.el.classList.contains('stage-bubble') ? 3 : 14; l.x(nx * l.d * k); l.y(ny * l.d * k); });
    }, { passive: true });
  }
  // Le hero s'éloigne doucement quand on défile
  gsap.to('.hero-stage', { yPercent: 14, scale: .94, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-copy', { yPercent: -10, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });

  // --- Bulles de savon qu'on peut éclater ----------------------------------
  var field = document.getElementById('bubbleField');
  var palette = ['#F0743A', '#E8467C', '#6AA9FF', '#2FAE6E', '#F7A35C'];
  function spawnBubble(initial) {
    var b = document.createElement('span');
    b.className = 'bub';
    var s = 16 + Math.random() * 64;
    b.style.width = b.style.height = s + 'px';
    b.style.left = (Math.random() * 100) + '%';
    field.appendChild(b);
    var H = field.offsetHeight;
    var startY = initial ? Math.random() * H : H + s;
    var dur = 12 + Math.random() * 14;
    var tw = gsap.fromTo(b, { y: startY, x: 0, scale: initial ? 1 : 0 }, {
      y: -s * 2, scale: 1, duration: dur * ((startY + s * 2) / (H + s * 3)), ease: 'none',
      onComplete: function () { b.remove(); spawnBubble(false); }
    });
    gsap.to(b, { x: (Math.random() - .5) * 80, duration: 3 + Math.random() * 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    b.addEventListener('pointerdown', function () { pop(b, tw); }, { once: true });
  }
  function pop(b, tw) {
    tw.kill(); gsap.killTweensOf(b);
    var r = b.getBoundingClientRect(), f = field.getBoundingClientRect();
    var cx = r.left - f.left + r.width / 2, cy = r.top - f.top + r.height / 2;
    gsap.to(b, { scale: 1.5, opacity: 0, duration: .18, ease: 'power2.out', onComplete: function () { b.remove(); } });
    for (var i = 0; i < 8; i++) {
      var d = document.createElement('span');
      d.className = 'pop-dot';
      d.style.left = cx + 'px'; d.style.top = cy + 'px';
      d.style.background = palette[i % palette.length];
      field.appendChild(d);
      var a = (i / 8) * Math.PI * 2;
      gsap.to(d, { x: Math.cos(a) * (30 + r.width / 2), y: Math.sin(a) * (30 + r.width / 2), scale: 0, duration: .6, ease: 'power3.out', onComplete: (function (el) { return function () { el.remove(); }; })(d) });
    }
    setTimeout(function () { spawnBubble(false); }, 1500);
  }
  if (field) for (var i = 0; i < (window.innerWidth < 640 ? 7 : 14); i++) spawnBubble(true);

  // --- Curseur bulle + boutons magnétiques ---------------------------------
  if (finePointer) {
    var cur = document.getElementById('cursorBubble');
    var cx = gsap.quickTo(cur, 'x', { duration: .35, ease: 'power3' });
    var cy = gsap.quickTo(cur, 'y', { duration: .35, ease: 'power3' });
    window.addEventListener('pointermove', function (e) { cur.classList.add('is-on'); cx(e.clientX); cy(e.clientY); }, { passive: true });
    document.addEventListener('mouseleave', function () { cur.classList.remove('is-on'); });
    document.querySelectorAll('a, button, .shot, .fennec, .bub, summary, label').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add('is-big'); });
      el.addEventListener('mouseleave', function () { cur.classList.remove('is-big'); });
    });
    // bulles créées plus tard : délégation
    field && field.addEventListener('pointerover', function (e) { if (e.target.classList.contains('bub')) cur.classList.add('is-big'); });
    field && field.addEventListener('pointerout', function (e) { if (e.target.classList.contains('bub')) cur.classList.remove('is-big'); });

    document.querySelectorAll('.magnetic').forEach(function (btn) {
      var mx = gsap.quickTo(btn, 'x', { duration: .6, ease: 'elastic.out(1, .4)' });
      var my = gsap.quickTo(btn, 'y', { duration: .6, ease: 'elastic.out(1, .4)' });
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .25); my((e.clientY - r.top - r.height / 2) * .35);
      });
      btn.addEventListener('pointerleave', function () { mx(0); my(0); });
    });
  }

  // --- Marquee : défile en continu, accélère et s'incline avec le scroll ----
  document.querySelectorAll('.marquee-row').forEach(function (row) {
    var track = row.querySelector('.marquee-track');
    track.parentNode.appendChild(track.cloneNode(true));
    var tracks = row.querySelectorAll('.marquee-track');
    var dir = parseFloat(row.dataset.dir) || 1;
    var w = track.offsetWidth;
    var pos = 0, speed = 1;
    gsap.ticker.add(function (t, dt) {
      pos -= dir * speed * dt * .06;
      if (pos <= -w) pos += w;
      if (pos > 0) pos -= w;
      gsap.set(tracks, { x: pos });
      speed += (1 - speed) * .06;
    });
    window.addEventListener('resize', function () { w = track.offsetWidth; });
    ScrollTrigger.create({ trigger: row, start: 'top bottom', end: 'bottom top', onUpdate: function (self) {
      speed = 1 + Math.min(8, Math.abs(self.getVelocity()) / 300);
    } });
  });

  // --- Manifeste : les mots s'allument --------------------------------------
  var mt = document.getElementById('manifestoText');
  if (mt) {
    mt.innerHTML = mt.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    gsap.to(mt.querySelectorAll('.w'), {
      opacity: 1, stagger: .05, ease: 'none',
      scrollTrigger: { trigger: mt, start: 'top 80%', end: 'bottom 45%', scrub: .5 }
    });
  }

  // --- Story : iPhone épinglé ----------------------------------------------
  var story = document.getElementById('story');
  if (story) {
    var steps = story.querySelectorAll('.story-step');
    var screens = story.querySelectorAll('.screen');
    var dots = story.querySelectorAll('.story-dots span');
    var reel = story.querySelector('.screen--reel video');
    var phone = document.getElementById('storyPhone');
    var current = 0;

    function go(i) {
      if (i === current) return;
      steps.forEach(function (s, k) {
        s.classList.toggle('is-active', k === i);
        gsap.to(s, { opacity: k === i ? 1 : 0, y: k === i ? 0 : (k < i ? -40 : 40), duration: .7, ease: 'expo.out', overwrite: true });
      });
      dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
      // L'écran du téléphone glisse d'un contenu à l'autre (comme un swipe)
      screens.forEach(function (sc, k) {
        if (k === 0) return;
        gsap.to(sc, { clipPath: k <= i ? 'inset(0% 0 0 0 round 0)' : 'inset(100% 0 0 0 round 0)', duration: .9, ease: 'expo.inOut', overwrite: true });
      });
      gsap.fromTo(phone, { scale: .97 }, { scale: 1, duration: .8, ease: 'elastic.out(1, .5)' });
      current = i;
      if (reel) { if (i === 1) reel.play().catch(function () {}); else reel.pause(); }
    }
    gsap.set(steps, { opacity: function (k) { return k ? 0 : 1; }, y: function (k) { return k ? 40 : 0; } });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: story, start: 'top top', end: '+=260%', pin: '.story-sticky', scrub: .6, anticipatePin: 1,
        onUpdate: function (self) { go(Math.min(2, Math.floor(self.progress * 3 * .999))); }
      }
    });
    // Le téléphone se redresse puis pivote doucement au fil des étapes
    var device = story.querySelector('.story-device');
    tl.fromTo(device, { rotationX: 26, rotationY: -20, rotationZ: -6, scale: .84, transformPerspective: 1300 }, { rotationX: 0, rotationY: 0, rotationZ: 0, scale: 1, duration: .7, ease: 'power2.out' })
      .to(device, { rotationY: 12, rotationZ: 2, duration: 1, ease: 'sine.inOut' })
      .to(device, { rotationY: -10, rotationZ: -2, duration: 1, ease: 'sine.inOut' })
      .to(device, { rotationY: 0, rotationZ: 0, scale: 1.04, duration: .5 });
  }

  // --- Réalisations ---------------------------------------------------------
  gsap.from('#caseMM', {
    scale: .88, borderRadius: 120, opacity: .4, y: 80, ease: 'power3.out',
    scrollTrigger: { trigger: '#caseMM', start: 'top 95%', end: 'top 45%', scrub: .6 }
  });
  if (window.innerWidth > 900) document.querySelectorAll('[data-parallax]').forEach(function (el) {
    gsap.fromTo(el, { yPercent: -parseFloat(el.dataset.parallax) * 100 }, {
      yPercent: parseFloat(el.dataset.parallax) * 100, ease: 'none',
      scrollTrigger: { trigger: '#caseMM', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
  gsap.from('.shot', { y: 60, opacity: 0, scale: .9, stagger: .08, duration: 1, ease: 'back.out(1.6)', scrollTrigger: { trigger: '#shots', start: 'top 85%' } });

  // Galerie : glisser à la souris
  var shots = document.getElementById('shots');
  if (shots && finePointer) {
    var down = false, sx = 0, sl = 0, moved = false;
    shots.addEventListener('pointerdown', function (e) { down = true; moved = false; sx = e.clientX; sl = shots.scrollLeft; });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; shots.classList.add('is-dragging'); }
      shots.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { down = false; shots.classList.remove('is-dragging'); });
    shots.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  }

  // --- Expertises : cartes empilées qui reculent ----------------------------
  var cards = gsap.utils.toArray('.svc');
  cards.forEach(function (card, i) {
    gsap.from(card.querySelector('.svc-visual'), { y: 80, rotation: 4, opacity: 0, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 85%', end: 'top 35%', scrub: .6 } });
    if (i === cards.length - 1) return;
    gsap.to(card, {
      scale: .9 + i * .015, ease: 'none',
      scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 120px', scrub: true }
    });
  });

  // --- Approche : le chemin se trace, les bulles éclosent -------------------
  var path = document.getElementById('processPath');
  if (path) {
    var len = path.getTotalLength();
    path.setAttribute('stroke-dasharray', len);
    gsap.fromTo(path, { strokeDashoffset: len }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.process-track', start: 'top 80%', end: 'bottom 60%', scrub: .6 } });
  }
  gsap.utils.toArray('.pstep').forEach(function (s, i) {
    gsap.from(s, { y: 80, opacity: 0, rotation: i % 2 ? 3 : -3, duration: 1, ease: 'back.out(1.4)', scrollTrigger: { trigger: s, start: 'top 88%' } });
    gsap.from(s.querySelector('.pstep-bubble'), { scale: 0, duration: 1, ease: 'elastic.out(1, .5)', delay: .2, scrollTrigger: { trigger: s, start: 'top 88%' } });
  });

  // --- Révélations génériques ----------------------------------------------
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  gsap.from('.cta-bubble', { scale: .85, y: 60, borderRadius: 200, ease: 'power3.out', scrollTrigger: { trigger: '.cta', start: 'top 90%', end: 'top 40%', scrub: .6 } });

  // --- FAQ : ouverture animée ------------------------------------------------
  document.querySelectorAll('.qa').forEach(function (d) {
    var sum = d.querySelector('summary'), body = d.querySelector('.qa-body');
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, opacity: 0, duration: .45, ease: 'power3.inOut', onComplete: function () { d.open = false; gsap.set(body, { clearProps: 'all' }); ScrollTrigger.refresh(); } });
      } else {
        d.open = true;
        gsap.from(body, { height: 0, opacity: 0, duration: .6, ease: 'expo.out', onComplete: function () { ScrollTrigger.refresh(); } });
      }
    });
  });

  // --- Formulaire -------------------------------------------------------------
  var form = document.getElementById('contactForm');
  if (form) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = 'Il manque votre nom ou un email valide.';
        gsap.fromTo(form, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1, .3)' });
        return;
      }
      var endpoint = form.dataset.endpoint;
      if (!endpoint) {
        status.textContent = 'Aperçu : le formulaire n\'est pas encore relié à une adresse d\'envoi.';
        return;
      }
      status.textContent = 'Envoi…';
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(); status.textContent = 'Merci ! On revient vers vous très vite.'; form.reset(); if (window.skzFennecCheer) window.skzFennecCheer(); })
        .catch(function () { status.textContent = 'Oups, l\'envoi a échoué. Réessayez dans un instant.'; });
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
