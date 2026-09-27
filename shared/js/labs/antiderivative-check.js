/* =====================================================================
   Lab antiderivative-check (§8.2) — porta reference/lab-antiderivada.html.
   El alumno escribe su F(x); se deriva, se compara con f(x) y se anima el
   Teorema Fundamental con manim-web (carga diferida).
   Algoritmo conservado de la demo aprobada:
   - preprocesado ln→log, arctan→atan, arcsin→asin, arccos→acos, sin "+ C";
   - 60 puntos, error relativo |F′ − f| / (1 + |f|) < 1e-6 → correcto;
   - si F′/f es constante: −1 → signo invertido, k → factor k;
   - < 10 puntos válidos → revisa el dominio; simplify(F′ − f) == 0 → simbólico;
   - Simpson n = 400 para ∫ₐᵇ f contra F(b) − F(a);
   - eje y con percentiles 2–98.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  function prep(s) {
    return String(s)
      // (^|no-letra) en lugar de \b: “2ln(x)” también es ln
      .replace(/(?<![a-zA-Z])ln\s*\(/g, 'log(').replace(/(?<![a-zA-Z])arctan\s*\(/g, 'atan(')
      .replace(/(^|[^a-zA-Z])arcsin\s*\(/g, '$1asin(').replace(/(^|[^a-zA-Z])arccos\s*\(/g, '$1acos(')
      .replace(/\+\s*C\b/g, '').replace(/−/g, '-')
      // math.js lee 0x, 0b y 0o como prefijos hexadecimal, binario y octal: “0x” debe ser 0·x
      .replace(/(^|[^\w.])0([a-zA-Z])/g, '$10*$2');
  }

  function toNum(v) { return typeof v === 'number' ? v : NaN; }

  function build(math, src) {
    var node = math.parse(prep(src));
    var code = node.compile();
    return { node: node, fn: function (x) { try { return toNum(code.evaluate({ x: x })); } catch (e) { return NaN; } } };
  }

  function simpson(fn, a, b, n) {
    n = n || 400;
    if (a === b) return 0;
    if (n % 2) n++;
    var h = (b - a) / n, s = fn(a) + fn(b);
    for (var i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * fn(a + i * h);
    return s * h / 3;
  }

  // Rango del eje y: percentiles 2–98 de los valores, incluye el 0 y deja margen.
  function yRange(values) {
    var ys = values.filter(function (v) { return isFinite(v); }).concat([0]).sort(function (p, q) { return p - q; });
    var lo = ys[Math.floor(ys.length * 0.02)], hi = ys[Math.ceil(ys.length * 0.98) - 1];
    lo = Math.min(lo, 0); hi = Math.max(hi, 0);
    if (hi - lo < 1) { hi += 0.5; lo -= 0.5; }
    var pad = (hi - lo) * 0.12;
    return [lo - pad, hi + pad];
  }

  function verify(math, fSrc, FSrc, a, b) {
    var f = build(math, fSrc), F = build(math, FSrc);
    var dNode = math.derivative(F.node, 'x');
    var dCode = dNode.compile();
    var dF = function (x) { try { return toNum(dCode.evaluate({ x: x })); } catch (e) { return NaN; } };
    var dText;
    try { dText = math.simplify(dNode).toString(); } catch (e) { dText = dNode.toString(); }
    var symbolic = false;
    try { symbolic = math.simplify(math.parse('(' + dNode.toString() + ') - (' + prep(fSrc) + ')')).toString() === '0'; } catch (e) {}

    var xs = [], N = 60, i;
    for (i = 0; i < N; i++) {
      var x = a + (b - a) * (i + 0.5) / N;
      if (isFinite(f.fn(x)) && isFinite(dF(x))) xs.push(x);
    }
    var maxErr = 0, ratios = [];
    xs.forEach(function (x) {
      var fv = f.fn(x), dv = dF(x);
      maxErr = Math.max(maxErr, Math.abs(dv - fv) / (1 + Math.abs(fv)));
      if (Math.abs(fv) > 1e-6) ratios.push(dv / fv);
    });

    var kind = 'bad', reason = 'mismatch', k = null;
    if (xs.length >= 10 && maxErr < 1e-6) { kind = 'ok'; reason = 'correct'; }
    else if (ratios.length >= 10) {
      var mean = ratios.reduce(function (s, r) { return s + r; }, 0) / ratios.length;
      var spread = Math.max.apply(null, ratios.map(function (r) { return Math.abs(r - mean); }));
      if (spread < 1e-6 * Math.max(1, Math.abs(mean))) {
        kind = 'warn'; k = mean;
        reason = Math.abs(mean + 1) < 1e-6 ? 'sign' : 'factor';
      }
    }
    if (xs.length < 10) { kind = 'bad'; reason = 'domain'; }
    return {
      kind: kind, reason: reason, k: k, symbolic: symbolic && reason === 'correct', dText: dText,
      maxErr: maxErr, valid: xs.length,
      I: simpson(f.fn, a, b, 400), D: F.fn(b) - F.fn(a),
      f: f.fn, F: F.fn, dF: dF
    };
  }

  // Cruces por cero de fn en (a, b): muestreo + bisección. Sirve para partir el área
  // sombreada en tramos de un solo signo (un polígono que cruza el eje se triangula mal).
  function roots(fn, a, b, n) {
    n = n || 800;
    var out = [], h = (b - a) / n, x0 = a, y0 = fn(a);
    for (var i = 1; i <= n; i++) {
      var x1 = a + i * h, y1 = fn(x1);
      if (y1 === 0 && i < n) out.push(x1);                 // la muestra cae justo en la raíz
      else if (isFinite(y0) && isFinite(y1) && y0 * y1 < 0) {
        var lo = x0, hi = x1, flo = y0;
        for (var k = 0; k < 50; k++) {
          var mid = (lo + hi) / 2, fm = fn(mid);
          if (flo * fm <= 0) hi = mid; else { lo = mid; flo = fm; }
        }
        out.push((lo + hi) / 2);
      }
      x0 = x1; y0 = y1;
    }
    return out;
  }

  window.LabMath.antiderivative = { prep: prep, build: build, simpson: simpson, yRange: yRange, verify: verify, roots: roots };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { name: 'Polinomio', f: '3x^2 - 4x + 1', F: 'x^3 - 2x^2 + x', a: -1, b: 2 },
    { name: 'Regla de la cadena al revés', f: '2x*cos(x^2)', F: 'sin(x^2)', a: 0, b: 2 },
    { name: 'Exponencial · error típico', f: 'e^(2x)', F: 'e^(2x)', a: -1, b: 1 },
    { name: 'Por partes', f: 'x*cos(x)', F: 'x*sin(x) + cos(x)', a: 0, b: 4 },
    { name: 'Trigonométrica inversa', f: '1/(1+x^2)', F: 'atan(x)', a: -3, b: 3 },
    { name: 'Logaritmo · signo', f: '2x/(x^2+1)', F: '-ln(x^2+1)', a: -2, b: 2 },
    { name: 'Fracciones parciales', f: '1/(x*(x+1))', F: 'ln(x) - ln(x+1)', a: 0.5, b: 3 }
  ];

  function message(r) {
    var fmt = window.LabUI.fmt;
    switch (r.reason) {
      case 'correct':
        return { title: 'F′(x) = f(x)', note: r.symbolic ? 'Verificado de forma simbólica y numérica.' : 'Verificado numéricamente: math.js no simplificó F′ − f a 0, pero son iguales en todo el intervalo.' };
      case 'sign':
        return { title: 'Tu signo está invertido', note: 'F′(x) = −f(x). Revisa el signo al integrar (por ejemplo, ∫ sin x dx = −cos x).' };
      case 'factor':
        return { title: 'Te sobra un factor de ' + fmt(r.k), note: 'F′(x) = ' + fmt(r.k) + '·f(x). Suele ser la regla de la cadena: al integrar e^(kx) o sin(kx) hay que dividir entre k.' };
      case 'domain':
        return { title: 'No se pudo evaluar en el intervalo', note: 'f o F′ no están definidas en casi todo [a, b]. Revisa el dominio (por ejemplo, ln x pide x > 0).' };
      default:
        return { title: 'F′(x) no coincide con f(x)', note: 'Compara la curva roja con la azul: donde se separan está el error.' };
    }
  }

  function niceStep(span) {
    var raw = span / 6, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  function clampFn(fn, lo, hi) {
    var m = (hi - lo) * 0.1;
    return function (x) { var v = fn(x); return isFinite(v) ? Math.max(lo - m, Math.min(hi + m, v)) : NaN; };
  }
  function axesRanges(r, a, b) {
    var pad = (b - a) * 0.08, x0 = a - pad, x1 = b + pad, ys = [], Fa = r.F(a);
    for (var i = 0; i <= 200; i++) {
      var x = x0 + (x1 - x0) * i / 200;
      ys.push(r.f(x), r.dF(x), r.F(x) - Fa);
    }
    var y = yRange(ys), sx = niceStep(x1 - x0), sy = niceStep(y[1] - y[0]);
    return { x: [Math.floor(x0 / sx) * sx, Math.ceil(x1 / sx) * sx, sx], y: [Math.floor(y[0] / sy) * sy, Math.ceil(y[1] / sy) * sy, sy] };
  }

  // manim-web 0.3.24 dibuja los números de los ejes siempre en blanco (NumberLine);
  // en el cuaderno serían invisibles. Se recolorean con el token de ejes.
  function recolorWhite(mob, color) {
    var seen = [];
    (function walk(m) {
      if (!m || seen.indexOf(m) >= 0) return;
      seen.push(m);
      if (typeof m.color === 'string' && /^#?f{6}$/i.test(m.color.replace('#', '')) && typeof m.setColor === 'function') m.setColor(color);
      (m.submobjects || m.children || []).forEach(walk);
    })(mob);
  }

  // Las etiquetas del eje y quedan centradas a una distancia fija, así que las anchas
  // (como −2) chocan con el eje. Se alinean a la derecha cuando ya tienen tamaño.
  function alignYLabels(axes) {
    var labels = axes.yAxis && axes.yAxis.getNumberLabels ? axes.yAxis.getNumberLabels() : [];
    return Promise.all(labels.map(function (l) { return l.waitForRender ? l.waitForRender().catch(function () {}) : null; }))
      .then(function () {
        labels.forEach(function (l) {
          var w = l.getWidth ? l.getWidth() : 0;
          if (w > 0) l.position.set(-0.16 - w / 2, l.position.y, 0);
        });
      });
  }

  window.Labs['antiderivative-check'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var presets = cfg.presets || PRESETS;
    var math = null, M = null, scene = null, last = null, gen = 0, running = Promise.resolve();

    var preset = UI.select({ label: 'Ejercicio', options: presets.map(function (p) { return p.name; }) });
    // Editor matemático si está disponible; si no, campo de texto con la misma API.
    function field(o) {
      if (window.CBMathInput) return window.CBMathInput.create(o);
      var f = UI.input(o);
      return { node: f.node, get: function () { return f.input.value; }, setMath: function (s) { f.input.value = s; } };
    }
    var fIn = field({ label: 'Integrando f(x)' });
    var FIn = field({ label: 'Tu antiderivada F(x)', hint: 'Escribe como en papel: “/” hace una fracción y “^” un exponente. La constante C es opcional.', onEnter: function () { check(); } });
    var aIn = UI.input({ label: 'a', type: 'number', step: 'any', inputmode: 'decimal' });
    var bIn = UI.input({ label: 'b', type: 'number', step: 'any', inputmode: 'decimal' });
    var run = UI.button('Verificar y animar', 'primary', check);
    var replay = UI.button('Repetir animación', 'ghost', function () { if (last) animate(last, true); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts', hidden: true });
    var stage = h('div', { class: 'lab-stage lab-stage--manim' });
    var status = h('p', { class: 'lab-status', 'aria-live': 'polite' }, ['El motor de animación se carga al llegar aquí.']);
    var legend = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--ref' }), 'f(x)']),
      h('li', {}, [h('i', { class: 'sw sw--error' }), 'F′(x) de tu respuesta']),
      h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu F(x) − F(a)']),
      h('li', {}, [h('i', { class: 'sw sw--trace' }), 'área acumulada ∫ₐˣ f'])
    ]);

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        preset.node, fIn.node, FIn.node,
        h('div', { class: 'lab-row' }, [aIn.node, bIn.node]),
        h('div', { class: 'lab-buttons' }, [run, replay]),
        verdict, facts
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Teorema Fundamental en vivo']),
        stage, legend, status
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });

    function load(i) {
      var p = presets[i];
      fIn.setMath(p.f); FIn.setMath(p.F); aIn.input.value = p.a; bIn.input.value = p.b;
    }
    preset.input.addEventListener('change', function () { load(+preset.input.value); check(); });
    load(cfg.start || 0);

    function check() {
      if (!math) return;
      var a = parseFloat(aIn.input.value), b = parseFloat(bIn.input.value);
      try {
        if (!(b > a)) throw new Error('El intervalo necesita a < b.');
        var r = verify(math, fIn.get(), FIn.get(), a, b);
        var msg = message(r);
        UI.verdict(verdict, r.kind, msg.title, msg.note);
        facts.hidden = false;
        facts.innerHTML = '';
        [['F′(x)', r.dText], ['∫ₐᵇ f dx (Simpson)', UI.fmt(r.I)], ['F(b) − F(a)', UI.fmt(r.D)], ['error máx.', r.maxErr.toExponential(1)]]
          .forEach(function (row) { facts.appendChild(h('dt', {}, [row[0]])); facts.appendChild(h('dd', {}, [row[1]])); });
        last = { r: r, a: a, b: b };
        animate(last, true);
      } catch (e) {
        UI.verdict(verdict, 'bad', 'No pude leer la expresión', e.message);
        facts.hidden = true;
      }
    }

    function colors() {
      return {
        f: UI.color('--plot-ref'), F: UI.color('--plot-student'), dF: UI.color('--plot-error'),
        trace: UI.color('--plot-trace'), axes: UI.color('--plot-axis')
      };
    }

    function animate(state, withMotion) {
      if (!M || !scene) return;
      var my = ++gen;
      running = running.then(function () { return draw(state, my, withMotion && window.CBAnim && window.CBAnim.canAnimate()); });
    }

    async function draw(state, my, motion) {
      var stale = function () { return my !== gen; };
      if (stale()) return;
      var r = state.r, a = state.a, b = state.b, C = colors();
      try {
        scene.clear();
        var R = axesRanges(r, a, b), W = 14, H = W / 1.6;
        var axes = new M.Axes({ xRange: R.x, yRange: R.y, xLength: W * 0.86, yLength: H * 0.82, color: C.axes, tips: false,
          axisConfig: { includeNumbers: true, numberFontSize: 20, decimalPlaces: R.x[2] < 1 || R.y[2] < 1 ? 1 : 0, strokeWidth: 1.5 } });
        recolorWhite(axes, C.axes);
        await alignYLabels(axes);
        if (stale()) return;
        var ylo = R.y[0], yhi = R.y[1];
        var opts = function (c, w) { return { color: c, strokeWidth: w, xRange: [R.x[0], R.x[1]], numSamples: 240 }; };
        var fG = axes.plot(clampFn(r.f, ylo, yhi), opts(C.f, 5));
        var dFG = axes.plot(clampFn(r.dF, ylo, yhi), opts(C.dF, 2.5));
        var Fa = r.F(a);
        var GGsolid = axes.plot(clampFn(function (x) { return r.F(x) - Fa; }, ylo, yhi), opts(C.F, 4));
        var GG = GGsolid;
        // La curva del alumno siempre va punteada (9 7).
        try { GG = new M.DashedVMobject({ vmobject: GGsolid, numDashes: 44, dashRatio: 9 / 16, color: C.F, strokeWidth: 4 }); } catch (e) {}

        var N = 400, hh = (b - a) / N, cum = [0];
        for (var i = 1; i <= N; i++) cum.push(cum[i - 1] + simpson(r.f, a + (i - 1) * hh, a + i * hh, 4));
        var areaAt = function (x) { var t = (x - a) / hh, j = Math.max(0, Math.min(N - 1, Math.floor(t))); return cum[j] + (cum[j + 1] - cum[j]) * (t - j); };
        var fArea = axes.plot(clampFn(r.f, ylo, yhi), { xRange: [a, b], numSamples: 240, strokeWidth: 0 });
        var cuts = roots(r.f, a, b);
        // Un tramo por signo de f: getArea de manim-web cierra un solo polígono y,
        // si f cruza el eje, la triangulación deja una cuña.
        var areaPieces = function (xx) {
          var pts = [a].concat(cuts.filter(function (c) { return c < xx; }), [xx]), out = [];
          for (var p = 0; p < pts.length - 1; p++) {
            if (pts[p + 1] - pts[p] > 1e-6) out.push(axes.getArea(fArea, [pts[p], pts[p + 1]], { color: C.f, opacity: 0.28, strokeWidth: 0 }));
          }
          return out;
        };
        var areaAtX = function (x) {
          var xx = Math.max(a + 1e-6, x);
          return areaPieces(xx).concat([
            axes.plot(clampFn(areaAt, ylo, yhi), { xRange: [a, xx], color: C.trace, strokeWidth: 2.5, numSamples: Math.max(8, Math.round(240 * (xx - a) / (b - a))) }),
            new M.Dot({ point: axes.c2p(x, Math.max(ylo, Math.min(yhi, areaAt(x)))), radius: 0.09, color: C.trace })
          ]);
        };
        var done = r.kind === 'ok' ? 'Listo. El área acumulada coincide con F(x) − F(a) en todo el intervalo.'
          : 'Listo. Donde el punto se separa de la curva punteada, tu F no es la antiderivada.';

        if (!motion) {
          scene.add.apply(scene, [axes, fG, dFG, GG].concat(areaAtX(b)));
          status.textContent = done;
          return;
        }
        status.textContent = '1/4 · Trazando f(x)';
        await scene.play(new M.Create(axes, { duration: 0.8 }));
        await scene.play(new M.Create(fG, { duration: 1.1 }));
        if (stale()) return;
        status.textContent = '2/4 · Tu F′(x) encima de f(x): si coinciden, la curva roja cubre a la azul';
        await scene.play(new M.Create(dFG, { duration: 1.4 }));
        await scene.wait(0.4);
        if (stale()) return;
        status.textContent = '3/4 · Tu F(x) desplazada para que valga 0 en x = a';
        await scene.play(new M.Create(GG, { duration: 1.1 }));
        status.textContent = '4/4 · Acumulando ∫ₐˣ f: el punto debe viajar sobre la curva punteada';
        var prev = null;
        for (var s = 1; s <= 120; s++) {
          if (stale()) return;
          var parts = areaAtX(a + (b - a) * s / 120);
          if (prev) scene.remove.apply(scene, prev);
          scene.add.apply(scene, parts);
          prev = parts;
          await new Promise(function (res) { requestAnimationFrame(res); });
        }
        status.textContent = done;
      } catch (e) {
        console.error(e);
        status.textContent = 'Error en la animación: ' + e.message;
      }
    }

    // Tema nuevo: se vuelve a trazar el estado final, sin repetir la animación.
    document.addEventListener('cb:themechange', function () { if (last) animate(last, false); });

    return new Promise(function (resolve) {
      UI.onVisible(mount, function () {
        UI.loadMath().then(function (m) {
          math = m;
          // El editor tarda un momento en pintar el ejemplo; se revisa cuando ya tiene valor.
          setTimeout(check, 400);
          status.textContent = 'Cargando motor de animación…';
          resolve();
          return UI.loadManim();
        }).then(function (mod) {
          M = mod;
          var w = stage.clientWidth || 800;
          scene = new M.Scene(stage, { width: w, height: Math.round(w / 1.6), backgroundOpacity: 0 });
          status.textContent = 'Motor listo.';
          if (last) animate(last, true);
        }).catch(function (e) {
          console.error(e);
          status.textContent = 'No se pudo cargar el motor de animación; el veredicto sigue funcionando.';
          resolve();
        });
      });
    });
  };
})();
