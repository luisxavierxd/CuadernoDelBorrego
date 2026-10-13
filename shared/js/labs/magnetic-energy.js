/* =====================================================================
   Lab magnetic-energy (Física 3 · S15): energía en el campo magnético.
   Dos geometrías:
     · Solenoide de N vueltas, radio r y largo ℓ: campo uniforme adentro.
     · Toroide de sección rectangular (radios a y b, alto h): B = μ₀NI/2πr.
   Barras que comparan las dos formas de calcular la energía: ½LI² y la integral
   de la densidad u = B²/2μ₀ sobre el volumen, hecha numéricamente con n capas
   (el deslizador de capas muestra que la suma converge a ½LI²).
   Reto: U (mJ), u (J/m³; en el toroide, en el radio interior) o la corriente para guardar U*.
   El «casi»:
     noHalf    olvidó el ½ (en ½LI² o en B²/2μ₀)
     noSquare  no elevó I (o B) al cuadrado
     cm3       usó el volumen en cm³ (o el área en cm²) sin pasarlo a m³
     mT        dejó B en mT al calcular u
     noSqrt    dio 2U/L sin sacar la raíz
     avgB      en el toroide usó el campo del radio medio como si fuera uniforme
   LabMath.menergy es puro (SI). μ₀ = 4π × 10⁻⁷ T·m/A.
   ===================================================================== */
