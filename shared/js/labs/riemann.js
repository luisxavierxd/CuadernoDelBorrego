/* =====================================================================
   Lab riemann (§8.3): rectángulos que convergen al área bajo f.
   Sumas izquierda, derecha, de punto medio y trapecios; error contra la
   integral (Simpson con n = 400).
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  var SAMPLE = { left: 0, right: 1, mid: 0.5 };
  function rects(fn, a, b, n, type) {
    var dx = (b - a) / n, out = [];
    for (var i = 0; i < n; i++) {
      var x0 = a + i * dx, x1 = x0 + dx;
      if (type === 'trap') out.push({ x0: x0, x1: x1, y0: fn(x0), y1: fn(x1) });
      else { var y = fn(x0 + SAMPLE[type] * dx); out.push({ x0: x0, x1: x1, y0: y, y1: y }); }
    }
    return out;
  }
  function sum(fn, a, b, n, type) {
    return rects(fn, a, b, n, type).reduce(function (s, r) { return s + (r.x1 - r.x0) * (r.y0 + r.y1) / 2; }, 0);
  }
  function simpson(fn, a, b, n) {
    n = n || 400; if (n % 2) n++;
    var h = (b - a) / n, s = fn(a) + fn(b);
    for (var i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * fn(a + i * h);
    return s * h / 3;
  }
  window.LabMath.riemann = { rects: rects, sum: sum, simpson: simpson };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { name: 'f(x) = x² en [0, 2]', f: 'x^2', a: 0, b: 2 },
    { name: 'f(x) = sin x en [0, π]', f: 'sin(x)', a: 0, b: Math.PI },
    { name: 'f(x) = eˣ en [0, 1]', f: 'e^x', a: 0, b: 1 },
    { name: 'f(x) = 1/x en [1, 3]', f: '1/x', a: 1, b: 3 },
    { name: 'f(x) = x³ − x en [−1, 1.5]', f: 'x^3 - x', a: -1, b: 1.5 }
  ];
  var TYPES = [['left', 'Izquierda'], ['right', 'Derecha'], ['mid', 'Punto medio'], ['trap', 'Trapecios']];

  window.Labs['riemann'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var presets = cfg.presets || PRESETS;
    var math = null, fn = null, P = presets[cfg.start || 0];
    var preset = UI.select({ label: 'Función e intervalo', options: presets.map(function (p) { return p.name; }) });
    var type = UI.select({ label: 'Tipo de suma', options: TYPES.map(function (t) { return t[1]; }) });
    var nS = UI.slider({ label: 'Número de rectángulos n', min: 1, max: 100, step: 1, value: cfg.n || 4 }, draw);
    var facts = h('dl', { class: 'lab-facts' });
    var tbl = h('table', { class: 'lab-table' });
    var svg = UI.svg(640, 380, 'Gráfica de f con los rectángulos de la suma de Riemann');
    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [preset.node, type.node, nS.node, facts]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Más rectángulos, menos error']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'f(x)']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'rectángulos (área +)']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'área −'])
        ]),
        h('div', { class: 'lab-table-wrap' }, [tbl])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); });
    preset.input.addEventListener('change', function () { P = presets[+preset.input.value]; compile(); draw(); });
    type.input.addEventListener('change', draw);

    function compile() { fn = window.LabMath.core.build(math, P.f).fn; }
    function kind() { return TYPES[+type.input.value][0]; }

    function draw() {
      if (!fn) return;
      var n = nS.get(), t = kind(), pad = (P.b - P.a) * 0.08, ys = [];
      for (var i = 0; i <= 160; i++) ys.push(fn(P.a - pad + (P.b - P.a + 2 * pad) * i / 160));
      var plot = window.LabPlot(svg, { x: [P.a - pad, P.b + pad], y: window.LabPlot.range(ys) });
      plot.clear(); plot.grid();
      rects(fn, P.a, P.b, n, t).forEach(function (r) {
        var neg = (r.y0 + r.y1) < 0;
        plot.poly([[r.x0, 0], [r.x0, r.y0], [r.x1, r.y1], [r.x1, 0]], 'rect-fill' + (neg ? ' rect-fill--neg' : ''));
      });
      plot.axes();
      plot.curve(fn, 'ref', 3.5);
      var S = sum(fn, P.a, P.b, n, t), I = simpson(fn, P.a, P.b, 400);
      facts.innerHTML = '';
      [['suma con n = ' + n, UI.fmt(S, 6)], ['integral', UI.fmt(I, 6)], ['error', UI.fmt(Math.abs(S - I), 3)], ['Δx', UI.fmt((P.b - P.a) / n, 4)]]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
      tbl.innerHTML = '<caption>Error de la suma contra n</caption><thead><tr><th scope="col">n</th><th scope="col">suma</th><th scope="col">error</th></tr></thead>';
      var body = h('tbody');
      [4, 8, 16, 32, 64].forEach(function (k) {
        var s = sum(fn, P.a, P.b, k, t);
        body.appendChild(h('tr', {}, [h('td', {}, [String(k)]), h('td', {}, [UI.fmt(s, 6)]), h('td', {}, [UI.fmt(Math.abs(s - I), 3)])]));
      });
      tbl.appendChild(body);
    }

    document.addEventListener('cb:themechange', draw);
    return UI.loadMath().then(function (m) { math = m; compile(); draw(); });
  };
})();
