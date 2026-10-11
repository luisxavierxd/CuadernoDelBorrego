/* =====================================================================
   Lab charge-integral (Física 2 · S04): suma de dq → integral.
   Se parte una distribución de carga en N trozos, cada uno como carga
   puntual; se suman sus dE como vectores y se compara con la fórmula
   cerrada que sale de la integral. El alumno escribe su E y el lab da
   el «casi» con los errores típicos:
     noCos           sumó |dE| sin el factor de proyección (cos θ)
     centerDistance  usó la distancia al centro para todos los dq
     nearEnd         puso toda la carga en el extremo cercano (varilla en el eje)
     half            integró media varilla (bisectriz)
     semicircle      usó 2kλ/R para un arco que no es semicírculo
     double          σ/ε₀ en lugar de σ/(2ε₀) (disco)
     plane           usó el plano infinito σ/(2ε₀) para un disco finito
   Geometrías (SI; el punto de campo P):
     rod-axis      varilla de 0 a L sobre x; P = (L + d, 0, 0)
     rod-bisector  varilla de −L/2 a L/2 sobre x; P = (0, y, 0)
     arc           arco de radio R y ángulo θ₀ (grados) centrado en +y; P = centro
     ring          anillo de radio R en el plano xy; P = (0, 0, z)
     disk          disco de radio R en el plano xy; P = (0, 0, z)
   k = 8.99 × 10⁹ N·m²/C² y ε₀ = 8.85 × 10⁻¹² C²/(N·m²), como en los enunciados.
   ===================================================================== */
