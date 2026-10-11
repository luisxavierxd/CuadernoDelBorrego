/* =====================================================================
   Lab capacitor-plates (Física 2 · S09): capacitancia con deslizadores.
   Placas paralelas (d, A), cilíndrico (a, b, L) o esférico (a, b), con dieléctrico κ
   y una batería que se conecta (V fija) o se desconecta (Q fija). El lab sigue la
   cadena Q → E (Gauss) → V = ∫E·dl (integrada numéricamente) → C = Q/V y la
   compara con la fórmula cerrada. Reto: el alumno calcula C, Q o el nuevo V al
   duplicar d con la batería desconectada; el «casi» reconoce:
     cm2       dejó el área en cm² (C sale 10⁴ veces más grande)
     mm        dejó d en mm (C sale 1000 veces más chica)
     both      no convirtió ni cm² ni mm (C × 10)
     inverted  invirtió A/d (ε₀d/A)
     cmL, cm   dejó L o los radios en cm (C × 100)
     log10     usó log₁₀ en lugar de ln
     noTwoPi, noFourPi  olvidó 2π o 4π
     sum       usó ab/(a + b) en el esférico
     noKappa   olvidó el dieléctrico
     divide    calculó Q = C/V
     keptV, half  al desconectar y separar: creyó que V no cambia o que baja a la mitad
   LabMath.capacitor trabaja en SI (m, m², C, V, F); la UI muestra mm, cm², pF, nC.
   ===================================================================== */
