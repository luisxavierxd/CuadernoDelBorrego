/* =====================================================================
   Lab flux-surface (Física 2 · S07): superficie rotable en un campo.
   Modo «Superficie plana»: un campo uniforme (magnitud y dirección) y un
   rectángulo o un disco que el alumno gira y escala; se ven las líneas de
   campo que la atraviesan, el vector normal n̂ y el ángulo θ entre E y n̂.
   Modo «Superficie cerrada»: un cubo o un prisma triangular en el mismo campo,
   con el flujo de cada cara y el total (= 0).
   En PC (pantalla ancha y mouse) hay vista en perspectiva (proyección SVG que
   se gira arrastrando) y vista de canto; en móvil, solo la vista de canto (2D).
   Reto: el alumno calcula el flujo; el «casi» reconoce los errores típicos:
     sin      usó el ángulo con la superficie (sen en lugar de cos)
     sign     el signo al revés (la normal hacia adentro)
     noCos    E·A sin el coseno
     cm2      dejó el área en cm² sin pasar a m²
     sumAbs   sumó los flujos de las caras sin signo (total)
     outOnly  contó solo las caras por donde sale (total)
   LabMath.flux trabaja en SI (N/C, m, m², N·m²/C).
   ===================================================================== */
(function () {
  var EPS0 = 8.85e-12, RAD = Math.PI / 180;

  /* ------------------------- Matemática pura ------------------------- */
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { return Math.sqrt(dot(a, a)); }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function clamp1(c) { return Math.max(-1, Math.min(1, c)); }

  // Campo uniforme por una superficie plana: Φ = E A cos θ, θ (grados) entre E y la normal.
  function uniform(E, A, thetaDeg) { return E * A * Math.cos(thetaDeg * RAD); }
  // Con vectores: Φ = (E · n̂) A; n no tiene que ser unitario.
  function uniformVec(E, n, A) { return A * dot(E, n) / norm(n); }
  // Ángulo entre dos vectores, en grados (0 a 180).
  function angleBetween(a, b) { return Math.acos(clamp1(dot(a, b) / (norm(a) * norm(b)))) / RAD; }
  // Ángulo θ (grados) que da el flujo Φ con E y A. NaN si |Φ| > EA.
  function angleFor(phi, E, A) {
    var c = phi / (E * A);
    if (!(Math.abs(c) <= 1 + 1e-12)) return NaN;
    return Math.acos(clamp1(c)) / RAD;
  }

  // Nodos y pesos de Gauss–Legendre en [0, 1].
  var GL = {};
  function gauss(n) {
    if (GL[n]) return GL[n];
    var x = [], w = [];
    for (var i = 1; i <= n; i++) {
      var z = Math.cos(Math.PI * (i - 0.25) / (n + 0.5)), pp = 1;
      for (var it = 0; it < 100; it++) {
        var p1 = 1, p2 = 0;
        for (var j = 1; j <= n; j++) { var p3 = p2; p2 = p1; p1 = ((2 * j - 1) * z * p2 - (j - 1) * p3) / j; }
        pp = n * (z * p1 - p2) / (z * z - 1);
        var z1 = z; z = z1 - p1 / pp;
        if (Math.abs(z - z1) < 1e-15) break;
      }
      x.push((1 - z) / 2); w.push(1 / ((1 - z * z) * pp * pp));
    }
    GL[n] = { x: x, w: w };
    return GL[n];
  }
  // Cara plana: paralelogramo P0 + s·u + t·v (s, t ∈ [0, 1]) o, con tri, el triángulo P0, P0 + u, P0 + v.
  // Su vector área apunta como u × v.
  function faceInfo(f) {
    var N = cross(f.u, f.v), m = norm(N);
    return { n: mul(N, 1 / m), A: f.tri ? m / 2 : m };
  }
  function centroid(f) {
    return f.tri ? add(f.P0, mul(add(f.u, f.v), 1 / 3)) : add(f.P0, mul(add(f.u, f.v), 0.5));
  }
  // ∫∫ E · dA sobre una cara, con Efn(x, y, z) → [Ex, Ey, Ez] y cuadratura de Gauss (n × n puntos).
  function quad(Efn, f, n) {
    var g = gauss(n || 20), N = cross(f.u, f.v), s = 0, vu = sub(f.v, f.u);
    for (var i = 0; i < g.x.length; i++) {
      for (var j = 0; j < g.x.length; j++) {
        var a = g.x[i], b = g.x[j], P, jac;
        if (f.tri) { P = add(f.P0, mul(add(f.u, mul(vu, b)), a)); jac = a; }
        else { P = add(f.P0, add(mul(f.u, a), mul(f.v, b))); jac = 1; }
        s += g.w[i] * g.w[j] * jac * dot(Efn(P[0], P[1], P[2]), N);
      }
    }
    return s;
  }
  // Caras de una superficie cerrada, con la normal hacia afuera (dims en metros).
  //   cube:  lado a, una esquina en el origen y aristas sobre +x, +y, +z.
  //   prism: corte triangular rectángulo en el plano xz (base b sobre x, altura h sobre z),
  //          extruido de y = 0 a y = w; la cara inclinada une (b, 0) con (0, h).
  function faces(shape, d) {
    if (shape === 'prism') {
      var b = d.b, h = d.h, w = d.w;
      return [
        { id: 'base', name: 'base (z = 0)', P0: [0, 0, 0], u: [0, w, 0], v: [b, 0, 0] },
        { id: 'pared', name: 'pared (x = 0)', P0: [0, 0, 0], u: [0, 0, h], v: [0, w, 0] },
        { id: 'inclinada', name: 'cara inclinada', P0: [b, 0, 0], u: [0, w, 0], v: [-b, 0, h] },
        { id: 'y0', name: 'triángulo de enfrente (y = 0)', P0: [0, 0, 0], u: [b, 0, 0], v: [0, 0, h], tri: true },
        { id: 'yw', name: 'triángulo de atrás (y = w)', P0: [0, w, 0], u: [0, 0, h], v: [b, 0, 0], tri: true }
      ];
    }
    var a = d.a;
    return [
      { id: 'x0', name: 'izquierda (x = 0)', P0: [0, 0, 0], u: [0, 0, a], v: [0, a, 0] },
      { id: 'xa', name: 'derecha (x = a)', P0: [a, 0, 0], u: [0, a, 0], v: [0, 0, a] },
      { id: 'y0', name: 'enfrente (y = 0)', P0: [0, 0, 0], u: [a, 0, 0], v: [0, 0, a] },
      { id: 'ya', name: 'atrás (y = a)', P0: [0, a, 0], u: [0, 0, a], v: [a, 0, 0] },
      { id: 'z0', name: 'abajo (z = 0)', P0: [0, 0, 0], u: [0, a, 0], v: [a, 0, 0] },
      { id: 'za', name: 'arriba (z = a)', P0: [0, 0, a], u: [a, 0, 0], v: [0, a, 0] }
    ];
  }
  // Flujo de un campo uniforme E (vector) por cada cara de la superficie cerrada y el total.
  function closed(shape, E, d) {
    var total = 0;
    var list = faces(shape, d).map(function (f) {
      var i = faceInfo(f), phi = i.A * dot(E, i.n);
      total += phi;
      return { id: f.id, name: f.name, n: i.n, A: i.A, flux: phi };
    });
    return { faces: list, total: total };
  }
  // Flujo de una cara de un cubo o de un prisma, por su id.
  function faceFlux(shape, E, d, id) {
    var r = closed(shape, E, d).faces.filter(function (f) { return f.id === id; })[0];
    return r ? r.flux : NaN;
  }
  // Campo no uniforme E = c·x î por un cuadrado de lado s en el plano x = a (normal +x): Φ = c a s².
  function linearX(c, a, s) { return c * a * s * s; }
  // E = c·y î por un rectángulo en un plano x = cte, con y de y0 a y1 y largo L en z: Φ = c L (y1² − y0²)/2.
  function linearY(c, y0, y1, L) { return c * L * (y1 * y1 - y0 * y0) / 2; }
  // Carga puntual: el flujo por cualquier superficie cerrada que la encierra es q/ε₀.
  function gaussFlux(q) { return q / EPS0; }
  // Flujo de una carga puntual q (en el origen) por una esfera de radio R con centro c,
  // integrando E · n̂ dA con Gauss en θ y puntos medios en φ.
  function pointSphere(q, R, c, n) {
    n = n || 48;
    c = c || [0, 0, 0];
    var kq = q / (4 * Math.PI * EPS0), g = gauss(n), m = 2 * n, s = 0;
    for (var i = 0; i < n; i++) {
      var th = Math.PI * g.x[i], wt = Math.PI * g.w[i], st = Math.sin(th), ct = Math.cos(th);
      for (var k = 0; k < m; k++) {
        var ph = 2 * Math.PI * (k + 0.5) / m, nh = [st * Math.cos(ph), st * Math.sin(ph), ct];
        var P = add(c, mul(nh, R)), r = norm(P);
        s += wt * (2 * Math.PI / m) * kq * dot(P, nh) / (r * r * r) * R * R * st;
      }
    }
    return s;
  }
  // Recorta la recta p + t·d contra un cuerpo convexo (planos con normal hacia afuera).
  // Devuelve [t_entra, t_sale] o null si no lo atraviesa.
  function clipConvex(p, d, planes) {
    var t0 = -Infinity, t1 = Infinity;
    for (var i = 0; i < planes.length; i++) {
      var nd = dot(planes[i].n, d), dist = dot(planes[i].n, sub(p, planes[i].P));
      if (Math.abs(nd) < 1e-12) { if (dist > 0) return null; continue; }
      var t = -dist / nd;
      if (nd < 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t);
      if (t0 > t1) return null;
    }
    return t1 - t0 > 1e-9 ? [t0, t1] : null;
  }

  // Respuesta real y errores típicos del reto (todo en SI).
  //   plane: { E, A, th }      face: { E: [..], shape, dims, id }      total: { E: [..], shape, dims }
  function answers(kind, o) {
    if (kind === 'plane') {
      var t = uniform(o.E, o.A, o.th);
      return { truth: t, scale: o.E * o.A, sin: o.E * o.A * Math.sin(o.th * RAD), sign: -t, noCos: o.E * o.A, cm2: t * 1e4 };
    }
    var r = closed(o.shape, o.E, o.dims), Em = norm(o.E);
    if (kind === 'face') {
      var f = r.faces.filter(function (x) { return x.id === o.id; })[0];
      var th = angleBetween(o.E, f.n);
      return { truth: f.flux, scale: Em * f.A, sin: Em * f.A * Math.sin(th * RAD), sign: -f.flux, noCos: Em * f.A, cm2: f.flux * 1e4 };
    }
    var abs = 0, out = 0;
    r.faces.forEach(function (x) { abs += Math.abs(x.flux); if (x.flux > 0) out += x.flux; });
    return { truth: r.total, scale: abs || 1, sumAbs: abs, outOnly: out };
  }
  var ORDER = ['sin', 'sign', 'noCos', 'cm2', 'sumAbs', 'outOnly'];
  // student en SI. Un error solo cuenta si su valor se distingue del real.
  function diagnose(kind, o, student) {
    if (!isFinite(student)) return 'bad';
    var r = answers(kind, o);
    function tol(t) { return Math.max(0.01 * Math.abs(t), 0.004 * r.scale, 0.006); }
    if (Math.abs(student - r.truth) <= tol(r.truth)) return 'ok';
    for (var i = 0; i < ORDER.length; i++) {
      var k = ORDER[i];
      if (r[k] == null || Math.abs(r[k] - r.truth) <= 2 * tol(r.truth)) continue;
      if (Math.abs(student - r[k]) <= tol(r[k])) return k;
    }
    return 'bad';
  }

  window.LabMath.flux = {
    EPS0: EPS0, dot: dot, cross: cross, norm: norm,
    uniform: uniform, uniformVec: uniformVec, angleBetween: angleBetween, angleFor: angleFor,
    gauss: gauss, faceInfo: faceInfo, centroid: centroid, quad: quad, faces: faces, closed: closed, faceFlux: faceFlux,
    linearX: linearX, linearY: linearY, gaussFlux: gaussFlux, pointSphere: pointSphere, clipConvex: clipConvex,
    answers: answers, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var W = 640, H = 420, SC2 = 9.5;                      // vista de canto: px por cm
  var MSG = {
    ok: ['Coincide', 'Tu flujo es el del lab.'],
    sin: ['Usaste el ángulo con la superficie', 'θ se mide entre E y la normal n̂, no entre E y la superficie. Si te dan el ángulo con la superficie, θ = 90° − ese ángulo (y el coseno se vuelve seno).'],
    sign: ['Revisa el signo', 'El flujo es negativo si el campo entra por la cara (θ > 90°). En una superficie cerrada la normal siempre apunta hacia afuera.'],
    noCos: ['Te faltó el coseno', 'E·A solo vale si E es perpendicular a la superficie (θ = 0). En general Φ = EA cos θ.'],
    cm2: ['El área en m²', 'Pasa el área a metros cuadrados: 1 cm² = 10⁻⁴ m². Por ejemplo, 20 cm × 30 cm = 0.06 m².'],
    sumAbs: ['Sumaste sin signos', 'Por donde entra el campo el flujo es negativo y por donde sale, positivo. Con los signos, el total de un campo uniforme da cero.'],
    outOnly: ['Faltan las caras por donde entra', 'Sumaste solo los flujos positivos. Las caras por donde entra el campo restan: el total da cero.'],
    bad: ['No coincide', 'Calcula θ entre E y la normal de la cara, el área en m² y luego Φ = EA cos θ, con su signo.']
  };

  window.Labs['flux-surface'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, F = window.LabMath.flux;
    var s0 = cfg.start || {};
    var mode = s0.mode === 'closed' ? 'closed' : 'plane';
    var want3D = !!(window.matchMedia && window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches);
    var view = want3D ? 'persp' : 'edge';
    var az = 32, EL = 22, drag = null, checked = false;

    var modeSel = UI.select({ label: 'Modo', options: ['Superficie plana', 'Superficie cerrada'] });
    modeSel.input.value = mode === 'closed' ? '1' : '0';
    var shapeSel = UI.select({ label: 'Superficie', options: ['Rectángulo', 'Disco'] });
    var bodySel = UI.select({ label: 'Cuerpo', options: ['Cubo', 'Prisma triangular'] });
    function sl(label, min, max, step, val, unit, fmt) {
      return UI.slider({ label: label, min: min, max: max, step: step, value: val, unit: unit, fmt: fmt }, refresh);
    }
    var eS = sl('Magnitud del campo E', 100, 2000, 50, s0.E || 1000, 'N/C');
    var aS = sl('Dirección de E (desde +x)', -180, 180, 5, s0.alpha || 0, '°');
    var nS = sl('Giro de la superficie (dirección de n̂)', 0, 360, 5, s0.normal != null ? s0.normal : 60, '°');
    var wS = sl('Ancho a (el que ves de canto)', 5, 36, 1, s0.a || 20, 'cm');
    var dS = sl('Fondo b', 5, 36, 1, s0.b || 30, 'cm');
    var rS = sl('Radio r', 3, 18, 1, s0.r || 12, 'cm');
    var cS = sl('Lado del cubo a', 10, 30, 1, s0.cube || 20, 'cm');
    var pbS = sl('Base del prisma b (sobre x)', 10, 30, 1, 24, 'cm');
    var phS = sl('Altura del prisma h (sobre z)', 10, 30, 1, 18, 'cm');
    var pwS = sl('Fondo del prisma w (sobre y)', 10, 30, 1, 20, 'cm');
    var kSel = UI.select({ label: '¿Qué calculas?', options: ['Flujo por la superficie'] });
    var aIn = UI.input({ label: 'Tu flujo Φ (N·m²/C)', type: 'number', step: 'any', inputmode: 'decimal', mono: false, hint: 'Medidas en cm: pásalas a metros (1 cm² = 10⁻⁴ m²). Escribe el signo si es negativo.' });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var live = h('p', { class: 'lab-note fx-live mono' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(W, H, 'Campo eléctrico uniforme y la superficie; se ven las líneas de campo que la atraviesan, la normal y el ángulo theta');
    svg.classList.add('fx-stage');
    var btnP = UI.button('Perspectiva', 'ghost', function () { setView('persp'); });
    var btnE = UI.button('De canto', 'ghost', function () { setView('edge'); });
    var viewBar = h('div', { class: 'lab-buttons lab-viewbar', hidden: !want3D, role: 'group', 'aria-label': 'Tipo de vista' }, [btnP, btnE]);
    var hintBoard = h('p', { class: 'lab-note' });

    var planeBox = h('div', { class: 'fx-group' }, [shapeSel.node, nS.node, wS.node, dS.node, rS.node]);
    var bodyBox = h('div', { class: 'fx-group' }, [bodySel.node, cS.node, pbS.node, phS.node, pwS.node]);
    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        modeSel.node, eS.node, aS.node, planeBox, bodyBox,
        kSel.node, aIn.node, h('div', { class: 'lab-buttons' }, [run]), note, verdict,
        h('details', { class: 'fx-details' }, [h('summary', {}, ['Ver los valores del lab']), facts])
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Superficie en un campo uniforme']),
        viewBar, svg, hintBoard,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'líneas de campo E']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'normal (sale)']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'entra (Φ < 0)']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'superficie'])
        ]),
        live
      ])
    ]));
    var form = mount.querySelector('form');
    form.addEventListener('submit', function (e) { e.preventDefault(); check(); });
    aIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    modeSel.input.addEventListener('change', function () { mode = modeSel.input.value === '1' ? 'closed' : 'plane'; resetCheck(); syncKinds(); refresh(); });
    shapeSel.input.addEventListener('change', function () { resetCheck(); refresh(); });
    bodySel.input.addEventListener('change', function () { resetCheck(); syncKinds(); refresh(); });
    kSel.input.addEventListener('change', function () { resetCheck(); draw(); });
    if (s0.shape === 'disk') shapeSel.input.value = '1';

    function resetCheck() { checked = false; verdict.hidden = true; }
    function body() { return bodySel.input.value === '1' ? 'prism' : 'cube'; }
    function dims() {
      return body() === 'prism' ? { b: pbS.get() / 100, h: phS.get() / 100, w: pwS.get() / 100 } : { a: cS.get() / 100 };
    }
    function Evec() { var a = aS.get() * RAD, E = eS.get(); return [E * Math.cos(a), 0, E * Math.sin(a)]; }
    function syncKinds() {
      var opts = mode === 'plane' ? ['Flujo por la superficie'] :
        F.faces(body(), dims()).map(function (f) { return 'Flujo por la cara ' + f.name; }).concat(['Flujo total']);
      var keep = +kSel.input.value;
      kSel.input.innerHTML = '';
      opts.forEach(function (o, i) { kSel.input.appendChild(h('option', { value: String(i) }, [o])); });
      kSel.input.value = String(Math.min(keep, opts.length - 1));
    }
    function syncControls() {
      var disk = shapeSel.input.value === '1';
      planeBox.hidden = mode !== 'plane'; bodyBox.hidden = mode !== 'closed';
      wS.node.hidden = dS.node.hidden = disk; rS.node.hidden = !disk;
      var pr = body() === 'prism';
      cS.node.hidden = pr; pbS.node.hidden = phS.node.hidden = pwS.node.hidden = !pr;
      hintBoard.textContent = view === 'persp' ? 'Arrastra la figura para girar la cámara.' :
        mode === 'plane' ? 'Vista de canto: la superficie se ve como una raya. Arrástrala para girarla.' :
        'Vista de canto: las caras de enfrente y de atrás quedan paralelas a la hoja.';
    }
    function setView(v) {
      view = v === 'persp' && want3D ? 'persp' : 'edge';
      btnP.setAttribute('aria-pressed', String(view === 'persp'));
      btnE.setAttribute('aria-pressed', String(view === 'edge'));
      draw();
    }

    // Datos de la superficie plana (cm y grados; θ entre E y n̂).
    function plane() {
      var disk = shapeSel.input.value === '1', al = aS.get(), nd = nS.get();
      var Ehat = [Math.cos(al * RAD), 0, Math.sin(al * RAD)], n = [Math.cos(nd * RAD), 0, Math.sin(nd * RAD)];
      var t1 = [-Math.sin(nd * RAD), 0, Math.cos(nd * RAD)], t2 = [0, 1, 0];
      var a = wS.get(), b = dS.get(), r = rS.get();
      var Acm = disk ? Math.PI * r * r : a * b;
      return { disk: disk, Ehat: Ehat, n: n, t1: t1, t2: t2, a: a, b: b, r: r, Acm: Acm, A: Acm / 1e4, th: F.angleBetween(Ehat, n), E: eS.get() };
    }
    // ¿El punto (en coordenadas de la superficie: μ sobre t1, y sobre t2) está dentro?
    function insidePlane(p, mu, y) { return p.disk ? mu * mu + y * y <= p.r * p.r : Math.abs(mu) <= p.a / 2 && Math.abs(y) <= p.b / 2; }
    // Rejilla de líneas de campo: separación ∝ 1/√E (líneas por área ∝ E).
    function spacing() { return 5.4 * Math.sqrt(1000 / eS.get()); }
    function grid(Ehat, R) {
      var d = spacing(), e1 = [-Ehat[2], 0, Ehat[0]], out = [], m = Math.ceil(R / d);
      for (var i = -m; i < m; i++) for (var j = -m; j < m; j++) {
        var s = (i + 0.5) * d, y = (j + 0.5) * d;
        if (Math.hypot(s, y) > R + d / 2) continue;
        out.push({ s: s, y: y, p: add(mul(e1, s), [0, y, 0]) });
      }
      return out;
    }
    // Cruces de las líneas con la superficie plana: { p, t, sgn } con t sobre la línea.
    function planeHits(p) {
      var R = (p.disk ? p.r : Math.hypot(p.a, p.b) / 2) + spacing(), En = dot(p.Ehat, p.n), out = [];
      grid(p.Ehat, R).forEach(function (L) {
        var hit = null;
        if (Math.abs(En) > 1e-9) {
          var t = -dot(L.p, p.n) / En, X = add(L.p, mul(p.Ehat, t));
          if (insidePlane(p, dot(X, p.t1), X[1])) hit = { t: t, X: X };
        }
        out.push({ L: L, hit: hit });
      });
      return out;
    }

    /* ---------- Dibujo ---------- */
    function el(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n);
      return n;
    }
    function txt(x, y, s, anchor, size, parent) {
      var t = el('text', { x: x, y: y, 'class': 'ann fx-lbl', 'text-anchor': anchor || 'middle', 'font-size': size || 17 }, parent);
      t.textContent = s;
      return t;
    }
    function pth(pts, cls, w, extra, parent) {
      if (!pts.length) return null;
      var d = pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('');
      var a = { d: d, 'class': cls, fill: 'none', 'stroke-width': w || 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
      for (var k in (extra || {})) a[k] = extra[k];
      return el('path', a, parent);
    }
    function arrowHead(x, y, ux, uy, cls, w, size, parent) {
      var hh = size || 10;
      pth([[x - ux * hh - uy * hh * 0.6, y - uy * hh + ux * hh * 0.6], [x, y], [x - ux * hh + uy * hh * 0.6, y - uy * hh - ux * hh * 0.6]], cls, w, null, parent);
    }
    function arrow(x0, y0, x1, y1, cls, w, parent) {
      var L = Math.hypot(x1 - x0, y1 - y0);
      if (!(L > 2)) return;
      pth([[x0, y0], [x1, y1]], cls, w, null, parent);
      arrowHead(x1, y1, (x1 - x0) / L, (y1 - y0) / L, cls, w, Math.min(11, L * 0.45), parent);
    }
    function frame() {
      svg.innerHTML = '';
      var defs = el('defs', {});
      var cp = el('clipPath', { id: clipId }, defs);
      el('rect', { x: 0, y: 0, width: W, height: H }, cp);
      var g = el('g', { 'class': 'sketch', 'clip-path': 'url(#' + clipId + ')' });
      return g;
    }
    var clipId = UI.id('fx-clip');

    // Proyecciones. Canto: plano xz de la hoja. Perspectiva: como view3 (z hacia arriba).
    function P2(q) { return [W / 2 + SC2 * q[0], H / 2 - SC2 * q[2]]; }
    function camera(sc) {
      var ca = Math.cos(az * RAD), sa = Math.sin(az * RAD), ce = Math.cos(EL * RAD), se = Math.sin(EL * RAD);
      var R = [sa, ca, 0], U = [-ca * se, sa * se, ce];
      return {
        P: function (q) { var x = q[0] * ca - q[1] * sa, y = q[0] * sa + q[1] * ca; return [W / 2 + sc * y, H / 2 + 10 - sc * (q[2] * ce - x * se)]; },
        V: cross(R, U)
      };
    }
    // Llave del campo en la esquina: flecha con la dirección de E y su etiqueta.
    function keyE(g, P, Ehat) {
      var c = [62, 44], a = P([0, 0, 0]), b = P(Ehat), dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy);
      el('rect', { x: 12, y: 10, width: 100, height: 92, rx: 8, 'class': 'fx-key' }, g);
      if (m > 0.05) arrow(c[0] - dx / m * 24, c[1] - dy / m * 24, c[0] + dx / m * 24, c[1] + dy / m * 24, 'ref', 3, g);
      else el('circle', { cx: c[0], cy: c[1], r: 5, 'class': 'dot-ref' }, g);
      txt(62, 92, 'campo E', 'middle', 15, g);
    }

    function draw() {
      syncControls();
      svg.classList.toggle('fx-drag', view === 'persp' || mode === 'plane');
      var g = frame();
      if (mode === 'plane') { if (view === 'persp') drawPlane3(g); else drawPlane2(g); }
      else if (view === 'persp') drawBody3(g); else drawBody2(g);
      facts.innerHTML = '';
      factsRows().forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    function countText(hits, En) {
      var nIn = hits.filter(function (x) { return x.hit; }).length;
      var dir = nIn === 0 ? '' : En > 1e-9 ? ', a favor de n̂ (Φ > 0)' : ', en contra de n̂ (Φ < 0)';
      return 'Líneas que atraviesan la superficie: ' + nIn + dir + ' · θ = ' + UI.fmt(plane().th, 4) + '°';
    }

    function drawPlane2(g) {
      var p = plane(), hits = planeHits(p), En = dot(p.Ehat, p.n), half = p.disk ? p.r : p.a / 2, dots = [];
      // Líneas de toda la hoja (más juntas que la rejilla 3D); las que cruzan, más marcadas.
      var d = spacing() / 2, e1 = [-p.Ehat[2], 0, p.Ehat[0]], m = Math.ceil(40 / d);
      for (var i = -m; i < m; i++) {
        var s = (i + 0.5) * d, base = mul(e1, s), on = false;
        if (Math.abs(En) > 1e-9) {
          var X = add(base, mul(p.Ehat, -dot(base, p.n) / En));
          if (Math.abs(dot(X, p.t1)) <= half) { on = true; dots.push(X); }
        }
        var A = P2(add(base, mul(p.Ehat, -45))), B = P2(add(base, mul(p.Ehat, 45)));
        pth([A, B], 'ref', on ? 2.6 : 1.4, on ? null : { opacity: 0.45 }, g);
        [-24, 0, 24].forEach(function (t) {
          var q = P2(add(base, mul(p.Ehat, t + 6)));
          if (q[0] > 8 && q[0] < W - 8 && q[1] > 8 && q[1] < H - 8) arrowHead(q[0], q[1], p.Ehat[0], -p.Ehat[2], 'ref', on ? 2.6 : 1.4, 8, g);
        });
      }
      // La superficie de canto.
      var S0 = P2(mul(p.t1, -half)), S1 = P2(mul(p.t1, half));
      pth([S0, S1], 'student', 7, null, g);
      dots.forEach(function (X) { var q = P2(X); el('circle', { cx: q[0], cy: q[1], r: 4.5, 'class': En > 0 ? 'dot-error' : 'dot-aux' }, g); });
      drawNormal2(g, p);
      keyE(g, function (q) { return [q[0], -q[2]]; }, p.Ehat);
      live.textContent = countText(hits, En);
    }
    function drawNormal2(g, p) {
      var C = P2([0, 0, 0]), L = 78, nx = p.n[0], nz = p.n[2];
      arrow(C[0], C[1], C[0] + nx * L, C[1] - nz * L, 'error', 3.4, g);
      txt(C[0] + nx * (L + 20), C[1] - nz * (L + 20) + 6, 'n̂', 'middle', 19, g);
      // Arco de θ entre E y n̂ (radio 40 px) y su etiqueta.
      var aE = Math.atan2(p.Ehat[2], p.Ehat[0]), aN = Math.atan2(nz, nx), da = aN - aE;
      while (da > Math.PI) da -= 2 * Math.PI;
      while (da < -Math.PI) da += 2 * Math.PI;
      var pts = [], r = 40;
      for (var k = 0; k <= 24; k++) { var a = aE + da * k / 24; pts.push([C[0] + r * Math.cos(a), C[1] - r * Math.sin(a)]); }
      pth([[C[0], C[1]], [C[0] + 58 * Math.cos(aE), C[1] - 58 * Math.sin(aE)]], 'aux', 1.6, { 'stroke-dasharray': '5 4' }, g);
      if (Math.abs(da) > 0.03) pth(pts, 'aux', 2, null, g);
      var am = aE + da / 2;
      txt(C[0] + 56 * Math.cos(am), C[1] - 56 * Math.sin(am) + 6, 'θ', 'middle', 18, g);
    }

    function drawPlane3(g) {
      var p = plane(), cam = camera(7.6), P = cam.P, hits = planeHits(p), En = dot(p.Ehat, p.n);
      var front = dot(cam.V, p.n) * En > 0;                    // la mitad de la línea que sale queda al frente
      var halfLen = 34, later = [];
      hits.forEach(function (x) {
        var L = x.L, A = add(L.p, mul(p.Ehat, -halfLen)), B = add(L.p, mul(p.Ehat, halfLen));
        if (!x.hit) { pth([P(A), P(B)], 'ref', 1.1, { opacity: 0.32 }, g); return; }
        var X = x.hit.X, back = front ? [A, X] : [X, B], fr = front ? [X, B] : [A, X];
        pth([P(back[0]), P(back[1])], 'ref', 2, null, g);
        later.push({ fr: fr, X: X, B: B });
      });
      // Superficie (relleno translúcido) con su borde.
      var outline = [];
      if (p.disk) for (var k = 0; k <= 48; k++) { var t = 2 * Math.PI * k / 48; outline.push(P(add(mul(p.t1, p.r * Math.cos(t)), mul(p.t2, p.r * Math.sin(t))))); }
      else [[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]].forEach(function (c) { outline.push(P(add(mul(p.t1, c[0] * p.a / 2), mul(p.t2, c[1] * p.b / 2)))); });
      pth(outline, 'student', 3, { 'class': 'student fx-surf' }, g);
      later.forEach(function (x) {
        pth([P(x.fr[0]), P(x.fr[1])], 'ref', 2, null, g);
        var q = P(x.X); el('circle', { cx: q[0], cy: q[1], r: 3.6, 'class': En > 0 ? 'dot-error' : 'dot-aux' }, g);
        var b = P(x.B), a = P(add(x.B, mul(p.Ehat, -3))), m = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (m > 1e-6) arrowHead(b[0], b[1], (b[0] - a[0]) / m, (b[1] - a[1]) / m, 'ref', 2, 8, g);
      });
      // Normal y θ.
      var C = P([0, 0, 0]), N = P(mul(p.n, 13)), Et = P(mul(p.Ehat, 10));
      arrow(C[0], C[1], N[0], N[1], 'error', 3.4, g);
      var dn = Math.hypot(N[0] - C[0], N[1] - C[1]) || 1;
      txt(N[0] + (N[0] - C[0]) / dn * 18, N[1] + (N[1] - C[1]) / dn * 18 + 6, 'n̂', 'middle', 19, g);
      pth([C, Et], 'aux', 1.6, { 'stroke-dasharray': '5 4' }, g);
      var arcPts = [], u = p.Ehat, w = sub(p.n, mul(u, dot(u, p.n))), wm = norm(w), th = p.th * RAD;
      if (wm > 1e-9 && th > 0.03) {
        w = mul(w, 1 / wm);
        for (var j = 0; j <= 24; j++) { var aa = th * j / 24; arcPts.push(P(add(mul(u, 6 * Math.cos(aa)), mul(w, 6 * Math.sin(aa))))); }
        pth(arcPts, 'aux', 2, null, g);
        var mid = P(add(mul(u, 8.6 * Math.cos(th / 2)), mul(w, 8.6 * Math.sin(th / 2))));
        txt(mid[0], mid[1] + 6, 'θ', 'middle', 18, g);
      }
      keyE(g, function (q) { var a0 = P([0, 0, 0]), a1 = P(q); return [a1[0] - a0[0], a1[1] - a0[1]]; }, p.Ehat);
      live.textContent = countText(hits, En);
    }

    // Superficie cerrada, centrada en el origen (cm).
    function bodyGeom() {
      var sh = body(), dm = dims(), dcm = {}, k;
      for (k in dm) dcm[k] = dm[k] * 100;
      var fs = F.faces(sh, dcm), ctr = sh === 'prism' ? [dcm.b / 3, dcm.w / 2, dcm.h / 3] : [dcm.a / 2, dcm.a / 2, dcm.a / 2];
      var E = Evec(), res = F.closed(sh, E, dm);
      var list = fs.map(function (f, i) {
        var P0 = sub(f.P0, ctr), verts = f.tri ? [P0, add(P0, f.u), add(P0, f.v)] : [P0, add(P0, f.u), add(add(P0, f.u), f.v), add(P0, f.v)];
        var info = F.faceInfo(f);
        return { id: f.id, name: f.name, verts: verts, n: info.n, c: sub(F.centroid(f), ctr), flux: res.faces[i].flux, A: res.faces[i].A };
      });
      return { shape: sh, faces: list, total: res.total, E: E, Ehat: mul(E, 1 / norm(E)) };
    }
    function faceCls(f, scale) { return Math.abs(f.flux) < 1e-9 * scale ? 'fx-zero' : f.flux > 0 ? 'fx-out' : 'fx-in'; }
    function bodyLines(b) {
      var R = 0;
      b.faces.forEach(function (f) { f.verts.forEach(function (v) { R = Math.max(R, norm(v)); }); });
      var planes = b.faces.map(function (f) { return { n: f.n, P: f.verts[0] }; });
      return grid(b.Ehat, R + spacing()).map(function (L) { return { L: L, cut: F.clipConvex(L.p, b.Ehat, planes) }; });
    }

    function drawBody2(g) {
      var b = bodyGeom(), scale = norm(b.E), cuts = [];
      var planes = b.faces.map(function (f) { return { n: f.n, P: f.verts[0] }; });
      var d = spacing() / 2, e1 = [-b.Ehat[2], 0, b.Ehat[0]], m = Math.ceil(40 / d), nIn = 0;
      for (var i = -m; i < m; i++) {
        var s = (i + 0.5) * d, base = mul(e1, s), cut = F.clipConvex(base, b.Ehat, planes), on = !!cut;
        if (cut) cuts.push({ p: base, cut: cut });
        pth([P2(add(base, mul(b.Ehat, -45))), P2(add(base, mul(b.Ehat, 45)))], 'ref', on ? 2.4 : 1.4, on ? null : { opacity: 0.45 }, g);
        [-26, 26].forEach(function (t) {
          var q = P2(add(base, mul(b.Ehat, t + 6)));
          if (q[0] > 8 && q[0] < W - 8 && q[1] > 8 && q[1] < H - 8) arrowHead(q[0], q[1], b.Ehat[0], -b.Ehat[2], 'ref', on ? 2.4 : 1.4, 8, g);
        });
      }
      // Corte del cuerpo en el plano de la hoja: las caras perpendiculares a la hoja se ven como aristas.
      var side = b.faces.filter(function (f) { return Math.abs(f.n[1]) < 0.5; });
      var poly = b.faces.filter(function (f) { return f.n[1] < -0.5; })[0];
      if (poly) pth(poly.verts.map(function (v) { return P2(v); }).concat([P2(poly.verts[0])]), 'axis', 1, { 'class': 'fx-body' }, g);
      side.forEach(function (f) {
        var vs = f.verts.filter(function (v) { return v[1] < 0; });            // la arista de enfrente
        if (vs.length < 2) vs = f.verts.slice(0, 2);
        var cls = faceCls(f, scale * f.A), e = cls === 'fx-out' ? 'error' : cls === 'fx-in' ? 'aux' : 'axis';
        pth([P2(vs[0]), P2(vs[1])], e, 6, null, g);
        var mid = P2(mul(add(vs[0], vs[1]), 0.5));
        arrow(mid[0], mid[1], mid[0] + f.n[0] * 44, mid[1] - f.n[2] * 44, 'error', 2.6, g);
      });
      cuts.forEach(function (x) {
        nIn++;
        var a = P2(add(x.p, mul(b.Ehat, x.cut[0]))), c = P2(add(x.p, mul(b.Ehat, x.cut[1])));
        el('circle', { cx: a[0], cy: a[1], r: 4.5, 'class': 'dot-aux' }, g);
        el('circle', { cx: c[0], cy: c[1], r: 4.5, 'class': 'dot-error' }, g);
      });

      keyE(g, function (q) { return [q[0], -q[2]]; }, b.Ehat);
      live.textContent = 'De canto, líneas que entran: ' + nIn + ' · que salen: ' + nIn + ' · flujo total = ' + UI.fmt(Math.abs(b.total) < 1e-9 ? 0 : b.total, 4) + ' N·m²/C';
    }

    function drawBody3(g) {
      var b = bodyGeom(), cam = camera(7.6), P = cam.P, lines = bodyLines(b), scale = norm(b.E), nIn = 0;
      lines.forEach(function (x) {
        var L = x.L, A = add(L.p, mul(b.Ehat, -34)), B = add(L.p, mul(b.Ehat, 34));
        pth([P(A), P(B)], 'ref', x.cut ? 2 : 1.1, x.cut ? null : { opacity: 0.3 }, g);
        if (x.cut) { nIn++; var q = P(B), q0 = P(add(B, mul(b.Ehat, -3))), mm = Math.hypot(q[0] - q0[0], q[1] - q0[1]); if (mm > 1e-6) arrowHead(q[0], q[1], (q[0] - q0[0]) / mm, (q[1] - q0[1]) / mm, 'ref', 2, 8, g); }
      });
      // Caras de atrás hacia adelante (pintor), translúcidas.
      b.faces.slice().sort(function (f1, f2) { return dot(cam.V, f1.c) - dot(cam.V, f2.c); }).forEach(function (f) {
        var pts = f.verts.map(P); pts.push(pts[0]);
        pth(pts, 'axis', 1.4, { 'class': 'fx-face ' + faceCls(f, scale * f.A) }, g);
      });
      lines.forEach(function (x) {
        if (!x.cut) return;
        var a = P(add(x.L.p, mul(b.Ehat, x.cut[0]))), c = P(add(x.L.p, mul(b.Ehat, x.cut[1])));
        el('circle', { cx: a[0], cy: a[1], r: 3.4, 'class': 'dot-aux' }, g);
        el('circle', { cx: c[0], cy: c[1], r: 3.4, 'class': 'dot-error' }, g);
      });
      b.faces.forEach(function (f) {
        if (dot(cam.V, f.n) < -0.05) return;                    // solo las normales de las caras que se ven
        var a = P(f.c), c = P(add(f.c, mul(f.n, 7)));
        arrow(a[0], a[1], c[0], c[1], 'error', 2.6, g);
      });
      keyE(g, function (q) { var a0 = P([0, 0, 0]), a1 = P(q); return [a1[0] - a0[0], a1[1] - a0[1]]; }, b.Ehat);
      live.textContent = 'Líneas que atraviesan el cuerpo: ' + nIn + ' (cada una entra y sale) · flujo total = ' + UI.fmt(Math.abs(b.total) < 1e-9 ? 0 : b.total, 4) + ' N·m²/C';
    }

    function factsRows() {
      if (mode === 'plane') {
        var p = plane();
        return [['E', UI.fmt(p.E, 4) + ' N/C'], ['A', UI.fmt(p.Acm, 5) + ' cm² = ' + UI.fmt(p.A, 5) + ' m²'], ['θ (entre E y n̂)', UI.fmt(p.th, 4) + '°'],
          ['ángulo con la superficie', UI.fmt(Math.abs(90 - p.th), 4) + '°'], ['Φ = EA cos θ', UI.fmt(F.uniform(p.E, p.A, p.th), 5) + ' N·m²/C']];
      }
      var b = bodyGeom(), rows = [];
      b.faces.forEach(function (f) { rows.push(['Φ ' + f.name, UI.fmt(Math.abs(f.flux) < 1e-9 ? 0 : f.flux, 5) + ' N·m²/C']); });
      rows.push(['Φ total', UI.fmt(Math.abs(b.total) < 1e-9 ? 0 : b.total, 4) + ' N·m²/C']);
      return rows;
    }

    function task() {
      if (mode === 'plane') { var p = plane(); return { kind: 'plane', o: { E: p.E, A: p.A, th: p.th } }; }
      var fs = F.faces(body(), dims()), i = +kSel.input.value;
      if (i >= fs.length) return { kind: 'total', o: { E: Evec(), shape: body(), dims: dims() } };
      return { kind: 'face', o: { E: Evec(), shape: body(), dims: dims(), id: fs[i].id } };
    }
    function refresh() { if (mode === 'closed' && kSel.input.options.length < 2) syncKinds(); if (checked) check(); else draw(); }
    function check() {
      var val = parseFloat(String(aIn.input.value).replace(',', '.')), t = task();
      if (!isFinite(val)) { UI.verdict(verdict, 'bad', 'Escribe un número', 'Usa punto decimal; por ejemplo −12.5.'); checked = false; draw(); return; }
      var r = F.diagnose(t.kind, t.o, val), msg = MSG[r] || MSG.bad;
      UI.verdict(verdict, r === 'ok' ? 'ok' : r === 'bad' ? 'bad' : 'warn', msg[0], msg[1]);
      checked = true;
      draw();
    }

    /* ---------- Arrastrar: de canto gira la superficie; en perspectiva gira la cámara ---------- */
    function toSvg(ev) {
      var m = svg.getScreenCTM();
      if (!m) return null;
      var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      return pt.matrixTransform(m.inverse());
    }
    svg.addEventListener('pointerdown', function (ev) {
      var q = toSvg(ev);
      if (!q) return;
      if (view === 'persp') drag = { kind: 'cam', x: ev.clientX, y: ev.clientY, az: az, el: EL };
      else if (mode === 'plane') drag = { kind: 'tilt' };
      else return;
      ev.preventDefault();
      try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* sin captura */ }
      if (drag.kind === 'tilt') tiltTo(q);
    });
    function tiltTo(q) {
      var a = Math.atan2(-(q.y - H / 2), q.x - W / 2) / RAD;
      if (Math.hypot(q.x - W / 2, q.y - H / 2) < 12) return;
      // El punto arrastrado marca la dirección de la superficie; la normal va 90° antes.
      var nd = Math.round(((a - 90) % 360 + 360) % 360 / 5) * 5 % 360;
      var cur = nS.get(), alt = (nd + 180) % 360;
      var dist = function (u) { var x = Math.abs(u - cur) % 360; return Math.min(x, 360 - x); };
      nS.set(dist(alt) < dist(nd) ? alt : nd);
      refresh();
    }
    svg.addEventListener('pointermove', function (ev) {
      if (!drag) return;
      if (drag.kind === 'cam') {
        az = drag.az + (ev.clientX - drag.x) * 0.4;
        EL = Math.max(-10, Math.min(70, drag.el + (ev.clientY - drag.y) * 0.3));
        draw();
      } else { var q = toSvg(ev); if (q) tiltTo(q); }
    });
    function end() { drag = null; }
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);

    // Ejemplo cargado: un compañero usó el ángulo con la superficie (seno en lugar de coseno).
    (function () {
      syncKinds();
      if (mode === 'plane') {
        var p = plane();
        aIn.input.value = UI.fmt(F.answers('plane', { E: p.E, A: p.A, th: p.th }).sin, 5);
        note.textContent = 'Ejemplo cargado: así calculó un compañero el flujo por el rectángulo. ¿Ves el error? Gira la superficie y cuenta cuántas líneas la cruzan.';
      }
    })();
    setView(view);
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
