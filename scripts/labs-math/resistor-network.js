// Pruebas de LabMath.resnet (lab resistor-network, Física 2 · S12) con oráculos independientes:
// el solver nodal genérico de S10 (LabMath.capnet.nodal, con conductancias 1/R y la fuente
// como un nodo fijo en ε unido a la terminal + por su resistencia interna r) contra la reducción
// serie/paralelo en los presets y en cientos de redes al azar; la potencia que entrega la fem
// contra Σ I²R + I²r; V terminal = ε − Ir; la relación serie/paralelo contra «misma I» /
// «mismo V»; la máxima transferencia por barrido; y el banco de S12.
'use strict';
const path = require('path');
const fs = require('fs');
const { loadData } = require('../lib/load');

module.exports = ({ test, eq, near, LM }) => {
  const N = LM.resnet, NOD = LM.capnet.nodal;
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-12), msg);
  let seed = 47;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const { leaf, S, P } = N;

  // Oráculo: potenciales nodales. Nodo 's' fijo en ε, rama s–a con conductancia 1/r (si r > 0;
  // si r = 0, a queda fijo en ε), b fijo en 0. Corriente de cada rama = (V_a − V_b)/R.
  function byNodal(tree, emf, rint) {
    const g = N.graph(tree), branches = g.branches.map((br) => ({ a: br.a, b: br.b, value: 1 / br.r }));
    let nodes = g.nodes.slice(), fixed = { b: 0 };
    if (rint > 0) { nodes.push('s'); fixed.s = emf; branches.push({ a: 's', b: 'a', value: 1 / rint }); }
    else fixed.a = emf;
    const pot = NOD({ nodes, branches, fixed }), parts = {};
    g.branches.forEach((br) => { const dv = pot[br.a] - pot[br.b]; parts[br.id] = { I: dv / br.r, V: dv, P: dv * dv / br.r }; });
    // Corriente total: la que sale de la terminal a hacia la red.
    let I = 0;
    g.branches.forEach((br) => { if (br.a === 'a') I += parts[br.id].I; if (br.b === 'a') I -= parts[br.id].I; });
    return { I, Vt: pot.a, R: pot.a / I, parts, pot };
  }
  function sameAsNodal(tree, emf, rint, msg) {
    const s = N.solve(tree, emf, rint), o = byNodal(tree, emf, rint);
    rel(s.R, o.R, 1e-9, msg + ' R_eq'); rel(s.I, o.I, 1e-9, msg + ' I'); rel(s.Vt, o.Vt, 1e-9, msg + ' V terminal');
    N.leaves(tree).forEach((x) => {
      rel(s.parts[x.id].I, o.parts[x.id].I, 1e-9, msg + ' I ' + x.id);
      rel(s.parts[x.id].V, o.parts[x.id].V, 1e-9, msg + ' V ' + x.id);
      rel(s.parts[x.id].P, o.parts[x.id].P, 1e-9, msg + ' P ' + x.id);
    });
  }
  function randomTree() { return N.random(rnd, 2 + Math.floor(rnd() * 4)); }
  const RINTS = [0, 0.5, 1, 2, 3];

  test('resnet: serie, paralelo y fuente con valores a mano', () => {
    near(N.series([2, 4, 6]), 12, 1e-12);
    near(N.parallel([6, 3]), 2, 1e-12);
    near(N.parallel([2, 3, 6]), 1, 1e-12);
    near(N.eq(N.PRESETS[2].tree), 8, 1e-12);
    near(N.eq(N.PRESETS[3].tree), 8, 1e-12);
    near(N.eq(N.PRESETS[4].tree), 3, 1e-12);
    const s = N.solve(N.PRESETS[2].tree, 18, 1);
    near(s.I, 2, 1e-12); near(s.Vt, 16, 1e-12); near(s.parts.R1.I, 1.5, 1e-12); near(s.parts.R2.I, 0.5, 1e-12);
    near(s.parts.R3.V, 10, 1e-12); near(s.Pr, 4, 1e-12); near(s.Pemf, 36, 1e-12);
    const car = N.solve(leaf('R1', 0.06), 12, 0.02);
    near(car.I, 150, 1e-9); near(car.Vt, 9, 1e-9);
    near(N.vDivider(24, [2, 4, 6], 1), 8, 1e-12); near(N.iDivider(6, [6, 3], 0), 2, 1e-12);
  });

  test('resnet: la reducción coincide con el solver nodal en los presets (con y sin r)', () => {
    N.PRESETS.forEach((p) => { sameAsNodal(p.tree, p.emf, p.r, p.name); RINTS.forEach((r) => sameAsNodal(p.tree, p.emf, r, p.name + ' r=' + r)); });
  });

  test('resnet: la reducción coincide con el solver nodal en 400 redes al azar', () => {
    for (let i = 0; i < 400; i++) {
      const t = randomTree(), emf = 1 + Math.floor(rnd() * 24), r = RINTS[Math.floor(rnd() * RINTS.length)];
      const n = N.leaves(t).length;
      if (n < 2 || n > 5) throw new Error('red con ' + n + ' resistores');
      sameAsNodal(t, emf, r, 'red ' + i + ' ' + JSON.stringify(t));
    }
  });

  test('resnet: potencia de la fem εI = Σ I²R + I²r y V terminal = ε − Ir', () => {
    for (let i = 0; i < 300; i++) {
      const t = randomTree(), emf = 1 + rnd() * 30, r = rnd() * 3, s = N.solve(t, emf, r), o = byNodal(t, emf, r);
      let sumI2R = 0, sumVI = 0;
      N.leaves(t).forEach((x) => { const p = o.parts[x.id]; sumI2R += p.I * p.I * x.r; sumVI += p.V * p.I; });
      rel(s.Pemf, sumI2R + o.I * o.I * r, 1e-9, 'εI');
      rel(s.sumP, sumI2R, 1e-9, 'Σ I²R'); rel(sumI2R, sumVI, 1e-9);
      rel(s.Pext, o.Vt * o.I, 1e-9, 'V·I');
      rel(o.Vt, emf - o.I * r, 1e-9, 'ε − Ir (nodal)'); rel(s.Vt, emf - s.I * r, 1e-12);
      near(s.Pr, o.I * o.I * r, 1e-9 * (1 + s.Pr));
    }
  });

  test('resnet: máxima transferencia en R = r (barrido numérico)', () => {
    [[12, 0.5], [9, 2], [24, 3], [1.5, 0.1]].forEach(([emf, r]) => {
      let best = 0, bestR = 0;
      for (let k = 1; k <= 20000; k++) { const R = k * r / 5000, p = N.loadPower(emf, r, R); if (p > best) { best = p; bestR = R; } }
      rel(bestR, r, 2e-3, 'R óptima'); rel(N.maxPower(emf, r).P, best, 1e-6, 'P máx');
      rel(N.loadPower(emf, r, r), emf * emf / (4 * r), 1e-12);
    });
  });

  // Oráculo físico de la relación: dos resistores están en serie si llevan la misma corriente y
  // en paralelo si tienen el mismo voltaje, para valores cualesquiera (dos juegos al azar).
  function physRelation(tree, a, b) {
    let sameI = true, sameV = true;
    for (let r = 0; r < 2; r++) {
      const t = JSON.parse(JSON.stringify(tree));
      N.leaves(t).forEach((x) => { x.r = 0.5 + rnd() * 10; });
      const o = byNodal(t, 10, 0);
      if (Math.abs(o.parts[a].I - o.parts[b].I) > 1e-9 * Math.abs(o.parts[a].I)) sameI = false;
      if (Math.abs(o.parts[a].V - o.parts[b].V) > 1e-9 * Math.abs(o.parts[a].V)) sameV = false;
    }
    return sameV ? 'parallel' : sameI ? 'series' : 'none';
  }
  test('resnet: serie/paralelo/ninguno coincide con «misma I» / «mismo V» del solver nodal', () => {
    for (let i = 0; i < 200; i++) {
      const t = randomTree(), ids = N.leaves(t).map((x) => x.id);
      ids.forEach((a) => ids.forEach((b) => {
        if (a === b) return eq(N.relation(t, a, b).kind, 'same');
        eq(N.relation(t, a, b).kind, physRelation(t, a, b), `${a}–${b} en ${JSON.stringify(t)}`);
      }));
    }
  });

  test('resnet: reducir de dos en dos (en cualquier orden válido) conserva R_eq y el reparto', () => {
    for (let i = 0; i < 200; i++) {
      let t = randomTree();
      const emf = 12, r = 1, o0 = byNodal(t, emf, r);
      while (N.leaves(t).length > 1) {
        const ids = N.leaves(t).map((x) => x.id), pairs = [];
        ids.forEach((a) => ids.forEach((b) => { if (a < b && N.relation(t, a, b).kind !== 'none') pairs.push([a, b]); }));
        if (!pairs.length) throw new Error('sin pares combinables en ' + JSON.stringify(t));
        const [a, b] = pairs[Math.floor(rnd() * pairs.length)];
        const res = N.combine(t, a, b);
        const want = N.relation(t, a, b).kind === 'series' ? N.find(t, a).r + N.find(t, b).r : 1 / (1 / N.find(t, a).r + 1 / N.find(t, b).r);
        rel(res.r, want, 1e-12);
        t = res.tree;
        const o = byNodal(t, emf, r);
        rel(o.R, o0.R, 1e-9, 'R_eq tras combinar'); rel(o.I, o0.I, 1e-9, 'I tras combinar');
        N.leaves(t).forEach((x) => { if (o0.parts[x.id]) rel(o.parts[x.id].I, o0.parts[x.id].I, 1e-9, x.id); });
      }
      rel(N.leaves(t)[0].r, o0.R, 1e-9, 'la última hoja es R_eq');
    }
    eq(N.combine(S(leaf('R1', 6), P(leaf('R2', 1), leaf('R3', 2))), 'R1', 'R2'), null, 'R1 y R2 no se combinan');
    eq(N.mergedId('R3', 'R12'), 'R123');
  });

  test('resnet: el diagnóstico reconoce cada error típico', () => {
    const t = N.PRESETS[2].tree, emf = 18, r = 1;
    ['R', 'I', 'Vt', 'Ii', 'Vi', 'Pi'].forEach((k) => ['R1', 'R2', 'R3'].forEach((id) => {
      const a = N.answers(k, t, emf, r, id);
      eq(N.diagnose(k, t, emf, r, id, a.truth), 'ok', k + id);
      eq(N.diagnose(k, t, emf, r, id, a.truth * 1.004), 'ok', k + id + ' redondeado');
      Object.keys(a).filter((m) => m !== 'truth').forEach((m) => [].concat(a[m]).forEach((val) => {
        if (val == null || Math.abs(val - a.truth) <= 0.02 * Math.abs(a.truth)) return;
        const got = N.diagnose(k, t, emf, r, id, val);
        if (got !== m && !(got !== 'ok' && got !== 'bad')) throw new Error(`${k} ${id} ${m}: ${got}`);
      }));
      eq(N.diagnose(k, t, emf, r, id, a.truth * 3.7), 'bad', k + id + ' otro');
      eq(N.diagnose(k, t, emf, r, id, NaN), 'bad');
    }));
    // Los mensajes clave (R_eq = 8, I = 2, V = 16; R1 = 4 ∥ R2 = 12, R3 = 5).
    eq(N.diagnose('R', t, emf, r, 'R1', 21), 'swap');                 // el par sumado en serie: 4 + 12 + 5
    eq(N.diagnose('I', t, emf, r, 'R1', 2.25), 'noR');                // 18/8
    eq(N.diagnose('Vt', t, emf, r, 'R1', 18), 'noR');
    eq(N.diagnose('Vt', t, emf, r, 'R1', 20), 'sign');
    eq(N.diagnose('Vi', t, emf, r, 'R3', 18), 'vTotal');
    eq(N.diagnose('Ii', t, emf, r, 'R1', 2), 'iTotal');
    eq(N.diagnose('Pi', t, emf, r, 'R3', 36), 'pTotal');              // ε·I₃ = 18·2
    eq(N.diagnose('Pi', t, emf, r, 'R3', 64.8), 'vTotal');            // ε²/R₃
  });

  test('resnet: el dibujo del circuito no encima resistores y cabe en su lienzo', () => {
    const trees = N.PRESETS.map((p) => p.tree);
    for (let i = 0; i < 200; i++) trees.push(randomTree());
    trees.forEach((t, n) => {
      const G = N.circuit(t);
      eq(G.res.length, N.leaves(t).length, 'una caja por resistor');
      G.res.forEach((c, i) => {
        if (c.x < 0 || c.y < 0 || c.x + c.w > G.W || c.y + c.h > G.H) throw new Error(`red ${n}: ${c.id} se sale`);
        G.res.forEach((d, j) => {
          if (j <= i) return;
          if (c.x < d.x + d.w - 0.5 && d.x < c.x + c.w - 0.5 && c.y < d.y + d.h - 0.5 && d.y < c.y + c.h - 0.5) throw new Error(`red ${n}: ${c.id} y ${d.id} se enciman`);
        });
        if (c.y + c.h > G.source.y - 30) throw new Error(`red ${n}: ${c.id} choca con la fuente`);
      });
      G.wires.forEach((w) => { if (Math.min(w[0], w[2]) < 0 || Math.max(w[0], w[2]) > G.W || Math.min(w[1], w[3]) < 0 || Math.max(w[1], w[3]) > G.H) throw new Error(`red ${n}: cable fuera`); });
      if (G.source.y + 56 > G.H) throw new Error(`red ${n}: la etiqueta de la fuente se sale`);
      if (G.W > 900 || G.H > 660) throw new Error(`red ${n}: lienzo de ${G.W}×${G.H}`);
    });
  });

  // Banco de S12: cada pregunta numérica con `alt` se recalcula por el solver nodal u otra ruta.
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-2/bank/sesion-12.js');
  if (fs.existsSync(bankFile)) {
    test('resnet: el banco de S12 coincide con las rutas alternas (alt)', () => {
      const W = loadData([path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], { LabMath: LM });
      const Q = W.CB_BANK.f2.S12.questions.filter((q) => typeof q.alt === 'function');
      if (Q.length < 45) throw new Error(`solo ${Q.length} preguntas con alt`);
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
