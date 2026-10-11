// Pruebas de LabMath.efield (lab field-lines, Física 2 · S03), con oráculos independientes:
// Coulomb escrito aparte (E = F/q₀), la fórmula cerrada del dipolo en su bisectriz, bisección
// para el punto nulo e integración numérica del movimiento entre placas.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const F = LM.efield;
  const k = 8.99e9;
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const rand = rng(303);
  const pickQ = () => (rand() < 0.5 ? -1 : 1) * (1 + Math.floor(rand() * 5)) * 1e-9;
  const pickX = () => (Math.round((rand() * 20 - 10) * 2) / 2) / 100;
  function randomCharges(n) {
    const cs = [];
    while (cs.length < n) {
      const c = { q: pickQ(), x: pickX(), y: pickX() };
      if (cs.every((d) => Math.hypot(d.x - c.x, d.y - c.y) > 0.01)) cs.push(c);
    }
    return cs;
  }
  // Coulomb vectorial escrito aparte: F = k q q0 (r_P − r_q) / |r_P − r_q|³.
  function coulomb(q0, cs, px, py) {
    let fx = 0, fy = 0;
    for (const c of cs) {
      const rx = px - c.x, ry = py - c.y, r3 = Math.pow(rx * rx + ry * ry, 1.5);
      fx += k * c.q * q0 * rx / r3; fy += k * c.q * q0 * ry / r3;
    }
    return [fx, fy];
  }

  test('efield: E = F/q₀ con Coulomb independiente (300 configuraciones de 1 a 4 cargas)', () => {
    for (let i = 0; i < 300; i++) {
      const cs = randomCharges(1 + (i % 4));
      let px, py;
      do { px = pickX(); py = pickX(); } while (cs.some((c) => Math.hypot(c.x - px, c.y - py) < 0.01));
      const q0 = (1 + Math.floor(rand() * 9)) * 1e-12;
      const f = coulomb(q0, cs, px, py), e = F.field(cs, px, py);
      const s = Math.hypot(f[0], f[1]) / q0;
      near(e.x, f[0] / q0, 1e-9 * s, 'Ex'); near(e.y, f[1] / q0, 1e-9 * s, 'Ey');
      near(e.mag, s, 1e-9 * s, '|E|');
      const fo = F.force(q0, cs, px, py);
      near(fo.x, f[0], 1e-9 * Math.hypot(f[0], f[1]), 'Fx');
      // El ángulo apunta a donde apunta el vector.
      near(Math.cos(e.ang * Math.PI / 180), e.x / e.mag, 1e-9);
    }
  });

  test('efield: carga puntual k|q|/r², hacia afuera si es + y hacia adentro si es −', () => {
    const e = F.field([{ q: 3e-9, x: 0, y: 0 }], 0.05, 0);
    near(e.mag, 8.99e9 * 3e-9 / 0.0025, 1e-6); near(e.ang, 0, 1e-9);
    const n = F.field([{ q: -3e-9, x: 0, y: 0 }], 0.05, 0);
    near(n.ang, 180, 1e-9);
    // Al doble de distancia, la cuarta parte.
    near(F.field([{ q: 3e-9, x: 0, y: 0 }], 0.1, 0).mag, e.mag / 4, 1e-6);
  });

  test('efield: dipolo en su bisectriz (fórmula cerrada 2kqa/(a²+y²)^{3/2}, Ey = 0)', () => {
    for (let i = 0; i < 100; i++) {
      const q = (1 + Math.floor(rand() * 5)) * 1e-9, a = (1 + Math.floor(rand() * 8)) / 100, y = (Math.floor(rand() * 21) - 10) / 100;
      const e = F.field([{ q: q, x: -a, y: 0 }, { q: -q, x: a, y: 0 }], 0, y);
      const want = 2 * k * q * a / Math.pow(a * a + y * y, 1.5);
      near(e.x, want, 1e-9 * want, 'Ex del dipolo');      // apunta de la + (izquierda) a la − (derecha)
      near(e.y, 0, 1e-9 * want, 'Ey del dipolo');
      // Simetría: el mismo campo en y y en −y.
      const m = F.field([{ q: q, x: -a, y: 0 }, { q: -q, x: a, y: 0 }], 0, -y);
      near(m.x, e.x, 1e-9 * want); near(m.y, -e.y, 1e-9 * want);
    }
  });

  test('efield: punto nulo por fórmula cerrada = bisección de Ex sobre el eje', () => {
    const Ex = (cs, x) => F.field(cs, x, 0).x;
    for (let i = 0; i < 400; i++) {
      let q1 = pickQ(), q2 = pickQ();
      if (Math.abs(Math.abs(q1) - Math.abs(q2)) < 1e-15 && q1 * q2 < 0) q2 *= 2;
      const x1 = 0, x2 = (5 + Math.floor(rand() * 40)) / 100;
      const cs = [{ q: q1, x: x1, y: 0 }, { q: q2, x: x2, y: 0 }];
      const x0 = F.nullPoint(q1, x1, q2, x2);
      // Bracket: entre las cargas si tienen el mismo signo; si no, del lado de la menor.
      let lo, hi;
      if (q1 * q2 > 0) { lo = x1 + 1e-9; hi = x2 - 1e-9; }
      else if (Math.abs(q1) < Math.abs(q2)) { lo = x1 - 100; hi = x1 - 1e-9; }
      else { lo = x2 + 1e-9; hi = x2 + 100; }
      const flo = Ex(cs, lo);
      if (flo * Ex(cs, hi) > 0) throw new Error('sin cambio de signo: ' + JSON.stringify(cs));
      for (let j = 0; j < 200; j++) { const m = (lo + hi) / 2; if (Ex(cs, m) * flo > 0) lo = m; else hi = m; }
      near(x0, (lo + hi) / 2, 1e-9, 'punto nulo');
      const scale = k * Math.abs(q1) / Math.pow(Math.abs(x0 - x1), 2);
      near(F.field(cs, x0, 0).mag, 0, 1e-8 * scale, '|E| en el punto nulo');
    }
    eq(F.nullPoint(2e-9, 0, -2e-9, 0.1), null, 'dipolo: sin punto nulo finito');
    near(F.nullPoint(2e-9, 0, 8e-9, 0.3), 0.1, 1e-12, 'ejemplo de la lección');
  });

  test('efield: líneas tangentes a E, salen de + y llegan a −, número ∝ |q|', () => {
    const box = { x0: -10, x1: 10, y0: -6.5, y1: 6.5 };
    const dip = [{ q: 2, x: -3, y: 0 }, { q: -2, x: 3, y: 0 }];
    const ls = F.lines(dip, box, { perUnit: 5 });
    eq(ls.filter((l) => l.from === 0).length, 10, 'dipolo de 2: salen 10 líneas de la +');
    eq(ls.filter((l) => l.to === 1).length, 10, 'dipolo de 2: llegan 10 líneas a la −');
    let ended = 0;
    ls.forEach((l) => {
      if (l.from === 0 && l.to === 1) ended++;
      for (let i = 1; i < l.pts.length; i += 5) {
        const a = l.pts[i - 1], b = l.pts[i], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const u = F.unitDir(dip, m[0], m[1]), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (u && L > 0) { const dot = (u[0] * (b[0] - a[0]) + u[1] * (b[1] - a[1])) / L; if (dot < 0.99) throw new Error('línea no tangente a E: ' + dot); }
      }
    });
    if (ended < 4) throw new Error('pocas líneas llegan a la negativa: ' + ended);
    // Carga negativa más grande: las líneas que sobran llegan desde afuera.
    const big = F.lines([{ q: 1, x: -3, y: 0 }, { q: -3, x: 3, y: 0 }], box, { perUnit: 5 });
    const toNeg = big.filter((l) => l.to === 1).length;
    eq(toNeg, 15, 'a la de −3 llegan 15 líneas');
    eq(big.filter((l) => l.from === 0).length, 5, 'de la de +1 salen 5');
    // Solo negativas: se trazan hacia atrás y terminan en ellas.
    const neg = F.lines([{ q: -2, x: 0, y: 0 }], box, { perUnit: 5 });
    eq(neg.length, 10); neg.forEach((l) => eq(l.to, 0));
    neg.forEach((l) => { const p = l.pts[l.pts.length - 1]; if (Math.hypot(p[0], p[1]) > 0.6) throw new Error('la línea no termina en la carga'); });
  });

  test('efield: placas contra integración numérica del movimiento (F = qE)', () => {
    for (const m of [F.me, F.mp]) {
      for (let i = 0; i < 40; i++) {
        const p = { q: m === F.me ? -F.e : F.e, m: m, E: (1 + Math.floor(rand() * 10)) * 500, v0: (2 + Math.floor(rand() * 13) * 0.5) * 1e6, L: (2 + Math.floor(rand() * 7)) / 100 };
        const r = F.plates(p);
        // Euler semi-implícito con paso fino hasta x = L.
        const n = 20000, dt = p.L / p.v0 / n, ay = Math.abs(p.q) * p.E / p.m;
        let y = 0, vy = 0;
        for (let j = 0; j < n; j++) { y += vy * dt + 0.5 * ay * dt * dt; vy += ay * dt; }
        near(r.y, y, 1e-9 * y, 'deflexión'); near(r.vy, vy, 1e-9 * vy, 'vy');
        near(r.a, ay, 1e-9 * ay);
        eq(r.towardPlus, p.q < 0, 'negativa hacia la placa +');
        const pos = F.platePos(p, r.t); near(pos.x, p.L, 1e-12); near(pos.y, r.y, 1e-12 * r.y + 1e-18);
      }
    }
    // Ejemplo de la lección: E = 1.0e3 N/C, v0 = 3.0e6 m/s, L = 4.0 cm.
    const ex = F.plates({ q: -1.6e-19, m: 9.11e-31, E: 1e3, v0: 3e6, L: 0.04 });
    near(ex.a, 1.6e-19 * 1e3 / 9.11e-31, 1);
    near(ex.y, 0.5 * ex.a * Math.pow(0.04 / 3e6, 2), 1e-12);
    eq(F.hitTime({ q: -1.6e-19, m: 9.11e-31, E: 1e3, v0: 3e6, L: 0.04 }, 0.02), Infinity, 'sale sin chocar');
    if (!isFinite(F.hitTime({ q: -1.6e-19, m: 9.11e-31, E: 5e3, v0: 2e6, L: 0.08 }, 0.02))) throw new Error('debería chocar');
  });

  test('efield: diagnóstico de errores típicos (cargas y placas)', () => {
    const cs = [{ q: 4e-9, x: -0.03, y: 0 }, { q: -1e-9, x: 0.03, y: 0 }], px = 0.03, py = 0.04;
    const e = F.field(cs, px, py), m = F.mistakes(cs, px, py);
    eq(F.diagnose(cs, px, py, { x: e.x, y: e.y }), 'ok');
    ['cm', 'noSquare', 'noSign', 'reversed', 'signX', 'signY'].forEach((key) => eq(F.diagnose(cs, px, py, m[key]), key, key));
    const s = m.addMags / e.mag;
    eq(F.diagnose(cs, px, py, { x: e.x * s, y: e.y * s }), 'addMags');
    eq(F.diagnose(cs, px, py, { x: e.mag, y: 0 }), 'magOk');
    eq(F.diagnose(cs, px, py, { x: 3 * e.x, y: 3 * e.y }), 'dirOk');
    eq(F.diagnose(cs, px, py, { x: NaN, y: 1 }), 'bad');
    const p = { q: -F.e, m: F.me, E: 1e3, v0: 3e6, L: 0.04 }, r = F.plates(p), pm = F.platesMistakes(p);
    eq(F.diagnosePlates(p, r.y, true), 'ok'); eq(F.diagnosePlates(p, r.y, false), 'side');
    eq(F.diagnosePlates(p, pm.noHalf, true), 'noHalf'); eq(F.diagnosePlates(p, pm.noSquare, true), 'noSquare');
    eq(F.diagnosePlates(p, pm.otherMass, true), 'otherMass'); eq(F.diagnosePlates(p, r.y * 1000, true), 'units');
  });

  // Banco de S03: las respuestas numéricas, recalculadas con LabMath (camino distinto al del banco).
  test('efield: respuestas del banco f2 S03 contra LabMath', () => {
    const ROOT = path.join(__dirname, '..', '..');
    const bankFile = path.join(ROOT, 'data/fisica-2/bank/sesion-03.js');
    if (!fs.existsSync(bankFile)) return;
    const { loadData } = require('../lib/load');
    const W = loadData([path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
    const Q = W.CB_BANK.f2.S03.questions;
    const checks = bankOracles(F);
    let n = 0;
    for (const q of Q) {
      const fn = checks[q.id];
      if (!fn) continue;
      for (let i = 0; i < 60; i++) {
        const v = W.CBExercises.instance(q, rand);
        const want = fn(v), got = q.answer(v);
        if (!(Math.abs(got - want) <= 1e-9 * Math.max(1e-30, Math.abs(want)))) throw new Error(`${q.id} ${JSON.stringify(v)}: banco ${got} y LabMath ${want}`);
      }
      n++;
    }
    if (n < 30) throw new Error('solo ' + n + ' preguntas con oráculo');
  });
};

// Oráculos del banco: cada respuesta numérica recalculada solo con LabMath.efield
// (campos por superposición vectorial, punto nulo, movimiento entre placas).
function bankOracles(F) {
  const nC = 1e-9, cm = 0.01;
  const Q = (q, x, y) => ({ q, x, y });
  const mag = (cs, x, y) => F.field(cs, x, y).mag;
  const elec = (E, v0, L) => F.plates({ q: -F.e, m: F.me, E, v0, L });
  const prot = (E, v0, L) => F.plates({ q: F.e, m: F.mp, E, v0, L });
  const perp = (v) => [Q(v.a * nC, 0, 0), Q((v.s ? 1 : -1) * v.b * nC, v.d * cm, 0)];
  // E en P por unidad de carga fuente (para despejar q o r de un valor de campo).
  const unit = (r) => mag([Q(1, 0, 0)], r, 0);
  const o = {
    'd-alfa': (v) => F.force(2 * F.e, [Q(1, 0, 0)], 1, 0).mag / unit(1) * v.E * 1e5,
    'd-Fneg': (v) => F.force(-v.q * nC, [Q(v.E * 100 / unit(1), 0, 0)], 1, 0).x * 1e6,
    'd-Edea': (v) => v.a * 1e10 / F.plates({ q: F.e, m: F.mp, E: 1, v0: 1, L: 1 }).a,
    'd-gravedad': (v) => elec(v.E * 100, 1, 1).a / 9.81,
    'p-E': (v) => mag([Q(v.q * nC, 0, 0)], v.r * cm, 0),
    'p-Emicro': (v) => mag([Q(v.q * 1e-6, 0, 0)], v.r, 0),
    'p-r': (v) => {                                         // bisección sobre |E|(r)
      let lo = 1e-4, hi = 10;
      for (let i = 0; i < 200; i++) { const m = Math.sqrt(lo * hi); if (mag([Q(v.q * nC, 0, 0)], m, 0) > v.E * 1e3) lo = m; else hi = m; }
      return Math.sqrt(lo * hi) * 100;
    },
    'p-q': (v) => v.E * 1e4 / mag([Q(nC, 0, 0)], v.r * cm, 0),
    'p-Ex': (v) => F.field([Q(v.q * nC, 0, 0)], v.x * cm, v.y * cm).x,
    'p-Ey': (v) => F.field([Q(-v.q * nC, 0, 0)], v.x * cm, v.y * cm).y,
    'p-bohr': (v) => mag([Q(F.e, 0, 0)], v.r * 1e-11, 0),
    'p-ang': (v) => F.field([Q((v.s ? 3 : -3) * nC, v.a * cm, v.b * cm)], 0, 0).ang,
    'p-Fe': (v) => F.force(-F.e, [Q(v.q * nC, 0, 0)], v.r * cm, 0).mag,
    'p-factor': (v) => v.E0 * 100 * mag([Q(1, 0, 0)], v.n, 0) / unit(1),
    'p-dosr': (v) => v.E1 * 100 * unit(v.r2) / unit(v.r1),
    's-colineal': (v) => F.field([Q(v.q1 * nC, 0, 0), Q(v.q2 * nC, v.d * cm, 0)], (v.d + v.c) * cm, 0).x,
    's-medio': (v) => mag([Q(v.q1 * nC, 0, 0), Q(v.q2 * nC, v.d * cm, 0)], v.d * cm / 2, 0),
    's-medio-op': (v) => mag([Q(v.q1 * nC, 0, 0), Q(-v.q2 * nC, v.d * cm, 0)], v.d * cm / 2, 0),
    's-perp-mag': (v) => mag(perp(v), 0, v.h * cm),
    's-perp-ex': (v) => F.field(perp(v), 0, v.h * cm).x,
    's-perp-ey': (v) => F.field(perp(v), 0, v.h * cm).y,
    's-perp-ang': (v) => F.field(perp(v), 0, v.h * cm).ang,
    's-dipolo': (v) => mag([Q(v.q * nC, -v.a * cm, 0), Q(-v.q * nC, v.a * cm, 0)], 0, v.y * cm),
    's-iguales': (v) => mag([Q(v.q * nC, -v.a * cm, 0), Q(v.q * nC, v.a * cm, 0)], 0, v.y * cm),
    's-tres': (v) => mag([Q(v.q * nC, 0, 0), Q(v.q * nC, v.a * cm, 0), Q(v.q * nC, 0, v.a * cm)], v.a * cm, v.a * cm),
    's-fuera-op': (v) => F.field([Q(v.q1 * nC, 0, 0), Q(-v.q2 * nC, v.d * cm, 0)], (v.d + v.c) * cm, 0).x,
    's-fuerza': (v) => F.force(2e-9, perp(v), 0, v.h * cm).mag * 1e6,
    'n-mismo': (v) => F.nullPoint(v.a, 0, v.b, v.d),
    'n-opuesto': (v) => F.nullPoint(v.a, 0, -v.b, v.d),
    'n-iguales': (v) => F.nullPoint(1, 0, 1, v.d),
    'n-razon': (v) => mag([Q(1, 0, 0)], v.x, 0) / mag([Q(1, v.d, 0)], v.x, 0),
    'n-dist2': (v) => v.d - F.nullPoint(v.a, 0, v.b, v.d),
    'n-micro': (v) => F.nullPoint(v.a * 1e-6, 0, v.b * 1e-6, v.d),
    'n-fuera': (v) => { const x = F.nullPoint(v.a, 0, -v.b, v.d); return v.a < v.b ? -x : x - v.d; },
    'n-cada': (v) => mag([Q(v.a * nC, 0, 0)], F.nullPoint(v.a, 0, 4 * v.a, v.d) * cm, 0),
    'u-F': (v) => F.plates({ q: -F.e, m: F.me, E: v.E * 1e4, v0: 1, L: 1 }).F,
    'u-a': (v) => elec(v.E * 100, 1, 1).a,
    'u-ap': (v) => prot(v.E * 1e3, 1, 1).a,
    'u-t': (v) => elec(1, v.v0 * 1e6, v.L * cm).t * 1e9,
    'u-y': (v) => elec(v.E * 1e3, v.v0 * 1e6, v.L * cm).mm,
    'u-vy': (v) => elec(v.E * 1e3, v.v0 * 1e6, v.L * cm).vy,
    'u-ang': (v) => elec(v.E * 1e3, v.v0 * 1e6, v.L * cm).ang,
    'u-Enec': (v) => v.y / elec(1, v.v0 * 1e6, v.L * cm).mm,
    'u-reposo-v': (v) => Math.sqrt(2 * elec(v.E * 100, 1, 1).a * v.d * cm),
    'u-reposo-t': (v) => Math.sqrt(2 * v.d * cm / prot(v.E * 1e3, 1, 1).a) * 1e6,
    'u-yp': (v) => prot(v.E * 100, v.v0 * 1e5, v.L * cm).mm,
    'u-Lmax': (v) => { const a = elec(v.E * 1e3, 1, 1).a; return F.platePos({ q: -F.e, m: F.me, E: v.E * 1e3, v0: v.v0 * 1e6 }, Math.sqrt(2 * 0.01 / a)).x * 100; }
  };
  const out = {};
  Object.keys(o).forEach((k) => { out['f2-s03-' + k] = o[k]; });
  return out;
}
