/* =====================================================================
   Lab parallel-wires (Física 3 · S07): alambres largos perpendiculares a la
   página, superposición de sus campos y fuerza entre ellos.
   Cada alambre lleva I con signo: I > 0 sale de la página (⊙), I < 0 entra (⊗).
   Su campo a distancia r es B = μ₀|I|/2πr, tangente a la circunferencia, con la
   regla de la mano derecha: B = (μ₀I/2πr)·ẑ × r̂. En unidades del lab (cm, A, µT):
   B = 20·I/r. La fuerza por unidad de largo sobre el alambre i es
   F/L = Iᵢ ẑ × B (B de los demás), o sea μ₀I₁I₂/2πd entre dos: se atraen si las
   corrientes van igual y se repelen si van opuestas. En µN/m: F/L = Iᵢ·(−B_y, B_x).
   Reto de campo: |B| (µT) y su ángulo (°) en P. Errores que detecta:
     reversed   sentido al revés (180°)        radial   B hacia el alambre, no tangente
     sumMag     sumó magnitudes                oneWire  solo contó el alambre más cercano
     cm         usó cm como metros (÷100)
   Reto de fuerza: F/L con signo (+ a la derecha) sobre un alambre de una fila:
     sign       sentido al revés               oneWire  solo el vecino más cercano
     cm         cm como metros
   ===================================================================== */
