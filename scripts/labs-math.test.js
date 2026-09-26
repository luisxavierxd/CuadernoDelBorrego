#!/usr/bin/env node
// Pruebas de window.LabMath (matemática pura de los labs, §8, §11).
// Carga los archivos de labs en un sandbox sin DOM y usa math.js 15.2.0 (misma versión que el sitio).
'use strict';
const path = require('path');
const { loadData } = require('./lib/load');
const { loadMathjs } = require('./lib/vendor');

const ROOT = path.join(__dirname, '..');
const LABS = ['registry', 'antiderivative-check', 'projectile-check']
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

  console.log(`\nlabs-math.test.js: ${pass} ok, ${fail} fallan.`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
