/* =====================================================================
   Lab circular-vectors (§8.3): movimiento circular uniforme y relativo.
   Con ω y r se ven girar la velocidad (tangente) y la aceleración
   centrípeta (hacia el centro), a_c = v²/r = ω²r. El mismo movimiento
   se dibuja también desde un marco que avanza con velocidad u en x:
   ahí la trayectoria ya no es un círculo y la velocidad es v − u.
   El alumno da su a_c; errores típicos: dio v = ωr, o dio v/r = ω.
   ===================================================================== */
(function () {
  var TAU = 2 * Math.PI, RAD = Math.PI / 180, DEG = 180 / Math.PI;

  /* ------------------------- Matemática pura ------------------------- */
  // p: { r, y una de omega | rpm | T | f | v } → todas las magnitudes.
  function uniform(p) {
    var r = p.r, w;
    if (p.omega != null) w = p.omega;
    else if (p.rpm != null) w = p.rpm * TAU / 60;
    else if (p.T != null) w = TAU / p.T;
    else if (p.f != null) w = TAU * p.f;
    else if (p.v != null) w = p.v / r;
    var v = w * r;
    return { omega: w, v: v, ac: v * v / r, T: TAU / w, f: w / TAU, rpm: w * 60 / TAU };
  }
  function state(p, t) {
    var u = uniform(p), th = u.omega * t;
    return {
      pos: [p.r * Math.cos(th), p.r * Math.sin(th)],
      vel: [-u.v * Math.sin(th), u.v * Math.cos(th)],
      acc: [-u.ac * Math.cos(th), -u.ac * Math.sin(th)]
    };
  }
  // Circular no uniforme: la rapidez cambia a razón at (tangencial).
  function nonUniform(v, r, at) {
    var ac = v * v / r;
    return { ac: ac, a: Math.hypot(ac, at), angle: Math.atan2(Math.abs(at), ac) * DEG };
  }
  // Visto desde un marco que se mueve con velocidad u (en x): posición y velocidad relativas.
  function inFrame(p, u, t) {
    var s = state(p, t);
    return { pos: [s.pos[0] - u * t, s.pos[1]], vel: [s.vel[0] - u, s.vel[1]] };
  }
  function close(a, b, tol) { return Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-9); }
  function diagnoseAc(p, student, tol) {
    tol = tol || 0.01;
    if (!isFinite(student)) return 'bad';
    var u = uniform(p);
    if (close(student, u.ac, tol)) return 'ok';
    if (close(student, u.v, tol) && !close(u.v, u.ac, tol)) return 'gaveV';
    if (close(student, u.omega, tol) && !close(u.omega, u.ac, tol)) return 'gaveOmega';
    return 'bad';
  }
  window.LabMath.circular = { uniform: uniform, state: state, nonUniform: nonUniform, inFrame: inFrame, diagnoseAc: diagnoseAc };

  // Velocidad relativa: v_A/B = v_A/C + v_C/B (vectores [x, y]).
  function add2(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
  function sub2(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  // Lancha que apunta perpendicular a la orilla: cruza en w/vb y la corriente la arrastra.
  function river(p) {
    var t = p.w / p.vb;
    return { t: t, drift: p.vc * t, speed: Math.hypot(p.vb, p.vc), angle: Math.atan2(p.vc, p.vb) * DEG };
  }
  // Para cruzar en línea recta apunta contra la corriente: sin α = vc / vb.
  function riverStraight(p) {
    if (p.vc >= p.vb) return { alpha: NaN, t: NaN, speed: NaN };
    var s = Math.sqrt(p.vb * p.vb - p.vc * p.vc);
    return { alpha: Math.asin(p.vc / p.vb) * DEG, t: p.w / s, speed: s };
  }
  window.LabMath.relative = { add: add2, sub: sub2, river: river, riverStraight: riverStraight };

  /* ------------------------------ UI ------------------------------ */
  var MSG = {
    ok: ['Tu aceleración centrípeta coincide', 'a_c = v²/r = ω²r, siempre hacia el centro.'],
    gaveV: ['Ese valor es la rapidez v = ωr', 'La aceleración centrípeta es v²/r = ω²r: falta dividir v² entre r (o multiplicar ωr por ω).'],
    gaveOmega: ['Ese valor es v/r = ω', 'Falta el cuadrado: a_c = v²/r, no v/r.'],
    bad: ['Tu aceleración no coincide', 'Calcula v = ωr y luego a_c = v²/r.']
  };

  window.Labs['circular-vectors'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var s = cfg.start || { omega: 2, r: 1.5, u: 3 };
    var wS = UI.slider({ label: 'Rapidez angular ω', min: 0.5, max: 4, step: 0.1, value: s.omega, unit: 'rad/s', fmt: function (v) { return v.toFixed(1); } }, refresh);
    var rS = UI.slider({ label: 'Radio r', min: 0.5, max: 3, step: 0.1, value: s.r, unit: 'm', fmt: function (v) { return v.toFixed(1); } }, refresh);
    var uS = UI.slider({ label: 'Velocidad del segundo marco u (en x)', min: -4, max: 4, step: 0.5, value: s.u, unit: 'm/s' }, draw);
    var thS = UI.slider({ label: 'Ángulo recorrido θ', min: 0, max: 720, step: 1, value: 40, unit: '°' }, function () { stop(); draw(); });
    var play = UI.button('Girar', 'ghost', toggle);
    play.setAttribute('aria-pressed', 'false');
    var aIn = UI.input({ label: 'Tu a_c (m/s²)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svgC = UI.svg(640, 360, 'Partícula en un círculo con su velocidad tangente y su aceleración hacia el centro');
    var svgF = UI.svg(640, 240, 'El mismo movimiento visto desde un marco que se mueve con velocidad u');
    var anim = null, checked = false;

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        wS.node, rS.node, uS.node, thS.node, h('div', { class: 'lab-buttons' }, [play]),
        aIn.node, h('div', { class: 'lab-buttons' }, [run]), note, verdict, facts
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['v tangente, a hacia el centro']),
        svgC,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'velocidad']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'aceleración centrípeta']),
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'trayectoria'])
        ]),
        svgF
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    aIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });

    function params() { return { omega: wS.get(), r: rS.get() }; }
    function refresh() { if (checked) check(); else draw(); }

    function arrowSegs(x0, y0, dx, dy, hl) {
      var L = Math.hypot(dx, dy);
      if (L < 1e-9) return [];
      var ux = dx / L, uy = dy / L, k = Math.min(hl, L * 0.4), x1 = x0 + dx, y1 = y0 + dy;
      return [[[x0, y0], [x1, y1]],
        [[x1, y1], [x1 - k * ux - k * 0.55 * uy, y1 - k * uy + k * 0.55 * ux]],
        [[x1, y1], [x1 - k * ux + k * 0.55 * uy, y1 - k * uy - k * 0.55 * ux]]];
    }

    function draw() {
      var p = params(), U = uniform(p), th = thS.get() * RAD, t = th / U.omega;
      var st = state(p, t);
      // Escala de las flechas (m de dibujo por m/s y por m/s²): visibles, sin cruzar el centro ni salirse.
      var KV = Math.min(0.35, 2.4 / U.v), KA = Math.min(0.15, 0.85 * p.r / U.ac);
      var plot = window.LabPlot(svgC, { x: [-4.6, 4.6], y: [-4.2, 4.2], equal: true });
      plot.clear(); plot.grid(); plot.axes();
      plot.curve(function (x) { return Math.sqrt(Math.max(0, p.r * p.r - x * x)); }, 'ref', 2.5, null, -p.r, p.r);
      plot.curve(function (x) { return -Math.sqrt(Math.max(0, p.r * p.r - x * x)); }, 'ref', 2.5, null, -p.r, p.r);
      plot.segments([[[0, 0], st.pos]], 'axis', 1.4);
      plot.segments(arrowSegs(st.pos[0], st.pos[1], st.vel[0] * KV, st.vel[1] * KV, 0.25), 'aux', 3.5);
      plot.segments(arrowSegs(st.pos[0], st.pos[1], st.acc[0] * KA, st.acc[1] * KA, 0.25), 'error', 3.5);
      plot.point(0, 0, 'dot-ref', 4);
      plot.point(st.pos[0], st.pos[1], 'dot-trace', 8);
      plot.label(st.pos[0] + st.vel[0] * KV, st.pos[1] + st.vel[1] * KV, 'v', 'middle', 18, 10, -6);
      plot.label(st.pos[0] + st.acc[0] * KA, st.pos[1] + st.acc[1] * KA, 'a_c', 'middle', 16, 0, 18);
      plot.label(-4.4, 3.9, 'r = ' + p.r.toFixed(1) + ' m', 'start', 15);

      // Marco que se mueve con u: dos vueltas de trayectoria.
      var u = uS.get(), tMax = Math.max(t, 2 * U.T), n = 240, pts = [];
      for (var i = 0; i <= n; i++) pts.push(inFrame(p, u, tMax * i / n).pos);
      var xs = pts.map(function (q) { return q[0]; });
      var xlo = Math.min.apply(null, xs) - 0.8, xhi = Math.max.apply(null, xs) + 0.8;
      var pf = window.LabPlot(svgF, { x: [xlo, xhi], y: [-p.r - 1, p.r + 1], equal: true });
      pf.clear(); pf.grid(); pf.axes();
      pf.segments(pts.slice(1).map(function (q, k) { return [pts[k], q]; }), 'ref', 2.5);
      var f = inFrame(p, u, t);
      pf.segments(arrowSegs(f.pos[0], f.pos[1], f.vel[0] * KV, f.vel[1] * KV, 0.25), 'aux', 3.5);
      pf.point(f.pos[0], f.pos[1], 'dot-trace', 8);
      pf.label(xlo, p.r + 1, 'visto desde un marco con u = ' + u + ' m/s', 'start', 15, 6, 14);

      facts.innerHTML = '';
      [['v = ωr', UI.fmt(U.v, 4) + ' m/s'], ['a_c = v²/r', UI.fmt(U.ac, 4) + ' m/s²'], ['periodo T', UI.fmt(U.T, 4) + ' s'],
        ['frecuencia', UI.fmt(U.f, 4) + ' Hz = ' + UI.fmt(U.rpm, 4) + ' rpm'], ['rapidez en el otro marco', UI.fmt(Math.hypot(f.vel[0], f.vel[1]), 4) + ' m/s']]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    function stop() {
      if (anim) { anim.pause(); anim = null; }
      play.textContent = 'Girar'; play.setAttribute('aria-pressed', 'false');
    }
    function toggle() {
      if (anim) { stop(); return; }
      if (!(window.CBAnim && window.CBAnim.canAnimate() && window.anime)) { thS.set((thS.get() + 90) % 720); draw(); return; }
      var o = { a: thS.get() }, dur = 720 / (wS.get() * DEG) * 1000;   // tiempo real: 720° a ω rad/s
      play.textContent = 'Pausar'; play.setAttribute('aria-pressed', 'true');
      anim = window.anime({ targets: o, a: 720, duration: Math.max(800, dur * (720 - o.a) / 720), easing: 'linear',
        update: function () { thS.set(Math.round(o.a)); draw(); }, complete: function () { thS.set(0); stop(); draw(); } });
    }

    function check() {
      var val = parseFloat(aIn.input.value), kind = diagnoseAc(params(), val), msg = MSG[kind] || MSG.bad;
      UI.verdict(verdict, kind === 'ok' ? 'ok' : kind === 'bad' ? 'bad' : 'warn', msg[0], msg[1]);
      checked = true;
      draw();
    }

    // Ejemplo cargado: un compañero dio la rapidez en lugar de la aceleración.
    aIn.input.value = UI.fmt(uniform(params()).v, 4);
    note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Ves el error? Cambia ω y r y escribe tu a_c.';
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
