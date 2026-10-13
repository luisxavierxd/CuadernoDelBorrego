/* =====================================================================
   Lab ampere-loop (Física 3 · S08): la ley de Ampère, ∮B·dl = μ₀ I_enc.
   Modo 1: alambres largos perpendiculares a la página (I > 0 sale, ⊙) y una
   trayectoria amperiana (círculo o rectángulo) que se recorre antihoraria
   (dir = +1, normal saliendo de la página) u horaria (dir = −1). El lab suma
   B·dl numéricamente alrededor de la trayectoria con el campo de cada alambre
   (B = μ₀I/2πr, tangente) y lo compara con μ₀ I_enc: las corrientes de adentro
   cuentan con su signo y las de afuera no aportan nada al total.
   Modo 2: alambre grueso de radio R con corriente uniforme I:
     B = μ₀ I r / 2πR² (r < R)      B = μ₀ I / 2πr (r ≥ R)
   Unidades del lab: cm, A, µT; la circulación en µT·m (μ₀·1 A = 1.257 µT·m).
   Reto de circulación (µT·m, con signo). Errores que detecta:
     all     contó también los alambres de afuera     abs    ignoró los signos de las corrientes
     sign    recorrido al revés                       noMu   dio I_enc sin multiplicar por μ₀
   Reto del alambre grueso (|B| en µT):
     outside usó μ₀I/2πr adentro                      linear usó I·r/R (no r²/R²) como I_enc
     cm      usó cm como metros
   ===================================================================== */