(function () {
  var EPS0 = 8.85e-12, K = 8.99e9;

  /* ------------------------- Matemática pura ------------------------- */
  function kap(x) { return x == null ? 1 : x; }
  function plates(A, d, kappa) { return kap(kappa) * EPS0 * A / d; }
  function cylinder(a, b, L, kappa) { return 2 * Math.PI * kap(kappa) * EPS0 * L / Math.log(b / a); }
  function sphere(a, b, kappa) { return 4 * Math.PI * kap(kappa) * EPS0 * a * b / (b - a); }
  function isolated(R, kappa) { return 4 * Math.PI * kap(kappa) * EPS0 * R; }
  // p = { A, d } (placas), { a, b, L } (cilindro), { a, b } (esfera), { R } (esfera aislada); kappa opcional.
  function cap(geom, p) {
    if (geom === 'plates') return plates(p.A, p.d, p.kappa);
    if (geom === 'cylinder') return cylinder(p.a, p.b, p.L, p.kappa);
    if (geom === 'sphere') return sphere(p.a, p.b, p.kappa);
    if (geom === 'isolated') return isolated(p.R, p.kappa);
    return NaN;
  }
  // Campo entre los conductores por la ley de Gauss, con carga Q en el conductor +.
  // En placas no depende de la posición; en el cilindro y la esfera, r es la distancia al eje o al centro.
  function field(geom, p, Q, r) {
    var ke = kap(p.kappa) * EPS0;
    if (geom === 'plates') return Q / (ke * p.A);
    if (geom === 'cylinder') return Q / (2 * Math.PI * ke * p.L * r);
    if (geom === 'sphere' || geom === 'isolated') return Q / (4 * Math.PI * ke * r * r);
    return NaN;
  }
  // V₊ − V₋ = ∫ E·dl del conductor + al −, por Simpson. En el cilindro y la esfera se integra en
  // u = ln r (dr = r du), que reparte los puntos donde E cambia rápido; en la esfera aislada,
  // en t = 1/r (de 0 a 1/R), para llegar al infinito.
  function Vint(geom, p, Q, n) {
    n = n || 2000; if (n % 2) n++;
    var f, lo, hi;
    if (geom === 'plates') { lo = 0; hi = p.d; f = function (x) { return field(geom, p, Q, x); }; }
    else if (geom === 'isolated') { lo = 0; hi = 1 / p.R; f = function (t) { return t === 0 ? Q / (4 * Math.PI * kap(p.kappa) * EPS0) : field(geom, p, Q, 1 / t) / (t * t); }; }
    else { lo = Math.log(p.a); hi = Math.log(p.b); f = function (u) { var r = Math.exp(u); return field(geom, p, Q, r) * r; }; }
    var h = (hi - lo) / n, s = f(lo) + f(hi);
    for (var i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(lo + i * h);
    return s * h / 3;
  }
  // La capacitancia por el camino largo: Q de prueba → E por Gauss → V integrado → C = Q/V.
  // scale opcional: 1e12 la da en pF.
  function fromIntegral(geom, p, scale) { var Q = 1e-9; return Q / Vint(geom, p, Q) * (scale || 1); }
  // La carga que hace falta para que ∫E·dl valga V (V entre 1 C de prueba); scale 1e9 la da en nC.
  function charge(geom, p, V, scale) { return V / Vint(geom, p, 1) * (scale || 1); }

  // Batería conectada (mode 'V': V fija) o desconectada (mode 'Q': Q fija) al pasar de C0 a C1.
  function change(C0, C1, V0, mode) {
    var Q0 = C0 * V0, Q = mode === 'Q' ? Q0 : C1 * V0, V = mode === 'Q' ? Q0 / C1 : V0;
    return { Q0: Q0, U0: 0.5 * C0 * V0 * V0, C: C1, Q: Q, V: V, U: 0.5 * Q * V };
  }
  // Placas: cargadas a V0 con (A, d, κ) y luego cambiadas a (A2, d2, κ2) con la batería conectada o no.
  function platesChange(A, d, kappa, V0, mode, A2, d2, kappa2) {
    var C0 = plates(A, d, kappa), C1 = plates(A2 == null ? A : A2, d2 == null ? d : d2, kappa2 == null ? kappa : kappa2);
    var r = change(C0, C1, V0, mode);
    r.C0 = C0; r.E0 = V0 / d; r.E = r.V / (d2 == null ? d : d2);
    return r;
  }

  // Valores de C con cada error típico (en F).
  function capMistakes(geom, p) {
    var C = cap(geom, p), m = {};
    if (geom === 'plates') {
      m.cm2 = C * 1e4; m.mm = C * 1e-3; m.both = C * 10; m.inverted = kap(p.kappa) * EPS0 * p.d / p.A;
    } else if (geom === 'cylinder') {
      m.cmL = C * 100; m.log10 = C * Math.LN10; m.noTwoPi = C / (2 * Math.PI);
    } else if (geom === 'sphere') {
      m.cm = C * 100; m.sum = 4 * Math.PI * kap(p.kappa) * EPS0 * p.a * p.b / (p.a + p.b); m.noFourPi = C / (4 * Math.PI);
    }
    m.noKappa = C / kap(p.kappa);
    return m;
  }
  // Respuesta real y errores típicos de cada pregunta del reto (SI). kind: 'C' | 'Q' | 'Vd'.
  function answers(kind, geom, p, V) {
    var C = cap(geom, p), m = capMistakes(geom, p), out = {};
    if (kind === 'C') { out.truth = C; Object.keys(m).forEach(function (k) { out[k] = m[k]; }); return out; }
    if (kind === 'Q') {
      out.truth = C * V;
      Object.keys(m).forEach(function (k) { out[k] = m[k] * V; });
      out.divide = C / V;
      return out;
    }
    // Placas cargadas a V, se desconecta la batería y d se duplica: Q fija, C a la mitad.
    return { truth: platesChange(p.A, p.d, p.kappa, V, 'Q', null, 2 * p.d).V, keptV: V, half: V / 2 };
  }
  function close(a, b, tol) { return Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-30); }
  // student en SI. Un error solo cuenta si su valor se distingue del real (2 %).
  function diagnose(kind, geom, p, V, student) {
    if (!isFinite(student)) return 'bad';
    var r = answers(kind, geom, p, V), tol = 0.01;
    if (close(student, r.truth, tol)) return 'ok';
    var keys = Object.keys(r).filter(function (k) { return k !== 'truth'; });
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (!isFinite(r[k]) || close(r[k], r.truth, 0.02)) continue;
      if (close(student, r[k], tol)) return k;
    }
    return 'bad';
  }

  window.LabMath.capacitor = {
    EPS0: EPS0, K: K,
    plates: plates, cylinder: cylinder, sphere: sphere, isolated: isolated, cap: cap,
    field: field, Vint: Vint, fromIntegral: fromIntegral, charge: charge, change: change, platesChange: platesChange,
    capMistakes: capMistakes, answers: answers, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var W = 640, H = 440;
  var MSG = {
    ok: ['Coincide', 'Tu resultado es el del lab.'],
    cm2: ['El área en m²', 'Usaste el área en cm². Pásala a m² antes de dividir: 1 cm² = 10⁻⁴ m² (no 10⁻²).'],
    mm: ['La separación en metros', 'Dejaste d en milímetros. Pásala a metros: 1 mm = 10⁻³ m.'],
    both: ['Faltan las dos conversiones', 'Ni el área está en m² ni la separación en m. Convierte las dos: 1 cm² = 10⁻⁴ m² y 1 mm = 10⁻³ m.'],
    inverted: ['Lo invertiste', 'La capacitancia crece con el área y baja con la separación: C = κε₀A/d, no κε₀d/A.'],
    cmL: ['El largo en metros', 'Dejaste L en centímetros. En el cociente b/a las unidades se cancelan, pero L sí va en metros.'],
    cm: ['Los radios en metros', 'Dejaste a y b en centímetros. El cociente ab/(b − a) tiene unidades de longitud: pásalos a metros.'],
    log10: ['Es logaritmo natural', 'La integral de dr/r es ln r: usa ln(b/a), no log₁₀(b/a).'],
    noTwoPi: ['Falta el 2π', 'El área de la superficie gaussiana cilíndrica es 2πrL: C = 2πκε₀L / ln(b/a).'],
    noFourPi: ['Falta el 4π', 'El área de la esfera gaussiana es 4πr²: C = 4πκε₀ab / (b − a).'],
    sum: ['El denominador es b − a', 'Al integrar de a a b sale 1/a − 1/b = (b − a)/(ab): C = 4πκε₀ab / (b − a).'],
    noKappa: ['Te faltó el dieléctrico', 'El material entre los conductores multiplica la capacitancia: C = κ·C₀.'],
    divide: ['Q = CV, no C/V', 'De C = Q/V se despeja Q = C·V: multiplica.'],
    keptV: ['Con la batería desconectada, V cambia', 'Sin batería lo que no cambia es Q. Al duplicar d, C baja a la mitad y V = Q/C se duplica.'],
    half: ['Al revés', 'Duplicar d hace a C la mitad (C = ε₀A/d). Con Q fija, V = Q/C se duplica, no baja.'],
    bad: ['No coincide', 'Sigue la cadena: Q → E por Gauss → V = ∫E·dl → C = Q/V, con todo en metros. Para Q usa Q = C·V.']
  };
  var GEOMS = ['plates', 'cylinder', 'sphere'];
  var CHAIN = {
    plates: 'Gauss: $E = \\dfrac{Q}{\\kappa\\varepsilon_0 A}$ → $V = Ed$ → $C = \\dfrac{Q}{V} = \\dfrac{\\kappa\\varepsilon_0 A}{d}$',
    cylinder: 'Gauss: $E = \\dfrac{Q}{2\\pi\\kappa\\varepsilon_0 L r}$ → $V = \\displaystyle\\int_a^b E\\,dr$ → $C = \\dfrac{2\\pi\\kappa\\varepsilon_0 L}{\\ln(b/a)}$',
    sphere: 'Gauss: $E = \\dfrac{Q}{4\\pi\\kappa\\varepsilon_0 r^2}$ → $V = \\displaystyle\\int_a^b E\\,dr$ → $C = \\dfrac{4\\pi\\kappa\\varepsilon_0 ab}{b - a}$'
  };

  window.Labs['capacitor-plates'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, M = window.LabMath.capacitor;
    var s0 = cfg.start || {};
    var connected = true, Qfix = 0, Qref = null, Eref = null;

    var fmt1 = function (v) { return v.toFixed(1); };
    var gSel = UI.select({ label: 'Geometría', options: ['Placas paralelas', 'Cilíndrico (cable coaxial)', 'Esférico'] });
    var S = {
      A: UI.slider({ label: 'Área de cada placa A', min: 5, max: 400, step: 5, value: s0.A || 100, unit: 'cm²' }, refresh),
      d: UI.slider({ label: 'Separación d', min: 0.5, max: 10, step: 0.5, value: s0.d || 2, unit: 'mm', fmt: fmt1 }, refresh),
      ca: UI.slider({ label: 'Radio del alambre a', min: 0.5, max: 10, step: 0.5, value: 0.5, unit: 'mm', fmt: fmt1 }, function () { order('ca', 'cb'); }),
      cb: UI.slider({ label: 'Radio del forro b', min: 1, max: 40, step: 0.5, value: 2, unit: 'mm', fmt: fmt1 }, function () { order('cb', 'ca'); }),
      L: UI.slider({ label: 'Largo L', min: 10, max: 500, step: 10, value: 100, unit: 'cm' }, refresh),
      sa: UI.slider({ label: 'Radio interior a', min: 1, max: 20, step: 0.5, value: 5, unit: 'cm', fmt: fmt1 }, function () { order('sa', 'sb'); }),
      sb: UI.slider({ label: 'Radio exterior b', min: 1.5, max: 40, step: 0.5, value: 10, unit: 'cm', fmt: fmt1 }, function () { order('sb', 'sa'); }),
      k: UI.slider({ label: 'Constante dieléctrica', min: 1, max: 10, step: 0.5, value: s0.kappa || 1, fmt: fmt1 }, refresh),
      V: UI.slider({ label: 'Voltaje de la batería', min: 1, max: 24, step: 1, value: s0.V || 12, unit: 'V' }, refresh)
    };
    var SHOW = { plates: ['A', 'd'], cylinder: ['ca', 'cb', 'L'], sphere: ['sa', 'sb'] };
    var bSel = UI.select({ label: 'Estado de la batería', options: ['Conectada (V fija)', 'Desconectada (Q fija)'] });
    var kSel = UI.select({ label: '¿Qué calculas?', options: ['C (en pF)', 'Q con la batería conectada (en nC)', 'V al desconectar y duplicar d (en V)'] });
    var aIn = UI.input({ label: 'Tu resultado', type: 'number', step: 'any', inputmode: 'decimal', mono: false, hint: 'ε₀ = 8.85 × 10⁻¹² C²/(N·m²). 1 pF = 10⁻¹² F, 1 nC = 10⁻⁹ C.' });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var chain = h('p', { class: 'lab-note cp-chain' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(W, H, 'Capacitor con sus cargas, el campo entre los conductores y la batería');
    var title = h('figcaption', { class: 'lab-board__title sheet__title' }, ['Mueve los deslizadores']);

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        gSel.node, S.A.node, S.d.node, S.ca.node, S.cb.node, S.L.node, S.sa.node, S.sb.node, S.k.node, S.V.node, bSel.node,
        kSel.node, aIn.node, h('div', { class: 'lab-buttons' }, [run]), note, verdict,
        h('details', { class: 'cp-details' }, [h('summary', {}, ['Ver los valores del lab']), facts])
      ]),
      h('figure', { class: 'lab-board' }, [
        title, svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'campo E']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'conductor +']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'conductor −']),
          h('li', { class: 'cp-gauss' }, [h('i', { class: 'sw sw--trace sw--dashed' }), 'superficie gaussiana'])
        ]),
        chain
      ])
    ]));
    var form = mount.querySelector('form');
    form.addEventListener('submit', function (e) { e.preventDefault(); check(); });
    aIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    kSel.input.addEventListener('change', function () { verdict.hidden = true; checked = false; draw(); });
    gSel.input.addEventListener('change', function () {
      connected = true; bSel.input.value = '0'; Qref = null; Eref = null;
      if (geom() !== 'plates' && kSel.input.value === '2') kSel.input.value = '0';
      verdict.hidden = true; checked = false; draw();
    });
    bSel.input.addEventListener('change', function () {
      var was = connected;
      connected = bSel.input.value === '0';
      if (was && !connected) Qfix = M.cap(geom(), params()) * S.V.get();
      refresh();
    });
    var checked = false;

    function geom() { return GEOMS[+gSel.input.value] || 'plates'; }
    // Que siempre a < b: si un radio alcanza al otro, el otro se recorre medio paso.
    function order(moved, other) {
      var inner = moved === 'ca' || moved === 'sa';
      var a = S[inner ? moved : other], b = S[inner ? other : moved];
      if (b.get() <= a.get()) {
        if (inner) b.set(Math.min(+b.input.max, a.get() + 0.5));
        else a.set(Math.max(+a.input.min, b.get() - 0.5));
        if (b.get() <= a.get()) { if (inner) a.set(b.get() - 0.5); else b.set(a.get() + 0.5); }
      }
      refresh();
    }
    // Parámetros en SI.
    function params() {
      var g = geom(), k = S.k.get();
      if (g === 'plates') return { A: S.A.get() * 1e-4, d: S.d.get() * 1e-3, kappa: k };
      if (g === 'cylinder') return { a: S.ca.get() * 1e-3, b: S.cb.get() * 1e-3, L: S.L.get() / 100, kappa: k };
      return { a: S.sa.get() / 100, b: S.sb.get() / 100, kappa: k };
    }
    function state() {
      var C = M.cap(geom(), params()), V = S.V.get();
      var Q = connected ? C * V : Qfix, Vn = connected ? V : Qfix / C;
      return { C: C, Q: Q, V: Vn, U: 0.5 * Q * Vn };
    }
    function kind() { return ['C', 'Q', 'Vd'][+kSel.input.value]; }

    function el(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n);
      return n;
    }
    function txt(x, y, s, anchor, size, cls) {
      var t = el('text', { x: x, y: y, 'class': cls || 'ann', 'text-anchor': anchor || 'middle', 'font-size': size || 15 });
      t.textContent = s;
      return t;
    }
    function line(x1, y1, x2, y2, cls, w, dash) { return el('path', { d: 'M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2, 'class': cls, 'stroke-width': w || 2, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': dash }); }
    function arrow(x, y, dx, dy, cls, w) {
      var L = Math.hypot(dx, dy);
      if (!(L > 2)) return;
      var ux = dx / L, uy = dy / L, hh = Math.min(9, L * 0.45), ex = x + dx, ey = y + dy;
      el('path', { d: 'M' + x + ' ' + y + 'L' + ex + ' ' + ey + 'M' + (ex - ux * hh - uy * hh * 0.6) + ' ' + (ey - uy * hh + ux * hh * 0.6) + 'L' + ex + ' ' + ey + 'L' + (ex - ux * hh + uy * hh * 0.6) + ' ' + (ey - uy * hh - ux * hh * 0.6),
        'class': cls, 'stroke-width': w || 2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    }
    function clampI(x, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(x))); }

    function drawPlates(st) {
      var p = params(), side = Math.sqrt(S.A.get()), cy = 190;
      var hp = 70 + (side - Math.sqrt(5)) / (20 - Math.sqrt(5)) * 220, g = 26 + (S.d.get() - 0.5) / 9.5 * 250;
      var top = cy - hp / 2, bot = cy + hp / 2, xl = 320 - g / 2, xr = 320 + g / 2, T = 14;
      // Dieléctrico.
      if (p.kappa > 1) el('rect', { x: xl, y: top, width: g, height: hp, 'class': 'area-fill area-fill--aux' });
      // Campo: tantas flechas como dice E (relativo al inicio).
      var m = clampI(5 * (M.field('plates', p, st.Q) / Eref), 1, Math.floor(hp / 14));
      for (var j = 0; j < m; j++) { var y = top + (j + 0.5) * hp / m; arrow(xl + 5, y, g - 10, 0, 'ref', 2); }
      // Placas con sus cargas: tantos signos como dice Q (relativo al inicio).
      el('rect', { x: xl - T, y: top, width: T, height: hp, 'class': 'box-err' });
      el('rect', { x: xr, y: top, width: T, height: hp, 'class': 'box-aux' });
      var n = clampI(6 * st.Q / Qref, 1, Math.floor(hp / 17));
      for (var i = 0; i < n; i++) {
        var yy = top + (i + 0.5) * hp / n + 5;
        txt(xl - T / 2, yy, '+', 'middle', 15); txt(xr + T / 2, yy, '−', 'middle', 15);
      }
      // Medidas.
      line(xl, top - 14, xr, top - 14, 'axis', 1.4); line(xl, top - 20, xl, top - 8, 'axis', 1.4); line(xr, top - 20, xr, top - 8, 'axis', 1.4);
      txt(320, top - 24, 'd = ' + fmt1(S.d.get()) + ' mm', 'middle', 18);
      txt(xl - T - 12, cy - 14, 'A = ' + S.A.get() + ' cm²', 'end', 18);
      if (p.kappa > 1) txt(620, 42, 'dieléctrico κ = ' + fmt1(p.kappa), 'end', 16);
      // Circuito: cables por fuera, batería abajo y el interruptor a la derecha.
      var yw = 395, xL = 40, xR = 600;
      el('path', { d: 'M' + (xl - T) + ' ' + cy + 'H' + xL + 'V' + yw + 'H312', 'class': 'axis', 'stroke-width': 2, fill: 'none' });
      el('path', { d: 'M' + (xr + T) + ' ' + cy + 'H' + xR + 'V' + yw + 'H480', 'class': 'axis', 'stroke-width': 2, fill: 'none' });
      line(326, yw, 440, yw, 'axis', 2);
      if (connected) line(440, yw, 480, yw, 'axis', 2.5);
      else line(440, yw, 474, yw - 22, 'axis', 2.5);
      el('circle', { cx: 440, cy: yw, r: 3.5, 'class': 'dot-ref' }); el('circle', { cx: 480, cy: yw, r: 3.5, 'class': 'dot-ref' });
      line(312, yw - 16, 312, yw + 16, 'axis', 2.5); line(326, yw - 9, 326, yw + 9, 'axis', 4);
      txt(300, yw - 20, '+', 'end', 15);
      txt(160, yw - 10, connected ? 'conectada: V = ' + S.V.get() + ' V' : 'desconectada: Q fija', 'middle', 17);
      txt(620, 22, 'dibujo sin escala', 'end', 15);
    }

    function annulus(cx, cy, r0, r1, cls) {
      var d = 'M' + (cx + r1) + ' ' + cy + 'A' + r1 + ' ' + r1 + ' 0 1 0 ' + (cx - r1) + ' ' + cy + 'A' + r1 + ' ' + r1 + ' 0 1 0 ' + (cx + r1) + ' ' + cy +
        'M' + (cx + r0) + ' ' + cy + 'A' + r0 + ' ' + r0 + ' 0 1 1 ' + (cx - r0) + ' ' + cy + 'A' + r0 + ' ' + r0 + ' 0 1 1 ' + (cx + r0) + ' ' + cy + 'Z';
      el('path', { d: d, 'class': cls, 'fill-rule': 'evenodd' });
    }
    function drawRadial(st) {
      var g = geom(), p = params(), cx = 320, cy = 210, Rb = 164, T = 20;
      var ra = Math.max(9, Rb * p.a / p.b), rg = (ra + Rb) / 2;
      // Superficie gaussiana (punteada) y el campo radial.
      if (p.kappa > 1) annulus(cx, cy, ra, Rb, 'area-fill area-fill--aux');
      if (Rb - ra > 20) el('circle', { cx: cx, cy: cy, r: rg, 'class': 'trace', fill: 'none', 'stroke-width': 1.6, 'stroke-dasharray': '6 6' });
      var m = clampI(10 * st.Q / Qref, 4, 24);
      for (var j = 0; j < m; j++) {
        var t = (j + 0.5) * 2 * Math.PI / m, ux = Math.cos(t), uy = Math.sin(t);
        arrow(cx + ux * (ra + 4), cy + uy * (ra + 4), ux * (Rb - ra - 8), uy * (Rb - ra - 8), 'ref', 2);
      }
      annulus(cx, cy, Rb, Rb + T, 'box-aux');
      [45, 135, 225, 315].forEach(function (a) { txt(cx + (Rb + T / 2) * Math.cos(a * Math.PI / 180), cy - (Rb + T / 2) * Math.sin(a * Math.PI / 180) + 6, '−', 'middle', 18); });
      el('circle', { cx: cx, cy: cy, r: ra, 'class': 'box-err' });
      if (ra >= 12) txt(cx, cy + 6, '+', 'middle', 18);
      var dims = g === 'cylinder'
        ? 'a = ' + fmt1(S.ca.get()) + ' mm · b = ' + fmt1(S.cb.get()) + ' mm · L = ' + S.L.get() + ' cm'
        : 'a = ' + fmt1(S.sa.get()) + ' cm · b = ' + fmt1(S.sb.get()) + ' cm';
      txt(16, 430, dims, 'start', 17);
      txt(624, 22, g === 'cylinder' ? 'corte transversal' : 'corte por el centro', 'end', 16);
      txt(16, 22, connected ? 'batería conectada: V = ' + S.V.get() + ' V' : 'batería desconectada: Q fija', 'start', 16);
      if (p.kappa > 1) txt(624, 430, 'κ = ' + fmt1(p.kappa), 'end', 17);
    }

    function draw() {
      var g = geom();
      Object.keys(SHOW).forEach(function (k) { SHOW[k].forEach(function (n) { S[n].node.hidden = k !== g; }); });
      S.V.input.disabled = !connected;
      Array.prototype.forEach.call(kSel.input.options, function (o, i) { o.disabled = i === 2 && g !== 'plates'; });
      var st = state(), p = params();
      if (Qref == null) { Qref = st.Q; Eref = M.field(g, p, st.Q, g === 'plates' ? 0 : p.a); }
      svg.innerHTML = '';
      if (g === 'plates') drawPlates(st); else drawRadial(st);
      mount.querySelector('.cp-gauss').hidden = g === 'plates';
      title.textContent = g === 'plates' ? 'Placas paralelas vistas de lado' : g === 'cylinder' ? 'Capacitor cilíndrico (cable coaxial)' : 'Capacitor esférico';
      if (chain.getAttribute('data-g') !== g) { chain.setAttribute('data-g', g); chain.innerHTML = CHAIN[g]; UI.renderMath(chain); }
      // Valores: la fórmula cerrada y la integral numérica de E·dl.
      var Cn = M.fromIntegral(g, p), Vn = M.Vint(g, p, st.Q);
      var rows = [['C (fórmula)', UI.fmt(st.C * 1e12, 5) + ' pF'], ['C = Q/∫E·dl (numérico)', UI.fmt(Cn * 1e12, 5) + ' pF'],
        ['Q', UI.fmt(st.Q * 1e9, 4) + ' nC'], ['V', UI.fmt(st.V, 4) + ' V'], ['∫E·dl', UI.fmt(Vn, 4) + ' V']];
      if (g === 'plates') rows.push(['E = V/d', UI.fmt(st.V / p.d, 4) + ' V/m'], ['σ = Q/A', UI.fmt(st.Q / p.A, 4) + ' C/m²']);
      else rows.push(['E junto a a', UI.fmt(M.field(g, p, st.Q, p.a), 4) + ' V/m'], ['E junto a b', UI.fmt(M.field(g, p, st.Q, p.b), 4) + ' V/m']);
      rows.push(['U = ½CV² (S10)', UI.fmt(st.U * 1e9, 4) + ' nJ']);
      facts.innerHTML = '';
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    function refresh() { if (checked) check(); else draw(); }
    function check() {
      var val = parseFloat(String(aIn.input.value).replace(',', '.'));
      var k = kind(), si = k === 'C' ? val * 1e-12 : k === 'Q' ? val * 1e-9 : val;
      if (k === 'Vd' && geom() !== 'plates') k = 'C';
      var r = M.diagnose(k, geom(), params(), S.V.get(), si);
      var msg = MSG[r] || MSG.bad;
      UI.verdict(verdict, r === 'ok' ? 'ok' : r === 'bad' ? 'bad' : 'warn', msg[0], msg[1]);
      checked = true;
      draw();
    }

    // Ejemplo cargado: un compañero calculó C dejando el área en cm².
    (function () {
      kSel.input.value = '0';
      var r = M.answers('C', 'plates', params(), S.V.get());
      aIn.input.value = UI.fmt(r.cm2 * 1e12, 4);
      note.textContent = 'Ejemplo cargado: así calculó un compañero la capacitancia, en pF. ¿Ves el error? Luego desconecta la batería y mueve d: mira qué se queda fijo.';
    })();
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
