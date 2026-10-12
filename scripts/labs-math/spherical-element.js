// Pruebas de LabMath.sphElement (lab spherical-element, Cálculo 2 · S15). Oráculos independientes:
// el Jacobiano numérico (determinante de diferencias finitas) contra ρ² sin φ, r y el r de polares;
// la integral en esféricas o cilíndricas contra fórmulas cerradas (esfera 4πR³/3, cono de helado,
// hemisferio con z̄ = 3R/8…), contra la integral iterada en rectangulares de LabMath.triple (otro lab,
// otra cuadratura, en x, y, z) y contra Monte Carlo en x, y, z con semilla (tolerancia declarada:
// 4 errores estándar); la suma de cajitas converge; el diagnóstico reconoce los errores típicos; y del
// banco de S15, cada pregunta numérica con `ck` se recalcula con la integral numérica curvilínea.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const E = LM.sphElement, PI = Math.PI;
  const rel = (a, b) => Math.abs(a - b) / Math.max(1e-12, Math.abs(b));
  const one = () => 1;

  test('sphElement: Jacobiano numérico = ρ² sin φ (esféricas), r (cilíndricas) y r (polares)', () => {
    [[1, 0.3, 0.4], [2.5, 4, 1.2], [0.7, 2, 2.9], [3, 5.5, PI / 2]].forEach(([a, b, c]) => {
      const s = E.jacobian('sph', a, b, c), w = a * a * Math.sin(c);
      if (rel(s, w) > 1e-9) throw new Error(`esféricas ${a}, ${b}, ${c}: ${s} contra ${w}`);
      if (rel(E.jacobian('cyl', a, b, c), a) > 1e-9) throw new Error(`cilíndricas: ${E.jacobian('cyl', a, b, c)} contra ${a}`);
      if (rel(E.jacobian('polar', a, b), a) > 1e-9) throw new Error(`polares: ${E.jacobian('polar', a, b)} contra ${a}`);
    });
    // Ida y vuelta de las conversiones.
    [[1.5, 0.4, 2.2], [0.8, 5.9, 0.3]].forEach(([a, b, c]) => {
      ['sph', 'cyl'].forEach((sys) => {
        const p = E.toXYZ(sys, a, b, c), u = E.fromXYZ(sys, p[0], p[1], p[2]);
        [a, b, c].forEach((v, i) => near(u[i], v, 1e-12, `${sys} coordenada ${i}`));
      });
    });
  });

  test('sphElement: volúmenes y masas con fórmula cerrada (esfera, cascarón, cono de helado, gajo, cilindros)', () => {
    [1, 2, 3.5].forEach((R) => {
      const V = E.integrate(one, 'sph', [[0, R], [0, 2 * PI], [0, PI]]);
      if (rel(V, 4 * PI * R ** 3 / 3) > 1e-11) throw new Error(`esfera R = ${R}: ${V}`);
      [PI / 6, PI / 4, PI / 3].forEach((al) => {
        const c = E.integrate(one, 'sph', [[0, R], [0, 2 * PI], [0, al]]);
        if (rel(c, 2 * PI / 3 * R ** 3 * (1 - Math.cos(al))) > 1e-11) throw new Error(`cono ${R}, ${al}: ${c}`);
      });
      [0.5, 2].forEach((k) => {
        const M = E.integrate((x, y, z) => k * Math.hypot(x, y, z), 'sph', [[0, R], [0, 2 * PI], [0, PI]]);
        if (rel(M, k * PI * R ** 4) > 1e-11) throw new Error(`masa δ = kρ: ${M} contra ${k * PI * R ** 4}`);
      });
    });
    const sh = E.integrate(one, 'sph', [[1, 3], [0, 2 * PI], [0, PI]]);
    if (rel(sh, 4 * PI * 26 / 3) > 1e-11) throw new Error(`cascarón: ${sh}`);
    const g = E.integrate(one, 'sph', [[0, 2], [0, PI / 2], [0, PI]]);
    if (rel(g, 8 * PI / 3) > 1e-11) throw new Error(`gajo: ${g}`);
    const cy = E.integrate((x, y) => x * x + y * y, 'cyl', [[0, 2], [0, 2 * PI], [0, 3]]);
    if (rel(cy, PI * 3 * 16 / 2) > 1e-11) throw new Error(`∭ (x² + y²) en el cilindro: ${cy}`);
    const tb = E.integrate(one, 'cyl', [[1, 2], [0, 2 * PI], [0, 3]]);
    if (rel(tb, 9 * PI) > 1e-11) throw new Error(`cilindro con hueco: ${tb}`);
  });

  test('sphElement: centroides conocidos (hemisferio 3R/8, cono de helado 3R(1 + cos α)/8, cilindro H/2)', () => {
    [1, 2, 4].forEach((R) => {
      const h = E.moments(one, 'sph', [[0, R], [0, 2 * PI], [0, PI / 2]]);
      near(h.zbar, 3 * R / 8, 1e-11, 'hemisferio');
      near(h.V, 2 * PI * R ** 3 / 3, 1e-10, 'volumen del hemisferio');
      near(h.xbar, 0, 1e-11, 'x̄ por simetría');
      const al = PI / 4, c = E.moments(one, 'sph', [[0, R], [0, 2 * PI], [0, al]]);
      near(c.zbar, 3 * R * (1 + Math.cos(al)) / 8, 1e-11, 'cono de helado');
    });
    near(E.moments(one, 'cyl', [[0, 2], [0, 2 * PI], [0, 3]]).zbar, 1.5, 1e-12, 'cilindro');
  });

  test('sphElement: la integral curvilínea coincide con la iterada en rectangulares (LabMath.triple, en x, y, z)', () => {
    const T = LM.triple;
    if (!T) throw new Error('falta LabMath.triple');
    const sq = (v) => Math.sqrt(Math.max(0, v));
    const R = 2, H = 3, tol = 1e-9;
    const ball = (r) => [[-r, r], (x) => [-sq(r * r - x * x), sq(r * r - x * x)], (x, y) => [-sq(r * r - x * x - y * y), sq(r * r - x * x - y * y)]];
    const cylR = (r, h) => [[-r, r], (x) => [-sq(r * r - x * x), sq(r * r - x * x)], () => [0, h]];
    const dens = [one, (x, y, z) => Math.hypot(x, y, z), (x, y) => x * x + y * y, (x, y, z) => 3 + z];
    const cases = [
      ['ball', (f) => T.integrate(f, ...ball(R), tol)],
      ['shell', (f) => T.integrate(f, ...ball(2), tol) - T.integrate(f, ...ball(1), tol)],
      ['cone', (f) => T.integrate(f, [-R / Math.SQRT2, R / Math.SQRT2], (x) => [-sq(R * R / 2 - x * x), sq(R * R / 2 - x * x)], (x, y) => [Math.hypot(x, y), sq(R * R - x * x - y * y)], tol)],
      ['wedge', (f) => T.integrate(f, [0, R], (x) => [0, sq(R * R - x * x)], (x, y) => [-sq(R * R - x * x - y * y), sq(R * R - x * x - y * y)], tol)],
      ['hemi', (f) => T.integrate(f, [-R, R], (x) => [-sq(R * R - x * x), sq(R * R - x * x)], (x, y) => [0, sq(R * R - x * x - y * y)], tol)],
      ['cyl', (f) => T.integrate(f, ...cylR(R, H), tol)],
      ['tube', (f) => T.integrate(f, ...cylR(2, H), tol) - T.integrate(f, ...cylR(1, H), tol)]
    ];
    cases.forEach(([key, rect]) => {
      const S = E.solidOf(key);
      dens.forEach((d, di) => {
        const c = E.integrate(d, S.sys, S.L), r = rect(d);
        if (rel(c, r) > 2e-6) throw new Error(`${key} δ${di}: curvilínea ${c}, rectangulares ${r}`);
      });
    });
  });

  test('sphElement: Monte Carlo en x, y, z dentro de 4 errores estándar en todos los presets', () => {
    const dens = [one, (x, y, z) => Math.hypot(x, y, z), (x, y, z) => 1 / (1 + x * x + y * y + z * z), (x, y) => x * x + y * y, (x, y, z) => 3 + z];
    ['ball', 'shell', 'cone', 'wedge', 'hemi', 'cyl', 'tube'].forEach((key) => {
      const S = E.solidOf(key);
      dens.forEach((d, di) => {
        const c = E.analyze(d, S), mc = E.monteCarlo(d, S, 60000, 3 + di);
        if (Math.abs(mc.V - c.V) > 4 * mc.seV) throw new Error(`${key}: Monte Carlo V ${mc.V} ± ${mc.seV} contra ${c.V}`);
        if (Math.abs(mc.M - c.M) > 4 * mc.seM) throw new Error(`${key} δ${di}: Monte Carlo M ${mc.M} ± ${mc.seM} contra ${c.M}`);
        if (Math.abs(mc.zbar - c.zbar) > 0.05 * Math.max(1, Math.abs(c.zbar))) throw new Error(`${key} δ${di} z̄: ${mc.zbar} contra ${c.zbar}`);
      });
    });
    eq(E.monteCarlo(one, E.solidOf('cone'), 500, 4).V, E.monteCarlo(one, E.solidOf('cone'), 500, 4).V, 'misma semilla');
  });

  test('sphElement: la suma de cajitas converge; las cajitas exactas suman el volumen; lados × lados = J·Δ', () => {
    ['ball', 'shell', 'cone', 'wedge', 'hemi', 'cyl', 'tube'].forEach((key) => {
      const S = E.solidOf(key), d = (x, y, z) => 3 + z, c = E.analyze(d, S);
      const err = (n) => Math.abs(E.cells(d, S, [n, n, n]).M - c.M);
      const e2 = err(2), e8 = err(8), e32 = err(32);
      if (!(e8 <= 0.5 * e2 + 1e-9 && e32 <= 0.5 * e8 + 1e-9)) throw new Error(`${key}: el error no baja (${e2} → ${e8} → ${e32})`);
      if (e32 / c.M > 0.005) throw new Error(`${key}: con n = 32 el error relativo es ${e32 / c.M}`);
      const s = E.cells(one, S, [3, 5, 4]);
      if (rel(s.exactSum, c.V) > 1e-11) throw new Error(`${key}: Σ volúmenes exactos ${s.exactSum} contra ${c.V}`);
      // Sin el Jacobiano la suma converge a otro número: el de la integral sin el factor.
      const no = E.cells(one, S, [32, 32, 32], true).V;
      if (rel(no, c.wrong.noJac.V) > 1e-9) throw new Error(`${key}: sin Jacobiano ${no} contra ${c.wrong.noJac.V}`);
      const C = E.cell(S, [3, 5, 4], 2, 1, 1);
      if (rel(C.sides[0] * C.sides[1] * C.sides[2], C.approx) > 1e-12) throw new Error(`${key}: producto de los lados ≠ J·Δ`);
      if (rel(C.approx, C.exact) > 0.05) throw new Error(`${key}: la cajita aproximada se aleja de la exacta`);
    });
    // Esfera R = 2 cortada en 4 × 4 × 4: Σ ρ² sin φ ΔρΔθΔφ con el punto medio.
    const b = E.cells(one, E.solidOf('ball'), [4, 4, 4]);
    eq(b.count, 64, 'número de cajitas');
  });

  test('sphElement: diagnose reconoce sin Jacobiano, ρ² sin sin φ, ρ en vez de ρ², θ hasta π, φ hasta 2π y sin densidad', () => {
    const S = E.solidOf('ball'), c = E.analyze((x, y, z) => Math.hypot(x, y, z), S);
    const d = (s, mode) => E.diagnose(s, c, mode).reason;
    eq(d(c.V, 'V'), 'correct'); eq(d(c.wrong.noJac.V, 'V'), 'noJac'); eq(d(c.wrong.rho2.V, 'V'), 'rho2');
    eq(d(c.wrong.rho1.V, 'V'), 'rho1'); eq(d(c.V / 2, 'V'), 'thetaHalf'); eq(d(0, 'V'), 'phi2pi');
    eq(d(c.M, 'M'), 'correct'); eq(d(c.V, 'M'), 'noRho'); eq(d(c.wrong.noJac.M, 'M'), 'noJac');
    near(c.wrong.phi2pi.V, 0, 1e-9, 'φ de 0 a 2π da 0');
    near(c.wrong.noJac.V, 2 * 2 * PI * PI, 1e-9, 'sin Jacobiano: R·2π·π');
    const h = E.analyze((x, y, z) => 3 + z, E.solidOf('hemi'));
    eq(E.diagnose(h.zbar, h, 'zbar').reason, 'correct'); eq(E.diagnose(h.Mxy, h, 'zbar').reason, 'noDiv');
    eq(E.diagnose(h.Mxy / h.V, h, 'zbar').reason, 'byVol'); eq(E.diagnose(h.geo.z, h, 'zbar').reason, 'noRho');
    eq(E.diagnose(h.wrong.noJac.zbar, h, 'zbar').reason, 'noJac');
    const t = E.analyze(one, E.solidOf('tube'));
    eq(E.diagnose(t.wrong.noJac.V, t, 'V').reason, 'noJac'); eq(E.diagnose(t.V / 2, t, 'V').reason, 'thetaHalf');
    eq(E.diagnose(t.V + 5, t, 'V').reason, 'mismatch'); eq(E.diagnose(NaN, t, 'V').kind, 'invalid');
  });

  // Banco de S15: las preguntas numéricas con `ck` se recalculan con la integral numérica curvilínea.
  const bankFile = path.join(__dirname, '..', '..', 'data', 'calculo-2', 'bank', 'sesion-15.js');
  if (fs.existsSync(bankFile)) {
    test('banco c2 S15: respuestas numéricas contra la integral numérica en esféricas o cilíndricas', () => {
      const { loadData } = require('../lib/load');
      const ROOT = path.join(__dirname, '..', '..');
      const W = loadData(['labs/registry', 'labs/antiderivative-check', 'exercises', 'quiz/bank-kit'].map((n) => path.join(ROOT, 'shared/js', n + '.js')), {});
      loadData(bankFile, W);
      const Q = W.CB_BANK.c2.S15.questions;
      let seed = 15; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      let checked = 0, numeric = 0;
      Q.forEach((q) => {
        if (q.type === 'numeric') numeric++;
        if (!q.ck) return;
        for (let i = 0; i < 20; i++) {
          const v = W.CBExercises.instance(q, rnd), o = q.ck(v), f = o.f || one;
          let want;
          if (o.kind === 'int') want = E.integrate(f, o.sys, o.L);
          else if (o.kind === 'zbar') want = E.moments(f, o.sys, o.L).zbar;
          else if (o.kind === 'jac') want = E.jacobian(o.sys, o.at[0], o.at[1], o.at[2]);
          else if (o.kind === 'gen') {
            // Cilíndricas con z entre dos superficies que dependen de r: ∫θ ∫r ∫z f r dz dr dθ (cuadratura anidada).
            want = E.quad1((t) => E.quad1((r) => { const zr = o.Z(r); return r * E.quad1((z) => f(r * Math.cos(t), r * Math.sin(t), z), zr[0], zr[1]); }, o.R[0], o.R[1]), o.T[0], o.T[1]);
          }
          else throw new Error(`${q.id}: ck.kind desconocido ${o.kind}`);
          if (o.scale) want *= o.scale;
          const got = q.answer(v);
          if (Math.abs(got - want) > 1e-8 * Math.max(1, Math.abs(want))) throw new Error(`${q.id} ${JSON.stringify(v)}: respuesta ${got}, numérica ${want}`);
          checked++;
        }
      });
      if (checked < 20 * Math.ceil(numeric * 0.8)) throw new Error(`solo ${checked / 20} de ${numeric} preguntas numéricas tienen ck`);
    });
  }
};
