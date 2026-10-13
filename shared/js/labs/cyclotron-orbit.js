/* =====================================================================
   Lab cyclotron-orbit (Física 3 · S03): movimiento de una carga en B uniforme.
   Cuatro modos sobre la hoja (B entra o sale de ella):
     órbita        la partícula entra moviéndose a la derecha y describe un
                   círculo de radio r = mv/|q|B con periodo T = 2πm/|q|B
     selector      placas con E y B cruzados: pasa recta si v = E/B
     espectrómetro dos isótopos acelerados por el mismo voltaje caen a
                   distancias 2r distintas: r mide la masa
     ciclotrón     la espiral de medias vueltas, f = |q|B/2πm y K máx = q²B²R²/2m
   La trayectoria se integra con el método de Boris (el estándar para
   partículas en campos E y B, que conserva la rapidez en B puro). Las pruebas
   comparan esa integración contra las fórmulas cerradas.
   Reto (modo órbita): el radio en cm. El «casi»:
     inverse   usó |q|B/mv
     diameter  dio el diámetro 2r
     meters    dio el radio en metros
     charge    para la alfa usó q = e en lugar de 2e
     mass      usó la masa de otra partícula (protón por electrón o al revés)
   ===================================================================== */
(function () {
  var E = 1.60e-19, MP = 1.67e-27, ME = 9.11e-31, U = 1.66e-27;
  var PARTICLES = {
    p: { name: 'protón', m: MP, q: E },
    e: { name: 'electrón', m: ME, q: -E },
    a: { name: 'partícula alfa', m: 4 * U, q: 2 * E },
    d: { name: 'deuterón', m: 2 * U, q: E }
  };

  /* ------------------------- Matemática pura (SI) ------------------------- */
  function radius(m, q, v, B) { return m * v / (Math.abs(q) * B); }
  function period(m, q, B) { return 2 * Math.PI * m / (Math.abs(q) * B); }
  function freq(m, q, B) { return Math.abs(q) * B / (2 * Math.PI * m); }
  function omega(m, q, B) { return Math.abs(q) * B / m; }
  function speedFromRadius(m, q, r, B) { return Math.abs(q) * B * r / m; }
  function momentum(q, r, B) { return Math.abs(q) * B * r; }
  // Rapidez después de acelerar desde el reposo por un voltaje V.
  function accelSpeed(m, q, V) { return Math.sqrt(2 * Math.abs(q) * V / m); }
  function selector(Ef, B) { return Ef / B; }
  // Espectrómetro: acelera por V y entra a B; cae a d = 2r de la rendija.
  function spectrometer(m, q, V, B) { var v = accelSpeed(m, q, V), r = radius(m, q, v, B); return { v: v, r: r, d: 2 * r }; }
  function massFromRadius(q, V, B, r) { return Math.abs(q) * B * B * r * r / (2 * V); }
  // Ciclotrón de radio R con voltaje dV entre las «des».
  function cyclotron(m, q, B, R, dV) {
    var Q = Math.abs(q), vmax = Q * B * R / m, K = 0.5 * m * vmax * vmax;
    return { f: freq(m, q, B), T: period(m, q, B), vmax: vmax, Kmax: K, KmaxEV: K / E, crossings: K / (Q * dV), turns: K / (2 * Q * dV) };
  }
  // Radio de la media vuelta n (después de n cruces del hueco, desde el reposo).
  function spiralRadius(m, q, B, dV, n) { return Math.sqrt(2 * m * n * Math.abs(q) * dV) / (Math.abs(q) * B); }
  // Hélice: v forma alfa (grados) con B.
  function helix(m, q, v, B, alphaDeg) {
    var a = alphaDeg * Math.PI / 180, vpar = v * Math.cos(a), vperp = v * Math.sin(a), T = period(m, q, B);
    return { vpar: vpar, vperp: vperp, r: radius(m, q, vperp, B), T: T, pitch: vpar * T };
  }
  // Integrador de Boris (salto de rana): p = { m, q, r0, v0, B, E, dt, steps }. La velocidad vive a
  // medio paso: se arranca con medio empujón desde v0 y luego x += v·dt, v ← Boris(v, dt).
  function simulate(p) {
    var m = p.m, q = p.q, dt = p.dt, B = p.B || [0, 0, 0], Ef = p.E || [0, 0, 0];
    var x = p.r0 ? p.r0.slice() : [0, 0, 0], v = p.v0.slice(), pts = [x.slice()], vs = [v.slice()];
    function cr(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
    function push(u, h) {
      var k = q * h / (2 * m), t = [k * B[0], k * B[1], k * B[2]], t2 = t[0] * t[0] + t[1] * t[1] + t[2] * t[2];
      var s = [2 * t[0] / (1 + t2), 2 * t[1] / (1 + t2), 2 * t[2] / (1 + t2)];
      var vm = [u[0] + k * Ef[0], u[1] + k * Ef[1], u[2] + k * Ef[2]];
      var c1 = cr(vm, t), vp1 = [vm[0] + c1[0], vm[1] + c1[1], vm[2] + c1[2]];
      var c2 = cr(vp1, s), vp = [vm[0] + c2[0], vm[1] + c2[1], vm[2] + c2[2]];
      return [vp[0] + k * Ef[0], vp[1] + k * Ef[1], vp[2] + k * Ef[2]];
    }
    v = push(v, dt / 2);
    for (var i = 0; i < p.steps; i++) {
      x = [x[0] + v[0] * dt, x[1] + v[1] * dt, x[2] + v[2] * dt];
      pts.push(x.slice()); vs.push(v.slice());
      if (p.stop && p.stop(x, v)) break;
      v = push(v, dt);
    }
    return { pts: pts, vs: vs };
  }
  // Órbita completa de una partícula que entra en el origen moviéndose hacia +x, con B = Bz ẑ.
  function orbit(m, q, v, Bz, n) {
    n = n || 400;
    var T = period(m, q, Math.abs(Bz));
    return simulate({ m: m, q: q, v0: [v, 0, 0], B: [0, 0, Bz], dt: T / n, steps: n });
  }
  // Centro de giro: hacia donde empuja F en el origen (+y si q·Bz < 0, porque x̂ × ẑ = −ŷ).
  function center(m, q, v, Bz) { var r = radius(m, q, v, Math.abs(Bz)); return [0, q * Bz < 0 ? r : -r]; }

  // Reto: c = { k (clave de partícula), v (m/s), B (T) }; respuesta: r en cm.
  function truthR(c) { var P = PARTICLES[c.k]; return radius(P.m, P.q, c.v, c.B) * 100; }
  function mistakes(c) {
    var P = PARTICLES[c.k], r = truthR(c), o = { inverse: Math.abs(P.q) * c.B / (P.m * c.v) * 100, diameter: 2 * r, meters: r / 100 };
    if (c.k === 'a') o.charge = 2 * r;
    if (c.k === 'p' || c.k === 'd') o.mass = radius(ME, P.q, c.v, c.B) * 100;
    if (c.k === 'e') o.mass = radius(MP, P.q, c.v, c.B) * 100;
    return o;
  }
  function diagnose(c, s, tol) {
    tol = tol || 0.03;
    if (!isFinite(s)) return 'bad';
    var t = truthR(c), m = mistakes(c), close = function (w) { return Math.abs(s - w) <= tol * Math.abs(w); };
    if (close(t)) return 'ok';
    if (c.k === 'a' && close(m.charge)) return 'charge';
    var keys = ['diameter', 'meters', 'mass', 'inverse'];
    for (var i = 0; i < keys.length; i++) if (m[keys[i]] != null && close(m[keys[i]])) return keys[i];
    return 'bad';
  }

  window.LabMath.orbit = {
    E: E, MP: MP, ME: ME, U: U, PARTICLES: PARTICLES,
    radius: radius, period: period, freq: freq, omega: omega, speedFromRadius: speedFromRadius, momentum: momentum,
    accelSpeed: accelSpeed, selector: selector, spectrometer: spectrometer, massFromRadius: massFromRadius,
    cyclotron: cyclotron, spiralRadius: spiralRadius, helix: helix, simulate: simulate, orbit: orbit, center: center,
    truthR: truthR, mistakes: mistakes, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var VW = 640, VH = 420;
  function fnum(v) { return String(v).replace('-', '−'); }
  function p3(v) { return fnum(Number((+v).toPrecision(3))); }
  function sciS(v) {
    if (!isFinite(v) || v === 0) return String(v);
    var ex = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, ex);
    if (ex >= -2 && ex <= 3) return p3(v);
    return fnum(m.toFixed(2)) + ' × 10' + String(ex).split('').map(function (c) { return c === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]; }).join('');
  }
  var MSG = {
    ok: ['Tu radio coincide', 'r = mv/|q|B.'],
    inverse: ['Invertiste la fórmula', 'El radio crece con la masa y la rapidez: r = mv/|q|B, no |q|B/mv.'],
    diameter: ['Ese es el diámetro', 'Te piden el radio: la mitad de lo que diste.'],
    meters: ['Revisa las unidades', 'Tu número está en metros; el reto pide centímetros.'],
    charge: ['Revisa la carga de la alfa', 'Una partícula alfa tiene dos protones: q = 2e.'],
    mass: ['Revisa la masa', 'Usaste la masa de otra partícula: mₚ = 1.67 × 10⁻²⁷ kg, mₑ = 9.11 × 10⁻³¹ kg.'],
    bad: ['Tu radio no coincide', 'Iguala la fuerza magnética con la centrípeta: |q|vB = mv²/r.']
  };
  var KIND = { ok: 'ok', inverse: 'warn', diameter: 'warn', meters: 'warn', charge: 'warn', mass: 'warn' };
  var KEYS = ['p', 'e', 'a', 'd'];
  // Escala de cada partícula: v en 10^vx m/s y B en unidades bu (T).
  var SCALE = { p: { vx: 6, bu: 0.1, bl: 'T' }, d: { vx: 6, bu: 0.1, bl: 'T' }, a: { vx: 6, bu: 0.1, bl: 'T' }, e: { vx: 7, bu: 1e-3, bl: 'mT' } };

  window.Labs['cyclotron-orbit'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var st = { mode: 0, k: 'p', vs: 2, bs: 4, out: false, Ek: 200, vsel: 5, V: 2, iso: 0, dV: 1, R: 5 }, chal = null, student = null, anim = 0, animT = 1;

    var modeSel = UI.select({ label: 'Modo', options: ['Órbita en un campo uniforme', 'Selector de velocidades', 'Espectrómetro de masas', 'Ciclotrón'] });
    var partSel = UI.select({ label: 'Partícula', options: KEYS.map(function (k) { return PARTICLES[k].name; }) });
    var sVel = UI.slider({ label: 'Rapidez', min: 0.5, max: 5, step: 0.5, value: st.vs, unit: '', fmt: function (x) { return x.toFixed(1) + ' × 10' + (SCALE[st.k].vx === 6 ? '⁶' : '⁷') + ' m/s'; } }, function (x) { st.vs = x; draw(); });
    var sB = UI.slider({ label: 'Campo B', min: 1, max: 10, step: 1, value: st.bs, unit: '', fmt: function (x) { var S = SCALE[st.k]; return S.bl === 'T' ? (x * 0.1).toFixed(1) + ' T' : x + ' mT'; } }, function (x) { st.bs = x; draw(); });
    var bDir = UI.button('B sale de la hoja', 'ghost', function () { st.out = !st.out; draw(); });
    var sE = UI.slider({ label: 'Campo E entre las placas', min: 10, max: 400, step: 10, value: st.Ek, unit: 'kN/C' }, function (x) { st.Ek = x; draw(); });
    var sVs = UI.slider({ label: 'Rapidez del protón', min: 1, max: 10, step: 0.5, value: st.vsel, unit: '', fmt: function (x) { return x.toFixed(1) + ' × 10⁵ m/s'; } }, function (x) { st.vsel = x; draw(); });
    var sV = UI.slider({ label: 'Voltaje de aceleración', min: 0.5, max: 5, step: 0.5, value: st.V, unit: 'kV' }, function (x) { st.V = x; draw(); });
    var isoSel = UI.select({ label: 'Isótopos', options: ['¹²C⁺ y ¹³C⁺', '²⁰Ne⁺ y ²²Ne⁺', '³⁵Cl⁺ y ³⁷Cl⁺'] });
    var sdV = UI.slider({ label: 'Voltaje entre las des', min: 0.5, max: 5, step: 0.5, value: st.dV, unit: 'kV' }, function (x) { st.dV = x; draw(); });
    var sR = UI.slider({ label: 'Radio del ciclotrón', min: 3, max: 6, step: 0.5, value: st.R, unit: 'cm' }, function (x) { st.R = x; draw(); });
    var bGo = UI.button('Lanzar la partícula', 'ghost', function () { launch(); });
    var gOrbit = h('div', {}, [partSel.node, sVel.node]), gSel = h('div', {}, [sVs.node, sE.node]), gSpec = h('div', {}, [isoSel.node, sV.node]), gCyc = h('div', {}, [sdV.node, sR.node]);

    var chalText = h('p', { class: 'lab-note' });
    var rIn = UI.input({ label: 'Tu radio r (cm)', type: 'text', inputmode: 'decimal', mono: false });
    var bCheck = UI.button('Comprobar', 'primary', check);
    var bNew = UI.button('Otro reto', 'ghost', function () { newChallenge(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var gReto = h('div', {}, [h('p', { class: 'lab-field__label' }, ['Reto: predice el radio']), chalText, rIn.node, h('div', { class: 'lab-buttons' }, [bCheck, bNew]), verdict]);
    var note = h('p', { class: 'lab-note', role: 'status' });

    var svg = UI.svg(VW, VH, 'Trayectoria de una partícula cargada en un campo magnético uniforme.');
    var legend = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--trace' }), 'trayectoria']),
      h('li', {}, [h('i', { class: 'sw sw--ref' }), 'velocidad']),
      h('li', {}, [h('i', { class: 'sw sw--error' }), 'fuerza magnética']),
      h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu radio'])
    ]);
    var facts = h('dl', { class: 'lab-facts' });

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [modeSel.node, gOrbit, sB.node, gSel, gSpec, gCyc, h('div', { class: 'lab-buttons' }, [bDir, bGo]), gReto, note]),
      h('figure', { class: 'lab-board' }, [h('figcaption', { class: 'lab-board__title sheet__title' }, ['Cargas en un campo magnético']), svg, legend, facts])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    rIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    modeSel.input.addEventListener('change', function () { setMode(+modeSel.input.value); });
    partSel.input.addEventListener('change', function () { st.k = KEYS[+partSel.input.value]; sVel.set(st.vs); sB.set(st.bs); draw(); });
    isoSel.input.addEventListener('change', function () { st.iso = +isoSel.input.value; draw(); });

    function parse(s) { return window.CBExercises ? window.CBExercises.parseNumber(s) : parseFloat(String(s).replace(/−/g, '-')); }
    function setMode(m) {
      st.mode = m; modeSel.input.value = String(m);
      gOrbit.hidden = m !== 0; gReto.hidden = m !== 0; gSel.hidden = m !== 1; gSpec.hidden = m !== 2; gCyc.hidden = m !== 3;
      if (m !== 0) { st.k = 'p'; partSel.input.value = '0'; }
      sB.set(st.bs); draw();
    }
    function cur() {
      if (st.mode === 0 && chal) return { k: chal.k, v: chal.v, B: chal.B };
      var S = SCALE[st.mode === 0 ? st.k : 'p'];
      return { k: st.mode === 0 ? st.k : 'p', v: st.vs * Math.pow(10, S.vx), B: st.bs * S.bu };
    }
    function launch() { animT = 0; if (reduce) { animT = 1; draw(); return; } var t0 = null; cancel(); var step = function (ts) { if (t0 == null) t0 = ts; animT = Math.min(1, (ts - t0) / 2200); draw(); if (animT < 1) anim = requestAnimationFrame(step); }; anim = requestAnimationFrame(step); }
    function cancel() { if (anim) cancelAnimationFrame(anim); anim = 0; }

    /* ---------- Dibujo ---------- */
    function el(tag, attrs, text) {
      if (!UI.svgOk(attrs)) return null;
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (text != null) n.textContent = text;
      svg.querySelector('g.sketch').appendChild(n);
      return n;
    }
    function path(cls, pts, w, dash) { if (pts.length < 2) return; el('path', { 'class': cls, fill: 'none', 'stroke-width': w || 2.6, 'stroke-linejoin': 'round', 'stroke-dasharray': dash || null, d: 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L') }); }
    function arrowPx(cls, x, y, dx, dy, w) {
      var L = Math.hypot(dx, dy); if (!(L > 3)) return;
      var ux = dx / L, uy = dy / L, hh = Math.min(11, L * 0.45), ex = x + dx, ey = y + dy;
      el('path', { 'class': cls, fill: 'none', 'stroke-width': w || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) + 'M' + (ex - ux * hh - uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh + ux * hh * 0.6).toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) + 'L' + (ex - ux * hh + uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh - ux * hh * 0.6).toFixed(1) });
    }
    function txt(x, y, s, a, fs) { el('text', { x: x.toFixed(1), y: y.toFixed(1), 'class': 'ann', 'text-anchor': a || 'middle', 'font-size': fs || 16 }, s); }
    function grid(x0, y0, x1, y1, out) {
      for (var x = x0; x <= x1; x += 40) for (var y = y0; y <= y1; y += 40) {
        if (out) { el('circle', { cx: x, cy: y, r: 5, fill: 'none', 'class': 'aux', 'stroke-width': 1.4, opacity: 0.5 }); el('circle', { cx: x, cy: y, r: 1.6, 'class': 'aux', opacity: 0.5 }); }
        else el('path', { 'class': 'aux', fill: 'none', 'stroke-width': 1.5, opacity: 0.45, d: 'M' + (x - 4) + ' ' + (y - 4) + 'L' + (x + 4) + ' ' + (y + 4) + 'M' + (x - 4) + ' ' + (y + 4) + 'L' + (x + 4) + ' ' + (y - 4) });
      }
    }
    function charge(x, y, pos) {
      el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 9, 'class': pos ? 'box-err' : 'box-aux' });
      txt(x, y + 5, pos ? '+' : '−', 'middle', 15);
    }
    function row(a, b) { facts.appendChild(h('dt', {}, [a])); facts.appendChild(h('dd', {}, [b])); }
    // Muestra la parte animada de una trayectoria y el punto móvil.
    function animated(pts, cls, w) {
      var n = Math.max(2, Math.round(pts.length * animT));
      path(cls, pts.slice(0, n), w);
      return pts[n - 1];
    }

    function draw() {
      svg.innerHTML = '';
      var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'sketch'); svg.appendChild(g);
      facts.innerHTML = '';
      bDir.textContent = st.out ? 'B entra a la hoja' : 'B sale de la hoja';
      if (st.mode === 0) drawOrbit(); else if (st.mode === 1) drawSelector(); else if (st.mode === 2) drawSpec(); else drawCyc();
    }

    function drawOrbit() {
      var c = cur(), P = PARTICLES[c.k], Bz = st.out ? c.B : -c.B, r = radius(P.m, P.q, c.v, c.B), T = period(P.m, P.q, c.B);
      // Escala fija (1500 px/m = 15 px/cm) para que se vea cómo cambia r; la entrada va abajo o arriba según el giro.
      var C = center(P.m, P.q, c.v, Bz), px = 1500, ox = 300, oy = C[1] > 0 ? 395 : 25;
      grid(40, 30, 620, 400, st.out);
      var sim = orbit(P.m, P.q, c.v, Bz, 240), pts = sim.pts.map(function (p) { return [ox + px * p[0], oy - px * p[1]]; });
      var end = animated(pts, 'trace', 2.8);
      var cx = ox + px * C[0], cy = oy - px * C[1];
      el('circle', { cx: cx.toFixed(1), cy: cy.toFixed(1), r: 3, 'class': 'axis' });
      el('path', { 'class': 'axis', fill: 'none', 'stroke-width': 1.4, 'stroke-dasharray': '4 5', d: 'M' + ox + ' ' + oy + 'L' + cx.toFixed(1) + ' ' + cy.toFixed(1) });
      txt((ox + cx) / 2 + 14, (oy + cy) / 2 + 5, 'r', 'start', 17);
      arrowPx('ref', ox, oy, 60, 0, 3.2);
      arrowPx('error', ox, oy, 0, cy > oy ? 48 : -48, 3.4);
      if (animT < 1) charge(end[0], end[1], P.q > 0); else charge(ox, oy, P.q > 0);
      if (student && isFinite(student) && student > 0) {
        var rs = student / 100 * px;
        if (rs < 2000) el('circle', { cx: ox.toFixed(1), cy: (oy + (cy > oy ? rs : -rs)).toFixed(1), r: rs.toFixed(1), fill: 'none', 'class': 'student', 'stroke-width': 2.4, 'stroke-dasharray': '7 5' });
      }
      txt(620, 24, (st.out ? 'B sale de la hoja (puntos)' : 'B entra a la hoja (cruces)'), 'end', 15);
      var hide = !!chal && student == null;
      row('partícula', P.name + ' (q = ' + (P.q > 0 ? '+' : '−') + (Math.abs(P.q) / E === 2 ? '2e' : 'e') + ', m = ' + sciS(P.m) + ' kg)');
      row('v, B', sciS(c.v) + ' m/s, ' + sciS(c.B) + ' T');
      row('r = mv/|q|B', hide ? 'compruébalo con tu respuesta' : p3(r * 100) + ' cm');
      row('T = 2πm/|q|B', sciS(T) + ' s (no depende de v)');
      row('f = 1/T', sciS(1 / T) + ' Hz');
      row('sentido de giro', (P.q * Bz < 0) ? 'antihorario' : 'horario');
      svg.setAttribute('aria-label', 'Órbita circular de un ' + P.name + ' en un campo que ' + (st.out ? 'sale de' : 'entra a') + ' la hoja; radio ' + p3(r * 100) + ' centímetros.');
    }

    function drawSelector() {
      var P = PARTICLES.p, v = st.vsel * 1e5, B = st.bs * 0.1, Ef = st.Ek * 1e3, vSel = Ef / B;
      var ox = 70, oy = 210, L = 0.10, px = 4800;              // placas de 10 cm
      grid(80, 110, 560, 310, st.out);
      el('rect', { x: ox, y: 90, width: L * px, height: 10, 'class': 'box-err' }); txt(ox + L * px / 2, 82, '+ + + + + + +', 'middle', 15);
      el('rect', { x: ox, y: 320, width: L * px, height: 10, 'class': 'box-aux' }); txt(ox + L * px / 2, 350, '− − − − − − −', 'middle', 15);
      // E apunta de + a −: hacia −y. Fuerza magnética sobre q > 0 con v en +x: q v × B; si B entra (−z): +y.
      var Bz = st.out ? B : -B, Evec = [0, -Ef, 0];
      var sim = simulate({ m: P.m, q: P.q, v0: [v, 0, 0], B: [0, 0, Bz], E: Evec, dt: L / v / 300, steps: 300, stop: function (x) { return x[0] >= L || Math.abs(x[1]) > 0.024; } });
      var pts = sim.pts.map(function (p) { return [ox + px * p[0], oy - px * p[1]]; });
      var end = animated(pts, 'trace', 2.8);
      arrowPx('ref', ox, oy, 50, 0, 3);
      var fB = st.out ? -1 : 1;                           // sentido de la magnética en y
      arrowPx('error', ox + 30, oy, 0, -fB * Math.min(60, 40 * v * B / Ef), 3);
      arrowPx('aux', ox + 50, oy, 0, Math.min(60, 40), 2.4);
      charge(end[0], end[1], true);
      var last = sim.pts[sim.pts.length - 1], dy = last[1];
      var pass = Math.abs(dy) < 0.0015 && last[0] >= L * 0.999;
      txt(620, 24, (st.out ? 'B sale de la hoja' : 'B entra a la hoja') + ' · E hacia abajo', 'end', 15);
      row('rapidez del protón', sciS(v) + ' m/s');
      row('v seleccionada = E/B', sciS(vSel) + ' m/s');
      row('fuerza eléctrica eE', sciS(E * Ef) + ' N, hacia abajo');
      row('fuerza magnética evB', sciS(E * v * B) + ' N, hacia ' + (fB > 0 ? 'arriba' : 'abajo'));
      row('resultado', pass ? 'pasa recto por la rendija' : (fB < 0 ? 'se desvía hacia abajo (las dos fuerzas apuntan igual)' : (v > vSel ? 'se desvía hacia arriba (gana la magnética)' : 'se desvía hacia abajo (gana la eléctrica)')));
      svg.setAttribute('aria-label', 'Selector de velocidades: placas con campo eléctrico y campo magnético cruzados. ' + (pass ? 'El protón pasa recto.' : 'El protón se desvía.'));
    }

    var ISO = [[12, 13, 'C'], [20, 22, 'Ne'], [35, 37, 'Cl']];
    function drawSpec() {
      var iso = ISO[st.iso], B = st.bs * 0.1, V = st.V * 1e3, ox = st.out ? 580 : 60, oy = 60;
      var s1 = spectrometer(iso[0] * U, E, V, B), s2 = spectrometer(iso[1] * U, E, V, B);
      var px = Math.min(5000, 480 / s2.d);
      grid(70, 70, 620, 400, st.out);
      el('rect', { x: 30, y: oy - 6, width: 590, height: 6, 'class': 'axis' });
      [s1, s2].forEach(function (s, i) {
        var Bz = st.out ? B : -B, Ssim = orbit(iso[i] * U, E, s.v, Bz, 240);
        // Entra hacia abajo: la órbita simulada empieza hacia +x; se gira −90° ((x, y) → (y, −x)).
        var pts = Ssim.pts.slice(0, 121).map(function (p) { return [ox + px * p[1], oy + px * p[0]]; });
        animated(pts, i ? 'error' : 'trace', 2.6);
        var dx = ox + px * s.d * (st.out ? -1 : 1);
        el('circle', { cx: dx.toFixed(1), cy: oy - 3, r: 5, 'class': i ? 'error' : 'trace' });
        txt(dx + (i ? 8 : -8), oy - 14, iso[i] + iso[2], i ? 'start' : 'end', 14);
      });
      arrowPx('ref', ox, 20, 0, 34, 3); txt(ox + 8, 30, 'iones con la misma energía', 'start', 14);
      row('isótopos', iso[0] + iso[2] + '⁺ y ' + iso[1] + iso[2] + '⁺ (carga +e)');
      row('rapidez de entrada', sciS(s1.v) + ' y ' + sciS(s2.v) + ' m/s');
      row('radios', p3(s1.r * 100) + ' cm y ' + p3(s2.r * 100) + ' cm');
      row('caen a d = 2r', p3(s1.d * 100) + ' cm y ' + p3(s2.d * 100) + ' cm');
      row('separación', p3((s2.d - s1.d) * 1000) + ' mm');
      row('masa desde el radio', 'm = qB²r²/2V');
      if (st.out) note.textContent = 'Con B saliendo de la hoja, los iones positivos giran hacia el otro lado.';
      svg.setAttribute('aria-label', 'Espectrómetro de masas: dos isótopos describen semicírculos de radios distintos y caen a distancias distintas.');
    }

    function drawCyc() {
      var P = PARTICLES.p, B = st.bs * 0.1, R = st.R / 100, dV = st.dV * 1e3, cy = cyclotron(P.m, P.q, B, R, dV);
      var ox = 320, oy = 210, gap = 10, px = 180 / (R * 100);   // px por cm: el borde de las des a 180 px
      grid(40, 30, 620, 400, st.out);
      // Dos «des»: semicírculos separados por el hueco.
      el('path', { 'class': 'axis', fill: 'none', 'stroke-width': 2, d: 'M' + (ox - gap) + ' ' + (oy - R * 100 * px) + 'A' + (R * 100 * px) + ' ' + (R * 100 * px) + ' 0 0 0 ' + (ox - gap) + ' ' + (oy + R * 100 * px) + 'Z' });
      el('path', { 'class': 'axis', fill: 'none', 'stroke-width': 2, d: 'M' + (ox + gap) + ' ' + (oy - R * 100 * px) + 'A' + (R * 100 * px) + ' ' + (R * 100 * px) + ' 0 0 1 ' + (ox + gap) + ' ' + (oy + R * 100 * px) + 'Z' });
      // Espiral: media vuelta n con radio r_n; se alternan los lados.
      // Media vuelta i: semicírculo de radio r_i centrado en el hueco (a la derecha si i es impar);
      // entre una y otra, el tramo recto que cruza el hueco, donde el campo eléctrico la acelera.
      var n = Math.floor(cy.crossings), pts = [], shown = Math.min(n, 60);
      for (var i = 1; i <= shown; i++) {
        var rn = spiralRadius(P.m, P.q, B, dV, i) * 100 * px, side = i % 2 ? 1 : -1;
        for (var k = 0; k <= 30; k++) {
          var a = Math.PI * k / 30;
          pts.push([ox + side * gap + side * rn * Math.sin(a), oy - side * rn * Math.cos(a)]);
        }
      }
      if (pts.length > 1) animated(pts, 'trace', 1.6);
      txt(ox - gap - R * 50 * px, oy + 5, 'D', 'middle', 18); txt(ox + gap + R * 50 * px, oy + 5, 'D', 'middle', 18);
      row('frecuencia f = |q|B/2πm', sciS(cy.f) + ' Hz (no depende del radio)');
      row('rapidez máxima', sciS(cy.vmax) + ' m/s');
      row('K máx = q²B²R²/2m', sciS(cy.KmaxEV / 1e6) + ' MeV');
      row('vueltas', p3(cy.turns) + ' (dos cruces del hueco por vuelta)');
      if (n > shown) row('dibujo', 'se ven las primeras ' + shown + ' medias vueltas');
      svg.setAttribute('aria-label', 'Ciclotrón: dos des con un hueco entre ellas y la espiral de medias vueltas cada vez más grandes.');
    }

    /* ---------- Reto ---------- */
    function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
    function newChallenge(fixed) {
      var c = fixed;
      if (!c) { var k = rnd(KEYS), S = SCALE[k]; c = { k: k, v: rnd([1, 1.5, 2, 2.5, 3, 4]) * Math.pow(10, S.vx), B: rnd([2, 3, 4, 5, 6, 8]) * S.bu }; }
      chal = c; student = null; verdict.hidden = true; rIn.input.value = '';
      st.k = c.k; partSel.input.value = String(KEYS.indexOf(c.k));
      var P = PARTICLES[c.k];
      chalText.textContent = 'Un ' + P.name + ' entra a ' + sciS(c.v) + ' m/s perpendicular a un campo de ' + sciS(c.B) + ' T. ¿Qué radio, en cm, tiene su órbita? (e = 1.60 × 10⁻¹⁹ C; mₚ = 1.67 × 10⁻²⁷ kg; mₑ = 9.11 × 10⁻³¹ kg; u = 1.66 × 10⁻²⁷ kg; alfa: 4u y 2e; deuterón: 2u y e)';
      animT = 1; draw();
    }
    function check() {
      if (!chal) return;
      var s = parse(rIn.input.value);
      if (!isFinite(s)) { UI.verdict(verdict, 'bad', MSG.bad[0], 'Escribe el radio en cm.'); return; }
      student = s;
      var key = diagnose(chal, s), msg = MSG[key] || MSG.bad;
      draw();
      UI.verdict(verdict, KIND[key] || 'bad', msg[0], msg[1] + ' Radio real: ' + p3(truthR(chal)) + ' cm.');
    }
    function freeOrbit() { chal = null; student = null; verdict.hidden = true; }
    [sVel.input, sB.input].forEach(function (i) { i.addEventListener('input', function () { if (st.mode === 0 && chal) { freeOrbit(); draw(); } }); });
    partSel.input.addEventListener('change', function () { if (chal) { freeOrbit(); draw(); } });

    // Ejemplo cargado: un compañero dio el diámetro.
    setMode(0);
    newChallenge({ k: 'p', v: 2e6, B: 0.4 });
    rIn.input.value = String(Number((2 * truthR(chal)).toPrecision(3)));
    check();
    note.textContent = 'Ejemplo cargado: así respondió un compañero el reto. ¿Ves su error? Mueve la rapidez o el campo para explorar, o cambia de modo.';
    return Promise.resolve();
  };
})();
