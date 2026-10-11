/* =====================================================================
   Lab directional-derivative (Cálculo 2 · S07): rotar el vector unitario u
   sobre el mapa de contorno de f y ver, en vivo, la derivada direccional
   D_u f = ∇f · u, su curva contra el ángulo θ (una sinusoide con máximo
   |∇f|) y el corte vertical de la superficie en la dirección de u.
   Reto: el alumno calcula D_u f para una dirección dada como vector no
   unitario o como ángulo; el lab compara contra la real (y contra el límite
   numérico f(P + hu)) y avisa si no normalizó, si usó la calculadora en
   grados, si intercambió f_x y f_y o si olvidó un término.
   Solo vista 2D (contorno + cortes): es la misma en PC y en móvil.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  var TAU = 2 * Math.PI;
  function prep(s) { return window.LabMath.core.prep(s); }
  function fn2(math, src) { return window.LabMath.core.build(math, src, ['x', 'y']).fn; }

  function dot(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }
  function norm(v) { return Math.sqrt(dot(v, v)); }
  // Vector unitario en la dirección de v (null si v es el vector cero).
  function unit(v) { var L = norm(v); return L > 1e-12 ? v.map(function (c) { return c / L; }) : null; }
  function fromAngle(th) { return [Math.cos(th), Math.sin(th)]; }
  function wrap(th) { th = th % TAU; return th < 0 ? th + TAU : th; }

  // Gradiente simbólico (math.derivative) en pt = { x, y } o { x, y, z }: arreglo en el orden de pt.
  function gradAt(math, src, pt) {
    var node = math.parse(prep(src));
    return Object.keys(pt).map(function (k) {
      try { var v = math.derivative(node, k).evaluate(Object.assign({}, pt)); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; }
    });
  }
  // D_u f = ∇f · u con u = dir / |dir| (dir puede venir sin normalizar).
  function duf(math, src, pt, dir) { return dot(gradAt(math, src, pt), unit(dir)); }
  // D_u f para u = (cos θ, sin θ), con θ en radianes.
  function dufAngle(math, src, pt, th) { return duf(math, src, pt, fromAngle(th)); }

  // Límite numérico de la definición: (f(P + hu) − f(P − hu)) / 2h, con extrapolación de
  // Richardson (combina h y h/2): no usa derivadas, solo valores de f. f recibe las coordenadas.
  function limit(f, P, u, h) {
    h = h || 1e-2;
    function at(t) { return f.apply(null, P.map(function (c, i) { return c + t * u[i]; })); }
    function cd(s) { return (at(s) - at(-s)) / (2 * s); }
    return (4 * cd(h / 2) - cd(h)) / 3;
  }
  // El mismo límite a partir de la expresión (compilada con math.js, sin derivar).
  function limitAt(math, src, pt, dir) {
    var keys = Object.keys(pt), code = math.parse(prep(src)).compile();
    var f = function () { var sc = {}; for (var i = 0; i < keys.length; i++) sc[keys[i]] = arguments[i]; return code.evaluate(sc); };
    return limit(f, keys.map(function (k) { return pt[k]; }), unit(dir));
  }
  // Gradiente numérico (diferencias centradas en cada coordenada).
  function numGrad(f, P, h) {
    return P.map(function (_, i) {
      var e = P.map(function (__, j) { return j === i ? 1 : 0; });
      return limit(f, P, e, h);
    });
  }
  // La curva θ ↦ D_u f con u = (cos θ, sin θ): g₁ cos θ + g₂ sin θ.
  function curve(g) { return function (th) { return g[0] * Math.cos(th) + g[1] * Math.sin(th); }; }
  // Máximo, mínimo y ceros de esa curva: máx |∇f| en la dirección de ∇f, mín en la opuesta,
  // cero en las dos perpendiculares (tangentes a la curva de nivel). Ángulos en [0, 2π).
  function extremes(g) {
    var th = wrap(Math.atan2(g[1], g[0])), m = norm(g);
    var z = [wrap(th + Math.PI / 2), wrap(th - Math.PI / 2)].sort(function (p, q) { return p - q; });
    return { max: m, min: -m, thMax: th, thMin: wrap(th + Math.PI), zeros: z };
  }
  // Lo mismo a partir de la expresión: { max, min, thMax, thMin, zeros } en pt.
  function extremesAt(math, src, pt) { return extremes(gradAt(math, src, pt)); }
  // Corte vertical por P en la dirección u: z(t) = f(P + t u), t = distancia recorrida.
  function slice(f, P, u) { return function (t) { return f(P[0] + t * u[0], P[1] + t * u[1]); }; }

  // Cerca con la holgura de los ejercicios: ±0.01 o ±1 %.
  function near(s, t) { return Math.abs(s - t) <= Math.max(0.01, 0.01 * Math.abs(t)) + 1e-9; }
  // Diagnóstico del valor escrito por el alumno. g = ∇f(P); dir = la dirección dada (sin normalizar
  // si así venía); o.angle = el ángulo en radianes si la dirección se dio con un ángulo.
  // reason: correct · noNorm · degMode · swap · term · maxRate · sign · mismatch
  // Los errores típicos como [razón, valor]: sin normalizar, calculadora en grados, f_x y f_y
  // intercambiadas, un término olvidado (uno por coordenada) y |∇f| en lugar de la proyección.
  function mistakeValues(g, dir, o) {
    o = o || {};
    var u = unit(dir), want = dot(g, u), c = [];
    if (Math.abs(norm(dir) - 1) > 1e-9) c.push(['noNorm', dot(g, dir)]);
    if (o.angle != null) c.push(['degMode', dot(g, fromAngle(o.angle * Math.PI / 180))]);
    if (g.length === 2) c.push(['swap', g[0] * u[1] + g[1] * u[0]]);
    for (var i = 0; i < g.length; i++) c.push(['term', want - g[i] * u[i]]);
    c.push(['maxRate', norm(g)]);
    return c;
  }
  function diagnose(g, dir, s, o) {
    var u = unit(dir), want = dot(g, u), out = { want: want };
    if (near(s, want)) return Object.assign(out, { kind: 'ok', reason: 'correct' });
    var c = mistakeValues(g, dir, o);
    for (var k = 0; k < c.length; k++) {
      if (isFinite(c[k][1]) && !near(c[k][1], want) && near(s, c[k][1])) return Object.assign(out, { kind: 'warn', reason: c[k][0] });
    }
    if (Math.abs(want) > 0.02 && near(-s, want)) return Object.assign(out, { kind: 'warn', reason: 'sign' });
    return Object.assign(out, { kind: 'bad', reason: 'mismatch' });
  }

  window.LabMath.directional = {
    dot: dot, norm: norm, unit: unit, fromAngle: fromAngle, wrap: wrap, fn2: fn2,
    gradAt: gradAt, duf: duf, dufAngle: dufAngle, limit: limit, limitAt: limitAt, numGrad: numGrad,
    curve: curve, extremes: extremes, extremesAt: extremesAt, slice: slice, near: near, mistakeValues: mistakeValues, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { name: 'Cerro: 9 − x² − 2y²', f: '9 - x^2 - 2y^2', w: [-3, 3, -3, 3], a: 1, b: 1, th: 30 },
    { name: 'Plano inclinado: 2x − y + 1', f: '2x - y + 1', w: [-3, 3, -3, 3], a: 0.5, b: 0.5, th: 0 },
    { name: 'Silla: x² − y²', f: 'x^2 - y^2', w: [-2, 2, -2, 2], a: 1, b: 0.5, th: 45 },
    { name: 'Producto: x·y', f: 'x*y', w: [-2, 2, -2, 2], a: 1, b: 0.5, th: 60 },
    { name: 'Placa: T = 80 − x² − 3y²', f: '80 - x^2 - 3y^2', w: [-4, 4, -3, 3], a: 2, b: 1, th: 53 },
    { name: 'Onda: sen x · cos y', f: 'sin(x)*cos(y)', w: [-3, 3, -3, 3], a: 1, b: 0.5, th: 120 },
    { name: 'Campana: 4e^(−(x² + y²)/2)', f: '4e^(-(x^2 + y^2)/2)', w: [-3, 3, -3, 3], a: 1, b: 0.5, th: 200 }
  ];
  var MODES = [['vec', 'Dirección dada por un vector v'], ['ang', 'Dirección dada por un ángulo θ']];
  // Vectores enteros no unitarios y ángulos «de tabla» para el reto.
  var VECS = [[3, 4], [4, -3], [1, 2], [2, -1], [-1, 3], [1, 1], [-2, -1], [-3, 4], [2, 3], [5, -12], [-1, -2], [3, -1]];
  var ANGS = [[1, 6], [1, 4], [1, 3], [1, 2], [2, 3], [3, 4], [5, 6], [1, 1], [7, 6], [5, 4], [4, 3], [3, 2], [5, 3], [7, 4], [11, 6]];
  var NS = 'http://www.w3.org/2000/svg', RAD = Math.PI / 180;

  window.Labs['directional-derivative'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, LM = window.LabMath.directional;
    var presets = cfg.presets || PRESETS, start = cfg.start != null ? cfg.start : 0;
    var math = null, F = null, src = '', P0 = presets[start], win = P0.w, mode = 'vec', reto = null, shown = false, showG = false;
    var th = P0.th * RAD, rnd = Math.random;

    var preset = UI.select({ label: 'Ejemplo', options: presets.map(function (p) { return p.name; }) });
    var fIn = UI.mathField({ label: 'Función z = f(x, y)', hint: 'Escribe cualquier función de x y y; usa la paleta o el teclado ⌨.', palette: 'multi', onEnter: function () { build(); } });
    var run = UI.button('Graficar', 'primary', function () { build(); });
    var status = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var thS = UI.slider({ label: 'Ángulo θ de u (desde +x)', min: 0, max: 360, step: 'any', value: P0.th, fmt: fmtTh }, function (v) { th = v * RAD; moved(); });
    var aS = UI.slider({ label: 'a (x del punto P)', min: win[0], max: win[1], step: 0.1, value: P0.a, fmt: fmtN }, function () { moved(); });
    var bS = UI.slider({ label: 'b (y del punto P)', min: win[2], max: win[3], step: 0.1, value: P0.b, fmt: fmtN }, function () { moved(); });
    var gBox = h('input', { type: 'checkbox' });
    var gLab = h('label', { class: 'dd-check' }, [gBox, 'Mostrar ∇f, la dirección de máximo crecimiento (lo verás a fondo en S08)']);
    var modeSel = UI.select({ label: 'Reto', options: MODES.map(function (m) { return m[1]; }) });
    var retoTxt = h('p', { class: 'dd-reto' });
    var newR = UI.button('Otro reto', 'ghost', function () { newReto(); });
    var ans = UI.input({ label: 'Tu Dᵤf en P', type: 'number', step: 'any', inputmode: 'decimal', mono: false, hint: 'Redondea a 2 decimales.' });
    var check = UI.button('Comprobar', 'primary', function () { verify(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });

    var map = UI.svg(600, 450, 'Mapa de contorno de f con el punto P y el vector unitario u');
    map.classList.add('dd-map');
    var wave = UI.svg(600, 260, 'Dᵤf contra el ángulo θ: una sinusoide');
    var cut = UI.svg(600, 260, 'Corte vertical de la superficie en la dirección de u, con su recta tangente');
    var waveCap = h('p', { class: 'lab-note' }), cutCap = h('p', { class: 'lab-note' });
    var legG = h('li', { hidden: true }, [h('i', { class: 'sw sw--error sw--dashed' }), '∇f']);

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls dd-controls', novalidate: true }, [
        preset.node, fIn.node, h('div', { class: 'lab-buttons' }, [run]), status,
        thS.node, aS.node, bS.node, gLab,
        modeSel.node, retoTxt, h('div', { class: 'lab-buttons' }, [newR]), ans.node,
        h('div', { class: 'lab-buttons' }, [check]), verdict, facts
      ]),
      h('figure', { class: 'lab-board dd-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Rota el vector u']),
        h('p', { class: 'lab-stack__label' }, ['Mapa de contorno (vista desde arriba): arrastra P o la punta de u']),
        map,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'curvas de nivel']),
          h('li', {}, [h('i', { class: 'sw sw--aux sw--dashed' }), 'nivel de P y corte']),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'u (unitario)']),
          legG
        ]),
        h('div', { class: 'dd-cuts' }, [
          h('div', { class: 'lab-stack' }, [h('p', { class: 'lab-stack__label' }, ['Dᵤf contra θ']), wave, waveCap]),
          h('div', { class: 'lab-stack' }, [h('p', { class: 'lab-stack__label' }, ['Corte vertical en la dirección de u']), cut, cutCap])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); build(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); build(true); });
    modeSel.input.addEventListener('change', function () { mode = MODES[+modeSel.input.value][0]; newReto(); });
    gBox.addEventListener('change', function () { showG = gBox.checked; legG.hidden = !showG; draw(); });
    ans.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); verify(); } });

    function fmtN(v) { return (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(2)).toString().replace('-', '−'); }
    function fmtTh(v) { return Math.round(v) + '° = ' + (v * RAD).toFixed(2) + ' rad'; }
    function f2(v) { return isFinite(v) ? (Math.abs(v) < 0.005 ? '0' : v.toFixed(2).replace('-', '−')) : '—'; }
    function setRange(sl, lo, hi, v) { sl.input.min = lo; sl.input.max = hi; sl.set(Math.max(lo, Math.min(hi, v))); }
    function load(i) {
      P0 = presets[i]; win = P0.w;
      fIn.setMath(P0.f);
      setRange(aS, win[0], win[1], P0.a); setRange(bS, win[2], win[3], P0.b);
      th = P0.th * RAD; thS.set(P0.th);
    }
    function moved() { draw(); }
    preset.input.value = String(start);
    load(start);

    // auto: lo llama el lab al cargar; si el editor aún no tiene la fórmula, usa la del ejemplo.
    function build(auto) {
      if (!math) return;
      try {
        var s = String(fIn.get() || '').trim() || (auto === true ? P0.f : '');
        if (!s) throw new Error('Escribe f(x, y).');
        var fn = LM.fn2(math, s);
        math.derivative(prep(s), 'x'); math.derivative(prep(s), 'y');      // que math.js la pueda derivar
        var okPts = 0;
        for (var i = 0; i <= 10; i++) for (var j = 0; j <= 10; j++) if (isFinite(fn(win[0] + (win[1] - win[0]) * i / 10, win[2] + (win[3] - win[2]) * j / 10))) okPts++;
        if (okPts < 20) throw new Error('La función casi no está definida en la ventana de este ejemplo.');
        F = fn; src = s; status.hidden = true;
      } catch (e) { UI.verdict(status, 'bad', 'No pude graficar', e.message); return; }
      newReto(true);
      draw();
    }

    /* ---------- Reto ---------- */
    function grad(pt) { return LM.gradAt(math, src, pt); }
    function newReto(first) {
      if (!F || !math) return;
      var best = null;
      for (var t = 0; t < 60 && !best; t++) {
        var span = [(win[1] - win[0]) * 0.3, (win[3] - win[2]) * 0.3];
        var a = first && t === 0 ? Math.round(P0.a * 2) / 2 : Math.round(((win[0] + win[1]) / 2 + (2 * rnd() - 1) * span[0]) * 2) / 2;
        var b = first && t === 0 ? Math.round(P0.b * 2) / 2 : Math.round(((win[2] + win[3]) / 2 + (2 * rnd() - 1) * span[1]) * 2) / 2;
        var r = { a: a, b: b };
        if (mode === 'vec') { r.v = first && t === 0 ? [3, 4] : VECS[Math.floor(rnd() * VECS.length)]; r.dir = r.v; }
        else { r.ang = ANGS[Math.floor(rnd() * ANGS.length)]; r.th = Math.PI * r.ang[0] / r.ang[1]; r.dir = LM.fromAngle(r.th); }
        var g = grad({ x: a, y: b });
        if (!g.every(isFinite)) continue;
        var want = LM.dot(g, LM.unit(r.dir));
        // Que la respuesta no sea casi 0 y que ningún error típico caiga encima de ella.
        if (Math.abs(want) < 0.15) continue;
        var clash = LM.mistakeValues(g, r.dir, r.th != null ? { angle: r.th } : {}).some(function (c) {
          return (c[0] === 'noNorm' || c[0] === 'degMode' || c[0] === 'swap') && Math.abs(c[1] - want) < 0.05 + 0.03 * Math.abs(want);
        });
        if (!clash) { r.g = g; best = r; }
      }
      reto = best;
      shown = false; verdict.hidden = true; ans.input.value = '';
      showReto();
    }
    function fracPi(r) {
      if (!r) return 'θ';
      var p = r[0], q = r[1];
      if (q === 1) return (p === 1 ? '' : p) + 'π';
      return (p === 1 ? '' : p) + 'π/' + q;
    }
    function showReto() {
      if (!reto) { retoTxt.textContent = 'Con esta función no encontré un reto; prueba otro ejemplo.'; return; }
      var where = 'en P = (' + fmtN(reto.a) + ', ' + fmtN(reto.b) + ')';
      retoTxt.textContent = reto.v
        ? 'Calcula Dᵤf ' + where + ' en la dirección del vector v = ⟨' + fmtN(reto.v[0]) + ', ' + fmtN(reto.v[1]) + '⟩. Ojo: v no es unitario.'
        : 'Calcula Dᵤf ' + where + ' en la dirección θ = ' + fracPi(reto.ang) + ' (radianes).';
    }

    function verify() {
      if (!F || !math || !reto) return;
      var s = parseFloat(String(ans.input.value).replace(',', '.').replace('−', '-'));
      if (!isFinite(s)) { UI.verdict(verdict, 'bad', 'Escribe un número', 'Usa punto decimal; por ejemplo −4.40.'); return; }
      var r = LM.diagnose(reto.g, reto.dir, s, reto.th != null ? { angle: reto.th } : {});
      var u = LM.unit(reto.dir), L = LM.norm(reto.dir), num = LM.limit(F, [reto.a, reto.b], u, 1e-3);
      var uTxt = 'u = (' + f2(u[0]) + ', ' + f2(u[1]) + ')';
      var msgs = {
        correct: ['Tu Dᵤf es correcta', 'Con ∇f = (' + f2(reto.g[0]) + ', ' + f2(reto.g[1]) + ') y ' + uTxt + ': Dᵤf = ' + f2(r.want) + '. El límite numérico (f(P + hu) − f(P − hu))/2h da ' + f2(num) + '.'],
        noNorm: ['Casi: no normalizaste v', 'Usaste v tal cual. Su largo es |v| = ' + f2(L) + ', así que tu número sale ' + f2(L) + ' veces más grande. Divide v entre |v| antes del producto punto.'],
        degMode: ['Casi: tu calculadora estaba en grados', 'θ = ' + fracPi(reto.ang) + ' está en radianes. Con la calculadora en grados, cos y sen no dan lo que deben. Cámbiala a radianes (o usa cos(π/6) = √3/2, etc.).'],
        swap: ['Casi: intercambiaste ∂f/∂x y ∂f/∂y', 'La componente en x de u multiplica a ∂f/∂x, y la de y a ∂f/∂y: Dᵤf = ∂f/∂x·a + ∂f/∂y·b.'],
        term: ['Casi: te faltó un término', 'Dᵤf = ∂f/∂x·a + ∂f/∂y·b suma las dos contribuciones: lo que cambia f por moverte en x y lo que cambia por moverte en y.'],
        maxRate: ['Ese es el máximo, no el de esta dirección', 'Calculaste |∇f|, la razón de cambio más grande posible. En esta dirección hay que proyectar: Dᵤf = ∇f · u.'],
        sign: ['Casi: tu signo está invertido', 'Revisa el signo de las parciales y de las componentes de u (en qué cuadrante apunta).'],
        mismatch: ['No coincide', 'Calcula ∂f/∂x y ∂f/∂y en P, normaliza la dirección y haz el producto punto: Dᵤf = ∂f/∂x·a + ∂f/∂y·b.']
      };
      var m = msgs[r.reason] || msgs.mismatch;
      UI.verdict(verdict, r.kind === 'ok' ? 'ok' : r.kind === 'warn' ? 'warn' : 'bad', m[0], m[1]);
      shown = true;
      draw();
    }

    /* ---------- Dibujo ---------- */
    function el(tag, attrs, parent, txt) {
      var n = document.createElementNS(NS, tag);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (txt != null) n.textContent = txt;
      parent.appendChild(n);
      return n;
    }
    function layer(svg) { return svg.querySelector('g.sketch') || svg; }
    function arrowD(x1, y1, x2, y2) {
      var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
      if (!(L > 2)) return '';
      var ux = dx / L, uy = dy / L, hh = Math.min(13, L * 0.4);
      return 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) +
        'M' + (x2 - ux * hh - uy * hh * 0.6).toFixed(1) + ' ' + (y2 - uy * hh + ux * hh * 0.6).toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) +
        'L' + (x2 - ux * hh + uy * hh * 0.6).toFixed(1) + ' ' + (y2 - uy * hh - ux * hh * 0.6).toFixed(1);
    }
    // Curvas de nivel por marching squares sobre una malla del recuadro visible.
    function levels(lo, hi, target) {
      var raw = (hi - lo) / target, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
      var s = (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p, out = [];
      for (var c = Math.ceil(lo / s - 1e-9) * s; c <= hi + 1e-9 && out.length < 40; c += s) out.push(+c.toFixed(10));
      return out;
    }
    var TABLE = { 1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 5: [[3, 0], [1, 2]], 6: [[0, 2]], 7: [[3, 2]], 8: [[2, 3]], 9: [[0, 2]], 10: [[0, 1], [2, 3]], 11: [[1, 2]], 12: [[1, 3]], 13: [[0, 1]], 14: [[3, 0]] };
    function contourD(G, c, X, Y) {
      var d = '';
      for (var j = 0; j < G.n; j++) for (var i = 0; i < G.n; i++) {
        var a = G.v[j][i] - c, b = G.v[j][i + 1] - c, cc = G.v[j + 1][i + 1] - c, dd = G.v[j + 1][i] - c;
        if (!(isFinite(a) && isFinite(b) && isFinite(cc) && isFinite(dd))) continue;
        var idx = (a > 0 ? 1 : 0) | (b > 0 ? 2 : 0) | (cc > 0 ? 4 : 0) | (dd > 0 ? 8 : 0);
        if (!idx || idx === 15) continue;
        var x0 = G.xs[i], x1 = G.xs[i + 1], y0 = G.ys[j], y1 = G.ys[j + 1];
        var E = [[x0 + a / (a - b) * (x1 - x0), y0], [x1, y0 + b / (b - cc) * (y1 - y0)], [x1 + cc / (cc - dd) * (x0 - x1), y1], [x0, y1 + dd / (dd - a) * (y0 - y1)]];
        TABLE[idx].forEach(function (p) { d += 'M' + X(E[p[0]][0]).toFixed(1) + ' ' + Y(E[p[0]][1]).toFixed(1) + 'L' + X(E[p[1]][0]).toFixed(1) + ' ' + Y(E[p[1]][1]).toFixed(1); });
      }
      return d;
    }

    var plotMap = null;
    function draw() {
      if (!F || !math) return;
      var a = aS.get(), b = bS.get(), u = LM.fromAngle(th), g = grad({ x: a, y: b }), ex = LM.extremes(g), D = LM.dot(g, u);
      drawMap(a, b, u, g);
      drawWave(g, ex, D);
      drawCut(a, b, u, D);
      facts.innerHTML = '';
      var rows = [
        ['P', '(' + fmtN(a) + ', ' + fmtN(b) + ')'],
        ['u = (cos θ, sen θ)', '(' + f2(u[0]) + ', ' + f2(u[1]) + ')'],
        ['f(P)', f2(F(a, b))],
        ['∂f/∂x, ∂f/∂y en P', f2(g[0]) + ', ' + f2(g[1])],
        ['Dᵤf = ∂f/∂x cos θ + ∂f/∂y sen θ', f2(D)],
        ['límite numérico (h = 0.001)', f2(LM.limit(F, [a, b], u, 1e-3))],
        ['máximo |∇f| (en θ = ' + Math.round(ex.thMax / RAD) + '°)', f2(ex.max)]
      ];
      if (shown && reto) rows.push(['reto: Dᵤf real', f2(LM.dot(reto.g, LM.unit(reto.dir)))]);
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
      waveCap.textContent = 'Horizontal: θ en grados · vertical: Dᵤf. Máximo |∇f| = ' + f2(ex.max) + ' en θ = ' + Math.round(ex.thMax / RAD) + '°; cero en θ = ' + Math.round(ex.zeros[0] / RAD) + '° y ' + Math.round(ex.zeros[1] / RAD) + '°.';
      cutCap.textContent = 'Horizontal: t, lo que caminas desde P en la dirección de u · vertical: z. La pendiente de la tangente es Dᵤf = ' + f2(D) + '.';
    }

    function drawMap(a, b, u, g) {
      var p = window.LabPlot(map, { x: [win[0], win[1]], y: [win[2], win[3]], equal: true });
      plotMap = p;
      p.clear(); p.axes();
      var L0 = layer(map), xr = p.xr, yr = p.yr, n = 70, G = { xs: [], ys: [], v: [], n: n }, i, j, lo = Infinity, hi = -Infinity;
      for (i = 0; i <= n; i++) { G.xs.push(xr[0] + (xr[1] - xr[0]) * i / n); G.ys.push(yr[0] + (yr[1] - yr[0]) * i / n); }
      for (j = 0; j <= n; j++) {
        var row = [];
        for (i = 0; i <= n; i++) { var z = F(G.xs[i], G.ys[j]); z = isFinite(z) ? z : NaN; row.push(z); if (isFinite(z)) { lo = Math.min(lo, z); hi = Math.max(hi, z); } }
        G.v.push(row);
      }
      if (isFinite(lo) && hi - lo > 1e-9) {
        var dC = '';
        levels(lo, hi, 12).forEach(function (c) { dC += contourD(G, c, p.X, p.Y); });
        el('path', { d: dC, class: 'ref', fill: 'none', 'stroke-width': 1.3, 'stroke-opacity': 0.55 }, L0);
        var z0 = F(a, b);
        if (isFinite(z0)) el('path', { d: contourD(G, z0, p.X, p.Y), class: 'aux', fill: 'none', 'stroke-width': 2.2, 'stroke-dasharray': '7 5' }, L0);
      }
      var px = p.X(a), py = p.Y(b), k = p.X(1) - p.X(0);
      var Lu = 0.2 * Math.min(xr[1] - xr[0], yr[1] - yr[0]) * k;          // largo en pantalla del vector unitario
      // La huella del corte: recta por P en la dirección de u.
      var far = 3 * Math.max(xr[1] - xr[0], yr[1] - yr[0]) * k;
      el('path', { d: 'M' + (px - u[0] * far).toFixed(1) + ' ' + (py + u[1] * far).toFixed(1) + 'L' + (px + u[0] * far).toFixed(1) + ' ' + (py - u[1] * far).toFixed(1), class: 'aux', fill: 'none', 'stroke-width': 1.3, 'stroke-dasharray': '3 6', 'clip-path': clipOf(map) }, L0);
      var gl = LM.norm(g);
      if (showG && gl > 1e-9) {
        var gs = Math.min(1.6, 0.35 + 0.25 * gl) * Lu;
        el('path', { d: arrowD(px, py, px + g[0] / gl * gs, py - g[1] / gl * gs), class: 'error', fill: 'none', 'stroke-width': 3, 'stroke-dasharray': '8 5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, L0);
        label(L0, px + g[0] / gl * (gs + 18), py - g[1] / gl * (gs + 18), '∇f', g[0] / gl, -g[1] / gl);
      }
      var tx = px + u[0] * Lu, ty = py - u[1] * Lu;
      el('path', { d: arrowD(px, py, tx, ty), class: 'trace', fill: 'none', 'stroke-width': 3.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, L0);
      // Arco del ángulo θ desde +x.
      var r = Math.min(30, Lu * 0.4);
      if (th > 0.05) el('path', { d: 'M' + (px + r).toFixed(1) + ' ' + py.toFixed(1) + 'A' + r + ' ' + r + ' 0 ' + (th > Math.PI ? 1 : 0) + ' 0 ' + (px + r * u[0]).toFixed(1) + ' ' + (py - r * u[1]).toFixed(1), class: 'axis', fill: 'none', 'stroke-width': 1.4 }, L0);
      label(L0, tx + u[0] * 18, ty - u[1] * 18, 'u', u[0], -u[1]);
      label(L0, px - u[0] * 20, py + u[1] * 20, 'P', -u[0], u[1]);
      var hp = el('g', { class: 'dd-handle', 'data-h': 'P' }, L0);
      el('circle', { cx: px, cy: py, r: 22, class: 'dd-hit' }, hp);
      el('circle', { cx: px, cy: py, r: 7, class: 'dot-ref' }, hp);
      var ht = el('g', { class: 'dd-handle', 'data-h': 'tip' }, L0);
      el('circle', { cx: tx, cy: ty, r: 22, class: 'dd-hit' }, ht);
      el('circle', { cx: tx, cy: ty, r: 8, class: 'dot-trace' }, ht);
    }
    function clipOf(svg) { var c = svg.querySelector('clipPath'); return c ? 'url(#' + c.id + ')' : null; }
    // Etiqueta con halo, corrida hacia (dx, dy) en pantalla para no pisar la flecha.
    function label(parent, x, y, s, dx, dy) {
      el('text', { x: x.toFixed(1), y: (y + 6 + 4 * (dy || 0)).toFixed(1), class: 'ann dd-lbl', 'text-anchor': dx > 0.35 ? 'start' : dx < -0.35 ? 'end' : 'middle', 'font-size': 19 }, parent, s);
    }

    function drawWave(g, ex, D) {
      var m = Math.max(ex.max, 0.5), cv = LM.curve(g);
      var p = window.LabPlot(wave, { x: [0, 360], y: [-1.3 * m, 1.3 * m] });
      p.clear();
      var L0 = layer(wave), X = p.X, Y = p.Y, W = 600, H = 260, d = '';
      [0, 90, 180, 270, 360].forEach(function (t) { d += 'M' + X(t).toFixed(1) + ' 14V' + (H - 30); });
      el('path', { d: d, class: 'plot-grid', fill: 'none' }, L0);
      el('path', { d: 'M' + X(0) + ' ' + Y(0).toFixed(1) + 'H' + X(360), class: 'axis', fill: 'none', 'stroke-width': 1.5 }, L0);
      [0, 90, 180, 270, 360].forEach(function (t) { el('text', { x: X(t), y: H - 8, class: 'lab-tick', 'text-anchor': t === 0 ? 'start' : t === 360 ? 'end' : 'middle' }, L0, t + '°'); });
      [m, -m].forEach(function (v) { el('text', { x: 40, y: (Y(v) + 4).toFixed(1), class: 'lab-tick', 'text-anchor': 'end' }, L0, f2(v)); });
      el('path', { d: 'M46 ' + Y(m).toFixed(1) + 'H' + (W - 14) + 'M46 ' + Y(-m).toFixed(1) + 'H' + (W - 14), class: 'plot-grid', fill: 'none', 'stroke-dasharray': '4 4' }, L0);
      p.curve(function (t) { return cv(t * RAD); }, 'ref', 3);
      var deg = th / RAD;
      el('path', { d: 'M' + X(deg).toFixed(1) + ' 14V' + (H - 30), class: 'aux', fill: 'none', 'stroke-width': 1.6, 'stroke-dasharray': '6 5' }, L0);
      p.point(ex.thMax / RAD, ex.max, 'dot-error', 6);
      ex.zeros.forEach(function (z) { p.point(z / RAD, 0, 'dot-aux', 5); });
      p.point(deg, D, 'dot-trace', 7);
    }

    function drawCut(a, b, u, D) {
      var T = 0.45 * Math.min(win[1] - win[0], win[3] - win[2]), s = LM.slice(F, [a, b], u), z0 = F(a, b), vals = [];
      for (var i = 0; i <= 120; i++) vals.push(s(-T + 2 * T * i / 120));
      vals.push(z0 + D * T, z0 - D * T);
      var yr = window.LabPlot.range(vals);
      var p = window.LabPlot(cut, { x: [-T, T], y: yr });
      p.clear(); p.grid(); p.axes();
      p.curve(s, 'aux', 3.4);
      var dd = T * 0.55;
      if (isFinite(D) && isFinite(z0)) p.curve(function (t) { return z0 + D * t; }, 'error', 2.6, null, -dd, dd);
      p.point(0, z0, 'dot-trace', 6);
    }

    /* ---------- Arrastre ---------- */
    var drag = null;
    function local(e) {
      var mtx = map.getScreenCTM();
      if (!mtx) return null;
      var q = map.createSVGPoint(); q.x = e.clientX; q.y = e.clientY;
      return q.matrixTransform(mtx.inverse());
    }
    map.addEventListener('pointerdown', function (e) {
      var g = e.target.closest ? e.target.closest('.dd-handle') : null;
      if (!g || !plotMap) return;
      drag = g.getAttribute('data-h');
      try { map.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
      document.documentElement.style.userSelect = 'none';
      e.preventDefault();
    });
    map.addEventListener('pointermove', function (e) {
      if (!drag || !plotMap) return;
      var q = local(e);
      if (!q) return;
      var p = plotMap, x = (q.x - p.X(0)) / (p.X(1) - p.X(0)), y = (q.y - p.Y(0)) / (p.Y(1) - p.Y(0));
      if (drag === 'P') {
        aS.set(Math.max(win[0], Math.min(win[1], Math.round(x * 10) / 10)));
        bS.set(Math.max(win[2], Math.min(win[3], Math.round(y * 10) / 10)));
      } else {
        var dx = x - aS.get(), dy = y - bS.get();
        if (Math.hypot(dx, dy) < 1e-6) return;
        var deg = Math.round(LM.wrap(Math.atan2(dy, dx)) / RAD) % 360;
        th = deg * RAD; thS.set(deg);
      }
      draw();
    });
    function end() { drag = null; document.documentElement.style.userSelect = ''; }
    map.addEventListener('pointerup', end);
    map.addEventListener('pointercancel', end);

    function prep(s) { return window.LabMath.core.prep(s); }
    document.addEventListener('cb:themechange', function () { draw(); });
    return UI.loadMath().then(function (m) { math = m; build(true); setTimeout(function () { build(true); }, 400); });
  };
})();
