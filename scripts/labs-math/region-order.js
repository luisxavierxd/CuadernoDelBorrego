// Pruebas de LabMath.region (lab region-order, Cálculo 2 · S12).
// Oráculos independientes: la misma integral por los dos órdenes (descripciones escritas a mano),
// Monte Carlo (Halton) sobre la región en sus coordenadas originales, áreas y centroides
// conocidos, la conversión numérica tipo I ↔ tipo II contra la escrita a mano y los «casi».
// Del banco de S12, cada numérica con `ck` se recalcula con un Simpson anidado propio.
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = ({ test, eq, near, LM, math }) => {
  const R = LM.region;
  const P = R.PRESETS;
  const rel = (a, b, t, msg) => near(a, b, t * Math.max(1, Math.abs(b)), msg);

  test('region: tanh-sinh con raíces en los extremos', () => {
    rel(R.quad((x) => Math.sqrt(x), 0, 1), 2 / 3, 1e-12, '∫ √x');
    rel(R.quad((x) => Math.sqrt(4 - x * x), 0, 2), Math.PI, 1e-12, '∫ √(4 − x²)');
    rel(R.quad((x) => Math.sin(x) / x, 1e-300, Math.PI), 1.851937051982466, 1e-11, 'Si(π)');
    rel(R.quad((x) => x * x, 2, 0), -8 / 3, 1e-13, 'límites invertidos → signo menos');
    eq(R.quad((x) => x, 1, 1), 0);
  });

  test('region: symbols ignora funciones y constantes', () => {
    eq(JSON.stringify(R.symbols(math, 'sqrt(y)/2 + pi + e^(x^2)')), JSON.stringify(['y', 'x']));
    eq(JSON.stringify(R.symbols(math, '2 - sin(3)')), '[]');
  });

  const AREAS = [4 / 3, 2, 4.5, Math.PI, 1];
  test('region: área de cada preset por los dos órdenes = valor exacto', () => {
    P.forEach((p, i) => {
      rel(R.area(math, p.I), AREAS[i], 1e-10, p.name + ' dy dx');
      rel(R.area(math, p.II), AREAS[i], 1e-10, p.name + ' dx dy');
    });
  });

  test('region: ∬ f dA de los presets coincide por los dos órdenes', () => {
    P.forEach((p) => p.fs.forEach((f) => {
      rel(R.integrate(math, p.I, f[0]), R.integrate(math, p.II, f[0]), 1e-9, p.name + ' ' + f[0]);
    }));
    // Casos cerrados: ∬ xy entre x² y 2x = 8/3; ∫₀²∫_y² e^{x²} dx dy = (e⁴ − 1)/2.
    rel(R.integrate(math, P[0].I, 'x*y'), 8 / 3, 1e-11, 'xy');
    rel(R.integrate(math, P[1].II, 'e^(x^2)'), (Math.exp(4) - 1) / 2, 1e-10, 'e^{x²} en el orden imposible');
  });

  // Halton 2D (bases 2 y 3): Monte Carlo determinista sobre la caja, con la región en sus coordenadas.
  function halton(i, b) { let f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; }
  test('region: Monte Carlo sobre la región (coordenadas originales) contra la integral iterada', () => {
    P.forEach((p) => p.fs.forEach((f) => {
      const T = R.compile(math, p.I), box = R.bbox(T), F = math.parse(f[0]).compile(), N = 60000;
      let s = 0;
      for (let i = 1; i <= N; i++) {
        const x = box[0] + (box[1] - box[0]) * halton(i, 2), y = box[2] + (box[3] - box[2]) * halton(i, 3);
        if (R.contains(T, x, y, 0)) s += F.evaluate({ x, y });
      }
      const mc = s / N * (box[1] - box[0]) * (box[3] - box[2]), want = R.integrate(math, p.II, f[0]);
      near(mc, want, 0.01 * Math.max(1, Math.abs(want)), p.name + ' ' + f[0] + ' Monte Carlo');
    }));
  });

  test('region: centros de masa de figuras conocidas', () => {
    let c = R.moments(math, P[1].I, '1');                     // triángulo (0,0), (2,0), (2,2)
    rel(c.xbar, 4 / 3, 1e-10, 'triángulo x̄'); rel(c.ybar, 2 / 3, 1e-10, 'triángulo ȳ');
    c = R.moments(math, P[4].II, '1');                        // triángulo (0,0), (2,0), (1,1)
    rel(c.xbar, 1, 1e-10, 'x̄'); rel(c.ybar, 1 / 3, 1e-10, 'ȳ');
    const semi = { kind: 'I', pieces: [{ a: -2, b: 2, lo: '0', hi: 'sqrt(4 - x^2)' }] };
    c = R.moments(math, semi, '1');
    near(c.xbar, 0, 1e-12, 'semicírculo x̄'); rel(c.ybar, 4 * 2 / (3 * Math.PI), 1e-10, 'semicírculo ȳ = 4r/3π');
    c = R.moments(math, P[3].I, '1');
    rel(c.xbar, 8 / (3 * Math.PI), 1e-10, 'cuarto de círculo'); rel(c.ybar, 8 / (3 * Math.PI), 1e-10, 'cuarto de círculo');
    // Momentos: M_x = ∬ y ρ dA (respecto al eje x). Bajo y = 4 − x² con ρ = y: m = 256/15, ȳ = 16/7.
    c = R.moments(math, { kind: 'I', pieces: [{ a: -2, b: 2, lo: '0', hi: '4 - x^2' }] }, 'y');
    rel(c.m, 256 / 15, 1e-10, 'm'); rel(c.ybar, 16 / 7, 1e-10, 'ȳ'); near(c.xbar, 0, 1e-12, 'x̄ por simetría');
    rel(c.Mx, 4096 / 105, 1e-10, 'M_x');
  });

  test('region: conversión numérica tipo I ↔ tipo II contra la escrita a mano (y cuándo hay que partir)', () => {
    P.forEach((p) => ['I', 'II'].forEach((k) => {
      const src = R.compile(math, p[k]), to = k === 'I' ? 'II' : 'I', want = R.compile(math, p[to]), got = R.convert(src);
      eq(got.ok, true, p.name + ' ' + k);
      eq(got.kind, to);
      eq(got.pieces.length, want.pieces.length, p.name + ' de ' + k + ': piezas');
      got.pieces.forEach((q, i) => {
        const w = want.pieces[i];
        near(q.a, w.a, 1e-7, 'inicio'); near(q.b, w.b, 1e-7, 'fin');
        for (let j = 1; j < 10; j++) {
          const u = w.a + (w.b - w.a) * j / 10;
          near(q.lo(u), w.lo(u), 1e-8, p.name + ' entrada en ' + u); near(q.hi(u), w.hi(u), 1e-8, p.name + ' salida en ' + u);
        }
      });
    }));
    // Una región que no es tipo II simple: el anillo entre dos semicírculos, cortado en horizontal.
    const ring = R.compile(math, { kind: 'I', pieces: [{ a: -2, b: -1, lo: '0', hi: 'sqrt(4 - x^2)' }, { a: -1, b: 1, lo: 'sqrt(1 - x^2)', hi: 'sqrt(4 - x^2)' }, { a: 1, b: 2, lo: '0', hi: 'sqrt(4 - x^2)' }] });
    eq(R.convert(ring).ok, false, 'el anillo necesita dos tramos por renglón');
  });

  test('region: slice con la recta horizontal y la vertical', () => {
    const T = R.compile(math, P[2].I);
    const h = R.slice(T, 'y', 0.5);                     // y = 0.5: x de 0.25 a 2.5
    eq(h.length, 1); near(h[0][0], 0.25, 1e-10); near(h[0][1], 2.5, 1e-10);
    const v = R.slice(T, 'x', 1);                       // x = 1: las dos piezas se juntan en [−1, 1]
    eq(v.length, 1); near(v[0][0], -1, 1e-12); near(v[0][1], 1, 1e-12);
  });

  // Diagnóstico: entrada = { kind, pieces }.
  const D = (p, kind, pieces, f) => R.diagnose(math, p, { kind, pieces: pieces.map((q) => ({ a: q[0], b: q[1], lo: q[2], hi: q[3] })) }, f || '1');
  test('region: diagnose reconoce los límites correctos en los dos órdenes', () => {
    P.forEach((p) => ['I', 'II'].forEach((k) => p.fs.forEach((f) => {
      const r = D(p, k, p[k].pieces.map((q) => [q.a, q.b, q.lo, q.hi]), f[0]);
      eq(r.reason, 'correct', p.name + ' ' + k + ' ' + f[0]);
    })));
    // Expresiones equivalentes escritas distinto: √y como y^(1/2).
    eq(D(P[0], 'II', [[0, 4, '0.5y', 'y^(1/2)']]).reason, 'correct');
  });
  test('region: diagnose da los «casi» (invertidos, usó la variable de adentro, sin despejar, sin partir, otro orden)', () => {
    eq(D(P[0], 'II', [[0, 4, 'sqrt(y)', 'y/2']]).reason, 'flipped', 'interiores invertidos');
    const fl = D(P[0], 'II', [[0, 4, 'sqrt(y)', 'y/2']]);
    if (!(fl.studentArea < 0)) throw new Error('el área con límites invertidos debe ser negativa');
    eq(D(P[0], 'II', [[4, 0, 'y/2', 'sqrt(y)']]).reason, 'flipped', 'exteriores invertidos');
    eq(D(P[0], 'II', [[0, 4, 'x^2', '2x']]).reason, 'innerVar', 'copió y = x² con x adentro');
    eq(D(P[0], 'II', [[0, 2, 'x^2', '2x']]).reason, 'swappedOrder', 'es la integral dy dx con otra etiqueta');
    eq(D(P[0], 'II', [[0, 2, 'y^2', '2y']]).reason, 'notSolved', 'cambió la letra sin despejar');
    eq(D(P[2], 'I', [[0, 4, '-sqrt(x)', 'sqrt(x)']]).reason, 'forgotSplit', 'una sola integral de 0 a 4');
    eq(D(P[2], 'I', [[0, 4, 'x - 2', 'sqrt(x)']]).reason, 'forgotSplit', 'la de abajo de la segunda pieza en todo el tramo');
    eq(D(P[2], 'I', [[0, 1, '-sqrt(x)', 'sqrt(x)']]).reason, 'forgotSplit', 'solo la primera pieza');
    eq(D(P[4], 'I', [[0, 2, '0', 'x']]).reason, 'forgotSplit', 'triángulo con una sola integral');
    eq(D(P[2], 'I', [[-1, 2, 'y^2', 'y + 2']]).reason, 'swappedOrder', 'escribió la dx dy');
    eq(D(P[1], 'I', [[0, 2, '0', 'x'], [1, 2, '0', 'x']]).reason, 'overlap', 'dos integrales que se enciman');
    eq(D(P[0], 'I', [[0, 1, 'x^2', '2x']]).reason, 'missing');
    eq(D(P[0], 'I', [[0, 2, '0', '2x']]).reason, 'extra');
    eq(D(P[0], 'I', [[1, 3, '0', 'x']]).reason, 'mismatch');
    eq(D(P[0], 'I', [[0, 2, 'x^2', 't']]).reason, 'unknownVar');
    eq(D(P[0], 'I', [[0, 2, '', '2x']]).reason, 'empty');
    eq(D(P[0], 'I', [[NaN, 2, 'x^2', '2x']]).reason, 'number');
    eq(D(P[3], 'II', [[0, 3, '0', 'sqrt(4 - y^2)']]).reason, 'domain');
  });
  test('region: la comparación de regiones detecta límites cruzados (diferencia simétrica)', () => {
    const T = R.compile(math, P[0].I);
    const S = R.compile(math, { kind: 'I', pieces: [{ a: 0, b: 2, lo: '2x', hi: 'x^2' }] });
    const C = R.compare(T, S);
    near(C.extra + C.missing, 0, 1e-12, 'misma región aunque estén cruzados');
    rel(C.trueArea, 4 / 3, 0.03, 'área en la malla');
    const S2 = R.compile(math, { kind: 'II', pieces: [{ a: 0, b: 4, lo: 'y/2', hi: 'y' }] });
    const C2 = R.compare(T, S2);
    if (!(C2.extra > 0.5 && C2.missing > 0.1)) throw new Error(`sobra ${C2.extra} y falta ${C2.missing}`);
    if (!R.runs(C2, 'extra').length || !R.runs(C2, 'miss').length) throw new Error('runs vacíos');
  });

  // Banco de S12: cada numérica con `ck` se recalcula con un Simpson anidado propio, con el
  // cambio x = a + (b − a)(1 − cos πs)/2 para suavizar las raíces en los extremos.
  function simpson(g, a, b, n) {
    if (a === b) return 0;
    const F = (s) => { const x = a + (b - a) * (1 - Math.cos(Math.PI * s)) / 2; return g(x) * (b - a) * Math.PI * Math.sin(Math.PI * s) / 2; };
    let s = F(0) + F(1);
    for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * F(i / n);
    return s / (3 * n);
  }
  function iter(o, f) {
    return o.pieces.reduce((acc, p) => acc + simpson((u) => simpson((w) => (o.order === 'I' ? f(u, w) : f(w, u)), p.lo(u), p.hi(u), 120), p.a, p.b, 120), 0);
  }
  const bankFile = path.join(__dirname, '..', '..', 'data', 'calculo-2', 'bank', 'sesion-12.js');
  if (fs.existsSync(bankFile)) {
    test('banco c2 S12: respuestas numéricas contra un Simpson anidado propio', () => {
      const { loadData } = require('../lib/load');
      const ROOT = path.join(__dirname, '..', '..');
      const W = loadData(['labs/registry', 'labs/antiderivative-check', 'exercises', 'quiz/bank-kit'].map((n) => path.join(ROOT, 'shared/js', n + '.js')), {});
      loadData(bankFile, W);
      const Q = W.CB_BANK.c2.S12.questions;
      let seed = 12; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      let checked = 0, numeric = 0;
      const REP = 5;
      Q.forEach((q) => {
        if (q.type === 'numeric') numeric++;
        if (!q.ck) return;
        for (let i = 0; i < REP; i++) {
          const v = W.CBExercises.instance(q, rnd), o = q.ck(v);
          const rho = o.f || (() => 1);
          let want;
          if (o.field === 'xbar' || o.field === 'ybar' || o.field === 'Mx' || o.field === 'My') {
            const m = iter(o, rho), Mx = iter(o, (x, y) => y * rho(x, y)), My = iter(o, (x, y) => x * rho(x, y));
            want = { xbar: My / m, ybar: Mx / m, Mx, My }[o.field];
          } else want = iter(o, rho);
          if (o.scale) want *= o.scale;
          const got = q.answer(v);
          if (Math.abs(got - want) > 1e-6 * Math.max(1, Math.abs(want))) throw new Error(`${q.id} ${JSON.stringify(v)}: respuesta ${got}, oráculo ${want}`);
          checked++;
        }
      });
      if (checked < REP * Math.ceil(numeric * 0.8)) throw new Error(`solo ${checked / REP} de ${numeric} preguntas numéricas tienen ck`);
    });
  }
};
