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

  /* ---------- Problemas de examen · bloque A ---------- */
  // Marco común: [x0, x1] × [y0, y1] dentro de un lienzo de 600 × 290.
  function frame(x0, x1, y0, y1) {
    var X = function (x) { return 60 + (x - x0) * 500 / (x1 - x0); };
    var Y = function (y) { return 250 - (y - y0) * 210 / (y1 - y0); };
    var axes = '<path class="axis" d="M' + X(x0) + ' ' + Y(Math.max(y0, Math.min(0, y1))) + 'H' + (X(x1) + 14) + 'M' + X(Math.max(x0, Math.min(0, x1))) + ' ' + (Y(y0) + 6) + 'V' + (Y(y1) - 12) + '" stroke-width="1.5" fill="none"/>';
    return { X: X, Y: Y, axes: axes };
  }
  function line(F, m, x, y, x0, x1, cls) {
    return '<path class="' + cls + '" d="M' + F.X(x0).toFixed(1) + ' ' + F.Y(y + m * (x0 - x)).toFixed(1) + 'L' + F.X(x1).toFixed(1) + ' ' + F.Y(y + m * (x1 - x)).toFixed(1) + '" stroke-width="3" stroke-linecap="round" fill="none"/>';
  }

  // Dron: h(t) = p t² + q t; secante desde 0 y tangente en T.
  D['exam-dron'] = function (s) {
    var p = s.p || 2, q = s.q || 3, T = s.T || 4;
    var h = function (t) { return p * t * t + q * t; };
    var F = frame(0, T * 1.1, 0, h(T) * 1.15);
    var body = F.axes +
      '<path class="ref" d="' + path(h, 0, T * 1.1, F.X, F.Y) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      line(F, h(T) / T, 0, 0, 0, T, 'aux') +
      line(F, 2 * p * T + q, T, h(T), T * 0.65, T * 1.1, 'student') +
      '<circle class="dot-ref" cx="' + F.X(T) + '" cy="' + F.Y(h(T)) + '" r="5"/>' +
      text(F.X(T * 0.3) - 6, F.Y(h(T) * 0.3) - 12, 'secante (promedio)', ' text-anchor="end" font-size="17"') +
      text(F.X(T) - 14, F.Y(h(T)) - 12, 'tangente en t = ' + T, ' text-anchor="end" font-size="17"') +
      text(F.X(0) + 8, F.Y(h(T) * 1.15) + 4, 'h(t) en m', ' font-size="17"');
    return svg('0 0 600 290', 'Altura del dron contra el tiempo, con la secante desde t = 0 y la tangente en t = ' + T + ', más empinada.', body);
  };

  // Cúbica x³ − kx con su tangente en x = a.
  D['exam-tangente'] = function (s) {
    var a = s.a || 2, k = s.k || 3;
    var f = function (x) { return x * x * x - k * x; };
    var m = 3 * a * a - k, L = a + 1.2;
    var F = frame(-L, L, f(-L) * 1.05, f(L) * 1.05);
    var body = F.axes +
      '<path class="ref" d="' + path(f, -L, L, F.X, F.Y) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      line(F, m, a, f(a), Math.max(-L, a - 1.2), Math.min(L, a + 0.8), 'aux') +
      '<circle class="dot-aux" cx="' + F.X(a) + '" cy="' + F.Y(f(a)) + '" r="5"/>' +
      text(F.X(a) + 10, F.Y(f(a)) + 22, 'x = ' + a, ' font-size="17"') +
      text(F.X(-L) + 6, F.Y(f(L) * 1.05) + 16, 'f(x) = x³ − ' + k + 'x', ' font-size="18"');
    return svg('0 0 600 290', 'Cúbica f(x) = x³ − ' + k + 'x con su recta tangente en x = ' + a + '.', body);
  };

  // Costo promedio A(x) = F/x + b + 0.01x, mínimo en x = 10√F.
  D['exam-costo'] = function (s) {
    var Fc = s.F || 900, b = s.b || 10, x0 = s.x0 || 100;
    var A = function (x) { return Fc / x + b + 0.01 * x; };
    var xm = 10 * Math.sqrt(Fc), x1 = Math.max(2.2 * xm, x0 * 1.3), top = A(xm) * 2.2;
    var F = frame(0, x1, 0, top);
    var body = F.axes +
      '<path class="ref" d="' + path(A, Fc / (top - b), x1, F.X, F.Y) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '<circle class="dot-aux" cx="' + F.X(x0) + '" cy="' + F.Y(A(x0)) + '" r="5"/>' +
      text(F.X(x0) + 8, F.Y(A(x0)) - 10, 'x = ' + x0, ' font-size="17"') +
      text(F.X(x1), F.Y(top) + 4, 'A(x) en pesos por pieza', ' text-anchor="end" font-size="17"') +
      text(F.X(x1), F.Y(0) + 24, 'x (piezas)', ' text-anchor="end" font-size="17"');
    return svg('0 0 600 290', 'Costo promedio por pieza: baja, llega a un mínimo y vuelve a subir.', body);
  };

  // Bacterias N0·2^(t/d).
  D['exam-bacterias'] = function (s) {
    var N0 = s.N0 || 200, d = s.d || 3, T = s.T || 6;
    var N = function (t) { return N0 * Math.pow(2, t / d); };
    var F = frame(0, T * 1.1, 0, N(T * 1.1) * 1.05);
    var body = F.axes +
      '<path class="ref" d="' + path(N, 0, T * 1.1, F.X, F.Y) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>';
    for (var t = d; t <= T * 1.1; t += d) {
      body += '<path class="axis" d="M' + F.X(t) + ' ' + F.Y(0) + 'V' + F.Y(N(t)) + '" stroke-dasharray="4 6" stroke-width="1.2"/>' +
        text(F.X(t), F.Y(0) + 22, t + ' h', ' text-anchor="middle" font-size="16"');
    }
    body += text(F.X(0) + 8, F.Y(N(T * 1.1) * 1.05) + 4, 'N(t): se duplica cada ' + d + ' h', ' font-size="17"');
    return svg('0 0 600 290', 'Crecimiento exponencial de una colonia que se duplica cada ' + d + ' horas.', body);
  };

  // Temperatura diaria 20 + A sin(πt/12) con tangente en t0.
  D['exam-temperatura'] = function (s) {
    var A = s.A || 6, t0 = s.t0 || 3;
    var T = function (t) { return 20 + A * Math.sin(Math.PI * t / 12); };
    var m = A * Math.PI / 12 * Math.cos(Math.PI * t0 / 12);
    var F = frame(0, 24, 20 - A * 1.3, 20 + A * 1.4);
    var body = '<path class="axis" d="M' + F.X(0) + ' ' + F.Y(20) + 'H' + (F.X(24) + 14) + 'M' + F.X(0) + ' ' + (F.Y(20 - A * 1.3) + 6) + 'V' + (F.Y(20 + A * 1.4) - 12) + '" stroke-width="1.5" fill="none"/>' +
      '<path class="ref" d="' + path(T, 0, 24, F.X, F.Y) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      line(F, m, t0, T(t0), Math.max(0, t0 - 2.5), t0 + 2.5, 'aux') +
      '<circle class="dot-aux" cx="' + F.X(t0) + '" cy="' + F.Y(T(t0)) + '" r="5"/>' +
      text(F.X(24), F.Y(20) + 22, '24 h', ' text-anchor="end" font-size="16"') +
      text(F.X(0) + 8, F.Y(20) + 20, '20 °C', ' font-size="16"') +
      text(F.X(t0) + 12, F.Y(T(t0)) + 24, 't = ' + t0 + ' h', ' font-size="17"');
    return svg('0 0 600 290', 'Temperatura a lo largo del día: una onda alrededor de 20 °C, con la tangente en t = ' + t0 + ' h.', body);
  };

  // Elipse x² + xy + y² = c con la tangente en (p, q).
  D['exam-elipse'] = function (s) {
    var p = s.p || 1, q = s.q || 2, c = p * p + p * q + q * q;
    var R = Math.sqrt(2 * c) * 1.15, m = -(2 * p + q) / (p + 2 * q);
    var X = function (x) { return 300 + x * 125 / R; }, Y = function (y) { return 145 - y * 125 / R; };
    var d = '';
    for (var i = 0; i <= 120; i++) {
      var th = 2 * Math.PI * i / 120, u = Math.sqrt(2 * c / 3) * Math.cos(th), w = Math.sqrt(2 * c) * Math.sin(th);
      d += (i ? 'L' : 'M') + X((u + w) / Math.SQRT2).toFixed(1) + ' ' + Y((u - w) / Math.SQRT2).toFixed(1);
    }
    var dx = 0.45 * R / Math.sqrt(1 + m * m);
    var body = '<path class="axis" d="M' + X(-R) + ' ' + Y(0) + 'H' + X(R) + 'M' + X(0) + ' ' + Y(-R) + 'V' + Y(R) + '" stroke-width="1.5" fill="none"/>' +
      '<path class="ref" d="' + d + 'Z" fill="none" stroke-width="3.5"/>' +
      '<path class="aux" d="M' + X(p - dx).toFixed(1) + ' ' + Y(q - m * dx).toFixed(1) + 'L' + X(p + dx).toFixed(1) + ' ' + Y(q + m * dx).toFixed(1) + '" stroke-width="3" stroke-linecap="round"/>' +
      '<circle class="dot-aux" cx="' + X(p) + '" cy="' + Y(q) + '" r="5"/>' +
      text(X(p) + 12, Y(q) - 10, '(' + p + ', ' + q + ')', ' font-size="17"') +
      text(20, 30, 'x² + xy + y² = ' + c, ' font-size="18"');
    return svg('0 0 600 290', 'Elipse inclinada x² + xy + y² = ' + c + ' con su tangente en el punto (' + p + ', ' + q + ').', body);
  };

  // Lámpara a altura h sobre el piso; punto a distancia x de la base.
  D['exam-lampara'] = function (s) {
    var h = s.h || 4, x = s.x || 3, S = 200 / Math.max(h, x);
    var bx = 120, by = 260, lx = bx, ly = by - h * S, px = bx + x * S;
    var body = '<path class="axis" d="M40 ' + by + 'H560" stroke-width="2"/>' +
      '<path class="axis" d="M' + lx + ' ' + by + 'V' + ly + '" stroke-width="3"/>' +
      '<circle class="dot-ref" cx="' + lx + '" cy="' + ly + '" r="8"/>' +
      '<path class="aux" d="M' + lx + ' ' + ly + 'L' + px + ' ' + by + '" stroke-width="2.5" stroke-dasharray="6 5"/>' +
      '<circle class="dot-aux" cx="' + px + '" cy="' + by + '" r="5"/>' +
      text(lx - 12, (ly + by) / 2, 'h = ' + h + ' m', ' text-anchor="end" font-size="17"') +
      text((lx + px) / 2, by + 24, 'x = ' + x + ' m', ' text-anchor="middle" font-size="17"') +
      text((lx + px) / 2 + 14, (ly + by) / 2 - 6, 'd', ' font-size="18"');
    return svg('0 0 600 290', 'Lámpara a ' + h + ' m de altura; un punto del piso a ' + x + ' m de la base, a distancia d de la lámpara.', body);
  };

  /* ================= Bloque B · Optimización (S07–S08) ================= */
  function cubic3(x) { return x * x * x - 3 * x; }

  // S07 · Puntos críticos de x³ − 3x: tangentes horizontales en el máximo y el mínimo.
  D['critical-points'] = function () {
    var F = frame(-2.3, 2.3, -3.2, 3.2);
    var body = F.axes +
      '<path class="ref" d="' + path(cubic3, -2.2, 2.2, F.X, F.Y) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      line(F, 0, -1, 2, -1.7, -0.3, 'aux') + line(F, 0, 1, -2, 0.3, 1.7, 'aux') +
      '<circle class="dot-aux" cx="' + F.X(-1) + '" cy="' + F.Y(2) + '" r="6"/><circle class="dot-aux" cx="' + F.X(1) + '" cy="' + F.Y(-2) + '" r="6"/>' +
      text(F.X(-1), F.Y(2) - 14, 'máximo relativo · f′ = 0', ' text-anchor="middle" font-size="17"') +
      text(F.X(1), F.Y(-2) + 28, 'mínimo relativo · f′ = 0', ' text-anchor="middle" font-size="17"') +
      text(F.X(2.25), F.Y(3.2) + 16, 'f(x) = x³ − 3x', ' text-anchor="end" font-size="18"');
    return svg('0 0 600 290', 'Gráfica de x³ − 3x con tangentes horizontales en su máximo relativo (x = −1) y su mínimo relativo (x = 1).', body);
  };

  // S07 · El signo de f′: un cursor recorre x³ − 3x con su tangente y la tabla de signos abajo.
  D['fprime-sign'] = function (st) {
    var x = st && st.x != null ? st.x : -1.8, m = 3 * x * x - 3;
    var X = function (t) { return 60 + (t + 2.3) * 500 / 4.6; }, Y = function (y) { return 175 - y * 36; };
    var F = { X: X, Y: Y };
    var body = '<path class="axis" d="M' + X(-2.3) + ' ' + Y(0) + 'H' + X(2.3) + '" stroke-width="1.5" fill="none"/>' +
      '<path class="ref" d="' + path(cubic3, -2.1, 2.1, X, Y) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      line(F, m, x, cubic3(x), x - 70 / Math.hypot(108.7, 36 * m), x + 70 / Math.hypot(108.7, 36 * m), 'aux') +
      '<circle class="dot-aux" cx="' + X(x).toFixed(1) + '" cy="' + Y(cubic3(x)).toFixed(1) + '" r="6"/>';
    // Tabla de signos de f′ = 3(x + 1)(x − 1)
    var yb = 300;
    body += '<path class="axis" d="M' + X(-2.3) + ' ' + yb + 'H' + X(2.3) + '" stroke-width="1.5"/>';
    [[-2.3, -1, '+ · sube'], [-1, 1, '− · baja'], [1, 2.3, '+ · sube']].forEach(function (s) {
      body += text((X(s[0]) + X(s[1])) / 2, yb - 10, s[2], ' text-anchor="middle" font-size="17"');
    });
    [-1, 1].forEach(function (c) { body += '<path class="axis" d="M' + X(c) + ' ' + (yb - 6) + 'V' + (yb + 6) + '" stroke-width="2"/>' + text(X(c), yb + 24, String(c), ' text-anchor="middle" font-size="16"'); });
    body += '<path class="error" d="M' + X(x).toFixed(1) + ' ' + (yb - 26) + 'V' + (yb + 8) + '" stroke-width="2" stroke-dasharray="4 4"/>' +
      text(24, 30, 'f′(x) = ' + (Math.abs(m) < 0.05 ? '0' : m.toFixed(2).replace('-', '−')), ' font-size="19"') +
      text(24, yb + 24, 'signo de f′', ' font-size="15"');
    return svg('0 0 600 330', 'Un punto recorre x³ − 3x con su tangente; abajo, la tabla de signos de f′: positiva, negativa y positiva, con cambios en −1 y 1.', body);
  };

  // S07 · Concavidad de x³: ∩ a la izquierda, ∪ a la derecha, inflexión en 0.
  D['concavity'] = function () {
    var f = function (x) { return x * x * x; };
    var F = frame(-1.6, 1.6, -3.6, 3.6);
    var body = F.axes +
      '<path class="trace" d="' + path(f, -1.5, 0, F.X, F.Y) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path class="ref" d="' + path(f, 0, 1.5, F.X, F.Y) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '<circle class="dot-aux" cx="' + F.X(0) + '" cy="' + F.Y(0) + '" r="6"/>' +
      text(F.X(-0.9), F.Y(0.9), 'f″ < 0 · cóncava ∩', ' text-anchor="middle" font-size="17"') +
      text(F.X(0.9), F.Y(-0.9), 'f″ > 0 · cóncava ∪', ' text-anchor="middle" font-size="17"') +
      text(F.X(0) + 12, F.Y(0) - 12, 'inflexión', ' font-size="17"');
    return svg('0 0 600 290', 'Gráfica de x³: cóncava hacia abajo para x negativa, cóncava hacia arriba para x positiva, con inflexión en el origen.', body);
  };

  // S08 · Caja sin tapa: lámina de 30 con cuadros de lado x recortados, y V(x) a la derecha.
  D['box-cut'] = function (st) {
    var L = st && st.L ? st.L : 30, x = st && st.x != null ? st.x : L / 10, S = 222 / L, ox = 30, oy = 40;
    var V = function (t) { return t * (L - 2 * t) * (L - 2 * t); };
    var Vm = 2 * L * L * L / 27, xm = L / 6, lab = function (v) { return Number(v.toFixed(2)).toString(); };
    var body = '<rect class="axis" x="' + ox + '" y="' + oy + '" width="' + (L * S).toFixed(1) + '" height="' + (L * S).toFixed(1) + '" fill="none" stroke-width="2"/>';
    [[0, 0], [L - x, 0], [0, L - x], [L - x, L - x]].forEach(function (c) {
      body += '<rect class="error" x="' + (ox + c[0] * S).toFixed(1) + '" y="' + (oy + c[1] * S).toFixed(1) + '" width="' + (x * S).toFixed(1) + '" height="' + (x * S).toFixed(1) + '" fill="none" stroke-width="2" stroke-dasharray="5 4"/>';
    });
    body += '<rect class="aux" x="' + (ox + x * S).toFixed(1) + '" y="' + (oy + x * S).toFixed(1) + '" width="' + ((L - 2 * x) * S).toFixed(1) + '" height="' + ((L - 2 * x) * S).toFixed(1) + '" fill="none" stroke-width="2.5"/>' +
      text(ox + x * S / 2, oy - 8, 'x', ' text-anchor="middle" font-size="17"') +
      text(ox + L * S / 2, oy + L * S + 24, 'L = ' + L, ' text-anchor="middle" font-size="17"');
    var X = function (t) { return 320 + t * 260 / (L / 2); }, Y = function (v) { return 260 - v * 190 / (Vm * 1.1); };
    body += '<path class="axis" d="M' + X(0) + ' ' + Y(0) + 'H' + X(L / 2) + 'M' + X(0) + ' ' + Y(0) + 'V' + Y(Vm * 1.15) + '" stroke-width="1.5" fill="none"/>' +
      '<path class="ref" d="' + path(V, 0, L / 2, X, Y) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path class="trace" d="M' + X(xm) + ' ' + Y(0) + 'V' + Y(Vm) + '" stroke-width="1.5" stroke-dasharray="4 6"/>' +
      '<circle class="dot-aux" cx="' + X(x).toFixed(1) + '" cy="' + Y(V(x)).toFixed(1) + '" r="6"/>' +
      text(X(0) + 8, Y(Vm * 1.15) + 4, 'V(x) = x(' + L + ' − 2x)²', ' font-size="17"') +
      text(X(xm), Y(0) + 22, 'x = ' + lab(xm), ' text-anchor="middle" font-size="16"') +
      text(X(L / 2), Y(Vm * 1.15) + 30, 'V = ' + Math.round(V(x)), ' text-anchor="end" font-size="18"');
    return svg('0 0 600 290', 'Lámina de ' + L + ' por ' + L + ' con cuadros de lado x recortados en las esquinas; a la derecha, el volumen V(x), máximo en x = ' + lab(xm) + '.', body);
  };

  /* ================= Bloque C · S09: la integral ================= */
  // S09 · Suma de Riemann izquierda de x² en [0, 2] con n rectángulos.
  D['riemann-rects'] = function (st) {
    var n = Math.max(1, Math.round(st && st.n != null ? st.n : 4));
    var f = function (x) { return x * x; };
    var F = frame(-0.1, 2.2, 0, 4.4);
    var body = '', dx = 2 / n, S = 0;
    for (var i = 0; i < n; i++) {
      var x0 = i * dx, y = f(x0);
      S += y * dx;
      body += '<path class="area-fill" d="M' + F.X(x0).toFixed(1) + ' ' + F.Y(0).toFixed(1) + 'V' + F.Y(y).toFixed(1) + 'H' + F.X(x0 + dx).toFixed(1) + 'V' + F.Y(0).toFixed(1) + 'Z"/>' +
        '<path class="aux" d="M' + F.X(x0).toFixed(1) + ' ' + F.Y(0).toFixed(1) + 'V' + F.Y(y).toFixed(1) + 'H' + F.X(x0 + dx).toFixed(1) + 'V' + F.Y(0).toFixed(1) + '" fill="none" stroke-width="1.5"/>';
    }
    body += F.axes + '<path class="ref" d="' + path(f, 0, 2.1, F.X, F.Y) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      text(F.X(0) + 10, F.Y(4.4) + 18, 'n = ' + n + ' · suma izquierda = ' + S.toFixed(4), ' font-size="18"') +
      text(F.X(0) + 10, F.Y(4.4) + 42, 'área exacta = 8/3 ≈ 2.6667', ' font-size="17"') +
      text(F.X(2), F.Y(0) + 22, '2', ' text-anchor="middle" font-size="16"');
    return svg('0 0 600 290', 'Rectángulos bajo x² entre 0 y 2 con altura en el extremo izquierdo; con más rectángulos la suma se acerca a 8/3.', body);
  };

  // S09 · Teorema Fundamental: el área acumulada A(x) crece con rapidez f(x).
  D['ftc-accumulate'] = function (st) {
    var x = st && st.x != null ? st.x : 1.2;
    var f = function (t) { return 1 + 0.8 * Math.sin(1.6 * t); };
    var A = function (t) { return t + 0.5 * (1 - Math.cos(1.6 * t)); };
    var X = function (t) { return 60 + t * 500 / 3.2; };
    var Yf = function (y) { return 130 - y * 50; }, YA = function (y) { return 300 - y * 38; };
    var n = 60, d = 'M' + X(0) + ' ' + Yf(0);
    for (var i = 0; i <= n; i++) { var t = x * i / n; d += 'L' + X(t).toFixed(1) + ' ' + Yf(f(t)).toFixed(1); }
    d += 'L' + X(x).toFixed(1) + ' ' + Yf(0) + 'Z';
    var body = '<path class="area-fill" d="' + d + '"/>' +
      '<path class="axis" d="M' + X(0) + ' ' + Yf(0) + 'H' + X(3.2) + 'M' + X(0) + ' ' + YA(0) + 'H' + X(3.2) + '" stroke-width="1.5" fill="none"/>' +
      '<path class="ref" d="' + path(f, 0, 3.1, X, Yf) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path class="aux" d="' + path(A, 0, x, X, YA, 80) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path class="axis" d="M' + X(x).toFixed(1) + ' ' + Yf(f(x)).toFixed(1) + 'V' + YA(A(x)).toFixed(1) + '" stroke-dasharray="4 6" stroke-width="1.2"/>' +
      '<circle class="dot-ref" cx="' + X(x).toFixed(1) + '" cy="' + Yf(f(x)).toFixed(1) + '" r="5"/>' +
      '<circle class="dot-aux" cx="' + X(x).toFixed(1) + '" cy="' + YA(A(x)).toFixed(1) + '" r="6"/>' +
      text(X(0) + 8, 26, 'f(t)', ' font-size="18"') +
      text(X(0) + 8, YA(0) - 84, 'A(x) = área de 0 a x', ' font-size="18"') +
      text(X(3.2), YA(0) - 84, 'A′(x) = f(x) = ' + f(x).toFixed(2), ' text-anchor="end" font-size="18"');
    return svg('0 0 600 320', 'Arriba, el área bajo f desde 0 hasta x; abajo, esa área como función A(x). La pendiente de A en x es la altura f(x).', body);
  };

  /* ---------- Problemas de examen · bloque B y S09 ---------- */
  // Gráfica genérica de una función del problema, con un punto marcado.
  var EXAM_FN = {
    eficiencia: function (s) { return { f: function (v) { return s.k * v / (v * v + s.c); }, x: [0, 4 * Math.sqrt(s.c)], mark: Math.sqrt(s.c), xl: 'v (m/s)', yl: 'E(v)' }; },
    cubica: function (s) { return { f: function (x) { return x * x * x - 3 * s.a * x * x + s.b; }, x: [-s.a, 3 * s.a], mark: 2 * s.a, xl: 'x', yl: 'f(x)' }; },
    flujo: function (s) { return { f: function (t) { return s.a * t * (s.T - t); }, x: [0, s.T], area: true, xl: 't (min)', yl: 'r(t) en L/min' }; },
    velocidad: function (s) { return { f: function (t) { return t * t - s.k * t; }, x: [0, s.T], area: true, mark: s.k, xl: 't (s)', yl: 'v(t) en m/s' }; },
    florero: function (s) { return { f: function (x) { return s.k * Math.sqrt(Math.max(0, x)); }, x: [0, s.L], area: true, xl: 'x (cm)', yl: 'radio k√x en cm' }; },
    letrero: function (s) { return { f: function (x) { return s.m * s.m - x * x; }, x: [-s.m, s.m], area: true, xl: 'x (m)', yl: 'y = a − x²' }; },
    concentracion: function (s) { return { f: function (t) { return s.k * t * Math.exp(-t); }, x: [0, s.T], area: true, mark: 1, xl: 't (h)', yl: 'C(t) en mg/L' }; }
  };
  D['exam-grafica'] = function (s) {
    var g = EXAM_FN[s.kind](s), ys = [];
    for (var i = 0; i <= 80; i++) ys.push(g.f(g.x[0] + (g.x[1] - g.x[0]) * i / 80));
    var lo = Math.min(0, Math.min.apply(null, ys)), hi = Math.max(0, Math.max.apply(null, ys)), pad = (hi - lo) * 0.12;
    var F = frame(g.x[0], g.x[1], lo - pad, hi + pad), body = '';
    if (g.area) {
      var d = 'M' + F.X(g.x[0]).toFixed(1) + ' ' + F.Y(0).toFixed(1) + path(g.f, g.x[0], g.x[1], F.X, F.Y, 120).replace(/^M/, 'L') + 'L' + F.X(g.x[1]).toFixed(1) + ' ' + F.Y(0).toFixed(1) + 'Z';
      body += '<path class="area-fill" d="' + d + '"/>';
    }
    body += F.axes + '<path class="ref" d="' + path(g.f, g.x[0], g.x[1], F.X, F.Y) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>';
    if (g.mark != null) body += '<circle class="dot-aux" cx="' + F.X(g.mark).toFixed(1) + '" cy="' + F.Y(g.f(g.mark)).toFixed(1) + '" r="6"/>';
    body += text(F.X(g.x[1]), F.Y(0) + 22, g.xl, ' text-anchor="end" font-size="16"') +
      text(F.X(g.x[0]) + 8, F.Y(hi + pad) + 14, g.yl, ' font-size="17"');
    return svg('0 0 600 290', 'Gráfica de ' + g.yl + ' contra ' + g.xl + ' para el problema.', body);
  };

  // Punto de y = x² más cercano a (0, k).
  D['exam-parabola-dist'] = function (s) {
    var m = s.m || 2, k = m * m + 0.5, L = m + 1.5;
    var F = frame(-L, L, -0.5, Math.max(L * L, k) * 1.05), f = function (x) { return x * x; };
    var body = F.axes + '<path class="ref" d="' + path(f, -L, L, F.X, F.Y) + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path class="aux" d="M' + F.X(0) + ' ' + F.Y(k).toFixed(1) + 'L' + F.X(m).toFixed(1) + ' ' + F.Y(m * m).toFixed(1) + '" stroke-width="2.5" stroke-dasharray="6 5"/>' +
      '<circle class="dot-ref" cx="' + F.X(0) + '" cy="' + F.Y(k).toFixed(1) + '" r="6"/>' +
      '<circle class="dot-aux" cx="' + F.X(m).toFixed(1) + '" cy="' + F.Y(m * m).toFixed(1) + '" r="6"/>' +
      text(F.X(0) - 10, F.Y(k) - 8, '(0, ' + k + ')', ' text-anchor="end" font-size="17"') +
      text(F.X(-L) + 6, F.Y(Math.max(L * L, k) * 1.05) + 16, 'y = x²', ' font-size="18"');
    return svg('0 0 600 290', 'Parábola y = x² y el segmento más corto desde el punto (0, ' + k + ') hasta la curva.', body);
  };

  /* ================= Bloque C · S11–S15 ================= */
  // S11 · Por partes: el rectángulo uv se reparte entre ∫u dv y ∫v du.
  D['parts-area'] = function (st) {
    var stage = st && st.stage != null ? st.stage : 2;
    var u = function (t) { return 1 + t; }, v = function (t) { return t * t; };   // curva (u(t), v(t)) para t ∈ [0, 1.6]
    var X = function (U) { return 90 + (U - 0) * 170; }, Y = function (V) { return 270 - V * 88; };
    var n = 80, curve = '', below = 'M' + X(1) + ' ' + Y(0), left = 'M' + X(0) + ' ' + Y(0);
    for (var i = 0; i <= n; i++) {
      var t = 1.6 * i / n, p = X(u(t)).toFixed(1) + ' ' + Y(v(t)).toFixed(1);
      curve += (i ? 'L' : 'M') + p; below += 'L' + p;
    }
    below += 'L' + X(u(1.6)) + ' ' + Y(0) + 'Z';
    for (i = n; i >= 0; i--) { t = 1.6 * i / n; left += (i === n ? 'L' + X(0) + ' ' + Y(v(t)).toFixed(1) : '') + 'L' + X(u(t)).toFixed(1) + ' ' + Y(v(t)).toFixed(1); }
    left += 'L' + X(1) + ' ' + Y(0) + 'Z';
    var body = '<path class="axis" d="M' + X(0) + ' ' + Y(0) + 'H' + X(3) + 'M' + X(0) + ' ' + Y(0) + 'V' + Y(2.9) + '" stroke-width="1.5" fill="none"/>';
    if (stage >= 1) body += '<path class="area-fill" d="' + below + '"/>' + text(X(2), Y(0.45), '∫ v du', ' text-anchor="middle" font-size="19"');
    if (stage >= 2) body += '<path class="rect-fill" d="' + left + '" style="fill-opacity:.18"/>' + text(X(0.7), Y(1.7), '∫ u dv', ' text-anchor="middle" font-size="19"');
    body += '<path class="ref" d="' + curve + '" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path class="axis" d="M' + X(0) + ' ' + Y(v(1.6)) + 'H' + X(u(1.6)) + 'V' + Y(0) + '" stroke-dasharray="5 5" stroke-width="1.4" fill="none"/>' +
      text(X(3) - 4, Y(0) + 22, 'u', ' text-anchor="end" font-size="18"') + text(X(0) - 10, Y(2.9) + 8, 'v', ' text-anchor="end" font-size="18"') +
      text(X(2.6) + 20, Y(2.7), stage >= 2 ? 'juntas: el rectángulo uv' : 'la curva une (u, v)', ' text-anchor="end" font-size="18"');
    return svg('0 0 600 300', 'Curva en el plano u-v: el área bajo ella es ∫v du y el área a su izquierda es ∫u dv; juntas forman el rectángulo uv.', body);
  };

  // S12 · Sustitución trigonométrica: triángulo con x = a sen θ.
  D['trig-triangle'] = function (st) {
    var th = st && st.theta != null ? st.theta : 0.7, a = 3, S = 60;
    var x = a * Math.sin(th), c = a * Math.cos(th), ox = 120, oy = 250;
    var A = [ox, oy], B = [ox + c * S, oy], C = [ox + c * S, oy - x * S];
    var body = '<path class="ref" d="M' + A.join(' ') + 'L' + B.join(' ') + 'L' + C.join(' ') + 'Z" fill="none" stroke-width="3.2" stroke-linejoin="round"/>' +
      '<path class="axis" d="M' + (B[0] - 14) + ' ' + B[1] + 'V' + (B[1] - 14) + 'H' + B[0] + '" fill="none" stroke-width="1.4"/>' +
      '<path class="aux" d="M' + (ox + 38) + ' ' + oy + 'A38 38 0 0 0 ' + (ox + 38 * Math.cos(th)).toFixed(1) + ' ' + (oy - 38 * Math.sin(th)).toFixed(1) + '" fill="none" stroke-width="2.5"/>' +
      text(ox + 48, oy - 10, 'θ', ' font-size="20"') +
      text((A[0] + C[0]) / 2 - 12, (A[1] + C[1]) / 2 - 8, 'a = 3', ' text-anchor="end" font-size="18"') +
      text(C[0] + 10, (B[1] + C[1]) / 2, 'x = 3 sen θ = ' + x.toFixed(2), ' font-size="18"') +
      text((A[0] + B[0]) / 2, oy + 24, '√(9 − x²) = 3 cos θ = ' + c.toFixed(2), ' text-anchor="middle" font-size="18"');
    return svg('0 0 600 300', 'Triángulo rectángulo de hipotenusa 3: el cateto opuesto a θ es x = 3 sen θ y el adyacente es √(9 − x²) = 3 cos θ.', body);
  };

  // S13 · Fracciones parciales: 1/(x(x+1)) = 1/x − 1/(x+1).
  D['partial-fractions'] = function (st) {
    var stage = st && st.stage != null ? st.stage : 2;
    var F = frame(0.25, 3, -1.2, 3.4);
    var f1 = function (x) { return 1 / x; }, f2 = function (x) { return -1 / (x + 1); }, sum = function (x) { return 1 / (x * (x + 1)); };
    var body = F.axes +
      '<path class="aux" d="' + path(f1, 0.3, 3, F.X, F.Y) + '" fill="none" stroke-width="2.6"' + (stage === 2 ? ' stroke-dasharray="6 5"' : '') + '/>' +
      '<path class="trace" d="' + path(f2, 0.25, 3, F.X, F.Y) + '" fill="none" stroke-width="2.6"' + (stage === 2 ? ' stroke-dasharray="6 5"' : '') + '/>' +
      text(F.X(0.55), F.Y(2.4), '1/x', ' font-size="18"') + text(F.X(2.3), F.Y(-0.55), '−1/(x + 1)', ' font-size="18"');
    if (stage >= 1) body += '<path class="ref" d="' + path(sum, 0.3, 3, F.X, F.Y) + '" fill="none" stroke-width="3.6" stroke-linecap="round"/>' +
      text(F.X(1.1), F.Y(1.1), '1/(x(x + 1)): la suma', ' font-size="18"');
    return svg('0 0 600 290', 'Las curvas 1/x y −1/(x + 1) sumadas dan 1/(x(x + 1)): la fracción difícil es la suma de dos fáciles.', body);
  };

  // S14 · Área entre curvas: una tira vertical de altura f − g.
  D['area-strip'] = function (st) {
    var x = st && st.x != null ? st.x : 0.5;
    var f = function (t) { return t + 2; }, g = function (t) { return t * t; };
    var F = frame(-1.5, 2.6, -0.6, 4.8), n = 100, d = '';
    for (var i = 0; i <= n; i++) { var t = -1 + 3 * i / n; d += (i ? 'L' : 'M') + F.X(t).toFixed(1) + ' ' + F.Y(f(t)).toFixed(1); }
    for (i = n; i >= 0; i--) { t = -1 + 3 * i / n; d += 'L' + F.X(t).toFixed(1) + ' ' + F.Y(g(t)).toFixed(1); }
    var w = 0.12;
    var body = '<path class="area-fill" d="' + d + 'Z"/>' + F.axes +
      '<path class="ref" d="' + path(f, -1.4, 2.5, F.X, F.Y) + '" fill="none" stroke-width="3.4"/>' +
      '<path class="trace" d="' + path(g, -1.4, 2.2, F.X, F.Y) + '" fill="none" stroke-width="3"/>' +
      '<path class="rect-fill" d="M' + F.X(x - w / 2).toFixed(1) + ' ' + F.Y(g(x)).toFixed(1) + 'V' + F.Y(f(x)).toFixed(1) + 'H' + F.X(x + w / 2).toFixed(1) + 'V' + F.Y(g(x)).toFixed(1) + 'Z" style="fill-opacity:.55"/>' +
      text(F.X(-1.45), F.Y(4.6) + 4, 'arriba: f = x + 2', ' font-size="17"') +
      text(F.X(-1.45), F.Y(4.6) + 26, 'abajo: g = x²', ' font-size="17"') +
      text(F.X(2.55), F.Y(-0.6) - 8, 'altura de la tira: f − g = ' + (f(x) - g(x)).toFixed(2), ' text-anchor="end" font-size="17"') +
      '<circle class="dot-aux" cx="' + F.X(-1) + '" cy="' + F.Y(1) + '" r="5"/><circle class="dot-aux" cx="' + F.X(2) + '" cy="' + F.Y(4) + '" r="5"/>';
    return svg('0 0 600 290', 'Región entre la recta y = x + 2 y la parábola y = x², de x = −1 a x = 2; una tira vertical tiene altura f(x) − g(x).', body);
  };

  // S14 · Longitud de arco: poligonal con n segmentos sobre y = x²/2.
  D['arc-polyline'] = function (st) {
    var n = Math.max(1, Math.round(st && st.n != null ? st.n : 2));
    var f = function (t) { return t * t / 2; }, F = frame(-0.2, 2.3, -0.3, 2.4), segs = '', L = 0;
    for (var i = 0; i < n; i++) {
      var a = 2 * i / n, b = 2 * (i + 1) / n;
      segs += 'M' + F.X(a).toFixed(1) + ' ' + F.Y(f(a)).toFixed(1) + 'L' + F.X(b).toFixed(1) + ' ' + F.Y(f(b)).toFixed(1);
      L += Math.hypot(b - a, f(b) - f(a));
    }
    var body = F.axes + '<path class="ref" d="' + path(f, 0, 2.2, F.X, F.Y) + '" fill="none" stroke-width="3.4"/>' +
      '<path class="aux" d="' + segs + '" fill="none" stroke-width="2.6" stroke-linecap="round"/>';
    for (i = 0; i <= n; i++) { var x = 2 * i / n; body += '<circle class="dot-aux" cx="' + F.X(x).toFixed(1) + '" cy="' + F.Y(f(x)).toFixed(1) + '" r="4"/>'; }
    body += text(F.X(0) + 10, F.Y(2.4) + 18, 'n = ' + n + ' · poligonal = ' + L.toFixed(4), ' font-size="18"') +
      text(F.X(0) + 10, F.Y(2.4) + 42, 'arco exacto ≈ 2.9579', ' font-size="17"');
    return svg('0 0 600 290', 'Poligonal inscrita en y = x²/2 entre 0 y 2; con más segmentos su longitud se acerca a la del arco.', body);
  };

  // S15 · Discos: el cono que genera y = x/2 al girar alrededor del eje x.
  D['disk-slice'] = function (st) {
    var n = Math.max(1, Math.round(st && st.n != null ? st.n : 4));
    var r = function (t) { return t / 2; };
    var X = function (t) { return 80 + t * 110; }, Y = function (y) { return 140 - y * 55; };
    var body = '<path class="error" d="M' + X(-0.3) + ' ' + Y(0) + 'H' + X(4.4) + '" stroke-width="1.6" stroke-dasharray="6 5"/>', dx = 4 / n, V = 0;
    for (var i = 0; i < n; i++) {
      var x0 = i * dx, R = r(x0 + dx / 2);
      V += Math.PI * R * R * dx;
      body += '<path class="rect-fill" d="M' + X(x0).toFixed(1) + ' ' + Y(-R).toFixed(1) + 'V' + Y(R).toFixed(1) + 'H' + X(x0 + dx).toFixed(1) + 'V' + Y(-R).toFixed(1) + 'Z"/>' +
        '<ellipse class="rect-fill" cx="' + X(x0 + dx).toFixed(1) + '" cy="' + Y(0) + '" rx="' + (R * 55 * 0.28).toFixed(1) + '" ry="' + (R * 55).toFixed(1) + '"/>';
    }
    body += '<path class="ref" d="M' + X(0) + ' ' + Y(0) + 'L' + X(4) + ' ' + Y(2) + 'M' + X(0) + ' ' + Y(0) + 'L' + X(4) + ' ' + Y(-2) + '" stroke-width="3.2" fill="none"/>' +
      text(X(4.4), Y(0) - 8, 'eje x', ' text-anchor="end" font-size="16"') +
      text(330, 285, 'n = ' + n + ' discos · V ≈ ' + V.toFixed(3) + ' (exacto 16π/3 ≈ 16.755)', ' text-anchor="middle" font-size="18"');
    return svg('0 0 600 310', 'Cono generado por y = x/2 al girar alrededor del eje x, aproximado con ' + n + ' discos.', body);
  };

  // S15 · Capas cilíndricas: la región bajo x − x² gira alrededor del eje y.
  D['shell-slice'] = function (st) {
    var x = st && st.x != null ? st.x : 0.5;
    var f = function (t) { return t - t * t; };
    var X = function (t) { return 300 + t * 220; }, Y = function (y) { return 250 - y * 520; };
    var body = '<path class="error" d="M' + X(0) + ' ' + Y(-0.05) + 'V' + Y(0.42) + '" stroke-width="1.6" stroke-dasharray="6 5"/>' +
      '<path class="axis" d="M' + X(-1.15) + ' ' + Y(0) + 'H' + X(1.15) + '" stroke-width="1.4"/>' +
      '<path class="ref" d="' + path(f, 0, 1, X, Y) + '" fill="none" stroke-width="3.2"/>' +
      '<path class="ref" d="' + path(function (t) { return f(-t); }, -1, 0, X, Y) + '" fill="none" stroke-width="3.2"/>';
    var w = 0.05, h = f(x);
    [[x - w / 2, x + w / 2], [-x - w / 2, -x + w / 2]].forEach(function (p) {
      body += '<path class="rect-fill" d="M' + X(p[0]).toFixed(1) + ' ' + Y(0) + 'V' + Y(h).toFixed(1) + 'H' + X(p[1]).toFixed(1) + 'V' + Y(0) + 'Z" style="fill-opacity:.5"/>';
    });
    body += '<ellipse class="area-fill" cx="' + X(0) + '" cy="' + Y(h).toFixed(1) + '" rx="' + (x * 220).toFixed(1) + '" ry="' + (x * 30).toFixed(1) + '"/>' +
      '<ellipse class="aux" cx="' + X(0) + '" cy="' + Y(0) + '" rx="' + (x * 220).toFixed(1) + '" ry="' + (x * 30).toFixed(1) + '" fill="none" stroke-width="2"/>' +
      text(X(0) + 8, Y(0.42) + 6, 'eje y', ' font-size="16"') +
      text(X(-1.12), Y(0.4), 'radio x = ' + x.toFixed(2), ' font-size="17"') + text(X(-1.12), Y(0.4) + 22, 'altura x − x² = ' + h.toFixed(3), ' font-size="17"');
    return svg('0 0 600 300', 'Región bajo y = x − x² girando alrededor del eje y; una tira vertical en x barre una capa cilíndrica de radio x.', body);
  };
})();
