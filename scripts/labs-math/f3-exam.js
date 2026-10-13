// Problemas de examen de Física 3 (data/fisica-3/exam-problems.js) contra los LabMath de las
// sesiones, por caminos independientes de answer().
'use strict';
const path = require('path');
const { loadData } = require('../lib/load');

module.exports = ({ test, near, LM }) => {
  const W = loadData(path.join(__dirname, '..', '..', 'data', 'fisica-3', 'exam-problems.js'), {});
  const list = (W.CB_EXAMS && W.CB_EXAMS.f3) || [];
  const byId = {};
  list.forEach((p) => { byId[p.id] = p; });
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-30), msg);
  const MU0 = 4 * Math.PI * 1e-7, E = 1.60e-19, ME = 9.11e-31, MP = 1.67e-27;

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
  void rel; void each; void MU0; void E; void ME; void MP;

  /* ══════════════════════ Bloque A ══════════════════════ */
  // Bloque A: brújula con LabMath.magnet.combine (rumbos) y convert; fuerzas con LabMath.lorentz;
  // espectrómetro, selector y ciclotrón con LabMath.orbit; varilla y arco con LabMath.wire; espiras
  // con LabMath.loop (el torque también sumando r × F lado por lado).
  const U = 1.66e-27;
  test('examen f3 brújula: suma de rumbos (magnet.combine) y gauss (magnet.convert)', () => {
    const M = LM.magnet;
    each('f3-ex-brujula', (v, t, at) => {
      const c = M.combine([{ mag: 50, bearing: 0 }, { mag: v.a, bearing: 90 }, { mag: v.b, bearing: 180 }]);
      rel(t[0], c.north, 1e-9, at + ' a'); rel(t[1], c.mag, 1e-9, at + ' b');
      near(t[2], c.bearing, 1e-9, at + ' c'); rel(t[3], M.convert(c.mag, 'uT', 'G'), 1e-9, at + ' d');
    });
  });

  test('examen f3 lorentz: componentes y aceleración con lorentz.force', () => {
    each('f3-ex-lorentz', (v, t, at) => {
      const F = LM.lorentz.force(v.q, [v.vx, v.vy, 0], [0, 0, v.Bz]);
      rel(t[0], F.mag, 1e-9, at + ' a'); rel(t[1], F.x, 1e-9, at + ' b'); rel(t[2], F.y, 1e-9, at + ' c');
      rel(t[3], LM.lorentz.force(v.q * 1e-6, [v.vx * 1e3, v.vy * 1e3, 0], [0, 0, v.Bz]).mag / (v.m * 1e-6), 1e-9, at + ' d');
    });
  });

  test('examen f3 espectrómetro: orbit.spectrometer y medio periodo', () => {
    const O = LM.orbit;
    each('f3-ex-espectro', (v, t, at) => {
      const s = O.spectrometer(v.A * U, E, v.V * 1e3, v.B);
      rel(t[0], s.v / 1e5, 1e-9, at + ' a'); rel(t[1], s.r * 100, 1e-9, at + ' b'); rel(t[2], s.d * 100, 1e-9, at + ' c');
      rel(t[3], O.period(v.A * U, E, v.B) / 2 * 1e6, 1e-9, at + ' d');
      // Oráculo extra: la órbita integrada (Boris) cierra con el radio de b).
      const sim = O.orbit(v.A * U, E, s.v, -v.B, 600), ys = sim.pts.map((p) => p[1]);
      rel((Math.max(...ys) - Math.min(...ys)) / 2 * 100, t[1], 1e-3, at + ' b (Boris)');
    });
  });

  test('examen f3 selector: v = E/B₁ (orbit.selector), evB₁ (lorentz) y la órbita en B₂', () => {
    const O = LM.orbit;
    each('f3-ex-selector', (v, t, at) => {
      const s = O.selector(v.E * 1e3, v.B1);
      rel(t[0], s / 1e3, 1e-9, at + ' a');
      rel(t[1], LM.lorentz.magnitude(E, s, v.B1, 90), 1e-9, at + ' b');
      near(LM.lorentz.lorentz(E, [0, -v.E * 1e3, 0], [s, 0, 0], [0, 0, -v.B1]).mag, 0, 1e-25, at + ' equilibrio');
      rel(t[2], O.radius(MP, E, s, v.B2) * 100, 1e-9, at + ' c'); rel(t[3], O.period(MP, E, v.B2) * 1e9, 1e-9, at + ' d');
    });
  });

  test('examen f3 ciclotrón: orbit.cyclotron (frecuencia, energía, vueltas y tiempo)', () => {
    each('f3-ex-ciclotron', (v, t, at) => {
      const c = LM.orbit.cyclotron(MP, E, v.B, v.R / 100, v.dV * 1e3);
      rel(t[0], c.f / 1e6, 1e-9, at + ' a'); rel(t[1], c.KmaxEV / 1e6, 1e-9, at + ' b');
      rel(t[2], c.turns, 1e-9, at + ' c'); rel(t[3], c.turns * c.T * 1e6, 1e-9, at + ' d');
    });
  });

  test('examen f3 varilla: wire.levitate y la fuerza con wire.force', () => {
    const Wr = LM.wire;
    each('f3-ex-varilla', (v, t, at) => {
      const I = Wr.levitate(v.m / 1000, v.L / 100, v.B), F = Wr.force(2 * I, [v.L / 100, 0, 0], [0, 0, -v.B]);
      rel(t[0], I, 1e-9, at + ' a'); rel(t[1], F.y, 1e-9, at + ' b');
      rel(t[2], (F.y - v.m / 1000 * 9.81) / (v.m / 1000), 1e-9, at + ' c');
    });
  });

  test('examen f3 espira en D: el arco partido en trocitos (wire.bent) y loop.torque', () => {
    each('f3-ex-semicirculo', (v, t, at) => {
      const R = v.R / 100, arc = LM.wire.bent(v.I, LM.wire.semicircle(R, 200), [0, 0, v.B], 5);
      rel(t[0], LM.wire.force(v.I, [2 * R, 0, 0], [0, 0, v.B]).mag, 1e-9, at + ' a');
      rel(t[1], arc.mag, 1e-9, at + ' b');
      const mu = LM.loop.moment(1, v.I, LM.loop.circleArea(R) / 2);
      rel(t[2], mu, 1e-9, at + ' c'); rel(t[3], LM.loop.torque(1, v.I, LM.loop.circleArea(R) / 2, v.B, 90), 1e-9, at + ' d');
    });
  });

  test('examen f3 bobina: θ desde el plano, torque lado por lado (loop.sides) y trabajo (loop.workField)', () => {
    const Lp = LM.loop;
    each('f3-ex-espira', (v, t, at) => {
      const th = Lp.thetaOf({ ref: 'plano', ang: v.al });
      rel(t[0], Lp.moment(v.N, v.I, v.a * v.b * 1e-4), 1e-9, at + ' a'); near(t[1], th, 1e-12, at + ' b');
      rel(t[2], Lp.sides(v.N, v.I, v.a / 100, v.b / 100, v.B, th).tau[1] * 1000, 1e-9, at + ' c');
      rel(t[3], -Lp.workField(v.N, v.I, v.a * v.b * 1e-4, v.B, th, 180) * 1000, 1e-9, at + ' d');
    });
  });

  test('examen f3: e y mₚ coinciden con los de los labs', () => {
    near(LM.orbit.E, E, 0); near(LM.orbit.MP, MP, 0); near(LM.orbit.U, U, 0);
  });

  /* ══════════════════════ fin Bloque A ══════════════════════ */

  /* ══════════════════════ Bloque B ══════════════════════ */
  // Bloque B: el tramo y la bobina con la suma de trozos de Biot–Savart (LabMath.biot.sum); la
  // horquilla con arco y tramos semiinfinitos de biot; los alambres con el campo vectorial y la fuerza
  // de LabMath.parwires; el coaxial con la corriente encerrada de LabMath.ampere; el solenoide con
  // solenoid.ideal, mflux.flux y mflux.coremT; el flujo del alambre con mflux.wireRect y la suma de tiras.
  test('examen f3 tramo: senos con biot.angles y B con la suma de 4000 trozos (biot.sum)', () => {
    const Bs = LM.biot;
    each('f3-ex-tramo', (v, t, at) => {
      const t1 = Math.atan(v.x1 / v.a) * 180 / Math.PI, t2 = Math.atan(v.x2 / v.a) * 180 / Math.PI;
      rel(t[0], Math.sin(t2 * Math.PI / 180), 1e-12, at + ' a'); rel(t[1], Math.sin(t1 * Math.PI / 180), 1e-12, at + ' b');
      rel(t[2], Bs.sum('segment', { a: v.a / 100, x1: v.x1 / 100, x2: v.x2 / 100 }, v.I, 4000).B[2] * 1e6, 1e-6, at + ' c');
      rel(t[3], Bs.angles(v.I, v.a / 100, t1, t2) / Bs.infinite(v.I, v.a / 100), 1e-9, at + ' d');
    });
  });

  test('examen f3 horquilla: arco de π (biot.arc) y dos tramos semiinfinitos (biot.segment)', () => {
    const Bs = LM.biot;
    each('f3-ex-horquilla', (v, t, at) => {
      const R = v.R / 100, arc = Bs.sum('arc', { R: R, phi: 180 }, v.I, 2000).B[2] * 1e6, w = Bs.segment(v.I, R, 0, 1e4 * R) * 1e6;
      rel(t[0], arc, 1e-6, at + ' a'); rel(t[1], w, 1e-6, at + ' b'); rel(t[2], arc + 2 * w, 1e-6, at + ' c');
      near(t[3], Math.atan2(50, Bs.arc(v.I, R, 180) * 1e6 + 2 * w) * 180 / Math.PI, 1e-5, at + ' d');
    });
  });

  test('examen f3 bobina: centro y eje con biot.sum (N veces una espira) y z de 1/8 por bisección', () => {
    const Bs = LM.biot;
    each('f3-ex-bobina', (v, t, at) => {
      const R = v.R / 100, one = (z) => Bs.loopAxis(v.I, R, z);
      rel(t[0], v.N * one(0) * 1e6, 1e-9, at + ' a'); rel(t[1], v.N * one(v.z / 100) * 1e6, 1e-9, at + ' b');
      rel(t[1], v.N * Bs.sum('loop', { R: R, z: v.z / 100 }, v.I, 2000).B[2] * 1e6, 1e-5, at + ' b (trozos)');
      rel(t[2], one(v.z / 100) / one(0), 1e-9, at + ' c');
      let lo = 0, hi = 10 * R;
      for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (Bs.loopAxis(1, R, m) > Bs.loopCenter(1, R) / 8) lo = m; else hi = m; }
      rel(t[3], (lo + hi) / 2 * 100, 1e-9, at + ' d');
    });
  });

  test('examen f3 paralelos: campo vectorial (parwires.field) y fuerza (parwires.force)', () => {
    const P = LM.parwires;
    each('f3-ex-paralelos', (v, t, at) => {
      const w1 = { x: 0, y: 0, I: v.I1 }, w2 = { x: v.d, y: 0, I: -v.I2 };
      rel(t[0], P.field([w1], v.x, 0).mag, 1e-12, at + ' a'); rel(t[1], P.field([w2], v.x, 0).mag, 1e-12, at + ' b');
      rel(t[2], P.field([w1, w2], v.x, 0).mag, 1e-12, at + ' c');
      const F = P.force([w1, w2], 1);
      rel(t[3], F.mag, 1e-12, at + ' d'); rel(t[4], F.mag * v.L / 1000, 1e-12, at + ' e');
      if (!(F.x > 0)) throw new Error(at + ': corrientes opuestas deberían repelerse');
    });
  });

  test('examen f3 esquina: componentes con parwires.field', () => {
    const P = LM.parwires;
    each('f3-ex-esquina', (v, t, at) => {
      const ws = [{ x: 0, y: 0, I: v.I1 }, { x: v.d, y: 0, I: -v.I2 }], B = P.field(ws, 0, v.h);
      rel(t[0], P.field([ws[0]], 0, v.h).mag, 1e-12, at + ' a'); rel(t[1], P.field([ws[1]], 0, v.h).mag, 1e-12, at + ' b');
      near(t[2], B.x, 1e-9 * B.mag, at + ' c'); near(t[3], B.y, 1e-9 * B.mag, at + ' d'); rel(t[4], B.mag, 1e-9, at + ' e');
    });
  });

  test('examen f3 coaxial: corriente encerrada y B con ampere.coax (núcleo, entre y forro)', () => {
    const A = LM.ampere;
    each('f3-ex-coaxial', (v, t, at) => {
      const a = v.a / 1000, b = v.b / 1000, c = (v.b + 1) / 1000;
      rel(t[0] * Math.PI * v.a * v.a, v.I, 1e-12, at + ' a');
      rel(t[1], A.coaxEnc(v.I, a, b, c, a / 2), 1e-12, at + ' b');
      rel(t[2], A.coax(v.I, a, b, c, a / 2) * 1e6, 1e-9, at + ' c');
      rel(t[3], A.coax(v.I, a, b, c, v.r2 / 1000) * 1e6, 1e-9, at + ' d');
      rel(t[4], A.coax(v.I, a, b, c, (v.b + 0.5) / 1000) * 1e6, 1e-9, at + ' e');
    });
  });

  test('examen f3 solenoide: solenoid.ideal, flujo con mflux.flux y núcleo con mflux.coremT', () => {
    each('f3-ex-solenoide', (v, t, at) => {
      const n = v.N / (v.L / 100), B = LM.solenoid.ideal(n, v.I);
      rel(t[0], n, 1e-12, at + ' a'); rel(t[1], B * 1000, 1e-9, at + ' b');
      rel(t[2], LM.mflux.flux(B, Math.PI * Math.pow(v.R / 100, 2), 0) * 1e6, 1e-9, at + ' c');
      rel(t[3], LM.mflux.coremT(v.K, v.N, v.L, v.I), 1e-9, at + ' d');
    });
  });

  test('examen f3 flujo: mflux.wireRect contra la suma de 2000 tiras con el campo de parwires', () => {
    each('f3-ex-flujo', (v, t, at) => {
      const w = [{ x: 0, y: 0, I: v.I }];
      rel(t[0], LM.parwires.field(w, v.a, 0).mag, 1e-12, at + ' a'); rel(t[1], LM.parwires.field(w, v.a + v.w, 0).mag, 1e-12, at + ' b');
      rel(t[2], LM.mflux.wireRect(v.I, v.a / 100, (v.a + v.w) / 100, v.h / 100) * 1e6, 1e-9, at + ' c');
      let s = 0;
      const n = 2000, dr = v.w / n;
      for (let i = 0; i < n; i++) s += LM.parwires.field(w, v.a + (i + 0.5) * dr, 0).mag * 1e-6 * (dr / 100) * (v.h / 100);
      rel(t[2], s * 1e6, 1e-6, at + ' c (tiras)');
      rel(t[4], (t[3] - t[2]) / t[2] * 100, 1e-9, at + ' e');
      if (!(t[4] > 0)) throw new Error(at + ': el promedio de los bordes debería sobreestimar');
    });
  });

  /* ══════════════════════ fin Bloque B ══════════════════════ */

  /* ══════════════════════ Bloque C ══════════════════════ */
  // Bloque C: rieles con faraday.rail (y F·v = I²R); bobina con faraday.flux, avgEmf y chargeThrough;
  // generador con lenz.generator; campo inducido con lenz.regionEmf y lenz.Einduced (y E·2πr = ε);
  // inductor con inductor.ideal, emf y field; el RL con el RK4 de rl (sin exponenciales) y su energía;
  // la descarga con rl.timeTo y el calor integrado por el RK4; la energía del solenoide con menergy.
  test('examen f3 rieles: faraday.rail y el balance F·v = I²R', () => {
    each('f3-ex-rieles', (v, t, at) => {
      const r = LM.faraday.rail(v.B, v.L, v.v, v.R);
      rel(t[0], r.emf, 1e-9, at + ' a'); rel(t[1], r.I, 1e-9, at + ' b');
      rel(t[2], r.F * 1000, 1e-9, at + ' c'); rel(t[3], r.Pe * 1000, 1e-9, at + ' d (I²R)');
    });
  });

  test('examen f3 bobina en rampa: flujo, fem promedio y carga (faraday)', () => {
    const F = LM.faraday;
    each('f3-ex-bobina-rampa', (v, t, at) => {
      const A = Math.PI * Math.pow(v.r / 100, 2), dP = F.flux(v.B2, A, 0) - F.flux(v.B1, A, 0);
      rel(t[0], dP * 1000, 1e-9, at + ' a');
      rel(t[1], F.avgEmf(v.N, dP, v.dt / 1000), 1e-9, at + ' b');
      rel(t[2], F.avgEmf(v.N, dP, v.dt / 1000) / v.R, 1e-9, at + ' c');
      rel(t[3], F.chargeThrough(v.N, dP, v.R) * 1000, 1e-9, at + ' d (NΔΦ/R)');
    });
  });

  test('examen f3 generador: lenz.generator y rpm2omega', () => {
    const Lz = LM.lenz;
    each('f3-ex-generador', (v, t, at) => {
      const w = Lz.rpm2omega(v.rpm), g = Lz.generator(v.N, v.B, Math.pow(v.a / 100, 2), w, v.t / 1000);
      rel(t[0], w, 1e-12, at + ' a'); rel(t[1], g.peak, 1e-9, at + ' b'); rel(t[2], g.emf, 1e-9, at + ' c'); rel(t[3], g.peak / v.R, 1e-9, at + ' d');
    });
  });

  test('examen f3 campo inducido: regionEmf y Einduced (y la circulación E·2πr)', () => {
    const Lz = LM.lenz;
    each('f3-ex-region', (v, t, at) => {
      const R = v.R / 100, r2 = v.r2 / 100, r1 = Math.round(v.f * v.R * 10) / 1000;
      rel(t[0], Lz.regionEmf(r2, R, v.k) * 1000, 1e-9, at + ' a');
      rel(t[1], Lz.Einduced(r2, R, v.k) * 1000, 1e-9, at + ' b');
      rel(t[2], Lz.Einduced(r1, R, v.k) * 1000, 1e-9, at + ' c');
      rel(t[3], Lz.regionEmf(r1, R, v.k) * 1000, 1e-9, at + ' d');
    });
  });

  test('examen f3 inductor: inductor.ideal, emf y field', () => {
    const In = LM.inductor;
    each('f3-ex-inductor', (v, t, at) => {
      const L = In.ideal(v.N, v.r, v.l, 1);
      rel(t[0], L * 1000, 1e-9, at + ' a'); rel(t[1], Math.abs(In.emf(L, v.k)) * 1000, 1e-9, at + ' b');
      rel(t[2], In.field(v.N, v.l, v.I, 1) * 1000, 1e-9, at + ' c'); rel(t[3], v.N * In.field(v.N, v.l, v.I, 1) * In.area(v.r) * 1000, 1e-9, at + ' d (N·B·A)');
    });
  });

  test('examen f3 RL: el RK4 de rl (corriente, V_L y ½LI² sin exponenciales)', () => {
    each('f3-ex-rl', (v, t, at) => {
      const tt = Number((v.m * v.L / v.R).toPrecision(2)), s = LM.rl.rk4('c', v.L, v.R, v.e, tt, 4000);
      rel(t[0], LM.rl.tau(v.L, v.R), 1e-12, at + ' a'); rel(t[1], v.e / v.R, 1e-12, at + ' b');
      rel(t[2], s.I, 1e-8, at + ' c'); rel(t[3], s.VL, 1e-7, at + ' d'); rel(t[4], s.UL, 1e-8, at + ' e');
    });
  });

  test('examen f3 descarga: L del solenoide, t½ por bisección del RK4 y calor integrado', () => {
    each('f3-ex-rl-descarga', (v, t, at) => {
      const L = LM.inductor.ideal(v.N, v.r, v.l, 1) * 1000, T = L / v.R;
      rel(t[0], L, 1e-9, at + ' a'); rel(t[1], T, 1e-9, at + ' b');
      let lo = 0, hi = 5 * T;
      for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (LM.rl.rk4('d', L, v.R, v.I0 * v.R, mid, 600).I > v.I0 / 2) lo = mid; else hi = mid; }
      rel(t[2], (lo + hi) / 2, 1e-7, at + ' c');
      rel(t[3], LM.rl.rk4('d', L, v.R, v.I0 * v.R, 40 * T, 6000).Wr, 1e-7, at + ' d');
    });
  });

  test('examen f3 energía: menergy.solenoid y la integral por capas', () => {
    const En = LM.menergy;
    each('f3-ex-energia', (v, t, at) => {
      const s = En.solenoid(v.N, v.r, v.l, v.I);
      rel(t[0], s.B * 1000, 1e-9, at + ' a'); rel(t[1], s.u, 1e-9, at + ' b');
      rel(t[2], En.integrate('sol', v, 5) * 1000, 1e-9, at + ' c'); rel(t[3], s.L * 1000, 1e-9, at + ' d');
    });
  });

  test('examen f3: μ₀ coincide con el de los labs del bloque C', () => {
    near(LM.inductor.MU0, MU0, 0); near(LM.menergy.MU0, MU0, 0);
  });

  /* ══════════════════════ fin Bloque C ══════════════════════ */
};
