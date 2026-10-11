// Pruebas de LabMath.induction (Física 2 · S01) con oráculos independientes, y de las
// respuestas numéricas del banco f2 S01 contra esos mismos oráculos.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const I = LM.induction;
  const e = 1.60e-19;

  test('induction: n = |Q|/e ida y vuelta con charge(n)', () => {
    for (const n of [1, 7, 1234, 6.25e9, 3e10]) {
      near(I.count(I.charge(n, -1)), n, 1e-9 * n);
      near(I.count(I.charge(n, 1)), n, 1e-9 * n);
    }
    near(I.count(-4.8e-9), 3e10, 1);
  });

  test('induction: isMultiple distingue múltiplos de e', () => {
    eq(I.isMultiple(3 * e), true); eq(I.isMultiple(2.5 * e), false); eq(I.isMultiple(0.5 * e), false);
    eq(I.isMultiple(-7 * e), true);
  });

  test('induction: frotar conserva la carga y la masa es n·mₑ', () => {
    const r = I.rub(5e10);
    near(r.total, 0, 1e-24); near(r.gainer, -8e-9, 1e-20); near(r.mass, 5e10 * 9.11e-31, 1e-30);
  });

  // Oráculo: aritmética exacta en enteros (cargas × 2^k) para secuencias de contactos.
  test('induction: contactSeq contra aritmética racional exacta y conservación', () => {
    let seed = 7;
    const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    for (let t = 0; t < 300; t++) {
      const k = 3 + Math.floor(rnd() * 3);
      const qs = Array.from({ length: k }, () => Math.round(rnd() * 24 - 12));
      const pairs = Array.from({ length: 1 + Math.floor(rnd() * 5) }, () => {
        const i = Math.floor(rnd() * k); let j = Math.floor(rnd() * (k - 1)); if (j >= i) j++; return [i, j];
      });
      const S = 2 ** pairs.length;                      // escala para que todo sea entero
      const ex = qs.map((q) => BigInt(q) * BigInt(S));
      pairs.forEach(([i, j]) => { const m = (ex[i] + ex[j]) / 2n; ex[i] = m; ex[j] = m; });
      const got = I.contactSeq(qs, pairs);
      got.forEach((g, i) => near(g, Number(ex[i]) / S, 1e-12));
      near(got.reduce((a, b) => a + b, 0), qs.reduce((a, b) => a + b, 0), 1e-9);
    }
    const all = I.contactAll([6, -2, 5]); all.forEach((x) => near(x, 3, 1e-12));
  });

  // Oráculo físico: con la carga imagen q' = −q·a/d en b = a²/d, el potencial de la esfera aterrizada es 0.
  test('induction: Q = −q·a/d deja la superficie a potencial cero (carga imagen)', () => {
    for (const [q, a, d] of [[8e-9, 6, 15], [-5e-9, 0.1, 0.3], [1, 2, 9]]) {
      const qi = I.induced(q, a, d), b = a * a / d;
      for (let k = 0; k < 24; k++) {
        const th = 2 * Math.PI * k / 24, x = a * Math.cos(th), y = a * Math.sin(th);
        const V = q / Math.hypot(x + d, y) + qi / Math.hypot(x + b, y);   // barra en x = −d
        near(V, 0, 1e-9 * Math.abs(q / a));
      }
    }
  });

  test('induction: secuencias de inducción', () => {
    const base = { q0: 0, qRod: 8e-9, a: 6, d: 15 };
    const A = I.sequence(Object.assign({}, base, { steps: ['near', 'ground', 'unground', 'remove'] }));
    near(A.Q, -3.2e-9, 1e-18); eq(A.sign, -1); near(A.n, 2e10, 1e2);
    eq(I.sequence(Object.assign({}, base, { steps: ['near', 'ground', 'remove', 'unground'] })).sign, 0);
    eq(I.sequence(Object.assign({}, base, { steps: ['near', 'remove'] })).sign, 0);
    eq(I.sequence(Object.assign({}, base, { qRod: -8e-9, steps: ['ground', 'near', 'unground', 'remove'] })).sign, 1);
    // Una esfera con carga previa: la tierra impone el mismo valor; lo que pasó por el cable es la diferencia.
    const P = I.sequence(Object.assign({}, base, { q0: 5e-9, steps: ['near', 'ground', 'unground', 'remove'] }));
    near(P.Q, -3.2e-9, 1e-18); near(P.moved, 8.2e-9 / e, 1e2);
  });

  test('induction: diagnóstico del reto', () => {
    const A = I.sequence({ q0: 0, qRod: 8e-9, a: 6, d: 15, steps: ['near', 'ground', 'unground', 'remove'] });
    const B = I.sequence({ q0: 0, qRod: 8e-9, a: 6, d: 15, steps: ['near', 'ground', 'remove', 'unground'] });
    const C = I.sequence({ q0: 0, qRod: 8e-9, a: 6, d: 15, steps: ['near', 'remove'] });
    eq(I.diagnose(A, { sign: -1, n: 2e10 }), 'ok');
    eq(I.diagnose(A, { sign: -1, n: 2.01e10 }), 'ok');
    eq(I.diagnose(A, { sign: 1, n: 2e10 }), 'signFlip');
    eq(I.diagnose(A, { sign: 0, n: 0 }), 'forgotGround');
    eq(I.diagnose(A, { sign: -1, n: 3.2e-9 }), 'chargeNotCount');
    eq(I.diagnose(A, { sign: -1, n: 3.2 }), 'chargeNotCount');
    eq(I.diagnose(A, { sign: -1, n: 3.2e-9 * e }), 'timesE');
    eq(I.diagnose(A, { sign: -1, n: 2e19 }), 'prefix');
    eq(I.diagnose(A, { sign: -1, n: 7e10 }), 'countOff');
    eq(I.diagnose(B, { sign: 0, n: 0 }), 'ok');
    eq(I.diagnose(B, { sign: -1, n: 2e10 }), 'groundReturned');
    eq(I.diagnose(C, { sign: -1, n: 2e10 }), 'noGround');
    eq(I.diagnose(C, { sign: 0, n: 5 }), 'neutralCount');
  });

  // Banco f2 S01: cada numérica trae oracle(v, LM), que recalcula con LabMath por otro camino.
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-2/bank/sesion-01.js');
  if (fs.existsSync(bankFile)) test('induction: banco f2 S01 contra LabMath (200 instancias por pregunta)', () => {
    const { loadData } = require('../lib/load');
    const W = loadData([path.join(ROOT, 'shared/js/labs/registry.js'), path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
    const Q = W.CB_BANK.f2.S01.questions;
    let seed = 99;
    const rand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    const missing = Q.filter((q) => q.type === 'numeric' && typeof q.oracle !== 'function').map((q) => q.id);
    if (missing.length) throw new Error('numéricas sin oracle: ' + missing.join(', '));
    Q.filter((q) => q.type === 'numeric').forEach((q) => {
      for (let i = 0; i < 200; i++) {
        const v = W.CBExercises.instance(q, rand), a = q.answer(v), o = q.oracle(v, LM);
        // 1e-6 relativo: el área de ma-densidad se integra con anillos (error de cuadratura ~1e-8).
        if (!(Math.abs(a - o) <= 1e-6 * Math.max(1e-30, Math.abs(o)) + 1e-30)) throw new Error(`${q.id} ${JSON.stringify(v)}: banco ${a}, LabMath ${o}`);
      }
    });
  });
};
