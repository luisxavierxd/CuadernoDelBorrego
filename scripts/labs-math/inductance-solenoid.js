// Pruebas de LabMath.inductor (lab inductance-solenoid, Física 3 · S13) con oráculos independientes:
// el campo en el eje como suma de N espiras (Biot–Savart de cada una, sin la fórmula cerrada), L = NΦ/I
// con ese campo en el centro de un solenoide muy largo, la L con bordes siempre menor que la ideal y que
// tiende a ella al alargar, la fem como derivada numérica de I(t) por L, el despeje de N de ida y vuelta,
// el diagnóstico del reto y el banco de S13.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const I = LM.inductor, MU0 = 4 * Math.PI * 1e-7;
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-30), msg);
  let seed = 67;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = (lo, hi) => lo + (hi - lo) * rnd();
  // Campo en el eje de N espiras de radio r repartidas en [−ℓ/2, ℓ/2], en el punto z (todo en m).
  const loopSum = (N, r, l, Icur, z) => {
    let s = 0;
    for (let k = 0; k < N; k++) {
      const zk = -l / 2 + l * (k + 0.5) / N, d = z - zk;
      s += MU0 * Icur * r * r / (2 * Math.pow(r * r + d * d, 1.5));
    }
    return s;
  };

  test('inductor: valores a mano', () => {
    // 500 vueltas, r = 1.5 cm, ℓ = 20 cm: L = μ₀·250000·π(0.015)²/0.2.
    rel(I.ideal(500, 1.5, 20, 1), MU0 * 250000 * Math.PI * 2.25e-4 / 0.2, 1e-12);
    rel(I.field(500, 20, 2, 1), MU0 * 2500 * 2, 1e-12);
    rel(I.state({ N: 500, r: 1.5, l: 20, Km: 1, kind: 'ramp', I0: 0, k: 4 }, 0.1).emf, -4 * I.ideal(500, 1.5, 20, 1), 1e-12);
    rel(I.ideal(500, 1.5, 20, 200), 200 * I.ideal(500, 1.5, 20, 1), 1e-12);
  });

  test('inductor: campo en el eje (fórmula cerrada) contra la suma de N espiras', () => {
    for (let k = 0; k < 40; k++) {
      const N = Math.round(pick(200, 2000)), r = pick(0.5, 3), l = pick(5, 50), Ic = pick(0.1, 3), z = pick(-0.6, 0.6) * l;
      rel(I.axialB(N, r, l, Ic, 1, z), loopSum(N, r / 100, l / 100, Ic, z / 100), 2e-3, `N=${N} r=${r} l=${l} z=${z}`);
    }
  });

  test('inductor: en un solenoide muy largo, L = NΦ/I con el campo del centro (suma de espiras)', () => {
    for (let k = 0; k < 20; k++) {
      const N = Math.round(pick(1000, 3000)), r = pick(0.2, 0.5), l = pick(60, 100), Ic = 1;
      const Phi = loopSum(N, r / 100, l / 100, Ic, 0) * Math.PI * Math.pow(r / 100, 2);
      rel(I.ideal(N, r, l, 1), N * Phi / Ic, 2e-3, `N=${N}`);
    }
  });

  test('inductor: con bordes la L es menor y tiende a la ideal al alargar el solenoide', () => {
    for (let k = 0; k < 30; k++) {
      const N = Math.round(pick(100, 2000)), r = pick(0.5, 3), l = pick(5, 50);
      const Li = I.ideal(N, r, l, 1), Le = I.withEnds(N, r, l, 1);
      if (!(Le < Li && Le > 0.4 * Li)) throw new Error(`L con bordes fuera de rango: ${Le / Li}`);
    }
    const a = I.withEnds(1000, 1, 10, 1) / I.ideal(1000, 1, 10, 1), b = I.withEnds(1000, 1, 100, 1) / I.ideal(1000, 1, 100, 1);
    if (!(b > a && b > 0.98)) throw new Error(`no tiende a la ideal: ${a} → ${b}`);
  });

  test('inductor: ε = −L dI/dt contra la derivada numérica de I(t)', () => {
    for (let k = 0; k < 100; k++) {
      const kind = k % 2 ? 'sine' : 'ramp';
      const p = { N: Math.round(pick(50, 2000)), r: pick(0.5, 3), l: pick(5, 50), Km: [1, 50, 200, 1000][k % 4], kind, I0: pick(0, 2), k: pick(-10, 10), Im: pick(0.1, 2), f: pick(10, 200) };
      const t = pick(0, 0.05), h = 1e-7, s = I.state(p, t);
      const num = -s.L * (I.current(kind, p, t + h) - I.current(kind, p, t - h)) / (2 * h);
      near(s.emf, num, 1e-6 * Math.max(1, Math.abs(num)), `ε ${kind}`);
      rel(s.link, s.L * s.I, 1e-12);
      // NΦ/I con el campo ideal: N·B·A/I = L.
      if (Math.abs(s.I) > 1e-6) rel(p.N * s.B * I.area(p.r) / s.I, s.L, 1e-12, 'NBA/I');
    }
  });

  test('inductor: N para una L dada (ida y vuelta)', () => {
    for (let k = 0; k < 100; k++) {
      const r = pick(0.5, 3), l = pick(5, 50), Km = [1, 50, 200][k % 3], L = pick(1e-4, 0.5);
      rel(I.ideal(I.turnsFor(L, r, l, Km), r, l, Km), L, 1e-12);
    }
  });

  test('inductor: el diagnóstico reconoce cada error típico', () => {
    const cases = [
      ['L', { N: 500, r: 1.5, l: 20, Km: 1 }],
      ['L', { N: 800, r: 2, l: 30, Km: 200 }],
      ['emf', { N: 600, r: 1.2, l: 15, Km: 1, kind: 'ramp', I0: 0.2, k: 4, t: 0.05 }],
      ['emf', { N: 400, r: 2, l: 25, Km: 50, kind: 'sine', Im: 0.5, f: 60, t: 0.0021 }],
      ['N', { r: 1.5, l: 20, Km: 1, Lt: 10 }],
      ['N', { r: 1, l: 10, Km: 200, Lt: 40 }]
    ];
    cases.forEach(([k, p]) => {
      const r = I.answers(k, p);
      eq(I.diagnose(k, p, r.truth), 'ok', k);
      eq(I.diagnose(k, p, r.truth * 1.004), 'ok', k + ' redondeado');
      let seen = 0;
      Object.keys(r).filter((x) => x !== 'truth').forEach((mk) => {
        if (!isFinite(r[mk]) || Math.abs(r[mk] - r.truth) <= 0.02 * Math.abs(r.truth)) return;
        seen++;
        eq(I.diagnose(k, p, r[mk]), mk, `${k} ${mk}`);
      });
      if (seen < 2) throw new Error(`${k}: muy pocos errores distinguibles`);
      eq(I.diagnose(k, p, r.truth * 3.7), 'bad');
      eq(I.diagnose(k, p, NaN), 'bad');
    });
  });

  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-3/bank/sesion-13.js');
  if (fs.existsSync(bankFile)) test('inductor: banco f3 S13 contra LabMath (200 instancias por pregunta)', () => {
    const { loadData } = require('../lib/load');
    const W = loadData([path.join(ROOT, 'shared/js/labs/registry.js'), path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
    const Q = W.CB_BANK.f3.S13.questions;
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
