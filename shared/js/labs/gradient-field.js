/* =====================================================================
   Lab gradient-field (Cálculo 2 · S08): campo de gradientes sobre contornos.
   Mapa de contorno de f(x, y) (ejemplos o la que escribas) con las flechas
   de ∇f en una malla, encimadas. El punto P se arrastra (o se mueve con los
   deslizadores); en P se dibuja su ∇f grande, la recta tangente a la curva
   de nivel que pasa por P y, si quieres, el recorrido de máximo ascenso
   (dr/dt = ∇f) o el de descenso, el que seguiría el agua (dr/dt = −∇f).
   Reto: escribe ∇f(P) (dos componentes), la dirección de máximo crecimiento
   (ángulo en grados) o la máxima razón de cambio |∇f(P)|. El lab reconoce
   si intercambiaste las componentes, si diste −∇f, si diste la dirección
   tangente en lugar de la normal, si no corregiste el cuadrante del arctan
   o si olvidaste la raíz en |∇f|.
   Es un lab de contornos: 2D en todas las pantallas.
   ===================================================================== */
(function () {
  var TAU = 2 * Math.PI, DEG = 180 / Math.PI;

  /* ------------------------- Matemática pura ------------------------- */
  function prep(s) { return window.LabMath.core.prep(s); }
  function fn2(math, src) { return window.LabMath.core.build(math, src, ['x', 'y']).fn; }
  function fn3(math, src) { return window.LabMath.core.build(math, src, ['x', 'y', 'z']).fn; }
  function hstep(v) { return 1e-3 * Math.max(1, Math.abs(v)); }
  // Derivada de g en t0 con diferencias centradas de cinco puntos (error O(h⁴)).
  function d5(g, t0, h) {
    h = h || hstep(t0);
    return (-g(t0 + 2 * h) + 8 * g(t0 + h) - 8 * g(t0 - h) + g(t0 - 2 * h)) / (12 * h);
  }
  // Gradiente numérico de f(x, y) en (a, b).
  function numGrad(f, a, b) {
    return [d5(function (t) { return f(t, b); }, a), d5(function (t) { return f(a, t); }, b)];
  }
  function norm2pi(t) { var u = t % TAU; if (u < 0) u += TAU; return u > TAU - 1e-12 ? 0 : u; }
  function norm360(d) { var u = d % 360; if (u < 0) u += 360; return u > 360 - 1e-9 ? 0 : u; }
  function evalNode(node, scope) {
    try { var v = node.evaluate(Object.assign({}, scope)); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; }
  }
  function deriv(math, src, wrt, scope) { return evalNode(math.derivative(prep(src), wrt), scope); }
  function value(math, src, scope) { return evalNode(math.parse(prep(src)), scope); }

  // Todo lo que se lee del gradiente en un punto: componentes, magnitud (máxima razón de
  // cambio), dirección de máximo crecimiento (ángulo desde +x, en [0, 2π) y en grados),
  // vector unitario y dirección tangente a la curva de nivel (∇f girado 90°).
  function info(a, b, f0, fx, fy) {
    var mag = Math.hypot(fx, fy), ang = mag > 0 ? norm2pi(Math.atan2(fy, fx)) : 0;
    return {
      a: a, b: b, f0: f0, fx: fx, fy: fy, mag: mag, angle: ang, deg: ang * DEG,
      unit: mag > 0 ? [fx / mag, fy / mag] : [0, 0],
      tangent: mag > 0 ? [-fy / mag, fx / mag] : [0, 0],
      minRate: -mag, descentDeg: norm360(ang * DEG + 180)
    };
  }
  // Gradiente con parciales simbólicas (math.derivative); si no se puede, numéricas.
  function gradient(math, src, a, b) {
    var pt = { x: a, y: b }, f0 = value(math, src, pt), fx = NaN, fy = NaN;
    try { fx = deriv(math, src, 'x', pt); fy = deriv(math, src, 'y', pt); } catch (e) { /* numérica abajo */ }
    if (!isFinite(fx) || !isFinite(fy)) { var g = numGrad(fn2(math, src), a, b); fx = g[0]; fy = g[1]; }
    return info(a, b, f0, fx, fy);
  }
  // Derivada direccional con u = (cos θ, sin θ): D_u f = ∇f · u = |∇f| cos α.
  function dirDeriv(fx, fy, theta) { return fx * Math.cos(theta) + fy * Math.sin(theta); }

  // Curva de nivel f = f(a, b) por P: su recta tangente es fx (x − a) + fy (y − b) = 0
  // (pendiente −fx/fy) y su recta normal va en la dirección de ∇f (pendiente fy/fx).
  // Si fy = 0 la tangente es vertical (x = a): pendiente Infinity.
  function lineFrom(G) {
    var slope = Math.abs(G.fy) > 1e-12 ? -G.fx / G.fy : Infinity, ns = Math.abs(G.fx) > 1e-12 ? G.fy / G.fx : Infinity;
    return {
      a: G.a, b: G.b, c: G.f0, fx: G.fx, fy: G.fy, slope: slope, intercept: isFinite(slope) ? G.b - slope * G.a : NaN,
      normalSlope: ns, normalIntercept: isFinite(ns) ? G.b - ns * G.a : NaN,
      // Forma general fx·x + fy·y = d (d = fx a + fy b).
      d: G.fx * G.a + G.fy * G.b
    };
  }
  function levelLine(math, src, a, b) { return lineFrom(gradient(math, src, a, b)); }

  // Gradiente de F(x, y, z) y plano tangente a la superficie de nivel F = F(a, b, c):
  // Fx (x − a) + Fy (y − b) + Fz (z − c) = 0, o sea Fx x + Fy y + Fz z = d.
  function gradient3(math, src, a, b, c) {
    var pt = { x: a, y: b, z: c }, F0 = value(math, src, pt), g = ['x', 'y', 'z'].map(function (w) {
      var d = NaN;
      try { d = deriv(math, src, w, pt); } catch (e) { /* numérica abajo */ }
      if (!isFinite(d)) {
        var F = fn3(math, src);
        d = w === 'x' ? d5(function (t) { return F(t, b, c); }, a) : w === 'y' ? d5(function (t) { return F(a, t, c); }, b) : d5(function (t) { return F(a, b, t); }, c);
      }
      return d;
    });
    return { a: a, b: b, c: c, F0: F0, Fx: g[0], Fy: g[1], Fz: g[2], n: g, mag: Math.hypot(g[0], g[1], g[2]) };
  }
  function levelPlane(math, src, a, b, c) {
    var G = gradient3(math, src, a, b, c), d = G.Fx * a + G.Fy * b + G.Fz * c;
    return {
      a: a, b: b, c: c, k: G.F0, n: G.n, d: d, mag: G.mag,
      // Despejado z = P x + Q y + R (si Fz ≠ 0), para compararlo con el plano de S05.
      P: G.Fz ? -G.Fx / G.Fz : NaN, Q: G.Fz ? -G.Fy / G.Fz : NaN, R: G.Fz ? d / G.Fz : NaN
    };
  }

  // Campo de gradientes en una malla de (n + 1) × (n + 1) puntos centrados en sus celdas.
  function field(f, box, n) {
    n = n || 12;
    var out = [], dx = (box.x[1] - box.x[0]) / n, dy = (box.y[1] - box.y[0]) / n;
    for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
      var x = box.x[0] + (i + 0.5) * dx, y = box.y[0] + (j + 0.5) * dy, g = numGrad(f, x, y);
      if (isFinite(g[0]) && isFinite(g[1])) out.push({ x: x, y: y, gx: g[0], gy: g[1], mag: Math.hypot(g[0], g[1]) });
    }
    return out;
  }

  // Recorrido de máximo ascenso (sign = +1) o de descenso (sign = −1) desde (a, b):
  // dr/ds = sign · ∇f/|∇f| (rapidez 1), integrado con RK4. Se detiene al salir de la caja,
  // si |∇f| casi se anula (cima, fondo o silla), si f deja de subir (o bajar) o si explota.
  function path(f, a, b, o) {
    o = o || {};
    var sg = o.sign < 0 ? -1 : 1, box = o.box, ds = o.ds || 0.01, max = o.max || 2000, tiny = o.tiny || 1e-6;
    function u(p) {
      var g = numGrad(f, p[0], p[1]), m = Math.hypot(g[0], g[1]);
      if (!isFinite(m) || m < tiny) return null;
      return [sg * g[0] / m, sg * g[1] / m];
    }
    var p = [a, b], pts = [[a, b]], fv = f(a, b), why = 'steps';
    for (var k = 0; k < max; k++) {
      var k1 = u(p); if (!k1) { why = 'flat'; break; }
      var k2 = u([p[0] + ds / 2 * k1[0], p[1] + ds / 2 * k1[1]]); if (!k2) { why = 'flat'; break; }
      var k3 = u([p[0] + ds / 2 * k2[0], p[1] + ds / 2 * k2[1]]); if (!k3) { why = 'flat'; break; }
      var k4 = u([p[0] + ds * k3[0], p[1] + ds * k3[1]]); if (!k4) { why = 'flat'; break; }
      var q = [p[0] + ds / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), p[1] + ds / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])];
      var fq = f(q[0], q[1]);
      if (!isFinite(fq)) { why = 'blowup'; break; }
      // Junto a la cima (o al fondo) los cuatro pasos de RK4 se contradicen y el avance se encoge.
      if (Math.hypot(q[0] - p[0], q[1] - p[1]) < ds / 4) { why = 'flat'; break; }
      if (sg * (fq - fv) <= 0) { why = 'turn'; break; }          // ya no sube (o baja): llegó a la cima o al fondo
      if (box && (q[0] < box.x[0] || q[0] > box.x[1] || q[1] < box.y[0] || q[1] > box.y[1])) { pts.push(q); why = 'box'; break; }
      pts.push(q); p = q; fv = fq;
    }
    return { pts: pts, why: why, end: pts[pts.length - 1], f: fv };
  }

  /* ---------- Curvas de nivel: malla + marching squares ---------- */
  function grid(f, box, n) {
    n = n || 60;
    var xs = [], ys = [], v = [], i, j;
    for (i = 0; i <= n; i++) { xs.push(box.x[0] + (box.x[1] - box.x[0]) * i / n); ys.push(box.y[0] + (box.y[1] - box.y[0]) * i / n); }
    for (j = 0; j <= n; j++) {
      var row = [];
      for (i = 0; i <= n; i++) { var z = f(xs[i], ys[j]); row.push(typeof z === 'number' && isFinite(z) ? z : NaN); }
      v.push(row);
    }
    return { xs: xs, ys: ys, v: v, n: n };
  }
  // Segmentos [[x1, y1], [x2, y2]] de la curva f = c. Silla: decide el valor del centro.
  var TABLE = { 1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 6: [[0, 2]], 7: [[3, 2]], 8: [[2, 3]], 9: [[0, 2]], 11: [[1, 2]], 12: [[1, 3]], 13: [[0, 1]], 14: [[3, 0]] };
  function contour(g, c) {
    var segs = [], xs = g.xs, ys = g.ys, v = g.v;
    for (var j = 0; j < g.n; j++) {
      for (var i = 0; i < g.n; i++) {
        var A = v[j][i] - c, B = v[j][i + 1] - c, C = v[j + 1][i + 1] - c, D = v[j + 1][i] - c;
        if (!(isFinite(A) && isFinite(B) && isFinite(C) && isFinite(D))) continue;
        var idx = (A > 0 ? 1 : 0) | (B > 0 ? 2 : 0) | (C > 0 ? 4 : 0) | (D > 0 ? 8 : 0);
        if (idx === 0 || idx === 15) continue;
        var x0 = xs[i], x1 = xs[i + 1], y0 = ys[j], y1 = ys[j + 1];
        var E = [
          function () { var t = A / (A - B); return [x0 + t * (x1 - x0), y0]; },
          function () { var t = B / (B - C); return [x1, y0 + t * (y1 - y0)]; },
          function () { var t = C / (C - D); return [x1 + t * (x0 - x1), y1]; },
          function () { var t = D / (D - A); return [x0, y1 + t * (y0 - y1)]; }
        ];
        var pairs = TABLE[idx];
        if (idx === 5 || idx === 10) {
          var mid = (A + B + C + D) / 4 > 0;
          if (idx === 5) pairs = mid ? [[0, 1], [2, 3]] : [[3, 0], [1, 2]];
          else pairs = mid ? [[3, 0], [1, 2]] : [[0, 1], [2, 3]];
        }
        pairs.forEach(function (p) { segs.push([E[p[0]](), E[p[1]]()]); });
      }
    }
    return segs;
  }
  // Niveles «redondos» entre los percentiles lo y hi de la malla (sin los picos de una singularidad).
  function levels(g, target) {
    var zs = [];
    g.v.forEach(function (row) { row.forEach(function (z) { if (isFinite(z)) zs.push(z); }); });
    if (!zs.length) return [];
    zs.sort(function (p, q) { return p - q; });
    var lo = zs[Math.floor(zs.length * 0.04)], hi = zs[Math.min(zs.length - 1, Math.ceil(zs.length * 0.96) - 1)];
    if (hi - lo < 1e-9) return [lo];
    var raw = (hi - lo) / (target || 10), p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    var s = (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p, out = [];
    for (var c = Math.ceil(lo / s - 1e-9) * s; c <= hi + 1e-9 && out.length < 40; c += s) out.push(+c.toFixed(10));
    return out;
  }

  /* ---------- Reto: diagnóstico ---------- */
  // Cerca con la holgura de los ejercicios: ±0.01 (o ±1 %) desde 0.1; abajo, ±1 % o 0.0005.
  function near(s, t) {
    var d = Math.abs(s - t), at = Math.abs(t);
    if (at >= 0.1) return d <= Math.max(0.01, 0.01 * at) + 1e-9;
    return d <= Math.max(0.01 * at, 5e-4) + 1e-12;
  }
  function angDiff(p, q) { var d = Math.abs(norm360(p) - norm360(q)); return Math.min(d, 360 - d); }
  var ANG_TOL = 1;                              // grados
  function nearAng(s, t) { return angDiff(s, t) <= ANG_TOL + 1e-9; }
  function nearPair(s, t) { return near(s[0], t[0]) && near(s[1], t[1]); }

  // Lo que se pide en cada reto y los errores típicos, en orden de prioridad.
  //   grad  → [fx, fy]   angle → grados en [0, 360)   mag → |∇f|
  function candidates(c, mode) {
    var fx = c.fx, fy = c.fy;
    if (mode === 'grad') return [['swap', [fy, fx]], ['neg', [-fx, -fy]], ['tangent', [-fy, fx]], ['tangent', [fy, -fx]], ['oneSign', [-fx, fy]], ['oneSign', [fx, -fy]]];
    if (mode === 'angle') {
      var out = [];
      // arctan(fy/fx) sin corregir: con fx < 0 da la dirección opuesta.
      if (fx < 0) out.push(['quadrant', Math.atan(fy / fx) * DEG]);
      out.push(['neg', c.deg + 180], ['tangent', c.deg + 90], ['tangent', c.deg - 90], ['swap', Math.atan2(fx, fy) * DEG]);
      return out;
    }
    return [['noRoot', fx * fx + fy * fy], ['sumAbs', Math.abs(fx) + Math.abs(fy)], ['oneComp', Math.abs(fx)], ['oneComp', Math.abs(fy)]];
  }
  function want(c, mode) { return mode === 'grad' ? [c.fx, c.fy] : mode === 'angle' ? c.deg : c.mag; }
  // Diagnóstico de la respuesta del alumno (número, o [sx, sy] en el reto grad).
  // → { kind: ok|warn|bad|invalid, reason, want }.
  // reason: correct · swap · neg · tangent · oneSign · quadrant · radians · noRoot · sumAbs · oneComp · flat · mismatch
  function diagnose(s, c, mode) {
    var t = want(c, mode);
    var bad = mode === 'grad' ? !(Array.isArray(s) && isFinite(s[0]) && isFinite(s[1])) : !isFinite(s);
    if (bad) return { kind: 'invalid', reason: 'number', want: t };
    if (mode === 'angle' && c.mag < 1e-9) return { kind: 'invalid', reason: 'flat', want: t };
    var same = mode === 'grad' ? nearPair : mode === 'angle' ? nearAng : near;
    if (same(s, t)) return { kind: 'ok', reason: 'correct', want: t };
    var cs = candidates(c, mode);
    for (var i = 0; i < cs.length; i++) {
      var v = cs[i][1];
      var finite = mode === 'grad' ? isFinite(v[0]) && isFinite(v[1]) : isFinite(v);
      if (finite && !same(v, t) && same(s, v)) return { kind: 'warn', reason: cs[i][0], want: t };
    }
    // Ángulo en radianes en lugar de grados (θ o θ − 2π).
    if (mode === 'angle' && Math.abs(s) < 7 && (near(s, c.angle) || near(s, c.angle - TAU))) return { kind: 'warn', reason: 'radians', want: t };
    return { kind: 'bad', reason: 'mismatch', want: t };
  }

  window.LabMath.grad = {
    fn2: fn2, fn3: fn3, d5: d5, numGrad: numGrad, info: info, gradient: gradient, dirDeriv: dirDeriv,
    lineFrom: lineFrom, levelLine: levelLine, gradient3: gradient3, levelPlane: levelPlane,
    field: field, path: path, grid: grid, contour: contour, levels: levels,
    near: near, angDiff: angDiff, want: want, candidates: candidates, diagnose: diagnose, norm360: norm360
  };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { name: 'Cerro: 4 − x² − 2y²', f: '4 - x^2 - 2y^2', w: [-3, 3, -3, 3], a: 1, b: 1 },
    { name: 'Tazón: x² + y²', f: 'x^2 + y^2', w: [-3, 3, -3, 3], a: 1.5, b: 1 },
    { name: 'Silla: x² − y²', f: 'x^2 - y^2', w: [-3, 3, -3, 3], a: 1, b: 0.5 },
    { name: 'Rampa: 2x + y (plano)', f: '2x + y', w: [-3, 3, -3, 3], a: 0.5, b: 1 },
    { name: 'Dos cerros', f: '3e^(-(x - 1)^2 - y^2) + 2e^(-(x + 1.5)^2 - (y - 1)^2)', w: [-3.5, 3.5, -3, 3], a: 0.3, b: -1 },
    { name: 'Ondas: sen x · cos y', f: 'sin(x)*cos(y)', w: [-3.2, 3.2, -3.2, 3.2], a: 0.5, b: 0.8 },
    { name: 'Potencial de dos cargas: V = 1/r₁ − 1/r₂', f: '1/sqrt((x - 1)^2 + y^2) - 1/sqrt((x + 1)^2 + y^2)', w: [-3, 3, -3, 3], a: 0.5, b: 1 }
  ];
  var MODES = [['grad', '∇f(P): sus dos componentes'], ['angle', 'Dirección de máximo crecimiento (ángulo)'], ['mag', 'Máxima razón de cambio |∇f(P)|']];
  var WALK = ['Sin recorrido', 'Máximo ascenso desde P (sigue ∇f)', 'Descenso desde P: el agua (sigue −∇f)'];
  var NS = 'http://www.w3.org/2000/svg';

  window.Labs['gradient-field'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, LM = window.LabMath.grad;
    var presets = cfg.presets || PRESETS, start = cfg.start != null ? cfg.start : 0;
    var math = null, F = null, P = presets[start], win = P.w, mode = 'grad', solved = false, student = null;
    var cache = null, plot = null;

    var preset = UI.select({ label: 'Ejemplo', options: presets.map(function (p) { return p.name; }) });
    var fIn = UI.mathField({ label: 'Función f(x, y)', hint: 'Escribe cualquier función de x y y; usa la paleta o el teclado ⌨.', palette: 'multi', onEnter: function () { build(); } });
    var run = UI.button('Graficar', 'primary', function () { build(); });
    var status = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var aS = UI.slider({ label: 'x del punto P', min: win[0], max: win[1], step: 0.1, value: P.a, fmt: fmtN }, function () { moved(); });
    var bS = UI.slider({ label: 'y del punto P', min: win[2], max: win[3], step: 0.1, value: P.b, fmt: fmtN }, function () { moved(); });
    var dragNote = h('p', { class: 'lab-note' }, ['También puedes arrastrar P en la gráfica, o tocar donde lo quieras.']);
    var showField = check('gf-field', 'Campo de flechas ∇f en la malla', true);
    var showTan = check('gf-tan', 'Recta tangente a la curva de nivel por P', true);
    var walkSel = UI.select({ label: 'Recorrido desde P', options: WALK });
    var modeSel = UI.select({ label: 'Reto', options: MODES.map(function (m) { return m[1]; }) });
    var inX = UI.input({ label: 'f_x(P)', type: 'text', inputmode: 'decimal', mono: false });
    var inY = UI.input({ label: 'f_y(P)', type: 'text', inputmode: 'decimal', mono: false });
    var pair = h('div', { class: 'lab-row gf-pair' }, [inX.node, inY.node]);
    var one = UI.input({ label: 'Tu ángulo θ (grados)', type: 'text', inputmode: 'decimal', mono: false, hint: 'Medido desde el eje x positivo, en sentido antihorario, entre 0° y 360°.' });
    one.node.classList.add('gf-one');
    var ansHint = h('p', { class: 'lab-note' }, ['Redondea a 2 decimales.']);
    var hide = check('gf-hide', 'Tapar ∇f, su flecha y los números (para el reto)', false);
    var checkBtn = UI.button('Comprobar', 'primary', function () { verify(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var svg = UI.svg(640, 500, 'Mapa de contorno de f con el campo de gradientes, el punto P, su gradiente y la recta tangente a la curva de nivel');
    svg.classList.add('gf-stage');
    var facts = h('dl', { class: 'lab-facts gf-facts' });
    var flatNote = h('p', { class: 'lab-note', hidden: true, 'aria-live': 'polite' });
    var legWalk = h('li', { hidden: true }, [h('i', { class: 'sw sw--trace' }), 'recorrido']);

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        preset.node, fIn.node, h('div', { class: 'lab-buttons' }, [run]), status,
        aS.node, bS.node, dragNote, showField.node, showTan.node, walkSel.node,
        modeSel.node, pair, one.node, ansHint, hide.node, h('div', { class: 'lab-buttons' }, [checkBtn]), verdict
      ]),
      h('figure', { class: 'lab-board gf-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Campo de gradientes sobre el mapa de contorno']),
        svg, flatNote, facts,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'curvas de nivel']),
          h('li', {}, [h('i', { class: 'sw sw--axis' }), 'campo ∇f']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), '∇f(P)']),
          h('li', {}, [h('i', { class: 'sw sw--aux sw--dashed' }), 'tangente a la curva']),
          legWalk,
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu respuesta'])
        ])
      ])
    ]));
    var edited = false;
    if (fIn.onInput) fIn.onInput(function () { edited = true; });
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); build(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); build(); });
    modeSel.input.addEventListener('change', function () { mode = MODES[+modeSel.input.value][0]; relabel(); reset(); draw(); });
    walkSel.input.addEventListener('change', function () { draw(); });
    [showField, showTan, hide].forEach(function (c) { c.box.addEventListener('change', function () { draw(); }); });
    [inX.input, inY.input, one.input].forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); verify(); } }); });

    function check(idp, text, on) {
      var box = h('input', { type: 'checkbox', id: UI.id(idp), checked: on ? true : null });
      return { box: box, node: h('label', { class: 'gf-check', for: box.id }, [box, ' ' + text]) };
    }
    function fmtN(v) { return (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(2)).toString().replace('-', '−'); }
    function num(v, d) { return UI.fmt(v, d || 5).replace('-', '−'); }
    function relabel() {
      pair.hidden = mode !== 'grad';
      one.node.hidden = mode === 'grad';
      one.node.querySelector('label').textContent = mode === 'angle' ? 'Tu ángulo θ (grados)' : 'Tu |∇f(P)|';
      var hint = one.node.querySelector('.lab-field__hint');
      if (hint) hint.hidden = mode !== 'angle';
    }
    function setRange(sl, lo, hi, v) { sl.input.min = lo; sl.input.max = hi; sl.set(Math.max(lo, Math.min(hi, v))); }
    function load(i) {
      P = presets[i]; win = P.w;
      fIn.setMath(P.f); edited = false;
      setRange(aS, win[0], win[1], P.a); setRange(bS, win[2], win[3], P.b);
      inX.input.value = inY.input.value = one.input.value = '';
      reset();
    }
    function reset() { verdict.hidden = true; solved = false; student = null; }
    function moved() { reset(); draw(); }
    preset.input.value = String(start);
    load(start);
    if (cfg.a != null) aS.set(cfg.a);
    if (cfg.b != null) bS.set(cfg.b);
    relabel();

    function build() {
      if (!math) return;
      try {
        // Mientras MathLive carga, el campo puede venir vacío: entonces vale la del ejemplo.
        var s = String(fIn.get() || '').trim() || (edited ? '' : P.f);
        if (!s) throw new Error('Escribe f(x, y).');
        var fn = LM.fn2(math, s), okPts = 0;
        for (var i = 0; i <= 10; i++) for (var j = 0; j <= 10; j++) if (isFinite(fn(win[0] + (win[1] - win[0]) * i / 10, win[2] + (win[3] - win[2]) * j / 10))) okPts++;
        if (okPts < 20) throw new Error('La función casi no está definida en la ventana de este ejemplo.');
        var FX = null, FY = null;
        try { FX = math.derivative(prep(s), 'x').compile(); FY = math.derivative(prep(s), 'y').compile(); } catch (e) { FX = FY = null; }
        F = fn;
        var box = { x: [win[0], win[1]], y: [win[2], win[3]] }, g = LM.grid(F, box, 80);
        var fld = LM.field(F, box, 13), mags = fld.map(function (q) { return q.mag; }).filter(isFinite).sort(function (p, q) { return p - q; });
        var gref = mags.length ? mags[Math.min(mags.length - 1, Math.floor(mags.length * 0.85))] : 1;
        cache = { src: s, FX: FX, FY: FY, box: box, g: g, lv: LM.levels(g, 8), fld: fld, gref: gref > 1e-12 ? gref : 1, cell: (win[1] - win[0]) / 13 };
        cache.segs = cache.lv.map(function (c) { return LM.contour(g, c); });
        status.hidden = true;
      } catch (e) { UI.verdict(status, 'bad', 'No pude graficar', e.message); return; }
      reset();
      draw();
    }
    function pd(node, a, b) { if (!node) return NaN; try { var v = node.evaluate({ x: a, y: b }); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; } }
    // Gradiente en P (parciales simbólicas; numéricas si no se pudo derivar).
    function calc() {
      if (!F || !cache) return null;
      var a = aS.get(), b = bS.get(), fx = pd(cache.FX, a, b), fy = pd(cache.FY, a, b);
      if (!isFinite(fx) || !isFinite(fy)) { var g = LM.numGrad(F, a, b); fx = g[0]; fy = g[1]; }
      return LM.info(a, b, F(a, b), fx, fy);
    }

    function read(inp) {
      var raw = String(inp.value || '');
      return window.CBExercises ? window.CBExercises.parseNumber(raw, math) : parseFloat(raw.replace(',', '.').replace('−', '-'));
    }
    function verify() {
      var c = calc();
      if (!c || !math) return;
      if (!isFinite(c.f0) || !isFinite(c.mag)) { UI.verdict(verdict, 'bad', 'La función no está definida en P', 'Mueve el punto.'); return; }
      var s = mode === 'grad' ? [read(inX.input), read(inY.input)] : read(one.input);
      var r = LM.diagnose(s, c, mode);
      if (r.reason === 'number') { UI.verdict(verdict, 'bad', mode === 'grad' ? 'Escribe los dos números' : 'Escribe un número', 'Usa punto decimal; por ejemplo −2.5.'); return; }
      if (r.reason === 'flat') { UI.verdict(verdict, 'bad', 'Aquí ∇f = 0', 'En un punto crítico no hay dirección de máximo crecimiento: mueve P.'); return; }
      student = s;
      var g = '⟨' + num(c.fx, 4) + ', ' + num(c.fy, 4) + '⟩';
      var msgs = {
        correct: [mode === 'grad' ? 'Tu gradiente es correcto' : mode === 'angle' ? 'Tu dirección es correcta' : 'Tu máxima razón de cambio es correcta',
          mode === 'grad' ? '∇f(P) = ' + g + '. Mira la flecha: es perpendicular a la curva de nivel y apunta cuesta arriba.'
            : mode === 'angle' ? 'θ = ' + num(c.deg, 4) + '°. En esa dirección D_u f = |∇f| = ' + num(c.mag, 4) + '; en la opuesta, ' + num(-c.mag, 4) + '.'
              : '|∇f(P)| = √(' + num(c.fx, 4) + '² + ' + num(c.fy, 4) + '²) = ' + num(c.mag, 4) + '. Ninguna dirección sube más rápido.'],
        swap: ['Intercambiaste las componentes', mode === 'angle' ? 'Usaste arctan(f_x/f_y): el ángulo se mide desde el eje x, con tan θ = f_y/f_x.' : 'La primera componente es f_x (derivas respecto a x) y la segunda f_y.'],
        neg: ['Diste la dirección contraria', 'Esa es −∇f: la de máximo decrecimiento, por donde baja el agua. Se pide la de subida, ∇f.'],
        tangent: ['Esa dirección es tangente a la curva de nivel', 'Ahí f no cambia (D_u f = 0). El gradiente es perpendicular a la curva: gira 90°.'],
        oneSign: ['Revisa un signo', 'Una de tus componentes tiene el signo cambiado. Deriva otra vez con cuidado.'],
        quadrant: ['Corrige el cuadrante', 'arctan(f_y/f_x) solo da ángulos entre −90° y 90°. Como f_x < 0, ∇f apunta a la izquierda: súmale 180°.'],
        radians: ['Lo diste en radianes', 'El reto pide grados: multiplica por 180/π.'],
        noRoot: ['Te faltó la raíz', 'Eso es f_x² + f_y². La magnitud es √(f_x² + f_y²).'],
        sumAbs: ['Sumaste las componentes', 'La magnitud de un vector no es |f_x| + |f_y|: es √(f_x² + f_y²) (Pitágoras).'],
        oneComp: ['Usaste solo una componente', 'Esa es la razón de cambio en un eje. La máxima combina las dos: √(f_x² + f_y²).'],
        mismatch: ['No coincide', mode === 'grad' ? 'Calcula f_x y f_y y evalúalas en P.' : mode === 'angle' ? 'Calcula ∇f(P) y su ángulo con atan2(f_y, f_x), en grados.' : 'Calcula ∇f(P) y su magnitud.']
      };
      var m = msgs[r.reason] || msgs.mismatch;
      UI.verdict(verdict, r.kind === 'ok' ? 'ok' : r.kind === 'warn' ? 'warn' : 'bad', m[0], m[1]);
      solved = r.kind === 'ok';
      draw();
    }

    /* ---------- Dibujo ---------- */
    var layer = null, clip = null;
    function el(tag, attrs, txt) {
      var n = document.createElementNS(NS, tag);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (txt != null) n.textContent = txt;
      layer.appendChild(n);
      return n;
    }
    function d1(v) { return v.toFixed(1); }
    function segPath(segs) {
      return segs.map(function (s) { return 'M' + d1(plot.X(s[0][0])) + ' ' + d1(plot.Y(s[0][1])) + 'L' + d1(plot.X(s[1][0])) + ' ' + d1(plot.Y(s[1][1])); }).join('');
    }
    // Flecha en coordenadas de la gráfica: de (x, y) a (x + dx, y + dy), con punta de hh px.
    function arrowD(x, y, dx, dy, hh) {
      var x0 = plot.X(x), y0 = plot.Y(y), x1 = plot.X(x + dx), y1 = plot.Y(y + dy), L = Math.hypot(x1 - x0, y1 - y0);
      if (!(L > 1)) return '';
      var ux = (x1 - x0) / L, uy = (y1 - y0) / L, k = Math.min(hh, L * 0.45);
      return 'M' + d1(x0) + ' ' + d1(y0) + 'L' + d1(x1) + ' ' + d1(y1) +
        'M' + d1(x1 - ux * k - uy * k * 0.55) + ' ' + d1(y1 - uy * k + ux * k * 0.55) + 'L' + d1(x1) + ' ' + d1(y1) +
        'L' + d1(x1 - ux * k + uy * k * 0.55) + ' ' + d1(y1 - uy * k - ux * k * 0.55);
    }
    // Escala de las flechas: unidades de la gráfica por unidad de |∇f|.
    // Las del campo crecen con √|∇f| (las chicas no desaparecen); la de P es grande siempre.
    function fieldLen(m) { return 0.88 * cache.cell * Math.min(1, 0.2 + 0.8 * Math.sqrt(m / cache.gref)); }
    function bigLen(m) { return (win[1] - win[0]) * (0.12 + 0.12 * Math.min(1, Math.sqrt(m / cache.gref))); }

    function draw() {
      if (!cache || !F) return;
      var c = calc(), hidden = hide.box.checked && !solved;
      plot = window.LabPlot(svg, { x: [win[0], win[1]], y: [win[2], win[3]], equal: true });
      plot.clear(); plot.grid(); plot.axes();
      layer = svg.querySelector('g.sketch');
      clip = svg.querySelector('clipPath');
      var cp = clip ? 'url(#' + clip.id + ')' : null;
      // Curvas de nivel.
      var all = cache.segs.reduce(function (o, s) { return o.concat(s); }, []);
      if (all.length) el('path', { d: segPath(all), class: 'ref', fill: 'none', 'stroke-width': 1.3, 'stroke-opacity': 0.5, 'clip-path': cp });
      // Campo de gradientes.
      if (showField.box.checked) {
        var d = '';
        cache.fld.forEach(function (q) {
          if (!(q.mag > 1e-12)) return;
          var L = fieldLen(q.mag), ux = q.gx / q.mag, uy = q.gy / q.mag;
          if (L * (plot.X(1) - plot.X(0)) < 3) return;
          d += arrowD(q.x - ux * L / 2, q.y - uy * L / 2, ux * L, uy * L, 6);
        });
        if (d) el('path', { d: d, class: 'axis', fill: 'none', 'stroke-width': 1.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'clip-path': cp });
      }
      if (!c || !isFinite(c.f0)) { facts.innerHTML = ''; return; }
      // La curva de nivel que pasa por P.
      var mine = LM.contour(cache.g, c.f0);
      if (mine.length) el('path', { d: segPath(mine), class: 'ref', fill: 'none', 'stroke-width': 3, 'stroke-linecap': 'round', 'clip-path': cp });
      var flat = !(c.mag > 1e-9 * Math.max(1, cache.gref));
      // Recorrido de ascenso o descenso.
      var w = +walkSel.input.value;
      legWalk.hidden = !w;
      if (w && !flat) {
        var pr = LM.path(F, c.a, c.b, { sign: w === 1 ? 1 : -1, box: cache.box, ds: (win[1] - win[0]) / 300, max: 2500, tiny: 1e-7 * cache.gref });
        if (pr.pts.length > 1) {
          el('path', { d: pr.pts.map(function (p, i) { return (i ? 'L' : 'M') + d1(plot.X(p[0])) + ' ' + d1(plot.Y(p[1])); }).join(''), class: 'trace', fill: 'none', 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'clip-path': cp });
          var e = pr.end;
          if (e[0] >= win[0] && e[0] <= win[1] && e[1] >= win[2] && e[1] <= win[3]) el('circle', { cx: plot.X(e[0]), cy: plot.Y(e[1]), r: 5, class: 'dot-trace' });
        }
      }
      // Recta tangente a la curva de nivel por P.
      if (showTan.box.checked && !flat) {
        var hl = 0.24 * (win[1] - win[0]), t = c.tangent;
        el('path', { d: 'M' + d1(plot.X(c.a - t[0] * hl)) + ' ' + d1(plot.Y(c.b - t[1] * hl)) + 'L' + d1(plot.X(c.a + t[0] * hl)) + ' ' + d1(plot.Y(c.b + t[1] * hl)), class: 'aux', fill: 'none', 'stroke-width': 2.8, 'stroke-dasharray': '8 6', 'stroke-linecap': 'round', 'clip-path': cp });
      }
      // ∇f(P) grande.
      if (!hidden && !flat) {
        var Lb = bigLen(c.mag);
        el('path', { d: arrowD(c.a, c.b, c.unit[0] * Lb, c.unit[1] * Lb, 13), class: 'error', fill: 'none', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      }
      // Lo del alumno.
      if (student != null && !flat) {
        var sv = null;
        if (mode === 'grad') { var sm = Math.hypot(student[0], student[1]); if (sm > 1e-12) sv = [student[0] / sm * bigLen(sm), student[1] / sm * bigLen(sm)]; }
        else if (mode === 'angle') { var th = student * Math.PI / 180, Lc = bigLen(c.mag); sv = [Math.cos(th) * Lc, Math.sin(th) * Lc]; }
        if (sv) el('path', { d: arrowD(c.a, c.b, sv[0], sv[1], 12), class: 'student', fill: 'none', 'stroke-width': 3.2, 'stroke-dasharray': '7 5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      }
      // El punto P, con su zona para arrastrarlo.
      el('circle', { cx: plot.X(c.a), cy: plot.Y(c.b), r: 7, class: 'dot-trace gf-handle' });
      el('circle', { cx: plot.X(c.a), cy: plot.Y(c.b), r: 22, class: 'gf-hit gf-handle' });
      // La etiqueta va en diagonal entre ∇f y la tangente (las cuatro direcciones ocupadas).
      var ga = flat ? Math.PI / 4 : Math.atan2(-c.unit[1], c.unit[0]), best = null;
      [1, 3, 5, 7].forEach(function (k) {
        var ang = ga + k * Math.PI / 4, lx = plot.X(c.a) + 22 * Math.cos(ang), ly = plot.Y(c.b) + 22 * Math.sin(ang) + 5;
        var inside = lx > 60 && lx < 620 && ly > 24 && ly < 460;
        if (!best || (inside && !best.inside)) best = { x: lx, y: ly, inside: inside };
      });
      el('text', { x: d1(best.x), y: d1(best.y), class: 'gf-lbl', 'text-anchor': 'middle', 'font-size': 16 }, 'P');

      flatNote.hidden = !flat;
      flatNote.textContent = flat ? 'Aquí ∇f = 0 (punto crítico): el plano tangente es horizontal y ninguna dirección sube ni baja a primer orden. No hay dirección de máximo crecimiento.' : '';
      var q = '¿?', L = LM.lineFrom(c);
      var tan = !isFinite(L.slope) ? 'x = ' + fmtN(c.a) : 'y = ' + num(L.slope, 4) + 'x + ' + num(L.intercept, 4);
      var rows = [
        ['P', '(' + fmtN(c.a) + ', ' + fmtN(c.b) + ')'],
        ['f(P) (nivel de la curva)', num(c.f0)],
        ['∇f(P) = ⟨f_x, f_y⟩', hidden ? q : '⟨' + num(c.fx, 5) + ', ' + num(c.fy, 5) + '⟩'],
        ['máxima razón de cambio |∇f|', hidden ? q : num(c.mag, 5)],
        ['dirección de máximo crecimiento', hidden || flat ? (flat ? '—' : q) : 'θ = ' + num(c.deg, 5) + '°'],
        ['máximo decrecimiento (−∇f)', hidden || flat ? (flat ? '—' : q) : 'θ = ' + num(c.descentDeg, 5) + '°, rapidez ' + num(-c.mag, 5)],
        ['tangente a la curva de nivel', hidden || flat ? (flat ? '—' : q) : tan.replace('+ −', '− ')]
      ];
      facts.innerHTML = '';
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    /* ---------- Arrastre y toque ---------- */
    function local(e) {
      var m = svg.getScreenCTM();
      if (!m) return null;
      var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      return p.matrixTransform(m.inverse());
    }
    function toXY(e) {
      var q = local(e);
      if (!q || !plot) return null;
      var x = (q.x - plot.X(0)) / (plot.X(1) - plot.X(0)), y = (q.y - plot.Y(0)) / (plot.Y(1) - plot.Y(0));
      return [Math.max(win[0], Math.min(win[1], Math.round(x * 10) / 10)), Math.max(win[2], Math.min(win[3], Math.round(y * 10) / 10))];
    }
    function place(xy) {
      if (!xy || (xy[0] === aS.get() && xy[1] === bS.get())) return;
      aS.set(xy[0]); bS.set(xy[1]); moved();
    }
    var drag = false, dragged = false;
    svg.addEventListener('pointerdown', function (e) {
      if (!(e.target.closest && e.target.closest('.gf-handle'))) return;
      drag = true; dragged = false;
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
      document.documentElement.style.userSelect = 'none';
      e.preventDefault();
    });
    svg.addEventListener('pointermove', function (e) { if (drag) { dragged = true; place(toXY(e)); } });
    function end() { drag = false; document.documentElement.style.userSelect = ''; }
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    // Un toque fuera de P lo mueve ahí (click no se dispara al desplazar la página).
    svg.addEventListener('click', function (e) {
      if (dragged) { dragged = false; return; }
      if (e.target.closest && e.target.closest('.gf-handle')) return;
      place(toXY(e));
    });

    document.addEventListener('cb:themechange', function () { draw(); });
    return UI.loadMath().then(function (m) { math = m; build(); setTimeout(build, 400); });
  };
})();
