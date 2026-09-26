/* =====================================================================
   Diagramas de Física 1: window.Diagrams[id](state) → SVG (string).
   Roles (§5.4): trayectoria real .ref · rastro del proyectil .trace ·
   velocidad y componentes .aux · aceleración y fuerza .error.
   ===================================================================== */
(function () {
  var D = window.Diagrams = window.Diagrams || {};
  var G = 9.81, RAD = Math.PI / 180;

  function arrow(cls, x, y, dx, dy, w) {
    var L = Math.hypot(dx, dy);
    if (L < 2) return '';
    var ux = dx / L, uy = dy / L, hh = Math.min(11, L * 0.45), ex = x + dx, ey = y + dy;
    return '<path class="' + cls + '" fill="none" stroke-width="' + (w || 3) + '" stroke-linecap="round" stroke-linejoin="round" d="' +
      'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
      'M' + (ex - ux * hh - uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh + ux * hh * 0.6).toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
      'L' + (ex - ux * hh + uy * hh * 0.6).toFixed(1) + ' ' + (ey - uy * hh - ux * hh * 0.6).toFixed(1) + '"/>';
  }
  function text(x, y, s, extra) {
    return '<text class="ann" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '"' + (extra || '') + '>' + s + '</text>';
  }
  function svg(label, body) {
    return '<svg viewBox="0 118 620 222" role="img" aria-label="' + label + '"><g class="sketch">' + body + '</g></svg>';
  }

  // Mundo común: v0 = 18 m/s, θ = 40°.
  var V0 = 18, TH = 40 * RAD;
  var VX = V0 * Math.cos(TH), VY = V0 * Math.sin(TH), T = 2 * VY / G, R = VX * T, H = VY * VY / (2 * G);
  var X = function (x) { return 50 + x * 16; };
  var Y = function (y) { return 292 - y * 16; };
  var K = 3.1;                                   // px por m/s en los vectores
  function pos(t) { return { x: VX * t, y: VY * t - G * t * t / 2 }; }
  function trail(t1) {
    var d = '';
    for (var i = 0; i <= 60; i++) { var p = pos(t1 * i / 60); d += (i ? 'L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p.y).toFixed(1); }
    return d;
  }
  var ground = '<path class="axis" d="M30 ' + Y(0) + 'H600" stroke-width="1.5"/>';

  /* ---------- Componentes en varios instantes ---------- */
  D['projectile-components'] = function () {
    var body = ground + '<path class="ref" d="' + trail(T) + '" fill="none" stroke-width="3" stroke-dasharray="1 9" stroke-linecap="round"/>';
    [0, 0.25, 0.5, 0.75, 1].forEach(function (u) {
      var t = T * u, p = pos(t), x = X(p.x), y = Y(p.y), vy = VY - G * t;
      body += arrow('aux', x, y, VX * K, 0, 3);
      body += arrow('aux', x, y, 0, -vy * K, 3);
      body += '<circle class="dot-trace" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6"/>';
    });
    body += text(X(0) + VX * K + 6, Y(0) + 5, 'vx', ' font-size="19"');
    body += text(X(0) + 8, Y(0) - VY * K, 'vy', ' font-size="19"');
    var apex = pos(T / 2);
    body += arrow('error', X(apex.x) + 26, Y(apex.y), 0, 46, 3);
    body += text(X(apex.x) + 34, Y(apex.y) + 44, 'a = g', ' font-size="19"');
    body += text(X(apex.x), Y(apex.y) - 22, 'arriba: vy = 0', ' text-anchor="middle" font-size="19"');
    return svg('Proyectil en cinco instantes: su componente horizontal vx es igual en todos; la vertical vy disminuye hasta cero en la cima y luego apunta hacia abajo.', body);
  };

  /* ---------- Explicación paso a paso ----------
     state.u ∈ [0, 1]: fracción del tiempo de vuelo. state.show: 'launch' | 'apex' | 'land' | 'range'. */
  D['projectile-explainer'] = function (s) {
    var u = Math.max(0, Math.min(1, s && s.u != null ? s.u : 0));
    var show = (s && s.show) || 'launch';
    var t = T * u, p = pos(t), x = X(p.x), y = Y(p.y), vy = VY - G * t;
    var body = ground +
      '<path class="ref" d="' + trail(T) + '" fill="none" stroke-width="2.5" stroke-dasharray="1 9" stroke-linecap="round"/>' +
      '<path class="trace" d="' + trail(t) + '" fill="none" stroke-width="3" stroke-linecap="round"/>';

    if (show === 'launch') {
      body += '<path class="axis" fill="none" stroke-width="1.5" d="M' + (X(0) + 42) + ' ' + Y(0) + 'A42 42 0 0 0 ' + (X(0) + 42 * Math.cos(TH)).toFixed(1) + ' ' + (Y(0) - 42 * Math.sin(TH)).toFixed(1) + '"/>';
      body += text(X(0) + 48, Y(0) - 10, 'θ', ' font-size="20"');
    }
    body += arrow('aux', x, y, VX * K, -vy * K, 3.5);
    body += arrow('aux', x, y, VX * K, 0, 2);
    body += arrow('aux', x, y, 0, -vy * K, 2);
    body += '<circle class="dot-trace" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="7"/>';

    if (show === 'launch') {
      body += text(x + VX * K + 8, y + 6, 'v₀x = v₀ cos θ', ' font-size="19"');
      body += text(x + 10, y - VY * K - 6, 'v₀y = v₀ sin θ', ' font-size="19"');
    } else if (show === 'apex') {
      body += text(x, y - 26, 'vy = 0  →  t = v₀ sin θ / g', ' text-anchor="middle" font-size="19"');
      body += arrow('error', x + 30, y + 4, 0, 44, 3);
      body += text(x + 38, y + 44, 'g', ' font-size="19"');
    } else if (show === 'land') {
      body += text(x - 6, y - 40, 'misma rapidez vertical que al salir, hacia abajo', ' text-anchor="end" font-size="18"');
      body += text(X(R / 2), 146, 'T = 2 v₀ sin θ / g', ' text-anchor="middle" font-size="21"');
    } else if (show === 'range') {
      body += '<path class="aux" fill="none" stroke-width="2" d="M' + X(0) + ' ' + (Y(0) + 22) + 'H' + X(R) + 'M' + X(0) + ' ' + (Y(0) + 14) + 'v16M' + X(R) + ' ' + (Y(0) + 14) + 'v16"/>';
      body += text(X(R / 2), Y(0) + 42, 'R = v₀x · T', ' text-anchor="middle" font-size="19"');
      body += text(X(R / 2), 146, 'R = v₀² sin 2θ / g', ' text-anchor="middle" font-size="21"');
    }
    return svg('Proyectil lanzado con rapidez v₀ y ángulo θ; se muestra su vector velocidad y sus componentes en el instante actual.', body);
  };
})();
