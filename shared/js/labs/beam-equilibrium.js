/* =====================================================================
   Lab beam-equilibrium (§8.3): viga sobre dos apoyos.
   Una viga de largo L y masa propia M (peso en su centro) descansa en
   apoyos A (x = a) y B (x = b). Encima van cargas Fᵢ en xᵢ.
   Torques respecto a A:  R_B = Σ Fᵢ (xᵢ − a) / (b − a)
   Fuerzas verticales:    R_A = Σ Fᵢ − R_B
   Si R_A o R_B salen negativas, la viga se vuelca sobre el otro apoyo.
   Errores típicos: repartir la carga a la mitad, intercambiar R_A con
   R_B y medir los brazos desde el extremo de la viga en vez del apoyo.
   ===================================================================== */
(function () {
  var G = 9.81;

  /* ------------------------- Matemática pura ------------------------- */
  // loads: [{ x, F }] (en N, hacia abajo). El peso propio se agrega aparte.
  function allLoads(p) {
    var list = (p.loads || []).slice();
    if (p.M > 0) list.push({ x: p.L / 2, F: p.M * G, own: true });
    return list;
  }
  function reactions(p) {
    var list = allLoads(p), sum = 0, mom = 0;
    list.forEach(function (l) { sum += l.F; mom += l.F * (l.x - p.a); });
    var RB = mom / (p.b - p.a), RA = sum - RB;
    return { RA: RA, RB: RB, total: sum, tips: RA < -1e-9 || RB < -1e-9 };
  }
  // Torque de una fuerza F (perpendicular) a distancia r, o con ángulo θ entre r y F.
  function torque(F, r, th) { return F * r * Math.sin((th == null ? 90 : th) * Math.PI / 180); }
  // Balancín con pivote en x = 0: posición donde debe ir F2 para equilibrar F1 en x1.
  function balance(F1, x1, F2) { return -F1 * x1 / F2; }
  // Hasta dónde puede caminar una carga F sobre el voladizo más allá de B antes de volcar.
  function maxOverhang(p, F) {
    // Torques respecto a B cuando R_A = 0: F(x − b) = Σ Fᵢ(b − xᵢ) = R_A·(b − a) sin la carga nueva.
    var restoring = reactions(p).RA * (p.b - p.a);
    return p.b + (F > 0 ? restoring / F : Infinity);
  }
  function close(a, b) { return Math.abs(a - b) <= 0.01 * Math.max(Math.abs(b), 0.5); }
  function diagnose(p, sA, sB) {
    if (!(isFinite(sA) && isFinite(sB))) return 'bad';
    var r = reactions(p);
    if (close(sA, r.RA) && close(sB, r.RB)) return 'ok';
    if (close(sA, r.RB) && close(sB, r.RA)) return 'swapped';
    if (close(sA, r.total / 2) && close(sB, r.total / 2)) return 'half';
    var wB = 0; allLoads(p).forEach(function (l) { wB += l.F * l.x; }); wB /= (p.b - p.a);   // brazos medidos desde x = 0
    if (p.a !== 0 && close(sA, r.total - wB) && close(sB, wB)) return 'wrongArm';
    if (p.M > 0) {
      var n = reactions({ L: p.L, M: 0, a: p.a, b: p.b, loads: p.loads });
      if (close(sA, n.RA) && close(sB, n.RB)) return 'noOwn';
    }
    if (close(sA, r.RA) || close(sB, r.RB)) return 'one';
    return 'bad';
  }
  window.LabMath.beam = { G: G, reactions: reactions, torque: torque, balance: balance, maxOverhang: maxOverhang, diagnose: diagnose };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var MSG = {
    ok: ['Tus dos reacciones coinciden', 'ΣF = 0 y Στ = 0: la viga está en equilibrio.'],
    swapped: ['Intercambiaste RA y RB', 'El apoyo más cercano a las cargas es el que carga más.'],
    half: ['Repartiste el peso a la mitad', 'Eso solo pasa si las cargas están centradas entre los apoyos. Usa torques respecto a un apoyo.'],
    wrongArm: ['Mediste los brazos desde el extremo', 'Si tomas torques respecto al apoyo A, los brazos se miden desde A, no desde la punta de la viga.'],
    noOwn: ['Olvidaste el peso de la viga', 'La viga pesa Mg y ese peso actúa en su centro.'],
    one: ['Una de las dos coincide', 'Revisa la otra con ΣF = 0: RA + RB = suma de las cargas.'],
    bad: ['No coinciden', 'Toma torques respecto a un apoyo para despejar la otra reacción; luego usa ΣF = 0.']
  };

  window.Labs['beam-equilibrium'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var s0 = cfg.start || { L: 6, M: 20, a: 1, b: 5, F1: 300, x1: 2, F2: 500, x2: 4.5 };
    var fm = function (v) { return v.toFixed(1); };
    var LS = UI.slider({ label: 'Largo de la viga L', min: 2, max: 10, step: 0.5, value: s0.L, unit: 'm', fmt: fm }, refresh);
    var MS = UI.slider({ label: 'Masa de la viga M', min: 0, max: 100, step: 5, value: s0.M, unit: 'kg' }, refresh);
    var aS = UI.slider({ label: 'Apoyo A en x', min: 0, max: 10, step: 0.5, value: s0.a, unit: 'm', fmt: fm }, refresh);
    var bS = UI.slider({ label: 'Apoyo B en x', min: 0, max: 10, step: 0.5, value: s0.b, unit: 'm', fmt: fm }, refresh);
    var F1 = UI.slider({ label: 'Carga 1', min: 0, max: 1000, step: 50, value: s0.F1, unit: 'N' }, refresh);
    var X1 = UI.slider({ label: 'Posición de la carga 1', min: 0, max: 10, step: 0.25, value: s0.x1, unit: 'm', fmt: function (v) { return v.toFixed(2); } }, refresh);
    var F2 = UI.slider({ label: 'Carga 2', min: 0, max: 1000, step: 50, value: s0.F2, unit: 'N' }, refresh);
    var X2 = UI.slider({ label: 'Posición de la carga 2', min: 0, max: 10, step: 0.25, value: s0.x2, unit: 'm', fmt: function (v) { return v.toFixed(2); } }, refresh);
    var rA = UI.input({ label: 'Tu RA (N)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var rB = UI.input({ label: 'Tu RB (N)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(640, 340, 'Viga sobre dos apoyos con sus cargas y reacciones');
    var checked = false;

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        LS.node, MS.node, aS.node, bS.node, F1.node, X1.node, F2.node, X2.node,
        h('div', { class: 'lab-row' }, [rA.node, rB.node]), h('div', { class: 'lab-buttons' }, [run]), note, verdict, facts
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Στ = 0 respecto a un apoyo despeja la otra reacción']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'cargas y peso propio']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'reacciones de los apoyos'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    function params() {
      var L = LS.get(), cl = function (v) { return Math.min(Math.max(v, 0), L); };
      var a = cl(aS.get()), b = cl(bS.get());
      if (b <= a) b = Math.min(L, a + 0.5), a = b - 0.5;
      return { L: L, M: MS.get(), a: a, b: b, loads: [{ x: cl(X1.get()), F: F1.get() }, { x: cl(X2.get()), F: F2.get() }].filter(function (l) { return l.F > 0; }) };
    }
    function refresh() { if (checked) check(); else draw(); }

    function el(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n);
      return n;
    }
    function arrow(g, x, y1, y2, cls) {
      var d = y2 > y1 ? 1 : -1;
      el('path', { d: 'M' + x.toFixed(1) + ' ' + y1.toFixed(1) + 'V' + y2.toFixed(1) + 'M' + (x - 7).toFixed(1) + ' ' + (y2 - 11 * d).toFixed(1) + 'L' + x.toFixed(1) + ' ' + y2.toFixed(1) + 'L' + (x + 7).toFixed(1) + ' ' + (y2 - 11 * d).toFixed(1),
        'class': cls, 'stroke-width': 3.5, fill: 'none' }, g);
    }
    function txt(g, x, y, s, anchor, size) { el('text', { x: x.toFixed(1), y: y.toFixed(1), 'class': 'ann', 'text-anchor': anchor || 'middle', 'font-size': size || 15 }, g).textContent = s; }

    function draw() {
      var p = params(), r = reactions(p), X = function (x) { return 40 + 560 * x / p.L; }, Y = 150;
      svg.innerHTML = '';
      var g = el('g', { 'class': 'sketch' });
      el('rect', { x: X(0), y: Y - 8, width: 560, height: 16, rx: 3, 'class': 'box-base' }, g);
      [[p.a, 'A'], [p.b, 'B']].forEach(function (s) {
        var x = X(s[0]);
        el('path', { d: 'M' + x + ' ' + (Y + 8) + 'l-16 26h32z', 'class': 'axis', 'stroke-width': 2, fill: 'none' }, g);
        txt(g, x, Y + 52, s[1]);
      });
      var maxF = Math.max.apply(null, [r.total, Math.abs(r.RA), Math.abs(r.RB)]) || 1, sc = 90 / maxF;
      allLoads(p).forEach(function (l, i) {
        var x = X(l.x), len = Math.max(18, l.F * sc);
        arrow(g, x, Y - 8 - len, Y - 8, 'error');
        txt(g, x, Y - 14 - len, (l.own ? 'Mg = ' : '') + UI.fmt(l.F, 4) + ' N', 'middle', 14);
      });
      [[p.a, r.RA, 'RA'], [p.b, r.RB, 'RB']].forEach(function (s) {
        var x = X(s[0]) + (s[0] === p.a ? -26 : 26), len = Math.max(18, Math.abs(s[1]) * sc), up = s[1] >= 0;
        arrow(g, x, up ? Y + 36 + len : Y + 36, up ? Y + 36 : Y + 36 + len, 'aux');
        txt(g, x, Y + 56 + len, s[2] + ' = ' + UI.fmt(s[1], 4) + ' N', s[0] === p.a ? 'end' : 'start', 14);
      });
      // Regla de posiciones.
      for (var x = 0; x <= p.L + 1e-9; x += (p.L > 6 ? 1 : 0.5)) {
        el('path', { d: 'M' + X(x) + ' 326v-8', 'class': 'axis', 'stroke-width': 1.2, fill: 'none' }, g);
        txt(g, X(x), 314, String(+x.toFixed(1)), 'middle', 12);
      }
      facts.innerHTML = '';
      [['suma de cargas (con Mg)', UI.fmt(r.total, 5) + ' N'], ['RB = ΣF(x − a)/(b − a)', UI.fmt(r.RB, 5) + ' N'], ['RA = ΣF − RB', UI.fmt(r.RA, 5) + ' N'],
        ['¿se vuelca?', r.tips ? 'sí: una reacción sale negativa' : 'no']]
        .forEach(function (x) { facts.appendChild(h('dt', {}, [x[0]])); facts.appendChild(h('dd', {}, [x[1]])); });
    }
    function check() {
      var k = diagnose(params(), parseFloat(rA.input.value), parseFloat(rB.input.value)), msg = MSG[k];
      UI.verdict(verdict, k === 'ok' ? 'ok' : k === 'bad' ? 'bad' : 'warn', msg[0], msg[1]);
      checked = true;
      draw();
    }
    // Ejemplo cargado: un compañero repartió todo a la mitad.
    (function () { var r = reactions(params()); rA.input.value = UI.fmt(r.total / 2, 5); rB.input.value = UI.fmt(r.total / 2, 5); })();
    note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Por qué no puede ser? Mueve cargas y apoyos y escribe tus reacciones.';
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
