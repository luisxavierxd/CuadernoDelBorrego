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

  // Monta un lab y marca el nodo cuando está listo (lo revisa qa-browser.js).
  function mount(node, type, cfg) {
    var fn = window.Labs[type];
    if (!fn) {
      node.appendChild(h('p', { class: 'lab-missing' }, ['Este lab llega pronto.']));
      node.setAttribute('data-lab-ready', 'missing');
      return;
    }
    Promise.resolve(fn(node, cfg || {})).then(function () {
      node.setAttribute('data-lab-ready', 'true');
    }, function (e) {
      console.error(e);
      node.setAttribute('data-lab-ready', 'error');
    });
  }

  window.LabUI = {
    h: h, id: id, fmt: fmt, input: input, slider: slider, select: select, button: button,
    verdict: verdict, color: color, onVisible: onVisible, loadScript: loadScript,
    loadMath: loadMath, loadManim: loadManim, mount: mount, LIBS: LIBS
  };
})();
