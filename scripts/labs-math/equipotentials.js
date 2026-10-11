// Pruebas de LabMath.equipotential (lab equipotentials, Física 2 · S06) con oráculos independientes:
// el potencial cerrado de varilla, anillo y disco contra la suma de kq/r de N ≥ 2000 cargas puntuales
// escritas aquí; −∇V numérico contra el E cerrado de S04 (LabMath.chargeIntegral) y contra Coulomb
// (LabMath.efield, del lab de S03); E ⟂ equipotenciales (producto punto ≈ 0); V baja a lo largo de las
// líneas de campo; el diagnóstico del lab y el banco de S06 contra rutas alternas (alt).
'use strict';
const path = require('path');
const fs = require('fs');
const { loadData } = require('../lib/load');

module.exports = ({ test, eq, near, LM, math }) => {
  const EQ = LM.equipotential, CI = LM.chargeIntegral;
  const K = 8.99e9, EPS0 = 8.85e-12;
  const rel = (a, b) => Math.abs(a - b) / Math.abs(b);
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  // Suma independiente de kq/r (cargas [x, y, z, q]).
  function sumV(pts, P) { let s = 0; for (const [x, y, z, q] of pts) s += K * q / Math.hypot(P[0] - x, P[1] - y, P[2] - z); return s; }
  function rod(x0, L, Q, N) { const o = []; for (let i = 0; i < N; i++) o.push([x0 + (i + 0.5) * L / N, 0, 0, Q / N]); return o; }

  test('equipotential: V de la varilla (eje y bisectriz) = suma de 4000 cargas puntuales', () => {
    for (let t = 0; t < 12; t++) {
      const L = 0.05 + 0.35 * rnd(), Q = (1 + 9 * rnd()) * 1e-9, d = 0.02 + 0.3 * rnd();
      near(rel(EQ.rodAxisV(L, Q, d), sumV(rod(0, L, Q, 4000), [L + d, 0, 0])), 0, 1e-6, `eje L=${L} d=${d}`);
      near(rel(EQ.rodBisectorV(L, Q, d), sumV(rod(-L / 2, L, Q, 4000), [0, d, 0])), 0, 1e-6, `bisectriz L=${L} y=${d}`);
    }
  });
  test('equipotential: V del anillo = suma de 2000 cargas; V del disco = suma de 2000 anillos × 16 cargas', () => {
    for (let t = 0; t < 10; t++) {
      const R = 0.02 + 0.2 * rnd(), Q = (1 + 9 * rnd()) * 1e-9, z = 0.005 + 0.3 * rnd();
      const ring = [];
      for (let i = 0; i < 2000; i++) { const a = 2 * Math.PI * i / 2000; ring.push([R * Math.cos(a), R * Math.sin(a), 0, Q / 2000]); }
      near(rel(EQ.ringV(R, Q, z), sumV(ring, [0, 0, z])), 0, 1e-12, `anillo z=${z}`);
      const sig = Q / (Math.PI * R * R), NR = 2000, M = 16, disk = [];
      for (let i = 0; i < NR; i++) {
        const r0 = i * R / NR, r1 = (i + 1) * R / NR, q = sig * Math.PI * (r1 * r1 - r0 * r0) / M, r = (r0 + r1) / 2;
        for (let j = 0; j < M; j++) { const a = 2 * Math.PI * (j + 0.5) / M; disk.push([r * Math.cos(a), r * Math.sin(a), 0, q]); }
      }
      near(rel(EQ.diskV(R, Q, z), sumV(disk, [0, 0, z])), 0, 1e-6, `disco R=${R} z=${z}`);
    }
  });
  test('equipotential: discreteV (la suma del lab) converge a la fórmula cerrada', () => {
    const cases = [['rod-axis', { L: 0.2, Q: 5e-9, d: 0.1 }], ['rod-bisector', { L: 0.2, Q: 5e-9, y: 0.1 }], ['ring', { R: 0.1, Q: 5e-9, z: 0.05 }], ['disk', { R: 0.1, Q: 5e-9, z: 0.05 }]];
    for (const [g, p] of cases) {
      near(rel(EQ.discreteV(g, p, 2000, 8), EQ.closedV(g, p)), 0, 1e-6, g);
      if (g !== 'ring') eq(rel(EQ.discreteV(g, p, 4, 8), EQ.closedV(g, p)) > rel(EQ.discreteV(g, p, 40, 8), EQ.closedV(g, p)), true, g + ': más trozos, menos error');
    }
  });
  test('equipotential: límites (lejos → kQ/r, centro del anillo kQ/R, disco en z = 0 → 2πkσR)', () => {
    const Q = 4e-9;
    near(rel(EQ.rodAxisV(0.01, Q, 100), K * Q / 100.005), 0, 1e-8, 'varilla lejos');
    near(rel(EQ.rodBisectorV(0.01, Q, 100), K * Q / 100), 0, 1e-8, 'bisectriz lejos');
    near(rel(EQ.ringV(0.1, Q, 0), K * Q / 0.1), 0, 1e-12, 'anillo en el centro');
    near(rel(EQ.ringV(0.1, Q, 1000), K * Q / 1000), 0, 1e-8, 'anillo lejos');
    near(rel(EQ.diskV(0.1, Q, 0), 2 * Math.PI * K * Q / (Math.PI * 0.01) * 0.1), 0, 1e-12, 'disco en su centro');
    near(rel(EQ.diskV(0.1, Q, 50), K * Q / 50), 0, 1e-5, 'disco lejos');
  });
  test('equipotential: −dV/ds numérico recupera el E cerrado de S04 (LabMath.chargeIntegral)', () => {
    const conv = 4 * Math.PI * EPS0 * K;          // el disco de S04 usa ε₀; aquí V usa k
    for (let t = 0; t < 20; t++) {
      const a = 0.03 + 0.3 * rnd(), Q = (1 + 9 * rnd()) * 1e-9, s = 0.01 + 0.3 * rnd();
      near(rel(EQ.axisField('rod-axis', { L: a, Q, d: s }), CI.rodAxis(a, Q, s)), 0, 1e-6, 'varilla en su eje');
      near(rel(EQ.axisField('rod-bisector', { L: a, Q, y: s }), CI.rodBisector(a, Q, s)), 0, 1e-6, 'bisectriz');
      near(rel(EQ.axisField('ring', { R: a, Q, z: s }), CI.ring(a, Q, s)), 0, 1e-6, 'anillo');
      near(rel(EQ.axisField('disk', { R: a, Q, z: s }), CI.disk(a, Q, s) * conv), 0, 1e-6, 'disco');
    }
  });
  function randomCharges(n) {
    const out = [];
    while (out.length < n) {
      const c = { q: (rnd() < 0.5 ? -1 : 1) * (1 + 4 * rnd()) * 1e-9, x: (rnd() * 16 - 8) / 100, y: (rnd() * 10 - 5) / 100 };
      if (out.every((d) => Math.hypot(d.x - c.x, d.y - c.y) > 0.02)) out.push(c);
    }
    return out;
  }
  function freePoint(ch, r) {
    for (;;) {
      const p = { x: (rnd() * 18 - 9) / 100, y: (rnd() * 11 - 5.5) / 100 };
      if (ch.every((c) => Math.hypot(c.x - p.x, c.y - p.y) > (r || 0.015))) return p;
    }
  }
  test('equipotential: −∇V numérico = campo de Coulomb (LabMath.efield y la fórmula cerrada)', () => {
    for (let t = 0; t < 40; t++) {
      const ch = randomCharges(1 + (t % 4)), p = freePoint(ch);
      const g = EQ.fieldFromV((x, y) => EQ.V(ch, x, y), p.x, p.y, 1e-7), c = LM.efield.field(ch, p.x, p.y), e = EQ.E(ch, p.x, p.y);
      near(Math.hypot(g.x - c.x, g.y - c.y), 0, 1e-5 * c.mag, `caso ${t}`);
      near(Math.hypot(e.x - c.x, e.y - c.y), 0, 1e-12 * c.mag, `cerrado ${t}`);
    }
  });
  test('equipotential: fieldFromExpr (derivadas exactas) = −∇ numérico de la misma V', () => {
    const exprs = ['100*(3x^2*y - y^3)', '50x^2 - 30y^2 + 20x*y', '400/sqrt(x^2 + y^2)', '-200x + 75y'];
    for (const ex of exprs) {
      const f = (x, y) => math.evaluate(ex.replace(/(\d)([xy])/g, '$1*$2'), { x, y });
      for (let t = 0; t < 6; t++) {
        const x = 0.5 + 2 * rnd(), y = 0.5 + 2 * rnd(), a = EQ.fieldFromExpr(math, ex, x, y), b = EQ.fieldFromV(f, x, y, 1e-5);
        near(Math.hypot(a.x - b.x, a.y - b.y), 0, 1e-6 * (1 + a.mag), ex);
        near(a.mag, Math.hypot(a.x, a.y), 1e-12);
      }
    }
    const r = EQ.fieldFromExpr(math, '100*(3x^2*y - y^3)', 1, 2);
    eq([r.x, r.y, r.mag].join(), '-1200,900,1500', 'el 3-4-5 del ejemplo');
  });
  test('equipotential: las equipotenciales son ⟂ a E (producto punto ≈ 0) y valen su nivel', () => {
    for (let t = 0; t < 12; t++) {
      const ch = randomCharges(1 + (t % 3)), f = (x, y) => EQ.V(ch, x, y);
      const box = { x0: -0.1, x1: 0.1, y0: -0.065, y1: 0.065 }, step = 100 + 50 * (t % 4);
      const cs = EQ.contours(f, box, 400, 260, EQ.levels(step, 16 * step), 40 * step);
      const rows = [];
      cs.forEach((c) => c.segs.forEach((s) => {
        const mx = (s[0] + s[2]) / 2, my = (s[1] + s[3]) / 2, L = Math.hypot(s[2] - s[0], s[3] - s[1]);
        if (L < 1e-5 || ch.some((q) => Math.hypot(q.x - mx, q.y - my) < 0.02)) return;
        const e = EQ.E(ch, mx, my);
        if (!(e.mag > 0)) return;
        rows.push([Math.abs((s[2] - s[0]) * e.x + (s[3] - s[1]) * e.y) / (L * e.mag), e.mag]);
        near(f(s[0], s[1]), c.level, 0.02 * step, 'el extremo está sobre su nivel');
      }));
      eq(rows.length > 50, true, `caso ${t}: pocos segmentos (${rows.length})`);
      // Junto a un punto donde E = 0 (silla del potencial) la rejilla no resuelve la curva: se excluye.
      const med = rows.map((r) => r[1]).sort((a, b) => a - b)[rows.length >> 1];
      const strong = rows.filter((r) => r[1] > 0.25 * med);
      near(Math.max(...strong.map((r) => r[0])), 0, 0.06, `caso ${t}: |cos| máximo`);
      near(rows.reduce((s, r) => s + r[0], 0) / rows.length, 0, 0.01, `caso ${t}: |cos| promedio`);
    }
  });
  test('equipotential: niveles simétricos con el 0 y un nivel exacto en una rejilla simple', () => {
    eq(EQ.levels(150, 600).join(), '-600,-450,-300,-150,0,150,300,450,600');
    const c = EQ.contours((x) => x, { x0: 0, x1: 1, y0: 0, y1: 1 }, 10, 10, [0.55], Infinity)[0];
    eq(c.segs.length, 10);
    c.segs.forEach((s) => { near(s[0], 0.55, 1e-12); near(s[2], 0.55, 1e-12); });
  });
  test('equipotential: a lo largo de una línea de campo el potencial baja', () => {
    for (let t = 0; t < 10; t++) {
      const ch = randomCharges(1 + (t % 3)).map((c) => ({ q: c.q * 1e9, x: c.x * 100, y: c.y * 100 }));
      const ls = EQ.lines(ch, { x0: -10, x1: 10, y0: -6.5, y1: 6.5 }, { perUnit: 2 });
      eq(ls.length > 0, true);
      ls.forEach((l) => {
        for (let i = 2; i < l.pts.length - 1; i++) {
          const a = EQ.V(ch, l.pts[i - 1][0], l.pts[i - 1][1]), b = EQ.V(ch, l.pts[i][0], l.pts[i][1]);
          if (!(b <= a + 1e-9 * Math.abs(a))) throw new Error(`caso ${t}: V sube de ${a} a ${b}`);
        }
      });
    }
  });
  test('equipotential: campo uniforme (E = ΔV/d, ΔV = −E s cos θ)', () => {
    eq(EQ.plates(120, 0.005), 24000);
    near(EQ.deltaV(2000, 0.03, 0), -60, 1e-12);
    eq(EQ.deltaV(2000, 0.03, 90), 0);
    near(EQ.deltaV(2000, 0.03, 180), 60, 1e-12);
    near(EQ.deltaV(2000, 0.03, 60), -30, 1e-9);
  });
  test('equipotential: probe (dos equipotenciales) estima |E| y el sentido hacia V menor', () => {
    for (let t = 0; t < 30; t++) {
      const ch = randomCharges(1 + (t % 3)), p = freePoint(ch, 0.02), pr = EQ.probe(ch, p.x, p.y, 0.005);
      const e = EQ.E(ch, p.x, p.y);
      if (Math.abs(pr.V1 - pr.V2) < 0.5) continue;
      near(rel(pr.est, e.mag), 0, 0.03, `caso ${t}`);
      const to = pr.toward === 2 ? pr.p2 : pr.p1, from = pr.toward === 2 ? pr.p1 : pr.p2;
      eq((to.x - from.x) * e.x + (to.y - from.y) * e.y > 0, true, 'E apunta hacia el punto de menor V');
      eq(pr.u.x >= -1e-12, true, 'el punto 1 queda a la izquierda');
    }
  });
  test('equipotential: el diagnóstico reconoce cada error típico', () => {
    const ch = [{ q: 2e-9, x: -0.03, y: 0 }, { q: -2e-9, x: 0.03, y: 0 }], P = { x: 0.01, y: 0.03 }, ds = 0.01;
    const a = EQ.answers('V', ch, P.x, P.y, ds);
    eq(EQ.diagnose('V', ch, P.x, P.y, ds, a.truth), 'ok');
    eq(EQ.diagnose('V', ch, P.x, P.y, ds, a.truth * 1.01), 'ok', 'redondeado');
    ['r2', 'noSign', 'cm'].forEach((k) => eq(EQ.diagnose('V', ch, P.x, P.y, ds, a[k]), k, 'V ' + k));
    eq(EQ.diagnose('V', ch, P.x, P.y, ds, a.truth * 3.7), 'bad');
    near(rel(a.truth, K * 2e-9 * (1 / Math.hypot(0.04, 0.03) - 1 / Math.hypot(0.02, 0.03))), 0, 1e-12, 'V a mano');
    const pr = EQ.probe(ch, P.x, P.y, 0.015), b = EQ.answers('E', ch, P.x, P.y, 0.015);
    eq(EQ.diagnose('E', ch, P.x, P.y, 0.015, b.truth, pr.toward), 'ok');
    eq(EQ.diagnose('E', ch, P.x, P.y, 0.015, pr.exact, pr.toward), 'ok', 'el E exacto también vale');
    eq(EQ.diagnose('E', ch, P.x, P.y, 0.015, b.truth, 3 - pr.toward), 'dir');
    ['noDivide', 'cm', 'r2'].forEach((k) => eq(EQ.diagnose('E', ch, P.x, P.y, 0.015, b[k], pr.toward), k, 'E ' + k));
    eq(EQ.diagnose('E', ch, P.x, P.y, 0.015, NaN, 1), 'bad');
  });

  // Banco de S06: cada pregunta numérica con `alt` se recalcula por otra ruta.
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-2/bank/sesion-06.js');
  if (fs.existsSync(bankFile)) {
    test('equipotential: el banco de S06 coincide con las rutas alternas (alt)', () => {
      const W = loadData([path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], { LabMath: LM });
      const Q = W.CB_BANK.f2.S06.questions.filter((q) => typeof q.alt === 'function');
      if (Q.length < 30) throw new Error(`solo ${Q.length} preguntas con alt`);
      Q.forEach((q) => {
        let n = 0;
        for (let i = 0; i < 400 && n < 40; i++) {
          const v = {};
          Object.entries(q.vars || {}).forEach(([k, r]) => { const st = r[2] || 1, m = Math.round((r[1] - r[0]) / st); v[k] = +(r[0] + st * Math.floor(rnd() * (m + 1))).toFixed(10); });
          if (q.where && !q.where(v)) continue;
          n++;
          const a = q.answer(v), b = q.alt(v, LM, math);
          if (!(Math.abs(a - b) <= 1e-6 * Math.max(Math.abs(b), 1e-9))) throw new Error(`${q.id} ${JSON.stringify(v)}: ${a} contra ${b}`);
        }
        if (!n) throw new Error(`${q.id}: ninguna instancia cumple where`);
      });
    });
  }
};
