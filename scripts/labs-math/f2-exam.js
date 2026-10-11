// Problemas de examen de Física 2 (data/fisica-2/exam-problems.js) contra los LabMath de las
// sesiones, por caminos independientes de answer(): superposición vectorial de fuerzas y campos,
// la varilla y el anillo partidos en trozos, la deflexión y la rapidez vertical de efield.plates,
// el trabajo integrado sobre el camino y la rapidez por conservación de la energía. Bloque B: el disco
// como suma de anillos, −∇V numérico, flujos por cuadratura cara por cara, q_enc por volumen numérico,
// C por la cadena Q → E → ∫E·dl y la red resuelta con potenciales de nodo.
'use strict';
const path = require('path');
const { loadData } = require('../lib/load');

module.exports = ({ test, near, LM }) => {
  const W = loadData(path.join(__dirname, '..', '..', 'data', 'fisica-2', 'exam-problems.js'), {});
  const list = (W.CB_EXAMS && W.CB_EXAMS.f2) || [];
  const byId = {};
  list.forEach((p) => { byId[p.id] = p; });
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-30), msg);
  const K = 8.99e9, E = 1.60e-19, ME = 9.11e-31, MP = 1.67e-27;

  // Instancias reproducibles (mismo muestreo que CBExercises.instance) y la cadena real de respuestas.
  function instances(p, n) {
    let seed = 13;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const out = [];
    for (let tries = 0; out.length < n && tries < n * 200; tries++) {
      const v = {};
      Object.keys(p.vars).forEach((key) => {
        const [a, b, st = 1] = p.vars[key], m = Math.round((b - a) / st);
        v[key] = +(a + st * Math.floor(rnd() * (m + 1))).toFixed(6);
      });
      if (!p.where || p.where(v)) out.push(v);
    }
    return out;
  }
  function chain(p, v) { const t = []; p.parts.forEach((part) => t.push(part.answer(v, t.slice()))); return t; }
  function each(id, fn) {
    const p = byId[id];
    if (!p) throw new Error('no existe ' + id);
    instances(p, 60).forEach((v) => fn(v, chain(p, v), JSON.stringify(v)));
  }

  test('examen f2: 8 problemas por bloque (A y B) con las sesiones bien repartidas', () => {
    const A = list.filter((p) => p.block === 'A'), B = list.filter((p) => p.block === 'B');
    near(A.length, 8, 0, 'problemas del bloque A');
    near(B.length, 8, 0, 'problemas del bloque B');
    const count = {};
    list.forEach((p) => p.tags.forEach((t) => { count[t] = (count[t] || 0) + 1; }));
    if (!(count['f2.S01'] >= 1)) throw new Error('S01 sin problemas');
    ['f2.S02', 'f2.S03', 'f2.S04', 'f2.S05', 'f2.S06', 'f2.S07', 'f2.S08', 'f2.S09', 'f2.S10'].forEach((t) => { if (!(count[t] >= 2)) throw new Error(t + ' tiene ' + (count[t] || 0)); });
    // La sesión principal (la primera etiqueta) de cada problema B es de S06–S10.
    B.forEach((p) => { if (!/^f2\.S(0[6-9]|10)$/.test(p.tags[0])) throw new Error(p.id + ' empieza con ' + p.tags[0]); });
  });

  test('examen f2 esferas: contacto (induction) y Coulomb (coulomb.magnitude)', () => {
    const I = LM.induction, C = LM.coulomb;
    each('f2-ex-esferas', (v, t, at) => {
      const Q = I.contact(v.q1 * 1e-6, v.q2 * 1e-6);
      rel(t[0] * 1e-6, Q, 1e-9, at + ' a');
      rel(t[1], I.count(v.q1 * 1e-6 - Q), 1e-9, at + ' b');
      rel(t[2], C.magnitude(Q, Q, v.d / 100), 1e-9, at + ' c');
      rel(t[3], C.magnitude(Q, Q, 1) / C.magnitude(v.q1 * 1e-6, v.q2 * 1e-6, 1), 1e-9, at + ' d');
    });
  });

  test('examen f2 triángulo: fuerza neta por superposición vectorial (coulomb.net)', () => {
    const C = LM.coulomb;
    each('f2-ex-triangulo', (v, t, at) => {
      const ch = [{ q: v.a * 1e-6, x: 0, y: 0 }, { q: (v.s2 ? 1 : -1) * v.b * 1e-6, x: v.dx / 100, y: 0 }, { q: (v.s3 ? 1 : -1) * v.c * 1e-6, x: 0, y: v.dy / 100 }];
      const n = C.net(ch, 0);
      rel(t[0], Math.hypot(n.parts[0].x, n.parts[0].y), 1e-9, at + ' a');
      rel(t[1], Math.hypot(n.parts[1].x, n.parts[1].y), 1e-9, at + ' b');
      rel(t[2], n.mag, 1e-9, at + ' c');
      near(C.angDiff(t[3], n.ang), 0, 1e-6, at + ' d');
    });
  });

  test('examen f2 recta: campo neto con signo (efield.field) y fuerza sobre −c nC (efield.force)', () => {
    const F = LM.efield;
    each('f2-ex-campo-recta', (v, t, at) => {
      const ch = [{ q: v.a * 1e-9, x: 0, y: 0 }, { q: (v.s ? 1 : -1) * v.b * 1e-9, x: v.d / 100, y: 0 }], P = v.p / 100;
      rel(t[0] * 1e3, F.field([ch[0]], P, 0).mag, 1e-9, at + ' a');
      rel(t[1] * 1e3, F.field([ch[1]], P, 0).mag, 1e-9, at + ' b');
      rel(t[2] * 1e3, F.field(ch, P, 0).x, 1e-9, at + ' c');
      rel(t[3] * 1e-6, F.force(-v.c * 1e-9, ch, P, 0).mag, 1e-9, at + ' d');
    });
  });

  test('examen f2 placas: efield.plates y la energía como ½mₑv_y² (no como eEy)', () => {
    const F = LM.efield;
    each('f2-ex-placas', (v, t, at) => {
      const r = F.plates({ q: -E, m: ME, E: v.E * 1e3, v0: v.v0 * 1e6, L: v.L / 100 });
      rel(t[0], r.a, 1e-9, at + ' a');
      rel(t[1] * 1e-9, r.t, 1e-9, at + ' b');
      rel(t[2], r.mm, 1e-9, at + ' c');
      rel(t[3], LM.potential.toEV(0.5 * ME * r.vy * r.vy), 1e-9, at + ' d');
      if (!(r.y < 0.01)) throw new Error(at + ' choca con la placa');
    });
  });

  test('examen f2 varilla: suma de 4000 trozos (chargeIntegral.discrete) y el límite puntual', () => {
    const CI = LM.chargeIntegral;
    each('f2-ex-varilla', (v, t, at) => {
      const g = { L: v.L / 100, Q: v.Q * 1e-9, d: v.d / 100 };
      rel(t[0] * 1e-9 * g.L, g.Q, 1e-9, at + ' a');
      const Ed = CI.discrete('rod-axis', g, 4000).along;
      rel(t[1] * 1e3, Ed, 1e-5, at + ' b');
      rel(t[2] * 1e-6, v.c * 1e-9 * Ed, 1e-5, at + ' c');
      rel(t[3], Ed / CI.point(g.Q, g.d + g.L / 2), 1e-5, at + ' d');
    });
  });

  test('examen f2 anillo: 96 trozos (chargeIntegral.discrete) y a = qE/m', () => {
    const CI = LM.chargeIntegral;
    each('f2-ex-anillo', (v, t, at) => {
      const g = { R: v.R / 100, Q: v.Q * 1e-9, z: v.z / 100 }, d = CI.discrete('ring', g, 96);
      rel(t[0], Math.hypot(v.R, v.z), 1e-9, at + ' a');
      rel(t[1] * 1e3, d.along, 1e-6, at + ' b');
      near(d.perp, 0, 1e-6 * d.along, at + ' simetría');
      rel(t[3], v.c * 1e-9 * d.along / (v.m * 1e-6), 1e-6, at + ' d');
    });
  });

  test('examen f2 trabajo: potencial.V, campo y trabajo integrado sobre el camino (workPath)', () => {
    const P = LM.potential;
    each('f2-ex-trabajo', (v, t, at) => {
      const ch = [{ q: v.a * 1e-9, x: 0, y: 0 }], q = (v.s ? 1 : -1) * v.b * 1e-9, A = { x: v.rA / 100, y: 0 }, B = { x: v.rB / 100, y: 0 };
      const f = P.force(ch, q, A.x, A.y), e = P.field(ch, A.x, A.y);
      rel(t[0] * 1e-6, Math.hypot(f.x, f.y), 1e-9, at + ' a');
      rel(t[1] * 1e3, Math.hypot(e.x, e.y), 1e-9, at + ' b');
      rel(t[2] * 1e3, P.V(ch, A.x, A.y), 1e-9, at + ' c');
      rel(t[3] * 1e3, P.V(ch, B.x, B.y), 1e-9, at + ' d');
      // Camino en L (sube 3 cm, avanza y baja): no pasa por Q y da el mismo trabajo.
      const W = P.workPath(ch, q, [A, { x: A.x, y: 0.03 }, { x: B.x, y: 0.03 }, B]);
      rel(t[4] * 1e-6, W, 1e-6, at + ' e');
    });
  });

  test('examen f2 protón: energía en keV y J, y rapidez por conservación (potential.speed)', () => {
    const P = LM.potential;
    each('f2-ex-proton', (v, t, at) => {
      const ch = [{ q: v.Q * 1e-9, x: 0, y: 0 }], VA = P.V(ch, v.rA / 100, 0), VB = P.V(ch, v.rB / 100, 0);
      rel(t[0] * 1e3, VA, 1e-9, at + ' a');
      rel(t[1] * 1e3, VB, 1e-9, at + ' b');
      rel(t[2] * 1e3, P.toEV(P.workAB(ch, E, { x: v.rA / 100, y: 0 }, { x: v.rB / 100, y: 0 })), 1e-9, at + ' c');
      rel(t[3], E * (VA - VB), 1e-9, at + ' d');
      rel(t[4], P.speed(E, MP, VB - VA, 0), 1e-9, at + ' e');
    });
  });

  /* ---------------- Bloque B ---------------- */
  const EPS0 = 8.85e-12;

  test('examen f2 disco: V como suma de 600 anillos (equipotential.points) y E_z sumando Coulomb', () => {
    const EQ = LM.equipotential;
    each('f2-ex-disco', (v, t, at) => {
      const g = { R: v.R / 100, Q: v.Q * 1e-9, z: v.z / 100 };
      rel(t[0] * 1e-6 * Math.PI * g.R * g.R, g.Q, 1e-9, at + ' a');
      rel(t[1] * 1e3, EQ.discreteV('disk', g, 600, 4), 1e-4, at + ' b');
      let Ez = 0;
      EQ.points('disk', g, 600, 4).forEach((c) => { const r = Math.hypot(c[0], c[1], g.z); Ez += K * c[3] * g.z / (r * r * r); });
      rel(t[2] * 1e3, Ez, 1e-4, at + ' c');
      // E = −dV/dz con diferencias centradas sobre la suma discreta.
      const h = 1e-4 * g.z, Vz = (z) => EQ.discreteV('disk', Object.assign({}, g, { z }), 600, 4);
      rel(t[2] * 1e3, -(Vz(g.z + h) - Vz(g.z - h)) / (2 * h), 1e-4, at + ' c por −dV/dz');
      rel(t[3] * 1e-6, v.c * 1e-9 * EQ.discreteV('disk', g, 600, 4), 1e-4, at + ' d');
    });
  });

  test('examen f2 gradiente: −∇V numérico (equipotential.gradient) y E ⟂ equipotencial', () => {
    const EQ = LM.equipotential;
    each('f2-ex-gradiente', (v, t, at) => {
      const f = (x, y) => v.A * x * x * y + v.B * y, e = EQ.fieldFromV(f, v.x, v.y, 1e-5);
      rel(t[0], e.y, 1e-7, at + ' a');
      rel(t[1], e.x, 1e-7, at + ' b');
      rel(t[2], e.mag, 1e-7, at + ' c');
      rel(t[3] * 1e-6, v.q * 1e-6 * e.mag, 1e-7, at + ' d');
      // La tangente a la equipotencial y = V₀/(Ax² + B) es perpendicular a E.
      const V0 = f(v.x, v.y), yy = (x) => V0 / (v.A * x * x + v.B), dydx = (yy(v.x + 1e-6) - yy(v.x - 1e-6)) / 2e-6;
      near((e.x + e.y * dydx) / (e.mag * Math.hypot(1, dydx)), 0, 1e-6, at + ' perpendicular');
    });
  });

  test('examen f2 cubo: flujo por cuadratura en cada cara (flux.quad) y q = ε₀Φ (gaussSurface)', () => {
    const F = LM.flux, G = LM.gaussSurface;
    each('f2-ex-cubo', (v, t, at) => {
      const a = v.a / 100, x0 = v.x0 / 100, Efn = (x) => [v.c * 1e3 * (x + x0), 0, 0];
      const per = {}; let tot = 0;
      F.faces('cube', { a }).forEach((fc) => { per[fc.id] = F.quad(Efn, fc, 8); tot += per[fc.id]; });
      rel(t[0], per.xa, 1e-9, at + ' a');
      rel(t[1], per.x0, 1e-9, at + ' b');
      rel(t[2], tot, 1e-9, at + ' c');
      rel(t[3] * 1e-12, G.chargeFromFlux(tot), 1e-9, at + ' d');
    });
  });

  test('examen f2 prisma: caras del prisma (flux.closed), ángulo con la normal y total cero', () => {
    const F = LM.flux;
    each('f2-ex-prisma', (v, t, at) => {
      const al = v.al * Math.PI / 180, E = [v.E * Math.cos(al), 0, v.E * Math.sin(al)];
      const r = F.closed('prism', E, { b: v.b / 100, h: v.h / 100, w: v.w / 100 }), fc = {};
      r.faces.forEach((x) => { fc[x.id] = x; });
      rel(t[0] * 1e-4, fc.inclinada.A, 1e-9, at + ' a');
      near(t[1], F.angleBetween(E, fc.inclinada.n), 1e-9, at + ' b');
      rel(t[2], fc.inclinada.flux, 1e-9, at + ' c');
      rel(t[3], fc.base.flux, 1e-9, at + ' d');
      rel(t[4], fc.pared.flux, 1e-9, at + ' e');
      near(r.total, 0, 1e-9 * v.E, at + ' total');
    });
  });

  test('examen f2 esfera sólida: q_enc por volumen numérico, flujo por cuadratura y V = ∫E dr', () => {
    const G = LM.gaussSurface, CAP = LM.capacitor;
    each('f2-ex-esfera-solida', (v, t, at) => {
      const p = { Q: v.Q * 1e-9, R: v.R / 100 }, S = G.surface('solid', 'sphere', v.r / 100, 0);
      rel(t[0] * 1e-9, G.qEncNum('solid', p, S), 1e-5, at + ' a');
      const fl = G.flux('solid', p, S).flux;
      rel(t[1], fl, 1e-6, at + ' b');
      rel(t[2] * 1e3, fl / (4 * Math.PI * Math.pow(v.r / 100, 2)), 1e-6, at + ' c');
      rel(t[3] * 1e3, G.E('solid', p, p.R), 1e-9, at + ' d');
      rel(t[4] * 1e3, CAP.Vint('isolated', { R: p.R }, p.Q), 1e-6, at + ' e');
    });
  });

  test('examen f2 capacitor: C por Q → E → ∫E·dl (capacitor.fromIntegral), Q, E = V/d y κ con batería', () => {
    const CAP = LM.capacitor;
    each('f2-ex-capacitor', (v, t, at) => {
      const p = { A: v.A * 1e-4, d: v.d * 1e-3 };
      rel(t[0], CAP.fromIntegral('plates', p, 1e12), 1e-9, at + ' a');
      rel(t[1], CAP.charge('plates', p, v.V, 1e9), 1e-9, at + ' b');
      rel(t[2] * 1e3, v.V / p.d, 1e-9, at + ' c');
      const ch = CAP.platesChange(p.A, p.d, 1, v.V, 'V', null, null, v.kap);
      rel(t[3] * 1e-9, ch.U0, 1e-9, at + ' d');
      rel(t[4] * 1e-9, ch.Q, 1e-9, at + ' e');
    });
  });

  test('examen f2 coaxial: C integrando E (capacitor.fromIntegral) y E por flujo en un cilindro gaussiano', () => {
    const CAP = LM.capacitor, G = LM.gaussSurface;
    each('f2-ex-coaxial', (v, t, at) => {
      const p = { a: v.a * 1e-3, b: v.b * 1e-3, L: v.L };
      rel(t[0], CAP.fromIntegral('cylinder', Object.assign({}, p, { L: 1 }), 1e12), 1e-8, at + ' a');
      rel(t[1], CAP.fromIntegral('cylinder', p, 1e9), 1e-8, at + ' b');
      const Q = CAP.charge('cylinder', p, v.V);
      rel(t[2] * 1e-9, Q, 1e-8, at + ' c');
      const r = v.r * 1e-3, fl = G.flux('line', { lam: Q / p.L }, G.surface('line', 'cylinder', r, 0)).flux;
      rel(t[3] * 1e3, fl / (2 * Math.PI * r * 2 * r), 1e-6, at + ' d');
    });
  });

  test('examen f2 red: potenciales de nodo (capnet.nodal) y conservación de la carga', () => {
    const CN = LM.capnet;
    each('f2-ex-red', (v, t, at) => {
      const tree = CN.S(CN.leaf('C1', v.C1), CN.P(CN.leaf('C2', v.C2), CN.leaf('C3', v.C3)));
      const g = CN.graph(tree), pot = CN.nodal({ nodes: g.nodes, branches: g.branches, fixed: { a: v.V, b: 0 } });
      const br = {};
      g.branches.forEach((b) => { br[b.id] = { V: Math.abs(pot[b.a] - pot[b.b]), Q: b.value * Math.abs(pot[b.a] - pot[b.b]) }; });
      rel(t[0], (br.C2.Q + br.C3.Q) / br.C2.V, 1e-9, at + ' a');
      rel(t[1], br.C1.Q / v.V, 1e-9, at + ' b');
      rel(t[2], br.C1.Q, 1e-9, at + ' c');
      rel(t[3], br.C2.V, 1e-9, at + ' d');
      rel(t[4], 0.5 * v.C2 * br.C2.V * br.C2.V, 1e-9, at + ' e');
      rel(br.C2.Q + br.C3.Q, br.C1.Q, 1e-9, at + ' nodo aislado neutro');
    });
  });

  test('examen f2: K y las masas coinciden con las de los labs', () => {
    near(LM.capacitor.EPS0 || EPS0, EPS0, 0);
    near(LM.coulomb.K, K, 0); near(LM.efield.me, ME, 0); near(LM.potential.M_P, MP, 0); near(LM.potential.E, E, 0);
  });
};
