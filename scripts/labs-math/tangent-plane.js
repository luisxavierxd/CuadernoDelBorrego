// Pruebas de LabMath.tplane (lab tangent-plane, Cálculo 2 · S05). Oráculos independientes:
// parciales de cinco puntos contra math.derivative; |Δf − df| = O(Δ²) comparando contra el Δf
// real con pasos cada vez más chicos; el plano contiene el punto y su normal es ⟂ a las
// tangentes de las trazas (calculadas con diferencias propias); la propagación de error contra
// los extremos de la caja de error y contra Monte Carlo; diagnósticos de errores típicos; y,
// del banco de S05, cada pregunta numérica con `ck` se recalcula con diferencias finitas.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM, math }) => {
  const T = LM.tplane;
  const rel = (a, b) => Math.abs(a - b) / (1 + Math.abs(b));
  const FUNS = [
    'x^2 + y^2', 'sqrt(x^2 + y^2)', 'x*y', 'pi*x^2*y', 'x^2*y', 'sin(x)*cos(y)', 'e^(-x^2 - y^2)',
    'x^3*y^2 - 4x*y', 'ln(x^2 + y^2 + 1)', 'x/(1 + y^2)', 'x*e^(x*y)', '(x + 2y)^3', 'atan(y/(x + 3))'
  ];
  const PTS = [[1, 0.5], [0.7, -1.2], [-0.8, 0.9], [1.3, 1.1]];

  test('tplane: parciales de cinco puntos contra math.derivative (13 funciones × 4 puntos × 2)', () => {
    FUNS.forEach((src) => {
      const f = T.fn2(math, src);
      PTS.forEach(([a, b]) => ['x', 'y'].forEach((w) => {
        const exact = math.derivative(LM.core.prep(src), w).evaluate({ x: a, y: b });
        const num = T.partial(f, a, b, w);
        if (rel(num, exact) > 1e-9) throw new Error(`${src} ∂/∂${w} en (${a}, ${b}): numérica ${num}, simbólica ${exact}`);
      }));
    });
  });

  test('tplane: |Δf − df| = O(Δ²): error/Δ → 0 y al partir Δ a la mitad el error baja ≈ 4 veces', () => {
    FUNS.forEach((src) => {
      const f = T.fn2(math, src);
      PTS.forEach(([a, b]) => {
        const P = T.tangentPlane(math, src, a, b), dir = [0.6, -0.8];
        const errs = [0.2, 0.1, 0.05, 0.025, 0.0125, 0.00625].map((s) => {
          const dx = dir[0] * s, dy = dir[1] * s, real = f(a + dx, b + dy) - f(a, b);   // Δf real, sin el plano
          return Math.abs(real - (P.fx * dx + P.fy * dy)) / s;                           // error / |Δ|
        });
        for (let i = 3; i < errs.length; i++) if (!(errs[i] <= errs[i - 1] * 0.62 + 1e-12)) throw new Error(`${src} en (${a}, ${b}): error/Δ no baja (${errs.join(', ')})`);
        const last = errs[errs.length - 1], prev = errs[errs.length - 2];
        if (prev > 1e-8) { const k = prev / last; if (k < 1.6 || k > 2.5) throw new Error(`${src}: error/Δ debe bajar ≈ 2 veces al partir Δ, bajó ${k}`); }
      });
    });
    const r = T.linear(math, 'x^2*y', 2, 1, 0.1, -0.05);
    near(r.dz, 0.2, 1e-12, 'dz de x²y'); near(r.dzReal, 0.1895, 1e-12, 'Δz real'); near(r.err, 0.0105, 1e-12, 'error');
    const r2 = T.linear(math, 'x^2*y', 2, 1, 0.05, -0.025);
    near(r.err / r2.err, 4.1, 0.1, 'el error baja ≈ 4 veces');
  });

  test('tplane: el plano contiene el punto y su normal es ⟂ a las tangentes de las trazas', () => {
    FUNS.forEach((src) => {
      const f = T.fn2(math, src);
      PTS.forEach(([a, b]) => {
        const P = T.tangentPlane(math, src, a, b);
        near(P.at(a, b), f(a, b), 1e-12, 'pasa por (a, b, f(a, b))');
        near(P.fx * a + P.fy * b + P.c, f(a, b), 1e-9 * (1 + Math.abs(f(a, b))), 'forma z = fx x + fy y + c');
        const h = 1e-5;
        const tx = [1, 0, (f(a + h, b) - f(a - h, b)) / (2 * h)], ty = [0, 1, (f(a, b + h) - f(a, b - h)) / (2 * h)];
        const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
        if (Math.abs(dot(P.normal, tx)) > 1e-6 * (1 + Math.abs(P.fx)) || Math.abs(dot(P.normal, ty)) > 1e-6 * (1 + Math.abs(P.fy))) throw new Error(`${src} en (${a}, ${b}): la normal no es ⟂ a las trazas`);
      });
    });
    const P = T.tangentPlane(math, 'x^2 + x*y + 2y^2', 1, 2);
    eq([P.f0, P.fx, P.fy, P.c].join(), '11,4,9,-11', 'ejemplo 1 de la sesión');
  });

  test('tplane: propagación contra los extremos de la caja de error y contra Monte Carlo', () => {
    const cases = [
      ['pi*r^2*h', ['r', 'h'], [5, 12], [0.1, 0.2]],
      ['x*y', ['x', 'y'], [3, 7], [0.02, 0.05]],
      ['n*R*T/V', ['n', 'R', 'T', 'V'], [2, 8.31, 300, 0.05], [0, 0, 1.5, 0.0004]],
      ['a*b/(a + b)', ['a', 'b'], [10, 15], [0.1, 0.2]],
      ['4*pi^2*L/T^2', ['L', 'T'], [1.2, 2.2], [0.005, 0.02]],
      ['x*y*z', ['x', 'y', 'z'], [2, 3, 4], [0.01, 0.02, 0.01]]
    ];
    let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    cases.forEach(([src, names, pt, d]) => {
      const code = math.parse(src).compile();
      const F = (p) => code.evaluate(Object.fromEntries(names.map((k, i) => [k, p[i]])));
      const r = T.propagate(math, src, names, pt, d), f0 = F(pt);
      near(r.value, f0, 1e-9 * Math.abs(f0), src + ' valor');
      near(r.rel, r.abs / Math.abs(f0), 1e-15, 'rel'); near(r.pct, 100 * r.rel, 1e-12, 'pct');
      // Extremos de la caja, con la caja encogida t veces: max |f(esquina) − f| / t → abs.
      const t = 1e-4;
      let worst = 0;
      for (let m = 0; m < (1 << names.length); m++) {
        const sg = names.map((_, i) => (m >> i & 1 ? 1 : -1));
        const up = pt.map((x, i) => x + t * sg[i] * d[i]), dn = pt.map((x, i) => x - t * sg[i] * d[i]);
        worst = Math.max(worst, Math.abs(F(up) - F(dn)) / (2 * t));
      }
      if (rel(worst, r.abs) > 1e-6) throw new Error(`${src}: esquinas ${worst}, propagación ${r.abs}`);
      // Monte Carlo en la caja de verdad: ningún punto se pasa del error máximo más que O(d²).
      let mc = 0;
      for (let i = 0; i < 4000; i++) {
        const q = pt.map((x, j) => x + (2 * rnd() - 1) * d[j]);
        mc = Math.max(mc, Math.abs(F(q) - f0));
      }
      if (mc > r.abs * 1.06 + 1e-12) throw new Error(`${src}: Monte Carlo ${mc} se pasa del error máximo ${r.abs}`);
      if (mc < r.abs * 0.8) throw new Error(`${src}: Monte Carlo ${mc} no se acerca al error máximo ${r.abs}`);
    });
    const cyl = T.propagate(math, 'pi*r^2*h', ['r', 'h'], [5, 12], [0.1, 0.2]);
    near(cyl.abs, 17 * Math.PI, 1e-9, 'cilindro: 17π'); near(cyl.pct, 100 * 17 / 300, 1e-9, '5.67 %');
  });

  test('tplane: diagnose en dz, L y error máximo', () => {
    const c = T.linear(math, 'x^2*y', 2, 1, 0.1, -0.05);   // dz = 0.2, Δz = 0.1895
    const d = (s, mode, cc) => T.diagnose(s, cc || c, mode).reason;
    eq(d(0.2, 'dz'), 'correct'); eq(d(0.1895, 'dz'), 'real', 'Δz real queda fuera de la holgura');
    const k = T.linear(math, 'x^3*y', 2, 1, 0.3, -0.2);     // fx = 12, fy = 8, f0 = 8
    eq(d(12 * 0.3 + 8 * -0.2, 'dz', k), 'correct');
    eq(d(k.dzReal, 'dz', k), 'real');
    eq(d(8 + 2, 'dz', k), 'withF0');
    eq(d(12 * -0.2 + 8 * 0.3, 'dz', k), 'swap');
    eq(d(-1.6, 'dz', k), 'missX'); eq(d(3.6, 'dz', k), 'missY'); eq(d(-2, 'dz', k), 'sign');
    eq(d(5, 'dz', k), 'mismatch');
    eq(d(10, 'L', k), 'correct'); eq(d(k.real, 'L', k), 'real'); eq(d(2, 'L', k), 'onlyDz');
    eq(d(8 + 12 * -0.2 + 8 * 0.3, 'L', k), 'swap');
    eq(d(12 * 0.3 + 8 * 0.2, 'max', k), 'correct'); eq(d(2, 'max', k), 'noAbs');
    eq(d(12 * 0.2 + 8 * 0.3, 'max', k), 'swap');
    eq(T.diagnose(NaN, k, 'dz').kind, 'invalid');
    // Holgura: ±0.01 desde 0.1; abajo, ±1 % o 0.0005.
    eq(T.near(1.234, 1.24), true); eq(T.near(1.22, 1.24), false); eq(T.near(0.0121, 0.012), true); eq(T.near(0.013, 0.012), false);
  });

  // Banco de S05: las preguntas numéricas con `ck` se recalculan con diferencias finitas propias.
  const bankFile = path.join(__dirname, '..', '..', 'data', 'calculo-2', 'bank', 'sesion-05.js');
  if (fs.existsSync(bankFile)) {
    test('banco c2 S05: respuestas numéricas contra diferencias finitas y la caja de error (oráculo independiente)', () => {
      const { loadData } = require('../lib/load');
      const ROOT = path.join(__dirname, '..', '..');
      const W = loadData(['labs/registry', 'labs/antiderivative-check', 'exercises', 'quiz/bank-kit'].map((n) => path.join(ROOT, 'shared/js', n + '.js')), {});
      loadData(bankFile, W);
      const Q = W.CB_BANK.c2.S05.questions;
      let seed = 5; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      let checked = 0, numeric = 0;
      Q.forEach((q) => {
        if (q.type === 'numeric') numeric++;
        if (!q.ck) return;
        for (let i = 0; i < 40; i++) {
          const v = W.CBExercises.instance(q, rnd), o = q.ck(v), code = math.parse(o.f).compile();
          const names = Object.keys(o.pt);
          const F = (p) => code.evaluate(Object.assign({}, p));
          const shift = (s, t) => { const p = Object.assign({}, o.pt); names.forEach((k, j) => { p[k] += t * s[j] * ((o.d || {})[k] || 0); }); return p; };
          const one = names.map(() => 1);
          const dirD = (t) => (F(shift(one, t)) - F(shift(one, -t))) / (2 * t);   // derivada en la dirección d
          const part = (w) => { const hh = 1e-5 * Math.max(1, Math.abs(o.pt[w])), p1 = Object.assign({}, o.pt), p0 = Object.assign({}, o.pt); p1[w] += hh; p0[w] -= hh; return (F(p1) - F(p0)) / (2 * hh); };
          const corners = () => {
            let worst = 0, t = 1e-5;
            for (let m = 0; m < (1 << names.length); m++) {
              const sg = names.map((_, j) => (m >> j & 1 ? 1 : -1));
              worst = Math.max(worst, Math.abs(F(shift(sg, t)) - F(shift(sg, -t))) / (2 * t));
            }
            return worst;
          };
          let want;
          if (o.kind === 'd') want = part(o.wrt);
          else if (o.kind === 'val') want = F(o.pt);
          else if (o.kind === 'c') want = F(o.pt) - names.reduce((s, k) => s + part(k) * o.pt[k], 0);
          else if (o.kind === 'dz') want = dirD(1e-5);
          else if (o.kind === 'L') want = F(o.pt) + dirD(1e-5);
          else if (o.kind === 'real') want = F(shift(one, 1)) - F(o.pt);
          else if (o.kind === 'gap') want = Math.abs(F(shift(one, 1)) - F(o.pt) - dirD(1e-5));
          else if (o.kind === 'max') want = corners();
          else if (o.kind === 'rel') want = corners() / Math.abs(F(o.pt));
          else if (o.kind === 'pct') want = 100 * corners() / Math.abs(F(o.pt));
          else throw new Error(`${q.id}: ck.kind desconocido ${o.kind}`);
          if (o.scale) want *= o.scale;
          const got = q.answer(v);
          if (Math.abs(got - want) > 2e-6 * Math.max(1, Math.abs(want))) throw new Error(`${q.id} ${JSON.stringify(v)}: respuesta ${got}, oráculo ${want}`);
          checked++;
        }
      });
      if (checked < 40 * Math.ceil(numeric * 0.8)) throw new Error(`solo ${checked / 40} de ${numeric} preguntas numéricas tienen ck`);
    });
  }
};
