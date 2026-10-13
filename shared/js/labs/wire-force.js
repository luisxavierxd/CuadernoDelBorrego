/* =====================================================================
   Lab wire-force (Física 3 · S04): fuerza magnética sobre un conductor, F = I L × B.
   Vista desde arriba de la hoja (x a la derecha, y hacia arriba, z saliendo).
   Dos modos:
     recto    un tramo de largo L con corriente I, girado un ángulo θ; el campo
              uniforme va a la derecha (en la hoja) o entra a la hoja. La fuerza
              sale o entra de la hoja (B en la hoja) o queda en la hoja (B entrando).
     doblado  un alambre con forma (semicírculo, L, zigzag) en un campo que entra a
              la hoja: la suma de las fuerzas de todos los trocitos es la del
              segmento recto entre los extremos.
   Unidades: I en A, L en cm, B en mT → F en mN con el factor 10⁻² (A·cm·mT = 10⁻⁵ N).
   Reto: magnitud (mN) y dirección (±x, ±y, ±z). El «casi»:
     reversed  dirección al revés (L × B al revés o B × L)
     cos       usó cos θ en lugar de sin θ
     cm        dejó L en cm (×100)
     mT        dejó B en mT (×1000)
     path      en el alambre doblado usó el largo del camino y no la cuerda
   ===================================================================== */
