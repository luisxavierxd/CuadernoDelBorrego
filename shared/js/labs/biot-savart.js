/* =====================================================================
   Lab biot-savart (Física 3 · S06): el campo de una corriente, trozo a trozo.
   El alambre se parte en N trozos; cada uno aporta
     dB = (μ₀/4π) I dl × r̂ / r²
   y el lab los suma como vectores en 3D. La suma se compara con la fórmula
   cerrada de cada geometría (SI: A, m, T):
     tramo recto  B = μ₀I/4πa · (x₂/√(x₂² + a²) − x₁/√(x₁² + a²))
                  (= μ₀I/4πa · (sin θ₂ − sin θ₁), con θ medido desde la perpendicular)
     infinito     B = μ₀I/2πa
     arco         B = μ₀Iφ/4πR en su centro (φ en radianes)
     espira       B = μ₀IR²/2(z² + R²)^{3/2} en su eje
   En el lab las distancias van en cm y el campo en µT.
   Reto: el alumno predice |B| (µT) y su sentido; el lab detecta:
     reversed   sentido al revés (regla de la mano derecha)
     cm         usó centímetros como si fueran metros (×100 o ÷100)
     infinite   usó μ₀I/2πa para un tramo que no es infinito
     fullLoop   usó μ₀I/2R (espira completa) para un arco
     degrees    dejó φ en grados
     center     usó el campo del centro de la espira, sin z
     noPow      olvidó la potencia 3/2 en la espira
   ===================================================================== */
