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

  /* =================== Bloque C · Dinámica (S08–S11) =================== */
  function box(cx, cy, w, h, rot, cls) {
    return '<rect class="' + (cls || 'box-aux') + '" x="' + (cx - w / 2).toFixed(1) + '" y="' + (cy - h / 2).toFixed(1) + '" width="' + w + '" height="' + h + '" rx="5"' +
      (rot ? ' transform="rotate(' + (-rot) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')"' : '') + '/>';
  }
  // Flecha por ángulo (grados, antihorario desde +x) y longitud, con etiqueta en la punta.
  function force(cls, x, y, ang, len, label, dash) {
    var a = ang * RAD, dx = len * Math.cos(a), dy = -len * Math.sin(a);
    var out = dash ? '<path class="' + cls + '" fill="none" stroke-width="2" stroke-dasharray="' + dash + '" d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'l' + dx.toFixed(1) + ' ' + dy.toFixed(1) + '"/>' : arrow(cls, x, y, dx, dy, 3.2);
    return out + (label ? text(x + dx + 18 * Math.cos(a), y + dy - 18 * Math.sin(a) + 6, label, ' text-anchor="middle" font-size="17"') : '');
  }

  /* ---------- S08 · Cómo armar un DCL (explainer) ----------
     state.step ∈ [0, 4]: situación · peso · normal · tensión · fricción y ejes. */
  D['fbd-explainer'] = function (s) {
    var k = num(s, 'step', 0), cx = 250, cy = 250, th = 30;
    var body = '<path class="axis" d="M40 290H460" stroke-width="2"/>' + box(cx, cy, 80, 80) +
      fade('<path class="axis" d="M' + (cx + 40) + ' ' + (cy - 10) + 'L' + (cx + 40 + 150 * Math.cos(th * RAD)).toFixed(1) + ' ' + (cy - 10 - 150 * Math.sin(th * RAD)).toFixed(1) + '" stroke-width="2"/>' , 1 - clamp01(k)) +
      fade('<circle class="axis" cx="' + cx + '" cy="' + cy + '" r="70" fill="none" stroke-width="1.5" stroke-dasharray="4 6"/>', clamp01(k));
    body += fade(force('error', cx, cy, 270, 70, 'mg'), clamp01(k));
    body += fade(force('aux', cx - 18, cy, 90, 75, 'N'), clamp01(k - 1));
    body += fade(force('ref', cx, cy, th, 110, 'T'), clamp01(k - 2));
    body += fade(force('trace', cx - 40, cy + 30, 180, 70, 'f'), clamp01(k - 3)) +
      fade(arrow('axis', 500, 270, 80, 0, 1.4) + arrow('axis', 500, 270, 0, -80, 1.4) + text(588, 276, 'x', ' font-size="16"') + text(496, 180, 'y', ' font-size="16"'), clamp01(k - 3));
    var cap = ['la situación: una caja jalada por una cuerda', 'aísla la caja: dibújala sola; el peso siempre va', 'cada superficie que toca empuja: normal', 'cada cuerda jala: tensión, a lo largo de la cuerda', 'si hay fricción, contra el movimiento; y los ejes'];
    body += text(320, 122, cap[Math.max(0, Math.min(4, Math.round(k)))], ' text-anchor="middle" font-size="16"');
    return svgBox('0 100 640 250', 'Construcción de un diagrama de cuerpo libre para una caja jalada por una cuerda inclinada: peso, normal, tensión y fricción.', body);
  };

  /* ---------- S08 · Tercera ley ---------- */
  D['newton3'] = function () {
    var body = '<path class="axis" d="M40 270H600" stroke-width="2"/>' + box(380, 230, 90, 80) +
      '<circle class="dot-trace" cx="240" cy="160" r="14"/><path class="axis" d="M240 174V230M240 230L220 270M240 230L260 270M240 190L330 205" stroke-width="3" fill="none"/>' +
      arrow('ref', 335, 215, 70, 0, 3.5) + text(390, 172, 'F persona→caja', ' text-anchor="middle" font-size="16"') +
      arrow('error', 325, 240, -70, 0, 3.5) + text(290, 296, 'F caja→persona', ' text-anchor="middle" font-size="16"') +
      text(550, 180, 'mismo tamaño,', ' text-anchor="middle" font-size="17"') + text(550, 204, 'sentidos opuestos,', ' text-anchor="middle" font-size="17"') +
      text(550, 228, 'cuerpos distintos', ' text-anchor="middle" font-size="17"');
    return svgBox('0 120 640 190', 'Una persona empuja una caja: la caja empuja a la persona con una fuerza igual y opuesta. Actúan sobre cuerpos distintos, así que no se cancelan.', body);
  };

  /* ---------- S08 · Elevador que acelera ---------- */
  D['elevator'] = function () {
    var body = '<rect class="axis" x="180" y="110" width="170" height="200" fill="none" stroke-width="2"/>' + '<path class="axis" d="M265 20V110" stroke-width="2"/>' +
      box(265, 250, 50, 80) + force('error', 265, 250, 270, 70, 'mg') + force('aux', 245, 250, 90, 100, 'N') +
      arrow('ref', 400, 250, 0, -70, 3) + text(412, 200, 'a', ' font-size="18"') +
      text(520, 170, 'N − mg = ma', ' text-anchor="middle" font-size="18"') + text(520, 200, 'N = m(g + a)', ' text-anchor="middle" font-size="18"') +
      text(520, 232, 'la báscula marca N,', ' text-anchor="middle" font-size="16"') + text(520, 254, 'el "peso aparente"', ' text-anchor="middle" font-size="16"');
    return svgBox('0 10 640 310', 'Una persona dentro de un elevador que acelera hacia arriba: la normal es mayor que su peso.', body);
  };

  /* ---------- S09 · Máquina de Atwood (explainer) ----------
     state.step ∈ [0, 3]: sistema · DCL de m₁ · DCL de m₂ · ecuaciones. */
  D['atwood-explainer'] = function (s) {
    var k = num(s, 'step', 0), px = 170, py = 70, R = 34;
    var body = '<path class="axis" d="M110 20H230M' + px + ' 20V' + py + '" stroke-width="2" fill="none"/><circle class="ref" cx="' + px + '" cy="' + py + '" r="' + R + '" fill="none" stroke-width="2.5"/>' +
      '<path class="axis" d="M' + (px - R) + ' ' + py + 'V200M' + (px + R) + ' ' + py + 'V250" stroke-width="1.8" fill="none"/>' +
      box(px - R, 220, 40, 40) + box(px + R, 275, 50, 50, 0, 'box-ref') + text(px - R, 226, 'm₁', ' text-anchor="middle" font-size="16"') + text(px + R, 281, 'm₂', ' text-anchor="middle" font-size="16"');
    body += fade(force('ref', 330, 200, 90, 70, 'T') + force('error', 330, 200, 270, 50, 'm₁g') + arrow('aux', 380, 210, 0, -40, 2.5) + text(392, 190, 'a', ' font-size="16"') +
      text(330, 84, 'm₁ sube:', ' text-anchor="middle" font-size="16"') + text(330, 332, 'T − m₁g = m₁a', ' text-anchor="middle" font-size="17"'), clamp01(k));
    body += fade(force('ref', 490, 200, 90, 70, 'T') + force('error', 490, 200, 270, 80, 'm₂g') + arrow('aux', 540, 190, 0, 40, 2.5) + text(552, 222, 'a', ' font-size="16"') +
      text(490, 84, 'm₂ baja:', ' text-anchor="middle" font-size="16"') + text(490, 332, 'm₂g − T = m₂a', ' text-anchor="middle" font-size="17"'), clamp01(k - 1));
    body += fade('<rect class="box-ref" x="250" y="346" width="370" height="46" rx="8"/>' + text(435, 376, 'suma: a = (m₂ − m₁)g / (m₁ + m₂)', ' text-anchor="middle" font-size="17"'), clamp01(k - 2));
    return svgBox('0 10 640 385', 'Máquina de Atwood: dos masas unidas por una cuerda sobre una polea. Diagrama de cada masa y la ecuación que resulta al sumarlas.', body);
  };

  /* ---------- S09 · Mesa con polea ---------- */
  D['table-pulley'] = function () {
    var body = '<path class="axis" d="M40 170H420V330" stroke-width="2.5" fill="none"/><path class="axis" d="M420 170L432 154" stroke-width="2"/><circle class="ref" cx="432" cy="154" r="14" fill="none" stroke-width="2.5"/>' +
      box(230, 140, 70, 60) + '<path class="axis" d="M265 140H432M446 154V242" stroke-width="1.8" fill="none"/>' + box(446, 265, 46, 46, 0, 'box-ref') +
      text(230, 146, 'm₁', ' text-anchor="middle" font-size="16"') + text(446, 271, 'm₂', ' text-anchor="middle" font-size="16"') +
      force('ref', 270, 110, 0, 70, 'T') + force('trace', 190, 160, 180, 50, 'μm₁g') + force('ref', 485, 265, 90, 60, 'T') + force('error', 485, 265, 270, 80, 'm₂g') +
      text(560, 110, 'T − μm₁g = m₁a', ' text-anchor="middle" font-size="16"') + text(560, 136, 'm₂g − T = m₂a', ' text-anchor="middle" font-size="16"');
    return svgBox('0 80 640 295', 'Un bloque sobre una mesa unido a una masa colgante por una cuerda que pasa por una polea.', body);
  };

  /* ---------- S10 · Ley de Hooke ---------- */
  D['hooke'] = function () {
    var d = 'M70 190';
    for (var i = 0; i < 12; i++) d += 'L' + (90 + i * 20) + ' ' + (190 + (i % 2 ? 14 : -14));
    var body = '<path class="axis" d="M60 140V240" stroke-width="5"/><path class="axis" d="' + d + 'L340 190" stroke-width="2" fill="none"/>' + box(375, 190, 70, 70) +
      seg('axis', 300, 250, 300, 270, 1.4) + seg('axis', 340, 250, 340, 270, 1.4) + seg('axis', 300, 262, 340, 262, 1.4) + text(320, 288, 'x', ' text-anchor="middle" font-size="17"') +
      text(300, 245, 'reposo', ' text-anchor="middle" font-size="13"') +
      force('ref', 410, 190, 0, 70, null) + text(450, 222, 'F aplicada', ' text-anchor="middle" font-size="16"') + force('error', 340, 140, 180, 80, null) + text(300, 128, 'F = −kx', ' text-anchor="middle" font-size="16"') +
      text(540, 118, 'el resorte jala', ' text-anchor="middle" font-size="16"') + text(540, 142, 'contra el estiramiento', ' text-anchor="middle" font-size="16"');
    return svgBox('0 100 640 200', 'Un resorte estirado una distancia x ejerce una fuerza −kx, opuesta al estiramiento.', body);
  };

  /* ---------- S10 · Resortes: colgar, serie y paralelo (explainer) ----------
     state.show: 'free' | 'single' | 'series' | 'parallel'. */
  function coil(x, y0, y1, w, n) {
    var step = (y1 - y0) / (n + 1), d = 'M' + x + ' ' + y0 + 'L' + x + ' ' + (y0 + step / 2).toFixed(1);
    for (var i = 0; i < n; i++) d += 'L' + (x + (i % 2 ? -w : w)) + ' ' + (y0 + step / 2 + step * (i + 0.5)).toFixed(1);
    return '<path class="axis" fill="none" stroke-width="2" d="' + d + 'L' + x + ' ' + (y1 - step / 2).toFixed(1) + 'L' + x + ' ' + y1.toFixed(1) + '"/>';
  }
  D['springs-explainer'] = function (s) {
    var show = (s && s.show) || 'free', top = 40, L = 100, x = 50, cx = 160, body = '<path class="axis" d="M80 ' + top + 'H240" stroke-width="4"/>';
    var bottom = top + L;
    if (show === 'free') body += coil(cx, top, bottom, 12, 10);
    else if (show === 'single') { bottom = top + L + x; body += coil(cx, top, bottom, 12, 10); }
    else if (show === 'series') {
      var mid = top + L / 2 + x;
      bottom = mid + L / 2 + x;
      body += coil(cx, top, mid, 12, 6) + '<circle class="dot-ref" cx="' + cx + '" cy="' + mid + '" r="5"/>' + coil(cx, mid, bottom, 12, 6);
    } else { bottom = top + L + x / 2; body += coil(cx - 30, top, bottom, 12, 10) + coil(cx + 30, top, bottom, 12, 10) + '<path class="axis" d="M' + (cx - 40) + ' ' + bottom + 'H' + (cx + 40) + '" stroke-width="3"/>'; }
    if (show !== 'free') {
      body += box(cx, bottom + 25, 56, 50) + text(cx, bottom + 31, 'm', ' text-anchor="middle" font-size="17"') + force('error', cx + 50, bottom + 25, 270, 45, 'mg');
      body += seg('axis', 60, top + L, 270, top + L, 1.2, '5 6') + '<path class="ref" d="M260 ' + (top + L) + 'V' + bottom + '" stroke-width="3"/>' + text(270, (top + L + bottom) / 2 + 5, 'x', ' font-size="18"');
    }
    var cap = {
      free: ['largo natural: no hace fuerza', 'F = −kx, con x medida', 'desde este largo'],
      single: ['colgando en reposo: kx = mg', 'x = mg/k', 'así se mide k en el laboratorio'],
      series: ['en serie, cada resorte', 'carga todo el peso:', 'x = mg/k₁ + mg/k₂', '1/k = 1/k₁ + 1/k₂ (más blando)'],
      parallel: ['en paralelo se reparten', 'el peso:', 'k = k₁ + k₂ (más rígido)']
    }[show];
    cap.forEach(function (t, n) { body += text(320, 110 + 30 * n, t, ' font-size="17"'); });
    return svgBox('0 20 640 340', 'Un resorte con su largo natural; luego colgando una masa, dos resortes en serie y dos en paralelo, con el estiramiento x.', body);
  };

  /* ---------- S10 · Fricción contra fuerza aplicada ---------- */
  D['friction-graph'] = function () {
    var body = arrow('axis', 80, 280, 460, 0, 1.3) + arrow('axis', 80, 280, 0, -170, 1.3) +
      text(548, 286, 'F', ' font-size="17"') + text(66, 120, 'f', ' font-size="17"') +
      '<path class="trace" d="M80 280L300 150" stroke-width="3" fill="none"/><path class="trace" d="M300 150L300 190L520 190" stroke-width="3" fill="none" stroke-dasharray="1 0"/>' +
      seg('axis', 80, 150, 300, 150, 1.2, '4 5') + seg('axis', 80, 190, 300, 190, 1.2, '4 5') + text(72, 155, 'μₛN', ' text-anchor="end" font-size="15"') + text(72, 195, 'μₖN', ' text-anchor="end" font-size="15"') +
      text(210, 262, 'no se mueve: f = F', ' text-anchor="middle" font-size="15"') + text(420, 175, 'desliza: f = μₖN', ' text-anchor="middle" font-size="15"');
    return svgBox('0 100 640 200', 'La fricción estática crece igual que la fuerza aplicada hasta μsN; cuando la caja arranca, baja a la cinética μkN y se queda constante.', body);
  };

  /* ---------- S10 · Empujar o jalar con ángulo (explainer) ----------
     state.th: ángulo de la fuerza; state.mode: 'pull' | 'push'. */
  D['angle-push-pull'] = function (s) {
    var th = num(s, 'th', 30), pull = (s && s.mode) !== 'push', cx = 230, cy = 210, mg = 100, F = 70;
    var N = mg + (pull ? -1 : 1) * F * Math.sin(th * RAD);
    var body = '<path class="axis" d="M40 250H440" stroke-width="2"/>' + box(cx, cy, 80, 80) + force('error', cx, cy, 270, mg * 0.8, 'mg') + force('aux', cx - 20, cy, 90, N * 0.8, 'N');
    body += pull ? force('ref', cx + 40, cy - 20, th, F * 1.2, 'F') : force('ref', cx - 40 - F * 1.2 * Math.cos(th * RAD), cy - 40 - F * 1.2 * Math.sin(th * RAD), 360 - th, F * 1.2, null) + text(cx - 52 - F * 1.2 * Math.cos(th * RAD), cy - 48 - F * 1.2 * Math.sin(th * RAD), 'F', ' text-anchor="end" font-size="17"');
    body += text(540, 150, pull ? 'jalar hacia arriba:' : 'empujar hacia abajo:', ' text-anchor="middle" font-size="18"') +
      text(540, 180, pull ? 'N = mg − F sin θ' : 'N = mg + F sin θ', ' text-anchor="middle" font-size="19"') +
      text(540, 214, 'θ = ' + Math.round(th) + '°', ' text-anchor="middle" font-size="17"') +
      text(540, 244, pull ? 'menos normal, menos fricción' : 'más normal, más fricción', ' text-anchor="middle" font-size="16"');
    return svgBox('0 70 640 200', 'Caja con una fuerza inclinada: al jalar hacia arriba la normal disminuye; al empujar hacia abajo aumenta.', body);
  };

  /* ---------- S11 · Descomponer el peso en un plano (explainer) ----------
     state.step ∈ [0, 4]: plano · peso · componentes · normal · fricción. */
  D['incline-explainer'] = function (s) {
    var k = num(s, 'step', 0), t = 30, a = t * RAD, x0 = 60, y0 = 300, L = 380;
    var bx = x0 + 0.55 * L * Math.cos(a), by = y0 - 0.55 * L * Math.sin(a), cx = bx - 28 * Math.sin(a), cy = by - 28 * Math.cos(a);
    var body = '<path class="axis" d="M' + x0 + ' ' + y0 + 'L' + (x0 + L * Math.cos(a)).toFixed(1) + ' ' + y0 + 'L' + (x0 + L * Math.cos(a)).toFixed(1) + ' ' + (y0 - L * Math.sin(a)).toFixed(1) + 'Z" stroke-width="2" fill="none"/>' +
      arc(x0, y0, 50, 0, t) + text(x0 + 60, y0 - 10, 'θ', ' font-size="18"') + box(cx, cy, 56, 56, t);
    body += fade(force('error', cx, cy, 270, 110, 'mg'), clamp01(k));
    body += fade(force('error', cx, cy, 180 + t, 55, 'mg sin θ', '6 5') + force('error', cx, cy, 270 + t, 95, 'mg cos θ', '6 5'), clamp01(k - 1));
    body += fade(force('aux', cx, cy, 90 + t, 95, 'N'), clamp01(k - 2));
    body += fade(force('trace', cx, cy, t, 45, 'f'), clamp01(k - 3));
    var cap = ['un bloque sobre un plano de ángulo θ', 'el peso apunta vertical, no contra el plano', 'componentes: mg sin θ a lo largo, mg cos θ contra el plano', 'N equilibra mg cos θ: N = mg cos θ', 'si baja, la fricción apunta plano arriba: μN'];
    body += text(380, 62, cap[Math.max(0, Math.min(4, Math.round(k)))], ' text-anchor="middle" font-size="16"');
    return svgBox('0 40 640 280', 'Bloque sobre un plano inclinado: el peso se descompone en mg sin θ a lo largo del plano y mg cos θ perpendicular; la normal equilibra la parte perpendicular.', body);
  };

  /* ---------- S11 · Curva peraltada ---------- */
  D['banked-curve'] = function () {
    var t = 18, a = t * RAD, cx = 300, cy = 210;
    var body = '<path class="axis" d="M' + (cx - 170 * Math.cos(a)).toFixed(1) + ' ' + (cy + 40 + 170 * Math.sin(a)).toFixed(1) + 'L' + (cx + 170 * Math.cos(a)).toFixed(1) + ' ' + (cy + 40 - 170 * Math.sin(a)).toFixed(1) + '" stroke-width="3"/>' +
      box(cx, cy + 12, 90, 50, t) + force('error', cx, cy, 270, 80, 'mg') + force('aux', cx, cy, 90 + t, 100, 'N') + force('aux', cx, cy - 95, 180, 100 * Math.sin(a), null, '6 5') + text(cx - 40, cy - 88, 'N sin θ', ' text-anchor="end" font-size="15"') +
      arrow('ref', 150, 110, -100, 0, 3) + text(100, 96, 'al centro', ' text-anchor="middle" font-size="16"') +
      text(545, 110, 'sin fricción:', ' text-anchor="middle" font-size="17"') + text(545, 136, 'N sin θ = mv²/r', ' text-anchor="middle" font-size="17"') +
      text(545, 162, 'N cos θ = mg', ' text-anchor="middle" font-size="17"') + text(545, 190, 'v = √(rg tan θ)', ' text-anchor="middle" font-size="18"');
    return svgBox('0 70 640 250', 'Corte de una curva peraltada: la componente horizontal de la normal empuja al auto hacia el centro de la curva.', body);
  };

  /* ---------- S11 · Bloque en un plano unido a una masa colgante ---------- */
  D['incline-pulley'] = function () {
    var t = 30, a = t * RAD, x0 = 60, y0 = 300, L = 360, tx = x0 + L * Math.cos(a), ty = y0 - L * Math.sin(a);
    var bx = x0 + 0.5 * L * Math.cos(a), by = y0 - 0.5 * L * Math.sin(a), cx = bx - 25 * Math.sin(a), cy = by - 25 * Math.cos(a);
    var body = '<path class="axis" d="M' + x0 + ' ' + y0 + 'L' + tx.toFixed(1) + ' ' + y0 + 'L' + tx.toFixed(1) + ' ' + ty.toFixed(1) + 'Z" stroke-width="2" fill="none"/>' +
      '<circle class="ref" cx="' + (tx + 8).toFixed(1) + '" cy="' + (ty - 8).toFixed(1) + '" r="12" fill="none" stroke-width="2.5"/>' + box(cx, cy, 50, 50, t) +
      '<path class="axis" d="M' + (cx + 25 * Math.cos(a)).toFixed(1) + ' ' + (cy - 25 * Math.sin(a)).toFixed(1) + 'L' + (tx - 2).toFixed(1) + ' ' + (ty - 18).toFixed(1) + 'M' + (tx + 20).toFixed(1) + ' ' + (ty - 8).toFixed(1) + 'V' + (ty + 90).toFixed(1) + '" stroke-width="1.8" fill="none"/>' +
      box(tx + 20, ty + 110, 40, 40, 0, 'box-ref') + text(cx, cy + 5, 'm₁', ' text-anchor="middle" font-size="15"') + text(tx + 20, ty + 116, 'm₂', ' text-anchor="middle" font-size="15"') +
      text(530, 110, 'm₂g − T = m₂a', ' text-anchor="middle" font-size="16"') + text(530, 136, 'T − m₁g sin θ − f = m₁a', ' text-anchor="middle" font-size="16"');
    return svgBox('0 70 640 250', 'Un bloque sobre un plano inclinado unido por una cuerda, que pasa por una polea en lo alto, a una masa que cuelga.', body);
  };

  // Caja jalada con una cuerda inclinada (problemas de examen).
  D['exam-jalon'] = function (v) {
    var cx = 250, cy = 210, th = v.th;
    var body = '<path class="axis" d="M40 250H600" stroke-width="2"/>' + box(cx, cy, 80, 80) +
      '<path class="axis" d="M' + (cx + 40) + ' ' + (cy - 20) + 'L' + (cx + 40 + 170 * Math.cos(th * RAD)).toFixed(1) + ' ' + (cy - 20 - 170 * Math.sin(th * RAD)).toFixed(1) + '" stroke-width="2"/>' +
      arc(cx + 40, cy - 20, 50, 0, th) + text(cx + 100, cy - 26, 'θ = ' + th + '°', ' font-size="16"') +
      text(cx, cy + 6, v.m + ' kg', ' text-anchor="middle" font-size="16"') + text(cx + 40 + 175 * Math.cos(th * RAD), cy - 30 - 170 * Math.sin(th * RAD), 'F = ' + v.F + ' N', ' font-size="16"');
    return svgBox('0 60 640 210', 'Una caja de ' + v.m + ' kg jalada con una cuerda que forma ' + th + ' grados con la horizontal.', body);
  };

  // Máquina de Atwood con valores (problemas de examen).
  D['exam-atwood'] = function (v) {
    var px = 310, py = 60, R = 36;
    var body = '<path class="axis" d="M240 15H380M' + px + ' 15V' + py + '" stroke-width="2" fill="none"/><circle class="ref" cx="' + px + '" cy="' + py + '" r="' + R + '" fill="none" stroke-width="2.5"/>' +
      '<path class="axis" d="M' + (px - R) + ' ' + py + 'V180M' + (px + R) + ' ' + py + 'V210" stroke-width="1.8" fill="none"/>' +
      box(px - R, 205, 50, 50) + box(px + R, 240, 56, 56, 0, 'box-ref') +
      text(px - R, 211, v.m1 + ' kg', ' text-anchor="middle" font-size="14"') + text(px + R, 246, v.m2 + ' kg', ' text-anchor="middle" font-size="14"');
    return svgBox('0 0 620 290', 'Máquina de Atwood con masas de ' + v.m1 + ' y ' + v.m2 + ' kg.', body);
  };

  // Bloque en un plano inclinado (problemas de examen).
  D['exam-plano'] = function (v) {
    var t = v.th, a = t * RAD, x0 = 60, y0 = 290, L = 440;
    var bx = x0 + 0.6 * L * Math.cos(a), by = y0 - 0.6 * L * Math.sin(a), cx = bx - 28 * Math.sin(a), cy = by - 28 * Math.cos(a);
    var body = '<path class="axis" d="M' + x0 + ' ' + y0 + 'L' + (x0 + L * Math.cos(a)).toFixed(1) + ' ' + y0 + 'L' + (x0 + L * Math.cos(a)).toFixed(1) + ' ' + (y0 - L * Math.sin(a)).toFixed(1) + 'Z" stroke-width="2" fill="none"/>' +
      arc(x0, y0, 55, 0, t) + text(x0 + 66, y0 - 10, t + '°', ' font-size="16"') + box(cx, cy, 56, 56, t) +
      text(cx, cy + 5, v.m + ' kg', ' text-anchor="middle" font-size="14"');
    return svgBox('0 ' + Math.floor(y0 - L * Math.sin(a) - 30) + ' 620 ' + Math.ceil(L * Math.sin(a) + 50), 'Un bloque de ' + v.m + ' kg sobre un plano inclinado ' + t + ' grados.', body);
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
  D['exam-dron-vuelo'] = function (v) {
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

  /* =================== Bloque D · Trabajo y energía (S12–S13) =================== */
  /* ---------- S12 · Trabajo con ángulo (explainer) ----------
     state.th: ángulo entre la fuerza y el desplazamiento (0–180). */
  D['work-angle'] = function (s) {
    var th = num(s, 'th', 30), cx = 200, cy = 220, F = 120, c = Math.cos(th * RAD);
    var body = '<path class="axis" d="M40 260H440" stroke-width="2"/>' + box(cx, cy, 80, 80) +
      force('ref', cx + 40, cy - 10, th, F, 'F') +
      seg('ref', cx + 40, cy - 10, cx + 40 + F * c, cy - 10, 3, '6 5') + text(c >= 0 ? cx + 50 + F * c : cx + 40 + F * c - 50, cy - 18, 'F cos θ', ' text-anchor="' + (c >= 0 ? 'start' : 'end') + '" font-size="15"') +
      arc(cx + 40, cy - 10, 36, 0, th) + text(cx + 86, cy - 22, 'θ', ' font-size="17"') +
      arrow('aux', 120, 290, 180, 0, 3) + text(210, 316, 'desplazamiento d', ' text-anchor="middle" font-size="16"');
    var sign = Math.abs(c) < 0.02 ? 'W = 0: la fuerza no trabaja' : c > 0 ? 'W > 0: la fuerza ayuda' : 'W < 0: la fuerza frena';
    body += text(545, 150, 'W = F d cos θ', ' text-anchor="middle" font-size="19"') + text(545, 184, 'θ = ' + Math.round(th) + '°', ' text-anchor="middle" font-size="17"') +
      text(545, 216, sign, ' text-anchor="middle" font-size="16"') + text(545, 244, 'solo cuenta la parte', ' text-anchor="middle" font-size="14"') + text(545, 264, 'a lo largo de d', ' text-anchor="middle" font-size="14"');
    return svgBox('0 70 640 260', 'Una caja se desplaza una distancia d mientras una fuerza F forma un ángulo θ con el desplazamiento; solo la componente F cos θ hace trabajo.', body);
  };

  /* ---------- S12 · Trabajo como área (explainer) ----------
     state.show: 'const' | 'spring' | 'var'. */
  D['work-area-explainer'] = function (s) {
    var show = (s && s.show) || 'const', x0 = 80, y0 = 290, W = 380, H = 170;
    var body = arrow('axis', x0, y0, W + 40, 0, 1.3) + arrow('axis', x0, y0, 0, -H - 30, 1.3) + text(x0 + W + 48, y0 + 6, 'x', ' font-size="17"') + text(x0 - 8, y0 - H - 36, 'F', ' font-size="17"');
    var path, cap, fill;
    if (show === 'const') {
      fill = 'M' + x0 + ' ' + y0 + 'V' + (y0 - 110) + 'H' + (x0 + 300) + 'V' + y0 + 'Z'; path = 'M' + x0 + ' ' + (y0 - 110) + 'H' + (x0 + 300);
      cap = ['fuerza constante:', 'el área es un rectángulo', 'W = F·d'];
    } else if (show === 'spring') {
      fill = 'M' + x0 + ' ' + y0 + 'L' + (x0 + 300) + ' ' + (y0 - 160) + 'V' + y0 + 'Z'; path = 'M' + x0 + ' ' + y0 + 'L' + (x0 + 340) + ' ' + (y0 - 181);
      cap = ['resorte: F = kx crece', 'el área es un triángulo', 'W = ½ k x²'];
      body += text(x0 + 300, y0 + 22, 'x', ' text-anchor="middle" font-size="16"') + text(x0 + 312, y0 - 160, 'kx', ' font-size="16"');
    } else {
      var pts = [], fpts = 'M' + x0 + ' ' + y0;
      for (var i = 0; i <= 40; i++) { var u = i / 40, px = x0 + 340 * u, py = y0 - 40 - 130 * u * u; pts.push(px.toFixed(1) + ' ' + py.toFixed(1)); if (u <= 300 / 340 + 1e-9) fpts += 'L' + px.toFixed(1) + ' ' + py.toFixed(1); }
      path = 'M' + pts.join('L'); fill = fpts + 'L' + (x0 + 300) + ' ' + y0 + 'Z';
      cap = ['fuerza que cambia:', 'el área bajo la curva', 'W = ∫ F dx'];
    }
    body += '<path class="area-fill" d="' + fill + '"/>' + '<path class="ref" d="' + path + '" stroke-width="3.5" fill="none"/>' +
      seg('axis', x0 + 300, y0, x0 + 300, y0 - 190, 1.2, '4 5');
    cap.forEach(function (t, n) { body += text(545, 150 + 30 * n, t, ' text-anchor="middle" font-size="17"'); });
    return svgBox('0 90 640 230', 'Gráfica de fuerza contra posición: el trabajo es el área bajo la curva, un rectángulo si F es constante y un triángulo en un resorte.', body);
  };

  /* ---------- S13 · Conservación de la energía (explainer) ----------
     state.u ∈ [0, 1]: posición del carrito en la rampa (0 arriba, 1 abajo). */
  D['energy-explainer'] = function (s) {
    var u = clamp01(num(s, 'u', 0)), x0 = 50, x1 = 330, base = 290, h = 190;
    var d = '';
    for (var i = 0; i <= 30; i++) { var q = i / 30; d += (i ? 'L' : 'M') + (x0 + (x1 - x0) * q).toFixed(1) + ' ' + (base - h * (1 - q) * (1 - q)).toFixed(1); }
    var y = h * (1 - u) * (1 - u), frac = y / h, cx = x0 + (x1 - x0) * u, cy = base - y - 13;
    var body = '<path class="axis" d="' + d + 'H400" stroke-width="3" fill="none"/>' + box(cx, cy, 30, 20) +
      seg('axis', 30, base - h, 30, base, 1.2) + text(24, base - h / 2, 'h', ' text-anchor="end" font-size="17"');
    var bx = 440, bw = 50, bh = 170, bb = 290;
    body += '<rect class="box-ref" x="' + bx + '" y="' + (bb - bh * frac).toFixed(1) + '" width="' + bw + '" height="' + Math.max(bh * frac, 0.5).toFixed(1) + '"/>' +
      '<rect class="box-aux" x="' + (bx + 80) + '" y="' + (bb - bh * (1 - frac)).toFixed(1) + '" width="' + bw + '" height="' + Math.max(bh * (1 - frac), 0.5).toFixed(1) + '"/>' +
      seg('axis', bx - 10, bb - bh, bx + 140, bb - bh, 1.2, '5 5') + text(bx + 25, bb + 22, 'U = mgy', ' text-anchor="middle" font-size="15"') + text(bx + 105, bb + 22, 'K = ½mv²', ' text-anchor="middle" font-size="15"') +
      text(bx + 65, bb - bh - 10, 'E = mgh (fija)', ' text-anchor="middle" font-size="15"');
    var cap = u < 0.02 ? 'arriba: toda es potencial' : u > 0.98 ? 'abajo: toda es cinética, v = √(2gh)' : Math.abs(frac - 0.5) < 0.04 ? 'a media altura: K = U' : 'U se convierte en K';
    body += text(200, 110, cap, ' text-anchor="middle" font-size="17"');
    return svgBox('0 85 640 235', 'Un carrito baja por una rampa sin fricción: la energía potencial se convierte en cinética y la suma no cambia.', body);
  };

  /* ---------- S13 · Rampa, tramo áspero y resorte ---------- */
  D['energy-track'] = function () {
    var body = '<path class="axis" d="M40 110Q120 290 200 290H600" stroke-width="3" fill="none"/>' + box(60, 128, 30, 20) +
      seg('axis', 26, 110, 26, 290, 1.2) + text(20, 205, 'h', ' text-anchor="end" font-size="17"');
    var hatch = '';
    for (var j = 250; j < 420; j += 12) hatch += 'M' + j + ' 292l-8 10';
    body += '<path class="error" d="' + hatch + '" stroke-width="1.5" fill="none"/>' + text(335, 325, 'tramo áspero: pierde μₖmgd', ' text-anchor="middle" font-size="15"') +
      '<path class="axis" d="M600 230V290" stroke-width="5"/>' + '<path class="axis" d="M600 270L590 262L580 278L570 262L560 278L550 262L540 270" stroke-width="2" fill="none"/>' + text(570, 250, 'k', ' text-anchor="middle" font-size="16"') +
      text(420, 140, 'mgh − μₖmgd = ½kx²', ' text-anchor="middle" font-size="18"') + text(420, 170, 'lo perdido se va en calor', ' text-anchor="middle" font-size="15"');
    return svgBox('0 90 640 250', 'Un carrito baja por una rampa lisa, cruza un tramo áspero y comprime un resorte.', body);
  };

  /* =================== Bloque E · Estática (S14–S15) =================== */
  /* ---------- S14 · Nudo con dos cables (explainer) ----------
     state.step ∈ [0, 3]: situación · DCL · componentes · polígono. */
  D['knot-explainer'] = function (s) {
    var k = num(s, 'step', 0), a = 35, b = 60, K = [180, 200], ceil = 70, dy = K[1] - ceil;
    var A = [K[0] - dy / Math.tan(a * RAD), ceil], B = [K[0] + dy / Math.tan(b * RAD), ceil];
    var body = '<path class="axis" d="M20 ' + ceil + 'H340" stroke-width="4"/>' +
      '<path class="axis" d="M' + A[0].toFixed(1) + ' ' + ceil + 'L' + K[0] + ' ' + K[1] + 'L' + B[0].toFixed(1) + ' ' + ceil + 'M' + K[0] + ' ' + K[1] + 'V260" stroke-width="2" fill="none"/>' +
      box(K[0], 282, 50, 44, 0, 'box-ref') + text(K[0], 288, 'm', ' text-anchor="middle" font-size="16"') +
      arc(A[0], ceil, 40, 360 - a, 360) + text(A[0] + 46, ceil + 22, 'θ₁', ' font-size="15"') + arc(B[0], ceil, 40, 180, 180 + b) + text(B[0] - 50, ceil + 28, 'θ₂', ' font-size="15"');
    var N = [470, 200];
    body += fade('<circle class="dot-ref" cx="' + N[0] + '" cy="' + N[1] + '" r="5"/>' + force('aux', N[0], N[1], 180 - a, 90, 'T₁') + force('ref', N[0], N[1], b, 105, 'T₂') + force('error', N[0], N[1], 270, 80, 'mg'), clamp01(k));
    body += fade(seg('aux', N[0], N[1], N[0] - 90 * Math.cos(a * RAD), N[1], 2, '5 5') + seg('ref', N[0], N[1], N[0] + 105 * Math.cos(b * RAD), N[1], 2, '5 5'), clamp01(k - 1));
    var cap = ['un peso cuelga de dos cables', 'cuerpo libre del nudo: tres fuerzas', 'ΣFx = 0: T₁ cos θ₁ = T₂ cos θ₂', 'ΣFy = 0: T₁ sin θ₁ + T₂ sin θ₂ = mg'];
    body += text(470, 335, cap[Math.max(0, Math.min(3, Math.round(k)))], ' text-anchor="middle" font-size="16"');
    return svgBox('0 50 640 300', 'Un peso cuelga de un nudo sostenido por dos cables con ángulos distintos; a la derecha, el diagrama de cuerpo libre del nudo.', body);
  };

  /* ---------- S14 · Cable casi horizontal ---------- */
  D['sag-cable'] = function () {
    var body = '<path class="axis" d="M40 110V170M600 110V170" stroke-width="5"/>' +
      '<path class="axis" d="M40 130L320 160L600 130" stroke-width="2" fill="none"/>' + box(320, 190, 40, 36, 0, 'box-ref') +
      arc(40, 130, 60, 354, 360) + text(110, 128, 'θ pequeño', ' font-size="15"') +
      text(320, 250, 'T = mg / (2 sin θ)', ' text-anchor="middle" font-size="18"') + text(320, 278, 'si θ → 0, la tensión se dispara', ' text-anchor="middle" font-size="15"');
    return svgBox('0 90 640 200', 'Una masa cuelga del centro de un cable casi horizontal: con un ángulo pequeño la tensión es mucho mayor que el peso.', body);
  };

  /* ---------- S15 · Torque (explainer) ----------
     state.th: ángulo entre el brazo r y la fuerza F. */
  D['torque-explainer'] = function (s) {
    var th = num(s, 'th', 90), P = [90, 230], L = 240, E = [P[0] + L, P[1]];
    var body = '<path class="axis" d="M' + P[0] + ' ' + P[1] + 'H' + E[0] + '" stroke-width="8" stroke-linecap="round"/>' + '<circle class="dot-ref" cx="' + P[0] + '" cy="' + P[1] + '" r="7"/>' +
      text(P[0], P[1] + 30, 'pivote', ' text-anchor="middle" font-size="15"') + text(P[0] + L / 2, P[1] + 30, 'r', ' text-anchor="middle" font-size="17"') +
      force('ref', E[0], E[1], th, 100, 'F') + arc(E[0], E[1], 30, 0, th) + text(E[0] + 44 * Math.cos(th * RAD / 2) + 4, E[1] - 44 * Math.sin(th * RAD / 2) + 10, 'θ', ' font-size="16"') +
      seg('ref', E[0], E[1], E[0], E[1] - 100 * Math.sin(th * RAD), 2, '5 5');
    body += text(540, 150, 'τ = r F sin θ', ' text-anchor="middle" font-size="19"') + text(540, 182, 'θ = ' + Math.round(th) + '°', ' text-anchor="middle" font-size="17"') +
      text(540, 214, 'solo gira la parte', ' text-anchor="middle" font-size="15"') + text(540, 236, 'perpendicular al brazo', ' text-anchor="middle" font-size="15"');
    return svgBox('0 90 640 190', 'Una barra con pivote en un extremo y una fuerza F en el otro con ángulo θ: el torque es r F sin θ.', body);
  };

  /* ---------- S15 · Balancín ---------- */
  D['seesaw'] = function () {
    var body = '<path class="axis" d="M80 200H560" stroke-width="8" stroke-linecap="round"/>' + '<path class="axis" d="M320 204l-22 40h44z" stroke-width="2" fill="none"/>' +
      box(130, 175, 44, 44) + box(470, 170, 54, 54, 0, 'box-ref') + force('error', 130, 200, 270, 60, 'F₁') + force('error', 470, 200, 270, 80, 'F₂') +
      seg('axis', 130, 270, 320, 270, 1.3) + seg('axis', 320, 270, 470, 270, 1.3) + text(225, 290, 'x₁', ' text-anchor="middle" font-size="16"') + text(395, 290, 'x₂', ' text-anchor="middle" font-size="16"') +
      text(320, 130, 'F₁ x₁ = F₂ x₂', ' text-anchor="middle" font-size="19"');
    return svgBox('0 110 640 195', 'Un balancín con un peso chico lejos del pivote y uno grande cerca: se equilibran cuando F₁x₁ = F₂x₂.', body);
  };

  /* ---------- S15 · Viga con dos apoyos (explainer) ----------
     state.step ∈ [0, 3]: situación · DCL · torques respecto a A · suma de fuerzas. */
  D['beam-explainer'] = function (s) {
    var k = num(s, 'step', 0), X = function (x) { return 60 + 80 * x; }, Y = 200;
    var body = '<rect class="box-base" x="' + X(0) + '" y="' + (Y - 8) + '" width="480" height="16" rx="3"/>' +
      '<path class="axis" d="M' + X(1) + ' ' + (Y + 8) + 'l-16 26h32zM' + X(5) + ' ' + (Y + 8) + 'l-16 26h32z" stroke-width="2" fill="none"/>' +
      text(X(1), Y + 52, 'A', ' text-anchor="middle" font-size="16"') + text(X(5), Y + 52, 'B', ' text-anchor="middle" font-size="16"') +
      force('error', X(2), Y - 70, 270, 60, null) + text(X(2), Y - 80, '300 N', ' text-anchor="middle" font-size="15"') +
      force('error', X(4.5), Y - 90, 270, 80, null) + text(X(4.5) + 10, Y - 84, '500 N', ' text-anchor="start" font-size="15"');
    body += fade(force('aux', X(3), Y - 50, 270, 42, null) + text(X(3) + 8, Y - 56, 'Mg', ' font-size="15"') +
      force('ref', X(1) - 30, Y + 90, 90, 70, null) + force('ref', X(5) + 30, Y + 90, 90, 70, null) + text(X(1) - 38, Y + 80, 'RA', ' text-anchor="end" font-size="15"') + text(X(5) + 38, Y + 80, 'RB', ' font-size="15"'), clamp01(k));
    body += fade(seg('axis', X(1), Y + 66, X(2), Y + 66, 1.3) + seg('axis', X(1), Y + 76, X(4.5), Y + 76, 1.3) + seg('axis', X(1), Y + 86, X(5), Y + 86, 1.3) + text(X(2) + 6, Y + 70, '1 m', ' font-size="12"') + text(X(4.5) + 6, Y + 80, '3.5 m', ' font-size="12"') + text(X(5) + 6, Y + 96, '4 m', ' font-size="12"'), clamp01(k - 1));
    var cap = ['una viga sobre dos apoyos con dos cargas', 'cuerpo libre: cargas, peso propio en el centro y dos reacciones', 'torques respecto a A: RA no aparece; despeja RB', 'ΣF = 0: RA = (suma de cargas) − RB'];
    body += text(320, 80, cap[Math.max(0, Math.min(3, Math.round(k)))], ' text-anchor="middle" font-size="16"');
    return svgBox('0 55 640 255', 'Una viga sobre dos apoyos A y B con dos cargas; su diagrama de cuerpo libre y los brazos medidos desde A.', body);
  };

  /* ---------- S15 · Viga con cable (pluma) ---------- */
  D['boom-cable'] = function () {
    var th = 30, P = [80, 260], L = 340, E = [P[0] + L, P[1]], top = [P[0], P[1] - L * Math.tan(th * RAD)];
    var body = '<path class="axis" d="M' + P[0] + ' ' + (top[1] - 10).toFixed(1) + 'V' + (P[1] + 30) + '" stroke-width="6"/>' +
      '<path class="axis" d="M' + P[0] + ' ' + P[1] + 'H' + E[0] + '" stroke-width="8" stroke-linecap="round"/>' +
      '<path class="axis" d="M' + P[0] + ' ' + top[1].toFixed(1) + 'L' + E[0] + ' ' + E[1] + '" stroke-width="2"/>' +
      arc(E[0], E[1], 50, 180 - th, 180) + text(E[0] - 70, E[1] - 12, 'θ', ' font-size="16"') +
      box(E[0], E[1] + 40, 40, 36, 0, 'box-ref') + '<path class="axis" d="M' + E[0] + ' ' + E[1] + 'V' + (E[1] + 22) + '" stroke-width="1.8"/>' +
      '<circle class="dot-ref" cx="' + P[0] + '" cy="' + P[1] + '" r="6"/>' + text(P[0] + 10, P[1] + 30, 'bisagra', ' font-size="15"') +
      text(250, top[1] + 10, 'torques en la bisagra:', ' font-size="16"') + text(250, top[1] + 36, 'T L sin θ = W L + Mg L/2', ' font-size="16"');
    return svgBox('0 ' + Math.floor(top[1] - 30) + ' 640 ' + Math.ceil(P[1] - top[1] + 110), 'Una viga horizontal con bisagra en la pared, sostenida por un cable inclinado y con una carga colgada en la punta.', body);
  };

  /* ---------- Problemas de examen · bloques D–E ---------- */
  // Carrito que baja por una rampa, cruza un tramo áspero y choca con un resorte.
  D['exam-rampa-resorte'] = function (v) {
    var body = '<path class="axis" d="M40 110Q120 290 200 290H600" stroke-width="3" fill="none"/>' + box(60, 128, 30, 20) +
      seg('axis', 26, 110, 26, 290, 1.2) + text(18, 205, 'h = ' + v.h + ' m', ' text-anchor="end" font-size="15"');
    var hatch = '';
    for (var j = 250; j < 420; j += 12) hatch += 'M' + j + ' 292l-8 10';
    body += '<path class="error" d="' + hatch + '" stroke-width="1.5" fill="none"/>' + text(335, 325, v.d + ' m, μₖ = ' + v.mu, ' text-anchor="middle" font-size="15"') +
      '<path class="axis" d="M600 230V290" stroke-width="5"/>' + '<path class="axis" d="M600 270L590 262L580 278L570 262L560 278L550 262L540 270" stroke-width="2" fill="none"/>' + text(590, 215, 'k = ' + v.k + ' N/m', ' text-anchor="end" font-size="14"');
    return svgBox('-70 90 710 250', 'Un carrito de ' + v.m + ' kg se suelta desde ' + v.h + ' m, cruza un tramo áspero de ' + v.d + ' m y comprime un resorte.', body);
  };
  // Peso colgado de dos cables.
  D['exam-cables'] = function (v) {
    var a = v.a, b = v.b, K = [320, 190], ceil = 50, dy = K[1] - ceil;
    var A = [K[0] - dy / Math.tan(a * RAD), ceil], B = [K[0] + dy / Math.tan(b * RAD), ceil];
    var body = '<path class="axis" d="M' + Math.min(A[0] - 20, 60).toFixed(1) + ' ' + ceil + 'H' + Math.max(B[0] + 20, 580).toFixed(1) + '" stroke-width="4"/>' +
      '<path class="axis" d="M' + A[0].toFixed(1) + ' ' + ceil + 'L' + K[0] + ' ' + K[1] + 'L' + B[0].toFixed(1) + ' ' + ceil + 'M' + K[0] + ' ' + K[1] + 'V240" stroke-width="2" fill="none"/>' +
      box(K[0], 262, 60, 44, 0, 'box-ref') + text(K[0], 268, v.m + ' kg', ' text-anchor="middle" font-size="15"') +
      arc(A[0], ceil, 44, 360 - a, 360) + text(A[0] + 50, ceil + 24, a + '°', ' font-size="15"') + arc(B[0], ceil, 44, 180, 180 + b) + text(B[0] - 54, ceil + 30, b + '°', ' text-anchor="end" font-size="15"');
    return svgBox('0 30 640 260', 'Una masa de ' + v.m + ' kg cuelga de dos cables que forman ' + a + ' y ' + b + ' grados con el techo.', body);
  };
  // Viga con dos apoyos y una carga.
  D['exam-viga'] = function (v) {
    var X = function (x) { return 60 + 520 * x / v.L; }, Y = 170;
    var body = '<rect class="box-base" x="60" y="' + (Y - 8) + '" width="520" height="16" rx="3"/>' +
      '<path class="axis" d="M' + X(v.a).toFixed(1) + ' ' + (Y + 8) + 'l-16 26h32zM' + X(v.b).toFixed(1) + ' ' + (Y + 8) + 'l-16 26h32z" stroke-width="2" fill="none"/>' +
      text(X(v.a), Y + 52, 'A', ' text-anchor="middle" font-size="15"') + text(X(v.b), Y + 52, 'B', ' text-anchor="middle" font-size="15"') +
      force('error', X(v.x), Y - 80, 270, 70, null) + text(X(v.x), Y - 88, v.F + ' N', ' text-anchor="middle" font-size="15"');
    var marks = [0, v.a, v.x, v.b, v.L].filter(function (x, i, arr) { return arr.indexOf(x) === i; }).sort(function (p, q) { return p - q; });
    marks.forEach(function (x) { body += seg('axis', X(x), Y + 62, X(x), Y + 72, 1.3) + text(X(x), Y + 90, x + ' m', ' text-anchor="middle" font-size="13"'); });
    body += seg('axis', 60, Y + 67, 580, Y + 67, 1.2);
    return svgBox('0 55 640 225', 'Una viga de ' + v.L + ' m y ' + v.M + ' kg sobre apoyos en ' + v.a + ' y ' + v.b + ' m, con una carga de ' + v.F + ' N en ' + v.x + ' m.', body);
  };

  /* ---------- Problemas de examen · figuras del lote de "un dibujo por problema" ---------- */
  // Vectores desde el origen (2D) o en perspectiva (3D). s.vecs: [[x, y, z, etiqueta, clase]]; s.chain: punta con cola.
  D['exam-vectors'] = function (s) {
    var vecs = s.vecs || [], d3 = !!s.d3, body = '';
    // Proyección oblicua: x a la derecha, y hacia arriba, z en diagonal hacia abajo-izquierda.
    function proj(v) { return d3 ? [v[0] - 0.5 * v[2], v[1] - 0.35 * v[2]] : [v[0], v[1]]; }
    var big = 1e-9, cx = 0, cy = 0;
    vecs.forEach(function (v) { var p = proj(v); big = Math.max(big, Math.abs(p[0]), Math.abs(p[1])); if (s.chain) { cx += p[0]; cy += p[1]; big = Math.max(big, Math.abs(cx), Math.abs(cy)); } });
    var k = (s.chain ? 120 : 140) / big;
    // Primero las flechas en coordenadas relativas al origen; luego se centra todo en el recuadro.
    var segs = [], px = 0, py = 0, xs = [0], ys = [0];
    vecs.forEach(function (v) {
      var p = proj(v), kk = v[5] ? v[5] / Math.max(Math.hypot(p[0], p[1]), 1e-9) : k, dx = p[0] * kk, dy = -p[1] * kk, sx = s.chain ? px : 0, sy = s.chain ? py : 0;
      segs.push([sx, sy, dx, dy, v]); xs.push(sx + dx); ys.push(sy + dy);
      if (s.chain) { px += dx; py += dy; }
    });
    var ox = 320 - (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, oy = 175 - (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
    body += arrow('axis', ox - 170, oy, 340, 0, 1.2) + arrow('axis', ox, oy + 90, 0, -180, 1.2) + text(ox + 176, oy + 18, 'x', ' font-size="15"') + text(ox - 16, oy - 80, 'y', ' font-size="15"');
    if (d3) body += arrow('axis', ox, oy, -90, 63, 1.2) + text(ox - 102, oy + 80, 'z', ' font-size="15"');
    segs.forEach(function (g) {
      var sx = ox + g[0], sy = oy + g[1], dx = g[2], dy = g[3], v = g[4];
      body += arrow(v[4] || 'ref', sx, sy, dx, dy, 3.2) + text(sx + dx + (dx >= 0 ? 8 : -8), sy + dy + (dy > 0 ? 16 : -6), v[3], ' font-size="16"' + (dx >= 0 ? '' : ' text-anchor="end"'));
    });
    px += ox; py += oy;
    if (s.chain && s.total) body += arrow('error', ox, oy, px - ox, py - oy, 2.6) + text((ox + px) / 2 + 10, (oy + py) / 2 + 18, s.total, ' font-size="15"');
    return svgBox('0 30 640 290', s.label || 'Vectores del problema.', body);
  };

  // Una recta con autos, distancias y obstáculos. s.cars: [{ x, dir, label, cls }]; s.marks: [{ x, label }]; s.span: metros visibles.
  D['exam-road'] = function (s) {
    var span = s.span || 100, X = function (x) { return 50 + 540 * x / span; }, Y = 190;
    var body = seg('axis', 30, Y + 22, 610, Y + 22, 3) + seg('axis', 30, Y + 60, 610, Y + 60, 1.2, '14 10');
    (s.marks || []).forEach(function (m) { body += seg('error', X(m.x), Y - 40, X(m.x), Y + 22, 3) + text(X(m.x), Y - 48, m.label, ' text-anchor="middle" font-size="14"'); });
    (s.cars || []).forEach(function (c) {
      var x = X(c.x), dir = c.dir || 1;
      body += '<rect class="' + (c.cls || 'box-aux') + '" x="' + (x - 28) + '" y="' + (Y - 8) + '" width="56" height="24" rx="7"/>' +
        '<circle class="dot-ref" cx="' + (x - 16) + '" cy="' + (Y + 18) + '" r="6"/><circle class="dot-ref" cx="' + (x + 16) + '" cy="' + (Y + 18) + '" r="6"/>' +
        arrow('aux', x + dir * 34, Y + 4, dir * 60, 0, 3) + text(x, Y - 18, c.label || '', ' text-anchor="middle" font-size="14"');
    });
    (s.dims || []).forEach(function (d) { var y = Y + 90; body += seg('axis', X(d.a), y, X(d.b), y, 1.4) + seg('axis', X(d.a), y - 6, X(d.a), y + 6, 1.4) + seg('axis', X(d.b), y - 6, X(d.b), y + 6, 1.4) + text((X(d.a) + X(d.b)) / 2, y - 8, d.label, ' text-anchor="middle" font-size="14"'); });
    return svgBox('0 110 640 200', s.label || 'Una recta con autos.', body);
  };

  // Rueda o rotor visto de frente: radio, punto y sentido de giro.
  D['exam-rotor'] = function (s) {
    var cx = 230, cy = 170, R = 110;
    var body = '<circle class="box-aux" cx="' + cx + '" cy="' + cy + '" r="' + R + '"/><circle class="dot-ref" cx="' + cx + '" cy="' + cy + '" r="5"/>' +
      seg('ref', cx, cy, cx + R, cy, 2.4) + text(cx + R / 2, cy - 8, 'r = ' + s.r + ' m', ' text-anchor="middle" font-size="15"') +
      '<circle class="dot-error" cx="' + (cx + R) + '" cy="' + cy + '" r="7"/>' + arrow('aux', cx + R, cy, 0, -60, 3) + text(cx + R + 10, cy - 50, 'v', ' font-size="16"') +
      arrow('error', cx + R - 8, cy + 18, -50, 0, 3) + text(cx + R - 64, cy + 40, 'aₙ', ' font-size="16"') +
      '<path class="axis" fill="none" stroke-width="1.6" d="M' + (cx - 60) + ' ' + (cy - R - 14) + 'A' + (R + 14) + ' ' + (R + 14) + ' 0 0 1 ' + (cx + 60) + ' ' + (cy - R - 14) + '"/>' +
      text(460, 150, s.rpm + ' rpm', ' font-size="18"') + text(460, 178, s.what || '', ' font-size="14"');
    return svgBox('0 26 640 274', 'Un rotor de radio ' + s.r + ' m que gira a ' + s.rpm + ' rpm.', body);
  };

  // Curva plana vista desde arriba.
  D['exam-curve-top'] = function (s) {
    var cx = 180, cy = 250, R = 190, a = -50 * RAD;
    var x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
    var body = '<path class="axis" fill="none" stroke-width="22" stroke-linecap="round" d="M' + (cx + R * Math.cos(-100 * RAD)) + ' ' + (cy + R * Math.sin(-100 * RAD)) + 'A' + R + ' ' + R + ' 0 0 1 ' + (cx + R) + ' ' + cy + '" opacity="0.25"/>' +
      '<circle class="dot-ref" cx="' + cx + '" cy="' + cy + '" r="5"/>' + seg('axis', cx, cy, x, y, 1.4, '5 6') + text((cx + x) / 2 - 8, (cy + y) / 2, 'r = ' + s.r + ' m', ' text-anchor="end" font-size="14"') +
      box(x, y, 34, 22, 40) + arrow('aux', x, y, 70 * Math.cos(a + Math.PI / 2), 70 * Math.sin(a + Math.PI / 2), 3) + text(x + 60, y + 50, 'v', ' font-size="16"') +
      arrow('error', x, y, -60 * Math.cos(a), -60 * Math.sin(a), 3) + text(x - 70, y + 30, 'fricción al centro', ' text-anchor="end" font-size="14"');
    return svgBox('0 40 640 240', 'Vista desde arriba de un auto en una curva plana; la fricción apunta al centro.', body);
  };

  // Carga que un cable sube.
  D['exam-lift'] = function (s) {
    var body = seg('axis', 200, 30, 460, 30, 5) + '<circle class="ref" cx="330" cy="52" r="18" fill="none" stroke-width="2.5"/>' + seg('axis', 330, 70, 330, 150, 2) +
      box(330, 180, 70, 60, 0, 'box-ref') + text(330, 186, s.m + ' kg', ' text-anchor="middle" font-size="14"') + arrow('aux', 380, 190, 0, -60, 3) + text(392, 150, 'v cte', ' font-size="14"') +
      seg('axis', 480, 150, 480, 262, 1.3) + text(490, 210, 'h = ' + s.h + ' m', ' font-size="15"') + seg('axis', 200, 262, 560, 262, 2);
    return svgBox('0 20 640 260', 'Un motor sube una carga de ' + s.m + ' kg a velocidad constante.', body);
  };

  // Péndulo soltado desde un ángulo.
  D['exam-pendulum'] = function (s) {
    var ox = 320, oy = 40, L = 190, a = s.th * RAD, bx = ox + L * Math.sin(a), by = oy + L * Math.cos(a);
    var body = seg('axis', 240, oy, 400, oy, 5) + seg('axis', ox, oy, ox, oy + L + 20, 1.2, '5 6') + seg('axis', ox, oy, bx, by, 2) +
      '<circle class="box-ref" cx="' + r1(bx) + '" cy="' + r1(by) + '" r="14"/><circle class="axis" cx="' + ox + '" cy="' + (oy + L) + '" r="14" fill="none" stroke-dasharray="4 4" stroke-width="1.4"/>' +
      arc(ox, oy, 60, 270, 270 + s.th) + text(ox + 22 * Math.sin(a / 2) + 14, oy + 80, s.th + '°', ' font-size="15"') +
      text((ox + bx) / 2 + 12, (oy + by) / 2, 'L = ' + s.L + ' m', ' font-size="15"') + seg('axis', 470, by, 470, oy + L, 1.3) + text(480, (by + oy + L) / 2 + 5, 'h', ' font-size="16"') +
      seg('axis', bx, by, 480, by, 1, '3 5') + seg('axis', ox, oy + L, 480, oy + L, 1, '3 5');
    return svgBox('0 20 640 250', 'Un péndulo de ' + s.L + ' m que se suelta a ' + s.th + ' grados de la vertical.', body);
  };
  function r1(n) { return (+n).toFixed(1); }

  // Lanzador de resorte vertical.
  D['exam-launcher'] = function (s) {
    var body = seg('axis', 220, 262, 420, 262, 3) + '<rect class="box-base" x="270" y="150" width="100" height="112" rx="6"/>' + coil(320, 262, 205, 14, 7) +
      '<circle class="box-ref" cx="320" cy="190" r="14"/>' + arrow('aux', 350, 180, 0, -90, 3) + text(362, 110, 'H = ?', ' font-size="16"') +
      text(440, 220, 'k = ' + s.k + ' N/m', ' font-size="15"') + text(440, 244, 'comprimido ' + s.x + ' cm', ' font-size="14"');
    return svgBox('0 60 640 220', 'Un lanzador de resorte que dispara una pelota hacia arriba.', body);
  };

  // Letrero colgado de un cable horizontal y otro inclinado.
  D['exam-sign'] = function (s) {
    var K = [330, 170], ceilY = 40, wallX = 90, a = s.th * RAD, top = [K[0] + (K[1] - ceilY) / Math.tan(a), ceilY];
    var body = seg('axis', wallX, 30, wallX, 280, 5) + seg('axis', 300, ceilY, 620, ceilY, 5) +
      seg('axis', wallX, K[1], K[0], K[1], 2) + seg('axis', K[0], K[1], Math.min(top[0], 610), ceilY, 2) + seg('axis', K[0], K[1], K[0], 210, 2) +
      box(K[0], 236, 90, 50, 0, 'box-ref') + text(K[0], 242, s.m + ' kg', ' text-anchor="middle" font-size="14"') +
      arc(K[0], K[1], 50, 0, s.th) + text(K[0] + 58, K[1] - 12, s.th + '°', ' font-size="15"');
    return svgBox('0 20 640 280', 'Un letrero colgado de un cable horizontal a la pared y otro inclinado al techo.', body);
  };

  // Bloque con sus tres medidas.
  D['exam-block3d'] = function (s) {
    var k = 22, a = s.a * k, b = s.b * k * 0.6, c = s.c * k, x = 200, y = 250;
    var body = '<path class="box-aux" d="M' + x + ' ' + y + 'h' + a + 'v' + (-c) + 'h' + (-a) + 'Z"/>' +
      '<path class="box-ref" d="M' + x + ' ' + (y - c) + 'l' + b + ' ' + (-b * 0.6) + 'h' + a + 'l' + (-b) + ' ' + b * 0.6 + 'Z"/>' +
      '<path class="box-base" d="M' + (x + a) + ' ' + y + 'l' + b + ' ' + (-b * 0.6) + 'v' + (-c) + 'l' + (-b) + ' ' + b * 0.6 + 'Z"/>' +
      text(x + a / 2, y + 22, s.a + ' cm', ' text-anchor="middle" font-size="14"') + text(x - 8, y - c / 2, s.c + ' cm', ' text-anchor="end" font-size="14"') +
      text(x + a + b / 2 + 10, y - c - b * 0.3 - 6, s.b + ' cm', ' font-size="14"') + text(x + a + b + 30, y - c / 2, s.m + ' g', ' font-size="16"');
    return svgBox('0 0 640 290', 'Un bloque de ' + s.a + ' × ' + s.b + ' × ' + s.c + ' cm y ' + s.m + ' g.', body);
  };

  // Piedra que cae en un pozo.
  D['exam-well'] = function (s) {
    var body = seg('axis', 120, 60, 260, 60, 3) + seg('axis', 380, 60, 520, 60, 3) + '<path class="axis" fill="none" stroke-width="3" d="M260 60V270H380V60"/>' +
      '<circle class="box-ref" cx="320" cy="78" r="9"/>' + arrow('aux', 340, 90, 0, 60, 3) + text(352, 130, 'se suelta', ' font-size="14"') +
      seg('axis', 420, 60, 420, 270, 1.3) + text(430, 170, 'h = ' + s.h + ' m', ' font-size="16"') + '<path class="trace" d="M262 250H378" stroke-width="3"/>';
    return svgBox('0 40 640 250', 'Una piedra que se suelta dentro de un pozo de ' + s.h + ' m.', body);
  };

  // Cohete de juguete con empuje y peso.
  D['exam-rocket'] = function (s) {
    var body = seg('axis', 200, 262, 440, 262, 3) + '<path class="box-ref" d="M300 250V140L320 105L340 140V250Z"/>' + '<path class="error" fill="none" stroke-width="2.5" d="M306 252l6 18l8-12l8 12l6-18"/>' +
      force('aux', 360, 170, 90, 80, 'T = ' + s.T + ' N') + force('error', 280, 190, 270, 60, 'mg') + text(320, 300, s.m + ' kg', ' text-anchor="middle" font-size="14"');
    return svgBox('0 50 640 260', 'Un cohete de juguete de ' + s.m + ' kg con empuje ' + s.T + ' N.', body);
  };

  // Uno o dos bloques en el piso, con empuje, resorte, velocidad y fricción opcionales.
  D['exam-box-floor'] = function (s) {
    var Y = 240, body = seg('axis', 40, Y, 600, Y, 3), x1 = s.spring ? 360 : 250;
    if (s.mu) { var h = ''; for (var i = 60; i < 590; i += 14) h += 'M' + i + ' ' + (Y + 2) + 'l-8 10'; body += '<path class="error" fill="none" stroke-width="1.3" d="' + h + '"/>' + text(590, Y + 32, 'μₖ = ' + s.mu, ' text-anchor="end" font-size="14"'); }
    if (s.spring) body += seg('axis', 60, Y - 90, 60, Y, 5) + '<path class="axis" fill="none" stroke-width="2" d="M60 ' + (Y - 40) + coilH(60, x1 - 40, Y - 40) + '"/>' + text(170, Y - 62, 'k = ' + s.spring.k + ' N/m, x = ' + s.spring.x + ' m', ' text-anchor="middle" font-size="14"');
    body += box(x1, Y - 40, 80, 80) + (s.m != null ? text(x1, Y - 34, s.m + ' kg', ' text-anchor="middle" font-size="14"') : '');
    if (s.m2) { body += seg('axis', x1 + 40, Y - 40, x1 + 110, Y - 40, 2) + box(x1 + 150, Y - 40, 80, 80, 0, 'box-ref') + text(x1 + 150, Y - 34, s.m2 + ' kg', ' text-anchor="middle" font-size="14"'); }
    var endX = s.m2 ? x1 + 190 : x1 + 40;
    if (s.F) body += force('ref', endX, Y - 40, 0, 70, null) + text(endX + 80, Y - 34, 'F = ' + s.F + ' N', ' font-size="15"');
    if (s.v) body += arrow('aux', x1 - 30, Y - 100, 70, 0, 3) + text(x1 + 48, Y - 94, 'v = ' + s.v + ' m/s', ' font-size="14"');
    return svgBox('0 110 640 170', s.label || 'Un bloque sobre el piso.', body);
  };
  function coilH(x0, x1, y) { var n = 10, d = ''; for (var i = 1; i <= n; i++) d += 'L' + r1(x0 + (x1 - x0) * i / (n + 1)) + ' ' + (y + (i % 2 ? -10 : 10)); return d + 'L' + x1 + ' ' + y; }
})();
