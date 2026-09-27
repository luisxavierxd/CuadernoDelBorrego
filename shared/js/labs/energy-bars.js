/* =====================================================================
   Lab energy-bars (§8.3): conservación de la energía con y sin fricción.
   Un carrito se suelta desde una altura h en una rampa lisa, cruza un
   tramo horizontal áspero de largo d (μₖ) y comprime un resorte k.
     abajo:        ½mv² = mgh
     tras el tramo: E = mgh − μₖmgd
     resorte:      ½kx² = E
   Barras en vivo de K, U_g, U_e y energía perdida. El alumno da la rapidez
   abajo y la compresión máxima; errores típicos: √(gh) (sin el 2), olvidar
   la energía perdida y usar kx² sin el ½.
   ===================================================================== */
(function () {
  var G = 9.81;

  /* ------------------------- Matemática pura ------------------------- */
  // p: { m, h, k, mu, d }
  function track(p) {
    var E0 = p.m * G * p.h, lossFull = p.mu * p.m * G * p.d;
    var passes = lossFull < E0, loss = passes ? lossFull : E0;
    var E1 = E0 - loss;
    return {
      E0: E0, vBottom: Math.sqrt(2 * G * p.h), loss: loss, passes: passes,
      dStop: passes ? p.d : (p.mu > 0 ? p.h / p.mu : Infinity),
      vAfter: Math.sqrt(2 * E1 / p.m), x: p.k > 0 ? Math.sqrt(2 * E1 / p.k) : NaN, E1: E1
    };
  }
  // Rapidez a la altura y si se soltó desde h (sin fricción).
  function speedAt(h, y) { return Math.sqrt(2 * G * (h - y)); }
  // Altura (desde el piso) a la que K = U_g, si se soltó desde h.
  function heightKequalsU(h) { return h / 2; }
  // Energías en la posición s ∈ [0, 1]: rampa (0–⅓), tramo áspero (⅓–⅔), resorte (⅔–1).
  function state(p, s) {
    var t = track(p), E0 = t.E0, out;
    if (s <= 1 / 3) {
      var u = 3 * s, y = p.h * (1 - u) * (1 - u);
      out = { y: y, Ug: p.m * G * y, K: E0 - p.m * G * y, Ue: 0, lost: 0, stage: 'rampa' };
    } else if (s <= 2 / 3) {
      var dist = Math.min((3 * s - 1) * p.d, t.dStop), lost = p.mu * p.m * G * dist;
      out = { y: 0, Ug: 0, K: Math.max(0, E0 - lost), Ue: 0, lost: Math.min(lost, E0), stage: 'tramo', dist: dist };
    } else {
      var xn = (3 * s - 2) * (t.x || 0), Ue = 0.5 * p.k * xn * xn;
      out = { y: 0, Ug: 0, K: Math.max(0, t.E1 - Ue), Ue: Ue, lost: t.loss, stage: 'resorte', xNow: xn };
    }
    return out;
  }
  function close(a, b, tol) { return Math.abs(a - b) <= (tol || 0.01) * Math.max(Math.abs(b), 1e-3); }
  function diagnose(p, sv, sx) {
    var t = track(p), out = { v: 'bad', x: 'bad' };
    if (isFinite(sv)) {
      if (close(sv, t.vBottom)) out.v = 'ok';
      else if (close(sv, Math.sqrt(G * p.h))) out.v = 'noTwo';
      else if (close(sv, 2 * G * p.h)) out.v = 'noSqrt';
    }
    if (isFinite(sx)) {
      var noLoss = Math.sqrt(2 * t.E0 / p.k), noHalf = Math.sqrt(t.E1 / p.k);
      if (close(sx, t.x) || (t.x < 1e-9 && Math.abs(sx) < 1e-3)) out.x = 'ok';
      else if (close(sx, noLoss) && !close(noLoss, t.x)) out.x = 'noFriction';
      else if (close(sx, noHalf) && !close(noHalf, t.x)) out.x = 'noHalf';
    }
    return out;
  }
  window.LabMath.energy = { G: G, track: track, speedAt: speedAt, heightKequalsU: heightKequalsU, state: state, diagnose: diagnose };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var MSG_V = {
    ok: 'Tu rapidez abajo coincide.', noTwo: 'Te faltó el 2: de mgh = ½mv² sale v = √(2gh).', noSqrt: 'Ese es v²: falta la raíz.',
    bad: 'Tu rapidez abajo no coincide: iguala mgh con ½mv².'
  };
  var MSG_X = {
    ok: 'Tu compresión coincide.', noFriction: 'Olvidaste la energía que se pierde en el tramo áspero, μₖmgd.', noHalf: 'La energía del resorte es ½kx², no kx².',
    bad: 'Tu compresión no coincide: ½kx² es la energía que queda después del tramo áspero.'
  };

  window.Labs['energy-bars'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var s0 = cfg.start || { h: 2, m: 1, k: 400, mu: 0.25, d: 1.5 };
    var hS = UI.slider({ label: 'Altura inicial h', min: 0.5, max: 5, step: 0.1, value: s0.h, unit: 'm', fmt: function (v) { return v.toFixed(1); } }, refresh);
    var mS = UI.slider({ label: 'Masa m', min: 0.5, max: 5, step: 0.5, value: s0.m, unit: 'kg' }, refresh);
    var kS = UI.slider({ label: 'Constante del resorte k', min: 50, max: 1500, step: 50, value: s0.k, unit: 'N/m' }, refresh);
    var uS = UI.slider({ label: 'Fricción del tramo áspero μₖ', min: 0, max: 0.6, step: 0.05, value: s0.mu, fmt: function (v) { return v.toFixed(2); } }, refresh);
    var dS = UI.slider({ label: 'Largo del tramo áspero d', min: 0, max: 3, step: 0.1, value: s0.d, unit: 'm', fmt: function (v) { return v.toFixed(1); } }, refresh);
    var pS = UI.slider({ label: 'Posición del carrito en la pista', min: 0, max: 100, step: 1, value: 20, fmt: function (v) { return v + ' %'; } }, function () { stop(); draw(); });
    var play = UI.button('Soltar', 'ghost', toggle);
    var vIn = UI.input({ label: 'Tu rapidez abajo (m/s)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var xIn = UI.input({ label: 'Tu compresión máxima (m)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(640, 260, 'Pista: rampa, tramo áspero y resorte, con el carrito');
    var bars = UI.svg(640, 220, 'Barras de energía cinética, potencial gravitacional, potencial elástica y perdida');
    var anim = null, checked = false;

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        hS.node, mS.node, kS.node, uS.node, dS.node, pS.node, h('div', { class: 'lab-buttons' }, [play]),
        h('div', { class: 'lab-row' }, [vIn.node, xIn.node]), h('div', { class: 'lab-buttons' }, [run]), note, verdict, facts
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['La energía total no cambia; la perdida se va en calor']),
        svg, bars
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    function params() { return { h: hS.get(), m: mS.get(), k: kS.get(), mu: uS.get(), d: dS.get() }; }
    function refresh() { if (checked) check(); else draw(); }

    function el(name, attrs, parent, root) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      (parent || root || svg).appendChild(n);
      return n;
    }
    function draw() {
      var p = params(), t = track(p), s = pS.get() / 100, st = state(p, s);
      svg.innerHTML = '';
      var g = el('g', { 'class': 'sketch' }), X0 = 40, X1 = 220, X2 = 440, X3 = 600, base = 220, H = 160 / 5;   // px por m de altura
      var d = 'M' + X0 + ' ' + (base - p.h * H);
      for (var i = 1; i <= 30; i++) { var u = i / 30; d += 'L' + (X0 + (X1 - X0) * u) + ' ' + (base - p.h * H * (1 - u) * (1 - u)); }
      el('path', { d: d + 'L' + X3 + ' ' + base, 'class': 'axis', 'stroke-width': 3, fill: 'none' }, g);
      if (p.d > 0 && p.mu > 0) {
        var hatch = '';
        for (var j = X1 + 6; j < X2; j += 12) hatch += 'M' + j + ' ' + (base + 2) + 'l-8 10';
        el('path', { d: hatch, 'class': 'error', 'stroke-width': 1.5, fill: 'none' }, g);
        el('text', { x: (X1 + X2) / 2, y: base + 30, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 15 }, g).textContent = 'tramo áspero: d = ' + p.d.toFixed(1) + ' m, μₖ = ' + p.mu.toFixed(2);
      }
      el('path', { d: 'M' + X3 + ' ' + (base - 60) + 'V' + base, 'class': 'axis', 'stroke-width': 5, fill: 'none' }, g);
      var xPx = 70, comp = st.stage === 'resorte' && t.x > 0 ? Math.min(55, 55 * st.xNow / Math.max(t.x, 1e-6)) : 0, sx0 = X3 - xPx + comp;
      var cd = 'M' + X3 + ' ' + (base - 20);
      for (var c = 0; c < 8; c++) cd += 'L' + (X3 - (c + 1) * (X3 - sx0) / 9) + ' ' + (base - 20 + (c % 2 ? 8 : -8));
      el('path', { d: cd + 'L' + sx0 + ' ' + (base - 20), 'class': 'axis', 'stroke-width': 2, fill: 'none' }, g);
      // Carrito
      var cx;
      if (st.stage === 'rampa') cx = X0 + (X1 - X0) * 3 * s;
      else if (st.stage === 'tramo') cx = X1 + (X2 - X1) * (p.d > 0 ? st.dist / p.d : 3 * s - 1);
      else if (!t.passes) cx = X1 + (X2 - X1) * t.dStop / p.d;
      else cx = sx0 - 16;
      var cy = base - st.y * H - 14;
      el('rect', { x: cx - 16, y: cy - 10, width: 32, height: 20, rx: 5, 'class': 'box-aux' }, g);
      el('text', { x: X0, y: base - p.h * H - 12, 'class': 'ann', 'font-size': 15 }, g).textContent = 'h = ' + p.h.toFixed(1) + ' m';
      drawBars(p, t, st);
      facts.innerHTML = '';
      [['rapidez abajo √(2gh)', UI.fmt(t.vBottom, 4) + ' m/s'], ['energía perdida μₖmgd', UI.fmt(t.loss, 4) + ' J'],
        ['rapidez al llegar al resorte', t.passes ? UI.fmt(t.vAfter, 4) + ' m/s' : 'se detiene en el tramo'], ['compresión máxima', t.passes ? UI.fmt(t.x, 4) + ' m' : '0']]
        .forEach(function (x) { facts.appendChild(h('dt', {}, [x[0]])); facts.appendChild(h('dd', {}, [x[1]])); });
    }
    function drawBars(p, t, st) {
      bars.innerHTML = '';
      var g = el('g', { 'class': 'sketch' }, null, bars), base = 180, top = 30, E0 = t.E0 || 1;
      var list = [['K', st.K, 'box-aux'], ['U gravitacional', st.Ug, 'box-ref'], ['U elástica', st.Ue, 'box-trace'], ['perdida (calor)', st.lost, 'box-err']];
      list.forEach(function (b, i) {
        var x = 60 + i * 140, hh = (base - top) * Math.max(0, b[1]) / E0;
        el('rect', { x: x, y: base - hh, width: 70, height: Math.max(hh, 0.5), 'class': b[2] }, g, bars);
        el('text', { x: x + 35, y: base + 20, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 15 }, g, bars).textContent = b[0];
        el('text', { x: x + 35, y: base - hh - 6, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 14 }, g, bars).textContent = UI.fmt(b[1], 3) + ' J';
      });
      el('path', { d: 'M40 ' + top + 'H620', 'class': 'axis', 'stroke-width': 1.2, 'stroke-dasharray': '5 6', fill: 'none' }, g, bars);
      el('text', { x: 620, y: top - 8, 'class': 'ann', 'text-anchor': 'end', 'font-size': 14 }, g, bars).textContent = 'energía total = mgh = ' + UI.fmt(E0, 4) + ' J';
    }

    function stop() { if (anim) { anim.pause(); anim = null; } play.textContent = 'Soltar'; }
    function toggle() {
      if (anim) { stop(); return; }
      if (!(window.CBAnim && window.CBAnim.canAnimate() && window.anime)) { pS.set(100); draw(); return; }
      var o = { s: 0 }; play.textContent = 'Pausar';
      anim = window.anime({ targets: o, s: 100, duration: 3600, easing: 'linear', update: function () { pS.set(Math.round(o.s)); draw(); }, complete: stop });
    }
    function check() {
      var r = diagnose(params(), parseFloat(vIn.input.value), parseFloat(xIn.input.value));
      var kind = r.v === 'ok' && r.x === 'ok' ? 'ok' : (r.v !== 'bad' || r.x !== 'bad') ? 'warn' : 'bad';
      UI.verdict(verdict, kind, kind === 'ok' ? 'Tus dos respuestas coinciden' : kind === 'warn' ? 'Vas cerca' : 'No coinciden', MSG_V[r.v] + ' ' + MSG_X[r.x]);
      checked = true;
      draw();
    }
    // Ejemplo cargado: un compañero olvidó la energía perdida en el tramo áspero.
    (function () { var p = params(), t = track(p); vIn.input.value = UI.fmt(t.vBottom, 4); xIn.input.value = UI.fmt(Math.sqrt(2 * t.E0 / p.k), 4); })();
    note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Ves el error en la compresión? Pulsa "Soltar" y mira las barras.';
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
