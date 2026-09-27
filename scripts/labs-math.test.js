#!/usr/bin/env node
// Pruebas de window.LabMath (matemática pura de los labs, §8, §11).
// Carga los archivos de labs en un sandbox sin DOM y usa math.js 15.2.0 (misma versión que el sitio).
'use strict';
const path = require('path');
const { loadData } = require('./lib/load');
const { loadMathjs } = require('./lib/vendor');

const ROOT = path.join(__dirname, '..');
const LABS = ['registry', 'antiderivative-check', 'projectile-check', 'secant-tangent', 'derivative-check', 'chain-composition', 'implicit-tangent', 'f-fprime-fsecond', 'optimize-slider', 'riemann']
  .map((n) => path.join(ROOT, 'shared/js/labs', n + '.js'));

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('✓ ' + name); }
  catch (e) { fail++; console.log('✗ ' + name + '\n    ' + e.message); }
}
function eq(got, want, msg) { if (got !== want) throw new Error(`${msg || ''} esperaba ${JSON.stringify(want)}, obtuve ${JSON.stringify(got)}`); }
function near(got, want, tol, msg) {
  if (!(Math.abs(got - want) <= tol)) throw new Error(`${msg || ''} esperaba ${want} ± ${tol}, obtuve ${got}`);
}

