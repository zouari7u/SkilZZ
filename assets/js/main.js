/* ==========================================================================
   ZkilZ — scènes et animations de défilement (GSAP + ScrollTrigger + Lenis)
   Chaque section a son entrée, et quelque chose bouge doucement en
   continu : graduations qui tournent, eau qui ondule, oiseau qui
   respire. Tout s'arrête avec « réduire les animations ».
   ========================================================================== */
(function () {
  'use strict';
  if (!(window.gsap && window.ScrollTrigger)) return;
  gsap.registerPlugin(ScrollTrigger);
  if (window.DrawSVGPlugin) gsap.registerPlugin(DrawSVGPlugin);
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
  // Défilement vers un élément (utilisé aussi par l'agent)
  window.skzScrollTo = function (el) {
    if (lenis) lenis.scrollTo(el, { offset: el.id === 'top' ? 0 : -96, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };
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
  // Message envoyé : l'oiseau du contact monte d'un coup d'aile
  function contactHop() {
    if (reduce) return;
    var b = document.getElementById('contactBird');
    if (b) gsap.timeline()
      .to(b, { y: -70, x: 30, rotation: -8, duration: .45, ease: 'power2.out' })
      .to(b, { y: 0, x: 0, rotation: 0, duration: 1, ease: 'elastic.out(1, .5)' });
    if (window.SKZBird) window.SKZBird.celebrate();
  }
  // il plane doucement en attendant
  var cb = document.getElementById('contactBird');
  if (cb && !reduce) gsap.to(cb, { yPercent: -6, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
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
    document.querySelectorAll('.dev--site').forEach(function (d) { d.classList.add('is-on'); });
    document.querySelectorAll('.step').forEach(function (s) { s.classList.add('is-on'); });
    gsap.set('.work-bubble', { scale: 1 });
    gsap.set('.work-rider', { opacity: 0 });
    return;
  }

  // --- Découpage des titres en mots --------------------------------------------
  document.querySelectorAll('h2.split').forEach(function (h) {
    h.innerHTML = h.textContent.trim().split(/[ \t\n\r]+/).map(function (w) { return '<span class="wm"><span class="wi">' + w + '</span></span>'; }).join(' ');
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
    .from('.ascent-sky', { scale: .85, opacity: 0, transformOrigin: '250px 250px', duration: 1.4, ease: EASE }, .2)
    .from('.ascent-ticks', { opacity: 0, duration: 1.2 }, .5)
    .from('.ascent-water path', { opacity: 0, x: -30, duration: 1.2, stagger: .15, ease: EASE }, .4)
    .from('.ascent-reed, .ascent-leaf', { scaleY: 0, transformOrigin: '110px 476px', duration: .9, ease: 'back.out(1.6)' }, .7)
    .fromTo('.ascent-guide', { strokeDashoffset: 600 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.out' }, .9)
    .from('.milestone', { scale: 0, transformOrigin: 'center', transformBox: 'fill-box', duration: .6, stagger: .15, ease: 'back.out(2.4)' }, 1.1)
    .from('.ms', { y: 12, opacity: 0, scale: .9, duration: .6, stagger: .12, ease: 'back.out(2)' }, 1.3);

  // L'eau ondule au pied du roseau
  gsap.timeline({ repeat: -1, repeatDelay: .4 })
    .fromTo('.ripple', { scale: .4, opacity: .7 }, { scale: 2.2, opacity: 0, duration: 2.4, stagger: 1.1, ease: 'power2.out' });
  gsap.to('.ascent-water path', { x: -20, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: .6 });

  // Jalons : suivent un peu la souris
  var stage = document.getElementById('heroStage');
  if (fine && stage) {
    var mss = Array.prototype.map.call(stage.querySelectorAll('.ms'), function (el, i) {
      return { d: 1 + i * .4, x: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3' }) };
    });
    window.addEventListener('pointermove', function (e) {
      var nx = e.clientX / window.innerWidth - .5;
      mss.forEach(function (c) { c.x(nx * 14 * c.d); });
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
  // TITRES DE SECTION : les mots montent dans leurs masques arrondis
  // =========================================================================
  document.querySelectorAll('.head').forEach(function (h) {
    var tl = gsap.timeline({ scrollTrigger: { trigger: h, start: 'top 85%' } });
    tl.from(h.querySelector('.label'), { y: 14, opacity: 0, duration: .7, ease: EASE })
      .from(h.querySelectorAll('.wi'), { yPercent: 115, rotation: 4, duration: 1, stagger: .06, ease: EASE }, .1);
  });

  // =========================================================================
  // SERVICES : les cartes défilent ; à droite, l'écran du service en cours
  // reste à l'écran, change de forme, s'anime, et l'oiseau se pose dessus
  // =========================================================================
  var svcs = gsap.utils.toArray('.svc');
  var stage = document.getElementById('svcStage');
  var devs = gsap.utils.toArray('.dev');
  var rollB = document.querySelectorAll('#stageRoll b');
  var svcIdx = -1, svcLive = false, devLoops = [];
  function bird() { return window.SKZBird; }

  // ce qui bouge dans chaque écran (en boucle tant qu'il est affiché)
  function siteLoop(d) {
    var tl = gsap.timeline({ repeat: -1, repeatDelay: .6, paused: true });
    tl.fromTo(d.querySelectorAll('.ds-nav > *, .ds-hero > *, .ds-cards span'), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .06, ease: 'back.out(1.8)' })
      .fromTo(d.querySelector('.ds-cursor'), { x: 60, y: 40, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: .8, ease: 'power3.inOut' }, '+=.2')
      .to(d.querySelector('.ds-cursor'), { left: '22%', top: '47%', duration: .7, ease: 'power3.inOut' })
      .to(d.querySelector('.ds-cursor'), { scale: .7, duration: .1, yoyo: true, repeat: 1 })
      .to(d.querySelector('.ds-btn'), { scale: .92, duration: .1, yoyo: true, repeat: 1 }, '<')
      .to(d.querySelector('.ds-btn'), { backgroundColor: '#0B3BA8', duration: .2 }, '<')
      .to({}, { duration: 1.6 })
      .to(d.querySelector('.ds-cursor'), { opacity: 0, duration: .3 })
      .set(d.querySelector('.ds-cursor'), { left: '70%', top: '70%' })
      .set(d.querySelector('.ds-btn'), { clearProps: 'backgroundColor' });
    return tl;
  }
  function appLoop(d) {
    var line = d.querySelector('.da-line'), area = d.querySelector('.da-area'), num = d.querySelector('#appNum'), o = { v: 1100 };
    var tl = gsap.timeline({ repeat: -1, repeatDelay: .8, paused: true });
    tl.fromTo(line, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.4, ease: 'power2.inOut' })
      .fromTo(area, { opacity: 0 }, { opacity: 1, duration: .8 }, '-=.8')
      .fromTo(o, { v: 1100 }, { v: 1284, duration: 1.4, ease: 'power2.out', onUpdate: function () { num.textContent = Math.round(o.v).toLocaleString('fr-FR'); } }, 0)
      .fromTo(d.querySelectorAll('.da-rows span'), { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: .5, stagger: .1, ease: 'back.out(1.7)' }, .3)
      .fromTo(d.querySelector('.da-toast'), { y: -30, opacity: 0, scale: .9 }, { y: 0, opacity: 1, scale: 1, duration: .5, ease: 'back.out(2)' }, '+=.4')
      .to(d.querySelector('.da-toast'), { y: -30, opacity: 0, duration: .4, ease: 'power2.in' }, '+=1.4');
    return tl;
  }
  function reelLoop(d) {
    var likes = d.querySelector('#reelLikes'), o = { v: 2.4 };
    var tl = gsap.timeline({ repeat: -1, paused: true });
    tl.fromTo(d.querySelector('.dr-bar i'), { scaleX: 0 }, { scaleX: 1, duration: 5, ease: 'none' }, 0)
      .fromTo(d.querySelectorAll('.dr-wave'), { scale: .8, opacity: .8 }, { scale: 1.8, opacity: 0, duration: 1.6, stagger: .8, repeat: 2, ease: 'power2.out' }, 0)
      .to(d.querySelector('.dr-heart'), { scale: 1.35, duration: .12, yoyo: true, repeat: 1, ease: 'power2.out' }, 1.6)
      .fromTo(o, { v: 2.4 }, { v: 2.9, duration: 3, ease: 'power1.inOut', onUpdate: function () { likes.textContent = o.v.toFixed(1).replace('.', ',') + ' k'; } }, 1.6)
      .to(d.querySelector('.dr-heart'), { scale: 1.35, duration: .12, yoyo: true, repeat: 1, ease: 'power2.out' }, 3.4);
    return tl;
  }

  function setSvc(i) {
    if (i === svcIdx) return;
    var prev = svcIdx; svcIdx = i;
    svcs.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
    if (!stage) return;
    rollB.forEach(function (b) { b.style.transform = 'translateY(' + (-i * 100) + '%)'; });
    var t = svcs[i].dataset.tone;
    stage.classList.toggle('is-navy', t === 'navy');
    stage.classList.toggle('is-sky', t === 'sky');
    var dir = prev < 0 ? 1 : (i > prev ? 1 : -1);
    if (prev >= 0) {
      devLoops[prev].pause();
      gsap.to(devs[prev], { yPercent: -18 * dir, rotation: -6 * dir, scale: .85, opacity: 0, duration: .45, ease: 'power2.in', overwrite: true, onComplete: function () { devs[prev].classList.remove('is-on'); } });
    }
    devs[i].classList.add('is-on');
    gsap.fromTo(devs[i], { yPercent: 22 * dir, rotation: 6 * dir, scale: .82, opacity: 0 }, { yPercent: 0, rotation: 0, scale: 1, opacity: 1, duration: .9, delay: prev >= 0 ? .18 : 0, ease: 'elastic.out(1, .65)', overwrite: true });
    devLoops[i].restart();
    // l'oiseau quitte l'ancien écran et se pose sur le nouveau
    if (svcLive && bird()) setTimeout(function () { if (svcLive) bird().perch(devs[i].querySelector('.perch-pt'), { lock: true }); }, prev >= 0 ? 380 : 0);
  }

  if (desktop && stage) {
    devLoops = [siteLoop(devs[0]), appLoop(devs[1]), reelLoop(devs[2])];
    gsap.set(devs, { opacity: 0 });
    svcs.forEach(function (s, i) {
      ScrollTrigger.create({ trigger: s, start: 'top 58%', end: 'bottom 58%', onToggle: function (self) { if (self.isActive) setSvc(i); } });
      gsap.from(s.querySelectorAll('.svc-card > *'), { y: 26, opacity: 0, duration: .8, stagger: .06, ease: EASE, scrollTrigger: { trigger: s, start: 'top 78%' } });
    });
    // l'oiseau reste sur la scène tant qu'elle est à l'écran
    ScrollTrigger.create({
      trigger: '.svc-wrap', start: 'top 45%', end: 'bottom 70%',
      onToggle: function (self) {
        svcLive = self.isActive;
        if (!bird()) return;
        if (svcLive) { if (svcIdx < 0) setSvc(0); bird().perch(devs[svcIdx].querySelector('.perch-pt'), { lock: true }); }
        else bird().unlock();
      }
    });
    gsap.from('.stage-ring', { scale: .6, opacity: 0, duration: 1.2, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.svc-wrap', start: 'top 75%', onEnter: function () { if (svcIdx < 0) setSvc(0); } } });
  } else {
    svcs.forEach(function (s) {
      s.classList.add('is-active');
      gsap.from(s.querySelectorAll('.svc-card > *'), { y: 24, opacity: 0, duration: .8, stagger: .05, ease: EASE, scrollTrigger: { trigger: s, start: 'top 80%' } });
      gsap.from(s.querySelector('.svc-art img'), { y: 40, rotation: -6, opacity: 0, duration: 1.2, ease: 'back.out(1.6)', scrollTrigger: { trigger: s, start: 'top 85%' } });
    });
  }

  // =========================================================================
  // RÉALISATION : une bulle portant le fennec grandit jusqu'à remplir
  // l'écran, puis le site MM apparaît dedans
  // =========================================================================
  var pin = document.getElementById('workPin');
  var rider = document.getElementById('workRider');
  if (pin) {
    var riderFloat = gsap.to(rider, { y: -10, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    var splash = document.createElement('span'); splash.className = 'work-ripple'; pin.appendChild(splash);
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: desktop
        ? { trigger: pin, start: 'top top', end: '+=140%', pin: true, scrub: 1, anticipatePin: 1 }
        : { trigger: pin, start: 'top 85%', end: 'top 5%', scrub: 1 }
    });
    tl.fromTo('#workBubble', { scale: .06 }, { scale: 1, duration: 1, ease: 'power2.in' }, 0)
      // il pique vers le centre, bec en avant, et disparaît dans l'eau
      .to(rider, { y: 150, scale: .85, duration: .28, ease: 'power2.in', onStart: function () { riderFloat.pause(); }, onReverseComplete: function () { riderFloat.resume(); } }, 0)
      .to(rider, { opacity: 0, duration: .06 }, .27)
      .fromTo(splash, { scale: .3, opacity: .9 }, { scale: 2.6, opacity: 0, duration: .3, ease: 'power2.out' }, .27)
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
            if (on && !s.dataset.rang) {
              // une seule onde, la première fois que l'étape s'allume
              s.dataset.rang = '1';
              var dot = s.querySelector('.step-dot');
              var ring = document.createElement('span');
              ring.className = 'step-ring';
              dot.appendChild(ring);
              gsap.fromTo(ring, { scale: 1, opacity: .7 }, { scale: 3.2, opacity: 0, duration: 1.1, ease: 'power2.out', onComplete: function () { ring.remove(); } });
              gsap.fromTo(dot, { scale: .6 }, { scale: 1, duration: .9, ease: 'elastic.out(1.2, .4)' });
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
    // deux bulles dérivent dans l'encart
    [[.12, .62, 120], [.86, .12, 80]].forEach(function (p, i) {
      var s = document.createElement('div');
      s.className = 'soap'; s.setAttribute('aria-hidden', 'true');
      s.innerHTML = '<span class="soap-rim"></span><span class="soap-shine"></span>';
      s.style.cssText = 'width:' + p[2] + 'px;height:' + p[2] + 'px;left:' + (p[0] * 100) + '%;top:' + (p[1] * 100) + '%;opacity:.8;--soap-fill:rgba(255,255,255,.35)';
      panel.insertBefore(s, panel.firstChild);
      gsap.to(s, { y: -20, x: i ? -14 : 14, duration: 3.6 + i, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });
  }

  // =========================================================================
  // PIED DE PAGE : le fennec passe la tête, les lettres montent en bulles
  // =========================================================================
  gsap.from('#footerWord > *', { yPercent: 110, scaleY: 1.3, rotation: 6, duration: 1.2, stagger: .07, ease: 'back.out(1.6)', scrollTrigger: { trigger: '#footerWord', start: 'top 95%' } });
  gsap.from('.footer-top > *', { y: 20, opacity: 0, duration: .8, stagger: .1, ease: EASE, scrollTrigger: { trigger: '#footer', start: 'top 85%' } });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
