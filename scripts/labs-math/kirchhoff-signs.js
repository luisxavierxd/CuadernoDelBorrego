// Pruebas de LabMath.kirchhoff (lab kirchhoff-signs, Física 2 · S13) con oráculos independientes:
// las ecuaciones de malla (Cramer) contra el solver nodal de la S10 (LabMath.capnet.nodal) en los
// presets y en cientos de circuitos al azar; los signos de cada término contra el perfil de
// potencial que da el solver nodal; invertir una flecha invierte el signo de esa corriente; el
// balance de potencias; Cramer contra math.lusolve; el «casi» y el banco de S13.
'use strict';
const path = require('path');
const fs = require('fs');
const { loadData } = require('../lib/load');

module.exports = ({ test, eq, near, LM, math }) => {
  const K = LM.kirchhoff;
  let seed = 913;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const close = (a, b, tol, msg) => near(a, b, tol * Math.max(1, Math.abs(b)), msg);
  const randDirs = (k) => (k === 2 ? (rnd() < 0.5 ? [1, -1] : [-1, 1]) : [0, 1, 2].map(() => (rnd() < 0.5 ? 1 : -1)));
  const randomCircuit = () => K.random(rnd, rnd() < 0.4 ? 2 : 3);

  test('kirchhoff: presets resueltos a mano', () => {
    // Una malla: 12 V contra 6 V con 4 Ω y 2 Ω → I = 1 A en horario.
    const s0 = K.solve(K.PRESETS[0].c, [1, -1]);
    near(s0.I[0], 1, 1e-12); near(s0.I[1], 1, 1e-12);
    // A favor: (9 + 3)/(3 + 3) = 2 A.
    near(K.solve(K.PRESETS[1].c, [1, -1]).I[0], 2, 1e-12);
    // Dos mallas: V_a − V_b = 8 V; I₁ = 2 A arriba, I₂ = 4/3 A abajo, I₃ = 2/3 A abajo.
    const s2 = K.solve(K.PRESETS[2].c, [1, 1, 1]);
    near(s2.V, 8, 1e-12); near(s2.I[0], 2, 1e-12); near(s2.I[1], -4 / 3, 1e-12); near(s2.I[2], -2 / 3, 1e-12);
    // Batería en medio: V = 7.2 V; 1.6, −1.4, −0.2 A.
    const s3 = K.solve(K.PRESETS[3].c, [1, 1, 1]);
    near(s3.V, 7.2, 1e-12); near(s3.Iup[0], 1.6, 1e-12); near(s3.Iup[1], -1.4, 1e-12); near(s3.Iup[2], -0.2, 1e-12);
  });

  test('kirchhoff: mallas (Cramer) = solver nodal de la S10 en presets y 500 circuitos al azar', () => {
    const list = K.PRESETS.map((p) => p.c);
    for (let i = 0; i < 500; i++) list.push(randomCircuit());
    list.forEach((c, n) => {
      const dirs = randDirs(c.br.length), s = K.solve(c, dirs), o = K.nodal(c);
      close(s.V, o.V, 1e-9, `circuito ${n} V`);
      s.Iup.forEach((x, j) => close(x, o.Iup[j], 1e-9, `circuito ${n} I${j}`));
      s.I.forEach((x, j) => close(x * dirs[j], o.Iup[j], 1e-9, `circuito ${n} I${j} con flechas`));
      // V_a − V_b es el mismo subiendo por cualquier rama.
      c.br.forEach((_, j) => close(K.vab(c, s.Iup, j), o.V, 1e-9, `circuito ${n} V por la rama ${j}`));
    });
  });

  test('kirchhoff: invertir una flecha invierte el signo de esa corriente y no cambia las demás', () => {
    for (let i = 0; i < 300; i++) {
      const c = randomCircuit(), k = c.br.length, d = randDirs(k), s = K.solve(c, d);
      if (k === 2) {
        const t = K.solve(c, [-d[0], -d[1]]);
        close(t.I[0], -s.I[0], 1e-9); close(t.I[1], -s.I[1], 1e-9);
        continue;
      }
      const j = Math.floor(rnd() * 3), d2 = d.slice(); d2[j] = -d2[j];
      const t = K.solve(c, d2);
      t.I.forEach((x, m) => close(x, m === j ? -s.I[m] : s.I[m], 1e-9, `rama ${m}`));
      close(t.V, s.V, 1e-9);
    }
  });

  test('kirchhoff: balance de potencias (Σ εI de las baterías = Σ I²R) con el solver nodal', () => {
    for (let i = 0; i < 300; i++) {
      const c = randomCircuit(), o = K.nodal(c);
      let gen = 0, diss = 0;
      c.br.forEach((b, j) => b.forEach((e) => {
        // Oráculo: potencia de cada elemento como (caída de potencial) × corriente, con el perfil nodal.
        const dV = e.t === 'R' ? o.Iup[j] * e.v : -(e.up ? e.v : -e.v);
        if (e.t === 'R') diss += dV * o.Iup[j]; else gen -= dV * o.Iup[j];
      }));
      close(gen, diss, 1e-9, 'oráculo');
      const P = K.solve(c).P;
      close(P.gen, gen, 1e-9, 'Σ εI'); close(P.diss, diss, 1e-9, 'Σ I²R'); close(P.gen, P.diss, 1e-9);
    }
    // Preset de dos mallas: ε₁ entrega 24 W y ε₂ absorbe 4 W (se carga); los resistores disipan 20 W.
    const P = K.solve(K.PRESETS[2].c).P;
    near(P.src.E1, 24, 1e-12); near(P.src.E2, -4, 1e-12); near(P.diss, 20, 1e-12);
  });

  test('kirchhoff: los signos de cada término cierran la malla con los potenciales del solver nodal', () => {
    for (let i = 0; i < 300; i++) {
      const c = randomCircuit(), o = K.nodal(c), d = randDirs(c.br.length), I = o.Iup.map((x, j) => x * d[j]);
      K.loops(c).forEach((L) => [1, -1].forEach((tr) => {
        let sum = 0;
        K.terms(c, L, tr, d).forEach((t) => { sum += t.t === 'R' ? t.sign * t.v * I[t.b] : t.sign * t.v; });
        close(sum, 0, 1e-9, `malla ${L.id} ${tr}`);
        // El término sigue al potencial: recorrer en contra de la corriente real sube el potencial.
        K.terms(c, L, tr, d).forEach((t) => {
          if (t.t !== 'R') return;
          const realUp = o.Iup[t.b] > 0, goingUp = t.up, change = t.sign * t.v * I[t.b];
          if (Math.abs(o.Iup[t.b]) > 1e-9) eq(change < 0, realUp === goingUp, `${t.id}: a favor de la corriente real, el potencial baja`);
        });
      }));
      // Regla de nodos: lo que entra a a es lo que sale.
      near(o.Iup.reduce((s, x) => s + x, 0), 0, 1e-9);
    }
  });

  test('kirchhoff: recorrer la malla al revés invierte todos los signos', () => {
    for (let i = 0; i < 100; i++) {
      const c = randomCircuit(), d = randDirs(c.br.length);
      K.loops(c).forEach((L) => {
        const a = K.terms(c, L, 1, d), b = K.terms(c, L, -1, d);
        eq(a.length, b.length);
        a.forEach((t) => { const u = b.find((x) => x.id === t.id); eq(u.sign, -t.sign, t.id); });
      });
    }
  });

  test('kirchhoff: revisión término por término', () => {
    const c = K.PRESETS[2].c, d = [1, 1, 1];
    const T = K.terms(c, 'izq', 1, d);
    eq(T.map((t) => t.id + (t.sign > 0 ? '+' : '-')).join(' '), 'E1+ R1- R2+');
    eq(K.eqText(c, 'izq', 1, d), 'ε₁ − R₁I₁ + R₂I₂ = 0');
    const good = {}; T.forEach((t) => { good[t.id] = t.sign; });
    eq(K.checkSigns(c, 'izq', 1, d, good).allOk, true);
    const bad = Object.assign({}, good, { R2: -1 }), r = K.checkSigns(c, 'izq', 1, d, bad);
    eq(r.wrong, 1); eq(r.rows.find((x) => x.id === 'R2').ok, false);
    eq(/en contra de I₂: el potencial sube/.test(r.rows.find((x) => x.id === 'R2').why), true);
    eq(K.checkSigns(c, 'izq', 1, d, {}).missing, 3);
    eq(/de − a \+: el potencial sube/.test(K.why(c, T[0])), true);
    eq(K.nodeText(c, [1, -1, -1]), 'I₁ = I₂ + I₃');
    eq(K.nodeText(c, [1, 1, 1]), 'I₁ + I₂ + I₃ = 0');
    eq(K.nodeText(K.PRESETS[0].c, [1, -1]), null);
    eq(K.eqText(K.PRESETS[0].c, 'malla', 1, [1, -1]), 'ε₁ − R₁I − ε₂ − R₂I = 0');
  });

  test('kirchhoff: Cramer contra math.lusolve y contra Gauss de la S10', () => {
    for (let t = 0; t < 80; t++) {
      const n = 2 + Math.floor(rnd() * 2), A = [], b = [];
      for (let i = 0; i < n; i++) { A.push([]); b.push(rnd() * 20 - 10); for (let j = 0; j < n; j++) A[i].push(rnd() * 10 - 5 + (i === j ? 8 : 0)); }
      const x = K.cramer(A, b), y = math.lusolve(A, b).map((r) => r[0]), z = LM.capnet.gauss(A, b);
      x.forEach((xi, i) => { near(xi, y[i], 1e-9 * (1 + Math.abs(y[i]))); near(xi, z[i], 1e-9 * (1 + Math.abs(z[i]))); });
      near(K.det(A), math.det(A), 1e-9 * (1 + Math.abs(math.det(A))));
    }
    eq(K.cramer([[1, 2], [2, 4]], [1, 2]).every((v) => isNaN(v)), true, 'singular → NaN');
  });

  test('kirchhoff: el diagnóstico reconoce cada error típico', () => {
    const list = K.PRESETS.map((p) => p.c);
    for (let i = 0; i < 150; i++) list.push(randomCircuit());
    list.forEach((c, n) => {
      const d = randDirs(c.br.length);
      c.br.forEach((_, j) => {
        if (c.br.length === 2 && j > 0) return;
        const r = K.answers(c, d, j);
        eq(K.diagnose(c, d, j, r.truth), 'ok', `circuito ${n} rama ${j}`);
        eq(K.diagnose(c, d, j, +r.truth.toFixed(2)), 'ok', 'redondeado');
        if (Math.abs(r.truth) > 0.05) eq(K.diagnose(c, d, j, -r.truth), 'flip', `circuito ${n} rama ${j} signo`);
        ['emf', 'drop', 'isolated', 'node'].forEach((m) => r[m].forEach((val) => {
          if (!isFinite(val) || Math.abs(val - r.truth) <= Math.max(0.03, 0.02 * Math.abs(r.truth)) || Math.abs(val + r.truth) <= Math.max(0.03, 0.02 * Math.abs(r.truth))) return;
          const got = K.diagnose(c, d, j, val);
          if (got === 'ok' || got === 'bad') throw new Error(`circuito ${n} rama ${j} ${m}: ${got}`);
        }));
        eq(K.diagnose(c, d, j, NaN), 'bad');
      });
    });
    // Mensajes clave en el preset de dos mallas: valor del otro sentido, batería al revés, malla aislada.
    const c = K.PRESETS[2].c;
    eq(K.diagnose(c, [1, 1, 1], 1, 4 / 3), 'flip');
    eq(K.diagnose(c, [1, 1, 1], 0, 12 / 8), 'isolated');   // malla izquierda sola: 12/(2 + 6)
    eq(K.diagnose(K.PRESETS[0].c, [1, -1], 0, 3), 'emf');   // (12 + 6)/6
    eq(K.diagnose(K.PRESETS[0].c, [1, -1], 0, 2), 'drop');  // 12/6
  });

  test('kirchhoff: circuitos al azar con corrientes razonables y dibujo dentro del lienzo', () => {
    for (let i = 0; i < 300; i++) {
      const c = randomCircuit(), s = K.solve(c);
      s.Iup.forEach((x) => { if (!(Math.abs(x) >= 0.1 && Math.abs(x) <= 12)) throw new Error('corriente ' + x + ' en ' + JSON.stringify(c)); });
      const G = K.geometry(c);
      G.els.forEach((e) => {
        if (e.y - 26 < G.top + 52 || e.y + 26 > G.bot) throw new Error(`${e.id} choca con la flecha o el cable`);
        const w = 13 * String(+e.v.toPrecision(3)).length + 26, x0 = e.side < 0 ? e.lx - w : e.lx;   // «4.5 V» a 22 px
        if (x0 < 2 || x0 + w > G.W - 2) throw new Error(`etiqueta de ${e.id} fuera del lienzo`);
      });
      const ids = K.elements(c).map((e) => e.id);
      eq(new Set(ids).size, ids.length, 'ids únicos');
    }
  });

  // Banco de S13: cada pregunta numérica con `alt` se recalcula por el solver nodal u otra ruta.
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-2/bank/sesion-13.js');
  if (fs.existsSync(bankFile)) {
    test('kirchhoff: el banco de S13 coincide con las rutas alternas (alt)', () => {
      const W = loadData([path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], { LabMath: LM });
      const Q = W.CB_BANK.f2.S13.questions.filter((q) => typeof q.alt === 'function');
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
