/* ==========================================================================
   ZkilZ — scènes complémentaires
   · fond : la trame et les halos dérivent lentement et suivent la souris ;
   · « visible » : les lettres se soulèvent à l'approche du curseur, la
     bulle s'allume et laisse échapper de petites bulles ; clic = vague ;
   · encarts « Inclus » : chaque encart a sa petite animation, jouée
     seulement quand il est à l'écran ;
   · le fennec qui montre la suite ; les lettres géantes du pied de page.
   ========================================================================== */
(function () {
  'use strict';
  if (!(window.gsap && window.ScrollTrigger)) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var SKZ = window.SKZ || {};

  // Joue une boucle seulement quand son élément est visible
  function whenVisible(el, tl) {
    ScrollTrigger.create({ trigger: el, start: 'top 95%', end: 'bottom 5%', onToggle: function (s) { s.isActive ? tl.play() : tl.pause(); } });
  }

  // Découpe un élément en lettres
  function letters(el) {
    var txt = el.textContent;
    el.setAttribute('aria-label', txt);
    el.innerHTML = txt.split('').map(function (c) { return '<span class="ch" aria-hidden="true">' + c + '</span>'; }).join('');
    return Array.prototype.slice.call(el.querySelectorAll('.ch'));
  }

  // Effet de proximité : chaque lettre réagit à la distance du curseur
  function proximity(chars, opts) {
    var setters = chars.map(function (c) {
      var sx = gsap.quickTo(c, 'scaleX', { duration: .5, ease: 'power3' }), sy = gsap.quickTo(c, 'scaleY', { duration: .5, ease: 'power3' });
      return { el: c, y: gsap.quickTo(c, 'y', { duration: .5, ease: 'power3' }), s: function (v) { sx(v); sy(v); }, r: gsap.quickTo(c, 'rotation', { duration: .5, ease: 'power3' }) };
    });
    var active = false;
    window.addEventListener('pointermove', function (e) {
      var any = false;
      setters.forEach(function (st) {
        var b = st.el.getBoundingClientRect();
        var cx = b.left + b.width / 2, cy = b.top + b.height / 2;
        var d = Math.hypot(e.clientX - cx, e.clientY - cy);
        var f = Math.max(0, 1 - d / opts.radius);
        f = f * f * (3 - 2 * f);
        if (f > 0) any = true;
        st.y(-f * opts.lift);
        st.s(1 + f * opts.scale);
        st.r((e.clientX < cx ? 1 : -1) * f * opts.tilt);
      });
      if (opts.onNear) opts.onNear(any);
      active = any;
    }, { passive: true });
  }

  // =========================================================================
  // ORBITES : légère parallaxe à la souris
  // =========================================================================
  var orbits = document.querySelectorAll('.orbit');
  if (orbits.length && fine && !reduce) {
    // la rotation est en CSS (transform) ; la parallaxe passe par « translate »
    var oraf = 0, onx = 0, ony = 0;
    window.addEventListener('pointermove', function (e) {
      onx = e.clientX / window.innerWidth - .5; ony = e.clientY / window.innerHeight - .5;
      if (oraf) return;
      oraf = requestAnimationFrame(function () {
        oraf = 0;
        orbits.forEach(function (o, i) { var k = (i + 1) * 14; gsap.to(o, { '--ox': (-onx * k) + 'px', '--oy': (-ony * k) + 'px', duration: 1.4, ease: 'power3', overwrite: 'auto' }); });
      });
    }, { passive: true });
  }

  // =========================================================================
  // « VISIBLE »
  // =========================================================================
  var mark = document.getElementById('heroMark');
  if (mark) {
    var chars = letters(mark);
    if (!reduce) {
      var lastBub = 0;
      if (fine) {
        proximity(chars, {
          radius: 190, lift: 14, scale: .16, tilt: 7,
          onNear: function (near) {
            gsap.to(mark, { '--glow': near ? 1 : 0, '--mark': near ? 1.04 : 1, duration: .5, ease: 'power3.out', overwrite: 'auto' });
            var now = performance.now();
            if (near && now - lastBub > 240 && SKZ.burst) {
              lastBub = now;
              var r = mark.getBoundingClientRect();
              SKZ.burst(r.left + r.width * (.15 + Math.random() * .7), r.top + 4, { count: 1, spread: 26, min: 6, max: 12 });
            }
          }
        });
      }
      // clic (ou toucher) : vague sur les lettres + bulles
      mark.addEventListener('click', function () {
        gsap.timeline()
          .to(chars, { y: -22, scaleY: 1.12, rotation: function (i) { return i % 2 ? 6 : -6; }, duration: .22, stagger: .045, ease: 'power2.out' })
          .to(chars, { y: 0, scaleY: 1, rotation: 0, duration: .9, stagger: .045, ease: 'elastic.out(1, .35)' }, .2);
        if (SKZ.jelly) SKZ.jelly(mark);
        var r = mark.getBoundingClientRect();
        if (SKZ.burst) SKZ.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 14, spread: 140 });
      });
      // une petite ondulation d'invitation, de temps en temps
      var wave = gsap.timeline({ repeat: -1, repeatDelay: 6, delay: 3.2 })
        .to(chars, { y: -8, duration: .25, stagger: .05, ease: 'power2.out' })
        .to(chars, { y: 0, duration: .7, stagger: .05, ease: 'elastic.out(1, .4)' }, .2);
      if (window.SKZ && SKZ.onScreen) SKZ.onScreen(mark, [wave]);
    }
  }

  // =========================================================================
  // PIED DE PAGE : lettres géantes sensibles au curseur
  // =========================================================================
  var word = document.getElementById('footerWord');
  if (word && fine && !reduce) {
    proximity(Array.prototype.slice.call(word.children), { radius: 240, lift: 22, scale: .06, tilt: 4 });
  }

  // =========================================================================
  // LE FENNEC QUI MONTRE LA SUITE
  // =========================================================================
  var cue = document.getElementById('scrollCue');
  if (cue && !reduce) {
    var img = cue.querySelector('img');
    gsap.from(cue, { y: 80, opacity: 0, duration: 1, delay: 2.2, ease: 'back.out(1.6)' });
    gsap.to(img, { y: 8, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to(cue, { opacity: 0, y: 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '25% top', scrub: true } });
    if (fine) cue.addEventListener('pointerenter', function () { SKZ.jelly && SKZ.jelly(img, 1.2); });
  }

  // =========================================================================
  // ENCARTS « INCLUS DANS CHAQUE PROJET »
  // =========================================================================
  var cells = gsap.utils.toArray('.cell');
  if (!reduce && cells.length) {
    // entrée en CSS (classe « is-in ») : rien ne peut la laisser à mi-chemin
    var bento = document.querySelector('.bento');
    cells.forEach(function (c, i) { c.style.setProperty('--i', i); });
    bento.classList.add('is-wait');
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es, o) {
      if (es[0].isIntersecting) { bento.classList.add('is-in'); o.disconnect(); }
    }, { threshold: .15 }).observe(bento);
    else bento.classList.add('is-in');
  }

  // 1. Jauge de vitesse
  var gauge = document.querySelector('.gauge');
  if (gauge && !reduce) {
    var gtl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.6 })
      .fromTo(gauge.querySelector('.gauge-fill'), { strokeDashoffset: 314 }, { strokeDashoffset: 22, duration: 1.4, ease: 'power3.out' })
      .fromTo(gauge.querySelector('.gauge-dot'), { scale: .6 }, { scale: 1, duration: .9, ease: 'elastic.out(1.2, .4)' }, .9)
      .to(gauge.querySelector('.gauge-fill'), { strokeDashoffset: 314, duration: .6, ease: 'power2.in' }, '+=1.6')
      .to(gauge.querySelector('.gauge-dot'), { scale: .6, duration: .4 }, '<');
    whenVisible(gauge, gtl);
  }

  // 2. Un même écran qui passe de l'ordinateur au téléphone
  var morph = document.getElementById('morph');
  if (morph && !reduce) {
    var labels = morph.parentElement.querySelectorAll('.morph-labels span');
    var row = morph.querySelector('.morph-row');
    function lab(i) { return function () { labels.forEach(function (l, k) { l.classList.toggle('is-on', k === i); }); if (SKZ.jelly) SKZ.jelly(labels[i], .6); }; }
    var mtl = gsap.timeline({ paused: true, repeat: -1, defaults: { duration: .9, ease: 'expo.inOut' } })
      .to(morph, { width: 200, height: 160, borderRadius: 18 }, 1.4).add(lab(1), 1.6)
      .to(morph, { width: 100, height: 178, borderRadius: 22 }, 3.6).add(lab(2), 3.8)
      .to(row, { gridTemplateColumns: '1fr', height: '38%' }, 3.6)
      .to(morph, { width: 300, height: 150, borderRadius: 14 }, 5.8).add(lab(0), 6)
      .to(row, { gridTemplateColumns: '1fr 1fr 1fr', height: '26%' }, 5.8)
      .to({}, { duration: .8 });
    whenVisible(morph, mtl);
  }

  // 3. Bulles qui pétillent ; survolées, elles éclatent
  var fizz = document.getElementById('fizz');
  if (fizz && !reduce) {
    var running = false;
    function spawn() {
      if (!running) return;
      var b = document.createElement('span');
      b.className = 'bub';
      var s = 14 + Math.random() * 34;
      b.style.width = b.style.height = s + 'px';
      fizz.appendChild(b);
      var W = fizz.offsetWidth, H = fizz.offsetHeight;
      var x0 = Math.random() * (W - s);
      gsap.set(b, { x: x0, y: H });
      var t = gsap.to(b, { y: -s, duration: 4 + Math.random() * 4, ease: 'none', onComplete: function () { b.remove(); } });
      gsap.to(b, { x: x0 + (Math.random() - .5) * 40, duration: 1.6 + Math.random(), ease: 'sine.inOut', yoyo: true, repeat: -1 });
      function burst() {
        t.kill(); gsap.killTweensOf(b);
        var r = b.getBoundingClientRect();
        if (SKZ.pop) SKZ.pop(r.left + r.width / 2, r.top + r.height / 2, r.width);
        gsap.to(b, { scale: 1.35, opacity: 0, duration: .12, onComplete: function () { b.remove(); } });
      }
      b.addEventListener(fine ? 'pointerenter' : 'pointerdown', burst, { once: true });
    }
    var fizzTimer = null;
    ScrollTrigger.create({ trigger: fizz, start: 'top 95%', end: 'bottom 5%', onToggle: function (s) {
      running = s.isActive;
      clearInterval(fizzTimer);
      if (running) { spawn(); fizzTimer = setInterval(spawn, 420); }
    } });
  }

  // 4. Recherche qui s'écrit, résultat qui apparaît
  var stext = document.getElementById('searchText');
  var result = document.getElementById('searchResult');
  if (stext && !reduce) {
    var q = 'outil de réservation';
    var obj = { n: 0 };
    var stl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: .6 })
      .to(obj, { n: q.length, duration: 1.4, ease: 'none', onUpdate: function () { stext.textContent = q.slice(0, Math.round(obj.n)); } })
      .fromTo(result, { y: 14, opacity: 0, scale: .96 }, { y: 0, opacity: 1, scale: 1, duration: .7, ease: 'back.out(1.8)' }, '+=.3')
      .to(result, { opacity: 0, y: 8, duration: .4, ease: 'power2.in' }, '+=2.2')
      .to(obj, { n: 0, duration: .6, ease: 'none', onUpdate: function () { stext.textContent = q.slice(0, Math.round(obj.n)); } }, '<');
    whenVisible(stext, stl);
  } else if (stext) { stext.textContent = 'outil de réservation'; }

  // 5. Back-office : le titre se réécrit, puis on publie
  var etext = document.getElementById('editorText');
  var sw = document.getElementById('editorSwitch');
  if (etext && !reduce) {
    var titles = ['Nouvelle collection', 'Soldes d’été', 'Ouvert le dimanche'];
    var ei = 0, eo = { n: titles[0].length };
    function typeTo(next) {
      return gsap.timeline()
        .to(eo, { n: 0, duration: .5, ease: 'none', onUpdate: function () { etext.textContent = titles[ei].slice(0, Math.round(eo.n)); } })
        .add(function () { ei = next; })
        .to(eo, { n: function () { return titles[next].length; }, duration: .9, ease: 'none', onUpdate: function () { etext.textContent = titles[ei].slice(0, Math.round(eo.n)); } });
    }
    var etl = gsap.timeline({ paused: true, repeat: -1 });
    [1, 2, 0].forEach(function (n) {
      etl.add(function () { sw.classList.remove('is-on'); }, '+=.3')
        .add(typeTo(n))
        .add(function () { sw.classList.add('is-on'); if (SKZ.jelly) SKZ.jelly(sw, .8); }, '+=.3')
        .to({}, { duration: 1.6 });
    });
    whenVisible(etext, etl);
  }

  // 6. Conversation : les messages arrivent un par un
  var chat = document.getElementById('chat');
  if (chat && !reduce) {
    var msgs = chat.querySelectorAll('.msg');
    gsap.set(msgs, { opacity: 0, y: 12, scale: .9 });
    var ctl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1 });
    msgs.forEach(function (m, i) {
      ctl.to(m, { opacity: 1, y: 0, scale: 1, duration: .6, ease: 'back.out(2)', transformOrigin: m.classList.contains('msg--out') ? '100% 100%' : '0% 100%' }, i * 1.3 + .3);
    });
    ctl.fromTo(chat.querySelector('.chat-avatar'), { rotation: 0 }, { rotation: -10, duration: .2, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 2.6 + .4)
       .to(msgs, { opacity: 0, y: -10, duration: .4, stagger: .06, ease: 'power2.in' }, '+=2.4');
    whenVisible(chat, ctl);
  }


  // =========================================================================
  // ENCART « ANIMATIONS » : l'oiseau boucle sur sa trajectoire ;
  // au survol, il accélère
  // =========================================================================
  var fp = document.getElementById('flightPath'), fb = document.getElementById('flightBird');
  if (fp && fb) {
    var flen = fp.getTotalLength(), fo = { d: 0 }, prevPt = fp.getPointAtLength(0);
    function placeBird() {
      var p = fp.getPointAtLength(fo.d % flen);
      var ang = Math.atan2(p.y - prevPt.y, p.x - prevPt.x) * 180 / Math.PI;
      var flipX = p.x < prevPt.x ? -1 : 1;
      prevPt = p;
      fb.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') scale(' + flipX + ' 1) rotate(' + (flipX > 0 ? ang * .5 : -(180 - ang) * .5) + ') translate(-32 -40)');
    }
    placeBird();
    if (!reduce) {
      var ftl = gsap.to(fo, { d: flen, duration: 7, ease: 'none', repeat: -1, onUpdate: placeBird, paused: true });
      whenVisible(fp, ftl);
      if (fine) {
        var cell = fp.closest('.cell');
        cell.addEventListener('pointerenter', function () { gsap.to(ftl, { timeScale: 2.6, duration: .5, ease: 'power2.out' }); });
        cell.addEventListener('pointerleave', function () { gsap.to(ftl, { timeScale: 1, duration: .8, ease: 'power2.out' }); });
      }
    }
  }

  // =========================================================================
  // MÉTHODE : un tracé monte d'une étape à l'autre (ordinateur)
  // =========================================================================
  var stepsBox = document.getElementById('steps');
  if (stepsBox && window.matchMedia('(min-width: 981px)').matches) {
    var NS = 'http://www.w3.org/2000/svg';
    var rise = document.createElementNS(NS, 'svg'); rise.setAttribute('class', 'steps-rise'); rise.setAttribute('aria-hidden', 'true');
    var guide = document.createElementNS(NS, 'path'), solid = document.createElementNS(NS, 'path');
    solid.setAttribute('class', 'solid');
    rise.appendChild(guide); rise.appendChild(solid);
    stepsBox.insertBefore(rise, stepsBox.firstChild);
    function layout() {
      // positions de mise en page (offset*), pas d'écran : les cartes peuvent
      // être en train d'apparaître (décalées), la ligne doit passer par la
      // place finale des pastilles
      rise.setAttribute('viewBox', '0 0 ' + stepsBox.offsetWidth + ' ' + stepsBox.offsetHeight);
      var pts = Array.prototype.map.call(stepsBox.querySelectorAll('.step-dot'), function (d) {
        var s = d.offsetParent; return [s.offsetLeft + d.offsetLeft + d.offsetWidth / 2, s.offsetTop + d.offsetTop + d.offsetHeight / 2];
      });
      if (pts.length < 2) return;
      var dpath = 'M' + pts[0][0] + ' ' + pts[0][1];
      for (var i = 1; i < pts.length; i++) {
        // la ligne reste au niveau du point le plus haut, puis rejoint l'autre
        // entre deux cartes : elle ne passe jamais derrière une carte
        var a = pts[i - 1], c = pts[i], dx = c[0] - a[0];
        var k1 = c[1] > a[1] ? .85 : .2, k2 = c[1] > a[1] ? .9 : .15;
        dpath += ' C' + (a[0] + dx * k1) + ' ' + a[1] + ' ' + (a[0] + dx * k2) + ' ' + c[1] + ' ' + c[0] + ' ' + c[1];
      }
      guide.setAttribute('d', dpath); solid.setAttribute('d', dpath);
      var L = solid.getTotalLength();
      solid.style.strokeDasharray = L; if (!solid._init) { solid.style.strokeDashoffset = L; solid._init = true; }
      solid._len = L;
    }
    layout();
    window.addEventListener('resize', layout);
    window.addEventListener('load', layout);
    if ('ResizeObserver' in window) new ResizeObserver(function () { layout(); }).observe(stepsBox);
    if (!reduce) {
      gsap.to(solid, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: stepsBox, start: 'top 75%', end: 'top 30%', scrub: .5, onRefresh: layout } });
    } else { solid.style.strokeDashoffset = 0; }
  }

})();
