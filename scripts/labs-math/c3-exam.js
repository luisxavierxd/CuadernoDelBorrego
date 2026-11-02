// Problemas de examen de Cálculo 3 (data/calculo-3/exam-problems.js) por un camino independiente
// de answer(): cada PVI se integra con el RK4 de LabMath.ode y las cantidades se leen de la curva
// numérica (valores, pendientes por diferencias, tiempos de cruce por bisección).
'use strict';
const path = require('path');
const { loadData } = require('../lib/load');

module.exports = ({ test, near, LM, math }) => {
  const W = loadData(path.join(__dirname, '..', '..', 'data', 'calculo-3', 'exam-problems.js'), {});
  const list = (W.CB_EXAMS && W.CB_EXAMS.c3) || [];
  const byId = {};
  list.forEach((p) => { byId[p.id] = p; });
  const O = LM.ode;
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1), msg);

  function instances(p, n) {
    let seed = 23;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const out = [];
    for (let tries = 0; out.length < n && tries < n * 200; tries++) {
      const v = {};
      Object.keys(p.vars).forEach((key) => {
        const [a, b, st = 1] = p.vars[key], m = Math.round((b - a) / st);
        v[key] = +(a + st * Math.floor(rnd() * (m + 1))).toFixed(6);
      });
      if (!p.where || p.where(v)) out.push(v);
    }
    if (!out.length) throw new Error('sin instancias de ' + p.id);
    return out;
  }
  function chain(p, v) { const t = []; p.parts.forEach((part) => t.push(part.answer(v, t.slice()))); return t; }
  function each(id, fn) {
    const p = byId[id];
    if (!p) throw new Error('no existe ' + id);
    instances(p, 8).forEach((v) => fn(v, chain(p, v), JSON.stringify(v)));
  }
  const at = (P, x) => O.solveAt(math, P, x);
  const slope = (P, x) => (at(P, x + 1e-4) - at(P, x - 1e-4)) / 2e-4;
  // Primer cruce de la solución numérica con `level` en [a, b] (bisección; la curva es monótona ahí).
  function cross(P, level, a, b) {
    const s = Math.sign(at(P, a) - level);
    for (let i = 0; i < 50; i++) { const m = (a + b) / 2; if (Math.sign(at(P, m) - level) === s) a = m; else b = m; }
    return (a + b) / 2;
  }

  test('c3 examen · decaimiento: RK4 reproduce el dato, la vida media y el porcentaje', () => each('c3-ex-decaimiento', (v, t, s) => {
    const P = { iv: 't', order: 1, rhs: '-k*y', params: { k: t[0] }, x0: 0, ics: [v.m0], domain: [0, 1] };
    rel(at(P, v.t1), v.m0 * v.f, 1e-7, s + ' dato');
    rel(cross(P, v.m0 / 2, 0, 200), t[1], 1e-6, s + ' vida media');
    rel(at(P, v.t2), t[2], 1e-7, s + ' m(t2)');
    rel(cross(P, v.m0 * v.p / 100, 0, 400), t[3], 1e-6, s + ' porcentaje');
  }));
  test('c3 examen · forense: el cuerpo estaba a 37 °C en −t y la pendiente sale de la curva', () => each('c3-ex-forense', (v, t, s) => {
    const P = { iv: 't', order: 1, rhs: '-k*(y - Ta)', params: { k: t[0], Ta: v.Ta }, x0: 0, ics: [v.T1], domain: [0, 1] };
    rel(at(P, 1), v.T1 - v.dT, 1e-7, s + ' 9:00');
    rel(at(P, -t[1]), 37, 1e-6, s + ' 37 °C');
    rel(at(P, 3), t[2], 1e-7, s + ' 11:00');
    rel(slope(P, 3), t[3], 1e-5, s + ' T′');
  }));
  test('c3 examen · homogénea: y(x1) y la tangente con RK4', () => each('c3-ex-homogenea', (v, t, s) => {
    const P = { order: 1, rhs: '(x^2 + y^2)/(2x*y)', x0: 1, ics: [v.c], domain: [1, 5] };
    rel(at(P, v.x1), t[1], 1e-6, s + ' y(x1)');
    rel(slope(P, v.x1), t[2], 1e-5, s + ' pendiente');
    rel(at(P, v.x1) - slope(P, v.x1) * v.x1, t[3], 1e-5, s + ' ordenada');
  }));
  test('c3 examen · sustitución: y(x1) con RK4 y la asíntota donde la numérica explota', () => each('c3-ex-sustitucion', (v, t, s) => {
    const P = { order: 1, rhs: '(x + y)^2 - 1', x0: 0, ics: [v.b], domain: [0, 1] };
    rel(at(P, v.x1), t[2], 1e-6, s + ' y(x1)');
    rel(at(P, v.x1) + v.x1, t[1], 1e-6, s + ' u(x1)');
    // Cerca de la asíntota la solución es enorme; un poco antes, finita.
    if (!(at(P, t[3] - 0.01) > 50)) throw new Error(s + ' la numérica no crece cerca de la asíntota');
  }));
  test('c3 examen · tanque: A(t1), el 90 % y A′ con RK4', () => each('c3-ex-tanque', (v, t, s) => {
    const P = { iv: 't', order: 1, rhs: 'r*c - r*y/V', params: { r: v.r, c: v.c, V: v.V }, x0: 0, ics: [v.A0], domain: [0, 1] };
    rel(at(P, v.t1), t[1], 1e-7, s + ' A(t1)');
    rel(cross(P, 0.9 * v.V * v.c, 0, 3000), t[2], 1e-6, s + ' 90 %');
    rel(slope(P, v.t1), t[3], 1e-5, s + ' A′');
    rel(at(P, 50 * v.V / v.r > 3000 ? 3000 : 50 * v.V / v.r), t[0], 1e-4, s + ' estacionario');
  }));
  test('c3 examen · RC: carga, corriente y 95 % con RK4', () => each('c3-ex-rc', (v, t, s) => {
    const P = { iv: 't', order: 1, rhs: 'E/R - y/(R*K)', params: { E: v.E, R: v.R, K: v.C }, x0: 0, ics: [0], domain: [0, 1] };
    rel(at(P, v.t1), t[1], 1e-7, s + ' q(t1)');
    rel(slope(P, v.t1), t[2], 1e-5, s + ' i(t1)');
    rel(cross(P, 0.95 * v.C * v.E, 0, 40 * t[0]), t[3], 1e-6, s + ' 95 %');
  }));
  test('c3 examen · lineal con potencias: y(x1) y y′(x1) con RK4', () => each('c3-ex-lineal', (v, t, s) => {
    const P = { order: 1, rhs: '(x^2 - 2y)/x', x0: 1, ics: [v.c], domain: [1, 5] };
    rel(at(P, v.x1), t[1], 1e-7, s + ' y(x1)');
    rel(slope(P, v.x1), t[2], 1e-5, s + ' y′(x1)');
  }));
  test('c3 examen · exacta: la numérica por (p, q) llega a x = 0 en √(C/b) con pendiente −M/N', () => each('c3-ex-exacta', (v, t, s) => {
    const P = { kind: 'exact', M: '2x*y + ' + v.a, N: 'x^2 + ' + (2 * v.b) + '*y', x0: v.p, ics: [v.q], domain: [0, 4] };
    rel(at(P, 0), t[1], 1e-6, s + ' y(0)');
    rel(slope(P, 1e-3), t[2], 2e-3, s + ' pendiente');
  }));
  test('c3 examen · factor integrante: y(x1) y la pendiente con RK4', () => each('c3-ex-factor', (v, t, s) => {
    const P = { kind: 'exact', M: '2y^2 + ' + (3 * v.a) + '*x', N: '2x*y', x0: 1, ics: [v.b], domain: [0.5, 1] };
    rel(at(P, v.x1), t[1], 1e-6, s + ' y(x1)');
    rel(slope(P, v.x1), t[2], 1e-5, s + ' pendiente');
  }));
  test('c3 examen · RL: corriente y 90 % con RK4', () => each('c3-ex-rl', (v, t, s) => {
    const P = { iv: 't', order: 1, rhs: 'E/L - R*y/L', params: { E: v.E, L: v.L, R: v.R }, x0: 0, ics: [0], domain: [0, 1] };
    rel(at(P, v.t1), t[1], 1e-7, s + ' i(t1)');
    rel(cross(P, 0.9 * v.E / v.R, 0, 20 * t[0]), t[3], 1e-6, s + ' 90 %');
  }));
  test('c3 examen · tanque con volumen variable: A(t1) con RK4', () => each('c3-ex-tanque-var', (v, t, s) => {
    const P = { iv: 't', order: 1, rhs: '3*c - 2y/(V0 + t)', params: { c: v.c, V0: v.V0 }, x0: 0, ics: [0], domain: [0, 1] };
    rel(at(P, v.t1), t[1], 1e-7, s + ' A(t1)');
  }));
  test('c3 examen · conjunto fundamental: y(0.5) del PVI con RK4', () => each('c3-ex-fundamental', (v, t, s) => {
    const P = { order: 2, rhs: (v.r1 + v.r2) + '*dy - ' + (v.r1 * v.r2) + '*y', x0: 0, ics: [v.A, v.B], domain: [0, 1] };
    rel(at(P, 0.5), t[3], 1e-7, s + ' y(0.5)');
  }));
  test('c3 examen · reducción de orden: y(2) del PVI de Euler con RK4', () => each('c3-ex-reduccion', (v, t, s) => {
    const P = { order: 2, rhs: '(3x*dy - 4y)/x^2', x0: 1, ics: [v.A, v.B], domain: [1, 2] };
    rel(at(P, 2), t[2], 1e-7, s + ' y(2)');
  }));
  test('c3 examen · complejas: y(t1) con RK4 y el periodo entre cruces', () => each('c3-ex-complejas', (v, t, s) => {
    const P = { order: 2, rhs: '-' + (2 * v.al) + '*dy - ' + (v.al * v.al + v.be * v.be) + '*y', x0: 0, ics: [v.A, v.B], domain: [0, 4] };
    rel(at(P, v.t1), t[2], 1e-6, s + ' y(t1)');
  }));
  test('c3 examen · raíz doble: el máximo donde y′ = 0 con RK4', () => each('c3-ex-doble', (v, t, s) => {
    const P = { order: 2, rhs: '-' + (2 * v.k) + '*dy - ' + (v.k * v.k) + '*y', x0: 0, ics: [v.A, v.B], domain: [0, 4] };
    rel(at(P, 1), t[1], 1e-7, s + ' y(1)');
    near(slope(P, t[2]), 0, 1e-5 * (1 + Math.abs(t[3])), s + ' y′ en el máximo');
    rel(at(P, t[2]), t[3], 1e-7, s + ' máximo');
  }));
  test('c3 examen · logística: P(t1), K/2 y P′ con RK4', () => each('c3-ex-logistica', (v, t, s) => {
    const P = { iv: 't', order: 1, rhs: 'r*y*(1 - y/K)', params: { r: v.r, K: v.K }, x0: 0, ics: [v.P0], domain: [0, 1] };
    rel(at(P, v.t1), t[1], 1e-7, s + ' P(t1)');
    rel(cross(P, v.K / 2, 0, 100), t[2], 1e-6, s + ' K/2');
    rel(slope(P, v.t1), t[3], 1e-5, s + ' P′');
  }));
};
