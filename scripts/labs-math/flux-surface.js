// Pruebas de LabMath.flux (lab flux-surface, Física 2 · S07) con oráculos independientes:
// el flujo total por superficies cerradas en un campo uniforme es cero (cuadratura cara por cara),
// la cuadratura coincide con las fórmulas cerradas, el teorema de la divergencia en un cubo con
// E = c·x î, el flujo de una carga puntual por esferas de varios radios es q/ε₀ y el banco de S07
// contra rutas alternas.
'use strict';
const path = require('path');
const fs = require('fs');
const { loadData } = require('../lib/load');

module.exports = ({ test, eq, near, LM }) => {
  const F = LM.flux;
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-30), msg);
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const between = (a, b) => a + (b - a) * rnd();
  const randVec = (m) => [between(-m, m), between(-m, m), between(-m, m)];
  const uniformE = (E) => () => E;
  const shapes = () => [['cube', { a: between(0.05, 0.4) }], ['prism', { b: between(0.05, 0.4), h: between(0.05, 0.4), w: between(0.05, 0.4) }]];

  test('flujo: valores a mano de Φ = EA cos θ', () => {
    near(F.uniform(1000, 0.06, 60), 30, 1e-9);
    near(F.uniform(500, 0.02, 0), 10, 1e-12);
    near(F.uniform(500, 0.02, 90), 0, 1e-12);
    near(F.uniform(500, 0.02, 180), -10, 1e-12);
    near(F.uniformVec([300, 0, 400], [0, 0, 2], 0.01), 4, 1e-12, 'la normal no tiene que ser unitaria');
    near(F.angleFor(30, 1000, 0.06), 60, 1e-9);
    eq(isNaN(F.angleFor(100, 1000, 0.06)), true, '|Φ| > EA no tiene ángulo');
    near(F.gaussFlux(2e-9), 2e-9 / 8.85e-12, 1e-9);
  });

  test('flujo: Φ = EA cos θ coincide con E·n̂ A y con la cuadratura sobre un rectángulo inclinado', () => {
    for (let t = 0; t < 60; t++) {
      const E = randVec(2000), u = randVec(0.5), v = randVec(0.5), P0 = randVec(1);
      const face = { P0, u, v };
      const info = F.faceInfo(face), th = F.angleBetween(E, info.n);
      const want = F.uniform(F.norm(E), info.A, th);
      rel(F.uniformVec(E, F.cross(u, v), info.A), want, 1e-9, `caso ${t}: vectores`);
      rel(F.quad(uniformE(E), face, 6), want, 1e-9, `caso ${t}: cuadratura`);
      // Ida y vuelta del ángulo
      if (Math.abs(want) > 1e-6) near(F.angleFor(want, F.norm(E), info.A), th, 1e-6, `caso ${t}: ángulo`);
    }
  });

  test('flujo: las normales de cubo y prisma apuntan hacia afuera y las áreas suman bien', () => {
    shapes().forEach(([sh, d]) => {
      const fs_ = F.faces(sh, d);
      const verts = [];
      fs_.forEach((f) => { verts.push(f.P0, [f.P0[0] + f.u[0], f.P0[1] + f.u[1], f.P0[2] + f.u[2]], [f.P0[0] + f.v[0], f.P0[1] + f.v[1], f.P0[2] + f.v[2]]); });
      const c = [0, 1, 2].map((k) => verts.reduce((s, p) => s + p[k], 0) / verts.length);
      let area = 0;
      fs_.forEach((f) => {
        const i = F.faceInfo(f), m = F.centroid(f);
        eq(F.dot(i.n, [m[0] - c[0], m[1] - c[1], m[2] - c[2]]) > 0, true, `${sh} ${f.id}: la normal apunta hacia adentro`);
        near(F.norm(i.n), 1, 1e-12);
        area += i.A;
      });
      const want = sh === 'cube' ? 6 * d.a * d.a : d.b * d.w + d.h * d.w + Math.hypot(d.b, d.h) * d.w + d.b * d.h;
      rel(area, want, 1e-12, `${sh}: área total`);
    });
  });

  test('flujo: en un campo uniforme el total por un cubo o un prisma es cero (cara por cara)', () => {
    for (let t = 0; t < 50; t++) {
      shapes().forEach(([sh, d]) => {
        const E = randVec(2000), r = F.closed(sh, E, d);
        let sumQ = 0, abs = 0;
        F.faces(sh, d).forEach((f, i) => {
          const q = F.quad(uniformE(E), f, 4);
          near(q, r.faces[i].flux, 1e-9 * (Math.abs(q) + 1), `${sh} ${f.id}`);
          sumQ += q; abs += Math.abs(q);
        });
        near(sumQ, 0, 1e-12 * (abs + 1), `${sh}: total por cuadratura`);
        near(r.total, 0, 1e-12 * (abs + 1), `${sh}: total`);
        eq(F.faceFlux(sh, E, d, r.faces[0].id), r.faces[0].flux);
      });
    }
  });

  test('flujo: la cuadratura coincide con las fórmulas cerradas de campos no uniformes', () => {
    for (let t = 0; t < 40; t++) {
      const c = between(-500, 500), a = between(0.1, 3), s = between(0.05, 1);
      const sq = { P0: [a, 0, 0], u: [0, s, 0], v: [0, 0, s] };            // normal +x
      rel(F.quad((x) => [c * x, 0, 0], sq, 8), F.linearX(c, a, s), 1e-10, `E = cx î, caso ${t}`);
      const y0 = between(0, 1), y1 = y0 + between(0.05, 1), L = between(0.05, 1);
      const rect = { P0: [between(-1, 1), y0, 0], u: [0, y1 - y0, 0], v: [0, 0, L] };
      rel(F.quad((x, y) => [c * y, 0, 0], rect, 8), F.linearY(c, y0, y1, L), 1e-10, `E = cy î, caso ${t}`);
      // Campo cuadrático: E = c y² î, Φ = c L (y1³ − y0³)/3 (Gauss con 8 nodos es exacto).
      rel(F.quad((x, y) => [c * y * y, 0, 0], rect, 8), c * L * (y1 ** 3 - y0 ** 3) / 3, 1e-10, `E = cy² î, caso ${t}`);
    }
  });

  test('flujo: teorema de la divergencia en un cubo con E = c·x î (total = c a³)', () => {
    [[200, 0.1], [-50, 0.3], [1000, 0.02]].forEach(([c, a]) => {
      let tot = 0;
      F.faces('cube', { a }).forEach((f) => { tot += F.quad((x) => [c * x, 0, 0], f, 6); });
      rel(tot, c * a * a * a, 1e-10, `c = ${c}, a = ${a}`);
    });
  });

  test('flujo: carga puntual por una esfera = q/ε₀ para varios radios; fuera, cero', () => {
    [1e-9, -3e-9, 5e-6].forEach((q) => {
      [0.01, 0.2, 1, 7.5].forEach((R) => rel(F.pointSphere(q, R), q / F.EPS0, 1e-9, `q = ${q}, R = ${R}`));
      rel(F.pointSphere(q, 0.5, [0.15, -0.1, 0.05], 96), q / F.EPS0, 1e-5, `q = ${q}, carga descentrada`);
      near(F.pointSphere(q, 0.5, [2, 0, 0], 48), 0, 1e-6 * Math.abs(q / F.EPS0), `q = ${q}, carga afuera`);
    });
  });

  test('flujo: el recorte de una línea contra el cubo da el largo correcto', () => {
    const fs_ = F.faces('cube', { a: 2 }).map((f) => ({ n: F.faceInfo(f).n, P: f.P0 }));
    const r = F.clipConvex([1, 1, -5], [0, 0, 1], fs_);
    near(r[0], 5, 1e-12); near(r[1], 7, 1e-12);
    eq(F.clipConvex([5, 5, 0], [0, 0, 1], fs_), null, 'afuera');
    const d = F.clipConvex([1, 1, 1], [1, 1, 1].map((x) => x / Math.sqrt(3)), fs_);
    near(d[1] - d[0], 2 * Math.sqrt(3), 1e-12, 'diagonal');
  });

  test('flujo: el diagnóstico reconoce cada error típico', () => {
    const cases = [
      ['plane', { E: 1000, A: 0.06, th: 60 }],
      ['plane', { E: 800, A: 0.045, th: 125 }],
      ['face', { E: [300, 0, 400], shape: 'cube', dims: { a: 0.1 }, id: 'x0' }],
      ['face', { E: [600, 0, 350], shape: 'prism', dims: { b: 0.24, h: 0.18, w: 0.2 }, id: 'inclinada' }],
      ['total', { E: [300, 0, 400], shape: 'cube', dims: { a: 0.2 } }],
      ['total', { E: [500, 0, 250], shape: 'prism', dims: { b: 0.2, h: 0.1, w: 0.3 } }]
    ];
    cases.forEach(([k, o]) => {
      const r = F.answers(k, o);
      eq(F.diagnose(k, o, r.truth), 'ok', k);
      eq(F.diagnose(k, o, Math.round(r.truth * 100) / 100), 'ok', k + ' redondeado');
      Object.keys(r).filter((x) => x !== 'truth' && x !== 'scale').forEach((m) => eq(F.diagnose(k, o, r[m]), m, k + ' ' + m));
      eq(F.diagnose(k, o, r.truth * 3.7 + 13), 'bad', k + ' otro');
      eq(F.diagnose(k, o, NaN), 'bad');
    });
    // Con θ = 0 el «sin coseno» coincide con la respuesta: no se reporta.
    eq(F.diagnose('plane', { E: 1000, A: 0.06, th: 0 }, 60), 'ok');
  });

  // Banco de S07: cada pregunta numérica con `alt` se recalcula por otra ruta.
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-2/bank/sesion-07.js');
  if (fs.existsSync(bankFile)) {
    test('flujo: el banco de S07 coincide con las rutas alternas (alt)', () => {
      const W = loadData([path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], { LabMath: LM });
      const Q = W.CB_BANK.f2.S07.questions.filter((q) => typeof q.alt === 'function');
      if (Q.length < 30) throw new Error(`solo ${Q.length} preguntas con alt`);
      Q.forEach((q) => {
        let n = 0;
        for (let i = 0; i < 400 && n < 40; i++) {
          const v = {};
          Object.entries(q.vars || {}).forEach(([k, r]) => { const st = r[2] || 1, m = Math.round((r[1] - r[0]) / st); v[k] = +(r[0] + st * Math.floor(rnd() * (m + 1))).toFixed(10); });
          if (q.where && !q.where(v)) continue;
          n++;
          const a = q.answer(v), b = q.alt(v, LM);
          if (!(Math.abs(a - b) <= 1e-6 * Math.max(Math.abs(b), 1e-9))) throw new Error(`${q.id} ${JSON.stringify(v)}: ${a} contra ${b}`);
        }
        if (!n) throw new Error(`${q.id}: ninguna instancia cumple where`);
      });
    });
  }
};
