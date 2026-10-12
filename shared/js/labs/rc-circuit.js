/* =====================================================================
   Lab rc-circuit (Física 2 · S15): carga y descarga de un capacitor.
   Un circuito RC con un interruptor de dos posiciones: en «a» la batería
   carga el capacitor a través de R; en «b» la batería queda fuera y el
   capacitor se descarga por R. Deslizadores de R, C y ε y un cursor de
   tiempo (o la animación) muestran el capacitor llenándose, las curvas
   V_C(t), V_R(t), q(t) e i(t) con τ marcado y el tablero de energías
   (entregada, guardada y disipada). Reto: τ, q o i en el instante del
   cursor, o el tiempo para llegar a un voltaje. El «casi»:
     RoverC  usó τ = R/C
     plusExp escribió e^{+t/τ} en lugar de e^{−t/τ}
     noOne   olvidó el 1 − de la carga (o lo puso en la descarga)
     log10   usó log₁₀ en lugar de ln
     u1000, u0001  mezcló prefijos (μF, kΩ, ms): el resultado sale ×1000 o ÷1000
     noDecay dio la corriente máxima ε/R, como si no decayera
     wrongV  calculó la corriente con el voltaje del capacitor (V_C/R) y no con el de R
   LabMath.rc es puro y no depende de unidades: sirve en SI o con el juego
   coherente kΩ, μF, ms, V → μC, mA, μJ (kΩ·μF = ms; V/kΩ = mA; μF·V² = μJ).
   Trae también un integrador RK4 propio de la EDO R·dq/dt + q/C = ε, que
   las pruebas comparan contra la solución analítica.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  function tau(R, C) { return R * C; }
  // Fracción de la carga final a los k tiempos característicos: 1 − e^{−k}.
  function fraction(k) { return 1 - Math.exp(-k); }
  // Carga desde q = 0 con la batería ε. Corriente positiva = sentido de carga.
  function charge(R, C, eps, t) {
    var T = R * C, x = Math.exp(-t / T), Qf = C * eps, I0 = eps / R, q = Qf * (1 - x), i = I0 * x;
    var Ubat = eps * q, Uc = q * q / (2 * C);
    return { tau: T, Qf: Qf, I0: I0, q: q, i: i, iMag: i, VC: q / C, VR: i * R, frac: 1 - x, Ubat: Ubat, Uc: Uc, Ur: Ubat - Uc };
  }
  // Descarga por R desde V₀ (q₀ = CV₀). La corriente va al revés: i < 0.
  function discharge(R, C, V0, t) {
    var T = R * C, x = Math.exp(-t / T), Q0 = C * V0, I0 = V0 / R, q = Q0 * x, iMag = I0 * x;
    var U0 = 0.5 * C * V0 * V0, Uc = q * q / (2 * C);
    return { tau: T, Q0: Q0, I0: I0, q: q, i: -iMag, iMag: iMag, VC: q / C, VR: iMag * R, frac: x, Ubat: 0, U0: U0, Uc: Uc, Ur: U0 - Uc };
  }
  function state(mode, R, C, eps, t) { return mode === 'd' ? discharge(R, C, eps, t) : charge(R, C, eps, t); }
  // Tiempo para que V_C llegue a V: en la carga desde 0 hasta V < ε; en la descarga desde ε hasta V.
  function timeTo(mode, R, C, eps, V) {
    var T = R * C;
    return mode === 'd' ? T * Math.log(eps / V) : -T * Math.log(1 - V / eps);
  }
  // Carga completa: la batería entrega Qε; la mitad queda en C y la otra mitad se va en R.
  function fullCharge(C, eps) { var Ub = C * eps * eps; return { Q: C * eps, Ubat: Ub, Uc: Ub / 2, Ur: Ub / 2 }; }
  // RK4 propio sobre y = [q, W_R, W_bat]: dq/dt = (E − q/C)/R, dW_R/dt = i²R, dW_bat/dt = Ei.
  // E = ε en la carga (q₀ = 0) y E = 0 en la descarga (q₀ = Cε). n pasos iguales en [0, t].
  function rk4(mode, R, C, eps, t, n) {
    n = Math.max(1, Math.round(n || 1000));
    var E = mode === 'd' ? 0 : eps, h = t / n, y = [mode === 'd' ? C * eps : 0, 0, 0];
    function f(s) { var i = (E - s[0] / C) / R; return [i, i * i * R, E * i]; }
    function add(a, b, k) { return [a[0] + k * b[0], a[1] + k * b[1], a[2] + k * b[2]]; }
    for (var k = 0; k < n; k++) {
      var k1 = f(y), k2 = f(add(y, k1, h / 2)), k3 = f(add(y, k2, h / 2)), k4 = f(add(y, k3, h));
      for (var j = 0; j < 3; j++) y[j] += h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]);
    }
    var i = (E - y[0] / C) / R;
    return { q: y[0], i: i, VC: y[0] / C, VR: Math.abs(i) * R, Wr: y[1], Wbat: y[2], Uc: y[0] * y[0] / (2 * C) };
  }

  // Respuesta real y errores típicos del reto. p: { R, C, eps, t, V } en un juego coherente de unidades.
  // kind: 'tau' · 'q' (carga en t) · 'i' (corriente en t, magnitud) · 'tV' (tiempo para V_C = V).
  function answers(kind, mode, p) {
    var T = p.R * p.C, s = state(mode, p.R, p.C, p.eps, p.t), out = {}, d = mode === 'd';
    var Q = p.C * p.eps, I0 = p.eps / p.R, x = Math.exp(-p.t / T), xp = Math.exp(p.t / T), xb = Math.exp(-p.t / (p.R / p.C));
    if (kind === 'tau') { out.truth = T; out.RoverC = p.R / p.C; }
    else if (kind === 'q') {
      out.truth = s.q;
      out.plusExp = d ? Q * xp : Q * (1 - xp);
      out.noOne = d ? Q * (1 - x) : Q * x;
      out.RoverC = d ? Q * xb : Q * (1 - xb);
    } else if (kind === 'i') {
      out.truth = s.iMag;
      out.plusExp = I0 * xp;
      out.noDecay = I0;
      if (!d) out.wrongV = I0 * (1 - x);
      out.RoverC = I0 * xb;
    } else {
      var r = d ? p.V / p.eps : 1 - p.V / p.eps;
      out.truth = timeTo(mode, p.R, p.C, p.eps, p.V);
      out.log10 = -T * Math.log10(r);
      out.noOne = d ? -T * Math.log(1 - p.V / p.eps) : -T * Math.log(p.V / p.eps);
      out.RoverC = -(p.R / p.C) * Math.log(r);
    }
    out.u1000 = out.truth * 1000;
    out.u0001 = out.truth / 1000;
    return out;
  }
  function close(a, b, tol) { return Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-30); }
  // Un error solo cuenta si su valor se distingue del real (2 %).
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

  window.LabMath.rc = {
    tau: tau, fraction: fraction, charge: charge, discharge: discharge, state: state,
    timeTo: timeTo, fullCharge: fullCharge, rk4: rk4, answers: answers, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var MSG = {
    ok: ['Coincide', 'Tu resultado es el del lab.'],
    RoverC: ['τ es R por C', 'La constante de tiempo es τ = RC, no R/C. Con kΩ y μF el producto sale directo en ms.'],
    plusExp: ['El exponente es negativo', 'Las exponenciales del circuito RC decaen: e^(−t/τ). Con e^(+t/τ) la carga o la corriente crecerían sin límite.'],
    noOne: ['Revisa el «1 −»', 'Al cargar, q = Cε(1 − e^(−t/τ)) empieza en 0 y sube. Al descargar, q = Q₀e^(−t/τ) empieza en Q₀ y baja. Usaste la fórmula del otro caso.'],
    log10: ['Es logaritmo natural', 'Al despejar t de una exponencial de base e se usa ln, no log₁₀: t = −τ ln(1 − V/ε).'],
    u1000: ['Revisa los prefijos', 'Tu número sale 1000 veces más grande. Con kΩ y μF, RC ya está en ms; si pasas una sola de las dos a SI, se descuadra un factor de 1000.'],
    u0001: ['Revisa los prefijos', 'Tu número sale 1000 veces más chico. ¿Lo diste en segundos (o en C, o en A) cuando se pedía ms, μC o mA?'],
    noDecay: ['La corriente decae', 'ε/R es la corriente solo en t = 0, cuando el capacitor se porta como un cable. Después vale (ε/R)e^(−t/τ).'],
    wrongV: ['Ese es el voltaje del capacitor', 'La corriente pasa por R: i = V_R/R, y V_R = ε − V_C. Con V_C/R calculaste otra cosa.'],
    bad: ['No coincide', 'τ = RC; al cargar q = Cε(1 − e^(−t/τ)), al descargar q = Q₀e^(−t/τ); i = (ε/R)e^(−t/τ); t = −τ ln(1 − V/ε) al cargar y t = τ ln(ε/V) al descargar.']
  };
  var KINDS = [['tau', 'τ = RC (en ms)'], ['q', 'q en este instante (en μC)'], ['i', 'i en este instante (en mA)'], ['tV', 'tiempo para que V_C llegue a V* (en ms)']];
  var VIEWS = [['V', 'Voltajes V_C y V_R (V)'], ['q', 'Carga q (μC)'], ['i', 'Corriente i (mA)']];
  function nice(x) { return x > 0 ? Number(x.toPrecision(3)) : 0; }
  // Energía en μJ → texto con el prefijo que toque.
  function fmtU(u, fmt) {
    if (Math.abs(u) >= 1e6) return fmt(u / 1e6, 4) + ' J';
    if (Math.abs(u) >= 1e3) return fmt(u / 1e3, 4) + ' mJ';
    return fmt(u, 4) + ' μJ';
  }

  window.Labs['rc-circuit'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, M = window.LabMath.rc;
    var s0 = cfg.start || {};
    var mode = s0.mode === 'd' ? 'd' : 'c', checked = false, anim = null;

    var modeSel = UI.select({ label: 'Interruptor', options: ['a · cargar con la batería', 'b · descargar por R'] });
    var S = {
      R: UI.slider({ label: 'Resistencia R', min: 1, max: 100, step: 1, value: s0.R || 10, unit: 'kΩ' }, changed),
      C: UI.slider({ label: 'Capacitancia C', min: 10, max: 470, step: 10, value: s0.C || 100, unit: 'μF' }, changed),
      eps: UI.slider({ label: 'Batería ε', min: 1, max: 24, step: 1, value: s0.eps || 12, unit: 'V' }, changed),
      k: UI.slider({ label: 'Tiempo t (en múltiplos de τ)', min: 0, max: 6, step: 0.05, value: s0.k != null ? s0.k : 1, fmt: function (v) { return v.toFixed(2) + ' τ'; } }, moveT)
    };
    var play = UI.button('Animar desde t = 0', 'ghost', animate);
    var viewSel = UI.select({ label: 'Gráfica', options: VIEWS.map(function (v) { return v[1]; }) });
    var kSel = UI.select({ label: '¿Qué calculas?', options: KINDS.map(function (k) { return k[1]; }) });
    var target = UI.slider({ label: 'Voltaje objetivo V*', min: 0.5, max: 11.5, step: 0.5, value: 9, unit: 'V' }, function () { verdict.hidden = true; checked = false; draw(); });
    var data = h('p', { class: 'lab-note rc-data' });
    var aIn = UI.input({ label: 'Tu resultado', type: 'number', step: 'any', inputmode: 'decimal', mono: false, hint: 'Usa los datos de arriba. Con kΩ y μF, RC sale en ms; μF·V da μC y V/kΩ da mA.' });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts rc-facts' });
    var circ = UI.svg(640, 250, 'Circuito RC: batería, interruptor de dos posiciones, resistor y capacitor');
    var plot = UI.svg(640, 340, 'Curvas del circuito RC contra el tiempo, con la constante de tiempo marcada');
    var title = h('figcaption', { class: 'lab-board__title sheet__title' }, ['Circuito RC']);
    var plotNote = h('p', { class: 'lab-note rc-plotnote' });
    var leg = {
      vc: h('li', {}, [h('i', { class: 'sw sw--ref' }), 'V_C (capacitor)']),
      vr: h('li', {}, [h('i', { class: 'sw sw--trace' }), 'V_R (resistor)']),
      q: h('li', {}, [h('i', { class: 'sw sw--ref' }), 'q(t)']),
      i: h('li', {}, [h('i', { class: 'sw sw--trace' }), 'i(t)']),
      tau: h('li', {}, [h('i', { class: 'sw sw--aux sw--dashed' }), 'τ, 2τ, 3τ…']),
      now: h('li', {}, [h('i', { class: 'sw sw--error' }), 'instante t'])
    };

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls rc-controls', novalidate: true }, [
        modeSel.node, S.R.node, S.C.node, S.eps.node, S.k.node,
        h('div', { class: 'lab-buttons' }, [play]),
        viewSel.node,
        h('p', { class: 'lab-field__label rc-head' }, ['Reto']),
        kSel.node, target.node, data, aIn.node, h('div', { class: 'lab-buttons' }, [run]), note, verdict,
        h('p', { class: 'lab-field__label rc-head' }, ['Tablero']),
        facts
      ]),
      h('figure', { class: 'lab-board' }, [
        title, circ, plot,
        h('ul', { class: 'lab-legend' }, [leg.vc, leg.vr, leg.q, leg.i, leg.tau, leg.now]),
        plotNote
      ])
    ]));
    var form = mount.querySelector('form');
    form.addEventListener('submit', function (e) { e.preventDefault(); check(); });
    aIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    modeSel.input.addEventListener('change', function () { stop(); mode = modeSel.input.value === '1' ? 'd' : 'c'; S.k.set(0); verdict.hidden = true; checked = false; fitTarget(); draw(); });
    viewSel.input.addEventListener('change', draw);
    kSel.input.addEventListener('change', function () { verdict.hidden = true; checked = false; draw(); });

    function view() { return (VIEWS[+viewSel.input.value] || VIEWS[0])[0]; }
    function kind() { return (KINDS[+kSel.input.value] || KINDS[0])[0]; }
    // Unidades del lab: kΩ, μF, V → τ y t en ms, q en μC, i en mA, energía en μJ.
    function params() {
      var R = S.R.get(), C = S.C.get(), T = R * C;
      return { R: R, C: C, eps: S.eps.get(), t: nice(S.k.get() * T), V: target.get(), tau: T };
    }
    function fitTarget() {
      var e = S.eps.get();
      target.input.max = String(e - 0.5);
      if (target.get() > e - 0.5) target.set(Math.max(0.5, Math.round(e * 0.75 * 2) / 2));
      else target.set(target.get());
    }
    function changed() { fitTarget(); if (checked) check(); else draw(); }
    function moveT() { if (checked) check(); else draw(); }

    // Animación: el cursor recorre de 0 a 6τ en unos 5 s y se detiene. Sin bucle con la escena quieta.
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
      // Cables: batería → contacto a; contacto b → abajo; pivote → R → capacitor → abajo → batería.
      path(circ, 'M' + xb + ' ' + (cy - 7) + 'V' + yt + 'H' + xA, 'axis');
      path(circ, 'M' + xB + ' ' + yB + 'V' + yb, 'axis');
      path(circ, 'M' + xP + ' ' + yt + 'H310M370 ' + yt + 'H' + xc + 'V' + (cy - 8) + 'M' + xc + ' ' + (cy + 8) + 'V' + yb + 'H' + xb + 'V' + (cy + 7), 'axis');
      // Batería (placa larga = +, arriba).
      path(circ, 'M' + (xb - 20) + ' ' + (cy - 7) + 'H' + (xb + 20), 'ref', 3);
      path(circ, 'M' + (xb - 10) + ' ' + (cy + 7) + 'H' + (xb + 10), 'ref', 6);
      txt(circ, xb - 28, cy - 2, '+', 'end', 20);
      txt(circ, xb + 28, cy + 6, 'ε = ' + p.eps + ' V', 'start', 17);
      // Interruptor: contactos a y b, pivote y cuchilla.
      el(circ, 'circle', { cx: xA, cy: yt, r: 4.5, 'class': 'dot-ref' });
      el(circ, 'circle', { cx: xB, cy: yB, r: 4.5, 'class': 'dot-ref' });
      el(circ, 'circle', { cx: xP, cy: yt, r: 4.5, 'class': 'dot-ref' });
      el(circ, 'circle', { cx: xB, cy: yb, r: 4.5, 'class': 'dot-ref' });
      path(circ, 'M' + xP + ' ' + yt + 'L' + (d ? xB : xA) + ' ' + (d ? yB : yt), 'student', 3.4);
      txt(circ, xA - 4, yt - 14, 'a', 'end', 17);
      txt(circ, xB - 10, yB + 22, 'b', 'end', 17);
      // Resistor (zigzag horizontal de 310 a 370).
      var zz = 'M310 ' + yt;
      for (var i = 0; i < 6; i++) zz += 'L' + (315 + i * 10) + ' ' + (yt + (i % 2 ? 9 : -9));
      path(circ, zz + 'L370 ' + yt, 'ref', 2.6);
      txt(circ, 340, yt - 20, 'R = ' + p.R + ' kΩ', 'middle', 17);
      // Capacitor (placas horizontales) con sus cargas: un signo por cada sexto de Cε.
      path(circ, 'M' + (xc - 28) + ' ' + (cy - 8) + 'H' + (xc + 28), 'ref', 4);
      path(circ, 'M' + (xc - 28) + ' ' + (cy + 8) + 'H' + (xc + 28), 'ref', 4);
      txt(circ, xc + 40, cy + 6, 'C = ' + p.C + ' μF', 'start', 17);
      var n = Math.round(6 * s.q / (p.C * p.eps));
      var OFF = [-26, 26, -18, 18, -10, 10];          // lejos del cable que llega al centro de cada placa
      for (var j = 0; j < n; j++) {
        var x = xc + OFF[j];
        txt(circ, x, cy - 15, '+', 'middle', 14);
        txt(circ, x, cy + 26, '−', 'middle', 14);
      }
      // Corriente: flecha a la derecha al cargar, a la izquierda al descargar; más tenue al decaer.
      var o = Math.max(0.12, Math.min(1, s.iMag / (p.eps / p.R)));
      var ar = d ? 'M450 ' + (yt + 22) + 'H400M410 ' + (yt + 15) + 'L400 ' + (yt + 22) + 'L410 ' + (yt + 29) : 'M400 ' + (yt + 22) + 'H450M440 ' + (yt + 15) + 'L450 ' + (yt + 22) + 'L440 ' + (yt + 29);
      path(circ, ar, 'aux', 3.2, { opacity: o.toFixed(2) });
      txt(circ, 425, yt + 48, 'i', 'middle', 18);
      // Lecturas, abajo y fuera del circuito.
      txt(circ, 14, 236, 't = ' + (p.t >= 10000 ? UI.fmt(p.t / 1000, 4) + ' s' : UI.fmt(p.t, 4) + ' ms'), 'start', 18);
      txt(circ, 330, 236, 'q = ' + UI.fmt(s.q, 4) + ' μC', 'middle', 18);
      txt(circ, 626, 236, 'i = ' + UI.fmt(s.iMag, 4) + ' mA', 'end', 18);
    }

    function drawPlot(p, s) {
      var T = p.tau, d = mode === 'd', v = view(), Q = p.C * p.eps, I0 = p.eps / p.R;
      var sec = 6 * T >= 10000, k = sec ? 1e-3 : 1, xmax = 6 * T * k;
      var top = v === 'V' ? p.eps : v === 'q' ? Q : I0;
      var P = window.LabPlot(plot, { x: [0, xmax], y: [0, 1.2 * top] });
      P.clear().grid().axes();
      // τ, 2τ, …, 5τ.
      for (var m = 1; m <= 5; m++) {
        var x = m * T * k;
        P.segments([[[x, 0], [x, 1.12 * top]]], 'aux', 1.4);          // se detiene bajo su etiqueta
        P.label(x, 1.2 * top, (m === 1 ? '' : m) + 'τ', 'middle', 15, 0, 2);
      }
      plot.querySelectorAll('path.aux').forEach(function (n) { n.setAttribute('stroke-dasharray', '5 6'); });
      var fC = function (tt) { return M.state(mode, p.R, p.C, p.eps, tt / k); };
      var main, second = null, mark;
      if (v === 'V') {
        if (!d) P.segments([[[0, p.eps], [xmax, p.eps]]], 'axis', 1.4);
        main = function (tt) { return fC(tt).VC; };
        if (!d) second = function (tt) { return fC(tt).VR; };
        mark = s.VC;
      } else if (v === 'q') { main = function (tt) { return fC(tt).q; }; mark = s.q; }
      else { main = function (tt) { return fC(tt).iMag; }; mark = s.iMag; }
      if (second) P.curve(second, 'trace', 3);
      P.curve(main, v === 'i' ? 'trace' : 'ref', 3);
      // El punto en t = τ: 63 % de la carga final (o 37 % de lo que había).
      var atTau = fC(T * k), yT = v === 'V' ? atTau.VC : v === 'q' ? atTau.q : atTau.iMag;
      var rising = !d && v !== 'i';
      P.point(T * k, yT, 'dot-ref', 5);
      P.label(T * k, yT, rising ? '63 %' : '37 %', 'start', 15, 8, rising ? 22 : -10);
      // Cursor del instante t.
      var tx = p.t * k;
      P.segments([[[tx, 0], [tx, 1.12 * top]]], 'error', 1.6);
      P.point(tx, mark, 'dot-error', 6);
      if (second) P.point(tx, s.VR, 'dot-error', 6);
      P.label(0, 1.2 * top, v === 'V' ? 'V (volts)' : v === 'q' ? 'q (μC)' : 'i (mA)', 'start', 15, 6, 22);
      P.label(xmax, 0, sec ? 't (s)' : 't (ms)', 'end', 15, -4, -10);
      if (!d && v === 'V') P.label(xmax, p.eps, 'ε', 'end', 16, -6, -10);
      leg.vc.hidden = v !== 'V'; leg.vr.hidden = v !== 'V' || d; leg.q.hidden = v !== 'q'; leg.i.hidden = v !== 'i';
      plotNote.textContent = d
        ? (v === 'V' ? 'En la descarga no hay batería: V_R = V_C en todo momento y los dos caen juntos.' : v === 'i' ? 'En la descarga la corriente va al revés (sale de la placa +); aquí se grafica su tamaño.' : 'La carga cae a 37 % en cada τ.')
        : (v === 'V' ? 'V_C + V_R = ε en todo instante. Se cruzan en t = τ ln 2 ≈ 0.69 τ.' : v === 'i' ? 'La corriente empieza en ε/R (el capacitor vacío es como un cable) y decae a cero.' : 'La carga sube a 63 % de Cε en τ y a más de 99 % en 5τ.');
    }

    function draw() {
      var p = params(), s = M.state(mode, p.R, p.C, p.eps, p.t), d = mode === 'd';
      title.textContent = d ? 'Descarga: el capacitor se vacía por R' : 'Carga: la batería llena el capacitor';
      drawCircuit(p, s);
      drawPlot(p, s);
      var k = kind();
      target.node.hidden = k !== 'tV';
      data.textContent = 'Datos: R = ' + p.R + ' kΩ, C = ' + p.C + ' μF, ε = ' + p.eps + ' V' + (d ? ' (el capacitor empieza cargado a ε)' : ' (el capacitor empieza vacío)') +
        (k === 'q' || k === 'i' ? ', t = ' + UI.fmt(p.t, 4) + ' ms.' : k === 'tV' ? ', V* = ' + p.V + ' V.' : '.');
      // Tablero.
      var rk = M.rk4(mode, p.R, p.C, p.eps, p.t, 40), rows = [
        ['τ = RC', UI.fmt(p.tau, 4) + ' ms'],
        ['t', UI.fmt(p.t, 4) + ' ms = ' + UI.fmt(p.t / p.tau, 3) + ' τ'],
        ['q', UI.fmt(s.q, 4) + ' μC (' + UI.fmt(100 * s.q / (p.C * p.eps), 3) + ' % de Cε)'],
        ['i', UI.fmt(s.iMag, 4) + ' mA' + (d ? ' (al revés)' : '')],
        ['V_C', UI.fmt(s.VC, 4) + ' V'],
        ['V_R', UI.fmt(s.VR, 4) + ' V'],
        [d ? 'V_C − V_R' : 'V_C + V_R', UI.fmt(d ? s.VC - s.VR : s.VC + s.VR, 4) + ' V'],
        ['batería entregó', fmtU(s.Ubat, UI.fmt)],
        [d ? 'quedan en C' : 'guardada en C', fmtU(s.Uc, UI.fmt)],
        ['disipada en R', fmtU(s.Ur, UI.fmt) + (d ? '' : s.Ubat > 0 ? ' (' + UI.fmt(100 * s.Ur / s.Ubat, 3) + ' % de lo entregado)' : '')],
        ['q con RK4 (40 pasos)', UI.fmt(rk.q, 6) + ' μC']
      ];
      facts.innerHTML = '';
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    function check() {
      var val = parseFloat(String(aIn.input.value).replace(',', '.')), k = kind(), p = params();
      if (k === 'q' && mode === 'c' && p.t === 0) {
        UI.verdict(verdict, 'warn', 'Mueve el tiempo', 'En t = 0 el capacitor está vacío: mueve el cursor de tiempo antes de calcular.');
        checked = true; draw(); return;
      }
      var r = M.diagnose(k, mode, p, val), msg = MSG[r] || MSG.bad;
      UI.verdict(verdict, r === 'ok' ? 'ok' : r === 'bad' ? 'bad' : 'warn', msg[0], msg[1]);
      checked = true;
      draw();
    }

    // Ejemplo cargado: carga con 10 kΩ, 100 μF y 12 V en t = τ; un compañero olvidó el «1 −».
    modeSel.input.value = mode === 'd' ? '1' : '0';
    fitTarget();
    kSel.input.value = String(Math.max(0, KINDS.map(function (x) { return x[0]; }).indexOf(s0.kind || 'q')));
    var p0 = params();
    aIn.input.value = UI.fmt(M.answers(kind(), mode, p0).noOne || M.answers(kind(), mode, p0).truth, 4);
    note.textContent = 'Ejemplo cargado: así calculó un compañero la carga en t = τ. ¿Ves el error? Luego cambia R, C o el tiempo, o pasa el interruptor a b para descargar.';
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