(function () {
  var MU0 = 4 * Math.PI * 1e-7, RAD = Math.PI / 180, DEG = 180 / Math.PI;

  /* ------------------------- Matemática pura ------------------------- */
  function infinite(I, a) { return MU0 * I / (2 * Math.PI * a); }
  // Tramo recto sobre el eje x de x₁ a x₂; el punto está a distancia a de la recta, en x = 0.
  function segment(I, a, x1, x2) { return MU0 * I / (4 * Math.PI * a) * (x2 / Math.hypot(x2, a) - x1 / Math.hypot(x1, a)); }
  // Lo mismo con los ángulos (°) que forman los extremos con la perpendicular.
  function angles(I, a, t1, t2) { return MU0 * I / (4 * Math.PI * a) * (Math.sin(t2 * RAD) - Math.sin(t1 * RAD)); }
  function arc(I, R, phiDeg) { return MU0 * I * phiDeg * RAD / (4 * Math.PI * R); }
  function loopAxis(I, R, z, N) { return (N || 1) * MU0 * I * R * R / (2 * Math.pow(z * z + R * R, 1.5)); }
  function loopCenter(I, R, N) { return (N || 1) * MU0 * I / (2 * R); }

  // Trozos de cada geometría (m). Cada trozo: { a: [x, y, z], b: [x, y, z] }, la corriente va de a a b.
  //   segment  { a, x1, x2 }       alambre en el eje x, P = (0, a, 0)
  //   arc      { R, phi }          arco en el plano xy, antihorario desde el eje x, P en el centro
  //   loop     { R, z }            espira completa antihoraria vista desde +z, P = (0, 0, z)
  function pieces(kind, g, n) {
    var out = [], i;
    if (kind === 'segment' || kind === 'infinite') {
      for (i = 0; i < n; i++) {
        var xa = g.x1 + (g.x2 - g.x1) * i / n, xb = g.x1 + (g.x2 - g.x1) * (i + 1) / n;
        out.push({ a: [xa, 0, 0], b: [xb, 0, 0] });
      }
      return { pcs: out, P: [0, g.a, 0] };
    }
    var phi = kind === 'loop' ? 360 : g.phi;
    for (i = 0; i < n; i++) {
      var t0 = phi * i / n * RAD, t1 = phi * (i + 1) / n * RAD;
      out.push({ a: [g.R * Math.cos(t0), g.R * Math.sin(t0), 0], b: [g.R * Math.cos(t1), g.R * Math.sin(t1), 0] });
    }
    return { pcs: out, P: [0, 0, kind === 'loop' ? g.z : 0] };
  }
  // dB de un trozo recto, evaluado en su punto medio (regla del punto medio).
  function dB(pc, I, P) {
    var m = [(pc.a[0] + pc.b[0]) / 2, (pc.a[1] + pc.b[1]) / 2, (pc.a[2] + pc.b[2]) / 2];
    var dl = [pc.b[0] - pc.a[0], pc.b[1] - pc.a[1], pc.b[2] - pc.a[2]];
    var r = [P[0] - m[0], P[1] - m[1], P[2] - m[2]], rr = Math.hypot(r[0], r[1], r[2]);
    var k = MU0 / (4 * Math.PI) * I / (rr * rr * rr);
    return [k * (dl[1] * r[2] - dl[2] * r[1]), k * (dl[2] * r[0] - dl[0] * r[2]), k * (dl[0] * r[1] - dl[1] * r[0])];
  }
  function sum(kind, g, I, n) {
    var w = pieces(kind, g, n), B = [0, 0, 0], parts = [];
    w.pcs.forEach(function (pc) { var d = dB(pc, I, w.P); parts.push(d); B[0] += d[0]; B[1] += d[1]; B[2] += d[2]; });
    return { B: B, mag: Math.hypot(B[0], B[1], B[2]), parts: parts, P: w.P, pcs: w.pcs };
  }
  // Fórmula cerrada de cada geometría, con signo: + sale de la página (o +z).
  function closed(kind, g, I) {
    if (kind === 'segment') return segment(I, g.a, g.x1, g.x2);
    if (kind === 'infinite') return infinite(I, g.a);
    if (kind === 'arc') return arc(I, g.R, g.phi);
    return loopAxis(I, g.R, g.z);
  }

  /* ---------- Reto ----------
     c = { kind, I (A), a, x1, x2, R, z (cm), phi (°), dir: +1 / −1 }
     dir: en el tramo, +1 = la corriente va a la derecha (P arriba del alambre);
          en arco y espira, +1 = antihoraria vista desde P (o desde +z). */
  function geom(c) {
    var m = 0.01;
    if (c.kind === 'segment') return { a: c.a * m, x1: c.x1 * m, x2: c.x2 * m };
    if (c.kind === 'infinite') return { a: c.a * m };
    if (c.kind === 'arc') return { R: c.R * m, phi: c.phi };
    return { R: c.R * m, z: c.z * m };
  }
  // Campo del reto en µT, con sentido (+1 sale / +z, −1 entra / −z).
  function truth(c) {
    var b = closed(c.kind, geom(c), c.I) * 1e6;
    return { mag: Math.abs(b), dir: (b >= 0 ? 1 : -1) * c.dir };
  }
  function mistakes(c) {
    var t = truth(c), g = geom(c), o = { reversed: { mag: t.mag, dir: -t.dir } };
    // cm como metros: todas las longitudes 100 veces menores en el denominador.
    var gcm = { a: c.a, x1: c.x1, x2: c.x2, R: c.R, z: c.z, phi: c.phi };
    o.cm = { mag: Math.abs(closed(c.kind, gcm, c.I)) * 1e6, dir: t.dir };
    if (c.kind === 'segment') o.infinite = { mag: infinite(c.I, g.a) * 1e6, dir: t.dir };
    if (c.kind === 'arc') {
      o.fullLoop = { mag: loopCenter(c.I, g.R) * 1e6, dir: t.dir };
      o.degrees = { mag: t.mag * DEG, dir: t.dir };
    }
    if (c.kind === 'loop') {
      o.center = { mag: loopCenter(c.I, g.R) * 1e6, dir: t.dir };
      o.noPow = { mag: MU0 * c.I * g.R * g.R / (2 * (g.z * g.z + g.R * g.R)) * 1e6, dir: t.dir };
    }
    return o;
  }
  // student = { mag (µT), dir (+1 / −1) }.
  function diagnose(c, s, tol) {
    tol = tol || 0.03;
    if (!s || !isFinite(s.mag) || !(s.dir === 1 || s.dir === -1)) return 'bad';
    var t = truth(c), m = mistakes(c);
    var magOk = function (w) { return Math.abs(s.mag - w.mag) <= tol * w.mag; };
    var distinct = function (w) { return Math.abs(w.mag - t.mag) > tol * t.mag; };
    if (magOk(t) && s.dir === t.dir) return 'ok';
    if (magOk(t)) return 'reversed';
    var keys = ['infinite', 'fullLoop', 'degrees', 'center', 'noPow', 'cm'];
    for (var i = 0; i < keys.length; i++) {
      var w = m[keys[i]];
      if (w && distinct(w) && magOk(w)) return keys[i];
    }
    if (s.dir === t.dir) return 'dirOk';
    return 'bad';
  }

  // Las mismas fórmulas en unidades de clase: distancias en cm, campo en µT (las usan ejemplos y ejercicios).
  function infiniteUT(I, a) { return infinite(I, a / 100) * 1e6; }
  function segmentUT(I, a, x1, x2) { return segment(I, a / 100, x1 / 100, x2 / 100) * 1e6; }
  function arcUT(I, R, phiDeg) { return arc(I, R / 100, phiDeg) * 1e6; }
  function loopAxisUT(I, R, z, N) { return loopAxis(I, R / 100, z / 100, N) * 1e6; }
  function loopCenterUT(I, R, N) { return loopCenter(I, R / 100, N) * 1e6; }
  // Distancia (cm) a la que un alambre largo da B (µT).
  function distanceCm(I, BuT) { return MU0 * I / (2 * Math.PI * BuT * 1e-6) * 100; }

  window.LabMath.biot = {
    MU0: MU0, infinite: infinite, segment: segment, angles: angles, arc: arc, loopAxis: loopAxis, loopCenter: loopCenter,
    infiniteUT: infiniteUT, segmentUT: segmentUT, arcUT: arcUT, loopAxisUT: loopAxisUT, loopCenterUT: loopCenterUT, distanceCm: distanceCm,
    pieces: pieces, dB: dB, sum: sum, closed: closed, geom: geom, truth: truth, mistakes: mistakes, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var VW = 640, VH = 420;
  var MODES = ['Tramo recto', 'Alambre largo (infinito)', 'Arco', 'Espira, en su eje'];
  var KEYS = ['segment', 'infinite', 'arc', 'loop'];
  var MSG = {
    ok: ['Tu predicción coincide', 'Magnitud y sentido correctos.'],
    reversed: ['La magnitud está bien; el sentido no', 'Usa la regla de la mano derecha: pulgar con la corriente, los dedos rodean al alambre en el sentido de B.'],
    cm: ['Revisa las unidades de longitud', 'En μ₀I/(…) las distancias van en metros: 3 cm = 0.03 m. Usar centímetros cambia B por un factor de 100.'],
    infinite: ['Usaste la fórmula del alambre infinito', 'Este tramo es corto: sus extremos se ven con ángulos que no son ±90°. Usa B = μ₀I/4πa · (sin θ₂ − sin θ₁).'],
    fullLoop: ['Usaste la espira completa', 'Un arco de ángulo φ da solo la fracción φ/2π del campo de la espira: B = μ₀Iφ/4πR.'],
    degrees: ['Dejaste φ en grados', 'En B = μ₀Iφ/4πR el ángulo va en radianes: φ = (grados)·π/180.'],
    center: ['Usaste el campo del centro', 'P está sobre el eje, a una distancia z del centro: B = μ₀IR²/2(z² + R²)^{3/2}.'],
    noPow: ['Te faltó la potencia 3/2', 'En el eje de la espira el denominador es (z² + R²)^{3/2}, no (z² + R²).'],
    dirOk: ['El sentido está bien; la magnitud no', 'Revisa la fórmula de la geometría y pasa todo a metros y amperes.'],
    bad: ['Tu predicción no coincide', 'Escoge la fórmula de la geometría, pasa a metros y usa la mano derecha para el sentido.']
  };
  var KIND = { ok: 'ok', reversed: 'warn', cm: 'warn', infinite: 'warn', fullLoop: 'warn', degrees: 'warn', center: 'warn', noPow: 'warn', dirOk: 'warn' };
  var DIRS = { flat: ['Sale de la página (⊙)', 'Entra a la página (⊗)'], axis: ['Hacia +z (arriba)', 'Hacia −z (abajo)'] };

  window.Labs['biot-savart'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var st = { kind: 'segment', I: 5, a: 4, x1: -6, x2: 10, L: 10, R: 5, phi: 180, z: 4, n: 8, dir: 1 }, chal = null, student = null;
    if (cfg && cfg.mode) st.kind = cfg.mode;

    var mode = UI.select({ label: 'Geometría', options: MODES });
    mode.input.value = String(KEYS.indexOf(st.kind));
    var sI = UI.slider({ label: 'Corriente I', min: 1, max: 10, step: 1, value: st.I, unit: 'A' }, function (v) { st.I = v; draw(); });
    var sN = UI.slider({ label: 'Número de trozos N', min: 1, max: 40, step: 1, value: st.n, unit: '' }, function (v) { st.n = v; draw(); });
    var sA = UI.slider({ label: 'Distancia a', min: 1, max: 8, step: 0.5, value: st.a, unit: 'cm' }, function (v) { st.a = v; draw(); });
    var sX1 = UI.slider({ label: 'Extremo izquierdo x₁', min: -14, max: 13, step: 1, value: st.x1, unit: 'cm' }, function (v) { st.x1 = Math.min(v, st.x2 - 1); sX1.set(st.x1); draw(); });
    var sX2 = UI.slider({ label: 'Extremo derecho x₂', min: -13, max: 14, step: 1, value: st.x2, unit: 'cm' }, function (v) { st.x2 = Math.max(v, st.x1 + 1); sX2.set(st.x2); draw(); });
    var sL = UI.slider({ label: 'Medio largo del alambre L', min: 2, max: 100, step: 2, value: st.L, unit: 'cm' }, function (v) { st.L = v; draw(); });
    var sR = UI.slider({ label: 'Radio R', min: 2, max: 8, step: 0.5, value: st.R, unit: 'cm' }, function (v) { st.R = v; draw(); });
    var sP = UI.slider({ label: 'Ángulo del arco φ', min: 30, max: 360, step: 15, value: st.phi, unit: '°' }, function (v) { st.phi = v; draw(); });
    var sZ = UI.slider({ label: 'Altura z sobre el centro', min: 0, max: 10, step: 0.5, value: st.z, unit: 'cm' }, function (v) { st.z = v; draw(); });
    var bDir = UI.button('Invertir la corriente', 'ghost', function () { st.dir = -st.dir; draw(); });
    var note = h('p', { class: 'lab-note', role: 'status' });

    var chalText = h('p', { class: 'lab-note' });
    var magIn = UI.input({ label: 'Tu |B| en P (µT)', type: 'text', inputmode: 'decimal', mono: false, hint: 'Notación científica: <code>2.5e1</code> o <code>2.5×10^1</code>.' });
    var dirSel = UI.select({ label: 'Sentido de B en P', options: DIRS.flat });
    var bCheck = UI.button('Comprobar', 'primary', check);
    var bNew = UI.button('Otro reto', 'ghost', function () { newChallenge(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var svg = UI.svg(VW, VH, 'Un alambre partido en trozos; cada trozo aporta un campo dB en el punto P.');
    var legend = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--ref' }), 'alambre y corriente']),
      h('li', {}, [h('i', { class: 'sw sw--aux' }), 'dB de cada trozo']),
      h('li', {}, [h('i', { class: 'sw sw--error' }), 'B total en P (⊙ o ⊗)'])
    ]);
    var facts = h('dl', { class: 'lab-facts' });

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        mode.node, sI.node, sN.node, sA.node, sX1.node, sX2.node, sL.node, sR.node, sP.node, sZ.node,
        h('div', { class: 'lab-buttons' }, [bDir]), note,
        h('p', { class: 'lab-field__label' }, ['Reto: predice B en P']), chalText,
        h('div', { class: 'lab-row' }, [magIn.node, dirSel.node]),
        h('div', { class: 'lab-buttons' }, [bCheck, bNew]), verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Biot–Savart trozo a trozo']),
        svg, legend, facts
      ])
    ]));
    // Sin mayúsculas en las etiquetas de los campos: µ se volvía Μ (y mT, MT); θ y φ, Θ y Φ.
    mount.querySelectorAll('label.lab-field__label').forEach(function (l) { l.style.textTransform = 'none'; l.style.letterSpacing = '0'; });
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    magIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    mode.input.addEventListener('change', function () { st.kind = KEYS[+mode.input.value]; chal = null; student = null; verdict.hidden = true; chalText.textContent = ''; draw(); });

    function parse(s) { return window.CBExercises ? window.CBExercises.parseNumber(s) : parseFloat(String(s).replace(/−/g, '-')); }
    function show(node, on) { node.hidden = !on; node.style.display = on ? '' : 'none'; }
    function el(tag, attrs, text) {
      if (!UI.svgOk(attrs)) return null;
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (text != null) n.textContent = text;
      svg.querySelector('g.sketch').appendChild(n);
      return n;
    }
    function line(cls, x1, y1, x2, y2, w, dash) { el('path', { 'class': cls, fill: 'none', 'stroke-width': w || 2, 'stroke-linecap': 'round', 'stroke-dasharray': dash || null, d: 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) }); }
    function arrowPx(cls, x, y, dx, dy, w, dash) {
      var L = Math.hypot(dx, dy);
      if (!(L > 3)) return;
      var ux = dx / L, uy = dy / L, hh = Math.min(10, L * 0.45), ex = x + dx, ey = y + dy;
      el('path', { 'class': cls, fill: 'none', 'stroke-width': w || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': dash || null,
        d: 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
          'M' + (ex - ux * hh - uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh + ux * hh * 0.6).toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
          'L' + (ex - ux * hh + uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh - ux * hh * 0.6).toFixed(1) });
    }
    function txt(x, y, s, anchor, fs) { el('text', { x: x.toFixed(1), y: y.toFixed(1), 'class': 'ann', 'text-anchor': anchor || 'middle', 'font-size': fs || 16 }, s); }
    // ⊙ (sale) o ⊗ (entra), de radio r.
    function outIn(x, y, r, out, cls) {
      el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: r, fill: 'none', 'class': cls, 'stroke-width': 2.2 });
      if (out) el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: Math.max(2, r * 0.22), 'class': 'dot-' + cls });
      else { var k = r * 0.62; line(cls, x - k, y - k, x + k, y + k, 2.2); line(cls, x - k, y + k, x + k, y - k, 2.2); }
    }
    function fmtB(uT) {
      if (!isFinite(uT)) return '—';
      var a = Math.abs(uT);
      if (a >= 1000) return Number((uT / 1000).toPrecision(3)) + ' mT';
      if (a >= 0.1) return Number(uT.toPrecision(3)) + ' µT';
      return Number((uT * 1000).toPrecision(3)) + ' nT';
    }
    function geo() {
      var m = 0.01;
      if (st.kind === 'segment') return { a: st.a * m, x1: st.x1 * m, x2: st.x2 * m };
      if (st.kind === 'infinite') return { a: st.a * m, x1: -st.L * m, x2: st.L * m };
      if (st.kind === 'arc') return { R: st.R * m, phi: st.phi };
      return { R: st.R * m, z: st.z * m };
    }

    function draw() {
      var k = st.kind;
      show(sA.node, k === 'segment' || k === 'infinite'); show(sX1.node, k === 'segment'); show(sX2.node, k === 'segment');
      show(sL.node, k === 'infinite'); show(sR.node, k === 'arc' || k === 'loop'); show(sP.node, k === 'arc'); show(sZ.node, k === 'loop');
      dirSel.input.options[0].textContent = (k === 'loop' ? DIRS.axis : DIRS.flat)[0];
      dirSel.input.options[1].textContent = (k === 'loop' ? DIRS.axis : DIRS.flat)[1];
      svg.innerHTML = '';
      svg.appendChild(document.createElementNS(NS, 'g')).setAttribute('class', 'sketch');
      var g = geo(), I = st.I * st.dir, S = sum(k, g, I, st.n), Bc = (k === 'infinite' ? segment(I, g.a, g.x1, g.x2) : closed(k, g, I));
      var Bz = (k === 'loop' ? S.B[2] : S.B[2]) * 1e6;
      var parts = S.parts.map(function (p) { return p[2] * 1e6; });
      // ---- Geometría (arriba, alto 250) ----
      if (k === 'segment' || k === 'infinite') {
        var half = k === 'infinite' ? st.L : 14, sc = Math.min(20, 290 / half), ox = 320, oy = 215;
        var X = function (x) { return ox + sc * x * 100; };
        line('axis', 20, oy, 620, oy, 1.2, '4 6');
        S.pcs.forEach(function (pc, i) {
          var x0 = X(pc.a[0]), x1 = X(pc.b[0]);
          line(i % 2 ? 'ref' : 'trace', x0, oy, x1, oy, 5);
        });
        // Flecha de la corriente
        var xm = X((g.x1 + g.x2) / 2);
        arrowPx('ref', xm - 22 * st.dir, oy + 22, 44 * st.dir, 0, 2.6);
        txt(xm, oy + 50, 'I = ' + st.I + ' A');
        var py = oy - sc * st.a;
        line('axis', ox, oy, ox, py, 1.2, '3 5');
        txt(ox + 8, (oy + py) / 2 + 5, 'a = ' + st.a + ' cm', 'start', 15);
        if (st.n <= 40) S.pcs.forEach(function (pc) { var mx = X((pc.a[0] + pc.b[0]) / 2); line('aux', mx, oy, ox, py, 1, '2 5'); });
        outIn(ox, py, 9 + Math.min(14, Math.abs(Bz) / 20), Bz >= 0, 'error');
        txt(ox, py - 28, 'P', 'middle', 18);
        if (k === 'segment') { txt(X(g.x1), oy + 28, 'x₁', 'middle', 15); txt(X(g.x2), oy + 28, 'x₂', 'middle', 15); }
        else txt(600, oy - 10, '2L = ' + (2 * st.L) + ' cm', 'end', 15);
      } else if (k === 'arc') {
        var cx = 320, cy = 140, s2 = 14, R = st.R * s2;
        el('circle', { cx: cx, cy: cy, r: R, fill: 'none', 'class': 'axis', 'stroke-width': 1, 'stroke-dasharray': '3 6' });
        S.pcs.forEach(function (pc, i) {
          line(i % 2 ? 'ref' : 'trace', cx + pc.a[0] * 100 * s2, cy - pc.a[1] * 100 * s2, cx + pc.b[0] * 100 * s2, cy - pc.b[1] * 100 * s2, 5);
          var mx = cx + (pc.a[0] + pc.b[0]) * 50 * s2, my = cy - (pc.a[1] + pc.b[1]) * 50 * s2;
          line('aux', mx, my, cx, cy, 1, '2 5');
        });
        var am = st.phi / 2 * RAD;
        arrowPx('ref', cx + (R + 16) * Math.cos(am - 0.15 * st.dir), cy - (R + 16) * Math.sin(am - 0.15 * st.dir), -(R + 16) * Math.sin(am) * 0.3 * st.dir, -(R + 16) * Math.cos(am) * 0.3 * st.dir, 2.6);
        outIn(cx, cy, 9 + Math.min(14, Math.abs(Bz) / 20), Bz >= 0, 'error');
        txt(cx + 26, cy + 26, 'P', 'start', 18);
        txt(40, 40, 'φ = ' + st.phi + '°, R = ' + st.R + ' cm', 'start', 15);
      } else {
        // Espira vista en perspectiva: elipse abajo, eje vertical, P a la altura z.
        var ex = 320, ey = 205, rx = st.R * 15, ry = st.R * 5, zs = 14;
        el('ellipse', { cx: ex, cy: ey, rx: rx, ry: ry, fill: 'none', 'class': 'ref', 'stroke-width': 3 });
        line('axis', ex, ey + 20, ex, 22, 1.2, '4 6');
        txt(ex + 10, 30, 'z', 'start', 16);
        var Pz = ey - st.z * zs;
        S.pcs.forEach(function (pc, i) {
          var mx = ex + (pc.a[0] + pc.b[0]) * 50 * 15, my = ey - (pc.a[1] + pc.b[1]) * 50 * 5;
          if (i % Math.max(1, Math.round(st.n / 12)) === 0) {
            line('aux', mx, my, ex, Pz, 1, '2 5');
            var d = S.parts[i], sc3 = 40 / (Math.abs(S.B[2]) / st.n || 1);
            // dB proyectado: x → pantalla x, y → profundidad (×1/3), z → arriba.
            arrowPx('aux', ex, Pz, d[0] * sc3 * 0.9, -(d[2] * sc3 + d[1] * sc3 * 0.3), 1.8, '5 4');
          }
        });
        arrowPx('error', ex, Pz, 0, -Math.sign(Bz) * Math.min(90, 30 + Math.abs(Bz) / 4), 3.4);
        el('circle', { cx: ex, cy: Pz.toFixed(1), r: 4, 'class': 'dot-error' });
        txt(ex - 14, Pz + 5, 'P', 'end', 18);
        arrowPx('ref', ex + rx * 0.7 - 12 * st.dir, ey + ry * 0.72 + 2, 24 * st.dir, 0, 2.6);
        txt(ex + rx + 8, ey + 5, 'I', 'start', 16);
      }
      // ---- Barras: aporte de cada trozo (abajo) ----
      var bx0 = 40, bx1 = 600, by = 395, bh = 105, maxP = Math.max.apply(null, parts.map(Math.abs).concat([1e-12]));
      line('axis', bx0, by, bx1, by, 1.2);
      txt(bx0, by - bh - 8, 'Aporte de cada trozo a B (µT)', 'start', 15);
      var w = (bx1 - bx0) / parts.length;
      parts.forEach(function (p, i) {
        var hp = bh * Math.abs(p) / maxP;
        el('rect', { x: (bx0 + i * w + w * 0.15).toFixed(1), y: (p >= 0 ? by - hp : by).toFixed(1), width: (w * 0.7).toFixed(1), height: hp.toFixed(1), 'class': 'rect-fill' + (p >= 0 ? '' : ' rect-fill--neg') });
      });
      // Lecturas
      var bnum = S.B[2] * 1e6, bcl = Bc * 1e6, err = Math.abs(bnum - bcl) / Math.abs(bcl) * 100;
      facts.innerHTML = '';
      var rows = [['suma de los ' + st.n + ' trozos', fmtB(bnum)], ['fórmula cerrada', fmtB(bcl)], ['diferencia', isFinite(err) ? Number(err.toPrecision(2)) + ' %' : '—']];
      if (k === 'infinite') rows.push(['alambre infinito μ₀I/2πa', fmtB(infinite(I, g.a) * 1e6)]);
      rows.push(['sentido de B en P', k === 'loop' ? (bnum >= 0 ? '+z (arriba)' : '−z (abajo)') : (bnum >= 0 ? 'sale de la página (⊙)' : 'entra a la página (⊗)')]);
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
      svg.setAttribute('aria-label', MODES[KEYS.indexOf(k)] + ' partido en ' + st.n + ' trozos. La suma da ' + fmtB(bnum) + ' y la fórmula cerrada ' + fmtB(bcl) + '.');
    }

    /* ---------- Reto ---------- */
    function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
    function newChallenge(fixed) {
      var k = fixed ? fixed.kind : rnd(KEYS), c;
      if (fixed) c = fixed;
      else if (k === 'segment') { var x1 = rnd([-8, -6, -4, -3, 0]), x2 = rnd([3, 4, 6, 8]); c = { kind: k, I: rnd([2, 4, 5, 8]), a: rnd([2, 3, 4]), x1: x1, x2: x2, dir: rnd([1, -1]) }; }
      else if (k === 'infinite') c = { kind: k, I: rnd([2, 3, 5, 6, 10]), a: rnd([1, 2, 2.5, 4, 5]), dir: rnd([1, -1]) };
      else if (k === 'arc') c = { kind: k, I: rnd([2, 4, 5, 6]), R: rnd([2, 3, 4, 5]), phi: rnd([60, 90, 120, 180, 270]), dir: rnd([1, -1]) };
      else c = { kind: k, I: rnd([2, 3, 5, 8]), R: rnd([2, 3, 4, 5]), z: rnd([1, 2, 3, 4, 5]), dir: rnd([1, -1]) };
      chal = c; student = null; verdict.hidden = true;
      st.kind = k; mode.input.value = String(KEYS.indexOf(k)); st.I = c.I; st.dir = c.dir; sI.set(c.I);
      if (k === 'segment') { st.a = c.a; st.x1 = c.x1; st.x2 = c.x2; sA.set(c.a); sX1.set(c.x1); sX2.set(c.x2); }
      if (k === 'infinite') { st.a = c.a; st.L = 100; sA.set(c.a); sL.set(100); }
      if (k === 'arc') { st.R = c.R; st.phi = c.phi; sR.set(c.R); sP.set(c.phi); }
      if (k === 'loop') { st.R = c.R; st.z = c.z; sR.set(c.R); sZ.set(c.z); }
      var dirTxt = c.dir > 0 ? 'antihorario' : 'horario';
      chalText.textContent = {
        segment: 'Un tramo recto lleva I = ' + c.I + ' A hacia la ' + (c.dir > 0 ? 'derecha' : 'izquierda') + '. P está ' + c.a + ' cm arriba del alambre; los extremos están en x₁ = ' + c.x1 + ' cm y x₂ = ' + c.x2 + ' cm, medidos desde el pie de la perpendicular.',
        infinite: 'Un alambre muy largo lleva I = ' + c.I + ' A hacia la ' + (c.dir > 0 ? 'derecha' : 'izquierda') + '. P está ' + c.a + ' cm arriba de él.',
        arc: 'Un arco de ' + c.phi + '° y radio ' + c.R + ' cm lleva I = ' + c.I + ' A en sentido ' + dirTxt + ' (visto desde arriba de la página). P es su centro.',
        loop: 'Una espira de radio ' + c.R + ' cm lleva I = ' + c.I + ' A en sentido ' + dirTxt + ' vista desde arriba (+z). P está en el eje, ' + c.z + ' cm arriba del centro.'
      }[k] + ' Predice |B| y su sentido antes de mirar la suma del lab.';
      magIn.input.value = '';
      draw();
    }
    function check() {
      if (!chal) { UI.verdict(verdict, 'bad', 'Primero pide un reto', 'Presiona «Otro reto».'); return; }
      var m = parse(magIn.input.value), d = dirSel.input.value === '0' ? 1 : -1;
      if (!isFinite(m)) { UI.verdict(verdict, 'bad', MSG.bad[0], 'Escribe |B| en µT.'); return; }
      student = { mag: m, dir: d };
      var key = diagnose(chal, student), t = truth(chal), msg = MSG[key] || MSG.bad;
      draw();
      var dname = chal.kind === 'loop' ? (t.dir > 0 ? '+z' : '−z') : (t.dir > 0 ? 'sale de la página' : 'entra a la página');
      UI.verdict(verdict, KIND[key] || 'bad', msg[0], msg[1] + ' B real: ' + Number(t.mag.toPrecision(3)) + ' µT, ' + dname + '.');
    }

    // Ejemplo cargado: un compañero usó la fórmula del alambre infinito para un tramo corto.
    newChallenge({ kind: 'segment', I: 5, a: 3, x1: -4, x2: 4, dir: 1 });
    var wrong = mistakes(chal).infinite;
    magIn.input.value = String(Number(wrong.mag.toPrecision(3)));
    dirSel.input.value = '0';
    note.textContent = 'Ejemplo cargado: así respondió un compañero el reto. ¿Ves su error? Presiona Comprobar, o cambia N y la geometría tú mismo.';
    check();
    return Promise.resolve();
  };
})();
