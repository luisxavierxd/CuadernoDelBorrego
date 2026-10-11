// Pruebas de LabMath.coords (lab coord-convert, Cálculo 2 · S03). Oráculos independientes:
// ida y vuelta en cientos de puntos de todos los octantes (con puntos sobre los ejes),
// cilíndricas ↔ esféricas directo contra el camino por rectangulares, valores exactos
// conocidos, errores típicos escritos aquí a mano y superficies comprobadas con su
// ecuación rectangular en puntos muestreados. Al final, las respuestas numéricas del
// banco de S03 se recalculan con LabMath.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM, math }) => {
  const C = LM.coords;
  const PI = Math.PI, TAU = 2 * PI, D = 180 / PI;
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  // Malla de 7³ puntos: todos los octantes, los tres ejes, los planos coordenados y el origen.
  const V = [-3.7, -2, -0.5, 0, 0.5, 2, 3.7];
  const GRID = [];
  V.forEach((x) => V.forEach((y) => V.forEach((z) => GRID.push([x, y, z]))));

  test('coords: norm2pi deja θ en [0, 2π) sin mover el ángulo', () => {
    [-7, -PI, -0.1, 0, 0.1, PI, TAU, 7, 13.5, -TAU].forEach((t) => {
      const u = C.norm2pi(t);
      if (!(u >= 0 && u < TAU)) throw new Error(`norm2pi(${t}) = ${u}`);
      near(Math.cos(u), Math.cos(t), 1e-12); near(Math.sin(u), Math.sin(t), 1e-12);
    });
    eq(C.norm2pi(TAU - 1e-14), 0, 'casi 2π cuenta como 0');
  });

  test('coords: valores exactos conocidos (OpenStax §2.7)', () => {
    let s = C.rectToSph(1, 1, Math.SQRT2);
    near(s.rho, 2, 1e-12); near(s.theta, PI / 4, 1e-12); near(s.phi, PI / 4, 1e-12);
    s = C.rectToSph(-1, Math.sqrt(3), 2);
    near(s.rho, 2 * Math.SQRT2, 1e-12); near(s.theta, 2 * PI / 3, 1e-12); near(s.phi, PI / 4, 1e-12);
    s = C.rectToSph(0, 0, -5); near(s.rho, 5, 1e-12); near(s.phi, PI, 1e-12);
    let c = C.rectToCyl(0, -3, 7); near(c.r, 3, 1e-12); near(c.theta, 3 * PI / 2, 1e-12); near(c.z, 7, 0);
    c = C.rectToCyl(-2, -2, 0); near(c.theta, 5 * PI / 4, 1e-12);
    const p = C.cylToRect(4, 2 * PI / 3, -2); near(p.x, -2, 1e-12); near(p.y, 2 * Math.sqrt(3), 1e-12);
    const q = C.sphToCyl(8, PI / 6, 2 * PI / 3); near(q.r, 4 * Math.sqrt(3), 1e-12); near(q.z, -4, 1e-12);
  });

  test('coords: ida y vuelta rect → cil → rect y rect → esf → rect en 343 puntos (ejes incluidos)', () => {
    GRID.forEach(([x, y, z]) => {
      const c = C.rectToCyl(x, y, z), a = C.cylToRect(c.r, c.theta, c.z);
      near(a.x, x, 1e-12, `cil (${x},${y},${z}) x`); near(a.y, y, 1e-12); near(a.z, z, 0);
      const s = C.rectToSph(x, y, z), b = C.sphToRect(s.rho, s.theta, s.phi);
      near(b.x, x, 1e-12, `esf (${x},${y},${z}) x`); near(b.y, y, 1e-12); near(b.z, z, 1e-12);
      // Rangos de la convención: r, ρ ≥ 0; θ ∈ [0, 2π); φ ∈ [0, π].
      if (!(c.r >= 0 && s.rho >= 0 && c.theta >= 0 && c.theta < TAU && s.phi >= 0 && s.phi <= PI)) throw new Error(`rango fuera en (${x},${y},${z})`);
      // Oráculo independiente: ρ² = x² + y² + z² y r² = x² + y².
      near(s.rho * s.rho, x * x + y * y + z * z, 1e-9); near(c.r * c.r, x * x + y * y, 1e-9);
    });
  });

  test('coords: ida y vuelta desde cilíndricas y esféricas (400 puntos al azar)', () => {
    const R = rng(7);
    for (let i = 0; i < 400; i++) {
      const r = 0.05 + 5 * R(), th = TAU * R(), z = -5 + 10 * R(), rho = 0.05 + 5 * R(), ph = 0.01 + (PI - 0.02) * R();
      const p = C.cylToRect(r, th, z), c = C.rectToCyl(p.x, p.y, p.z);
      near(c.r, r, 1e-12); near(c.theta, th, 1e-9); near(c.z, z, 0);
      const q = C.sphToRect(rho, th, ph), s = C.rectToSph(q.x, q.y, q.z);
      near(s.rho, rho, 1e-12); near(s.theta, th, 1e-9); near(s.phi, ph, 1e-9);
    }
  });

  test('coords: cilíndricas ↔ esféricas directo = pasando por rectangulares', () => {
    GRID.forEach(([x, y, z]) => {
      const c = C.rectToCyl(x, y, z), s = C.rectToSph(x, y, z);
      const s2 = C.cylToSph(c.r, c.theta, c.z), c2 = C.sphToCyl(s.rho, s.theta, s.phi);
      near(s2.rho, s.rho, 1e-12); near(s2.phi, s.phi, 1e-12); near(c2.r, c.r, 1e-12); near(c2.z, c.z, 1e-12);
      if (c.r > 1e-9) { near(s2.theta, s.theta, 1e-12); near(c2.theta, c.theta, 1e-12); }
      // convert() en los 6 sentidos vuelve al punto de partida.
      ['rect', 'cyl', 'sph'].forEach((a) => ['rect', 'cyl', 'sph'].forEach((b) => {
        if (a === b) return;
        const ga = C.convert('rect', a, [x, y, z]), back = C.toRect(b, C.convert(a, b, ga));
        near(back[0], x, 1e-9, `${a}→${b} x`); near(back[1], y, 1e-9); near(back[2], z, 1e-9);
      }));
    });
  });

  test('coords: diagnose acepta la respuesta, θ equivalente y cualquier θ sobre el eje z', () => {
    eq(C.diagnose('rect', 'sph', [-1, Math.sqrt(3), 2], [2 * Math.SQRT2, 2 * PI / 3, PI / 4]).kind, 'ok');
    eq(C.diagnose('rect', 'cyl', [1, -1, 3], [Math.SQRT2, -PI / 4, 3]).kind, 'ok', 'θ = −π/4 equivale a 7π/4');
    eq(C.diagnose('rect', 'cyl', [0, 0, 3], [0, 2.5, 3]).kind, 'ok', 'eje z: cualquier θ');
    eq(C.diagnose('rect', 'sph', [0, 0, 0], [0, 1, 2]).kind, 'ok', 'origen: cualquier θ y φ');
    eq(C.diagnose('cyl', 'rect', [4, 2 * PI / 3, -2], [-2, 3.46, -2]).kind, 'ok', 'redondeo a 2 decimales');
    eq(C.diagnose('rect', 'sph', [3, 4, 0], [5, 0.93, 1.57]).kind, 'ok');
    const p = C.diagnose('rect', 'sph', [3, 4, 12], [13, 0.93, 2]);
    eq(p.kind, 'partial'); eq(JSON.stringify(p.wrong), JSON.stringify([false, false, true]));
    eq(C.diagnose('rect', 'sph', [3, 4, 12], [1, 2, 3]).kind, 'bad');
    eq(C.diagnose('rect', 'sph', [3, 4, 12], [1, NaN, 3]).kind, 'invalid');
  });

  test('coords: diagnose reconoce cada error típico (escrito a mano) en muchos puntos', () => {
    let n = 0;
    GRID.forEach(([x, y, z]) => {
      const r = Math.hypot(x, y), rho = Math.hypot(x, y, z);
      if (r < 0.4 || Math.abs(z) < 0.4) return;
      const th = (Math.atan2(y, x) + TAU) % TAU, ph = Math.acos(z / rho);
      const lat = Math.atan2(z, r);                         // ángulo desde el plano xy
      const g = [x, y, z], far = Math.abs(rho - r) > 0.03 * rho;   // si z es chica, r ≈ ρ y no se distinguen
      const expect = (to, s, key, from = 'rect', given = g) => {
        const d = C.diagnose(from, to, given, s);
        if (d.kind !== 'warn' || d.key !== key) throw new Error(`${from}→${to} (${given.map((v) => v.toFixed(3))}) con ${s.map((v) => v.toFixed(3))}: esperaba ${key}, dio ${d.kind}/${d.key}`);
        n++;
      };
      // rect → esf
      if (x < 0) expect('sph', [rho, Math.atan(y / x), ph], 'quadrant');
      if (Math.abs(lat - ph) > 0.05) expect('sph', [rho, th, lat], 'phiFromPlane');
      if (th > 0.05) expect('sph', [rho, th * D, ph], 'degrees');
      expect('sph', [rho, th, ph * D], 'degrees');
      if (far) expect('sph', [r, th, ph], 'swapRRho');
      // rect → cil
      if (x < 0) expect('cyl', [r, Math.atan(y / x), z], 'quadrant');
      if (th > 0.05) expect('cyl', [r, th * D, z], 'degrees');
      if (far) expect('cyl', [rho, th, z], 'swapRRho');
      // esf → rect y esf → cil (φ medido desde el plano, ρ usado como r, calculadora en grados)
      const sg = [rho, th, ph];
      if (Math.abs(lat - ph) > 0.05) {
        expect('rect', [rho * Math.cos(ph) * Math.cos(th), rho * Math.cos(ph) * Math.sin(th), rho * Math.sin(ph)], 'phiFromPlane', 'sph', sg);
        expect('cyl', [rho * Math.cos(ph), th, rho * Math.sin(ph)], 'phiFromPlane', 'sph', sg);
      }
      if (far) expect('rect', [rho * Math.cos(th), rho * Math.sin(th), rho * Math.cos(ph)], 'swapRRho', 'sph', sg);
      if (far) expect('cyl', [rho, th, z], 'swapRRho', 'sph', sg);
      const dg = (a) => Math.cos(a / D);
      if (th > 0.3) expect('rect', [r * dg(th), r * Math.sin(th / D), z], 'degrees', 'cyl', [r, th, z]);
      // cil → esf
      if (Math.abs(lat - ph) > 0.05) expect('sph', [rho, th, lat], 'phiFromPlane', 'cyl', [r, th, z]);
      if (far) expect('sph', [r, th, ph], 'swapRRho', 'cyl', [r, th, z]);
    });
    if (n < 1000) throw new Error(`solo ${n} casos`);
  });

  test('coords: un error que coincide con la respuesta no se reporta como error', () => {
    // φ = π/4: el complemento es igual. En el cuadrante I, arctan(y/x) ya es θ.
    eq(C.diagnose('rect', 'sph', [1, 1, Math.SQRT2], [2, PI / 4, PI / 4]).kind, 'ok');
    eq(C.mistakes('rect', 'sph', [0, 2, 1]).quadrant, undefined, 'x = 0: no hay arctan(y/x)');
    // z = 0: r = ρ, así que esa respuesta es correcta.
    eq(C.diagnose('rect', 'sph', [3, 4, 0], [5, Math.atan2(4, 3), PI / 2]).kind, 'ok');
  });

  test('coords: superficies de coordenada constante contra su ecuación rectangular', () => {
    const R = rng(11);
    const cases = [
      ['r', 2, 'cilindro', (x, y) => Math.abs(x * x + y * y - 4) < 1e-9],
      ['theta', 2 * PI / 3, 'semiplano', (x, y) => Math.abs(y * Math.cos(2 * PI / 3) - x * Math.sin(2 * PI / 3)) < 1e-9 && x * Math.cos(2 * PI / 3) + y * Math.sin(2 * PI / 3) >= -1e-9],
      ['z', -1.5, 'plano-horizontal', (x, y, z) => Math.abs(z + 1.5) < 1e-12],
      ['rho', 3, 'esfera', (x, y, z) => Math.abs(x * x + y * y + z * z - 9) < 1e-9],
      ['phi', PI / 4, 'cono-arriba', (x, y, z) => Math.abs(z - Math.hypot(x, y)) < 1e-9],
      ['phi', 5 * PI / 6, 'cono-abajo', (x, y, z) => Math.abs(z + Math.sqrt(3) * Math.hypot(x, y)) < 1e-9],
      ['phi', PI / 2, 'plano-xy', (x, y, z) => Math.abs(z) < 1e-12]
    ];
    cases.forEach(([v, c, kind, pred]) => {
      eq(C.surface(v, c).kind, kind, `${v} = ${c}`);
      for (let i = 0; i < 100; i++) {
        const a = 0.1 + 4 * R(), th = TAU * R(), z = -4 + 8 * R(), ph = PI * R();
        let p;
        if (v === 'r') p = C.cylToRect(c, th, z);
        else if (v === 'theta') p = C.cylToRect(a, c, z);
        else if (v === 'z') p = C.cylToRect(a, th, c);
        else if (v === 'rho') p = C.sphToRect(c, th, ph);
        else p = C.sphToRect(a, th, c);
        if (!pred(p.x, p.y, p.z)) throw new Error(`${v} = ${c}: el punto (${p.x}, ${p.y}, ${p.z}) no cumple la ecuación de ${kind}`);
      }
    });
    eq(C.surface('r', 0).kind, 'eje-z'); eq(C.surface('rho', 0).kind, 'origen'); eq(C.surface('rho', -1).kind, 'vacio');
    eq(C.surface('phi', 0).kind, 'semieje-z+'); eq(C.surface('phi', PI).kind, 'semieje-z-'); eq(C.surface('x', 2).kind, 'plano-vertical');
  });

  test('coords: piForm y puntos amables dentro de la caja', () => {
    eq(C.piForm(2 * PI / 3), '2π/3'); eq(C.piForm(PI), 'π'); eq(C.piForm(PI / 4), 'π/4'); eq(C.piForm(0), '0');
    eq(C.piForm(-PI / 2), '−π/2'); eq(C.piForm(1), null); eq(C.piForm(11 * PI / 6), '11π/6');
    const R = rng(3);
    ['rect', 'cyl', 'sph'].forEach((sys) => {
      for (let i = 0; i < 300; i++) {
        const g = C.nicePoint(sys, R), p = C.toRect(sys, g);
        if (!p.every((v) => Math.abs(v) <= 4 + 1e-9)) throw new Error(`${sys}: ${g} se sale de la caja`);
        if (sys !== 'rect' && C.piForm(g[1]) === null) throw new Error(`${sys}: θ = ${g[1]} sin forma con π`);
        if (sys === 'sph' && C.piForm(g[2]) === null) throw new Error(`φ = ${g[2]} sin forma con π`);
      }
    });
  });

  // Banco de S03: cada pregunta numérica trae oracle(v, LabMath.coords), que se compara en 60 instancias.
  const bankFile = path.join(__dirname, '..', '..', 'data', 'calculo-2', 'bank', 'sesion-03.js');
  if (fs.existsSync(bankFile)) test('coords: respuestas numéricas del banco c2 S03 = LabMath', () => {
    const { loadData } = require('../lib/load');
    const ROOT = path.join(__dirname, '..', '..');
    const W = loadData(['labs/registry', 'labs/antiderivative-check', 'exercises', 'quiz/engine', 'quiz/bank-kit'].map((n) => path.join(ROOT, 'shared/js', n + '.js')), {});
    loadData(bankFile, W);
    const Q = W.CB_BANK.c2.S03.questions, R = rng(5);
    let checked = 0;
    Q.filter((q) => q.oracle).forEach((q) => {
      for (let i = 0; i < 60; i++) {
        const v = W.CBExercises.instance(q, R), val = q.oracle(v, C), want = q.answer(v);
        const ok = Math.abs(val - want) <= 1e-9 * Math.max(1, Math.abs(want));
        if (!ok) throw new Error(`${q.id} ${JSON.stringify(v)}: banco ${want} y LabMath ${val}`);
        checked++;
      }
    });
    const numeric = Q.filter((q) => q.type === 'numeric').length, withOracle = Q.filter((q) => q.oracle).length;
    if (withOracle < numeric) throw new Error(`${numeric - withOracle} preguntas numéricas sin oracle`);
    if (!checked) throw new Error('ninguna pregunta con oracle');
  });
};
