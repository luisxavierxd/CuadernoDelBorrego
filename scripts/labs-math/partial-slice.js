// Pruebas de LabMath.partial (lab partial-slice, Cálculo 2 · S04). Oráculos independientes:
// diferencias centradas contra math.derivative en decenas de funciones y puntos, Clairaut
// numérico (f_xy ≈ f_yx con diferencias anidadas), diagnósticos de errores típicos y, del banco
// de S04, cada pregunta numérica marcada con `fd` se recalcula con diferencias finitas.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM, math }) => {
  const P = LM.partial;
  const rel = (a, b) => Math.abs(a - b) / (1 + Math.abs(b));

  const FUNS = [
    'x^2 + y^2', 'x^2 - y^2', 'x^2*y', 'x^3*y^2 + 4x*y - 5y', 'sin(x)*cos(y)', 'e^(-x^2 - y^2)',
    'sin(x*y)', '80 - x^2 - 3y^2', 'x*e^(x*y)', 'ln(x^2 + y^2 + 1)', 'sqrt(x^2 + 2y^2 + 1)', 'x/(1 + y^2)',
    'atan(y/(x + 3))', 'cos(x^2*y)', 'x^4*y - 3x*y^3 + 7', 'e^x*sin(2y)', '(x + 2y)^3', 'x*y/(x^2 + y^2 + 1)'
  ];
  const PTS = [[0.3, 0.7], [1, 1], [-0.8, 0.5], [1.2, -0.6], [-1.1, -1.3]];

  test('partial: diferencias centradas contra math.derivative (18 funciones × 5 puntos × 2 variables)', () => {
    let n = 0;
    FUNS.forEach((src) => {
      const f = P.fn2(math, src);
      PTS.forEach(([a, b]) => ['x', 'y'].forEach((w) => {
        const exact = math.derivative(LM.core.prep(src), w).evaluate({ x: a, y: b });
        const num = P.central(f, a, b, w);
        if (rel(num, exact) > 1e-6) throw new Error(`${src} ∂/∂${w} en (${a}, ${b}): numérica ${num}, simbólica ${exact}`);
        near(P.at(math, src, { x: a, y: b }, w), exact, 1e-12 * (1 + Math.abs(exact)), 'at');
        n++;
      }));
    });
    eq(n, FUNS.length * PTS.length * 2);
  });

  test('partial: Clairaut numérico (f_xy ≈ f_yx) y segundas parciales contra math.derivative', () => {
    FUNS.forEach((src) => {
      const f = P.fn2(math, src);
      PTS.forEach(([a, b]) => {
        const xy = P.second(f, a, b, 'xy'), yx = P.second(f, a, b, 'yx');
        const exact = math.derivative(math.derivative(LM.core.prep(src), 'x'), 'y').evaluate({ x: a, y: b });
        if (rel(xy, yx) > 1e-5) throw new Error(`${src} en (${a}, ${b}): f_xy ${xy} y f_yx ${yx}`);
        if (rel(xy, exact) > 1e-5) throw new Error(`${src} en (${a}, ${b}): f_xy numérica ${xy} y simbólica ${exact}`);
        near(P.secondAt(math, src, { x: a, y: b }, 'yx'), exact, 1e-9 * (1 + Math.abs(exact)), 'secondAt yx = xy simbólico');
        ['xx', 'yy'].forEach((o) => {
          const ex2 = math.derivative(math.derivative(LM.core.prep(src), o[0]), o[1]).evaluate({ x: a, y: b });
          if (rel(P.second(f, a, b, o), ex2) > 1e-4) throw new Error(`${src} f_${o} en (${a}, ${b})`);
        });
      });
    });
  });

  test('partial: la traza pasa por el punto y la tangente tiene la pendiente de la parcial', () => {
    const src = 'x^2*y', f = P.fn2(math, src);
    const tx = P.tangent(f, 1, 1.5, 'x'), ty = P.tangent(f, 1, 1.5, 'y');
    near(P.trace(f, 1, 1.5, 'x')(1), 1.5, 1e-12); near(P.trace(f, 1, 1.5, 'y')(1.5), 1.5, 1e-12);
    near(tx.m, 3, 1e-8, '∂/∂x = 2xy = 3'); near(ty.m, 1, 1e-8, '∂/∂y = x² = 1');
    near(tx.at(2), 1.5 + 3, 1e-8); eq(tx.t0, 1); eq(ty.t0, 1.5);
  });

  test('partial: at con tres variables y gas ideal P = nRT/V', () => {
    near(P.at(math, 'x*y^2*z^3 + 2x*z', { x: 1, y: 2, z: 1 }, 'z'), 3 * 1 * 4 * 1 + 2, 1e-12);
    const n = 2, R = 8.31, T = 300, V = 0.05;
    near(P.at(math, 'n*R*T/V', { n, R, T, V }, 'V'), -n * R * T / (V * V), 1e-6);
    near(P.at(math, 'n*R*T/V', { n, R, T, V }, 'T'), n * R / V, 1e-9);
    near(P.value(math, 'n*R*T/V', { n, R, T, V }), n * R * T / V, 1e-6);
  });

  test('noChain: quita solo el factor de adentro', () => {
    const cmp = (a, b) => P.same(math, a, b, 0.7, 0.4);
    eq(cmp(P.noChain(math, 'sin(x*y)', 'x'), 'cos(x*y)'), true, 'sen(xy)');
    eq(cmp(P.noChain(math, 'e^(x^2*y)', 'x'), 'e^(x^2*y)'), true, 'e^(x²y)');
    eq(cmp(P.noChain(math, 'x*sin(x*y)', 'x'), 'sin(x*y) + x*cos(x*y)'), true, 'producto con cadena');
    eq(cmp(P.noChain(math, '(x^2 + y)^3', 'x'), '3(x^2 + y)^2'), true, 'potencia de un binomio');
    eq(cmp(P.noChain(math, 'ln(x^2 + y^2 + 1)', 'y'), '1/(x^2 + y^2 + 1)'), true, 'logaritmo');
    eq(P.noChain(math, 'x^2*y + sin(x)', 'x'), null, 'sin funciones compuestas');
  });

  test('diagnose: correcto, otra variable, producto de más, cadena, signo, factor y distinto', () => {
    const d = (src, w, s, a, b) => P.diagnose(math, src, w, s, a, b).reason;
    eq(d('x^2*y', 'x', '2x*y', 1, 1.5), 'correct');
    eq(d('x^2*y', 'x', 'x^2', 1, 1.5), 'other');
    eq(d('x^2*y', 'x', '2x*y + x^2', 1, 1.5), 'product');
    eq(d('x^2*y', 'y', 'x^2 + 2x*y', 1, 1.5), 'product');
    eq(d('sin(x*y)', 'x', 'cos(x*y)', 1, 1), 'chain');
    eq(d('e^(-x^2 - y^2)', 'y', 'e^(-x^2 - y^2)', 0.5, 0.5), 'chain');
    eq(d('sin(x)*cos(y)', 'y', 'sin(x)*sin(y)', 1, 0.5), 'sign');
    eq(d('x^3*y^2', 'x', 'x^2*y^2', 1, 1), 'factor');
    eq(d('x^3*y^2', 'x', 'x + y', 1, 1), 'mismatch');
    eq(P.diagnose(math, 'ln(x)', 'x', '1/x', -3, 0).reason, 'domain', 'fuera del dominio');
  });

  test('diagnoseValue: valor correcto y errores típicos en el punto', () => {
    const d = (src, w, s, a, b) => P.diagnoseValue(math, src, w, s, a, b).reason;
    // f = x²y en (1, 1.5): f_x = 3, f_y = 1, f = 1.5
    eq(d('x^2*y', 'x', 3, 1, 1.5), 'correct');
    eq(d('x^2*y', 'x', 3.004, 1, 1.5), 'correct', 'redondeo');
    eq(d('x^2*y', 'x', 1, 1, 1.5), 'other');
    eq(d('x^2*y', 'x', 4, 1, 1.5), 'product');
    eq(d('x^2*y', 'x', 1.5, 1, 1.5), 'value');
    eq(d('x^2*y', 'x', -3, 1, 1.5), 'sign');
    eq(d('sin(x*y)', 'x', Math.cos(3), 1.5, 2), 'chain');
    eq(d('x^2*y', 'x', 7, 1, 1.5), 'mismatch');
    near(P.diagnoseValue(math, 'x^2*y', 'x', 3, 1, 1.5).numeric, 3, 1e-8);
  });

  // Banco de S04: las preguntas numéricas con `fd` se recalculan con diferencias finitas propias.
  const bankFile = path.join(__dirname, '..', '..', 'data', 'calculo-2', 'bank', 'sesion-04.js');
  if (fs.existsSync(bankFile)) {
    test('banco c2 S04: respuestas numéricas contra diferencias finitas (oráculo independiente)', () => {
      const { loadData } = require('../lib/load');
      const ROOT = path.join(__dirname, '..', '..');
      const W = loadData(['labs/registry', 'labs/antiderivative-check', 'exercises', 'quiz/bank-kit'].map((n) => path.join(ROOT, 'shared/js', n + '.js')), {});
      loadData(bankFile, W);
      const Q = W.CB_BANK.c2.S04.questions;
      let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      let checked = 0;
      Q.filter((q) => q.fd).forEach((q) => {
        for (let i = 0; i < 40; i++) {
          const v = W.CBExercises.instance(q, rnd), o = q.fd(v), code = math.parse(o.f).compile();
          const F = (pt) => code.evaluate(Object.assign({}, pt));
          const d1 = (pt, w, hh) => { const p1 = Object.assign({}, pt), p0 = Object.assign({}, pt); p1[w] += hh; p0[w] -= hh; return (F(p1) - F(p0)) / (2 * hh); };
          const hx = (w) => 1e-4 * Math.max(1, Math.abs(o.pt[w]));
          let want;
          if (o.order) {
            // Segunda parcial: diferencias centradas anidadas (primero order[0], luego order[1]).
            const w1 = o.order[0], w2 = o.order[1], h1 = hx(w1) * 10, h2 = hx(w2) * 13;
            const g = (p) => d1(p, w1, h1);
            const p1 = Object.assign({}, o.pt), p0 = Object.assign({}, o.pt);
            p1[w2] += h2; p0[w2] -= h2;
            want = (g(p1) - g(p0)) / (2 * h2);
          } else want = d1(o.pt, o.wrt, hx(o.wrt));
          if (o.scale) want *= o.scale;
          const got = q.answer(v);
          if (Math.abs(got - want) > 1e-5 * Math.max(1, Math.abs(want))) throw new Error(`${q.id} ${JSON.stringify(v)}: respuesta ${got}, diferencias finitas ${want}`);
          checked++;
        }
      });
      if (checked < 400) throw new Error('muy pocas preguntas con fd: ' + checked / 40);
      // `alt`: la misma cantidad por otro camino (el cociente o la tangente evaluados directo).
      Q.filter((q) => q.alt).forEach((q) => {
        for (let i = 0; i < 40; i++) {
          const v = W.CBExercises.instance(q, rnd), got = q.answer(v), want = q.alt(v);
          if (Math.abs(got - want) > 1e-6 * Math.max(1, Math.abs(want))) throw new Error(`${q.id} ${JSON.stringify(v)}: respuesta ${got}, otro camino ${want}`);
        }
      });
      // `so`: las segundas parciales escritas contra math.derivative aplicado dos veces a f.
      let so = 0;
      Q.filter((q) => q.so).forEach((q) => {
        for (let i = 0; i < 20; i++) {
          const v = W.CBExercises.instance(q, rnd), o = q.so(v);
          let d = math.parse(LM.core.prep(o.f));
          for (const c of o.order) d = math.derivative(d, c);
          const ref = d.compile(), mine = math.parse(LM.core.prep(q.answer(v))).compile();
          for (let k = 0; k < 8; k++) {
            const pt = { x: 0.3 + 0.11 * k, y: 0.25 + 0.09 * ((k * 3) % 8) };
            const a = mine.evaluate(Object.assign({}, pt)), b = ref.evaluate(Object.assign({}, pt));
            if (Math.abs(a - b) > 1e-9 * (1 + Math.abs(b))) throw new Error(`${q.id} ${JSON.stringify(v)} en ${JSON.stringify(pt)}: ${a} y math.derivative da ${b}`);
          }
          so++;
        }
      });
      if (so < 160) throw new Error('muy pocas segundas parciales con so: ' + so / 20);
    });
  }
};
