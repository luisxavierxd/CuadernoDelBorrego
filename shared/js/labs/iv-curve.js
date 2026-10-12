/* =====================================================================
   Lab iv-curve (Física 2 · S11): la curva I–V de un elemento, punto por punto.
   Un elemento (resistor óhmico, alambre ρL/A, foco incandescente o diodo) se
   conecta a una fuente variable; el alumno mueve V y cada lectura del
   amperímetro se vuelve un punto de la curva. Para el resistor y el alambre
   es una recta de pendiente 1/R (el lab la ajusta por mínimos cuadrados); el
   foco se curva porque su filamento se calienta; el diodo casi no conduce
   hasta ~0.7 V. Reto: R del alambre, I, P o R = V/I en el punto; el «casi»:
     diam    usó el diámetro como si fuera el radio (R sale 4 veces más chica)
     mm2     dejó el área en mm² (R sale 10⁶ veces más chica)
     inv     invirtió L/A (ρA/L)
     VR, RV  I = V·R o I = R/V
     mA      dio la corriente en mA (o multiplicó por mA) donde se pedían A o W
     VI      R = V·I en lugar de V/I
     slope   dio la pendiente I/V (que es 1/R) en lugar de R
     cold    usó la resistencia en frío del foco (R₀) en lugar de la caliente
     IR, V2R olvidó el cuadrado en I²R o V²/R (o lo puso mal)
   LabMath.ohm es puro y trabaja en SI (V, A, Ω, W, m, m²).
   ===================================================================== */
