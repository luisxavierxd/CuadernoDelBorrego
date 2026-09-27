/* =====================================================================
   Lab solid-revolution (§8.3): sólido de revolución visto de lado, con los
   discos (o arandelas) alrededor del eje x o las capas cilíndricas alrededor
   del eje y. La suma de n piezas converge al volumen; compara el del alumno.
   En PC (pantalla ancha y mouse) se ve en 3D real con manim-web (ThreeDScene +
   Surface3D, se gira arrastrando); en móvil, o si WebGL falla, queda la vista
   SVG (perfil reflejado + piezas en perspectiva).
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  function simpson(fn, a, b, n) {
    n = n || 2000; if (n % 2) n++;
    var h = (b - a) / n, s = fn(a) + fn(b);
    for (var i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * fn(a + i * h);
    return s * h / 3;
  }
  // Discos o arandelas alrededor del eje x: V = π ∫ (f² − g²) dx.
  function disks(f, g, a, b) { return Math.PI * simpson(function (x) { var R = f(x), r = g(x); return R * R - r * r; }, a, b); }
  // Capas cilíndricas alrededor del eje y: V = 2π ∫ x (f − g) dx.
  function shells(f, g, a, b) { return 2 * Math.PI * simpson(function (x) { return x * (f(x) - g(x)); }, a, b); }
  // Suma con n piezas (altura en el punto medio de cada tira).
  function pieces(f, g, a, b, n, method) {
    var dx = (b - a) / n, s = 0;
    for (var i = 0; i < n; i++) {
      var x = a + (i + 0.5) * dx, R = f(x), r = g(x);
      s += method === 'shell' ? 2 * Math.PI * x * (R - r) * dx : Math.PI * (R * R - r * r) * dx;
    }
    return s;
  }
  window.LabMath.solid = { simpson: simpson, disks: disks, shells: shells, pieces: pieces };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { name: 'Cono (discos)', method: 'disk', f: 'x/2', g: '0', a: 0, b: 4 },
    { name: 'Esfera (discos)', method: 'disk', f: 'sqrt(4 - x^2)', g: '0', a: -2, b: 2 },
    { name: 'Paraboloide (discos)', method: 'disk', f: 'sqrt(x)', g: '0', a: 0, b: 4 },
    { name: 'Arandelas: entre x y x²', method: 'disk', f: 'x', g: 'x^2', a: 0, b: 1 },
    { name: 'Capas: bajo x − x²', method: 'shell', f: 'x - x^2', g: '0', a: 0, b: 1 },
    { name: 'Capas: bajo √x', method: 'shell', f: 'sqrt(x)', g: '0', a: 0, b: 4 }
  ];
  var METHODS = [['disk', 'Discos / arandelas (eje x)'], ['shell', 'Capas cilíndricas (eje y)']];

  window.Labs['solid-revolution'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var presets = cfg.presets || PRESETS;
    var math = null, F = null, G = null, P = presets[cfg.start || 0], box = { a: P.a, b: P.b }, method = P.method;
    var preset = UI.select({ label: 'Ejemplo', options: presets.map(function (p) { return p.name; }) });
    var methodSel = UI.select({ label: 'Método', options: METHODS.map(function (m) { return m[1]; }) });
    var fIn = UI.mathField({ label: 'Curva exterior f(x)', hint: 'Escribe cualquier función; usa la paleta o el teclado ⌨.', onEnter: function () { build(); } });
    var gIn = UI.mathField({ label: 'Curva interior g(x) (0 si no hay hueco)', onEnter: function () { build(); } });
    var ab = UI.rangeField(['a (desde)', 'b (hasta)'], [P.a, P.b], function () { build(); });
    var run = UI.button('Graficar', 'primary', function () { build(); });
    var nS = UI.slider({ label: 'Número de piezas n', min: 1, max: 40, step: 1, value: cfg.n || 6 }, function () { draw(); });
    var ansIn = UI.input({ label: 'Tu volumen', type: 'number', step: 'any', inputmode: 'decimal', mono: false, hint: 'Escribe el número decimal; por ejemplo, 16π/3 ≈ 16.755.' });
    var check = UI.button('Comprobar', 'primary', function () { verify(); });
    var status = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(640, 400, 'Sólido de revolución visto de lado, con sus discos o capas');
    // 3D solo donde tiene sentido: pantalla ancha con mouse. En móvil se queda el SVG.
    var want3D = !!(window.matchMedia && window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches);
    var stage3d = h('div', { class: 'lab-stage lab-stage--manim lab-stage--3d', hidden: true, role: 'img', 'aria-label': 'Sólido de revolución en 3D; arrastra para girarlo' });
    var note3d = h('p', { class: 'lab-note', hidden: true }, ['Arrastra para girar el sólido; la rueda del mouse acerca y aleja.']);
    var btn3d = UI.button('Vista 3D', 'ghost', function () { setView('3d'); });
    var btn2d = UI.button('Corte 2D', 'ghost', function () { setView('2d'); });
    var viewBar = h('div', { class: 'lab-buttons lab-viewbar', hidden: !want3D, role: 'group', 'aria-label': 'Tipo de vista' }, [btn3d, btn2d]);
    var M3 = null, scene3 = null, view = '2d', pending3 = false;
    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [preset.node, methodSel.node, fIn.node, gIn.node, ab.node, h('div', { class: 'lab-buttons' }, [run]), status, nS.node, ansIn.node, h('div', { class: 'lab-buttons' }, [check]), verdict, facts]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Rebanar el sólido']),
        viewBar,
        svg,
        stage3d,
        note3d,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'perfil f']),
          h('li', {}, [h('i', { class: 'sw sw--trace sw--dashed' }), 'hueco g']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'piezas']),
          h('li', {}, [h('i', { class: 'sw sw--error sw--dashed' }), 'eje de giro'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); build(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); build(); });
    methodSel.input.addEventListener('change', function () { method = METHODS[+methodSel.input.value][0]; build(); });

    function load(i) {
      P = presets[i]; method = P.method;
      methodSel.input.value = String(METHODS.findIndex(function (m) { return m[0] === method; }));
      fIn.setMath(P.f); gIn.setMath(P.g); ab.set(P.a, P.b); ansIn.input.value = ''; verdict.hidden = true;
    }
    load(cfg.start || 0);

    function build() {
      if (!math) return;
      try {
        var r = ab.get();
        if (!(isFinite(r[0]) && isFinite(r[1]) && r[1] > r[0])) throw new Error('a debe ser menor que b.');
        if (method === 'shell' && r[0] < 0) throw new Error('Con capas alrededor del eje y, usa x ≥ 0 (el radio de cada capa es x).');
        var fs = String(fIn.get() || '').trim(), gs = String(gIn.get() || '').trim() || '0';
        if (!fs) throw new Error('Escribe f(x).');
        F = window.LabMath.core.build(math, fs).fn; G = window.LabMath.core.build(math, gs).fn;
        box = { a: r[0], b: r[1] }; status.hidden = true;
      } catch (e) { UI.verdict(status, 'bad', 'No pude graficar', e.message); return; }
      draw();
    }
    function exact() { return method === 'shell' ? shells(F, G, box.a, box.b) : disks(F, G, box.a, box.b); }
    function verify() {
      if (!F) return;
      var s = parseFloat(ansIn.input.value), t = exact();
      if (!isFinite(s)) { UI.verdict(verdict, 'bad', 'Escribe un número', 'Usa punto decimal; por ejemplo 16.755 en lugar de 16π/3.'); return; }
      var near = function (u, w) { return Math.abs(u - w) <= 0.01 * Math.max(1, Math.abs(w)); };
      if (near(s, t)) { UI.verdict(verdict, 'ok', 'Tu volumen es correcto', 'V = ' + UI.fmt(t, 6) + ' = ' + UI.fmt(t / Math.PI, 5) + 'π.'); return; }
      if (near(s * Math.PI, t)) { UI.verdict(verdict, 'warn', 'Te falta el factor π', 'Cada disco tiene área πr²; cada capa, 2πx·altura.'); return; }
      var sq = Math.PI * simpson(function (x) { var d = F(x) - G(x); return d * d; }, box.a, box.b);
      if (method === 'disk' && near(s, sq) && !near(sq, t)) { UI.verdict(verdict, 'warn', 'Restaste los radios antes de elevar', 'Una arandela es π(R² − r²), no π(R − r)².'); return; }
      UI.verdict(verdict, 'bad', 'No coincide', 'Revisa el radio de cada pieza y los límites. Compara tu planteamiento con las piezas del dibujo.');
    }

    // Elipse como polígono (vista en perspectiva de un círculo).
    function ellipse(plot, cx, cy, rx, ry, cls) {
      var pts = [];
      for (var i = 0; i <= 36; i++) { var t = 2 * Math.PI * i / 36; pts.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]); }
      plot.poly(pts, cls);
    }

    function draw() {
      if (!F) return;
      var a = box.a, b = box.b, n = nS.get(), dx = (b - a) / n, M = 0, i, x;
      for (i = 0; i <= 200; i++) { x = a + (b - a) * i / 200; M = Math.max(M, Math.abs(F(x)) || 0, Math.abs(G(x)) || 0); }
      M = M || 1;
      var plot;
      if (method === 'disk') {
        var padX = (b - a) * 0.12;
        plot = window.LabPlot(svg, { x: [a - padX, b + padX], y: [-M * 1.3, M * 1.3], equal: true });
        plot.clear(); plot.grid();
        var tilt = 0.28;
        for (i = 0; i < n; i++) {
          var x0 = a + i * dx, xm = x0 + dx / 2, R = Math.abs(F(xm)), r = Math.abs(G(xm));
          plot.poly([[x0, -R], [x0, R], [x0 + dx, R], [x0 + dx, -R]], 'rect-fill');
          ellipse(plot, x0 + dx, 0, R * tilt, R, 'rect-fill');
          if (r > 1e-9) ellipse(plot, x0 + dx, 0, r * tilt, r, 'area-fill');
        }
        plot.axes();
        plot.segments([[[a - padX, 0], [b + padX, 0]]], 'error', 1.6);
        plot.curve(F, 'ref', 3.2, null, a, b);
        plot.curve(function (t) { return -F(t); }, 'ref', 3.2, null, a, b);
        plot.curve(G, 'trace', 2.2, '6 5', a, b);
        plot.curve(function (t) { return -G(t); }, 'trace', 2.2, '6 5', a, b);
      } else {
        var H = 0, L = 0;
        for (i = 0; i <= 200; i++) { x = a + (b - a) * i / 200; H = Math.max(H, F(x), G(x)); L = Math.min(L, F(x), G(x)); }
        plot = window.LabPlot(svg, { x: [-b * 1.15, b * 1.15], y: [L - (H - L) * 0.2 - 0.1, H + (H - L) * 0.3 + 0.1], equal: true });
        plot.clear(); plot.grid();
        var tiltY = 0.12 * (H - L || 1) / Math.max(b, 1e-9);
        for (i = 0; i < n; i++) {
          var s0 = a + i * dx, s1 = s0 + dx, sm = (s0 + s1) / 2, top = F(sm), bot = G(sm);
          [[s0, s1], [-s1, -s0]].forEach(function (p) { plot.poly([[p[0], bot], [p[0], top], [p[1], top], [p[1], bot]], 'rect-fill'); });
          ellipse(plot, 0, top, sm, sm * tiltY, 'area-fill');
        }
        plot.axes();
        plot.segments([[[0, plot.yr[0]], [0, plot.yr[1]]]], 'error', 1.6);
        plot.curve(F, 'ref', 3.2, null, a, b);
        plot.curve(function (t) { return F(-t); }, 'ref', 3.2, null, -b, -a);
        plot.curve(G, 'trace', 2.2, '6 5', a, b);
        plot.curve(function (t) { return G(-t); }, 'trace', 2.2, '6 5', -b, -a);
      }
      if (view === '3d') schedule3D();
      var S = pieces(F, G, a, b, n, method), V = exact();
      facts.innerHTML = '';
      [['suma con n = ' + n, UI.fmt(S, 6)], ['volumen', UI.fmt(V, 6) + ' ≈ ' + UI.fmt(V / Math.PI, 5) + 'π'], ['diferencia', UI.fmt(Math.abs(S - V), 3)]]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    /* ---------- Vista 3D (solo PC) ---------- */
    function setView(v) {
      view = v === '3d' && scene3 ? '3d' : '2d';
      svg.style.display = view === '2d' ? '' : 'none';
      stage3d.hidden = note3d.hidden = view !== '3d';
      btn3d.setAttribute('aria-pressed', String(view === '3d'));
      btn2d.setAttribute('aria-pressed', String(view === '2d'));
      if (view === '3d') schedule3D();
    }
    // El deslizador dispara muchos eventos: se redibuja a lo más una vez por cuadro.
    function schedule3D() {
      if (pending3) return;
      pending3 = true;
      requestAnimationFrame(function () { pending3 = false; try { draw3D(); } catch (e) { console.error(e); setView('2d'); } });
    }
    function draw3D() {
      if (!scene3 || !F) return;
      var a = box.a, b = box.b, n = nS.get(), dx = (b - a) / n, TAU = 2 * Math.PI, i, x, M = 0, H = 0, L = 0;
      for (i = 0; i <= 200; i++) {
        x = a + (b - a) * i / 200;
        var fx0 = F(x), gx0 = G(x);
        M = Math.max(M, Math.abs(fx0) || 0, Math.abs(gx0) || 0);
        H = Math.max(H, isFinite(fx0) ? fx0 : 0, isFinite(gx0) ? gx0 : 0); L = Math.min(L, isFinite(fx0) ? fx0 : 0, isFinite(gx0) ? gx0 : 0);
      }
      M = M || 1;
      var C = { ref: UI.color('--plot-ref'), aux: UI.color('--plot-aux'), trace: UI.color('--plot-trace'), axis: UI.color('--plot-error') };
      var objs = [];
      function surf(func, u, v, res, color, opacity) {
        objs.push(new M3.Surface3D({ func: func, uRange: u, vRange: v, uResolution: res[0], vResolution: res[1], color: color, opacity: opacity, doubleSided: true }));
      }
      function safe(fn) { return function (t) { var y = fn(t); return isFinite(y) ? y : 0; }; }
      var f = safe(F), g = safe(G), gZero = G(a) === 0 && G((a + b) / 2) === 0 && G(b) === 0;
      if (method === 'disk') {
        // Giro alrededor del eje x: el eje del sólido va a lo largo del eje x de la escena.
        var cx = (a + b) / 2, s = 9 / Math.max(b - a, 2 * M);
        var P = function (x, r, t) { return [(x - cx) * s, r * Math.cos(t) * s, r * Math.sin(t) * s]; };
        surf(function (u, v) { return P(u, Math.abs(f(u)), v); }, [a, b], [0, TAU], [56, 40], C.ref, 0.22);
        if (!gZero) surf(function (u, v) { return P(u, Math.abs(g(u)), v); }, [a, b], [0, TAU], [56, 40], C.trace, 0.18);
        for (i = 0; i < n; i++) {
          var x0 = a + i * dx, x1 = x0 + dx, xm = (x0 + x1) / 2, R = Math.abs(f(xm)), r = Math.abs(g(xm));
          surf((function (R) { return function (u, v) { return P(u, R, v); }; })(R), [x0, x1], [0, TAU], [1, 36], C.aux, 0.6);
          [x0, x1].forEach(function (xe) { surf(function (u, v) { return P(xe, u, v); }, [r, Math.max(R, r + 1e-6)], [0, TAU], [1, 36], C.aux, 0.6); });
          if (r > 1e-9) surf((function (r) { return function (u, v) { return P(u, r, v); }; })(r), [x0, x1], [0, TAU], [1, 36], C.trace, 0.5);
        }
        var pad = (b - a) * 0.15, w = 0.025 / s;
        surf(function (u, v) { return P(u, w, v); }, [a - pad, b + pad], [0, TAU], [1, 8], C.axis, 1);
      } else {
        // Capas alrededor del eje y: el eje de giro es el vertical (z) de la escena.
        var cy = (H + L) / 2, sc = 8 / Math.max(2 * b, H - L || 1);
        var Q = function (x, y, t) { return [x * Math.cos(t) * sc, x * Math.sin(t) * sc, (y - cy) * sc]; };
        surf(function (u, v) { return Q(u, f(u), v); }, [a, b], [0, TAU], [48, 40], C.ref, 0.22);
        surf(function (u, v) { return Q(u, g(u), v); }, [a, b], [0, TAU], [48, 40], C.trace, 0.18);
        for (i = 0; i < n; i++) {
          var s0 = a + i * dx, s1 = s0 + dx, sm = (s0 + s1) / 2, top = f(sm), bot = g(sm);
          if (Math.abs(top - bot) < 1e-9) continue;
          [s0, s1].forEach(function (xr) { surf(function (u, v) { return Q(xr, u, v); }, [Math.min(bot, top), Math.max(bot, top)], [0, TAU], [1, 36], C.aux, 0.55); });
          [bot, top].forEach(function (yh) { surf(function (u, v) { return Q(u, yh, v); }, [s0, s1], [0, TAU], [1, 36], C.aux, 0.55); });
        }
        var wz = 0.025 / sc;
        surf(function (u, v) { return [wz * Math.cos(v) * sc, wz * Math.sin(v) * sc, (u - cy) * sc]; }, [L - (H - L) * 0.2 - 0.2, H + (H - L) * 0.2 + 0.2], [0, TAU], [1, 8], C.axis, 1);
      }
      scene3.clear();
      scene3.add.apply(scene3, objs);
      if (typeof scene3.render === 'function') scene3.render();
    }
    function init3D() {
      if (!want3D) return;
      UI.loadManim().then(function (mod) {
        M3 = mod;
        stage3d.hidden = false;
        var w = stage3d.clientWidth || 640;
        scene3 = new M3.ThreeDScene(stage3d, { width: w, height: Math.round(w * 0.66), backgroundOpacity: 0, phi: 65 * Math.PI / 180, theta: -70 * Math.PI / 180, enableOrbitControls: true });
        stage3d.setAttribute('data-3d-ready', 'true');
        setView('3d');
      }).catch(function (e) {
        console.error(e);
        stage3d.hidden = true; viewBar.hidden = true; scene3 = null; setView('2d');
      });
    }

    document.addEventListener('cb:themechange', function () { draw(); });
    setView('2d');
    return UI.loadMath().then(function (m) {
      math = m; build(); setTimeout(build, 400);
      UI.onVisible(mount, init3D);
    });
  };
})();
