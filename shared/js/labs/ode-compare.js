/* =====================================================================
   Lab ode-compare (Cálculo 3 · las 15 sesiones): «¿Es solución de la EDO?».
   Un solo módulo parametrizado por sesión (cfg.problems):
     1. Superposición: la y(x) del alumno contra la solución numérica del mismo
        PVI (RK4 propio, paso fijo).
     2. Residuo: sustituye y, y′, y″… (derivadas simbólicas de math.js; diferencias
        finitas si math.js no puede derivar) en la EDO y grafica r(x). Es correcta si
        max|r| es despreciable en el dominio y se cumplen las condiciones iniciales,
        así que cuentan las soluciones equivalentes escritas distinto.
   Extras por sesión: campo de pendientes (field), trazo a mano sobre el campo
   (cfg.trace), deslizadores de parámetros (params con rango) y el tanque de
   mezclas (scene: 'tank').
   Esquema de un problema:
     { name, tex, iv: 'x'|'t', dv: 'y'|'T'|…, order, rhs (math.js, con y, dy, d2y, d3y
       y los parámetros), params?: { k: { value, min, max, step, label, unit } },
       x0, ics: [y(x0), y′(x0), …], domain: [a, b], solution (math.js), solutionTex,
       wrong: [{ src, tex, key }], hint, field?, scene? }
   LabMath.ode es puro (sin DOM): RK4, residuo, veredicto y campo de pendientes.
   Euler y RK no se explican en el curso: aquí solo dan la curva de referencia.
   ===================================================================== */