(function () {
  var E = 1.60e-19;
  // OpenStax, University Physics Vol. 2, tabla 9.1 (ρ a 20 °C y α). n: electrones libres por m³.
  var MAT = {
    cobre: { name: 'cobre', rho: 1.72e-8, alpha: 3.9e-3, n: 8.47e28 },
    aluminio: { name: 'aluminio', rho: 2.65e-8, alpha: 3.9e-3, n: 1.81e29 },
    nicromo: { name: 'nicromo', rho: 1.00e-6, alpha: 0.4e-3, n: null },
    tungsteno: { name: 'tungsteno', rho: 5.6e-8, alpha: 4.5e-3, n: null }
  };
  // Foco: filamento de tungsteno que se enfría con una conductancia térmica h (W/K).
  var BULB = { R0: 20, alpha: 4.5e-3, h: 3.6e-4, T0: 20 };
  // Diodo de silicio (Shockley): I = Is (e^{V/(nV_T)} − 1).
  var DIODE = { Is: 1e-9, nVT: 0.05 };

  /* ------------------------- Matemática pura ------------------------- */
  function area(d) { return Math.PI * d * d / 4; }                        // d: diámetro en m
  function resistance(rho, L, A) { return rho * L / A; }
  function wireR(rho, L, dmm) { return resistance(rho, L, area(dmm * 1e-3)); }   // diámetro en mm
  function current(V, R) { return V / R; }
  // Las tres formas de la potencia en un resistor.
  function powers(V, R) { var I = V / R; return { I: I, IV: I * V, I2R: I * I * R, V2R: V * V / R }; }
  function electronsPerSecond(I, q) { return I / (q || E); }
  function density(I, A) { return I / A; }
  function drift(I, n, A, q) { return I / (n * (q || E) * A); }
  function RT(R0, alpha, dT) { return R0 * (1 + alpha * dT); }
  function tempRise(R0, R, alpha) { return (R / R0 - 1) / alpha; }
  function energyKWh(PW, hours) { return PW * hours / 1000; }
  function cost(PW, hoursPerDay, days, price) {
    var kWh = energyKWh(PW, hoursPerDay * days);
    return { kWh: kWh, pesos: kWh * price };
  }
  function opts(base, o) { var r = {}; Object.keys(base).forEach(function (k) { r[k] = o && o[k] != null ? o[k] : base[k]; }); return r; }
  // Foco en equilibrio: R = R₀(1 + αΔT) y P = V²/R = hΔT ⇒ R² − R₀R − R₀αV²/h = 0.
  function bulbR(V, b) {
    b = opts(BULB, b);
    return (b.R0 + Math.sqrt(b.R0 * b.R0 + 4 * b.R0 * b.alpha * V * V / b.h)) / 2;
  }
  function bulbT(V, b) { b = opts(BULB, b); return b.T0 + V * V / (bulbR(V, b) * b.h); }
  function diodeI(V, d) { d = opts(DIODE, d); return d.Is * (Math.exp(V / d.nVT) - 1); }

  // Corriente del elemento con la fuente en V. p: { R } · { mat, L, d (mm) } · { R0 } · {}.
  function iv(elem, p, V) {
    if (elem === 'resistor') return V / p.R;
    if (elem === 'wire') return V / wireR(MAT[p.mat].rho, p.L, p.d);
    if (elem === 'bulb') return V / bulbR(V, { R0: p.R0 });
    if (elem === 'diode') return diodeI(V);
    return NaN;
  }
  // Resistencia V/I en el punto de operación (en el resistor y el alambre no depende de V).
  function rAt(elem, p, V) {
    if (elem === 'resistor') return p.R;
    if (elem === 'wire') return wireR(MAT[p.mat].rho, p.L, p.d);
    if (elem === 'bulb') return bulbR(V, { R0: p.R0 });
    return V / diodeI(V);
  }
  // Recta de mínimos cuadrados I = mV + b sobre puntos [[V, I], …].
  function fit(pts) {
    var n = pts.length, sx = 0, sy = 0, sxx = 0, sxy = 0;
    if (n < 2) return { m: NaN, b: NaN };
    pts.forEach(function (q) { sx += q[0]; sy += q[1]; sxx += q[0] * q[0]; sxy += q[0] * q[1]; });
    var den = n * sxx - sx * sx;
    if (!(Math.abs(den) > 0)) return { m: NaN, b: NaN };
    var m = (n * sxy - sx * sy) / den;
    return { m: m, b: (sy - m * sx) / n };
  }

  // Respuesta real y errores típicos de cada pregunta del reto (SI).
  // kind: 'Rwire' (ρL/A) · 'I' (corriente) · 'P' (potencia) · 'R' (V/I en el punto).
  function answers(kind, elem, p, V) {
    var I = iv(elem, p, V), R = rAt(elem, p, V), out = {};
    if (kind === 'Rwire') {
      var m = MAT[p.mat], A = area(p.d * 1e-3);
      out.truth = resistance(m.rho, p.L, A);
      out.diam = resistance(m.rho, p.L, Math.PI * Math.pow(p.d * 1e-3, 2));
      out.mm2 = resistance(m.rho, p.L, area(p.d));
      out.inv = m.rho * A / p.L;
      return out;
    }
    if (kind === 'I') { out.truth = I; out.VR = V * R; out.RV = R / V; out.mA = I * 1000; return out; }
    if (kind === 'R') {
      out.truth = V / I; out.VI = V * I; out.slope = I / V;
      if (elem === 'bulb') out.cold = p.R0;
      return out;
    }
    out.truth = V * I; out.IR = I * R; out.VR = V / R; out.V2R = V * V * R; out.mA = V * I * 1000;
    if (elem === 'bulb') out.cold = V * V / p.R0;
    return out;
  }
  function close(a, b, tol) { return Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-30); }
  // Un error solo cuenta si su valor se distingue del real (2 %).
  function diagnose(kind, elem, p, V, student) {
    if (!isFinite(student)) return 'bad';
    var r = answers(kind, elem, p, V), tol = 0.01;
    if (close(student, r.truth, tol)) return 'ok';
    var keys = Object.keys(r).filter(function (k) { return k !== 'truth'; });
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (!isFinite(r[k]) || close(r[k], r.truth, 0.02)) continue;
      if (close(student, r[k], tol)) return k;
    }
    return 'bad';
  }

  window.LabMath.ohm = {
    E: E, MAT: MAT, BULB: BULB, DIODE: DIODE,
    area: area, resistance: resistance, wireR: wireR, current: current, powers: powers,
    electronsPerSecond: electronsPerSecond, density: density, drift: drift,
    RT: RT, tempRise: tempRise, energyKWh: energyKWh, cost: cost,
    bulbR: bulbR, bulbT: bulbT, diodeI: diodeI, iv: iv, rAt: rAt, fit: fit,
    answers: answers, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var MSG = {
    ok: ['Coincide', 'Tu resultado es el del lab.'],
    diam: ['El diámetro no es el radio', 'El área es A = πr² con r = d/2, o sea A = πd²/4. Con el diámetro como radio el área sale 4 veces más grande y R, 4 veces más chica.'],
    mm2: ['El área en m²', 'Dejaste el área en mm². Pasa el diámetro a metros antes de calcularla: 1 mm² = 10⁻⁶ m².'],
    inv: ['Lo invertiste', 'R crece con el largo y baja con el área: R = ρL/A, no ρA/L.'],
    VR: ['Divide, no multipliques', 'De V = IR se despeja I = V/R. Y la potencia es V²/R, no V/R.'],
    RV: ['Al revés', 'De V = IR se despeja I = V/R, no R/V.'],
    mA: ['Revisa las unidades', 'Usaste la corriente en mA. Pásala a amperes (1 mA = 10⁻³ A) antes de calcular: la respuesta va en A o en W.'],
    VI: ['R = V/I, no V·I', 'La resistencia es el cociente V/I. El producto V·I es la potencia.'],
    slope: ['Esa es la pendiente', 'En la gráfica I contra V, la pendiente I/V es 1/R. La resistencia es V/I.'],
    cold: ['El foco está caliente', 'Usaste la resistencia en frío R₀. Con el filamento caliente R es mucho mayor: usa V/I del punto de operación.'],
    IR: ['Falta un factor', 'I·R es el voltaje, no la potencia. P = IV = I²R = V²/R.'],
    V2R: ['V² entre R', 'La potencia es P = V²/R: divide entre R, no multipliques.'],
    bad: ['No coincide', 'Lee V e I en los medidores. R = V/I, I = V/R y P = IV = I²R = V²/R; para el alambre, R = ρL/A con A = πd²/4 en m².']
  };
  var ELEMS = ['resistor', 'wire', 'bulb', 'diode'];
  var KINDS = {
    resistor: [['I', 'I con este V (en A)'], ['P', 'P disipada (en W)'], ['R', 'R = V/I con los medidores (en Ω)']],
    wire: [['Rwire', 'R del alambre, ρL/A (en Ω)'], ['I', 'I con este V (en A)'], ['P', 'P disipada (en W)']],
    bulb: [['R', 'R del foco en este punto (en Ω)'], ['P', 'P del foco (en W)']],
    diode: [['R', 'R = V/I en este punto (en Ω)'], ['P', 'P en el diodo (en W)']]
  };
  var MATS = ['nicromo', 'cobre', 'aluminio'];
  function sci(v, d) {
    if (!isFinite(v)) return '—';
    if (v === 0) return '0';
    var n = Math.floor(Math.log10(Math.abs(v)));
    if (n >= -2 && n <= 4) return String(Number(v.toPrecision(d || 3)));
    var m = v / Math.pow(10, n);
    return m.toFixed((d || 3) - 1) + ' × 10' + String(n).replace('-', '⁻').replace(/\d/g, function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]; });
  }

  window.Labs['iv-curve'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, M = window.LabMath.ohm;
    var s0 = cfg.start || {};
    var pts = [], checked = false;

    var eSel = UI.select({ label: 'Elemento', options: ['Resistor (óhmico)', 'Alambre (R = ρL/A)', 'Foco incandescente', 'Diodo de silicio'] });
    var mSel = UI.select({ label: 'Material del alambre', options: ['Nicromo (ρ = 1.00 × 10⁻⁶ Ω·m)', 'Cobre (ρ = 1.72 × 10⁻⁸ Ω·m)', 'Aluminio (ρ = 2.65 × 10⁻⁸ Ω·m)'] });
    var fmt2 = function (v) { return v.toFixed(2); };
    var S = {
      R: UI.slider({ label: 'Resistencia R', min: 10, max: 500, step: 10, value: s0.R || 100, unit: 'Ω' }, changed),
      L: UI.slider({ label: 'Largo L', min: 1, max: 100, step: 1, value: s0.L || 10, unit: 'm' }, changed),
      d: UI.slider({ label: 'Diámetro d', min: 0.1, max: 2, step: 0.05, value: s0.d || 0.5, unit: 'mm', fmt: fmt2 }, changed),
      R0: UI.slider({ label: 'Resistencia en frío R₀', min: 10, max: 60, step: 2, value: s0.R0 || 20, unit: 'Ω' }, changed),
      V: UI.slider({ label: 'Voltaje de la fuente V', min: -12, max: 12, step: 0.5, value: 6, unit: 'V', fmt: function (v) { return v.toFixed(2).replace(/\.?0+$/, ''); } }, moveV)
    };
    var SHOW = { resistor: ['R'], wire: ['L', 'd'], bulb: ['R0'], diode: [] };
    var kSel = UI.select({ label: '¿Qué calculas?', options: ['—'] });
    var data = h('p', { class: 'lab-note iv-data' });
    var aIn = UI.input({ label: 'Tu resultado', type: 'number', step: 'any', inputmode: 'decimal', mono: false, hint: 'Usa los valores de los medidores y los datos de arriba. Sin prefijos: Ω, A o W.' });
    var run = UI.button('Comprobar', 'primary', check);
    var sweep = UI.button('Trazar toda la curva', 'ghost', function () { sweepAll(); draw(); });
    var wipe = UI.button('Borrar puntos', 'ghost', function () { pts = []; draw(); });
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts iv-facts' });
    var fitNote = h('p', { class: 'lab-note iv-fit' });
    var circ = UI.svg(640, 200, 'Circuito: fuente variable, amperímetro, el elemento y un voltímetro en paralelo');
    circ.classList.add('iv-circuit');
    var plot = UI.svg(640, 380, 'Curva corriente contra voltaje del elemento, punto por punto');
    var title = h('figcaption', { class: 'lab-board__title sheet__title' }, ['Curva I–V']);

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        eSel.node, mSel.node, S.R.node, S.L.node, S.d.node, S.R0.node, S.V.node,
        h('div', { class: 'lab-buttons' }, [sweep, wipe]),
        kSel.node, data, aIn.node, h('div', { class: 'lab-buttons' }, [run]), note, verdict,
        facts
      ]),
      h('figure', { class: 'lab-board' }, [
        title, circ, plot,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'puntos medidos']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'punto actual']),
          h('li', { class: 'iv-legfit' }, [h('i', { class: 'sw sw--trace sw--dashed' }), 'recta de mínimos cuadrados'])
        ]),
        fitNote
      ])
    ]));
    var form = mount.querySelector('form');
    form.addEventListener('submit', function (e) { e.preventDefault(); check(); });
    aIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    eSel.input.addEventListener('change', function () { setElem(); });
    mSel.input.addEventListener('change', changed);
    kSel.input.addEventListener('change', function () { verdict.hidden = true; checked = false; draw(); });

    function elem() { return ELEMS[+eSel.input.value] || 'resistor'; }
    function params() {
      var e = elem();
      if (e === 'resistor') return { R: S.R.get() };
      if (e === 'wire') return { mat: MATS[+mSel.input.value] || 'nicromo', L: S.L.get(), d: S.d.get() };
      if (e === 'bulb') return { R0: S.R0.get() };
      return {};
    }
    function vmax() { return elem() === 'diode' ? 1 : 12; }
    function kind() { var k = KINDS[elem()][+kSel.input.value]; return k ? k[0] : KINDS[elem()][0][0]; }
    function setElem() {
      var e = elem(), diode = e === 'diode';
      S.V.input.min = diode ? -1 : -12; S.V.input.max = diode ? 0.85 : 12; S.V.input.step = diode ? 0.05 : 0.5;
      S.V.set(diode ? 0.7 : 6);
      kSel.input.innerHTML = '';
      KINDS[e].forEach(function (k, i) { kSel.input.appendChild(h('option', { value: String(i) }, [k[1]])); });
      pts = []; verdict.hidden = true; checked = false;
      addPoint();
      draw();
    }
    function addPoint() {
      var V = S.V.get(), I = M.iv(elem(), params(), V);
      if (!isFinite(I)) return;
      pts = pts.filter(function (q) { return Math.abs(q[0] - V) > 1e-9; });
      pts.push([V, I]);
    }
    function sweepAll() {
      var lo = +S.V.input.min, hi = +S.V.input.max, st = +S.V.input.step, p = params(), e = elem();
      pts = [];
      for (var V = lo; V <= hi + 1e-9; V += st) { var v = +V.toFixed(4); pts.push([v, M.iv(e, p, v)]); }
    }
    function changed() { pts = []; addPoint(); if (checked) check(); else draw(); }
    function moveV() { addPoint(); if (checked) check(); else draw(); }

    function el(svg, name, attrs) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      svg.appendChild(n);
      return n;
    }
    function txt(svg, x, y, s, anchor, size) {
      var t = el(svg, 'text', { x: x, y: y, 'class': 'ann', 'text-anchor': anchor || 'middle', 'font-size': size || 17 });
      t.textContent = s;
      return t;
    }
    function path(svg, d, cls, w) { return el(svg, 'path', { d: d, 'class': cls, 'stroke-width': w || 2.2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }); }

    // Unidades de la corriente en la gráfica: mA si toda la curva cabe bajo 1 A.
    function iScale(e, p) {
      var top = Math.max(Math.abs(M.iv(e, p, +S.V.input.max)), Math.abs(M.iv(e, p, +S.V.input.min)));
      return top < 1 ? { k: 1000, u: 'mA' } : { k: 1, u: 'A' };
    }
    function fmtI(I) { return Math.abs(I) < 1 ? UI.fmt(I * 1000, 4) + ' mA' : UI.fmt(I, 4) + ' A'; }

    function drawCircuit(e, p, V, I) {
      circ.innerHTML = '';
      var yt = 40, yb = 150, xs = 70, xe = 430, xv = 560, xa = 250, cy = (yt + yb) / 2;
      // Cables y nodos.
      path(circ, 'M' + xs + ' ' + (cy - 18) + 'V' + yt + 'H' + (xa - 20) + 'M' + (xa + 20) + ' ' + yt + 'H' + xv + 'V' + (cy - 20) +
        'M' + xv + ' ' + (cy + 20) + 'V' + yb + 'H' + xs + 'V' + (cy + 18), 'axis');
      path(circ, 'M' + xe + ' ' + yt + 'V' + (cy - 30) + 'M' + xe + ' ' + (cy + 30) + 'V' + yb, 'axis');
      el(circ, 'circle', { cx: xe, cy: yt, r: 4.5, 'class': 'dot-ref' }); el(circ, 'circle', { cx: xe, cy: yb, r: 4.5, 'class': 'dot-ref' });
      // Fuente variable (placa larga = +, arriba) con la flecha de «ajustable».
      path(circ, 'M' + (xs - 20) + ' ' + (cy - 18) + 'H' + (xs + 20), 'ref', 3);
      path(circ, 'M' + (xs - 11) + ' ' + (cy - 6) + 'H' + (xs + 11), 'ref', 6);
      path(circ, 'M' + (xs - 20) + ' ' + (cy + 6) + 'H' + (xs + 20), 'ref', 3);
      path(circ, 'M' + (xs - 11) + ' ' + (cy + 18) + 'H' + (xs + 11), 'ref', 6);
      path(circ, 'M' + (xs - 26) + ' ' + (cy + 26) + 'L' + (xs + 24) + ' ' + (cy - 26) + 'M' + (xs + 13) + ' ' + (cy - 24) + 'L' + (xs + 24) + ' ' + (cy - 26) + 'L' + (xs + 22) + ' ' + (cy - 15), 'aux', 1.6);
      txt(circ, xs - 30, cy - 12, V >= 0 ? '+' : '−', 'end', 18);
      txt(circ, xs + 34, cy + 7, 'fuente', 'start', 19);
      // Amperímetro y voltímetro.
      el(circ, 'circle', { cx: xa, cy: yt, r: 20, 'class': 'axis', fill: 'none', 'stroke-width': 2.2 });
      txt(circ, xa, yt + 6, 'A', 'middle', 18);
      el(circ, 'circle', { cx: xv, cy: cy, r: 20, 'class': 'axis', fill: 'none', 'stroke-width': 2.2 });
      txt(circ, xv, cy + 6, 'V', 'middle', 18);
      // El elemento, vertical entre cy − 30 y cy + 30.
      var y0 = cy - 30, y1 = cy + 30, lab = '';
      if (e === 'resistor') {
        var zz = 'M' + xe + ' ' + y0;
        for (var i = 0; i < 6; i++) zz += 'L' + (xe + (i % 2 ? -9 : 9)) + ' ' + (y0 + 5 + i * 10);
        path(circ, zz + 'L' + xe + ' ' + y1, 'ref', 2.6);
        lab = 'R = ' + p.R + ' Ω';
      } else if (e === 'wire') {
        el(circ, 'rect', { x: xe - 5, y: y0, width: 10, height: y1 - y0, rx: 4, 'class': 'box-ref' });
        lab = 'alambre de ' + p.mat;
      } else if (e === 'bulb') {
        var glow = Math.max(0, Math.min(1, Math.abs(V * I) / 0.8));
        el(circ, 'circle', { cx: xe, cy: cy, r: 26, 'class': 'box-err', 'fill-opacity': (0.05 + 0.5 * glow).toFixed(2) });
        path(circ, 'M' + xe + ' ' + y0 + 'V' + (cy - 8) + 'C' + (xe + 16) + ' ' + (cy - 8) + ' ' + (xe + 16) + ' ' + (cy + 8) + ' ' + xe + ' ' + (cy + 8) + 'V' + y1, 'ref', 2);
        lab = 'foco';
      } else {
        path(circ, 'M' + (xe - 14) + ' ' + (cy - 12) + 'H' + (xe + 14) + 'L' + xe + ' ' + (cy + 12) + 'Z', 'ref', 2.4);
        path(circ, 'M' + (xe - 14) + ' ' + (cy + 12) + 'H' + (xe + 14) + 'M' + xe + ' ' + y0 + 'V' + (cy - 12) + 'M' + xe + ' ' + (cy + 12) + 'V' + y1, 'ref', 2.4);
        lab = 'diodo';
      }
      txt(circ, xe - 34, cy + 7, lab, 'end', 19);
      // Lecturas de los medidores, abajo, fuera del circuito.
      txt(circ, 14, 190, 'V = ' + UI.fmt(V, 3) + ' V', 'start', 20);
      txt(circ, 250, 190, 'I = ' + fmtI(I), 'middle', 20);
      txt(circ, 628, 190, 'P = ' + sci(V * I, 3) + ' W', 'end', 20);
    }

    function drawPlot(e, p, V, I) {
      var sc = iScale(e, p), vm = vmax(), lo = +S.V.input.min, hi = +S.V.input.max;
      var top = Math.max(Math.abs(M.iv(e, p, hi)), Math.abs(M.iv(e, p, lo))) * sc.k;
      var ylo = e === 'diode' ? -0.12 * top : -1.12 * top, yhi = 1.12 * top;
      var P = window.LabPlot(plot, { x: [-vm * 1.04, vm * 1.04], y: [ylo, yhi] });
      P.clear().grid().axes();
      var f = M.fit(pts);
      var lin = e === 'resistor' || e === 'wire';
      if (lin && pts.length >= 2 && isFinite(f.m)) P.curve(function (x) { return (f.m * x + f.b) * sc.k; }, 'trace', 2, '7 6');
      pts.forEach(function (q) { P.point(q[0], q[1] * sc.k, 'dot-ref', 4.5); });
      P.point(V, I * sc.k, 'dot-error', 7);
      P.label(-vm * 1.04, yhi, 'I (' + sc.u + ')', 'start', 15, 6, 4);
      // El diodo sube pegado a la derecha: ahí la etiqueta del eje va a la izquierda.
      if (e === 'diode') P.label(-vm * 1.04, 0, 'V (volts)', 'start', 15, 6, -12);
      else P.label(vm * 1.04, 0, 'V (volts)', 'end', 15, -4, -10);
      mount.querySelector('.iv-legfit').hidden = !lin;
      // Lo que dice la pendiente.
      if (lin) {
        fitNote.textContent = pts.length >= 2 && isFinite(f.m)
          ? 'Pendiente ajustada: ' + sci(f.m, 4) + ' A/V → 1/pendiente = ' + UI.fmt(1 / f.m, 4) + ' Ω. Es R: una recta que pasa por el origen.'
          : 'Mueve V para medir más puntos.';
      } else if (e === 'bulb') {
        fitNote.textContent = 'La curva se dobla: al subir V el filamento se calienta y R = V/I crece. No hay una sola pendiente.';
      } else {
        fitNote.textContent = 'El diodo casi no conduce hasta unos 0.7 V y en sentido inverso deja pasar casi nada.';
      }
    }

    function draw() {
      var e = elem(), p = params(), V = S.V.get(), I = M.iv(e, p, V);
      Object.keys(SHOW).forEach(function (k) { SHOW[k].forEach(function (n) { S[n].node.hidden = k !== e; }); });
      mSel.node.hidden = e !== 'wire';
      title.textContent = { resistor: 'Resistor: la curva es una recta', wire: 'Alambre: también es óhmico', bulb: 'Foco: la curva se dobla', diode: 'Diodo: conduce en un solo sentido' }[e];
      drawCircuit(e, p, V, I);
      drawPlot(e, p, V, I);
      // Datos del reto.
      var k = kind(), m = MAT[p.mat];
      data.textContent = k === 'Rwire' ? 'Datos: ρ = ' + sci(m.rho, 3) + ' Ω·m, L = ' + p.L + ' m, d = ' + p.d.toFixed(2) + ' mm.'
        : k === 'I' ? 'Datos: V = ' + UI.fmt(V, 3) + ' V' + (e === 'resistor' ? ', R = ' + p.R + ' Ω.' : '; R = ρL/A con ρ = ' + sci(m.rho, 3) + ' Ω·m, L = ' + p.L + ' m, d = ' + p.d.toFixed(2) + ' mm.')
        : 'Datos: lee V e I en los medidores' + (e === 'bulb' ? ' (R₀ = ' + p.R0 + ' Ω es la resistencia en frío).' : '.');
      // Valores del lab.
      var R = M.rAt(e, p, V), rows = [['V', UI.fmt(V, 4) + ' V'], ['I', fmtI(I)], ['R = V/I', V === 0 ? '—' : UI.fmt(R, 4) + ' Ω'],
        ['P = IV', sci(V * I, 4) + ' W'], ['P = I²R', V === 0 ? '0 W' : sci(I * I * R, 4) + ' W'], ['P = V²/R', V === 0 ? '0 W' : sci(V * V / R, 4) + ' W']];
      if (e === 'wire') {
        var A = M.area(p.d * 1e-3);
        rows.push(['A = πd²/4', sci(A, 4) + ' m²'], ['E = V/L', UI.fmt(V / p.L, 4) + ' V/m'], ['J = I/A', sci(I / A, 4) + ' A/m²']);
        if (m.n) rows.push(['deriva v_d = I/(neA)', sci(Math.abs(M.drift(I, m.n, A)), 3) + ' m/s']);
      }
      if (e === 'bulb') rows.push(['filamento', '≈ ' + Math.round(M.bulbT(V, { R0: p.R0 })) + ' °C'], ['R₀ (en frío)', p.R0 + ' Ω']);
      rows.push(['electrones por segundo', sci(Math.abs(M.electronsPerSecond(I)), 3)]);
      facts.innerHTML = '';
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    function check() {
      var val = parseFloat(String(aIn.input.value).replace(',', '.'));
      var e = elem(), V = S.V.get(), k = kind();
      if (V === 0 && k !== 'Rwire') { UI.verdict(verdict, 'warn', 'Sube el voltaje', 'Con V = 0 no pasa corriente: mueve V antes de calcular.'); checked = true; draw(); return; }
      var r = M.diagnose(k, e, params(), V, val);
      var msg = MSG[r] || MSG.bad;
      UI.verdict(verdict, r === 'ok' ? 'ok' : r === 'bad' ? 'bad' : 'warn', msg[0], msg[1]);
      checked = true;
      draw();
    }

    // Ejemplo cargado: alambre de nicromo; un compañero usó el diámetro como radio.
    eSel.input.value = String(Math.max(0, ELEMS.indexOf(s0.elem || 'wire')));
    setElem();
    // Unos puntos ya medidos, para que se vea la recta desde el principio.
    var vNow = s0.V != null ? s0.V : S.V.get();
    pts = [];
    [0, 2, 4].forEach(function (v) { S.V.set(v); addPoint(); });
    S.V.set(vNow); addPoint();
    kSel.input.value = '0';
    if (kind() === 'Rwire') {
      aIn.input.value = UI.fmt(M.answers('Rwire', 'wire', params(), S.V.get()).diam, 4);
      note.textContent = 'Ejemplo cargado: así calculó un compañero la resistencia del alambre. ¿Ves el error? Luego cambia a foco o diodo y traza su curva.';
    }
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
