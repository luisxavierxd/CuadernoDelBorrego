// Pruebas de LabMath.orbit (lab cyclotron-orbit, Física 3 · S03), con oráculos independientes:
// un integrador RK4 propio de m dv/dt = q(E + v × B) contra r = mv/|q|B y T = 2πm/|q|B, la conservación
// de la rapidez en B puro, el selector (trayectoria recta con v = E/B), el espectrómetro por energía,
// el ciclotrón por la cadena de medias vueltas y la hélice. Revisa también el banco f3 S03.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const O = LM.orbit;
  const E = 1.60e-19, MP = 1.67e-27, ME = 9.11e-31, U = 1.66e-27;
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const rand = rng(303);
  const between = (a, b) => a + (b - a) * rand();
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  // RK4 propio sobre (x, v), independiente del integrador de Boris del lab.
  function rk4(m, q, x0, v0, B, Ef, dt, n) {
    let s = x0.concat(v0);
    const f = (y) => { const v = y.slice(3), c = cross(v, B); return v.concat([0, 1, 2].map((i) => q / m * (Ef[i] + c[i]))); };
    const add = (a, b, k) => a.map((x, i) => x + k * b[i]);
    const out = [s.slice()];
    for (let i = 0; i < n; i++) {
      const k1 = f(s), k2 = f(add(s, k1, dt / 2)), k3 = f(add(s, k2, dt / 2)), k4 = f(add(s, k3, dt));
      s = s.map((x, j) => x + dt / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
      out.push(s.slice());
    }
    return out;
  }

  test('orbit: r = mv/|q|B y T = 2πm/|q|B contra un RK4 propio (protón, electrón, alfa)', () => {
    for (let i = 0; i < 30; i++) {
      const P = [{ m: MP, q: E }, { m: ME, q: -E }, { m: 4 * U, q: 2 * E }][i % 3];
      const v = between(1e5, 1e7), B = between(0.01, 1);
      const r = O.radius(P.m, P.q, v, B), T = O.period(P.m, P.q, B);
      const s = rk4(P.m, P.q, [0, 0, 0], [v, 0, 0], [0, 0, -B], [0, 0, 0], T / 2000, 2000);
      // Radio: la mitad de la extensión en y; periodo: vuelve al origen tras T.
      const ys = s.map((y) => y[1]);
      near((Math.max(...ys) - Math.min(...ys)) / 2, r, 1e-5 * r);
      const last = s[s.length - 1];
      near(Math.hypot(last[0], last[1]), 0, 1e-5 * r);
      near(O.freq(P.m, P.q, B) * T, 1, 1e-12); near(O.omega(P.m, P.q, B) * T, 2 * Math.PI, 1e-12);
    }
  });

  test('orbit: Boris conserva la rapidez y cierra la órbita; el centro está del lado de la fuerza', () => {
    for (let i = 0; i < 40; i++) {
      const q = rand() < 0.5 ? E : -E, m = q > 0 ? MP : ME, v = between(1e5, 1e7), Bz = (rand() < 0.5 ? 1 : -1) * between(0.01, 1);
      const sim = O.orbit(m, q, v, Bz, 600), r = O.radius(m, q, v, Math.abs(Bz));
      sim.vs.forEach((u) => near(Math.hypot(u[0], u[1], u[2]), v, 1e-9 * v));
      const C = O.center(m, q, v, Bz);
      sim.pts.forEach((p) => near(Math.hypot(p[0] - C[0], p[1] - C[1]), r, 1e-4 * r));
      // F en el origen: q v x̂ × Bz ẑ = −q v Bz ŷ; el centro tiene el signo de −q·Bz.
      eq(Math.sign(C[1]), Math.sign(-q * Bz));
    }
  });

  test('orbit: el periodo no depende de la rapidez', () => {
    const T1 = O.period(MP, E, 0.5);
    for (const v of [1e4, 1e5, 1e6, 1e7]) {
      const s = rk4(MP, E, [0, 0, 0], [v, 0, 0], [0, 0, 0.5], [0, 0, 0], T1 / 1000, 1000);
      const last = s[s.length - 1];
      near(Math.hypot(last[0], last[1]), 0, 1e-6 * O.radius(MP, E, v, 0.5));
    }
  });

  test('orbit: selector, recto con v = E/B y desviado con otra rapidez (RK4 propio)', () => {
    for (let i = 0; i < 30; i++) {
      const Ef = between(1e3, 1e5), B = between(0.05, 1), v = O.selector(Ef, B);
      // E en −y, B en −z: eE hacia −y y evB hacia +y.
      const s = rk4(MP, E, [0, 0, 0], [v, 0, 0], [0, 0, -B], [0, -Ef, 0], 1e-3 / v, 100);
      s.forEach((y) => near(y[1], 0, 1e-6));
      const T = O.period(MP, E, B), fast = rk4(MP, E, [0, 0, 0], [1.3 * v, 0, 0], [0, 0, -B], [0, -Ef, 0], T / 1000, 100);
      if (!(fast[100][1] > 0)) throw new Error('la más rápida debe desviarse hacia la magnética');
    }
  });

  test('orbit: espectrómetro (energía qV = ½mv²) y la masa desde el radio', () => {
    for (let i = 0; i < 100; i++) {
      const A = 1 + Math.floor(rand() * 60), m = A * U, V = between(100, 5000), B = between(0.05, 1);
      const s = O.spectrometer(m, E, V, B), K = E * V;
      near(0.5 * m * s.v * s.v, K, 1e-9 * K);
      near(s.r, Math.sqrt(2 * m * K) / (E * B), 1e-9 * s.r);
      near(s.d, 2 * s.r, 1e-15);
      near(O.massFromRadius(E, V, B, s.r), m, 1e-9 * m);
      near(O.momentum(E, s.r, B), m * s.v, 1e-9 * m * s.v);
      near(O.speedFromRadius(m, E, s.r, B), s.v, 1e-9 * s.v);
    }
  });

  test('orbit: ciclotrón, la cadena de medias vueltas llega al borde con K máx', () => {
    for (let i = 0; i < 40; i++) {
      const B = between(0.3, 2), R = between(0.05, 1), dV = between(1e3, 5e4);
      const c = O.cyclotron(MP, E, B, R, dV);
      // Cada cruce suma e·dV; tras N cruces el radio es √(2m·N·e·dV)/(eB).
      near(O.spiralRadius(MP, E, B, dV, c.crossings), R, 1e-9 * R);
      near(c.Kmax, Math.pow(E * B * R, 2) / (2 * MP), 1e-9 * c.Kmax);
      near(c.KmaxEV * E, c.Kmax, 1e-9 * c.Kmax);
      near(c.turns * 2, c.crossings, 1e-9 * c.crossings);
      near(c.f, E * B / (2 * Math.PI * MP), 1e-9 * c.f);
    }
  });

  test('orbit: hélice (RK4 propio): r con v⊥ y paso = v∥·T', () => {
    for (let i = 0; i < 20; i++) {
      const v = between(1e5, 1e6), a = between(10, 80), B = between(0.1, 1), h = O.helix(MP, E, v, B, a);
      const s = rk4(MP, E, [0, 0, 0], [v * Math.sin(a * Math.PI / 180), 0, v * Math.cos(a * Math.PI / 180)], [0, 0, B], [0, 0, 0], h.T / 2000, 2000);
      const last = s[s.length - 1];
      near(last[2], h.pitch, 1e-6 * h.pitch);
      near(Math.hypot(last[0], last[1]), 0, 1e-5 * h.r);
      const ys = s.map((y) => y[1]);
      near((Math.max(...ys) - Math.min(...ys)) / 2, h.r, 1e-5 * h.r);
    }
  });

  test('orbit: diagnóstico del reto', () => {
    const c = { k: 'p', v: 2e6, B: 0.4 }, t = O.truthR(c);
    near(t, MP * 2e6 / (E * 0.4) * 100, 1e-9);
    eq(O.diagnose(c, t), 'ok'); eq(O.diagnose(c, t * 1.02), 'ok');
    eq(O.diagnose(c, 2 * t), 'diameter'); eq(O.diagnose(c, t / 100), 'meters');
    eq(O.diagnose(c, O.mistakes(c).mass), 'mass'); eq(O.diagnose(c, O.mistakes(c).inverse), 'inverse');
    const a = { k: 'a', v: 2e6, B: 0.8 };
    eq(O.diagnose(a, 2 * O.truthR(a)), 'charge');
    eq(O.diagnose({ k: 'e', v: 2e7, B: 4e-3 }, O.mistakes({ k: 'e', v: 2e7, B: 4e-3 }).mass), 'mass');
    eq(O.diagnose(c, 777), 'bad'); eq(O.diagnose(c, NaN), 'bad');
  });

  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-3/bank/sesion-03.js');
  if (fs.existsSync(bankFile)) test('orbit: banco f3 S03 contra LabMath (200 instancias por pregunta)', () => {
    const { loadData } = require('../lib/load');
    const W = loadData([path.join(ROOT, 'shared/js/labs/registry.js'), path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
    const Q = W.CB_BANK.f3.S03.questions;
    let seed = 99;
    const r2 = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
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
