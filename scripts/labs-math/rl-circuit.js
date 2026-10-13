// Pruebas de LabMath.rl (lab rl-circuit, Física 3 · S14) con oráculos independientes:
// el RK4 propio contra la solución analítica en crecimiento y decaimiento; la malla V_R + V_L = ε
// y V_L = L dI/dt por derivada numérica; I(τ)/I_f = 1 − 1/e; el balance de energía de la batería
// (Simpson de εI) = ½LI² + calor (Simpson de I²R); en el decaimiento todo ½LI₀² termina en R;
// el tiempo para una corriente por bisección sobre el RK4; el juego Ω–mH–ms contra SI;
// el diagnóstico del reto y las numéricas del banco de S14.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const O = LM.rl;
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-30), msg);
  let seed = 37;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = (lo, hi) => lo + (hi - lo) * rnd();
  const simpson = (f, a, b, n) => {
    const hh = (b - a) / n;
    let s = f(a) + f(b);
    for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * hh);
    return s * hh / 3;
  };

  test('rl: valores a mano', () => {
    // 200 mH y 50 Ω: τ = 4 ms; con 12 V, I_f = 0.24 A.
    rel(O.tau(200, 50), 4, 1e-12);
    const s = O.grow(200, 50, 12, 4);
    rel(s.If, 0.24, 1e-12); rel(s.I, 0.24 * (1 - Math.exp(-1)), 1e-12); rel(s.VL, 12 * Math.exp(-1), 1e-12);
    rel(O.timeTo('c', 200, 50, 12, 0.12), 4 * Math.LN2, 1e-12);
    rel(O.timeTo('d', 200, 50, 12, 0.12), 4 * Math.LN2, 1e-12);
    rel(O.stored(200, 50, 12), 0.5 * 200 * 0.24 * 0.24, 1e-12);
  });

  test('rl: RK4 propio contra la solución analítica (crecimiento y decaimiento)', () => {
    for (let t = 0; t < 120; t++) {
      const R = pick(1, 500), L = pick(1e-3, 2), eps = pick(1, 48), T = L / R, tt = pick(0.05, 6) * T;
      ['c', 'd'].forEach((m) => {
        const a = O.state(m, L, R, eps, tt), r = O.rk4(m, L, R, eps, tt, 2000);
        rel(r.I, a.I, 1e-9, `${m} I`);
        rel(r.UL, a.UL, 1e-8, `${m} ½LI²`);
        rel(r.Wr, a.Ur, 1e-8, `${m} calor`);
        if (m === 'c') rel(r.Wbat, a.Ubat, 1e-8, 'energía de la batería');
      });
    }
  });

  test('rl: la malla V_R + V_L = ε y V_L = L dI/dt (derivada numérica)', () => {
    for (let t = 0; t < 200; t++) {
      const R = pick(1, 500), L = pick(1e-3, 2), eps = pick(1, 48), T = L / R, tt = pick(0.01, 6) * T, h = 1e-6 * T;
      const c = O.grow(L, R, eps, tt), d = O.decay(L, R, eps, tt);
      rel(c.VR + c.VL, eps, 1e-12, 'malla al crecer');
      rel(d.VR + d.VL, 0, 1e-12 * eps + 1e-15, 'malla al decaer');
      const dI = (O.grow(L, R, eps, tt + h).I - O.grow(L, R, eps, tt - h).I) / (2 * h);
      rel(c.VL, L * dI, 1e-6, 'V_L = L dI/dt');
      rel(c.dIdt, dI, 1e-6, 'dI/dt');
      const dd = (O.decay(L, R, eps, tt + h).I - O.decay(L, R, eps, tt - h).I) / (2 * h);
      rel(d.VL, L * dd, 1e-6, 'V_L al decaer');
    }
  });

  test('rl: I(τ) = 63 % de I_f, y la energía: batería = ½LI² + calor (Simpson)', () => {
    for (let t = 0; t < 40; t++) {
      const R = pick(1, 500), L = pick(1e-3, 2), eps = pick(1, 48), T = L / R, tt = pick(0.5, 8) * T;
      rel(O.grow(L, R, eps, T).I / (eps / R), 1 - 1 / Math.E, 1e-12);
      rel(O.decay(L, R, eps, T).I / (eps / R), 1 / Math.E, 1e-12);
      const bat = simpson((x) => eps * O.grow(L, R, eps, x).I, 0, tt, 4000);
      const heat = simpson((x) => { const i = O.grow(L, R, eps, x).I; return i * i * R; }, 0, tt, 4000);
      rel(bat, O.grow(L, R, eps, tt).UL + heat, 1e-9, 'balance');
      rel(simpson((x) => { const i = O.decay(L, R, eps, x).I; return i * i * R; }, 0, 40 * T, 8000), O.stored(L, R, eps), 1e-9, 'decaimiento completo');
    }
  });

  test('rl: tiempo para una corriente contra bisección sobre el RK4', () => {
    for (let t = 0; t < 40; t++) {
      const R = pick(10, 200), L = pick(10, 1000), eps = pick(2, 24), I = pick(0.05, 0.95) * eps / R, T = L / R;
      ['c', 'd'].forEach((m) => {
        let lo = 0, hi = 20 * T;
        const up = m === 'c';
        for (let k = 0; k < 60; k++) {
          const mid = (lo + hi) / 2, i = O.rk4(m, L, R, eps, mid, 2000).I;
          if ((i < I) === up) lo = mid; else hi = mid;
        }
        rel(O.timeTo(m, L, R, eps, I), (lo + hi) / 2, 1e-7, `${m} I=${I}`);
      });
    }
  });

  test('rl: Ω, mH y ms son un juego coherente con SI', () => {
    for (let t = 0; t < 50; t++) {
      const R = pick(10, 200), Lm = pick(10, 1000), eps = pick(1, 24), tms = pick(0, 5) * Lm / R;
      const a = O.grow(Lm, R, eps, tms), b = O.grow(Lm * 1e-3, R, eps, tms * 1e-3);
      rel(a.tau * 1e-3, b.tau, 1e-12, 'τ en ms');
      rel(a.I, b.I, 1e-12, 'I en A');
      rel(a.UL * 1e-3, b.UL, 1e-12, 'energía en mJ');
      rel(a.VL, b.VL, 1e-12, 'V_L en V');
    }
  });

  test('rl: el diagnóstico reconoce cada error típico', () => {
    const cases = [
      ['tau', 'c', { R: 50, L: 200, eps: 12, t: 4, I: 0.1 }],
      ['I', 'c', { R: 40, L: 300, eps: 9, t: 6, I: 0.1 }],
      ['I', 'd', { R: 60, L: 500, eps: 12, t: 12, I: 0.1 }],
      ['VL', 'c', { R: 30, L: 150, eps: 24, t: 4, I: 0.1 }],
      ['VL', 'd', { R: 80, L: 400, eps: 6, t: 7, I: 0.1 }],
      ['tI', 'c', { R: 50, L: 200, eps: 12, t: 0, I: 0.18 }],
      ['tI', 'd', { R: 20, L: 600, eps: 10, t: 0, I: 0.1 }]
    ];
    cases.forEach(([k, m, p]) => {
      const r = O.answers(k, m, p), keys = Object.keys(r).filter((x) => x !== 'truth');
      eq(O.diagnose(k, m, p, r.truth), 'ok', `${k} ${m}`);
      eq(O.diagnose(k, m, p, r.truth * 1.004), 'ok', `${k} ${m} redondeado`);
      let seen = 0;
      keys.forEach((mk, i) => {
        if (!isFinite(r[mk]) || Math.abs(r[mk] - r.truth) <= 0.02 * Math.abs(r.truth)) return;
        if (keys.slice(0, i).some((pk) => Math.abs(r[pk] - r[mk]) <= 0.01 * Math.abs(r[mk]))) return;   // lo atrapa uno anterior
        seen++;
        eq(O.diagnose(k, m, p, r[mk]), mk, `${k} ${m} ${mk}`);
      });
      if (seen < 2) throw new Error(`${k} ${m}: muy pocos errores distinguibles`);
      eq(O.diagnose(k, m, p, r.truth * 3.7), 'bad', `${k} ${m} otro`);
      eq(O.diagnose(k, m, p, NaN), 'bad');
    });
  });

  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-3/bank/sesion-14.js');
  if (fs.existsSync(bankFile)) test('rl: banco f3 S14 contra LabMath (200 instancias por pregunta)', () => {
    const { loadData } = require('../lib/load');
    const W = loadData([path.join(ROOT, 'shared/js/labs/registry.js'), path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
    const Q = W.CB_BANK.f3.S14.questions;
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