(function () {
  var MU0 = 4 * Math.PI * 1e-7, K = 20;            // µT·cm/A
  var MU0uTm = MU0 * 1e6;                           // μ₀ en µT·m/A

  /* ------------------------- Matemática pura ------------------------- */
  function wireField(w, x, y) {
    var dx = x - w.x, dy = y - w.y, r2 = dx * dx + dy * dy, k = K * w.I / r2;
    return { x: -k * dy, y: k * dx };
  }
  function field(wires, x, y) {
    var bx = 0, by = 0;
    wires.forEach(function (w) { var b = wireField(w, x, y); bx += b.x; by += b.y; });
    return { x: bx, y: by };
  }
  // Puntos de la trayectoria (cm) en el sentido del recorrido; path = { kind, cx, cy, r } o { kind: 'rect', x0, y0, x1, y1 }, dir.
  function points(path, n) {
    var out = [], i, dir = path.dir || 1;
    if (path.kind === 'circle') {
      for (i = 0; i < n; i++) { var t = dir * 2 * Math.PI * i / n; out.push([path.cx + path.r * Math.cos(t), path.cy + path.r * Math.sin(t)]); }
    } else {
      var c = [[path.x0, path.y0], [path.x1, path.y0], [path.x1, path.y1], [path.x0, path.y1]];
      if (dir < 0) c.reverse();
      var per = Math.max(1, Math.round(n / 4));
      for (var s = 0; s < 4; s++) {
        var a = c[s], b = c[(s + 1) % 4];
        for (i = 0; i < per; i++) out.push([a[0] + (b[0] - a[0]) * i / per, a[1] + (b[1] - a[1]) * i / per]);
      }
    }
    return out;
  }
  // ∮B·dl en µT·m. Círculo: regla del trapecio en el ángulo (exacta para integrandos periódicos suaves).
  // Rectángulo: Gauss–Legendre de 5 puntos en cada uno de m tramos por lado.
  var GL = [[-0.9061798459386640, 0.2369268850561891], [-0.5384693101056831, 0.4786286704993665], [0, 0.5688888888888889], [0.5384693101056831, 0.4786286704993665], [0.9061798459386640, 0.2369268850561891]];
  function circulation(wires, path, n) {
    var sum = 0, dir = path.dir || 1;
    if (path.kind === 'circle') {
      n = n || 720;
      for (var i = 0; i < n; i++) {
        var t = 2 * Math.PI * i / n, x = path.cx + path.r * Math.cos(t), y = path.cy + path.r * Math.sin(t);
        var b = field(wires, x, y);
        sum += (-b.x * Math.sin(t) + b.y * Math.cos(t)) * path.r * 2 * Math.PI / n;
      }
      return dir * sum * 0.01;
    }
    var m = n || 400, c = [[path.x0, path.y0], [path.x1, path.y0], [path.x1, path.y1], [path.x0, path.y1]];
    for (var s = 0; s < 4; s++) {
      var a = c[s], e = c[(s + 1) % 4], dx = (e[0] - a[0]) / m, dy = (e[1] - a[1]) / m;
      for (var j = 0; j < m; j++) GL.forEach(function (g) {
        var u = j + (g[0] + 1) / 2, bb = field(wires, a[0] + dx * u, a[1] + dy * u);
        sum += g[1] / 2 * (bb.x * dx + bb.y * dy);
      });
    }
    return dir * sum * 0.01;
  }
  function inside(path, x, y) {
    if (path.kind === 'circle') return Math.hypot(x - path.cx, y - path.cy) < path.r;
    return x > Math.min(path.x0, path.x1) && x < Math.max(path.x0, path.x1) && y > Math.min(path.y0, path.y1) && y < Math.max(path.y0, path.y1);
  }
  // Corriente encerrada con signo: + si va con la normal del recorrido (saliendo si es antihorario).
  function enclosed(wires, path) {
    var s = 0;
    wires.forEach(function (w) { if (inside(path, w.x, w.y)) s += w.I; });
    return (path.dir || 1) * s;
  }
  function ampere(I) { return MU0uTm * I; }          // µT·m
  // Alambre grueso (SI: A, m → T).
  function thickEnc(I, R, r) { return r >= R ? I : I * r * r / (R * R); }
  function thick(I, R, r) { return r >= R ? MU0 * I / (2 * Math.PI * r) : MU0 * I * r / (2 * Math.PI * R * R); }
  // Cable coaxial: núcleo sólido de radio a con +I; forro de b a c con −I (ambos uniformes). SI.
  function coaxEnc(I, a, b, c, r) {
    if (r < a) return I * r * r / (a * a);
    if (r < b) return I;
    if (r < c) return I * (c * c - r * r) / (c * c - b * b);
    return 0;
  }
  function coax(I, a, b, c, r) { return MU0 * coaxEnc(I, a, b, c, r) / (2 * Math.PI * r); }
  // Tubo conductor de radios a < b con corriente I uniforme en su pared (SI).
  function pipeEnc(I, a, b, r) { return r <= a ? 0 : r >= b ? I : I * (r * r - a * a) / (b * b - a * a); }
  function pipe(I, a, b, r) { return MU0 * pipeEnc(I, a, b, r) / (2 * Math.PI * r); }
  // Las mismas en unidades de clase: radios en cm, campo en µT.
  function thickUT(I, R, r) { return thick(I, R / 100, r / 100) * 1e6; }
  function coaxUT(I, a, b, c, r) { return coax(I, a / 100, b / 100, c / 100, r / 100) * 1e6; }
  function pipeUT(I, a, b, r) { return pipe(I, a / 100, b / 100, r / 100) * 1e6; }

  /* ---------- Reto ----------
     loop:  c = { kind: 'loop', wires, path }   → ∮B·dl en µT·m
     thick: c = { kind: 'thick', I, R, r } (cm) → |B| en µT */
  function truth(c) {
    if (c.kind === 'thick') return thick(c.I, c.R / 100, c.r / 100) * 1e6;
    return ampere(enclosed(c.wires, c.path));
  }
  function mistakes(c) {
    if (c.kind === 'thick') {
      return {
        outside: MU0 * c.I / (2 * Math.PI * c.r / 100) * 1e6,
        linear: MU0 * c.I * (c.r / c.R) / (2 * Math.PI * c.r / 100) * 1e6,
        cm: (c.r >= c.R ? MU0 * c.I / (2 * Math.PI * c.r) : MU0 * c.I * c.r / (2 * Math.PI * c.R * c.R)) * 1e6
      };
    }
    var all = 0, abs = 0;
    c.wires.forEach(function (w) { all += w.I; if (inside(c.path, w.x, w.y)) abs += Math.abs(w.I); });
    var t = truth(c);
    return { all: ampere((c.path.dir || 1) * all), abs: ampere((c.path.dir || 1) * abs), sign: -t, noMu: enclosed(c.wires, c.path) };
  }
  function diagnose(c, s, tol) {
    tol = tol || 0.03;
    if (!isFinite(s)) return 'bad';
    var t = truth(c), m = mistakes(c);
    var near = function (a, b) { return Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-9) + (Math.abs(b) < 1e-9 ? 1e-3 : 0); };
    if (near(s, t)) return 'ok';
    var keys = c.kind === 'thick' ? ['outside', 'linear', 'cm'] : ['all', 'abs', 'sign', 'noMu'];
    for (var i = 0; i < keys.length; i++) if (!near(m[keys[i]], t) && near(s, m[keys[i]])) return keys[i];
    return 'bad';
  }

  window.LabMath.ampere = {
    MU0: MU0, MU0uTm: MU0uTm, field: field, points: points, circulation: circulation, inside: inside, enclosed: enclosed, ampere: ampere,
    thick: thick, thickEnc: thickEnc, coax: coax, coaxEnc: coaxEnc, pipe: pipe, pipeEnc: pipeEnc, thickUT: thickUT, coaxUT: coaxUT, pipeUT: pipeUT, truth: truth, mistakes: mistakes, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var VW = 640, VH = 400, PXCM = 24, OX = 320, OY = 200;
  var BOX = [-12.5, -7.5, 12.5, 7.5];
  function X(x) { return OX + PXCM * x; }
  function Y(y) { return OY - PXCM * y; }
  function fnum(v) { return String(v).replace('-', '−'); }
  var PRESETS = [
    { name: 'Un alambre dentro', w: [{ x: 0, y: 0, I: 5 }], path: { kind: 'circle', cx: 0, cy: 0, r: 4, dir: 1 } },
    { name: 'Un alambre fuera', w: [{ x: 7, y: 0, I: 5 }], path: { kind: 'circle', cx: -2, cy: 0, r: 4, dir: 1 } },
    { name: 'Dos adentro, uno afuera', w: [{ x: -2, y: 1, I: 6 }, { x: 2, y: -1, I: -2 }, { x: 8, y: 3, I: 5 }], path: { kind: 'rect', x0: -5, y0: -4, x1: 5, y1: 4, dir: 1 } },
    { name: 'Corrientes opuestas que se cancelan', w: [{ x: -2, y: 0, I: 4 }, { x: 2, y: 0, I: -4 }], path: { kind: 'circle', cx: 0, cy: 0, r: 5, dir: 1 } }
  ];
  var MSG = {
    ok: ['Tu predicción coincide', 'Correcto.'],
    all: ['Contaste también los alambres de afuera', 'Las corrientes de afuera sí cambian B en cada punto, pero su aporte a ∮B·dl suma cero. Solo cuenta I_enc.'],
    abs: ['Ignoraste los signos de las corrientes', 'Con el recorrido antihorario, la normal sale de la página: ⊙ cuenta positivo y ⊗ negativo.'],
    sign: ['El signo está al revés', 'Revisa el sentido del recorrido: dedos de la mano derecha con el recorrido, el pulgar da qué corriente cuenta positiva.'],
    noMu: ['Te faltó μ₀', 'La ley es ∮B·dl = μ₀ I_enc; con I en A, μ₀ = 1.257 µT·m/A.'],
    outside: ['Usaste la fórmula de afuera', 'Dentro del alambre la trayectoria encierra solo la parte I·r²/R² de la corriente: B = μ₀Ir/2πR².'],
    linear: ['La corriente encerrada va con el área', 'Con densidad uniforme, I_enc = I·(πr²)/(πR²) = I·r²/R², no I·r/R.'],
    cm: ['Revisa las unidades', 'En μ₀I/(2πr) las distancias van en metros.'],
    bad: ['Tu predicción no coincide', 'Identifica qué corrientes cruzan la superficie de la trayectoria, con su signo, y multiplica por μ₀.']
  };
  var KIND = { ok: 'ok', all: 'warn', abs: 'warn', sign: 'warn', noMu: 'warn', outside: 'warn', linear: 'warn', cm: 'warn' };

  window.Labs['ampere-loop'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var mode = 'loop', wires = [], path = null, sel = 'path', raf = 0, drag = null, chal = null, student = null;
    var tk = { I: 6, R: 2, r: 1.2 };

    var mSel = UI.select({ label: 'Modo', options: ['Trayectoria y alambres', 'Alambre grueso'] });
    var preset = UI.select({ label: 'Configuración', options: PRESETS.map(function (p) { return p.name; }) });
    var shape = UI.select({ label: 'Forma de la trayectoria', options: ['Círculo', 'Rectángulo'] });
    var sSize = UI.slider({ label: 'Tamaño de la trayectoria', min: 1, max: 7, step: 0.5, value: 4, unit: 'cm' }, function (v) { resize(v); draw(); });
    var bDir = UI.button('Invertir el recorrido', 'ghost', function () { path.dir = -path.dir; draw(); });
    var bFlip = UI.button('Invertir el alambre elegido', 'ghost', function () { if (typeof sel === 'number' && wires[sel]) { wires[sel].I = -wires[sel].I; draw(); } });
    var sTI = UI.slider({ label: 'Corriente total I', min: 1, max: 10, step: 1, value: tk.I, unit: 'A' }, function (v) { tk.I = v; draw(); });
    var sTR = UI.slider({ label: 'Radio del alambre R', min: 1, max: 4, step: 0.5, value: tk.R, unit: 'cm' }, function (v) { tk.R = v; tk.r = Math.min(tk.r, 3 * v); sTr.set(tk.r); draw(); });
    var sTr = UI.slider({ label: 'Radio de la trayectoria r', min: 0.2, max: 12, step: 0.2, value: tk.r, unit: 'cm', fmt: function (v) { return Number(v.toFixed(1)); } }, function (v) { tk.r = Math.min(v, 3 * tk.R); draw(); });
    var note = h('p', { class: 'lab-note', role: 'status' });

    var chalText = h('p', { class: 'lab-note' });
    var ans = UI.input({ label: 'Tu respuesta', type: 'text', inputmode: 'decimal', mono: false, hint: 'Notación científica: <code>2.5e1</code> o <code>2.5×10^1</code>.' });
    var bCheck = UI.button('Comprobar', 'primary', check);
    var bNew = UI.button('Otro reto', 'ghost', function () { newChallenge(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var svg = UI.svg(VW, VH, 'Trayectoria amperiana alrededor de alambres perpendiculares a la página.');
    svg.classList.add('lab-stage--drag');
    svg.setAttribute('tabindex', '0');
    var hint = h('p', { class: 'lab-note' }, ['Arrastra los alambres o la trayectoria (o usa las flechas; espacio cambia de objeto). ⊙ sale de la página, ⊗ entra. Medidas en cm.']);
    var legend = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--trace' }), 'B·dl a favor del recorrido']),
      h('li', {}, [h('i', { class: 'sw sw--aux' }), 'B·dl en contra']),
      h('li', {}, [h('i', { class: 'sw sw--error' }), 'B en la trayectoria'])
    ]);
    var facts = h('dl', { class: 'lab-facts' });

    var loopBox = h('div', { class: 'lab-stack' }, [preset.node, shape.node, sSize.node, h('div', { class: 'lab-buttons' }, [bDir, bFlip])]);
    var thickBox = h('div', { class: 'lab-stack' }, [sTI.node, sTR.node, sTr.node]);
    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        mSel.node, loopBox, thickBox, note,
        h('p', { class: 'lab-field__label' }, ['Reto']), chalText, ans.node,
        h('div', { class: 'lab-buttons' }, [bCheck, bNew]), verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['La ley de Ampère']),
        svg, hint, legend, facts
      ])
    ]));
    // Sin mayúsculas en las etiquetas de los campos: µ se volvía Μ (y mT, MT); θ y φ, Θ y Φ.
    mount.querySelectorAll('label.lab-field__label').forEach(function (l) { l.style.textTransform = 'none'; l.style.letterSpacing = '0'; });
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    ans.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });

    function parse(s) { return window.CBExercises ? window.CBExercises.parseNumber(s) : parseFloat(String(s).replace(/−/g, '-')); }
    function show(node, on) { node.hidden = !on; node.style.display = on ? '' : 'none'; }
    function setMode(m) {
      mode = m; mSel.input.value = m === 'loop' ? '0' : '1';
      show(loopBox, m === 'loop'); show(thickBox, m === 'thick'); show(hint, m === 'loop');
      ans.node.querySelector('label').textContent = m === 'loop' ? 'Tu ∮B·dl con signo (µT·m)' : 'Tu |B| en la trayectoria (µT)';
    }
    function size() { return path.kind === 'circle' ? path.r : (path.x1 - path.x0) / 2; }
    function resize(v) {
      if (path.kind === 'circle') path.r = v;
      else { var cx = (path.x0 + path.x1) / 2, cy = (path.y0 + path.y1) / 2, ry = Math.max(0.5, v * 0.8); path.x0 = cx - v; path.x1 = cx + v; path.y0 = cy - ry; path.y1 = cy + ry; }
    }
    function center() { return path.kind === 'circle' ? { x: path.cx, y: path.cy } : { x: (path.x0 + path.x1) / 2, y: (path.y0 + path.y1) / 2 }; }
    function moveCenter(x, y) {
      var c = center(), dx = x - c.x, dy = y - c.y;
      if (path.kind === 'circle') { path.cx += dx; path.cy += dy; } else { path.x0 += dx; path.x1 += dx; path.y0 += dy; path.y1 += dy; }
    }
    function loadPreset(i) {
      var p = PRESETS[i] || PRESETS[0];
      wires = p.w.map(function (w) { return { x: w.x, y: w.y, I: w.I }; });
      path = Object.assign({}, p.path); sel = 'path'; chal = null; student = null;
      shape.input.value = path.kind === 'circle' ? '0' : '1'; sSize.set(size());
      verdict.hidden = true; chalText.textContent = ''; draw();
    }
    preset.input.addEventListener('change', function () { loadPreset(+preset.input.value); });
    shape.input.addEventListener('change', function () {
      var c = center(), s = size();
      path = shape.input.value === '0' ? { kind: 'circle', cx: c.x, cy: c.y, r: s, dir: path.dir } : { kind: 'rect', x0: c.x - s, x1: c.x + s, y0: c.y - s * 0.8, y1: c.y + s * 0.8, dir: path.dir };
      draw();
    });
    mSel.input.addEventListener('change', function () { setMode(mSel.input.value === '0' ? 'loop' : 'thick'); chal = null; verdict.hidden = true; chalText.textContent = ''; draw(); });

    /* ---------- Arrastre y teclado ---------- */
    function toWorld(ev) {
      var m = svg.getScreenCTM();
      if (!m) return null;
      var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      var q = pt.matrixTransform(m.inverse());
      return { x: (q.x - OX) / PXCM, y: (OY - q.y) / PXCM };
    }
    function pick(w) {
      var best = null, bd = 1.1;
      wires.forEach(function (o, i) { var d = Math.hypot(o.x - w.x, o.y - w.y); if (d < bd) { bd = d; best = i; } });
      if (best === null) {
        var c = center(), dEdge = path.kind === 'circle' ? Math.abs(Math.hypot(w.x - c.x, w.y - c.y) - path.r) : Math.min(Math.abs(w.x - path.x0), Math.abs(w.x - path.x1), Math.abs(w.y - path.y0), Math.abs(w.y - path.y1));
        if (inside(path, w.x, w.y) || dEdge < 0.8) best = 'path';
      }
      return best;
    }
    function snap(v) { return Math.round(v * 2) / 2; }
    function moveTo(it, x, y) {
      x = Math.max(BOX[0] + 0.5, Math.min(BOX[2] - 0.5, snap(x))); y = Math.max(BOX[1] + 0.5, Math.min(BOX[3] - 0.5, snap(y)));
      if (it === 'path') moveCenter(x, y);
      else if (wires[it]) { wires[it].x = x; wires[it].y = y; }
    }
    var grab = null;
    svg.addEventListener('pointerdown', function (ev) {
      if (mode !== 'loop') return;
      var w = toWorld(ev); if (!w) return;
      var it = pick(w); if (it === null) return;
      if (chal) { chal = null; chalText.textContent = 'Moviste el reto: pide otro para que el lab lo califique.'; }
      drag = it; sel = it;
      var c = center(); grab = it === 'path' ? { dx: c.x - w.x, dy: c.y - w.y } : { dx: 0, dy: 0 };
      try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* sin captura */ }
      ev.preventDefault(); schedule();
    });
    svg.addEventListener('pointermove', function (ev) {
      if (drag === null) return;
      var w = toWorld(ev); if (!w) return;
      moveTo(drag, w.x + grab.dx, w.y + grab.dy); schedule();
    });
    function endDrag() { if (drag === null) return; drag = null; draw(); }
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
    svg.addEventListener('keydown', function (ev) {
      if (mode !== 'loop') return;
      var d = { ArrowLeft: [-0.5, 0], ArrowRight: [0.5, 0], ArrowUp: [0, 0.5], ArrowDown: [0, -0.5] }[ev.key];
      if (ev.key === 'Tab' || (!d && ev.key !== ' ')) return;
      ev.preventDefault();
      if (ev.key === ' ') { sel = sel === 'path' ? (wires.length ? 0 : 'path') : (sel + 1 < wires.length ? sel + 1 : 'path'); draw(); return; }
      var c = sel === 'path' ? center() : wires[sel];
      moveTo(sel, c.x + d[0], c.y + d[1]); draw();
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
    function line(cls, x1, y1, x2, y2, w, dash) { el('path', { 'class': cls, fill: 'none', 'stroke-width': w || 2, 'stroke-linecap': 'round', 'stroke-dasharray': dash || null, d: 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) }); }
    function arrowPx(cls, x, y, dx, dy, w) {
      var L = Math.hypot(dx, dy);
      if (!(L > 3)) return;
      var ux = dx / L, uy = dy / L, hh = Math.min(10, L * 0.45), ex = x + dx, ey = y + dy;
      el('path', { 'class': cls, fill: 'none', 'stroke-width': w || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        d: 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
          'M' + (ex - ux * hh - uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh + ux * hh * 0.6).toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
          'L' + (ex - ux * hh + uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh - ux * hh * 0.6).toFixed(1) });
    }
    function txt(x, y, s, anchor, fs) { el('text', { x: x.toFixed(1), y: y.toFixed(1), 'class': 'ann', 'text-anchor': anchor || 'middle', 'font-size': fs || 16 }, s); }
    function n3(v) { return isFinite(v) ? fnum(Number(v.toPrecision(3))) : '—'; }
    function draw() {
      svg.innerHTML = '';
      svg.appendChild(document.createElementNS(NS, 'g')).setAttribute('class', 'sketch');
      if (mode === 'thick') return drawThick();
      el('rect', { x: X(BOX[0]), y: Y(BOX[3]), width: PXCM * (BOX[2] - BOX[0]), height: PXCM * (BOX[3] - BOX[1]), fill: 'none', 'class': 'axis', 'stroke-width': 1.2 });
      // Trayectoria: cada tramo coloreado según el signo de B·dl.
      var pts = points(path, 96);
      pts.forEach(function (p, i) {
        var q = pts[(i + 1) % pts.length], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, b = field(wires, mx, my);
        var dot = b.x * (q[0] - p[0]) + b.y * (q[1] - p[1]);
        line(dot >= 0 ? 'trace' : 'aux', X(p[0]), Y(p[1]), X(q[0]), Y(q[1]), 3.2);
        if (i % 12 === 6 && wires.length) {
          var bm = Math.hypot(b.x, b.y);
          if (bm > 0) arrowPx('error', X(mx), Y(my), Math.min(40, 10 + 10 * Math.log10(1 + bm)) * b.x / bm, -Math.min(40, 10 + 10 * Math.log10(1 + bm)) * b.y / bm, 1.8);
        }
      });
      // Flechas del sentido de recorrido.
      [0.125, 0.375, 0.625, 0.875].forEach(function (f) {
        var i = Math.floor(f * pts.length), p = pts[i], q = pts[(i + 1) % pts.length], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
        var x = X(p[0]), y = Y(p[1]), ux = dx / L, uy = -dy / L;
        el('path', { 'class': 'ref', fill: 'none', 'stroke-width': 2.6, d: 'M' + (x - ux * 10 - uy * 7).toFixed(1) + ' ' + (y - uy * 10 + ux * 7).toFixed(1) + 'L' + x.toFixed(1) + ' ' + y.toFixed(1) + 'L' + (x - ux * 10 + uy * 7).toFixed(1) + ' ' + (y - uy * 10 - ux * 7).toFixed(1) });
      });
      if (sel === 'path') { var c = center(); el('circle', { cx: X(c.x).toFixed(1), cy: Y(c.y).toFixed(1), r: 4, 'class': 'dot-trace' }); }
      wires.forEach(function (w, i) {
        var cx = X(w.x), cy = Y(w.y), r = 12;
        el('circle', { cx: cx.toFixed(1), cy: cy.toFixed(1), r: r, 'class': w.I > 0 ? 'box-err' : 'box-aux' });
        if (w.I > 0) el('circle', { cx: cx.toFixed(1), cy: cy.toFixed(1), r: 3.5, 'class': 'dot-error' });
        else { line('aux', cx - 7, cy - 7, cx + 7, cy + 7, 2.4); line('aux', cx - 7, cy + 7, cx + 7, cy - 7, 2.4); }
        txt(cx + 16, cy - 12, Math.abs(w.I) + ' A', 'start', 15);
        if (sel === i) el('circle', { cx: cx.toFixed(1), cy: cy.toFixed(1), r: 18, fill: 'none', 'class': 'trace', 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      });
      var circ = circulation(wires, path), Ie = enclosed(wires, path);
      facts.innerHTML = '';
      [['∮B·dl (suma numérica)', n3(circ) + ' µT·m'], ['I encerrada (con signo)', fnum(Ie) + ' A'], ['μ₀ I_enc', n3(ampere(Ie)) + ' µT·m'],
       ['recorrido', path.dir > 0 ? 'antihorario (⊙ cuenta +)' : 'horario (⊗ cuenta +)']]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
      svg.setAttribute('aria-label', 'Trayectoria amperiana con ' + wires.length + ' alambres. La circulación numérica de B es ' + n3(circ) + ' microtesla metro y μ₀ por la corriente encerrada da ' + n3(ampere(Ie)) + '.');
    }
    function drawThick() {
      var cx = 180, cy = 200, s = 55 / tk.R, R = 55, r = tk.r * s;
      el('circle', { cx: cx, cy: cy, r: R, 'class': 'box-err' });
      if (r < R) el('circle', { cx: cx, cy: cy, r: r.toFixed(1), 'class': 'box-trace' });
      el('circle', { cx: cx, cy: cy, r: r.toFixed(1), fill: 'none', 'class': 'trace', 'stroke-width': 3, 'stroke-dasharray': '7 5' });
      el('circle', { cx: cx, cy: cy, r: 3.5, 'class': 'dot-error' });
      txt(cx, cy + R + 22 > 380 ? 380 : cy - R - 10, 'R = ' + tk.R + ' cm', 'middle', 15);
      txt(cx + r * 0.71 + 6, cy - r * 0.71 - 6, 'r', 'start', 17);
      var Bt = thick(tk.I, tk.R / 100, tk.r / 100) * 1e6;
      arrowPx('error', cx + r, cy, 0, -Math.min(70, 16 + 14 * Math.log10(1 + Bt)), 3);
      // Gráfica B(r)
      var gx0 = 370, gx1 = 620, gy0 = 340, gy1 = 70, rMax = 3 * tk.R, Bmax = thick(tk.I, tk.R / 100, tk.R / 100) * 1e6 * 1.15;
      var GX = function (rr) { return gx0 + (gx1 - gx0) * rr / rMax; }, GY = function (b) { return gy0 - (gy0 - gy1) * b / Bmax; };
      line('axis', gx0, gy0, gx1, gy0, 1.4); line('axis', gx0, gy0, gx0, gy1 - 10, 1.4);
      txt(gx1, gy0 + 22, 'r (cm)', 'end', 15); txt(gx0 - 6, gy1 - 16, 'B (µT)', 'start', 15);
      line('axis', GX(tk.R), gy0, GX(tk.R), gy1, 1, '3 5'); txt(GX(tk.R), gy0 + 22, 'R', 'middle', 15);
      var d = '';
      for (var i = 1; i <= 120; i++) { var rr = rMax * i / 120, b = thick(tk.I, tk.R / 100, rr / 100) * 1e6; d += (i > 1 ? 'L' : 'M') + GX(rr).toFixed(1) + ' ' + GY(b).toFixed(1); }
      el('path', { 'class': 'ref', fill: 'none', 'stroke-width': 2.4, d: 'M' + gx0 + ' ' + gy0 + 'L' + d.slice(1) });
      el('circle', { cx: GX(tk.r).toFixed(1), cy: GY(Bt).toFixed(1), r: 5, 'class': 'dot-error' });
      facts.innerHTML = '';
      [['I encerrada', n3(thickEnc(tk.I, tk.R, tk.r)) + ' A de ' + tk.I + ' A'], ['B en r = ' + Number(tk.r.toFixed(1)) + ' cm', n3(Bt) + ' µT'], ['B en la superficie (r = R)', n3(thick(tk.I, tk.R / 100, tk.R / 100) * 1e6) + ' µT']]
        .forEach(function (rw) { facts.appendChild(h('dt', {}, [rw[0]])); facts.appendChild(h('dd', {}, [rw[1]])); });
      svg.setAttribute('aria-label', 'Corte de un alambre grueso de radio ' + tk.R + ' cm con una trayectoria de radio ' + Number(tk.r.toFixed(1)) + ' cm, y la gráfica de B contra r: crece en línea recta hasta R y luego baja como 1/r.');
    }

    /* ---------- Reto ---------- */
    function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
    function newChallenge(fixed) {
      var c = fixed;
      if (!c) {
        if (mode === 'thick') c = { kind: 'thick', I: rnd([2, 4, 5, 6, 8]), R: rnd([1, 1.5, 2, 3]), r: 0 };
        else {
          var ws = [{ x: rnd([-3, -2]), y: rnd([-2, 1]), I: rnd([2, 3, 4, 5, 6]) * rnd([1, -1]) }, { x: rnd([2, 3]), y: rnd([-1, 2]), I: rnd([1, 2, 3, 4]) * rnd([1, -1]) }, { x: rnd([8, 9]), y: rnd([-3, 3]), I: rnd([2, 5, 7]) * rnd([1, -1]) }];
          c = { kind: 'loop', wires: ws, path: rnd([{ kind: 'circle', cx: 0, cy: 0, r: 5, dir: rnd([1, -1]) }, { kind: 'rect', x0: -5, y0: -4, x1: 5, y1: 4, dir: rnd([1, -1]) }]) };
        }
        if (c.kind === 'thick') c.r = rnd([0.25, 0.5, 0.75, 1.5, 2]) * c.R;
      }
      chal = c; student = null; verdict.hidden = true;
      if (c.kind === 'thick') {
        setMode('thick'); tk = { I: c.I, R: c.R, r: c.r }; sTI.set(c.I); sTR.set(c.R); sTr.set(c.r);
        chalText.textContent = 'Un alambre grueso de radio R = ' + c.R + ' cm lleva I = ' + c.I + ' A repartida de manera uniforme. ¿Cuánto vale |B| a r = ' + Number(c.r.toFixed(2)) + ' cm del eje? En µT.';
      } else {
        setMode('loop');
        wires = c.wires.map(function (w) { return { x: w.x, y: w.y, I: w.I }; }); path = Object.assign({}, c.path); sel = 'path';
        shape.input.value = path.kind === 'circle' ? '0' : '1'; sSize.set(size());
        chalText.textContent = 'Con los alambres y la trayectoria de la figura, recorrida en sentido ' + (path.dir > 0 ? 'antihorario' : 'horario') + ': ' +
          wires.map(function (w) { return Math.abs(w.I) + ' A ' + (w.I > 0 ? '⊙' : '⊗'); }).join(', ') + '. ¿Cuánto vale ∮B·dl? En µT·m, con signo.';
      }
      ans.input.value = '';
      draw();
    }
    function check() {
      if (!chal) { UI.verdict(verdict, 'bad', 'Primero pide un reto', 'Presiona «Otro reto».'); return; }
      var a = parse(ans.input.value);
      if (!isFinite(a)) { UI.verdict(verdict, 'bad', MSG.bad[0], 'Escribe un número.'); return; }
      student = a;
      var key = diagnose(chal, a), t = truth(chal), msg = MSG[key] || MSG.bad;
      UI.verdict(verdict, KIND[key] || 'bad', msg[0], (key === 'bad' && chal.kind === 'thick' ? 'Primero ve si r < R: adentro, I_enc = I·r²/R²; afuera, toda I.' : msg[1]) + ' Valor real: ' + n3(t) + (chal.kind === 'thick' ? ' µT.' : ' µT·m.'));
    }

    // Ejemplo cargado: un compañero contó también la corriente de afuera.
    setMode('loop');
    loadPreset(2);
    newChallenge({ kind: 'loop', wires: PRESETS[2].w, path: Object.assign({}, PRESETS[2].path) });
    ans.input.value = String(Number(mistakes(chal).all.toPrecision(3)));
    note.textContent = 'Ejemplo cargado: así respondió un compañero el reto. ¿Ves su error? Presiona Comprobar, o mueve la trayectoria tú mismo.';
    check();
    return Promise.resolve();
  };
})();
