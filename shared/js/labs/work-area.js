/* =====================================================================
   Lab work-area (§8.3): el trabajo es el área bajo F(x).
   El alumno escribe una fuerza F(x) (a lo largo del movimiento) y los
   límites; el lab sombrea el área (positiva o negativa), la integra con
   Simpson y muestra que W = ΔK: la rapidez final sale de
     ½mv² = ½mv₀² + W.
   El alumno da su W; errores típicos: F(b)·(b − a) (tomar la fuerza final
   como si fuera constante), olvidar el ½ en un resorte (kx² en vez de
   ½kx²) y el signo.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  function simpson(f, a, b, n) {
    n = n || 400; if (n % 2) n++;
    var h = (b - a) / n, s = f(a) + f(b);
    for (var i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
    return s * h / 3;
  }
  // Trabajo de una fuerza constante F que forma θ (grados) con el desplazamiento d.
  function constant(F, d, th) { return F * d * Math.cos((th || 0) * Math.PI / 180); }
  // Trabajo que hace un resorte al pasar de x1 a x2 (medidas desde su largo natural).
  function spring(k, x1, x2) { return 0.5 * k * (x1 * x1 - x2 * x2); }
  // Teorema trabajo-energía: rapidez final (NaN si la energía no alcanza).
  function finalSpeed(m, v0, W) { var K = 0.5 * m * v0 * v0 + W; return K >= 0 ? Math.sqrt(2 * K / m) : NaN; }
  function work(math, src, a, b) { return simpson(window.LabMath.core.build(math, src, ['x']).fn, a, b, 400); }
  function close(x, y, tol) { return Math.abs(x - y) <= (tol || 0.01) * Math.max(Math.abs(y), 0.05); }
  function diagnose(math, src, a, b, s) {
    if (!isFinite(s)) return 'bad';
    var fn = window.LabMath.core.build(math, src, ['x']).fn, W = simpson(fn, a, b, 400);
    if (close(s, W)) return 'ok';
    if (close(s, -W) && !close(-W, W)) return 'sign';
    var endF = fn(b) * (b - a);
    if (close(s, endF) && !close(endF, W)) return 'endForce';
    if (close(s, 2 * W) && !close(2 * W, W)) return 'noHalf';
    return 'bad';
  }
  window.LabMath.work = { simpson: simpson, constant: constant, spring: spring, finalSpeed: finalSpeed, work: work, diagnose: diagnose };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { name: 'Fuerza constante: F = 20 N', f: '20', a: 0, b: 5, m: 4, v0: 0 },
    { name: 'Resorte que empuja: F = 400 − 2000x', f: '400 - 2000x', a: 0, b: 0.2, m: 2, v0: 0 },
    { name: 'Fuerza que crece: F = 3x²', f: '3x^2', a: 0, b: 4, m: 2, v0: 1 },
    { name: 'Frenado: F = −15 N', f: '-15', a: 0, b: 3, m: 3, v0: 6 }
  ];
  var MSG = {
    ok: ['Tu trabajo coincide', 'W = ∫F dx: el área bajo la curva.'],
    sign: ['El signo está al revés', 'Si la fuerza apunta en contra del movimiento, el área queda bajo el eje y el trabajo es negativo.'],
    endForce: ['Usaste la fuerza final como si fuera constante', 'F cambia con x: el trabajo es el área bajo la curva, no F(b)·(b − a).'],
    noHalf: ['Te sobra un factor de 2', 'El área de un triángulo lleva ½: por ejemplo, el resorte hace ½kx², no kx².'],
    bad: ['Tu trabajo no coincide', 'Calcula el área bajo F(x) entre los límites (con signo).']
  };

  window.Labs['work-area'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var presets = cfg.presets || PRESETS, math = null, fn = null;
    var preset = UI.select({ label: 'Ejemplo', options: presets.map(function (p) { return p.name; }) });
    var fIn = UI.mathField({ label: 'Fuerza F(x) en N, a lo largo del movimiento', palette: 'fisica', hint: 'Usa x (en metros) como variable.', onEnter: function () { compile(); } });
    var lim = UI.rangeField(['x inicial (m)', 'x final (m)'], [0, 5], function () { compile(); });
    var mS = UI.input({ label: 'Masa (kg)', type: 'number', step: 'any', inputmode: 'decimal', value: 4, mono: false });
    var vS = UI.input({ label: 'Rapidez inicial (m/s)', type: 'number', step: 'any', inputmode: 'decimal', value: 0, mono: false });
    var wIn = UI.input({ label: 'Tu trabajo W (J)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var run = UI.button('Comprobar', 'primary', check);
    var status = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(640, 360, 'Fuerza contra posición; el área sombreada es el trabajo');

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        preset.node, fIn.node, lim.node, h('div', { class: 'lab-row' }, [mS.node, vS.node]), status,
        wIn.node, h('div', { class: 'lab-buttons' }, [run]), note, verdict, facts
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Trabajo = área bajo F(x)']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'F(x)']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'área positiva']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'área negativa'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); compile(); });
    [mS.input, vS.input].forEach(function (i) { i.addEventListener('change', draw); });
    function load(i) { var p = presets[i]; fIn.setMath(p.f); lim.set(p.a, p.b); mS.input.value = p.m; vS.input.value = p.v0; }
    var start = cfg.start != null ? cfg.start : 2;
    preset.input.value = String(start);
    load(start);

    function compile() {
      if (!math) return false;
      var src;
      try { src = String(fIn.get() || '').trim(); } catch (e) { UI.verdict(status, 'bad', 'Completa F(x)', e.message); return false; }
      if (!src) return false;
      try { fn = window.LabMath.core.build(math, src, ['x']).fn; } catch (e) { UI.verdict(status, 'bad', 'No pude leer F(x)', e.message); return false; }
      var r = lim.get();
      if (!(isFinite(r[0]) && isFinite(r[1]) && r[1] > r[0])) { UI.verdict(status, 'bad', 'Revisa los límites', 'x inicial debe ser menor que x final.'); return false; }
      status.hidden = true;
      draw();
      return true;
    }

    function draw() {
      if (!fn) return;
      var r = lim.get(), a = r[0], b = r[1], pad = (b - a) * 0.15, ys = [];
      for (var i = 0; i <= 200; i++) ys.push(fn(a - pad + (b - a + 2 * pad) * i / 200));
      var plot = window.LabPlot(svg, { x: [a - pad, b + pad], y: window.LabPlot.range(ys) });
      plot.clear(); plot.grid(); plot.axes();
      // Sombrea por tramos: arriba del eje (positivo) y abajo (negativo).
      var n = 120, pos = [], neg = [];
      for (var j = 0; j <= n; j++) { var x = a + (b - a) * j / n, y = fn(x); pos.push([x, Math.max(0, y)]); neg.push([x, Math.min(0, y)]); }
      plot.poly([[a, 0]].concat(pos, [[b, 0]]), 'area-fill--aux');
      plot.poly([[a, 0]].concat(neg, [[b, 0]]), 'rect-fill--neg');
      plot.curve(fn, 'ref', 3.5);
      plot.segments([[[a, plot.yr[0]], [a, plot.yr[1]]], [[b, plot.yr[0]], [b, plot.yr[1]]]], 'axis', 1.2);
      plot.label(a - pad, plot.yr[1], 'F (N) contra x (m)', 'start', 15, 8, 14);
      var W = simpson(fn, a, b, 400), m = parseFloat(mS.input.value), v0 = parseFloat(vS.input.value), vf = finalSpeed(m, v0, W);
      facts.innerHTML = '';
      [['trabajo W = ∫F dx', UI.fmt(W, 5) + ' J'], ['K inicial', UI.fmt(0.5 * m * v0 * v0, 5) + ' J'], ['K final = K₀ + W', UI.fmt(0.5 * m * v0 * v0 + W, 5) + ' J'],
        ['rapidez final', isFinite(vf) ? UI.fmt(vf, 4) + ' m/s' : 'se detiene antes']]
        .forEach(function (x) { facts.appendChild(h('dt', {}, [x[0]])); facts.appendChild(h('dd', {}, [x[1]])); });
    }

    function check() {
      if (!compile()) return;
      var r = lim.get(), src = String(fIn.get() || '').trim(), k = diagnose(math, src, r[0], r[1], parseFloat(wIn.input.value)), msg = MSG[k];
      UI.verdict(verdict, k === 'ok' ? 'ok' : k === 'bad' ? 'bad' : 'warn', msg[0], msg[1]);
    }

    document.addEventListener('cb:themechange', draw);
    return UI.loadMath().then(function (m) {
      math = m;
      return new Promise(function (resolve) {
        var n = 0;
        (function poll() {
          var v = '';
          try { v = String(fIn.get() || '').trim(); } catch (e) { v = 'x'; }
          if (v || ++n > 26) {
            if (compile()) {
              // Ejemplo cargado: un compañero multiplicó la fuerza final por la distancia.
              var r = lim.get();
              wIn.input.value = UI.fmt(fn(r[1]) * (r[1] - r[0]), 5);
              note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Ves el error? Cambia F(x) o los límites y escribe tu W.';
              check();
            }
            resolve();
          } else setTimeout(poll, 150);
        })();
      });
    });
  };
})();
