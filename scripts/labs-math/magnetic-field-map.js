// Pruebas de LabMath.magnet (lab magnetic-field-map, Física 3 · S01), con oráculos independientes:
// el campo dipolar lejano escrito aparte, las fórmulas cerradas del eje y de la mediatriz,
// simetrías, las unidades por una tabla propia y el trazado de líneas (tangente al campo y
// de N a S). También revisa las respuestas numéricas del banco f3 S01 contra LabMath.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM }) => {
  const M = LM.magnet;
  const B0 = 1, R0 = 2, h = 3;                       // 1 mT a 2 cm de un polo s = 1; semilongitud 3 cm
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const rand = rng(515);
  const between = (a, b) => a + (b - a) * rand();
  const hyp = Math.hypot;

  test('magnet: un polo suelto es s·B₀·(R₀/r)², saliendo de N y entrando a S', () => {
    for (let i = 0; i < 200; i++) {
      const s = 1 + Math.floor(rand() * 4), r = between(1, 20), a = between(0, 2 * Math.PI);
      const x = r * Math.cos(a), y = r * Math.sin(a);
      const n = M.poleField(1, s, 0, 0, x, y), m = M.poleField(-1, s, 0, 0, x, y);
      near(hyp(n.x, n.y), s * B0 * R0 * R0 / (r * r), 1e-9 * s * B0 * R0 * R0 / (r * r));
      near(n.x * Math.cos(a) + n.y * Math.sin(a), hyp(n.x, n.y), 1e-9, 'N sale');
      near(m.x + n.x, 0, 1e-12); near(m.y + n.y, 0, 1e-12);
    }
  });

  // Oráculo: dipolo ideal (3(m·r̂)r̂ − m)/r³ con momento m = s·B₀·R₀²·2h, para r ≫ h.
  test('magnet: lejos del imán el campo es el de un dipolo (1 %)', () => {
    for (let i = 0; i < 200; i++) {
      const s = 1 + Math.floor(rand() * 4), ang = between(0, 360), r = between(60, 200), a = between(0, 2 * Math.PI);
      const mx = { x: 0, y: 0, ang, s }, x = r * Math.cos(a), y = r * Math.sin(a);
      const mom = s * B0 * R0 * R0 * 2 * h, ux = Math.cos(ang * Math.PI / 180), uy = Math.sin(ang * Math.PI / 180);
      const rx = x / r, ry = y / r, dot = ux * rx + uy * ry;
      const dx = mom * (3 * dot * rx - ux) / (r * r * r), dy = mom * (3 * dot * ry - uy) / (r * r * r);
      const f = M.field([mx], x, y);
      near(f.x, dx, 0.01 * hyp(dx, dy)); near(f.y, dy, 0.01 * hyp(dx, dy));
    }
  });

  test('magnet: eje y mediatriz contra la fórmula cerrada (y el campo numérico)', () => {
    for (let i = 0; i < 300; i++) {
      const c = { kind: i % 2 ? 'axis' : 'bisector', d: 1 + Math.floor(rand() * 8), ang: 90 * Math.floor(rand() * 4), s: 1 + Math.floor(rand() * 4), earth: rand() < 0.5 };
      const num = M.truth(c), cl = M.closed(c);
      near(num.x, cl.x, 1e-9 * (1 + cl.mag)); near(num.y, cl.y, 1e-9 * (1 + cl.mag));
      // Escrito aparte, sin LabMath: B = k[1/d² − 1/(d+2h)²] en el eje; 2kh/(h²+d²)^{3/2} en la mediatriz.
      const k = c.s * B0 * R0 * R0;
      let m = c.kind === 'axis' ? k * (1 / (c.d * c.d) - 1 / Math.pow(c.d + 2 * h, 2)) : 2 * k * h / Math.pow(h * h + c.d * c.d, 1.5);
      let ang = c.kind === 'axis' ? c.ang : c.ang + 180;
      let x = m * Math.cos(ang * Math.PI / 180), y = m * Math.sin(ang * Math.PI / 180);
      if (c.earth) y += 0.05;
      near(num.mag, hyp(x, y), 1e-9 * (1 + hyp(x, y)));
    }
  });

  test('magnet: en la mediatriz B es opuesto al eje S→N; en el eje, hacia afuera de N', () => {
    for (const ang of [0, 90, 180, 270, 37, 122]) {
      const th = ang * Math.PI / 180;
      const bis = M.field([{ x: 0, y: 0, ang, s: 2 }], -4 * Math.sin(th), 4 * Math.cos(th));
      near(M.angDiff(bis.ang, ang + 180), 0, 1e-6);
      const ax = M.field([{ x: 0, y: 0, ang, s: 2 }], 7 * Math.cos(th), 7 * Math.sin(th));
      near(M.angDiff(ax.ang, ang), 0, 1e-6);
    }
  });

  test('magnet: invertir el imán invierte el campo; la Tierra suma 0.05 mT al norte', () => {
    for (let i = 0; i < 100; i++) {
      const ang = between(0, 360), x = between(-9, 9), y = between(-6, 6);
      if (hyp(x, y) < 5) continue;
      const a = M.field([{ x: 0, y: 0, ang, s: 2 }], x, y), b = M.field([{ x: 0, y: 0, ang: ang + 180, s: 2 }], x, y);
      near(a.x, -b.x, 1e-9); near(a.y, -b.y, 1e-9);
      const e = M.field([{ x: 0, y: 0, ang, s: 2 }], x, y, { earth: true });
      near(e.x, a.x, 1e-12); near(e.y, a.y + 0.05, 1e-12);
    }
    const far = M.field([{ x: 0, y: 0, ang: 0, s: 1 }], 500, 0, { earth: true });
    near(M.angDiff(far.ang, 90), 0, 1);               // muy lejos manda la Tierra
  });

  test('magnet: rumbo desde el norte y conversión de unidades (tabla propia)', () => {
    eq(Math.round(M.bearing(0, 1)), 0); eq(Math.round(M.bearing(1, 0)), 90); eq(Math.round(M.bearing(0, -1)), 180); eq(Math.round(M.bearing(-1, 0)), 270);
    near(M.bearing(1, 1), 45, 1e-9);
    // 1 T = 10⁴ G = 10³ mT = 10⁶ µT
    const inT = { T: 1, mT: 1 / 1e3, uT: 1 / 1e6, G: 1 / 1e4 };
    for (const a of Object.keys(inT)) for (const b of Object.keys(inT)) {
      const v = between(0.1, 9);
      near(M.convert(v, a, b), v * inT[a] / inT[b], 1e-9 * Math.abs(v * inT[a] / inT[b]) + 1e-18);
    }
    near(M.convert(0.5, 'G', 'uT'), 50, 1e-9); near(M.convert(1.5, 'T', 'G'), 15000, 1e-9);
    near(M.convert(M.EARTH.mag, 'mT', 'G'), 0.5, 1e-12);
  });

  test('magnet: combine suma vectores por componentes (oráculo: campo del imán + Tierra en el plano)', () => {
    // Tierra al norte (rumbo 0°) + un campo de b mT al este (90°): |B| = √(b² + 0.05²), rumbo atan(b/0.05).
    for (let i = 0; i < 200; i++) {
      const b = between(0.01, 0.5), r = M.combine([{ mag: 0.05, bearing: 0 }, { mag: b, bearing: 90 }]);
      near(r.mag, Math.sqrt(b * b + 0.05 * 0.05), 1e-12); near(r.bearing, Math.atan(b / 0.05) * 180 / Math.PI, 1e-9);
    }
    // Tres campos: el mismo resultado que field() con un imán real cuyo campo se fija en el punto.
    const r3 = M.combine([{ mag: 0.05, bearing: 0 }, { mag: 0.03, bearing: 90 }, { mag: 0.04, bearing: 180 }]);
    near(r3.east, 0.03, 1e-12); near(r3.north, 0.01, 1e-12); near(r3.bearing, Math.atan2(0.03, 0.01) * 180 / Math.PI, 1e-9);
    // Un imán real en la mediatriz (ang = 90°: apunta al norte) más la Tierra: coincide con combine.
    const f = M.field([{ x: 0, y: 0, ang: 0, s: 2 }], 0, 4, { earth: true }), mm = M.field([{ x: 0, y: 0, ang: 0, s: 2 }], 0, 4);
    const c = M.combine([{ mag: 0.05, bearing: 0 }, { mag: mm.mag, bearing: M.bearing(mm.x, mm.y) }]);
    near(c.mag, f.mag, 1e-12); near(c.bearing, M.bearing(f.x, f.y), 1e-9);
    const q = M.ratio(5, 'mT', 0.5, 'G');
    near(q.ratio, 100, 1e-9); near(q.a_uT, 5000, 1e-9); near(q.b_uT, 50, 1e-9);
  });

  // Líneas de campo: cada paso va tangente a B, y las que salen de N de un imán solo llegan a su S (o se escapan).
  test('magnet: las líneas son tangentes a B y terminan en un polo S o fuera de la caja', () => {
    const mags = [{ x: 0, y: 0, ang: 0, s: 2 }];
    const lns = M.lines(mags, 12);
    eq(lns.length, 12);
    let reached = 0;
    lns.forEach((ln) => {
      eq(ln.end === 'pole' || ln.end === 'out', true, 'termina ' + ln.end);
      if (ln.end === 'pole') { eq(ln.hit.kind, 'S'); reached++; }
      for (let i = 5; i < ln.pts.length - 6; i += 7) {
        const a = ln.pts[i], b = ln.pts[i + 1], f = M.field(mags, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
        const dx = b[0] - a[0], dy = b[1] - a[1], L = hyp(dx, dy);
        near((dx * f.x + dy * f.y) / (L * f.mag), 1, 1e-3, 'tangente');
      }
    });
    if (reached < 6) throw new Error('muy pocas líneas llegaron al polo S: ' + reached);
    // Dos imanes N frente a N: ninguna línea cruza el eje x entre ellos (se repelen).
    const rep = [{ x: -4.5, y: 0, ang: 0, s: 2 }, { x: 4.5, y: 0, ang: 180, s: 2 }];
    M.lines(rep, 12).forEach((ln) => {
      const mid = ln.pts.filter((p) => Math.abs(p[0]) < 1e-9);
      eq(mid.length === 0 || mid.every((p) => Math.abs(p[1]) > 0.05), true);
    });
  });

  test('magnet: setup coloca la brújula en el eje o en la mediatriz', () => {
    for (const ang of [0, 90, 180, 270]) {
      const th = ang * Math.PI / 180;
      const a = M.setup({ kind: 'axis', d: 4, ang, s: 2, earth: false }).P;
      near(a.x, 7 * Math.cos(th), 1e-9); near(a.y, 7 * Math.sin(th), 1e-9);
      const b = M.setup({ kind: 'bisector', d: 4, ang, s: 2, earth: false }).P;
      near(b.x * Math.cos(th) + b.y * Math.sin(th), 0, 1e-9); near(hyp(b.x, b.y), 4, 1e-9);
    }
  });

  test('magnet: diagnóstico del reto', () => {
    const c = { kind: 'bisector', d: 4, ang: 0, s: 2, earth: false };
    const t = M.truth(c);
    eq(M.diagnose(c, { ang: t.ang, mag: t.mag }), 'ok');
    eq(M.diagnose(c, { ang: t.ang + 2, mag: t.mag * 1.02 }), 'ok');
    eq(M.diagnose(c, { ang: t.ang + 180, mag: t.mag }), 'reversed');
    eq(M.diagnose(c, { ang: t.ang, mag: t.mag * 1000 }), 'units');
    eq(M.diagnose(c, { ang: t.ang, mag: t.mag / 1000 }), 'units');
    eq(M.diagnose(c, { ang: t.ang, mag: t.mag * 10 }), 'gauss');
    eq(M.diagnose(c, { ang: t.ang, mag: t.mag * 1.5 }), 'dirOk');
    eq(M.diagnose(c, { ang: t.ang + 40, mag: t.mag }), 'magOk');
    eq(M.diagnose(c, { ang: 7, mag: 123 }), 'bad');
    eq(M.diagnose(c, { ang: NaN, mag: 1 }), 'bad');
    // Con la Tierra encendida, ignorarla se detecta.
    const e = { kind: 'bisector', d: 5, ang: 0, s: 2, earth: true };
    const noE = M.mistakes(e).noEarth;
    eq(M.diagnose(e, { ang: noE.ang, mag: noE.mag }), 'noEarth');
    // Un solo polo y 1/r.
    const f = { kind: 'bisector', d: 3, ang: 90, s: 3, earth: false };
    const one = M.mistakes(f).onePole, sq = M.mistakes(f).noSquare;
    eq(M.diagnose(f, { ang: one.ang, mag: one.mag }), 'onePole');
    eq(M.diagnose(f, { ang: sq.ang, mag: sq.mag }), 'noSquare');
    // Invertir el imán en el eje: la aguja queda al revés, pero también es «confundir N con S».
    const g = { kind: 'axis', d: 4, ang: 0, s: 2, earth: false };
    const sw = M.mistakes(g).swapped;
    eq(['swapped', 'reversed'].includes(M.diagnose(g, { ang: sw.ang, mag: sw.mag })), true);
  });

  // Banco f3 S01: cada numérica trae oracle(v, LM), que recalcula con LabMath por otro camino.
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-3/bank/sesion-01.js');
  if (fs.existsSync(bankFile)) test('magnet: banco f3 S01 contra LabMath (200 instancias por pregunta)', () => {
    const { loadData } = require('../lib/load');
    const W = loadData([path.join(ROOT, 'shared/js/labs/registry.js'), path.join(ROOT, 'shared/js/exercises.js'), path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], {});
    const Q = W.CB_BANK.f3.S01.questions;
    let seed = 99;
    const r2 = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    const missing = Q.filter((q) => q.type === 'numeric' && typeof q.oracle !== 'function').map((q) => q.id);
    if (missing.length) throw new Error('numéricas sin oracle: ' + missing.join(', '));
    Q.filter((q) => q.type === 'numeric').forEach((q) => {
      for (let i = 0; i < 200; i++) {
        const v = W.CBExercises.instance(q, r2), a = q.answer(v), o = q.oracle(v, LM);
        if (!(Math.abs(a - o) <= 1e-6 * Math.max(1e-30, Math.abs(o)) + 1e-30)) throw new Error(`${q.id} ${JSON.stringify(v)}: banco ${a}, LabMath ${o}`);
      }
    });
  });
};
