// Pruebas de LabMath.directional (lab directional-derivative, Cálculo 2 · S07). Oráculos
// independientes: ∇f·u (con math.derivative) contra el cociente centrado (f(P + hu) − f(P − hu))/2h
// escrito aquí mismo, en decenas de funciones, puntos y direcciones (2 y 3 variables); el máximo
// de D_u f(θ) buscado por barrido denso contra |∇f| en la dirección de ∇f; D_u f = 0 en las dos
// direcciones tangentes a la curva de nivel (f casi no cambia al caminar por ellas); los errores
// típicos del diagnóstico; y, del banco de S07, cada pregunta con `fd` se recalcula con su propio
// cociente centrado y cada una con `alt` por otro camino.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM, math }) => {
  const D = LM.directional;
  const rel = (a, b) => Math.abs(a - b) / (1 + Math.abs(b));
  const compile = (src, vars) => {
    const code = math.parse(LM.core.prep(src)).compile();
    return (...a) => { const sc = {}; vars.forEach((k, i) => { sc[k] = a[i]; }); return code.evaluate(sc); };
  };
  // Cociente centrado propio (sin Richardson): la definición con h chico.
  const cd = (f, P, u, h = 1e-5) => (f(...P.map((c, i) => c + h * u[i])) - f(...P.map((c, i) => c - h * u[i]))) / (2 * h);

  const FUNS = [
    'x^2 + y^2', '9 - x^2 - 2y^2', 'x^2 - y^2', 'x*y', '2x - y + 1', 'x^2*y', 'x^3*y^2 + 4x*y - 5y',
    'sin(x)*cos(y)', '4e^(-(x^2 + y^2)/2)', 'x*e^y', 'ln(x^2 + y^2 + 1)', 'sqrt(x^2 + 2y^2 + 1)',
    'x/(1 + y^2)', '80 - x^2 - 3y^2', 'cos(x*y)', '(x + 2y)^3', 'atan(y/(x + 3))', 'x*y/(x^2 + y^2 + 1)'
  ];
  const PTS = [[0.3, 0.7], [1, 1], [-0.8, 0.5], [1.2, -0.6], [-1.1, -1.3]];
  const DIRS = [[3, 4], [1, 0], [0, 1], [-2, 1], [1, -1], [-5, -12], [0.3, 0.1], [-1, 3]];

  test('directional: ∇f·u contra (f(P + hu) − f(P − hu))/2h (18 funciones × 5 puntos × 8 direcciones)', () => {
    let n = 0;
    FUNS.forEach((src) => {
      const f = compile(src, ['x', 'y']);
      PTS.forEach(([a, b]) => DIRS.forEach((dir) => {
        const L = Math.hypot(dir[0], dir[1]), u = [dir[0] / L, dir[1] / L];
        const got = D.duf(math, src, { x: a, y: b }, dir), want = cd(f, [a, b], u);
        if (rel(got, want) > 1e-6) throw new Error(`${src} en (${a}, ${b}) hacia ${dir}: ∇f·u ${got}, cociente ${want}`);
        // El límite de Richardson del lab (sin derivar) también coincide.
        if (rel(D.limitAt(math, src, { x: a, y: b }, dir), want) > 1e-6) throw new Error(`${src}: limitAt no coincide`);
        n++;
      }));
    });
    eq(n, FUNS.length * PTS.length * DIRS.length);
  });

  test('directional: tres variables, ∇f·u contra el cociente centrado', () => {
    const F3 = ['x*y*z + z^2', 'x^2*y + y*z^2', 'e^(x*y)*z', 'x^2 + y^2 + z^2', 'sin(x + 2y) + z^3', 'x*y - 3y*z + 2x*z'];
    const P3 = [[1, 2, 1], [0.5, -1, 0.3], [-0.7, 0.4, 1.2]];
    const V3 = [[2, -1, 2], [1, 2, 2], [2, 3, 6], [0, 0, 1], [-1, 4, -8]];
    F3.forEach((src) => {
      const f = compile(src, ['x', 'y', 'z']);
      P3.forEach((P) => V3.forEach((v) => {
        const L = Math.hypot(...v), u = v.map((c) => c / L);
        const got = D.duf(math, src, { x: P[0], y: P[1], z: P[2] }, v), want = cd(f, P, u);
        if (rel(got, want) > 1e-6) throw new Error(`${src} en ${P} hacia ${v}: ∇f·u ${got}, cociente ${want}`);
      }));
    });
  });

  test('directional: las parciales son D_u f con u = î y u = ĵ; D_u f no cambia al escalar la dirección', () => {
    FUNS.forEach((src) => PTS.forEach(([a, b]) => {
      const pt = { x: a, y: b };
      const fx = math.derivative(LM.core.prep(src), 'x').evaluate(pt), fy = math.derivative(LM.core.prep(src), 'y').evaluate(pt);
      near(D.duf(math, src, pt, [1, 0]), fx, 1e-12 * (1 + Math.abs(fx)), 'u = î');
      near(D.duf(math, src, pt, [0, 1]), fy, 1e-12 * (1 + Math.abs(fy)), 'u = ĵ');
      const k = D.duf(math, src, pt, [3, 4]), k5 = D.duf(math, src, pt, [15, 20]);
      near(k, k5, 1e-12 * (1 + Math.abs(k)), 'misma dirección, otro largo');
      near(D.dufAngle(math, src, pt, Math.atan2(4, 3)), k, 1e-12 * (1 + Math.abs(k)), 'por ángulo');
    }));
    near(D.norm(D.unit([5, -12])), 1, 1e-15); eq(D.unit([0, 0]), null);
    near(D.norm(D.unit([2, 3, 6])), 1, 1e-15);
  });

  test('directional: máximo de D_u f(θ) = |∇f| en la dirección de ∇f (barrido denso de θ)', () => {
    FUNS.forEach((src) => PTS.forEach(([a, b]) => {
      const f = compile(src, ['x', 'y']), g = D.gradAt(math, src, { x: a, y: b }), ex = D.extremes(g);
      let best = -Infinity, arg = 0, worst = Infinity;
      for (let i = 0; i < 7200; i++) {
        const t = 2 * Math.PI * i / 7200, val = cd(f, [a, b], [Math.cos(t), Math.sin(t)]);
        if (val > best) { best = val; arg = t; }
        if (val < worst) worst = val;
      }
      if (rel(best, ex.max) > 1e-5) throw new Error(`${src} en (${a}, ${b}): máximo barrido ${best}, |∇f| ${ex.max}`);
      if (rel(worst, ex.min) > 1e-5) throw new Error(`${src}: mínimo barrido ${worst}, −|∇f| ${ex.min}`);
      if (ex.max > 0.05) {
        const dth = Math.abs(Math.atan2(Math.sin(arg - ex.thMax), Math.cos(arg - ex.thMax)));
        if (dth > 2e-3) throw new Error(`${src}: máximo en θ = ${arg}, la dirección de ∇f es ${ex.thMax}`);
        near(Math.abs(Math.atan2(Math.sin(ex.thMin - ex.thMax), Math.cos(ex.thMin - ex.thMax))), Math.PI, 1e-12, 'mínimo opuesto');
      }
      // La curva θ ↦ D_u f es la sinusoide |∇f| cos(θ − θ_máx).
      [0.3, 1.7, 4].forEach((t) => near(D.curve(g)(t), ex.max * Math.cos(t - ex.thMax), 1e-9 * (1 + ex.max), 'sinusoide'));
    }));
  });

  test('directional: D_u f = 0 en las dos direcciones tangentes a la curva de nivel', () => {
    FUNS.forEach((src) => PTS.forEach(([a, b]) => {
      const f = compile(src, ['x', 'y']), g = D.gradAt(math, src, { x: a, y: b }), ex = D.extremes(g);
      if (ex.max < 0.05) return;
      near(Math.abs(ex.zeros[1] - ex.zeros[0]), Math.PI, 1e-12, 'ceros opuestos');
      ex.zeros.forEach((z) => {
        const u = [Math.cos(z), Math.sin(z)];
        if (Math.abs(cd(f, [a, b], u)) > 1e-6 * (1 + ex.max)) throw new Error(`${src}: D_u f ≠ 0 en θ = ${z}`);
        // Caminar por la tangente de la curva de nivel casi no cambia f: |Δf| = O(t²).
        const e1 = Math.abs(f(a + 1e-2 * u[0], b + 1e-2 * u[1]) - f(a, b)), e2 = Math.abs(f(a + 5e-3 * u[0], b + 5e-3 * u[1]) - f(a, b));
        if (!(e2 <= e1 * 0.3 + 1e-12)) throw new Error(`${src}: f cambia a primer orden por la tangente (${e1}, ${e2})`);
      });
    }));
  });

  test('directional: corte vertical z(t) = f(P + tu) con pendiente D_u f en t = 0', () => {
    const f = compile('9 - x^2 - 2y^2', ['x', 'y']), u = [0.6, 0.8], s = D.slice(f, [1, 1], u);
    near(s(0), 6, 1e-12);
    near((s(1e-5) - s(-1e-5)) / 2e-5, D.duf(math, '9 - x^2 - 2y^2', { x: 1, y: 1 }, [3, 4]), 1e-8, 'pendiente del corte');
    near(D.duf(math, '9 - x^2 - 2y^2', { x: 1, y: 1 }, [3, 4]), -4.4, 1e-12, 'reto inicial');
    const ng = D.numGrad(f, [1, 1]);
    near(ng[0], -2, 1e-8); near(ng[1], -4, 1e-8);
  });

  test('directional: diagnose detecta sin normalizar, grados, intercambio, término, máximo y signo', () => {
    const g = [-2, -4];                                 // 9 − x² − 2y² en (1, 1)
    const d = (s, dir, o) => D.diagnose(g, dir, s, o).reason;
    eq(d(-4.4, [3, 4]), 'correct');
    eq(d(-4.404, [3, 4]), 'correct', 'redondeo');
    eq(d(-22, [3, 4]), 'noNorm');
    eq(d(-4 * 0.6 - 2 * 0.8, [3, 4]), 'swap');
    eq(d(-1.2, [3, 4]), 'term', 'solo f_x·a');
    eq(d(-3.2, [3, 4]), 'term', 'solo f_y·b');
    eq(d(Math.hypot(2, 4), [3, 4]), 'maxRate');
    eq(d(4.4, [3, 4]), 'sign');
    eq(d(7, [3, 4]), 'mismatch');
    const th = Math.PI / 3, u = [Math.cos(th), Math.sin(th)], want = -2 * u[0] - 4 * u[1];
    eq(d(want, u, { angle: th }), 'correct');
    const deg = -2 * Math.cos(th * Math.PI / 180) - 4 * Math.sin(th * Math.PI / 180);
    eq(d(deg, u, { angle: th }), 'degMode', 'calculadora en grados');
    eq(D.diagnose([4, 2, 4], [2, -1, 2], 14 / 3).reason, 'correct', 'tres variables');
    eq(D.diagnose([4, 2, 4], [2, -1, 2], 14).reason, 'noNorm', 'tres variables sin normalizar');
    eq(D.diagnose([4, 2, 4], [2, -1, 2], 6 / 3).reason, 'term', 'tres variables sin el término en z');
  });

  // Banco de S07: las numéricas con `fd` se recalculan con un cociente centrado propio.
  const bankFile = path.join(__dirname, '..', '..', 'data', 'calculo-2', 'bank', 'sesion-07.js');
  if (fs.existsSync(bankFile)) {
    test('banco c2 S07: respuestas numéricas contra el cociente centrado (oráculo independiente)', () => {
      const { loadData } = require('../lib/load');
      const ROOT = path.join(__dirname, '..', '..');
      const W = loadData(['labs/registry', 'labs/antiderivative-check', 'exercises', 'quiz/bank-kit'].map((n) => path.join(ROOT, 'shared/js', n + '.js')), {});
      loadData(bankFile, W);
      const Q = W.CB_BANK.c2.S07.questions;
      let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      let checked = 0;
      Q.filter((q) => q.fd).forEach((q) => {
        for (let i = 0; i < 40; i++) {
          const v = W.CBExercises.instance(q, rnd), o = q.fd(v), keys = Object.keys(o.pt);
          const f = compile(o.f, keys), P = keys.map((k) => o.pt[k]);
          const L = Math.hypot(...o.dir), u = o.dir.map((c) => c / L);
          let want = cd(f, P, u, 1e-4 * Math.max(1, ...P.map(Math.abs)));
          if (o.scale) want *= o.scale;
          const got = q.answer(v);
          if (Math.abs(got - want) > 1e-6 * Math.max(1, Math.abs(want))) throw new Error(`${q.id} ${JSON.stringify(v)}: respuesta ${got}, cociente ${want}`);
          checked++;
        }
      });
      if (checked < 30 * 40) throw new Error('muy pocas preguntas con fd: ' + checked / 40);
      Q.filter((q) => q.alt).forEach((q) => {
        for (let i = 0; i < 40; i++) {
          const v = W.CBExercises.instance(q, rnd), got = q.answer(v), want = q.alt(v);
          if (Math.abs(got - want) > 1e-6 * Math.max(1, Math.abs(want))) throw new Error(`${q.id} ${JSON.stringify(v)}: respuesta ${got}, otro camino ${want}`);
        }
      });
    });
  }
};
