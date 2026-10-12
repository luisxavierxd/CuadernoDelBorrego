/* =====================================================================
   Lab resistor-network (Física 2 · S12): reduce la red.
   Una red de 2 a 5 resistores conectada a una fuente de fem ε con resistencia
   interna r (opcional). El alumno elige dos resistores que estén en serie o en
   paralelo y el lab los combina (si no lo están, explica por qué). Con la red
   reducida escribe R_eq, la corriente total, el voltaje en terminales o la
   corriente, el voltaje o la potencia de un resistor; el «casi» reconoce:
     swap     fórmulas de serie y paralelo cruzadas
     noR      olvidó la resistencia interna r
     sign     sumó Ir en vez de restarlo (V = ε + Ir)
     vTotal   usó el voltaje de la fuente en un resistor que no lo tiene
     pTotal   potencia con el voltaje total (P = εI_i)
     iTotal   usó la corriente total en un resistor que no la lleva
   Al final el lab «desarma» la red y muestra I y V de cada resistor.

   LabMath.resnet (pura, sin DOM). Unidades: R en Ω, ε y V en volts, I en amperes,
   P en watts.
     Red como árbol: hoja { id: 'R1', r } · grupo { t: 's' | 'p', k: [hijos] }.
     solve(t, emf, rint) → { R, I, Vt, Pemf, Pr, Pext, sumP, parts: { id: { R, I, V, P } } }
     graph(t) → nodos y ramas { a, b, r, id } para un solver nodal (conductancia 1/r).
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  function leaf(id, r) { return { id: id, r: r }; }
  function S() { return { t: 's', k: Array.prototype.slice.call(arguments) }; }
  function P() { return { t: 'p', k: Array.prototype.slice.call(arguments) }; }
  function isLeaf(t) { return !t.k; }
  function clone(t) { return isLeaf(t) ? { id: t.id, r: t.r } : { t: t.t, k: t.k.map(clone) }; }

  // Resistencia equivalente. flip(nodo) → true cambia serie por paralelo en ese nodo (para los errores).
  function eqWith(t, flip) {
    if (isLeaf(t)) return t.r;
    var type = flip && flip(t) ? (t.t === 's' ? 'p' : 's') : t.t;
    var vals = t.k.map(function (x) { return eqWith(x, flip); });
    if (type === 's') return vals.reduce(function (s, x) { return s + x; }, 0);
    return 1 / vals.reduce(function (s, x) { return s + 1 / x; }, 0);
  }
  function eq(t) { return eqWith(t, null); }
  function series(rs) { return eq({ t: 's', k: rs.map(function (r, i) { return leaf('x' + i, r); }) }); }
  function parallel(rs) { return eq({ t: 'p', k: rs.map(function (r, i) { return leaf('x' + i, r); }) }); }

  function leaves(t) { return isLeaf(t) ? [t] : t.k.reduce(function (o, x) { return o.concat(leaves(x)); }, []); }
  function groups(t) { return isLeaf(t) ? [] : [t].concat(t.k.reduce(function (o, x) { return o.concat(groups(x)); }, [])); }
  function find(t, id) { var l = leaves(t); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }

  // Fuente real: I = ε/(R_eq + r) y V terminal = ε − Ir. Luego se desarma la red:
  // en serie, todos llevan la corriente del grupo; en paralelo, todos tienen su voltaje.
  function solveWith(t, emf, rint, flip) {
    rint = rint || 0;
    var parts = {}, groupsOut = [];
    var R = eqWith(t, flip), I = emf / (R + rint), Vt = emf - I * rint;
    function go(n, i) {
      var Rn = eqWith(n, flip), v = i * Rn, rec = { R: Rn, I: i, V: v, P: i * v };
      if (isLeaf(n)) { parts[n.id] = rec; return; }
      rec.ids = leaves(n).map(function (x) { return x.id; });
      groupsOut.push(rec);
      var type = flip && flip(n) ? (n.t === 's' ? 'p' : 's') : n.t;
      n.k.forEach(function (x) { go(x, type === 's' ? i : v / eqWith(x, flip)); });
    }
    go(t, I);
    var sumP = 0;
    Object.keys(parts).forEach(function (id) { sumP += parts[id].P; });
    return { R: R, emf: emf, r: rint, I: I, Vt: Vt, Pemf: emf * I, Pr: I * I * rint, Pext: Vt * I, sumP: sumP, parts: parts, groups: groupsOut };
  }
  function solve(t, emf, rint) { return solveWith(t, emf, rint, null); }

  // Potencia que recibe una carga R de una fuente (ε, r); máxima cuando R = r.
  function loadPower(emf, rint, R) { var I = emf / (R + rint); return I * I * R; }
  function maxPower(emf, rint) { return { R: rint, P: emf * emf / (4 * rint) }; }
  // Divisores: voltaje en R_k de una serie y corriente en la rama k de un paralelo.
  function vDivider(V, rs, k) { return V * rs[k] / rs.reduce(function (s, x) { return s + x; }, 0); }
  function iDivider(I, rs, k) { return I * (1 / rs[k]) / rs.reduce(function (s, x) { return s + 1 / x; }, 0); }

  function normalize(t) {
    if (isLeaf(t)) return t;
    var kids = [];
    t.k.map(normalize).forEach(function (x) {
      if (!isLeaf(x) && x.t === t.t) kids = kids.concat(x.k); else kids.push(x);
    });
    return kids.length === 1 ? kids[0] : { t: t.t, k: kids };
  }
  function pathTo(t, id) {
    if (isLeaf(t)) return t.id === id ? [t] : null;
    for (var i = 0; i < t.k.length; i++) { var p = pathTo(t.k[i], id); if (p) return [t].concat(p); }
    return null;
  }
  // ¿Cómo están conectados dos elementos de la red actual?
  //   kind 'series' | 'parallel' (hermanos directos en un grupo) | 'none' | 'same' | 'missing'
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
    var d = (a.replace(/^R/, '') + b.replace(/^R/, '')).split('').sort().join('');
    return 'R' + d;
  }
  function combine(t, a, b) {
    var r = relation(t, a, b);
    if (r.kind !== 'series' && r.kind !== 'parallel') return null;
    var nt = clone(t), pa = pathTo(nt, a), parent = pa[pa.length - 2];
    var A = find(nt, a), B = find(nt, b), id = mergedId(a, b);
    var val = r.kind === 'series' ? series([A.r, B.r]) : parallel([A.r, B.r]);
    var ia = parent.k.indexOf(A), ib = parent.k.indexOf(B);
    parent.k[Math.min(ia, ib)] = leaf(id, val);
    parent.k.splice(Math.max(ia, ib), 1);
    return { tree: normalize(nt), kind: r.kind, id: id, r: val };
  }

  // Red como nodos y ramas: terminales 'a' (+) y 'b' (−), nodos internos n1, n2…
  function graph(t) {
    var nodes = ['a', 'b'], branches = [], n = 0;
    function walk(x, p, q) {
      if (isLeaf(x)) { branches.push({ a: p, b: q, r: x.r, id: x.id }); return; }
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

  // Respuesta real y errores típicos. kind: 'R' (R_eq) | 'I' (corriente total) | 'Vt' (terminales)
  // | 'Ii' | 'Vi' | 'Pi' (de un resistor).
  function answers(kind, t, emf, rint, id) {
    rint = rint || 0;
    var s = solve(t, emf, rint), p = s.parts[id] || s.parts[leaves(t)[0].id];
    var s0 = rint > 0 ? solve(t, emf, 0) : null, p0 = s0 ? (s0.parts[id] || s0.parts[leaves(t)[0].id]) : null;
    var flips = groups(t).map(function (g) { return function (n) { return n === g; }; }).concat([function () { return true; }]);
    var swaps = flips.map(function (f) { return eqWith(t, f); });
    if (kind === 'R') return { truth: s.R, swap: swaps };
    if (kind === 'I') return { truth: s.I, swap: swaps.map(function (R) { return emf / (R + rint); }), noR: s0 && s0.I };
    if (kind === 'Vt') return { truth: s.Vt, noR: rint > 0 ? emf : null, sign: rint > 0 ? emf + s.I * rint : null };
    if (kind === 'Ii') return { truth: p.I, noR: p0 && p0.I, vTotal: emf / p.R, iTotal: s.I };
    if (kind === 'Vi') return { truth: p.V, noR: p0 && p0.V, vTotal: emf, iTotal: s.I * p.R };
    return { truth: p.P, noR: p0 && p0.P, vTotal: emf * emf / p.R, pTotal: emf * p.I, iTotal: s.I * s.I * p.R };
  }
  function close(a, b, tol) { return Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-12); }
  var ORDER = ['swap', 'noR', 'sign', 'vTotal', 'pTotal', 'iTotal'];
  // Un error solo cuenta si su valor se distingue del real (2 %).
  function diagnose(kind, t, emf, rint, id, student) {
    if (!isFinite(student)) return 'bad';
    var r = answers(kind, t, emf, rint, id), tol = 0.01;
    if (close(student, r.truth, tol)) return 'ok';
    for (var i = 0; i < ORDER.length; i++) {
      var vals = r[ORDER[i]];
      if (vals == null) continue;
      vals = [].concat(vals);
      for (var j = 0; j < vals.length; j++) {
        if (vals[j] == null || !isFinite(vals[j]) || close(vals[j], r.truth, 0.02)) continue;
        if (close(student, vals[j], tol)) return ORDER[i];
      }
    }
    return 'bad';
  }

  // Red al azar con n hojas (2 a 5): grupos alternados serie/paralelo.
  var NICE = [1, 2, 3, 4, 5, 6, 8, 10, 12];
  function random(rnd, n) {
    var count = 0;
    function gen(m, type) {
      if (m === 1) { count++; return leaf('R' + count, NICE[Math.floor(rnd() * NICE.length)]); }
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
    if (isLeaf(t)) return { w: LEAF.w, h: LEAF.h, t: LEAF.t, res: [{ id: t.id, r: t.r, x: 0, y: 0 }], wires: [], dots: [] };
    var kids = t.k.map(layout), out = { res: [], wires: [], dots: [] };
    function put(L, dx, dy) {
      L.res.forEach(function (c) { out.res.push({ id: c.id, r: c.r, x: c.x + dx, y: c.y + dy }); });
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
  // Circuito completo con la fuente abajo (batería + r interna en un recuadro): viewBox ≥ 560 × 310.
  function circuit(t) {
    var L = layout(t), side = 46, M = 18;
    var natW = L.w + 2 * (M + side), W = Math.max(560, natW), ox = (W - L.w) / 2;
    var oy = M, bottom = oy + L.h + 44, H = Math.max(310, bottom + 64);
    var xl = ox - side, xr = ox + L.w + side, ty = oy + L.t, xc = W / 2;
    var o = { W: W, H: H, res: [], wires: [], dots: [] };
    L.res.forEach(function (c) { o.res.push({ id: c.id, r: c.r, x: c.x + ox, y: c.y + oy, w: LEAF.w, h: LEAF.h, t: LEAF.t }); });
    L.wires.forEach(function (w) { o.wires.push([w[0] + ox, w[1] + oy, w[2] + ox, w[3] + oy]); });
    L.dots.forEach(function (d) { o.dots.push([d[0] + ox, d[1] + oy]); });
    o.wires.push([xl, ty, ox, ty], [ox + L.w, ty, xr, ty], [xl, ty, xl, bottom], [xr, ty, xr, bottom],
      [xl, bottom, xc - 40, bottom], [xc - 28, bottom, xc + 14, bottom], [xc + 54, bottom, xr, bottom]);
    o.source = { x: xc, y: bottom, bat: xc - 34, res: xc + 34 };
    return o;
  }

  var PRESETS = [
    { name: 'Dos en serie', emf: 12, r: 0, ask: 'R1', tree: S(leaf('R1', 4), leaf('R2', 2)) },
    { name: 'Tres en paralelo', emf: 12, r: 0, ask: 'R2', tree: P(leaf('R1', 2), leaf('R2', 3), leaf('R3', 6)) },
    { name: 'Mixta de tres', emf: 18, r: 1, ask: 'R2', tree: S(P(leaf('R1', 4), leaf('R2', 12)), leaf('R3', 5)) },
    { name: 'Mixta de cuatro', emf: 20, r: 2, ask: 'R1', tree: S(P(S(leaf('R1', 2), leaf('R2', 4)), leaf('R3', 3)), leaf('R4', 6)) },
    { name: 'Mixta de cinco', emf: 12, r: 1, ask: 'R2', tree: P(S(P(leaf('R1', 3), leaf('R2', 6)), leaf('R3', 4)), S(leaf('R4', 2), leaf('R5', 4))) }
  ];

  window.LabMath = window.LabMath || {};
  window.LabMath.resnet = {
    leaf: leaf, S: S, P: P, isLeaf: isLeaf, clone: clone,
    eq: eq, eqWith: eqWith, series: series, parallel: parallel,
    leaves: leaves, groups: groups, find: find, solve: solve, solveWith: solveWith,
    loadPower: loadPower, maxPower: maxPower, vDivider: vDivider, iDivider: iDivider,
    normalize: normalize, relation: relation, combine: combine, mergedId: mergedId, graph: graph,
    answers: answers, diagnose: diagnose, random: random,
    layout: layout, circuit: circuit, LEAF: LEAF, PRESETS: PRESETS
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var SUB = '₀₁₂₃₄₅₆₇₈₉';
  function plain(id) { return 'R' + id.slice(1).split('').map(function (d) { return SUB[+d]; }).join(''); }
  var MSG = {
    ok: ['Coincide', 'Tu resultado es el del lab.'],
    swap: ['Cruzaste serie y paralelo', 'En serie las resistencias se suman (R = R₁ + R₂): el resultado es mayor que la más grande. En paralelo se suman los inversos (1/R = 1/R₁ + 1/R₂): el resultado es menor que la más chica. Es al revés que con capacitores.'],
    noR: ['Olvidaste la resistencia interna', 'La fuente tiene r por dentro: la corriente es I = ε/(R_eq + r), no ε/R_eq. Por eso el voltaje en las terminales baja a ε − Ir.'],
    sign: ['El signo de Ir', 'Dentro de la fuente la corriente pierde voltaje en r: V = ε − Ir. Sumaste Ir.'],
    vTotal: ['Ese resistor no tiene todo el voltaje', 'Usaste el voltaje de la fuente. En serie el voltaje se reparte: cada resistor tiene V = IR con la corriente de su rama.'],
    pTotal: ['Potencia con el voltaje total', 'Multiplicaste la corriente del resistor por el voltaje de la fuente. Usa su propio voltaje: P = I·V = I²R = V²/R, todo del mismo resistor.'],
    iTotal: ['Ese resistor no lleva toda la corriente', 'Usaste la corriente total. En paralelo la corriente se reparte entre las ramas (la más chica se lleva más). Desarma la red paso a paso.'],
    bad: ['No coincide', 'Reduce la red hasta un solo resistor, calcula I = ε/(R_eq + r) y luego desarma: en serie todos llevan la misma I; en paralelo todos tienen el mismo V.']
  };

  window.Labs = window.Labs || {};
  window.Labs['resistor-network'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, RN = window.LabMath.resnet;
    var seed = 24680;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    var presetIdx = cfg && cfg.preset != null ? cfg.preset : 2;
    var base, emf, rint, ask, stack, view, selected = [], checked = false;

    var opts = RN.PRESETS.map(function (p) { return p.name; }).concat(['Al azar']);
    var pSel = UI.select({ label: 'Red', options: opts });
    var eS = UI.slider({ label: 'Fem ε', min: 3, max: 24, step: 1, value: 12, unit: 'V' }, function () { emf = eS.get(); refresh(); });
    var rS = UI.slider({ label: 'Resistencia interna r', min: 0, max: 3, step: 0.5, value: 0, unit: 'Ω' }, function () { rint = rS.get(); refresh(); });
    var newBtn = UI.button('Otra red al azar', 'ghost', function () { pSel.input.value = String(RN.PRESETS.length); load(); });
    var aSel = UI.select({ label: 'Primer resistor', options: ['—'] });
    var bSel = UI.select({ label: 'Segundo resistor', options: ['—'] });
    var combBtn = UI.button('Combinar', 'primary', doCombine);
    var undoBtn = UI.button('Deshacer', 'ghost', function () { if (stack.length > 1 && view === stack.length - 1) { stack.pop(); view = stack.length - 1; selected = []; log.removeChild(log.lastChild); stepV.hidden = true; refresh(); } });
    var resetBtn = UI.button('Empezar de nuevo', 'ghost', function () { restart(); refresh(); });
    var unpackBtn = UI.button('Desarmar un paso', 'primary', function () { if (view > 0) { view--; selected = []; refresh(); } });
    var stepV = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var log = h('ol', { class: 'rn-log' });
    var kSel = UI.select({ label: '¿Qué calculas?', options: ['x'] });
    var askBtn = UI.button('Pregunta por otro resistor', 'ghost', function () {
      var ids = RN.leaves(base).map(function (x) { return x.id; });
      ask = ids[(ids.indexOf(ask) + 1) % ids.length]; fillKinds(); verdict.hidden = true; checked = false;
    });
    var aIn = UI.input({ label: 'Tu resultado', type: 'number', step: 'any', inputmode: 'decimal', mono: false, hint: 'Unidades: resistencia en Ω, corriente en A, voltaje en V y potencia en W.' });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var status = h('p', { class: 'lab-note rn-status' });
    var svg = UI.svg(560, 310, 'Red de resistores conectada a una fuente con resistencia interna');
    svg.classList.add('rn-stage');

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls rn-controls', novalidate: true }, [
        pSel.node, eS.node, rS.node, h('div', { class: 'lab-buttons' }, [newBtn]),
        h('p', { class: 'lab-field__label rn-head' }, ['1 · Reduce la red']),
        h('div', { class: 'lab-row' }, [aSel.node, bSel.node]),
        h('div', { class: 'lab-buttons' }, [combBtn, undoBtn, resetBtn]), stepV, log,
        h('p', { class: 'lab-field__label rn-head' }, ['2 · Calcula']),
        kSel.node, h('div', { class: 'lab-buttons' }, [askBtn]), aIn.node, h('div', { class: 'lab-buttons' }, [run]), note, verdict,
        h('p', { class: 'lab-field__label rn-head' }, ['3 · Desarma la red']),
        h('div', { class: 'lab-buttons' }, [unpackBtn]),
        h('details', { class: 'rn-details' }, [h('summary', {}, ['Ver los valores del lab']), facts])
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Toca dos resistores para elegirlos']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'resistor']),
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
    function restart() { stack = [RN.clone(base)]; view = 0; selected = []; log.innerHTML = ''; stepV.hidden = true; }
    function load() {
      var i = +pSel.input.value;
      if (i < RN.PRESETS.length) { var p = RN.PRESETS[i]; base = RN.clone(p.tree); emf = p.emf; rint = p.r; ask = p.ask; }
      else {
        base = RN.random(rnd, 2 + Math.floor(rnd() * 4)); emf = [6, 9, 12, 18, 24][Math.floor(rnd() * 5)]; rint = [0, 0.5, 1, 2][Math.floor(rnd() * 4)];
        var ids = RN.leaves(base).map(function (x) { return x.id; }); ask = ids[Math.floor(rnd() * ids.length)];
      }
      eS.set(emf); rS.set(rint); restart(); fillKinds(); verdict.hidden = true; checked = false; aIn.input.value = '';
      note.textContent = 'Combina de dos en dos hasta que quede un solo resistor. Luego calcula y comprueba.';
      refresh();
    }
    function fillKinds() {
      var n = plain(ask), keep = kSel.input.value;
      var labels = ['R_eq de la red externa (Ω)', 'Corriente total I (A)', 'Voltaje en terminales de la fuente (V)', 'Corriente en ' + n + ' (A)', 'Voltaje en ' + n + ' (V)', 'Potencia en ' + n + ' (W)'];
      kSel.input.innerHTML = '';
      labels.forEach(function (l, i) { kSel.input.appendChild(h('option', { value: String(i) }, [l])); });
      kSel.input.value = keep && +keep < labels.length ? keep : '0';
    }
    function kind() { return ['R', 'I', 'Vt', 'Ii', 'Vi', 'Pi'][+kSel.input.value]; }
    function fillPicks() {
      var ids = RN.leaves(cur()).map(function (x) { return x.id; });
      [aSel, bSel].forEach(function (s, i) {
        s.input.innerHTML = '';
        s.input.appendChild(h('option', { value: '' }, ['—']));
        ids.forEach(function (id) { s.input.appendChild(h('option', { value: id }, [plain(id)])); });
        s.input.value = selected[i] || '';
        s.input.disabled = ids.length < 2 || view < stack.length - 1;
      });
      combBtn.disabled = ids.length < 2 || view < stack.length - 1;
      undoBtn.disabled = stack.length < 2 || view < stack.length - 1;
      unpackBtn.disabled = !(stack.length > 1 && RN.isLeaf(stack[stack.length - 1]) && view > 0);
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
    // Zigzag horizontal centrado en (cx, cy), de ancho 2·half.
    function zig(cx, cy, half, cls, w, parent) {
      var n = 6, step = 2 * half / n, d = 'M' + (cx - half) + ' ' + cy;
      for (var i = 0; i < n; i++) d += 'L' + (cx - half + step * (i + 0.5)) + ' ' + (cy + (i % 2 ? 9 : -9));
      d += 'L' + (cx + half) + ' ' + cy;
      el('path', { d: d, 'class': cls, 'stroke-width': w, fill: 'none', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, parent);
    }
    function nameParts(id, final) { return final ? [['R'], ['eq', true]] : [['R'], [id.slice(1), true]]; }
    function f3(v) { return UI.fmt(v, 3); }

    function draw() {
      fillPicks();
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var tree = cur(), G = RN.circuit(tree), sol = RN.solve(tree, emf, rint);
      var showIV = view < stack.length - 1 || RN.isLeaf(tree);
      svg.setAttribute('viewBox', '0 0 ' + G.W + ' ' + G.H);
      var g = el('g', {});
      G.wires.forEach(function (w) { el('path', { d: 'M' + w[0] + ' ' + w[1] + 'L' + w[2] + ' ' + w[3], 'class': 'axis', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, g); });
      G.dots.forEach(function (d) { el('circle', { cx: d[0], cy: d[1], r: 4.5, 'class': 'dot-ref' }, g); });
      var final = RN.isLeaf(tree) && stack.length > 1;
      G.res.forEach(function (c) {
        var cx = c.x + c.w / 2, cy = c.y + c.t, sel = selected.indexOf(c.id) >= 0;
        var combined = c.id.length > 2 || final;
        var cls = sel ? 'error' : combined ? 'trace' : 'ref';
        el('path', { d: 'M' + c.x + ' ' + cy + 'L' + (cx - 24) + ' ' + cy + 'M' + (cx + 24) + ' ' + cy + 'L' + (c.x + c.w) + ' ' + cy, 'class': 'axis', 'stroke-width': 2.4, fill: 'none' }, g);
        zig(cx, cy, 24, cls, sel ? 4 : 3, g);
        txt(cx, cy - 22, nameParts(c.id, final).concat([[' = ' + f3(c.r) + ' Ω']]), 15, 'middle', g);
        if (showIV) {
          var p = sol.parts[c.id];
          txt(cx, cy + 36, [['I = ' + f3(p.I) + ' A']], 14, 'middle', g);
          txt(cx, cy + 54, [['V = ' + f3(p.V) + ' V']], 14, 'middle', g);
        }
        el('rect', { x: c.x + 6, y: c.y, width: c.w - 12, height: c.h, 'class': 'rn-hit', 'data-id': c.id }, g);
      });
      // Fuente: batería (placa larga + a la izquierda) y su resistencia interna, en un recuadro.
      var Sx = G.source, by = Sx.y, bx = Sx.bat, rx = Sx.res;
      el('path', { d: 'M' + (bx - 6) + ' ' + (by - 18) + 'L' + (bx - 6) + ' ' + (by + 18), 'class': 'ref', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('path', { d: 'M' + (bx + 6) + ' ' + (by - 9) + 'L' + (bx + 6) + ' ' + (by + 9), 'class': 'ref', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, g);
      txt(bx - 14, by - 10, [['+']], 17, 'end', g);
      if (rint > 0) zig(rx, by, 20, 'ref', 2.6, g);
      else el('path', { d: 'M' + (rx - 20) + ' ' + by + 'L' + (rx + 20) + ' ' + by, 'class': 'axis', 'stroke-width': 2.4, fill: 'none' }, g);
      el('rect', { x: bx - 36, y: by - 30, width: rx + 32 - (bx - 36), height: 60, rx: 6, 'class': 'aux', fill: 'none', 'stroke-width': 1.4, 'stroke-dasharray': '5 4' }, g);
      txt(Sx.x, by + 48, [['ε = ' + f3(emf) + ' V · r = ' + f3(rint) + ' Ω']], 15, 'middle', g);

      var leavesNow = RN.leaves(tree).length;
      status.textContent = view < stack.length - 1
        ? 'Desarmando: paso ' + (stack.length - 1 - view) + ' de ' + (stack.length - 1) + '. Cada resistor muestra su corriente I y su voltaje V.'
        : leavesNow === 1 ? (stack.length > 1 ? 'Red reducida: R_eq = ' + f3(sol.R) + ' Ω, I = ε/(R_eq + r) = ' + f3(sol.I) + ' A y V terminal = ' + f3(sol.Vt) + ' V. Ahora desarma la red.' : 'Un solo resistor.')
          : 'Quedan ' + leavesNow + ' resistores.';

      var full = RN.solve(base, emf, rint);
      facts.innerHTML = '';
      var rows = [['R_eq', f3(full.R) + ' Ω'], ['I = ε/(R_eq + r)', f3(full.I) + ' A'], ['V = ε − Ir', f3(full.Vt) + ' V']];
      RN.leaves(base).forEach(function (x) { var p = full.parts[x.id]; rows.push([plain(x.id), f3(p.I) + ' A · ' + f3(p.V) + ' V · ' + f3(p.P) + ' W']); });
      rows.push(['Σ I²R', f3(full.sumP) + ' W'], ['I²r', f3(full.Pr) + ' W'], ['εI (entrega la fem)', f3(full.Pemf) + ' W']);
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }
    function refresh() { if (checked) check(); else draw(); }

    function why(r, a, b) {
      var A = plain(a), B = plain(b);
      var deep = r.deepA ? A : B, other = r.deepA ? B : A, grp = (r.deepA ? r.groupA : r.groupB).map(plain).join(', ');
      if (r.lca === 's') return A + ' y ' + B + ' no están en serie: ' + deep + ' está en un grupo en paralelo (' + grp + '), así que la corriente de ' + other + ' se reparte entre sus ramas y no es la misma. Tampoco están en paralelo: no se conectan a los mismos dos nodos. Primero reduce ese grupo.';
      return A + ' y ' + B + ' no están en paralelo: ' + deep + ' está en una rama en serie con otros (' + grp + '), así que no toca los mismos dos nodos que ' + other + '. Tampoco están en serie: entre ellos hay nodos donde llegan otras ramas. Primero reduce esa rama.';
    }
    function doCombine() {
      var a = selected[0], b = selected[1];
      if (!a || !b) { UI.verdict(stepV, 'warn', 'Elige dos resistores', 'Tócalos en el circuito o escógelos en las dos listas.'); return; }
      var r = RN.relation(cur(), a, b);
      if (r.kind === 'same') { UI.verdict(stepV, 'warn', 'Elige dos distintos', 'Un resistor no se combina consigo mismo.'); return; }
      var res = RN.combine(cur(), a, b);
      if (!res) { UI.verdict(stepV, 'bad', 'Ni en serie ni en paralelo', why(r, a, b)); selected = []; draw(); return; }
      var A = RN.find(cur(), a).r, B = RN.find(cur(), b).r;
      var line = res.kind === 'series'
        ? plain(a) + ' y ' + plain(b) + ' en serie (misma corriente): R = ' + f3(A) + ' + ' + f3(B) + ' → ' + plain(res.id) + ' = ' + f3(res.r) + ' Ω'
        : plain(a) + ' y ' + plain(b) + ' en paralelo (mismo voltaje): 1/R = 1/' + f3(A) + ' + 1/' + f3(B) + ' → ' + plain(res.id) + ' = ' + f3(res.r) + ' Ω';
      UI.verdict(stepV, 'ok', res.kind === 'series' ? 'En serie' : 'En paralelo', line);
      stack.push(res.tree); view = stack.length - 1; selected = [];
      log.appendChild(h('li', {}, [line]));
      refresh();
    }

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
      var r = RN.diagnose(kind(), base, emf, rint, ask, val);
      var msg = MSG[r] || MSG.bad;
      UI.verdict(verdict, r === 'ok' ? 'ok' : r === 'bad' ? 'bad' : 'warn', msg[0], msg[1]);
      checked = true;
      draw();
    }

    // Ejemplo cargado: un compañero calculó la corriente sin la resistencia interna.
    pSel.input.value = String(presetIdx);
    load();
    (function () {
      kSel.input.value = '1';
      var r = RN.answers('I', base, emf, rint, ask);
      aIn.input.value = UI.fmt(r.noR != null ? r.noR : r.swap[0], 4);
      note.textContent = 'Ejemplo cargado: así calculó un compañero la corriente total. ¿Ves el error? Reduce la red tú mismo, de dos en dos, y compara.';
    })();
    check();
    return Promise.resolve();
  };
})();