(function () {
  var MU0 = 4 * Math.PI * 1e-7, TAU = 2 * Math.PI;

  /* ------------------------- Matemática pura ------------------------- */
  function density(B) { return B * B / (2 * MU0); }
  // Solenoide: r y ℓ en cm, I en A. Energía en J.
  function solenoid(N, rcm, lcm, I) {
    var r = rcm / 100, l = lcm / 100, A = Math.PI * r * r, V = A * l, B = MU0 * N * I / l, u = density(B), L = MU0 * N * N * A / l;
    return { A: A, V: V, B: B, u: u, Uu: u * V, L: L, UL: 0.5 * L * I * I };
  }
  // Toroide de sección rectangular: a, b, h en cm.
  function toroid(N, acm, bcm, hcm, I) {
    var a = acm / 100, b = bcm / 100, h = hcm / 100, lg = Math.log(b / a), L = MU0 * N * N * h * lg / TAU;
    var Ba = MU0 * N * I / (TAU * a), Bb = MU0 * N * I / (TAU * b), rm = (a + b) / 2, Bm = MU0 * N * I / (TAU * rm);
    return { L: L, UL: 0.5 * L * I * I, Ba: Ba, Bb: Bb, ua: density(Ba), ub: density(Bb), Bm: Bm, V: Math.PI * (b * b - a * a) * h, Bfield: function (r) { return MU0 * N * I / (TAU * r); } };
  }
  // Cable coaxial (conductores delgados de radios a < b): energía y L por unidad de largo.
  function coax(I, a, b) { var lg = Math.log(b / a); return { Ul: MU0 * I * I * lg / (4 * Math.PI), Ll: MU0 * lg / TAU }; }
  // ∫u dV con n capas cilíndricas (punto medio en r): la energía del campo, sin usar L.
  function integrate(kind, p, n) {
    n = Math.max(1, Math.round(n || 200));
    var s = 0;
    if (kind === 'toroid') {
      var a = p.a / 100, b = p.b / 100, h = p.h / 100, dr = (b - a) / n;
      for (var i = 0; i < n; i++) { var r = a + (i + 0.5) * dr, B = MU0 * p.N * p.I / (TAU * r); s += density(B) * TAU * r * dr * h; }
      return s;
    }
    var R = p.r / 100, l = p.l / 100, d = R / n, Bs = MU0 * p.N * p.I / l;
    for (var k = 0; k < n; k++) { var rr = (k + 0.5) * d; s += density(Bs) * TAU * rr * d * l; }
    return s;
  }
  // Corriente para guardar U (J) en una inductancia L (H).
  function currentFor(U, L) { return Math.sqrt(2 * U / L); }
  // Circuito LC (detalle): frecuencia y energía que oscila entre C y L.
  function lc(L, C) { var w = 1 / Math.sqrt(L * C); return { omega: w, f: w / TAU, T: TAU / w }; }

  // Reto. p = { kind: 'sol' | 'toroid', N, r, l | a, b, h, I, Ut (mJ) }. ask: 'U' (mJ) · 'u' (J/m³) · 'I' (A).
  function answers(ask, p) {
    var out = {}, s = p.kind === 'toroid' ? toroid(p.N, p.a, p.b, p.h, p.I) : solenoid(p.N, p.r, p.l, p.I);
    if (ask === 'U') {
      out.truth = s.UL * 1000; out.noHalf = 2 * out.truth; out.noSquare = out.truth / p.I; out.cm3 = out.truth * 1e6;
      if (p.kind === 'toroid') out.avgB = density(s.Bm) * s.V * 1000;
    } else if (ask === 'u') {
      var B = p.kind === 'toroid' ? s.Ba : s.B;
      out.truth = density(B); out.noHalf = 2 * out.truth; out.noSquare = B / (2 * MU0); out.mT = out.truth * 1e6;
    } else {
      var I = currentFor(p.Ut / 1000, s.L);
      out.truth = I; out.noSqrt = I * I; out.noTwo = I / Math.SQRT2;
    }
    return out;
  }
  function close(a, b, tol) { return Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-30); }
  function diagnose(ask, p, student) {
    if (!isFinite(student)) return 'bad';
    var r = answers(ask, p), tol = 0.01;
    if (close(student, r.truth, tol)) return 'ok';
    var keys = Object.keys(r).filter(function (k) { return k !== 'truth'; });
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (!isFinite(r[k]) || close(r[k], r.truth, 0.02)) continue;
      if (close(student, r[k], tol)) return k;
    }
    return 'bad';
  }

  window.LabMath.menergy = {
    MU0: MU0, density: density, solenoid: solenoid, toroid: toroid, coax: coax, integrate: integrate,
    currentFor: currentFor, lc: lc, answers: answers, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var MSG = {
    ok: ['Coincide', 'Tu resultado es el del lab.'],
    noHalf: ['Falta el ½', 'La energía es U = ½LI², y la densidad u = B²/2μ₀.'],
    noSquare: ['Falta elevar al cuadrado', 'La energía va con I² (y la densidad con B²).'],
    cm3: ['Revisa el volumen', 'El volumen va en m³: 1 cm³ = 10⁻⁶ m³. Pasa r, ℓ (o a, b, h) a metros.'],
    mT: ['Revisa las unidades de B', 'Para obtener J/m³, B va en teslas: 1 mT = 10⁻³ T.'],
    noSqrt: ['Falta la raíz', 'De U = ½LI² sale I² = 2U/L: saca la raíz.'],
    noTwo: ['Falta el 2', 'I = √(2U/L).'],
    avgB: ['El campo del toroide no es uniforme', 'B = μ₀NI/2πr cambia con r: hay que integrar u·2πrh dr, o usar U = ½LI² con L = μ₀N²h ln(b/a)/2π.'],
    bad: ['No coincide', 'U = ½LI² = ∫u dV con u = B²/2μ₀. Solenoide: L = μ₀N²A/ℓ. Toroide: L = μ₀N²h ln(b/a)/2π.']
  };
  var ASKS = [['U', 'la energía U (en mJ)'], ['u', 'la densidad u (en J/m³; toroide: en r = a)'], ['I', 'la corriente para guardar U* (en A)']];

  window.Labs['magnetic-energy'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var checked = false;

    var kindSel = UI.select({ label: 'Geometría', options: ['Solenoide', 'Toroide de sección rectangular'] });
    var S = {
      N: UI.slider({ label: 'Vueltas N', min: 100, max: 2000, step: 100, value: 500 }, changed),
      I: UI.slider({ label: 'Corriente I', min: 0.5, max: 10, step: 0.5, value: 3, unit: 'A' }, changed),
      r: UI.slider({ label: 'Radio r', min: 0.5, max: 4, step: 0.5, value: 2, unit: 'cm' }, changed),
      l: UI.slider({ label: 'Largo ℓ', min: 5, max: 50, step: 5, value: 20, unit: 'cm' }, changed),
      a: UI.slider({ label: 'Radio interior a', min: 2, max: 10, step: 1, value: 4, unit: 'cm' }, changed),
      b: UI.slider({ label: 'Radio exterior b', min: 3, max: 20, step: 1, value: 8, unit: 'cm' }, changed),
      hh: UI.slider({ label: 'Alto h', min: 1, max: 10, step: 1, value: 3, unit: 'cm' }, changed),
      n: UI.slider({ label: 'Capas de la integral numérica', min: 1, max: 60, step: 1, value: 6 }, changed)
    };
    var askSel = UI.select({ label: '¿Qué calculas?', options: ASKS.map(function (k) { return k[1]; }) });
    var target = UI.slider({ label: 'Energía objetivo U*', min: 1, max: 500, step: 1, value: 50, unit: 'mJ' }, changed);
    var data = h('p', { class: 'lab-note rc-data' });
    var aIn = UI.input({ label: 'Tu resultado', type: 'text', inputmode: 'decimal', mono: false, hint: 'SI: longitudes en m, B en T. Notación científica: <code>4.5e2</code>.' });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts rc-facts' });
    var scene = UI.svg(640, 260, 'Geometría con la densidad de energía sombreada');
    var bars = UI.svg(640, 130, 'Energía calculada de dos formas');
    var plot = UI.svg(640, 220, 'Densidad de energía contra el radio');
    var title = h('figcaption', { class: 'lab-board__title sheet__title' }, ['Energía en el campo magnético']);
    var plotNote = h('p', { class: 'lab-note' });
    var leg = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--ref' }), '½LI²']),
      h('li', {}, [h('i', { class: 'sw sw--trace' }), '∫u dV (capas)']),
      h('li', {}, [h('i', { class: 'sw sw--aux' }), 'densidad u(r)'])
    ]);

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls rc-controls', novalidate: true }, [
        kindSel.node, S.N.node, S.I.node, S.r.node, S.l.node, S.a.node, S.b.node, S.hh.node, S.n.node,
        h('p', { class: 'lab-field__label rc-head' }, ['Reto']),
        askSel.node, target.node, data, aIn.node, h('div', { class: 'lab-buttons' }, [run]), note, verdict,
        h('p', { class: 'lab-field__label rc-head' }, ['Tablero']),
        facts
      ]),
      h('figure', { class: 'lab-board' }, [title, scene, bars, plot, leg, plotNote])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    aIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    [kindSel, askSel].forEach(function (s) { s.input.addEventListener('change', function () { verdict.hidden = true; checked = false; draw(); }); });

    function changed() { if (checked) check(); else draw(); }
    function kind() { return kindSel.input.value === '1' ? 'toroid' : 'sol'; }
    function ask() { return (ASKS[+askSel.input.value] || ASKS[0])[0]; }
    function params() {
      var a = S.a.get(), b = Math.max(S.b.get(), a + 1);
      return { kind: kind(), N: S.N.get(), I: S.I.get(), r: S.r.get(), l: S.l.get(), a: a, b: b, h: S.hh.get(), Ut: target.get() };
    }

    function el(svg, name, attrs, txt) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (txt != null) n.textContent = txt;
      svg.appendChild(n);
      return n;
    }
    function tx(svg, x0, y0, s, anchor, size) { return el(svg, 'text', { x: x0, y: y0, 'class': 'ann', 'text-anchor': anchor || 'middle', 'font-size': size || 17 }, s); }
    function path(svg, d, cls, w, extra) {
      var a = { d: d, 'class': cls, 'stroke-width': w || 2.2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
      Object.keys(extra || {}).forEach(function (k) { a[k] = extra[k]; });
      return el(svg, 'path', a);
    }

    function drawScene(p) {
      scene.innerHTML = '';
      var g = el(scene, 'g', { 'class': 'sketch' });
      if (p.kind === 'sol') {
        var len = 120 + p.l * 7, x0 = 320 - len / 2, cy = 120, ry = 20 + p.r * 18, s = solenoid(p.N, p.r, p.l, p.I);
        var op = Math.min(0.85, 0.15 + Math.log10(1 + s.u) / 6);
        el(g, 'rect', { x: x0, y: cy - ry, width: len, height: 2 * ry, 'class': 'area-fill', opacity: op.toFixed(2) });
        var turns = Math.max(6, Math.min(28, Math.round(p.N / 70))), dx = len / turns;
        for (var i = 0; i < turns; i++) el(g, 'ellipse', { cx: (x0 + dx * (i + 0.5)).toFixed(1), cy: cy, rx: (dx * 0.42).toFixed(1), ry: ry.toFixed(1), 'class': 'ref', fill: 'none', 'stroke-width': 2.2 });
        tx(g, 320, cy + ry + 28, 'u = B²/2μ₀ = ' + UI.fmt(s.u, 4) + ' J/m³ (uniforme adentro)', 'middle', 16);
        tx(g, 320, 248, 'volumen = Aℓ = ' + UI.fmt(s.V * 1e6, 4) + ' cm³', 'middle', 16);
      } else {
        // Sección transversal del toroide: dos rectángulos (izquierdo y derecho) sombreados por capas.
        var t = toroid(p.N, p.a, p.b, p.h, p.I), sc = 220 / (2 * p.b), cx = 320, cy2 = 120, hpx = Math.max(16, p.h * sc), n = 12;
        for (var k = 0; k < n; k++) {
          var r0 = p.a + (p.b - p.a) * k / n, r1v = p.a + (p.b - p.a) * (k + 1) / n, rm = (r0 + r1v) / 2 / 100, u = density(t.Bfield(rm));
          var opk = Math.min(0.85, 0.12 + 0.7 * u / t.ua);
          [1, -1].forEach(function (sd) {
            var xa = cx + sd * r0 * sc, xb = cx + sd * r1v * sc;
            el(g, 'rect', { x: Math.min(xa, xb).toFixed(1), y: (cy2 - hpx / 2).toFixed(1), width: Math.abs(xb - xa).toFixed(1), height: hpx.toFixed(1), 'class': 'area-fill', opacity: opk.toFixed(2) });
          });
        }
        [1, -1].forEach(function (sd) {
          el(g, 'rect', { x: (sd > 0 ? cx + p.a * sc : cx - p.b * sc).toFixed(1), y: (cy2 - hpx / 2).toFixed(1), width: ((p.b - p.a) * sc).toFixed(1), height: hpx.toFixed(1), 'class': 'ref', fill: 'none', 'stroke-width': 2.6 });
        });
        path(g, 'M' + cx + ' 30V210', 'axis', 1.4, { 'stroke-dasharray': '5 6' });
        tx(g, cx + 6, 26, 'eje', 'start', 14);
        tx(g, cx + p.a * sc, cy2 + hpx / 2 + 22, 'a', 'middle', 16);
        tx(g, cx + p.b * sc, cy2 + hpx / 2 + 22, 'b', 'middle', 16);
        tx(g, 320, 248, 'más energía cerca del radio interior: u ∝ 1/r²', 'middle', 16);
      }
    }

    function drawBars(p) {
      bars.innerHTML = '';
      var g = el(bars, 'g', { 'class': 'sketch' });
      var UL = p.kind === 'toroid' ? toroid(p.N, p.a, p.b, p.h, p.I).UL : solenoid(p.N, p.r, p.l, p.I).UL;
      var Ui = integrate(p.kind === 'toroid' ? 'toroid' : 'sol', p, S.n.get()), mx = Math.max(UL, Ui) * 1.1, w = 400;
      el(g, 'rect', { x: 200, y: 22, width: (w * UL / mx).toFixed(1), height: 26, 'class': 'box-ref' });
      el(g, 'rect', { x: 200, y: 72, width: (w * Ui / mx).toFixed(1), height: 26, 'class': 'box-trace' });
      tx(g, 192, 41, '½LI² = ' + UI.fmt(UL * 1000, 5) + ' mJ', 'end', 15);
      tx(g, 192, 91, '∫u dV = ' + UI.fmt(Ui * 1000, 5) + ' mJ', 'end', 15);
      tx(g, 200, 122, S.n.get() + ' capas · diferencia ' + UI.fmt(100 * Math.abs(Ui - UL) / UL, 3) + ' %', 'start', 14);
    }

    function drawPlot(p) {
      if (p.kind === 'sol') {
        var s = solenoid(p.N, p.r, p.l, p.I), R = p.r;
        var P = window.LabPlot(plot, { x: [0, R * 1.6], y: [0, s.u * 1.3] });
        P.clear().grid().axes();
        P.curve(function (x) { return x <= R ? s.u : 0; }, 'aux', 3);
        P.label(0, s.u * 1.3, 'u (J/m³)', 'start', 15, 6, 22);
        P.label(R * 1.6, 0, 'r (cm)', 'end', 15, -4, -10);
        plotNote.textContent = 'Dentro del solenoide ideal la densidad es la misma en todo el volumen; afuera, cero. Por eso ∫u dV = u·Aℓ, y sale exactamente ½LI².';
      } else {
        var t = toroid(p.N, p.a, p.b, p.h, p.I);
        var Q = window.LabPlot(plot, { x: [0, p.b * 1.15], y: [0, t.ua * 1.2] });
        Q.clear().grid().axes();
        Q.curve(function (x) { return x >= p.a && x <= p.b ? density(t.Bfield(x / 100)) : 0; }, 'aux', 3);
        Q.label(0, t.ua * 1.2, 'u (J/m³)', 'start', 15, 6, 22);
        Q.label(p.b * 1.15, 0, 'r (cm)', 'end', 15, -4, -10);
        plotNote.textContent = 'En el toroide B = μ₀NI/2πr, así que u = B²/2μ₀ cae como 1/r². Con pocas capas la suma se equivoca; con más, se acerca a ½LI².';
      }
    }

    function draw() {
      var p = params(), tor = p.kind === 'toroid';
      S.r.node.hidden = tor; S.l.node.hidden = tor; S.a.node.hidden = !tor; S.b.node.hidden = !tor; S.hh.node.hidden = !tor;
      target.node.hidden = ask() !== 'I';
      title.textContent = tor ? 'Toroide: el campo cambia con r' : 'Solenoide: campo uniforme';
      drawScene(p); drawBars(p); drawPlot(p);
      var k = ask();
      data.textContent = 'Datos: N = ' + p.N + ', I = ' + p.I + ' A, ' + (tor ? 'a = ' + p.a + ' cm, b = ' + p.b + ' cm, h = ' + p.h + ' cm' : 'r = ' + p.r + ' cm, ℓ = ' + p.l + ' cm') + (k === 'I' ? ', U* = ' + p.Ut + ' mJ.' : '.');
      var rows;
      if (tor) {
        var t = toroid(p.N, p.a, p.b, p.h, p.I);
        rows = [['L = μ₀N²h ln(b/a)/2π', UI.fmt(t.L * 1000, 4) + ' mH'], ['B en r = a', UI.fmt(t.Ba * 1000, 4) + ' mT'], ['B en r = b', UI.fmt(t.Bb * 1000, 4) + ' mT'],
          ['u en r = a', UI.fmt(t.ua, 4) + ' J/m³'], ['U = ½LI²', UI.fmt(t.UL * 1000, 4) + ' mJ'], ['con B del radio medio (mal)', UI.fmt(density(t.Bm) * t.V * 1000, 4) + ' mJ']];
      } else {
        var s = solenoid(p.N, p.r, p.l, p.I);
        rows = [['L = μ₀N²A/ℓ', UI.fmt(s.L * 1000, 4) + ' mH'], ['B adentro', UI.fmt(s.B * 1000, 4) + ' mT'], ['u = B²/2μ₀', UI.fmt(s.u, 4) + ' J/m³'],
          ['volumen Aℓ', UI.fmt(s.V, 4) + ' m³'], ['u·Aℓ', UI.fmt(s.Uu * 1000, 4) + ' mJ'], ['½LI²', UI.fmt(s.UL * 1000, 4) + ' mJ']];
      }
      facts.innerHTML = '';
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    function parse(s) { return window.CBExercises ? window.CBExercises.parseNumber(s) : parseFloat(String(s).replace(',', '.')); }
    function check() {
      var val = parse(aIn.input.value), p = params(), k = ask();
      var r = diagnose(k, p, val), msg = MSG[r] || MSG.bad, truth = answers(k, p).truth;
      UI.verdict(verdict, r === 'ok' ? 'ok' : r === 'bad' ? 'bad' : 'warn', msg[0], msg[1] + (r === 'ok' ? '' : ' Valor del lab: ' + UI.fmt(truth, 4) + '.'));
      checked = true;
      draw();
    }

    // Ejemplo cargado: un compañero calculó U = LI² (sin el ½).
    var p0 = params();
    aIn.input.value = UI.fmt(answers('U', p0).noHalf, 4);
    note.textContent = 'Ejemplo cargado: así calculó un compañero la energía del solenoide, en mJ. ¿Ves el error? Luego sube las capas de la integral o cambia al toroide.';
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
