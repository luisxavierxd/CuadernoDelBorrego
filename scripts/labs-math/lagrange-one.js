// Pruebas de LabMath.lagrange (lab lagrange-one, Cálculo 2 · S09). Oráculos independientes:
// una búsqueda propia por fuerza bruta sobre la restricción parametrizada (muestreo fino +
// búsqueda ternaria, sin derivadas) contra el sistema de Lagrange resuelto por Newton, en los
// presets y en problemas al azar; ∇f × ∇g ≈ 0 en el óptimo; λ ≈ d(óptimo)/dc por diferencias
// finitas; el criterio D contra un hessiano por diferencias; tres variables contra Nelder–Mead;
// diagnósticos del reto; y, del banco de S09, cada numérica con `ck` se recalcula por otro camino.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM, math }) => {
  const L = LM.lagrange;
  const rel = (a, b) => Math.abs(a - b) / (1 + Math.abs(b));

  // Óptimo por fuerza bruta: n muestras de f sobre r(t) y búsqueda ternaria alrededor del mejor.
  function brute(fSrc, spec, which, n) {
    const C = L.constraint(spec), code = math.parse(LM.core.prep(fSrc)).compile();
    const F = (t) => { const p = C.at(t); const v = code.evaluate({ x: p[0], y: p[1] }); return which === 'max' ? v : -v; };
    n = n || 20000;
    const t0 = C.t[0], t1 = C.t[1], dt = (t1 - t0) / n;
    let bi = 0, bv = -Infinity;
    for (let i = 0; i <= n; i++) { const v = F(t0 + dt * i); if (v > bv) { bv = v; bi = i; } }
    let a = t0 + dt * (bi - 1), b = t0 + dt * (bi + 1);
    if (!C.closed) { a = Math.max(a, t0); b = Math.min(b, t1); }
    for (let k = 0; k < 200; k++) {
      const m1 = a + (b - a) / 3, m2 = b - (b - a) / 3;
      if (F(m1) < F(m2)) a = m1; else b = m2;
    }
    const t = (a + b) / 2, p = C.at(t);
    return { f: which === 'max' ? F(t) : -F(t), x: p[0], y: p[1], t, end: !C.closed && (Math.abs(t - t0) < 1e-6 || Math.abs(t - t1) < 1e-6) };
  }
  // Lo mejor entre los candidatos de Newton y los extremos del tramo.
  function viaNewton(P, which) {
    const E = L.extremes(P, 400), list = L.solve(P).concat(E.ends);
    return list.reduce((b, p) => (!b || (which === 'max' ? p.f > b.f : p.f < b.f) ? p : b), null);
  }

  test('lagrange: en los 6 presets el óptimo por Newton coincide con la fuerza bruta y con extremes', () => {
    L.PRESETS.forEach((pr) => {
      const P = L.problem(math, pr.f, pr.spec);
      ['max', 'min'].forEach((w) => {
        const b = brute(pr.f, pr.spec, w), nw = viaNewton(P, w), E = L.extremes(P);
        if (rel(nw.f, b.f) > 1e-7) throw new Error(`${pr.name} ${w}: Newton ${nw.f}, fuerza bruta ${b.f}`);
        if (rel(E[w].f, b.f) > 1e-7) throw new Error(`${pr.name} ${w}: extremes ${E[w].f}, fuerza bruta ${b.f}`);
      });
    });
    // Valores a mano de los presets.
    const opt = (i) => L.optimum(math, L.PRESETS[i].f, L.PRESETS[i].spec);
    near(opt(0).max, 9 - Math.pow(2 - Math.sqrt(1.25), 2), 1e-9, 'cerro: máx');
    near(opt(1).max, 16, 1e-9, 'x² + 3y² − 2y: máx en (0, −2)'); near(opt(1).min, 3.5, 1e-9, 'mín');
    near(opt(2).max, 1, 1e-9, 'xy en la elipse'); near(opt(2).min, -1, 1e-9);
    near(opt(3).max, 8, 1e-9, 'rectángulo'); near(opt(4).min, 8, 1e-9, 'hipérbola'); near(opt(5).min, 2.75, 1e-9, 'parábola');
  });

  test('lagrange: 40 problemas al azar (5 tipos de restricción): Newton = fuerza bruta', () => {
    let seed = 17; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
    const kinds = ['circle', 'ellipse', 'line', 'hyperbola', 'parabola'];
    for (let k = 0; k < 40; k++) {
      const kind = kinds[k % 5];
      const co = [ri(-3, 3), ri(-3, 3), ri(-2, 2), ri(-4, 4), ri(-4, 4), ri(-1, 1)];
      const f = `${co[0]}*x^2 + ${co[1]}*y^2 + ${co[2]}*x*y + ${co[3]}*x + ${co[4]}*y + ${co[5]}*x^2*y`;
      const spec = kind === 'circle' ? { kind, c: ri(1, 9) } : kind === 'ellipse' ? { kind, a: ri(1, 3), b: ri(1, 3), c: 1 }
        : kind === 'line' ? { kind, a: ri(1, 3), b: ri(1, 3), c: ri(3, 9) } : kind === 'hyperbola' ? { kind, c: ri(1, 6), t: [-1, 1] }
          : { kind, a: ri(1, 2) * (rnd() < 0.5 ? -1 : 1), c: ri(-2, 2), t: [-2, 2] };
      const P = L.problem(math, f, spec);
      ['max', 'min'].forEach((w) => {
        const b = brute(f, spec, w, 5000), nw = viaNewton(P, w);
        if (rel(nw.f, b.f) > 1e-6) throw new Error(`${f} en ${JSON.stringify(spec)} ${w}: Newton ${nw.f}, fuerza bruta ${b.f}`);
      });
    }
  });

  test('lagrange: en cada candidato ∇f × ∇g ≈ 0, g = c, y el ángulo entre gradientes es 0° o 180°', () => {
    L.PRESETS.forEach((pr) => {
      const P = L.problem(math, pr.f, pr.spec);
      L.solve(P).forEach((q) => {
        const a = L.angle(P, q.x, q.y);
        if (Math.abs(a.cross) > 1e-8 * (1 + a.nf * a.ng)) throw new Error(`${pr.name}: cruz ${a.cross} en (${q.x}, ${q.y})`);
        near(P.g(q.x, q.y), P.c, 1e-9, 'g = c');
        if (a.nf > 1e-9 && !(a.deg < 1e-5 || a.deg > 180 - 1e-5)) throw new Error(`${pr.name}: ángulo ${a.deg}`);
      });
      // Fuera del óptimo los gradientes no son paralelos.
      const t = (P.C.t[0] + P.C.t[1]) / 2 + 0.123, p = P.C.at(t), a = L.angle(P, p[0], p[1]);
      if (isFinite(a.deg) && L.solve(P).every((q) => Math.hypot(q.x - p[0], q.y - p[1]) > 0.05)) {
        if (a.deg < 0.01 || a.deg > 179.99) throw new Error(`${pr.name}: paralelos fuera de un candidato`);
      }
    });
  });

  test('lagrange: λ ≈ d(óptimo)/dc con diferencias finitas en c (fuerza bruta propia)', () => {
    const cases = [[0, 'max'], [0, 'min'], [1, 'max'], [1, 'min'], [2, 'max'], [3, 'max'], [4, 'min'], [5, 'min'],
      [null, 'max', '3*x + 4*y', { kind: 'circle', c: 4 }], [null, 'max', 'x^0.6*y^0.4', { kind: 'line', a: 10, b: 20, c: 1000 }]];
    cases.forEach(([i, w, f0, s0]) => {
      const f = i == null ? f0 : L.PRESETS[i].f, spec = i == null ? s0 : L.PRESETS[i].spec;
      const P = L.problem(math, f, spec), E = L.extremes(P), lam = L.lambdaAt(P, E[w].x, E[w].y);
      const hh = 1e-3 * Math.max(1, Math.abs(spec.c));
      const fd = (brute(f, Object.assign({}, spec, { c: spec.c + hh }), w, 40000).f - brute(f, Object.assign({}, spec, { c: spec.c - hh }), w, 40000).f) / (2 * hh);
      if (rel(lam, fd) > 1e-5) throw new Error(`${f} ${w}: λ = ${lam}, diferencias finitas ${fd}`);
      if (rel(L.lambdaFD(math, f, spec, w), lam) > 1e-5) throw new Error(`${f}: lambdaFD`);
    });
    near(L.optimum(math, '3*x + 4*y', { kind: 'circle', c: 4 }).lambdaMax, 1.25, 1e-9, 'λ de 3x + 4y en x² + y² = 4');
  });

  test('lagrange: puntos críticos libres y criterio D contra un hessiano por diferencias', () => {
    const r = L.critical(math, 'x^3 - 3x + y^2 - 2y', [-3, 3, -3, 3]);
    eq(r.n, 2, 'dos críticos');
    eq(r.pts.map((p) => p.kind).join(), 'saddle,min');
    near(r.pts[1].f, -3, 1e-12); near(r.pts[1].D, 12, 1e-9); near(r.pts[0].D, -12, 1e-9);
    eq(L.critical(math, 'x^2 - y^2').pts[0].kind, 'saddle');
    eq(L.critical(math, '4 - x^2 - x*y - y^2').pts[0].kind, 'max');
    eq(L.critical(math, 'x^4 + y^4').pts.every((p) => p.kind === 'none'), true, 'D = 0: no concluye');
    eq(L.classify(2, 1, 2).kind, 'min'); eq(L.classify(-2, 1, -2).kind, 'max'); eq(L.classify(1, 2, 1).kind, 'saddle');
    const FUN = ['x^3 + y^3 - 3x*y', 'x*y*(3 - x - y)', 'x^2 + x*y + y^2 - 3x', 'sin(x) + cos(y)', 'x^4 - 2x^2 + y^2'];
    FUN.forEach((src) => {
      const code = math.parse(src).compile(), F = (x, y) => code.evaluate({ x, y }), e = 1e-4;
      L.critical(math, src, [-2.5, 2.5, -2.5, 2.5]).pts.forEach((p) => {
        const gx = (F(p.x + e, p.y) - F(p.x - e, p.y)) / (2 * e), gy = (F(p.x, p.y + e) - F(p.x, p.y - e)) / (2 * e);
        if (Math.hypot(gx, gy) > 1e-6) throw new Error(`${src}: ∇f ≠ 0 en (${p.x}, ${p.y})`);
        const fxx = (F(p.x + e, p.y) - 2 * F(p.x, p.y) + F(p.x - e, p.y)) / (e * e), fyy = (F(p.x, p.y + e) - 2 * F(p.x, p.y) + F(p.x, p.y - e)) / (e * e);
        const fxy = (F(p.x + e, p.y + e) - F(p.x + e, p.y - e) - F(p.x - e, p.y + e) + F(p.x - e, p.y - e)) / (4 * e * e);
        const D = fxx * fyy - fxy * fxy;
        if (Math.abs(D - p.D) > 1e-4 * (1 + Math.abs(D))) throw new Error(`${src}: D ${p.D}, por diferencias ${D}`);
      });
    });
  });

  // Nelder–Mead propio para el oráculo de tres variables (sustituyendo z de la restricción).
  function nelder(F, x0, step) {
    let s = [x0, [x0[0] + step, x0[1]], [x0[0], x0[1] + step]].map((p) => ({ p, v: F(p) }));
    for (let it = 0; it < 4000; it++) {
      s.sort((a, b) => a.v - b.v);
      const c = [(s[0].p[0] + s[1].p[0]) / 2, (s[0].p[1] + s[1].p[1]) / 2];
      const at = (k) => { const p = [c[0] + k * (s[2].p[0] - c[0]), c[1] + k * (s[2].p[1] - c[1])]; return { p, v: F(p) }; };
      const r = at(-1);
      if (r.v < s[0].v) { const e = at(-2); s[2] = e.v < r.v ? e : r; }
      else if (r.v < s[1].v) s[2] = r;
      else { const k = at(0.5); if (k.v < s[2].v) s[2] = k; else s = s.map((q, i) => (i ? { p: [(q.p[0] + s[0].p[0]) / 2, (q.p[1] + s[0].p[1]) / 2], v: F([(q.p[0] + s[0].p[0]) / 2, (q.p[1] + s[0].p[1]) / 2]) } : q)); }
      if (Math.abs(s[2].v - s[0].v) < 1e-15 * (1 + Math.abs(s[0].v)) && Math.hypot(s[2].p[0] - s[0].p[0], s[2].p[1] - s[0].p[1]) < 1e-10) break;
    }
    s.sort((a, b) => a.v - b.v);
    return s[0];
  }
  test('lagrange: tres variables (newton3) contra Nelder–Mead sustituyendo z', () => {
    const cases = [
      ['x*y + 2*x*z + 2*y*z', 'x*y*z', 32, (x, y) => 32 / (x * y), 'min', [3, 3, 3, 1]],
      ['2*x*y + 2*x*z + 2*y*z', 'x*y*z', 27, (x, y) => 27 / (x * y), 'min', [2.5, 3.5, 2.5, 1]],
      ['x*y*z', 'x*y + 2*x*z + 2*y*z', 48, (x, y) => (48 - x * y) / (2 * (x + y)), 'max', [3, 3, 1.5, 1]],
      ['x*y*z', 'x + y + z', 12, (x, y) => 12 - x - y, 'max', [3, 3, 3, 1]],
      ['x^2 + y^2 + z^2', 'x + 2*y + 3*z', 14, (x, y) => (14 - x - 2 * y) / 3, 'min', [0.5, 1, 2, 1]]
    ];
    cases.forEach(([f, g, c, zf, w, st]) => {
      const r = L.newton3(math, f, g, c, st), code = math.parse(f).compile();
      eq(r.ok, true, f + ' converge');
      const F = (p) => { const v = code.evaluate({ x: p[0], y: p[1], z: zf(p[0], p[1]) }); return w === 'max' ? -v : v; };
      const nm = nelder(F, [st[0] * 0.8, st[1] * 1.2], 0.5), best = w === 'max' ? -nm.v : nm.v;
      if (rel(r.f, best) > 1e-9) throw new Error(`${f}: Newton ${r.f}, Nelder–Mead ${best}`);
      if (Math.hypot(r.x - nm.p[0], r.y - nm.p[1]) > 1e-4 * (1 + Math.hypot(r.x, r.y))) throw new Error(`${f}: punto ${r.x}, ${r.y} contra ${nm.p}`);
    });
    const box = L.newton3(math, 'x*y + 2*x*z + 2*y*z', 'x*y*z', 32, [3, 3, 3, 1]);
    near(box.x, 4, 1e-10); near(box.z, 2, 1e-10); near(box.f, 48, 1e-9); near(box.lambda, 1, 1e-10);
  });

  test('lagrange: diagnose y diagnosePoint del reto', () => {
    const ctx = (i, c) => { const pr = L.PRESETS[i], P = L.problem(math, pr.f, Object.assign({}, pr.spec, c != null ? { c } : {})); return L.context(P, L.windowOf(P.C, [[1, 0.5]])); };
    const k0 = ctx(0);                         // cerro: máx libre 9 en (1, 0.5), fuera del círculo
    const mx = 9 - Math.pow(2 - Math.sqrt(1.25), 2), mn = 9 - Math.pow(2 + Math.sqrt(1.25), 2);
    eq(L.diagnose(mx, k0, 'max').reason, 'correct');
    eq(L.diagnose(9, k0, 'max').reason, 'free');
    eq(L.diagnose(mn, k0, 'max').reason, 'other');
    eq(L.diagnose(mn, k0, 'min').reason, 'correct');
    eq(L.diagnose(L.lambdaAt(k0.P, k0.E.max.x, k0.E.max.y), k0, 'max').reason, 'lambda');
    eq(L.diagnose(123, k0, 'max').reason, 'mismatch');
    eq(L.diagnose(NaN, k0, 'max').kind, 'invalid');
    eq(L.diagnosePoint(1, 0.5, k0, 'max').reason, 'free');
    eq(L.diagnosePoint(2 / Math.sqrt(1.25), 1 / Math.sqrt(1.25), k0, 'max').reason, 'correct');
    eq(L.diagnosePoint(1, 1, k0, 'max').reason, 'offCurve');
    const k1 = ctx(1);                         // x² + 3y² − 2y en x² + y² = 4: máx 16 en (0, −2)
    eq(L.diagnose(16, k1, 'max').reason, 'correct');
    eq(L.diagnose(8, k1, 'max').reason, 'missedAxis', 'f(0, 2) = 8: otro candidato del caso x = 0');
    eq(L.diagnose(3.5, k1, 'max').reason, 'other');
    eq(L.diagnosePoint(0, -2, k1, 'max').reason, 'correct');
    eq(L.diagnosePoint(Math.sqrt(15) / 2, 0.5, k1, 'min').reason, 'correct');
    eq(L.diagnosePoint(-Math.sqrt(15) / 2, 0.5, k1, 'min').reason, 'correct', 'los dos mínimos simétricos');
    eq(L.diagnosePoint(0, 2, k1, 'max').reason, 'missedAxis');
    eq(L.diagnosePoint(0, -2, k1, 'min').reason, 'other');
    eq(L.near(8.215, 8.22), true); eq(L.near(8.1, 8.22), false); eq(L.near(0.0101, 0.01), true); eq(L.near(0.012, 0.01), false);
  });

  test('lagrange: contour y parametrizaciones (r(t) cumple g = c y tOf es su inversa)', () => {
    [{ kind: 'circle', c: 4 }, { kind: 'ellipse', a: 2, b: 3, c: 1.5 }, { kind: 'line', a: 2, b: 3, c: 12 }, { kind: 'hyperbola', c: 5 }, { kind: 'parabola', a: -0.5, c: 2 }].forEach((s) => {
      const C = L.constraint(s), g = math.parse(C.g).compile();
      for (let i = 0; i <= 20; i++) {
        const t = C.t[0] + (C.t[1] - C.t[0]) * i / 20, p = C.at(t);
        near(g.evaluate({ x: p[0], y: p[1] }), s.c, 1e-9, s.kind + ' g = c');
        if (i < 20) near(C.tOf(p[0], p[1]), t, 1e-9, s.kind + ' tOf');
        const e = 1e-6, q1 = C.at(t + e), q0 = C.at(t - e), d = C.dat(t);
        near((q1[0] - q0[0]) / (2 * e), d[0], 1e-5, s.kind + ' dx/dt'); near((q1[1] - q0[1]) / (2 * e), d[1], 1e-5, s.kind + ' dy/dt');
      }
    });
    const G = L.grid((x, y) => x * x + y * y, [-2, 2, -2, 2], 40), segs = L.contour(G, 1);
    if (!segs.length) throw new Error('sin segmentos');
    segs.forEach((s) => s.forEach((p) => near(Math.hypot(p[0], p[1]), 1, 0.01, 'el contorno x² + y² = 1')));
  });

  // Banco de S09: las numéricas con `ck` se recalculan por otro camino (fuerza bruta propia,
  // diferencias finitas o Nelder–Mead), sin usar la fórmula de la respuesta.
  const bankFile = path.join(__dirname, '..', '..', 'data', 'calculo-2', 'bank', 'sesion-09.js');
  if (fs.existsSync(bankFile)) {
    test('banco c2 S09: respuestas numéricas contra la búsqueda densa propia, diferencias finitas y Nelder–Mead', () => {
      const { loadData } = require('../lib/load');
      const ROOT = path.join(__dirname, '..', '..');
      const W = loadData(['labs/registry', 'labs/antiderivative-check', 'exercises', 'quiz/bank-kit'].map((n) => path.join(ROOT, 'shared/js', n + '.js')), {});
      loadData(bankFile, W);
      const Q = W.CB_BANK.c2.S09.questions;
      let seed = 9; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      let checked = 0, numeric = 0;
      const REP = 6;
      Q.forEach((q) => {
        if (q.type === 'numeric') numeric++;
        if (!q.ck) return;
        for (let i = 0; i < REP; i++) {
          const v = W.CBExercises.instance(q, rnd), o = q.ck(v);
          let want;
          if (o.kind === 'opt') {
            const b = brute(o.f, o.spec, o.which, 8000);
            const fd = () => { const hh = 1e-3 * Math.max(1, Math.abs(o.spec.c)); return (brute(o.f, Object.assign({}, o.spec, { c: o.spec.c + hh }), o.which, 8000).f - brute(o.f, Object.assign({}, o.spec, { c: o.spec.c - hh }), o.which, 8000).f) / (2 * hh); };
            if (o.field === 'lambda') want = fd();
            else if (o.field === 'pred') want = b.f + fd() * o.dc;
            else want = o.field === 'x' ? b.x : o.field === 'y' ? b.y : o.field === 'absx' ? Math.abs(b.x) : o.field === 'absy' ? Math.abs(b.y) : o.field === 'sqrt' ? Math.sqrt(b.f) : b.f;
          } else if (o.kind === 'crit' || o.kind === 'D') {
            const code = math.parse(o.f).compile(), F = (x, y) => code.evaluate({ x, y }), e = 1e-4, p = o.pt;
            const gx = (F(p.x + e, p.y) - F(p.x - e, p.y)) / (2 * e), gy = (F(p.x, p.y + e) - F(p.x, p.y - e)) / (2 * e);
            if (o.kind === 'crit' && Math.hypot(gx, gy) > 1e-6 * (1 + Math.abs(F(p.x, p.y)))) throw new Error(`${q.id} ${JSON.stringify(v)}: ∇f ≠ 0 en ${JSON.stringify(p)}`);
            const fxx = (F(p.x + e, p.y) - 2 * F(p.x, p.y) + F(p.x - e, p.y)) / (e * e), fyy = (F(p.x, p.y + e) - 2 * F(p.x, p.y) + F(p.x, p.y - e)) / (e * e);
            const fxy = (F(p.x + e, p.y + e) - F(p.x + e, p.y - e) - F(p.x - e, p.y + e) + F(p.x - e, p.y - e)) / (4 * e * e);
            want = o.kind === 'D' ? fxx * fyy - fxy * fxy : o.field === 'f' ? F(p.x, p.y) : p[o.field];
          } else if (o.kind === 'sub3') {
            const code = math.parse(o.f).compile(), zc = math.parse(o.z).compile(), sg = o.which === 'max' ? -1 : 1;
            const Fz = (p) => zc.evaluate({ x: p[0], y: p[1] });
            const nm = nelder((p) => (o.free || (p[0] > 0 && p[1] > 0 && Fz(p) > 0) ? sg * code.evaluate({ x: p[0], y: p[1], z: Fz(p) }) : 1e30), o.start, 0.3 * Math.max(1, o.start[0]));
            const pp = { x: nm.p[0], y: nm.p[1], z: Fz(nm.p) };
            want = o.field === 'f' ? sg * nm.v : pp[o.field];
          } else throw new Error(`${q.id}: ck.kind desconocido ${o.kind}`);
          if (o.scale) want *= o.scale;
          const got = q.answer(v), tol = o.kind === 'sub3' ? 1e-5 : o.kind === 'D' ? 1e-4 : o.field === 'lambda' || o.field === 'pred' ? 1e-5 : 1e-6;
          if (Math.abs(got - want) > tol * Math.max(1, Math.abs(want))) throw new Error(`${q.id} ${JSON.stringify(v)}: respuesta ${got}, oráculo ${want}`);
          checked++;
        }
      });
      if (checked < REP * Math.ceil(numeric * 0.8)) throw new Error(`solo ${checked / REP} de ${numeric} preguntas numéricas tienen ck`);
    });
  }
};
