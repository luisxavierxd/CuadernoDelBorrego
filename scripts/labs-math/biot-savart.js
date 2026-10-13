// Pruebas de LabMath.biot (lab biot-savart, Física 3 · S06), con oráculos independientes:
// la integral de Biot–Savart escrita aparte sobre una curva paramétrica con Simpson (sin usar
// LabMath.biot.dB), la suma de trozos de LabMath para N grande, el límite del alambre infinito
// y la regla de la mano derecha. También revisa el banco f3 S06 contra LabMath.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const B = LM.biot, MU0 = 4 * Math.PI * 1e-7;
  let seed = 606;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const between = (a, b) => a + (b - a) * rand();
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-30), msg);

  // Oráculo: ∫ (μ₀/4π) I r′(t) × (P − r(t)) / |P − r(t)|³ dt con Simpson (n par).
  function bsCurve(r, dr, t0, t1, I, P, n) {
    const out = [0, 0, 0], hh = (t1 - t0) / n;
    for (let i = 0; i <= n; i++) {
      const t = t0 + i * hh, w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2;
      const q = r(t), d = dr(t), v = [P[0] - q[0], P[1] - q[1], P[2] - q[2]], m = Math.hypot(...v), k = MU0 / (4 * Math.PI) * I / (m * m * m);
      out[0] += w * k * (d[1] * v[2] - d[2] * v[1]); out[1] += w * k * (d[2] * v[0] - d[0] * v[2]); out[2] += w * k * (d[0] * v[1] - d[1] * v[0]);
    }
    return out.map((x) => x * hh / 3);
  }

  test('biot: tramo recto contra la integral con Simpson y contra la forma con ángulos', () => {
    for (let i = 0; i < 200; i++) {
      const I = between(0.5, 20), a = between(0.005, 0.1), x1 = between(-0.3, 0.2), x2 = x1 + between(0.01, 0.4);
      const want = bsCurve((t) => [t, 0, 0], () => [1, 0, 0], x1, x2, I, [0, a, 0], 2000)[2];
      rel(B.segment(I, a, x1, x2), want, 1e-7);
      const t1 = Math.atan(x1 / a) * 180 / Math.PI, t2 = Math.atan(x2 / a) * 180 / Math.PI;
      rel(B.angles(I, a, t1, t2), want, 1e-7);
    }
  });

  test('biot: un tramo muy largo tiende a μ₀I/2πa; uno simétrico de ±a da μ₀I/(2√2 πa)', () => {
    for (let i = 0; i < 100; i++) {
      const I = between(1, 10), a = between(0.01, 0.1);
      rel(B.segment(I, a, -1e4 * a, 1e4 * a), MU0 * I / (2 * Math.PI * a), 1e-7);
      rel(B.infinite(I, a), 2e-7 * I / a, 1e-12);
      rel(B.segment(I, a, -a, a), MU0 * I / (2 * Math.SQRT2 * Math.PI * a), 1e-12);
    }
  });

  test('biot: arco y espira contra Simpson sobre la circunferencia', () => {
    for (let i = 0; i < 150; i++) {
      const I = between(1, 10), R = between(0.01, 0.1), phi = between(10, 360), z = between(0, 0.15);
      const arcW = bsCurve((t) => [R * Math.cos(t), R * Math.sin(t), 0], (t) => [-R * Math.sin(t), R * Math.cos(t), 0], 0, phi * Math.PI / 180, I, [0, 0, 0], 400);
      rel(B.arc(I, R, phi), arcW[2], 1e-9);
      const loopW = bsCurve((t) => [R * Math.cos(t), R * Math.sin(t), 0], (t) => [-R * Math.sin(t), R * Math.cos(t), 0], 0, 2 * Math.PI, I, [0, 0, z], 400);
      rel(B.loopAxis(I, R, z), loopW[2], 1e-9);
      near(loopW[0], 0, 1e-9 * Math.abs(loopW[2])); near(loopW[1], 0, 1e-9 * Math.abs(loopW[2]));
      rel(B.loopCenter(I, R, 3), 3 * B.loopAxis(I, R, 0), 1e-12);
    }
  });

  test('biot: la suma de N trozos converge a la fórmula cerrada (y el error baja como 1/N²)', () => {
    const cases = [['segment', { a: 0.03, x1: -0.04, x2: 0.08 }], ['arc', { R: 0.05, phi: 150 }], ['loop', { R: 0.04, z: 0.03 }]];
    for (const [k, g] of cases) {
      const want = B.closed(k, g, 5);
      const e1 = Math.abs(B.sum(k, g, 5, 20).B[2] - want), e2 = Math.abs(B.sum(k, g, 5, 40).B[2] - want);
      rel(B.sum(k, g, 5, 2000).B[2], want, 1e-6, k);
      if (k !== 'arc') near(e1 / e2, 4, 0.3, k + ' orden 2');
      // En el arco cada trozo aporta lo mismo (todos a la misma distancia del centro).
      if (k === 'arc') { const p = B.sum(k, g, 5, 12).parts; p.forEach((d) => rel(d[2], p[0][2], 1e-12)); }
    }
  });

  test('biot: mano derecha (corriente a +x, P arriba → B sale; antihoraria → +z)', () => {
    const s = B.sum('segment', { a: 0.02, x1: -0.05, x2: 0.05 }, 3, 50);
    eq(s.B[2] > 0, true); near(s.B[0], 0, 1e-15); near(s.B[1], 0, 1e-15);
    eq(B.sum('segment', { a: 0.02, x1: -0.05, x2: 0.05 }, -3, 50).B[2] < 0, true);
    eq(B.sum('arc', { R: 0.02, phi: 90 }, 2, 30).B[2] > 0, true);
    eq(B.sum('loop', { R: 0.02, z: -0.01 }, 2, 30).B[2] > 0, true, 'debajo de la espira también +z');
  });

  test('biot: reto (truth en µT y sentido) y diagnóstico', () => {
    const c = { kind: 'segment', I: 5, a: 3, x1: -4, x2: 4, dir: 1 }, t = B.truth(c), m = B.mistakes(c);
    rel(t.mag, B.segment(5, 0.03, -0.04, 0.04) * 1e6, 1e-12); eq(t.dir, 1);
    eq(B.diagnose(c, { mag: t.mag, dir: 1 }), 'ok');
    eq(B.diagnose(c, { mag: t.mag, dir: -1 }), 'reversed');
    eq(B.diagnose(c, { mag: m.infinite.mag, dir: 1 }), 'infinite');
    eq(B.diagnose(c, { mag: m.cm.mag, dir: 1 }), 'cm');
    eq(B.diagnose(c, { mag: t.mag * 1.7, dir: 1 }), 'dirOk');
    eq(B.diagnose(c, { mag: t.mag * 1.7, dir: -1 }), 'bad');
    eq(B.diagnose(c, { mag: NaN, dir: 1 }), 'bad');
    const a = { kind: 'arc', I: 4, R: 2, phi: 90, dir: -1 }, ta = B.truth(a), ma = B.mistakes(a);
    eq(ta.dir, -1);
    eq(B.diagnose(a, { mag: ma.fullLoop.mag, dir: -1 }), 'fullLoop');
    eq(B.diagnose(a, { mag: ma.degrees.mag, dir: -1 }), 'degrees');
    const l = { kind: 'loop', I: 3, R: 4, z: 3, dir: 1 }, ml = B.mistakes(l);
    eq(B.diagnose(l, { mag: ml.center.mag, dir: 1 }), 'center');
    eq(B.diagnose(l, { mag: ml.noPow.mag, dir: 1 }), 'noPow');
    rel(B.truth({ kind: 'infinite', I: 10, a: 2, dir: 1 }).mag, 100, 1e-12);
  });

  // Banco f3 S06: cada numérica trae oracle(v, LM), que recalcula con LabMath por otro camino.
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-3/bank/sesion-06.js');
  if (fs.existsSync(bankFile)) test('biot: banco f3 S06 contra LabMath (200 instancias por pregunta)', () => {
    const { loadData } = require('../lib/load');
    const W = loadData([path.join(ROOT, 'shared/js/labs/registry.js'), path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
    const Q = W.CB_BANK.f3.S06.questions;
    let s2 = 99;
    const r2 = () => { s2 = (s2 * 1103515245 + 12345) % 2147483648; return s2 / 2147483648; };
    const missing = Q.filter((q) => q.type === 'numeric' && typeof q.oracle !== 'function').map((q) => q.id);
    if (missing.length) throw new Error('numéricas sin oracle: ' + missing.join(', '));
    Q.filter((q) => q.type === 'numeric').forEach((q) => {
      for (let i = 0; i < 200; i++) {
        const v = W.CBExercises.instance(q, r2), a = q.answer(v), o = q.oracle(v, LM);
        if (!(Math.abs(a - o) <= 1e-6 * Math.max(1e-30, Math.abs(o)) + 1e-30)) throw new Error(`${q.id} ${JSON.stringify(v)}: banco ${a}, LabMath ${o}`);
      }
    });
  });
};
