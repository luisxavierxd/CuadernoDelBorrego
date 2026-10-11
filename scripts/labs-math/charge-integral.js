// Pruebas de LabMath.chargeIntegral (Física 2 · S04): cada fórmula cerrada contra la suma
// vectorial de N ≥ 2000 cargas puntuales (Coulomb, sin usar la fórmula), los límites
// (lejos → kQ/r², L → ∞ → 2kλ/r, R → ∞ → σ/2ε₀) y el diagnóstico de errores típicos.
'use strict';
module.exports = ({ test, eq, near, LM }) => {
  const CI = LM.chargeIntegral;
  const K = 8.99e9, EPS0 = 8.85e-12, KD = 1 / (4 * Math.PI * EPS0);
  const rel = (a, b) => Math.abs(a - b) / Math.abs(b);

  // Suma independiente: cargas puntuales escritas aquí, campo de Coulomb vectorial.
  function sumPoints(charges, P, k) {
    let ex = 0, ey = 0, ez = 0;
    for (const [x, y, z, q] of charges) {
      const rx = P[0] - x, ry = P[1] - y, rz = P[2] - z, r = Math.hypot(rx, ry, rz), f = k * q / (r * r * r);
      ex += f * rx; ey += f * ry; ez += f * rz;
    }
    return [ex, ey, ez];
  }
  const N = 4000;
  function rodPts(x0, L, Q) { const o = []; for (let i = 0; i < N; i++) o.push([x0 + (i + 0.5) * L / N, 0, 0, Q / N]); return o; }

  test('charge-integral: varilla en su eje = suma de 4000 cargas', () => {
    for (const [L, Q, d] of [[0.2, 5e-9, 0.1], [0.4, 2e-9, 0.03], [0.05, 8e-9, 0.3]]) {
      const e = sumPoints(rodPts(0, L, Q), [L + d, 0, 0], K);
      near(rel(CI.rodAxis(L, Q, d), e[0]), 0, 1e-5, `L=${L} d=${d}`);
      near(Math.hypot(e[1], e[2]), 0, 1e-9);
    }
  });
  test('charge-integral: varilla en la bisectriz = suma de 4000 cargas (la x se cancela)', () => {
    for (const [L, Q, y] of [[0.2, 5e-9, 0.1], [0.4, 3e-9, 0.02], [0.1, 6e-9, 0.25]]) {
      const e = sumPoints(rodPts(-L / 2, L, Q), [0, y, 0], K);
      near(rel(CI.rodBisector(L, Q, y), e[1]), 0, 1e-5, `L=${L} y=${y}`);
      near(Math.abs(e[0]) / e[1], 0, 1e-9, 'componente x');
    }
  });
  test('charge-integral: arco en su centro = suma de 4000 cargas', () => {
    for (const [R, Q, th] of [[0.1, 5e-9, 180], [0.15, 4e-9, 90], [0.05, 2e-9, 300], [0.2, 7e-9, 40]]) {
      const t = th * Math.PI / 180, pts = [];
      for (let i = 0; i < N; i++) { const a = Math.PI / 2 - t / 2 + (i + 0.5) * t / N; pts.push([R * Math.cos(a), R * Math.sin(a), 0, Q / N]); }
      const e = sumPoints(pts, [0, 0, 0], K);
      near(rel(CI.arc(R, Q, th), -e[1]), 0, 1e-6, `θ0=${th}`);
      near(Math.abs(e[0]) / Math.abs(e[1]), 0, 1e-9);
    }
    near(rel(CI.semicircle(0.1, 5e-9), 2 * K * 5e-9 / (Math.PI * 0.01)), 0, 1e-12, 'semicírculo = 2kQ/(πR²)');
  });
  test('charge-integral: anillo en su eje = suma de 2000 cargas', () => {
    for (const [R, Q, z] of [[0.1, 5e-9, 0.05], [0.2, 3e-9, 0.3], [0.05, 1e-9, 0.01]]) {
      const pts = [];
      for (let i = 0; i < 2000; i++) { const a = 2 * Math.PI * i / 2000; pts.push([R * Math.cos(a), R * Math.sin(a), 0, Q / 2000]); }
      const e = sumPoints(pts, [0, 0, z], K);
      near(rel(CI.ring(R, Q, z), e[2]), 0, 1e-9, `z=${z}`);
      near(Math.hypot(e[0], e[1]) / e[2], 0, 1e-9, 'componentes perpendiculares');
    }
  });
  test('charge-integral: disco en su eje = suma de 2000 × 64 cargas', () => {
    for (const [R, Q, z] of [[0.1, 5e-9, 0.05], [0.2, 8e-9, 0.02], [0.05, 2e-9, 0.2]]) {
      const sig = Q / (Math.PI * R * R), NR = 2000, M = 64, pts = [];
      for (let i = 0; i < NR; i++) {
        const r0 = i * R / NR, r1 = (i + 1) * R / NR, q = sig * Math.PI * (r1 * r1 - r0 * r0) / M, r = (r0 + r1) / 2;
        for (let j = 0; j < M; j++) { const a = 2 * Math.PI * (j + 0.5) / M; pts.push([r * Math.cos(a), r * Math.sin(a), 0, q]); }
      }
      const e = sumPoints(pts, [0, 0, z], KD);
      near(rel(CI.disk(R, Q, z), e[2]), 0, 1e-5, `R=${R} z=${z}`);
    }
  });
  test('charge-integral: discrete del lab converge a la integral (N = 2000)', () => {
    const P = { L: 0.2, R: 0.1, Q: 5e-9, d: 0.08, y: 0.08, z: 0.08, theta: 120 };
    for (const g of ['rod-axis', 'rod-bisector', 'arc', 'ring', 'disk']) {
      const s = CI.discrete(g, P, 2000, 16);
      near(rel(s.along, CI.closed(g, P)), 0, 1e-5, g);
      near(s.perp / s.mag, 0, 1e-9, g + ' sin componente perpendicular');
    }
    // Con un solo trozo, el anillo da la magnitud de una carga puntual a r = √(z² + R²).
    near(rel(CI.discrete('ring', P, 1).mag, K * P.Q / (P.z * P.z + P.R * P.R)), 0, 1e-12, 'anillo con N = 1');
    near(rel(CI.discrete('rod-axis', P, 1).mag, K * P.Q / Math.pow(P.d + P.L / 2, 2)), 0, 1e-12, 'varilla con N = 1');
  });
  test('charge-integral: lejos todo parece carga puntual kQ/r²', () => {
    const Q = 4e-9, pt = (r) => K * Q / (r * r);
    near(rel(CI.rodAxis(0.01, Q, 50), pt(50.005)), 0, 1e-7, 'varilla en el eje');
    near(rel(CI.rodBisector(0.01, Q, 50), pt(50)), 0, 1e-7, 'varilla en la bisectriz');
    near(rel(CI.ring(0.01, Q, 50), pt(50)), 0, 1e-7, 'anillo');
    near(rel(CI.disk(0.01, Q, 50), KD * Q / 2500), 0, 1e-6, 'disco');
    near(rel(CI.arc(0.1, Q, 0.01), pt(0.1)), 0, 1e-8, 'arco muy chico');
  });
  test('charge-integral: tamaño → ∞ da el caso infinito', () => {
    const lam = 3e-9, y = 0.05;
    near(rel(CI.rodBisector(1e5, lam * 1e5, y), 2 * K * lam / y), 0, 1e-9, 'L → ∞: 2kλ/y');
    near(rel(CI.line(lam, y), 2 * K * lam / y), 0, 1e-15);
    const sig = 2e-7, z = 0.03, R = 1e5;
    near(rel(CI.disk(R, sig * Math.PI * R * R, z), sig / (2 * EPS0)), 0, 1e-6, 'R → ∞: σ/2ε₀');
    near(rel(CI.plane(sig), sig / (2 * EPS0)), 0, 1e-15);
    // Un semicírculo en su centro da lo mismo que una línea infinita a distancia R.
    near(rel(CI.semicircle(0.12, 6e-9), CI.line(6e-9 / (Math.PI * 0.12), 0.12)), 0, 1e-12, 'semicírculo = línea infinita');
    near(CI.arc(0.1, 5e-9, 360), 0, 1e-6, 'anillo completo en su centro: 0');
  });
  test('charge-integral: el campo del anillo es máximo en z = R/√2', () => {
    for (const R of [0.03, 0.1, 0.25]) {
      const z = CI.ringMaxZ(R);
      near(z / (R / Math.SQRT2), 1, 1e-12, `R=${R}`);
      const E = (t) => CI.ring(R, 1e-9, t);
      if (!(E(z) > E(z * 1.01) && E(z) > E(z * 0.99))) throw new Error('no es máximo');
    }
  });
  test('charge-integral: diagnóstico de errores típicos', () => {
    const cases = [
      ['rod-axis', { L: 0.2, Q: 5e-9, d: 0.05 }],
      ['rod-bisector', { L: 0.2, Q: 5e-9, y: 0.1 }],
      ['arc', { R: 0.1, Q: 5e-9, theta: 120 }],
      ['ring', { R: 0.1, Q: 5e-9, z: 0.08 }],
      ['disk', { R: 0.1, Q: 5e-9, z: 0.05 }]
    ];
    for (const [g, p] of cases) {
      eq(CI.diagnose(g, p, CI.closed(g, p)), 'ok', g);
      eq(CI.diagnose(g, p, CI.closed(g, p) * 1.005), 'ok', g + ' dentro de 1 %');
      const m = CI.mistakes(g, p);
      for (const k of Object.keys(m)) eq(CI.diagnose(g, p, m[k]), k, `${g} ${k}`);
      eq(CI.diagnose(g, p, CI.closed(g, p) * 1.7 + 1), 'bad', g + ' sin relación');
      eq(CI.diagnose(g, p, NaN), 'bad');
    }
    eq('semicircle' in CI.mistakes('arc', { R: 0.1, Q: 5e-9, theta: 180 }), false, 'en el semicírculo no aplica');
    near(rel(CI.mistakes('disk', { R: 0.1, Q: 5e-9, z: 0.05 }).double, 2 * CI.disk(0.1, 5e-9, 0.05)), 0, 1e-15);
  });
  // Banco de F2 S04: sus respuestas (fórmulas propias del banco) contra LabMath, en 60 instancias cada una.
  test('charge-integral: respuestas del banco f2 S04 contra LabMath', () => {
    const path = require('path');
    const { loadData } = require('../lib/load');
    const root = path.join(__dirname, '..', '..');
    const W = loadData(['shared/js/quiz/bank-kit.js', 'shared/js/exercises.js', 'data/fisica-2/bank/sesion-04.js'].map((f) => path.join(root, f)), {});
    const byId = {};
    W.CB_BANK.f2.S04.questions.forEach((q) => { byId[q.id] = q; });
    const cm = (x) => x / 100, nC = (q) => q * 1e-9;
    const O = {
      'va-eje': (v) => CI.rodAxis(cm(v.L), nC(v.Q), cm(v.d)),
      'va-eje-lambda': (v) => CI.rodAxis(cm(v.L), v.lam * 1e-9 * cm(v.L), cm(v.d)),
      'va-bisectriz': (v) => CI.rodBisector(cm(v.L), nC(v.Q), cm(v.y)),
      'va-bisectriz-lambda': (v) => CI.rodBisector(cm(v.L), v.lam * 1e-9 * cm(v.L), cm(v.y)),
      'va-infinita': (v) => CI.line(v.lam * 1e-9, cm(v.r)),
      'va-eje-fuerza': (v) => v.q * 1e-9 * CI.rodAxis(cm(v.L), nC(v.Q), cm(v.d)) * 1e6,
      'va-compara-infinita': (v) => 100 * CI.rodBisector(cm(v.L), 1e-9 * cm(v.L), cm(v.y)) / CI.line(1e-9, cm(v.y)),
      'ar-semi': (v) => CI.semicircle(cm(v.R), nC(v.Q)),
      'ar-semi-lambda': (v) => CI.semicircle(cm(v.R), v.lam * 1e-9 * Math.PI * cm(v.R)),
      'ar-cuarto': (v) => CI.arc(cm(v.R), nC(v.Q), 90),
      'ar-tres-cuartos': (v) => CI.arc(cm(v.R), nC(v.Q), 270),
      'ar-general': (v) => CI.arc(cm(v.R), v.lam * 1e-9 * cm(v.R) * v.th * Math.PI / 180, v.th),
      'ar-fuerza': (v) => v.q * 1e-9 * CI.semicircle(cm(v.R), nC(v.Q)) * 1e6,
      'an-eje': (v) => CI.ring(cm(v.R), nC(v.Q), cm(v.z)),
      'an-max': (v) => CI.ringMaxZ(v.R),
      'an-max-E': (v) => CI.ring(cm(v.R), nC(v.Q), CI.ringMaxZ(cm(v.R))),
      'an-lambda': (v) => CI.ring(cm(v.R), v.lam * 1e-9 * 2 * Math.PI * cm(v.R), cm(v.z)),
      'an-fuerza': (v) => v.q * 1e-9 * CI.ring(cm(v.R), nC(v.Q), cm(v.z)) * 1e6,
      'di-eje': (v) => CI.disk(cm(v.R), nC(v.Q), cm(v.z)),
      'di-sigma': (v) => CI.disk(cm(v.R), v.s * 1e-6 * Math.PI * cm(v.R) * cm(v.R), cm(v.z)),
      'di-plano': (v) => CI.plane(v.s * 1e-6),
      'di-fuerza': (v) => v.q * 1e-9 * CI.disk(cm(v.R), nC(v.Q), cm(v.z)) * 1e6,
      'li-lejos-varilla': (v) => CI.point(nC(v.Q), v.d),
      'li-linea-aprox': (v) => CI.line(nC(v.Q) / cm(v.L), cm(v.y)),
      'li-plano-aprox': (v) => CI.plane(nC(v.Q) / (Math.PI * cm(v.R) * cm(v.R)))
    };
    const R = (() => { let s = 5; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
    let n = 0;
    for (const id of Object.keys(O)) {
      const q = byId['f2-s04-' + id];
      if (!q) throw new Error('falta ' + id);
      for (let i = 0; i < 60; i++) {
        const v = W.CBExercises.instance(q, R), a = q.answer(v), b = O[id](v);
        if (!(Math.abs(a - b) <= 1e-9 * Math.abs(b))) throw new Error(`${id} ${JSON.stringify(v)}: banco ${a}, LabMath ${b}`);
        n++;
      }
    }
    // Los que pasan por un límite se comparan con la fórmula exacta: deben quedar cerca (< 1 %).
    for (const [id, exact] of [
      ['li-linea-aprox', (v) => CI.rodBisector(cm(v.L), nC(v.Q), cm(v.y))],
      ['li-plano-aprox', (v) => CI.disk(cm(v.R), nC(v.Q), 0.002)],
      ['li-lejos-varilla', (v) => CI.rodAxis(cm(v.L), nC(v.Q), v.d - cm(v.L) / 2)],
      ['li-lejos-disco', (v) => CI.disk(cm(v.R), nC(v.Q), v.z)],
      ['li-anillo-cerca', (v) => CI.ring(cm(v.R), nC(v.Q), v.z / 1000)]
    ]) {
      const q = byId['f2-s04-' + id];
      for (let i = 0; i < 60; i++) { const v = W.CBExercises.instance(q, R); near(q.answer(v) / exact(v), 1, 0.01, id + ' ' + JSON.stringify(v)); }
    }
    const q90 = byId['f2-s04-li-anillo-90'], qm = byId['f2-s04-di-mitad'];
    for (let i = 0; i < 30; i++) {
      const v = W.CBExercises.instance(q90, R), z = cm(q90.answer(v));
      near(CI.ring(cm(v.R), 1e-9, z) / CI.point(1e-9, z), 0.9, 1e-9, 'anillo al 90 %');
      const w = W.CBExercises.instance(qm, R), zm = cm(qm.answer(w));
      near(CI.disk(cm(w.R), 1e-9, zm) / CI.plane(1e-9 / (Math.PI * cm(w.R) * cm(w.R))), 0.5, 1e-9, 'disco a la mitad');
    }
    if (n < 1000) throw new Error('pocas instancias');
  });
  test('charge-integral: los trozos suman la carga total', () => {
    const p = { L: 0.3, R: 0.12, Q: 7e-9, d: 0.1, y: 0.1, z: 0.1, theta: 150 };
    for (const g of ['rod-axis', 'rod-bisector', 'arc', 'ring', 'disk']) {
      const q = CI.pieces(g, p, 37, 12).reduce((s, pc) => s + pc.pts.reduce((t, c) => t + c[3], 0), 0);
      near(rel(q, p.Q), 0, 1e-12, g);
    }
  });
};
