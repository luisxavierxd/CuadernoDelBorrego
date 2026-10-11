/* =====================================================================
   Lab lagrange-one (Cálculo 2 · S09): la restricción toca una curva de
   nivel (∇f ∥ ∇g). Mapa de contorno de f con la restricción g = c; un punto
   que se mueve sobre la restricción con ∇f, ∇g y el ángulo entre ellos; la
   gráfica de f a lo largo de la restricción. Reto: el valor máximo (o
   mínimo) de f y, si quieres, el punto. Se compara contra una búsqueda
   densa sobre la restricción parametrizada y se dan los «casi»: punto
   crítico libre, el otro extremo, un candidato olvidado (el de x = 0) o λ.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  var TAU = 2 * Math.PI;
  function prep(s) { return window.LabMath.core.prep(s); }
  function n2(v) { return v < 0 ? '(' + v + ')' : String(v); }

  // Compila un nodo de math.js como función de (x, y[, z]); fuera de dominio → NaN.
  function ev(node, vars) {
    var code = node.compile();
    vars = vars || ['x', 'y'];
    return function () {
      var s = {};
      for (var i = 0; i < vars.length; i++) s[vars[i]] = arguments[i];
      try { var v = code.evaluate(s); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; }
    };
  }
  // f con sus primeras y segundas parciales (math.derivative).
  function pack(math, src, vars) {
    vars = vars || ['x', 'y'];
    var node = math.parse(prep(src)), o = { src: src, f: ev(node, vars), d: {}, dd: {} };
    vars.forEach(function (a) {
      var da = math.derivative(node, a);
      o.d[a] = ev(da, vars);
      vars.forEach(function (b) { o.dd[a + b] = ev(math.derivative(da, b), vars); });
    });
    return o;
  }

  // Restricción g(x, y) = c con su parametrización. spec = { kind, a, b, c, t? }.
  //  circle    x² + y² = c          (√c cos t, √c sin t), t ∈ [0, 2π]
  //  ellipse   x²/a² + y²/b² = c    (a√c cos t, b√c sin t)
  //  line      a x + b y = c        (t, (c − a t)/b); por omisión el tramo con x, y ≥ 0
  //  hyperbola x y = c (c > 0)      (√c eˢ, √c e⁻ˢ), la rama con x > 0
  //  parabola  y − a x² = c         (t, a t² + c)
  function constraint(spec) {
    var k = spec.kind, c = spec.c, a = spec.a, b = spec.b, o = { kind: k, c: c, spec: spec, closed: false };
    var R = Math.sqrt(Math.abs(c));
    if (k === 'circle') {
      o.g = 'x^2 + y^2'; o.closed = true; o.t = [0, TAU];
      o.at = function (t) { return [R * Math.cos(t), R * Math.sin(t)]; };
      o.dat = function (t) { return [-R * Math.sin(t), R * Math.cos(t)]; };
      o.tOf = function (x, y) { var t = Math.atan2(y, x); return t < 0 ? t + TAU : t; };
      o.text = 'x² + y² = ' + num(c);
      o.par = 'x = ' + num(R, 3) + ' cos t, y = ' + num(R, 3) + ' sen t';
    } else if (k === 'ellipse') {
      o.g = 'x^2/' + (a * a) + ' + y^2/' + (b * b); o.closed = true; o.t = [0, TAU];
      o.at = function (t) { return [a * R * Math.cos(t), b * R * Math.sin(t)]; };
      o.dat = function (t) { return [-a * R * Math.sin(t), b * R * Math.cos(t)]; };
      o.tOf = function (x, y) { var t = Math.atan2(y / b, x / a); return t < 0 ? t + TAU : t; };
      o.text = 'x²/' + num(a * a) + ' + y²/' + num(b * b) + ' = ' + num(c);
      o.par = 'x = ' + num(a * R, 3) + ' cos t, y = ' + num(b * R, 3) + ' sen t';
    } else if (k === 'line') {
      o.g = a + '*x + ' + n2(b) + '*y';
      o.t = spec.t ? spec.t.slice() : [0, c / a];
      o.at = function (t) { return [t, (c - a * t) / b]; };
      o.dat = function () { return [1, -a / b]; };
      o.tOf = function (x) { return x; };
      o.text = (a === 1 ? '' : num(a)) + 'x + ' + (b === 1 ? '' : num(b)) + 'y = ' + num(c);
      o.par = 'x = t, y = (' + num(c) + ' − ' + (a === 1 ? '' : num(a)) + 't)/' + num(b);
    } else if (k === 'hyperbola') {
      o.g = 'x*y';
      o.t = spec.t ? spec.t.slice() : [-1.5, 1.5];
      o.at = function (s) { return [R * Math.exp(s), R * Math.exp(-s)]; };
      o.dat = function (s) { return [R * Math.exp(s), -R * Math.exp(-s)]; };
      o.tOf = function (x) { return x > 0 ? Math.log(x / R) : NaN; };
      o.text = 'xy = ' + num(c);
      o.par = 'x = ' + num(R, 3) + 'eᵗ, y = ' + num(R, 3) + 'e⁻ᵗ';
    } else if (k === 'parabola') {
      o.g = 'y - ' + n2(a) + '*x^2';
      o.t = spec.t ? spec.t.slice() : [-2.5, 2.5];
      o.at = function (t) { return [t, a * t * t + c]; };
      o.dat = function (t) { return [1, 2 * a * t]; };
      o.tOf = function (x) { return x; };
      o.text = 'y = ' + (a === 1 ? '' : num(a)) + 'x²' + (c ? (c < 0 ? ' − ' + num(-c) : ' + ' + num(c)) : '');
      o.par = 'x = t, y = ' + (a === 1 ? '' : num(a)) + 't²' + (c ? (c < 0 ? ' − ' + num(-c) : ' + ' + num(c)) : '');
    } else throw new Error('Restricción desconocida: ' + k);
    o.inRange = function (x, y) {
      if (o.closed) return true;
      var t = o.tOf(x, y);
      return isFinite(t) && t >= o.t[0] - 1e-7 && t <= o.t[1] + 1e-7;
    };
    return o;
  }
  function num(v, d) {
    if (!isFinite(v)) return '—';
    if (Math.abs(v) < 1e-12) return '0';
    return Number(v.toPrecision(d || 4)).toString().replace('-', '−');
  }

  // Problema: f con sus derivadas y la restricción con g y sus derivadas.
  function problem(math, fSrc, spec) {
    var C = constraint(spec), F = pack(math, fSrc), G = pack(math, C.g);
    return {
      C: C, fSrc: fSrc, c: C.c, spec: spec,
      f: F.f, fx: F.d.x, fy: F.d.y, fxx: F.dd.xx, fxy: F.dd.xy, fyy: F.dd.yy,
      g: G.f, gx: G.d.x, gy: G.d.y, gxx: G.dd.xx, gxy: G.dd.xy, gyy: G.dd.yy
    };
  }
  // f a lo largo de la restricción, φ(t) = f(x(t), y(t)), y su derivada φ′(t) = ∇f · r′(t).
  function phi(P, t) { var p = P.C.at(t); return P.f(p[0], p[1]); }
  function dphi(P, t) { var p = P.C.at(t), d = P.C.dat(t); return P.fx(p[0], p[1]) * d[0] + P.fy(p[0], p[1]) * d[1]; }

  // Refina un extremo local de φ en [a, b]: bisección sobre φ′ si cambia de signo; si no, sección dorada.
  function refine(P, a, b, kind) {
    var da = dphi(P, a), db = dphi(P, b), i;
    if (isFinite(da) && isFinite(db) && da * db < 0) {
      for (i = 0; i < 200 && b - a > 1e-15 * (1 + Math.abs(a)); i++) {
        var m = (a + b) / 2, dm = dphi(P, m);
        if (!isFinite(dm)) break;
        if (dm * da > 0) { a = m; da = dm; } else b = m;
      }
      return (a + b) / 2;
    }
    var sg = kind === 'max' ? -1 : 1, r = (Math.sqrt(5) - 1) / 2, x1 = b - r * (b - a), x2 = a + r * (b - a);
    var f1 = sg * phi(P, x1), f2 = sg * phi(P, x2);
    for (i = 0; i < 200 && b - a > 1e-14 * (1 + Math.abs(a)); i++) {
      if (f1 < f2) { b = x2; x2 = x1; f2 = f1; x1 = b - r * (b - a); f1 = sg * phi(P, x1); }
      else { a = x1; x1 = x2; f1 = f2; x2 = a + r * (b - a); f2 = sg * phi(P, x2); }
    }
    return (a + b) / 2;
  }
  function ptAt(P, t, kind, end) {
    var p = P.C.at(t), tt = t;
    if (P.C.closed) { tt = t % TAU; if (tt < 0) tt += TAU; }
    return { t: tt, x: p[0], y: p[1], f: P.f(p[0], p[1]), kind: kind, end: !!end };
  }
  // Búsqueda densa sobre la restricción parametrizada (el oráculo): n muestras, cada extremo local
  // se refina; en curvas abiertas los dos extremos del tramo también son candidatos.
  function extremes(P, n) {
    n = n || 2000;
    var t0 = P.C.t[0], t1 = P.C.t[1], dt = (t1 - t0) / n, vs = [], i, out = [];
    for (i = 0; i <= n; i++) vs.push(phi(P, t0 + dt * i));
    var closed = P.C.closed, last = closed ? n - 1 : n;
    function v(i) { if (closed) i = ((i % n) + n) % n; return vs[i]; }
    for (i = closed ? 0 : 1; i <= (closed ? n - 1 : n - 1); i++) {
      var a = v(i - 1), m = v(i), b = v(i + 1);
      if (!(isFinite(a) && isFinite(m) && isFinite(b))) continue;
      var t = t0 + dt * i;
      if (m >= a && m > b) out.push(ptAt(P, refine(P, t - dt, t + dt, 'max'), 'max'));
      else if (m <= a && m < b) out.push(ptAt(P, refine(P, t - dt, t + dt, 'min'), 'min'));
    }
    var ends = [];
    if (!closed) {
      [[0, 1], [last, last - 1]].forEach(function (e) {
        var m = vs[e[0]], nb = vs[e[1]];
        if (isFinite(m) && isFinite(nb)) ends.push(ptAt(P, t0 + dt * e[0], m >= nb ? 'max' : 'min', true));
      });
    }
    var all = out.concat(ends), max = null, min = null;
    all.forEach(function (p) {
      if (!isFinite(p.f)) return;
      if (!max || p.f > max.f) max = p;
      if (!min || p.f < min.f) min = p;
    });
    return { max: max, min: min, local: out, ends: ends, samples: vs, t0: t0, dt: dt, n: n };
  }

  function lambdaAt(P, x, y) {
    var gx = P.gx(x, y), gy = P.gy(x, y);
    return (P.fx(x, y) * gx + P.fy(x, y) * gy) / (gx * gx + gy * gy);
  }
  // Ángulo entre ∇f y ∇g (grados) y su «producto cruz» fx gy − fy gx (0 cuando son paralelos).
  function angle(P, x, y) {
    var fx = P.fx(x, y), fy = P.fy(x, y), gx = P.gx(x, y), gy = P.gy(x, y);
    var nf = Math.hypot(fx, fy), ng = Math.hypot(gx, gy), cr = fx * gy - fy * gx;
    var deg = nf > 1e-12 && ng > 1e-12 ? Math.atan2(Math.abs(cr), fx * gx + fy * gy) * 180 / Math.PI : NaN;
    return { deg: deg, cross: cr, nf: nf, ng: ng, grad: [fx, fy], gradG: [gx, gy] };
  }

  // Sistema lineal A x = b por eliminación con pivoteo (A y b se copian).
  function linsolve(A, b) {
    var n = b.length, M = A.map(function (r, i) { return r.concat([b[i]]); }), i, j, k;
    for (i = 0; i < n; i++) {
      var p = i;
      for (k = i + 1; k < n; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k;
      if (!(Math.abs(M[p][i]) > 1e-300)) return null;
      var tmp = M[i]; M[i] = M[p]; M[p] = tmp;
      for (k = i + 1; k < n; k++) { var q = M[k][i] / M[i][i]; for (j = i; j <= n; j++) M[k][j] -= q * M[i][j]; }
    }
    var x = new Array(n);
    for (i = n - 1; i >= 0; i--) { var s = M[i][n]; for (j = i + 1; j < n; j++) s -= M[i][j] * x[j]; x[i] = s / M[i][i]; }
    return x.every(isFinite) ? x : null;
  }
  // Newton amortiguado para R(u) = 0 con jacobiano J(u). Devuelve { u, ok, res }.
  function newtonN(R, J, u, iters) {
    var r = R(u), nr = Math.hypot.apply(null, r);
    for (var it = 0; it < (iters || 80) && isFinite(nr); it++) {
      var d = linsolve(J(u), r.map(function (v) { return -v; }));
      if (!d) break;
      var s = 1, un, rn, nn;
      for (var h = 0; h < 12; h++) {
        un = u.map(function (v, i) { return v + s * d[i]; }); rn = R(un); nn = Math.hypot.apply(null, rn);
        if (isFinite(nn) && nn <= nr * (1 - 1e-4 * s) + 1e-300) break;
        s /= 2;
      }
      if (!isFinite(nn)) break;
      var step = s * Math.hypot.apply(null, d);
      u = un; r = rn; nr = nn;
      if (step < 1e-14 * (1 + Math.hypot.apply(null, u))) break;
    }
    return { u: u, ok: isFinite(nr) && nr < 1e-9, res: nr };
  }
  // Sistema de Lagrange: fx = λ gx, fy = λ gy, g = c, con Newton desde (x, y, λ).
  function newton(P, x, y, l) {
    var R = function (u) { return [P.fx(u[0], u[1]) - u[2] * P.gx(u[0], u[1]), P.fy(u[0], u[1]) - u[2] * P.gy(u[0], u[1]), P.g(u[0], u[1]) - P.c]; };
    var J = function (u) {
      var X = u[0], Y = u[1], L = u[2], hxy = P.fxy(X, Y) - L * P.gxy(X, Y);
      return [[P.fxx(X, Y) - L * P.gxx(X, Y), hxy, -P.gx(X, Y)], [hxy, P.fyy(X, Y) - L * P.gyy(X, Y), -P.gy(X, Y)], [P.gx(X, Y), P.gy(X, Y), 0]];
    };
    var r = newtonN(R, J, [x, y, isFinite(l) ? l : 0]);
    return { x: r.u[0], y: r.u[1], lambda: r.u[2], ok: r.ok, res: r.res };
  }
  function dedup(list, key) {
    var out = [];
    list.forEach(function (p) {
      if (!out.some(function (q) { return Math.hypot(p.x - q.x, p.y - q.y) < 1e-6 * (1 + Math.hypot(q.x, q.y)) && (!key || p[key] === q[key]); })) out.push(p);
    });
    return out;
  }
  // Todos los candidatos de Lagrange (sobre el tramo parametrizado), con Newton desde varios arranques.
  function solve(P, starts) {
    starts = starts || 40;
    var t0 = P.C.t[0], t1 = P.C.t[1], found = [];
    for (var k = 0; k < starts; k++) {
      var p = P.C.at(t0 + (t1 - t0) * (k + 0.5) / starts), r = newton(P, p[0], p[1], lambdaAt(P, p[0], p[1]));
      if (r.ok && P.C.inRange(r.x, r.y)) found.push({ x: r.x, y: r.y, lambda: r.lambda, f: P.f(r.x, r.y), t: P.C.tOf(r.x, r.y) });
    }
    return dedup(found).sort(function (a, b) { return b.f - a.f; });
  }

  // Criterio de la segunda derivada: D = fxx fyy − fxy².
  function classify(fxx, fxy, fyy) {
    var D = fxx * fyy - fxy * fxy, s = 1e-10 * (1 + Math.abs(fxx * fyy) + fxy * fxy);
    return { D: D, kind: Math.abs(D) <= s ? 'none' : D < 0 ? 'saddle' : fxx > 0 ? 'min' : 'max' };
  }
  // Puntos críticos libres (∇f = 0) en la caja [x0, x1, y0, y1], con Newton desde una malla.
  function freeOf(F, box, g, c) {
    var out = [], m = 9;
    for (var i = 0; i < m; i++) for (var j = 0; j < m; j++) {
      var x = box[0] + (box[1] - box[0]) * (i + 0.5) / m, y = box[2] + (box[3] - box[2]) * (j + 0.5) / m;
      var r = newtonN(function (u) { return [F.fx(u[0], u[1]), F.fy(u[0], u[1])]; },
        function (u) { var h = F.fxy(u[0], u[1]); return [[F.fxx(u[0], u[1]), h], [h, F.fyy(u[0], u[1])]]; }, [x, y], 60);
      if (!r.ok) continue;
      var X = r.u[0], Y = r.u[1], wx = 0.05 * (box[1] - box[0]), wy = 0.05 * (box[3] - box[2]);
      if (X < box[0] - wx || X > box[1] + wx || Y < box[2] - wy || Y > box[3] + wy) continue;
      var cl = classify(F.fxx(X, Y), F.fxy(X, Y), F.fyy(X, Y));
      out.push({ x: X, y: Y, f: F.f(X, Y), D: cl.D, kind: cl.kind, onCurve: g ? Math.abs(g(X, Y) - c) < 1e-7 * (1 + Math.abs(c)) : false });
    }
    return dedup(out).sort(function (a, b) { return a.x - b.x || a.y - b.y; });
  }
  function free(P, box) {
    return freeOf({ f: P.f, fx: P.fx, fy: P.fy, fxx: P.fxx, fxy: P.fxy, fyy: P.fyy }, box, P.g, P.c);
  }
  // Para los ejemplos: puntos críticos de f en una caja, ordenados por x y luego por y.
  function critical(math, src, box) {
    var F = pack(math, src);
    var pts = freeOf({ f: F.f, fx: F.d.x, fy: F.d.y, fxx: F.dd.xx, fxy: F.dd.xy, fyy: F.dd.yy }, box || [-5, 5, -5, 5]);
    return { n: pts.length, pts: pts };
  }

  // Óptimo con una restricción por búsqueda densa (el oráculo de los ejercicios).
  function optimum(math, fSrc, spec, n) {
    var P = problem(math, fSrc, spec), E = extremes(P, n || 4000);
    return {
      max: E.max.f, min: E.min.f, xMax: E.max.x, yMax: E.max.y, xMin: E.min.x, yMin: E.min.y,
      endMax: E.max.end, endMin: E.min.end,
      lambdaMax: lambdaAt(P, E.max.x, E.max.y), lambdaMin: lambdaAt(P, E.min.x, E.min.y)
    };
  }
  // λ por diferencias finitas: cuánto cambia el óptimo si la restricción pasa de c a c ± h.
  function lambdaFD(math, fSrc, spec, which, h) {
    h = h || 1e-4 * Math.max(1, Math.abs(spec.c));
    var up = optimum(math, fSrc, Object.assign({}, spec, { c: spec.c + h }))[which || 'max'];
    var dn = optimum(math, fSrc, Object.assign({}, spec, { c: spec.c - h }))[which || 'max'];
    return (up - dn) / (2 * h);
  }

  // Tres variables y una restricción: ∇f = λ∇g, g = c (4 ecuaciones) con Newton desde start = [x, y, z, λ].
  function newton3(math, fSrc, gSrc, c, start) {
    var V = ['x', 'y', 'z'], F = pack(math, fSrc, V), G = pack(math, gSrc, V);
    var R = function (u) {
      var r = V.map(function (a) { return F.d[a](u[0], u[1], u[2]) - u[3] * G.d[a](u[0], u[1], u[2]); });
      return r.concat([G.f(u[0], u[1], u[2]) - c]);
    };
    var J = function (u) {
      var rows = V.map(function (a) {
        return V.map(function (b) { return F.dd[a + b](u[0], u[1], u[2]) - u[3] * G.dd[a + b](u[0], u[1], u[2]); }).concat([-G.d[a](u[0], u[1], u[2])]);
      });
      return rows.concat([V.map(function (a) { return G.d[a](u[0], u[1], u[2]); }).concat([0])]);
    };
    var r = newtonN(R, J, start.slice());
    return { x: r.u[0], y: r.u[1], z: r.u[2], lambda: r.u[3], f: F.f(r.u[0], r.u[1], r.u[2]), ok: r.ok };
  }

  /* ---------- Reto: diagnóstico del alumno ---------- */
  // Holgura de los ejercicios: ±0.01 (o ±1 %) desde 0.1; abajo, ±1 % o 0.0005.
  function near(s, t) {
    var d = Math.abs(s - t), at = Math.abs(t);
    if (at >= 0.1) return d <= Math.max(0.01, 0.01 * at) + 1e-9;
    return d <= Math.max(0.01 * at, 5e-4) + 1e-12;
  }
  function context(P, box) {
    var E = extremes(P, 2000), cands = solve(P);
    return {
      P: P, E: E, cands: cands,
      free: free(P, box).filter(function (p) { return !p.onCurve; }),
      lam: { max: lambdaAt(P, E.max.x, E.max.y), min: lambdaAt(P, E.min.x, E.min.y) }
    };
  }
  // Puntos donde se alcanza el óptimo (puede haber varios, por simetría).
  function optPoints(ctx, mode) {
    var best = ctx.E[mode], tol = 1e-7 * (1 + Math.abs(best.f));
    return dedup([best].concat(ctx.cands, ctx.E.ends, ctx.E.local).filter(function (p) { return Math.abs(p.f - best.f) <= tol; }));
  }
  function onAxis(pts) { return pts.some(function (p) { return Math.abs(p.x) < 1e-7 || Math.abs(p.y) < 1e-7; }); }
  // Valor del alumno → { kind: ok|warn|bad|invalid, reason, want }.
  // reason: correct · other · free · lambda · missedAxis · missed · mismatch
  function diagnose(s, ctx, mode) {
    var t = ctx.E[mode].f, other = mode === 'max' ? 'min' : 'max';
    if (!isFinite(s)) return { kind: 'invalid', reason: 'number', want: t };
    if (near(s, t)) return { kind: 'ok', reason: 'correct', want: t };
    var opts = optPoints(ctx, mode), cs = [['other', ctx.E[other].f]];
    ctx.free.forEach(function (p) { cs.push(['free', p.f]); });
    cs.push(['lambda', ctx.lam[mode]]);
    ctx.cands.concat(ctx.E.ends).forEach(function (p) { cs.push([onAxis(opts) ? 'missedAxis' : 'missed', p.f]); });
    for (var i = 0; i < cs.length; i++) {
      var v = cs[i][1];
      if (isFinite(v) && !near(v, t) && near(s, v)) return { kind: 'warn', reason: cs[i][0], want: t };
    }
    return { kind: 'bad', reason: 'mismatch', want: t };
  }
  // Punto del alumno → { kind, reason }. reason: correct · offCurve · free · other · missedAxis · missed · mismatch
  function diagnosePoint(px, py, ctx, mode) {
    if (!isFinite(px) || !isFinite(py)) return { kind: 'invalid', reason: 'number' };
    var P = ctx.P, other = mode === 'max' ? 'min' : 'max';
    function at(list) { return list.some(function (p) { return near(px, p.x) && near(py, p.y); }); }
    var opts = optPoints(ctx, mode);
    if (at(opts)) return { kind: 'ok', reason: 'correct' };
    var gap = Math.abs(P.g(px, py) - P.c), ok = gap <= 0.02 * (1 + Math.abs(P.c)) + 0.01 * Math.hypot(P.gx(px, py), P.gy(px, py));
    if (at(ctx.free)) return { kind: 'warn', reason: 'free' };
    if (!ok) return { kind: 'bad', reason: 'offCurve' };
    if (at(optPoints(ctx, other))) return { kind: 'warn', reason: 'other' };
    if (at(ctx.cands.concat(ctx.E.ends))) return { kind: 'warn', reason: onAxis(opts) ? 'missedAxis' : 'missed' };
    return { kind: 'bad', reason: 'mismatch' };
  }

  /* ---------- Curvas de nivel: malla + marching squares ---------- */
  function grid(f, box, n) {
    var xs = [], ys = [], v = [], i, j;
    for (i = 0; i <= n; i++) { xs.push(box[0] + (box[1] - box[0]) * i / n); ys.push(box[2] + (box[3] - box[2]) * i / n); }
    for (j = 0; j <= n; j++) { var row = []; for (i = 0; i <= n; i++) { var z = f(xs[i], ys[j]); row.push(isFinite(z) ? z : NaN); } v.push(row); }
    return { xs: xs, ys: ys, v: v, n: n };
  }
  var TABLE = { 1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 6: [[0, 2]], 7: [[3, 2]], 8: [[2, 3]], 9: [[0, 2]], 11: [[1, 2]], 12: [[1, 3]], 13: [[0, 1]], 14: [[3, 0]] };
  function contour(g, c) {
    var segs = [], xs = g.xs, ys = g.ys, v = g.v;
    for (var j = 0; j < g.n; j++) for (var i = 0; i < g.n; i++) {
      var a = v[j][i] - c, b = v[j][i + 1] - c, cc = v[j + 1][i + 1] - c, d = v[j + 1][i] - c;
      if (!(isFinite(a) && isFinite(b) && isFinite(cc) && isFinite(d))) continue;
      var idx = (a > 0 ? 1 : 0) | (b > 0 ? 2 : 0) | (cc > 0 ? 4 : 0) | (d > 0 ? 8 : 0);
      if (idx === 0 || idx === 15) continue;
      var x0 = xs[i], x1 = xs[i + 1], y0 = ys[j], y1 = ys[j + 1];
      var E = [
        function () { var t = a / (a - b); return [x0 + t * (x1 - x0), y0]; },
        function () { var t = b / (b - cc); return [x1, y0 + t * (y1 - y0)]; },
        function () { var t = cc / (cc - d); return [x1 + t * (x0 - x1), y1]; },
        function () { var t = d / (d - a); return [x0, y1 + t * (y0 - y1)]; }
      ];
      var pairs = TABLE[idx];
      if (idx === 5 || idx === 10) {
        var mid = (a + b + cc + d) / 4 > 0;
        pairs = idx === 5 ? (mid ? [[0, 1], [2, 3]] : [[3, 0], [1, 2]]) : (mid ? [[3, 0], [1, 2]] : [[0, 1], [2, 3]]);
      }
      pairs.forEach(function (p) { segs.push([E[p[0]](), E[p[1]]()]); });
    }
    return segs;
  }
  function niceLevels(lo, hi, target) {
    var raw = (hi - lo) / (target || 10), p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    var s = (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p, out = [];
    for (var c = Math.ceil(lo / s - 1e-9) * s; c <= hi + 1e-9 && out.length < 40; c += s) out.push(+c.toFixed(10));
    return out;
  }

  // Presets del lab (también los usan las pruebas).
  var PRESETS = [
    { name: 'Cerro y camino circular', f: '9 - (x - 1)^2 - (y - 0.5)^2', ftext: 'f = 9 − (x − 1)² − (y − 0.5)²', spec: { kind: 'circle', c: 4 }, cr: [1, 6], ask: ['max', 'min'] },
    { name: 'Círculo: el caso x = 0', f: 'x^2 + 3y^2 - 2y', ftext: 'f = x² + 3y² − 2y', spec: { kind: 'circle', c: 4 }, cr: [1, 6], ask: ['max', 'min'] },
    { name: 'Elipse: f = xy', f: 'x*y', ftext: 'f = xy', spec: { kind: 'ellipse', a: 2, b: 1, c: 1 }, cr: [0.5, 2], ask: ['max', 'min'] },
    { name: 'Recta: el rectángulo junto a la pared', f: 'x*y', ftext: 'f = xy', spec: { kind: 'line', a: 1, b: 2, c: 8 }, cr: [4, 12], ask: ['max'] },
    { name: 'Hipérbola: lo más cerca del origen', f: 'x^2 + y^2', ftext: 'f = x² + y² (distancia²)', spec: { kind: 'hyperbola', c: 4, t: [-1.2, 1.2] }, cr: [1, 8], ask: ['min'] },
    { name: 'Parábola: lo más cerca de (0, 3)', f: 'x^2 + (y - 3)^2', ftext: 'f = x² + (y − 3)² (distancia²)', spec: { kind: 'parabola', a: 1, c: 0, t: [-2.2, 2.2] }, cr: [-1, 1.5], ask: ['min'] }
  ];
  // Ventana del mapa: la caja de la restricción con margen, más los puntos críticos que se pidan.
  function windowOf(C, extra) {
    var xs = [], ys = [], i;
    for (i = 0; i <= 200; i++) { var p = C.at(C.t[0] + (C.t[1] - C.t[0]) * i / 200); xs.push(p[0]); ys.push(p[1]); }
    (extra || []).forEach(function (p) { xs.push(p[0]); ys.push(p[1]); });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var m = 0.2 * Math.max(x1 - x0, y1 - y0, 1);
    return [x0 - m, x1 + m, y0 - m, y1 + m];
  }

  window.LabMath.lagrange = {
    constraint: constraint, problem: problem, phi: phi, dphi: dphi, extremes: extremes, lambdaAt: lambdaAt, angle: angle,
    linsolve: linsolve, newton: newton, solve: solve, classify: classify, free: free, critical: critical,
    optimum: optimum, lambdaFD: lambdaFD, newton3: newton3, near: near, context: context, optPoints: optPoints,
    diagnose: diagnose, diagnosePoint: diagnosePoint, grid: grid, contour: contour, niceLevels: niceLevels,
    windowOf: windowOf, PRESETS: PRESETS
  };

  /* ------------------------------ UI ------------------------------ */
  window.Labs['lagrange-one'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, LM = window.LabMath.lagrange;
    var presets = cfg.presets || PRESETS, start = cfg.start != null ? cfg.start : 0;
    var math = null, pre = presets[start], P = null, ctx = null, box = null, G = null, levels = [], segCache = null;
    var mode = pre.ask[0], student = null, solved = false;

    var preset = UI.select({ label: 'Problema', options: presets.map(function (p) { return p.name; }) });
    var given = h('p', { class: 'lab-given lg-given' });
    var cS = UI.slider({ label: 'c (la restricción es g = c)', min: pre.cr[0], max: pre.cr[1], step: 'any', value: pre.spec.c, fmt: fmtC }, function (v) { cS.set(Math.round(v * 20) / 20); rebuild(); });
    var tS = UI.slider({ label: 'Muévete por la restricción (parámetro t)', min: 0, max: 1, step: 'any', value: 0.3, fmt: fmtC }, function () { draw(); });
    var parNote = h('p', { class: 'lab-note' });
    var showBox = h('input', { type: 'checkbox', id: UI.id('lg-show') });
    var showRow = h('label', { class: 'lg-check', for: showBox.id }, [showBox, ' Mostrar los candidatos de Lagrange y los puntos críticos libres']);
    var modeSel = UI.select({ label: 'Reto', options: ['x'] });
    var ans = UI.input({ label: 'Tu valor', type: 'text', inputmode: 'decimal', mono: false, hint: 'Redondea a 2 decimales.' });
    var pt = UI.rangeField(['x del punto (opcional)', 'y del punto (opcional)'], ['', ''], function () { verify(); });
    var check = UI.button('Comprobar', 'primary', function () { verify(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var map = UI.svg(520, 440, 'Mapa de contorno de f con la restricción g = c, el punto sobre ella y las flechas de ∇f y ∇g');
    var plot = UI.svg(520, 230, 'Valor de f a lo largo de la restricción, contra el parámetro t');
    var facts = h('dl', { class: 'lab-facts lg-facts' });
    var candBox = h('div', { class: 'lg-cands', hidden: true });

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        preset.node, given, cS.node, tS.node, parNote, showRow,
        modeSel.node, ans.node, pt.node, h('div', { class: 'lab-buttons' }, [check]), verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['La restricción toca una curva de nivel']),
        map,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'restricción g = c y ∇g']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'curvas de nivel de f']),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'nivel que pasa por el punto']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), '∇f (las flechas solo marcan dirección)']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu punto'])
        ]),
        h('p', { class: 'lab-stack__label' }, ['f a lo largo de la restricción']),
        plot, facts, candBox
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); verify(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); });
    modeSel.input.addEventListener('change', function () { mode = pre.ask[+modeSel.input.value]; reset(); draw(); });
    showBox.addEventListener('change', function () { draw(); });
    ans.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); verify(); } });

    function fmtC(v) { return (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(2)).toString().replace('-', '−'); }
    function nm(v, d) { return num(v, d || 4); }
    function vec(a) { return '⟨' + nm(a[0], 3) + ', ' + nm(a[1], 3) + '⟩'; }
    function reset() { verdict.hidden = true; solved = false; student = null; }
    function load(i) {
      pre = presets[i];
      cS.input.min = pre.cr[0]; cS.input.max = pre.cr[1]; cS.set(pre.spec.c);
      modeSel.input.innerHTML = '';
      pre.ask.forEach(function (m, k) { modeSel.input.appendChild(h('option', { value: String(k) }, [m === 'max' ? 'Escribe el valor máximo de f' : 'Escribe el valor mínimo de f'])); });
      mode = pre.ask[0];
      ans.input.value = ''; showBox.checked = false;
      Array.prototype.forEach.call(pt.node.querySelectorAll('input'), function (n) { n.value = ''; });
      reset(); rebuild(true);
    }
    // Recalcula el problema con el c actual: restricción, candidatos y curvas de nivel.
    function rebuild(first) {
      if (!math) return;
      var spec = Object.assign({}, pre.spec, { c: cS.get() });
      try { P = LM.problem(math, pre.f, spec); } catch (e) { console.error(e); return; }
      var raw = LM.windowOf(P.C);
      var fr0 = LM.free(P, raw).filter(function (p) { return !p.onCurve; }).map(function (p) { return [p.x, p.y]; });
      box = LM.windowOf(P.C, fr0);
      ctx = LM.context(P, box);
      G = LM.grid(P.f, box, 80);
      var zs = [];
      G.v.forEach(function (r) { r.forEach(function (z) { if (isFinite(z)) zs.push(z); }); });
      zs.sort(function (a, b) { return a - b; });
      levels = zs.length ? LM.niceLevels(zs[Math.floor(zs.length * 0.02)], zs[Math.ceil(zs.length * 0.98) - 1], 11) : [];
      segCache = levels.map(function (L) { return LM.contour(G, L); });
      var t0 = P.C.t[0], t1 = P.C.t[1], frac = first ? 0.3 : (tS.get() - +tS.input.min) / ((+tS.input.max - +tS.input.min) || 1);
      tS.input.min = t0; tS.input.max = t1; tS.set(t0 + (t1 - t0) * Math.max(0, Math.min(1, frac)));
      given.textContent = pre.ftext + ' · restricción: ' + P.C.text;
      parNote.textContent = 'Parametrización: ' + P.C.par + (P.C.closed ? ', 0 ≤ t ≤ 2π.' : ', ' + fmtC(t0) + ' ≤ t ≤ ' + fmtC(t1) + '.');
      reset();
      draw();
    }

    function verify() {
      if (!ctx) return;
      var raw = String(ans.input.value || '').trim(), s = raw ? (window.CBExercises ? window.CBExercises.parseNumber(raw, math) : parseFloat(raw.replace('−', '-'))) : NaN;
      var q = pt.get(), hasPt = isFinite(q[0]) && isFinite(q[1]);
      if (!raw && !hasPt) { UI.verdict(verdict, 'bad', 'Escribe tu valor', 'El valor ' + (mode === 'max' ? 'máximo' : 'mínimo') + ' de f sobre la restricción, con punto decimal. El punto (x, y) es opcional.'); return; }
      if (raw && !isFinite(s)) { UI.verdict(verdict, 'bad', 'Escribe un número', 'Usa punto decimal; por ejemplo 8.25.'); return; }
      var what = mode === 'max' ? 'máximo' : 'mínimo', otro = mode === 'max' ? 'mínimo' : 'máximo';
      var opt = ctx.E[mode], lam = ctx.lam[mode];
      var r = raw ? LM.diagnose(s, ctx, mode) : null, rp = hasPt ? LM.diagnosePoint(q[0], q[1], ctx, mode) : null;
      student = hasPt ? q : null;
      var msgs = {
        other: ['Ese es el ' + otro + ', no el ' + what, 'Los dos salen del mismo sistema de Lagrange. Evalúa f en todos los candidatos y quédate con el ' + (mode === 'max' ? 'mayor' : 'menor') + '.'],
        free: ['Ese es un punto crítico libre', 'Ahí ∇f = 0, pero el punto no está sobre la restricción: no puedes pararte ahí. Busca dónde la restricción toca una curva de nivel.'],
        lambda: ['Ese número es λ, no f', 'λ es el factor de ∇f = λ∇g. El ' + what + ' es f evaluada en el punto: sustituye x y y en f.'],
        missedAxis: ['Te faltó un candidato', 'El ' + what + ' está sobre un eje (x = 0 o y = 0). Si dividiste entre x (o y) para despejar λ, perdiste ese caso: factoriza en vez de dividir.'],
        missed: ['Ese candidato no es el ' + what, 'Es otro punto donde ∇f ∥ ∇g, pero no el mejor. Revisa todos los candidatos' + (P.C.closed ? '' : ' y también los extremos del tramo') + '.'],
        offCurve: ['Tu punto no cumple g = c', 'El óptimo tiene que estar sobre la restricción. Sustituye tu punto en g.'],
        mismatch: ['No coincide', 'Plantea fx = λgx, fy = λgy y g = c; resuelve, evalúa f en cada candidato y compara.']
      };
      var key = r ? (r.kind === 'ok' ? (rp && rp.kind !== 'ok' ? rp.reason : 'correct') : r.reason) : rp.reason;
      if (key === 'correct') {
        var pts = LM.optPoints(ctx, mode);
        UI.verdict(verdict, 'ok', 'Correcto: el ' + what + ' es ' + nm(opt.f, 6),
          'Se alcanza en ' + pts.map(function (p) { return '(' + nm(p.x, 4) + ', ' + nm(p.y, 4) + ')'; }).join(' y ') + (opt.end ? ', un extremo del tramo.' : ', donde ∇f ∥ ∇g con λ = ' + nm(lam, 4) + '.'));
        solved = true; showBox.checked = true;
        tS.set(opt.t);
      } else {
        var m = msgs[key] || msgs.mismatch;
        var kind = (r && r.kind === 'warn') || (rp && rp.kind === 'warn') ? 'warn' : 'bad';
        if (r && r.kind === 'ok') kind = 'warn';
        UI.verdict(verdict, kind, r && r.kind === 'ok' ? 'Tu valor está bien, pero el punto no: ' + m[0].toLowerCase() : m[0], m[1]);
      }
      draw();
    }

    /* ---------- Dibujo ---------- */
    function draw() {
      if (!P || !ctx) return;
      var t = tS.get(), p = P.C.at(t), x = p[0], y = p[1], fv = P.f(x, y), an = LM.angle(P, x, y);
      var show = showBox.checked || solved;
      var plt = window.LabPlot(map, { x: [box[0], box[1]], y: [box[2], box[3]], equal: true });
      plt.clear(); plt.grid();
      segCache.forEach(function (s) { plt.segments(s, 'aux', 1.2); });
      plt.axes();
      // La restricción.
      var t0 = P.C.t[0], t1 = P.C.t[1], N = 240, cs = [];
      for (var i = 0; i < N; i++) cs.push([P.C.at(t0 + (t1 - t0) * i / N), P.C.at(t0 + (t1 - t0) * (i + 1) / N)]);
      plt.segments(cs, 'ref', 3.2);
      // El nivel que pasa por el punto.
      if (isFinite(fv)) plt.segments(LM.contour(G, fv), 'trace', 2.6);
      // ∇f y ∇g a escala común (solo dirección).
      var L = 0.11 * Math.max(box[1] - box[0], box[3] - box[2]);
      function arrowTo(v, cls, k) {
        var m = Math.hypot(v[0], v[1]);
        if (!(m > 1e-12)) return;
        var LL = L * (k || 1), ux = v[0] / m, uy = v[1] / m, ex = x + LL * ux, ey = y + LL * uy, hh = 0.3 * L;
        plt.segments([[[x, y], [ex, ey]], [[ex, ey], [ex - hh * ux - 0.55 * hh * uy, ey - hh * uy + 0.55 * hh * ux]], [[ex, ey], [ex - hh * ux + 0.55 * hh * uy, ey - hh * uy - 0.55 * hh * ux]]], cls, 2.8);
      }
      arrowTo(an.gradG, 'ref', 0.62);
      arrowTo(an.grad, 'error');
      if (show) {
        ctx.free.forEach(function (q) {
          var d = 0.025 * (box[1] - box[0]);
          plt.segments([[[q.x - d, q.y - d], [q.x + d, q.y + d]], [[q.x - d, q.y + d], [q.x + d, q.y - d]]], 'error', 2.4);
        });
        ctx.cands.forEach(function (q) { plt.point(q.x, q.y, 'dot-aux', 5.5); });
        ctx.E.ends.forEach(function (q) { plt.point(q.x, q.y, 'dot-aux', 4); });
      }
      if (student) plt.point(student[0], student[1], 'dot-student', 6);
      plt.point(x, y, 'dot-trace', 6.5);

      // f contra t.
      var vs = [], k;
      for (k = 0; k <= 300; k++) vs.push(LM.phi(P, t0 + (t1 - t0) * k / 300));
      var fin = vs.filter(isFinite), lo = Math.min.apply(null, fin), hi = Math.max.apply(null, fin);
      if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
      var pad = 0.12 * (hi - lo);
      var g2 = window.LabPlot(plot, { x: [t0, t1], y: [lo - pad, hi + pad] });
      g2.clear(); g2.grid(); g2.axes();
      g2.curve(function (s) { return LM.phi(P, s); }, 'ref', 3);
      if (show) {
        ctx.cands.forEach(function (q) { if (isFinite(q.t)) g2.point(q.t, q.f, 'dot-aux', 5); });
        ctx.E.ends.forEach(function (q) { g2.point(q.t, q.f, 'dot-aux', 4); });
      }
      g2.segments([[[t, lo - pad], [t, hi + pad]]], 'axis', 1.2);
      g2.point(t, fv, 'dot-trace', 6);

      // Tablero.
      var par = isFinite(an.deg) && (an.deg < 1.5 || an.deg > 178.5);
      var rows = [
        ['punto (x, y)', '(' + nm(x, 4) + ', ' + nm(y, 4) + ')'],
        ['f en el punto', nm(fv, 5)],
        ['∇f', vec(an.grad)],
        ['∇g', vec(an.gradG)],
        ['ángulo entre ∇f y ∇g', isFinite(an.deg) ? nm(an.deg, 3) + '°' : '—'],
        ['¿∇f ∥ ∇g?', par ? 'sí: candidato, λ = ' + nm(LM.lambdaAt(P, x, y), 4) : 'no: aún puedes subir o bajar por el camino']
      ];
      facts.innerHTML = '';
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
      candBox.hidden = !show;
      if (show) {
        candBox.innerHTML = '';
        var list = ctx.cands.map(function (q) { return '(' + nm(q.x, 4) + ', ' + nm(q.y, 4) + '): f = ' + nm(q.f, 5) + ', λ = ' + nm(q.lambda, 4); });
        ctx.E.ends.forEach(function (q) { list.push('extremo del tramo (' + nm(q.x, 4) + ', ' + nm(q.y, 4) + '): f = ' + nm(q.f, 5)); });
        candBox.appendChild(h('p', { class: 'lab-stack__label' }, ['Candidatos de Lagrange (puntos sobre la restricción)']));
        candBox.appendChild(h('ul', { class: 'lg-list' }, list.map(function (s) { return h('li', {}, [s]); })));
        if (ctx.free.length) candBox.appendChild(h('p', { class: 'lab-note' }, ['× punto crítico libre (∇f = 0), fuera de la restricción: ' + ctx.free.map(function (q) { return '(' + nm(q.x, 3) + ', ' + nm(q.y, 3) + '), f = ' + nm(q.f, 4); }).join('; ') + '.']));
      }
    }

    preset.input.value = String(start);
    document.addEventListener('cb:themechange', function () { draw(); });
    return UI.loadMath().then(function (m) { math = m; load(start); });
  };
})();