(function () {
  var RAD = Math.PI / 180;
  /* ------------------------- Matemática pura ------------------------- */
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { return Math.hypot(a[0], a[1], a[2]); }
  function pack(F) { return { x: F[0], y: F[1], z: F[2], mag: norm(F), vec: F }; }
  // F = I L × B en cualquier juego coherente de unidades.
  function force(I, L, B) { var c = cross(L, B); return pack([I * c[0], I * c[1], I * c[2]]); }
  function magnitude(I, L, B, deg) { return Math.abs(I) * L * B * Math.sin(deg * RAD); }
  // Fuerza neta sobre un alambre poligonal (puntos 3D) partido en n trocitos por tramo.
  function bent(I, pts, B, n) {
    n = n || 50;
    var F = [0, 0, 0];
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      for (var k = 0; k < n; k++) {
        var dl = [(b[0] - a[0]) / n, (b[1] - a[1]) / n, (b[2] - a[2]) / n], c = cross(dl, B);
        F[0] += I * c[0]; F[1] += I * c[1]; F[2] += I * c[2];
      }
    }
    return pack(F);
  }
  function pathLength(pts) { var s = 0; for (var i = 1; i < pts.length; i++) s += norm([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]]); return s; }
  function chord(I, a, b, B) { return force(I, [b[0] - a[0], b[1] - a[1], b[2] - a[2]], B); }
  // Arco de radio R y ángulo φ (grados) en un plano ⊥ B: F = I B · cuerda = 2 I R B sin(φ/2).
  function arcForce(I, R, B, phi) { return 2 * Math.abs(I) * R * B * Math.sin(phi * RAD / 2); }
  // Corriente que sostiene una varilla de masa m y largo L en un campo horizontal B ⊥ L.
  function levitate(m, L, B, g) { return m * (g || 9.81) / (L * B); }
  // Puntos de un semicírculo de radio R entre (−R, 0) y (R, 0), por arriba.
  function semicircle(R, n) { var o = []; n = n || 60; for (var i = 0; i <= n; i++) { var a = Math.PI - Math.PI * i / n; o.push([R * Math.cos(a), R * Math.sin(a), 0]); } return o; }

  var DIRS = ['+x', '−x', '+y', '−y', '+z', '−z'];
  var DV = { '+x': [1, 0, 0], '−x': [-1, 0, 0], '+y': [0, 1, 0], '−y': [0, -1, 0], '+z': [0, 0, 1], '−z': [0, 0, -1] };
  function dirOf(F) {
    var m = norm(F); if (!(m > 0)) return null;
    for (var k in DV) { var d = DV[k]; if (Math.abs(F[0] / m - d[0]) < 1e-9 && Math.abs(F[1] / m - d[1]) < 1e-9 && Math.abs(F[2] / m - d[2]) < 1e-9) return k; }
    return null;
  }
  function opp(k) { return (k[0] === '+' ? '−' : '+') + k[1]; }
  // Reto. c = { kind: 'plane' | 'perp' | 'bent', I, L (cm), B (mT), th (°, del alambre respecto a +x), shape, R (cm) }.
  // 'plane': B a la derecha (+x) en la hoja; 'perp' y 'bent': B entra a la hoja.
  function setup(c) {
    var Bv = c.kind === 'plane' ? [c.B, 0, 0] : [0, 0, -c.B];
    var pts;
    if (c.kind === 'bent') pts = shapePts(c.shape, c.R);
    else { var t = c.th * RAD; pts = [[0, 0, 0], [c.L * Math.cos(t), c.L * Math.sin(t), 0]]; }
    return { B: Bv, pts: pts };
  }
  function shapePts(shape, R) {
    if (shape === 'semi') return semicircle(R, 60);
    if (shape === 'ele') return [[-R, 0, 0], [-R, R, 0], [R, R, 0], [R, 0, 0]];   // U: tres lados de un rectángulo 2R × R
    return [[-R, 0, 0], [-R / 2, R * 0.8, 0], [0, 0, 0], [R / 2, R * 0.8, 0], [R, 0, 0]];   // zigzag
  }
  // F en mN: I (A) · L (cm) · B (mT) · 10⁻².
  function truth(c) { var w = setup(c), F = bent(c.I, w.pts, w.B, 1); return { mag: F.mag * 1e-2, dir: dirOf(F.vec), vec: F.vec }; }
  function mistakes(c) {
    var t = truth(c), w = setup(c), o = { cm: t.mag * 100, mT: t.mag * 1000 };
    if (c.kind === 'plane') o.cos = Math.abs(c.I * c.L * c.B * Math.cos(c.th * RAD)) * 1e-2;
    if (c.kind === 'bent') o.path = Math.abs(c.I) * pathLength(w.pts) * c.B * 1e-2;
    return o;
  }
  function diagnose(c, s, tol) {
    tol = tol || 0.03;
    if (!s || !isFinite(s.mag) || DIRS.indexOf(s.dir) < 0) return 'bad';
    var t = truth(c), m = mistakes(c), near = function (w) { return Math.abs(s.mag - w) <= tol * Math.abs(w); };
    var dOk = s.dir === t.dir, mOk = near(t.mag);
    if (mOk && dOk) return 'ok';
    if (mOk && s.dir === opp(t.dir)) return 'reversed';
    if (dOk || s.dir === opp(t.dir)) {
      var keys = ['path', 'cos', 'cm', 'mT'];
      for (var i = 0; i < keys.length; i++) if (m[keys[i]] != null && Math.abs(m[keys[i]] - t.mag) > tol * t.mag && near(m[keys[i]])) return keys[i];
    }
    if (mOk) return 'dirBad';
    if (dOk) return 'magBad';
    return 'bad';
  }

  window.LabMath.wire = {
    cross: cross, force: force, magnitude: magnitude, bent: bent, pathLength: pathLength, chord: chord, arcForce: arcForce,
    levitate: levitate, semicircle: semicircle, dirOf: dirOf, setup: setup, shapePts: shapePts, truth: truth, mistakes: mistakes, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var VW = 640, VH = 400, OX = 320, OY = 230, PX = 11;    // 11 px por cm
  var NAMES = { '+x': '+x (derecha)', '−x': '−x (izquierda)', '+y': '+y (arriba)', '−y': '−y (abajo)', '+z': '+z (sale de la hoja)', '−z': '−z (entra a la hoja)' };
  function fnum(v) { return String(v).replace('-', '−'); }
  function p3(v) { return fnum(Number((+v).toPrecision(3))); }
  var MSG = {
    ok: ['Tu fuerza coincide', 'Magnitud y dirección correctas.'],
    reversed: ['La dirección quedó al revés', 'Es I L × B: dedos a lo largo de la corriente, dóblalos hacia B; el pulgar da F.'],
    cos: ['Usaste cos θ', 'La fuerza lleva sin θ: es cero si el alambre va a lo largo de B.'],
    cm: ['Revisa las unidades', 'Pasa L a metros (o usa el factor: A·cm·mT = 10⁻⁵ N = 10⁻² mN).'],
    mT: ['Revisa las unidades', 'Pasa B a teslas: 1 mT = 10⁻³ T.'],
    path: ['Usaste el largo del camino', 'En un campo uniforme, la fuerza neta sobre un alambre doblado es la del segmento recto entre sus extremos.'],
    dirBad: ['La magnitud está bien; la dirección no', 'F es perpendicular al alambre y a B: usa la mano derecha con I y B.'],
    magBad: ['La dirección está bien; la magnitud no', 'F = I L B sin θ (con L en m y B en T).'],
    bad: ['Tu fuerza no coincide', 'F = I L × B: magnitud I L B sin θ y dirección por la mano derecha.']
  };
  var KIND = { ok: 'ok', reversed: 'warn', cos: 'warn', cm: 'warn', mT: 'warn', path: 'warn', dirBad: 'warn', magBad: 'warn' };
  var SHAPES = [['semi', 'semicírculo'], ['ele', 'U'], ['zig', 'zigzag']];

  window.Labs['wire-force'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var st = { mode: 0, I: 5, L: 20, B: 50, th: 90, perp: false, shape: 0, R: 12 }, chal = null, student = null;

    var modeSel = UI.select({ label: 'Modo', options: ['Tramo recto', 'Alambre doblado (B entra a la hoja)'] });
    var sI = UI.slider({ label: 'Corriente I', min: 1, max: 10, step: 1, value: st.I, unit: 'A' }, function (x) { st.I = x; free(); });
    var sB = UI.slider({ label: 'Campo B', min: 10, max: 200, step: 10, value: st.B, unit: 'mT' }, function (x) { st.B = x; free(); });
    var sL = UI.slider({ label: 'Largo L', min: 5, max: 40, step: 1, value: st.L, unit: 'cm' }, function (x) { st.L = x; free(); });
    var sT = UI.slider({ label: 'Ángulo del alambre con B', min: 0, max: 180, step: 15, value: st.th, unit: '°' }, function (x) { st.th = x; free(); });
    var bPerp = UI.button('Poner B entrando a la hoja', 'ghost', function () { st.perp = !st.perp; free(); });
    var shSel = UI.select({ label: 'Forma', options: ['semicírculo', 'U (tres lados de un rectángulo)', 'zigzag'] });
    var sR = UI.slider({ label: 'Tamaño (radio o lado)', min: 5, max: 20, step: 1, value: st.R, unit: 'cm' }, function (x) { st.R = x; free(); });
    var gStraight = h('div', {}, [sL.node, sT.node, h('div', { class: 'lab-buttons' }, [bPerp])]), gBent = h('div', {}, [shSel.node, sR.node]);

    var chalText = h('p', { class: 'lab-note' });
    var magIn = UI.input({ label: 'Tu |F| (mN)', type: 'text', inputmode: 'decimal', mono: false });
    var dirSel = UI.select({ label: 'Dirección de F', options: DIRS.map(function (d) { return NAMES[d]; }) });
    var bCheck = UI.button('Comprobar', 'primary', check);
    var bNew = UI.button('Otro reto', 'ghost', function () { newChallenge(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var note = h('p', { class: 'lab-note', role: 'status' });

    var svg = UI.svg(VW, VH, 'Alambre con corriente en un campo magnético uniforme y la fuerza sobre él.');
    var legend = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--ref' }), 'alambre y corriente I']),
      h('li', {}, [h('i', { class: 'sw sw--aux' }), 'campo B']),
      h('li', {}, [h('i', { class: 'sw sw--error' }), 'fuerza F']),
      h('li', {}, [h('i', { class: 'sw sw--trace' }), 'cuerda entre los extremos']),
      h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu fuerza'])
    ]);
    var facts = h('dl', { class: 'lab-facts' });

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [modeSel.node, sI.node, sB.node, gStraight, gBent,
        h('p', { class: 'lab-field__label' }, ['Reto: la fuerza sobre el alambre']), chalText,
        h('div', { class: 'lab-row' }, [magIn.node, dirSel.node]), h('div', { class: 'lab-buttons' }, [bCheck, bNew]), verdict, note]),
      h('figure', { class: 'lab-board' }, [h('figcaption', { class: 'lab-board__title sheet__title' }, ['F = I L × B']), svg, legend, facts])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    magIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    modeSel.input.addEventListener('change', function () { st.mode = +modeSel.input.value; free(); });
    shSel.input.addEventListener('change', function () { st.shape = +shSel.input.value; free(); });

    function parse(s) { return window.CBExercises ? window.CBExercises.parseNumber(s) : parseFloat(String(s).replace(/−/g, '-')); }
    function free() { chal = null; student = null; verdict.hidden = true; chalText.textContent = 'Mueve los controles para explorar, o pide un reto.'; draw(); }
    function current() {
      if (chal) return chal;
      if (st.mode === 1) return { kind: 'bent', I: st.I, B: st.B, shape: SHAPES[st.shape][0], R: st.R };
      return { kind: st.perp ? 'perp' : 'plane', I: st.I, L: st.L, B: st.B, th: st.th };
    }

    function el(tag, attrs, text) {
      if (!UI.svgOk(attrs)) return null;
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (text != null) n.textContent = text;
      svg.querySelector('g.sketch').appendChild(n);
      return n;
    }
    function arrowPx(cls, x, y, dx, dy, w, dash) {
      var L = Math.hypot(dx, dy); if (!(L > 3)) return;
      var ux = dx / L, uy = dy / L, hh = Math.min(12, L * 0.45), ex = x + dx, ey = y + dy;
      el('path', { 'class': cls, fill: 'none', 'stroke-width': w || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': dash || null, d: 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) + 'M' + (ex - ux * hh - uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh + ux * hh * 0.6).toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) + 'L' + (ex - ux * hh + uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh - ux * hh * 0.6).toFixed(1) });
    }
    function txt(x, y, s, a, fs) { el('text', { x: x.toFixed(1), y: y.toFixed(1), 'class': 'ann', 'text-anchor': a || 'middle', 'font-size': fs || 16 }, s); }
    // Símbolo de un vector perpendicular a la hoja: punto (sale) o cruz (entra).
    function perpSym(cls, x, y, out, r) {
      r = r || 12;
      el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: r, fill: 'none', 'class': cls, 'stroke-width': 2.6 });
      if (out) el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 3.4, 'class': cls });
      else el('path', { 'class': cls, fill: 'none', 'stroke-width': 2.6, d: 'M' + (x - r * 0.62) + ' ' + (y - r * 0.62) + 'L' + (x + r * 0.62) + ' ' + (y + r * 0.62) + 'M' + (x - r * 0.62) + ' ' + (y + r * 0.62) + 'L' + (x + r * 0.62) + ' ' + (y - r * 0.62) });
    }
    function X(p) { return OX + PX * p[0]; }
    function Y(p) { return OY - PX * p[1]; }

    function draw() {
      svg.innerHTML = '';
      var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'sketch'); svg.appendChild(g);
      gStraight.hidden = st.mode !== 0; gBent.hidden = st.mode !== 1;
      bPerp.textContent = st.perp ? 'Poner B a la derecha, en la hoja' : 'Poner B entrando a la hoja';
      var c = current(), w = setup(c), t = truth(c);
      // Campo
      if (c.kind === 'plane') {
        for (var y = 40; y <= 380; y += 56) arrowPx('aux', 30, y, 580, 0, 1.4);
        txt(620, 30, 'B →', 'end', 16);
      } else {
        for (var gx = 40; gx <= 620; gx += 45) for (var gy = 30; gy <= 390; gy += 45) el('path', { 'class': 'aux', fill: 'none', 'stroke-width': 1.5, opacity: 0.45, d: 'M' + (gx - 4) + ' ' + (gy - 4) + 'L' + (gx + 4) + ' ' + (gy + 4) + 'M' + (gx - 4) + ' ' + (gy + 4) + 'L' + (gx + 4) + ' ' + (gy - 4) });
        txt(620, 22, 'B entra a la hoja', 'end', 15);
      }
      // Centrar el alambre recto en el origen del dibujo
      var pts = w.pts, sh = [0, 0];
      if (c.kind !== 'bent') sh = [-(pts[0][0] + pts[1][0]) / 2, -(pts[0][1] + pts[1][1]) / 2];
      var P = pts.map(function (p) { return [p[0] + sh[0], p[1] + sh[1], 0]; });
      el('path', { 'class': 'ref', fill: 'none', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M' + P.map(function (p) { return X(p).toFixed(1) + ' ' + Y(p).toFixed(1); }).join('L') });
      // Flechas de corriente sobre el alambre
      for (var i = 1; i < P.length; i += Math.max(1, Math.floor((P.length - 1) / 3))) {
        var a = P[i - 1], b = P[i], mx = (X(a) + X(b)) / 2, my = (Y(a) + Y(b)) / 2, dx = X(b) - X(a), dy = Y(b) - Y(a), L = Math.hypot(dx, dy) || 1;
        arrowPx('ref', mx - dx / L * 10, my - dy / L * 10, dx / L * 20, dy / L * 20, 2.6);
      }
      var A0 = P[0], A1 = P[P.length - 1];
      txt(X(A1) + 14, Y(A1) - 10, 'I', 'start', 18);
      // Fuerza
      var Fv = t.vec, scaleF = 90;
      var mx2 = (X(A0) + X(A1)) / 2, my2 = (Y(A0) + Y(A1)) / 2;
      if (c.kind === 'bent') {
        el('path', { 'class': 'trace', fill: 'none', 'stroke-width': 2.2, 'stroke-dasharray': '6 5', d: 'M' + X(A0) + ' ' + Y(A0) + 'L' + X(A1) + ' ' + Y(A1) });
        // Fuerzas de algunos trocitos
        var seg = w.pts;
        for (var k = 1; k < seg.length; k += Math.max(1, Math.floor((seg.length - 1) / 8))) {
          var dl = [seg[k][0] - seg[k - 1][0], seg[k][1] - seg[k - 1][1], 0], f = force(1, dl, [0, 0, -1]), n2 = norm(f.vec) || 1;
          var cx = (X(seg[k]) + X(seg[k - 1])) / 2, cy = (Y(seg[k]) + Y(seg[k - 1])) / 2;
          arrowPx('error', cx, cy, f.x / n2 * 26, -f.y / n2 * 26, 2, null);
        }
        var fu = [Fv[0] / (norm(Fv) || 1), -Fv[1] / (norm(Fv) || 1)], fx0 = 575, fy0 = 230 - fu[1] * scaleF / 2;
        arrowPx('error', fx0 - fu[0] * scaleF / 2, fy0, fu[0] * scaleF, fu[1] * scaleF, 4);
        txt(fx0, fy0 + fu[1] * scaleF + (fu[1] < 0 ? -10 : 22), 'F neta', 'middle', 16);
      } else if (c.kind === 'perp') {
        arrowPx('error', mx2, my2, Fv[0] / (norm(Fv) || 1) * scaleF, -Fv[1] / (norm(Fv) || 1) * scaleF, 4);
        txt(mx2 + Fv[0] / (norm(Fv) || 1) * (scaleF + 18), my2 - Fv[1] / (norm(Fv) || 1) * (scaleF + 18) + 6, 'F', 'middle', 18);
      } else if (t.mag > 1e-9) {
        perpSym('error', mx2 + 90, my2 - 80, Fv[2] > 0, 14);
        txt(mx2 + 112, my2 - 75, 'F ' + (Fv[2] > 0 ? 'sale' : 'entra'), 'start', 16);
        // Ángulo θ
        var ang = c.th;
        el('path', { 'class': 'trace', fill: 'none', 'stroke-width': 2, d: 'M' + (mx2 + 40) + ' ' + my2 + 'A40 40 0 0 0 ' + (mx2 + 40 * Math.cos(ang * RAD)).toFixed(1) + ' ' + (my2 - 40 * Math.sin(ang * RAD)).toFixed(1) });
        txt(mx2 + 50 * Math.cos(ang * RAD / 2) + 8, my2 - 50 * Math.sin(ang * RAD / 2) + 4, 'θ', 'middle', 16);
      }
      // Lo del alumno
      if (student && isFinite(student.mag)) {
        var sv = { '+x': [1, 0], '−x': [-1, 0], '+y': [0, 1], '−y': [0, -1] }[student.dir];
        if (sv) arrowPx('student', mx2 - 30, my2 + 50, sv[0] * 70, -sv[1] * 70, 2.6, '7 5');
        else perpSym('student', mx2 - 40, my2 + 40, student.dir === '+z', 12);
      }
      facts.innerHTML = '';
      var hide = !!chal && !student;
      function row(a, b) { facts.appendChild(h('dt', {}, [a])); facts.appendChild(h('dd', {}, [b])); }
      row('I, B', c.I + ' A, ' + c.B + ' mT');
      if (c.kind === 'bent') {
        row('largo del camino', p3(pathLength(w.pts)) + ' cm');
        row('cuerda (extremo a extremo)', p3(norm([A1[0] - A0[0], A1[1] - A0[1], 0])) + ' cm');
        row('F neta = I·cuerda·B', hide ? 'compruébala con tu respuesta' : p3(t.mag) + ' mN, ' + NAMES[t.dir]);
        row('I·camino·B (incorrecto)', p3(Math.abs(c.I) * pathLength(w.pts) * c.B * 1e-2) + ' mN');
      } else {
        row('L, θ', c.L + ' cm, ' + (c.kind === 'plane' ? c.th + '° con B' : '90° (B ⊥ hoja)'));
        row('F = I L B sin θ', hide ? 'compruébala con tu respuesta' : p3(t.mag) + ' mN');
        row('dirección', hide ? '—' : (t.dir ? NAMES[t.dir] : 'no hay fuerza'));
      }
      row('unidades', 'A · cm · mT = 10⁻⁵ N = 10⁻² mN');
      svg.setAttribute('aria-label', 'Alambre con corriente en un campo uniforme; la fuerza mide ' + p3(t.mag) + ' mN.');
    }

    function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
    function newChallenge(fixed) {
      var c = fixed;
      if (!c) {
        var k = rnd(['plane', 'plane', 'perp', 'bent']);
        if (k === 'bent') c = { kind: 'bent', I: rnd([2, 3, 4, 5, 6]), B: rnd([20, 40, 50, 80, 100]), shape: rnd(['semi', 'ele', 'zig']), R: rnd([6, 8, 10, 12, 15]) };
        else c = { kind: k, I: rnd([2, 3, 4, 5, 8]), L: rnd([10, 15, 20, 25, 30]), B: rnd([20, 40, 50, 80, 100]), th: k === 'perp' ? rnd([0, 90, 180, 270]) : rnd([30, 45, 60, 120, 135, 150]) };
      }
      chal = c; student = null; verdict.hidden = true; magIn.input.value = '';
      st.mode = c.kind === 'bent' ? 1 : 0; modeSel.input.value = String(st.mode);
      var sTxt = c.kind === 'bent' ? 'Un alambre en forma de ' + { semi: 'semicírculo de radio ' + c.R + ' cm', ele: 'U de ' + (2 * c.R) + ' cm de ancho y ' + c.R + ' cm de alto (sus extremos quedan abajo)', zig: 'zigzag cuyos extremos están a ' + (2 * c.R) + ' cm' }[c.shape]
        : 'Un tramo recto de ' + c.L + ' cm ' + (c.kind === 'plane' ? 'que forma ' + c.th + '° con B (B va a la derecha, en la hoja)' : 'que apunta a ' + c.th + '° del eje +x, con B entrando a la hoja');
      chalText.textContent = sTxt + ' lleva ' + c.I + ' A en un campo de ' + c.B + ' mT' + (c.kind === 'bent' ? ' que entra a la hoja' : '') + '. ¿Cuánto vale la fuerza, en mN, y hacia dónde apunta?';
      draw();
    }
    function check() {
      if (!chal) { newChallenge(); return; }
      var m = parse(magIn.input.value), d = DIRS[+dirSel.input.value];
      if (!isFinite(m)) { UI.verdict(verdict, 'bad', MSG.bad[0], 'Escribe la magnitud en mN.'); return; }
      student = { mag: m, dir: d };
      var key = diagnose(chal, student), t = truth(chal), msg = MSG[key] || MSG.bad;
      draw();
      UI.verdict(verdict, KIND[key] || 'bad', msg[0], msg[1] + ' F real: ' + p3(t.mag) + ' mN, ' + NAMES[t.dir] + '.');
    }

    // Ejemplo cargado: un compañero usó el largo del semicírculo en lugar de la cuerda.
    newChallenge({ kind: 'bent', I: 4, B: 50, shape: 'semi', R: 10 });
    var w0 = setup(chal);
    magIn.input.value = String(Number((4 * pathLength(w0.pts) * 50 * 1e-2).toPrecision(3)));
    dirSel.input.value = String(DIRS.indexOf(truth(chal).dir));
    check();
    note.textContent = 'Ejemplo cargado: así respondió un compañero el reto. ¿Ves su error? Mueve los controles para explorar.';
    return Promise.resolve();
  };
})();
