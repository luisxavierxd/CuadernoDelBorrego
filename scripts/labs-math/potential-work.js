// Pruebas de LabMath.potential (lab potential-work, Física 2 · S05) con oráculos independientes:
// el trabajo integrado numéricamente sobre caminos distintos contra −qΔV, el potencial como
// −∫E·dl desde muy lejos, la energía del sistema contra el trabajo de armarlo carga por carga,
// la rapidez contra una integración RK4 del movimiento y el banco de S05 contra rutas alternas.
'use strict';
const path = require('path');
const fs = require('fs');
const { loadData } = require('../lib/load');

module.exports = ({ test, eq, near, LM }) => {
  const P = LM.potential;
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-30), msg);
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const uc = (x) => x * 1e-6;
  function randomCharges(n) {
    const out = [];
    while (out.length < n) {
      const c = { q: uc((rnd() * 10 - 5) || 1), x: (rnd() * 16 - 8) / 100, y: (rnd() * 10 - 5) / 100 };
      if (out.every((d) => Math.hypot(d.x - c.x, d.y - c.y) > 0.015)) out.push(c);
    }
    return out;
  }
  function freePoint(ch) {
    for (;;) {
      const p = { x: (rnd() * 18 - 9) / 100, y: (rnd() * 10 - 5) / 100 };
      if (ch.every((c) => Math.hypot(c.x - p.x, c.y - p.y) > 0.012)) return p;
    }
  }
  // Camino de muy lejos (1e7 m) hasta p, en línea recta hacia afuera, con tramos geométricos.
  function fromFar(ch, p) {
    let cx = 0, cy = 0;
    ch.forEach((c) => { cx += c.x; cy += c.y; });
    cx /= ch.length || 1; cy /= ch.length || 1;
    let dx = p.x - cx, dy = p.y - cy, L = Math.hypot(dx, dy);
    if (L < 1e-9) { dx = 1; dy = 0; L = 1; }
    dx /= L; dy /= L;
    const pts = [];
    for (let s = 1e7; s > 1e-4; s /= 2) pts.push({ x: p.x + dx * s, y: p.y + dy * s });
    pts.push(p);
    return pts;
  }

  test('potencial: par, sistema y potencial con valores a mano', () => {
    rel(P.pairU(uc(3), uc(-2), 0.05), 8.99e9 * -6e-12 / 0.05, 1e-12);
    const tri = [{ q: uc(2), x: 0, y: 0 }, { q: uc(2), x: 0.1, y: 0 }, { q: uc(-3), x: 0.05, y: 0.1 * Math.sqrt(3) / 2 }];
    rel(P.systemU(tri), 8.99e9 * (4 - 6 - 6) * 1e-12 / 0.1, 1e-12);
    rel(P.V([{ q: uc(4), x: 0, y: 0 }, { q: uc(-2), x: 0.06, y: 0 }], 0, 0.08), 269700, 1e-12);
    eq(P.systemU([{ q: 1, x: 0, y: 0 }]), 0, 'una sola carga no tiene pares');
  });

  test('potencial: el trabajo numérico por tres caminos distintos coincide con −qΔV', () => {
    for (let t = 0; t < 40; t++) {
      const ch = randomCharges(1 + (t % 3)), q = uc((rnd() * 10 - 5) || 1);
      const A = freePoint(ch), B = freePoint(ch);
      const want = P.workAB(ch, q, A, B);
      const paths = [[A, B], [A, freePoint(ch), B], [A, freePoint(ch), freePoint(ch), freePoint(ch), B]];
      paths.forEach((p, i) => {
        const W = P.workPath(ch, q, p);
        near(W, want, 1e-6 * (Math.abs(want) + 1e-3), `caso ${t}, camino ${i}`);
      });
    }
  });

  test('potencial: en un camino cerrado el trabajo es cero', () => {
    for (let t = 0; t < 20; t++) {
      const ch = randomCharges(2), A = freePoint(ch);
      const W = P.workPath(ch, uc(1), [A, freePoint(ch), freePoint(ch), A]);
      near(W, 0, 1e-7, `lazo ${t}`);
    }
  });

  test('potencial: V(P) = −∫E·dl desde muy lejos (carga de prueba de 1 C)', () => {
    for (let t = 0; t < 25; t++) {
      const ch = randomCharges(1 + (t % 3)), p = freePoint(ch);
      const V = -P.workPath(ch, 1, fromFar(ch, p));
      rel(V, P.V(ch, p.x, p.y), 1e-6, `punto ${t}`);
    }
  });

  test('potencial: U del sistema = trabajo de armarlo carga por carga (también integrado)', () => {
    for (let t = 0; t < 25; t++) {
      const ch = randomCharges(2 + (t % 3));
      const U = P.systemU(ch);
      rel(P.assembleWork(ch), U, 1e-12, `fórmula, caso ${t}`);
      let W = 0;                                         // externo = −(trabajo del campo)
      for (let i = 1; i < ch.length; i++) W += -P.workPath(ch.slice(0, i), ch[i].q, fromFar(ch.slice(0, i), ch[i]));
      near(W, U, 1e-6 * (Math.abs(U) + 1e-3), `integrado, caso ${t}`);
      const rev = ch.slice().reverse();
      rel(P.assembleWork(rev), U, 1e-12, `el orden no importa, caso ${t}`);
    }
  });

  test('potencial: la fuerza es −∇U (diferencias finitas)', () => {
    for (let t = 0; t < 20; t++) {
      const ch = randomCharges(2), p = freePoint(ch), q = uc(2), h = 1e-7;
      const F = P.force(ch, q, p.x, p.y);
      const Fx = -q * (P.V(ch, p.x + h, p.y) - P.V(ch, p.x - h, p.y)) / (2 * h);
      const Fy = -q * (P.V(ch, p.x, p.y + h) - P.V(ch, p.x, p.y - h)) / (2 * h);
      near(F.x, Fx, 1e-5 * (Math.hypot(F.x, F.y) + 1e-6)); near(F.y, Fy, 1e-5 * (Math.hypot(F.x, F.y) + 1e-6));
    }
  });

  test('potencial: rapidez por energía contra RK4 del movimiento radial', () => {
    // Protón soltado a r0 de una carga fija +Q: integra m r'' = kQe/r² hasta r1.
    [[uc(2), 0.01, 0.05], [uc(0.5), 0.02, 0.2], [uc(5), 0.005, 0.03]].forEach(([Q, r0, r1]) => {
      const m = P.M_P, e = P.E, k = P.K;
      let r = r0, v = 0, dt = 1e-10;
      const acc = (x) => k * Q * e / (m * x * x);
      while (r < r1) {
        const k1r = v, k1v = acc(r);
        const k2r = v + dt / 2 * k1v, k2v = acc(r + dt / 2 * k1r);
        const k3r = v + dt / 2 * k2v, k3v = acc(r + dt / 2 * k2r);
        const k4r = v + dt * k3v, k4v = acc(r + dt * k3r);
        const rn = r + dt / 6 * (k1r + 2 * k2r + 2 * k3r + k4r), vn = v + dt / 6 * (k1v + 2 * k2v + 2 * k3v + k4v);
        if (rn >= r1) { v = v + (vn - v) * (r1 - r) / (rn - r); r = r1; break; }
        r = rn; v = vn;
        dt = Math.min(1e-9, 2e-4 * r / Math.max(v, 1));
      }
      const dV = k * Q / r1 - k * Q / r0;
      rel(P.speed(e, m, dV, 0), v, 3e-4, `Q = ${Q}`);
    });
    near(P.speed(-P.E, P.M_E, 2000, 0), Math.sqrt(2 * 1.6e-19 * 2000 / 9.11e-31), 1);
    eq(isNaN(P.speed(P.E, P.M_P, 1000, 0)), true, 'un protón en reposo no sube a mayor potencial');
    near(P.toEV(1.6e-19 * 250), 250, 1e-9);
  });

  test('potencial: along corta la poligonal y conserva el largo', () => {
    const p = [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 4 }];
    eq(P.pathLength(p), 7);
    const a = P.along(p, 5 / 7), e = a[a.length - 1];
    near(e.x, 3, 1e-12); near(e.y, 2, 1e-12); near(P.pathLength(a), 5, 1e-12);
    const z = P.along(p, 0); near(P.pathLength(z), 0, 1e-12);
  });

  test('potencial: el diagnóstico reconoce cada error típico', () => {
    const ch = [{ q: uc(3), x: -0.03, y: 0 }, { q: uc(-2), x: 0.03, y: 0 }], q = uc(1);
    const A = { x: -0.07, y: 0.03 }, B = { x: 0.07, y: 0.03 };
    ['VA', 'VB', 'W'].forEach((k) => {
      const r = P.answers(k, ch, q, A, B);
      eq(P.diagnose(k, ch, q, A, B, r.truth), 'ok', k);
      eq(P.diagnose(k, ch, q, A, B, r.truth * 1.004), 'ok', k + ' redondeado');
      Object.keys(r).filter((x) => x !== 'truth').forEach((m) => eq(P.diagnose(k, ch, q, A, B, r[m]), m, k + ' ' + m));
      eq(P.diagnose(k, ch, q, A, B, r.truth * 3.7), 'bad', k + ' otro');
      eq(P.diagnose(k, ch, q, A, B, NaN), 'bad');
    });
    // El trabajo real lo da también la integral sobre el camino del lab.
    rel(P.workPath(ch, q, [A, { x: -0.03, y: 0.05 }, { x: 0.03, y: -0.045 }, B]), P.answers('W', ch, q, A, B).truth, 1e-6);
  });

  // Banco de S05: cada pregunta numérica con `alt` se recalcula por otra ruta.
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-2/bank/sesion-05.js');
  if (fs.existsSync(bankFile)) {
    test('potencial: el banco de S05 coincide con las rutas alternas (alt)', () => {
      const W = loadData([path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], { LabMath: LM });
      const Q = W.CB_BANK.f2.S05.questions.filter((q) => typeof q.alt === 'function');
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
