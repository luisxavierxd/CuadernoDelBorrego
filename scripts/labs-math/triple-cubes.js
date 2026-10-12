// Pruebas de LabMath.triple (lab triple-cubes, Cálculo 2 · S14). Oráculos independientes:
// la integral iterada (cuadratura en rectangulares) contra fórmulas cerradas (volumen del
// tetraedro abc/6, centroide (a/4, b/4, c/4), caja con densidad), contra Monte Carlo con semilla
// (tolerancia declarada: 4 errores estándar) y contra sí misma en los seis órdenes de integración;
// la suma de cubitos converge al valor exacto; el diagnóstico reconoce los errores típicos; y del
// banco de S14, cada pregunta numérica con `ck` se recalcula con la cuadratura.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const T = LM.triple;
  const rel = (a, b) => Math.abs(a - b) / Math.max(1e-12, Math.abs(b));
  const box = (a, b, c) => [[0, a], () => [0, b], () => [0, c]];
  const tet = (a, b, c) => [[0, a], (x) => [0, b * (1 - x / a)], (x, y) => [0, c * (1 - x / a - y / b)]];

  test('triple: integral iterada exacta en polinomios sobre cajas (fórmula cerrada factorizada)', () => {
    [[1, 2, 3], [2, 1.5, 4], [3, 2, 2]].forEach(([a, b, c]) => {
      const I = T.integrate((x, y, z) => x * y * y * z * z * z, ...box(a, b, c));
      const want = (a * a / 2) * (b * b * b / 3) * (c * c * c * c / 4);
      if (rel(I, want) > 1e-12) throw new Error(`caja ${a}×${b}×${c}: ${I} contra ${want}`);
      const J = T.integrate((x, y, z) => x * z + y, ...box(a, b, c));
      const wantJ = a * a * b * c * c / 4 + a * b * b * c / 2;
      if (rel(J, wantJ) > 1e-12) throw new Error(`xz + y: ${J} contra ${wantJ}`);
    });
  });

  test('triple: tetraedro bajo x/a + y/b + z/c = 1 → V = abc/6 y centroide (a/4, b/4, c/4)', () => {
    [[1, 1, 1], [2, 3, 4], [4, 2, 3], [5, 1, 2.5], [0.5, 6, 2]].forEach(([a, b, c]) => {
      const m = T.moments(() => 1, ...tet(a, b, c));
      if (rel(m.V, a * b * c / 6) > 1e-11) throw new Error(`V ${m.V} contra ${a * b * c / 6}`);
      near(m.xbar, a / 4, 1e-11, 'x̄'); near(m.ybar, b / 4, 1e-11, 'ȳ'); near(m.zbar, c / 4, 1e-11, 'z̄');
      near(m.geo.x, a / 4, 1e-11, 'centroide geométrico');
    });
    // Densidad ρ = z en el tetraedro: ∭ z dV = abc²/24 (z̄·V con z̄ = c/4).
    const m = T.moments((x, y, z) => z, ...tet(2, 3, 4));
    near(m.M, 2 * 3 * 16 / 24, 1e-11, '∭ z dV');
  });

  test('triple: caja con ρ = kz → M = kabc²/2 y z̄ = 2c/3; con ρ = kx → x̄ = 2a/3', () => {
    [[2, 3, 1, 1.5], [1, 1, 4, 2], [3, 2, 2, 0.5]].forEach(([a, b, c, k]) => {
      const m = T.moments((x, y, z) => k * z, ...box(a, b, c));
      near(m.M, k * a * b * c * c / 2, 1e-10, 'masa'); near(m.zbar, 2 * c / 3, 1e-11, 'z̄'); near(m.xbar, a / 2, 1e-11, 'x̄ por simetría');
      const n = T.moments((x) => k * x, ...box(a, b, c));
      near(n.xbar, 2 * a / 3, 1e-11, 'x̄ con ρ = kx');
    });
  });

  test('triple: los seis órdenes de integración coinciden en la caja y en el tetraedro', () => {
    const a = 2, b = 3, c = 1.5;
    const f = (x, y, z) => x * y * y * z * z * z + x;
    const L = { x: [0, a], y: [0, b], z: [0, c] };
    const ords = ['zyx', 'yzx', 'zxy', 'xzy', 'yxz', 'xyz'];
    const ref = T.integrate(f, ...box(a, b, c));
    ords.forEach((o) => {
      const r = T.iterated(f, o, L[o[2]], () => L[o[1]], () => L[o[0]]);
      if (rel(r, ref) > 1e-12) throw new Error(`caja, orden d${o[0]} d${o[1]} d${o[2]}: ${r} contra ${ref}`);
    });
    // Tetraedro x/A + y/B + z/C ≤ 1: la variable de afuera recorre [0, su intercepto]; la de en medio
    // hasta su intercepto por (1 − u/U); la de adentro hasta su intercepto por (1 − u/U − w/W).
    const I = { x: 4, y: 2, z: 3 }, g = (x, y, z) => x + 2 * y + 3 * z * z;
    const tref = T.integrate(g, ...tet(I.x, I.y, I.z));
    ords.forEach((o) => {
      const [i, m, u] = o.split('');
      const r = T.iterated(g, o, [0, I[u]], (U) => [0, I[m] * (1 - U / I[u])], (U, W) => [0, I[i] * (1 - U / I[u] - W / I[m])]);
      if (rel(r, tref) > 1e-11) throw new Error(`tetraedro, orden ${o}: ${r} contra ${tref}`);
    });
    // Valor a mano: ∭ (x + 2y + 3z²) = V (x̄ + 2ȳ) + 3∭z²; ∭ z² dV = abc³/60.
    const V = 4 * 2 * 3 / 6, want = V * (1 + 2 * 0.5) + 3 * 4 * 2 * 27 / 60;
    if (rel(tref, want) > 1e-11) throw new Error(`tetraedro: ${tref} contra ${want}`);
  });

  test('triple: presets → V exacto (caja 12, tetraedro 4, cuña 6, paraboloide 44/3) y Monte Carlo dentro de 4 errores estándar', () => {
    const W = { box: 12, tetra: 4, wedge: 6, para: 44 / 3 };
    const P = { box: { a: 3, b: 2, c: 2 }, tetra: { a: 4, b: 2, c: 3 }, wedge: { a: 2, h: 5 }, para: { a: 2, h: 5, k: 0.5 } };
    const rhos = [() => 1, (x, y, z) => z, (x) => 1 + x, (x, y) => 1 + x * y];
    Object.keys(W).forEach((k) => {
      const S = T.solidOf(k, P[k]);
      rhos.forEach((rho, ri) => {
        const c = T.analyze(rho, S);
        if (ri === 0 && rel(c.V, W[k]) > 1e-11) throw new Error(`${k}: V ${c.V} contra ${W[k]}`);
        const mc = T.monteCarlo(rho, S, 60000, 7 + ri);
        if (Math.abs(mc.V - c.V) > 4 * mc.seV) throw new Error(`${k}: Monte Carlo V ${mc.V} ± ${mc.seV} contra ${c.V}`);
        if (Math.abs(mc.M - c.M) > 4 * mc.seM) throw new Error(`${k} ρ${ri}: Monte Carlo M ${mc.M} ± ${mc.seM} contra ${c.M}`);
        ['xbar', 'ybar', 'zbar'].forEach((q) => { if (Math.abs(mc[q] - c[q]) > 0.04 * Math.max(1, Math.abs(c[q]))) throw new Error(`${k} ${q}: ${mc[q]} contra ${c[q]}`); });
      });
    });
    // La caja envolvente y la región equivocada: en el tetraedro, la tapa sobre el rectángulo entero da 0.
    const t = T.analyze(() => 1, T.solidOf('tetra', P.tetra));
    near(t.boxV, 24, 1e-12, 'caja del tetraedro'); near(t.wrong.V, 0, 1e-10, 'tapa sobre el rectángulo');
    const w = T.analyze(() => 1, T.solidOf('wedge', P.wedge));
    near(w.wrong.V, 20 - 4 - 4, 1e-10, 'cuña sobre el cuadrado [0, 2]²');
  });

  test('triple: la suma de cubitos converge al valor exacto (n = m = 4 → 16 → 64)', () => {
    ['box', 'tetra', 'wedge', 'para'].forEach((k) => {
      const S = T.solidOf(k), rho = (x, y, z) => 1 + z, c = T.analyze(rho, S);
      const err = (n) => Math.abs(T.cubes(rho, S, n, n).M - c.M);
      const e4 = err(4), e16 = err(16), e64 = err(64);
      if (!(e16 <= 0.5 * e4 + 1e-9 && e64 <= 0.5 * e16 + 1e-9)) throw new Error(`${k}: el error no baja (${e4} → ${e16} → ${e64})`);
      if (e64 / c.M > 0.02) throw new Error(`${k}: con n = 64 el error relativo es ${e64 / c.M}`);
    });
    const b = T.cubes(() => 1, T.solidOf('box'), 3, 2);
    eq(b.count, 18, 'la caja se llena entera'); near(b.V, 12, 1e-12, 'volumen exacto en la caja');
    const t = T.cubes(() => 1, T.solidOf('tetra'), 2, 2);
    eq(t.cols[0][0], 1, 'columna (0, 0) del tetraedro con n = m = 2');
  });

  test('triple: volumen entre z = x² + y² y z = 8 − x² − y² en rectangulares (límites con raíz) = 16π', () => {
    const r = T.integrate(() => 1, [-2, 2], (x) => { const s = Math.sqrt(Math.max(0, 4 - x * x)); return [-s, s]; }, (x, y) => [x * x + y * y, 8 - x * x - y * y]);
    if (rel(r, 16 * Math.PI) > 1e-9) throw new Error(`${r} contra 16π = ${16 * Math.PI}`);
  });

  test('triple: Monte Carlo reproducible con la misma semilla; adaptiva contra ∫ √x', () => {
    const S = T.solidOf('para');
    eq(T.monteCarlo(() => 1, S, 1000, 3).V, T.monteCarlo(() => 1, S, 1000, 3).V, 'misma semilla');
    near(T.adapt(Math.sqrt, 0, 1), 2 / 3, 1e-10, '∫₀¹ √x');
  });

  test('triple: diagnose reconoce D equivocada, la caja, límites invertidos, sin densidad, sin dividir y entre V', () => {
    const S = T.solidOf('wedge'), c = T.analyze((x, y, z) => z, S);
    const d = (s, mode) => T.diagnose(s, c, mode).reason;
    eq(d(c.V, 'V'), 'correct'); eq(d(c.wrong.V, 'V'), 'wrongD'); eq(d(c.boxV, 'V'), 'box'); eq(d(-c.V, 'V'), 'flip');
    eq(d(c.M, 'M'), 'correct'); eq(d(c.V, 'M'), 'noRho'); eq(d(c.wrong.M, 'M'), 'wrongD'); eq(d(-c.M, 'M'), 'flip');
    eq(d(c.zbar, 'zbar'), 'correct'); eq(d(c.Mxy, 'zbar'), 'noDiv'); eq(d(c.Mxy / c.V, 'zbar'), 'byVol'); eq(d(c.geo.z, 'zbar'), 'noRho');
    eq(d(c.xbar + 3, 'xbar'), 'mismatch');
    eq(T.diagnose(NaN, c, 'V').kind, 'invalid');
    // Con ρ = 1 la masa es el volumen: el error "sin densidad" no se dispara.
    const u = T.analyze(() => 1, S);
    eq(T.diagnose(u.V, u, 'M').reason, 'correct');
  });

  // Banco de S14: las preguntas numéricas con `ck` se recalculan con la cuadratura iterada.
  const bankFile = path.join(__dirname, '..', '..', 'data', 'calculo-2', 'bank', 'sesion-14.js');
  if (fs.existsSync(bankFile)) {
    test('banco c2 S14: respuestas numéricas contra la integral iterada numérica (oráculo independiente)', () => {
      const { loadData } = require('../lib/load');
      const ROOT = path.join(__dirname, '..', '..');
      const W = loadData(['labs/registry', 'labs/antiderivative-check', 'exercises', 'quiz/bank-kit'].map((n) => path.join(ROOT, 'shared/js', n + '.js')), {});
      loadData(bankFile, W);
      const Q = W.CB_BANK.c2.S14.questions;
      let seed = 14; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      let checked = 0, numeric = 0;
      Q.forEach((q) => {
        if (q.type === 'numeric') numeric++;
        if (!q.ck) return;
        for (let i = 0; i < 25; i++) {
          const v = W.CBExercises.instance(q, rnd), o = q.ck(v);
          const one = () => 1, f = o.f || one, rho = o.rho || one;
          let want;
          if (o.kind === 'int') want = T.integrate(f, o.X, o.Y, o.Z);
          else if (o.kind === 'avg') want = T.integrate(f, o.X, o.Y, o.Z) / T.integrate(one, o.X, o.Y, o.Z);
          else if (o.kind === 'bar') {
            const k = { x: 0, y: 1, z: 2 }[o.q];
            want = T.integrate((x, y, z) => [x, y, z][k] * rho(x, y, z), o.X, o.Y, o.Z) / T.integrate(rho, o.X, o.Y, o.Z);
          } else throw new Error(`${q.id}: ck.kind desconocido ${o.kind}`);
          if (o.scale) want *= o.scale;
          const got = q.answer(v);
          if (Math.abs(got - want) > 1e-8 * Math.max(1, Math.abs(want))) throw new Error(`${q.id} ${JSON.stringify(v)}: respuesta ${got}, cuadratura ${want}`);
          checked++;
        }
      });
      if (checked < 25 * Math.ceil(numeric * 0.8)) throw new Error(`solo ${checked / 25} de ${numeric} preguntas numéricas tienen ck`);
    });
  }
};
