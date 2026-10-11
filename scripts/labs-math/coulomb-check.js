// Pruebas de LabMath.coulomb (lab coulomb-check, Física 2 · S02). Cada resultado se compara con
// un cálculo independiente: fórmula escalar a mano, simetrías conocidas, bisección numérica, atan2.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM, math }) => {
  const C = LM.coulomb;
  const k = 8.99e9;
  const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300);

  test('coulomb: magnitud k|q1q2|/r² y dirección por signos', () => {
    near(C.magnitude(3e-6, -4e-6, 0.05), k * 12e-12 / 0.0025, 1e-9);
    // Repulsión: la fuerza sobre t se aleja de s; atracción: apunta hacia s.
    const rep = C.force({ q: 2e-6, x: 0, y: 0 }, { q: 5e-6, x: 0.03, y: 0.04 });
    near(rep.mag, k * 10e-12 / 0.0025, 1e-9);
    near(rep.x / rep.mag, 0.6, 1e-12); near(rep.y / rep.mag, 0.8, 1e-12);
    const att = C.force({ q: -2e-6, x: 0, y: 0 }, { q: 5e-6, x: 0.03, y: 0.04 });
    near(att.x / att.mag, -0.6, 1e-12); near(att.y / att.mag, -0.8, 1e-12);
    // Ángulo: atan2 de las componentes, en [0, 360).
    near(att.ang, Math.atan2(-0.8, -0.6) * 180 / Math.PI + 360, 1e-9);
  });

  test('coulomb: tercera ley de Newton y suma de pares', () => {
    const a = { q: 3e-6, x: 0.01, y: -0.02 }, b = { q: -7e-9, x: 0.06, y: 0.03 };
    const fab = C.force(a, b), fba = C.force(b, a);
    near(fab.x + fba.x, 0, 1e-15); near(fab.y + fba.y, 0, 1e-15);
    // La fuerza neta total de un sistema aislado es cero.
    const list = [{ q: 2e-6, x: 0, y: 0 }, { q: -3e-6, x: 0.04, y: 0 }, { q: 5e-6, x: 0.01, y: 0.07 }, { q: -1e-6, x: 0.08, y: 0.05 }];
    let sx = 0, sy = 0;
    list.forEach((_, i) => { const n = C.net(list, i); sx += n.x; sy += n.y; });
    near(sx, 0, 1e-12); near(sy, 0, 1e-12);
  });

  test('coulomb: superposición contra el cálculo escalar componente por componente', () => {
    // Triángulo rectángulo: q1 = +3 μC en el origen, q2 = −4 μC a 5 cm en x, q3 = +2 μC a 4 cm en y.
    const n = C.net([{ q: 3e-6, x: 0, y: 0 }, { q: -4e-6, x: 0.05, y: 0 }, { q: 2e-6, x: 0, y: 0.04 }], 0);
    const F2 = k * 12e-12 / 0.0025, F3 = k * 6e-12 / 0.0016;        // atracción hacia +x, repulsión hacia −y
    near(n.x, F2, 1e-9); near(n.y, -F3, 1e-9);
    near(n.mag, Math.sqrt(F2 * F2 + F3 * F3), 1e-9);
    near(n.ang, 360 - Math.atan(F3 / F2) * 180 / Math.PI, 1e-9);
    eq(n.parts.length, 2); eq(n.parts[0].from, 1); eq(n.parts[1].from, 2);
  });

  test('coulomb: simetrías (cuadrado y triángulo equilátero)', () => {
    const q = 1e-6, a = 0.1, F = k * q * q / (a * a);
    // Cuadrado de lado a con cargas iguales: la neta en una esquina va por la diagonal.
    const sq = C.net([{ q, x: 0, y: 0 }, { q, x: a, y: 0 }, { q, x: 0, y: a }, { q, x: a, y: a }], 0);
    near(sq.mag, F * (Math.SQRT2 + 0.5), 1e-9 * F);
    near(sq.ang, 225, 1e-9);
    // Triángulo equilátero: la neta sobre un vértice vale √3 F y apunta por la bisectriz.
    const tri = C.net([{ q, x: 0, y: 0 }, { q, x: a, y: 0 }, { q, x: a / 2, y: a * Math.sqrt(3) / 2 }], 2);
    near(tri.mag, Math.sqrt(3) * F, 1e-9 * F);
    near(tri.ang, 90, 1e-9);
    // Una carga en el centro de un cuadrado con cuatro cargas iguales: neta cero.
    const c = C.net([{ q, x: 0, y: 0 }, { q, x: a, y: 0 }, { q, x: 0, y: a }, { q, x: a, y: a }, { q: -q, x: a / 2, y: a / 2 }], 4);
    near(c.mag, 0, 1e-9 * F);
  });

  test('coulomb: punto de equilibrio contra bisección numérica', () => {
    const cases = [[4e-6, 9e-6, 0.1], [2e-6, 2e-6, 0.06], [-3e-9, -5e-9, 0.2], [4e-6, -9e-6, 0.1], [-9e-6, 4e-6, 0.1], [1e-6, -2e-6, 0.05]];
    cases.forEach(([q1, q2, d]) => {
      const x = C.equilibrium(q1, q2, d);
      // Fuerza neta sobre una carga de prueba de +1 nC en x, sin usar la fórmula cerrada.
      const F = (t) => C.lineForce([{ q: q1, x: 0 }, { q: q2, x: d }, { q: 1e-9, x: t }], 2);
      let lo, hi;
      if (q1 * q2 > 0) { lo = d * 1e-6; hi = d * (1 - 1e-6); }
      else if (Math.abs(q1) < Math.abs(q2)) { lo = -50 * d; hi = -d * 1e-6; }
      else { lo = d * (1 + 1e-6); hi = 50 * d; }
      if (F(lo) * F(hi) > 0) throw new Error('la bisección no encierra la raíz');
      for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (F(lo) * F(m) <= 0) hi = m; else lo = m; }
      near(x, (lo + hi) / 2, 1e-9 * d);
    });
    eq(C.equilibrium(2e-6, -2e-6, 0.1), null);
  });

  test('coulomb: eléctrica contra gravitacional (protón y electrón)', () => {
    const r = C.ratio(C.E, -C.E, C.MP, C.ME, 5.3e-11);
    if (rel(r, k * 1.6e-19 * 1.6e-19 / (6.67e-11 * 1.67e-27 * 9.11e-31)) > 1e-12) throw new Error('cociente ' + r);
    // No depende de la distancia: las dos van como 1/r².
    if (rel(C.ratio(C.E, -C.E, C.MP, C.ME, 1), r) > 1e-12) throw new Error('el cociente depende de r');
    near(r / 1e39, 2.27, 0.01);
  });

  test('coulomb: conversión μC/nC y cm → SI (ida y vuelta)', () => {
    const si = C.toSI([{ q: 3, x: 5, y: 4 }], 'uC')[0];
    near(si.q, 3e-6, 1e-21); near(si.x, 0.05, 1e-15); near(si.y, 0.04, 1e-15);
    const n = C.toSI([{ q: -7, x: 12, y: 0 }], 'nC')[0];
    near(n.q / 1e-9, -7, 1e-12); near(n.x * 100, 12, 1e-12);
  });

  test('coulomb: diagnóstico de los errores típicos', () => {
    const list = [{ q: 3, x: 2, y: 2 }, { q: -4, x: 7, y: 2 }, { q: 2, x: 2, y: 6 }];
    const tr = C.net(C.toSI(list, 'uC'), 0), m = C.mistakes(list, 0, 'uC');
    eq(C.diagnose(list, 0, 'uC', { x: tr.x, y: tr.y }), 'ok');
    eq(C.diagnose(list, 0, 'uC', { mag: tr.mag, ang: tr.ang }), 'ok');
    eq(C.diagnose(list, 0, 'uC', { x: tr.x * 1.01, y: tr.y }), 'ok');
    // Cada error, calculado por otro camino: r en cm, cargas sin μ, r sin cuadrado.
    const cmWay = C.net(list.map((c) => ({ q: c.q * 1e-6, x: c.x, y: c.y })), 0);
    near(m.cm.x, cmWay.x, 1e-9 * Math.abs(cmWay.x)); near(m.cm.y, cmWay.y, 1e-9 * Math.abs(cmWay.y));
    const noMu = C.net(list.map((c) => ({ q: c.q, x: c.x / 100, y: c.y / 100 })), 0);
    near(m.prefix.x, noMu.x, 1e-9 * Math.abs(noMu.x));
    const F2 = k * 12e-12 / 0.05, F3 = k * 6e-12 / 0.04;
    near(m.noSquare.x, F2, 1e-9 * F2); near(m.noSquare.y, -F3, 1e-9 * F3);
    near(m.addMags, tr.parts[0].mag + tr.parts[1].mag, 1e-12);
    eq(C.diagnose(list, 0, 'uC', m.cm), 'cm');
    eq(C.diagnose(list, 0, 'uC', m.prefix), 'prefix');
    eq(C.diagnose(list, 0, 'uC', m.noSquare), 'noSquare');
    eq(C.diagnose(list, 0, 'uC', { x: -tr.x, y: -tr.y }), 'reversed');
    eq(C.diagnose(list, 0, 'uC', { x: -tr.x, y: tr.y }), 'signX');
    eq(C.diagnose(list, 0, 'uC', { x: tr.x, y: -tr.y }), 'signY');
    eq(C.diagnose(list, 0, 'uC', { mag: m.addMags, ang: tr.ang }), 'addMags');
    eq(C.diagnose(list, 0, 'uC', { mag: tr.mag, ang: tr.ang + 40 }), 'angleOff');
    eq(C.diagnose(list, 0, 'uC', { mag: tr.mag * 1.5, ang: tr.ang }), 'magOff');
    eq(C.diagnose(list, 0, 'uC', { x: NaN, y: 1 }), 'bad');
    // En nC el prefijo olvidado multiplica por 10¹⁸.
    const mn = C.mistakes(list, 0, 'nC'), tn = C.net(C.toSI(list, 'nC'), 0);
    near(mn.prefix.mag / tn.mag, 1e18, 1e6);
    eq(C.diagnose(list, 0, 'nC', mn.prefix), 'prefix');
    eq(C.diagnose(list, 0, 'nC', { x: tn.x, y: tn.y }), 'ok');
  });

  // Banco de S02: cada pregunta numérica con `setup` se recalcula con LabMath.coulomb.
  const bankFile = path.join(__dirname, '..', '..', 'data', 'fisica-2', 'bank', 'sesion-02.js');
  if (fs.existsSync(bankFile)) {
    test('coulomb: banco f2 S02 contra LabMath (superposición vectorial)', () => {
      const { loadData } = require('../lib/load');
      const ROOT = path.join(__dirname, '..', '..');
      const W = loadData([path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
      const Q = W.CB_BANK.f2.S02.questions.filter((q) => q.setup);
      if (Q.length < 30) throw new Error('solo ' + Q.length + ' preguntas con setup');
      let seed = 7;
      const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      Q.forEach((q) => {
        for (let i = 0; i < 60; i++) {
          const v = W.CBExercises.instance(q, rand);
          const want = q.setup(v, C), got = q.answer(v);
          const ok = q.unit === '°' ? C.angDiff(got, want) < 1e-6 : rel(got, want) < 1e-9 || Math.abs(got - want) < 1e-12;
          if (!ok) throw new Error(`${q.id} ${JSON.stringify(v)}: respuesta ${got} y LabMath da ${want}`);
        }
      });
    });
  }
};
