/* =====================================================================
   Lab lenz-direction (Física 3 · S12): ley de Lenz.
   Una espira circular en el plano de la página, vista de frente. Tres escenas:
     · field   campo uniforme que sale (⊙) o entra (⊗) y que crece o decrece;
     · magnet  imán detrás de la página, sobre el eje de la espira, que se
               acerca o se aleja con su polo N o S hacia la espira;
     · slide   espira cuadrada que entra a (o sale de) una región con campo.
   El alumno elige el sentido de la corriente inducida (horario, antihorario o
   ninguna, visto desde el frente) y el del campo inducido en el centro (sale,
   entra o ninguno); el lab lo revisa con el signo de −dΦ/dt y lo anima.
   Convención: Φ = B_z·A con la normal hacia ti (B_z > 0 sale de la página);
   ε = −dΦ/dt > 0 ↔ corriente antihoraria, que produce un campo que sale.
   El «casi»:
     followB  puso el campo inducido igual al externo cuando el flujo crece
     opposeB  puso el campo inducido contrario al externo cuando el flujo decrece
     rhr      el campo inducido está bien, pero la corriente no le corresponde
     noneWrong dijo que no hay corriente y sí la hay
     noChange  el flujo no cambia y eligió una corriente
   También trae el campo eléctrico inducido en una región circular con dB/dt
   y la fem de un generador (ejemplo resuelto de la sesión).
   ===================================================================== */
