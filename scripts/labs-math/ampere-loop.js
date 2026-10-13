// Pruebas de LabMath.ampere (lab ampere-loop, Física 3 · S08), con oráculos independientes:
// la circulación ∮B·dl de LabMath contra μ₀ I_enc y contra una integral de línea propia (trapecio
// sobre puntos de la trayectoria, campo escrito aquí); el alambre grueso como superposición de
// filamentos en una malla polar; el coaxial con la corriente encerrada integrada numéricamente.
// También revisa el banco f3 S08 contra LabMath.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const A = LM.ampere, MU0 = 4 * Math.PI * 1e-7;
  let seed = 808;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const between = (a, b) => a + (b - a) * rand();
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-30), msg);

  // Campo de alambres escrito aparte (SI): B = μ₀I/2πr · ẑ × r̂.
  function bSI(wires, x, y) {
    let bx = 0, by = 0;
    wires.forEach((w) => { const dx = x - w.x, dy = y - w.y, r2 = dx * dx + dy * dy, k = MU0 * w.I / (2 * Math.PI * r2); bx += -k * dy; by += k * dx; });
    return [bx, by];
  }
  // ∮B·dl con trapecio sobre una poligonal muy fina (m), en T·m.
  function lineInt(wires, pts) {
    let s = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length], b1 = bSI(wires, p[0], p[1]), b2 = bSI(wires, q[0], q[1]);
      s += 0.5 * ((b1[0] + b2[0]) * (q[0] - p[0]) + (b1[1] + b2[1]) * (q[1] - p[1]));
    }
    return s;
  }

  test('ampere: ∮B·dl numérico = μ₀ I_enc (círculos y rectángulos, ambos sentidos)', () => {
    for (let i = 0; i < 120; i++) {
      const wires = [0, 1, 2, 3].map(() => ({ x: between(-10, 10), y: between(-6, 6), I: between(-8, 8) }));
      const P = rand() < 0.5 ? { kind: 'circle', cx: between(-3, 3), cy: between(-2, 2), r: between(2, 6), dir: rand() < 0.5 ? 1 : -1 }
        : { kind: 'rect', x0: between(-7, -2), y0: between(-5, -1), x1: between(2, 7), y1: between(1, 5), dir: rand() < 0.5 ? 1 : -1 };
      // Ningún alambre pegado a la trayectoria (el integrando se vuelve muy picudo).
      const pts = A.points(P, 4000);
      if (wires.some((w) => pts.some((p) => Math.hypot(p[0] - w.x, p[1] - w.y) < 0.6))) continue;
      const want = MU0 * A.enclosed(wires, P);
      near(A.circulation(wires, P) * 1e-6, want, 1e-9 * (1 + Math.abs(want)) + 1e-12);
      near(lineInt(wires.map((w) => ({ x: w.x / 100, y: w.y / 100, I: w.I })), pts.map((p) => [p[0] / 100, p[1] / 100])), want, 2e-3 * Math.max(Math.abs(want), MU0));
      rel(A.ampere(A.enclosed(wires, P)), want * 1e6, 1e-12);
    }
  });

  test('ampere: un alambre de afuera da circulación cero aunque B no sea cero en la trayectoria', () => {
    const w = [{ x: 8, y: 1, I: 7 }], P = { kind: 'circle', cx: 0, cy: 0, r: 4, dir: 1 };
    near(A.circulation(w, P), 0, 1e-10);
    eq(Math.hypot(...bSI([{ x: 0.08, y: 0.01, I: 7 }], 0.04, 0)) > 1e-6, true);
    eq(A.enclosed(w, P), 0);
  });

  // Oráculo del alambre grueso: B en P = (p, 0) como integral en polares centradas en P. Un elemento
  // J·ρ dρ dα a distancia ρ aporta μ₀J dρ dα/2π (sin singularidad), perpendicular a la dirección α:
  //   B = −(μ₀J/2π) ∫ L(α) (−sin α, cos α) dα, con L(α) = largo de la cuerda del disco en la dirección α.
  function diskB(I, R, p, n) {
    const J = I / (Math.PI * R * R);
    let bx = 0, by = 0;
    for (let k = 0; k < n; k++) {
      const a = 2 * Math.PI * (k + 0.5) / n, c = Math.cos(a), s = Math.sin(a), disc = R * R - p * p * s * s;
      let L = 0;
      if (p < R) L = -p * c + Math.sqrt(disc);
      else if (disc > 0 && c < 0) L = 2 * Math.sqrt(disc);
      bx += L * s; by += -L * c;
    }
    const k0 = MU0 * J / (2 * Math.PI) * 2 * Math.PI / n;
    return [k0 * bx, k0 * by];
  }
  test('ampere: alambre grueso contra la integral sobre el disco (polares centradas en P) y μ₀I_enc/2πr', () => {
    const I = 6, R = 0.02;
    for (const r of [0.13 * R, 0.31 * R, 0.57 * R, 0.83 * R, 1.37 * R, 2.4 * R]) {
      const b = diskB(I, R, r, 20000);
      rel(A.thick(I, R, r), Math.hypot(...b), r < R ? 1e-6 : 1e-5, 'r/R = ' + (r / R).toFixed(2));
      eq(b[1] > 0, true, 'antihorario');
      rel(A.thick(I, R, r), MU0 * A.thickEnc(I, R, r) / (2 * Math.PI * r), 1e-12);
    }
    rel(A.thick(I, R, R * (1 - 1e-12)), A.thick(I, R, R), 1e-9, 'continuo en R');
  });

  test('ampere: coaxial, I_enc integrando la densidad de corriente', () => {
    for (let i = 0; i < 60; i++) {
      const I = between(1, 10), a = between(0.5, 2), b = a + between(0.5, 3), c = b + between(0.2, 1), r = between(0.1, c + 2);
      // ∫ J·2πs ds: J = I/πa² en el núcleo y −I/π(c² − b²) en el forro.
      const n = 200000, rr = r;
      let enc = 0;
      for (let k = 0; k < n; k++) {
        const s = rr * (k + 0.5) / n, J = s < a ? I / (Math.PI * a * a) : s < b ? 0 : s < c ? -I / (Math.PI * (c * c - b * b)) : 0;
        enc += J * 2 * Math.PI * s * rr / n;
      }
      near(A.coaxEnc(I, a, b, c, r), enc, 2e-3 * I);
      rel(A.coax(I, a, b, c, r) * 2 * Math.PI * r, MU0 * A.coaxEnc(I, a, b, c, r), 1e-12);
    }
    near(A.coax(5, 1, 2, 3, 3.5), 0, 0);
  });

  test('ampere: tubo conductor, I_enc integrando J = I/π(b² − a²) en la pared', () => {
    for (let i = 0; i < 60; i++) {
      const I = between(1, 10), a = between(0.5, 2), b = a + between(0.2, 2), r = between(0.1, b + 1), n = 200000;
      let enc = 0;
      for (let k = 0; k < n; k++) { const s = r * (k + 0.5) / n; if (s > a && s < b) enc += I / (Math.PI * (b * b - a * a)) * 2 * Math.PI * s * r / n; }
      near(A.pipeEnc(I, a, b, r), enc, 2e-3 * I);
      near(A.pipe(I, a, b, r) * 2 * Math.PI * r, MU0 * A.pipeEnc(I, a, b, r), 1e-12 * MU0 * I);
      near(A.pipeUT(I, a, b, r), A.pipe(I, a / 100, b / 100, r / 100) * 1e6, 1e-9 * A.pipeUT(I, a, b, b));
    }
  });

  test('ampere: reto y diagnóstico', () => {
    const c = { kind: 'loop', wires: [{ x: -2, y: 1, I: 6 }, { x: 2, y: -1, I: -2 }, { x: 8, y: 3, I: 5 }], path: { kind: 'rect', x0: -5, y0: -4, x1: 5, y1: 4, dir: 1 } };
    rel(A.truth(c), MU0 * 4 * 1e6, 1e-12);
    const m = A.mistakes(c);
    eq(A.diagnose(c, A.truth(c)), 'ok');
    eq(A.diagnose(c, m.all), 'all');
    eq(A.diagnose(c, m.abs), 'abs');
    eq(A.diagnose(c, -A.truth(c)), 'sign');
    eq(A.diagnose(c, 4), 'noMu');
    eq(A.diagnose(c, 77), 'bad');
    const t = { kind: 'thick', I: 6, R: 2, r: 1 }, mt = A.mistakes(t);
    rel(A.truth(t), 2e-7 * 6 * 0.01 / 0.0004 * 1e6, 1e-12);
    eq(A.diagnose(t, A.truth(t)), 'ok');
    eq(A.diagnose(t, mt.outside), 'outside');
    eq(A.diagnose(t, mt.linear), 'linear');
    eq(A.diagnose(t, mt.cm), 'cm');
  });

  // Banco f3 S08: cada numérica trae oracle(v, LM).
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-3/bank/sesion-08.js');
  if (fs.existsSync(bankFile)) test('ampere: banco f3 S08 contra LabMath (200 instancias por pregunta)', () => {
    const { loadData } = require('../lib/load');
    const W = loadData([path.join(ROOT, 'shared/js/labs/registry.js'), path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
    const Q = W.CB_BANK.f3.S08.questions;
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
