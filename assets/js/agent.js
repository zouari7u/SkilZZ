/* ==========================================================================
   ZkilZ — agent IA en bas à droite (même principe que le conseiller de
   MM Fragrances) :
   · une pastille ronde, le martin-pêcheur dedans ; sa tête dépasse de la
     bulle, il plonge, penche la tête, cligne des yeux (si l'image
     « -clin » existe) ;
   · à l'arrivée sur une section clé, une courte phrase s'écrit à côté de
     la bulle (trois fois au plus par visite) ;
   · clic : la conversation se déplie depuis la pastille ; l'oiseau passe
     la tête par-dessus la fenêtre ;
   · réponses : POST data-endpoint (même contrat que /api/chat du site de
     parfums : { message, history } → { reply, suggestions, links }) ; sans
     adresse, ou si elle échoue, un moteur local répond à partir du
     contenu de la page — rien n'est inventé (pas de prix, pas de délai) ;
   · « Préparer mon message » : deux questions, puis le formulaire de
     contact est prérempli ;
   · la conversation suit le visiteur le temps de la session.
   ========================================================================== */
(function () {
  'use strict';
  var fab = document.getElementById('agentFab');
  var panel = document.getElementById('agentPanel');
  if (!fab || !panel) return;
  var hasGsap = !!window.gsap;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !hasGsap;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var log = document.getElementById('agentLog');
  var chipsBox = document.getElementById('agentChips');
  var form = document.getElementById('agentForm');
  var input = document.getElementById('agentInput');
  var send = document.getElementById('agentSend');
  var statusEl = document.getElementById('agentStatus');
  var tip = document.getElementById('agentTip');
  var tipText = document.getElementById('agentTipText');
  var head = fab.querySelector('.agent-fab-head img');
  var bubble = fab.querySelector('.agent-fab-bubble');
  var peekHead = panel.querySelector('.agent-peek img');
  var ENDPOINT = (panel.dataset.endpoint || '').trim();
  var IMG = 'assets/img/mascotte/';

  // --- Images facultatives (déposées plus tard : PROMPTS-MASCOTTE.md) -------
  function probe(src, cb) { var i = new Image(); i.onload = function () { cb(src); }; i.src = src; }
  var blinkSrc = null, thinkSrc = null, ideaSrc = null;
  var avatarSrc = head.getAttribute('src');
  probe(IMG + 'agent-avatar.webp', function (s) { avatarSrc = s; head.src = s; peekHead.src = s; probe(IMG + 'agent-avatar-clin.webp', function (b) { blinkSrc = b; }); });
  
  probe(IMG + 'agent-reflechit.webp', function (s) { thinkSrc = s; });
  probe(IMG + 'agent-idee.webp', function (s) { ideaSrc = s; });

  // =========================================================================
  // CONNAISSANCES — uniquement ce que dit la page
  // =========================================================================
  var fold = function (t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var START = ['Combien coûte un site ?', 'Une application mobile', 'Comment se passe un projet ?', 'Préparer mon message'];
  var LEAD = 'Préparer mon message';
  var K = [
    { re: /\b(humain|robot|\bia\b|intelligence artificielle|chatgpt|tu es qui|vous etes qui|qui es[- ]tu|qui etes)/,
      reply: "Je suis l'assistant virtuel du studio. Pour parler à une personne, laissez un message avec le formulaire : c'est le studio qui vous répond.",
      chips: [LEAD, 'Comment se passe un projet ?'] },
    { re: /(prix|cout|coute|tarif|combien|devis|budget|cher|payer|paiement en plusieurs)/,
      reply: "Ça dépend de ce qu'on construit : une page de présentation et une application n'ont rien à voir. Après un premier échange gratuit, vous recevez un devis détaillé, ligne par ligne, sans frais cachés.",
      chips: [LEAD, 'Quels sont les délais ?', 'Que comprend un site ?'] },
    { re: /(delai|combien de temps|quand|planning|rapide a faire|duree|semaines?|mois)/,
      reply: "Le planning est fixé ensemble au démarrage, avec une date pour chaque validation. Vous savez toujours où en est le projet, sans avoir à relancer.",
      chips: ['Comment se passe un projet ?', LEAD] },
    { re: /(appli|application|mobile|ios|android|iphone|store|saas|logiciel|plateforme|tableau de bord|dashboard)/,
      reply: "Applications et SaaS : vous testez d'abord un prototype sur votre propre téléphone, et le développement commence une fois qu'il vous convient. Livré : le prototype cliquable, l'application publiée sur l'App Store et Google Play, et un tableau de bord pour suivre l'usage.",
      links: [{ label: 'Les applications', href: 'application-mobile.html' }, { label: 'Les SaaS', href: 'saas.html' }], chips: ['Combien coûte une application ?', LEAD] },
    { re: /(reseau|social|sociaux|instagram|tiktok|linkedin|reel|video|contenu|motion|post)/,
      reply: "Les réseaux sociaux, le marketing et le référencement sont confiés à notre partenaire Studio Moumous. Vous passez quand même par nous : ZkilZ coordonne, vous gardez un seul interlocuteur.",
      links: [{ label: 'Le partenariat', href: 'reseaux-sociaux.html' }], chips: ['Faut-il déjà un logo ?', LEAD] },
    { re: /(conseil|audit|outil|tableur|excel|transition|migr|sur.?mesure|logiciel existant|choisir|solution)/,
      reply: "Conseil et transition : on fait l'état des lieux de vos outils, on compare les solutions du marché avec un développement sur mesure, puis on vous accompagne pendant la bascule. Si un outil existant suffit, on vous le dit.",
      links: [{ label: 'Voir le service', href: 'conseil.html' }], chips: ['Comment se passe un projet ?', LEAD] },
    { re: /(logo|charte|identite|couleur|marque|branding|graphique)/,
      reply: "Pas besoin d'avoir déjà un logo ou une charte : notre partenaire Studio Moumous peut créer votre identité visuelle avant que ZkilZ conçoive le site ou l'application.",
      chips: ['Que comprend un site ?', LEAD] },
    { re: /(google|seo|referencement|trouve|visible|recherche)/,
      reply: "Le référencement est le métier de notre partenaire Studio Moumous. De notre côté, ZkilZ livre des pages rapides et bien construites, qui s'ouvrent vite même en 4G.",
      chips: ['Que comprend un site ?', LEAD] },
    { re: /(modifier|back.?office|admin|changer (un|les) prix|mettre a jour|autonome|moi.meme)/,
      reply: "Vous gardez la main : changer un prix, une photo ou un texte se fait depuis votre back-office, sans appeler personne. La prise en main est incluse.",
      chips: ['Et après la mise en ligne ?', LEAD] },
    { re: /(apres|maintenance|suivi|evolution|mise a jour|support|panne|hebergement)/,
      reply: "Après la mise en ligne, le studio peut assurer la maintenance et les évolutions. Vous êtes aussi formé pour modifier vous-même l'essentiel.",
      chips: ['Le code m’appartient-il ?', LEAD] },
    { re: /(appartien|proprietaire|propriete|code source|mes comptes|droits)/,
      reply: "Le code, le design et les comptes vous appartiennent. Pas de template non plus : chaque projet est dessiné sur-mesure.",
      chips: ['Comment se passe un projet ?', LEAD] },
    { re: /(site|vitrine|e.?commerce|boutique|shop|vendre en ligne|landing|page web|wordpress|shopify)/,
      reply: "Sites vitrines et e-commerce : de la page unique qui présente votre activité à la boutique complète avec paiement. Livré : les maquettes validées avec vous, le site en ligne sur votre nom de domaine et la prise en main du back-office.",
      links: [{ label: 'Voir le service', href: 'site-web.html' }, { label: 'Voir une réalisation', href: 'mm-fragrances.html' }], chips: ['Combien coûte un site ?', LEAD] },
    { re: /(etape|methode|deroule|se passe|process|comment (ca|vous) (marche|travaill)|fonctionne)/,
      reply: "Trois étapes. Écouter : un premier échange, puis un devis détaillé. Concevoir : maquettes et prototype animé, que vous testez sur votre téléphone. Faire grandir : mise en ligne, suivi et nouvelles fonctions.",
      links: [{ label: 'Voir la méthode', href: 'methode.html' }], chips: ['Combien coûte un site ?', LEAD] },
    { re: /(exemple|realisation|portfolio|projet deja|reference|client|\bmm\b|parfum)/,
      reply: "Une réalisation du studio : MM Fragrances, une parfumerie de niche en ligne, avec catalogue animé, flacons en 3D, quiz pour trouver son parfum et conseiller virtuel.",
      links: [{ label: 'Voir la réalisation', href: 'mm-fragrances.html' }], chips: ['Que comprend un site ?', LEAD] },
    { re: /(interlocuteur|qui (me )?repond|equipe|freelance|agence|personne)/,
      reply: "Vous parlez toujours à la même personne, du premier appel à la mise en ligne. Pas de ticket, pas de transfert d'un service à l'autre.",
      chips: [LEAD] },
    { re: /(martin|pecheur|oiseau|mascotte|shinkansen)/,
      reply: "Le martin-pêcheur part d'une branche au ras de l'eau, vise, puis plonge sans presque faire d'éclaboussure. C'est notre idée du travail : partir de votre point de départ, viser juste, et monter.",
      chips: ['Comment se passe un projet ?'] },
    { re: /(contact|rendez|rdv|appel|telephone|mail|joindre|parler|ecrire|commencer|demarrer|lancer)/,
      reply: "Le plus simple : le formulaire en bas de page, le premier échange est gratuit. Je peux préparer le message avec vous, en deux questions.",
      chips: [LEAD] },
    { re: /^(merci|super|top|parfait|genial|ok|d'accord|cool)\b/,
      reply: "Avec plaisir. Une autre question, ou je prépare votre message pour le studio ?",
      chips: [LEAD, 'Comment se passe un projet ?'] },
    { re: /^(salut|bonjour|bonsoir|hello|coucou|hey|yo)\b/,
      reply: "Bonjour ! Posez-moi vos questions sur les sites, les applications, les réseaux sociaux ou la façon de travailler du studio.",
      chips: START }
  ];
  var FALLBACK = {
    reply: "Je n'ai pas la réponse à ça, mais le studio l'a sûrement. Je peux préparer votre message pour le formulaire de contact.",
    chips: [LEAD, 'Comment se passe un projet ?', 'Combien coûte un site ?']
  };
  var GREETING = "Bonjour, je suis le martin-pêcheur de ZkilZ. Un site, une application, un outil sur mesure ? Posez votre question.";

  function localAnswer(text) {
    var t = fold(text);
    for (var i = 0; i < K.length; i++) if (K[i].re.test(t)) return K[i];
    return FALLBACK;
  }

  // =========================================================================
  // ÉTAT (gardé le temps de la session)
  // =========================================================================
  var STORE = 'skz-agent-v1';
  var state = { messages: [], chips: START, flow: null };
  try { var saved = JSON.parse(sessionStorage.getItem(STORE) || 'null'); if (saved && saved.messages) state = saved; } catch (e) {}
  function save() { try { sessionStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }

  // =========================================================================
  // AFFICHAGE
  // =========================================================================
  function scrollLog() { if (panel.hidden) return; log.scrollTop = log.scrollHeight; }
  function bubbleEl(role) {
    var row = document.createElement('div');
    row.className = 'agent-msg agent-msg--' + (role === 'user' ? 'out' : 'in');
    var b = document.createElement('p');
    row.appendChild(b);
    log.appendChild(row);
    return { row: row, p: b };
  }
  function addLinks(row, links) {
    if (!links || !links.length) return;
    var box = document.createElement('div');
    box.className = 'agent-links';
    links.forEach(function (l) {
      var a = document.createElement('a');
      a.href = l.href; a.textContent = l.label; a.className = 'agent-link';
      a.addEventListener('click', function (e) {
        var hash = l.href.indexOf('#') > -1 ? l.href.slice(l.href.indexOf('#')) : '';
        var page = l.href.split('#')[0];
        var here = !page || location.pathname.replace(/\.html$/, '').split('/').pop() === page.replace(/\.html$/, '');
        if (!here || !hash || !document.querySelector(hash)) return;
        e.preventDefault();
        goTo(hash);
        if (window.innerWidth < 640) close();
      });
      box.appendChild(a);
    });
    row.appendChild(box);
  }
  function render(m, animate) {
    var el = bubbleEl(m.role);
    if (animate && m.role === 'assistant' && !reduce) {
      typeInto(el.p, m.content, function () { addLinks(el.row, m.links); pop(el.row); scrollLog(); });
    } else {
      el.p.textContent = m.content;
      addLinks(el.row, m.links);
    }
    if (animate && !reduce) gsap.from(el.row, { y: 14, scale: .92, opacity: 0, duration: .5, ease: 'back.out(2)', transformOrigin: m.role === 'user' ? '100% 100%' : '0% 100%' });
    scrollLog();
  }
  function pop(el) { if (!reduce && el) gsap.fromTo(el, { scale: .96 }, { scale: 1, duration: .6, ease: 'elastic.out(1, .4)' }); }
  function typeInto(p, text, done) {
    var o = { n: 0 };
    gsap.to(o, { n: text.length, duration: Math.min(2.2, .35 + text.length * .012), ease: 'none',
      onUpdate: function () { p.textContent = text.slice(0, Math.round(o.n)); scrollLog(); },
      onComplete: function () { p.textContent = text; done && done(); } });
  }
  function setChips(list) {
    state.chips = list || [];
    chipsBox.innerHTML = '';
    state.chips.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'agent-chip'; b.textContent = c;
      b.addEventListener('click', function () { ask(c); });
      chipsBox.appendChild(b);
      if (!reduce) gsap.from(b, { y: 10, opacity: 0, scale: .8, duration: .45, delay: .05 * i, ease: 'back.out(2)' });
    });
  }
  function renderAll() {
    log.innerHTML = '';
    if (!state.messages.length) state.messages.push({ role: 'assistant', content: GREETING });
    state.messages.forEach(function (m) { render(m, false); });
    setChips(state.chips);
  }

  // Indicateur de réflexion : trois petites bulles
  var typing = null;
  function showTyping(on) {
    if (on) {
      typing = document.createElement('div');
      typing.className = 'agent-msg agent-msg--in agent-typing';
      typing.innerHTML = '<p><i></i><i></i><i></i></p>';
      log.appendChild(typing);
      scrollLog();
      if (!reduce) gsap.to(typing.querySelectorAll('i'), { y: -5, duration: .32, stagger: .12, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      statusEl.textContent = 'Réfléchit…';
      mood('think');
    } else if (typing) {
      typing.remove(); typing = null;
      statusEl.textContent = 'En ligne';
    }
  }

  // =========================================================================
  // CONVERSATION
  // =========================================================================
  var busy = false;
  function reply(ans) {
    showTyping(false);
    var m = { role: 'assistant', content: ans.reply, links: ans.links || [] };
    state.messages.push(m);
    render(m, true);
    setChips(ans.chips || ans.suggestions || []);
    mood(ans === FALLBACK ? 'idle' : 'idea');
    busy = false; save();
  }

  // Préparer le message de contact : type de projet, puis une phrase
  var TYPES = ['Site', 'Application', 'SaaS', 'Conseil', 'Réseaux, marketing, SEO'];
  function flowStep(text) {
    var f = state.flow;
    if (f.step === 'type') {
      var t = fold(text);
      f.types = TYPES.filter(function (x) { return t.indexOf(fold(x).split(' ')[0].slice(0, 5)) > -1; });
      if (/plusieurs|tout/.test(t)) f.types = TYPES.slice();
      f.step = 'desc';
      return { reply: "Noté. En une ou deux phrases : que vendez-vous, et qu'est-ce qui ne marche pas aujourd'hui ?", chips: [] };
    }
    f.desc = text;
    state.flow = null;
    fillContact(f.types || [], f.desc);
    return { reply: "C'est prêt : j'ai rempli le type de projet et votre message dans le formulaire. Il reste votre nom et votre email, puis « Envoyer le message ».",
      links: [{ label: 'Aller au formulaire', href: 'contact.html#contact' }], chips: ['Comment se passe un projet ?'] };
  }
  function fillContact(types, desc) {
    var cf = document.getElementById('contactForm');
    // pas de formulaire sur cette page : il est prérempli sur la page Contact
    if (!cf) {
      try { sessionStorage.setItem('skz-prefill', JSON.stringify({ types: types, desc: desc })); } catch (e) {}
      setTimeout(function () { location.href = 'contact.html#contact'; }, 1400);
      return;
    }
    cf.querySelectorAll('input[name="type"]').forEach(function (c) { c.checked = types.indexOf(c.value) > -1; });
    var ta = cf.querySelector('textarea[name="message"]');
    if (ta) ta.value = desc;
    setTimeout(function () {
      goTo('#contact');
      setTimeout(function () { var n = cf.querySelector('input[name="name"]'); n && n.focus({ preventScroll: true }); }, 1300);
    }, 900);
  }

  function ask(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    busy = true;
    var m = { role: 'user', content: text };
    state.messages.push(m);
    render(m, true);
    setChips([]);
    input.value = ''; send.disabled = true;
    showTyping(true);
    var wait = 650 + Math.random() * 500;

    if (text === LEAD) {
      state.flow = { step: 'type' };
      return setTimeout(function () { reply({ reply: "Avec plaisir. Votre projet concerne plutôt… ?", chips: TYPES.concat(['Plusieurs']) }); }, wait);
    }
    if (state.flow) return setTimeout(function () { reply(flowStep(text)); }, wait);

    if (ENDPOINT) {
      var history = state.messages.slice(-5, -1).map(function (x) { return { role: x.role, content: x.content }; });
      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { ctrl && ctrl.abort(); }, 12000);
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, history: history }), signal: ctrl && ctrl.signal })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok && !d.reply) throw new Error(); return d; }); })
        .then(function (d) {
          clearTimeout(timer);
          var loc = localAnswer(text);
          reply({ reply: d.reply, links: d.links && d.links.length ? d.links : loc.links, chips: d.suggestions && d.suggestions.length ? d.suggestions : loc.chips });
        })
        .catch(function () { clearTimeout(timer); reply(localAnswer(text)); });
      return;
    }
    setTimeout(function () { reply(localAnswer(text)); }, wait);
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });
  input.addEventListener('input', function () { send.disabled = !input.value.trim(); });
  document.getElementById('agentReset').addEventListener('click', function () {
    state = { messages: [], chips: START, flow: null }; save(); renderAll();
    if (!reduce) gsap.from(log.children, { y: 12, opacity: 0, duration: .5, ease: 'back.out(2)' });
  });

  function goTo(id) {
    var el = document.querySelector(id);
    if (!el) return;
    if (window.skzScrollTo) window.skzScrollTo(el); else el.scrollIntoView({ behavior: 'smooth' });
  }

  // =========================================================================
  // OUVRIR / FERMER : la fenêtre se déplie depuis la bulle
  // =========================================================================
  var open = false;
  function openPanel() {
    if (open) return;
    open = true;
    hideTip(true);
    fab.setAttribute('aria-expanded', 'true');
    fab.classList.add('is-open');
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
    if (!log.children.length) renderAll();
    if (!reduce) {
      var f = fab.getBoundingClientRect(), p = panel.getBoundingClientRect();
      var at = (f.left + f.width / 2 - p.left) + 'px ' + (f.top + f.height / 2 - p.top) + 'px';
      gsap.timeline()
        .to(head, { yPercent: 60, duration: .22, ease: 'power2.in' }, 0)
        .fromTo(panel, { clipPath: 'circle(0px at ' + at + ')' }, { clipPath: 'circle(1400px at ' + at + ')', duration: .75, ease: 'power3.inOut', clearProps: 'clipPath' }, .05)
        .fromTo(panel.querySelector('.agent-peek'), { yPercent: 100 }, { yPercent: 0, duration: .8, ease: 'back.out(2.2)' }, .45)
        .from(log.children, { y: 16, opacity: 0, duration: .5, stagger: .05, ease: 'back.out(2)' }, .35);
      if (window.SKZ) window.SKZ.burst(f.left + f.width / 2, f.top + f.height / 2, { count: 10, spread: 70 });
    }
    setTimeout(function () { if (fine) input.focus({ preventScroll: true }); }, reduce ? 0 : 500);
    scrollLog();
  }
  function close() {
    if (!open) return;
    open = false;
    fab.setAttribute('aria-expanded', 'false');
    fab.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    var done = function () { panel.hidden = true; };
    if (reduce) { done(); return; }
    var f = fab.getBoundingClientRect(), p = panel.getBoundingClientRect();
    var at = (f.left + f.width / 2 - p.left) + 'px ' + (f.top + f.height / 2 - p.top) + 'px';
    gsap.timeline({ onComplete: done })
      .to(panel.querySelector('.agent-peek'), { yPercent: 100, duration: .25, ease: 'power2.in' }, 0)
      .fromTo(panel, { clipPath: 'circle(1400px at ' + at + ')' }, { clipPath: 'circle(0px at ' + at + ')', duration: .5, ease: 'power3.in', clearProps: 'clipPath' }, .05)
      .to(head, { yPercent: 0, duration: .7, ease: 'back.out(2.4)' }, .4)
      .add(function () { jellyBubble(); }, .45);
    fab.focus({ preventScroll: true });
  }
  fab.addEventListener('click', function () { open ? close() : openPanel(); });
  document.getElementById('agentClose').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) close(); });

  // =========================================================================
  // LE MARTIN-PÊCHEUR DANS SA PASTILLE
  // =========================================================================
  function jellyBubble() { if (window.SKZ) window.SKZ.jelly(bubble, .9); }
  function mood(m) {
    if (reduce) return;
    var src = m === 'think' ? (thinkSrc || avatarSrc) : m === 'idea' ? (ideaSrc || avatarSrc) : avatarSrc;
    if (peekHead.getAttribute('src') !== src) peekHead.src = src;
    if (m === 'think') gsap.to(peekHead, { rotation: -10, y: 4, duration: .5, ease: 'power2.out' });
    else gsap.timeline()
      .to(peekHead, { rotation: 0, y: -14, duration: .2, ease: 'power2.out' })
      .to(peekHead, { y: 0, duration: .7, ease: 'bounce.out' });
    if (m === 'idea') setTimeout(function () { mood('idle'); }, 2600);
  }
  function blink(img) {
    if (!blinkSrc || reduce) return;
    var orig = img.src;
    img.src = blinkSrc;
    setTimeout(function () { img.src = orig; }, 120);
  }

  if (!reduce) {
    // Entrée : la pastille apparaît, puis l'oiseau sort la tête
    gsap.timeline({ delay: 2.4 })
      .fromTo(fab, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, ease: 'elastic.out(1, .5)' })
      .fromTo(head, { yPercent: 70 }, { yPercent: 0, duration: .8, ease: 'back.out(2.4)' }, .35)
      .add(function () { var r = fab.getBoundingClientRect(); window.SKZ && window.SKZ.burst(r.left + r.width / 2, r.top, { count: 6, spread: 50, min: 5, max: 9 }); }, .5);

    // Petits gestes au repos : plonge, penche, oreilles, clin d'œil
    var idle = [
      function () { gsap.timeline().to(head, { yPercent: 62, duration: .28, ease: 'power2.in' }).to(head, { yPercent: 0, duration: .75, ease: 'back.out(2.6)' }, '+=.7').add(jellyBubble, '<'); },
      function () { var s = Math.random() > .5 ? 1 : -1; gsap.timeline().to(head, { rotation: 11 * s, duration: .45, ease: 'power2.out' }).to(head, { rotation: 0, duration: .9, ease: 'elastic.out(1, .4)' }, '+=.9'); },
      function () { gsap.timeline().to(head, { scaleY: .9, scaleX: 1.05, duration: .12 }).to(head, { scaleY: 1, scaleX: 1, duration: .8, ease: 'elastic.out(1.2, .3)' }); blink(head); },
      function () { blink(head); setTimeout(function () { blink(head); }, 260); }
    ];
    (function loop() {
      setTimeout(function () {
        if (!open && !document.hidden && !fab.matches(':hover')) idle[Math.floor(Math.random() * idle.length)]();
        loop();
      }, 5200 + Math.random() * 4500);
    })();
    setInterval(function () { if (open && !busy) blink(peekHead); }, 4200);

    if (fine) {
      fab.addEventListener('pointerenter', function () { if (open) return; gsap.to(head, { yPercent: -8, rotation: -4, duration: .5, ease: 'back.out(2)' }); jellyBubble(); });
      fab.addEventListener('pointerleave', function () { if (open) return; gsap.to(head, { yPercent: 0, rotation: 0, duration: .7, ease: 'elastic.out(1, .45)' }); });
    }
    if (peekHead) peekHead.parentNode.addEventListener('click', function () { mood('idea'); var r = peekHead.getBoundingClientRect(); window.SKZ && window.SKZ.burst(r.left + r.width / 2, r.top + r.height / 3, { count: 8, spread: 60 }); });
  }

  // =========================================================================
  // PHRASES CONTEXTUELLES à l'arrivée sur une section clé
  // =========================================================================
  var HINTS = {
    services: 'Une question sur un service ? Demandez-moi.',
    realisation: 'Envie d’un site comme celui-ci ? Je vous explique.',
    travaux: 'Vous ne savez pas par quel service commencer ? Je vous aide.',
    questions: 'Votre question n’est pas dans la liste ? Posez-la-moi.',
    contact: 'Je peux préparer ce message avec vous.'
  };
  var shown = 0, muted = false, tipTimer = null, lastTip = 0;
  try { muted = sessionStorage.getItem('skz-agent-tips') === 'off'; } catch (e) {}
  function showTip(text) {
    if (muted || open || shown >= 3 || Date.now() - lastTip < 15000) return;
    shown++; lastTip = Date.now();
    tip.hidden = false;
    tipText.textContent = '';
    if (reduce) { tipText.textContent = text; }
    else {
      gsap.fromTo(tip, { scale: .4, opacity: 0, x: 20 }, { scale: 1, opacity: 1, x: 0, duration: .7, ease: 'back.out(2)' });
      typeInto(tipText, text);
      gsap.timeline().to(head, { yPercent: -14, duration: .3, ease: 'power2.out' }).to(head, { yPercent: 0, duration: .8, ease: 'bounce.out' });
    }
    clearTimeout(tipTimer);
    tipTimer = setTimeout(function () { hideTip(); }, 7000);
  }
  function hideTip(fast) {
    clearTimeout(tipTimer);
    if (tip.hidden) return;
    if (reduce || fast) { tip.hidden = true; return; }
    gsap.to(tip, { scale: .6, opacity: 0, x: 16, duration: .3, ease: 'power2.in', onComplete: function () { tip.hidden = true; } });
  }
  tip.querySelector('.agent-tip-x').addEventListener('click', function (e) {
    e.stopPropagation(); muted = true; hideTip();
    try { sessionStorage.setItem('skz-agent-tips', 'off'); } catch (er) {}
  });
  tip.addEventListener('click', function () { openPanel(); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        setTimeout(function () { showTip(HINTS[en.target.id]); }, 900);
      });
    }, { threshold: .35 });
    Object.keys(HINTS).forEach(function (id) { var s = document.getElementById(id); s && io.observe(s); });
  }

  // arrivée sur la page Contact avec un message préparé par l'assistant
  (function () {
    var cf = document.getElementById('contactForm'), p = null;
    if (!cf) return;
    try { p = JSON.parse(sessionStorage.getItem('skz-prefill') || 'null'); sessionStorage.removeItem('skz-prefill'); } catch (e) {}
    if (!p) return;
    cf.querySelectorAll('input[name="type"]').forEach(function (c) { c.checked = (p.types || []).indexOf(c.value) > -1; });
    var ta = cf.querySelector('textarea[name="message"]');
    if (ta) ta.value = p.desc || '';
    setTimeout(function () { var n = cf.querySelector('input[name="name"]'); n && n.focus({ preventScroll: true }); }, 600);
  })();

  window.skzAgent = { open: openPanel, close: close, ask: function (q) { openPanel(); setTimeout(function () { ask(q); }, 500); } };
})();
