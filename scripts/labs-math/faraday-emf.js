// Pruebas de LabMath.faraday (lab faraday-emf, Física 3 · S11) con oráculos independientes:
// la fem de la barra como derivada numérica del flujo BLx(t) y como fuerza qvB por unidad de carga
// a lo largo de la barra; la fuerza como ILB y el balance F·v = I²R; el flujo de la bobina integrado
// en una malla polar sobre el disco y derivado por diferencias centrales; el diagnóstico del reto;
// y las numéricas del banco de S11 contra LabMath (oracle).
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const F = LM.faraday;
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-30), msg);
  let seed = 41;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = (lo, hi) => lo + (hi - lo) * rnd();
  // Flujo de un B uniforme (componente normal Bn) por un disco de radio a, sumando anillos y sectores.
  const diskFlux = (Bn, a) => {
    let s = 0;
    const nr = 200, nt = 64;
    for (let i = 0; i < nr; i++) {
      const r = (i + 0.5) * a / nr;
      for (let j = 0; j < nt; j++) s += Bn * r * (a / nr) * (2 * Math.PI / nt);
    }
    return s;
  };

  test('faraday: valores a mano', () => {
    const r = F.rail(0.5, 30, 2, 2);
    rel(r.emf, 0.3, 1e-12); rel(r.I, 0.15, 1e-12); rel(r.F, 0.0225, 1e-12);
    rel(F.flux(0.2, 0.01, 60), 0.001, 1e-12);
    rel(F.avgEmf(100, 2e-3, 0.1), 2, 1e-12);
    rel(F.chargeThrough(100, 2e-3, 4), 0.05, 1e-12);
    const c = F.coil('ramp', { N: 50, r: 5, th: 0, B0: 0.2, k: 0.4 }, 0.5);
    rel(c.emf, -50 * Math.PI * 0.0025 * 0.4, 1e-12);
  });

  test('faraday: la fem de la barra es dΦ/dt (derivada numérica) y la fuerza qvB por unidad de carga a lo largo de L', () => {
    for (let k = 0; k < 200; k++) {
      const B = pick(0.05, 2), Lcm = pick(5, 80), v = pick(0.1, 10), R = pick(0.2, 20), x0 = pick(0.05, 0.5), dt = 1e-4;
      const phi = (t) => B * (Lcm / 100) * (x0 + v * t);
      const r = F.rail(B, Lcm, v, R, x0);
      rel(r.emf, (phi(dt) - phi(-dt)) / (2 * dt), 1e-9, 'dΦ/dt');
      const q = 1.6e-19, work = q * v * B * (Lcm / 100);       // trabajo de la fuerza magnética-de-arrastre sobre q a lo largo de la barra
      rel(r.emf, work / q, 1e-12, 'qvB·L/q');
      rel(r.F, r.I * (Lcm / 100) * B, 1e-12, 'F = ILB');
      rel(r.F, B * B * Math.pow(Lcm / 100, 2) * v / R, 1e-12, 'F = B²L²v/R');
      rel(r.Pm, r.Pe, 1e-12, 'F·v = I²R');
      rel(r.phi, phi(0), 1e-12, 'Φ en x₀');
    }
  });

  test('faraday: bobina, flujo integrado en el disco y ε = −N dΦ/dt por diferencias centrales', () => {
    for (let k = 0; k < 60; k++) {
      const kind = k % 2 ? 'sine' : 'ramp';
      const p = { N: Math.round(pick(1, 200)), r: pick(1, 10), th: pick(0, 85), B0: pick(0, 1), k: pick(-1, 1), Bm: pick(0.05, 0.5), f: pick(1, 10) };
      const t = pick(0, 1), h = 1e-5, a = p.r / 100, cs = Math.cos(p.th * Math.PI / 180);
      const Bat = (tt) => (kind === 'sine' ? p.Bm * Math.sin(2 * Math.PI * p.f * tt) : p.B0 + p.k * tt);
      const phi = (tt) => diskFlux(Bat(tt) * cs, a);
      const c = F.coil(kind, p, t);
      rel(c.phi, phi(t), 1e-6, 'Φ por vuelta');
      rel(c.link, p.N * phi(t), 1e-6, 'NΦ');
      const num = -p.N * (phi(t + h) - phi(t - h)) / (2 * h);
      near(c.emf, num, 1e-5 * Math.max(1e-3, Math.abs(num)) + 1e-9, `ε ${kind}`);
    }
  });

  test('faraday: el diagnóstico reconoce cada error típico', () => {
    const cases = [
      ['emf', 'rail', { B: 0.5, L: 30, v: 2, R: 2 }],
      ['I', 'rail', { B: 0.8, L: 25, v: 3, R: 1.5 }],
      ['F', 'rail', { B: 0.6, L: 40, v: 4, R: 2.5 }],
      ['emf', 'coil', { kind: 'ramp', N: 80, r: 4, th: 30, B0: 0.2, k: 0.5, t: 0.4 }],
      ['emf', 'coil', { kind: 'sine', N: 60, r: 5, th: 20, Bm: 0.2, f: 3, t: 0.03 }]
    ];
    cases.forEach(([k, m, p]) => {
      const r = F.answers(k, m, p);
      eq(F.diagnose(k, m, p, r.truth), 'ok', `${k} ${m}`);
      eq(F.diagnose(k, m, p, r.truth * 1.004), 'ok', `${k} ${m} redondeado`);
      let seen = 0;
      Object.keys(r).filter((x) => x !== 'truth').forEach((mk) => {
        if (!isFinite(r[mk]) || Math.abs(r[mk] - r.truth) <= 0.02 * Math.abs(r.truth)) return;
        seen++;
        eq(F.diagnose(k, m, p, r[mk]), mk, `${k} ${m} ${mk}`);
      });
      if (seen < 1) throw new Error(`${k} ${m}: ningún error distinguible`);
      eq(F.diagnose(k, m, p, r.truth * 3.7), 'bad');
      eq(F.diagnose(k, m, p, NaN), 'bad');
    });
  });

  // Banco f3 S11: cada numérica trae oracle(v, LM), que recalcula con LabMath por otro camino.
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-3/bank/sesion-11.js');
  if (fs.existsSync(bankFile)) test('faraday: banco f3 S11 contra LabMath (200 instancias por pregunta)', () => {
    const { loadData } = require('../lib/load');
    const W = loadData([path.join(ROOT, 'shared/js/labs/registry.js'), path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
    const Q = W.CB_BANK.f3.S11.questions;
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
