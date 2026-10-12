/* =====================================================================
   Lab double-riemann (Cálculo 2 · S11): prismas → volumen. El alumno elige
   f(x, y) y el rectángulo R = [a, b] × [c, d], el número de divisiones m
   (en x) y n (en y) y el punto de muestra (esquina inferior izquierda,
   superior derecha o punto medio). El lab levanta un prisma de altura
   f(x*, y*) en cada celda, pinta la cuadrícula vista desde arriba como mapa
   de calor y grafica la suma contra el número de celdas m·n, junto al valor
   exacto (cuadratura de Gauss–Legendre). Reto: escribir la integral, la
   suma de Riemann de la cuadrícula actual o el valor promedio; el lab
   detecta si integró solo respecto a una variable, si olvidó ΔA, si cruzó
   los límites, si usó otro punto de muestra o si confundió promedio e
   integral. En PC (pantalla ancha y mouse) los prismas se ven en 3D con
   manim-web; en móvil, o si WebGL falla, en proyección SVG. El mapa de
   calor y la gráfica de convergencia, siempre.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  // R = [a, b, c, d] es el rectángulo a ≤ x ≤ b, c ≤ y ≤ d. f(x, y) es una función de JS.
  var RULES = ['ll', 'ur', 'mid'];
  // Punto de muestra de la celda [x0, x1] × [y0, y1] según la regla.
  function sample(rule, x0, x1, y0, y1) {
    if (rule === 'ur') return [x1, y1];
    if (rule === 'mid') return [(x0 + x1) / 2, (y0 + y1) / 2];
    return [x0, y0];
  }
  // Celdas de la partición m × n con su punto de muestra y la altura del prisma.
  function cells(f, R, m, n, rule) {
    var dx = (R[1] - R[0]) / m, dy = (R[3] - R[2]) / n, out = [];
    for (var j = 0; j < n; j++) {
      for (var i = 0; i < m; i++) {
        var x0 = R[0] + i * dx, x1 = R[0] + (i + 1) * dx, y0 = R[2] + j * dy, y1 = R[2] + (j + 1) * dy;
        var s = sample(rule, x0, x1, y0, y1);
        out.push({ i: i, j: j, x0: x0, x1: x1, y0: y0, y1: y1, xs: s[0], ys: s[1], z: f(s[0], s[1]) });
      }
    }
    return out;
  }
  // Suma doble de Riemann Σ Σ f(x*, y*) ΔA. raw = Σ f (sin ΔA).
  function riemann(f, R, m, n, rule) {
    var cs = cells(f, R, m, n, rule), dx = (R[1] - R[0]) / m, dy = (R[3] - R[2]) / n, raw = 0;
    cs.forEach(function (c) { raw += c.z; });
    return { sum: raw * dx * dy, raw: raw, dx: dx, dy: dy, dA: dx * dy, m: m, n: n, rule: rule, cells: cs };
  }

  // Gauss–Legendre compuesta en 1D: k paneles de 5 nodos (exacta para polinomios de grado ≤ 9).
  var GX = [0, -0.5384693101056831, 0.5384693101056831, -0.906179845938664, 0.906179845938664];
  var GW = [0.5688888888888889, 0.47862867049936647, 0.47862867049936647, 0.23692688505618908, 0.23692688505618908];
  function gl1(g, a, b, k) {
    k = k || 8;
    var h = (b - a) / k, s = 0;
    for (var p = 0; p < k; p++) {
      var mid = a + (p + 0.5) * h;
      for (var q = 0; q < 5; q++) s += GW[q] * g(mid + 0.5 * h * GX[q]);
    }
    return s * h / 2;
  }
  // Rebanadas (Fubini): A(y) = ∫_a^b f(x, y) dx (y fija) y B(x) = ∫_c^d f(x, y) dy (x fija).
  function sliceX(f, R, y, k) { return gl1(function (x) { return f(x, y); }, R[0], R[1], k); }
  function sliceY(f, R, x, k) { return gl1(function (y) { return f(x, y); }, R[2], R[3], k); }
  // Integral iterada en el orden pedido: 'dxdy' = ∫_c^d A(y) dy; 'dydx' = ∫_a^b B(x) dx.
  function iterated(f, R, order, k) {
    if (order === 'dydx') return gl1(function (x) { return sliceY(f, R, x, k); }, R[0], R[1], k);
    return gl1(function (y) { return sliceX(f, R, y, k); }, R[2], R[3], k);
  }
  function gauss(f, R, k) { return iterated(f, R, 'dxdy', k); }
  // Simpson anidado con N subintervalos (par) en cada dirección.
  function simpson(f, R, N) {
    N = N % 2 ? N + 1 : (N || 100);
    var hx = (R[1] - R[0]) / N, hy = (R[3] - R[2]) / N, s = 0;
    for (var i = 0; i <= N; i++) {
      var wi = i === 0 || i === N ? 1 : i % 2 ? 4 : 2;
      for (var j = 0; j <= N; j++) {
        var wj = j === 0 || j === N ? 1 : j % 2 ? 4 : 2;
        s += wi * wj * f(R[0] + i * hx, R[2] + j * hy);
      }
    }
    return s * hx * hy / 9;
  }
  // Generador reproducible (mulberry32) para Monte Carlo.
  function rng(seed) {
    var t = seed >>> 0;
    return function () {
      t = t + 0x6D2B79F5 | 0;
      var r = Math.imul(t ^ t >>> 15, 1 | t);
      r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r;
      return ((r ^ r >>> 14) >>> 0) / 4294967296;
    };
  }
  // Monte Carlo: área · promedio de f en N puntos al azar; se = error estándar.
  function monteCarlo(f, R, N, seed) {
    var rnd = rng(seed == null ? 7 : seed), area = (R[1] - R[0]) * (R[3] - R[2]), s = 0, s2 = 0, ok = 0;
    for (var i = 0; i < N; i++) {
      var z = f(R[0] + (R[1] - R[0]) * rnd(), R[2] + (R[3] - R[2]) * rnd());
      if (!isFinite(z)) continue;
      s += z; s2 += z * z; ok++;
    }
    if (!ok) return { value: NaN, se: NaN, n: 0 };
    var mean = s / ok, varz = Math.max(0, s2 / ok - mean * mean);
    return { value: area * mean, se: area * Math.sqrt(varz / ok), n: ok };
  }
  function area(R) { return (R[1] - R[0]) * (R[3] - R[2]); }
  function average(f, R, k) { return gauss(f, R, k) / area(R); }

  // Todo lo que usa el tablero y el diagnóstico, para la cuadrícula actual.
  function context(f, R, m, n, rule) {
    var r = riemann(f, R, m, n, rule), I = gauss(f, R), A = area(R);
    var by = {};
    RULES.forEach(function (q) { by[q] = q === rule ? r.sum : riemann(f, R, m, n, q).sum; });
    return {
      R: R.slice(), m: m, n: n, rule: rule, sum: r.sum, raw: r.raw, dx: r.dx, dy: r.dy, dA: r.dA,
      exact: I, area: A, avg: I / A, err: Math.abs(r.sum - I), by: by,
      onlyX: sliceX(f, R, R[3]) - sliceX(f, R, R[2]),            // A(d) − A(c): integró solo en x
      onlyY: sliceY(f, R, R[1]) - sliceY(f, R, R[0]),            // B(b) − B(a): integró solo en y
      swap: gauss(f, [R[2], R[3], R[0], R[1]]),                  // x de c a d y y de a a b
      center: f((R[0] + R[1]) / 2, (R[2] + R[3]) / 2)
    };
  }

  // Cerca con la holgura de los ejercicios: ±0.01 (o ±1 %) desde 0.1; abajo, ±1 % o 0.0005.
  function near(s, t) {
    var d = Math.abs(s - t), at = Math.abs(t);
    if (at >= 0.1) return d <= Math.max(0.01, 0.01 * at) + 1e-9;
    return d <= Math.max(0.01 * at, 5e-4) + 1e-12;
  }
  function want(c, mode) { return mode === 'sum' ? c.sum : mode === 'avg' ? c.avg : c.exact; }
  // Errores típicos de cada reto, en orden de prioridad.
  function candidates(c, mode) {
    if (mode === 'sum') {
      var o = [['noDA', c.raw], ['dxOnly', c.raw * c.dx], ['dyOnly', c.raw * c.dy]];
      RULES.forEach(function (q) { if (q !== c.rule) o.push(['rule-' + q, c.by[q]]); });
      o.push(['exact', c.exact], ['sign', -c.sum]);
      return o;
    }
    if (mode === 'avg') return [['integral', c.exact], ['center', c.center], ['sign', -c.avg]];
    return [['onlyX', c.onlyX], ['onlyY', c.onlyY], ['swap', c.swap], ['avg', c.avg], ['sum', c.sum], ['sign', -c.exact]];
  }
  // Diagnóstico del número del alumno → { kind: ok|warn|bad|invalid, reason, want }.
  function diagnose(s, c, mode) {
    var t = want(c, mode);
    if (!isFinite(s)) return { kind: 'invalid', reason: 'number', want: t };
    if (!isFinite(t)) return { kind: 'invalid', reason: 'domain', want: t };
    if (near(s, t)) return { kind: 'ok', reason: 'correct', want: t };
    var cs = candidates(c, mode);
    for (var i = 0; i < cs.length; i++) {
      var v = cs[i][1];
      if (isFinite(v) && !near(v, t) && near(s, v)) return { kind: 'warn', reason: cs[i][0], want: t };
    }
    return { kind: 'bad', reason: 'mismatch', want: t };
  }

  // Versiones con la fórmula como texto (math.js se inyecta): las usan los ejemplos y ejercicios.
  function fn(math, src) { return window.LabMath.core.build(math, src, ['x', 'y']).fn; }
  function integral(math, src, a, b, c, d) {
    var f = fn(math, src), R = [a, b, c, d], I = gauss(f, R);
    return { value: I, area: area(R), avg: I / area(R) };
  }
  function sum(math, src, a, b, c, d, m, n, rule) {
    var r = riemann(fn(math, src), [a, b, c, d], m, n, rule || 'mid');
    return { sum: r.sum, raw: r.raw, dA: r.dA, dx: r.dx, dy: r.dy };
  }
  // Área de la rebanada: wrt 'x' → A(t) = ∫_a^b f(x, t) dx; wrt 'y' → B(t) = ∫_c^d f(t, y) dy.
  function slice(math, src, a, b, c, d, wrt, t) {
    var f = fn(math, src), R = [a, b, c, d];
    return wrt === 'y' ? sliceY(f, R, t) : sliceX(f, R, t);
  }

  window.LabMath.dblint = {
    RULES: RULES, sample: sample, cells: cells, riemann: riemann, gl1: gl1, sliceX: sliceX, sliceY: sliceY,
    iterated: iterated, gauss: gauss, simpson: simpson, rng: rng, monteCarlo: monteCarlo, area: area, average: average,
    context: context, near: near, want: want, candidates: candidates, diagnose: diagnose,
    fn: fn, integral: integral, sum: sum, slice: slice
  };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { name: 'Domo: 16 − x² − 2y²', f: '16 - x^2 - 2y^2', R: ['0', '2', '0', '2'], m: 2, n: 2, rule: 2 },
    { name: 'Plano: 6 − x − 2y', f: '6 - x - 2y', R: ['0', '2', '0', '1'], m: 2, n: 2, rule: 0 },
    { name: 'Polinomio: x + 3y²', f: 'x + 3y^2', R: ['0', '2', '0', '1'], m: 3, n: 3, rule: 0 },
    { name: 'Separable: eˣ · cos y', f: 'e^x*cos(y)', R: ['0', '1', '0', 'pi/2'], m: 4, n: 4, rule: 2 },
    { name: 'Onda: sen x · sen y', f: 'sin(x)*sin(y)', R: ['0', 'pi', '0', 'pi'], m: 3, n: 3, rule: 2 },
    { name: 'Silla: x² − y² (volumen con signo)', f: 'x^2 - y^2', R: ['-1', '2', '-1', '1'], m: 3, n: 2, rule: 2 },
    { name: 'Densidad de una placa: 2 + x + y²', f: '2 + x + y^2', R: ['0', '3', '0', '2'], m: 3, n: 2, rule: 0 },
    { name: 'Campana: e^(−x² − y²)', f: 'e^(-x^2 - y^2)', R: ['-2', '2', '-2', '2'], m: 4, n: 4, rule: 2 }
  ];
  var RULE_NAMES = ['Esquina inferior izquierda', 'Esquina superior derecha', 'Punto medio'];
  var MODES = [['int', 'Escribe ∬_R f dA (la integral)'], ['sum', 'Escribe la suma de Riemann de esta cuadrícula'], ['avg', 'Escribe el valor promedio de f sobre R']];
  var NS = 'http://www.w3.org/2000/svg';
  var MAXD = 12;

  window.Labs['double-riemann'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, LM = window.LabMath.dblint;
    var presets = cfg.presets || PRESETS, start = cfg.start != null ? cfg.start : 0;
    var math = null, F = null, R = null, mode = 'int', solved = false, student = null, C = null;

    var preset = UI.select({ label: 'Ejemplo', options: presets.map(function (p) { return p.name; }) });
    var fIn = UI.mathField({ label: 'Superficie z = f(x, y)', hint: 'Escribe cualquier función de x y y; usa la paleta o el teclado ⌨.', palette: 'multi', onEnter: function () { build(); } });
    var aIn = UI.input({ label: 'x desde a', type: 'text', inputmode: 'decimal', mono: false });
    var bIn = UI.input({ label: 'hasta b', type: 'text', inputmode: 'decimal', mono: false });
    var cIn = UI.input({ label: 'y desde c', type: 'text', inputmode: 'decimal', mono: false });
    var dIn = UI.input({ label: 'hasta d', type: 'text', inputmode: 'decimal', mono: false });
    var rectHint = h('p', { class: 'lab-field__hint' }, ['Los límites aceptan pi; por ejemplo pi/2.']);
    var run = UI.button('Graficar', 'primary', function () { build(); });
    var status = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var mS = UI.slider({ label: 'm (divisiones en x)', min: 1, max: MAXD, step: 1, value: 2 }, function () { moved(); });
    var nS = UI.slider({ label: 'n (divisiones en y)', min: 1, max: MAXD, step: 1, value: 2 }, function () { moved(); });
    var ruleSel = UI.select({ label: 'Punto de muestra', options: RULE_NAMES });
    var modeSel = UI.select({ label: 'Reto', options: MODES.map(function (q) { return q[1]; }) });
    var ans = UI.input({ label: 'Tu integral', type: 'text', inputmode: 'decimal', mono: false, hint: 'Redondea a 2 decimales; si sale menor que 0.1, usa 3 cifras significativas.' });
    var hideBox = h('input', { type: 'checkbox', id: UI.id('dr-hide') });
    var hideRow = h('label', { class: 'dr-check', for: hideBox.id }, [hideBox, ' Tapar la suma, la integral y el promedio (para el reto)']);
    var check = UI.button('Comprobar', 'primary', function () { verify(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var prism = UI.svg(640, 360, 'Prismas de altura f(x*, y*) sobre la cuadrícula del rectángulo R, bajo la superficie z = f(x, y)');
    var heat = UI.svg(480, 340, 'Cuadrícula vista desde arriba: cada celda se sombrea según f en su punto de muestra');
    var conv = UI.svg(480, 280, 'Suma de Riemann contra el número de celdas m·n, junto al valor exacto de la integral');
    var capHeat = h('p', { class: 'lab-stack__label' }), capConv = h('p', { class: 'lab-stack__label' });
    var board = h('dl', { class: 'lab-facts dr-board' });
    var want3D = !!(window.matchMedia && window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches);
    var stage3d = h('div', { class: 'lab-stage lab-stage--manim lab-stage--3d', hidden: true, role: 'img', 'aria-label': 'Prismas en 3D bajo la superficie; arrastra para girarlos' });
    var note3d = h('p', { class: 'lab-note', hidden: true }, ['Arrastra para girar los prismas; la rueda del mouse acerca y aleja.']);
    var btn3d = UI.button('Vista 3D', 'ghost', function () { setView('3d'); });
    var btn2d = UI.button('Vista plana', 'ghost', function () { setView('2d'); });
    var viewBar = h('div', { class: 'lab-buttons lab-viewbar', hidden: !want3D, role: 'group', 'aria-label': 'Tipo de vista' }, [btn3d, btn2d]);
    var M3 = null, scene3 = null, view = '2d', pending3 = false;

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls dr-controls', novalidate: true }, [
        preset.node, fIn.node,
        h('div', { class: 'lab-row' }, [aIn.node, bIn.node]), h('div', { class: 'lab-row' }, [cIn.node, dIn.node]), rectHint,
        h('div', { class: 'lab-buttons' }, [run]), status,
        mS.node, nS.node, ruleSel.node,
        modeSel.node, ans.node, hideRow, h('div', { class: 'lab-buttons' }, [check]), verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Prismas → volumen']),
        viewBar, prism, stage3d, note3d,
        h('div', { class: 'dr-views' }, [h('div', {}, [capHeat, heat]), h('div', {}, [capConv, conv])]),
        h('p', { class: 'lab-stack__label' }, ['Tablero en vivo']),
        board,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'superficie']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'prismas · valor exacto']),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'punto de muestra · tu suma']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'f < 0']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu respuesta'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); build(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); build(); });
    ruleSel.input.addEventListener('change', function () { moved(); });
    modeSel.input.addEventListener('change', function () { mode = MODES[+modeSel.input.value][0]; relabel(); reset(); draw(); });
    hideBox.addEventListener('change', function () { draw(); });
    [aIn, bIn, cIn, dIn].forEach(function (q) { q.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); build(); } }); });
    ans.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); verify(); } });

    function num(v, d) { return UI.fmt(v, d || 5).replace('-', '−'); }
    function rule() { return LM.RULES[+ruleSel.input.value] || 'mid'; }
    function relabel() {
      ans.node.querySelector('label').textContent = mode === 'sum' ? 'Tu suma de Riemann' : mode === 'avg' ? 'Tu valor promedio' : 'Tu integral';
    }
    function load(i) {
      var P = presets[i];
      fIn.setMath(P.f);
      aIn.input.value = P.R[0]; bIn.input.value = P.R[1]; cIn.input.value = P.R[2]; dIn.input.value = P.R[3];
      mS.set(P.m); nS.set(P.n); ruleSel.input.value = String(P.rule);
      ans.input.value = '';
      reset();
    }
    function reset() { verdict.hidden = true; solved = false; student = null; }
    function moved() { reset(); draw(); }
    preset.input.value = String(start);
    load(start);
    relabel();

    // Límite escrito por el alumno: número o expresión con pi.
    function limit(q) {
      var s = String(q.input.value || '').trim().replace(/π/g, 'pi').replace(/−/g, '-');
      if (!s) return NaN;
      try { var v = math.evaluate(s); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; }
    }
    function build() {
      if (!math) return;
      try {
        var s = String(fIn.get() || '').trim();
        if (!s) throw new Error('Escribe f(x, y).');
        var r = [limit(aIn), limit(bIn), limit(cIn), limit(dIn)];
        if (!r.every(isFinite)) throw new Error('Revisa los límites: escribe números (o expresiones con pi).');
        if (!(r[1] > r[0]) || !(r[3] > r[2])) throw new Error('Necesitas a < b y c < d.');
        if (r[1] - r[0] > 100 || r[3] - r[2] > 100) throw new Error('El rectángulo es demasiado grande para dibujarlo.');
        var f = LM.fn(math, s), okPts = 0;
        for (var i = 0; i <= 10; i++) for (var j = 0; j <= 10; j++) if (isFinite(f(r[0] + (r[1] - r[0]) * i / 10, r[2] + (r[3] - r[2]) * j / 10))) okPts++;
        if (okPts < 121) throw new Error('La función debe estar definida en todo el rectángulo.');
        F = f; R = r;
        status.hidden = true;
      } catch (e) { UI.verdict(status, 'bad', 'No pude graficar', e.message); return; }
      reset();
      draw();
    }
    function calc() { return F ? LM.context(F, R, mS.get(), nS.get(), rule()) : null; }

    var RULE_TXT = { ll: 'la esquina inferior izquierda', ur: 'la esquina superior derecha', mid: 'el punto medio' };
    function verify() {
      var c = C || calc();
      if (!c || !math) return;
      var raw = String(ans.input.value || '');
      var s = window.CBExercises ? window.CBExercises.parseNumber(raw, math) : parseFloat(raw.replace(',', '.').replace('−', '-'));
      if (!isFinite(s)) { UI.verdict(verdict, 'bad', 'Escribe un número', 'Usa punto decimal; por ejemplo −0.25.'); return; }
      var r = LM.diagnose(s, c, mode);
      if (r.reason === 'domain') { UI.verdict(verdict, 'bad', 'La función no está definida en R', 'Cambia la función o el rectángulo.'); return; }
      student = s;
      var dA = num(c.dx, 4) + ' · ' + num(c.dy, 4) + ' = ' + num(c.dA, 4);
      var msgs = {
        correct: mode === 'sum'
          ? ['Tu suma es correcta', 'Son ' + (c.m * c.n) + ' prismas de base ΔA = ' + dA + '. La integral es ' + num(c.exact, 6) + ': la suma falla por ' + num(c.err, 3) + '. Sube m y n para ver cómo se acerca.']
          : mode === 'avg'
            ? ['Tu promedio es correcto', 'Un bloque plano de altura ' + num(c.avg, 5) + ' sobre R (área ' + num(c.area, 5) + ') tiene el mismo volumen que el sólido bajo la superficie.']
            : ['Tu integral es correcta', 'Con ' + c.m + ' × ' + c.n + ' celdas la suma da ' + num(c.sum, 6) + '; al refinar la cuadrícula se acerca a ' + num(c.exact, 6) + '.'],
        onlyX: ['Integraste solo respecto a x', 'Te quedó A(y) = ∫ f dx, una función de y, y la evaluaste en y = d menos y = c. Falta integrarla: ∬ = ∫ A(y) dy, de c a d.'],
        onlyY: ['Integraste solo respecto a y', 'Te quedó B(x) = ∫ f dy, una función de x, y la evaluaste en los extremos. Falta integrarla: ∬ = ∫ B(x) dx, de a a b.'],
        swap: ['Cruzaste los límites', 'x va de a a b y y de c a d. Tú integraste x entre c y d (y y entre a y b).'],
        avg: ['Eso es el valor promedio', 'El promedio es la integral entre el área. Multiplica por el área de R (' + num(c.area, 5) + ') para tener la integral.'],
        sum: ['Eso es la suma de esta cuadrícula', 'La integral es el límite de las sumas. Con más celdas la suma se acerca a otro valor; mira la gráfica de convergencia.'],
        noDA: ['Olvidaste multiplicar por ΔA', 'Sumaste solo las alturas f(x*, y*). Cada prisma tiene volumen f(x*, y*) · ΔA, con ΔA = Δx · Δy = ' + dA + '.'],
        dxOnly: ['Multiplicaste solo por Δx', 'La base del prisma es un rectángulo: ΔA = Δx · Δy. Te faltó Δy = ' + num(c.dy, 4) + '.'],
        dyOnly: ['Multiplicaste solo por Δy', 'La base del prisma es un rectángulo: ΔA = Δx · Δy. Te faltó Δx = ' + num(c.dx, 4) + '.'],
        'rule-ll': ['Usaste otro punto de muestra', 'Tu número sale con la esquina inferior izquierda; el lab está en ' + RULE_TXT[c.rule] + '.'],
        'rule-ur': ['Usaste otro punto de muestra', 'Tu número sale con la esquina superior derecha; el lab está en ' + RULE_TXT[c.rule] + '.'],
        'rule-mid': ['Usaste otro punto de muestra', 'Tu número sale con el punto medio; el lab está en ' + RULE_TXT[c.rule] + '.'],
        exact: ['Eso es la integral exacta', 'Se pide la suma con ' + c.m + ' × ' + c.n + ' celdas, no su límite.'],
        integral: ['Eso es la integral, no el promedio', 'Divide entre el área de R (' + num(c.area, 5) + '): f̄ = (1/área) ∬ f dA.'],
        center: ['Eso es f en el centro de R', 'El promedio usa todos los puntos de R, no solo el centro: f̄ = (1/área) ∬ f dA.'],
        sign: ['Casi: tu signo está invertido', 'Revisa los signos al evaluar la antiderivada: arriba menos abajo.'],
        mismatch: ['No coincide', mode === 'sum' ? 'Evalúa f en el punto de muestra de cada celda, suma y multiplica por ΔA.' : mode === 'avg' ? 'Calcula la integral y divídela entre el área de R.' : 'Integra primero respecto a una variable, con la otra fija, y luego respecto a la otra.']
      };
      var m = msgs[r.reason] || msgs.mismatch;
      UI.verdict(verdict, r.kind === 'ok' ? 'ok' : r.kind === 'warn' ? 'warn' : 'bad', m[0], m[1]);
      solved = r.kind === 'ok';
      draw();
    }

    /* ---------- Dibujo ---------- */
    function el(tag, attrs, parent, txt) {
      var n = document.createElementNS(NS, tag);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (txt != null) n.textContent = txt;
      parent.appendChild(n);
      return n;
    }
    function pathOf(pts, close) {
      return pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('') + (close ? 'Z' : '');
    }
    // Rango de z: la superficie, los prismas y el piso z = 0.
    function zRange(c, cs) {
      var lo = 0, hi = 0, i, j;
      for (i = 0; i <= 24; i++) for (j = 0; j <= 24; j++) {
        var z = F(R[0] + (R[1] - R[0]) * i / 24, R[2] + (R[3] - R[2]) * j / 24);
        if (isFinite(z)) { lo = Math.min(lo, z); hi = Math.max(hi, z); }
      }
      cs.forEach(function (q) { if (isFinite(q.z)) { lo = Math.min(lo, q.z); hi = Math.max(hi, q.z); } });
      if (hi - lo < 1e-6) { lo -= 1; hi += 1; }
      return [lo, hi];
    }

    function draw() {
      if (!F) return;
      var c = C = calc(), cs = LM.cells(F, R, c.m, c.n, c.rule);
      drawPrisms(c, cs);
      drawHeat(c, cs);
      drawConv(c);
      if (view === '3d') schedule3D();
      var hide = hideBox.checked && !solved, q = '¿?';
      capHeat.textContent = 'Vista desde arriba · ' + c.m + ' × ' + c.n + ' celdas, ' + RULE_TXT[c.rule];
      capConv.textContent = 'La suma contra m·n (cuadrículas k × k, ' + RULE_TXT[c.rule] + ')';
      var mc = LM.monteCarlo(F, R, 4000, 11);
      var rows = [
        ['R', '[' + num(R[0], 4) + ', ' + num(R[1], 4) + '] × [' + num(R[2], 4) + ', ' + num(R[3], 4) + '] · área ' + num(c.area, 5)],
        ['Δx · Δy = ΔA', num(c.dx, 4) + ' · ' + num(c.dy, 4) + ' = ' + num(c.dA, 4)],
        ['Σ f(x*, y*)  (' + (c.m * c.n) + ' alturas)', hide ? q : num(c.raw)],
        ['suma de Riemann Σ f ΔA', hide ? q : num(c.sum)],
        ['∬_R f dA (cuadratura)', hide ? q : num(c.exact, 6)],
        ['Monte Carlo (4000 puntos)', hide ? q : num(mc.value, 4) + ' ± ' + num(2 * mc.se, 2)],
        ['error |suma − integral|', hide ? q : num(c.err, 4)],
        ['valor promedio f̄', hide ? q : num(c.avg)]
      ];
      board.innerHTML = '';
      rows.forEach(function (r) { board.appendChild(h('dt', {}, [r[0]])); board.appendChild(h('dd', {}, [r[1]])); });
    }

    // Proyección SVG: los prismas (de atrás hacia adelante) y la malla de la superficie encima.
    function drawPrisms(c, cs) {
      var zr = zRange(c, cs), zs = zr[1] - zr[0], zlo = zr[0] - 0.06 * zs, zhi = zr[1] + 0.06 * zs;
      var cx = (R[0] + R[1]) / 2, cy = (R[2] + R[3]) / 2, s = 2 / Math.max(R[1] - R[0], R[3] - R[2]), kz = 1.25 / (zhi - zlo);
      var az = -35 * Math.PI / 180, elv = 26 * Math.PI / 180, ca = Math.cos(az), sa = Math.sin(az), ce = Math.cos(elv), se = Math.sin(elv);
      function raw(x, y, z) {
        var X = (x - cx) * s, Y = (y - cy) * s, Z = (z - (zlo + zhi) / 2) * kz;
        var u = X * ca - Y * sa, v = X * sa + Y * ca;
        return [v, -(Z * ce - u * se), u];
      }
      var box = [], W = 640, H = 360, mg = 30;
      [R[0], R[1]].forEach(function (x) { [R[2], R[3]].forEach(function (y) { [zlo, zhi].forEach(function (z) { box.push(raw(x, y, z)); }); }); });
      var x0 = Math.min.apply(null, box.map(function (q) { return q[0]; })), x1 = Math.max.apply(null, box.map(function (q) { return q[0]; }));
      var y0 = Math.min.apply(null, box.map(function (q) { return q[1]; })), y1 = Math.max.apply(null, box.map(function (q) { return q[1]; }));
      var k = Math.min((W - 2 * mg) / (x1 - x0), (H - 2 * mg) / (y1 - y0)), ox = (W - k * (x1 - x0)) / 2, oy = (H - k * (y1 - y0)) / 2;
      function Pt(x, y, z) { var q = raw(x, y, z); return [ox + (q[0] - x0) * k, oy + (q[1] - y0) * k]; }
      prism.innerHTML = '';
      var g = el('g', { class: 'sketch' }, prism);
      // Piso con la cuadrícula.
      var floor = [[R[0], R[2]], [R[1], R[2]], [R[1], R[3]], [R[0], R[3]]].map(function (q) { return Pt(q[0], q[1], 0); });
      el('path', { d: pathOf(floor, true), class: 'plot-grid', fill: 'none' }, g);
      // Prismas: de atrás (u chica: se ve más arriba) hacia adelante; solo las caras que miran a la cámara.
      var order = cs.slice().sort(function (p, q) { return raw((p.x0 + p.x1) / 2, (p.y0 + p.y1) / 2, 0)[2] - raw((q.x0 + q.x1) / 2, (q.y0 + q.y1) / 2, 0)[2]; });
      // Normal hacia afuera de cada pared (en el plano xy) y si mira a la cámara (la cámara está hacia +u).
      var faces = [[[0, -1], function (q) { return [[q.x0, q.y0], [q.x1, q.y0]]; }], [[1, 0], function (q) { return [[q.x1, q.y0], [q.x1, q.y1]]; }],
        [[0, 1], function (q) { return [[q.x1, q.y1], [q.x0, q.y1]]; }], [[-1, 0], function (q) { return [[q.x0, q.y1], [q.x0, q.y0]]; }]];
      var seen = faces.filter(function (fc) { return fc[0][0] * ca - fc[0][1] * sa > 1e-9; });
      order.forEach(function (q) {
        if (!isFinite(q.z)) return;
        var neg = q.z < 0, cls = neg ? 'rect-fill rect-fill--neg' : 'rect-fill';
        seen.forEach(function (fc) {
          var e = fc[1](q);
          el('path', { d: pathOf([Pt(e[0][0], e[0][1], 0), Pt(e[1][0], e[1][1], 0), Pt(e[1][0], e[1][1], q.z), Pt(e[0][0], e[0][1], q.z)], true), class: cls }, g);
        });
        el('path', { d: pathOf([Pt(q.x0, q.y0, q.z), Pt(q.x1, q.y0, q.z), Pt(q.x1, q.y1, q.z), Pt(q.x0, q.y1, q.z)], true), class: cls }, g);
      });
      // Malla de la superficie (tenue) para comparar.
      var dW = '', n = 10, N = 40, i, j;
      for (i = 0; i <= n; i++) {
        var xs = R[0] + (R[1] - R[0]) * i / n, ys = R[2] + (R[3] - R[2]) * i / n, l1 = [], l2 = [];
        for (j = 0; j <= N; j++) {
          var t = j / N, yv = R[2] + (R[3] - R[2]) * t, xv = R[0] + (R[1] - R[0]) * t;
          l1.push(Pt(xs, yv, F(xs, yv))); l2.push(Pt(xv, ys, F(xv, ys)));
        }
        dW += pathOf(l1) + pathOf(l2);
      }
      el('path', { d: dW, class: 'ref', fill: 'none', 'stroke-width': 1.1, 'stroke-opacity': 0.55 }, g);
      // Puntos de muestra sobre la superficie (si la cuadrícula no es muy fina).
      if (c.m * c.n <= 36) cs.forEach(function (q) { if (isFinite(q.z)) { var p = Pt(q.xs, q.ys, q.z); el('circle', { cx: p[0], cy: p[1], r: 3.5, class: 'dot-trace' }, g); } });
      // Ejes desde la esquina del piso, con su letra más allá de la punta.
      var o0 = Pt(R[0], R[2], 0), ex = Pt(R[1] + 0.2 * (R[1] - R[0]), R[2], 0), ey = Pt(R[0], R[3] + 0.2 * (R[3] - R[2]), 0);
      [[ex, 'x'], [ey, 'y']].forEach(function (e) {
        el('path', { d: 'M' + o0[0].toFixed(1) + ' ' + o0[1].toFixed(1) + 'L' + e[0][0].toFixed(1) + ' ' + e[0][1].toFixed(1), class: 'axis', fill: 'none', 'stroke-width': 1.4 }, g);
        var dx = e[0][0] - o0[0], dy = e[0][1] - o0[1], L = Math.hypot(dx, dy) || 1;
        el('text', { x: (e[0][0] + dx / L * 12).toFixed(1), y: (e[0][1] + dy / L * 12 + 5).toFixed(1), class: 'lab-tick', 'text-anchor': 'middle' }, g, e[1]);
      });
    }

    // Mapa de calor: cada celda con opacidad según |f(x*, y*)|; f < 0 con la clase de error.
    function drawHeat(c, cs) {
      var p = window.LabPlot(heat, { x: [R[0], R[1]], y: [R[2], R[3]] });
      p.clear();
      var g = heat.querySelector('g.sketch'), top = 0;
      cs.forEach(function (q) { if (isFinite(q.z)) top = Math.max(top, Math.abs(q.z)); });
      top = top || 1;
      var wpx = Math.abs(p.X(R[0] + c.dx) - p.X(R[0])), hpx = Math.abs(p.Y(R[2]) - p.Y(R[2] + c.dy));
      var labels = wpx >= 46 && hpx >= 34;
      cs.forEach(function (q) {
        if (!isFinite(q.z)) return;
        var X0 = p.X(q.x0), X1 = p.X(q.x1), Y0 = p.Y(q.y1), Y1 = p.Y(q.y0);
        var op = 0.15 + 0.85 * Math.abs(q.z) / top;
        el('rect', { x: X0.toFixed(1), y: Y0.toFixed(1), width: (X1 - X0).toFixed(1), height: (Y1 - Y0).toFixed(1), class: q.z < 0 ? 'rect-fill rect-fill--neg' : 'rect-fill', opacity: op.toFixed(2) }, g);
      });
      // Bordes de las celdas, nítidos encima del relleno.
      var d = '', i;
      for (i = 0; i <= c.m; i++) { var xx = p.X(R[0] + i * c.dx).toFixed(1); d += 'M' + xx + ' ' + p.Y(R[3]).toFixed(1) + 'V' + p.Y(R[2]).toFixed(1); }
      for (i = 0; i <= c.n; i++) { var yy = p.Y(R[2] + i * c.dy).toFixed(1); d += 'M' + p.X(R[0]).toFixed(1) + ' ' + yy + 'H' + p.X(R[1]).toFixed(1); }
      el('path', { d: d, class: 'axis', fill: 'none', 'stroke-width': 1 }, g);
      cs.forEach(function (q) {
        if (!isFinite(q.z)) return;
        var px = p.X(q.xs), py = p.Y(q.ys);
        el('circle', { cx: px, cy: py, r: c.m * c.n > 64 ? 2.5 : 4, class: 'dot-trace' }, g);
        if (labels) {
          var cxp = (p.X(q.x0) + p.X(q.x1)) / 2, cyp = (p.Y(q.y0) + p.Y(q.y1)) / 2;
          // En el punto medio el número va debajo del punto; en las esquinas, al centro.
          el('text', { x: cxp.toFixed(1), y: (c.rule === 'mid' ? cyp + 17 : cyp + 4).toFixed(1), class: 'lab-tick', 'text-anchor': 'middle' }, g, UI.fmt(q.z, 4).replace('-', '−'));
        }
      });
      // Marcas de los extremos: a y b abajo, c y d a la izquierda.
      var xb = p.Y(R[2]) + 18, yl = p.X(R[0]) - 6;
      el('text', { x: p.X(R[0]).toFixed(1), y: xb.toFixed(1), class: 'lab-tick', 'text-anchor': 'middle' }, g, UI.fmt(R[0], 3).replace('-', '−'));
      el('text', { x: p.X(R[1]).toFixed(1), y: xb.toFixed(1), class: 'lab-tick', 'text-anchor': 'end' }, g, UI.fmt(R[1], 3).replace('-', '−'));
      el('text', { x: yl.toFixed(1), y: (p.Y(R[2])).toFixed(1), class: 'lab-tick', 'text-anchor': 'end' }, g, UI.fmt(R[2], 3).replace('-', '−'));
      el('text', { x: yl.toFixed(1), y: (p.Y(R[3]) + 10).toFixed(1), class: 'lab-tick', 'text-anchor': 'end' }, g, UI.fmt(R[3], 3).replace('-', '−'));
      el('text', { x: ((p.X(R[0]) + p.X(R[1])) / 2).toFixed(1), y: xb.toFixed(1), class: 'lab-tick', 'text-anchor': 'middle' }, g, 'x');
      el('text', { x: yl.toFixed(1), y: ((p.Y(R[2]) + p.Y(R[3])) / 2 + 4).toFixed(1), class: 'lab-tick', 'text-anchor': 'end' }, g, 'y');
    }

    // Convergencia: la suma con cuadrículas k × k (k = 1…12) y la de m × n actual, contra el valor exacto.
    function drawConv(c) {
      var pts = [], k;
      for (k = 1; k <= MAXD; k++) pts.push([k * k, LM.riemann(F, R, k, k, c.rule).sum]);
      var cur = [c.m * c.n, c.sum], ys = pts.map(function (q) { return q[1]; }).concat([c.exact, cur[1]]);
      if (student != null && mode !== 'avg') ys.push(student);
      var lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys);
      if (hi - lo < 1e-6 * (1 + Math.abs(hi))) { lo -= 0.5 + 0.05 * Math.abs(lo); hi += 0.5 + 0.05 * Math.abs(hi); }
      var pad = (hi - lo) * 0.14;
      var p = window.LabPlot(conv, { x: [0, MAXD * MAXD + 4], y: [lo - pad, hi + pad] });
      p.clear(); p.grid(); p.axes();
      p.line(function () { return c.exact; }, 'aux', 2.4, '7 5');
      var d = pts.map(function (q, i) { return (i ? 'L' : 'M') + p.X(q[0]).toFixed(1) + ' ' + p.Y(q[1]).toFixed(1); }).join('');
      el('path', { d: d, class: 'trace', fill: 'none', 'stroke-width': 2, 'stroke-linejoin': 'round' }, conv.querySelector('g.sketch'));
      pts.forEach(function (q) { p.point(q[0], q[1], 'dot-trace', 3.2); });
      p.point(cur[0], cur[1], 'dot-trace', 7);
      if (student != null && mode !== 'avg') p.point(cur[0], student, 'dot-student', 5.5);
    }

    /* ---------- Vista 3D (solo PC) ---------- */
    function setView(v) {
      view = v === '3d' && scene3 ? '3d' : '2d';
      prism.style.display = view === '2d' ? '' : 'none';
      stage3d.hidden = note3d.hidden = view !== '3d';
      btn3d.setAttribute('aria-pressed', String(view === '3d'));
      btn2d.setAttribute('aria-pressed', String(view === '2d'));
      if (view === '3d') schedule3D();
    }
    function schedule3D() {
      if (pending3) return;
      pending3 = true;
      requestAnimationFrame(function () { pending3 = false; try { draw3D(); } catch (e) { console.error(e); setView('2d'); } });
    }
    function draw3D() {
      if (!scene3 || !F) return;
      var c = C || calc(), cs = LM.cells(F, R, c.m, c.n, c.rule);
      var zr = zRange(c, cs), zs = zr[1] - zr[0], zlo = zr[0] - 0.06 * zs, zhi = zr[1] + 0.06 * zs;
      var cx = (R[0] + R[1]) / 2, cy = (R[2] + R[3]) / 2, s = 8 / Math.max(R[1] - R[0], R[3] - R[2]), kz = 4.6 / (zhi - zlo), zc = (zlo + zhi) / 2;
      function P3(x, y, z) { return [(x - cx) * s, (y - cy) * s, ((isFinite(z) ? Math.max(zlo, Math.min(zhi, z)) : 0) - zc) * kz]; }
      var col = { ref: UI.color('--plot-ref'), aux: UI.color('--plot-aux'), tr: UI.color('--plot-trace'), err: UI.color('--plot-error'), ax: UI.color('--plot-axis') };
      var objs = [];
      // Todos los prismas en una sola superficie escalonada: cada celda ocupa 3 cuadritos por lado
      // (pared que sube, techo, pared que baja), así que los vértices caen justo en los bordes.
      var m = c.m, n = c.n, H = cs.map(function (q) { return isFinite(q.z) ? q.z : 0; });
      function corner(u, i0, len, lo0, step) {
        var cell = Math.min(len - 1, Math.floor(u / 3)), r = Math.round(u - 3 * cell);
        return { cell: cell, top: r === 1 || r === 2, at: lo0 + step * (cell + (r >= 2 ? 1 : 0)) };
      }
      objs.push(new M3.Surface3D({
        func: function (u, v) {
          var a = corner(Math.round(u), 0, m, R[0], c.dx), b = corner(Math.round(v), 0, n, R[2], c.dy);
          var z = a.top && b.top ? H[b.cell * m + a.cell] : 0;
          return P3(a.at, b.at, z);
        },
        uRange: [0, 3 * m], vRange: [0, 3 * n], uResolution: 3 * m, vResolution: 3 * n,
        color: col.aux, opacity: 0.6, doubleSided: true
      }));
      // La superficie, translúcida.
      objs.push(new M3.Surface3D({ func: function (u, v) { return P3(u, v, F(u, v)); }, uRange: [R[0], R[1]], vRange: [R[2], R[3]], uResolution: 32, vResolution: 32, color: col.ref, opacity: 0.4, doubleSided: true }));
      function line(p, q, color, w) { if (p.concat(q).every(isFinite)) objs.push(new M3.Line3D({ start: p, end: q, color: color, lineWidth: w || 2 })); }
      // Cuadrícula del piso y contorno del techo de cada prisma (si no son demasiados).
      var i, j;
      for (i = 0; i <= m; i++) line(P3(R[0] + i * c.dx, R[2], 0), P3(R[0] + i * c.dx, R[3], 0), col.ax, 1.5);
      for (j = 0; j <= n; j++) line(P3(R[0], R[2] + j * c.dy, 0), P3(R[1], R[2] + j * c.dy, 0), col.ax, 1.5);
      if (m * n <= 64) cs.forEach(function (q) {
        if (!isFinite(q.z)) return;
        var A = P3(q.x0, q.y0, q.z), B = P3(q.x1, q.y0, q.z), Cc = P3(q.x1, q.y1, q.z), D = P3(q.x0, q.y1, q.z);
        var cl = q.z < 0 ? col.err : col.tr;
        line(A, B, cl, 2); line(B, Cc, cl, 2); line(Cc, D, cl, 2); line(D, A, cl, 2);
      });
      scene3.clear();
      scene3.add.apply(scene3, objs);
      if (typeof scene3.render === 'function') scene3.render();
    }
    function init3D() {
      if (!want3D) return;
      UI.loadManim().then(function (mod) {
        M3 = mod;
        stage3d.hidden = false;
        var wd = stage3d.clientWidth || 640;
        scene3 = new M3.ThreeDScene(stage3d, { width: wd, height: Math.round(wd * 2 / 3), backgroundOpacity: 0, phi: 62 * Math.PI / 180, theta: -55 * Math.PI / 180, enableOrbitControls: true });
        stage3d.setAttribute('data-3d-ready', 'true');
        setView('3d');
      }).catch(function (e) {
        console.error(e);
        stage3d.hidden = true; viewBar.hidden = true; scene3 = null; setView('2d');
      });
    }

    document.addEventListener('cb:themechange', function () { draw(); });
    setView('2d');
    return UI.loadMath().then(function (m) {
      math = m; build(); setTimeout(build, 400);
      UI.onVisible(mount, init3D);
    });
  };
})();
