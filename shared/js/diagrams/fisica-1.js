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

  /* =================== Bloques A y B (S01–S05, S07) =================== */
  function svgBox(vb, label, body) {
    return '<svg viewBox="' + vb + '" role="img" aria-label="' + label + '"><g class="sketch">' + body + '</g></svg>';
  }
  function seg(cls, x1, y1, x2, y2, w, dash) {
    return '<path class="' + cls + '" fill="none" stroke-width="' + (w || 2) + '" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') +
      ' d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '"/>';
  }
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function fade(body, o) { return o <= 0.001 ? '' : '<g opacity="' + o.toFixed(2) + '">' + body + '</g>'; }
  function num(s, k, d) { return s && typeof s[k] === 'number' ? s[k] : d; }
  function arc(cx, cy, r, a0, a1, cls) {                // ángulos en grados, antihorario en pantalla
    var p0 = [cx + r * Math.cos(a0 * RAD), cy - r * Math.sin(a0 * RAD)], p1 = [cx + r * Math.cos(a1 * RAD), cy - r * Math.sin(a1 * RAD)];
    return '<path class="' + (cls || 'axis') + '" fill="none" stroke-width="1.5" d="M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) +
      'A' + r + ' ' + r + ' 0 ' + (Math.abs(a1 - a0) > 180 ? 1 : 0) + ' 0 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + '"/>';
  }

  /* ---------- S01 · Modelo de partícula ---------- */
  D['model-particle'] = function () {
    var body =
      '<path class="axis" d="M30 250H590" stroke-width="1.5"/>' +
      '<rect class="box-aux" x="70" y="178" width="150" height="54" rx="10"/>' +
      '<circle class="dot-trace" cx="105" cy="240" r="11"/><circle class="dot-trace" cx="185" cy="240" r="11"/>' +
      text(145, 160, 'la realidad: forma, ruedas, aire…', ' text-anchor="middle" font-size="18"') +
      arrow('axis', 250, 205, 70, 0, 2) +
      '<circle class="dot-ref" cx="400" cy="205" r="8"/>' +
      arrow('aux', 400, 205, 110, 0, 3) +
      text(400, 180, 'el modelo: una partícula', ' text-anchor="middle" font-size="18"') +
      text(470, 230, 'v', ' font-size="19"');
    return svgBox('0 130 620 140', 'A la izquierda un carro real con ruedas; a la derecha el mismo carro modelado como un punto con su velocidad.', body);
  };

  /* ---------- S01 · Cadena de factores de conversión (explainer) ----------
     state.step ∈ [0, 3]: 0 = el dato · 1 = km se cancela · 2 = h se cancela · 3 = resultado. */
  D['units-chain'] = function (s) {
    var k = num(s, 'step', 0);
    function frac(x, n, nu, d, du) {
      return text(x - 4, 178, n, ' text-anchor="end" font-size="22"') + text(x + 4, 178, nu, ' font-size="22"') +
        seg('axis', x - 58, 190, x + 58, 190, 2) +
        text(x - 4, 218, d, ' text-anchor="end" font-size="22"') + text(x + 4, 218, du, ' font-size="22"');
    }
    function strike(x, y, w) { return seg('error', x, y + 4, x + w, y - 14, 3); }
    var body =
      frac(80, '72', 'km', '1', 'h') +
      fade(text(160, 204, '×', ' text-anchor="middle" font-size="24"') + frac(240, '1000', 'm', '1', 'km'), clamp01(k)) +
      fade(strike(84, 178, 30) + strike(244, 218, 30), clamp01(k)) +
      fade(text(320, 204, '×', ' text-anchor="middle" font-size="24"') + frac(400, '1', 'h', '3600', 's'), clamp01(k - 1)) +
      fade(strike(84, 218, 16) + strike(404, 178, 16), clamp01(k - 1)) +
      fade(text(478, 204, '=', ' text-anchor="middle" font-size="26"') + text(550, 206, '20 m/s', ' text-anchor="middle" font-size="26"'), clamp01(k - 2)) +
      fade(text(240, 262, '1000 m = 1 km: el factor vale 1', ' text-anchor="middle" font-size="17"'), clamp01(k) * (1 - clamp01(k - 1))) +
      fade(text(400, 262, '3600 s = 1 h: también vale 1', ' text-anchor="middle" font-size="17"'), clamp01(k - 1) * (1 - clamp01(k - 2))) +
      fade(text(310, 262, '72 × 1000 ÷ 3600 = 20', ' text-anchor="middle" font-size="18"'), clamp01(k - 2));
    return svgBox('0 140 620 140', 'Conversión de 72 kilómetros por hora a metros por segundo multiplicando por factores que valen uno; las unidades repetidas se cancelan.', body);
  };

  /* ---------- S01 · Revisión dimensional (explainer) ----------
     state.step ∈ [0, 3]: 0 = fórmula · 1 = dimensión de cada término · 2 = todas [L] · 3 = una fórmula mal escrita. */
  D['dim-check'] = function (s) {
    var k = num(s, 'step', 0);
    var terms = [[70, 'x'], [150, 'x₀'], [250, 'v₀ t'], [380, '½ a t²']];
    var dims = [[70, '[L]'], [150, '[L]'], [250, '[L/T]·[T]'], [380, '[L/T²]·[T²]']];
    var body = text(110, 170, '=', ' text-anchor="middle" font-size="24"') + text(196, 170, '+', ' text-anchor="middle" font-size="24"') + text(312, 170, '+', ' text-anchor="middle" font-size="24"');
    terms.forEach(function (t) { body += text(t[0], 170, t[1], ' text-anchor="middle" font-size="24"'); });
    var dimRow = '';
    dims.forEach(function (d) { dimRow += text(d[0], 212, d[1], ' text-anchor="middle" font-size="19"') + seg('axis', d[0], 180, d[0], 194, 1.4); });
    body += fade(dimRow, clamp01(k));
    var ok = '';
    [250, 380].forEach(function (x) { ok += text(x, 246, '= [L]', ' text-anchor="middle" font-size="19"'); });
    ok += text(540, 170, '✓ todo es [L]', ' text-anchor="middle" font-size="19"');
    body += fade(ok, clamp01(k - 1));
    var bad = '<rect class="box-err" x="430" y="236" width="180" height="40" rx="8"/>' +
      text(520, 262, 'x = v₀ t² → [L·T] ✗', ' text-anchor="middle" font-size="18"');
    body += fade(bad, clamp01(k - 2));
    return svgBox('0 140 620 150', 'La ecuación x = x₀ + v₀t + ½at²: cada término tiene dimensión de longitud. Una fórmula como x = v₀t² daría longitud por tiempo, así que está mal.', body);
  };

  /* ---------- S02 · Componentes de un vector ---------- */
  D['vector-components'] = function (s) {
    var th = num(s, 'th', 35), L = 190, ox = 150, oy = 250;
    var dx = L * Math.cos(th * RAD), dy = L * Math.sin(th * RAD);
    var body =
      arrow('axis', 60, oy, 380, 0, 1.4) + arrow('axis', ox, 290, 0, -170, 1.4) +
      text(446, oy + 20, 'x', ' font-size="18"') + text(ox - 16, 132, 'y', ' font-size="18"') +
      seg('axis', ox + dx, oy, ox + dx, oy - dy, 1.6, '5 6') + seg('axis', ox, oy - dy, ox + dx, oy - dy, 1.6, '5 6') +
      arrow('aux', ox, oy, dx, 0, 3) + arrow('aux', ox, oy, 0, -dy, 3) +
      arrow('ref', ox, oy, dx, -dy, 3.5) +
      arc(ox, oy, 48, 0, th) +
      text(ox + 56, oy - 12, 'θ', ' font-size="20"') +
      text(ox + dx / 2, oy + 26, 'Ax = A cos θ', ' text-anchor="middle" font-size="18"') +
      text(ox - 10, oy - dy / 2, 'Ay = A sin θ', ' text-anchor="end" font-size="18"') +
      text(ox + dx / 2 + 10, oy - dy / 2 - 16, 'A', ' font-size="22"') +
      text(560, 170, '|A| = √(Ax² + Ay²)', ' text-anchor="middle" font-size="18"') +
      text(560, 200, 'tan θ = Ay / Ax', ' text-anchor="middle" font-size="18"');
    return svgBox('0 120 640 190', 'Un vector A con ángulo θ desde el eje x y sus componentes Ax = A cos θ y Ay = A sin θ.', body);
  };

  /* ---------- S02 · Suma cabeza con cola (explainer) ----------
     state.step ∈ [0, 3]: 0 = A y B desde el origen · 1 = B se mueve a la cabeza de A · 2 = R · 3 = componentes. */
  var VA = [120, 50], VB = [-60, 110], O2 = [210, 270];
  D['vector-sum-explainer'] = function (s) {
    var k = num(s, 'step', 0), m = clamp01(k);
    var bx = O2[0] + VA[0] * m, by = O2[1] - VA[1] * m;
    var R = [VA[0] + VB[0], VA[1] + VB[1]];
    var body = arrow('axis', 90, O2[1], 380, 0, 1.2) + arrow('axis', O2[0], 300, 0, -190, 1.2) +
      arrow('aux', O2[0], O2[1], VA[0], -VA[1], 3.5) + text(O2[0] + VA[0] / 2 + 6, O2[1] - VA[1] / 2 + 22, 'A', ' font-size="21"') +
      arrow('trace', bx, by, VB[0], -VB[1], 3.5) + text(bx + VB[0] / 2 + 12, by - VB[1] / 2, 'B', ' font-size="21"');
    body += fade(arrow('ref', O2[0], O2[1], R[0], -R[1], 4) + text(O2[0] + R[0] / 2 - 26, O2[1] - R[1] / 2, 'R = A + B', ' text-anchor="end" font-size="19"'), clamp01(k - 1));
    var comp = seg('aux', O2[0], O2[1] + 14, O2[0] + VA[0], O2[1] + 14, 3) + seg('trace', O2[0] + VA[0], O2[1] + 22, O2[0] + VA[0] + VB[0], O2[1] + 22, 3) +
      seg('ref', O2[0], O2[1] + 30, O2[0] + R[0], O2[1] + 30, 3.5) + text(O2[0] - 8, O2[1] + 36, 'Rx', ' text-anchor="end" font-size="16"') +
      text(545, 190, 'Rx = Ax + Bx', ' text-anchor="middle" font-size="19"') + text(545, 222, 'Ry = Ay + By', ' text-anchor="middle" font-size="19"') +
      text(545, 254, '|R| = √(Rx² + Ry²)', ' text-anchor="middle" font-size="19"');
    body += fade(comp, clamp01(k - 2));
    body += fade(text(545, 190, 'B se traslada', ' text-anchor="middle" font-size="18"') + text(545, 214, 'sin girar hasta', ' text-anchor="middle" font-size="18"') + text(545, 238, 'la cabeza de A', ' text-anchor="middle" font-size="18"'), clamp01(k) * (1 - clamp01(k - 2)));
    return svgBox('0 105 640 215', 'Método gráfico: el vector B se traslada hasta la punta de A y la resultante R va del origen a la punta de B; sus componentes son las sumas de las componentes.', body);
  };

  /* ---------- S02 · Cuadrantes y arctan ---------- */
  D['vector-quadrants'] = function () {
    var ox = 200, oy = 215, body = arrow('axis', 60, oy, 290, 0, 1.3) + arrow('axis', ox, 330, 0, -220, 1.3);
    [['+ , +', 290, 150], ['− , +', 160, 132]].forEach(function (q) { body += text(q[1], q[2], '(' + q[0] + ')', ' text-anchor="middle" font-size="17"'); });
    body += arrow('ref', ox, oy, -88, -66, 3.5) + text(ox - 92, oy - 76, 'A = (−4, 3)', ' text-anchor="end" font-size="18"');
    body += arc(ox, oy, 40, 0, 143.1, 'ref');
    body += arrow('student', ox, oy, 88, 66, 2.5);
    body += text(ox + 110, oy + 100, 'arctan(3/−4) = −36.9°', ' text-anchor="middle" font-size="17"');
    body += text(470, 170, 'La calculadora da −36.9°,', ' text-anchor="middle" font-size="18"') +
      text(470, 196, 'que apunta al 4.º cuadrante.', ' text-anchor="middle" font-size="18"') +
      text(470, 240, 'A está en el 2.º cuadrante:', ' text-anchor="middle" font-size="18"') +
      text(470, 266, 'θ = −36.9° + 180° = 143.1°', ' text-anchor="middle" font-size="18"');
    return svgBox('0 100 640 240', 'El vector (−4, 3) está en el segundo cuadrante; arctan(3/−4) da −36.9 grados, que apunta al cuarto, así que hay que sumar 180 grados.', body);
  };

  /* ---------- S03 · Producto escalar como proyección (explainer) ----------
     state.ang: ángulo entre A y B en grados. */
  D['dot-projection'] = function (s) {
    var a = num(s, 'ang', 40), ox = 250, oy = 250, LA = 130, LB = 220;
    var ax = LA * Math.cos(a * RAD), ay = LA * Math.sin(a * RAD);
    var sign = Math.abs(ax) < 3 ? 'A·B = 0: perpendiculares' : ax > 0 ? 'A·B > 0: la sombra va con B' : 'A·B < 0: la sombra va en contra';
    var body = seg('axis', 60, oy, 600, oy, 1) +
      arrow('trace', ox, oy, LB, 0, 3.5) + text(ox + LB + 8, oy + 6, 'B', ' font-size="21"') +
      arrow('aux', ox, oy, ax, -ay, 3.5) + text(ox + ax + (ax >= 0 ? 8 : -22), oy - ay - 6, 'A', ' font-size="21"') +
      seg('axis', ox + ax, oy - ay, ox + ax, oy, 1.6, '5 6') +
      seg('ref', ox, oy + 12, ox + ax, oy + 12, 6) +
      arc(ox, oy, 38, 0, a) + text(ox + 44 * Math.cos(a / 2 * RAD), oy - 44 * Math.sin(a / 2 * RAD) - 4, 'θ', ' font-size="19"') +
      text(ox + ax / 2, oy + 38, 'A cos θ', ' text-anchor="middle" font-size="18"') +
      text(320, 318, sign, ' text-anchor="middle" font-size="19"') +
      text(320, 346, 'A·B = |A| |B| cos θ = (sombra de A) × |B|', ' text-anchor="middle" font-size="19"');
    return svgBox('0 92 640 268', 'El producto escalar mide la sombra de A sobre la dirección de B, multiplicada por el tamaño de B; es cero si son perpendiculares y negativo si el ángulo pasa de 90 grados.', body);
  };

  /* ---------- S03 · Producto vectorial y mano derecha ---------- */
  D['cross-product'] = function () {
    // Vista oblicua: x hacia el frente-izquierda, y a la derecha, z hacia arriba.
    function P(x, y, z) { return [200 + y * 150 - x * 70, 250 - z * 150 + x * 45]; }
    var O = P(0, 0, 0), A = P(1.1, 0.2, 0), B = P(0.1, 1.2, 0), AB = P(1.2, 1.4, 0), C = P(0, 0, 0.95);
    var body =
      '<path class="box-ref" d="M' + O.join(' ') + 'L' + A.join(' ') + 'L' + AB.join(' ') + 'L' + B.join(' ') + 'Z" stroke-width="1"/>' +
      arrow('aux', O[0], O[1], A[0] - O[0], A[1] - O[1], 3.5) + text(A[0] - 18, A[1] + 18, 'A', ' font-size="21"') +
      arrow('trace', O[0], O[1], B[0] - O[0], B[1] - O[1], 3.5) + text(B[0] + 8, B[1] + 20, 'B', ' font-size="21"') +
      arrow('ref', O[0], O[1], C[0] - O[0], C[1] - O[1], 4) + text(C[0] + 10, C[1] + 6, 'A × B', ' font-size="21"') +
      text((O[0] + AB[0]) / 2 + 10, (O[1] + AB[1]) / 2 + 2, 'área = |A×B|', ' text-anchor="middle" font-size="16"') +
      text(520, 150, 'Dedos de la mano derecha', ' text-anchor="middle" font-size="17"') +
      text(520, 174, 'de A hacia B:', ' text-anchor="middle" font-size="17"') +
      text(520, 198, 'el pulgar apunta a A × B', ' text-anchor="middle" font-size="17"') +
      text(520, 242, '|A × B| = |A||B| sin θ', ' text-anchor="middle" font-size="18"') +
      text(520, 270, 'B × A = −(A × B)', ' text-anchor="middle" font-size="18"');
    return svgBox('0 100 640 220', 'Los vectores A y B forman un paralelogramo; A cruz B es perpendicular a ambos, su tamaño es el área del paralelogramo y su sentido lo da la regla de la mano derecha.', body);
  };

  /* ---------- S03 · Vector unitario ---------- */
  D['unit-vector'] = function () {
    var ox = 140, oy = 250, body = arrow('axis', 60, oy, 480, 0, 1.2) + arrow('axis', ox, 290, 0, -170, 1.2);
    body += arrow('aux', ox, oy, 280, -120, 3) + text(ox + 290, oy - 124, 'A  (|A| = 5)', ' font-size="19"');
    body += arrow('ref', ox, oy, 56, -24, 4.5) + text(ox + 34, oy - 36, 'Â', ' font-size="22"');
    body += text(520, 210, 'Â = A / |A|', ' text-anchor="middle" font-size="20"') + text(520, 238, 'misma dirección, tamaño 1', ' text-anchor="middle" font-size="18"');
    return svgBox('0 110 640 200', 'El vector unitario Â apunta igual que A pero mide 1: se obtiene dividiendo A entre su magnitud.', body);
  };

  /* ---------- S04 · Desplazamiento contra distancia ---------- */
  D['track-displacement'] = function () {
    var X = function (m) { return 60 + m * 48; }, y = 250, body = seg('axis', 40, y, 600, y, 1.5);
    for (var m = 0; m <= 11; m++) body += seg('axis', X(m), y - 6, X(m), y + 6, 1.2) + (m % 2 === 0 ? text(X(m), y + 26, String(m), ' text-anchor="middle" font-size="16"') : '');
    body += text(600, y + 26, 'x (m)', ' text-anchor="end" font-size="16"');
    body += arrow('aux', X(2), 200, X(10) - X(2), 0, 3) + text((X(2) + X(10)) / 2, 190, 'va 8 m', ' text-anchor="middle" font-size="17"');
    body += arrow('aux', X(10), 222, X(6) - X(10), 0, 3) + text((X(10) + X(6)) / 2, 216, 'regresa 4 m', ' text-anchor="middle" font-size="17"');
    body += arrow('ref', X(2), 160, X(6) - X(2), 0, 4) + text((X(2) + X(6)) / 2, 150, 'Δx = 6 − 2 = 4 m', ' text-anchor="middle" font-size="18"');
    body += '<circle class="dot-trace" cx="' + X(2) + '" cy="' + y + '" r="7"/><circle class="dot-ref" cx="' + X(6) + '" cy="' + y + '" r="7"/>';
    body += text(560, 150, 'distancia = 8 + 4 = 12 m', ' text-anchor="end" font-size="18"');
    return svgBox('0 120 640 170', 'Un móvil sale de x = 2 m, llega a 10 m y regresa a 6 m: su desplazamiento es 4 m pero recorrió 12 m.', body);
  };

  /* ---------- S04 · De velocidad media a instantánea (explainer) ----------
     state.h: separación en segundos entre los dos instantes (x = 8t − t², t0 = 1.5). */
  D['xt-secant'] = function (s) {
    var hh = Math.max(0.02, num(s, 'h', 2)), t0 = 1.5;
    function x(t) { return 8 * t - t * t; }
    var PX = function (t) { return 60 + t * 50; }, PY = function (v) { return 290 - v * 10; };
    var d = '';
    for (var i = 0; i <= 80; i++) { var t = 6 * i / 80; d += (i ? 'L' : 'M') + PX(t).toFixed(1) + ' ' + PY(x(t)).toFixed(1); }
    var m = (x(t0 + hh) - x(t0)) / hh, mt = 8 - 2 * t0;
    function line(slope, cls, w, dash) { return seg(cls, PX(0.2), PY(x(t0) + slope * (0.2 - t0)), PX(4.6), PY(x(t0) + slope * (4.6 - t0)), w, dash); }
    var body = arrow('axis', PX(0), PY(0), 350, 0, 1.3) + arrow('axis', PX(0), PY(0), 0, -180, 1.3) +
      text(PX(7.2), PY(0) + 6, 't', ' font-size="18"') + text(PX(0) - 14, PY(17), 'x', ' font-size="18"') +
      '<path class="ref" d="' + d + '" fill="none" stroke-width="3"/>' +
      line(mt, 'trace', 1.8, '6 6') + line(m, 'aux', 3) +
      '<circle class="dot-ref" cx="' + PX(t0) + '" cy="' + PY(x(t0)) + '" r="6"/>' +
      '<circle class="dot-aux" cx="' + PX(t0 + hh) + '" cy="' + PY(x(t0 + hh)) + '" r="6"/>' +
      text(510, 150, 'Δt = ' + hh.toFixed(2) + ' s', ' text-anchor="middle" font-size="17"') +
      text(510, 176, 'v media = Δx/Δt = ' + m.toFixed(2) + ' m/s', ' text-anchor="middle" font-size="17"') +
      text(510, 206, 'v(1.5) = dx/dt = ' + mt.toFixed(0) + ' m/s', ' text-anchor="middle" font-size="17"');
    return svgBox('0 110 640 200', 'Gráfica de posición x = 8t − t². La recta secante entre dos instantes da la velocidad media; al acercar los instantes se vuelve la tangente, cuya pendiente es la velocidad instantánea.', body);
  };

  /* ---------- S04 · Gráficas del MRU ---------- */
  D['mru-graphs'] = function () {
    function axes(x0, lab) {
      return arrow('axis', x0, 270, 240, 0, 1.3) + arrow('axis', x0, 270, 0, -140, 1.3) + text(x0 + 244, 276, 't', ' font-size="17"') + text(x0 - 12, 126, lab, ' font-size="17"');
    }
    var body = axes(50, 'x') + seg('ref', 50, 240, 270, 150, 3) +
      text(50 - 8, 244, 'x₀', ' text-anchor="end" font-size="16"') +
      seg('axis', 150, 199, 230, 199, 1.3, '4 5') + seg('axis', 230, 199, 230, 166, 1.3, '4 5') +
      text(190, 216, 'Δt', ' text-anchor="middle" font-size="15"') + text(236, 186, 'Δx', ' font-size="15"') +
      text(160, 140, 'pendiente = v', ' text-anchor="middle" font-size="17"') +
      axes(360, 'v') + '<rect class="box-aux" x="360" y="200" width="160" height="70"/>' + seg('aux', 360, 200, 590, 200, 3) +
      text(440, 242, 'área = v·t = Δx', ' text-anchor="middle" font-size="16"') +
      text(470, 180, 'v constante', ' text-anchor="middle" font-size="17"');
    return svgBox('0 110 640 180', 'En el movimiento rectilíneo uniforme, la gráfica x contra t es una recta cuya pendiente es la velocidad; la gráfica v contra t es horizontal y el área bajo ella es el desplazamiento.', body);
  };

  /* ---------- S05 · Gráfica v-t del MRUA ---------- */
  D['mrua-vt'] = function () {
    var body = arrow('axis', 60, 270, 420, 0, 1.3) + arrow('axis', 60, 270, 0, -150, 1.3) +
      text(486, 276, 't', ' font-size="17"') + text(48, 126, 'v', ' font-size="17"') +
      '<path class="box-aux" d="M60 270V220L380 150V270Z" stroke-width="1"/>' +
      seg('ref', 60, 220, 440, 137, 3) +
      text(52, 224, 'v₀', ' text-anchor="end" font-size="17"') + text(390, 146, 'v', ' font-size="17"') +
      seg('axis', 380, 150, 380, 270, 1.3, '4 5') + text(380, 290, 't', ' text-anchor="middle" font-size="16"') +
      text(220, 250, 'área = Δx = ½(v₀ + v)·t', ' text-anchor="middle" font-size="16"') +
      text(560, 170, 'pendiente = a', ' text-anchor="middle" font-size="18"') +
      text(560, 200, 'v = v₀ + a t', ' text-anchor="middle" font-size="18"') +
      text(560, 230, 'Δx = v₀t + ½at²', ' text-anchor="middle" font-size="18"') +
      text(560, 260, 'v² = v₀² + 2aΔx', ' text-anchor="middle" font-size="18"');
    return svgBox('0 110 660 190', 'En el MRUA la gráfica v contra t es una recta con pendiente a; el área bajo ella, un trapecio, es el desplazamiento.', body);
  };

  /* ---------- S05 · Tiro vertical (explainer) ----------
     state.u ∈ [0, 1]: fracción del tiempo hasta volver al punto de salida. state.show: 'launch' | 'top' | 'back'. */
  var VV0 = 14, VT = 2 * VV0 / G, VH = VV0 * VV0 / (2 * G);
  D['vertical-explainer'] = function (s) {
    var u = clamp01(num(s, 'u', 0)), show = (s && s.show) || 'launch', t = VT * u;
    var yb = VV0 * t - G * t * t / 2, vb = VV0 - G * t;
    var PY = function (y) { return 250 - y * 11; }, BX = 110;
    var body = seg('axis', 40, PY(0), 200, PY(0), 1.5) + seg('axis', BX, PY(0), BX, PY(VH), 1.2, '3 6');
    // Gráfica y(t) a la derecha
    var GX = function (tt) { return 260 + tt * 110; }, d = '';
    for (var i = 0; i <= 60; i++) { var ti = VT * i / 60; d += (i ? 'L' : 'M') + GX(ti).toFixed(1) + ' ' + PY(VV0 * ti - G * ti * ti / 2).toFixed(1); }
    body += arrow('axis', GX(0), PY(0), 350, 0, 1.2) + arrow('axis', GX(0), PY(0), 0, -125, 1.2) +
      text(GX(0) + 356, PY(0) + 6, 't', ' font-size="17"') + text(GX(0) - 14, PY(10.8), 'y', ' font-size="17"') +
      '<path class="ref" d="' + d + '" fill="none" stroke-width="2.5" stroke-dasharray="1 8" stroke-linecap="round"/>';
    var dd = '';
    for (var j = 0; j <= 40; j++) { var tj = t * j / 40; dd += (j ? 'L' : 'M') + GX(tj).toFixed(1) + ' ' + PY(VV0 * tj - G * tj * tj / 2).toFixed(1); }
    body += '<path class="trace" d="' + dd + '" fill="none" stroke-width="3"/>';
    body += '<circle class="dot-trace" cx="' + GX(t).toFixed(1) + '" cy="' + PY(yb).toFixed(1) + '" r="5"/>';
    // Pelota con su velocidad y su aceleración
    body += '<circle class="dot-trace" cx="' + BX + '" cy="' + PY(yb).toFixed(1) + '" r="9"/>';
    if (Math.abs(vb) > 1) body += arrow('aux', BX - 22, PY(yb), 0, -vb * 3, 3.2) + text(BX - 30, PY(yb) - vb * 1.5, 'v', ' text-anchor="end" font-size="18"');
    else body += text(BX - 30, PY(yb) + 6, 'v = 0', ' text-anchor="end" font-size="17"');
    body += arrow('error', BX + 22, PY(yb), 0, 36, 3) + text(BX + 30, PY(yb) + 32, 'g', ' font-size="18"');
    if (show === 'launch') body += text(470, 100, 'sube frenando: v = v₀ − g t', ' text-anchor="middle" font-size="18"');
    if (show === 'top') body += text(470, 100, 'arriba v = 0, pero a sigue siendo −g', ' text-anchor="middle" font-size="18"') + text(470, 124, 'H = v₀² / 2g', ' text-anchor="middle" font-size="18"');
    if (show === 'back') body += text(470, 100, 'baja y llega con la misma rapidez', ' text-anchor="middle" font-size="18"') + text(470, 124, 'T = 2v₀ / g', ' text-anchor="middle" font-size="18"');
    return svgBox('0 78 640 222', 'Una pelota lanzada verticalmente hacia arriba: su velocidad disminuye, vale cero arriba y luego crece hacia abajo; la aceleración es siempre g hacia abajo. A la derecha, su gráfica de altura contra tiempo.', body);
  };

  /* ---------- S07 · Cinemática angular ---------- */
  D['circular-kin'] = function () {
    var cx = 200, cy = 222, r = 80, th = 55;
    var px = cx + r * Math.cos(th * RAD), py = cy - r * Math.sin(th * RAD);
    var body = '<circle class="ref" cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke-width="2.5"/>' +
      seg('axis', cx, cy, cx + r, cy, 1.5) + seg('axis', cx, cy, px, py, 1.5) +
      '<path class="aux" fill="none" stroke-width="4" d="M' + (cx + r) + ' ' + cy + 'A' + r + ' ' + r + ' 0 0 0 ' + px.toFixed(1) + ' ' + py.toFixed(1) + '"/>' +
      arc(cx, cy, 30, 0, th) + text(cx + 36, cy - 12, 'θ', ' font-size="19"') +
      text(cx + r / 2, cy + 20, 'r', ' text-anchor="middle" font-size="19"') +
      text(cx + r + 14, cy - 50, 's = rθ', ' font-size="19"') +
      arrow('aux', px, py, -55 * Math.sin(th * RAD), -55 * Math.cos(th * RAD), 3) +
      text(px - 55 * Math.sin(th * RAD) - 10, py - 55 * Math.cos(th * RAD) + 4, 'v = ωr', ' text-anchor="end" font-size="18"') +
      '<circle class="dot-trace" cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="7"/>' +
      text(470, 150, 'ω = Δθ / Δt  (rad/s)', ' text-anchor="middle" font-size="18"') +
      text(470, 180, 'T = 2π / ω,  f = 1 / T', ' text-anchor="middle" font-size="18"') +
      text(470, 210, '1 rev = 2π rad', ' text-anchor="middle" font-size="18"') +
      text(470, 240, 'rpm → rad/s: × 2π / 60', ' text-anchor="middle" font-size="18"');
    return svgBox('0 105 640 210', 'Una partícula en un círculo de radio r recorre un arco s = rθ; su rapidez es v = ωr, tangente al círculo.', body);
  };

  /* ---------- S07 · Por qué a apunta al centro (explainer) ----------
     state.dth: ángulo entre las dos posiciones en grados. state.show: 'v' | 'dv'. */
  D['centripetal-explainer'] = function (s) {
    var dth = Math.max(2, num(s, 'dth', 60)), show = (s && s.show) || 'v';
    var cx = 180, cy = 240, r = 85, a1 = 90 - dth / 2, a2 = 90 + dth / 2, L = 75;
    function P(a) { return [cx + r * Math.cos(a * RAD), cy - r * Math.sin(a * RAD)]; }
    function V(a) { return [-L * Math.sin(a * RAD), -L * Math.cos(a * RAD)]; }   // tangente antihoraria en pantalla
    var p1 = P(a1), p2 = P(a2), v1 = V(a1), v2 = V(a2);
    var body = '<circle class="ref" cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke-width="2" stroke-dasharray="1 8" stroke-linecap="round"/>' +
      '<circle class="dot-ref" cx="' + cx + '" cy="' + cy + '" r="4"/>' +
      arrow('aux', p1[0], p1[1], v1[0], v1[1], 3) + arrow('trace', p2[0], p2[1], v2[0], v2[1], 3) +
      '<circle class="dot-trace" cx="' + p1[0].toFixed(1) + '" cy="' + p1[1].toFixed(1) + '" r="6"/><circle class="dot-trace" cx="' + p2[0].toFixed(1) + '" cy="' + p2[1].toFixed(1) + '" r="6"/>' +
      text(p1[0] + 8, p1[1] + 22, 'v₁', ' font-size="18"') + text(p2[0] - 16, p2[1] + 22, 'v₂', ' text-anchor="end" font-size="18"');
    if (show === 'dv') {
      // Triángulo de velocidades: v₁ y v₂ con la misma cola; Δv = v₂ − v₁.
      var tx = 470, ty = 170;
      body += arrow('aux', tx, ty, v1[0], v1[1], 3) + arrow('trace', tx, ty, v2[0], v2[1], 3) +
        arrow('error', tx + v1[0], ty + v1[1], v2[0] - v1[0], v2[1] - v1[1], 3.5) +
        text(tx + (v1[0] + v2[0]) / 2, ty + (v1[1] + v2[1]) / 2 + 22, 'Δv', ' text-anchor="middle" font-size="19"') +
        text(tx - 50, 290, 'Δv apunta al centro', ' text-anchor="middle" font-size="18"') +
        text(tx - 50, 314, 'a = Δv/Δt → v²/r', ' text-anchor="middle" font-size="18"');
    } else {
      body += text(470, 190, 'misma rapidez,', ' text-anchor="middle" font-size="18"') + text(470, 216, 'distinta dirección:', ' text-anchor="middle" font-size="18"') +
        text(470, 242, 'la velocidad cambia', ' text-anchor="middle" font-size="18"');
    }
    return svgBox('0 100 640 240', 'Dos posiciones en un círculo con sus velocidades, del mismo tamaño pero con distinta dirección. Su diferencia Δv apunta hacia el centro: por eso la aceleración es centrípeta.', body);
  };

  /* ---------- S07 · Velocidad relativa: lancha en un río ---------- */
  D['relative-river'] = function (s) {
    var vb = num(s, 'vb', 4), vc = num(s, 'vc', 3), K = 30, ox = 120, oy = 280;
    var body = '<path class="axis" d="M40 ' + oy + 'H600M40 122H600" stroke-width="2"/>' +
      text(590, 300, 'orilla', ' text-anchor="end" font-size="16"') + text(590, 114, 'orilla', ' text-anchor="end" font-size="16"');
    [180, 230].forEach(function (y) { body += arrow('axis', 380, y, 60, 0, 1.2) + arrow('axis', 480, y, 60, 0, 1.2); });
    body += text(470, 210, 'corriente', ' text-anchor="middle" font-size="16"');
    body += arrow('aux', ox, oy, 0, -vb * K, 3.5) + text(ox - 10, oy - vb * K / 2, 'v lancha/agua', ' text-anchor="end" font-size="17"');
    body += arrow('trace', ox, oy - vb * K, vc * K, 0, 3.5) + text(ox + vc * K / 2, oy - vb * K - 10, 'v agua/orilla', ' text-anchor="middle" font-size="17"');
    body += arrow('ref', ox, oy, vc * K, -vb * K, 4) + text(ox + vc * K / 2 + 16, oy - vb * K / 2 + 20, 'v lancha/orilla', ' font-size="17"');
    return svgBox('0 96 640 220', 'Una lancha apunta perpendicular a la orilla; la corriente la arrastra, así que su velocidad respecto a la orilla es la suma de su velocidad respecto al agua y la del agua.', body);
  };

  /* ---------- Problemas de examen ---------- */

  // Balón y barda, con escala igual en x y en y.
  D['exam-barda'] = function (v) {
    var th = v.th * RAD, vx = v.v0 * Math.cos(th), vy = v.v0 * Math.sin(th);
    var Tf = 2 * vy / G, Rr = vx * Tf, Hh = vy * vy / (2 * G);
    var k = Math.min(540 / (Rr * 1.05), 220 / (Math.max(Hh, v.h) * 1.15));
    var PX = function (x) { return 40 + x * k; }, PY = function (y) { return 270 - y * k; };
    var d = '';
    for (var i = 0; i <= 60; i++) { var t = Tf * i / 60; d += (i ? 'L' : 'M') + PX(vx * t).toFixed(1) + ' ' + PY(vy * t - G * t * t / 2).toFixed(1); }
    var body =
      '<path class="axis" d="M20 ' + PY(0) + 'H600" stroke-width="1.5"/>' +
      '<path class="ref" d="' + d + '" fill="none" stroke-width="3" stroke-dasharray="1 9" stroke-linecap="round"/>' +
      '<rect class="wall" x="' + (PX(v.D) - 4).toFixed(1) + '" y="' + PY(v.h).toFixed(1) + '" width="8" height="' + (v.h * k).toFixed(1) + '"/>' +
      '<path class="axis" d="M' + PX(0) + ' ' + (PY(0) + 16) + 'H' + PX(v.D).toFixed(1) + '" stroke-width="1.2"/>' +
      text((PX(0) + PX(v.D)) / 2, PY(0) + 34, v.D + ' m', ' text-anchor="middle" font-size="18"') +
      text(PX(v.D) + 10, PY(v.h) + 16, v.h + ' m', ' font-size="18"') +
      arrow('aux', PX(0), PY(0), 46 * Math.cos(th), -46 * Math.sin(th), 3) +
      text(PX(0) + 50, PY(0) - 30, 'v₀ = ' + v.v0 + ' m/s', ' font-size="18"');
    return svgBox('0 20 620 300', 'Balón lanzado desde el piso hacia una barda de ' + v.h + ' m que está a ' + v.D + ' m.', body);
  };

  // Canica que sale horizontalmente del borde de una mesa.
  D['exam-mesa'] = function (v) {
    var t = Math.sqrt(2 * v.h / G), xr = v.v0 * t;
    var k = Math.min(360 / Math.max(xr, 0.5), 200 / v.h);
    var X0 = 200, PX = function (x) { return X0 + x * k; }, PY = function (y) { return 270 - y * k; };
    var d = '';
    for (var i = 0; i <= 40; i++) { var ti = t * i / 40; d += (i ? 'L' : 'M') + PX(v.v0 * ti).toFixed(1) + ' ' + PY(v.h - G * ti * ti / 2).toFixed(1); }
    var body =
      '<path class="axis" d="M20 ' + PY(0) + 'H600" stroke-width="1.5"/>' +
      '<path class="table" d="M' + (X0 - 150) + ' ' + PY(v.h).toFixed(1) + 'H' + X0 + 'V' + PY(0) + 'M' + (X0 - 130) + ' ' + PY(v.h).toFixed(1) + 'V' + PY(0) + '" fill="none" stroke-width="3"/>' +
      '<path class="ref" d="' + d + '" fill="none" stroke-width="3" stroke-dasharray="1 9" stroke-linecap="round"/>' +
      arrow('aux', X0, PY(v.h) - 8, 50, 0, 3) +
      text(X0 + 56, PY(v.h) - 2, 'v₀', ' font-size="19"') +
      text(X0 - 8, (PY(v.h) + PY(0)) / 2, 'h = ' + v.h + ' m', ' text-anchor="end" font-size="18"') +
      '<circle class="dot-trace" cx="' + PX(xr).toFixed(1) + '" cy="' + PY(0) + '" r="5"/>';
    return svgBox('0 20 620 300', 'Canica que sale horizontalmente del borde de una mesa de ' + v.h + ' m y cae describiendo media parábola.', body);
  };

  // Dos tramos de un dron (cabeza con cola) y su desplazamiento total.
  D['exam-dron'] = function (v) {
    var p1 = [v.d1 * Math.cos(v.a1 * RAD), v.d1 * Math.sin(v.a1 * RAD)];
    var p2 = [p1[0] + v.d2 * Math.cos(v.a2 * RAD), p1[1] + v.d2 * Math.sin(v.a2 * RAD)];
    var xs = [0, p1[0], p2[0]], ys = [0, p1[1], p2[1]];
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var k = Math.min(440 / Math.max(x1 - x0, 1), 200 / Math.max(y1 - y0, 1));
    var PX = function (x) { return 310 + (x - (x0 + x1) / 2) * k; }, PY = function (y) { return 250 - (y - y0) * k; };
    var body = arrow('axis', PX(0) - 30, PY(0), 70, 0, 1.2) + arrow('axis', PX(0), PY(0) + 30, 0, -70, 1.2) +
      text(PX(0) + 44, PY(0) + 18, 'este', ' font-size="15"') + text(PX(0) + 6, PY(0) - 44, 'norte', ' font-size="15"') +
      arrow('aux', PX(0), PY(0), p1[0] * k, -p1[1] * k, 3.5) + arrow('trace', PX(p1[0]), PY(p1[1]), (p2[0] - p1[0]) * k, -(p2[1] - p1[1]) * k, 3.5) +
      '<path class="ref" d="M' + PX(0).toFixed(1) + ' ' + PY(0).toFixed(1) + 'L' + PX(p2[0]).toFixed(1) + ' ' + PY(p2[1]).toFixed(1) + '" stroke-width="2.5" stroke-dasharray="6 6" fill="none"/>' +
      text(PX(p1[0] / 2) + 8, PY(p1[1] / 2) + 20, v.d1 + ' m', ' font-size="17"') +
      text(PX((p1[0] + p2[0]) / 2) + 10, PY((p1[1] + p2[1]) / 2) - 8, v.d2 + ' m', ' font-size="17"') +
      '<circle class="dot-trace" cx="' + PX(p2[0]).toFixed(1) + '" cy="' + PY(p2[1]).toFixed(1) + '" r="6"/>';
    return svgBox('0 20 620 290', 'Un dron vuela ' + v.d1 + ' m en una dirección y luego ' + v.d2 + ' m en otra; la línea punteada es su desplazamiento total.', body);
  };

  // Tres fuerzas sobre un anillo.
  D['exam-fuerzas'] = function (v) {
    var F = [[v.F1, 0], [v.F2, v.a2], [v.F3, v.a3]], big = Math.max(v.F1, v.F2, v.F3), cx = 310, cy = 180, L = 100;
    var body = '<circle class="ref" cx="' + cx + '" cy="' + cy + '" r="14" fill="none" stroke-width="3"/>';
    F.forEach(function (f, i) {
      var len = 30 + L * f[0] / big, dx = len * Math.cos(f[1] * RAD), dy = -len * Math.sin(f[1] * RAD);
      body += arrow(['aux', 'trace', 'error'][i], cx + 14 * Math.cos(f[1] * RAD), cy - 14 * Math.sin(f[1] * RAD), dx, dy, 3.2) +
        text(cx + (len + 30) * Math.cos(f[1] * RAD) + 42 * Math.cos(f[1] * RAD), cy - (len + 30) * Math.sin(f[1] * RAD) + 6, 'F' + (i + 1) + ' = ' + f[0] + ' N', ' text-anchor="middle" font-size="16"');
    });
    return svgBox('0 0 620 360', 'Tres fuerzas tiran de un anillo en distintas direcciones.', body);
  };

  // Pelota lanzada hacia arriba desde una azotea.
  D['exam-azotea'] = function (v) {
    var k = 200 / (v.h0 + v.v0 * v.v0 / (2 * G)), base = 290, top = base - v.h0 * k;
    var body = '<path class="axis" d="M20 ' + base + 'H600" stroke-width="1.5"/>' +
      '<rect class="box-aux" x="150" y="' + top.toFixed(1) + '" width="110" height="' + (v.h0 * k).toFixed(1) + '"/>' +
      '<circle class="dot-trace" cx="240" cy="' + (top - 10).toFixed(1) + '" r="8"/>' +
      arrow('aux', 262, top - 10, 0, -56, 3.2) + text(270, top - 50, 'v₀ = ' + v.v0 + ' m/s', ' font-size="17"') +
      seg('axis', 240, top - 18, 240, base - (v.h0 + v.v0 * v.v0 / (2 * G)) * k, 1.4, '3 6') +
      seg('axis', 420, top, 420, base, 1.4) + text(430, (top + base) / 2, 'h₀ = ' + v.h0 + ' m', ' font-size="17"');
    return svgBox('0 70 620 240', 'Desde una azotea de ' + v.h0 + ' m se lanza una pelota verticalmente hacia arriba a ' + v.v0 + ' m/s.', body);
  };

  // Lancha que cruza un río apuntando a la otra orilla.
  D['exam-rio'] = function (v) {
    var drift = v.vc * v.w / v.vb, k = Math.min(200 / v.w, 380 / Math.max(drift, 1)), top = 60, bot = top + v.w * k, x0 = 90;
    var body = '<path class="axis" d="M20 ' + top + 'H600M20 ' + bot.toFixed(1) + 'H600" stroke-width="2"/>' +
      arrow('aux', x0, bot, 0, -70, 3.2) + text(x0 - 8, bot - 40, v.vb + ' m/s', ' text-anchor="end" font-size="16"') +
      arrow('trace', 460, (top + bot) / 2, 80, 0, 2.5) + text(500, (top + bot) / 2 - 10, 'corriente ' + v.vc + ' m/s', ' text-anchor="middle" font-size="16"') +
      '<path class="ref" d="M' + x0 + ' ' + bot.toFixed(1) + 'L' + (x0 + drift * k).toFixed(1) + ' ' + top + '" stroke-width="2.5" stroke-dasharray="6 6" fill="none"/>' +
      seg('axis', 560, top, 560, bot, 1.2) + text(570, (top + bot) / 2 + 30, v.w + ' m', ' font-size="16"');
    return svgBox('0 30 620 ' + (bot - 30 + 30).toFixed(0), 'Una lancha cruza un río de ' + v.w + ' m apuntando a la otra orilla mientras la corriente la arrastra.', body);
  };
})();
