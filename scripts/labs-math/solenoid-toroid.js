// Pruebas de LabMath.solenoid (lab solenoid-toroid, Física 3 · S09), con oráculos independientes:
// el solenoide finito contra la suma de espiras con densidad continua (Simpson sobre las espiras,
// escrito aquí con la fórmula de la espira de S06), el límite largo μ₀nI y la mitad en el extremo,
// y el toroide contra la ley de Ampère con la corriente que cruza el disco de radio r contada
// vuelta por vuelta. También revisa el banco f3 S09 contra LabMath.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const S = LM.solenoid, MU0 = 4 * Math.PI * 1e-7;
  let seed = 909;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const between = (a, b) => a + (b - a) * rand();
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-30), msg);

  // Oráculo: ∫ (N/L) dz′ · μ₀IR²/2((z − z′)² + R²)^{3/2} de −L/2 a L/2, con Simpson.
  function continuous(N, L, R, I, z, n) {
    let s = 0;
    const hh = L / n;
    for (let i = 0; i <= n; i++) {
      const zp = -L / 2 + i * hh, w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2, d = z - zp;
      s += w * MU0 * I * R * R / (2 * Math.pow(d * d + R * R, 1.5));
    }
    return s * hh / 3 * N / L;
  }

  test('solenoid: la fórmula del solenoide finito contra la integral de espiras (Simpson)', () => {
    for (let i = 0; i < 200; i++) {
      const N = Math.round(between(10, 500)), L = between(0.02, 0.5), R = between(0.003, 0.06), I = between(0.2, 5), z = between(-L, L);
      rel(S.finiteAxis(N, L, R, I, z), continuous(N, L, R, I, z, 4000), 1e-7);
    }
  });

  test('solenoid: la suma de espiras discretas se acerca a la fórmula cuando hay muchas vueltas por radio', () => {
    for (let i = 0; i < 60; i++) {
      const L = between(0.1, 0.4), R = between(0.01, 0.03), N = Math.round(L / R * 40), I = between(0.5, 3);
      rel(S.loopsSum(N, L, R, I, 0), S.finiteAxis(N, L, R, I, 0), 1e-3);
      rel(S.loopsSum(N, L, R, I, L / 4), S.finiteAxis(N, L, R, I, L / 4), 1e-3);
    }
  });

  test('solenoid: largo → μ₀nI en el centro y la mitad en el extremo', () => {
    for (let i = 0; i < 100; i++) {
      const L = between(0.2, 1), R = L / between(200, 2000), N = Math.round(between(100, 2000)), I = between(0.5, 5);
      rel(S.finiteAxis(N, L, R, I, 0), S.ideal(N / L, I), 1e-4);
      rel(S.finiteAxis(N, L, R, I, L / 2), S.ideal(N / L, I) / 2, 1e-3);
      rel(S.ideal(N / L, I), MU0 * N * I / L, 1e-12);
      rel(S.currentFor(S.ideal(N / L, I), N / L), I, 1e-12);
      rel(S.turnsFor(S.ideal(N / L, I), L, I), N, 1e-12);
    }
  });

  // Toroide: N vueltas distribuidas en ángulo; por el disco de radio r pasan (con signo) los tramos
  // interiores (r > a, hacia un lado) y los exteriores (r > b, hacia el otro). Se cuentan uno por uno.
  test('toroide: B·2πr = μ₀ I_enc con I_enc contado vuelta por vuelta', () => {
    for (let i = 0; i < 200; i++) {
      const N = Math.round(between(20, 800)), I = between(0.5, 4), a = between(0.02, 0.06), b = a + between(0.005, 0.05), r = between(0.002, b + 0.05);
      let enc = 0;
      for (let k = 0; k < N; k++) { if (r > a) enc += I; if (r > b) enc -= I; }
      rel(S.toroid(N, I, r, a, b) * 2 * Math.PI * r + 1e-30, MU0 * enc + 1e-30, 1e-9);
    }
    eq(S.toroid(100, 2, 0.01, 0.03, 0.05), 0);
    eq(S.toroid(100, 2, 0.08, 0.03, 0.05), 0);
  });

  test('solenoid: reto y diagnóstico', () => {
    const c = { kind: 'sol', N: 200, L: 25, I: 2, end: false }, m = S.mistakes(c);
    rel(S.truth(c), MU0 * 800 * 2 * 1000, 1e-12);
    eq(S.diagnose(c, S.truth(c)), 'ok');
    eq(S.diagnose(c, m.usedN), 'usedN');
    eq(S.diagnose(c, m.cm), 'cm');
    eq(S.diagnose(c, m.half), 'half');
    eq(S.diagnose({ kind: 'sol', N: 200, L: 25, I: 2, end: true }, S.truth(c)), 'half');
    const n = { kind: 'need', B: 3, N: 300, L: 20 }, mn = S.mistakes(n);
    rel(S.truth(n), 0.003 / (MU0 * 1500), 1e-12);
    eq(S.diagnose(n, mn.usedN), 'usedN'); eq(S.diagnose(n, mn.inverse), 'inverse');
    const t = { kind: 'tor', N: 400, I: 2, a: 4, b: 7, r: 5 }, mt = S.mistakes(t);
    eq(S.diagnose(t, S.truth(t)), 'ok'); eq(S.diagnose(t, mt.noTwoPi), 'noTwoPi'); eq(S.diagnose(t, mt.cm), 'cm');
    const o = { kind: 'tor', N: 400, I: 2, a: 4, b: 7, r: 8 };
    eq(S.truth(o), 0); eq(S.diagnose(o, 0), 'ok'); eq(S.diagnose(o, S.mistakes(o).outside), 'outside');
  });

  // Banco f3 S09: cada numérica trae oracle(v, LM).
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-3/bank/sesion-09.js');
  if (fs.existsSync(bankFile)) test('solenoid: banco f3 S09 contra LabMath (200 instancias por pregunta)', () => {
    const { loadData } = require('../lib/load');
    const W = loadData([path.join(ROOT, 'shared/js/labs/registry.js'), path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
    const Q = W.CB_BANK.f3.S09.questions;
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
