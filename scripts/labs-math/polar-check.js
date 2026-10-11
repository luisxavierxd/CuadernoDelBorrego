// Pruebas de LabMath.polar (lab polar-check, Cálculo 2 · S02). Oráculos independientes:
// ida y vuelta de conversiones, conteo geométrico de pétalos contra la fórmula n / 2n,
// ecuaciones rectangulares evaluadas en los puntos de la curva polar, y el banco de S02
// recalculado con LabMath (campo `chk` de cada pregunta numérica).
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM, math }) => {
  const P = LM.polar;
  const PI = Math.PI, TAU = 2 * Math.PI;
  let seed = 12345;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  test('polar: ida y vuelta rectangular → polar → rectangular en cientos de puntos (4 cuadrantes y ejes)', () => {
    const quads = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (let i = 0; i < 800; i++) {
      const x = (rand() - 0.5) * 20, y = (rand() - 0.5) * 20;
      const p = P.toPolar(x, y);
      if (!(p.theta >= 0 && p.theta < TAU)) throw new Error('θ fuera de [0, 2π): ' + p.theta);
      if (p.r < 0) throw new Error('r negativo');
      const b = P.toRect(p.r, p.theta);
      near(b.x, x, 1e-9); near(b.y, y, 1e-9);
      quads[P.quadrant(x, y)]++;
      // El cuadrante de θ coincide con el de (x, y) (oráculo: rangos de ángulo por cuadrante).
      const q = P.quadrant(x, y), lo = (q - 1) * Math.PI / 2;
      if (q && !(p.theta > lo && p.theta < lo + Math.PI / 2)) throw new Error(`(${x}, ${y}) en Q${q} y θ = ${p.theta}`);
    }
    [1, 2, 3, 4].forEach((q) => { if (quads[q] < 100) throw new Error('pocos puntos en Q' + q); });
    // Ejes y origen.
    near(P.toPolar(0, 3).theta, Math.PI / 2, 1e-12); near(P.toPolar(-2, 0).theta, Math.PI, 1e-12);
    near(P.toPolar(0, -1).theta, 3 * Math.PI / 2, 1e-12); near(P.toPolar(5, 0).theta, 0, 1e-12);
    eq(P.toPolar(0, 0).r, 0);
  });

  test('polar: ida y vuelta polar → rectangular → polar con r negativo y θ fuera de [0, 2π)', () => {
    for (let i = 0; i < 600; i++) {
      const r = (rand() - 0.5) * 12, th = (rand() - 0.5) * 6 * TAU;
      if (Math.abs(r) < 1e-3) continue;
      const c = P.toRect(r, th), p = P.toPolar(c.x, c.y);
      near(p.r, Math.abs(r), 1e-9);
      if (!P.samePoint(p.r, p.theta, r, th, 1e-9)) throw new Error(`(${r}, ${th}) no regresa al mismo punto`);
      P.representations(r, th).forEach((q) => { if (!P.samePoint(q.r, q.theta, r, th, 1e-9)) throw new Error('representación distinta'); });
    }
  });

  test('polar: arctan(y/x) solo acierta en los cuadrantes I y IV', () => {
    near(P.naiveTheta(1, 1), Math.PI / 4, 1e-12);
    near(P.toPolar(-1, 1).theta - P.naiveTheta(-1, 1), Math.PI, 1e-12);       // Q II: le falta π
    near(P.toPolar(-3, -4).theta - P.naiveTheta(-3, -4), Math.PI, 1e-12);     // Q III: le falta π
    near(P.toPolar(3, -4).theta - P.naiveTheta(3, -4), TAU, 1e-12);           // Q IV: negativo, le falta 2π
  });

  test('polar: pétalos geométricos de rosas conocidas = n si n impar, 2n si par', () => {
    for (let n = 2; n <= 9; n++) {
      ['cos', 'sin'].forEach((f) => {
        const got = P.petalsOf(math, `2*${f}(${n}*theta)`);
        eq(got, n % 2 ? n : 2 * n, `r = 2${f}(${n}θ)`);
        eq(P.roseCount(n), got);
      });
    }
    eq(P.petalsOf(math, '3'), 0, 'circunferencia centrada');
    eq(P.petalsOf(math, '1 + cos(theta)'), 1, 'cardioide');
  });

  test('polar: curvas equivalentes (r = 2cos θ y x² + y² = 2x; r negativo; θ desplazado)', () => {
    eq(P.onImplicit(math, '2*cos(theta)', 'x^2 + y^2 - 2*x'), true);
    eq(P.onImplicit(math, '6*sin(theta)', 'x^2 + (y-3)^2 - 9'), true);
    eq(P.onImplicit(math, '2*cos(theta)', 'x^2 + y^2 - 2*y'), false);
    // La circunferencia x² + y² = 2x muestreada como (1 + cos t, sin t) contra la curva polar.
    const circ = []; for (let i = 0; i <= 600; i++) { const t = TAU * i / 600; circ.push([1 + Math.cos(t), Math.sin(t)]); }
    const pol = P.curveOf(math, '2*cos(theta)');
    if (P.hausdorff(circ, pol) > 0.01) throw new Error('x² + y² = 2x y r = 2cos θ no coinciden');
    eq(P.sameCurve(math, '2*cos(theta)', '-2*cos(theta + pi)'), true);
    eq(P.sameCurve(math, '2*cos(2*theta)', '-2*cos(2*theta)'), true);       // rosa par: simétrica respecto al origen
    eq(P.sameCurve(math, '3*cos(3*theta)', '-3*cos(3*theta)'), false);      // rosa impar: −r la gira 180°
    eq(P.sameCurve(math, '1 + cos(theta)', '1 - cos(theta)'), false);
  });

  test('polar: diagnóstico de la curva del alumno (ok, girada, reflejada, escala, pétalos)', () => {
    const T = (s, to) => P.curveOf(math, s, 0, to || TAU, 900);
    eq(P.diagnose(T('2*cos(theta)'), T('-2*cos(theta + pi)')).key, 'ok');
    eq(P.diagnose(T('1 + cos(theta)'), T('1 + sin(theta)')).key, 'rotated');
    eq(P.diagnose(T('3*cos(3*theta)'), T('3*sin(3*theta)')).key, 'rotated');
    eq(P.diagnose(T('2*sin(2*theta)'), T('2*cos(2*theta)')).key, 'rotated');
    eq(P.diagnose(T('1 + 2*cos(theta)'), T('1 - 2*cos(theta)')).key, 'reflected');
    eq(P.diagnose(T('4*cos(theta)'), T('2*cos(theta)')).key, 'scale');
    eq(P.diagnose(T('theta/2', 2 * TAU), T('theta', 2 * TAU)).key, 'scale');
    eq(P.diagnose(T('3*cos(3*theta)'), T('3*cos(6*theta)')).key, 'petals');
    eq(P.diagnose(T('1 + cos(theta)'), T('theta^2')).key, 'bad');
    eq(P.diagnose(T('1 + cos(theta)'), T('sqrt(-1-theta)')).key, 'domain');
    // Los ejemplos cargados de cada reto dan un «casi» o un «revisa», nunca «correcto».
    P.CHALLENGES.forEach((c) => {
      const d = P.diagnose(T(c.expr, c.to), T(c.sampleMath, c.to));
      if (d.kind === 'ok') throw new Error(c.name + ': el ejemplo cargado sale correcto');
      eq(P.diagnose(T(c.expr, c.to), T(c.expr, c.to)).kind, 'ok', c.name);
    });
  });

  test('polar: simetrías (eje polar, eje y, origen) contra la prueba r(−θ) = r(θ) y familias conocidas', () => {
    const s = (e) => JSON.stringify(P.symmetryOf(math, e));
    eq(s('1 + cos(theta)'), JSON.stringify({ polar: true, yaxis: false, origin: false }));
    eq(s('2 - 2*sin(theta)'), JSON.stringify({ polar: false, yaxis: true, origin: false }));
    eq(s('2*sin(2*theta)'), JSON.stringify({ polar: true, yaxis: true, origin: true }));
    eq(s('3*cos(3*theta)'), JSON.stringify({ polar: true, yaxis: false, origin: false }));
    eq(P.symmetryOf(math, 'theta', 0, 2 * TAU).polar, false);
    // r = sin 2θ: la prueba θ → −θ falla (r(−θ) = −r(θ)), pero la curva sí es simétrica respecto
    // al eje x, como dice la prueba alternativa (r, θ) → (−r, π − θ).
    const s2 = P.compile(math, 'sin(2*theta)');
    near(s2(-0.7), -s2(0.7), 1e-12);
    near(s2(PI - 0.7), -s2(0.7), 1e-12);            // r(π − θ) = −r(θ): (−r, π − θ) está en la curva
    eq(P.symmetryOf(math, 'sin(2*theta)').polar, true, 'r = sin 2θ respecto al eje x');
    // Oráculo algebraico: si r(−θ) = r(θ) la curva es simétrica respecto al eje polar.
    ['1 + 3*cos(theta)', '2*cos(4*theta)', '2 + cos(2*theta)'].forEach((e) => {
      const f = P.compile(math, e);
      for (let i = 0; i < 20; i++) { const t = rand() * TAU; near(f(-t), f(t), 1e-12); }
      eq(P.symmetryOf(math, e).polar, true, e);
    });
  });

  test('polar: curvas al azar con parámetros válidos', () => {
    for (let i = 0; i < 60; i++) {
      const c = P.randomCurve(rand), pts = P.curveOf(math, c.expr, 0, c.to, 300);
      if (!(P.extent(pts) > 0)) throw new Error('curva vacía ' + c.expr);
      eq(P.diagnose(pts, pts).kind, 'ok');
    }
  });

  // Banco de S02: cada numérica con `chk` se recalcula con LabMath.polar.
  const bankFile = path.join(__dirname, '..', '..', 'data', 'calculo-2', 'bank', 'sesion-02.js');
  if (fs.existsSync(bankFile)) {
    test('polar: banco c2 S02 contra LabMath (conversiones con atan2, pétalos geométricos)', () => {
      const { loadData } = require('../lib/load');
      const ROOT = path.join(__dirname, '..', '..');
      const W = loadData([path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
      const all = W.CB_BANK.c2.S02.questions;
      const Q = all.filter((q) => q.chk);
      const nNum = all.filter((q) => q.type === 'numeric').length;
      if (Q.length < nNum) throw new Error(`solo ${Q.length} de ${nNum} numéricas con chk`);
      Q.forEach((q) => {
        for (let i = 0; i < 40; i++) {
          const v = W.CBExercises.instance(q, rand);
          const want = q.chk(v, P, math), got = q.answer(v);
          if (!(Math.abs(got - want) <= 1e-9 * Math.max(1, Math.abs(want)))) throw new Error(`${q.id} ${JSON.stringify(v)}: respuesta ${got} y LabMath da ${want}`);
        }
      });
    });
  }
};
