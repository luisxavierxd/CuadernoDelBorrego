/* =====================================================================
   Lab loop-torque (Física 3 · S05): torque sobre una espira, dipolo magnético y motor.
   Espira rectangular de N vueltas (lados a, a lo largo del eje de giro, y b)
   en un campo uniforme B hacia +x. El eje de giro es y (perpendicular a la
   hoja en la vista desde arriba). θ es el ángulo entre la normal n̂ (regla de
   la mano derecha con la corriente) y B.
     τ = N I A B sin θ,  μ = N I A,  U = −μ·B = −N I A B cos θ
   Vista desde arriba: los lados a son puntos (corriente sale) y cruces (entra);
   sobre ellos actúan fuerzas iguales y opuestas que forman un par. Abajo, la
   gráfica de τ(θ) y U(θ). Modo motor: el conmutador invierte la corriente cada
   media vuelta y el torque no cambia de signo (animación; con movimiento
   reducido solo se muestra el estado).
   Reto: τ en mN·m. El «casi»:
     cos       usó cos θ (el ángulo con el plano de la espira, o la energía)
     noN       olvidó las N vueltas
     cm2       dejó el área en cm² (×10⁴)
     diameter  en la espira circular usó el diámetro como radio (×4)
   ===================================================================== */
(function () {
  var RAD = Math.PI / 180;
  /* ------------------------- Matemática pura ------------------------- */
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { return Math.hypot(a[0], a[1], a[2]); }
  function moment(N, I, A) { return N * I * A; }
  function torque(N, I, A, B, th) { return N * I * A * B * Math.sin(th * RAD); }
  function energy(N, I, A, B, th) { return -N * I * A * B * Math.cos(th * RAD); }
  // Trabajo que hace el campo al girar de th1 a th2: W = −ΔU.
  function workField(N, I, A, B, th1, th2) { return -(energy(N, I, A, B, th2) - energy(N, I, A, B, th1)); }
  // Torque con conmutador (motor de cd): siempre del mismo signo; promedio 2/π del máximo.
  function motorTorque(N, I, A, B, th) { return N * I * A * B * Math.abs(Math.sin(th * RAD)); }
  function motorAverage(N, I, A, B) { return 2 / Math.PI * N * I * A * B; }
  // Espira rectangular: lados a (paralelos al eje de giro y) y b. B = (B, 0, 0). Normal n̂ = (cos θ, 0, sin θ).
  // Devuelve las fuerzas por lado (con su punto medio) y el torque total respecto al centro, Σ r × F.
  function sides(N, I, a, b, B, th) {
    var t = th * RAD, n = [Math.cos(t), 0, Math.sin(t)], u = [-Math.sin(t), 0, Math.cos(t)], y = [0, 1, 0];
    function P(su, sy) { return [su * b / 2 * u[0] + sy * a / 2 * y[0], su * b / 2 * u[1] + sy * a / 2 * y[1], su * b / 2 * u[2] + sy * a / 2 * y[2]]; }
    // Recorrido con normal +n̂ (mano derecha): (−,−) → (−,+) → (+,+) → (+,−).
    var C = [P(-1, -1), P(-1, 1), P(1, 1), P(1, -1)], Bv = [B, 0, 0], out = [], tau = [0, 0, 0], Fsum = [0, 0, 0];
    for (var i = 0; i < 4; i++) {
      var p = C[i], q = C[(i + 1) % 4], L = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], c = cross(L, Bv);
      var F = [N * I * c[0], N * I * c[1], N * I * c[2]], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2], r = cross(m, F);
      out.push({ mid: m, L: L, F: F });
      tau[0] += r[0]; tau[1] += r[1]; tau[2] += r[2]; Fsum[0] += F[0]; Fsum[1] += F[1]; Fsum[2] += F[2];
    }
    return { corners: C, sides: out, tau: tau, tauMag: norm(tau), Fnet: Fsum, n: n };
  }
  // μ × B con μ = N I A n̂.
  function muCrossB(N, I, A, B, th) { var t = th * RAD; return cross([N * I * A * Math.cos(t), 0, N * I * A * Math.sin(t)], [B, 0, 0]); }
  function circleArea(r) { return Math.PI * r * r; }

  // Reto: c = { shape: 'rect' | 'circ', N, I, a, b (cm) o r (cm), B (T), ang (°), ref: 'normal' | 'plano' }. τ en mN·m.
  function thetaOf(c) { return c.ref === 'plano' ? 90 - c.ang : c.ang; }
  function areaOf(c) { return c.shape === 'circ' ? circleArea(c.r / 100) : (c.a / 100) * (c.b / 100); }
  function truth(c) { return torque(c.N, c.I, areaOf(c), c.B, thetaOf(c)) * 1000; }
  function mistakes(c) {
    var A = areaOf(c), th = thetaOf(c), o = {
      cos: Math.abs(c.N * c.I * A * c.B * Math.cos(th * RAD)) * 1000,
      noN: torque(1, c.I, A, c.B, th) * 1000,
      cm2: truth(c) * 1e4
    };
    if (c.shape === 'circ') o.diameter = truth(c) * 4;
    return o;
  }
  function diagnose(c, s, tol) {
    tol = tol || 0.03;
    if (!isFinite(s)) return 'bad';
    var t = truth(c), m = mistakes(c), near = function (w) { return Math.abs(s - w) <= tol * Math.abs(w); };
    if (near(t)) return 'ok';
    var keys = ['cos', 'noN', 'diameter', 'cm2'];
    for (var i = 0; i < keys.length; i++) if (m[keys[i]] != null && Math.abs(m[keys[i]] - t) > tol * t && near(m[keys[i]])) return keys[i];
    return 'bad';
  }

  window.LabMath.loop = {
    moment: moment, torque: torque, energy: energy, workField: workField, motorTorque: motorTorque, motorAverage: motorAverage,
    sides: sides, muCrossB: muCrossB, circleArea: circleArea, thetaOf: thetaOf, areaOf: areaOf, truth: truth, mistakes: mistakes, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var VW = 640, VH = 450, CX = 230, CY = 150;
  function fnum(v) { return String(v).replace('-', '−'); }
  function p3(v) { return fnum(Number((+v).toPrecision(3))); }
  var MSG = {
    ok: ['Tu torque coincide', 'τ = N I A B sin θ, con θ entre la normal y B.'],
    cos: ['Revisa el ángulo', 'θ es el ángulo entre la NORMAL de la espira y B. Si te dan el ángulo con el plano, θ = 90° − ese ángulo. (Con cos θ sale la energía, no el torque.)'],
    noN: ['Te faltaron las vueltas', 'Cada una de las N vueltas aporta el mismo torque: multiplica por N.'],
    cm2: ['Revisa las unidades del área', 'Pasa el área a m²: 1 cm² = 10⁻⁴ m².'],
    diameter: ['Revisa el radio', 'A = πr²; usaste el diámetro como si fuera el radio.'],
    bad: ['Tu torque no coincide', 'τ = N I A B sin θ, con A en m², B en T y θ entre la normal y B.']
  };
  var KIND = { ok: 'ok', cos: 'warn', noN: 'warn', cm2: 'warn', diameter: 'warn' };

  window.Labs['loop-torque'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var st = { N: 20, I: 2, a: 10, b: 8, B: 0.4, th: 60, motor: false }, chal = null, student = null, raf = 0;

    var sN = UI.slider({ label: 'Vueltas N', min: 1, max: 100, step: 1, value: st.N, unit: '' }, function (x) { st.N = x; free(); });
    var sI = UI.slider({ label: 'Corriente I', min: 0.5, max: 5, step: 0.5, value: st.I, unit: 'A' }, function (x) { st.I = x; free(); });
    var sA = UI.slider({ label: 'Lado a (en el eje)', min: 4, max: 20, step: 1, value: st.a, unit: 'cm' }, function (x) { st.a = x; free(); });
    var sb = UI.slider({ label: 'Lado b', min: 4, max: 16, step: 1, value: st.b, unit: 'cm' }, function (x) { st.b = x; free(); });
    var sB = UI.slider({ label: 'Campo B', min: 0.1, max: 1, step: 0.1, value: st.B, unit: 'T', fmt: function (x) { return x.toFixed(1); } }, function (x) { st.B = x; free(); });
    var sT = UI.slider({ label: 'Ángulo θ entre la normal y B', min: 0, max: 360, step: 5, value: st.th, unit: '°' }, function (x) { st.th = x; free(); });
    var bMotor = UI.button('Encender el motor (con conmutador)', 'ghost', function () { st.motor = !st.motor; if (st.motor) run(); else stop(); draw(); });

    var chalText = h('p', { class: 'lab-note' });
    var tIn = UI.input({ label: 'Tu torque τ (mN·m)', type: 'text', inputmode: 'decimal', mono: false });
    var bCheck = UI.button('Comprobar', 'primary', check);
    var bNew = UI.button('Otro reto', 'ghost', function () { newChallenge(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var note = h('p', { class: 'lab-note', role: 'status' });

    var svg = UI.svg(VW, VH, 'Espira vista desde arriba en un campo magnético, con las fuerzas sobre sus lados y la gráfica del torque.');
    var legend = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--aux' }), 'campo B']),
      h('li', {}, [h('i', { class: 'sw sw--ref' }), 'espira y normal n̂']),
      h('li', {}, [h('i', { class: 'sw sw--error' }), 'fuerzas y torque τ(θ)']),
      h('li', {}, [h('i', { class: 'sw sw--trace' }), 'energía U(θ)'])
    ]);
    var facts = h('dl', { class: 'lab-facts' });

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [sN.node, sI.node, h('div', { class: 'lab-row' }, [sA.node, sb.node]), sB.node, sT.node,
        h('div', { class: 'lab-buttons' }, [bMotor]),
        h('p', { class: 'lab-field__label' }, ['Reto: el torque sobre la espira']), chalText, tIn.node, h('div', { class: 'lab-buttons' }, [bCheck, bNew]), verdict, note]),
      h('figure', { class: 'lab-board' }, [h('figcaption', { class: 'lab-board__title sheet__title' }, ['τ = N I A B sin θ']), svg, legend, facts])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    tIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });

    function parse(s) { return window.CBExercises ? window.CBExercises.parseNumber(s) : parseFloat(String(s).replace(/−/g, '-')); }
    function free() { chal = null; student = null; verdict.hidden = true; chalText.textContent = 'Mueve los controles para explorar, o pide un reto.'; draw(); }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
    function run() {
      stop();
      if (reduce) { note.textContent = 'Con movimiento reducido el motor no se anima: mueve θ con el control y mira cómo el conmutador mantiene el signo del torque.'; return; }
      var last = null;
      var step = function (ts) {
        if (!st.motor || !svg.isConnected) { raf = 0; return; }
        if (last != null) { st.th = ((st.th - (ts - last) * 0.09) % 360 + 360) % 360; sT.set(Math.round(st.th / 5) * 5 % 360); }
        last = ts; draw(); raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }

    function el(tag, attrs, text) {
      if (!UI.svgOk(attrs)) return null;
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (text != null) n.textContent = text;
      svg.querySelector('g.sketch').appendChild(n);
      return n;
    }
    function arrowPx(cls, x, y, dx, dy, w) {
      var L = Math.hypot(dx, dy); if (!(L > 3)) return;
      var ux = dx / L, uy = dy / L, hh = Math.min(12, L * 0.45), ex = x + dx, ey = y + dy;
      el('path', { 'class': cls, fill: 'none', 'stroke-width': w || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) + 'M' + (ex - ux * hh - uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh + ux * hh * 0.6).toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) + 'L' + (ex - ux * hh + uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh - ux * hh * 0.6).toFixed(1) });
    }
    function txt(x, y, s, a, fs) { el('text', { x: x.toFixed(1), y: y.toFixed(1), 'class': 'ann', 'text-anchor': a || 'middle', 'font-size': fs || 16 }, s); }
    function perpSym(cls, x, y, out, r) {
      el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: r, fill: 'none', 'class': cls, 'stroke-width': 2.4 });
      if (out) el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 3.2, 'class': cls });
      else el('path', { 'class': cls, fill: 'none', 'stroke-width': 2.2, d: 'M' + (x - r * 0.6) + ' ' + (y - r * 0.6) + 'L' + (x + r * 0.6) + ' ' + (y + r * 0.6) + 'M' + (x - r * 0.6) + ' ' + (y + r * 0.6) + 'L' + (x + r * 0.6) + ' ' + (y - r * 0.6) });
    }
    function cur() {
      if (chal) return { N: chal.N, I: chal.I, A: areaOf(chal), a: chal.shape === 'rect' ? chal.a : chal.r * Math.sqrt(Math.PI), b: chal.shape === 'rect' ? chal.b : chal.r * Math.sqrt(Math.PI), B: chal.B, th: thetaOf(chal) };
      return { N: st.N, I: st.I, A: st.a / 100 * st.b / 100, a: st.a, b: st.b, B: st.B, th: st.th };
    }

    function draw() {
      svg.innerHTML = '';
      var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'sketch'); svg.appendChild(g);
      var c = cur(), th = c.th, motorFlip = st.motor && Math.sin(th * RAD) < 0 ? -1 : 1;
      // Vista desde arriba: x a la derecha (B), z hacia arriba de la pantalla; el eje y sale de la hoja.
      for (var y = 30; y <= 270; y += 48) arrowPx('aux', 20, y, 420, 0, 1.4);
      txt(452, 34, 'B', 'start', 18);
      var R = 16 * c.b, t = th * RAD, n = [Math.cos(t), Math.sin(t)], u = [-Math.sin(t), Math.cos(t)];
      var P1 = [CX - u[0] * R / 2, CY + u[1] * R / 2], P2 = [CX + u[0] * R / 2, CY - u[1] * R / 2];
      el('path', { 'class': 'ref', fill: 'none', 'stroke-width': 4, 'stroke-linecap': 'round', d: 'M' + P1[0].toFixed(1) + ' ' + P1[1].toFixed(1) + 'L' + P2[0].toFixed(1) + ' ' + P2[1].toFixed(1) });
      // Normal n̂ (mano derecha) desde el centro
      arrowPx('ref', CX, CY, n[0] * 70, -n[1] * 70, 2.6);
      txt(CX + n[0] * 86, CY - n[1] * 86 + 6, 'n̂', 'middle', 18);
      // Ángulo θ de B a n̂
      var arcR = 34, a1 = ((th % 360) + 360) % 360, large = a1 > 180 ? 1 : 0;
      if (a1 > 1) el('path', { 'class': 'trace', fill: 'none', 'stroke-width': 2, d: 'M' + (CX + arcR) + ' ' + CY + 'A' + arcR + ' ' + arcR + ' 0 ' + large + ' 0 ' + (CX + arcR * Math.cos(t)).toFixed(1) + ' ' + (CY - arcR * Math.sin(t)).toFixed(1) });
      txt(CX + 50 * Math.cos(t / 2), CY - 50 * Math.sin(t / 2) + 5, 'θ', 'middle', 16);
      // Lados a: en P2 (extremo +u) la corriente sale; en P1 entra (con el conmutador, se invierten cada media vuelta).
      var outAt2 = motorFlip > 0;
      perpSym('ref', P2[0], P2[1], outAt2, 11); perpSym('ref', P1[0], P1[1], !outAt2, 11);
      // En la vista, x va a la derecha, z hacia arriba y el eje y ENTRA a la hoja (x × y = z). El lado con
      // corriente saliendo lleva L = −a ŷ: (−ŷ) × x̂ = +ẑ, así que su fuerza apunta hacia arriba en la pantalla.
      var fLen = 26 + 60 * Math.min(1, c.N * c.I * c.a / 100 * c.B / 2);
      var f2 = outAt2 ? 1 : -1;                                     // componente z de la fuerza sobre P2
      arrowPx('error', P2[0], P2[1], 0, -f2 * fLen, 3.2); arrowPx('error', P1[0], P1[1], 0, f2 * fLen, 3.2);
      txt(P2[0] + 16, P2[1] - f2 * fLen * 0.6, 'F', 'start', 16); txt(P1[0] - 16, P1[1] + f2 * fLen * 0.6, 'F', 'end', 16);
      el('circle', { cx: CX, cy: CY, r: 3, 'class': 'axis' });
      txt(20, 290, 'Vista desde arriba: el eje de giro es perpendicular a la hoja', 'start', 13);
      // Gráfica τ(θ) y U(θ) abajo
      var gx0 = 40, gx1 = 600, gy = 370, gh = 46, tmax = c.N * c.I * c.A * c.B;
      el('path', { 'class': 'axis', fill: 'none', 'stroke-width': 1.4, d: 'M' + gx0 + ' ' + gy + 'H' + gx1 + 'M' + gx0 + ' ' + (gy - gh - 8) + 'V' + (gy + gh + 8) });
      var pt = [], pu = [];
      for (var k = 0; k <= 72; k++) {
        var a = k * 5, X = gx0 + (gx1 - gx0) * a / 360;
        var tv = st.motor ? Math.abs(Math.sin(a * RAD)) : Math.sin(a * RAD);
        pt.push(X.toFixed(1) + ' ' + (gy - gh * tv).toFixed(1)); pu.push(X.toFixed(1) + ' ' + (gy + gh * Math.cos(a * RAD)).toFixed(1));
      }
      el('path', { 'class': 'error', fill: 'none', 'stroke-width': 2.4, d: 'M' + pt.join('L') });
      el('path', { 'class': 'trace', fill: 'none', 'stroke-width': 2, 'stroke-dasharray': '6 5', d: 'M' + pu.join('L') });
      var xm = gx0 + (gx1 - gx0) * a1 / 360;
      el('path', { 'class': 'axis', fill: 'none', 'stroke-width': 1.2, 'stroke-dasharray': '3 4', d: 'M' + xm.toFixed(1) + ' ' + (gy - gh - 6) + 'V' + (gy + gh + 6) });
      [0, 90, 180, 270, 360].forEach(function (a) { txt(gx0 + (gx1 - gx0) * a / 360, gy + gh + 18, a + '°', 'middle', 12); });
      txt(gx1 - 4, gy - gh - 12, st.motor ? 'τ con conmutador' : 'τ(θ)', 'end', 13); txt(gx0 + 6, gy - gh - 12, 'U(θ) = −μB cos θ (punteada)', 'start', 13);
      // Lecturas
      facts.innerHTML = '';
      var hide = !!chal && student == null;
      function row(x, z) { facts.appendChild(h('dt', {}, [x])); facts.appendChild(h('dd', {}, [z])); }
      row('μ = N I A', p3(moment(c.N, c.I, c.A)) + ' A·m²');
      row('θ (normal con B)', p3(th) + '°');
      row('τ = μ B sin θ', hide ? 'compruébalo con tu respuesta' : p3((st.motor ? motorTorque : torque)(c.N, c.I, c.A, c.B, th) * 1000) + ' mN·m');
      row('U = −μ B cos θ', p3(energy(c.N, c.I, c.A, c.B, th) * 1000) + ' mJ');
      row('fuerza neta', '0 (las fuerzas forman un par)');
      if (st.motor) row('torque promedio del motor', p3(motorAverage(c.N, c.I, c.A, c.B) * 1000) + ' mN·m');
      bMotor.textContent = st.motor ? 'Apagar el motor' : 'Encender el motor (con conmutador)';
      svg.setAttribute('aria-label', 'Espira vista desde arriba, con su normal a ' + Math.round(th) + ' grados del campo; el torque mide ' + p3(torque(c.N, c.I, c.A, c.B, th) * 1000) + ' milinewton metro.');
    }

    function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
    function newChallenge(fixed) {
      st.motor = false; stop();
      var c = fixed || (Math.random() < 0.6
        ? { shape: 'rect', N: rnd([10, 20, 50, 100]), I: rnd([0.5, 1, 2, 3]), a: rnd([4, 5, 8, 10, 12]), b: rnd([4, 5, 6, 8]), B: rnd([0.2, 0.3, 0.5, 0.8]), ang: rnd([20, 30, 40, 50, 60, 70]), ref: rnd(['normal', 'plano']) }
        : { shape: 'circ', N: rnd([10, 20, 50, 100]), I: rnd([0.5, 1, 2, 3]), r: rnd([2, 3, 4, 5]), B: rnd([0.2, 0.3, 0.5, 0.8]), ang: rnd([20, 30, 40, 50, 60, 70]), ref: rnd(['normal', 'plano']) });
      chal = c; student = null; verdict.hidden = true; tIn.input.value = '';
      chalText.textContent = 'Una espira ' + (c.shape === 'rect' ? 'rectangular de ' + c.a + ' cm × ' + c.b + ' cm' : 'circular de ' + c.r + ' cm de radio') + ' con ' + c.N + ' vueltas lleva ' + c.I + ' A en un campo de ' + c.B + ' T. ' +
        (c.ref === 'normal' ? 'Su normal forma ' + c.ang + '° con el campo.' : 'El plano de la espira forma ' + c.ang + '° con el campo.') + ' ¿Cuánto vale el torque, en mN·m?';
      draw();
    }
    function check() {
      if (!chal) { newChallenge(); return; }
      var s = parse(tIn.input.value);
      if (!isFinite(s)) { UI.verdict(verdict, 'bad', MSG.bad[0], 'Escribe el torque en mN·m.'); return; }
      student = s;
      var key = diagnose(chal, s), msg = MSG[key] || MSG.bad;
      draw();
      UI.verdict(verdict, KIND[key] || 'bad', msg[0], msg[1] + ' Torque real: ' + p3(truth(chal)) + ' mN·m.');
    }

    // Ejemplo cargado: un compañero usó el ángulo con el plano como si fuera el de la normal.
    newChallenge({ shape: 'rect', N: 20, I: 2, a: 10, b: 8, B: 0.5, ang: 30, ref: 'plano' });
    tIn.input.value = String(Number((torque(20, 2, 0.008, 0.5, 30) * 1000).toPrecision(3)));
    check();
    note.textContent = 'Ejemplo cargado: así respondió un compañero el reto. ¿Ves su error? Mueve los controles para explorar o enciende el motor.';
    return Promise.resolve();
  };
})();
