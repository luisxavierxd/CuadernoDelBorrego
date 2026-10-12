/* =====================================================================
   Lab kirchhoff-solve (Física 2 · S14): el alumno plantea, el solver resuelve y compara.
   Un circuito de 2 o 3 mallas (presets y al azar; uno con capacitor en estado estable).
   El alumno elige el sentido de cada corriente y escribe sus ecuaciones, una por renglón
   (coeficientes de I₁, I₂, I₃ y lado derecho). El lab:
     1. revisa cada ecuación: es válida si es combinación lineal de las leyes de Kirchhoff
        verdaderas con esos sentidos (pertenece al espacio de filas; rango con eliminación propia),
        y si el conjunto es independiente y suficiente;
     2. resuelve el sistema del alumno con math.js (math.lusolve) y muestra sus corrientes;
     3. lo compara con el solver nodal genérico de S10 (LabMath.capnet.nodal, conductancias 1/R).
   «Casi»: un término con el signo al revés (dice cuál), ecuaciones dependientes (la malla
   grande es la suma de las otras dos), faltan ecuaciones, o se recorrió el capacitor como
   si fuera un cable (en estado estable por él no pasa corriente).

   LabMath.kirchsys (pura, sin DOM). Unidades: R en Ω, ε en V, I en A, C en μF → Q en μC.
     Topologías:
       'two'   dos nodos (a arriba, b abajo) unidos por tres ramas verticales; incógnitas =
               corrientes de rama I₁, I₂, I₃ (s = +1: hacia arriba). Dos mallas.
       'three' tres ventanas: nodos T1, T2 arriba y B abajo; ramas L (izquierda, de B a T1),
               V1 (T1→B), H2 (T1→T2), V2 (T2→B) y Rt (derecha, de T2 a B). Incógnitas =
               corrientes de malla I₁, I₂, I₃ (s = +1: horario). Tres mallas. Con spec.C, la
               rama Rt lleva un capacitor (en estado estable queda abierta).
     spec: { topo, R: [..], E: [..] (fem que sube de a hacia b en cada rama), C? (μF) }
     Corriente de rama i_k (de a hacia b) = Σ_j M0[k][j]·s_j·x_j.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  var SUB = '₀₁₂₃₄₅₆₇₈₉';
  function sub(n) { return String(n).split('').map(function (d) { return SUB[+d] || d; }).join(''); }
  function capnet() {
    var c = window.LabMath && window.LabMath.capnet;
    if (!c || typeof c.nodal !== 'function') throw new Error('Falta LabMath.capnet (capacitor-network.js)');
    return c;
  }

  function build(spec) {
    if (spec && spec.branches) return spec;                      // ya es un circuito
    var R = spec.R, E = spec.E || [], c;
    if (spec.topo === 'two') {
      c = {
        topo: 'two', kind: 'branch', nodes: ['B', 'A'],
        branches: [0, 1, 2].map(function (k) { return { k: k, a: 'B', b: 'A', R: R[k], E: E[k] || 0, C: 0 }; }),
        M0: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
        // Ventanas recorridas en sentido horario: [rama, orientación] (+1 = de a hacia b).
        windows: [[[0, 1], [1, -1]], [[1, 1], [2, -1]]]
      };
    } else {
      var ends = [['B', 'T1'], ['T1', 'B'], ['T1', 'T2'], ['T2', 'B'], ['T2', 'B']];
      c = {
        topo: 'three', kind: 'mesh', nodes: ['B', 'T1', 'T2'],
        branches: ends.map(function (d, k) { return { k: k, a: d[0], b: d[1], R: R[k], E: E[k] || 0, C: k === 4 && spec.C ? spec.C : 0 }; }),
        M0: [[1, 0, 0], [1, -1, 0], [0, 1, 0], [0, 1, -1], [0, 0, 1]],
        windows: [[[0, 1], [1, 1]], [[2, 1], [3, 1], [1, -1]], [[4, 1], [3, -1]]]
      };
    }
    c.spec = spec;
    // Nombres: R con el número de la rama; las fem se numeran en orden de aparición.
    var ne = 0;
    c.branches.forEach(function (br) { br.rName = 'R' + sub(br.k + 1); br.eName = br.E ? 'ε' + sub(++ne) : ''; });
    return c;
  }
  function hasCap(c) { return c.branches.some(function (br) { return br.C > 0; }); }
  function matrix(c, s) {
    s = s || [1, 1, 1];
    return c.M0.map(function (row) { return row.map(function (m, j) { return m * s[j]; }); });
  }
  function addTo(acc, v, f) { for (var j = 0; j < v.length; j++) acc[j] += f * v[j]; return acc; }
  function zero(n) { return new Array(n).fill(0); }
  function isZero(row, eps) { return row.every(function (x) { return Math.abs(x) <= (eps || 1e-12); }); }

  // KCL en el nodo n: Σ (corrientes que entran) = 0, escrito con las incógnitas.
  function nodeRow(c, M, n) {
    var row = zero(4);
    c.branches.forEach(function (br, k) {
      if (br.b === n) addTo(row, M[k], 1);
      if (br.a === n) addTo(row, M[k], -1);
    });
    return row;
  }
  // KVL en un lazo [[rama, orientación]]: Σ o·R·i = Σ o·ε  (caídas en el sentido del recorrido = fem).
  function loopRow(c, M, loop) {
    var row = zero(4);
    loop.forEach(function (p) { var br = c.branches[p[0]]; addTo(row, M[p[0]], p[1] * br.R); row[3] += p[1] * br.E; });
    return row;
  }
  function crosses(loop, k) { return loop.some(function (p) { return p[0] === k; }); }

  // Lazos fundamentales del grafo con las ramas permitidas (árbol por BFS + una cuerda por lazo).
  function cycles(c, allowed) {
    var root = c.nodes[0], parent = {}, via = {}, seen = {}, queue = [root], tree = {};
    seen[root] = true;
    while (queue.length) {
      var u = queue.shift();
      c.branches.forEach(function (br, k) {
        if (!allowed(k) || tree[k]) return;
        var w = br.a === u ? br.b : br.b === u ? br.a : null;
        if (w == null || seen[w]) return;
        seen[w] = true; parent[w] = u; via[w] = k; tree[k] = true; queue.push(w);
      });
    }
    function up(n) { var p = [n]; while (parent[n] != null) { n = parent[n]; p.push(n); } return p; }
    // Recorrido por el árbol de u a v como [[rama, orientación]].
    function path(u, v) {
      var pu = up(u), pv = up(v), lca = null;
      for (var i = 0; i < pu.length && lca == null; i++) if (pv.indexOf(pu[i]) >= 0) lca = pu[i];
      var out = [], n = u;
      while (n !== lca) { var k = via[n]; out.push([k, c.branches[k].a === n ? 1 : -1]); n = parent[n]; }
      var down = [];
      n = v;
      while (n !== lca) { var k2 = via[n]; down.push([k2, c.branches[k2].b === n ? 1 : -1]); n = parent[n]; }
      return out.concat(down.reverse());
    }
    var out = [];
    c.branches.forEach(function (br, k) {
      if (!allowed(k) || tree[k] || !seen[br.a] || !seen[br.b]) return;
      out.push([[k, 1]].concat(path(br.b, br.a)));
    });
    return out;
  }

  // Todas las ecuaciones verdaderas (sus combinaciones lineales son el espacio de filas):
  // KCL en cada nodo, KVL en los lazos que no cruzan un capacitor y «corriente 0» en cada
  // capacitor. Con short = true el capacitor se trata como un cable (el error típico).
  function equations(c, s, short) {
    var M = matrix(c, s), rows = [];
    c.nodes.forEach(function (n) { var r = nodeRow(c, M, n); if (!isZero(r)) rows.push(r); });
    var open = function (k) { return short || !c.branches[k].C; };
    cycles(c, open).forEach(function (L) { var r = loopRow(c, M, L); if (!isZero(r)) rows.push(r); });
    if (!short) c.branches.forEach(function (br, k) { if (br.C) { var r = M[k].concat([0]); if (!isZero(r)) rows.push(r); } });
    return rows;
  }
  // Un sistema correcto «de libro»: nodo de arriba + ventanas (corrientes de rama), o las tres
  // ventanas (corrientes de malla); la ventana que cruza un capacitor se cambia por I = 0.
  function standard(c, s) {
    var M = matrix(c, s), rows = [];
    if (c.kind === 'branch') rows.push(nodeRow(c, M, 'A'));
    c.windows.forEach(function (w) {
      var cap = w.filter(function (p) { return c.branches[p[0]].C; })[0];
      if (!cap) { rows.push(loopRow(c, M, w)); return; }
      var r = M[cap[0]].concat([0]), lead = r.filter(function (x) { return x; })[0];
      rows.push(r.map(function (x) { return lead < 0 ? -x : x; }));
    });
    // Diagonal positiva (como se escribe a mano); el cambio de signo no altera la ecuación.
    return rows.map(function (r, i) { var f = r[i] < 0 ? -1 : 1; return r.map(function (x) { return x === 0 ? 0 : f * x; }); });
  }

  // Rango por eliminación de Gauss con pivoteo parcial; cada renglón se normaliza antes.
  function rank(rows, tol) {
    var A = rows.filter(function (r) { return !isZero(r, 0); }).map(function (r) {
      var m = Math.max.apply(null, r.map(Math.abs));
      return r.map(function (x) { return x / m; });
    });
    var m = A.length, n = m ? A[0].length : 0, rk = 0, eps = tol || 1e-9;
    for (var col = 0; col < n && rk < m; col++) {
      var p = rk;
      for (var r = rk + 1; r < m; r++) if (Math.abs(A[r][col]) > Math.abs(A[p][col])) p = r;
      if (Math.abs(A[p][col]) <= eps) continue;
      var t = A[rk]; A[rk] = A[p]; A[p] = t;
      for (var r2 = rk + 1; r2 < m; r2++) {
        var f = A[r2][col] / A[rk][col];
        if (f) for (var k = col; k < n; k++) A[r2][k] -= f * A[rk][k];
      }
      rk++;
    }
    return rk;
  }
  function inSpan(basis, row, tol) { return rank(basis.concat([row]), tol) === rank(basis, tol); }

  // Sistema cuadrado con eliminación de Gauss propia (pivoteo parcial). Singular → null.
  function gauss(A0, b0) {
    var n = b0.length, A = A0.map(function (r) { return r.slice(); }), b = b0.slice();
    var scale = Math.max.apply(null, A.map(function (r) { return Math.max.apply(null, r.map(Math.abs)); })) || 1;
    for (var c = 0; c < n; c++) {
      var p = c;
      for (var r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      if (!(Math.abs(A[p][c]) > 1e-10 * scale)) return null;
      var t = A[c]; A[c] = A[p]; A[p] = t; var tb = b[c]; b[c] = b[p]; b[p] = tb;
      for (var r2 = c + 1; r2 < n; r2++) {
        var f = A[r2][c] / A[c][c];
        for (var k = c; k < n; k++) A[r2][k] -= f * A[c][k];
        b[r2] -= f * b[c];
      }
    }
    var x = new Array(n);
    for (var i = n - 1; i >= 0; i--) { var s = b[i]; for (var j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
    return x;
  }
  function solveRows(rows) { return gauss(rows.map(function (r) { return r.slice(0, 3); }), rows.map(function (r) { return r[3]; })); }

  // Solución real por el solver nodal de S10: conductancias 1/R, cada fem como fuente de
  // corriente ε/R en paralelo (Norton) y el nodo de abajo a tierra. La rama del capacitor
  // no entra: en estado estable está abierta.
  function solveNodal(spec, s) {
    var c = build(spec), inj = {}, G = [];
    c.nodes.forEach(function (n) { inj[n] = 0; });
    c.branches.forEach(function (br) {
      if (br.C) return;
      G.push({ a: br.a, b: br.b, value: 1 / br.R });
      inj[br.a] -= br.E / br.R; inj[br.b] += br.E / br.R;
    });
    var pot = capnet().nodal({ nodes: c.nodes, branches: G, fixed: { B: 0 }, inject: inj });
    var i = c.branches.map(function (br) { return br.C ? 0 : (pot[br.a] - pot[br.b] + br.E) / br.R; });
    // Incógnitas con los sentidos elegidos: mínimos cuadrados (MᵀM)x = Mᵀi (M tiene rango 3).
    var M = matrix(c, s), MtM = [0, 1, 2].map(function (p) { return [0, 1, 2].map(function (q) { return M.reduce(function (t, r) { return t + r[p] * r[q]; }, 0); }); });
    var Mti = [0, 1, 2].map(function (p) { return M.reduce(function (t, r, k) { return t + r[p] * i[k]; }, 0); });
    var x = gauss(MtM, Mti);
    var caps = [];
    c.branches.forEach(function (br, k) { if (br.C) { var V = pot[br.a] - pot[br.b] + br.E; caps.push({ k: k, C: br.C, V: V, Q: br.C * Math.abs(V) }); } });
    var Psup = 0, Pdis = 0;
    c.branches.forEach(function (br, k) { Psup += br.E * i[k]; Pdis += br.R * i[k] * i[k]; });
    var P = c.branches.map(function (br, k) { return br.E * i[k]; });
    return { pot: pot, i: i, x: x, caps: caps, Q: caps.length ? caps[0].Q : 0, VC: caps.length ? caps[0].V : 0, Psup: Psup, Pdis: Pdis, P: P };
  }

  // ¿Una ecuación es válida? 'empty' | 'ok' | 'sign' (term: 0–2 una corriente, 3 el lado derecho)
  // | 'cap' (sería válida si el capacitor fuera un cable) | 'zero' (0 = algo) | 'bad'.
  function checkRow(c, s, row) {
    if (isZero(row, 0)) return { kind: 'empty' };
    if (isZero(row.slice(0, 3), 0)) return { kind: 'zero' };
    var T = equations(c, s);
    if (inSpan(T, row)) return { kind: 'ok' };
    for (var j = 0; j < 4; j++) {
      if (!row[j]) continue;
      var f = row.slice(); f[j] = -f[j];
      if (inSpan(T, f)) return { kind: 'sign', term: j };
    }
    if (hasCap(c) && inSpan(equations(c, s, true), row)) return { kind: 'cap' };
    return { kind: 'bad' };
  }
  // Cuando las ecuaciones no alcanzan rango 3: cuál se obtiene de las otras y con qué factores.
  function dependency(rows) {
    var A = rows.map(function (r) { return r.slice(0, 3); }), n = A.length;
    for (var k = n - 1; k >= 0; k--) {
      var others = A.filter(function (r, i) { return i !== k; }), idx = [];
      for (var i = 0; i < n; i++) if (i !== k) idx.push(i);
      if (rank(others) !== rank(A)) continue;
      // Mínimos cuadrados con las otras (1 o 2 renglones).
      var use = idx.filter(function (i) { return !isZero(A[i]); });
      if (use.length === 2 && rank([A[use[0]], A[use[1]]]) < 2) use = [use[0]];
      var G = use.map(function (p) { return use.map(function (q) { return A[p].reduce(function (t, x, j) { return t + x * A[q][j]; }, 0); }); });
      var g = use.map(function (p) { return A[p].reduce(function (t, x, j) { return t + x * A[k][j]; }, 0); });
      var lam = use.length ? gauss(G, g) : [];
      if (lam) return { k: k, with: use, lambda: lam };
    }
    return null;
  }
  function checkSystem(c, s, rows) {
    var used = [], res = rows.map(function (r, i) { var o = checkRow(c, s, r); if (o.kind !== 'empty') used.push(i); return o; });
    var A = used.map(function (i) { return rows[i]; });
    var rk = rank(A.map(function (r) { return r.slice(0, 3); }));
    var out = { rows: res, used: used, rank: rk, solvable: used.length === 3 && rk === 3, dep: null, x: null };
    if (used.length >= 2 && rk < used.length) {
      var d = dependency(A);
      if (d) out.dep = { k: used[d.k], with: d.with.map(function (i) { return used[i]; }), lambda: d.lambda };
    }
    if (out.solvable) out.x = solveRows(A);
    var bad = res.filter(function (o) { return o.kind !== 'ok' && o.kind !== 'empty'; });
    out.verdict = res.some(function (o) { return o.kind === 'cap'; }) ? 'cap'
      : res.some(function (o) { return o.kind === 'sign'; }) ? 'sign'
        : bad.length ? 'bad'
          : used.length < 3 && rk === used.length ? 'missing'
            : rk < 3 ? 'dependent' : 'ok';
    return out;
  }

  // Texto de una ecuación: «6I₁ − 4I₂ = 12».
  function num(v) { return String(Number((+v).toPrecision(6))).replace('-', '−'); }
  function eqText(row) {
    var t = '';
    for (var j = 0; j < 3; j++) {
      var a = row[j];
      if (!a) continue;
      var mag = Math.abs(a), co = mag === 1 ? '' : num(mag);
      t += (t ? (a < 0 ? ' − ' : ' + ') : (a < 0 ? '−' : '')) + co + 'I' + sub(j + 1);
    }
    return (t || '0') + ' = ' + num(row[3]);
  }

  // Circuito al azar con valores de resistencia y fem «de libro».
  var RV = [1, 2, 3, 4, 5, 6, 8, 10], EV = [3, 4, 5, 6, 9, 10, 12, 15, 18, 24], CV = [1, 2, 4, 5, 10, 20];
  function random(rnd, topo, cap) {
    function pick(a) { return a[Math.floor(rnd() * a.length)]; }
    function emf() { return pick(EV) * (rnd() < 0.75 ? 1 : -1); }
    if (topo === 'two') return { topo: 'two', R: [pick(RV), pick(RV), pick(RV)], E: [emf(), rnd() < 0.35 ? emf() : 0, emf()] };
    var R = [pick(RV), pick(RV), pick(RV), pick(RV), pick(RV)], E = [emf(), 0, 0, rnd() < 0.3 ? emf() : 0, 0];
    if (cap) return { topo: 'three', R: R, E: E, C: pick(CV) };
    E[4] = rnd() < 0.8 ? emf() : 0;
    return { topo: 'three', R: R, E: E };
  }

  // Geometría del dibujo (px del viewBox). Elementos: res, bat, cap con su centro y dirección;
  // etiquetas [{x, y, parts: [[texto, sub?]], anchor, size}]; flechas de rama o arcos de malla.
  function geometry(c, s) {
    s = s || [1, 1, 1];
    var g = { wires: [], res: [], bats: [], caps: [], dots: [], labels: [], arrows: [], arcs: [] };
    function lab(x, y, parts, anchor, size) { g.labels.push({ x: x, y: y, parts: parts, anchor: anchor || 'start', size: size || 16 }); }
    function nameParts(n, rest) { return [[n.charAt(0)], [n.slice(1), true], [rest]]; }
    // Rama vertical en x de yTop a yBot con elementos [{t, y}] ordenados de arriba abajo.
    // plusDown: la fem positiva sube hacia abajo (la placa + queda abajo).
    function vertical(x, yTop, yBot, els, br, side, plusDown) {
      var y = yTop;
      els.forEach(function (e) {
        var half = e.t === 'res' ? 30 : 6;
        g.wires.push([x, y, x, e.y - half]);
        y = e.y + half;
        var off = e.t === 'res' ? 18 : 26, lx = side > 0 ? x + off : x - off, an = side > 0 ? 'start' : 'end';
        if (e.t === 'res') { g.res.push({ x: x, y: e.y, dir: 'v', k: br.k }); lab(lx, e.y + 5, nameParts(br.rName, ' = ' + num(br.R) + ' Ω'), an); }
        if (e.t === 'bat') {
          var plusTop = (br.E > 0) !== !!plusDown;
          g.bats.push({ x: x, y: e.y, dir: 'v', plusFirst: plusTop, k: br.k });
          lab(lx, e.y + 5, nameParts(br.eName, ' = ' + num(Math.abs(br.E)) + ' V'), an);
          lab(side > 0 ? x - 30 : x + 30, e.y + (plusTop ? -5 : 5) + 5, [['+']], 'middle', 18);
        }
        if (e.t === 'cap') { g.caps.push({ x: x, y: e.y, dir: 'v', k: br.k }); lab(lx, e.y + 5, [['C = ' + num(br.C) + ' μF']], an); }
      });
      g.wires.push([x, y, x, yBot]);
    }
    if (c.topo === 'two') {
      var X = [130, 320, 510], yT = 60, yB = 290;
      g.W = 640; g.H = 350;
      g.wires.push([X[0], yT, X[2], yT], [X[0], yB, X[2], yB]);
      c.branches.forEach(function (br, k) {
        var els = br.E ? [{ t: 'bat', y: 118 }, { t: 'res', y: 195 }] : [{ t: 'res', y: 170 }];
        vertical(X[k], yT, yB, els, br, 1, false);
        var up = s[k] > 0;
        g.arrows.push({ k: k, x: X[k], y0: up ? 274 : 244, y1: up ? 244 : 274 });
        lab(X[k] - 14, 264, [['I'], [String(k + 1), true]], 'end', 19);
      });
      g.dots.push([X[1], yT], [X[1], yB]);
      lab(X[1], yT - 14, [['a']], 'middle', 18);
      lab(X[1], yB + 30, [['b']], 'middle', 18);
      return g;
    }
    var Xs = [118, 280, 442, 604], yt = 60, yb = 290, br = c.branches;
    g.W = 730; g.H = 350;
    g.wires.push([Xs[0], yb, Xs[3], yb]);
    // L: sube por la izquierda (de B a T1) y sigue por arriba hasta T1.
    vertical(Xs[0], yt, yb, br[0].E ? [{ t: 'bat', y: 118 }, { t: 'res', y: 195 }] : [{ t: 'res', y: 170 }], br[0], -1, false);
    g.wires.push([Xs[0], yt, Xs[1], yt]);
    // V1 y V2: bajan (de a arriba a B abajo).
    [1, 3].forEach(function (k, i) {
      var x = Xs[1 + i];
      vertical(x, yt, yb, br[k].E ? [{ t: 'bat', y: 118 }, { t: 'res', y: 225 }] : [{ t: 'res', y: 225 }], br[k], 1, true);
    });
    // H2: de T1 a T2 por arriba, resistor horizontal.
    var hx = (Xs[1] + Xs[2]) / 2;
    g.wires.push([Xs[1], yt, hx - 30, yt], [hx + 30, yt, Xs[2], yt]);
    g.res.push({ x: hx, y: yt, dir: 'h', k: 2 });
    lab(hx, yt - 18, nameParts(br[2].rName, ' = ' + num(br[2].R) + ' Ω'), 'middle');
    // Rt: de T2 a la derecha y baja por el lado derecho hasta B.
    g.wires.push([Xs[2], yt, Xs[3], yt]);
    var rEls = br[4].C ? [{ t: 'res', y: 140 }, { t: 'cap', y: 228 }] : br[4].E ? [{ t: 'bat', y: 118 }, { t: 'res', y: 195 }] : [{ t: 'res', y: 170 }];
    vertical(Xs[3], yt, yb, rEls, br[4], 1, true);
    g.dots.push([Xs[1], yt], [Xs[2], yt], [Xs[1], yb], [Xs[2], yb]);
    [0, 1, 2].forEach(function (j) {
      var cx = (Xs[j] + Xs[j + 1]) / 2;
      g.arcs.push({ k: j, cx: cx, cy: 168, r: 26, cw: s[j] > 0 });
      lab(cx, 174, [['I'], [String(j + 1), true]], 'middle', 19);
    });
    return g;
  }

  var PRESETS = [
    { name: 'Dos mallas, dos fuentes', s: [1, -1, 1], spec: { topo: 'two', R: [2, 4, 2], E: [12, 0, 6] } },
    { name: 'Dos mallas, tres fuentes', s: [1, 1, -1], spec: { topo: 'two', R: [3, 6, 2], E: [18, 6, 9] } },
    { name: 'Tres mallas', s: [1, 1, 1], spec: { topo: 'three', R: [2, 4, 2, 4, 2], E: [24, 0, 0, 0, 12] } },
    { name: 'Tres mallas, fuente en medio', s: [1, 1, 1], spec: { topo: 'three', R: [4, 2, 3, 6, 2], E: [12, 0, 0, 6, -9] } },
    { name: 'Con capacitor (estado estable)', s: [1, 1, 1], spec: { topo: 'three', R: [2, 6, 1, 3, 4], E: [18, 0, 0, 0, 0], C: 10 } }
  ];

  window.LabMath.kirchsys = {
    build: build, hasCap: hasCap, matrix: matrix, cycles: cycles, equations: equations, standard: standard,
    rank: rank, inSpan: inSpan, gauss: gauss, solveRows: solveRows, solveNodal: solveNodal,
    checkRow: checkRow, checkSystem: checkSystem, dependency: dependency, eqText: eqText, num: num,
    random: random, geometry: geometry, PRESETS: PRESETS
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  // La matemática del solver nodal vive en el lab de S10; se carga junto a este archivo.
  var SELF = (typeof document !== 'undefined' && document.currentScript && document.currentScript.src) || '';
  function needCapnet() {
    if (window.LabMath.capnet) return Promise.resolve();
    var src = SELF ? SELF.replace(/kirchhoff-solve\.js(\?.*)?$/, 'capacitor-network.js') : '../../../shared/js/labs/capacitor-network.js';
    return window.LabUI.loadScript(src);
  }
  function In(j) { return 'I' + sub(j + 1); }

  window.Labs['kirchhoff-solve'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, KM = window.LabMath.kirchsys;
    var seed = 20240611;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    var circ, signs, math = null, ready = false, checked = false;

    var opts = KM.PRESETS.map(function (p) { return p.name; }).concat(['Al azar: dos mallas', 'Al azar: tres mallas', 'Al azar: con capacitor']);
    var pSel = UI.select({ label: 'Circuito', options: opts });
    var newBtn = UI.button('Otro al azar', 'ghost', function () {
      var v = +pSel.input.value;
      if (v < KM.PRESETS.length) pSel.input.value = String(KM.PRESETS.length + 1);
      load();
    });
    var flipBtns = [0, 1, 2].map(function (j) { return UI.button('Invertir ' + In(j), 'ghost', function () { flip(j); }); });
    var kindNote = h('p', { class: 'lab-note' });
    var cells = [], rowsBox = h('div', { class: 'kz-table', role: 'group', 'aria-label': 'Tus ecuaciones' });
    ['', In(0), In(1), In(2), '='].forEach(function (t, i) { rowsBox.appendChild(h('span', { class: 'kz-th' + (i === 4 ? ' kz-th--rhs' : '') }, [t])); });
    for (var r = 0; r < 3; r++) {
      rowsBox.appendChild(h('span', { class: 'kz-rowlab' }, ['Ec. ' + (r + 1)]));
      var row = [];
      for (var j = 0; j < 4; j++) {
        var inp = h('input', { type: 'number', step: 'any', class: 'lab-input kz-cell', autocomplete: 'off',
          'aria-label': 'Ecuación ' + (r + 1) + ', ' + (j < 3 ? 'coeficiente de ' + In(j) : 'lado derecho') });
        inp.addEventListener('input', function () { preview(); if (checked) { verdict.hidden = true; checked = false; } });
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
        rowsBox.appendChild(inp); row.push(inp);
      }
      cells.push(row);
    }
    var prevList = h('ol', { class: 'kz-eqs' });
    var run = UI.button('Revisar y resolver', 'primary', check);
    var clear = UI.button('Borrar', 'ghost', function () { fill([]); verdict.hidden = true; checked = false; result.hidden = true; preview(); draw(); });
    var show = UI.button('Ver un sistema correcto', 'ghost', function () { fill(KM.standard(circ, signs)); check(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var result = h('dl', { class: 'lab-facts kz-result', hidden: true });
    var facts = h('dl', { class: 'lab-facts' });
    var status = h('p', { class: 'lab-note kz-status' });
    var svg = UI.svg(640, 350, 'Circuito con sus corrientes');
    svg.classList.add('kz-stage');

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        pSel.node, h('div', { class: 'lab-buttons' }, [newBtn]),
        h('p', { class: 'lab-field__label kz-head' }, ['1 · Elige los sentidos']),
        kindNote,
        h('div', { class: 'lab-buttons' }, flipBtns),
        h('p', { class: 'lab-field__label kz-head' }, ['2 · Escribe tus ecuaciones']),
        h('p', { class: 'lab-note' }, ['Una ecuación por renglón: coeficientes de I₁, I₂, I₃ y el lado derecho. Lo que dejes vacío vale 0.']),
        rowsBox, prevList,
        h('div', { class: 'lab-buttons' }, [run, show, clear]),
        verdict, result,
        h('details', { class: 'kz-details' }, [h('summary', {}, ['Ver los valores del lab']), facts])
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Toca una flecha para invertir su sentido']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tus sentidos']),
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'resistor, fem, capacitor']),
          h('li', { class: 'kz-legend-cap' }, [h('i', { class: 'sw sw--error' }), 'rama abierta (capacitor)'])
        ]),
        status
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    pSel.input.addEventListener('change', load);

    function getRows() {
      return cells.map(function (row) {
        return row.map(function (inp) { var t = String(inp.value).trim().replace(',', '.'); return t === '' ? 0 : parseFloat(t); });
      });
    }
    function fill(rows) {
      cells.forEach(function (row, i) { row.forEach(function (inp, j) { var v = rows[i] ? rows[i][j] : 0; inp.value = v ? String(Number(v.toPrecision(8))) : ''; }); });
      preview();
    }
    function preview(res) {
      prevList.innerHTML = '';
      getRows().forEach(function (row, i) {
        var empty = row.every(function (x) { return x === 0; }), bad = row.some(function (x) { return !isFinite(x); });
        var tag = res && res.rows[i] ? ' · ' + rowTag(res.rows[i]) : '';
        var cls = res && res.rows[i] ? (res.rows[i].kind === 'ok' ? 'kz-ok' : res.rows[i].kind === 'empty' ? '' : 'kz-bad') : '';
        prevList.appendChild(h('li', { class: cls }, ['Ec. ' + (i + 1) + ': ' + (bad ? 'revisa los números' : empty ? 'vacía' : KM.eqText(row)) + tag]));
      });
    }
    function rowTag(o) {
      if (o.kind === 'ok') return 'válida';
      if (o.kind === 'sign') return o.term < 3 ? 'signo de ' + In(o.term) + ' al revés' : 'signo del lado derecho al revés';
      if (o.kind === 'cap') return 'cruza el capacitor';
      if (o.kind === 'zero') return '0 = algo';
      if (o.kind === 'empty') return 'vacía';
      return 'no es una ley de Kirchhoff';
    }

    function load() {
      var v = +pSel.input.value, P = KM.PRESETS;
      if (v < P.length) { circ = KM.build(P[v].spec); signs = P[v].s.slice(); }
      else {
        var t = v - P.length;
        circ = KM.build(KM.random(rnd, t === 0 ? 'two' : 'three', t === 2));
        signs = [1, 1, 1];
      }
      fill([]); verdict.hidden = true; result.hidden = true; checked = false;
      kindNote.textContent = circ.kind === 'branch'
        ? 'Incógnitas: corrientes de rama (una por rama). Toca una flecha o usa los botones para elegir su sentido.'
        : 'Incógnitas: corrientes de malla (una por ventana). Toca una flecha circular o usa los botones para elegir horario o antihorario.';
      draw();
    }
    function flip(j) { signs[j] = -signs[j]; if (checked) check(); else draw(); }

    function el(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n);
      return n;
    }
    function txt(L, parent) {
      var t = el('text', { x: L.x, y: L.y, 'class': 'ann', 'text-anchor': L.anchor, 'font-size': L.size }, parent);
      L.parts.forEach(function (p) {
        var s = document.createElementNS(NS, 'tspan');
        if (p[1]) { s.setAttribute('dy', '4'); s.setAttribute('font-size', '72%'); }
        s.textContent = p[0];
        t.appendChild(s);
        if (p[1]) { var back = document.createElementNS(NS, 'tspan'); back.setAttribute('dy', '-4'); back.textContent = ''; t.appendChild(back); }
      });
    }
    function line(x1, y1, x2, y2, cls, w, parent) { el('path', { d: 'M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2, 'class': cls, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round' }, parent); }
    function zigzag(r, cls, parent) {
      var pts = [], n = 6, L = 60, amp = 9;
      for (var i = 0; i <= n * 2; i++) {
        var t = -L / 2 + L * i / (n * 2), o = i === 0 || i === n * 2 ? 0 : (i % 2 ? amp : -amp);
        pts.push(r.dir === 'v' ? [r.x + o, r.y + t] : [r.x + t, r.y + o]);
      }
      el('path', { d: pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(''), 'class': cls, 'stroke-width': 2.6, fill: 'none', 'stroke-linejoin': 'round' }, parent);
    }
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var G = KM.geometry(circ, signs), g = el('g', {});
      svg.setAttribute('viewBox', '0 0 ' + G.W + ' ' + G.H);
      var open = KM.hasCap(circ) && checked;
      G.wires.forEach(function (w) { line(w[0], w[1], w[2], w[3], 'axis', 2.4, g); });
      G.dots.forEach(function (d) { el('circle', { cx: d[0], cy: d[1], r: 4.5, 'class': 'dot-ref' }, g); });
      G.res.forEach(function (r) { zigzag(r, 'ref', g); });
      G.bats.forEach(function (b) {
        var yl = b.plusFirst ? b.y - 5 : b.y + 5, ys = b.plusFirst ? b.y + 5 : b.y - 5;
        line(b.x - 17, yl, b.x + 17, yl, 'ref', 3, g);
        line(b.x - 9, ys, b.x + 9, ys, 'ref', 6, g);
      });
      G.caps.forEach(function (c) {
        line(c.x - 15, c.y - 6, c.x + 15, c.y - 6, open ? 'error' : 'ref', 4, g);
        line(c.x - 15, c.y + 6, c.x + 15, c.y + 6, open ? 'error' : 'ref', 4, g);
      });
      G.labels.forEach(function (L) { txt(L, g); });
      G.arrows.forEach(function (a) {
        var dy = a.y1 - a.y0, s = dy > 0 ? 1 : -1;
        el('path', { d: 'M' + a.x + ' ' + a.y0 + 'L' + a.x + ' ' + a.y1 + 'M' + (a.x - 7) + ' ' + (a.y1 - 11 * s) + 'L' + a.x + ' ' + a.y1 + 'L' + (a.x + 7) + ' ' + (a.y1 - 11 * s),
          'class': 'student', 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
        el('rect', { x: a.x - 34, y: Math.min(a.y0, a.y1) - 8, width: 52, height: Math.abs(dy) + 16, 'class': 'kz-hit', 'data-k': a.k }, g);
      });
      G.arcs.forEach(function (a) {
        var dir = a.cw ? 1 : -1, t0 = -100 * Math.PI / 180, span = 290 * Math.PI / 180, pts = [];
        for (var i = 0; i <= 29; i++) { var t = t0 + dir * span * i / 29; pts.push([a.cx + a.r * Math.cos(t), a.cy + a.r * Math.sin(t)]); }
        var tE = t0 + dir * span, ex = a.cx + a.r * Math.cos(tE), ey = a.cy + a.r * Math.sin(tE);
        var tx = -Math.sin(tE) * dir, ty = Math.cos(tE) * dir, hh = 10;
        var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('') +
          'M' + (ex - tx * hh - ty * hh * 0.6).toFixed(1) + ' ' + (ey - ty * hh + tx * hh * 0.6).toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
          'L' + (ex - tx * hh + ty * hh * 0.6).toFixed(1) + ' ' + (ey - ty * hh - tx * hh * 0.6).toFixed(1);
        el('path', { d: d, 'class': 'student', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
        el('circle', { cx: a.cx, cy: a.cy, r: a.r + 12, 'class': 'kz-hit', 'data-k': a.k }, g);
      });
      flipBtns.forEach(function (b, j) {
        b.textContent = 'Invertir ' + In(j) + (circ.kind === 'mesh' ? (signs[j] > 0 ? ' (horario)' : ' (antihorario)') : (signs[j] > 0 ? ' (↑)' : ' (↓)'));
      });
      mount.querySelector('.kz-legend-cap').hidden = !open;
      var n = circ.nodes.length, b = circ.branches.length, caps = circ.branches.filter(function (x) { return x.C; }).length;
      status.textContent = n + ' nodos y ' + b + ' ramas: ' + (n - 1) + (n - 1 === 1 ? ' ecuación de nodo y ' : ' ecuaciones de nodo y ') + (b - n + 1) + ' de malla' +
        (circ.kind === 'mesh' ? ' (con corrientes de malla, las de nodo se cumplen solas: quedan 3).' : '.') +
        (caps ? ' Después de mucho tiempo, por el capacitor no pasa corriente.' : '');
      drawFacts();
    }
    function f4(v) { return UI.fmt(v, 4); }
    function drawFacts() {
      facts.innerHTML = '';
      if (!window.LabMath.capnet) { facts.appendChild(h('dt', {}, ['Solver'])); facts.appendChild(h('dd', {}, ['cargando…'])); return; }
      var sol = KM.solveNodal(circ, signs), rows = [];
      [0, 1, 2].forEach(function (j) { rows.push([In(j) + (circ.kind === 'mesh' ? ' (malla)' : ''), f4(sol.x[j]) + ' A']); });
      circ.nodes.forEach(function (nd) { if (nd !== 'B') rows.push(['V(' + nodeName(nd) + ') − V(' + nodeName('B') + ')', f4(sol.pot[nd]) + ' V']); });
      sol.caps.forEach(function (c) { rows.push(['Capacitor', 'V = ' + f4(Math.abs(c.V)) + ' V · Q = CV = ' + f4(c.Q) + ' μC']); });
      rows.push(['Potencia de las fem', f4(sol.Psup) + ' W'], ['Potencia en resistores', f4(sol.Pdis) + ' W']);
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }
    function nodeName(nd) { return circ.topo === 'two' ? (nd === 'A' ? 'a' : 'b') : ({ T1: 'a', T2: 'b', B: 'c' })[nd]; }

    function check() {
      if (!ready) return;
      var rows = getRows();
      if (rows.some(function (r) { return r.some(function (x) { return !isFinite(x); }); })) {
        UI.verdict(verdict, 'warn', 'Revisa los números', 'Cada casilla lleva un número (puede ser negativo o decimal); deja vacío lo que valga 0.');
        return;
      }
      var res = KM.checkSystem(circ, signs, rows), sol = KM.solveNodal(circ, signs);
      checked = true;
      preview(res);
      var v = res.verdict, first = function (k) { var i = -1; res.rows.some(function (o, n) { if (o.kind === k) { i = n; return true; } return false; }); return i; };
      if (v === 'ok') UI.verdict(verdict, 'ok', 'Sistema completo y correcto', 'Las tres ecuaciones valen con tus sentidos y son independientes. math.js resolvió tu sistema y da lo mismo que el solver nodal.');
      else if (v === 'sign') {
        var i = first('sign'), t = res.rows[i].term;
        UI.verdict(verdict, 'warn', 'Casi: un signo al revés en la ecuación ' + (i + 1),
          t < 3 ? 'El término de ' + In(t) + ' tiene el signo al revés. Compara su sentido con el de tu recorrido: a favor de la corriente, el resistor baja el potencial (−IR); en contra, lo sube (+IR). En un nodo, las que entran van con un signo y las que salen con el otro.'
            : 'El lado derecho tiene el signo al revés. Una fem suma (+ε) si la cruzas de − a +, y resta si la cruzas de + a −.');
      } else if (v === 'cap') {
        UI.verdict(verdict, 'warn', 'Casi: por el capacitor no pasa corriente',
          'La ecuación ' + (first('cap') + 1) + ' recorre la rama del capacitor como si fuera un cable. Después de mucho tiempo el capacitor está cargado: su rama queda abierta, la corriente ahí vale 0 y su voltaje no lo conoces de antemano. Cambia esa malla por «corriente de esa rama = 0».');
      } else if (v === 'bad') {
        var b = res.rows.map(function (o, n) { return o.kind === 'bad' || o.kind === 'zero' ? n + 1 : 0; }).filter(Boolean);
        UI.verdict(verdict, 'bad', 'Revisa ' + (b.length > 1 ? 'las ecuaciones ' + b.join(' y ') : 'la ecuación ' + b[0]),
          'No sale de las leyes de Kirchhoff con los sentidos que elegiste. Recorre la malla completa sumando cada cambio de potencial (−IR a favor de la corriente, +ε de − a +), o en un nodo iguala lo que entra con lo que sale.');
      } else if (v === 'missing') {
        UI.verdict(verdict, 'warn', 'Faltan ecuaciones', 'Tienes 3 incógnitas y ' + res.used.length + (res.used.length === 1 ? ' ecuación' : ' ecuaciones') + '. Necesitas tres independientes: ' +
          (circ.kind === 'branch' ? 'una de nodo y dos de malla.' : 'una por cada ventana (o «corriente 0» si la ventana tiene un capacitor).'));
      } else {
        var d = res.dep, msg = 'Una de tus ecuaciones se obtiene de las otras: no aporta información nueva y el sistema no tiene solución única.';
        if (d) {
          var comb = d.with.map(function (w, n) { var l = d.lambda[n]; return (n ? (l < 0 ? ' − ' : ' + ') : (l < 0 ? '−' : '')) + (Math.abs(Math.abs(l) - 1) < 1e-9 ? '' : KM.num(Math.abs(l)) + '·') + 'Ec. ' + (w + 1); }).join('');
          msg = 'Ec. ' + (d.k + 1) + ' = ' + comb + '. ' + (d.with.length === 2 && circ.kind === 'branch'
            ? 'Es la malla grande: la suma de las dos ventanas. Cámbiala por la ecuación de un nodo.'
            : 'No aporta información nueva. Cámbiala por la de otra malla o de un nodo.');
        }
        UI.verdict(verdict, 'warn', 'Ecuaciones dependientes', msg);
      }
      // Corrientes de tu sistema (math.js) contra el solver nodal.
      result.innerHTML = '';
      result.hidden = false;
      var xs = null;
      if (res.solvable && math) {
        try {
          var A = res.used.map(function (n) { return rows[n].slice(0, 3); }), bb = res.used.map(function (n) { return rows[n][3]; });
          xs = math.lusolve(A, bb).map(function (r) { return +r[0]; });
        } catch (e) { xs = res.x; }
      }
      [0, 1, 2].forEach(function (j) {
        var mine = xs ? f4(xs[j]) + ' A' : '—', real = f4(sol.x[j]) + ' A', same = xs && Math.abs(xs[j] - sol.x[j]) <= 1e-6 * (1 + Math.abs(sol.x[j]));
        result.appendChild(h('dt', {}, [In(j)]));
        result.appendChild(h('dd', {}, ['tu sistema: ' + mine + ' · nodal: ' + real + (xs ? (same ? ' ✓' : ' ✗') : '')]));
      });
      var neg = [0, 1, 2].filter(function (j) { return sol.x[j] < -1e-9; }).map(In);
      result.appendChild(h('dt', {}, ['Signos']));
      result.appendChild(h('dd', {}, [neg.length ? 'Negativa ' + neg.join(' y ') + ': la corriente real va al revés de la flecha. No es un error: el sentido se elige al principio.' : 'Todas positivas: tus flechas ya apuntaban en el sentido real.']));
      if (sol.caps.length) {
        var cp = sol.caps[0];
        result.appendChild(h('dt', {}, ['Capacitor']));
        result.appendChild(h('dd', {}, ['V = ' + f4(Math.abs(cp.V)) + ' V entre sus placas · Q = CV = ' + f4(cp.C) + ' μF × ' + f4(Math.abs(cp.V)) + ' V = ' + f4(cp.Q) + ' μC']));
      }
      result.appendChild(h('dt', {}, ['Balance']));
      result.appendChild(h('dd', {}, ['Σ εI = ' + f4(sol.Psup) + ' W = Σ I²R = ' + f4(sol.Pdis) + ' W']));
      draw();
    }

    svg.addEventListener('click', function (ev) {
      var t = ev.target.closest ? ev.target.closest('[data-k]') : null;
      if (t) flip(+t.getAttribute('data-k'));
    });

    // Ejemplo cargado: el sistema de un compañero, con un signo al revés en la ecuación 2.
    pSel.input.value = String(cfg.preset != null ? cfg.preset : 0);
    load();
    var demo = KM.standard(circ, signs);
    demo[1][1] = -demo[1][1];
    fill(demo);
    status.textContent = 'Cargando el solver…';
    return Promise.all([UI.loadMath(), needCapnet()]).then(function (r) {
      math = r[0]; ready = true;
      check();
      verdict.querySelector('.verdict__note').textContent += ' (Ejemplo cargado: así planteó un compañero este circuito. Corrígelo o escribe el tuyo.)';
    });
  };
})();
