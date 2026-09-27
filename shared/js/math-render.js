/* =====================================================================
   KaTeX auto-render (§5.6): $…$ en línea y $$…$$ en bloque.
   El shell carga KaTeX 0.16.47 con defer; CBMath.render espera a que exista.
   El color lo hereda de --pen (claro) o --text (oscuro) vía sesion.css.
   ===================================================================== */
(function () {
  /* Las plantillas parametrizadas escriben "1x", "+ -6x" o "+ 0t" cuando un
     parámetro sale 1, negativo o 0. tidy() los deja como en papel antes de
     dibujar. Solo cambia lo que se ve: las respuestas se califican aparte. */
  var FN = '(?:[a-zA-Z]|\\\\(?:sin|cos|tan|sec|csc|cot|ln|log|sqrt|arcsin|arccos|arctan|pi)\\b|\\()';
  var ONE = new RegExp('(^|[\\s(\\[{=+\\-,])1\\s*(?=' + FN + ')', 'g');   // 1x → x · -1x → -x
  var ZERO_TERM = new RegExp('\\s*[+\\-]\\s*0\\s*(?:\\\\,)?\\s*(?:[a-zA-Z]|\\\\[a-zA-Z]+)(?:\\^\\{?[\\d.]+\\}?)?(?![\\w.])', 'g'); // + 0t → (nada)
  function tidy(s) {
    var prev;
    do {
      prev = s;
      s = s
        .replace(/\+\s*-\s*/g, '- ')          // + -6 → - 6
        .replace(/-\s*-\s*/g, '+ ')           // - -3 → + 3
        .replace(/-\s*\+\s*/g, '- ')          // - +3 → - 3
        .replace(ZERO_TERM, '')               // + 0t, - 0x^2
        .replace(/\^\{1\}/g, '')              // x^{1} → x
        .replace(/\^1(?![\d.])/g, '')         // x^1 → x
        .replace(ONE, '$1');                  // 1x → x
    } while (s !== prev);
    return s;
  }

  var OPTS = {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false }
    ],
    throwOnError: false,
    ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'input'],
    preProcess: tidy
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
  if (window.addEventListener) {
    window.addEventListener('DOMContentLoaded', flush);
    window.addEventListener('load', flush);
  }

  window.CBMath = { render: render, flush: flush, tidy: tidy };
})();
