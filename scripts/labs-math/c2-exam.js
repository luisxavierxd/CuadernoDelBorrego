// Problemas de examen de Cálculo 2 (data/calculo-2/exam-problems.js) contra los LabMath de las
// sesiones, por caminos independientes de answer(): la esfera de surface.sphere y su traza buscada
// con bisección sobre la ecuación desarrollada; conversiones de coords con ida y vuelta; la curva
// polar muestreada (centroide y radio medio); el plano tangente y la propagación de error de tplane
// con derivadas simbólicas de math.js; la isoterma resuelta con bisección y su pendiente por
// diferencias.
'use strict';
const path = require('path');
const { loadData } = require('../lib/load');

module.exports = ({ test, near, LM, math }) => {
  const W = loadData(path.join(__dirname, '..', '..', 'data', 'calculo-2', 'exam-problems.js'), {});
  const list = (W.CB_EXAMS && W.CB_EXAMS.c2) || [];
  const byId = {};
  list.forEach((p) => { byId[p.id] = p; });
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1), msg);

  // Instancias reproducibles (mismo muestreo que CBExercises.instance) y la cadena real de respuestas.
  function instances(p, n) {
    let seed = 17;
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
    if (!out.length) throw new Error('sin instancias de ' + p.id);
    return out;
  }
  function chain(p, v) { const t = []; p.parts.forEach((part) => t.push(part.answer(v, t.slice()))); return t; }
  function each(id, fn) {
    const p = byId[id];
    if (!p) throw new Error('no existe ' + id);
    instances(p, 60).forEach((v) => fn(v, chain(p, v), JSON.stringify(v)));
  }
  // Raíz de g en [lo, hi] por bisección (g cambia de signo).
  function bisect(g, lo, hi) {
    let glo = g(lo);
    if (glo * g(hi) > 0) throw new Error('bisección sin cambio de signo');
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2, gm = g(mid);
      if (glo * gm <= 0) hi = mid; else { lo = mid; glo = gm; }
    }
    return (lo + hi) / 2;
  }

  test('examen c2: 8 problemas por bloque (A y B); cada sesión S01–S10 en ≥ 2', () => {
    const blocks = { A: 0, B: 0 }, count = {};
    list.forEach((p) => {
      if (!(p.block in blocks)) throw new Error(p.id + ' tiene bloque ' + p.block);
      blocks[p.block]++;
      const n = +p.tags[0].slice(4);
      if (p.block === 'A' ? n > 5 : n < 6 || n > 10) throw new Error(p.id + ': su sesión principal no es de su bloque');
      p.tags.forEach((t) => { count[t] = (count[t] || 0) + 1; });
    });
    near(blocks.A, 8, 0, 'bloque A'); near(blocks.B, 8, 0, 'bloque B');
    ['c2.S01', 'c2.S02', 'c2.S03', 'c2.S04', 'c2.S05', 'c2.S06', 'c2.S07', 'c2.S08', 'c2.S09', 'c2.S10'].forEach((t) => { if (!(count[t] >= 2)) throw new Error(t + ' tiene ' + (count[t] || 0)); });
  });

  test('examen c2 esfera: surface.sphere, traza por bisección, área por polígono, distancia muestreada', () => {
    const S = LM.surface;
    each('c2-ex-esfera', (v, t, at) => {
      const D = -2 * v.h, E = -2 * v.k, F = -2 * v.l, G = v.h * v.h + v.k * v.k + v.l * v.l - v.R * v.R, c = v.l + v.dz;
      const co = { A: 1, B: 1, C: 1, D, E, F, G };
      const sp = S.sphere(D, E, F, G);
      near(t[0], sp.r, 1e-9, at + ' a');
      // Traza z = c: puntos de la esfera en varias direcciones desde (h, k, c).
      const ring = [];
      for (let i = 0; i < 720; i++) {
        const a = 2 * Math.PI * i / 720, ca = Math.cos(a), sa = Math.sin(a);
        const s = bisect((u) => S.F(co, v.h + u * ca, v.k + u * sa, c), 0, v.R + 1);
        ring.push([v.h + s * ca, v.k + s * sa]);
      }
      const rad = ring.reduce((m, p) => m + Math.hypot(p[0] - v.h, p[1] - v.k), 0) / ring.length;
      near(t[1], rad, 1e-7, at + ' b');
      let area = 0;
      ring.forEach((p, i) => { const q = ring[(i + 1) % ring.length]; area += p[0] * q[1] - q[0] * p[1]; });
      rel(t[2], Math.abs(area) / 2, 1e-4, at + ' c');
      // Distancia del origen a la esfera: mínimo sobre una malla fina de la superficie.
      let best = Infinity;
      for (let i = 0; i <= 180; i++) for (let j = 0; j < 360; j++) {
        const ph = Math.PI * i / 180, th = 2 * Math.PI * j / 360;
        const P = [sp.center[0] + sp.r * Math.sin(ph) * Math.cos(th), sp.center[1] + sp.r * Math.sin(ph) * Math.sin(th), sp.center[2] + sp.r * Math.cos(ph)];
        best = Math.min(best, S.dist([0, 0, 0], P));
      }
      near(t[3], best, 0.005, at + ' d');
      near(t[3], S.dist([0, 0, 0], sp.center) - sp.r, 1e-9, at + ' d exacta');
    });
  });

  test('examen c2 rect → cil y esf: coords.rectToCyl / rectToSph y la vuelta con sphToRect', () => {
    const C = LM.coords;
    each('c2-ex-rect-esfericas', (v, t, at) => {
      const cy = C.rectToCyl(v.x, v.y, v.z), sp = C.rectToSph(v.x, v.y, v.z);
      near(t[0], cy.r, 1e-9, at + ' a');
      near(t[1], cy.theta, 1e-9, at + ' b');
      near(t[2], sp.rho, 1e-9, at + ' c');
      near(t[3], sp.phi, 1e-9, at + ' d');
      const back = C.sphToRect(t[2], t[1], t[3]);
      near(back.x, v.x, 1e-9, at + ' vuelta x'); near(back.y, v.y, 1e-9, at + ' vuelta y'); near(back.z, v.z, 1e-9, at + ' vuelta z');
    });
  });

  test('examen c2 esf → rect: coords.sphToRect / sphToCyl y surface.dist', () => {
    const C = LM.coords, S = LM.surface;
    each('c2-ex-esfericas-dist', (v, t, at) => {
      const th = v.m * Math.PI / 6, ph = v.j * Math.PI / 6, P = C.sphToRect(v.rho, th, ph), cy = C.sphToCyl(v.rho, th, ph);
      near(t[0], cy.r, 1e-9, at + ' a');
      near(t[1], P.z, 1e-9, at + ' b');
      near(t[2], P.x, 1e-9, at + ' c');
      near(t[3], P.y, 1e-9, at + ' d');
      near(t[4], S.dist([P.x, P.y, P.z], [v.qx, v.qy, v.qz]), 1e-9, at + ' e');
      const sp = C.rectToSph(t[2], t[3], t[1]);
      near(sp.rho, v.rho, 1e-9, at + ' vuelta ρ'); near(C.angDist(sp.theta, th), 0, 1e-9, at + ' vuelta θ'); near(sp.phi, ph, 1e-9, at + ' vuelta φ');
    });
  });

  test('examen c2 polar: polar.compile, toRect y la circunferencia muestreada (centro y radio)', () => {
    const PL = LM.polar;
    each('c2-ex-polar-circulo', (v, t, at) => {
      const src = (2 * v.a) + '*cos(theta) + ' + (2 * v.b) + '*sin(theta)', th = v.m * Math.PI / 6;
      near(t[0], PL.compile(math, src)(th), 1e-9, at + ' a');
      const p = PL.toRect(t[0], th);
      near(t[1], p.x, 1e-9, at + ' b'); near(t[2], p.y, 1e-9, at + ' c');
      const pts = PL.curveOf(math, src, 0, Math.PI, 4000).filter(Boolean).slice(0, -1);
      const cx = pts.reduce((s, q) => s + q[0], 0) / pts.length, cy = pts.reduce((s, q) => s + q[1], 0) / pts.length;
      near(cx, v.a, 1e-6, at + ' centro x'); near(cy, v.b, 1e-6, at + ' centro y');
      const R = pts.reduce((s, q) => s + Math.hypot(q[0] - cx, q[1] - cy), 0) / pts.length;
      near(t[3], R, 1e-5, at + ' d');
      if (!PL.onImplicit(math, src, 'x^2 + y^2 - ' + (2 * v.a) + '*x - ' + (2 * v.b) + '*y')) throw new Error(at + ' la curva no cumple la rectangular');
    });
  });

  test('examen c2 plano tangente: tplane.linear (simbólica) y partial.central', () => {
    const T = LM.tplane, PS = LM.partial;
    each('c2-ex-plano-tangente', (v, t, at) => {
      const src = v.p + '*x^2*y + ' + v.q + '*y^2', lin = T.linear(math, src, v.a, v.b, v.dx, v.dy), f = PS.fn2(math, src);
      near(t[0], lin.f0, 1e-9, at + ' a');
      near(t[1], lin.fx, 1e-9, at + ' b'); rel(t[1], PS.central(f, v.a, v.b, 'x'), 1e-6, at + ' b numérica');
      near(t[2], lin.fy, 1e-9, at + ' c'); rel(t[2], PS.central(f, v.a, v.b, 'y'), 1e-6, at + ' c numérica');
      near(t[3], lin.L, 1e-9, at + ' d');
      if (!(lin.err < 0.2 * Math.abs(lin.dzReal) + 0.2)) throw new Error(at + ' la aproximación se aleja demasiado');
    });
  });

  test('examen c2 cono: tplane.propagate y el atajo 2dr/r + dh/h', () => {
    const T = LM.tplane;
    each('c2-ex-cono', (v, t, at) => {
      const pr = T.propagate(math, 'pi*r^2*h/3', ['r', 'h'], [v.r, v.h], [v.dr, v.dh]);
      rel(t[0], pr.value, 1e-12, at + ' a');
      rel(t[1], pr.grads[0], 1e-12, at + ' b');
      rel(t[2], pr.grads[1], 1e-12, at + ' c');
      rel(t[3], pr.abs, 1e-12, at + ' d');
      rel(t[4], pr.pct, 1e-12, at + ' e');
      rel(t[4], 100 * (2 * v.dr / v.r + v.dh / v.h), 1e-12, at + ' e atajo');
    });
  });

  test('examen c2 gas: partial.partials (n R T / V) y la diferencial de tplane.propagate', () => {
    const PS = LM.partial, T = LM.tplane;
    each('c2-ex-gas', (v, t, at) => {
      const pt = { n: v.n, R: 8.31, T: v.T, V: v.V }, g = PS.partials(math, 'n*R*T/V', pt);
      rel(t[0], PS.value(math, 'n*R*T/V', pt), 1e-12, at + ' a');
      rel(t[1], g.T, 1e-12, at + ' b');
      rel(t[2], g.V, 1e-12, at + ' c');
      const pr = T.propagate(math, v.n + '*8.31*T/V', ['T', 'V'], [v.T, v.V], [v.dT, v.dV]);
      rel(t[3], pr.signed, 1e-12, at + ' d');
      const real = v.n * 8.31 * (v.T + v.dT) / (v.V + v.dV) - t[0];
      if (!(Math.abs(real - t[3]) < 0.15 * Math.abs(real) + 0.3)) throw new Error(at + ' dP lejos del cambio real');
    });
  });

  test('examen c2 placa: isoterma por bisección, parciales simbólicas y pendiente por diferencias', () => {
    const PS = LM.partial;
    each('c2-ex-placa', (v, t, at) => {
      const src = '20 + ' + v.a + '*x^2 + ' + v.b + '*y^2', T = PS.fn2(math, src), pt = { x: v.x0, y: v.y0 };
      near(t[0], PS.value(math, src, pt), 1e-9, at + ' a');
      const k = t[0];
      near(t[1], bisect((x) => T(x, 0) - k, 0, 50), 1e-9, at + ' b');
      near(t[2], PS.at(math, src, pt, 'x'), 1e-9, at + ' c');
      near(t[3], PS.at(math, src, pt, 'y'), 1e-9, at + ' d');
      const h = 1e-4, sg = Math.sign(v.y0);
      const yOf = (x) => bisect((y) => T(x, sg * y) - k, 0, Math.abs(v.y0) * 3) * sg;
      near(t[4], (yOf(v.x0 + h) - yOf(v.x0 - h)) / (2 * h), 1e-5 * Math.max(1, Math.abs(t[4])), at + ' e');
    });
  });

  /* ---------------- Bloque B ---------------- */
  test('examen c2 cadena: chainTree (composición y Ridders sin regla de la cadena) y z(t0 + 0.1) real', () => {
    const CT = LM.chainTree, PS = LM.partial;
    each('c2-ex-cadena', (v, t, at) => {
      const spec = { f: v.p + '*x*y^2 + ' + v.q + '*x^2', inner: { x: 't^2 + ' + v.m, y: v.k + '*t' } }, P = { t: v.t0 };
      const pt = CT.point(math, spec, P);
      rel(t[0], CT.value(math, spec, P), 1e-12, at + ' a');
      rel(t[1], PS.central(PS.fn2(math, spec.f), pt.x, pt.y, 'x'), 1e-6, at + ' b');
      rel(t[2], PS.central(PS.fn2(math, spec.f), pt.x, pt.y, 'y'), 1e-6, at + ' c');
      rel(t[3], CT.numDeriv(math, spec, P, 't'), 1e-8, at + ' d');
      const real = CT.value(math, spec, { t: v.t0 + 0.1 });
      if (!(Math.abs(real - t[4]) < 0.2 * Math.abs(real - t[0]) + 0.05 * Math.abs(real) + 0.5)) throw new Error(at + ' e lejos del valor real');
    });
  });

  // Barrido de direcciones con el cociente de diferencias (sin gradiente): 720 ángulos y un
  // afinado de ±0.5° en el mejor. sg = 1 busca el máximo de D_u f; −1, el mínimo. → { th (rad), val }
  function sweep(f, P, sg) {
    const DD = LM.directional, D = (th) => sg * DD.limit(f, P, [Math.cos(th), Math.sin(th)]);
    let th = 0, best = -Infinity;
    for (let i = 0; i < 720; i++) { const a = 2 * Math.PI * i / 720, d = D(a); if (d > best) { best = d; th = a; } }
    const c = th;
    for (let i = -200; i <= 200; i++) { const a = c + i * (Math.PI / 360) / 200, d = D(a); if (d > best) { best = d; th = a; } }
    return { th: ((th % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), val: sg * best };
  }

  test('examen c2 direccional: directional.limitAt (cociente) y barrido de direcciones', () => {
    const DD = LM.directional;
    each('c2-ex-direccional', (v, t, at) => {
      const src = v.p + '*x^2 + ' + v.q + '*x*y + ' + v.r + '*y^2', P = { x: v.x0, y: v.y0 }, dir = [v.x1 - v.x0, v.y1 - v.y0];
      const g = DD.numGrad(DD.fn2(math, src), [v.x0, v.y0]);
      rel(t[0], g[0], 1e-6, at + ' a'); rel(t[1], g[1], 1e-6, at + ' b');
      rel(t[2], DD.limitAt(math, src, P, dir), 1e-6, at + ' c');
      const S = sweep(DD.fn2(math, src), [v.x0, v.y0], 1);
      near(t[3], S.val, 1e-5 * Math.max(1, S.val), at + ' d');
      let ang = (Math.abs(Math.atan2(dir[1], dir[0]) - S.th) * 180 / Math.PI) % 360; if (ang > 180) ang = 360 - ang;
      near(t[4], ang, 0.01, at + ' e');
    });
  });

  test('examen c2 enfriamiento: grad.gradient (descentDeg, minRate) y el mínimo de D_u T en un barrido', () => {
    const GR = LM.grad, DD = LM.directional;
    each('c2-ex-enfriamiento', (v, t, at) => {
      const src = v.T0 + ' + ' + v.c + '*x - ' + v.a + '*x^2 - ' + v.b + '*y^2', G = GR.gradient(math, src, v.x0, v.y0);
      near(t[0], G.fx, 1e-9, at + ' a'); near(t[1], G.fy, 1e-9, at + ' b');
      near(t[2], G.descentDeg, 1e-9, at + ' c');
      near(t[3], G.minRate, 1e-9, at + ' d');
      const S = sweep(DD.fn2(math, src), [v.x0, v.y0], -1), lo = S.val;
      near(t[2], S.th * 180 / Math.PI, 0.01, at + ' c barrido');
      near(t[3], lo, 1e-5 * Math.max(1, -lo), at + ' d barrido');
      rel(t[4], lo * v.s, 1e-5, at + ' e');
    });
  });

  test('examen c2 curva de nivel: chainTree.implicitNum (y(x) resuelta y derivada) y grad.levelLine', () => {
    const CT = LM.chainTree, GR = LM.grad;
    each('c2-ex-curva-nivel', (v, t, at) => {
      const src = v.a + '*x^2 + ' + v.b + '*x*y + y^2', k = v.a * v.x0 * v.x0 + v.b * v.x0 * v.y0 + v.y0 * v.y0, LL = GR.levelLine(math, src, v.x0, v.y0);
      near(t[0], LL.fx, 1e-9, at + ' a'); near(t[1], LL.fy, 1e-9, at + ' b');
      rel(t[2], CT.implicitNum(math, src + ' - ' + k, { x: v.x0, y: v.y0 }, 'x', 'y'), 1e-6, at + ' c');
      near(t[2] * t[3], -1, 1e-9, at + ' d perpendicular');
      rel(t[3], LL.normalSlope, 1e-12, at + ' d');
      rel(t[4], LL.intercept, 1e-12, at + ' e');
    });
  });

  test('examen c2 cerca: lagrange.optimum sobre la recta, λ por diferencias finitas (lambdaFD)', () => {
    const LG = LM.lagrange;
    each('c2-ex-cerca', (v, t, at) => {
      const spec = { kind: 'line', a: v.k + 1, b: 2, c: v.L }, O = LG.optimum(math, 'x*y', spec, 6000);
      near(t[0], O.xMax, 1e-6 * v.L, at + ' a'); near(t[1], O.yMax, 1e-6 * v.L, at + ' b');
      rel(t[2], O.max, 1e-9, at + ' c');
      rel(t[3], LG.lambdaFD(math, 'x*y', spec, 'max'), 1e-5, at + ' d');
      rel(t[3], O.lambdaMax, 1e-6, at + ' d en el punto');
      const big = LG.optimum(math, 'x*y', Object.assign({}, spec, { c: v.L + v.dL }), 6000).max;
      // A*(L) = L²/(8K) es cuadrática: lo que λ·ΔL no ve es exactamente ΔL²/(8K).
      near(big - t[4], v.dL * v.dL / (8 * (v.k + 1)), 1e-6 * big, at + ' e (resto de segundo orden)');
    });
  });

  test('examen c2 canal: lagrange.optimum sobre la parábola (mínimo de la distancia) y λ en el punto', () => {
    const LG = LM.lagrange;
    each('c2-ex-canal', (v, t, at) => {
      const src = 'x^2 + (y - ' + v.d + ')^2', spec = { kind: 'parabola', a: v.a, c: 0, t: [-6, 6] }, O = LG.optimum(math, src, spec, 8000);
      near(t[0], O.lambdaMin, 1e-6, at + ' a');
      near(t[1], O.yMin, 1e-6, at + ' b');
      near(t[2], Math.abs(O.xMin), 1e-6, at + ' c');
      near(t[3], Math.sqrt(O.min), 1e-7, at + ' d');
      near(t[4], v.d - Math.sqrt(O.min), 1e-7, at + ' e');
    });
  });

  test('examen c2 plano ∩ cilindro: lagr2.optimize (búsqueda densa sobre la elipse) con λ y μ', () => {
    const L2 = LM.lagr2;
    each('c2-ex-plano-cilindro', (v, t, at) => {
      const r = L2.optimize(math, 'z', { type: 'plane', n: [v.a, v.b, 1], c: v.c }, { type: 'cyl', c: v.R * v.R });
      near(t[0], r.max.x, 1e-6, at + ' a'); near(t[1], r.max.y, 1e-6, at + ' b');
      near(t[2], r.max.value, 1e-9, at + ' c');
      near(r.max.lam, 1, 1e-6, at + ' λ = 1');
      near(t[3], r.max.mu, 1e-6, at + ' d');
      near(t[4], r.min.value, 1e-9, at + ' e');
    });
  });

  test('examen c2 recta: lagr2.optimize (búsqueda densa sobre la recta) y Newton-Lagrange de 5 ecuaciones', () => {
    const L2 = LM.lagr2;
    each('c2-ex-recta-origen', (v, t, at) => {
      const g = { type: 'plane', n: [1, 1, v.k], c: v.c1 }, h = { type: 'plane', n: [1, -1, 0], c: v.c2 };
      const r = L2.optimize(math, 'x^2 + y^2 + z^2', g, h, { L: 12 });
      near(t[0], r.min.lam, 1e-6, at + ' a'); near(t[1], r.min.mu, 1e-6, at + ' b');
      near(t[2], r.min.x, 1e-6, at + ' c'); near(t[3], r.min.z, 1e-6, at + ' d');
      near(t[4], Math.sqrt(r.min.value), 1e-7, at + ' e');
      const s = L2.solve(math, 'x^2 + y^2 + z^2', g, h);
      near(t[0], s.min.lam, 1e-7, at + ' a (Newton)'); near(t[1], s.min.mu, 1e-7, at + ' b (Newton)');
      near(t[4], Math.sqrt(s.min.value), 1e-7, at + ' e (Newton)');
    });
  });
};
