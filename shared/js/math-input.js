/* =====================================================================
   Editor matemático estilo WebAssign: <math-field> de MathLive con una
   paleta de símbolos debajo. Lo que el alumno escribe se ve formateado
   (fracciones, exponentes, raíces) y se convierte a math.js con CBLatex.
   Si MathLive no carga, queda un campo de texto normal con la misma API.

   CBMathInput.create({ label, hint, palette: 'calculo'|'fisica', onEnter })
     → { node, get(), setMath(expr), setLatex(tex), focus(), lock() }
   get() devuelve la expresión en sintaxis de math.js ('' si está vacío) y
   lanza un Error con mensaje en español si falta completar algo.
   ===================================================================== */
(function () {
  var URL = 'https://cdn.jsdelivr.net/npm/mathlive@0.110.0/mathlive.min.js';
  var loading = null;

  function load() {
    if (window.customElements && window.customElements.get('math-field')) return Promise.resolve(true);
    if (!loading) {
      loading = window.LabUI.loadScript(URL).then(function () {
        return window.customElements.whenDefined('math-field').then(function () { setupKeyboardClose(); return true; });
      });
    }
    return loading;
  }

  // Botón “Ocultar teclado”, fijo justo encima del teclado virtual mientras está abierto.
  var closeBtn = null;
  function setupKeyboardClose() {
    var kb = window.mathVirtualKeyboard;
    if (!kb || closeBtn) return;
    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'kbd-close';
    closeBtn.hidden = true;
    closeBtn.innerHTML = '<span aria-hidden="true">⌄</span> Ocultar teclado';
    closeBtn.addEventListener('mousedown', function (e) { e.preventDefault(); });
    closeBtn.addEventListener('click', function () { kb.hide(); sync(); });
    document.body.appendChild(closeBtn);
    function sync() {
      var h = kb.boundingRect ? kb.boundingRect.height : 0;
      var open = kb.visible && h > 0;
      closeBtn.hidden = !open;
      if (open) closeBtn.style.bottom = (h + 8) + 'px';
    }
    kb.addEventListener('geometrychange', sync);
    kb.addEventListener('virtual-keyboard-toggle', sync);
    window.addEventListener('resize', sync);
  }

  // Paleta: [texto del botón, LaTeX a insertar, nombre accesible]
  var BASE = [
    ['<span class="mp-frac"><i>a</i><i>b</i></span>', '\\frac{#@}{#?}', 'Fracción'],
    ['x<sup>n</sup>', '#@^{#?}', 'Potencia'],
    ['√', '\\sqrt{#0}', 'Raíz cuadrada'],
    ['<sup>n</sup>√', '\\sqrt[#?]{#0}', 'Raíz n-ésima'],
    ['|x|', '\\left|#0\\right|', 'Valor absoluto'],
    ['( )', '\\left(#0\\right)', 'Paréntesis'],
    ['·', '\\cdot', 'Multiplicar'],
    ['π', '\\pi', 'Pi'],
    ['e<sup>x</sup>', 'e^{#?}', 'Exponencial'],
    ['ln', '\\ln\\left(#0\\right)', 'Logaritmo natural'],
    ['sin', '\\sin\\left(#0\\right)', 'Seno'],
    ['cos', '\\cos\\left(#0\\right)', 'Coseno'],
    ['tan', '\\tan\\left(#0\\right)', 'Tangente'],
    ['sec', '\\sec\\left(#0\\right)', 'Secante'],
    ['sin<sup>−1</sup>', '\\arcsin\\left(#0\\right)', 'Arcoseno'],
    ['tan<sup>−1</sup>', '\\arctan\\left(#0\\right)', 'Arcotangente']
  ];
  var FISICA = [['°', '^{\\circ}', 'Grados']];

  function create(opts) {
    opts = opts || {};
    var h = window.LabUI.h;
    var id = window.LabUI.id('mf');
    var mf = document.createElement('math-field');
    mf.id = id;
    mf.className = 'math-field';
    mf.setAttribute('aria-label', opts.label || 'Tu respuesta');
    mf.setAttribute('math-virtual-keyboard-policy', 'manual');
    mf.setAttribute('smart-fence', 'on');
    var fallback = null;             // <input> si MathLive no carga
    var pending = null;              // valor puesto antes de que cargue
    var locked = false;

    var palette = h('div', { class: 'math-palette', role: 'toolbar', 'aria-label': 'Símbolos para ' + (opts.label || 'tu respuesta') });
    BASE.concat(opts.palette === 'fisica' ? FISICA : []).forEach(function (b) {
      var btn = h('button', { type: 'button', class: 'math-palette__btn', title: b[2], 'aria-label': b[2], html: b[0] });
      btn.addEventListener('mousedown', function (e) { e.preventDefault(); });     // no robar el foco
      btn.addEventListener('click', function () {
        if (locked) return;
        if (fallback) { fallback.focus(); return; }
        mf.executeCommand(['insert', b[1], { focus: true, feedback: false, selectionMode: 'placeholder' }]);
        mf.focus();
      });
      palette.appendChild(btn);
    });
    var kbd = h('button', { type: 'button', class: 'math-palette__btn math-palette__kbd', title: 'Teclado matemático', 'aria-label': 'Mostrar teclado matemático', html: '⌨' });
    kbd.addEventListener('mousedown', function (e) { e.preventDefault(); });
    kbd.addEventListener('click', function () {
      if (fallback || !window.mathVirtualKeyboard) return;
      mf.focus();
      window.mathVirtualKeyboard.visible ? window.mathVirtualKeyboard.hide() : window.mathVirtualKeyboard.show();
    });
    palette.appendChild(kbd);

    if (opts.palette === 'none') palette.hidden = true;
    var box = h('div', { class: 'math-input__box' }, [mf]);
    var node = h('div', { class: 'lab-field math-input' }, [
      h('label', { for: id, class: 'lab-field__label' }, [opts.label || 'Tu respuesta']),
      box, palette,
      opts.hint ? h('p', { class: 'lab-field__hint', html: opts.hint }) : null
    ]);

    mf.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && opts.onEnter) { e.preventDefault(); opts.onEnter(); }
    });

    function useFallback() {
      if (fallback) return;
      fallback = h('input', { id: id, type: 'text', class: 'lab-input lab-input--mono', spellcheck: 'false', autocomplete: 'off' });
      if (opts.onEnter) fallback.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); opts.onEnter(); } });
      box.replaceChild(fallback, mf);
      palette.hidden = true;
      if (pending && pending.math != null) fallback.value = pending.math;
    }

    load().then(function () {
      if (pending) {
        if (pending.latex != null) mf.value = pending.latex;
        else if (pending.math != null) setMath(pending.math);
        pending = null;
      }
    }, useFallback);

    function toTex(expr) {
      var prep = window.LabMath && window.LabMath.antiderivative ? window.LabMath.antiderivative.prep : function (s) { return s; };
      return window.math.parse(prep(expr)).toTex({ implicit: 'hide', parenthesis: 'auto' });
    }
    function setMath(expr) {
      if (fallback) { fallback.value = expr; return; }
      if (!window.math) { window.LabUI.loadMath().then(function () { setMath(expr); }); return; }
      if (!window.customElements.get('math-field')) { pending = { math: expr }; return; }
      try { mf.value = toTex(expr); } catch (e) { mf.value = expr; }
    }
    function setLatex(tex) {
      if (fallback) { fallback.value = window.CBLatex.toMath(tex); return; }
      if (!window.customElements.get('math-field')) { pending = { latex: tex }; return; }
      mf.value = tex;
    }
    function get() {
      if (fallback) return fallback.value.trim();
      var tex = (mf.value || '').trim();
      if (!tex) return '';
      return window.CBLatex.toMath(tex);
    }
    function latex() { return fallback ? fallback.value : (mf.value || ''); }

    return {
      node: node, get: get, setMath: setMath, setLatex: setLatex, latex: latex,
      focus: function () { (fallback || mf).focus(); },
      lock: function () {
        locked = true;
        if (fallback) fallback.readOnly = true; else mf.readOnly = true;
        palette.classList.add('is-locked');
      },
      onInput: function (fn) { (fallback || mf).addEventListener('input', fn); }
    };
  }

  window.CBMathInput = { create: create, load: load };
})();
