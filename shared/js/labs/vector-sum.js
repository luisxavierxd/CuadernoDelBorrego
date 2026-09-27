/* =====================================================================
   Lab vector-sum (§8.3): suma de dos vectores en el plano.
   El alumno da la magnitud y la dirección de R = A ± B; se compara contra
   la suma por componentes y se dibuja el método gráfico (cabeza con cola).
   Errores típicos que detecta:
     addedMagnitudes  |R| = |A| + |B| (sumó magnitudes, no vectores)
     rawArctan        θ = arctan(Ry/Rx) sin corregir el cuadrante
     swapped          usó seno para x y coseno para y
   Ángulos en grados, medidos desde +x en sentido antihorario, en [0, 360).
   ===================================================================== */
(function () {
  var RAD = Math.PI / 180, DEG = 180 / Math.PI;

  /* ------------------------- Matemática pura ------------------------- */
  function comps(mag, ang) { return { x: mag * Math.cos(ang * RAD), y: mag * Math.sin(ang * RAD) }; }
  function norm360(a) { a = a % 360; return a < 0 ? a + 360 : a; }
  function polar(x, y) { return { mag: Math.hypot(x, y), ang: norm360(Math.atan2(y, x) * DEG) }; }
  // list: [[mag, ang], …]; sign opcional por vector (+1 o −1) para restas.
  function sum(list, signs) {
    var x = 0, y = 0;
    list.forEach(function (v, i) { var c = comps(v[0], v[1]), s = signs ? signs[i] : 1; x += s * c.x; y += s * c.y; });
    var p = polar(x, y);
    return { x: x, y: y, mag: p.mag, ang: p.ang };
  }
  function angDiff(a, b) { var d = Math.abs(norm360(a) - norm360(b)); return Math.min(d, 360 - d); }
  function mistakes(list, signs) {
    var r = sum(list, signs), sx = 0, sy = 0;
    list.forEach(function (v, i) { var s = signs ? signs[i] : 1; sx += s * v[0] * Math.sin(v[1] * RAD); sy += s * v[0] * Math.cos(v[1] * RAD); });
    return {
      addedMagnitudes: list.reduce(function (a, v) { return a + v[0]; }, 0),
      rawArctan: norm360(Math.atan(r.y / r.x) * DEG),
      swapped: polar(sx, sy)
    };
  }
  // student: { mag, ang }. tol: relativa para la magnitud y en grados para el ángulo.
  function diagnose(list, signs, student, tolRel, tolDeg) {
    tolRel = tolRel || 0.01; tolDeg = tolDeg || 1;
    if (!isFinite(student.mag) || !isFinite(student.ang)) return 'bad';
    var r = sum(list, signs), m = mistakes(list, signs);
    var magOk = Math.abs(student.mag - r.mag) <= tolRel * Math.max(r.mag, 1e-9);
    var angOk = angDiff(student.ang, r.ang) <= tolDeg;
    if (magOk && angOk) return 'ok';
    if (magOk && angDiff(student.ang, m.rawArctan) <= tolDeg && angDiff(m.rawArctan, r.ang) > tolDeg) return 'rawArctan';
    if (Math.abs(student.mag - m.addedMagnitudes) <= tolRel * m.addedMagnitudes && Math.abs(m.addedMagnitudes - r.mag) > tolRel * r.mag) return 'addedMagnitudes';
    if (angDiff(student.ang, m.swapped.ang) <= tolDeg && angDiff(m.swapped.ang, r.ang) > tolDeg) return 'swapped';
    if (magOk) return 'angleOff';
    if (angOk) return 'magOff';
    return 'bad';
  }

  window.LabMath.vectors = { comps: comps, polar: polar, sum: sum, angDiff: angDiff, norm360: norm360, mistakes: mistakes, diagnose: diagnose };

  /* ------------------------------ UI ------------------------------ */
  var MSG = {
    ok: ['Tu resultante coincide', 'Magnitud y dirección correctas.'],
    rawArctan: ['La magnitud está bien; revisa el cuadrante', 'arctan(Ry/Rx) solo da ángulos entre −90° y 90°. Mira los signos de Rx y Ry: si Rx < 0, súmale 180°.'],
    addedMagnitudes: ['Sumaste magnitudes, no vectores', '|A + B| = |A| + |B| solo si apuntan al mismo lado. Suma componente por componente y luego usa Pitágoras.'],
    swapped: ['Intercambiaste seno y coseno', 'Con el ángulo medido desde +x: Ax = A cos θ y Ay = A sin θ.'],
    angleOff: ['La magnitud está bien; la dirección no', 'Calcula θ con los signos de Rx y Ry a la vista.'],
    magOff: ['La dirección está bien; la magnitud no', 'Revisa |R| = √(Rx² + Ry²).'],
    bad: ['Tu resultante no coincide', 'Descompón cada vector, suma las x y las y por separado y compara con la flecha verde.']
  };

  window.Labs['vector-sum'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var s = cfg.start || { A: [3, 60], B: [5, 160], op: 0 };
    var aM = UI.slider({ label: 'Magnitud de A', min: 0.5, max: 6, step: 0.5, value: s.A[0] }, refresh);
    var aT = UI.slider({ label: 'Ángulo de A', min: 0, max: 355, step: 5, value: s.A[1], unit: '°' }, refresh);
    var bM = UI.slider({ label: 'Magnitud de B', min: 0.5, max: 6, step: 0.5, value: s.B[0] }, refresh);
    var bT = UI.slider({ label: 'Ángulo de B', min: 0, max: 355, step: 5, value: s.B[1], unit: '°' }, refresh);
    var op = UI.select({ label: 'Operación', options: ['R = A + B', 'R = A − B'] });
    var mIn = UI.input({ label: 'Tu |R|', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var tIn = UI.input({ label: 'Tu θ (grados desde +x)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(640, 420, 'Suma de vectores: A, B colocado en la cabeza de A y la resultante R');
    var student = null;

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        aM.node, aT.node, bM.node, bT.node, op.node,
        h('div', { class: 'lab-row' }, [mIn.node, tIn.node]),
        h('div', { class: 'lab-buttons' }, [run]), note, verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Cabeza con cola contra componentes']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'A']),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'B (o −B)']),
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'R real']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu R'])
        ]),
        facts
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    op.input.value = String(s.op || 0);
    op.input.addEventListener('change', function () { student = null; verdict.hidden = true; draw(); });
    [mIn.input, tIn.input].forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } }); });

    function state() {
      var list = [[aM.get(), aT.get()], [bM.get(), bT.get()]], signs = [1, op.input.value === '1' ? -1 : 1];
      return { list: list, signs: signs, r: sum(list, signs) };
    }

    function arrowSegs(x0, y0, x1, y1, hl) {
      var dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
      if (L < 1e-9) return [];
      var ux = dx / L, uy = dy / L, k = Math.min(hl, L * 0.4);
      return [[[x0, y0], [x1, y1]],
        [[x1, y1], [x1 - k * ux - k * 0.55 * uy, y1 - k * uy + k * 0.55 * ux]],
        [[x1, y1], [x1 - k * ux + k * 0.55 * uy, y1 - k * uy - k * 0.55 * ux]]];
    }

    function draw() {
      var st = state(), a = comps(st.list[0][0], st.list[0][1]), b = comps(st.list[1][0], st.list[1][1]);
      var bx = st.signs[1] * b.x, by = st.signs[1] * b.y;
      var pts = [[0, 0], [a.x, a.y], [a.x + bx, a.y + by], [bx, by]];
      if (student) { var sc = comps(student.mag, student.ang); pts.push([sc.x, sc.y]); }
      var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
      var pad = 1.2;
      var plot = window.LabPlot(svg, { x: [Math.min.apply(null, xs) - pad, Math.max.apply(null, xs) + pad], y: [Math.min.apply(null, ys) - pad, Math.max.apply(null, ys) + pad], equal: true });
      var span = plot.xr[1] - plot.xr[0], hl = span * 0.035;
      plot.clear(); plot.grid(); plot.axes();
      // Componentes de R (punteadas) y las tres flechas del método gráfico.
      plot.segments([[[0, 0], [st.r.x, 0]], [[st.r.x, 0], [st.r.x, st.r.y]]], 'axis', 1.5);
      plot.segments(arrowSegs(0, 0, a.x, a.y, hl), 'aux', 3.5);
      plot.segments(arrowSegs(a.x, a.y, a.x + bx, a.y + by, hl), 'trace', 3.5);
      plot.segments(arrowSegs(0, 0, st.r.x, st.r.y, hl), 'ref', 4);
      if (student) { var c = comps(student.mag, student.ang); plot.segments(arrowSegs(0, 0, c.x, c.y, hl), 'student', 3); }
      plot.label(a.x / 2, a.y / 2, 'A', 'middle', 18, -10, -8);
      plot.label(a.x + bx / 2, a.y + by / 2, st.signs[1] < 0 ? '−B' : 'B', 'middle', 18, 10, -8);
      plot.label(st.r.x / 2, st.r.y / 2, 'R', 'middle', 18, 12, 16);
      plot.label(st.r.x / 2, 0, 'Rx', 'middle', 15, 0, st.r.y >= 0 ? 18 : -8);
      plot.label(st.r.x, st.r.y / 2, 'Ry', st.r.x >= 0 ? 'start' : 'end', 15, st.r.x >= 0 ? 8 : -8, 0);

      facts.innerHTML = '';
      [['Ax, Ay', UI.fmt(a.x, 4) + ', ' + UI.fmt(a.y, 4)],
        [(st.signs[1] < 0 ? '−Bx, −By' : 'Bx, By'), UI.fmt(bx, 4) + ', ' + UI.fmt(by, 4)],
        ['Rx, Ry', UI.fmt(st.r.x, 4) + ', ' + UI.fmt(st.r.y, 4)],
        ['|R| real', UI.fmt(st.r.mag, 4)], ['θ real', UI.fmt(st.r.ang, 4) + '°']]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    // Al mover un deslizador, el veredicto se recalcula con la respuesta escrita.
    function refresh() { if (student) check(); else draw(); }

    function check() {
      var st = state();
      student = { mag: parseFloat(mIn.input.value), ang: parseFloat(tIn.input.value) };
      var kind = diagnose(st.list, st.signs, student);
      var msg = MSG[kind] || MSG.bad;
      UI.verdict(verdict, kind === 'ok' ? 'ok' : kind === 'bad' ? 'bad' : 'warn', msg[0], msg[1]);
      if (!isFinite(student.mag) || !isFinite(student.ang)) student = null;
      draw();
    }

    // Ejemplo cargado: un compañero sumó las magnitudes.
    (function loadExample() {
      var st = state();
      mIn.input.value = UI.fmt(mistakes(st.list, st.signs).addedMagnitudes, 4);
      tIn.input.value = UI.fmt(st.r.ang, 4);
      note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Ves el error? Cambia los vectores y escribe tu resultante.';
    })();
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