(function () {
  var DN = ['y', 'dy', 'd2y', 'd3y', 'd4y', 'd5y'];

  /* ------------------------- Matemática pura ------------------------- */
  function paramValues(P, over) {
    var out = {};
    Object.keys(P.params || {}).forEach(function (k) {
      var p = P.params[k];
      out[k] = over && over[k] != null ? over[k] : (typeof p === 'number' ? p : p.value);
    });
    return out;
  }
  function prep(src) { return window.LabMath.core.prep(String(src)); }

  // Lado derecho y^(n) = f(x, y, y′, …) compilado. state = [y, y′, …, y^(n−1)].
  function rhsFn(math, P, pv) {
    var code = math.parse(prep(P.kind === 'exact' ? exactRhs(P) : P.rhs)).compile(), iv = P.iv || 'x', n = P.order || 1;
    return function (x, s) {
      var sc = Object.assign({}, pv);
      sc[iv] = x;
      for (var i = 0; i < n; i++) sc[DN[i]] = s[i];
      try { var v = code.evaluate(sc); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; }
    };
  }
  function rk4Step(f, x, s, h) {
    var n = s.length;
    function F(xx, ss) { var d = ss.slice(1); d.push(f(xx, ss)); return d; }
    function add(a, b, k) { var r = new Array(n); for (var i = 0; i < n; i++) r[i] = a[i] + k * b[i]; return r; }
    var k1 = F(x, s), k2 = F(x + h / 2, add(s, k1, h / 2)), k3 = F(x + h / 2, add(s, k2, h / 2)), k4 = F(x + h, add(s, k3, h));
    var out = new Array(n);
    for (var i = 0; i < n; i++) out[i] = s[i] + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    return out;
  }
  // Integra desde (x0, ics) hasta x1 con paso fijo; se corta si la solución explota.
  function integrate(f, x0, s0, x1, steps, cap) {
    cap = cap || 1e6;
    var pts = [[x0, s0[0]]], s = s0.slice(), x = x0, h = (x1 - x0) / steps;
    if (h === 0) return pts;
    for (var i = 0; i < steps; i++) {
      s = rk4Step(f, x, s, h); x = x0 + (i + 1) * h;
      if (!s.every(isFinite) || Math.abs(s[0]) > cap) break;
      pts.push([x, s[0]]);
    }
    return pts;
  }
  // Solución numérica en todo el dominio: hacia adelante y hacia atrás desde x0.
  function numeric(math, P, over, steps) {
    var pv = paramValues(P, over), f = rhsFn(math, P, pv), d = P.domain, n = steps || 600;
    var ics = icsOf(math, P, pv), span = d[1] - d[0];
    var fw = d[1] > P.x0 ? integrate(f, P.x0, ics, d[1], Math.max(4, Math.round(n * (d[1] - P.x0) / span))) : [[P.x0, ics[0]]];
    var bw = d[0] < P.x0 ? integrate(f, P.x0, ics, d[0], Math.max(4, Math.round(n * (P.x0 - d[0]) / span))) : [[P.x0, ics[0]]];
    return bw.slice(1).reverse().concat(fw);
  }
  // Valor de la solución numérica en x (oráculo independiente de las fórmulas de los datos).
  function solveAt(math, P, x, over) {
    var pv = paramValues(P, over), f = rhsFn(math, P, pv), ics = icsOf(math, P, pv);
    var pts = integrate(f, P.x0, ics, x, Math.max(400, Math.min(4000, Math.ceil(Math.abs(x - P.x0) * 400))), 1e12);
    return pts[pts.length - 1][0] === x || Math.abs(pts[pts.length - 1][0] - x) < 1e-9 ? pts[pts.length - 1][1] : NaN;
  }
  // Las condiciones iniciales pueden depender de los parámetros (T(0) = T0).
  function icsOf(math, P, pv) {
    return (P.ics || []).map(function (c) { return typeof c === 'number' ? c : math.evaluate(prep(c), Object.assign({}, pv)); });
  }

  // Derivadas sucesivas de la expresión del alumno: simbólicas con math.js; si no se puede
  // derivar (función rara), diferencias centradas.
  function derivs(math, src, iv, order, pv) {
    var node = math.parse(prep(src)), nodes = [node], symbolic = true;
    try { for (var k = 1; k <= order; k++) nodes.push(math.derivative(nodes[k - 1], iv)); }
    catch (e) { symbolic = false; }
    var codes = symbolic ? nodes.map(function (n) { return n.compile(); }) : [node.compile()];
    function ev(code, x) {
      var sc = Object.assign({}, pv); sc[iv] = x;
      try { var v = code.evaluate(sc); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; }
    }
    var f0 = function (x) { return ev(codes[0], x); };
    return {
      symbolic: symbolic,
      at: function (x) {
        if (symbolic) return codes.map(function (c) { return ev(c, x); });
        var h = 1e-3 * Math.max(1, Math.abs(x)), out = [f0(x)];
        if (order >= 1) out.push((f0(x + h) - f0(x - h)) / (2 * h));
        if (order >= 2) out.push((f0(x + h) - 2 * out[0] + f0(x - h)) / (h * h));
        if (order >= 3) out.push((f0(x + 2 * h) - 2 * f0(x + h) + 2 * f0(x - h) - f0(x - 2 * h)) / (2 * h * h * h));
        if (order >= 4) out.push((f0(x + 2 * h) - 4 * f0(x + h) + 6 * out[0] - 4 * f0(x - h) + f0(x - 2 * h)) / (h * h * h * h));
        return out;
      }
    };
  }

  // ¿La expresión usa solo la variable independiente, constantes conocidas y parámetros?
  function freeSymbols(math, src, allowed) {
    var bad = [];
    math.parse(prep(src)).traverse(function (n, path, parent) {
      if (n.isSymbolNode && !(parent && parent.isFunctionNode && parent.fn === n) && allowed.indexOf(n.name) < 0 && ['e', 'pi', 'E', 'PI', 'i'].indexOf(n.name) < 0) {
        if (bad.indexOf(n.name) < 0) bad.push(n.name);
      }
    });
    return bad;
  }

  // Residuo r(x) = y^(n) − f(x, y, …) en una malla del dominio, relativo al tamaño de los términos.
  function residual(math, P, src, over, n) {
    var pv = paramValues(P, over), iv = P.iv || 'x', ord = P.order || 1, f = rhsFn(math, P, pv);
    var D = derivs(math, src, iv, ord, pv), d = P.domain, N = n || 160, pts = [], maxRel = 0, maxAbs = 0, valid = 0;
    for (var i = 0; i <= N; i++) {
      var x = d[0] + (d[1] - d[0]) * (i + 0.5) / (N + 1), v = D.at(x);
      var lhs = v[ord], s = v.slice(0, ord), rhs = f(x, s), r = lhs - rhs;
      if (!isFinite(r)) { pts.push([x, NaN]); continue; }
      valid++;
      var scale = 1 + Math.abs(lhs) + Math.abs(rhs) + Math.abs(v[0]);
      maxRel = Math.max(maxRel, Math.abs(r) / scale);
      maxAbs = Math.max(maxAbs, Math.abs(r));
      pts.push([x, r]);
    }
    return { pts: pts, maxRel: maxRel, maxAbs: maxAbs, valid: valid, total: N + 1, symbolic: D.symbolic, D: D };
  }

  // Veredicto completo. → { kind: 'ok'|'warn'|'bad'|'invalid', reason, maxRel, icErr, key? }
  //   correct: residuo ≈ 0 y condiciones iniciales cumplidas
  //   ic:      resuelve la EDO, pero no el PVI (la constante está mal)
  //   residual: no es solución de la EDO
  //   domain:  no se pudo evaluar en casi ningún punto
  //   symbols: usa letras que no existen en el problema (por ejemplo, C)
  function verify(math, P, src, over) {
    var iv = P.iv || 'x', ord = P.order || 1, pv = paramValues(P, over);
    if (!String(src || '').trim()) return { kind: 'invalid', reason: 'empty' };
    var extra;
    try { extra = freeSymbols(math, src, [iv].concat(Object.keys(pv))); }
    catch (e) { return { kind: 'invalid', reason: 'parse', msg: e.message }; }
    if (extra.length) return { kind: 'invalid', reason: 'symbols', symbols: extra };
    var R;
    try { R = residual(math, P, src, over); } catch (e) { return { kind: 'invalid', reason: 'parse', msg: e.message }; }
    var out = { maxRel: R.maxRel, maxAbs: R.maxAbs, symbolic: R.symbolic, pts: R.pts };
    if (R.valid < 0.6 * R.total) { out.kind = 'bad'; out.reason = 'domain'; return out; }
    var tol = R.symbolic ? 1e-7 : 1e-4;
    var ics = icsOf(math, P, pv), v0 = R.D.at(P.x0), icErr = 0;
    for (var k = 0; k < ord && k < ics.length; k++) icErr = Math.max(icErr, Math.abs(v0[k] - ics[k]) / (1 + Math.abs(ics[k])));
    out.icErr = isFinite(icErr) ? icErr : Infinity;
    out.y0 = v0.slice(0, ord);
    if (R.maxRel > tol) { out.kind = 'bad'; out.reason = 'residual'; return out; }
    if (!(out.icErr < 1e-6)) { out.kind = 'warn'; out.reason = 'ic'; return out; }
    out.kind = 'ok'; out.reason = 'correct';
    return out;
  }
  // Versión numérica para ejemplos y pruebas: 1 si es correcta, 0 si no.
  function isSolution(math, P, src, over) { return verify(math, P, src, over).reason === 'correct' ? 1 : 0; }

  // Campo de pendientes de y′ = f(x, y): segmentos cortos centrados en una malla.
  function slopeField(math, P, box, nx, ny, over) {
    var f = rhsFn(math, P, paramValues(P, over)), segs = [];
    var sx = (box.x[1] - box.x[0]) / nx, sy = (box.y[1] - box.y[0]) / ny, L = 0.38 * Math.min(sx, sy * (box.ar || 1));
    for (var i = 0; i < nx; i++) for (var j = 0; j < ny; j++) {
      var x = box.x[0] + (i + 0.5) * sx, y = box.y[0] + (j + 0.5) * sy, m = f(x, [y]);
      if (!isFinite(m)) continue;
      // Longitud fija en pantalla: ar = (unidades de y por píxel) / (unidades de x por píxel).
      var ar = box.ar || 1, dx = L / Math.sqrt(1 + (m / ar) * (m / ar)), dy = m * dx;
      segs.push([[x - dx, y - dy], [x + dx, y + dy]]);
    }
    return segs;
  }

  // Trazo a mano: poligonal del alumno contra la integral numérica que sale de su primer punto.
  // → { err (máximo relativo a la altura del cuadro), ref: puntos de la curva numérica }
  function traceError(math, P, pts, box, over) {
    if (!pts || pts.length < 2) return { err: Infinity, ref: [] };
    var f = rhsFn(math, P, paramValues(P, over)), p0 = pts[0], xs = pts.map(function (p) { return p[0]; });
    var xmax = Math.max.apply(null, xs), xmin = Math.min.apply(null, xs);
    var fw = xmax > p0[0] ? integrate(f, p0[0], [p0[1]], xmax, 300, 1e6) : [p0];
    var bw = xmin < p0[0] ? integrate(f, p0[0], [p0[1]], xmin, 300, 1e6) : [p0];
    var ref = bw.slice(1).reverse().concat(fw), H = box.y[1] - box.y[0], err = 0;
    function at(x) {
      for (var i = 1; i < ref.length; i++) {
        var a = ref[i - 1], b = ref[i];
        if ((x - a[0]) * (x - b[0]) <= 0) return a[1] + (b[1] - a[1]) * (x - a[0]) / ((b[0] - a[0]) || 1);
      }
      return NaN;
    }
    pts.forEach(function (p) { var y = at(p[0]); if (isFinite(y)) err = Math.max(err, Math.abs(y - p[1]) / H); });
    return { err: err, ref: ref };
  }

  /* ---------- Exactas (S06–S07): M dx + N dy = 0 ----------
     P = { kind: 'exact', M, N, mu?, ask: 'F' | 'mu', x0, ics: [y0], domain, yRange }
     La solución numérica sigue dy/dx = −M/N; el alumno da F(x, y) (curvas F = C) o el
     factor integrante μ que vuelve exacta la ecuación. */
  function exactRhs(P) { return P.rhs || '-(' + P.M + ')/(' + P.N + ')'; }
  function grid2(P, n) {
    var d = P.domain, r = P.yRange || [P.ics[0] - 2, P.ics[0] + 2], out = [];
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) out.push([d[0] + (d[1] - d[0]) * (i + 0.5) / n, r[0] + (r[1] - r[0]) * (j + 0.5) / n]);
    return out;
  }
  function compile2(math, src) {
    var node = math.parse(prep(src)), code = node.compile();
    return { node: node, f: function (x, y) { try { var v = code.evaluate({ x: x, y: y }); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; } } };
  }
  function partials(math, src) {
    var c = compile2(math, src), fx = compile2(math, math.derivative(c.node, 'x').toString()), fy = compile2(math, math.derivative(c.node, 'y').toString());
    return { f: c.f, fx: fx.f, fy: fy.f };
  }
  // Máximo error relativo |a − b| / (1 + |b|) en la malla; null si casi ningún punto es válido.
  function maxRel(pts, a, b) {
    var m = 0, n = 0;
    pts.forEach(function (p) {
      var u = a(p[0], p[1]), v = b(p[0], p[1]);
      if (!isFinite(u) || !isFinite(v)) return;
      n++; m = Math.max(m, Math.abs(u - v) / (1 + Math.abs(v)));
    });
    return n < 0.6 * pts.length ? null : m;
  }
  // ¿Es exacta M dx + N dy (multiplicada por μ, si se da)? Devuelve el máximo de |∂(μM)/∂y − ∂(μN)/∂x|.
  function exactGap(math, P, muSrc) {
    var mu = muSrc ? '(' + muSrc + ')*' : '';
    var Mm = partials(math, mu + '(' + P.M + ')'), Nn = partials(math, mu + '(' + P.N + ')');
    return maxRel(grid2(P, 9), Mm.fy, Nn.fx);
  }
  // Veredicto: correct · sign (−F) · missingH (falta la h(y)) · residual · notExact (μ no sirve)
  function verifyExact(math, P, src) {
    if (!String(src || '').trim()) return { kind: 'invalid', reason: 'empty' };
    var extra;
    try { extra = freeSymbols(math, src, P.ask === 'mu' ? ['x', 'y'] : ['x', 'y']); }
    catch (e) { return { kind: 'invalid', reason: 'parse', msg: e.message }; }
    if (extra.length) return { kind: 'invalid', reason: 'symbols', symbols: extra };
    var pts = grid2(P, 9);
    try {
      if (P.ask === 'mu') {
        var g = exactGap(math, P, src);
        if (g === null) return { kind: 'bad', reason: 'domain' };
        return g < 1e-7 ? { kind: 'ok', reason: 'correct', gap: g, before: exactGap(math, P) } : { kind: 'bad', reason: 'notExact', gap: g, before: exactGap(math, P) };
      }
      var mu = P.mu ? '(' + P.mu + ')*' : '';
      var F = partials(math, src), M = compile2(math, mu + '(' + P.M + ')').f, N = compile2(math, mu + '(' + P.N + ')').f;
      var ex = maxRel(pts, F.fx, M), ey = maxRel(pts, F.fy, N);
      if (ex === null || ey === null) return { kind: 'bad', reason: 'domain' };
      var out = { ex: ex, ey: ey };
      if (ex < 1e-7 && ey < 1e-7) { out.kind = 'ok'; out.reason = 'correct'; return out; }
      var sx = maxRel(pts, function (x, y) { return -F.fx(x, y); }, M), sy = maxRel(pts, function (x, y) { return -F.fy(x, y); }, N);
      if (sx < 1e-7 && sy < 1e-7) { out.kind = 'warn'; out.reason = 'sign'; return out; }
      if (ex < 1e-7) { out.kind = 'warn'; out.reason = 'missingH'; return out; }
      out.kind = 'bad'; out.reason = 'residual'; return out;
    } catch (e) { return { kind: 'invalid', reason: 'parse', msg: e.message }; }
  }
  // Versiones numéricas para los ejemplos: 1 si se cumple, 0 si no.
  function isPotential(math, P, src) { return verifyExact(math, P, src).reason === 'correct' ? 1 : 0; }
  function isExactEq(math, P, muSrc) { var g = exactGap(math, P, muSrc); return g !== null && g < 1e-7 ? 1 : 0; }
  // Curva de nivel f(x, y) = c con cuadrados que marchan: segmentos [[x, y], [x, y]].
  function contour(f, box, c, nx, ny) {
    nx = nx || 80; ny = ny || 60;
    var dx = (box.x[1] - box.x[0]) / nx, dy = (box.y[1] - box.y[0]) / ny, segs = [], v = [];
    for (var i = 0; i <= nx; i++) { v.push([]); for (var j = 0; j <= ny; j++) v[i].push(f(box.x[0] + i * dx, box.y[0] + j * dy) - c); }
    function cut(x1, y1, a, x2, y2, b) { var t = a / (a - b); return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)]; }
    for (var I = 0; I < nx; I++) for (var J = 0; J < ny; J++) {
      var x0 = box.x[0] + I * dx, y0 = box.y[0] + J * dy, a = v[I][J], b = v[I + 1][J], cc = v[I + 1][J + 1], d = v[I][J + 1];
      if (![a, b, cc, d].every(isFinite)) continue;
      var e = [];
      if ((a > 0) !== (b > 0)) e.push(cut(x0, y0, a, x0 + dx, y0, b));
      if ((b > 0) !== (cc > 0)) e.push(cut(x0 + dx, y0, b, x0 + dx, y0 + dy, cc));
      if ((cc > 0) !== (d > 0)) e.push(cut(x0 + dx, y0 + dy, cc, x0, y0 + dy, d));
      if ((d > 0) !== (a > 0)) e.push(cut(x0, y0 + dy, d, x0, y0, a));
      if (e.length >= 2) segs.push([e[0], e[1]]);
      if (e.length === 4) segs.push([e[2], e[3]]);
    }
    return segs;
  }

  /* ---------- Wronskiano (S09): dos soluciones de una lineal homogénea de orden 2 ----------
     P = { kind: 'pair', order: 2, rhs, domain }; el alumno da y₁ y y₂.
     Veredicto: correct (las dos son solución y W ≠ 0) · dependent (W ≡ 0) · notSolution1/2 */
  function wronskian(math, P, s1, s2) {
    var iv = P.iv || 'x', d = P.domain, D1 = derivs(math, s1, iv, 1, {}), D2 = derivs(math, s2, iv, 1, {}), pts = [];
    for (var i = 0; i <= 120; i++) {
      var x = d[0] + (d[1] - d[0]) * (i + 0.5) / 121, a = D1.at(x), b = D2.at(x);
      pts.push([x, a[0] * b[1] - a[1] * b[0], Math.abs(a[0] * b[1]) + Math.abs(a[1] * b[0])]);
    }
    return pts;
  }
  function verifyPair(math, P, s1, s2) {
    if (!String(s1 || '').trim() || !String(s2 || '').trim()) return { kind: 'invalid', reason: 'empty' };
    try {
      var bad = freeSymbols(math, s1, [P.iv || 'x']).concat(freeSymbols(math, s2, [P.iv || 'x']));
      if (bad.length) return { kind: 'invalid', reason: 'symbols', symbols: bad };
      var tol = 1e-7, r1 = residual(math, P, s1), r2 = residual(math, P, s2);
      var Wp = wronskian(math, P, s1, s2), out = { r1: r1, r2: r2, W: Wp };
      if (r1.valid < 0.6 * r1.total || r2.valid < 0.6 * r2.total) { out.kind = 'bad'; out.reason = 'domain'; return out; }
      if (r1.maxRel > tol) { out.kind = 'bad'; out.reason = 'notSolution1'; return out; }
      if (r2.maxRel > tol) { out.kind = 'bad'; out.reason = 'notSolution2'; return out; }
      var big = Wp.some(function (p) { return isFinite(p[1]) && Math.abs(p[1]) > 1e-7 * (1 + p[2]); });
      out.kind = big ? 'ok' : 'warn'; out.reason = big ? 'correct' : 'dependent';
      return out;
    } catch (e) { return { kind: 'invalid', reason: 'parse', msg: e.message }; }
  }
  // Para ejemplos: W(x₀) y si el par es un conjunto fundamental (1/0).
  function wronskianAt(math, P, s1, s2, x) {
    var a = derivs(math, s1, P.iv || 'x', 1, {}).at(x), b = derivs(math, s2, P.iv || 'x', 1, {}).at(x);
    return a[0] * b[1] - a[1] * b[0];
  }
  function isFundamental(math, P, s1, s2) { return verifyPair(math, P, s1, s2).reason === 'correct' ? 1 : 0; }
  // Raíces de r² + a r + b = 0: { re1, im1, re2, im2 }.
  function charRoots(a, b) {
    var disc = a * a - 4 * b;
    if (disc >= 0) { var s = Math.sqrt(disc); return [[(-a - s) / 2, 0], [(-a + s) / 2, 0]]; }
    var w = Math.sqrt(-disc) / 2; return [[-a / 2, -w], [-a / 2, w]];
  }

  // LaTeX del alumno → expresión de math.js. El convertidor del sitio ignora los subíndices
  // (T_a → T), así que los parámetros con subíndice (T_a, P_0, c_{in}) se cambian por letras
  // griegas de paso y se regresan a su nombre; P.alias traduce otras (epsilon → E).
  var PH = ['kappa', 'lambda', 'mu', 'nu', 'xi', 'zeta', 'chi', 'psi'];
  function fromLatex(toMath, tex, P) {
    var back = {}, forms = [];
    Object.keys(P.params || {}).forEach(function (n, i) {
      var m = n.match(/^([A-Za-z])([A-Za-z0-9]+)$/);
      if (!m) return;
      back[PH[i % PH.length]] = n;
      forms.push([m[1] + '_{' + m[2] + '}', PH[i % PH.length]]);
      if (m[2].length === 1) forms.push([m[1] + '_' + m[2], PH[i % PH.length]]);
    });
    forms.sort(function (a, b) { return b[0].length - a[0].length; });
    forms.forEach(function (f) { tex = tex.split(f[0]).join('\\' + f[1] + ' '); });
    var out = toMath(tex), alias = Object.assign({}, P.alias || {});
    Object.keys(back).forEach(function (ph) { alias[ph] = back[ph]; });
    Object.keys(alias).forEach(function (a) { out = out.replace(new RegExp('\\b' + a + '\\b', 'g'), alias[a]); });
    return out;
  }

  window.LabMath.ode = {
    fromLatex: fromLatex,
    paramValues: paramValues, rhsFn: rhsFn, rk4Step: rk4Step, integrate: integrate, numeric: numeric, solveAt: solveAt,
    derivs: derivs, residual: residual, verify: verify, isSolution: isSolution, slopeField: slopeField,
    traceError: traceError, freeSymbols: freeSymbols, icsOf: icsOf,
    exactRhs: exactRhs, exactGap: exactGap, verifyExact: verifyExact, contour: contour, isPotential: isPotential, isExactEq: isExactEq,
    wronskian: wronskian, verifyPair: verifyPair, charRoots: charRoots, wronskianAt: wronskianAt, isFundamental: isFundamental
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var W = 520, H = 340, RH = 170;
  var PRIME = ['', '′', '″', '‴', '⁽⁴⁾'];
  function msgs(P) {
    var y = P.dv || 'y', x = P.iv || 'x';
    return {
      correct: ['Es solución del PVI', 'El residuo es cero en todo el dominio y se cumplen las condiciones iniciales. Tu curva cae encima de la numérica, aunque la hayas escrito distinto.'],
      ic: ['Casi: resuelve la EDO, pero no el PVI', 'El residuo es cero, así que tu ' + y + '(' + x + ') sí es solución de la ecuación. Falla la condición inicial: revisa cómo despejaste la constante.'],
      residual: ['No es solución de la EDO', 'Al sustituir tu ' + y + '(' + x + ') en la ecuación, los dos lados no coinciden: mira dónde se separa el residuo de cero.'],
      domain: ['No pude evaluar tu ' + y + '(' + x + ')', 'Casi ningún punto del dominio da un número. Revisa paréntesis, raíces y logaritmos.'],
      symbols: ['Te sobran letras', ''],
      parse: ['No pude leer tu expresión', ''],
      empty: ['Escribe tu ' + y + '(' + x + ')', 'Usa ' + x + ' como variable.']
    };
  }

  window.Labs['ode-compare'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var math = null;
    var list = cfg.problems || [];
    var cur = list[Math.max(0, Math.min(list.length - 1, cfg.start || 0))];
    var over = {}, pristine = true, mode = 'formula', tracePts = [];

    var probSel = UI.select({ label: 'Problema', options: list.map(function (p, i) { return (i + 1) + ' · ' + p.name; }) });
    var given = h('div', { class: 'lab-given' });
    var hintP = h('p', { class: 'lab-note' });
    var sliders = h('div', { class: 'lab-controls__group' });
    var modeSel = cfg.trace ? UI.select({ label: '¿Cómo quieres responder?', options: ['Escribiendo la fórmula', 'Trazando la curva a mano'] }) : null;
    var yIn = UI.mathField({ label: 'Tu solución', palette: 'calculo', hint: '', onEnter: function () { check(); } });
    var y2In = UI.mathField({ label: 'Tu segunda solución', palette: 'calculo', hint: '', onEnter: function () { check(); } });
    var methodSel = UI.select({ label: '¿Qué método usarías?', options: ['—'] });
    var run = UI.button('Comprobar', 'primary', function () { check(); });
    var showSol = UI.button('Ver una solución', 'ghost', function () {
      solBox.hidden = !solBox.hidden;
      showSol.textContent = solBox.hidden ? 'Ver una solución' : 'Ocultar la solución';
    });
    var solBox = h('div', { class: 'lab-given', hidden: true });
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var traceNote = h('p', { class: 'lab-note' });
    var traceClear = UI.button('Borrar trazo', 'ghost', function () { tracePts = []; drawTrace(); });
    var formulaBox = h('div', {}, [methodSel.node, yIn.node, y2In.node, h('div', { class: 'lab-buttons' }, [run, showSol]), solBox, note]);
    var traceBox = h('div', { hidden: true }, [traceNote, h('div', { class: 'lab-buttons' }, [traceClear])]);

    var svg = UI.svg(W, H, 'Tu solución contra la solución numérica del PVI');
    var rsvg = UI.svg(W, RH, 'Residuo de tu solución en el dominio');
    var title = h('figcaption', { class: 'lab-board__title sheet__title' }, ['Tu curva contra la numérica']);
    var legend = h('ul', { class: 'lab-legend' });
    var rTitle = h('p', { class: 'lab-note' }, ['Residuo r = (lado izquierdo) − (lado derecho) al sustituir tu solución']);
    var scene = h('div', { class: 'lab-scene' });
    var facts = h('dl', { class: 'lab-facts' });

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [probSel.node, given, hintP, sliders, modeSel ? modeSel.node : null, formulaBox, traceBox, verdict]),
      h('figure', { class: 'lab-board' }, [title, svg, legend, scene, rTitle, rsvg, facts])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); });
    if (yIn.onInput) yIn.onInput(function () { pristine = false; });
    probSel.input.addEventListener('change', function () { setProblem(list[+probSel.input.value]); });
    if (modeSel) modeSel.input.addEventListener('change', function () {
      mode = modeSel.input.value === '1' ? 'trace' : 'formula';
      formulaBox.hidden = mode === 'trace'; traceBox.hidden = mode !== 'trace';
      rTitle.hidden = mode === 'trace'; rsvg.style.display = mode === 'trace' ? 'none' : '';
      verdict.hidden = true;
      if (mode === 'trace') drawTrace(); else check();
    });

    function setLegend(items) {
      legend.innerHTML = '';
      items.forEach(function (l) { legend.appendChild(h('li', {}, [h('i', { class: 'sw sw--' + l[0] }), l[1]])); });
    }
    function setProblem(P) {
      cur = P; over = {}; pristine = true; tracePts = [];
      given.innerHTML = '$' + P.tex + '$';
      var lhs = P.kind === 'exact' ? (P.ask === 'mu' ? '\\mu = ' : 'F(x, y) = ') : P.kind === 'pair' ? '' : (P.dv || 'y') + '(' + (P.iv || 'x') + ') = ';
      solBox.innerHTML = '$' + lhs + P.solutionTex + '$';
      solBox.hidden = true; showSol.textContent = 'Ver una solución';
      UI.renderMath(given); UI.renderMath(solBox);
      hintP.innerHTML = P.hint ? 'Pista: ' + P.hint : '';
      UI.renderMath(hintP);
      function setLabel(field, text) {
        var lab = field.node.querySelector('.lab-field__label, label');
        if (lab) lab.textContent = text;
      }
      setLabel(yIn, P.kind === 'exact' ? (P.ask === 'mu' ? 'Tu factor integrante μ' : 'Tu F(x, y)') : P.kind === 'pair' ? 'Tu y₁(x)' : 'Tu ' + (P.dv || 'y') + '(' + (P.iv || 'x') + ')');
      setLabel(y2In, 'Tu y₂(x)');
      y2In.node.hidden = P.kind !== 'pair';
      methodSel.node.hidden = !P.methods;
      if (P.methods) {
        methodSel.input.innerHTML = '';
        ['Elige un método'].concat(P.methods).forEach(function (m, i) { methodSel.input.appendChild(h('option', { value: String(i - 1) }, [m])); });
      }
      sliders.innerHTML = '';
      Object.keys(P.params || {}).forEach(function (k) {
        var p = P.params[k];
        if (typeof p === 'number' || p.min == null) return;
        var s = UI.slider({ label: p.label || k, min: p.min, max: p.max, step: p.step || 'any', value: p.value, unit: p.unit, fmt: function (v) { return UI.fmt(v, 3); } }, function (v) {
          over[k] = v; verdict.hidden = true;
          if (mode === 'trace') drawTrace(); else check();
        });
        sliders.appendChild(s.node);
      });
      sliders.hidden = !sliders.children.length;
      traceNote.textContent = 'Toca el campo de pendientes para marcar puntos de tu curva, de izquierda a derecha, siguiendo las rayitas. El primer punto es la condición inicial.';
      var sample = (P.wrong && P.wrong[0]) || null;
      function put(field, tex, src) { if (field.setLatex) field.setLatex(tex); else if (field.setMath) field.setMath(src); }
      if (sample && P.kind === 'pair') { put(yIn, sample.tex[0], sample.src[0]); put(y2In, sample.tex[1], sample.src[1]); }
      else if (sample && sample.tex) put(yIn, sample.tex, sample.src);
      startSample = sample ? sample.src : '';
      note.textContent = sample ? 'Ejemplo cargado: así respondió un compañero. ' + (P.kind === 'exact' ? '¿Está bien?' : '¿Es solución?') + ' Compruébalo y luego escribe la tuya.' : '';
      verdict.hidden = true;
      if (mode === 'trace') drawTrace(); else check();
    }
    var startSample = '';

    /* ---------- Dibujo ---------- */
    function box(numPts, stuPts) {
      var d = cur.domain, ys = [];
      numPts.forEach(function (p) { ys.push(p[1]); });
      var r = cur.yRange;
      if (!r) {
        r = window.LabPlot.range(ys);
        if (stuPts) {
          var span = r[1] - r[0];
          stuPts.forEach(function (p) { if (isFinite(p[1]) && p[1] > r[0] - span && p[1] < r[1] + span) ys.push(p[1]); });
          r = window.LabPlot.range(ys);
        }
      }
      return { x: d.slice(), y: r.slice() };
    }
    function el(name, attrs, parent, txt) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (txt != null) n.textContent = txt;
      (parent || svg).appendChild(n);
      return n;
    }
    function drawField(plot, B) {
      if (!(cur.field && (cur.order || 1) === 1)) return;
      var pxX = (B.x[1] - B.x[0]) / (W - 60), pxY = (B.y[1] - B.y[0]) / (H - 44);
      // Sin rayitas sobre los números de los ejes: se deja libre una franja junto a cada eje.
      var ax = B.y[0] <= 0 && B.y[1] >= 0 ? plot.Y(0) : plot.Y(B.y[0]), ay = B.x[0] <= 0 && B.x[1] >= 0 ? plot.X(0) : plot.X(B.x[0]);
      var segs = LabMath.ode.slopeField(math, cur, { x: B.x, y: B.y, ar: pxY / pxX }, 15, 9, over).filter(function (sg) {
        var cx = plot.X((sg[0][0] + sg[1][0]) / 2), cy = plot.Y((sg[0][1] + sg[1][1]) / 2);
        return !(cx > ay - 40 && cx < ay + 8) && !(cy > ax - 8 && cy < ax + 24);
      });
      plot.segments(segs, 'aux', 1.6);
    }
    function polyPath(plot, pts, cls, w, dash) {
      var d = '', pen = false;
      pts.forEach(function (p) {
        if (!isFinite(p[1])) { pen = false; return; }
        d += (pen ? 'L' : 'M') + plot.X(p[0]).toFixed(1) + ' ' + plot.Y(p[1]).toFixed(1); pen = true;
      });
      if (d) el('path', { d: d, class: cls, fill: 'none', 'stroke-width': w || 3, 'stroke-dasharray': dash, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg.querySelector('g.sketch'));
    }
    function sampleStudent(src) {
      var pv = LabMath.ode.paramValues(cur, over), iv = cur.iv || 'x', code = math.parse(LabMath.core.prep(src)).compile(), out = [], d = cur.domain;
      for (var i = 0; i <= 300; i++) {
        var x = d[0] + (d[1] - d[0]) * i / 300, sc = Object.assign({}, pv); sc[iv] = x;
        var v; try { v = code.evaluate(sc); } catch (e) { v = NaN; }
        out.push([x, typeof v === 'number' ? v : NaN]);
      }
      return out;
    }
    function drawResidual(R, kind) {
      rsvg.innerHTML = '';
      if (!R) return;
      var pts = R.pts.filter(function (p) { return isFinite(p[1]); });
      var m = 0; pts.forEach(function (p) { m = Math.max(m, Math.abs(p[1])); });
      var tiny = kind === 'ok' || m < 1e-9, M = tiny ? 1 : m * 1.15;
      var plot = window.LabPlot(rsvg, { x: cur.domain.slice(), y: [-M, M] });
      plot.clear().grid().axes();
      // Solo las marcas del eje x: la escala vertical va escrita en la etiqueta (las de y se enciman).
      Array.prototype.slice.call(rsvg.querySelectorAll('text.lab-tick[text-anchor="end"]')).forEach(function (t) { t.remove(); });
      if (tiny) plot.curve(function () { return 0; }, 'trace', 3.5);
      else polyPathR(plot, R.pts);
      plot.label(cur.domain[1], M, tiny ? 'r ≈ 0 en todo el dominio' : 'escala ±' + UI.fmt(M, 2) + ' · máx |r| ≈ ' + UI.fmt(R.maxAbs, 3), 'end', 15, -6, 4);
    }
    function polyPathR(plot, pts) {
      var d = '', pen = false;
      pts.forEach(function (p) {
        if (!isFinite(p[1])) { pen = false; return; }
        d += (pen ? 'L' : 'M') + plot.X(p[0]).toFixed(1) + ' ' + plot.Y(p[1]).toFixed(1); pen = true;
      });
      if (d) {
        var n = document.createElementNS(NS, 'path');
        if (UI.svgOk({ d: d })) {
          n.setAttribute('d', d); n.setAttribute('class', 'error'); n.setAttribute('fill', 'none'); n.setAttribute('stroke-width', '3');
          rsvg.querySelector('g.sketch').appendChild(n);
        }
      }
    }
    function icDots(plot) {
      var pv = LabMath.ode.paramValues(cur, over), ics = LabMath.ode.icsOf(math, cur, pv);
      plot.point(cur.x0, ics[0], 'dot-ref', 6);
    }
    // Antes y después del cambio de variable (S03, S05): la misma solución vista en u.
    function drawTwin(numPts, stuPts, kind) {
      var T = cur.twin, code = math.parse(LabMath.core.prep(T.u)).compile(), pv = LabMath.ode.paramValues(cur, over), iv = cur.iv || 'x';
      function toU(pts) {
        return pts.map(function (p) {
          var sc = Object.assign({}, pv); sc[iv] = p[0]; sc.y = p[1];
          var v; try { v = code.evaluate(sc); } catch (e) { v = NaN; }
          return [p[0], typeof v === 'number' ? v : NaN];
        });
      }
      var nu = toU(numPts), su = stuPts ? toU(stuPts) : null;
      var s = UI.svg(W, 190, 'La misma solución después del cambio de variable');
      var r = window.LabPlot.range(nu.map(function (p) { return p[1]; }));
      var plot = window.LabPlot(s, { x: cur.domain.slice(), y: r });
      plot.clear().grid().axes();
      scene.appendChild(h('p', { class: 'lab-note' }, ['Después del cambio de variable: ' + T.label]));
      scene.appendChild(s);
      function path(pts, cls, w, dash) {
        var d = '', pen = false;
        pts.forEach(function (p) {
          if (!isFinite(p[1]) || p[1] < r[0] - 3 * (r[1] - r[0]) || p[1] > r[1] + 3 * (r[1] - r[0])) { pen = false; return; }
          d += (pen ? 'L' : 'M') + plot.X(p[0]).toFixed(1) + ' ' + plot.Y(p[1]).toFixed(1); pen = true;
        });
        if (!d || !UI.svgOk({ d: d })) return;
        var n = document.createElementNS(NS, 'path');
        n.setAttribute('d', d); n.setAttribute('class', cls); n.setAttribute('fill', 'none'); n.setAttribute('stroke-width', w);
        if (dash) n.setAttribute('stroke-dasharray', dash);
        s.querySelector('g.sketch').appendChild(n);
      }
      path(nu, 'ref', 4);
      if (su) path(su, kind === 'ok' ? 'trace' : 'student', 3, kind === 'ok' ? '8 7' : null);
      plot.label(cur.domain[1], r[1], 'u', 'end', 16, -6, 6);
    }
    // Raíces de r² + a r + b = 0 en el plano complejo (S10, S15): P.roots = ['a', 'b'] nombra los parámetros.
    function drawRoots() {
      var pv = LabMath.ode.paramValues(cur, over), names = cur.roots || ['a', 'b'];
      var a = pv[names[0]], b = pv[names[1]], R = LabMath.ode.charRoots(a, b);
      var s = UI.svg(W, 200, 'Raíces de la ecuación característica en el plano complejo');
      var lim = Math.max(2, Math.ceil(Math.max(Math.abs(R[0][0]), Math.abs(R[1][0]), Math.abs(R[0][1])) * 1.3));
      var plot = window.LabPlot(s, { x: [-lim, lim], y: [-lim * 0.55, lim * 0.55] });
      plot.clear().grid().axes();
      scene.appendChild(h('p', { class: 'lab-note' }, ['Raíces de r² + ' + UI.fmt(a, 3) + 'r + ' + UI.fmt(b, 3) + ' = 0 (eje horizontal: parte real; vertical: parte imaginaria)']));
      scene.appendChild(s);
      R.forEach(function (q) { plot.point(q[0], q[1], 'dot-ref', 7); });
      var disc = a * a - 4 * b, kindTxt = Math.abs(disc) < 1e-9 ? 'raíz doble: y = (c₁ + c₂x)eʳˣ' : disc > 0 ? 'dos raíces reales: y = c₁eʳ¹ˣ + c₂eʳ²ˣ' : 'complejas α ± βi: y = eᵅˣ(c₁cos βx + c₂sin βx)';
      facts.appendChild(h('dt', {}, ['tipo de raíces'])); facts.appendChild(h('dd', {}, [kindTxt]));
      facts.appendChild(h('dt', {}, ['r₁, r₂'])); facts.appendChild(h('dd', {}, [R.map(function (q) { return UI.fmt(q[0], 3) + (q[1] ? (q[1] > 0 ? ' + ' : ' − ') + UI.fmt(Math.abs(q[1]), 3) + 'i' : ''); }).join(' · ')]));
    }
    function drawScene(numPts, stuPts, kind) {
      scene.innerHTML = '';
      if (cur.twin) { scene.hidden = false; drawTwin(numPts, stuPts, kind); return; }
      if (cur.scene === 'roots') { scene.hidden = false; drawRoots(); return; }
      if (cur.scene !== 'tank') { scene.hidden = true; return; }
      scene.hidden = false;
      // Tanque de mezclas: el tono del líquido sigue la concentración en el instante final del dominio.
      var pv = LabMath.ode.paramValues(cur, over), Vol = pv.V || 100, last = numPts[numPts.length - 1][1], cin = pv.cin || 0;
      var conc = Math.max(0, last / Vol), cmax = Math.max(cin, conc, 1e-9), lvl = Math.min(1, conc / cmax);
      var s = document.createElementNS(NS, 'svg');
      s.setAttribute('viewBox', '0 0 520 120'); s.setAttribute('class', 'lab-stage'); s.setAttribute('role', 'img');
      s.setAttribute('aria-label', 'Tanque de mezclas con entrada y salida');
      var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'sketch'); s.appendChild(g);
      function add(tag, a, txt) { var n = document.createElementNS(NS, tag); for (var k in a) n.setAttribute(k, a[k]); if (txt != null) n.textContent = txt; g.appendChild(n); return n; }
      // El tono del líquido sigue la concentración (opacidad del grupo: la clase fija la del relleno).
      var liq = document.createElementNS(NS, 'g'); liq.setAttribute('opacity', (0.25 + 0.75 * lvl).toFixed(2)); g.appendChild(liq);
      var rr = document.createElementNS(NS, 'rect');
      [['x', 200], ['y', 22], ['width', 120], ['height', 86], ['class', 'area-fill']].forEach(function (a) { rr.setAttribute(a[0], a[1]); });
      liq.appendChild(rr);
      add('path', { d: 'M200 14V108H320V14', class: 'axis', fill: 'none', 'stroke-width': 3 });
      add('path', { d: 'M120 30H196', class: 'ref', fill: 'none', 'stroke-width': 3 });
      add('path', { d: 'M188 24L198 30L188 36', class: 'ref', fill: 'none', 'stroke-width': 3 });
      add('path', { d: 'M324 98H400', class: 'trace', fill: 'none', 'stroke-width': 3 });
      add('path', { d: 'M392 92L402 98L392 104', class: 'trace', fill: 'none', 'stroke-width': 3 });
      add('text', { x: 12, y: 26, class: 'ann', 'font-size': 14 }, 'entra ' + UI.fmt(pv.r || 0, 3) + ' L/min');
      add('text', { x: 12, y: 46, class: 'ann', 'font-size': 14 }, 'con ' + UI.fmt(cin, 3) + ' g/L');
      add('text', { x: 410, y: 92, class: 'ann', 'font-size': 14 }, 'sale ' + UI.fmt(pv.r || 0, 3) + ' L/min');
      add('text', { x: 260, y: 70, class: 'ann', 'font-size': 14, 'text-anchor': 'middle' }, UI.fmt(conc, 3) + ' g/L');
      scene.appendChild(s);
    }

    function draw(stuPts, kind) {
      var num = LabMath.ode.numeric(math, cur, over);
      var B = box(num, stuPts);
      var plot = window.LabPlot(svg, B);
      plot.clear().grid().axes();
      drawField(plot, B);
      polyPath(plot, num, 'ref', 4);
      if (stuPts) polyPath(plot, stuPts, kind === 'ok' ? 'trace' : 'student', 3, kind === 'ok' ? '8 7' : null);
      icDots(plot);
      drawScene(num, stuPts, kind);
      return { plot: plot, B: B, num: num };
    }

    function readSrc(field) {
      field = field || yIn;
      var tex = field.latex ? field.latex() : '';
      if (!tex || !window.CBLatex) return field.get();
      return LabMath.ode.fromLatex(window.CBLatex.toMath, tex, cur);
    }

    // ¿Eligió el método correcto? (S08). Se agrega como una nota al veredicto.
    function methodNote() {
      if (!cur.methods) return;
      var i = +methodSel.input.value;
      var p = h('p', { class: 'verdict__note' });
      if (i < 0) p.textContent = 'Elige también qué método usarías.';
      else if ((cur.method || []).indexOf(i) >= 0) p.textContent = 'Método: «' + cur.methods[i] + '» funciona aquí. ' + (cur.methodWhy || '');
      else p.textContent = 'Método: «' + cur.methods[i] + '» no es el camino. ' + (cur.methodWhy || '');
      verdict.hidden = false;
      verdict.appendChild(p);
    }

    function check() {
      if (!math || !cur) return;
      if (cur.kind === 'exact') { checkExact(); methodNote(); return; }
      if (cur.kind === 'pair') { checkPair(); return; }
      checkPvi();
      methodNote();
    }

    function checkPvi() {
      var src;
      try { src = readSrc() || (pristine ? startSample : ''); } catch (e) { UI.verdict(verdict, 'bad', 'Completa tu solución', e.message); return; }
      var M = msgs(cur);
      setLegend((cur.field ? [['aux', 'campo de pendientes']] : []).concat([['ref', 'solución numérica del PVI'], ['student', 'tu solución']]));
      title.textContent = 'Tu curva contra la numérica';
      rTitle.textContent = 'Residuo r = (lado izquierdo) − (lado derecho) al sustituir tu solución';
      facts.innerHTML = '';
      if (!src) { verdict.hidden = true; draw(null); drawResidual(null); return; }
      var r = LabMath.ode.verify(math, cur, src, over);
      if (r.kind === 'invalid') {
        var t = M[r.reason] || M.parse;
        var body = r.reason === 'symbols' ? 'Tu fórmula usa ' + r.symbols.join(', ') + ', que no existe en este problema. Si es una constante, despéjala con la condición inicial y escribe su valor.' : (r.msg || t[1]);
        UI.verdict(verdict, 'bad', t[0], body);
        draw(null); drawResidual(null);
        return;
      }
      var stu = sampleStudent(src);
      draw(stu, r.kind);
      drawResidual(r, r.kind);
      var msg = M[r.reason] || M.residual;
      var extra = r.reason === 'ic' ? ' Tu ' + (cur.dv || 'y') + '(' + UI.fmt(cur.x0, 4) + ') da ' + UI.fmt(r.y0[0], 4) + '.' : '';
      UI.verdict(verdict, r.kind, msg[0], msg[1] + extra);
      var pv = LabMath.ode.paramValues(cur, over), ics = LabMath.ode.icsOf(math, cur, pv), y = cur.dv || 'y';
      [['máx |r| en el dominio', UI.fmt(r.maxAbs, 3)]]
        .concat(ics.map(function (c, k) { return [y + PRIME[k] + '(' + UI.fmt(cur.x0, 4) + '): pide · tuya', UI.fmt(c, 4) + ' · ' + UI.fmt(r.y0 ? r.y0[k] : NaN, 4)]; }))
        .forEach(function (row) { facts.appendChild(h('dt', {}, [row[0]])); facts.appendChild(h('dd', {}, [row[1]])); });
    }

    /* ---------- Exactas (S06–S07) ---------- */
    var EXACT_MSG = {
      correct: ['F es una función potencial', '∂F/∂x = M y ∂F/∂y = N en todo el cuadro. Las curvas F(x, y) = C son las soluciones: la que pasa por el punto inicial cae encima de la numérica.'],
      sign: ['Casi: es −F', 'Tus curvas de nivel son las mismas, pero ∂F/∂x da −M. Revisa el signo al integrar.'],
      missingH: ['Casi: falta la parte que solo depende de y', '∂F/∂x = M ya cuadra, pero ∂F/∂y no da N. Después de integrar M respecto a x, deriva respecto a y, compara con N y agrega la h(y) que falta.'],
      residual: ['No es función potencial', '∂F/∂x no da M. Integra M respecto a x (con y fija) y vuelve a intentar.'],
      muOk: ['Con ese μ la ecuación es exacta', 'Después de multiplicar, ∂(μM)/∂y = ∂(μN)/∂x en todo el cuadro. Ya puedes buscar F como en la sesión 6.'],
      notExact: ['Con ese μ todavía no es exacta', 'Después de multiplicar, ∂(μM)/∂y y ∂(μN)/∂x siguen siendo distintas. Revisa si (M_y − N_x)/N depende solo de x o (N_x − M_y)/M solo de y.'],
      domain: ['No pude evaluar tu expresión', 'Casi ningún punto del cuadro da un número. Revisa paréntesis, raíces y logaritmos.']
    };
    function exactBox() { return { x: cur.domain.slice(), y: (cur.yRange || [cur.ics[0] - 2, cur.ics[0] + 2]).slice() }; }
    function checkExact() {
      var src;
      try { src = readSrc() || (pristine ? startSample : ''); } catch (e) { UI.verdict(verdict, 'bad', 'Completa tu respuesta', e.message); return; }
      var B = exactBox(), plot = window.LabPlot(svg, B);
      plot.clear().grid().axes();
      var num = LabMath.ode.numeric(math, cur, over);
      polyPath(plot, num, 'ref', 4);
      plot.point(cur.x0, cur.ics[0], 'dot-ref', 6);
      scene.hidden = true; facts.innerHTML = '';
      var isMu = cur.ask === 'mu';
      title.textContent = isMu ? 'La solución y la prueba de exactitud' : 'Tus curvas F(x, y) = C contra la solución';
      setLegend(isMu ? [['ref', 'solución numérica']] : [['aux', 'otras curvas F = C'], ['ref', 'solución numérica'], ['student', 'tu curva por el punto inicial']]);
      rTitle.textContent = isMu ? 'M_y − N_x a lo largo de la solución: antes (punteada) y después de multiplicar por tu μ' : 'A lo largo de la solución: ∂F/∂x − M (punteada) y ∂F/∂y − N (sólida). Las dos deben ser cero.';
      rsvg.innerHTML = '';
      if (!src) { verdict.hidden = true; return; }
      var r = LabMath.ode.verifyExact(math, cur, src);
      if (r.kind === 'invalid') {
        var body = r.reason === 'symbols' ? 'Tu fórmula usa ' + r.symbols.join(', ') + ', que no existe aquí. Usa solo x y y (sin la constante C).' : (r.msg || 'Escribe tu expresión en x y y.');
        UI.verdict(verdict, 'bad', 'Revisa tu expresión', body);
        return;
      }
      var key = isMu ? (r.reason === 'correct' ? 'muOk' : r.reason) : r.reason;
      var msg = EXACT_MSG[key] || EXACT_MSG.residual;
      UI.verdict(verdict, r.kind, msg[0], msg[1]);
      var code = math.parse(LabMath.core.prep(src)).compile();
      var F = function (x, y) { try { var v = code.evaluate({ x: x, y: y }); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; } };
      if (!isMu) {
        var c0 = F(cur.x0, cur.ics[0]);
        if (isFinite(c0)) {
          var span = Math.abs(c0) + 1;
          [-0.6, -0.3, 0.3, 0.6].forEach(function (k) { plot.segments(LabMath.ode.contour(F, B, c0 + k * span), 'aux', 1.4); });
          plot.segments(LabMath.ode.contour(F, B, c0), r.kind === 'ok' ? 'trace' : 'student', 3);
        }
        facts.appendChild(h('dt', {}, ['máx |∂F/∂x − M| relativo'])); facts.appendChild(h('dd', {}, [UI.fmt(r.ex, 3)]));
        facts.appendChild(h('dt', {}, ['máx |∂F/∂y − N| relativo'])); facts.appendChild(h('dd', {}, [UI.fmt(r.ey, 3)]));
      } else {
        facts.appendChild(h('dt', {}, ['máx |M_y − N_x| sin μ'])); facts.appendChild(h('dd', {}, [UI.fmt(r.before, 3)]));
        facts.appendChild(h('dt', {}, ['máx |(μM)_y − (μN)_x| con tu μ'])); facts.appendChild(h('dd', {}, [UI.fmt(r.gap, 3)]));
      }
      drawExactPanel(num, src, isMu, r.kind);
    }
    // Panel de abajo: la diferencia que debe ser cero, evaluada en los puntos de la solución numérica.
    function drawExactPanel(num, src, isMu, kind) {
      var mu = cur.mu ? '(' + cur.mu + ')*' : '';
      function d2(expr, v) { return math.derivative(LabMath.core.prep(expr), v).compile(); }
      function ev(c, x, y) { try { var v = c.evaluate({ x: x, y: y }); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; } }
      var A, Bc, A0, B0;
      if (isMu) {
        A = d2('(' + src + ')*(' + cur.M + ')', 'y'); Bc = d2('(' + src + ')*(' + cur.N + ')', 'x');
        A0 = d2(cur.M, 'y'); B0 = d2(cur.N, 'x');
      } else {
        // Punteada: ∂F/∂x − μM; sólida: ∂F/∂y − μN (la que delata la h(y) que falta).
        A0 = d2(src, 'x'); B0 = math.parse(LabMath.core.prep(mu + '(' + cur.M + ')')).compile();
        A = d2(src, 'y'); Bc = math.parse(LabMath.core.prep(mu + '(' + cur.N + ')')).compile();
      }
      var after = num.map(function (p) { return [p[0], ev(A, p[0], p[1]) - ev(Bc, p[0], p[1])]; });
      var before = num.map(function (p) { return [p[0], ev(A0, p[0], p[1]) - ev(B0, p[0], p[1])]; });
      var m = 0; after.concat(before || []).forEach(function (p) { if (isFinite(p[1])) m = Math.max(m, Math.abs(p[1])); });
      var tiny = m < 1e-9, M = tiny ? 1 : m * 1.15;
      var plot = window.LabPlot(rsvg, { x: cur.domain.slice(), y: [-M, M] });
      plot.clear().grid().axes();
      Array.prototype.slice.call(rsvg.querySelectorAll('text.lab-tick[text-anchor="end"]')).forEach(function (t) { t.remove(); });
      function path(pts, cls, dash) {
        var d = '', pen = false;
        pts.forEach(function (p) { if (!isFinite(p[1])) { pen = false; return; } d += (pen ? 'L' : 'M') + plot.X(p[0]).toFixed(1) + ' ' + plot.Y(p[1]).toFixed(1); pen = true; });
        if (!d || !UI.svgOk({ d: d })) return;
        var n = document.createElementNS(NS, 'path');
        n.setAttribute('d', d); n.setAttribute('class', cls); n.setAttribute('fill', 'none'); n.setAttribute('stroke-width', '3');
        if (dash) n.setAttribute('stroke-dasharray', dash);
        rsvg.querySelector('g.sketch').appendChild(n);
      }
      if (before) path(before, 'aux', '6 6');
      path(after, kind === 'ok' ? 'trace' : 'error');
      plot.label(cur.domain[1], M, kind === 'ok' ? 'cero en toda la curva' : 'escala ±' + UI.fmt(M, 2), 'end', 15, -6, 4);
    }

    /* ---------- Wronskiano (S09) ---------- */
    var PAIR_MSG = {
      correct: ['Son un conjunto fundamental', 'Las dos son solución y el Wronskiano no es cero: toda solución es c₁y₁ + c₂y₂.'],
      dependent: ['Casi: son solución, pero linealmente dependientes', 'W(x) = 0 en todo el dominio: una es múltiplo de la otra, así que no forman un conjunto fundamental.'],
      notSolution1: ['y₁ no es solución', 'Al sustituir y₁ en la ecuación no da cero. Deriva dos veces y revisa.'],
      notSolution2: ['y₂ no es solución', 'Al sustituir y₂ en la ecuación no da cero. Deriva dos veces y revisa.'],
      domain: ['No pude evaluar tus funciones', 'Revisa paréntesis, raíces y logaritmos.']
    };
    function checkPair() {
      var s1, s2;
      try { s1 = readSrc(yIn) || (pristine ? startSample[0] : ''); s2 = readSrc(y2In) || (pristine ? startSample[1] : ''); }
      catch (e) { UI.verdict(verdict, 'bad', 'Completa tus funciones', e.message); return; }
      title.textContent = 'Tus dos soluciones';
      setLegend([['student', 'y₁'], ['trace', 'y₂']]);
      rTitle.textContent = 'Wronskiano W(x) = y₁y₂′ − y₁′y₂';
      scene.hidden = true; facts.innerHTML = ''; rsvg.innerHTML = '';
      var r = LabMath.ode.verifyPair(math, cur, s1, s2);
      if (r.kind === 'invalid') {
        UI.verdict(verdict, 'bad', 'Revisa tus funciones', r.reason === 'symbols' ? 'Usan ' + r.symbols.join(', ') + ': escribe funciones solo de x.' : (r.msg || 'Escribe y₁ y y₂.'));
        return;
      }
      var msg = PAIR_MSG[r.reason] || PAIR_MSG.domain;
      UI.verdict(verdict, r.kind, msg[0], msg[1]);
      var a = sampleStudent(s1), b = sampleStudent(s2), ys = [];
      a.concat(b).forEach(function (p) { ys.push(p[1]); });
      var plot = window.LabPlot(svg, { x: cur.domain.slice(), y: cur.yRange || window.LabPlot.range(ys) });
      plot.clear().grid().axes();
      polyPath(plot, a, 'student', 3.5);
      polyPath(plot, b, 'trace', 3.5, '9 6');
      var Wp = r.W.map(function (p) { return [p[0], p[1]]; }), m = 0;
      Wp.forEach(function (p) { if (isFinite(p[1])) m = Math.max(m, Math.abs(p[1])); });
      var M = m < 1e-9 ? 1 : m * 1.15, wp = window.LabPlot(rsvg, { x: cur.domain.slice(), y: [-M, M] });
      wp.clear().grid().axes();
      Array.prototype.slice.call(rsvg.querySelectorAll('text.lab-tick[text-anchor="end"]')).forEach(function (t) { t.remove(); });
      polyPathR(wp, Wp);
      wp.label(cur.domain[1], M, m < 1e-9 ? 'W ≡ 0' : 'escala ±' + UI.fmt(M, 2), 'end', 15, -6, 4);
      var x0 = (cur.domain[0] + cur.domain[1]) / 2, w0 = Wp[Math.floor(Wp.length / 2)][1];
      facts.appendChild(h('dt', {}, ['W en x ≈ ' + UI.fmt(x0, 3)])); facts.appendChild(h('dd', {}, [UI.fmt(w0, 4)]));
    }

    /* ---------- Trazo a mano (S01) ---------- */
    function drawTrace() {
      if (!math || !cur) return;
      setLegend([['aux', 'campo de pendientes'], ['student', 'tu trazo'], ['ref', 'solución numérica desde tu primer punto']]);
      title.textContent = 'Traza siguiendo las pendientes';
      var B = { x: cur.domain.slice(), y: (cur.yRange || window.LabPlot.range(LabMath.ode.numeric(math, cur, over).map(function (p) { return p[1]; }))).slice() };
      var plot = window.LabPlot(svg, B);
      plot.clear().grid().axes();
      drawField(plot, B);
      facts.innerHTML = '';
      scene.hidden = true;
      if (tracePts.length >= 2) {
        var t = LabMath.ode.traceError(math, cur, tracePts, B, over);
        polyPath(plot, t.ref, 'ref', 4);
        polyPath(plot, tracePts, 'student', 3);
        var pct = Math.round(t.err * 100);
        var kind = t.err <= 0.06 ? 'ok' : t.err <= 0.15 ? 'warn' : 'bad';
        UI.verdict(verdict, kind, kind === 'ok' ? 'Tu trazo sigue la solución' : kind === 'warn' ? 'Casi: te vas separando' : 'Tu trazo se aleja de la solución',
          'La mayor distancia entre tu trazo y la solución numérica es ' + pct + ' % de la altura de la gráfica. ' + (kind === 'ok' ? 'Así se lee una solución en el campo: cada punto sigue la rayita que tiene enfrente.' : 'Sigue la dirección de las rayitas: la curva nunca las cruza, se pega a ellas.'));
        facts.appendChild(h('dt', {}, ['puntos marcados'])); facts.appendChild(h('dd', {}, [String(tracePts.length)]));
      } else verdict.hidden = true;
      tracePts.forEach(function (p) { plot.point(p[0], p[1], 'dot-student', 4); });
      svg._plot = plot;
    }
    svg.addEventListener('click', function (e) {
      if (mode !== 'trace' || !svg._plot) return;
      var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
      var px = (e.clientX - r.left) * vb.width / r.width, py = (e.clientY - r.top) * vb.height / r.height;
      var p = svg._plot, x = p.xr[0] + (px - p.X(p.xr[0])) / (p.X(p.xr[1]) - p.X(p.xr[0])) * (p.xr[1] - p.xr[0]);
      var y = p.yr[0] + (py - p.Y(p.yr[0])) / (p.Y(p.yr[1]) - p.Y(p.yr[0])) * (p.yr[1] - p.yr[0]);
      if (!isFinite(x) || !isFinite(y) || x < p.xr[0] || x > p.xr[1] || y < p.yr[0] || y > p.yr[1]) return;
      tracePts.push([x, y]);
      // El primer punto (el de más a la izquierda) hace de condición inicial.
      tracePts.sort(function (a, b) { return a[0] - b[0]; });
      drawTrace();
    });

    if (cur) setProblem(cur);
    probSel.input.value = String(list.indexOf(cur));
    document.addEventListener('cb:themechange', function () { if (mode === 'trace') drawTrace(); else check(); });
    return UI.loadMath().then(function (m) { math = m; if (mode === 'trace') drawTrace(); else check(); }).catch(function () {});
  };
})();
