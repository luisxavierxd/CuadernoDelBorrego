/* =====================================================================
   Lab magnetic-field-map (Física 3 · S01): imanes, brújula y líneas de campo.
   Cada imán de barra se modela como dos polos puntuales (N y S) a una
   distancia 2h; un polo de intensidad s da B = s·B₀·(R₀/r)² a distancia r,
   saliendo de N y entrando a S. Así se ven las líneas que salen de N, entran
   por S y se cierran por dentro. El campo de la Tierra se suma como un vector
   uniforme (50 µT hacia el norte). Unidades: cm y mT.
   Reto: el alumno predice el ángulo de B y su magnitud en la brújula; el lab
   detecta los errores típicos:
     reversed   apuntó la flecha al revés (de S a N del imán, o la aguja al revés)
     noEarth    olvidó el campo de la Tierra
     onePole    solo contó el polo más cercano
     swapped    confundió N con S del imán
     noSquare   usó 1/r en lugar de 1/r²
     units      µT por mT (×1000 o ÷1000)
     gauss      mT por gauss (×10)
   ===================================================================== */
(function () {
  var B0 = 1, R0 = 2, H = 3;                     // 1 mT a 2 cm de un polo s = 1; semilongitud 3 cm
  var EARTH = { mag: 0.05, ang: 90 };             // 0.05 mT = 50 µT hacia el norte (+y)
  var RAD = Math.PI / 180, DEG = 180 / Math.PI;
  var UNIT = { T: 1, mT: 1e-3, uT: 1e-6, G: 1e-4 };

  /* ------------------------- Matemática pura ------------------------- */
  function norm360(a) { a = a % 360; return a < 0 ? a + 360 : a; }
  function angDiff(a, b) { var d = Math.abs(norm360(a) - norm360(b)); return d > 180 ? 360 - d : d; }
  // Campo de un polo puntual: sign = +1 (N, sale) o −1 (S, entra); pow = 2 salvo para el error 1/r.
  function poleField(sign, s, px, py, x, y, pow) {
    var dx = x - px, dy = y - py, r = Math.hypot(dx, dy), p = pow == null ? 2 : pow;
    if (r < 1e-9) return { x: NaN, y: NaN };
    var m = sign * s * B0 * Math.pow(R0, p) / Math.pow(r, p + 1);
    return { x: m * dx, y: m * dy };
  }
  // m = { x, y, ang (° del eje de S a N), s, h }.
  function poles(m) {
    var h = m.h == null ? H : m.h, ux = Math.cos(m.ang * RAD), uy = Math.sin(m.ang * RAD);
    return { N: { x: m.x + h * ux, y: m.y + h * uy }, S: { x: m.x - h * ux, y: m.y - h * uy } };
  }
  function earthVec() { return { x: EARTH.mag * Math.cos(EARTH.ang * RAD), y: EARTH.mag * Math.sin(EARTH.ang * RAD) }; }
  function pack(x, y) { return { x: x, y: y, mag: Math.hypot(x, y), ang: norm360(Math.atan2(y, x) * DEG) }; }
  // opts: earth (bool), pow, only ('nearest' = solo el polo más cercano), flip (invierte N y S de cada imán).
  function field(magnets, x, y, opts) {
    opts = opts || {};
    var list = [];
    magnets.forEach(function (m) {
      var p = poles(m), s = m.s == null ? 1 : m.s, f = opts.flip ? -1 : 1;
      list.push({ sign: f, s: s, p: p.N }); list.push({ sign: -f, s: s, p: p.S });
    });
    if (opts.only === 'nearest') {
      list.sort(function (a, b) { return Math.hypot(a.p.x - x, a.p.y - y) - Math.hypot(b.p.x - x, b.p.y - y); });
      list = list.slice(0, 1);
    }
    var bx = 0, by = 0;
    list.forEach(function (q) { var e = poleField(q.sign, q.s, q.p.x, q.p.y, x, y, opts.pow); bx += e.x; by += e.y; });
    if (opts.earth) { var ev = earthVec(); bx += ev.x; by += ev.y; }
    return pack(bx, by);
  }
  // Rumbo medido desde el norte hacia el este (como una brújula): 0° = N, 90° = E.
  function bearing(x, y) { return norm360(Math.atan2(x, y) * DEG); }
  function convert(v, from, to) { return v * UNIT[from] / UNIT[to]; }
  // Cuántas veces es mayor a que b (cada uno con su unidad), con ambos pasados a µT.
  function ratio(a, ua, b, ub) { return { ratio: a * UNIT[ua] / (b * UNIT[ub]), a_uT: convert(a, ua, 'uT'), b_uT: convert(b, ub, 'uT') }; }
  // Suma vectorial de campos dados por magnitud y rumbo (° desde el norte hacia el este): [{ mag, bearing }].
  function combine(list) {
    var e = 0, n = 0;
    list.forEach(function (v) { e += v.mag * Math.sin(v.bearing * RAD); n += v.mag * Math.cos(v.bearing * RAD); });
    return { east: e, north: n, mag: Math.hypot(e, n), bearing: bearing(e, n) };
  }

  // Línea de campo con RK4 sobre la dirección de B. Termina al llegar a un polo (hit) o al salir de la caja.
  function trace(magnets, x0, y0, dir, opts) {
    opts = opts || {};
    var ds = opts.ds || 0.12, box = opts.box || [-12, -7.5, 12, 7.5], max = opts.max || 1800, stop = opts.stop || 0.3;
    var pts = [[x0, y0]], x = x0, y = y0, end = 'max', hit = null;
    var allPoles = [];
    magnets.forEach(function (m, i) { var p = poles(m); allPoles.push({ i: i, kind: 'N', p: p.N }, { i: i, kind: 'S', p: p.S }); });
    function dirAt(px, py) { var f = field(magnets, px, py, opts); return f.mag > 0 ? [dir * f.x / f.mag, dir * f.y / f.mag] : [0, 0]; }
    for (var k = 0; k < max; k++) {
      var a = dirAt(x, y), b = dirAt(x + ds / 2 * a[0], y + ds / 2 * a[1]), c = dirAt(x + ds / 2 * b[0], y + ds / 2 * b[1]), d = dirAt(x + ds * c[0], y + ds * c[1]);
      x += ds / 6 * (a[0] + 2 * b[0] + 2 * c[0] + d[0]); y += ds / 6 * (a[1] + 2 * b[1] + 2 * c[1] + d[1]);
      if (!isFinite(x) || !isFinite(y)) { end = 'bad'; break; }
      pts.push([x, y]);
      var near = allPoles.filter(function (q) { return Math.hypot(q.p.x - x, q.p.y - y) < stop; })[0];
      if (near) { end = 'pole'; hit = near; break; }
      if (x < box[0] || x > box[2] || y < box[1] || y > box[3]) { end = 'out'; break; }
    }
    return { pts: pts, end: end, hit: hit };
  }
  // Líneas que salen de cada polo N (n por polo), a un radio pequeño.
  function lines(magnets, n, opts) {
    var out = [];
    magnets.forEach(function (m) {
      var N = poles(m).N;
      for (var i = 0; i < n; i++) {
        var a = 2 * Math.PI * (i + 0.5) / n;
        out.push(trace(magnets, N.x + 0.45 * Math.cos(a), N.y + 0.45 * Math.sin(a), 1, opts));
      }
    });
    return out;
  }

  // Situaciones del reto que se pueden hacer a mano: P sobre el eje o en la mediatriz de un imán en el origen.
  //   axis      P en el eje, a d cm del polo N (del lado de N): B = s·B₀·R₀²·[1/d² − 1/(d + 2h)²] hacia afuera
  //   bisector  P en la mediatriz a d cm del centro: B = 2·s·B₀·R₀²·h / (h² + d²)^{3/2}, opuesto al eje S→N
  function setup(c) {
    var h = H, a = c.ang * RAD, ux = Math.cos(a), uy = Math.sin(a), px, py;
    if (c.kind === 'axis') { px = (h + c.d) * ux; py = (h + c.d) * uy; }
    else { px = -c.d * uy; py = c.d * ux; }
    return { magnets: [{ x: 0, y: 0, ang: c.ang, s: c.s, h: h }], P: { x: px, y: py }, earth: !!c.earth };
  }
  function truth(c) { var w = setup(c); return field(w.magnets, w.P.x, w.P.y, { earth: w.earth }); }
  function closed(c) {
    var h = H, k = c.s * B0 * R0 * R0, m, ang;
    if (c.kind === 'axis') { m = k * (1 / (c.d * c.d) - 1 / Math.pow(c.d + 2 * h, 2)); ang = c.ang; }
    else { m = 2 * k * h / Math.pow(h * h + c.d * c.d, 1.5); ang = c.ang + 180; }
    var x = m * Math.cos(ang * RAD), y = m * Math.sin(ang * RAD);
    if (c.earth) { var e = earthVec(); x += e.x; y += e.y; }
    return pack(x, y);
  }
  function mistakes(c) {
    var w = setup(c), f = function (o) { return field(w.magnets, w.P.x, w.P.y, o); }, t = truth(c);
    var flip = f({ earth: w.earth, flip: true });
    return {
      reversed: { ang: norm360(t.ang + 180), mag: t.mag },
      noEarth: f({ earth: false }),
      onePole: f({ earth: w.earth, only: 'nearest' }),
      swapped: flip,
      noSquare: f({ earth: w.earth, pow: 1 })
    };
  }
  // student = { ang (°), mag (mT) }.
  function diagnose(c, student, tolAng, tolMag) {
    tolAng = tolAng || 3; tolMag = tolMag || 0.03;
    if (!student || !isFinite(student.ang) || !isFinite(student.mag)) return 'bad';
    var t = truth(c), m = mistakes(c);
    var angOk = function (w) { return angDiff(student.ang, w.ang) <= tolAng; };
    var magOk = function (w) { return Math.abs(student.mag - w.mag) <= tolMag * w.mag; };
    var both = function (w) { return angOk(w) && magOk(w); };
    if (both(t)) return 'ok';
    var keys = ['noEarth', 'onePole', 'reversed', 'swapped', 'noSquare'];
    for (var i = 0; i < keys.length; i++) {
      var w = m[keys[i]];
      // El error solo cuenta si de verdad se distingue del resultado correcto.
      if (both(w) && (angDiff(w.ang, t.ang) > tolAng || Math.abs(w.mag - t.mag) > tolMag * t.mag)) return keys[i];
    }
    if (angOk(t)) {
      if (Math.abs(student.mag - t.mag * 1000) <= tolMag * t.mag * 1000 || Math.abs(student.mag - t.mag / 1000) <= tolMag * t.mag / 1000) return 'units';
      if (Math.abs(student.mag - t.mag * 10) <= tolMag * t.mag * 10) return 'gauss';
      return 'dirOk';
    }
    if (magOk(t)) return 'magOk';
    return 'bad';
  }

  window.LabMath.magnet = {
    B0: B0, R0: R0, H: H, EARTH: EARTH, UNIT: UNIT,
    poleField: poleField, poles: poles, field: field, bearing: bearing, convert: convert, ratio: ratio, combine: combine, angDiff: angDiff,
    trace: trace, lines: lines, setup: setup, truth: truth, closed: closed, mistakes: mistakes, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var VW = 640, VH = 400, PXCM = 24, OX = 320, OY = 200;          // 24 px por cm, origen al centro
  var BOX = [-12.5, -7.5, 12.5, 7.5];
  function X(x) { return OX + PXCM * x; }
  function Y(y) { return OY - PXCM * y; }
  function fnum(v) { return String(v).replace('-', '−'); }
  var PRESETS = [
    { name: 'Un imán', m: [{ x: 0, y: 0, ang: 0, s: 2 }], P: [5, 3], earth: false },
    { name: 'Dos imanes: N frente a S (se atraen)', m: [{ x: -4.5, y: 0, ang: 0, s: 2 }, { x: 4.5, y: 0, ang: 0, s: 2 }], P: [0, 3], earth: false },
    { name: 'Dos imanes: N frente a N (se repelen)', m: [{ x: -4.5, y: 0, ang: 0, s: 2 }, { x: 4.5, y: 0, ang: 180, s: 2 }], P: [0, 3], earth: false },
    { name: 'Un imán chico y la Tierra', m: [{ x: 0, y: 0, ang: 0, s: 1 }], P: [7, 4], earth: true }
  ];
  var MSG = {
    ok: ['Tu predicción coincide', 'Ángulo y magnitud correctos.'],
    reversed: ['La aguja apunta al revés', 'El extremo N de la brújula se alinea con B: señala hacia donde apunta B, o sea hacia el polo S del imán. Cambia tu ángulo en 180°.'],
    noEarth: ['Olvidaste el campo de la Tierra', 'La brújula siente la suma vectorial: imán + Tierra (50 µT = 0.05 mT hacia el norte). Cerca del imán casi no se nota; lejos, manda.'],
    onePole: ['Solo contaste el polo más cercano', 'Un imán tiene dos polos y los dos actúan: el N empuja y el S jala. Suma los dos vectores.'],
    swapped: ['Confundiste N con S del imán', 'Las líneas SALEN del polo N y ENTRAN al polo S. Revisa cuál es cuál.'],
    noSquare: ['Te faltó elevar r al cuadrado', 'El campo de cada polo baja con 1/r², no con 1/r: al doble de distancia, la cuarta parte.'],
    units: ['Revisa las unidades', 'Responde en mT: 1 mT = 1000 µT.'],
    gauss: ['Revisa las unidades', 'Responde en mT: 1 mT = 10 G.'],
    dirOk: ['El ángulo está bien; la magnitud no', 'Revisa distancias (en cm) y el factor 1/r² de cada polo.'],
    magOk: ['La magnitud está bien; el ángulo no', 'Suma componentes: el ángulo se mide desde el eje x (0° a la derecha, antihorario).'],
    bad: ['Tu predicción no coincide', 'Para cada polo: distancia r a la brújula, |B| = s·B₀·(R₀/r)² y dirección (saliendo de N, entrando a S). Suma los vectores.']
  };
  var KIND = { ok: 'ok', reversed: 'warn', noEarth: 'warn', onePole: 'warn', swapped: 'warn', noSquare: 'warn', units: 'warn', gauss: 'warn', dirOk: 'warn', magOk: 'warn' };
  var TIPS = {
    axis: 'P está sobre el eje del imán, del lado del polo N. Los dos polos empujan o jalan en la misma línea: resta sus campos.',
    bisector: 'P está en la mediatriz del imán, a la misma distancia de los dos polos. Las componentes paralelas al eje se suman y las perpendiculares se cancelan.'
  };

  window.Labs['magnetic-field-map'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var start = cfg.start || {};
    var magnets = [], P = { x: 5, y: 3 }, earth = false, sel = 0, kSel = 'P', raf = 0, drag = null, chal = null, student = null;

    var preset = UI.select({ label: 'Configuración', options: PRESETS.map(function (p) { return p.name; }) });
    var sS = UI.slider({ label: 'Intensidad del imán elegido', min: 1, max: 4, step: 1, value: 2, unit: '' }, function (v) { if (magnets[sel]) { magnets[sel].s = v; refresh(); } });
    var aS = UI.slider({ label: 'Giro del imán elegido', min: 0, max: 345, step: 15, value: 0, unit: '°' }, function (v) { if (magnets[sel]) { magnets[sel].ang = v; refresh(); } });
    var bEarth = UI.button('Poner el campo de la Tierra', 'ghost', function () { earth = !earth; refresh(); });
    var bFlip = UI.button('Invertir el imán elegido', 'ghost', function () { if (magnets[sel]) { magnets[sel].ang = (magnets[sel].ang + 180) % 360; syncSel(); refresh(); } });
    var note = h('p', { class: 'lab-note', role: 'status' });

    var chalText = h('p', { class: 'lab-note' });
    var angIn = UI.input({ label: 'Tu ángulo de B en la brújula (°, 0° = derecha, antihorario)', type: 'text', inputmode: 'decimal', mono: false });
    var magIn = UI.input({ label: 'Tu |B| en la brújula (mT)', type: 'text', inputmode: 'decimal', mono: false, hint: 'Notación científica: <code>2.5e-2</code> o <code>2.5×10^-2</code>.' });
    var bCheck = UI.button('Comprobar', 'primary', check);
    var bNew = UI.button('Otro reto', 'ghost', function () { newChallenge(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var svg = UI.svg(VW, VH, 'Imanes de barra con sus líneas de campo y una brújula que apunta en la dirección del campo total.');
    svg.classList.add('lab-stage--drag');
    svg.setAttribute('tabindex', '0');
    var hint = h('p', { class: 'lab-note' }, ['Arrastra los imanes y la brújula (o usa las flechas del teclado; espacio cambia de objeto). Medidas en cm.']);
    var legend = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--ref' }), 'línea de campo']),
      h('li', {}, [h('i', { class: 'sw sw--error' }), 'polo N · B total']),
      h('li', {}, [h('i', { class: 'sw sw--aux' }), 'polo S · componentes'])
    ]);
    var facts = h('dl', { class: 'lab-facts' });

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        preset.node, sS.node, aS.node,
        h('div', { class: 'lab-buttons' }, [bEarth, bFlip]), note,
        h('p', { class: 'lab-field__label' }, ['Reto: predice B en la brújula']), chalText,
        h('div', { class: 'lab-row' }, [angIn.node, magIn.node]),
        h('div', { class: 'lab-buttons' }, [bCheck, bNew]), verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['El campo de los imanes']),
        svg, hint, legend, facts
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    [angIn.input, magIn.input].forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } }); });

    function parse(s) {
      if (window.CBExercises) return window.CBExercises.parseNumber(s);
      return parseFloat(String(s).replace(/−/g, '-'));
    }
    function syncSel() {
      var m = magnets[sel];
      if (m) { sS.set(m.s); aS.set(Math.round(m.ang / 15) * 15 % 360); }
    }
    function loadPreset(i) {
      var p = PRESETS[i] || PRESETS[0];
      magnets = p.m.map(function (m) { return { x: m.x, y: m.y, ang: m.ang, s: m.s }; });
      P = { x: p.P[0], y: p.P[1] }; earth = p.earth; sel = 0; kSel = 'P'; chal = null; student = null;
      verdict.hidden = true; chalText.textContent = ''; syncSel(); refresh();
    }
    preset.input.addEventListener('change', function () { loadPreset(+preset.input.value); });

    /* ---------- Arrastre y teclado ---------- */
    function toWorld(ev) {
      var m = svg.getScreenCTM();
      if (!m) return null;
      var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      var q = pt.matrixTransform(m.inverse());
      return { x: (q.x - OX) / PXCM, y: (OY - q.y) / PXCM };
    }
    function pick(w) {
      var best = null, bd = 2.2;
      magnets.forEach(function (m, i) { var d = Math.hypot(m.x - w.x, m.y - w.y); if (d < bd) { bd = d; best = i; } });
      if (Math.hypot(P.x - w.x, P.y - w.y) < Math.min(bd, 1.2)) best = 'P';
      return best;
    }
    function clampTo(v, lo, hi) { return Math.max(lo + 0.5, Math.min(hi - 0.5, Math.round(v * 2) / 2)); }
    function moveTo(it, x, y) {
      x = clampTo(x, BOX[0], BOX[2]); y = clampTo(y, BOX[1], BOX[3]);
      var o = it === 'P' ? P : magnets[it];
      if (!o) return;
      o.x = x; o.y = y;
    }
    svg.addEventListener('pointerdown', function (ev) {
      var w = toWorld(ev); if (!w) return;
      var it = pick(w); if (it === null) return;
      drag = it; kSel = it;
      if (it !== 'P') { sel = it; syncSel(); }
      try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* sin captura */ }
      ev.preventDefault(); schedule();
    });
    svg.addEventListener('pointermove', function (ev) {
      if (drag === null) return;
      var w = toWorld(ev); if (!w) return;
      moveTo(drag, w.x, w.y); schedule();
    });
    function endDrag() { if (drag === null) return; drag = null; refresh(); }
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
    svg.addEventListener('keydown', function (ev) {
      var d = { ArrowLeft: [-0.5, 0], ArrowRight: [0.5, 0], ArrowUp: [0, 0.5], ArrowDown: [0, -0.5] }[ev.key];
      if (ev.key === 'Tab' || (!d && ev.key !== ' ')) return;
      ev.preventDefault();
      if (ev.key === ' ') {
        kSel = kSel === 'P' ? 0 : (kSel + 1 < magnets.length ? kSel + 1 : 'P');
        if (kSel !== 'P') { sel = kSel; syncSel(); }
        draw(); return;
      }
      var it = kSel === 'P' ? P : magnets[kSel];
      if (!it) { kSel = 'P'; it = P; }
      moveTo(kSel, it.x + d[0], it.y + d[1]); refresh();
    });
    function schedule() {
      if (raf) return;
      raf = (window.requestAnimationFrame || function (f) { return setTimeout(f, 16); })(function () { raf = 0; draw(); });
    }
    function refresh() { draw(); }

    /* ---------- Dibujo ---------- */
    function el(tag, attrs, parent, text) {
      if (!UI.svgOk(attrs)) return null;
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (text != null) n.textContent = text;
      (parent || svg.querySelector('g.sketch')).appendChild(n);
      return n;
    }
    function arrowPx(cls, x, y, dx, dy, w, dash) {
      var L = Math.hypot(dx, dy);
      if (!(L > 3)) return;
      var ux = dx / L, uy = dy / L, hh = Math.min(11, L * 0.45), ex = x + dx, ey = y + dy;
      el('path', { 'class': cls, fill: 'none', 'stroke-width': w || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': dash || null,
        d: 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
          'M' + (ex - ux * hh - uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh + ux * hh * 0.6).toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
          'L' + (ex - ux * hh + uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh - ux * hh * 0.6).toFixed(1) });
    }
    function fmtB(mT) {
      if (!isFinite(mT)) return '—';
      if (mT >= 0.1) return Number(mT.toPrecision(3)) + ' mT';
      return Number((mT * 1000).toPrecision(3)) + ' µT';
    }
    function sciS(v) {
      if (!isFinite(v) || v === 0) return String(v);
      var ex = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, ex);
      return fnum(m.toFixed(2)) + ' × 10' + String(ex).split('').map(function (c) { return c === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]; }).join('');
    }
    function draw() {
      svg.innerHTML = '';
      el('g', { 'class': 'sketch' }, svg);
      // Cuadro de referencia
      el('rect', { x: X(BOX[0]), y: Y(BOX[3]), width: PXCM * (BOX[2] - BOX[0]), height: PXCM * (BOX[3] - BOX[1]), fill: 'none', 'class': 'axis', 'stroke-width': 1.2 });
      var lns = lines(magnets, 10, { earth: earth, box: BOX });
      lns.forEach(function (ln) {
        var d = ln.pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join('');
        el('path', { 'class': 'ref', fill: 'none', 'stroke-width': 1.8, opacity: 0.75, d: d });
        // Una punta de flecha hacia la mitad del camino.
        var k = Math.floor(ln.pts.length * 0.5);
        if (k > 2 && k < ln.pts.length - 1) {
          var a = ln.pts[k - 1], b = ln.pts[k + 1], dx = X(b[0]) - X(a[0]), dy = Y(b[1]) - Y(a[1]), L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, mx = X(ln.pts[k][0]), my = Y(ln.pts[k][1]);
          el('path', { 'class': 'ref', fill: 'none', 'stroke-width': 1.8, d: 'M' + (mx - ux * 7 - uy * 4.5).toFixed(1) + ' ' + (my - uy * 7 + ux * 4.5).toFixed(1) + 'L' + mx.toFixed(1) + ' ' + my.toFixed(1) + 'L' + (mx - ux * 7 + uy * 4.5).toFixed(1) + ' ' + (my - uy * 7 - ux * 4.5).toFixed(1) });
        }
      });
      // Imanes
      magnets.forEach(function (m, i) {
        var p = poles(m), a = m.ang;
        var g = el('g', { transform: 'translate(' + X(m.x).toFixed(1) + ' ' + Y(m.y).toFixed(1) + ') rotate(' + (-a) + ')' });
        var hh = H * PXCM, w = 15;
        el('rect', { x: 0, y: -w, width: hh, height: 2 * w, 'class': 'box-err' }, g);
        el('rect', { x: -hh, y: -w, width: hh, height: 2 * w, 'class': 'box-aux' }, g);
        var sel1 = (kSel === i);
        if (sel1) el('rect', { x: -hh - 4, y: -w - 4, width: 2 * hh + 8, height: 2 * w + 8, fill: 'none', 'class': 'trace', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
        // Letras sin girar para que se lean siempre derechas.
        var lx = (p.N.x - p.S.x) / 4, ly = (p.N.y - p.S.y) / 4;
        el('text', { x: X(m.x + lx).toFixed(1), y: (Y(m.y + ly) + 7).toFixed(1), 'class': 'ann', 'text-anchor': 'middle', 'font-size': 20 }, null, 'N');
        el('text', { x: X(m.x - lx).toFixed(1), y: (Y(m.y - ly) + 7).toFixed(1), 'class': 'ann', 'text-anchor': 'middle', 'font-size': 20 }, null, 'S');
      });
      // Brújula y vectores
      var px = X(P.x), py = Y(P.y), F = field(magnets, P.x, P.y, { earth: earth });
      var parts = field(magnets, P.x, P.y, { earth: false });
      var ang = F.ang * RAD;
      if (F.mag > 0 && isFinite(F.mag)) {
        var vL = function (m) { return Math.max(26, Math.min(110, 26 + 40 * Math.log10(1 + m / 0.02))); };
        // Componentes (imán y Tierra) y total
        if (earth) {
          var ev = earthVec();
          arrowPx('aux', px, py, 0.0 + vL(EARTH.mag) * 0.55 * ev.x / EARTH.mag, -vL(EARTH.mag) * 0.55 * ev.y / EARTH.mag, 2, '5 4');
        }
        if (parts.mag > 0) arrowPx('aux', px, py, vL(parts.mag) * 0.55 * parts.x / parts.mag, -vL(parts.mag) * 0.55 * parts.y / parts.mag, 2, '5 4');
        arrowPx('error', px, py, vL(F.mag) * Math.cos(ang), -vL(F.mag) * Math.sin(ang), 3.2);
        // Aguja: N (rojo) hacia B, S (azul) atrás
        var ux = Math.cos(ang), uy = -Math.sin(ang), nx = -uy, ny = ux, L = 14, W = 4.5;
        el('circle', { cx: px.toFixed(1), cy: py.toFixed(1), r: 17, fill: 'none', 'class': 'axis', 'stroke-width': 1.6 });
        el('path', { 'class': 'box-err', d: 'M' + (px + ux * L).toFixed(1) + ' ' + (py + uy * L).toFixed(1) + 'L' + (px + nx * W).toFixed(1) + ' ' + (py + ny * W).toFixed(1) + 'L' + (px - nx * W).toFixed(1) + ' ' + (py - ny * W).toFixed(1) + 'Z' });
        el('path', { 'class': 'box-aux', d: 'M' + (px - ux * L).toFixed(1) + ' ' + (py - uy * L).toFixed(1) + 'L' + (px + nx * W).toFixed(1) + ' ' + (py + ny * W).toFixed(1) + 'L' + (px - nx * W).toFixed(1) + ' ' + (py - ny * W).toFixed(1) + 'Z' });
      }
      if (kSel === 'P') el('circle', { cx: px.toFixed(1), cy: py.toFixed(1), r: 22, fill: 'none', 'class': 'trace', 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      // Respuesta del alumno
      if (student && isFinite(student.ang) && student.mag > 0) {
        var sa = student.ang * RAD, sl = 60;
        arrowPx('student', px, py, sl * Math.cos(sa), -sl * Math.sin(sa), 2.6);
      }
      // Lecturas
      facts.innerHTML = '';
      [['B total en la brújula', fmtB(F.mag)],
       ['dirección de B', isFinite(F.ang) ? fnum(Number(F.ang.toFixed(1))) + '° (rumbo ' + Math.round(bearing(F.x, F.y)) + '° desde el norte)' : '—'],
       ['campo de la Tierra', earth ? '0.05 mT (50 µT) al norte' : 'apagado'],
       ['B total en gauss', isFinite(F.mag) ? Number(convert(F.mag, 'mT', 'G').toPrecision(3)) + ' G' : '—']]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
      bEarth.textContent = earth ? 'Quitar el campo de la Tierra' : 'Poner el campo de la Tierra';
      svg.setAttribute('aria-label', 'Imanes de barra con sus líneas de campo y una brújula; en la brújula el campo total mide ' + fmtB(F.mag) + ' y apunta a ' + Math.round(F.ang) + ' grados.');
    }

    /* ---------- Reto ---------- */
    var KINDS = [
      { kind: 'axis', d: [3, 4, 5, 6], ang: [0, 90, 180, 270], s: [1, 2, 3], earth: [false] },
      { kind: 'bisector', d: [3, 4, 5], ang: [0, 90, 180, 270], s: [1, 2, 3], earth: [false] },
      { kind: 'bisector', d: [4, 5, 6], ang: [0, 90, 180, 270], s: [2, 3, 4], earth: [true] }
    ];
    function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
    function newChallenge(fixed) {
      var k = rnd(KINDS);
      var c = fixed || { kind: k.kind, d: rnd(k.d), ang: rnd(k.ang), s: rnd(k.s), earth: rnd(k.earth) };
      chal = c; student = null; verdict.hidden = true;
      var w = setup(c);
      magnets = w.magnets; P = { x: w.P.x, y: w.P.y }; earth = w.earth; sel = 0; kSel = 'P'; syncSel();
      chalText.textContent = 'Un imán (intensidad s = ' + c.s + ', polos a ±3 cm del centro) apunta de S a N a ' + c.ang + '°. La brújula está ' +
        (c.kind === 'axis' ? 'sobre el eje, a ' + c.d + ' cm del polo N' : 'en la mediatriz, a ' + c.d + ' cm del centro') + (c.earth ? ', con el campo de la Tierra encendido (0.05 mT al norte)' : '') + '. Datos: un polo s = 1 da 1 mT a 2 cm. ' + TIPS[c.kind];
      angIn.input.value = ''; magIn.input.value = '';
      draw();
    }
    function check() {
      if (!chal) return;
      var a = parse(angIn.input.value), m = parse(magIn.input.value);
      if (!isFinite(a) || !isFinite(m)) { UI.verdict(verdict, 'bad', MSG.bad[0], 'Escribe el ángulo (°) y la magnitud (mT).'); return; }
      student = { ang: a, mag: m };
      var key = diagnose(chal, student), t = truth(chal), msg = MSG[key] || MSG.bad;
      draw();
      UI.verdict(verdict, KIND[key] || 'bad', msg[0], msg[1] + ' B real: ' + sciS(t.mag) + ' mT a ' + Number(t.ang.toFixed(1)) + '°.');
    }

    // Ejemplo cargado: la respuesta de un compañero con la aguja al revés.
    loadPreset(start.preset || 0);
    newChallenge({ kind: 'bisector', d: 4, ang: 0, s: 2, earth: false });
    var t0 = truth(chal);
    angIn.input.value = String(Number(norm360(t0.ang + 180).toFixed(1)));
    magIn.input.value = String(Number(t0.mag.toPrecision(3)));
    note.textContent = 'Ejemplo cargado: así respondió un compañero el reto. ¿Ves su error? Presiona Comprobar, o mueve la brújula y los imanes tú mismo.';
    check();
    return Promise.resolve();
  };
})();
