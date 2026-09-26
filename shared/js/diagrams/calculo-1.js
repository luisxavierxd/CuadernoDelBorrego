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
})();
