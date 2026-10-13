// Pruebas de LabMath.mflux (lab magnetic-flux, Física 3 · S10), con oráculos independientes:
// Φ = BA cos θ contra la malla de B·n̂ dA y contra el área proyectada; el campo lineal y el del
// alambre integrados con Simpson; y la ley de Gauss del magnetismo: el flujo del campo de afuera
// por una CAJA (cara por cara, Gauss–Legendre escrito aquí) es 4πB₀R₀²·(polos encerrados), igual al
// de la esfera de LabMath, y al sumar el flujo que regresa por dentro del imán el neto es cero.
// También revisa el banco f3 S10 contra LabMath.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const F = LM.mflux, M = LM.magnet, MU0 = 4 * Math.PI * 1e-7;
  let seed = 1010;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const between = (a, b) => a + (b - a) * rand();
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-30), msg);
  function simpson(f, a, b, n) { let s = f(a) + f(b); const hh = (b - a) / n; for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * hh); return s * hh / 3; }

  test('mflux: BA cos θ contra la malla de B·n̂ dA y el área proyectada', () => {
    for (let i = 0; i < 200; i++) {
      const B = between(0.001, 2), w = between(0.01, 0.3), h = between(0.01, 0.3), th = between(0, 180);
      rel(F.loopGrid([0, 0, B], w, h, th, 7), F.flux(B, w * h, th) || 1e-30, 1e-9);
      // El área proyectada sobre el plano perpendicular a B: |w cos θ| · h (con el signo del coseno).
      near(F.flux(B, w * h, th), B * (w * Math.cos(th * Math.PI / 180)) * h, 1e-15);
    }
    near(F.flux(1, 1, 90), 0, 1e-15);
    rel(F.flux(0.2, 0.01, 180), -0.002, 1e-12);
  });

  test('mflux: campo que crece en x y espira junto a un alambre, contra Simpson', () => {
    for (let i = 0; i < 100; i++) {
      const B0 = between(0.01, 1), k = between(-2, 5), x0 = between(0, 0.3), w = between(0.01, 0.2), h = between(0.01, 0.2);
      rel(F.linear(B0, k, x0, w, h), simpson((x) => B0 * (1 + k * x) * h, x0, x0 + w, 2), 1e-12);
      const I = between(1, 50), a = between(0.005, 0.1), b = a + between(0.005, 0.3);
      rel(F.wireRect(I, a, b, h), simpson((r) => MU0 * I / (2 * Math.PI * r) * h, a, b, 2000), 1e-9);
    }
  });

  // Flujo del campo de afuera (polos de LabMath.magnet en z = 0) por una caja centrada en (cx, cy, 0).
  const GL = [[-0.9061798459386640, 0.2369268850561891], [-0.5384693101056831, 0.4786286704993665], [0, 0.5688888888888889], [0.5384693101056831, 0.4786286704993665], [0.9061798459386640, 0.2369268850561891]];
  function boxFlux(magnets, cx, cy, hx, hy, hz, m) {
    const poles = [];
    magnets.forEach((mg) => { const p = M.poles(mg); poles.push({ x: p.N.x, y: p.N.y, q: mg.s }, { x: p.S.x, y: p.S.y, q: -mg.s }); });
    const k = M.B0 * M.R0 * M.R0;
    const Bn = (x, y, z, n) => poles.reduce((s, p) => { const dx = x - p.x, dy = y - p.y, r = Math.hypot(dx, dy, z); return s + p.q * k * (dx * n[0] + dy * n[1] + z * n[2]) / (r * r * r); }, 0);
    // Integra una cara: centro c, dos semiejes u y v (vectores), normal n.
    function face(c, u, v, n) {
      let s = 0;
      for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) GL.forEach((gu) => GL.forEach((gv) => {
        const a = -1 + (2 * i + 1 + gu[0]) / m, b = -1 + (2 * j + 1 + gv[0]) / m;
        s += gu[1] * gv[1] * Bn(c[0] + a * u[0] + b * v[0], c[1] + a * u[1] + b * v[1], c[2] + a * u[2] + b * v[2], n);
      }));
      const area = 4 * Math.hypot(...u) * Math.hypot(...v);
      return s / (m * m) / 4 * area;
    }
    return face([cx + hx, cy, 0], [0, hy, 0], [0, 0, hz], [1, 0, 0]) + face([cx - hx, cy, 0], [0, hy, 0], [0, 0, hz], [-1, 0, 0]) +
      face([cx, cy + hy, 0], [hx, 0, 0], [0, 0, hz], [0, 1, 0]) + face([cx, cy - hy, 0], [hx, 0, 0], [0, 0, hz], [0, -1, 0]) +
      face([cx, cy, hz], [hx, 0, 0], [0, hy, 0], [0, 0, 1]) + face([cx, cy, -hz], [hx, 0, 0], [0, hy, 0], [0, 0, -1]);
  }

  test('mflux: Gauss del magnetismo — caja (oráculo) y esfera de LabMath: afuera 4πB₀R₀²·q_enc, neto 0', () => {
    const cases = [
      { m: [{ x: 0, y: 0, ang: 0, s: 2 }], c: [0, 0], R: 6 },                     // imán entero adentro
      { m: [{ x: -2, y: 0, ang: 0, s: 2 }], c: [2.5, 0], R: 3 },                  // solo el polo N adentro
      { m: [{ x: -2, y: 0, ang: 0, s: 3 }], c: [-6.5, 0], R: 3 },                 // solo el polo S adentro
      { m: [{ x: -4, y: 0, ang: 90, s: 2 }, { x: 7, y: 2, ang: 0, s: 1 }], c: [-4, 0], R: 5 }
    ];
    for (const t of cases) {
      const sp = F.sphere(t.m, t.c[0], t.c[1], t.R, 240, 480);
      const want = F.poleFlux(1) * sp.enclosed;
      near(sp.outside, want, 2e-3 * F.poleFlux(1), 'esfera');
      near(sp.net, 0, 2e-3 * F.poleFlux(1), 'neto');
      near(sp.inner, -want, 1e-9 * F.poleFlux(1));
      const hb = t.R * 0.8;
      near(boxFlux(t.m, t.c[0], t.c[1], hb, hb, hb, 16), want, 1e-3 * F.poleFlux(1), 'caja');
    }
    rel(F.poleFlux(1), 4 * Math.PI * 4, 1e-12);
    eq(F.sphere([{ x: 0, y: 0, ang: 0, s: 2 }], 0, 0, 6).out > 1, true, 'sí sale flujo, aunque el neto sea 0');
  });

  test('mflux: reto y diagnóstico', () => {
    const c = { kind: 'loop', B: 50, shape: 'sq', L: 10, th: 30 }, m = F.mistakes(c);
    rel(F.truth(c), 0.05 * 0.01 * Math.cos(Math.PI / 6) * 1e6, 1e-12);
    eq(F.diagnose(c, F.truth(c)), 'ok'); eq(F.diagnose(c, m.sin), 'sin'); eq(F.diagnose(c, m.cm2), 'cm2'); eq(F.diagnose(c, 1), 'bad');
    const d = { kind: 'loop', B: 40, shape: 'circ', L: 8, th: 20, diam: true };
    rel(F.truth(d), 0.04 * Math.PI * 0.0016 * Math.cos(20 * Math.PI / 180) * 1e6, 1e-12);
    eq(F.diagnose(d, F.mistakes(d).diam), 'diam');
    const g = { kind: 'gauss', a: 40, b: 25 };
    eq(F.truth(g), 15); eq(F.diagnose(g, 15), 'ok'); eq(F.diagnose(g, -15), 'sign'); eq(F.diagnose(g, 0), 'zero');
  });

  // Banco f3 S10: cada numérica trae oracle(v, LM).
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-3/bank/sesion-10.js');
  if (fs.existsSync(bankFile)) test('mflux: banco f3 S10 contra LabMath (200 instancias por pregunta)', () => {
    const { loadData } = require('../lib/load');
    const W = loadData([path.join(ROOT, 'shared/js/labs/registry.js'), path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
    const Q = W.CB_BANK.f3.S10.questions;
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
