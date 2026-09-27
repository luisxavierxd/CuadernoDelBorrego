/* =====================================================================
   Lab spring-friction (§8.3): fricción con una fuerza inclinada y resorte.
   Una caja de masa m sobre el piso recibe una fuerza F con ángulo θ:
     jalar hacia arriba:  N = mg − F sin θ
     empujar hacia abajo: N = mg + F sin θ
   Opcionalmente un resorte comprimido x la empuja con kx (ley de Hooke).
   Se mueve si F cos θ + kx > μₛN; entonces f = μₖN y a = (F cos θ + kx − μₖN)/m.
   El lab dibuja el DCL en vivo y la gráfica de la fricción contra la fuerza
   horizontal. Detecta si el alumno usó N = mg con ángulo o μₛ al deslizar.
   ===================================================================== */
(function () {
  var G = 9.81, RAD = Math.PI / 180, DEG = 180 / Math.PI;

  /* ------------------------- Matemática pura ------------------------- */
  function normal(m, F, th, mode) {
    var s = (F || 0) * Math.sin((th || 0) * RAD);
    return m * G + (mode === 'push' ? s : mode === 'pull' ? -s : 0);
  }
  // p: { m, F, th, mode: 'pull'|'push'|'horizontal', mus, muk, k?, x? }
  function analyze(p) {
    var N = normal(p.m, p.F, p.th, p.mode), drive = (p.F || 0) * Math.cos((p.th || 0) * RAD) + (p.k || 0) * (p.x || 0);
    var fsMax = p.mus * N, moves = N > 0 && drive > fsMax;
    var f = moves ? p.muk * N : drive;
    return { N: N, drive: drive, fsMax: fsMax, moves: moves, f: f, a: moves ? (drive - p.muk * N) / p.m : 0, liftsOff: N <= 0 };
  }
  // Fuerza para arrancar la caja con ángulo θ (jalando o empujando).
  function forceToStart(m, mus, th, mode) {
    var c = Math.cos(th * RAD), s = Math.sin(th * RAD);
    return mus * m * G / (mode === 'push' ? c - mus * s : c + mus * s);
  }
  // Jalando: el ángulo que minimiza la fuerza es arctan μ y la fuerza mínima μmg/√(1 + μ²).
  function optimalAngle(mu) { return Math.atan(mu) * DEG; }
  function minForce(m, mu) { return mu * m * G / Math.sqrt(1 + mu * mu); }
  function hooke(k, x) { return k * x; }
  // Resortes combinados: en serie las elongaciones se suman; en paralelo las fuerzas.
  function series(k1, k2) { return k1 * k2 / (k1 + k2); }
  function parallel(k1, k2) { return k1 + k2; }
  // Masa colgada de uno o dos resortes: config 'single' | 'series' | 'parallel'.
  function hang(m, k1, k2, config) {
    var k = config === 'series' ? series(k1, k2) : config === 'parallel' ? parallel(k1, k2) : k1;
    return { k: k, x: m * G / k, F: m * G };
  }
  function diagnoseHang(m, k1, k2, config, sx) {
    if (!isFinite(sx)) return 'bad';
    var real = hang(m, k1, k2, config).x;
    if (close(sx, real)) return 'ok';
    var alt = {
      noG: m / hang(m, k1, k2, config).k,
      single: config === 'single' ? NaN : m * G / k1,
      swapped: config === 'series' ? hang(m, k1, k2, 'parallel').x : config === 'parallel' ? hang(m, k1, k2, 'series').x : NaN
    };
    var hit = 'bad';
    Object.keys(alt).some(function (key) { if (isFinite(alt[key]) && close(sx, alt[key]) && !close(alt[key], real)) { hit = key; return true; } return false; });
    return hit;
  }
  function close(a, b, tol) { return Math.abs(a - b) <= (tol || 0.01) * Math.max(Math.abs(b), 0.05); }
  function diagnose(p, sN, sa) {
    var r = analyze(p), out = { N: 'bad', a: 'bad' }, mg = p.m * G;
    if (isFinite(sN)) {
      if (close(sN, r.N)) out.N = 'ok';
      else if (close(sN, mg) && !close(mg, r.N)) out.N = 'usedMg';
      else if (close(sN, 2 * mg - r.N) && !close(2 * mg - r.N, r.N)) out.N = 'wrongSign';
    }
    if (isFinite(sa)) {
      var withMg = Math.max(0, (r.drive - p.muk * mg) / p.m), withMus = Math.max(0, (r.drive - p.mus * r.N) / p.m);
      if (close(sa, r.a) || (Math.abs(r.a) < 1e-9 && Math.abs(sa) < 0.01)) out.a = 'ok';
      else if (r.moves && close(sa, withMg) && !close(withMg, r.a)) out.a = 'usedMg';
      else if (r.moves && close(sa, withMus) && !close(withMus, r.a)) out.a = 'usedMuS';
      else if (!r.moves && sa > 0) out.a = 'shouldRest';
    }
    return out;
  }
  window.LabMath.friction = { G: G, normal: normal, analyze: analyze, forceToStart: forceToStart, optimalAngle: optimalAngle, minForce: minForce, hooke: hooke, series: series, parallel: parallel, hang: hang, diagnoseHang: diagnoseHang, diagnose: diagnose };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var MSG_N = {
    ok: 'Tu normal coincide.',
    usedMg: 'Usaste N = mg, pero la fuerza está inclinada: su componente vertical cambia la normal (N = mg ± F sin θ).',
    wrongSign: 'El signo de F sin θ está al revés: al empujar hacia abajo la normal crece; al jalar hacia arriba disminuye.',
    bad: 'Tu normal no coincide: suma las fuerzas verticales, que dan cero.'
  };
  var MSG_A = {
    ok: 'Tu aceleración coincide.',
    usedMg: 'Calculaste la fricción con N = mg; usa la normal real.',
    usedMuS: 'Usaste μₛ; cuando la caja ya desliza, la fricción es cinética: μₖN.',
    shouldRest: 'La caja no se mueve: F cos θ (más el resorte) no supera la fricción estática máxima μₛN, así que a = 0.',
    bad: 'Tu aceleración no coincide: a = (F cos θ + kx − μₖN)/m si se mueve, y 0 si no.'
  };

  window.Labs['spring-friction'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var s = cfg.start || { m: 10, F: 80, th: 30, mode: 'push', mus: 0.4, muk: 0.3, spring: false, k: 200, x: 0.2 };
    var mode = UI.select({ label: 'La fuerza F…', options: ['empuja hacia abajo con ángulo θ', 'jala hacia arriba con ángulo θ'] });
    var mS = UI.slider({ label: 'Masa m', min: 1, max: 30, step: 1, value: s.m, unit: 'kg' }, refresh);
    var fS = UI.slider({ label: 'Fuerza F', min: 0, max: 200, step: 5, value: s.F, unit: 'N' }, refresh);
    var tS = UI.slider({ label: 'Ángulo θ', min: 0, max: 70, step: 5, value: s.th, unit: '°' }, refresh);
    var sS = UI.slider({ label: 'Fricción estática μₛ', min: 0.1, max: 1, step: 0.05, value: s.mus, fmt: function (v) { return v.toFixed(2); } }, refresh);
    var kS = UI.slider({ label: 'Fricción cinética μₖ', min: 0.05, max: 1, step: 0.05, value: s.muk, fmt: function (v) { return v.toFixed(2); } }, refresh);
    var springCb = h('input', { type: 'checkbox', id: UI.id('sp') });
    var springRow = h('label', { class: 'fbd-row__name', for: springCb.id }, [springCb, ' Agregar un resorte comprimido que empuja la caja']);
    var kk = UI.slider({ label: 'Constante del resorte k', min: 50, max: 800, step: 50, value: s.k, unit: 'N/m' }, refresh);
    var xx = UI.slider({ label: 'Compresión x', min: 0.05, max: 0.5, step: 0.05, value: s.x, unit: 'm', fmt: function (v) { return v.toFixed(2); } }, refresh);
    var nIn = UI.input({ label: 'Tu N (N)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var aIn = UI.input({ label: 'Tu a (m/s²)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(640, 300, 'Diagrama de cuerpo libre de la caja con la fuerza inclinada');
    var svgF = UI.svg(640, 240, 'Fricción contra la fuerza horizontal aplicada');
    var checked = false;

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        mode.node, mS.node, fS.node, tS.node, sS.node, kS.node, springRow, kk.node, xx.node,
        h('div', { class: 'lab-row' }, [nIn.node, aIn.node]), h('div', { class: 'lab-buttons' }, [run]), note, verdict, facts
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Mueve θ y mira cómo cambian N y la fricción']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'F']), h('li', {}, [h('i', { class: 'sw sw--error' }), 'peso']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'normal']), h('li', {}, [h('i', { class: 'sw sw--trace' }), 'fricción'])
        ]),
        svgF
      ])
    ]));
    var panelF = mount.lastChild;
    var labMode = UI.select({ label: '¿Qué quieres explorar?', options: ['Fricción con fuerza inclinada', 'Resorte colgado (uno, en serie o en paralelo)'] });
    labMode.node.classList.add('lab-mode');
    mount.insertBefore(labMode.node, panelF);
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    mode.input.value = s.mode === 'pull' ? '1' : '0';
    springCb.checked = !!s.spring;
    mode.input.addEventListener('change', refresh);
    springCb.addEventListener('change', function () { syncSpring(); refresh(); });
    function syncSpring() { kk.node.hidden = xx.node.hidden = !springCb.checked; }
    function params() {
      var muk = Math.min(kS.get(), sS.get());
      return { m: mS.get(), F: fS.get(), th: tS.get(), mode: mode.input.value === '1' ? 'pull' : 'push', mus: sS.get(), muk: muk, k: springCb.checked ? kk.get() : 0, x: springCb.checked ? xx.get() : 0 };
    }
    function refresh() { if (checked) check(); else draw(); }

    function el(name, attrs, parent, parentSvg) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      (parent || parentSvg || svg).appendChild(n);
      return n;
    }
    function vec(g, x, y, ang, len, cls, label) {
      if (len < 4) return;
      var a = ang * RAD, ux = Math.cos(a), uy = -Math.sin(a), ex = x + len * ux, ey = y + len * uy, k = 11;
      el('path', { d: 'M' + x + ' ' + y + 'L' + ex + ' ' + ey + 'M' + (ex - k * ux - k * 0.55 * uy) + ' ' + (ey - k * uy + k * 0.55 * ux) + 'L' + ex + ' ' + ey + 'L' + (ex - k * ux + k * 0.55 * uy) + ' ' + (ey - k * uy - k * 0.55 * ux), 'class': cls, fill: 'none', 'stroke-width': 3.2, 'stroke-linecap': 'round' }, g);
      el('text', { x: ex + 16 * ux, y: ey + 16 * uy + 5, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 15 }, g).textContent = label;
    }

    function draw() {
      var p = params(), r = analyze(p), mg = p.m * G, big = Math.max(mg, r.N, p.F, 1), K = 95 / big;
      svg.innerHTML = '';
      var g = el('g', { 'class': 'sketch' }), cx = 330, cy = 170, fy = 215;
      el('path', { d: 'M40 ' + fy + 'H600', 'class': 'axis', 'stroke-width': 2, fill: 'none' }, g);
      el('rect', { x: cx - 45, y: fy - 90, width: 90, height: 90, rx: 6, 'class': 'box-aux' }, g);
      if (p.k) {
        var d = 'M60 ' + (fy - 45);
        for (var i = 0; i < 10; i++) d += 'L' + (80 + i * 18) + ' ' + (fy - 45 + (i % 2 ? 12 : -12));
        el('path', { d: d + 'L' + (cx - 45) + ' ' + (fy - 45), 'class': 'axis', 'stroke-width': 2, fill: 'none' }, g);
        el('path', { d: 'M55 ' + (fy - 80) + 'V' + (fy - 10), 'class': 'axis', 'stroke-width': 4, fill: 'none' }, g);
      }
      vec(g, cx, cy - 45, 270, mg * K, 'error', 'mg');
      vec(g, cx - 20, fy - 90, 90, Math.max(0, r.N) * K, 'aux', 'N');
      var fa = p.mode === 'pull' ? p.th : 360 - p.th;
      if (p.mode === 'pull') vec(g, cx + 45, fy - 60, fa, p.F * K, 'ref', 'F');
      else vec(g, cx - 45 - p.F * K * Math.cos(p.th * RAD), fy - 90 - p.F * K * Math.sin(p.th * RAD), fa, p.F * K, 'ref', 'F');
      vec(g, cx - 45, fy - 6, 180, r.f * K, 'trace', r.moves ? 'fₖ' : 'fₛ');
      if (p.k) vec(g, cx - 45, fy - 70, 0, p.k * p.x * K, 'ref', 'kx');
      el('text', { x: 600, y: 40, 'class': 'ann', 'text-anchor': 'end', 'font-size': 17 }, g).textContent = r.liftsOff ? 'la caja se despega del piso' : r.moves ? 'se mueve: a = ' + UI.fmt(r.a, 3) + ' m/s²' : 'no se mueve';
      drawGraph(p, r);
      facts.innerHTML = '';
      [['normal N', UI.fmt(r.N, 4) + ' N'], ['fricción estática máx. μₛN', UI.fmt(r.fsMax, 4) + ' N'], ['empuje horizontal F cos θ' + (p.k ? ' + kx' : ''), UI.fmt(r.drive, 4) + ' N'],
        ['fricción', UI.fmt(r.f, 4) + ' N (' + (r.moves ? 'cinética' : 'estática') + ')'], ['aceleración', UI.fmt(r.a, 4) + ' m/s²']]
        .forEach(function (x) { facts.appendChild(h('dt', {}, [x[0]])); facts.appendChild(h('dd', {}, [x[1]])); });
    }

    // Fricción contra empuje horizontal: sube 1 a 1 hasta μₛN y cae a μₖN al arrancar.
    function drawGraph(p, r) {
      var N = Math.max(r.N, 0), top = Math.max(r.fsMax, r.drive, 1) * 1.35;
      var plot = window.LabPlot(svgF, { x: [0, top], y: [0, Math.max(r.fsMax, 1) * 1.3] });
      plot.clear(); plot.grid(); plot.axes();
      plot.curve(function (H) { return H <= r.fsMax ? H : p.muk * N; }, 'trace', 3);
      plot.point(r.drive, r.f, 'dot-ref', 7);
      plot.label(0, plot.yr[1], 'fricción (N) contra empuje horizontal (N)', 'start', 14, 8, 14);
      plot.label(r.fsMax, r.fsMax, 'μₛN', 'middle', 14, 0, -10);
    }

    function check() {
      var p = params(), r = diagnose(p, parseFloat(nIn.input.value), parseFloat(aIn.input.value));
      var kind = r.N === 'ok' && r.a === 'ok' ? 'ok' : (r.N !== 'bad' || r.a !== 'bad') ? 'warn' : 'bad';
      UI.verdict(verdict, kind, kind === 'ok' ? 'Tu N y tu a coinciden' : kind === 'warn' ? 'Vas cerca' : 'No coinciden', MSG_N[r.N] + ' ' + MSG_A[r.a]);
      checked = true;
      draw();
    }

    // Ejemplo cargado: un compañero usó N = mg aunque empuja con ángulo.
    syncSpring();
    (function () { var p = params(), mg = p.m * G, rr = analyze(p); nIn.input.value = UI.fmt(mg, 4); aIn.input.value = UI.fmt(Math.max(0, (rr.drive - p.muk * mg) / p.m), 4); })();
    note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Ves el error? Mueve θ, cambia a "jala" y agrega el resorte.';
    check();
    document.addEventListener('cb:themechange', draw);

    /* ---------------- Modo resorte colgado ---------------- */
    var MSG_H = {
      ok: ['Tu estiramiento coincide', ''],
      noG: ['Usaste la masa en lugar del peso', 'La fuerza sobre el resorte es el peso, mg, en newtons: x = mg/k.'],
      single: ['Usaste un solo resorte', 'Con dos resortes cambia la constante equivalente: en serie es menor que cada una; en paralelo es la suma.'],
      swapped: ['Confundiste serie con paralelo', 'En serie (uno abajo del otro) cada resorte carga todo el peso y las elongaciones se suman. En paralelo (lado a lado) se reparten el peso.'],
      bad: ['Tu estiramiento no coincide', 'Encuentra la k equivalente y usa x = mg/k.']
    };
    var hm = UI.slider({ label: 'Masa colgada m', min: 0.1, max: 5, step: 0.1, value: 1, unit: 'kg', fmt: function (v) { return v.toFixed(1); } }, hRefresh);
    var hk1 = UI.slider({ label: 'Constante k₁', min: 20, max: 500, step: 10, value: 200, unit: 'N/m' }, hRefresh);
    var hk2 = UI.slider({ label: 'Constante k₂', min: 20, max: 500, step: 10, value: 300, unit: 'N/m' }, hRefresh);
    var hc = UI.select({ label: 'Arreglo', options: ['Un resorte (k₁)', 'Dos en serie (uno abajo del otro)', 'Dos en paralelo (lado a lado)'] });
    var hx = UI.input({ label: 'Tu estiramiento total x (m)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var hrun = UI.button('Comprobar', 'primary', hCheck);
    var hnote = h('p', { class: 'lab-note' });
    var hverdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var hfacts = h('dl', { class: 'lab-facts' });
    var hsvg = UI.svg(640, 380, 'Masa colgada de uno o dos resortes, con su estiramiento');
    var hplot = UI.svg(640, 220, 'Fuerza contra estiramiento del arreglo de resortes');
    var hChecked = false;
    var panelS = h('div', { class: 'lab-grid', hidden: true }, [
      h('form', { class: 'lab-controls', novalidate: true }, [hc.node, hm.node, hk1.node, hk2.node, hx.node, h('div', { class: 'lab-buttons' }, [hrun]), hnote, hverdict, hfacts]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['¿Cuánto se estira?']),
        hsvg, hplot
      ])
    ]);
    mount.appendChild(panelS);
    panelS.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); hCheck(); });
    hc.input.value = '1';
    hc.input.addEventListener('change', function () { hk2.node.hidden = hc.input.value === '0'; hRefresh(); });
    function hConfig() { return ['single', 'series', 'parallel'][+hc.input.value]; }
    function hRefresh() { if (hChecked) hCheck(); else hDraw(); }
    labMode.input.addEventListener('change', function () {
      var spring = labMode.input.value === '1';
      panelF.hidden = spring; panelS.hidden = !spring;
      if (spring) hDraw(); else draw();
    });

    function coil(g, x, y0, y1, w, n, cls) {
      var d = 'M' + x + ' ' + y0, step = (y1 - y0) / (n + 1);
      d += 'L' + x + ' ' + (y0 + step / 2);
      for (var i = 0; i < n; i++) d += 'L' + (x + (i % 2 ? -w : w)) + ' ' + (y0 + step / 2 + step * (i + 0.5));
      d += 'L' + x + ' ' + (y1 - step / 2) + 'L' + x + ' ' + y1;
      el('path', { d: d, 'class': cls || 'axis', 'stroke-width': 2, fill: 'none' }, g, hsvg);
    }
    function hDraw() {
      var cfgName = hConfig(), m = hm.get(), k1 = hk1.get(), k2 = hk2.get(), r = hang(m, k1, k2, cfgName);
      hsvg.innerHTML = '';
      var g = el('g', { 'class': 'sketch' }, null, hsvg), top = 30, L0 = 120;
      var stretch = Math.min(170, r.x * 1200);   // estiramiento exagerado para que se vea
      el('path', { d: 'M200 ' + top + 'H440', 'class': 'axis', 'stroke-width': 4, fill: 'none' }, g, hsvg);
      var bottom;
      if (cfgName === 'parallel') {
        coil(g, 290, top, top + L0 + stretch, 12, 10);
        coil(g, 350, top, top + L0 + stretch, 12, 10);
        el('path', { d: 'M280 ' + (top + L0 + stretch) + 'H360', 'class': 'axis', 'stroke-width': 3, fill: 'none' }, g, hsvg);
        bottom = top + L0 + stretch;
      } else if (cfgName === 'series') {
        var s1 = stretch * r.k / k1, s2 = stretch * r.k / k2, mid = top + L0 / 2 + s1;
        coil(g, 320, top, mid, 12, 6);
        el('circle', { cx: 320, cy: mid, r: 5, 'class': 'dot-ref' }, g, hsvg);
        coil(g, 320, mid, mid + L0 / 2 + s2, 12, 6);
        bottom = mid + L0 / 2 + s2;
      } else {
        coil(g, 320, top, top + L0 + stretch, 12, 10);
        bottom = top + L0 + stretch;
      }
      el('rect', { x: 290, y: bottom, width: 60, height: 50, rx: 5, 'class': 'box-aux' }, g, hsvg);
      el('path', { d: 'M180 ' + (top + L0) + 'H460', 'class': 'axis', 'stroke-width': 1.2, 'stroke-dasharray': '5 6', fill: 'none' }, g, hsvg);
      el('text', { x: 175, y: top + L0 + 5, 'class': 'ann', 'text-anchor': 'end', 'font-size': 15 }, g, hsvg).textContent = 'sin carga';
      el('path', { d: 'M470 ' + (top + L0) + 'V' + bottom, 'class': 'ref', 'stroke-width': 2.5, fill: 'none' }, g, hsvg);
      el('text', { x: 480, y: (top + L0 + bottom) / 2 + 5, 'class': 'ann', 'font-size': 16 }, g, hsvg).textContent = 'x = ' + UI.fmt(r.x, 3) + ' m';
      el('text', { x: 320, y: bottom + 30, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 15 }, g, hsvg).textContent = m.toFixed(1) + ' kg';
      el('text', { x: 20, y: 360, 'class': 'ann', 'font-size': 14 }, g, hsvg).textContent = 'estiramiento dibujado a escala exagerada';
      // Recta F = k x del arreglo y el punto de equilibrio (x, mg).
      var xmax = Math.max(r.x * 1.6, 0.05), plot = window.LabPlot(hplot, { x: [0, xmax], y: [0, r.k * xmax * 1.05] });
      plot.clear(); plot.grid(); plot.axes();
      plot.line(function (x) { return r.k * x; }, 'ref', 3);
      plot.point(r.x, r.F, 'dot-trace', 7);
      plot.label(0, plot.yr[1], 'F (N) contra x (m): pendiente = k equivalente', 'start', 14, 8, 14);
      hfacts.innerHTML = '';
      [['k equivalente', UI.fmt(r.k, 4) + ' N/m'], ['peso mg', UI.fmt(r.F, 4) + ' N'], ['estiramiento total', UI.fmt(r.x, 4) + ' m']]
        .forEach(function (x) { hfacts.appendChild(h('dt', {}, [x[0]])); hfacts.appendChild(h('dd', {}, [x[1]])); });
    }
    function hCheck() {
      var k = diagnoseHang(hm.get(), hk1.get(), hk2.get(), hConfig(), parseFloat(hx.input.value)), msg = MSG_H[k];
      UI.verdict(hverdict, k === 'ok' ? 'ok' : k === 'bad' ? 'bad' : 'warn', msg[0], msg[1]);
      hChecked = true;
      hDraw();
    }
    // Ejemplo cargado: un compañero sumó las constantes en serie (como si fuera paralelo).
    hx.input.value = UI.fmt(hang(hm.get(), hk1.get(), hk2.get(), 'parallel').x, 4);
    hnote.textContent = 'Ejemplo cargado: así respondió un compañero para dos resortes en serie. ¿Ves el error?';
    hCheck();
    if (cfg.mode === 'spring') { labMode.input.value = '1'; panelF.hidden = true; panelS.hidden = false; }
    document.addEventListener('cb:themechange', function () { if (!panelS.hidden) hDraw(); });
    return Promise.resolve();
  };
})();
