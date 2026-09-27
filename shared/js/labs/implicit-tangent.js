/* =====================================================================
   Lab implicit-tangent (§8.3): curva F(x, y) = 0, un punto sobre ella y la
   dy/dx del alumno (en x y y). Se compara contra −F_x/F_y en puntos de la
   curva cercanos al punto; se dibujan la tangente real y la del alumno.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  // "lado izquierdo = lado derecho" → F(x, y) = izquierdo − derecho
  function build(math, eqSrc) {
    var parts = String(eqSrc).split('=');
    var src = parts.length === 2 ? '(' + parts[0] + ') - (' + parts[1] + ')' : parts[0];
    return window.LabMath.core.build(math, src, ['x', 'y']).fn;
  }
  function slope(F, x, y) {
    var e = 1e-6;
    var fx = (F(x + e, y) - F(x - e, y)) / (2 * e), fy = (F(x, y + e) - F(x, y - e)) / (2 * e);
    return -fx / fy;
  }
  // Newton en y con x fija, partiendo de y0.
  function solveY(F, x, y0) {
    var y = y0, e = 1e-7;
    for (var i = 0; i < 40; i++) {
      var f = F(x, y), fy = (F(x, y + e) - F(x, y - e)) / (2 * e);
      if (!isFinite(f) || !isFinite(fy) || Math.abs(fy) < 1e-10) return NaN;
      var dy = f / fy;
      y -= dy;
      if (Math.abs(dy) < 1e-13) break;
    }
    return Math.abs(F(x, y)) < 1e-9 ? y : NaN;
  }
  // Puntos de la misma rama cerca de (x0, y0), avanzando hacia los dos lados.
  function pointsNear(F, x0, y0, n) {
    var pts = [{ x: x0, y: y0 }], step = 0.4 / n * Math.max(1, Math.abs(x0));
    [-1, 1].forEach(function (dir) {
      var yPrev = y0;
      for (var i = 1; i <= n / 2; i++) {
        var x = x0 + dir * i * step, y = solveY(F, x, yPrev + slope(F, x - dir * step, yPrev) * dir * step);
        if (!isFinite(y) || Math.abs(y - yPrev) > 1) break;
        pts.push({ x: x, y: y });
        yPrev = y;
      }
    });
    return pts;
  }
  function verify(math, eqSrc, dSrc, x0, y0) {
    var F = build(math, eqSrc), s = window.LabMath.core.build(math, dSrc, ['x', 'y']).fn;
    var pts = pointsNear(F, x0, y0, 16);
    var r = window.LabMath.core.compareValues(pts.map(function (p) { return [slope(F, p.x, p.y), s(p.x, p.y)]; }), 6);
    // La pendiente numérica tiene error ~1e-8: se relaja el umbral para "correcto".
    if (r.reason !== 'correct' && r.maxErr < 1e-5) { r.kind = 'ok'; r.reason = 'correct'; }
    r.trueSlope = slope(F, x0, y0); r.studentSlope = s(x0, y0); r.F = F;
    return r;
  }
  // Segmentos de la curva F = 0 en una rejilla (marching squares).
  function contour(F, xr, yr, nx, ny) {
    var segs = [], dx = (xr[1] - xr[0]) / nx, dy = (yr[1] - yr[0]) / ny, v = [];
    for (var j = 0; j <= ny; j++) { v.push([]); for (var i = 0; i <= nx; i++) v[j].push(F(xr[0] + i * dx, yr[0] + j * dy)); }
    function lerp(a, b, fa, fb) { return a + (b - a) * fa / (fa - fb); }
    for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) {
      var x = xr[0] + i * dx, y = yr[0] + j * dy;
      var f00 = v[j][i], f10 = v[j][i + 1], f01 = v[j + 1][i], f11 = v[j + 1][i + 1];
      if (![f00, f10, f01, f11].every(isFinite)) continue;
      var p = [];
      if ((f00 < 0) !== (f10 < 0)) p.push([lerp(x, x + dx, f00, f10), y]);
      if ((f10 < 0) !== (f11 < 0)) p.push([x + dx, lerp(y, y + dy, f10, f11)]);
      if ((f01 < 0) !== (f11 < 0)) p.push([lerp(x, x + dx, f01, f11), y + dy]);
      if ((f00 < 0) !== (f01 < 0)) p.push([x, lerp(y, y + dy, f00, f01)]);
      if (p.length === 2) segs.push(p);
      if (p.length === 4) { segs.push([p[0], p[1]]); segs.push([p[2], p[3]]); }
    }
    return segs;
  }
  window.LabMath.implicit = { build: build, slope: slope, solveY: solveY, pointsNear: pointsNear, verify: verify, contour: contour };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { name: 'Círculo x² + y² = 25', eq: 'x^2 + y^2 = 25', p: [3, 4], d: 'x/y', x: [-7, 7], y: [-6, 6] },
    { name: 'Elipse x²/9 + y²/4 = 1', eq: 'x^2/9 + y^2/4 = 1', p: [1.5, Math.sqrt(3)], d: '-4x/(9y)', x: [-4.5, 4.5], y: [-3, 3] },
    { name: 'Hoja de Descartes x³ + y³ = 6xy', eq: 'x^3 + y^3 = 6x*y', p: [3, 3], d: '(2y - x^2)/(y^2 - 2x)', x: [-4, 5], y: [-4, 5] },
    { name: 'Hipérbola xy = 4', eq: 'x*y = 4', p: [2, 2], d: '-y/x', x: [-6, 6], y: [-6, 6] },
    { name: 'Curva y² = x³ − x + 1', eq: 'y^2 = x^3 - x + 1', p: [1, 1], d: '(3x^2 - 1)/(2y)', x: [-2.5, 2.5], y: [-3.5, 3.5] }
  ];

  window.Labs['implicit-tangent'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var presets = cfg.presets || PRESETS;
    var math = null, P = presets[cfg.start || 0], last = null;
    function field(o) {
      if (window.CBMathInput) return window.CBMathInput.create(o);
      var f = UI.input(o);
      return { node: f.node, get: function () { return f.input.value; }, setMath: function (s) { f.input.value = s; } };
    }
    var preset = UI.select({ label: 'Curva', options: presets.map(function (p) { return p.name; }) });
    var eqBox = h('div', { class: 'lab-given' });
    var dIn = field({ label: 'Tu dy/dx (en términos de x y y)', hint: 'Deriva los dos lados respecto a x, recuerda que (y²)′ = 2y·y′, y despeja y′.', onEnter: function () { check(); } });
    var run = UI.button('Comprobar', 'primary', check);
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(640, 420, 'Curva implícita con el punto elegido, la tangente real y la tuya');
    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [preset.node, eqBox, dIn.node, h('div', { class: 'lab-buttons' }, [run]), verdict, facts]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['La tangente en un punto de la curva']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'la curva']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'tangente real']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'con tu dy/dx'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); setTimeout(check, 300); });
    function load(i) {
      P = presets[i];
      eqBox.innerHTML = '';
      if (window.katex && math) window.katex.render(math.parse(P.eq.split('=')[0]).toTex() + ' = ' + math.parse(P.eq.split('=')[1]).toTex() + '\\quad\\text{en } (' + UI.fmt(P.p[0], 3) + ',\\ ' + UI.fmt(P.p[1], 3) + ')', eqBox, { throwOnError: false });
      else eqBox.textContent = P.eq + ' en (' + UI.fmt(P.p[0], 3) + ', ' + UI.fmt(P.p[1], 3) + ')';
      dIn.setMath(P.d);
    }

    function check() {
      if (!math) return;
      try {
        var r = verify(math, P.eq, dIn.get(), P.p[0], P.p[1]);
        var msgs = {
          correct: ['Tu dy/dx es correcta', 'Coincide con −F_x/F_y en toda la rama cercana al punto.'],
          sign: ['Tu signo está invertido', 'Al pasar términos de un lado a otro cambia el signo; revisa el despeje de y′.'],
          factor: ['Te sobra un factor', 'Tu dy/dx es ' + UI.fmt(r.k, 4) + ' veces la real. ¿Olvidaste la regla de la cadena en algún término con y?'],
          domain: ['No se pudo evaluar', 'Tu expresión no está definida cerca del punto.'],
          mismatch: ['Tu dy/dx no coincide', 'Cada término con y lleva un y′ al derivar: (y²)′ = 2y·y′ y (xy)′ = y + x·y′.']
        };
        var m = msgs[r.reason] || msgs.mismatch;
        UI.verdict(verdict, r.kind, m[0], m[1]);
        last = r;
      } catch (e) {
        UI.verdict(verdict, 'bad', 'No pude leer la expresión', e.message);
        last = null;
      }
      draw();
    }

    function draw() {
      if (!math) return;
      var F = build(math, P.eq);
      var plot = window.LabPlot(svg, { x: P.x, y: P.y, equal: true });
      plot.clear(); plot.grid(); plot.axes();
      plot.segments(contour(F, P.x, P.y, 140, 110), 'ref', 3.2);
      var x0 = P.p[0], y0 = P.p[1], mT = slope(F, x0, y0);
      plot.line(function (x) { return y0 + mT * (x - x0); }, 'aux', 2.6);
      if (last && isFinite(last.studentSlope)) plot.line(function (x) { return y0 + last.studentSlope * (x - x0); }, 'student', 2.6);
      plot.point(x0, y0, 'dot-aux');
      facts.innerHTML = '';
      [['pendiente real', UI.fmt(mT, 5)], ['con tu dy/dx', last ? UI.fmt(last.studentSlope, 5) : '—']]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    document.addEventListener('cb:themechange', draw);
    return UI.loadMath().then(function (m) { math = m; load(cfg.start || 0); setTimeout(check, 400); });
  };
})();
