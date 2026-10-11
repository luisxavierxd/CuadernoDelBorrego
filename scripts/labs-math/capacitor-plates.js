// Pruebas de LabMath.capacitor (lab capacitor-plates, Física 2 · S09) con oráculos independientes:
// C = Q/V con V = ∫E·dl integrado numéricamente contra cada fórmula cerrada; el campo de Gauss
// contra la suma de Coulomb de cargas repartidas (hoja, línea y cascarón discretizados); el
// cilíndrico y el esférico que tienden al de placas cuando b − a ≪ a; la esfera aislada como
// límite b → ∞; V fija o Q fija al mover las placas; y el banco de S09 contra rutas alternas.
'use strict';
const path = require('path');
const fs = require('fs');
const { loadData } = require('../lib/load');

module.exports = ({ test, eq, near, LM }) => {
  const C = LM.capacitor, E0 = 8.85e-12;
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-30), msg);
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = (lo, hi) => lo + (hi - lo) * rnd();

  test('capacitor: fórmulas cerradas con valores a mano', () => {
    rel(C.plates(0.01, 0.002), 8.85e-12 * 0.01 / 0.002, 1e-12);                 // 44.25 pF
    rel(C.plates(0.01, 0.002, 3), 3 * 44.25e-12, 1e-12);
    rel(C.cylinder(0.5e-3, 2e-3, 1), 2 * Math.PI * E0 / Math.log(4), 1e-12);    // ≈ 40.1 pF/m
    rel(C.sphere(0.05, 0.10), 4 * Math.PI * E0 * 0.005 / 0.05, 1e-12);          // ≈ 11.1 pF
    rel(C.isolated(6.37e6), 4 * Math.PI * E0 * 6.37e6, 1e-12);                   // la Tierra ≈ 708 μF
    rel(C.cap('sphere', { a: 0.05, b: 0.1, kappa: 2 }), 2 * C.sphere(0.05, 0.1), 1e-12);
  });

  test('capacitor: C = Q / ∫E·dl (integrado) coincide con la fórmula cerrada en las cuatro geometrías', () => {
    for (let t = 0; t < 60; t++) {
      const kappa = 1 + Math.floor(rnd() * 19) / 2;
      const a = pick(1e-4, 0.05), b = a * pick(1.01, 80);
      const cases = [
        ['plates', { A: pick(1e-4, 0.05), d: pick(1e-4, 1e-2), kappa }],
        ['cylinder', { a, b, L: pick(0.05, 10), kappa }],
        ['sphere', { a, b, kappa }],
        ['isolated', { R: pick(1e-3, 10), kappa }]
      ];
      cases.forEach(([g, p]) => {
        rel(C.fromIntegral(g, p), C.cap(g, p), 1e-9, `${g} ${JSON.stringify(p)}`);
        rel(C.fromIntegral(g, p, 1e12), C.cap(g, p) * 1e12, 1e-9, `${g} en pF`);
        const V = pick(1, 50);
        rel(C.charge(g, p, V), C.cap(g, p) * V, 1e-9, `${g} Q = CV`);
      });
    }
  });

  test('capacitor: V = ∫E·dl con una regla del punto medio propia (en r, sin cambio de variable)', () => {
    // Integración aparte: punto medio en r con 200 000 tramos y E escrito aquí con k = 1/(4πε₀).
    const kk = 1 / (4 * Math.PI * E0);
    for (let t = 0; t < 12; t++) {
      const Q = pick(1e-10, 1e-7), a = pick(1e-3, 0.05), b = a * pick(1.2, 6), L = pick(0.2, 3);
      const Es = (r) => kk * Q / (r * r), Ec = (r) => 2 * kk * Q / (L * r);
      const mid = (f) => { const n = 200000, h = (b - a) / n; let s = 0; for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * h); return s * h; };
      rel(C.Vint('sphere', { a, b }, Q), mid(Es), 1e-8, `esfera ${t}`);
      rel(C.Vint('cylinder', { a, b, L }, Q), mid(Ec), 1e-8, `cilindro ${t}`);
      rel(Q / mid(Es), C.sphere(a, b), 1e-8);
      rel(Q / mid(Ec), C.cylinder(a, b, L), 1e-8);
    }
  });

  test('capacitor: el campo de Gauss coincide con la suma de Coulomb de la carga discretizada', () => {
    const kk = 1 / (4 * Math.PI * E0);
    // Cascarón esférico interior de radio a con carga Q: campo radial en r > a (anillos en θ).
    [[0.02, 0.035], [0.05, 0.12], [0.01, 0.011]].forEach(([a, r]) => {
      const Q = 3e-9, n = 4000;
      let Er = 0;
      for (let i = 0; i < n; i++) {
        const th = (i + 0.5) * Math.PI / n, dq = Q * Math.sin(th) * (Math.PI / n) / 2;   // dq de cada anillo
        // anillo de radio a·sinθ a la altura a·cosθ; punto en el eje a distancia r del centro
        const z = r - a * Math.cos(th), R = a * Math.sin(th);
        Er += kk * dq * z / Math.pow(z * z + R * R, 1.5);
      }
      rel(Er, C.field('sphere', { a, b: 2 * r }, Q, r), 2e-5, `esfera a=${a} r=${r}`);
    });
    // Alambre largo (±2000 r) con λ = Q/L: campo perpendicular a distancia r.
    [[0.003, 1], [0.01, 2]].forEach(([r, L]) => {
      const Q = 2e-9, lam = Q / L, half = 2000 * r, n = 400000, h = 2 * half / n;
      let Ep = 0;
      for (let i = 0; i < n; i++) { const x = -half + (i + 0.5) * h; Ep += kk * lam * h * r / Math.pow(x * x + r * r, 1.5); }
      rel(Ep, C.field('cylinder', { a: r / 2, b: 2 * r, L }, Q, r), 2e-3, `cilindro r=${r}`);
    });
    // Dos hojas (discos de radio 2000 z, con σ y −σ): entre ellas se suman y dan σ/ε₀.
    [[0.002, 0.01], [0.005, 0.04]].forEach(([d, A]) => {
      const Q = 1e-9, sig = Q / A, z = d / 2, R = 2000 * z, n = 200000;
      let Ez = 0;                                   // un disco, anillos de radio s y ancho ds (cambio s = z tan φ)
      for (let i = 0; i < n; i++) {
        const ph = (i + 0.5) * Math.atan(R / z) / n, s = z * Math.tan(ph), ds = z / (Math.cos(ph) ** 2) * Math.atan(R / z) / n;
        Ez += kk * sig * 2 * Math.PI * s * ds * z / Math.pow(z * z + s * s, 1.5);
      }
      rel(2 * Ez, C.field('plates', { A, d }, Q), 2e-3, `placas d=${d}`);
    });
  });

  test('capacitor: cilíndrico y esférico tienden al de placas cuando b − a ≪ a', () => {
    [1e-2, 1e-3, 1e-4].forEach((eps) => {
      const a = 0.03, b = a * (1 + eps), L = 0.8, d = b - a;
      const cyl = C.cylinder(a, b, L), sph = C.sphere(a, b);
      rel(cyl, C.plates(2 * Math.PI * a * L, d), eps, `cilindro ε=${eps}`);
      rel(sph, C.plates(4 * Math.PI * a * a, d), 1.01 * eps, `esfera ε=${eps}`);
      rel(sph, C.plates(4 * Math.PI * a * b, d), 1e-12, 'esfera con A = 4πab es exacta');
    });
  });

  test('capacitor: la esfera aislada es el límite b → ∞ del esférico', () => {
    const a = 0.04;
    let prev = Infinity;
    [1e2, 1e4, 1e6, 1e8].forEach((m) => {
      const err = Math.abs(C.sphere(a, a * m) / C.isolated(a) - 1);
      near(err, 1 / (m - 1), 1e-9, `b = ${m}a`);
      if (!(err < prev)) throw new Error('el error no baja');
      prev = err;
    });
    rel(C.fromIntegral('isolated', { R: a }), C.isolated(a), 1e-12);
  });

  test('capacitor: batería conectada (V fija) o desconectada (Q fija) al mover las placas', () => {
    for (let t = 0; t < 30; t++) {
      const A = pick(1e-3, 0.04), d = pick(5e-4, 5e-3), V0 = pick(1, 50), f = pick(0.3, 4), kappa = 1 + Math.floor(rnd() * 8) / 2;
      const C0 = C.plates(A, d, kappa);
      const q = C.platesChange(A, d, kappa, V0, 'Q', null, f * d);
      rel(q.Q, C0 * V0, 1e-12, 'Q fija'); rel(q.V, f * V0, 1e-12, 'V crece con d'); rel(q.E, V0 / d, 1e-12, 'E no cambia con Q fija');
      rel(q.U, f * q.U0, 1e-12, 'U crece con d (alguien hizo trabajo)');
      const v = C.platesChange(A, d, kappa, V0, 'V', null, f * d);
      rel(v.V, V0, 1e-12, 'V fija'); rel(v.Q, C0 * V0 / f, 1e-12, 'Q baja con d'); rel(v.E, V0 / (f * d), 1e-12);
      rel(v.U, v.U0 / f, 1e-12);
      // Dieléctrico con Q fija: V y E bajan κ veces; con V fija, Q sube κ veces.
      const kq = C.platesChange(A, d, 1, V0, 'Q', null, null, kappa), kv = C.platesChange(A, d, 1, V0, 'V', null, null, kappa);
      rel(kq.V, V0 / kappa, 1e-12); rel(kv.Q, kappa * C.plates(A, d) * V0, 1e-12);
      // change genérico: ½QV = ½CV² = Q²/2C.
      const g = C.change(C0, C0 / f, V0, 'Q');
      rel(g.U, g.Q * g.Q / (2 * g.C), 1e-12);
    }
  });

  test('capacitor: el diagnóstico reconoce cada error típico', () => {
    const P = { plates: { A: 0.01, d: 0.002, kappa: 3 }, cylinder: { a: 5e-4, b: 2e-3, L: 1.5, kappa: 2.5 }, sphere: { a: 0.05, b: 0.1, kappa: 2 } };
    Object.keys(P).forEach((g) => {
      ['C', 'Q'].concat(g === 'plates' ? ['Vd'] : []).forEach((k) => {
        const r = C.answers(k, g, P[g], 12);
        eq(C.diagnose(k, g, P[g], 12, r.truth), 'ok', `${g} ${k}`);
        eq(C.diagnose(k, g, P[g], 12, r.truth * 1.004), 'ok', `${g} ${k} redondeado`);
        Object.keys(r).filter((x) => x !== 'truth').forEach((m) => eq(C.diagnose(k, g, P[g], 12, r[m]), m, `${g} ${k} ${m}`));
        eq(C.diagnose(k, g, P[g], 12, r.truth * 3.7), 'bad', `${g} ${k} otro`);
        eq(C.diagnose(k, g, P[g], 12, NaN), 'bad');
      });
    });
    // El valor real de Vd sale también de Q/C con las placas al doble.
    rel(C.answers('Vd', 'plates', P.plates, 12).truth, C.plates(0.01, 0.002, 3) * 12 / C.plates(0.01, 0.004, 3), 1e-12);
    // Sin dieléctrico, olvidar κ no es un error distinguible.
    eq(C.diagnose('C', 'plates', { A: 0.01, d: 0.002, kappa: 1 }, 12, C.plates(0.01, 0.002)), 'ok');
  });

  // Banco de S09: cada pregunta numérica con `alt` se recalcula por otra ruta (integral numérica).
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-2/bank/sesion-09.js');
  if (fs.existsSync(bankFile)) {
    test('capacitor: el banco de S09 coincide con las rutas alternas (alt)', () => {
      const W = loadData([path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], { LabMath: LM });
      const Q = W.CB_BANK.f2.S09.questions.filter((q) => typeof q.alt === 'function');
      if (Q.length < 30) throw new Error(`solo ${Q.length} preguntas con alt`);
      Q.forEach((q) => {
        let n = 0;
        for (let i = 0; i < 400 && n < 40; i++) {
          const v = {};
          Object.entries(q.vars || {}).forEach(([k, r]) => { const st = r[2] || 1, m = Math.round((r[1] - r[0]) / st); v[k] = +(r[0] + st * Math.floor(rnd() * (m + 1))).toFixed(10); });
          if (q.where && !q.where(v)) continue;
          n++;
          const a = q.answer(v), b = q.alt(v, LM);
          if (!(Math.abs(a - b) <= 1e-6 * Math.max(Math.abs(b), 1e-30))) throw new Error(`${q.id} ${JSON.stringify(v)}: ${a} contra ${b}`);
        }
        if (!n) throw new Error(`${q.id}: ninguna instancia cumple where`);
      });
    });
  }
};
