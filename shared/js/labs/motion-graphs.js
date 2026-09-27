/* =====================================================================
   Lab motion-graphs (§8.3): x(t), v(t) y a(t) enlazadas.
   El alumno escribe x(t); el lab deriva con math.js y dibuja las tres
   gráficas con un cursor de tiempo común y una partícula sobre una pista.
   Opcional: el alumno escribe su v(t) y se compara con dx/dt (signo,
   factor constante o distinta).
     v(t) = dx/dt      a(t) = dv/dt      Δx = ∫ v dt      distancia = ∫ |v| dt
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  function core() { return window.LabMath.core; }
  function build(math, src) { return core().build(math, src, ['t']); }
  // Derivadas simbólicas de x(t): { x, v, a } como texto de math.js.
  function derivs(math, src) {
    var node = math.parse(core().prep(src));
    var v = math.derivative(node, 't'), a = math.derivative(v, 't');
    return { x: node.toString(), v: math.simplify(v).toString(), a: math.simplify(a).toString() };
  }
  function at(math, src, t) {
    var d = derivs(math, src);
    return { x: build(math, d.x).fn(t), v: build(math, d.v).fn(t), a: build(math, d.a).fn(t) };
  }
  function avgVelocity(fn, t1, t2) { return (fn(t2) - fn(t1)) / (t2 - t1); }
  // Simpson con n par: ∫ f en [a, b].
  function integrate(f, a, b, n) {
    n = n || 400; if (n % 2) n++;
    var hh = (b - a) / n, s = f(a) + f(b);
    for (var i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * hh);
    return s * hh / 3;
  }
  // Instantes en que v cambia de signo (el móvil da la vuelta), por bisección.
  function turns(vf, t1, t2, n) {
    n = n || 400;
    var out = [], prev = vf(t1), tp = t1;
    for (var i = 1; i <= n; i++) {
      var t = t1 + (t2 - t1) * i / n, cur = vf(t);
      if (cur === 0 && prev !== 0) out.push(t);        // cae justo en la malla
      else if (isFinite(prev) && isFinite(cur) && prev * cur < 0) {
        var lo = tp, hi = t;
        for (var k = 0; k < 60; k++) { var m = (lo + hi) / 2; if (vf(lo) * vf(m) <= 0) hi = m; else lo = m; }
        out.push((lo + hi) / 2);
      }
      prev = cur; tp = t;
    }
    return out;
  }
  // Distancia recorrida: suma de |Δx| entre vueltas (exacta si x se evalúa bien).
  function distance(xf, vf, t1, t2) {
    var marks = [t1].concat(turns(vf, t1, t2)).concat([t2]), d = 0;
    for (var i = 1; i < marks.length; i++) d += Math.abs(xf(marks[i]) - xf(marks[i - 1]));
    return d;
  }
  // Dos móviles con MRU se encuentran cuando x1 + v1 t = x2 + v2 t.
  function meet(x1, v1, x2, v2) {
    if (v1 === v2) return { t: NaN, x: NaN };
    var t = (x2 - x1) / (v1 - v2);
    return { t: t, x: x1 + v1 * t };
  }
  // Compara la v(t) del alumno contra dx/dt en [t1, t2].
  function compareV(math, xSrc, vSrc, t1, t2) {
    var d = derivs(math, xSrc), tv = build(math, d.v).fn, sv = build(math, vSrc).fn, pairs = [];
    for (var i = 0; i < 60; i++) { var t = t1 + (t2 - t1) * (i + 0.5) / 60; pairs.push([tv(t), sv(t)]); }
    return core().compareValues(pairs);
  }

  window.LabMath.motion = { derivs: derivs, at: at, avgVelocity: avgVelocity, integrate: integrate, turns: turns, distance: distance, meet: meet, compareV: compareV };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    // wrongV: la v(t) de un compañero con un error típico, para el ejemplo cargado.
    { name: 'MRU: x = 2 + 1.5t', x: '2 + 1.5t', t: [0, 6], wrongV: '1.5t' },
    { name: 'Frena y regresa: x = 8t − t²', x: '8t - t^2', t: [0, 9], wrongV: '8 - t' },
    { name: 'Va, vuelve y va: x = 2t³ − 9t² + 12t', x: '2t^3 - 9t^2 + 12t', t: [0, 3.5], wrongV: '6t^2 - 9t + 12' },
    { name: 'Oscila: x = 3 sin(1.5t)', x: '3sin(1.5t)', t: [0, 8], wrongV: '3cos(1.5t)' }
  ];
  var MSG = {
    correct: ['Tu v(t) es la derivada de x(t)', 'Coincide en todo el intervalo.'],
    sign: ['Tu v(t) tiene el signo invertido', 'Revisa la regla de la potencia: la derivada de −t² es −2t.'],
    factor: ['Te sobra o te falta un factor', 'Tu v(t) sale proporcional a la real. ¿Bajaste el exponente al derivar? ¿Aplicaste la regla de la cadena?'],
    mismatch: ['Tu v(t) no es dx/dt', 'Compara tu curva punteada con la real en la gráfica del medio.'],
    domain: ['No pude evaluar tu v(t)', 'Revisa paréntesis y que uses la variable t.']
  };

  window.Labs['motion-graphs'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var presets = cfg.presets || PRESETS;
    var math = null, F = null, T = presets[cfg.start || 0].t.slice(), sfn = null;

    var preset = UI.select({ label: 'Ejemplo', options: presets.map(function (p) { return p.name; }) });
    var xIn = UI.mathField({ label: 'Posición x(t) en metros', palette: 'fisica', hint: 'Usa t como variable (segundos).', onEnter: function () { compile(); } });
    var tr = UI.rangeField(['t desde (s)', 't hasta (s)'], T, function () { compile(); });
    var run = UI.button('Graficar', 'primary', function () { compile(); });
    var vIn = UI.mathField({ label: 'Tu v(t) (opcional)', palette: 'fisica', hint: 'Deriva x(t) a mano y compárala.', onEnter: function () { checkV(); } });
    var runV = UI.button('Comprobar mi v(t)', 'ghost', checkV);
    var tS = UI.slider({ label: 'Instante t', min: 0, max: 1000, step: 1, value: 350, fmt: function (u) { return UI.fmt(T[0] + (T[1] - T[0]) * u / 1000, 3) + ' s'; } }, drawAll);
    var status = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var track = UI.svg(640, 90, 'Pista: la partícula en la posición x(t) con su flecha de velocidad');
    var gx = UI.svg(640, 170, 'Gráfica de posición contra tiempo');
    var gv = UI.svg(640, 170, 'Gráfica de velocidad contra tiempo');
    var ga = UI.svg(640, 170, 'Gráfica de aceleración contra tiempo');

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        preset.node, xIn.node, tr.node, h('div', { class: 'lab-buttons' }, [run]), status,
        tS.node, facts, vIn.node, h('div', { class: 'lab-buttons' }, [runV]), note, verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Pendiente de arriba = valor de abajo']),
        track, gx, gv, ga,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'x(t)']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'v(t) = dx/dt']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'a(t) = dv/dt']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu v(t)'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); compile(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); compile(); });
    function load(i) { var p = presets[i]; xIn.setMath(p.x); tr.set(p.t[0], p.t[1]); sfn = null; verdict.hidden = true; }
    preset.input.value = String(cfg.start || 0);
    load(cfg.start || 0);

    // Resuelve cuando el campo ya devuelve algo (o tras ~4 s, para no quedarse esperando).
    function filled(field) {
      return new Promise(function (resolve) {
        var n = 0;
        (function poll() {
          var v = '';
          try { v = String(field.get() || '').trim(); } catch (e) { v = 'x'; }
          if (v || ++n > 26) resolve(); else setTimeout(poll, 150);
        })();
      });
    }

    function compile() {
      if (!math) return;
      var r = tr.get();
      if (!(isFinite(r[0]) && isFinite(r[1]) && r[1] > r[0])) { UI.verdict(status, 'bad', 'Revisa el intervalo de tiempo', '“t desde” debe ser menor que “t hasta”.'); return; }
      var src;
      try { src = String(xIn.get() || '').trim(); } catch (e) { UI.verdict(status, 'bad', 'Completa x(t)', e.message); return; }
      if (!src) return;
      try {
        var d = derivs(math, src);
        F = { src: src, d: d, x: build(math, d.x).fn, v: build(math, d.v).fn, a: build(math, d.a).fn };
      } catch (e) { UI.verdict(status, 'bad', 'No pude leer x(t)', e.message); return; }
      status.hidden = true;
      T = r;
      drawAll();
    }

    function ranges(fn) {
      var ys = [];
      for (var i = 0; i <= 200; i++) ys.push(fn(T[0] + (T[1] - T[0]) * i / 200));
      return window.LabPlot.range(ys);
    }

    function panel(svg, fn, cls, t, name, extra) {
      var plot = window.LabPlot(svg, { x: T, y: ranges(fn) });
      plot.clear(); plot.grid(); plot.axes();
      if (extra) extra(plot);
      plot.curve(fn, cls, 3);
      plot.segments([[[t, plot.yr[0]], [t, plot.yr[1]]]], 'axis', 1.2);
      plot.point(t, fn(t), 'dot-' + (cls === 'error' ? 'error' : cls));
      plot.label(T[0], plot.yr[1], name, 'start', 16, 8, 14);
      return plot;
    }

    function drawAll() {
      if (!F) return;
      var t = T[0] + (T[1] - T[0]) * tS.get() / 1000;
      var px = panel(gx, F.x, 'ref', t, 'x (m)', function (plot) {
        // Recta tangente en t: su pendiente es v(t).
        var v = F.v(t), x0 = F.x(t);
        plot.line(function (s) { return x0 + v * (s - t); }, 'aux', 1.8, '6 6');
      });
      panel(gv, F.v, 'aux', t, 'v (m/s)', function (plot) {
        // Área bajo v(t) desde el inicio hasta t: es el desplazamiento.
        var pts = [[T[0], 0]];
        for (var i = 0; i <= 80; i++) { var s = T[0] + (t - T[0]) * i / 80; pts.push([s, F.v(s)]); }
        pts.push([t, 0]);
        plot.poly(pts, 'area-fill--aux');
        if (sfn) plot.curve(sfn, 'student', 2.5);
      });
      panel(ga, F.a, 'error', t, 'a (m/s²)');
      drawTrack(t);
      facts.innerHTML = '';
      var x0 = F.x(T[0]);
      [['x(t)', UI.fmt(F.x(t), 4) + ' m'], ['v(t)', UI.fmt(F.v(t), 4) + ' m/s'], ['a(t)', UI.fmt(F.a(t), 4) + ' m/s²'],
        ['desplazamiento desde ' + UI.fmt(T[0], 3) + ' s', UI.fmt(F.x(t) - x0, 4) + ' m'],
        ['distancia recorrida', UI.fmt(t > T[0] ? distance(F.x, F.v, T[0], t) : 0, 4) + ' m'],
        ['dx/dt', F.d.v]]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
      return px;
    }

    // Pista horizontal con la partícula y su velocidad.
    function drawTrack(t) {
      var xr = ranges(F.x);
      var plot = window.LabPlot(track, { x: xr, y: [-1, 1] });
      plot.clear();
      plot.segments([[[xr[0], -0.35], [xr[1], -0.35]]], 'axis', 1.5);
      var sx = (xr[1] - xr[0]) / 8;
      for (var k = Math.ceil(xr[0] / sx) * sx; k <= xr[1]; k += sx) plot.segments([[[k, -0.5], [k, -0.2]]], 'axis', 1);
      var x = F.x(t), v = F.v(t), vmax = 1e-9;
      for (var i = 0; i <= 100; i++) vmax = Math.max(vmax, Math.abs(F.v(T[0] + (T[1] - T[0]) * i / 100)));
      var len = v / vmax * (xr[1] - xr[0]) * 0.18, hk = (xr[1] - xr[0]) * 0.02;
      if (Math.abs(len) > hk) {
        var dir = len > 0 ? 1 : -1;
        plot.segments([[[x, 0.35], [x + len, 0.35]], [[x + len, 0.35], [x + len - dir * hk, 0.6]], [[x + len, 0.35], [x + len - dir * hk, 0.1]]], 'aux', 3);
      }
      plot.point(x, 0, 'dot-trace', 9);
      plot.label(xr[0], -1, 'x = ' + UI.fmt(x, 4) + ' m', 'start', 15, 6, -4);
    }

    function checkV() {
      if (!math || !F) return;
      var src;
      try { src = String(vIn.get() || '').trim(); } catch (e) { UI.verdict(verdict, 'bad', 'Completa tu v(t)', e.message); return; }
      if (!src) { UI.verdict(verdict, 'bad', 'Escribe tu v(t)', 'Deriva la x(t) de arriba.'); return; }
      try {
        var r = compareV(math, F.src, src, T[0], T[1]);
        var msg = MSG[r.reason] || MSG.mismatch;
        UI.verdict(verdict, r.kind, msg[0], msg[1] + (r.reason === 'factor' ? ' (sale ' + UI.fmt(r.k, 4) + ' veces la real)' : ''));
        sfn = build(math, src).fn;
      } catch (e) { UI.verdict(verdict, 'bad', 'No pude leer tu v(t)', e.message); sfn = null; }
      drawAll();
    }

    document.addEventListener('cb:themechange', drawAll);
    return UI.loadMath().then(function (m) {
      math = m;
      // Ejemplo cargado: la v(t) de un compañero con un error típico.
      var wrong = presets[cfg.start || 0].wrongV;
      if (wrong) {
        vIn.setMath(wrong);
        note.textContent = 'Ejemplo cargado: así derivó un compañero. ¿Ves el error? Escribe tu v(t) o cambia x(t).';
      }
      // El editor (MathLive) puede tardar en cargar: se espera a que los campos tengan su expresión.
      return filled(xIn).then(function () {
        compile();
        if (wrong) return filled(vIn).then(checkV);
      });
    });
  };
})();
