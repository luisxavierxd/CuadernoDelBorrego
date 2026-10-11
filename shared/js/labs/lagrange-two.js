/* =====================================================================
   Lab lagrange-two (Cálculo 2 · S10): Lagrange con dos restricciones.
   Dos superficies g = c₁ y h = c₂ se cortan en una curva; el alumno elige
   la pareja (plano ∩ cilindro, plano ∩ esfera, dos planos) y la función f,
   y mueve un punto sobre la curva. El lab muestra ∇f, ∇g, ∇h y la tangente
   T = ∇g × ∇h, la gráfica de f contra el parámetro t con sus extremos y la
   componente de ∇f a lo largo de la curva (∇f·T̂, que vale 0 en un extremo).
   Reto: dar el máximo o el mínimo (valor o una coordenada); se compara con
   una búsqueda densa sobre la curva parametrizada y se da el «casi»: otro
   extremo, λ o μ en lugar de f, una sola restricción, distancia contra
   distancia al cuadrado.
   En PC (pantalla ancha y mouse) la escena se ve en 3D con manim-web; en
   móvil, o si WebGL falla, en proyección SVG. Las gráficas, siempre.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  function dot(u, v) { return u[0] * v[0] + u[1] * v[1] + u[2] * v[2]; }
  function cross(u, v) { return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; }
  function len(u) { return Math.hypot(u[0], u[1], u[2]); }
  function scale(u, k) { return [u[0] * k, u[1] * k, u[2] * k]; }
  function plus(u, v, k) { k = k == null ? 1 : k; return [u[0] + k * v[0], u[1] + k * v[1], u[2] + k * v[2]]; }
  function unit(u) { var L = len(u); return L > 0 ? scale(u, 1 / L) : [0, 0, 0]; }

  /* Restricciones g(x, y, z) = c:
       { type: 'plane', n: [a, b, cz], c }  →  a x + b y + cz z = c
       { type: 'cyl', c }                    →  x² + y² = c   (cilindro de eje z, radio √c)
       { type: 'sphere', c }                 →  x² + y² + z² = c */
  function gval(k, p) {
    if (k.type === 'plane') return dot(k.n, p);
    if (k.type === 'cyl') return p[0] * p[0] + p[1] * p[1];
    return dot(p, p);
  }
  function resid(k, p) { return gval(k, p) - k.c; }
  function grad(k, p) {
    if (k.type === 'plane') return k.n.slice();
    if (k.type === 'cyl') return [2 * p[0], 2 * p[1], 0];
    return [2 * p[0], 2 * p[1], 2 * p[2]];
  }
  // Base ortonormal (u, v) de un plano con normal n, y su normal unitaria N.
  function basis(n) {
    var N = unit(n), a = Math.abs(N[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    var u = unit(cross(N, a));
    return { N: N, u: u, v: cross(N, u) };
  }

  /* Curva de intersección parametrizada: { kind: 'closed' | 'line', t0, t1, at(t), d(t) }.
     plano ∩ cilindro: x = r cos t, y = r sin t, z despejada del plano (elipse).
     plano ∩ esfera: centro C = (c/|n|) n̂, radio ρ = √(R² − (c/|n|)²) en el plano.
     dos planos: recta p₀ + t û, con p₀ el punto más cercano al origen y û ∥ n₁ × n₂.
     null si las superficies no se cortan en una curva (o la pareja no está soportada). */
  function curve(g, h, opts) {
    opts = opts || {};
    var P = g.type === 'plane' ? g : h.type === 'plane' ? h : null, Q = P === g ? h : g;
    if (!P) return null;
    var n = P.n, nn = len(n);
    if (!(nn > 1e-12)) return null;
    if (Q.type === 'cyl') {
      if (!(Q.c > 0) || Math.abs(n[2]) < 1e-9) return null;
      var r = Math.sqrt(Q.c);
      return {
        kind: 'closed', t0: 0, t1: 2 * Math.PI, r: r,
        at: function (t) { var x = r * Math.cos(t), y = r * Math.sin(t); return [x, y, (P.c - n[0] * x - n[1] * y) / n[2]]; },
        d: function (t) { var dx = -r * Math.sin(t), dy = r * Math.cos(t); return [dx, dy, -(n[0] * dx + n[1] * dy) / n[2]]; }
      };
    }
    if (Q.type === 'sphere') {
      var B = basis(n), s = P.c / nn, rho2 = Q.c - s * s;
      if (!(rho2 > 1e-12)) return null;
      var rho = Math.sqrt(rho2), C = scale(B.N, s);
      return {
        kind: 'closed', t0: 0, t1: 2 * Math.PI, center: C, rho: rho, u: B.u, v: B.v,
        at: function (t) { return plus(plus(C, B.u, rho * Math.cos(t)), B.v, rho * Math.sin(t)); },
        d: function (t) { return plus(scale(B.u, -rho * Math.sin(t)), B.v, rho * Math.cos(t)); }
      };
    }
    if (Q.type === 'plane') {
      var m = Q.n, D = cross(n, m);
      if (!(len(D) > 1e-9 * nn * len(m))) return null;
      // p₀ = α n + β m con n·p₀ = c₁ y m·p₀ = c₂ (el punto de la recta más cercano al origen).
      var a11 = dot(n, n), a12 = dot(n, m), a22 = dot(m, m), det = a11 * a22 - a12 * a12;
      var al = (P.c * a22 - Q.c * a12) / det, be = (Q.c * a11 - P.c * a12) / det;
      var p0 = plus(scale(n, al), m, be), u = unit(D), L = opts.L || 5;
      return {
        kind: 'line', t0: -L, t1: L, p0: p0, u: u,
        at: function (t) { return plus(p0, u, t); },
        d: function () { return u.slice(); }
      };
    }
    return null;
  }

  // f(x, y, z) con su gradiente simbólico (math.derivative). Fuera de dominio → NaN.
  function field(math, src) {
    var node = math.parse(window.LabMath.core.prep(src)), code = node.compile();
    var ds = ['x', 'y', 'z'].map(function (w) { return math.derivative(node, w).compile(); });
    function ev(c, p) { try { var v = c.evaluate({ x: p[0], y: p[1], z: p[2] }); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; } }
    return { src: src, f: function (p) { return ev(code, p); }, grad: function (p) { return ds.map(function (c) { return ev(c, p); }); } };
  }
  function phi(F, C, t) { return F.f(C.at(t)); }
  // φ′(t) = ∇f · r′(t): la derivada de f a lo largo de la curva.
  function dphi(F, C, t) { return dot(F.grad(C.at(t)), C.d(t)); }

  // Mejores λ, μ (mínimos cuadrados) para ∇f ≈ λ∇g + μ∇h, y el residuo que queda.
  function multipliers(gf, gg, gh) {
    var a11 = dot(gg, gg), a12 = dot(gg, gh), a22 = dot(gh, gh), det = a11 * a22 - a12 * a12;
    if (!(Math.abs(det) > 1e-14 * Math.max(1, a11 * a22))) return { lam: NaN, mu: NaN, resid: NaN };
    var b1 = dot(gg, gf), b2 = dot(gh, gf);
    var lam = (b1 * a22 - b2 * a12) / det, mu = (b2 * a11 - b1 * a12) / det;
    return { lam: lam, mu: mu, resid: len(plus(plus(gf, gg, -lam), gh, -mu)) };
  }
  // Todo lo geométrico en un punto: gradientes, tangente T = ∇g × ∇h, ∇f·T̂ y los multiplicadores.
  function info(F, g, h, p) {
    var gf = F.grad(p), gg = grad(g, p), gh = grad(h, p), T = cross(gg, gh), TL = len(T), m = multipliers(gf, gg, gh);
    var gfl = len(gf), tc = TL > 0 ? dot(gf, T) / TL : NaN;
    return {
      p: p, f: F.f(p), gf: gf, gg: gg, gh: gh, T: T, That: TL > 0 ? scale(T, 1 / TL) : [0, 0, 0], tcomp: tc,
      out: gfl > 1e-12 ? Math.abs(tc) / gfl : 0, lam: m.lam, mu: m.mu, resid: m.resid,
      g: gval(g, p), h: gval(h, p)
    };
  }

  // Sección dorada en [a, b] para el máximo (sg = 1) o el mínimo (sg = −1) de φ.
  function golden(fn, a, b, sg, iters) {
    var r = (Math.sqrt(5) - 1) / 2, x1 = b - r * (b - a), x2 = a + r * (b - a), f1 = sg * fn(x1), f2 = sg * fn(x2);
    for (var i = 0; i < (iters || 80); i++) {
      if (f1 >= f2) { b = x2; x2 = x1; f2 = f1; x1 = b - r * (b - a); f1 = sg * fn(x1); }
      else { a = x1; x1 = x2; f1 = f2; x2 = a + r * (b - a); f2 = sg * fn(x2); }
    }
    return (a + b) / 2;
  }
  // Pulido: bisección sobre φ′(t) = 0 dentro del corchete (la dorada se queda en ~√ε).
  function polish(F, C, a, b, sg) {
    var da = sg * dphi(F, C, a), db = sg * dphi(F, C, b);
    if (!(da > 0 && db < 0)) return null;
    for (var i = 0; i < 200 && b - a > 1e-15 * (1 + Math.abs(a)); i++) {
      var m = (a + b) / 2, dm = sg * dphi(F, C, m);
      if (!isFinite(dm)) return null;
      if (dm > 0) a = m; else b = m;
    }
    return (a + b) / 2;
  }

  /* Oráculo: búsqueda densa de f sobre la curva parametrizada (n muestras), cada extremo
     local afinado con sección dorada y pulido con bisección sobre φ′. En una recta, un
     extremo que queda en la orilla de la ventana no cuenta: f crece (o baja) sin límite.
     → { flat, list[{ t, p, value, kind }], max, min, lo, hi } (max/min null si no existen). */
  function dense(F, C, opts) {
    opts = opts || {};
    var n = opts.n || 2400, closed = C.kind === 'closed', m = closed ? n : n + 1, ts = [], vs = [], i;
    for (i = 0; i < m; i++) { var t = C.t0 + (C.t1 - C.t0) * i / n; ts.push(t); vs.push(phi(F, C, t)); }
    var fin = vs.filter(isFinite);
    if (fin.length < m * 0.9) return { flat: false, list: [], max: null, min: null, lo: NaN, hi: NaN, bad: true };
    var hi = Math.max.apply(null, fin), lo = Math.min.apply(null, fin), sc = Math.max(1, Math.abs(hi), Math.abs(lo));
    var res = { flat: false, list: [], max: null, min: null, lo: lo, hi: hi, kind: C.kind };
    if (hi - lo <= 1e-9 * sc) {
      var p0 = C.at(ts[0]), e0 = { t: ts[0], p: p0, value: vs[0], kind: 'flat' };
      res.flat = true; res.max = e0; res.min = e0;
      return res;
    }
    var step = (C.t1 - C.t0) / n, fn = function (s) { return phi(F, C, s); };
    for (i = 0; i < m; i++) {
      if (!closed && (i === 0 || i === m - 1)) continue;
      var a = vs[closed ? (i - 1 + m) % m : i - 1], c = vs[closed ? (i + 1) % m : i + 1], v = vs[i];
      if (!isFinite(a) || !isFinite(c) || !isFinite(v)) continue;
      var sg = v >= a && v > c ? 1 : v <= a && v < c ? -1 : 0;
      if (!sg) continue;
      var tg = golden(fn, ts[i] - step, ts[i] + step, sg);
      var tb = polish(F, C, ts[i] - step, ts[i] + step, sg);
      var tt = tb != null && sg * fn(tb) >= sg * fn(tg) - 1e-12 * sc ? tb : tg;
      res.list.push({ t: tt, p: C.at(tt), value: fn(tt), kind: sg > 0 ? 'max' : 'min' });
    }
    function best(kind) {
      var sg = kind === 'max' ? 1 : -1, b = null;
      res.list.forEach(function (e) { if (e.kind === kind && (!b || sg * e.value > sg * b.value)) b = e; });
      if (b && !closed) {
        var edge = sg * Math.max(sg * vs[0], sg * vs[m - 1]);
        if (sg * edge >= sg * b.value - 1e-9 * sc) return null;     // la orilla gana: no hay extremo
      }
      return b;
    }
    res.max = best('max'); res.min = best('min');
    return res;
  }

  /* Lagrange con dos restricciones: Newton sobre las 5 ecuaciones
       ∇f − λ∇g − μ∇h = 0,  g = c₁,  h = c₂
     en (x, y, z, λ, μ), con jacobiano por diferencias centradas, paso amortiguado y varios
     arranques (puntos de la curva con sus λ, μ de mínimos cuadrados). */
  function solveLin(A, b) {
    var n = b.length, M = A.map(function (r, i) { return r.concat([b[i]]); }), i, j, k;
    for (k = 0; k < n; k++) {
      var piv = k;
      for (i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[piv][k])) piv = i;
      if (!(Math.abs(M[piv][k]) > 1e-13)) return null;
      var tmp = M[k]; M[k] = M[piv]; M[piv] = tmp;
      for (i = k + 1; i < n; i++) { var q = M[i][k] / M[k][k]; for (j = k; j <= n; j++) M[i][j] -= q * M[k][j]; }
    }
    var x = new Array(n);
    for (i = n - 1; i >= 0; i--) { var s = M[i][n]; for (j = i + 1; j < n; j++) s -= M[i][j] * x[j]; x[i] = s / M[i][i]; }
    return x;
  }
  function vnorm(r) { return Math.sqrt(r.reduce(function (s, x) { return s + x * x; }, 0)); }
  // Al llegar a la tolerancia da hasta 3 pasos más mientras el residuo siga bajando (pulido).
  function newton(R, X, tol) {
    var r = R(X), nr = vnorm(r), extra = 0;
    for (var it = 0; it < 80 && isFinite(nr); it++) {
      if (nr <= tol && (++extra > 3 || nr === 0)) break;
      var J = [], j, i;
      for (i = 0; i < r.length; i++) J.push([]);
      for (j = 0; j < X.length; j++) {
        var hj = 1e-6 * Math.max(1, Math.abs(X[j])), Xp = X.slice(), Xm = X.slice();
        Xp[j] += hj; Xm[j] -= hj;
        var rp = R(Xp), rm = R(Xm);
        for (i = 0; i < r.length; i++) J[i][j] = (rp[i] - rm[i]) / (2 * hj);
      }
      var dx = solveLin(J, r.map(function (x) { return -x; }));
      if (!dx) break;
      var s = 1, Xn, rn, nn;
      for (;;) {
        Xn = X.map(function (x, k) { return x + s * dx[k]; }); rn = R(Xn); nn = vnorm(rn);
        if ((isFinite(nn) && nn < nr * (1 - 1e-4 * s)) || s < 1e-4) break;
        s /= 2;
      }
      if (!isFinite(nn) || (nr <= tol && !(nn < nr))) break;     // al pulir, solo pasos que mejoran
      if (vnorm(dx) * s < 1e-15 * (1 + vnorm(X))) { X = Xn; r = rn; nr = nn; break; }
      X = Xn; r = rn; nr = nn;
    }
    return nr <= tol ? { X: X, resid: nr } : null;
  }
  function seeds(C, k) {
    if (!C) return [];
    var out = [];
    for (var i = 0; i < k; i++) out.push(C.at(C.t0 + (C.t1 - C.t0) * (i + 0.5) / k));
    return out;
  }
  function addUnique(list, s) {
    // Holgura de 1e-4: en un crítico degenerado (f plana a cuarto orden) Newton solo llega a ~1e-5.
    for (var i = 0; i < list.length; i++) if (len(plus(list[i].p, s.p, -1)) < 1e-4 * (1 + len(s.p))) return;
    list.push(s);
  }
  // → { sols[{ p, lam, mu, value, resid }], max, min } (los puntos críticos que encontró Newton).
  function lagrange(F, g, h, opts) {
    opts = opts || {};
    var C = opts.curve || curve(g, h, opts), starts = opts.seeds || seeds(C, opts.k || 24), sols = [];
    function R(X) {
      var p = [X[0], X[1], X[2]], gf = F.grad(p), gg = grad(g, p), gh = grad(h, p);
      return [gf[0] - X[3] * gg[0] - X[4] * gh[0], gf[1] - X[3] * gg[1] - X[4] * gh[1], gf[2] - X[3] * gg[2] - X[4] * gh[2], resid(g, p), resid(h, p)];
    }
    starts.forEach(function (p) {
      var m = multipliers(F.grad(p), grad(g, p), grad(h, p));
      var X0 = [p[0], p[1], p[2], isFinite(m.lam) ? m.lam : 0, isFinite(m.mu) ? m.mu : 0];
      var tol = 1e-10 * (1 + len(F.grad(p)) + Math.abs(g.c) + Math.abs(h.c));
      var out = newton(R, X0, tol);
      if (!out) return;
      var q = [out.X[0], out.X[1], out.X[2]];
      addUnique(sols, { p: q, lam: out.X[3], mu: out.X[4], value: F.f(q), resid: out.resid });
    });
    sols.sort(function (a, b) { return a.value - b.value; });
    return { sols: sols, min: sols[0] || null, max: sols[sols.length - 1] || null };
  }
  // Puntos críticos con UNA sola restricción (para detectar ese error): ∇f = λ∇k, k = c.
  function single(F, k, starts) {
    var sols = [];
    function R(X) { var p = [X[0], X[1], X[2]], gf = F.grad(p), gk = grad(k, p); return [gf[0] - X[3] * gk[0], gf[1] - X[3] * gk[1], gf[2] - X[3] * gk[2], resid(k, p)]; }
    (starts || []).forEach(function (p) {
      var gf = F.grad(p), gk = grad(k, p), kk = dot(gk, gk);
      var out = newton(R, [p[0], p[1], p[2], kk > 0 ? dot(gf, gk) / kk : 0], 1e-10 * (1 + len(gf) + Math.abs(k.c)));
      if (!out) return;
      var q = [out.X[0], out.X[1], out.X[2]];
      addUnique(sols, { p: q, lam: out.X[3], value: F.f(q) });
    });
    return sols;
  }

  // Búsqueda densa con f escrita como texto (lo que usan ejemplos y ejercicios): el máximo y el
  // mínimo traen además sus multiplicadores (mínimos cuadrados en el punto) y ∇f·T̂.
  function optimize(math, src, g, h, opts) {
    var F = field(math, src), C = curve(g, h, opts);
    if (!C) return null;
    var r = dense(F, C, opts);
    ['max', 'min'].forEach(function (k) {
      var e = r[k];
      if (!e || e.kind === 'flat') return;
      var I = info(F, g, h, e.p);
      e.lam = I.lam; e.mu = I.mu; e.tcomp = I.tcomp; e.resid = I.resid;
      e.x = e.p[0]; e.y = e.p[1]; e.z = e.p[2];
    });
    r.curve = C;
    return r;
  }
  // Newton-Lagrange con f escrita como texto.
  function solve(math, src, g, h, opts) { return lagrange(field(math, src), g, h, opts); }

  // Holgura de los ejercicios: ±0.01 (o ±1 %) desde 0.1; abajo, ±1 % o 0.0005.
  function near(s, t) {
    var d = Math.abs(s - t), at = Math.abs(t);
    if (at >= 0.1) return d <= Math.max(0.01, 0.01 * at) + 1e-9;
    return d <= Math.max(0.01 * at, 5e-4) + 1e-12;
  }
  var AX = { x: 0, y: 1, z: 2 };
  function take(e, field) { return !e ? NaN : field === 'value' ? e.value : e.p[AX[field]]; }
  /* Diagnóstico del número del alumno. ask = { kind: 'max' | 'min', field: 'value' | 'x' | 'y' | 'z' };
     res = resultado de dense/optimize (con lam, mu en el extremo); ctx = { single: [...], dist: 1 | 2 }.
     reason: correct · flat · none · other · lambda · mu · one · sqrt · square · mismatch */
  function diagnose(s, res, ask, ctx) {
    ctx = ctx || {};
    if (!isFinite(s)) return { kind: 'invalid', reason: 'number', want: NaN };
    if (!res || res.bad) return { kind: 'invalid', reason: 'domain', want: NaN };
    var e = res[ask.kind], other = res[ask.kind === 'max' ? 'min' : 'max'];
    if (res.flat) {
      if (ask.field !== 'value') return { kind: 'warn', reason: 'flat', want: NaN };
      return near(s, res.max.value) ? { kind: 'ok', reason: 'correct', want: res.max.value } : { kind: 'bad', reason: 'mismatch', want: res.max.value };
    }
    if (!e) return { kind: 'warn', reason: 'none', want: NaN };
    var t = take(e, ask.field);
    if (near(s, t)) return { kind: 'ok', reason: 'correct', want: t };
    var cs = [];
    if (other) cs.push(['other', take(other, ask.field)]);
    if (ask.field === 'value') {
      if (isFinite(e.lam)) cs.push(['lambda', e.lam]);
      if (isFinite(e.mu)) cs.push(['mu', e.mu]);
      if (ctx.dist === 2 && e.value >= 0) cs.push(['sqrt', Math.sqrt(e.value)]);
      if (ctx.dist === 1) cs.push(['square', e.value * e.value]);
    }
    (ctx.single || []).forEach(function (q) { cs.push(['one', take(q, ask.field)]); });
    for (var i = 0; i < cs.length; i++) {
      var v = cs[i][1];
      if (isFinite(v) && !near(v, t) && near(s, v)) return { kind: 'warn', reason: cs[i][0], want: t };
    }
    return { kind: 'bad', reason: 'mismatch', want: t };
  }

  window.LabMath.lagr2 = {
    dot: dot, cross: cross, len: len, unit: unit, basis: basis,
    gval: gval, resid: resid, grad: grad, curve: curve, field: field, phi: phi, dphi: dphi,
    multipliers: multipliers, info: info, golden: golden, dense: dense, solveLin: solveLin,
    newton: newton, lagrange: lagrange, single: single, seeds: seeds, optimize: optimize, solve: solve,
    near: near, take: take, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  function plane(a, b, c, d) { return { type: 'plane', n: [a, b, c], c: d }; }
  var PAIRS = [
    { name: 'Plano ∩ cilindro: x + y + z = 4 y x² + y² = 2', g: plane(1, 1, 1, 4), h: { type: 'cyl', c: 2 }, gt: 'x + y + z = 4', ht: 'x² + y² = 2' },
    { name: 'Plano ∩ cilindro: x − y + z = 1 y x² + y² = 1', g: plane(1, -1, 1, 1), h: { type: 'cyl', c: 1 }, gt: 'x − y + z = 1', ht: 'x² + y² = 1' },
    { name: 'Plano ∩ esfera: x + y + z = 3 y x² + y² + z² = 9', g: plane(1, 1, 1, 3), h: { type: 'sphere', c: 9 }, gt: 'x + y + z = 3', ht: 'x² + y² + z² = 9' },
    { name: 'Plano ∩ esfera: x + 2z = 2 y x² + y² + z² = 4', g: plane(1, 0, 2, 2), h: { type: 'sphere', c: 4 }, gt: 'x + 2z = 2', ht: 'x² + y² + z² = 4' },
    { name: 'Dos planos (recta): x + y + z = 3 y x − y = 1', g: plane(1, 1, 1, 3), h: plane(1, -1, 0, 1), gt: 'x + y + z = 3', ht: 'x − y = 1' },
    { name: 'Dos planos (recta): x + 2y + 2z = 9 y x − z = 0', g: plane(1, 2, 2, 9), h: plane(1, 0, -1, 0), gt: 'x + 2y + 2z = 9', ht: 'x − z = 0' }
  ];
  var FUNS = [
    { name: 'Distancia al origen al cuadrado: x² + y² + z²', f: 'x^2 + y^2 + z^2', dist: 2 },
    { name: 'Altura: z', f: 'z' },
    { name: 'x + 2y', f: 'x + 2y' },
    { name: 'x + 2y + 3z', f: 'x + 2y + 3z' },
    { name: 'Temperatura: 20 + xy + z', f: '20 + x*y + z' },
    { name: 'Distancia al origen: √(x² + y² + z²)', f: 'sqrt(x^2 + y^2 + z^2)', dist: 1 }
  ];
  // Las pruebas recorren los mismos presets que ve el alumno.
  window.LabMath.lagr2.PAIRS = PAIRS;
  window.LabMath.lagr2.FUNS = FUNS;
  var KINDS = [['max', 'Máximo de f'], ['min', 'Mínimo de f']];
  var FIELDS = [['value', 'el valor de f'], ['x', 'la x del punto'], ['y', 'la y del punto'], ['z', 'la z del punto']];
  var NS = 'http://www.w3.org/2000/svg';

  window.Labs['lagrange-two'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, LM = window.LabMath.lagr2;
    var pairs = cfg.pairs || PAIRS, funs = cfg.funs || FUNS;
    var iPair = cfg.pair != null ? cfg.pair : 0, iFun = cfg.fun != null ? cfg.fun : 0;
    var math = null, F = null, C = null, R = null, NL = null, ctx = { single: [] }, student = null, solved = false, dist = 0;
    var ask = { kind: 'max', field: 'value' };

    var pairSel = UI.select({ label: 'Restricciones g = c₁ y h = c₂', options: pairs.map(function (p) { return p.name; }) });
    var funSel = UI.select({ label: 'Función f', options: funs.map(function (p) { return p.name; }) });
    var fIn = UI.mathField({ label: 'f(x, y, z)', hint: 'Puedes escribir tu propia f en x, y, z; usa la paleta o el teclado ⌨.', palette: 'multi', onEnter: function () { build(); } });
    var run = UI.button('Usar esta f', 'primary', function () { build(); });
    var status = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var tS = UI.slider({ label: 't (posición sobre la curva)', min: 0, max: 6.28, step: 0.01, value: 0.6, fmt: fmtT }, function () { moved(); });
    var jump = UI.button('Ir al siguiente punto crítico', 'ghost', function () { nextCritical(); });
    var kindSel = UI.select({ label: 'Reto', options: KINDS.map(function (k) { return k[1]; }) });
    var fieldSel = UI.select({ label: 'Escribe', options: FIELDS.map(function (k) { return k[1]; }) });
    var ans = UI.input({ label: 'Tu respuesta', type: 'text', inputmode: 'decimal', mono: false, hint: 'Redondea a 2 decimales.' });
    var hideBox = h('input', { type: 'checkbox', id: UI.id('l2-hide') });
    var hideRow = h('label', { class: 'l2-check', for: hideBox.id }, [hideBox, ' Tapar los extremos (para el reto)']);
    var check = UI.button('Comprobar', 'primary', function () { verify(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var scene = UI.svg(640, 400, 'Las dos superficies de restricción, su curva de intersección, el punto móvil y los gradientes de f, g y h');
    var plotF = UI.svg(480, 250, 'f a lo largo de la curva, contra el parámetro t, con el máximo y el mínimo');
    var plotT = UI.svg(480, 250, 'Componente de ∇f a lo largo de la curva, ∇f·T̂, contra t: vale cero en los extremos');
    var capF = h('p', { class: 'lab-stack__label' }, ['f a lo largo de la curva (contra t)']);
    var capT = h('p', { class: 'lab-stack__label' }, ['∇f · T/|T|: la parte de ∇f que va por la curva']);
    var meterBar = h('span', { class: 'l2-meter__bar' });
    var meterTxt = h('span', { class: 'l2-meter__txt mono' });
    var meter = h('div', { class: 'l2-meter', role: 'img', 'aria-label': 'Qué tanto se sale ∇f del plano de ∇g y ∇h' }, [h('span', { class: 'l2-meter__track' }, [meterBar]), meterTxt]);
    var board = h('dl', { class: 'lab-facts l2-board' });
    var want3D = !!(window.matchMedia && window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches);
    var stage3d = h('div', { class: 'lab-stage lab-stage--manim lab-stage--3d', hidden: true, role: 'img', 'aria-label': 'Las dos superficies y su curva de intersección en 3D; arrastra para girarlas' });
    var note3d = h('p', { class: 'lab-note', hidden: true }, ['Arrastra para girar la escena; la rueda del mouse acerca y aleja. Las flechas muestran solo la dirección de cada gradiente.']);
    var btn3d = UI.button('Vista 3D', 'ghost', function () { setView('3d'); });
    var btn2d = UI.button('Vista plana', 'ghost', function () { setView('2d'); });
    var viewBar = h('div', { class: 'lab-buttons lab-viewbar', hidden: !want3D, role: 'group', 'aria-label': 'Tipo de vista' }, [btn3d, btn2d]);
    var M3 = null, scene3 = null, view = '2d', pending3 = false;

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        pairSel.node, funSel.node, fIn.node, h('div', { class: 'lab-buttons' }, [run]), status,
        tS.node, h('div', { class: 'lab-buttons' }, [jump]),
        kindSel.node, fieldSel.node, ans.node, hideRow, h('div', { class: 'lab-buttons' }, [check]), verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Dos restricciones: la curva de intersección']),
        viewBar, scene, stage3d, note3d,
        h('div', { class: 'l2-plots' }, [h('div', {}, [capF, plotF]), h('div', {}, [capT, plotT])]),
        h('p', { class: 'lab-stack__label' }, ['¿∇f está en el plano de ∇g y ∇h?']), meter,
        h('p', { class: 'lab-stack__label' }, ['Tablero en vivo']),
        board,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'g = c₁ y ∇g']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'h = c₂ y ∇h']),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'curva y punto']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), '∇f']),
          h('li', {}, [h('i', { class: 'sw sw--axis' }), 'máximo y mínimo']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu respuesta'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); build(); });
    pairSel.input.addEventListener('change', function () { iPair = +pairSel.input.value; build(); });
    funSel.input.addEventListener('change', function () { iFun = +funSel.input.value; fIn.setMath(funs[iFun].f); build(); });
    kindSel.input.addEventListener('change', function () { ask.kind = KINDS[+kindSel.input.value][0]; reset(); draw(); });
    fieldSel.input.addEventListener('change', function () { ask.field = FIELDS[+fieldSel.input.value][0]; reset(); draw(); });
    hideBox.addEventListener('change', function () { draw(); });
    ans.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); verify(); } });
    pairSel.input.value = String(iPair); funSel.input.value = String(iFun);
    fIn.setMath(funs[iFun].f);

    function fmtT(v) { return (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(2)).toString().replace('-', '−'); }
    function num(v, d) { return UI.fmt(v, d || 4).replace(/-/g, '−'); }
    function vec(u, d) { return '(' + u.map(function (x) { return num(x, d || 3); }).join(', ') + ')'; }
    function reset() { verdict.hidden = true; solved = false; student = null; }

    function build() {
      if (!math) return;
      var P = pairs[iPair], src = String(fIn.get() || '').trim() || funs[iFun].f;   // MathLive puede tardar en cargar
      try {
        if (!src) throw new Error('Escribe f(x, y, z).');
        var Fn = LM.field(math, src), Cn = LM.curve(P.g, P.h);
        if (!Cn) throw new Error('Estas superficies no se cortan en una curva.');
        var Rn = LM.dense(Fn, Cn);
        if (Rn.bad) throw new Error('f no está definida en buena parte de la curva.');
        F = Fn; C = Cn; R = Rn;
        status.hidden = true;
      } catch (e) { UI.verdict(status, 'bad', 'No pude usar esa f', e.message); return; }
      // Multiplicadores en los extremos, Newton-Lagrange y los críticos con una sola restricción.
      ['max', 'min'].forEach(function (k) {
        var e = R[k];
        if (!e || e.kind === 'flat') return;
        var I = LM.info(F, P.g, P.h, e.p);
        e.lam = I.lam; e.mu = I.mu;
      });
      NL = LM.lagrange(F, P.g, P.h, { curve: C });
      var st = LM.seeds(C, 12);
      ctx = { single: LM.single(F, P.g, st).concat(LM.single(F, P.h, st)), dist: 0 };
      var norm = src.replace(/\s+/g, '');
      ctx.dist = norm === 'x^2+y^2+z^2' ? 2 : norm === 'sqrt(x^2+y^2+z^2)' ? 1 : 0;
      tS.input.min = C.t0; tS.input.max = C.t1;
      tS.input.step = C.kind === 'closed' ? 0.01 : 0.02;
      if (+tS.get() < C.t0 || +tS.get() > C.t1) tS.set(C.kind === 'closed' ? 0.6 : 1.5);
      tS.set(tS.get());
      reset();
      draw();
    }
    function moved() { draw(); }
    // Mueve t al siguiente extremo local (de la búsqueda densa) a la derecha del actual.
    function nextCritical() {
      if (!R || !R.list.length) return;
      var t = tS.get(), ts = R.list.map(function (e) { return e.t; }).sort(function (a, b) { return a - b; });
      var nx = ts.find(function (s) { return s > t + 1e-3; });
      tS.set(nx != null ? nx : ts[0]);
      draw();
    }

    function verify() {
      if (!R || !math) return;
      var raw = String(ans.input.value || '');
      var s = window.CBExercises ? window.CBExercises.parseNumber(raw, math) : parseFloat(raw.replace(',', '.').replace('−', '-'));
      if (!isFinite(s)) { UI.verdict(verdict, 'bad', 'Escribe un número', 'Usa punto decimal; por ejemplo −1.25.'); return; }
      var r = LM.diagnose(s, R, ask, ctx), e = R[ask.kind], other = ask.kind === 'max' ? 'mínimo' : 'máximo', what = ask.kind === 'max' ? 'máximo' : 'mínimo';
      student = s;
      var msgs = {
        correct: ['Tu ' + what + ' es correcto', e && e.kind !== 'flat' ? 'Ahí ∇f = λ∇g + μ∇h con λ ≈ ' + num(e.lam) + ' y μ ≈ ' + num(e.mu) + ': ∇f queda en el plano de los dos gradientes y no tiene parte a lo largo de la curva.' : 'f vale lo mismo en toda la curva.'],
        flat: ['f es constante sobre esta curva', 'Todos los puntos son máximo y mínimo a la vez: cualquier coordenada sirve. Pide mejor el valor de f.'],
        none: ['Ese ' + what + ' no existe', 'Sobre esta recta f sigue ' + (ask.kind === 'max' ? 'creciendo' : 'bajando') + ' sin límite hacia una de las puntas: Lagrange da candidatos, pero no garantiza que haya ' + what + '.'],
        other: ['Diste el ' + other, 'Evalúa f en todos los puntos críticos: el ' + what + ' es el ' + (ask.kind === 'max' ? 'más grande' : 'más chico') + '.'],
        lambda: ['Ese número es λ, no f', 'λ y μ son los coeficientes de ∇f = λ∇g + μ∇h. El valor se obtiene evaluando f en el punto.'],
        mu: ['Ese número es μ, no f', 'λ y μ son los coeficientes de ∇f = λ∇g + μ∇h. El valor se obtiene evaluando f en el punto.'],
        one: ['Usaste una sola restricción', 'Ese es un punto crítico de f sobre una sola superficie. El punto debe cumplir g = c₁ y h = c₂ a la vez: ∇f = λ∇g + μ∇h, con los dos gradientes.'],
        sqrt: ['Diste la distancia', 'Aquí f es la distancia al cuadrado: no saques raíz.'],
        square: ['Diste la distancia al cuadrado', 'Aquí f es la distancia: saca la raíz al final.'],
        mismatch: ['No coincide', 'Plantea ∇f = λ∇g + μ∇h junto con g = c₁ y h = c₂ (5 ecuaciones), resuelve y evalúa f en cada candidato.']
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
    function samples(k) { var o = []; for (var i = 0; i <= k; i++) o.push(C.at(C.t0 + (C.t1 - C.t0) * i / k)); return o; }
    // Caja de la escena: la curva más un margen; el cilindro y la esfera completos en x, y.
    function frame() {
      var P = pairs[iPair], pts = samples(120), lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
      pts.forEach(function (p) { for (var i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], p[i]); hi[i] = Math.max(hi[i], p[i]); } });
      [P.g, P.h].forEach(function (k) {
        if (k.type === 'sphere') { var Rr = Math.sqrt(k.c); for (var i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], -Rr); hi[i] = Math.max(hi[i], Rr); } }
      });
      var span = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2], 1);
      var mg = 0.18 * span, c = [0, 1, 2].map(function (i) { return (lo[i] + hi[i]) / 2; });
      return { lo: lo.map(function (v) { return v - mg; }), hi: hi.map(function (v) { return v + mg; }), c: c, half: span / 2 + mg, pts: pts };
    }
    // Rejilla de cada superficie como listas de polilíneas en el mundo (sirve para SVG y 3D).
    function meshes(k, B) {
      var out = [], i, j, N = 40;
      if (k.type === 'plane') {
        var bs = LM.basis(k.n), c0 = scale(bs.N, k.c / len(k.n)), us = [], vs = [];
        // El parche cubre la curva (sus coordenadas en el plano) con margen.
        B.pts.forEach(function (p) { var q = plus(p, c0, -1); us.push(dot(q, bs.u)); vs.push(dot(q, bs.v)); });
        var u0 = Math.min.apply(null, us), u1 = Math.max.apply(null, us), v0 = Math.min.apply(null, vs), v1 = Math.max.apply(null, vs);
        var mu = 0.25 * Math.max(u1 - u0, v1 - v0, 1);
        u0 -= mu; u1 += mu; v0 -= mu; v1 += mu;
        var at = function (u, v) { return plus(plus(c0, bs.u, u), bs.v, v); };
        for (i = 0; i <= 6; i++) {
          var uu = u0 + (u1 - u0) * i / 6, vv = v0 + (v1 - v0) * i / 6;
          out.push([at(uu, v0), at(uu, v1)]); out.push([at(u0, vv), at(u1, vv)]);
        }
        out.patch = { at: at, u: [u0, u1], v: [v0, v1] };
      } else if (k.type === 'cyl') {
        var r = Math.sqrt(k.c), z0 = B.lo[2], z1 = B.hi[2];
        for (i = 0; i < 16; i++) { var a = 2 * Math.PI * i / 16; out.push([[r * Math.cos(a), r * Math.sin(a), z0], [r * Math.cos(a), r * Math.sin(a), z1]]); }
        [z0, (z0 + z1) / 2, z1].forEach(function (z) { var ring = []; for (j = 0; j <= N; j++) { var b = 2 * Math.PI * j / N; ring.push([r * Math.cos(b), r * Math.sin(b), z]); } out.push(ring); });
        out.patch = { cyl: r, z: [z0, z1] };
      } else {
        var Rr = Math.sqrt(k.c);
        for (i = 1; i < 6; i++) { var th = Math.PI * i / 6, ring2 = []; for (j = 0; j <= N; j++) { var b2 = 2 * Math.PI * j / N; ring2.push([Rr * Math.sin(th) * Math.cos(b2), Rr * Math.sin(th) * Math.sin(b2), Rr * Math.cos(th)]); } out.push(ring2); }
        for (i = 0; i < 8; i++) { var ph = Math.PI * i / 8, mer = []; for (j = 0; j <= N; j++) { var t2 = 2 * Math.PI * j / N; mer.push([Rr * Math.sin(t2) * Math.cos(ph), Rr * Math.sin(t2) * Math.sin(ph), Rr * Math.cos(t2)]); } out.push(mer); }
        out.patch = { sphere: Rr };
      }
      return out;
    }

    function current() {
      if (!C) return null;
      var t = Math.max(C.t0, Math.min(C.t1, tS.get())), p = C.at(t);
      var I = LM.info(F, pairs[iPair].g, pairs[iPair].h, p);
      I.t = t;
      return I;
    }

    function draw() {
      var I = current();
      if (!I) return;
      var hide = hideBox.checked && !solved;
      drawScene(I, hide);
      drawPlots(I, hide);
      if (view === '3d') schedule3D();
      var out = isFinite(I.out) ? I.out : 0;
      meterBar.style.width = Math.round(100 * Math.min(1, out)) + '%';
      meterTxt.textContent = Math.round(100 * out) + ' % fuera del plano';
      var P = pairs[iPair], q = '¿?';
      var ext = function (e) { return !e ? 'no existe' : e.kind === 'flat' ? 'f constante: ' + num(e.value, 5) : num(e.value, 5) + ' en ' + vec(e.p); };
      var rows = [
        ['restricciones', P.gt + '  y  ' + P.ht],
        ['t · punto P', fmtT(I.t) + ' · ' + vec(I.p)],
        ['g(P) · h(P)', num(I.g, 5) + ' · ' + num(I.h, 5)],
        ['f(P)', num(I.f, 5)],
        ['∇f', vec(I.gf)],
        ['∇g · ∇h', vec(I.gg) + ' · ' + vec(I.gh)],
        ['T = ∇g × ∇h', vec(I.T)],
        ['∇f · T/|T| (0 en un extremo)', num(I.tcomp, 4)],
        ['mejores λ, μ', num(I.lam) + ', ' + num(I.mu)],
        ['|∇f − λ∇g − μ∇h|', num(I.resid, 3)],
        ['máximo en la curva', hide ? q : ext(R.max)],
        ['mínimo en la curva', hide ? q : ext(R.min)],
        ['Newton-Lagrange', NL ? NL.sols.length + ' punto' + (NL.sols.length === 1 ? '' : 's') + ' crítico' + (NL.sols.length === 1 ? '' : 's') : '—']
      ];
      board.innerHTML = '';
      rows.forEach(function (r) { board.appendChild(h('dt', {}, [r[0]])); board.appendChild(h('dd', {}, [r[1]])); });
      jump.disabled = hide;
    }

    // Proyección SVG de la escena (móvil, o PC con «Vista plana»).
    function drawScene(I, hide) {
      var B = frame(), W = 640, Ht = 400, mg = 26;
      var az = 40 * Math.PI / 180, elv = 22 * Math.PI / 180, ca = Math.cos(az), sa = Math.sin(az), ce = Math.cos(elv), se = Math.sin(elv);
      function raw(p) {
        var X = (p[0] - B.c[0]) / B.half, Y = (p[1] - B.c[1]) / B.half, Z = (p[2] - B.c[2]) / B.half;
        var u = X * ca - Y * sa, v = X * sa + Y * ca;
        return [v, -(Z * ce - u * se)];
      }
      var corners = [];
      [B.lo[0], B.hi[0]].forEach(function (x) { [B.lo[1], B.hi[1]].forEach(function (y) { [B.lo[2], B.hi[2]].forEach(function (z) { corners.push(raw([x, y, z])); }); }); });
      // Las letras de los ejes van más allá de la caja: también deben caber.
      var ax = [[B.hi[0] + 0.3 * B.half, B.lo[1], B.lo[2]], [B.lo[0], B.hi[1] + 0.3 * B.half, B.lo[2]], [B.lo[0], B.lo[1], B.hi[2] + 0.3 * B.half]];
      ax.forEach(function (p) { corners.push(raw(p)); });
      var x0 = Math.min.apply(null, corners.map(function (q) { return q[0]; })), x1 = Math.max.apply(null, corners.map(function (q) { return q[0]; }));
      var y0 = Math.min.apply(null, corners.map(function (q) { return q[1]; })), y1 = Math.max.apply(null, corners.map(function (q) { return q[1]; }));
      var k = Math.min((W - 2 * mg) / (x1 - x0), (Ht - 2 * mg) / (y1 - y0)), ox = (W - k * (x1 - x0)) / 2, oy = (Ht - k * (y1 - y0)) / 2;
      function Pt(p) { var q = raw(p); return [ox + (q[0] - x0) * k, oy + (q[1] - y0) * k]; }
      function path(pts) { return pts.map(function (p, i) { var q = Pt(p); return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(''); }
      scene.innerHTML = '';
      var g = el('g', { class: 'sketch' }, scene), P = pairs[iPair];
      // Ejes desde la esquina de la caja, con su letra más allá de la punta.
      var o0 = Pt([B.lo[0], B.lo[1], B.lo[2]]);
      ax.forEach(function (p, i) {
        var e = Pt(p);
        el('path', { d: 'M' + o0[0].toFixed(1) + ' ' + o0[1].toFixed(1) + 'L' + e[0].toFixed(1) + ' ' + e[1].toFixed(1), class: 'axis', fill: 'none', 'stroke-width': 1.3 }, g);
        var dx = e[0] - o0[0], dy = e[1] - o0[1], L = Math.hypot(dx, dy) || 1;
        el('text', { x: (e[0] + dx / L * 12).toFixed(1), y: (e[1] + dy / L * 12 + 5).toFixed(1), class: 'lab-tick', 'text-anchor': 'middle' }, g, 'xyz'[i]);
      });
      [[P.g, 'ref'], [P.h, 'aux']].forEach(function (s) {
        var d = meshes(s[0], B).map(path).join('');
        el('path', { d: d, class: s[1], fill: 'none', 'stroke-width': 1.1, 'stroke-opacity': 0.45 }, g);
      });
      el('path', { d: path(samples(C.kind === 'closed' ? 160 : 2)), class: 'trace', fill: 'none', 'stroke-width': 3.6, 'stroke-linecap': 'round' }, g);
      if (!hide) [R.max, R.min].forEach(function (e) {
        if (!e || e.kind === 'flat') return;
        var q = Pt(e.p);
        el('circle', { cx: q[0], cy: q[1], r: 7, class: 'axis', fill: 'none', 'stroke-width': 2.4 }, g);
      });
      // Gradientes (solo dirección, largo fijo) y la tangente T̂.
      var Lr = 0.42 * B.half, p0 = Pt(I.p);
      function arrow(v, cls, w, dash) {
        var u = LM.unit(v);
        if (len(u) < 0.5) return;
        var q = Pt(plus(I.p, u, Lr)), dx = q[0] - p0[0], dy = q[1] - p0[1], L = Math.hypot(dx, dy);
        if (L < 4) return;
        var ux = dx / L, uy = dy / L, hh = Math.min(11, L * 0.4);
        var d = 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + 'L' + q[0].toFixed(1) + ' ' + q[1].toFixed(1) +
          'M' + (q[0] - ux * hh - uy * hh * 0.55).toFixed(1) + ' ' + (q[1] - uy * hh + ux * hh * 0.55).toFixed(1) + 'L' + q[0].toFixed(1) + ' ' + q[1].toFixed(1) +
          'L' + (q[0] - ux * hh + uy * hh * 0.55).toFixed(1) + ' ' + (q[1] - uy * hh - ux * hh * 0.55).toFixed(1);
        el('path', { d: d, class: cls, fill: 'none', 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': dash }, g);
      }
      arrow(I.That, 'axis', 1.8, '5 4');
      arrow(I.gg, 'ref', 2.8);
      arrow(I.gh, 'aux', 2.8);
      arrow(I.gf, 'error', 3.2);
      el('circle', { cx: p0[0], cy: p0[1], r: 6, class: 'dot-trace' }, g);
    }

    // f contra t y ∇f·T̂ contra t, con los extremos y la posición actual.
    function drawPlots(I, hide) {
      var t0 = C.t0, t1 = C.t1, fn = function (t) { return LM.phi(F, C, t); };
      var tc = function (t) { var Q = LM.info(F, pairs[iPair].g, pairs[iPair].h, C.at(t)); return Q.tcomp; };
      var fv = [], tv = [], i;
      for (i = 0; i <= 160; i++) { var t = t0 + (t1 - t0) * i / 160; fv.push(fn(t)); tv.push(tc(t)); }
      var r = range(fv, student != null && ask.field === 'value' ? [student] : []);
      var p = window.LabPlot(plotF, { x: [t0, t1], y: r });
      p.clear(); p.grid(); p.axes();
      p.curve(fn, 'ref', 3);
      p.segments([[[I.t, r[0]], [I.t, r[1]]]], 'axis', 1.2);
      if (!hide) [R.max, R.min].forEach(function (e) { if (e && e.kind !== 'flat') ring(plotF, p, e.t, e.value); });
      if (student != null && ask.field === 'value') p.segments([[[t0, student], [t1, student]]], 'student', 2);
      p.point(I.t, I.f, 'dot-trace', 6);
      var m = Math.max.apply(null, tv.filter(isFinite).map(Math.abs).concat([1e-6])) * 1.3;
      var q = window.LabPlot(plotT, { x: [t0, t1], y: [-m, m] });
      q.clear(); q.grid(); q.axes();
      q.curve(tc, 'aux', 3);
      q.segments([[[I.t, -m], [I.t, m]]], 'axis', 1.2);
      if (!hide) (R.list || []).forEach(function (e) { ring(plotT, q, e.t, 0); });
      q.point(I.t, I.tcomp, 'dot-trace', 6);
    }
    // Aro (máximo, mínimo o punto crítico) en una gráfica de LabPlot.
    function ring(svgEl, p, x, y) {
      var layer = svgEl.querySelector('g.sketch') || svgEl;
      el('circle', { cx: p.X(x), cy: p.Y(y), r: 7, class: 'axis', fill: 'none', 'stroke-width': 2.4 }, layer);
    }
    function range(vals, extra) {
      var v = vals.concat(extra).filter(isFinite), lo = Math.min.apply(null, v), hi = Math.max.apply(null, v);
      if (!(hi - lo > 1e-6)) { lo -= 1; hi += 1; }
      var pad = 0.14 * (hi - lo);
      return [lo - pad, hi + pad];
    }

    /* ---------- Vista 3D (solo PC) ---------- */
    function setView(v) {
      view = v === '3d' && scene3 ? '3d' : '2d';
      scene.style.display = view === '2d' ? '' : 'none';
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
      var I = current();
      if (!scene3 || !I) return;
      var B = frame(), k = 3.8 / B.half, P = pairs[iPair], hide = hideBox.checked && !solved;
      function P3(p) { return [(p[0] - B.c[0]) * k, (p[1] - B.c[1]) * k, (p[2] - B.c[2]) * k]; }
      var Cc = { ref: UI.color('--plot-ref'), aux: UI.color('--plot-aux'), err: UI.color('--plot-error'), tr: UI.color('--plot-trace'), ax: UI.color('--plot-axis') };
      var objs = [], TAU = 2 * Math.PI;
      function surf(func, u, v, res, color, opacity) {
        objs.push(new M3.Surface3D({ func: func, uRange: u, vRange: v, uResolution: res[0], vResolution: res[1], color: color, opacity: opacity, doubleSided: true }));
      }
      function ball(p, r, color) {
        var c = P3(p);
        surf(function (u, v) { return [c[0] + r * Math.sin(u) * Math.cos(v), c[1] + r * Math.sin(u) * Math.sin(v), c[2] + r * Math.cos(u)]; }, [0, Math.PI], [0, TAU], [10, 14], color, 1);
      }
      [[P.g, Cc.ref], [P.h, Cc.aux]].forEach(function (s) {
        var pc = meshes(s[0], B).patch;
        if (pc.at) surf(function (u, v) { return P3(pc.at(u, v)); }, pc.u, pc.v, [2, 2], s[1], 0.32);
        else if (pc.cyl) surf(function (u, v) { return P3([pc.cyl * Math.cos(u), pc.cyl * Math.sin(u), v]); }, [0, TAU], pc.z, [40, 2], s[1], 0.3);
        else surf(function (u, v) { return P3([pc.sphere * Math.sin(u) * Math.cos(v), pc.sphere * Math.sin(u) * Math.sin(v), pc.sphere * Math.cos(u)]); }, [0, Math.PI], [0, TAU], [24, 36], s[1], 0.26);
      });
      var pts = samples(C.kind === 'closed' ? 120 : 1).map(P3);
      for (var i = 1; i < pts.length; i++) objs.push(new M3.Line3D({ start: pts[i - 1], end: pts[i], color: Cc.tr, lineWidth: 5 }));
      if (!hide) [R.max, R.min].forEach(function (e) { if (e && e.kind !== 'flat') ball(e.p, 0.12, Cc.ax); });
      var A = P3(I.p), Lr = 1.5;
      [[I.gg, Cc.ref], [I.gh, Cc.aux], [I.gf, Cc.err]].forEach(function (a) {
        var u = LM.unit(a[0]);
        if (len(u) < 0.5) return;
        objs.push(new M3.Arrow3D({ start: A, end: plus(A, u, Lr), color: a[1], tipLength: 0.28, tipRadius: 0.1, shaftRadius: 0.03 }));
      });
      var T = LM.unit(I.T);
      if (len(T) > 0.5) objs.push(new M3.Line3D({ start: plus(A, T, -0.9), end: plus(A, T, 0.9), color: Cc.ax, lineWidth: 2 }));
      ball(I.p, 0.15, Cc.tr);
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
        scene3 = new M3.ThreeDScene(stage3d, { width: wd, height: Math.round(wd * 2 / 3), backgroundOpacity: 0, phi: 62 * Math.PI / 180, theta: 25 * Math.PI / 180, enableOrbitControls: true });
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
