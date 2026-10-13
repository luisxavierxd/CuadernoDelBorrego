/* =====================================================================
   Lab rl-circuit (Física 3 · S14): crecimiento y decaimiento de la corriente.
   Un circuito RL con un interruptor de dos posiciones: en «a» la batería
   empuja corriente por R y L; en «b» la batería queda fuera y la corriente
   del inductor decae por R. Deslizadores de R, L y ε y un cursor de tiempo
   (o la animación) muestran la corriente subiendo o bajando, las curvas I(t),
   V_R(t) y V_L(t) con τ = L/R marcado y el tablero de energías (entregada,
   guardada en el inductor y disipada en R). Reto: τ, I o |V_L| en el instante
   del cursor, o el tiempo para llegar a una corriente. El «casi»:
     RoverL  usó τ = R/L
     LR      usó τ = LR (como en el RC)
     plusExp escribió e^{+t/τ} en lugar de e^{−t/τ}
     noOne   olvidó el 1 − del crecimiento (o lo puso en el decaimiento)
     log10   usó log₁₀ en lugar de ln
     u1000, u0001  mezcló prefijos (mH, ms, mA): el resultado sale ×1000 o ÷1000
     noDecay dio la corriente final ε/R (o la inicial), como si no cambiara
     wrongV  dio el voltaje del resistor en lugar del del inductor (o al revés)
   LabMath.rl es puro y no depende de unidades: sirve en SI o con el juego
   coherente Ω, mH, V → τ y t en ms, I en A, energía en mJ (mH/Ω = ms; mH·A² = mJ).
   Trae también un integrador RK4 propio de la EDO L·dI/dt + IR = ε.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  function tau(L, R) { return L / R; }
  function fraction(k) { return 1 - Math.exp(-k); }
  // Crecimiento desde I = 0 con la batería ε.
  function grow(L, R, eps, t) {
    var T = L / R, x = Math.exp(-t / T), If = eps / R, I = If * (1 - x);
    var Ubat = eps * If * (t - T * (1 - x)), UL = 0.5 * L * I * I;
    return { tau: T, If: If, I0: 0, I: I, VR: I * R, VL: eps * x, VLmag: eps * x, dIdt: eps / L * x, frac: 1 - x, Ubat: Ubat, UL: UL, Ur: Ubat - UL };
  }
  // Decaimiento: sin batería, desde I₀ = ε/R. V_L = −IR (el inductor empuja la corriente).
  function decay(L, R, eps, t) {
    var T = L / R, x = Math.exp(-t / T), I0 = eps / R, I = I0 * x, U0 = 0.5 * L * I0 * I0, UL = 0.5 * L * I * I;
    return { tau: T, If: 0, I0: I0, I: I, VR: I * R, VL: -I * R, VLmag: I * R, dIdt: -I / T, frac: x, Ubat: 0, U0: U0, UL: UL, Ur: U0 - UL };
  }
  function state(mode, L, R, eps, t) { return mode === 'd' ? decay(L, R, eps, t) : grow(L, R, eps, t); }
  // Tiempo para llegar a la corriente I (en el crecimiento I < ε/R; en el decaimiento I < ε/R también).
  function timeTo(mode, L, R, eps, I) {
    var T = L / R, If = eps / R;
    return mode === 'd' ? T * Math.log(If / I) : -T * Math.log(1 - I / If);
  }
  // Energía guardada con la corriente final: ½L(ε/R)².
  function stored(L, R, eps) { var I = eps / R; return 0.5 * L * I * I; }
  // RK4 propio sobre y = [I, W_R, W_bat]: dI/dt = (E − IR)/L, dW_R/dt = I²R, dW_bat/dt = EI.
  function rk4(mode, L, R, eps, t, n) {
    n = Math.max(1, Math.round(n || 1000));
    var E = mode === 'd' ? 0 : eps, h = t / n, y = [mode === 'd' ? eps / R : 0, 0, 0];
    function f(s) { return [(E - s[0] * R) / L, s[0] * s[0] * R, E * s[0]]; }
    function add(a, b, k) { return [a[0] + k * b[0], a[1] + k * b[1], a[2] + k * b[2]]; }
    for (var k = 0; k < n; k++) {
      var k1 = f(y), k2 = f(add(y, k1, h / 2)), k3 = f(add(y, k2, h / 2)), k4 = f(add(y, k3, h));
      for (var j = 0; j < 3; j++) y[j] += h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]);
    }
    return { I: y[0], VR: y[0] * R, VL: E - y[0] * R, Wr: y[1], Wbat: y[2], UL: 0.5 * L * y[0] * y[0] };
  }

  // Reto. p: { R, L, eps, t, I } en un juego coherente. kind: 'tau' · 'I' · 'VL' (|V_L|) · 'tI' (tiempo para I*).
  function answers(kind, mode, p) {
    var T = p.L / p.R, s = state(mode, p.L, p.R, p.eps, p.t), out = {}, d = mode === 'd';
    var If = p.eps / p.R, x = Math.exp(-p.t / T), xp = Math.exp(p.t / T), xb = Math.exp(-p.t / (p.R / p.L));
    if (kind === 'tau') { out.truth = T; out.RoverL = p.R / p.L; out.LR = p.L * p.R; }
    else if (kind === 'I') {
      out.truth = s.I;
      out.plusExp = d ? If * xp : If * (1 - xp);
      out.noOne = d ? If * (1 - x) : If * x;
      out.noDecay = If;
      out.RoverL = d ? If * xb : If * (1 - xb);
    } else if (kind === 'VL') {
      out.truth = s.VLmag;
      out.wrongV = d ? p.eps * (1 - x) : p.eps * (1 - x);       // el «otro» voltaje de la malla
      out.plusExp = p.eps * xp;
      out.noDecay = p.eps;
      out.RoverL = p.eps * xb;
    } else {
      var r = d ? p.I / If : 1 - p.I / If;
      out.truth = timeTo(mode, p.L, p.R, p.eps, p.I);
      out.log10 = -T * Math.log10(r);
      out.noOne = d ? -T * Math.log(1 - p.I / If) : -T * Math.log(p.I / If);
      out.RoverL = -(p.R / p.L) * Math.log(r);
    }
    out.u1000 = out.truth * 1000;
    out.u0001 = out.truth / 1000;
    return out;
  }
  function close(a, b, tol) { return Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-30); }
  function diagnose(kind, mode, p, student) {
    if (!isFinite(student)) return 'bad';
    var r = answers(kind, mode, p), tol = 0.01;
    if (close(student, r.truth, tol)) return 'ok';
    var keys = Object.keys(r).filter(function (k) { return k !== 'truth'; });
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (!isFinite(r[k]) || close(r[k], r.truth, 0.02)) continue;
      if (close(student, r[k], tol)) return k;
    }
    return 'bad';
  }

  window.LabMath.rl = {
    tau: tau, fraction: fraction, grow: grow, decay: decay, state: state, timeTo: timeTo, stored: stored,
    rk4: rk4, answers: answers, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var MSG = {
    ok: ['Coincide', 'Tu resultado es el del lab.'],
    RoverL: ['τ es L entre R', 'La constante de tiempo de un circuito RL es τ = L/R, no R/L. Con mH y Ω sale en ms.'],
    LR: ['No es L por R', 'En el RC es τ = RC, pero en el RL es τ = L/R: más resistencia hace el circuito más rápido.'],
    plusExp: ['El exponente es negativo', 'Las exponenciales del circuito RL decaen: e^(−t/τ).'],
    noOne: ['Revisa el «1 −»', 'Al crecer, I = (ε/R)(1 − e^(−t/τ)) empieza en 0. Al decaer, I = I₀e^(−t/τ) empieza en I₀. Usaste la fórmula del otro caso.'],
    log10: ['Es logaritmo natural', 'Al despejar t de una exponencial de base e se usa ln: t = −τ ln(1 − I/I_f).'],
    u1000: ['Revisa los prefijos', 'Tu número sale 1000 veces más grande. Con mH y Ω, L/R ya está en ms.'],
    u0001: ['Revisa los prefijos', 'Tu número sale 1000 veces más chico. ¿Lo diste en segundos o en henries cuando se pedía ms o mH?'],
    noDecay: ['Ese es un valor extremo', 'ε/R es la corriente final del crecimiento (o la inicial del decaimiento), y ε es el voltaje del inductor solo en t = 0. En medio cambian con e^(−t/τ).'],
    wrongV: ['Ese es el voltaje del resistor', 'En la malla, ε = V_R + V_L. El inductor tiene V_L = ε e^(−t/τ) al crecer; el resistor, IR.'],
    bad: ['No coincide', 'τ = L/R; al crecer I = (ε/R)(1 − e^(−t/τ)) y V_L = ε e^(−t/τ); al decaer I = I₀e^(−t/τ) y |V_L| = IR; t = −τ ln(1 − I/I_f) al crecer y t = τ ln(I₀/I) al decaer.']
  };
  var KINDS = [['tau', 'τ = L/R (en ms)'], ['I', 'I en este instante (en A)'], ['VL', '|V_L| en este instante (en V)'], ['tI', 'tiempo para que I llegue a I* (en ms)']];
  var VIEWS = [['I', 'Corriente I (A)'], ['V', 'Voltajes V_R y V_L (V)']];
  function nice(x) { return x > 0 ? Number(x.toPrecision(3)) : 0; }
  function fmtU(u, fmt) { return Math.abs(u) >= 1e3 ? fmt(u / 1e3, 4) + ' J' : fmt(u, 4) + ' mJ'; }

  window.Labs['rl-circuit'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, M = window.LabMath.rl;
    var s0 = cfg.start || {};
    var mode = s0.mode === 'd' ? 'd' : 'c', checked = false, anim = null;

    var modeSel = UI.select({ label: 'Interruptor', options: ['a · conectar la batería', 'b · quitar la batería (decae por R)'] });
    var S = {
      R: UI.slider({ label: 'Resistencia R', min: 10, max: 200, step: 10, value: s0.R || 50, unit: 'Ω' }, changed),
      L: UI.slider({ label: 'Inductancia L', min: 10, max: 1000, step: 10, value: s0.L || 200, unit: 'mH' }, changed),
      eps: UI.slider({ label: 'Batería ε', min: 1, max: 24, step: 1, value: s0.eps || 12, unit: 'V' }, changed),
      k: UI.slider({ label: 'Tiempo t (en múltiplos de τ)', min: 0, max: 6, step: 0.05, value: s0.k != null ? s0.k : 1, fmt: function (v) { return v.toFixed(2) + ' τ'; } }, moveT)
    };
    var play = UI.button('Animar desde t = 0', 'ghost', animate);
    var viewSel = UI.select({ label: 'Gráfica', options: VIEWS.map(function (v) { return v[1]; }) });
    var kSel = UI.select({ label: '¿Qué calculas?', options: KINDS.map(function (k) { return k[1]; }) });
    var target = UI.slider({ label: 'Corriente objetivo I* (% de ε/R)', min: 5, max: 95, step: 5, value: 80, unit: '%' }, function () { verdict.hidden = true; checked = false; draw(); });
    var data = h('p', { class: 'lab-note rc-data' });
    var aIn = UI.input({ label: 'Tu resultado', type: 'number', step: 'any', inputmode: 'decimal', mono: false, hint: 'Con mH y Ω, L/R sale en ms; V/Ω da A.' });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts rc-facts' });
    var circ = UI.svg(640, 250, 'Circuito RL: batería, interruptor de dos posiciones, resistor e inductor');
    var plot = UI.svg(640, 340, 'Curvas del circuito RL contra el tiempo, con la constante de tiempo marcada');
    var title = h('figcaption', { class: 'lab-board__title sheet__title' }, ['Circuito RL']);
    var plotNote = h('p', { class: 'lab-note rc-plotnote' });
    var leg = {
      i: h('li', {}, [h('i', { class: 'sw sw--ref' }), 'I(t)']),
      vr: h('li', {}, [h('i', { class: 'sw sw--ref' }), 'V_R (resistor)']),
      vl: h('li', {}, [h('i', { class: 'sw sw--trace' }), 'V_L (inductor)']),
      tau: h('li', {}, [h('i', { class: 'sw sw--aux sw--dashed' }), 'τ, 2τ, 3τ…']),
      now: h('li', {}, [h('i', { class: 'sw sw--error' }), 'instante t'])
    };

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls rc-controls', novalidate: true }, [
        modeSel.node, S.R.node, S.L.node, S.eps.node, S.k.node,
        h('div', { class: 'lab-buttons' }, [play]),
        viewSel.node,
        h('p', { class: 'lab-field__label rc-head' }, ['Reto']),
        kSel.node, target.node, data, aIn.node, h('div', { class: 'lab-buttons' }, [run]), note, verdict,
        h('p', { class: 'lab-field__label rc-head' }, ['Tablero']),
        facts
      ]),
      h('figure', { class: 'lab-board' }, [
        title, circ, plot,
        h('ul', { class: 'lab-legend' }, [leg.i, leg.vr, leg.vl, leg.tau, leg.now]),
        plotNote
      ])
    ]));
    var form = mount.querySelector('form');
    form.addEventListener('submit', function (e) { e.preventDefault(); check(); });
    aIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    modeSel.input.addEventListener('change', function () { stop(); mode = modeSel.input.value === '1' ? 'd' : 'c'; S.k.set(0); verdict.hidden = true; checked = false; draw(); });
    viewSel.input.addEventListener('change', draw);
    kSel.input.addEventListener('change', function () { verdict.hidden = true; checked = false; draw(); });

    function view() { return (VIEWS[+viewSel.input.value] || VIEWS[0])[0]; }
    function kind() { return (KINDS[+kSel.input.value] || KINDS[0])[0]; }
    // Unidades: Ω, mH, V → τ y t en ms, I en A, energía en mJ.
    function params() {
      var R = S.R.get(), L = S.L.get(), T = L / R, eps = S.eps.get();
      return { R: R, L: L, eps: eps, t: nice(S.k.get() * T), I: Number((target.get() / 100 * eps / R).toPrecision(3)), tau: T };
    }
    function changed() { if (checked) check(); else draw(); }
    function moveT() { if (checked) check(); else draw(); }

    function stop() { if (anim) { cancelAnimationFrame(anim); anim = null; } play.textContent = 'Animar desde t = 0'; }
    function animate() {
      if (anim) { stop(); return; }
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { S.k.set(5); moveT(); return; }
      var t0 = null;
      play.textContent = 'Detener';
      function step(ts) {
        if (t0 === null) t0 = ts;
        var k = Math.min(6, (ts - t0) / 5000 * 6);
        S.k.set(Math.round(k / 0.05) * 0.05);
        moveT();
        if (k < 6) anim = requestAnimationFrame(step); else stop();
      }
      anim = requestAnimationFrame(step);
    }

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
    function path(svg, d, cls, w, extra) {
      var a = { d: d, 'class': cls, 'stroke-width': w || 2.2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
      Object.keys(extra || {}).forEach(function (k) { a[k] = extra[k]; });
      return el(svg, 'path', a);
    }

    function drawCircuit(p, s) {
      circ.innerHTML = '';
      var yt = 50, yb = 190, xb = 70, xA = 200, xB = 210, yB = 86, xP = 250, xc = 480, cy = 120, d = mode === 'd';
      path(circ, 'M' + xb + ' ' + (cy - 7) + 'V' + yt + 'H' + xA, 'axis');
      path(circ, 'M' + xB + ' ' + yB + 'V' + yb, 'axis');
      path(circ, 'M' + xP + ' ' + yt + 'H310M370 ' + yt + 'H' + xc + 'V' + (cy - 40) + 'M' + xc + ' ' + (cy + 40) + 'V' + yb + 'H' + xb + 'V' + (cy + 7), 'axis');
      path(circ, 'M' + (xb - 20) + ' ' + (cy - 7) + 'H' + (xb + 20), 'ref', 3);
      path(circ, 'M' + (xb - 10) + ' ' + (cy + 7) + 'H' + (xb + 10), 'ref', 6);
      txt(circ, xb - 28, cy - 2, '+', 'end', 20);
      txt(circ, xb + 28, cy + 6, 'ε = ' + p.eps + ' V', 'start', 17);
      el(circ, 'circle', { cx: xA, cy: yt, r: 4.5, 'class': 'dot-ref' });
      el(circ, 'circle', { cx: xB, cy: yB, r: 4.5, 'class': 'dot-ref' });
      el(circ, 'circle', { cx: xP, cy: yt, r: 4.5, 'class': 'dot-ref' });
      el(circ, 'circle', { cx: xB, cy: yb, r: 4.5, 'class': 'dot-ref' });
      path(circ, 'M' + xP + ' ' + yt + 'L' + (d ? xB : xA) + ' ' + (d ? yB : yt), 'student', 3.4);
      txt(circ, xA - 4, yt - 14, 'a', 'end', 17);
      txt(circ, xB - 10, yB + 22, 'b', 'end', 17);
      var zz = 'M310 ' + yt;
      for (var i = 0; i < 6; i++) zz += 'L' + (315 + i * 10) + ' ' + (yt + (i % 2 ? 9 : -9));
      path(circ, zz + 'L370 ' + yt, 'ref', 2.6);
      txt(circ, 340, yt - 20, 'R = ' + p.R + ' Ω', 'middle', 17);
      // Inductor vertical: 5 rizos entre cy − 40 y cy + 40.
      var ind = 'M' + xc + ' ' + (cy - 40);
      for (var j = 0; j < 5; j++) ind += 'A9 12 0 0 1 ' + xc + ' ' + (cy - 40 + 16 * (j + 1));
      path(circ, ind, 'ref', 2.6);
      txt(circ, xc + 24, cy + 6, 'L = ' + p.L + ' mH', 'start', 17);
      // Campo del inductor: más marcado con más corriente.
      var fr = Math.max(0, Math.min(1, s.I / (p.eps / p.R)));
      path(circ, 'M' + (xc - 30) + ' ' + (cy + 30) + 'V' + (cy - 30) + 'm-6 10l6 -10l6 10', 'aux', 2.4, { opacity: (0.15 + 0.85 * fr).toFixed(2) });
      var o = Math.max(0.12, fr);
      path(circ, 'M400 ' + (yt + 22) + 'H450M440 ' + (yt + 15) + 'L450 ' + (yt + 22) + 'L440 ' + (yt + 29), 'aux', 3.2, { opacity: o.toFixed(2) });
      txt(circ, 425, yt + 48, 'I', 'middle', 18);
      txt(circ, 14, 236, 't = ' + UI.fmt(p.t, 4) + ' ms', 'start', 18);
      txt(circ, 330, 236, 'I = ' + UI.fmt(s.I, 4) + ' A', 'middle', 18);
      txt(circ, 626, 236, 'V_L = ' + UI.fmt(s.VL, 4) + ' V', 'end', 18);
    }

    function drawPlot(p, s) {
      var T = p.tau, d = mode === 'd', v = view(), If = p.eps / p.R, xmax = 6 * T;
      var top = v === 'V' ? p.eps : If;
      var P = window.LabPlot(plot, { x: [0, xmax], y: [0, 1.2 * top] });
      P.clear().grid().axes();
      for (var m = 1; m <= 5; m++) {
        var x = m * T;
        P.segments([[[x, 0], [x, 1.12 * top]]], 'aux', 1.4);
        P.label(x, 1.2 * top, (m === 1 ? '' : m) + 'τ', 'middle', 15, 0, 2);
      }
      plot.querySelectorAll('path.aux').forEach(function (n) { n.setAttribute('stroke-dasharray', '5 6'); });
      var st = function (tt) { return M.state(mode, p.L, p.R, p.eps, tt); };
      var mark;
      if (v === 'V') {
        if (!d) P.segments([[[0, p.eps], [xmax, p.eps]]], 'axis', 1.4);
        P.curve(function (tt) { return st(tt).VR; }, 'ref', 3);
        P.curve(function (tt) { return st(tt).VLmag; }, 'trace', 3);
        mark = s.VR;
        P.point(p.t, s.VLmag, 'dot-error', 6);
      } else {
        if (!d) P.segments([[[0, If], [xmax, If]]], 'axis', 1.4);
        P.curve(function (tt) { return st(tt).I; }, 'ref', 3);
        mark = s.I;
        var yT = st(T).I;
        P.point(T, yT, 'dot-ref', 5);
        P.label(T, yT, d ? '37 %' : '63 %', 'start', 15, 8, d ? -10 : 22);
        if (!d) P.label(xmax, If, 'ε/R', 'end', 16, -6, -10);
      }
      P.segments([[[p.t, 0], [p.t, 1.12 * top]]], 'error', 1.6);
      P.point(p.t, mark, 'dot-error', 6);
      P.label(0, 1.2 * top, v === 'V' ? 'V (volts)' : 'I (A)', 'start', 15, 6, 22);
      P.label(xmax, 0, 't (ms)', 'end', 15, -4, -10);
      leg.i.hidden = v !== 'I'; leg.vr.hidden = v !== 'V'; leg.vl.hidden = v !== 'V';
      plotNote.textContent = d
        ? (v === 'V' ? 'Sin batería, el inductor empuja la corriente: |V_L| = V_R en todo momento y los dos decaen juntos.' : 'La corriente no se apaga de golpe: cae a 37 % en cada τ.')
        : (v === 'V' ? 'V_R + V_L = ε en todo instante. Al principio todo el voltaje está en el inductor; al final, en el resistor.' : 'La corriente sube a 63 % de ε/R en τ y a más de 99 % en 5τ. Al final el inductor es un alambre.');
    }

    function draw() {
      var p = params(), s = M.state(mode, p.L, p.R, p.eps, p.t), d = mode === 'd';
      title.textContent = d ? 'Decaimiento: el inductor sostiene la corriente' : 'Crecimiento: la corriente sube poco a poco';
      drawCircuit(p, s);
      drawPlot(p, s);
      var k = kind();
      target.node.hidden = k !== 'tI';
      data.textContent = 'Datos: R = ' + p.R + ' Ω, L = ' + p.L + ' mH, ε = ' + p.eps + ' V' + (d ? ' (la corriente empieza en ε/R y la batería ya no está)' : ' (la corriente empieza en cero)') +
        (k === 'I' || k === 'VL' ? ', t = ' + UI.fmt(p.t, 4) + ' ms.' : k === 'tI' ? ', I* = ' + p.I + ' A.' : '.');
      var rk = M.rk4(mode, p.L, p.R, p.eps, p.t, 40), rows = [
        ['τ = L/R', UI.fmt(p.tau, 4) + ' ms'],
        ['t', UI.fmt(p.t, 4) + ' ms = ' + UI.fmt(p.t / p.tau, 3) + ' τ'],
        ['I', UI.fmt(s.I, 4) + ' A (' + UI.fmt(100 * s.I / (p.eps / p.R), 3) + ' % de ε/R)'],
        ['dI/dt', UI.fmt(s.dIdt, 4) + ' A/ms'],
        ['V_R = IR', UI.fmt(s.VR, 4) + ' V'],
        ['V_L', UI.fmt(s.VL, 4) + ' V'],
        ['batería entregó', fmtU(s.Ubat, UI.fmt)],
        [d ? 'queda en L' : 'guardada en L, ½LI²', fmtU(s.UL, UI.fmt)],
        ['disipada en R', fmtU(s.Ur, UI.fmt)],
        ['I con RK4 (40 pasos)', UI.fmt(rk.I, 6) + ' A']
      ];
      facts.innerHTML = '';
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    function check() {
      var val = parseFloat(String(aIn.input.value).replace(',', '.')), k = kind(), p = params();
      if (k === 'I' && mode === 'c' && p.t === 0) {
        UI.verdict(verdict, 'warn', 'Mueve el tiempo', 'En t = 0 la corriente es cero: mueve el cursor de tiempo antes de calcular.');
        checked = true; draw(); return;
      }
      var r = M.diagnose(k, mode, p, val), msg = MSG[r] || MSG.bad;
      UI.verdict(verdict, r === 'ok' ? 'ok' : r === 'bad' ? 'bad' : 'warn', msg[0], msg[1]);
      checked = true;
      draw();
    }

    // Ejemplo cargado: crecimiento con 50 Ω, 200 mH y 12 V en t = τ; un compañero olvidó el «1 −».
    modeSel.input.value = mode === 'd' ? '1' : '0';
    kSel.input.value = String(Math.max(0, KINDS.map(function (x) { return x[0]; }).indexOf(s0.kind || 'I')));
    var p0 = params();
    aIn.input.value = UI.fmt(M.answers(kind(), mode, p0).noOne, 4);
    note.textContent = 'Ejemplo cargado: así calculó un compañero la corriente en t = τ. ¿Ves el error? Luego cambia R, L o el tiempo, o pasa el interruptor a b para ver el decaimiento.';
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
