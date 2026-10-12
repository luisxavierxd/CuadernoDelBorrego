// Pruebas de LabMath.ohm (lab iv-curve, Física 2 · S11) con oráculos independientes:
// las tres formas de la potencia coinciden; la pendiente de mínimos cuadrados de puntos del
// resistor (y del alambre) es 1/R, calculada aquí con otra fórmula; R = ρL/A contra un alambre
// partido en tramos en serie y en hilos en paralelo; R(T) del foco contra una iteración de punto
// fijo del balance térmico; la deriva contra n sacada de la densidad del cobre; el costo contra
// joules convertidos a mano; y el banco de S11 recalculado por otra ruta (alt).
'use strict';
const path = require('path');
const fs = require('fs');
const { loadData } = require('../lib/load');

module.exports = ({ test, eq, near, LM }) => {
  const O = LM.ohm;
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-30), msg);
  let seed = 23;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = (lo, hi) => lo + (hi - lo) * rnd();

  test('ohm: valores a mano', () => {
    // Cobre, 10 m, 1 mm de diámetro: A = 7.854e-7 m², R = 0.219 Ω.
    rel(O.area(1e-3), 7.853981633974483e-7, 1e-12);
    rel(O.wireR(1.72e-8, 10, 1), 1.72e-8 * 10 / 7.853981633974483e-7, 1e-12);
    rel(O.current(12, 4), 3, 1e-12);
    rel(O.electronsPerSecond(1), 6.25e18, 1e-12);
    rel(O.RT(20, 4.5e-3, 100), 29, 1e-12);
    rel(O.tempRise(20, 29, 4.5e-3), 100, 1e-12);
    const c = O.cost(1000, 2, 30, 1.5);
    rel(c.kWh, 60, 1e-12); rel(c.pesos, 90, 1e-12);
    eq(O.diodeI(0), 0);
  });

  test('ohm: P = IV = I²R = V²/R en cientos de casos', () => {
    for (let t = 0; t < 300; t++) {
      const V = pick(-50, 50), R = pick(0.1, 5000), p = O.powers(V, R);
      rel(p.IV, p.I2R, 1e-12, `IV vs I²R ${V} ${R}`);
      rel(p.IV, p.V2R, 1e-12, `IV vs V²/R ${V} ${R}`);
      rel(p.I, V / R, 1e-12);
      if (!(p.IV >= 0)) throw new Error('la potencia en un resistor no puede ser negativa');
    }
  });

  test('ohm: la pendiente de mínimos cuadrados de la curva del resistor es 1/R', () => {
    for (let t = 0; t < 40; t++) {
      const R = pick(5, 900), n = 3 + Math.floor(rnd() * 30), pts = [];
      for (let i = 0; i < n; i++) { const V = pick(-12, 12); pts.push([V, O.iv('resistor', { R }, V)]); }
      const f = O.fit(pts);
      // Otra fórmula: m = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)².
      const xb = pts.reduce((s, q) => s + q[0], 0) / n, yb = pts.reduce((s, q) => s + q[1], 0) / n;
      const m2 = pts.reduce((s, q) => s + (q[0] - xb) * (q[1] - yb), 0) / pts.reduce((s, q) => s + (q[0] - xb) ** 2, 0);
      rel(f.m, m2, 1e-9, 'dos fórmulas de la pendiente');
      rel(f.m, 1 / R, 1e-9, `pendiente = 1/R con R = ${R}`);
      near(f.b, 0, 1e-12, 'pasa por el origen');
    }
    // El alambre también: puntos muestreados en el barrido del lab.
    const p = { mat: 'nicromo', L: 12, d: 0.4 }, pts = [];
    for (let V = -12; V <= 12; V += 0.5) pts.push([V, O.iv('wire', p, V)]);
    rel(1 / O.fit(pts).m, O.rAt('wire', p, 3), 1e-9);
    // El foco no: la pendiente de la cuerda baja al subir V (R crece).
    const s1 = O.iv('bulb', { R0: 20 }, 2) / 2, s2 = O.iv('bulb', { R0: 20 }, 12) / 12;
    if (!(s2 < s1 / 3)) throw new Error('el foco debería doblarse');
  });

  test('ohm: R = ρL/A contra tramos en serie y hilos en paralelo', () => {
    Object.keys(O.MAT).forEach((k) => {
      const m = O.MAT[k];
      for (let t = 0; t < 20; t++) {
        const L = pick(0.1, 200), dmm = pick(0.05, 5), R = O.wireR(m.rho, L, dmm);
        // 1000 tramos de L/1000 en serie: se suman.
        const n = 1000, r1 = m.rho * (L / n) / (Math.PI * (dmm / 2000) ** 2);
        rel(n * r1, R, 1e-9, `${k} serie`);
        // El área partida en 64 hilos iguales en paralelo: 1/R = Σ 1/r.
        const hilos = 64, rh = m.rho * L / (Math.PI * (dmm / 2000) ** 2 / hilos);
        rel(1 / (hilos / rh), R, 1e-9, `${k} paralelo`);
      }
    });
    // Duplicar L y d deja R a la mitad.
    rel(O.wireR(1.72e-8, 20, 2) / O.wireR(1.72e-8, 10, 1), 0.5, 1e-12);
  });

  test('ohm: el foco por iteración de punto fijo del balance térmico', () => {
    for (let t = 0; t < 60; t++) {
      const R0 = pick(5, 80), V = pick(-15, 15), b = { R0, alpha: 4.5e-3, h: 3.6e-4, T0: 20 };
      // Iteración amortiguada: R ← R₀(1 + α ΔT) con ΔT = V²/(R h).
      let R = R0;
      for (let i = 0; i < 4000; i++) R = 0.5 * R + 0.5 * R0 * (1 + b.alpha * V * V / (R * b.h));
      rel(O.bulbR(V, b), R, 1e-9, `R0=${R0} V=${V}`);
      const dT = V * V / (R * b.h);
      rel(O.bulbT(V, b), 20 + dT, 1e-9);
      rel(O.RT(R0, b.alpha, dT), O.bulbR(V, b), 1e-9, 'cumple R = R₀(1 + αΔT)');
      rel(O.iv('bulb', { R0 }, V), V / R, 1e-9);
    }
    // A 12 V con R₀ = 20 Ω: R = 200 Ω y unos 2000 °C de calentamiento.
    rel(O.bulbR(12), 200, 1e-9);
    rel(O.bulbT(12), 2020, 1e-9);
  });

  test('ohm: el diodo casi no conduce antes de 0.7 V', () => {
    let prev = -Infinity;
    for (let V = -1; V <= 0.85 + 1e-9; V += 0.05) {
      const I = O.diodeI(V);
      if (!(I > prev)) throw new Error('la corriente debe crecer con V');
      prev = I;
    }
    if (!(O.diodeI(0.4) < 1e-5)) throw new Error('a 0.4 V casi no pasa nada');
    if (!(O.diodeI(0.7) > 1e-3 && O.diodeI(0.7) < 2e-3)) throw new Error('a 0.7 V ≈ 1 mA');
    if (!(Math.abs(O.diodeI(-1)) < 1.01e-9)) throw new Error('en inversa solo pasa Is');
    // Por cada 0.05·ln 10 V más, la corriente se multiplica por 10 (lejos de 0).
    rel(O.diodeI(0.6 + 0.05 * Math.LN10) + 1e-9, 10 * (O.diodeI(0.6) + 1e-9), 1e-9);
  });

  test('ohm: deriva con n sacada de la densidad del cobre', () => {
    // n = ρ_m N_A / M con un electrón libre por átomo: 8.93e3 kg/m³ · 6.022e23 / 0.06355 kg/mol.
    const n = 8.93e3 * 6.022e23 / 0.06355;
    rel(n, O.MAT.cobre.n, 2e-3, 'n del cobre');
    for (let t = 0; t < 40; t++) {
      const I = pick(0.1, 30), dmm = pick(0.2, 4), A = Math.PI * (dmm / 2000) ** 2;
      const vd = O.drift(I, O.MAT.cobre.n, A);
      // Otra ruta: carga en un cilindro de largo v_d·(1 s) = la que pasa en 1 s.
      const Qcil = O.MAT.cobre.n * 1.60e-19 * A * vd;
      rel(Qcil, I, 1e-12);
      rel(O.density(I, A), O.MAT.cobre.n * 1.60e-19 * vd, 1e-12, 'J = nqv_d');
      rel(O.electronsPerSecond(I), O.MAT.cobre.n * A * vd, 1e-12, 'electrones por segundo');
    }
  });

  test('ohm: energía en kWh y costo contra joules', () => {
    for (let t = 0; t < 50; t++) {
      const P = pick(5, 3000), hpd = pick(0.1, 24), days = 1 + Math.floor(rnd() * 31), price = pick(0.5, 6);
      const J = P * hpd * 3600 * days;                          // joules
      const c = O.cost(P, hpd, days, price);
      rel(c.kWh, J / 3.6e6, 1e-12);
      rel(c.pesos, J / 3.6e6 * price, 1e-12);
    }
  });

  test('ohm: el diagnóstico reconoce cada error típico', () => {
    const cases = [
      ['Rwire', 'wire', { mat: 'nicromo', L: 10, d: 0.5 }, 6],
      ['Rwire', 'wire', { mat: 'cobre', L: 40, d: 1.2 }, 6],
      ['I', 'resistor', { R: 150 }, 9],
      ['I', 'wire', { mat: 'nicromo', L: 30, d: 0.3 }, 7.5],
      ['P', 'resistor', { R: 40 }, 6],
      ['P', 'bulb', { R0: 20 }, 9],
      ['P', 'diode', {}, 0.7],
      ['R', 'resistor', { R: 220 }, 5],
      ['R', 'bulb', { R0: 24 }, 10],
      ['R', 'diode', {}, 0.75]
    ];
    cases.forEach(([k, e, p, V]) => {
      const r = O.answers(k, e, p, V);
      eq(O.diagnose(k, e, p, V, r.truth), 'ok', `${k} ${e}`);
      eq(O.diagnose(k, e, p, V, r.truth * 1.004), 'ok', `${k} ${e} redondeado`);
      Object.keys(r).filter((x) => x !== 'truth').forEach((m) => {
        if (Math.abs(r[m] - r.truth) <= 0.02 * Math.abs(r.truth)) return;
        eq(O.diagnose(k, e, p, V, r[m]), m, `${k} ${e} ${m}`);
      });
      eq(O.diagnose(k, e, p, V, r.truth * 3.7), 'bad', `${k} ${e} otro`);
      eq(O.diagnose(k, e, p, V, NaN), 'bad');
    });
    // Los valores reales salen de otra cuenta.
    rel(O.answers('Rwire', 'wire', { mat: 'cobre', L: 40, d: 1.2 }, 6).truth, 1.72e-8 * 40 / (Math.PI * 0.0006 ** 2), 1e-12);
    rel(O.answers('P', 'bulb', { R0: 20 }, 9).truth, 81 / O.bulbR(9, { R0: 20 }), 1e-12);
  });

  // Banco de S11: cada pregunta numérica con `alt` se recalcula por otra ruta (LabMath.ohm).
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-2/bank/sesion-11.js');
  if (fs.existsSync(bankFile)) {
    test('ohm: el banco de S11 coincide con las rutas alternas (alt)', () => {
      const W = loadData([path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], { LabMath: LM });
      const Q = W.CB_BANK.f2.S11.questions.filter((q) => typeof q.alt === 'function');
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
