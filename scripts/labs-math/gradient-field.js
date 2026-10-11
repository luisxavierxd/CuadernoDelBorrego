// Pruebas de LabMath.grad (lab gradient-field, Cálculo 2 · S08). Oráculos independientes:
// el gradiente simbólico contra diferencias finitas centradas propias; ∇f · (tangente a la curva
// de nivel) ≈ 0 en puntos de curvas de nivel (marching squares fino y una elipse paramétrica);
// D_u f es máxima en u = ∇f/|∇f| barriendo θ con diferencias finitas; las curvas de ascenso y
// descenso (RK4) cruzan los contornos en ángulo recto y, en el cerro 4 − x² − 2y², siguen y = x²;
// la pendiente de la recta tangente contra Newton sobre la curva implícita; el plano tangente a
// F = c contra curvas sobre la superficie y contra el plano de S05; los diagnósticos del reto; y,
// del banco de S08, cada pregunta numérica con `ck` se recalcula sin la fórmula de la respuesta.
'use strict';
const path = require('path');
const fs = require('fs');

module.exports = ({ test, eq, near, LM, math }) => {
  const G = LM.grad;
  const rel = (a, b) => Math.abs(a - b) / (1 + Math.abs(b));
  const FUNS = [
    '4 - x^2 - 2y^2', 'x^2 + y^2', 'x^2 - y^2', '2x + y', 'sin(x)*cos(y)', 'x*e^(x*y)', 'x^2*y - 3y',
    'ln(x^2 + y^2 + 1)', '3e^(-(x - 1)^2 - y^2) + 2e^(-(x + 1.5)^2 - (y - 1)^2)', 'x^3 - 3x*y^2', 'atan(y/(x + 3))',
    '1/sqrt((x - 1)^2 + y^2) - 1/sqrt((x + 1)^2 + y^2)'
  ];
  const PTS = [[1, 1], [0.7, -1.2], [-0.8, 0.9], [1.3, 0.4], [-1.6, -0.5]];
  const comp = (src) => { const c = math.parse(LM.core.prep(src)).compile(); return (x, y) => c.evaluate({ x, y }); };
  // Diferencias centradas propias (no usan LabMath).
  const cd = (f, a, b, h = 1e-5) => [(f(a + h, b) - f(a - h, b)) / (2 * h), (f(a, b + h) - f(a, b - h)) / (2 * h)];
  const du = (f, a, b, th, h = 1e-4) => {
    const c = Math.cos(th), s = Math.sin(th);
    return (-f(a + 2 * h * c, b + 2 * h * s) + 8 * f(a + h * c, b + h * s) - 8 * f(a - h * c, b - h * s) + f(a - 2 * h * c, b - 2 * h * s)) / (12 * h);
  };
  // Máximo de D_u f barriendo θ y afinando con búsqueda ternaria.
  const sweep = (f, a, b, sign = 1) => {
    let best = 0, bv = -Infinity;
    const n = 720;
    for (let i = 0; i < n; i++) { const t = 2 * Math.PI * i / n, v = sign * du(f, a, b, t); if (v > bv) { bv = v; best = t; } }
    let lo = best - 2 * Math.PI / n, hi = best + 2 * Math.PI / n;
    for (let k = 0; k < 100; k++) {
      const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3;
      if (sign * du(f, a, b, m1) < sign * du(f, a, b, m2)) lo = m1; else hi = m2;
    }
    const th = (lo + hi) / 2;
    return { theta: ((th % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), value: sign * du(f, a, b, th) };
  };
  const angd = (p, q) => { const d = Math.abs((((p - q) % 360) + 360) % 360); return Math.min(d, 360 - d); };

  test('grad: gradiente simbólico contra diferencias centradas (12 funciones × 5 puntos)', () => {
    FUNS.forEach((src) => {
      const f = comp(src);
      PTS.forEach(([a, b]) => {
        const g = G.gradient(math, src, a, b), n = cd(f, a, b);
        if (rel(g.fx, n[0]) > 1e-6 || rel(g.fy, n[1]) > 1e-6) throw new Error(`${src} en (${a}, ${b}): simbólico ${g.fx}, ${g.fy}; numérico ${n}`);
        near(g.mag, Math.hypot(n[0], n[1]), 1e-5 * (1 + g.mag), 'magnitud');
        near(g.f0, f(a, b), 1e-12 * (1 + Math.abs(g.f0)), 'valor');
        // El gradiente numérico de cinco puntos del lab también coincide.
        const q = G.numGrad(f, a, b);
        if (rel(q[0], g.fx) > 1e-7 || rel(q[1], g.fy) > 1e-7) throw new Error(`${src}: numGrad ${q} contra ${g.fx}, ${g.fy}`);
      });
    });
    const e = G.gradient(math, '4 - x^2 - 2y^2', 1, 1);
    eq([e.fx, e.fy].join(), '-2,-4', 'ejemplo del cerro');
    near(e.mag, Math.sqrt(20), 1e-12); near(e.deg, 180 + Math.atan(2) * 180 / Math.PI, 1e-9, 'ángulo en el tercer cuadrante');
  });

  test('grad: ∇f · (tangente a la curva de nivel) ≈ 0 en puntos de curvas de nivel', () => {
    ['4 - x^2 - 2y^2', 'x^2 - y^2', 'sin(x)*cos(y)', 'x*e^(x*y)', 'x^2*y - 3y', 'x^3 - 3x*y^2'].forEach((src) => {
      const f = comp(src), g = G.grid(f, { x: [-2, 2], y: [-2, 2] }, 240), lv = G.levels(g, 8);
      let n = 0, worst = 0;
      const mags = [];
      for (let i = 0; i < 400; i++) { const x = -2 + 4 * ((i * 37) % 400) / 400, y = -2 + 4 * ((i * 91) % 400) / 400; mags.push(Math.hypot(...cd(f, x, y))); }
      mags.sort((p, q) => p - q);
      const med = mags[200];
      lv.forEach((c) => G.contour(g, c).forEach((s, k) => {
        if (k % 9) return;
        const dx = s[1][0] - s[0][0], dy = s[1][1] - s[0][1], L = Math.hypot(dx, dy);
        if (L < 4e-3) return;
        const mx = (s[0][0] + s[1][0]) / 2, my = (s[0][1] + s[1][1]) / 2, gr = G.gradient(math, src, mx, my);
        if (gr.mag < 0.2 * med) return;                          // cerca de un punto crítico la curva se dobla
        worst = Math.max(worst, Math.abs((gr.fx * dx + gr.fy * dy) / (gr.mag * L)));
        n++;
      }));
      if (n < 50) throw new Error(`${src}: solo ${n} puntos muestreados`);
      if (worst > 0.03) throw new Error(`${src}: |cos(∇f, tangente)| llega a ${worst}`);
    });
    // Elipse x² + 2y² = 3 (nivel f = 1 del cerro) parametrizada: la tangente es la derivada.
    for (let i = 0; i < 64; i++) {
      const t = 2 * Math.PI * i / 64, x = Math.sqrt(3) * Math.cos(t), y = Math.sqrt(1.5) * Math.sin(t);
      const tx = -Math.sqrt(3) * Math.sin(t), ty = Math.sqrt(1.5) * Math.cos(t), gr = G.gradient(math, '4 - x^2 - 2y^2', x, y);
      near(gr.fx * tx + gr.fy * ty, 0, 1e-12, 'elipse');
      near(gr.tangent[0] * gr.fx + gr.tangent[1] * gr.fy, 0, 1e-12, 'tangent ⟂ ∇f');
    }
  });

  test('grad: D_u f es máxima en u = ∇f/|∇f| (barrido de θ), mínima en −∇f y cero en las perpendiculares', () => {
    FUNS.forEach((src) => {
      const f = comp(src);
      PTS.forEach(([a, b]) => {
        const g = G.gradient(math, src, a, b);
        if (g.mag < 1e-3) return;
        const mx = sweep(f, a, b, 1), mn = sweep(f, a, b, -1);
        if (rel(mx.value, g.mag) > 1e-6) throw new Error(`${src} (${a}, ${b}): máximo del barrido ${mx.value}, |∇f| = ${g.mag}`);
        if (angd(mx.theta * 180 / Math.PI, g.deg) > 1e-3) throw new Error(`${src} (${a}, ${b}): argmax ${mx.theta * 180 / Math.PI}°, ∇f a ${g.deg}°`);
        if (angd(mn.theta * 180 / Math.PI, g.descentDeg) > 1e-3) throw new Error(`${src}: el mínimo no está en −∇f`);
        near(-mn.value, -g.mag, 1e-5 * (1 + g.mag), 'mínimo = −|∇f|');
        [90, 270].forEach((d) => near(du(f, a, b, g.angle + d * Math.PI / 180), 0, 1e-6 * (1 + g.mag), 'perpendicular'));
        // D_u f = |∇f| cos α en 12 direcciones.
        for (let k = 0; k < 12; k++) {
          const th = k * Math.PI / 6;
          near(G.dirDeriv(g.fx, g.fy, th), du(f, a, b, th), 1e-6 * (1 + g.mag), 'D_u f');
          near(G.dirDeriv(g.fx, g.fy, th), g.mag * Math.cos(th - g.angle), 1e-9 * (1 + g.mag), '|∇f| cos α');
        }
      });
    });
  });

  test('grad: las curvas de ascenso y descenso (RK4) cruzan los contornos en ángulo recto', () => {
    const box = { x: [-3, 3], y: [-3, 3] };
    [['4 - x^2 - 2y^2', 0.8, 1.1], ['x^2 - y^2', 1, 0.5], ['sin(x)*cos(y)', 0.5, 0.8], ['3e^(-(x - 1)^2 - y^2) + 2e^(-(x + 1.5)^2 - (y - 1)^2)', 0.3, -1],
      ['x*e^(x*y)', 0.5, 0.3], ['1/sqrt((x - 1)^2 + y^2) - 1/sqrt((x + 1)^2 + y^2)', 0.5, 1]].forEach(([src, a, b]) => {
      const f = comp(src);
      [1, -1].forEach((sg) => {
        const r = G.path(f, a, b, { sign: sg, box, ds: 0.01, max: 1500 });
        if (r.pts.length < 30) throw new Error(`${src} (${sg}): recorrido muy corto (${r.pts.length}, ${r.why})`);
        let worst = 0;
        for (let i = 1; i < r.pts.length - 2; i++) {
          const p = r.pts[i], dx = r.pts[i + 1][0] - r.pts[i - 1][0], dy = r.pts[i + 1][1] - r.pts[i - 1][1], g = cd(f, p[0], p[1]);
          const m = Math.hypot(...g), L = Math.hypot(dx, dy);
          if (m < 1e-3 || L < 1e-9) continue;
          worst = Math.max(worst, Math.abs((-g[1] * dx + g[0] * dy) / (m * L)));   // contra la tangente al contorno
          if (sg * (f(r.pts[i + 1][0], r.pts[i + 1][1]) - f(p[0], p[1])) <= 0) throw new Error(`${src}: f no es monótona en el recorrido`);
        }
        if (worst > 2e-3) throw new Error(`${src} (${sg}): el recorrido no es ⟂ a los contornos (seno ${worst})`);
      });
    });
    // Cerro 4 − x² − 2y² desde (1, 1): dy/dx = f_y/f_x = 2y/x, así que la curva es y = x².
    const f = comp('4 - x^2 - 2y^2');
    [1, -1].forEach((sg) => {
      const r = G.path(f, 1, 1, { sign: sg, box, ds: 0.005, max: 3000 });
      r.pts.forEach((p) => { if (p[0] > 0.05 && Math.abs(p[1] - p[0] * p[0]) > 1e-6) throw new Error(`(${p}) no está en y = x²`); });
      if (sg > 0) { if (Math.hypot(...r.end) > 0.02) throw new Error('el ascenso no llegó a la cima (0, 0): ' + r.end); }
      else eq(r.why, 'box', 'el agua sale de la ventana');
    });
  });

  test('grad: recta tangente a la curva de nivel contra Newton sobre la curva implícita', () => {
    [['x^2 + 2y^2', 1, 1], ['x^2 + x*y + 2y^2', 1, 2], ['x*y', 2, 3], ['x^3 + y^3 - 6x*y', 1, 2], ['e^x*sin(y)', 0.3, 1], ['x^2 - y^2', 2, 1]].forEach(([src, a, b]) => {
      const f = comp(src), c = f(a, b), h = 1e-4;
      const yAt = (x) => { let y = b; for (let k = 0; k < 60; k++) { const fy = (f(x, y + 1e-6) - f(x, y - 1e-6)) / 2e-6; y -= (f(x, y) - c) / fy; } return y; };
      const slope = (yAt(a + h) - yAt(a - h)) / (2 * h), L = G.levelLine(math, src, a, b);
      if (rel(L.slope, slope) > 1e-6) throw new Error(`${src}: pendiente ${L.slope}, Newton ${slope}`);
      near(L.intercept, b - slope * a, 1e-5 * (1 + Math.abs(b)), 'intercepto');
      near(L.normalSlope * L.slope, -1, 1e-9, 'normal ⟂ tangente');
      near(L.fx * a + L.fy * b, L.d, 1e-9 * (1 + Math.abs(L.d)), 'forma general');
    });
    const L = G.levelLine(math, '4 - x^2 - 2y^2', 1, 1);
    near(L.slope, -0.5, 1e-12); near(L.intercept, 1.5, 1e-12); near(L.normalSlope, 2, 1e-12);
    eq(G.levelLine(math, 'x^2 + y^2', 2, 0).slope, Infinity, 'tangente vertical');
  });

  test('grad: plano tangente a F(x, y, z) = c contiene P, su normal ⟂ curvas sobre la superficie y coincide con S05', () => {
    // Esfera x² + y² + z² = 14 en (1, 2, 3): plano x + 2y + 3z = 14 (por 2).
    const S = G.levelPlane(math, 'x^2 + y^2 + z^2', 1, 2, 3);
    eq(S.n.join(), '2,4,6'); near(S.d, 28, 1e-12); near(S.k, 14, 1e-12);
    // Curvas sobre la esfera por P (giros alrededor de dos ejes): su tangente es ⟂ a ∇F.
    const rot = (p, ax, t) => {
      const c = Math.cos(t), s = Math.sin(t), [x, y, z] = p;
      return ax === 'z' ? [c * x - s * y, s * x + c * y, z] : ax === 'x' ? [x, c * y - s * z, s * y + c * z] : [c * x + s * z, y, -s * x + c * z];
    };
    ['x', 'y', 'z'].forEach((ax) => {
      const h = 1e-5, p1 = rot([1, 2, 3], ax, h), p0 = rot([1, 2, 3], ax, -h);
      const t = [0, 1, 2].map((i) => (p1[i] - p0[i]) / (2 * h));
      near(t[0] * S.n[0] + t[1] * S.n[1] + t[2] * S.n[2], 0, 1e-8, 'giro en ' + ax);
    });
    // Superficies en general: ∇F por diferencias propias y el plano contiene P.
    [['x^2 + 2y^2 + 3z^2', [1, -1, 1]], ['x*y*z', [1, 2, 3]], ['x^2 + y^2 - z', [1, 2, 5]], ['e^(x*z) + y^2', [0, 1, 2]], ['x*y + y*z + x*z', [1, 1, 2]]].forEach(([src, p]) => {
      const code = math.parse(src).compile(), F = (x, y, z) => code.evaluate({ x, y, z }), h = 1e-5;
      const num = [(F(p[0] + h, p[1], p[2]) - F(p[0] - h, p[1], p[2])) / (2 * h), (F(p[0], p[1] + h, p[2]) - F(p[0], p[1] - h, p[2])) / (2 * h), (F(p[0], p[1], p[2] + h) - F(p[0], p[1], p[2] - h)) / (2 * h)];
      const L = G.levelPlane(math, src, p[0], p[1], p[2]);
      L.n.forEach((v, i) => { if (rel(v, num[i]) > 1e-6) throw new Error(`${src}: ∇F ${L.n}, numérico ${num}`); });
      near(L.n[0] * p[0] + L.n[1] * p[1] + L.n[2] * p[2], L.d, 1e-9 * (1 + Math.abs(L.d)), 'contiene P');
    });
    // F = f(x, y) − z: el plano de la superficie de nivel F = 0 es el plano tangente de S05.
    const P5 = LM.tplane.tangentPlane(math, 'x^2 + x*y + 2y^2', 1, 2), L5 = G.levelPlane(math, 'x^2 + x*y + 2y^2 - z', 1, 2, 11);
    near(L5.P, P5.fx, 1e-12); near(L5.Q, P5.fy, 1e-12); near(L5.R, P5.c, 1e-12);
  });

  test('grad: diagnose en ∇f, ángulo y magnitud', () => {
    const c = G.gradient(math, '4 - x^2 - 2y^2', 1, 1);   // ∇f = (−2, −4), θ = 243.43°, |∇f| = 4.472
    const d = (s, mode, cc) => G.diagnose(s, cc || c, mode).reason;
    eq(d([-2, -4], 'grad'), 'correct'); eq(d([-4, -2], 'grad'), 'swap'); eq(d([2, 4], 'grad'), 'neg');
    eq(d([4, -2], 'grad'), 'tangent'); eq(d([-4, 2], 'grad'), 'tangent'); eq(d([2, -4], 'grad'), 'oneSign');
    eq(d([1, 1], 'grad'), 'mismatch'); eq(G.diagnose([NaN, 1], c, 'grad').kind, 'invalid');
    eq(d(243.43, 'angle'), 'correct'); eq(d(243.43 - 360, 'angle'), 'correct', 'equivalente');
    eq(d(63.43, 'angle'), 'quadrant', 'arctan sin cuadrante (f_x < 0)');
    eq(d(333.43, 'angle'), 'tangent'); eq(d(153.43, 'angle'), 'tangent');
    eq(d(4.249, 'angle'), 'radians'); eq(d(100, 'angle'), 'mismatch');
    eq(d(Math.atan2(-2, -4) * 180 / Math.PI + 360, 'angle'), 'swap');
    const p = G.gradient(math, 'x^2 + y^2', 1.5, 1);        // ∇f = (3, 2): f_x > 0
    eq(d(Math.atan(2 / 3) * 180 / Math.PI + 180, 'angle', p), 'neg', 'con f_x > 0 el opuesto es neg');
    eq(d(4.47, 'mag'), 'correct'); eq(d(20, 'mag'), 'noRoot'); eq(d(6, 'mag'), 'sumAbs'); eq(d(4, 'mag'), 'oneComp');
    eq(d(3, 'mag'), 'mismatch');
    eq(G.diagnose(30, G.gradient(math, 'x^2 + y^2', 0, 0), 'angle').reason, 'flat');
    eq(G.near(1.234, 1.24), true); eq(G.near(1.22, 1.24), false);
  });

  test('grad: niveles redondos y contornos de un tazón son círculos', () => {
    const f = comp('x^2 + y^2'), g = G.grid(f, { x: [-3, 3], y: [-3, 3] }, 120);
    const lv = G.levels(g, 10);
    if (lv.length < 5) throw new Error('pocos niveles: ' + lv);
    G.contour(g, 4).forEach((s) => s.forEach((p) => near(Math.hypot(p[0], p[1]), 2, 3e-3, 'círculo de radio 2')));
    const fl = G.field(f, { x: [-3, 3], y: [-3, 3] }, 6);
    eq(fl.length, 36);
    fl.forEach((q) => { near(q.gx, 2 * q.x, 1e-8); near(q.gy, 2 * q.y, 1e-8); });
  });

  // Banco de S08: las preguntas numéricas con `ck` se recalculan sin la fórmula de la respuesta.
  const bankFile = path.join(__dirname, '..', '..', 'data', 'calculo-2', 'bank', 'sesion-08.js');
  if (fs.existsSync(bankFile)) {
    test('banco c2 S08: respuestas numéricas contra diferencias finitas, barridos de θ y Newton (oráculo independiente)', () => {
      const { loadData } = require('../lib/load');
      const ROOT = path.join(__dirname, '..', '..');
      const W = loadData(['labs/registry', 'labs/antiderivative-check', 'exercises', 'quiz/bank-kit'].map((n) => path.join(ROOT, 'shared/js', n + '.js')), {});
      loadData(bankFile, W);
      const Q = W.CB_BANK.c2.S08.questions;
      let seed = 8; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      let checked = 0, numeric = 0;
      Q.forEach((q) => {
        if (q.type === 'numeric') numeric++;
        if (!q.ck) return;
        for (let i = 0; i < 40; i++) {
          const v = W.CBExercises.instance(q, rnd), o = q.ck(v), code = math.parse(o.f).compile();
          const p = o.pt, names = Object.keys(p);
          const F = (pt) => code.evaluate(Object.assign({}, pt));
          const part = (w) => { const hh = 1e-5 * Math.max(1, Math.abs(p[w])), p1 = Object.assign({}, p), p0 = Object.assign({}, p); p1[w] += hh; p0[w] -= hh; return (F(p1) - F(p0)) / (2 * hh); };
          const f2 = (x, y) => F({ x, y });
          let want;
          if (o.kind === 'd') want = part(o.wrt);
          else if (o.kind === 'val') want = F(p);
          else if (o.kind === 'mag') want = sweep(f2, p.x, p.y, 1).value;
          else if (o.kind === 'min') want = -sweep(f2, p.x, p.y, -1).value;
          else if (o.kind === 'deg' || o.kind === 'down') {
            const t = sweep(f2, p.x, p.y, o.kind === 'deg' ? 1 : -1).theta * 180 / Math.PI;
            const got = q.answer(v);
            if (angd(got, t) > 1e-3) throw new Error(`${q.id} ${JSON.stringify(v)}: ángulo ${got}, barrido ${t}`);
            if (got < 0 || got >= 360) throw new Error(`${q.id}: el ángulo debe quedar en [0, 360)`);
            checked++;
            continue;
          } else if (o.kind === 'du') want = du(f2, p.x, p.y, Math.atan2(o.u[1], o.u[0]));
          else if (o.kind === 'mag3') want = Math.hypot(...names.map(part));
          else if (o.kind === 'plane') want = names.reduce((s, k) => s + part(k) * p[k], 0);
          else if (o.kind === 'slope' || o.kind === 'icpt' || o.kind === 'nslope' || o.kind === 'nicpt') {
            const c0 = F(p), h = 1e-4;
            const yAt = (x) => { let y = p.y; for (let k = 0; k < 60; k++) { const fy = (f2(x, y + 1e-6) - f2(x, y - 1e-6)) / 2e-6; y -= (f2(x, y) - c0) / fy; } return y; };
            const m = (yAt(p.x + h) - yAt(p.x - h)) / (2 * h), mn = -1 / m;
            want = o.kind === 'slope' ? m : o.kind === 'icpt' ? p.y - m * p.x : o.kind === 'nslope' ? mn : p.y - mn * p.x;
          } else throw new Error(`${q.id}: ck.kind desconocido ${o.kind}`);
          if (o.scale) want *= o.scale;
          if (o.plus) want += o.plus;
          const got = q.answer(v);
          if (Math.abs(got - want) > 2e-6 * Math.max(1, Math.abs(want))) throw new Error(`${q.id} ${JSON.stringify(v)}: respuesta ${got}, oráculo ${want}`);
          checked++;
        }
      });
      if (checked < 40 * Math.ceil(numeric * 0.8)) throw new Error(`solo ${checked / 40} de ${numeric} preguntas numéricas tienen ck`);
    });
  }
};
