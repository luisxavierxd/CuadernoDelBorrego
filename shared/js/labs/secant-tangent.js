/* =====================================================================
   Lab secant-tangent (§8.3): la secante por (a, f(a)) y (a + h, f(a + h))
   gira hacia la tangente cuando h → 0. Tabla de pendientes contra h.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  function slope(fn, a, h) { return (fn(a + h) - fn(a)) / h; }
  function tangentSlope(fn, a) { var e = 1e-5; return (fn(a + e) - fn(a - e)) / (2 * e); }
  function table(fn, a, hs) { return hs.map(function (h) { return { h: h, m: slope(fn, a, h) }; }); }
  function tangentLine(fn, a) {
    var m = tangentSlope(fn, a), y0 = fn(a);
    return { m: m, b: y0 - m * a, y: function (x) { return y0 + m * (x - a); } };
  }
  window.LabMath.secant = { slope: slope, tangentSlope: tangentSlope, table: table, tangentLine: tangentLine };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { name: 'f(x) = x²', f: 'x^2', a: 1, x: [-1.5, 3], y: [-1, 7] },
    { name: 'f(x) = x³ − 3x', f: 'x^3 - 3x', a: 0.5, x: [-2.5, 2.8], y: [-4, 6] },
    { name: 'f(x) = sin x', f: 'sin(x)', a: 0.8, x: [-1, 4.5], y: [-1.6, 1.8] },
    { name: 'f(x) = eˣ', f: 'e^x', a: 0, x: [-2, 2.2], y: [-1, 6] },
    { name: 'f(x) = √x', f: 'sqrt(x)', a: 1, x: [-0.3, 4.5], y: [-0.6, 2.6] }
  ];
  var HS = [1, 0.5, 0.1, 0.01, 0.001];

  window.Labs['secant-tangent'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var presets = cfg.presets || PRESETS;
    var math = null, fn = null, P = presets[cfg.start || 0];

    var preset = UI.select({ label: 'Función', options: presets.map(function (p) { return p.name; }) });
    var aS = UI.slider({ label: 'Punto a', min: P.x[0] + 0.3, max: P.x[1] - 1.2, step: 0.05, value: P.a, fmt: function (v) { return UI.fmt(v, 3); } }, draw);
    // h en escala logarítmica: la barra va de 10⁰ a 10⁻³
    var hS = UI.slider({ label: 'Separación h', min: -3, max: 0, step: 0.05, value: 0, fmt: function (v) { return UI.fmt(Math.pow(10, v), 3); } }, draw);
    var note = h('p', { class: 'lab-note' }, ['Mueve h hacia la izquierda: la secante (verde) gira hasta confundirse con la tangente (punteada).']);
    var tbl = h('table', { class: 'lab-table' });
    var readout = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(640, 380, 'Gráfica de f con la recta secante y la tangente en x = a');
    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [preset.node, aS.node, hS.node, note, readout]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['La secante se vuelve tangente']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'f(x)']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'secante']),
          h('li', {}, [h('i', { class: 'sw sw--trace sw--dashed' }), 'tangente en a'])
        ]),
        h('div', { class: 'lab-table-wrap' }, [tbl])
      ])
    ]));
    preset.input.addEventListener('change', function () {
      P = presets[+preset.input.value];
      aS.input.min = P.x[0] + 0.3; aS.input.max = P.x[1] - 1.2; aS.set(P.a);
      compile(); draw();
    });

    function compile() { fn = window.LabMath.core.build(math, P.f).fn; }

    function draw() {
      if (!fn) return;
      var a = aS.get(), hh = Math.pow(10, hS.get());
      var plot = window.LabPlot(svg, { x: P.x, y: P.y });
      plot.clear(); plot.grid(); plot.axes();
      plot.curve(fn, 'ref', 3.5);
      var m = slope(fn, a, hh), T = tangentLine(fn, a);
      plot.line(function (x) { return fn(a) + m * (x - a); }, 'aux', 3);
      plot.line(T.y, 'trace', 1.8, '6 6');
      plot.point(a, fn(a), 'dot-ref');
      plot.point(a + hh, fn(a + hh), 'dot-aux');
      plot.label(a, P.y[0], 'a', 'middle', 16);
      readout.innerHTML = '';
      [['h', UI.fmt(hh, 4)], ['pendiente secante', UI.fmt(m, 6)], ['pendiente tangente', UI.fmt(T.m, 6)], ['diferencia', UI.fmt(Math.abs(m - T.m), 3)]]
        .forEach(function (r) { readout.appendChild(h('dt', {}, [r[0]])); readout.appendChild(h('dd', {}, [r[1]])); });
      tbl.innerHTML = '<caption>Pendiente de la secante contra h</caption><thead><tr><th scope="col">h</th><th scope="col">[f(a+h) − f(a)] / h</th></tr></thead>';
      var body = h('tbody');
      table(fn, a, HS).forEach(function (r) { body.appendChild(h('tr', {}, [h('td', {}, [String(r.h)]), h('td', {}, [UI.fmt(r.m, 6)])])); });
      tbl.appendChild(body);
    }

    document.addEventListener('cb:themechange', draw);
    return UI.loadMath().then(function (m) { math = m; compile(); draw(); });
  };
})();
