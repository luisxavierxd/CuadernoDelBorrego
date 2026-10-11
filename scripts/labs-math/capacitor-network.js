// Pruebas de LabMath.capnet (lab capacitor-network, Física 2 · S10) con oráculos independientes:
// el solver nodal (Σ C(V_i − V_j) = 0 en cada nodo interno) contra la reducción serie/paralelo en
// los presets y en cientos de redes al azar; la relación serie/paralelo contra la topología del
// grafo; la energía ½C_eqV² contra Σ ½C_iV_i²; Gauss contra math.lusolve; y el banco de S10.
'use strict';
const path = require('path');
const fs = require('fs');
const { loadData } = require('../lib/load');

module.exports = ({ test, eq, near, LM, math }) => {
  const N = LM.capnet;
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-12), msg);
  let seed = 31;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const { leaf, S, P } = N;

  // Oráculo: potenciales por el solver nodal con a = V y b = 0; carga de cada rama y C_eq = Q/V.
  function byNodal(tree, V) {
    const g = N.graph(tree), pot = N.nodal({ nodes: g.nodes, branches: g.branches, fixed: { a: V, b: 0 } });
    const parts = {};
    let Qa = 0;
    g.branches.forEach((br) => {
      const dv = pot[br.a] - pot[br.b];
      parts[br.id] = { Q: br.value * dv, V: dv };
      if (br.a === 'a') Qa += br.value * dv;
      if (br.b === 'a') Qa -= br.value * dv;
    });
    Object.values(parts).forEach((p, i) => { p.U = 0.5 * g.branches[i].value * p.V * p.V; });
    return { C: Qa / V, Q: Qa, parts, pot };
  }
  function sameAsNodal(tree, V, msg) {
    const s = N.solve(tree, V), o = byNodal(tree, V);
    rel(s.C, o.C, 1e-9, msg + ' C_eq');
    N.leaves(tree).forEach((x) => {
      rel(s.parts[x.id].Q, o.parts[x.id].Q, 1e-9, msg + ' Q ' + x.id);
      rel(s.parts[x.id].V, o.parts[x.id].V, 1e-9, msg + ' V ' + x.id);
    });
  }

  test('capnet: serie y paralelo con valores a mano', () => {
    near(N.series([6, 3]), 2, 1e-12);
    near(N.series([2, 3, 6]), 1, 1e-12);
    near(N.parallel([2, 4, 6]), 12, 1e-12);
    near(N.eq(S(leaf('C1', 6), P(leaf('C2', 1), leaf('C3', 2)))), 2, 1e-12);
    near(N.eq(N.PRESETS[3].tree), 2, 1e-12);
    near(N.eq(N.PRESETS[4].tree), 4, 1e-12);
    const s = N.solve(S(leaf('C1', 6), leaf('C2', 3)), 12);
    near(s.Q, 24, 1e-12); near(s.parts.C1.V, 4, 1e-12); near(s.parts.C2.V, 8, 1e-12);
  });

  test('capnet: la reducción coincide con el solver nodal en todos los presets', () => {
    N.PRESETS.forEach((p) => sameAsNodal(p.tree, p.V, p.name));
  });

  function randomTree() { return N.random(rnd, 2 + Math.floor(rnd() * 4)); }
  test('capnet: la reducción coincide con el solver nodal en 400 redes al azar', () => {
    for (let i = 0; i < 400; i++) {
      const t = randomTree(), V = 1 + Math.floor(rnd() * 24);
      const n = N.leaves(t).length;
      if (n < 2 || n > 5) throw new Error('red con ' + n + ' capacitores');
      sameAsNodal(t, V, 'red ' + i + ' ' + JSON.stringify(t));
    }
  });

  test('capnet: energía total = ½ C_eq V² = Σ ½ C_i V_i² = Σ Q_i²/2C_i = Σ ½ Q_i V_i', () => {
    for (let i = 0; i < 300; i++) {
      const t = randomTree(), V = 1 + rnd() * 30, s = N.solve(t, V), o = byNodal(t, V);
      let u1 = 0, u2 = 0, u3 = 0;
      N.leaves(t).forEach((x) => {
        const q = o.parts[x.id].Q, v = o.parts[x.id].V;
        u1 += 0.5 * x.c * v * v; u2 += q * q / (2 * x.c); u3 += 0.5 * q * v;
      });
      rel(s.U, 0.5 * o.C * V * V, 1e-9, 'U');
      rel(s.sumU, u1, 1e-9, 'ΣU'); rel(u1, u2, 1e-9); rel(u1, u3, 1e-9); rel(s.U, s.sumU, 1e-9);
    }
  });

  test('capnet: el solver nodal resuelve una red que no es serie/paralelo (puente)', () => {
    // Puente de Wheatstone con conductancias: a–1 (1), a–2 (2), 1–2 (3), 1–b (4), 2–b (5).
    // Ecuaciones a mano: nodo 1: 8V1 − 3V2 = 1·10; nodo 2: −3V1 + 10V2 = 2·10.
    const pot = N.nodal({ nodes: ['a', 'b', '1', '2'], fixed: { a: 10, b: 0 },
      branches: [{ a: 'a', b: '1', value: 1 }, { a: 'a', b: '2', value: 2 }, { a: '1', b: '2', value: 3 }, { a: '1', b: 'b', value: 4 }, { a: '2', b: 'b', value: 5 }] });
    const det = 8 * 10 - 9;
    near(pot['1'], (10 * 10 + 3 * 20) / det, 1e-12); near(pot['2'], (8 * 20 + 3 * 10) / det, 1e-12);
    // Con inyección (fuente de corriente) en un nodo flotante unido a tierra por 2: V = I/G.
    near(N.nodal({ nodes: ['g', 'x'], fixed: { g: 0 }, branches: [{ a: 'x', b: 'g', value: 2 }], inject: { x: 6 } }).x, 3, 1e-12);
  });

  test('capnet: Gauss propio contra math.lusolve en sistemas al azar', () => {
    for (let t = 0; t < 60; t++) {
      const n = 2 + Math.floor(rnd() * 6), A = [], b = [];
      for (let i = 0; i < n; i++) { A.push([]); b.push(rnd() * 10 - 5); for (let j = 0; j < n; j++) A[i].push(rnd() * 10 - 5 + (i === j ? 12 : 0)); }
      const x = N.gauss(A, b), y = math.lusolve(A, b).map((r) => r[0]);
      x.forEach((xi, i) => near(xi, y[i], 1e-9 * (1 + Math.abs(y[i]))));
    }
    eq(N.gauss([[1, 2], [2, 4]], [1, 2]).every((v) => isNaN(v)), true, 'singular → NaN');
  });

  // Oráculo físico de la relación, con el solver nodal: dos capacitores están en serie si llevan
  // la misma carga y en paralelo si tienen el mismo voltaje, para capacidades cualesquiera
  // (se prueban dos juegos de valores al azar para descartar coincidencias).
  function physRelation(tree, a, b) {
    let sameQ = true, sameV = true;
    for (let r = 0; r < 2; r++) {
      const t = JSON.parse(JSON.stringify(tree));
      N.leaves(t).forEach((x) => { x.c = 0.5 + rnd() * 10; });
      const o = byNodal(t, 10);
      if (Math.abs(o.parts[a].Q - o.parts[b].Q) > 1e-9 * Math.abs(o.parts[a].Q)) sameQ = false;
      if (Math.abs(o.parts[a].V - o.parts[b].V) > 1e-9 * Math.abs(o.parts[a].V)) sameV = false;
    }
    return sameV ? 'parallel' : sameQ ? 'series' : 'none';
  }
  test('capnet: serie/paralelo/ninguno coincide con «misma Q» / «mismo V» del solver nodal', () => {
    for (let i = 0; i < 200; i++) {
      const t = randomTree(), ids = N.leaves(t).map((x) => x.id);
      ids.forEach((a) => ids.forEach((b) => {
        if (a === b) return eq(N.relation(t, a, b).kind, 'same');
        eq(N.relation(t, a, b).kind, physRelation(t, a, b), `${a}–${b} en ${JSON.stringify(t)}`);
      }));
    }
  });

  test('capnet: reducir de dos en dos (en cualquier orden válido) conserva C_eq y el reparto', () => {
    for (let i = 0; i < 200; i++) {
      let t = randomTree();
      const V = 12, C0 = byNodal(t, V).C, Q0 = byNodal(t, V).parts;
      while (N.leaves(t).length > 1) {
        const ids = N.leaves(t).map((x) => x.id), pairs = [];
        ids.forEach((a) => ids.forEach((b) => { if (a < b && N.relation(t, a, b).kind !== 'none') pairs.push([a, b]); }));
        if (!pairs.length) throw new Error('sin pares combinables en ' + JSON.stringify(t));
        const [a, b] = pairs[Math.floor(rnd() * pairs.length)];
        const r = N.combine(t, a, b);
        const want = N.relation(t, a, b).kind === 'series' ? 1 / (1 / N.find(t, a).c + 1 / N.find(t, b).c) : N.find(t, a).c + N.find(t, b).c;
        rel(r.c, want, 1e-12);
        t = r.tree;
        rel(byNodal(t, V).C, C0, 1e-9, 'C_eq tras combinar');
        // Las hojas que siguen sin combinar conservan su carga.
        N.leaves(t).forEach((x) => { if (Q0[x.id]) rel(byNodal(t, V).parts[x.id].Q, Q0[x.id].Q, 1e-9, x.id); });
      }
      rel(N.leaves(t)[0].c, C0, 1e-9, 'la última hoja es C_eq');
    }
    eq(N.combine(S(leaf('C1', 6), P(leaf('C2', 1), leaf('C3', 2))), 'C1', 'C2'), null, 'C1 y C2 no se combinan');
    eq(N.mergedId('C3', 'C12'), 'C123');
  });

  test('capnet: el diagnóstico reconoce cada error típico', () => {
    const t = N.PRESETS[2].tree, V = 12;
    ['C', 'Q', 'V', 'U', 'Ut'].forEach((k) => ['C1', 'C2', 'C3'].forEach((id) => {
      const r = N.answers(k, t, V, id);
      eq(N.diagnose(k, t, V, id, r.truth), 'ok', k + id);
      eq(N.diagnose(k, t, V, id, r.truth * 1.004), 'ok', k + id + ' redondeado');
      Object.keys(r).filter((m) => m !== 'truth').forEach((m) => [].concat(r[m]).forEach((val) => {
        if (Math.abs(val - r.truth) <= 0.02 * Math.abs(r.truth)) return;
        const got = N.diagnose(k, t, V, id, val);
        if (got !== m && !(got !== 'ok' && got !== 'bad')) throw new Error(`${k} ${id} ${m}: ${got}`);
      }));
      eq(N.diagnose(k, t, V, id, r.truth * 3.7), 'bad', k + id + ' otro');
      eq(N.diagnose(k, t, V, id, NaN), 'bad');
    }));
    // Los mensajes clave: serie sumada como paralelo, V total en serie, sin ½.
    eq(N.diagnose('C', t, V, 'C1', 9), 'swap');
    eq(N.diagnose('V', t, V, 'C1', 12), 'vTotal');
    eq(N.diagnose('Q', t, V, 'C2', 24), 'qTotal');
    eq(N.diagnose('Ut', t, V, 'C1', 288), 'noHalf');
  });

  test('capnet: el dibujo del circuito no encima capacitores y cabe en su lienzo', () => {
    const trees = N.PRESETS.map((p) => p.tree);
    for (let i = 0; i < 200; i++) trees.push(randomTree());
    trees.forEach((t, n) => {
      const G = N.circuit(t);
      eq(G.caps.length, N.leaves(t).length, 'una caja por capacitor');
      G.caps.forEach((c, i) => {
        if (c.x < 0 || c.y < 0 || c.x + c.w > G.W || c.y + c.h > G.H) throw new Error(`red ${n}: ${c.id} se sale`);
        G.caps.forEach((d, j) => {
          if (j <= i) return;
          if (c.x < d.x + d.w - 0.5 && d.x < c.x + c.w - 0.5 && c.y < d.y + d.h - 0.5 && d.y < c.y + c.h - 0.5) throw new Error(`red ${n}: ${c.id} y ${d.id} se enciman`);
        });
      });
      G.wires.forEach((w) => { if (Math.min(w[0], w[2]) < 0 || Math.max(w[0], w[2]) > G.W || Math.min(w[1], w[3]) < 0 || Math.max(w[1], w[3]) > G.H) throw new Error(`red ${n}: cable fuera`); });
      if (G.W > 900 || G.H > 640) throw new Error(`red ${n}: lienzo de ${G.W}×${G.H}`);
    });
  });

  // Banco de S10: cada pregunta numérica con `alt` se recalcula por el solver nodal u otra ruta.
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-2/bank/sesion-10.js');
  if (fs.existsSync(bankFile)) {
    test('capnet: el banco de S10 coincide con las rutas alternas (alt)', () => {
      const W = loadData([path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], { LabMath: LM });
      const Q = W.CB_BANK.f2.S10.questions.filter((q) => typeof q.alt === 'function');
      if (Q.length < 30) throw new Error(`solo ${Q.length} preguntas con alt`);
      Q.forEach((q) => {
        let n = 0;
        for (let i = 0; i < 400 && n < 40; i++) {
          const v = {};
          Object.entries(q.vars || {}).forEach(([k, r]) => { const st = r[2] || 1, m = Math.round((r[1] - r[0]) / st); v[k] = +(r[0] + st * Math.floor(rnd() * (m + 1))).toFixed(10); });
          if (q.where && !q.where(v)) continue;
          n++;
          const a = q.answer(v), b = q.alt(v, LM, byNodal);
          if (!(Math.abs(a - b) <= 1e-6 * Math.max(Math.abs(b), 1e-30))) throw new Error(`${q.id} ${JSON.stringify(v)}: ${a} contra ${b}`);
        }
        if (!n) throw new Error(`${q.id}: ninguna instancia cumple where`);
      });
    });
  }
};
