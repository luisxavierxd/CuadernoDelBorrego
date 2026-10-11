/* =====================================================================
   Lab potential-work (Física 2 · S05): trabajo al mover una carga.
   Cargas fijas (editables y arrastrables) y una carga de prueba q que va de A a B
   por un camino que el alumno arrastra o dibuja. El lab integra numéricamente
   W = ∫ F·dl sobre la poligonal y lo compara con −qΔV: el trabajo no depende
   del camino. Reto: el alumno escribe V en A, V en B o el trabajo; el «casi»
   reconoce los errores típicos:
     sign     signo del trabajo (o el trabajo externo en lugar del del campo)
     r2       usó r² como en el campo eléctrico
     absSum   sumó los potenciales sin el signo de cada carga
     noQ      olvidó multiplicar por q (dio −ΔV)
     cm       dejó las distancias en centímetros
   LabMath.potential trabaja en SI (m, C, J, V); la UI muestra cm, μC, kV y J.
   ===================================================================== */
(function () {
  var K = 8.99e9, E = 1.60e-19, M_P = 1.67e-27, M_E = 9.11e-31;

  /* ------------------------- Matemática pura ------------------------- */
  // charges: [{ q, x, y }] en C y m.
  function pairU(q1, q2, r) { return K * q1 * q2 / r; }
  function systemU(ch) {
    var U = 0;
    for (var i = 0; i < ch.length; i++) for (var j = i + 1; j < ch.length; j++) {
      U += pairU(ch[i].q, ch[j].q, Math.hypot(ch[i].x - ch[j].x, ch[i].y - ch[j].y));
    }
    return U;
  }
  // Potencial con la ley de la distancia `pow` (1 = el real; 2 = el error de usar r²).
  function Vgen(ch, x, y, pow, abs) {
    var s = 0;
    ch.forEach(function (c) { var r = Math.hypot(x - c.x, y - c.y); s += K * (abs ? Math.abs(c.q) : c.q) / Math.pow(r, pow); });
    return s;
  }
  function V(ch, x, y) { return Vgen(ch, x, y, 1, false); }
  function field(ch, x, y) {
    var ex = 0, ey = 0;
    ch.forEach(function (c) {
      var dx = x - c.x, dy = y - c.y, r = Math.hypot(dx, dy), k = K * c.q / (r * r * r);
      ex += k * dx; ey += k * dy;
    });
    return { x: ex, y: ey };
  }
  function force(ch, q, x, y) { var e = field(ch, x, y); return { x: q * e.x, y: q * e.y }; }
  // Distancia de un punto a un segmento.
  function segDist(c, a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy;
    var t = L2 > 0 ? Math.max(0, Math.min(1, ((c.x - a.x) * dx + (c.y - a.y) * dy) / L2)) : 0;
    return Math.hypot(c.x - a.x - t * dx, c.y - a.y - t * dy);
  }
  // Trabajo del campo sobre q a lo largo de una poligonal [{x, y}, …]: Simpson en cada tramo,
  // con paso proporcional a la distancia más corta del tramo a una carga.
  function workPath(ch, q, path) {
    var W = 0;
    for (var i = 1; i < path.length; i++) {
      var a = path[i - 1], b = path[i], dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
      if (len === 0) continue;
      var dmin = Infinity;
      ch.forEach(function (c) { dmin = Math.min(dmin, segDist(c, a, b)); });
      if (!(dmin > 0)) return NaN;                       // el camino pasa por encima de una carga
      var n = Math.min(40000, Math.max(8, Math.ceil(len / (0.02 * dmin))));
      if (n % 2) n++;
      var s = 0;
      for (var k = 0; k <= n; k++) {
        var t = k / n, f = force(ch, q, a.x + t * dx, a.y + t * dy);
        s += (k === 0 || k === n ? 1 : k % 2 ? 4 : 2) * (f.x * dx + f.y * dy);
      }
      W += s / (3 * n);
    }
    return W;
  }
  // Trabajo del campo de A a B por la diferencia de potencial: W = −q(V_B − V_A).
  function workAB(ch, q, A, B) { return -q * (V(ch, B.x, B.y) - V(ch, A.x, A.y)); }
  // Trabajo externo para armar el sistema trayendo las cargas una por una desde el infinito.
  function assembleWork(ch) {
    var W = 0;
    for (var i = 1; i < ch.length; i++) W += ch[i].q * V(ch.slice(0, i), ch[i].x, ch[i].y);
    return W;
  }
  // Conservación de la energía: ½mv² = ½mv₀² − qΔV. NaN si no le alcanza la energía.
  function speed(q, m, dV, v0) {
    var v2 = (v0 || 0) * (v0 || 0) - 2 * q * dV / m;
    return v2 >= 0 ? Math.sqrt(v2) : NaN;
  }
  function toEV(J) { return J / E; }
  function pathLength(path) { var L = 0; for (var i = 1; i < path.length; i++) L += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y); return L; }
  // Corta la poligonal en la fracción s ∈ [0, 1] de su largo: devuelve el tramo recorrido.
  function along(path, s) {
    var total = pathLength(path), goal = Math.max(0, Math.min(1, s)) * total, out = [path[0]];
    for (var i = 1; i < path.length; i++) {
      var a = path[i - 1], b = path[i], L = Math.hypot(b.x - a.x, b.y - a.y);
      if (goal <= L || i === path.length - 1) {
        var t = L > 0 ? Math.min(1, goal / L) : 1;
        out.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
        return out;
      }
      goal -= L; out.push(b);
    }
    return out;
  }
  // Respuesta real y errores típicos de cada pregunta del reto (en SI).
  // kind: 'VA' | 'VB' | 'W'.
  function answers(kind, ch, q, A, B) {
    if (kind === 'W') {
      var dV = V(ch, B.x, B.y) - V(ch, A.x, A.y);
      return {
        truth: -q * dV,
        sign: q * dV,
        r2: -q * (Vgen(ch, B.x, B.y, 2) - Vgen(ch, A.x, A.y, 2)),
        absSum: -q * (Vgen(ch, B.x, B.y, 1, true) - Vgen(ch, A.x, A.y, 1, true)),
        noQ: -dV
      };
    }
    var P = kind === 'VB' ? B : A, v = V(ch, P.x, P.y);
    return { truth: v, sign: -v, r2: Vgen(ch, P.x, P.y, 2), absSum: Vgen(ch, P.x, P.y, 1, true), cm: v / 100 };
  }
  function close(a, b, tol) { return Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-30); }
  // student en SI. Un error solo cuenta si su valor se distingue del real (2 %).
  function diagnose(kind, ch, q, A, B, student) {
    if (!isFinite(student)) return 'bad';
    var r = answers(kind, ch, q, A, B), tol = 0.01;
    if (close(student, r.truth, tol)) return 'ok';
    var order = ['sign', 'noQ', 'r2', 'absSum', 'cm'];
    for (var i = 0; i < order.length; i++) {
      var k = order[i];
      if (r[k] == null || close(r[k], r.truth, 0.02)) continue;
      if (close(student, r[k], tol)) return k;
    }
    return 'bad';
  }

  window.LabMath.potential = {
    K: K, E: E, M_P: M_P, M_E: M_E,
    pairU: pairU, systemU: systemU, V: V, Vgen: Vgen, field: field, force: force,
    workPath: workPath, workAB: workAB, assembleWork: assembleWork, speed: speed, toEV: toEV,
    pathLength: pathLength, along: along, answers: answers, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var BOX = { x: [-10, 10], y: [-6, 6] };          // cm
  var MSG = {
    ok: ['Coincide', 'Tu resultado es el del lab.'],
    sign: ['Revisa el signo', 'El trabajo del campo es W = −qΔV. Si te salió +qΔV, calculaste el trabajo de quien empuja la carga (el externo), no el del campo. En un potencial, revisa el signo de cada carga.'],
    noQ: ['Te faltó la carga q', 'Ese número es −ΔV, en volts. El trabajo es W = −q·ΔV: multiplica por la carga de prueba (en coulombs).'],
    r2: ['Usaste r² como en el campo', 'El potencial va con 1/r, no con 1/r²: V = kq/r. El r² es del campo y de la fuerza.'],
    absSum: ['Sumaste sin signos', 'El potencial es un escalar con signo: una carga negativa resta. Suma kq/r de cada carga con su signo.'],
    cm: ['Las distancias en metros', 'Pasa los centímetros a metros antes de dividir: 4 cm = 0.04 m.'],
    bad: ['No coincide', 'Calcula V en cada punto sumando kq/r de cada carga, con su signo y r en metros. Luego W = −q(V_B − V_A).']
  };

  window.Labs['potential-work'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, P = window.LabMath.potential;
    var s0 = cfg.start || {};
    var preset = [
      [{ q: 3, x: 0, y: 0 }],
      [{ q: 3, x: -3, y: 0 }, { q: -2, x: 3, y: 0 }],
      [{ q: 3, x: -4, y: -2 }, { q: -2, x: 4, y: 1 }, { q: 2, x: 0, y: -4 }]
    ];
    var charges = (s0.charges || preset[1]).map(function (c) { return { q: c.q, x: c.x, y: c.y }; });
    var A = { x: (s0.A || [-7, 3])[0], y: (s0.A || [-7, 3])[1] };
    var B = { x: (s0.B || [7, 3])[0], y: (s0.B || [7, 3])[1] };
    var way = [{ x: -3, y: 5 }, { x: 3, y: -4.5 }];        // dos puntos de paso arrastrables
    var free = null;                                         // camino dibujado a mano (cm)
    var drawing = false, drag = null, student = null, checked = false;

    var nSel = UI.select({ label: 'Cargas fijas', options: ['Una carga', 'Dos cargas', 'Tres cargas'] });
    nSel.input.value = String(charges.length - 1);
    var qS = [0, 1, 2].map(function (i) {
      return UI.slider({ label: 'q' + (i + 1), min: -5, max: 5, step: 0.5, value: charges[i] ? charges[i].q : preset[2][i].q, unit: 'μC', fmt: function (v) { return v.toFixed(1); } }, function (v) {
        if (charges[i]) { charges[i].q = v; refresh(); }
      });
    });
    var tS = UI.slider({ label: 'Carga de prueba q', min: -5, max: 5, step: 0.5, value: s0.q != null ? s0.q : 1, unit: 'μC', fmt: function (v) { return v.toFixed(1); } }, refresh);
    var pS = UI.slider({ label: 'Avance de la carga de A a B', min: 0, max: 100, step: 1, value: 100, fmt: function (v) { return v + ' %'; } }, draw);
    var drawBtn = UI.button('Dibujar camino', 'ghost', function () { drawing = !drawing; drawBtn.setAttribute('aria-pressed', drawing ? 'true' : 'false'); drawBtn.textContent = drawing ? 'Dibuja sobre la gráfica…' : 'Dibujar camino'; if (drawing) note.textContent = 'Arrastra sobre la gráfica: el camino sale de A, sigue tu trazo y termina en B.'; });
    drawBtn.setAttribute('aria-pressed', 'false');
    var resetBtn = UI.button('Camino con puntos de paso', 'ghost', function () { free = null; drawing = false; drawBtn.setAttribute('aria-pressed', 'false'); drawBtn.textContent = 'Dibujar camino'; refresh(); });
    var kSel = UI.select({ label: '¿Qué calculas?', options: ['V en A (kV)', 'V en B (kV)', 'Trabajo del campo de A a B (J)'] });
    var aIn = UI.input({ label: 'Tu resultado', type: 'number', step: 'any', inputmode: 'decimal', mono: false, hint: 'k = 8.99 × 10⁹ N·m²/C². Distancias en la cuadrícula: 1 cuadro = 1 cm.' });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var live = h('p', { class: 'lab-note pw-live mono' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(640, 400, 'Cargas fijas, los puntos A y B y el camino de la carga de prueba');
    svg.classList.add('pw-stage');

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        nSel.node, qS[0].node, qS[1].node, qS[2].node, tS.node, pS.node,
        h('div', { class: 'lab-buttons' }, [drawBtn, resetBtn]),
        kSel.node, aIn.node, h('div', { class: 'lab-buttons' }, [run]), note, verdict,
        h('details', { class: 'pw-details' }, [h('summary', {}, ['Ver los valores del lab']), facts])
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Arrastra las cargas, A, B y los puntos de paso']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'tu camino']),
          h('li', {}, [h('i', { class: 'sw sw--aux sw--dashed' }), 'camino recto']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'fuerza sobre q'])
        ]),
        live
      ])
    ]));
    var form = mount.querySelector('form');
    form.addEventListener('submit', function (e) { e.preventDefault(); check(); });
    aIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    kSel.input.addEventListener('change', function () { student = null; verdict.hidden = true; checked = false; draw(); });
    nSel.input.addEventListener('change', function () {
      var n = +nSel.input.value + 1;
      charges = preset[n - 1].map(function (c, i) { return { q: qS[i].get(), x: c.x, y: c.y }; });
      free = null; refresh();
    });

    function SI(c) { return { q: c.q * 1e-6, x: c.x / 100, y: c.y / 100 }; }
    function pt(p) { return { x: p.x / 100, y: p.y / 100 }; }
    function path() { return free ? [A].concat(free, [B]) : [A, way[0], way[1], B]; }
    function kind() { return ['VA', 'VB', 'W'][+kSel.input.value]; }
    function syncSliders() { qS.forEach(function (s, i) { s.node.hidden = i >= charges.length; }); }

    var plot = null;
    function el(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n);
      return n;
    }
    function txt(x, y, s, anchor, size, cls) {
      var t = el('text', { x: x, y: y, 'class': cls || 'ann', 'text-anchor': anchor || 'middle', 'font-size': size || 15 });
      t.textContent = s;
      return t;
    }

    function draw() {
      syncSliders();
      plot = window.LabPlot(svg, { x: BOX.x, y: BOX.y, equal: true });
      plot.clear(); plot.grid(); plot.axes();
      var X = plot.X, Y = plot.Y;
      var ch = charges.map(SI), q = tS.get() * 1e-6, pth = path(), pSI = pth.map(pt);
      // Camino recto (referencia) y el camino del alumno.
      plot.segments([[[A.x, A.y], [B.x, B.y]]], 'aux', 2);
      svg.lastChild.lastChild.setAttribute('stroke-dasharray', '6 6');
      var segs = [];
      for (var i = 1; i < pth.length; i++) segs.push([[pth[i - 1].x, pth[i - 1].y], [pth[i].x, pth[i].y]]);
      plot.segments(segs, 'trace', 3);
      var g = svg.lastChild;
      // Cargas fijas: + con box-err, − con box-aux; la etiqueta abajo.
      charges.forEach(function (c, i) {
        var cx = X(c.x), cy = Y(c.y);
        el('circle', { cx: cx, cy: cy, r: 14, 'class': c.q > 0 ? 'box-err' : c.q < 0 ? 'box-aux' : 'axis', fill: c.q === 0 ? 'none' : null, 'data-drag': 'c' + i, style: 'cursor: grab' }, g);
        txt(cx, cy + 8, c.q > 0 ? '+' : c.q < 0 ? '−' : '0', 'middle', 24, 'ann pw-sign');
        txt(cx, cy - 22, 'q' + (i + 1) + ' = ' + c.q.toFixed(1) + ' μC', 'middle', 15);
      });
      // Puntos de paso (solo con el camino de dos puntos).
      if (!free) way.forEach(function (p, i) { el('circle', { cx: X(p.x), cy: Y(p.y), r: 7, 'class': 'dot-trace', 'data-drag': 'w' + i, style: 'cursor: grab' }, g); });
      // A y B.
      [[A, 'A', 'a'], [B, 'B', 'b']].forEach(function (o) {
        el('circle', { cx: X(o[0].x), cy: Y(o[0].y), r: 8, 'class': 'dot-ref', 'data-drag': o[2], style: 'cursor: grab' }, g);
        txt(X(o[0].x), Y(o[0].y) - 14, o[1], 'middle', 17);
      });
      // Carga de prueba en el avance elegido y la fuerza sobre ella (solo dirección).
      var part = P.along(pSI, pS.get() / 100), at = part[part.length - 1];
      var F = P.force(ch, q, at.x, at.y), Fm = Math.hypot(F.x, F.y);
      var ax = X(at.x * 100), ay = Y(at.y * 100);
      if (Fm > 0 && isFinite(Fm)) {
        var ux = F.x / Fm, uy = -F.y / Fm, L = 46;
        el('path', { d: 'M' + ax + ' ' + ay + 'L' + (ax + ux * L) + ' ' + (ay + uy * L) + 'M' + (ax + ux * L - ux * 10 - uy * 6) + ' ' + (ay + uy * L - uy * 10 + ux * 6) + 'L' + (ax + ux * L) + ' ' + (ay + uy * L) + 'L' + (ax + ux * L - ux * 10 + uy * 6) + ' ' + (ay + uy * L - uy * 10 - ux * 6),
          'class': 'error', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      }
      el('circle', { cx: ax, cy: ay, r: 6, 'class': q >= 0 ? 'dot-error' : 'dot-aux' }, g);

      var Wp = P.workPath(ch, q, pSI), Wab = P.workAB(ch, q, pSI[0], pSI[pSI.length - 1]);
      var Wpart = P.workPath(ch, q, part), Wpart2 = -q * (P.V(ch, at.x, at.y) - P.V(ch, pSI[0].x, pSI[0].y));
      live.textContent = 'Hasta aquí: ∫F·dl = ' + UI.fmt(Wpart, 4) + ' J · −q(V − V_A) = ' + UI.fmt(Wpart2, 4) + ' J';
      var VA = P.V(ch, A.x / 100, A.y / 100), VB = P.V(ch, B.x / 100, B.y / 100);
      facts.innerHTML = '';
      [['V en A', UI.fmt(VA / 1000, 4) + ' kV'], ['V en B', UI.fmt(VB / 1000, 4) + ' kV'], ['ΔV = V_B − V_A', UI.fmt((VB - VA) / 1000, 4) + ' kV'],
        ['W sobre tu camino (∫F·dl)', UI.fmt(Wp, 5) + ' J'], ['W por el camino recto', UI.fmt(P.workPath(ch, q, [pt(A), pt(B)]), 5) + ' J'],
        ['−qΔV', UI.fmt(Wab, 5) + ' J'], ['largo de tu camino', UI.fmt(P.pathLength(pth.map(function (p) { return { x: p.x, y: p.y }; })), 4) + ' cm'],
        ['U de las cargas fijas', UI.fmt(P.systemU(ch), 4) + ' J']]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    function refresh() { if (checked) check(); else draw(); }
    function check() {
      var val = parseFloat(String(aIn.input.value).replace(',', '.'));
      var k = kind(), si = k === 'W' ? val : val * 1000;
      var r = P.diagnose(k, charges.map(SI), tS.get() * 1e-6, pt(A), pt(B), si);
      var msg = MSG[r] || MSG.bad;
      UI.verdict(verdict, r === 'ok' ? 'ok' : r === 'bad' ? 'bad' : 'warn', msg[0], msg[1]);
      checked = true; student = val;
      draw();
    }

    /* ---------- Arrastrar y dibujar ---------- */
    function toData(ev) {
      var m = svg.getScreenCTM();
      if (!m || !plot) return null;
      var p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY;
      var s = p.matrixTransform(m.inverse());
      var x0 = plot.X(0), kx = plot.X(1) - x0, y0 = plot.Y(0), ky = plot.Y(1) - y0;
      return { x: (s.x - x0) / kx, y: (s.y - y0) / ky };
    }
    function inside(p) { return p.x >= BOX.x[0] + 0.5 && p.x <= BOX.x[1] - 0.5 && p.y >= BOX.y[0] + 0.5 && p.y <= BOX.y[1] - 0.5; }
    function snap(v, s) { return Math.round(v / s) * s; }
    function farFrom(p, list, d) { return list.every(function (c) { return Math.hypot(p.x - c.x, p.y - c.y) >= d; }); }
    function pick(p) {
      var best = null, bd = 0.9;                                   // cm
      var cands = [['a', A], ['b', B]].concat(free ? [] : way.map(function (w, i) { return ['w' + i, w]; }), charges.map(function (c, i) { return ['c' + i, c]; }));
      cands.forEach(function (c) { var d = Math.hypot(p.x - c[1].x, p.y - c[1].y); if (d < bd) { bd = d; best = c[0]; } });
      return best;
    }
    function moveTo(id, p) {
      if (!inside(p)) return;
      if (id === 'a' || id === 'b') {
        var q = { x: snap(p.x, 0.5), y: snap(p.y, 0.5) }, other = id === 'a' ? B : A;
        if (!farFrom(q, charges, 1) || !farFrom(q, [other], 0.5)) return;
        var tgt = id === 'a' ? A : B; tgt.x = q.x; tgt.y = q.y;
      } else if (id[0] === 'w') {
        if (!farFrom(p, charges, 0.6)) return;
        way[+id[1]].x = snap(p.x, 0.1); way[+id[1]].y = snap(p.y, 0.1);
      } else {
        var c = { x: snap(p.x, 0.5), y: snap(p.y, 0.5) }, i = +id[1];
        var others = charges.filter(function (_, j) { return j !== i; });
        var pathPts = free ? free : way;
        if (!farFrom(c, others, 1) || !farFrom(c, [A, B], 1) || !farFrom(c, pathPts, 0.6)) return;
        charges[i].x = c.x; charges[i].y = c.y;
      }
      refresh();
    }
    svg.addEventListener('pointerdown', function (ev) {
      var p = toData(ev);
      if (!p) return;
      if (drawing) {
        free = [];
        drag = 'draw';
      } else {
        drag = pick(p);
        if (!drag) return;
      }
      ev.preventDefault();
      try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* sin captura */ }
    });
    svg.addEventListener('pointermove', function (ev) {
      if (!drag) return;
      var p = toData(ev);
      if (!p) return;
      if (drag === 'draw') {
        var last = free.length ? free[free.length - 1] : A;
        if (inside(p) && farFrom(p, charges, 0.6) && Math.hypot(p.x - last.x, p.y - last.y) > 0.25) { free.push({ x: p.x, y: p.y }); refresh(); }
      } else moveTo(drag, p);
    });
    function end() {
      if (drag === 'draw') {
        drawing = false; drawBtn.setAttribute('aria-pressed', 'false'); drawBtn.textContent = 'Dibujar camino';
        if (free && free.length < 2) free = null;
        note.textContent = free ? 'Listo: tu camino dibujado. Abre «Ver los valores del lab» y compara ∫F·dl con −qΔV.' : 'El trazo fue muy corto; vuelve a dibujar.';
        refresh();
      }
      drag = null;
    }
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);

    // Ejemplo cargado: un compañero calculó el trabajo con el signo al revés.
    (function () {
      kSel.input.value = '2';
      var r = P.answers('W', charges.map(SI), tS.get() * 1e-6, pt(A), pt(B));
      aIn.input.value = UI.fmt(r.sign, 4);
      note.textContent = 'Ejemplo cargado: así respondió un compañero el trabajo de A a B. ¿Ves el error? Mueve el avance y compara las dos cuentas de abajo: dan lo mismo por cualquier camino.';
    })();
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
