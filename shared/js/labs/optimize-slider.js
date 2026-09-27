/* =====================================================================
   Lab optimize-slider (§8.3): el alumno mueve la variable de un problema
   de optimización; la gráfica del objetivo muestra que el óptimo cae donde
   la tangente es horizontal (f′ = 0).
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  // Óptimo de fn en [a, b]: barrido fino y refinamiento por sección dorada.
  function optimum(fn, a, b, kind) {
    var sgn = kind === 'min' ? 1 : -1, n = 2000, best = a, bv = Infinity;
    for (var i = 0; i <= n; i++) { var x = a + (b - a) * i / n, v = sgn * fn(x); if (isFinite(v) && v < bv) { bv = v; best = x; } }
    var h = (b - a) / n, L = Math.max(a, best - h), R = Math.min(b, best + h), g = (Math.sqrt(5) - 1) / 2;
    for (var k = 0; k < 100; k++) {
      var c = R - g * (R - L), d = L + g * (R - L);
      if (sgn * fn(c) < sgn * fn(d)) R = d; else L = c;
    }
    var xs = (L + R) / 2;
    return { x: xs, value: fn(xs) };
  }
  function slope(fn, x) { var e = 1e-5; return (fn(x + e) - fn(x - e)) / (2 * e); }

  // Problemas modelo: objetivo(x, p), dominio y óptimo exacto para las pruebas.
  var PROBLEMS = {
    caja: {
      name: 'Caja sin tapa', kind: 'max', param: { label: 'Lado de la lámina L', min: 10, max: 60, step: 2, value: 30, unit: 'cm' },
      variable: 'x (lado del cuadrado que se corta)', unit: 'cm', objective: 'Volumen V', ounit: 'cm³',
      tex: 'V(x) = x\\,(L - 2x)^2',
      f: function (x, L) { return x * (L - 2 * x) * (L - 2 * x); },
      domain: function (L) { return [0, L / 2]; },
      exact: function (L) { return L / 6; }
    },
    corral: {
      name: 'Corral junto a un río', kind: 'max', param: { label: 'Metros de cerca P', min: 40, max: 400, step: 10, value: 120, unit: 'm' },
      variable: 'x (lado perpendicular al río)', unit: 'm', objective: 'Área A', ounit: 'm²',
      tex: 'A(x) = x\\,(P - 2x)',
      f: function (x, P) { return x * (P - 2 * x); },
      domain: function (P) { return [0, P / 2]; },
      exact: function (P) { return P / 4; }
    },
    lata: {
      name: 'Lata con el mínimo de lámina', kind: 'min', param: { label: 'Volumen V', min: 200, max: 1500, step: 50, value: 355, unit: 'cm³' },
      variable: 'r (radio)', unit: 'cm', objective: 'Superficie S', ounit: 'cm²',
      tex: 'S(r) = 2\\pi r^2 + \\dfrac{2V}{r}',
      f: function (r, V) { return 2 * Math.PI * r * r + 2 * V / r; },
      domain: function (V) { return [Math.cbrt(V) * 0.12, Math.cbrt(V) * 1.2]; },
      exact: function (V) { return Math.cbrt(V / (2 * Math.PI)); }
    },
    ventana: {
      name: 'Rectángulo en un semicírculo', kind: 'max', param: { label: 'Radio R', min: 1, max: 10, step: 0.5, value: 4, unit: 'm' },
      variable: 'x (mitad de la base)', unit: 'm', objective: 'Área A', ounit: 'm²',
      tex: 'A(x) = 2x\\sqrt{R^2 - x^2}',
      f: function (x, R) { return 2 * x * Math.sqrt(Math.max(0, R * R - x * x)); },
      domain: function (R) { return [0, R]; },
      exact: function (R) { return R / Math.SQRT2; }
    }
  };
  window.LabMath.optimize = { optimum: optimum, slope: slope, problems: PROBLEMS };

  /* ------------------------------ UI ------------------------------ */
  window.Labs['optimize-slider'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var keys = cfg.problems || Object.keys(PROBLEMS), key = keys[cfg.start || 0], Pb = PROBLEMS[key];
    var sel = UI.select({ label: 'Problema', options: keys.map(function (k) { return PROBLEMS[k].name; }) });
    var formula = h('p', { class: 'lab-note' });
    var pS = UI.slider({ label: Pb.param.label, min: Pb.param.min, max: Pb.param.max, step: Pb.param.step, value: Pb.param.value, fmt: function (v) { return UI.fmt(v, 4) + ' ' + Pb.param.unit; } }, function () { resetX(); draw(); });
    var xS = UI.slider({ label: 'Tu variable', min: 0, max: 1, step: 0.001, value: 0.2, fmt: function (v) { return UI.fmt(v, 3); } }, draw);
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var reveal = UI.button('Mostrar el óptimo', 'ghost', function () { shown = true; draw(); });
    var shown = false;
    var svg = UI.svg(640, 380, 'Gráfica del objetivo contra la variable, con tu punto y su tangente');
    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [sel.node, formula, pS.node, xS.node, verdict, facts, h('div', { class: 'lab-buttons' }, [reveal])]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['El óptimo está donde la tangente es plana']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'objetivo']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'tangente en tu x']),
          h('li', {}, [h('i', { class: 'sw sw--trace sw--dashed' }), 'óptimo'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); });
    sel.input.addEventListener('change', function () { key = keys[+sel.input.value]; Pb = PROBLEMS[key]; setup(); });

    function setup() {
      var lab = pS.node.querySelector('label');
      if (lab) lab.textContent = Pb.param.label;
      pS.input.min = Pb.param.min; pS.input.max = Pb.param.max; pS.input.step = Pb.param.step; pS.set(Pb.param.value);
      formula.innerHTML = 'Objetivo: $' + Pb.tex + '$ · variable: ' + Pb.variable + '.';
      UI.renderMath(formula);
      shown = false; resetX(); draw();
    }
    function resetX() {
      var d = Pb.domain(pS.get());
      xS.input.min = d[0]; xS.input.max = d[1]; xS.input.step = (d[1] - d[0]) / 400;
      xS.set(d[0] + (d[1] - d[0]) * 0.15);
    }

    function draw() {
      var p = pS.get(), d = Pb.domain(p), fn = function (x) { return Pb.f(x, p); };
      var best = optimum(fn, d[0], d[1], Pb.kind), x = xS.get(), m = slope(fn, x), ys = [];
      for (var i = 0; i <= 160; i++) ys.push(fn(d[0] + (d[1] - d[0]) * i / 160));
      var yr = window.LabPlot.range(ys);
      if (Pb.kind === 'min') yr = [Math.min(0, yr[0]), Math.min(yr[1], best.value * 3)];
      var plot = window.LabPlot(svg, { x: [d[0], d[1]], y: yr });
      plot.clear(); plot.grid(); plot.axes();
      plot.curve(fn, 'ref', 3.5);
      var dx = (d[1] - d[0]) * 0.18;
      plot.segments([[[x - dx, fn(x) - m * dx], [x + dx, fn(x) + m * dx]]], 'aux', 3);
      plot.point(x, fn(x), 'dot-aux', 6);
      var close = Math.abs(x - best.x) <= (d[1] - d[0]) * 0.01;
      if (shown || close) {
        plot.segments([[[best.x, plot.yr[0]], [best.x, plot.yr[1]]]], 'trace', 1.8);
        plot.point(best.x, best.value, 'dot-trace', 6);
      }
      facts.innerHTML = '';
      [[Pb.variable.split(' ')[0], UI.fmt(x, 4) + ' ' + Pb.unit], [Pb.objective, UI.fmt(fn(x), 5) + ' ' + Pb.ounit], ['pendiente', UI.fmt(m, 4)]]
        .concat(shown ? [['óptimo', Pb.variable.split(' ')[0] + ' = ' + UI.fmt(best.x, 4) + ' · ' + UI.fmt(best.value, 5) + ' ' + Pb.ounit]] : [])
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
      if (close) UI.verdict(verdict, 'ok', '¡Lo encontraste!', 'La tangente es casi horizontal: ahí f′ = 0 y el ' + (Pb.kind === 'max' ? 'máximo' : 'mínimo') + ' es ' + UI.fmt(best.value, 5) + ' ' + Pb.ounit + '.');
      else UI.verdict(verdict, 'warn', m * (Pb.kind === 'max' ? 1 : -1) > 0 ? 'Aumenta la variable' : 'Disminuye la variable', 'La pendiente es ' + UI.fmt(m, 3) + '; el óptimo está donde vale 0.');
    }

    document.addEventListener('cb:themechange', draw);
    setup();
  };
})();
