// Pruebas de LabMath.dblint (lab double-riemann, Cálculo 2 · S11). Oráculos independientes:
// Simpson anidado = Gauss–Legendre = Monte Carlo (dentro de 4 errores estándar) = la integral
// iterada cerrada, en muchas funciones; la suma de punto medio converge como O(h²) y las de
// esquina como O(h); Fubini: los dos órdenes dan lo mismo; separables = producto de integrales;
// diagnósticos de errores típicos; y, del banco de S11, cada numérica con `ck` se recalcula con
// un Simpson propio escrito aquí (no usa LabMath) sobre la fórmula en el sistema original.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM, math }) => {
  const D = LM.dblint;
  const rel = (a, b) => Math.abs(a - b) / (1 + Math.abs(b));
  // Casos con integral cerrada (antiderivadas a mano): [f, R, valor exacto].
  const E = Math.E, PI = Math.PI;
  const CASES = [
    ['16 - x^2 - 2y^2', [0, 2, 0, 2], 48],
    ['6 - x - 2y', [0, 2, 0, 1], 8],
    ['x + 3y^2', [0, 2, 0, 1], 4],
    ['x^2*y', [0, 2, 1, 3], 32 / 3],
    ['x^2 - y^2', [-1, 2, -1, 1], 4],
    ['2 + x + y^2', [0, 3, 0, 2], 29],
    ['x*y^2 + 3x^2', [1, 2, -1, 2], (1.5) * 3 + 7 * 3],                 // ∫x dx·∫y² dy + 3·(7/3)·3
    ['e^x*cos(y)', [0, 1, 0, PI / 2], E - 1],
    ['e^(2x)*sin(y)', [0, 1, 0, PI], E * E - 1],
    ['sin(x)*sin(y)', [0, PI, 0, PI], 4],
    ['sin(x + y)', [0, PI / 2, 0, PI / 2], 2],                          // −[sin(x + y)] → 2
    ['x*e^(x*y)', [0, 1, 0, 2], (E * E - 1) / 2 - 1],                   // ∫(e^{2x} − 1) dx
    ['1/((x + y)^2)', [1, 2, 1, 2], Math.log(9 / 8)],                    // ln((3·3)/(2·4))
    ['y*cos(x*y)', [0, PI, 0, 1], 2 / PI],                               // adentro sin(πy); afuera 2/π
    ['20 + x*y', [0, 4, 0, 2], 176]
  ];

  test('dblint: Gauss–Legendre = Simpson anidado = Monte Carlo = integral cerrada (15 casos)', () => {
    CASES.forEach(([src, R, exact], k) => {
      const f = D.fn(math, src);
      const g = D.gauss(f, R), s = D.simpson(f, R, 200), mc = D.monteCarlo(f, R, 60000, 100 + k);
      if (rel(g, exact) > 1e-10) throw new Error(`${src}: Gauss ${g}, exacto ${exact}`);
      if (rel(s, exact) > 1e-8) throw new Error(`${src}: Simpson ${s}, exacto ${exact}`);
      if (Math.abs(mc.value - exact) > 4 * mc.se + 1e-12) throw new Error(`${src}: Monte Carlo ${mc.value} ± ${mc.se}, exacto ${exact}`);
      near(D.average(f, R), exact / D.area(R), 1e-9 * (1 + Math.abs(exact)), src + ' promedio');
    });
    // La versión con texto, la que usan ejemplos y ejercicios.
    const r = D.integral(math, '16 - x^2 - 2y^2', 0, 2, 0, 2);
    near(r.value, 48, 1e-10, '∬ domo'); near(r.area, 4, 1e-15, 'área'); near(r.avg, 12, 1e-10, 'promedio');
  });

  test('dblint: Fubini — los dos órdenes coinciden, y las rebanadas son las integrales de adentro', () => {
    CASES.forEach(([src, R, exact]) => {
      const f = D.fn(math, src);
      const a = D.iterated(f, R, 'dxdy'), b = D.iterated(f, R, 'dydx');
      if (rel(a, b) > 1e-10 || rel(a, exact) > 1e-10) throw new Error(`${src}: dx dy ${a}, dy dx ${b}, exacto ${exact}`);
    });
    // Rebanada de 16 − x² − 2y² en y fija: A(y) = 32 − 8/3 − 4y², contra Simpson 1D propio.
    const f = D.fn(math, '16 - x^2 - 2y^2');
    [0, 0.5, 1.3, 2].forEach((y) => near(D.sliceX(f, [0, 2, 0, 2], y), 32 - 8 / 3 - 4 * y * y, 1e-10, 'A(' + y + ')'));
    [0, 0.7, 2].forEach((x) => near(D.sliceY(f, [0, 2, 0, 2], x), 32 - 2 * x * x - 16 / 3, 1e-10, 'B(' + x + ')'));
    near(D.slice(math, 'x + 3y^2', 0, 2, 0, 1, 'x', 0.5), 2 + 6 * 0.25, 1e-12, 'A(y) = 2 + 6y²');
    near(D.slice(math, 'x + 3y^2', 0, 2, 0, 1, 'y', 1.5), 1.5 + 1, 1e-12, 'B(x) = x + 1');
  });

  test('dblint: separable f(x)g(y) = producto de integrales; linealidad', () => {
    const pairs = [['e^x', 'cos(y)', [0, 1, 0, 1.2]], ['x^2', 'sin(y)', [-1, 2, 0, 2]], ['1/(1 + x)', 'y^3', [0, 3, -1, 2]], ['sqrt(x)', 'e^(-y)', [1, 4, 0, 3]]];
    pairs.forEach(([gx, hy, R]) => {
      const G = D.fn(math, gx), Hh = D.fn(math, hy.replace(/y/g, 'x'));
      const Ix = D.gl1((x) => G(x, 0), R[0], R[1]), Iy = D.gl1((y) => Hh(y, 0), R[2], R[3]);
      const both = D.gauss(D.fn(math, '(' + gx + ')*(' + hy + ')'), R);
      if (rel(both, Ix * Iy) > 1e-10) throw new Error(`${gx}·${hy}: ${both} ≠ ${Ix}·${Iy}`);
    });
    const R = [0, 2, -1, 1], f = D.fn(math, 'x^2*y + 1'), g = D.fn(math, 'cos(x) - y^2');
    const lin = D.gauss((x, y) => 3 * f(x, y) - 2 * g(x, y), R);
    near(lin, 3 * D.gauss(f, R) - 2 * D.gauss(g, R), 1e-10, 'linealidad');
  });

  test('dblint: sumas de Riemann — valores a mano, plano exacto con punto medio, O(h²) y O(h)', () => {
    const f = D.fn(math, '16 - x^2 - 2y^2');
    const r = D.riemann(f, [0, 2, 0, 2], 2, 2, 'mid');
    eq([r.sum, r.raw, r.dA, r.cells.length].join(), '49,49,1,4', 'domo 2 × 2 punto medio');
    eq(D.riemann(f, [0, 2, 0, 2], 2, 2, 'll').sum, 16 + 15 + 14 + 13, 'esquina inferior izquierda');
    eq(D.riemann(f, [0, 2, 0, 2], 2, 2, 'ur').sum, 13 + 10 + 7 + 4, 'esquina superior derecha');
    near(D.sum(math, '16 - x^2 - 2y^2', 0, 2, 0, 2, 2, 2, 'mid').sum, 49, 1e-12, 'sum con texto');
    // La regla del punto medio es exacta para planos.
    const pl = D.fn(math, '6 - x - 2y');
    [[1, 1], [2, 3], [5, 4]].forEach(([m, n]) => near(D.riemann(pl, [0, 2, 0, 1], m, n, 'mid').sum, 8, 1e-12, 'plano ' + m + '×' + n));
    // Orden de convergencia: al duplicar m y n, el error baja ≈ 4 (punto medio) o ≈ 2 (esquinas).
    ['e^x*cos(y)', 'x^2*y', 'sin(x)*sin(y) + x', '1/((x + y)^2)'].forEach((src, k) => {
      const R = [[0, 1, 0, 1.5], [0, 2, 1, 3], [0, 2, 0, 1], [1, 2, 1, 2]][k], F = D.fn(math, src), I = D.simpson(F, R, 400);
      const em = [8, 16, 32].map((m) => Math.abs(D.riemann(F, R, m, m, 'mid').sum - I));
      const el = [16, 32, 64].map((m) => Math.abs(D.riemann(F, R, m, m, 'll').sum - I));
      for (let i = 1; i < 3; i++) {
        const km = em[i - 1] / em[i], kl = el[i - 1] / el[i];
        if (km < 3.6 || km > 4.4) throw new Error(`${src}: punto medio baja ${km} veces (se espera ≈ 4)`);
        if (kl < 1.8 || kl > 2.2) throw new Error(`${src}: esquina baja ${kl} veces (se espera ≈ 2)`);
      }
    });
  });

  test('dblint: Monte Carlo reproducible con semilla y error estándar que baja como 1/√N', () => {
    const f = D.fn(math, 'x^2 + y'), R = [0, 1, 0, 2];
    eq(D.monteCarlo(f, R, 1000, 3).value, D.monteCarlo(f, R, 1000, 3).value, 'misma semilla, mismo valor');
    const a = D.monteCarlo(f, R, 2000, 5).se, b = D.monteCarlo(f, R, 32000, 5).se;
    near(a / b, 4, 0.5, 'se baja ≈ 4 veces con 16 veces más puntos');
  });

  test('dblint: diagnose en integral, suma y promedio', () => {
    const f = D.fn(math, 'x + 3y^2'), R = [0, 2, 0, 1];
    const c = D.context(f, R, 4, 2, 'mid');                     // I = 4; A(y) = 2 + 6y²; B(x) = x + 1
    const d = (s, mode) => D.diagnose(s, c, mode).reason;
    eq(d(4, 'int'), 'correct'); eq(d(4.004, 'int'), 'correct', 'holgura');
    near(c.onlyX, 6, 1e-10, 'A(1) − A(0)'); eq(d(6, 'int'), 'onlyX');
    near(c.onlyY, 2, 1e-10, 'B(2) − B(0)'); eq(d(2, 'int'), 'onlyY');
    near(c.swap, D.gauss(f, [0, 1, 0, 2]), 1e-12, 'límites cruzados'); eq(d(c.swap, 'int'), 'swap');
    near(c.sum, 3.875, 1e-12, 'suma 4 × 2'); eq(d(3.875, 'int'), 'sum');
    eq(d(-4, 'int'), 'sign'); eq(d(17, 'int'), 'mismatch');
    near(c.avg, 2, 1e-10, 'promedio'); eq(d(2, 'avg'), 'correct'); eq(d(4, 'avg'), 'integral');
    eq(d(c.center, 'avg'), 'center');
    // Suma 4 × 2 con punto medio: Σ f = 15.5 y ΔA = 0.25; esquinas: 2.25 y 6.25.
    near(c.raw, 15.5, 1e-12, 'Σ f'); near(c.by.ll, 2.25, 1e-12, 'esquina inferior'); near(c.by.ur, 6.25, 1e-12, 'esquina superior');
    eq(d(c.sum, 'sum'), 'correct'); eq(d(c.raw, 'sum'), 'noDA');
    eq(d(c.raw * c.dx, 'sum'), 'dxOnly'); eq(d(c.by.ll, 'sum'), 'rule-ll'); eq(d(c.by.ur, 'sum'), 'rule-ur');
    const dome = D.fn(math, '16 - x^2 - 2y^2');
    const c2 = D.context(dome, [0, 2, 0, 2], 2, 2, 'ur');          // suma 34; punto medio 49; integral 48
    eq(D.diagnose(48, c2, 'sum').reason, 'exact'); eq(D.diagnose(49, c2, 'sum').reason, 'rule-mid');
    const c3 = D.context(dome, [0, 2, 0, 2], 4, 3, 'ur');
    eq(D.diagnose(c3.raw * c3.dy, c3, 'sum').reason, 'dyOnly');
    eq(D.diagnose(NaN, c, 'int').kind, 'invalid');
    eq(D.near(1.234, 1.24), true); eq(D.near(1.22, 1.24), false); eq(D.near(0.0121, 0.012), true);
  });

  // Banco de S11: cada numérica con `ck` se recalcula con un Simpson anidado propio (no LabMath).
  const bankFile = path.join(__dirname, '..', '..', 'data', 'calculo-2', 'bank', 'sesion-11.js');
  if (fs.existsSync(bankFile)) {
    test('banco c2 S11: respuestas numéricas contra cuadratura propia (oráculo independiente)', () => {
      const { loadData } = require('../lib/load');
      const ROOT = path.join(__dirname, '..', '..');
      const W = loadData(['labs/registry', 'labs/antiderivative-check', 'exercises', 'quiz/bank-kit'].map((n) => path.join(ROOT, 'shared/js', n + '.js')), {});
      loadData(bankFile, W);
      const Q = W.CB_BANK.c2.S11.questions;
      const simp2 = (F, R, N) => {
        const hx = (R[1] - R[0]) / N, hy = (R[3] - R[2]) / N; let s = 0;
        for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
          const wi = i === 0 || i === N ? 1 : i % 2 ? 4 : 2, wj = j === 0 || j === N ? 1 : j % 2 ? 4 : 2;
          s += wi * wj * F(R[0] + i * hx, R[2] + j * hy);
        }
        return s * hx * hy / 9;
      };
      let seed = 9; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      let checked = 0, numeric = 0;
      Q.forEach((q) => {
        if (q.type === 'numeric') numeric++;
        if (!q.ck) return;
        for (let i = 0; i < 30; i++) {
          const v = W.CBExercises.instance(q, rnd), o = q.ck(v), code = math.parse(o.f).compile();
          const F = (x, y) => code.evaluate({ x, y });
          const R = o.R, A = (R[1] - R[0]) * (R[3] - R[2]);
          let want;
          if (o.kind === 'int') want = simp2(F, R, 120);
          else if (o.kind === 'avg') want = simp2(F, R, 120) / A;
          else if (o.kind === 'sum' || o.kind === 'raw') {
            // Suma de Riemann escrita a mano aquí: celda por celda con su punto de muestra.
            const dx = (R[1] - R[0]) / o.m, dy = (R[3] - R[2]) / o.n; let s = 0;
            for (let a = 0; a < o.m; a++) for (let b = 0; b < o.n; b++) {
              const off = o.rule === 'mid' ? 0.5 : o.rule === 'ur' ? 1 : 0;
              s += F(R[0] + (a + off) * dx, R[2] + (b + off) * dy);
            }
            want = o.kind === 'raw' ? s : s * dx * dy;
          } else if (o.kind === 'sliceX') want = simp2((x, y) => F(x, o.t), [R[0], R[1], 0, 1], 120);   // ∫ f(x, t) dx
          else if (o.kind === 'sliceY') want = simp2((x, y) => F(o.t, y), [0, 1, R[2], R[3]], 120);
          else throw new Error(`${q.id}: ck.kind desconocido ${o.kind}`);
          if (o.scale) want *= o.scale;
          if (o.plus) want += o.plus;
          const got = q.answer(v);
          if (Math.abs(got - want) > 1e-6 * Math.max(1, Math.abs(want))) throw new Error(`${q.id} ${JSON.stringify(v)}: respuesta ${got}, oráculo ${want}`);
          checked++;
        }
      });
      if (checked < 30 * Math.ceil(numeric * 0.8)) throw new Error(`solo ${checked / 30} de ${numeric} preguntas numéricas tienen ck`);
    });
  }
};
