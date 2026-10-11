/* =====================================================================
   Lab tangent-plane (Cálculo 2 · S05): plano tangente contra superficie,
   con el error en vivo. El alumno elige f(x, y), el punto (a, b) y los
   incrementos Δx, Δy; el lab dibuja la superficie, su plano tangente y los
   dos cortes por el punto, y lleva un tablero con Δz real, dz y el error
   |Δz − dz|. Reto: escribir dz, la aproximación L(a + Δx, b + Δy) o el
   error máximo; el lab detecta si usó Δz real, si olvidó un término, si
   intercambió f_x y f_y o si sumó los errores sin valor absoluto.
   En PC (pantalla ancha y mouse) la superficie se ve en 3D con manim-web;
   en móvil, o si WebGL falla, en proyección SVG. Los cortes, siempre.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  function prep(s) { return window.LabMath.core.prep(s); }
  // f(x, y) compilada; fuera de dominio → NaN.
  function fn2(math, src) { return window.LabMath.core.build(math, src, ['x', 'y']).fn; }
  function hstep(v) { return 1e-3 * Math.max(1, Math.abs(v)); }

  // Parcial numérica con diferencias centradas de cinco puntos (error O(h⁴)).
  function partial(f, a, b, wrt, h) {
    var t0 = wrt === 'y' ? b : a;
    var g = wrt === 'y' ? function (t) { return f(a, t); } : function (t) { return f(t, b); };
    h = h || hstep(t0);
    return (-g(t0 + 2 * h) + 8 * g(t0 + h) - 8 * g(t0 - h) + g(t0 - 2 * h)) / (12 * h);
  }
  // Plano tangente z = f0 + fx (x − a) + fy (y − b) = fx x + fy y + c; normal (fx, fy, −1).
  function plane(f0, fx, fy, a, b) {
    return {
      a: a, b: b, f0: f0, fx: fx, fy: fy, c: f0 - fx * a - fy * b, normal: [fx, fy, -1],
      at: function (x, y) { return f0 + fx * (x - a) + fy * (y - b); }
    };
  }
  function evalNode(node, pt) {
    try { var v = node.evaluate(Object.assign({}, pt)); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; }
  }
  // Valor y parcial simbólica (math.derivative) en un punto { x, y, r, h, … }.
  function value(math, src, pt) { return evalNode(math.parse(prep(src)), pt); }
  function deriv(math, src, wrt, pt) { return evalNode(math.derivative(prep(src), wrt), pt); }

  // Plano tangente con parciales simbólicas; si math.js no puede derivar, numéricas.
  function tangentPlane(math, src, a, b) {
    var pt = { x: a, y: b }, f0 = value(math, src, pt), fx = NaN, fy = NaN;
    try { fx = deriv(math, src, 'x', pt); fy = deriv(math, src, 'y', pt); } catch (e) { /* numérica abajo */ }
    if (!isFinite(fx) || !isFinite(fy)) { var f = fn2(math, src); fx = partial(f, a, b, 'x'); fy = partial(f, a, b, 'y'); }
    return plane(f0, fx, fy, a, b);
  }
  // Todo lo del tablero a partir del plano P y los incrementos.
  function linearFrom(f, P, dx, dy) {
    var dz = P.fx * dx + P.fy * dy, real = f(P.a + dx, P.b + dy), dzReal = real - P.f0, step = Math.hypot(dx, dy);
    var err = Math.abs(dzReal - dz);
    return {
      a: P.a, b: P.b, dx: dx, dy: dy, f0: P.f0, fx: P.fx, fy: P.fy, c: P.c,
      dz: dz, L: P.f0 + dz, real: real, dzReal: dzReal, err: err, step: step,
      ratio: step > 0 ? err / step : 0, max: maxError(P.fx, P.fy, dx, dy)
    };
  }
  function linear(math, src, a, b, dx, dy) { return linearFrom(fn2(math, src), tangentPlane(math, src, a, b), dx, dy); }
  function numericLinear(f, a, b, dx, dy) {
    return linearFrom(f, plane(f(a, b), partial(f, a, b, 'x'), partial(f, a, b, 'y'), a, b), dx, dy);
  }
  // Error máximo: los errores pueden tener cualquier signo, así que en el peor caso se suman.
  function maxError(fx, fy, dx, dy) { return Math.abs(fx) * Math.abs(dx) + Math.abs(fy) * Math.abs(dy); }

  // Propagación de error con cualquier número de variables: names = ['r', 'h'], pt = [5, 12],
  // d = [0.1, 0.2] (incertidumbres). abs = Σ |∂f/∂xᵢ| |dxᵢ|; rel = abs / |f|; pct = 100 rel.
  function propagate(math, src, names, pt, d) {
    var scope = {};
    names.forEach(function (k, i) { scope[k] = pt[i]; });
    var val = value(math, src, scope), grads = names.map(function (k) { return deriv(math, src, k, scope); });
    var parts = grads.map(function (g, i) { return Math.abs(g) * Math.abs(d[i]); });
    var abs = parts.reduce(function (s, x) { return s + x; }, 0);
    var signed = grads.reduce(function (s, g, i) { return s + g * d[i]; }, 0);
    return { value: val, grads: grads, parts: parts, abs: abs, signed: signed, rel: abs / Math.abs(val), pct: 100 * abs / Math.abs(val) };
  }

  // Cerca con la holgura de los ejercicios: ±0.01 (o ±1 %) desde 0.1; abajo, ±1 % o 0.0005.
  function near(s, t) {
    var d = Math.abs(s - t), at = Math.abs(t);
    if (at >= 0.1) return d <= Math.max(0.01, 0.01 * at) + 1e-9;
    return d <= Math.max(0.01 * at, 5e-4) + 1e-12;
  }
  // Lo que se pide en cada reto y los errores típicos, en orden de prioridad.
  function want(c, mode) { return mode === 'L' ? c.L : mode === 'max' ? c.max : c.dz; }
  function candidates(c, mode) {
    var sw = c.fx * c.dy + c.fy * c.dx, ox = c.fx * c.dx, oy = c.fy * c.dy;
    if (mode === 'L') return [['real', c.real], ['onlyDz', c.dz], ['swap', c.f0 + sw], ['missX', c.f0 + oy], ['missY', c.f0 + ox]];
    if (mode === 'max') return [['noAbs', c.fx * c.dx + c.fy * c.dy], ['noAbs', Math.abs(c.fx * c.dx + c.fy * c.dy)], ['real', Math.abs(c.dzReal)],
      ['swap', Math.abs(c.fx) * Math.abs(c.dy) + Math.abs(c.fy) * Math.abs(c.dx)], ['missX', Math.abs(oy)], ['missY', Math.abs(ox)]];
    return [['real', c.dzReal], ['withF0', c.L], ['swap', sw], ['missX', oy], ['missY', ox], ['sign', -c.dz]];
  }
  // Diagnóstico del número del alumno → { kind: ok|warn|bad|invalid, reason, want }.
  // reason: correct · real · onlyDz · withF0 · swap · missX · missY · noAbs · sign · mismatch
  function diagnose(s, c, mode) {
    var t = want(c, mode);
    if (!isFinite(s)) return { kind: 'invalid', reason: 'number', want: t };
    if (!isFinite(t)) return { kind: 'invalid', reason: 'domain', want: t };
    if (near(s, t)) return { kind: 'ok', reason: 'correct', want: t };
    var cs = candidates(c, mode);
    for (var i = 0; i < cs.length; i++) {
      var v = cs[i][1];
      if (isFinite(v) && !near(v, t) && near(s, v)) return { kind: 'warn', reason: cs[i][0], want: t };
    }
    return { kind: 'bad', reason: 'mismatch', want: t };
  }

  window.LabMath.tplane = {
    fn2: fn2, partial: partial, plane: plane, value: value, deriv: deriv, tangentPlane: tangentPlane,
    linearFrom: linearFrom, linear: linear, numericLinear: numericLinear, maxError: maxError,
    propagate: propagate, near: near, want: want, candidates: candidates, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { name: 'Paraboloide: x² + y²', f: 'x^2 + y^2', w: [-2, 2, -2, 2], a: 1, b: 0.5, dx: 0.4, dy: -0.3 },
    { name: 'Distancia: √(x² + y²)', f: 'sqrt(x^2 + y^2)', w: [0.5, 5.5, 0.5, 5.5], a: 3, b: 4, dx: 0.5, dy: -0.4 },
    { name: 'Área de un rectángulo: xy', f: 'x*y', w: [0, 5, 0, 5], a: 2, b: 3, dx: 0.6, dy: 0.5 },
    { name: 'Cilindro: V = πx²y (x = r, y = h)', f: 'pi*x^2*y', w: [0.5, 3.5, 0.5, 6.5], a: 2, b: 4, dx: 0.3, dy: 0.5 },
    { name: 'Producto: x²y', f: 'x^2*y', w: [-2, 3, -2, 3], a: 2, b: 1, dx: 0.4, dy: -0.3 },
    { name: 'Onda: sen x · cos y', f: 'sin(x)*cos(y)', w: [-3, 3, -3, 3], a: 1, b: 0.5, dx: 0.6, dy: 0.4 },
    { name: 'Campana: e^(−x² − y²)', f: 'e^(-x^2 - y^2)', w: [-2, 2, -2, 2], a: 0.5, b: -0.5, dx: 0.4, dy: 0.3 }
  ];
  var MODES = [['dz', 'Escribe dz = f_x Δx + f_y Δy'], ['L', 'Escribe L(a + Δx, b + Δy)'], ['max', 'Error máximo con Δx, Δy como ± (incertidumbres)']];
  var NS = 'http://www.w3.org/2000/svg';

  window.Labs['tangent-plane'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, LM = window.LabMath.tplane;
    var presets = cfg.presets || PRESETS, start = cfg.start != null ? cfg.start : 0;
    var math = null, F = null, FX = null, FY = null, src = '', P = presets[start], win = P.w, mode = 'dz', solved = false, student = null, lastErr = null;

    var preset = UI.select({ label: 'Ejemplo', options: presets.map(function (p) { return p.name; }) });
    var fIn = UI.mathField({ label: 'Superficie z = f(x, y)', hint: 'Escribe cualquier función de x y y; usa la paleta o el teclado ⌨.', palette: 'multi', onEnter: function () { build(); } });
    var run = UI.button('Graficar', 'primary', function () { build(); });
    var status = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var aS = UI.slider({ label: 'a (x del punto)', min: win[0], max: win[1], step: 0.1, value: P.a, fmt: fmtN }, function () { moved(); });
    var bS = UI.slider({ label: 'b (y del punto)', min: win[2], max: win[3], step: 0.1, value: P.b, fmt: fmtN }, function () { moved(); });
    var dxS = UI.slider({ label: 'Δx', min: -1, max: 1, step: 'any', value: P.dx, fmt: fmtD }, function (v) { snap(dxS, v); lastErr = null; moved(); });
    var dyS = UI.slider({ label: 'Δy', min: -1, max: 1, step: 'any', value: P.dy, fmt: fmtD }, function (v) { snap(dyS, v); lastErr = null; moved(); });
    var halfNote = h('p', { class: 'lab-note', 'aria-live': 'polite' });
    var half = UI.button('Partir Δx y Δy a la mitad', 'ghost', function () {
      var c = calc();
      lastErr = c ? c.err : null;
      dxS.set(dxS.get() / 2); dyS.set(dyS.get() / 2);
      moved(true);
    });
    var modeSel = UI.select({ label: 'Reto', options: MODES.map(function (m) { return m[1]; }) });
    var ans = UI.input({ label: 'Tu dz', type: 'text', inputmode: 'decimal', mono: false, hint: 'Redondea a 2 decimales; si sale menor que 0.1, usa 3 cifras significativas.' });
    var hideBox = h('input', { type: 'checkbox', id: UI.id('tp-hide') });
    var hideRow = h('label', { class: 'tp-check', for: hideBox.id }, [hideBox, ' Tapar dz, L y el error en el tablero (para el reto)']);
    var check = UI.button('Comprobar', 'primary', function () { verify(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var surf = UI.svg(640, 340, 'Superficie z = f(x, y) con su plano tangente en el punto y el error en el punto desplazado');
    var cutX = UI.svg(400, 260, 'Corte con y = b: la superficie y el plano tangente se ven como una curva y su recta tangente');
    var cutY = UI.svg(400, 260, 'Corte con x = a: la superficie y el plano tangente se ven como una curva y su recta tangente');
    var capX = h('p', { class: 'lab-stack__label' }), capY = h('p', { class: 'lab-stack__label' });
    var board = h('dl', { class: 'lab-facts tp-board' });
    var want3D = !!(window.matchMedia && window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches);
    var stage3d = h('div', { class: 'lab-stage lab-stage--manim lab-stage--3d', hidden: true, role: 'img', 'aria-label': 'Superficie en 3D con su plano tangente; arrastra para girarla' });
    var note3d = h('p', { class: 'lab-note', hidden: true }, ['Arrastra para girar la superficie; la rueda del mouse acerca y aleja.']);
    var btn3d = UI.button('Vista 3D', 'ghost', function () { setView('3d'); });
    var btn2d = UI.button('Vista plana', 'ghost', function () { setView('2d'); });
    var viewBar = h('div', { class: 'lab-buttons lab-viewbar', hidden: !want3D, role: 'group', 'aria-label': 'Tipo de vista' }, [btn3d, btn2d]);
    var M3 = null, scene3 = null, view = '2d', pending3 = false;

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        preset.node, fIn.node, h('div', { class: 'lab-buttons' }, [run]), status,
        aS.node, bS.node, dxS.node, dyS.node, h('div', { class: 'lab-buttons' }, [half]), halfNote,
        modeSel.node, ans.node, hideRow, h('div', { class: 'lab-buttons' }, [check]), verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Plano tangente contra superficie']),
        viewBar, surf, stage3d, note3d,
        h('div', { class: 'tp-cuts' }, [h('div', {}, [capX, cutX]), h('div', {}, [capY, cutY])]),
        h('p', { class: 'lab-stack__label' }, ['Tablero en vivo']),
        board,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'superficie']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'plano tangente']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'error |Δz − dz|']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu respuesta'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); build(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); build(); });
    modeSel.input.addEventListener('change', function () { mode = MODES[+modeSel.input.value][0]; relabel(); reset(); draw(); });
    hideBox.addEventListener('change', function () { draw(); });
    ans.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); verify(); } });

    function fmtN(v) { return (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(2)).toString().replace('-', '−'); }
    function fmtD(v) { return (Math.abs(v) < 1e-12 ? 0 : +v.toFixed(4)).toString().replace('-', '−'); }
    function num(v, d) { return UI.fmt(v, d || 5).replace('-', '−'); }
    // Al arrastrar, Δ se queda en centésimas; el botón de la mitad sí deja valores más finos.
    function snap(sl, v) { sl.set(Math.round(v * 100) / 100); }
    function relabel() {
      ans.node.querySelector('label').textContent = mode === 'L' ? 'Tu L(a + Δx, b + Δy)' : mode === 'max' ? 'Tu error máximo' : 'Tu dz';
    }
    function setRange(sl, lo, hi, v) { sl.input.min = lo; sl.input.max = hi; sl.set(Math.max(lo, Math.min(hi, v))); }
    function load(i) {
      P = presets[i]; win = P.w;
      fIn.setMath(P.f);
      setRange(aS, win[0], win[1], P.a); setRange(bS, win[2], win[3], P.b);
      var D = Math.max(0.5, Math.round(0.25 * Math.max(win[1] - win[0], win[3] - win[2]) * 2) / 2);
      setRange(dxS, -D, D, P.dx); setRange(dyS, -D, D, P.dy);
      ans.input.value = ''; lastErr = null;
      reset();
    }
    function reset() { verdict.hidden = true; solved = false; student = null; }
    function moved(halved) {
      reset();
      draw();
      var c = calc();
      if (halved && lastErr != null && c && c.err > 1e-12) halfNote.textContent = 'Antes el error era ' + num(lastErr, 4) + '; ahora es ' + num(c.err, 4) + ': bajó ' + num(lastErr / c.err, 3) + ' veces. Δ bajó 2 veces; el error, cerca de 4.';
      else if (!halved) halfNote.textContent = '';
    }
    preset.input.value = String(start);
    load(start);
    if (cfg.a != null) aS.set(cfg.a);
    if (cfg.b != null) bS.set(cfg.b);
    relabel();

    function build() {
      if (!math) return;
      try {
        var s = String(fIn.get() || '').trim();
        if (!s) throw new Error('Escribe f(x, y).');
        var fn = LM.fn2(math, s), okPts = 0;
        for (var i = 0; i <= 10; i++) for (var j = 0; j <= 10; j++) if (isFinite(fn(win[0] + (win[1] - win[0]) * i / 10, win[2] + (win[3] - win[2]) * j / 10))) okPts++;
        if (okPts < 20) throw new Error('La función casi no está definida en la ventana de este ejemplo.');
        F = fn; src = s; FX = FY = null;
        try {
          FX = math.derivative(prep(s), 'x').compile();
          FY = math.derivative(prep(s), 'y').compile();
        } catch (e) { FX = FY = null; }
        status.hidden = true;
      } catch (e) { UI.verdict(status, 'bad', 'No pude graficar', e.message); return; }
      reset();
      draw();
    }
    function pd(node, a, b) { if (!node) return NaN; try { var v = node.evaluate({ x: a, y: b }); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; } }
    // Plano y tablero en el estado actual (parciales simbólicas; numéricas si no se pudo derivar).
    function calc() {
      if (!F) return null;
      var a = aS.get(), b = bS.get(), fx = pd(FX, a, b), fy = pd(FY, a, b);
      if (!isFinite(fx)) fx = LM.partial(F, a, b, 'x');
      if (!isFinite(fy)) fy = LM.partial(F, a, b, 'y');
      return LM.linearFrom(F, LM.plane(F(a, b), fx, fy, a, b), dxS.get(), dyS.get());
    }

    function verify() {
      var c = calc();
      if (!c || !math) return;
      var raw = String(ans.input.value || '');
      var s = window.CBExercises ? window.CBExercises.parseNumber(raw, math) : parseFloat(raw.replace(',', '.').replace('−', '-'));
      if (!isFinite(s)) { UI.verdict(verdict, 'bad', 'Escribe un número', 'Usa punto decimal; por ejemplo −0.25.'); return; }
      var r = LM.diagnose(s, c, mode);
      if (r.reason === 'domain') { UI.verdict(verdict, 'bad', 'La función no está definida ahí', 'Mueve el punto o los incrementos.'); return; }
      student = s;
      var what = mode === 'L' ? 'L(a + Δx, b + Δy)' : mode === 'max' ? 'el error máximo' : 'dz';
      var msgs = {
        correct: ['Tu ' + (mode === 'L' ? 'aproximación' : mode === 'max' ? 'error máximo' : 'dz') + ' es correct' + (mode === 'L' ? 'a' : 'o'),
          mode === 'max' ? 'En el peor caso los dos errores empujan hacia el mismo lado: ' + num(Math.abs(c.fx), 4) + '·' + num(Math.abs(c.dx), 4) + ' + ' + num(Math.abs(c.fy), 4) + '·' + num(Math.abs(c.dy), 4) + ' = ' + num(c.max, 4) + '.'
            : 'El plano predice ' + num(mode === 'L' ? c.L : c.dz, 5) + ' y la superficie da ' + num(mode === 'L' ? c.real : c.dzReal, 5) + '. La diferencia, ' + num(c.err, 3) + ', es el precio de cambiar la curva por el plano.'],
        real: ['Calculaste el cambio real, no el del plano', mode === 'max' ? 'El error máximo se estima con las parciales: |f_x||Δx| + |f_y||Δy|, no evaluando f.' : 'Evaluaste f en el punto nuevo. ' + what + ' sale del plano tangente: f_x Δx + f_y Δy, sin volver a evaluar f.'],
        onlyDz: ['Te faltó f(a, b)', 'L = f(a, b) + dz: el plano arranca a la altura del punto. Lo tuyo es solo el cambio dz.'],
        withF0: ['Eso es L, no dz', 'dz es solo el cambio: f_x Δx + f_y Δy. No le sumes f(a, b).'],
        swap: ['Intercambiaste f_x y f_y', 'f_x va con Δx (lo que te mueves en x) y f_y con Δy.'],
        missX: ['Te faltó el término de x', 'Al moverte también en x la altura cambia f_x Δx. Súmalo.'],
        missY: ['Te faltó el término de y', 'Al moverte también en y la altura cambia f_y Δy. Súmalo.'],
        noAbs: ['Sumaste los errores sin valor absoluto', 'Un error de ± puede ir en cualquier sentido. En el peor caso todos se suman: |f_x||Δx| + |f_y||Δy|.'],
        sign: ['Casi: tu signo está invertido', 'Revisa el signo de f_x, f_y y de los incrementos (Δ negativo = te mueves hacia atrás).'],
        mismatch: ['No coincide', 'Calcula f_x y f_y en (a, b), multiplícalas por Δx y Δy y suma.' + (mode === 'L' ? ' Luego súmale f(a, b).' : mode === 'max' ? ' Con valores absolutos.' : '')]
      };
      var m = msgs[r.reason] || msgs.mismatch;
      UI.verdict(verdict, r.kind === 'ok' ? 'ok' : r.kind === 'warn' ? 'warn' : 'bad', m[0], m[1]);
      solved = r.kind === 'ok';
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
    function pct(vals, lo, hi) {
      var zs = vals.filter(function (v) { return isFinite(v); }).sort(function (p, q) { return p - q; });
      if (!zs.length) return [-1, 1];
      return [zs[Math.floor(zs.length * lo)], zs[Math.max(0, Math.ceil(zs.length * hi) - 1)]];
    }
    // Rango de z de la superficie (percentiles 2–98), ampliado para que quepan los puntos clave.
    function zRange(c) {
      var zs = [];
      for (var i = 0; i <= 30; i++) for (var j = 0; j <= 30; j++) zs.push(F(win[0] + (win[1] - win[0]) * i / 30, win[2] + (win[3] - win[2]) * j / 30));
      var r = pct(zs, 0.02, 0.98), lo = r[0], hi = r[1];
      [c.f0, c.real, c.L].concat(student != null ? [mode === 'L' ? student : mode === 'dz' ? c.f0 + student : NaN] : []).forEach(function (z) {
        if (isFinite(z)) { lo = Math.min(lo, z); hi = Math.max(hi, z); }
      });
      if (hi - lo < 1e-6) { lo -= 1; hi += 1; }
      return [lo, hi];
    }

    function draw() {
      var c = calc();
      if (!c) return;
      drawSurface(c);
      drawCut(cutX, 'x', c);
      drawCut(cutY, 'y', c);
      if (view === '3d') schedule3D();
      capX.textContent = 'Corte y = ' + fmtN(c.b) + ' · recta de pendiente f_x = ' + num(c.fx, 4);
      capY.textContent = 'Corte x = ' + fmtN(c.a) + ' · recta de pendiente f_y = ' + num(c.fy, 4);
      var hide = hideBox.checked && !solved, q = '¿?';
      var rows = [
        ['f(a, b)', num(c.f0)],
        ['f_x(a, b) · f_y(a, b)', num(c.fx, 5) + ' · ' + num(c.fy, 5)],
        ['plano tangente', hide ? q : 'z = ' + num(c.f0, 4) + ' + ' + num(c.fx, 4) + '(x − ' + fmtN(c.a) + ') + ' + num(c.fy, 4) + '(y − ' + fmtN(c.b) + ')'],
        ['Δz real = f(a + Δx, b + Δy) − f(a, b)', num(c.dzReal)],
        ['dz = f_x Δx + f_y Δy', hide ? q : num(c.dz)],
        ['L(a + Δx, b + Δy)', hide ? q : num(c.L)],
        ['error |Δz − dz|', hide ? q : num(c.err, 4)],
        ['error ÷ |Δ|  (|Δ| = ' + num(c.step, 4) + ')', hide ? q : num(c.ratio, 4)]
      ];
      if (mode === 'max') rows.push(['error máximo |f_x||Δx| + |f_y||Δy|', hide ? q : num(c.max)]);
      board.innerHTML = '';
      rows.forEach(function (r) { board.appendChild(h('dt', {}, [r[0]])); board.appendChild(h('dd', {}, [r[1].replace(/\+ −/g, '− ')])); });
    }

    // Un corte por el punto: la superficie es una curva y el plano tangente, su recta tangente.
    // En t = a + Δx (o b + Δy) se marca el hueco entre la curva y la recta.
    function drawCut(svgEl, dir, c) {
      var t0 = dir === 'x' ? win[0] : win[2], t1 = dir === 'x' ? win[1] : win[3], tc = dir === 'x' ? c.a : c.b;
      var m = dir === 'x' ? c.fx : c.fy, d = dir === 'x' ? c.dx : c.dy;
      var tr = dir === 'x' ? function (t) { return F(t, c.b); } : function (t) { return F(c.a, t); };
      var ln = function (t) { return c.f0 + m * (t - tc); };
      var vals = [], i;
      for (i = 0; i <= 120; i++) vals.push(tr(t0 + (t1 - t0) * i / 120));
      var span = (t1 - t0) * 0.3, r = pct(vals, 0.02, 0.98), lo = r[0], hi = r[1];
      [c.f0, ln(tc + d), tr(tc + d)].forEach(function (z) { if (isFinite(z)) { lo = Math.min(lo, z); hi = Math.max(hi, z); } });
      if (hi - lo < 1e-6) { lo -= 1; hi += 1; }
      var pad = (hi - lo) * 0.12;
      var p = window.LabPlot(svgEl, { x: [t0, t1], y: [lo - pad, hi + pad] });
      p.clear(); p.grid(); p.axes();
      p.curve(tr, 'ref', 3);
      if (isFinite(m)) p.curve(ln, 'aux', 2.6, null, Math.max(t0, tc - span), Math.min(t1, tc + span));
      var tq = tc + d, zs = tr(tq), zl = ln(tq);
      if (Math.abs(d) > 1e-9 && tq >= t0 && tq <= t1 && isFinite(zs) && isFinite(zl)) {
        p.segments([[[tq, zs], [tq, zl]]], 'error', 3);
        p.point(tq, zs, 'dot-ref', 4.5);
        p.point(tq, zl, 'dot-aux', 4.5);
      }
      p.point(tc, c.f0, 'dot-trace', 6);
    }

    // Proyección SVG de la superficie con el plano tangente (móvil, o PC con "Vista plana").
    function drawSurface(c) {
      var zr = zRange(c), zs = zr[1] - zr[0], zlo = zr[0] - 0.08 * zs, zhi = zr[1] + 0.08 * zs;
      var cx = (win[0] + win[1]) / 2, cy = (win[2] + win[3]) / 2, s = 2 / Math.max(win[1] - win[0], win[3] - win[2]), kz = 1.3 / (zhi - zlo);
      var az = -35 * Math.PI / 180, elv = 24 * Math.PI / 180, ca = Math.cos(az), sa = Math.sin(az), ce = Math.cos(elv), se = Math.sin(elv);
      function raw(x, y, z) {
        var X = (x - cx) * s, Y = (y - cy) * s, Z = (z - (zlo + zhi) / 2) * kz;
        var u = X * ca - Y * sa, v = X * sa + Y * ca;
        return [v, -(Z * ce - u * se)];
      }
      var box = [], W = 640, H = 340, mg = 30;
      [win[0], win[1]].forEach(function (x) { [win[2], win[3]].forEach(function (y) { [zlo, zhi].forEach(function (z) { box.push(raw(x, y, z)); }); }); });
      var x0 = Math.min.apply(null, box.map(function (q) { return q[0]; })), x1 = Math.max.apply(null, box.map(function (q) { return q[0]; }));
      var y0 = Math.min.apply(null, box.map(function (q) { return q[1]; })), y1 = Math.max.apply(null, box.map(function (q) { return q[1]; }));
      var k = Math.min((W - 2 * mg) / (x1 - x0), (H - 2 * mg) / (y1 - y0)), ox = (W - k * (x1 - x0)) / 2, oy = (H - k * (y1 - y0)) / 2;
      function Pt(x, y, z) { var q = raw(x, y, z); return [ox + (q[0] - x0) * k, oy + (q[1] - y0) * k]; }
      function inZ(z) { return isFinite(z) && z >= zlo && z <= zhi; }
      function path(pts) {
        var d = '', pen = false;
        pts.forEach(function (q) {
          if (!q) { pen = false; return; }
          d += (pen ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); pen = true;
        });
        return d;
      }
      surf.innerHTML = '';
      var g = el('g', { class: 'sketch' }, surf), i, j, t, n = 12, N = 48;
      var floor = [[win[0], win[2]], [win[1], win[2]], [win[1], win[3]], [win[0], win[3]], [win[0], win[2]]].map(function (q) { return Pt(q[0], q[1], zlo); });
      el('path', { d: path(floor), class: 'plot-grid', fill: 'none' }, g);
      var dW = '';
      for (i = 0; i <= n; i++) {
        var xs = win[0] + (win[1] - win[0]) * i / n, ys = win[2] + (win[3] - win[2]) * i / n, l1 = [], l2 = [];
        for (j = 0; j <= N; j++) {
          t = j / N;
          var y1v = win[2] + (win[3] - win[2]) * t, z1 = F(xs, y1v); l1.push(inZ(z1) ? Pt(xs, y1v, z1) : null);
          var x2v = win[0] + (win[1] - win[0]) * t, z2 = F(x2v, ys); l2.push(inZ(z2) ? Pt(x2v, ys, z2) : null);
        }
        dW += path(l1) + path(l2);
      }
      el('path', { d: dW, class: 'ref', fill: 'none', 'stroke-width': 1.1, 'stroke-opacity': 0.5 }, g);
      // Parche del plano tangente: un cuadrado alrededor del punto que se achica si se sale de la caja.
      var pl = planePatch(c, zlo, zhi);
      if (pl) {
        var plP = pl.map(function (q) { return Pt(q[0], q[1], q[2]); });
        el('path', { d: path(plP) + 'Z', class: 'area-fill area-fill--aux' }, g);
        el('path', { d: path(plP) + 'Z', class: 'aux', fill: 'none', 'stroke-width': 1.6 }, g);
      }
      // El punto desplazado: sombra en el piso, el hueco entre plano y superficie y los dos puntos.
      var qx = c.a + c.dx, qy = c.b + c.dy, pf = Pt(qx, qy, zlo);
      if (inZ(c.real) && inZ(c.L)) {
        var top = Math.max(c.real, c.L), pt = Pt(qx, qy, top);
        el('path', { d: 'M' + pf[0].toFixed(1) + ' ' + pf[1].toFixed(1) + 'L' + pt[0].toFixed(1) + ' ' + pt[1].toFixed(1), class: 'axis', fill: 'none', 'stroke-width': 1.2, 'stroke-dasharray': '4 4' }, g);
        var pr = Pt(qx, qy, c.real), pL = Pt(qx, qy, c.L);
        el('path', { d: 'M' + pr[0].toFixed(1) + ' ' + pr[1].toFixed(1) + 'L' + pL[0].toFixed(1) + ' ' + pL[1].toFixed(1), class: 'error', fill: 'none', 'stroke-width': 3.2, 'stroke-linecap': 'round' }, g);
        el('circle', { cx: pr[0], cy: pr[1], r: 4.5, class: 'dot-ref' }, g);
        el('circle', { cx: pL[0], cy: pL[1], r: 4.5, class: 'dot-aux' }, g);
      }
      el('circle', { cx: pf[0], cy: pf[1], r: 3, class: 'dot-ref' }, g);
      var sz = student == null ? NaN : mode === 'L' ? student : mode === 'dz' ? c.f0 + student : NaN;
      if (inZ(sz)) { var ps = Pt(qx, qy, sz); el('circle', { cx: ps[0], cy: ps[1], r: 5, class: 'dot-student' }, g); }
      if (inZ(c.f0)) { var p0 = Pt(c.a, c.b, c.f0); el('circle', { cx: p0[0], cy: p0[1], r: 6, class: 'dot-trace' }, g); }
      // Ejes desde la esquina del piso, con su letra más allá de la punta.
      var o0 = Pt(win[0], win[2], zlo), ex = Pt(win[1] + 0.22 * (win[1] - win[0]), win[2], zlo), ey = Pt(win[0], win[3] + 0.22 * (win[3] - win[2]), zlo);
      [[ex, 'x'], [ey, 'y']].forEach(function (e) {
        el('path', { d: 'M' + o0[0].toFixed(1) + ' ' + o0[1].toFixed(1) + 'L' + e[0][0].toFixed(1) + ' ' + e[0][1].toFixed(1), class: 'axis', fill: 'none', 'stroke-width': 1.4 }, g);
        var dx = e[0][0] - o0[0], dy = e[0][1] - o0[1], L = Math.hypot(dx, dy) || 1;
        el('text', { x: (e[0][0] + dx / L * 12).toFixed(1), y: (e[0][1] + dy / L * 12 + 5).toFixed(1), class: 'lab-tick', 'text-anchor': 'middle' }, g, e[1]);
      });
    }
    // Esquinas del parche del plano tangente (o null si ni chico cabe en [zlo, zhi]).
    function planePatch(c, zlo, zhi) {
      var r = 0.3 * Math.max(win[1] - win[0], win[3] - win[2]);
      r = Math.max(r, 1.15 * Math.max(Math.abs(c.dx), Math.abs(c.dy)));
      for (var k = 0; k < 8; k++) {
        var cs = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (sg) {
          var x = Math.max(win[0], Math.min(win[1], c.a + sg[0] * r)), y = Math.max(win[2], Math.min(win[3], c.b + sg[1] * r));
          return [x, y, c.f0 + c.fx * (x - c.a) + c.fy * (y - c.b)];
        });
        if (cs.every(function (q) { return isFinite(q[2]) && q[2] >= zlo && q[2] <= zhi; })) return cs;
        r *= 0.7;
      }
      return null;
    }

    /* ---------- Vista 3D (solo PC) ---------- */
    function setView(v) {
      view = v === '3d' && scene3 ? '3d' : '2d';
      surf.style.display = view === '2d' ? '' : 'none';
      stage3d.hidden = note3d.hidden = view !== '3d';
      btn3d.setAttribute('aria-pressed', String(view === '3d'));
      btn2d.setAttribute('aria-pressed', String(view === '2d'));
      if (view === '3d') schedule3D();
    }
    function schedule3D() {
      if (pending3) return;
      pending3 = true;
      requestAnimationFrame(function () { pending3 = false; try { draw3D(); } catch (e) { console.error(e); setView('2d'); } });
    }
    function draw3D() {
      var c = calc();
      if (!scene3 || !c) return;
      var zr = zRange(c), zs = zr[1] - zr[0], zlo = zr[0] - 0.08 * zs, zhi = zr[1] + 0.08 * zs;
      var cx = (win[0] + win[1]) / 2, cy = (win[2] + win[3]) / 2, s = 8 / Math.max(win[1] - win[0], win[3] - win[2]), kz = 5 / (zhi - zlo), zc = (zlo + zhi) / 2;
      function cl(z) { return isFinite(z) ? Math.max(zlo, Math.min(zhi, z)) : zc; }
      function P3(x, y, z) { return [(x - cx) * s, (y - cy) * s, (cl(z) - zc) * kz]; }
      var C = { ref: UI.color('--plot-ref'), aux: UI.color('--plot-aux'), err: UI.color('--plot-error'), tr: UI.color('--plot-trace'), st: UI.color('--plot-student') };
      var objs = [], TAU = 2 * Math.PI;
      function add(func, u, v, res, color, opacity) {
        objs.push(new M3.Surface3D({ func: func, uRange: u, vRange: v, uResolution: res[0], vResolution: res[1], color: color, opacity: opacity, doubleSided: true }));
      }
      function ball(x, y, z, r, color) {
        var p = P3(x, y, z);
        add(function (u, v) { return [p[0] + r * Math.sin(u) * Math.cos(v), p[1] + r * Math.sin(u) * Math.sin(v), p[2] + r * Math.cos(u)]; }, [0, Math.PI], [0, TAU], [10, 14], color, 1);
      }
      add(function (u, v) { return P3(u, v, F(u, v)); }, [win[0], win[1]], [win[2], win[3]], [36, 36], C.ref, 0.45);
      var pl = planePatch(c, zlo, zhi);
      if (pl) add(function (u, v) { var x = pl[0][0] + (pl[1][0] - pl[0][0]) * u, y = pl[0][1] + (pl[2][1] - pl[0][1]) * v; return P3(x, y, c.f0 + c.fx * (x - c.a) + c.fy * (y - c.b)); }, [0, 1], [0, 1], [2, 2], C.aux, 0.55);
      var qx = c.a + c.dx, qy = c.b + c.dy, A = P3(qx, qy, c.real), B = P3(qx, qy, c.L), w = 0.05;
      if (Math.abs(A[2] - B[2]) > 1e-3) add(function (u, v) { return [A[0] + w * Math.cos(v), A[1] + w * Math.sin(v), A[2] + (B[2] - A[2]) * u]; }, [0, 1], [0, TAU], [2, 8], C.err, 1);
      ball(c.a, c.b, c.f0, 0.16, C.tr);
      ball(qx, qy, c.real, 0.11, C.ref);
      ball(qx, qy, c.L, 0.11, C.aux);
      var sz = student == null ? NaN : mode === 'L' ? student : mode === 'dz' ? c.f0 + student : NaN;
      if (isFinite(sz)) ball(qx, qy, sz, 0.12, C.st);
      scene3.clear();
      scene3.add.apply(scene3, objs);
      if (typeof scene3.render === 'function') scene3.render();
    }
    function init3D() {
      if (!want3D) return;
      UI.loadManim().then(function (mod) {
        M3 = mod;
        stage3d.hidden = false;
        var wd = stage3d.clientWidth || 640;
        scene3 = new M3.ThreeDScene(stage3d, { width: wd, height: Math.round(wd * 2 / 3), backgroundOpacity: 0, phi: 65 * Math.PI / 180, theta: -60 * Math.PI / 180, enableOrbitControls: true });
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
