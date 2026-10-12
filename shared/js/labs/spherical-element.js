/* =====================================================================
   Lab spherical-element (Cálculo 2 · S15): elemento de volumen esférico.
   Un sólido que es una «caja» en esféricas (ρ, θ, φ; φ desde el eje z
   positivo) o en cilíndricas (r, θ, z) se parte en cajitas con n₁, n₂, n₃
   divisiones. Se resalta una cajita con sus tres lados (dρ, ρ dφ y
   ρ sin φ dθ; o dr, r dθ y dz) y su volumen ≈ J·Δ₁Δ₂Δ₃. La suma de las
   cajitas (volumen o masa con una densidad δ) se compara con el valor
   exacto (integral iterada en el sistema curvilíneo, con el Jacobiano) y
   con Monte Carlo en x, y, z (el sistema original). Un interruptor quita el
   Jacobiano para ver el error.
   Vistas: en PC, 3D con manim-web; siempre, la proyección SVG con la
   cajita resaltada, el corte vertical (ρ–φ o r–z) y la planta (r–θ).
   Reto: el alumno escribe el volumen, la masa o z̄; el lab detecta si
   olvidó el Jacobiano, si usó ρ² sin el sin φ o ρ en vez de ρ², si puso
   φ de 0 a 2π, θ de 0 a π, o si olvidó la densidad.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  var PI = Math.PI;
  // Gauss–Legendre de 10 nodos y versión adaptiva por bisección (salida vectorial).
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
  // eps tiene un piso absoluto: si la integral vale 0 (φ de 0 a 2π), la bisección no se dispara.
  function adapt(f, a, b, k, tol, depth, whole, eps) {
    if (a === b) { var z = []; for (var j = 0; j < k; j++) z.push(0); return z; }
    whole = whole || glv(f, a, b, k);
    if (eps == null) eps = Math.max(tol * maxAbs(whole), 1e-13);
    var m = (a + b) / 2, L = glv(f, a, m, k), R = glv(f, m, b, k), sum = [], diff = 0;
    for (var i = 0; i < k; i++) { sum.push(L[i] + R[i]); diff = Math.max(diff, Math.abs(sum[i] - whole[i])); }
    if (depth <= 0 || diff <= eps || !isFinite(diff)) return sum;
    var A = adapt(f, a, m, k, tol, depth - 1, L, eps / 1.5), B = adapt(f, m, b, k, tol, depth - 1, R, eps / 1.5);
    return A.map(function (x, i2) { return x + B[i2]; });
  }
  function quad1(f, a, b, tol) { return adapt(function (x) { return [f(x)]; }, a, b, 1, tol || 1e-12, 30)[0]; }

  // Coordenadas: 'sph' = (ρ, θ, φ) con φ desde el eje z positivo; 'cyl' = (r, θ, z).
  function toXYZ(sys, a, b, c) {
    if (sys === 'cyl') return [a * Math.cos(b), a * Math.sin(b), c];
    var s = Math.sin(c);
    return [a * s * Math.cos(b), a * s * Math.sin(b), a * Math.cos(c)];
  }
  function fromXYZ(sys, x, y, z) {
    var r = Math.hypot(x, y), th = Math.atan2(y, x);
    if (th < 0) th += 2 * PI;
    if (sys === 'cyl') return [r, th, z];
    return [Math.hypot(r, z), th, Math.atan2(r, z)];
  }
  // Jacobiano exacto: |∂(x, y, z)/∂(ρ, θ, φ)| = ρ² sin φ; en cilíndricas, r.
  function jac(sys, a, b, c) { return sys === 'cyl' ? Math.abs(a) : Math.abs(a * a * Math.sin(c)); }
  // Factores de escala, el correcto y los de los errores típicos.
  function weightFn(sys, w) {
    if (!w || w === 'jac') return function (a, b, c) { return jac(sys, a, b, c); };
    if (w === 'none') return function () { return 1; };
    if (w === 'rho2') return function (a) { return a * a; };                    // ρ² sin el sin φ
    if (w === 'rho1') return function (a, b, c) { return a * Math.sin(c); };    // ρ sin φ en vez de ρ² sin φ
    throw new Error('peso desconocido ' + w);
  }

  // Jacobiano numérico: determinante de la matriz de derivadas parciales por diferencias
  // centradas de cinco puntos. F: arreglo de coordenadas → arreglo (2 o 3 componentes).
  function d5(F, u, i, h) {
    function at(t) { var v = u.slice(); v[i] += t; return F(v); }
    var p1 = at(h), m1 = at(-h), p2 = at(2 * h), m2 = at(-2 * h);
    return p1.map(function (_, q) { return (8 * (p1[q] - m1[q]) - (p2[q] - m2[q])) / (12 * h); });
  }
  function det(M) {
    if (M.length === 2) return M[0][0] * M[1][1] - M[0][1] * M[1][0];
    return M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
  }
  function numJacobian(F, u, h) {
    h = h || 1e-3;
    var cols = u.map(function (_, i) { return d5(F, u, i, h); });
    var M = cols[0].map(function (_, r) { return cols.map(function (col) { return col[r]; }); });
    return Math.abs(det(M));
  }
  // Jacobiano numérico de 'polar' (r, θ), 'cyl' (r, θ, z) o 'sph' (ρ, θ, φ) en un punto.
  function jacobian(sys, a, b, c) {
    if (sys === 'polar') return numJacobian(function (v) { return [v[0] * Math.cos(v[1]), v[0] * Math.sin(v[1])]; }, [a, b]);
    return numJacobian(function (v) { return toXYZ(sys, v[0], v[1], v[2]); }, [a, b, c]);
  }

  // ∫∫∫ g(a, b, c) da db dc sobre la caja L = [[a0, a1], [b0, b1], [c0, c1]] (g devuelve un arreglo).
  function integrateU(g, L, k, tol) {
    tol = tol || 1e-11;
    return adapt(function (a) {
      return adapt(function (b) {
        return adapt(function (c) { return g(a, b, c); }, L[2][0], L[2][1], k, tol, 22);
      }, L[1][0], L[1][1], k, tol, 22);
    }, L[0][0], L[0][1], k, tol, 22);
  }
  // ∭ f(x, y, z) dV sobre el sólido L del sistema sys, con el factor w (por omisión el Jacobiano).
  // f puede devolver un número o un arreglo.
  function integrate(f, sys, L, w, tol) {
    var W = weightFn(sys, w), m = function (r) { return (r[0] + r[1]) / 2; };
    var p0 = toXYZ(sys, m(L[0]), m(L[1]), m(L[2])), probe = f(p0[0], p0[1], p0[2]);
    var vec = Array.isArray(probe), k = vec ? probe.length : 1;
    var r = integrateU(function (a, b, c) {
      var p = toXYZ(sys, a, b, c), v = f(p[0], p[1], p[2]), J = W(a, b, c);
      if (!vec) return [v * J];
      var o = []; for (var i = 0; i < k; i++) o.push(v[i] * J); return o;
    }, L, k, tol);
    return vec ? r : r[0];
  }
  // Volumen, masa, momento M_xy y z̄ (y el centroide geométrico z̄ con δ = 1).
  function moments(rho, sys, L) {
    var r = integrate(function (x, y, z) { var d = rho(x, y, z); return [1, d, z * d, z, x * d, y * d]; }, sys, L);
    return { V: r[0], M: r[1], Mxy: r[2], zbar: r[2] / r[1], xbar: r[4] / r[1], ybar: r[5] / r[1], geo: { z: r[3] / r[0] } };
  }

  // Sólido como caja en su sistema: L, caja envolvente en x, y, z y la prueba «¿está adentro?».
  function region(sys, L, key) {
    var a0 = L[0][0], a1 = L[0][1], c0 = L[2][0], c1 = L[2][1], box;
    if (sys === 'cyl') box = [[-a1, a1], [-a1, a1], [c0, c1]];
    else {
      var rmax = a1 * (c0 <= PI / 2 && c1 >= PI / 2 ? 1 : Math.max(Math.sin(c0), Math.sin(c1)));
      var zhi = Math.cos(c0) >= 0 ? a1 * Math.cos(c0) : a0 * Math.cos(c0);
      var zlo = Math.cos(c1) <= 0 ? a1 * Math.cos(c1) : a0 * Math.cos(c1);
      box = [[-rmax, rmax], [-rmax, rmax], [zlo, zhi]];
    }
    var e = 1e-12;
    return {
      key: key || sys, sys: sys, L: L, box: box,
      fullTheta: Math.abs(L[1][0]) < e && Math.abs(L[1][1] - 2 * PI) < 1e-9,
      inside: function (x, y, z) {
        var u = fromXYZ(sys, x, y, z);
        return u[0] >= L[0][0] - e && u[0] <= L[0][1] + e && u[1] >= L[1][0] - e && u[1] <= L[1][1] + e && u[2] >= L[2][0] - e && u[2] <= L[2][1] + e;
      }
    };
  }
  var PRESET_L = {
    ball: ['sph', function (p) { return [[0, p.R], [0, 2 * PI], [0, PI]]; }, { R: 2 }],
    shell: ['sph', function (p) { return [[p.a, p.b], [0, 2 * PI], [0, PI]]; }, { a: 1, b: 2 }],
    cone: ['sph', function (p) { return [[0, p.R], [0, 2 * PI], [0, p.al]]; }, { R: 2, al: PI / 4 }],
    wedge: ['sph', function (p) { return [[0, p.R], [0, p.be], [0, PI]]; }, { R: 2, be: PI / 2 }],
    hemi: ['sph', function (p) { return [[0, p.R], [0, 2 * PI], [0, PI / 2]]; }, { R: 2 }],
    cyl: ['cyl', function (p) { return [[0, p.R], [0, 2 * PI], [0, p.H]]; }, { R: 2, H: 3 }],
    tube: ['cyl', function (p) { return [[p.a, p.b], [0, 2 * PI], [0, p.H]]; }, { a: 1, b: 2, H: 3 }]
  };
  function solidOf(key, p) {
    var d = PRESET_L[key] || PRESET_L.ball, q = Object.assign({}, d[2], p || {});
    return region(d[0], d[1](q), PRESET_L[key] ? key : 'ball');
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
  // Monte Carlo en x, y, z (el sistema original) dentro de la caja envolvente.
  function monteCarlo(rho, S, N, seed) {
    var R = rng(seed == null ? 15 : seed), B = S.box, vb = (B[0][1] - B[0][0]) * (B[1][1] - B[1][0]) * (B[2][1] - B[2][0]);
    var n = 0, s1 = 0, q1 = 0, sz = 0;
    for (var i = 0; i < N; i++) {
      var x = B[0][0] + (B[0][1] - B[0][0]) * R(), y = B[1][0] + (B[1][1] - B[1][0]) * R(), z = B[2][0] + (B[2][1] - B[2][0]) * R();
      if (!S.inside(x, y, z)) continue;
      var p = rho(x, y, z);
      n++; s1 += p; q1 += p * p; sz += z * p;
    }
    var f = n / N, mp = s1 / N;
    return { N: N, V: vb * f, M: vb * mp, seV: vb * Math.sqrt(f * (1 - f) / N), seM: vb * Math.sqrt(Math.max(0, q1 / N - mp * mp) / N), Mxy: vb * sz / N, zbar: sz / s1 };
  }

  // Una cajita (i, j, k) con n = [n1, n2, n3] divisiones: límites, centro, lados y volumen.
  function cell(S, n, i, j, k) {
    var L = S.L, d = [0, 1, 2].map(function (q) { return (L[q][1] - L[q][0]) / n[q]; });
    var lo = [L[0][0] + i * d[0], L[1][0] + j * d[1], L[2][0] + k * d[2]], hi = [lo[0] + d[0], lo[1] + d[1], lo[2] + d[2]];
    var c = [lo[0] + d[0] / 2, lo[1] + d[1] / 2, lo[2] + d[2] / 2], sides, exact;
    if (S.sys === 'cyl') {
      sides = [d[0], c[0] * d[1], d[2]];                                   // dr, r dθ, dz
      exact = (hi[0] * hi[0] - lo[0] * lo[0]) / 2 * d[1] * d[2];
    } else {
      sides = [d[0], c[0] * d[2], c[0] * Math.sin(c[2]) * d[1]];          // dρ, ρ dφ, ρ sin φ dθ
      exact = (Math.pow(hi[0], 3) - Math.pow(lo[0], 3)) / 3 * d[1] * (Math.cos(lo[2]) - Math.cos(hi[2]));
    }
    return { lo: lo, hi: hi, c: c, d: d, sides: sides, approx: jac(S.sys, c[0], c[1], c[2]) * d[0] * d[1] * d[2], exact: exact };
  }
  // Suma de cajitas en el centro de cada una: Σ δ J Δ₁Δ₂Δ₃ (sin el Jacobiano si noJac).
  function cells(rho, S, n, noJac) {
    var L = S.L, d = [0, 1, 2].map(function (q) { return (L[q][1] - L[q][0]) / n[q]; }), dU = d[0] * d[1] * d[2];
    var V = 0, M = 0, Mz = 0, ex = 0;
    for (var i = 0; i < n[0]; i++) for (var j = 0; j < n[1]; j++) for (var k = 0; k < n[2]; k++) {
      var a = L[0][0] + (i + 0.5) * d[0], b = L[1][0] + (j + 0.5) * d[1], c = L[2][0] + (k + 0.5) * d[2];
      var p = toXYZ(S.sys, a, b, c), w = (noJac ? 1 : jac(S.sys, a, b, c)) * dU, dd = rho(p[0], p[1], p[2]);
      V += w; M += dd * w; Mz += p[2] * dd * w;
      ex += cell(S, n, i, j, k).exact;
    }
    return { n: n.slice(), count: n[0] * n[1] * n[2], V: V, M: M, zbar: Mz / M, exactSum: ex, noJac: !!noJac };
  }

  // Valores exactos y los de cada error típico. Una sola pasada da los cuatro factores.
  function analyze(rho, S) {
    var sys = S.sys, L = S.L, Ws = ['jac', 'none', 'rho2', 'rho1'].map(function (w) { return weightFn(sys, w); });
    function pass(LL, ws) {
      return integrateU(function (a, b, c) {
        var p = toXYZ(sys, a, b, c), d = rho(p[0], p[1], p[2]), o = [];
        ws.forEach(function (W) { var w = W(a, b, c); o.push(w, w * d, w * p[2] * d, w * p[2]); });
        return o;
      }, LL, 4 * ws.length);
    }
    function pack(r, o) { return { V: r[o], M: r[o + 1], Mxy: r[o + 2], zbar: r[o + 2] / r[o + 1], geo: r[o + 3] / r[o] }; }
    var r = pass(L, sys === 'cyl' ? Ws.slice(0, 2) : Ws);
    var c = pack(r, 0);
    c.geo = { z: c.geo };
    c.wrong = { noJac: pack(r, 4) };
    if (sys === 'sph') { c.wrong.rho2 = pack(r, 8); c.wrong.rho1 = pack(r, 12); }
    if (S.fullTheta) c.wrong.thetaHalf = pack(pass([L[0], [L[1][0], L[1][0] + PI], L[2]], [Ws[0]]), 0);
    if (sys === 'sph' && Math.abs(L[2][0]) < 1e-12 && Math.abs(L[2][1] - PI) < 1e-9) {
      // El alumno escribe ρ² sin φ sin valor absoluto: de π a 2π el seno es negativo y cancela.
      var extra = pass([L[0], L[1], [PI, 2 * PI]], [function (a, b, c) { return a * a * Math.sin(c); }]);
      c.wrong.phi2pi = { V: r[0] + extra[0], M: r[1] + extra[1] };
    }
    return c;
  }

  // Cerca con la holgura de los ejercicios: ±0.01 (o ±1 %) desde 0.1; abajo, ±1 % o 0.0005.
  function near(s, t) {
    var d = Math.abs(s - t), at = Math.abs(t);
    if (at >= 0.1) return d <= Math.max(0.01, 0.01 * at) + 1e-9;
    return d <= Math.max(0.01 * at, 5e-4) + 1e-12;
  }
  function want(c, mode) { return mode === 'V' ? c.V : mode === 'M' ? c.M : c.zbar; }
  // Errores típicos de cada reto, en orden de prioridad.
  function candidates(c, mode) {
    var w = c.wrong, out = [];
    function add(key, obj, f) { if (obj && obj[f] != null && isFinite(obj[f])) out.push([key, obj[f]]); }
    if (mode === 'zbar') {
      out.push(['noDiv', c.Mxy], ['byVol', c.Mxy / c.V], ['noRho', c.geo.z]);
      add('noJac', w.noJac, 'zbar');
      return out;
    }
    var f = mode === 'V' ? 'V' : 'M';
    if (mode === 'M') out.push(['noRho', c.V]);
    add('noJac', w.noJac, f); add('rho2', w.rho2, f); add('rho1', w.rho1, f);
    add('thetaHalf', w.thetaHalf, f); add('phi2pi', w.phi2pi, f);
    return out;
  }
  // Diagnóstico del número del alumno → { kind: ok|warn|bad|invalid, reason, want }.
  // reason: correct · noJac · rho2 · rho1 · thetaHalf · phi2pi · noRho · noDiv · byVol · mismatch
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

  window.LabMath.sphElement = {
    quad1: quad1, toXYZ: toXYZ, fromXYZ: fromXYZ, jac: jac, jacobian: jacobian, numJacobian: numJacobian,
    integrate: integrate, moments: moments, region: region, solidOf: solidOf, rng: rng, monteCarlo: monteCarlo,
    cell: cell, cells: cells, analyze: analyze, near: near, want: want, candidates: candidates, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { key: 'ball', name: 'Esfera: ρ ≤ 2' },
    { key: 'shell', name: 'Cascarón: 1 ≤ ρ ≤ 2' },
    { key: 'cone', name: 'Cono de helado: ρ ≤ 2, 0 ≤ φ ≤ π/4' },
    { key: 'wedge', name: 'Gajo de esfera: ρ ≤ 2, 0 ≤ θ ≤ π/2' },
    { key: 'hemi', name: 'Hemisferio: ρ ≤ 2, 0 ≤ φ ≤ π/2' },
    { key: 'cyl', name: 'Cilindro: r ≤ 2, 0 ≤ z ≤ 3' },
    { key: 'tube', name: 'Cilindro con hueco: 1 ≤ r ≤ 2, 0 ≤ z ≤ 3' }
  ];
  var DENS = [['1', 'δ = 1 (solo volumen)'], ['sqrt(x^2 + y^2 + z^2)', 'δ = ρ (más denso afuera)'], ['1/(1 + x^2 + y^2 + z^2)', 'δ = 1/(1 + ρ²) (núcleo más denso)'], ['x^2 + y^2', 'δ = x² + y² = r²'], ['3 + z', 'δ = 3 + z (más denso arriba)']];
  var MODES = [['V', 'Volumen ∭ 1 dV'], ['M', 'Masa ∭ δ dV'], ['zbar', 'z̄ del centro de masa']];
  var NAMES = {
    sph: { u: ['ρ', 'θ', 'φ'], sides: ['dρ', 'ρ dφ', 'ρ sin φ dθ'], J: 'ρ² sin φ', i: 'Cajita: capa en ρ (i)', k: 'Cajita: franja en φ (k)' },
    cyl: { u: ['r', 'θ', 'z'], sides: ['dr', 'r dθ', 'dz'], J: 'r', i: 'Cajita: anillo en r (i)', k: 'Cajita: piso en z (k)' }
  };
  var NS = 'http://www.w3.org/2000/svg', MC_N = 40000, CONV = 10;

  window.Labs['spherical-element'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, LM = window.LabMath.sphElement;
    var presets = cfg.presets || PRESETS, start = cfg.start != null ? cfg.start : 0;
    var math = null, P = presets[start], S = LM.solidOf(P.key), rho = null;
    var exact = null, mc = null, conv = null, convNo = null, mode = 'V', solved = false, student = null;

    var preset = UI.select({ label: 'Sólido', options: presets.map(function (p) { return p.name; }) });
    var densSel = UI.select({ label: 'Densidad (ejemplos)', options: DENS.map(function (d) { return d[1]; }) });
    var rIn = UI.mathField({ label: 'Densidad δ(x, y, z)', hint: 'Escribe δ en términos de x, y y z; con δ = 1 la masa es el volumen.', palette: 'multi', onEnter: function () { build(); } });
    var run = UI.button('Calcular', 'primary', function () { build(); });
    var status = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var n1 = UI.slider({ label: 'Divisiones en ρ', min: 1, max: 8, step: 1, value: cfg.n1 || 3 }, function () { clampSel(); moved(); });
    var n2 = UI.slider({ label: 'Divisiones en θ', min: 1, max: 12, step: 1, value: cfg.n2 || 8 }, function () { moved(); });
    var n3 = UI.slider({ label: 'Divisiones en φ', min: 1, max: 8, step: 1, value: cfg.n3 || 4 }, function () { clampSel(); moved(); });
    var iS = UI.slider({ label: NAMES.sph.i, min: 1, max: cfg.n1 || 3, step: 1, value: cfg.n1 || 3 }, function () { moved(); });
    var kS = UI.slider({ label: NAMES.sph.k, min: 1, max: cfg.n3 || 4, step: 1, value: 2 }, function () { moved(); });
    var noJ = h('input', { type: 'checkbox', id: UI.id('se-nojac') });
    var noJRow = h('label', { class: 'se-check', for: noJ.id }, [noJ, ' Sin el Jacobiano: sumar solo Δρ Δθ Δφ (para ver el error)']);
    var modeSel = UI.select({ label: 'Reto', options: MODES.map(function (m) { return m[1]; }) });
    var ans = UI.input({ label: 'Tu volumen', type: 'text', inputmode: 'decimal', mono: false, hint: 'Redondea a 2 decimales.' });
    var hideBox = h('input', { type: 'checkbox', id: UI.id('se-hide') });
    var hideRow = h('label', { class: 'se-check', for: hideBox.id }, [hideBox, ' Tapar el valor exacto, Monte Carlo y z̄ (para el reto)']);
    var check = UI.button('Comprobar', 'primary', function () { verify(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var iso = UI.svg(640, 420, 'El sólido en perspectiva con su rejilla de cajitas y la cajita resaltada con sus tres lados');
    var cut = UI.svg(400, 340, 'Corte vertical: las cajitas vistas de lado');
    var plan = UI.svg(400, 340, 'Planta: el sólido visto desde arriba, partido en sectores de θ');
    var convS = UI.svg(640, 230, 'Convergencia de la suma de cajitas al aumentar las divisiones, con y sin el Jacobiano');
    var capCut = h('p', { class: 'lab-stack__label' }), capPlan = h('p', { class: 'lab-stack__label' }), capConv = h('p', { class: 'lab-stack__label' });
    var board = h('dl', { class: 'lab-facts se-board' });
    var legSides = [h('span'), h('span'), h('span')];
    var want3D = !!(window.matchMedia && window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches);
    var stage3d = h('div', { class: 'lab-stage lab-stage--manim lab-stage--3d', hidden: true, role: 'img', 'aria-label': 'El sólido en 3D con la cajita resaltada; arrastra para girarlo' });
    var note3d = h('p', { class: 'lab-note', hidden: true }, ['Arrastra para girar el sólido; la rueda del mouse acerca y aleja.']);
    var btn3d = UI.button('Vista 3D', 'ghost', function () { setView('3d'); });
    var btn2d = UI.button('Vista plana', 'ghost', function () { setView('2d'); });
    var viewBar = h('div', { class: 'lab-buttons lab-viewbar', hidden: !want3D, role: 'group', 'aria-label': 'Tipo de vista' }, [btn3d, btn2d]);
    var M3 = null, scene3 = null, view = '2d', pending3 = false;

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls se-controls', novalidate: true }, [
        preset.node, densSel.node, rIn.node, h('div', { class: 'lab-buttons' }, [run]), status,
        n1.node, n2.node, n3.node, iS.node, kS.node, noJRow,
        modeSel.node, ans.node, hideRow, h('div', { class: 'lab-buttons' }, [check]), verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Elemento de volumen']),
        viewBar, iso, stage3d, note3d,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--error' }), legSides[0]]),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), legSides[1]]),
          h('li', {}, [h('i', { class: 'sw sw--student' }), legSides[2]])
        ]),
        h('div', { class: 'se-views' }, [h('div', {}, [capCut, cut]), h('div', {}, [capPlan, plan])]),
        h('p', { class: 'lab-stack__label' }, ['Tablero en vivo']),
        board,
        capConv, convS,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'cajitas y suma con el Jacobiano']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'suma sin el Jacobiano']),
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'sólido y valor exacto']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu respuesta'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); build(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); build(); });
    densSel.input.addEventListener('change', function () { rIn.setMath(DENS[+densSel.input.value][0]); setTimeout(build, 0); });
    modeSel.input.addEventListener('change', function () { mode = MODES[+modeSel.input.value][0]; relabel(); reset(); draw(); });
    hideBox.addEventListener('change', function () { draw(); });
    noJ.addEventListener('change', function () { draw(); });
    ans.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); verify(); } });

    function num(v, d) { return UI.fmt(v, d || 5).replace('-', '−'); }
    function lab(sl, s) { sl.node.querySelector('label').textContent = s; }
    function relabel() {
      var N = NAMES[S.sys];
      lab(n1, 'Divisiones en ' + N.u[0]); lab(n2, 'Divisiones en θ'); lab(n3, 'Divisiones en ' + N.u[2]);
      lab(iS, N.i); lab(kS, N.k);
      noJRow.lastChild.textContent = ' Sin el Jacobiano: sumar solo Δ' + N.u[0] + ' Δθ Δ' + N.u[2] + ' (para ver el error)';
      ans.node.querySelector('label').textContent = { V: 'Tu volumen', M: 'Tu masa', zbar: 'Tu z̄' }[mode];
      legSides.forEach(function (s, q) { s.textContent = 'lado ' + N.sides[q]; });
    }
    function clampSel() {
      iS.input.max = n1.get(); if (iS.get() > n1.get()) iS.set(n1.get());
      kS.input.max = n3.get(); if (kS.get() > n3.get()) kS.set(n3.get());
    }
    function load(i) { P = presets[i]; S = LM.solidOf(P.key); ans.input.value = ''; relabel(); reset(); }
    function reset() { verdict.hidden = true; solved = false; student = null; }
    function moved() { reset(); draw(); }
    preset.input.value = String(start);
    densSel.input.value = String(cfg.dens || 0);
    rIn.setMath(DENS[cfg.dens || 0][0]);
    relabel();

    // Compila δ, calcula el exacto, Monte Carlo y la convergencia (solo al cambiar sólido o densidad).
    function build() {
      if (!math) return;
      try {
        var s = String(rIn.get() || '').trim() || '1';
        var fn = window.LabMath.core.build(math, s, ['x', 'y', 'z']).fn, bad = 0;
        for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) for (var k = 0; k < 4; k++) {
          var p = LM.toXYZ(S.sys, S.L[0][0] + (S.L[0][1] - S.L[0][0]) * (i + 0.5) / 4, S.L[1][0] + (S.L[1][1] - S.L[1][0]) * (j + 0.5) / 4, S.L[2][0] + (S.L[2][1] - S.L[2][0]) * (k + 0.5) / 4);
          if (!isFinite(fn(p[0], p[1], p[2]))) bad++;
        }
        if (bad > 0) throw new Error('La densidad no está definida en todo el sólido.');
        var c = LM.analyze(fn, S);
        if (!(c.M > 0)) throw new Error('Con esa densidad la masa sale ' + num(c.M, 4) + ': usa una densidad positiva.');
        rho = fn; exact = c;
        mc = LM.monteCarlo(fn, S, MC_N, 15);
        conv = []; convNo = [];
        for (var n = 1; n <= CONV; n++) { conv.push(LM.cells(fn, S, [n, n, n])); convNo.push(LM.cells(fn, S, [n, n, n], true)); }
        status.hidden = true;
      } catch (e) { UI.verdict(status, 'bad', 'No pude calcular', e.message); return; }
      reset();
      draw();
    }
    function nn() { return [n1.get(), n2.get(), n3.get()]; }
    function calc() { return rho ? LM.cells(rho, S, nn(), noJ.checked) : null; }
    function sel() { var n = nn(); return LM.cell(S, n, Math.min(iS.get(), n[0]) - 1, 0, Math.min(kS.get(), n[2]) - 1); }

    function verify() {
      if (!exact || !math) return;
      var raw = String(ans.input.value || '');
      var s = window.CBExercises ? window.CBExercises.parseNumber(raw, math) : parseFloat(raw.replace(',', '.').replace('−', '-'));
      if (!isFinite(s)) { UI.verdict(verdict, 'bad', 'Escribe un número', 'Usa punto decimal; por ejemplo 33.51.'); return; }
      var r = LM.diagnose(s, exact, mode), N = NAMES[S.sys], sph = S.sys === 'sph';
      student = s;
      var what = { V: 'el volumen', M: 'la masa', zbar: 'z̄' }[mode], t = r.want;
      var mcv = mode === 'V' ? mc.V : mode === 'M' ? mc.M : mc.zbar, mcs = mode === 'V' ? ' ± ' + num(2 * mc.seV, 2) : mode === 'M' ? ' ± ' + num(2 * mc.seM, 2) : '';
      var msgs = {
        correct: ['Correcto: ' + what + ' = ' + num(t, 5), 'La integral en ' + (sph ? 'esféricas' : 'cilíndricas') + ' con el Jacobiano ' + N.J + ' da ' + num(t, 6) + '; Monte Carlo en x, y, z con ' + MC_N + ' puntos da ' + num(mcv, 4) + mcs + '.'],
        noJac: ['Casi: olvidaste el Jacobiano', 'Integraste d' + N.u[0] + ' dθ d' + N.u[2] + ' como si las cajitas midieran todas lo mismo. El volumen de cada una es ' + N.J + ' d' + N.u[0] + ' dθ d' + N.u[2] + '.'],
        rho2: ['Casi: te faltó el sin φ', 'Usaste ρ² dρ dθ dφ. El lado horizontal de la cajita es ρ sin φ dθ, no ρ dθ: el factor completo es ρ² sin φ.'],
        rho1: ['Casi: usaste ρ en vez de ρ²', 'Dos de los lados de la cajita llevan ρ (ρ dφ y ρ sin φ dθ): el factor es ρ² sin φ, no ρ sin φ.'],
        thetaHalf: ['Casi: θ va de 0 a 2π', 'Pusiste θ de 0 a π: así solo recorres medio sólido. θ da la vuelta completa alrededor del eje z.'],
        phi2pi: ['Casi: φ va de 0 a π', 'Con φ de 0 a 2π el sin φ se vuelve negativo y se cancela. φ se mide desde el eje z positivo y llega hasta el negativo: de 0 a π.'],
        noRho: mode === 'M' ? ['Olvidaste la densidad', 'Eso es el volumen ∭ 1 dV. La masa es ∭ δ dV: multiplica cada cajita por su densidad.']
          : ['Ese es el centroide geométrico', 'Con densidad variable el centro de masa se corre hacia donde hay más masa: usa ∭ zδ dV ÷ M.'],
        noDiv: ['No dividiste entre la masa', 'Eso es el momento ∭ zδ dV. z̄ es momento ÷ masa.'],
        byVol: ['Dividiste entre el volumen', 'Con densidad variable divide el momento entre la masa M = ∭ δ dV, no entre V.'],
        mismatch: ['No coincide', mode === 'zbar' ? 'Calcula M_xy = ∭ zδ dV y M = ∭ δ dV con el Jacobiano y divide. En esféricas, z = ρ cos φ.' : 'Escribe los límites de ' + N.u.join(', ') + ' y multiplica por el Jacobiano ' + N.J + (mode === 'M' ? ' y por la densidad.' : '.')]
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
    function U(a, b, c) { return LM.toXYZ(S.sys, a, b, c); }
    // Curva en coordenadas del sistema: t de 0 a 1 entre dos puntos (a, b, c).
    function line3(p, q, m) { var o = []; for (var s = 0; s <= m; s++) { var t = s / m; o.push(U(p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t)); } return o; }

    function draw() {
      var c = calc();
      if (!c || !exact) return;
      var C = sel(), N = NAMES[S.sys], sph = S.sys === 'sph';
      drawIso(C);
      drawCut(C);
      drawPlan(C);
      drawConv(c);
      if (view === '3d') schedule3D();
      capCut.textContent = sph ? 'Corte vertical (ρ y φ): cada cajita es un pedazo de anillo' : 'Corte vertical (r y z): cada cajita es un rectángulo';
      capPlan.textContent = 'Planta (vista desde arriba): ' + c.n[1] + ' sectores de θ';
      capConv.textContent = 'Convergencia de la suma (' + (mode === 'V' ? 'volumen' : mode === 'M' ? 'masa' : 'z̄') + ') con n = 1, …, ' + CONV + ' divisiones en cada coordenada';
      var hide = hideBox.checked && !solved, qm = '¿?', s = C.sides;
      var rows = [
        ['cajita resaltada', N.u[0] + ' ∈ [' + num(C.lo[0], 3) + ', ' + num(C.hi[0], 3) + '] · θ ∈ [0, ' + num(C.hi[1], 3) + '] · ' + N.u[2] + ' ∈ [' + num(C.lo[2], 3) + ', ' + num(C.hi[2], 3) + ']'],
        ['sus lados (en el centro)', N.sides[0] + ' = ' + num(s[0], 3) + ' · ' + N.sides[1] + ' = ' + num(s[1], 3) + ' · ' + N.sides[2] + ' = ' + num(s[2], 3)],
        ['ΔV ≈ ' + N.J + ' Δ' + N.u[0] + ' Δθ Δ' + N.u[2], num(C.approx, 4) + ' (el volumen exacto de la cajita es ' + num(C.exact, 4) + ')'],
        ['sin el Jacobiano: Δ' + N.u[0] + ' Δθ Δ' + N.u[2], num(C.d[0] * C.d[1] * C.d[2], 4)],
        [(c.noJac ? 'suma SIN Jacobiano' : 'suma de cajitas') + ' (' + c.count + ')', 'V ≈ ' + num(c.V) + ' · M ≈ ' + num(c.M)],
        ['exacto (integral en ' + (sph ? 'esféricas' : 'cilíndricas') + ')', hide ? qm : 'V = ' + num(exact.V, 6) + ' · M = ' + num(exact.M, 6)],
        ['Monte Carlo en x, y, z (' + MC_N + ' puntos, semilla fija)', hide ? qm : 'V ≈ ' + num(mc.V, 4) + ' ± ' + num(2 * mc.seV, 2) + ' · M ≈ ' + num(mc.M, 4) + ' ± ' + num(2 * mc.seM, 2)],
        ['error de la suma (masa)', hide ? qm : num(100 * (c.M - exact.M) / exact.M, 3) + ' %'],
        ['z̄ del centro de masa', hide ? qm : num(exact.zbar, 4) + ' (Monte Carlo ' + num(mc.zbar, 3) + ')']
      ];
      board.innerHTML = '';
      rows.forEach(function (r) { board.appendChild(h('dt', {}, [r[0]])); board.appendChild(h('dd', {}, [r[1]])); });
    }

    // Proyección oblicua del sólido (la cámara mira desde +x, +y, +z).
    function projector() {
      var B = S.box, az = -35 * PI / 180, elv = 22 * PI / 180, ca = Math.cos(az), sa = Math.sin(az), ce = Math.cos(elv), se = Math.sin(elv);
      function raw(p) { var u = p[0] * ca - p[1] * sa, v = p[0] * sa + p[1] * ca; return [v, -(p[2] * ce - u * se)]; }
      var R = Math.max(B[0][1], B[1][1]), zt = Math.max(B[2][1], 0) + 0.3 * R, zb = Math.min(B[2][0], 0);
      var ext = [1.35 * R, 1.35 * R, zt], pts = [];
      [-R, ext[0]].forEach(function (x) { [-R, ext[1]].forEach(function (y) { [zb, zt].forEach(function (z) { pts.push(raw([x, y, z])); }); }); });
      var x0 = Math.min.apply(null, pts.map(function (q) { return q[0]; })), x1 = Math.max.apply(null, pts.map(function (q) { return q[0]; }));
      var y0 = Math.min.apply(null, pts.map(function (q) { return q[1]; })), y1 = Math.max.apply(null, pts.map(function (q) { return q[1]; }));
      var W = 640, H = 420, mg = 26, k = Math.min((W - 2 * mg) / (x1 - x0), (H - 2 * mg) / (y1 - y0)), ox = (W - k * (x1 - x0)) / 2, oy = (H - k * (y1 - y0)) / 2;
      return { ext: ext, P: function (p) { var q = raw(p); return [ox + (q[0] - x0) * k, oy + (q[1] - y0) * k]; } };
    }
    // Rejilla de las caras de la frontera (caras degeneradas, como ρ = 0 o φ = 0, se omiten).
    function frame(n) {
      var L = S.L, out = [], m = 28, sph = S.sys === 'sph';
      function grid(q) { var o = []; for (var t = 0; t <= n[q]; t++) o.push(L[q][0] + (L[q][1] - L[q][0]) * t / n[q]); return o; }
      var g = [grid(0), grid(1), grid(2)];
      [0, 1].forEach(function (e) {                                            // caras a = const
        var a = L[0][e];
        if (a <= 1e-12) return;
        g[1].forEach(function (b) { out.push(line3([a, b, L[2][0]], [a, b, L[2][1]], m)); });
        g[2].forEach(function (c) { if (sph && (c < 1e-9 || c > PI - 1e-9)) return; out.push(line3([a, L[1][0], c], [a, L[1][1], c], 2 * m)); });
      });
      if (!S.fullTheta) [0, 1].forEach(function (e) {                         // caras θ = const
        var b = L[1][e];
        g[0].forEach(function (a) { if (a > 1e-12) out.push(line3([a, b, L[2][0]], [a, b, L[2][1]], m)); });
        g[2].forEach(function (c) { out.push(line3([L[0][0], b, c], [L[0][1], b, c], 2)); });
      });
      [0, 1].forEach(function (e) {                                            // caras φ = const (cono) o z = const
        var c = L[2][e];
        if (sph && (c < 1e-9 || c > PI - 1e-9)) return;
        g[0].forEach(function (a) { if (a > 1e-12) out.push(line3([a, L[1][0], c], [a, L[1][1], c], 2 * m)); });
        g[1].forEach(function (b) { out.push(line3([L[0][0], b, c], [L[0][1], b, c], 2)); });
      });
      return out;
    }
    // Las 6 caras de una cajita, como polígonos en x, y, z.
    function cellFaces(C) {
      var lo = C.lo, hi = C.hi, m = 8, f = [];
      function face(p, du, dv) {
        var o = [], s;
        for (s = 0; s <= m; s++) o.push(U(p[0] + du[0] * s / m, p[1] + du[1] * s / m, p[2] + du[2] * s / m));
        for (s = 0; s <= m; s++) o.push(U(p[0] + du[0] + dv[0] * s / m, p[1] + du[1] + dv[1] * s / m, p[2] + du[2] + dv[2] * s / m));
        for (s = m; s >= 0; s--) o.push(U(p[0] + dv[0] + du[0] * s / m, p[1] + dv[1] + du[1] * s / m, p[2] + dv[2] + du[2] * s / m));
        return o;
      }
      var d = [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]];
      [lo[0], hi[0]].forEach(function (a) { f.push(face([a, lo[1], lo[2]], [0, d[1], 0], [0, 0, d[2]])); });
      [lo[1], hi[1]].forEach(function (b) { f.push(face([lo[0], b, lo[2]], [d[0], 0, 0], [0, 0, d[2]])); });
      [lo[2], hi[2]].forEach(function (c) { f.push(face([lo[0], lo[1], c], [d[0], 0, 0], [0, d[1], 0])); });
      return f;
    }
    // Los tres lados que se juntan en la esquina (hi₀, lo₁, lo₂): en la coordenada 1, 3 y 2 del sistema.
    function cellEdges(C) {
      var lo = C.lo, hi = C.hi, Pc = [hi[0], lo[1], lo[2]];
      return [line3([lo[0], lo[1], lo[2]], Pc, 2), line3(Pc, [hi[0], lo[1], hi[2]], 16), line3(Pc, [hi[0], hi[1], lo[2]], 16)];
    }
    function drawIso(C) {
      var pr = projector(), P = pr.P, g, n = nn();
      iso.innerHTML = '';
      g = el('g', { class: 'sketch' }, iso);
      var O = P([0, 0, 0]);
      [[pr.ext[0], 0, 0, 'x'], [0, pr.ext[1], 0, 'y'], [0, 0, pr.ext[2], 'z']].forEach(function (e) {
        var t = P([e[0], e[1], e[2]]), dx = t[0] - O[0], dy = t[1] - O[1], L = Math.hypot(dx, dy) || 1;
        el('path', { d: 'M' + O[0].toFixed(1) + ' ' + O[1].toFixed(1) + 'L' + t[0].toFixed(1) + ' ' + t[1].toFixed(1), class: 'axis', fill: 'none', 'stroke-width': 1.4 }, g);
        el('text', { x: (t[0] + dx / L * 13).toFixed(1), y: (t[1] + dy / L * 13 + 5).toFixed(1), class: 'lab-tick', 'text-anchor': 'middle' }, g, e[3]);
      });
      var dW = frame(n).map(function (l) { return dPath(l.map(P), false); }).join('');
      el('path', { d: dW, class: 'ref', fill: 'none', 'stroke-width': 1, 'stroke-opacity': 0.5 }, g);
      cellFaces(C).forEach(function (f) { el('path', { d: dPath(f.map(P), true), class: 'se-cell' }, g); });
      var cls = ['error', 'trace', 'student'];
      cellEdges(C).forEach(function (l, q) { el('path', { d: dPath(l.map(P), false), class: cls[q], fill: 'none', 'stroke-width': 3.4, 'stroke-linecap': 'round' }, g); });
      if (!(hideBox.checked && !solved) && mode === 'zbar') { var cm = P([0, 0, exact.zbar]); el('circle', { cx: cm[0], cy: cm[1], r: 6, class: 'dot-error' }, g); }
    }

    // Corte vertical en el plano θ = 0 (mitad derecha): horizontal r, vertical z.
    function drawCut(C) {
      var L = S.L, n = nn(), sph = S.sys === 'sph', B = S.box, R = Math.max(B[0][1], B[1][1]);
      var p = window.LabPlot(cut, { x: [-0.12 * R, 1.12 * R], y: [Math.min(B[2][0], 0) - 0.1 * R, Math.max(B[2][1], 0) + 0.1 * R], equal: true });
      p.clear(); p.grid(); p.axes();
      function rz(a, c) { return sph ? [a * Math.sin(c), a * Math.cos(c)] : [a, c]; }
      function cellPoly(a0, a1, c0, c1) {
        var o = [], m = 16, s;
        for (s = 0; s <= m; s++) o.push(rz(a1, c0 + (c1 - c0) * s / m));
        for (s = m; s >= 0; s--) o.push(rz(a0, c0 + (c1 - c0) * s / m));
        return o;
      }
      var da = (L[0][1] - L[0][0]) / n[0], dc = (L[2][1] - L[2][0]) / n[2], i, k, segs = [];
      p.poly(cellPoly(L[0][0], L[0][1], L[2][0], L[2][1]), 'area-fill');
      p.poly(cellPoly(C.lo[0], C.hi[0], C.lo[2], C.hi[2]), 'se-cell2');
      for (i = 0; i <= n[0]; i++) {                                           // arcos ρ = const (o rectas r = const)
        var a = L[0][0] + i * da, m = 40, pts = [];
        for (k = 0; k <= m; k++) pts.push(rz(a, L[2][0] + (L[2][1] - L[2][0]) * k / m));
        for (k = 1; k < pts.length; k++) segs.push([pts[k - 1], pts[k]]);
      }
      for (k = 0; k <= n[2]; k++) { var c = L[2][0] + k * dc; segs.push([rz(L[0][0], c), rz(L[0][1], c)]); }
      p.segments(segs, 'aux', 1.2);
      var outer = cellPoly(L[0][0], L[0][1], L[2][0], L[2][1]);
      p.segments(outer.map(function (q, t) { return [q, outer[(t + 1) % outer.length]]; }), 'ref', 2.4);
      if (!(hideBox.checked && !solved) && mode === 'zbar') p.point(0, exact.zbar, 'dot-error', 6);
    }

    // Planta: sectores de θ; en cilíndricas, también los anillos de r (como en S13).
    function drawPlan(C) {
      var L = S.L, n = nn(), sph = S.sys === 'sph', R = Math.max(S.box[0][1], S.box[1][1]);
      var p = window.LabPlot(plan, { x: [-1.12 * R, 1.12 * R], y: [-1.12 * R, 1.12 * R], equal: true });
      p.clear(); p.grid(); p.axes();
      var rIn, rOut, cIn, cOut, c0 = C.lo[2], c1 = C.hi[2];
      if (sph) {
        var c0L = L[2][0], c1L = L[2][1];
        rOut = L[0][1] * (c0L <= PI / 2 && c1L >= PI / 2 ? 1 : Math.max(Math.sin(c0L), Math.sin(c1L)));
        rIn = 0;
        cOut = C.hi[0] * (c0 <= PI / 2 && c1 >= PI / 2 ? 1 : Math.max(Math.sin(c0), Math.sin(c1)));
        cIn = C.lo[0] * Math.min(Math.sin(c0), Math.sin(c1));
      } else { rOut = L[0][1]; rIn = L[0][0]; cOut = C.hi[0]; cIn = C.lo[0]; }
      function ring(r0, r1, t0, t1) {
        var o = [], m = 48, s;
        for (s = 0; s <= m; s++) { var t = t0 + (t1 - t0) * s / m; o.push([r1 * Math.cos(t), r1 * Math.sin(t)]); }
        for (s = m; s >= 0; s--) { var u = t0 + (t1 - t0) * s / m; o.push([r0 * Math.cos(u), r0 * Math.sin(u)]); }
        return o;
      }
      p.poly(ring(rIn, rOut, L[1][0], L[1][1]), 'area-fill');
      p.poly(ring(cIn, cOut, C.lo[1], C.hi[1]), 'se-cell2');
      var segs = [], dt = (L[1][1] - L[1][0]) / n[1], j;
      for (j = 0; j <= n[1]; j++) { var t = L[1][0] + j * dt; segs.push([[rIn * Math.cos(t), rIn * Math.sin(t)], [rOut * Math.cos(t), rOut * Math.sin(t)]]); }
      if (!sph) for (var i = 0; i <= n[0]; i++) {
        var a = L[0][0] + i * (L[0][1] - L[0][0]) / n[0], pts = ring(a, a, L[1][0], L[1][1]).slice(0, 49);
        for (j = 1; j < pts.length; j++) segs.push([pts[j - 1], pts[j]]);
      }
      p.segments(segs, 'aux', 1.2);
      var edge = ring(rIn, rOut, L[1][0], L[1][1]);
      p.segments(edge.map(function (q, k) { return [q, edge[(k + 1) % edge.length]]; }).filter(function (sg) { return Math.hypot(sg[0][0] - sg[1][0], sg[0][1] - sg[1][1]) > 1e-9; }), 'ref', 2.4);
    }

    // Convergencia: la suma con n = 1..CONV en cada coordenada, con y sin el Jacobiano.
    function drawConv() {
      if (!conv) return;
      var key = mode === 'V' ? 'V' : mode === 'M' ? 'M' : 'zbar';
      var a = conv.map(function (r) { return r[key]; }), b = convNo.map(function (r) { return r[key]; }), t = exact[key], hide = hideBox.checked && !solved;
      var all = a.concat(b).filter(isFinite).concat(hide ? [] : [t]), lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
      if (student != null && isFinite(student)) { lo = Math.min(lo, student); hi = Math.max(hi, student); }
      if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
      var pad = 0.12 * (hi - lo);
      var p = window.LabPlot(convS, { x: [0, CONV + 1], y: [lo - pad, hi + pad] });
      p.clear(); p.grid(); p.axes();
      if (!hide) p.segments([[[0, t], [CONV + 1, t]]], 'ref', 2);
      if (student != null && isFinite(student)) p.segments([[[0, student], [CONV + 1, student]]], 'student', 2);
      function series(vals, cls, dot) {
        var segs = [];
        for (var i = 1; i < vals.length; i++) if (isFinite(vals[i]) && isFinite(vals[i - 1])) segs.push([[i, vals[i - 1]], [i + 1, vals[i]]]);
        p.segments(segs, cls, 1.6);
        vals.forEach(function (v, i) { p.point(i + 1, v, dot, 3.5); });
      }
      series(b, 'error', 'dot-error');
      series(a, 'aux', 'dot-aux');
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
      if (!scene3 || !exact) return;
      var B = S.box, C = sel(), L = S.L;
      var cz = (B[2][0] + B[2][1]) / 2, s = 10 / Math.max(B[0][1] - B[0][0], B[2][1] - B[2][0]);
      function P3(p) { return [p[0] * s, p[1] * s, (p[2] - cz) * s]; }
      var col = { ref: UI.color('--plot-ref'), aux: UI.color('--plot-aux'), tr: UI.color('--plot-trace'), err: UI.color('--plot-error'), st: UI.color('--plot-student') };
      var objs = [];
      function surf(F, op, colr, res) {
        objs.push(new M3.Surface3D({ func: function (u, v) { return P3(F(u, v)); }, uRange: [0, 1], vRange: [0, 1], uResolution: res || 24, vResolution: res || 24, color: colr, opacity: op, doubleSided: true }));
      }
      function lerp(r, t) { return r[0] + (r[1] - r[0]) * t; }
      // Frontera del sólido: caras a = const, θ = const (si no da la vuelta) y φ o z = const.
      [0, 1].forEach(function (e) { var a = L[0][e]; if (a > 1e-12) surf(function (u, v) { return U(a, lerp(L[1], u), lerp(L[2], v)); }, 0.16, col.ref); });
      if (!S.fullTheta) [0, 1].forEach(function (e) { var b = L[1][e]; surf(function (u, v) { return U(lerp(L[0], u), b, lerp(L[2], v)); }, 0.16, col.ref, 12); });
      [0, 1].forEach(function (e) { var c = L[2][e]; if (S.sys === 'cyl' || (c > 1e-9 && c < PI - 1e-9)) surf(function (u, v) { return U(lerp(L[0], u), lerp(L[1], v), c); }, 0.16, col.ref); });
      // La cajita: sus seis caras y sus tres lados.
      var lo = C.lo, hi = C.hi;
      [lo[0], hi[0]].forEach(function (a) { surf(function (u, v) { return U(a, lo[1] + (hi[1] - lo[1]) * u, lo[2] + (hi[2] - lo[2]) * v); }, 0.75, col.tr, 6); });
      [lo[1], hi[1]].forEach(function (b) { surf(function (u, v) { return U(lo[0] + (hi[0] - lo[0]) * u, b, lo[2] + (hi[2] - lo[2]) * v); }, 0.75, col.tr, 6); });
      [lo[2], hi[2]].forEach(function (c) { surf(function (u, v) { return U(lo[0] + (hi[0] - lo[0]) * u, lo[1] + (hi[1] - lo[1]) * v, c); }, 0.75, col.tr, 6); });
      var ec = [col.err, col.tr, col.st];
      cellEdges(C).forEach(function (l, q) {
        for (var t = 1; t < l.length; t++) objs.push(new M3.Line3D({ start: P3(l[t - 1]), end: P3(l[t]), color: ec[q], lineWidth: 4 }));
      });
      var R = Math.max(B[0][1], B[1][1]);
      [[1.35 * R, 0, 0], [0, 1.35 * R, 0], [0, 0, Math.max(B[2][1], 0) + 0.3 * R]].forEach(function (e) {
        objs.push(new M3.Line3D({ start: P3([0, 0, 0]), end: P3(e), color: UI.color('--plot-axis') || col.ref, lineWidth: 2 }));
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
        scene3 = new M3.ThreeDScene(stage3d, { width: wd, height: Math.round(wd * 2 / 3), backgroundOpacity: 0, phi: 62 * PI / 180, theta: 30 * PI / 180, enableOrbitControls: true });
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
