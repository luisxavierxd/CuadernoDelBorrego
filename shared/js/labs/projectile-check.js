/* =====================================================================
   Lab projectile-check (§8.3): tiro parabólico.
   El alumno da su alcance R o su trayectoria y(x); se compara contra la
   solución analítica (sin arrastre, g = 9.81 m/s²) y se diagnostican errores
   típicos: sin θ en lugar de sin 2θ y olvidar el factor 2.
     x(t) = v0 cos θ · t        y(t) = h0 + v0 sin θ · t − g t²/2
     y(x) = h0 + x tan θ − g x² / (2 v0² cos² θ)
   ===================================================================== */
(function () {
  var G = 9.81;
  var RAD = Math.PI / 180;

  /* ------------------------- Matemática pura ------------------------- */
  function flight(p) {
    var g = p.g || G, h0 = p.h0 || 0, th = p.theta * RAD;
    var vx = p.v0 * Math.cos(th), vy = p.v0 * Math.sin(th);
    var T = (vy + Math.sqrt(vy * vy + 2 * g * h0)) / g;
    return {
      vx: vx, vy: vy, T: T, R: vx * T,
      H: vy > 0 ? h0 + vy * vy / (2 * g) : h0,
      tApex: Math.max(0, vy / g)
    };
  }

  function y(p, x) {
    var g = p.g || G, th = p.theta * RAD, c = Math.cos(th);
    return (p.h0 || 0) + x * Math.tan(th) - g * x * x / (2 * p.v0 * p.v0 * c * c);
  }

  function close(a, b, tol) { return Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-9); }

  // Errores típicos del alcance en suelo plano. Tolerancia relativa del 1 %.
  function rangeMistakes(p) {
    var g = p.g || G, th = p.theta * RAD, v2 = p.v0 * p.v0;
    return {
      usedSinTheta: v2 * Math.sin(th) / g,
      forgotTwo: v2 * Math.sin(th) * Math.cos(th) / g
    };
  }
  function diagnoseRange(p, student, tol) {
    tol = tol || 0.01;
    if (!isFinite(student)) return 'bad';
    if (close(student, flight(p).R, tol)) return 'ok';
    var m = rangeMistakes(p);
    for (var k in m) if (close(student, m[k], tol)) return k;
    return 'bad';
  }

  // Compara la y(x) del alumno contra la real en [0, R]; error relativo a la altura máxima.
  function compareY(math, src, p, tol) {
    tol = tol || 0.01;
    var code = math.parse(String(src).replace(/−/g, '-')).compile();
    var f = flight(p), n = 60, samples = [], maxErr = 0;
    var scale = Math.max(f.H, 1e-6);
    for (var i = 0; i <= n; i++) {
      var x = f.R * i / n, ys;
      try { ys = code.evaluate({ x: x }); } catch (e) { ys = NaN; }
      ys = typeof ys === 'number' ? ys : NaN;
      var yr = y(p, x);
      samples.push({ x: x, y: yr, ys: ys });
      maxErr = Math.max(maxErr, isFinite(ys) ? Math.abs(ys - yr) / scale : Infinity);
    }
    return { ok: maxErr < tol, maxErr: maxErr, samples: samples };
  }

  window.LabMath.projectile = { G: G, flight: flight, y: y, rangeMistakes: rangeMistakes, diagnoseRange: diagnoseRange, compareY: compareY };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var MSG = {
    ok: ['Tu alcance coincide', 'El proyectil cae justo donde dijiste.'],
    usedSinTheta: ['Usaste sin θ en lugar de sin 2θ', 'El alcance es R = v₀² sin 2θ / g. El 2θ sale de juntar sin θ (subida) con cos θ (avance).'],
    forgotTwo: ['Te falta un factor de 2', 'Calculaste v₀² sin θ cos θ / g, que es la mitad. El tiempo de vuelo completo es 2 v₀ sin θ / g, no solo la subida.'],
    bad: ['Tu alcance no coincide', 'Compara tu marca con la real. Revisa las componentes de v₀ y el tiempo de vuelo.']
  };

  function niceStep(span) {
    var raw = span / 5, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }

  window.Labs['projectile-check'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var math = null, anim = null;
    var start = cfg.start || { v0: 18, theta: 35, mode: 'range', answer: null };

    var v0 = UI.slider({ label: 'Rapidez inicial v₀', min: 5, max: 30, step: 0.5, value: start.v0, unit: 'm/s' }, update);
    var th = UI.slider({ label: 'Ángulo θ', min: 5, max: 85, step: 1, value: start.theta, unit: '°' }, update);
    var mode = UI.select({ label: '¿Qué vas a comprobar?', options: ['Mi alcance R', 'Mi trayectoria y(x)'] });
    var rIn = UI.input({ label: 'Tu alcance R (m)', type: 'number', step: 'any', inputmode: 'decimal' });
    var yIn = UI.input({ label: 'Tu y(x)', hint: 'Usa <code>x</code>, <code>tan(35 deg)</code>, <code>cos(35 deg)^2</code>, <code>9.81</code>. Ejemplo: <code>x*tan(35 deg) - 9.81*x^2/(2*18^2*cos(35 deg)^2)</code>' });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 640 364');
    svg.setAttribute('class', 'lab-stage lab-plot');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Trayectoria real del proyectil y la tuya, en metros');
    var legend = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--ref' }), 'trayectoria real']),
      h('li', {}, [h('i', { class: 'sw sw--student' }), 'la tuya']),
      h('li', {}, [h('i', { class: 'sw sw--trace' }), 'proyectil'])
    ]);

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        v0.node, th.node, mode.node, rIn.node, yIn.node,
        h('div', { class: 'lab-buttons' }, [run]), note, verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Tu tiro contra el real']),
        svg, legend, facts
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    mode.input.addEventListener('change', function () { syncMode(); check(); });

    function params() { return { v0: v0.get(), theta: th.get() }; }
    function syncMode() {
      var isY = mode.input.value === '1';
      rIn.node.hidden = isY; yIn.node.hidden = !isY;
    }

    // Ejemplo cargado al abrir: la respuesta de un compañero con el error típico.
    function loadExample() {
      var p = params();
      mode.input.value = start.mode === 'y' ? '1' : '0';
      var sample = start.answer != null ? start.answer : rangeMistakes(p).usedSinTheta;
      rIn.input.value = UI.fmt(sample, 4);
      yIn.input.value = 'x*tan(' + p.theta + ' deg) - 9.81*x^2/(2*' + p.v0 + '^2*cos(' + p.theta + ' deg)^2)';
      note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Ves el error? Cambia los valores y escribe el tuyo.';
      syncMode();
    }

    function update() {
      // Al mover v₀ o θ, la y(x) de ejemplo se ajusta a los nuevos valores.
      var p = params();
      if (mode.input.value === '1' && /tan\(\d+(\.\d+)? deg\)/.test(yIn.input.value)) {
        yIn.input.value = 'x*tan(' + p.theta + ' deg) - 9.81*x^2/(2*' + p.v0 + '^2*cos(' + p.theta + ' deg)^2)';
      }
      draw(null, false);
    }

    function el(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n);
      return n;
    }

    // student: { R } o { samples } · motion: animar el proyectil
    function draw(student, motion) {
      var p = params(), f = flight(p);
      var xMax = f.R, yMax = f.H;
      if (student && isFinite(student.R)) xMax = Math.max(xMax, student.R);
      if (student && student.samples) student.samples.forEach(function (s) { if (isFinite(s.ys)) yMax = Math.max(yMax, s.ys); });
      xMax *= 1.1; yMax *= 1.25;
      // Escala igual en x y en y para que la parábola no se deforme.
      var L = 56, B = 318, W = 560, Hh = 280;
      var k = Math.min(W / xMax, Hh / yMax);
      var X = function (x) { return L + x * k; }, Y = function (v) { return B - v * k; };
      svg.innerHTML = '';

      var g = el('g', { 'class': 'sketch' });
      var sx = niceStep(W / k);
      for (var t = sx; t <= W / k + 1e-9; t += sx) {
        el('line', { x1: X(t), x2: X(t), y1: B, y2: B + 6, 'class': 'axis', 'stroke-width': 1.2 }, g);
        el('text', { x: X(t), y: B + 22, 'class': 'lab-tick', 'text-anchor': 'middle' }, g).textContent = UI.fmt(t, 3);
      }
      for (var u = sx; u <= Hh / k + 1e-9; u += sx) {
        el('line', { x1: L - 6, x2: L, y1: Y(u), y2: Y(u), 'class': 'axis', 'stroke-width': 1.2 }, g);
        el('text', { x: L - 10, y: Y(u) + 4, 'class': 'lab-tick', 'text-anchor': 'end' }, g).textContent = UI.fmt(u, 3);
      }
      el('path', { d: 'M' + L + ' ' + B + 'H' + (L + W) + 'M' + L + ' ' + B + 'V' + (B - Hh), 'class': 'axis', 'stroke-width': 1.5, fill: 'none' }, g);
      el('text', { x: L + W, y: B + 40, 'class': 'ann', 'text-anchor': 'end', 'font-size': 18 }, g).textContent = 'x (m)';
      el('text', { x: L + 8, y: B - Hh + 6, 'class': 'ann', 'font-size': 18 }, g).textContent = 'y (m)';

      var d = '';
      for (var i = 0; i <= 80; i++) { var xx = f.R * i / 80; d += (i ? 'L' : 'M') + X(xx).toFixed(1) + ' ' + Y(y(p, xx)).toFixed(1); }
      var real = el('path', { d: d, 'class': 'ref', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);

      if (student && student.samples) {
        var ds = '', pen = false;
        student.samples.forEach(function (s) {
          if (!isFinite(s.ys) || s.ys < -yMax || s.ys > yMax * 2) { pen = false; return; }
          ds += (pen ? 'L' : 'M') + X(s.x).toFixed(1) + ' ' + Y(s.ys).toFixed(1); pen = true;
        });
        if (ds) el('path', { d: ds, 'class': 'student', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
      } else if (student && isFinite(student.R) && student.R > 0) {
        // Arco del alumno: misma altura máxima, cayendo en su R.
        var dr = '';
        for (var j = 0; j <= 60; j++) { var xs = student.R * j / 60; dr += (j ? 'L' : 'M') + X(xs).toFixed(1) + ' ' + Y(4 * f.H * xs * (student.R - xs) / (student.R * student.R)).toFixed(1); }
        el('path', { d: dr, 'class': 'student', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
        el('path', { d: 'M' + (X(student.R) - 7) + ' ' + (B - 7) + 'l14 14M' + (X(student.R) + 7) + ' ' + (B - 7) + 'l-14 14', 'class': 'student', 'stroke-dasharray': 'none', 'stroke-width': 3 }, g);
        el('text', { x: X(student.R), y: B - 16, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 18 }, g).textContent = 'tu R';
      }
      el('text', { x: X(f.R), y: B - 16 - (student && Math.abs(X(student.R || -1e9) - X(f.R)) < 60 ? 22 : 0), 'class': 'ann', 'text-anchor': 'middle', 'font-size': 18 }, g).textContent = 'R real';
      el('path', { d: 'M' + X(f.R / 2) + ' ' + Y(f.H) + 'V' + B, 'class': 'axis', 'stroke-dasharray': '3 5', 'stroke-width': 1.2 }, g);
      el('text', { x: X(f.R / 2) + 8, y: Y(f.H) - 8, 'class': 'ann', 'font-size': 18 }, g).textContent = 'H = ' + UI.fmt(f.H, 3) + ' m';

      var ball = el('circle', { r: 7, cx: X(f.R), cy: Y(0), 'class': 'lab-ball' }, g);

      facts.innerHTML = '';
      [['alcance real R', UI.fmt(f.R, 4) + ' m'], ['altura máxima H', UI.fmt(f.H, 4) + ' m'], ['tiempo de vuelo T', UI.fmt(f.T, 4) + ' s']]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });

      if (anim) { anim.pause(); anim = null; }
      if (motion && window.CBAnim && window.CBAnim.canAnimate()) {
        var len = real.getTotalLength(), s = { t: 0 };
        real.style.strokeDasharray = len; real.style.strokeDashoffset = len;
        anim = anime({ targets: s, t: 1, duration: 1600, easing: 'linear', update: function () {
          var pt = real.getPointAtLength(len * s.t);
          real.style.strokeDashoffset = len * (1 - s.t);
          ball.setAttribute('cx', pt.x); ball.setAttribute('cy', pt.y);
        }, complete: function () { real.style.strokeDasharray = 'none'; } });
      }
    }

    function check() {
      var p = params();
      if (mode.input.value === '1') {
        if (!math) return;
        try {
          var r = compareY(math, yIn.input.value, p);
          UI.verdict(verdict, r.ok ? 'ok' : 'bad', r.ok ? 'Tu y(x) coincide con la real' : 'Tu y(x) se separa de la real',
            r.ok ? 'Error máximo: ' + (r.maxErr * 100).toFixed(2) + ' % de la altura máxima.'
                 : 'Error máximo: ' + (isFinite(r.maxErr) ? (r.maxErr * 100).toFixed(0) + ' %' : 'no se pudo evaluar') + ' de la altura máxima. Revisa tan θ y el cos² θ del denominador.');
          draw({ samples: r.samples }, true);
        } catch (e) {
          UI.verdict(verdict, 'bad', 'No pude leer la expresión', e.message);
          draw(null, false);
        }
        return;
      }
      var val = parseFloat(rIn.input.value);
      var kind = diagnoseRange(p, val);
      var msg = MSG[kind] || MSG.bad;
      var err = (val - flight(p).R) / flight(p).R * 100;
      UI.verdict(verdict, kind === 'ok' ? 'ok' : kind === 'bad' ? 'bad' : 'warn', msg[0],
        msg[1] + (isFinite(err) && kind !== 'ok' ? ' Tu error: ' + (err > 0 ? '+' : '') + err.toFixed(1) + ' %.' : ''));
      draw({ R: val }, true);
    }

    loadExample();
    draw(null, false);
    check();
    return UI.loadMath().then(function (m) { math = m; }).catch(function () {});
  };
})();
