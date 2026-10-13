/* =====================================================================
   Lab faraday-emf (Física 3 · S11): ley de Faraday y fem de movimiento.
   Dos modos:
     · Barra sobre rieles: una barra de largo L se desliza con rapidez v sobre
       dos rieles unidos por un resistor R, en un campo B uniforme que entra en
       la página. ε = BLv, I = ε/R, F = B²L²v/R y la potencia mecánica F·v es
       igual a la eléctrica I²R.
     · Bobina con B(t): N vueltas de radio r cuya normal forma θ con B; B crece
       en rampa (B₀ + kt) o es senoidal (B_m sen 2πft). Gráficas de Φ(t) y ε(t).
   Reto: ε, I o F en los rieles, o |ε| de la bobina en el instante del cursor.
   El «casi»:
     cmL     usó L en cm (el resultado sale 100 veces más grande)
     noR     no dividió entre R (dio la fem en lugar de la corriente, o B·ε·L en la fuerza)
     isI     dio la corriente (BLv/R) cuando se pedía la fuerza
     noN     olvidó el número de vueltas N
     cm2     usó el área en cm² sin pasarla a m² (×10⁴)
     noCos   ignoró el ángulo θ entre B y la normal
     sinCos  en la senoide usó sen(2πft) en lugar de cos(2πft)
     noOmega en la senoide olvidó el factor ω = 2πf
   LabMath.faraday es puro (SI: T, m, s, Ω → V, A, N, W).
   ===================================================================== */
