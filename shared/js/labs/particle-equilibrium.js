/* =====================================================================
   Lab particle-equilibrium (§8.3): un peso colgado de dos cables.
   Los cables forman ángulos θ₁ (izquierdo) y θ₂ (derecho) con la
   horizontal. En equilibrio ΣF = 0:
     T₁ cosθ₁ = T₂ cosθ₂,   T₁ senθ₁ + T₂ senθ₂ = mg
     T₁ = mg cosθ₂ / sen(θ₁ + θ₂),   T₂ = mg cosθ₁ / sen(θ₁ + θ₂)
   El lab dibuja el nudo, los cables y el polígono de fuerzas (que se
   cierra). Errores típicos: repartir el peso a la mitad, intercambiar
   T₁ con T₂ y confundir seno con coseno (medir el ángulo desde la vertical).
   ===================================================================== */
(function () {
  var G = 9.81, RAD = Math.PI / 180;

  /* ------------------------- Matemática pura ------------------------- */
  function tensions(m, th1, th2) {
    var W = m * G, s = Math.sin((th1 + th2) * RAD);
    return { W: W, T1: W * Math.cos(th2 * RAD) / s, T2: W * Math.cos(th1 * RAD) / s };
  }
  // Cable simétrico (los dos a θ con la horizontal): T = mg / (2 senθ).
  function symmetric(m, th) { return m * G / (2 * Math.sin(th * RAD)); }
  // Un cable horizontal y otro a θ con la horizontal: T_incl = mg/senθ, T_hor = mg/tanθ.
  function horizontalAndSlanted(m, th) { var W = m * G; return { slanted: W / Math.sin(th * RAD), horizontal: W / Math.tan(th * RAD) }; }
  // Suma de fuerzas sobre el nudo (debe dar ≈ 0).
  function residual(m, th1, th2, T1, T2) {
    var fx = -T1 * Math.cos(th1 * RAD) + T2 * Math.cos(th2 * RAD);
    var fy = T1 * Math.sin(th1 * RAD) + T2 * Math.sin(th2 * RAD) - m * G;
    return { fx: fx, fy: fy };
  }
  function close(a, b) { return Math.abs(a - b) <= 0.01 * Math.max(Math.abs(b), 1e-3); }
  function diagnose(m, th1, th2, s1, s2) {
    if (!(isFinite(s1) && isFinite(s2))) return 'bad';
    var t = tensions(m, th1, th2);
    if (close(s1, t.T1) && close(s2, t.T2)) return 'ok';
    if (close(s1, t.T2) && close(s2, t.T1)) return 'swapped';
    if (close(s1, t.W / 2) && close(s2, t.W / 2)) return 'halfWeight';
    var v = tensions(m, 90 - th1, 90 - th2);     // ángulos medidos desde la vertical
    if (close(s1, v.T1) && close(s2, v.T2)) return 'sinCos';
    if (close(s1, t.T1) || close(s2, t.T2)) return 'one';
    return 'bad';
  }
  window.LabMath.equilibrium = { G: G, tensions: tensions, symmetric: symmetric, horizontalAndSlanted: horizontalAndSlanted, residual: residual, diagnose: diagnose };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var MSG = {
    ok: ['Tus dos tensiones coinciden', 'El polígono de fuerzas se cierra: ΣF = 0.'],
    swapped: ['Intercambiaste T₁ y T₂', 'El cable más inclinado (más cerca de la vertical) es el que carga más.'],
    halfWeight: ['Repartiste el peso a la mitad', 'Cada cable tira en diagonal: solo su componente vertical sostiene el peso, así que cada tensión es mayor que mg/2 (y no son iguales si los ángulos difieren).'],
    sinCos: ['Cambiaste seno por coseno', 'Los ángulos están medidos desde la horizontal: la componente vertical es T senθ.'],
    one: ['Una de las dos coincide', 'Revisa la otra con ΣFx = 0: T₁ cosθ₁ = T₂ cosθ₂.'],
    bad: ['No coinciden', 'Plantea ΣFx = 0 y ΣFy = 0 en el nudo y resuelve el sistema de 2 × 2.']
  };

  window.Labs['particle-equilibrium'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var s0 = cfg.start || { m: 10, th1: 30, th2: 60 };
    var mS = UI.slider({ label: 'Masa colgada m', min: 1, max: 50, step: 1, value: s0.m, unit: 'kg' }, refresh);
    var aS = UI.slider({ label: 'Ángulo del cable izquierdo θ₁', min: 5, max: 85, step: 1, value: s0.th1, unit: '°' }, refresh);
    var bS = UI.slider({ label: 'Ángulo del cable derecho θ₂', min: 5, max: 85, step: 1, value: s0.th2, unit: '°' }, refresh);
    var t1 = UI.input({ label: 'Tu T₁ (N)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var t2 = UI.input({ label: 'Tu T₂ (N)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(640, 330, 'Peso colgado de dos cables y su polígono de fuerzas');
    var checked = false;

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        mS.node, aS.node, bS.node, h('div', { class: 'lab-row' }, [t1.node, t2.node]), h('div', { class: 'lab-buttons' }, [run]), note, verdict, facts
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['En equilibrio las tres fuerzas cierran un triángulo']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'T₁']),
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'T₂']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'peso mg'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    function refresh() { if (checked) check(); else draw(); }

    function el(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n);
      return n;
    }
    function arrow(g, x1, y1, x2, y2, cls) {
      var a = Math.atan2(y2 - y1, x2 - x1), L = 11;
      el('path', { d: 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) +
        'M' + (x2 - L * Math.cos(a - 0.4)).toFixed(1) + ' ' + (y2 - L * Math.sin(a - 0.4)).toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) +
        'L' + (x2 - L * Math.cos(a + 0.4)).toFixed(1) + ' ' + (y2 - L * Math.sin(a + 0.4)).toFixed(1), 'class': cls, 'stroke-width': 3.5, fill: 'none' }, g);
    }
    function txt(g, x, y, s, anchor) { el('text', { x: x.toFixed(1), y: y.toFixed(1), 'class': 'ann', 'text-anchor': anchor || 'middle', 'font-size': 15 }, g).textContent = s; }

    function draw() {
      var m = mS.get(), a = aS.get(), b = bS.get(), t = tensions(m, a, b);
      svg.innerHTML = '';
      var g = el('g', { 'class': 'sketch' });
      // Techo y cables: el nudo cuelga en K; los anclajes quedan donde cada cable toca el techo.
      var ceil = 40, K = [190, 190], dy = K[1] - ceil;
      var A = [K[0] - dy / Math.tan(a * RAD), ceil], B = [K[0] + dy / Math.tan(b * RAD), ceil];
      A[0] = Math.max(A[0], 14); B[0] = Math.min(B[0], 366);
      el('path', { d: 'M10 ' + ceil + 'H370', 'class': 'axis', 'stroke-width': 4, fill: 'none' }, g);
      el('path', { d: 'M' + A[0].toFixed(1) + ' ' + ceil + 'L' + K[0] + ' ' + K[1] + 'L' + B[0].toFixed(1) + ' ' + ceil + 'M' + K[0] + ' ' + K[1] + 'V' + (K[1] + 70), 'class': 'axis', 'stroke-width': 2, fill: 'none' }, g);
      el('rect', { x: K[0] - 28, y: K[1] + 70, width: 56, height: 46, rx: 5, 'class': 'box-ref' }, g);
      txt(g, K[0], K[1] + 99, m + ' kg');
      el('circle', { cx: K[0], cy: K[1], r: 5, 'class': 'dot-ref' }, g);
      txt(g, K[0] - 60, ceil + 22, 'θ₁ = ' + a + '°', 'end');
      txt(g, K[0] + 60, ceil + 22, 'θ₂ = ' + b + '°', 'start');
      // Polígono de fuerzas (punta con cola): W hacia abajo, T₂, T₁.
      var sc = 180 / Math.max(t.W, t.T1, t.T2), P0 = [490, 50];
      var P1 = [P0[0], P0[1] + t.W * sc];
      var P2 = [P1[0] + t.T2 * Math.cos(b * RAD) * sc, P1[1] - t.T2 * Math.sin(b * RAD) * sc];
      var P3 = [P2[0] - t.T1 * Math.cos(a * RAD) * sc, P2[1] - t.T1 * Math.sin(a * RAD) * sc];
      arrow(g, P0[0], P0[1], P1[0], P1[1], 'error');
      arrow(g, P1[0], P1[1], P2[0], P2[1], 'ref');
      arrow(g, P2[0], P2[1], P3[0], P3[1], 'aux');
      txt(g, P0[0] - 10, (P0[1] + P1[1]) / 2, 'mg', 'end');
      txt(g, (P1[0] + P2[0]) / 2 + 14, (P1[1] + P2[1]) / 2 + 18, 'T₂', 'start');
      txt(g, (P2[0] + P3[0]) / 2 + 12, (P2[1] + P3[1]) / 2, 'T₁', 'start');
      txt(g, 500, 300, 'polígono de fuerzas', 'middle');
      facts.innerHTML = '';
      [['peso mg', UI.fmt(t.W, 4) + ' N'], ['T₁ = mg cosθ₂ / sen(θ₁+θ₂)', UI.fmt(t.T1, 4) + ' N'], ['T₂ = mg cosθ₁ / sen(θ₁+θ₂)', UI.fmt(t.T2, 4) + ' N']]
        .forEach(function (x) { facts.appendChild(h('dt', {}, [x[0]])); facts.appendChild(h('dd', {}, [x[1]])); });
    }
    function check() {
      var k = diagnose(mS.get(), aS.get(), bS.get(), parseFloat(t1.input.value), parseFloat(t2.input.value)), msg = MSG[k];
      UI.verdict(verdict, k === 'ok' ? 'ok' : k === 'bad' ? 'bad' : 'warn', msg[0], msg[1]);
      checked = true;
      draw();
    }
    // Ejemplo cargado: un compañero repartió el peso a la mitad entre los dos cables.
    (function () { var w = mS.get() * G / 2; t1.input.value = UI.fmt(w, 4); t2.input.value = UI.fmt(w, 4); })();
    note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Por qué no puede ser? Mueve los ángulos y escribe tus tensiones.';
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
