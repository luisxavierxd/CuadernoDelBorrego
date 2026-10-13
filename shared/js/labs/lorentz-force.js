/* =====================================================================
   Lab lorentz-force (Física 3 · S02): la fuerza magnética F = q v × B.
   Vista 3D con v sobre el eje x y B en el plano xy, a un ángulo θ de v.
   La fuerza sale perpendicular a los dos (sobre el eje z) y mide
   |q| v B sin θ; su sentido lo da la regla de la mano derecha, al revés
   si la carga es negativa. Unidades de trabajo: q en μC, v en km/s, B en T
   → F en mN (μC · km/s · T = 10⁻⁶ · 10³ N = 10⁻³ N).
   Reto: q, v y B en componentes; el alumno da Fx, Fy, Fz (mN). El «casi»:
     sign     carga negativa: le faltó el signo de q (F quedó al revés)
     order    calculó B × v en lugar de v × B (F quedó al revés, q > 0)
     noQ      calculó v × B y no multiplicó por q
     units    mezcló prefijos (×1000 o ÷1000)
     oneComp  dos componentes bien y una mal
   ===================================================================== */
(function () {
  var RAD = Math.PI / 180, DEG = 180 / Math.PI;

  /* ------------------------- Matemática pura ------------------------- */
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function norm(a) { return Math.hypot(a[0], a[1], a[2]); }
  function scale(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function pack(F) { return { x: F[0], y: F[1], z: F[2], mag: norm(F), vec: F }; }
  // F = q v × B (cualquier juego coherente de unidades).
  function force(q, v, B) { return pack(scale(cross(v, B), q)); }
  // Fuerza de Lorentz completa: F = q (E + v × B).
  function lorentz(q, E, v, B) { var c = cross(v, B); return pack([q * (E[0] + c[0]), q * (E[1] + c[1]), q * (E[2] + c[2])]); }
  // Magnitud con el ángulo entre v y B (en grados).
  function magnitude(q, v, B, deg) { return Math.abs(q) * v * B * Math.sin(deg * RAD); }
  // Ángulo entre dos vectores, en grados.
  function angle(a, b) { var c = dot(a, b) / (norm(a) * norm(b)); return Math.acos(Math.max(-1, Math.min(1, c))) * DEG; }
  // '+x', '−y', … si el vector apunta sobre un eje; null si no.
  function axisName(F, tol) {
    tol = tol == null ? 1e-9 : tol;
    var m = norm(F);
    if (!(m > 0)) return null;
    for (var i = 0; i < 3; i++) {
      var others = [0, 1, 2].filter(function (j) { return j !== i; });
      if (others.every(function (j) { return Math.abs(F[j]) <= tol * m; })) return (F[i] > 0 ? '+' : '−') + 'xyz'[i];
    }
    return null;
  }
  // Potencia de la fuerza magnética: F · v = 0 siempre.
  function power(q, v, B) { return dot(force(q, v, B).vec, v); }
  // B que hace falta para una fuerza F, con el ángulo θ entre v y B.
  function fieldFor(F, q, v, deg) { return F / (Math.abs(q) * v * Math.sin(deg * RAD)); }
  // Velocidad perpendicular: la parte de v que cuenta para la fuerza.
  function vPerp(v, B) { var b = norm(B); return norm(cross(v, B)) / b; }

  // Reto: c = { q (μC), v (km/s), B (T) }; student = [Fx, Fy, Fz] en mN.
  function mistakes(c) {
    var t = force(c.q, c.v, c.B).vec;
    return { sign: scale(t, -1), order: scale(t, -1), noQ: cross(c.v, c.B), u1000: scale(t, 1000), u0001: scale(t, 0.001) };
  }
  function diagnose(c, s, tol) {
    tol = tol || 0.03;
    if (!s || s.length !== 3 || !s.every(isFinite)) return 'bad';
    var t = force(c.q, c.v, c.B).vec, m = mistakes(c), T = norm(t);
    function same(w) { var W = Math.max(norm(w), 1e-12); return [0, 1, 2].every(function (i) { return Math.abs(s[i] - w[i]) <= tol * W; }); }
    if (same(t)) return 'ok';
    if (same(m.sign)) return c.q < 0 ? 'sign' : 'order';
    if (Math.abs(c.q) !== 1 && same(m.noQ)) return 'noQ';
    if (same(m.u1000) || same(m.u0001)) return 'units';
    var good = [0, 1, 2].filter(function (i) { return Math.abs(s[i] - t[i]) <= tol * T; }).length;
    if (good === 2) return 'oneComp';
    return 'bad';
  }

  window.LabMath.lorentz = {
    cross: cross, dot: dot, norm: norm, force: force, lorentz: lorentz, magnitude: magnitude, angle: angle,
    axisName: axisName, power: power, fieldFor: fieldFor, vPerp: vPerp, mistakes: mistakes, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var VW = 640, VH = 420, CX = 320, CY = 240, S = 34;
  function fnum(v) { return String(v).replace('-', '−'); }
  function f3(v) { return fnum(Number((+v).toPrecision(3))); }
  var MSG = {
    ok: ['Tu fuerza coincide', 'Las tres componentes están bien.'],
    sign: ['La fuerza quedó al revés', 'La carga es negativa: F = q v × B apunta en sentido contrario a v × B. Multiplica por q con su signo.'],
    order: ['La fuerza quedó al revés', 'El orden importa: es v × B, no B × v. Con la mano derecha, los dedos van de v hacia B.'],
    noQ: ['Te faltó multiplicar por q', 'Calculaste v × B. La fuerza es q (v × B): multiplica cada componente por q (en μC).'],
    units: ['Revisa las unidades', 'Con q en μC, v en km/s y B en T, la fuerza sale en mN: 10⁻⁶ · 10³ = 10⁻³.'],
    oneComp: ['Casi: una componente está mal', 'Revisa la componente que no coincide con el determinante (î, ĵ, k̂ arriba; v en medio; B abajo).'],
    bad: ['Tu fuerza no coincide', 'Arma el determinante con v en el segundo renglón y B en el tercero, y multiplica por q.']
  };
  var KIND = { ok: 'ok', sign: 'warn', order: 'warn', noQ: 'warn', units: 'warn', oneComp: 'warn' };

  window.Labs['lorentz-force'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var st = { v: 4, B: 0.5, th: 90, q: 2, sg: 1, az: -35 }, chal = null, student = null, mode = cfg.mode === 'reto' ? 1 : 0;

    var modeSel = UI.select({ label: 'Modo', options: ['Explorar: v sobre x y B en el plano xy', 'Reto: las componentes de F'] });
    var sV = UI.slider({ label: 'Rapidez v', min: 1, max: 10, step: 1, value: st.v, unit: 'km/s' }, function (x) { st.v = x; draw(); });
    var sB = UI.slider({ label: 'Campo B', min: 0.1, max: 2, step: 0.1, value: st.B, unit: 'T', fmt: function (x) { return x.toFixed(1); } }, function (x) { st.B = x; draw(); });
    var sT = UI.slider({ label: 'Ángulo θ entre v y B', min: 0, max: 180, step: 15, value: st.th, unit: '°' }, function (x) { st.th = x; draw(); });
    var sQ = UI.slider({ label: 'Carga |q|', min: 1, max: 5, step: 1, value: st.q, unit: 'μC' }, function (x) { st.q = x; draw(); });
    var bSign = UI.button('Cambiar el signo de la carga', 'ghost', function () { st.sg = -st.sg; draw(); });
    var sAz = UI.slider({ label: 'Girar la vista', min: -80, max: 10, step: 5, value: st.az, unit: '°' }, function (x) { st.az = x; draw(); });
    var explore = h('div', {}, [sV.node, sB.node, sT.node, sQ.node, h('div', { class: 'lab-buttons' }, [bSign])]);

    var chalText = h('p', { class: 'lab-note' });
    var fx = UI.input({ label: 'Fx (mN)', type: 'text', inputmode: 'decimal', mono: false });
    var fy = UI.input({ label: 'Fy (mN)', type: 'text', inputmode: 'decimal', mono: false });
    var fz = UI.input({ label: 'Fz (mN)', type: 'text', inputmode: 'decimal', mono: false });
    var bCheck = UI.button('Comprobar', 'primary', check);
    var bNew = UI.button('Otro reto', 'ghost', function () { newChallenge(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var reto = h('div', {}, [chalText, h('div', { class: 'lab-row' }, [fx.node, fy.node]), fz.node, h('div', { class: 'lab-buttons' }, [bCheck, bNew]), verdict]);
    var note = h('p', { class: 'lab-note', role: 'status' });

    var svg = UI.svg(VW, VH, 'Vista en 3D de la velocidad, el campo magnético y la fuerza magnética sobre una carga.');
    var legend = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--ref' }), 'velocidad v']),
      h('li', {}, [h('i', { class: 'sw sw--aux' }), 'campo B']),
      h('li', {}, [h('i', { class: 'sw sw--error' }), 'fuerza F']),
      h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu fuerza'])
    ]);
    var facts = h('dl', { class: 'lab-facts' });

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [modeSel.node, explore, reto, sAz.node, note]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['F = q v × B']),
        svg, legend, facts
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    [fx.input, fy.input, fz.input].forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } }); });
    modeSel.input.addEventListener('change', function () { setMode(+modeSel.input.value); });

    function parse(s) { return window.CBExercises ? window.CBExercises.parseNumber(s) : parseFloat(String(s).replace(/−/g, '-')); }
    function setMode(m) {
      mode = m; modeSel.input.value = String(m);
      explore.hidden = m !== 0; reto.hidden = m !== 1;
      if (m === 1 && !chal) newChallenge();
      draw();
    }

    /* ---------- Dibujo ---------- */
    function P(p) {
      var az = st.az * RAD, el = 22 * RAD, ca = Math.cos(az), sa = Math.sin(az);
      var x = p[0] * ca - p[1] * sa, y = p[0] * sa + p[1] * ca;
      return [CX + S * y, CY - S * (p[2] * Math.cos(el) - x * Math.sin(el))];
    }
    function el(tag, attrs, text) {
      if (!UI.svgOk(attrs)) return null;
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (text != null) n.textContent = text;
      svg.querySelector('g.sketch').appendChild(n);
      return n;
    }
    function arrow3(cls, a, b, w, dash) {
      var A = P(a), B = P(b), dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy);
      if (!(L > 3)) return;
      var ux = dx / L, uy = dy / L, hh = Math.min(13, L * 0.4);
      el('path', { 'class': cls, fill: 'none', 'stroke-width': w || 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': dash || null,
        d: 'M' + A[0].toFixed(1) + ' ' + A[1].toFixed(1) + 'L' + B[0].toFixed(1) + ' ' + B[1].toFixed(1) +
          'M' + (B[0] - ux * hh - uy * hh * 0.6).toFixed(1) + ' ' + (B[1] - uy * hh + ux * hh * 0.6).toFixed(1) + 'L' + B[0].toFixed(1) + ' ' + B[1].toFixed(1) +
          'L' + (B[0] - ux * hh + uy * hh * 0.6).toFixed(1) + ' ' + (B[1] - uy * hh - ux * hh * 0.6).toFixed(1) });
    }
    function label3(p, s, cls) {
      var q = P(p);
      el('text', { x: q[0].toFixed(1), y: (q[1] + 6).toFixed(1), 'class': cls || 'ann', 'text-anchor': 'middle', 'font-size': 18 }, s);
    }
    // Longitud en pantalla de un vector: crece con su magnitud pero sin salirse.
    function len(m, ref) { return m > 0 ? Math.max(0.9, Math.min(4.6, 4.6 * Math.sqrt(m / ref))) : 0; }
    function unit(a) { var n = norm(a); return n > 0 ? scale(a, 1 / n) : [0, 0, 0]; }
    function current() {
      if (mode === 1 && chal) return { q: chal.q, v: chal.v, B: chal.B };
      var t = st.th * RAD;
      return { q: st.sg * st.q, v: [st.v, 0, 0], B: [st.B * Math.cos(t), st.B * Math.sin(t), 0] };
    }
    function draw() {
      svg.innerHTML = '';
      var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'sketch'); svg.appendChild(g);
      var c = current(), F = force(c.q, c.v, c.B), O = [0, 0, 0];
      // Ejes
      [[5.2, 0, 0, 'x'], [0, 5.2, 0, 'y'], [0, 0, 4.4, 'z']].forEach(function (e) {
        arrow3('axis', [-e[0] * 0.15, -e[1] * 0.15, -e[2] * 0.15], [e[0], e[1], e[2]], 1.6);
        label3([e[0] * 1.1, e[1] * 1.1, e[2] * 1.1], e[3]);
      });
      // Plano de v y B (sombreado tenue) en el modo explorar
      if (mode === 0) {
        var pl = [[-3, -3, 0], [3.5, -3, 0], [3.5, 3.5, 0], [-3, 3.5, 0]].map(P);
        el('path', { 'class': 'axis', fill: 'none', 'stroke-width': 1, 'stroke-dasharray': '4 6', d: 'M' + pl.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L') + 'Z' });
      }
      var vRef = mode === 1 ? 6 : 10, bRef = mode === 1 ? 1.5 : 2, fRef = mode === 1 ? Math.max(F.mag, 1e-9) * 1.4 : 40;
      var vu = unit(c.v), bu = unit(c.B), fu = unit(F.vec);
      var vE = scale(vu, len(norm(c.v), vRef)), bE = scale(bu, len(norm(c.B), bRef)), fE = scale(fu, len(F.mag, fRef));
      arrow3('ref', O, vE, 3.4); label3(scale(vE, 1.14), 'v');
      arrow3('aux', O, bE, 3.4); label3(scale(bE, 1.16), 'B');
      if (F.mag > 1e-9) { arrow3('error', O, fE, 3.8); label3(scale(fE, 1.12), 'F'); }
      // Arco de θ de v hacia B
      if (mode === 0 && st.th > 0) {
        var pts = [];
        for (var i = 0; i <= 24; i++) { var a = st.th * RAD * i / 24; pts.push(P([1.2 * Math.cos(a), 1.2 * Math.sin(a), 0])); }
        el('path', { 'class': 'trace', fill: 'none', 'stroke-width': 2, d: 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L') });
        var mid = P([1.65 * Math.cos(st.th * RAD / 2), 1.65 * Math.sin(st.th * RAD / 2), 0]);
        el('text', { x: mid[0].toFixed(1), y: (mid[1] + 6).toFixed(1), 'class': 'ann', 'text-anchor': 'middle', 'font-size': 17 }, 'θ');
      }
      // Carga en el origen
      var o = P(O);
      el('circle', { cx: o[0].toFixed(1), cy: o[1].toFixed(1), r: 12, 'class': c.q > 0 ? 'box-err' : 'box-aux' });
      el('text', { x: o[0].toFixed(1), y: (o[1] + 6).toFixed(1), 'class': 'ann', 'text-anchor': 'middle', 'font-size': 18 }, c.q > 0 ? '+' : '−');
      // Lo del alumno
      if (mode === 1 && student && norm(student) > 0) {
        var su = unit(student), sE = scale(su, len(norm(student), fRef));
        arrow3('student', O, sE, 2.8, '7 5');
      }
      // Lecturas
      facts.innerHTML = '';
      var rows = [
        ['q', fnum(c.q) + ' μC'],
        ['v', '(' + c.v.map(f3).join(', ') + ') km/s'],
        ['B', '(' + c.B.map(f3).join(', ') + ') T'],
        ['ángulo entre v y B', f3(angle(c.v, c.B)) + '°'],
        ['F = q v × B', mode === 1 && !student ? 'compruébala con tu respuesta' : '(' + F.vec.map(f3).join(', ') + ') mN'],
        ['|F| = |q| v B sin θ', mode === 1 && !student ? '—' : f3(F.mag) + ' mN'],
        ['potencia F · v', '0 (la fuerza magnética no hace trabajo)']
      ];
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
      svg.setAttribute('aria-label', 'Vista en 3D: v, B y la fuerza F = q v × B, que mide ' + f3(F.mag) + ' mN y es perpendicular a v y a B.');
    }

    /* ---------- Reto ---------- */
    function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
    function vecPick(mags) {
      var v = [0, 0, 0], i = Math.floor(Math.random() * 3), j = (i + 1 + Math.floor(Math.random() * 2)) % 3;
      v[i] = rnd(mags) * rnd([1, -1]);
      if (Math.random() < 0.5) v[j] = rnd(mags) * rnd([1, -1]);
      return v;
    }
    function newChallenge(fixed) {
      var c = fixed;
      for (var k = 0; !c && k < 50; k++) {
        var t = { q: rnd([1, 2, 3, 4, 5]) * rnd([1, -1]), v: vecPick([1, 2, 3, 4]), B: vecPick([0.2, 0.5, 1, 2]) };
        if (force(t.q, t.v, t.B).mag > 1e-9) c = t;
      }
      chal = c; student = null; verdict.hidden = true;
      fx.input.value = ''; fy.input.value = ''; fz.input.value = '';
      chalText.textContent = 'Una carga q = ' + fnum(c.q) + ' μC se mueve con v = (' + c.v.map(fnum).join(', ') + ') km/s en un campo B = (' + c.B.map(fnum).join(', ') + ') T. Calcula F = q v × B en mN (μC · km/s · T = mN).';
      draw();
    }
    function check() {
      if (!chal) return;
      var s = [parse(fx.input.value), parse(fy.input.value), parse(fz.input.value)];
      if (!s.every(isFinite)) { UI.verdict(verdict, 'bad', MSG.bad[0], 'Escribe las tres componentes (pon 0 si alguna no aparece).'); return; }
      student = s;
      var key = diagnose(chal, s), F = force(chal.q, chal.v, chal.B), msg = MSG[key] || MSG.bad;
      draw();
      UI.verdict(verdict, KIND[key] || 'bad', msg[0], msg[1] + ' F real: (' + F.vec.map(f3).join(', ') + ') mN.');
    }

    // Ejemplo cargado: un compañero olvidó que la carga es negativa.
    newChallenge({ q: -2, v: [3, 0, 0], B: [0, 0.5, 0] });
    var F0 = force(-2, [3, 0, 0], [0, 0.5, 0]).vec;
    fx.input.value = fnum(-F0[0] || 0); fy.input.value = fnum(-F0[1] || 0); fz.input.value = fnum(-F0[2]);
    setMode(1);
    check();
    note.textContent = 'Ejemplo cargado: así respondió un compañero el reto. ¿Ves su error? Cambia a Explorar para mover v, B y θ.';
    return Promise.resolve();
  };
})();
