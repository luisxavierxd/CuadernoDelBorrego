/* =====================================================================
   Animaciones compartidas (anime.js 3.2.1).
   - Reveal al hacer scroll, contadores, aviso descartable de reduced-motion.
   - Todo tiene un estado final estático para prefers-reduced-motion o sin anime.
   ===================================================================== */
(function () {
  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function canAnimate() { return !reducedMotion() && typeof anime !== 'undefined'; }

  function revealElement(el) {
    el.classList.add('is-visible');
    if (!canAnimate()) return;
    anime({ targets: el, translateY: [22, 0], opacity: [0, 1], duration: 600, easing: 'easeOutQuad' });
  }

  var observer = null;
  function observeReveals(scope) {
    var items = (scope || document).querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) { items.forEach(revealElement); return; }
    observer = observer || new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { revealElement(entry.target); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { observer.observe(el); });
  }

  function animateCounters(scope) {
    (scope || document).querySelectorAll('[data-counter]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-counter'), 10) || 0;
      var fmt = function (v) { return v.toLocaleString('es-MX'); };
      if (!canAnimate() || !('IntersectionObserver' in window)) { el.textContent = fmt(target); return; }
      el.textContent = '0';
      var obj = { v: 0 };
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          anime({ targets: obj, v: target, round: 1, duration: 1100, easing: 'easeOutExpo',
            update: function () { el.textContent = fmt(obj.v); } });
          obs.unobserve(el);
        });
      }, { threshold: 0.5 });
      obs.observe(el);
    });
  }

  // Entrada escalonada del texto del hero.
  function animateIntro() {
    var targets = document.querySelectorAll('[data-intro] > *');
    if (!targets.length || !canAnimate()) return;
    anime({ targets: targets, translateY: [18, 0], opacity: [0, 1],
      delay: anime.stagger(90, { start: 120 }), duration: 700, easing: 'easeOutExpo' });
  }

  function showReducedMotionNotice(what) {
    if (!reducedMotion()) return;
    try { if (sessionStorage.getItem('cb-rm-notice') === '1') return; } catch (e) {}
    var notice = document.createElement('div');
    notice.className = 'rm-notice';
    notice.setAttribute('role', 'status');
    notice.innerHTML =
      '<span>Tu sistema tiene activado <strong>“reducir movimiento”</strong>, por eso ' +
      (what || 'los dibujos se muestran') + ' sin animación.</span>' +
      '<button type="button" aria-label="Cerrar aviso">&times;</button>';
    notice.querySelector('button').addEventListener('click', function () {
      notice.remove();
      try { sessionStorage.setItem('cb-rm-notice', '1'); } catch (e) {}
    });
    document.body.appendChild(notice);
  }

  // Dibuja trazos SVG (stroke-dashoffset). Devuelve la animación o null.
  function drawStrokes(targets, opts) {
    opts = opts || {};
    if (!canAnimate()) return null;
    return anime(Object.assign({
      targets: targets, strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutSine', duration: 1200, delay: anime.stagger(120)
    }, opts));
  }

  function init(opts) {
    opts = opts || {};
    animateIntro();
    observeReveals(document);
    animateCounters(document);
    showReducedMotionNotice(opts.noticeWhat);
  }

  window.CBAnim = {
    init: init, revealNew: observeReveals, counters: animateCounters,
    drawStrokes: drawStrokes, reducedMotion: reducedMotion, canAnimate: canAnimate
  };
})();
