/* ==========================================================================
   ZkilZ — Studio Moumous : le viseur
   Le reel ne se charge et ne joue que lorsqu'il est à l'écran, en muet ; le
   timecode du viseur défile avec la vidéo (à 24 images par seconde, à partir
   de 00:04:12:09, comme dans le film) ; un bouton active le son. Avec
   « réduire les animations », rien ne démarre seul : un clic lance la vidéo.
   ========================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BASE = ((4 * 60) + 12) * 24 + 9;            // 00:04:12:09, en images
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tc(frames) {
    var f = frames % 24, s = Math.floor(frames / 24);
    return '00:' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60) + ':' + pad(f);
  }
  document.querySelectorAll('[data-vf]').forEach(function (vf) {
    var v = vf.querySelector('video'), out = vf.querySelector('.vf-tc'), btn = vf.querySelector('.vf-sound');
    if (!v) return;
    var raf = null;
    function tick() { if (out) out.textContent = tc(BASE + Math.floor(v.currentTime * 24)); raf = requestAnimationFrame(tick); }
    v.addEventListener('play', function () { vf.classList.add('is-playing'); cancelAnimationFrame(raf); tick(); });
    v.addEventListener('pause', function () { vf.classList.remove('is-playing'); cancelAnimationFrame(raf); });
    function play() { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { if (v.preload === 'none') { v.preload = 'auto'; } play(); }
          else v.pause();
        });
      }, { threshold: .35 }).observe(vf);
    } else {
      vf.classList.add('is-manual');
      vf.addEventListener('click', function (e) { if (e.target.closest('.vf-sound')) return; if (v.paused) play(); else v.pause(); });
    }
    if (btn) btn.addEventListener('click', function () {
      v.muted = !v.muted;
      if (!v.muted && v.paused) play();
      btn.setAttribute('aria-pressed', String(!v.muted));
      btn.querySelector('span').textContent = v.muted ? 'Activer le son' : 'Couper le son';
      vf.classList.toggle('is-sound', !v.muted);
    });
  });
})();
