/* =====================================================================
   Lab area-between (§8.3): región entre f y g con sus intersecciones y el
   área del alumno; modo de longitud de arco con una poligonal que converge.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  function simpson(fn, a, b, n) {
    n = n || 2000; if (n % 2) n++;
    var h = (b - a) / n, s = fn(a) + fn(b);
    for (var i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * fn(a + i * h);
    return s * h / 3;
  }
  // Ceros de f − g en [a, b] por cambio de signo y bisección.
  function intersections(f, g, a, b, n) {
    n = n || 1000;
    var d = function (x) { return f(x) - g(x); }, out = [], prev = d(a);
    if (Math.abs(prev) < 1e-12) out.push(a);
    for (var i = 1; i <= n; i++) {
      var x = a + (b - a) * i / n, cur = d(x);
      if (!isFinite(cur) || !isFinite(prev)) { prev = cur; continue; }
      if (cur === 0) { out.push(x); }
      else if (prev * cur < 0) {
        var lo = x - (b - a) / n, hi = x, dl = prev;
        for (var k = 0; k < 70; k++) { var m = (lo + hi) / 2, dm = d(m); if (dl * dm <= 0) hi = m; else { lo = m; dl = dm; } }
        out.push((lo + hi) / 2);
      }
      prev = cur;
    }
    return out.filter(function (x, j) { return j === 0 || Math.abs(x - out[j - 1]) > 1e-9; });
  }
  // Área entre curvas: integra |f − g| por tramos entre intersecciones (Simpson exacto en cada tramo liso).
  function between(f, g, a, b) {
    var cuts = [a].concat(intersections(f, g, a, b).filter(function (x) { return x > a + 1e-12 && x < b - 1e-12; })).concat([b]), total = 0;
    for (var i = 0; i < cuts.length - 1; i++) total += Math.abs(simpson(function (x) { return f(x) - g(x); }, cuts[i], cuts[i + 1], 400));
    return total;
  }
  function net(f, g, a, b) { return simpson(function (x) { return f(x) - g(x); }, a, b, 2000); }
  // Pendiente numérica; en un borde del dominio (como x = 0 en x^(3/2)) usa la diferencia hacia un lado.
  function slope(f, x) {
    var e = 1e-6, c = (f(x + e) - f(x - e)) / (2 * e);
    if (isFinite(c)) return c;
    var fw = (f(x + e) - f(x)) / e;
    return isFinite(fw) ? fw : (f(x) - f(x - e)) / e;
  }
  function arcLength(f, a, b) { return simpson(function (x) { var m = slope(f, x); return Math.sqrt(1 + m * m); }, a, b, 2000); }
  function polyLength(f, a, b, n) {
    var s = 0, x0 = a, y0 = f(a);
    for (var i = 1; i <= n; i++) { var x = a + (b - a) * i / n, y = f(x); s += Math.hypot(x - x0, y - y0); x0 = x; y0 = y; }
    return s;
  }
  window.LabMath.area = { simpson: simpson, intersections: intersections, between: between, net: net, arcLength: arcLength, polyLength: polyLength };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { name: 'Parábola y recta', mode: 'area', f: 'x + 2', g: 'x^2', a: -1, b: 2 },
    { name: 'Seno y coseno', mode: 'area', f: 'sin(x)', g: 'cos(x)', a: 0.7853981634, b: 3.926990817 },
    { name: 'Dos parábolas', mode: 'area', f: '4 - x^2', g: 'x^2 - 4', a: -2, b: 2 },
    { name: 'Se cruzan adentro', mode: 'area', f: 'x^3', g: 'x', a: -1, b: 1 },
    { name: 'Arco de x^(3/2)', mode: 'arc', f: 'x^(3/2)', g: '0', a: 0, b: 4 },
    { name: 'Arco de parábola', mode: 'arc', f: 'x^2/2', g: '0', a: 0, b: 2 }
  ];
  var MODES = [['area', 'Área entre curvas'], ['arc', 'Longitud de arco']];

  window.Labs['area-between'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var presets = cfg.presets || PRESETS;
    var math = null, F = null, G = null, P = presets[cfg.start || 0], box = { a: P.a, b: P.b }, mode = P.mode;
    var preset = UI.select({ label: 'Ejemplo', options: presets.map(function (p) { return p.name; }) });
    var modeSel = UI.select({ label: 'Qué calcular', options: MODES.map(function (m) { return m[1]; }) });
    var fIn = UI.mathField({ label: 'Curva de arriba f(x)', hint: 'Escribe cualquier función; usa la paleta o el teclado ⌨.', onEnter: function () { build(); } });
    var gIn = UI.mathField({ label: 'Curva de abajo g(x)', onEnter: function () { build(); } });
    var ab = UI.rangeField(['a (desde)', 'b (hasta)'], [P.a, P.b], function () { build(); });
    var inter = UI.button('Usar intersecciones', 'ghost', function () { useIntersections(); });
    var run = UI.button('Graficar', 'primary', function () { build(); });
    var ansIn = UI.input({ label: 'Tu resultado', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var check = UI.button('Comprobar', 'primary', function () { verify(); });
    var nS = UI.slider({ label: 'Segmentos de la poligonal', min: 1, max: 60, step: 1, value: 4 }, draw);
    var status = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(640, 380, 'Gráfica de las curvas con la región o el arco');
    var gWrap = h('div', {}, [gIn.node, h('div', { class: 'lab-buttons' }, [inter])]);
    var nWrap = h('div', {}, [nS.node]);
    var legend = h('ul', { class: 'lab-legend' });
    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [preset.node, modeSel.node, fIn.node, gWrap, ab.node, h('div', { class: 'lab-buttons' }, [run]), status, nWrap, ansIn.node, h('div', { class: 'lab-buttons' }, [check]), verdict, facts]),
      h('figure', { class: 'lab-board' }, [h('figcaption', { class: 'lab-board__title sheet__title' }, ['Área entre curvas y longitud de arco']), svg, legend])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); build(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); build(); });
    modeSel.input.addEventListener('change', function () { mode = MODES[+modeSel.input.value][0]; layout(); build(); });

    function load(i) {
      P = presets[i]; mode = P.mode;
      modeSel.input.value = String(MODES.findIndex(function (m) { return m[0] === mode; }));
      fIn.setMath(P.f); gIn.setMath(P.g); ab.set(P.a, P.b); ansIn.input.value = ''; verdict.hidden = true;
      layout();
    }
    function layout() {
      gWrap.hidden = mode !== 'area'; nWrap.hidden = mode !== 'arc';
      var lab = fIn.node.querySelector('.lab-field__label, label');
      if (lab) lab.textContent = mode === 'area' ? 'Curva de arriba f(x)' : 'Curva f(x)';
      legend.innerHTML = '';
      (mode === 'area'
        ? [['ref', 'f(x)'], ['trace', 'g(x)'], ['aux', 'región']]
        : [['ref', 'f(x)'], ['aux', 'poligonal']]).forEach(function (l) { legend.appendChild(h('li', {}, [h('i', { class: 'sw sw--' + l[0] }), l[1]])); });
    }
    load(cfg.start || 0);

    function compile() {
      var r = ab.get();
      if (!(isFinite(r[0]) && isFinite(r[1]) && r[1] > r[0])) throw new Error('a debe ser menor que b.');
      var fs = String(fIn.get() || '').trim(), gs = mode === 'area' ? String(gIn.get() || '').trim() : '0';
      if (!fs || !gs) throw new Error('Escribe las funciones.');
      F = window.LabMath.core.build(math, fs).fn; G = window.LabMath.core.build(math, gs).fn;
      box = { a: r[0], b: r[1] };
    }
    function build() {
      if (!math) return;
      try { compile(); status.hidden = true; } catch (e) { UI.verdict(status, 'bad', 'No pude graficar', e.message); return; }
      draw();
    }
    function useIntersections() {
      if (!math) return;
      try { compile(); } catch (e) { UI.verdict(status, 'bad', 'No pude leer las funciones', e.message); return; }
      var w = Math.max(6, (box.b - box.a) * 3), c = (box.a + box.b) / 2;
      var xs = intersections(F, G, c - w, c + w);
      if (xs.length < 2) { UI.verdict(status, 'warn', 'No encontré dos intersecciones', 'Escribe a y b a mano.'); return; }
      // Las dos intersecciones más cercanas al centro de la ventana actual, una a cada lado si se puede.
      var left = xs.filter(function (x) { return x <= c; }), right = xs.filter(function (x) { return x > c; });
      var a = left.length ? left[left.length - 1] : xs[0], b = right.length ? right[0] : xs[1];
      if (!(b > a)) { a = xs[0]; b = xs[1]; }
      ab.set(a, b); build();
    }
    function exact() { return mode === 'area' ? between(F, G, box.a, box.b) : arcLength(F, box.a, box.b); }
    function verify() {
      if (!F) return;
      var s = parseFloat(ansIn.input.value), t = exact();
      if (!isFinite(s)) { UI.verdict(verdict, 'bad', 'Escribe un número', 'Usa punto decimal.'); return; }
      if (Math.abs(s - t) <= 0.01 * Math.max(1, Math.abs(t))) { UI.verdict(verdict, 'ok', 'Tu resultado es correcto', 'El valor es ' + UI.fmt(t, 6) + '.'); return; }
      var n = mode === 'area' ? net(F, G, box.a, box.b) : null;
      if (n != null && Math.abs(s - n) <= 0.01 * Math.max(1, Math.abs(n)) && Math.abs(n - t) > 1e-6)
        UI.verdict(verdict, 'warn', 'Esa es el área neta', 'Las curvas se cruzan dentro del intervalo: parte la integral en las intersecciones y suma cada tramo con signo positivo.');
      else if (n != null && Math.abs(s + t) <= 0.01 * Math.max(1, t)) UI.verdict(verdict, 'warn', 'Te salió con signo negativo', 'Resta la curva de abajo a la de arriba: ∫(f − g).');
      else UI.verdict(verdict, 'bad', 'No coincide', 'Revisa los límites y cuál curva va arriba. El lab muestra la región: compárala con tu planteamiento.');
    }

    function draw() {
      if (!F) return;
      var a = box.a, b = box.b, pad = (b - a) * 0.15, x0 = a - pad, x1 = b + pad, ys = [];
      for (var i = 0; i <= 160; i++) { var x = x0 + (x1 - x0) * i / 160; ys.push(F(x)); if (mode === 'area') ys.push(G(x)); }
      var plot = window.LabPlot(svg, { x: [x0, x1], y: window.LabPlot.range(ys) });
      plot.clear(); plot.grid();
      if (mode === 'area') {
        var pts = [], n = 160;
        for (i = 0; i <= n; i++) { x = a + (b - a) * i / n; pts.push([x, F(x)]); }
        for (i = n; i >= 0; i--) { x = a + (b - a) * i / n; pts.push([x, G(x)]); }
        plot.poly(pts, 'area-fill area-fill--aux');
      }
      plot.axes();
      plot.segments([[[a, plot.yr[0]], [a, plot.yr[1]]], [[b, plot.yr[0]], [b, plot.yr[1]]]], 'axis', 1);
      plot.curve(F, 'ref', 3.5);
      if (mode === 'area') {
        plot.curve(G, 'trace', 3);
        intersections(F, G, x0, x1).forEach(function (x) { plot.point(x, F(x), 'dot-aux', 5); });
      } else {
        var k = nS.get(), segs = [];
        for (i = 0; i < k; i++) { var p0 = a + (b - a) * i / k, p1 = a + (b - a) * (i + 1) / k; segs.push([[p0, F(p0)], [p1, F(p1)]]); }
        plot.segments(segs, 'aux', 2.5);
        for (i = 0; i <= k; i++) { x = a + (b - a) * i / k; plot.point(x, F(x), 'dot-aux', 4); }
      }
      facts.innerHTML = '';
      var rows = mode === 'area'
        ? [['a, b', UI.fmt(a, 4) + ', ' + UI.fmt(b, 4)], ['∫(f − g) neta', UI.fmt(net(F, G, a, b), 6)], ['área', UI.fmt(between(F, G, a, b), 6)]]
        : [['poligonal (n = ' + nS.get() + ')', UI.fmt(polyLength(F, a, b, nS.get()), 6)], ['longitud', UI.fmt(arcLength(F, a, b), 6)]];
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    document.addEventListener('cb:themechange', draw);
    return UI.loadMath().then(function (m) { math = m; build(); setTimeout(build, 400); });
  };
})();
