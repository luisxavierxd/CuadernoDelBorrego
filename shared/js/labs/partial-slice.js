/* =====================================================================
   Lab partial-slice (Cálculo 2 · S04): cortar la superficie z = f(x, y)
   con el plano y = b (o x = a) deja una curva, la traza; su pendiente en el
   punto es la derivada parcial. El alumno escribe ∂f/∂x (o ∂f/∂y) como
   expresión, o su valor en (a, b), y el lab le dice si derivó respecto a la
   otra variable, si trató a la otra variable como función (producto de más)
   o si olvidó la derivada de adentro.
   En PC (pantalla ancha y mouse) la superficie se ve en 3D con manim-web;
   en móvil, o si WebGL falla, en proyección SVG. La traza en 2D siempre.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  var OTHER = { x: 'y', y: 'x' };
  function prep(s) { return window.LabMath.core.prep(s); }
  // f(x, y) compilada; fuera de dominio → NaN.
  function fn2(math, src) { return window.LabMath.core.build(math, src, ['x', 'y']).fn; }
  function step(v) { return 1e-4 * Math.max(1, Math.abs(v)); }

  // Parcial numérica por diferencias centradas: (f(a + h, b) − f(a − h, b)) / 2h.
  function central(f, a, b, wrt, h) {
    if (wrt === 'y') { h = h || step(b); return (f(a, b + h) - f(a, b - h)) / (2 * h); }
    h = h || step(a);
    return (f(a + h, b) - f(a - h, b)) / (2 * h);
  }
  // Segundas parciales numéricas. 'xx' y 'yy' con tres puntos; 'xy' = (f_x)_y y 'yx' = (f_y)_x
  // con diferencias centradas anidadas (primero la de adentro) y pasos distintos, así que
  // f_xy y f_yx salen de cuentas diferentes (sirve para comprobar Clairaut).
  function second(f, a, b, order, h) {
    h = h || 1e-3 * Math.max(1, Math.abs(a), Math.abs(b));
    if (order === 'xx') return (f(a + h, b) - 2 * f(a, b) + f(a - h, b)) / (h * h);
    if (order === 'yy') return (f(a, b + h) - 2 * f(a, b) + f(a, b - h)) / (h * h);
    var first = order.charAt(0), then = order.charAt(1), h1 = h, h2 = 1.3 * h;
    var g = function (x, y) { return central(f, x, y, first, h1); };
    return central(g, a, b, then, h2);
  }
  // La traza: z = f(t, b) si se corta con y = b (∂/∂x); z = f(a, t) si se corta con x = a (∂/∂y).
  function trace(f, a, b, wrt) {
    return wrt === 'y' ? function (t) { return f(a, t); } : function (t) { return f(t, b); };
  }
  // Recta tangente a la traza en el punto: z = z0 + m (t − t0).
  function tangent(f, a, b, wrt) {
    var t0 = wrt === 'y' ? b : a, z0 = f(a, b), m = central(f, a, b, wrt);
    return { t0: t0, z0: z0, m: m, at: function (t) { return z0 + m * (t - t0); } };
  }

  // Derivadas simbólicas con math.js (math se inyecta).
  function symbolic(math, src, wrt) { return math.derivative(prep(src), wrt).toString(); }
  function evalAt(node, pt) {
    try { var v = node.evaluate(Object.assign({}, pt)); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; }
  }
  // ∂f/∂wrt evaluada en pt = { x, y, z, … } (cualquier nombre de variable).
  function at(math, src, pt, wrt) { return evalAt(math.derivative(prep(src), wrt), pt); }
  // Segunda parcial: order 'xy' = derivar primero respecto a x y luego respecto a y.
  function secondAt(math, src, pt, order) {
    var d = math.parse(prep(src));
    for (var i = 0; i < order.length; i++) d = math.derivative(d, order.charAt(i));
    return evalAt(d, pt);
  }
  function value(math, src, pt) { return evalAt(math.parse(prep(src)), pt); }
  // Todas las primeras parciales en pt: { x: f_x, y: f_y, … } (una por cada variable de pt).
  function partials(math, src, pt) {
    var out = {};
    Object.keys(pt).forEach(function (k) { out[k] = at(math, src, pt, k); });
    return out;
  }
  // Las dos mixtas en pt: { xy: (f_x)_y, yx: (f_y)_x }.
  function mixed(math, src, pt) { return { xy: secondAt(math, src, pt, 'xy'), yx: secondAt(math, src, pt, 'yx') }; }

  // Derivada "sin la de adentro": cada función compuesta g(u) cuyo argumento u depende de
  // wrt (y no es solo wrt) se cambia por g(wrt + K), se deriva y se regresa K = u − wrt.
  // Como d(wrt + K)/d(wrt) = 1, el factor de la cadena desaparece. null si no hay cadena.
  function noChain(math, src, wrt) {
    var node = math.parse(prep(src)), subs = {}, k = 0;
    function dep(n) { var d = false; n.traverse(function (c) { if (c.isSymbolNode && c.name === wrt) d = true; }); return d; }
    function freeze(u) {
      var name = 'kzq' + (k++);
      subs[name] = new math.OperatorNode('-', 'subtract', [u, new math.SymbolNode(wrt)]);
      return new math.ParenthesisNode(new math.OperatorNode('+', 'add', [new math.SymbolNode(wrt), new math.SymbolNode(name)]));
    }
    function inner(u) { return dep(u) && !(u.isSymbolNode) && !(u.isParenthesisNode && u.content.isSymbolNode); }
    var t = node.transform(function (n) {
      if (n.isFunctionNode && n.args.length === 1 && inner(n.args[0])) return new math.FunctionNode(n.fn, [freeze(n.args[0])]);
      if (n.isOperatorNode && n.op === '^') {
        var base = n.args[0], ex = n.args[1];
        if (inner(base) && !dep(ex)) return new math.OperatorNode('^', 'pow', [freeze(base), ex]);
        if (!dep(base) && inner(ex)) return new math.OperatorNode('^', 'pow', [base, freeze(ex)]);
      }
      return n;
    });
    if (!k) return null;
    var d = math.derivative(t, wrt).transform(function (n) {
      return n.isSymbolNode && subs[n.name] ? new math.ParenthesisNode(subs[n.name]) : n;
    });
    return d.toString();
  }

  // Los errores típicos como expresiones en x y y.
  function mistakes(math, src, wrt) {
    var fw = symbolic(math, src, wrt), fo = symbolic(math, src, OTHER[wrt]);
    return {
      other: fo,                                     // derivó respecto a la otra variable
      product: '(' + fw + ') + (' + fo + ')',        // trató a la otra como función: le salió su derivada (con ′ = 1)
      chain: noChain(math, src, wrt)                 // olvidó la derivada de adentro
    };
  }

  // Compara dos expresiones en x y y sobre una malla alrededor de (a, b). mask(x, y): solo
  // cuentan los puntos donde f está definida (la derivada puede existir donde f no).
  function compareAround(math, ref, input, a, b, r, mask) {
    var C = window.LabMath.core, R = C.build(math, ref, ['x', 'y']).fn, S = C.build(math, input, ['x', 'y']).fn, pairs = [];
    r = r || 0.6;
    for (var i = 0; i < 9; i++) for (var j = 0; j < 9; j++) {
      var x = a + r * (i / 4 - 1) + 0.0137, y = b + r * (j / 4 - 1) - 0.0093;
      pairs.push(mask && !isFinite(mask(x, y)) ? [NaN, NaN] : [R(x, y), S(x, y)]);
    }
    return C.compareValues(pairs, 12);
  }
  function same(math, e1, e2, a, b, mask) {
    try { return compareAround(math, e1, e2, a, b, 0.6, mask).reason === 'correct'; } catch (e) { return false; }
  }

  // Diagnóstico de la parcial escrita por el alumno → { kind, reason, k?, want }.
  // reason: correct · other · product · chain · sign · factor · mismatch · domain
  function diagnose(math, src, wrt, input, a, b) {
    var f = fn2(math, src), want = symbolic(math, src, wrt), r = compareAround(math, want, input, a, b, 0.6, f);
    if (r.reason === 'correct') return { kind: 'ok', reason: 'correct', want: want };
    if (r.reason === 'domain') return { kind: 'invalid', reason: 'domain', want: want };
    var M = mistakes(math, src, wrt), keys = ['other', 'product', 'chain'];
    for (var i = 0; i < keys.length; i++) {
      var m = M[keys[i]];
      if (m && !same(math, want, m, a, b, f) && same(math, m, input, a, b, f)) return { kind: 'warn', reason: keys[i], want: want };
    }
    if (r.reason === 'sign' || r.reason === 'factor') return { kind: 'warn', reason: r.reason, k: r.k, want: want };
    return { kind: 'bad', reason: 'mismatch', want: want };
  }

  // Cerca con la holgura de los ejercicios: ±0.01 o ±1 %.
  function near(s, t) { return Math.abs(s - t) <= 0.01 * Math.max(1, Math.abs(t)) + 1e-9; }
  // Diagnóstico del valor numérico en (a, b). reason: correct · other · product · chain · value · sign · mismatch
  function diagnoseValue(math, src, wrt, s, a, b) {
    var f = fn2(math, src), num = central(f, a, b, wrt), pt = { x: a, y: b };
    var t = at(math, src, pt, wrt);
    if (!isFinite(t)) t = num;
    if (!isFinite(t)) return { kind: 'invalid', reason: 'domain' };
    var out = { want: t, numeric: num };
    if (near(s, t)) return Object.assign(out, { kind: 'ok', reason: 'correct' });
    var o = at(math, src, pt, OTHER[wrt]), nc = noChain(math, src, wrt);
    var cands = [['other', o], ['product', t + o], ['chain', nc ? value(math, nc, pt) : NaN], ['value', f(a, b)]];
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i][1];
      if (isFinite(c) && !near(c, t) && near(s, c)) return Object.assign(out, { kind: 'warn', reason: cands[i][0] });
    }
    if (Math.abs(t) > 0.02 && near(-s, t)) return Object.assign(out, { kind: 'warn', reason: 'sign' });
    return Object.assign(out, { kind: 'bad', reason: 'mismatch' });
  }

  window.LabMath.partial = {
    central: central, second: second, trace: trace, tangent: tangent, fn2: fn2,
    symbolic: symbolic, at: at, secondAt: secondAt, value: value, partials: partials, mixed: mixed, noChain: noChain,
    mistakes: mistakes, compareAround: compareAround, same: same, diagnose: diagnose, diagnoseValue: diagnoseValue
  };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { name: 'Paraboloide: x² + y²', f: 'x^2 + y^2', w: [-2, 2, -2, 2], a: 1, b: 0.5 },
    { name: 'Silla: x² − y²', f: 'x^2 - y^2', w: [-2, 2, -2, 2], a: 1, b: 1 },
    { name: 'Producto: x²y', f: 'x^2*y', w: [-2, 2, -2, 2], a: 1, b: 1.5 },
    { name: 'Onda: sen x · cos y', f: 'sin(x)*cos(y)', w: [-3, 3, -3, 3], a: 1, b: 0.5 },
    { name: 'Campana: e^(−x² − y²)', f: 'e^(-x^2 - y^2)', w: [-2, 2, -2, 2], a: 0.5, b: 0.5 },
    { name: 'Cadena: sen(xy)', f: 'sin(x*y)', w: [-2, 2, -2, 2], a: 1, b: 1 },
    { name: 'Placa: T = 80 − x² − 3y²', f: '80 - x^2 - 3y^2', w: [-3, 3, -3, 3], a: 1, b: -1 }
  ];
  var DIRS = [['x', 'Corte con y = b → ∂f/∂x'], ['y', 'Corte con x = a → ∂f/∂y']];
  var MODES = [['expr', 'Escribir la parcial (en x y y)'], ['value', 'Escribir su valor en (a, b)']];
  var NS = 'http://www.w3.org/2000/svg';

  window.Labs['partial-slice'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, LM = window.LabMath.partial;
    var presets = cfg.presets || PRESETS, start = cfg.start != null ? cfg.start : 2;
    var math = null, F = null, src = '', P = presets[start], win = P.w, dir = cfg.dir || 'x', mode = 'expr', shown = false, student = null;

    var preset = UI.select({ label: 'Ejemplo', options: presets.map(function (p) { return p.name; }) });
    var fIn = UI.mathField({ label: 'Superficie z = f(x, y)', hint: 'Escribe cualquier función de x y y; usa la paleta o el teclado ⌨.', palette: 'multi', onEnter: function () { build(); } });
    var run = UI.button('Graficar', 'primary', function () { build(); });
    var status = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var dirSel = UI.select({ label: 'Dirección del corte', options: DIRS.map(function (d) { return d[1]; }) });
    var aS = UI.slider({ label: 'a (valor de x en el punto)', min: win[0], max: win[1], step: 0.1, value: P.a, fmt: fmtN }, function () { moved(); });
    var bS = UI.slider({ label: 'b (valor de y en el punto)', min: win[2], max: win[3], step: 0.1, value: P.b, fmt: fmtN }, function () { moved(); });
    var modeSel = UI.select({ label: 'Reto', options: MODES.map(function (m) { return m[1]; }) });
    var ansExpr = UI.mathField({ label: 'Tu ∂f/∂x', hint: 'Una expresión en x y y; la comparo con la real cerca del punto.', palette: 'multi', onEnter: function () { verify(); } });
    var ansNum = UI.input({ label: 'Tu valor de ∂f/∂x en (a, b)', type: 'number', step: 'any', inputmode: 'decimal', mono: false, hint: 'Redondea a 2 decimales.' });
    var check = UI.button('Comprobar', 'primary', function () { verify(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });

    var surf = UI.svg(640, 340, 'Superficie z = f(x, y) con el plano de corte y la traza resaltada');
    var plot = UI.svg(640, 320, 'Traza de la superficie con su recta tangente en el punto');
    var traceCap = h('p', { class: 'lab-note' });
    // 3D solo en pantalla ancha con mouse; en móvil se queda la proyección SVG.
    var want3D = !!(window.matchMedia && window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches);
    var stage3d = h('div', { class: 'lab-stage lab-stage--manim lab-stage--3d partial-3d', hidden: true, role: 'img', 'aria-label': 'Superficie en 3D con el plano de corte; arrastra para girarla' });
    var note3d = h('p', { class: 'lab-note', hidden: true }, ['Arrastra para girar la superficie; la rueda del mouse acerca y aleja.']);
    var btn3d = UI.button('Vista 3D', 'ghost', function () { setView('3d'); });
    var btn2d = UI.button('Vista plana', 'ghost', function () { setView('2d'); });
    var viewBar = h('div', { class: 'lab-buttons lab-viewbar', hidden: !want3D, role: 'group', 'aria-label': 'Tipo de vista' }, [btn3d, btn2d]);
    var M3 = null, scene3 = null, view = '2d', pending3 = false;

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        preset.node, fIn.node, h('div', { class: 'lab-buttons' }, [run]), status,
        dirSel.node, aS.node, bS.node, modeSel.node, ansExpr.node, ansNum.node,
        h('div', { class: 'lab-buttons' }, [check]), verdict, facts
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Cortar la superficie']),
        viewBar, surf, stage3d, note3d,
        h('p', { class: 'lab-stack__label' }, ['La traza vista de frente']),
        plot, traceCap,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'superficie']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'traza (corte)']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'tangente']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu pendiente'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); build(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); build(); });
    dirSel.input.addEventListener('change', function () { dir = DIRS[+dirSel.input.value][0]; relabel(); reset(); draw(); });
    modeSel.input.addEventListener('change', function () { mode = MODES[+modeSel.input.value][0]; relabel(); reset(); draw(); });
    ansNum.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); verify(); } });

    function fmtN(v) { return (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(2)).toString().replace('-', '−'); }
    function sym() { return '∂f/∂' + dir; }
    function relabel() {
      ansExpr.node.querySelector('.lab-field__label, label').textContent = 'Tu ' + sym();
      ansNum.node.querySelector('label').textContent = 'Tu valor de ' + sym() + ' en (a, b)';
      ansExpr.node.hidden = mode !== 'expr';
      ansNum.node.hidden = mode !== 'value';
    }
    function setRange(sl, lo, hi, v) {
      sl.input.min = lo; sl.input.max = hi;
      sl.set(Math.max(lo, Math.min(hi, v)));
    }
    function load(i) {
      P = presets[i]; win = P.w;
      fIn.setMath(P.f);
      setRange(aS, win[0], win[1], P.a); setRange(bS, win[2], win[3], P.b);
      ansNum.input.value = '';
      reset();
    }
    function reset() { verdict.hidden = true; shown = false; student = null; }
    function moved() { reset(); draw(); }
    dirSel.input.value = String(dir === 'y' ? 1 : 0);
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
        var fn = LM.fn2(math, s);
        LM.symbolic(math, s, 'x');                       // que math.js la pueda derivar
        var okPts = 0;
        for (var i = 0; i <= 10; i++) for (var j = 0; j <= 10; j++) if (isFinite(fn(win[0] + (win[1] - win[0]) * i / 10, win[2] + (win[3] - win[2]) * j / 10))) okPts++;
        if (okPts < 20) throw new Error('La función casi no está definida en la ventana de este ejemplo.');
        F = fn; src = s; status.hidden = true;
      } catch (e) { UI.verdict(status, 'bad', 'No pude graficar', e.message); return; }
      reset();
      draw();
    }

    function verify() {
      if (!F || !math) return;
      var a = aS.get(), b = bS.get(), w = dir, o = OTHER[dir], r;
      if (mode === 'expr') {
        var s;
        try { s = String(ansExpr.get() || '').trim(); } catch (e) { UI.verdict(verdict, 'bad', 'Completa el editor', e.message); return; }
        if (!s) { UI.verdict(verdict, 'bad', 'Escribe tu ' + sym(), 'Una expresión en x y y.'); return; }
        try { r = LM.diagnose(math, src, w, s, a, b); } catch (e) { UI.verdict(verdict, 'bad', 'No pude leer tu expresión', e.message); return; }
        if (r.kind === 'invalid') { UI.verdict(verdict, 'bad', 'No pude evaluar tu expresión', 'Revisa paréntesis y que esté definida cerca del punto.'); return; }
      } else {
        var v = parseFloat(String(ansNum.input.value).replace(',', '.'));
        if (!isFinite(v)) { UI.verdict(verdict, 'bad', 'Escribe un número', 'Usa punto decimal; por ejemplo 2.75.'); return; }
        r = LM.diagnoseValue(math, src, w, v, a, b);
        if (r.kind === 'invalid') { UI.verdict(verdict, 'bad', 'La función no está definida en ese punto', 'Mueve a o b.'); return; }
        student = v;
      }
      var T = LM.at(math, src, { x: a, y: b }, w);
      var msgs = {
        correct: ['Tu ' + sym() + ' es correcta', 'En (' + fmtN(a) + ', ' + fmtN(b) + ') vale ' + UI.fmt(T, 4) + ': es la pendiente de la recta tangente a la traza.'],
        other: ['Derivaste respecto a ' + o, 'Se pide ' + sym() + ': el corte es ' + (w === 'x' ? 'y = b' : 'x = a') + ', así que ' + o + ' se queda fija y solo cambia ' + w + '. Lo tuyo es ∂f/∂' + o + '.'],
        product: ['Trataste a ' + o + ' como si cambiara con ' + w, 'Con ' + o + ' constante, un término como ' + (w === 'x' ? 'x²y' : 'xy²') + ' se deriva como constante por ' + (w === 'x' ? '2x·y' : 'x·2y') + ': no lleva regla del producto. Te sobra el término de ∂f/∂' + o + '.'],
        chain: ['Te faltó la derivada de adentro', 'Si ' + w + ' está dentro de otra función (sen(xy), e^(x²y)…), multiplica por la derivada de lo de adentro respecto a ' + w + ', con ' + o + ' constante.'],
        value: ['Ese es el valor de f, no de su pendiente', 'Calculaste la altura f(a, b). La parcial es qué tan rápido cambia esa altura al moverte en ' + w + '.'],
        sign: ['Casi: tu signo está invertido', 'Revisa los signos al derivar (por ejemplo, la derivada de cos es −sen).'],
        factor: ['Casi: te sobra o falta un factor', 'Tu resultado sale ' + UI.fmt(r.k || 0, 4) + ' veces el real. ¿Te faltó un exponente o la derivada de adentro?'],
        mismatch: ['No coincide', 'Deriva término por término. Todo lo que no tenga ' + w + ' es constante: su derivada es 0, y si multiplica, se queda igual.']
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
    // Rango de z con percentiles 2–98 sobre la ventana (lo que se sale se corta).
    function zRange() {
      var zs = [];
      for (var i = 0; i <= 30; i++) for (var j = 0; j <= 30; j++) {
        var z = F(win[0] + (win[1] - win[0]) * i / 30, win[2] + (win[3] - win[2]) * j / 30);
        if (isFinite(z)) zs.push(z);
      }
      zs.sort(function (p, q) { return p - q; });
      if (!zs.length) return [-1, 1];
      var lo = zs[Math.floor(zs.length * 0.02)], hi = zs[Math.ceil(zs.length * 0.98) - 1];
      if (hi - lo < 1e-6) { lo -= 1; hi += 1; }
      return [lo, hi];
    }

    function draw() {
      if (!F) return;
      drawSurface();
      drawTrace();
      if (view === '3d') schedule3D();
      var a = aS.get(), b = bS.get(), z0 = F(a, b);
      facts.innerHTML = '';
      var rows = [['punto', '(' + fmtN(a) + ', ' + fmtN(b) + ')'], ['f(a, b)', UI.fmt(z0, 5)]];
      if (shown) {
        var tg = LM.tangent(F, a, b, dir);
        rows.push(['pendiente de la traza (numérica)', UI.fmt(tg.m, 5)]);
        rows.push([sym() + ' real', UI.tex(math, LM.symbolic(math, src, dir))]);
      }
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', { html: r[1] })); });
      UI.renderMath(facts);
      traceCap.textContent = dir === 'x'
        ? 'Corte con y = ' + fmtN(b) + ': la curva z = f(x, ' + fmtN(b) + '). Horizontal: x · vertical: z.'
        : 'Corte con x = ' + fmtN(a) + ': la curva z = f(' + fmtN(a) + ', y). Horizontal: y · vertical: z.';
    }

    // Vista 2D de la traza (siempre), con su tangente y, si escribiste un valor, tu pendiente.
    function drawTrace() {
      var a = aS.get(), b = bS.get(), tr = LM.trace(F, a, b, dir), tg = LM.tangent(F, a, b, dir);
      var t0 = dir === 'x' ? win[0] : win[2], t1 = dir === 'x' ? win[1] : win[3], vals = [], i;
      for (i = 0; i <= 120; i++) vals.push(tr(t0 + (t1 - t0) * i / 120));
      vals.push(tg.z0);
      var yr = window.LabPlot.range(vals);
      var p = window.LabPlot(plot, { x: [t0, t1], y: yr });
      p.clear(); p.grid(); p.axes();
      p.curve(tr, 'aux', 3.4);
      var d = (t1 - t0) * 0.28;
      if (isFinite(tg.m)) p.curve(tg.at, 'error', 2.6, null, Math.max(t0, tg.t0 - d), Math.min(t1, tg.t0 + d));
      if (student != null && isFinite(student) && isFinite(tg.z0)) p.curve(function (t) { return tg.z0 + student * (t - tg.t0); }, 'student', 2.4, '7 5', Math.max(t0, tg.t0 - d), Math.min(t1, tg.t0 + d));
      p.point(tg.t0, tg.z0, 'dot-trace', 6);
    }

    // Proyección SVG de la superficie (móvil, o PC con "Vista plana").
    function drawSurface() {
      var a = aS.get(), b = bS.get(), zr = zRange(), zs = zr[1] - zr[0], zlo = zr[0] - 0.08 * zs, zhi = zr[1] + 0.08 * zs;
      var cx = (win[0] + win[1]) / 2, cy = (win[2] + win[3]) / 2, s = 2 / Math.max(win[1] - win[0], win[3] - win[2]), kz = 1.3 / (zhi - zlo);
      var az = -35 * Math.PI / 180, elv = 24 * Math.PI / 180, ca = Math.cos(az), sa = Math.sin(az), ce = Math.cos(elv), se = Math.sin(elv);
      function raw(x, y, z) {
        var X = (x - cx) * s, Y = (y - cy) * s, Z = (z - (zlo + zhi) / 2) * kz;
        var u = X * ca - Y * sa, v = X * sa + Y * ca;
        return [v, -(Z * ce - u * se)];
      }
      // Encaja la caja [ventana] × [zlo, zhi] en el lienzo.
      var box = [], W = 640, H = 340, m = 30;
      [win[0], win[1]].forEach(function (x) { [win[2], win[3]].forEach(function (y) { [zlo, zhi].forEach(function (z) { box.push(raw(x, y, z)); }); }); });
      var x0 = Math.min.apply(null, box.map(function (q) { return q[0]; })), x1 = Math.max.apply(null, box.map(function (q) { return q[0]; }));
      var y0 = Math.min.apply(null, box.map(function (q) { return q[1]; })), y1 = Math.max.apply(null, box.map(function (q) { return q[1]; }));
      var k = Math.min((W - 2 * m) / (x1 - x0), (H - 2 * m) / (y1 - y0)), ox = (W - k * (x1 - x0)) / 2, oy = (H - k * (y1 - y0)) / 2;
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
      // Caja de referencia (piso) y ejes.
      var floor = [[win[0], win[2]], [win[1], win[2]], [win[1], win[3]], [win[0], win[3]], [win[0], win[2]]].map(function (q) { return Pt(q[0], q[1], zlo); });
      el('path', { d: path(floor), class: 'plot-grid', fill: 'none' }, g);
      // Malla de la superficie.
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
      // Plano de corte.
      var pl = dir === 'x'
        ? [[win[0], b, zlo], [win[1], b, zlo], [win[1], b, zhi], [win[0], b, zhi]]
        : [[a, win[2], zlo], [a, win[3], zlo], [a, win[3], zhi], [a, win[2], zhi]];
      var plP = pl.map(function (q) { return Pt(q[0], q[1], q[2]); });
      el('path', { d: path(plP) + 'Z', class: 'area-fill area-fill--aux' }, g);
      el('path', { d: path(plP) + 'Z', class: 'aux', fill: 'none', 'stroke-width': 1.2, 'stroke-dasharray': '5 5' }, g);
      // Traza resaltada y tangente.
      var tr = [], tg = LM.tangent(F, a, b, dir), lo = dir === 'x' ? win[0] : win[2], hi = dir === 'x' ? win[1] : win[3];
      for (j = 0; j <= 120; j++) {
        t = lo + (hi - lo) * j / 120;
        var zz = dir === 'x' ? F(t, b) : F(a, t);
        tr.push(inZ(zz) ? (dir === 'x' ? Pt(t, b, zz) : Pt(a, t, zz)) : null);
      }
      el('path', { d: path(tr), class: 'aux', fill: 'none', 'stroke-width': 3.4, 'stroke-linecap': 'round' }, g);
      var dd = (hi - lo) * 0.25, tl = [];
      for (j = 0; j <= 20; j++) {
        t = tg.t0 - dd + 2 * dd * j / 20;
        var zt = tg.at(t);
        tl.push(inZ(zt) && t >= lo && t <= hi ? (dir === 'x' ? Pt(t, b, zt) : Pt(a, t, zt)) : null);
      }
      el('path', { d: path(tl), class: 'error', fill: 'none', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, g);
      if (inZ(tg.z0)) { var c = Pt(a, b, tg.z0); el('circle', { cx: c[0], cy: c[1], r: 6, class: 'dot-trace' }, g); }
      // Ejes desde la esquina (x0, y0) del piso, con su letra en la punta, fuera de la caja.
      var o0 = Pt(win[0], win[2], zlo), ex = Pt(win[1] + 0.22 * (win[1] - win[0]), win[2], zlo), ey = Pt(win[0], win[3] + 0.22 * (win[3] - win[2]), zlo);
      [[ex, 'x'], [ey, 'y']].forEach(function (e) {
        el('path', { d: 'M' + o0[0].toFixed(1) + ' ' + o0[1].toFixed(1) + 'L' + e[0][0].toFixed(1) + ' ' + e[0][1].toFixed(1), class: 'axis', fill: 'none', 'stroke-width': 1.4 }, g);
        var dx = e[0][0] - o0[0], dy = e[0][1] - o0[1], L = Math.hypot(dx, dy) || 1;
        el('text', { x: (e[0][0] + dx / L * 12).toFixed(1), y: (e[0][1] + dy / L * 12 + 5).toFixed(1), class: 'lab-tick', 'text-anchor': 'middle' }, g, e[1]);
      });
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
      if (!scene3 || !F) return;
      var a = aS.get(), b = bS.get(), zr = zRange(), zs = zr[1] - zr[0], zlo = zr[0] - 0.08 * zs, zhi = zr[1] + 0.08 * zs;
      var cx = (win[0] + win[1]) / 2, cy = (win[2] + win[3]) / 2, s = 8 / Math.max(win[1] - win[0], win[3] - win[2]), kz = 5 / (zhi - zlo), zc = (zlo + zhi) / 2;
      function cl(z) { return isFinite(z) ? Math.max(zlo, Math.min(zhi, z)) : zc; }
      function P(x, y, z) { return [(x - cx) * s, (y - cy) * s, (cl(z) - zc) * kz]; }
      var C = { ref: UI.color('--plot-ref'), aux: UI.color('--plot-aux'), err: UI.color('--plot-error'), tr: UI.color('--plot-trace') };
      var objs = [], TAU = 2 * Math.PI, tg = LM.tangent(F, a, b, dir);
      function add(func, u, v, res, color, opacity) {
        objs.push(new M3.Surface3D({ func: func, uRange: u, vRange: v, uResolution: res[0], vResolution: res[1], color: color, opacity: opacity, doubleSided: true }));
      }
      add(function (u, v) { return P(u, v, F(u, v)); }, [win[0], win[1]], [win[2], win[3]], [36, 36], C.ref, 0.4);
      if (dir === 'x') add(function (u, v) { return P(u, b, zlo + (zhi - zlo) * v); }, [win[0], win[1]], [0, 1], [2, 2], C.aux, 0.22);
      else add(function (u, v) { return P(a, u, zlo + (zhi - zlo) * v); }, [win[2], win[3]], [0, 1], [2, 2], C.aux, 0.22);
      // Tubos delgados para la traza y la tangente (en el plano del corte).
      var w = 0.1;
      function tube(zf, lo, hi, color) {
        add(function (u, v) {
          var p = dir === 'x' ? P(u, b, zf(u)) : P(a, u, zf(u));
          if (dir === 'x') return [p[0], p[1] + w * Math.cos(v), p[2] + w * Math.sin(v)];
          return [p[0] + w * Math.cos(v), p[1], p[2] + w * Math.sin(v)];
        }, [lo, hi], [0, TAU], [80, 8], color, 1);
      }
      var lo = dir === 'x' ? win[0] : win[2], hi = dir === 'x' ? win[1] : win[3], dd = (hi - lo) * 0.25;
      tube(dir === 'x' ? function (t) { return F(t, b); } : function (t) { return F(a, t); }, lo, hi, C.aux);
      if (isFinite(tg.m)) tube(tg.at, Math.max(lo, tg.t0 - dd), Math.min(hi, tg.t0 + dd), C.err);
      var c = P(a, b, tg.z0), r = 0.22;
      add(function (u, v) { return [c[0] + r * Math.sin(u) * Math.cos(v), c[1] + r * Math.sin(u) * Math.sin(v), c[2] + r * Math.cos(u)]; }, [0, Math.PI], [0, TAU], [10, 14], C.tr, 1);
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
        scene3 = new M3.ThreeDScene(stage3d, { width: wd, height: Math.round(wd * 9 / 16), backgroundOpacity: 0, phi: 65 * Math.PI / 180, theta: -60 * Math.PI / 180, enableOrbitControls: true });
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
