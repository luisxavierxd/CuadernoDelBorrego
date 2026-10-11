/* =====================================================================
   Lab chain-tree (Cálculo 2 · S06): regla de la cadena con árbol de
   dependencias. El alumno elige o escribe z = f(x, y) (o w = f(x, y, z)) y
   las funciones intermedias x(t), y(t) (o x(s, t), y(s, t)); el lab dibuja el
   árbol z → x, y → t y, al pedir la derivada, anima cada camino: resalta sus
   aristas, escribe sus factores y arma la suma. También hay árbol para la
   derivación implícita F(x, y) = 0 → dy/dx = −F_x/F_y.
   Reto: escribir dz/dt en t₀ (número) o como expresión en t (o en s y t). Se
   compara contra la derivada numérica de la composición z(x(t), y(t)) y se da
   el «casi»: olvidó un camino, multiplicó los caminos en lugar de sumarlos,
   evaluó las parciales en t en lugar de en (x(t₀), y(t₀)), olvidó los factores
   de adentro, o el signo de la implícita.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  function prep(s) { return window.LabMath.core.prep(s); }
  function evalNode(code, scope) {
    try { var v = code.evaluate(Object.assign({}, scope)); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; }
  }
  function compile(math, src) {
    var c = math.parse(prep(src)).compile();
    return function (scope) { return evalNode(c, scope); };
  }
  // Variables intermedias en orden (x, y, z…) y si una expresión depende de una variable.
  function mids(spec) { return Object.keys(spec.inner); }
  function depends(math, src, name) {
    var d = false;
    math.parse(prep(src)).traverse(function (n) { if (n.isSymbolNode && n.name === name) d = true; });
    return d;
  }
  // Valores de las intermedias en los parámetros: { x: x(t₀), y: y(t₀) }.
  function point(math, spec, at) {
    var out = {};
    mids(spec).forEach(function (u) { out[u] = compile(math, spec.inner[u])(at); });
    return out;
  }
  // La composición z(params) = f(x(params), y(params), …).
  function compose(math, spec) {
    var F = compile(math, spec.f), G = {};
    mids(spec).forEach(function (u) { G[u] = compile(math, spec.inner[u]); });
    return function (at) {
      var p = {};
      for (var u in G) p[u] = G[u](at);
      return F(p);
    };
  }

  // Derivada numérica de una función de una variable: diferencias centradas con extrapolación
  // de Richardson (método de Ridders). Error típico ~1e-12 en funciones suaves.
  function ridders(g, x, h) {
    var CON = 1.4, CON2 = CON * CON, SAFE = 2, NT = 10, best = NaN;
    h = h || 0.05 * Math.max(1, Math.abs(x));
    for (var tries = 0; tries < 4 && !isFinite(best); tries++, h /= 10) {
      var a = [], err = Infinity, hh = h, i, j;
      for (i = 0; i < NT; i++) a.push([]);
      a[0][0] = (g(x + hh) - g(x - hh)) / (2 * hh);
      best = NaN;
      for (i = 1; i < NT; i++) {
        hh /= CON;
        a[0][i] = (g(x + hh) - g(x - hh)) / (2 * hh);
        var fac = CON2;
        for (j = 1; j <= i; j++) {
          a[j][i] = (a[j - 1][i] * fac - a[j - 1][i - 1]) / (fac - 1);
          fac *= CON2;
          var e = Math.max(Math.abs(a[j][i] - a[j - 1][i]), Math.abs(a[j][i] - a[j - 1][i - 1]));
          if (e <= err) { err = e; best = a[j][i]; }
        }
        if (Math.abs(a[i][i] - a[i - 1][i - 1]) >= SAFE * err) break;
      }
    }
    return best;
  }
  // Derivada numérica de la composición respecto al parámetro wrt (oráculo, sin regla de la cadena).
  function numDeriv(math, spec, at, wrt) {
    var Z = compose(math, spec);
    return ridders(function (tau) { var p = Object.assign({}, at); p[wrt] = tau; return Z(p); }, at[wrt]);
  }
  // Valor de z en los parámetros.
  function value(math, spec, at) { return compose(math, spec)(at); }

  // La regla de la cadena por el árbol: un camino por cada intermedia que depende de wrt.
  // Cada camino: outer = ∂f/∂u en (x(t₀), y(t₀)), inner = ∂u/∂wrt en t₀, prod = outer·inner.
  function tree(math, spec, at, wrt) {
    var p = point(math, spec, at), paths = [], total = 0;
    mids(spec).forEach(function (u) {
      if (!depends(math, spec.inner[u], wrt)) return;
      var outer = evalNode(math.derivative(prep(spec.f), u).compile(), p);
      var inner = evalNode(math.derivative(prep(spec.inner[u]), wrt).compile(), at);
      paths.push({ u: u, outer: outer, inner: inner, prod: outer * inner });
      total += outer * inner;
    });
    return { point: p, paths: paths, total: total, z: compile(math, spec.f)(p) };
  }
  // ¿Cuántos términos tiene la derivada? Uno por cada intermedia que depende de wrt.
  function terms(math, spec, wrt) {
    return mids(spec).filter(function (u) { return depends(math, spec.inner[u], wrt); }).length;
  }
  // La derivada como expresión en los parámetros (sin simplificar): Σ (∂f/∂u)(x(t), y(t))·∂u/∂wrt.
  function expr(math, spec, wrt) {
    var subs = {};
    mids(spec).forEach(function (u) { subs[u] = math.parse(prep(spec.inner[u])); });
    var parts = [];
    mids(spec).forEach(function (u) {
      if (!depends(math, spec.inner[u], wrt)) return;
      var outer = math.derivative(prep(spec.f), u).transform(function (n) {
        return n.isSymbolNode && subs[n.name] ? new math.ParenthesisNode(subs[n.name]) : n;
      });
      parts.push('(' + outer.toString() + ') * (' + math.derivative(prep(spec.inner[u]), wrt).toString() + ')');
    });
    return parts.join(' + ') || '0';
  }

  // Los errores típicos como valores en el punto.
  //   missing:   olvidó un camino (el total menos uno de los productos)
  //   product:   multiplicó los caminos en lugar de sumarlos
  //   atParam:   evaluó ∂f/∂u en t₀ (x = y = t₀) en lugar de en (x(t₀), y(t₀))
  //   outerOnly: sumó solo las parciales de afuera (olvidó dx/dt, dy/dt)
  function mistakeValues(math, spec, at, wrt, T) {
    T = T || tree(math, spec, at, wrt);
    var out = { missing: [], product: NaN, atParam: NaN, outerOnly: NaN };
    if (T.paths.length >= 2) {
      T.paths.forEach(function (q) { out.missing.push(T.total - q.prod); });
      out.product = T.paths.reduce(function (s, q) { return s * q.prod; }, 1);
    }
    var params = spec.params || Object.keys(at), naive = {};
    mids(spec).forEach(function (u, i) { naive[u] = at[params[Math.min(i, params.length - 1)]]; });
    var sum = 0, outer = 0;
    T.paths.forEach(function (q) {
      sum += evalNode(math.derivative(prep(spec.f), q.u).compile(), naive) * q.inner;
      outer += q.outer;
    });
    out.atParam = sum;
    out.outerOnly = outer;
    return out;
  }

  // Cerca con la holgura de los ejercicios: ±0.01 o ±1 %.
  function near(s, t) { return Math.abs(s - t) <= 0.01 * Math.max(1, Math.abs(t)) + 1e-9; }

  // Diagnóstico de un valor escrito por el alumno → { kind, reason, want, numeric }.
  // reason: correct · missing · product · atParam · outerOnly · sign · mismatch · domain
  function diagnoseValue(math, spec, at, wrt, s) {
    var T = tree(math, spec, at, wrt), t = T.total, num = numDeriv(math, spec, at, wrt);
    if (!isFinite(t)) t = num;
    if (!isFinite(t)) return { kind: 'invalid', reason: 'domain' };
    var out = { want: t, numeric: num };
    if (near(s, t)) return Object.assign(out, { kind: 'ok', reason: 'correct' });
    var M = mistakeValues(math, spec, at, wrt, T), cands = [];
    M.missing.forEach(function (m) { cands.push(['missing', m]); });
    cands.push(['product', M.product], ['atParam', M.atParam], ['outerOnly', M.outerOnly]);
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i][1];
      if (isFinite(c) && !near(c, t) && near(s, c)) return Object.assign(out, { kind: 'warn', reason: cands[i][0] });
    }
    if (Math.abs(t) > 0.02 && near(-s, t)) return Object.assign(out, { kind: 'warn', reason: 'sign' });
    return Object.assign(out, { kind: 'bad', reason: 'mismatch' });
  }

  // Puntos de muestra alrededor de los parámetros (para comparar expresiones).
  function samples(at, params, r) {
    var out = [], i, j;
    r = r || 0.5;
    if (params.length === 1) {
      for (i = 0; i < 15; i++) { var p = {}; p[params[0]] = at[params[0]] + r * (i / 7 - 1) + 0.0137; out.push(p); }
    } else {
      for (i = 0; i < 5; i++) for (j = 0; j < 5; j++) {
        var q = {}; q[params[0]] = at[params[0]] + r * (i / 2 - 1) + 0.0137; q[params[1]] = at[params[1]] + r * (j / 2 - 1) - 0.0093; out.push(q);
      }
    }
    return out;
  }
  // Diagnóstico de la expresión escrita por el alumno (en t, o en s y t). Si usa x, y (o z),
  // se sustituyen por x(t), y(t): queda bien, pero se le avisa ('mixed').
  // reason: correct · mixed · missing · product · outerOnly · sign · factor · mismatch · domain
  function diagnoseExpr(math, spec, wrt, input, at) {
    var C = window.LabMath.core, params = spec.params || Object.keys(at);
    var S = compile(math, input), G = {}, us = mids(spec), mixed = false;
    us.forEach(function (u) { G[u] = compile(math, spec.inner[u]); if (depends(math, input, u)) mixed = true; });
    var pts = samples(at, params), ref = [], stu = [], cand = { product: [], outerOnly: [] }, miss = [];
    pts.forEach(function (p) {
      var sc = Object.assign({}, p);
      us.forEach(function (u) { sc[u] = G[u](p); });
      var T = tree(math, spec, p, wrt), M = mistakeValues(math, spec, p, wrt, T);
      ref.push(T.total); stu.push(S(sc));
      cand.product.push(M.product); cand.outerOnly.push(M.outerOnly);
      M.missing.forEach(function (m, k) { (miss[k] = miss[k] || []).push(m); });
    });
    function cmp(a, b) { return C.compareValues(a.map(function (x, i) { return [x, b[i]]; }), 8); }
    var r = cmp(ref, stu);
    if (r.reason === 'correct') return { kind: 'ok', reason: mixed ? 'mixed' : 'correct' };
    if (r.reason === 'domain') return { kind: 'invalid', reason: 'domain' };
    var list = miss.map(function (m) { return ['missing', m]; }).concat([['product', cand.product], ['outerOnly', cand.outerOnly]]);
    for (var i = 0; i < list.length; i++) {
      var c = list[i][1];
      if (c.every(function (x) { return isFinite(x); }) && cmp(ref, c).reason !== 'correct' && cmp(c, stu).reason === 'correct') return { kind: 'warn', reason: list[i][0] };
    }
    if (r.reason === 'sign' || r.reason === 'factor') return { kind: 'warn', reason: r.reason, k: r.k };
    return { kind: 'bad', reason: 'mismatch' };
  }

  /* ---------- Implícita ---------- */
  // Para F(…) = 0 con dep = dep(wrt): ∂dep/∂wrt = −F_wrt / F_dep en el punto pt.
  function implicit(math, src, pt, wrt, dep) {
    wrt = wrt || 'x'; dep = dep || 'y';
    var Fw = evalNode(math.derivative(prep(src), wrt).compile(), pt), Fd = evalNode(math.derivative(prep(src), dep).compile(), pt);
    return { Fw: Fw, Fd: Fd, slope: -Fw / Fd, F: compile(math, src)(pt) };
  }
  // Resuelve F = 0 para dep cerca de guess, con las demás variables de pt fijas (Newton).
  function solveFor(math, src, pt, dep, guess) {
    var F = compile(math, src), d = guess != null ? guess : pt[dep];
    function g(v) { var p = Object.assign({}, pt); p[dep] = v; return F(p); }
    for (var i = 0; i < 60; i++) {
      var h = 1e-6 * Math.max(1, Math.abs(d)), gv = g(d), dg = (g(d + h) - g(d - h)) / (2 * h);
      if (!isFinite(gv) || !isFinite(dg) || dg === 0) return NaN;
      var step = gv / dg;
      d -= step;
      if (Math.abs(step) < 1e-14 * Math.max(1, Math.abs(d))) break;
    }
    return Math.abs(g(d)) < 1e-9 * Math.max(1, Math.abs(d)) ? d : NaN;
  }
  // Oráculo numérico de la implícita: dep(wrt) se obtiene resolviendo F = 0 y se deriva con Ridders.
  function implicitNum(math, src, pt, wrt, dep) {
    wrt = wrt || 'x'; dep = dep || 'y';
    var last = pt[dep];
    return ridders(function (w) {
      var p = Object.assign({}, pt); p[wrt] = w;
      return solveFor(math, src, p, dep, last);
    }, pt[wrt], 0.01 * Math.max(1, Math.abs(pt[wrt])));
  }
  // Diagnóstico de dy/dx implícita. reason: correct · sign · inverted · invSign · mismatch · domain
  function diagnoseImplicit(math, src, pt, s, wrt, dep) {
    var I = implicit(math, src, pt, wrt, dep), t = I.slope;
    if (!isFinite(t)) return { kind: 'invalid', reason: 'domain' };
    var out = { want: t, Fw: I.Fw, Fd: I.Fd };
    if (near(s, t)) return Object.assign(out, { kind: 'ok', reason: 'correct' });
    var cands = [['sign', I.Fw / I.Fd], ['inverted', -I.Fd / I.Fw], ['invSign', I.Fd / I.Fw]];
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i][1];
      if (isFinite(c) && !near(c, t) && near(s, c)) return Object.assign(out, { kind: 'warn', reason: cands[i][0] });
    }
    return Object.assign(out, { kind: 'bad', reason: 'mismatch' });
  }

  window.LabMath.chainTree = {
    compile: compile, mids: mids, depends: depends, point: point, compose: compose, value: value,
    ridders: ridders, numDeriv: numDeriv, tree: tree, terms: terms, expr: expr, mistakeValues: mistakeValues,
    near: near, diagnoseValue: diagnoseValue, diagnoseExpr: diagnoseExpr,
    implicit: implicit, solveFor: solveFor, implicitNum: implicitNum, diagnoseImplicit: diagnoseImplicit
  };

  /* ------------------------------ UI ------------------------------ */
  // kind: 'one' (x(t), y(t)) · 'two' (x(s, t), y(s, t)) · 'three' (w = f(x, y, z)) · 'imp' (F(x, y) = 0)
  var PRESETS = [
    { kind: 'one', name: 'Globo en el cerro: T = 30 − x² − 2y²', f: '30 - x^2 - 2y^2', inner: { x: '1 + t', y: '2t' }, at: { t: 0.5 }, range: { t: [0, 2] } },
    { kind: 'one', name: 'z = x²y con x = t², y = 3t + 1', f: 'x^2*y', inner: { x: 't^2', y: '3t + 1' }, at: { t: 1 }, range: { t: [-1.5, 1.5] } },
    { kind: 'one', name: 'Sobre un círculo: z = xy, x = cos t, y = sen t', f: 'x*y', inner: { x: 'cos(t)', y: 'sin(t)' }, at: { t: 0.5 }, range: { t: [-3, 3] } },
    { kind: 'one', name: 'z = e^(xy) con x = t, y = t²', f: 'e^(x*y)', inner: { x: 't', y: 't^2' }, at: { t: 0.6 }, range: { t: [-1.2, 1.2] } },
    { kind: 'two', name: 'Polares: z = x² − y², x = s cos t, y = s sen t', f: 'x^2 - y^2', inner: { x: 's*cos(t)', y: 's*sin(t)' }, at: { s: 2, t: 0.5 }, range: { s: [0.5, 3], t: [-3, 3] } },
    { kind: 'two', name: 'z = xy², x = s + t, y = st', f: 'x*y^2', inner: { x: 's + t', y: 's*t' }, at: { s: 1, t: 2 }, range: { s: [-2, 2], t: [-2, 2] } },
    { kind: 'three', name: 'Tres caminos: w = xy + z², x = cos t, y = sen t, z = t', f: 'x*y + z^2', inner: { x: 'cos(t)', y: 'sin(t)', z: 't' }, at: { t: 0.8 }, range: { t: [-2, 2] } },
    { kind: 'imp', name: 'Implícita: x²y + y³ = 10', F: 'x^2*y + y^3 - 10', x0: 3, y0: 1, w: [-4.5, 4.5, -3, 3], range: { x: [-4, 4] } },
    { kind: 'imp', name: 'Implícita: x³ + y³ = 6xy', F: 'x^3 + y^3 - 6x*y', x0: 3, y0: 3, w: [-1, 4.5, -1, 4.5], range: { x: [2.2, 3.7] } },
    { kind: 'imp', name: 'Implícita: círculo x² + y² = 25', F: 'x^2 + y^2 - 25', x0: 3, y0: 4, w: [-6, 6, -6, 6], range: { x: [-4.6, 4.6] } }
  ];
  var KINDS = [['one', 'Un parámetro: x(t), y(t)'], ['two', 'Dos parámetros: x(s, t), y(s, t)'], ['three', 'Tres intermedias: x(t), y(t), z(t)'], ['imp', 'Implícita: F(x, y) = 0']];
  var MODES = [['value', 'Escribir el valor en el punto'], ['expr', 'Escribir la expresión']];
  var NS = 'http://www.w3.org/2000/svg';
  var W = 600, H = 290;

  window.Labs['chain-tree'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, LM = window.LabMath.chainTree;
    var presets = cfg.presets || PRESETS, start = cfg.start != null ? cfg.start : 0;
    var math = null, P = presets[start], spec = null, imp = null, at = {}, wrt = 't', mode = 'value';
    var hl = -1, done = 0, timers = [], student = null, shown = false;
    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    var kindSel = UI.select({ label: 'Tipo de árbol', options: KINDS.map(function (k) { return k[1]; }) });
    var preset = UI.select({ label: 'Ejemplo', options: [''] });
    var fIn = UI.mathField({ label: 'z = f(x, y)', hint: 'Usa x, y (y z si hay tres intermedias).', palette: 'multi', onEnter: function () { build(true); } });
    var xIn = UI.mathField({ label: 'x(t) =', palette: 'multi', onEnter: function () { build(true); } });
    var yIn = UI.mathField({ label: 'y(t) =', palette: 'multi', onEnter: function () { build(true); } });
    var zIn = UI.mathField({ label: 'z(t) =', palette: 'multi', onEnter: function () { build(true); } });
    var run = UI.button('Graficar', 'primary', function () { build(true); });
    var status = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var sS = UI.slider({ label: 's₀', min: 0, max: 1, step: 0.05, value: 0, fmt: fmtN }, function () { moved(); });
    var tS = UI.slider({ label: 't₀', min: 0, max: 1, step: 0.05, value: 0, fmt: fmtN }, function () { moved(); });
    var wrtSel = UI.select({ label: 'Derivada que buscas', options: ['∂z/∂s', '∂z/∂t'] });
    var animBtn = UI.button('Armar la derivada camino por camino', 'primary', function () { animate(); });
    var modeSel = UI.select({ label: 'Reto', options: MODES.map(function (m) { return m[1]; }) });
    var ansExpr = UI.mathField({ label: 'Tu dz/dt', hint: 'Solo en t: sustituye x(t) y y(t).', palette: 'multi', onEnter: function () { verify(); } });
    var ansNum = UI.input({ label: 'Tu valor', type: 'number', step: 'any', inputmode: 'decimal', mono: false, hint: 'Redondea a 2 decimales.' });
    var check = UI.button('Comprobar', 'primary', function () { verify(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });

    var treeSvg = UI.svg(W, H, 'Árbol de dependencias de la regla de la cadena');
    var steps = h('ol', { class: 'ct-steps', 'aria-live': 'polite' });
    var plot = UI.svg(640, 300, 'Gráfica de la composición con su recta tangente en el punto');
    var plotCap = h('p', { class: 'lab-note' });
    var plotLabel = h('p', { class: 'lab-stack__label' }, ['La composición y su tangente']);
    var refName = h('span', {}, ['composición']);

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        kindSel.node, preset.node, fIn.node, xIn.node, yIn.node, zIn.node, h('div', { class: 'lab-buttons' }, [run]), status,
        sS.node, tS.node, wrtSel.node, h('div', { class: 'lab-buttons' }, [animBtn]),
        modeSel.node, ansExpr.node, ansNum.node, h('div', { class: 'lab-buttons' }, [check]), verdict, facts
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['El árbol de dependencias']),
        treeSvg, steps,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'camino que se recorre']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'camino ya sumado'])
        ]),
        plotLabel, plot, plotCap,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), refName]),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'tangente']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu pendiente'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); build(true); });
    kindSel.input.addEventListener('change', function () {
      var k = KINDS[+kindSel.input.value][0];
      for (var i = 0; i < presets.length; i++) if (presets[i].kind === k) { load(i); return; }
    });
    preset.input.addEventListener('change', function () { load(+preset.input.value); });
    wrtSel.input.addEventListener('change', function () { wrt = +wrtSel.input.value ? 't' : 's'; relabel(); reset(); draw(); });
    modeSel.input.addEventListener('change', function () { mode = MODES[+modeSel.input.value][0]; relabel(); reset(); draw(); });
    ansNum.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); verify(); } });

    function fmtN(v) { return (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(2)).toString().replace('-', '−'); }
    function f2(v) { return isFinite(v) ? (Math.abs(v) < 0.005 ? '0.00' : v.toFixed(2).replace('-', '−')) : '—'; }
    function root() { return P.kind === 'three' ? 'w' : P.kind === 'imp' ? 'F' : 'z'; }
    function params() { return P.kind === 'two' ? ['s', 't'] : P.kind === 'imp' ? ['x'] : ['t']; }
    function dName() {
      if (P.kind === 'imp') return 'dy/dx';
      return (P.kind === 'two' ? '∂' : 'd') + root() + '/' + (P.kind === 'two' ? '∂' : 'd') + wrt;
    }
    function setLabel(field, txt) { var l = field.node.querySelector('.lab-field__label, label'); if (l) l.textContent = txt; }
    function relabel() {
      var two = P.kind === 'two', isImp = P.kind === 'imp', arg = two ? '(s, t)' : '(t)';
      setLabel(fIn, isImp ? 'F(x, y) = 0, con F(x, y) =' : P.kind === 'three' ? 'w = f(x, y, z)' : 'z = f(x, y)');
      setLabel(xIn, 'x' + arg + ' ='); setLabel(yIn, 'y' + arg + ' ='); setLabel(zIn, 'z' + arg + ' =');
      xIn.node.hidden = yIn.node.hidden = isImp;
      zIn.node.hidden = P.kind !== 'three';
      sS.node.hidden = !two;
      wrtSel.node.hidden = !two;
      setLabel(tS, isImp ? 'x₀ (y₀ se ajusta para quedar en la curva)' : 't₀');
      modeSel.node.hidden = isImp;
      if (isImp) mode = 'value';
      ansExpr.node.hidden = mode !== 'expr';
      ansNum.node.hidden = mode !== 'value';
      setLabel(ansExpr, 'Tu ' + dName() + (two ? ' (en s y t)' : ' (en t)'));
      setLabel(ansNum, 'Tu valor de ' + dName() + ' en el punto');
      var hint = ansExpr.node.querySelector('.lab-field__hint');
      if (hint) hint.textContent = two ? 'Solo en s y t: sustituye x(s, t) y y(s, t).' : 'Solo en t: sustituye las funciones de t.';
    }
    function setRange(sl, r, v) {
      sl.input.min = r[0]; sl.input.max = r[1];
      sl.set(Math.max(r[0], Math.min(r[1], v)));
    }
    function fillPresets() {
      preset.input.innerHTML = '';
      presets.forEach(function (p, i) { if (p.kind === P.kind) preset.input.appendChild(h('option', { value: String(i) }, [p.name])); });
    }
    function load(i) {
      P = presets[i];
      kindSel.input.value = String(KINDS.map(function (k) { return k[0]; }).indexOf(P.kind));
      fillPresets();
      preset.input.value = String(i);
      if (P.kind === 'imp') {
        fIn.setMath(P.F);
        setRange(tS, P.range.x, P.x0);
        imp = { F: P.F, y: P.y0 };
      } else {
        fIn.setMath(P.f);
        xIn.setMath(P.inner.x); yIn.setMath(P.inner.y);
        if (P.inner.z) zIn.setMath(P.inner.z);
        if (P.kind === 'two') setRange(sS, P.range.s, P.at.s);
        setRange(tS, P.range.t, P.at.t);
      }
      wrt = 't'; wrtSel.input.value = '1';
      ansNum.input.value = '';
      relabel();
      build(false);
    }
    function stopAnim() { timers.forEach(clearTimeout); timers = []; }
    function reset() { stopAnim(); verdict.hidden = true; shown = false; student = null; hl = -1; done = 0; steps.innerHTML = ''; }
    function moved() {
      reset();
      if (P.kind === 'imp' && imp && math) {
        var y = LM.solveFor(math, imp.F, { x: tS.get(), y: imp.y }, 'y', imp.y);
        if (isFinite(y)) imp.y = y;
      }
      draw();
    }
    function readAt() { at = P.kind === 'two' ? { s: sS.get(), t: tS.get() } : P.kind === 'imp' ? { x: tS.get(), y: imp ? imp.y : P.y0 } : { t: tS.get() }; }

    // fromFields: leer lo escrito en los editores (al pulsar Graficar); si no, usar el ejemplo.
    function build(fromFields) {
      if (!math) return;
      reset();
      try {
        if (P.kind === 'imp') {
          var Fs = fromFields ? String(fIn.get() || '').trim() : P.F;
          if (!Fs) throw new Error('Escribe F(x, y).');
          LM.compile(math, Fs); math.derivative(prep(Fs), 'y');
          var y0 = LM.solveFor(math, Fs, { x: tS.get(), y: imp ? imp.y : P.y0 }, 'y', imp ? imp.y : P.y0);
          if (!isFinite(y0)) throw new Error('No encontré un punto de la curva F = 0 con ese x₀. Mueve x₀ o revisa F.');
          imp = { F: Fs, y: y0 };
          spec = null;
        } else {
          var get = function (fld, d) { return fromFields ? String(fld.get() || '').trim() : d; };
          var s = { f: get(fIn, P.f), inner: { x: get(xIn, P.inner.x), y: get(yIn, P.inner.y) }, params: params() };
          if (P.kind === 'three') s.inner.z = get(zIn, P.inner.z);
          if (!s.f || !s.inner.x || !s.inner.y || (P.kind === 'three' && !s.inner.z)) throw new Error('Completa f y las funciones intermedias.');
          readAt();
          var T = LM.tree(math, s, at, wrt);
          if (!isFinite(T.total) || !isFinite(T.z)) throw new Error('La composición no está definida en ese punto. Mueve el punto o revisa las fórmulas.');
          spec = s;
        }
        status.hidden = true;
      } catch (e) { UI.verdict(status, 'bad', 'No pude armar el árbol', e.message); return; }
      draw();
    }
    function prep(s) { return window.LabMath.core.prep(s); }

    // Datos del árbol: nodos, aristas y caminos (en el orden en que se suman).
    function shape() {
      var r = root(), nodes = [], edges = [], paths = [], ps = params();
      nodes.push({ id: 'r', x: W / 2, y: 40, t: r });
      if (P.kind === 'imp') {
        nodes.push({ id: 'x0', x: 150, y: 250, t: 'x' }, { id: 'y', x: 450, y: 145, t: 'y' }, { id: 'x1', x: 450, y: 250, t: 'x' });
        edges.push({ a: 'r', b: 'x0', t: '∂F/∂x' }, { a: 'r', b: 'y', t: '∂F/∂y' }, { a: 'y', b: 'x1', t: 'dy/dx' });
        paths.push([0], [1, 2]);
        return { nodes: nodes, edges: edges, paths: paths };
      }
      var us = Object.keys(spec ? spec.inner : P.inner), xs = us.length === 3 ? [100, 300, 500] : [150, 450];
      us.forEach(function (u, i) {
        nodes.push({ id: u, x: xs[i], y: 145, t: u });
        var top = edges.length;
        edges.push({ a: 'r', b: u, t: '∂' + r + '/∂' + u });
        var kids = ps.length === 1 ? [[ps[0], xs[i]]] : [[ps[0], xs[i] - 70], [ps[1], xs[i] + 70]];
        kids.forEach(function (k) {
          var dep = !spec || !math || LM.depends(math, spec.inner[u], k[0]);
          nodes.push({ id: u + k[0], x: k[1], y: 250, t: k[0], faint: k[0] !== wrt || !dep });
          edges.push({ a: u, b: u + k[0], t: (ps.length === 1 ? 'd' : '∂') + u + '/' + (ps.length === 1 ? 'd' : '∂') + k[0], faint: k[0] !== wrt || !dep });
          if (k[0] === wrt && dep) paths.push([top, edges.length - 1]);
        });
      });
      return { nodes: nodes, edges: edges, paths: paths };
    }

    /* ---------- Dibujo ---------- */
    function el(tag, attrs, parent, txt) {
      var n = document.createElementNS(NS, tag);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (txt != null) n.textContent = txt;
      parent.appendChild(n);
      return n;
    }
    var BW = 50, BH = 34, FS = 16;
    function drawTree() {
      var S = shape(), byId = {}, pts = [], boxes = [];
      S.nodes.forEach(function (n) { byId[n.id] = n; boxes.push([n.x - BW / 2 - 4, n.y - BH / 2 - 4, n.x + BW / 2 + 4, n.y + BH / 2 + 4]); });
      var active = {}, past = {};
      S.paths.forEach(function (p, i) { p.forEach(function (e) { if (i === hl) active[e] = true; else if (i < done) past[e] = true; }); });
      treeSvg.innerHTML = '';
      var g = el('g', { class: 'sketch' }, treeSvg);
      // Aristas (del borde de abajo del padre al de arriba del hijo).
      S.edges.forEach(function (e, i) {
        var A = byId[e.a], B = byId[e.b], x1 = A.x, y1 = A.y + BH / 2, x2 = B.x, y2 = B.y - BH / 2;
        e.seg = [x1, y1, x2, y2];
        var cls = active[i] ? 'error' : past[i] ? 'aux' : 'axis', w = active[i] ? 4 : past[i] ? 3 : 1.8;
        el('path', { d: 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1), class: cls, fill: 'none', 'stroke-width': w, 'stroke-linecap': 'round', opacity: e.faint ? 0.35 : null }, g);
        var n = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 3);
        for (var k = 0; k <= n; k++) pts.push([x1 + (x2 - x1) * k / n, y1 + (y2 - y1) * k / n]);
      });
      // Nodos.
      var onPath = {};
      S.paths.forEach(function (p, i) { if (i === hl) p.forEach(function (e) { onPath[S.edges[e].a] = onPath[S.edges[e].b] = true; }); });
      S.nodes.forEach(function (n) {
        var grp = el('g', { opacity: n.faint ? 0.35 : null }, g);
        el('rect', { x: n.x - BW / 2, y: n.y - BH / 2, width: BW, height: BH, rx: 8, class: onPath[n.id] ? 'box-err' : 'box-base' }, grp);
        el('text', { x: n.x, y: n.y + 6, class: 'ann', 'text-anchor': 'middle', 'font-size': 19 }, grp, n.t);
      });
      // Etiqueta de cada arista: la primera posición candidata que no toca trazos, nodos ni otras etiquetas.
      var placed = [];
      S.edges.forEach(function (e, i) {
        if (e.faint) return;
        var c = place(e.seg, e.t, pts, boxes.concat(placed));
        if (!c) return;
        placed.push(c.box);
        el('text', { x: c.x, y: c.y, class: 'ann', 'text-anchor': c.anchor, 'font-size': FS, opacity: active[i] || past[i] || hl < 0 ? null : 0.6 }, g, e.t);
      });
    }
    function place(seg, txt, pts, boxes) {
      var w = txt.length * FS * 0.58, dx = seg[2] - seg[0], dy = seg[3] - seg[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      var fr = [0.5, 0.42, 0.58, 0.34, 0.66], offs = [12, 20, 30];
      for (var o = 0; o < offs.length; o++) for (var i = 0; i < fr.length; i++) for (var sd = -1; sd <= 1; sd += 2) {
        var px = seg[0] + dx * fr[i] + sd * nx * offs[o], py = seg[1] + dy * fr[i] + sd * ny * offs[o];
        var side = sd * nx, anchor = side > 0.25 ? 'start' : side < -0.25 ? 'end' : 'middle';
        var x0 = anchor === 'start' ? px : anchor === 'end' ? px - w : px - w / 2, y = py + FS * 0.35;
        var b = [x0 - 3, y - FS * 0.85 - 2, x0 + w + 3, y + FS * 0.3 + 2];
        if (b[0] < 2 || b[2] > W - 2 || b[1] < 2 || b[3] > H - 2) continue;
        if (pts.some(function (p) { return p[0] > b[0] && p[0] < b[2] && p[1] > b[1] && p[1] < b[3]; })) continue;
        if (boxes.some(function (q) { return q[0] < b[2] && q[2] > b[0] && q[1] < b[3] && q[3] > b[1]; })) continue;
        return { x: px, y: y, anchor: anchor, box: b };
      }
      return null;
    }

    // Lista de caminos (HTML): factor de cada arista, producto y suma.
    function stepItem(html) { var li = h('li', { html: html }); steps.appendChild(li); UI.renderMath(li); }
    function dTex(top, bot, partial) { var d = partial ? '\\partial ' : 'd'; return '\\frac{' + d + top + '}{' + d + bot + '}'; }
    function pathText(i) {
      if (P.kind === 'imp') {
        var I = LM.implicit(math, imp.F, at, 'x', 'y');
        return i === 0
          ? 'Camino $F \\to x$: $' + dTex('F', 'x', true) + '\\cdot\\frac{dx}{dx} = (' + f2(I.Fw) + ')(1)$'
          : 'Camino $F \\to y \\to x$: $' + dTex('F', 'y', true) + '\\cdot\\frac{dy}{dx} = (' + f2(I.Fd) + ')\\,y\'$';
      }
      var T = LM.tree(math, spec, at, wrt), q = T.paths[i], r = root(), part = P.kind === 'two';
      return 'Camino $' + r + ' \\to ' + q.u + ' \\to ' + wrt + '$: $' + dTex(r, q.u, true) + '\\cdot' + dTex(q.u, wrt, part) + ' = (' + f2(q.outer) + ')(' + f2(q.inner) + ') = ' + f2(q.prod) + '$';
    }
    function sumText() {
      if (P.kind === 'imp') {
        var I = LM.implicit(math, imp.F, at, 'x', 'y');
        return 'Suma $= 0$ (F no cambia sobre la curva): $' + f2(I.Fw) + ' + (' + f2(I.Fd) + ')\\,y\' = 0 \\Rightarrow y\' = -\\frac{F_x}{F_y} = ' + f2(I.slope) + '$';
      }
      var T = LM.tree(math, spec, at, wrt), lhs = (P.kind === 'two' ? dTex(root(), wrt, true) : dTex(root(), wrt, false));
      return 'Suma de los caminos: $' + lhs + ' = ' + T.paths.map(function (q) { return '(' + f2(q.prod) + ')'; }).join(' + ') + ' = ' + f2(T.total) + '$';
    }
    function animate() {
      if (!math || (!spec && !imp)) return;
      stopAnim(); steps.innerHTML = ''; hl = -1; done = 0;
      var n = shape().paths.length, dt = reduced ? 0 : 1100;
      function at_(k, fn) { if (dt) timers.push(setTimeout(fn, k * dt)); else fn(); }
      for (var i = 0; i < n; i++) (function (i) {
        at_(i, function () { hl = i; done = i; drawTree(); stepItem(pathText(i)); });
      })(i);
      at_(n, function () { hl = -1; done = n; drawTree(); stepItem(sumText()); shown = true; drawFacts(); });
    }

    function verify() {
      if (!math || (!spec && !imp)) return;
      var r, msgs, v;
      readAt();
      if (P.kind === 'imp' || mode === 'value') {
        v = parseFloat(String(ansNum.input.value).replace(',', '.').replace('−', '-'));
        if (!isFinite(v)) { UI.verdict(verdict, 'bad', 'Escribe un número', 'Usa punto decimal; por ejemplo −2.75.'); return; }
        r = P.kind === 'imp' ? LM.diagnoseImplicit(math, imp.F, at, v, 'x', 'y') : LM.diagnoseValue(math, spec, at, wrt, v);
        if (r.kind === 'invalid') { UI.verdict(verdict, 'bad', 'No está definida en ese punto', 'Mueve el punto.'); return; }
        student = v;
      } else {
        var s;
        try { s = String(ansExpr.get() || '').trim(); } catch (e) { UI.verdict(verdict, 'bad', 'Completa el editor', e.message); return; }
        if (!s) { UI.verdict(verdict, 'bad', 'Escribe tu ' + dName(), 'Una expresión en ' + (P.kind === 'two' ? 's y t' : 't') + '.'); return; }
        try { r = LM.diagnoseExpr(math, spec, wrt, s, at); } catch (e) { UI.verdict(verdict, 'bad', 'No pude leer tu expresión', e.message); return; }
        if (r.kind === 'invalid') { UI.verdict(verdict, 'bad', 'No pude evaluar tu expresión', 'Revisa paréntesis y que esté definida cerca del punto.'); return; }
        student = null;
      }
      var want = P.kind === 'imp' ? r.want : LM.tree(math, spec, at, wrt).total;
      var pt = P.kind === 'imp' ? '' : P.kind === 'two' ? '(x(s₀, t₀), y(s₀, t₀))' : P.kind === 'three' ? '(x(t₀), y(t₀), z(t₀))' : '(x(t₀), y(t₀))';
      msgs = {
        correct: ['Tu ' + dName() + ' es correcta', 'Vale ' + UI.fmt(want, 4).replace('-', '−') + ' en el punto: es la pendiente de la tangente en la gráfica.'],
        mixed: ['Correcta, pero falta sustituir', 'Tu expresión todavía tiene x, y (o z). Está bien, pero el resultado final se pide solo en ' + (P.kind === 'two' ? 's y t' : 't') + ': sustituye las funciones intermedias.'],
        missing: ['Te faltó un camino', 'El árbol tiene ' + shape().paths.length + ' caminos de ' + root() + ' a ' + wrt + ' y tu suma tiene uno menos. Pulsa «Armar la derivada» y cuenta las ramas.'],
        product: ['Multiplicaste los caminos', 'Dentro de un camino se multiplica; entre caminos distintos se suma. ' + dName() + ' es la suma de los productos.'],
        atParam: ['Evaluaste las parciales en el lugar equivocado', 'Las parciales de afuera se evalúan en el punto ' + pt + ', no en el valor del parámetro. Primero calcula x y y en el parámetro.'],
        outerOnly: ['Te faltaron los factores de adentro', 'Cada camino lleva dos factores: la parcial de afuera y la derivada de la intermedia respecto a ' + wrt + '.'],
        sign: ['Casi: tu signo está invertido', 'Revisa los signos al derivar las funciones intermedias (por ejemplo, la derivada de cos t es −sen t).'],
        factor: ['Casi: te sobra o falta un factor', 'Tu resultado sale ' + UI.fmt(r.k || 0, 4) + ' veces el real. Revisa la derivada de cada intermedia.'],
        inverted: ['Invertiste el cociente', 'Es −F_x/F_y: arriba va la parcial respecto a la variable de la que depende todo (x), abajo la de y.'],
        invSign: ['Invertiste el cociente y el signo', 'Es dy/dx = −F_x/F_y, con signo menos y F_x arriba.'],
        mismatch: ['No coincide', 'Dibuja el árbol, multiplica a lo largo de cada camino y suma los caminos.']
      };
      if (P.kind === 'imp') msgs.sign = ['Te faltó el signo menos', 'De F_x + F_y·y′ = 0 se despeja y′ = −F_x/F_y: el signo menos viene de pasar F_x al otro lado.'];
      var m = msgs[r.reason] || msgs.mismatch;
      UI.verdict(verdict, r.kind === 'ok' ? (r.reason === 'mixed' ? 'warn' : 'ok') : r.kind === 'warn' ? 'warn' : 'bad', m[0], m[1]);
      shown = true;
      drawPlot(); drawFacts();
    }

    function drawFacts() {
      facts.innerHTML = '';
      var rows = [];
      if (P.kind === 'imp') {
        rows.push(['punto en la curva', '(' + fmtN(at.x) + ', ' + UI.fmt(at.y, 4) + ')']);
        if (shown) {
          rows.push(['pendiente numérica de la curva', UI.fmt(LM.implicitNum(math, imp.F, at, 'x', 'y'), 6)]);
          rows.push(['−F_x/F_y', UI.fmt(LM.implicit(math, imp.F, at, 'x', 'y').slope, 6)]);
        }
      } else {
        var T = LM.tree(math, spec, at, wrt), p = T.point;
        rows.push(['punto intermedio', '(' + Object.keys(p).map(function (u) { return UI.fmt(p[u], 4); }).join(', ') + ')']);
        rows.push([root() + ' en el punto', UI.fmt(T.z, 5)]);
        rows.push(['caminos hacia ' + wrt, String(T.paths.length)]);
        if (shown) {
          rows.push([dName() + ' por el árbol', UI.fmt(T.total, 6)]);
          rows.push(['derivada numérica de la composición', UI.fmt(LM.numDeriv(math, spec, at, wrt), 6)]);
        }
      }
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', { html: r[1] })); });
    }

    // Gráfica: z(t) (o el corte z(s, t₀)/z(s₀, t)) con su tangente; en la implícita, la curva F = 0.
    function drawPlot() {
      if (P.kind === 'imp') { drawCurve(); return; }
      var rg = P.range[wrt] || [at[wrt] - 2, at[wrt] + 2], Z = LM.compose(math, spec);
      var g = function (u) { var q = Object.assign({}, at); q[wrt] = u; return Z(q); };
      var vals = [], i;
      for (i = 0; i <= 120; i++) vals.push(g(rg[0] + (rg[1] - rg[0]) * i / 120));
      var z0 = g(at[wrt]), m = LM.tree(math, spec, at, wrt).total, yr = yRange(vals.concat([z0]));
      var p = window.LabPlot(plot, { x: rg, y: yr });
      p.clear(); p.grid(); p.axes();
      p.curve(g, 'ref', 3.2);
      var d = (rg[1] - rg[0]) * 0.25;
      plotLabel.textContent = P.kind === 'two' ? 'Un corte de la composición y su tangente' : 'La composición y su tangente';
      refName.textContent = 'composición';
      if (isFinite(m)) p.curve(function (u) { return z0 + m * (u - at[wrt]); }, 'trace', 2.6, null, Math.max(rg[0], at[wrt] - d), Math.min(rg[1], at[wrt] + d));
      if (student != null) p.curve(function (u) { return z0 + student * (u - at[wrt]); }, 'student', 2.4, '7 5', Math.max(rg[0], at[wrt] - d), Math.min(rg[1], at[wrt] + d));
      p.point(at[wrt], z0, 'dot-trace', 6);
      var r = root();
      plotCap.textContent = P.kind === 'two'
        ? 'Corte con ' + (wrt === 's' ? 't = ' + fmtN(at.t) : 's = ' + fmtN(at.s)) + ': ' + r + ' como función de ' + wrt + '. Horizontal: ' + wrt + ' · vertical: ' + r + '. La pendiente de la tangente es ∂' + r + '/∂' + wrt + '.'
        : r + '(t) = f(x(t), y(t)' + (P.kind === 'three' ? ', z(t)' : '') + '). Horizontal: t · vertical: ' + r + '. La pendiente de la tangente en t₀ es d' + r + '/dt.';
    }
    function yRange(vals) {
      var ys = vals.filter(function (v) { return isFinite(v); }).sort(function (a, b) { return a - b; });
      if (!ys.length) return [-1, 1];
      var lo = ys[Math.floor(ys.length * 0.02)], hi = ys[Math.ceil(ys.length * 0.98) - 1];
      if (hi - lo < 1) { var c = (hi + lo) / 2; lo = c - 0.5; hi = c + 0.5; }
      var pad = (hi - lo) * 0.12;
      return [lo - pad, hi + pad];
    }
    // Curva de nivel F = 0 por cuadrados marchantes, con la tangente en el punto.
    function drawCurve() {
      var w = P.w, F = LM.compile(math, imp.F), n = 90, segs = [], i, j;
      var p = window.LabPlot(plot, { x: [w[0], w[1]], y: [w[2], w[3]], equal: true });
      var xr = p.xr, yr = p.yr, dx = (xr[1] - xr[0]) / n, dy = (yr[1] - yr[0]) / n, val = [];
      for (i = 0; i <= n; i++) { val.push([]); for (j = 0; j <= n; j++) val[i].push(F({ x: xr[0] + i * dx, y: yr[0] + j * dy })); }
      function cut(a, b, pa, pb) { var t = a / (a - b); return [pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t]; }
      for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
        var c = [[xr[0] + i * dx, yr[0] + j * dy], [xr[0] + (i + 1) * dx, yr[0] + j * dy], [xr[0] + (i + 1) * dx, yr[0] + (j + 1) * dy], [xr[0] + i * dx, yr[0] + (j + 1) * dy]];
        var v = [val[i][j], val[i + 1][j], val[i + 1][j + 1], val[i][j + 1]], hits = [];
        if (!v.every(isFinite)) continue;
        for (var k = 0; k < 4; k++) { var a = v[k], b = v[(k + 1) % 4]; if ((a < 0) !== (b < 0)) hits.push(cut(a, b, c[k], c[(k + 1) % 4])); }
        if (hits.length === 2) segs.push(hits);
        if (hits.length === 4) segs.push([hits[0], hits[1]], [hits[2], hits[3]]);
      }
      p.clear(); p.grid(); p.axes();
      if (segs.length) p.segments(segs, 'ref', 3);
      var m = LM.implicit(math, imp.F, at, 'x', 'y').slope, d = (xr[1] - xr[0]) * 0.18 / Math.sqrt(1 + (isFinite(m) ? m * m : 0));
      plotLabel.textContent = 'La curva F(x, y) = 0 y su tangente';
      refName.textContent = 'curva F = 0';
      if (isFinite(m)) p.curve(function (x) { return at.y + m * (x - at.x); }, 'trace', 2.6, null, at.x - d, at.x + d);
      if (student != null) {
        var ds = (xr[1] - xr[0]) * 0.18 / Math.sqrt(1 + student * student);
        p.curve(function (x) { return at.y + student * (x - at.x); }, 'student', 2.4, '7 5', at.x - ds, at.x + ds);
      }
      p.point(at.x, at.y, 'dot-trace', 6);
      plotCap.textContent = 'La curva F(x, y) = 0 y su tangente en (x₀, y₀). Su pendiente es dy/dx = −F_x/F_y.';
    }

    function draw() {
      if (!math || (!spec && !imp)) return;
      readAt();
      drawTree(); drawPlot(); drawFacts();
    }

    document.addEventListener('cb:themechange', function () { if (math) draw(); });
    load(start);
    if (cfg.mode) { mode = cfg.mode; modeSel.input.value = String(mode === 'expr' ? 1 : 0); relabel(); }
    return UI.loadMath().then(function (m) { math = m; build(false); });
  };
})();