(function () {
  var TAU = 2 * Math.PI;

  /* ------------------------- Matemática pura ------------------------- */
  // p común: { a: radio o lado de la espira (cm), dir: +1 sale / −1 entra, B0 (T), k (T/s),
  //   change: +1 crece / −1 decrece; pole: +1 (N hacia la espira) / −1 (S); move: +1 se acerca / −1 se aleja;
  //   d0 (cm), v (cm/s), m (constante del imán, T·cm³); x0 (cm, frente de la espira), side: +1 entra / −1 sale }.
  function flux(sc, p, t) {
    var a = p.a / 100;
    if (sc === 'field') return p.dir * Math.max(0, p.B0 + p.change * p.k * t) * Math.PI * a * a;
    if (sc === 'magnet') {
      // Imán detrás de la página: con N hacia la espira el campo en la espira sale (+z).
      var d = Math.max(0.5, p.d0 - p.move * p.v * t) / 100, m = p.m * 1e-6;     // T·m³
      return p.pole * m * Math.PI * a * a / Math.pow(a * a + d * d, 1.5);
    }
    // Espira cuadrada de lado a; su frente está en x0 + side·v·t; la región con campo es x > 0.
    var front = p.x0 + p.side * p.v * t, inside = Math.max(0, Math.min(p.a, front)) / 100;
    return p.dir * p.B0 * inside * a;
  }
  function dphi(sc, p, t) { var h = 1e-4; return (flux(sc, p, t + h) - flux(sc, p, t - h)) / (2 * h); }
  function sgn(x, eps) { return x > eps ? 1 : x < -eps ? -1 : 0; }
  // Lo que pasa en el instante t.
  function induced(sc, p, t) {
    var ph = flux(sc, p, t), d = dphi(sc, p, t), emf = -d, s = sgn(emf, 1e-12);
    var ext = sc === 'magnet' ? sgn(p.pole, 0) : sgn(ph, 1e-15) || sgn(p.dir, 0);
    return {
      phi: ph, dphi: d, emf: emf,
      current: s > 0 ? 'ccw' : s < 0 ? 'cw' : 'none',
      Bind: s > 0 ? 'out' : s < 0 ? 'in' : 'none',
      Bext: ext > 0 ? 'out' : ext < 0 ? 'in' : 'none',
      change: sgn(Math.abs(flux(sc, p, t + 1e-3)) - Math.abs(flux(sc, p, t - 1e-3)), 1e-15) > 0 ? 'up' : sgn(Math.abs(flux(sc, p, t + 1e-3)) - Math.abs(flux(sc, p, t - 1e-3)), 1e-15) < 0 ? 'down' : 'none'
    };
  }
  var CUR_OF = { out: 'ccw', in: 'cw', none: 'none' };
  // Sentido de la corriente inducida ('cw', 'ccw' o 'none') en el instante t.
  function direction(sc, p, t) { return induced(sc, p, t).current; }
  // student = { current: 'cw' | 'ccw' | 'none', Bind: 'out' | 'in' | 'none' }.
  function diagnose(truth, student) {
    if (!student || !student.current || !student.Bind) return 'bad';
    if (truth.current === 'none') return student.current === 'none' && student.Bind === 'none' ? 'ok' : 'noChange';
    if (student.current === truth.current && student.Bind === truth.Bind) return 'ok';
    if (student.current === 'none' || student.Bind === 'none') return 'noneWrong';
    if (student.Bind === truth.Bind) return 'rhr';
    // Campo inducido equivocado: ¿lo puso igual o contrario al externo?
    if (student.Bind === truth.Bext) return 'followB';
    return 'opposeB';
  }
  // Campo eléctrico inducido por un campo uniforme B(t) en una región circular de radio R (cualquier unidad
  // de longitud coherente): ∮E·dl = −dΦ/dt → E·2πr = πr²|dB/dt| (adentro) o πR²|dB/dt| (afuera).
  function Einduced(r, R, dBdt) { return r <= R ? r * Math.abs(dBdt) / 2 : R * R * Math.abs(dBdt) / (2 * r); }
  function regionEmf(r, R, dBdt) { var m = Math.min(r, R); return Math.PI * m * m * Math.abs(dBdt); }
  // Generador: N vueltas de área A (m²) que giran con ω (rad/s) en B (T); Φ = BA cos ωt.
  function generator(N, B, A, omega, t) {
    var peak = N * B * A * omega;
    return { peak: peak, emf: peak * Math.sin(omega * (t || 0)), f: omega / TAU, T: TAU / omega, rms: peak / Math.SQRT2 };
  }
  function rpm2omega(rpm) { return rpm * TAU / 60; }

  window.LabMath.lenz = {
    flux: flux, dphi: dphi, induced: induced, direction: direction, diagnose: diagnose, CUR_OF: CUR_OF,
    Einduced: Einduced, regionEmf: regionEmf, generator: generator, rpm2omega: rpm2omega
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var MSG = {
    ok: ['Correcto', 'La corriente inducida produce un campo que se opone al cambio del flujo.'],
    followB: ['El campo inducido refuerza el cambio', 'Aquí el flujo está creciendo. El campo inducido debe oponerse a ese aumento: apunta al revés que el campo externo.'],
    opposeB: ['El campo inducido no siempre va contra B', 'Aquí el flujo está disminuyendo. Para oponerse a la disminución, el campo inducido apunta igual que el externo (lo “sostiene”).'],
    rhr: ['Revisa la regla de la mano derecha', 'El campo inducido está bien, pero la corriente no le corresponde: con los dedos en el sentido de la corriente, el pulgar da el campo en el centro. Antihoraria → sale; horaria → entra.'],
    noneWrong: ['Sí hay corriente', 'El flujo está cambiando, así que hay fem: elige un sentido.'],
    noChange: ['Aquí no hay corriente', 'El flujo no cambia en este instante: no hay fem ni corriente inducida.'],
    bad: ['No coincide', 'Primero decide si el flujo crece o decrece; el campo inducido se opone a ese cambio; luego usa la mano derecha para la corriente.']
  };
  var KIND = { ok: 'ok', bad: 'bad' };
  var CURS = [['ccw', 'Antihoraria'], ['cw', 'Horaria'], ['none', 'No hay corriente']];
  var BINDS = [['out', 'Sale de la página (⊙)'], ['in', 'Entra en la página (⊗)'], ['none', 'No hay campo inducido']];

  window.Labs['lenz-direction'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var s0 = cfg.start || {};
    var sc = s0.sc || 'magnet', t = 0, anim = null, shown = false, student = null;

    var scSel = UI.select({ label: 'Escena', options: ['Imán que se acerca o se aleja', 'Campo uniforme que cambia', 'Espira que entra o sale de un campo'] });
    var o1 = UI.select({ label: 'Polo hacia la espira', options: ['N', 'S'] });
    var o2 = UI.select({ label: 'Movimiento', options: ['Se acerca', 'Se aleja'] });
    var timeS = UI.slider({ label: 'Tiempo', min: 0, max: 1, step: 0.01, value: 0.3, fmt: function (v) { return (v * 100).toFixed(0) + ' %'; } }, function (v) { t = v; draw(); });
    var play = UI.button('Animar', 'ghost', animate);
    var curSel = UI.select({ label: 'Corriente inducida (vista de frente)', options: CURS.map(function (c) { return c[1]; }) });
    var bSel = UI.select({ label: 'Campo inducido en el centro', options: BINDS.map(function (c) { return c[1]; }) });
    var run = UI.button('Comprobar', 'primary', check);
    var nx = UI.button('Otra situación', 'ghost', randomize);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts rc-facts' });
    var scene = UI.svg(640, 320, 'Espira vista de frente y de lado con la fuente del campo');
    var plot = UI.svg(640, 220, 'Flujo contra el tiempo');
    var title = h('figcaption', { class: 'lab-board__title sheet__title' }, ['Ley de Lenz']);
    var plotNote = h('p', { class: 'lab-note' });
    var leg = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--aux' }), 'campo externo']),
      h('li', {}, [h('i', { class: 'sw sw--trace' }), 'corriente y campo inducidos']),
      h('li', {}, [h('i', { class: 'sw sw--ref' }), 'flujo Φ(t)']),
      h('li', {}, [h('i', { class: 'sw sw--error' }), 'instante t'])
    ]);

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls rc-controls', novalidate: true }, [
        scSel.node, o1.node, o2.node, timeS.node, h('div', { class: 'lab-buttons' }, [play]),
        h('p', { class: 'lab-field__label rc-head' }, ['Tu predicción']),
        curSel.node, bSel.node, h('div', { class: 'lab-buttons' }, [run, nx]), note, verdict,
        h('p', { class: 'lab-field__label rc-head' }, ['Tablero']),
        facts
      ]),
      h('figure', { class: 'lab-board' }, [title, scene, plot, leg, plotNote])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    scSel.input.addEventListener('change', function () { sc = ['magnet', 'field', 'slide'][+scSel.input.value]; relabel(); reset(); });
    [o1, o2].forEach(function (o) { o.input.addEventListener('change', reset); });
    [curSel, bSel].forEach(function (o) { o.input.addEventListener('change', function () { verdict.hidden = true; shown = false; draw(); }); });

    function relabel() {
      var L1 = sc === 'magnet' ? ['Polo hacia la espira', ['N', 'S']] : ['Campo externo', ['Sale de la página (⊙)', 'Entra en la página (⊗)']];
      var L2 = sc === 'magnet' ? ['Movimiento', ['Se acerca', 'Se aleja']] : sc === 'field' ? ['Cambio', ['Crece', 'Decrece']] : ['Movimiento', ['Entra a la región', 'Sale de la región']];
      o1.node.querySelector('label').textContent = L1[0];
      o2.node.querySelector('label').textContent = L2[0];
      [[o1, L1[1]], [o2, L2[1]]].forEach(function (q) { var v = q[0].input.value; q[0].input.innerHTML = ''; q[1].forEach(function (s, i) { q[0].input.appendChild(h('option', { value: String(i) }, [s])); }); q[0].input.value = v; });
    }
    function reset() { verdict.hidden = true; shown = false; student = null; draw(); }
    function params() {
      var a = o1.input.value === '1' ? -1 : 1, b = o2.input.value === '1' ? -1 : 1;
      if (sc === 'magnet') return { a: 5, pole: a, move: b, d0: 9, v: 6, m: 300 };
      if (sc === 'field') return { a: 5, dir: a, change: b, B0: b > 0 ? 0.1 : 0.5, k: 0.4 };
      return { a: 6, dir: a, side: b, B0: 0.4, x0: b > 0 ? -3 : 9, v: 12 };
    }
    // Tiempo físico: el cursor recorre 1 s de la escena.
    function tt() { return t; }

    function stop() { if (anim) { cancelAnimationFrame(anim); anim = null; } play.textContent = 'Animar'; }
    function animate() {
      if (anim) { stop(); return; }
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { t = 0.5; timeS.set(t); draw(); return; }
      var t0 = null;
      play.textContent = 'Detener';
      function step(ts) {
        if (t0 === null) t0 = ts;
        t = Math.min(1, (ts - t0) / 4000);
        timeS.set(Math.round(t * 100) / 100);
        draw();
        if (t < 1) anim = requestAnimationFrame(step); else stop();
      }
      anim = requestAnimationFrame(step);
    }
    function randomize() {
      stop();
      sc = ['magnet', 'field', 'slide'][Math.floor(Math.random() * 3)];
      scSel.input.value = String(['magnet', 'field', 'slide'].indexOf(sc));
      relabel();
      o1.input.value = String(Math.floor(Math.random() * 2));
      o2.input.value = String(Math.floor(Math.random() * 2));
      t = sc === 'slide' ? 0.25 : 0.4; timeS.set(t);
      reset();
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
    function bsym(svg, x0, y0, r, out, cls, op) {
      var g = el(svg, 'g', { opacity: op == null ? 1 : op });
      el(g, 'circle', { cx: x0, cy: y0, r: r, 'class': cls, fill: 'none', 'stroke-width': 1.8 });
      if (out) el(g, 'circle', { cx: x0, cy: y0, r: r * 0.28, 'class': cls === 'trace' ? 'dot-trace' : 'dot-aux' });
      else path(g, 'M' + (x0 - r * 0.62) + ' ' + (y0 - r * 0.62) + 'L' + (x0 + r * 0.62) + ' ' + (y0 + r * 0.62) + 'M' + (x0 + r * 0.62) + ' ' + (y0 - r * 0.62) + 'L' + (x0 - r * 0.62) + ' ' + (y0 + r * 0.62), cls, 1.8);
    }
    // Flechas de circulación sobre un círculo (cx, cy, R): sentido ccw = antihorario en pantalla.
    function circulation(svg, cx, cy, R, dir, cls) {
      for (var k = 0; k < 4; k++) {
        var a0 = k * 90 + 20, a1 = a0 + 50, s = dir === 'ccw' ? 1 : -1;
        var p0 = [cx + R * Math.cos(a0 * Math.PI / 180), cy - s * R * Math.sin(a0 * Math.PI / 180)], p1 = [cx + R * Math.cos(a1 * Math.PI / 180), cy - s * R * Math.sin(a1 * Math.PI / 180)];
        path(svg, 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + 'A' + R + ' ' + R + ' 0 0 ' + (s > 0 ? 0 : 1) + ' ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1), cls, 3.4);
        var tg = [-Math.sin(a1 * Math.PI / 180), -s * Math.cos(a1 * Math.PI / 180)], nrm = [Math.cos(a1 * Math.PI / 180), -s * Math.sin(a1 * Math.PI / 180)];
        var hx = p1[0], hy = p1[1];
        path(svg, 'M' + (hx - 11 * tg[0] + 6 * nrm[0]).toFixed(1) + ' ' + (hy - 11 * tg[1] + 6 * nrm[1]).toFixed(1) + 'L' + hx.toFixed(1) + ' ' + hy.toFixed(1) + 'L' + (hx - 11 * tg[0] - 6 * nrm[0]).toFixed(1) + ' ' + (hy - 11 * tg[1] - 6 * nrm[1]).toFixed(1), cls, 3.2);
      }
    }

    function drawScene(p, tr) {
      scene.innerHTML = '';
      var g = el(scene, 'g', { 'class': 'sketch' });
      // Panel izquierdo: vista de frente.
      var cx = 175, cy = 150, R = 95;
      tx(g, cx, 26, 'vista de frente (tú miras la página)', 'middle', 16);
      if (sc === 'slide') {
        // Región con campo a la derecha de x = 0 (en px: 175); espira cuadrada de lado a.
        var X0 = 160, s = 14, front = p.x0 + p.side * p.v * tt(), side = p.a * s, left = X0 + (front - p.a) * s;
        el(g, 'rect', { x: X0, y: 45, width: 330 - X0, height: 230, 'class': 'rect-fill', opacity: 0.35 });
        for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) bsym(g, X0 + 22 + i * 40, 70 + j * 60, 8, p.dir > 0, 'aux', 0.8);
        path(g, 'M' + X0 + ' 45V275', 'axis', 1.6, { 'stroke-dasharray': '6 5' });
        el(g, 'rect', { x: left.toFixed(1), y: (cy - side / 2).toFixed(1), width: side, height: side, 'class': 'ref', fill: 'none', 'stroke-width': 5 });
        path(g, 'M' + (left + side / 2 - 30).toFixed(1) + ' ' + (cy + side / 2 + 22) + 'h60', 'student', 3);
        tx(g, left + side / 2, cy + side / 2 + 44, p.side > 0 ? 'v →' : '← v', 'middle', 17);
        if (shown && tr.current !== 'none') {
          var lc = left + side / 2;
          circulation(g, lc, cy, side * 0.32, tr.current, 'trace');
          bsym(g, lc, cy, 10, tr.Bind === 'out', 'trace');
        }
      } else {
        var ext = tr.Bext === 'out', mag = Math.min(1, Math.abs(tr.phi) / (sc === 'field' ? 0.0045 : 0.0012));
        for (var a = -2; a <= 2; a++) for (var b = -2; b <= 2; b++) if (Math.hypot(a, b) <= 2.3) bsym(g, cx + a * 38, cy + b * 38, 8, ext, 'aux', 0.2 + 0.8 * mag);
        el(g, 'circle', { cx: cx, cy: cy, r: R, 'class': 'ref', fill: 'none', 'stroke-width': 5 });
        if (shown && tr.current !== 'none') {
          circulation(g, cx, cy, R + 14, tr.current, 'trace');
          bsym(g, cx, cy, 14, tr.Bind === 'out', 'trace');
        }
      }
      // Panel derecho: vista de lado.
      var sx = 470, sy = 160;
      tx(g, sx, 26, 'vista de lado', 'middle', 16);
      tx(g, 360, sy + 6, 'tú', 'start', 17);
      path(g, 'M385 ' + sy + 'h22', 'axis', 1.8);
      el(g, 'ellipse', { cx: sx - 40, cy: sy, rx: 9, ry: 52, 'class': 'ref', fill: 'none', 'stroke-width': 4 });
      tx(g, sx - 40, sy + 78, 'espira', 'middle', 15);
      if (sc === 'magnet') {
        var d = Math.max(0.5, p.d0 - p.move * p.v * tt()), mx = sx - 40 + 18 + d * 9;
        var nRight = p.pole < 0;              // con N hacia la espira, la N queda a la izquierda del imán
        el(g, 'rect', { x: mx, y: sy - 16, width: 40, height: 32, 'class': nRight ? 'box-aux' : 'box-err' });
        el(g, 'rect', { x: mx + 40, y: sy - 16, width: 40, height: 32, 'class': nRight ? 'box-err' : 'box-aux' });
        tx(g, mx + 20, sy + 7, nRight ? 'S' : 'N', 'middle', 19);
        tx(g, mx + 60, sy + 7, nRight ? 'N' : 'S', 'middle', 19);
        path(g, (p.move > 0 ? 'M' + (mx + 60) + ' ' + (sy - 34) + 'h-40m10 -7l-10 7l10 7' : 'M' + (mx + 20) + ' ' + (sy - 34) + 'h40m-10 -7l10 7l-10 7'), 'student', 3);
        tx(g, mx + 40, sy - 48, p.move > 0 ? 'se acerca' : 'se aleja', 'middle', 15);
        // Campo en la espira: sale hacia ti si la N mira a la espira.
        path(g, p.pole > 0 ? 'M' + (sx - 30) + ' ' + (sy + 30) + 'h-50m10 -7l-10 7l10 7' : 'M' + (sx - 80) + ' ' + (sy + 30) + 'h50m-10 -7l10 7l-10 7', 'aux', 2.6);
        tx(g, sx - 55, sy + 54, 'B', 'middle', 17);
      } else {
        for (var k = -1; k <= 1; k++) path(g, tr.Bext === 'out' ? 'M560 ' + (sy + k * 30) + 'H430m10 -7l-10 7l10 7' : 'M430 ' + (sy + k * 30) + 'H560m-10 -7l10 7l-10 7', 'aux', 2);
        tx(g, 580, sy + 6, 'B', 'start', 18);
      }
      tx(g, 320, 306, tr.change === 'up' ? '|Φ| crece' : tr.change === 'down' ? '|Φ| decrece' : 'Φ no cambia', 'middle', 18);
    }

    function drawPlot(p, tr) {
      var n = 160, ys = [];
      for (var k = 0; k <= n; k++) ys.push(flux(sc, p, k / n) * 1000);
      var yr = window.LabPlot.range(ys);
      var P = window.LabPlot(plot, { x: [0, 1], y: yr });
      P.clear().grid().axes();
      P.curve(function (x) { return flux(sc, p, x) * 1000; }, 'ref', 3);
      P.segments([[[tt(), yr[0]], [tt(), yr[1]]]], 'error', 1.6);
      P.point(tt(), tr.phi * 1000, 'dot-error', 6);
      P.label(0, yr[1], 'Φ (mWb), + = sale', 'start', 15, 6, 22);
      P.label(1, yr[0], 't (s)', 'end', 15, -4, -10);
      plotNote.textContent = 'La fem es ε = −dΦ/dt: si la gráfica sube, la corriente inducida produce un campo que entra (horaria); si baja, uno que sale (antihoraria); si está plana, no hay corriente.';
    }

    function draw() {
      stopIfDone();
      var p = params(), tr = induced(sc, p, tt());
      title.textContent = sc === 'magnet' ? 'Imán y espira' : sc === 'field' ? 'Campo uniforme que cambia' : 'Espira que cruza el borde del campo';
      drawScene(p, tr);
      drawPlot(p, tr);
      facts.innerHTML = '';
      [['Φ (por la espira)', UI.fmt(tr.phi * 1000, 4) + ' mWb'], ['dΦ/dt', UI.fmt(tr.dphi * 1000, 4) + ' mWb/s'], ['ε = −dΦ/dt', UI.fmt(tr.emf * 1000, 4) + ' mV'],
        ['campo externo', tr.Bext === 'out' ? 'sale (⊙)' : tr.Bext === 'in' ? 'entra (⊗)' : '—'],
        ['corriente inducida', shown ? (tr.current === 'ccw' ? 'antihoraria' : tr.current === 'cw' ? 'horaria' : 'ninguna') : 'compruébalo']]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }
    function stopIfDone() { /* el cursor de tiempo lo maneja la animación */ }

    function check() {
      student = { current: CURS[+curSel.input.value][0], Bind: BINDS[+bSel.input.value][0] };
      var tr = induced(sc, params(), tt()), r = diagnose(tr, student), msg = MSG[r] || MSG.bad;
      shown = true;
      UI.verdict(verdict, KIND[r] || 'warn', msg[0], msg[1]);
      draw();
    }

    // Ejemplo cargado: imán con la N hacia la espira que se aleja; un compañero puso el campo inducido contra B.
    scSel.input.value = String(['magnet', 'field', 'slide'].indexOf(sc));
    relabel();
    o1.input.value = '0'; o2.input.value = '1';
    t = 0.3; timeS.set(t);
    curSel.input.value = '1'; bSel.input.value = '1';
    note.textContent = 'Ejemplo cargado: así respondió un compañero (horaria, el campo inducido entra). ¿Ves el error? Luego cambia la escena o pide otra situación.';
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
