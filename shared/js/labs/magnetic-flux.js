/* =====================================================================
   Lab magnetic-flux (Física 3 · S10): flujo magnético y ley de Gauss del magnetismo.
   Modo espira: una espira plana de área A en un campo uniforme B; θ es el ángulo
   entre B y la normal de la espira: Φ = B·A = BA cos θ (1 Wb = 1 T·m²).
   El lab también suma B·n̂ dA en una malla sobre la espira (oráculo numérico).
   Modo Gauss: imanes de barra (el modelo de dos polos de S01, LabMath.magnet:
   un polo s da B = s·B₀·(R₀/r)², con B₀ = 1 mT a R₀ = 2 cm) y una esfera cerrada.
   El lab integra B·dA del campo de afuera sobre la esfera; si la esfera corta un
   imán, también cuenta el flujo que regresa POR DENTRO del imán (de S a N), que es
   justo el que sale del polo encerrado. El total siempre da cero: ∮B·dA = 0.
   Un polo s «emite» 4π·s·B₀·R₀² = 50.3·s mT·cm² = 5.03·s µWb.
   Unidades: cm, mT; flujo en µWb (1 mT·cm² = 10⁻⁷ Wb = 0.1 µWb).
   Reto de espira (Φ en µWb). Errores que detecta:
     sin    usó sen θ (midió θ desde el plano)     cm2   dejó el área en cm² (×10⁴)
     diam   usó el diámetro como radio
   Reto de Gauss (Φ por las caras restantes, µWb):
     sign   olvidó que el flujo neto es cero (dio el mismo signo)   zero  respondió 0
   ===================================================================== */
