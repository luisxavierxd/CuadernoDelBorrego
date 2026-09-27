/* =====================================================================
   Lab f-fprime-fsecond (§8.3): f, f′ y f″ en tres gráficas sincronizadas
   con un cursor común. Marca máximos, mínimos e inflexiones.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  function d1(fn, x) { var e = 1e-4; return (fn(x + e) - fn(x - e)) / (2 * e); }
  function d2(fn, x) { var e = 1e-3; return (fn(x + e) - 2 * fn(x) + fn(x - e)) / (e * e); }

  // Raíces de g en [a, b]: cambios de signo (bisección) y “toques” donde |g| casi se anula sin cambiar de signo.
  function roots(g, a, b, n) {
    n = n || 800;
    var xs = [], gs = [], out = [], big = 0;
    for (var i = 0; i <= n; i++) { var x = a + (b - a) * i / n; xs.push(x); gs.push(g(x)); if (isFinite(gs[i])) big = Math.max(big, Math.abs(gs[i])); }
    function add(x, touch) { if (!out.some(function (r) { return Math.abs(r.x - x) < (b - a) / n * 1.5; })) out.push({ x: x, touch: touch }); }
    for (i = 0; i < n; i++) {
      var ga = gs[i], gb = gs[i + 1];
      if (!isFinite(ga) || !isFinite(gb)) continue;
      if (ga === 0) { add(xs[i], false); continue; }
      if (ga * gb < 0) {
        var lo = xs[i], hi = xs[i + 1], glo = ga;
        for (var k = 0; k < 60; k++) { var m = (lo + hi) / 2, gm = g(m); if (glo * gm <= 0) hi = m; else { lo = m; glo = gm; } }
        // Un salto (asíntota) también cambia de signo: solo cuenta si |g| es pequeño ahí.
        if (Math.abs(g((lo + hi) / 2)) < 1e-3 * (1 + big)) add((lo + hi) / 2, false);
      }
    }
    for (i = 1; i < n; i++) {
      var c = Math.abs(gs[i]);
      if (!isFinite(c) || !(c <= Math.abs(gs[i - 1]) && c <= Math.abs(gs[i + 1])) || c > 1e-2 * (1 + big)) continue;
      if (gs[i - 1] * gs[i + 1] < 0) continue;
      var L = xs[i - 1], R = xs[i + 1];
      for (k = 0; k < 80; k++) { var m1 = L + (R - L) / 3, m2 = R - (R - L) / 3; if (Math.abs(g(m1)) < Math.abs(g(m2))) R = m2; else L = m1; }
      var xm = (L + R) / 2;
      if (Math.abs(g(xm)) < 1e-5 * (1 + big)) add(xm, true);
    }
    return out.sort(function (p, q) { return p.x - q.x; });
  }

  // Criterio de la primera derivada: el signo de f′ a cada lado decide.
  function classify(fn, x, span) {
    var e = Math.max(1e-3, span * 2e-3), l = d1(fn, x - e), r = d1(fn, x + e);
    if (l > 0 && r < 0) return 'max';
    if (l < 0 && r > 0) return 'min';
    return 'none';
  }
  function analyze(fn, a, b) {
    var span = b - a;
    var crit = roots(function (x) { return d1(fn, x); }, a, b).map(function (r) { return { x: r.x, y: fn(r.x), kind: classify(fn, r.x, span) }; });
    var infl = roots(function (x) { return d2(fn, x); }, a, b).filter(function (r) {
      var e = Math.max(2e-3, span * 3e-3);
      return !r.touch && d2(fn, r.x - e) * d2(fn, r.x + e) < 0;
    }).map(function (r) { return { x: r.x, y: fn(r.x) }; });
    return { crit: crit.filter(function (c) { return isFinite(c.y); }), infl: infl.filter(function (c) { return isFinite(c.y); }) };
  }
  window.LabMath.extrema = { d1: d1, d2: d2, roots: roots, classify: classify, analyze: analyze };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { name: 'f(x) = x³ − 3x', f: 'x^3 - 3x', x: [-2.5, 2.5] },
    { name: 'f(x) = x⁴ − 4x²', f: 'x^4 - 4x^2', x: [-2.4, 2.4] },
    { name: 'f(x) = x·e^(−x)', f: 'x*e^(-x)', x: [-0.8, 5] },
    { name: 'f(x) = x³ (sin extremo)', f: 'x^3', x: [-1.6, 1.6] },
    { name: 'f(x) = sin x + x/2', f: 'sin(x) + x/2', x: [-1, 7] },
    { name: 'f(x) = x/(x² + 1)', f: 'x/(x^2 + 1)', x: [-4, 4] }
  ];
  var KIND = { max: 'máximo', min: 'mínimo', none: 'crítico sin extremo' };

  window.Labs['f-fprime-fsecond'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var presets = cfg.presets || PRESETS;
    var math = null, fn = null, info = null, P = presets[cfg.start || 0];
    function field(o) {
      if (window.CBMathInput) return window.CBMathInput.create(o);
      var f = UI.input(o);
      return { node: f.node, get: function () { return f.input.value; }, setMath: function (s) { f.input.value = s; } };
    }
    var preset = UI.select({ label: 'Ejemplo', options: presets.map(function (p) { return p.name; }) });
    var fIn = field({ label: 'Función f(x)', palette: 'none', onEnter: function () { build(); } });
    var run = UI.button('Graficar', 'primary', function () { build(); });
    var cur = UI.slider({ label: 'Cursor x', min: P.x[0], max: P.x[1], step: 0.01, value: (P.x[0] + P.x[1]) / 2, fmt: function (v) { return UI.fmt(v, 3); } }, draw);
    var status = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var list = h('ul', { class: 'lab-list' });
    var svgs = [
      UI.svg(640, 190, 'Gráfica de f con el cursor, los extremos y las inflexiones'),
      UI.svg(640, 170, 'Gráfica de la primera derivada con el cursor'),
      UI.svg(640, 170, 'Gráfica de la segunda derivada con el cursor')
    ];
    var names = ['f(x)', 'f′(x): pendiente de f', 'f″(x): concavidad de f'];
    var stack = h('div', { class: 'lab-stack' });
    svgs.forEach(function (s, i) { stack.appendChild(h('p', { class: 'lab-stack__label' }, [names[i]])); stack.appendChild(s); });
    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [preset.node, fIn.node, h('div', { class: 'lab-buttons' }, [run]), status, cur.node, facts, list]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Tres gráficas, un mismo x']),
        stack,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'f']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'f′']),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'f″']),
          h('li', {}, [h('i', { class: 'sw sw--error sw--dashed' }), 'cursor'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); build(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); build(); });

    function load(i) {
      P = presets[i];
      fIn.setMath(P.f);
      cur.input.min = P.x[0]; cur.input.max = P.x[1]; cur.set((P.x[0] + P.x[1]) / 2);
    }
    load(cfg.start || 0);

    function build() {
      if (!math) return;
      try {
        fn = window.LabMath.core.build(math, fIn.get()).fn;
        info = analyze(fn, P.x[0], P.x[1]);
        status.hidden = true;
      } catch (e) {
        UI.verdict(status, 'bad', 'No pude leer la función', e.message);
        fn = null; info = null;
      }
      list.innerHTML = '';
      if (info) {
        info.crit.forEach(function (c) { list.appendChild(h('li', {}, [KIND[c.kind] + ' en x ≈ ' + UI.fmt(c.x, 3) + ' (f = ' + UI.fmt(c.y, 3) + ')'])); });
        info.infl.forEach(function (c) { list.appendChild(h('li', {}, ['inflexión en x ≈ ' + UI.fmt(c.x, 3)])); });
        if (!info.crit.length && !info.infl.length) list.appendChild(h('li', {}, ['Sin puntos críticos ni inflexiones en esta ventana.']));
      }
      draw();
    }

    function panel(svg, g, cls, marks) {
      var x0 = P.x[0], x1 = P.x[1], ys = [];
      for (var i = 0; i <= 160; i++) ys.push(g(x0 + (x1 - x0) * i / 160));
      var plot = window.LabPlot(svg, { x: [x0, x1], y: window.LabPlot.range(ys) });
      plot.clear(); plot.grid(); plot.axes();
      plot.curve(g, cls, 3);
      var x = cur.get();
      plot.segments([[[x, plot.yr[0]], [x, plot.yr[1]]]], 'error', 1.5);
      marks(plot);
      plot.point(x, g(x), 'dot-' + cls, 5);
      return plot;
    }

    function draw() {
      if (!fn || !info) return;
      var p1 = function (x) { return d1(fn, x); }, p2 = function (x) { return d2(fn, x); };
      panel(svgs[0], fn, 'ref', function (plot) {
        info.crit.forEach(function (c) { if (c.kind !== 'none') { plot.point(c.x, c.y, 'dot-aux', 6); plot.label(c.x, c.y, c.kind === 'max' ? 'máx' : 'mín', 'middle', 14, 0, c.kind === 'max' ? -12 : 22); } });
        info.infl.forEach(function (c) { plot.point(c.x, c.y, 'dot-trace', 5); });
      });
      panel(svgs[1], p1, 'aux', function (plot) { info.crit.forEach(function (c) { plot.point(c.x, 0, 'dot-aux', 5); }); });
      panel(svgs[2], p2, 'trace', function (plot) { info.infl.forEach(function (c) { plot.point(c.x, 0, 'dot-trace', 5); }); });
      var x = cur.get(), s1 = p1(x), s2 = p2(x);
      facts.innerHTML = '';
      [['f(x)', UI.fmt(fn(x), 4)], ['f′(x)', UI.fmt(s1, 4) + (Math.abs(s1) < 1e-3 ? ' · plana' : s1 > 0 ? ' · f sube' : ' · f baja')],
       ['f″(x)', UI.fmt(s2, 4) + (Math.abs(s2) < 1e-3 ? '' : s2 > 0 ? ' · cóncava ∪' : ' · cóncava ∩')]]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    document.addEventListener('cb:themechange', draw);
    return UI.loadMath().then(function (m) { math = m; setTimeout(build, 300); });
  };
})();
