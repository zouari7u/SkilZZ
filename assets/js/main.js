/* ==========================================================================
   SkilZZ — animations (GSAP + ScrollTrigger + Lenis)
   Règles : une entrée par section, courbes en sortie douce (pas de rebond
   sur l'interface), rien n'apparaît depuis l'échelle 0, tout respecte
   « mouvement réduit ».
   ========================================================================== */
(function () {
  'use strict';
  if (!(window.gsap && window.ScrollTrigger)) return;
  gsap.registerPlugin(ScrollTrigger);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var EASE = 'expo.out';

  // --- Défilement doux -------------------------------------------------------
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
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
      if (lenis) lenis.scrollTo(el, { offset: id === '#top' ? 0 : -96, duration: 1.2 });
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
        gsap.to(body, { height: 0, duration: .28, ease: 'power3.out', onComplete: function () { d.open = false; gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
      } else {
        d.open = true;
        gsap.from(body, { height: 0, duration: .34, ease: 'power3.out', onComplete: function () { gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
      }
    });
  });

  // --- Formulaire ------------------------------------------------------------
  var form = document.getElementById('contactForm');
  if (form) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { status.textContent = 'Indiquez votre nom et une adresse email valide.'; return; }
      var data = new FormData(form);
      var endpoint = form.dataset.endpoint, email = form.dataset.email;
      if (endpoint) {
        status.textContent = 'Envoi en cours…';
        fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function (r) { if (!r.ok) throw new Error(); status.textContent = 'Message envoyé. Le studio vous répond rapidement.'; form.reset(); if (window.skzCheer) window.skzCheer(); })
          .catch(function () { status.textContent = "L'envoi a échoué. Réessayez dans un instant."; });
      } else if (email) {
        var body = 'Nom : ' + data.get('name') + '\nEmail : ' + data.get('email') + '\nProjet : ' + data.getAll('type').join(', ') + '\n\n' + (data.get('message') || '');
        window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Projet — ' + data.get('name')) + '&body=' + encodeURIComponent(body);
      } else {
        status.textContent = "Le formulaire n'est pas encore relié à une adresse d'envoi.";
      }
    });
  }

  if (reduce) return;

  // --- Entrée du hero --------------------------------------------------------
  gsap.timeline({ defaults: { ease: EASE } })
    .from('#nav', { y: -24, opacity: 0, duration: .7, clearProps: 'transform,opacity' })
    .from('#heroTitle .w', { yPercent: 60, opacity: 0, duration: .9, stagger: .045 }, '-=.45')
    .from('[data-enter]', { y: 16, opacity: 0, duration: .8, stagger: .07 }, '-=.75')
    .from('.stage-disc', { scale: .9, opacity: 0, duration: 1 }, '-=1')
    .from('#heroMascot .mascot-img:not(.is-alt)', { y: 50, opacity: 0, duration: 1 }, '-=.85')
    .from('.chip', { y: 12, opacity: 0, scale: .95, duration: .6, stagger: .08 }, '-=.6');

  // Pastilles : légère parallaxe à la souris
  var stage = document.getElementById('heroStage');
  if (finePointer && stage) {
    var chips = Array.prototype.map.call(stage.querySelectorAll('.chip'), function (el) {
      return { d: parseFloat(el.dataset.depth) || 1, x: gsap.quickTo(el, 'x', { duration: .8, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: .8, ease: 'power3' }) };
    });
    window.addEventListener('pointermove', function (e) {
      var nx = e.clientX / window.innerWidth - .5, ny = e.clientY / window.innerHeight - .5;
      chips.forEach(function (c) { c.x(nx * 18 * c.d); c.y(ny * 14 * c.d); });
    }, { passive: true });
  }

  // --- Bulles de savon -------------------------------------------------------
  var field = document.getElementById('bubbles');
  var COLORS = ['#1F6BFF', '#0FA97A', '#8FB6FF'];
  function spawn(first) {
    var b = document.createElement('span');
    b.className = 'bub';
    var s = 18 + Math.random() * 46;
    b.style.width = b.style.height = s + 'px';
    b.style.left = (Math.random() * 92) + '%';
    field.appendChild(b);
    var H = field.offsetHeight;
    var from = first ? Math.random() * H : H;
    var rise = gsap.fromTo(b, { y: from, opacity: 0 }, {
      y: -s, opacity: 1, duration: (14 + Math.random() * 10) * (from / H + .15), ease: 'none',
      onComplete: function () { b.remove(); spawn(false); }
    });
    var sway = gsap.to(b, { x: (Math.random() - .5) * 50, duration: 3 + Math.random() * 2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    b.addEventListener('pointerdown', function () {
      rise.kill(); sway.kill();
      var r = b.getBoundingClientRect(), f = field.getBoundingClientRect();
      var cx = r.left - f.left + r.width / 2, cy = r.top - f.top + r.height / 2;
      gsap.to(b, { scale: 1.3, opacity: 0, duration: .14, ease: 'power2.out', onComplete: function () { b.remove(); } });
      for (var i = 0; i < 6; i++) {
        var p = document.createElement('span');
        p.className = 'pop';
        p.style.left = cx + 'px'; p.style.top = cy + 'px'; p.style.background = COLORS[i % 3];
        field.appendChild(p);
        var a = i / 6 * Math.PI * 2;
        gsap.to(p, { x: Math.cos(a) * (18 + r.width / 2), y: Math.sin(a) * (18 + r.width / 2), opacity: 0, duration: .45, ease: 'power3.out', onComplete: (function (el) { return function () { el.remove(); }; })(p) });
      }
      setTimeout(function () { spawn(false); }, 1800);
    }, { once: true });
  }
  if (field) for (var i = 0; i < (window.innerWidth < 640 ? 4 : 7); i++) spawn(true);

  // --- Curseur ---------------------------------------------------------------
  if (finePointer) {
    var cur = document.getElementById('cursor');
    var cx = gsap.quickTo(cur, 'x', { duration: .25, ease: 'power3' });
    var cy = gsap.quickTo(cur, 'y', { duration: .25, ease: 'power3' });
    window.addEventListener('pointermove', function (e) { cur.classList.add('is-on'); cx(e.clientX); cy(e.clientY); }, { passive: true });
    document.documentElement.addEventListener('mouseleave', function () { cur.classList.remove('is-on'); });
    document.addEventListener('pointerover', function (e) {
      cur.classList.toggle('is-over', !!e.target.closest('a, button, summary, label, .bub, #heroMascot'));
    });
  }

  // --- Pourquoi un fennec : les mots s'allument ------------------------------
  var why = document.getElementById('whyText');
  if (why) {
    why.innerHTML = why.innerHTML.trim().split(/\s+/).map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    gsap.to(why.querySelectorAll('.w'), { opacity: 1, stagger: .06, ease: 'none', scrollTrigger: { trigger: why, start: 'top 82%', end: 'bottom 55%', scrub: .4 } });
    gsap.from('.why-portrait', { scale: .92, opacity: 0, duration: .9, ease: EASE, scrollTrigger: { trigger: '.why', start: 'top 78%' } });
  }

  // --- Titres de section -----------------------------------------------------
  gsap.utils.toArray('.head').forEach(function (h) {
    gsap.from(h.children, { y: 18, opacity: 0, duration: .8, stagger: .07, ease: EASE, scrollTrigger: { trigger: h, start: 'top 85%' } });
  });

  // --- Services : cartes empilées, la précédente recule ----------------------
  var cards = gsap.utils.toArray('.svc');
  cards.forEach(function (card, i) {
    gsap.from(card.querySelector('.svc-visual img'), { y: 36, opacity: 0, scale: .94, duration: .9, ease: EASE, scrollTrigger: { trigger: card, start: 'top 75%' } });
    if (i < cards.length - 1) {
      gsap.to(card, { scale: .94, ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 104px', scrub: true } });
    }
  });

  // --- Réalisation -----------------------------------------------------------
  gsap.from('#case', { y: 48, opacity: 0, duration: 1, ease: EASE, scrollTrigger: { trigger: '#case', start: 'top 85%' } });
  if (window.innerWidth > 980) {
    gsap.utils.toArray('[data-parallax]').forEach(function (el) {
      var d = parseFloat(el.dataset.parallax);
      gsap.fromTo(el, { y: d }, { y: -d, ease: 'none', scrollTrigger: { trigger: '#case', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  // --- Méthode : la ligne se remplit, les étapes suivent ---------------------
  gsap.to('#stepsFill', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 80%', end: 'top 35%', scrub: .4 } });
  gsap.from('.step', { y: 22, opacity: 0, duration: .8, stagger: .1, ease: EASE, scrollTrigger: { trigger: '#steps', start: 'top 80%' } });
  gsap.from('.pledges li', { y: 12, opacity: 0, duration: .6, stagger: .07, ease: EASE, scrollTrigger: { trigger: '.pledges', start: 'top 90%' } });

  // --- Questions, contact ----------------------------------------------------
  gsap.from('.qa', { y: 14, opacity: 0, duration: .6, stagger: .05, ease: EASE, scrollTrigger: { trigger: '.faq-list', start: 'top 85%' } });
  gsap.from('.contact-panel', { y: 40, opacity: 0, duration: 1, ease: EASE, scrollTrigger: { trigger: '.contact-panel', start: 'top 85%' } });
  gsap.from('.contact-mascot', { y: 24, scale: .9, opacity: 0, duration: .9, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.contact-panel', start: 'top 70%' } });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