(function () {
  var RAD = Math.PI / 180, MU0 = 4 * Math.PI * 1e-7;

  /* ------------------------- Matemática pura ------------------------- */
  // SI: B en T, A en m², θ en grados → Wb.
  function flux(B, A, thetaDeg) { return B * A * Math.cos(thetaDeg * RAD); }
  // Espira rectangular w × h (m) cuya normal forma θ con un B uniforme; suma B·n̂ dA en una malla n × n.
  function loopGrid(B, w, h, thetaDeg, n) {
    var nh = [Math.sin(thetaDeg * RAD), 0, Math.cos(thetaDeg * RAD)], s = 0, dA = w * h / (n * n);
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) s += (B[0] * nh[0] + B[1] * nh[1] + B[2] * nh[2]) * dA;
    return s;
  }
  // B = B₀(1 + kx) perpendicular a una espira de x₀ a x₀ + w y alto h (SI).
  function linear(B0, k, x0, w, h) { return B0 * h * (w + k * ((x0 + w) * (x0 + w) - x0 * x0) / 2); }
  // Espira rectangular coplanar con un alambre largo: lados paralelos a distancias a y b, alto h (SI).
  function wireRect(I, a, b, h) { return MU0 * I * h / (2 * Math.PI) * Math.log(b / a); }

  // Esfera de centro (cx, cy, 0) y radio R (cm) alrededor de imanes en el plano z = 0. Campo de afuera
  // integrado con una malla nθ × nφ (punto medio). Devuelve mT·cm²: out (sale), in (entra, negativo),
  // inner (flujo por dentro de los imanes que cortan la esfera) y net.
  function sphere(magnets, cx, cy, R, nt, np) {
    var M = window.LabMath.magnet, poles = [];
    nt = nt || 90; np = np || 180;
    magnets.forEach(function (m) { var p = M.poles(m), s = m.s == null ? 1 : m.s; poles.push({ x: p.N.x, y: p.N.y, q: s }, { x: p.S.x, y: p.S.y, q: -s }); });
    var k = M.B0 * M.R0 * M.R0, out = 0, inn = 0;
    for (var i = 0; i < nt; i++) {
      var th = Math.PI * (i + 0.5) / nt, st = Math.sin(th), ct = Math.cos(th);
      for (var j = 0; j < np; j++) {
        var ph = 2 * Math.PI * (j + 0.5) / np, nx = st * Math.cos(ph), ny = st * Math.sin(ph), nz = ct;
        var x = cx + R * nx, y = cy + R * ny, z = R * nz, bn = 0;
        poles.forEach(function (p) { var dx = x - p.x, dy = y - p.y, r = Math.hypot(dx, dy, z); bn += p.q * k * (dx * nx + dy * ny + z * nz) / (r * r * r); });
        var dA = R * R * st * (Math.PI / nt) * (2 * Math.PI / np) * bn;
        if (dA > 0) out += dA; else inn += dA;
      }
    }
    var enc = 0;
    poles.forEach(function (p) { if (Math.hypot(p.x - cx, p.y - cy) < R) enc += p.q; });
    var inner = -4 * Math.PI * k * enc;
    return { out: out, 'in': inn, outside: out + inn, inner: inner, net: out + inn + inner, enclosed: enc };
  }
  // Flujo que «emite» un polo s según la ley del inverso del cuadrado, en mT·cm².
  function poleFlux(s) { var M = window.LabMath.magnet; return 4 * Math.PI * s * M.B0 * M.R0 * M.R0; }

  /* ---------- Reto ----------
     loop:  c = { kind: 'loop', B (mT), shape: 'sq' | 'circ', L (cm, lado o radio), th (° entre B y la normal), diam: bool }
     gauss: c = { kind: 'gauss', a, b (µWb): por una cara entra a, por otra sale b } → flujo por el resto */
  function area(c) { var L = c.L / 100; return c.shape === 'circ' ? Math.PI * Math.pow(c.diam ? L / 2 : L, 2) : L * L; }
  function truth(c) {
    if (c.kind === 'gauss') return c.a - c.b;
    return flux(c.B / 1000, area(c), c.th) * 1e6;
  }
  function mistakes(c) {
    if (c.kind === 'gauss') return { sign: c.b - c.a, zero: 0 };
    var o = { sin: c.B / 1000 * area(c) * Math.sin(c.th * RAD) * 1e6, cm2: truth(c) * 1e4 };
    if (c.shape === 'circ' && c.diam) o.diam = flux(c.B / 1000, Math.PI * Math.pow(c.L / 100, 2), c.th) * 1e6;
    return o;
  }
  function diagnose(c, s, tol) {
    tol = tol || 0.03;
    if (!isFinite(s)) return 'bad';
    var t = truth(c), m = mistakes(c);
    var close = function (a, b) { return Math.abs(a - b) <= tol * Math.abs(b) + (b === 0 ? 1e-9 : 0); };
    if (close(s, t)) return 'ok';
    var keys = c.kind === 'gauss' ? ['sign', 'zero'] : ['sin', 'cm2', 'diam'];
    for (var i = 0; i < keys.length; i++) { var w = m[keys[i]]; if (w != null && !close(w, t) && close(s, w)) return keys[i]; }
    return 'bad';
  }

  // Unidades de clase: B en mT, áreas en cm², largos en cm; flujo en µWb.
  function fluxUWb(BmT, Acm2, thetaDeg) { return flux(BmT / 1000, Acm2 / 1e4, thetaDeg) * 1e6; }
  function wireRectUWb(I, a, b, h) { return wireRect(I, a / 100, b / 100, h / 100) * 1e6; }
  // Solenoide largo lleno de un material de permeabilidad relativa Km: B = Km μ₀ (N/L) I, en mT.
  function coremT(Km, N, L, I) { return Km * MU0 * N / (L / 100) * I * 1000; }

  window.LabMath.mflux = {
    fluxUWb: fluxUWb, wireRectUWb: wireRectUWb, coremT: coremT,
    MU0: MU0, flux: flux, loopGrid: loopGrid, linear: linear, wireRect: wireRect, sphere: sphere, poleFlux: poleFlux,
    area: area, truth: truth, mistakes: mistakes, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var VW = 640, VH = 400, PXCM = 24, OX = 320, OY = 200;
  var BOX = [-12.5, -7.5, 12.5, 7.5];
  function X(x) { return OX + PXCM * x; }
  function Y(y) { return OY - PXCM * y; }
  function fnum(v) { return String(v).replace('-', '−'); }
  var GPRE = [
    { name: 'Un imán adentro de la esfera', m: [{ x: 0, y: 0, ang: 0, s: 2 }], S: [0, 0, 6] },
    { name: 'La esfera corta el imán (solo el polo N adentro)', m: [{ x: -2, y: 0, ang: 0, s: 2 }], S: [2.5, 0, 3] },
    { name: 'Dos imanes, uno adentro y uno afuera', m: [{ x: -4, y: 0, ang: 90, s: 2 }, { x: 7, y: 2, ang: 0, s: 2 }], S: [-4, 0, 5] }
  ];
  var MSG = {
    ok: ['Tu respuesta coincide', 'Correcto.'],
    sin: ['Usaste sen θ', 'En Φ = BA cos θ, θ se mide entre B y la NORMAL de la espira. Si te dan el ángulo con el plano, la normal está a 90° − ese ángulo.'],
    cm2: ['Dejaste el área en cm²', '1 cm² = 10⁻⁴ m². Con B en T y A en m², Φ sale en Wb.'],
    diam: ['Usaste el diámetro como radio', 'A = πr² con r = d/2.'],
    sign: ['El signo está al revés', 'El flujo neto por una superficie cerrada es cero: lo que falta tiene que compensar lo que ya entró y salió.'],
    zero: ['Cero es el flujo NETO, no el de esas caras', 'Por las caras restantes pasa justo lo necesario para que la suma de todas dé cero.'],
    bad: ['Tu respuesta no coincide', 'Espira: Φ = BA cos θ en T·m². Superficie cerrada: la suma de todos los flujos es cero.']
  };

  window.Labs['magnetic-flux'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, M = window.LabMath.magnet, ready = Promise.resolve();
    // El modo Gauss usa el modelo de imanes de S01; si la página no lo trae, se carga aquí.
    if (!M) {
      var tag = document.querySelector('script[src*="labs/magnetic-flux.js"]');
      ready = UI.loadScript(tag ? tag.getAttribute('src').replace('magnetic-flux.js', 'magnetic-field-map.js') : '../../../shared/js/labs/magnetic-field-map.js').then(function () { M = window.LabMath.magnet; });
    }
    var mode = 'loop', lp = { B: 50, L: 10, th: 30 }, magnets = [], Sp = { x: 0, y: 0, R: 6 }, drag = null, raf = 0, chal = null, grab = null;

    var mSel = UI.select({ label: 'Modo', options: ['Espira en un campo uniforme', 'Superficie cerrada (ley de Gauss)'] });
    var sB = UI.slider({ label: 'Campo B', min: 5, max: 200, step: 5, value: lp.B, unit: 'mT' }, function (v) { lp.B = v; draw(); });
    var sL = UI.slider({ label: 'Lado de la espira', min: 2, max: 20, step: 1, value: lp.L, unit: 'cm' }, function (v) { lp.L = v; draw(); });
    var sT = UI.slider({ label: 'Ángulo θ entre B y la normal', min: 0, max: 180, step: 5, value: lp.th, unit: '°' }, function (v) { lp.th = v; draw(); });
    var gSel = UI.select({ label: 'Configuración', options: GPRE.map(function (p) { return p.name; }) });
    var sR = UI.slider({ label: 'Radio de la esfera', min: 1, max: 7, step: 0.5, value: Sp.R, unit: 'cm' }, function (v) { Sp.R = v; draw(); });
    var note = h('p', { class: 'lab-note', role: 'status' });

    var chalText = h('p', { class: 'lab-note' });
    var ans = UI.input({ label: 'Tu Φ (µWb)', type: 'text', inputmode: 'decimal', mono: false, hint: 'Notación científica: <code>2.5e2</code> o <code>2.5×10^2</code>.' });
    var bCheck = UI.button('Comprobar', 'primary', check);
    var bNew = UI.button('Otro reto', 'ghost', function () { newChallenge(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var svg = UI.svg(VW, VH, 'Espira en un campo magnético uniforme.');
    svg.classList.add('lab-stage--drag');
    svg.setAttribute('tabindex', '0');
    var hint = h('p', { class: 'lab-note' }, ['Arrastra la esfera (o usa las flechas). Es una esfera en 3D; ves su corte con el plano de los imanes.']);
    var legend = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--ref' }), 'líneas de B']),
      h('li', {}, [h('i', { class: 'sw sw--error' }), 'normal n̂ · flujo que sale']),
      h('li', {}, [h('i', { class: 'sw sw--aux' }), 'flujo que entra'])
    ]);
    var facts = h('dl', { class: 'lab-facts' });
    var loopBox = h('div', { class: 'lab-stack' }, [sB.node, sL.node, sT.node]);
    var gaussBox = h('div', { class: 'lab-stack' }, [gSel.node, sR.node]);

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        mSel.node, loopBox, gaussBox, note,
        h('p', { class: 'lab-field__label' }, ['Reto']), chalText, ans.node,
        h('div', { class: 'lab-buttons' }, [bCheck, bNew]), verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Flujo magnético']),
        svg, hint, legend, facts
      ])
    ]));
    // Sin mayúsculas en las etiquetas de los campos: µ se volvía Μ (y mT, MT); θ y φ, Θ y Φ.
    mount.querySelectorAll('label.lab-field__label').forEach(function (l) { l.style.textTransform = 'none'; l.style.letterSpacing = '0'; });
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    ans.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    mSel.input.addEventListener('change', function () { setMode(mSel.input.value === '0' ? 'loop' : 'gauss'); chal = null; verdict.hidden = true; chalText.textContent = ''; draw(); });
    gSel.input.addEventListener('change', function () { loadG(+gSel.input.value); draw(); });

    function parse(s) { return window.CBExercises ? window.CBExercises.parseNumber(s) : parseFloat(String(s).replace(/−/g, '-')); }
    function show(node, on) { node.hidden = !on; node.style.display = on ? '' : 'none'; }
    function setMode(m) { mode = m; mSel.input.value = m === 'loop' ? '0' : '1'; show(loopBox, m === 'loop'); show(gaussBox, m === 'gauss'); show(hint, m === 'gauss'); }
    function loadG(i) { var p = GPRE[i] || GPRE[0]; magnets = p.m.map(function (m) { return { x: m.x, y: m.y, ang: m.ang, s: m.s }; }); Sp = { x: p.S[0], y: p.S[1], R: p.S[2] }; sR.set(Sp.R); gSel.input.value = String(i); }

    function toWorld(ev) {
      var m = svg.getScreenCTM();
      if (!m) return null;
      var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      var q = pt.matrixTransform(m.inverse());
      return { x: (q.x - OX) / PXCM, y: (OY - q.y) / PXCM };
    }
    function snap(v) { return Math.round(v * 2) / 2; }
    svg.addEventListener('pointerdown', function (ev) {
      if (mode !== 'gauss') return;
      var w = toWorld(ev); if (!w) return;
      if (Math.hypot(w.x - Sp.x, w.y - Sp.y) > Sp.R + 0.8) return;
      drag = true; grab = { dx: Sp.x - w.x, dy: Sp.y - w.y };
      try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* sin captura */ }
      ev.preventDefault();
    });
    svg.addEventListener('pointermove', function (ev) {
      if (!drag) return;
      var w = toWorld(ev); if (!w) return;
      Sp.x = Math.max(BOX[0], Math.min(BOX[2], snap(w.x + grab.dx))); Sp.y = Math.max(BOX[1], Math.min(BOX[3], snap(w.y + grab.dy)));
      if (!raf) raf = (window.requestAnimationFrame || function (f) { return setTimeout(f, 16); })(function () { raf = 0; draw(); });
    });
    function endDrag() { if (!drag) return; drag = false; draw(); }
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
    svg.addEventListener('keydown', function (ev) {
      if (mode !== 'gauss') return;
      var d = { ArrowLeft: [-0.5, 0], ArrowRight: [0.5, 0], ArrowUp: [0, 0.5], ArrowDown: [0, -0.5] }[ev.key];
      if (!d) return;
      ev.preventDefault(); Sp.x += d[0]; Sp.y += d[1]; draw();
    });

    function el(tag, attrs, text) {
      if (!UI.svgOk(attrs)) return null;
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (text != null) n.textContent = text;
      svg.querySelector('g.sketch').appendChild(n);
      return n;
    }
    function line(cls, x1, y1, x2, y2, w, dash) { el('path', { 'class': cls, fill: 'none', 'stroke-width': w || 2, 'stroke-linecap': 'round', 'stroke-dasharray': dash || null, d: 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) }); }
    function arrowPx(cls, x, y, dx, dy, w, op) {
      var L = Math.hypot(dx, dy);
      if (!(L > 3)) return;
      var ux = dx / L, uy = dy / L, hh = Math.min(10, L * 0.45), ex = x + dx, ey = y + dy;
      el('path', { 'class': cls, fill: 'none', 'stroke-width': w || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: op == null ? null : op,
        d: 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
          'M' + (ex - ux * hh - uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh + ux * hh * 0.6).toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
          'L' + (ex - ux * hh + uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh - ux * hh * 0.6).toFixed(1) });
    }
    function txt(x, y, s, anchor, fs) { el('text', { x: x.toFixed(1), y: y.toFixed(1), 'class': 'ann', 'text-anchor': anchor || 'middle', 'font-size': fs || 16 }, s); }
    function n3(v) { return isFinite(v) ? fnum(Number(v.toPrecision(3))) : '—'; }

    function draw() {
      svg.innerHTML = '';
      svg.appendChild(document.createElementNS(NS, 'g')).setAttribute('class', 'sketch');
      if (mode === 'gauss') return drawGauss();
      // Vista 3D sencilla: x a la derecha, y hacia el fondo (oblicua), z hacia arriba. B apunta a +z.
      var cx = 300, cy = 185, s = 11, az = -0.55;
      var P = function (p) { return [cx + s * (p[0] + p[1] * Math.cos(az) * 0.55), cy - s * (p[2] + p[1] * Math.sin(-az) * 0.55)]; };
      for (var gx = -12; gx <= 12; gx += 4) for (var gy = -8; gy <= 8; gy += 8) {
        var a0 = P([gx, gy, -14]), a1 = P([gx, gy, 14]);
        arrowPx('ref', a0[0], a0[1], a1[0] - a0[0], a1[1] - a0[1], 1.4, 0.55);
      }
      var half = lp.L / 2, t = lp.th * RAD, ct = Math.cos(t), st = Math.sin(t);
      // La espira gira alrededor del eje y; su normal es (sin θ, 0, cos θ).
      var corner = function (u, v) { return P([u * ct, v, -u * st]); };
      var c = [corner(-half, -half), corner(half, -half), corner(half, half), corner(-half, half)];
      el('path', { 'class': 'box-trace', d: 'M' + c.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L') + 'Z' });
      // Sombra: área perpendicular a B (proyección en el plano xy).
      var sh = [P([-half * ct, -half, -14]), P([half * ct, -half, -14]), P([half * ct, half, -14]), P([-half * ct, half, -14])];
      el('path', { 'class': 'box-aux', opacity: 0.6, d: 'M' + sh.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L') + 'Z' });
      var o = P([0, 0, 0]), nEnd = P([st * 9, 0, ct * 9]);
      arrowPx('error', o[0], o[1], nEnd[0] - o[0], nEnd[1] - o[1], 3.2);
      txt(nEnd[0] + 10, nEnd[1], 'n̂', 'start', 18);
      var bTop = P([11, -8, 14]);
      txt(bTop[0] + 8, bTop[1] + 4, 'B', 'start', 18);
      txt(P([0, 0, -14])[0], P([0, 0, -14])[1] + 34, 'sombra: A cos θ', 'middle', 15);
      var A = lp.L * lp.L * 1e-4, Phi = flux(lp.B / 1000, A, lp.th), grid = loopGrid([0, 0, lp.B / 1000], lp.L / 100, lp.L / 100, lp.th, 20);
      facts.innerHTML = '';
      [['A', n3(lp.L * lp.L) + ' cm² = ' + n3(A) + ' m²'], ['A⊥ = A cos θ', n3(A * Math.cos(t) * 1e4) + ' cm²'], ['Φ = BA cos θ', n3(Phi * 1e6) + ' µWb'], ['suma de B·n̂ dA (malla)', n3(grid * 1e6) + ' µWb']]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
      svg.setAttribute('aria-label', 'Espira cuadrada de ' + lp.L + ' cm inclinada ' + lp.th + ' grados respecto al campo; el flujo es ' + n3(Phi * 1e6) + ' microweber.');
    }
    function drawGauss() {
      if (!M) { txt(320, 200, 'Cargando el modelo de imanes…', 'middle', 18); facts.innerHTML = ''; return; }
      el('rect', { x: X(BOX[0]), y: Y(BOX[3]), width: PXCM * (BOX[2] - BOX[0]), height: PXCM * (BOX[3] - BOX[1]), fill: 'none', 'class': 'axis', 'stroke-width': 1.2 });
      M.lines(magnets, 10, { box: BOX }).forEach(function (ln) {
        var d = ln.pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join('');
        el('path', { 'class': 'ref', fill: 'none', 'stroke-width': 1.6, opacity: 0.7, d: d });
      });
      magnets.forEach(function (m) {
        var hh = M.H * PXCM, w = 13;
        var g = document.createElementNS(NS, 'g');
        g.setAttribute('transform', 'translate(' + X(m.x).toFixed(1) + ' ' + Y(m.y).toFixed(1) + ') rotate(' + (-m.ang) + ')');
        svg.querySelector('g.sketch').appendChild(g);
        [[0, 'box-err'], [-hh, 'box-aux']].forEach(function (r) { var n = document.createElementNS(NS, 'rect'); n.setAttribute('x', r[0]); n.setAttribute('y', -w); n.setAttribute('width', hh); n.setAttribute('height', 2 * w); n.setAttribute('class', r[1]); g.appendChild(n); });
        var p = M.poles(m), lx = (p.N.x - p.S.x) / 4, ly = (p.N.y - p.S.y) / 4;
        txt(X(m.x + lx), Y(m.y + ly) + 6, 'N', 'middle', 17); txt(X(m.x - lx), Y(m.y - ly) + 6, 'S', 'middle', 17);
      });
      // Corte de la esfera: cada tramo coloreado según si el campo sale (rojo) o entra (azul).
      var n = 120;
      for (var i = 0; i < n; i++) {
        var a0 = 2 * Math.PI * i / n, a1 = 2 * Math.PI * (i + 1) / n, am = (a0 + a1) / 2;
        var px = Sp.x + Sp.R * Math.cos(am), py = Sp.y + Sp.R * Math.sin(am), f = M.field(magnets, px, py);
        var bn = f.x * Math.cos(am) + f.y * Math.sin(am);
        line(bn >= 0 ? 'error' : 'aux', X(Sp.x + Sp.R * Math.cos(a0)), Y(Sp.y + Sp.R * Math.sin(a0)), X(Sp.x + Sp.R * Math.cos(a1)), Y(Sp.y + Sp.R * Math.sin(a1)), 4);
      }
      var r = sphere(magnets, Sp.x, Sp.y, Sp.R, 60, 120), k = 0.1;          // mT·cm² → µWb
      facts.innerHTML = '';
      [['flujo que sale (de afuera)', n3(r.out * k) + ' µWb'], ['flujo que entra (de afuera)', n3(r['in'] * k) + ' µWb'],
       ['flujo por dentro de un imán cortado', n3(r.inner * k) + ' µWb'], ['Φ neto', n3(Math.abs(r.net * k) < 0.05 ? 0 : r.net * k) + ' µWb']]
        .forEach(function (rw) { facts.appendChild(h('dt', {}, [rw[0]])); facts.appendChild(h('dd', {}, [rw[1]])); });
      svg.setAttribute('aria-label', 'Imanes con sus líneas de campo y una esfera cerrada. Sale ' + n3(r.out * k) + ' microweber y entra ' + n3(-r['in'] * k - r.inner * k) + ': el flujo neto es cero.');
    }

    function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
    function newChallenge(fixed) {
      var c = fixed;
      if (!c) {
        if (mode === 'gauss') { var a = rnd([20, 30, 40, 50, 60]); c = { kind: 'gauss', a: a, b: a + rnd([-15, -10, 10, 20, 25]) }; }
        else c = rnd([{ kind: 'loop', B: rnd([20, 40, 50, 80, 120]), shape: 'sq', L: rnd([4, 5, 8, 10, 12]), th: rnd([0, 30, 45, 60]) },
          { kind: 'loop', B: rnd([20, 40, 50, 80]), shape: 'circ', L: rnd([4, 6, 8, 10]), th: rnd([20, 30, 60]), diam: rnd([true, false]) }]);
      }
      chal = c; verdict.hidden = true;
      if (c.kind === 'gauss') {
        setMode('gauss'); loadG(0);
        chalText.textContent = 'Una caja cerrada está en una región con campo magnético. Por su cara izquierda ENTRAN ' + c.a + ' µWb y por su cara derecha SALEN ' + c.b + ' µWb. ¿Cuánto flujo NETO sale por las otras cuatro caras juntas? En µWb (negativo si entra).';
        ans.node.querySelector('label').textContent = 'Tu flujo por las otras caras (µWb)';
      } else {
        setMode('loop');
        lp = { B: c.B, L: c.shape === 'sq' ? c.L : Math.round(Math.sqrt(area(c)) * 100), th: c.th }; sB.set(lp.B); sL.set(lp.L); sT.set(lp.th);
        var shape = c.shape === 'sq' ? 'cuadrada de lado ' + c.L + ' cm' : 'circular de ' + (c.diam ? 'diámetro ' : 'radio ') + c.L + ' cm';
        chalText.textContent = 'Una espira ' + shape + ' está en un campo uniforme de ' + c.B + ' mT. La normal de la espira forma ' + c.th + '° con el campo. ¿Cuánto vale el flujo? En µWb.';
        ans.node.querySelector('label').textContent = 'Tu Φ (µWb)';
      }
      ans.input.value = '';
      draw();
    }
    function check() {
      if (!chal) { UI.verdict(verdict, 'bad', 'Primero pide un reto', 'Presiona «Otro reto».'); return; }
      var a = parse(ans.input.value);
      if (!isFinite(a)) { UI.verdict(verdict, 'bad', MSG.bad[0], 'Escribe un número.'); return; }
      var key = diagnose(chal, a), t = truth(chal), msg = MSG[key] || MSG.bad;
      UI.verdict(verdict, key === 'ok' ? 'ok' : key === 'bad' ? 'bad' : 'warn', msg[0], msg[1] + ' Valor real: ' + n3(t) + ' µWb.');
    }

    // Ejemplo cargado: un compañero midió el ángulo desde el plano y usó sen θ.
    loadG(0);
    setMode('loop');
    newChallenge({ kind: 'loop', B: 50, shape: 'sq', L: 10, th: 30 });
    ans.input.value = String(Number(mistakes(chal).sin.toPrecision(3)));
    note.textContent = 'Ejemplo cargado: así respondió un compañero el reto. ¿Ves su error? Presiona Comprobar, o cambia al modo de Gauss.';
    check();
    return ready.then(function () { if (mode === 'gauss') draw(); });
  };
})();
