/* =====================================================================
   Registro de labs (§8.1), patrón CadSims de MadRams.
   window.Labs[type](mount, cfg)  → monta la UI (la llama session-template.js)
   window.LabMath.<modulo>         → matemática pura, sin DOM, probada en Node
                                     (scripts/labs-math.test.js). math.js se inyecta.
   window.LabUI                    → helpers de UI: controles nativos con <label>,
                                     veredictos con texto, carga diferida.
   Reglas: colores solo desde tokens (LabUI.color), sin requestAnimationFrame en
   bucle con la escena quieta, siempre un ejemplo cargado al abrir.
   ===================================================================== */
(function () {
  window.Labs = window.Labs || {};
  window.LabMath = window.LabMath || {};

  /* ---------- Matemática común de los labs (pura; math.js se inyecta) ---------- */
  function prep(s) {
    return String(s)
      // (^|no-letra) en lugar de \b: “2ln(x)” también es ln
      .replace(/(?<![a-zA-Z])ln\s*\(/g, 'log(').replace(/(?<![a-zA-Z])arctan\s*\(/g, 'atan(')
      .replace(/(^|[^a-zA-Z])arcsin\s*\(/g, '$1asin(').replace(/(^|[^a-zA-Z])arccos\s*\(/g, '$1acos(')
      .replace(/\+\s*C\b/g, '').replace(/−/g, '-')
      // math.js lee 0x, 0b y 0o como prefijos hexadecimal, binario y octal: “0x” debe ser 0·x
      .replace(/(^|[^\w.])0([a-zA-Z])/g, '$10*$2');
  }
  // Compila una expresión con las variables dadas: fn(x) o fn(x, y). Fuera de dominio → NaN.
  function build(math, src, vars) {
    vars = vars || ['x'];
    var node = math.parse(prep(src));
    var code = node.compile();
    return {
      node: node,
      fn: function () {
        var scope = {};
        for (var i = 0; i < vars.length; i++) scope[vars[i]] = arguments[i];
        try { var v = code.evaluate(scope); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; }
      }
    };
  }
  // Compara valores [real, del alumno]: correcto, signo invertido, factor constante o distinto.
  // Mismo criterio que la demo aprobada: error relativo |s − t| / (1 + |t|) < 1e-6.
  function compareValues(pairs, minValid) {
    var ok = pairs.filter(function (p) { return isFinite(p[0]) && isFinite(p[1]); });
    var maxErr = 0, ratios = [];
    ok.forEach(function (p) {
      maxErr = Math.max(maxErr, Math.abs(p[1] - p[0]) / (1 + Math.abs(p[0])));
      if (Math.abs(p[0]) > 1e-6) ratios.push(p[1] / p[0]);
    });
    var need = minValid || 10;
    var r = { kind: 'bad', reason: 'mismatch', k: null, maxErr: maxErr, valid: ok.length };
    if (ok.length < need) { r.reason = 'domain'; return r; }
    if (maxErr < 1e-6) { r.kind = 'ok'; r.reason = 'correct'; return r; }
    if (ratios.length >= need) {
      var mean = ratios.reduce(function (s, x) { return s + x; }, 0) / ratios.length;
      var spread = Math.max.apply(null, ratios.map(function (x) { return Math.abs(x - mean); }));
      if (spread < 1e-6 * Math.max(1, Math.abs(mean))) {
        r.kind = 'warn'; r.k = mean;
        r.reason = Math.abs(mean + 1) < 1e-6 ? 'sign' : 'factor';
      }
    }
    return r;
  }
  function compare(tFn, sFn, a, b, n) {
    n = n || 60;
    var pairs = [];
    for (var i = 0; i < n; i++) { var x = a + (b - a) * (i + 0.5) / n; pairs.push([tFn(x), sFn(x)]); }
    return compareValues(pairs);
  }
  window.LabMath.core = { prep: prep, build: build, compare: compare, compareValues: compareValues };

  var LIBS = {
    math: 'https://cdn.jsdelivr.net/npm/mathjs@15.2.0/lib/browser/math.js',
    manim: 'https://cdn.jsdelivr.net/npm/manim-web@0.3.24/dist/manim-web.browser.js'
  };

  function h(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v === true ? '' : v);
    });
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  var uid = 0;
  function id(prefix) { uid += 1; return (prefix || 'lab') + '-' + uid; }

  function fmt(v, digits) {
    if (typeof v !== 'number' || !isFinite(v)) return '—';
    if (Math.abs(v) < 1e-12) return '0';
    return Number(v.toPrecision(digits || 6)).toString();
  }

  // Campo de texto o número con <label> y ayuda opcional.
  function input(opts) {
    var inputId = id('in');
    var el = h('input', {
      id: inputId, type: opts.type || 'text', value: opts.value != null ? String(opts.value) : '',
      step: opts.step, inputmode: opts.inputmode, spellcheck: 'false', autocomplete: 'off',
      class: 'lab-input' + (opts.mono === false ? '' : ' lab-input--mono'),
      'aria-describedby': opts.hint ? inputId + '-hint' : null
    });
    var node = h('div', { class: 'lab-field' }, [
      h('label', { for: inputId, class: 'lab-field__label' }, [opts.label]),
      el,
      opts.hint ? h('p', { id: inputId + '-hint', class: 'lab-field__hint', html: opts.hint }) : null
    ]);
    return { node: node, input: el };
  }

  function slider(opts, onInput) {
    var inputId = id('rng');
    var out = h('output', { class: 'lab-field__out', for: inputId });
    var el = h('input', { type: 'range', id: inputId, min: opts.min, max: opts.max, step: opts.step || 1, value: opts.value, class: 'lab-range' });
    function show() { out.textContent = (opts.fmt ? opts.fmt(+el.value) : el.value) + (opts.unit ? ' ' + opts.unit : ''); }
    el.addEventListener('input', function () { show(); if (onInput) onInput(+el.value); });
    show();
    var node = h('div', { class: 'lab-field lab-field--range' }, [
      h('div', { class: 'lab-field__row' }, [h('label', { for: inputId, class: 'lab-field__label' }, [opts.label]), out]),
      el
    ]);
    return { node: node, input: el, get: function () { return +el.value; }, set: function (v) { el.value = v; show(); } };
  }

  function select(opts) {
    var selId = id('sel');
    var el = h('select', { id: selId, class: 'lab-input' }, opts.options.map(function (o, i) {
      return h('option', { value: String(i) }, [o]);
    }));
    var node = h('div', { class: 'lab-field' }, [h('label', { for: selId, class: 'lab-field__label' }, [opts.label]), el]);
    return { node: node, input: el };
  }

  function button(label, variant, onClick) {
    var b = h('button', { type: 'button', class: 'btn btn--small ' + (variant === 'ghost' ? 'btn--ghost' : 'btn--primary') }, [label]);
    if (onClick) b.addEventListener('click', onClick);
    return b;
  }

  // Veredicto: el estado siempre va escrito, además del color (§5.5).
  var STATE_LABEL = { ok: 'Correcto', warn: 'Casi', bad: 'Revisa' };
  function verdict(node, kind, title, note) {
    node.hidden = false;
    node.className = 'verdict verdict--' + kind;
    node.innerHTML = '';
    node.appendChild(h('span', { class: 'verdict__state' }, [STATE_LABEL[kind] || '']));
    node.appendChild(h('strong', { class: 'verdict__title' }, [title]));
    if (note) node.appendChild(h('p', { class: 'verdict__note' }, [note]));
  }

  function color(name) {
    return window.CBTheme ? window.CBTheme.color(name) : getComputedStyle(document.body).getPropertyValue(name).trim();
  }

  // Llama cb una sola vez cuando el nodo se acerca al viewport (carga diferida).
  function onVisible(node, cb) {
    if (!('IntersectionObserver' in window)) { cb(); return; }
    var obs = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { obs.disconnect(); cb(); }
    }, { rootMargin: '300px 0px' });
    obs.observe(node);
  }

  var scripts = {};
  function loadScript(src) {
    if (!scripts[src]) {
      scripts[src] = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = src; s.async = true;
        s.onload = resolve;
        s.onerror = function () { reject(new Error('No se pudo cargar ' + src)); };
        document.head.appendChild(s);
      });
    }
    return scripts[src];
  }
  function loadMath() {
    return window.math ? Promise.resolve(window.math) : loadScript(LIBS.math).then(function () { return window.math; });
  }
  var manimP = null;
  function loadManim() {
    manimP = manimP || import(LIBS.manim);
    return manimP;
  }

  // La gráfica acompaña al scroll (técnica del circuito del Portfolio): en PC se fija
  // centrada en el espacio bajo el encabezado mientras se bajan los controles. Si la
  // gráfica es más alta que la ventana no se fija, para que nada quede inalcanzable.
  // En móvil lo resuelve el CSS (se pega arriba con alto máximo).
  function follow(node) {
    var board = node.querySelector('.lab-grid > .lab-board');
    if (!board) return;
    function fit() {
      var hh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
      var vh = window.innerHeight, h = board.offsetHeight, room = vh - hh - 24;
      var ok = h > 0 && h <= room;
      board.classList.toggle('is-follow', ok);
      if (ok) board.style.setProperty('--board-top', Math.round(hh + (vh - hh - h) / 2) + 'px');
    }
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(board);
    window.addEventListener('resize', fit);
    fit();
  }

  // Monta un lab y marca el nodo cuando está listo (lo revisa qa-browser.js).
  function mount(node, type, cfg) {
    var fn = window.Labs[type];
    if (!fn) {
      node.appendChild(h('p', { class: 'lab-missing' }, ['Este lab llega pronto.']));
      node.setAttribute('data-lab-ready', 'missing');
      return;
    }
    var ready = fn(node, cfg || {});
    follow(node);                     // el lab ya armó su DOM; la gráfica acompaña al scroll
    Promise.resolve(ready).then(function () {
      node.setAttribute('data-lab-ready', 'true');
    }, function (e) {
      console.error(e);
      node.setAttribute('data-lab-ready', 'error');
    });
  }

  // Lienzo SVG accesible para los labs.
  function svg(w, hgt, label) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    n.setAttribute('viewBox', '0 0 ' + w + ' ' + hgt);
    n.setAttribute('class', 'lab-stage lab-plot');
    n.setAttribute('role', 'img');
    n.setAttribute('aria-label', label || 'Gráfica');
    return n;
  }

  function tex(math, expr) {
    try { return '$' + math.parse(window.LabMath.core.prep(expr)).toTex({ implicit: 'hide', parenthesis: 'auto' }) + '$'; }
    catch (e) { return expr; }
  }
  function renderMath(node) { if (window.CBMath) window.CBMath.render(node); }

  // Campo de fórmula con el teclado matemático extendido (MathLive); sin él, una caja de texto.
  function mathField(o) {
    if (window.CBMathInput) return window.CBMathInput.create(o);
    var f = input(o);
    if (o.onEnter) f.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); o.onEnter(); } });
    return { node: f.node, get: function () { return f.input.value; }, setMath: function (s) { f.input.value = s; } };
  }
  // Dos números en fila (por ejemplo, la ventana de x o los límites a y b).
  function rangeField(labels, values, onEnter) {
    var A = input({ label: labels[0], type: 'number', step: 'any', inputmode: 'decimal', value: values[0], mono: false });
    var B = input({ label: labels[1], type: 'number', step: 'any', inputmode: 'decimal', value: values[1], mono: false });
    [A, B].forEach(function (f) { f.input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && onEnter) { e.preventDefault(); onEnter(); } }); });
    return {
      node: h('div', { class: 'lab-row' }, [A.node, B.node]),
      get: function () { return [parseFloat(A.input.value), parseFloat(B.input.value)]; },
      set: function (a, b) { A.input.value = String(+a.toFixed(4)); B.input.value = String(+b.toFixed(4)); }
    };
  }

  window.LabUI = {
    svg: svg, tex: tex, renderMath: renderMath, mathField: mathField, rangeField: rangeField,
    h: h, id: id, fmt: fmt, input: input, slider: slider, select: select, button: button,
    verdict: verdict, color: color, onVisible: onVisible, loadScript: loadScript,
    loadMath: loadMath, loadManim: loadManim, mount: mount, LIBS: LIBS
  };
})();
