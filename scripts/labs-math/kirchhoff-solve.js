// Pruebas de LabMath.kirchsys (lab kirchhoff-solve, Física 2 · S14) con oráculos independientes:
// las corrientes que salen de las ecuaciones de malla/rama (Gauss propio y math.lusolve) contra el
// solver nodal de S10 (LabMath.capnet.nodal) en los presets y en cientos de circuitos al azar; la
// pertenencia al espacio de filas (rango) contra el criterio a·x* = r; la detección de signos,
// dependencia, faltantes y capacitor; el balance de potencias; Q = CV contra el potencial nodal y
// contra la fórmula cerrada del circuito reducido; y el banco de S14 (campo alt).
'use strict';
const path = require('path');
const fs = require('fs');
const { loadData } = require('../lib/load');

module.exports = ({ test, eq, near, LM, math }) => {
  const K = LM.kirchsys;
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1), msg);
  let seed = 77;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const randSigns = () => [0, 1, 2].map(() => (rnd() < 0.5 ? 1 : -1));
  function circuits(n) {
    const out = K.PRESETS.map((p) => ({ spec: p.spec, s: p.s }));
    for (let i = 0; i < n; i++) {
      const t = i % 3;
      out.push({ spec: K.random(rnd, t === 0 ? 'two' : 'three', t === 2), s: randSigns() });
    }
    return out;
  }
  const dot = (a, x) => a[0] * x[0] + a[1] * x[1] + a[2] * x[2];

  test('kirchsys: preset de dos mallas con valores a mano', () => {
    // ε₁ = 12 V, R₁ = 2 Ω; R₂ = 4 Ω; ε₃ = 6 V, R₃ = 2 Ω. Millman: V_ab = (6 + 0 + 3)/(1/2 + 1/4 + 1/2) = 7.2 V.
    const s = K.solveNodal(K.PRESETS[0].spec, [1, -1, 1]);
    near(s.pot.A, 7.2, 1e-12);
    near(s.x[0], 2.4, 1e-12); near(s.x[1], 1.8, 1e-12); near(s.x[2], -0.6, 1e-12);
    near(s.Psup, 25.2, 1e-12); near(s.Pdis, 25.2, 1e-12);
    eq(K.eqText([2, -4, 0, 12]), '2I₁ − 4I₂ = 12');
    eq(K.eqText([1, -1, 1, 0]), 'I₁ − I₂ + I₃ = 0');
    eq(K.eqText([0, 0, -1, -6]), '−I₃ = −6');
  });

  test('kirchsys: el sistema de mallas/ramas (Gauss propio y math.lusolve) coincide con el solver nodal', () => {
    circuits(450).forEach(({ spec, s }, n) => {
      const c = K.build(spec), rows = K.standard(c, s), nod = K.solveNodal(c, s);
      const A = rows.map((r) => r.slice(0, 3)), b = rows.map((r) => r[3]);
      const x = K.gauss(A, b), y = math.lusolve(A, b).map((r) => r[0]);
      if (!x) throw new Error(`circuito ${n}: sistema estándar singular ${JSON.stringify(spec)}`);
      [0, 1, 2].forEach((j) => {
        rel(x[j], nod.x[j], 1e-9, `circuito ${n} I${j + 1} (Gauss)`);
        rel(y[j], nod.x[j], 1e-9, `circuito ${n} I${j + 1} (lusolve)`);
      });
      // Corriente de cada rama a partir de las incógnitas = la del solver nodal.
      const M = K.matrix(c, s);
      c.branches.forEach((br, k) => rel(dot(M[k], x), nod.i[k], 1e-9, `circuito ${n} rama ${k}`));
    });
  });

  test('kirchsys: n − 1 ecuaciones de nodo y b − n + 1 de malla; el conjunto verdadero tiene rango 3', () => {
    circuits(150).forEach(({ spec, s }) => {
      const c = K.build(spec), caps = c.branches.filter((b) => b.C).length;
      const b = c.branches.length, n = c.nodes.length;
      eq(K.cycles(c, () => true).length, b - n + 1, 'lazos independientes');
      eq(K.cycles(c, (k) => !c.branches[k].C).length, b - caps - n + 1, 'lazos sin el capacitor');
      eq(K.rank(K.equations(c, s)), 3);
      eq(K.rank(K.equations(c, s, true)), 3);
      eq(K.rank(K.standard(c, s)), 3);
    });
    eq(K.rank([[1, 2, 3, 4], [2, 4, 6, 8], [0, 0, 0, 0]]), 1);
    eq(K.rank([[1, 2, 0, 1], [0, 1, 1, 0], [1, 3, 1, 1]]), 2);
  });

  test('kirchsys: «está en el espacio de filas» ⟺ la solución real cumple la ecuación (a·x* = r)', () => {
    let valid = 0, invalid = 0;
    circuits(200).forEach(({ spec, s }) => {
      const c = K.build(spec), T = K.equations(c, s), x = K.solveNodal(c, s).x;
      for (let t = 0; t < 6; t++) {
        // Combinación entera de dos ecuaciones verdaderas: válida.
        const a = T[Math.floor(rnd() * T.length)], b = T[Math.floor(rnd() * T.length)];
        const p = 1 + Math.floor(rnd() * 3), q = Math.floor(rnd() * 5) - 2, row = a.map((v, j) => p * v + q * b[j]);
        if (row.slice(0, 3).every((v) => v === 0)) continue;
        const ok = Math.abs(dot(row, x) - row[3]) <= 1e-9 * (1 + Math.abs(row[3]) + row.slice(0, 3).reduce((m, v) => m + Math.abs(v), 0));
        eq(ok, true, 'combinación verdadera');
        eq(K.checkRow(c, s, row).kind, 'ok', 'combinación ' + JSON.stringify(row));
        valid++;
        // Renglón al azar: el veredicto coincide con el criterio a·x* = r.
        const r2 = [0, 1, 2, 3].map(() => Math.floor(rnd() * 13) - 6);
        if (r2.slice(0, 3).every((v) => v === 0)) continue;
        const ok2 = Math.abs(dot(r2, x) - r2[3]) <= 1e-9 * (1 + Math.abs(r2[3]));
        eq(K.checkRow(c, s, r2).kind === 'ok', ok2, 'al azar ' + JSON.stringify(r2));
        if (!ok2) invalid++;
      }
    });
    if (valid < 500 || invalid < 500) throw new Error(`pocos casos: ${valid} válidos, ${invalid} inválidos`);
  });

  test('kirchsys: un término con el signo al revés se reconoce como «signo» (y dice cuál)', () => {
    let n = 0;
    circuits(200).forEach(({ spec, s }) => {
      const c = K.build(spec), x = K.solveNodal(c, s).x;
      K.standard(c, s).forEach((row) => {
        [0, 1, 2, 3].forEach((j) => {
          if (!row[j]) return;
          const val = j < 3 ? row[j] * x[j] : row[3];
          if (Math.abs(val) < 1e-6) return;                     // el término vale 0: invertirlo no cambia nada
          const f = row.slice(); f[j] = -f[j];
          const r = K.checkRow(c, s, f);
          eq(r.kind, 'sign', JSON.stringify({ spec, s, f }));
          // El término que reporta, al corregirlo, deja la ecuación válida.
          const g = f.slice(); g[r.term] = -g[r.term];
          eq(K.checkRow(c, s, g).kind, 'ok');
          n++;
        });
      });
    });
    if (n < 1000) throw new Error('pocos casos: ' + n);
  });

  test('kirchsys: la malla grande es dependiente; con dos ecuaciones faltan; 0 = algo no vale', () => {
    // Dos mallas: ventana 1, ventana 2 y la malla grande (suma de las dos).
    const c = K.build(K.PRESETS[0].spec), s = K.PRESETS[0].s, st = K.standard(c, s);
    const big = st[1].map((v, j) => v + st[2][j]);
    let r = K.checkSystem(c, s, [st[1], st[2], big]);
    eq(r.verdict, 'dependent'); eq(r.solvable, false); eq(r.dep.k, 2);
    near(r.dep.lambda[0], 1, 1e-9); near(r.dep.lambda[1], 1, 1e-9);
    r = K.checkSystem(c, s, [st[0], st[0].map((v) => -v), st[1]]);
    eq(r.verdict, 'dependent', 'el mismo nodo dos veces');
    r = K.checkSystem(c, s, [st[0], st[1], [0, 0, 0, 0]]);
    eq(r.verdict, 'missing'); eq(r.used.length, 2);
    eq(K.checkSystem(c, s, [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]).verdict, 'missing');
    eq(K.checkRow(c, s, [0, 0, 0, 5]).kind, 'zero');
    r = K.checkSystem(c, s, st);
    eq(r.verdict, 'ok'); [0, 1, 2].forEach((j) => near(r.x[j], [2.4, 1.8, -0.6][j], 1e-9));
    // Tres mallas: m1, m2 y la que rodea a las dos (= m1 + m2).
    const c3 = K.build(K.PRESETS[2].spec), s3 = [1, 1, 1], m = K.standard(c3, s3);
    r = K.checkSystem(c3, s3, [m[0], m[1], m[0].map((v, j) => v + m[1][j])]);
    eq(r.verdict, 'dependent'); eq(r.dep.k, 2);
    eq(K.checkSystem(c3, s3, m).verdict, 'ok');
    // En circuitos al azar: cualquier tercera ecuación que sea suma de las otras dos es dependiente.
    circuits(100).forEach(({ spec, s: sg }) => {
      const cc = K.build(spec), t = K.standard(cc, sg), p = 1 + Math.floor(rnd() * 3), q = -2 + Math.floor(rnd() * 5) || 1;
      const out = K.checkSystem(cc, sg, [t[0], t[1], t[0].map((v, j) => p * v + q * t[1][j])]);
      eq(out.verdict, 'dependent'); eq(out.dep.k, 2);
      near(out.dep.lambda[0], p, 1e-9); near(out.dep.lambda[1], q, 1e-9);
    });
  });

  test('kirchsys: capacitor en estado estable (rama abierta) y el error de tratarlo como cable', () => {
    let n = 0;
    circuits(240).forEach(({ spec, s }) => {
      if (!spec.C) return;
      const c = K.build(spec), nod = K.solveNodal(c, s);
      near(nod.i[4], 0, 1e-12, 'por el capacitor no pasa corriente');
      near(nod.x[2] * s[2], 0, 1e-12, 'la malla del capacitor vale 0');
      // Q = C·V con el potencial nodal (la rama Rt va de T2 a B, sin fem).
      rel(nod.Q, spec.C * Math.abs(nod.pot.T2 - nod.pot.B), 1e-12, 'Q nodal');
      // Ruta independiente: mallas 1 y 2 sin la del capacitor; V_C = R₄·I₂ − ε₄ en la rama V2.
      const R = spec.R, E = spec.E;
      const x = K.gauss([[R[0] + R[1], -R[1]], [-R[1], R[1] + R[2] + R[3]]], [E[0] + E[1], E[2] + E[3] - E[1]]);
      rel(nod.Q, spec.C * Math.abs(R[3] * x[1] - E[3]), 1e-9, 'Q por mallas');
      // La malla del capacitor escrita como si fuera un cable: «cap».
      const M = K.matrix(c, s), wire = [0, 0, 0, 0];
      [[4, 1], [3, -1]].forEach(([k, o]) => { M[k].forEach((v, j) => { wire[j] += o * c.branches[k].R * v; }); wire[3] += o * c.branches[k].E; });
      const st = K.standard(c, s);
      const res = K.checkSystem(c, s, [st[0], st[1], wire]);
      if (Math.abs(dot(wire, nod.x) - wire[3]) > 1e-6) { eq(res.rows[2].kind, 'cap'); eq(res.verdict, 'cap'); n++; }
      eq(K.checkSystem(c, s, st).verdict, 'ok');
    });
    if (n < 40) throw new Error('pocos casos con capacitor: ' + n);
    // El preset: ε = 18 V, R = 2, 6, 1, 3, 4 Ω, C = 10 μF → I₂ = 6·18/(8·10 − 36) = 27/11 A, V_C = 3·27/11 V.
    const p = K.solveNodal(K.PRESETS[4].spec);
    rel(p.x[1], 27 / 11, 1e-12); rel(p.Q, 10 * 81 / 11, 1e-12);
  });

  test('kirchsys: balance de potencias Σ εI = Σ I²R, y la potencia de cada fem', () => {
    circuits(300).forEach(({ spec, s }) => {
      const c = K.build(spec), nod = K.solveNodal(c, s);
      rel(nod.Psup, nod.Pdis, 1e-9, 'balance');
      // Con las corrientes del sistema estándar (otra ruta): Σ ε_k i_k y Σ R_k i_k².
      const x = K.solveRows(K.standard(c, s)), M = K.matrix(c, s);
      let ps = 0, pd = 0;
      c.branches.forEach((br, k) => { const i = dot(M[k], x); ps += br.E * i; pd += br.R * i * i; });
      rel(ps, nod.Psup, 1e-9); rel(pd, nod.Pdis, 1e-9);
      rel(nod.P.reduce((a, b) => a + b, 0), nod.Psup, 1e-9);
    });
  });

  test('kirchsys: el dibujo cabe en su lienzo y las etiquetas no se enciman', () => {
    circuits(200).forEach(({ spec, s }, n) => {
      const c = K.build(spec), G = K.geometry(c, s);
      const boxes = G.labels.map((L) => {
        const chars = L.parts.reduce((t, p) => t + p[0].length * (p[1] ? 0.72 : 1), 0), w = chars * L.size * 0.58;
        const x0 = L.anchor === 'end' ? L.x - w : L.anchor === 'middle' ? L.x - w / 2 : L.x;
        return { x0, x1: x0 + w, y0: L.y - L.size * 0.8, y1: L.y + L.size * 0.3, t: L.parts.map((p) => p[0]).join('') };
      });
      boxes.forEach((b, i) => {
        if (b.x0 < 0 || b.x1 > G.W || b.y0 < 0 || b.y1 > G.H) throw new Error(`circuito ${n}: «${b.t}» se sale (${b.x0.toFixed(0)}–${b.x1.toFixed(0)})`);
        boxes.forEach((d, j) => {
          if (j <= i) return;
          if (b.x0 < d.x1 && d.x0 < b.x1 && b.y0 < d.y1 && d.y0 < b.y1) throw new Error(`circuito ${n}: «${b.t}» y «${d.t}» se enciman`);
        });
        // Ninguna etiqueta toca un cable.
        G.wires.forEach((w) => {
          const xa = Math.min(w[0], w[2]) - 1, xb = Math.max(w[0], w[2]) + 1, ya = Math.min(w[1], w[3]) - 1, yb = Math.max(w[1], w[3]) + 1;
          if (b.x0 < xb && xa < b.x1 && b.y0 < yb && ya < b.y1) throw new Error(`circuito ${n}: «${b.t}» toca un cable`);
        });
      });
      G.wires.forEach((w) => { if (Math.min(w[0], w[2]) < 0 || Math.max(w[0], w[2]) > G.W || Math.min(w[1], w[3]) < 0 || Math.max(w[1], w[3]) > G.H) throw new Error('cable fuera'); });
    });
  });

  // Banco de S14: cada pregunta numérica con `alt` se recalcula por otra ruta (solver nodal).
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-2/bank/sesion-14.js');
  if (fs.existsSync(bankFile)) {
    test('kirchsys: el banco de S14 coincide con las rutas alternas (alt)', () => {
      const W = loadData([path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], { LabMath: LM });
      const Q = W.CB_BANK.f2.S14.questions.filter((q) => typeof q.alt === 'function');
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
