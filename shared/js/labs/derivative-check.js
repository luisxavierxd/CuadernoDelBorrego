/* =====================================================================
   Lab derivative-check (§8.3): el alumno escribe su f′(x); se compara con
   math.derivative en 60 puntos (mismo criterio que antiderivative-check):
   correcta, signo invertido, factor constante (regla de la cadena) o distinta.
   La gráfica muestra f, su tangente en un punto y las dos derivadas.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  function trueNode(math, fSrc) {
    return math.derivative(math.parse(window.LabMath.core.prep(fSrc)), 'x');
  }
  function trueDerivative(math, fSrc) {
    var d = trueNode(math, fSrc);
    try { return math.simplify(d).toString(); } catch (e) { return d.toString(); }
  }
  function verify(math, fSrc, dSrc, a, b) {
    var C = window.LabMath.core;
    var f = C.build(math, fSrc).fn;
    var dt = C.build(math, trueNode(math, fSrc).toString()).fn;
    // Solo cuentan los puntos donde f misma está definida (ln x con x < 0 no vale).
    var t = function (x) { return isFinite(f(x)) ? dt(x) : NaN; };
    var s = C.build(math, dSrc).fn;
    var r = C.compare(t, s, a, b);
    r.symbolic = false;
    if (r.reason === 'correct') {
      try { r.symbolic = math.simplify(math.parse('(' + trueNode(math, fSrc).toString() + ') - (' + C.prep(dSrc) + ')')).toString() === '0'; } catch (e) {}
    }
    r.trueText = trueDerivative(math, fSrc);
    r.f = f; r.dTrue = dt; r.dStudent = s;
    return r;
  }
  window.LabMath.derivative = { trueDerivative: trueDerivative, verify: verify };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { name: 'Potencia', f: 'x^3 - 2x', d: '3x^2 - 2', x: [-2, 2.2], a: 1 },
    { name: 'Exponencial · error típico', f: 'e^(3x)', d: 'e^(3x)', x: [-1.2, 0.8], a: 0.2 },
    { name: 'Coseno · signo', f: 'cos(x)', d: 'sin(x)', x: [-1, 5], a: 1 },
    { name: 'Producto · error típico', f: 'x^2*sin(x)', d: '2x*cos(x)', x: [-1, 4], a: 1.5 },
    { name: 'Cociente', f: 'x/(x^2+1)', d: '(1 - x^2)/(x^2+1)^2', x: [-3, 3], a: 0.5 },
    { name: 'Logaritmo', f: 'ln(x^2+1)', d: '2x/(x^2+1)', x: [-3, 3], a: 1 }
  ];
  function message(r, fmt) {
    switch (r.reason) {
      case 'correct': return ['Tu derivada es correcta', r.symbolic ? 'Verificada de forma simbólica y numérica.' : 'Verificada numéricamente en todo el intervalo.'];
      case 'sign': return ['Tu signo está invertido', 'Tu f′ es exactamente −1 veces la real. Revisa las derivadas trigonométricas: (cos x)′ = −sin x.'];
      case 'factor': return ['Te está ' + (Math.abs(r.k) < 1 ? 'faltando' : 'sobrando') + ' un factor', 'Tu f′ es ' + fmt(r.k) + ' veces la real. Suele ser la regla de la cadena: la derivada de e^(kx) es k·e^(kx).'];
      case 'domain': return ['No se pudo evaluar en el intervalo', 'Tu expresión o f no están definidas en casi todo el intervalo. Revisa paréntesis y dominio.'];
      default: return ['Tu derivada no coincide', 'Compara la curva punteada con la roja: donde se separan está el error.'];
    }
  }

  window.Labs['derivative-check'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var presets = cfg.presets || PRESETS;
    var math = null, last = null, P = presets[cfg.start || 0];
    function field(o) {
      if (window.CBMathInput) return window.CBMathInput.create(o);
      var f = UI.input(o);
      return { node: f.node, get: function () { return f.input.value; }, setMath: function (s) { f.input.value = s; } };
    }
    var preset = UI.select({ label: 'Ejemplo', options: presets.map(function (p) { return p.name; }) });
    var fIn = field({ label: 'Función f(x)', palette: 'none' });
    var dIn = field({ label: 'Tu derivada f′(x)', hint: 'Escribe como en papel; usa la paleta para fracciones, raíces y funciones.', onEnter: function () { check(); } });
    var aS = UI.slider({ label: 'Punto para la tangente', min: P.x[0], max: P.x[1], step: 0.05, value: P.a, fmt: function (v) { return UI.fmt(v, 3); } }, function () { draw(); });
    var run = UI.button('Comprobar', 'primary', check);
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts', hidden: true });
    var svg = UI.svg(640, 380, 'Gráfica de f con su tangente, la derivada real y la tuya');
    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [preset.node, fIn.node, dIn.node, h('div', { class: 'lab-buttons' }, [run]), verdict, facts, aS.node]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['La pendiente de la tangente es f′(a)']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'f(x)']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'tangente en a']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'f′(x) real']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu f′(x)'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); setTimeout(check, 300); });

    function load(i) {
      P = presets[i];
      fIn.setMath(P.f); dIn.setMath(P.d);
      aS.input.min = P.x[0]; aS.input.max = P.x[1]; aS.set(P.a);
    }
    load(cfg.start || 0);

    function check() {
      if (!math) return;
      try {
        var r = verify(math, fIn.get(), dIn.get(), P.x[0], P.x[1]);
        var msg = message(r, function (v) { return UI.fmt(v, 4); });
        UI.verdict(verdict, r.kind, msg[0], msg[1]);
        facts.hidden = false; facts.innerHTML = '';
        [['f′(x) real', UI.tex(math, r.trueText)], ['error máx.', r.maxErr.toExponential(1)]].forEach(function (x) {
          facts.appendChild(h('dt', {}, [x[0]])); facts.appendChild(h('dd', { html: x[1] }));
        });
        UI.renderMath(facts);
        last = r;
      } catch (e) {
        UI.verdict(verdict, 'bad', 'No pude leer la expresión', e.message);
        facts.hidden = true; last = null;
      }
      draw();
    }

    function draw() {
      if (!last) return;
      var r = last, x0 = P.x[0], x1 = P.x[1], ys = [];
      for (var i = 0; i <= 120; i++) { var x = x0 + (x1 - x0) * i / 120; ys.push(r.f(x), r.dTrue(x), r.dStudent(x)); }
      var yr = window.LabPlot.range(ys);
      var plot = window.LabPlot(svg, { x: [x0, x1], y: yr });
      plot.clear(); plot.grid(); plot.axes();
      plot.curve(r.f, 'ref', 3.5);
      plot.curve(r.dTrue, 'error', 2.5);
      plot.curve(r.dStudent, 'student', 3);
      var a = aS.get(), m = r.dTrue(a), fa = r.f(a);
      if (isFinite(m) && isFinite(fa)) {
        plot.line(function (x) { return fa + m * (x - a); }, 'aux', 2.5);
        plot.point(a, fa, 'dot-aux');
        plot.point(a, m, 'dot-error');
        plot.label(a, m, 'f′(a) = ' + UI.fmt(m, 3), 'start', 15, 10, -10);
      }
    }

    document.addEventListener('cb:themechange', draw);
    return UI.loadMath().then(function (m) { math = m; setTimeout(check, 400); });
  };
})();