(function () {
  var TAU = 2 * Math.PI, RAD = Math.PI / 180;

  /* ------------------------- Matemática pura ------------------------- */
  // Flujo de un campo uniforme por una superficie plana: Φ = BA cos θ (θ entre B y la normal).
  function flux(B, A, thDeg) { return B * A * Math.cos((thDeg || 0) * RAD); }
  // Barra sobre rieles. Lcm en cm; x en m (posición de la barra desde el resistor).
  function rail(B, Lcm, v, R, x) {
    var L = Lcm / 100, emf = B * L * v, I = emf / R, F = I * L * B;
    return { L: L, emf: emf, I: I, F: F, Pm: F * v, Pe: I * I * R, phi: B * L * (x || 0) };
  }
  // Campo de la bobina en el instante t. kind 'ramp': B₀ + kt; 'sine': B_m sen(2πft).
  function coilB(kind, p, t) { return kind === 'sine' ? p.Bm * Math.sin(TAU * p.f * t) : p.B0 + p.k * t; }
  function coilDB(kind, p, t) { return kind === 'sine' ? p.Bm * TAU * p.f * Math.cos(TAU * p.f * t) : p.k; }
  // Bobina: N vueltas de radio r (cm), normal a θ (°) de B. Φ es el flujo por una vuelta.
  function coil(kind, p, t) {
    var A = Math.PI * Math.pow(p.r / 100, 2), c = Math.cos((p.th || 0) * RAD), B = coilB(kind, p, t);
    var emf = -p.N * A * c * coilDB(kind, p, t);
    return { A: A, B: B, phi: B * A * c, link: p.N * B * A * c, emf: emf, emfMag: Math.abs(emf) };
  }
  // Fem promedio de N vueltas cuando el flujo por vuelta cambia ΔΦ en Δt, y la carga que pasa por R.
  function avgEmf(N, dPhi, dt) { return N * Math.abs(dPhi) / dt; }
  function chargeThrough(N, dPhi, R) { return N * Math.abs(dPhi) / R; }

  // Respuesta real y errores típicos del reto.
  // mode 'rail': p = { B, L (cm), v, R }, kind 'emf' | 'I' | 'F'.
  // mode 'coil': p = { kind: 'ramp' | 'sine', N, r, th, B0, k, Bm, f, t }, kind 'emf'.
  function answers(kind, mode, p) {
    var out = {};
    if (mode === 'rail') {
      var r = rail(p.B, p.L, p.v, p.R), Lm = p.L / 100;
      if (kind === 'emf') { out.truth = r.emf; out.cmL = p.B * p.L * p.v; }
      else if (kind === 'I') { out.truth = r.I; out.noR = r.emf; out.cmL = p.B * p.L * p.v / p.R; }
      else { out.truth = r.F; out.isI = r.I; out.noR = p.B * r.emf * Lm; out.cmL = r.F * 1e4; }
      return out;
    }
    var c = coil(p.kind, p, p.t), A = c.A, cs = Math.cos((p.th || 0) * RAD), dB = Math.abs(coilDB(p.kind, p, p.t));
    out.truth = c.emfMag;
    out.noN = c.emfMag / p.N;
    out.cm2 = c.emfMag * 1e4;
    if (p.th) out.noCos = p.N * A * dB;
    if (p.kind === 'sine') {
      out.sinCos = p.N * A * cs * p.Bm * TAU * p.f * Math.abs(Math.sin(TAU * p.f * p.t));
      out.noOmega = p.N * A * cs * p.Bm * Math.abs(Math.cos(TAU * p.f * p.t));
    }
    return out;
  }
  function close(a, b, tol) { return Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-30); }
  function diagnose(kind, mode, p, student) {
    if (!isFinite(student)) return 'bad';
    var r = answers(kind, mode, p), tol = 0.01;
    if (close(Math.abs(student), r.truth, tol)) return 'ok';
    var keys = Object.keys(r).filter(function (k) { return k !== 'truth'; });
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (!isFinite(r[k]) || close(r[k], r.truth, 0.02)) continue;
      if (close(Math.abs(student), r[k], tol)) return k;
    }
    return 'bad';
  }

  window.LabMath.faraday = {
    flux: flux, rail: rail, coilB: coilB, coil: coil, avgEmf: avgEmf, chargeThrough: chargeThrough,
    answers: answers, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var MSG = {
    ok: ['Coincide', 'Tu resultado es el del lab.'],
    cmL: ['Revisa las unidades de L', 'L va en metros: 1 cm = 0.01 m. Con L en cm el resultado sale 100 veces más grande (o 10⁴ en la fuerza, que lleva L²).'],
    noR: ['Falta la resistencia', 'La corriente es I = ε/R, y la fuerza sobre la barra es F = ILB con esa corriente: F = B²L²v/R.'],
    isI: ['Esa es la corriente', 'BLv/R es la corriente. La fuerza es F = ILB = B²L²v/R.'],
    noN: ['Faltan las N vueltas', 'Cada vuelta aporta su fem y están en serie: ε = −N dΦ/dt.'],
    cm2: ['Revisa el área', 'El área va en m²: r en cm se pasa a metros antes de elevar al cuadrado (1 cm² = 10⁻⁴ m²).'],
    noCos: ['Falta el ángulo', 'Solo cuenta la componente de B perpendicular a la espira: Φ = BA cos θ, con θ entre B y la normal.'],
    sinCos: ['Revisa la derivada', 'Si B = B_m sen(ωt), dB/dt = B_m ω cos(ωt): la fem va con coseno, no con seno.'],
    noOmega: ['Falta ω', 'Al derivar sen(ωt) sale un factor ω = 2πf: dB/dt = B_m ω cos(ωt).'],
    bad: ['No coincide', 'Rieles: ε = BLv, I = ε/R, F = B²L²v/R. Bobina: |ε| = N A cos θ |dB/dt|, con A en m².']
  };
  var KINDS = { rail: [['emf', 'la fem ε (en V)'], ['I', 'la corriente I (en A)'], ['F', 'la fuerza para mantener v (en N)']], coil: [['emf', '|ε| en el instante t (en V)']] };

  window.Labs['faraday-emf'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var s0 = cfg.start || {};
    var mode = s0.mode === 'coil' ? 'coil' : 'rail', checked = false, anim = null, x = 0.15;

    var modeSel = UI.select({ label: 'Modo', options: ['Barra sobre rieles', 'Bobina con B(t)'] });
    var R_ = {
      B: UI.slider({ label: 'Campo B (entra en la página)', min: 0.1, max: 1, step: 0.05, value: 0.5, unit: 'T' }, changed),
      L: UI.slider({ label: 'Largo de la barra L', min: 10, max: 50, step: 5, value: 30, unit: 'cm' }, changed),
      v: UI.slider({ label: 'Rapidez v', min: 0.5, max: 5, step: 0.5, value: 2, unit: 'm/s' }, changed),
      R: UI.slider({ label: 'Resistencia R', min: 0.5, max: 10, step: 0.5, value: 2, unit: 'Ω' }, changed)
    };
    var kindSel = UI.select({ label: 'Cómo cambia B', options: ['Rampa: B = B₀ + kt', 'Senoide: B = B_m sen(2πft)'] });
    var C_ = {
      N: UI.slider({ label: 'Vueltas N', min: 1, max: 200, step: 1, value: 50 }, changed),
      r: UI.slider({ label: 'Radio r', min: 1, max: 10, step: 0.5, value: 5, unit: 'cm' }, changed),
      th: UI.slider({ label: 'Ángulo θ entre B y la normal', min: 0, max: 90, step: 5, value: 0, unit: '°' }, changed),
      B0: UI.slider({ label: 'B₀', min: 0, max: 1, step: 0.05, value: 0.2, unit: 'T' }, changed),
      k: UI.slider({ label: 'Rapidez de cambio k = dB/dt', min: -1, max: 1, step: 0.05, value: 0.4, unit: 'T/s' }, changed),
      Bm: UI.slider({ label: 'Amplitud B_m', min: 0.05, max: 0.5, step: 0.05, value: 0.2, unit: 'T' }, changed),
      f: UI.slider({ label: 'Frecuencia f', min: 1, max: 10, step: 0.5, value: 2, unit: 'Hz' }, changed),
      t: UI.slider({ label: 'Instante t (fracción de la ventana)', min: 0, max: 1, step: 0.01, value: 0.3, fmt: function (v) { return (v * 100).toFixed(0) + ' %'; } }, changed)
    };
    var play = UI.button('Mover la barra', 'ghost', animate);
    var askSel = UI.select({ label: '¿Qué calculas?', options: KINDS.rail.map(function (k) { return k[1]; }) });
    var data = h('p', { class: 'lab-note rc-data' });
    var aIn = UI.input({ label: 'Tu resultado', type: 'text', inputmode: 'decimal', mono: false, hint: 'Usa SI: L y r en metros. Notación científica: <code>3.2e-3</code>.' });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts rc-facts' });
    var scene = UI.svg(640, 300, 'Escena del lab');
    var p1 = UI.svg(640, 220, 'Flujo contra el tiempo');
    var p2 = UI.svg(640, 220, 'Fem contra el tiempo');
    var title = h('figcaption', { class: 'lab-board__title sheet__title' }, ['Ley de Faraday']);
    var plotNote = h('p', { class: 'lab-note' });
    var leg = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--ref' }), 'flujo Φ']),
      h('li', {}, [h('i', { class: 'sw sw--trace' }), 'fem ε']),
      h('li', {}, [h('i', { class: 'sw sw--error' }), 'instante t · fuerza'])
    ]);
    var railBox = h('div', {}, [R_.B.node, R_.L.node, R_.v.node, R_.R.node, h('div', { class: 'lab-buttons' }, [play])]);
    var coilBox = h('div', {}, [kindSel.node, C_.N.node, C_.r.node, C_.th.node, C_.B0.node, C_.k.node, C_.Bm.node, C_.f.node, C_.t.node]);

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls rc-controls', novalidate: true }, [
        modeSel.node, railBox, coilBox,
        h('p', { class: 'lab-field__label rc-head' }, ['Reto']),
        askSel.node, data, aIn.node, h('div', { class: 'lab-buttons' }, [run]), note, verdict,
        h('p', { class: 'lab-field__label rc-head' }, ['Tablero']),
        facts
      ]),
      h('figure', { class: 'lab-board' }, [title, scene, p1, p2, leg, plotNote])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    aIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    modeSel.input.addEventListener('change', function () { stop(); mode = modeSel.input.value === '1' ? 'coil' : 'rail'; fillAsk(); reset(); });
    kindSel.input.addEventListener('change', reset);
    askSel.input.addEventListener('change', reset);

    function reset() { verdict.hidden = true; checked = false; draw(); }
    function changed() { if (checked) check(); else draw(); }
    function fillAsk() {
      askSel.input.innerHTML = '';
      KINDS[mode].forEach(function (k, i) { askSel.input.appendChild(h('option', { value: String(i) }, [k[1]])); });
    }
    function ask() { return (KINDS[mode][+askSel.input.value] || KINDS[mode][0])[0]; }
    function ckind() { return kindSel.input.value === '1' ? 'sine' : 'ramp'; }
    // Ventana de tiempo de las gráficas de la bobina: 2 s en la rampa, dos periodos en la senoide.
    function span() { return ckind() === 'sine' ? 2 / C_.f.get() : 2; }
    function params() {
      if (mode === 'rail') return { B: R_.B.get(), L: R_.L.get(), v: R_.v.get(), R: R_.R.get() };
      var T = span(), t = Number((C_.t.get() * T).toPrecision(3));
      return { kind: ckind(), N: C_.N.get(), r: C_.r.get(), th: C_.th.get(), B0: C_.B0.get(), k: C_.k.get(), Bm: C_.Bm.get(), f: C_.f.get(), t: t };
    }

    function stop() { if (anim) { cancelAnimationFrame(anim); anim = null; } play.textContent = 'Mover la barra'; }
    function animate() {
      if (anim) { stop(); return; }
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { x = 0.6; draw(); return; }
      var t0 = null, x0 = x;
      play.textContent = 'Detener';
      function step(ts) {
        if (t0 === null) t0 = ts;
        // Cámara lenta: la barra avanza a v/10 para que se vea.
        x = x0 + R_.v.get() / 10 * (ts - t0) / 1000;
        if (x > 0.95) { x = 0.15; x0 = 0.15; t0 = ts; }
        draw();
        anim = requestAnimationFrame(step);
      }
      anim = requestAnimationFrame(step);
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
    function arrowD(x1, y1, dx, dy) {
      var L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, hh = Math.min(11, L * 0.45), ex = x1 + dx, ey = y1 + dy;
      return 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
        'M' + (ex - ux * hh - uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh + ux * hh * 0.6).toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
        'L' + (ex - ux * hh + uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh - ux * hh * 0.6).toFixed(1);
    }
    // ⊗ (entra) o ⊙ (sale) en (x, y).
    function bsym(svg, x0, y0, r, into, op) {
      var g = el(svg, 'g', { opacity: op == null ? 1 : op });
      el(g, 'circle', { cx: x0, cy: y0, r: r, 'class': 'aux', fill: 'none', 'stroke-width': 1.6 });
      if (into) path(g, 'M' + (x0 - r * 0.6) + ' ' + (y0 - r * 0.6) + 'L' + (x0 + r * 0.6) + ' ' + (y0 + r * 0.6) + 'M' + (x0 + r * 0.6) + ' ' + (y0 - r * 0.6) + 'L' + (x0 - r * 0.6) + ' ' + (y0 + r * 0.6), 'aux', 1.6);
      else el(g, 'circle', { cx: x0, cy: y0, r: r * 0.25, 'class': 'dot-aux' });
    }

    function drawRail(p) {
      scene.innerHTML = '';
      var g = el(scene, 'g', { 'class': 'sketch' }), r = rail(p.B, p.L, p.v, p.R, x);
      var x0 = 70, x1 = 610, yT = 60, Lpx = 40 + p.L * 3.6, yB = yT + Lpx, bx = x0 + (x1 - x0 - 30) * x;
      for (var i = 0; i < 9; i++) for (var j = 0; j < 4; j++) bsym(g, 100 + i * 60, yT + 22 + j * (Lpx - 44) / 3, 7, true, 0.4 + 0.6 * p.B);
      path(g, 'M' + x0 + ' ' + yT + 'H' + x1 + 'M' + x0 + ' ' + yB + 'H' + x1, 'axis', 3);
      // Resistor vertical en x0.
      var zz = 'M' + x0 + ' ' + yT + 'V' + (yT + Lpx / 2 - 30);
      for (var k = 0; k < 6; k++) zz += 'L' + (x0 + (k % 2 ? 9 : -9)) + ' ' + (yT + Lpx / 2 - 25 + k * 10);
      path(g, zz + 'L' + x0 + ' ' + (yT + Lpx / 2 + 30) + 'V' + yB, 'ref', 2.6);
      tx(g, x0 - 16, yT + Lpx / 2 + 6, 'R', 'end', 20);
      // Barra, su velocidad, la corriente (sube por la barra) y la fuerza magnética (hacia atrás).
      path(g, 'M' + bx + ' ' + (yT - 12) + 'V' + (yB + 12), 'ref', 6);
      path(g, arrowD(bx + 12, yT - 26, 50, 0), 'student', 3);
      tx(g, bx + 70, yT - 20, 'v', 'start', 19);
      var op = Math.max(0.25, Math.min(1, r.I / 3));
      path(g, arrowD(bx + 16, yB - 20, 0, -(Lpx - 40)), 'trace', 3.2, { opacity: op.toFixed(2) });
      tx(g, bx + 24, yT + Lpx / 2 + 6, 'I', 'start', 19);
      path(g, arrowD(bx - 8, yT + Lpx / 2, -Math.min(90, 20 + 25 * r.F), 0), 'error', 3.4);
      tx(g, bx - 16, yT + Lpx / 2 - 12, 'F', 'end', 19);
      // Área encerrada.
      el(g, 'rect', { x: x0 + 2, y: yT + 2, width: Math.max(0, bx - x0 - 4), height: Lpx - 4, 'class': 'area-fill' });
      tx(g, 20, 292, 'ε = BLv = ' + UI.fmt(r.emf, 4) + ' V', 'start', 18);
      tx(g, 330, 292, 'I = ' + UI.fmt(r.I, 4) + ' A', 'middle', 18);
      tx(g, 620, 292, 'F = ' + UI.fmt(r.F, 4) + ' N', 'end', 18);
      tx(g, x1, yT - 20, 'B ⊗ entra', 'end', 17);
      // Gráficas: Φ(x) crece lineal y ε es constante. Eje t de 0 a 1 s (la barra recorre v·t).
      var tt = 1, phiMax = p.B * r.L * (0.15 + p.v * tt);
      var P = window.LabPlot(p1, { x: [0, tt], y: [0, phiMax * 1.15] });
      P.clear().grid().axes();
      P.curve(function (t) { return p.B * r.L * (0.15 + p.v * t); }, 'ref', 3);
      P.label(0, phiMax * 1.15, 'Φ (Wb)', 'start', 15, 6, 22);
      P.label(tt, 0, 't (s)', 'end', 15, -4, -10);
      var Q = window.LabPlot(p2, { x: [0, tt], y: [0, r.emf * 1.5] });
      Q.clear().grid().axes();
      Q.curve(function () { return r.emf; }, 'trace', 3);
      Q.label(0, r.emf * 1.5, 'ε (V)', 'start', 15, 6, 22);
      Q.label(tt, 0, 't (s)', 'end', 15, -4, -10);
      plotNote.textContent = 'El área crece a razón de Lv cada segundo: Φ = BLx sube en línea recta y su pendiente, BLv, es la fem (constante).';
      return r;
    }

    function drawCoil(p) {
      scene.innerHTML = '';
      var g = el(scene, 'g', { 'class': 'sketch' }), c = coil(p.kind, p, p.t);
      var cx = 230, cy = 145, rad = 40 + p.r * 9, into = c.B < 0 ? false : true, mag = Math.abs(c.B);
      var Bmax = p.kind === 'sine' ? p.Bm : Math.max(Math.abs(p.B0), Math.abs(p.B0 + 2 * p.k), 0.05);
      var op = 0.15 + 0.85 * Math.min(1, mag / Bmax);
      for (var i = -3; i <= 3; i++) for (var j = -2; j <= 2; j++) bsym(g, cx + i * 52, cy + j * 52, 8, into, op);
      // Espira vista de frente (comprimida por cos θ si está inclinada).
      el(g, 'ellipse', { cx: cx, cy: cy, rx: (rad * Math.max(0.15, Math.cos(p.th * RAD))).toFixed(1), ry: rad, 'class': 'ref', fill: 'none', 'stroke-width': 4 });
      tx(g, cx, cy + rad + 26, 'N = ' + p.N + ' vueltas, r = ' + p.r + ' cm', 'middle', 17);
      tx(g, 440, 60, 'B(t) = ' + UI.fmt(c.B, 3) + ' T', 'start', 18);
      tx(g, 440, 90, (c.B >= 0 ? '⊗ entra' : '⊙ sale') + (p.th ? ', θ = ' + p.th + '°' : ''), 'start', 17);
      tx(g, 440, 130, 'Φ = ' + UI.fmt(c.phi * 1000, 4) + ' mWb', 'start', 18);
      tx(g, 440, 160, '(por vuelta)', 'start', 15);
      tx(g, 440, 200, '|ε| = ' + UI.fmt(c.emfMag, 4) + ' V', 'start', 18);
      tx(g, 440, 230, 't = ' + UI.fmt(p.t, 3) + ' s', 'start', 17);
      var T = span(), n = 200, ys = [], es = [];
      for (var k = 0; k <= n; k++) { var cc = coil(p.kind, p, T * k / n); ys.push(cc.phi * 1000); es.push(cc.emf); }
      var yr = window.LabPlot.range(ys), er = window.LabPlot.range(es);
      var P = window.LabPlot(p1, { x: [0, T], y: yr });
      P.clear().grid().axes();
      P.curve(function (t) { return coil(p.kind, p, t).phi * 1000; }, 'ref', 3);
      P.segments([[[p.t, yr[0]], [p.t, yr[1]]]], 'error', 1.6);
      P.point(p.t, c.phi * 1000, 'dot-error', 6);
      P.label(0, yr[1], 'Φ (mWb)', 'start', 15, 6, 22);
      P.label(T, yr[0], 't (s)', 'end', 15, -4, -10);
      var Q = window.LabPlot(p2, { x: [0, T], y: er });
      Q.clear().grid().axes();
      Q.curve(function (t) { return coil(p.kind, p, t).emf; }, 'trace', 3);
      Q.segments([[[p.t, er[0]], [p.t, er[1]]]], 'error', 1.6);
      Q.point(p.t, c.emf, 'dot-error', 6);
      Q.label(0, er[1], 'ε (V)', 'start', 15, 6, 22);
      Q.label(T, er[0], 't (s)', 'end', 15, -4, -10);
      plotNote.textContent = p.kind === 'sine'
        ? 'ε = −N dΦ/dt: la fem es máxima donde Φ cruza el cero (pendiente máxima) y vale cero en los picos del flujo.'
        : 'En la rampa Φ es una recta: su pendiente no cambia y la fem es constante, ε = −NA cos θ · k.';
      return c;
    }

    function draw() {
      var p = params(), rail0 = mode === 'rail';
      railBox.hidden = !rail0; coilBox.hidden = rail0;
      var sine = ckind() === 'sine';
      C_.B0.node.hidden = sine; C_.k.node.hidden = sine; C_.Bm.node.hidden = !sine; C_.f.node.hidden = !sine;
      title.textContent = rail0 ? 'Barra sobre rieles en un campo uniforme' : 'Bobina en un campo que cambia';
      var rows;
      if (rail0) {
        var r = drawRail(p);
        rows = [['L', UI.fmt(r.L, 4) + ' m'], ['Φ = BLx', UI.fmt(r.phi, 4) + ' Wb (x = ' + UI.fmt(x, 3) + ' m)'], ['ε = BLv', UI.fmt(r.emf, 4) + ' V'], ['I = ε/R', UI.fmt(r.I, 4) + ' A'],
          ['F = ILB', UI.fmt(r.F, 4) + ' N'], ['potencia mecánica F·v', UI.fmt(r.Pm, 4) + ' W'], ['potencia en R, I²R', UI.fmt(r.Pe, 4) + ' W']];
        data.textContent = 'Datos: B = ' + p.B + ' T, L = ' + p.L + ' cm, v = ' + p.v + ' m/s, R = ' + p.R + ' Ω.';
      } else {
        var c = drawCoil(p);
        rows = [['A = πr²', UI.fmt(c.A, 4) + ' m²'], ['B(t)', UI.fmt(c.B, 4) + ' T'], ['Φ por vuelta', UI.fmt(c.phi, 4) + ' Wb'], ['NΦ', UI.fmt(c.link, 4) + ' Wb'], ['ε = −N dΦ/dt', UI.fmt(c.emf, 4) + ' V']];
        data.textContent = 'Datos: N = ' + p.N + ', r = ' + p.r + ' cm, θ = ' + p.th + '°, ' + (p.kind === 'sine' ? 'B = ' + p.Bm + ' sen(2π·' + p.f + 't) T' : 'B = ' + p.B0 + ' + (' + p.k + ')t T') + ', t = ' + p.t + ' s.';
      }
      facts.innerHTML = '';
      rows.forEach(function (rw) { facts.appendChild(h('dt', {}, [rw[0]])); facts.appendChild(h('dd', {}, [rw[1]])); });
    }

    function parse(s) { return window.CBExercises ? window.CBExercises.parseNumber(s) : parseFloat(String(s).replace(',', '.')); }
    function check() {
      var val = parse(aIn.input.value), p = params(), k = ask();
      if (mode === 'coil' && p.kind === 'ramp' && p.k === 0) {
        UI.verdict(verdict, 'warn', 'B no cambia', 'Con k = 0 el flujo es constante y no hay fem. Mueve k.');
        checked = true; draw(); return;
      }
      var r = diagnose(k, mode, p, val), msg = MSG[r] || MSG.bad, truth = answers(k, mode, p).truth;
      UI.verdict(verdict, r === 'ok' ? 'ok' : r === 'bad' ? 'bad' : 'warn', msg[0], msg[1] + (r === 'ok' ? '' : ' Valor del lab: ' + UI.fmt(truth, 4) + '.'));
      checked = true;
      draw();
    }

    // Ejemplo cargado: un compañero calculó la fem con L en centímetros.
    modeSel.input.value = mode === 'coil' ? '1' : '0';
    fillAsk();
    var p0 = params();
    aIn.input.value = mode === 'rail' ? UI.fmt(answers('emf', 'rail', p0).cmL, 4) : UI.fmt(answers('emf', 'coil', p0).cm2, 4);
    note.textContent = 'Ejemplo cargado: así calculó un compañero la fem. ¿Ves el error? Luego mueve B, L, v o R, o cambia a la bobina.';
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
