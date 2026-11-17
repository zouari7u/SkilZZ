/* ==========================================================================
   ZkilZ — l'assistant IA, en bas à droite
   · une pastille : l'avatar du martin-pêcheur et « Une question ? » ;
   · la fenêtre : en-tête avec l'avatar (il cligne des yeux, réfléchit,
     trouve), un accueil avec quatre cartes de départ adaptées à la page,
     des questions suggérées, un lien direct vers le studio ; sur téléphone,
     elle prend tout l'écran ;
   · réponses : POST data-endpoint ({ message, history } → { reply,
     suggestions, links }) ; sans adresse, ou si elle échoue, un moteur local
     répond à partir du contenu du site — rien n'est inventé (pas de prix,
     pas de délai) ;
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
  var head = fab.querySelector('.agent-fab-av img');      // l'avatar de la pastille
  var peekHead = document.getElementById('agentAv');       // l'avatar de l'en-tête
  var ENDPOINT = (panel.dataset.endpoint || '').trim();
  var IMG = 'assets/img/mascotte/';

  // --- Images facultatives (déposées plus tard : PROMPTS-MASCOTTE.md) -------
  function probe(src, cb) { var i = new Image(); i.onload = function () { cb(src); }; i.src = src; }
  var blinkSrc = null, thinkSrc = null, ideaSrc = null;
  var avatarSrc = head.getAttribute('src');
  probe(IMG + 'agent-avatar-clin.webp', function (b) { blinkSrc = b; });

  probe(IMG + 'agent-reflechit.webp', function (s) { thinkSrc = s; });
  probe(IMG + 'agent-idee.webp', function (s) { ideaSrc = s; });

  // =========================================================================
  // CONNAISSANCES — uniquement ce que dit la page
  // =========================================================================
  var fold = function (t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var START = ['Combien coûte un site ?', 'Une application mobile', 'Comment se passe un projet ?', 'Préparer mon message'];
  var LEAD = 'Préparer mon message';
  var K = [
    { re: /(par (quoi|ou) commencer|je ne sais pas|hesite|site ou (une )?appli|quel service|lequel choisir|conseillez)/,
      reply: "On commence par votre activité, pas par la technique : ce que vous vendez, à qui, et ce qui coince aujourd'hui. Un site fait connaître et vend ; une application sert vos clients au quotidien ; un outil sur mesure ou un SaaS simplifie le travail de votre équipe. Le premier échange est gratuit : on vous dit franchement ce qu'il vous faut, même si c'est un outil qui existe déjà.",
      links: [{ label: 'Les services', href: 'services.html' }], chips: [LEAD, 'Combien coûte un site ?', 'Comment se passe un projet ?'] },
    { re: /(abonnement|compte|inscription|connexion|role|acces|multi.?utilisateur|equipe interne)/,
      reply: "Un SaaS ou un outil métier gère les comptes, les rôles et les accès de chacun, et si besoin les abonnements et le paiement en ligne. On conçoit ensemble qui voit quoi, puis vous testez le parcours avant le développement.",
      links: [{ label: 'SaaS et outils métier', href: 'saas.html' }], chips: ['Comment tester avant ?', LEAD] },
    { re: /(store|app store|google play|publier|publication)/,
      reply: "On s'occupe de la publication sur l'App Store et Google Play, sur vos comptes à vous : l'application vous appartient.",
      links: [{ label: 'Les applications', href: 'application-mobile.html' }], chips: ['Comment tester avant ?', LEAD] },
    { re: /(tester avant|prototype|maquette|essayer|voir avant)/,
      reply: "Avant la première ligne de code, vous recevez des maquettes, puis un prototype animé que vous essayez sur votre propre téléphone. Le développement démarre quand il vous convient.",
      links: [{ label: 'La méthode', href: 'methode.html' }], chips: ['Combien coûte une application ?', LEAD] },
    { re: /(moumous|audiovisuel|tournage|montage|clip|film)/,
      reply: "Studio Moumous est le partenaire de ZkilZ pour le marketing, l'audiovisuel (vidéos, reels, motion design), la création de contenu et la promotion. Vous passez par nous : un seul interlocuteur, un seul planning.",
      links: [{ label: 'Studio Moumous', href: 'reseaux-sociaux.html' }], chips: ['Faut-il déjà un logo ?', LEAD] },
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
      reply: "Pour vous faire connaître, ZkilZ travaille avec Studio Moumous : marketing, audiovisuel (vidéos, reels, motion design), création de contenu et promotion. Vous passez quand même par nous : ZkilZ coordonne, vous gardez un seul interlocuteur.",
      links: [{ label: 'Studio Moumous', href: 'reseaux-sociaux.html' }], chips: ['Faut-il déjà un logo ?', LEAD] },
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
    { re: /(interlocuteur|qui (me )?repond|m'adresse|adresser|equipe|freelance|agence|personne)/,
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
  // Accueil : quatre cartes de départ, selon la page
  var ICON = {
    euro: '<path d="M16 7.5a5.5 5.5 0 1 0 0 9M5.5 10.5h8M5.5 13.5h8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    path: '<path d="M5 19c4 0 3-7 7-7s3-7 7-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="5" cy="19" r="1.8" fill="currentColor"/><circle cx="19" cy="5" r="1.8" fill="currentColor"/>',
    steps: '<path d="M4 18h5v-5h5V8h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    play: '<rect x="3.5" y="5.5" width="17" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10.5 9.5v5l4-2.5z" fill="currentColor"/>',
    edit: '<path d="M5 19h4L19 9l-4-4L5 15z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    phone: '<rect x="7" y="3.5" width="10" height="17" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11 17.5h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    users: '<circle cx="9" cy="9" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5M15.5 6.2a3 3 0 0 1 0 5.6M17.5 14.8c1.4.6 2.4 1.9 3 4.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    msg: '<path d="M4.5 6.5h15v9h-8l-4 3v-3h-3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    tool: '<path d="M14.5 4.5a4 4 0 0 0-4 5.2L4.5 15.7l3.8 3.8 6-6a4 4 0 0 0 5.2-4l-2.7 2.7-2.6-.6-.6-2.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    star: '<path d="M12 4.5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 9.8l5-.7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'
  };
  var PAGE = (document.body.className.match(/page-([\w-]+)/) || [])[1] || 'index';
  var STARTS = {
    index: [['euro', 'Estimer mon projet', 'Ce qui fait varier le prix', 'Combien coûte un site ?'], ['path', 'Par où commencer ?', 'Site, application ou outil', 'Par quoi commencer ?'],
      ['steps', 'Comment ça se passe', 'Les trois étapes', 'Comment se passe un projet ?'], ['play', 'Réseaux et vidéo', 'Avec Studio Moumous', 'Que fait Studio Moumous ?']],
    'site-web': [['star', 'Que comprend un site ?', 'Ce qui est livré', 'Que comprend un site ?'], ['edit', 'Le modifier moi-même', 'Textes, prix, photos', 'Pourrai-je modifier mon site ?'],
      ['euro', 'Estimer mon site', 'Ce qui fait varier le prix', 'Combien coûte un site ?'], ['path', 'Être trouvé sur Google', 'Le référencement', 'Et le référencement ?']],
    'application-mobile': [['phone', 'Tester avant', 'Le prototype sur votre téléphone', 'Comment tester avant ?'], ['star', 'iPhone et Android', 'Publication sur les stores', 'Publier sur les stores ?'],
      ['euro', 'Estimer mon application', 'Ce qui fait varier le prix', 'Combien coûte une application ?'], ['steps', 'Et après ?', 'Suivi et évolutions', 'Et après la mise en ligne ?']],
    saas: [['users', 'Comptes et rôles', 'Qui voit quoi', 'Comptes, rôles et abonnements ?'], ['phone', 'Tester avant', 'Le prototype', 'Comment tester avant ?'],
      ['euro', 'Estimer mon outil', 'Ce qui fait varier le prix', 'Combien coûte un SaaS ?'], ['star', 'Le code m’appartient ?', 'Code, comptes, design', 'Le code m’appartient-il ?']],
    conseil: [['tool', 'Mes outils suffisent ?', 'L\'état des lieux', 'Mes outils actuels suffisent-ils ?'], ['path', 'La transition', 'Passer au sur mesure', 'Comment se passe la transition ?'],
      ['euro', 'Combien ça coûte ?', 'Le premier échange est gratuit', 'Combien coûte un projet ?'], ['steps', 'Les étapes', 'De l\'audit à la bascule', 'Comment se passe un projet ?']],
    'reseaux-sociaux': [['play', 'Que fait Studio Moumous ?', 'Marketing, vidéo, contenu', 'Que fait Studio Moumous ?'], ['star', 'Faut-il un logo ?', 'L\'identité visuelle', 'Faut-il déjà un logo ?'],
      ['users', 'À qui je m\'adresse ?', 'Un seul interlocuteur', 'À qui je m\'adresse ?'], ['path', 'Être trouvé sur Google', 'Le référencement', 'Et le référencement ?']],
    contact: [['msg', 'Préparer mon message', 'Deux questions, je remplis', LEAD], ['euro', 'Combien ça coûte ?', 'Le devis détaillé', 'Combien coûte un projet ?'],
      ['steps', 'Les délais', 'Un planning fixé ensemble', 'Quels sont les délais ?'], ['users', 'Qui me répond ?', 'Toujours la même personne', 'Qui me répond ?']]
  };
  STARTS.services = STARTS.index; STARTS.methode = STARTS.index; STARTS.studio = STARTS.index;
  STARTS.realisations = [['star', 'Un site comme MM Fragrances', 'Boutique, 3D, quiz', 'Un site comme MM Fragrances ?']].concat(STARTS.index.slice(0, 3));
  STARTS['mm-fragrances'] = STARTS.realisations;
  var starts = STARTS[PAGE] || STARTS.index;
  // sous les cartes, d'autres questions (pas les mêmes), la prise de contact en premier
  var inCards = starts.map(function (s) { return s[3]; });
  START = [LEAD].concat(['Quels sont les délais ?', 'Le code m’appartient-il ?', 'Qui me répond ?', 'Combien coûte un site ?', 'Comment se passe un projet ?']
    .filter(function (q) { return inCards.indexOf(q) < 0; }).slice(0, 3));
  var PLACE = { 'site-web': 'Une question sur votre site ?', 'application-mobile': 'Une question sur votre application ?', saas: 'Une question sur votre outil ?', 'reseaux-sociaux': 'Une question sur vos réseaux, vos vidéos ?', contact: 'Une question avant d\'écrire ?' };
  if (PLACE[PAGE]) input.placeholder = PLACE[PAGE];

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
  if (!state.messages.length) state.chips = START;
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
      b.type = 'button'; b.className = 'agent-chip' + (c === LEAD ? ' agent-chip--lead' : ''); b.textContent = c;
      b.addEventListener('click', function () { ask(c); });
      chipsBox.appendChild(b);
      if (!reduce) gsap.from(b, { y: 10, opacity: 0, scale: .8, duration: .45, delay: .05 * i, ease: 'back.out(2)' });
    });
  }
  function renderHello() {
    var h = document.createElement('div');
    h.className = 'agent-hello';
    var hour = new Date().getHours();
    h.innerHTML = '<p class="agent-hello-hi">' + (hour < 18 && hour > 4 ? 'Bonjour' : 'Bonsoir') + '&nbsp;! Je suis le martin-pêcheur de ZkilZ.</p>' +
      '<p class="agent-hello-sub">Posez-moi une question sur votre projet, ou choisissez un point de départ.</p>' +
      '<div class="agent-starts">' + starts.map(function (s, i) {
        return '<button type="button" class="agent-start" data-i="' + i + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[s[0]] + '</svg><b>' + s[1] + '</b><span>' + s[2] + '</span></button>';
      }).join('') + '</div>' +
      '<div class="agent-human"><div><b>Vous préférez une personne&nbsp;?</b><span>Le premier échange est gratuit.</span></div><a href="contact.html">Écrire</a></div>';
    h.querySelectorAll('.agent-start').forEach(function (b) { b.addEventListener('click', function () { ask(starts[+b.dataset.i][3]); }); });
    log.appendChild(h);
    return h;
  }
  function renderAll() {
    log.innerHTML = '';
    if (!state.messages.length) renderHello();
    else state.messages.forEach(function (m) { render(m, false); });
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
      statusEl.textContent = 'Le martin-pêcheur réfléchit…';
      mood('think');
    } else if (typing) {
      typing.remove(); typing = null;
      statusEl.textContent = 'Assistant de ZkilZ · en ligne';
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
    var hello = log.querySelector('.agent-hello');
    if (hello) hello.remove();
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
    if (!reduce) gsap.from(log.querySelectorAll('.agent-hello > *, .agent-start'), { y: 12, opacity: 0, duration: .45, stagger: .04, ease: 'power3.out' });
  });

  function goTo(id) {
    var el = document.querySelector(id);
    if (!el) return;
    if (window.skzScrollTo) window.skzScrollTo(el); else el.scrollIntoView({ behavior: 'smooth' });
  }

  // =========================================================================
  // OUVRIR / FERMER : la fenêtre se déplie depuis la bulle
  // =========================================================================
  var open = false, small = window.matchMedia('(max-width: 640px)');
  function openPanel() {
    if (open) return;
    open = true;
    hideTip(true);
    fab.setAttribute('aria-expanded', 'true');
    fab.classList.add('is-open');
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
    if (small.matches) document.documentElement.style.overflow = 'hidden';
    if (!log.children.length) renderAll();
    if (!reduce) {
      gsap.fromTo(panel, small.matches ? { yPercent: 100 } : { y: 24, scale: .94, opacity: 0, transformOrigin: '100% 100%' },
        small.matches ? { yPercent: 0, duration: .55, ease: 'expo.out' } : { y: 0, scale: 1, opacity: 1, duration: .5, ease: 'expo.out' });
      gsap.from(log.querySelectorAll('.agent-hello > *, .agent-start, .agent-msg'), { y: 14, opacity: 0, duration: .5, stagger: .04, ease: 'power3.out', delay: .12 });
      mood('idle');
    }
    setTimeout(function () { if (fine) input.focus({ preventScroll: true }); }, reduce ? 0 : 450);
    // l'accueil se lit depuis le haut ; une conversation, depuis le dernier message
    if (log.querySelector('.agent-hello')) log.scrollTop = 0; else scrollLog();
  }
  function close() {
    if (!open) return;
    open = false;
    fab.setAttribute('aria-expanded', 'false');
    fab.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    var done = function () { panel.hidden = true; gsap && gsap.set(panel, { clearProps: 'all' }); };
    if (reduce) { done(); return; }
    gsap.to(panel, small.matches ? { yPercent: 100, duration: .35, ease: 'power2.in', onComplete: done } : { y: 16, scale: .96, opacity: 0, duration: .25, ease: 'power2.in', onComplete: done });
    fab.focus({ preventScroll: true });
  }
  fab.addEventListener('click', function () { open ? close() : openPanel(); });
  document.getElementById('agentClose').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) close(); });

  // =========================================================================
  // LE MARTIN-PÊCHEUR DANS SA PASTILLE
  // =========================================================================
  function mood(m) {
    var src = m === 'think' ? (thinkSrc || avatarSrc) : m === 'idea' ? (ideaSrc || avatarSrc) : avatarSrc;
    if (peekHead.getAttribute('src') !== src) peekHead.src = src;
    if (reduce) return;
    if (m === 'think') gsap.to(peekHead, { rotation: -8, y: 2, duration: .4, ease: 'power2.out' });
    else gsap.timeline().to(peekHead, { rotation: 0, y: -5, duration: .18, ease: 'power2.out' }).to(peekHead, { y: 0, duration: .6, ease: 'bounce.out' });
    if (m === 'idea') setTimeout(function () { if (!busy) mood('idle'); }, 2400);
  }
  function blink(img) {
    if (!blinkSrc || reduce || !img) return;
    var orig = img.getAttribute('src');
    if (orig !== avatarSrc) return;
    img.src = blinkSrc;
    setTimeout(function () { img.src = orig; }, 130);
  }

  if (!reduce) {
    // Entrée : la pastille arrive, l'oiseau hoche la tête
    gsap.timeline({ delay: 1.6 })
      .fromTo(fab, { y: 30, opacity: 0, scale: .8 }, { y: 0, opacity: 1, scale: 1, duration: .8, ease: 'back.out(1.8)' })
      .fromTo(head, { rotation: -12, y: 8 }, { rotation: 0, y: 0, duration: .8, ease: 'elastic.out(1, .5)' }, .2);
    // Au repos : il cligne des yeux, penche la tête, de temps en temps
    (function loop() {
      setTimeout(function () {
        if (!document.hidden) {
          if (open) blink(peekHead);
          else if (!fab.matches(':hover')) {
            if (Math.random() < .6) blink(head);
            else gsap.timeline().to(head, { rotation: 8, duration: .35, ease: 'power2.out' }).to(head, { rotation: 0, duration: .8, ease: 'elastic.out(1, .4)' }, '+=.6');
          }
        }
        loop();
      }, 3800 + Math.random() * 3200);
    })();
    if (fine) {
      fab.addEventListener('pointerenter', function () { if (!open) gsap.to(head, { rotation: -6, y: -2, duration: .4, ease: 'back.out(2)' }); });
      fab.addEventListener('pointerleave', function () { gsap.to(head, { rotation: 0, y: 0, duration: .6, ease: 'elastic.out(1, .45)' }); });
    }
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
    tipText.textContent = text;
    if (!reduce) {
      gsap.fromTo(tip, { scale: .6, opacity: 0, y: 10 }, { scale: 1, opacity: 1, y: 0, duration: .55, ease: 'back.out(1.8)' });
      gsap.timeline().to(head, { y: -5, rotation: -6, duration: .25, ease: 'power2.out' }).to(head, { y: 0, rotation: 0, duration: .7, ease: 'bounce.out' });
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
