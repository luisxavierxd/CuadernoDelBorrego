/* =====================================================================
   Lab field-lines (Física 2 · S03): líneas de campo en vivo.
   Modo «cargas»: cargas puntuales arrastrables (agregar, quitar, signo y
   magnitud), líneas de campo trazadas con RK4 sobre la dirección de E y un
   punto de prueba P arrastrable con su vector E. Reto: el alumno escribe
   Ex y Ey en P y el lab lo compara.
   Modo «placas»: un electrón (o protón) entra horizontal entre dos placas
   con campo uniforme; el alumno predice la deflexión a la salida.
   Errores típicos que detecta:
     cm        usó centímetros como si fueran metros (E sale 10⁴ veces menor)
     noSquare  k q / r en lugar de k q / r²
     noSign    trató todas las cargas como positivas
     reversed  el vector apunta al revés
     signX/Y   un componente con el signo cambiado
     addMags   sumó magnitudes en lugar de vectores
     noHalf, noSquareT, otherMass  (placas)
   LabMath.efield trabaja en SI: cargas en C, posiciones en m.
   ===================================================================== */
(function () {
  var K = 8.99e9, E_CH = 1.60e-19, M_E = 9.11e-31, M_P = 1.67e-27;
  var RAD = Math.PI / 180, DEG = 180 / Math.PI;

  /* ------------------------- Matemática pura ------------------------- */
  function norm360(a) { a = a % 360; return a < 0 ? a + 360 : a; }
  // Campo de una carga puntual q en (sx, sy) evaluado en (px, py): E = k q r̂ / r^pow.
  function pointField(q, sx, sy, px, py, pow) {
    var dx = px - sx, dy = py - sy, r = Math.hypot(dx, dy);
    if (r < 1e-12) return { x: NaN, y: NaN };
    var m = K * q / Math.pow(r, pow == null ? 2 : pow);
    return { x: m * dx / r, y: m * dy / r };
  }
  // charges: [{ q, x, y }]. opts.pow (2 por omisión), opts.abs (ignorar signos).
  function field(charges, px, py, opts) {
    opts = opts || {};
    var x = 0, y = 0;
    charges.forEach(function (c) {
      var e = pointField(opts.abs ? Math.abs(c.q) : c.q, c.x, c.y, px, py, opts.pow);
      x += e.x; y += e.y;
    });
    return { x: x, y: y, mag: Math.hypot(x, y), ang: norm360(Math.atan2(y, x) * DEG) };
  }
  // Fuerza sobre una carga de prueba q0: F = q0 E.
  function force(q0, charges, px, py) {
    var e = field(charges, px, py);
    return { x: q0 * e.x, y: q0 * e.y, mag: Math.abs(q0) * e.mag };
  }
  function sumMags(charges, px, py) {
    return charges.reduce(function (s, c) { return s + K * Math.abs(c.q) / (Math.pow(c.x - px, 2) + Math.pow(c.y - py, 2)); }, 0);
  }
  // Resultados típicos equivocados (vectores {x, y, mag}; addMags es un número).
  function mistakes(charges, px, py) {
    var e = field(charges, px, py);
    return {
      cm: { x: e.x / 1e4, y: e.y / 1e4, mag: e.mag / 1e4 },
      noSquare: field(charges, px, py, { pow: 1 }),
      noSign: field(charges, px, py, { abs: true }),
      reversed: { x: -e.x, y: -e.y, mag: e.mag },
      signX: { x: -e.x, y: e.y, mag: e.mag },
      signY: { x: e.x, y: -e.y, mag: e.mag },
      addMags: sumMags(charges, px, py)
    };
  }
  // student: { x, y } (Ex, Ey en N/C). tol relativa a |E|.
  function diagnose(charges, px, py, student, tol) {
    tol = tol || 0.02;
    if (!student || !isFinite(student.x) || !isFinite(student.y)) return 'bad';
    var e = field(charges, px, py), m = mistakes(charges, px, py);
    var near = function (a, b) { return Math.hypot(a.x - b.x, a.y - b.y) <= tol * Math.max(Math.hypot(b.x, b.y), 1e-12); };
    var apart = function (a) { return !near(a, e); };
    if (near(student, e)) return 'ok';
    var keys = ['cm', 'noSquare', 'noSign', 'reversed', 'signX', 'signY'];
    for (var i = 0; i < keys.length; i++) {
      var w = m[keys[i]];
      if (apart(w) && near(student, w)) return keys[i];
    }
    var sm = Math.hypot(student.x, student.y);
    var sameDir = sm > 0 && Math.abs(Math.atan2(student.y, student.x) - Math.atan2(e.y, e.x)) < 2 * RAD;
    if (Math.abs(sm - m.addMags) <= tol * m.addMags && Math.abs(m.addMags - e.mag) > tol * e.mag) return 'addMags';
    if (Math.abs(sm - e.mag) <= tol * e.mag) return 'magOk';
    if (sameDir) return 'dirOk';
    return 'bad';
  }

  // Punto sobre el eje (cargas en x1 y x2) donde E = 0; null si no existe (cargas opuestas e iguales).
  function nullPoint(q1, x1, q2, x2) {
    var a = Math.sqrt(Math.abs(q1)), b = Math.sqrt(Math.abs(q2));
    if (q1 === 0 || q2 === 0) return null;
    if (q1 * q2 > 0) return (b * x1 + a * x2) / (a + b);       // mismos signos: entre las dos
    if (Math.abs(a - b) < 1e-15 * (a + b)) return null;        // dipolo: solo en el infinito
    return (b * x1 - a * x2) / (b - a);                        // signos opuestos: afuera, junto a la menor
  }

  /* ---------- Líneas de campo ----------
     Se trazan con RK4 sobre la dirección unitaria de E (paso adaptado a la distancia a la
     carga más cercana). Salen de las positivas; si sobra carga negativa, sus líneas se trazan
     hacia atrás desde ellas. El número de líneas es proporcional a |q| (opts.perUnit por unidad).
     Unidades libres: la forma de las líneas no depende de k. */
  function unitDir(charges, x, y) {
    var ex = 0, ey = 0;
    for (var i = 0; i < charges.length; i++) {
      var c = charges[i], dx = x - c.x, dy = y - c.y, r2 = dx * dx + dy * dy, r = Math.sqrt(r2);
      if (r < 1e-12) return null;
      var m = c.q / (r2 * r);
      ex += m * dx; ey += m * dy;
    }
    var L = Math.hypot(ex, ey);
    return L > 0 ? [ex / L, ey / L, L] : null;
  }
  function trace(charges, x, y, dir, box, o) {
    var pts = [[x, y]], to = -1;
    for (var n = 0; n < o.maxSteps; n++) {
      var dmin = Infinity;
      charges.forEach(function (c) { dmin = Math.min(dmin, Math.hypot(x - c.x, y - c.y)); });
      var h = Math.max(o.hMin, Math.min(o.hMax, 0.25 * dmin));
      var f = function (px, py) { var u = unitDir(charges, px, py); return u ? [dir * u[0], dir * u[1]] : null; };
      var k1 = f(x, y); if (!k1) break;
      var k2 = f(x + h / 2 * k1[0], y + h / 2 * k1[1]); if (!k2) break;
      var k3 = f(x + h / 2 * k2[0], y + h / 2 * k2[1]); if (!k3) break;
      var k4 = f(x + h * k3[0], y + h * k3[1]); if (!k4) break;
      var nx = x + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
      var ny = y + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      // Sin avance real: cayó en un punto nulo.
      if (Math.hypot(nx - x, ny - y) < h * 0.2) break;
      x = nx; y = ny; pts.push([x, y]);
      var hit = -1;
      for (var j = 0; j < charges.length; j++) if (Math.hypot(x - charges[j].x, y - charges[j].y) < o.rStop) { hit = j; break; }
      if (hit >= 0) { to = hit; break; }
      if (x < box.x0 - o.margin || x > box.x1 + o.margin || y < box.y0 - o.margin || y > box.y1 + o.margin) break;
    }
    return { pts: pts, to: to };
  }
  function angleOf(c, p) { return Math.atan2(p[1] - c.y, p[0] - c.x); }
  function angDist(a, b) { var d = Math.abs(a - b) % (2 * Math.PI); return Math.min(d, 2 * Math.PI - d); }
  function lines(charges, box, opts) {
    var o = Object.assign({ perUnit: 5, rStart: 0.6, rStop: 0.55, hMin: 0.03, hMax: 0.25, maxSteps: 700, margin: 1 }, opts || {});
    var out = [], arrivals = charges.map(function () { return []; });
    function seeds(i, count, avoid) {
      var c = charges[i], base = (i * 0.37) % (2 * Math.PI / Math.max(count, 1));
      var cand = [];
      var total = count + avoid.length;
      for (var k = 0; k < total; k++) cand.push(base + 2 * Math.PI * k / total);
      // Quita los candidatos más cercanos a las líneas que ya llegan.
      avoid.forEach(function (a) {
        var best = -1, bd = Infinity;
        cand.forEach(function (t, idx) { var d = angDist(t, a); if (d < bd) { bd = d; best = idx; } });
        if (best >= 0) cand.splice(best, 1);
      });
      return cand.slice(0, count).map(function (t) { return [c.x + o.rStart * Math.cos(t), c.y + o.rStart * Math.sin(t), t]; });
    }
    charges.forEach(function (c, i) {
      if (!(c.q > 0)) return;
      var n = Math.max(1, Math.round(o.perUnit * c.q));
      seeds(i, n, []).forEach(function (s) {
        var t = trace(charges, s[0], s[1], 1, box, o);
        out.push({ pts: t.pts, from: i, to: t.to });
        if (t.to >= 0) arrivals[t.to].push(angleOf(charges[t.to], t.pts[t.pts.length - 1]));
      });
    });
    charges.forEach(function (c, i) {
      if (!(c.q < 0)) return;
      var n = Math.max(1, Math.round(o.perUnit * -c.q)) - arrivals[i].length;
      if (n <= 0) return;
      var c = charges[i], gap = 2 * Math.PI / Math.max(1, Math.round(o.perUnit * -c.q));
      var used = arrivals[i].slice();
      seeds(i, n, arrivals[i]).forEach(function (s) {
        // Si vuelve a una positiva (que ya tiene todas sus líneas), prueba otros ángulos,
        // del más cercano al más lejano, sin pegarse a las líneas que ya hay.
        var tries = [];
        for (var k = 0; k < 72; k++) tries.push(s[2] + (k % 2 ? -1 : 1) * Math.ceil(k / 2) * Math.PI / 36);
        for (var j = 0; j < tries.length; j++) {
          var a = tries[j];
          if (j > 0 && used.some(function (u) { return angDist(u, a) < gap / 3; })) continue;
          var t = trace(charges, c.x + o.rStart * Math.cos(a), c.y + o.rStart * Math.sin(a), -1, box, o);
          if (t.to >= 0) continue;
          used.push(a);
          // Se guarda en el sentido del campo: de afuera hacia la carga negativa.
          out.push({ pts: t.pts.slice().reverse(), from: -1, to: i });
          return;
        }
      });
    });
    return out;
  }

  /* ---------- Carga en un campo uniforme (placas) ----------
     p: { q (C), m (kg), E (N/C, módulo), v0 (m/s), L (m) }. El campo apunta de la placa + a la −;
     y es la deflexión (m) a la salida (mm, en milímetros), positiva hacia la placa + (la que atrae a una carga negativa). */
  function plates(p) {
    var F = Math.abs(p.q) * p.E, a = F / p.m, t = p.L / p.v0, y = 0.5 * a * t * t, vy = a * t;
    return { F: F, a: a, t: t, y: y, mm: y * 1000, vy: vy, ang: Math.atan2(vy, p.v0) * DEG, towardPlus: p.q < 0 };
  }
  // Posición (x, y) a los t segundos dentro de las placas.
  function platePos(p, t) { var a = Math.abs(p.q) * p.E / p.m; return { x: p.v0 * t, y: 0.5 * a * t * t }; }
  // Tiempo en que choca con una placa a distancia half del centro (Infinity si sale antes).
  function hitTime(p, half) {
    var r = plates(p), th = Math.sqrt(2 * half / r.a);
    return th < r.t ? th : Infinity;
  }
  function platesMistakes(p) {
    var r = plates(p), other = p.m === M_E ? M_P : M_E;
    return { noHalf: 2 * r.y, noSquare: 0.5 * r.a * r.t, otherMass: r.y * p.m / other };
  }
  // y: deflexión del alumno (m, positiva); towardPlus: true si dijo «hacia la placa +».
  function diagnosePlates(p, y, towardPlus, tol) {
    tol = tol || 0.02;
    if (!isFinite(y)) return 'bad';
    var r = plates(p), m = platesMistakes(p);
    var near = function (a, b) { return Math.abs(a - b) <= tol * Math.abs(b); };
    if (near(y, r.y)) return towardPlus === r.towardPlus ? 'ok' : 'side';
    var keys = ['noHalf', 'noSquare', 'otherMass'];
    for (var i = 0; i < keys.length; i++) if (!near(m[keys[i]], r.y) && near(y, m[keys[i]])) return keys[i];
    if (near(y, r.y * 100) || near(y, r.y * 1000)) return 'units';
    return 'bad';
  }

  window.LabMath.efield = {
    K: K, e: E_CH, me: M_E, mp: M_P,
    pointField: pointField, field: field, force: force, sumMags: sumMags, mistakes: mistakes, diagnose: diagnose,
    nullPoint: nullPoint, unitDir: unitDir, lines: lines,
    plates: plates, platePos: platePos, hitTime: hitTime, platesMistakes: platesMistakes, diagnosePlates: diagnosePlates
  };

  /* ------------------------------ UI ------------------------------ */
  var MSG = {
    ok: ['Tu campo coincide', 'Ex y Ey correctos (con 2 % de tolerancia).'],
    cm: ['Usaste centímetros como si fueran metros', 'Convierte antes de calcular: 3 cm = 0.03 m. Con r en cm, r² sale 10 000 veces más grande y E, 10 000 veces más chico.'],
    noSquare: ['Te faltó elevar r al cuadrado', 'El campo de una carga puntual es E = k|q|/r²: si alejas P al doble, E baja a la cuarta parte.'],
    noSign: ['Trataste todas las cargas como positivas', 'El campo de una carga negativa apunta HACIA ella. Cambia el sentido de su vector antes de sumar.'],
    reversed: ['Tu vector apunta al revés', 'E apunta alejándose de las cargas positivas y hacia las negativas. Revisa el sentido de r̂ (de la carga hacia P).'],
    signX: ['Revisa el signo de Ex', 'Ey está bien. Fíjate si cada vector apunta a la izquierda o a la derecha antes de sumar.'],
    signY: ['Revisa el signo de Ey', 'Ex está bien. Fíjate si cada vector apunta arriba o abajo antes de sumar.'],
    addMags: ['Sumaste magnitudes, no vectores', '|E₁ + E₂| = |E₁| + |E₂| solo si apuntan al mismo lado. Suma por componentes.'],
    magOk: ['La magnitud está bien; la dirección no', 'Descompón cada vector con su ángulo y suma las x y las y por separado.'],
    dirOk: ['La dirección está bien; la magnitud no', 'Revisa k = 8.99 × 10⁹, la conversión de nC a C y de cm a m.'],
    bad: ['Tu campo no coincide', 'Para cada carga: r (en m), |E| = k|q|/r², dirección de r̂ y luego suma componentes. Compara con la flecha del campo real.']
  };
  var MSG_P = {
    ok: ['Tu deflexión coincide', 'Magnitud y lado correctos.'],
    side: ['La magnitud está bien; el lado no', 'Una carga negativa se va hacia la placa positiva (la fuerza es opuesta a E). Una positiva, hacia la negativa.'],
    noHalf: ['Te faltó el ½', 'Con aceleración constante y v₀y = 0: y = ½ a t², igual que en caída libre.'],
    noSquare: ['Te faltó elevar t al cuadrado', 'y = ½ a t² con t = L/v₀.'],
    otherMass: ['Usaste la masa de la otra partícula', 'mₑ = 9.11 × 10⁻³¹ kg y mₚ = 1.67 × 10⁻²⁷ kg. Con la misma fuerza, el electrón acelera unas 1800 veces más.'],
    units: ['Revisa las unidades', 'La respuesta va en milímetros: 1 m = 1000 mm.'],
    hit: ['La partícula choca con la placa', 'Con estos valores no alcanza a salir. Baja E, sube v₀ o acorta las placas.'],
    bad: ['Tu deflexión no coincide', 'Calcula a = |q|E/m, t = L/v₀ y luego y = ½ a t².']
  };
  var PRESETS = [
    { name: 'Una carga positiva', q: [[3, 0, 0]], P: [4, 3] },
    { name: 'Dipolo', q: [[2, -3, 0], [-2, 3, 0]], P: [0, 4] },
    { name: 'Dos cargas iguales', q: [[2, -3, 0], [2, 3, 0]], P: [0, 3] },
    { name: 'Positiva y negativa distintas', q: [[4, -3, 0], [-1, 3, 0]], P: [3, 4] },
    { name: 'Tres cargas', q: [[2, -4, -2], [-3, 0, 3], [1, 4, -2]], P: [0, -2] }
  ];
  var BOX = { x0: -10, x1: 10, y0: -6.5, y1: 6.5 };
  var GAP = 4;   // separación de las placas en cm

  function snap(v) { return Math.round(v * 2) / 2; }
  function fnum(v) { return String(v).replace('-', '−'); }
  function sci(v) {
    if (!isFinite(v)) return '—';
    if (Math.abs(v) < 1e-12) return '0';
    var ex = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, ex);
    if (Math.abs(m) >= 9.995) { m /= 10; ex += 1; }
    if (ex >= -2 && ex <= 4) return fnum(Number(v.toPrecision(4)).toString());
    return fnum(m.toFixed(3)) + ' × 10' + String(ex).split('').map(function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c] || (c === '-' ? '⁻' : c); }).join('');
  }

  window.Labs['field-lines'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, NS = 'http://www.w3.org/2000/svg';
    var start = cfg.start || {};
    var charges = [], P = { x: 4, y: 3 }, sel = 0, student = null, pStudent = null, raf = 0, revealed = false;

    /* ---------- Controles ---------- */
    var mode = UI.select({ label: 'Modo', options: ['Cargas puntuales', 'Electrón entre placas'] });
    var preset = UI.select({ label: 'Configuración', options: PRESETS.map(function (p) { return p.name; }) });
    var sign = UI.select({ label: 'Signo de la carga elegida', options: ['Positiva (+)', 'Negativa (−)'] });
    var mag = UI.slider({ label: 'Magnitud de la carga elegida', min: 1, max: 5, step: 1, value: 3, unit: 'nC' }, function () { setQ(); });
    var addP = UI.button('Agregar +', 'ghost', function () { addCharge(1); });
    var addN = UI.button('Agregar −', 'ghost', function () { addCharge(-1); });
    var del = UI.button('Quitar la elegida', 'ghost', removeCharge);
    var exIn = UI.input({ label: 'Tu Ex en P (N/C)', type: 'text', inputmode: 'decimal', mono: false });
    var eyIn = UI.input({ label: 'Tu Ey en P (N/C)', type: 'text', inputmode: 'decimal', mono: false });
    var run = UI.button('Comprobar', 'primary', function () { revealed = true; check(); });
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var part = UI.select({ label: 'Partícula', options: ['Electrón', 'Protón'] });
    var eS = UI.slider({ label: 'Campo E entre las placas', min: 0.5, max: 5, step: 0.5, value: 1, unit: '× 10³ N/C' }, refresh);
    var vS = UI.slider({ label: 'Rapidez de entrada', min: 2, max: 8, step: 0.5, value: 4, unit: '× 10⁶ m/s' }, refresh);
    var lS = UI.slider({ label: 'Largo de las placas L', min: 2, max: 8, step: 1, value: 5, unit: 'cm' }, refresh);
    var yIn = UI.input({ label: 'Tu deflexión a la salida (mm)', type: 'text', inputmode: 'decimal', mono: false });
    var side = UI.select({ label: 'Se desvía hacia', options: ['la placa +', 'la placa −'] });

    var chargeBox = h('div', { class: 'lab-controls' }, [
      preset.node, sign.node, mag.node,
      h('div', { class: 'lab-buttons' }, [addP, addN, del]),
      h('div', { class: 'lab-row' }, [exIn.node, eyIn.node])
    ]);
    var plateBox = h('div', { class: 'lab-controls', hidden: true }, [part.node, eS.node, vS.node, lS.node, h('div', { class: 'lab-row' }, [yIn.node, side.node])]);

    var svg = UI.svg(640, 440, 'Cargas puntuales con sus líneas de campo y el vector E en el punto P');
    svg.classList.add('lab-stage--drag');
    svg.setAttribute('tabindex', '0');
    var hint = h('p', { class: 'lab-note' }, ['Arrastra las cargas y el punto P (o elige uno y muévelo con las flechas del teclado). Medidas en cm.']);
    var legend = h('ul', { class: 'lab-legend' });
    var facts = h('dl', { class: 'lab-facts' });

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        mode.node, chargeBox, plateBox,
        h('div', { class: 'lab-buttons' }, [run]), note, verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['El campo en vivo']),
        svg, hint, legend, facts
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); revealed = true; check(); });
    [exIn.input, eyIn.input, yIn.input].forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); revealed = true; check(); } }); });

    function isPlates() { return mode.input.value === '1'; }
    function parse(s) {
      if (window.CBExercises) return window.CBExercises.parseNumber(s);
      return parseFloat(String(s).replace(/−/g, '-'));
    }
    function SI() { return charges.map(function (c) { return { q: c.q * 1e-9, x: c.x / 100, y: c.y / 100 }; }); }
    function syncSel() {
      var c = charges[sel];
      if (!c) return;
      sign.input.value = c.q < 0 ? '1' : '0';
      mag.set(Math.abs(c.q));
    }
    function loadPreset(i) {
      var p = PRESETS[i] || PRESETS[0];
      charges = p.q.map(function (a) { return { q: a[0], x: a[1], y: a[2] }; });
      P = { x: p.P[0], y: p.P[1] };
      sel = 0; syncSel(); clearStudent();
    }
    function clearStudent() { student = null; verdict.hidden = true; }
    function setQ() {
      var c = charges[sel];
      if (!c) return;
      c.q = (sign.input.value === '1' ? -1 : 1) * mag.get();
      refresh();
    }
    function free(x, y, skip) {
      return charges.every(function (c, i) { return i === skip || Math.hypot(c.x - x, c.y - y) >= 1.5; }) &&
        (skip === 'P' || Math.hypot(P.x - x, P.y - y) >= 1);
    }
    function addCharge(s) {
      if (charges.length >= 4) { note.textContent = 'Máximo 4 cargas: quita una antes de agregar otra.'; return; }
      var spots = [[0, 0], [-5, 3], [5, -3], [-5, -3], [5, 3], [0, -4], [0, 5], [-8, 0], [8, 0]];
      var at = spots.filter(function (p) { return free(p[0], p[1], -1); })[0] || [0, 0];
      charges.push({ q: s * 2, x: at[0], y: at[1] });
      sel = charges.length - 1; syncSel(); refresh();
    }
    function removeCharge() {
      if (charges.length <= 1) { note.textContent = 'Deja al menos una carga.'; return; }
      charges.splice(sel, 1);
      sel = Math.max(0, Math.min(sel, charges.length - 1)); syncSel(); refresh();
    }
    sign.input.addEventListener('change', setQ);
    preset.input.addEventListener('change', function () { revealed = false; loadPreset(+preset.input.value); loadExample(); check(); });
    mode.input.addEventListener('change', function () {
      var pl = isPlates();
      chargeBox.hidden = pl; plateBox.hidden = !pl;
      hint.hidden = pl;
      svg.setAttribute('aria-label', pl ? 'Placas paralelas con campo uniforme y la trayectoria de la partícula' : 'Cargas puntuales con sus líneas de campo y el vector E en el punto P');
      verdict.hidden = true; revealed = false;
      if (pl && pStudent === null) loadPlateExample();
      check();
    });
    part.input.addEventListener('change', refresh);
    side.input.addEventListener('change', function () { if (pStudent) check(); });

    /* ---------- Arrastre ---------- */
    var plot = null, drag = null;
    function toWorld(ev) {
      var m = svg.getScreenCTM();
      if (!m || !plot) return null;
      var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      var q = pt.matrixTransform(m.inverse());
      var x0 = plot.X(0), x1 = plot.X(1), y0 = plot.Y(0), y1 = plot.Y(1);
      return { x: (q.x - x0) / (x1 - x0), y: (q.y - y0) / (y1 - y0) };
    }
    function pick(w) {
      var best = null, bd = 0.9;
      charges.forEach(function (c, i) { var d = Math.hypot(c.x - w.x, c.y - w.y); if (d < bd) { bd = d; best = i; } });
      var dp = Math.hypot(P.x - w.x, P.y - w.y);
      if (dp < Math.min(bd, 0.9)) best = 'P';
      return best;
    }
    function moveTo(item, x, y) {
      x = Math.max(BOX.x0 + 0.5, Math.min(BOX.x1 - 0.5, snap(x)));
      y = Math.max(BOX.y0 + 0.5, Math.min(BOX.y1 - 0.5, snap(y)));
      if (item === 'P') { if (charges.every(function (c) { return Math.hypot(c.x - x, c.y - y) >= 1; })) { P.x = x; P.y = y; } }
      else if (charges[item] && free(x, y, item)) { charges[item].x = x; charges[item].y = y; }
    }
    svg.addEventListener('pointerdown', function (ev) {
      if (isPlates()) return;
      var w = toWorld(ev); if (!w) return;
      var it = pick(w);
      if (it === null) return;
      drag = it;
      if (it !== 'P') { sel = it; syncSel(); }
      try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* sin captura */ }
      ev.preventDefault();
      schedule();
    });
    svg.addEventListener('pointermove', function (ev) {
      if (drag === null) return;
      var w = toWorld(ev); if (!w) return;
      moveTo(drag, w.x, w.y); schedule();
    });
    function endDrag() { if (drag === null) return; drag = null; refresh(); }
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
    var kSel = 'P';
    svg.addEventListener('keydown', function (ev) {
      if (isPlates()) return;
      var d = { ArrowLeft: [-0.5, 0], ArrowRight: [0.5, 0], ArrowUp: [0, 0.5], ArrowDown: [0, -0.5] }[ev.key];
      if (ev.key === 'Tab' || !d && ev.key !== ' ') return;
      ev.preventDefault();
      if (ev.key === ' ') { kSel = kSel === 'P' ? 0 : (kSel + 1 < charges.length ? kSel + 1 : 'P'); if (kSel !== 'P') { sel = kSel; syncSel(); } draw(); return; }
      var it = kSel === 'P' ? P : charges[kSel];
      if (!it) { kSel = 'P'; it = P; }
      moveTo(kSel, it.x + d[0], it.y + d[1]); refresh();
    });
    function schedule() {
      if (raf) return;
      raf = (window.requestAnimationFrame || function (f) { return setTimeout(f, 16); })(function () { raf = 0; draw(); });
    }
    function refresh() { if (isPlates() ? pStudent : student) check(); else draw(); }

    /* ---------- Dibujo ---------- */
    function el(tag, attrs, text) {
      if (!UI.svgOk(attrs)) return null;
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (text != null) n.textContent = text;
      svg.querySelector('g.sketch').appendChild(n);
      return n;
    }
    function arrowPx(cls, x, y, dx, dy, w, head) {
      var L = Math.hypot(dx, dy);
      if (!(L > 2)) return;
      var ux = dx / L, uy = dy / L, hh = Math.min(head || 12, L * 0.45), ex = x + dx, ey = y + dy;
      el('path', { class: cls, fill: 'none', 'stroke-width': w || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        d: 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
          'M' + (ex - ux * hh - uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh + ux * hh * 0.6).toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
          'L' + (ex - ux * hh + uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh - ux * hh * 0.6).toFixed(1) });
    }
    // Largo de la flecha en px: crece con log|E| para que se vea con cualquier configuración.
    function arrowLen(m) { return Math.max(26, Math.min(120, 26 + 30 * Math.log10(1 + m / 1500))); }
    function drawVector(v, cls, w) {
      var m = Math.hypot(v.x, v.y);
      if (!(m > 0)) return null;
      var L = arrowLen(m), px = plot.X(P.x), py = plot.Y(P.y);
      arrowPx(cls, px, py, L * v.x / m, -L * v.y / m, w);
      return [L * v.x / m, -L * v.y / m];
    }

    function drawCharges() {
      plot = window.LabPlot(svg, { x: [BOX.x0, BOX.x1], y: [BOX.y0, BOX.y1], equal: true });
      plot.clear(); plot.grid(); plot.axes();
      var ls = lines(charges, BOX, { perUnit: 5 });
      ls.forEach(function (l) {
        plot.segments(l.pts.slice(1).map(function (p, i) { return [l.pts[i], p]; }), 'ref', 1.6);
        // Flecha de sentido a la mitad de la línea (si la mitad cae dentro del cuadro).
        var mid = Math.floor(l.pts.length / 2);
        if (l.pts.length > 6) {
          var a = l.pts[mid - 1], b = l.pts[mid + 1];
          if (a[0] > BOX.x0 && a[0] < BOX.x1 && a[1] > BOX.y0 && a[1] < BOX.y1) {
            var x = plot.X(l.pts[mid][0]), y = plot.Y(l.pts[mid][1]), dx = plot.X(b[0]) - plot.X(a[0]), dy = plot.Y(b[1]) - plot.Y(a[1]), L = Math.hypot(dx, dy) || 1;
            var ux = dx / L, uy = dy / L;
            el('path', { class: 'ref', fill: 'none', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
              d: 'M' + (x - 7 * ux - 4.5 * uy).toFixed(1) + ' ' + (y - 7 * uy + 4.5 * ux).toFixed(1) + 'L' + x.toFixed(1) + ' ' + y.toFixed(1) + 'L' + (x - 7 * ux + 4.5 * uy).toFixed(1) + ' ' + (y - 7 * uy - 4.5 * ux).toFixed(1) });
          }
        }
      });
      // Vector E real y el del alumno en P.
      var e = field(SI(), P.x / 100, P.y / 100);
      var dE = drawVector(e, 'error', 4);
      var dS = student && isFinite(student.x) && isFinite(student.y) ? drawVector(student, 'student', 3) : null;
      // Cargas: círculo con su valor dentro.
      charges.forEach(function (c, i) {
        var x = plot.X(c.x), y = plot.Y(c.y);
        if (i === sel) el('circle', { cx: x, cy: y, r: 21, class: 'axis', fill: 'none', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
        el('circle', { cx: x, cy: y, r: 15, class: c.q > 0 ? 'box-err' : 'box-aux' });
        el('text', { x: x, y: y + 5, class: 'ann', 'text-anchor': 'middle', 'font-size': 15 }, (c.q > 0 ? '+' : '−') + Math.abs(c.q));
      });
      // Punto P con su etiqueta del lado opuesto a las flechas.
      var px = plot.X(P.x), py = plot.Y(P.y);
      el('circle', { cx: px, cy: py, r: 7, class: 'dot-trace' });
      var ax = (dE ? dE[0] : 0) + (dS ? dS[0] : 0), ay = (dE ? dE[1] : 0) + (dS ? dS[1] : 0), am = Math.hypot(ax, ay) || 1;
      el('text', { x: px - 22 * ax / am, y: py - 22 * ay / am + 6, class: 'ann', 'text-anchor': 'middle', 'font-size': 18 }, 'P');

      legend.innerHTML = '';
      [['ref', 'líneas de campo'], ['error', 'E real en P'], ['student', 'tu E']].forEach(function (r) {
        legend.appendChild(h('li', {}, [h('i', { class: 'sw sw--' + r[0] }), r[1]]));
      });
      facts.innerHTML = '';
      charges.forEach(function (c, i) {
        facts.appendChild(h('dt', {}, ['q' + '₁₂₃₄'[i]]));
        facts.appendChild(h('dd', {}, [(c.q > 0 ? '+' : '−') + Math.abs(c.q) + ' nC en (' + fnum(c.x) + ', ' + fnum(c.y) + ') cm']));
      });
      facts.appendChild(h('dt', {}, ['P']));
      facts.appendChild(h('dd', {}, ['(' + fnum(P.x) + ', ' + fnum(P.y) + ') cm']));
      if (student && revealed) {
        [['Ex real', sci(e.x) + ' N/C'], ['Ey real', sci(e.y) + ' N/C'], ['|E| real', sci(e.mag) + ' N/C'], ['ángulo', UI.fmt(e.ang, 4) + '°']]
          .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
      }
    }

    function plateParams() {
      var el2 = part.input.value === '0';
      return { q: el2 ? -E_CH : E_CH, m: el2 ? M_E : M_P, E: eS.get() * 1e3, v0: vS.get() * 1e6, L: lS.get() / 100 };
    }
    function drawPlates() {
      var p = plateParams(), r = plates(p), Lc = lS.get(), half = GAP / 2;
      var up = r.towardPlus ? 1 : -1;        // la placa + está arriba
      plot = window.LabPlot(svg, { x: [-2, 10.5], y: [-4, 4], equal: true });
      plot.clear();
      var X = plot.X, Y = plot.Y;
      // Placas: rectángulo + arriba y − abajo.
      el('rect', { x: X(0), y: Y(half + 0.6), width: X(Lc) - X(0), height: Y(half) - Y(half + 0.6), class: 'box-err' });
      el('rect', { x: X(0), y: Y(-half), width: X(Lc) - X(0), height: Y(-half - 0.6) - Y(-half), class: 'box-aux' });
      for (var s = 0.5; s < Lc; s += 1) {
        el('text', { x: X(s), y: (Y(half + 0.6) + Y(half)) / 2 + 6, class: 'ann', 'text-anchor': 'middle', 'font-size': 17 }, '+');
        el('text', { x: X(s), y: (Y(-half) + Y(-half - 0.6)) / 2 + 6, class: 'ann', 'text-anchor': 'middle', 'font-size': 17 }, '−');
      }
      // Campo uniforme: flechas de la placa + a la −, en los huecos entre los signos.
      for (var f = 1; f < Lc; f += 1) {
        el('path', { class: 'aux', fill: 'none', 'stroke-width': 1.6, 'stroke-dasharray': '5 6', d: 'M' + X(f).toFixed(1) + ' ' + Y(half - 0.15).toFixed(1) + 'V' + Y(-half + 0.15).toFixed(1) });
        arrowPx('aux', X(f), Y(-half + 0.9), 0, Y(-half + 0.15) - Y(-half + 0.9), 1.6, 9);
      }
      el('text', { x: X(-0.4), y: Y(half + 0.3), class: 'ann', 'text-anchor': 'end', 'font-size': 17 }, 'E ↓');
      // Trayectoria: parábola dentro, recta fuera; se corta si choca.
      var th = hitTime(p, half / 100), tEnd = Math.min(r.t, th), d = '', n = 60;
      for (var i = 0; i <= n; i++) {
        var q = platePos(p, tEnd * i / n);
        d += (i ? 'L' : 'M') + X(q.x * 100).toFixed(1) + ' ' + Y(up * q.y * 100).toFixed(1);
      }
      var exitY = up * r.y * 100;
      if (!isFinite(th)) {
        var slope = up * r.vy / p.v0, xr = 10.3;
        d += 'L' + X(xr).toFixed(1) + ' ' + Y(Math.max(-3.9, Math.min(3.9, exitY + slope * (xr - Lc)))).toFixed(1);
      }
      el('path', { d: d, class: 'trace', fill: 'none', 'stroke-width': 3, 'stroke-linecap': 'round' });
      // Línea de entrada (sin desviar) como referencia.
      el('path', { d: 'M' + X(-1.6).toFixed(1) + ' ' + Y(0).toFixed(1) + 'H' + X(Lc + 2).toFixed(1), class: 'axis', fill: 'none', 'stroke-width': 1.2, 'stroke-dasharray': '3 6' });
      el('circle', { cx: X(0), cy: Y(0), r: 7, class: 'dot-trace' });
      arrowPx('trace', X(-1.6), Y(0) + 16, X(-0.3) - X(-1.6), 0, 2.5, 9);
      el('text', { x: X(-1.1), y: Y(0) + 38, class: 'ann', 'text-anchor': 'middle', 'font-size': 17 }, 'v₀');
      el('text', { x: X(-1.1), y: Y(0) - 12, class: 'ann', 'text-anchor': 'middle', 'font-size': 17 }, p.q < 0 ? 'e⁻' : 'p⁺');
      // Predicción del alumno: marca en la salida.
      if (pStudent && isFinite(pStudent.y) && !isFinite(th)) {
        var ys = (pStudent.plus ? 1 : -1) * Math.abs(pStudent.y) * 100;   // la placa + está arriba
        ys = Math.max(-half, Math.min(half, ys));
        el('path', { class: 'student', 'stroke-dasharray': 'none', 'stroke-width': 3, fill: 'none',
          d: 'M' + (X(Lc) - 7).toFixed(1) + ' ' + (Y(ys) - 7).toFixed(1) + 'l14 14M' + (X(Lc) + 7).toFixed(1) + ' ' + (Y(ys) - 7).toFixed(1) + 'l-14 14' });
      }
      legend.innerHTML = '';
      [['trace', 'trayectoria'], ['aux', 'campo E'], ['student', 'tu salida']].forEach(function (rw) {
        legend.appendChild(h('li', {}, [h('i', { class: 'sw sw--' + rw[0] }), rw[1]]));
      });
      facts.innerHTML = '';
      var rows = [['carga', (p.q < 0 ? '−' : '+') + '1.60 × 10⁻¹⁹ C'], ['masa', p.m === M_E ? '9.11 × 10⁻³¹ kg' : '1.67 × 10⁻²⁷ kg'],
        ['E', sci(p.E) + ' N/C'], ['v₀', sci(p.v0) + ' m/s'], ['L', Lc + ' cm (separación ' + GAP + ' cm)']];
      if (pStudent && revealed) rows.push(['a real', sci(r.a) + ' m/s²'], ['t real', sci(r.t) + ' s'], ['y real', isFinite(th) ? 'choca' : UI.fmt(r.y * 1000, 4) + ' mm']);
      rows.forEach(function (rw) { facts.appendChild(h('dt', {}, [rw[0]])); facts.appendChild(h('dd', {}, [rw[1]])); });
    }
    function draw() { if (isPlates()) drawPlates(); else drawCharges(); }

    /* ---------- Revisar ---------- */
    function check() {
      if (isPlates()) {
        var p = plateParams(), r = plates(p);
        pStudent = { y: parse(yIn.input.value) / 1000, plus: side.input.value === '0' };
        if (isFinite(hitTime(p, GAP / 200))) { UI.verdict(verdict, 'warn', MSG_P.hit[0], MSG_P.hit[1]); draw(); return; }
        var k = diagnosePlates(p, pStudent.y, pStudent.plus);
        var msg = MSG_P[k] || MSG_P.bad;
        var err = (pStudent.y - r.y) / r.y * 100;
        UI.verdict(verdict, k === 'ok' ? 'ok' : k === 'bad' ? 'bad' : 'warn', msg[0],
          msg[1] + (isFinite(err) && k !== 'ok' && k !== 'side' ? ' Tu error: ' + (err > 0 ? '+' : '') + err.toFixed(1) + ' %.' : ''));
        draw();
        return;
      }
      student = { x: parse(exIn.input.value), y: parse(eyIn.input.value) };
      var kind = diagnose(SI(), P.x / 100, P.y / 100, student);
      var m = MSG[kind] || MSG.bad;
      UI.verdict(verdict, kind === 'ok' ? 'ok' : kind === 'bad' ? 'bad' : 'warn', m[0], m[1]);
      draw();
    }

    // Ejemplos cargados: la respuesta de un compañero con un error típico.
    function plain(v) {
      if (Math.abs(v) < 1e-12) return '0';
      return Math.abs(v) >= 1e4 || Math.abs(v) < 1e-2 ? v.toExponential(3) : String(Number(v.toPrecision(4)));
    }
    function loadExample() {
      var w = mistakes(SI(), P.x / 100, P.y / 100).cm;
      exIn.input.value = plain(w.x);
      eyIn.input.value = plain(w.y);
      note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Ves el error? Mueve las cargas o P y escribe tu Ex y tu Ey.';
    }
    function loadPlateExample() {
      var p = plateParams();
      yIn.input.value = UI.fmt(platesMistakes(p).noHalf * 1000, 3);
      side.input.value = '0';
      note.textContent = 'Ejemplo cargado: un compañero predijo esta deflexión. ¿Ves el error? Cambia los valores y escribe la tuya.';
    }

    var si = PRESETS.map(function (p) { return p.name; }).indexOf(start.preset);
    preset.input.value = String(si >= 0 ? si : 0);
    loadPreset(si >= 0 ? si : 0);
    loadExample();
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
