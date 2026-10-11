// Problemas de examen de Física 2 (data/fisica-2/exam-problems.js) contra los LabMath de las
// sesiones, por caminos independientes de answer(): superposición vectorial de fuerzas y campos,
// la varilla y el anillo partidos en trozos, la deflexión y la rapidez vertical de efield.plates,
// el trabajo integrado sobre el camino y la rapidez por conservación de la energía.
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

  test('examen f2: 8 problemas del bloque A con las sesiones bien repartidas', () => {
    near(list.length, 8, 0, 'problemas');
    const count = {};
    list.forEach((p) => p.tags.forEach((t) => { count[t] = (count[t] || 0) + 1; }));
    if (!(count['f2.S01'] >= 1)) throw new Error('S01 sin problemas');
    ['f2.S02', 'f2.S03', 'f2.S04', 'f2.S05'].forEach((t) => { if (!(count[t] >= 2)) throw new Error(t + ' tiene ' + (count[t] || 0)); });
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

  test('examen f2: K y las masas coinciden con las de los labs', () => {
    near(LM.coulomb.K, K, 0); near(LM.efield.me, ME, 0); near(LM.potential.M_P, MP, 0); near(LM.potential.E, E, 0);
  });
};
