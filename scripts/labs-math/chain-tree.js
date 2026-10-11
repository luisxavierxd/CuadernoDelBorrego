// Pruebas de LabMath.chainTree (lab chain-tree, Cálculo 2 · S06). Oráculos independientes:
// la regla de la cadena por el árbol (parciales simbólicas de math.js) contra diferencias
// finitas propias de la composición z(x(t), y(t)) en decenas de casos; la implícita contra la
// pendiente numérica de la curva de nivel (resolviendo F = 0 por bisección cerca del punto);
// diagnósticos de errores típicos y, del banco de S06, cada pregunta con `ck` se recalcula
// con diferencias finitas sobre la composición (o la curva de nivel), sin la fórmula de la respuesta.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM, math }) => {
  const C = LM.chainTree;
  const rel = (a, b) => Math.abs(a - b) / (1 + Math.abs(b));

  // Diferencias centradas con un paso de Richardson (independientes de LabMath.ridders).
  function fd(g, x) {
    const d = (hh) => (g(x + hh) - g(x - hh)) / (2 * hh);
    const hh = 1e-3 * Math.max(1, Math.abs(x));
    return (4 * d(hh / 2) - d(hh)) / 3;
  }
  // Composición evaluada a mano con math.evaluate (sin LabMath).
  function composeRaw(spec) {
    const f = math.parse(LM.core.prep(spec.f)).compile();
    const inner = Object.keys(spec.inner).map((u) => [u, math.parse(LM.core.prep(spec.inner[u])).compile()]);
    return (at) => { const p = {}; inner.forEach(([u, c]) => { p[u] = c.evaluate(Object.assign({}, at)); }); return f.evaluate(p); };
  }

  const FS = ['x^2*y', 'x*y', 'e^(x*y)', 'sin(x)*cos(y)', 'x^2 - 3y^2 + x*y', 'ln(x^2 + y^2 + 1)', 'sqrt(x^2 + y^2 + 4)', 'x/(1 + y^2)', '30 - x^2 - 2y^2', 'x^3*y - y^2'];
  const INS = [['t^2', '3t + 1'], ['cos(t)', 'sin(t)'], ['1 + t', '2t'], ['e^t', 't^3 - t'], ['t', 't^2'], ['sqrt(t + 2)', '1/(t + 3)']];
  const TS = [0.3, 0.8, 1.2];

  test('chainTree: el árbol coincide con diferencias finitas de la composición (10 f × 6 trayectorias × 3 t₀)', () => {
    let n = 0;
    FS.forEach((f) => INS.forEach(([x, y]) => TS.forEach((t) => {
      const spec = { f, inner: { x, y }, params: ['t'] }, at = { t };
      const Z = composeRaw(spec), want = fd((u) => Z({ t: u }), t);
      const T = C.tree(math, spec, at, 't');
      if (rel(T.total, want) > 1e-6) throw new Error(`${f} con x = ${x}, y = ${y} en t = ${t}: árbol ${T.total}, diferencias ${want}`);
      if (rel(C.numDeriv(math, spec, at, 't'), T.total) > 1e-9) throw new Error(`Ridders lejos del árbol: ${f}, ${x}, ${y}, ${t}`);
      eq(T.paths.length, 2);
      near(T.paths[0].prod + T.paths[1].prod, T.total, 1e-12 * (1 + Math.abs(T.total)));
      n++;
    })));
    eq(n, FS.length * INS.length * TS.length);
  });

  test('chainTree: dos parámetros (∂z/∂s y ∂z/∂t) y tres intermedias', () => {
    const INS2 = [['s*cos(t)', 's*sin(t)'], ['s + t', 's*t'], ['s^2 - t', 'e^(s*t)'], ['s*t^2', 's - 2t']];
    const PTS = [[2, 0.5], [1, 2], [-0.7, 1.3]];
    FS.forEach((f) => INS2.forEach(([x, y]) => PTS.forEach(([s, t]) => {
      const spec = { f, inner: { x, y }, params: ['s', 't'] }, Z = composeRaw(spec);
      ['s', 't'].forEach((w) => {
        const at = { s, t }, want = fd((u) => Z(Object.assign({}, at, { [w]: u })), at[w]);
        const got = C.tree(math, spec, at, w).total;
        if (!isFinite(want)) return;
        if (rel(got, want) > 1e-6) throw new Error(`${f}, x = ${x}, y = ${y} ∂/∂${w} en (${s}, ${t}): árbol ${got}, diferencias ${want}`);
      });
    })));
    const spec3 = { f: 'x*y + z^2', inner: { x: 'cos(t)', y: 'sin(t)', z: 't' }, params: ['t'] };
    [0, Math.PI / 4, 0.8, 1.7].forEach((t) => {
      near(C.tree(math, spec3, { t }, 't').total, Math.cos(2 * t) + 2 * t, 1e-10, 'w = ½ sen 2t + t²');
      eq(C.tree(math, spec3, { t }, 't').paths.length, 3);
    });
  });

  test('chainTree: cuántos términos tiene la derivada (un término por intermedia que depende del parámetro)', () => {
    eq(C.terms(math, { f: 'x*y*z', inner: { x: 's*t', y: 's', z: 't^2' } }, 't'), 2);
    eq(C.terms(math, { f: 'x*y*z', inner: { x: 's*t', y: 's', z: 't^2' } }, 's'), 2);
    eq(C.terms(math, { f: 'x + y', inner: { x: 's + t', y: 's*t' } }, 't'), 2);
    eq(C.terms(math, { f: 'x + y', inner: { x: 's', y: 't' } }, 't'), 1);
    const T = C.tree(math, { f: 'x^2 + y^2', inner: { x: 's', y: 's*t' }, params: ['s', 't'] }, { s: 2, t: 1 }, 't');
    eq(T.paths.length, 1); near(T.total, 2 * 2 * 2, 1e-12, '∂/∂t de s² + s²t² = 2s²t');
  });

  test('chainTree: expr da la misma derivada que el árbol y que la composición', () => {
    const specs = [{ f: 'x^2*y', inner: { x: 't^2', y: '3t + 1' }, params: ['t'] }, { f: 'e^(x*y)', inner: { x: 't', y: 't^2' }, params: ['t'] }, { f: 'x^2 - y^2', inner: { x: 's*cos(t)', y: 's*sin(t)' }, params: ['s', 't'] }];
    specs.forEach((sp) => {
      const w = 't', code = math.parse(C.expr(math, sp, w)).compile(), Z = composeRaw(sp);
      [{ s: 1.3, t: 0.4 }, { s: 0.7, t: 1.1 }].forEach((at) => {
        const got = code.evaluate(Object.assign({}, at)), want = fd((u) => Z(Object.assign({}, at, { t: u })), at.t);
        if (rel(got, want) > 1e-6) throw new Error(`expr ${sp.f}: ${got} contra ${want}`);
      });
    });
  });

  // Bisección propia para y en F(x, y) = 0 dentro de [lo, hi] (sin LabMath).
  function bisect(F, x, lo, hi) {
    let a = lo, b = hi, fa = F(x, a);
    for (let i = 0; i < 200; i++) { const m = (a + b) / 2, fm = F(x, m); if ((fm < 0) === (fa < 0)) { a = m; fa = fm; } else b = m; }
    return (a + b) / 2;
  }
  test('chainTree: implícita −F_x/F_y contra la pendiente numérica de la curva de nivel', () => {
    const cases = [
      ['x^2*y + y^3 - 10', 3, 1], ['x^3 + y^3 - 6x*y', 3, 3], ['x^2 + y^2 - 25', 3, 4], ['x^2 + y^2 - 25', -4, 3],
      ['x*y + y^3 - 6', 5, 1], ['e^(x*y) + y - 2', 0, 1], ['sin(x) + y^3 + y - 2', 0, 1], ['x^2 - x*y + 2y^2 - 8', 2, 2]
    ];
    cases.forEach(([src, x0, y0]) => {
      const code = math.parse(LM.core.prep(src)).compile(), F = (x, y) => code.evaluate({ x, y });
      if (Math.abs(F(x0, y0)) > 1e-12) throw new Error(`${src}: (${x0}, ${y0}) no está en la curva`);
      const yOf = (x) => bisect(F, x, y0 - 0.3, y0 + 0.3), hh = 1e-4;
      const want = (yOf(x0 + hh) - yOf(x0 - hh)) / (2 * hh);
      const got = C.implicit(math, src, { x: x0, y: y0 }, 'x', 'y').slope;
      if (rel(got, want) > 1e-6) throw new Error(`${src} en (${x0}, ${y0}): −F_x/F_y ${got}, pendiente numérica ${want}`);
      if (rel(C.implicitNum(math, src, { x: x0, y: y0 }, 'x', 'y'), got) > 1e-8) throw new Error(`implicitNum lejos en ${src}`);
    });
    // Tres variables: ∂z/∂x = −F_x/F_z en x²z + yz³ = 10 por (1, 1, 2), contra resolver z(x, 1).
    const src3 = 'x^2*z + y*z^3 - 10', c3 = math.parse(src3).compile();
    const zOf = (x) => bisect((xx, z) => c3.evaluate({ x: xx, y: 1, z }), x, 1.7, 2.3);
    const want3 = (zOf(1 + 1e-4) - zOf(1 - 1e-4)) / 2e-4;
    near(C.implicit(math, src3, { x: 1, y: 1, z: 2 }, 'x', 'z').slope, -4 / 13, 1e-12);
    if (rel(-4 / 13, want3) > 1e-6) throw new Error('∂z/∂x numérica ' + want3);
    near(C.solveFor(math, 'x^2 + y^2 - 25', { x: 3, y: 3.5 }, 'y'), 4, 1e-10, 'Newton');
  });

  test('diagnoseValue: correcto, camino olvidado, producto, parciales en t, sin factores de adentro, signo', () => {
    // z = x²y, x = t², y = 3t + 1 en t = 1: caminos 8·2 = 16 y 1·3 = 3 → 19.
    const sp = { f: 'x^2*y', inner: { x: 't^2', y: '3t + 1' }, params: ['t'] }, at = { t: 1 };
    const d = (s) => C.diagnoseValue(math, sp, at, 't', s).reason;
    eq(d(19), 'correct'); eq(d(19.004), 'correct', 'redondeo');
    eq(d(16), 'missing'); eq(d(3), 'missing'); eq(d(48), 'product');
    // En t: f_x(1, 1) = 2, f_y(1, 1) = 1 → 2·2 + 1·3 = 7. Sin factores: 8 + 1 = 9.
    eq(d(7), 'atParam'); eq(d(9), 'outerOnly'); eq(d(-19), 'sign'); eq(d(5), 'mismatch');
    near(C.diagnoseValue(math, sp, at, 't', 19).numeric, 19, 1e-9);
    // Dos parámetros: z = x² − y², x = s cos t, y = s sen t en (2, π/6): ∂z/∂t = −4√3.
    const sp2 = { f: 'x^2 - y^2', inner: { x: 's*cos(t)', y: 's*sin(t)' }, params: ['s', 't'] };
    near(C.tree(math, sp2, { s: 2, t: Math.PI / 6 }, 't').total, -4 * Math.sqrt(3), 1e-12);
    eq(C.diagnoseValue(math, sp2, { s: 2, t: Math.PI / 6 }, 't', -6.93).reason, 'correct');
    eq(C.diagnoseValue(math, sp2, { s: 2, t: Math.PI / 6 }, 't', -2 * Math.sqrt(3)).reason, 'missing');
  });

  test('diagnoseExpr: expresión correcta, con x y y sin sustituir, camino olvidado, producto, signo', () => {
    const sp = { f: 'x^2*y', inner: { x: 't^2', y: '3t + 1' }, params: ['t'] }, at = { t: 1 };
    const d = (s) => C.diagnoseExpr(math, sp, 't', s, at).reason;
    eq(d('15t^4 + 4t^3'), 'correct');
    eq(d('2x*y*2t + x^2*3'), 'mixed');
    eq(d('2t^2*(3t + 1)*2t'), 'missing');
    eq(d('3t^4'), 'missing');
    eq(d('2t^2*(3t + 1)*2t*3t^4'), 'product');
    eq(d('-(15t^4 + 4t^3)'), 'sign');
    eq(d('t + 1'), 'mismatch');
  });

  test('diagnoseImplicit: −F_x/F_y y sus errores típicos', () => {
    const d = (s) => C.diagnoseImplicit(math, 'x^2*y + y^3 - 10', { x: 3, y: 1 }, s, 'x', 'y').reason;
    eq(d(-0.5), 'correct'); eq(d(0.5), 'sign'); eq(d(-2), 'inverted'); eq(d(2), 'invSign'); eq(d(1.3), 'mismatch');
  });

  // Banco de S06: las numéricas con `ck` se recalculan con diferencias finitas propias.
  const bankFile = path.join(__dirname, '..', '..', 'data', 'calculo-2', 'bank', 'sesion-06.js');
  if (fs.existsSync(bankFile)) {
    test('banco c2 S06: respuestas contra diferencias finitas de la composición o de la curva de nivel', () => {
      const { loadData } = require('../lib/load');
      const ROOT = path.join(__dirname, '..', '..');
      const W = loadData(['labs/registry', 'labs/antiderivative-check', 'exercises', 'quiz/bank-kit'].map((n) => path.join(ROOT, 'shared/js', n + '.js')), {});
      loadData(bankFile, W);
      const Q = W.CB_BANK.c2.S06.questions;
      let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      let checked = 0, numeric = 0, exprs = 0;
      Q.forEach((q) => {
        if (q.type === 'numeric') numeric++;
        if (!q.ck) return;
        for (let i = 0; i < 30; i++) {
          const v = W.CBExercises.instance(q, rnd), o = q.ck(v);
          let want;
          if (o.kind === 'imp') {
            const code = math.parse(LM.core.prep(o.F)).compile(), dep = o.dep || 'y', w = o.wrt || 'x';
            const G = (wv, dv) => code.evaluate(Object.assign({}, o.pt, { [w]: wv, [dep]: dv }));
            if (Math.abs(G(o.pt[w], o.pt[dep])) > 1e-9) throw new Error(`${q.id} ${JSON.stringify(v)}: el punto no está en F = 0`);
            const of = (wv) => bisect(G, wv, o.pt[dep] - 0.25 * Math.max(1, Math.abs(o.pt[dep])), o.pt[dep] + 0.25 * Math.max(1, Math.abs(o.pt[dep])));
            const hh = 1e-5 * Math.max(1, Math.abs(o.pt[w]));
            want = (of(o.pt[w] + hh) - of(o.pt[w] - hh)) / (2 * hh);
          } else {
            const Z = composeRaw(o), w = o.wrt || 't';
            want = fd((u) => Z(Object.assign({}, o.at, { [w]: u })), o.at[w]);
          }
          if (o.scale) want *= o.scale;
          if (q.type === 'expr') {
            const got = math.parse(LM.core.prep(q.answer(v))).compile().evaluate(Object.assign({}, o.at));
            if (rel(got, want) > 1e-6) throw new Error(`${q.id} ${JSON.stringify(v)}: la expresión da ${got} en el punto, diferencias ${want}`);
            exprs++;
          } else {
            const got = q.answer(v);
            if (Math.abs(got - want) > 1e-5 * Math.max(1, Math.abs(want))) throw new Error(`${q.id} ${JSON.stringify(v)}: respuesta ${got}, oráculo ${want}`);
            checked++;
          }
        }
      });
      if (checked < 30 * Math.ceil(numeric * 0.8)) throw new Error(`solo ${checked / 30} de ${numeric} preguntas numéricas tienen ck`);
      if (exprs < 30 * 3) throw new Error('muy pocas expresiones con ck: ' + exprs / 30);
    });
  }
};
