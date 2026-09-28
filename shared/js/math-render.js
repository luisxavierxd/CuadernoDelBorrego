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
  // Un ^1 después de un subíndice (\int_0^1, x_0^{1}) o de \int, \sum… es un límite, no un exponente.
  function dropPowerOne(m, off, str) {
    var before = str.slice(Math.max(0, off - 24), off);
    if (/_(\{[^{}]*\}|\\?[A-Za-z0-9]+)$/.test(before) || /\\(int|iint|oint|sum|prod|lim|bigcup|bigcap)$/.test(before)) return m;
    return '';
  }
  function tidy(s) {
    var prev;
    do {
      prev = s;
      s = s
        .replace(/\+\s*-\s*/g, '- ')          // + -6 → - 6
        .replace(/-\s*-\s*/g, '+ ')           // - -3 → + 3
        .replace(/-\s*\+\s*/g, '- ')          // - +3 → - 3
        .replace(ZERO_TERM, '')               // + 0t, - 0x^2
        .replace(/\^\{1\}|\^1(?![\d.])/g, dropPowerOne)   // x^1, x^{1} → x (pero no \int_0^1)
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
    watch();
  }

  // Si KaTeX (del CDN) tarda o no llegó, se reintenta: se revisa cada 250 ms y, a los 4 s sin
  // KaTeX, se vuelven a pedir sus dos archivos una vez. Así nunca quedan fórmulas como $…$.
  var watching = null, retried = false;
  var CDN = 'https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/';
  function load(src) {
    var s = document.createElement('script');
    s.src = src; s.async = false;
    document.head.appendChild(s);
  }
  function watch() {
    if (watching) return;
    var t0 = Date.now();
    watching = setInterval(function () {
      if (flush()) { clearInterval(watching); watching = null; return; }
      if (!retried && Date.now() - t0 > 4000) {
        retried = true;
        if (!window.katex) load(CDN + 'katex.min.js');
        load(CDN + 'contrib/auto-render.min.js');
      }
      if (Date.now() - t0 > 20000) { clearInterval(watching); watching = null; }
    }, 250);
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
