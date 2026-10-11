/* =====================================================================
   Lab coulomb-check (Física 2 · S02): «¿Es tu fuerza?».
   De 2 a 4 cargas puntuales sobre una cuadrícula en cm (se arrastran o se
   escriben sus coordenadas). El alumno elige la carga objetivo y escribe la
   fuerza neta sobre ella (Fx y Fy, o magnitud y ángulo). El lab dibuja cada
   fuerza parcial, la resultante y la del alumno, y diagnostica errores típicos:
     cm        no convirtió cm → m (la fuerza sale 10⁴ veces más chica)
     prefix    olvidó el prefijo μ o n de las cargas
     noSquare  usó k|q₁q₂|/r en lugar de k|q₁q₂|/r²
     reversed  confundió atracción con repulsión (toda la fuerza al revés)
     signX/Y   una componente con el signo invertido
     addMags   sumó magnitudes en lugar de vectores
   Matemática en SI: cargas en C, posiciones en m, fuerzas en N.
   Ángulos en grados desde +x, antihorario, en [0, 360).
   ===================================================================== */
(function () {
  var K = 8.99e9, G = 6.67e-11, E = 1.60e-19, ME = 9.11e-31, MP = 1.67e-27;
  var DEG = 180 / Math.PI;
  var UNITS = { uC: 1e-6, nC: 1e-9 };

  /* ------------------------- Matemática pura ------------------------- */
  function norm360(a) { a = a % 360; return a < 0 ? a + 360 : a; }
  function vec(x, y) { return { x: x, y: y, mag: Math.hypot(x, y), ang: norm360(Math.atan2(y, x) * DEG) }; }
  function angDiff(a, b) { var d = Math.abs(norm360(a) - norm360(b)); return Math.min(d, 360 - d); }
  // Magnitud de la fuerza entre dos cargas (C) separadas r (m).
  function magnitude(q1, q2, r) { return K * Math.abs(q1 * q2) / (r * r); }
  // Fuerza (vector) sobre la carga t debida a la carga s: F = k q_s q_t r̂ / r², con r̂ de s hacia t.
  function force(s, t) {
    var dx = t.x - s.x, dy = t.y - s.y, r2 = dx * dx + dy * dy;
    if (!(r2 > 0)) return vec(NaN, NaN);
    var r = Math.sqrt(r2), f = K * s.q * t.q / r2;
    return vec(f * dx / r, f * dy / r);
  }
  // Fuerza neta sobre la carga i por superposición; parts[j] = fuerza de cada otra carga.
  function net(list, i) {
    var x = 0, y = 0, parts = [];
    list.forEach(function (c, j) {
      if (j === i) return;
      var f = force(c, list[i]);
      f.from = j;
      parts.push(f);
      x += f.x; y += f.y;
    });
    var out = vec(x, y);
    out.parts = parts;
    return out;
  }
  // Cargas en μC o nC y posiciones en cm → SI.
  function toSI(list, unit) {
    var u = UNITS[unit] || UNITS.uC;
    return list.map(function (c) { return { q: c.q * u, x: c.x / 100, y: (c.y || 0) / 100 }; });
  }
  // Cargas sobre el eje x: [{ q, x }] en SI → componente x de la fuerza neta sobre la i.
  function lineForce(list, i) {
    return net(list.map(function (c) { return { q: c.q, x: c.x, y: 0 }; }), i).x;
  }
  // q1 en x = 0 y q2 en x = d > 0: x donde una carga de prueba siente fuerza neta cero (null si no hay).
  function equilibrium(q1, q2, d) {
    var a = Math.abs(q1), b = Math.abs(q2);
    if (!(a > 0) || !(b > 0) || !(d > 0)) return null;
    if (q1 * q2 > 0) return d / (1 + Math.sqrt(b / a));        // mismo signo: entre las dos
    if (a === b) return null;                                   // opuestas e iguales: no hay
    if (a < b) return -d / (Math.sqrt(b / a) - 1);              // afuera, del lado de la más chica
    return d + d / (Math.sqrt(a / b) - 1);
  }
  function gravity(m1, m2, r) { return G * m1 * m2 / (r * r); }
  // Cociente fuerza eléctrica / gravitacional entre dos partículas a la distancia r.
  function ratio(q1, q2, m1, m2, r) { return magnitude(q1, q2, r) / gravity(m1, m2, r); }

  // Resultados de los errores típicos, con cargas en `unit` y posiciones en cm.
  function mistakes(list, i, unit) {
    var u = UNITS[unit] || UNITS.uC, si = toSI(list, unit), tr = net(si, i);
    var nsx = 0, nsy = 0, sumMag = 0;
    tr.parts.forEach(function (p) {
      var s = si[p.from], r = Math.hypot(si[i].x - s.x, si[i].y - s.y);
      nsx += p.x * r; nsy += p.y * r;            // k q q / r: cada fuerza parcial por r
      sumMag += p.mag;
    });
    return {
      cm: vec(tr.x * 1e-4, tr.y * 1e-4),
      prefix: vec(tr.x / (u * u), tr.y / (u * u)),
      noSquare: vec(nsx, nsy),
      reversed: vec(-tr.x, -tr.y),
      signX: vec(-tr.x, tr.y),
      signY: vec(tr.x, -tr.y),
      addMags: sumMag
    };
  }
  // student: { x, y } en N (o { mag, ang }). Tolerancia relativa del 2 % de la magnitud.
  function diagnose(list, i, unit, student, tol) {
    tol = tol || 0.02;
    var s = student;
    if (s && s.mag != null && s.ang != null && s.x == null) s = vec(s.mag * Math.cos(s.ang / DEG), s.mag * Math.sin(s.ang / DEG));
    if (!s || !isFinite(s.x) || !isFinite(s.y)) return 'bad';
    var tr = net(toSI(list, unit), i);
    if (!isFinite(tr.mag)) return 'bad';
    var m = mistakes(list, i, unit), sm = Math.hypot(s.x, s.y);
    function near(a, b) { return Math.hypot(a.x - b.x, a.y - b.y) <= tol * Math.max(b.mag, 1e-30); }
    if (near(s, tr)) return 'ok';
    var keys = ['cm', 'prefix', 'noSquare', 'reversed', 'signX', 'signY'];
    for (var k = 0; k < keys.length; k++) {
      var c = m[keys[k]];
      if (near(s, c) && !near(c, tr)) return keys[k];
    }
    if (Math.abs(sm - m.addMags) <= tol * m.addMags && Math.abs(m.addMags - tr.mag) > tol * tr.mag) return 'addMags';
    var magOk = Math.abs(sm - tr.mag) <= tol * Math.max(tr.mag, 1e-30);
    if (magOk) return 'angleOff';
    if (sm > 0 && angDiff(vec(s.x, s.y).ang, tr.ang) <= 1.5) return 'magOff';
    return 'bad';
  }

  window.LabMath.coulomb = {
    K: K, G: G, E: E, ME: ME, MP: MP, UNITS: UNITS,
    vec: vec, norm360: norm360, angDiff: angDiff, magnitude: magnitude, force: force, net: net, toSI: toSI,
    lineForce: lineForce, equilibrium: equilibrium, gravity: gravity, ratio: ratio, mistakes: mistakes, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var MSG = {
    ok: ['Tu fuerza coincide', 'Es la suma vectorial de las fuerzas punteadas.'],
    cm: ['Te faltó pasar de cm a m', 'Tu fuerza salió 10 000 veces más chica: r va en metros (1 cm = 0.01 m) y, como va al cuadrado, el error se vuelve 10⁴.'],
    prefix: ['Olvidaste el prefijo de las cargas', '1 μC = 10⁻⁶ C y 1 nC = 10⁻⁹ C. Sin el prefijo, la fuerza sale enorme.'],
    noSquare: ['No elevaste r al cuadrado', 'La ley de Coulomb es F = k|q₁q₂|/r². Revisa cada fuerza parcial.'],
    reversed: ['Tu fuerza apunta al revés', 'Signos iguales se repelen (la fuerza se aleja de la otra carga); signos opuestos se atraen (apunta hacia ella).'],
    signX: ['El signo de Fx está invertido', 'Mira hacia dónde empuja cada fuerza parcial: si apunta a la izquierda, su componente x es negativa.'],
    signY: ['El signo de Fy está invertido', 'Mira hacia dónde empuja cada fuerza parcial: si apunta hacia abajo, su componente y es negativa.'],
    addMags: ['Sumaste magnitudes, no vectores', 'Las fuerzas apuntan en direcciones distintas: descompón cada una, suma las x y las y por separado y luego usa Pitágoras.'],
    angleOff: ['La magnitud está bien; la dirección no', 'Calcula θ con los signos de Fx y Fy a la vista: si Fx < 0, súmale 180° al arco tangente.'],
    magOff: ['La dirección está bien; la magnitud no', 'Revisa cada fuerza parcial: k = 8.99 × 10⁹ N·m²/C², cargas en C y distancias en m.'],
    bad: ['Tu fuerza no coincide', 'Calcula cada fuerza parcial por separado (flechas punteadas), descomponla en x y y, y súmalas.']
  };
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  // Número legible: notación científica con ×10ⁿ si es muy chico o muy grande.
  function sci(v) {
    if (typeof v !== 'number' || !isFinite(v)) return '—';
    if (Math.abs(v) < 1e-12) return '0';
    var a = Math.abs(v);
    if (a >= 1e-2 && a < 1e5) return Number(v.toPrecision(4)).toString().replace('-', '−');
    var e = Math.floor(Math.log10(a)), m = v / Math.pow(10, e);
    if (Math.abs(m) >= 9.9995) { m /= 10; e += 1; }
    return m.toFixed(3).replace('-', '−') + '×10' + String(e).split('').map(function (ch) { return SUP[ch]; }).join('');
  }

  window.Labs['coulomb-check'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var X0 = 0, X1 = 10, Y0 = 0, Y1 = 8;
    var s = cfg.start || {};
    var charges = (s.charges || [{ q: 3, x: 2, y: 2 }, { q: -4, x: 7, y: 2 }, { q: 2, x: 2, y: 6 }, { q: -1, x: 8, y: 7 }]).map(function (c) { return { q: c.q, x: c.x, y: c.y }; });
    while (charges.length < 4) charges.push({ q: 1, x: 9, y: charges.length * 2 });
    var count = Math.max(2, Math.min(4, s.n || 3)), target = Math.min(s.target || 0, count - 1);
    var student = null, drag = null;

    var nSel = UI.select({ label: 'Número de cargas', options: ['2 cargas', '3 cargas', '4 cargas'] });
    var uSel = UI.select({ label: 'Unidad de las cargas', options: ['μC (10⁻⁶ C)', 'nC (10⁻⁹ C)'] });
    var tSel = UI.select({ label: 'Carga objetivo', options: ['q1', 'q2', 'q3', 'q4'] });
    var mSel = UI.select({ label: 'Cómo respondes', options: ['Fx y Fy', '|F| y θ'] });
    nSel.input.value = String(count - 2);
    uSel.input.value = s.unit === 'nC' ? '1' : '0';
    tSel.input.value = String(target);
    mSel.input.value = s.mode === 'polar' ? '1' : '0';

    // Tabla de cargas: valor con signo y coordenadas en cm.
    var qHead = h('span', { class: 'coulomb-table__head' }, ['q (μC)']);
    var rows = charges.map(function (c, i) {
      function num(val, label) {
        return h('input', { type: 'number', step: 'any', inputmode: 'decimal', class: 'lab-input lab-input--mono', value: String(val), 'aria-label': label });
      }
      var q = num(c.q, 'Carga q' + (i + 1)), x = num(c.x, 'x de q' + (i + 1) + ' en cm'), y = num(c.y, 'y de q' + (i + 1) + ' en cm');
      x.min = X0; x.max = X1; y.min = Y0; y.max = Y1; x.step = '1'; y.step = '1';
      var row = h('div', { class: 'coulomb-table__row' }, [h('span', { class: 'coulomb-table__name' }, ['q' + (i + 1)]), q, x, y]);
      [q, x, y].forEach(function (inp) { inp.addEventListener('change', function () { readRow(i); }); });
      return { node: row, q: q, x: x, y: y };
    });
    var table = h('div', { class: 'coulomb-table', role: 'group', 'aria-label': 'Cargas: valor y posición en cm' }, [
      h('div', { class: 'coulomb-table__row coulomb-table__row--head' }, [h('span', {}, ['']), qHead, h('span', { class: 'coulomb-table__head' }, ['x (cm)']), h('span', { class: 'coulomb-table__head' }, ['y (cm)'])])
    ].concat(rows.map(function (r) { return r.node; })));
    var aIn = UI.input({ label: 'Tu Fx (N)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var bIn = UI.input({ label: 'Tu Fy (N)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var hint = h('p', { class: 'lab-field__hint' }, ['Con signo. Si es muy chica, usa la e: 2.1e-5 es 2.1 × 10⁻⁵.']);
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(520, 430, 'Cargas en una cuadrícula en centímetros, cada fuerza sobre la carga objetivo y la fuerza neta');
    svg.classList.add('coulomb-board');

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        h('div', { class: 'lab-row' }, [nSel.node, uSel.node]), table,
        h('div', { class: 'lab-row' }, [tSel.node, mSel.node]),
        h('div', { class: 'lab-row' }, [aIn.node, bIn.node]), hint,
        h('div', { class: 'lab-buttons' }, [run]), note, verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Arrastra las cargas (cuadrícula en cm)']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--aux sw--dashed' }), 'cada fuerza']),
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'fuerza neta']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu fuerza'])
        ]),
        facts
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    [aIn.input, bIn.input].forEach(function (inp) { inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } }); });
    nSel.input.addEventListener('change', function () { count = +nSel.input.value + 2; syncRows(); reset(); });
    uSel.input.addEventListener('change', function () { syncRows(); reset(); });
    tSel.input.addEventListener('change', function () { target = +tSel.input.value; reset(); });
    mSel.input.addEventListener('change', function () { syncMode(); reset(); });

    function unit() { return uSel.input.value === '1' ? 'nC' : 'uC'; }
    function active() { return charges.slice(0, count); }
    function syncRows() {
      rows.forEach(function (r, i) { r.node.hidden = i >= count; });
      Array.prototype.forEach.call(tSel.input.options, function (o, i) { o.disabled = i >= count; o.hidden = i >= count; });
      if (target >= count) { target = 0; tSel.input.value = '0'; }
      qHead.textContent = 'q (' + (unit() === 'nC' ? 'nC' : 'μC') + ')';
    }
    function syncMode() {
      var polar = mSel.input.value === '1';
      aIn.node.querySelector('label').textContent = polar ? 'Tu |F| (N)' : 'Tu Fx (N)';
      bIn.node.querySelector('label').textContent = polar ? 'Tu θ (° desde +x)' : 'Tu Fy (N)';
      hint.textContent = polar ? 'θ en grados desde +x, antihorario (0° a 360°). Si |F| es muy chica, usa la e: 2.1e-5.' : 'Con signo. Si es muy chica, usa la e: 2.1e-5 es 2.1 × 10⁻⁵.';
    }
    function occupied(i, x, y) { return charges.some(function (c, j) { return j !== i && j < count && c.x === x && c.y === y; }); }
    function readRow(i) {
      var r = rows[i], q = parseFloat(r.q.value), x = Math.round(parseFloat(r.x.value)), y = Math.round(parseFloat(r.y.value));
      if (isFinite(q)) charges[i].q = q;
      if (isFinite(x) && isFinite(y)) {
        x = Math.max(X0, Math.min(X1, x)); y = Math.max(Y0, Math.min(Y1, y));
        if (!occupied(i, x, y)) { charges[i].x = x; charges[i].y = y; }
      }
      r.q.value = String(charges[i].q); r.x.value = String(charges[i].x); r.y.value = String(charges[i].y);
      refresh();
    }
    function writeRow(i) { rows[i].x.value = String(charges[i].x); rows[i].y.value = String(charges[i].y); }
    // Al cambiar el escenario se borra la respuesta: ya no corresponde.
    function reset() { student = null; verdict.hidden = true; note.textContent = ''; draw(); }
    function refresh() { if (student) check(); else draw(); }

    function readStudent() {
      var a = parseFloat(aIn.input.value), b = parseFloat(bIn.input.value);
      if (!isFinite(a) || !isFinite(b)) return null;
      if (mSel.input.value === '1') return vec(a * Math.cos(b / DEG), a * Math.sin(b / DEG));
      return vec(a, b);
    }

    function check() {
      var st = readStudent();
      if (!st) { student = null; UI.verdict(verdict, 'bad', 'Escribe tus dos números', 'Faltan ' + (mSel.input.value === '1' ? '|F| y θ' : 'Fx y Fy') + ' de la fuerza neta sobre q' + (target + 1) + '.'); draw(); return; }
      student = st;
      var kind = diagnose(active(), target, unit(), st);
      var msg = MSG[kind] || MSG.bad;
      UI.verdict(verdict, kind === 'ok' ? 'ok' : kind === 'bad' ? 'bad' : 'warn', msg[0], msg[1]);
      draw();
    }

    /* ---------- Dibujo ---------- */
    var plot = null;
    function add(tag, attrs, txt) {
      if (!UI.svgOk(attrs)) return null;
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (txt != null) n.textContent = txt;
      svg.lastChild.appendChild(n);
      return n;
    }
    // Flecha en pantalla desde (px, py) con desplazamiento (dx, dy) en px; guarda puntos para las etiquetas.
    function arrowPx(px, py, dx, dy, cls, w, dash, pts) {
      var L = Math.hypot(dx, dy);
      if (!(L > 1.5)) return;
      var ux = dx / L, uy = dy / L, hh = Math.min(13, L * 0.45), ex = px + dx, ey = py + dy;
      var clip = svg.querySelector('clipPath');   // el recorte de LabPlot: nada se sale de la gráfica
      add('path', { class: cls, fill: 'none', 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': dash,
        'clip-path': clip ? 'url(#' + clip.id + ')' : null,
        d: 'M' + px.toFixed(1) + ' ' + py.toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
          'M' + (ex - ux * hh - uy * hh * 0.55).toFixed(1) + ' ' + (ey - uy * hh + ux * hh * 0.55).toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
          'L' + (ex - ux * hh + uy * hh * 0.55).toFixed(1) + ' ' + (ey - uy * hh - ux * hh * 0.55).toFixed(1) });
      for (var t = 0; t <= 1.0001; t += 0.05) pts.push([px + dx * t, py + dy * t]);
    }

    function draw() {
      var list = active(), unitNow = unit();
      plot = window.LabPlot(svg, { x: [X0 - 0.6, X1 + 0.6], y: [Y0 - 0.6, Y1 + 0.6], equal: true });
      plot.clear(); plot.grid(); plot.axes();
      var px = function (c) { return plot.X(c.x); }, py = function (c) { return plot.Y(c.y); };
      var pts = [], tr = net(toSI(list, unitNow), target);
      var tc = list[target], tx = px(tc), ty = py(tc);
      // Escala de las flechas: la mayor fuerza real mide ~3 cm de la cuadrícula.
      var maxF = Math.max.apply(null, [tr.mag].concat(tr.parts.map(function (p) { return p.mag; })).filter(isFinite));
      var cmPx = plot.X(1) - plot.X(0), k = maxF > 0 ? 3 * cmPx / maxF : 0;
      // Espacio libre (px) desde la carga objetivo hasta el borde de la gráfica en la dirección (dx, dy).
      var BX = [46, 506], BY = [14, 400];
      function room(dx, dy) {
        var L = Math.hypot(dx, dy), t = Infinity;
        if (!(L > 0)) return Infinity;
        var ux = dx / L, uy = dy / L;
        if (ux > 1e-9) t = Math.min(t, (BX[1] - tx) / ux); else if (ux < -1e-9) t = Math.min(t, (BX[0] - tx) / ux);
        if (uy > 1e-9) t = Math.min(t, (BY[1] - ty) / uy); else if (uy < -1e-9) t = Math.min(t, (BY[0] - ty) / uy);
        return Math.max(0, t - 4);
      }
      // Si la carga está cerca del borde, la escala baja para que ninguna flecha se salga (con un mínimo legible).
      if (isFinite(tr.mag) && k > 0) {
        [tr].concat(tr.parts).forEach(function (p) { if (p.mag > 0) k = Math.min(k, room(p.x, -p.y) / p.mag); });
        k = Math.max(k, 1.2 * cmPx / maxF);
      }
      if (isFinite(tr.mag)) {
        tr.parts.forEach(function (p) { arrowPx(tx, ty, p.x * k, -p.y * k, 'aux', 2.5, '6 5', pts); });
        arrowPx(tx, ty, tr.x * k, -tr.y * k, 'ref', 4, null, pts);
        if (student) {
          var sx = student.x * k, sy = -student.y * k, sl = Math.hypot(sx, sy), cap = Math.min(4.5 * cmPx, room(sx, sy));
          if (sl > cap) { sx *= cap / sl; sy *= cap / sl; }
          if (!(k > 0)) { sx = 0; sy = 0; }
          arrowPx(tx, ty, sx, sy, 'student', 3, '7 5', pts);
        }
      }
      // Cargas: positiva roja con «+», negativa azul con «−»; la objetivo con un anillo.
      list.forEach(function (c, i) {
        var cx = px(c), cy = py(c);
        var rr = i === target ? 25 : 19;
        for (var a = 0; a < 6.3; a += 0.3) pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
        if (i === target) add('circle', { cx: cx, cy: cy, r: 24, class: 'trace', fill: 'none', 'stroke-width': 2, 'stroke-dasharray': '4 4' });
        var g = add('g', { class: 'coulomb-charge', 'data-i': i, tabindex: '-1' });
        if (!g) return;
        var circ = document.createElementNS(NS, 'circle');
        circ.setAttribute('cx', cx); circ.setAttribute('cy', cy); circ.setAttribute('r', 17);
        circ.setAttribute('class', c.q > 0 ? 'box-err' : c.q < 0 ? 'box-aux' : 'box-trace');
        g.appendChild(circ);
        var sign = document.createElementNS(NS, 'text');
        sign.setAttribute('x', cx); sign.setAttribute('y', cy + 7); sign.setAttribute('class', 'ann'); sign.setAttribute('text-anchor', 'middle'); sign.setAttribute('font-size', 21);
        sign.textContent = c.q > 0 ? '+' : c.q < 0 ? '−' : '0';
        g.appendChild(sign);
        var hit = document.createElementNS(NS, 'circle');
        hit.setAttribute('cx', cx); hit.setAttribute('cy', cy); hit.setAttribute('r', 26); hit.setAttribute('class', 'coulomb-hit');
        g.appendChild(hit);
      });
      // Nombre de cada carga donde no tape flechas ni otras cargas.
      list.forEach(function (c, i) {
        var cx = px(c), cy = py(c), name = 'q' + (i + 1);
        var cands = [[0, -33], [32, -26], [-32, -26], [32, 36], [-32, 36], [0, 46], [44, 6], [-44, 6]];
        var pick = cands[0];
        for (var j = 0; j < cands.length; j++) {
          var lx = cx + cands[j][0], ly = cy + cands[j][1], hw = 14;
          if (lx - hw < 48 || lx + hw > 514 || ly - 16 < 4 || ly + 4 > 398) continue;
          var hit = pts.some(function (p) { return p[0] > lx - hw - 3 && p[0] < lx + hw + 3 && p[1] > ly - 17 && p[1] < ly + 5; });
          if (!hit) { pick = cands[j]; break; }
        }
        add('text', { x: cx + pick[0], y: cy + pick[1], class: 'ann', 'text-anchor': 'middle', 'font-size': 17 }, name);
        pts.push([cx + pick[0], cy + pick[1] - 6]);
      });

      facts.innerHTML = '';
      var uName = unitNow === 'nC' ? 'nC' : 'μC';
      var rowsOut = [];
      if (!isFinite(tr.mag)) rowsOut.push(['aviso', 'dos cargas en el mismo punto']);
      else {
        tr.parts.forEach(function (p) {
          rowsOut.push(['F de q' + (p.from + 1) + ' sobre q' + (target + 1), '(' + sci(p.x) + ', ' + sci(p.y) + ') N']);
        });
        rowsOut.push(['F neta (Fx, Fy)', '(' + sci(tr.x) + ', ' + sci(tr.y) + ') N']);
        rowsOut.push(['|F| y θ', sci(tr.mag) + ' N a ' + (tr.mag > 0 ? tr.ang.toFixed(1) : '—') + '°']);
        rowsOut.push(['cargas', list.map(function (c, i) { return 'q' + (i + 1) + ' = ' + (c.q > 0 ? '+' : '') + String(c.q).replace('-', '−') + ' ' + uName; }).join(', ')]);
      }
      rowsOut.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    /* ---------- Arrastre (ratón, pluma o dedo sobre una carga) ---------- */
    function toCm(e) {
      var m = svg.getScreenCTM();
      if (!m || !plot) return null;
      var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      var q = p.matrixTransform(m.inverse());
      var sx = plot.X(1) - plot.X(0), sy = plot.Y(1) - plot.Y(0);
      return { x: (q.x - plot.X(0)) / sx, y: (q.y - plot.Y(0)) / sy };
    }
    svg.addEventListener('pointerdown', function (e) {
      var g = e.target.closest ? e.target.closest('.coulomb-charge') : null;
      if (!g) return;
      drag = +g.getAttribute('data-i');
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
      e.preventDefault();
    });
    svg.addEventListener('pointermove', function (e) {
      if (drag === null) return;
      var p = toCm(e);
      if (!p) return;
      var x = Math.max(X0, Math.min(X1, Math.round(p.x))), y = Math.max(Y0, Math.min(Y1, Math.round(p.y)));
      if ((x !== charges[drag].x || y !== charges[drag].y) && !occupied(drag, x, y)) {
        charges[drag].x = x; charges[drag].y = y; writeRow(drag); refresh();
      }
    });
    function end() { drag = null; }
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);

    // Ejemplo cargado: un compañero no convirtió los centímetros a metros.
    (function loadExample() {
      syncRows(); syncMode();
      var ex = s.example || 'cm';
      var m = mistakes(active(), target, unit()), tr = net(toSI(active(), unit()), target);
      // addMags: la magnitud es la suma de magnitudes y la dirección, la real.
      var v = ex === 'addMags' ? vec(m.addMags * Math.cos(tr.ang / DEG), m.addMags * Math.sin(tr.ang / DEG)) : m[ex] || m.cm;
      if (mSel.input.value === '1') { aIn.input.value = Number(v.mag.toPrecision(4)).toString(); bIn.input.value = v.ang.toFixed(1); }
      else { aIn.input.value = Number(v.x.toPrecision(4)).toString(); bIn.input.value = Number(v.y.toPrecision(4)).toString(); }
    })();
    check();
    note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Ves el error? Mueve las cargas o cambia sus valores y escribe tu fuerza.';
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
