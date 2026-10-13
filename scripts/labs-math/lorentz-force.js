// Pruebas de LabMath.lorentz (lab lorentz-force, Física 3 · S02), con oráculos independientes:
// el producto cruz por la suma con el símbolo de Levi-Civita, la tabla î × ĵ = k̂, la magnitud
// |q|vB sin θ con el ángulo medido aparte, la perpendicularidad y la potencia nula.
// También revisa las respuestas numéricas del banco f3 S02 contra LabMath.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const L = LM.lorentz;
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const rand = rng(202);
  const between = (a, b) => a + (b - a) * rand();
  const vec = () => [between(-5, 5), between(-5, 5), between(-5, 5)];
  // Levi-Civita: ε_ijk = +1 (par), −1 (impar), 0 (índice repetido).
  const eps = (i, j, k) => (i === j || j === k || i === k ? 0 : ((j - i + 3) % 3 === 1 ? 1 : -1));
  function crossLC(a, b) { return [0, 1, 2].map((i) => { let s = 0; for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) s += eps(i, j, k) * a[j] * b[k]; return s; }); }
  const nrm = (a) => Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);

  test('lorentz: v × B contra la suma de Levi-Civita y F = q v × B', () => {
    for (let i = 0; i < 300; i++) {
      const q = between(-5, 5), v = vec(), B = vec(), F = L.force(q, v, B), c = crossLC(v, B);
      for (let k = 0; k < 3; k++) near(F.vec[k], q * c[k], 1e-9 * (1 + Math.abs(q * c[k])));
      near(F.mag, nrm(c) * Math.abs(q), 1e-9 * (1 + F.mag));
    }
  });

  test('lorentz: tabla de vectores unitarios (î × ĵ = k̂, ĵ × k̂ = î, k̂ × î = ĵ) y su orden', () => {
    const I = [1, 0, 0], J = [0, 1, 0], K = [0, 0, 1];
    eq(L.axisName(L.cross(I, J)), '+z'); eq(L.axisName(L.cross(J, K)), '+x'); eq(L.axisName(L.cross(K, I)), '+y');
    eq(L.axisName(L.cross(J, I)), '−z'); eq(L.axisName(L.cross(K, J)), '−x'); eq(L.axisName(L.cross(I, K)), '−y');
    eq(L.axisName([1, 1, 0]), null); eq(L.axisName([0, 0, 0]), null);
    // Carga negativa invierte el sentido.
    eq(L.axisName(L.force(-1, I, J).vec), '−z');
  });

  test('lorentz: F es perpendicular a v y a B, y no hace trabajo', () => {
    for (let i = 0; i < 300; i++) {
      const q = between(-5, 5), v = vec(), B = vec(), F = L.force(q, v, B);
      const scl = (1 + F.mag) * (1 + nrm(v)) * (1 + nrm(B));
      near(L.dot(F.vec, v), 0, 1e-9 * scl); near(L.dot(F.vec, B), 0, 1e-9 * scl);
      near(L.power(q, v, B), 0, 1e-9 * scl);
    }
  });

  test('lorentz: |F| = |q| v B sin θ con θ medido por el producto punto', () => {
    for (let i = 0; i < 300; i++) {
      const q = between(-5, 5), v = vec(), B = vec();
      const th = Math.acos(Math.max(-1, Math.min(1, (v[0] * B[0] + v[1] * B[1] + v[2] * B[2]) / (nrm(v) * nrm(B))))) * 180 / Math.PI;
      near(L.angle(v, B), th, 1e-7);
      near(L.magnitude(q, nrm(v), nrm(B), th), L.force(q, v, B).mag, 1e-9 * (1 + L.force(q, v, B).mag));
      near(L.vPerp(v, B), nrm(v) * Math.sin(th * Math.PI / 180), 1e-9 * (1 + nrm(v)));
    }
    near(L.magnitude(2, 3, 0.5, 0), 0, 1e-15); near(L.magnitude(2, 3, 0.5, 90), 3, 1e-12);
    near(L.fieldFor(3, 2, 3, 90), 0.5, 1e-12);
  });

  test('lorentz: q (E + v × B) suma la parte eléctrica', () => {
    for (let i = 0; i < 100; i++) {
      const q = between(-5, 5), E = vec(), v = vec(), B = vec(), F = L.lorentz(q, E, v, B), c = crossLC(v, B);
      for (let k = 0; k < 3; k++) near(F.vec[k], q * (E[k] + c[k]), 1e-9 * (1 + Math.abs(F.vec[k])));
    }
    // Selector: E = −v × B ⇒ fuerza neta cero.
    const v = [4, 0, 0], B = [0, 0, 0.5], E = L.cross(v, B).map((x) => -x);
    near(L.lorentz(3, E, v, B).mag, 0, 1e-12);
  });

  test('lorentz: diagnóstico del reto', () => {
    const c = { q: -2, v: [3, 0, 0], B: [0, 0.5, 0] }, t = L.force(c.q, c.v, c.B).vec;
    eq(L.diagnose(c, t), 'ok');
    eq(L.diagnose(c, t.map((x) => x * 1.02)), 'ok');
    eq(L.diagnose(c, t.map((x) => -x)), 'sign');
    eq(L.diagnose({ q: 2, v: c.v, B: c.B }, L.force(2, c.v, c.B).vec.map((x) => -x)), 'order');
    eq(L.diagnose(c, L.cross(c.v, c.B)), 'noQ');
    eq(L.diagnose(c, t.map((x) => x * 1000)), 'units');
    const d = { q: 3, v: [1, 2, 0], B: [0, 1, 0.5] }, u = L.force(d.q, d.v, d.B).vec;
    eq(L.diagnose(d, [u[0], u[1], u[2] + 5]), 'oneComp');
    eq(L.diagnose(d, [7, 7, 7]), 'bad');
    eq(L.diagnose(d, [NaN, 0, 0]), 'bad');
  });

  // Banco f3 S02: cada numérica trae oracle(v, LM), que recalcula con LabMath por otro camino.
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-3/bank/sesion-02.js');
  if (fs.existsSync(bankFile)) test('lorentz: banco f3 S02 contra LabMath (200 instancias por pregunta)', () => {
    const { loadData } = require('../lib/load');
    const W = loadData([path.join(ROOT, 'shared/js/labs/registry.js'), path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
    const Q = W.CB_BANK.f3.S02.questions;
    let seed = 99;
    const r2 = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
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
