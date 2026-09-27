/* =====================================================================
   Lab dot-cross (§8.3): producto escalar y producto vectorial de dos
   vectores en 3D. El alumno escribe A·B y las componentes de A×B.
   Se muestra la proyección de A sobre B (lo que mide el producto escalar)
   y una vista 3D que puede girar, con A×B perpendicular a los dos
   (regla de la mano derecha). Errores típicos que detecta:
     reversed     calculó B×A = −(A×B)
     jSign        olvidó el signo menos de la componente j del determinante
     magsProduct  en A·B multiplicó magnitudes sin el cos θ
   ===================================================================== */
(function () {
  var DEG = 180 / Math.PI, RAD = Math.PI / 180;

  /* ------------------------- Matemática pura ------------------------- */
  function v3(a) { return [a[0] || 0, a[1] || 0, a[2] || 0]; }
  function add(a, b) { a = v3(a); b = v3(b); return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function sub(a, b) { a = v3(a); b = v3(b); return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function scale(k, a) { a = v3(a); return [k * a[0], k * a[1], k * a[2]]; }
  function dot(a, b) { a = v3(a); b = v3(b); return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) {
    a = v3(a); b = v3(b);
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  function mag(a) { a = v3(a); return Math.hypot(a[0], a[1], a[2]); }
  function unit(a) { var m = mag(a); return m > 0 ? scale(1 / m, a) : [NaN, NaN, NaN]; }
  function angle(a, b) {
    var c = dot(a, b) / (mag(a) * mag(b));
    return Math.acos(Math.max(-1, Math.min(1, c))) * DEG;
  }
  function projScalar(a, b) { return dot(a, b) / mag(b); }          // componente de A a lo largo de B
  function projVector(a, b) { return scale(dot(a, b) / dot(b, b), b); }
  function area(a, b) { return mag(cross(a, b)); }                   // área del paralelogramo

  function close(x, y, tol) { return Math.abs(x - y) <= tol * Math.max(1, Math.abs(y)); }
  function closeVec(s, t, tol) { return [0, 1, 2].every(function (i) { return close(s[i], t[i], tol); }); }
  function diagnoseCross(a, b, s, tol) {
    tol = tol || 0.01;
    if (!s || !s.every(isFinite)) return 'bad';
    var c = cross(a, b);
    if (closeVec(s, c, tol)) return 'ok';
    if (closeVec(s, scale(-1, c), tol)) return 'reversed';
    if (Math.abs(c[1]) > 1e-9 && closeVec(s, [c[0], -c[1], c[2]], tol)) return 'jSign';
    return 'bad';
  }
  function diagnoseDot(a, b, s, tol) {
    tol = tol || 0.01;
    if (!isFinite(s)) return 'bad';
    var d = dot(a, b);
    if (close(s, d, tol)) return 'ok';
    if (close(s, mag(a) * mag(b), tol) && !close(d, mag(a) * mag(b), tol)) return 'magsProduct';
    return 'bad';
  }

  window.LabMath.vec3 = {
    add: add, sub: sub, scale: scale, dot: dot, cross: cross, mag: mag, unit: unit, angle: angle,
    projScalar: projScalar, projVector: projVector, area: area, diagnoseCross: diagnoseCross, diagnoseDot: diagnoseDot
  };

  // "2, -1, 3", "(2 −1 3)" o "2i - j + 3k" → [2, −1, 3]. Dos números: z = 0.
  function parseVec(str) {
    var t = String(str || '').replace(/−/g, '-').trim();
    if (/[ijk]/.test(t)) {
      var out = [0, 0, 0], re = /([+-]?\s*\d*\.?\d*)\s*\*?\s*([ijk])/g, m, any = false;
      while ((m = re.exec(t))) {
        var c = m[1].replace(/\s+/g, '');
        var val = c === '' || c === '+' ? 1 : c === '-' ? -1 : parseFloat(c);
        out['ijk'.indexOf(m[2])] += val; any = true;
      }
      return any && out.every(isFinite) ? out : null;
    }
    var nums = t.replace(/[()\[\]⟨⟩<>]/g, ' ').split(/[\s,;]+/).filter(Boolean).map(Number);
    if (nums.length === 2) nums.push(0);
    return nums.length === 3 && nums.every(isFinite) ? nums : null;
  }
  window.LabMath.vec3.parse = parseVec;

  /* ------------------------------ UI ------------------------------ */
  var MSG_CROSS = {
    ok: 'Tu A×B coincide.',
    reversed: 'Tu A×B tiene todas las componentes con el signo contrario: calculaste B×A. El orden importa: B×A = −(A×B).',
    jSign: 'La componente j tiene el signo cambiado. En el determinante, el término de j va con signo menos: −(AxBz − AzBx).',
    bad: 'Tu A×B no coincide. Revisa cada componente con el determinante.'
  };
  var MSG_DOT = {
    ok: 'Tu A·B coincide.',
    magsProduct: 'Multiplicaste las magnitudes: eso es |A||B|, falta el cos θ. Con componentes: AxBx + AyBy + AzBz.',
    bad: 'Tu A·B no coincide. Multiplica componente con componente y suma.'
  };

  window.Labs['dot-cross'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var s = cfg.start || { A: [2, -1, 3], B: [1, 4, -2] };
    var aIn = UI.input({ label: 'Vector A (x, y, z)', value: s.A.join(', '), hint: 'Tres números separados por comas, o en la forma 2i − j + 3k.' });
    var bIn = UI.input({ label: 'Vector B (x, y, z)', value: s.B.join(', ') });
    var dIn = UI.input({ label: 'Tu A·B', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var cIn = UI.input({ label: 'Tu A×B (x, y, z)' });
    var view = UI.slider({ label: 'Girar la vista 3D', min: -180, max: 180, step: 5, value: -35, unit: '°' }, function () { draw(false); });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg3 = UI.svg(640, 400, 'Vista 3D de A, B, el paralelogramo que forman y A×B perpendicular a ambos');
    var svgP = UI.svg(640, 230, 'Proyección de A sobre la dirección de B');
    var student = null;

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        aIn.node, bIn.node, dIn.node, cIn.node,
        h('div', { class: 'lab-buttons' }, [run]), note, verdict, view.node
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['A×B es perpendicular a A y a B']),
        svg3,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'A']),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'B']),
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'A×B real']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu A×B'])
        ]),
        svgP,
        facts
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    [aIn.input, bIn.input, dIn.input, cIn.input].forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } }); });

    function vecs() { return { A: parseVec(aIn.input.value), B: parseVec(bIn.input.value) }; }

    function arrowSegs(x0, y0, x1, y1, hl) {
      var dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
      if (L < 1e-9) return [];
      var ux = dx / L, uy = dy / L, k = Math.min(hl, L * 0.4);
      return [[[x0, y0], [x1, y1]],
        [[x1, y1], [x1 - k * ux - k * 0.55 * uy, y1 - k * uy + k * 0.55 * ux]],
        [[x1, y1], [x1 - k * ux + k * 0.55 * uy, y1 - k * uy - k * 0.55 * ux]]];
    }

    // Proyección: gira alrededor de z y mira con 20° de elevación (x hacia el frente).
    function projector(phi) {
      var c = Math.cos(phi * RAD), sn = Math.sin(phi * RAD), e = 20 * RAD;
      return function (p) {
        var x1 = p[0] * c - p[1] * sn, y1 = p[0] * sn + p[1] * c;
        return [y1, p[2] * Math.cos(e) - x1 * Math.sin(e)];
      };
    }

    function draw(animate) {
      var V = vecs();
      if (!V.A || !V.B) return;
      var A = V.A, B = V.B, C = cross(A, B), P = projector(view.get());
      // La flecha de A×B se escala para que quepa junto a A y B; su dirección es la real.
      var big = Math.max(mag(A), mag(B), 1), cm = mag(C), k = cm > 0 ? Math.min(1, 1.3 * big / cm) : 1;
      var Cs = scale(k, C), Ss = student ? scale(k, student) : null;
      var ext = big * 1.25;
      var pts = [[0, 0, 0], A, B, add(A, B), Cs, [ext, 0, 0], [0, ext, 0], [0, 0, ext]].concat(Ss ? [Ss] : []).map(P);
      var xs = pts.map(function (q) { return q[0]; }), ys = pts.map(function (q) { return q[1]; });
      var pad = big * 0.2;
      var plot = window.LabPlot(svg3, { x: [Math.min.apply(null, xs) - pad, Math.max.apply(null, xs) + pad], y: [Math.min.apply(null, ys) - pad, Math.max.apply(null, ys) + pad], equal: true });
      var hl = (plot.xr[1] - plot.xr[0]) * 0.03;
      plot.clear();
      var O = P([0, 0, 0]);
      [[ext, 0, 0, 'x'], [0, ext, 0, 'y'], [0, 0, ext, 'z']].forEach(function (ax) {
        var q = P(ax);
        plot.segments(arrowSegs(O[0], O[1], q[0], q[1], hl * 0.7), 'axis', 1.4);
        plot.label(q[0], q[1], ax[3], 'middle', 16, 0, -8);
      });
      plot.poly([O, P(A), P(add(A, B)), P(B)], 'area-fill');
      var pa = P(A), pb = P(B), pc = P(Cs);
      plot.segments(arrowSegs(O[0], O[1], pa[0], pa[1], hl), 'aux', 3.5);
      plot.segments(arrowSegs(O[0], O[1], pb[0], pb[1], hl), 'trace', 3.5);
      plot.segments(arrowSegs(O[0], O[1], pc[0], pc[1], hl), 'ref', 4);
      if (Ss) { var ps = P(Ss); plot.segments(arrowSegs(O[0], O[1], ps[0], ps[1], hl), 'student', 3); }
      plot.label(pa[0], pa[1], 'A', 'middle', 18, 0, -10);
      plot.label(pb[0], pb[1], 'B', 'middle', 18, 0, -10);
      plot.label(pc[0], pc[1], 'A×B', 'middle', 18, 0, -10);

      drawProjection(A, B, animate);

      facts.innerHTML = '';
      [['A·B', UI.fmt(dot(A, B), 6)], ['|A|, |B|', UI.fmt(mag(A), 4) + ', ' + UI.fmt(mag(B), 4)],
        ['ángulo entre A y B', UI.fmt(angle(A, B), 4) + '°'],
        ['A×B', '(' + C.map(function (x) { return UI.fmt(x, 5); }).join(', ') + ')'],
        ['|A×B| = área', UI.fmt(mag(C), 5)],
        ['(A×B)·A, (A×B)·B', UI.fmt(dot(C, A), 3) + ', ' + UI.fmt(dot(C, B), 3)]]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    // Plano de A y B visto de frente: B horizontal y A con su ángulo real.
    function drawProjection(A, B, animate) {
      var th = angle(A, B) * RAD, a = mag(A), b = mag(B), comp = a * Math.cos(th);
      var ax = a * Math.cos(th), ay = a * Math.sin(th);
      var lo = Math.min(0, comp, ax) - 0.3 * Math.max(a, b), hi = Math.max(b, ax, comp) + 0.3 * Math.max(a, b);
      var plot = window.LabPlot(svgP, { x: [lo, hi], y: [-0.25 * Math.max(a, b), ay + 0.35 * Math.max(a, b)], equal: true });
      var hl = (plot.xr[1] - plot.xr[0]) * 0.03;
      plot.clear();
      plot.segments(arrowSegs(0, 0, b, 0, hl), 'trace', 3.5);
      plot.segments(arrowSegs(0, 0, ax, ay, hl), 'aux', 3.5);
      plot.segments([[[ax, ay], [comp, 0]]], 'axis', 1.4);
      plot.label(b, 0, 'B', 'middle', 16, 0, 20);
      plot.label(ax, ay, 'A', 'middle', 16, 0, -10);
      plot.label(comp / 2, 0, 'A cos θ = ' + UI.fmt(comp, 4), 'middle', 15, 0, 22);
      // La "sombra" de A sobre B crece desde el origen.
      plot.segments([[[0, 0], [comp, 0]]], 'ref', 6);
      var layer = svgP.querySelector('g.sketch'), path = layer && layer.lastChild;
      if (animate && path && path.getTotalLength && window.CBAnim && window.CBAnim.canAnimate() && window.anime) {
        var len = path.getTotalLength();
        if (len > 0) {
          path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
          window.anime({ targets: path, strokeDashoffset: [len, 0], duration: 900, easing: 'easeOutQuad', complete: function () { path.style.strokeDasharray = 'none'; } });
        }
      }
    }

    function check() {
      var V = vecs();
      if (!V.A || !V.B) { UI.verdict(verdict, 'bad', 'Revisa los vectores', 'Escribe tres números separados por comas, por ejemplo 2, -1, 3.'); return; }
      var sd = parseFloat(dIn.input.value), sc = parseVec(cIn.input.value);
      student = sc;
      var kd = diagnoseDot(V.A, V.B, sd), kc = diagnoseCross(V.A, V.B, sc);
      var kind = kd === 'ok' && kc === 'ok' ? 'ok' : (kd === 'bad' && kc === 'bad') ? 'bad' : 'warn';
      var title = kind === 'ok' ? 'Los dos productos coinciden' : kind === 'bad' ? 'Ninguno de los dos coincide' : 'Uno de los dos no coincide';
      UI.verdict(verdict, kind, title, MSG_DOT[kd] + ' ' + MSG_CROSS[kc]);
      draw(true);
    }

    // Ejemplo cargado: el producto escalar bien y el vectorial al revés.
    (function loadExample() {
      var V = vecs();
      dIn.input.value = UI.fmt(dot(V.A, V.B), 6);
      cIn.input.value = cross(V.B, V.A).join(', ');
      note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Ves el error? Cambia A y B y escribe tus productos.';
    })();
    check();
    document.addEventListener('cb:themechange', function () { draw(false); });
    return Promise.resolve();
  };
})();
