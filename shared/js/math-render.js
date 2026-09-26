/* =====================================================================
   KaTeX auto-render (§5.6): $…$ en línea y $$…$$ en bloque.
   El shell carga KaTeX 0.16.47 con defer; CBMath.render espera a que exista.
   El color lo hereda de --pen (claro) o --text (oscuro) vía sesion.css.
   ===================================================================== */
(function () {
  var OPTS = {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false }
    ],
    throwOnError: false,
    ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'input']
  };
  var queue = [];

  function ready() { return typeof window.renderMathInElement === 'function'; }

  function render(el) {
    if (!el) return;
    if (ready()) { window.renderMathInElement(el, OPTS); return; }
    queue.push(el);
  }

  // KaTeX llega con defer: vacía la cola cuando termina de cargar.
  function flush() {
    if (!ready()) return false;
    queue.splice(0).forEach(function (el) { window.renderMathInElement(el, OPTS); });
    return true;
  }
  window.addEventListener('DOMContentLoaded', flush);
  window.addEventListener('load', flush);

  window.CBMath = { render: render, flush: flush };
})();
