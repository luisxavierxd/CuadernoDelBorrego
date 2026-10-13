/* =====================================================================
   Lab solenoid-toroid (Física 3 · S09): el campo de un solenoide y de un toroide.
   Solenoide de N vueltas, largo L y radio R con corriente I (SI):
     ideal (muy largo)   B = μ₀ n I,  n = N/L
     finito, en su eje   B(z) = (μ₀NI/2L)·[(z + L/2)/√((z + L/2)² + R²) − (z − L/2)/√((z − L/2)² + R²)]
     suma de espiras     B(z) = Σ μ₀IR²/2((z − zᵢ)² + R²)^{3/2}   (lo que dibuja el lab, espira por espira)
   En el extremo de un solenoide largo, B ≈ ½ μ₀nI.
   Toroide de N vueltas, radios a < b: B = μ₀NI/2πr si a < r < b, y 0 fuera.
   Reto (B en mT, o I en A). Errores que detecta:
     usedN    usó N en lugar de n = N/L            cm     dejó L (o r) en centímetros
     half     dio el campo del extremo             outside dio μ₀NI/2πr fuera del toroide
     noTwoPi  olvidó el 2π del toroide             inverse despejó I al revés
   ===================================================================== */
(function () {
  var MU0 = 4 * Math.PI * 1e-7;

  /* ------------------------- Matemática pura ------------------------- */
  function ideal(n, I) { return MU0 * n * I; }
  function finiteAxis(N, L, R, I, z) {
    var u = z + L / 2, w = z - L / 2;
    return MU0 * N * I / (2 * L) * (u / Math.hypot(u, R) - w / Math.hypot(w, R));
  }
  function loopsSum(N, L, R, I, z) {
    var s = 0;
    for (var i = 0; i < N; i++) { var zi = -L / 2 + L * (i + 0.5) / N, d = z - zi; s += MU0 * I * R * R / (2 * Math.pow(d * d + R * R, 1.5)); }
    return s;
  }
  function toroid(N, I, r, a, b) { return r > a && r < b ? MU0 * N * I / (2 * Math.PI * r) : 0; }
  function turnsFor(B, L, I) { return B * L / (MU0 * I); }
  function currentFor(B, n) { return B / (MU0 * n); }

  /* ---------- Reto ----------
     sol:  c = { kind: 'sol', N, L (cm), I, end: bool }      → B (mT) en el centro o en el extremo
     need: c = { kind: 'need', B (mT), N, L (cm) }           → I (A)
     tor:  c = { kind: 'tor', N, I, a, b, r (cm) }           → B (mT) */
  function truth(c) {
    if (c.kind === 'need') return currentFor(c.B / 1000, c.N / (c.L / 100));
    if (c.kind === 'tor') return toroid(c.N, c.I, c.r / 100, c.a / 100, c.b / 100) * 1000;
    return ideal(c.N / (c.L / 100), c.I) * 1000 * (c.end ? 0.5 : 1);
  }
  function mistakes(c) {
    if (c.kind === 'need') return { usedN: c.B / 1000 / (MU0 * c.N), cm: c.B / 1000 / (MU0 * c.N / c.L), inverse: MU0 * (c.N / (c.L / 100)) * c.B / 1000 };
    if (c.kind === 'tor') {
      var inF = MU0 * c.N * c.I / (2 * Math.PI * c.r / 100) * 1000;
      return { outside: inF, noTwoPi: MU0 * c.N * c.I / (c.r / 100) * 1000, cm: MU0 * c.N * c.I / (2 * Math.PI * c.r) * 1000 };
    }
    var full = ideal(c.N / (c.L / 100), c.I) * 1000;
    return { usedN: MU0 * c.N * c.I * 1000 * (c.end ? 0.5 : 1), cm: ideal(c.N / c.L, c.I) * 1000 * (c.end ? 0.5 : 1), half: c.end ? full : full / 2 };
  }
  function diagnose(c, s, tol) {
    tol = tol || 0.03;
    if (!isFinite(s)) return 'bad';
    var t = truth(c), m = mistakes(c);
    var close = function (a, b) { return b === 0 ? Math.abs(a) < 1e-9 : Math.abs(a - b) <= tol * Math.abs(b); };
    if (close(s, t)) return 'ok';
    var keys = c.kind === 'need' ? ['usedN', 'cm', 'inverse'] : c.kind === 'tor' ? ['outside', 'noTwoPi', 'cm'] : ['usedN', 'cm', 'half'];
    for (var i = 0; i < keys.length; i++) {
      var w = m[keys[i]];
      if (keys[i] === 'outside' && t !== 0) continue;
      if (!close(w, t) && close(s, w)) return keys[i];
    }
    return 'bad';
  }

  // Unidades de clase: largos y radios en cm, campo en mT, corriente en A.
  function idealmT(N, L, I) { return ideal(N / (L / 100), I) * 1000; }
  function finitemT(N, L, R, I, z) { return finiteAxis(N, L / 100, R / 100, I, z / 100) * 1000; }
  function toroidmT(N, I, r, a, b) { return toroid(N, I, r / 100, a / 100, b / 100) * 1000; }
  function currentA(BmT, N, L) { return currentFor(BmT / 1000, N / (L / 100)); }
  function turnsN(BmT, L, I) { return turnsFor(BmT / 1000, L / 100, I); }

  window.LabMath.solenoid = {
    idealmT: idealmT, finitemT: finitemT, toroidmT: toroidmT, currentA: currentA, turnsN: turnsN,
    MU0: MU0, ideal: ideal, finiteAxis: finiteAxis, loopsSum: loopsSum, toroid: toroid, turnsFor: turnsFor, currentFor: currentFor,
    truth: truth, mistakes: mistakes, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var VW = 640, VH = 420;
  var MSG = {
    ok: ['Tu respuesta coincide', 'Correcto.'],
    usedN: ['Usaste N en lugar de n', 'En B = μ₀nI, n = N/L son vueltas por metro, no el total de vueltas.'],
    cm: ['Revisa las unidades', 'Pasa las longitudes a metros: n = N/L con L en m (30 cm = 0.30 m).'],
    half: ['Confundiste el centro con el extremo', 'En el centro de un solenoide largo B = μ₀nI; en un extremo, más o menos la mitad.'],
    outside: ['Ese punto está fuera del toroide', 'La trayectoria amperiana fuera del núcleo (r < a o r > b) encierra corriente neta cero: B = 0.'],
    noTwoPi: ['Te faltó el 2π', 'La trayectoria amperiana es una circunferencia de largo 2πr: B·2πr = μ₀NI.'],
    inverse: ['Despejaste al revés', 'De B = μ₀nI sale I = B/(μ₀n).'],
    bad: ['Tu respuesta no coincide', 'Solenoide: B = μ₀(N/L)I. Toroide: B = μ₀NI/2πr adentro y 0 afuera. Todo en metros.']
  };

  window.Labs['solenoid-toroid'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var mode = 'sol', so = { N: 60, L: 20, R: 2, I: 2 }, to = { N: 200, I: 2, a: 4, b: 7, r: 5.5 }, chal = null;

    var mSel = UI.select({ label: 'Modo', options: ['Solenoide', 'Toroide'] });
    var sN = UI.slider({ label: 'Vueltas N', min: 5, max: 400, step: 5, value: so.N, unit: '' }, function (v) { so.N = v; draw(); });
    var sL = UI.slider({ label: 'Largo L', min: 2, max: 40, step: 1, value: so.L, unit: 'cm' }, function (v) { so.L = v; draw(); });
    var sR = UI.slider({ label: 'Radio R', min: 0.5, max: 6, step: 0.5, value: so.R, unit: 'cm' }, function (v) { so.R = v; draw(); });
    var sI = UI.slider({ label: 'Corriente I', min: 0.5, max: 5, step: 0.5, value: so.I, unit: 'A' }, function (v) { so.I = v; to.I = v; draw(); });
    var tN = UI.slider({ label: 'Vueltas N', min: 20, max: 1000, step: 20, value: to.N, unit: '' }, function (v) { to.N = v; draw(); });
    var tA = UI.slider({ label: 'Radio interior a', min: 2, max: 6, step: 0.5, value: to.a, unit: 'cm' }, function (v) { to.a = Math.min(v, to.b - 0.5); tA.set(to.a); draw(); });
    var tB = UI.slider({ label: 'Radio exterior b', min: 3, max: 9, step: 0.5, value: to.b, unit: 'cm' }, function (v) { to.b = Math.max(v, to.a + 0.5); tB.set(to.b); draw(); });
    var tR = UI.slider({ label: 'Radio de la trayectoria r', min: 0.5, max: 11, step: 0.5, value: to.r, unit: 'cm' }, function (v) { to.r = v; draw(); });
    var note = h('p', { class: 'lab-note', role: 'status' });

    var chalText = h('p', { class: 'lab-note' });
    var ans = UI.input({ label: 'Tu respuesta', type: 'text', inputmode: 'decimal', mono: false, hint: 'Notación científica: <code>2.5e-1</code> o <code>2.5×10^-1</code>.' });
    var bCheck = UI.button('Comprobar', 'primary', check);
    var bNew = UI.button('Otro reto', 'ghost', function () { newChallenge(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var svg = UI.svg(VW, VH, 'Solenoide con la gráfica del campo magnético a lo largo de su eje.');
    var legend = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--ref' }), 'B (fórmula del solenoide finito)']),
      h('li', {}, [h('i', { class: 'sw sw--trace' }), 'suma espira por espira']),
      h('li', {}, [h('i', { class: 'sw sw--aux' }), 'ideal μ₀nI'])
    ]);
    var facts = h('dl', { class: 'lab-facts' });
    var solBox = h('div', { class: 'lab-stack' }, [sN.node, sL.node, sR.node]);
    var torBox = h('div', { class: 'lab-stack' }, [tN.node, tA.node, tB.node, tR.node]);

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        mSel.node, solBox, torBox, sI.node, note,
        h('p', { class: 'lab-field__label' }, ['Reto']), chalText, ans.node,
        h('div', { class: 'lab-buttons' }, [bCheck, bNew]), verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Solenoides y toroides']),
        svg, legend, facts
      ])
    ]));
    // Sin mayúsculas en las etiquetas de los campos: µ se volvía Μ (y mT, MT); θ y φ, Θ y Φ.
    mount.querySelectorAll('label.lab-field__label').forEach(function (l) { l.style.textTransform = 'none'; l.style.letterSpacing = '0'; });
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    ans.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    mSel.input.addEventListener('change', function () { setMode(mSel.input.value === '0' ? 'sol' : 'tor'); chal = null; verdict.hidden = true; chalText.textContent = ''; draw(); });

    function parse(s) { return window.CBExercises ? window.CBExercises.parseNumber(s) : parseFloat(String(s).replace(/−/g, '-')); }
    function show(node, on) { node.hidden = !on; node.style.display = on ? '' : 'none'; }
    function setMode(m) {
      mode = m; mSel.input.value = m === 'sol' ? '0' : '1';
      show(solBox, m === 'sol'); show(torBox, m === 'tor'); show(legend, m === 'sol');
    }
    function el(tag, attrs, text) {
      if (!UI.svgOk(attrs)) return null;
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (text != null) n.textContent = text;
      svg.querySelector('g.sketch').appendChild(n);
      return n;
    }
    function line(cls, x1, y1, x2, y2, w, dash) { el('path', { 'class': cls, fill: 'none', 'stroke-width': w || 2, 'stroke-linecap': 'round', 'stroke-dasharray': dash || null, d: 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) }); }
    function arrowPx(cls, x, y, dx, dy, w) {
      var L = Math.hypot(dx, dy);
      if (!(L > 3)) return;
      var ux = dx / L, uy = dy / L, hh = Math.min(10, L * 0.45), ex = x + dx, ey = y + dy;
      el('path', { 'class': cls, fill: 'none', 'stroke-width': w || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        d: 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
          'M' + (ex - ux * hh - uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh + ux * hh * 0.6).toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
          'L' + (ex - ux * hh + uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh - ux * hh * 0.6).toFixed(1) });
    }
    function txt(x, y, s, anchor, fs) { el('text', { x: x.toFixed(1), y: y.toFixed(1), 'class': 'ann', 'text-anchor': anchor || 'middle', 'font-size': fs || 16 }, s); }
    function n3(v) { return isFinite(v) ? Number(v.toPrecision(3)).toString() : '—'; }
    function fmtB(T) { var a = Math.abs(T); return a >= 1e-3 ? n3(T * 1000) + ' mT' : n3(T * 1e6) + ' µT'; }

    function draw() {
      svg.innerHTML = '';
      svg.appendChild(document.createElementNS(NS, 'g')).setAttribute('class', 'sketch');
      if (mode === 'tor') return drawTor();
      var N = so.N, L = so.L / 100, R = so.R / 100, I = so.I, n = N / L, Bi = ideal(n, I);
      // Vista lateral: el solenoide ocupa el ancho según L (z de −L a L en pantalla).
      var zMax = Math.max(L, 0.06), x0 = 50, x1 = 610, cy = 95;
      var ZX = function (z) { return (x0 + x1) / 2 + (x1 - x0) / 2 * z / zMax; };
      var hpx = Math.max(10, Math.min(60, R / zMax * 280));
      line('axis', x0 - 10, cy, x1 + 10, cy, 1.2, '4 6');
      txt(x1 + 8, cy - 8, 'z', 'end', 15);
      var shown = Math.min(N, 60);
      for (var i = 0; i < shown; i++) {
        var z = -L / 2 + L * (i + 0.5) / shown, x = ZX(z);
        line('ref', x - 3, cy - hpx, x + 3, cy + hpx, 2);
      }
      line('axis', ZX(-L / 2), cy - hpx, ZX(L / 2), cy - hpx, 1); line('axis', ZX(-L / 2), cy + hpx, ZX(L / 2), cy + hpx, 1);
      arrowPx('error', ZX(-L / 4), cy, Math.min(ZX(L / 4) - ZX(-L / 4), 140), 0, 3);
      txt(ZX(0), cy + hpx + 22, (N > shown ? 'se dibujan ' + shown + ' de ' + N + ' vueltas · ' : '') + 'L = ' + so.L + ' cm', 'middle', 14);
      // Gráfica B(z)
      var gy0 = 395, gy1 = 190, Bmax = Bi * 1.2;
      var GY = function (b) { return gy0 - (gy0 - gy1) * b / Bmax; };
      line('axis', x0, gy0, x1, gy0, 1.4); line('axis', ZX(0), gy0, ZX(0), gy1 - 12, 1, '3 5');
      txt(x0, gy1 - 18, 'B en el eje', 'start', 15);
      line('aux', x0, GY(Bi), x1, GY(Bi), 2, '6 5');
      txt(x1, GY(Bi) - 8, 'μ₀nI', 'end', 15);
      [-L / 2, L / 2].forEach(function (z) { line('axis', ZX(z), gy0, ZX(z), gy1, 1, '2 5'); });
      var d = '', d2 = '';
      for (var k = 0; k <= 160; k++) {
        var zz = -zMax + 2 * zMax * k / 160;
        d += (k ? 'L' : 'M') + ZX(zz).toFixed(1) + ' ' + GY(finiteAxis(N, L, R, I, zz)).toFixed(1);
        if (k % 4 === 0) d2 += (k ? 'L' : 'M') + ZX(zz).toFixed(1) + ' ' + GY(loopsSum(N, L, R, I, zz)).toFixed(1);
      }
      el('path', { 'class': 'ref', fill: 'none', 'stroke-width': 2.6, d: d });
      el('path', { 'class': 'trace', fill: 'none', 'stroke-width': 2, 'stroke-dasharray': '3 5', d: d2 });
      var Bc = finiteAxis(N, L, R, I, 0), Be = finiteAxis(N, L, R, I, L / 2);
      facts.innerHTML = '';
      [['n = N/L', n3(n) + ' vueltas/m'], ['ideal μ₀nI', fmtB(Bi)], ['centro (finito)', fmtB(Bc)], ['extremo', fmtB(Be) + ' (' + n3(Be / Bc * 100) + ' % del centro)'], ['L/R', n3(L / R)]]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
      svg.setAttribute('aria-label', 'Solenoide de ' + N + ' vueltas y ' + so.L + ' cm. En el centro B = ' + fmtB(Bc) + '; el ideal da ' + fmtB(Bi) + '.');
    }
    function drawTor() {
      var cx = 175, cy = 210, s = 18, a = to.a * s, b = to.b * s, r = to.r * s;
      el('circle', { cx: cx, cy: cy, r: b, 'class': 'box-ref' });
      el('circle', { cx: cx, cy: cy, r: a, 'class': 'box-base' });
      var nT = Math.min(48, to.N / 5);
      for (var i = 0; i < nT; i++) { var t = 2 * Math.PI * i / nT; line('ref', cx + a * Math.cos(t), cy - a * Math.sin(t), cx + b * Math.cos(t), cy - b * Math.sin(t), 1.6); }
      el('circle', { cx: cx, cy: cy, r: r.toFixed(1), fill: 'none', 'class': 'trace', 'stroke-width': 3, 'stroke-dasharray': '7 5' });
      var Br = toroid(to.N, to.I, to.r / 100, to.a / 100, to.b / 100);
      if (Br > 0) arrowPx('error', cx + r, cy, 0, -Math.min(60, 20 + 8 * Math.log10(1 + Br * 1e6)), 3);
      txt(cx, cy + 5, 'r = ' + to.r + ' cm', 'middle', 15);
      // Gráfica B(r)
      var gx0 = 380, gx1 = 620, gy0 = 360, gy1 = 80, rMax = 11, Bm = toroid(to.N, to.I, to.a / 100 * 1.0001, to.a / 100, to.b / 100) * 1.15;
      var GX = function (rr) { return gx0 + (gx1 - gx0) * rr / rMax; }, GY = function (bb) { return gy0 - (gy0 - gy1) * bb / Bm; };
      line('axis', gx0, gy0, gx1, gy0, 1.4); line('axis', gx0, gy0, gx0, gy1 - 10, 1.4);
      txt(gx1, gy0 + 22, 'r (cm)', 'end', 15); txt(gx0 + 4, gy1 - 16, 'B', 'start', 15);
      [to.a, to.b].forEach(function (q, j) { line('axis', GX(q), gy0, GX(q), gy1, 1, '3 5'); txt(GX(q), gy0 + 22, j ? 'b' : 'a', 'middle', 15); });
      var d = 'M' + gx0 + ' ' + gy0 + 'L' + GX(to.a).toFixed(1) + ' ' + gy0;
      for (var k = 0; k <= 60; k++) { var rr = to.a + (to.b - to.a) * k / 60; d += 'L' + GX(rr).toFixed(1) + ' ' + GY(toroid(to.N, to.I, rr / 100 * (k === 0 ? 1.0001 : k === 60 ? 0.9999 : 1), to.a / 100, to.b / 100)).toFixed(1); }
      d += 'L' + GX(to.b).toFixed(1) + ' ' + gy0 + 'L' + gx1 + ' ' + gy0;
      el('path', { 'class': 'ref', fill: 'none', 'stroke-width': 2.4, d: d });
      el('circle', { cx: GX(to.r).toFixed(1), cy: GY(Br).toFixed(1), r: 5, 'class': 'dot-error' });
      var Ienc = to.r > to.a && to.r < to.b ? to.N * to.I : 0;
      facts.innerHTML = '';
      [['corriente encerrada', Ienc ? to.N + ' × ' + to.I + ' A = ' + n3(Ienc) + ' A' : '0 (no cruza el devanado, o lo cruza dos veces)'], ['B en r = ' + to.r + ' cm', Br ? fmtB(Br) : '0'],
       ['B junto a a y junto a b', fmtB(MU0 * to.N * to.I / (2 * Math.PI * to.a / 100)) + ' y ' + fmtB(MU0 * to.N * to.I / (2 * Math.PI * to.b / 100))]]
        .forEach(function (rw) { facts.appendChild(h('dt', {}, [rw[0]])); facts.appendChild(h('dd', {}, [rw[1]])); });
      svg.setAttribute('aria-label', 'Toroide visto desde arriba con una trayectoria amperiana de radio ' + to.r + ' cm y la gráfica de B contra r: cero fuera del núcleo y μ₀NI/2πr adentro.');
    }

    /* ---------- Reto ---------- */
    function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
    function newChallenge(fixed) {
      var c = fixed;
      if (!c) {
        if (mode === 'tor') { var a = rnd([3, 4, 5]), b = a + rnd([2, 3]); c = { kind: 'tor', N: rnd([200, 300, 400, 500]), I: rnd([1, 1.5, 2, 3]), a: a, b: b, r: rnd([a + 1, a + 1.5, b + 1, a - 1]) }; }
        else c = rnd([{ kind: 'sol', N: rnd([100, 200, 300, 400]), L: rnd([10, 20, 25, 40]), I: rnd([0.5, 1, 2, 3]), end: rnd([false, false, true]) },
          { kind: 'need', B: rnd([1, 2, 3, 5]), N: rnd([200, 300, 400]), L: rnd([10, 20, 30]) }]);
      }
      chal = c; verdict.hidden = true;
      if (c.kind === 'tor') {
        setMode('tor'); to = { N: c.N, I: c.I, a: c.a, b: c.b, r: c.r }; tN.set(c.N); tA.set(c.a); tB.set(c.b); tR.set(c.r); sI.set(c.I);
        chalText.textContent = 'Un toroide de ' + c.N + ' vueltas (a = ' + c.a + ' cm, b = ' + c.b + ' cm) lleva I = ' + c.I + ' A. ¿Cuánto vale B a r = ' + c.r + ' cm del centro? En mT.';
        ans.node.querySelector('label').textContent = 'Tu B (mT)';
      } else if (c.kind === 'sol') {
        setMode('sol'); so = { N: c.N, L: c.L, R: 1, I: c.I }; sN.set(c.N); sL.set(c.L); sR.set(1); sI.set(c.I);
        chalText.textContent = 'Un solenoide largo de ' + c.N + ' vueltas y ' + c.L + ' cm lleva I = ' + c.I + ' A. ¿Cuánto vale B ' + (c.end ? 'en uno de sus extremos (sobre el eje)' : 'en su centro') + '? En mT.';
        ans.node.querySelector('label').textContent = 'Tu B (mT)';
      } else {
        setMode('sol'); so = { N: c.N, L: c.L, R: 1, I: 1 }; sN.set(c.N); sL.set(c.L); sR.set(1); sI.set(1);
        chalText.textContent = 'Quieres ' + c.B + ' mT dentro de un solenoide largo de ' + c.N + ' vueltas y ' + c.L + ' cm. ¿Qué corriente necesitas? En A.';
        ans.node.querySelector('label').textContent = 'Tu I (A)';
      }
      ans.input.value = '';
      draw();
    }
    function check() {
      if (!chal) { UI.verdict(verdict, 'bad', 'Primero pide un reto', 'Presiona «Otro reto».'); return; }
      var a = parse(ans.input.value);
      if (!isFinite(a)) { UI.verdict(verdict, 'bad', MSG.bad[0], 'Escribe un número.'); return; }
      var key = diagnose(chal, a), t = truth(chal), msg = MSG[key] || MSG.bad;
      UI.verdict(verdict, key === 'ok' ? 'ok' : key === 'bad' ? 'bad' : 'warn', msg[0], msg[1] + ' Valor real: ' + n3(t) + (chal.kind === 'need' ? ' A.' : ' mT.'));
    }

    // Ejemplo cargado: un compañero usó N en vez de n = N/L.
    setMode('sol');
    newChallenge({ kind: 'sol', N: 200, L: 25, I: 2, end: false });
    ans.input.value = String(Number(mistakes(chal).usedN.toPrecision(3)));
    note.textContent = 'Ejemplo cargado: así respondió un compañero el reto. ¿Ves su error? Presiona Comprobar, o mueve los controles tú mismo.';
    check();
    return Promise.resolve();
  };
})();
