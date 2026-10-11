// Pruebas de LabMath.lagr2 (lab lagrange-two, Cálculo 2 · S10). Oráculos independientes:
// la parametrización cumple g = c₁ y h = c₂ y su derivada coincide con diferencias finitas y es
// paralela a ∇g × ∇h; la búsqueda densa (dorada + bisección sobre φ′) contra un muestreo bruto
// de 100 001 puntos sin afinar; Newton-Lagrange (5 ecuaciones, sin parametrizar) contra la
// búsqueda densa en todos los presets y en casos al azar; en el óptimo ∇f·T ≈ 0 y
// ∇f − λ∇g − μ∇h ≈ 0; casos con solución cerrada; diagnósticos del «casi»; y el banco de S10.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM, math }) => {
  const L2 = LM.lagr2;
  const P = (a, b, c, d) => ({ type: 'plane', n: [a, b, c], c: d });
  const FUNS = ['x^2 + y^2 + z^2', 'z', 'x + 2y', 'x + 2y + 3z', '20 + x*y + z', 'x*y*z', 'e^(x/3) + y^2', 'x^2 - y + 2z^2'];
  let seed = 10;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const pick = (a, b) => Math.round(a + (b - a) * rnd());
  // Pareja al azar: plano ∩ cilindro, plano ∩ esfera (que sí se corten) o dos planos no paralelos.
  function randomPair(kind) {
    for (;;) {
      const n = [pick(-3, 3), pick(-3, 3), pick(-3, 3)], d = pick(-4, 4);
      if (n.every((x) => x === 0)) continue;
      if (kind === 'cyl') { if (n[2] === 0) continue; return [P(n[0], n[1], n[2], d), { type: 'cyl', c: pick(1, 9) }]; }
      if (kind === 'sphere') {
        const c = pick(1, 16), s2 = d * d / (n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
        if (c - s2 < 0.3) continue;
        return rnd() < 0.5 ? [P(n[0], n[1], n[2], d), { type: 'sphere', c }] : [{ type: 'sphere', c }, P(n[0], n[1], n[2], d)];
      }
      const m = [pick(-3, 3), pick(-3, 3), pick(-3, 3)];
      if (L2.len(L2.cross(n, m)) < 0.5) continue;
      return [P(n[0], n[1], n[2], d), P(m[0], m[1], m[2], pick(-4, 4))];
    }
  }
  const CASES = L2.PAIRS.map((p) => [p.g, p.h]);
  for (let i = 0; i < 8; i++) CASES.push(randomPair('cyl'), randomPair('sphere'), randomPair('plane'));

  test('lagr2: la curva cumple g = c₁ y h = c₂; r′(t) = diferencias finitas y r′ ∥ ∇g × ∇h', () => {
    CASES.forEach(([g, h]) => {
      const C = L2.curve(g, h);
      if (!C) throw new Error(`sin curva para ${JSON.stringify([g, h])}`);
      for (let i = 0; i <= 40; i++) {
        const t = C.t0 + (C.t1 - C.t0) * i / 40, p = C.at(t), sc = 1 + Math.abs(g.c) + Math.abs(h.c);
        near(L2.resid(g, p), 0, 1e-10 * sc, 'g = c₁');
        near(L2.resid(h, p), 0, 1e-10 * sc, 'h = c₂');
        const e = 1e-6, a = C.at(t + e), b = C.at(t - e), d = C.d(t);
        [0, 1, 2].forEach((k) => near(d[k], (a[k] - b[k]) / (2 * e), 1e-6 * (1 + Math.abs(d[k])), 'r′(t)'));
        const T = L2.cross(L2.grad(g, p), L2.grad(h, p));
        near(L2.len(L2.cross(d, T)), 0, 1e-9 * (1 + L2.len(d) * L2.len(T)), 'r′ ∥ ∇g × ∇h');
      }
    });
    eq(L2.curve(P(1, 1, 0, 3), { type: 'cyl', c: 1 }), null, 'plano vertical con el cilindro: no es una curva cerrada');
    eq(L2.curve(P(0, 0, 1, 5), { type: 'sphere', c: 9 }), null, 'plano que no toca la esfera');
    eq(L2.curve(P(1, 1, 1, 1), P(2, 2, 2, 5)), null, 'planos paralelos');
  });

  test('lagr2: búsqueda densa (dorada + bisección) contra un muestreo bruto de 100 001 puntos', () => {
    CASES.slice(0, 10).forEach(([g, h]) => FUNS.forEach((src) => {
      const F = L2.field(math, src), C = L2.curve(g, h), r = L2.dense(F, C);
      if (r.flat) return;
      let hi = -Infinity, lo = Infinity;
      const N = 100000;
      for (let i = 0; i <= N; i++) { const v = F.f(C.at(C.t0 + (C.t1 - C.t0) * i / N)); hi = Math.max(hi, v); lo = Math.min(lo, v); }
      const sc = 1 + Math.abs(hi) + Math.abs(lo);
      if (r.max) near(r.max.value, hi, 1e-7 * sc, `${src} máximo`); else if (C.kind === 'closed') throw new Error(`${src}: curva cerrada sin máximo`);
      if (r.min) near(r.min.value, lo, 1e-7 * sc, `${src} mínimo`); else if (C.kind === 'closed') throw new Error(`${src}: curva cerrada sin mínimo`);
      // Nunca por debajo del muestreo (la búsqueda afinada solo puede mejorar).
      if (r.max && r.max.value < hi - 1e-12 * sc) throw new Error(`${src}: la búsqueda densa se quedó abajo del bruto`);
    }));
  });

  test('lagr2: Newton-Lagrange (5 ecuaciones) coincide con la búsqueda densa en presets y casos al azar', () => {
    let n = 0;
    CASES.forEach(([g, h]) => FUNS.forEach((src) => {
      const F = L2.field(math, src), C = L2.curve(g, h), r = L2.dense(F, C);
      if (r.flat) return;
      const s = L2.lagrange(F, g, h, { curve: C });
      ['max', 'min'].forEach((k) => {
        const e = r[k];
        if (!e) return;
        const sc = 1 + Math.abs(e.value);
        // Punto a 1e-3: en un crítico degenerado (f plana a cuarto orden) ni Newton ni la búsqueda
        // lo ubican mejor que ~1e-5; el valor sí se compara fino.
        const hit = s.sols.find((q) => L2.len([q.p[0] - e.p[0], q.p[1] - e.p[1], q.p[2] - e.p[2]]) < 1e-3 * (1 + L2.len(e.p)));
        if (!hit) throw new Error(`${src} en ${JSON.stringify([g, h])}: Newton no encontró el ${k} ${JSON.stringify(e.p)}`);
        near(hit.value, e.value, 1e-9 * sc, `${src} ${k}: valor`);
        if (C.kind === 'closed') near(s[k].value, e.value, 1e-9 * sc, `${src}: el ${k} de Newton es el de la búsqueda`);
        n++;
      });
    }));
    if (n < 300) throw new Error(`solo ${n} extremos comparados`);
  });

  test('lagr2: en el óptimo ∇f·T ≈ 0 y ∇f − λ∇g − μ∇h ≈ 0 (búsqueda densa y Newton)', () => {
    CASES.forEach(([g, h]) => FUNS.forEach((src) => {
      const F = L2.field(math, src), C = L2.curve(g, h), r = L2.dense(F, C);
      if (r.flat) return;
      r.list.forEach((e) => {
        const I = L2.info(F, g, h, e.p), sc = 1 + L2.len(I.gf);
        near(I.tcomp, 0, 1e-8 * sc, `${src}: ∇f·T̂ en t = ${e.t}`);
        near(I.resid, 0, 1e-8 * sc, `${src}: residuo de ∇f = λ∇g + μ∇h`);
      });
      L2.lagrange(F, g, h, { curve: C }).sols.forEach((q) => {
        const gf = F.grad(q.p), gg = L2.grad(g, q.p), gh = L2.grad(h, q.p), sc = 1 + L2.len(gf);
        [0, 1, 2].forEach((k) => near(gf[k] - q.lam * gg[k] - q.mu * gh[k], 0, 1e-9 * sc, 'ecuación vectorial'));
        near(L2.resid(g, q.p), 0, 1e-9 * (1 + Math.abs(g.c)), 'g = c₁');
        near(L2.resid(h, q.p), 0, 1e-9 * (1 + Math.abs(h.c)), 'h = c₂');
        const T = L2.cross(gg, gh);
        near(L2.dot(gf, T) / (L2.len(T) || 1), 0, 1e-8 * sc, '∇f ⟂ T');
      });
    }));
  });

  test('lagr2: casos con solución cerrada', () => {
    // f = z sobre x + y + z = 4 y x² + y² = 2: máximo 6 en (−1, −1), mínimo 2 en (1, 1); λ = 1, μ = ±1/2.
    let r = L2.optimize(math, 'z', P(1, 1, 1, 4), { type: 'cyl', c: 2 });
    near(r.max.value, 6, 1e-12); near(r.max.x, -1, 1e-9); near(r.max.y, -1, 1e-9); near(r.max.lam, 1, 1e-9); near(r.max.mu, 0.5, 1e-9);
    near(r.min.value, 2, 1e-12); near(r.min.mu, -0.5, 1e-9);
    // Stewart: f = x + 2y + 3z sobre x − y + z = 1 y x² + y² = 1 → 3 ± √29.
    r = L2.optimize(math, 'x + 2y + 3z', P(1, -1, 1, 1), { type: 'cyl', c: 1 });
    near(r.max.value, 3 + Math.sqrt(29), 1e-12); near(r.min.value, 3 - Math.sqrt(29), 1e-12); near(r.max.lam, 3, 1e-9); near(r.max.mu, Math.sqrt(29) / 2, 1e-9);
    // Recta x + y + z = 3, x − y = 1: punto más cercano (1.5, 0.5, 1), d² = 3.5, λ = 2, μ = 1; sin máximo.
    r = L2.optimize(math, 'x^2 + y^2 + z^2', P(1, 1, 1, 3), P(1, -1, 0, 1));
    near(r.min.value, 3.5, 1e-12); near(r.min.x, 1.5, 1e-9); near(r.min.y, 0.5, 1e-9); near(r.min.z, 1, 1e-9); near(r.min.lam, 2, 1e-9); near(r.min.mu, 1, 1e-9);
    eq(r.max, null, 'en una recta d² no tiene máximo');
    // Elipse x² + y² = 1, x + z = 1: el más lejano (−1, 0, 2) con d² = 5; el más cercano (1, 0, 0).
    r = L2.optimize(math, 'x^2 + y^2 + z^2', P(1, 0, 1, 1), { type: 'cyl', c: 1 });
    near(r.max.value, 5, 1e-12); near(r.max.z, 2, 1e-9); near(r.min.value, 1, 1e-12);
    // Esfera x² + y² + z² = 9 con x + y + z = 3: z máxima 3 en (0, 0, 3), mínima −1 en (2, 2, −1).
    r = L2.optimize(math, 'z', P(1, 1, 1, 3), { type: 'sphere', c: 9 });
    near(r.max.value, 3, 1e-12); near(r.min.value, -1, 1e-12); near(r.min.x, 2, 1e-9);
    // d² es constante sobre la esfera: todos los puntos son extremos.
    eq(L2.optimize(math, 'x^2 + y^2 + z^2', P(1, 1, 1, 3), { type: 'sphere', c: 9 }).flat, true);
    // Con una sola restricción (el plano), el mínimo de d² es la distancia al plano al cuadrado: 9/3 = 3.
    const F = L2.field(math, 'x^2 + y^2 + z^2'), one = L2.single(F, P(1, 1, 1, 3), [[1, 2, 3]]);
    near(one[0].value, 3, 1e-10);
  });

  test('lagr2: diagnóstico del reto (otro extremo, λ, μ, una restricción, raíz, no existe)', () => {
    const F = L2.field(math, 'x^2 + y^2 + z^2'), g = P(1, 0, 1, 1), h = { type: 'cyl', c: 1 };
    const r = L2.optimize(math, 'x^2 + y^2 + z^2', g, h), C = L2.curve(g, h), st = L2.seeds(C, 12);
    const ctx = { single: L2.single(F, g, st).concat(L2.single(F, h, st)), dist: 2 };
    const d = (s, kind, field) => L2.diagnose(s, r, { kind, field }, ctx).reason;
    eq(d(5, 'max', 'value'), 'correct'); eq(d(5.004, 'max', 'value'), 'correct');
    eq(d(1, 'max', 'value'), 'other');
    eq(d(Math.sqrt(5), 'max', 'value'), 'sqrt');
    eq(d(0.5, 'max', 'value'), 'one', 'd² mínima al plano x + z = 1');
    eq(d(-1, 'max', 'x'), 'correct'); eq(d(2, 'max', 'z'), 'correct'); eq(d(1, 'max', 'x'), 'other');
    eq(d(r.max.lam, 'max', 'value'), 'lambda');
    eq(d(4.2, 'max', 'value'), 'mismatch');
    const z = L2.optimize(math, 'z', P(1, 1, 1, 4), { type: 'cyl', c: 2 });
    eq(L2.diagnose(0.5, z, { kind: 'max', field: 'value' }, {}).reason, 'mu');
    eq(L2.diagnose(1, z, { kind: 'max', field: 'value' }, {}).reason, 'lambda');
    const line = L2.optimize(math, 'z', P(1, 1, 1, 3), P(1, -1, 0, 1));
    eq(L2.diagnose(3, line, { kind: 'max', field: 'value' }, {}).reason, 'none');
    const flat = L2.optimize(math, 'x^2 + y^2 + z^2', P(1, 1, 1, 3), { type: 'sphere', c: 9 });
    eq(L2.diagnose(9, flat, { kind: 'max', field: 'value' }, {}).reason, 'correct');
    eq(L2.diagnose(1, flat, { kind: 'max', field: 'x' }, {}).reason, 'flat');
    eq(L2.diagnose(NaN, z, { kind: 'max', field: 'value' }, {}).kind, 'invalid');
    eq(L2.near(1.234, 1.24), true); eq(L2.near(1.22, 1.24), false);
  });

  // Banco de S10: cada numérica con `ck` se recalcula con la búsqueda densa sobre la curva.
  const bankFile = path.join(__dirname, '..', '..', 'data', 'calculo-2', 'bank', 'sesion-10.js');
  if (fs.existsSync(bankFile)) {
    test('banco c2 S10: respuestas numéricas contra la búsqueda densa sobre la curva (oráculo independiente)', () => {
      const { loadData } = require('../lib/load');
      const ROOT = path.join(__dirname, '..', '..');
      const W = loadData(['labs/registry', 'labs/antiderivative-check', 'exercises', 'quiz/bank-kit'].map((n) => path.join(ROOT, 'shared/js', n + '.js')), {});
      loadData(bankFile, W);
      const Q = W.CB_BANK.c2.S10.questions;
      let s = 7; const rr = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      let checked = 0, numeric = 0;
      Q.forEach((q) => {
        if (q.type === 'numeric') numeric++;
        if (!q.ck) return;
        for (let i = 0; i < 12; i++) {
          const v = W.CBExercises.instance(q, rr), o = q.ck(v);
          let want;
          if (o.kind === 'info') {
            const F = L2.field(math, o.f), I = L2.info(F, o.g, o.h, o.p);
            near(L2.resid(o.g, o.p), 0, 1e-9, `${q.id}: el punto no está en g`);
            near(L2.resid(o.h, o.p), 0, 1e-9, `${q.id}: el punto no está en h`);
            want = o.field === 'tdot' ? L2.dot(I.gf, I.T) : o.field === 'tcomp' ? I.tcomp : I.T[+o.field.slice(1)];
          } else if (o.kind === 'curve') {
            const Cv = L2.curve(o.g, o.h);
            want = o.field === 'rho' ? Cv.rho : Cv.center[2];
          } else if (o.kind === 'at') {
            want = L2.curve(o.g, o.h).at(o.t)[o.field];
          } else if (o.kind === 'range') {
            const r = L2.optimize(math, o.f, o.g, o.h);
            want = r.max.value - r.min.value;
          } else {
            const r = L2.optimize(math, o.f, o.g, o.h);
            const e = r && r[o.ext];
            if (!e) throw new Error(`${q.id} ${JSON.stringify(v)}: la búsqueda no encontró el ${o.ext}`);
            if (o.field === 't') { const T = 2 * Math.PI; want = ((e.t % T) + T) % T; }
            else want = o.field === 'lam' ? e.lam : o.field === 'mu' ? e.mu : o.field === 'value' ? e.value : e.p['xyz'.indexOf(o.field)];
            if (o.post === 'sqrt') want = Math.sqrt(want);
          }
          const got = q.answer(v);
          if (Math.abs(got - want) > 1e-7 * Math.max(1, Math.abs(want))) throw new Error(`${q.id} ${JSON.stringify(v)}: respuesta ${got}, búsqueda ${want}`);
          checked++;
        }
      });
      if (checked < 12 * Math.ceil(numeric * 0.8)) throw new Error(`solo ${checked / 12} de ${numeric} preguntas numéricas tienen ck`);
    });
  }
};
