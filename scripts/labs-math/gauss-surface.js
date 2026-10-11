// Pruebas de LabMath.gaussSurface (Física 2 · S08): el flujo por cuadratura sobre cada superficie
// (centrada o descentrada) contra q_enc/ε₀; E(r) por Gauss contra la suma de Coulomb de miles de
// cargas puntuales (sin usar Gauss); la carga encerrada por conteo contra las fórmulas de lente;
// continuidad en r = R; cuándo la superficie sirve para despejar E, y el diagnóstico de errores.
'use strict';
module.exports = ({ test, eq, near, LM }) => {
  const G = LM.gaussSurface;
  const EPS0 = 8.85e-12, KD = 1 / (4 * Math.PI * EPS0);
  const rel = (a, b) => Math.abs(a - b) / Math.abs(b);
  const P = { Q: 6e-9, lam: 6e-9, sig: 6e-9, R: 0.05 };
  const DISTS = ['point', 'solid', 'shell', 'conductor', 'line', 'cylinder', 'plane'];

  test('gauss-surface: flujo numérico = q_enc/ε₀ en todas las combinaciones (también descentradas)', () => {
    let n = 0;
    for (const d of DISTS) for (const t of ['sphere', 'cylinder', 'box']) for (const r of [0.02, 0.05 * 1.3, 0.11]) for (const f of [0, 0.4, 0.8]) {
      const S = G.surface(d, t, r, f * r), q = G.qEnc(d, P, S), F = G.flux(d, P, S);
      const scale = Math.max(Math.abs(q) / EPS0, 1e-3 * F.emax * F.area, 1e-12);
      near(Math.abs(F.flux - q / EPS0) / scale, 0, 2e-3, `${d} en ${t} r=${r} s=${f}r: flujo ${F.flux} q/ε₀ ${q / EPS0}`);
      n++;
    }
    if (n < 180) throw new Error('pocas combinaciones');
  });

  test('gauss-surface: carga puntual descentrada en un cubo: flujo Q/ε₀ aunque E·n̂ cambie', () => {
    const S = G.surface('point', 'box', 0.05, 0.04), F = G.flux('point', { Q: 3e-9 }, S, { n: 64 });
    near(rel(F.flux, 3e-9 / EPS0), 0, 1e-6, 'flujo');
    eq(F.useful, false, 'no sirve para despejar E');
    if (!(F.max > 5 * F.min && F.min > 0)) throw new Error('E·n̂ debería cambiar mucho: ' + F.min + ' a ' + F.max);
    // Afuera del cubo: el flujo neto es cero (lo que entra sale).
    const F2 = G.flux('point', { Q: 3e-9 }, { type: 'box', r: 0.03, s: 0.05, axis: 'y' }, { n: 64 });
    near(F2.flux / (3e-9 / EPS0), 0, 1e-6, 'carga afuera');
  });

  // Coulomb puro: cargas [x, y, z, q] y el campo en P.
  function sum(charges, x, y, z) {
    let ex = 0, ey = 0, ez = 0;
    for (const c of charges) {
      const rx = x - c[0], ry = y - c[1], rz = z - c[2], r = Math.hypot(rx, ry, rz), f = KD * c[3] / (r * r * r);
      ex += f * rx; ey += f * ry; ez += f * rz;
    }
    return [ex, ey, ez];
  }
  // Puntos casi uniformes sobre una esfera (espiral de Fibonacci).
  function fib(R, n, q) {
    const o = [], ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) { const z = 1 - 2 * (i + 0.5) / n, s = Math.sqrt(1 - z * z), a = i * ga; o.push([R * s * Math.cos(a), R * s * Math.sin(a), R * z, q / n]); }
    return o;
  }

  test('gauss-surface: esfera sólida = suma de cargas puntuales (cascarones), dentro y fuera', () => {
    const Q = 5e-9, R = 0.08, NS = 300, pts = [];
    for (let i = 0; i < NS; i++) {
      const r0 = i * R / NS, r1 = (i + 1) * R / NS, q = Q * (r1 ** 3 - r0 ** 3) / R ** 3;
      pts.push(...fib((r0 + r1) / 2, 1500, q));
    }
    for (const r of [0.02, 0.05, 0.12, 0.3]) {
      const e = sum(pts, 0.6 * r, 0.48 * r, 0.64 * r), mag = Math.hypot(...e);
      near(rel(G.E('solid', { Q, R }, r), mag), 0, r < R ? 4e-3 : 1e-4, `r=${r}`);
      near(rel(G.solidE(Q, R, r), mag), 0, r < R ? 4e-3 : 1e-4);
    }
  });

  test('gauss-surface: cascarón y esfera conductora: E = 0 dentro y kQ/r² fuera (suma de cargas)', () => {
    const Q = 4e-9, R = 0.06, pts = fib(R, 20000, Q);
    for (const r of [0.01, 0.03]) {
      const e = sum(pts, r * 0.36, r * 0.48, r * 0.8);
      near(Math.hypot(...e) / (KD * Q / (R * R)), 0, 1e-4, `dentro r=${r}`);
      eq(G.E('shell', { Q, R }, r), 0); eq(G.E('conductor', { Q, R }, r), 0);
    }
    for (const r of [0.09, 0.2]) {
      const e = sum(pts, 0, 0, r);
      near(rel(G.E('shell', { Q, R }, r), e[2]), 0, 1e-6, `fuera r=${r}`);
      near(rel(G.shellE(Q, R, r), e[2]), 0, 1e-6);
    }
  });

  test('gauss-surface: línea infinita = suma de una línea muy larga de cargas', () => {
    const lam = 3e-9;
    for (const r of [0.01, 0.05]) {
      const L = 4000 * r, N = 400000, pts = [];
      for (let i = 0; i < N; i++) pts.push([0, -L / 2 + (i + 0.5) * L / N, 0, lam * L / N]);
      const e = sum(pts, r, 0, 0);
      near(rel(G.E('line', { lam }, r), e[0]), 0, 2e-4, `r=${r}`);
      near(rel(G.lineE(lam, r), e[0]), 0, 2e-4);
    }
  });

  test('gauss-surface: cilindro sólido = suma de líneas de carga (y la línea por puntos arriba)', () => {
    const lam = 5e-9, R = 0.04, NR = 160, NA = 192;
    // Corte del cilindro en celdas de igual área; cada una es una línea infinita: campo 2KD λᵢ/ρᵢ.
    function at(x) {
      let ex = 0, ez = 0;
      for (let i = 0; i < NR; i++) {
        const rho = R * Math.sqrt((i + 0.5) / NR);
        for (let j = 0; j < NA; j++) {
          const a = 2 * Math.PI * (j + 0.5) / NA, dx = x - rho * Math.cos(a), dz = -rho * Math.sin(a), d2 = dx * dx + dz * dz, f = 2 * KD * lam / (NR * NA) / d2;
          ex += f * dx; ez += f * dz;
        }
      }
      return Math.hypot(ex, ez);
    }
    for (const r of [0.015, 0.03, 0.06, 0.15]) near(rel(G.E('cylinder', { lam, R }, r), at(r)), 0, r < R ? 5e-3 : 1e-4, `r=${r}`);
  });

  test('gauss-surface: plano infinito = disco enorme de cargas puntuales (σ/2ε₀, sin depender de x)', () => {
    const sig = 2e-9, pts = [];
    // Anillos con radios en progresión geométrica hasta 3000 veces la distancia.
    for (const x of [0.01, 0.04]) {
      pts.length = 0;
      const Rmax = 3000 * x, NR = 1200, M = 64;
      for (let i = 0; i < NR; i++) {
        const r0 = i === 0 ? 0 : x * 1e-3 * Math.pow(Rmax / (x * 1e-3), (i - 1) / (NR - 1)), r1 = x * 1e-3 * Math.pow(Rmax / (x * 1e-3), i / (NR - 1));
        const q = sig * Math.PI * (r1 * r1 - r0 * r0) / M, rr = Math.sqrt((r0 * r0 + r1 * r1) / 2);
        for (let j = 0; j < M; j++) { const a = 2 * Math.PI * (j + 0.5) / M; pts.push([0, rr * Math.cos(a), rr * Math.sin(a), q]); }
      }
      const e = sum(pts, x, 0, 0);
      near(rel(G.E('plane', { sig }, x), e[0]), 0, 2e-3, `x=${x}`);
    }
    near(rel(G.planeE(sig), sig / (2 * EPS0)), 0, 1e-15);
    near(rel(G.plateE(sig), 2 * G.planeE(sig)), 0, 1e-15, 'placa conductora = σ/ε₀');
  });

  test('gauss-surface: E es continuo en r = R (sólidos) y salta σ/ε₀ en el cascarón', () => {
    const p = { Q: 7e-9, lam: 7e-9, R: 0.06 }, e = 1e-9;
    for (const d of ['solid', 'cylinder']) near(rel(G.E(d, p, p.R * (1 - e)), G.E(d, p, p.R * (1 + e))), 0, 1e-8, d);
    const sigma = p.Q / (4 * Math.PI * p.R * p.R);
    near(rel(G.E('shell', p, p.R * (1 + e)) - G.E('shell', p, p.R * (1 - e)), sigma / EPS0), 0, 1e-8, 'salto');
  });

  test('gauss-surface: q_enc por conteo de celdas = fórmulas de lente', () => {
    for (const [R, r, s] of [[0.05, 0.03, 0.02], [0.05, 0.06, 0.04], [0.04, 0.02, 0.0], [0.03, 0.05, 0.01]]) {
      const S = G.surface('solid', 'sphere', r, s), p = { Q: 1, R };
      near(G.qEncNum('solid', p, S, 1), G.lensVolume(R, r, s) / (4 / 3 * Math.PI * R ** 3), 3e-3, `sólida R=${R} r=${r} s=${s}`);
      near(G.qEncNum('shell', p, S, 1), s === 0 ? (r >= R ? 1 : 0) : G.capArea(R, r, s) / (4 * Math.PI * R * R), 3e-3, `cascarón R=${R} r=${r} s=${s}`);
      const C = G.surface('cylinder', 'cylinder', r, s);
      near(G.qEncNum('cylinder', { lam: 1, R }, C, 1) / (2 * r), G.circleLens(R, r, s) / (Math.PI * R * R), 3e-3, `cilindro R=${R} r=${r} s=${s}`);
    }
    // Lente: casos límite y simetría.
    near(G.lensVolume(1, 2, 3), 0, 1e-15); near(rel(G.lensVolume(1, 3, 0.5), 4 / 3 * Math.PI), 0, 1e-12);
    near(rel(G.lensVolume(1, 1.5, 1.2), G.lensVolume(1.5, 1, 1.2)), 0, 1e-12);
    near(rel(G.circleLens(1, 1, 1), 2 * Math.PI / 3 - Math.sqrt(3) / 2), 0, 1e-12, 'dos círculos unitarios a distancia 1');
  });

  test('gauss-surface: ¿sirve para despejar E? solo si respeta la simetría', () => {
    const yes = [['point', 'sphere', 0.03, 0], ['solid', 'sphere', 0.03, 0], ['shell', 'sphere', 0.03, 0], ['conductor', 'sphere', 0.09, 0],
      ['line', 'cylinder', 0.03, 0], ['cylinder', 'cylinder', 0.02, 0], ['cylinder', 'cylinder', 0.09, 0], ['plane', 'cylinder', 0.03, 0], ['plane', 'box', 0.03, 0],
      ['plane', 'cylinder', 0.03, 0.02], ['plane', 'box', 0.03, 0.024]];
    const no = [['point', 'box', 0.03, 0], ['point', 'sphere', 0.03, 0.012], ['solid', 'cylinder', 0.03, 0], ['line', 'box', 0.03, 0], ['line', 'sphere', 0.03, 0],
      ['line', 'cylinder', 0.03, 0.012], ['plane', 'sphere', 0.03, 0], ['shell', 'sphere', 0.09, 0.036]];
    for (const [d, t, r, s] of yes) eq(G.flux(d, P, G.surface(d, t, r, s)).useful, true, `${d} en ${t} s=${s}`);
    for (const [d, t, r, s] of no) eq(G.flux(d, P, G.surface(d, t, r, s)).useful, false, `${d} en ${t} s=${s}`);
    // Con la superficie simétrica, E · A = q_enc/ε₀ reproduce E(r).
    const F = G.flux('solid', P, G.surface('solid', 'sphere', 0.03, 0));
    near(rel(F.enMax, G.E('solid', P, 0.03)), 0, 1e-9);
  });

  test('gauss-surface: diagnóstico de errores típicos', () => {
    const cases = [['point', 0.04], ['solid', 0.03], ['solid', 0.09], ['shell', 0.03], ['shell', 0.09], ['conductor', 0.02], ['conductor', 0.08],
      ['line', 0.04], ['cylinder', 0.02], ['cylinder', 0.1], ['plane', 0.03]];
    for (const [d, r] of cases) {
      const e = G.E(d, P, r);
      eq(G.diagnose(d, P, r, e), 'ok', d + ' r=' + r);
      eq(G.diagnose(d, P, r, e === 0 ? 0.004 * G.pointE(P.Q, P.R) : e * 1.005), 'ok', d + ' dentro de 1 %');
      const m = G.mistakes(d, P, r);
      if (!Object.keys(m).length) throw new Error('sin errores típicos: ' + d);
      for (const k of Object.keys(m)) eq(G.diagnose(d, P, r, m[k]), k, `${d} r=${r} ${k}`);
      eq(G.diagnose(d, P, r, (e || 1e3) * 3.7 + 11), 'bad', d);
      eq(G.diagnose(d, P, r, NaN), 'bad');
    }
    eq('conductorZero' in G.mistakes('conductor', P, 0.02), true);
    eq('totalCharge' in G.mistakes('solid', P, 0.09), false, 'afuera no aplica');
    near(rel(G.mistakes('plane', P, 0.03).double, 2 * G.planeE(P.sig)), 0, 1e-15);
  });

  // Banco de F2 S08: sus respuestas (fórmulas propias del banco) contra LabMath, en 60 instancias cada una.
  test('gauss-surface: respuestas del banco f2 S08 contra LabMath', () => {
    const path = require('path');
    const { loadData } = require('../lib/load');
    const root = path.join(__dirname, '..', '..');
    const W = loadData(['shared/js/quiz/bank-kit.js', 'shared/js/exercises.js', 'data/fisica-2/bank/sesion-08.js'].map((f) => path.join(root, f)), {});
    const byId = {};
    W.CB_BANK.f2.S08.questions.forEach((q) => { byId[q.id] = q; });
    const cm = (x) => x / 100, nC = (q) => q * 1e-9, t1 = (x) => +x.toFixed(1);
    const sph = (Q, R, r) => G.E('solid', { Q, R }, r), cyl = (lam, R, r) => G.E('cylinder', { lam, R }, r);
    const O = {
      'es-puntual': (v) => G.E('point', { Q: nC(v.Q) }, cm(v.r)),
      'es-solida-dentro': (v) => sph(nC(v.Q), cm(v.R), cm(t1(v.R * v.f / 10))),
      'es-solida-fuera': (v) => sph(nC(v.Q), cm(v.R), cm(v.r)),
      'es-superficie': (v) => sph(nC(v.Q), cm(v.R), cm(v.R)),
      'es-rho': (v) => sph(v.rho * 1e-6 * 4 / 3 * Math.PI, 1, cm(v.r)),
      'es-rho-afuera': (v) => sph(v.rho * 1e-6 * 4 / 3 * Math.PI * cm(v.R) ** 3, cm(v.R), cm(v.r)),
      'es-cascaron-fuera': (v) => G.E('shell', { Q: nC(v.Q), R: cm(v.R) }, cm(v.r)),
      'es-fuerza': (v) => nC(v.q) * G.pointE(nC(v.Q), cm(v.r)) * 1e6,
      'ci-linea': (v) => G.E('line', { lam: v.lam * 1e-9 }, cm(v.r)),
      'ci-dentro': (v) => cyl(v.lam * 1e-9, cm(v.R), cm(t1(v.R * v.f / 10))),
      'ci-fuera': (v) => cyl(v.lam * 1e-9, cm(v.R), cm(v.r)),
      'ci-rho': (v) => cyl(v.rho * 1e-6 * Math.PI, 1, cm(v.r)),
      'ci-coaxial': (v) => G.lineE(v.lam * 1e-9, t1(v.b * v.f / 10) * 1e-3),
      'pl-hoja': (v) => G.E('plane', { sig: v.s * 1e-9 }, 1),
      'pl-entre': (v) => G.plateE(v.sg * 1e-9),
      'pl-conductora': (v) => G.plateE(nC(v.Q) / (2 * v.a * v.a)),
      'co-sigma-E': (v) => G.plateE(v.sc * 1e-9),
      'co-esfera-E': (v) => G.E('conductor', { Q: nC(v.q), R: cm(v.R) }, cm(v.R)),
      'co-fuera': (v) => G.E('conductor', { Q: nC(v.Q), R: cm(v.R) }, cm(v.r)),
      'co-cavidad-E': (v) => G.pointE(nC(v.Q + v.q), cm(v.r)),
      'ley-flujo-q': (v) => G.flux('point', { Q: nC(v.q) }, G.surface('point', 'box', 0.1, 0.03)).flux,
      'ley-q-de-flujo': (v) => G.chargeFromFlux(v.phi) * 1e9
    };
    const R = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
    let n = 0;
    for (const id of Object.keys(O)) {
      const q = byId['f2-s08-' + id];
      if (!q) throw new Error('falta ' + id);
      const tol = id === 'ley-flujo-q' ? 1e-6 : 1e-9;
      for (let i = 0; i < 60; i++) {
        const v = W.CBExercises.instance(q, R), a = q.answer(v), b = O[id](v);
        if (!(Math.abs(a - b) <= tol * Math.abs(b))) throw new Error(`${id} ${JSON.stringify(v)}: banco ${a}, LabMath ${b}`);
        n++;
      }
    }
    if (n < 1000) throw new Error('pocas instancias');
  });

  test('gauss-surface: fórmulas cerradas = q_enc/(ε₀ A) y carga a partir del flujo', () => {
    for (const r of [0.01, 0.04, 0.05, 0.2]) {
      near(rel(G.solidE(P.Q, P.R, r), G.qEncSym('solid', P, r) / (EPS0 * 4 * Math.PI * r * r)), 0, 1e-12);
      near(rel(G.cylinderE(P.lam, P.R, r), G.qEncSym('cylinder', P, r) / (EPS0 * 2 * Math.PI * r)), 0, 1e-12);
      near(rel(G.pointE(P.Q, r), KD * P.Q / (r * r)), 0, 1e-12);
    }
    near(rel(G.chargeFromFlux(1000), 8.85e-9), 0, 1e-12);
  });
};
