// Pruebas de LabMath.polarElement (lab polar-element, Cálculo 2 · S13). Oráculos independientes:
// la integral en polares contra la cuadratura en RECTANGULARES sobre la misma región (y contra
// Monte Carlo en x, y), fórmulas cerradas conocidas (pétalo, cardioide, paraboloide, Gauss), la
// convergencia de la suma de rectángulos polares, el error esperado al olvidar la r, y el banco
// de S13 recalculado con LabMath (campo `chk` de cada pregunta numérica).
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const P = LM.polarElement;
  const PI = Math.PI, TAU = 2 * PI;
  let seed = 4242;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const rel = (a, b) => Math.abs(a - b) / Math.max(1, Math.abs(b));

  test('polarElement: la integral polar da las fórmulas cerradas (disco, Gauss, paraboloide, esfera, densidad)', () => {
    [1, 1.5, 2, 3].forEach((a) => {
      near(P.integral('disk', { a }, 'r2', {}), PI * a ** 4 / 2, 1e-10, `∬ (x² + y²), a = ${a}`);
      near(P.integral('disk', { a }, 'gauss', {}), PI * (1 - Math.exp(-a * a)), 1e-12, `∬ e^(−r²), a = ${a}`);
      near(P.integral('disk', { a }, 'r', { k: 3 }), 2 * PI * a ** 3, 1e-10, `masa con δ = 3r, a = ${a}`);
      near(P.integral('disk', { a: Math.sqrt(a * 3) }, 'para', { c: a * 3 }), PI * (a * 3) ** 2 / 2, 1e-9, `paraboloide c = ${a * 3}`);
      near(P.integral('disk', { a }, 'sphere', { a }), 2 * PI * a ** 3 / 3, 1e-9, `media esfera a = ${a}`);
      near(P.integral('annulus', { a, b: a + 1 }, 'inv', { k: 1 }), TAU, 1e-10, 'δ = 1/r en un anillo de ancho 1');
    });
    near(P.integral('sector', { a: 2, t0: 0, t1: PI / 2 }, 'gauss', {}), PI * (1 - Math.exp(-4)) / 4, 1e-12);
    near(P.integral('offset', { a: 1.5 }, 'one', {}), PI * 2.25, 1e-10, 'disco que pasa por el origen');
  });

  test('polarElement: Gauss: ∬ e^(−(x² + y²)) sobre discos grandes → π, así que ∫ e^(−x²) dx = √π', () => {
    [2, 4, 6, 8].forEach((R) => near(P.integral('disk', { a: R }, 'gauss', {}), PI * (1 - Math.exp(-R * R)), 1e-12));
    near(Math.sqrt(P.integral('disk', { a: 10 }, 'gauss', {})), Math.sqrt(PI), 1e-12);
    // Oráculo 1D independiente: Simpson de e^(−x²) en [−8, 8].
    let s = 0; const n = 4000, h = 16 / n;
    for (let i = 0; i <= n; i++) { const x = -8 + i * h; s += (i === 0 || i === n ? 1 : i % 2 ? 4 : 2) * Math.exp(-x * x); }
    near(s * h / 3, Math.sqrt(P.integral('disk', { a: 10 }, 'gauss', {})), 1e-10, 'Simpson contra la raíz de la integral polar');
  });

  test('polarElement: áreas polares ½∫(r₂² − r₁²) dθ contra fórmulas (pétalo, cardioide, entre círculos, sector, anillo)', () => {
    [[2, 3], [3, 3], [2, 2], [1, 5], [4, 4]].forEach(([a, n]) => near(P.area('petal', { a, n }), PI * a * a / (4 * n), 1e-12, `pétalo a = ${a}, n = ${n}`));
    [1, 1.5, 2].forEach((a) => {
      near(P.area('cardioid', { a }), 1.5 * PI * a * a, 1e-12, 'cardioide');
      near(P.area('between', { a }), a * a * (PI / 3 + Math.sqrt(3) / 2), 1e-12, 'entre r = a y r = 2a cos θ');
      near(P.area('annulus', { a, b: 2 * a }), PI * 3 * a * a, 1e-12, 'anillo');
      near(P.area('sector', { a, t0: 0, t1: PI / 3 }), a * a * PI / 6, 1e-12, 'sector ½a²θ');
    });
    // El área por ½∫ r² dθ coincide con ∬ 1 · r dr dθ (dos caminos).
    Object.keys(P.SETS).forEach((rk) => P.SETS[rk].forEach((rp) => near(P.area(rk, rp), P.integral(rk, rp, 'one', {}), 1e-10, rk + JSON.stringify(rp))));
  });

  test('polarElement: la integral polar coincide con la cuadratura en rectangulares en todos los presets y con integrandos variados', () => {
    const F = [['one', {}], ['r2', {}], ['gauss', {}], ['r', {}], ['para', { c: 9 }], ['x', {}], ['y2', { k: 2 }]];
    Object.keys(P.SETS).forEach((rk) => {
      F.forEach(([fk, fp], i) => {
        const rp = P.SETS[rk][i % P.SETS[rk].length];
        const pol = P.integral(rk, rp, fk, fp), rec = P.rect(rk, rp, fk, fp, { tol: 1e-8, ny: 400, nang: 400 });
        if (!(rel(rec, pol) < 1e-4)) throw new Error(`${rk} ${JSON.stringify(rp)} f = ${fk}: polar ${pol}, rectangular ${rec}`);
      });
    });
    // Región que pasa por el origen y la de 1/r (singular en el origen, fuera del anillo).
    const r1 = P.rect('offset', { a: 1 }, 'r2', {}), p1 = P.integral('offset', { a: 1 }, 'r2', {});
    near(p1, 3 * PI / 2, 1e-10, '∬ (x² + y²) sobre (x − 1)² + y² ≤ 1 = 3π/2');
    if (!(rel(r1, p1) < 1e-5)) throw new Error('offset: ' + r1 + ' contra ' + p1);
  });

  test('polarElement: Monte Carlo en (x, y) sobre el cuadrado confirma la integral polar (tolerancia 3 %)', () => {
    [['disk', { a: 2 }, 'r2'], ['cardioid', { a: 1 }, 'one'], ['petal', { a: 3, n: 3 }, 'one'], ['between', { a: 1.5 }, 'gauss'], ['annulus', { a: 1, b: 3 }, 'r']].forEach(([rk, rp, fk]) => {
      const reg = P.region(rk, rp), f = P.integrand(fk, {}).f;
      const mc = P.monteCarlo(f, reg, 200000, rand), pol = P.polarIntegral(f, reg);
      if (!(Math.abs(mc - pol) <= 0.03 * Math.abs(pol))) throw new Error(`${rk} ${fk}: Monte Carlo ${mc} contra ${pol}`);
    });
  });

  test('polarElement: el rectángulo polar mide r* Δr Δθ (resta de dos sectores) y los de afuera son más grandes', () => {
    for (let i = 0; i < 200; i++) {
      const rin = rand() * 4, dr = 0.01 + rand(), dt = 0.01 + rand() * 1.5;
      const sectors = (rin + dr) ** 2 * dt / 2 - rin ** 2 * dt / 2;
      near(P.cellArea(rin, rin + dr, dt), sectors, 1e-12);
      near(P.cellArea(rin, rin + dr, dt), (rin + dr / 2) * dr * dt, 1e-12, 'r* Δr Δθ');
    }
    // Mismo Δr y Δθ: el k-ésimo anillo (desde el origen) mide (2k − 1) veces el primero.
    const S = P.polarSum(() => 1, P.region('disk', { a: 2 }), 5, 8);
    const col = S.cells.filter((c) => c.j === 0);
    col.forEach((c, k) => near(c.area / col[0].area, 2 * k + 1, 1e-12));
    // Con límites constantes la suma de áreas es exacta para cualquier malla.
    near(P.polarSum(() => 1, P.region('annulus', { a: 1, b: 3 }), 3, 7).sum, 8 * PI, 1e-12);
    near(P.polarSum(() => 1, P.region('sector', { a: 2, t0: 0, t1: PI / 3 }), 2, 5).sum, 2 * PI / 3, 1e-12);
  });

  test('polarElement: la suma Σ f r* Δr Δθ converge (error ~ 1/n²) y sin la r se va a otro valor', () => {
    [['disk', { a: 2 }, 'r2'], ['cardioid', { a: 1 }, 'gauss'], ['petal', { a: 2, n: 3 }, 'r'], ['between', { a: 1 }, 'para']].forEach(([rk, rp, fk]) => {
      const reg = P.region(rk, rp), f = P.integrand(fk, fk === 'para' ? { c: 9 } : {}).f, ex = P.polarIntegral(f, reg);
      const e1 = Math.abs(P.polarSum(f, reg, 8, 16).sum - ex), e2 = Math.abs(P.polarSum(f, reg, 16, 32).sum - ex), e3 = Math.abs(P.polarSum(f, reg, 64, 128).sum - ex);
      if (!(e2 < e1 / 2.5 && e3 < 1e-3 * Math.max(1, ex))) throw new Error(`${rk} ${fk}: errores ${e1}, ${e2}, ${e3}`);
      // Sin la r la suma converge a ∬ f dr dθ, que NO es la integral.
      const forgot = P.polarIntegral(f, reg, { power: 0 }), s0 = P.polarSum(f, reg, 64, 128, 0).sum;
      if (!(Math.abs(s0 - forgot) < 1e-3 * Math.max(1, forgot))) throw new Error(`${rk} ${fk}: sin r ${s0} contra ${forgot}`);
      if (!(Math.abs(forgot - ex) > 0.02 * Math.abs(ex))) throw new Error(`${rk} ${fk}: olvidar la r no cambia nada`);
    });
    // Error esperado sin la r en el disco con f = x² + y²: 2πa³/3 en lugar de πa⁴/2.
    [1, 2, 3].forEach((a) => near(P.integral('disk', { a }, 'r2', {}, { power: 0 }), 2 * PI * a ** 3 / 3, 1e-10));
    near(P.integral('disk', { a: 2 }, 'one', {}, { power: 0 }), 4 * PI, 1e-12, 'área sin la r: 2πa');
  });

  test('polarElement: inside() reconoce los puntos de la descripción polar y rechaza los de afuera', () => {
    Object.keys(P.SETS).forEach((rk) => P.SETS[rk].forEach((rp) => {
      const reg = P.region(rk, rp);
      for (let i = 0; i < 200; i++) {
        const t = reg.alpha + (reg.beta - reg.alpha) * (0.02 + 0.96 * rand()), lo = reg.r1(t), hi = reg.r2(t);
        const r = lo + (hi - lo) * (0.02 + 0.96 * rand());
        if (r > 1e-6 && !P.inside(reg, r * Math.cos(t), r * Math.sin(t))) throw new Error(`${rk}: (${r}, ${t}) debería estar dentro`);
        const ro = hi + 0.05 + rand();
        if (P.inside(reg, ro * Math.cos(t), ro * Math.sin(t)) && reg.full) throw new Error(`${rk}: (${ro}, ${t}) debería estar fuera`);
      }
    }));
    eq(P.inside(P.region('petal', { a: 2, n: 3 }), -1, 0), false, 'detrás del origen no hay pétalo');
    eq(P.inside(P.region('between', { a: 1 }), 0.8, 0), false, 'dentro de r = 1 no cuenta');
  });

  test('polarElement: el diagnóstico da el «casi» (sin r, r², vuelta completa, mitad, doble)', () => {
    const reg = P.region('petal', { a: 2, n: 3 }), f = P.integrand('one', {}).f, ex = P.polarIntegral(f, reg), c = P.candidates(f, reg);
    eq(P.diagnose(ex, ex, c).kind, 'ok');
    eq(P.diagnose(+ex.toFixed(2), ex, c).kind, 'ok', 'redondeado a 2 decimales');
    eq(P.diagnose(c.forgot, ex, c).key, 'forgot');
    eq(P.diagnose(c.rsq, ex, c).key, 'rsq');
    near(c.fullTurn, PI * 4 / 2, 1e-10, 'r = 2cos 3θ de 0 a 2π da πa²/2');
    eq(P.diagnose(c.fullTurn, ex, c).key, 'fullTurn');
    eq(P.diagnose(ex / 2, ex, c).key, 'half');
    eq(P.diagnose(2 * ex, ex, c).key, 'double');
    eq(P.diagnose(ex + 1, ex, c).kind, 'bad');
    eq(P.diagnose(NaN, ex, c).kind, 'bad');
    const d = P.region('disk', { a: 2 }), cd = P.candidates(P.integrand('r2', {}).f, d);
    eq(cd.fullTurn, null, 'el disco ya da la vuelta');
    near(cd.forgot, 16 * PI / 3, 1e-10);
  });

  test('polarElement: retos al azar válidos (región finita, valor positivo, casi distintos del correcto)', () => {
    for (let i = 0; i < 60; i++) {
      const c = P.randomChallenge(rand), reg = P.region(c.rk, c.rp), f = P.integrand(c.fk, c.fp).f, v = P.polarIntegral(f, reg);
      if (!(isFinite(v) && v > 0 && reg.R <= 3)) throw new Error(JSON.stringify(c) + ' → ' + v);
      if (!(P.angTex(reg.alpha).length && typeof reg.desc === 'string')) throw new Error('sin descripción');
    }
    eq(P.angTex(PI / 3), '\\frac{\\pi}{3}'); eq(P.angTex(-PI / 6), '-\\frac{\\pi}{6}'); eq(P.angTex(TAU), '2\\pi'); eq(P.angTex(3 * PI / 4), '\\frac{3\\pi}{4}');
  });

  // Banco de S13: cada numérica con `chk` se recalcula con LabMath.polarElement.
  const bankFile = path.join(__dirname, '..', '..', 'data', 'calculo-2', 'bank', 'sesion-13.js');
  if (fs.existsSync(bankFile)) {
    test('polarElement: banco c2 S13 contra LabMath (integrales polares numéricas)', () => {
      const { loadData } = require('../lib/load');
      const ROOT = path.join(__dirname, '..', '..');
      const W = loadData([path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
      const all = W.CB_BANK.c2.S13.questions;
      const Q = all.filter((q) => q.chk);
      const nNum = all.filter((q) => q.type === 'numeric').length;
      if (Q.length < nNum) throw new Error(`solo ${Q.length} de ${nNum} numéricas con chk`);
      Q.forEach((q) => {
        for (let i = 0; i < 30; i++) {
          const v = W.CBExercises.instance(q, rand);
          const want = q.chk(v, P), got = q.answer(v);
          if (!(Math.abs(got - want) <= 1e-9 * Math.max(1, Math.abs(want)))) throw new Error(`${q.id} ${JSON.stringify(v)}: respuesta ${got} y LabMath da ${want}`);
        }
      });
    });
  }
};