(async () => {
  const math = await loadMathjs();
  const win = loadData(LABS, {});
  const LM = win.LabMath;
  if (!LM) { console.log('✗ window.LabMath no existe'); process.exit(1); }

  /* ---------- antiderivative (§8.2) ---------- */
  const A = LM.antiderivative;
  test('prep: ln, arctan, arcsin, arccos, + C y signo menos tipográfico', () => {
    eq(A.prep('ln(x) + arctan(x) - arcsin(x) + arccos(x) + C').replace(/\s+/g, ''), 'log(x)+atan(x)-asin(x)+acos(x)');
    eq(A.prep('−x').trim(), '-x');
  });

  // Los 7 ejercicios de reference/lab-antiderivada.html con su veredicto esperado.
  const DEMO = [
    { f: '3x^2 - 4x + 1', F: 'x^3 - 2x^2 + x', a: -1, b: 2, reason: 'correct' },
    { f: '2x*cos(x^2)', F: 'sin(x^2)', a: 0, b: 2, reason: 'correct' },
    { f: 'e^(2x)', F: 'e^(2x)', a: -1, b: 1, reason: 'factor', k: 2 },
    { f: 'x*cos(x)', F: 'x*sin(x) + cos(x)', a: 0, b: 4, reason: 'correct' },
    { f: '1/(1+x^2)', F: 'atan(x)', a: -3, b: 3, reason: 'correct' },
    { f: '2x/(x^2+1)', F: '-ln(x^2+1)', a: -2, b: 2, reason: 'sign' },
    { f: '1/(x*(x+1))', F: 'ln(x) - ln(x+1)', a: 0.5, b: 3, reason: 'correct' }
  ];
  DEMO.forEach((c, i) => test(`demo ${i + 1}: ∫ ${c.f} → ${c.reason}`, () => {
    const r = A.verify(math, c.f, c.F, c.a, c.b);
    eq(r.reason, c.reason, 'veredicto');
    eq(r.kind, c.reason === 'correct' ? 'ok' : 'warn', 'tipo');
    if (c.k) near(r.k, c.k, 1e-6, 'factor');
    if (c.reason === 'correct') near(r.D, r.I, 1e-6 * (1 + Math.abs(r.I)), 'TFC: F(b) − F(a) contra Simpson');
  }));

  test('F incorrecta sin relación constante → mismatch', () => {
    eq(A.verify(math, 'x^2', 'x^2', 0, 2).reason, 'mismatch');
  });
  test('menos de 10 puntos válidos → domain', () => {
    eq(A.verify(math, 'ln(x)', 'x*ln(x) - x', -3, -1).reason, 'domain');
  });
  test('+ C y multiplicación implícita se aceptan', () => {
    eq(A.verify(math, '6x', '3x^2 + C', 0, 1).reason, 'correct');
  });
  test('verificación simbólica cuando simplify llega a 0', () => {
    eq(A.verify(math, '3x^2', 'x^3', 0, 1).symbolic, true);
  });
  test('Simpson n = 400 integra sin(x) en [0, π] ≈ 2', () => {
    near(A.simpson(Math.sin, 0, Math.PI, 400), 2, 1e-9);
  });
  test('roots encuentra los cruces por cero (para partir el área)', () => {
    const r = A.roots((x) => x * x - 2 * x, -1, 3);       // raíces 0 y 2
    eq(r.length, 2, 'número de raíces');
    near(r[0], 0, 1e-9); near(r[1], 2, 1e-9);
    eq(A.roots((x) => x * x + 1, -2, 2).length, 0, 'sin raíces');
  });
  test('yRange usa percentiles 2–98 e incluye el 0', () => {
    const vals = []; for (let i = 0; i < 100; i++) vals.push(i + 1);
    vals.push(1e9);                                   // atípico: no debe estirar el eje
    const r = A.yRange(vals);
    if (!(r[0] <= 0 && r[1] < 1000)) throw new Error('rango ' + r);
  });

  /* ---------- projectile ---------- */
  const P = LM.projectile;
  test('flight: v0 = 20 m/s, θ = 45° en suelo plano', () => {
    const r = P.flight({ v0: 20, theta: 45 });
    near(r.R, 400 / 9.81, 1e-9, 'alcance');
    near(r.H, 400 * 0.5 / (2 * 9.81), 1e-9, 'altura máxima');
    near(r.T, 2 * 20 * Math.SQRT1_2 / 9.81, 1e-9, 'tiempo de vuelo');
  });
  test('ángulos complementarios dan el mismo alcance', () => {
    near(P.flight({ v0: 20, theta: 30 }).R, P.flight({ v0: 20, theta: 60 }).R, 1e-9);
  });
  test('tiro horizontal desde h0 = 0.9 m con v0 = 3 m/s', () => {
    const r = P.flight({ v0: 3, theta: 0, h0: 0.9 });
    near(r.T, Math.sqrt(2 * 0.9 / 9.81), 1e-9, 'tiempo');
    near(r.R, 3 * Math.sqrt(2 * 0.9 / 9.81), 1e-9, 'alcance');
    near(r.H, 0.9, 1e-12, 'altura máxima = h0');
  });
  test('y(x) pasa por el alcance y por la altura máxima', () => {
    const p = { v0: 18, theta: 35 };
    const r = P.flight(p);
    near(P.y(p, r.R), 0, 1e-9, 'y(R)');
    near(P.y(p, r.R / 2), r.H, 1e-9, 'y(R/2)');
  });
  test('diagnoseRange detecta sin θ en lugar de sin 2θ', () => {
    const p = { v0: 20, theta: 30 };
    eq(P.diagnoseRange(p, 400 * 0.5 / 9.81), 'usedSinTheta');
    eq(P.diagnoseRange(p, P.flight(p).R), 'ok');
    eq(P.diagnoseRange(p, P.flight(p).R * 1.004), 'ok', 'tolerancia 1 %');
    eq(P.diagnoseRange(p, P.flight(p).R / 2), 'forgotTwo');
    eq(P.diagnoseRange(p, 7), 'bad');
  });
  test('compareY: y(x) correcta vs. la del alumno con sin θ', () => {
    const p = { v0: 20, theta: 50 };
    const good = 'x*tan(50 deg) - 9.81*x^2/(2*20^2*cos(50 deg)^2)';
    const r1 = P.compareY(math, good, p);
    eq(r1.ok, true, 'correcta');
    const r2 = P.compareY(math, 'x*tan(50 deg) - 9.81*x^2/(2*20^2*cos(50 deg))', p);
    eq(r2.ok, false, 'incorrecta');
    if (!(r2.samples.length > 20)) throw new Error('faltan muestras para graficar');
  });

  /* ---------- core ---------- */
  test('prep: 0x no es hexadecimal', () => {
    near(LM.core.build(math, '3x^2 + 0x').fn(2), 12, 1e-12);
    near(LM.core.build(math, '10x + 0x^2 + 5').fn(1), 15, 1e-12);
  });
  test('prep: ln anidado y pegado a un coeficiente', () => {
    near(LM.core.build(math, 'ln(ln(x))').fn(Math.E * Math.E), Math.log(2), 1e-12);
    near(LM.core.build(math, '2ln(x)').fn(Math.E), 2, 1e-12);
  });
  test('core.build evalúa con varias variables', () => {
    const f = LM.core.build(math, 'x^2 + y', ['x', 'y']);
    eq(f.fn(3, 1), 10);
    if (!isNaN(LM.core.build(math, 'ln(x)', ['x']).fn(-1))) throw new Error('ln(-1) debe dar NaN');
  });

  /* ---------- derivative-check (§8.3) ---------- */
  const D = LM.derivative;
  [
    ['x^3', '3x^2', 'correct'], ['x*sin(x)', 'sin(x) + x*cos(x)', 'correct'], ['e^(2x)', '2e^(2x)', 'correct'],
    ['sin(x)', '-cos(x)', 'sign'], ['sin(x)', 'sin(x)', 'mismatch'], ['cos(x)', 'sin(x)', 'sign'], ['e^(2x)', 'e^(2x)', 'factor'],
    ['x^2', '2', 'mismatch'], ['x*sin(x)', 'cos(x)', 'mismatch'], ['(x^2+1)/x', '1 - 1/x^2', 'correct']
  ].forEach(([f, d, want]) => test(`derivative: d/dx ${f} con ${d} → ${want}`, () => {
    const r = D.verify(math, f, d, 0.3, 2.5);
    eq(r.reason, want);
    if (want === 'factor') near(r.k, 0.5, 1e-9, 'factor');
  }));
  test('derivative: dominio', () => { eq(D.verify(math, 'ln(x)', '1/x', -3, -1).reason, 'domain'); });
  test('derivative: la derivada real simplificada', () => {
    const t = D.trueDerivative(math, 'x^3 + 2x');
    near(LM.core.build(math, t, ['x']).fn(2), 14, 1e-12);
  });

  /* ---------- secant-tangent ---------- */
  const SE = LM.secant, sq = (x) => x * x;
  test('secante de x² en a = 1', () => {
    near(SE.slope(sq, 1, 1), 3, 1e-12); near(SE.slope(sq, 1, 0.1), 2.1, 1e-12);
    near(SE.tangentSlope(sq, 1), 2, 1e-6);
    const t = SE.table(sq, 1, [1, 0.5, 0.1]);
    eq(t.length, 3); near(t[1].m, 2.5, 1e-12);
    const L = SE.tangentLine(sq, 1); near(L.m, 2, 1e-6); near(L.y(3), 5, 1e-5);
  });

  /* ---------- chain-composition ---------- */
  const CH = LM.chain;
  test('cadena: composición g(h(x))', () => {
    const src = CH.compose(math, 'sin(u)', 'x^2');
    near(LM.core.build(math, src, ['x']).fn(1.3), Math.sin(1.69), 1e-12);
  });
  test('cadena: capas en x0 = 1', () => {
    const L = CH.layers(math, 'sin(u)', 'x^2', 1);
    near(L.u0, 1, 1e-12); near(L.hPrime, 2, 1e-9); near(L.gPrime, Math.cos(1), 1e-9); near(L.product, 2 * Math.cos(1), 1e-9);
  });
  test('cadena: verificar la derivada del alumno', () => {
    eq(CH.verify(math, 'sin(u)', 'x^2', '2x*cos(x^2)', 0.2, 2).reason, 'correct');
    eq(CH.verify(math, 'sin(u)', 'x^2', 'cos(x^2)', 0.2, 2).reason, 'mismatch');
    eq(CH.verify(math, 'e^u', '3x', 'e^(3x)', 0.2, 2).reason, 'factor');
  });

  /* ---------- implicit-tangent ---------- */
  const IM = LM.implicit;
  test('implícita: pendiente en el círculo', () => {
    const F = IM.build(math, 'x^2 + y^2 = 25');
    near(F(3, 4), 0, 1e-12);
    near(IM.slope(F, 3, 4), -0.75, 1e-6);
  });
  test('implícita: puntos sobre la curva cerca del punto', () => {
    const F = IM.build(math, 'x^2 + y^2 = 25');
    const pts = IM.pointsNear(F, 3, 4, 12);
    if (pts.length < 6) throw new Error('pocos puntos: ' + pts.length);
    pts.forEach((p) => near(F(p.x, p.y), 0, 1e-8));
  });
  test('implícita: verificar dy/dx del alumno', () => {
    eq(IM.verify(math, 'x^2 + y^2 = 25', '-x/y', 3, 4).reason, 'correct');
    eq(IM.verify(math, 'x^2 + y^2 = 25', 'x/y', 3, 4).reason, 'sign');
    eq(IM.verify(math, 'x^2 + y^2 = 25', '-y/x', 3, 4).reason, 'mismatch');
    eq(IM.verify(math, 'x^3 + y^3 = 6x*y', '(2y - x^2)/(y^2 - 2x)', 3, 3).reason, 'correct');
  });

  /* ---------- f-fprime-fsecond ---------- */
  const X = LM.extrema;
  const fnOf = (src) => LM.core.build(math, src).fn;
  test('extremos: x³ − 3x tiene máx en −1, mín en 1 e inflexión en 0', () => {
    const r = X.analyze(fnOf('x^3 - 3x'), -2.5, 2.5);
    eq(r.crit.length, 2, 'críticos');
    near(r.crit[0].x, -1, 1e-5); eq(r.crit[0].kind, 'max');
    near(r.crit[1].x, 1, 1e-5); eq(r.crit[1].kind, 'min');
    eq(r.infl.length, 1, 'inflexiones'); near(r.infl[0].x, 0, 1e-4);
  });
  test('extremos: x³ tiene un crítico sin extremo y una inflexión', () => {
    const r = X.analyze(fnOf('x^3'), -1.6, 1.6);
    eq(r.crit.length, 1, 'críticos'); near(r.crit[0].x, 0, 1e-3); eq(r.crit[0].kind, 'none');
    eq(r.infl.length, 1, 'inflexiones'); near(r.infl[0].x, 0, 1e-3);
  });
  test('extremos: x⁴ − 4x² tiene 3 críticos y 2 inflexiones', () => {
    const r = X.analyze(fnOf('x^4 - 4x^2'), -2.4, 2.4);
    eq(r.crit.map((c) => c.kind).join(','), 'min,max,min');
    near(r.crit[0].x, -Math.SQRT2, 1e-5); near(r.crit[1].x, 0, 1e-5);
    eq(r.infl.length, 2); near(r.infl[1].x, Math.sqrt(2 / 3), 1e-4);
  });
  test('extremos: x·e^(−x) tiene máx en 1 e inflexión en 2', () => {
    const r = X.analyze(fnOf('x*e^(-x)'), -0.8, 5);
    eq(r.crit.length, 1); near(r.crit[0].x, 1, 1e-5); eq(r.crit[0].kind, 'max');
    eq(r.infl.length, 1); near(r.infl[0].x, 2, 1e-4);
  });
  test('extremos: una asíntota no cuenta como crítico', () => {
    const r = X.analyze(fnOf('1/x'), -2, 2);
    eq(r.crit.length, 0, 'críticos'); eq(r.infl.length, 0, 'inflexiones');
  });

  test('extremos: una recta no tiene críticos ni inflexiones (f″ = 0 no es ruido)', () => {
    for (const src of ['2x + 1', '-3x + 7', '0.001x', '1000x - 5']) {
      const r = X.analyze(fnOf(src), -10, 10);
      eq(r.crit.length, 0, src + ' críticos'); eq(r.infl.length, 0, src + ' inflexiones'); eq(r.flat2, true, src + ' flat2');
    }
  });
  test('extremos: una constante se reporta como f′ = 0 en toda la ventana', () => {
    const r = X.analyze(fnOf('5'), -3, 3);
    eq(r.flat1, true); eq(r.crit.length, 0); eq(r.infl.length, 0);
  });
  test('extremos: una parábola no tiene inflexiones, aunque f″ sea constante', () => {
    const r = X.analyze(fnOf('x^2 - 4x'), -5, 9);
    eq(r.crit.length, 1); eq(r.crit[0].kind, 'min'); eq(r.infl.length, 0); eq(r.flat2, false);
  });
  test('extremos: sin x en [0, 20] da sus 6 inflexiones reales, no ruido', () => {
    const r = X.analyze(fnOf('sin(x)'), 0.1, 20);
    eq(r.infl.length, 6); r.infl.forEach((p, i) => near(p.x, Math.PI * (i + 1), 1e-3));
  });

  /* ---------- optimize-slider ---------- */
  const O = LM.optimize;
  test('optimización: cada problema modelo cae en su óptimo exacto', () => {
    for (const [k, P] of Object.entries(O.problems)) {
      for (const p of [P.param.min, P.param.value, P.param.max]) {
        const d = P.domain(p), r = O.optimum((x) => P.f(x, p), d[0], d[1], P.kind);
        near(r.x, P.exact(p), 1e-5 * (1 + P.exact(p)), `${k}(${p})`);
        near(O.slope((x) => P.f(x, p), r.x), 0, 1e-3 * (1 + Math.abs(r.value)), `${k}(${p}) pendiente`);
      }
    }
  });
  test('optimización: mínimo de x² − 4x en [0, 5] es 2', () => {
    const r = O.optimum((x) => x * x - 4 * x, 0, 5, 'min');
    near(r.x, 2, 1e-7); near(r.value, -4, 1e-9);
  });

  /* ---------- riemann ---------- */
  const Rm = LM.riemann;
  test('riemann: sumas de x² en [0, 2] con n = 4', () => {
    const f = (x) => x * x;
    near(Rm.sum(f, 0, 2, 4, 'left'), 1.75, 1e-12);
    near(Rm.sum(f, 0, 2, 4, 'right'), 3.75, 1e-12);
    near(Rm.sum(f, 0, 2, 4, 'mid'), 2.625, 1e-12);
    near(Rm.sum(f, 0, 2, 4, 'trap'), 2.75, 1e-12);
  });
  test('riemann: las sumas convergen a la integral', () => {
    const f = Math.sin, I = 2;
    near(Rm.simpson(f, 0, Math.PI, 400), I, 1e-9);
    ['left', 'right', 'mid', 'trap'].forEach((t) => {
      const e1 = Math.abs(Rm.sum(f, 0, Math.PI, 10, t) - I), e2 = Math.abs(Rm.sum(f, 0, Math.PI, 100, t) - I);
      if (!(e2 < e1 / 5)) throw new Error(`${t}: el error no baja (${e1} → ${e2})`);
    });
  });
  test('riemann: rectángulos cubren [a, b] con ancho Δx', () => {
    const r = Rm.rects((x) => x, 1, 3, 8, 'left');
    eq(r.length, 8); near(r[0].x0, 1, 1e-12); near(r[7].x1, 3, 1e-12); near(r[3].x1 - r[3].x0, 0.25, 1e-12);
  });

  console.log(`\nlabs-math.test.js: ${pass} ok, ${fail} fallan.`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
