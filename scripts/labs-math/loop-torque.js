// Pruebas de LabMath.loop (lab loop-torque, Física 3 · S05), con oráculos independientes:
// el torque sumando r × F lado por lado (con F = I L × B de LabMath.wire), contra μ × B y contra
// N I A B sin θ; la fuerza neta nula; la energía como menos la integral del torque (cuadratura);
// el promedio del motor con conmutador por integración numérica. Revisa también el banco f3 S05.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const L = LM.loop, W = LM.wire;
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const rand = rng(505);
  const between = (a, b) => a + (b - a) * rand();
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

  test('loop: Σ r × F lado por lado (fuerzas de LabMath.wire) = μ × B = N I A B sin θ', () => {
    for (let i = 0; i < 300; i++) {
      const N = 1 + Math.floor(rand() * 100), I = between(0.1, 5), a = between(0.02, 0.3), b = between(0.02, 0.3), B = between(0.05, 2), th = between(0, 360);
      const s = L.sides(N, I, a, b, B, th);
      // Oráculo: cada lado con LabMath.wire y su brazo propio.
      let tau = [0, 0, 0];
      for (let k = 0; k < 4; k++) {
        const p = s.corners[k], q = s.corners[(k + 1) % 4], F = W.force(N * I, [q[0] - p[0], q[1] - p[1], q[2] - p[2]], [B, 0, 0]).vec;
        const r = cross([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2], F);
        tau = tau.map((x, j) => x + r[j]);
      }
      const mb = L.muCrossB(N, I, a * b, B, th), scl = 1e-9 * (1 + N * I * a * b * B);
      for (let k = 0; k < 3; k++) { near(s.tau[k], tau[k], scl); near(s.tau[k], mb[k], scl); }
      near(s.tau[1], L.torque(N, I, a * b, B, th), scl);
      near(Math.hypot(s.Fnet[0], s.Fnet[1], s.Fnet[2]), 0, scl);
      // La normal de la espira (mano derecha con la corriente) es n̂.
      const c = s.corners, A = cross([c[1][0] - c[0][0], c[1][1] - c[0][1], c[1][2] - c[0][2]], [c[2][0] - c[1][0], c[2][1] - c[1][1], c[2][2] - c[1][2]]);
      const An = Math.hypot(A[0], A[1], A[2]);
      for (let k = 0; k < 3; k++) near(A[k] / An, s.n[k], 1e-9);
    }
  });

  test('loop: U(θ) = −μB cos θ es menos la integral del torque (Simpson)', () => {
    for (let i = 0; i < 100; i++) {
      const N = 1 + Math.floor(rand() * 50), I = between(0.1, 5), A = between(1e-4, 0.05), B = between(0.05, 2), t1 = between(0, 180), t2 = between(0, 360);
      const n = 400, h = (t2 - t1) / n;
      let s = 0;
      for (let k = 0; k <= n; k++) { const w = k === 0 || k === n ? 1 : k % 2 ? 4 : 2; s += w * L.torque(N, I, A, B, t1 + k * h); }
      const integral = s * h / 3 * Math.PI / 180;                  // ∫ τ dθ con θ en radianes
      near(L.energy(N, I, A, B, t2) - L.energy(N, I, A, B, t1), integral, 1e-7 * (1 + N * I * A * B));
      near(L.workField(N, I, A, B, t1, t2), -integral, 1e-7 * (1 + N * I * A * B));
    }
    near(L.energy(1, 1, 1, 1, 0), -1, 1e-15); near(L.energy(1, 1, 1, 1, 180), 1, 1e-12);
  });

  test('loop: motor con conmutador, promedio 2/π del máximo (integración numérica)', () => {
    for (let i = 0; i < 50; i++) {
      const N = 1 + Math.floor(rand() * 50), I = between(0.1, 5), A = between(1e-4, 0.05), B = between(0.05, 2), n = 3600;
      let s = 0;
      for (let k = 0; k < n; k++) s += L.motorTorque(N, I, A, B, (k + 0.5) * 360 / n);
      near(s / n, L.motorAverage(N, I, A, B), 1e-6 * L.motorAverage(N, I, A, B));
    }
  });

  test('loop: momento, área circular y el reto (θ desde la normal o desde el plano)', () => {
    near(L.moment(50, 2, 0.01), 1, 1e-15); near(L.circleArea(0.1), Math.PI * 0.01, 1e-15);
    const c = { shape: 'rect', N: 20, I: 2, a: 10, b: 8, B: 0.5, ang: 30, ref: 'plano' };
    eq(L.thetaOf(c), 60); near(L.truth(c), 20 * 2 * 0.008 * 0.5 * Math.sin(Math.PI / 3) * 1000, 1e-9);
    eq(L.diagnose(c, L.truth(c)), 'ok'); eq(L.diagnose(c, L.truth(c) * 1.02), 'ok');
    eq(L.diagnose(c, L.torque(20, 2, 0.008, 0.5, 30) * 1000), 'cos');
    eq(L.diagnose(c, L.truth(c) / 20), 'noN');
    eq(L.diagnose(c, L.truth(c) * 1e4), 'cm2');
    const d = { shape: 'circ', N: 10, I: 1, r: 3, B: 0.3, ang: 40, ref: 'normal' };
    eq(L.diagnose(d, L.truth(d) * 4), 'diameter');
    eq(L.diagnose(d, 999), 'bad'); eq(L.diagnose(d, NaN), 'bad');
  });

  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-3/bank/sesion-05.js');
  if (fs.existsSync(bankFile)) test('loop: banco f3 S05 contra LabMath (200 instancias por pregunta)', () => {
    const { loadData } = require('../lib/load');
    const Wd = loadData([path.join(ROOT, 'shared/js/labs/registry.js'), path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
    const Q = Wd.CB_BANK.f3.S05.questions;
    let seed = 99;
    const r2 = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    const missing = Q.filter((q) => q.type === 'numeric' && typeof q.oracle !== 'function').map((q) => q.id);
    if (missing.length) throw new Error('numéricas sin oracle: ' + missing.join(', '));
    Q.filter((q) => q.type === 'numeric').forEach((q) => {
      for (let i = 0; i < 200; i++) {
        const v = Wd.CBExercises.instance(q, r2), a = q.answer(v), o = q.oracle(v, LM);
        if (!(Math.abs(a - o) <= 1e-6 * Math.max(1e-30, Math.abs(o)) + 1e-30)) throw new Error(`${q.id} ${JSON.stringify(v)}: banco ${a}, LabMath ${o}`);
      }
    });
  });
};
