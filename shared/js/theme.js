/* =====================================================================
   Tema claro (cuaderno) / oscuro (pizarrón) — §5.1
   - El script inline del <head> ya puso data-theme antes del primer paint.
   - Aquí: botón [data-theme-toggle], persistencia en localStorage ('cb-theme')
     y evento 'cb:themechange' para que labs y canvas se redibujen.
   ===================================================================== */
(function () {
  var KEY = 'cb-theme';
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function stored() {
    try { var t = localStorage.getItem(KEY); return t === 'light' || t === 'dark' ? t : null; } catch (e) { return null; }
  }
  function current() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }

  function syncButtons() {
    var dark = current() === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      btn.setAttribute('aria-label', dark ? 'Cambiar a cuaderno (tema claro)' : 'Cambiar a pizarrón (tema oscuro)');
    });
  }

  function apply(theme, persist) {
    if (theme === current()) return;
    root.setAttribute('data-theme', theme);
    if (persist) { try { localStorage.setItem(KEY, theme); } catch (e) {} }
    syncButtons();
    document.dispatchEvent(new CustomEvent('cb:themechange', { detail: { theme: theme } }));
  }

  // Lee un token ya resuelto para el tema y la materia activos (labs, canvas).
  function color(name) {
    return getComputedStyle(document.body || root).getPropertyValue(name).trim();
  }

  function init() {
    syncButtons();
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () { apply(current() === 'dark' ? 'light' : 'dark', true); });
    });
    // Sin elección guardada, sigue al sistema en vivo.
    if (mq && mq.addEventListener) {
      mq.addEventListener('change', function (e) { if (!stored()) apply(e.matches ? 'dark' : 'light', false); });
    }
  }

  window.CBTheme = { init: init, get: current, set: function (t) { apply(t, true); }, color: color };
})();
