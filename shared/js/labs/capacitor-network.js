/* =====================================================================
   Lab capacitor-network (Física 2 · S10): reduce la red.
   Una red de 2 a 5 capacitores conectada a una batería. El alumno elige dos
   capacitores que estén en serie o en paralelo y el lab los combina (si no lo
   están, explica por qué). Con la red reducida escribe C_eq, la carga, el voltaje
   o la energía de un capacitor; el «casi» reconoce los errores típicos:
     swap     sumó en serie como si fuera paralelo (o al revés)
     vTotal   usó el voltaje de la batería en un capacitor que no lo tiene
     qTotal   usó la carga total en un capacitor que no la lleva
     noHalf   energía sin el ½
   Al final el lab «desarma» la red y muestra Q y V de cada capacitor.

   LabMath.capnet (pura, sin DOM). Unidades de la UI: C en μF, V en volts, así que
   Q = CV sale en μC y U = ½CV² en μJ.
     Red como árbol: hoja { id: 'C1', c } · grupo { t: 's' | 'p', k: [hijos] }.
     nodal({ nodes, branches: [{ a, b, value }], fixed: { nodo: V }, inject }) → potenciales
       Solver nodal genérico (Σ value·(V_i − V_j) = inyección en cada nodo libre),
       con eliminación de Gauss propia. Sirve igual para conductancias (bloque C).
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  function leaf(id, c) { return { id: id, c: c }; }
  function S() { return { t: 's', k: Array.prototype.slice.call(arguments) }; }
  function P() { return { t: 'p', k: Array.prototype.slice.call(arguments) }; }
  function isLeaf(t) { return !t.k; }
  function clone(t) { return isLeaf(t) ? { id: t.id, c: t.c } : { t: t.t, k: t.k.map(clone) }; }

  // Capacidad equivalente. flip(nodo) → true cambia serie por paralelo en ese nodo (para los errores).
  function eqWith(t, flip) {
    if (isLeaf(t)) return t.c;
    var type = flip && flip(t) ? (t.t === 's' ? 'p' : 's') : t.t;
    var vals = t.k.map(function (x) { return eqWith(x, flip); });
    if (type === 'p') return vals.reduce(function (s, x) { return s + x; }, 0);
    return 1 / vals.reduce(function (s, x) { return s + 1 / x; }, 0);
  }
  function eq(t) { return eqWith(t, null); }
  function series(cs) { return eq({ t: 's', k: cs.map(function (c, i) { return leaf('x' + i, c); }) }); }
  function parallel(cs) { return eq({ t: 'p', k: cs.map(function (c, i) { return leaf('x' + i, c); }) }); }

  function leaves(t) { return isLeaf(t) ? [t] : t.k.reduce(function (o, x) { return o.concat(leaves(x)); }, []); }
  function groups(t) { return isLeaf(t) ? [] : [t].concat(t.k.reduce(function (o, x) { return o.concat(groups(x)); }, [])); }
  function find(t, id) { var l = leaves(t); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }

  // Reparto: cada elemento de la red (hojas y grupos) con su C, Q, V y U. Los grupos se
  // identifican por la lista de hojas que contienen.
  function solveWith(t, V, flip) {
    var parts = {}, groupsOut = [];
    function go(n, v) {
      var C = eqWith(n, flip), q = C * v, rec = { C: C, Q: q, V: v, U: 0.5 * C * v * v };
      if (isLeaf(n)) { parts[n.id] = rec; return; }
      rec.ids = leaves(n).map(function (x) { return x.id; });
      groupsOut.push(rec);
      var type = flip && flip(n) ? (n.t === 's' ? 'p' : 's') : n.t;
      n.k.forEach(function (x) { go(x, type === 'p' ? v : q / eqWith(x, flip)); });
    }
    go(t, V);
    var C = eqWith(t, flip), U = 0;
    Object.keys(parts).forEach(function (id) { U += parts[id].U; });
    return { C: C, Q: C * V, V: V, U: 0.5 * C * V * V, sumU: U, parts: parts, groups: groupsOut };
  }
  function solve(t, V) { return solveWith(t, V, null); }

  function normalize(t) {
    if (isLeaf(t)) return t;
    var kids = [];
    t.k.map(normalize).forEach(function (x) {
      if (!isLeaf(x) && x.t === t.t) kids = kids.concat(x.k); else kids.push(x);
    });
    return kids.length === 1 ? kids[0] : { t: t.t, k: kids };
  }
  // Camino de nodos desde la raíz hasta la hoja id (incluida la hoja).
  function pathTo(t, id) {
    if (isLeaf(t)) return t.id === id ? [t] : null;
    for (var i = 0; i < t.k.length; i++) { var p = pathTo(t.k[i], id); if (p) return [t].concat(p); }
    return null;
  }
  // ¿Cómo están conectados dos elementos de la red actual?
  //   kind 'series' | 'parallel' (hermanos directos en un grupo) | 'none' | 'same' | 'missing'
  //   lca: tipo del grupo que los contiene a ambos; groupA, groupB: hojas de la rama de cada uno.
  function relation(t, a, b) {
    if (a === b) return { kind: 'same' };
    var pa = pathTo(t, a), pb = pathTo(t, b);
    if (!pa || !pb) return { kind: 'missing' };
    var i = 0;
    while (i < pa.length && i < pb.length && pa[i] === pb[i]) i++;
    var lca = pa[i - 1], ca = pa[i], cb = pb[i];
    var ids = function (n) { return leaves(n).map(function (x) { return x.id; }); };
    var r = { lca: lca.t, groupA: ids(ca), groupB: ids(cb), deepA: !isLeaf(ca), deepB: !isLeaf(cb) };
    r.kind = isLeaf(ca) && isLeaf(cb) ? (lca.t === 's' ? 'series' : 'parallel') : 'none';
    return r;
  }
  function mergedId(a, b) {
    var d = (a.replace(/^C/, '') + b.replace(/^C/, '')).split('').sort().join('');
    return 'C' + d;
  }
  // Combina dos elementos en serie o en paralelo. Devuelve null si no se puede.
  function combine(t, a, b) {
    var r = relation(t, a, b);
    if (r.kind !== 'series' && r.kind !== 'parallel') return null;
    var nt = clone(t), pa = pathTo(nt, a), parent = pa[pa.length - 2];
    var A = find(nt, a), B = find(nt, b), id = mergedId(a, b);
    var c = r.kind === 'series' ? series([A.c, B.c]) : parallel([A.c, B.c]);
    var ia = parent.k.indexOf(A), ib = parent.k.indexOf(B);
    parent.k[Math.min(ia, ib)] = leaf(id, c);
    parent.k.splice(Math.max(ia, ib), 1);
    return { tree: normalize(nt), kind: r.kind, id: id, c: c };
  }

  // Red como nodos y ramas: terminales 'a' (+) y 'b' (−), nodos internos n1, n2…
  function graph(t) {
    var nodes = ['a', 'b'], branches = [], n = 0;
    function walk(x, p, q) {
      if (isLeaf(x)) { branches.push({ a: p, b: q, value: x.c, id: x.id }); return; }
      if (x.t === 'p') { x.k.forEach(function (y) { walk(y, p, q); }); return; }
      var prev = p;
      x.k.forEach(function (y, i) {
        var nxt = i === x.k.length - 1 ? q : 'n' + (++n);
        if (nxt !== q) nodes.push(nxt);
        walk(y, prev, nxt);
        prev = nxt;
      });
    }
    walk(t, 'a', 'b');
    return { nodes: nodes, branches: branches };
  }

  // Solver nodal genérico. En cada nodo libre i: Σ_ramas value·(V_i − V_j) = inject_i (0 por omisión).
  // Para capacitores descargados al conectar, es la conservación de la carga en cada nodo aislado.
  function nodal(net) {
    var fixed = net.fixed || {}, inj = net.inject || {};
    var free = net.nodes.filter(function (n) { return !Object.prototype.hasOwnProperty.call(fixed, n); });
    var idx = {}, m = free.length;
    free.forEach(function (n, i) { idx[n] = i; });
    var A = [], rhs = [];
    for (var i = 0; i < m; i++) { A.push(new Array(m).fill(0)); rhs.push(inj[free[i]] || 0); }
    net.branches.forEach(function (br) {
      [[br.a, br.b], [br.b, br.a]].forEach(function (e) {
        if (!(e[0] in idx)) return;
        var r = idx[e[0]];
        A[r][r] += br.value;
        if (e[1] in idx) A[r][idx[e[1]]] -= br.value; else rhs[r] += br.value * fixed[e[1]];
      });
    });
    var x = gauss(A, rhs), out = {};
    Object.keys(fixed).forEach(function (n) { out[n] = fixed[n]; });
    free.forEach(function (n, i) { out[n] = x[i]; });
    return out;
  }
  // Eliminación de Gauss con pivoteo parcial. Matriz singular → NaN.
  function gauss(A0, b0) {
    var n = b0.length, A = A0.map(function (r) { return r.slice(); }), b = b0.slice();
    for (var c = 0; c < n; c++) {
      var p = c;
      for (var r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      if (!(Math.abs(A[p][c]) > 1e-300)) return new Array(n).fill(NaN);
      var tmp = A[c]; A[c] = A[p]; A[p] = tmp; var tb = b[c]; b[c] = b[p]; b[p] = tb;
      for (var r2 = c + 1; r2 < n; r2++) {
        var f = A[r2][c] / A[c][c];
        if (!f) continue;
        for (var k = c; k < n; k++) A[r2][k] -= f * A[c][k];
        b[r2] -= f * b[c];
      }
    }
    var x = new Array(n);
    for (var i = n - 1; i >= 0; i--) {
      var s = b[i];
      for (var j = i + 1; j < n; j++) s -= A[i][j] * x[j];
      x[i] = s / A[i][i];
    }
    return x;
  }

  // Respuesta real y errores típicos (unidades de la UI: μF, V, μC, μJ).
  // kind: 'C' (C_eq) | 'Q' | 'V' | 'U' (de un capacitor) | 'Ut' (energía total).
  function answers(kind, t, V, id) {
    var s = solve(t, V), p = s.parts[id] || s.parts[leaves(t)[0].id];
    var flips = groups(t).map(function (g) { return function (n) { return n === g; }; }).concat([function () { return true; }]);
    var swaps = flips.map(function (f) { return eqWith(t, f); });
    if (kind === 'C') return { truth: s.C, swap: swaps };
    if (kind === 'Q') return { truth: p.Q, vTotal: p.C * V, qTotal: s.Q };
    if (kind === 'V') return { truth: p.V, vTotal: V, qTotal: s.Q / p.C };
    if (kind === 'U') return { truth: p.U, noHalf: 2 * p.U, vTotal: 0.5 * p.C * V * V };
    return { truth: s.U, noHalf: 2 * s.U, swap: swaps.map(function (c) { return 0.5 * c * V * V; }) };
  }
  function close(a, b, tol) { return Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-12); }
  // Un error solo cuenta si su valor se distingue del real (2 %).
  function diagnose(kind, t, V, id, student) {
    if (!isFinite(student)) return 'bad';
    var r = answers(kind, t, V, id), tol = 0.01;
    if (close(student, r.truth, tol)) return 'ok';
    var order = ['swap', 'noHalf', 'vTotal', 'qTotal'];
    for (var i = 0; i < order.length; i++) {
      var vals = r[order[i]];
      if (vals == null) continue;
      vals = [].concat(vals);
      for (var j = 0; j < vals.length; j++) {
        if (close(vals[j], r.truth, 0.02)) continue;
        if (close(student, vals[j], tol)) return order[i];
      }
    }
    return 'bad';
  }

  // Red al azar con n hojas (2 a 5): grupos alternados serie/paralelo.
  var NICE = [1, 2, 3, 4, 5, 6, 8, 10, 12];
  function random(rnd, n) {
    var count = 0;
    function gen(m, type) {
      if (m === 1) { count++; return leaf('C' + count, NICE[Math.floor(rnd() * NICE.length)]); }
      var k = Math.min(m, rnd() < 0.7 ? 2 : 3), parts = new Array(k).fill(1), rest = m - k;
      while (rest-- > 0) parts[Math.floor(rnd() * k)]++;
      var other = type === 's' ? 'p' : 's';
      return { t: type, k: parts.map(function (q) { return gen(q, other); }) };
    }
    return normalize(gen(n, rnd() < 0.5 ? 's' : 'p'));
  }

  // Geometría del circuito (px del viewBox). Hoja: caja w × h con la línea de las terminales en t.
  var LEAF = { w: 112, h: 104, t: 42 }, STUB = 24, GAP = 4;
  function layout(t) {
    if (isLeaf(t)) return { w: LEAF.w, h: LEAF.h, t: LEAF.t, caps: [{ id: t.id, c: t.c, x: 0, y: 0 }], wires: [], dots: [] };
    var kids = t.k.map(layout), out = { caps: [], wires: [], dots: [] };
    function put(L, dx, dy) {
      L.caps.forEach(function (c) { out.caps.push({ id: c.id, c: c.c, x: c.x + dx, y: c.y + dy }); });
      L.wires.forEach(function (w) { out.wires.push([w[0] + dx, w[1] + dy, w[2] + dx, w[3] + dy]); });
      L.dots.forEach(function (d) { out.dots.push([d[0] + dx, d[1] + dy]); });
    }
    if (t.t === 's') {
      var top = Math.max.apply(null, kids.map(function (L) { return L.t; }));
      var below = Math.max.apply(null, kids.map(function (L) { return L.h - L.t; }));
      var x = 0;
      kids.forEach(function (L) { put(L, x, top - L.t); x += L.w; });
      out.w = x; out.t = top; out.h = top + below;
      return out;
    }
    var maxW = Math.max.apply(null, kids.map(function (L) { return L.w; })), y = 0, W = maxW + 2 * STUB, ys = [];
    kids.forEach(function (L, i) {
      var dx = STUB + (maxW - L.w) / 2, ty = y + L.t;
      put(L, dx, y);
      out.wires.push([0, ty, dx, ty], [dx + L.w, ty, W, ty]);
      ys.push(ty);
      if (i < kids.length - 1) { out.dots.push([0, ty], [W, ty]); }
      y += L.h + GAP;
    });
    out.wires.push([0, ys[0], 0, ys[ys.length - 1]], [W, ys[0], W, ys[ys.length - 1]]);
    out.w = W; out.h = y - GAP; out.t = ys[0];
    return out;
  }
  // Circuito completo con la batería abajo: viewBox de al menos 560 × 300, centrado.
  function circuit(t) {
    var L = layout(t), side = 46, M = 18;
    var natW = L.w + 2 * (M + side), W = Math.max(560, natW), ox = (W - L.w) / 2;
    var oy = M, bottom = oy + L.h + 34, H = Math.max(300, bottom + 52);
    var xl = ox - side, xr = ox + L.w + side, ty = oy + L.t, xc = W / 2;
    var o = { W: W, H: H, caps: [], wires: [], dots: [] };
    L.caps.forEach(function (c) { o.caps.push({ id: c.id, c: c.c, x: c.x + ox, y: c.y + oy, w: LEAF.w, h: LEAF.h, t: LEAF.t }); });
    L.wires.forEach(function (w) { o.wires.push([w[0] + ox, w[1] + oy, w[2] + ox, w[3] + oy]); });
    L.dots.forEach(function (d) { o.dots.push([d[0] + ox, d[1] + oy]); });
    o.wires.push([xl, ty, ox, ty], [ox + L.w, ty, xr, ty], [xl, ty, xl, bottom], [xr, ty, xr, bottom],
      [xl, bottom, xc - 6, bottom], [xc + 6, bottom, xr, bottom]);
    o.battery = { x: xc, y: bottom };
    return o;
  }

  var PRESETS = [
    { name: 'Dos en serie', V: 12, ask: 'C2', tree: S(leaf('C1', 6), leaf('C2', 3)) },
    { name: 'Tres en paralelo', V: 10, ask: 'C3', tree: P(leaf('C1', 2), leaf('C2', 4), leaf('C3', 6)) },
    { name: 'Mixta de tres', V: 12, ask: 'C2', tree: S(leaf('C1', 6), P(leaf('C2', 1), leaf('C3', 2))) },
    { name: 'Mixta de cuatro', V: 18, ask: 'C1', tree: S(P(S(leaf('C1', 3), leaf('C2', 6)), leaf('C3', 4)), leaf('C4', 3)) },
    { name: 'Mixta de cinco', V: 12, ask: 'C2', tree: P(S(P(leaf('C1', 2), leaf('C2', 4)), leaf('C3', 3)), S(leaf('C4', 6), leaf('C5', 3))) }
  ];

  window.LabMath.capnet = {
    leaf: leaf, S: S, P: P, isLeaf: isLeaf, clone: clone,
    eq: eq, eqWith: eqWith, series: series, parallel: parallel,
    leaves: leaves, groups: groups, find: find, solve: solve, solveWith: solveWith,
    normalize: normalize, relation: relation, combine: combine, mergedId: mergedId,
    graph: graph, nodal: nodal, gauss: gauss,
    answers: answers, diagnose: diagnose, random: random,
    layout: layout, circuit: circuit, LEAF: LEAF, PRESETS: PRESETS
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var SUB = '₀₁₂₃₄₅₆₇₈₉';
  function plain(id) { return id === 'eq' ? 'C_eq' : 'C' + id.slice(1).split('').map(function (d) { return SUB[+d]; }).join(''); }
  var MSG = {
    ok: ['Coincide', 'Tu resultado es el del lab.'],
    swap: ['Cambiaste serie por paralelo', 'En paralelo las capacidades se suman (C = C₁ + C₂). En serie se suman los inversos (1/C = 1/C₁ + 1/C₂): el resultado es menor que el más chico. Revisa cada grupo.'],
    vTotal: ['Ese capacitor no tiene todo el voltaje', 'Usaste el voltaje de la batería. En serie el voltaje se reparte: cada capacitor tiene V = Q/C, con la carga de su rama.'],
    qTotal: ['Ese capacitor no lleva toda la carga', 'Usaste la carga total Q = C_eq·V. En paralelo la carga se reparte entre las ramas; en serie, todos llevan la de su rama. Desarma la red paso a paso.'],
    noHalf: ['Te faltó el ½', 'La energía es U = ½CV² = Q²/2C = ½QV. Sin el ½ sale el doble.'],
    bad: ['No coincide', 'Reduce la red hasta un solo capacitor, calcula Q = C_eq·V y luego desarma: en serie todos llevan la misma Q; en paralelo todos tienen el mismo V.']
  };

  window.Labs['capacitor-network'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, CN = window.LabMath.capnet;
    var seed = 12345;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    var presetIdx = cfg.preset != null ? cfg.preset : 2;
    var base, Vbat, ask, stack, view, selected = [], checked = false;

    var opts = CN.PRESETS.map(function (p) { return p.name; }).concat(['Al azar']);
    var pSel = UI.select({ label: 'Red', options: opts });
    var vS = UI.slider({ label: 'Batería', min: 3, max: 24, step: 1, value: 12, unit: 'V' }, function () { Vbat = vS.get(); refresh(); });
    var newBtn = UI.button('Otra red al azar', 'ghost', function () { pSel.input.value = String(CN.PRESETS.length); load(); });
    var aSel = UI.select({ label: 'Primer capacitor', options: ['—'] });
    var bSel = UI.select({ label: 'Segundo capacitor', options: ['—'] });
    var combBtn = UI.button('Combinar', 'primary', doCombine);
    var undoBtn = UI.button('Deshacer', 'ghost', function () { if (stack.length > 1 && view === stack.length - 1) { stack.pop(); view = stack.length - 1; selected = []; log.removeChild(log.lastChild); stepV.hidden = true; refresh(); } });
    var resetBtn = UI.button('Empezar de nuevo', 'ghost', function () { restart(); refresh(); });
    var unpackBtn = UI.button('Desarmar un paso', 'primary', function () { if (view > 0) { view--; selected = []; refresh(); } });
    var stepV = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var log = h('ol', { class: 'cn-log' });
    var kSel = UI.select({ label: '¿Qué calculas?', options: ['x'] });
    var askBtn = UI.button('Pregunta por otro capacitor', 'ghost', function () {
      var ids = CN.leaves(base).map(function (x) { return x.id; });
      ask = ids[(ids.indexOf(ask) + 1) % ids.length]; fillKinds(); verdict.hidden = true; checked = false;
    });
    var aIn = UI.input({ label: 'Tu resultado', type: 'number', step: 'any', inputmode: 'decimal', mono: false, hint: 'Unidades: capacidad en μF, carga en μC, voltaje en V y energía en μJ (μF × V² = μJ).' });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var status = h('p', { class: 'lab-note cn-status' });
    var svg = UI.svg(560, 300, 'Red de capacitores conectada a una batería');
    svg.classList.add('cn-stage');

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        pSel.node, vS.node, h('div', { class: 'lab-buttons' }, [newBtn]),
        h('p', { class: 'lab-field__label cn-head' }, ['1 · Reduce la red']),
        h('div', { class: 'lab-row' }, [aSel.node, bSel.node]),
        h('div', { class: 'lab-buttons' }, [combBtn, undoBtn, resetBtn]), stepV, log,
        h('p', { class: 'lab-field__label cn-head' }, ['2 · Calcula']),
        kSel.node, h('div', { class: 'lab-buttons' }, [askBtn]), aIn.node, h('div', { class: 'lab-buttons' }, [run]), note, verdict,
        h('p', { class: 'lab-field__label cn-head' }, ['3 · Desarma la red']),
        h('div', { class: 'lab-buttons' }, [unpackBtn]),
        h('details', { class: 'cn-details' }, [h('summary', {}, ['Ver los valores del lab']), facts])
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Toca dos capacitores para elegirlos']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'capacitor']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'elegido']),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'equivalente'])
        ]),
        status
      ])
    ]));
    var form = mount.querySelector('form');
    form.addEventListener('submit', function (e) { e.preventDefault(); check(); });
    aIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    pSel.input.addEventListener('change', load);
    kSel.input.addEventListener('change', function () { verdict.hidden = true; checked = false; });
    [aSel, bSel].forEach(function (s, i) {
      s.input.addEventListener('change', function () { selected[i] = s.input.value === '' ? null : s.input.value; selected = selected.filter(Boolean); draw(); });
    });

    function cur() { return stack[view]; }
    function restart() { stack = [CN.clone(base)]; view = 0; selected = []; log.innerHTML = ''; stepV.hidden = true; }
    function load() {
      var i = +pSel.input.value;
      if (i < CN.PRESETS.length) { var p = CN.PRESETS[i]; base = CN.clone(p.tree); Vbat = p.V; ask = p.ask; }
      else {
        base = CN.random(rnd, 2 + Math.floor(rnd() * 4)); Vbat = [6, 9, 12, 18, 24][Math.floor(rnd() * 5)];
        var ids = CN.leaves(base).map(function (x) { return x.id; }); ask = ids[Math.floor(rnd() * ids.length)];
      }
      vS.set(Vbat); restart(); fillKinds(); verdict.hidden = true; checked = false; aIn.input.value = '';
      note.textContent = 'Combina de dos en dos hasta que quede un solo capacitor. Luego calcula y comprueba.';
      refresh();
    }
    function fillKinds() {
      var n = plain(ask), keep = kSel.input.value;
      var labels = ['C_eq de toda la red (μF)', 'Carga de ' + n + ' (μC)', 'Voltaje de ' + n + ' (V)', 'Energía de ' + n + ' (μJ)', 'Energía total (μJ)'];
      kSel.input.innerHTML = '';
      labels.forEach(function (l, i) { kSel.input.appendChild(h('option', { value: String(i) }, [l])); });
      kSel.input.value = keep && +keep < 5 ? keep : '0';
    }
    function kind() { return ['C', 'Q', 'V', 'U', 'Ut'][+kSel.input.value]; }
    function fillPicks() {
      var ids = CN.leaves(cur()).map(function (x) { return x.id; });
      [aSel, bSel].forEach(function (s, i) {
        s.input.innerHTML = '';
        s.input.appendChild(h('option', { value: '' }, ['—']));
        ids.forEach(function (id) { s.input.appendChild(h('option', { value: id }, [plain(id)])); });
        s.input.value = selected[i] || '';
        s.input.disabled = ids.length < 2 || view < stack.length - 1;
      });
      combBtn.disabled = ids.length < 2 || view < stack.length - 1;
      undoBtn.disabled = stack.length < 2 || view < stack.length - 1;
      unpackBtn.disabled = !(stack.length > 1 && CN.isLeaf(stack[stack.length - 1]) && view > 0);
    }

    function el(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n);
      return n;
    }
    // Texto con subíndices: partes [[texto, sub?], …].
    function txt(x, y, parts, size, anchor, parent) {
      var t = el('text', { x: x, y: y, 'class': 'ann', 'text-anchor': anchor || 'middle', 'font-size': size || 15 }, parent);
      parts.forEach(function (p) {
        var s = document.createElementNS(NS, 'tspan');
        if (p[1]) { s.setAttribute('dy', '4'); s.setAttribute('font-size', '72%'); }
        s.textContent = p[0];
        t.appendChild(s);
        if (p[1]) { var back = document.createElementNS(NS, 'tspan'); back.setAttribute('dy', '-4'); back.textContent = ''; t.appendChild(back); }
      });
      return t;
    }
    function nameParts(id, final) { return final ? [['C'], ['eq', true]] : [['C'], [id.slice(1), true]]; }
    function f3(v) { return UI.fmt(v, 3); }

    function draw() {
      fillPicks();
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var tree = cur(), G = CN.circuit(tree), sol = CN.solve(tree, Vbat);
      var showQV = view < stack.length - 1 || CN.isLeaf(tree);
      svg.setAttribute('viewBox', '0 0 ' + G.W + ' ' + G.H);
      var g = el('g', {});
      G.wires.forEach(function (w) { el('path', { d: 'M' + w[0] + ' ' + w[1] + 'L' + w[2] + ' ' + w[3], 'class': 'axis', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, g); });
      G.dots.forEach(function (d) { el('circle', { cx: d[0], cy: d[1], r: 4.5, 'class': 'dot-ref' }, g); });
      G.caps.forEach(function (c) {
        var cx = c.x + c.w / 2, cy = c.y + c.t, sel = selected.indexOf(c.id) >= 0;
        var combined = c.id.length > 2 || (CN.isLeaf(tree) && stack.length > 1);
        var cls = sel ? 'error' : combined ? 'trace' : 'ref';
        el('path', { d: 'M' + c.x + ' ' + cy + 'L' + (cx - 6) + ' ' + cy + 'M' + (cx + 6) + ' ' + cy + 'L' + (c.x + c.w) + ' ' + cy, 'class': 'axis', 'stroke-width': 2.4, fill: 'none' }, g);
        el('path', { d: 'M' + (cx - 6) + ' ' + (cy - 16) + 'L' + (cx - 6) + ' ' + (cy + 16) + 'M' + (cx + 6) + ' ' + (cy - 16) + 'L' + (cx + 6) + ' ' + (cy + 16), 'class': cls, 'stroke-width': sel ? 5 : 4, fill: 'none', 'stroke-linecap': 'round' }, g);
        var final = CN.isLeaf(tree) && stack.length > 1;
        txt(cx, cy - 26, nameParts(c.id, final).concat([[' = ' + f3(c.c) + ' μF']]), 15, 'middle', g);
        if (showQV) {
          var p = sol.parts[c.id];
          txt(cx, cy + 38, [['Q = ' + f3(p.Q) + ' μC']], 14, 'middle', g);
          txt(cx, cy + 56, [['V = ' + f3(p.V) + ' V']], 14, 'middle', g);
        }
        el('rect', { x: c.x + 6, y: c.y, width: c.w - 12, height: c.h, 'class': 'cn-hit', 'data-id': c.id }, g);
      });
      // Batería: placa larga (+) a la izquierda, corta (−) a la derecha.
      var bx = G.battery.x, by = G.battery.y;
      el('path', { d: 'M' + (bx - 6) + ' ' + (by - 20) + 'L' + (bx - 6) + ' ' + (by + 20), 'class': 'ref', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('path', { d: 'M' + (bx + 6) + ' ' + (by - 10) + 'L' + (bx + 6) + ' ' + (by + 10), 'class': 'ref', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, g);
      txt(bx - 16, by - 12, [['+']], 18, 'end', g);
      txt(bx + 16, by - 12, [['−']], 18, 'start', g);
      txt(bx, by + 42, [['V = ' + f3(Vbat) + ' V']], 16, 'middle', g);

      var leavesNow = CN.leaves(tree).length;
      status.textContent = view < stack.length - 1
        ? 'Desarmando: paso ' + (stack.length - 1 - view) + ' de ' + (stack.length - 1) + '. Cada capacitor muestra su carga Q y su voltaje V.'
        : leavesNow === 1 ? (stack.length > 1 ? 'Red reducida: C_eq = ' + f3(sol.C) + ' μF y Q = ' + f3(sol.Q) + ' μC. Ahora desarma la red.' : 'Un solo capacitor.')
          : 'Quedan ' + leavesNow + ' capacitores.';

      var full = CN.solve(base, Vbat);
      facts.innerHTML = '';
      var rows = [['C_eq', f3(full.C) + ' μF'], ['Q total', f3(full.Q) + ' μC'], ['½ C_eq V²', f3(full.U) + ' μJ']];
      CN.leaves(base).forEach(function (x) { var p = full.parts[x.id]; rows.push([plain(x.id), f3(p.Q) + ' μC · ' + f3(p.V) + ' V · ' + f3(p.U) + ' μJ']); });
      rows.push(['Σ ½ C V²', f3(full.sumU) + ' μJ']);
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }
    function refresh() { if (checked) check(); else draw(); }

    function why(r, a, b) {
      var A = plain(a), B = plain(b);
      var deep = r.deepA ? A : B, other = r.deepA ? B : A, grp = (r.deepA ? r.groupA : r.groupB).map(plain).join(', ');
      if (r.lca === 's') return A + ' y ' + B + ' no están en serie: ' + deep + ' está en un grupo en paralelo (' + grp + '), así que la carga de ' + other + ' se reparte entre sus ramas y no es la misma. Tampoco están en paralelo: no se conectan a los mismos dos nodos. Primero reduce ese grupo.';
      return A + ' y ' + B + ' no están en paralelo: ' + deep + ' está en una rama en serie con otros (' + grp + '), así que no toca los mismos dos nodos que ' + other + '. Tampoco están en serie: entre ellos hay nodos donde llegan otras ramas. Primero reduce esa rama.';
    }
    function doCombine() {
      var a = selected[0], b = selected[1];
      if (!a || !b) { UI.verdict(stepV, 'warn', 'Elige dos capacitores', 'Tócalos en el circuito o escógelos en las dos listas.'); return; }
      var r = CN.relation(cur(), a, b);
      if (r.kind === 'same') { UI.verdict(stepV, 'warn', 'Elige dos distintos', 'Un capacitor no se combina consigo mismo.'); return; }
      var res = CN.combine(cur(), a, b);
      if (!res) { UI.verdict(stepV, 'bad', 'Ni en serie ni en paralelo', why(r, a, b)); selected = []; draw(); return; }
      var A = find2(a), B = find2(b);
      var line = res.kind === 'series'
        ? plain(a) + ' y ' + plain(b) + ' en serie (misma carga): 1/C = 1/' + f3(A) + ' + 1/' + f3(B) + ' → ' + plain(res.id) + ' = ' + f3(res.c) + ' μF'
        : plain(a) + ' y ' + plain(b) + ' en paralelo (mismo voltaje): C = ' + f3(A) + ' + ' + f3(B) + ' → ' + plain(res.id) + ' = ' + f3(res.c) + ' μF';
      UI.verdict(stepV, 'ok', res.kind === 'series' ? 'En serie' : 'En paralelo', line);
      stack.push(res.tree); view = stack.length - 1; selected = [];
      log.appendChild(h('li', {}, [line]));
      refresh();
    }
    function find2(id) { return CN.find(cur(), id).c; }

    svg.addEventListener('click', function (ev) {
      var t = ev.target.closest ? ev.target.closest('[data-id]') : null;
      if (!t || view < stack.length - 1) return;
      var id = t.getAttribute('data-id'), i = selected.indexOf(id);
      if (i >= 0) selected.splice(i, 1);
      else { selected.push(id); if (selected.length > 2) selected.shift(); }
      draw();
    });

    function check() {
      var val = parseFloat(String(aIn.input.value).replace(',', '.'));
      var r = CN.diagnose(kind(), base, Vbat, ask, val);
      var msg = MSG[r] || MSG.bad;
      UI.verdict(verdict, r === 'ok' ? 'ok' : r === 'bad' ? 'bad' : 'warn', msg[0], msg[1]);
      checked = true;
      draw();
    }

    // Ejemplo cargado: un compañero sumó en serie como si fuera paralelo.
    pSel.input.value = String(presetIdx);
    load();
    (function () {
      kSel.input.value = '0';
      var r = CN.answers('C', base, Vbat, ask);
      var wrong = r.swap.filter(function (x) { return Math.abs(x - r.truth) > 0.02 * r.truth; });
      aIn.input.value = UI.fmt(wrong[0], 4);
      note.textContent = 'Ejemplo cargado: así calculó un compañero la C_eq de esta red. ¿Ves el error? Reduce la red tú mismo, de dos en dos, y compara.';
    })();
    check();
    return Promise.resolve();
  };
})();
