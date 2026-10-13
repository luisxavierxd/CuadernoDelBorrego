/* =====================================================================
   Lab inductance-solenoid (Física 3 · S13): autoinducción e inductancia.
   Un solenoide de N vueltas, radio r y largo ℓ (con núcleo de permeabilidad
   relativa K_m opcional). L = K_m μ₀ N² A/ℓ en el modelo ideal; el lab también
   suma el flujo real de cada vuelta con el campo en el eje de un solenoide finito
   (efectos de borde), que da una L un poco menor. Por el solenoide pasa una
   corriente en rampa (I₀ + kt) o senoidal (I_m sen 2πft); las gráficas muestran
   I(t) y la fem autoinducida ε = −L dI/dt.
   Reto: L (en mH), |ε| en el instante del cursor (en V) o las vueltas N para una L dada.
   El «casi»:
     noSquare  usó N en lugar de N²
     cm2       dejó el área en cm² (o el radio en cm)
     cmLen     dejó el largo en cm
     diam      usó el radio como si fuera el diámetro
     noKm      olvidó el núcleo (K_m)
     useI      usó la corriente en lugar de dI/dt
     mH        dejó L en mH al calcular ε (sale 1000 veces mayor)
     sinCos    en la senoide usó sen en lugar de cos
     noOmega   en la senoide olvidó ω = 2πf
     noSqrt    dio N² en lugar de N
   LabMath.inductor es puro. μ₀ = 4π × 10⁻⁷ T·m/A.
   ===================================================================== */
