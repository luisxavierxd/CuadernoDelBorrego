// Pruebas de LabMath.menergy (lab magnetic-energy, Física 3 · S15) con oráculos independientes:
// la energía del solenoide como suma de u = B²/2μ₀ sobre una malla 3D de cubitos dentro del cilindro;
// la del toroide con Simpson en r (sin logaritmos) y su L por el flujo de la sección (NΦ/I);
// la integral por capas del lab que converge a ½LI²; el coaxial por Simpson; la corriente para
// guardar U de ida y vuelta; el LC (ω²LC = 1); el diagnóstico y el banco de S15.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const E = LM.menergy, MU0 = 4 * Math.PI * 1e-7;
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-30), msg);
  let seed = 79;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = (lo, hi) => lo + (hi - lo) * rnd();
  const simpson = (f, a, b, n) => {
    const hh = (b - a) / n;
    let s = f(a) + f(b);
    for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * hh);
    return s * hh / 3;
  };

  test('menergy: valores a mano', () => {
    // 500 vueltas, r = 2 cm, ℓ = 20 cm, 3 A: B = μ₀·2500·3, L = μ₀·250000·π·4e-4/0.2.
    const s = E.solenoid(500, 2, 20, 3);
    rel(s.B, MU0 * 2500 * 3, 1e-12); rel(s.L, MU0 * 250000 * Math.PI * 4e-4 / 0.2, 1e-12);
    rel(s.UL, 0.5 * s.L * 9, 1e-12); rel(s.Uu, s.UL, 1e-12);
    rel(E.density(1), 1 / (2 * MU0), 1e-12);
    rel(E.currentFor(0.5, 0.25), 2, 1e-12);
  });

  test('menergy: solenoide, u sumada en una malla 3D de cubitos = ½LI²', () => {
    for (let k = 0; k < 6; k++) {
      const N = Math.round(pick(100, 2000)), r = pick(0.5, 4), l = pick(5, 50), I = pick(0.5, 10), s = E.solenoid(N, r, l, I);
      const R = r / 100, n = 160, d = 2 * R / n;
      let cells = 0;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = -R + (i + 0.5) * d, y = -R + (j + 0.5) * d; if (x * x + y * y <= R * R) cells++; }
      const U = (s.B * s.B / (2 * MU0)) * cells * d * d * (l / 100);
      rel(U, s.UL, 4e-3, `N=${N} r=${r}`);
    }
  });

  test('menergy: toroide con Simpson en r y L = NΦ/I por el flujo de la sección', () => {
    for (let k = 0; k < 60; k++) {
      const N = Math.round(pick(100, 2000)), a = pick(2, 10), b = a + pick(1, 10), h = pick(1, 10), I = pick(0.5, 10), t = E.toroid(N, a, b, h, I);
      const U = simpson((r) => { const B = MU0 * N * I / (2 * Math.PI * r); return B * B / (2 * MU0) * 2 * Math.PI * r * (h / 100); }, a / 100, b / 100, 2000);
      rel(t.UL, U, 1e-9, 'U toroide');
      const Phi = simpson((r) => MU0 * N * I / (2 * Math.PI * r) * (h / 100), a / 100, b / 100, 2000);
      rel(t.L, N * Phi / I, 1e-9, 'L = NΦ/I');
      // La integral por capas del lab converge a ½LI².
      rel(E.integrate('toroid', { N, a, b, h, I }, 4000), t.UL, 1e-6, 'capas toroide');
      rel(E.integrate('sol', { N, r: a, l: h * 5, I }, 3), E.solenoid(N, a, h * 5, I).UL, 1e-12, 'capas solenoide');
      // Con B del radio medio se sobrestima o subestima: nunca coincide salvo b → a.
      if (b / a > 1.5 && Math.abs(E.density(t.Bm) * t.V / t.UL - 1) < 0.01) throw new Error('el campo medio no debería coincidir');
    }
  });

  test('menergy: coaxial por unidad de largo (Simpson)', () => {
    for (let k = 0; k < 40; k++) {
      const I = pick(0.5, 20), a = pick(0.5, 3) / 1000, b = a * pick(1.5, 10), c = E.coax(I, a, b);
      const U = simpson((r) => { const B = MU0 * I / (2 * Math.PI * r); return B * B / (2 * MU0) * 2 * Math.PI * r; }, a, b, 2000);
      rel(c.Ul, U, 1e-9, 'U/ℓ'); rel(c.Ul, 0.5 * c.Ll * I * I, 1e-12, '½(L/ℓ)I²');
    }
  });

  test('menergy: corriente para U (ida y vuelta) y circuito LC', () => {
    for (let k = 0; k < 100; k++) {
      const L = pick(1e-3, 2), U = pick(1e-4, 5), I = E.currentFor(U, L);
      rel(0.5 * L * I * I, U, 1e-12);
      const C = pick(1e-9, 1e-3), o = E.lc(L, C);
      rel(o.omega * o.omega * L * C, 1, 1e-12); rel(o.f * o.T, 1, 1e-12);
    }
  });

  test('menergy: el diagnóstico reconoce cada error típico', () => {
    const cases = [
      ['U', { kind: 'sol', N: 500, r: 2, l: 20, I: 3 }],
      ['U', { kind: 'toroid', N: 800, a: 3, b: 9, h: 2, I: 4 }],
      ['u', { kind: 'sol', N: 600, r: 1, l: 15, I: 5 }],
      ['u', { kind: 'toroid', N: 400, a: 4, b: 8, h: 3, I: 2 }],
      ['I', { kind: 'sol', N: 1000, r: 2, l: 20, I: 1, Ut: 50 }],
      ['I', { kind: 'toroid', N: 700, a: 5, b: 10, h: 4, I: 1, Ut: 20 }]
    ];
    cases.forEach(([k, p]) => {
      const r = E.answers(k, p);
      eq(E.diagnose(k, p, r.truth), 'ok', k);
      eq(E.diagnose(k, p, r.truth * 1.004), 'ok', k + ' redondeado');
      let seen = 0;
      Object.keys(r).filter((x) => x !== 'truth').forEach((mk) => {
        if (!isFinite(r[mk]) || Math.abs(r[mk] - r.truth) <= 0.02 * Math.abs(r.truth)) return;
        seen++;
        eq(E.diagnose(k, p, r[mk]), mk, `${k} ${p.kind} ${mk}`);
      });
      if (seen < 2) throw new Error(`${k}: muy pocos errores distinguibles`);
      eq(E.diagnose(k, p, r.truth * 3.7), 'bad');
      eq(E.diagnose(k, p, NaN), 'bad');
    });
  });

  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-3/bank/sesion-15.js');
  if (fs.existsSync(bankFile)) test('menergy: banco f3 S15 contra LabMath (200 instancias por pregunta)', () => {
    const { loadData } = require('../lib/load');
    const W = loadData([path.join(ROOT, 'shared/js/labs/registry.js'), path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
    const Q = W.CB_BANK.f3.S15.questions;
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
