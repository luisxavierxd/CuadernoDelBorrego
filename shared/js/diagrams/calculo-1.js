/* =====================================================================
   Diagramas de Cálculo 1: window.Diagrams[id](state) → SVG (string).
   Solo clases de rol (.ref .student .error .aux .trace .axis .ann .area-fill);
   los colores salen de tokens.css. El explainer interpola los campos numéricos
   de `state` entre pasos y vuelve a llamar a la función.
   ===================================================================== */
(function () {
  var D = window.Diagrams = window.Diagrams || {};

  function path(fn, x0, x1, X, Y, n) {
    var d = '';
    n = n || 120;
    for (var i = 0; i <= n; i++) {
      var x = x0 + (x1 - x0) * i / n;
      d += (i ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(fn(x)).toFixed(1);
    }
    return d;
  }
  function svg(vb, label, body) {
    return '<svg viewBox="' + vb + '" role="img" aria-label="' + label + '"><g class="sketch">' + body + '</g></svg>';
  }
  function text(x, y, s, extra) {
    return '<text class="ann" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '"' + (extra || '') + '>' + s + '</text>';
  }

  /* ---------- Familia de antiderivadas F(x) + C ---------- */
  D['antiderivative-family'] = function () {
    var X = function (x) { return 300 + x * 120; };
    var Y = function (y) { return 205 - y * 45; };
    var F = function (x) { return x * x * x / 3 - x; };
    var f = function (x) { return x * x - 1; };
    var x0 = 1.5, m = f(x0), dx = 0.42;
    var body = '<path class="axis" d="M' + X(-2.35) + ' ' + Y(0) + 'H' + X(2.35) + 'M' + X(0) + ' ' + Y(-2.6) + 'V' + Y(3.7) + '" stroke-width="1.5" fill="none"/>';
    [-1, 0, 1, 2].forEach(function (C) {
      body += '<path class="ref' + (C === 0 ? '' : ' is-faint') + '" d="' + path(function (x) { return F(x) + C; }, -2.2, 2.2, X, Y) + '" fill="none" stroke-width="' + (C === 0 ? 3.5 : 2.5) + '" stroke-linecap="round"/>';
      var y0 = F(x0) + C;
      body += '<path class="aux" d="M' + X(x0 - dx) + ' ' + Y(y0 - m * dx) + 'L' + X(x0 + dx) + ' ' + Y(y0 + m * dx) + '" stroke-width="3" stroke-linecap="round"/>';
      body += '<circle class="dot-aux" cx="' + X(x0) + '" cy="' + Y(y0) + '" r="4.5"/>';
      body += text(X(-2.2) - 6, Y(F(-2.2) + C) + 5, 'C = ' + C, ' text-anchor="end" font-size="17"');
    });
    body += '<path class="axis" d="M' + X(x0) + ' ' + Y(-2.5) + 'V' + Y(3.6) + '" stroke-dasharray="4 6" stroke-width="1.2"/>';
    body += text(X(x0), Y(-2.5) + 22, 'x₀', ' text-anchor="middle" font-size="18"');
    body += text(X(0.15), Y(3.35), 'misma x₀ → misma pendiente f(x₀)', ' font-size="19"');
    return svg('0 0 600 360', 'Cuatro curvas F(x) + C desplazadas verticalmente; en el mismo x₀ sus tangentes son paralelas.', body);
  };

  /* ---------- Cambio de variable: el área se conserva ----------
     state.t: 0 = plano x con f(x) = 2x cos(x²);  1 = plano u = x² con cos(u). */
  D['substitution-area'] = function (s) {
    var t = Math.max(0, Math.min(1, s && s.t != null ? s.t : 0));
    var b = 1.6;
    var X = function (x) { return 64 + x * 182; };
    var Y = function (y) { return 150 - y * 68; };
    var px = function (x) { return (1 - t) * x + t * x * x; };
    var py = function (x) { return (1 - t) * 2 * x * Math.cos(x * x) + t * Math.cos(x * x); };
    var n = 140, curve = '', area = 'M' + X(0) + ' ' + Y(0);
    for (var i = 0; i <= n; i++) {
      var x = b * i / n;
      var p = X(px(x)).toFixed(1) + ' ' + Y(py(x)).toFixed(1);
      curve += (i ? 'L' : 'M') + p;
      area += 'L' + p;
    }
    area += 'L' + X(px(b)) + ' ' + Y(0) + 'Z';
    var xLabel = t < 0.5 ? 'x' : 'u = x²';
    var fLabel = t < 0.5 ? 'f(x) = 2x·cos(x²)' : 'g(u) = cos(u)';
    var endLabel = t < 0.5 ? 'b = 1.6' : 'b² = 2.56';
    var body =
      '<path class="area-fill" d="' + area + '"/>' +
      '<path class="axis" d="M' + X(-0.15) + ' ' + Y(0) + 'H' + X(2.85) + 'M' + X(0) + ' ' + Y(-2.95) + 'V' + Y(1.75) + '" stroke-width="1.5" fill="none"/>' +
      '<path class="ref" d="' + curve + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path class="axis" d="M' + X(px(b)) + ' ' + (Y(0) - 8) + 'V' + (Y(0) + 8) + '" stroke-width="2"/>' +
      text(X(px(b)), Y(0) - 14, endLabel, ' text-anchor="middle" font-size="18"') +
      text(X(2.85), Y(0) + 24, xLabel, ' text-anchor="end" font-size="20"') +
      text(X(0.12), Y(1.5), fLabel, ' font-size="20"') +
      text(X(1.25), Y(-2.55), 'área neta = sin(2.56) ≈ 0.549', ' font-size="19"');
    if (t > 0.15 && t < 0.85) body += text(X(0.9), Y(1.05), 'la base se estira: du = 2x·dx', ' font-size="18"');
    return svg('0 0 600 370', 'Área bajo f(x) = 2x cos(x²) entre 0 y 1.6 que se transforma en el área bajo cos(u) entre 0 y 2.56; el área neta es la misma.', body);
  };

  /* ---------- Problemas de examen ---------- */
  // Caudal r(t) = c t/(t² + 1): el área es el volumen; máximo en t = 1.
  D['exam-caudal'] = function (s) {
    var c = s.c || 4, T = s.T || 4;
    var r = function (t) { return c * t / (t * t + 1); };
    var X = function (t) { return 60 + t * 500 / T; };
    var Y = function (y) { return 250 - y * 190 / (c / 2); };
    var area = 'M' + X(0) + ' ' + Y(0) + path(r, 0, T, X, Y, 160).replace(/^M/, 'L') + 'L' + X(T) + ' ' + Y(0) + 'Z';
    var body =
      '<path class="area-fill" d="' + area + '"/>' +
      '<path class="axis" d="M' + X(0) + ' ' + Y(0) + 'H' + (X(T) + 20) + 'M' + X(0) + ' ' + Y(0) + 'V' + (Y(c / 2) - 20) + '" stroke-width="1.5" fill="none"/>' +
      '<path class="ref" d="' + path(r, 0, T, X, Y, 160) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path class="axis" d="M' + X(1) + ' ' + Y(c / 2) + 'V' + Y(0) + '" stroke-dasharray="4 6" stroke-width="1.2"/>' +
      '<circle class="dot-ref" cx="' + X(1) + '" cy="' + Y(c / 2) + '" r="5"/>' +
      text(X(1) + 10, Y(c / 2) - 10, 'máximo', ' font-size="18"') +
      text(X(T), Y(0) + 24, 't = ' + T + ' min', ' text-anchor="end" font-size="18"') +
      text(X(T * 0.55), Y(c / 8), 'V = área', ' text-anchor="middle" font-size="20"') +
      text(X(0) + 8, Y(c / 2) - 22, 'r(t) en L/min', ' font-size="18"');
    return svg('0 0 600 290', 'Gráfica del caudal r(t): sube hasta un máximo en t = 1 y luego baja; el área bajo la curva hasta t = ' + T + ' es el volumen.', body);
  };

  // Velocidad v(t) = k t cos(t²): positiva, se detiene en √(π/2) y regresa.
  D['exam-velocidad'] = function (s) {
    var k = s.k || 3, T = s.T || 1.8;
    var v = function (t) { return k * t * Math.cos(t * t); };
    var M = k * T;
    var X = function (t) { return 60 + t * 500 / T; };
    var Y = function (y) { return 145 - y * 110 / M; };
    var ts = Math.sqrt(Math.PI / 2);
    var fill = function (a, b) { return 'M' + X(a) + ' ' + Y(0) + path(v, a, b, X, Y, 80).replace(/^M/, 'L') + 'L' + X(b) + ' ' + Y(0) + 'Z'; };
    var body =
      '<path class="area-fill" d="' + fill(0, ts) + '"/>' +
      '<path class="area-fill area-fill--neg" d="' + fill(ts, T) + '"/>' +
      '<path class="axis" d="M' + X(0) + ' ' + Y(0) + 'H' + (X(T) + 20) + 'M' + X(0) + ' ' + Y(-M) + 'V' + Y(M) + '" stroke-width="1.5" fill="none"/>' +
      '<path class="ref" d="' + path(v, 0, T, X, Y, 160) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '<circle class="dot-aux" cx="' + X(ts) + '" cy="' + Y(0) + '" r="5"/>' +
      text(X(ts), Y(0) - 12, 'v = 0', ' text-anchor="middle" font-size="18"') +
      text(X(T), Y(0) + 24, 't = ' + T + ' s', ' text-anchor="end" font-size="18"') +
      text(X(0) + 8, Y(M) + 6, 'v(t) en m/s', ' font-size="18"');
    return svg('0 0 600 290', 'Gráfica de la velocidad v(t): positiva hasta que se detiene en t = √(π/2); luego negativa, el robot regresa.', body);
  };

  /* ================= Bloque A · Derivada (S01–S06) ================= */
  function arrowHead(x, y, ang, cls) {
    var a1 = ang + 2.6, a2 = ang - 2.6, L = 10;
    return '<path class="' + cls + '" fill="none" stroke-width="2.5" stroke-linecap="round" d="M' + (x + L * Math.cos(a1)).toFixed(1) + ' ' + (y + L * Math.sin(a1)).toFixed(1) + 'L' + x.toFixed(1) + ' ' + y.toFixed(1) + 'L' + (x + L * Math.cos(a2)).toFixed(1) + ' ' + (y + L * Math.sin(a2)).toFixed(1) + '"/>';
  }

  // S01 · Razón de cambio promedio: pendiente de la secante entre dos instantes.
  D['rate-of-change'] = function () {
    var s = function (t) { return 0.35 * t * t + 0.4 * t; };
    // s(5.4) ≈ 12.4: la escala vertical cabe completa en el recuadro
    var X = function (t) { return 60 + t * 92; }, Y = function (y) { return 300 - y * 20; };
    var a = 1.5, b = 4.5, m = (s(b) - s(a)) / (b - a);
    var body =
      '<path class="axis" d="M' + X(0) + ' ' + Y(0) + 'H' + X(5.9) + 'M' + X(0) + ' ' + Y(0) + 'V' + Y(13.5) + '" stroke-width="1.5" fill="none"/>' +
      '<path class="ref" d="' + path(s, 0, 5.4, X, Y) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path class="aux" d="M' + X(a - 0.8) + ' ' + Y(s(a) - 0.8 * m) + 'L' + X(b + 0.7) + ' ' + Y(s(b) + 0.7 * m) + '" stroke-width="3"/>' +
      '<path class="axis" d="M' + X(a) + ' ' + Y(s(a)) + 'H' + X(b) + 'V' + Y(s(b)) + '" stroke-dasharray="5 6" stroke-width="1.5" fill="none"/>' +
      '<circle class="dot-ref" cx="' + X(a) + '" cy="' + Y(s(a)) + '" r="6"/><circle class="dot-ref" cx="' + X(b) + '" cy="' + Y(s(b)) + '" r="6"/>' +
      text((X(a) + X(b)) / 2, Y(s(a)) + 24, 'Δt', ' text-anchor="middle" font-size="20"') +
      text(X(b) + 10, (Y(s(a)) + Y(s(b))) / 2, 'Δs', ' font-size="20"') +
      text(X(5.9), Y(0) + 24, 't (s)', ' text-anchor="end" font-size="18"') +
      text(X(0) + 8, Y(13.5) + 4, 's (m)', ' font-size="18"') +
      text(X(0.3), Y(11.4), 'rapidez media = Δs / Δt', ' font-size="20"') +
      text(X(0.3), Y(10.1), '= pendiente de la secante', ' font-size="18"');
    return svg('0 0 600 330', 'Gráfica de posición contra tiempo con una recta secante entre dos instantes; el triángulo muestra Δt y Δs.', body);
  };

  // S01 · explainer: la secante gira hacia la tangente cuando h → 0.
  D['secant-to-tangent'] = function (st) {
    var h = st && st.h != null ? st.h : 2;
    var f = function (x) { return x * x / 2 + 1; };
    var a = 1, X = function (x) { return 70 + (x + 0.6) * 118; }, Y = function (y) { return 320 - y * 44; };
    var m = (f(a + h) - f(a)) / h;
    var sec = function (x) { return f(a) + m * (x - a); }, tan = function (x) { return f(a) + (x - a); };
    var body =
      '<path class="axis" d="M' + X(-0.5) + ' ' + Y(0) + 'H' + X(3.8) + 'M' + X(0) + ' ' + Y(-0.3) + 'V' + Y(6.6) + '" stroke-width="1.5" fill="none"/>' +
      '<path class="ref" d="' + path(f, -0.5, 3.3, X, Y) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path class="trace" d="M' + X(-0.4) + ' ' + Y(tan(-0.4)) + 'L' + X(3.6) + ' ' + Y(tan(3.6)) + '" stroke-dasharray="6 7" stroke-width="1.6" opacity="0.7"/>' +
      '<path class="aux" d="M' + X(-0.4) + ' ' + Y(sec(-0.4)) + 'L' + X(3.6) + ' ' + Y(sec(3.6)) + '" stroke-width="3"/>' +
      '<circle class="dot-ref" cx="' + X(a) + '" cy="' + Y(f(a)) + '" r="6"/>' +
      '<circle class="dot-aux" cx="' + X(a + h) + '" cy="' + Y(f(a + h)) + '" r="6"/>' +
      '<path class="axis" d="M' + X(a) + ' ' + (Y(0) + 14) + 'H' + X(a + h) + '" stroke-width="1.5"/>' +
      text((X(a) + X(a + h)) / 2, Y(0) + 32, 'h = ' + (+h.toFixed(2)), ' text-anchor="middle" font-size="18"') +
      text(X(-0.4), Y(6.2), 'pendiente de la secante: ' + (+m.toFixed(3)), ' font-size="20"') +
      text(X(-0.4), Y(5.5), 'tangente (punteada): 1', ' font-size="18"');
    return svg('0 0 600 360', 'Curva con una secante por x = 1 y x = 1 + h; al hacer h pequeño, la secante se acerca a la tangente punteada.', body);
  };

  // S02 · f y f′ alineadas: donde f′ = 0 la tangente es horizontal.
  D['derivative-graph'] = function () {
    var f = function (x) { return x * x * x - 3 * x; }, d = function (x) { return 3 * x * x - 3; };
    var X = function (x) { return 300 + x * 110; };
    var Yf = function (y) { return 110 - y * 20; }, Yd = function (y) { return 290 - y * 13; };
    var body =
      '<path class="axis" d="M' + X(-2.5) + ' ' + Yf(0) + 'H' + X(2.5) + 'M' + X(-2.5) + ' ' + Yd(0) + 'H' + X(2.5) + '" stroke-width="1.5" fill="none"/>' +
      '<path class="ref" d="' + path(f, -2.2, 2.2, X, Yf) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path class="error" d="' + path(d, -1.95, 1.95, X, Yd) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path class="axis" d="M' + X(-1) + ' ' + Yf(2) + 'V' + Yd(0) + 'M' + X(1) + ' ' + Yf(-2) + 'V' + Yd(0) + '" stroke-dasharray="4 6" stroke-width="1.2"/>' +
      '<path class="aux" d="M' + X(-1.4) + ' ' + Yf(2) + 'H' + X(-0.6) + 'M' + X(0.6) + ' ' + Yf(-2) + 'H' + X(1.4) + '" stroke-width="3"/>' +
      text(X(-2.45), Yf(3.2), 'f(x) = x³ − 3x', ' font-size="19"') +
      text(X(-2.45), Yd(6.2), 'f′(x) = 3x² − 3', ' font-size="19"') +
      text(X(1.05), Yd(0) - 8, 'f′ = 0', ' font-size="17"') +
      text(X(1.6), Yd(3.5), 'f′ > 0: f sube', ' font-size="17"') +
      text(X(-0.55), Yd(-2.2), 'f′ < 0: f baja', ' font-size="17"');
    return svg('0 0 600 340', 'Arriba la gráfica de f(x) = x³ − 3x; abajo su derivada 3x² − 3. En x = ±1 la derivada vale cero y la tangente de f es horizontal.', body);
  };

  // S03 · Regla del producto como área: d(uv) = v·du + u·dv (+ du·dv, despreciable).
  D['product-area'] = function (st) {
    var step = st && st.step != null ? st.step : 0;
    var x = 70, y = 70, w = 300, hgt = 170, du = 70, dv = 50;
    var rect = function (cls, rx, ry, rw, rh) { return '<rect class="' + cls + '" x="' + rx + '" y="' + ry + '" width="' + rw + '" height="' + rh + '"/>'; };
    var body = rect('box-base', x, y + dv, w, hgt);
    body += text(x + w / 2, y + dv + hgt / 2 + 8, 'u · v', ' text-anchor="middle" font-size="26"');
    if (step >= 1) body += rect('box-aux', x + w, y + dv, du, hgt) + text(x + w + du / 2, y + dv + hgt / 2 + 6, 'v·du', ' text-anchor="middle" font-size="19"');
    if (step >= 2) body += rect('box-ref', x, y, w, dv) + text(x + w / 2, y + dv / 2 + 6, 'u·dv', ' text-anchor="middle" font-size="19"');
    if (step >= 3) body += rect('box-err', x + w, y, du, dv) + text(x + w + du + 10, y + dv / 2 + 6, 'du·dv → 0', ' font-size="17"');
    body += '<path class="axis" d="M' + x + ' ' + (y + dv + hgt + 18) + 'H' + (x + w) + 'M' + (x - 18) + ' ' + (y + dv) + 'V' + (y + dv + hgt) + '" stroke-width="1.5"/>';
    body += text(x + w / 2, y + dv + hgt + 40, 'u', ' text-anchor="middle" font-size="20"') + text(x - 30, y + dv + hgt / 2, 'v', ' text-anchor="middle" font-size="20"');
    return svg('0 0 600 330', 'Un rectángulo de lados u y v. Al crecer u en du y v en dv, el área crece en v·du más u·dv; la esquina du·dv es despreciable.', body);
  };

  // S04 · Cociente x/(x² + 1): tangentes horizontales en x = ±1.
  D['quotient-graph'] = function () {
    var f = function (x) { return x / (x * x + 1); };
    var X = function (x) { return 300 + x * 62; }, Y = function (y) { return 170 - y * 180; };
    var body =
      '<path class="axis" d="M' + X(-4.6) + ' ' + Y(0) + 'H' + X(4.6) + 'M' + X(0) + ' ' + Y(-0.72) + 'V' + Y(0.72) + '" stroke-width="1.5" fill="none"/>' +
      '<path class="ref" d="' + path(f, -4.5, 4.5, X, Y) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path class="aux" d="M' + X(0.3) + ' ' + Y(0.5) + 'H' + X(1.7) + 'M' + X(-1.7) + ' ' + Y(-0.5) + 'H' + X(-0.3) + '" stroke-width="3"/>' +
      '<path class="aux" d="M' + X(-0.45) + ' ' + Y(-0.45) + 'L' + X(0.45) + ' ' + Y(0.45) + '" stroke-width="3"/>' +
      '<circle class="dot-aux" cx="' + X(1) + '" cy="' + Y(0.5) + '" r="5"/><circle class="dot-aux" cx="' + X(-1) + '" cy="' + Y(-0.5) + '" r="5"/>' +
      text(X(1.2), Y(0.5) - 12, 'f′(1) = 0', ' font-size="18"') +
      text(X(-1.2), Y(-0.5) + 26, 'f′(−1) = 0', ' text-anchor="end" font-size="18"') +
      text(X(0.35), Y(0.12), 'f′(0) = 1', ' font-size="18"') +
      text(X(2.2), Y(0.62), 'f(x) = x / (x² + 1)', ' font-size="19"');
    return svg('0 0 600 330', 'Gráfica de x/(x² + 1) con sus tangentes horizontales en x = 1 y x = −1 y la tangente de pendiente 1 en el origen.', body);
  };

  // S05 · Regla de la cadena como capas: dx → du = h′·dx → dy = g′·du.
  D['chain-layers'] = function (st) {
    var stage = st && st.stage != null ? st.stage : 0;
    var rows = [{ y: 70, w: 60, name: 'x', note: 'dx' }, { y: 180, w: 120, name: 'u = h(x)', note: 'du = h′(x)·dx' }, { y: 290, w: 180, name: 'y = g(u)', note: 'dy = g′(u)·du' }];
    var cx = 360, body = '';
    rows.forEach(function (r, i) {
      if (i > stage) return;
      body += '<path class="axis" d="M' + 200 + ' ' + r.y + 'H560" stroke-width="1.5"/>';
      body += '<path class="aux" d="M' + (cx - r.w / 2) + ' ' + r.y + 'H' + (cx + r.w / 2) + '" stroke-width="8" stroke-linecap="round"/>';
      body += text(190, r.y + 6, r.name, ' text-anchor="end" font-size="20"');
      body += text(cx, r.y - 16, r.note, ' text-anchor="middle" font-size="18"');
      if (i > 0) body += '<path class="axis" d="M' + (cx - rows[i - 1].w / 2) + ' ' + (rows[i - 1].y + 10) + 'L' + (cx - r.w / 2) + ' ' + (r.y - 10) + 'M' + (cx + rows[i - 1].w / 2) + ' ' + (rows[i - 1].y + 10) + 'L' + (cx + r.w / 2) + ' ' + (r.y - 10) + '" stroke-dasharray="4 5" fill="none"/>';
    });
    if (stage >= 2) body += text(360, 335, 'dy/dx = g′(u) · h′(x)', ' text-anchor="middle" font-size="22"');
    return svg('0 0 600 350', 'Tres rectas numéricas: un tramo dx se estira a du = h′(x)dx y luego a dy = g′(u)du; las razones se multiplican.', body);
  };

  // S06 · Tangente a un círculo: y′ = −x/y.
  D['implicit-circle'] = function (st) {
    var t = st && st.t != null ? st.t : 0.93;
    var R = 5, px = R * Math.cos(t), py = R * Math.sin(t), m = -px / py;
    var X = function (x) { return 300 + x * 26; }, Y = function (y) { return 170 - y * 26; };
    var body =
      '<path class="axis" d="M' + X(-6.5) + ' ' + Y(0) + 'H' + X(6.5) + 'M' + X(0) + ' ' + Y(-6.2) + 'V' + Y(6.2) + '" stroke-width="1.5" fill="none"/>' +
      '<circle class="ref" cx="' + X(0) + '" cy="' + Y(0) + '" r="' + (R * 26) + '" fill="none" stroke-width="3.5"/>' +
      '<path class="axis" d="M' + X(0) + ' ' + Y(0) + 'L' + X(px) + ' ' + Y(py) + '" stroke-dasharray="4 5" stroke-width="1.4"/>' +
      '<path class="aux" d="M' + X(px - 3 * Math.cos(Math.atan(m))) + ' ' + Y(py - 3 * Math.sin(Math.atan(m))) + 'L' + X(px + 3 * Math.cos(Math.atan(m))) + ' ' + Y(py + 3 * Math.sin(Math.atan(m))) + '" stroke-width="3"/>' +
      '<circle class="dot-aux" cx="' + X(px) + '" cy="' + Y(py) + '" r="6"/>' +
      text(X(-6.3), Y(5.6), 'x² + y² = 25', ' font-size="20"') +
      text(X(-6.3), Y(4.7), 'y′ = −x/y = ' + (Math.abs(py) > 0.05 ? (+m.toFixed(2)) : '∞'), ' font-size="20"') +
      text(X(px) + 10, Y(py) - 10, '(' + (+px.toFixed(1)) + ', ' + (+py.toFixed(1)) + ')', ' font-size="17"');
    return svg('0 0 600 340', 'Círculo de radio 5 con un punto y su recta tangente, perpendicular al radio; la pendiente es −x/y.', body);
  };
})();
