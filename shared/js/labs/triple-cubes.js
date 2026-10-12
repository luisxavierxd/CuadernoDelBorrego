/* =====================================================================
   Lab triple-cubes (Cálculo 2 · S14): cubitos → sólido.
   Un sólido E (caja, tetraedro bajo un plano, cuña sobre un triángulo o
   región bajo un paraboloide) se llena con cubitos: n divisiones en x y y,
   m en z; cuenta el cubito si su centro está dentro. La suma Σ ρ ΔV se
   compara con el valor exacto (integral iterada por cuadratura en
   rectangulares) y con Monte Carlo con semilla fija.
   Vistas: en PC, 3D con manim-web; siempre, la proyección SVG de los
   cubitos, la sombra D con la altura de cada columna y un corte vertical.
   Reto: el alumno escribe el volumen, la masa o una coordenada del centro
   de masa; el lab detecta si usó la región D equivocada (el rectángulo
   entero), si olvidó la densidad, si no dividió entre la masa (o dividió
   entre el volumen) o si invirtió los límites en z.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  // Gauss–Legendre de 10 nodos (exacta hasta grado 19) y versión adaptiva por bisección.
  var GX = [0.1488743389816312, 0.4333953941292472, 0.6794095682990244, 0.8650633666889845, 0.9739065285171717];
  var GW = [0.2955242247147529, 0.2692667193099963, 0.2190863625159820, 0.1494513491505806, 0.0666713443086881];
  function glv(f, a, b, k) {
    var c = (a + b) / 2, h = (b - a) / 2, s = [], i, j, v;
    for (j = 0; j < k; j++) s.push(0);
    for (i = 0; i < 5; i++) {
      v = f(c - h * GX[i]); for (j = 0; j < k; j++) s[j] += GW[i] * v[j];
      v = f(c + h * GX[i]); for (j = 0; j < k; j++) s[j] += GW[i] * v[j];
    }
    for (j = 0; j < k; j++) s[j] *= h;
    return s;
  }
  function maxAbs(v) { var m = 0; for (var j = 0; j < v.length; j++) m = Math.max(m, Math.abs(v[j])); return m; }
  function adapt(f, a, b, k, tol, depth, whole, eps) {
    if (a === b) { var z = []; for (var j = 0; j < k; j++) z.push(0); return z; }
    whole = whole || glv(f, a, b, k);
    if (eps == null) eps = tol * Math.max(maxAbs(whole), 1e-300);
    var m = (a + b) / 2, L = glv(f, a, m, k), R = glv(f, m, b, k), sum = [], diff = 0;
    for (var i = 0; i < k; i++) { sum.push(L[i] + R[i]); diff = Math.max(diff, Math.abs(sum[i] - whole[i])); }
    if (depth <= 0 || diff <= eps || !isFinite(diff)) return sum;
    var A = adapt(f, a, m, k, tol, depth - 1, L, eps / 1.5), B = adapt(f, m, b, k, tol, depth - 1, R, eps / 1.5);
    return A.map(function (x, i2) { return x + B[i2]; });
  }

  // ∫_{X0}^{X1} ∫_{Y(u)} ∫_{Z(u, w)} f(u, w, t) dt dw du. f puede devolver un número o un arreglo.
  // Las variables se llaman como el orden de integración: aquí u es la de afuera y t la de adentro.
  function integrate(f, X, Y, Z, tol) {
    tol = tol || 1e-12;
    var u0 = (X[0] + X[1]) / 2, yr0 = Y(u0), w0 = (yr0[0] + yr0[1]) / 2, zr0 = Z(u0, w0), probe = f(u0, w0, (zr0[0] + zr0[1]) / 2);
    var vec = Array.isArray(probe), k = vec ? probe.length : 1;
    var F = vec ? f : function (u, w, t) { return [f(u, w, t)]; };
    var r = adapt(function (u) {
      var yr = Y(u);
      return adapt(function (w) {
        var zr = Z(u, w);
        return adapt(function (t) { return F(u, w, t); }, zr[0], zr[1], k, tol, 30);
      }, yr[0], yr[1], k, tol, 30);
    }, X[0], X[1], k, tol, 40);
    return vec ? r : r[0];
  }
  // Cualquier orden: order = variable de adentro, de en medio y de afuera (p. ej. 'zyx' = dz dy dx).
  // outer = [a, b]; mid(u) = límites de la de en medio; inner(u, w) = límites de la de adentro.
  function iterated(f, order, outer, mid, inner, tol) {
    var o = order.charAt(2), m = order.charAt(1), i = order.charAt(0);
    return integrate(function (u, w, t) { var p = {}; p[o] = u; p[m] = w; p[i] = t; return f(p.x, p.y, p.z); }, outer, mid, inner, tol);
  }
  // Volumen, masa, momentos y centro de masa (y el centroide geométrico) con la integral iterada dz dy dx.
  function moments(rho, X, Y, Z) {
    var r = integrate(function (x, y, z) { var p = rho(x, y, z); return [1, p, x * p, y * p, z * p, x, y, z]; }, X, Y, Z);
    return {
      V: r[0], M: r[1], Myz: r[2], Mxz: r[3], Mxy: r[4],
      xbar: r[2] / r[1], ybar: r[3] / r[1], zbar: r[4] / r[1],
      geo: { x: r[5] / r[0], y: r[6] / r[0], z: r[7] / r[0] }
    };
  }

  // Valor promedio de f en el sólido: ∭ f dV ÷ ∭ 1 dV (las dos con la integral iterada).
  function average(f, X, Y, Z) {
    var r = integrate(function (x, y, z) { return [f(x, y, z), 1]; }, X, Y, Z);
    return { avg: r[0] / r[1], integral: r[0], V: r[1] };
  }

  // mulberry32: números al azar reproducibles.
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  // Monte Carlo en la caja que envuelve al sólido: V ≈ V_caja · (fracción adentro), M ≈ V_caja · promedio de ρ·[adentro].
  function monteCarlo(rho, S, N, seed) {
    var R = rng(seed == null ? 14 : seed), B = S.box, vb = (B[0][1] - B[0][0]) * (B[1][1] - B[1][0]) * (B[2][1] - B[2][0]);
    var n = 0, s1 = 0, q1 = 0, sx = 0, sy = 0, sz = 0;
    for (var i = 0; i < N; i++) {
      var x = B[0][0] + (B[0][1] - B[0][0]) * R(), y = B[1][0] + (B[1][1] - B[1][0]) * R(), z = B[2][0] + (B[2][1] - B[2][0]) * R();
      if (!S.inside(x, y, z)) continue;
      var p = rho(x, y, z);
      n++; s1 += p; q1 += p * p; sx += x * p; sy += y * p; sz += z * p;
    }
    var f = n / N, mp = s1 / N;
    return {
      N: N, V: vb * f, M: vb * mp, seV: vb * Math.sqrt(f * (1 - f) / N), seM: vb * Math.sqrt(Math.max(0, q1 / N - mp * mp) / N),
      Myz: vb * sx / N, Mxz: vb * sy / N, Mxy: vb * sz / N, xbar: sx / s1, ybar: sy / s1, zbar: sz / s1
    };
  }
  // Suma de cubitos: n divisiones en x y y, m en z; cuenta el cubito si su centro está dentro.
  function cubes(rho, S, n, m) {
    var B = S.box, dx = (B[0][1] - B[0][0]) / n, dy = (B[1][1] - B[1][0]) / n, dz = (B[2][1] - B[2][0]) / m, dV = dx * dy * dz;
    var cols = [], cells = [], cnt = 0, M = 0, sx = 0, sy = 0, sz = 0;
    for (var i = 0; i < n; i++) {
      cols.push([]);
      var xc = B[0][0] + (i + 0.5) * dx;
      for (var j = 0; j < n; j++) {
        var yc = B[1][0] + (j + 0.5) * dy, k = 0;
        for (var l = 0; l < m; l++) {
          var zc = B[2][0] + (l + 0.5) * dz;
          if (!S.inside(xc, yc, zc)) continue;
          var p = rho(xc, yc, zc);
          k++; cnt++; cells.push([i, j, l]);
          M += p * dV; sx += xc * p * dV; sy += yc * p * dV; sz += zc * p * dV;
        }
        cols[i].push(k);
      }
    }
    return { n: n, m: m, dx: dx, dy: dy, dz: dz, dV: dV, count: cnt, cols: cols, cells: cells, V: cnt * dV, M: M, xbar: sx / M, ybar: sy / M, zbar: sz / M };
  }

  // Sólido z entre Z(x, y) sobre la sombra D: x en X, y en Y(x). box = caja que lo envuelve.
  function solid(o) {
    o.inside = function (x, y, z) {
      if (x < o.X[0] || x > o.X[1]) return false;
      var yr = o.Y(x);
      if (y < yr[0] || y > yr[1]) return false;
      var zr = o.Z(x, y);
      return z >= zr[0] && z <= zr[1];
    };
    return o;
  }
  // Presets. rect = el error típico de integrar sobre el rectángulo que envuelve a D (con la misma tapa).
  function solidOf(key, p) {
    p = p || {};
    var S;
    if (key === 'tetra') {
      var a = p.a || 4, b = p.b || 2, c = p.c || 3;
      S = { X: [0, a], Y: function (x) { return [0, b * (1 - x / a)]; }, top: function (x, y) { return c * (1 - x / a - y / b); }, box: [[0, a], [0, b], [0, c]] };
    } else if (key === 'wedge') {
      var a2 = p.a || 2, h = p.h || 5;
      S = { X: [0, a2], Y: function (x) { return [0, x]; }, top: function (x, y) { return h - x - y; }, box: [[0, a2], [0, a2], [0, h]] };
    } else if (key === 'para') {
      var a3 = p.a || 2, h3 = p.h || 5, k3 = p.k || 0.5;
      S = { X: [0, a3], Y: function () { return [0, a3]; }, top: function (x, y) { return h3 - k3 * (x * x + y * y); }, box: [[0, a3], [0, a3], [0, h3]] };
    } else {
      var a4 = p.a || 3, b4 = p.b || 2, c4 = p.c || 2;
      S = { X: [0, a4], Y: function () { return [0, b4]; }, top: function () { return c4; }, box: [[0, a4], [0, b4], [0, c4]] };
      key = 'box';
    }
    S.key = key;
    S.Z = function (x, y) { return [0, S.top(x, y)]; };
    var yb = [S.box[1][0], S.box[1][1]];
    S.rect = { X: S.X, Y: function () { return yb; }, Z: S.Z };
    return solid(S);
  }
  // Todo lo del tablero: valor exacto, centroide, el resultado con la D equivocada y la caja.
  function analyze(rho, S) {
    var ex = moments(rho, S.X, S.Y, S.Z), w = moments(rho, S.rect.X, S.rect.Y, S.rect.Z), B = S.box;
    ex.wrong = w;
    ex.boxV = (B[0][1] - B[0][0]) * (B[1][1] - B[1][0]) * (B[2][1] - B[2][0]);
    return ex;
  }

  // Cerca con la holgura de los ejercicios: ±0.01 (o ±1 %) desde 0.1; abajo, ±1 % o 0.0005.
  function near(s, t) {
    var d = Math.abs(s - t), at = Math.abs(t);
    if (at >= 0.1) return d <= Math.max(0.01, 0.01 * at) + 1e-9;
    return d <= Math.max(0.01 * at, 5e-4) + 1e-12;
  }
  var MOM = { x: 'Myz', y: 'Mxz', z: 'Mxy' };
  function want(c, mode) { return mode === 'V' ? c.V : mode === 'M' ? c.M : c[mode]; }
  // Errores típicos de cada reto, en orden de prioridad.
  function candidates(c, mode) {
    if (mode === 'V') return [['wrongD', c.wrong.V], ['box', c.boxV], ['flip', -c.V]];
    if (mode === 'M') return [['noRho', c.V], ['wrongD', c.wrong.M], ['flip', -c.M]];
    var q = mode.charAt(0), mom = c[MOM[q]];
    return [['noDiv', mom], ['byVol', mom / c.V], ['noRho', c.geo[q]], ['wrongD', c.wrong[mode]]];
  }
  // Diagnóstico del número del alumno → { kind: ok|warn|bad|invalid, reason, want }.
  // reason: correct · wrongD · box · flip · noRho · noDiv · byVol · mismatch
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

  window.LabMath.triple = {
    gl: function (f, a, b) { return glv(function (x) { return [f(x)]; }, a, b, 1)[0]; },
    adapt: function (f, a, b, tol) { return adapt(function (x) { return [f(x)]; }, a, b, 1, tol || 1e-12, 40)[0]; },
    integrate: integrate, iterated: iterated, moments: moments, average: average, rng: rng, monteCarlo: monteCarlo, cubes: cubes,
    solid: solid, solidOf: solidOf, analyze: analyze, near: near, want: want, candidates: candidates, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { key: 'box', name: 'Caja [0, 3] × [0, 2] × [0, 2]', p: { a: 3, b: 2, c: 2 }, D: 'el rectángulo [0, 3] × [0, 2]', topTxt: 'z = 2' },
    { key: 'tetra', name: 'Tetraedro bajo el plano x/4 + y/2 + z/3 = 1', p: { a: 4, b: 2, c: 3 }, D: 'el triángulo 0 ≤ x ≤ 4, 0 ≤ y ≤ 2(1 − x/4)', topTxt: 'z = 3(1 − x/4 − y/2)' },
    { key: 'wedge', name: 'Cuña bajo z = 5 − x − y sobre el triángulo 0 ≤ y ≤ x ≤ 2', p: { a: 2, h: 5 }, D: 'el triángulo 0 ≤ y ≤ x ≤ 2', topTxt: 'z = 5 − x − y' },
    { key: 'para', name: 'Bajo el paraboloide z = 5 − (x² + y²)/2 sobre [0, 2] × [0, 2]', p: { a: 2, h: 5, k: 0.5 }, D: 'el cuadrado [0, 2] × [0, 2]', topTxt: 'z = 5 − (x² + y²)/2' }
  ];
  var DENS = [['1', 'ρ = 1 (solo volumen)'], ['z', 'ρ = z (más denso arriba)'], ['1 + x', 'ρ = 1 + x'], ['x + y + z', 'ρ = x + y + z'], ['1 + x*y', 'ρ = 1 + xy']];
  var MODES = [['V', 'Volumen ∭ 1 dV'], ['M', 'Masa ∭ ρ dV'], ['xbar', 'x̄ del centro de masa'], ['ybar', 'ȳ del centro de masa'], ['zbar', 'z̄ del centro de masa']];
  var NS = 'http://www.w3.org/2000/svg', MC_N = 20000;

  window.Labs['triple-cubes'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, LM = window.LabMath.triple;
    var presets = cfg.presets || PRESETS, start = cfg.start != null ? cfg.start : 1;
    var math = null, P = presets[start], S = LM.solidOf(P.key, P.p), rho = null, rhoSrc = '1';
    var exact = null, mc = null, conv = null, mode = 'V', solved = false, student = null;

    var preset = UI.select({ label: 'Sólido', options: presets.map(function (p) { return p.name; }) });
    var densSel = UI.select({ label: 'Densidad (ejemplos)', options: DENS.map(function (d) { return d[1]; }) });
    var rIn = UI.mathField({ label: 'Densidad ρ(x, y, z)', hint: 'Escribe ρ en términos de x, y y z; con ρ = 1 la masa es el volumen.', palette: 'multi', onEnter: function () { build(); } });
    var run = UI.button('Calcular', 'primary', function () { build(); });
    var status = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var nS = UI.slider({ label: 'n (divisiones en x y en y)', min: 1, max: 8, step: 1, value: cfg.n || 4 }, function () { rowS.input.max = nS.get(); if (rowS.get() > nS.get()) rowS.set(nS.get()); moved(); });
    var mS = UI.slider({ label: 'm (divisiones en z)', min: 1, max: 8, step: 1, value: cfg.m || 4 }, function () { moved(); });
    var rowS = UI.slider({ label: 'Fila del corte (j, en y)', min: 1, max: cfg.n || 4, step: 1, value: 1 }, function () { moved(); });
    var modeSel = UI.select({ label: 'Reto', options: MODES.map(function (m) { return m[1]; }) });
    var ans = UI.input({ label: 'Tu volumen', type: 'text', inputmode: 'decimal', mono: false, hint: 'Redondea a 2 decimales.' });
    var hideBox = h('input', { type: 'checkbox', id: UI.id('tc-hide') });
    var hideRow = h('label', { class: 'tc-check', for: hideBox.id }, [hideBox, ' Tapar el valor exacto, Monte Carlo y el centro de masa (para el reto)']);
    var check = UI.button('Comprobar', 'primary', function () { verify(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var iso = UI.svg(640, 400, 'Cubitos dentro del sólido, en perspectiva, con la superficie de tapa');
    var shadow = UI.svg(400, 320, 'Sombra D en el plano xy: cada celda dice cuántos cubitos tiene su columna');
    var cut = UI.svg(400, 320, 'Corte vertical en la fila elegida: las columnas de cubitos bajo la tapa');
    var convS = UI.svg(640, 230, 'Convergencia de la suma de cubitos hacia el valor exacto al aumentar n');
    var capSh = h('p', { class: 'lab-stack__label' }), capCut = h('p', { class: 'lab-stack__label' }), capConv = h('p', { class: 'lab-stack__label' });
    var board = h('dl', { class: 'lab-facts tc-board' });
    var want3D = !!(window.matchMedia && window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches);
    var stage3d = h('div', { class: 'lab-stage lab-stage--manim lab-stage--3d', hidden: true, role: 'img', 'aria-label': 'Cubitos del sólido en 3D con su tapa; arrastra para girarlo' });
    var note3d = h('p', { class: 'lab-note', hidden: true }, ['Arrastra para girar el sólido; la rueda del mouse acerca y aleja. Los cubitos de la fila del corte van en otro color.']);
    var btn3d = UI.button('Vista 3D', 'ghost', function () { setView('3d'); });
    var btn2d = UI.button('Vista plana', 'ghost', function () { setView('2d'); });
    var viewBar = h('div', { class: 'lab-buttons lab-viewbar', hidden: !want3D, role: 'group', 'aria-label': 'Tipo de vista' }, [btn3d, btn2d]);
    var M3 = null, scene3 = null, view = '2d', pending3 = false;

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls tc-controls', novalidate: true }, [
        preset.node, densSel.node, rIn.node, h('div', { class: 'lab-buttons' }, [run]), status,
        nS.node, mS.node, rowS.node,
        modeSel.node, ans.node, hideRow, h('div', { class: 'lab-buttons' }, [check]), verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Cubitos → sólido']),
        viewBar, iso, stage3d, note3d,
        h('div', { class: 'tc-views' }, [h('div', {}, [capSh, shadow]), h('div', {}, [capCut, cut])]),
        h('p', { class: 'lab-stack__label' }, ['Tablero en vivo']),
        board,
        capConv, convS,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'cubitos dentro']),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'fila del corte']),
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'tapa y valor exacto']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu respuesta'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); build(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); build(); });
    densSel.input.addEventListener('change', function () { rIn.setMath(DENS[+densSel.input.value][0]); setTimeout(build, 0); });
    modeSel.input.addEventListener('change', function () { mode = MODES[+modeSel.input.value][0]; relabel(); reset(); draw(); });
    hideBox.addEventListener('change', function () { draw(); });
    ans.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); verify(); } });

    function num(v, d) { return UI.fmt(v, d || 5).replace('-', '−'); }
    function relabel() {
      var L = { V: 'Tu volumen', M: 'Tu masa', xbar: 'Tu x̄', ybar: 'Tu ȳ', zbar: 'Tu z̄' };
      ans.node.querySelector('label').textContent = L[mode];
    }
    function load(i) {
      P = presets[i]; S = LM.solidOf(P.key, P.p);
      ans.input.value = '';
      reset();
    }
    function reset() { verdict.hidden = true; solved = false; student = null; }
    function moved() { reset(); draw(); }
    preset.input.value = String(start);
    densSel.input.value = String(cfg.dens || 0);
    rIn.setMath(DENS[cfg.dens || 0][0]);
    relabel();

    // Compila ρ, calcula el valor exacto, Monte Carlo y la convergencia (solo al cambiar sólido o densidad).
    function build() {
      if (!math) return;
      try {
        var s = String(rIn.get() || '').trim() || '1';
        var fn = window.LabMath.core.build(math, s, ['x', 'y', 'z']).fn;
        var B = S.box, bad = 0;
        for (var i = 0; i < 5; i++) for (var j = 0; j < 5; j++) for (var k = 0; k < 5; k++) {
          var v = fn(B[0][0] + (B[0][1] - B[0][0]) * (i + 0.5) / 5, B[1][0] + (B[1][1] - B[1][0]) * (j + 0.5) / 5, B[2][0] + (B[2][1] - B[2][0]) * (k + 0.5) / 5);
          if (!isFinite(v)) bad++;
        }
        if (bad > 0) throw new Error('La densidad no está definida en todo el sólido.');
        var c = LM.analyze(fn, S);
        if (!(c.M > 0)) throw new Error('Con esa densidad la masa sale ' + num(c.M, 4) + ': usa una densidad positiva.');
        rho = fn; rhoSrc = s; exact = c;
        mc = LM.monteCarlo(fn, S, MC_N, 14);
        conv = [];
        for (var n = 1; n <= 16; n++) conv.push(LM.cubes(fn, S, n, n));
        status.hidden = true;
      } catch (e) { UI.verdict(status, 'bad', 'No pude calcular', e.message); return; }
      reset();
      draw();
    }
    function calc() { return rho ? LM.cubes(rho, S, nS.get(), mS.get()) : null; }

    function verify() {
      if (!exact || !math) return;
      var raw = String(ans.input.value || '');
      var s = window.CBExercises ? window.CBExercises.parseNumber(raw, math) : parseFloat(raw.replace(',', '.').replace('−', '-'));
      if (!isFinite(s)) { UI.verdict(verdict, 'bad', 'Escribe un número', 'Usa punto decimal; por ejemplo 4.67.'); return; }
      var r = LM.diagnose(s, exact, mode);
      student = s;
      var q = mode.charAt(0), what = { V: 'el volumen', M: 'la masa', xbar: 'x̄', ybar: 'ȳ', zbar: 'z̄' }[mode];
      var t = r.want, cc = calc();
      var msgs = {
        correct: ['Correcto: ' + what + ' = ' + num(t, 5), 'La integral iterada (dz dy dx) da ' + num(t, 6) + (mode === 'V' || mode === 'M' ? '; Monte Carlo con ' + MC_N + ' puntos da ' + num(mode === 'V' ? mc.V : mc.M, 4) + ' ± ' + num(2 * (mode === 'V' ? mc.seV : mc.seM), 2) : '; Monte Carlo da ' + num(mc[mode], 4)) + ' y los cubitos con n = ' + cc.n + ', m = ' + cc.m + ' dan ' + num(mode === 'V' ? cc.V : mode === 'M' ? cc.M : cc[mode], 4) + '.'],
        wrongD: ['Usaste la región D equivocada', 'Integraste sobre todo el rectángulo que envuelve a la sombra. La sombra de este sólido es ' + P.D + ': para cada x, y solo recorre ese tramo.'],
        box: ['Ese es el volumen de la caja que lo envuelve', 'El sólido ocupa solo parte de la caja. Integra la altura de cada columna: z va de 0 a la tapa ' + P.topTxt + '.'],
        flip: ['Casi: tus límites en z están al revés', 'En la integral de adentro z va de la superficie de abajo a la de arriba: ∫ de abajo hasta la tapa. Al revés sale el signo opuesto.'],
        noRho: mode === 'M' ? ['Olvidaste la densidad', 'Eso es el volumen ∭ 1 dV. La masa es ∭ ρ dV: multiplica cada cubito por su densidad.']
          : ['Ese es el centroide geométrico', 'Con densidad variable el centro de masa se corre hacia donde hay más masa: usa ∭ ' + q + 'ρ dV ÷ M.'],
        noDiv: ['No dividiste entre la masa', 'Eso es el momento ∭ ' + q + 'ρ dV. La coordenada del centro de masa es momento ÷ masa.'],
        byVol: ['Dividiste entre el volumen', 'Con densidad variable divide el momento entre la masa M = ∭ ρ dV, no entre V.'],
        mismatch: ['No coincide', mode === 'V' ? 'Escribe la sombra D, luego z de abajo a la tapa, y suma ∭ 1 dV.' : mode === 'M' ? 'Integra ρ(x, y, z) sobre el sólido: z de abajo a la tapa, luego la doble sobre D.' : 'Calcula el momento ∭ ' + q + 'ρ dV y la masa ∭ ρ dV; divide.']
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
    function dPath(pts, close) {
      return pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('') + (close ? 'Z' : '');
    }

    function draw() {
      var c = calc();
      if (!c || !exact) return;
      var row = Math.min(rowS.get(), c.n) - 1;
      drawIso(c, row);
      drawShadow(c, row);
      drawCut(c, row);
      drawConv(c);
      if (view === '3d') schedule3D();
      var yc = S.box[1][0] + (row + 0.5) * c.dy;
      capSh.textContent = 'Sombra D: cubitos en cada columna (' + c.n + ' × ' + c.n + ' celdas)';
      capCut.textContent = 'Corte en y = ' + num(yc, 3) + ' (fila ' + (row + 1) + ')';
      var hide = hideBox.checked && !solved, qm = '¿?';
      var conv = mode === 'V' ? 'volumen' : mode === 'M' ? 'masa' : mode === 'xbar' ? 'x̄' : mode === 'ybar' ? 'ȳ' : 'z̄';
      capConv.textContent = 'Convergencia de la suma (' + conv + ') con n = m = 1, …, 16';
      var rows = [
        ['ΔV = Δx Δy Δz', num(c.dx, 3) + ' × ' + num(c.dy, 3) + ' × ' + num(c.dz, 3) + ' = ' + num(c.dV, 4)],
        ['cubitos dentro (centro adentro)', c.count + ' de ' + (c.n * c.n * c.m)],
        ['suma de cubitos: Σ ΔV', num(c.V)],
        ['suma de cubitos: Σ ρ ΔV', num(c.M)],
        ['exacto (integral iterada dz dy dx)', hide ? qm : 'V = ' + num(exact.V, 6) + ' · M = ' + num(exact.M, 6)],
        ['Monte Carlo (' + MC_N + ' puntos, semilla fija)', hide ? qm : 'V ≈ ' + num(mc.V, 4) + ' ± ' + num(2 * mc.seV, 2) + ' · M ≈ ' + num(mc.M, 4) + ' ± ' + num(2 * mc.seM, 2)],
        ['error de la suma de cubitos (masa)', hide ? qm : num(100 * (c.M - exact.M) / exact.M, 3) + ' %'],
        ['centro de masa (x̄, ȳ, z̄)', hide ? qm : '(' + num(exact.xbar, 4) + ', ' + num(exact.ybar, 4) + ', ' + num(exact.zbar, 4) + ')'],
        ['centro de masa con cubitos', hide ? qm : '(' + num(c.xbar, 4) + ', ' + num(c.ybar, 4) + ', ' + num(c.zbar, 4) + ')']
      ];
      board.innerHTML = '';
      rows.forEach(function (r) { board.appendChild(h('dt', {}, [r[0]])); board.appendChild(h('dd', {}, [r[1]])); });
    }

    // Proyección del sólido: caja de referencia, sombra D en el piso, cubitos (pintor) y la tapa en malla.
    function projector() {
      var B = S.box, az = -35 * Math.PI / 180, elv = 24 * Math.PI / 180, ca = Math.cos(az), sa = Math.sin(az), ce = Math.cos(elv), se = Math.sin(elv);
      // Si el sólido es mucho más alto que ancho, z se achata un poco para que quepa grande en el lienzo.
      var kz = Math.min(1, 1.5 * Math.max(B[0][1] - B[0][0], B[1][1] - B[1][0]) / (B[2][1] - B[2][0]));
      function raw(p) {
        var u = p[0] * ca - p[1] * sa, v = p[0] * sa + p[1] * ca;
        return [v, -(p[2] * kz * ce - u * se)];
      }
      var ext = [1.28 * B[0][1], 1.28 * B[1][1], 1.18 * B[2][1]], pts = [];
      [0, ext[0]].forEach(function (x) { [0, ext[1]].forEach(function (y) { [0, ext[2]].forEach(function (z) { pts.push(raw([x, y, z])); }); }); });
      var x0 = Math.min.apply(null, pts.map(function (q) { return q[0]; })), x1 = Math.max.apply(null, pts.map(function (q) { return q[0]; }));
      var y0 = Math.min.apply(null, pts.map(function (q) { return q[1]; })), y1 = Math.max.apply(null, pts.map(function (q) { return q[1]; }));
      var W = 640, H = 400, mg = 30, k = Math.min((W - 2 * mg) / (x1 - x0), (H - 2 * mg) / (y1 - y0)), ox = (W - k * (x1 - x0)) / 2, oy = (H - k * (y1 - y0)) / 2;
      return { ext: ext, P: function (p) { var q = raw(p); return [ox + (q[0] - x0) * k, oy + (q[1] - y0) * k]; } };
    }
    function boundaryD(steps) {
      var out = [], back = [], X = S.X;
      for (var i = 0; i <= steps; i++) { var x = X[0] + (X[1] - X[0]) * i / steps, yr = S.Y(x); out.push([x, yr[0]]); back.push([x, yr[1]]); }
      return out.concat(back.reverse());
    }
    function drawIso(c, row) {
      var pr = projector(), P = pr.P, B = S.box, g;
      iso.innerHTML = '';
      g = el('g', { class: 'sketch' }, iso);
      // Ejes desde el origen, más largos que la caja.
      [[pr.ext[0], 0, 0, 'x'], [0, pr.ext[1], 0, 'y'], [0, 0, pr.ext[2], 'z']].forEach(function (e) {
        var o = P([0, 0, 0]), t = P([e[0], e[1], e[2]]), dx = t[0] - o[0], dy = t[1] - o[1], L = Math.hypot(dx, dy) || 1;
        el('path', { d: 'M' + o[0].toFixed(1) + ' ' + o[1].toFixed(1) + 'L' + t[0].toFixed(1) + ' ' + t[1].toFixed(1), class: 'axis', fill: 'none', 'stroke-width': 1.4 }, g);
        el('text', { x: (t[0] + dx / L * 13).toFixed(1), y: (t[1] + dy / L * 13 + 5).toFixed(1), class: 'lab-tick', 'text-anchor': 'middle' }, g, e[3]);
      });
      // Sombra D en el piso.
      var Dp = boundaryD(24).map(function (q) { return P([q[0], q[1], 0]); });
      el('path', { d: dPath(Dp, true), class: 'area-fill' }, g);
      el('path', { d: dPath(Dp, true), class: 'ref', fill: 'none', 'stroke-width': 1.4, 'stroke-dasharray': '5 4' }, g);
      // Cubitos: orden lexicográfico i, j, k (el observador mira desde +x, +y, +z): los de atrás primero.
      var sh = 0.06;
      c.cells.forEach(function (q) {
        var i = q[0], j = q[1], l = q[2];
        var xa = B[0][0] + (i + sh) * c.dx, xb = B[0][0] + (i + 1 - sh) * c.dx;
        var ya = B[1][0] + (j + sh) * c.dy, yb = B[1][0] + (j + 1 - sh) * c.dy;
        var za = B[2][0] + (l + sh) * c.dz, zb = B[2][0] + (l + 1 - sh) * c.dz;
        var tone = j === row ? 'tc-cube--row' : '';
        var faces = [
          ['tc-face tc-face--y ' + tone, [[xa, yb, za], [xb, yb, za], [xb, yb, zb], [xa, yb, zb]]],
          ['tc-face tc-face--x ' + tone, [[xb, ya, za], [xb, yb, za], [xb, yb, zb], [xb, ya, zb]]],
          ['tc-face tc-face--z ' + tone, [[xa, ya, zb], [xb, ya, zb], [xb, yb, zb], [xa, yb, zb]]]
        ];
        faces.forEach(function (f) { el('path', { d: dPath(f[1].map(P), true), class: f[0] }, g); });
      });
      // Tapa: malla de la superficie de arriba sobre D.
      var dW = '', N = 10, M = 24, a, b;
      for (a = 0; a <= N; a++) {
        var xs = S.X[0] + (S.X[1] - S.X[0]) * a / N, yr = S.Y(xs), l1 = [];
        for (b = 0; b <= M; b++) { var yv = yr[0] + (yr[1] - yr[0]) * b / M; l1.push(P([xs, yv, S.top(xs, yv)])); }
        dW += dPath(l1, false);
      }
      for (b = 0; b <= N; b++) {
        var l2 = [];
        for (a = 0; a <= M; a++) {
          var xv = S.X[0] + (S.X[1] - S.X[0]) * a / M, yr2 = S.Y(xv), yv2 = yr2[0] + (yr2[1] - yr2[0]) * b / N;
          l2.push(P([xv, yv2, S.top(xv, yv2)]));
        }
        dW += dPath(l2, false);
      }
      el('path', { d: dW, class: 'ref', fill: 'none', 'stroke-width': 1.1, 'stroke-opacity': 0.55 }, g);
      // Centro de masa (si no se tapa o ya se resolvió el reto).
      if (!(hideBox.checked && !solved)) { var cm = P([exact.xbar, exact.ybar, exact.zbar]); el('circle', { cx: cm[0], cy: cm[1], r: 6, class: 'dot-error' }, g); }
    }

    // Sombra D: celdas con su número de cubitos; la fila del corte resaltada.
    function drawShadow(c, row) {
      var B = S.box, pad = 0.12 * Math.max(B[0][1] - B[0][0], B[1][1] - B[1][0]);
      var p = window.LabPlot(shadow, { x: [B[0][0] - pad, B[0][1] + pad], y: [B[1][0] - pad, B[1][1] + pad], equal: true });
      p.clear(); p.grid(); p.axes();
      p.poly(boundaryD(40), 'area-fill');
      var i, j, segs = [];
      for (i = 0; i <= c.n; i++) segs.push([[B[0][0] + i * c.dx, B[1][0]], [B[0][0] + i * c.dx, B[1][1]]]);
      for (j = 0; j <= c.n; j++) segs.push([[B[0][0], B[1][0] + j * c.dy], [B[0][1], B[1][0] + j * c.dy]]);
      p.segments(segs, 'aux', 1);
      for (i = 0; i < c.n; i++) for (j = 0; j < c.n; j++) {
        if (!c.cols[i][j]) continue;
        var xa = B[0][0] + i * c.dx, ya = B[1][0] + j * c.dy;
        p.poly([[xa, ya], [xa + c.dx, ya], [xa + c.dx, ya + c.dy], [xa, ya + c.dy]], j === row ? 'rect-fill tc-cell--row' : 'rect-fill');
      }
      var Db = boundaryD(40);
      p.segments(Db.map(function (q, k) { return [q, Db[(k + 1) % Db.length]]; }), 'ref', 2.4);
      var cw = Math.abs(p.X(B[0][0] + c.dx) - p.X(B[0][0])), chh = Math.abs(p.Y(B[1][0]) - p.Y(B[1][0] + c.dy));
      var fs = Math.min(18, 0.5 * Math.min(cw, chh));
      if (fs >= 9) for (i = 0; i < c.n; i++) for (j = 0; j < c.n; j++) {
        if (!c.cols[i][j]) continue;
        var cx = p.X(B[0][0] + (i + 0.5) * c.dx), cy = p.Y(B[1][0] + (j + 0.5) * c.dy);
        el('text', { x: cx.toFixed(1), y: (cy + fs * 0.36).toFixed(1), class: 'lab-tick tc-lbl', 'text-anchor': 'middle', 'font-size': fs.toFixed(1) }, shadow, String(c.cols[i][j]));
      }
    }

    // Corte vertical en el centro de la fila elegida: la tapa z = top(x, y_j) y las columnas de esa fila.
    function drawCut(c, row) {
      var B = S.box, yc = B[1][0] + (row + 0.5) * c.dy;
      var p = window.LabPlot(cut, { x: [B[0][0] - 0.05 * (B[0][1] - B[0][0]), B[0][1] + 0.05 * (B[0][1] - B[0][0])], y: [0, 1.12 * B[2][1]] });
      p.clear(); p.grid(); p.axes();
      function inD(x) { if (x < S.X[0] || x > S.X[1]) return false; var yr = S.Y(x); return yc >= yr[0] && yc <= yr[1]; }
      var fill = [], xs = [], k;
      for (k = 0; k <= 160; k++) { var x = S.X[0] + (S.X[1] - S.X[0]) * k / 160; if (inD(x)) xs.push(x); }
      if (xs.length) {
        fill = [[xs[0], 0]].concat(xs.map(function (x) { return [x, S.top(x, yc)]; }), [[xs[xs.length - 1], 0]]);
        p.poly(fill, 'area-fill');
      }
      for (var i = 0; i < c.n; i++) {
        var nk = c.cols[i][row];
        for (var l = 0; l < nk; l++) {
          var xa = B[0][0] + i * c.dx, za = B[2][0] + l * c.dz;
          p.poly([[xa, za], [xa + c.dx, za], [xa + c.dx, za + c.dz], [xa, za + c.dz]], 'rect-fill tc-cell--row');
        }
      }
      p.curve(function (x) { return inD(x) ? S.top(x, yc) : NaN; }, 'ref', 3);
      if (xs.length) p.segments([[[xs[0], 0], [xs[0], S.top(xs[0], yc)]], [[xs[xs.length - 1], 0], [xs[xs.length - 1], S.top(xs[xs.length - 1], yc)]]], 'ref', 2);
    }

    // Convergencia: la suma con n = m = 1..16 contra el valor exacto.
    function drawConv(c) {
      if (!conv) return;
      var key = mode === 'V' ? 'V' : mode === 'M' ? 'M' : mode;
      var vals = conv.map(function (r) { return r[key]; }), t = exact[key], hide = hideBox.checked && !solved;
      var all = vals.filter(isFinite).concat(hide ? [] : [t]), lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
      if (student != null && isFinite(student)) { lo = Math.min(lo, student); hi = Math.max(hi, student); }
      if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
      var pad = 0.12 * (hi - lo);
      var p = window.LabPlot(convS, { x: [0, 17], y: [lo - pad, hi + pad] });
      p.clear(); p.grid(); p.axes();
      if (!hide) p.segments([[[0, t], [17, t]]], 'ref', 2);
      if (student != null && isFinite(student)) p.segments([[[0, student], [17, student]]], 'student', 2);
      var segs = [];
      for (var i = 1; i < vals.length; i++) if (isFinite(vals[i]) && isFinite(vals[i - 1])) segs.push([[i, vals[i - 1]], [i + 1, vals[i]]]);
      p.segments(segs, 'aux', 1.6);
      vals.forEach(function (v, i) { p.point(i + 1, v, i + 1 === c.n && c.n === c.m ? 'dot-trace' : 'dot-aux', i + 1 === c.n && c.n === c.m ? 6 : 3.5); });
    }

    /* ---------- Vista 3D (solo PC) ---------- */
    function setView(v) {
      view = v === '3d' && scene3 ? '3d' : '2d';
      iso.style.display = view === '2d' ? '' : 'none';
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
      var c = calc();
      if (!scene3 || !c) return;
      var B = S.box, row = Math.min(rowS.get(), c.n) - 1;
      var cx = (B[0][0] + B[0][1]) / 2, cy = (B[1][0] + B[1][1]) / 2, cz = (B[2][0] + B[2][1]) / 2;
      var s = 7.5 / Math.max(B[0][1] - B[0][0], B[1][1] - B[1][0], B[2][1] - B[2][0]);
      function P3(x, y, z) { return [(x - cx) * s, (y - cy) * s, (z - cz) * s]; }
      var C = { ref: UI.color('--plot-ref'), aux: UI.color('--plot-aux'), tr: UI.color('--plot-trace'), err: UI.color('--plot-error') };
      var objs = [], sh = 0.88;
      c.cells.forEach(function (q) {
        var xc = B[0][0] + (q[0] + 0.5) * c.dx, yc = B[1][0] + (q[1] + 0.5) * c.dy, zc = B[2][0] + (q[2] + 0.5) * c.dz;
        objs.push(new M3.Box3D({ width: c.dx * s * sh, height: c.dy * s * sh, depth: c.dz * s * sh, center: P3(xc, yc, zc), color: q[1] === row ? C.tr : C.aux, opacity: 0.6 }));
      });
      objs.push(new M3.Surface3D({
        func: function (u, v) { var x = S.X[0] + (S.X[1] - S.X[0]) * u, yr = S.Y(x), y = yr[0] + (yr[1] - yr[0]) * v; return P3(x, y, S.top(x, y)); },
        uRange: [0, 1], vRange: [0, 1], uResolution: 24, vResolution: 24, color: C.ref, opacity: 0.3, doubleSided: true
      }));
      objs.push(new M3.Surface3D({
        func: function (u, v) { var x = S.X[0] + (S.X[1] - S.X[0]) * u, yr = S.Y(x), y = yr[0] + (yr[1] - yr[0]) * v; return P3(x, y, B[2][0] - 0.02 / s); },
        uRange: [0, 1], vRange: [0, 1], uResolution: 12, vResolution: 12, color: C.ref, opacity: 0.25, doubleSided: true
      }));
      var O = P3(0, 0, 0);
      [[1.25 * B[0][1], 0, 0], [0, 1.25 * B[1][1], 0], [0, 0, 1.15 * B[2][1]]].forEach(function (e) {
        objs.push(new M3.Line3D({ start: O, end: P3(e[0], e[1], e[2]), color: UI.color('--plot-axis') || C.ref, lineWidth: 2 }));
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
        scene3 = new M3.ThreeDScene(stage3d, { width: wd, height: Math.round(wd * 2 / 3), backgroundOpacity: 0, phi: 62 * Math.PI / 180, theta: 30 * Math.PI / 180, enableOrbitControls: true });
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
