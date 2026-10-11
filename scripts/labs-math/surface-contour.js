// Pruebas de LabMath.surface (lab surface-contour, Cálculo 2 · S01). Cada resultado se compara con
// un camino independiente: Pitágoras componente a componente, esferas armadas desde su centro,
// sustituir los puntos en el plano, puntos de la curva de nivel en f, longitud de una circunferencia,
// puntos de las superficies paramétricas en la ecuación de la cuádrica.
'use strict';

module.exports = ({ test, eq, near, LM, math }) => {
  const S = LM.surface;
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const rand = rng(2026);
  const ri = (a, b) => a + Math.floor(rand() * (b - a + 1));

  test('surface: distancia contra Pitágoras en dos pasos (piso y luego altura)', () => {
    near(S.dist([1, -2, 3], [4, 2, -9]), 13, 1e-12);
    for (let i = 0; i < 200; i++) {
      const P = [ri(-9, 9), ri(-9, 9), ri(-9, 9)], Q = [ri(-9, 9), ri(-9, 9), ri(-9, 9)];
      const floor = Math.hypot(Q[0] - P[0], Q[1] - P[1]);
      near(S.dist(P, Q), Math.hypot(floor, Q[2] - P[2]), 1e-9);
      near(S.dist(P, Q), S.dist(Q, P), 1e-12, 'simetría');
    }
  });

  test('surface: esfera desarrollada desde su centro y radio se recupera al completar cuadrados', () => {
    for (let i = 0; i < 200; i++) {
      const h = ri(-6, 6), k = ri(-6, 6), l = ri(-6, 6), r = ri(1, 9);
      const sp = S.sphere(-2 * h, -2 * k, -2 * l, h * h + k * k + l * l - r * r);
      near(sp.center[0], h, 1e-12); near(sp.center[1], k, 1e-12); near(sp.center[2], l, 1e-12);
      near(sp.r, r, 1e-9);
    }
    eq(isNaN(S.sphere(0, 0, 0, 4).r), true, 'x² + y² + z² + 4 = 0 no es esfera');
  });

  test('surface: el plano por tres puntos los contiene y su normal es perpendicular a sus lados', () => {
    const pl = S.planeFromPoints([1, 0, 2], [2, 1, 0], [0, 2, 1]);
    near(pl.a / pl.d, 1 / 3, 1e-12); near(pl.b / pl.d, 1 / 3, 1e-12); near(pl.c / pl.d, 1 / 3, 1e-12);
    for (let i = 0; i < 200; i++) {
      const P = [ri(-5, 5), ri(-5, 5), ri(-5, 5)], Q = [ri(-5, 5), ri(-5, 5), ri(-5, 5)], R = [ri(-5, 5), ri(-5, 5), ri(-5, 5)];
      const p = S.planeFromPoints(P, Q, R), n = [p.a, p.b, p.c];
      if (Math.hypot(...n) < 1e-9) continue;                     // puntos alineados
      [P, Q, R].forEach((X) => near(S.onPlane(p, X), 0, 1e-9));
      const dotv = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
      near(dotv(n, [Q[0] - P[0], Q[1] - P[1], Q[2] - P[2]]), 0, 1e-9);
      near(dotv(n, [R[0] - P[0], R[1] - P[1], R[2] - P[2]]), 0, 1e-9);
    }
  });

  test('surface: intersecciones con los ejes están en el plano y sobre su eje', () => {
    const it = S.intercepts(S.planeFromNormal([2, 1, 2], [1, 2, 1]));
    near(it.x, 3, 1e-12); near(it.y, 6, 1e-12); near(it.z, 3, 1e-12);
    eq(S.intercepts({ a: 0, b: 1, c: 1, d: 4 }).x, null, 'plano paralelo al eje x');
    for (let i = 0; i < 200; i++) {
      const pl = { a: ri(-6, 6) || 1, b: ri(-6, 6) || 2, c: ri(-6, 6) || 3, d: ri(-20, 20) };
      const t = S.intercepts(pl);
      near(S.onPlane(pl, [t.x, 0, 0]), 0, 1e-9); near(S.onPlane(pl, [0, t.y, 0]), 0, 1e-9); near(S.onPlane(pl, [0, 0, t.z]), 0, 1e-9);
      near(S.axisIntercept(pl, 1), t.y, 1e-12);
    }
  });

  test('surface: los puntos de cada curva de nivel cumplen f ≈ c (y mejoran al afinar la malla)', () => {
    const fns = [
      [(x, y) => x * x + y * y, [1, 4, 6.5]],
      [(x, y) => x * x - y * y, [-2, 0.5, 3]],
      [(x, y) => Math.sin(x) * Math.cos(y), [-0.5, 0.2, 0.7]],
      [(x, y) => 6 - 2 * x - 3 * y, [-4, 0, 7]]
    ];
    const box = { x: [-3, 3], y: [-3, 3] };
    fns.forEach(([f, cs]) => cs.forEach((c) => {
      let worst = { 40: 0, 160: 0 };
      [40, 160].forEach((n) => {
        const segs = S.levelSegments(f, box, c, n);
        if (!segs.length) throw new Error('sin segmentos para c = ' + c);
        segs.forEach((s) => s.forEach((p) => { worst[n] = Math.max(worst[n], Math.abs(f(p[0], p[1]) - c)); }));
      });
      if (!(worst[40] < 0.05)) throw new Error(`c = ${c}: error ${worst[40]} con n = 40`);
      if (!(worst[160] <= worst[40] + 1e-12)) throw new Error(`c = ${c}: la malla fina no mejora (${worst[160]} > ${worst[40]})`);
    }));
  });

  test('surface: la curva x² + y² = 4 mide 4π y no hay curva fuera del rango de f', () => {
    const segs = S.levelSegments((x, y) => x * x + y * y, { x: [-3, 3], y: [-3, 3] }, 4, 120);
    const len = segs.reduce((s, q) => s + Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]), 0);
    near(len, 4 * Math.PI, 0.01);
    eq(S.levelSegments((x, y) => x * x + y * y, { x: [-3, 3], y: [-3, 3] }, -1, 40).length, 0, 'nivel negativo');
    // Fuera del dominio (NaN) no se dibuja nada.
    const half = (x, y) => Math.sqrt(9 - x * x - y * y);
    S.levelSegments(half, { x: [-4, 4], y: [-4, 4] }, 2, 80).forEach((s) => s.forEach((p) => near(half(p[0], p[1]), 2, 0.05)));
  });

  test('surface: rango de la malla, niveles redondos y el nivel más cercano', () => {
    const g = S.grid((x, y) => x * x + y * y, { x: [-2, 2], y: [-2, 2] }, 20);
    const r = S.zRange(g);
    near(r[0], 0, 1e-12); near(r[1], 8, 1e-12);
    const lv = S.niceLevels(r[0], r[1], 8);
    eq(lv.step, 1);
    eq(lv.levels.join(','), '0,1,2,3,4,5,6,7,8');
    eq(S.nearest(lv.levels, 3.4), 3);
  });

  test('surface: evalAt con math.js coincide con la fórmula a mano', () => {
    near(S.evalAt(math, 'x^2 + 2y^2', 1, 2), 9, 1e-12);
    near(S.evalAt(math, 'sqrt(9 - x^2 - y^2)', 1, 2), 2, 1e-12);
    eq(isNaN(S.evalAt(math, 'ln(x - y)', 1, 2)), true, 'fuera del dominio da NaN');
  });

  test('surface: veredicto del reto de nivel (correcto, x↔y, signo, curva dibujada)', () => {
    const f = (x, y) => x * x + 3 * y;
    eq(S.judgeLevel(f(2, 1), f(2, 1)), 'ok');
    eq(S.judgeLevel(7.004, 7), 'ok', 'redondeo a centésimas');
    eq(S.judgeLevel(f(1, 3), f(3, 1), { swapped: f(1, 3) }), 'swap');
    eq(S.judgeLevel(-7, 7, { swapped: 7 }), 'sign');
    eq(S.judgeLevel(6, 6.6, { levels: [0, 2, 4, 6, 8] }), 'grid');
    eq(S.judgeLevel(3, 6.6, { levels: [0, 2, 4, 6, 8] }), 'bad');
    eq(S.judgeLevel(NaN, 1), 'invalid');
  });

  test('surface: clasificación de cuádricas conocidas (también corridas y multiplicadas por −1)', () => {
    const cases = [
      [{ A: 1, B: 1, C: 1, G: -9 }, 'ellipsoid', null],
      [{ A: 1, B: 1, C: 1, D: -4, E: 6, F: -2, G: -2 }, 'ellipsoid', null],
      [{ A: 4, B: 9, C: 1, G: -36 }, 'ellipsoid', null],
      [{ A: 1, B: 1, C: -1, G: -4 }, 'hyperboloid1', 'z'],
      [{ A: 1, B: -4, C: 1, G: -4 }, 'hyperboloid1', 'y'],
      [{ A: -1, B: -1, C: 1, G: -1 }, 'hyperboloid2', 'z'],
      [{ A: 1, B: 1, C: -1, F: -4 }, 'hyperboloid2', 'z'],       // x² + y² − z² − 4z = 0
      [{ A: 1, B: 1, C: -1 }, 'cone', 'z'],
      [{ A: -1, B: 4, C: 9 }, 'cone', 'x'],
      [{ A: 1, B: 1, F: -1 }, 'paraboloid-elliptic', 'z'],
      [{ B: 1, C: 2, D: 3, G: 5 }, 'paraboloid-elliptic', 'x'],
      [{ A: -1, B: 1, F: -1 }, 'paraboloid-hyperbolic', 'z'],
      [{ A: 1, B: 1, G: -1 }, 'cylinder-elliptic', 'z'],
      [{ A: 1, C: 4, G: -4 }, 'cylinder-elliptic', 'y'],
      [{ A: 1, B: -1, G: -1 }, 'cylinder-hyperbolic', 'z'],
      [{ A: 1, E: -1 }, 'cylinder-parabolic', 'z'],
      [{ D: 1, E: 2, F: 3, G: -6 }, 'plane', null],
      [{ A: 1, B: 1, C: 1, G: 1 }, 'degenerate', null]
    ];
    cases.forEach(([co, kind, axis]) => {
      const r = S.classify(co);
      eq(r.kind, kind, JSON.stringify(co));
      if (axis) eq(r.axis, axis, 'eje de ' + JSON.stringify(co));
      const neg = {}; Object.keys(co).forEach((k) => { neg[k] = -co[k]; });
      eq(S.kindOf(neg), kind, 'por −1: ' + JSON.stringify(co));
    });
    eq(S.classify({ A: 2, B: 2, C: 2, G: -8 }).sphere, true, 'esfera');
  });

  test('surface: trazas de cuádricas (cónicas) en casos conocidos', () => {
    const hyp1 = { A: 1, B: 1, C: -1, G: -4 };
    eq(S.trace(hyp1, 'z', 0), 'circle'); eq(S.trace(hyp1, 'y', 0), 'hyperbola'); eq(S.trace(hyp1, 'y', 2), 'lines');
    const hyp2 = { A: -1, B: -1, C: 1, G: -1 };
    eq(S.trace(hyp2, 'z', 0), 'empty'); eq(S.trace(hyp2, 'z', 1), 'point'); eq(S.trace(hyp2, 'z', 2), 'circle');
    const par = { A: 1, B: 4, F: -1 };
    eq(S.trace(par, 'z', 1), 'ellipse'); eq(S.trace(par, 'x', 0), 'parabola'); eq(S.trace(par, 'z', -1), 'empty');
    eq(S.trace({ A: 1, B: 1, C: -1 }, 'z', 0), 'point');
    eq(S.trace({ A: 1, E: -1 }, 'z', 3), 'parabola');
  });

  test('surface: cada muestra al azar se clasifica como su tipo y su ecuación en TeX es legible', () => {
    S.KINDS.forEach((kind) => {
      for (let i = 0; i < 60; i++) {
        const smp = S.sample(kind, rand);
        const r = S.classify(smp.coef);
        eq(r.kind, kind, `${kind} ${JSON.stringify(smp.coef)}`);
        if (['hyperboloid1', 'hyperboloid2', 'cone', 'paraboloid-elliptic', 'paraboloid-hyperbolic', 'cylinder-elliptic'].includes(kind)) eq(r.axis, smp.axis, `eje de ${kind}`);
        const t = S.tex(smp.coef);
        if (!/=/.test(t) || /NaN|undefined|\+ -|- -/.test(t)) throw new Error('TeX raro: ' + t);
      }
    });
    eq(S.tex({ A: 1, B: 4, F: -1 }), 'z = x^2 + 4y^2');
    eq(S.tex({ A: 1, B: 1, C: -1, G: -4 }), 'x^2 + y^2 - z^2 = 4');
    eq(S.tex({ A: -1, B: 1, F: 2 }), '2z = x^2 - y^2');
  });

  test('surface: los puntos de las superficies paramétricas (vista 3D) cumplen la ecuación', () => {
    S.KINDS.forEach((kind) => {
      for (let i = 0; i < 25; i++) {
        const smp = S.sample(kind, rand), list = S.param(smp, 3.5);
        if (!list.length) throw new Error('sin superficie para ' + kind);
        const co = smp.coef, scale = 1 + Object.values(co).reduce((s, x) => s + Math.abs(x), 0);
        list.forEach((p) => {
          for (let j = 0; j < 30; j++) {
            const u = p.u[0] + (p.u[1] - p.u[0]) * rand(), v = p.v[0] + (p.v[1] - p.v[0]) * rand();
            const X = p.fn(u, v);
            const val = S.F(co, X[0], X[1], X[2]);
            if (!(Math.abs(val) <= 1e-8 * scale * (1 + X[0] * X[0] + X[1] * X[1] + X[2] * X[2]))) throw new Error(`${kind}: F = ${val} en ${X}`);
          }
        });
      }
    });
  });

  test('surface: pistas del «casi» entre cuádricas parecidas', () => {
    eq(S.quadricHint('hyperboloid1', 'hyperboloid2'), 'sheets');
    eq(S.quadricHint('cone', 'hyperboloid1'), 'cone');
    eq(S.quadricHint('paraboloid-hyperbolic', 'paraboloid-elliptic'), 'saddle');
    eq(S.quadricHint('cylinder-elliptic', 'ellipsoid'), 'cylinder');
    eq(S.quadricHint('ellipsoid', 'cylinder-parabolic'), 'nocylinder');
    eq(S.quadricHint('paraboloid-elliptic', 'cone'), 'linear');
    eq(S.quadricHint('ellipsoid', 'ellipsoid'), null);
  });
};
