/* =====================================================================
   Lab chain-composition (§8.3): g(h(x)) desarmada. Un tramo pequeño dx se
   estira por h′(x) al pasar a u = h(x) y luego por g′(u) al pasar a y:
   las razones de cambio de cada capa se multiplican.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  function compose(math, gSrc, hSrc) {
    var C = window.LabMath.core;
    var inner = math.parse(C.prep(hSrc));
    return math.parse(C.prep(gSrc)).transform(function (node) {
      return node.isSymbolNode && node.name === 'u' ? new math.ParenthesisNode(inner) : node;
    }).toString();
  }
  function layers(math, gSrc, hSrc, x0) {
    var C = window.LabMath.core;
    var hN = math.parse(C.prep(hSrc)), gN = math.parse(C.prep(gSrc));
    var hFn = C.build(math, hSrc, ['x']).fn, gFn = C.build(math, gSrc, ['u']).fn;
    var hP = C.build(math, math.derivative(hN, 'x').toString(), ['x']).fn;
    var gP = C.build(math, math.derivative(gN, 'u').toString(), ['u']).fn;
    var u0 = hFn(x0);
    return { u0: u0, y0: gFn(u0), hPrime: hP(x0), gPrime: gP(u0), product: hP(x0) * gP(u0), h: hFn, g: gFn };
  }
  function verify(math, gSrc, hSrc, dSrc, a, b) {
    var C = window.LabMath.core;
    var f = compose(math, gSrc, hSrc);
    var t = C.build(math, math.derivative(math.parse(f), 'x').toString()).fn;
    var r = C.compare(t, C.build(math, dSrc).fn, a, b);
    r.composed = f;
    try { r.trueText = math.simplify(math.derivative(math.parse(f), 'x')).toString(); } catch (e) { r.trueText = ''; }
    return r;
  }
  window.LabMath.chain = { compose: compose, layers: layers, verify: verify };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { name: 'sin(x²)', g: 'sin(u)', h: 'x^2', d: 'cos(x^2)', x0: 1, x: [0.2, 2] },
    { name: 'e^(3x)', g: 'e^u', h: '3x', d: '3e^(3x)', x0: 0.3, x: [-0.5, 0.8] },
    { name: '(x² + 1)⁵', g: 'u^5', h: 'x^2 + 1', d: '10x(x^2+1)^4', x0: 0.5, x: [-1, 1] },
    { name: 'ln(cos x)', g: 'ln(u)', h: 'cos(x)', d: '-tan(x)', x0: 0.6, x: [-1.2, 1.2] },
    { name: '√(4 − x²)', g: 'sqrt(u)', h: '4 - x^2', d: '-x/sqrt(4 - x^2)', x0: 1, x: [-1.8, 1.8] }
  ];

  window.Labs['chain-composition'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var presets = cfg.presets || PRESETS;
    var math = null, P = presets[cfg.start || 0];
    function field(o) {
      if (window.CBMathInput) return window.CBMathInput.create(o);
      var f = UI.input(o);
      return { node: f.node, get: function () { return f.input.value; }, setMath: function (s) { f.input.value = s; } };
    }
    var preset = UI.select({ label: 'Función compuesta', options: presets.map(function (p) { return p.name; }) });
    var gIn = field({ label: 'Capa de afuera g(u)', palette: 'none' });
    var hIn = field({ label: 'Capa de adentro u = h(x)', palette: 'none' });
    var dIn = field({ label: 'Tu derivada de g(h(x))', onEnter: function () { check(); } });
    var xS = UI.slider({ label: 'Punto x₀', min: P.x[0], max: P.x[1], step: 0.05, value: P.x0, fmt: function (v) { return UI.fmt(v, 3); } }, function () { draw(); });
    var run = UI.button('Comprobar', 'primary', check);
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(640, 330, 'Tres rectas numéricas: un tramo de x se estira al pasar a u y otra vez al pasar a y');
    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [preset.node, gIn.node, hIn.node, dIn.node, h('div', { class: 'lab-buttons' }, [run]), verdict]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Cada capa multiplica la razón de cambio']),
        svg, xS.node, facts
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); setTimeout(function () { check(); }, 300); });
    function load(i) {
      P = presets[i];
      gIn.setMath(P.g); hIn.setMath(P.h); dIn.setMath(P.d);
      xS.input.min = P.x[0]; xS.input.max = P.x[1]; xS.set(P.x0);
    }
    load(cfg.start || 0);

    function check() {
      if (!math) return;
      try {
        var r = verify(math, gIn.get(), hIn.get(), dIn.get(), P.x[0], P.x[1]);
        var msgs = {
          correct: ['Tu derivada es correcta', 'Es g′(h(x))·h′(x): la razón de afuera por la de adentro.'],
          factor: ['Te falta o te sobra una capa', 'Tu resultado es ' + UI.fmt(r.k, 4) + ' veces el real. ¿Multiplicaste por la derivada de adentro, h′(x)?'],
          sign: ['Tu signo está invertido', 'Revisa el signo de alguna de las dos derivadas.'],
          domain: ['No se pudo evaluar', 'Revisa el dominio de g(h(x)) en el intervalo.'],
          mismatch: ['Tu derivada no coincide', 'Deriva la capa de afuera sin tocar lo de adentro y multiplica por la derivada de adentro.']
        };
        var m = msgs[r.reason] || msgs.mismatch;
        UI.verdict(verdict, r.kind, m[0], m[1]);
        if (r.reason !== 'correct' && r.trueText) {
          verdict.appendChild(h('p', { class: 'verdict__note', html: 'La derivada real es ' + UI.tex(math, r.trueText) + '.' }));
          UI.renderMath(verdict);
        }
      } catch (e) {
        UI.verdict(verdict, 'bad', 'No pude leer la expresión', e.message);
      }
      draw();
    }

    function draw() {
      if (!math) return;
      var L;
      try { L = layers(math, gIn.get(), hIn.get(), xS.get()); } catch (e) { return; }
      var x0 = xS.get(), dx = 0.25;
      var u1 = L.h(x0 + dx), y1 = L.g(u1);
      var rows = [
        { name: 'x', a: x0, b: x0 + dx, y: 60 },
        { name: 'u = h(x)', a: L.u0, b: u1, y: 165 },
        { name: 'y = g(u)', a: L.y0, b: y1, y: 270 }
      ];
      var E = function (tag, attrs, text) {
        var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs) n.setAttribute(k, attrs[k]);
        if (text != null) n.textContent = text;
        svg.appendChild(n); return n;
      };
      svg.innerHTML = '';
      var W = 360, X0 = 118;
      rows.forEach(function (r) {
        var c = (r.a + r.b) / 2, span = Math.max(1.2, Math.abs(r.b - r.a) * 3);
        var sx = function (v) { return X0 + (v - (c - span / 2)) / span * W; };
        r.px = [sx(r.a), sx(r.b)];
        E('line', { x1: X0, x2: X0 + W, y1: r.y, y2: r.y, class: 'axis', 'stroke-width': 1.5 });
        E('line', { x1: r.px[0], x2: r.px[1], y1: r.y, y2: r.y, class: 'aux', 'stroke-width': 7, 'stroke-linecap': 'round' });
        E('text', { x: X0 - 12, y: r.y + 5, class: 'ann', 'text-anchor': 'end', 'font-size': 18 }, r.name);
        E('text', { x: (r.px[0] + r.px[1]) / 2, y: r.y - 14, class: 'lab-tick', 'text-anchor': 'middle' }, 'ancho ' + UI.fmt(Math.abs(r.b - r.a), 3));
      });
      [[0, 1, L.hPrime, 'h′(x₀)'], [1, 2, L.gPrime, 'g′(u₀)']].forEach(function (t) {
        var A = rows[t[0]], B = rows[t[1]];
        E('path', { d: 'M' + A.px[0] + ' ' + (A.y + 8) + 'L' + B.px[0] + ' ' + (B.y - 8) + 'M' + A.px[1] + ' ' + (A.y + 8) + 'L' + B.px[1] + ' ' + (B.y - 8), class: 'axis', 'stroke-dasharray': '4 5', fill: 'none' });
        E('text', { x: X0 + W + 8, y: (A.y + B.y) / 2 + 5, class: 'ann', 'font-size': 17 }, '× ' + t[3] + ' ≈ ' + UI.fmt(t[2], 3));
      });
      facts.innerHTML = '';
      [['u₀ = h(x₀)', UI.fmt(L.u0, 4)], ['h′(x₀)', UI.fmt(L.hPrime, 4)], ['g′(u₀)', UI.fmt(L.gPrime, 4)], ['producto = (g∘h)′(x₀)', UI.fmt(L.product, 4)]]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    document.addEventListener('cb:themechange', draw);
    return UI.loadMath().then(function (m) { math = m; setTimeout(check, 400); });
  };
})();
