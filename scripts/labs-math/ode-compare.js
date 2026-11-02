// Pruebas de LabMath.ode (lab ode-compare, Cálculo 3 · las 15 sesiones). Oráculos independientes:
// soluciones cerradas conocidas contra RK4, residuo nulo de soluciones escritas de formas
// equivalentes, y en cada sesión de Cálculo 3 la solución oficial de cada problema del lab
// debe pasar (residuo ≈ 0 y condiciones iniciales) y sus soluciones erróneas típicas
// (al menos 3: constante mal, signo, y_p sin xˢ…) deben rechazarse con el motivo que dicen.
'use strict';
const path = require('path');
const fs = require('fs');
const { loadData } = require('../lib/load');

module.exports = ({ test, eq, near, LM, math }) => {
  const O = LM.ode;
  const decay = { iv: 'x', order: 1, rhs: '-k*y', params: { k: 0.7 }, x0: 0, ics: [3], domain: [0, 4] };

  test('ode: RK4 reproduce y = 3e^(−0.7x) y un oscilador y″ = −4y', () => {
    near(O.solveAt(math, decay, 2), 3 * Math.exp(-1.4), 1e-8);
    const osc = { iv: 't', order: 2, rhs: '-4*y', x0: 0, ics: [1, 0], domain: [0, 6] };
    near(O.solveAt(math, osc, 3), Math.cos(6), 1e-7);
    near(O.solveAt(math, osc, -1.5), Math.cos(3), 1e-7);
    const num = O.numeric(math, osc);
    near(num[0][0], 0, 1e-12); near(num[num.length - 1][0], 6, 1e-9);
  });

  test('ode: la solución numérica cubre el dominio aunque x0 esté en medio', () => {
    const P = { order: 1, rhs: 'x', x0: 1, ics: [0], domain: [-2, 3] };
    const num = O.numeric(math, P);
    near(num[0][0], -2, 1e-9); near(num[num.length - 1][0], 3, 1e-9);
    num.forEach(([x, y]) => near(y, (x * x - 1) / 2, 1e-9));
  });

  test('ode: formas equivalentes de la misma solución pasan; constante mal → ic; otra función → residual', () => {
    eq(O.verify(math, decay, '3e^(-0.7x)').reason, 'correct');
    eq(O.verify(math, decay, '3/e^(0.7x)').reason, 'correct');
    eq(O.verify(math, decay, '3*exp(-k*x)').reason, 'correct', 'con el parámetro por nombre');
    eq(O.verify(math, decay, '5e^(-0.7x)').reason, 'ic');
    eq(O.verify(math, decay, '3e^(0.7x)').reason, 'residual');
    eq(O.verify(math, decay, '3 - 0.7x').reason, 'residual');
    eq(O.verify(math, decay, 'C*e^(-0.7x)').reason, 'symbols');
    eq(O.verify(math, decay, '').kind, 'invalid');
  });

  test('ode: segundo orden revisa y(0) y y′(0); sqrt fuera de dominio → domain', () => {
    const P = { order: 2, rhs: '-dy - y', x0: 0, ics: [1, 0], domain: [0, 5] };
    const good = 'e^(-x/2)*(cos(sqrt(3)/2*x) + 1/sqrt(3)*sin(sqrt(3)/2*x))';
    eq(O.verify(math, P, good).reason, 'correct');
    eq(O.verify(math, P, 'e^(-x/2)*cos(sqrt(3)/2*x)').reason, 'ic', 'y′(0) mal');
    eq(O.verify(math, P, 'e^(x/2)*cos(sqrt(3)/2*x)').reason, 'residual');
    eq(O.verify(math, { order: 1, rhs: 'y', x0: 0, ics: [1], domain: [-3, -1] }, 'sqrt(x)').reason, 'domain');
  });

  test('ode: condiciones iniciales con parámetros (T(0) = T0) y deslizadores', () => {
    const P = { iv: 't', dv: 'T', order: 1, rhs: '-k*(y - Ta)', params: { k: { value: 0.1, min: 0.01, max: 1 }, Ta: { value: 20 }, T0: { value: 90 } }, x0: 0, ics: ['T0'], domain: [0, 30] };
    eq(O.verify(math, P, '20 + 70e^(-0.1t)').reason, 'correct');
    eq(O.verify(math, P, 'Ta + (T0 - Ta)*e^(-k*t)', { k: 0.3 }).reason, 'correct');
    eq(O.verify(math, P, '20 + 70e^(-0.1t)', { k: 0.3 }).reason, 'residual', 'otro k');
    near(O.solveAt(math, P, 10, { k: 0.3 }), 20 + 70 * Math.exp(-3), 1e-7);
  });

  test('ode: campo de pendientes y trazo a mano', () => {
    const P = { order: 1, rhs: 'x - y', x0: 0, ics: [1], domain: [0, 3] };
    const segs = O.slopeField(math, P, { x: [0, 3], y: [-1, 3], ar: 1 }, 6, 4);
    eq(segs.length, 24);
    segs.forEach(([a, b]) => {
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      near((b[1] - a[1]) / (b[0] - a[0]), mx - my, 1e-9, 'pendiente del segmento');
    });
    const exact = (x) => x - 1 + 2 * Math.exp(-x);
    const good = [0, 0.5, 1, 1.5, 2, 2.5, 3].map((x) => [x, exact(x)]);
    near(O.traceError(math, P, good, { x: [0, 3], y: [-1, 3] }).err, 0, 1e-6);
    const bad = good.map(([x, y]) => [x, y + 0.4 * x]);
    if (!(O.traceError(math, P, bad, { x: [0, 3], y: [-1, 3] }).err > 0.2)) throw new Error('un trazo desviado no se detecta');
  });

  // El LaTeX de MathLive con subíndices (T_a, P_0, c_{in}) y ε llega a math.js con el nombre del parámetro.
  const latexWin = loadData(path.join(__dirname, '..', '..', 'shared', 'js', 'latex-to-math.js'), {});
  const toMath = latexWin.CBLatex.toMath;
  test('ode: fromLatex respeta los parámetros con subíndice y la ε', () => {
    const cool = { params: { k: 0.1, Ta: 22, T0: 90 } };
    eq(O.fromLatex(toMath, 'T_{a}+\\left(T_{0}-T_{a}\\right)e^{-kt}', cool).replace(/\s+/g, ''), 'Ta+(T0-Ta)*(e)^(-k*t)');
    eq(O.fromLatex(toMath, 'T_a+T_0e^{-kt}', cool).replace(/\s+/g, ''), 'Ta+T0*(e)^(-k*t)');
    const tank = { params: { r: 4, cin: 0.5, A0: 20, V: 200 } };
    const src = O.fromLatex(toMath, 'Vc_{in}+\\left(A_{0}-Vc_{in}\\right)e^{-\\frac{rt}{V}}', tank);
    near(math.evaluate(src, { V: 200, cin: 0.5, A0: 20, r: 4, t: 10, e: Math.E }), 100 - 80 * Math.exp(-0.2), 1e-9, src);
    const rc = { params: { R: 2, C: 3, E: 12 }, alias: { epsilon: 'E' } };
    const q = O.fromLatex(toMath, 'C\\varepsilon\\left(1-e^{-\\frac{t}{RC}}\\right)', rc);
    near(math.evaluate(q, { R: 2, C: 3, E: 12, t: 6, e: Math.E }), 36 * (1 - Math.exp(-1)), 1e-9, q);
  });

  test('ode: exactas — F potencial, −F, falta h(y), μ que vuelve exacta y curvas de nivel', () => {
    // (2xy + 3) dx + (x² + 4y) dy = 0 → F = x²y + 3x + 2y²
    const P = { kind: 'exact', M: '2x*y + 3', N: 'x^2 + 4y', x0: 1, ics: [1], domain: [0.5, 3], yRange: [0, 3] };
    eq(O.verifyExact(math, P, 'x^2*y + 3x + 2y^2').reason, 'correct');
    eq(O.verifyExact(math, P, 'x^2*y + 3x + 2y^2 + 7').reason, 'correct', 'una constante no importa');
    eq(O.verifyExact(math, P, '-(x^2*y + 3x + 2y^2)').reason, 'sign');
    eq(O.verifyExact(math, P, 'x^2*y + 3x').reason, 'missingH');
    eq(O.verifyExact(math, P, 'x^2*y + 2y^2').reason, 'residual');
    // La solución numérica sigue F = F(x0, y0): F constante a lo largo de ella.
    const F = (x, y) => x * x * y + 3 * x + 2 * y * y, c = F(1, 1);
    O.numeric(math, P).forEach(([x, y]) => near(F(x, y), c, 1e-6, 'F en la solución'));
    // y dx + 2x dy = 0 no es exacta; con μ = y lo es (M_y − N_x)/(−M)... μ(y) = y.
    const Q = { kind: 'exact', ask: 'mu', M: 'y', N: '2x', x0: 1, ics: [1], domain: [0.5, 3], yRange: [0.5, 3] };
    if (!(O.exactGap(math, Q) > 0.1)) throw new Error('y dx + 2x dy debería no ser exacta');
    eq(O.verifyExact(math, Q, 'y').reason, 'correct');
    eq(O.verifyExact(math, Q, 'x').reason, 'notExact');
    // Curva de nivel x² + y² = 4 en un cuadro: los cortes caen sobre la circunferencia.
    const segs = O.contour((x, y) => x * x + y * y, { x: [-3, 3], y: [-3, 3] }, 4, 40, 40);
    if (segs.length < 40) throw new Error('pocos segmentos en la circunferencia');
    segs.forEach((s) => s.forEach(([x, y]) => near(Math.hypot(x, y), 2, 0.02, 'punto de la curva de nivel')));
  });

  test('ode: Wronskiano — conjunto fundamental, dependientes y no solución; raíces características', () => {
    const P = { kind: 'pair', order: 2, rhs: '-dy + 6y', domain: [-1, 1] };       // y″ + y′ − 6y = 0: e^(2x), e^(−3x)
    eq(O.verifyPair(math, P, 'e^(2x)', 'e^(-3x)').reason, 'correct');
    eq(O.verifyPair(math, P, 'e^(2x)', '5e^(2x)').reason, 'dependent');
    eq(O.verifyPair(math, P, 'e^(-2x)', 'e^(-3x)').reason, 'notSolution1');
    const W = O.wronskian(math, P, 'e^(2x)', 'e^(-3x)');
    W.forEach(([x, w]) => near(w, -5 * Math.exp(-x), 1e-9 * (1 + Math.abs(w)), 'W = −5e^(−x)'));
    const R = O.charRoots(1, -6); near(R[0][0], -3, 1e-12); near(R[1][0], 2, 1e-12);
    const C = O.charRoots(2, 5); near(C[0][0], -1, 1e-12); near(Math.abs(C[0][1]), 2, 1e-12);
  });

  test('ode: solución particular — correcta, con y_h sumada, chocando con y_h y equivocada; raíces de grado n', () => {
    const P = { kind: 'yp', order: 2, rhs: '-dy + 2y + 4x^2', g: '4x^2', domain: [-2, 2] };   // y″ + y′ − 2y = 4x²
    eq(O.verifyYp(math, P, '-2x^2 - 2x - 3').reason, 'correct');
    eq(O.verifyYp(math, P, '-2x^2 - 2x - 3 + 5e^x').reason, 'correct', 'y_p + y_h también es particular');
    eq(O.verifyYp(math, P, 'e^x').reason, 'homog');
    eq(O.verifyYp(math, P, '-2x^2').reason, 'residual');
    const Q = { kind: 'yp', order: 2, rhs: '-dy + 2y + 6e^x', g: '6e^x', domain: [-1, 1] };   // choca: e^x es de y_h
    eq(O.verifyYp(math, Q, '2x*e^x').reason, 'correct');
    eq(O.verifyYp(math, Q, '3e^x').reason, 'homog');
    // (r − 1)(r + 2)(r² + 4) = r⁴ + r³ + 2r² + 4r − 8
    const R = O.polyRoots([1, 1, 2, 4, -8]);
    eq(R.length, 4);
    near(R[0][0], -2, 1e-9); near(R[3][0], 1, 1e-9);
    const cx = R.filter((q) => q[1] !== 0);
    eq(cx.length, 2); cx.forEach((q) => { near(q[0], 0, 1e-9); near(Math.abs(q[1]), 2, 1e-9); });
    const D = O.polyRoots([1, -3, 3, -1]);                                                    // (r − 1)³
    D.forEach((q) => near(Math.hypot(q[0] - 1, q[1]), 0, 1e-4, 'raíz triple'));
  });

  // Problemas de los labs de Cálculo 3: oficial pasa, erróneas rechazadas con su motivo.
  const dir = path.join(__dirname, '..', '..', 'data', 'calculo-3');
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).filter((f) => /^sesion-\d\d\.js$/.test(f)).sort().forEach((f) => {
    const W = loadData(path.join(dir, f), { LabMath: LM, math });
    const lab = W.SESSION_DATA.lab;
    if (!lab || lab.type !== 'ode-compare') return;
    test(`ode: c3 ${f} · solución oficial y erróneas típicas de cada problema del lab`, () => {
      const probs = lab.cfg.problems || [];
      if (!probs.length) throw new Error('el lab no tiene problemas');
      let wrongs = 0;
      probs.forEach((P) => {
        if (P.kind === 'exact' || P.kind === 'pair' || P.kind === 'yp') {
          const check = (src) => (P.kind === 'exact' ? O.verifyExact(math, P, src) : P.kind === 'yp' ? O.verifyYp(math, P, src) : O.verifyPair(math, P, src[0], src[1]));
          eq(check(P.solution).reason, 'correct', `${P.name}: la oficial ${P.solution}`);
          (P.wrong || []).forEach((w) => {
            const g = check(w.src);
            if (g.reason === 'correct') throw new Error(`${P.name}: la errónea ${w.src} pasa como correcta`);
            if (w.key) eq(g.reason, w.key, `${P.name}: ${w.src}`);
            wrongs++;
          });
          if (P.kind === 'exact') {
            // La numérica sigue una curva de nivel de la F oficial (o de μ·M dx + μ·N dy = 0).
            const n = O.numeric(math, P);
            near(n[n.length - 1][0], P.domain[1], 1e-6, `${P.name}: la numérica no llega al final del dominio`);
            if (P.ask !== 'mu') {
              const F = (x, y) => math.evaluate(LM.core.prep(P.solution), { x, y }), c = F(P.x0, P.ics[0]);
              n.forEach(([x, y]) => near(F(x, y), c, 1e-5 * (1 + Math.abs(c)), `${P.name}: F en la solución`));
            }
          }
          if ((P.wrong || []).length < 3) throw new Error(`${P.name}: necesita al menos 3 respuestas erróneas típicas`);
          return;
        }
        const r = O.verify(math, P, P.solution);
        eq(r.reason, 'correct', `${P.name}: la oficial ${P.solution} (máx r rel ${r.maxRel}, ic ${r.icErr})`);
        const n = O.numeric(math, P);
        near(n[n.length - 1][0], P.domain[1], 1e-6, `${P.name}: la numérica no llega al final del dominio`);
        const pv = O.paramValues(P), iv = P.iv || 'x';
        const xe = P.domain[1], sc = Object.assign({}, pv, { [iv]: xe });
        near(n[n.length - 1][1], math.evaluate(LM.core.prep(P.solution), sc), 1e-5 * (1 + Math.abs(n[n.length - 1][1])), `${P.name}: RK4 contra la oficial en x = ${xe}`);
        (P.wrong || []).forEach((w) => {
          const g = O.verify(math, P, w.src);
          if (g.reason === 'correct') throw new Error(`${P.name}: la errónea ${w.src} pasa como correcta`);
          if (w.key) eq(g.reason, w.key, `${P.name}: ${w.src}`);
          wrongs++;
        });
        if ((P.wrong || []).length < 3) throw new Error(`${P.name}: necesita al menos 3 soluciones erróneas típicas`);
      });
      if (wrongs < 3) throw new Error('menos de 3 erróneas en la sesión');
    });
  });
};
