// Pruebas de LabMath.parwires (lab parallel-wires, Física 3 · S07), con oráculos independientes:
// el campo de un alambre largo como integral de Biot–Savart a lo largo de z (Simpson, escrita
// aquí), la fuerza F = I L × B en 3D con producto cruz propio, la tercera ley de Newton y la
// fórmula μ₀I₁I₂/2πd. También revisa el banco f3 S07 contra LabMath.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const W = LM.parwires, MU0 = 4 * Math.PI * 1e-7;
  let seed = 707;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const between = (a, b) => a + (b - a) * rand();
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-30), msg);
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

  // Oráculo: alambre a lo largo de z (de −L a L) por (wx, wy) en m, corriente I (+z); campo en (x, y, 0), en T.
  // Simpson en u con z = s·sinh(u) (dz = s·cosh(u) du), para que los trozos sean finos cerca del punto.
  function bsWire(wx, wy, I, x, y, L, n) {
    const s = 0.01, U = Math.asinh(L / s), out = [0, 0, 0], hh = 2 * U / n;
    for (let i = 0; i <= n; i++) {
      const u = -U + i * hh, z = s * Math.sinh(u), dz = s * Math.cosh(u), w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2;
      const r = [x - wx, y - wy, -z], m = Math.hypot(...r), c = cross([0, 0, 1], r), k = MU0 / (4 * Math.PI) * I * dz / (m * m * m);
      out[0] += w * k * c[0]; out[1] += w * k * c[1]; out[2] += w * k * c[2];
    }
    return out.map((v) => v * hh / 3);
  }

  test('parwires: el campo de un alambre (cm, A → µT) contra Biot–Savart sobre un alambre muy largo', () => {
    for (let i = 0; i < 100; i++) {
      const w = { x: between(-8, 8), y: between(-5, 5), I: between(-10, 10) }, x = between(-10, 10), y = between(-6, 6);
      if (Math.hypot(x - w.x, y - w.y) < 0.5) continue;
      const b = W.wireField(w, x, y), o = bsWire(w.x / 100, w.y / 100, w.I, x / 100, y / 100, 1e4, 4000);
      // Alambre de ±100 m: lo que falta para infinito es ~(r/L)², despreciable.
      rel(b.x, o[0] * 1e6, 1e-5); rel(b.y, o[1] * 1e6, 1e-5);
      rel(Math.hypot(b.x, b.y), W.single(w.I, Math.hypot(x - w.x, y - w.y) / 100) * 1e6, 1e-12);
    }
  });

  test('parwires: B es tangente (perpendicular a r) y gira antihorario si I sale de la página', () => {
    for (let i = 0; i < 100; i++) {
      const w = { x: 0, y: 0, I: between(0.5, 10) }, x = between(-9, 9), y = between(-6, 6);
      if (Math.hypot(x, y) < 0.5) continue;
      const b = W.wireField(w, x, y);
      near(b.x * x + b.y * y, 0, 1e-9 * Math.hypot(b.x, b.y) * Math.hypot(x, y));
      eq(x * b.y - y * b.x > 0, true, 'antihorario');
    }
  });

  test('parwires: fuerza por metro = I ẑ × B (producto cruz propio), μ₀I₁I₂/2πd y tercera ley', () => {
    for (let i = 0; i < 200; i++) {
      const ws = [0, 1, 2].map(() => ({ x: between(-10, 10), y: between(-6, 6), I: between(-8, 8) }));
      if (Math.min(Math.hypot(ws[0].x - ws[1].x, ws[0].y - ws[1].y), Math.hypot(ws[0].x - ws[2].x, ws[0].y - ws[2].y), Math.hypot(ws[1].x - ws[2].x, ws[1].y - ws[2].y)) < 1) continue;
      const F = ws.map((w, k) => W.force(ws, k));
      near(F[0].x + F[1].x + F[2].x, 0, 1e-9 * (F[0].mag + F[1].mag + F[2].mag));
      near(F[0].y + F[1].y + F[2].y, 0, 1e-9 * (F[0].mag + F[1].mag + F[2].mag));
      // Sobre el alambre 0, con el campo de los otros dos calculado con Biot–Savart propio.
      let bx = 0, by = 0;
      [1, 2].forEach((j) => { const o = bsWire(ws[j].x / 100, ws[j].y / 100, ws[j].I, ws[0].x / 100, ws[0].y / 100, 1e4, 4000); bx += o[0]; by += o[1]; });
      const f = cross([0, 0, ws[0].I], [bx, by, 0]);
      rel(F[0].x, f[0] * 1e6, 2e-5); rel(F[0].y, f[1] * 1e6, 2e-5);
    }
    // Dos alambres: atracción con corrientes iguales; magnitud μ₀I₁I₂/2πd.
    const two = [{ x: 0, y: 0, I: 3 }, { x: 5, y: 0, I: 4 }];
    rel(W.force(two, 1).x, -W.forcePerLength(3, 4, 0.05) * 1e6, 1e-12);
    eq(W.force([{ x: 0, y: 0, I: 3 }, { x: 5, y: 0, I: -4 }], 1).x > 0, true, 'opuestas se repelen');
    rel(W.forcePerLength(1, 1, 1), 2e-7, 1e-12, 'definición del ampere');
  });

  test('parwires: reto y diagnóstico', () => {
    const c = { kind: 'field', wires: [{ x: -4, y: 0, I: 6 }, { x: 4, y: 0, I: 2 }], P: { x: 0, y: 0 } };
    const t = W.truth(c);
    rel(t.mag, 20, 1e-12); near(t.ang, 90, 1e-9);
    const m = W.mistakes(c);
    eq(W.diagnose(c, { mag: 20, ang: 90 }), 'ok');
    eq(W.diagnose(c, { mag: m.sumMag.mag, ang: 90 }), 'sumMag');
    eq(W.diagnose(c, { mag: 20, ang: 270 }), 'reversed');
    eq(W.diagnose(c, { mag: m.oneWire.mag, ang: m.oneWire.ang }), 'oneWire');
    eq(W.diagnose(c, { mag: m.cm.mag, ang: m.cm.ang }), 'cm');
    const d = { kind: 'field', wires: [{ x: 0, y: 0, I: 5 }, { x: 4, y: 0, I: -3 }], P: { x: 0, y: 3 } };
    const md = W.mistakes(d);
    eq(W.diagnose(d, { mag: md.radial.mag, ang: md.radial.ang }), 'radial');
    eq(W.diagnose(d, { mag: W.truth(d).mag * 1.5, ang: W.truth(d).ang }), 'dirOk');
    eq(W.diagnose(d, { mag: NaN, ang: 0 }), 'bad');
    const f = { kind: 'force', wires: [{ x: -2, y: 0, I: 4 }, { x: 0, y: 0, I: 5 }, { x: 3, y: 0, I: -6 }], k: 1 };
    const tf = W.truth(f).F, mf = W.mistakes(f);
    // Escrito aparte: el de la izquierda (igual) atrae hacia −x; el de la derecha (opuesto) repele hacia −x.
    rel(tf, -(2e-7 * 4 * 5 / 0.02 + 2e-7 * 6 * 5 / 0.03) * 1e6, 1e-12);
    eq(W.diagnose(f, { F: tf }), 'ok');
    eq(W.diagnose(f, { F: -tf }), 'sign');
    eq(W.diagnose(f, { F: mf.oneWire.F }), 'oneWire');
    eq(W.diagnose(f, { F: mf.cm.F }), 'cm');
  });

  // Banco f3 S07: cada numérica trae oracle(v, LM).
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-3/bank/sesion-07.js');
  if (fs.existsSync(bankFile)) test('parwires: banco f3 S07 contra LabMath (200 instancias por pregunta)', () => {
    const { loadData } = require('../lib/load');
    const Wd = loadData([path.join(ROOT, 'shared/js/labs/registry.js'), path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
    const Q = Wd.CB_BANK.f3.S07.questions;
    let s2 = 99;
    const r2 = () => { s2 = (s2 * 1103515245 + 12345) % 2147483648; return s2 / 2147483648; };
    const missing = Q.filter((q) => q.type === 'numeric' && typeof q.oracle !== 'function').map((q) => q.id);
    if (missing.length) throw new Error('numéricas sin oracle: ' + missing.join(', '));
    Q.filter((q) => q.type === 'numeric').forEach((q) => {
      for (let i = 0; i < 200; i++) {
        const v = Wd.CBExercises.instance(q, r2), a = q.answer(v), o = q.oracle(v, LM);
        if (!(Math.abs(a - o) <= 1e-6 * Math.max(1e-30, Math.abs(o)) + 1e-30)) throw new Error(`${q.id} ${JSON.stringify(v)}: banco ${a}, LabMath ${o}`);
      }
    });
  });
};
