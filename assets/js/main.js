/* ==========================================================================
   SkilZZ — scènes et animations de défilement (GSAP + ScrollTrigger + Lenis)
   Chaque section a son entrée, et quelque chose bouge doucement en
   continu : bulles qui dérivent, liseré irisé qui tourne, mascotte qui
   respire. Tout s'arrête avec « réduire les animations ».
   ========================================================================== */
(function () {
  'use strict';
  if (!(window.gsap && window.ScrollTrigger)) return;
  gsap.registerPlugin(ScrollTrigger);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var desktop = window.matchMedia('(min-width: 981px)').matches;
  var EASE = 'expo.out';
  var SPRING = 'elastic.out(1, .5)';
  var root = document.documentElement;
  function css(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }

  // --- Défilement doux -------------------------------------------------------
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var el = id.length > 1 && document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { offset: id === '#top' ? 0 : -96, duration: 1.4 });
      else el.scrollIntoView();
    });
  });

  // --- Questions : ouverture en hauteur mesurée ------------------------------
  document.querySelectorAll('.qa').forEach(function (d) {
    var body = d.querySelector('.qa-body');
    d.querySelector('summary').addEventListener('click', function (e) {
      e.preventDefault();
      if (reduce) { d.open = !d.open; return; }
      if (d.open) {
        gsap.to(body, { height: 0, opacity: 0, duration: .4, ease: 'power3.inOut', onComplete: function () { d.open = false; gsap.set(body, { clearProps: 'height,opacity' }); ScrollTrigger.refresh(); } });
      } else {
        d.open = true;
        gsap.from(body, { height: 0, opacity: 0, duration: .55, ease: EASE, onComplete: function () { gsap.set(body, { clearProps: 'height,opacity' }); ScrollTrigger.refresh(); } });
        gsap.from(body.querySelector('p'), { y: 14, duration: .6, ease: EASE });
      }
    });
  });

  // --- Formulaire ------------------------------------------------------------
  var contactMascot = document.getElementById('contactMascot');
  function contactHop() {
    if (reduce || !contactMascot) return;
    gsap.timeline()
      .to(contactMascot, { scaleY: .9, scaleX: 1.06, duration: .1 })
      .to(contactMascot, { y: -36, scaleY: 1.04, scaleX: .97, duration: .28, ease: 'power2.out' })
      .to(contactMascot, { y: 0, scaleY: 1, scaleX: 1, duration: .7, ease: 'bounce.out' });
    var r = contactMascot.getBoundingClientRect();
    if (window.SKZ) window.SKZ.burst(r.left + r.width / 2, r.top + r.height * .35, { count: 12, spread: 110 });
  }
  var form = document.getElementById('contactForm');
  if (form) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = 'Indiquez votre nom et une adresse email valide.';
        if (!reduce) gsap.fromTo(form, { x: -10 }, { x: 0, duration: .7, ease: 'elastic.out(1, .3)' });
        return;
      }
      var data = new FormData(form);
      var endpoint = form.dataset.endpoint, email = form.dataset.email;
      if (endpoint) {
        status.textContent = 'Envoi en cours…';
        fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function (r) { if (!r.ok) throw new Error(); status.textContent = 'Message envoyé. Le studio vous répond rapidement.'; form.reset(); contactHop(); })
          .catch(function () { status.textContent = "L'envoi a échoué. Réessayez dans un instant."; });
      } else if (email) {
        var body = 'Nom : ' + data.get('name') + '\nEmail : ' + data.get('email') + '\nProjet : ' + data.getAll('type').join(', ') + '\n\n' + (data.get('message') || '');
        window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Projet : ' + data.get('name')) + '&body=' + encodeURIComponent(body);
        contactHop();
      } else {
        status.textContent = "Le formulaire n'est pas encore relié à une adresse d'envoi.";
        contactHop();
      }
    });
  }

  if (reduce) {
    document.querySelectorAll('.svc').forEach(function (s) { s.classList.add('is-active'); });
    document.querySelectorAll('.step').forEach(function (s) { s.classList.add('is-on'); });
    gsap.set('.work-bubble', { scale: 1 });
    gsap.set('.work-rider', { opacity: 0 });
    return;
  }

  // --- Découpage des titres en mots --------------------------------------------
  document.querySelectorAll('h2.split').forEach(function (h) {
    h.innerHTML = h.textContent.trim().split(/\s+/).map(function (w) { return '<span class="wm"><span class="wi">' + w + '</span></span>'; }).join(' ');
  });

  // --- Bulles décoratives qui dérivent dans certaines sections ----------------
  // Positions choisies dans les marges, jamais sous un titre.
  if (window.innerWidth > 980) [
    ['.why', { right: '3%', top: '8%' }, 150], ['.why', { right: '22%', bottom: '6%' }, 70],
    ['.method', { right: '2%', top: '4%' }, 130], ['.method', { left: '1%', bottom: '8%' }, 80],
    ['.faq', { left: '2%', top: '30%' }, 110]
  ].forEach(function (cfg) {
    var sec = document.querySelector(cfg[0]);
    if (!sec) return;
    sec.style.position = 'relative'; sec.style.isolation = 'isolate';
    var s = document.createElement('div');
    s.className = 'soap';
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<span class="soap-rim"></span><span class="soap-shine"></span>';
    s.style.cssText = 'position:absolute;z-index:-1;pointer-events:none;opacity:.7;width:' + cfg[2] + 'px;height:' + cfg[2] + 'px;';
    Object.keys(cfg[1]).forEach(function (k) { s.style[k] = cfg[1][k]; });
    sec.appendChild(s);
    gsap.to(s, { y: -20, x: (Math.random() - .5) * 30, duration: 4 + Math.random() * 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.fromTo(s, { yPercent: 50 }, { yPercent: -50, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // =========================================================================
  // HERO
  // =========================================================================
  var intro = gsap.timeline({ defaults: { ease: EASE } });
  intro
    .from('#nav', { y: -30, opacity: 0, duration: .9, clearProps: 'transform,opacity' })
    .from('#heroTitle .wi', { yPercent: 115, rotation: 5, duration: 1.1, stagger: .055 }, .15)
    .fromTo('#heroMark', { '--mark': 0 }, { '--mark': 1, duration: 1.1, ease: 'elastic.out(1, .55)' }, .85)
    .from('[data-enter]', { y: 18, opacity: 0, duration: .9, stagger: .08 }, .55)
    .fromTo('#heroBubble', { scale: .3, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5, ease: 'elastic.out(1, .45)' }, .3)
    .from('#heroMascot .mascot-img:not(.is-alt)', { y: 90, scale: .85, opacity: 0, duration: 1.2, ease: 'back.out(1.5)' }, .55)
    .from('.chip', { scale: .5, opacity: 0, duration: .9, stagger: .1, ease: 'back.out(2.2)' }, 1);

  // Pastilles : flottent chacune à leur rythme, et suivent un peu la souris
  document.querySelectorAll('.chip').forEach(function (c, i) {
    gsap.to(c, { y: i % 2 ? 10 : -10, rotation: i % 2 ? 2 : -2, duration: 2.6 + i * .5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.8 + i * .3 });
  });
  var stage = document.getElementById('heroStage');
  if (fine && stage) {
    var chips = Array.prototype.map.call(stage.querySelectorAll('.chip'), function (el) {
      return { d: parseFloat(el.dataset.depth) || 1, x: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3' }) };
    });
    window.addEventListener('pointermove', function (e) {
      var nx = e.clientX / window.innerWidth - .5;
      chips.forEach(function (c) { c.x(nx * 22 * c.d); });
    }, { passive: true });
  }

  // En quittant le hero : le texte remonte, la scène descend plus lentement
  gsap.to('.hero-copy', { yPercent: -14, opacity: .15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('#heroStage', { yPercent: 12, scale: .94, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Bulles qui montent derrière la mascotte ; un clic les éclate
  var field = document.getElementById('bubbles');
  function spawn(first) {
    var b = document.createElement('span');
    b.className = 'bub';
    var s = 16 + Math.random() * 44;
    b.style.width = b.style.height = s + 'px';
    field.appendChild(b);
    var W = field.offsetWidth, H = field.offsetHeight;
    var x0 = Math.random() * (W - s), from = first ? Math.random() * H : H;
    gsap.set(b, { x: x0, y: from });
    var rise = gsap.fromTo(b, { opacity: 0 }, { y: -s, opacity: 1, duration: (13 + Math.random() * 9) * (from / H + .12), ease: 'none', onComplete: function () { b.remove(); spawn(false); } });
    var sway = gsap.to(b, { x: x0 + (Math.random() - .5) * 60, duration: 2.8 + Math.random() * 2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    b.addEventListener('pointerdown', function () {
      rise.kill(); sway.kill();
      var r = b.getBoundingClientRect();
      if (window.SKZ) window.SKZ.pop(r.left + r.width / 2, r.top + r.height / 2, r.width);
      gsap.to(b, { scale: 1.35, opacity: 0, duration: .14, ease: 'power2.out', onComplete: function () { b.remove(); } });
      setTimeout(function () { spawn(false); }, 1600);
    }, { once: true });
  }
  if (field) for (var i = 0; i < (window.innerWidth < 640 ? 4 : 8); i++) spawn(true);

  // =========================================================================
  // BANDEAU : défile en continu, accélère avec la vitesse de défilement
  // =========================================================================
  var strip = document.getElementById('strip');
  if (strip) {
    var track = strip.querySelector('.strip-track');
    var list = track.querySelector('ul');
    while (track.offsetWidth < window.innerWidth * 2.2) track.appendChild(list.cloneNode(true));
    var unit = list.offsetWidth, pos = 0, boost = 0, dir = 1;
    gsap.ticker.add(function (t, dt) {
      pos -= (0.045 + boost) * dt * dir;
      if (pos <= -unit) pos += unit;
      if (pos > 0) pos -= unit;
      gsap.set(track, { x: pos });
      boost *= .92;
    });
    ScrollTrigger.create({ trigger: strip, start: 'top bottom', end: 'bottom top', onUpdate: function (self) {
      dir = self.direction;
      boost = Math.min(.6, Math.abs(self.getVelocity()) / 4000);
    } });
  }

  // =========================================================================
  // POURQUOI UN FENNEC : la bulle se gonfle, les ondes partent, les mots
  // s'éclaircissent au fil du défilement
  // =========================================================================
  var portrait = document.getElementById('whyPortrait');
  if (portrait) {
    gsap.from(portrait.querySelector('.soap'), { scale: .4, opacity: 0, duration: 1.4, ease: 'elastic.out(1, .5)', scrollTrigger: { trigger: portrait, start: 'top 80%' } });
    var rings = gsap.timeline({ repeat: -1, paused: true });
    rings.fromTo(portrait.querySelectorAll('.ring'), { scale: 1, opacity: .55 }, { scale: 1.7, opacity: 0, duration: 2.4, ease: 'power2.out', stagger: .8 });
    ScrollTrigger.create({ trigger: portrait, start: 'top 85%', end: 'bottom 10%', onToggle: function (s) { s.isActive ? rings.play() : rings.pause(); } });
    gsap.to(portrait, { y: -14, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }
  var why = document.getElementById('whyText');
  if (why) {
    why.innerHTML = why.innerHTML.trim().split(/\s+/).map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    gsap.to(why.querySelectorAll('.w'), { opacity: 1, filter: 'blur(0px)', y: 0, stagger: .06, ease: 'none', scrollTrigger: { trigger: why, start: 'top 82%', end: 'bottom 52%', scrub: .5 } });
  }

  // =========================================================================
  // TITRES DE SECTION : les mots montent dans leurs masques arrondis
  // =========================================================================
  document.querySelectorAll('.head').forEach(function (h) {
    var tl = gsap.timeline({ scrollTrigger: { trigger: h, start: 'top 85%' } });
    tl.from(h.querySelector('.label'), { y: 14, opacity: 0, duration: .7, ease: EASE })
      .from(h.querySelectorAll('.wi'), { yPercent: 115, rotation: 4, duration: 1, stagger: .06, ease: EASE }, .1);
  });

  // =========================================================================
  // SERVICES : la bulle reste à l'écran, se déforme et change de couleur ;
  // le fennec change de pose à chaque service
  // =========================================================================
  var svcs = gsap.utils.toArray('.svc');
  var svcBubble = document.getElementById('svcBubble');
  var poses = gsap.utils.toArray('.svc-pose');
  var count = document.querySelectorAll('#svcCount b');
  var current = 0;
  function tone(t) {
    if (t === 'navy') return root.dataset.theme === 'dark' ? '#1E3A80' : '#0B1B3F';
    if (t === 'green') return css('--tint-green');
    return css('--tint-blue');
  }
  function setStep(i) {
    if (i === current) return;
    var prev = current; current = i;
    svcs.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
    count.forEach(function (b) { b.style.transform = 'translateY(' + (-i * 100) + '%)'; });
    if (!svcBubble) return;
    gsap.timeline({ overwrite: 'auto' })
      .to(svcBubble, { scaleX: 1.1, scaleY: .9, duration: .16, ease: 'power2.out' })
      .to(svcBubble, { scaleX: 1, scaleY: 1, duration: 1.1, ease: 'elastic.out(1.1, .35)' });
    gsap.to(svcBubble, { '--soap-fill': tone(svcs[i].dataset.tone), duration: .6, ease: 'power2.out' });
    gsap.to(poses[prev], { opacity: 0, scale: .8, y: 40, rotation: prev < i ? -8 : 8, duration: .35, ease: 'power2.in', overwrite: true });
    gsap.fromTo(poses[i], { opacity: 0, scale: .7, y: 70, rotation: prev < i ? 8 : -8 }, { opacity: 1, scale: 1, y: 0, rotation: 0, duration: 1, delay: .18, ease: 'back.out(1.6)', overwrite: true });
    var r = svcBubble.getBoundingClientRect();
    if (window.SKZ) setTimeout(function () { window.SKZ.burst(r.left + r.width * .5, r.top + r.height * .2, { count: 9, spread: 120 }); }, 200);
  }
  svcs[0] && svcs[0].classList.add('is-active');
  if (desktop && svcBubble) {
    svcs.forEach(function (s, i) {
      ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onToggle: function (self) { if (self.isActive) setStep(i); } });
      gsap.from(s.querySelectorAll('.svc-card > *'), { y: 24, opacity: 0, duration: .8, stagger: .05, ease: EASE, scrollTrigger: { trigger: s, start: 'top 75%' } });
    });
    gsap.fromTo(svcBubble, { scale: .5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'elastic.out(1, .5)', scrollTrigger: { trigger: '.svc-wrap', start: 'top 75%' } });
    gsap.from(poses[0], { y: 80, scale: .8, opacity: 0, duration: 1.1, ease: 'back.out(1.6)', delay: .2, scrollTrigger: { trigger: '.svc-wrap', start: 'top 75%' } });
    gsap.to('.svc-sticky', { y: -10, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  } else {
    // téléphone : chaque service a sa bulle, qui se gonfle à l'arrivée
    gsap.utils.toArray('.svc-mobile-visual').forEach(function (v) {
      gsap.from(v, { scale: .5, opacity: 0, duration: 1.3, ease: SPRING, scrollTrigger: { trigger: v, start: 'top 85%' } });
      gsap.from(v.querySelector('img'), { y: 50, scale: .8, opacity: 0, duration: 1, delay: .15, ease: 'back.out(1.6)', scrollTrigger: { trigger: v, start: 'top 85%' } });
    });
    svcs.forEach(function (s) {
      gsap.from(s.querySelectorAll('.svc-card > *'), { y: 24, opacity: 0, duration: .8, stagger: .05, ease: EASE, scrollTrigger: { trigger: s, start: 'top 65%' } });
    });
  }

  // =========================================================================
  // RÉALISATION : une bulle portant le fennec grandit jusqu'à remplir
  // l'écran, puis le site MM apparaît dedans
  // =========================================================================
  var pin = document.getElementById('workPin');
  var rider = document.getElementById('workRider');
  if (pin) {
    var riderFloat = gsap.to(rider, { y: -12, rotation: -4, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: desktop
        ? { trigger: pin, start: 'top top', end: '+=140%', pin: true, scrub: 1, anticipatePin: 1 }
        : { trigger: pin, start: 'top 85%', end: 'top 5%', scrub: 1 }
    });
    tl.fromTo('#workBubble', { scale: .06 }, { scale: 1, duration: 1, ease: 'power2.in' }, 0)
      .to(rider, { scale: 2.4, opacity: 0, duration: .55, ease: 'power1.in', onStart: function () { riderFloat.pause(); }, onReverseComplete: function () { riderFloat.resume(); } }, .1)
      .from('.case-copy > *', { y: 50, opacity: 0, duration: .4, stagger: .07, ease: 'power3.out' }, .75)
      .from('#caseBrowser', { y: 140, rotationX: 28, scale: .82, opacity: 0, duration: .6, ease: 'power3.out' }, .8)
      .from('#casePhone', { y: 220, rotation: 10, opacity: 0, duration: .6, ease: 'power3.out' }, .92);
    if (desktop) tl.to({}, { duration: .5 });
    gsap.to('#casePhone', { yPercent: -3, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to('#caseBrowser', { yPercent: -1.5, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    // Survol : l'iPhone se soulève, le navigateur recule légèrement
    if (fine) {
      var cv = document.querySelector('.case-visual');
      cv.addEventListener('pointerenter', function () {
        gsap.to('#caseBrowser', { scale: .98, duration: .6, ease: EASE });
        gsap.to('#casePhone .iphone-screen', { scale: 1.02, duration: .6, ease: EASE });
      });
      cv.addEventListener('pointerleave', function () {
        gsap.to('#caseBrowser', { scale: 1, duration: .8, ease: EASE });
        gsap.to('#casePhone .iphone-screen', { scale: 1, duration: .8, ease: EASE });
      });
    }
  }

  // =========================================================================
  // MÉTHODE : la ligne se remplit, chaque étape s'allume en bulle
  // =========================================================================
  var steps = gsap.utils.toArray('.step');
  var lit = steps.map(function () { return false; });
  var vertical = !desktop;
  gsap.to('#stepsFill', {
    scaleX: 1, scaleY: 1, ease: 'none',
    scrollTrigger: {
      trigger: '#steps', start: vertical ? 'top 70%' : 'top 75%', end: vertical ? 'bottom 60%' : 'top 30%', scrub: .5,
      onUpdate: function (self) {
        steps.forEach(function (s, i) {
          var on = self.progress >= (i / Math.max(1, steps.length - 1)) * .96 + .02;
          if (on !== lit[i]) {
            lit[i] = on;
            s.classList.toggle('is-on', on);
            if (on) {
              var r = s.querySelector('.step-dot').getBoundingClientRect();
              if (window.SKZ) window.SKZ.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 7, spread: 50, min: 4, max: 9 });
              gsap.fromTo(s.querySelector('.step-dot'), { scale: .6 }, { scale: 1, duration: .9, ease: 'elastic.out(1.2, .4)' });
            }
          }
        });
      }
    }
  });
  gsap.from('.step > :not(.step-dot)', { y: 26, opacity: 0, duration: .9, stagger: .06, ease: EASE, scrollTrigger: { trigger: '#steps', start: 'top 78%' } });
  gsap.from('.pledges li', { scale: .7, opacity: 0, duration: 1, stagger: .1, ease: 'back.out(2)', scrollTrigger: { trigger: '.pledges', start: 'top 90%' } });

  // =========================================================================
  // QUESTIONS
  // =========================================================================
  gsap.from('.qa', { y: 30, opacity: 0, scale: .97, duration: .9, stagger: .07, ease: EASE, scrollTrigger: { trigger: '.faq-list', start: 'top 85%' } });

  // =========================================================================
  // CONTACT : l'encart s'ouvre comme une bulle qui s'étire ; le fennec
  // saute dedans et regarde le bouton d'envoi
  // =========================================================================
  var panel = document.getElementById('contactPanel');
  if (panel) {
    gsap.fromTo(panel, { clipPath: 'inset(14% 10% 14% 10% round 240px)' }, { clipPath: 'inset(0% 0% 0% 0% round 32px)', ease: 'none', scrollTrigger: { trigger: panel, start: 'top 95%', end: 'top 35%', scrub: .6 } });
    gsap.from('.contact-copy > :not(img)', { y: 30, opacity: 0, duration: .9, stagger: .08, ease: EASE, scrollTrigger: { trigger: panel, start: 'top 60%' } });
    gsap.from('.form > *', { y: 24, opacity: 0, duration: .8, stagger: .06, ease: EASE, scrollTrigger: { trigger: panel, start: 'top 55%' } });
    gsap.from(contactMascot, { y: 120, scale: .6, opacity: 0, duration: 1.2, ease: 'back.out(1.7)', scrollTrigger: { trigger: panel, start: 'top 60%' } });
    // deux bulles dérivent dans l'encart
    [[.12, .62, 120], [.86, .12, 80]].forEach(function (p, i) {
      var s = document.createElement('div');
      s.className = 'soap'; s.setAttribute('aria-hidden', 'true');
      s.innerHTML = '<span class="soap-rim"></span><span class="soap-shine"></span>';
      s.style.cssText = 'width:' + p[2] + 'px;height:' + p[2] + 'px;left:' + (p[0] * 100) + '%;top:' + (p[1] * 100) + '%;opacity:.8;--soap-fill:rgba(255,255,255,.35)';
      panel.insertBefore(s, panel.firstChild);
      gsap.to(s, { y: -20, x: i ? -14 : 14, duration: 3.6 + i, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });
    var send = document.getElementById('sendBtn');
    if (fine && send && contactMascot) {
      send.addEventListener('pointerenter', function () { gsap.to(contactMascot, { rotation: 8, x: 8, duration: .6, ease: EASE }); });
      send.addEventListener('pointerleave', function () { gsap.to(contactMascot, { rotation: 0, x: 0, duration: .9, ease: 'elastic.out(1, .4)' }); });
    }
    form && form.querySelectorAll('input, textarea').forEach(function (f) {
      f.addEventListener('focus', function () { gsap.fromTo(contactMascot, { y: 0 }, { y: -10, duration: .18, yoyo: true, repeat: 1, ease: 'power2.out' }); });
    });
  }

  // =========================================================================
  // PIED DE PAGE : le fennec passe la tête, les lettres montent en bulles
  // =========================================================================
  gsap.to('#footerPeek', { yPercent: 22, duration: 1.2, ease: 'elastic.out(1, .5)', scrollTrigger: { trigger: '#footer', start: 'top 92%', toggleActions: 'play none none reverse' } });
  var footer = document.getElementById('footer');
  if (fine && footer) {
    footer.addEventListener('pointerenter', function () { gsap.to('#footerPeek', { yPercent: 2, duration: .6, ease: 'back.out(2)' }); });
    footer.addEventListener('pointerleave', function () { gsap.to('#footerPeek', { yPercent: 22, duration: .8, ease: EASE }); });
  }
  gsap.from('#footerWord > *', { yPercent: 110, scaleY: 1.3, rotation: 6, duration: 1.2, stagger: .07, ease: 'back.out(1.6)', scrollTrigger: { trigger: '#footerWord', start: 'top 95%' } });
  gsap.from('.footer-top > *', { y: 20, opacity: 0, duration: .8, stagger: .1, ease: EASE, scrollTrigger: { trigger: '#footer', start: 'top 85%' } });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
