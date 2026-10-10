/* =====================================================================
   Portada de curso (§7.1, §7.5) — todo sale de window.COURSE_META.
   - Firma animada del hero: Cálculo = secante que se vuelve tangente;
     Física = proyectil con sus vectores v y a. En N2: Cálculo = subir por el
     gradiente entre curvas de nivel; Física = carga de prueba en un dipolo.
   - Contadores calculados desde los datos.
   - Línea de tiempo de 15 semanas con marcas de quiz (Q) y parcial (P).
   - Temario por bloque; la tarjeta enlaza solo si la sesión ya existe (ready).
   ===================================================================== */
(function () {
  var NS = 'http://www.w3.org/2000/svg';

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function allSessions(meta) {
    return meta.groups.reduce(function (acc, g) {
      return acc.concat(g.sessions.map(function (s) { return Object.assign({ group: g }, s); }));
    }, []);
  }

  /* ---------- Firma: secante → tangente ---------- */
  function signCalculus(svg) {
    // Mundo: x ∈ [-0.4, 4.2], y ∈ [-0.6, 3.4] → viewBox 600×420
    var X = function (x) { return 40 + (x + 0.4) * 115; };
    var Y = function (y) { return 380 - (y + 0.6) * 88; };
    var f = function (x) { return 0.18 * x * x * x - 1.05 * x * x + 1.6 * x + 1.1; };
    var df = function (x) { return 0.54 * x * x - 2.1 * x + 1.6; };
    var a = 0.3;

    var g = el('g', { 'class': 'sketch' }, svg);
    el('path', { d: 'M' + X(-0.3) + ' ' + Y(0) + 'H' + X(4.1) + 'M' + X(0) + ' ' + Y(-0.5) + 'V' + Y(3.3), 'class': 'axis', 'stroke-width': 1.6, fill: 'none' }, g);
    var d = '';
    for (var i = 0; i <= 120; i++) { var x = -0.2 + 4.2 * i / 120; d += (i ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(f(x)).toFixed(1); }
    el('path', { d: d, 'class': 'ref sign-curve', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }, g);
    var sec = el('line', { 'class': 'aux', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    var run = el('path', { 'class': 'axis', 'stroke-width': 1.4, 'stroke-dasharray': '4 5', fill: 'none' }, g);
    var pA = el('circle', { r: 6, 'class': 'dot-ref' }, g);
    var pB = el('circle', { r: 6, 'class': 'dot-aux' }, g);
    var lab = el('text', { 'class': 'ann', 'font-size': 26, 'text-anchor': 'middle' }, g);
    var labA = el('text', { 'class': 'ann', 'font-size': 24, x: X(a) - 10, y: Y(-0.3) + 4, 'text-anchor': 'middle' }, g);
    labA.textContent = 'a';

    function draw(h) {
      var b = a + h;
      var m = h > 0.02 ? (f(b) - f(a)) / h : df(a);
      // Extremos recortados para que la recta no salga de [-0.4, 2.9] en y.
      var lim = function (dir) { var dx = dir > 0 ? 2.4 : 0.6; var yEnd = f(a) + m * dx * dir; if (yEnd > 2.9) dx = (2.9 - f(a)) / Math.abs(m); if (yEnd < -0.4) dx = (f(a) + 0.4) / Math.abs(m); return a + dx * dir; };
      var x0 = lim(-1), x1 = lim(1);
      sec.setAttribute('x1', X(x0)); sec.setAttribute('y1', Y(f(a) + m * (x0 - a)));
      sec.setAttribute('x2', X(x1)); sec.setAttribute('y2', Y(f(a) + m * (x1 - a)));
      pA.setAttribute('cx', X(a)); pA.setAttribute('cy', Y(f(a)));
      pB.setAttribute('cx', X(b)); pB.setAttribute('cy', Y(f(b)));
      pB.style.opacity = h > 0.05 ? 1 : 0;
      run.setAttribute('d', 'M' + X(a) + ' ' + Y(f(a)) + 'H' + X(b) + 'V' + Y(f(b)));
      run.style.opacity = h > 0.05 ? 1 : 0;
      lab.setAttribute('x', X(3.0));
      lab.setAttribute('y', Y(0.3));
      lab.textContent = h > 0.05 ? 'h = ' + h.toFixed(2) : 'h → 0: tangente';
    }
    return { draw: draw, from: 2.3, to: 0 };
  }

  /* ---------- Firma: proyectil con v y a ---------- */
  function signPhysics(svg) {
    var v0 = 17, th = 55 * Math.PI / 180, gAcc = 9.81;
    var vx = v0 * Math.cos(th), vy = v0 * Math.sin(th);
    var T = 2 * vy / gAcc, R = vx * T, H = vy * vy / (2 * gAcc);
    var S = 500 / R;                                   // px por metro
    var X = function (x) { return 50 + x * S; };
    var Y = function (y) { return 370 - y * S; };
    var g = el('g', { 'class': 'sketch' }, svg);
    el('path', { d: 'M30 ' + Y(0) + 'H575', 'class': 'axis', 'stroke-width': 1.6, fill: 'none' }, g);
    var d = '';
    for (var i = 0; i <= 80; i++) { var t = T * i / 80; d += (i ? 'L' : 'M') + X(vx * t).toFixed(1) + ' ' + Y(vy * t - gAcc * t * t / 2).toFixed(1); }
    el('path', { d: d, 'class': 'ref', 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '1 9', 'stroke-linecap': 'round' }, g);
    var trace = el('path', { 'class': 'trace', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
    var vArrow = el('path', { 'class': 'aux', 'stroke-width': 3.2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    var aArrow = el('path', { 'class': 'error', 'stroke-width': 3.2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    var ball = el('circle', { r: 9, 'class': 'dot-trace' }, g);
    var vLab = el('text', { 'class': 'ann', 'font-size': 28 }, g);
    var aLab = el('text', { 'class': 'ann', 'font-size': 26 }, g);
    vLab.textContent = 'v'; aLab.textContent = 'a = g';
    var top = el('text', { 'class': 'ann', 'font-size': 22, x: X(R * 0.5), y: Y(H) - 22, 'text-anchor': 'middle' }, g);
    top.innerHTML = 'altura máx.: v<tspan font-size="15" dy="5">y</tspan><tspan dy="-5"> = 0</tspan>';

    function arrow(x, y, dx, dy) {
      var L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, h = 11;
      var ex = x + dx, ey = y + dy;
      return 'M' + x + ' ' + y + 'L' + ex + ' ' + ey +
        'M' + (ex - ux * h - uy * h * 0.6) + ' ' + (ey - uy * h + ux * h * 0.6) + 'L' + ex + ' ' + ey +
        'L' + (ex - ux * h + uy * h * 0.6) + ' ' + (ey - uy * h - ux * h * 0.6);
    }
    function draw(u) {
      var t = T * u;
      var x = X(vx * t), y = Y(vy * t - gAcc * t * t / 2);
      var k = 4.2;                                     // px por m/s
      var dT = '';
      for (var i = 0; i <= 40; i++) { var ti = t * i / 40; dT += (i ? 'L' : 'M') + X(vx * ti).toFixed(1) + ' ' + Y(vy * ti - gAcc * ti * ti / 2).toFixed(1); }
      trace.setAttribute('d', dT);
      ball.setAttribute('cx', x); ball.setAttribute('cy', y);
      var vxs = vx * k, vys = -(vy - gAcc * t) * k;
      vArrow.setAttribute('d', arrow(x, y, vxs, vys));
      aArrow.setAttribute('d', arrow(x, y, 0, 58));
      vLab.setAttribute('x', x + vxs + 8); vLab.setAttribute('y', y + vys - 6);
      aLab.setAttribute('x', x + 12); aLab.setAttribute('y', y + 70);
    }
    return { draw: draw, from: 0, to: 0.74 };
  }

  /* ---------- Firma N2 de Cálculo: subir por el gradiente ---------- */
  // Curvas de nivel de f = x²/4 + y² (elipses) y un punto que sube por −∇ hacia afuera:
  // el vector ∇f siempre cruza las curvas de nivel en ángulo recto.
  function signGradient(svg) {
    var X = function (x) { return 300 + x * 62; };
    var Y = function (y) { return 205 - y * 62; };
    var g = el('g', { 'class': 'sketch' }, svg);
    el('path', { d: 'M' + X(-4.4) + ' ' + Y(0) + 'H' + X(4.4) + 'M' + X(0) + ' ' + Y(-2.6) + 'V' + Y(2.6), 'class': 'axis', 'stroke-width': 1.4, fill: 'none' }, g);
    [0.5, 1, 1.5, 2, 2.5].forEach(function (c, i) {
      var d = '';
      for (var k = 0; k <= 96; k++) { var t = 2 * Math.PI * k / 96; d += (k ? 'L' : 'M') + X(2 * c * Math.cos(t)).toFixed(1) + ' ' + Y(c * Math.sin(t)).toFixed(1); }
      el('path', { d: d + 'Z', 'class': i % 2 ? 'aux' : 'ref', 'stroke-width': 2.4, fill: 'none', opacity: 0.55 + 0.1 * i }, g);
    });
    var trace = el('path', { 'class': 'trace', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
    var grad = el('path', { 'class': 'error', 'stroke-width': 3.2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    var dot = el('circle', { r: 8, 'class': 'dot-trace' }, g);
    var lab = el('text', { 'class': 'ann', 'font-size': 26 }, g);
    lab.textContent = '∇f';
    var cap = el('text', { 'class': 'ann', 'font-size': 21, x: 300, y: 400, 'text-anchor': 'middle' }, g);
    cap.textContent = '∇f ⟂ curvas de nivel';
    // Línea de gradiente: dx/dt = x/2, dy/dt = 2y → y = y0 (x/x0)⁴, desde (0.6, 0.08) hasta y = 2.3.
    var x0 = 0.6, y0 = 0.08, xe = x0 * Math.pow(2.3 / y0, 0.25);
    function at(u) { var x = x0 + (xe - x0) * u; return { x: x, y: y0 * Math.pow(x / x0, 4) }; }
    function draw(u) {
      var d = '';
      for (var i = 0; i <= 40; i++) { var p = at(u * i / 40); d += (i ? 'L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p.y).toFixed(1); }
      trace.setAttribute('d', d);
      var q = at(u), gx = q.x / 2, gy = 2 * q.y, L = Math.hypot(gx, gy) || 1, len = 70;
      var sx = X(q.x), sy = Y(q.y), ex = sx + gx / L * len, ey = sy - gy / L * len, ux = (ex - sx) / len, uy = (ey - sy) / len, hh = 11;
      grad.setAttribute('d', 'M' + sx + ' ' + sy + 'L' + ex + ' ' + ey + 'M' + (ex - ux * hh - uy * hh * 0.6) + ' ' + (ey - uy * hh + ux * hh * 0.6) + 'L' + ex + ' ' + ey + 'L' + (ex - ux * hh + uy * hh * 0.6) + ' ' + (ey - uy * hh - ux * hh * 0.6));
      dot.setAttribute('cx', sx); dot.setAttribute('cy', sy);
      lab.setAttribute('x', ex + 8); lab.setAttribute('y', ey - 8);
    }
    return { draw: draw, from: 0, to: 0.72 };
  }

  /* ---------- Firma N2 de Física: dipolo y carga de prueba ---------- */
  function signDipole(svg) {
    var A = { x: 200, y: 200, q: 1 }, B = { x: 400, y: 200, q: -1 };
    var g = el('g', { 'class': 'sketch' }, svg);
    function E(x, y) {
      var ex = 0, ey = 0;
      [A, B].forEach(function (c) { var dx = x - c.x, dy = y - c.y, r = Math.hypot(dx, dy) || 1; ex += c.q * dx / (r * r * r); ey += c.q * dy / (r * r * r); });
      return [ex, ey];
    }
    // Desde c, siguiendo E (dir = 1) o −E (dir = −1), hasta la otra carga o el borde.
    function line(c, ang, dir) {
      var o = c === A ? B : A, x = c.x + 20 * Math.cos(ang), y = c.y + 20 * Math.sin(ang), pts = [[x, y]], hit = false;
      for (var i = 0; i < 400; i++) {
        var e = E(x, y), L = Math.hypot(e[0], e[1]) || 1;
        x += 4 * dir * e[0] / L; y += 4 * dir * e[1] / L;
        if (x < 30 || x > 570 || y < 30 || y > 390) break;
        if (Math.hypot(x - o.x, y - o.y) < 20) { hit = true; break; }
        pts.push([x, y]);
      }
      return { pts: pts, hit: hit };
    }
    function draw1(pts) { el('path', { d: pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(''), 'class': 'ref', 'stroke-width': 2.2, fill: 'none', opacity: 0.7 }, g); }
    var lines = [];
    for (var k = 0; k < 12; k++) {
      var ang = Math.PI * 2 * (k + 0.5) / 12, a = line(A, ang, 1);
      lines.push(a.pts); draw1(a.pts);
      // Las que llegan a − desde lejos (simétricas de las que se van de +).
      if (!a.hit) draw1(line(B, Math.PI - ang, -1).pts);
    }
    [A, B].forEach(function (c) {
      el('circle', { cx: c.x, cy: c.y, r: 18, 'class': c.q > 0 ? 'box-err' : 'box-aux' }, g);
      var t = el('text', { 'class': 'ann', 'font-size': 30, x: c.x, y: c.y + 10, 'text-anchor': 'middle' }, g);
      t.textContent = c.q > 0 ? '+' : '−';
    });
    var path = lines[2];
    var vec = el('path', { 'class': 'error', 'stroke-width': 3.2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    var dot = el('circle', { r: 7, 'class': 'dot-trace' }, g);
    var lab = el('text', { 'class': 'ann', 'font-size': 26 }, g);
    lab.textContent = 'E';
    function draw(u) {
      var p = path[Math.max(0, Math.min(path.length - 1, Math.round(u * (path.length - 1))))];
      var e = E(p[0], p[1]), L = Math.hypot(e[0], e[1]) || 1, len = 58, ux = e[0] / L, uy = e[1] / L, ex = p[0] + ux * len, ey = p[1] + uy * len, hh = 11;
      vec.setAttribute('d', 'M' + p[0] + ' ' + p[1] + 'L' + ex + ' ' + ey + 'M' + (ex - ux * hh - uy * hh * 0.6) + ' ' + (ey - uy * hh + ux * hh * 0.6) + 'L' + ex + ' ' + ey + 'L' + (ex - ux * hh + uy * hh * 0.6) + ' ' + (ey - uy * hh - ux * hh * 0.6));
      dot.setAttribute('cx', p[0]); dot.setAttribute('cy', p[1]);
      // La E va del lado de afuera de la línea (lejos del eje del dipolo).
      var nx = -uy, ny = ux; if (ny * (ey - A.y) < 0) { nx = -nx; ny = -ny; }
      lab.setAttribute('x', ex - ux * 20 + nx * 22 - 8); lab.setAttribute('y', ey - uy * 20 + ny * 22 + 9);
    }
    return { draw: draw, from: 0.1, to: 0.5 };
  }

  function mountSign(meta) {
    var svg = document.getElementById('course-sign');
    if (!svg) return;
    var n2 = meta.level === 'N2';
    var sign = meta.subject === 'fis' ? (n2 ? signDipole(svg) : signPhysics(svg)) : (n2 ? signGradient(svg) : signCalculus(svg));
    var anim = window.CBAnim;
    if (!anim || !anim.canAnimate()) { sign.draw(sign.to); return; }
    var p = { v: sign.from };
    sign.draw(sign.from);
    anime({ targets: p, v: sign.to, duration: 3200, delay: 500, easing: 'easeInOutCubic', update: function () { sign.draw(p.v); } });
  }

  /* ---------- Contadores ---------- */
  // Los bancos de preguntas se cargan aquí solo para contar cuántas hay.
  function loadBanks(meta) {
    var files = allSessions(meta).filter(function (s) { return s.bank; }).map(function (s) {
      return '../data/' + meta.slug + '/bank/sesion-' + pad(s.n) + '.js';
    });
    function load(src) {
      return new Promise(function (resolve) {
        var sc = document.createElement('script');
        sc.src = src; sc.onload = resolve; sc.onerror = resolve;
        document.head.appendChild(sc);
      });
    }
    // Los bancos usan el kit de constructores: se carga primero.
    return load('../shared/js/quiz/bank-kit.js').then(function () { return Promise.all(files.map(load)); });
  }

  function renderStats(meta, root) {
    var sessions = allSessions(meta);
    var labs = {};
    sessions.forEach(function (s) { if (s.lab) labs[s.lab] = true; });
    var bank = (window.CB_BANK && window.CB_BANK[meta.code]) || {};
    var questions = Object.keys(bank).reduce(function (n, k) { return n + bank[k].questions.length; }, 0);
    var stats = [
      { value: meta.sessions, label: 'sesiones' },
      { value: Object.keys(labs).length, label: 'labs interactivos' },
      { value: questions, label: 'preguntas en el banco', empty: 'Pronto' }
    ];
    root.innerHTML = stats.map(function (s) {
      var v = s.value || !s.empty ? '<span class="value" data-counter="' + s.value + '">' + s.value + '</span>'
        : '<span class="value value--soon">' + s.empty + '</span>';
      return '<div class="stat">' + v + '<span class="label">' + s.label + '</span></div>';
    }).join('');
  }

  /* ---------- Ritmo sugerido: 15 semanas ---------- */
  function renderTimeline(meta, root) {
    var presets = (window.QUIZ_PRESETS && window.QUIZ_PRESETS.presets) || [];
    var marks = {};
    presets.forEach(function (p) {
      if (p.id === 'final') return;
      (marks[p.week] = marks[p.week] || []).push({ kind: p.kind === 'exam' ? 'P' : 'Q', label: p.label });
    });
    var cells = allSessions(meta).map(function (s) {
      var m = (marks[s.n] || []).map(function (k) {
        return '<span class="week__mark week__mark--' + k.kind + '" title="' + esc(k.label) + '">' + k.kind + '<span class="visually-hidden"> · ' + esc(k.label) + '</span></span>';
      }).join('');
      return '<li class="week' + (s.group.sessions[0].n === s.n ? ' week--first' : '') + '">' +
        '<span class="week__group">' + esc(s.group.id) + '</span>' +
        '<span class="week__n">S' + pad(s.n) + '</span>' +
        '<span class="week__marks">' + m + '</span></li>';
    }).join('');
    root.innerHTML = '<ol class="timeline__weeks" aria-label="Semana por semana">' + cells + '</ol>' +
      '<p class="timeline__legend"><span class="week__mark week__mark--Q" aria-hidden="true">Q</span> quiz sugerido · ' +
      '<span class="week__mark week__mark--P" aria-hidden="true">P</span> parcial sugerido · ' +
      'una sesión por semana. Es solo una guía: todo está abierto desde el primer día.</p>';
  }

  /* ---------- Temario ---------- */
  function renderSyllabus(meta, root) {
    root.innerHTML = meta.groups.map(function (g) {
      var cards = g.sessions.map(function (s) {
        var tags = (s.temario || []).map(function (t) { return '<span class="chip chip--line">' + esc(t) + '</span>'; }).join('');
        if (s.lab) tags += '<span class="chip">lab · ' + esc(s.lab) + '</span>';
        var inner = '<span class="session-card__num">' + pad(s.n) + '</span>' +
          '<h4 class="session-card__title">' + esc(s.title) + '</h4>' +
          (tags ? '<div class="session-card__tags">' + tags + '</div>' : '') +
          '<span class="session-card__state">' + (s.ready ? 'Abrir sesión' : 'Próximamente') + '</span>';
        return s.ready
          ? '<a class="card session-card reveal" href="sesiones/sesion-' + pad(s.n) + '/">' + inner + '</a>'
          : '<div class="card session-card session-card--soon reveal" aria-disabled="true">' + inner + '</div>';
      }).join('');
      var first = g.sessions[0].n, last = g.sessions[g.sessions.length - 1].n;
      return '<section class="block" aria-labelledby="block-' + g.id + '">' +
        '<div class="block__head"><span class="block__id">' + esc(g.id) + '</span>' +
        '<h3 id="block-' + g.id + '">' + esc(g.label) + '</h3>' +
        '<span class="block__range">S' + pad(first) + (last !== first ? '–S' + pad(last) : '') + '</span></div>' +
        '<div class="sessions__grid">' + cards + '</div></section>';
    }).join('');
  }

  function renderNext(meta, root) {
    if (!meta.next) { root.remove(); return; }
    root.innerHTML = '<div class="card next-level__card reveal">' +
      '<span class="chip chip--line">Siguiente nivel · próximamente</span>' +
      '<h2 class="next-level__title">' + esc(meta.next.title) + '</h2>' +
      '<p>' + esc(meta.next.blurb) + '</p>' +
      '<a class="btn btn--ghost" href="../#biblioteca">Ver la biblioteca</a></div>';
  }

  function render(meta) {
    meta = meta || window.COURSE_META;
    if (!meta) return;
    var q = function (id) { return document.getElementById(id); };
    if (q('course-stats')) {
      renderStats(meta, q('course-stats'));
      loadBanks(meta).then(function () {
        renderStats(meta, q('course-stats'));
        if (window.CBAnim) window.CBAnim.counters(q('course-stats'));
      });
    }
    if (q('course-timeline')) renderTimeline(meta, q('course-timeline'));
    if (q('course-syllabus')) renderSyllabus(meta, q('course-syllabus'));
    if (q('course-next')) renderNext(meta, q('course-next'));
    mountSign(meta);
  }

  window.CourseHome = { render: render, sessions: allSessions };
})();