(function () {
  var MU0 = 4 * Math.PI * 1e-7, K = 20;            // µT·cm/A: μ₀/2π = 2×10⁻⁷ T·m/A
  var RAD = Math.PI / 180, DEG = 180 / Math.PI;

  /* ------------------------- Matemática pura ------------------------- */
  function norm360(a) { a = a % 360; return a < 0 ? a + 360 : a; }
  function angDiff(a, b) { var d = Math.abs(norm360(a) - norm360(b)); return d > 180 ? 360 - d : d; }
  function pack(x, y) { return { x: x, y: y, mag: Math.hypot(x, y), ang: norm360(Math.atan2(y, x) * DEG) }; }
  // Campo de un alambre largo, SI (A, m → T).
  function single(I, r) { return MU0 * Math.abs(I) / (2 * Math.PI * r); }
  // Fuerza por unidad de largo entre dos alambres paralelos (SI). Positiva = se atraen.
  function forcePerLength(I1, I2, d) { return MU0 * I1 * I2 / (2 * Math.PI * d); }
  // Campo de un alambre en (x, y), en µT, con posiciones en cm. opts.radial: el error de apuntar a/desde el alambre.
  function wireField(w, x, y, opts) {
    var dx = x - w.x, dy = y - w.y, r2 = dx * dx + dy * dy;
    if (r2 < 1e-12) return { x: NaN, y: NaN };
    var k = K * w.I / r2 * (opts && opts.cm ? 0.01 : 1);
    return opts && opts.radial ? { x: k * dx, y: k * dy } : { x: -k * dy, y: k * dx };
  }
  // Campo total en (x, y); skip = índice de un alambre que no cuenta (el que siente la fuerza).
  function field(wires, x, y, opts) {
    var bx = 0, by = 0;
    wires.forEach(function (w, i) {
      if (opts && opts.skip === i) return;
      var b = wireField(w, x, y, opts); bx += b.x; by += b.y;
    });
    return pack(bx, by);
  }
  // Fuerza por unidad de largo sobre el alambre i, en µN/m.
  function force(wires, i, opts) {
    var w = wires[i], b = field(wires, w.x, w.y, Object.assign({}, opts, { skip: i }));
    return pack(-w.I * b.y, w.I * b.x);
  }
  // Suma de vectores dados por magnitud y ángulo (°, desde +x, antihorario).
  function combine(list) {
    var x = 0, y = 0;
    list.forEach(function (v) { x += v.mag * Math.cos(v.ang * RAD); y += v.mag * Math.sin(v.ang * RAD); });
    return pack(x, y);
  }

  /* ---------- Reto ----------
     Campo: c = { kind: 'field', wires: [{ x, y, I }], P: { x, y } }
     Fuerza: c = { kind: 'force', wires: [{ x, y: 0, I }], k } (todos en el eje x; fuerza sobre el k-ésimo) */
  function truth(c) {
    if (c.kind === 'force') { var f = force(c.wires, c.k); return { F: f.x }; }
    return field(c.wires, c.P.x, c.P.y);
  }
  function nearest(c) {
    var best = 0, bd = Infinity;
    c.wires.forEach(function (w, i) { var d = Math.hypot(w.x - c.P.x, w.y - c.P.y); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  function mistakes(c) {
    if (c.kind === 'force') {
      var t = truth(c), me = c.wires[c.k], nb = -1, bd = Infinity;
      c.wires.forEach(function (w, i) { if (i !== c.k && Math.abs(w.x - me.x) < bd) { bd = Math.abs(w.x - me.x); nb = i; } });
      return {
        sign: { F: -t.F },
        oneWire: { F: force([me, c.wires[nb]], 0).x },
        cm: { F: force(c.wires, c.k, { cm: true }).x }
      };
    }
    var tr = truth(c), sumM = 0;
    c.wires.forEach(function (w) { sumM += field([w], c.P.x, c.P.y).mag; });
    return {
      reversed: pack(-tr.x, -tr.y),
      radial: field(c.wires, c.P.x, c.P.y, { radial: true }),
      sumMag: { mag: sumM, ang: tr.ang },
      oneWire: field([c.wires[nearest(c)]], c.P.x, c.P.y),
      cm: field(c.wires, c.P.x, c.P.y, { cm: true })
    };
  }
  // Campo: student = { mag (µT), ang (°) }. Fuerza: student = { F (µN/m, con signo) }.
  function diagnose(c, s, tolAng, tol) {
    tolAng = tolAng || 3; tol = tol || 0.03;
    var t = truth(c), m = mistakes(c);
    if (c.kind === 'force') {
      if (!s || !isFinite(s.F)) return 'bad';
      var okF = function (w) { return Math.abs(s.F - w.F) <= tol * Math.abs(w.F); };
      if (okF(t)) return 'ok';
      var fk = ['sign', 'oneWire', 'cm'];
      for (var j = 0; j < fk.length; j++) if (Math.abs(m[fk[j]].F - t.F) > tol * Math.abs(t.F) && okF(m[fk[j]])) return fk[j];
      return 'bad';
    }
    if (!s || !isFinite(s.mag) || !isFinite(s.ang)) return 'bad';
    var angOk = function (w) { return angDiff(s.ang, w.ang) <= tolAng; };
    var magOk = function (w) { return Math.abs(s.mag - w.mag) <= tol * w.mag; };
    var both = function (w) { return angOk(w) && magOk(w); };
    if (both(t)) return 'ok';
    var keys = ['oneWire', 'reversed', 'radial', 'cm'];
    for (var i = 0; i < keys.length; i++) {
      var w = m[keys[i]];
      if (both(w) && (angDiff(w.ang, t.ang) > tolAng || Math.abs(w.mag - t.mag) > tol * t.mag)) return keys[i];
    }
    if (magOk(m.sumMag) && Math.abs(m.sumMag.mag - t.mag) > tol * t.mag) return 'sumMag';
    if (angOk(t)) return 'dirOk';
    if (magOk(t)) return 'magOk';
    return 'bad';
  }

  // Punto del eje x entre x0 y x1 (cm) donde se anula la componente y del campo de alambres sobre ese eje (bisección).
  function zero(wires, x0, x1) {
    var f = function (x) { return field(wires, x, 0).y; }, a = x0, b = x1, fa = f(a);
    for (var i = 0; i < 200; i++) { var m = (a + b) / 2, fm = f(m); if (fa * fm <= 0) b = m; else { a = m; fa = fm; } }
    return (a + b) / 2;
  }

  window.LabMath.parwires = {
    zero: zero,
    MU0: MU0, K: K, single: single, forcePerLength: forcePerLength, wireField: wireField, field: field, force: force,
    combine: combine, angDiff: angDiff, truth: truth, mistakes: mistakes, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var VW = 640, VH = 400, PXCM = 24, OX = 320, OY = 200;
  var BOX = [-12.5, -7.5, 12.5, 7.5];
  function X(x) { return OX + PXCM * x; }
  function Y(y) { return OY - PXCM * y; }
  function fnum(v) { return String(v).replace('-', '−'); }
  var PRESETS = [
    { name: 'Un alambre', w: [{ x: 0, y: 0, I: 5 }], P: [4, 2] },
    { name: 'Dos alambres, corrientes iguales (se atraen)', w: [{ x: -4, y: 0, I: 5 }, { x: 4, y: 0, I: 5 }], P: [0, 3] },
    { name: 'Dos alambres, corrientes opuestas (se repelen)', w: [{ x: -4, y: 0, I: 5 }, { x: 4, y: 0, I: -5 }], P: [0, 3] },
    { name: 'Tres alambres', w: [{ x: -5, y: -2, I: 6 }, { x: 5, y: -2, I: -4 }, { x: 0, y: 4, I: 3 }], P: [0, 0] }
  ];
  var MSG = {
    ok: ['Tu predicción coincide', 'Magnitud y dirección correctas.'],
    reversed: ['La magnitud está bien; el sentido está al revés', 'Pulgar con la corriente (⊙ hacia ti): los dedos giran antihorario alrededor de un alambre que sale de la página.'],
    radial: ['Pusiste B apuntando hacia el alambre', 'El campo de un alambre no es radial: rodea al alambre, tangente a la circunferencia (perpendicular a r).'],
    sumMag: ['Sumaste las magnitudes', 'Los campos de cada alambre apuntan a lados distintos: súmalos como vectores, por componentes.'],
    oneWire: ['Solo contaste el alambre más cercano', 'En P actúan todos los alambres: suma el campo de cada uno.'],
    cm: ['Revisa las unidades', 'En μ₀I/2πr la distancia va en metros: 4 cm = 0.04 m.'],
    sign: ['La magnitud está bien; el sentido no', 'Corrientes en el mismo sentido se atraen; en sentidos opuestos se repelen.'],
    dirOk: ['La dirección está bien; la magnitud no', 'Revisa distancias (en m) y B = μ₀I/2πr de cada alambre.'],
    magOk: ['La magnitud está bien; la dirección no', 'El ángulo se mide desde +x, antihorario. Revisa el sentido de giro de cada campo.'],
    bad: ['Tu predicción no coincide', 'Para cada alambre: distancia r, B = μ₀I/2πr, dirección tangente con la mano derecha. Luego suma por componentes.']
  };
  var KIND = { ok: 'ok', reversed: 'warn', radial: 'warn', sumMag: 'warn', oneWire: 'warn', cm: 'warn', sign: 'warn', dirOk: 'warn', magOk: 'warn' };

  window.Labs['parallel-wires'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var wires = [], P = { x: 0, y: 3 }, sel = 0, kSel = 'P', raf = 0, drag = null, chal = null, student = null, showF = true;

    var preset = UI.select({ label: 'Configuración', options: PRESETS.map(function (p) { return p.name; }) });
    var sI = UI.slider({ label: 'Corriente del alambre elegido', min: 1, max: 10, step: 1, value: 5, unit: 'A' }, function (v) { if (wires[sel]) { wires[sel].I = (wires[sel].I < 0 ? -1 : 1) * v; draw(); } });
    var bFlip = UI.button('Invertir su corriente', 'ghost', function () { if (wires[sel]) { wires[sel].I = -wires[sel].I; draw(); } });
    var bF = UI.button('Ocultar fuerzas', 'ghost', function () { showF = !showF; draw(); });
    var note = h('p', { class: 'lab-note', role: 'status' });

    var chalText = h('p', { class: 'lab-note' });
    var in1 = UI.input({ label: 'Tu |B| en P (µT)', type: 'text', inputmode: 'decimal', mono: false });
    var in2 = UI.input({ label: 'Tu ángulo de B (°, 0° = derecha, antihorario)', type: 'text', inputmode: 'decimal', mono: false });
    var bCheck = UI.button('Comprobar', 'primary', check);
    var bNew = UI.button('Otro reto', 'ghost', function () { newChallenge(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var svg = UI.svg(VW, VH, 'Alambres perpendiculares a la página con su campo magnético y una sonda P.');
    svg.classList.add('lab-stage--drag');
    svg.setAttribute('tabindex', '0');
    var hint = h('p', { class: 'lab-note' }, ['Arrastra los alambres y la sonda P (o usa las flechas; espacio cambia de objeto). ⊙ sale de la página, ⊗ entra. Medidas en cm.']);
    var legend = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--ref' }), 'dirección de B']),
      h('li', {}, [h('i', { class: 'sw sw--aux' }), 'B de cada alambre']),
      h('li', {}, [h('i', { class: 'sw sw--error' }), 'B total en P']),
      h('li', {}, [h('i', { class: 'sw sw--trace' }), 'fuerza por metro'])
    ]);
    var facts = h('dl', { class: 'lab-facts' });

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        preset.node, sI.node, h('div', { class: 'lab-buttons' }, [bFlip, bF]), note,
        h('p', { class: 'lab-field__label' }, ['Reto']), chalText,
        h('div', { class: 'lab-row' }, [in1.node, in2.node]),
        h('div', { class: 'lab-buttons' }, [bCheck, bNew]), verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Alambres paralelos']),
        svg, hint, legend, facts
      ])
    ]));
    // Sin mayúsculas en las etiquetas de los campos: µ se volvía Μ (y mT, MT); θ y φ, Θ y Φ.
    mount.querySelectorAll('label.lab-field__label').forEach(function (l) { l.style.textTransform = 'none'; l.style.letterSpacing = '0'; });
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    [in1.input, in2.input].forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } }); });

    function parse(s) { return window.CBExercises ? window.CBExercises.parseNumber(s) : parseFloat(String(s).replace(/−/g, '-')); }
    function syncSel() { if (wires[sel]) sI.set(Math.abs(wires[sel].I)); }
    function loadPreset(i) {
      var p = PRESETS[i] || PRESETS[0];
      wires = p.w.map(function (w) { return { x: w.x, y: w.y, I: w.I }; });
      P = { x: p.P[0], y: p.P[1] }; sel = 0; kSel = 'P'; chal = null; student = null;
      verdict.hidden = true; chalText.textContent = ''; setInputs('field'); syncSel(); draw();
    }
    preset.input.addEventListener('change', function () { loadPreset(+preset.input.value); });
    function setInputs(kind) {
      in1.node.querySelector('label').textContent = kind === 'force' ? 'Tu F/L con signo (µN/m, + a la derecha)' : 'Tu |B| en P (µT)';
      in2.node.hidden = kind === 'force'; in2.node.style.display = kind === 'force' ? 'none' : '';
    }

    /* ---------- Arrastre y teclado ---------- */
    function toWorld(ev) {
      var m = svg.getScreenCTM();
      if (!m) return null;
      var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      var q = pt.matrixTransform(m.inverse());
      return { x: (q.x - OX) / PXCM, y: (OY - q.y) / PXCM };
    }
    function pick(w) {
      var best = null, bd = 1.2;
      wires.forEach(function (o, i) { var d = Math.hypot(o.x - w.x, o.y - w.y); if (d < bd) { bd = d; best = i; } });
      if (Math.hypot(P.x - w.x, P.y - w.y) < Math.min(bd, 1)) best = 'P';
      return best;
    }
    function clampTo(v, lo, hi) { return Math.max(lo + 0.5, Math.min(hi - 0.5, Math.round(v * 2) / 2)); }
    function moveTo(it, x, y) {
      var o = it === 'P' ? P : wires[it];
      if (!o) return;
      o.x = clampTo(x, BOX[0], BOX[2]); o.y = clampTo(y, BOX[1], BOX[3]);
    }
    svg.addEventListener('pointerdown', function (ev) {
      var w = toWorld(ev); if (!w) return;
      var it = pick(w); if (it === null) return;
      if (chal) { chal = null; chalText.textContent = 'Moviste el reto: pide otro para que el lab lo califique.'; }
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
    function endDrag() { if (drag === null) return; drag = null; draw(); }
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
    svg.addEventListener('keydown', function (ev) {
      var d = { ArrowLeft: [-0.5, 0], ArrowRight: [0.5, 0], ArrowUp: [0, 0.5], ArrowDown: [0, -0.5] }[ev.key];
      if (ev.key === 'Tab' || (!d && ev.key !== ' ')) return;
      ev.preventDefault();
      if (ev.key === ' ') {
        kSel = kSel === 'P' ? 0 : (kSel + 1 < wires.length ? kSel + 1 : 'P');
        if (kSel !== 'P') { sel = kSel; syncSel(); }
        draw(); return;
      }
      var it = kSel === 'P' ? P : wires[kSel];
      if (!it) { kSel = 'P'; it = P; }
      moveTo(kSel, it.x + d[0], it.y + d[1]); draw();
    });
    function schedule() {
      if (raf) return;
      raf = (window.requestAnimationFrame || function (f) { return setTimeout(f, 16); })(function () { raf = 0; draw(); });
    }

    /* ---------- Dibujo ---------- */
    function el(tag, attrs, text) {
      if (!UI.svgOk(attrs)) return null;
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (text != null) n.textContent = text;
      svg.querySelector('g.sketch').appendChild(n);
      return n;
    }
    function line(cls, x1, y1, x2, y2, w) { el('path', { 'class': cls, fill: 'none', 'stroke-width': w || 2, 'stroke-linecap': 'round', d: 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) }); }
    function arrowPx(cls, x, y, dx, dy, w, dash, op) {
      var L = Math.hypot(dx, dy);
      if (!(L > 3)) return;
      var ux = dx / L, uy = dy / L, hh = Math.min(10, L * 0.45), ex = x + dx, ey = y + dy;
      el('path', { 'class': cls, fill: 'none', 'stroke-width': w || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': dash || null, opacity: op == null ? null : op,
        d: 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
          'M' + (ex - ux * hh - uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh + ux * hh * 0.6).toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
          'L' + (ex - ux * hh + uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh - ux * hh * 0.6).toFixed(1) });
    }
    function fmtB(uT) { return isFinite(uT) ? (Math.abs(uT) >= 1000 ? Number((uT / 1000).toPrecision(3)) + ' mT' : Number(uT.toPrecision(3)) + ' µT') : '—'; }
    function vL(m) { return Math.max(24, Math.min(105, 24 + 38 * Math.log10(1 + m / 5))); }
    function draw() {
      svg.innerHTML = '';
      svg.appendChild(document.createElementNS(NS, 'g')).setAttribute('class', 'sketch');
      el('rect', { x: X(BOX[0]), y: Y(BOX[3]), width: PXCM * (BOX[2] - BOX[0]), height: PXCM * (BOX[3] - BOX[1]), fill: 'none', 'class': 'axis', 'stroke-width': 1.2 });
      // Malla de flechitas: dirección de B total.
      for (var gx = -11.5; gx <= 11.5; gx += 1.5) for (var gy = -6.5; gy <= 6.5; gy += 1.5) {
        if (wires.some(function (w) { return Math.hypot(w.x - gx, w.y - gy) < 0.9; })) continue;
        var f = field(wires, gx, gy);
        if (!(f.mag > 0)) continue;
        var op = Math.max(0.25, Math.min(0.9, 0.35 + 0.25 * Math.log10(f.mag / 10)));
        var ux = f.x / f.mag, uy = f.y / f.mag;
        arrowPx('ref', X(gx) - 9 * ux, Y(gy) + 9 * uy, 18 * ux, -18 * uy, 1.6, null, op.toFixed(2));
      }
      // Alambres
      wires.forEach(function (w, i) {
        var cx = X(w.x), cy = Y(w.y), r = 12;
        el('circle', { cx: cx.toFixed(1), cy: cy.toFixed(1), r: r, 'class': w.I > 0 ? 'box-err' : 'box-aux' });
        if (w.I > 0) el('circle', { cx: cx.toFixed(1), cy: cy.toFixed(1), r: 3.5, 'class': 'dot-error' });
        else { line('aux', cx - 7, cy - 7, cx + 7, cy + 7, 2.4); line('aux', cx - 7, cy + 7, cx + 7, cy - 7, 2.4); }
        el('text', { x: (cx + 16).toFixed(1), y: (cy - 12).toFixed(1), 'class': 'ann', 'font-size': 15 }, fnum(Math.abs(w.I)) + ' A');
        if (kSel === i) el('circle', { cx: cx.toFixed(1), cy: cy.toFixed(1), r: 18, fill: 'none', 'class': 'trace', 'stroke-width': 2, 'stroke-dasharray': '5 4' });
        if (showF && wires.length > 1) {
          var F = force(wires, i);
          if (F.mag > 0) arrowPx('trace', cx, cy, Math.min(90, 20 + 22 * Math.log10(1 + F.mag / 5)) * F.x / F.mag, -Math.min(90, 20 + 22 * Math.log10(1 + F.mag / 5)) * F.y / F.mag, 3);
        }
      });
      // Sonda P
      var px = X(P.x), py = Y(P.y), T = field(wires, P.x, P.y);
      wires.forEach(function (w) { var b = field([w], P.x, P.y); if (b.mag > 0) arrowPx('aux', px, py, vL(b.mag) * 0.7 * b.x / b.mag, -vL(b.mag) * 0.7 * b.y / b.mag, 2, '5 4'); });
      if (T.mag > 0 && isFinite(T.mag)) arrowPx('error', px, py, vL(T.mag) * T.x / T.mag, -vL(T.mag) * T.y / T.mag, 3.4);
      el('circle', { cx: px.toFixed(1), cy: py.toFixed(1), r: 5, 'class': 'dot-error' });
      el('text', { x: (px - 10).toFixed(1), y: (py + 22).toFixed(1), 'class': 'ann', 'font-size': 17, 'text-anchor': 'end' }, 'P');
      if (kSel === 'P') el('circle', { cx: px.toFixed(1), cy: py.toFixed(1), r: 14, fill: 'none', 'class': 'trace', 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      if (student && chal && chal.kind === 'field' && isFinite(student.ang)) arrowPx('student', px, py, 60 * Math.cos(student.ang * RAD), -60 * Math.sin(student.ang * RAD), 2.6);
      // Lecturas
      facts.innerHTML = '';
      var rows = [['B total en P', fmtB(T.mag)], ['ángulo de B', isFinite(T.ang) ? fnum(Number(T.ang.toFixed(1))) + '°' : '—']];
      if (wires.length > 1 && wires[sel]) {
        var Fs = force(wires, sel);
        rows.push(['F/L sobre el alambre elegido', Number(Fs.mag.toPrecision(3)) + ' µN/m a ' + fnum(Number(Fs.ang.toFixed(0))) + '°']);
      }
      if (wires.length === 2) rows.push(['los dos alambres', wires[0].I * wires[1].I > 0 ? 'se atraen (corrientes iguales)' : 'se repelen (corrientes opuestas)']);
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
      bF.textContent = showF ? 'Ocultar fuerzas' : 'Mostrar fuerzas';
      svg.setAttribute('aria-label', wires.length + ' alambres perpendiculares a la página. En P el campo total mide ' + fmtB(T.mag) + ' y apunta a ' + Math.round(T.ang) + ' grados.');
    }

    /* ---------- Reto ---------- */
    function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
    function newChallenge(fixed) {
      var c = fixed;
      if (!c) {
        if (Math.random() < 0.6) {
          var d = rnd([3, 4, 5]), I1 = rnd([2, 4, 5, 6]), I2 = rnd([2, 3, 4, 5]) * rnd([1, -1]);
          c = rnd([
            { kind: 'field', wires: [{ x: -d, y: 0, I: I1 }, { x: d, y: 0, I: I2 }], P: { x: 0, y: 0 } },
            { kind: 'field', wires: [{ x: -d, y: 0, I: I1 }, { x: d, y: 0, I: I2 }], P: { x: 0, y: rnd([3, 4]) } },
            { kind: 'field', wires: [{ x: 0, y: 0, I: I1 }, { x: d, y: 0, I: I2 }], P: { x: 0, y: rnd([3, 4, 5]) } }
          ]);
        } else {
          var a = rnd([2, 3, 4]), b = rnd([2, 3, 4]);
          c = { kind: 'force', wires: [{ x: -a, y: 0, I: rnd([2, 4, 6]) * rnd([1, -1]) }, { x: 0, y: 0, I: rnd([3, 5]) }, { x: b, y: 0, I: rnd([2, 4, 6]) * rnd([1, -1]) }], k: 1 };
        }
      }
      chal = c; student = null; verdict.hidden = true;
      wires = c.wires.map(function (w) { return { x: w.x, y: w.y, I: w.I }; });
      P = c.kind === 'field' ? { x: c.P.x, y: c.P.y } : { x: 0, y: -5 };
      sel = c.kind === 'force' ? c.k : 0; kSel = c.kind === 'force' ? c.k : 'P'; syncSel(); setInputs(c.kind);
      var desc = wires.map(function (w, i) { return 'alambre ' + (i + 1) + ' en (' + fnum(w.x) + ', ' + fnum(w.y) + ') cm con ' + Math.abs(w.I) + ' A ' + (w.I > 0 ? 'saliendo' : 'entrando'); }).join('; ');
      chalText.textContent = c.kind === 'force'
        ? 'Tres alambres en una fila: ' + desc + '. ¿Cuánto vale la fuerza por metro sobre el alambre 2? Dala con signo: + si apunta a la derecha.'
        : 'Alambres: ' + desc + '. ¿Cuánto vale B en P = (' + fnum(P.x) + ', ' + fnum(P.y) + ') cm? Da |B| y su ángulo.';
      in1.input.value = ''; in2.input.value = '';
      draw();
    }
    function check() {
      if (!chal) { UI.verdict(verdict, 'bad', 'Primero pide un reto', 'Presiona «Otro reto».'); return; }
      var a = parse(in1.input.value), b = parse(in2.input.value), key, t = truth(chal);
      if (chal.kind === 'force') {
        if (!isFinite(a)) { UI.verdict(verdict, 'bad', MSG.bad[0], 'Escribe F/L en µN/m, con signo.'); return; }
        student = { F: a }; key = diagnose(chal, student);
        draw();
        UI.verdict(verdict, KIND[key] || 'bad', (MSG[key] || MSG.bad)[0], (key === 'bad' ? 'Suma la fuerza de cada vecino: μ₀I₁I₂/2πd, hacia el otro si las corrientes van igual.' : (MSG[key] || MSG.bad)[1]) + ' F/L real: ' + fnum(Number(t.F.toPrecision(3))) + ' µN/m.');
        return;
      }
      if (!isFinite(a) || !isFinite(b)) { UI.verdict(verdict, 'bad', MSG.bad[0], 'Escribe |B| (µT) y el ángulo (°).'); return; }
      student = { mag: a, ang: b }; key = diagnose(chal, student);
      draw();
      UI.verdict(verdict, KIND[key] || 'bad', (MSG[key] || MSG.bad)[0], (MSG[key] || MSG.bad)[1] + ' B real: ' + Number(t.mag.toPrecision(3)) + ' µT a ' + fnum(Number(t.ang.toFixed(1))) + '°.');
    }

    // Ejemplo cargado: un compañero sumó las magnitudes de dos campos que se restan.
    loadPreset(0);
    newChallenge({ kind: 'field', wires: [{ x: -4, y: 0, I: 6 }, { x: 4, y: 0, I: 2 }], P: { x: 0, y: 0 } });
    var sm = mistakes(chal).sumMag;
    in1.input.value = String(Number(sm.mag.toPrecision(3))); in2.input.value = String(Number(sm.ang.toFixed(1)));
    note.textContent = 'Ejemplo cargado: así respondió un compañero el reto. ¿Ves su error? Presiona Comprobar, o arrastra los alambres tú mismo.';
    check();
    return Promise.resolve();
  };
})();
