// Pruebas de LabMath.lenz (lab lenz-direction, Física 3 · S12) con oráculos independientes:
// la tabla de la ley de Lenz escrita a mano (crece/decrece × sale/entra → sentido), el tamaño de la
// fem del imán con la derivada analítica del flujo de un dipolo en su eje, la espira que cruza el borde
// (εmf = B·a·v mientras cruza y cero adentro), la circulación del campo eléctrico inducido contra
// πr²·dB/dt, el generador contra la derivada numérica de NBA cos ωt; el diagnóstico; y el banco de S12.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const L = LM.lenz;
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-30), msg);
  let seed = 53;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = (lo, hi) => lo + (hi - lo) * rnd();

  test('lenz: tabla a mano para el campo uniforme (sale/entra × crece/decrece)', () => {
    // Campo que sale y crece: el inducido entra → horaria. Sale y decrece: sale → antihoraria.
    const T = { '1,1': ['cw', 'in'], '1,-1': ['ccw', 'out'], '-1,1': ['ccw', 'out'], '-1,-1': ['cw', 'in'] };
    [1, -1].forEach((dir) => [1, -1].forEach((change) => {
      const p = { a: 5, dir, change, B0: change > 0 ? 0.1 : 0.5, k: 0.4 };
      const r = L.induced('field', p, 0.3), want = T[dir + ',' + change];
      eq(r.current, want[0], `field ${dir} ${change}`); eq(r.Bind, want[1]);
      eq(r.Bext, dir > 0 ? 'out' : 'in');
      eq(r.change, change > 0 ? 'up' : 'down');
      // Tamaño: A·k.
      rel(Math.abs(r.emf), Math.PI * 0.0025 * 0.4, 1e-6, 'ε = A·dB/dt');
    }));
  });

  test('lenz: imán detrás de la página, con la fem analítica del flujo de un dipolo en su eje', () => {
    for (let k = 0; k < 80; k++) {
      const pole = rnd() < 0.5 ? 1 : -1, move = rnd() < 0.5 ? 1 : -1;
      const p = { a: pick(2, 8), pole, move, d0: pick(6, 12), v: pick(2, 8), m: pick(100, 500) };
      const t = pick(0.05, 0.6), r = L.induced('magnet', p, t);
      // Al acercarse |Φ| crece; el inducido se opone: contrario al externo. Al alejarse, igual al externo.
      const ext = pole > 0 ? 'out' : 'in', opp = ext === 'out' ? 'in' : 'out';
      eq(r.Bext, ext); eq(r.Bind, move > 0 ? opp : ext, `pole ${pole} move ${move}`);
      eq(r.current, r.Bind === 'out' ? 'ccw' : 'cw');
      // Φ = μ m π a²/(a² + d²)^{3/2} (con μ incluido en m) → dΦ/dt = 3 m π a² d (a² + d²)^{−5/2} · (−dd/dt), dd/dt = −move·v.
      const a = p.a / 100, d = (p.d0 - move * p.v * t) / 100, m = p.m * 1e-6, v = p.v / 100;
      const want = pole * 3 * m * Math.PI * a * a * d * Math.pow(a * a + d * d, -2.5) * move * v;
      rel(r.dphi, want, 1e-5, 'dΦ/dt');
    }
  });

  test('lenz: espira cuadrada que cruza el borde de la región (ε = B·a·v solo mientras cruza)', () => {
    [1, -1].forEach((dir) => [1, -1].forEach((side) => {
      const p = { a: 6, dir, side, B0: 0.4, x0: side > 0 ? -3 : 9, v: 12 };
      // Entra: el frente está en x0 + v t; cruza mientras 0 < frente < a.
      [0.1, 0.4, 0.7, 0.95].forEach((t) => {
        const front = p.x0 + side * p.v * t, crossing = front > 0.2 && front < p.a - 0.2;
        const r = L.induced('slide', p, t);
        if (crossing) {
          rel(Math.abs(r.emf), p.B0 * (p.a / 100) * (p.v / 100), 1e-6, `|ε| dir ${dir} side ${side} t ${t}`);
          const want = (side > 0) === (dir > 0) ? 'cw' : 'ccw';     // entra con campo que sale: Φ crece hacia +, inducido entra
          eq(r.current, want, `sentido dir ${dir} side ${side}`);
        } else if (front > p.a + 0.2 || front < -0.2) eq(r.current, 'none', `fuera del borde t ${t}`);
      });
    }));
  });

  test('lenz: campo eléctrico inducido, E·2πr = π·min(r, R)²·|dB/dt|', () => {
    for (let k = 0; k < 200; k++) {
      const R = pick(1, 20), r = pick(0.1, 40), dB = pick(-5, 5);
      rel(L.Einduced(r, R, dB) * 2 * Math.PI * r, L.regionEmf(r, R, dB), 1e-12);
      rel(L.regionEmf(r, R, dB), Math.PI * Math.pow(Math.min(r, R), 2) * Math.abs(dB), 1e-12);
    }
    // Continuo en r = R y máximo ahí.
    rel(L.Einduced(5, 5, 2), 5, 1e-12);
    if (!(L.Einduced(4.9, 5, 2) < 5 && L.Einduced(5.1, 5, 2) < 5)) throw new Error('E es máximo en r = R');
  });

  test('lenz: generador contra la derivada numérica de NBA cos ωt', () => {
    for (let k = 0; k < 100; k++) {
      const N = Math.round(pick(1, 500)), B = pick(0.05, 1), A = pick(1e-4, 0.05), w = pick(1, 400), t = pick(0, 0.2), h = 1e-6;
      const lam = (x) => N * B * A * Math.cos(w * x);
      const g = L.generator(N, B, A, w, t);
      near(g.emf, -(lam(t + h) - lam(t - h)) / (2 * h), 1e-6 * g.peak, 'ε = −d(NΦ)/dt');
      rel(g.peak, N * B * A * w, 1e-12); rel(g.f * g.T, 1, 1e-12); rel(g.rms * Math.SQRT2, g.peak, 1e-12);
    }
    rel(L.rpm2omega(60), 2 * Math.PI, 1e-12);
    rel(L.rpm2omega(3600), 120 * Math.PI, 1e-12);
  });

  test('lenz: el diagnóstico', () => {
    const up = { current: 'cw', Bind: 'in', Bext: 'out', change: 'up' }, down = { current: 'ccw', Bind: 'out', Bext: 'out', change: 'down' };
    eq(L.diagnose(up, { current: 'cw', Bind: 'in' }), 'ok');
    eq(L.diagnose(up, { current: 'ccw', Bind: 'out' }), 'followB');
    eq(L.diagnose(down, { current: 'cw', Bind: 'in' }), 'opposeB');
    eq(L.diagnose(up, { current: 'ccw', Bind: 'in' }), 'rhr');
    eq(L.diagnose(up, { current: 'none', Bind: 'none' }), 'noneWrong');
    eq(L.diagnose({ current: 'none', Bind: 'none', Bext: 'out' }, { current: 'cw', Bind: 'in' }), 'noChange');
    eq(L.diagnose({ current: 'none', Bind: 'none', Bext: 'out' }, { current: 'none', Bind: 'none' }), 'ok');
    eq(L.diagnose(up, null), 'bad');
  });

  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-3/bank/sesion-12.js');
  if (fs.existsSync(bankFile)) test('lenz: banco f3 S12 contra LabMath (200 instancias por pregunta)', () => {
    const { loadData } = require('../lib/load');
    const W = loadData([path.join(ROOT, 'shared/js/labs/registry.js'), path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
    const Q = W.CB_BANK.f3.S12.questions;
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
