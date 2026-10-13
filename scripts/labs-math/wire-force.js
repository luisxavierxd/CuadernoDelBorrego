// Pruebas de LabMath.wire (lab wire-force, Física 3 · S04), con oráculos independientes:
// la fuerza sobre el alambre como la suma de q v × B sobre los portadores (LabMath.lorentz),
// un arco partido en miles de trocitos contra 2IRB sin(φ/2), la fuerza neta nula sobre una
// espira cerrada, la cuerda contra el camino y la levitación como equilibrio de fuerzas.
// Revisa también el banco f3 S04.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const W = LM.wire;
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const rand = rng(404);
  const between = (a, b) => a + (b - a) * rand();
  const vec = () => [between(-3, 3), between(-3, 3), between(-3, 3)];
  const nrm = (a) => Math.hypot(a[0], a[1], a[2]);

  test('wire: I L × B es la suma de q v_d × B sobre los portadores (n·A·L cargas)', () => {
    for (let i = 0; i < 200; i++) {
      const n = 8.5e28, A = between(1e-7, 1e-5), vd = between(1e-5, 1e-3), e = 1.60e-19, L = vec(), B = vec();
      const Lm = nrm(L), u = L.map((x) => x / Lm), I = n * e * vd * A;      // I = n q v_d A
      const one = LM.lorentz.force(e, u.map((x) => x * vd), B);             // fuerza sobre un portador
      const N = n * A * Lm, F = W.force(I, L, B);
      for (let k = 0; k < 3; k++) near(F.vec[k], N * one.vec[k], 1e-9 * (1 + Math.abs(F.vec[k])));
    }
  });

  test('wire: magnitud I L B sin θ con θ por el producto punto', () => {
    for (let i = 0; i < 200; i++) {
      const I = between(0.1, 10), L = vec(), B = vec(), F = W.force(I, L, B);
      const th = Math.acos((L[0] * B[0] + L[1] * B[1] + L[2] * B[2]) / (nrm(L) * nrm(B))) * 180 / Math.PI;
      near(W.magnitude(I, nrm(L), nrm(B), th), F.mag, 1e-9 * (1 + F.mag));
    }
  });

  test('wire: arco de radio R y ángulo φ partido en 20 000 trocitos contra 2IRB sin(φ/2)', () => {
    for (let i = 0; i < 30; i++) {
      const I = between(0.5, 10), R = between(0.01, 0.5), B = between(0.01, 2), phi = between(10, 350);
      let Fx = 0, Fy = 0;
      const n = 20000;
      for (let k = 0; k < n; k++) {
        const a0 = phi * Math.PI / 180 * k / n, a1 = phi * Math.PI / 180 * (k + 1) / n;
        const dl = [R * (Math.cos(a1) - Math.cos(a0)), R * (Math.sin(a1) - Math.sin(a0))];
        // dl × (0, 0, B) = (dl_y B, −dl_x B, 0)
        Fx += I * dl[1] * B; Fy += -I * dl[0] * B;
      }
      near(Math.hypot(Fx, Fy), W.arcForce(I, R, B, phi), 1e-6 * W.arcForce(I, R, B, phi));
    }
  });

  test('wire: el alambre doblado siente lo mismo que la cuerda; una espira cerrada, nada', () => {
    for (let i = 0; i < 100; i++) {
      const I = between(0.5, 10), B = vec(), pts = [];
      for (let k = 0; k < 6; k++) pts.push(vec());
      const F = W.bent(I, pts, B, 37), C = W.chord(I, pts[0], pts[pts.length - 1], B);
      for (let k = 0; k < 3; k++) near(F.vec[k], C.vec[k], 1e-9 * (1 + C.mag));
      const loop = pts.concat([pts[0]]), Z = W.bent(I, loop, B, 11);
      near(Z.mag, 0, 1e-9 * (1 + I * nrm(B) * W.pathLength(loop)));
    }
    const semi = W.semicircle(0.1, 400);
    near(W.pathLength(semi), Math.PI * 0.1, 1e-4);
    near(W.bent(2, semi, [0, 0, -0.5]).mag, W.arcForce(2, 0.1, 0.5, 180), 1e-12);
  });

  test('wire: levitación (I L B = m g) y dirección de la fuerza', () => {
    for (let i = 0; i < 100; i++) {
      const m = between(0.001, 0.1), L = between(0.05, 1), B = between(0.05, 1), I = W.levitate(m, L, B);
      // Corriente en +x y B en −z: la fuerza va en +y, contra el peso.
      const F = W.force(I, [L, 0, 0], [0, 0, -B]);
      near(F.y, m * 9.81, 1e-9 * m * 9.81);
      eq(W.dirOf(F.vec), '+y');
    }
    eq(W.dirOf([0, 0, -2]), '−z'); eq(W.dirOf([1, 1, 0]), null);
  });

  test('wire: diagnóstico del reto', () => {
    const c = { kind: 'plane', I: 5, L: 20, B: 50, th: 30 }, t = W.truth(c);
    near(t.mag, 5 * 0.2 * 0.05 * 0.5 * 1000, 1e-9);                       // mN
    eq(t.dir, '−z');                                                       // L en el plano a 30°, B en +x: L × B = −z
    eq(W.diagnose(c, { mag: t.mag, dir: t.dir }), 'ok');
    eq(W.diagnose(c, { mag: t.mag, dir: '+z' }), 'reversed');
    eq(W.diagnose(c, { mag: W.mistakes(c).cos, dir: t.dir }), 'cos');
    eq(W.diagnose(c, { mag: t.mag * 100, dir: t.dir }), 'cm');
    eq(W.diagnose(c, { mag: t.mag * 1000, dir: t.dir }), 'mT');
    eq(W.diagnose(c, { mag: t.mag, dir: '+x' }), 'dirBad');
    eq(W.diagnose(c, { mag: 1.23, dir: t.dir }), 'magBad');
    const b = { kind: 'bent', I: 4, B: 50, shape: 'semi', R: 10 };
    eq(W.diagnose(b, { mag: W.mistakes(b).path, dir: W.truth(b).dir }), 'path');
    eq(W.truth(b).dir, '+y');
    eq(W.diagnose(b, { mag: NaN, dir: '+y' }), 'bad');
  });

  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-3/bank/sesion-04.js');
  if (fs.existsSync(bankFile)) test('wire: banco f3 S04 contra LabMath (200 instancias por pregunta)', () => {
    const { loadData } = require('../lib/load');
    const Wd = loadData([path.join(ROOT, 'shared/js/labs/registry.js'), path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
    const Q = Wd.CB_BANK.f3.S04.questions;
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
