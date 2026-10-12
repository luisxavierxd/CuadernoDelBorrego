/* =====================================================================
   Lab kirchhoff-signs (Física 2 · S13): ¿son tus signos?
   Un circuito de una o dos mallas: dos nodos (a arriba, b abajo) unidos por 2 o 3
   ramas verticales con baterías y resistores. El alumno elige el sentido de cada
   corriente (toca la flecha para invertirla), elige una malla y su sentido de
   recorrido, y pone el signo de cada término de la ecuación de malla. El lab marca
   cada término con el signo mal y dice por qué; al final pide el valor de una
   corriente con la flecha que eligió. El «casi» reconoce:
     flip      el valor del sentido contrario (correcto si se interpreta bien)
     emf       el signo de una batería invertido
     drop      una batería olvidada
     isolated  una malla resuelta como si estuviera sola (sin la regla de nodos)
     node      la regla de nodos con un signo mal

   LabMath.kirchhoff (pura, sin DOM). Unidades: V, Ω, A, W.
     Circuito { br: [[elemento…], …] }: ramas de izquierda a derecha; cada rama va del
     nodo b (abajo) al nodo a (arriba) y sus elementos se listan de abajo hacia arriba:
       { t: 'E', id: 'E1', v: ε, up: true }   up: la terminal + queda arriba
       { t: 'R', id: 'R1', v: R }
     dirs[j] = +1 si la flecha de la corriente j apunta hacia arriba, −1 si hacia abajo.
     Recorrido de una malla: trav = +1 horario, −1 antihorario (en pantalla).
     solve()  resuelve con las ecuaciones de nodo y de malla (Cramer).
     nodal()  resuelve con el solver nodal de la S10 (LabMath.capnet.nodal, cada rama
              como su equivalente de Norton). Solo se usa en pruebas y oráculos: la página
              de la S13 no carga capacitor-network.js.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  var SUB = '₀₁₂₃₄₅₆₇₈₉';
  function sub(n) { return String(n).split('').map(function (d) { return SUB[+d] || d; }).join(''); }
  function E(n, v, up) { return { t: 'E', id: 'E' + n, v: v, up: up !== false }; }
  function R(n, v) { return { t: 'R', id: 'R' + n, v: v }; }
  function clone(c) { return { br: c.br.map(function (b) { return b.map(function (e) { return Object.assign({}, e); }); }) }; }
  function elements(c) { return c.br.reduce(function (o, b) { return o.concat(b); }, []); }
  function find(c, id) { var l = elements(c); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function branchOf(c, id) { for (var j = 0; j < c.br.length; j++) for (var i = 0; i < c.br[j].length; i++) if (c.br[j][i].id === id) return j; return -1; }

  // Nombres para mostrar: ε₁, R₂, I₃ (con una sola malla, la corriente es I).
  function elName(id) { return (id[0] === 'E' ? 'ε' : 'R') + sub(id.slice(1)); }
  function curName(c, j) { return c.br.length === 2 ? 'I' : 'I' + sub(j + 1); }

  // Resistencia total y fem neta hacia arriba (lo que sube el potencial al ir de b a a) de cada rama.
  function totals(c) {
    return c.br.map(function (b) {
      var o = { R: 0, emf: 0 };
      b.forEach(function (e) { if (e.t === 'R') o.R += e.v; else o.emf += e.up ? e.v : -e.v; });
      return o;
    });
  }

  // Mallas posibles: con dos ramas, una; con tres, la izquierda, la derecha y la exterior.
  function loops(c) {
    if (c.br.length === 2) return [{ id: 'malla', br: [0, 1], name: 'la malla' }];
    return [{ id: 'izq', br: [0, 1], name: 'malla izquierda' }, { id: 'der', br: [1, 2], name: 'malla derecha' }, { id: 'ext', br: [0, 2], name: 'malla exterior' }];
  }
  function loopById(c, id) { var l = loops(c); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return l[0]; }

  // Recorrido de la malla: horario sube por la rama izquierda y baja por la derecha.
  function walk(c, loop, trav) {
    var L = typeof loop === 'string' ? loopById(c, loop) : loop;
    var upB = trav > 0 ? L.br[0] : L.br[1], downB = trav > 0 ? L.br[1] : L.br[0], out = [];
    c.br[upB].forEach(function (e) { out.push({ el: e, b: upB, up: true }); });
    c.br[downB].slice().reverse().forEach(function (e) { out.push({ el: e, b: downB, up: false }); });
    return out;
  }

  // Signo correcto de cada término de la ecuación de malla Σ términos = 0.
  //   Resistor recorrido a favor de su corriente: −IR (el potencial baja); en contra: +IR.
  //   Batería cruzada de − a +: +ε (sube); de + a −: −ε (baja).
  function terms(c, loop, trav, dirs) {
    return walk(c, loop, trav).map(function (w) {
      var e = w.el, t = { id: e.id, t: e.t, v: e.v, b: w.b, up: w.up };
      if (e.t === 'R') { t.withI = (w.up ? 1 : -1) === dirs[w.b]; t.sign = t.withI ? -1 : 1; }
      else { t.gain = w.up === e.up; t.sign = t.gain ? 1 : -1; }
      return t;
    });
  }
  function why(c, t) {
    var n = elName(t.id);
    if (t.t === 'R') {
      var I = curName(c, t.b);
      return t.withI ? 'Recorres ' + n + ' a favor de ' + I + ': el potencial baja, el término es −' + n + I + '.'
        : 'Recorres ' + n + ' en contra de ' + I + ': el potencial sube, el término es +' + n + I + '.';
    }
    return t.gain ? 'Cruzas ' + n + ' de − a +: el potencial sube, el término es +' + n + '.'
      : 'Cruzas ' + n + ' de + a −: el potencial baja, el término es −' + n + '.';
  }
  // Compara los signos del alumno ({ id: +1 | −1 | 0 }) término por término.
  function checkSigns(c, loop, trav, dirs, signs) {
    var rows = terms(c, loop, trav, dirs).map(function (t) {
      var got = signs ? signs[t.id] || 0 : 0;
      return { id: t.id, t: t.t, b: t.b, want: t.sign, got: got, ok: got === t.sign, missing: !got, why: why(c, t) };
    });
    var wrong = rows.filter(function (r) { return !r.ok && !r.missing; }).length, missing = rows.filter(function (r) { return r.missing; }).length;
    return { rows: rows, wrong: wrong, missing: missing, allOk: !wrong && !missing };
  }
  // Ecuación como texto: «+ε₁ − R₁I₁ + R₂I₂ = 0». signs opcional (si falta, los correctos).
  function eqText(c, loop, trav, dirs, signs) {
    return terms(c, loop, trav, dirs).map(function (t) {
      var s = signs ? signs[t.id] || 0 : t.sign, ch = s > 0 ? '+' : s < 0 ? '−' : '?';
      return ch + ' ' + (t.t === 'R' ? elName(t.id) + curName(c, t.b) : elName(t.id));
    }).join(' ').replace(/^\+ /, '') + ' = 0';
  }
  // Regla de nodos en el nodo de arriba (a): lo que entra = lo que sale.
  function nodeText(c, dirs) {
    if (c.br.length === 2) return null;
    var inn = [], out = [];
    dirs.forEach(function (d, j) { (d > 0 ? inn : out).push(curName(c, j)); });
    return (inn.join(' + ') || '0') + ' = ' + (out.join(' + ') || '0');
  }

  // Sistema lineal A·I = rhs con las corrientes de rama (en el sentido de dirs).
  //   Fila 0: nodo a (Σ dirs_j I_j = 0). Filas siguientes: una ecuación por malla interior, en horario.
  //   opt.flipNode = j invierte el signo de I_j en la regla de nodos (para el «casi»).
  function system(c, dirs, opt) {
    opt = opt || {};
    var k = c.br.length, A = [], rhs = [];
    var node = dirs.map(function (d, j) { return j === opt.flipNode ? -d : d; });
    A.push(node); rhs.push(0);
    loops(c).filter(function (L) { return L.id !== 'ext'; }).forEach(function (L) {
      var row = new Array(k).fill(0), cst = 0;
      terms(c, L, 1, dirs).forEach(function (t) { if (t.t === 'R') row[t.b] += t.sign * t.v; else cst += t.sign * t.v; });
      A.push(row); rhs.push(-cst);
    });
    return { A: A, rhs: rhs };
  }
  function det(M) {
    var n = M.length;
    if (n === 1) return M[0][0];
    if (n === 2) return M[0][0] * M[1][1] - M[0][1] * M[1][0];
    var s = 0;
    for (var j = 0; j < n; j++) {
      var minor = M.slice(1).map(function (r) { return r.filter(function (_, i) { return i !== j; }); });
      s += (j % 2 ? -1 : 1) * M[0][j] * det(minor);
    }
    return s;
  }
  // Regla de Cramer: x_i = det(A con la columna i cambiada por b) / det(A). Singular → NaN.
  function cramer(A, b) {
    var D = det(A);
    if (!(Math.abs(D) > 1e-12)) return b.map(function () { return NaN; });
    return b.map(function (_, i) { return det(A.map(function (r, ri) { return r.map(function (x, ci) { return ci === i ? b[ri] : x; }); })) / D; });
  }

  // Potencias: cada batería entrega ε·I (I de − a + por dentro; negativa si se está cargando)
  // y cada resistor disipa I²R.
  function power(c, Iup) {
    var src = {}, res = {}, gen = 0, diss = 0;
    c.br.forEach(function (b, j) {
      b.forEach(function (e) {
        if (e.t === 'E') { var p = e.v * Iup[j] * (e.up ? 1 : -1); src[e.id] = p; gen += p; }
        else { var q = Iup[j] * Iup[j] * e.v; res[e.id] = q; diss += q; }
      });
    });
    return { src: src, res: res, gen: gen, diss: diss };
  }
  // V_a − V_b subiendo por la rama j: suma de fem hacia arriba menos las caídas I·R.
  function vab(c, Iup, j) { var t = totals(c)[j || 0]; return t.emf - Iup[j || 0] * t.R; }
  // Potencial de cada punto de una rama, de abajo (b = 0) hacia arriba: [V antes, V después] por elemento.
  function profile(c, Iup, j) {
    var V = 0, out = [];
    c.br[j].forEach(function (e) {
      var v0 = V;
      V += e.t === 'E' ? (e.up ? e.v : -e.v) : -Iup[j] * e.v;
      out.push({ id: e.id, from: v0, to: V });
    });
    return out;
  }

  // Ruta 1: nodo + mallas con Cramer. I en el sentido de dirs; Iup hacia arriba.
  function solveWith(c, dirs, opt) {
    dirs = dirs || c.br.map(function () { return 1; });
    var s = system(c, dirs, opt), I = cramer(s.A, s.rhs);
    var Iup = I.map(function (x, j) { return x * dirs[j]; });
    return { I: I, Iup: Iup, V: vab(c, Iup, 0), P: power(c, Iup) };
  }
  function solve(c, dirs) { return solveWith(c, dirs, null); }

  // Ruta 2: solver nodal genérico de la S10. Cada rama es una conductancia 1/R_j con una
  // inyección ε_j/R_j en el nodo a (equivalente de Norton); b es tierra.
  function nodal(c) {
    var N = window.LabMath.capnet, T = totals(c), inj = 0;
    var branches = T.map(function (t) { inj += t.emf / t.R; return { a: 'a', b: 'b', value: 1 / t.R }; });
    var pot = N.nodal({ nodes: ['a', 'b'], branches: branches, fixed: { b: 0 }, inject: { a: inj } });
    var V = pot.a - pot.b, Iup = T.map(function (t) { return (t.emf - V) / t.R; });
    return { V: V, Iup: Iup, P: power(c, Iup) };
  }

  // Corriente de la rama j si la malla L se resolviera sola (error típico: sin regla de nodos).
  function isolated(c, L, j, dirs) {
    var ts = terms(c, L, 1, dirs.map(function () { return 1; })), Rs = 0, g = 0;
    ts.forEach(function (t) { if (t.t === 'R') Rs += t.v; else g += t.sign * t.v; });
    var Icw = g / Rs;                         // corriente en horario dentro de la malla aislada
    var upAtJ = j === L.br[0] ? 1 : -1;       // horario sube por la rama izquierda de la malla
    return Icw * upAtJ * dirs[j];
  }
  // Respuesta real y errores típicos para la corriente de la rama j con las flechas dirs.
  function answers(c, dirs, j) {
    var truth = solve(c, dirs).I[j], out = { truth: truth, flip: [-truth], emf: [], drop: [], isolated: [], node: [] };
    elements(c).forEach(function (e) {
      if (e.t !== 'E') return;
      var a = clone(c), b = clone(c);
      find(a, e.id).up = !e.up; find(b, e.id).v = 0;
      out.emf.push(solve(a, dirs).I[j]);
      if (elements(c).filter(function (x) { return x.t === 'E'; }).length > 1) out.drop.push(solve(b, dirs).I[j]);
    });
    if (c.br.length === 3) {
      loops(c).forEach(function (L) { if (L.id !== 'ext' && L.br.indexOf(j) >= 0) out.isolated.push(isolated(c, L, j, dirs)); });
      for (var f = 0; f < 3; f++) out.node.push(solveWith(c, dirs, { flipNode: f }).I[j]);
    }
    return out;
  }
  // Tolerancia de las respuestas numéricas del sitio: ±0.01 o 1 %.
  function close(a, b) { return Math.abs(a - b) <= Math.max(0.0105, 0.01 * Math.abs(b)); }
  function diagnose(c, dirs, j, student) {
    if (!isFinite(student)) return 'bad';
    var r = answers(c, dirs, j);
    if (close(student, r.truth)) return 'ok';
    var order = ['flip', 'emf', 'drop', 'isolated', 'node'];
    for (var i = 0; i < order.length; i++) {
      var vals = r[order[i]];
      for (var k = 0; k < vals.length; k++) {
        if (!isFinite(vals[k]) || Math.abs(vals[k] - r.truth) <= Math.max(0.03, 0.02 * Math.abs(r.truth))) continue;
        if (close(student, vals[k])) return order[i];
      }
    }
    return 'bad';
  }

  // Circuito al azar con k ramas (2 = una malla, 3 = dos mallas), con corrientes de tamaño razonable.
  var NICE_E = [1.5, 3, 4.5, 6, 9, 12, 18, 24], NICE_R = [1, 2, 3, 4, 5, 6, 8, 10, 12];
  function random(rnd, k) {
    function pick(a) { return a[Math.floor(rnd() * a.length)]; }
    for (var tries = 0; tries < 200; tries++) {
      var c;
      if (k === 2) {
        c = { br: [[E(1, pick(NICE_E)), R(1, pick(NICE_R))], [R(2, pick(NICE_R)), E(2, pick(NICE_E), rnd() < 0.6)]] };
        if (rnd() < 0.5) c.br[0].reverse();
      } else {
        var mid = [R(2, pick(NICE_R))];
        if (rnd() < 0.3) mid.unshift(E(3, pick(NICE_E), rnd() < 0.5));
        c = { br: [[E(1, pick(NICE_E)), R(1, pick(NICE_R))], mid, [R(3, pick(NICE_R)), E(2, pick(NICE_E), rnd() < 0.7)]] };
      }
      var s = solve(c), ok = s.Iup.every(function (x) { return isFinite(x) && Math.abs(x) >= 0.1 && Math.abs(x) <= 12; });
      if (ok) return c;
    }
    return clone(PRESETS[k === 2 ? 0 : 2].c);
  }

  var PRESETS = [
    { name: 'Una malla: baterías opuestas', c: { br: [[E(1, 12), R(1, 4)], [R(2, 2), E(2, 6)]] } },
    { name: 'Una malla: baterías a favor', c: { br: [[E(1, 9), R(1, 3)], [R(2, 3), E(2, 3, false)]] } },
    { name: 'Dos mallas', c: { br: [[E(1, 12), R(1, 2)], [R(2, 6)], [R(3, 3), E(2, 6)]] } },
    { name: 'Dos mallas, batería en medio', c: { br: [[E(1, 12), R(1, 3)], [E(3, 3), R(2, 3)], [R(3, 6), E(2, 6)]] } }
  ];

  // Geometría del dibujo (px del viewBox): ramas verticales entre el cable de arriba y el de abajo.
  var GEO = { top: 56, bot: 300, H: 350, half: 26 };
  function geometry(c) {
    var k = c.br.length, W = k === 2 ? 480 : 600, xs = k === 2 ? [100, 380] : [90, 300, 510];
    var out = { W: W, H: GEO.H, top: GEO.top, bot: GEO.bot, xs: xs, els: [], arrows: [], loops: {} };
    c.br.forEach(function (b, j) {
      var ys = b.length === 1 ? [178] : b.length === 2 ? [230, 140] : [250, 190, 130];   // de abajo hacia arriba
      var side = j === 0 ? -1 : 1;
      b.forEach(function (e, i) {
        out.els.push({ id: e.id, t: e.t, v: e.v, up: e.up, b: j, x: xs[j], y: ys[i], side: side, lx: xs[j] + side * 22, ly: ys[i] + 5 });
      });
      out.arrows.push({ b: j, x: xs[j], y0: 70, y1: 104, lx: xs[j] - side * 14, ly: 92, anchor: side < 0 ? 'start' : 'end' });
    });
    // La flecha de la malla derecha va corrida a la derecha, lejos de las etiquetas de la rama central.
    loops(c).forEach(function (L) { out.loops[L.id] = { x0: xs[L.br[0]], x1: xs[L.br[1]], cx: (xs[L.br[0]] + xs[L.br[1]]) / 2 + (L.id === 'der' ? 25 : 0), cy: (GEO.top + GEO.bot) / 2 }; });
    out.node = { x: k === 3 ? xs[1] : xs[1] - 60 };
    return out;
  }

  window.LabMath.kirchhoff = {
    E: E, R: R, clone: clone, elements: elements, find: find, branchOf: branchOf, sub: sub,
    elName: elName, curName: curName, totals: totals, loops: loops, loopById: loopById, walk: walk,
    terms: terms, why: why, checkSigns: checkSigns, eqText: eqText, nodeText: nodeText,
    system: system, det: det, cramer: cramer, power: power, vab: vab, profile: profile,
    solve: solve, solveWith: solveWith, nodal: nodal, isolated: isolated,
    answers: answers, diagnose: diagnose, close: close, random: random,
    geometry: geometry, PRESETS: PRESETS
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var MSG = {
    ok: ['Coincide', ''],
    flip: ['Es el valor del sentido contrario', ''],
    emf: ['Revisa el signo de una batería', 'Ese valor sale si una batería se suma al revés. Al cruzar una batería de − a + el potencial sube (+ε); de + a − baja (−ε). Fíjate en qué placa es la larga.'],
    drop: ['Te faltó una batería', 'Ese valor sale si una de las baterías no está en la ecuación. Cada batería que cruza tu recorrido aporta +ε o −ε.'],
    isolated: ['Resolviste una malla como si estuviera sola', 'La rama del centro es de las dos mallas: su corriente no es la de una sola malla. Necesitas la regla de nodos y una ecuación por cada malla.'],
    node: ['Revisa la regla de nodos', 'Ese valor sale con un signo mal en la regla de nodos. Lo que entra al nodo es igual a lo que sale, según las flechas que elegiste.'],
    bad: ['No coincide', 'Escribe la regla de nodos y una ecuación por cada malla (revisa los signos con el paso 2), y resuelve el sistema por sustitución.']
  };

  window.Labs['kirchhoff-signs'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, K = window.LabMath.kirchhoff;
    var seed = 4242;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    var circ, dirs, loopId = 'izq', trav = 1, signs = {}, ask = 0, flagged = [], checked = false;

    var opts = K.PRESETS.map(function (p) { return p.name; }).concat(['Al azar: una malla', 'Al azar: dos mallas']);
    var pSel = UI.select({ label: 'Circuito', options: opts });
    var newBtn = UI.button('Otro al azar', 'ghost', function () {
      var cur = +pSel.input.value;
      pSel.input.value = String(cur === K.PRESETS.length ? cur : K.PRESETS.length + 1);
      load();
    });
    var curBox = h('div', { class: 'ks-currents' });
    var nodeP = h('p', { class: 'lab-note ks-node' });
    var loopSel = UI.select({ label: 'Malla', options: ['x'] });
    var travSel = UI.select({ label: 'Recorrido', options: ['horario ↻', 'antihorario ↺'] });
    var termBox = h('ol', { class: 'ks-terms' });
    var eqP = h('p', { class: 'ks-eq', 'aria-live': 'polite' });
    var signBtn = UI.button('Revisar signos', 'primary', checkSigns);
    var showBtn = UI.button('Ver los signos correctos', 'ghost', function () {
      K.terms(circ, loopId, trav, dirs).forEach(function (t) { signs[t.id] = t.sign; });
      buildTerms(); checkSigns();
    });
    var signV = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var whyList = h('ul', { class: 'ks-why' });
    var askP = h('p', { class: 'lab-note' });
    var askBtn = UI.button('Pregunta por otra corriente', 'ghost', function () { ask = (ask + 1) % (circ.br.length === 2 ? 1 : 3); fillAsk(); verdict.hidden = true; checked = false; });
    var aIn = UI.input({ label: 'Tu corriente (A)', type: 'number', step: 'any', inputmode: 'decimal', mono: false, hint: 'Con el signo que corresponde a tu flecha: si la corriente real va al revés, escribe el valor negativo.' });
    var run = UI.button('Comprobar', 'primary', checkCurrent);
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var note = h('p', { class: 'lab-note' });
    var facts = h('dl', { class: 'lab-facts' });
    var status = h('p', { class: 'lab-note ks-status' });
    var svg = UI.svg(600, 350, 'Circuito de una o dos mallas con baterías y resistores');
    svg.classList.add('ks-stage');

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        pSel.node, h('div', { class: 'lab-buttons' }, [newBtn]), note,
        h('p', { class: 'lab-field__label ks-head' }, ['1 · Elige el sentido de cada corriente']),
        h('p', { class: 'lab-note' }, ['Toca una flecha del circuito para invertirla, o usa las listas. Cualquier sentido sirve.']),
        curBox, nodeP,
        h('p', { class: 'lab-field__label ks-head' }, ['2 · Pon los signos de una ecuación de malla']),
        h('div', { class: 'lab-row' }, [loopSel.node, travSel.node]),
        termBox, eqP,
        h('div', { class: 'lab-buttons' }, [signBtn, showBtn]), signV, whyList,
        h('p', { class: 'lab-field__label ks-head' }, ['3 · Calcula una corriente']),
        askP, h('div', { class: 'lab-buttons' }, [askBtn]), aIn.node, h('div', { class: 'lab-buttons' }, [run]), verdict,
        h('details', { class: 'ks-details' }, [h('summary', {}, ['Ver la solución del lab']), facts])
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Toca una flecha para invertir su corriente']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'tu corriente']),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'malla que recorres']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'signo mal'])
        ]),
        status
      ])
    ]));
    var form = mount.querySelector('form');
    form.addEventListener('submit', function (e) { e.preventDefault(); checkCurrent(); });
    aIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); checkCurrent(); } });
    pSel.input.addEventListener('change', load);
    loopSel.input.addEventListener('change', function () { loopId = K.loops(circ)[+loopSel.input.value].id; resetSigns(); });
    travSel.input.addEventListener('change', function () { trav = travSel.input.value === '0' ? 1 : -1; resetSigns(); });

    function load() {
      var i = +pSel.input.value;
      if (i < K.PRESETS.length) circ = K.clone(K.PRESETS[i].c);
      else circ = K.random(rnd, i === K.PRESETS.length ? 2 : 3);
      dirs = circ.br.length === 2 ? [1, -1] : [1, 1, 1];
      loopId = K.loops(circ)[0].id; trav = 1; ask = circ.br.length === 2 ? 0 : 1;
      loopSel.input.innerHTML = '';
      K.loops(circ).forEach(function (L, j) { loopSel.input.appendChild(h('option', { value: String(j) }, [L.name[0].toUpperCase() + L.name.slice(1)])); });
      loopSel.input.value = '0'; travSel.input.value = '0';
      loopSel.input.disabled = circ.br.length === 2;
      note.textContent = 'Resuelve el circuito con las leyes de Kirchhoff: primero los sentidos, luego los signos y al final una corriente.';
      aIn.input.value = '';
      buildCurrents(); resetSigns(); fillAsk(); verdict.hidden = true; checked = false;
    }
    function resetSigns() { signs = {}; flagged = []; signV.hidden = true; whyList.innerHTML = ''; buildTerms(); draw(); }

    function buildCurrents() {
      curBox.innerHTML = '';
      if (circ.br.length === 2) {
        var s = UI.select({ label: 'Corriente I', options: ['horario ↻', 'antihorario ↺'] });
        s.input.value = dirs[0] > 0 ? '0' : '1';
        s.input.addEventListener('change', function () { var d = s.input.value === '0' ? 1 : -1; dirs = [d, -d]; afterDirs(); });
        curBox.appendChild(s.node);
        return;
      }
      var row = h('div', { class: 'ks-cur-row' });
      circ.br.forEach(function (_, j) {
        var s = UI.select({ label: K.curName(circ, j), options: ['↑ arriba', '↓ abajo'] });
        s.input.value = dirs[j] > 0 ? '0' : '1';
        s.input.addEventListener('change', function () { dirs[j] = s.input.value === '0' ? 1 : -1; afterDirs(); });
        row.appendChild(s.node);
      });
      curBox.appendChild(row);
    }
    function afterDirs() {
      flagged = []; signV.hidden = true; whyList.innerHTML = '';
      buildCurrents(); buildTerms(); fillAsk();
      if (checked) checkCurrent(); else draw();
    }
    function flip(j) {
      if (circ.br.length === 2) dirs = [-dirs[0], -dirs[1]]; else dirs[j] = -dirs[j];
      afterDirs();
    }

    function buildTerms() {
      termBox.innerHTML = '';
      K.terms(circ, loopId, trav, dirs).forEach(function (t, i) {
        var label = t.t === 'R' ? K.elName(t.id) + K.curName(circ, t.b) + ' (resistor)' : K.elName(t.id) + ' (batería)';
        var s = UI.select({ label: (i + 1) + '. ' + label, options: ['?', '+', '−'] });
        s.input.value = signs[t.id] > 0 ? '1' : signs[t.id] < 0 ? '2' : '0';
        s.input.addEventListener('change', function () {
          var v = s.input.value; signs[t.id] = v === '1' ? 1 : v === '2' ? -1 : 0;
          flagged = []; signV.hidden = true; whyList.innerHTML = '';
          eqP.textContent = K.eqText(circ, loopId, trav, dirs, signs); draw();
        });
        termBox.appendChild(h('li', {}, [s.node]));
      });
      eqP.textContent = K.eqText(circ, loopId, trav, dirs, signs);
      var nt = K.nodeText(circ, dirs);
      var same = dirs.every(function (d) { return d === dirs[0]; });
      nodeP.textContent = nt ? 'Regla de nodos en a (lo que entra = lo que sale): ' + nt + (same ? '. Todas tus flechas apuntan igual: alguna corriente saldrá negativa, y está bien.' : '') :'Una sola malla: la misma corriente I pasa por todo el circuito; no hace falta regla de nodos.';
    }

    function checkSigns() {
      var r = K.checkSigns(circ, loopId, trav, dirs, signs);
      whyList.innerHTML = '';
      flagged = r.rows.filter(function (x) { return !x.ok && !x.missing; }).map(function (x) { return x.id; });
      if (r.missing) UI.verdict(signV, 'warn', 'Faltan signos', 'Elige + o − en cada término (' + r.missing + ' sin elegir).');
      else if (r.allOk) UI.verdict(signV, 'ok', 'Signos correctos', K.eqText(circ, loopId, trav, dirs));
      else {
        UI.verdict(signV, r.wrong === 1 ? 'warn' : 'bad', r.wrong === 1 ? 'Un signo mal' : r.wrong + ' signos mal', 'Los términos marcados en el circuito:');
        r.rows.forEach(function (x) { if (!x.ok && !x.missing) whyList.appendChild(h('li', {}, [x.why])); });
      }
      draw();
    }

    function dirWord(j) {
      if (circ.br.length === 2) return dirs[0] > 0 ? 'horario' : 'antihorario';
      return dirs[j] > 0 ? 'hacia arriba' : 'hacia abajo';
    }
    function fillAsk() {
      askP.textContent = '¿Cuánto vale ' + K.curName(circ, ask) + ' con la flecha que elegiste (' + dirWord(ask) + ')? En amperes; puede salir negativa.';
      askBtn.hidden = circ.br.length === 2;
    }
    function f3(v) { return UI.fmt(Math.abs(v) < 5e-10 ? 0 : v, 3); }
    function checkCurrent() {
      var val = parseFloat(String(aIn.input.value).replace(',', '.').replace('−', '-'));
      var r = K.diagnose(circ, dirs, ask, val), s = K.solve(circ, dirs), I = s.I[ask], n = K.curName(circ, ask);
      var m = MSG[r] || MSG.bad, txt = m[1];
      if (r === 'ok') txt = 'Con tu flecha, ' + n + ' = ' + f3(I) + ' A.' + (I < 0 ? ' El signo − solo dice que la corriente real va al revés de tu flecha. Está bien: no hace falta volver a resolver.' : ' Salió positiva: la corriente real va en el sentido de tu flecha.');
      if (r === 'flip') txt = 'Con la flecha que elegiste (' + dirWord(ask) + '), ' + n + ' = ' + f3(I) + ' A. Tu número es el del sentido contrario. Las dos cosas son ciertas, pero el signo tiene que ir de acuerdo con tu flecha: o escribes ' + f3(I) + ' A, o inviertes la flecha.';
      UI.verdict(verdict, r === 'ok' ? 'ok' : r === 'bad' ? 'bad' : 'warn', m[0], txt);
      checked = true;
      draw();
    }

    function el(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n);
      return n;
    }
    function line(x1, y1, x2, y2, cls, w, g) { return el('path', { d: 'M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2, 'class': cls, 'stroke-width': w || 2.4, fill: 'none', 'stroke-linecap': 'round' }, g); }
    function txt(x, y, s, size, anchor, g) {
      var t = el('text', { x: x, y: y, 'class': 'ann', 'text-anchor': anchor || 'middle', 'font-size': size || 16 }, g);
      t.textContent = s;
      return t;
    }
    function arrowPath(x, y, dx, dy, cls, w, g) {
      var L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, hh = 10, ex = x + dx, ey = y + dy;
      return el('path', { d: 'M' + x + ' ' + y + 'L' + ex + ' ' + ey + 'M' + (ex - ux * hh - uy * hh * 0.6) + ' ' + (ey - uy * hh + ux * hh * 0.6) + 'L' + ex + ' ' + ey + 'L' + (ex - ux * hh + uy * hh * 0.6) + ' ' + (ey - uy * hh - ux * hh * 0.6),
        'class': cls, 'stroke-width': w || 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    }

    // Etiqueta de un elemento en dos renglones: nombre arriba, valor abajo.
    function label(e, val, g) {
      var an = e.side < 0 ? 'end' : 'start';
      txt(e.lx, e.y - 8, K.elName(e.id), 24, an, g);
      txt(e.lx, e.y + 22, val, 22, an, g);
    }
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var G = K.geometry(circ), L = G.loops[loopId], g = el('g', {});
      svg.setAttribute('viewBox', '0 0 ' + G.W + ' ' + G.H);
      // Malla elegida: sus cables resaltados debajo de todo.
      el('path', { d: 'M' + L.x0 + ' ' + G.bot + 'L' + L.x0 + ' ' + G.top + 'L' + L.x1 + ' ' + G.top + 'L' + L.x1 + ' ' + G.bot + 'Z', 'class': 'trace ks-loop', 'stroke-width': 9, fill: 'none', 'stroke-linejoin': 'round' }, g);
      // Cables: arriba, abajo y cada rama entre sus elementos.
      line(G.xs[0], G.top, G.xs[G.xs.length - 1], G.top, 'axis', 2.4, g);
      line(G.xs[0], G.bot, G.xs[G.xs.length - 1], G.bot, 'axis', 2.4, g);
      circ.br.forEach(function (b, j) {
        var mine = G.els.filter(function (e) { return e.b === j; }), y = G.bot;
        mine.forEach(function (e) { line(e.x, y, e.x, e.y + GEO.half, 'axis', 2.4, g); y = e.y - GEO.half; });
        line(G.xs[j], y, G.xs[j], G.top, 'axis', 2.4, g);
      });
      if (circ.br.length === 3) { el('circle', { cx: G.xs[1], cy: G.top, r: 5, 'class': 'dot-ref' }, g); el('circle', { cx: G.xs[1], cy: G.bot, r: 5, 'class': 'dot-ref' }, g); }
      txt(G.node.x, G.top - 16, 'a', 22, 'middle', g);
      txt(G.node.x, G.bot + 32, 'b', 22, 'middle', g);
      // Elementos.
      G.els.forEach(function (e) {
        var cls = flagged.indexOf(e.id) >= 0 ? 'error' : 'ref', x = e.x, y = e.y, hh = GEO.half;
        if (e.t === 'R') {
          var d = 'M' + x + ' ' + (y - hh) + 'L' + x + ' ' + (y - 18);
          for (var i = 0; i < 6; i++) d += 'L' + (x + (i % 2 ? -9 : 9)) + ' ' + (y - 18 + 6 * (i + 0.5));
          d += 'L' + x + ' ' + (y + 18) + 'L' + x + ' ' + (y + hh);
          el('path', { d: d, 'class': cls, 'stroke-width': flagged.indexOf(e.id) >= 0 ? 3.6 : 2.8, fill: 'none', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
          label(e, f3(e.v) + ' Ω', g);
        } else {
          var yl = e.up ? y - 5 : y + 5, ys = e.up ? y + 5 : y - 5;
          line(x, y - hh, x, Math.min(yl, ys), 'axis', 2.4, g); line(x, Math.max(yl, ys), x, y + hh, 'axis', 2.4, g);
          line(x - 18, yl, x + 18, yl, cls, 3, g); line(x - 9, ys, x + 9, ys, cls, 6, g);
          label(e, f3(e.v) + ' V', g);
          txt(x - e.side * 30, e.up ? y - 4 : y + 19, '+', 22, 'middle', g);
          txt(x - e.side * 30, e.up ? y + 19 : y - 4, '−', 22, 'middle', g);
        }
      });
      // Flechas de corriente (se tocan para invertirlas).
      G.arrows.forEach(function (a) {
        var up = dirs[a.b] > 0, y0 = up ? a.y1 : a.y0, y1 = up ? a.y0 : a.y1;
        arrowPath(a.x, y0, 0, y1 - y0, 'aux', 3.4, g);
        txt(a.lx, a.ly, K.curName(circ, a.b), 24, a.anchor, g);
        el('rect', { x: a.x - 34, y: a.y0 - 8, width: 68, height: a.y1 - a.y0 + 16, 'class': 'ks-hit', 'data-cur': a.b }, g);
      });
      // Sentido de recorrido: flecha circular en el centro de una malla interior; en la exterior,
      // flechas sobre los cables de arriba y de abajo.
      if (loopId === 'ext') {
        [G.loops.izq.cx, G.loops.der.cx].forEach(function (x) {
          arrowPath(x - trav * 16, G.top, trav * 32, 0, 'trace', 3, g);
          arrowPath(x + trav * 16, G.bot, -trav * 32, 0, 'trace', 3, g);
        });
      } else {
        var r = 24, a0 = -100, a1 = 200, pts = [], n = 24;
        for (var i2 = 0; i2 <= n; i2++) {
          var t = (trav > 0 ? a0 + (a1 - a0) * i2 / n : a1 - (a1 - a0) * i2 / n) * Math.PI / 180;
          pts.push([L.cx + r * Math.cos(t), L.cy + r * Math.sin(t)]);
        }
        el('path', { d: pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(''), 'class': 'trace', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
        var p1 = pts[n], p0 = pts[n - 2];
        arrowPath(p0[0], p0[1], p1[0] - p0[0], p1[1] - p0[1], 'trace', 3, g);
        el('circle', { cx: L.cx, cy: L.cy, r: 34, 'class': 'ks-hit', 'data-trav': 1 }, g);
      }

      var lp = K.loopById(circ, loopId);
      status.textContent = 'Recorres ' + lp.name + ' en sentido ' + (trav > 0 ? 'horario' : 'antihorario') + '. Toca la flecha del recorrido para invertirlo.';
      var s = K.solve(circ, dirs);
      facts.innerHTML = '';
      var rows = [];
      circ.br.forEach(function (_, j) {
        if (circ.br.length === 2 && j > 0) return;
        rows.push([K.curName(circ, j) + ' (tu flecha: ' + dirWord(j) + ')', f3(s.I[j]) + ' A' + (s.I[j] < 0 ? ' → va al revés' : '')]);
      });
      rows.push(['V_a − V_b', f3(s.V) + ' V']);
      Object.keys(s.P.src).forEach(function (id) { var p = s.P.src[id]; rows.push(['Potencia de ' + K.elName(id), f3(p) + ' W' + (p < 0 ? ' (se está cargando)' : ' (entrega)')]); });
      rows.push(['Σ I²R', f3(s.P.diss) + ' W'], ['Σ potencia de las baterías', f3(s.P.gen) + ' W']);
      rows.forEach(function (r2) { facts.appendChild(h('dt', {}, [r2[0]])); facts.appendChild(h('dd', {}, [r2[1]])); });
    }

    svg.addEventListener('click', function (ev) {
      var t = ev.target.closest ? ev.target.closest('[data-cur], [data-trav]') : null;
      if (!t) return;
      if (t.hasAttribute('data-cur')) flip(+t.getAttribute('data-cur'));
      else { trav = -trav; travSel.input.value = trav > 0 ? '0' : '1'; resetSigns(); }
    });

    // Ejemplo cargado: un compañero puso «−» a todos los resistores en la malla izquierda.
    pSel.input.value = String(cfg.preset != null ? cfg.preset : 2);
    load();
    (function () {
      K.terms(circ, loopId, trav, dirs).forEach(function (t) { signs[t.id] = t.t === 'R' ? -1 : t.sign; });
      buildTerms();
      note.textContent = 'Ejemplo cargado: un compañero le puso «−» a todos los resistores de esta malla, «porque en un resistor el voltaje baja». ¿Cuál está mal? Revisa y luego cambia lo que quieras.';
      checkSigns();
    })();
    return Promise.resolve();
  };
})();
