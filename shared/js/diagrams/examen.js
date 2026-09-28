/* =====================================================================
   Figuras de los problemas de examen que comparten ambos cursos.
   · exam-fn: graficador genérico (curvas, áreas, rectángulos de Riemann,
     tangente, secante, puntos y rectas guía). Lo usan casi todos los
     problemas de Cálculo y los de Física con una gráfica x(t) o v(t).
   · Escenas sencillas: escalera, terreno junto al río, lata, globo.
   Todas devuelven un SVG con las clases de rol de siempre (.ref .aux
   .error .axis .ann, area-fill, rect-fill, dot-ref, box-*).
   ===================================================================== */
(function () {
  var D = window.Diagrams = window.Diagrams || {};

  function f1(n) { return (+n).toFixed(1); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function text(x, y, s, extra) { return '<text class="ann" x="' + f1(x) + '" y="' + f1(y) + '"' + (extra || '') + '>' + esc(s) + '</text>'; }
  function line(cls, x1, y1, x2, y2, w, dash) {
    return '<path class="' + cls + '" fill="none" stroke-width="' + (w || 2) + '" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') +
      ' d="M' + f1(x1) + ' ' + f1(y1) + 'L' + f1(x2) + ' ' + f1(y2) + '"/>';
  }
  function arrow(cls, x1, y1, x2, y2, w) {
    var a = Math.atan2(y2 - y1, x2 - x1), L = 11;
    return '<path class="' + cls + '" fill="none" stroke-width="' + (w || 3) + '" stroke-linecap="round" stroke-linejoin="round" d="M' + f1(x1) + ' ' + f1(y1) + 'L' + f1(x2) + ' ' + f1(y2) +
      'M' + f1(x2 - L * Math.cos(a - 0.4)) + ' ' + f1(y2 - L * Math.sin(a - 0.4)) + 'L' + f1(x2) + ' ' + f1(y2) + 'L' + f1(x2 - L * Math.cos(a + 0.4)) + ' ' + f1(y2 - L * Math.sin(a + 0.4)) + '"/>';
  }
  function svg(w, h, label, body) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(label) + '"><g class="sketch">' + body + '</g></svg>';
  }
  // Marcas "bonitas" para un intervalo: 1, 2 o 5 por potencia de 10.
  function ticks(lo, hi, n) {
    var span = hi - lo; if (!(span > 0)) return [];
    var raw = span / (n || 5), p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), m = raw / p;
    var step = (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p, out = [];
    for (var t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) out.push(Math.abs(t) < step * 1e-9 ? 0 : t);
    return out;
  }
  function num(t) { var a = Math.abs(t); return String(+(a >= 100 ? t.toFixed(0) : a >= 1 ? t.toFixed(1) : t.toFixed(2))); }

  /* ---------- exam-fn ----------
     s = { x: [a, b], y: [lo, hi]?, equal?, fns: [{ f, cls, w, dash, label }], shade: { f, g?, a, b },
           rects: { f, a, b, n }, tangent: { f, x0, len? }, secant: { f, x1, x2 },
           pts: [{ x, y, label }], vlines: [{ x, label }], hlines: [{ y, label }], xlab, ylab, label } */
  D['exam-fn'] = function (s) {
    var W = 640, H = 300, L = 62, R = 612, T = 22, B = 262;
    var a = s.x[0], b = s.x[1], fns = s.fns || [];
    var ys = [];
    fns.forEach(function (F) { for (var i = 0; i <= 120; i++) { var y = F.f(a + (b - a) * i / 120); if (isFinite(y)) ys.push(y); } });
    (s.pts || []).forEach(function (p) { ys.push(p.y); });
    var lo = s.y ? s.y[0] : Math.min.apply(null, ys.concat([0])), hi = s.y ? s.y[1] : Math.max.apply(null, ys.concat([0]));
    if (!s.y) { var pad = (hi - lo) * 0.08 || 1; lo -= lo < 0 ? pad : 0; hi += pad; }
    var sx = (R - L) / (b - a), sy = (B - T) / (hi - lo);
    if (s.equal) {                                      // misma escala en x y en y (círculos redondos)
      var k = Math.min(sx, sy), cx = (a + b) / 2, cy = (lo + hi) / 2;
      sx = sy = k; a = cx - (R - L) / (2 * k); b = cx + (R - L) / (2 * k); lo = cy - (B - T) / (2 * k); hi = cy + (B - T) / (2 * k);
    }
    var X = function (x) { return L + (x - a) * sx; }, Y = function (y) { return B - (y - lo) * sy; };
    var body = '', y0 = lo <= 0 && hi >= 0 ? Y(0) : B, x0 = a <= 0 && b >= 0 ? X(0) : L;
    // Áreas y rectángulos primero (debajo de las curvas).
    if (s.shade) {
      var sh = s.shade, g = sh.g || function () { return 0; }, d = '', n = 80, i;
      for (i = 0; i <= n; i++) { var xx = sh.a + (sh.b - sh.a) * i / n; d += (i ? 'L' : 'M') + f1(X(xx)) + ' ' + f1(Y(sh.f(xx))); }
      for (i = n; i >= 0; i--) { var xg = sh.a + (sh.b - sh.a) * i / n; d += 'L' + f1(X(xg)) + ' ' + f1(Y(g(xg))); }
      body += '<path class="area-fill" d="' + d + 'Z"/>';
    }
    if (s.rects) {
      var rc = s.rects, h = (rc.b - rc.a) / rc.n;
      for (var j = 0; j < rc.n; j++) { var xl = rc.a + j * h, yv = rc.f(xl); body += '<rect class="rect-fill" x="' + f1(X(xl)) + '" y="' + f1(Math.min(Y(yv), Y(0))) + '" width="' + f1(h * sx) + '" height="' + f1(Math.abs(Y(yv) - Y(0))) + '"/>'; }
    }
    // Ejes con marcas.
    body += line('axis', L, y0, R, y0, 1.4) + line('axis', x0, T, x0, B, 1.4);
    ticks(a, b, 5).forEach(function (t) { if (Math.abs(X(t) - x0) < 2 && t !== 0) return; body += line('axis', X(t), y0 - 4, X(t), y0 + 4, 1.2) + text(X(t), Math.min(y0 + 18, H - 4), num(t), ' text-anchor="middle" font-size="13"'); });
    ticks(lo, hi, 4).forEach(function (t) { if (t === 0) return; body += line('axis', x0 - 4, Y(t), x0 + 4, Y(t), 1.2) + text(x0 - 8, Y(t) + 4, num(t), ' text-anchor="end" font-size="13"'); });
    if (s.xlab) body += text(R, y0 - 8, s.xlab, ' text-anchor="end" font-size="15"');
    if (s.ylab) body += text(x0 + 8, T + 12, s.ylab, ' font-size="15"');
    (s.hlines || []).forEach(function (hl) { body += line('axis', L, Y(hl.y), R, Y(hl.y), 1.3, '5 6') + (hl.label ? text(R, Y(hl.y) - 6, hl.label, ' text-anchor="end" font-size="14"') : ''); });
    (s.vlines || []).forEach(function (vl) { body += line('axis', X(vl.x), T, X(vl.x), B, 1.3, '5 6') + (vl.label ? text(X(vl.x) + 5, T + 14, vl.label, ' font-size="14"') : ''); });
    // Curvas (el trazo se corta donde la función no existe).
    fns.forEach(function (F) {
      var d = '', pen = false;
      for (var i = 0; i <= 240; i++) {
        var x = a + (b - a) * i / 240, y = F.f(x);
        if (!isFinite(y) || y < lo - (hi - lo) || y > hi + (hi - lo)) { pen = false; continue; }
        d += (pen ? 'L' : 'M') + f1(X(x)) + ' ' + f1(Y(y)); pen = true;
      }
      body += '<path class="' + (F.cls || 'ref') + '" fill="none" stroke-width="' + (F.w || 3) + '"' + (F.dash ? ' stroke-dasharray="' + F.dash + '"' : '') + ' d="' + d + '"/>';
      if (F.label) { var xl = F.at != null ? F.at : a + (b - a) * 0.82; body += text(X(xl) + 6, Y(F.f(xl)) - 10, F.label, ' font-size="15"'); }
    });
    // Curvas paramétricas (círculos completos, sin huecos donde la gráfica es vertical).
    (s.curves || []).forEach(function (C) {
      var d = '';
      for (var i = 0; i <= 240; i++) { var p = C.xy(C.t0 + (C.t1 - C.t0) * i / 240); d += (i ? 'L' : 'M') + f1(X(p[0])) + ' ' + f1(Y(p[1])); }
      body += '<path class="' + (C.cls || 'ref') + '" fill="none" stroke-width="' + (C.w || 3) + '" d="' + d + '"/>';
    });
    if (s.secant) {
      var sc = s.secant, ya = sc.f(sc.x1), yb = sc.f(sc.x2), m = (yb - ya) / (sc.x2 - sc.x1), ext = (sc.x2 - sc.x1) * 0.35;
      body += line('error', X(sc.x1 - ext), Y(ya - m * ext), X(sc.x2 + ext), Y(yb + m * ext), 2.2, '7 5') +
        '<circle class="dot-error" cx="' + f1(X(sc.x1)) + '" cy="' + f1(Y(ya)) + '" r="5"/><circle class="dot-error" cx="' + f1(X(sc.x2)) + '" cy="' + f1(Y(yb)) + '" r="5"/>';
    }
    if (s.tangent) {
      var tg = s.tangent, yt = tg.f(tg.x0), mt = (tg.f(tg.x0 + 1e-5) - tg.f(tg.x0 - 1e-5)) / 2e-5, len = tg.len || (b - a) * 0.22;
      body += line('aux', X(tg.x0 - len), Y(yt - mt * len), X(tg.x0 + len), Y(yt + mt * len), 2.6) + '<circle class="dot-ref" cx="' + f1(X(tg.x0)) + '" cy="' + f1(Y(yt)) + '" r="5"/>';
    }
    (s.pts || []).forEach(function (p) {
      body += '<circle class="dot-ref" cx="' + f1(X(p.x)) + '" cy="' + f1(Y(p.y)) + '" r="5"/>' + (p.label ? text(X(p.x) + 8, Y(p.y) - 9, p.label, ' font-size="14"') : '');
    });
    return svg(W, H, s.label || 'Gráfica del problema', body);
  };

  /* ---------- Escalera apoyada en una pared ---------- */
  D['exam-ladder'] = function (s) {
    var L = s.L, x = s.x != null ? s.x : L * Math.cos((s.th || 60) * Math.PI / 180), y = Math.sqrt(Math.max(L * L - x * x, 0));
    var k = 210 / L, ox = 150, oy = 262;
    var body = line('axis', ox, 30, ox, oy, 5) + line('axis', ox, oy, 600, oy, 3) +
      line('ref', ox + x * k, oy, ox, oy - y * k, 6) +
      text(ox + x * k / 2, oy + 22, s.xlab || 'x', ' text-anchor="middle" font-size="16"') + text(ox - 10, oy - y * k / 2, s.ylab || 'y', ' text-anchor="end" font-size="16"') +
      text(ox + x * k / 2 + 16, oy - y * k / 2 - 6, s.Llab || ('L = ' + L + ' m'), ' font-size="16"');
    if (s.u) body += arrow('aux', ox + x * k + 12, oy - 14, ox + x * k + 70, oy - 14, 3) + text(ox + x * k + 76, oy - 10, s.u, ' font-size="15"');
    if (s.th) body += text(ox + x * k - 44, oy - 8, s.th + '°', ' font-size="15"');
    if (s.person) { var px = ox + x * k * (1 - s.person), py = oy - y * k * s.person; body += '<circle class="dot-ref" cx="' + f1(px) + '" cy="' + f1(py - 10) + '" r="8"/>' + text(px + 14, py - 4, 'persona', ' font-size="14"'); }
    return svg(640, 290, 'Una escalera apoyada en una pared.', body);
  };

  /* ---------- Terreno rectangular junto a un río ---------- */
  D['exam-river-field'] = function () {
    var body = '<path class="trace" d="M40 60 Q 180 40 320 60 T 600 60" fill="none" stroke-width="3"/>' + text(320, 38, 'río (sin cerca)', ' text-anchor="middle" font-size="15"') +
      '<path class="ref" d="M170 70 V230 H470 V70" fill="none" stroke-width="3.5"/>' +
      text(160, 155, 'x', ' text-anchor="end" font-size="18"') + text(482, 155, 'x', ' font-size="18"') + text(320, 254, 'y', ' text-anchor="middle" font-size="18"');
    return svg(640, 270, 'Un terreno rectangular con un lado sobre el río; se cercan los otros tres lados.', body);
  };

  /* ---------- Lata cilíndrica ---------- */
  D['exam-can'] = function () {
    var body = '<ellipse class="box-ref" cx="320" cy="70" rx="90" ry="22"/>' + '<path class="box-aux" d="M230 70 V230 A90 22 0 0 0 410 230 V70 A90 22 0 0 1 230 70 Z"/>' +
      '<ellipse class="box-ref" cx="320" cy="70" rx="90" ry="22"/>' + line('axis', 320, 70, 410, 70, 1.6) + text(365, 62, 'r', ' text-anchor="middle" font-size="17"') +
      line('axis', 440, 70, 440, 230, 1.4) + text(452, 155, 'h', ' font-size="17"') + text(520, 70, 'tapas: el doble', ' text-anchor="middle" font-size="14"');
    return svg(640, 270, 'Una lata cilíndrica de radio r y altura h.', body);
  };

  /* ---------- Globo que se infla ---------- */
  D['exam-balloon'] = function (s) {
    var body = '<circle class="box-aux" cx="260" cy="140" r="' + f1(s.r1) + '"/><circle class="axis" cx="260" cy="140" r="' + f1(s.r0) + '" fill="none" stroke-width="1.5" stroke-dasharray="5 6"/>' +
      line('ref', 260, 140, 260 + s.r1, 140, 2.2) + text(260 + s.r1 / 2, 132, 'r(t)', ' text-anchor="middle" font-size="15"') +
      arrow('aux', 260 + s.r1 + 8, 140, 260 + s.r1 + 50, 140, 3) + text(470, 90, 'V = 4πr³/3', ' font-size="16"') + text(470, 118, 'el radio crece', ' font-size="14"');
    return svg(640, 270, 'Un globo esférico que se infla: su radio crece con el tiempo.', body);
  };
})();
