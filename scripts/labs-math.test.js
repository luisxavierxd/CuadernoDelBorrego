#!/usr/bin/env node
// Pruebas de window.LabMath (matemática pura de los labs, §8, §11).
// Carga los archivos de labs en un sandbox sin DOM y usa math.js 15.2.0 (misma versión que el sitio).
'use strict';
const path = require('path');
const { loadData } = require('./lib/load');
const { loadMathjs } = require('./lib/vendor');

const ROOT = path.join(__dirname, '..');
const LABS = ['registry', 'antiderivative-check', 'projectile-check', 'secant-tangent', 'derivative-check', 'chain-composition', 'implicit-tangent', 'f-fprime-fsecond', 'optimize-slider', 'riemann', 'area-between', 'solid-revolution',
  'units', 'vector-sum', 'dot-cross', 'motion-graphs', 'kinematics-check', 'circular-vectors',
  'fbd-builder', 'atwood', 'spring-friction', 'incline']
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

  /* ---------- svgOk: los labs no dibujan geometría NaN mientras carga el cálculo ---------- */
  test('LabUI.svgOk rechaza NaN o Infinity en la geometría y acepta lo demás', () => {
    const ok = win.LabUI.svgOk;
    eq(ok({ x1: 3, y1: 4, class: 'axis' }), true);
    eq(ok({ d: 'M1 2L3 4' }), true);
    eq(ok({ x1: NaN }), false, 'número NaN');
    eq(ok({ d: 'M260.5 68LNaN 157' }), false, 'path con NaN');
    eq(ok({ cx: Infinity }), false, 'Infinity');
    eq(ok({ points: '1,2 NaN,3' }), false, 'points con NaN');
    eq(ok({ 'aria-label': 'NaN' }), true, 'lo que no es geometría no se revisa');
  });

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

  /* ---------- area-between ---------- */
  const Ar = LM.area;
  test('área: parábola y recta, x + 2 contra x² en [−1, 2] = 4.5', () => {
    near(Ar.between((x) => x + 2, (x) => x * x, -1, 2), 4.5, 1e-9);
    const xs = Ar.intersections((x) => x + 2, (x) => x * x, -5, 5);
    eq(xs.length, 2); near(xs[0], -1, 1e-9); near(xs[1], 2, 1e-9);
  });
  test('área: x³ y x en [−1, 1] se cruzan adentro; área 0.5 y neta 0', () => {
    near(Ar.between((x) => x ** 3, (x) => x, -1, 1), 0.5, 1e-9);
    near(Ar.net((x) => x ** 3, (x) => x, -1, 1), 0, 1e-9);
  });
  test('área: entre seno y coseno de π/4 a 5π/4 = 2√2', () => {
    near(Ar.between(Math.sin, Math.cos, Math.PI / 4, 5 * Math.PI / 4), 2 * Math.SQRT2, 1e-8);
  });
  test('arco: x^(3/2) en [0, 4] mide (80√10 − 8)/27', () => {
    near(Ar.arcLength((x) => Math.pow(x, 1.5), 0, 4), (80 * Math.sqrt(10) - 8) / 27, 1e-5);
    near(Ar.arcLength((x) => 3 * x + 1, 0, 2), 2 * Math.sqrt(10), 1e-8);
  });
  test('arco: la poligonal crece hacia la longitud exacta', () => {
    const f = (x) => x * x / 2, L = Ar.arcLength(f, 0, 2);
    const p4 = Ar.polyLength(f, 0, 2, 4), p40 = Ar.polyLength(f, 0, 2, 40);
    if (!(p4 < p40 && p40 < L && L - p40 < 1e-3)) throw new Error(`${p4} ${p40} ${L}`);
  });

  /* ---------- solid-revolution ---------- */
  const Sd = LM.solid, zero = () => 0;
  test('sólidos: cono, esfera y paraboloide por discos', () => {
    near(Sd.disks((x) => x / 2, zero, 0, 4), 16 * Math.PI / 3, 1e-9);
    near(Sd.disks((x) => Math.sqrt(Math.max(0, 4 - x * x)), zero, -2, 2), 32 * Math.PI / 3, 1e-4);
    near(Sd.disks(Math.sqrt, zero, 0, 4), 8 * Math.PI, 1e-9);
  });
  test('sólidos: arandelas entre x y x² en [0, 1] = 2π/15', () => {
    near(Sd.disks((x) => x, (x) => x * x, 0, 1), 2 * Math.PI / 15, 1e-10);
  });
  test('sólidos: capas bajo x − x² = π/6 y bajo √x en [0, 4] = 128π/5', () => {
    near(Sd.shells((x) => x - x * x, zero, 0, 1), Math.PI / 6, 1e-10);
    near(Sd.shells(Math.sqrt, zero, 0, 4), 128 * Math.PI / 5, 1e-6);
  });
  test('sólidos: la suma de piezas converge al volumen', () => {
    const f = (x) => x / 2, V = 16 * Math.PI / 3;
    const e1 = Math.abs(Sd.pieces(f, zero, 0, 4, 4, 'disk') - V), e2 = Math.abs(Sd.pieces(f, zero, 0, 4, 40, 'disk') - V);
    if (!(e2 < e1 / 50)) throw new Error(`${e1} → ${e2}`);
    near(Sd.pieces((x) => x - x * x, zero, 0, 1, 400, 'shell'), Math.PI / 6, 1e-5);
  });

  /* ---------- units (Física S01) ---------- */
  const U = LM.units;
  test('unidades: conversiones con prefijos, potencias y cocientes', () => {
    near(U.convert(90, 'km/h', 'm/s'), 25, 1e-12);
    near(U.convert(2.5, 'm^2', 'cm^2'), 25000, 1e-9);
    near(U.convert(1, 'g/cm^3', 'kg/m^3'), 1000, 1e-9);
    near(U.convert(3, 'mL', 'm^3'), 3e-6, 1e-18);
    near(U.convert(1, 'd', 's'), 86400, 1e-9);
    near(U.convert(60, 'mi/h', 'km/h'), 96.56064, 1e-9);
    if (!isNaN(U.convert(1, 'm', 's'))) throw new Error('m → s debe dar NaN');
  });
  test('unidades: dimensiones y comparación', () => {
    eq(JSON.stringify(U.dims('kg*m/s^2')), JSON.stringify({ M: 1, L: 1, T: -2 }));
    eq(U.sameDims('N', 'kg*m/s^2'), true);
    eq(U.sameDims('J', 'N*m'), true);
    eq(U.sameDims('W', 'J/s'), true);
    eq(U.sameDims('m/s', 'm/s^2'), false);
    const pend = U.product([['m', 0.5], ['m/s^2', -0.5]]);        // √(L/g) es un tiempo
    eq(JSON.stringify(pend), JSON.stringify({ M: 0, L: 0, T: 1 }));
  });

  /* ---------- vector-sum ---------- */
  const V = LM.vectors;
  test('vectores: componentes, polar en los cuatro cuadrantes y suma', () => {
    const c = V.comps(10, 30); near(c.x, 10 * Math.sqrt(3) / 2, 1e-12); near(c.y, 5, 1e-12);
    near(V.polar(-4, 3).ang, 180 - Math.atan(3 / 4) * 180 / Math.PI, 1e-9);
    near(V.polar(-4, -3).ang, 180 + Math.atan(3 / 4) * 180 / Math.PI, 1e-9);
    near(V.polar(4, -3).ang, 360 - Math.atan(3 / 4) * 180 / Math.PI, 1e-9);
    near(V.polar(-4, 3).mag, 5, 1e-12);
    const r = V.sum([[3, 0], [4, 90]]); near(r.mag, 5, 1e-12); near(r.ang, Math.atan(4 / 3) * 180 / Math.PI, 1e-9);
    const d = V.sum([[3, 0], [4, 90]], [1, -1]); near(d.y, -4, 1e-12);
  });
  test('vectores: diagnóstico de errores típicos', () => {
    const L = [[3, 60], [5, 160]], r = V.sum(L);
    eq(V.diagnose(L, null, { mag: r.mag, ang: r.ang }), 'ok');
    eq(V.diagnose(L, null, { mag: r.mag, ang: r.ang + 360 }), 'ok', 'ángulo equivalente');
    eq(V.diagnose(L, null, { mag: 8, ang: r.ang }), 'addedMagnitudes');
    eq(V.diagnose(L, null, { mag: r.mag, ang: Math.atan(r.y / r.x) * 180 / Math.PI }), 'rawArctan');
    const sw = V.mistakes(L).swapped;
    eq(V.diagnose(L, null, { mag: sw.mag, ang: sw.ang }), 'swapped');
    eq(V.diagnose(L, null, { mag: 1, ang: 10 }), 'bad');
  });

  /* ---------- dot-cross ---------- */
  const V3 = LM.vec3;
  test('vec3: producto escalar, vectorial, ángulo y proyección', () => {
    const A = [2, -1, 3], B = [1, 4, -2];
    eq(V3.dot(A, B), -8);
    eq(JSON.stringify(V3.cross(A, B)), JSON.stringify([-10, 7, 9]));
    near(V3.dot(V3.cross(A, B), A), 0, 1e-12); near(V3.dot(V3.cross(A, B), B), 0, 1e-12);
    near(V3.angle([1, 0, 0], [0, 1, 0]), 90, 1e-9);
    near(V3.angle(A, B), Math.acos(-8 / (Math.sqrt(14) * Math.sqrt(21))) * 180 / Math.PI, 1e-9);
    near(V3.projScalar([3, 4, 0], [1, 0, 0]), 3, 1e-12);
    near(V3.area([3, 0, 0], [0, 2, 0]), 6, 1e-12);
    eq(JSON.stringify(V3.cross([1, 0, 0], [0, 1, 0])), JSON.stringify([0, 0, 1]), 'i × j = k');
    near(V3.mag(V3.unit([3, 4, 12])), 1, 1e-12);
  });
  test('vec3: diagnóstico y lectura de vectores', () => {
    const A = [2, -1, 3], B = [1, 4, -2];
    eq(V3.diagnoseCross(A, B, [-10, 7, 9]), 'ok');
    eq(V3.diagnoseCross(A, B, [10, -7, -9]), 'reversed');
    eq(V3.diagnoseCross(A, B, [-10, -7, 9]), 'jSign');
    eq(V3.diagnoseCross(A, B, [1, 2, 3]), 'bad');
    eq(V3.diagnoseDot(A, B, -8), 'ok');
    eq(V3.diagnoseDot(A, B, Math.sqrt(14 * 21)), 'magsProduct');
    eq(JSON.stringify(V3.parse('2i - j + 3k')), JSON.stringify([2, -1, 3]));
    eq(JSON.stringify(V3.parse('(1, 4, −2)')), JSON.stringify([1, 4, -2]));
    eq(JSON.stringify(V3.parse('3, 4')), JSON.stringify([3, 4, 0]));
    eq(V3.parse('hola'), null);
  });

  /* ---------- motion-graphs ---------- */
  const Mo = LM.motion;
  test('movimiento: derivadas de x(t) en un instante', () => {
    const r = Mo.at(math, '2t^3 - 9t^2 + 12t + 1', 3);
    near(r.x, 10, 1e-9); near(r.v, 12, 1e-9); near(r.a, 18, 1e-9);
    near(Mo.at(math, '3sin(1.5t)', 0).v, 4.5, 1e-9);
  });
  test('movimiento: vueltas, distancia contra desplazamiento', () => {
    const x = (t) => 8 * t - t * t, v = (t) => 8 - 2 * t;
    const tt = Mo.turns(v, 0, 10); eq(tt.length, 1); near(tt[0], 4, 1e-9);
    near(Mo.distance(x, v, 0, 6), 16 + 4, 1e-9);        // sube a 16 y regresa a 12
    near(x(6) - x(0), 12, 1e-12);
    near(Mo.avgVelocity(x, 1, 3), 4, 1e-12);
    near(Mo.integrate(v, 0, 6, 400), 12, 1e-9);
  });
  test('movimiento: encuentro de dos móviles con MRU', () => {
    const m = Mo.meet(0, 20, 300, -10); near(m.t, 10, 1e-12); near(m.x, 200, 1e-12);
    if (!isNaN(Mo.meet(0, 5, 10, 5).t)) throw new Error('misma velocidad: no se encuentran');
  });
  test('movimiento: la v(t) del alumno', () => {
    eq(Mo.compareV(math, '8t - t^2', '8 - 2t', 0, 9).reason, 'correct');
    eq(Mo.compareV(math, '8t - t^2', '8 - t', 0, 9).reason, 'mismatch');
    eq(Mo.compareV(math, '3sin(1.5t)', '3cos(1.5t)', 0, 8).reason, 'factor');
    eq(Mo.compareV(math, 't^2', '-2t', 0.5, 3).reason, 'sign');
  });

  /* ---------- kinematics-check ---------- */
  const Ki = LM.kinematics;
  test('cinemática: tiro vertical desde una azotea', () => {
    const r = Ki.vertical({ h0: 20, v0: 15 });
    near(r.tTop, 15 / 9.81, 1e-12); near(r.H, 20 + 225 / (2 * 9.81), 1e-12);
    near(Ki.pos({ h0: 20, v0: 15 }, r.T), 0, 1e-9);
    near(r.vImpact, Ki.vel({ h0: 20, v0: 15 }, r.T), 1e-9);
    near(Ki.vertical({ h0: 45, v0: 0 }).T, Math.sqrt(90 / 9.81), 1e-12);
  });
  test('cinemática: frenado y v² = v0² + 2aΔx', () => {
    const s = Ki.stop(25, -5); near(s.t, 5, 1e-12); near(s.d, 62.5, 1e-12);
    near(Ki.speedAfter(0, 9.81, 20), Math.sqrt(2 * 9.81 * 20), 1e-12);
    near(Ki.pos({ v0: 25, a: -5 }, 5), 62.5, 1e-12);
  });
  test('cinemática: diagnóstico de la y(t) del alumno', () => {
    const p = { h0: 20, v0: 15 };
    eq(Ki.diagnose(math, '20 + 15t - 4.905t^2', p).kind, 'ok');
    eq(Ki.diagnose(math, '20 + 15t + 4.905t^2', p).kind, 'plusG');
    eq(Ki.diagnose(math, '20 + 15t - 9.81t^2', p).kind, 'noHalf');
    eq(Ki.diagnose(math, '15t - 4.905t^2', p).kind, 'noH0');
    eq(Ki.diagnose(math, '20 - 15t - 4.905t^2', p).kind, 'signV0');
    eq(Ki.diagnose(math, '3t', p).kind, 'bad');
    eq(Ki.diagnose(math, '15t - 4.905t^2', { h0: 0, v0: 15 }).kind, 'ok', 'con h0 = 0, noH0 es la correcta');
  });

  /* ---------- circular-vectors ---------- */
  const Ci = LM.circular, Re = LM.relative;
  test('circular: ω, v, a_c, periodo y rpm', () => {
    const u = Ci.uniform({ r: 0.4, rpm: 120 });
    near(u.omega, 4 * Math.PI, 1e-12); near(u.v, 1.6 * Math.PI, 1e-12); near(u.ac, u.omega * u.omega * 0.4, 1e-9); near(u.T, 0.5, 1e-12);
    near(Ci.uniform({ r: 2, v: 6 }).ac, 18, 1e-12);
    near(Ci.uniform({ r: 2, T: Math.PI }).omega, 2, 1e-12);
  });
  test('circular: v tangente y a hacia el centro', () => {
    const s = Ci.state({ r: 1.5, omega: 2 }, 0.7);
    near(s.pos[0] * s.vel[0] + s.pos[1] * s.vel[1], 0, 1e-12);        // v ⟂ r
    near(Math.hypot(s.acc[0], s.acc[1]), 6, 1e-12);
    near(s.acc[0] * s.pos[1] - s.acc[1] * s.pos[0], 0, 1e-12);        // a ∥ r
    if (!(s.acc[0] * s.pos[0] + s.acc[1] * s.pos[1] < 0)) throw new Error('a debe apuntar hacia el centro');
    const nu = Ci.nonUniform(4, 2, 6); near(nu.ac, 8, 1e-12); near(nu.a, 10, 1e-12);
  });
  test('circular: diagnóstico de a_c', () => {
    const p = { omega: 2, r: 1.5 };
    eq(Ci.diagnoseAc(p, 6), 'ok'); eq(Ci.diagnoseAc(p, 3), 'gaveV'); eq(Ci.diagnoseAc(p, 2), 'gaveOmega'); eq(Ci.diagnoseAc(p, 9), 'bad');
  });
  test('relativo: marco en movimiento, río y cruce recto', () => {
    const f = Ci.inFrame({ r: 1, omega: 1 }, 2, 0); near(f.vel[0], -2, 1e-12); near(f.vel[1], 1, 1e-12);
    const r = Re.river({ vb: 4, vc: 3, w: 80 }); near(r.t, 20, 1e-12); near(r.drift, 60, 1e-12); near(r.speed, 5, 1e-12);
    const s = Re.riverStraight({ vb: 5, vc: 3, w: 80 }); near(s.speed, 4, 1e-12); near(s.t, 20, 1e-12); near(s.alpha, Math.asin(0.6) * 180 / Math.PI, 1e-9);
    if (!isNaN(Re.riverStraight({ vb: 2, vc: 3, w: 80 }).t)) throw new Error('si la corriente es más rápida no puede cruzar recto');
  });
  /* ---------- fbd-builder ---------- */
  const Fo = LM.forces;
  test('fuerzas: normal y aceleración de cada situación', () => {
    const g = 9.81;
    near(Fo.scene('empuje', { m: 8, F: 30 }).a, 30 / 8, 1e-12);
    const j = Fo.scene('jalon', { m: 10, F: 50, th: 30, mu: 0.3 });
    near(j.N, 10 * g - 25, 1e-9); near(j.a, (50 * Math.cos(Math.PI / 6) - 0.3 * j.N) / 10, 1e-9);
    near(Fo.scene('empujeAbajo', { m: 10, F: 60, th: 30, mu: 0.25 }).N, 10 * g + 30, 1e-9);
    near(Fo.scene('elevador', { m: 60, acc: 2 }).N, 60 * (g + 2), 1e-9);
    near(Fo.scene('rampa', { m: 5, inc: 25 }).N, 5 * g * Math.cos(25 * Math.PI / 180), 1e-9);
  });
  test('fuerzas: en reposo la suma de fuerzas es cero; con movimiento es ma', () => {
    near(Fo.net('rampa', { m: 5, inc: 25 }).mag, 0, 1e-9);
    near(Fo.net('lampara', { m: 4 }).mag, 0, 1e-9);
    const n = Fo.net('jalon', { m: 10, F: 50, th: 30, mu: 0.3 });
    near(n.y, 0, 1e-9); near(n.x, 10 * Fo.scene('jalon', { m: 10, F: 50, th: 30, mu: 0.3 }).a, 1e-9);
    near(Fo.net('elevador', { m: 60, acc: 2 }).y, 120, 1e-9);
  });
  test('fuerzas: diagnóstico del DCL', () => {
    const r = Fo.checkFBD('jalon', {}, { peso: 'down', normal: 'up', tension: 'angUp', movimiento: 'right' });
    eq(JSON.stringify(r.missing), JSON.stringify(['friccion'])); eq(JSON.stringify(r.extra), JSON.stringify(['movimiento'])); eq(r.ok, false);
    eq(Fo.checkFBD('jalon', {}, { peso: 'down', normal: 'up', tension: 'angUp', friccion: 'left' }).ok, true);
    eq(Fo.checkFBD('empuje', {}, { peso: 'down', normal: 'perp', aplicada: 'right' }).ok, true, 'en piso plano, perpendicular = arriba');
    eq(JSON.stringify(Fo.checkFBD('rampa', {}, { peso: 'down', normal: 'up', friccion: 'alongUp' }).wrongDir), JSON.stringify(['normal']));
    eq(Fo.diagnoseN('jalon', {}, 10 * 9.81), 'usedMg');
    eq(Fo.diagnoseN('jalon', {}, 10 * 9.81 + 25), 'wrongSign');
    eq(Fo.diagnoseN('jalon', {}, 10 * 9.81 - 25), 'ok');
  });

  /* ---------- atwood ---------- */
  const At = LM.atwood;
  test('atwood: aceleración, tensión y casos límite', () => {
    const r = At.atwood(3, 5); near(r.a, 2 * 9.81 / 8, 1e-12); near(r.T, 30 * 9.81 / 8, 1e-12);
    near(At.atwood(4, 4).a, 0, 1e-12); near(At.atwood(4, 4).T, 4 * 9.81, 1e-12);
    near(5 * 9.81 - r.T, 5 * r.a, 1e-9, 'ΣF en m₂'); near(r.T - 3 * 9.81, 3 * r.a, 1e-9, 'ΣF en m₁');
  });
  test('atwood: mesa con polea, con y sin fricción', () => {
    const t = At.table(4, 2, 0); near(t.a, 2 * 9.81 / 6, 1e-12); near(t.T, 4 * t.a, 1e-12);
    const f = At.table(4, 2, 0.25); near(f.a, (2 - 1) * 9.81 / 6, 1e-12); near(f.T, 4 * (f.a + 0.25 * 9.81), 1e-12);
    eq(At.table(4, 1, 0.5).moves, false); near(At.table(4, 1, 0.5).T, 9.81, 1e-12);
    const tr = At.train([2, 3, 5], 40); near(tr.a, 4, 1e-12); near(tr.T, 32, 1e-12);
  });
  test('atwood: diagnóstico', () => {
    const p = { m1: 3, m2: 5, mu: 0 }, s = At.atwood(3, 5);
    eq(At.diagnose('atwood', p, s.a, s.T).a, 'ok'); eq(At.diagnose('atwood', p, s.a, s.T).T, 'ok');
    eq(At.diagnose('atwood', p, s.a, 5 * 9.81).T, 'weight');
    eq(At.diagnose('atwood', p, 2 * 9.81 / 5, s.T).a, 'oneMass');
    eq(At.diagnose('table', { m1: 4, m2: 2, mu: 0.25 }, 2 * 9.81 / 6, 0).a, 'noFriction');
  });

  /* ---------- spring-friction ---------- */
  const Fr = LM.friction;
  test('fricción: normal al empujar y al jalar con ángulo', () => {
    near(Fr.normal(10, 60, 30, 'push'), 98.1 + 30, 1e-9); near(Fr.normal(10, 60, 30, 'pull'), 98.1 - 30, 1e-9); near(Fr.normal(10, 60, 30, 'horizontal'), 98.1, 1e-9);
  });
  test('fricción: ¿se mueve? estática contra cinética y resorte', () => {
    const still = Fr.analyze({ m: 10, F: 30, th: 0, mode: 'horizontal', mus: 0.5, muk: 0.3 });
    eq(still.moves, false); near(still.f, 30, 1e-12); eq(still.a, 0);
    const go = Fr.analyze({ m: 10, F: 60, th: 0, mode: 'horizontal', mus: 0.5, muk: 0.3 });
    eq(go.moves, true); near(go.a, (60 - 0.3 * 98.1) / 10, 1e-9);
    const sp = Fr.analyze({ m: 2, F: 0, th: 0, mode: 'horizontal', mus: 0.4, muk: 0.3, k: 300, x: 0.1 });
    eq(sp.moves, true); near(sp.a, (30 - 0.3 * 2 * 9.81) / 2, 1e-9);
  });
  test('fricción: fuerza para arrancar y ángulo óptimo', () => {
    near(Fr.forceToStart(10, 0.5, 0, 'pull'), 0.5 * 98.1, 1e-9);
    const th = Fr.optimalAngle(0.5), fm = Fr.minForce(10, 0.5);
    near(Fr.forceToStart(10, 0.5, th, 'pull'), fm, 1e-9);
    if (!(Fr.forceToStart(10, 0.5, th + 5, 'pull') > fm && Fr.forceToStart(10, 0.5, th - 5, 'pull') > fm)) throw new Error('el óptimo no es mínimo');
    if (!(Fr.forceToStart(10, 0.5, 30, 'push') > Fr.forceToStart(10, 0.5, 30, 'pull'))) throw new Error('empujar hacia abajo cuesta más');
    near(Fr.hooke(200, 0.15), 30, 1e-12);
  });
  test('fricción: diagnóstico de N = mg y de μₛ', () => {
    const p = { m: 10, F: 80, th: 30, mode: 'push', mus: 0.4, muk: 0.3 }, r = Fr.analyze(p);
    eq(Fr.diagnose(p, r.N, r.a).N, 'ok'); eq(Fr.diagnose(p, r.N, r.a).a, 'ok');
    eq(Fr.diagnose(p, 98.1, NaN).N, 'usedMg');
    eq(Fr.diagnose(p, 98.1 - 40, NaN).N, 'wrongSign');
    eq(Fr.diagnose(p, NaN, (r.drive - 0.3 * 98.1) / 10).a, 'usedMg');
    eq(Fr.diagnose(p, NaN, (r.drive - 0.4 * r.N) / 10).a, 'usedMuS');
  });

  test('resortes: serie, paralelo y masa colgada', () => {
    near(Fr.series(200, 300), 120, 1e-12); near(Fr.parallel(200, 300), 500, 1e-12);
    near(Fr.hang(2, 200, 300, 'single').x, 2 * 9.81 / 200, 1e-12);
    const se = Fr.hang(2, 200, 300, 'series');
    near(se.x, 2 * 9.81 / 200 + 2 * 9.81 / 300, 1e-12, 'en serie se suman las elongaciones');
    near(Fr.hang(2, 200, 300, 'parallel').x * 500, 2 * 9.81, 1e-12);
    eq(Fr.diagnoseHang(2, 200, 300, 'series', se.x), 'ok');
    eq(Fr.diagnoseHang(2, 200, 300, 'series', Fr.hang(2, 200, 300, 'parallel').x), 'swapped');
    eq(Fr.diagnoseHang(2, 200, 300, 'parallel', 2 * 9.81 / 200), 'single');
    eq(Fr.diagnoseHang(2, 200, 300, 'single', 2 / 200), 'noG');
  });
  /* ---------- incline ---------- */
  const In = LM.incline;
  test('plano: baja con fricción, se queda quieto y sube frenando', () => {
    const g = 9.81, s30 = 0.5, c30 = Math.cos(Math.PI / 6);
    near(In.slope({ m: 5, th: 30, mus: 0.4, muk: 0.3, motion: 'rest' }).a, -g * (s30 - 0.3 * c30), 1e-9);
    eq(In.slope({ m: 5, th: 20, mus: 0.4, muk: 0.3, motion: 'rest' }).dir, 'rest');
    near(In.slope({ m: 5, th: 30, mus: 0.4, muk: 0.3, motion: 'up' }).a, -g * (s30 + 0.3 * c30), 1e-9);
    near(In.critical(0.5), Math.atan(0.5) * 180 / Math.PI, 1e-12);
    eq(In.slope({ m: 5, th: In.critical(0.4) - 0.5, mus: 0.4, muk: 0.3, motion: 'rest' }).dir, 'rest');
  });
  test('plano: fuerza paralela contra fuerza horizontal', () => {
    const g = 9.81, t = 30 * Math.PI / 180;
    const par = In.slope({ m: 5, th: 30, mus: 0.2, muk: 0.2, motion: 'rest', F: 60, Fmode: 'parallel' });
    near(par.N, 5 * g * Math.cos(t), 1e-9); near(par.a, (60 - 5 * g * Math.sin(t) - 0.2 * par.N) / 5, 1e-9);
    const hor = In.slope({ m: 5, th: 30, mus: 0.2, muk: 0.2, motion: 'rest', F: 60, Fmode: 'horizontal' });
    near(hor.N, 5 * g * Math.cos(t) + 60 * Math.sin(t), 1e-9); near(hor.a, (60 * Math.cos(t) - 5 * g * Math.sin(t) - 0.2 * hor.N) / 5, 1e-9);
  });
  test('plano: dos bloques con polea y curvas', () => {
    const r = In.twoBlocks(4, 3, 30, 0); near(r.a, (3 - 2) * 9.81 / 7, 1e-12); near(r.T, 3 * (9.81 - r.a), 1e-12);
    eq(In.twoBlocks(4, 2, 30, 0.1).a, 0, 'fricción suficiente');
    near(In.flatCurve(50, 0.8), Math.sqrt(0.8 * 9.81 * 50), 1e-12);
    const b = In.banked(60, 15, 0); near(b.ideal, Math.sqrt(60 * 9.81 * Math.tan(15 * Math.PI / 180)), 1e-12); near(b.max, b.ideal, 1e-9);
    const bf = In.banked(60, 15, 0.3); if (!(bf.max > bf.ideal && bf.min < bf.ideal)) throw new Error('fricción amplía el rango');
  });
  test('plano: diagnóstico de errores', () => {
    const p = { m: 5, th: 30, mus: 0.4, muk: 0.3, motion: 'rest' }, a = Math.abs(In.slope(p).a);
    eq(In.diagnoseA(p, a), 'ok'); eq(In.diagnoseA(p, 9.81 * 0.5), 'noFriction');
    eq(In.diagnoseA(p, Math.abs(In.slope(Object.assign({}, p, { th: 60 })).a)), 'swapped');
    eq(In.diagnoseA(p, 9.81 * (0.5 + 0.3 * Math.cos(Math.PI / 6))), 'frictionWrongSide');
    eq(In.diagnoseV(60, 15, 0.3, In.banked(60, 15, 0.3).max), 'ok'); eq(In.diagnoseV(60, 15, 0.3, In.banked(60, 15, 0.3).ideal), 'ideal');
  });
  console.log(`\nlabs-math.test.js: ${pass} ok, ${fail} fallan.`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