(function () {
  var MU0 = 4 * Math.PI * 1e-7, TAU = 2 * Math.PI;

  /* ------------------------- Matemática pura ------------------------- */
  function area(rcm) { return Math.PI * Math.pow(rcm / 100, 2); }
  // Inductancia ideal en henries. r y ℓ en cm.
  function ideal(N, rcm, lcm, Km) { return (Km || 1) * MU0 * N * N * area(rcm) / (lcm / 100); }
  // Campo dentro de un solenoide largo, en teslas.
  function field(N, lcm, I, Km) { return (Km || 1) * MU0 * N * I / (lcm / 100); }
  // Campo en el eje de un solenoide finito (centro en z = 0), z en cm: μ₀nI/2 (cos α₁ − cos α₂).
  function axialB(N, rcm, lcm, I, Km, zcm) {
    var r = rcm / 100, l = lcm / 100, z = zcm / 100, n = N / l, a = z + l / 2, b = z - l / 2;
    return (Km || 1) * MU0 * n * I / 2 * (a / Math.sqrt(a * a + r * r) - b / Math.sqrt(b * b + r * r));
  }
  // Enlace de flujo con efectos de borde: cada vuelta k (en z_k) atraviesa B_eje(z_k)·A. Devuelve L = NΦ/I.
  function withEnds(N, rcm, lcm, Km) {
    var s = 0, M = Math.min(N, 400), A = area(rcm);
    for (var k = 0; k < M; k++) s += axialB(N, rcm, lcm, 1, Km, -lcm / 2 + lcm * (k + 0.5) / M) * A;
    return s * N / M;
  }
  // Corriente: 'ramp' I = I₀ + kt; 'sine' I = I_m sen(2πft).
  function current(kind, p, t) { return kind === 'sine' ? p.Im * Math.sin(TAU * p.f * t) : p.I0 + p.k * t; }
  function dIdt(kind, p, t) { return kind === 'sine' ? p.Im * TAU * p.f * Math.cos(TAU * p.f * t) : p.k; }
  function emf(L, dI) { return -L * dI; }
  // Estado completo: p = { N, r, l, Km, kind, I0, k, Im, f }.
  function state(p, t) {
    var L = ideal(p.N, p.r, p.l, p.Km), I = current(p.kind, p, t), d = dIdt(p.kind, p, t);
    return { L: L, I: I, dIdt: d, emf: emf(L, d), B: field(p.N, p.l, I, p.Km), link: L * I, U: 0.5 * L * I * I };
  }
  // Vueltas necesarias para una L (en H).
  function turnsFor(L, rcm, lcm, Km) { return Math.sqrt(L * (lcm / 100) / ((Km || 1) * MU0 * area(rcm))); }

  // Reto. kind 'L' (mH), 'emf' (|ε| en V en el instante p.t), 'N' (vueltas para p.Lt mH).
  function answers(kind, p) {
    var out = {}, Km = p.Km || 1, A = area(p.r), l = p.l / 100;
    if (kind === 'L') {
      var L = ideal(p.N, p.r, p.l, Km) * 1000;
      out.truth = L; out.noSquare = L / p.N; out.cm2 = L * 1e4; out.cmLen = L / 100; out.diam = L / 4;
      if (Km !== 1) out.noKm = L / Km;
    } else if (kind === 'emf') {
      var L2 = ideal(p.N, p.r, p.l, Km), d = Math.abs(dIdt(p.kind, p, p.t));
      out.truth = L2 * d; out.mH = L2 * d * 1000; out.useI = L2 * Math.abs(current(p.kind, p, p.t));
      if (p.kind === 'sine') { out.sinCos = L2 * p.Im * TAU * p.f * Math.abs(Math.sin(TAU * p.f * p.t)); out.noOmega = L2 * p.Im * Math.abs(Math.cos(TAU * p.f * p.t)); }
    } else {
      var Nn = turnsFor(p.Lt / 1000, p.r, p.l, Km);
      out.truth = Nn; out.noSqrt = Nn * Nn; out.cm2 = Nn / 100;
      if (Km !== 1) out.noKm = Nn * Math.sqrt(Km);
    }
    return out;
  }
  function close(a, b, tol) { return Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-30); }
  function diagnose(kind, p, student) {
    if (!isFinite(student)) return 'bad';
    var r = answers(kind, p), tol = 0.01, s = Math.abs(student);
    if (close(s, r.truth, tol)) return 'ok';
    var keys = Object.keys(r).filter(function (k) { return k !== 'truth'; });
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (!isFinite(r[k]) || close(r[k], r.truth, 0.02)) continue;
      if (close(s, r[k], tol)) return k;
    }
    return 'bad';
  }

  window.LabMath.inductor = {
    MU0: MU0, area: area, ideal: ideal, field: field, axialB: axialB, withEnds: withEnds,
    current: current, dIdt: dIdt, emf: emf, state: state, turnsFor: turnsFor, answers: answers, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var MSG = {
    ok: ['Coincide', 'Tu resultado es el del lab.'],
    noSquare: ['Falta elevar N al cuadrado', 'N aparece dos veces: el campo es proporcional a N y cada una de las N vueltas lo atraviesa. L = μ₀N²A/ℓ.'],
    cm2: ['Revisa el área', 'El área va en m²: pasa el radio a metros antes de elevar al cuadrado (1 cm² = 10⁻⁴ m²).'],
    cmLen: ['Revisa el largo', 'ℓ va en metros: 1 cm = 0.01 m.'],
    diam: ['¿Radio o diámetro?', 'A = πr² con el radio. Si usas el diámetro como radio, el área sale 4 veces más grande (o más chica, al revés).'],
    noKm: ['Falta el núcleo', 'Con un núcleo de permeabilidad relativa K_m, L = K_m μ₀N²A/ℓ.'],
    useI: ['Es dI/dt, no I', 'La fem autoinducida depende de qué tan rápido cambia la corriente: ε = −L dI/dt.'],
    mH: ['Revisa las unidades de L', 'Para obtener volts, L va en henries: 1 mH = 10⁻³ H.'],
    sinCos: ['Revisa la derivada', 'Si I = I_m sen(ωt), dI/dt = I_m ω cos(ωt).'],
    noOmega: ['Falta ω', 'Al derivar sen(ωt) sale el factor ω = 2πf.'],
    noSqrt: ['Falta la raíz', 'De L = μ₀N²A/ℓ se despeja N² = Lℓ/(μ₀A): falta sacar la raíz.'],
    bad: ['No coincide', 'L = K_m μ₀ N² A/ℓ (SI), |ε| = L |dI/dt| y N = √(Lℓ/(K_m μ₀ A)).']
  };
  var KINDS = [['L', 'la inductancia L (en mH)'], ['emf', '|ε| en el instante t (en V)'], ['N', 'las vueltas N para L* (sin redondear)']];
  var CORES = [[1, 'Aire (K_m = 1)'], [50, 'Ferrita (K_m = 50)'], [200, 'Ferrita (K_m = 200)'], [1000, 'Hierro (K_m = 1000)']];

  window.Labs['inductance-solenoid'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var checked = false;

    var S = {
      N: UI.slider({ label: 'Vueltas N', min: 50, max: 2000, step: 50, value: 500 }, changed),
      r: UI.slider({ label: 'Radio r', min: 0.5, max: 3, step: 0.1, value: 1.5, unit: 'cm' }, changed),
      l: UI.slider({ label: 'Largo ℓ', min: 5, max: 50, step: 1, value: 20, unit: 'cm' }, changed)
    };
    var core = UI.select({ label: 'Núcleo', options: CORES.map(function (c) { return c[1]; }) });
    var kindSel = UI.select({ label: 'Corriente', options: ['Rampa: I = I₀ + kt', 'Senoide: I = I_m sen(2πft)'] });
    var C = {
      I0: UI.slider({ label: 'I₀', min: 0, max: 2, step: 0.1, value: 0.2, unit: 'A' }, changed),
      k: UI.slider({ label: 'Rapidez de cambio k = dI/dt', min: -10, max: 10, step: 0.5, value: 4, unit: 'A/s' }, changed),
      Im: UI.slider({ label: 'Amplitud I_m', min: 0.1, max: 2, step: 0.1, value: 0.5, unit: 'A' }, changed),
      f: UI.slider({ label: 'Frecuencia f', min: 10, max: 200, step: 10, value: 60, unit: 'Hz' }, changed),
      t: UI.slider({ label: 'Instante t (fracción de la ventana)', min: 0, max: 1, step: 0.01, value: 0.15, fmt: function (v) { return (v * 100).toFixed(0) + ' %'; } }, changed)
    };
    var askSel = UI.select({ label: '¿Qué calculas?', options: KINDS.map(function (k) { return k[1]; }) });
    var target = UI.slider({ label: 'Inductancia objetivo L*', min: 1, max: 100, step: 1, value: 10, unit: 'mH' }, changed);
    var data = h('p', { class: 'lab-note rc-data' });
    var aIn = UI.input({ label: 'Tu resultado', type: 'text', inputmode: 'decimal', mono: false, hint: 'SI: r y ℓ en metros, L en henries para calcular ε. Notación científica: <code>2.5e-3</code>.' });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts rc-facts' });
    var scene = UI.svg(640, 230, 'Solenoide con sus vueltas y su campo interior');
    var p1 = UI.svg(640, 200, 'Corriente contra el tiempo');
    var p2 = UI.svg(640, 200, 'Fem autoinducida contra el tiempo');
    var title = h('figcaption', { class: 'lab-board__title sheet__title' }, ['Inductancia de un solenoide']);
    var plotNote = h('p', { class: 'lab-note' });
    var leg = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--ref' }), 'corriente I(t)']),
      h('li', {}, [h('i', { class: 'sw sw--trace' }), 'fem ε(t)']),
      h('li', {}, [h('i', { class: 'sw sw--aux' }), 'campo B']),
      h('li', {}, [h('i', { class: 'sw sw--error' }), 'instante t'])
    ]);

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls rc-controls', novalidate: true }, [
        S.N.node, S.r.node, S.l.node, core.node, kindSel.node, C.I0.node, C.k.node, C.Im.node, C.f.node, C.t.node,
        h('p', { class: 'lab-field__label rc-head' }, ['Reto']),
        askSel.node, target.node, data, aIn.node, h('div', { class: 'lab-buttons' }, [run]), note, verdict,
        h('p', { class: 'lab-field__label rc-head' }, ['Tablero']),
        facts
      ]),
      h('figure', { class: 'lab-board' }, [title, scene, p1, p2, leg, plotNote])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    aIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    [core, kindSel, askSel].forEach(function (s) { s.input.addEventListener('change', function () { verdict.hidden = true; checked = false; draw(); }); });

    function changed() { if (checked) check(); else draw(); }
    function kind() { return kindSel.input.value === '1' ? 'sine' : 'ramp'; }
    function ask() { return (KINDS[+askSel.input.value] || KINDS[0])[0]; }
    function span() { return kind() === 'sine' ? 2 / C.f.get() : 0.2; }
    function params() {
      var T = span();
      return { N: S.N.get(), r: S.r.get(), l: S.l.get(), Km: CORES[+core.input.value][0], kind: kind(), I0: C.I0.get(), k: C.k.get(), Im: C.Im.get(), f: C.f.get(),
        t: Number((C.t.get() * T).toPrecision(3)), Lt: target.get() };
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

    function drawScene(p, st) {
      scene.innerHTML = '';
      var g = el(scene, 'g', { 'class': 'sketch' });
      var len = 120 + p.l * 7, x0 = 320 - len / 2, x1 = 320 + len / 2, cy = 100, ry = 18 + p.r * 18;
      if (p.Km > 1) el(g, 'rect', { x: x0, y: cy - ry * 0.7, width: len, height: ry * 1.4, 'class': 'rect-fill' });
      // Líneas de B adentro (paralelas al eje), con flecha según el signo de I.
      var dir = st.I >= 0 ? 1 : -1, op = Math.min(1, 0.25 + Math.abs(st.I) / 2);
      [-0.45, 0, 0.45].forEach(function (f) {
        path(g, 'M' + (x0 - 30) + ' ' + (cy + f * ry) + 'H' + (x1 + 30), 'aux', 2, { opacity: op.toFixed(2) });
        var hx = dir > 0 ? x1 + 30 : x0 - 30;
        path(g, 'M' + (hx - dir * 10) + ' ' + (cy + f * ry - 6) + 'L' + hx + ' ' + (cy + f * ry) + 'L' + (hx - dir * 10) + ' ' + (cy + f * ry + 6), 'aux', 2, { opacity: op.toFixed(2) });
      });
      var turns = Math.max(6, Math.min(30, Math.round(p.N / 60))), dx = len / turns;
      for (var i = 0; i < turns; i++) el(g, 'ellipse', { cx: (x0 + dx * (i + 0.5)).toFixed(1), cy: cy, rx: (dx * 0.42).toFixed(1), ry: ry.toFixed(1), 'class': 'ref', fill: 'none', 'stroke-width': 2.2 });
      tx(g, 320, cy + ry + 30, 'N = ' + p.N + ', r = ' + p.r + ' cm, ℓ = ' + p.l + ' cm' + (p.Km > 1 ? ', K_m = ' + p.Km : ''), 'middle', 16);
      // Barras: L ideal y L con efectos de borde.
      var Li = st.L, Le = withEnds(p.N, p.r, p.l, p.Km), w = 380;
      el(g, 'rect', { x: 140, y: 188, width: w, height: 12, 'class': 'box-ref' });
      el(g, 'rect', { x: 140, y: 206, width: (w * Le / Li).toFixed(1), height: 12, 'class': 'box-trace' });
      tx(g, 134, 199, 'L ideal = ' + UI.fmt(Li * 1000, 4) + ' mH', 'end', 14);
      tx(g, 134, 217, 'con bordes = ' + UI.fmt(Le * 1000, 4) + ' mH', 'end', 14);
    }

    function drawPlots(p) {
      var T = span(), n = 200, is = [], es = [];
      for (var k = 0; k <= n; k++) { var s = state(p, T * k / n); is.push(s.I); es.push(s.emf * 1000); }
      var st = state(p, p.t);
      var ir = window.LabPlot.range(is), er = window.LabPlot.range(es);
      var P = window.LabPlot(p1, { x: [0, T * 1000], y: ir });
      P.clear().grid().axes();
      P.curve(function (x) { return state(p, x / 1000).I; }, 'ref', 3);
      P.segments([[[p.t * 1000, ir[0]], [p.t * 1000, ir[1]]]], 'error', 1.6);
      P.point(p.t * 1000, st.I, 'dot-error', 6);
      P.label(0, ir[1], 'I (A)', 'start', 15, 6, 22);
      P.label(T * 1000, ir[0], 't (ms)', 'end', 15, -4, -10);
      var Q = window.LabPlot(p2, { x: [0, T * 1000], y: er });
      Q.clear().grid().axes();
      Q.curve(function (x) { return state(p, x / 1000).emf * 1000; }, 'trace', 3);
      Q.segments([[[p.t * 1000, er[0]], [p.t * 1000, er[1]]]], 'error', 1.6);
      Q.point(p.t * 1000, st.emf * 1000, 'dot-error', 6);
      Q.label(0, er[1], 'ε (mV)', 'start', 15, 6, 22);
      Q.label(T * 1000, er[0], 't (ms)', 'end', 15, -4, -10);
      plotNote.textContent = p.kind === 'sine'
        ? 'ε = −L dI/dt: la fem es máxima cuando la corriente cruza el cero y vale cero en los picos de la corriente. Siempre se opone al cambio.'
        : (p.k > 0 ? 'La corriente crece a ritmo constante: la fem es constante y negativa (se opone al aumento).' : p.k < 0 ? 'La corriente baja: la fem es positiva, empuja para sostener la corriente.' : 'Con la corriente constante no hay fem autoinducida.');
      return st;
    }

    function draw() {
      var p = params(), sine = p.kind === 'sine';
      C.I0.node.hidden = sine; C.k.node.hidden = sine; C.Im.node.hidden = !sine; C.f.node.hidden = !sine;
      target.node.hidden = ask() !== 'N';
      var st = drawPlots(p);
      drawScene(p, st);
      var k = ask();
      data.textContent = 'Datos: N = ' + p.N + ', r = ' + p.r + ' cm, ℓ = ' + p.l + ' cm, K_m = ' + p.Km +
        (k === 'emf' ? ', ' + (sine ? 'I = ' + p.Im + ' sen(2π·' + p.f + 't) A' : 'I = ' + p.I0 + ' + (' + p.k + ')t A') + ', t = ' + UI.fmt(p.t * 1000, 3) + ' ms.' : k === 'N' ? ', L* = ' + p.Lt + ' mH.' : '.');
      facts.innerHTML = '';
      [['A = πr²', UI.fmt(area(p.r), 4) + ' m²'], ['L = K_m μ₀N²A/ℓ', UI.fmt(st.L * 1000, 4) + ' mH'], ['L con efectos de borde', UI.fmt(withEnds(p.N, p.r, p.l, p.Km) * 1000, 4) + ' mH'],
        ['I(t)', UI.fmt(st.I, 4) + ' A'], ['dI/dt', UI.fmt(st.dIdt, 4) + ' A/s'], ['ε = −L dI/dt', UI.fmt(st.emf, 4) + ' V'],
        ['B adentro', UI.fmt(st.B * 1000, 4) + ' mT'], ['NΦ = LI', UI.fmt(st.link * 1000, 4) + ' mWb']]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    function parse(s) { return window.CBExercises ? window.CBExercises.parseNumber(s) : parseFloat(String(s).replace(',', '.')); }
    function check() {
      var val = parse(aIn.input.value), p = params(), k = ask();
      if (k === 'emf' && p.kind === 'ramp' && p.k === 0) {
        UI.verdict(verdict, 'warn', 'La corriente no cambia', 'Con k = 0, dI/dt = 0 y no hay fem autoinducida. Mueve k.');
        checked = true; draw(); return;
      }
      var r = diagnose(k, p, val), msg = MSG[r] || MSG.bad, truth = answers(k, p).truth;
      UI.verdict(verdict, r === 'ok' ? 'ok' : r === 'bad' ? 'bad' : 'warn', msg[0], msg[1] + (r === 'ok' ? '' : ' Valor del lab: ' + UI.fmt(truth, 4) + '.'));
      checked = true;
      draw();
    }

    // Ejemplo cargado: un compañero calculó L con N en lugar de N².
    var p0 = params();
    aIn.input.value = UI.fmt(answers('L', p0).noSquare, 4);
    note.textContent = 'Ejemplo cargado: así calculó un compañero la inductancia, en mH. ¿Ves el error? Luego cambia el núcleo, la geometría o la corriente.';
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
