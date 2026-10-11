/* =====================================================================
   Lab coord-convert (Cálculo 2 · S03): ¿Es tu conversión?
   Un punto P en el espacio con sus coordenadas rectangulares (x, y, z),
   cilíndricas (r, θ, z) y esféricas (ρ, θ, φ), con los segmentos y los
   ángulos dibujados. El lab da el punto en un sistema, el alumno escribe
   sus tres números en otro y se comparan.
   Convención de OpenStax: θ ∈ [0, 2π) desde el eje x positivo; φ ∈ [0, π]
   medido desde el eje z positivo.
   Errores típicos que reconoce:
     quadrant      θ = arctan(y/x) sin corregir el cuadrante
     phiFromPlane  φ medido desde el plano xy (su complemento, π/2 − φ)
     degrees       ángulos en grados (o la calculadora en grados)
     swapRRho      r y ρ intercambiados (olvidar z, o olvidar sin φ)
   PC (≥ 961 px): vista 3D en SVG (arrastra P en su plano horizontal; arrastra
   el fondo para girar) y, con un botón, las dos vistas planas. Móvil: solo las
   vistas planas (planta xy con r y θ; corte vertical con ρ y φ). Califican igual.
   ===================================================================== */
(function () {
  var TAU = 2 * Math.PI, HALF = Math.PI / 2, DEG = 180 / Math.PI, RAD = Math.PI / 180, EPS = 1e-9;

  /* ------------------------- Matemática pura ------------------------- */
  // θ en [0, 2π).
  function norm2pi(t) { var u = t % TAU; if (u < 0) u += TAU; return u > TAU - 1e-12 ? 0 : u; }
  function rectToCyl(x, y, z) { var r = Math.hypot(x, y); return { r: r, theta: r < EPS ? 0 : norm2pi(Math.atan2(y, x)), z: z }; }
  function cylToRect(r, theta, z) { return { x: r * Math.cos(theta), y: r * Math.sin(theta), z: z }; }
  function rectToSph(x, y, z) {
    var r = Math.hypot(x, y), rho = Math.hypot(r, z);
    return { rho: rho, theta: r < EPS ? 0 : norm2pi(Math.atan2(y, x)), phi: rho < EPS ? 0 : Math.acos(Math.max(-1, Math.min(1, z / rho))) };
  }
  function sphToRect(rho, theta, phi) { var s = rho * Math.sin(phi); return { x: s * Math.cos(theta), y: s * Math.sin(theta), z: rho * Math.cos(phi) }; }
  // Directas entre cilíndricas y esféricas, con el triángulo del corte vertical (sin pasar por x, y).
  function cylToSph(r, theta, z) { var rho = Math.hypot(r, z); return { rho: rho, theta: norm2pi(theta), phi: rho < EPS ? 0 : Math.atan2(r, z) }; }
  function sphToCyl(rho, theta, phi) { return { r: rho * Math.sin(phi), theta: norm2pi(theta), z: rho * Math.cos(phi) }; }

  var NAMES = { rect: ['x', 'y', 'z'], cyl: ['r', 'theta', 'z'], sph: ['rho', 'theta', 'phi'] };
  function arr(sys, o) { return NAMES[sys].map(function (k) { return o[k]; }); }
  function toRect(sys, a) {
    if (sys === 'rect') return a.slice();
    var o = sys === 'cyl' ? cylToRect(a[0], a[1], a[2]) : sphToRect(a[0], a[1], a[2]);
    return [o.x, o.y, o.z];
  }
  // Conversión entre dos de los tres sistemas; a y el resultado son ternas en el orden de NAMES.
  function convert(from, to, a) {
    if (from === to) { var c = a.slice(); if (to !== 'rect') c[1] = norm2pi(c[1]); return c; }
    if (from === 'cyl' && to === 'sph') return arr('sph', cylToSph(a[0], a[1], a[2]));
    if (from === 'sph' && to === 'cyl') return arr('cyl', sphToCyl(a[0], a[1], a[2]));
    var p = toRect(from, a);
    if (to === 'rect') return p;
    return to === 'cyl' ? arr('cyl', rectToCyl(p[0], p[1], p[2])) : arr('sph', rectToSph(p[0], p[1], p[2]));
  }

  function isAngle(sys, i) { return sys !== 'rect' && (i === 1 || (sys === 'sph' && i === 2)); }
  function angDist(a, b) { var d = Math.abs(a - b) % TAU; return Math.min(d, TAU - d); }
  // Misma holgura que los ejercicios: una centésima o 1 %. θ se compara módulo 2π (−π/4 = 7π/4).
  function tolOf(t) { return Math.max(0.011, 0.01 * Math.abs(t)); }
  function close(sys, i, t, s, plain) {
    if (!isFinite(s) || !isFinite(t)) return false;
    var d = !plain && sys !== 'rect' && i === 1 ? angDist(s, t) : Math.abs(s - t);
    return d <= tolOf(t);
  }
  // Sobre el eje z cualquier θ describe el punto; en el origen, también cualquier φ.
  function freeMask(sys, P) {
    var r = Math.hypot(P[0], P[1]), rho = Math.hypot(r, P[2]);
    return [false, sys !== 'rect' && r < 1e-6, sys === 'sph' && rho < 1e-6];
  }
  function sameMasked(sys, A, B, fr, plain) {
    for (var i = 0; i < 3; i++) if (!fr[i] && !close(sys, i, A[i], B[i], plain)) return false;
    return true;
  }

  // Lo que sale con cada error típico (solo los que aplican a esa dirección).
  function mistakes(from, to, a) {
    var m = {};
    if (from === to) return m;
    if (to === 'rect') {
      if (from === 'cyl') m.degrees = toRect('cyl', [a[0], a[1] * RAD, a[2]]);
      else {
        m.phiFromPlane = toRect('sph', [a[0], a[1], HALF - a[2]]);
        m.degrees = toRect('sph', [a[0], a[1] * RAD, a[2] * RAD]);
        m.swapRRho = [a[0] * Math.cos(a[1]), a[0] * Math.sin(a[1]), a[0] * Math.cos(a[2])];
      }
      return m;
    }
    var P = toRect(from, a), x = P[0], y = P[1], z = P[2];
    var c = rectToCyl(x, y, z), s = rectToSph(x, y, z);
    var th = from === 'rect' ? c.theta : norm2pi(a[1]);          // si te dan θ, se conserva
    var T = to === 'cyl' ? [c.r, th, z] : [s.rho, th, s.phi];
    if (from === 'rect' && Math.abs(x) > EPS) { m.quadrant = T.slice(); m.quadrant[1] = Math.atan(y / x); }
    if (to === 'sph') {
      m.phiFromPlane = [s.rho, th, HALF - s.phi];
      m.swapRRho = [c.r, th, s.phi];
    } else {
      if (from === 'sph') m.phiFromPlane = [a[0] * Math.cos(a[2]), th, a[0] * Math.sin(a[2])];
      m.swapRRho = [s.rho, th, z];
    }
    m.degrees = T.map(function (t, i) { return isAngle(to, i) ? t * DEG : t; });
    return m;
  }
  // Ángulos en grados: basta con que uno de los ángulos esté en grados y lo demás bien.
  function degMatch(sys, T, S, fr) {
    var used = false;
    for (var i = 0; i < 3; i++) {
      if (fr[i]) continue;
      if (isAngle(sys, i) && Math.abs(T[i]) > 0.02 && close(sys, i, T[i] * DEG, S[i], true)) { used = true; continue; }
      if (!close(sys, i, T[i], S[i])) return false;
    }
    return used;
  }
  var ORDER = ['quadrant', 'phiFromPlane', 'degrees', 'swapRRho'];
  // → { kind: 'ok' | 'warn' | 'partial' | 'bad' | 'invalid', key, truth, wrong[3] }
  function diagnose(from, to, given, student) {
    var T = convert(from, to, given), P = toRect(from, given);
    if (!student || student.length !== 3 || !student.every(function (s) { return typeof s === 'number' && isFinite(s); })) return { kind: 'invalid', key: null, truth: T, wrong: [true, true, true] };
    var fr = freeMask(to, P);
    var good = T.map(function (t, i) { return fr[i] || close(to, i, t, student[i]); });
    var wrong = good.map(function (g) { return !g; });
    if (good.every(Boolean)) return { kind: 'ok', key: null, truth: T, wrong: wrong };
    var M = mistakes(from, to, given);
    for (var k = 0; k < ORDER.length; k++) {
      var key = ORDER[k], mk = M[key];
      if (!mk) continue;
      var hit;
      if (key === 'degrees' && to !== 'rect') hit = degMatch(to, T, student, fr);
      else hit = !sameMasked(to, T, mk, fr) && sameMasked(to, mk, student, fr);
      if (hit) return { kind: 'warn', key: key, truth: T, wrong: wrong };
    }
    return { kind: good.some(Boolean) ? 'partial' : 'bad', key: null, truth: T, wrong: wrong };
  }

  // Superficie de «coordenada = c» (OpenStax §2.7).
  var SURF = {
    'plano-vertical': 'plano vertical', 'plano-horizontal': 'plano horizontal', cilindro: 'cilindro circular con eje z',
    'eje-z': 'el eje z', semiplano: 'semiplano vertical que sale del eje z', esfera: 'esfera con centro en el origen',
    origen: 'el origen', 'cono-arriba': 'cono con vértice en el origen, abierto hacia arriba',
    'cono-abajo': 'cono con vértice en el origen, abierto hacia abajo', 'plano-xy': 'el plano xy',
    'semieje-z+': 'el semieje z positivo', 'semieje-z-': 'el semieje z negativo', vacio: 'ningún punto'
  };
  function surface(v, c) {
    var k;
    if (v === 'x' || v === 'y') k = 'plano-vertical';
    else if (v === 'z') k = 'plano-horizontal';
    else if (v === 'r') k = c > EPS ? 'cilindro' : Math.abs(c) <= EPS ? 'eje-z' : 'vacio';
    else if (v === 'theta') k = 'semiplano';
    else if (v === 'rho') k = c > EPS ? 'esfera' : Math.abs(c) <= EPS ? 'origen' : 'vacio';
    else if (v === 'phi') {
      if (c < -EPS || c > Math.PI + EPS) k = 'vacio';
      else if (Math.abs(c) <= EPS) k = 'semieje-z+';
      else if (Math.abs(c - Math.PI) <= EPS) k = 'semieje-z-';
      else if (Math.abs(c - HALF) <= EPS) k = 'plano-xy';
      else k = c < HALF ? 'cono-arriba' : 'cono-abajo';
    } else k = 'vacio';
    return { kind: k, name: SURF[k] };
  }

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  // Múltiplo sencillo de π como texto ('2π/3', 'π', '0'); null si no lo es.
  function piForm(t) {
    var dens = [1, 2, 3, 4, 6, 12];
    for (var j = 0; j < dens.length; j++) {
      var d = dens[j], n = Math.round(t / Math.PI * d);
      if (Math.abs(n * Math.PI / d - t) > 1e-9) continue;
      if (n === 0) return '0';
      var g = gcd(n, d), nn = Math.abs(n / g), dd = d / g;
      return (n < 0 ? '−' : '') + (nn === 1 ? '' : nn) + 'π' + (dd === 1 ? '' : '/' + dd);
    }
    return null;
  }
  function pick(list, rnd) { return list[Math.floor(rnd() * list.length)]; }
  var THS = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11].map(function (k) { return k * Math.PI / 6; }).concat([1, 3, 5, 7].map(function (k) { return k * Math.PI / 4; }));
  var PHS = [1, 2, 3, 4, 6].map(function (k) { return k * Math.PI / 6; }).concat([Math.PI / 4, 3 * Math.PI / 4]);
  // Un punto con números amables en el sistema dado; siempre cabe en la caja [−4, 4]³.
  function nicePoint(sys, rnd) {
    rnd = rnd || Math.random;
    if (sys === 'rect') {
      var x, y;
      do { x = pick([-4, -3, -2, -1, 0, 1, 2, 3, 4], rnd); y = pick([-4, -3, -2, -1, 0, 1, 2, 3, 4], rnd); } while (x === 0 && y === 0);
      return [x, y, pick([-3, -2, -1, 1, 2, 3], rnd)];
    }
    if (sys === 'cyl') return [pick([1, 2, 3, 4], rnd), pick(THS, rnd), pick([-3, -2, -1, 0, 1, 2, 3], rnd)];
    return [pick([2, 3, 4], rnd), pick(THS, rnd), pick(PHS, rnd)];
  }

  window.LabMath.coords = {
    norm2pi: norm2pi, rectToCyl: rectToCyl, cylToRect: cylToRect, rectToSph: rectToSph, sphToRect: sphToRect,
    cylToSph: cylToSph, sphToCyl: sphToCyl, convert: convert, toRect: toRect, mistakes: mistakes, diagnose: diagnose,
    surface: surface, piForm: piForm, nicePoint: nicePoint, angDist: angDist, NAMES: NAMES
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var SYS = [['rect', 'Rectangulares (x, y, z)'], ['cyl', 'Cilíndricas (r, θ, z)'], ['sph', 'Esféricas (ρ, θ, φ)']];
  var SYM = { rect: ['x', 'y', 'z'], cyl: ['r', 'θ', 'z'], sph: ['ρ', 'θ', 'φ'] };
  var LIM = 4;

  function msgFor(key, to, from) {
    if (key === 'quadrant') return ['Revisa el cuadrante de θ', 'arctan(y/x) solo da ángulos entre −π/2 y π/2. Si x < 0, el punto está del lado izquierdo: súmale π. En el dibujo, ese ángulo (en rojo) apunta al lado contrario.'];
    if (key === 'phiFromPlane') return ['Mediste φ desde el plano xy', 'Aquí φ se mide desde el eje z positivo, de 0 a π. Lo que usaste es su complemento, π/2 − φ (el arco rojo del dibujo).'];
    if (key === 'degrees') return to === 'rect'
      ? ['La calculadora estaba en grados', 'Los ángulos que te dieron están en radianes. Pon la calculadora en radianes y vuelve a evaluar el seno y el coseno.']
      : ['Tus ángulos están en grados', 'En este curso los ángulos van en radianes. Multiplica los grados por π/180.'];
    if (key === 'swapRRho') {
      if (to === 'cyl') return ['Confundiste r con ρ', 'r es la distancia al eje z, √(x² + y²) = ρ sin φ. ρ es la distancia al origen y sí incluye z.'];
      if (to === 'sph') return ['Confundiste ρ con r', 'ρ es la distancia al origen: √(x² + y² + z²) = √(r² + z²). r solo mide la distancia al eje z.'];
      return ['Usaste ρ como si fuera r', 'Para x y y primero baja al plano: r = ρ sin φ. Luego x = r cos θ y y = r sin θ.'];
    }
    return null;
  }

  window.Labs['coord-convert'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, M = window.LabMath.coords;
    var st = cfg.start || {};
    var from = st.from || 'rect', to = st.to || 'sph';
    var P = (st.p || [-2, 2, 2]).slice();                 // el punto, siempre en rectangulares
    var given = convert('rect', from, P);                    // lo que se le muestra al alumno
    var student = null, result = null, revealed = false, math = null;
    var az = -35, EL = 22;

    var fromSel = UI.select({ label: 'Te doy el punto en', options: SYS.map(function (s) { return s[1]; }) });
    var toSel = UI.select({ label: 'Tú lo escribes en', options: SYS.map(function (s) { return s[1]; }) });
    var givenBox = h('p', { class: 'lab-given', 'aria-live': 'polite' });
    var ins = [0, 1, 2].map(function () { return UI.input({ label: '', type: 'text', inputmode: 'text' }); });
    ins.forEach(function (f) { f.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } }); });
    var help = h('p', { class: 'lab-field__hint' }, ['Ángulos en radianes. Puedes escribir pi o π: por ejemplo 3*pi/4 o sqrt(2).']);
    var run = UI.button('Comprobar', 'primary', check);
    var fresh = UI.button('Nuevo punto', 'ghost', function () { newPoint(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var note = h('p', { class: 'lab-note' });
    var zS = UI.slider({ label: 'Altura z del punto', min: -LIM, max: LIM, step: 0.5, value: P[2], fmt: function () { return fmtNum(P[2]); } }, function (v) {
      P[2] = v; zS.set(v); moved();
    });
    var moveNote = h('p', { class: 'lab-field__hint' }, ['Arrastra el punto en la gráfica para moverlo en horizontal; la altura, con este deslizador.']);
    var facts = h('dl', { class: 'lab-facts' });

    var svg3 = UI.svg(640, 580, 'Vista 3D: el punto P con r y θ en el plano xy, su altura z, y ρ y φ desde el origen');
    svg3.classList.add('cc-board', 'cc-3d');
    var svgPlan = UI.svg(400, 360, 'Planta: el plano xy visto desde arriba, con r y θ');
    var svgCut = UI.svg(400, 360, 'Corte vertical por el eje z y el punto, con ρ, φ, r y z');
    svgPlan.classList.add('cc-board'); svgCut.classList.add('cc-board');
    var flat = h('div', { class: 'cc-flat' }, [
      h('div', { class: 'cc-pane' }, [h('p', { class: 'lab-note' }, ['Planta: r y θ']), svgPlan]),
      h('div', { class: 'cc-pane' }, [h('p', { class: 'lab-note' }, ['Corte vertical: ρ y φ']), svgCut])
    ]);
    var wideQ = window.matchMedia ? window.matchMedia('(min-width: 961px)') : { matches: false };
    var btn3d = UI.button('Vista 3D', 'ghost', function () { setView('3d'); });
    var btn2d = UI.button('Vistas planas', 'ghost', function () { setView('flat'); });
    var viewBar = h('div', { class: 'lab-buttons lab-viewbar', role: 'group', 'aria-label': 'Tipo de vista' }, [btn3d, btn2d]);
    var view = wideQ.matches ? '3d' : 'flat';
    var note3d = h('p', { class: 'lab-note' }, ['Arrastra P para moverlo; arrastra el fondo para girar la vista.']);

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        fromSel.node, toSel.node, givenBox,
        h('div', { class: 'cc-row3' }, ins.map(function (f) { return f.node; })), help,
        h('div', { class: 'lab-buttons' }, [run, fresh]), verdict, note,
        zS.node, moveNote
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Un punto, tres sistemas']),
        viewBar, svg3, note3d, flat,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'r y θ']),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'z']),
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'ρ y φ']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu punto'])
        ]),
        facts
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    fromSel.input.value = String(SYS.findIndex(function (s) { return s[0] === from; }));
    toSel.input.value = String(SYS.findIndex(function (s) { return s[0] === to; }));
    fromSel.input.addEventListener('change', function () {
      from = SYS[+fromSel.input.value][0];
      if (from === to) { to = SYS[(+fromSel.input.value + 1) % 3][0]; toSel.input.value = String((+fromSel.input.value + 1) % 3); }
      newPoint();
    });
    toSel.input.addEventListener('change', function () {
      to = SYS[+toSel.input.value][0];
      if (from === to) { from = SYS[(+toSel.input.value + 2) % 3][0]; fromSel.input.value = String((+toSel.input.value + 2) % 3); given = convert('rect', from, P); }
      reset();
    });

    /* ---------- Formato ---------- */
    function fmtNum(v) { var s = Number((Math.abs(v) < 0.005 ? 0 : v).toFixed(2)).toString(); return s.replace('-', '−'); }
    function fmtVal(v, ang) {
      if (ang) { var p = piForm(v); if (p && p !== '0') return p + ' ≈ ' + fmtNum(v); }
      return fmtNum(v);
    }
    function triple(sys, a) { return '(' + a.map(function (v, i) { return fmtVal(v, isAngle(sys, i)); }).join(', ') + ')'; }
    function showGiven() {
      givenBox.textContent = 'P en ' + (from === 'rect' ? 'rectangulares' : from === 'cyl' ? 'cilíndricas' : 'esféricas') + ': (' + SYM[from].join(', ') + ') = ' + triple(from, given);
      ins.forEach(function (f, i) {
        f.node.querySelector('label').textContent = 'Tu ' + SYM[to][i] + (isAngle(to, i) ? ' (rad)' : '');
        f.input.setAttribute('aria-label', 'Tu ' + SYM[to][i]);
      });
    }

    /* ---------- Estado ---------- */
    function reset() { student = null; result = null; revealed = false; verdict.hidden = true; note.textContent = ''; ins.forEach(function (f) { f.input.value = ''; }); showGiven(); draw(); }
    function moved() { given = convert('rect', from, P); reset(); }
    function newPoint() {
      var g;
      do { g = M.nicePoint(from); } while (Math.abs(toRect(from, g)[0] - P[0]) < 1e-6 && Math.abs(toRect(from, g)[1] - P[1]) < 1e-6 && Math.abs(toRect(from, g)[2] - P[2]) < 1e-6);
      given = g.slice(); P = toRect(from, g);
      zS.set(P[2]);
      student = null; result = null; revealed = false; verdict.hidden = true; note.textContent = '';
      ins.forEach(function (f) { f.input.value = ''; });
      showGiven(); draw();
    }
    function parseVal(s) {
      var t = String(s || '').trim().replace(/π/g, 'pi').replace(/,/g, '.').replace(/−/g, '-').replace(/√/g, 'sqrt');
      if (!t) return NaN;
      var n = Number(t);
      if (isFinite(n)) return n;
      if (math) { try { var e = math.evaluate(t); if (typeof e === 'number') return e; } catch (err) { /* no es número */ } }
      return NaN;
    }
    function check() {
      var S = ins.map(function (f) { return parseVal(f.input.value); });
      if (!S.every(isFinite)) { student = null; result = null; UI.verdict(verdict, 'bad', 'Escribe tus tres números', 'Faltan ' + SYM[to].filter(function (_, i) { return !isFinite(S[i]); }).join(', ') + '. Usa punto decimal; puedes escribir pi.'); draw(); return; }
      student = S; revealed = true;
      result = diagnose(from, to, given, S);
      var names = SYM[to];
      if (result.kind === 'ok') UI.verdict(verdict, 'ok', 'Tu conversión es correcta', result.truth && freeMask(to, P)[1] ? 'Está sobre el eje z: ahí cualquier θ sirve. Arrastra el punto o pide otro.' : 'Los tres números describen el mismo punto. Arrastra el punto o pide otro.');
      else if (result.kind === 'warn') { var m = msgFor(result.key, to, from); UI.verdict(verdict, 'warn', m[0], m[1]); }
      else if (result.kind === 'partial') {
        var bad = names.filter(function (_, i) { return result.wrong[i]; }), okn = names.filter(function (_, i) { return !result.wrong[i]; });
        UI.verdict(verdict, 'bad', 'Bien ' + okn.join(' y ') + '; revisa ' + bad.join(' y '), hintFor(bad));
      } else UI.verdict(verdict, 'bad', 'Tu punto no coincide', 'Si te pierdes, pasa primero a rectangulares y de ahí al sistema que te piden. Compara tu punto (punteado) con P en el dibujo.');
      draw();
    }
    function hintFor(bad) {
      var tips = { x: 'x = r cos θ', y: 'y = r sin θ', z: to === 'rect' && from === 'sph' ? 'z = ρ cos φ' : 'z no cambia entre rectangulares y cilíndricas', r: 'r = √(x² + y²) = ρ sin φ', 'θ': 'θ sale de tan θ = y/x, en el cuadrante de (x, y)', 'ρ': 'ρ = √(x² + y² + z²) = √(r² + z²)', 'φ': 'φ = arccos(z/ρ), entre 0 y π' };
      return bad.map(function (k) { return tips[k]; }).join('; ') + '.';
    }

    /* ---------- Dibujo: utilidades ---------- */
    function add(parent, tag, attrs, txt) {
      if (!UI.svgOk(attrs)) return null;
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (txt != null) n.textContent = txt;
      parent.appendChild(n);
      return n;
    }
    function segPts(a, b, pts) { var n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3)); for (var i = 0; i <= n; i++) pts.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]); }
    function path(layer, list, cls, w, dash, pts) {
      if (list.length < 2) return;
      add(layer, 'path', { class: cls, fill: 'none', 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': dash,
        d: list.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('') });
      if (pts) for (var i = 1; i < list.length; i++) segPts(list[i - 1], list[i], pts);
    }
    function arrowHead(layer, a, b, cls, w, pts) {
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      if (L < 4) return;
      var ux = dx / L, uy = dy / L, k = 10;
      path(layer, [[b[0] - k * ux - k * 0.55 * uy, b[1] - k * uy + k * 0.55 * ux], b, [b[0] - k * ux + k * 0.55 * uy, b[1] - k * uy - k * 0.55 * ux]], cls, w, null, pts);
    }
    function circlePts(x, y, r, pts) { for (var a = 0; a < TAU; a += 0.35) pts.push([x + r * Math.cos(a), y + r * Math.sin(a)]); }
    // Etiquetas que no tocan trazos ni otras etiquetas: prueba 16 direcciones a tres distancias.
    function labels(layer, list, pts, W, H, fs) {
      list.forEach(function (L) {
        var w = String(L.t).length * fs * 0.62 + 4, best = null;
        var radii = L.r || [20, 30, 42, 56];   // r: [] manda la etiqueta directo a la esquina
        for (var ri = 0; ri < radii.length && !best; ri++) {
          for (var j = 0; j < 16 && !best; j++) {
            var ang = (L.a0 || 0) + j * Math.PI / 8, cx = L.x + radii[ri] * Math.cos(ang), cy = L.y + radii[ri] * Math.sin(ang);
            var l = cx - w / 2, r = cx + w / 2, t = cy - fs * 0.62, b = cy + fs * 0.5;
            if (l < 3 || r > W - 3 || t < 3 || b > H - 3) continue;
            var hit = pts.some(function (p) { return p[0] > l - 2 && p[0] < r + 2 && p[1] > t - 2 && p[1] < b + 2; });
            if (!hit) best = [cx, cy];
          }
        }
        if (!best && L.corner) {          // sin lugar junto al trazo: va como nota en la esquina de abajo
          add(layer, 'text', { x: 12, y: (H - 12).toFixed(1), class: 'ann', 'font-size': fs }, L.corner);
          return;
        }
        if (!best) return;
        add(layer, 'text', { x: best[0].toFixed(1), y: (best[1] + fs * 0.35).toFixed(1), class: 'ann', 'text-anchor': 'middle', 'font-size': fs }, L.t);
        for (var xx = best[0] - w / 2; xx <= best[0] + w / 2; xx += 3) for (var yy = best[1] - fs * 0.6; yy <= best[1] + fs * 0.5; yy += 3) pts.push([xx, yy]);
      });
    }
    function handle(layer, x, y, view) {
      var g = add(layer, 'g', { class: 'cc-handle', 'data-view': view });
      if (!g) return;
      add(g, 'circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 7.5, class: 'dot-ref' });
      add(g, 'circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 24, class: 'cc-hit' });
    }
    function studentRect() {
      if (!student) return null;
      var q = toRect(to, student);
      return q.every(function (v) { return isFinite(v) && Math.abs(v) <= 2.2 * LIM; }) ? q : null;
    }

    /* ---------- Vista 3D ---------- */
    var proj = null, S3 = 46, CX = 320, CY = 270;
    function makeProj() {
      var ca = Math.cos(az * RAD), sa = Math.sin(az * RAD), ce = Math.cos(EL * RAD), se = Math.sin(EL * RAD);
      proj = function (p) { var xr = p[0] * ca - p[1] * sa, yr = p[0] * sa + p[1] * ca; return [CX + S3 * yr, CY - S3 * (p[2] * ce - xr * se)]; };
      proj.inv = function (X, Y, z0) {          // punto del plano z = z0 bajo el cursor
        var A = (X - CX) / S3, B = (z0 * ce - (CY - Y) / S3) / se;
        return [ca * B + sa * A, -sa * B + ca * A];
      };
    }
    function draw3D() {
      makeProj();
      svg3.innerHTML = '';
      var layer = add(svg3, 'g', { class: 'sketch' }), pts = [];
      var x = P[0], y = P[1], z = P[2], c = rectToCyl(x, y, z), s = rectToSph(x, y, z);
      var O = proj([0, 0, 0]), Q = proj([x, y, 0]), PP = proj([x, y, z]);
      // Rejilla del plano xy
      for (var g = -LIM; g <= LIM; g += 2) {
        path(layer, [proj([g, -LIM, 0]), proj([g, LIM, 0])], 'plot-grid', 1, null, null);
        path(layer, [proj([-LIM, g, 0]), proj([LIM, g, 0])], 'plot-grid', 1, null, null);
      }
      // Ejes: parte negativa punteada, positiva con flecha
      var AX = 4.9, names = ['x', 'y', 'z'];
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(function (e, i) {
        var neg = proj([-e[0] * LIM, -e[1] * LIM, -e[2] * LIM]), pos = proj([e[0] * AX, e[1] * AX, e[2] * AX]);
        path(layer, [neg, O], 'axis', 1.2, '4 5', pts);
        path(layer, [O, pos], 'axis', 1.6, null, pts);
        arrowHead(layer, O, pos, 'axis', 1.6, pts);
        var dx = pos[0] - O[0], dy = pos[1] - O[1], m = Math.hypot(dx, dy) || 1;
        var tx = pos[0] + dx / m * 16, ty = pos[1] + dy / m * 16;
        add(layer, 'text', { x: tx.toFixed(1), y: (ty + 6).toFixed(1), class: 'ann', 'text-anchor': 'middle', 'font-size': 20 }, names[i]);
        circlePts(tx, ty, 10, pts);
      });
      // Guías punteadas de x y y
      path(layer, [Q, proj([x, 0, 0])], 'axis', 1.2, '3 4', pts);
      path(layer, [Q, proj([0, y, 0])], 'axis', 1.2, '3 4', pts);
      var lab = [];
      // r y θ (en el plano xy)
      if (c.r > 1e-6) {
        path(layer, [O, Q], 'aux', 3.2, null, pts);
        lab.push({ t: 'r', x: (O[0] + Q[0]) / 2, y: (O[1] + Q[1]) / 2 });
        if (c.theta > 0.05) {
          var a = Math.min(1.3, 0.55 * c.r), arc = [];
          for (var u = 0; u <= 40; u++) { var t = c.theta * u / 40; arc.push(proj([a * Math.cos(t), a * Math.sin(t), 0])); }
          path(layer, arc, 'aux', 2.2, null, pts);
          var tm = c.theta / 2, tp = proj([(a + 0.5) * Math.cos(tm), (a + 0.5) * Math.sin(tm), 0]);
          lab.push({ t: 'θ', x: tp[0], y: tp[1], r: [0, 10, 18, 28] });
        }
      }
      // z (vertical) y ρ
      if (Math.abs(z) > 1e-6) { path(layer, [Q, PP], 'trace', 3, null, pts); lab.push({ t: 'z', x: (Q[0] + PP[0]) / 2, y: (Q[1] + PP[1]) / 2 }); }
      if (s.rho > 1e-6) {
        path(layer, [O, PP], 'ref', 3.4, null, pts);
        lab.push({ t: 'ρ', x: (O[0] + PP[0]) / 2, y: (O[1] + PP[1]) / 2 });
        if (s.phi > 0.05) {
          var b = Math.min(1.5, 0.5 * s.rho), arc2 = [], th = c.r > 1e-6 ? c.theta : 0;
          for (var v = 0; v <= 40; v++) { var f = s.phi * v / 40; arc2.push(proj([b * Math.sin(f) * Math.cos(th), b * Math.sin(f) * Math.sin(th), b * Math.cos(f)])); }
          path(layer, arc2, 'ref', 2.2, null, pts);
          var fm = s.phi / 2, fp = proj([(b + 0.5) * Math.sin(fm) * Math.cos(th), (b + 0.5) * Math.sin(fm) * Math.sin(th), (b + 0.5) * Math.cos(fm)]);
          lab.push({ t: 'φ', x: fp[0], y: fp[1], r: [0, 10, 18, 28] });
        }
      }
      // Los dos errores de ángulo, en rojo: arctan(y/x) sin cuadrante y φ medido desde el plano.
      if (result && result.key === 'quadrant' && c.r > 1e-6) {
        var wa = Math.atan(y / x), W1 = proj([c.r * Math.cos(wa), c.r * Math.sin(wa), 0]);
        path(layer, [O, W1], 'error', 2.4, '6 5', pts);
        lab.push({ t: 'arctan(y/x)', x: W1[0], y: W1[1], r: [], corner: 'en rojo: arctan(y/x), sin corregir el cuadrante' });
      }
      if (result && result.key === 'phiFromPlane' && s.rho > 1e-6 && c.r > 1e-6) {
        var e = Math.min(2.2, 0.8 * s.rho), lat = HALF - s.phi, arc3 = [];
        for (var w = 0; w <= 30; w++) { var gg = lat * w / 30; arc3.push(proj([e * Math.cos(gg) * Math.cos(c.theta), e * Math.cos(gg) * Math.sin(c.theta), e * Math.sin(gg)])); }
        path(layer, arc3, 'error', 2.2, '6 5', pts);
        var lm = arc3[15];
        lab.push({ t: 'π/2 − φ', x: lm[0], y: lm[1], r: [], corner: 'en rojo: π/2 − φ, que no es φ' });
      }
      // Tu punto
      var sr = studentRect();
      if (sr) {
        var SP = proj(sr);
        path(layer, [O, SP], 'student', 2.4, null, pts);
        add(layer, 'circle', { cx: SP[0].toFixed(1), cy: SP[1].toFixed(1), r: 6, class: 'dot-student' });
        circlePts(SP[0], SP[1], 9, pts);
        lab.push({ t: 'tu punto', x: SP[0], y: SP[1], r: [22, 34, 48] });
      }
      add(layer, 'circle', { cx: Q[0].toFixed(1), cy: Q[1].toFixed(1), r: 4, class: 'dot-aux' });
      circlePts(Q[0], Q[1], 6, pts); circlePts(PP[0], PP[1], 10, pts);
      handle(layer, PP[0], PP[1], '3d');
      lab.unshift({ t: 'P', x: PP[0], y: PP[1], r: [20, 30, 42] });
      labels(layer, lab, pts, 640, 580, 21);
    }

    /* ---------- Vistas planas ---------- */
    var plan = null, cut = null;
    function drawPlan() {
      var x = P[0], y = P[1], c = rectToCyl(x, y, P[2]);
      plan = window.LabPlot(svgPlan, { x: [-LIM - 0.7, LIM + 0.7], y: [-LIM - 0.7, LIM + 0.7], equal: true });
      plan.clear(); plan.grid(); plan.axes();
      var layer = svgPlan.lastChild, pts = [], X = plan.X, Y = plan.Y;
      var O = [X(0), Y(0)], Q = [X(x), Y(y)];
      // ejes (para no poner etiquetas encima)
      segPts([X(-LIM - 0.7), Y(0)], [X(LIM + 0.7), Y(0)], pts); segPts([X(0), Y(-LIM - 0.7)], [X(0), Y(LIM + 0.7)], pts);
      tickBand(X, Y, pts);
      path(layer, [Q, [X(x), Y(0)]], 'axis', 1.2, '3 4', pts);
      path(layer, [Q, [X(0), Y(y)]], 'axis', 1.2, '3 4', pts);
      var lab = [];
      add(layer, 'text', { x: (X(LIM + 0.7) - 6).toFixed(1), y: (Y(0) - 8).toFixed(1), class: 'ann', 'text-anchor': 'end', 'font-size': 20 }, 'x');
      add(layer, 'text', { x: (X(0) + 10).toFixed(1), y: (Y(LIM + 0.7) + 18).toFixed(1), class: 'ann', 'font-size': 20 }, 'y');
      circlePts(X(LIM + 0.7) - 12, Y(0) - 14, 10, pts); circlePts(X(0) + 16, Y(LIM + 0.7) + 12, 10, pts);
      if (c.r > 1e-6) {
        path(layer, [O, Q], 'aux', 3.2, null, pts);
        lab.push({ t: 'r', x: (O[0] + Q[0]) / 2, y: (O[1] + Q[1]) / 2 });
        if (c.theta > 0.05) {
          var a = Math.min(1.1, 0.5 * c.r), arc = [];
          for (var u = 0; u <= 40; u++) { var t = c.theta * u / 40; arc.push([X(a * Math.cos(t)), Y(a * Math.sin(t))]); }
          path(layer, arc, 'aux', 2.2, null, pts);
          lab.push({ t: 'θ', x: X((a + 0.45) * Math.cos(c.theta / 2)), y: Y((a + 0.45) * Math.sin(c.theta / 2)), r: [0, 10, 18, 28] });
        }
      }
      // El error del cuadrante: el ángulo de arctan(y/x) apunta al otro lado.
      if (result && result.key === 'quadrant') {
        var wa = Math.atan(y / x), L = c.r;
        path(layer, [O, [X(L * Math.cos(wa)), Y(L * Math.sin(wa))]], 'error', 2.4, '6 5', pts);
        lab.push({ t: 'arctan(y/x)', x: X(L * Math.cos(wa)), y: Y(L * Math.sin(wa)), r: [18, 30, 44] });
      }
      var sr = studentRect();
      if (sr) {
        var SP = [X(sr[0]), Y(sr[1])];
        if (SP[0] > 46 && SP[0] < 386 && SP[1] > 14 && SP[1] < 330) {
          add(layer, 'circle', { cx: SP[0].toFixed(1), cy: SP[1].toFixed(1), r: 6, class: 'dot-student' });
          circlePts(SP[0], SP[1], 9, pts);
        }
      }
      circlePts(Q[0], Q[1], 10, pts);
      handle(layer, Q[0], Q[1], 'plan');
      lab.unshift({ t: 'P', x: Q[0], y: Q[1], r: [20, 30, 42] });
      labels(layer, lab, pts, 400, 360, 20);
    }
    // Franjas de los números de los ejes (LabPlot los pone abajo del eje x y a la izquierda del eje y).
    function tickBand(X, Y, pts) {
      for (var u = 46; u <= 386; u += 4) { pts.push([u, Y(0) + 9]); pts.push([u, Y(0) + 15]); }
      for (var w = 14; w <= 330; w += 4) { pts.push([X(0) - 12, w]); pts.push([X(0) - 24, w]); }
    }
    function drawCut() {
      var c = rectToCyl(P[0], P[1], P[2]), s = rectToSph(P[0], P[1], P[2]), r = c.r, z = P[2];
      var RMAX = LIM * Math.SQRT2 + 0.4;
      cut = window.LabPlot(svgCut, { x: [-0.8, RMAX], y: [-LIM - 0.6, LIM + 0.6], equal: true });
      cut.clear(); cut.grid(); cut.axes();
      var layer = svgCut.lastChild, pts = [], X = cut.X, Y = cut.Y;
      var O = [X(0), Y(0)], PP = [X(r), Y(z)], F = [X(r), Y(0)];
      segPts([X(-0.8), Y(0)], [X(RMAX), Y(0)], pts); segPts([X(0), Y(-LIM - 0.6)], [X(0), Y(LIM + 0.6)], pts);
      tickBand(X, Y, pts);
      add(layer, 'text', { x: (X(0) + 10).toFixed(1), y: (Y(LIM + 0.6) + 18).toFixed(1), class: 'ann', 'font-size': 20 }, 'z');
      circlePts(X(0) + 16, Y(LIM + 0.6) + 12, 10, pts);
      var lab = [];
      if (r > 1e-6) { path(layer, [O, F], 'aux', 3.2, null, pts); lab.push({ t: 'r', x: (O[0] + F[0]) / 2, y: F[1] }); }
      if (Math.abs(z) > 1e-6) { path(layer, [F, PP], 'trace', 3, null, pts); lab.push({ t: 'z', x: F[0], y: (F[1] + PP[1]) / 2 }); }
      if (s.rho > 1e-6) {
        path(layer, [O, PP], 'ref', 3.4, null, pts);
        lab.push({ t: 'ρ', x: (O[0] + PP[0]) / 2, y: (O[1] + PP[1]) / 2 });
        if (s.phi > 0.05) {
          var b = Math.min(1.2, 0.5 * s.rho), arc = [];
          for (var u = 0; u <= 40; u++) { var f = s.phi * u / 40; arc.push([X(b * Math.sin(f)), Y(b * Math.cos(f))]); }
          path(layer, arc, 'ref', 2.2, null, pts);
          lab.push({ t: 'φ', x: X((b + 0.45) * Math.sin(s.phi / 2)), y: Y((b + 0.45) * Math.cos(s.phi / 2)), r: [0, 10, 18, 28] });
        }
        // El error de φ: el ángulo medido desde el plano (su complemento).
        if (result && result.key === 'phiFromPlane') {
          var e = Math.min(1.9, 0.75 * s.rho), arc3 = [], lat = HALF - s.phi;
          for (var w = 0; w <= 30; w++) { var g = lat * w / 30; arc3.push([X(e * Math.cos(g)), Y(e * Math.sin(g))]); }
          path(layer, arc3, 'error', 2.2, '6 5', pts);
          lab.push({ t: 'π/2 − φ', x: X((e + 0.4) * Math.cos(lat / 2)), y: Y((e + 0.4) * Math.sin(lat / 2)), r: [10, 22, 36, 52, 70, 90] });
        }
      }
      var sr = studentRect();
      if (sr) {
        var SP = [X(Math.hypot(sr[0], sr[1])), Y(sr[2])];
        if (SP[0] > 46 && SP[0] < 386 && SP[1] > 14 && SP[1] < 330) {
          add(layer, 'circle', { cx: SP[0].toFixed(1), cy: SP[1].toFixed(1), r: 6, class: 'dot-student' });
          circlePts(SP[0], SP[1], 9, pts);
        }
      }
      circlePts(PP[0], PP[1], 10, pts);
      handle(layer, PP[0], PP[1], 'cut');
      lab.unshift({ t: 'P', x: PP[0], y: PP[1], r: [20, 30, 42] });
      labels(layer, lab, pts, 400, 360, 20);
    }

    function drawFacts() {
      facts.innerHTML = '';
      var rows = SYS.map(function (sdef) {
        var sys = sdef[0], val;
        if (sys === to && !revealed) val = '? (escribe y comprueba)';
        else val = triple(sys, sys === from ? given : convert('rect', sys, P));
        return [sdef[1], val];
      });
      if (freeMask('cyl', P)[1]) rows.push(['nota', 'P está sobre el eje z: cualquier θ lo describe.']);
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }
    function draw() {
      if (view === '3d') draw3D();
      drawPlan(); drawCut();
      drawFacts();
    }
    function setView(v) {
      view = v === '3d' && wideQ.matches ? '3d' : 'flat';
      svg3.style.display = view === '3d' ? '' : 'none';
      note3d.hidden = view !== '3d';
      flat.hidden = view === '3d';
      viewBar.hidden = !wideQ.matches;
      btn3d.setAttribute('aria-pressed', String(view === '3d'));
      btn2d.setAttribute('aria-pressed', String(view !== '3d'));
      draw();
    }
    if (wideQ.addEventListener) wideQ.addEventListener('change', function () { setView(wideQ.matches ? '3d' : 'flat'); });

    /* ---------- Arrastre ---------- */
    function local(svg, e) {
      var m = svg.getScreenCTM();
      if (!m) return null;
      var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      return p.matrixTransform(m.inverse());
    }
    function snap(v) { return Math.max(-LIM, Math.min(LIM, Math.round(v * 2) / 2)); }
    function setXY(nx, ny) {
      if (nx === P[0] && ny === P[1]) return;
      P[0] = nx; P[1] = ny; moved();
    }
    var drag = null;
    function bind(svg, kind) {
      svg.addEventListener('pointerdown', function (e) {
        var g = e.target.closest ? e.target.closest('.cc-handle') : null;
        if (g) drag = { kind: kind };
        else if (kind === '3d') drag = { kind: 'rotate', x0: e.clientX, az0: az };
        else return;
        try { svg.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
        // Mientras se arrastra, nada de seleccionar texto de la página.
        document.documentElement.style.userSelect = 'none';
        if (window.getSelection) window.getSelection().removeAllRanges();
        e.preventDefault();
      });
      svg.addEventListener('pointermove', function (e) {
        if (!drag) return;
        if (drag.kind === 'rotate') { az = drag.az0 + (e.clientX - drag.x0) * 0.4; draw3D(); return; }
        var q = local(svg, e);
        if (!q) return;
        if (drag.kind === '3d') { var xy = proj.inv(q.x, q.y, P[2]); setXY(snap(xy[0]), snap(xy[1])); }
        else if (drag.kind === 'plan' && plan) {
          var sx = plan.X(1) - plan.X(0), sy = plan.Y(1) - plan.Y(0);
          setXY(snap((q.x - plan.X(0)) / sx), snap((q.y - plan.Y(0)) / sy));
        } else if (drag.kind === 'cut' && cut) {
          var kx = cut.X(1) - cut.X(0), ky = cut.Y(1) - cut.Y(0);
          var c = rectToCyl(P[0], P[1], P[2]), th = c.r > 1e-6 ? c.theta : 0;
          var cap = LIM / Math.max(Math.abs(Math.cos(th)), Math.abs(Math.sin(th)));
          var nr = Math.max(0, Math.min(cap, Math.round((q.x - cut.X(0)) / kx * 2) / 2)), nz = snap((q.y - cut.Y(0)) / ky);
          var nx = nr * Math.cos(th), ny = nr * Math.sin(th);
          if (Math.abs(nr - c.r) > 1e-9 || nz !== P[2]) { P[0] = nx; P[1] = ny; P[2] = nz; zS.set(nz); moved(); }
        }
      });
      function end() { drag = null; document.documentElement.style.userSelect = ''; }
      svg.addEventListener('pointerup', end);
      svg.addEventListener('pointercancel', end);
    }
    bind(svg3, '3d'); bind(svgPlan, 'plan'); bind(svgCut, 'cut');

    document.addEventListener('cb:themechange', draw);
    showGiven();
    setView(view);
    return UI.loadMath().then(function (m) {
      math = m;
      // Ejemplo cargado: un compañero usó arctan(y/x) sin ver el cuadrante.
      var ex = st.example || 'quadrant', mk = mistakes(from, to, given)[ex];
      if (mk) {
        ins.forEach(function (f, i) { f.input.value = fmtNum(mk[i]).replace('−', '-'); });
        check();
        revealed = false; drawFacts();       // el ejemplo no destapa la respuesta
        note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Ves el error? Corrígelo, arrastra el punto o pide uno nuevo.';
      }
    });
  };
})();