(function () {
  var K = 8.99e9, EPS0 = 8.85e-12, RAD = Math.PI / 180;
  // El disco se escribe con ε₀: para que su suma converja justo a σ/(2ε₀)(…) se usa k = 1/(4πε₀).
  var KD = 1 / (4 * Math.PI * EPS0);

  /* ------------------------- Matemática pura ------------------------- */
  function point(Q, r) { return K * Q / (r * r); }
  function rodAxis(L, Q, d) { return K * Q / (d * (d + L)); }
  function rodBisector(L, Q, y) { return K * Q / (y * Math.sqrt(y * y + L * L / 4)); }
  // λ = Q/(R θ₀): E = (2kλ/R) sin(θ₀/2).
  function arc(R, Q, deg) {
    var t = deg * RAD, lam = Q / (R * t), sn = Math.sin(t / 2);
    return 2 * K * lam / R * (Math.abs(sn) < 1e-12 ? 0 : sn);      // círculo completo: 0 exacto
  }
  function semicircle(R, Q) { return arc(R, Q, 180); }
  function ring(R, Q, z) { var s = z * z + R * R; return K * Q * z / (s * Math.sqrt(s)); }
  function disk(R, Q, z) { var sig = Q / (Math.PI * R * R); return sig / (2 * EPS0) * (1 - z / Math.sqrt(z * z + R * R)); }
  function line(lam, r) { return 2 * K * lam / r; }
  function plane(sig) { return sig / (2 * EPS0); }

  // Dónde es máximo el campo del anillo: bisección sobre la derivada escrita con la regla del
  // producto (sin simplificar), d/dz [z (z² + R²)^(−3/2)] = s^(−3/2) − 3 z² s^(−5/2).
  function ringMaxZ(R) {
    function dE(z) { var s = z * z + R * R; return Math.pow(s, -1.5) - 3 * z * z * Math.pow(s, -2.5); }
    var a = 0, b = 3 * R;
    for (var i = 0; i < 200; i++) { var m = (a + b) / 2; if (dE(m) > 0) a = m; else b = m; }
    return (a + b) / 2;
  }

  // Valor de la integral (fórmula cerrada) para cada geometría. p en SI; p.theta en grados.
  function closed(g, p) {
    if (g === 'rod-axis') return rodAxis(p.L, p.Q, p.d);
    if (g === 'rod-bisector') return rodBisector(p.L, p.Q, p.y);
    if (g === 'arc') return arc(p.R, p.Q, p.theta);
    if (g === 'ring') return ring(p.R, p.Q, p.z);
    if (g === 'disk') return disk(p.R, p.Q, p.z);
    return NaN;
  }
  // Dirección del campo total (unitaria) y el punto de campo.
  function axisOf(g) {
    return g === 'rod-axis' ? [1, 0, 0] : g === 'rod-bisector' ? [0, 1, 0] : g === 'arc' ? [0, -1, 0] : [0, 0, 1];
  }
  function fieldPoint(g, p) {
    return g === 'rod-axis' ? [p.L + p.d, 0, 0] : g === 'rod-bisector' ? [0, p.y, 0] : g === 'arc' ? [0, 0, 0] : [0, 0, p.z];
  }
  function kOf(g) { return g === 'disk' ? KD : K; }

  // Campo de una carga puntual q en a, evaluado en P (vector).
  function coulomb(k, q, a, P) {
    var rx = P[0] - a[0], ry = P[1] - a[1], rz = P[2] - a[2], r2 = rx * rx + ry * ry + rz * rz, r = Math.sqrt(r2), f = k * q / (r2 * r);
    return [f * rx, f * ry, f * rz];
  }

  // N trozos de la distribución, cada uno como grupo de cargas puntuales [x, y, z, q] con su dE.
  // En el disco cada trozo es un anillo de ancho R/N partido en M cargas (M = 48 por omisión).
  function pieces(g, p, N, M) {
    N = Math.max(1, Math.round(N));
    var P = fieldPoint(g, p), k = kOf(g), out = [], i, j;
    function add(pts) {
      var e = [0, 0, 0];
      pts.forEach(function (c) { var d = coulomb(k, c[3], c, P); e[0] += d[0]; e[1] += d[1]; e[2] += d[2]; });
      out.push({ pts: pts, dE: e });
    }
    if (g === 'rod-axis') for (i = 0; i < N; i++) add([[(i + 0.5) * p.L / N, 0, 0, p.Q / N]]);
    else if (g === 'rod-bisector') for (i = 0; i < N; i++) add([[-p.L / 2 + (i + 0.5) * p.L / N, 0, 0, p.Q / N]]);
    else if (g === 'arc') {
      var t0 = p.theta * RAD;
      for (i = 0; i < N; i++) { var ph = Math.PI / 2 - t0 / 2 + (i + 0.5) * t0 / N; add([[p.R * Math.cos(ph), p.R * Math.sin(ph), 0, p.Q / N]]); }
    } else if (g === 'ring') for (i = 0; i < N; i++) { var a = (i + 0.5) * 2 * Math.PI / N; add([[p.R * Math.cos(a), p.R * Math.sin(a), 0, p.Q / N]]); }
    else if (g === 'disk') {
      var sig = p.Q / (Math.PI * p.R * p.R), dr = p.R / N;
      M = M || 48;
      for (i = 0; i < N; i++) {
        var r = (i + 0.5) * dr, qr = sig * 2 * Math.PI * r * dr, pts = [];
        for (j = 0; j < M; j++) { var b = (j + 0.5) * 2 * Math.PI / M; pts.push([r * Math.cos(b), r * Math.sin(b), 0, qr / M]); }
        add(pts);
      }
    }
    return out;
  }

  // Suma vectorial de los N trozos: componentes, magnitud, componente a lo largo del eje y la perpendicular.
  function discrete(g, p, N, M) {
    var e = [0, 0, 0];
    pieces(g, p, N, M).forEach(function (pc) { e[0] += pc.dE[0]; e[1] += pc.dE[1]; e[2] += pc.dE[2]; });
    var u = axisOf(g), along = e[0] * u[0] + e[1] * u[1] + e[2] * u[2];
    var px = e[0] - along * u[0], py = e[1] - along * u[1], pz = e[2] - along * u[2];
    return { Ex: e[0], Ey: e[1], Ez: e[2], mag: Math.hypot(e[0], e[1], e[2]), along: along, perp: Math.hypot(px, py, pz) };
  }

  // Comprobaciones de límites: lejos (carga puntual a la distancia del centro) y el caso infinito.
  function limits(g, p) {
    if (g === 'rod-axis') return { far: point(p.Q, p.d + p.L / 2) };
    if (g === 'rod-bisector') return { far: point(p.Q, p.y), infinite: line(p.Q / p.L, p.y) };
    if (g === 'arc') return { far: point(p.Q, p.R), infinite: line(p.Q / (p.R * p.theta * RAD), p.R) };
    if (g === 'ring') return { far: point(p.Q, p.z) };
    if (g === 'disk') return { far: KD * p.Q / (p.z * p.z), infinite: plane(p.Q / (Math.PI * p.R * p.R)) };
    return {};
  }

  // Errores típicos (solo los que aplican a cada geometría).
  function mistakes(g, p) {
    if (g === 'rod-axis') return { centerDistance: point(p.Q, p.d + p.L / 2), nearEnd: point(p.Q, p.d) };
    if (g === 'rod-bisector') {
      var lam = p.Q / p.L;
      return { noCos: 2 * K * lam / p.y * Math.atan(p.L / (2 * p.y)), centerDistance: point(p.Q, p.y), half: rodBisector(p.L, p.Q, p.y) / 2 };
    }
    if (g === 'arc') {
      var m = { noCos: point(p.Q, p.R) };
      if (Math.abs(p.theta - 180) > 1e-9) m.semicircle = 2 * K * p.Q / (p.R * p.R * p.theta * RAD);
      return m;
    }
    if (g === 'ring') return { noCos: K * p.Q / (p.z * p.z + p.R * p.R), centerDistance: point(p.Q, p.z) };
    if (g === 'disk') {
      var sig = p.Q / (Math.PI * p.R * p.R);
      return { double: 2 * disk(p.R, p.Q, p.z), plane: plane(sig), noCos: Math.PI * KD * sig * Math.log((p.z * p.z + p.R * p.R) / (p.z * p.z)), centerDistance: KD * p.Q / (p.z * p.z) };
    }
    return {};
  }

  // Veredicto: 'ok', la clave del error típico o 'bad'. Un error solo cuenta si se separa > 3 % de la respuesta.
  function diagnose(g, p, student, tol) {
    tol = tol || 0.01;
    if (!isFinite(student)) return 'bad';
    var E = closed(g, p);
    // Con E = 0 (anillo completo en su centro) la tolerancia es el 1 % del campo de carga puntual.
    if (Math.abs(student - E) <= tol * (E === 0 ? limits(g, p).far : Math.abs(E))) return 'ok';
    var m = mistakes(g, p);
    for (var key in m) {
      if (Math.abs(m[key] - E) <= 0.03 * Math.max(Math.abs(E), Math.abs(m[key]))) continue;
      if (Math.abs(student - m[key]) <= tol * Math.abs(m[key])) return key;
    }
    return 'bad';
  }

  window.LabMath.chargeIntegral = {
    K: K, EPS0: EPS0, KD: KD,
    point: point, rodAxis: rodAxis, rodBisector: rodBisector, arc: arc, semicircle: semicircle, ring: ring, disk: disk,
    line: line, plane: plane, ringMaxZ: ringMaxZ, closed: closed, axisOf: axisOf, fieldPoint: fieldPoint,
    pieces: pieces, discrete: discrete, limits: limits, mistakes: mistakes, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var GEOMS = [
    { id: 'rod-axis', name: 'Varilla, punto en su eje', size: 'Largo L', dist: 'Distancia d (del extremo a P)' },
    { id: 'rod-bisector', name: 'Varilla, punto en la bisectriz', size: 'Largo L', dist: 'Distancia y (del centro a P)' },
    { id: 'arc', name: 'Arco, campo en el centro', size: 'Radio R', dist: null },
    { id: 'ring', name: 'Anillo, punto en su eje', size: 'Radio R', dist: 'Distancia z (del centro a P)' },
    { id: 'disk', name: 'Disco, punto en su eje', size: 'Radio R', dist: 'Distancia z (del centro a P)' }
  ];
  var MSG = {
    ok: ['Tu E coincide con la integral', 'La diferencia es menor al 1 %.'],
    noCos: ['Olvidaste el factor de proyección', 'Sumaste las magnitudes |dE| completas. Solo sobrevive la componente a lo largo del eje: cada dE va multiplicado por cos θ. En la cadena de flechas, lo que se sale del eje regresa.'],
    centerDistance: ['Usaste la distancia al centro para todos los dq', 'Cada trozo está a su propia distancia r de P. Por eso hay que integrar: r cambia de un dq a otro. Pon N = 1 y verás que eso es lo que calculaste.'],
    nearEnd: ['Pusiste toda la carga en el extremo cercano', 'Los trozos lejanos aportan menos. Integra con r = L + d − x, que cambia a lo largo de la varilla.'],
    half: ['Te falta un factor de 2', 'Integraste solo media varilla. Por simetría, las dos mitades aportan lo mismo en la dirección de y.'],
    semicircle: ['Usaste la fórmula del semicírculo', '2kλ/R solo vale para θ₀ = 180°. Con otro ángulo queda (2kλ/R) sin(θ₀/2).'],
    double: ['Te sobra un factor de 2', 'Para el disco es σ/(2ε₀), no σ/ε₀. Recuerda que 2πk = 1/(2ε₀).'],
    plane: ['Usaste el plano infinito', 'σ/(2ε₀) es el límite cuando R → ∞. Con un disco de tamaño finito falta el factor (1 − z/√(z² + R²)).'],
    bad: ['Tu E no coincide', 'Sube N y mira a qué valor se acerca la suma. Revisa r de cada dq, el cos θ y los límites de la integral.']
  };

  function niceUnit(v) {
    var a = Math.abs(v);
    if (a >= 1e6) return { f: 1e-6, u: 'MN/C' };
    if (a >= 1e3) return { f: 1e-3, u: 'kN/C' };
    return { f: 1, u: 'N/C' };
  }
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  // Notación científica para leer (× 10⁴) o para escribir en el campo (plain: 3.2e4).
  function sci(v, plain) {
    if (!isFinite(v)) return '—';
    if (Math.abs(v) < 1e-12) return '0';
    var e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e);
    if (Math.abs(+m.toFixed(3)) >= 10) { m /= 10; e += 1; }
    if (e >= -2 && e <= 3) return Number(v.toPrecision(4)).toString();
    return plain ? m.toFixed(3) + 'e' + e : m.toFixed(3) + ' × 10' + String(e).split('').map(function (c) { return SUP[c]; }).join('');
  }

  window.Labs['charge-integral'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, CI = window.LabMath.chargeIntegral;
    var s = cfg.start || { geom: 'rod-bisector', size: 20, Q: 5, dist: 10, ang: 180, N: 8 };
    var geomSel = UI.select({ label: 'Geometría', options: GEOMS.map(function (g) { return g.name; }) });
    var size = UI.slider({ label: 'Largo L', min: 4, max: 40, step: 1, value: s.size, unit: 'cm' }, refresh);
    var qS = UI.slider({ label: 'Carga Q', min: 1, max: 20, step: 1, value: s.Q, unit: 'nC' }, refresh);
    var dist = UI.slider({ label: 'Distancia', min: 1, max: 40, step: 1, value: s.dist, unit: 'cm' }, refresh);
    var ang = UI.slider({ label: 'Ángulo del arco θ₀', min: 20, max: 360, step: 10, value: s.ang, unit: '°' }, refresh);
    var nS = UI.slider({ label: 'Trozos N', min: 1, max: 60, step: 1, value: s.N }, refresh);
    var eIn = UI.input({ label: 'Tu E en P (N/C)', type: 'text', inputmode: 'decimal', mono: false, hint: 'Acepta notación científica: <code>3.2e4</code> o <code>3.2×10^4</code>.' });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var scene = UI.svg(640, 360, 'La distribución partida en N trozos dq y la cadena de sus dE, cabeza con cola, desde el punto P');
    var conv = UI.svg(640, 230, 'Magnitud de la suma con N trozos contra el valor de la integral');
    var student = null;

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        geomSel.node, size.node, qS.node, dist.node, ang.node, nS.node, eIn.node,
        h('div', { class: 'lab-buttons' }, [run]), note, verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Suma de N trozos contra la integral']),
        scene,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'dE de cada trozo, cabeza con cola']),
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'E de la suma']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'marca: la integral']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu E'])
        ]),
        conv,
        facts
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    geomSel.input.value = String(Math.max(0, GEOMS.map(function (g) { return g.id; }).indexOf(s.geom)));
    geomSel.input.addEventListener('change', function () { student = null; verdict.hidden = true; eIn.input.value = ''; sync(); draw(); });
    eIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });

    function G() { return GEOMS[+geomSel.input.value] || GEOMS[0]; }
    function params() {
      var a = size.get() / 100, b = dist.get() / 100;
      return { L: a, R: a, Q: qS.get() * 1e-9, d: b, y: b, z: b, theta: ang.get() };
    }
    function setLabel(sl, txt) { var l = sl.node.querySelector('label'); if (l) l.textContent = txt; }
    function sync() {
      var g = G();
      setLabel(size, g.size);
      dist.node.hidden = !g.dist; ang.node.hidden = !!g.dist;
      if (g.dist) setLabel(dist, g.dist);
    }

    function el(name, attrs, parent, text) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (text != null) n.textContent = text;
      parent.appendChild(n);
      return n;
    }
    function f1(v) { return (+v).toFixed(1); }
    function pathOf(pts, close) { return pts.map(function (q, i) { return (i ? 'L' : 'M') + f1(q[0]) + ' ' + f1(q[1]); }).join('') + (close ? 'Z' : ''); }
    function arrowD(x, y, dx, dy, hh) {
      var L = Math.hypot(dx, dy);
      if (!(L > 0.5)) return '';
      var ux = dx / L, uy = dy / L, k = Math.min(hh || 10, L * 0.45), ex = x + dx, ey = y + dy;
      return 'M' + f1(x) + ' ' + f1(y) + 'L' + f1(ex) + ' ' + f1(ey) +
        (L >= 8 ? 'M' + f1(ex - ux * k - uy * k * 0.55) + ' ' + f1(ey - uy * k + ux * k * 0.55) + 'L' + f1(ex) + ' ' + f1(ey) + 'L' + f1(ex - ux * k + uy * k * 0.55) + ' ' + f1(ey - uy * k - ux * k * 0.55) : '');
    }

    // Vista de cada geometría: mundo → pantalla (V proyecta vectores) y la caja donde cabe la cadena.
    function view(g, p) {
      var v = {};
      if (g === 'rod-axis') {
        var s1 = 330 / (p.L + p.d);
        v.P = function (q) { return [34 + q[0] * s1, 190 - q[1] * s1]; };
        v.V = function (e) { return [e[0], -e[1]]; };
        v.s = s1;
      } else if (g === 'rod-bisector') {
        var s2 = Math.min(520 / p.L, 120 / p.y);
        v.P = function (q) { return [320 + q[0] * s2, 330 - q[1] * s2]; };
        v.V = function (e) { return [e[0], -e[1]]; };
        v.s = s2;
      } else if (g === 'arc') {
        var s3 = 118 / p.R;
        v.P = function (q) { return [320 + q[0] * s3, 178 - q[1] * s3]; };
        v.V = function (e) { return [e[0], -e[1]]; };
        v.s = s3;
      } else {
        var s4 = Math.min((g === 'disk' ? 140 : 128) / p.R, 240 / p.z);
        v.P = function (q) { return [140 + (q[2] + 0.35 * q[0]) * s4, 180 - q[1] * s4]; };
        v.V = function (e) { return [e[2] + 0.35 * e[0], -e[1]]; };
        v.s = s4;
      }
      v.F = v.P(fieldPoint(g, p));
      var F = v.F;
      v.box = g === 'rod-axis' ? [F[0] + 4, 40, 624, 330] : g === 'rod-bisector' ? [24, 18, 616, F[1] - 6] : g === 'arc' ? [F[0] - 100, F[1] - 100, F[0] + 100, F[1] + 100] : [F[0] - 70, 18, 624, 342];
      return v;
    }

    function draw() {
      var g = G().id, p = params(), n = nS.get();
      var pcs = pieces(g, p, n, g === 'disk' ? 24 : 0), E = closed(g, p), sum = discrete(g, p, n, g === 'disk' ? 24 : 0);
      var v = view(g, p), F = v.F, u = axisOf(g), us = v.V(u), ul = Math.hypot(us[0], us[1]); us = [us[0] / ul, us[1] / ul];
      scene.innerHTML = '';
      var lay = el('g', { class: 'sketch' }, scene);

      // Cadena de dE (cabeza con cola) en unidades de campo y su escala para caber en la caja.
      var acc = [0, 0, 0], chain = [[0, 0]];
      pcs.forEach(function (pc) { acc = [acc[0] + pc.dE[0], acc[1] + pc.dE[1], acc[2] + pc.dE[2]]; chain.push(v.V(acc)); });
      var extra = [us[0] * E, us[1] * E];
      if (student != null && isFinite(student)) extra = [us[0] * Math.max(E, Math.min(student, 1.6 * E)), us[1] * Math.max(E, Math.min(student, 1.6 * E))];
      var fs = Infinity, B = v.box;
      chain.concat([extra]).forEach(function (o) {
        if (o[0] > 1e-30) fs = Math.min(fs, (B[2] - F[0]) / o[0]);
        if (o[0] < -1e-30) fs = Math.min(fs, (B[0] - F[0]) / o[0]);
        if (o[1] > 1e-30) fs = Math.min(fs, (B[3] - F[1]) / o[1]);
        if (o[1] < -1e-30) fs = Math.min(fs, (B[1] - F[1]) / o[1]);
      });
      if (!isFinite(fs)) fs = 0;
      var S = function (o) { return [F[0] + o[0] * fs, F[1] + o[1] * fs]; };

      // Eje de simetría por P.
      var far = 800;
      el('path', { d: 'M' + f1(F[0] - us[0] * far) + ' ' + f1(F[1] - us[1] * far) + 'L' + f1(F[0] + us[0] * far) + ' ' + f1(F[1] + us[1] * far), class: 'axis', 'stroke-width': 1, 'stroke-dasharray': '4 6', fill: 'none', opacity: 0.6 }, lay);

      // La distribución y sus N trozos.
      var dots = [];
      if (g === 'rod-axis' || g === 'rod-bisector') {
        var a0 = v.P([g === 'rod-axis' ? 0 : -p.L / 2, 0, 0]), a1 = v.P([g === 'rod-axis' ? p.L : p.L / 2, 0, 0]);
        el('rect', { x: f1(a0[0]), y: f1(a0[1] - 8), width: f1(a1[0] - a0[0]), height: 16, rx: 4, class: 'box-err' }, lay);
        var w = (a1[0] - a0[0]) / n;
        if (w >= 3) for (var i = 1; i < n; i++) el('path', { d: 'M' + f1(a0[0] + i * w) + ' ' + f1(a0[1] - 8) + 'v16', class: 'error', 'stroke-width': 1.2, fill: 'none' }, lay);
      } else if (g === 'arc') {
        var arcPts = [];
        for (var j = 0; j <= 90; j++) { var ph = Math.PI / 2 - p.theta * RAD / 2 + j * p.theta * RAD / 90; arcPts.push(v.P([p.R * Math.cos(ph), p.R * Math.sin(ph), 0])); }
        el('path', { d: pathOf(arcPts), class: 'error', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round', opacity: 0.35 }, lay);
      } else {
        var rim = [];
        for (var k2 = 0; k2 <= 72; k2++) { var b = k2 * 2 * Math.PI / 72; rim.push(v.P([p.R * Math.cos(b), p.R * Math.sin(b), 0])); }
        if (g === 'disk') {
          el('path', { d: pathOf(rim, true), class: 'box-err' }, lay);
          if (n <= 30) for (var r2 = 1; r2 < n; r2++) {
            var rr = r2 * p.R / n, ring2 = [];
            for (var k3 = 0; k3 <= 48; k3++) { var c = k3 * 2 * Math.PI / 48; ring2.push(v.P([rr * Math.cos(c), rr * Math.sin(c), 0])); }
            el('path', { d: pathOf(ring2, true), class: 'error', 'stroke-width': 1, fill: 'none', opacity: 0.6 }, lay);
          }
        } else el('path', { d: pathOf(rim, true), class: 'error', 'stroke-width': 6, fill: 'none', opacity: 0.35 }, lay);
      }
      // Un punto por trozo; en el disco, el punto de arriba de cada anillo.
      pcs.forEach(function (pc) {
        var c0 = pc.pts[0];
        dots.push(v.P(g === 'disk' ? [0, Math.hypot(c0[0], c0[1]), 0] : c0));
      });
      if (n <= 12) dots.forEach(function (d) { el('path', { d: 'M' + f1(d[0]) + ' ' + f1(d[1]) + 'L' + f1(F[0]) + ' ' + f1(F[1]), class: 'axis', 'stroke-width': 1, 'stroke-dasharray': '3 5', fill: 'none', opacity: 0.55 }, lay); });
      dots.forEach(function (d) { el('circle', { cx: f1(d[0]), cy: f1(d[1]), r: n > 30 ? 2.2 : 3.4, class: 'dot-error' }, lay); });

      // Cadena: lo que se sale del eje (tenue) regresa al final.
      var pts = chain.map(S);
      if (n <= 30 && g !== 'rod-axis' && g !== 'disk') pts.slice(1, -1).forEach(function (q) {
        var t = (q[0] - F[0]) * us[0] + (q[1] - F[1]) * us[1];
        el('path', { d: 'M' + f1(q[0]) + ' ' + f1(q[1]) + 'L' + f1(F[0] + us[0] * t) + ' ' + f1(F[1] + us[1] * t), class: 'aux', 'stroke-width': 1, 'stroke-dasharray': '2 4', fill: 'none', opacity: 0.5 }, lay);
      });
      for (var m = 1; m < pts.length; m++) {
        var d0 = pts[m - 1], d1 = pts[m];
        el('path', { d: arrowD(d0[0], d0[1], d1[0] - d0[0], d1[1] - d0[1], n > 20 ? 6 : 9), class: 'aux', 'stroke-width': n > 30 ? 1.5 : 2.2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, lay);
      }
      var tip = pts[pts.length - 1];
      el('path', { d: arrowD(F[0], F[1], tip[0] - F[0], tip[1] - F[1], 13), class: 'ref', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, lay);
      // Marca de la integral y la flecha del alumno.
      var ex = S([us[0] * E, us[1] * E]);
      el('path', { d: 'M' + f1(ex[0] - us[1] * 12) + ' ' + f1(ex[1] + us[0] * 12) + 'L' + f1(ex[0] + us[1] * 12) + ' ' + f1(ex[1] - us[0] * 12), class: 'error', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, lay);
      if (student != null && isFinite(student) && student > 0) {
        var sl = Math.min(student, 1.6 * E) * fs, off = 14;
        el('path', { d: arrowD(F[0] - us[1] * off, F[1] + us[0] * off, us[0] * sl, us[1] * sl, 11), class: 'student', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, lay);
      }
      el('circle', { cx: f1(F[0]), cy: f1(F[1]), r: 6, class: 'dot-trace' }, lay);
      // Etiqueta de P del lado contrario al campo.
      el('text', { x: f1(F[0] - us[0] * 22 - (g === 'rod-axis' ? 0 : 14)), y: f1(F[1] - us[1] * 22 + 6), class: 'ann', 'font-size': 20, 'text-anchor': 'middle' }, lay, 'P');

      // Convergencia: |E| de la suma con 1…60 trozos contra la integral.
      var vals = [];
      for (var q2 = 1; q2 <= 60; q2++) vals.push(discrete(g, p, q2, g === 'disk' ? 24 : 0).mag);
      // Rango vertical ajustado a los valores, para que se vea cómo se acerca la suma.
      var un = niceUnit(E), lo = Math.min(E, Math.min.apply(null, vals)), hi = Math.max(E, Math.max.apply(null, vals)), pad = (hi - lo) * 0.18 + Math.abs(E) * 0.03;
      var bot = Math.max(0, lo - pad) * un.f, top = (hi + pad) * un.f;
      if (!(top > bot)) { bot = 0; top = 1; }
      var plot = window.LabPlot(conv, { x: [0, 61], y: [bot, top] });
      plot.clear(); plot.grid(); plot.axes();
      plot.curve(function () { return E * un.f; }, 'error', 2, '6 6');
      plot.segments(vals.slice(1).map(function (val, i2) { return [[i2 + 1, vals[i2] * un.f], [i2 + 2, val * un.f]]; }), 'aux', 2);
      plot.point(n, vals[n - 1] * un.f, 'dot-trace', 6);
      plot.label(60, E * un.f, 'integral', 'end', 15, 0, top - E * un.f < 0.15 * (top - bot) ? 20 : -10);
      plot.label(1, top, 'E (' + un.u + ')', 'start', 15, 4, 4);
      plot.label(60, bot, 'N', 'end', 15, 0, -8);

      facts.innerHTML = '';
      var lim = limits(g, p), smag = sum.mag < 1e-9 * lim.far ? 0 : sum.mag, diff = (smag - E) / E * 100;   // ruido de redondeo → 0
      [['suma con N = ' + n, sci(smag) + ' N/C'], ['integral', sci(E) + ' N/C'], ['diferencia', (isFinite(diff) ? (diff > 0 ? '+' : '') + diff.toFixed(2) : '—') + ' %'],
        ['lejos, kQ/r²', sci(lim.far) + ' N/C']].concat(lim.infinite != null ? [[g === 'disk' ? 'plano infinito σ/2ε₀' : 'línea infinita 2kλ/r', sci(lim.infinite) + ' N/C']] : [])
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    function readStudent() {
      var t = eIn.input.value;
      return window.CBExercises ? window.CBExercises.parseNumber(t) : parseFloat(t);
    }
    function refresh() { if (student != null) check(); else draw(); }
    function check() {
      var g = G().id, p = params(), val = readStudent();
      if (!isFinite(val)) { student = null; verdict.hidden = true; draw(); return; }
      student = val;
      var kind = diagnose(g, p, val), msg = MSG[kind] || MSG.bad, E = closed(g, p), err = (val - E) / E * 100;
      UI.verdict(verdict, kind === 'ok' ? 'ok' : kind === 'bad' ? 'bad' : 'warn', msg[0],
        msg[1] + (kind !== 'ok' && isFinite(err) ? ' Tu error: ' + (err > 0 ? '+' : '') + err.toFixed(1) + ' %.' : ''));
      draw();
    }

    // Ejemplo cargado: un compañero sumó las magnitudes sin el cos θ.
    sync();
    (function loadExample() {
      var g = G().id, m = mistakes(g, params());
      var sample = m.noCos != null ? m.noCos : m.centerDistance;
      eIn.input.value = sci(sample, true);
      note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Ves el error? Cambia la geometría o los valores y escribe tu E.';
    })();
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
