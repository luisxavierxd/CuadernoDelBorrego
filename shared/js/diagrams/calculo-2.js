/* =====================================================================
   Diagramas de Cálculo 2: window.Diagrams[id](state) → SVG (string).
   Roles: superficie o curva real .ref · corte, traza o elemento .aux ·
   gradiente, error o normal .error · recorrido .trace · lo del alumno .student.
   Solo clases de rol; los colores salen de tokens.css. El explainer interpola
   los campos numéricos de `state` entre pasos y vuelve a llamar a la función.
   Cada sesión escribe sus figuras dentro de su propio bloque (── SNN ──).
   Los ids no deben chocar con los de otros cursos (exam.test lo revisa).
   ===================================================================== */
(function () {
  var D = window.Diagrams = window.Diagrams || {};
  var RAD = Math.PI / 180;

  /* ------------------------- Ayudantes comunes -------------------------
     Todos devuelven texto SVG. Solo clases de rol; cero colores directos. */
  function r1(n) { return (+n).toFixed(1); }
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function num(s, k, d) { return s && typeof s[k] === 'number' && isFinite(s[k]) ? s[k] : d; }
  function fade(body, o) { return o <= 0.001 ? '' : '<g opacity="' + o.toFixed(2) + '">' + body + '</g>'; }
  function svgBox(vb, label, body) {
    return '<svg viewBox="' + vb + '" role="img" aria-label="' + label + '"><g class="sketch">' + body + '</g></svg>';
  }
  function text(x, y, s, extra) {
    return '<text class="ann" x="' + r1(x) + '" y="' + r1(y) + '"' + (extra || '') + '>' + s + '</text>';
  }
  function seg(cls, x1, y1, x2, y2, w, dash) {
    return '<path class="' + cls + '" fill="none" stroke-width="' + (w || 2) + '" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') +
      ' d="M' + r1(x1) + ' ' + r1(y1) + 'L' + r1(x2) + ' ' + r1(y2) + '"/>';
  }
  function poly(cls, pts, w, close, dash) {
    if (!pts.length) return '';
    return '<path class="' + cls + '" fill="none" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') +
      ' d="' + pts.map(function (p, i) { return (i ? 'L' : 'M') + r1(p[0]) + ' ' + r1(p[1]); }).join('') + (close ? 'Z' : '') + '"/>';
  }
  function fill(cls, pts) {
    return '<path class="' + cls + '" d="' + pts.map(function (p, i) { return (i ? 'L' : 'M') + r1(p[0]) + ' ' + r1(p[1]); }).join('') + 'Z"/>';
  }
  function dot(cls, x, y, r) { return '<circle class="' + cls + '" cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + (r || 5) + '"/>'; }
  function arrow(cls, x, y, dx, dy, w) {
    var L = Math.hypot(dx, dy);
    if (L < 2) return '';
    var ux = dx / L, uy = dy / L, hh = Math.min(11, L * 0.45), ex = x + dx, ey = y + dy;
    return '<path class="' + cls + '" fill="none" stroke-width="' + (w || 3) + '" stroke-linecap="round" stroke-linejoin="round" d="' +
      'M' + r1(x) + ' ' + r1(y) + 'L' + r1(ex) + ' ' + r1(ey) +
      'M' + r1(ex - ux * hh - uy * hh * 0.6) + ' ' + r1(ey - uy * hh + ux * hh * 0.6) + 'L' + r1(ex) + ' ' + r1(ey) +
      'L' + r1(ex - ux * hh + uy * hh * 0.6) + ' ' + r1(ey - uy * hh - ux * hh * 0.6) + '"/>';
  }
  // Arco de círculo; ángulos en grados, antihorario en pantalla (y hacia arriba).
  function arc(cx, cy, r, a0, a1, cls, w) {
    var p0 = [cx + r * Math.cos(a0 * RAD), cy - r * Math.sin(a0 * RAD)], p1 = [cx + r * Math.cos(a1 * RAD), cy - r * Math.sin(a1 * RAD)];
    var large = Math.abs(a1 - a0) > 180 ? 1 : 0, sweep = a1 > a0 ? 0 : 1;
    return '<path class="' + (cls || 'axis') + '" fill="none" stroke-width="' + (w || 1.6) + '" d="M' + r1(p0[0]) + ' ' + r1(p0[1]) + 'A' + r + ' ' + r + ' 0 ' + large + ' ' + sweep + ' ' + r1(p1[0]) + ' ' + r1(p1[1]) + '"/>';
  }

  /* ---------- Etiquetas que no chocan ----------
     spot(cands, pts, fs, vb): cands = [[x, y, texto, anchor]]; usa la primera cuya caja (ancho
     estimado) cabe en vb = [x0, y0, x1, y1] y no toca ningún punto de pts (trazos muestreados). */
  function spot(cands, pts, fs, vb) {
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i], w = String(c[2]).replace(/<[^>]+>/g, '').length * fs * 0.6, a = c[3] || 'start';
      var x0 = a === 'end' ? c[0] - w : a === 'middle' ? c[0] - w / 2 : c[0];
      var l = x0 - 4, r = x0 + w + 4, t = c[1] - fs * 0.85 - 2, b = c[1] + fs * 0.3 + 2;
      if (l < vb[0] + 2 || r > vb[2] - 2 || t < vb[1] + 2 || b > vb[3] - 2) continue;
      if (!pts.some(function (p) { return p[0] > l && p[0] < r && p[1] > t && p[1] < b; })) return c;
    }
    return cands[0];
  }
  // Posiciones alrededor de un punto: 16 direcciones a tres distancias.
  function around(x, y, s) {
    var c = [];
    [18, 32, 48].forEach(function (r) { for (var i = 0; i < 16; i++) { var a = i * Math.PI / 8, cx = Math.cos(a), cy = Math.sin(a); c.push([x + r * cx, y + r * cy + 5, s, cx > 0.3 ? 'start' : cx < -0.3 ? 'end' : 'middle']); } });
    return c;
  }
  function label(c, fs) { return text(c[0], c[1], c[2], (c[3] ? ' text-anchor="' + c[3] + '"' : '') + ' font-size="' + fs + '"'); }
  function segPts(x1, y1, x2, y2) {
    var o = [], n = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 3) || 1;
    for (var i = 0; i <= n; i++) o.push([x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n]);
    return o;
  }
  function polyPts(pts) { var o = []; for (var i = 1; i < pts.length; i++) o = o.concat(segPts(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1])); return o; }
  function arrowPts(x, y, dx, dy) {
    var L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, hh = Math.min(11, L * 0.45), ex = x + dx, ey = y + dy;
    return segPts(x, y, ex, ey).concat(segPts(ex - ux * hh - uy * hh * 0.6, ey - uy * hh + ux * hh * 0.6, ex, ey), segPts(ex - ux * hh + uy * hh * 0.6, ey - uy * hh - ux * hh * 0.6, ex, ey));
  }

  /* ---------- Proyección 3D → 2D ----------
     view3({ cx, cy, s, az, el }) → P([x, y, z]) = [px, py] en pantalla (z hacia arriba).
     az: giro alrededor de z en grados (−35 por omisión); el: elevación en grados (25). */
  function view3(o) {
    o = o || {};
    var cx = o.cx != null ? o.cx : 300, cy = o.cy != null ? o.cy : 200, s = o.s || 40;
    var az = (o.az != null ? o.az : -35) * RAD, el = (o.el != null ? o.el : 25) * RAD;
    var ca = Math.cos(az), sa = Math.sin(az), ce = Math.cos(el), se = Math.sin(el);
    return function (p) {
      var x = p[0] * ca - p[1] * sa, y = p[0] * sa + p[1] * ca;        // giro en el plano xy
      // Pantalla: x′ a la derecha; la profundidad y′ sube con la elevación; z hacia arriba.
      return [cx + s * y, cy - s * (p[2] * ce - x * se)];
    };
  }
  // Ejes x, y, z en 3D con su letra en la punta.
  function axes3(P, L, fs) {
    var o = '', names = ['x', 'y', 'z'], fsz = fs || 18;
    [[L, 0, 0], [0, L, 0], [0, 0, L]].forEach(function (e, i) {
      var a = P([0, 0, 0]), b = P(e);
      o += arrow('axis', a[0], a[1], b[0] - a[0], b[1] - a[1], 1.6);
      var dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
      o += text(b[0] + dx / m * 14, b[1] + dy / m * 14 + 6, names[i], ' text-anchor="middle" font-size="' + fsz + '"');
    });
    return o;
  }

  /* ══════════════════════ S01 ══════════════════════ */
  // Curva 3D proyectada: puntos [x, y, z] → polilínea en pantalla (y sus puntos para spot).
  function c2s01Path(P, pts) { return pts.map(function (p) { return P(p); }); }
  function c2s01Sample(fn, a, b, n) { var o = []; for (var i = 0; i <= n; i++) o.push(fn(a + (b - a) * i / n)); return o; }
  function c2s01Ring(cx, cy, z, rx, ry, n) {
    return c2s01Sample(function (t) { return [cx + rx * Math.cos(t), cy + ry * Math.sin(t), z]; }, 0, 2 * Math.PI, n || 48);
  }

  // S01 · Los tres planos coordenados en el primer octante (sistema de mano derecha).
  D['c2s01-octant'] = function () {
    var P = view3({ cx: 270, cy: 215, s: 36 }), body = '';
    var xy = [[0, 0, 0], [4, 0, 0], [4, 4.5, 0], [0, 4.5, 0]].map(P);
    var xz = [[0, 0, 0], [4, 0, 0], [4, 0, 3.6], [0, 0, 3.6]].map(P);
    var yz = [[0, 0, 0], [0, 4.5, 0], [0, 4.5, 3.6], [0, 0, 3.6]].map(P);
    body += fill('box-trace', yz) + fill('box-aux', xz) + fill('area-fill', xy);
    body += axes3(P, 5.6, 20);
    var a = P([2.1, 2.4, 0]), b = P([2, 0, 1.9]), c = P([0, 2.3, 1.9]);
    body += text(a[0], a[1] + 6, 'z = 0', ' text-anchor="middle" font-size="18"');
    body += text(b[0], b[1] + 6, 'y = 0', ' text-anchor="middle" font-size="18"');
    body += text(c[0], c[1] + 6, 'x = 0', ' text-anchor="middle" font-size="18"');
    return svgBox('0 0 560 330', 'Ejes x, y, z de mano derecha con los planos coordenados: el piso z = 0, la pared y = 0 y la pared x = 0.', body);
  };

  // S01 · Ubicar P(2, 4, 3): avanzar en x, luego en y, luego subir en z; al final, la distancia OP.
  D['c2s01-point'] = function (st) {
    var k = num(st, 'k', 0), P = view3({ cx: 230, cy: 228, s: 34 }), body = '', pts = [];
    var O = [0, 0, 0], A = [2, 0, 0], B = [2, 4, 0], C = [2, 4, 3];
    body += axes3(P, 5, 20);
    [[5, 0, 0], [0, 5, 0], [0, 0, 5]].forEach(function (e) { var p0 = P(O), p1 = P(e); pts = pts.concat(segPts(p0[0], p0[1], p1[0], p1[1])); });
    function part(p, q, t) { return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t]; }
    var legs = [[O, A, 'x = 2'], [A, B, 'y = 4'], [B, C, 'z = 3']], labels = [];
    legs.forEach(function (L, i) {
      var t = clamp01(k - i);
      if (t <= 0) return;
      var p = P(L[0]), q = P(part(L[0], L[1], t));
      body += arrow('trace', p[0], p[1], q[0] - p[0], q[1] - p[1], 3);
      pts = pts.concat(arrowPts(p[0], p[1], q[0] - p[0], q[1] - p[1]));
      if (t > 0.6) labels.push([P(part(L[0], L[1], 0.5)), L[2]]);
    });
    var d = clamp01(k - 3);
    if (d > 0) {
      var o = P(O), b = P(B), c = P(C);
      body += fade(seg('aux', o[0], o[1], b[0], b[1], 2, '6 5') + seg('ref', o[0], o[1], c[0], c[1], 3.2), d);
      pts = pts.concat(segPts(o[0], o[1], b[0], b[1]), segPts(o[0], o[1], c[0], c[1]));
    }
    if (k >= 2.95) { var pc = P(C); body += dot('dot-ref', pc[0], pc[1], 6); labels.push([pc, 'P(2, 4, 3)']); }
    var vb = [0, 0, 560, 330], placed = [];
    labels.forEach(function (L) {
      var c = spot(around(L[0][0], L[0][1], L[1]), pts.concat(placed), 18, vb);
      body += label(c, 18);
      var w = L[1].length * 18 * 0.6, x0 = c[3] === 'end' ? c[0] - w : c[3] === 'middle' ? c[0] - w / 2 : c[0];
      for (var x = x0; x <= x0 + w; x += 4) { placed.push([x, c[1] - 6]); placed.push([x, c[1] - 14]); }
    });
    if (d > 0.5) {
      body += text(545, 42, 'd = √(2² + 4² + 3²)', ' text-anchor="end" font-size="19"');
      body += text(545, 70, '= √29 ≈ 5.39', ' text-anchor="end" font-size="19"');
    }
    return svgBox('0 0 560 330', 'Para llegar a P(2, 4, 3) se avanza 2 en x, 4 en y y se sube 3 en z; la distancia al origen es la raíz de 29.', body);
  };

  // S01 · Plano 2x + y + 2z = 6: el triángulo que corta en el primer octante y su normal.
  D['c2s01-plane'] = function () {
    var P = view3({ cx: 230, cy: 215, s: 33 }), body = '', pts = [];
    var X = P([3, 0, 0]), Y = P([0, 6, 0]), Z = P([0, 0, 3]);
    body += fill('area-fill', [X, Y, Z]);
    var O = P([0, 0, 0]);
    [[4.4, 0, 0, 'x'], [0, 7.4, 0, 'y'], [0, 0, 4.4, 'z']].forEach(function (e) {
      var p1 = P(e), dx = p1[0] - O[0], dy = p1[1] - O[1], m = Math.hypot(dx, dy);
      body += arrow('axis', O[0], O[1], dx, dy, 1.6) + text(p1[0] + dx / m * 14, p1[1] + dy / m * 14 + 6, e[3], ' text-anchor="middle" font-size="20"');
      pts = pts.concat(arrowPts(O[0], O[1], dx, dy));
    });
    body += poly('ref', [X, Y, Z], 3, true);
    pts = pts.concat(polyPts([X, Y, Z, X]));
    var G = P([1, 2, 1]), Gn = P([1 + 2 * 1.7, 2 + 1.7, 1 + 2 * 1.7]);
    body += arrow('error', G[0], G[1], Gn[0] - G[0], Gn[1] - G[1], 3);
    pts = pts.concat(arrowPts(G[0], G[1], Gn[0] - G[0], Gn[1] - G[1]));
    [X, Y, Z].forEach(function (p) { body += dot('dot-ref', p[0], p[1], 5.5); });
    var vb = [0, 0, 560, 330], placed = [];
    [[X, '(3, 0, 0)'], [Y, '(0, 6, 0)'], [Z, '(0, 0, 3)'], [Gn, 'n = ⟨2, 1, 2⟩']].forEach(function (L) {
      var c = spot(around(L[0][0], L[0][1], L[1]), pts.concat(placed), 18, vb);
      body += label(c, 18);
      var w = L[1].length * 18 * 0.6, x0 = c[3] === 'end' ? c[0] - w : c[3] === 'middle' ? c[0] - w / 2 : c[0];
      for (var x = x0 - 4; x <= x0 + w + 4; x += 4) { placed.push([x, c[1] + 2]); placed.push([x, c[1] - 8]); placed.push([x, c[1] - 17]); }
    });
    return svgBox('0 0 560 330', 'El plano 2x + y + 2z = 6 corta los ejes en (3, 0, 0), (0, 6, 0) y (0, 0, 3); su vector normal es ⟨2, 1, 2⟩.', body);
  };

  // S01 · Cuádricas dibujadas con sus trazas: horizontales (z = k) y verticales (x = 0, y = 0).
  var C2S01_Q = {
    ellipsoid: { name: 'Elipsoide', eq: 'x²/9 + y²/16 + z²/4 = 1', tr: ['z = k: elipses', 'x = k, y = k: elipses'] },
    hyperboloid1: { name: 'Hiperboloide de una hoja', eq: 'x² + y² − z² = 4', tr: ['z = k: circunferencias', 'x = k, y = k: hipérbolas'] },
    hyperboloid2: { name: 'Hiperboloide de dos hojas', eq: 'z² − x² − y² = 1', tr: ['z = k: solo si |k| ≥ 1', 'x = k, y = k: hipérbolas'] },
    cone: { name: 'Cono', eq: 'z² = x² + y²', tr: ['z = k: circunferencias', 'x = 0, y = 0: dos rectas'] },
    'paraboloid-elliptic': { name: 'Paraboloide elíptico', eq: 'z = x² + y²', tr: ['z = k: circunferencias (k ≥ 0)', 'x = k, y = k: parábolas'] },
    'paraboloid-hyperbolic': { name: 'Paraboloide hiperbólico', eq: 'z = y² − x²', tr: ['z = k: hipérbolas', 'x = k, y = k: parábolas'] }
  };
  D['c2s01-quadric'] = function (st) {
    var kind = st && C2S01_Q[st.kind] ? st.kind : 'ellipsoid', info = C2S01_Q[kind];
    var P = view3({ cx: 445, cy: 190, s: 34, el: 20 }), body = '', H = [], V = [], i;
    function hz(z, rx, ry) { if (rx > 0.01) H.push(c2s01Ring(0, 0, z, rx, ry || rx)); }
    if (kind === 'ellipsoid') {
      [20, 45, 70, 90, 110, 135, 160].forEach(function (d) { var s = Math.sin(d * RAD); hz(2 * Math.cos(d * RAD), 3 * s, 4 * s); });
      V.push(c2s01Sample(function (t) { return [3 * Math.cos(t), 0, 2 * Math.sin(t)]; }, 0, 2 * Math.PI, 60));
      V.push(c2s01Sample(function (t) { return [0, 4 * Math.cos(t), 2 * Math.sin(t)]; }, 0, 2 * Math.PI, 60));
    } else if (kind === 'hyperboloid1') {
      [-3, -1.5, 0, 1.5, 3].forEach(function (z) { hz(z, Math.sqrt(4 + z * z)); });
      [1, -1].forEach(function (s) {
        V.push(c2s01Sample(function (z) { return [s * Math.sqrt(4 + z * z), 0, z]; }, -3, 3, 40));
        V.push(c2s01Sample(function (z) { return [0, s * Math.sqrt(4 + z * z), z]; }, -3, 3, 40));
      });
    } else if (kind === 'hyperboloid2') {
      [1.15, 2, 3].forEach(function (z) { hz(z, Math.sqrt(z * z - 1)); hz(-z, Math.sqrt(z * z - 1)); });
      [1, -1].forEach(function (s) {
        V.push(c2s01Sample(function (x) { return [x, 0, s * Math.sqrt(1 + x * x)]; }, -2.83, 2.83, 40));
        V.push(c2s01Sample(function (y) { return [0, y, s * Math.sqrt(1 + y * y)]; }, -2.83, 2.83, 40));
      });
    } else if (kind === 'cone') {
      [-3, -2, -1, 1, 2, 3].forEach(function (z) { hz(z, Math.abs(z)); });
      V.push([[-3, 0, -3], [3, 0, 3]], [[3, 0, -3], [-3, 0, 3]], [[0, -3, -3], [0, 3, 3]], [[0, 3, -3], [0, -3, 3]]);
    } else if (kind === 'paraboloid-elliptic') {
      [0.5, 1.5, 2.5, 3.5].forEach(function (z) { hz(z, Math.sqrt(z)); });
      V.push(c2s01Sample(function (x) { return [x, 0, x * x]; }, -1.87, 1.87, 40));
      V.push(c2s01Sample(function (y) { return [0, y, y * y]; }, -1.87, 1.87, 40));
    } else {
      for (i = -2; i <= 2; i++) {
        var c = i * 0.75;
        H.push(c2s01Sample(function (y) { return [c, y, y * y - c * c]; }, -1.5, 1.5, 30));
        V.push(c2s01Sample(function (x) { return [x, c, c * c - x * x]; }, -1.5, 1.5, 30));
      }
    }
    body += axes3(P, 4.6, 18);
    H.forEach(function (r) { body += poly('aux', c2s01Path(P, r), 1.6); });
    V.forEach(function (r) { body += poly('ref', c2s01Path(P, r), 2.6); });
    body += text(16, 38, info.name, ' font-size="25"');
    body += text(16, 72, info.eq, ' font-size="22"');
    body += text(16, 304, info.tr[0], ' font-size="19"');
    body += text(16, 334, info.tr[1], ' font-size="19"');
    return svgBox('0 0 640 350', info.name + ' ' + info.eq + ', dibujado con sus trazas horizontales y verticales.', body);
  };

  // S01 · Del cerro al mapa: f(x, y) = 9 − x² − y² cortada a la altura c, y su mapa de contorno.
  D['c2s01-levels'] = function (st) {
    var c = Math.max(0, Math.min(8.6, num(st, 'c', 4))), zs = 0.45, body = '';
    var P = view3({ cx: 160, cy: 245, s: 27, el: 22 });
    var Q = function (p) { return P([p[0], p[1], p[2] * zs]); };
    var o = Q([0, 0, 0]), zt = Q([0, 0, 11]);
    body += seg('axis', o[0], o[1], zt[0], zt[1], 1.6);
    body += text(zt[0], zt[1] - 10, 'z', ' text-anchor="middle" font-size="18"');
    for (var k = 0; k <= 8; k++) body += poly('aux', c2s01Path(Q, c2s01Ring(0, 0, k, Math.sqrt(9 - k), Math.sqrt(9 - k), 56)), 1.2);
    body += poly('ref', c2s01Path(Q, c2s01Sample(function (x) { return [x, 0, 9 - x * x]; }, -3, 3, 50)), 2.4);
    body += poly('ref', c2s01Path(Q, c2s01Sample(function (y) { return [0, y, 9 - y * y]; }, -3, 3, 50)), 2.4);
    var pl = [[-3.6, -3.6, c], [3.6, -3.6, c], [3.6, 3.6, c], [-3.6, 3.6, c]].map(Q);
    body += fill('area-fill', pl);
    body += poly('trace', c2s01Path(Q, c2s01Ring(0, 0, c, Math.sqrt(9 - c), Math.sqrt(9 - c), 64)), 3.4);
    var cr = Q([-3.6, 3.6, c]);
    body += text(cr[0] + 8, cr[1] + 6, 'z = c', ' font-size="18"');
    // Mapa de contorno
    var mx = 520, my = 160, sc = 40;
    body += seg('axis', mx - 135, my, mx + 135, my, 1.4) + seg('axis', mx, my + 135, mx, my - 135, 1.4);
    body += text(mx + 142, my + 6, 'x', ' font-size="18"') + text(mx + 10, my - 122, 'y', ' font-size="18"');
    for (k = 0; k <= 8; k++) body += '<circle class="aux" fill="none" stroke-width="1.3" cx="' + mx + '" cy="' + my + '" r="' + r1(Math.sqrt(9 - k) * sc) + '"/>';
    body += '<circle class="trace" fill="none" stroke-width="3.4" cx="' + mx + '" cy="' + my + '" r="' + r1(Math.sqrt(9 - c) * sc) + '"/>';
    body += text(mx, 328, 'c = ' + c.toFixed(1) + '  →  x² + y² = ' + (9 - c).toFixed(1), ' text-anchor="middle" font-size="18"');
    return svgBox('0 0 680 340', 'El paraboloide z = 9 − x² − y² cortado por el plano z = ' + c.toFixed(1) + '; a la derecha, sus curvas de nivel: circunferencias cada vez más juntas hacia afuera.', body);
  };
  /* ══════════════════════ fin S01 ══════════════════════ */

  /* ══════════════════════ S02 ══════════════════════ */
  // Coordenadas polares. Muestreo de r(θ) en píxeles: origen (ox, oy), k px por unidad.
  function s02pts(f, a, b, n, ox, oy, k) {
    var o = [];
    for (var i = 0; i <= n; i++) { var t = a + (b - a) * i / n, r = f(t); o.push([ox + k * r * Math.cos(t), oy - k * r * Math.sin(t)]); }
    return o;
  }
  function s02axes(x0, x1, y0, y1, ox, oy) {
    return arrow('axis', x0, oy, x1 - x0, 0, 1.6) + arrow('axis', ox, y0, 0, y1 - y0, 1.6);
  }

  // Un punto en polares: distancia r al origen y ángulo θ desde el eje polar.
  D['c2s02-point'] = function () {
    var ox = 120, oy = 300, k = 60, r = 4.5, th = 40 * RAD;
    var px = ox + k * r * Math.cos(th), py = oy - k * r * Math.sin(th);
    var b = s02axes(60, 600, 335, 30, ox, oy);
    b += text(612, oy + 6, 'x', ' font-size="20"') + text(ox + 12, 40, 'y', ' font-size="20"');
    b += text(ox - 10, oy + 24, 'O', ' text-anchor="end" font-size="18"');
    b += seg('aux', ox, oy, px, oy, 4) + seg('aux', px, oy, px, py, 2, '6 6');
    b += seg('ref', ox, oy, px, py, 3);
    b += arc(ox, oy, 50, 0, 40, 'ref', 2);
    b += text(ox + 64, oy - 16, 'θ', ' font-size="22"');
    b += text((ox + px) / 2 - 16, (oy + py) / 2 - 12, 'r', ' text-anchor="middle" font-size="24"');
    b += text((ox + px) / 2, oy + 26, 'x = r cos θ', ' text-anchor="middle" font-size="19"');
    b += text(px + 12, (oy + py) / 2 + 6, 'y = r sin θ', ' font-size="19"');
    b += dot('dot-ref', px, py, 6) + text(px + 14, py - 8, 'P = (r, θ) = (x, y)', ' font-size="19"');
    return svgBox('0 15 640 345', 'Un punto P a distancia r del origen, en la dirección que forma un ángulo θ con el eje x positivo. Sus coordenadas rectangulares son x = r cos θ y y = r sin θ.', b);
  };

  // arctan(y/x) contra el ángulo correcto: el punto (−4, 3) está en el segundo cuadrante.
  D['c2s02-quadrant'] = function () {
    var ox = 320, oy = 190, k = 45;
    var A = [ox - 4 * k, oy - 3 * k], B = [ox + 4 * k, oy + 3 * k];
    var good = Math.atan2(3, -4) / RAD, bad = Math.atan(3 / -4) / RAD;
    var b = s02axes(40, 600, 365, 20, ox, oy);
    b += text(612, oy + 6, 'x', ' font-size="20"') + text(ox + 12, 30, 'y', ' font-size="20"');
    b += seg('ref', ox, oy, A[0], A[1], 3) + arc(ox, oy, 40, 0, good, 'ref', 2);
    b += seg('error', ox, oy, B[0], B[1], 2.5, '7 6') + arc(ox, oy, 60, 0, bad, 'error', 2);
    b += dot('dot-ref', A[0], A[1], 6) + dot('dot-error', B[0], B[1], 5);
    b += text(A[0] - 12, A[1] - 6, '(−4, 3)', ' text-anchor="end" font-size="19"');
    b += text(ox + 26, oy - 58, 'θ ≈ 2.50 rad', ' font-size="18"');
    b += text(ox + 72, oy + 30, 'arctan(3/(−4)) ≈ −0.64', ' font-size="17"');
    b += text(610, B[1] + 34, 'apunta al cuadrante IV', ' text-anchor="end" font-size="17"');
    b += text(630, 52, 'x < 0: súmale π', ' text-anchor="end" font-size="19"');
    return svgBox('0 0 640 385', 'El punto (−4, 3) está en el segundo cuadrante y su ángulo es 2.50 rad. La calculadora con arctan(3/(−4)) da −0.64 rad, que apunta al cuarto cuadrante: hay que sumarle π.', b);
  };

  // El mismo punto con varias coordenadas: (2, π/4), (2, 9π/4) y (−2, 5π/4).
  D['c2s02-negative'] = function () {
    var ox = 320, oy = 175, k = 55, c = Math.SQRT1_2;
    var P = [ox + 2 * k * c, oy - 2 * k * c], Q = [ox - 2.6 * k * c, oy + 2.6 * k * c];
    var b = s02axes(40, 600, 330, 20, ox, oy);
    b += text(612, oy + 6, 'x', ' font-size="20"') + text(ox + 12, 30, 'y', ' font-size="20"');
    b += seg('aux', ox, oy, Q[0], Q[1], 2.5, '7 6') + arc(ox, oy, 30, 0, 225, 'aux', 1.8);
    b += arrow('trace', ox, oy, P[0] - ox, P[1] - oy, 3);
    b += dot('dot-ref', P[0], P[1], 6) + text(P[0] + 14, P[1] - 4, 'P', ' font-size="22"');
    b += text(Q[0] - 10, Q[1] + 24, 'θ = 5π/4', ' text-anchor="end" font-size="18"');
    b += text(ox + 72, oy + 52, 'r = −2: camina hacia atrás', ' font-size="17"');
    b += text(28, 46, 'Tres nombres del mismo P:', ' font-size="18"');
    b += text(28, 76, '(2, π/4)', ' font-size="18"') + text(28, 104, '(2, 9π/4)', ' font-size="18"') + text(28, 132, '(−2, 5π/4)', ' font-size="18"');
    return svgBox('0 0 640 335', 'El punto P se puede nombrar (2, π/4), (2, 9π/4) o (−2, 5π/4). Con r = −2 se mira en la dirección 5π/4 y se camina dos unidades hacia atrás, hasta P.', b);
  };

  // Explainer: r = 1 + 2cos θ trazada hasta θ = t (state.t). Con r < 0 el punto cae del lado opuesto.
  D['c2s02-trace'] = function (s) {
    var t = Math.max(0, Math.min(2 * Math.PI, num(s, 't', 0)));
    var ox = 250, oy = 200, k = 60, f = function (u) { return 1 + 2 * Math.cos(u); };
    var b = s02axes(40, 445, 385, 15, ox, oy);
    b += text(ox + 12, 26, 'y', ' font-size="20"') + text(445, oy + 26, 'x', ' text-anchor="end" font-size="20"');
    b += poly('aux', s02pts(f, 0, 2 * Math.PI, 240, ox, oy, k), 1.6, false, '4 6');
    if (t > 0.01) b += poly('ref', s02pts(f, 0, t, Math.max(2, Math.round(240 * t / (2 * Math.PI))), ox, oy, k), 3);
    var R = 185;
    b += seg('axis', ox, oy, ox + R * Math.cos(t), oy - R * Math.sin(t), 1.4, '3 5');
    var r = f(t), px = ox + k * r * Math.cos(t), py = oy - k * r * Math.sin(t);
    if (Math.abs(r) > 0.02) b += seg(r < 0 ? 'error' : 'trace', ox, oy, px, py, 3);
    b += dot('dot-trace', px, py, 6);
    var deg = Math.round(t / RAD);
    b += text(460, 60, 'θ = ' + t.toFixed(2) + ' rad', ' font-size="19"');
    b += text(460, 88, '(' + deg + '°)', ' font-size="19"');
    b += text(460, 124, 'r = ' + (Math.abs(r) < 0.005 ? '0.00' : r.toFixed(2).replace('-', '−')), ' font-size="19"');
    if (r < -0.02) b += text(460, 160, 'r < 0: P cae', ' font-size="17"') + text(460, 184, 'del lado opuesto', ' font-size="17"');
    else if (Math.abs(r) <= 0.02) b += text(460, 160, 'r = 0: P está', ' font-size="17"') + text(460, 184, 'en el origen', ' font-size="17"');
    b += text(460, 300, 'r = 1 + 2 cos θ', ' font-size="19"');
    return svgBox('0 0 640 400', 'Trazo de la curva r = 1 + 2 cos θ hasta θ = ' + t.toFixed(2) + ' radianes. En ese ángulo r vale ' + r.toFixed(2) + '.', b);
  };

  // Galería de familias polares, cada una con su ecuación.
  D['c2s02-families'] = function () {
    var F = [
      ['circunferencia', 'r = 2 cos θ', function (u) { return 2 * Math.cos(u); }, 2 * Math.PI],
      ['cardioide', 'r = 1 + cos θ', function (u) { return 1 + Math.cos(u); }, 2 * Math.PI],
      ['limaçon con lazo', 'r = 1 + 2 cos θ', function (u) { return 1 + 2 * Math.cos(u); }, 2 * Math.PI],
      ['rosa de 3 pétalos', 'r = cos 3θ', function (u) { return Math.cos(3 * u); }, 2 * Math.PI],
      ['rosa de 4 pétalos', 'r = cos 2θ', function (u) { return Math.cos(2 * u); }, 2 * Math.PI],
      ['espiral', 'r = θ', function (u) { return u; }, 4 * Math.PI]
    ];
    var b = '';
    F.forEach(function (fam, i) {
      var col = i % 3, row = Math.floor(i / 3), cx = col * 213 + 106, cy = row * 235 + 92;
      var raw = s02pts(fam[2], 0, fam[3], 400, 0, 0, 1);
      var xs = raw.map(function (p) { return p[0]; }).concat([0]), ys = raw.map(function (p) { return p[1]; }).concat([0]);
      var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
      var k = Math.min(170 / (x1 - x0), 140 / (y1 - y0));
      var ox = cx - k * (x0 + x1) / 2, oy = cy - k * (y0 + y1) / 2;
      b += seg('axis', ox + k * x0 - 8, oy, ox + k * x1 + 8, oy, 1.2) + seg('axis', ox, oy + k * y0 - 8, ox, oy + k * y1 + 8, 1.2);
      b += poly('ref', raw.map(function (p) { return [ox + k * p[0], oy + k * p[1]]; }), 2.6);
      b += text(cx, row * 235 + 196, fam[0], ' text-anchor="middle" font-size="18"');
      b += text(cx, row * 235 + 220, fam[1], ' text-anchor="middle" font-size="18"');
    });
    return svgBox('0 0 640 470', 'Seis familias de curvas polares: circunferencia r = 2 cos θ, cardioide r = 1 + cos θ, limaçon con lazo r = 1 + 2 cos θ, rosas r = cos 3θ y r = cos 2θ, y espiral r = θ.', b);
  };

  /* ══════════════════════ fin S02 ══════════════════════ */

  /* ══════════════════════ S03 ══════════════════════ */
  // Ejes 3D con la parte negativa punteada; devuelve los puntos de los trazos (para las etiquetas).
  function c2s03Axes(P, L, Ln, pts) {
    var o = '', O = P([0, 0, 0]);
    [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(function (e) {
      var n = P([-e[0] * Ln, -e[1] * Ln, -e[2] * Ln]), t = P([e[0] * L, e[1] * L, e[2] * L]);
      o += seg('axis', n[0], n[1], O[0], O[1], 1.2, '4 5');
      pts.push.apply(pts, segPts(n[0], n[1], O[0], O[1]).concat(arrowPts(O[0], O[1], t[0] - O[0], t[1] - O[1])));
      var dx = t[0] - O[0], dy = t[1] - O[1], m = Math.hypot(dx, dy) || 1;
      pts.push([t[0] + dx / m * 14, t[1] + dy / m * 14]);
    });
    return o + axes3(P, L, 19);
  }
  // Polilínea 3D; los tramos «de atrás» (back(p) = true) van punteados.
  function c2s03Line(P, list, cls, w, back, pts) {
    var o = '', run = [], bk = null;
    function flush() { if (run.length > 1) o += poly(cls, run, w, false, bk ? '5 6' : null); }
    list.forEach(function (p) {
      var b = back ? back(p) : false, q = P(p);
      if (bk !== null && b !== bk) { run.push(q); flush(); run = [run[run.length - 1]]; }
      else run.push(q);
      bk = b;
      if (pts) pts.push(q);
    });
    flush();
    return o;
  }
  function c2s03Circle(c, r, n, f) { var o = []; for (var i = 0; i <= n; i++) { var t = 2 * Math.PI * i / n; o.push(f(r * Math.cos(t), r * Math.sin(t), t)); } return o; }

  // Un punto P y sus tres maneras de nombrarlo. state.k: 0 punto · 1 r y θ en el piso · 2 altura z ·
  // 3 ρ desde el origen · 4 φ desde el eje z y las relaciones del triángulo.
  D['c2s03-punto'] = function (s) {
    var k = num(s, 'k', 4), P = view3({ cx: 250, cy: 214, s: 46, az: -35, el: 22 }), pts = [], o = '';
    var X = 1.2, Y = 3.2, Z = 2.6, th = Math.atan2(Y, X), r = Math.hypot(X, Y), rho = Math.hypot(r, Z), ph = Math.atan2(r, Z);
    var O = P([0, 0, 0]), Q = P([X, Y, 0]), PP = P([X, Y, Z]);
    o += c2s03Axes(P, 3.6, 2.4, pts);
    var a1 = clamp01(k), a2 = clamp01(k - 1), a3 = clamp01(k - 2), a4 = clamp01(k - 3);
    var labs = [];
    // Guías a los ejes (x, y) siempre tenues
    o += seg('axis', Q[0], Q[1], P([X, 0, 0])[0], P([X, 0, 0])[1], 1.1, '3 4') + seg('axis', Q[0], Q[1], P([0, Y, 0])[0], P([0, Y, 0])[1], 1.1, '3 4');
    pts.push.apply(pts, segPts(Q[0], Q[1], P([X, 0, 0])[0], P([X, 0, 0])[1]).concat(segPts(Q[0], Q[1], P([0, Y, 0])[0], P([0, Y, 0])[1])));
    // 1: r y θ en el plano xy (son las polares del piso)
    var arcT = [];
    for (var i = 0; i <= 30; i++) { var t = th * i / 30; arcT.push(P([1.1 * Math.cos(t), 1.1 * Math.sin(t), 0])); }
    var segR = seg('aux', O[0], O[1], Q[0], Q[1], 3.2) + poly('aux', arcT, 2.2) + dot('dot-aux', Q[0], Q[1], 4);
    o += fade(segR, a1);
    pts.push.apply(pts, segPts(O[0], O[1], Q[0], Q[1]).concat(polyPts(arcT)));
    // 2: la altura z
    o += fade(seg('trace', Q[0], Q[1], PP[0], PP[1], 3.2), a2);
    pts.push.apply(pts, segPts(Q[0], Q[1], PP[0], PP[1]));
    // 3: ρ del origen al punto
    o += fade(seg('ref', O[0], O[1], PP[0], PP[1], 3.4), a3);
    pts.push.apply(pts, segPts(O[0], O[1], PP[0], PP[1]));
    // 4: φ desde el eje z positivo
    var arcF = [];
    for (var j = 0; j <= 30; j++) { var f = ph * j / 30; arcF.push(P([1.25 * Math.sin(f) * Math.cos(th), 1.25 * Math.sin(f) * Math.sin(th), 1.25 * Math.cos(f)])); }
    o += fade(poly('ref', arcF, 2.2), a4);
    pts.push.apply(pts, polyPts(arcF));
    o += dot('dot-ref', PP[0], PP[1], 6);
    pts.push([PP[0], PP[1]]);
    // Etiquetas (cada una aparece con su trazo)
    var mR = P([X / 2, Y / 2, 0]), mZ = P([X, Y, Z / 2]), mP = P([X / 2, Y / 2, Z / 2]);
    var tT = P([1.55 * Math.cos(th / 2), 1.55 * Math.sin(th / 2), 0]), tF = P([1.7 * Math.sin(ph / 2) * Math.cos(th), 1.7 * Math.sin(ph / 2) * Math.sin(th), 1.7 * Math.cos(ph / 2)]);
    labs.push(['P', PP, 1, around(PP[0], PP[1], 'P')]);
    labs.push(['r', mR, a1, around(mR[0], mR[1], 'r')]);
    labs.push(['θ', tT, a1, [[tT[0], tT[1] + 6, 'θ', 'middle']].concat(around(tT[0], tT[1], 'θ'))]);
    labs.push(['z', mZ, a2, around(mZ[0], mZ[1], 'z')]);
    labs.push(['ρ', mP, a3, around(mP[0], mP[1], 'ρ')]);
    labs.push(['φ', tF, a4, [[tF[0], tF[1] + 6, 'φ', 'middle']].concat(around(tF[0], tF[1], 'φ'))]);
    var vb = [0, 0, 520, 340];
    labs.forEach(function (L) {
      var c = spot(L[3], pts, 20, vb);
      o += fade(label(c, 20), L[2]);
      var w = String(c[2]).length * 12, x0 = c[3] === 'end' ? c[0] - w : c[3] === 'middle' ? c[0] - w / 2 : c[0];
      for (var xx = x0; xx <= x0 + w; xx += 4) pts.push([xx, c[1] - 6]);
    });
    o += fade(text(14, 300, 'r = ρ sin φ', ' font-size="19"') + text(14, 326, 'z = ρ cos φ', ' font-size="19"'), a4);
    return svgBox('0 0 520 340', 'Punto P en el espacio con r y θ en el plano xy, la altura z, la distancia ρ al origen y el ángulo φ desde el eje z', o);
  };

  // Corte vertical: φ se mide desde el eje z positivo, no desde el plano xy.
  D['c2s03-phi'] = function () {
    var ox = 130, oy = 186, u = 56, R = 3, Zp = 2.1, o = '', pts = [];
    var px = ox + R * u, py = oy - Zp * u, ph = Math.atan2(R, Zp), lat = Math.PI / 2 - ph;
    // Ejes: z vertical completo y la dirección de θ hacia la derecha
    o += arrow('axis', ox, oy + 150, 0, -300, 1.6) + seg('axis', ox, oy, ox + 330, oy, 1.6);
    o += arrow('axis', ox + 300, oy, 30, 0, 1.6);
    pts.push.apply(pts, segPts(ox, oy + 150, ox, oy - 150).concat(segPts(ox, oy, ox + 330, oy)));
    o += text(ox - 12, oy - 140, 'z', ' text-anchor="end" font-size="20"');
    // Triángulo: r, z y ρ
    o += seg('aux', ox, oy, px, oy, 3.2) + seg('trace', px, oy, px, py, 3.2) + seg('ref', ox, oy, px, py, 3.4);
    pts.push.apply(pts, segPts(ox, oy, px, oy).concat(segPts(px, oy, px, py), segPts(ox, oy, px, py)));
    // φ (correcto) y el ángulo desde el plano (error común)
    var aF = [], aL = [];
    for (var j = 0; j <= 30; j++) { var f = ph * j / 30, g = lat * j / 30; aF.push([ox + 46 * Math.sin(f), oy - 46 * Math.cos(f)]); aL.push([ox + 64 * Math.cos(g), oy - 64 * Math.sin(g)]); }
    o += poly('ref', aF, 2.4) + poly('error', aL, 2.2, false, '6 5');
    pts.push.apply(pts, polyPts(aF).concat(polyPts(aL)));
    o += dot('dot-ref', px, py, 6);
    pts.push([px, py]);
    var vb = [0, 0, 520, 360], L = [];
    var fm = ph / 2, lm = lat / 2;
    L.push([[ox + 64 * Math.sin(fm), oy - 64 * Math.cos(fm) + 6, 'φ', 'middle']].concat(around(ox + 60 * Math.sin(fm), oy - 60 * Math.cos(fm), 'φ')));
    L.push([[ox + 115, oy - 21, 'no es φ', 'middle']].concat(around(ox + 90 * Math.cos(lm), oy - 90 * Math.sin(lm), 'no es φ')));
    L.push(around(px, py, 'P'));
    L.push([[(ox + px) / 2 - 10, (oy + py) / 2 - 10, 'ρ', 'end']].concat(around((ox + px) / 2, (oy + py) / 2, 'ρ')));
    L.push([[(ox + px) / 2, oy + 24, 'r', 'middle']].concat(around((ox + px) / 2, oy, 'r')));
    L.push([[px + 12, (oy + py) / 2 + 6, 'z', 'start']].concat(around(px, (oy + py) / 2, 'z')));
    // Hacia dónde apunta cada valor de φ: arriba 0, en el plano π/2, abajo π.
    L.push([[ox - 10, oy - 108, 'φ = 0', 'end'], [ox + 12, oy - 108, 'φ = 0', 'start']]);
    L.push([[ox + 330, oy + 26, 'φ = π/2', 'end'], [ox + 330, oy - 12, 'φ = π/2', 'end']]);
    L.push([[ox - 10, oy + 140, 'φ = π', 'end'], [ox + 12, oy + 140, 'φ = π', 'start']]);
    L.forEach(function (cands) {
      var c = spot(cands, pts, 19, vb);
      o += label(c, 19);
      var w = String(c[2]).length * 11.4, x0 = c[3] === 'end' ? c[0] - w : c[3] === 'middle' ? c[0] - w / 2 : c[0];
      for (var xx = x0; xx <= x0 + w; xx += 4) pts.push([xx, c[1] - 6]);
    });
    o += text(330, 300, 'r = ρ sin φ', ' font-size="19"') + text(330, 328, 'z = ρ cos φ', ' font-size="19"');
    return svgBox('0 0 520 360', 'Corte vertical por el eje z: φ se mide desde el eje z positivo y va de 0 a π; el ángulo desde el plano xy no es φ', o);
  };

  // Superficies de coordenada constante. state.kind: 'r' | 'theta' | 'z' | 'rho' | 'phi'; state.c: el valor
  // (numérico, se anima entre pasos); state.lbl: la ecuación que se escribe en la esquina.
  D['c2s03-superficies'] = function (s) {
    var kind = (s && s.kind) || 'r', c = num(s, 'c', 2), lbl = (s && s.lbl) || 'r = 2', name = (s && s.name) || '';
    var vw = { cx: 270, cy: 206, s: 42, az: -35, el: 22 }, P = view3(vw), pts = [], o = '';
    var ca = Math.cos(vw.az * RAD), sa = Math.sin(vw.az * RAD), ce = Math.cos(vw.el * RAD), se = Math.sin(vw.el * RAD);
    function xr(p) { return p[0] * ca - p[1] * sa; }
    var backV = function (p) { return xr(p) < 0; };                              // superficies verticales
    var backS = function (p) { return xr(p) * ce + p[2] * se < 0; };              // esfera
    o += c2s03Axes(P, 3.4, 2.6, pts);
    var i, t, H = 2.3;
    if (kind === 'r') {
      [-H, 0, H].forEach(function (z) { o += c2s03Line(P, c2s03Circle(0, c, 48, function (x, y) { return [x, y, z]; }), 'ref', 2.2, backV, pts); });
      for (i = 0; i < 12; i++) {
        t = 2 * Math.PI * i / 12;
        var p0 = [c * Math.cos(t), c * Math.sin(t), -H], p1 = [c * Math.cos(t), c * Math.sin(t), H];
        o += c2s03Line(P, [p0, p1], 'ref', 1.4, backV, pts);
      }
    } else if (kind === 'theta') {
      var W = 2.4, cs = Math.cos(c), sn = Math.sin(c);
      var quad = [[0, 0, -H], [W * cs, W * sn, -H], [W * cs, W * sn, H], [0, 0, H]].map(P);
      o += fill('area-fill', quad) + poly('ref', quad, 2.2, true);
      pts.push.apply(pts, polyPts(quad.concat([quad[0]])));
      for (i = 1; i < 4; i++) { var a = P([W * i / 4 * cs, W * i / 4 * sn, -H]), b = P([W * i / 4 * cs, W * i / 4 * sn, H]); o += seg('ref', a[0], a[1], b[0], b[1], 1.2); pts.push.apply(pts, segPts(a[0], a[1], b[0], b[1])); }
      for (i = -1; i <= 1; i++) { var e = P([0, 0, i * H / 2]), f = P([W * cs, W * sn, i * H / 2]); o += seg('ref', e[0], e[1], f[0], f[1], 1.2); pts.push.apply(pts, segPts(e[0], e[1], f[0], f[1])); }
    } else if (kind === 'z') {
      var Wz = 2.6, sq = [[-Wz, -Wz, c], [Wz, -Wz, c], [Wz, Wz, c], [-Wz, Wz, c]].map(P);
      o += fill('area-fill', sq) + poly('ref', sq, 2.2, true);
      pts.push.apply(pts, polyPts(sq.concat([sq[0]])));
      for (i = -1; i <= 1; i++) {
        var g1 = P([i * Wz / 2, -Wz, c]), g2 = P([i * Wz / 2, Wz, c]), g3 = P([-Wz, i * Wz / 2, c]), g4 = P([Wz, i * Wz / 2, c]);
        o += seg('ref', g1[0], g1[1], g2[0], g2[1], 1.2) + seg('ref', g3[0], g3[1], g4[0], g4[1], 1.2);
        pts.push.apply(pts, segPts(g1[0], g1[1], g2[0], g2[1]).concat(segPts(g3[0], g3[1], g4[0], g4[1])));
      }
    } else if (kind === 'rho') {
      var O = P([0, 0, 0]), out = [];
      for (i = 0; i <= 64; i++) { t = 2 * Math.PI * i / 64; out.push([O[0] + vw.s * c * Math.cos(t), O[1] + vw.s * c * Math.sin(t)]); }
      o += poly('ref', out, 2.4);
      pts.push.apply(pts, polyPts(out));
      [-0.6, 0, 0.6].forEach(function (h) {
        var rr = c * Math.sqrt(1 - h * h), zz = c * h;
        o += c2s03Line(P, c2s03Circle(0, rr, 48, function (x, y) { return [x, y, zz]; }), 'ref', 1.5, backS, pts);
      });
      [0, Math.PI / 2].forEach(function (m) {
        o += c2s03Line(P, c2s03Circle(0, c, 48, function (u, v) { return [u * Math.cos(m), u * Math.sin(m), v]; }), 'ref', 1.5, backS, pts);
      });
    } else {
      var Rc = 2.6, sp = Math.sin(c), cp = Math.cos(c);
      [Rc / 2, Rc].forEach(function (q) { o += c2s03Line(P, c2s03Circle(0, q * sp, 48, function (x, y) { return [x, y, q * cp]; }), 'ref', 2, backV, pts); });
      for (i = 0; i < 12; i++) {
        t = 2 * Math.PI * i / 12;
        o += c2s03Line(P, [[0, 0, 0], [Rc * sp * Math.cos(t), Rc * sp * Math.sin(t), Rc * cp]], 'ref', 1.3, backV, pts);
      }
    }
    o += text(16, 36, lbl, ' font-size="23"');
    if (name) o += text(16, 62, name, ' font-size="17"');
    return svgBox('0 0 520 380', 'Superficie ' + lbl + (name ? ': ' + name : ''), o);
  };
  /* ══════════════════════ fin S03 ══════════════════════ */

  /* ══════════════════════ S04 ══════════════════════ */
  // Corte de una colina z = f(x, y) con el plano y = b (dir 'x') o x = a (dir 'y'):
  // la traza y su tangente. state: { dir, plane, trace, tan } (0…1, se animan).
  D['c2s04-slice'] = function (st) {
    var dir = st && st.dir === 'y' ? 'y' : 'x';
    var oP = clamp01(num(st, 'plane', 1)), oT = clamp01(num(st, 'trace', 1)), oG = clamp01(num(st, 'tan', 1));
    var L = 2.5, a = -1.3, b = -1.2, KZ = 1.15, ZT = 3.7;
    var f = function (x, y) { return 3 - 0.15 * x * x - 0.2 * y * y + 0.2 * x; };
    var fx = function (x) { return -0.3 * x + 0.2; }, fy = function (y) { return -0.4 * y; };
    var P0 = view3({ cx: 360, cy: 262, s: 42, az: -32, el: 22 });
    var P = function (x, y, z) { return P0([x, y, z * KZ]); };
    var o = '', i, j, k, n = 10, N = 30, q, pts;
    // Piso y malla de la superficie.
    o += poly('axis', [P(-L, -L, 0), P(L, -L, 0), P(L, L, 0), P(-L, L, 0)], 1.2, true, '4 5');
    for (i = 0; i <= n; i++) {
      var u = -L + 2 * L * i / n, l1 = [], l2 = [];
      for (j = 0; j <= N; j++) { var t = -L + 2 * L * j / N; l1.push(P(u, t, f(u, t))); l2.push(P(t, u, f(t, u))); }
      o += poly('ref', l1, 1.2) + poly('ref', l2, 1.2);
    }
    o = '<g opacity="0.55">' + o + '</g>';
    // Plano de corte.
    var pl = dir === 'x' ? [P(-L, b, 0), P(L, b, 0), P(L, b, ZT), P(-L, b, ZT)] : [P(a, -L, 0), P(a, L, 0), P(a, L, ZT), P(a, -L, ZT)];
    o += fade(fill('rect-fill', pl), oP * 0.9);
    // El punto (a, b) en el piso, la vertical y el punto en la superficie.
    var z0 = f(a, b), A = P(a, b, 0), B = P(a, b, z0);
    o += seg('axis', A[0], A[1], B[0], B[1], 1.4, '4 4') + dot('dot-ref', A[0], A[1], 4);
    // Traza y tangente.
    pts = [];
    for (k = 0; k <= 60; k++) { q = -L + 2 * L * k / 60; pts.push(dir === 'x' ? P(q, b, f(q, b)) : P(a, q, f(a, q))); }
    o += fade(poly('aux', pts, 4), oT);
    var m = dir === 'x' ? fx(a) : fy(b), d = 1.1;
    var T0 = dir === 'x' ? P(a - d, b, z0 - m * d) : P(a, b - d, z0 - m * d), T1 = dir === 'x' ? P(a + d, b, z0 + m * d) : P(a, b + d, z0 + m * d);
    o += fade(seg('error', T0[0], T0[1], T1[0], T1[1], 3), oG);
    o += dot('dot-trace', B[0], B[1], 6);
    // Ejes en la esquina del piso, con la letra más allá de la punta.
    var c0 = P(-L, -L, 0), ex = P(L + 0.9, -L, 0), ey = P(-L, L + 0.9, 0), ez = P(-L, -L, 3.9);
    [[ex, 'x'], [ey, 'y'], [ez, 'z']].forEach(function (e) {
      o += arrow('axis', c0[0], c0[1], e[0][0] - c0[0], e[0][1] - c0[1], 1.6);
      var dx = e[0][0] - c0[0], dy = e[0][1] - c0[1], mm = Math.hypot(dx, dy) || 1;
      o += text(e[0][0] + dx / mm * 14, e[0][1] + dy / mm * 14 + 6, e[1], ' text-anchor="middle" font-size="18"');
    });
    // Leyenda en la esquina (lejos de la superficie).
    var w = dir, c = dir === 'x' ? 'y' : 'x', cv = dir === 'x' ? 'b' : 'a';
    o += text(16, 30, 'z = f(x, y)', ' font-size="17"');
    o += fade(text(16, 56, 'corte: ' + c + ' = ' + cv, ' font-size="17"'), oP);
    o += fade(text(16, 82, 'traza: z = ' + (dir === 'x' ? 'f(x, b)' : 'f(a, y)'), ' font-size="17"'), oT);
    o += fade(text(16, 108, 'pendiente: ∂f/∂' + w, ' font-size="17"'), oG);
    return svgBox('0 0 600 360', 'Superficie z = f(x, y) cortada por el plano ' + c + ' = ' + cv + '; la traza es una curva y su tangente tiene pendiente ∂f/∂' + w + '.', o);
  };

  // Placa caliente T(x, y) = 80 − x² − 3y² (°C, x y y en cm): isotermas y las dos razones de cambio en P(2, 1).
  D['c2s04-plate'] = function () {
    var X = function (x) { return 190 + x * 38; }, Y = function (y) { return 170 - y * 38; };
    var o = fill('area-fill', [[X(-4.4), Y(-3)], [X(4.4), Y(-3)], [X(4.4), Y(3)], [X(-4.4), Y(3)]]);
    o += poly('axis', [[X(-4.4), Y(-3)], [X(4.4), Y(-3)], [X(4.4), Y(3)], [X(-4.4), Y(3)]], 1.4, true);
    var used = [];
    [2, 6, 12, 19].forEach(function (c) {
      var pts = [];
      for (var i = 0; i <= 72; i++) { var t = 2 * Math.PI * i / 72; pts.push([X(Math.sqrt(c) * Math.cos(t)), Y(Math.sqrt(c / 3) * Math.sin(t))]); }
      o += poly('ref', pts, 1.6, true, '5 5');
      used = used.concat(polyPts(pts));
    });
    var px = X(2), py = Y(1);
    o += arrow('error', px, py, 64, 0, 3) + arrow('aux', px, py, 0, -64, 3) + dot('dot-trace', px, py, 6);
    used = used.concat(arrowPts(px, py, 64, 0), arrowPts(px, py, 0, -64));
    o += label(spot(around(px, py, 'P'), used, 17, [X(-4.4), Y(3), X(4.4), Y(-3)]), 17);
    o += text(X(0), Y(0) + 6, '80 °C', ' text-anchor="middle" font-size="15"');
    // Panel de valores a la derecha de la placa; las flechas de color dicen qué dirección es cuál.
    o += text(392, 60, 'T(x, y) = 80 − x² − 3y²', ' font-size="16"');
    o += text(392, 100, 'en P(2, 1): T = 73 °C', ' font-size="16"');
    o += arrow('error', 392, 140, 30, 0, 3) + text(432, 146, 'hacia +x:', ' font-size="16"');
    o += text(392, 172, '∂T/∂x = −2x = −4 °C/cm', ' font-size="16"');
    o += arrow('aux', 407, 228, 0, -26, 3) + text(432, 222, 'hacia +y:', ' font-size="16"');
    o += text(392, 252, '∂T/∂y = −6y = −6 °C/cm', ' font-size="16"');
    o += text(392, 294, 'Hacia +y se enfría', ' font-size="15"') + text(392, 316, 'más rápido.', ' font-size="15"');
    return svgBox('0 0 640 340', 'Placa con isotermas elípticas alrededor del centro caliente; en P(2, 1) la temperatura baja 4 °C por cm hacia +x y 6 °C por cm hacia +y.', o);
  };

  // Árbol de derivadas: f → f_x, f_y → f_xx, f_xy, f_yx, f_yy; las mixtas son iguales (Clairaut).
  D['c2s04-tree'] = function (st) {
    var hl = clamp01(num(st, 'hl', 1));
    function box(cx, cy, s, cls) {
      return '<rect class="' + cls + '" x="' + r1(cx - 46) + '" y="' + r1(cy - 20) + '" width="92" height="40" rx="8"/>' + text(cx, cy + 7, s, ' text-anchor="middle" font-size="19"');
    }
    function link(x1, y1, x2, y2, cls) { return arrow(cls, x1, y1 + 22, (x2 - x1) * 0.94, (y2 - y1 - 44) * 0.94 + 2, 2); }
    function sub(t) { return 'f<tspan dy="5" font-size="14">' + t + '</tspan>'; }
    var o = '';
    var top = [320, 46], L1 = [[180, 136], [460, 136]], L2 = [[90, 236], [250, 236], [390, 236], [550, 236]];
    o += link(top[0], top[1], L1[0][0], L1[0][1], 'error') + link(top[0], top[1], L1[1][0], L1[1][1], 'aux');
    o += link(L1[0][0], L1[0][1], L2[0][0], L2[0][1], 'error') + link(L1[0][0], L1[0][1], L2[1][0], L2[1][1], 'aux');
    o += link(L1[1][0], L1[1][1], L2[2][0], L2[2][1], 'error') + link(L1[1][0], L1[1][1], L2[3][0], L2[3][1], 'aux');
    o += box(top[0], top[1], 'f', 'box-base');
    o += box(L1[0][0], L1[0][1], sub('x'), 'box-base') + box(L1[1][0], L1[1][1], sub('y'), 'box-base');
    o += box(L2[0][0], L2[0][1], sub('xx'), 'box-base') + box(L2[1][0], L2[1][1], sub('xy'), hl > 0.5 ? 'box-aux' : 'box-base');
    o += box(L2[2][0], L2[2][1], sub('yx'), hl > 0.5 ? 'box-aux' : 'box-base') + box(L2[3][0], L2[3][1], sub('yy'), 'box-base');
    o += fade(text(320, 243, '=', ' text-anchor="middle" font-size="24"') + text(320, 300, 'Clairaut: iguales si son continuas', ' text-anchor="middle" font-size="16"'), hl);
    o += seg('error', 40, 326, 70, 326, 3) + text(78, 331, 'deriva respecto a x', ' font-size="15"');
    o += seg('aux', 360, 326, 390, 326, 3) + text(398, 331, 'deriva respecto a y', ' font-size="15"');
    return svgBox('0 0 640 345', 'Árbol de derivadas parciales: de f salen fx y fy; de cada una, dos segundas derivadas. Las mixtas fxy y fyx son iguales.', o);
  };

  /* ══════════════════════ fin S04 ══════════════════════ */

  /* ══════════════════════ S05 ══════════════════════ */
  // Colina común de S05: z = 3 − 0.16x² − 0.24y², con sus parciales.
  function c2s05f(x, y) { return 3 - 0.16 * x * x - 0.24 * y * y; }
  function c2s05fx(x) { return -0.32 * x; }
  function c2s05fy(y) { return -0.48 * y; }
  function c2s05sub(s, t) { return s + '<tspan baseline-shift="sub" font-size="12">' + t + '</tspan>'; }
  // Malla de la colina en [−L, L]², piso punteado y ejes en la esquina (−L, −L).
  function c2s05Hill(P, L) {
    var o = '', i, j, n = 10, N = 30;
    o += poly('axis', [P(-L, -L, 0), P(L, -L, 0), P(L, L, 0), P(-L, L, 0)], 1.2, true, '4 5');
    for (i = 0; i <= n; i++) {
      var u = -L + 2 * L * i / n, l1 = [], l2 = [];
      for (j = 0; j <= N; j++) { var t = -L + 2 * L * j / N; l1.push(P(u, t, c2s05f(u, t))); l2.push(P(t, u, c2s05f(t, u))); }
      o += poly('ref', l1, 1.2) + poly('ref', l2, 1.2);
    }
    o = '<g opacity="0.5">' + o + '</g>';
    var c0 = P(-L, -L, 0), ex = P(L + 0.9, -L, 0), ey = P(-L, L + 0.9, 0), ez = P(-L, -L, 3.5);
    [[ex, 'x'], [ey, 'y'], [ez, 'z']].forEach(function (e) {
      o += arrow('axis', c0[0], c0[1], e[0][0] - c0[0], e[0][1] - c0[1], 1.6);
      var dx = e[0][0] - c0[0], dy = e[0][1] - c0[1], mm = Math.hypot(dx, dy) || 1;
      o += text(e[0][0] + dx / mm * 14, e[0][1] + dy / mm * 14 + 6, e[1], ' text-anchor="middle" font-size="18"');
    });
    return o;
  }
  // Renglón de la leyenda: muestra del trazo y su texto (o se desvanece con op).
  function c2s05Key(y, cls, s, op, dash) {
    return fade(seg(cls, 16, y - 6, 40, y - 6, 3, dash) + text(48, y, s, ' font-size="17"'), op == null ? 1 : op);
  }

  // S05 · Del corte al plano: las tangentes de las dos trazas generan el plano tangente; su normal.
  // state: { tx, ty, pl, nr } (0…1, se animan).
  D['c2s05-tangent'] = function (st) {
    var oX = clamp01(num(st, 'tx', 1)), oY = clamp01(num(st, 'ty', 1)), oP = clamp01(num(st, 'pl', 1)), oN = clamp01(num(st, 'nr', 1));
    var L = 2.5, a = 1.2, b = 1.2, z0 = c2s05f(a, b), mx = c2s05fx(a), my = c2s05fy(b);
    var P0 = view3({ cx: 350, cy: 252, s: 44, az: -32, el: 22 });
    var P = function (x, y, z) { return P0([x, y, z]); };
    var o = c2s05Hill(P, L), k, q, pts, d = 1.1;
    var pz = function (x, y) { return z0 + mx * (x - a) + my * (y - b); };
    // Plano tangente: un parche alrededor del punto.
    var r = 0.8, patch = [P(a - r, b - r, pz(a - r, b - r)), P(a + r, b - r, pz(a + r, b - r)), P(a + r, b + r, pz(a + r, b + r)), P(a - r, b + r, pz(a - r, b + r))];
    o += fade(fill('box-trace', patch), oP);
    // Trazas (cortes y = b y x = a) y sus tangentes.
    pts = []; for (k = 0; k <= 60; k++) { q = -L + 2 * L * k / 60; pts.push(P(q, b, c2s05f(q, b))); }
    o += fade(poly('aux', pts, 3.4), oX);
    pts = []; for (k = 0; k <= 60; k++) { q = -L + 2 * L * k / 60; pts.push(P(a, q, c2s05f(a, q))); }
    o += fade(poly('aux', pts, 3.4), oY);
    var X0 = P(a - d, b, z0 - mx * d), X1 = P(a + d, b, z0 + mx * d), Y0 = P(a, b - d, z0 - my * d), Y1 = P(a, b + d, z0 + my * d);
    o += fade(seg('trace', X0[0], X0[1], X1[0], X1[1], 3.2), oX) + fade(seg('trace', Y0[0], Y0[1], Y1[0], Y1[1], 3.2), oY);
    // Normal (dibujada hacia arriba: ⟨−fx, −fy, 1⟩, la opuesta de ⟨fx, fy, −1⟩).
    var B = P(a, b, z0), nl = Math.hypot(mx, my, 1), E = P(a - 1.5 * mx / nl, b - 1.5 * my / nl, z0 + 1.5 / nl);
    o += fade(arrow('error', B[0], B[1], E[0] - B[0], E[1] - B[1], 3), oN);
    var A = P(a, b, 0);
    o += seg('axis', A[0], A[1], B[0], B[1], 1.4, '4 4') + dot('dot-ref', A[0], A[1], 4) + dot('dot-trace', B[0], B[1], 6);
    // Leyenda en la esquina, lejos de la superficie.
    o += text(16, 30, 'z = f(x, y)', ' font-size="17"');
    o += c2s05Key(58, 'trace', 'tangente en x: pendiente ' + c2s05sub('f', 'x'), oX);
    o += c2s05Key(86, 'trace', 'tangente en y: pendiente ' + c2s05sub('f', 'y'), oY);
    o += fade('<rect class="box-trace" x="16" y="100" width="24" height="14" rx="2"/>' + text(48, 114, 'plano tangente', ' font-size="17"'), oP);
    o += c2s05Key(142, 'error', 'normal ∥ ⟨' + c2s05sub('f', 'x') + ', ' + c2s05sub('f', 'y') + ', −1⟩', oN);
    return svgBox('0 0 600 360', 'Colina z = f(x, y) con un punto P. Las tangentes a las dos trazas por P tienen pendientes fx y fy; juntas generan el plano tangente, cuya normal es paralela a (fx, fy, −1).', o);
  };

  // S05 · dz contra Δz: en el plano, el paso en x sube fx·Δx y el de y sube fy·Δy; la superficie
  // sube Δz y el hueco es el error. state: { k: 0…4 (etapa), s: tamaño del paso (1 o 0.5) }.
  D['c2s05-dz'] = function (st) {
    var k = num(st, 'k', 4), s = Math.max(0.2, Math.min(1, num(st, 's', 1)));
    var L = 2.5, a = 0.2, b = 0.3, DX = 1.3 * s, DY = 1.5 * s;
    var z0 = c2s05f(a, b), mx = c2s05fx(a), my = c2s05fy(b), dz = mx * DX + my * DY, real = c2s05f(a + DX, b + DY) - z0;
    var P0 = view3({ cx: 380, cy: 255, s: 44, az: -32, el: 22 });
    var P = function (x, y, z) { return P0([x, y, z]); };
    var o = c2s05Hill(P, L), o1 = clamp01(k), o2 = clamp01(k - 1), o3 = clamp01(k - 2), o4 = clamp01(k - 3);
    var pz = function (x, y) { return z0 + mx * (x - a) + my * (y - b); };
    var m = 0.35, x0 = a - m, x1 = a + DX + m, y0 = b - m, y1 = b + DY + m;
    o += fade(fill('box-trace', [P(x0, y0, pz(x0, y0)), P(x1, y0, pz(x1, y0)), P(x1, y1, pz(x1, y1)), P(x0, y1, pz(x0, y1))]), 0.75 * o2);
    // El paso en el piso.
    var F0 = P(a, b, 0), F1 = P(a + DX, b, 0), F2 = P(a + DX, b + DY, 0);
    o += fade(arrow('aux', F0[0], F0[1], F1[0] - F0[0], F1[1] - F0[1], 2.4) + arrow('aux', F1[0], F1[1], F2[0] - F1[0], F2[1] - F1[1], 2.4), o1);
    // Escalera sobre el plano: primero en x, luego en y.
    var A0 = P(a, b, z0), A1 = P(a + DX, b, z0 + mx * DX), A2 = P(a + DX, b + DY, z0 + dz), Q = P(a + DX, b + DY, z0 + real);
    o += seg('axis', F0[0], F0[1], A0[0], A0[1], 1.3, '4 4');
    o += fade(arrow('trace', A0[0], A0[1], A1[0] - A0[0], A1[1] - A0[1], 3), o2);
    o += fade(arrow('trace', A1[0], A1[1], A2[0] - A1[0], A2[1] - A1[1], 3), o3);
    o += fade(seg('axis', F2[0], F2[1], Math.min(A2[1], Q[1]) === A2[1] ? A2[0] : Q[0], Math.min(A2[1], Q[1]), 1.3, '4 4'), o1);
    o += fade(seg('error', Q[0], Q[1], A2[0], A2[1], 4) + dot('dot-ref', Q[0], Q[1], 5), o4);
    o += fade(dot('dot-aux', A2[0], A2[1], 5), o3);
    o += dot('dot-trace', A0[0], A0[1], 6);
    // Leyenda con los números del paso actual.
    function f2(v) { return v.toFixed(2).replace('-', '−'); }
    o += c2s05Key(30, 'aux', 'piso: Δx = ' + f2(DX) + ', Δy = ' + f2(DY), o1);
    o += c2s05Key(58, 'trace', 'plano: dz = ' + f2(dz), o3);
    o += fade(text(48, 86, 'superficie: Δz = ' + f2(real), ' font-size="17"'), o4);
    o += c2s05Key(114, 'error', 'error |Δz − dz| = ' + f2(Math.abs(dz - real)), o4);
    return svgBox('0 0 600 360', 'Desde P se avanza Δx y Δy. Sobre el plano tangente se sube fx·Δx y luego fy·Δy, en total dz; la superficie sube Δz. El hueco vertical es el error |Δz − dz|.', o);
  };

  // S05 · Cilindro V = πr²h: una pared delgada (2πrh·dr) y una tapa delgada (πr²·dh) forman dV.
  D['c2s05-cylinder'] = function () {
    var cx = 165, R = 92, ry = 22, top = 96, bot = 262, d = 15, t = 17, o = '';
    function arcD(x0, y0, x1, y1, sweep) { return 'A' + R + ' ' + ry + ' 0 0 ' + sweep + ' ' + r1(x1) + ' ' + r1(y1); }
    // Pared delgada (dr): franjas a los lados.
    o += fill('box-aux', [[cx - R - d, top], [cx - R, top], [cx - R, bot], [cx - R - d, bot]]);
    o += fill('box-aux', [[cx + R, top], [cx + R + d, top], [cx + R + d, bot], [cx + R, bot]]);
    // Tapa delgada (dh) encima.
    o += '<path class="box-trace" d="M' + r1(cx - R) + ' ' + top + 'L' + r1(cx - R) + ' ' + (top - t) + arcD(cx - R, top - t, cx + R, top - t, 1) +
      'L' + r1(cx + R) + ' ' + top + arcD(cx + R, top, cx - R, top, 1) + 'Z"/>';
    o += '<ellipse class="trace" fill="none" stroke-width="1.6" cx="' + cx + '" cy="' + (top - t) + '" rx="' + R + '" ry="' + ry + '"/>';
    // El cilindro.
    o += '<ellipse class="ref" fill="none" stroke-width="2.6" cx="' + cx + '" cy="' + top + '" rx="' + R + '" ry="' + ry + '"/>';
    o += seg('ref', cx - R, top, cx - R, bot, 2.6) + seg('ref', cx + R, top, cx + R, bot, 2.6);
    o += '<path class="ref" fill="none" stroke-width="2.6" d="M' + r1(cx - R) + ' ' + bot + arcD(cx - R, bot, cx + R, bot, 0) + '"/>';
    o += '<path class="ref" fill="none" stroke-width="1.4" stroke-dasharray="5 5" d="M' + r1(cx - R) + ' ' + bot + arcD(cx - R, bot, cx + R, bot, 1) + '"/>';
    // Cotas: h a la izquierda, r abajo, dr y dh a la derecha.
    var hx = cx - R - d - 22;
    o += seg('axis', hx, top, hx, bot, 1.4) + seg('axis', hx - 6, top, hx + 6, top, 1.4) + seg('axis', hx - 6, bot, hx + 6, bot, 1.4);
    o += text(hx - 10, (top + bot) / 2 + 6, 'h', ' text-anchor="end" font-size="19"');
    o += seg('axis', cx, bot, cx + R, bot, 1.6, '4 3') + dot('dot-ref', cx, bot, 3.5);
    o += text(cx + R / 2, bot + ry + 24, 'r', ' text-anchor="middle" font-size="19"');
    o += text(cx + R + d + 8, (top + bot) / 2 + 6, 'dr', ' font-size="18"');
    o += text(cx + R + 8, top - t - ry - 8, 'dh', ' font-size="18"');
    // Leyenda.
    var lx = 335;
    o += text(lx, 60, 'V = πr²h', ' font-size="19"');
    o += '<rect class="box-aux" x="' + lx + '" y="94" width="24" height="16" rx="2"/>' + text(lx + 32, 108, 'pared: 2πrh · dr', ' font-size="17"');
    o += '<rect class="box-trace" x="' + lx + '" y="132" width="24" height="16" rx="2"/>' + text(lx + 32, 146, 'tapa: πr² · dh', ' font-size="17"');
    o += text(lx, 200, 'dV = 2πrh dr + πr² dh', ' font-size="18"');
    o += text(lx, 236, 'Cada término es lo que', ' font-size="15"');
    o += text(lx, 258, 'agrega una capa delgada.', ' font-size="15"');
    return svgBox('0 0 600 330', 'Cilindro de radio r y altura h. Si el radio crece dr se agrega una pared delgada de volumen 2πrh·dr; si la altura crece dh, una tapa de volumen πr²·dh. La suma es dV.', o);
  };

  /* ══════════════════════ fin S05 ══════════════════════ */

  /* ══════════════════════ S06 ══════════════════════ */
  // Forma del árbol de dependencias. kind: 'one' (z → x, y → t), 'two' (x(s, t), y(s, t)),
  // 'three' (w → x, y, z → t) o 'imp' (F → x; F → y → x). w: hoja que se recorre ('s' o 't').
  // Devuelve nodos { x, y, t, lv, off }, aristas { a, b, t, lv, off } y caminos (índices de aristas).
  function c2s06Shape(kind, w) {
    var r = kind === 'three' ? 'w' : kind === 'imp' ? 'F' : 'z', N = [], E = [], P = [];
    N.push({ x: 300, y: 40, t: r, lv: 0 });
    if (kind === 'imp') {
      N.push({ x: 150, y: 250, t: 'x', lv: 1 }, { x: 450, y: 145, t: 'y', lv: 1 }, { x: 450, y: 250, t: 'x', lv: 2 });
      E.push({ a: 0, b: 1, t: '∂F/∂x', lv: 1 }, { a: 0, b: 2, t: '∂F/∂y', lv: 1 }, { a: 2, b: 3, t: 'dy/dx', lv: 2 });
      P.push([0], [1, 2]);
      return { N: N, E: E, P: P, r: r };
    }
    var us = kind === 'three' ? ['x', 'y', 'z'] : ['x', 'y'], xs = us.length === 3 ? [100, 300, 500] : [150, 450];
    var ps = kind === 'two' ? ['s', 't'] : ['t'], d = ps.length === 1 ? 'd' : '∂';
    us.forEach(function (u, i) {
      N.push({ x: xs[i], y: 145, t: u, lv: 1 });
      var ui = N.length - 1, top = E.length;
      E.push({ a: 0, b: ui, t: '∂' + r + '/∂' + u, lv: 1 });
      ps.forEach(function (p, j) {
        var off = p !== (w || 't');
        N.push({ x: ps.length === 1 ? xs[i] : xs[i] + (j ? 70 : -70), y: 250, t: p, lv: 2, off: off });
        E.push({ a: ui, b: N.length - 1, t: d + u + '/' + d + p, lv: 2, off: off });
        if (!off) P.push([top, E.length - 1]);
      });
    });
    return { N: N, E: E, P: P, r: r };
  }
  // S06 · El árbol que se arma y se recorre.
  // state: { kind, w, lv: 0…2 (niveles visibles), h1, h2, h3: 0…1 (camino resaltado), f1, f2, f3: 0…1 (términos de la fórmula) }.
  D['c2s06-tree'] = function (st) {
    var kind = st && st.kind ? st.kind : 'one', w = st && st.w === 's' ? 's' : 't', S = c2s06Shape(kind, w);
    var lv = num(st, 'lv', 2), hs = [num(st, 'h1', 0), num(st, 'h2', 0), num(st, 'h3', 0)], fs = [num(st, 'f1', 1), num(st, 'f2', 1), num(st, 'f3', 1)];
    var BW = 50, BH = 34, o = '', pts = [], boxes = [];
    function op(l) { return clamp01(lv - l + 1); }
    function ends(e) { var A = S.N[e.a], B = S.N[e.b]; return [A.x, A.y + BH / 2, B.x, B.y - BH / 2]; }
    // Aristas (tenues las que no llegan a la variable que se deriva).
    S.E.forEach(function (e) {
      var q = ends(e), a = op(e.lv) * (e.off ? 0.35 : 1);
      o += fade(seg('axis', q[0], q[1], q[2], q[3], 1.8), a);
      if (a > 0.001) pts = pts.concat(segPts(q[0], q[1], q[2], q[3]));
    });
    // Caminos resaltados.
    S.P.forEach(function (p, i) {
      if (hs[i] <= 0.001) return;
      p.forEach(function (k) { var q = ends(S.E[k]); o += fade(seg('error', q[0], q[1], q[2], q[3], 4.2), hs[i] * op(S.E[k].lv)); });
    });
    // Nodos.
    S.N.forEach(function (n) {
      var a = op(n.lv) * (n.off ? 0.35 : 1);
      boxes.push([n.x - BW / 2 - 4, n.y - BH / 2 - 4, n.x + BW / 2 + 4, n.y + BH / 2 + 4]);
      o += fade('<rect class="box-base" x="' + r1(n.x - BW / 2) + '" y="' + r1(n.y - BH / 2) + '" width="' + BW + '" height="' + BH + '" rx="8"/>' +
        text(n.x, n.y + 7, n.t, ' text-anchor="middle" font-size="20"'), a);
    });
    // Etiquetas de las aristas: posiciones a los lados de la arista que no tocan trazos, cajas ni otras etiquetas.
    boxes.forEach(function (b) { pts = pts.concat(segPts(b[0], b[1], b[2], b[1]), segPts(b[0], b[3], b[2], b[3]), segPts(b[0], b[1], b[0], b[3]), segPts(b[2], b[1], b[2], b[3])); });
    var FS = 17, used = pts.slice();
    S.E.forEach(function (e) {
      if (e.off) return;
      var q = ends(e), dx = q[2] - q[0], dy = q[3] - q[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, c = [];
      [0.5, 0.42, 0.58, 0.34, 0.66].forEach(function (f) {
        [14, 22, 32].forEach(function (k) {
          [-1, 1].forEach(function (sd) {
            var sx = sd * nx;
            c.push([q[0] + dx * f + sd * nx * k, q[1] + dy * f + sd * ny * k + 6, e.t, sx > 0.25 ? 'start' : sx < -0.25 ? 'end' : 'middle']);
          });
        });
      });
      var best = spot(c, used, FS, [0, 0, 600, 300]);
      var wd = e.t.length * FS * 0.6, x0 = best[3] === 'end' ? best[0] - wd : best[3] === 'middle' ? best[0] - wd / 2 : best[0];
      used = used.concat(segPts(x0, best[1] - FS * 0.8, x0 + wd, best[1] - FS * 0.8), segPts(x0, best[1], x0 + wd, best[1]));
      o += fade(label(best, FS), op(e.lv));
    });
    // Fórmula que se arma término por término.
    var lhs = kind === 'imp' ? '' : kind === 'two' ? '∂z/∂' + w + ' = ' : 'd' + S.r + '/dt = ';
    var terms = S.P.map(function (p) { return p.map(function (k) { return S.E[k].t; }).join(' · '); });
    if (kind === 'imp') terms[0] += ' · 1';
    var show = fs.slice(0, terms.length), any = Math.max.apply(null, show);
    var line = '<tspan fill-opacity="' + clamp01(any).toFixed(2) + '">' + lhs + '</tspan>';
    terms.forEach(function (t, i) {
      line += '<tspan fill-opacity="' + clamp01(show[i]).toFixed(2) + '">' + (i ? ' + ' : '') + t + '</tspan>';
    });
    if (kind === 'imp') line += '<tspan fill-opacity="' + clamp01(Math.min.apply(null, show)).toFixed(2) + '"> = 0</tspan>';
    if (any > 0.001) o += text(300, 296, line, ' text-anchor="middle" font-size="' + (kind === 'three' ? 15 : 17) + '"');
    var desc = { one: 'z depende de x y y; las dos dependen de t. Dos caminos de z a t.', two: 'z depende de x y y; cada una depende de s y t. Dos caminos de z a ' + w + '.', three: 'w depende de x, y y z; las tres dependen de t. Tres caminos.', imp: 'F depende de x y de y, y y depende de x: un camino directo de F a x y otro que pasa por y.' };
    return svgBox('0 0 600 310', 'Árbol de dependencias de la regla de la cadena: ' + desc[kind] + ' Dentro de un camino se multiplica; entre caminos se suma.', o);
  };

  // S06 · El globo sobre el cerro: isotermas de T = 30 − x² − 2y², la trayectoria x = 1 + t,
  // y = 2t y, en t = 0.5, el avance hacia el este (dx/dt) y hacia el norte (dy/dt).
  D['c2s06-hill'] = function () {
    var X = function (x) { return 190 + x * 44; }, Y = function (y) { return 168 - y * 44; };
    var o = '', used = [];
    o += poly('axis', [[X(-3.8), Y(-3)], [X(3.8), Y(-3)], [X(3.8), Y(3)], [X(-3.8), Y(3)]], 1.4, true);
    [2, 6, 11, 17].forEach(function (c) {
      var pts = [];
      for (var i = 0; i <= 72; i++) { var t = 2 * Math.PI * i / 72; pts.push([X(Math.sqrt(c) * Math.cos(t)), Y(Math.sqrt(c / 2) * Math.sin(t))]); }
      o += poly('ref', pts, 1.6, true, '5 5');
      used = used.concat(polyPts(pts));
    });
    o += text(X(0), Y(0) + 6, '30 °C', ' text-anchor="middle" font-size="15"');
    // Trayectoria del globo (t de 0 a 1.25) y el punto en t = 0.5.
    var tr = [];
    for (var k = 0; k <= 20; k++) { var t = 1.25 * k / 20; tr.push([X(1 + t), Y(2 * t)]); }
    o += poly('trace', tr, 3);
    used = used.concat(polyPts(tr));
    var px = X(1.5), py = Y(1), s = 26;
    o += arrow('aux', px, py, s, 0, 3) + arrow('error', px + s, py, 0, -2 * s, 3);
    used = used.concat(arrowPts(px, py, s, 0), arrowPts(px + s, py, 0, -2 * s));
    o += dot('dot-trace', px, py, 6);
    var vb = [X(-3.8), Y(3), X(3.8), Y(-3)];
    // El rótulo del centro también cuenta como ocupado.
    used = used.concat(segPts(X(0) - 26, Y(0) - 6, X(0) + 26, Y(0) - 6), segPts(X(0) - 26, Y(0) + 4, X(0) + 26, Y(0) + 4));
    o += label(spot(around(px, py, 'globo'), used, 15, vb), 15);
    // Panel de la derecha: qué aporta cada dirección.
    o += text(392, 52, 'T(x, y) = 30 − x² − 2y²', ' font-size="16"');
    o += seg('trace', 392, 82, 420, 82, 3) + text(430, 88, 'ruta del globo', ' font-size="16"');
    o += arrow('aux', 392, 124, 28, 0, 3) + text(430, 130, 'hacia el este:', ' font-size="16"');
    o += text(392, 156, '∂T/∂x · dx/dt', ' font-size="16"');
    o += arrow('error', 406, 212, 0, -28, 3) + text(430, 204, 'hacia el norte:', ' font-size="16"');
    o += text(392, 236, '∂T/∂y · dy/dt', ' font-size="16"');
    o += text(392, 280, 'dT/dt = suma de las dos', ' font-size="16"');
    return svgBox('0 0 640 340', 'Mapa de un cerro con curvas de igual temperatura. Un globo avanza hacia el este y hacia el norte; cada dirección aporta su parte al cambio de temperatura, y dT/dt es la suma.', o);
  };

  // S06 · La curva x²y + y³ = 10 (y como función de x) con su tangente en (3, 1), pendiente −1/2.
  D['c2s06-curve'] = function () {
    var X = function (x) { return 300 + x * 60; }, Y = function (y) { return 252 - y * 80; };
    function yOf(x) { var y = 1.5; for (var i = 0; i < 40; i++) y -= (y * y * y + x * x * y - 10) / (3 * y * y + x * x); return y; }
    var o = '', used = [], pts = [];
    o += arrow('axis', X(-4.7), Y(0), X(4.7) - X(-4.7), 0, 1.6) + arrow('axis', X(0), Y(-0.2), 0, Y(2.85) - Y(-0.2), 1.6);
    used = used.concat(segPts(X(-4.7), Y(0), X(4.7), Y(0)), segPts(X(0), Y(-0.2), X(0), Y(2.85)));
    o += text(X(4.7) + 4, Y(0) + 22, 'x', ' text-anchor="end" font-size="17"') + text(X(0) + 10, Y(2.85) + 12, 'y', ' font-size="17"');
    for (var k = 0; k <= 90; k++) { var x = -4.5 + 9 * k / 90; pts.push([X(x), Y(yOf(x))]); }
    o += poly('ref', pts, 3);
    used = used.concat(polyPts(pts));
    var m = -0.5, T0 = [X(1.7), Y(1 + m * (1.7 - 3))], T1 = [X(4.4), Y(1 + m * (4.4 - 3))];
    o += seg('error', T0[0], T0[1], T1[0], T1[1], 3);
    used = used.concat(segPts(T0[0], T0[1], T1[0], T1[1]));
    o += dot('dot-trace', X(3), Y(1), 6);
    o += label(spot(around(X(3), Y(1), '(3, 1)'), used, 16, [0, 0, 600, 290]), 16);
    o += text(590, 30, 'x²y + y³ = 10', ' text-anchor="end" font-size="17"');
    o += text(590, 56, 'pendiente en (3, 1): −1/2', ' text-anchor="end" font-size="16"');
    return svgBox('0 0 600 290', 'La curva x²y + y³ = 10 y su recta tangente en el punto (3, 1), con pendiente −1/2.', o);
  };
  /* ══════════════════════ fin S06 ══════════════════════ */

  /* ══════════════════════ S07 ══════════════════════ */
  function c2s07sub(s, t) { return s + '<tspan baseline-shift="sub" font-size="12">' + t + '</tspan>'; }
  function c2s07ell(X, Y, a, b) {
    var pts = [];
    for (var i = 0; i <= 72; i++) { var t = 2 * Math.PI * i / 72; pts.push([X(a * Math.cos(t)), Y(b * Math.sin(t))]); }
    return pts;
  }

  // S07 · Brújula sobre el mapa de contorno: desde P, hacia +x (pendiente f_x), hacia +y (f_y),
  // hacia u (D_u f) y muchas direcciones a la vez. state: { e, n, u, fan } (0…1) y th (grados).
  D['c2s07-compass'] = function (st) {
    var oE = clamp01(num(st, 'e', 1)), oN = clamp01(num(st, 'n', 1)), oU = clamp01(num(st, 'u', 1)), oF = clamp01(num(st, 'fan', 0)), th = num(st, 'th', 55);
    var X = function (x) { return 190 + 38 * x; }, Y = function (y) { return 172 - 38 * y; };
    var o = '', used = [], vb = [X(-4.4), Y(3.9), X(4.4), Y(-3.9)];
    o += poly('axis', [[vb[0], vb[1]], [vb[2], vb[1]], [vb[2], vb[3]], [vb[0], vb[3]]], 1.2, true);
    [2, 9, 17].forEach(function (c) {
      var pts = c2s07ell(X, Y, Math.sqrt(c), Math.sqrt(c / 2));
      o += poly('ref', pts, 1.5, true, '5 5');
      used = used.concat(polyPts(pts));
    });
    o += text(X(0), Y(0) + 6, 'cima', ' text-anchor="middle" font-size="15"');
    var px = X(1.5), py = Y(1.05), Lr = 70, ux = Math.cos(th * RAD), uy = -Math.sin(th * RAD), k;
    // Abanico de direcciones (todas tienen su pendiente).
    var fan = '';
    for (k = 1; k < 8; k++) {                          // sin la de 22.5°: ahí va la etiqueta de θ
      var t = k * 45 * RAD + 22.5 * RAD;
      fan += arrow('trace', px, py, 50 * Math.cos(t), -50 * Math.sin(t), 2);
      used = used.concat(arrowPts(px, py, 50 * Math.cos(t), -50 * Math.sin(t)));
    }
    o += fade('<g opacity="0.6">' + fan + '</g>', oF);
    o += fade(arrow('error', px, py, Lr, 0, 3.2), oE);
    o += fade(arrow('aux', px, py, 0, -Lr, 3.2), oN);
    o += fade(arrow('trace', px, py, Lr * ux, Lr * uy, 3.6), oU);
    used = used.concat(arrowPts(px, py, Lr, 0), arrowPts(px, py, 0, -Lr), arrowPts(px, py, Lr * ux, Lr * uy));
    // Ángulo θ desde +x.
    if (th > 3) {
      o += fade(arc(px, py, 26, 0, th, 'axis', 1.4), oU);
      var cs = [];
      [38, 44, 50, 56, 62].forEach(function (r) { [0.5, 0.35, 0.65].forEach(function (fr) { cs.push([px + r * Math.cos(th * fr * RAD), py - r * Math.sin(th * fr * RAD) + 6, 'θ', 'middle']); }); });
      o += fade(label(spot(cs, used, 18, vb), 18), oU);
    }
    o += label(spot(around(px, py, 'P'), used, 18, vb), 18);
    o += dot('dot-trace', px, py, 6);
    // Leyenda a la derecha del mapa.
    var lx = 400;
    o += text(lx, 44, 'Vista desde arriba', ' font-size="17"');
    o += fade(arrow('error', lx, 88, 34, 0, 3) + text(lx + 46, 94, 'hacia +x: pendiente ' + c2s07sub('f', 'x'), ' font-size="16"'), oE);
    o += fade(arrow('aux', lx + 17, 152, 0, -28, 3) + text(lx + 46, 146, 'hacia +y: pendiente ' + c2s07sub('f', 'y'), ' font-size="16"'), oN);
    o += fade(arrow('trace', lx + 2, 208, 30, -20, 3) + text(lx + 46, 200, 'hacia u: pendiente ' + c2s07sub('D', 'u') + ' f', ' font-size="16"'), oU);
    o += fade(text(lx + 46, 228, 'u = (cos θ, sen θ)', ' font-size="16"'), oU);
    o += fade(text(lx, 280, 'Cada dirección tiene', ' font-size="16"') + text(lx, 302, 'su propia pendiente.', ' font-size="16"'), oF);
    return svgBox('0 0 680 340', 'Mapa de contorno de un cerro visto desde arriba con un punto P. Hacia +x la pendiente es fx, hacia +y es fy y hacia un vector unitario u, a un ángulo θ de +x, es la derivada direccional.', o);
  };

  // S07 · Corte vertical en la dirección de u: el plano vertical que contiene a u corta la colina
  // en una traza; su tangente en P tiene pendiente D_u f. state: { u, plane, trace, tan } (0…1).
  D['c2s07-slice'] = function (st) {
    var oU = clamp01(num(st, 'u', 1)), oP = clamp01(num(st, 'plane', 1)), oT = clamp01(num(st, 'trace', 1)), oG = clamp01(num(st, 'tan', 1));
    var L = 2.5, a = -1, b = -0.9, th = 40 * RAD, u = [Math.cos(th), Math.sin(th)], KZ = 1.15, ZT = 3.7;
    var f = function (x, y) { return 3 - 0.15 * x * x - 0.2 * y * y + 0.2 * x; };
    var m = (-0.3 * a + 0.2) * u[0] + (-0.4 * b) * u[1];
    var P0 = view3({ cx: 360, cy: 262, s: 42, az: -32, el: 22 });
    var P = function (x, y, z) { return P0([x, y, z * KZ]); };
    var o = '', i, j, k, n = 10, N = 30, q, pts;
    o += poly('axis', [P(-L, -L, 0), P(L, -L, 0), P(L, L, 0), P(-L, L, 0)], 1.2, true, '4 5');
    for (i = 0; i <= n; i++) {
      var w = -L + 2 * L * i / n, l1 = [], l2 = [];
      for (j = 0; j <= N; j++) { var t = -L + 2 * L * j / N; l1.push(P(w, t, f(w, t))); l2.push(P(t, w, f(t, w))); }
      o += poly('ref', l1, 1.2) + poly('ref', l2, 1.2);
    }
    o = '<g opacity="0.55">' + o + '</g>';
    // Hasta dónde llega la recta P + t u dentro del piso.
    var t0 = 0, t1 = 0;
    for (q = 0; q <= 8; q += 0.01) { if (Math.abs(a + q * u[0]) <= L && Math.abs(b + q * u[1]) <= L) t1 = q; else break; }
    for (q = 0; q >= -8; q -= 0.01) { if (Math.abs(a + q * u[0]) <= L && Math.abs(b + q * u[1]) <= L) t0 = q; else break; }
    var at = function (t, z) { return P(a + t * u[0], b + t * u[1], z); };
    o += fade(fill('rect-fill', [at(t0, 0), at(t1, 0), at(t1, ZT), at(t0, ZT)]), oP * 0.9);
    var z0 = f(a, b), A = P(a, b, 0), B = P(a, b, z0);
    o += seg('axis', A[0], A[1], B[0], B[1], 1.4, '4 4') + dot('dot-ref', A[0], A[1], 4);
    // u en el piso.
    var U1 = at(1.3, 0);
    o += fade(arrow('trace', A[0], A[1], U1[0] - A[0], U1[1] - A[1], 3.2), oU);
    pts = [];
    for (k = 0; k <= 60; k++) { q = t0 + (t1 - t0) * k / 60; pts.push(at(q, f(a + q * u[0], b + q * u[1]))); }
    o += fade(poly('aux', pts, 4), oT);
    var d = 1.1, T0 = at(-d, z0 - m * d), T1 = at(d, z0 + m * d);
    o += fade(seg('error', T0[0], T0[1], T1[0], T1[1], 3), oG);
    o += dot('dot-trace', B[0], B[1], 6);
    var c0 = P(-L, -L, 0), ex = P(L + 0.9, -L, 0), ey = P(-L, L + 0.9, 0), ez = P(-L, -L, 3.9);
    [[ex, 'x'], [ey, 'y'], [ez, 'z']].forEach(function (e) {
      o += arrow('axis', c0[0], c0[1], e[0][0] - c0[0], e[0][1] - c0[1], 1.6);
      var dx = e[0][0] - c0[0], dy = e[0][1] - c0[1], mm = Math.hypot(dx, dy) || 1;
      o += text(e[0][0] + dx / mm * 14, e[0][1] + dy / mm * 14 + 6, e[1], ' text-anchor="middle" font-size="18"');
    });
    o += text(16, 30, 'z = f(x, y)', ' font-size="17"');
    o += fade(text(16, 56, 'u: dirección en el piso', ' font-size="17"'), oU);
    o += fade(text(16, 82, 'corte: plano vertical', ' font-size="17"'), oP);
    o += fade(text(16, 108, 'traza: z = f(P + tu)', ' font-size="17"'), oT);
    o += fade(text(16, 134, 'pendiente: ' + c2s07sub('D', 'u') + ' f', ' font-size="17"'), oG);
    return svgBox('0 0 600 360', 'Colina z = f(x, y) con un punto P. Un plano vertical que pasa por P y contiene la dirección u corta la colina en una curva; la pendiente de su tangente en P es la derivada direccional.', o);
  };

  // S07 · Normalizar: v = ⟨3, 4⟩ mide 5; u = v/|v| = ⟨0.6, 0.8⟩ mide 1 y apunta igual.
  D['c2s07-unit'] = function () {
    var ox = 70, oy = 282, s = 50, o = '';
    var X = function (x) { return ox + s * x; }, Y = function (y) { return oy - s * y; };
    o += arrow('axis', X(0), Y(0), s * 4.5, 0, 1.6) + arrow('axis', X(0), Y(0), 0, -s * 4.9, 1.6);
    o += text(X(4.5) + 14, Y(0) + 6, 'x', ' font-size="17"') + text(X(0), Y(4.9) - 10, 'y', ' text-anchor="middle" font-size="17"');
    o += arc(X(0), Y(0), s, 0, 90, 'aux', 1.6);
    o += arrow('ref', X(0), Y(0), s * 3, -s * 4, 3.2);
    o += arrow('trace', X(0), Y(0), s * 0.6, -s * 0.8, 4);
    o += dot('dot-ref', X(0), Y(0), 4);
    o += text(X(3) + 12, Y(4) - 16, 'v', ' font-size="20"');
    o += text(X(1) + 6, Y(0) + 24, '1', ' text-anchor="middle" font-size="15"');
    var lx = 330;
    o += seg('ref', lx, 58, lx + 28, 58, 3.2) + text(lx + 38, 64, 'v = ⟨3, 4⟩, |v| = 5', ' font-size="17"');
    o += seg('trace', lx, 98, lx + 28, 98, 4) + text(lx + 38, 104, 'u = v / |v| = ⟨0.6, 0.8⟩', ' font-size="17"');
    o += seg('aux', lx, 138, lx + 28, 138, 1.6) + text(lx + 38, 144, 'círculo de radio 1', ' font-size="17"');
    o += text(lx, 196, 'Misma dirección, largo 1.', ' font-size="16"');
    o += text(lx, 222, 'Con v en lugar de u, el', ' font-size="16"');
    o += text(lx, 246, 'resultado sale 5 veces', ' font-size="16"');
    o += text(lx, 270, 'más grande.', ' font-size="16"');
    return svgBox('0 0 600 320', 'El vector v = ⟨3, 4⟩ mide 5. Dividido entre su largo da u = ⟨0.6, 0.8⟩, que apunta igual pero mide 1 y termina sobre el círculo unitario.', o);
  };

  // S07 · Varias direcciones en el mismo punto: a la izquierda, desde P, la dirección de máximo
  // crecimiento, la de máximo decrecimiento y las dos tangentes a la curva de nivel; a la derecha,
  // D_u f contra θ: la sinusoide |∇f| cos(θ − θ₀).
  D['c2s07-wave'] = function () {
    var o = '', used = [], g0 = 50, px = 130, py = 178, Lr = 70, R = 120;
    var gx = Math.cos(g0 * RAD), gy = -Math.sin(g0 * RAD), vbL = [8, 20, 280, 320];
    // Curva de nivel por P (convexa hacia la cima, que queda en la dirección de ∇f).
    var cx = px + R * gx, cy = py + R * gy, lv = [];
    for (var k = 0; k <= 40; k++) { var ph = (180 + g0 - 50 + 100 * k / 40) * RAD; lv.push([cx + R * Math.cos(ph), cy - R * Math.sin(ph)]); }
    o += poly('ref', lv, 2, false, '6 5');
    used = used.concat(polyPts(lv));
    var dirs = [[gx, gy, 'error', 'máx'], [-gx, -gy, 'aux', 'mín'], [-gy, gx, 'trace', '0'], [gy, -gx, 'trace', '0']];
    dirs.forEach(function (d) { o += arrow(d[2], px, py, Lr * d[0], Lr * d[1], 3); used = used.concat(arrowPts(px, py, Lr * d[0], Lr * d[1])); });
    dirs.forEach(function (d) {
      var c = spot(around(px + Lr * d[0], py + Lr * d[1], d[3]), used, 17, vbL);
      o += label(c, 17);
      var w = d[3].length * 17 * 0.6;
      used = used.concat(segPts(c[3] === 'end' ? c[0] - w : c[3] === 'middle' ? c[0] - w / 2 : c[0], c[1] - 8, c[3] === 'end' ? c[0] : c[3] === 'middle' ? c[0] + w / 2 : c[0] + w, c[1] - 8));
    });
    o += label(spot(around(px, py, 'P'), used, 18, vbL), 18);
    o += dot('dot-trace', px, py, 6);
    // Sinusoide.
    var X = function (t) { return 330 + 320 * t / 360; }, Y = function (v) { return 170 - 92 * v; }, cur = [];
    o += arrow('axis', 330, 170, 335, 0, 1.6) + arrow('axis', 330, 278, 0, -240, 1.6);
    o += text(674, 176, 'θ', ' text-anchor="middle" font-size="18"');
    o += text(342, 42, c2s07sub('D', 'u') + ' f', ' font-size="17"');
    [90, 180, 270, 360].forEach(function (t) { o += seg('axis', X(t), 165, X(t), 175, 1.4) + text(X(t), 306, t + '°', ' text-anchor="middle" font-size="15"'); });
    o += seg('axis', X(0), Y(1), X(360), Y(1), 1, '3 5') + seg('axis', X(0), Y(-1), X(360), Y(-1), 1, '3 5');
    for (var i = 0; i <= 120; i++) { var t = 360 * i / 120; cur.push([X(t), Y(Math.cos((t - g0) * RAD))]); }
    o += poly('ref', cur, 3);
    var pts2 = polyPts(cur).concat(segPts(330, 170, 665, 170), segPts(330, 38, 330, 278), segPts(X(0), Y(1), X(360), Y(1)), segPts(X(0), Y(-1), X(360), Y(-1)));
    o += dot('dot-error', X(g0), Y(1), 6) + dot('dot-aux', X(g0 + 180), Y(-1), 6) + dot('dot-trace', X(g0 + 90), Y(0), 5) + dot('dot-trace', X(g0 + 270), Y(0), 5);
    var vbR = [336, 20, 680, 290];
    o += label(spot([[X(g0) + 14, Y(1) - 12, 'máx = |∇f|', 'start'], [X(g0) + 14, Y(1) + 24, 'máx = |∇f|', 'start']], pts2, 16, vbR), 16);
    o += label(spot([[X(g0 + 180) + 14, Y(-1) + 24, 'mín = −|∇f|', 'start'], [X(g0 + 180) - 14, Y(-1) + 24, 'mín = −|∇f|', 'end'], [X(g0 + 180) + 14, Y(-1) - 10, 'mín = −|∇f|', 'start']], pts2, 16, vbR), 16);
    o += label(spot([[X(g0 + 90) + 10, Y(0) - 12, '0', 'start'], [X(g0 + 90) - 10, Y(0) + 24, '0', 'end'], [X(g0 + 90) + 10, Y(0) + 24, '0', 'start']], pts2, 16, vbR), 16);
    o += label(spot([[X(g0 + 270) - 10, Y(0) - 12, '0', 'end'], [X(g0 + 270) + 10, Y(0) + 24, '0', 'start'], [X(g0 + 270) - 10, Y(0) + 24, '0', 'end']], pts2, 16, vbR), 16);
    return svgBox('0 0 690 320', 'Izquierda: desde P, la dirección de máximo crecimiento, la de máximo decrecimiento y las dos tangentes a la curva de nivel, donde la derivada direccional es 0. Derecha: la derivada direccional contra el ángulo θ es una sinusoide con máximo |∇f| y mínimo −|∇f|.', o);
  };

  // S07 · Caminar de P a Q sobre una placa caliente T = 80 − x² − 3y² (°C, cm).
  D['c2s07-walk'] = function () {
    var X = function (x) { return 190 + 36 * x; }, Y = function (y) { return 172 - 36 * y; };
    var vb = [X(-4.4), Y(3.8), X(4.4), Y(-3.8)], o = '', used = [];
    o += fill('area-fill', [[vb[0], vb[1]], [vb[2], vb[1]], [vb[2], vb[3]], [vb[0], vb[3]]]);
    o += poly('axis', [[vb[0], vb[1]], [vb[2], vb[1]], [vb[2], vb[3]], [vb[0], vb[3]]], 1.4, true);
    [3, 8, 14, 19].forEach(function (c) {
      var pts = c2s07ell(X, Y, Math.sqrt(c), Math.sqrt(c / 3));
      o += poly('ref', pts, 1.5, true, '5 5');
      used = used.concat(polyPts(pts));
    });
    o += text(X(0), Y(0) + 6, '80 °C', ' text-anchor="middle" font-size="15"');
    used = used.concat(segPts(X(0) - 22, Y(0), X(0) + 22, Y(0)));
    var px = X(2), py = Y(1), qx = X(-1), qy = Y(-3);
    o += seg('aux', px, py, qx, qy, 2, '6 5');
    o += arrow('trace', px, py, -0.6 * 70, 0.8 * 70, 3.6);
    used = used.concat(segPts(px, py, qx, qy), arrowPts(px, py, -42, 56));
    o += dot('dot-trace', px, py, 6) + dot('dot-ref', qx, qy, 6);
    var cP = spot(around(px, py, 'P'), used, 18, vb); o += label(cP, 18);
    used = used.concat(segPts(cP[0] - 10, cP[1] - 6, cP[0] + 10, cP[1] - 6));
    o += label(spot(around(qx, qy, 'Q'), used, 18, vb), 18);
    o += label(spot(around(px - 21, py + 28, 'u'), used, 18, vb), 18);
    var lx = 392;
    o += text(lx, 40, 'T(x, y) = 80 − x² − 3y²', ' font-size="16"');
    o += text(lx, 72, 'De P(2, 1) hacia Q(−1, −3):', ' font-size="15"');
    o += text(lx, 100, 'PQ = ⟨−3, −4⟩, |PQ| = 5', ' font-size="15"');
    o += text(lx, 128, 'u = ⟨−0.6, −0.8⟩', ' font-size="15"');
    o += text(lx, 156, c2s07sub('T', 'x') + ' = −4, ' + c2s07sub('T', 'y') + ' = −6 (°C/cm)', ' font-size="15"');
    o += text(lx, 190, c2s07sub('D', 'u') + 'T = (−4)(−0.6) + (−6)(−0.8)', ' font-size="15"');
    o += text(lx, 216, '= 2.4 + 4.8 = 7.2 °C/cm', ' font-size="15"');
    o += text(lx, 256, 'Al arrancar hacia Q, la temperatura', ' font-size="14"');
    o += text(lx, 280, 'sube 7.2 °C por cm. Es la razón de', ' font-size="14"');
    o += text(lx, 304, 'cambio en P: más adelante baja.', ' font-size="14"');
    return svgBox('0 0 700 340', 'Placa con isotermas elípticas y centro a 80 °C. Desde P(2, 1) se camina hacia Q(−1, −3); el vector unitario u apunta de P a Q y la temperatura sube 7.2 °C por cada cm.', o);
  };

  /* ══════════════════════ fin S07 ══════════════════════ */

  /* ══════════════════════ S08 ══════════════════════ */
  function c2s08sub(s, t) { return s + '<tspan baseline-shift="sub" font-size="12">' + t + '</tspan>'; }
  // Renglón de leyenda: muestra del trazo y su texto (se desvanece con op).
  function c2s08Key(x, y, cls, s, op, dash) {
    return fade(seg(cls, x, y - 6, x + 26, y - 6, 3, dash) + text(x + 34, y, s, ' font-size="16"'), op == null ? 1 : op);
  }

  // S08 · El cerro f = 4 − x² − 2y² visto desde arriba: curvas de nivel (elipses x² + 2y² = 4 − c),
  // el punto P = (1, 1) sobre la curva f = 1, la recta tangente a esa curva, ∇f(P) = ⟨−2, −4⟩ ⟂ a
  // ella, el agua que sigue −∇f por y = x² y el campo de gradientes. state: { t, g, w, f } (0…1).
  D['c2s08-hill'] = function (st) {
    var oT = clamp01(num(st, 't', 1)), oG = clamp01(num(st, 'g', 1)), oW = clamp01(num(st, 'w', 1)), oF = clamp01(num(st, 'f', 1));
    var k = 56, X = function (x) { return 300 + k * x; }, Y = function (y) { return 182 - k * y; };
    var o = '', used = [], i;
    o += seg('axis', X(-3.3), Y(0), X(3.3), Y(0), 1.2) + seg('axis', X(0), Y(2.75), X(0), Y(-2.75), 1.2);
    used = used.concat(segPts(X(-3.3), Y(0), X(3.3), Y(0)), segPts(X(0), Y(2.75), X(0), Y(-2.75)));
    o += text(X(3.3) + 8, Y(0) + 6, 'x', ' font-size="17"') + text(X(0) + 9, Y(2.75) + 6, 'y', ' font-size="17"');
    // Curvas de nivel f = 3, 2, 1, 0, −2, −4; la de P (f = 1) más gruesa.
    [1, 2, 3, 4, 6, 8].forEach(function (r2) {
      var pts = [];
      for (i = 0; i <= 96; i++) { var t = 2 * Math.PI * i / 96; pts.push([X(Math.sqrt(r2) * Math.cos(t)), Y(Math.sqrt(r2 / 2) * Math.sin(t))]); }
      o += poly('ref', pts, r2 === 3 ? 3.2 : 1.5, true);
      used = used.concat(polyPts(pts));
    });
    // Campo de gradientes ∇f = ⟨−2x, −4y⟩ (flechas centradas en la malla, largo acotado).
    var fl = '';
    [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].forEach(function (x) {
      [-2.25, -0.75, 0.75, 2.25].forEach(function (y) {
        if (Math.hypot(x - 1, y - 1) < 0.7) return;
        var gx = -2 * x, gy = -4 * y, m = Math.hypot(gx, gy), L = Math.min(0.72, 0.12 * m), ux = gx / m, uy = gy / m;
        var x0 = X(x - ux * L / 2), y0 = Y(y - uy * L / 2), dx = k * ux * L, dy = -k * uy * L;
        fl += arrow('axis', x0, y0, dx, dy, 1.6);
        used = used.concat(arrowPts(x0, y0, dx, dy));
      });
    });
    o += fade(fl, oF);
    var P = [X(1), Y(1)];
    // Recta tangente a la curva f = 1 en P: dirección ⟨2, −1⟩.
    var tx = 2 / Math.sqrt(5), ty = -1 / Math.sqrt(5), hl = 1.15, T0 = [X(1 - tx * hl), Y(1 - ty * hl)], T1 = [X(1 + tx * hl), Y(1 + ty * hl)];
    o += fade(seg('aux', T0[0], T0[1], T1[0], T1[1], 3, '8 6'), oT);
    used = used.concat(segPts(T0[0], T0[1], T1[0], T1[1]));
    // El agua: −∇f y su recorrido y = x² (de x = 1 a 1.55).
    var wp = [];
    for (i = 0; i <= 30; i++) { var xw = 1 + 0.55 * i / 30; wp.push([X(xw), Y(xw * xw)]); }
    var Wv = [k * 0.56, -k * 1.12], Gv = [-k * 0.56, k * 1.12];
    o += fade(poly('trace', wp, 2.6, false, '2 7') + arrow('trace', P[0], P[1], Wv[0], Wv[1], 3.4), oW);
    used = used.concat(polyPts(wp), arrowPts(P[0], P[1], Wv[0], Wv[1]));
    o += fade(arrow('error', P[0], P[1], Gv[0], Gv[1], 3.8), oG);
    used = used.concat(arrowPts(P[0], P[1], Gv[0], Gv[1]));
    o += dot('dot-trace', P[0], P[1], 6);
    var vb = [0, 0, 600, 350];
    o += label(spot(around(P[0], P[1], 'P'), used, 18, vb), 18);
    var gt = [P[0] + Gv[0], P[1] + Gv[1]], wt = [P[0] + Wv[0], P[1] + Wv[1]];
    o += fade(label(spot(around(gt[0], gt[1], '∇f'), used, 18, vb), 18), oG);
    o += fade(label(spot(around(wt[0], wt[1], '−∇f'), used, 18, vb), 18), oW);
    // Leyenda abajo, en dos columnas.
    o += c2s08Key(20, 378, 'ref', 'curvas de nivel f = c');
    o += c2s08Key(20, 406, 'error', '∇f(P): cuesta arriba', oG);
    o += c2s08Key(20, 434, 'axis', 'campo de gradientes', oF);
    o += c2s08Key(320, 378, 'aux', 'tangente: f no cambia', oT, '8 6');
    o += c2s08Key(320, 406, 'trace', '−∇f: baja el agua', oW);
    return svgBox('0 0 600 450', 'Mapa de contorno del cerro f = 4 − x² − 2y²: elipses concéntricas con la cima al centro. En P = (1, 1), sobre la curva f = 1, la recta tangente a la curva va en la dirección (2, −1); el gradiente (−2, −4) es perpendicular a ella y apunta hacia la cima; −∇f apunta hacia afuera y el agua baja por la parábola y = x², cruzando cada curva en ángulo recto. El campo de gradientes es perpendicular a todas las curvas.', o);
  };

  // S08 · D_u f = |∇f| cos α: el vector u gira alrededor de P; la proyección de ∇f sobre u es la
  // razón de cambio. A la derecha, la gráfica de D_u f contra α. state: { a } (grados, 0…360).
  D['c2s08-rate'] = function (st) {
    var al = num(st, 'a', 0), a = al * RAD, g0 = 28 * RAD, cx = 150, cy = 180, G = 105, R = 72, o = '', used = [];
    o += text(20, 34, c2s08sub('D', 'u') + 'f = |∇f| cos α', ' font-size="19"');
    o += '<circle class="axis" fill="none" stroke-width="1.3" stroke-dasharray="4 5" cx="' + cx + '" cy="' + cy + '" r="' + R + '"/>';
    for (var i = 0; i < 48; i++) { var t = 2 * Math.PI * i / 48; used.push([cx + R * Math.cos(t), cy + R * Math.sin(t)]); }
    var gx = G * Math.cos(g0), gy = -G * Math.sin(g0), ua = g0 + a, ux = Math.cos(ua), uy = -Math.sin(ua), pr = G * Math.cos(a);
    var L = 1.35 * R;
    o += seg('axis', cx - ux * L, cy - uy * L, cx + ux * L, cy + uy * L, 1.2, '3 5');
    used = used.concat(segPts(cx - ux * L, cy - uy * L, cx + ux * L, cy + uy * L));
    var fx = cx + ux * pr, fy = cy + uy * pr;
    if (Math.abs(pr) > 1) o += seg('trace', cx, cy, fx, fy, 7);
    o += seg('axis', cx + gx, cy + gy, fx, fy, 1.4, '4 4');
    used = used.concat(segPts(cx + gx, cy + gy, fx, fy));
    o += arrow('aux', cx, cy, ux * R, uy * R, 3);
    o += arrow('error', cx, cy, gx, gy, 3.6);
    used = used.concat(arrowPts(cx, cy, ux * R, uy * R), arrowPts(cx, cy, gx, gy));
    var am = al % 360;
    if (am > 4 && am < 356) o += arc(cx, cy, 28, 28, 28 + am, 'axis', 1.6);
    o += dot('dot-trace', cx, cy, 5);
    var vb = [0, 50, 330, 300];
    o += label(spot(around(cx + gx, cy + gy, '∇f'), used, 18, vb), 18);
    o += label(spot(around(cx + ux * R, cy + uy * R, 'u'), used, 18, vb), 18);
    o += label(spot(around(cx, cy, 'P'), used, 18, vb), 18);
    // Gráfica de D_u f contra α.
    var x0 = 345, x1 = 580, y0 = 170, A = 82, pts = [];
    o += seg('axis', x0, y0, x1 + 6, y0, 1.4) + seg('axis', x0, y0 - A - 10, x0, y0 + A + 10, 1.4);
    for (i = 0; i <= 120; i++) { var q = 2 * Math.PI * i / 120; pts.push([x0 + (x1 - x0) * i / 120, y0 - A * Math.cos(q)]); }
    o += poly('ref', pts, 2.6);
    [0, 90, 180, 270, 360].forEach(function (d) { o += text(x0 + (x1 - x0) * d / 360, 66, d + '°', ' text-anchor="middle" font-size="14"'); });
    o += text(x0 - 8, y0 - A + 5, '|∇f|', ' text-anchor="end" font-size="15"');
    o += text(x0 - 8, y0 + 5, '0', ' text-anchor="end" font-size="15"');
    o += text(x0 - 8, y0 + A + 5, '−|∇f|', ' text-anchor="end" font-size="15"');
    o += text(x1 + 9, y0 + 6, 'α', ' font-size="17"');
    var am2 = ((al % 360) + 360) % 360, dx = x0 + (x1 - x0) * am2 / 360, dy = y0 - A * Math.cos(a);
    o += seg('axis', dx, y0, dx, dy, 1.3, '3 4') + dot('dot-trace', dx, dy, 6);
    var c = Math.cos(a), cs = (Math.abs(c) < 0.005 ? 0 : c).toFixed(2).replace('-', '−');
    o += text(20, 320, 'α = ' + Math.round(am2) + '°  →  ' + c2s08sub('D', 'u') + 'f = ' + cs + ' |∇f|', ' font-size="16"');
    return svgBox('0 0 600 335', 'A la izquierda, el gradiente desde P y un vector unitario u que forma un ángulo α con él; la sombra de ∇f sobre u mide la razón de cambio D_u f = |∇f| cos α. A la derecha, la gráfica de D_u f contra α: vale |∇f| en α = 0, cero en 90° y 270° y −|∇f| en 180°.', o);
  };

  // S08 · Superficie de nivel x² + y² + z² = 14 con P = (1, 2, 3), su normal ∇F(P) = ⟨2, 4, 6⟩ y
  // el plano tangente x + 2y + 3z = 14.
  D['c2s08-sphere'] = function () {
    var R = Math.sqrt(14), s = 36, ccx = 185, ccy = 196, az = -35, elv = 25;
    var P0 = view3({ cx: ccx, cy: ccy, s: s, az: az, el: elv }), o = '', used = [], i;
    var ca = Math.cos(az * RAD), sa = Math.sin(az * RAD), ce = Math.cos(elv * RAD), se = Math.sin(elv * RAD);
    function depth(p) { return (p[0] * ca - p[1] * sa) * ce + p[2] * se; }
    // Un círculo de la esfera: la parte de enfrente sólida, la de atrás punteada.
    function circ(f) {
      var front = '', back = '', run = [], side = null;
      function flush() { if (run.length > 1) { if (side) front += poly('ref', run, 1.6); else back += poly('ref', run, 1.1, false, '4 5'); } }
      for (var j = 0; j <= 120; j++) {
        var p = f(2 * Math.PI * j / 120), sd = depth(p) >= 0, q = P0(p);
        if (side !== null && sd !== side) { flush(); run = [run[run.length - 1]]; }
        side = sd; run.push(q);
        used.push(q);
      }
      flush();
      return { front: front, back: back };
    }
    var eq = circ(function (t) { return [R * Math.cos(t), R * Math.sin(t), 0]; });
    var lt = circ(function (t) { return [Math.sqrt(5) * Math.cos(t), Math.sqrt(5) * Math.sin(t), 3]; });
    o += eq.back + lt.back;
    o += '<circle class="ref" fill="none" stroke-width="2.6" cx="' + ccx + '" cy="' + ccy + '" r="' + r1(s * R) + '"/>';
    for (i = 0; i < 90; i++) { var t = 2 * Math.PI * i / 90; used.push([ccx + s * R * Math.cos(t), ccy + s * R * Math.sin(t)]); }
    o += eq.front + lt.front;
    // Plano tangente: un parche alrededor de P, con lados en e1 = ⟨2, −1, 0⟩/√5 y e2 = n × e1.
    var n = [1 / R, 2 / R, 3 / R], e1 = [2 / Math.sqrt(5), -1 / Math.sqrt(5), 0];
    var e2 = [n[1] * e1[2] - n[2] * e1[1], n[2] * e1[0] - n[0] * e1[2], n[0] * e1[1] - n[1] * e1[0]], hs = 1.5;
    var Pp = [1, 2, 3], corner = function (u, v) { return P0([Pp[0] + hs * (u * e1[0] + v * e2[0]), Pp[1] + hs * (u * e1[1] + v * e2[1]), Pp[2] + hs * (u * e1[2] + v * e2[2])]); };
    var patch = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
    o += fill('box-trace', patch) + poly('trace', patch, 1.6, true);
    used = used.concat(polyPts(patch.concat([patch[0]])));
    // Normal ∇F(P) (dibujada a escala 0.37).
    var B = P0(Pp), E = P0([Pp[0] + 0.74, Pp[1] + 1.48, Pp[2] + 2.22]);
    o += arrow('error', B[0], B[1], E[0] - B[0], E[1] - B[1], 3.6);
    used = used.concat(arrowPts(B[0], B[1], E[0] - B[0], E[1] - B[1]));
    o += dot('dot-trace', B[0], B[1], 6);
    o += label(spot(around(B[0], B[1], 'P'), used, 18, [0, 0, 360, 350]), 18);
    // Leyenda a la derecha.
    var lx = 372;
    o += seg('ref', lx, 74, lx + 26, 74, 3) + text(lx + 34, 80, 'x² + y² + z² = 14', ' font-size="16"');
    o += text(lx + 34, 104, '(superficie de nivel)', ' font-size="14"');
    o += seg('error', lx, 150, lx + 26, 150, 3) + text(lx + 34, 156, '∇F(P) = ⟨2, 4, 6⟩', ' font-size="16"');
    o += '<rect class="box-trace" x="' + lx + '" y="194" width="26" height="16" rx="2"/>' + text(lx + 34, 208, 'plano tangente:', ' font-size="16"');
    o += text(lx + 34, 234, 'x + 2y + 3z = 14', ' font-size="16"');
    o += text(lx, 290, 'P = (1, 2, 3)', ' font-size="16"');
    return svgBox('0 0 600 350', 'Esfera x² + y² + z² = 14 vista en perspectiva, con el punto P = (1, 2, 3). El gradiente ∇F(P) = (2, 4, 6) sale de P perpendicular a la esfera, y el plano tangente en P, x + 2y + 3z = 14, toca la esfera solo en P.', o);
  };

  /* ══════════════════════ fin S08 ══════════════════════ */

  /* ══════════════════════ S09 ══════════════════════ */
  function c2s09sub(s, t) { return s + '<tspan baseline-shift="sub" font-size="12">' + t + '</tspan>'; }
  // Renglón de leyenda: muestra del trazo (o flecha) y su texto.
  function c2s09Key(x, y, cls, s, op, kind) {
    var sw = kind === 'arrow' ? arrow(cls, x, y - 6, 26, 0, 2.6) : seg(cls, x, y - 6, x + 26, y - 6, kind === 'thin' ? 1.6 : 3, kind === 'dash' ? '6 5' : null);
    return fade(sw + text(x + 34, y, s, ' font-size="16"'), op == null ? 1 : op);
  }

  // S09 · Tres tipos de punto crítico: tazón (mínimo), domo (máximo) y silla, con su criterio D.
  D['c2s09-critical'] = function () {
    var o = '', L = 1.5, n = 8, N = 24;
    var kinds = [
      [110, function (x, y) { return 0.45 * (x * x + y * y); }, 'mínimo local', 'D > 0, ' + c2s09sub('f', 'xx') + ' > 0'],
      [320, function (x, y) { return 2 - 0.45 * (x * x + y * y); }, 'máximo local', 'D > 0, ' + c2s09sub('f', 'xx') + ' < 0'],
      [530, function (x, y) { return 1 + 0.45 * (x * x - y * y); }, 'punto silla', 'D < 0']
    ];
    kinds.forEach(function (k) {
      var P0 = view3({ cx: k[0], cy: 150, s: 30, az: -35, el: 25 }), f = k[1], P = function (x, y) { return P0([x, y, f(x, y)]); }, m = '', i, j;
      for (i = 0; i <= n; i++) {
        var u = -L + 2 * L * i / n, l1 = [], l2 = [];
        for (j = 0; j <= N; j++) { var t = -L + 2 * L * j / N; l1.push(P(u, t)); l2.push(P(t, u)); }
        m += poly('ref', l1, 1.2) + poly('ref', l2, 1.2);
      }
      o += '<g opacity="0.6">' + m + '</g>';
      var c = P(0, 0);
      o += dot('dot-trace', c[0], c[1], 6);
      o += text(k[0], 250, k[2], ' text-anchor="middle" font-size="17"');
      o += text(k[0], 278, k[3], ' text-anchor="middle" font-size="16"');
    });
    return svgBox('0 0 640 300', 'Tres superficies con un punto crítico marcado: un tazón (mínimo local, D > 0 y fxx > 0), un domo (máximo local, D > 0 y fxx < 0) y una silla (D < 0).', o);
  };

  // S09 · La recta x + 2y = 8 y las curvas de nivel xy = k. El punto P = (t, (8 − t)/2) se mueve
  // por la recta; en t = 4 la curva xy = 8 es tangente y ∇f ∥ ∇g.
  // state: { t: x de P, lv: curvas (0…1), gr: gradientes (0…1) }.
  D['c2s09-tangent'] = function (st) {
    var t = Math.max(0.4, Math.min(7.6, num(st, 't', 4))), oL = clamp01(num(st, 'lv', 1)), oG = clamp01(num(st, 'gr', 1));
    var X = function (x) { return 46 + 58 * x; }, Y = function (y) { return 318 - 58 * y; };
    var o = '', pts = [], used = [];
    // Ejes.
    o += arrow('axis', X(0), Y(0), X(9.1) - X(0), 0, 1.6) + arrow('axis', X(0), Y(0), 0, Y(4.75) - Y(0), 1.6);
    o += text(X(9.1) + 12, Y(0) + 6, 'x', ' text-anchor="middle" font-size="18"') + text(X(0), Y(4.75) - 10, 'y', ' text-anchor="middle" font-size="18"');
    used = used.concat(segPts(X(0), Y(0), X(9.1), Y(0)), segPts(X(0), Y(0), X(0), Y(4.75)));
    // Curvas de nivel xy = k.
    var y0 = t > 0 ? (8 - t) / 2 : 0, fP = t * y0, lv = '';
    [2, 4, 6, 8, 10, 12].forEach(function (k) {
      var c = [];
      for (var i = 0; i <= 80; i++) { var x = k / 4.6 + (9 - k / 4.6) * i / 80; c.push([X(x), Y(k / x)]); }
      lv += poly('aux', c, 1.5);
      used = used.concat(polyPts(c));
    });
    o += fade(lv, oL);
    // El nivel que pasa por P.
    var hc = [];
    for (var i2 = 0; i2 <= 90; i2++) { var xx = fP / 4.6 + (9 - fP / 4.6) * i2 / 90; hc.push([X(xx), Y(fP / xx)]); }
    o += fade(poly('trace', hc, 3), oL);
    used = used.concat(polyPts(hc));
    // La restricción.
    o += seg('ref', X(0), Y(4), X(8), Y(0), 3.4);
    used = used.concat(segPts(X(0), Y(4), X(8), Y(0)));
    // Gradientes en P: ∇f = ⟨y, x⟩ (largo 1.6) y ∇g = ⟨1, 2⟩ (largo 1).
    var px = X(t), py = Y(y0), nf = Math.hypot(y0, t), ng = Math.sqrt(5);
    var fdx = 1.6 * 58 * y0 / nf, fdy = -1.6 * 58 * t / nf, gdx = 58 / ng, gdy = -2 * 58 / ng;
    o += fade(arrow('error', px, py, fdx, fdy, 3) + arrow('ref', px, py, gdx, gdy, 3), oG);
    if (oG > 0.01) used = used.concat(arrowPts(px, py, fdx, fdy), arrowPts(px, py, gdx, gdy));
    o += dot('dot-trace', px, py, 6);
    // Leyenda y números de P.
    var ang = Math.acos(Math.max(-1, Math.min(1, (y0 + 2 * t) / (nf * ng)))) * 180 / Math.PI;
    var lx = 372;
    o += c2s09Key(lx, 24, 'ref', 'x + 2y = 8');
    o += c2s09Key(lx, 48, 'aux', 'nivel xy = k', oL, 'thin');
    o += c2s09Key(lx, 72, 'trace', 'nivel que pasa por P', oL);
    o += c2s09Key(lx, 96, 'error', '∇f = ⟨y, x⟩', oG, 'arrow');
    o += c2s09Key(lx, 120, 'ref', '∇g = ⟨1, 2⟩', oG, 'arrow');
    o += dot('dot-trace', lx + 13, 140, 6) + text(lx + 34, 146, 'P: f = ' + fP.toFixed(2), ' font-size="16"');
    o += fade(text(lx + 34, 170, 'ángulo: ' + Math.round(ang) + '°', ' font-size="16"'), oG);
    return svgBox('0 0 600 350', 'Recta x + 2y = 8 sobre las curvas de nivel xy = k. El punto P se mueve por la recta; donde la recta toca la curva xy = 8, en (4, 2), los gradientes de f y de g son paralelos.', o);
  };

  // S09 · Significado de λ: si la restricción pasa de c a c + Δc, el máximo de f = 3x + 4y
  // sobre el círculo x² + y² = c sube Δmáx ≈ λ·Δc.
  D['c2s09-lambda'] = function () {
    var cx = 190, cy = 185, R1 = 100, R2 = 125, ux = 0.6, uy = -0.8, o = '';
    o += '<circle class="ref" fill="none" stroke-width="3" cx="' + cx + '" cy="' + cy + '" r="' + R1 + '"/>';
    o += '<circle class="ref" fill="none" stroke-width="2" stroke-dasharray="7 6" cx="' + cx + '" cy="' + cy + '" r="' + R2 + '"/>';
    var M1 = [cx + R1 * ux, cy + R1 * uy], M2 = [cx + R2 * ux, cy + R2 * uy], d = 95;
    o += seg('trace', M1[0] - d * 0.8, M1[1] - d * 0.6, M1[0] + d * 0.8, M1[1] + d * 0.6, 3);
    o += seg('aux', M2[0] - d * 0.8, M2[1] - d * 0.6, M2[0] + d * 0.8, M2[1] + d * 0.6, 2.4, '8 6');
    o += dot('dot-trace', M1[0], M1[1], 6) + dot('dot-aux', M2[0], M2[1], 6) + dot('dot-ref', cx, cy, 4);
    var lx = 352;
    o += c2s09Key(lx, 40, 'ref', 'g = c');
    o += c2s09Key(lx, 68, 'ref', 'g = c + Δc', 1, 'dash');
    o += c2s09Key(lx, 96, 'trace', 'nivel f = máx(c)');
    o += c2s09Key(lx, 124, 'aux', 'nivel f = máx(c + Δc)', 1, 'dash');
    o += text(lx, 172, 'Al aflojar la restricción,', ' font-size="16"');
    o += text(lx, 196, 'el máximo sube:', ' font-size="16"');
    o += text(lx, 232, 'Δmáx ≈ λ · Δc', ' font-size="19"');
    return svgBox('0 0 600 330', 'Dos circunferencias, g = c y g = c + Δc, con las rectas de nivel de f tangentes en sus puntos de máximo. Al pasar de c a c + Δc el máximo sube aproximadamente λ por Δc.', o);
  };

  /* ══════════════════════ fin S09 ══════════════════════ */

  /* ══════════════════════ S10 ══════════════════════ */
  // Elipse común de S10: cilindro x² + y² = 2 cortado por el plano x + y + z = 4.
  var C2S10R = Math.SQRT2;
  function c2s10Pt(t) { var x = C2S10R * Math.cos(t), y = C2S10R * Math.sin(t); return [x, y, 4 - x - y]; }
  function c2s10Unit(v) { var L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; }
  // Flecha 3D proyectada: desde p, en la dirección v, con largo L (unidades del mundo).
  function c2s10Arrow(P, p, v, L, cls, w) {
    var u = c2s10Unit(v), a = P(p), b = P([p[0] + L * u[0], p[1] + L * u[1], p[2] + L * u[2]]);
    return arrow(cls, a[0], a[1], b[0] - a[0], b[1] - a[1], w);
  }
  // Renglón de la leyenda: muestra del trazo y su texto (se desvanece con op).
  function c2s10Key(y, cls, s, op, dash) {
    return fade(seg(cls, 16, y - 6, 40, y - 6, 3, dash) + text(48, y, s, ' font-size="16"'), op == null ? 1 : op);
  }

  // S10 · El plano x + y + z = 4 y el cilindro x² + y² = 2 se cortan en una elipse; en P se ven
  // ∇g, ∇h, T = ∇g × ∇h y ∇f = ⟨0, 0, 1⟩. state: { k: 0…4 (etapa), t: parámetro de P }.
  D['c2s10-curve'] = function (st) {
    var k = num(st, 'k', 4), t = num(st, 't', 3.927);
    var o1 = clamp01(k), o2 = clamp01(k - 1), o3 = clamp01(k - 2), o4 = clamp01(k - 3);
    var P = view3({ cx: 430, cy: 330, s: 36, az: 40, el: 22 }), o = '', i, j;
    // Cilindro: generatrices y dos anillos.
    var cy = '';
    for (i = 0; i < 12; i++) { var a = 2 * Math.PI * i / 12, p0 = P([C2S10R * Math.cos(a), C2S10R * Math.sin(a), 0]), p1 = P([C2S10R * Math.cos(a), C2S10R * Math.sin(a), 7.6]); cy += seg('aux', p0[0], p0[1], p1[0], p1[1], 1.1); }
    [0, 7.6].forEach(function (z) { var ring = []; for (j = 0; j <= 48; j++) { var b = 2 * Math.PI * j / 48; ring.push(P([C2S10R * Math.cos(b), C2S10R * Math.sin(b), z])); } cy += poly('aux', ring, 1.3); });
    o += '<g opacity="0.55">' + cy + '</g>';
    // Plano: parche sobre el cuadrado |x|, |y| ≤ 1.8.
    var L = 1.8, patch = [[-L, -L], [L, -L], [L, L], [-L, L]].map(function (q) { return P([q[0], q[1], 4 - q[0] - q[1]]); });
    o += fill('box-ref', patch) + poly('ref', patch, 1.4, true);
    // La elipse.
    var el = [];
    for (j = 0; j <= 96; j++) el.push(P(c2s10Pt(2 * Math.PI * j / 96)));
    o += fade(poly('trace', el, 3.6), 0.35 + 0.65 * o1);
    // El punto P y sus vectores.
    var p = c2s10Pt(t), gg = [1, 1, 1], gh = [2 * p[0], 2 * p[1], 0];
    var T = [gg[1] * gh[2] - gg[2] * gh[1], gg[2] * gh[0] - gg[0] * gh[2], gg[0] * gh[1] - gg[1] * gh[0]];
    var Tu = c2s10Unit(T), A = P(p), Tb = P([p[0] - 1.5 * Tu[0], p[1] - 1.5 * Tu[1], p[2] - 1.5 * Tu[2]]);
    var Ta = P([p[0] + 1.5 * Tu[0], p[1] + 1.5 * Tu[1], p[2] + 1.5 * Tu[2]]);
    // Plano de ∇g y ∇h en P (al final).
    var ug = c2s10Unit(gg), uh = c2s10Unit(gh), s = 1.05;
    var par = [p, [p[0] + s * ug[0], p[1] + s * ug[1], p[2] + s * ug[2]], [p[0] + s * (ug[0] + uh[0]), p[1] + s * (ug[1] + uh[1]), p[2] + s * (ug[2] + uh[2])], [p[0] + s * uh[0], p[1] + s * uh[1], p[2] + s * uh[2]]].map(P);
    o += fade(fill('area-fill area-fill--aux', par), o4);
    o += fade(seg('axis', Tb[0], Tb[1], Ta[0], Ta[1], 2.6, '6 5'), o3);
    o += fade(c2s10Arrow(P, p, gg, 1.3, 'ref', 3) + c2s10Arrow(P, p, gh, 1.3, 'aux', 3), o3);
    var oF = clamp01((k - 2.5) * 2);
    o += fade(c2s10Arrow(P, p, [0, 0, 1], 1.3, 'error', 3.4), oF);
    o += fade(dot('dot-trace', A[0], A[1], 6), o2);
    // Leyenda con la componente de ∇f a lo largo de la curva.
    var tc = T[2] / (Math.hypot(T[0], T[1], T[2]) || 1);
    if (Math.abs(tc) < 0.005) tc = 0;
    o += '<rect class="box-ref" x="16" y="16" width="24" height="14" rx="2"/>' + text(48, 29, 'plano g: x + y + z = 4', ' font-size="16"');
    o += c2s10Key(56, 'aux', 'cilindro h: x² + y² = 2');
    o += c2s10Key(82, 'trace', 'curva: la elipse', o1);
    o += c2s10Key(108, 'ref', '∇g (normal al plano)', o3);
    o += c2s10Key(134, 'aux', '∇h (normal al cilindro)', o3);
    o += c2s10Key(160, 'axis', 'tangente T = ∇g × ∇h', o3, '6 5');
    o += c2s10Key(186, 'error', '∇f = ⟨0, 0, 1⟩', oF);
    o += fade(text(16, 216, '∇f · T̂ = ' + tc.toFixed(2).replace('-', '−'), ' font-size="17"'), oF);
    o += fade('<rect class="area-fill area-fill--aux" x="16" y="232" width="24" height="14" rx="2"/>' + text(48, 245, 'plano de ∇g y ∇h', ' font-size="16"'), o4);
    return svgBox('0 0 600 380', 'El plano x + y + z = 4 corta al cilindro x² + y² = 2 en una elipse. En un punto P de la elipse se dibujan los gradientes de g y h, la tangente T = ∇g × ∇h y el gradiente de f = z. En el punto más alto, ∇f no tiene componente a lo largo de T y queda en el plano de ∇g y ∇h.', o);
  };

  // S10 · z(t) = 4 − √2 (cos t + sin t) a lo largo de la elipse, con su máximo y su mínimo.
  D['c2s10-param'] = function () {
    var X = function (t) { return 70 + t / (2 * Math.PI) * 480; }, Y = function (z) { return 250 - z * 30; }, o = '', pts = [], i;
    o += arrow('axis', 70, Y(0), 510, 0, 1.6) + arrow('axis', 70, 262, 0, -240, 1.6);
    o += text(592, Y(0) + 26, 't', ' font-size="18" text-anchor="end"') + text(80, 30, 'z', ' font-size="18"');
    [[Math.PI / 2, 'π/2'], [Math.PI, 'π'], [1.5 * Math.PI, '3π/2'], [2 * Math.PI, '2π']].forEach(function (q) {
      o += seg('axis', X(q[0]), Y(0) - 5, X(q[0]), Y(0) + 5, 1.4) + text(X(q[0]), Y(0) + 24, q[1], ' font-size="16" text-anchor="middle"');
    });
    [2, 4, 6].forEach(function (z) { o += seg('axis', 65, Y(z), 75, Y(z), 1.4) + text(58, Y(z) + 5, String(z), ' font-size="16" text-anchor="end"'); });
    for (i = 0; i <= 120; i++) { var t = 2 * Math.PI * i / 120; pts.push([X(t), Y(4 - Math.SQRT2 * (Math.cos(t) + Math.sin(t)))]); }
    o += poly('ref', pts, 3.2);
    var tM = 1.25 * Math.PI, tm = 0.25 * Math.PI;
    o += dot('dot-error', X(tM), Y(6), 6) + dot('dot-aux', X(tm), Y(2), 6);
    o += text(X(tM), Y(6) - 16, 'máximo: z = 6 en t = 5π/4', ' font-size="16" text-anchor="middle"');
    o += text(150, Y(2) + 28, 'mínimo: z = 2 en t = π/4', ' font-size="16"');
    return svgBox('0 0 600 290', 'Gráfica de z(t) = 4 − √2 (cos t + sin t) para t entre 0 y 2π: máximo 6 en t = 5π/4 y mínimo 2 en t = π/4.', o);
  };

  /* ══════════════════════ fin S10 ══════════════════════ */

  /* ══════════════════════ S11 ══════════════════════ */
  // Domo común de S11: z = 16 − x² − 2y² sobre R = [0, 2] × [0, 2] (∬ = 48, promedio 12).
  function c2s11f(x, y) { return 16 - x * x - 2 * y * y; }
  var C2S11_KZ = 0.11, C2S11_AZ = -35;
  // Proyección con la caja R × [0, 16] centrada en (cx, cy); z se escala por KZ.
  function c2s11View(cx, cy, s) {
    var P0 = view3({ cx: 0, cy: 0, s: s, az: C2S11_AZ, el: 25 }), xs = [], ys = [];
    [0, 2].forEach(function (x) { [0, 2].forEach(function (y) { [0, 16 * C2S11_KZ].forEach(function (z) { var p = P0([x, y, z]); xs.push(p[0]); ys.push(p[1]); }); }); });
    var dx = cx - (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, dy = cy - (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
    return function (x, y, z) { var p = P0([x, y, z * C2S11_KZ]); return [p[0] + dx, p[1] + dy]; };
  }
  // Profundidad (mayor = más cerca de la cámara: se ve más abajo); se pinta de menor a mayor.
  function c2s11Depth(x, y) { var a = C2S11_AZ * RAD; return x * Math.cos(a) - y * Math.sin(a); }
  function c2s11Mesh(P, op) {
    var o = '', i, j, n = 8, N = 24;
    for (i = 0; i <= n; i++) {
      var u = 2 * i / n, l1 = [], l2 = [];
      for (j = 0; j <= N; j++) { var t = 2 * j / N; l1.push(P(u, t, c2s11f(u, t))); l2.push(P(t, u, c2s11f(t, u))); }
      o += poly('ref', l1, 1.2) + poly('ref', l2, 1.2);
    }
    return '<g opacity="' + op + '">' + o + '</g>';
  }
  // Piso R punteado y la dirección de los ejes x, y (flechas cortas que salen del rectángulo).
  function c2s11Floor(P) {
    var o = poly('axis', [P(0, 0, 0), P(2, 0, 0), P(2, 2, 0), P(0, 2, 0)], 1.2, true, '4 5');
    [[P(2, 0, 0), P(2.75, 0, 0), 'x'], [P(0, 2, 0), P(0, 2.75, 0), 'y']].forEach(function (e) {
      var dx = e[1][0] - e[0][0], dy = e[1][1] - e[0][1], m = Math.hypot(dx, dy) || 1;
      o += arrow('axis', e[0][0], e[0][1], dx, dy, 1.6) + text(e[1][0] + dx / m * 14, e[1][1] + dy / m * 14 + 6, e[2], ' text-anchor="middle" font-size="18"');
    });
    return o;
  }
  // Prisma sobre [x0, x1] × [y0, y1] con altura z: caras y = y1, x = x1 (las que miran a la cámara) y techo.
  function c2s11Prism(P, x0, x1, y0, y1, z, cls) {
    return fill(cls, [P(x0, y1, 0), P(x1, y1, 0), P(x1, y1, z), P(x0, y1, z)]) +
      fill(cls, [P(x1, y0, 0), P(x1, y1, 0), P(x1, y1, z), P(x1, y0, z)]) +
      fill(cls, [P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)]);
  }
  function c2s11Key(y, cls, s, op) {
    return fade('<rect class="' + cls + '" x="16" y="' + (y - 14) + '" width="24" height="16" rx="2"/>' + text(48, y, s, ' font-size="17"'), op == null ? 1 : op);
  }

  // S11 · La partición de R vista desde arriba: m × n celdas, Δx, Δy, ΔA y un punto de muestra.
  D['c2s11-grid'] = function () {
    var X0 = 50, Y0 = 50, cw = 90, ch = 70, m = 4, n = 3, o = '', i;
    var X1 = X0 + m * cw, Y1 = Y0 + n * ch;
    // Celda resaltada (i = 2, j = 1, contando desde abajo) y su punto medio.
    var hi = 2, hj = 1, cx0 = X0 + hi * cw, cy0 = Y1 - (hj + 1) * ch;
    o += '<rect class="box-aux" x="' + cx0 + '" y="' + cy0 + '" width="' + cw + '" height="' + ch + '"/>';
    for (i = 0; i <= m; i++) o += seg('ref', X0 + i * cw, Y0, X0 + i * cw, Y1, i === 0 || i === m ? 2.4 : 1.4);
    for (i = 0; i <= n; i++) o += seg('ref', X0, Y0 + i * ch, X1, Y0 + i * ch, i === 0 || i === n ? 2.4 : 1.4);
    o += dot('dot-trace', cx0 + cw / 2, cy0 + ch / 2, 5);
    // Cotas Δx (arriba) y Δy (a la derecha) de la celda resaltada.
    o += seg('axis', cx0, 34, cx0 + cw, 34, 1.4) + seg('axis', cx0, 28, cx0, 40, 1.4) + seg('axis', cx0 + cw, 28, cx0 + cw, 40, 1.4);
    o += text(cx0 + cw / 2, 24, 'Δx', ' text-anchor="middle" font-size="17"');
    o += seg('axis', X1 + 16, cy0, X1 + 16, cy0 + ch, 1.4) + seg('axis', X1 + 10, cy0, X1 + 22, cy0, 1.4) + seg('axis', X1 + 10, cy0 + ch, X1 + 22, cy0 + ch, 1.4);
    o += text(X1 + 28, cy0 + ch / 2 + 6, 'Δy', ' font-size="17"');
    // Extremos del rectángulo.
    o += text(X0, Y1 + 24, 'a', ' text-anchor="middle" font-size="18"') + text(X1, Y1 + 24, 'b', ' text-anchor="middle" font-size="18"');
    o += text((X0 + X1) / 2, Y1 + 26, 'x', ' text-anchor="middle" font-size="18"');
    o += text(X0 - 12, Y1 + 6, 'c', ' text-anchor="end" font-size="18"') + text(X0 - 12, Y0 + 6, 'd', ' text-anchor="end" font-size="18"');
    o += text(X0 - 12, (Y0 + Y1) / 2 + 6, 'y', ' text-anchor="end" font-size="18"');
    // Leyenda debajo (así se lee bien también en celular).
    var lx = 24, ly = 312;
    o += '<rect class="box-aux" x="' + lx + '" y="' + (ly - 14) + '" width="24" height="16" rx="2"/>' + text(lx + 34, ly, 'celda: ΔA = Δx · Δy', ' font-size="17"');
    o += dot('dot-trace', lx + 12, ly + 26, 5) + text(lx + 34, ly + 32, 'punto de muestra (xᵢ*, yⱼ*)', ' font-size="17"');
    o += text(lx, ly + 66, 'Δx = (b − a)/m,  Δy = (d − c)/n', ' font-size="17"');
    o += text(lx, ly + 96, 'suma: Σ Σ f(xᵢ*, yⱼ*) ΔA', ' font-size="17"');
    return svgBox('0 0 480 430','Rectángulo R de a a b en x y de c a d en y, partido en 4 columnas y 3 filas. Una celda resaltada mide Δx por Δy, su área es ΔA, y en su centro está el punto de muestra.', o);
  };

  // S11 · Prismas → volumen. state: { k: etapa 0…3, m: divisiones por lado (2, 4, 8) }.
  D['c2s11-prisms'] = function (st) {
    var k = num(st, 'k', 3), m = Math.max(1, Math.round(num(st, 'm', 2)));
    var P = c2s11View(445, 205, 80), o = '';
    var oG = clamp01(k), oOne = clamp01(k - 1) * (1 - clamp01(k - 2)), oAll = clamp01(k - 2);
    o += c2s11Floor(P);
    // Cuadrícula del piso.
    var g = '', i, j, d = 2 / m;
    for (i = 1; i < m; i++) { var a = P(i * d, 0, 0), b = P(i * d, 2, 0), c = P(0, i * d, 0), e = P(2, i * d, 0); g += seg('aux', a[0], a[1], b[0], b[1], 1.4) + seg('aux', c[0], c[1], e[0], e[1], 1.4); }
    o += fade(g, oG);
    // Un prisma (la celda del frente a la derecha) o todos, de atrás hacia adelante.
    var cells = [];
    for (i = 0; i < m; i++) for (j = 0; j < m; j++) cells.push([i, j]);
    cells.sort(function (p, q) { return c2s11Depth(p[0] + 0.5, p[1] + 0.5) - c2s11Depth(q[0] + 0.5, q[1] + 0.5); });
    var all = '', dots = '';
    cells.forEach(function (q) {
      var x0 = q[0] * d, y0 = q[1] * d, z = c2s11f(x0 + d / 2, y0 + d / 2);
      all += c2s11Prism(P, x0, x0 + d, y0, y0 + d, z, 'box-aux');
      if (m <= 4) { var t = P(x0 + d / 2, y0 + d / 2, z); dots += dot('dot-trace', t[0], t[1], 3.5); }
    });
    o += fade(all + dots, oAll);
    var x1 = 2 - 2 / m, zz = c2s11f(x1 + 1 / m, 1 / m), top = P(x1 + 1 / m, 1 / m, zz);
    o += fade(c2s11Prism(P, x1, 2, 0, 2 / m, zz, 'box-trace') + dot('dot-trace', top[0], top[1], 4.5), oOne);
    o += c2s11Mesh(P, 0.5);
    // Suma de punto medio con m × m celdas (ΔA = (2/m)²).
    var S = 0;
    for (i = 0; i < m; i++) for (j = 0; j < m; j++) S += c2s11f((i + 0.5) * d, (j + 0.5) * d);
    S *= d * d;
    o += text(16, 30, 'z = 16 − x² − 2y²', ' font-size="17"');
    o += c2s11Key(62, 'box-aux', 'R partido en ' + m + ' × ' + m + ' celdas', oG);
    o += c2s11Key(92, 'box-trace', 'prisma: base ΔA', oOne);
    o += fade(text(48, 116, 'altura f(x*, y*)', ' font-size="17"'), oOne);
    o += fade(text(16, 150, 'Σ f(x*, y*) ΔA = ' + (+S.toFixed(4)), ' font-size="17"'), oAll);
    o += fade(text(16, 178, 'valor exacto: 48', ' font-size="17"'), oAll);
    return svgBox('0 0 640 380', 'Superficie z = 16 − x² − 2y² sobre el cuadrado R de lado 2. Se parte R en celdas y sobre cada una se levanta un prisma cuya altura es f en el punto medio; la suma de sus volúmenes se acerca a 48 al refinar la cuadrícula.', o);
  };

  // S11 · Fubini con rebanadas. state: { s1: una rebanada, s2: su grosor, s3: rebanadas en y, s4: en x } (0…1).
  D['c2s11-slices'] = function (st) {
    var s1 = clamp01(num(st, 's1', 1)), s2 = clamp01(num(st, 's2', 0)), s3 = clamp01(num(st, 's3', 0)), s4 = clamp01(num(st, 's4', 0));
    var P = c2s11View(445, 205, 80), o = c2s11Floor(P) + c2s11Mesh(P, 0.45);
    function sliceY(y, cls) {
      var pts = [P(0, y, 0)], k;
      for (k = 0; k <= 30; k++) pts.push(P(2 * k / 30, y, c2s11f(2 * k / 30, y)));
      pts.push(P(2, y, 0));
      return fill(cls, pts) + poly(cls === 'box-trace' ? 'trace' : 'aux', pts.slice(1, -1), 2.6);
    }
    function sliceX(x, cls) {
      var pts = [P(x, 0, 0)], k;
      for (k = 0; k <= 30; k++) pts.push(P(x, 2 * k / 30, c2s11f(x, 2 * k / 30)));
      pts.push(P(x, 2, 0));
      return fill(cls, pts) + poly(cls === 'box-trace' ? 'trace' : 'aux', pts.slice(1, -1), 2.6);
    }
    // Varias rebanadas en y (de atrás hacia adelante: y grande está más lejos).
    var many = '';
    [0.1, 0.5, 0.9, 1.3, 1.7].forEach(function (y) { many += sliceY(y, 'box-aux'); });
    o += fade(many, s3);
    var mx = '';
    [0.1, 0.5, 0.9, 1.3, 1.7].forEach(function (x) { mx += sliceX(x, 'box-trace'); });
    o += fade(mx, s4);
    // Una rebanada en y = 0.8 y su gemela en y = 0.8 + dy (más cerca de la cámara, va después).
    var one = 1 - Math.max(s3, s4);
    o += fade(sliceY(0.8, 'box-aux'), s1 * one) + fade(sliceY(1.05, 'box-trace'), s2 * one);
    o += text(16, 30, 'z = 16 − x² − 2y²', ' font-size="17"');
    o += c2s11Key(62, 'box-aux', 'y fija: A(y) = ∫ f(x, y) dx', Math.max(s1 * one, s3));
    o += c2s11Key(92, 'box-trace', 'grosor dy: A(y) dy', s2 * one);
    o += fade(text(16, 126, 'sumar rebanadas:', ' font-size="17"') + text(16, 152, '∫ A(y) dy = 48', ' font-size="17"'), s3);
    o += c2s11Key(186, 'box-trace', 'x fija: B(x) = ∫ f dy', s4);
    o += fade(text(16, 216, '∫ B(x) dx = 48 también', ' font-size="17"'), s4);
    return svgBox('0 0 640 380', 'El sólido bajo z = 16 − x² − 2y² se corta en rebanadas. Con y fija, la rebanada tiene área A(y), la integral de adentro; con grosor dy aporta A(y) dy, y al sumar las rebanadas sale 48. Rebanando en x sale lo mismo.', o);
  };

  // S11 · Valor promedio: el bloque de altura f̄ = 12 sobre R tiene el mismo volumen que el domo.
  D['c2s11-average'] = function () {
    var P = c2s11View(445, 195, 80), o = c2s11Floor(P), avg = 12;
    o += c2s11Mesh(P, 0.55);
    o += c2s11Prism(P, 0, 2, 0, 2, avg, 'box-trace');
    o += text(16, 34, 'domo: z = 16 − x² − 2y²', ' font-size="17"');
    o += c2s11Key(70, 'box-trace', 'bloque de altura f̄', 1);
    o += text(16, 112, 'f̄ = (1/área) ∬ f dA', ' font-size="17"');
    o += text(16, 140, '   = 48 / 4 = 12', ' font-size="17"');
    o += text(16, 182, 'Mismo volumen:', ' font-size="16"');
    o += text(16, 206, 'lo que sobresale del domo', ' font-size="16"');
    o += text(16, 230, 'llena lo que le falta al bloque.', ' font-size="16"');
    return svgBox('0 0 640 360', 'El domo z = 16 − x² − 2y² sobre el cuadrado de lado 2 tiene volumen 48. Un bloque plano de altura 12, el valor promedio, sobre el mismo cuadrado tiene el mismo volumen.', o);
  };


  /* ══════════════════════ fin S11 ══════════════════════ */

  /* ══════════════════════ S12 ══════════════════════ */
  // Ejes de un panel: X, Y convierten coordenadas; los ejes salen del origen hacia la caja dada.
  function c2s12Axes(X, Y, x0, x1, y0, y1, fs) {
    var o = arrow('axis', X(x0), Y(0), X(x1) - X(x0), 0, 1.5) + arrow('axis', X(0), Y(y0), 0, Y(y1) - Y(y0), 1.5);
    o += text(X(x1) + 10, Y(0) + 5, 'x', ' font-size="' + (fs || 16) + '"');
    o += text(X(0) + 8, Y(y1) + 4, 'y', ' font-size="' + (fs || 16) + '"');
    return o;
  }
  // Región entre dos curvas: tipo I (x de a a b, lo(x) ≤ y ≤ hi(x)) o tipo II (y de a a b, lo(y) ≤ x ≤ hi(y)).
  function c2s12Region(X, Y, kind, a, b, lo, hi, n) {
    var pts = [], i, u;
    for (i = 0; i <= n; i++) { u = a + (b - a) * i / n; pts.push(kind === 'I' ? [X(u), Y(lo(u))] : [X(lo(u)), Y(u)]); }
    for (i = n; i >= 0; i--) { u = a + (b - a) * i / n; pts.push(kind === 'I' ? [X(u), Y(hi(u))] : [X(hi(u)), Y(u)]); }
    return pts;
  }
  function c2s12Curve(X, Y, kind, a, b, g, n) {
    var pts = [];
    for (var i = 0; i <= n; i++) { var u = a + (b - a) * i / n; pts.push(kind === 'I' ? [X(u), Y(g(u))] : [X(g(u)), Y(u)]); }
    return pts;
  }
  // Rebanadas: m segmentos entre lo y hi, repartidos en (a, b).
  function c2s12Slices(X, Y, kind, a, b, lo, hi, m, cls, w) {
    var o = '';
    for (var k = 1; k <= m; k++) {
      var u = a + (b - a) * (k - 0.5) / m;
      o += kind === 'I' ? seg(cls, X(u), Y(lo(u)), X(u), Y(hi(u)), w || 1.4) : seg(cls, X(lo(u)), Y(u), X(hi(u)), Y(u), w || 1.4);
    }
    return o;
  }
  // Renglón de leyenda: muestra del trazo (línea, flecha, punto o relleno) y su texto.
  function c2s12Key(x, y, cls, s, kind, op) {
    var sw = kind === 'dot' ? dot(cls, x + 12, y - 6, 5.5) : kind === 'fill' ? '<rect class="' + cls + '" x="' + x + '" y="' + (y - 13) + '" width="24" height="14" rx="2"/>' :
      kind === 'arrow' ? arrow(cls, x, y - 6, 26, 0, 2.6) : seg(cls, x, y - 6, x + 26, y - 6, kind === 'thin' ? 1.6 : 3, kind === 'dash' ? '6 5' : null);
    return fade(sw + text(x + 34, y, s, ' font-size="16"'), op == null ? 1 : op);
  }

  // S12 · Tipo I (rebanadas verticales entre y = g₁(x) y y = g₂(x)) y tipo II (horizontales entre x = h₁(y) y x = h₂(y)).
  D['c2s12-types'] = function () {
    var o = '';
    // Panel izquierdo: tipo I.
    var X = function (x) { return 40 + 40 * x; }, Y = function (y) { return 230 - 40 * y; };
    var g1 = function (x) { return 0.8 + 0.35 * Math.sin(1.2 * x); }, g2 = function (x) { return 3.6 - 0.12 * (x - 3) * (x - 3) + 0.3 * Math.sin(x); };
    o += fill('area-fill', c2s12Region(X, Y, 'I', 1, 5.5, g1, g2, 60));
    o += c2s12Slices(X, Y, 'I', 1, 5.5, g1, g2, 11, 'aux', 1.3);
    o += c2s12Axes(X, Y, 0, 6.6, 0, 4.6);
    o += seg('axis', X(1), Y(0), X(1), Y(g1(1)), 1.3, '5 4') + seg('axis', X(5.5), Y(0), X(5.5), Y(g1(5.5)), 1.3, '5 4');
    o += text(X(1), Y(0) + 20, 'a', ' text-anchor="middle" font-size="16"') + text(X(5.5), Y(0) + 20, 'b', ' text-anchor="middle" font-size="16"');
    o += poly('ref', c2s12Curve(X, Y, 'I', 1, 5.5, g2, 60), 3) + poly('trace', c2s12Curve(X, Y, 'I', 1, 5.5, g1, 60), 3);
    o += text(40, 26, 'Tipo I: rebanadas verticales', ' font-size="17"');
    o += c2s12Key(40, 284, 'ref', 'sale: y = g₂(x)');
    o += c2s12Key(40, 308, 'trace', 'entra: y = g₁(x)');
    o += text(40, 334, 'x de a a b (números)', ' font-size="15"');
    // Panel derecho: tipo II.
    var X2 = function (x) { return 360 + 40 * x; }, Y2 = function (y) { return 230 - 40 * y; };
    var h1 = function (y) { return 0.9 + 0.3 * Math.sin(1.4 * y) + 0.08 * y * y; }, h2 = function (y) { return 4.6 + 0.6 * Math.sin(0.9 * y + 0.4) - 0.1 * y; };
    o += fill('area-fill', c2s12Region(X2, Y2, 'II', 0.7, 4, h1, h2, 60));
    o += c2s12Slices(X2, Y2, 'II', 0.7, 4, h1, h2, 9, 'aux', 1.3);
    o += c2s12Axes(X2, Y2, 0, 6.3, 0, 4.6);
    o += seg('axis', X2(0), Y2(0.7), X2(h1(0.7)), Y2(0.7), 1.3, '5 4') + seg('axis', X2(0), Y2(4), X2(h1(4)), Y2(4), 1.3, '5 4');
    o += text(X2(0) - 8, Y2(0.7) + 5, 'c', ' text-anchor="end" font-size="16"') + text(X2(0) - 8, Y2(4) + 5, 'd', ' text-anchor="end" font-size="16"');
    o += poly('trace', c2s12Curve(X2, Y2, 'II', 0.7, 4, h1, 60), 3) + poly('ref', c2s12Curve(X2, Y2, 'II', 0.7, 4, h2, 60), 3);
    o += text(360, 26, 'Tipo II: rebanadas horizontales', ' font-size="17"');
    o += c2s12Key(360, 284, 'trace', 'entra: x = h₁(y)');
    o += c2s12Key(360, 308, 'ref', 'sale: x = h₂(y)');
    o += text(360, 334, 'y de c a d (números)', ' font-size="15"');
    return svgBox('0 0 640 346', 'Dos regiones. A la izquierda, una región tipo I: x va de a a b y cada rebanada vertical entra por la curva de abajo y = g1(x) y sale por la de arriba y = g2(x). A la derecha, una región tipo II: y va de c a d y cada rebanada horizontal entra por la curva de la izquierda x = h1(y) y sale por la de la derecha x = h2(y).', o);
  };

  // S12 · Leer los límites del dibujo en la región entre y = x² y y = 2x.
  // state: { v: rebanada vertical (0…1), t: su x; hz: rebanada horizontal (0…1), s: su y;
  //          many: rebanadas de relleno (0…1), rng: corchete del tramo de afuera (0…1) }.
  D['c2s12-read'] = function (st) {
    var v = clamp01(num(st, 'v', 0)), t = num(st, 't', 1), hz = clamp01(num(st, 'hz', 0)), s = num(st, 's', 2.5);
    var many = clamp01(num(st, 'many', 0)), rng = clamp01(num(st, 'rng', 0));
    var X = function (x) { return 70 + 68 * x; }, Y = function (y) { return 318 - 68 * y; }, o = '';
    var sq = function (x) { return x * x; }, ln = function (x) { return 2 * x; }, half = function (y) { return y / 2; }, rt = function (y) { return Math.sqrt(y); };
    o += fill('area-fill', c2s12Region(X, Y, 'I', 0, 2, sq, ln, 60));
    // Rebanadas de relleno: verticales mientras manda la vertical; horizontales después.
    var wV = many * (1 - hz), wH = many * hz;
    o += fade(c2s12Slices(X, Y, 'I', 0, 2, sq, ln, 12, 'aux', 1.2), wV);
    o += fade(c2s12Slices(X, Y, 'II', 0, 4, half, rt, 12, 'aux', 1.2), wH);
    o += c2s12Axes(X, Y, 0, 2.95, 0, 4.45);
    o += poly('ref', c2s12Curve(X, Y, 'I', 0, 2.25, ln, 40), 3) + poly('trace', c2s12Curve(X, Y, 'I', 0, 2.12, sq, 60), 3);
    o += dot('dot-ref', X(0), Y(0), 5) + dot('dot-ref', X(2), Y(4), 5);
    o += text(X(2) + 14, Y(4) + 18, '(2, 4)', ' font-size="16"');
    o += text(X(0) - 10, Y(0) + 26, '(0, 0)', ' text-anchor="end" font-size="16"');
    // Corchetes del tramo de afuera: x de 0 a 2 (abajo) o y de 0 a 4 (a la izquierda).
    var bx = Y(0) + 12, by = X(0) - 14;
    o += fade(seg('error', X(0), bx, X(2), bx, 2.4) + seg('error', X(0), bx - 6, X(0), bx + 6, 2.4) + seg('error', X(2), bx - 6, X(2), bx + 6, 2.4), rng * (1 - hz));
    o += fade(seg('error', by, Y(0), by, Y(4), 2.4) + seg('error', by - 6, Y(0), by + 6, Y(0), 2.4) + seg('error', by - 6, Y(4), by + 6, Y(4), 2.4), rng * hz);
    // La rebanada vertical: entra por y = x² (abajo) y sale por y = 2x (arriba).
    var oV = v * (1 - hz);
    if (oV > 0.001) {
      var y0 = sq(t), y1 = ln(t);
      o += fade(arrow('aux', X(t), Y(y0), 0, Y(y1) - Y(y0), 3.4) + dot('dot-trace', X(t), Y(y0), 5.5) + dot('dot-ref', X(t), Y(y1), 5.5), oV);
    }
    var oH = v * hz;
    if (oH > 0.001) {
      var x0 = half(s), x1 = rt(s);
      o += fade(arrow('aux', X(x0), Y(s), X(x1) - X(x0), 0, 3.4) + dot('dot-ref', X(x0), Y(s), 5.5) + dot('dot-trace', X(x1), Y(s), 5.5), oH);
    }
    // Leyenda: cambia con la dirección de las rebanadas.
    var lx = 330;
    o += c2s12Key(lx, 40, 'ref', 'y = 2x, o x = y/2');
    o += c2s12Key(lx, 66, 'trace', 'y = x², o x = √y');
    o += fade(c2s12Key(lx, 104, 'aux', 'rebanada vertical', 'arrow') + c2s12Key(lx, 130, 'dot-trace', 'entra por y = x²', 'dot') + c2s12Key(lx, 156, 'dot-ref', 'sale por y = 2x', 'dot'), oV);
    o += fade(c2s12Key(lx, 104, 'aux', 'rebanada horizontal', 'arrow') + c2s12Key(lx, 130, 'dot-ref', 'entra por x = y/2', 'dot') + c2s12Key(lx, 156, 'dot-trace', 'sale por x = √y', 'dot'), oH);
    o += fade(c2s12Key(lx, 194, 'error', 'x va de 0 a 2'), rng * (1 - hz));
    o += fade(c2s12Key(lx, 194, 'error', 'y va de 0 a 4'), rng * hz);
    return svgBox('0 0 600 350', 'Región entre la parábola y = x² y la recta y = 2x, que se cortan en (0, 0) y (2, 4). Una rebanada vertical entra por la parábola y sale por la recta; una horizontal entra por la recta, x = y/2, y sale por la parábola, x = raíz de y.', o);
  };

  // S12 · Cambiar el orden: x = y² y y = x − 2. En dx dy basta una integral; en dy dx la
  // curva de abajo cambia en x = 1 y hay que partir.
  D['c2s12-split'] = function () {
    var o = '';
    function panel(ox, mode) {
      var X = function (x) { return ox + 22 + 52 * x; }, Y = function (y) { return 168 - 52 * y; }, p = '';
      var L = function (y) { return y * y; }, Rr = function (y) { return y + 2; };
      var top = function (x) { return Math.sqrt(x); }, b1 = function (x) { return -Math.sqrt(x); }, b2 = function (x) { return x - 2; };
      if (mode === 'II') p += fill('area-fill', c2s12Region(X, Y, 'II', -1, 2, L, Rr, 60));
      else p += fill('area-fill', c2s12Region(X, Y, 'I', 0, 1, b1, top, 40)) + fill('rect-fill', c2s12Region(X, Y, 'I', 1, 4, b2, top, 60));
      p += mode === 'II' ? c2s12Slices(X, Y, 'II', -1, 2, L, Rr, 10, 'aux', 1.3)
        : c2s12Slices(X, Y, 'I', 0, 1, b1, top, 3, 'aux', 1.3) + c2s12Slices(X, Y, 'I', 1, 4, b2, top, 8, 'aux', 1.3);
      p += arrow('axis', X(0), Y(0), X(4.6) - X(0), 0, 1.5) + arrow('axis', X(0), Y(-1.35), 0, Y(2.45) - Y(-1.35), 1.5);
      p += text(X(4.6) + 9, Y(0) + 5, 'x', ' font-size="16"') + text(X(0) + 8, Y(2.45) + 4, 'y', ' font-size="16"');
      p += poly('trace', c2s12Curve(X, Y, 'II', -1.25, 2.1, L, 60), 3) + poly('ref', c2s12Curve(X, Y, 'II', -1.25, 2.1, Rr, 10), 3);
      if (mode === 'I') p += seg('error', X(1), Y(-1.3), X(1), Y(1.6), 2.2, '6 5');
      p += dot('dot-ref', X(1), Y(-1), 5) + dot('dot-ref', X(4), Y(2), 5);
      return p;
    }
    o += panel(0, 'II') + panel(320, 'I');
    o += text(22, 24, 'dx dy: una sola integral', ' font-size="17"');
    o += text(342, 24, 'dy dx: hay que partir en x = 1', ' font-size="17"');
    o += c2s12Key(22, 262, 'trace', 'entra: x = y²');
    o += c2s12Key(22, 286, 'ref', 'sale: x = y + 2');
    o += text(22, 312, 'y de −1 a 2', ' font-size="15"');
    o += c2s12Key(342, 262, 'trace', 'arriba: y = √x');
    o += c2s12Key(342, 286, 'area-fill', 'abajo: y = −√x (0 a 1)', 'fill');
    o += c2s12Key(342, 310, 'rect-fill', 'abajo: y = x − 2 (1 a 4)', 'fill');
    o += c2s12Key(342, 334, 'error', 'corte en x = 1', 'dash');
    return svgBox('0 0 640 346', 'La región entre x = y al cuadrado y la recta y = x − 2, que se cortan en (1, −1) y (4, 2). Con rebanadas horizontales todas entran por la parábola y salen por la recta: una integral. Con rebanadas verticales, la curva de abajo es y = −raíz de x hasta x = 1 y luego y = x − 2: hay que partir en x = 1.', o);
  };

  // S12 · El triángulo 0 ≤ y ≤ x ≤ 1: como viene (dx dy) y volteado (dy dx).
  D['c2s12-swap'] = function () {
    var o = '';
    function panel(ox, mode) {
      var X = function (x) { return ox + 40 + 180 * x; }, Y = function (y) { return 256 - 180 * y; }, p = '';
      var zero = function () { return 0; }, id = function (u) { return u; }, one = function () { return 1; };
      p += fill('area-fill', c2s12Region(X, Y, 'I', 0, 1, zero, id, 4));
      p += mode === 'II' ? c2s12Slices(X, Y, 'II', 0, 1, id, one, 9, 'aux', 1.4) : c2s12Slices(X, Y, 'I', 0, 1, zero, id, 9, 'aux', 1.4);
      p += arrow('axis', X(0), Y(0), X(1.28) - X(0), 0, 1.5) + arrow('axis', X(0), Y(0), 0, Y(1.15) - Y(0), 1.5);
      p += text(X(1.28) + 9, Y(0) + 5, 'x', ' font-size="16"') + text(X(0) + 8, Y(1.15) + 4, 'y', ' font-size="16"');
      p += seg('ref', X(0), Y(0), X(1.08), Y(1.08), 3) + seg('trace', X(1), Y(0), X(1), Y(1.08), 3);
      p += dot('dot-ref', X(1), Y(1), 5);
      p += text(X(1) + 12, Y(1) + 6, '(1, 1)', ' font-size="15"');
      return p;
    }
    o += panel(0, 'II') + panel(320, 'I');
    o += text(40, 24, 'Como viene: dx dy', ' font-size="17"');
    o += text(360, 24, 'Volteada: dy dx', ' font-size="17"');
    o += c2s12Key(40, 292, 'aux', 'x de y a 1', 'thin');
    o += text(40, 318, 'adentro: ∫ e^(x²) dx', ' font-size="15"');
    o += text(40, 340, 'no tiene antiderivada elemental', ' font-size="15"');
    o += c2s12Key(360, 292, 'aux', 'y de 0 a x', 'thin');
    o += text(360, 318, 'adentro: ∫ e^(x²) dy = x·e^(x²)', ' font-size="15"');
    o += text(360, 340, 'y eso sí se integra en x', ' font-size="15"');
    return svgBox('0 0 640 354', 'El triángulo con vértices (0, 0), (1, 0) y (1, 1), entre la recta y = x y la recta x = 1. A la izquierda, con rebanadas horizontales de x = y a x = 1, la integral de adentro es la de e a la x cuadrada, que no tiene antiderivada elemental. A la derecha, con rebanadas verticales de y = 0 a y = x, la de adentro da x por e a la x cuadrada, que sí se integra.', o);
  };

  // S12 · Lámina bajo y = 4 − x² con densidad ρ = y: más densa arriba. El centro de masa sube
  // de ȳ = 8/5 (sin densidad) a ȳ = 16/7; por simetría x̄ = 0.
  D['c2s12-mass'] = function () {
    var X = function (x) { return 170 + 62 * x; }, Y = function (y) { return 300 - 62 * y; }, o = '', i;
    var top = function (x) { return 4 - x * x; };
    // Bandas horizontales: más opacas arriba (más densidad).
    for (i = 0; i < 8; i++) {
      var y0 = 4 * i / 8, y1 = 4 * (i + 1) / 8, w0 = Math.sqrt(4 - y0), w1 = Math.sqrt(4 - y1);
      o += '<g opacity="' + (0.25 + 0.75 * (i + 0.5) / 8).toFixed(2) + '">' + fill('area-fill', [[X(-w0), Y(y0)], [X(w0), Y(y0)], [X(w1), Y(y1)], [X(-w1), Y(y1)]]) + '</g>';
    }
    o += arrow('axis', X(-2.5), Y(0), X(2.6) - X(-2.5), 0, 1.5) + arrow('axis', X(0), Y(0), 0, Y(4.4) - Y(0), 1.5);
    o += text(X(2.6) + 9, Y(0) + 5, 'x', ' font-size="16"') + text(X(0) + 8, Y(4.4) + 4, 'y', ' font-size="16"');
    o += poly('ref', c2s12Curve(X, Y, 'I', -2, 2, top, 60), 3);
    o += dot('dot-aux', X(0), Y(1.6), 6) + dot('dot-error', X(0), Y(16 / 7), 6.5);
    var lx = 340;
    o += c2s12Key(lx, 44, 'ref', 'y = 4 − x²');
    o += c2s12Key(lx, 72, 'area-fill', 'ρ = y: más densa arriba', 'fill');
    o += c2s12Key(lx, 100, 'dot-error', 'centro de masa: ȳ ≈ 2.29', 'dot');
    o += c2s12Key(lx, 128, 'dot-aux', 'con ρ constante: ȳ = 1.6', 'dot');
    o += text(lx, 166, 'La figura es simétrica respecto', ' font-size="15"');
    o += text(lx, 188, 'al eje y y ρ también: x̄ = 0.', ' font-size="15"');
    return svgBox('0 0 640 322', 'Lámina bajo la parábola y = 4 − x² con densidad ρ = y, sombreada más fuerte arriba. Su centro de masa está en x = 0 por simetría y en y = 16/7, más arriba que el centroide de la figura con densidad constante, y = 1.6.', o);
  };

  /* ══════════════════════ fin S12 ══════════════════════ */

  /* ══════════════════════ S13 ══════════════════════ */
  // Integral doble en polares. Q(ox, oy, k): (r, θ en grados) → píxeles; θ antihorario.
  function c2s13Q(ox, oy, k) { return function (r, deg) { return [ox + k * r * Math.cos(deg * RAD), oy - k * r * Math.sin(deg * RAD)]; }; }
  function c2s13Arc(Q, r, a0, a1, n) { var o = []; n = n || 40; for (var i = 0; i <= n; i++) o.push(Q(r, a0 + (a1 - a0) * i / n)); return o; }
  // Rectángulo polar [r0, r1] × [a0, a1] como polígono.
  function c2s13Cell(Q, r0, r1, a0, a1) { return c2s13Arc(Q, r1, a0, a1, 24).concat(c2s13Arc(Q, r0, a1, a0, 24)); }
  // Coloca etiquetas [[x, y, texto]] alrededor de su punto sin tocar trazos ni otras etiquetas.
  function c2s13Labels(list, pts, vb, fs) {
    var out = '', placed = [];
    list.forEach(function (L) {
      var cands = L[3] || around(L[0], L[1], L[2]);
      var c = spot(cands, pts.concat(placed), fs, vb);
      out += label(c, fs);
      var w = String(c[2]).length * fs * 0.6, x0 = c[3] === 'end' ? c[0] - w : c[3] === 'middle' ? c[0] - w / 2 : c[0];
      for (var x = x0 - 4; x <= x0 + w + 4; x += 4) { placed.push([x, c[1] + 3]); placed.push([x, c[1] - fs * 0.45]); placed.push([x, c[1] - fs * 0.9]); }
    });
    return out;
  }

  // Cuadritos contra rebanadas y anillos sobre el mismo disco.
  D['c2s13-why'] = function () {
    var b = '', R = 2, k = 58, Lc = [160, 150], Rc = [480, 150], i, j;
    // Izquierda: rejilla rectangular; los cuadritos del borde no encajan (se marcan).
    for (i = -2; i < 2; i++) for (j = -2; j < 2; j++) {
      for (var a = 0; a < 2; a++) for (var c = 0; c < 2; c++) {
        var x0 = i + a / 2, y0 = j + c / 2, dd = [[x0, y0], [x0 + 0.5, y0], [x0 + 0.5, y0 + 0.5], [x0, y0 + 0.5]].map(function (p) { return Math.hypot(p[0], p[1]); });
        var n = dd.filter(function (d) { return d <= R + 1e-9; }).length;
        if (!n) continue;
        var pts = [[x0, y0], [x0 + 0.5, y0], [x0 + 0.5, y0 + 0.5], [x0, y0 + 0.5]].map(function (p) { return [Lc[0] + k * p[0], Lc[1] - k * p[1]]; });
        b += '<path class="' + (n === 4 ? 'rect-fill' : 'box-err') + '" stroke-width="1.2" d="' + pts.map(function (p, q) { return (q ? 'L' : 'M') + r1(p[0]) + ' ' + r1(p[1]); }).join('') + 'Z"/>';
      }
    }
    b += '<circle class="ref" fill="none" stroke-width="3" cx="' + Lc[0] + '" cy="' + Lc[1] + '" r="' + (R * k) + '"/>';
    // Derecha: malla polar que sigue al borde.
    var Q = c2s13Q(Rc[0], Rc[1], k);
    for (i = 0; i < 4; i++) for (j = 0; j < 12; j++) b += fill('box-aux', c2s13Cell(Q, i * 0.5, (i + 1) * 0.5, j * 30, (j + 1) * 30));
    b += '<circle class="ref" fill="none" stroke-width="3" cx="' + Rc[0] + '" cy="' + Rc[1] + '" r="' + (R * k) + '"/>';
    b += text(Lc[0], 300, 'Cuadritos: los del borde no encajan', ' text-anchor="middle" font-size="17"');
    b += text(Lc[0], 324, 'y piden límites con √(4 − x²)', ' text-anchor="middle" font-size="17"');
    b += text(Rc[0], 300, 'Rebanadas y anillos: encajan', ' text-anchor="middle" font-size="17"');
    b += text(Rc[0], 324, 'exacto con 0 ≤ r ≤ 2', ' text-anchor="middle" font-size="17"');
    return svgBox('0 0 640 340', 'El disco x² + y² ≤ 4 cubierto con cuadritos: los del borde quedan cortados. El mismo disco cubierto con rebanadas y anillos: encajan exacto con 0 ≤ r ≤ 2.', b);
  };

  // Explainer: de dónde sale la r. state.k: 0 malla · 1 resta de sectores · 2 lados Δr y r*Δθ ·
  // 3 comparar con un rectángulo cerca del origen · 4 dA = r dr dθ.
  D['c2s13-element'] = function (st) {
    var k = Math.max(0, Math.min(4, num(st, 'k', 0)));
    var ox = 56, oy = 330, sc = 64, Q = c2s13Q(ox, oy, sc), b = '', pts = [], i;
    var A0 = 30, A1 = 45, ra = 3, rb = 4;
    // Malla polar del primer cuadrante.
    for (i = 1; i <= 4; i++) { var arc = c2s13Arc(Q, i, 0, 90, 48); b += poly('aux', arc, 1.4); pts = pts.concat(polyPts(arc)); }
    for (i = 0; i <= 6; i++) { var e = Q(4, i * 15); b += seg('aux', ox, oy, e[0], e[1], 1.4); pts = pts.concat(segPts(ox, oy, e[0], e[1])); }
    b += arrow('axis', ox - 10, oy, 300, 0, 1.6) + arrow('axis', ox, oy + 10, 0, -300, 1.6);
    pts = pts.concat(segPts(ox - 10, oy, ox + 290, oy), segPts(ox, oy + 10, ox, oy - 290));
    b += text(ox + 300, oy + 22, 'x', ' text-anchor="end" font-size="18"') + text(ox - 12, oy - 286, 'y', ' text-anchor="end" font-size="18"');
    // Paso 1: resta de dos sectores.
    var s1 = clamp01(k) * (1 - clamp01(k - 1.6));
    if (s1 > 0.01) {
      var big = [[ox, oy]].concat(c2s13Arc(Q, rb, A0, A1, 24)), small = [[ox, oy]].concat(c2s13Arc(Q, ra, A0, A1, 24));
      b += fade(fill('box-aux', big) + fill('box-err', small), s1);
    }
    // El rectángulo polar lejano (siempre).
    var far = c2s13Cell(Q, ra, rb, A0, A1);
    b += fill('box-trace', far);
    var near = c2s13Cell(Q, 1, 2, A0, A1), o4 = clamp01(k - 2.4);
    if (o4 > 0.01) b += fade(fill('box-err', near), o4);
    var lab = [], vb = [0, 0, 640, 360];
    // Paso 2: lados Δr (radial) y r* Δθ (arco).
    var o2 = clamp01(k - 1.4);
    if (o2 > 0.5) {
      var m = Q(3.5, A1 + 2.5), am = Q(rb, (A0 + A1) / 2);
      lab.push([m[0], m[1], 'Δr']);
      lab.push([am[0], am[1], 'r*Δθ']);
    }
    var rows = [];
    if (k < 0.5) rows = ['Circunferencias r = cte', 'cada Δr y rayos θ = cte', 'cada Δθ: la región se parte', 'en rectángulos polares.'];
    else if (k < 1.5) rows = ['Rectángulo polar =', 'sector grande − sector chico', '½(r + Δr)²Δθ − ½r²Δθ'];
    else if (k < 2.5) rows = ['= (r + Δr/2) Δr Δθ', '= r* Δr Δθ', 'r* = radio de en medio'];
    else if (k < 3.5) rows = ['Mismos Δr y Δθ:', 'lejos (r* = 3.5): 3.5 ΔrΔθ', 'cerca (r* = 1.5): 1.5 ΔrΔθ', 'el de afuera es 2.3 veces mayor'];
    else rows = ['Con Δr, Δθ → 0:', 'dA = r dr dθ', 'la r es el factor que mide', 'cuánto se estira el pedazo'];
    rows.forEach(function (t, q) { b += text(352, 70 + q * 32, t, ' font-size="19"'); });
    b += c2s13Labels(lab, pts.concat(polyPts(far.concat([far[0]]))), vb, 18);
    return svgBox('0 0 640 360', 'Malla polar del primer cuadrante con un rectángulo polar resaltado entre r = 3 y r = 4. Su área es la resta de dos sectores, r* Δr Δθ; uno igual de ancho cerca del origen es más chico.', b);
  };

  // Región polar general: entre r = r₁(θ) y r = r₂(θ), con α ≤ θ ≤ β.
  D['c2s13-region'] = function () {
    var ox = 70, oy = 330, sc = 70, Q = c2s13Q(ox, oy, sc), b = '', pts = [];
    var r1f = function (d) { return 1.4 + 0.35 * Math.sin(3 * d * RAD); }, r2f = function (d) { return 3.3 + 0.45 * Math.cos(2 * d * RAD); };
    var al = 15, be = 70, n = 60, i, out = [], inn = [];
    for (i = 0; i <= n; i++) { var d = al + (be - al) * i / n; out.push(Q(r2f(d), d)); inn.push(Q(r1f(d), d)); }
    b += fill('area-fill', out.concat(inn.slice().reverse()));
    b += arrow('axis', ox - 10, oy, 300, 0, 1.6) + arrow('axis', ox, oy + 10, 0, -300, 1.6);
    pts = pts.concat(segPts(ox - 10, oy, ox + 290, oy), segPts(ox, oy + 10, ox, oy - 290));
    [al, be].forEach(function (d) { var e = Q(4.2, d); b += seg('aux', ox, oy, e[0], e[1], 1.6, '6 5'); pts = pts.concat(segPts(ox, oy, e[0], e[1])); });
    b += poly('ref', out, 3) + poly('ref', inn, 3);
    pts = pts.concat(polyPts(out), polyPts(inn));
    var dm = 42, p1 = Q(r1f(dm), dm), p2 = Q(r2f(dm), dm);
    b += arrow('trace', p1[0], p1[1], p2[0] - p1[0], p2[1] - p1[1], 3);
    pts = pts.concat(arrowPts(p1[0], p1[1], p2[0] - p1[0], p2[1] - p1[1]));
    b += dot('dot-trace', p1[0], p1[1], 4.5);
    var vb = [0, 0, 640, 360], o2 = Q(r2f(25) + 0.15, 25), ea = Q(4.2, al), eb = Q(4.2, be);
    b += c2s13Labels([
      [o2[0], o2[1], 'r = r₂(θ)', [[o2[0] + 14, o2[1] + 4, 'r = r₂(θ)', 'start'], [o2[0] + 24, o2[1] + 20, 'r = r₂(θ)', 'start']]],
      [ea[0], ea[1], 'θ = α'], [eb[0], eb[1], 'θ = β']
    ], pts, vb, 18);
    // La curva de adentro se nombra abajo del rayo θ = α, con una línea guía.
    var g1 = Q(r1f(20), 20);
    b += seg('axis', g1[0], g1[1], 218, 308, 1.2);
    b += text(224, 318, 'r = r₁(θ)', ' font-size="18"');
    b += text(400, 60, 'Para cada θ', ' font-size="18"');
    b += text(400, 88, 'entre α y β,', ' font-size="18"');
    b += text(400, 116, 'r va de la curva', ' font-size="18"');
    b += text(400, 144, 'de adentro a la', ' font-size="18"');
    b += text(400, 172, 'de afuera (flecha).', ' font-size="18"');
    return svgBox('0 0 640 360', 'Región polar general: entre los rayos θ = α y θ = β, y entre las curvas r = r₁(θ) y r = r₂(θ). Para cada θ, r va de la curva interior a la exterior.', b);
  };

  // Un pétalo de r = 2 cos 3θ entre los rayos θ = −π/6 y θ = π/6.
  D['c2s13-petal'] = function () {
    var ox = 180, oy = 175, sc = 72, b = '', pts = [], i, all = [], pet = [];
    var Q = c2s13Q(ox, oy, sc);
    for (i = 0; i <= 360; i++) { var t = i * Math.PI / 360; all.push(Q(2 * Math.cos(3 * t), t / RAD)); }
    for (i = 0; i <= 80; i++) { var u = -30 + 60 * i / 80; pet.push(Q(2 * Math.cos(3 * u * RAD), u)); }
    b += arrow('axis', ox - 170, oy, 340, 0, 1.6) + arrow('axis', ox, oy + 165, 0, -330, 1.6);
    pts = pts.concat(segPts(ox - 170, oy, ox + 170, oy), segPts(ox, oy + 165, ox, oy - 165));
    b += text(ox + 168, oy + 24, 'x', ' text-anchor="end" font-size="18"') + text(ox - 12, oy - 148, 'y', ' text-anchor="end" font-size="18"');
    b += poly('aux', all, 1.8, false, '5 5');
    pts = pts.concat(polyPts(all));
    b += fill('area-fill', pet) + poly('ref', pet, 3);
    [30, -30].forEach(function (d) { var e = Q(2.3, d); b += seg('trace', ox, oy, e[0], e[1], 2, '6 5'); pts = pts.concat(segPts(ox, oy, e[0], e[1])); });
    var e1 = Q(2.3, 30), e2 = Q(2.3, -30), tip = Q(2, 0);
    b += c2s13Labels([
      [e1[0], e1[1], 'θ = π/6', [[e1[0] + 8, e1[1] - 6, 'θ = π/6', 'start'], [e1[0] + 10, e1[1] + 16, 'θ = π/6', 'start']]],
      [e2[0], e2[1], 'θ = −π/6', [[e2[0] + 8, e2[1] + 14, 'θ = −π/6', 'start'], [e2[0] + 10, e2[1] - 6, 'θ = −π/6', 'start']]],
      [tip[0], tip[1], '2', [[tip[0] + 10, tip[1] - 10, '2', 'start'], [tip[0] + 8, tip[1] + 22, '2', 'start']]]
    ], pts, [0, 0, 640, 350], 18);
    b += text(424, 70, 'r = 2 cos 3θ', ' font-size="18"');
    b += text(424, 96, 'tiene 3 pétalos.', ' font-size="18"');
    b += text(424, 140, 'El sombreado va', ' font-size="18"');
    b += text(424, 166, 'de θ = −π/6', ' font-size="18"');
    b += text(424, 192, 'a θ = π/6 (r = 0).', ' font-size="18"');
    b += text(424, 244, 'A = ½ ∫ r² dθ', ' font-size="19"');
    return svgBox('0 0 640 350', 'La rosa r = 2 cos 3θ con un pétalo sombreado. Ese pétalo empieza y termina en el origen, en θ = −π/6 y θ = π/6.', b);
  };

  // Convertir: el cuarto de disco leído en rectangulares (tira vertical) y en polares (rayo).
  D['c2s13-convert'] = function () {
    var b = '', k = 60, R = 2;
    function panel(ox, oy, polar) {
      var o = '', pts = [], Q = c2s13Q(ox, oy, k), q = c2s13Arc(Q, R, 0, 90, 48);
      o += fill('area-fill', [[ox, oy]].concat(q));
      o += arrow('axis', ox - 10, oy, 170, 0, 1.6) + arrow('axis', ox, oy + 10, 0, -170, 1.6);
      pts = pts.concat(segPts(ox - 10, oy, ox + 160, oy), segPts(ox, oy + 10, ox, oy - 160));
      o += text(ox + 168, oy + 22, 'x', ' text-anchor="end" font-size="18"') + text(ox - 10, oy - 150, 'y', ' text-anchor="end" font-size="18"');
      o += poly('ref', q, 3);
      pts = pts.concat(polyPts(q));
      if (!polar) {
        var x = 1.2, yt = Math.sqrt(R * R - x * x);
        o += fill('box-trace', [[ox + k * (x - 0.08), oy], [ox + k * (x + 0.08), oy], [ox + k * (x + 0.08), oy - k * Math.sqrt(R * R - (x + 0.08) * (x + 0.08))], [ox + k * (x - 0.08), oy - k * Math.sqrt(R * R - (x - 0.08) * (x - 0.08))]]);
        pts = pts.concat(segPts(ox + k * x, oy, ox + k * x, oy - k * yt));
        o += c2s13Labels([[ox + k * x, oy - k * yt, 'y = √(4 − x²)', [[ox + k * x + 14, oy - k * yt - 18, 'y = √(4 − x²)', 'start'], [ox + k * x + 30, oy - k * yt - 8, 'y = √(4 − x²)', 'start']]]], pts, [0, 0, 640, 330], 17);
      } else {
        var e = Q(R, 35);
        o += arrow('trace', ox, oy, e[0] - ox, e[1] - oy, 3);
        pts = pts.concat(arrowPts(ox, oy, e[0] - ox, e[1] - oy));
        o += arc(ox, oy, 34, 0, 35, 'trace', 2);
        o += c2s13Labels([[e[0], e[1], 'r = 2', [[e[0] + 12, e[1] - 6, 'r = 2', 'start'], [e[0] + 14, e[1] + 14, 'r = 2', 'start']]],
          [ox + 46, oy - 16, 'θ', [[ox + 48, oy - 10, 'θ', 'start'], [ox + 52, oy - 4, 'θ', 'start']]]], pts, [0, 0, 640, 330], 18);
      }
      return o;
    }
    b += panel(40, 230, false) + panel(360, 230, true);
    b += text(110, 280, '0 ≤ y ≤ √(4 − x²)', ' text-anchor="middle" font-size="17"');
    b += text(110, 306, '0 ≤ x ≤ 2', ' text-anchor="middle" font-size="17"');
    b += text(440, 280, '0 ≤ r ≤ 2', ' text-anchor="middle" font-size="17"');
    b += text(440, 306, '0 ≤ θ ≤ π/2', ' text-anchor="middle" font-size="17"');
    return svgBox('0 0 640 330', 'El cuarto de disco x² + y² ≤ 4 en el primer cuadrante. En rectangulares se recorre con tiras verticales de y = 0 a y = √(4 − x²); en polares, con rayos de r = 0 a r = 2 y θ de 0 a π/2.', b);
  };

  // Gauss: el cuadrado [−R, R]² queda entre el disco de radio R y el de radio R√2.
  D['c2s13-gauss'] = function () {
    var ox = 170, oy = 175, R = 1.6, k = 72, b = '', s = R * k, big = R * Math.SQRT2 * k;
    b += '<circle class="box-aux" stroke-width="2" cx="' + ox + '" cy="' + oy + '" r="' + r1(big) + '"/>';
    b += '<path class="rect-fill" stroke-width="2" d="M' + (ox - s) + ' ' + (oy - s) + 'H' + (ox + s) + 'V' + (oy + s) + 'H' + (ox - s) + 'Z"/>';
    b += '<circle class="ref" fill="none" stroke-width="3" cx="' + ox + '" cy="' + oy + '" r="' + s + '"/>';
    b += seg('axis', ox - big - 6, oy, ox + big + 6, oy, 1.4) + seg('axis', ox, oy + big + 6, ox, oy - big - 6, 1.4);
    b += text(372, 56, 'Disco de radio R (dentro)', ' font-size="17"');
    b += text(372, 82, '⊂ cuadrado [−R, R]²', ' font-size="17"');
    b += text(372, 108, '⊂ disco de radio R√2', ' font-size="17"');
    b += text(372, 168, 'e^(−(x² + y²)) > 0, así que', ' font-size="17"');
    b += text(372, 194, 'π(1 − e^(−R²)) ≤ I(R)²', ' font-size="17"');
    b += text(372, 220, 'I(R)² ≤ π(1 − e^(−2R²))', ' font-size="17"');
    b += text(372, 280, 'R → ∞: I² = π, I = √π', ' font-size="19"');
    return svgBox('0 0 640 350', 'Un disco de radio R dentro del cuadrado de lado 2R, y el cuadrado dentro del disco de radio R√2. Como el integrando es positivo, la integral sobre el cuadrado queda entre las dos de los discos.', b);
  };
  /* ══════════════════════ fin S13 ══════════════════════ */

  /* ══════════════════════ S14 ══════════════════════ */
  // Cubito [x0, x1] × [y0, y1] × [z0, z1] proyectado: solo las caras que ve la cámara (+x, +y y la tapa).
  // Para pintar bien, llámalo en orden lexicográfico (x, luego y, luego z): la cámara mira desde +x, +y, +z.
  function c2s14Cube(P, x0, y0, z0, x1, y1, z1, cls) {
    var f = [
      [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]],
      [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]],
      [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]
    ];
    return f.map(function (q) { return fill(cls, q.map(P)); }).join('');
  }
  // Líneas de texto a la derecha, alineadas al final; aparecen con el paso.
  function c2s14Notes(lines, x, y0, dy, fs) {
    return lines.map(function (L, i) { return L[1] <= 0.001 ? '' : fade(text(x, y0 + i * dy, L[0], ' text-anchor="end" font-size="' + fs + '"'), L[1]); }).join('');
  }

  // S14 · Del cubito a la integral: tetraedro x + y + z ≤ 4 con cubitos de lado 1 (centro adentro).
  // k = 0 un cubito · 1 una columna · 2 una rebanada (x fija) · 3 todo el sólido.
  D['c2s14-cubes'] = function (st) {
    var k = num(st, 'k', 0), P = view3({ cx: 200, cy: 205, s: 36 }), body = '';
    body += axes3(P, 5.1, 18);
    var cubes = [];
    for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) for (var l = 0; l < 3 - i - j; l++) cubes.push([i, j, l]);
    cubes.forEach(function (c) {
      var i2 = c[0], j2 = c[1], l2 = c[2], show, cls;
      if (k < 0.5) { show = i2 === 1 && j2 === 0 && l2 === 0; cls = 'box-trace'; }
      else if (k < 1.5) { show = i2 === 1 && j2 === 0; cls = 'box-trace'; }
      else if (k < 2.5) { show = i2 === 1; cls = 'box-trace'; }
      else { show = true; cls = i2 === 1 ? 'box-trace' : 'box-aux'; }
      if (show) body += c2s14Cube(P, i2 + 0.04, j2 + 0.04, l2 + 0.04, i2 + 0.96, j2 + 0.96, l2 + 0.96, cls);
    });
    var X = P([4, 0, 0]), Y = P([0, 4, 0]), Z = P([0, 0, 4]);
    body += fill('area-fill', [X, Y, Z]);
    body += poly('ref', [X, Y, Z], 2.4, true);
    body += c2s14Notes([
      ['dV = dx dy dz', 1],
      ['∫ dz: de 0 a 4 − x − y', clamp01(k)],
      ['∫ dy: de 0 a 4 − x', clamp01(k - 1)],
      ['∫ dx: de 0 a 4', clamp01(k - 2)]
    ], 548, 40, 32, 20);
    return svgBox('0 0 560 330', 'Tetraedro bajo el plano x + y + z = 4 armado con cubitos: un cubito de volumen dx dy dz, una columna en z, una rebanada en y y todas las rebanadas en x.', body);
  };

  // S14 · Límites de la cuña bajo z = 5 − x − y sobre el triángulo 0 ≤ y ≤ x ≤ 2.
  // s = 1 sólido · 2 sombra D · 3 columna en z · 4 tramo en y · 5 recorrido en x.
  D['c2s14-shadow'] = function (st) {
    // Esquema: z se dibuja a 0.55 de su escala para que la sombra D se vea grande.
    var s = num(st, 's', 1), V = view3({ cx: 160, cy: 232, s: 70, az: -30, el: 25 }), body = '';
    function P(p) { return V([p[0], p[1], p[2] * 0.55]); }
    function top(x, y) { return 5 - x - y; }
    var A = [0, 0, 0], B = [2, 0, 0], C = [2, 2, 0], A2 = [0, 0, 5], B2 = [2, 0, 3], C2 = [2, 2, 1];
    var O = P([0, 0, 0]);
    [[[2.6, 0, 0], 'x'], [[0, 2.9, 0], 'y'], [[0, 0, 5.7], 'z']].forEach(function (e) {
      var t = P(e[0]), dx = t[0] - O[0], dy = t[1] - O[1], m = Math.hypot(dx, dy) || 1;
      body += arrow('axis', O[0], O[1], dx, dy, 1.6) + text(t[0] + dx / m * 14, t[1] + dy / m * 14 + 6, e[1], ' text-anchor="middle" font-size="18"');
    });
    var dS = clamp01(s - 1);
    if (dS > 0) body += fade(fill('box-trace', [A, B, C].map(P)), dS);
    body += fill('area-fill', [A2, B2, C2].map(P));
    body += poly('ref', [A2, B2, C2].map(P), 2.4, true);
    body += poly('ref', [A, B, C].map(P), 1.6, true, dS > 0.5 ? null : '5 4');
    [[A, A2], [B, B2], [C, C2]].forEach(function (e) { var p = P(e[0]), q = P(e[1]); body += seg('ref', p[0], p[1], q[0], q[1], 2); });
    var px = 1.5, py = 0.6, dC = clamp01(s - 2);
    if (dC > 0) {
      var p0 = P([px, py, 0]), p1 = P([px, py, top(px, py)]);
      body += fade(seg('trace', p0[0], p0[1], p1[0], p1[1], 3.2) + dot('dot-trace', p0[0], p0[1], 5) + dot('dot-trace', p1[0], p1[1], 5), dC);
    }
    var dY = clamp01(s - 3);
    if (dY > 0) { var q0 = P([px, 0, 0]), q1 = P([px, px, 0]); body += fade(seg('error', q0[0], q0[1], q1[0], q1[1], 3.6), dY); }
    var dX = clamp01(s - 4);
    if (dX > 0) { var r0 = P([0, 0, 0]), r1 = P([2, 0, 0]); body += fade(seg('error', r0[0], r0[1], r1[0], r1[1], 3.6), dX); }
    body += c2s14Notes([
      ['tapa: z = 5 − x − y', 1],
      ['sombra D: 0 ≤ y ≤ x ≤ 2', dS],
      ['z: de 0 a 5 − x − y', dC],
      ['y: de 0 a x', dY],
      ['x: de 0 a 2', dX]
    ], 548, 40, 32, 20);
    return svgBox('0 0 560 330', 'Cuña bajo el plano z = 5 − x − y sobre el triángulo 0 ≤ y ≤ x ≤ 2: su sombra D en el piso, una columna vertical de z = 0 a la tapa, el tramo de y de 0 a x y el recorrido de x de 0 a 2.', body);
  };

  /* ══════════════════════ fin S14 ══════════════════════ */

  /* ══════════════════════ S15 ══════════════════════ */
  // Punto en esféricas (ρ, θ, φ) con φ desde el eje z positivo; y en cilíndricas (r, θ, z).
  function c2s15S(rho, th, ph) { return [rho * Math.sin(ph) * Math.cos(th), rho * Math.sin(ph) * Math.sin(th), rho * Math.cos(ph)]; }
  function c2s15C(r, th, z) { return [r * Math.cos(th), r * Math.sin(th), z]; }
  // Curva entre dos juegos de coordenadas (lineal en las coordenadas), proyectada.
  function c2s15Path(P, F, a, b, n) {
    var o = [];
    for (var i = 0; i <= n; i++) { var t = i / n; o.push(P(F(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t))); }
    return o;
  }
  // Las seis caras de una cajita curva [lo, hi] (coordenadas del sistema F), como rellenos.
  function c2s15Cell(P, F, lo, hi, cls) {
    var o = '', m = 10;
    function face(p, du, dv) {
      var q = [p, [p[0] + du[0], p[1] + du[1], p[2] + du[2]], [p[0] + du[0] + dv[0], p[1] + du[1] + dv[1], p[2] + du[2] + dv[2]], [p[0] + dv[0], p[1] + dv[1], p[2] + dv[2]]];
      return fill(cls, c2s15Path(P, F, q[0], q[1], m).concat(c2s15Path(P, F, q[1], q[2], m), c2s15Path(P, F, q[2], q[3], m), c2s15Path(P, F, q[3], q[0], m)));
    }
    var d = [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]];
    o += face([lo[0], lo[1], lo[2]], [0, d[1], 0], [0, 0, d[2]]) + face([hi[0], lo[1], lo[2]], [0, d[1], 0], [0, 0, d[2]]);
    o += face([lo[0], lo[1], lo[2]], [d[0], 0, 0], [0, 0, d[2]]) + face([lo[0], hi[1], lo[2]], [d[0], 0, 0], [0, 0, d[2]]);
    o += face([lo[0], lo[1], lo[2]], [d[0], 0, 0], [0, d[1], 0]) + face([lo[0], lo[1], hi[2]], [d[0], 0, 0], [0, d[1], 0]);
    return o;
  }
  // Notas a la derecha, alineadas al final, que aparecen con el paso.
  function c2s15Notes(lines, x, y0, dy, fs) {
    return lines.map(function (L, i) { return L[1] <= 0.001 ? '' : fade(text(x, y0 + i * dy, L[0], ' text-anchor="end" font-size="' + fs + '"'), L[1]); }).join('');
  }

  // S15 · La cajita esférica: s = 0 el punto P · 1 lado dρ · 2 lado ρ dφ · 3 lado ρ sin φ dθ · 4 volumen.
  D['c2s15-box'] = function (st) {
    var s = num(st, 's', 0), P = view3({ cx: 165, cy: 262, s: 62, az: -38, el: 24 }), body = '', pts = [];
    var r0 = 1.9, r1 = 2.7, t0 = 1.25, t1 = 2.05, p0 = 0.62, p1 = 0.95;
    var O = P([0, 0, 0]);
    [[[3.2, 0, 0], 'x'], [[0, 2.9, 0], 'y'], [[0, 0, 3.6], 'z']].forEach(function (e) {
      var t = P(e[0]), dx = t[0] - O[0], dy = t[1] - O[1], m = Math.hypot(dx, dy) || 1;
      body += arrow('axis', O[0], O[1], dx, dy, 1.6) + text(t[0] + dx / m * 14, t[1] + dy / m * 14 + 6, e[1], ' text-anchor="middle" font-size="17"');
      pts = pts.concat(arrowPts(O[0], O[1], dx, dy), segPts(t[0] + dx / m * 14 - 8, t[1] + dy / m * 14 - 6, t[0] + dx / m * 14 + 8, t[1] + dy / m * 14 + 6));
    });
    var Pp = P(c2s15S(r0, t0, p0)), foot = P(c2s15C(r0 * Math.sin(p0), t0, 0)), axisPt = P([0, 0, r0 * Math.cos(p0)]);
    // ρ: del origen a P; su sombra en el piso y la vertical.
    body += seg('aux', O[0], O[1], Pp[0], Pp[1], 2);
    body += seg('aux', O[0], O[1], foot[0], foot[1], 1.4, '5 4') + seg('aux', foot[0], foot[1], Pp[0], Pp[1], 1.4, '5 4');
    pts = pts.concat(segPts(O[0], O[1], Pp[0], Pp[1]), segPts(O[0], O[1], foot[0], foot[1]), segPts(foot[0], foot[1], Pp[0], Pp[1]));
    // Ángulos: φ desde el eje z y θ en el piso.
    var aPh = c2s15Path(P, c2s15S, [1.1, t0, 0], [1.1, t0, p0], 16), aTh = c2s15Path(P, c2s15C, [1.1, 0, 0], [1.1, t0, 0], 16);
    body += poly('axis', aPh, 1.6) + poly('axis', aTh, 1.6);
    pts = pts.concat(polyPts(aPh), polyPts(aTh));
    // La cajita: se ve de contorno desde el paso 1 y se rellena en el paso 4.
    var dB = clamp01(s - 3);
    if (dB > 0) body += fade(c2s15Cell(P, c2s15S, [r0, t0, p0], [r1, t1, p1], 'box-aux'), dB);
    // Aristas de la cajita (para que las etiquetas no las pisen).
    [[[r1, t0, p0], [r1, t1, p0]], [[r1, t0, p1], [r1, t1, p1]], [[r0, t0, p1], [r0, t1, p1]], [[r0, t1, p0], [r0, t1, p1]], [[r1, t0, p0], [r1, t0, p1]], [[r1, t1, p0], [r1, t1, p1]], [[r0, t1, p0], [r1, t1, p0]], [[r0, t0, p1], [r1, t0, p1]], [[r0, t1, p1], [r1, t1, p1]], [[r0, t1, p0], [r0, t1, p1]]].forEach(function (e) {
      pts = pts.concat(polyPts(c2s15Path(P, c2s15S, e[0], e[1], 12)));
    });
    var cR = clamp01(s), cM = clamp01(s - 1), cP = clamp01(s - 2);
    // Los tres lados se juntan en la esquina de afuera (ρ + dρ ≈ ρ): ahí se ven más largos.
    var eR = c2s15Path(P, c2s15S, [r0, t0, p0], [r1, t0, p0], 2), eM = c2s15Path(P, c2s15S, [r1, t0, p0], [r1, t0, p1], 16), eP = c2s15Path(P, c2s15S, [r1, t0, p0], [r1, t1, p0], 16);
    if (dB > 0) pts = pts.concat(polyPts(c2s15Path(P, c2s15S, [r0, t0, p0], [r0, t0, p1], 12)), polyPts(c2s15Path(P, c2s15S, [r0, t0, p0], [r0, t1, p0], 12)));
    if (cP > 0) {
      // El paralelo de radio ρ sin φ y su radio desde el eje z.
      var par = c2s15Path(P, c2s15S, [r0, 0, p0], [r0, Math.PI / 2, p0], 40);
      body += fade(poly('aux', par, 1.4, false, '5 4') + seg('aux', axisPt[0], axisPt[1], Pp[0], Pp[1], 1.6, '3 3'), cP);
      pts = pts.concat(polyPts(par), segPts(axisPt[0], axisPt[1], Pp[0], Pp[1]));
    }
    if (cR > 0) body += fade(poly('error', eR, 4), cR);
    if (cM > 0) body += fade(poly('trace', eM, 4), cM);
    if (cP > 0) body += fade(poly('student', eP, 4), cP);
    pts = pts.concat(polyPts(eR), polyPts(eM), polyPts(eP));
    body += dot('dot-trace', Pp[0], Pp[1], 5);
    pts = pts.concat(segPts(Pp[0] - 6, Pp[1], Pp[0] + 6, Pp[1]));
    var vb = [0, 0, 345, 350], fs = 16, cands;
    var mid = function (a) { return a[Math.floor(a.length / 2)]; };
    var mP = mid(aPh), mT = mid(aTh), mR = P(c2s15S(r0 * 0.45, t0, p0));
    var marks = [['φ', mP, 1], ['θ', mT, 1], ['ρ', mR, 1], ['P', Pp, 1], ['dρ', mid(eR), cR], ['ρ dφ', mid(eM), cM], ['ρ sin φ dθ', mid(eP), cP]];
    if (cP > 0) marks.push(['r', [(axisPt[0] + Pp[0]) / 2, (axisPt[1] + Pp[1]) / 2], cP]);
    marks.forEach(function (L) {
      if (L[2] <= 0.001) return;
      cands = around(L[1][0], L[1][1], L[0]).concat(around(L[1][0] + 40, L[1][1], L[0]).slice(32), around(L[1][0] - 40, L[1][1], L[0]).slice(32));
      var c = spot(cands, pts, fs, vb);
      body += fade(label(c, fs), L[2]);
      var w = String(c[2]).length * fs * 0.6, x0 = c[3] === 'end' ? c[0] - w : c[3] === 'middle' ? c[0] - w / 2 : c[0];
      pts = pts.concat(segPts(x0 - 2, c[1] - fs * 0.8, x0 + w + 2, c[1] - fs * 0.8), segPts(x0 - 2, c[1] + 2, x0 + w + 2, c[1] + 2), segPts(x0 - 2, c[1] - fs * 0.4, x0 + w + 2, c[1] - fs * 0.4));
    });
    body += c2s15Notes([
      ['P = (ρ, θ, φ)', 1],
      ['r = ρ sin φ: distancia al eje z', cP],
      ['lado radial: dρ', cR],
      ['lado del meridiano: ρ dφ', cM],
      ['lado del paralelo: ρ sin φ dθ', cP],
      ['dV = ρ² sin φ dρ dθ dφ', dB]
    ], 548, 40, 32, 16);
    return svgBox('0 0 560 350', 'Cajita esférica junto al punto P de coordenadas rho, theta y phi: un lado radial d rho, un lado sobre el meridiano rho d phi y un lado sobre el paralelo de radio rho sin phi, rho sin phi d theta; su volumen es rho cuadrada sin phi d rho d theta d phi.', body);
  };

  // S15 · La cajita cilíndrica: el rectángulo polar de S13 en el piso, levantado a una altura dz.
  D['c2s15-cyl'] = function () {
    var P = view3({ cx: 150, cy: 262, s: 52, az: -38, el: 22 }), body = '', pts = [];
    var r0 = 1.6, r1 = 2.7, t0 = 1.05, t1 = 1.75, z0 = 1.5, z1 = 2.5;
    var O = P([0, 0, 0]);
    [[[3.4, 0, 0], 'x'], [[0, 3.6, 0], 'y'], [[0, 0, 3.6], 'z']].forEach(function (e) {
      var t = P(e[0]), dx = t[0] - O[0], dy = t[1] - O[1], m = Math.hypot(dx, dy) || 1;
      body += arrow('axis', O[0], O[1], dx, dy, 1.6) + text(t[0] + dx / m * 14, t[1] + dy / m * 14 + 6, e[1], ' text-anchor="middle" font-size="17"');
      pts = pts.concat(arrowPts(O[0], O[1], dx, dy), segPts(t[0] + dx / m * 14 - 8, t[1] + dy / m * 14 - 6, t[0] + dx / m * 14 + 8, t[1] + dy / m * 14 + 6));
    });
    var base = c2s15Path(P, c2s15C, [r0, t0, 0], [r1, t0, 0], 4).concat(c2s15Path(P, c2s15C, [r1, t0, 0], [r1, t1, 0], 16), c2s15Path(P, c2s15C, [r1, t1, 0], [r0, t1, 0], 4), c2s15Path(P, c2s15C, [r0, t1, 0], [r0, t0, 0], 16));
    body += fill('area-fill', base) + poly('ref', base, 1.6, true, '5 4');
    pts = pts.concat(polyPts(base));
    [[r0, t0], [r1, t0], [r1, t1], [r0, t1]].forEach(function (q) {
      var a = P(c2s15C(q[0], q[1], 0)), b = P(c2s15C(q[0], q[1], z0));
      body += seg('aux', a[0], a[1], b[0], b[1], 1.2, '3 4');
      pts = pts.concat(segPts(a[0], a[1], b[0], b[1]));
    });
    body += c2s15Cell(P, c2s15C, [r0, t0, z0], [r1, t1, z1], 'box-aux');
    var eR = c2s15Path(P, c2s15C, [r0, t0, z0], [r1, t0, z0], 2), eT = c2s15Path(P, c2s15C, [r1, t0, z0], [r1, t1, z0], 16), eZ = c2s15Path(P, c2s15C, [r1, t0, z0], [r1, t0, z1], 2);
    body += poly('error', eR, 4) + poly('trace', eT, 4) + poly('student', eZ, 4);
    pts = pts.concat(polyPts(eR), polyPts(eT), polyPts(eZ));
    [[r0, r1], [t0, t1], [z0, z1]].forEach(function (rg, q) {               // las 12 aristas de la cajita
      [0, 1].forEach(function (i) { [0, 1].forEach(function (j) {
        var o = [0, 1, 2].filter(function (w) { return w !== q; }), lo = [r0, t0, z0], hi;
        lo[o[0]] = [[r0, r1], [t0, t1], [z0, z1]][o[0]][i]; lo[o[1]] = [[r0, r1], [t0, t1], [z0, z1]][o[1]][j];
        hi = lo.slice(); lo[q] = rg[0]; hi[q] = rg[1];
        pts = pts.concat(polyPts(c2s15Path(P, c2s15C, lo, hi, 12)));
      }); });
    });
    var fs = 16, vb = [0, 0, 340, 330];
    [['dr', eR[1]], ['r dθ', eT[8]], ['dz', eZ[1]]].forEach(function (L) {
      var c = spot(around(L[1][0], L[1][1], L[0]), pts, fs, vb);
      body += label(c, fs);
      var w = String(c[2]).length * fs * 0.6, x0 = c[3] === 'end' ? c[0] - w : c[3] === 'middle' ? c[0] - w / 2 : c[0];
      pts = pts.concat(segPts(x0 - 2, c[1] - fs * 0.8, x0 + w + 2, c[1] - fs * 0.8), segPts(x0 - 2, c[1] + 2, x0 + w + 2, c[1] + 2));
    });
    body += c2s15Notes([
      ['lado radial: dr', 1],
      ['arco: r dθ', 1],
      ['altura: dz', 1],
      ['base: r dr dθ, como en S13', 1],
      ['dV = r dr dθ dz', 1]
    ], 548, 50, 34, 16);
    return svgBox('0 0 560 330', 'Cajita en cilíndricas: su base es un rectángulo polar de área r dr d theta, igual que en la sesión 13, y su altura es dz; su volumen es r dr d theta dz.', body);
  };

  // S15 · Qué sistema conviene: una lata (cilíndricas), un cono de helado y una pelota (esféricas).
  D['c2s15-choose'] = function () {
    var body = '', W = 186;
    function ring(P, F, a, b, n) { return c2s15Path(P, F, a, b, n); }
    // Lata: cilindro r = 1.1, 0 ≤ z ≤ 2.4.
    var P1 = view3({ cx: W / 2, cy: 168, s: 46, az: -35, el: 22 });
    var bot = ring(P1, c2s15C, [1.1, 0, 0], [1.1, 2 * Math.PI, 0], 60), top = ring(P1, c2s15C, [1.1, 0, 2.4], [1.1, 2 * Math.PI, 2.4], 60);
    body += fill('area-fill', top) + poly('ref', top, 2) + poly('ref', bot, 2);
    var xs = bot.map(function (p) { return p[0]; }), il = xs.indexOf(Math.min.apply(null, xs)), ir = xs.indexOf(Math.max.apply(null, xs));
    body += seg('ref', bot[il][0], bot[il][1], top[il][0], top[il][1], 2) + seg('ref', bot[ir][0], bot[ir][1], top[ir][0], top[ir][1], 2);
    // Cono de helado: cono φ = π/5 hasta la esfera ρ = 2.6.
    var P2 = view3({ cx: W + W / 2, cy: 184, s: 46, az: -35, el: 22 }), al = Math.PI / 5, R = 2.45;
    var rim = ring(P2, c2s15S, [R, 0, al], [R, 2 * Math.PI, al], 60), O2 = P2([0, 0, 0]);
    var cap = ring(P2, c2s15S, [R, -Math.PI / 2 + 0.6, al], [R, -Math.PI / 2 + 0.6, 0], 14).concat(ring(P2, c2s15S, [R, Math.PI / 2 + 0.6, 0], [R, Math.PI / 2 + 0.6, al], 14));
    var rx = rim.map(function (p) { return p[0]; }), jl = rx.indexOf(Math.min.apply(null, rx)), jr = rx.indexOf(Math.max.apply(null, rx));
    body += fill('area-fill', rim) + poly('ref', rim, 2) + poly('ref', cap, 2);
    body += seg('ref', O2[0], O2[1], rim[jl][0], rim[jl][1], 2) + seg('ref', O2[0], O2[1], rim[jr][0], rim[jr][1], 2);
    // Pelota: esfera ρ = 1.4 (contorno, ecuador y un meridiano).
    var P3 = view3({ cx: 2 * W + W / 2, cy: 108, s: 46, az: -35, el: 22 });
    var c3 = P3([0, 0, 0]), rr = 1.4 * 46;
    var eq = ring(P3, c2s15S, [1.4, 0, Math.PI / 2], [1.4, 2 * Math.PI, Math.PI / 2], 60), me = ring(P3, c2s15S, [1.4, 0.4, 0], [1.4, 0.4, Math.PI], 40);
    var circ = []; for (var i = 0; i <= 60; i++) { var a = 2 * Math.PI * i / 60; circ.push([c3[0] + rr * Math.cos(a), c3[1] + rr * Math.sin(a)]); }
    body += fill('area-fill', circ) + poly('ref', circ, 2) + poly('aux', eq, 1.4, false, '5 4') + poly('aux', me, 1.4, false, '5 4');
    [[W / 2, 'lata'], [W + W / 2, 'cono de helado'], [2 * W + W / 2, 'pelota']].forEach(function (c, k) {
      body += text(c[0], 214, c[1], ' text-anchor="middle" font-size="16"');
      body += text(c[0], 238, k ? 'esféricas' : 'cilíndricas', ' text-anchor="middle" font-size="16" font-weight="600"');
    });
    return svgBox('0 0 560 252', 'Tres sólidos: una lata, que conviene en cilíndricas; un cono de helado y una pelota, que convienen en esféricas.', body);
  };

  // S15 · Cono de helado en el corte x–z: dentro de ρ = 2 y arriba del cono φ = π/4.
  D['c2s15-cone'] = function () {
    var k = 70, ox = 230, oy = 205, body = '';
    function Q(x, z) { return [ox + k * x, oy - k * z]; }
    var R = 2, a = Math.PI / 4, reg = [Q(0, 0)];
    for (var i = 0; i <= 40; i++) { var t = -a + 2 * a * i / 40; reg.push(Q(R * Math.sin(t), R * Math.cos(t))); }
    body += seg('axis', ox - 2.6 * k, oy, ox + 2.6 * k, oy, 1.6) + seg('axis', ox, oy + 12, ox, oy - 2.4 * k, 1.6);
    body += text(ox + 2.6 * k + 14, oy + 6, 'x', ' text-anchor="middle" font-size="17"') + text(ox + 14, oy - 2.4 * k + 12, 'z', ' text-anchor="middle" font-size="17"');
    var circ = []; for (var j = 0; j <= 60; j++) { var u = -Math.PI / 2 + Math.PI * j / 60; circ.push(Q(R * Math.sin(u), R * Math.cos(u))); }
    body += poly('aux', circ, 1.4, false, '5 4');
    body += fill('area-fill', reg) + poly('ref', reg, 2.6, true);
    body += seg('aux', Q(0, 0)[0], Q(0, 0)[1], Q(2.3 * Math.sin(a), 2.3 * Math.cos(a))[0], Q(2.3 * Math.sin(a), 2.3 * Math.cos(a))[1], 1.4, '5 4');
    var arcP = []; for (var m = 0; m <= 16; m++) { var w = a * m / 16; arcP.push(Q(0.7 * Math.sin(w), 0.7 * Math.cos(w))); }
    body += poly('error', arcP, 2.2);
    var lab = Q(0.42 * Math.sin(a / 2) + 0.02, 0.95 * Math.cos(a / 2));
    body += text(lab[0] + 4, lab[1] - 20, 'φ', ' text-anchor="start" font-size="17"');
    body += text(Q(-1.55, 1.75)[0], Q(-1.55, 1.75)[1], 'esfera ρ = 2', ' text-anchor="end" font-size="16"');
    body += text(Q(1.8, 1.5)[0], Q(1.8, 1.5)[1], 'cono φ = π/4', ' text-anchor="start" font-size="16"');
    body += text(Q(1.8, 1.5)[0], Q(1.8, 1.5)[1] + 22, 'z = √(x² + y²)', ' text-anchor="start" font-size="15"');
    return svgBox('0 0 520 250', 'Corte del cono de helado en el plano x z: la región entre el cono phi igual a pi cuartos y la esfera rho igual a 2.', body);
  };
  /* ══════════════════════ fin S15 ══════════════════════ */

  /* ══════════════════════ Examen ══════════════════════ */
  /* Figuras de los problemas de examen (data/calculo-2/exam-problems.js). Reciben los parámetros
     al azar del problema: todo se encuadra con c2exFit y las etiquetas se colocan con spot. */
  // Proyección que encuadra los puntos 3D en box = [x0, y0, x1, y1] (view3 es lineal en cx, cy, s).
  function c2exFit(pts3, box, az, el) {
    var P0 = view3({ cx: 0, cy: 0, s: 1, az: az, el: el }), xs = [], ys = [];
    pts3.forEach(function (p) { var q = P0(p); xs.push(q[0]); ys.push(q[1]); });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var s = Math.min((box[2] - box[0]) / Math.max(x1 - x0, 1e-6), (box[3] - box[1]) / Math.max(y1 - y0, 1e-6));
    var cx = (box[0] + box[2]) / 2 - s * (x0 + x1) / 2, cy = (box[1] + box[3]) / 2 - s * (y0 + y1) / 2;
    return { P: view3({ cx: cx, cy: cy, s: s, az: az, el: el }), s: s };
  }
  // Caja ocupada por una etiqueta ya puesta (para que las siguientes no la pisen).
  function c2exBox(c, fs) {
    var w = String(c[2]).length * fs * 0.6, a = c[3] || 'start', x0 = a === 'end' ? c[0] - w : a === 'middle' ? c[0] - w / 2 : c[0];
    var l = x0 - 3, r = x0 + w + 3, t = c[1] - fs * 0.85 - 2, b = c[1] + fs * 0.3 + 2;
    return segPts(l, t, r, t).concat(segPts(l, b, r, b), segPts(l, t, l, b), segPts(r, t, r, b), segPts(l, (t + b) / 2, r, (t + b) / 2));
  }
  // Pone cada etiqueta (lista de candidatos) en el primer lugar libre; devuelve el SVG.
  // ¿La etiqueta c cabe en vb sin tocar pts? (la misma prueba que spot).
  function c2exFree(c, pts, fs, vb) {
    // Caja con más holgura que la de spot: las letras de la fuente a mano son anchas.
    var w = String(c[2]).length * fs * 0.68, a = c[3] || 'start', x0 = a === 'end' ? c[0] - w : a === 'middle' ? c[0] - w / 2 : c[0];
    var l = x0 - 5, r = x0 + w + 5, t = c[1] - fs * 0.9 - 4, b = c[1] + fs * 0.3 + 4;
    if (l < vb[0] + 2 || r > vb[2] - 2 || t < vb[1] + 2 || b > vb[3] - 2) return false;
    return !pts.some(function (p) { return p[0] > l && p[0] < r && p[1] > t && p[1] < b; });
  }
  function c2exPlace(list, pts, fs, vb) {
    var o = '';
    list.forEach(function (cands) {
      var c = null;
      for (var j = 0; j < cands.length && !c; j++) if (c2exFree(cands[j], pts, fs, vb)) c = cands[j];
      if (!c) {
        c = cands[0];
        // Ningún candidato sirve: se busca más lejos, en anillos alrededor del primero.
        var x = cands[0][0], y = cands[0][1] - 5, s = cands[0][2], far = [];
        [64, 84, 108, 136].forEach(function (rr) { for (var i = 0; i < 24; i++) { var an = i * Math.PI / 12, cx = Math.cos(an); far.push([x + rr * cx, y + rr * Math.sin(an) + 5, s, cx > 0.3 ? 'start' : cx < -0.3 ? 'end' : 'middle']); } });
        for (var k = 0; k < far.length; k++) if (c2exFree(far[k], pts, fs, vb)) { c = far[k]; break; }
      }
      o += label(c, fs);
      pts.push.apply(pts, c2exBox(c, fs));
    });
    return o;
  }
  // Ejes con la parte negativa punteada. Lp, Ln: largo positivo y negativo de cada eje.
  // Agrega sus trazos a pts y los candidatos de la letra de cada eje a labs.
  function c2exAxes(P, Lp, Ln, pts, labs) {
    var o = '', O = P([0, 0, 0]), names = ['x', 'y', 'z'];
    [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(function (e, i) {
      var n = P([-e[0] * Ln[i], -e[1] * Ln[i], -e[2] * Ln[i]]), t = P([e[0] * Lp[i], e[1] * Lp[i], e[2] * Lp[i]]);
      var dx = t[0] - O[0], dy = t[1] - O[1], m = Math.hypot(dx, dy) || 1;
      o += seg('axis', n[0], n[1], O[0], O[1], 1.2, '4 5') + arrow('axis', O[0], O[1], dx, dy, 1.6);
      pts.push.apply(pts, segPts(n[0], n[1], O[0], O[1]).concat(arrowPts(O[0], O[1], dx, dy)));
      labs.push([[t[0] + dx / m * 15, t[1] + dy / m * 15 + 6, names[i], 'middle']].concat(around(t[0], t[1], names[i])));
    });
    return o;
  }
  function c2exRing(f, n) { var o = []; for (var i = 0; i <= n; i++) o.push(f(2 * Math.PI * i / n)); return o; }

  // Esfera de centro C = (h, k, l) y radio R, cortada por el plano z = c; el origen y el segmento OC.
  D['c2exam-esfera'] = function (s) {
    var h = num(s, 'h', 2), k = num(s, 'k', 3), l = num(s, 'l', 1), R = num(s, 'R', 2), c = num(s, 'c', 2);
    var C = [h, k, l], rc = Math.sqrt(Math.max(0, R * R - (c - l) * (c - l))), W = R + 1.4;
    // Giro de la vista: el primero en que el origen no cae dentro del contorno de la esfera.
    var az = -35, best = -1;
    [-35, -55, -15, -70, 20, 45].some(function (a) {
      var q = view3({ cx: 0, cy: 0, s: 1, az: a, el: 25 })(C), d = Math.hypot(q[0], q[1]);
      if (d > best) { best = d; az = a; }
      return d >= R + 1.2;
    });
    // Ejes: la punta de cada eje positivo queda fuera del contorno de la esfera (ahí va su letra).
    var V1 = view3({ cx: 0, cy: 0, s: 1, az: az }), C1 = V1(C);
    var Lp = C.map(function (q, i) {
      var L = Math.max(2, q + R + 1), e = [0, 0, 0];
      for (var t = 0; t < 40; t++) { e[i] = L; var p = V1(e); if (Math.hypot(p[0] - C1[0], p[1] - C1[1]) > R + 0.9) break; L += 0.4; }
      return L;
    });
    var Ln = C.map(function (q) { return Math.max(1, R - q + 0.6); });
    var box3 = [];
    [-1, 1].forEach(function (a) { [-1, 1].forEach(function (b) { [-1, 1].forEach(function (d) { box3.push([h + a * R, k + b * R, l + d * R]); }); box3.push([h + a * W, k + b * W, c]); }); });
    [0, 1, 2].forEach(function (i) { var e = [0, 0, 0], f = [0, 0, 0]; e[i] = Lp[i]; f[i] = -Ln[i]; box3.push(e, f); });
    var F = c2exFit(box3, [44, 34, 516, 326], az), P = F.P, pts = [], labs = [], o = '';
    // Plano z = c (solo relleno) y ejes.
    o += fill('area-fill', [[h - W, k - W, c], [h + W, k - W, c], [h + W, k + W, c], [h - W, k + W, c]].map(P));
    o += c2exAxes(P, Lp, Ln, pts, labs);
    // Contorno de la esfera (proyección ortogonal: un círculo de radio s·R) y su ecuador punteado.
    var Pc = P(C), out = c2exRing(function (t) { return [Pc[0] + F.s * R * Math.cos(t), Pc[1] + F.s * R * Math.sin(t)]; }, 72);
    o += poly('ref', out, 2.6);
    var eq = c2exRing(function (t) { return P([h + R * Math.cos(t), k + R * Math.sin(t), l]); }, 60);
    o += poly('aux', eq, 1.2, false, '4 5');
    var tr = c2exRing(function (t) { return P([h + rc * Math.cos(t), k + rc * Math.sin(t), c]); }, 60);
    o += poly('trace', tr, 3);
    var O = P([0, 0, 0]);
    o += seg('aux', O[0], O[1], Pc[0], Pc[1], 2, '6 5');
    o += dot('dot-ref', Pc[0], Pc[1], 4.5) + dot('dot-ref', O[0], O[1], 4.5);
    pts.push.apply(pts, polyPts(out).concat(polyPts(eq), polyPts(tr), segPts(O[0], O[1], Pc[0], Pc[1]), [Pc, O]));
    // Etiquetas: centro, origen, el plano; al final las letras de los ejes.
    var corner = P([h + W, k + W, c]), corner2 = P([h - W, k + W, c]), corner3 = P([h + W, k - W, c]), zc = 'z = ' + c;
    var vb = [0, 0, 560, 360], corner4 = P([h - W, k - W, c]);
    o += c2exPlace([around(Pc[0], Pc[1], 'C'), around(O[0], O[1], 'O')], pts, 18, vb);
    // El resto, fuera del contorno de la esfera: se rellena el disco con puntos ocupados.
    for (var gx = -1; gx <= 1; gx += 0.08) for (var gy = -1; gy <= 1; gy += 0.08) if (gx * gx + gy * gy < 1) pts.push([Pc[0] + F.s * R * gx, Pc[1] + F.s * R * gy]);
    var zl = [];
    [corner, corner3, corner2, corner4].forEach(function (q) { zl = zl.concat(around(q[0], q[1], zc)); });
    o += c2exPlace(labs.concat([zl]), pts, 18, vb);
    return svgBox('0 0 560 360', 'Esfera de centro C cortada por el plano horizontal z = ' + c + ': la traza es una circunferencia. El segmento punteado une el origen O con el centro.', o);
  };

  // Un punto P(x, y, z) con r y θ en el piso, la altura, ρ y φ. Con state.Q, otro punto Q y el segmento PQ.
  D['c2exam-punto'] = function (s) {
    var X = num(s, 'x', 2), Y = num(s, 'y', 3), Z = num(s, 'z', 2), Q = s && s.Q;
    var Pp = [X, Y, Z], r = Math.hypot(X, Y), rho = Math.hypot(r, Z), th = Math.atan2(Y, X), ph = Math.acos(Z / (rho || 1));
    if (th < 0) th += 2 * Math.PI;
    var Lp = [0, 1, 2].map(function (i) { return Math.max(1.8, Pp[i] + 1.2, Q ? Q[i] + 1.2 : 0); });
    var Ln = [0, 1, 2].map(function (i) { return Math.max(1.2, -Pp[i] + 0.8, Q ? -Q[i] + 0.8 : 0); });
    var box3 = [Pp, [X, Y, 0]];
    if (Q) box3.push(Q);
    [0, 1, 2].forEach(function (i) { var e = [0, 0, 0], f = [0, 0, 0]; e[i] = Lp[i]; f[i] = -Ln[i]; box3.push(e, f); });
    // Giro de la vista: el primero en que r (en el piso) no se ve encimado con el eje z y, si hay Q,
    // el segmento PQ no se ve encimado con ρ (Q lejos de la recta OP en pantalla).
    var az = -35, best = -1;
    [-35, -55, -15, -75, 5, 25].some(function (a) {
      var d = Math.abs(X * Math.sin(a * RAD) + Y * Math.cos(a * RAD)) / (r || 1) / 0.6;
      if (Q) {
        var V0 = view3({ cx: 0, cy: 0, s: 1, az: a }), p2 = V0(Pp), q2 = V0(Q), L2 = Math.hypot(p2[0], p2[1]) || 1;
        d = Math.min(d, Math.abs(p2[0] * q2[1] - p2[1] * q2[0]) / L2 / 1.2, Math.abs(q2[0] - p2[0]) / 0.8);
      }
      if (d > best) { best = d; az = a; }
      return d >= 1;
    });
    var F = c2exFit(box3, [40, 34, 520, 326], az), P = F.P, pts = [], labs = [], o = '';
    o += c2exAxes(P, Lp, Ln, pts, labs);
    var O = P([0, 0, 0]), Fp = P([X, Y, 0]), PP = P(Pp), gx = P([X, 0, 0]), gy = P([0, Y, 0]);
    o += seg('axis', Fp[0], Fp[1], gx[0], gx[1], 1.1, '3 4') + seg('axis', Fp[0], Fp[1], gy[0], gy[1], 1.1, '3 4');
    pts.push.apply(pts, segPts(Fp[0], Fp[1], gx[0], gx[1]).concat(segPts(Fp[0], Fp[1], gy[0], gy[1])));
    // r y θ en el plano xy.
    var ra = Math.min(1, 0.45 * r), arcT = [];
    for (var i = 0; i <= 40; i++) { var t = th * i / 40; arcT.push(P([ra * Math.cos(t), ra * Math.sin(t), 0])); }
    o += seg('aux', O[0], O[1], Fp[0], Fp[1], 3) + poly('aux', arcT, 2);
    // Altura, ρ y φ (desde el eje z positivo).
    var rf = Math.min(1.2, 0.4 * rho), arcF = [];
    for (var j = 0; j <= 40; j++) { var f = ph * j / 40; arcF.push(P([rf * Math.sin(f) * Math.cos(th), rf * Math.sin(f) * Math.sin(th), rf * Math.cos(f)])); }
    o += seg('trace', Fp[0], Fp[1], PP[0], PP[1], 2.6, '7 5') + seg('ref', O[0], O[1], PP[0], PP[1], 3.2) + poly('ref', arcF, 2);
    pts.push.apply(pts, segPts(O[0], O[1], Fp[0], Fp[1]).concat(polyPts(arcT), segPts(Fp[0], Fp[1], PP[0], PP[1]), segPts(O[0], O[1], PP[0], PP[1]), polyPts(arcF)));
    var list = [around(PP[0], PP[1], 'P')], Qs;
    if (Q) {
      Qs = P(Q);
      o += seg('error', PP[0], PP[1], Qs[0], Qs[1], 2.4, '8 5') + dot('dot-aux', Qs[0], Qs[1], 5.5);
      pts.push.apply(pts, segPts(PP[0], PP[1], Qs[0], Qs[1]).concat([Qs]));
      list.push(around(Qs[0], Qs[1], 'Q'));
    }
    o += dot('dot-ref', PP[0], PP[1], 5.5) + dot('dot-ref', O[0], O[1], 3.5);
    pts.push(PP);
    var mR = P([X / 2, Y / 2, 0]), mP = P([X / 2, Y / 2, Z / 2]);
    var tT = P([(ra + 0.3) * Math.cos(th / 2), (ra + 0.3) * Math.sin(th / 2), 0]);
    var tF = P([(rf + 0.3) * Math.sin(ph / 2) * Math.cos(th), (rf + 0.3) * Math.sin(ph / 2) * Math.sin(th), (rf + 0.3) * Math.cos(ph / 2)]);
    list.push(around(mR[0], mR[1], 'r'), [[tT[0], tT[1] + 6, 'θ', 'middle']].concat(around(tT[0], tT[1], 'θ')),
      around(mP[0], mP[1], 'ρ'), [[tF[0], tF[1] + 6, 'φ', 'middle']].concat(around(tF[0], tF[1], 'φ')));
    if (Q) { var mQ = [(PP[0] + Qs[0]) / 2, (PP[1] + Qs[1]) / 2]; list.push(around(mQ[0], mQ[1], 'd')); }
    o += c2exPlace(list.concat(labs), pts, 19, [0, 0, 560, 360]);
    return svgBox('0 0 560 360', 'El punto P con su distancia r al eje z y su ángulo θ en el piso, la altura, la distancia ρ al origen y el ángulo φ desde el eje z' + (Q ? '; el segmento d une P con Q.' : '.'), o);
  };

  // Superficie z = p x² y + q y² cerca de (a, b) y su plano tangente en P (escala vertical ajustada).
  D['c2exam-plano'] = function (s) {
    var p = num(s, 'p', 1), q = num(s, 'q', 1), a = num(s, 'a', 1), b = num(s, 'b', 1);
    var f = function (x, y) { return p * x * x * y + q * y * y; }, f0 = f(a, b), fx = 2 * p * a * b, fy = p * a * a + 2 * q * b;
    var n = 8, zmin = Infinity, zmax = -Infinity, i, j;
    for (i = 0; i <= n; i++) for (j = 0; j <= n; j++) { var zz = f(a - 1 + 2 * i / n, b - 1 + 2 * j / n) - f0; zmin = Math.min(zmin, zz); zmax = Math.max(zmax, zz); }
    var kz = 1.8 / Math.max(zmax - zmin, 1e-6), T = 0.7;
    var S = function (X, Y) { return [X, Y, kz * (f(a + X, b + Y) - f0)]; };
    var Tp = function (X, Y) { return [X, Y, kz * (fx * X + fy * Y)]; };
    var box3 = [];
    for (i = 0; i <= n; i++) for (j = 0; j <= n; j++) box3.push(S(-1 + 2 * i / n, -1 + 2 * j / n));
    [[-T, -T], [T, -T], [T, T], [-T, T]].forEach(function (c) { box3.push(Tp(c[0], c[1])); });
    // Vista: el plano tangente ni de canto ni de frente. c = |n · d| (normal unitaria contra la
    // dirección hacia quien mira) cerca de 0.45; a igualdad, lo más parecido a la vista de siempre.
    var nx = -kz * fx, ny = -kz * fy, nn = Math.hypot(nx, ny, 1), az = -35, el = 30, bestS = Infinity;
    [30, 45, 18].forEach(function (e) {
      [-35, -55, -15, -75, 5, -100, 30, -125, 60, -150, 95, 180, 130].forEach(function (a) {
        var ce = Math.cos(e * RAD), d = [ce * Math.cos(a * RAD), -ce * Math.sin(a * RAD), Math.sin(e * RAD)];
        var c = Math.abs(nx * d[0] + ny * d[1] + d[2]) / nn, sc = Math.abs(c - 0.45) + 0.0015 * Math.abs(a + 35) + 0.004 * Math.abs(e - 30);
        if (sc < bestS) { bestS = sc; az = a; el = e; }
      });
    });
    var F = c2exFit(box3, [190, 26, 540, 334], az, el), P = F.P, pts = [], o = '';
    // Malla de la superficie.
    for (i = 0; i <= 6; i++) {
      var u = -1 + 2 * i / 6, lx = [], ly = [];
      for (j = 0; j <= 24; j++) { var w = -1 + 2 * j / 24; lx.push(P(S(u, w))); ly.push(P(S(w, u))); }
      var edge = i === 0 || i === 6;
      o += poly('ref', lx, edge ? 2.4 : 1.2) + poly('ref', ly, edge ? 2.4 : 1.2);
      pts.push.apply(pts, polyPts(lx).concat(polyPts(ly)));
    }
    // Plano tangente.
    var quad = [[-T, -T], [T, -T], [T, T], [-T, T]].map(function (c) { return P(Tp(c[0], c[1])); });
    o += fill('area-fill', quad) + poly('aux', quad, 2.4, true);
    pts.push.apply(pts, polyPts(quad.concat([quad[0]])));
    var P0 = P([0, 0, 0]);
    o += dot('dot-error', P0[0], P0[1], 6);
    pts.push(P0);
    // Leyenda a la izquierda y la terna de ejes abajo.
    o += seg('ref', 18, 40, 46, 40, 2.4) + text(54, 46, 'superficie', ' font-size="17"');
    o += fill('area-fill', [[18, 64], [46, 64], [46, 80], [18, 80]]) + poly('aux', [[18, 64], [46, 64], [46, 80], [18, 80]], 2, true) + text(54, 78, 'plano tangente', ' font-size="17"');
    var V = view3({ cx: 0, cy: 0, s: 42, az: az, el: el }), bx = 84, by = 286;
    [[1, 0, 0, 'x'], [0, 1, 0, 'y'], [0, 0, 1, 'z']].forEach(function (e) {
      var d = V(e), m = Math.hypot(d[0], d[1]) || 1;
      o += arrow('axis', bx, by, d[0], d[1], 1.6) + text(bx + d[0] + d[0] / m * 13, by + d[1] + d[1] / m * 13 + 6, e[3], ' text-anchor="middle" font-size="17"');
    });
    // El punto va en la leyenda: dentro de la malla no hay lugar libre para su letra.
    o += dot('dot-error', 32, 96, 6) + text(54, 102, 'punto P', ' font-size="17"');
    return svgBox('0 0 560 360', 'La superficie z = f(x, y) cerca del punto P y su plano tangente, que la toca en P.', o);
  };

  // Embudo cónico (vértice abajo) de radio r y altura h, con sus cotas.
  D['c2exam-cono'] = function (s) {
    var r = num(s, 'r', 6), h = num(s, 'h', 12), k = Math.min(150 / r, 220 / h);
    var cx = 300, rx = r * k, ry = Math.max(10, rx * 0.26), top = 30 + ry + 26, ap = top + h * k, o = '', pts = [];
    var rim = c2exRing(function (t) { return [cx + rx * Math.cos(t), top + ry * Math.sin(t)]; }, 72);
    o += fill('box-aux', [[cx - rx, top], [cx + rx, top], [cx, ap]]);
    o += poly('ref', rim, 2.6) + seg('ref', cx - rx, top, cx, ap, 2.6) + seg('ref', cx + rx, top, cx, ap, 2.6);
    o += seg('axis', cx, top, cx, ap, 1.3, '5 5') + seg('axis', cx, top, cx + rx, top, 1.8) + dot('dot-ref', cx, top, 3.5);
    pts.push.apply(pts, polyPts(rim).concat(segPts(cx - rx, top, cx, ap), segPts(cx + rx, top, cx, ap), segPts(cx, top, cx, ap), segPts(cx, top, cx + rx, top)));
    // Cota de la altura, a la izquierda.
    var hx = cx - rx - 26;
    o += seg('axis', hx, top, hx, ap, 1.4) + seg('axis', hx - 6, top, hx + 6, top, 1.4) + seg('axis', hx - 6, ap, hx + 6, ap, 1.4);
    o += seg('axis', hx + 8, ap, cx - 8, ap, 1, '3 4');
    pts.push.apply(pts, segPts(hx, top, hx, ap).concat(segPts(hx - 6, top, hx + 6, top), segPts(hx - 6, ap, hx + 6, ap), segPts(hx + 8, ap, cx - 8, ap)));
    var lr = 'r = ' + r + ' cm', lh = 'h = ' + h + ' cm', my = (top + ap) / 2;
    o += c2exPlace([
      [[cx + rx / 2, top - ry - 10, lr, 'middle'], [cx + rx + 12, top + 6, lr], [cx + rx / 2, top + ry + 22, lr, 'middle']].concat(around(cx + rx, top, lr)),
      [[hx - 10, my + 6, lh, 'end'], [hx + 10, my + 6, lh], [cx + rx * 0.6 + 14, my + 6, lh]].concat(around(hx, my, lh)),
      [[548, 40, 'V = πr²h/3', 'end'], [548, 330, 'V = πr²h/3', 'end'], [12, 330, 'V = πr²h/3']]
    ], pts, 18, [0, 0, 560, 360]);
    return svgBox('0 0 560 360', 'Embudo cónico con la boca arriba: radio r = ' + r + ' cm y altura h = ' + h + ' cm.', o);
  };

  /* ---------- Bloque B ---------- */
  // Segmentos de la curva de nivel G = c en una malla (nx + 1) × (ny + 1) (cuadrados marchantes);
  // P(i, j) lleva índices de la malla (fraccionarios) a pantalla.
  function c2exIso(G, nx, ny, c, P) {
    var out = [];
    for (var i = 0; i < nx; i++) for (var j = 0; j < ny; j++) {
      var q = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], hit = [];
      for (var e = 0; e < 4; e++) {
        var p = q[e], r = q[(e + 1) % 4], a = G[p[0]][p[1]] - c, b = G[r[0]][r[1]] - c;
        if ((a < 0) !== (b < 0)) { var t = a / (a - b); hit.push(P(p[0] + t * (r[0] - p[0]), p[1] + t * (r[1] - p[1]))); }
      }
      if (hit.length === 2) out.push(hit);
      else if (hit.length === 4) out.push([hit[0], hit[1]], [hit[2], hit[3]]);
    }
    return out;
  }
  function c2exSegsD(list) { return list.map(function (s) { return 'M' + r1(s[0][0]) + ' ' + r1(s[0][1]) + 'L' + r1(s[1][0]) + ' ' + r1(s[1][1]); }).join(''); }
  // Pone cada etiqueta solo si cabe libre (si no, la omite): marcas de los ejes.
  function c2exTry(list, pts, fs, vb) {
    var o = '';
    list.forEach(function (c) { if (c2exFree(c, pts, fs, vb)) { o += label(c, fs); pts.push.apply(pts, c2exBox(c, fs)); } });
    return o;
  }

  // Mapa de curvas de nivel de f en la ventana s.x × s.y (misma escala en x y en y): la curva de nivel
  // s.hl gruesa, otras delgadas (salvo s.only), puntos con su letra, segmentos punteados y una leyenda a la derecha.
  // s = { f, x: [a, b], y: [c, d], hl, only, pts: [{ x, y, label }], segs: [{ a: [x, y], b: [x, y], label }], hlLabel, otherLabel, label }
  D['c2exam-mapa'] = function (s) {
    s = s || {};
    var f = typeof s.f === 'function' ? s.f : function (x, y) { return x * x + y * y; };
    var PB = [14, 14, 380, 346], xa = (s.x || [-3, 3])[0], xb = (s.x || [-3, 3])[1], ya = (s.y || [-3, 3])[0], yb = (s.y || [-3, 3])[1];
    var k = Math.min((PB[2] - PB[0]) / (xb - xa), (PB[3] - PB[1]) / (yb - ya)), cx = (xa + xb) / 2, cy = (ya + yb) / 2;
    xa = cx - (PB[2] - PB[0]) / (2 * k); xb = cx + (PB[2] - PB[0]) / (2 * k); ya = cy - (PB[3] - PB[1]) / (2 * k); yb = cy + (PB[3] - PB[1]) / (2 * k);
    var X = function (x) { return PB[0] + (x - xa) * k; }, Y = function (y) { return PB[3] - (y - ya) * k; };
    var nx = 64, ny = Math.round(nx * (yb - ya) / (xb - xa)), hx = (xb - xa) / nx, hy = (yb - ya) / ny, G = [], lo = Infinity, hi = -Infinity, i, j;
    for (i = 0; i <= nx; i++) { G.push([]); for (j = 0; j <= ny; j++) { var g = f(xa + i * hx, ya + j * hy); G[i].push(g); lo = Math.min(lo, g); hi = Math.max(hi, g); } }
    var toS = function (a, b) { return [X(xa + a * hx), Y(ya + b * hy)]; };
    var o = '', pts = [], hl = typeof s.hl === 'number' ? s.hl : (lo + hi) / 2;
    // Ejes (si pasan por la ventana) con marcas en los enteros.
    var x0 = X(0), y0 = Y(0), st = Math.max(1, Math.ceil((xb - xa) / 9)), tl = [];
    if (xa < 0 && xb > 0) { o += seg('axis', x0, PB[1], x0, PB[3], 1.2); pts.push.apply(pts, segPts(x0, PB[1], x0, PB[3])); }
    if (ya < 0 && yb > 0) { o += seg('axis', PB[0], y0, PB[2], y0, 1.2); pts.push.apply(pts, segPts(PB[0], y0, PB[2], y0)); }
    if (ya < 0 && yb > 0) for (i = Math.ceil(xa / st) * st; i <= xb; i += st) if (i) { o += seg('axis', X(i), y0 - 4, X(i), y0 + 4, 1.2); tl.push([X(i), y0 + 19, String(i).replace('-', '−'), 'middle']); }
    if (xa < 0 && xb > 0) for (j = Math.ceil(ya / st) * st; j <= yb; j += st) if (j) { o += seg('axis', x0 - 4, Y(j), x0 + 4, Y(j), 1.2); tl.push([x0 - 8, Y(j) + 5, String(j).replace('-', '−'), 'end']); }
    // Curvas de nivel: la de s.hl y, salvo only, otras repartidas en el rango de f.
    if (!s.only && hi > lo) {
      var step = (hi - lo) / 6, others = [];
      for (var m = -6; m <= 6; m++) { var c = hl + m * step; if (m && c > lo + step * 0.3 && c < hi - step * 0.3) others.push(c); }
      var os = [];
      others.forEach(function (c) { os = os.concat(c2exIso(G, nx, ny, c, toS)); });
      o += '<path class="aux" fill="none" stroke-width="1.4" stroke-linecap="round" d="' + c2exSegsD(os) + '"/>';
      os.forEach(function (q) { pts.push(q[0], q[1], [(q[0][0] + q[1][0]) / 2, (q[0][1] + q[1][1]) / 2]); });
    }
    var hs = c2exIso(G, nx, ny, hl, toS);
    o += '<path class="ref" fill="none" stroke-width="3" stroke-linecap="round" d="' + c2exSegsD(hs) + '"/>';
    hs.forEach(function (q) { pts.push(q[0], q[1], [(q[0][0] + q[1][0]) / 2, (q[0][1] + q[1][1]) / 2]); });
    (s.segs || []).forEach(function (q) {
      var A = [X(q.a[0]), Y(q.a[1])], B = [X(q.b[0]), Y(q.b[1])];
      o += seg('error', A[0], A[1], B[0], B[1], 2.6, '8 6');
      pts.push.apply(pts, segPts(A[0], A[1], B[0], B[1]));
    });
    o += poly('axis', [[PB[0], PB[1]], [PB[2], PB[1]], [PB[2], PB[3]], [PB[0], PB[3]]], 1.2, true);
    pts.push.apply(pts, polyPts([[PB[0], PB[1]], [PB[2], PB[1]], [PB[2], PB[3]], [PB[0], PB[3]], [PB[0], PB[1]]]));
    var labs = [];
    (s.pts || []).forEach(function (p) {
      var q = [X(p.x), Y(p.y)];
      o += dot('dot-ref', q[0], q[1], 5.5);
      pts.push(q, [q[0] - 5, q[1]], [q[0] + 5, q[1]], [q[0], q[1] - 5], [q[0], q[1] + 5]);
      if (p.label) labs.push(around(q[0], q[1], p.label));
    });
    // Leyenda a la derecha.
    var ly = 48, leg = [];
    leg.push(['ref', 3, null, s.hlLabel || 'nivel de P']);
    if (!s.only) leg.push(['aux', 1.4, null, s.otherLabel || 'otros niveles']);
    (s.segs || []).forEach(function (q) { if (q.label) leg.push(['error', 2.6, '8 6', q.label]); });
    leg.forEach(function (e) { o += seg(e[0], 394, ly - 6, 422, ly - 6, e[1], e[2]) + text(430, ly, e[3], ' font-size="16"'); ly += 32; });
    var vbP = [2, 0, PB[2] + 4, 360];
    o += c2exPlace(labs, pts, 18, vbP);
    // Letras de los ejes y marcas: solo si caben libres dentro del mapa.
    var inB = [PB[0], PB[1], PB[2], PB[3]], first = function (cands) {
      for (var q = 0; q < cands.length; q++) if (c2exFree(cands[q], pts, 17, inB)) return c2exTry([cands[q]], pts, 17, inB);
      return '';
    };
    if (ya < 0 && yb > 0) o += first([[PB[2] - 8, y0 - 8, 'x', 'end'], [PB[2] - 8, y0 + 22, 'x', 'end'], [PB[2] - 40, y0 - 8, 'x', 'end'], [PB[2] - 40, y0 + 22, 'x', 'end']]);
    if (xa < 0 && xb > 0) o += first([[x0 + 8, PB[1] + 20, 'y'], [x0 - 8, PB[1] + 20, 'y', 'end'], [x0 + 8, PB[1] + 48, 'y'], [x0 - 8, PB[1] + 48, 'y', 'end']]);
    o += c2exTry(tl, pts, 13, inB);
    return svgBox('0 0 560 360', s.label || 'Mapa de curvas de nivel.', o);
  };

  function c2exCross(u, v) { return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; }
  function c2exUnit(u) { var L = Math.hypot(u[0], u[1], u[2]) || 1; return [u[0] / L, u[1] / L, u[2] / L]; }
  function c2exAdd(p, u, t) { return [p[0] + t * u[0], p[1] + t * u[1], p[2] + t * u[2]]; }

  // El plano a x + b y + z = c corta al cilindro x² + y² = R² en una elipse; sus puntos más alto y más bajo.
  D['c2exam-plano-cil'] = function (s) {
    var a = num(s, 'a', 1), b = num(s, 'b', 1), c = num(s, 'c', 4), R = num(s, 'R', 2), N = Math.hypot(a, b) || 1;
    var zp = function (x, y) { return c - a * x - b * y; }, top = [-R * a / N, -R * b / N], hi = c + R * N, lo = c - R * N;
    var zb = Math.min(0, lo) - 0.6, zt = Math.max(0, hi) + 0.6, el = 20;
    // Giro: que el punto más alto y el más bajo no queden sobre el eje z en pantalla y que el plano
    // no se vea de canto (la elipse sería una raya).
    var az = -35, best = -1, nn = Math.hypot(a, b, 1);
    [-35, -55, -15, -75, 5, 25, 45, -100, 65, -125, 90, 120, 150, 180, -150].some(function (g) {
      var d = Math.abs(top[0] * Math.sin(g * RAD) + top[1] * Math.cos(g * RAD)) / R;
      var ce = Math.cos(el * RAD), cs = Math.abs(a * ce * Math.cos(g * RAD) - b * ce * Math.sin(g * RAD) + Math.sin(el * RAD)) / nn;
      var sc = Math.min(d / 0.6, cs / 0.3);
      if (sc > best) { best = sc; az = g; }
      return sc >= 1;
    });
    var Lp = [R + 1.4, R + 1.4, zt + 0.8], Ln = [0.5, 0.5, Math.max(0.6, -zb + 0.3)], box3 = [];
    for (var i = 0; i < 24; i++) { var t = i * Math.PI / 12; box3.push([R * Math.cos(t), R * Math.sin(t), zb], [R * Math.cos(t), R * Math.sin(t), zt]); }
    [0, 1, 2].forEach(function (q) { var e = [0, 0, 0], g = [0, 0, 0]; e[q] = Lp[q]; g[q] = -Ln[q]; box3.push(e, g); });
    var F = c2exFit(box3, [40, 30, 520, 332], az, el), P = F.P, pts = [], labs = [], o = '';
    var sa = Math.sin(az * RAD), ca = Math.cos(az * RAD);
    var ringB = c2exRing(function (t) { return P([R * Math.cos(t), R * Math.sin(t), zb]); }, 72);
    var ringT = c2exRing(function (t) { return P([R * Math.cos(t), R * Math.sin(t), zt]); }, 72);
    var E = c2exRing(function (t) { var x = R * Math.cos(t), y = R * Math.sin(t); return P([x, y, zp(x, y)]); }, 96);
    o += fill('area-fill', E);
    o += c2exAxes(P, Lp, Ln, pts, labs);
    o += poly('aux', ringB, 1.4, false, '5 5') + poly('aux', ringT, 1.6);
    pts.push.apply(pts, polyPts(ringB).concat(polyPts(ringT)));
    [1, -1].forEach(function (sg) {
      var A = P([sg * R * sa, sg * R * ca, zb]), B = P([sg * R * sa, sg * R * ca, zt]);
      o += seg('aux', A[0], A[1], B[0], B[1], 1.6);
      pts.push.apply(pts, segPts(A[0], A[1], B[0], B[1]));
    });
    o += poly('trace', E, 3);
    pts.push.apply(pts, polyPts(E));
    var H = P([top[0], top[1], hi]), Lo = P([-top[0], -top[1], lo]);
    o += dot('dot-error', H[0], H[1], 6) + dot('dot-ref', Lo[0], Lo[1], 6);
    pts.push(H, Lo);
    o += c2exPlace([around(H[0], H[1], 'máx'), around(Lo[0], Lo[1], 'mín')].concat(labs), pts, 18, [0, 0, 560, 360]);
    return svgBox('0 0 560 360', 'El cilindro de eje z y la elipse donde lo corta el plano inclinado, con su punto más alto (máx) y su punto más bajo (mín).', o);
  };

  // Los planos x + y + k z = c1 y x − y = c2 se cortan en una recta; M es su punto más cercano al origen O.
  D['c2exam-recta'] = function (s) {
    var k = num(s, 'k', 1), c1 = num(s, 'c1', 4), c2 = num(s, 'c2', 1);
    var n1 = [1, 1, k], n2 = [1, -1, 0], lam = 2 * c1 / (2 + k * k), M = [(lam + c2) / 2, (lam - c2) / 2, k * lam / 2];
    var u = c2exUnit(c2exCross(n1, n2)), v1 = c2exUnit(c2exCross(n1, u)), v2 = c2exUnit(c2exCross(n2, u));
    var T = 2.6, W = 1.3, dM = Math.hypot(M[0], M[1], M[2]) || 1;
    var A0 = c2exAdd(M, u, -T), A1 = c2exAdd(M, u, T);
    var patch = function (w) { return [c2exAdd(c2exAdd(M, u, -T), w, -W), c2exAdd(c2exAdd(M, u, T), w, -W), c2exAdd(c2exAdd(M, u, T), w, W), c2exAdd(c2exAdd(M, u, -T), w, W)]; };
    var p1 = patch(v1), p2 = patch(v2), all = p1.concat(p2, [A0, A1, M, [0, 0, 0]]);
    var Lp = [0, 1, 2].map(function (q) { return Math.max(1.5, Math.max.apply(null, all.map(function (p) { return p[q]; })) + 0.6); });
    var Ln = [0, 1, 2].map(function (q) { return Math.max(0.8, -Math.min.apply(null, all.map(function (p) { return p[q]; })) + 0.4); });
    var box3 = all.slice();
    [0, 1, 2].forEach(function (q) { var e = [0, 0, 0], g = [0, 0, 0]; e[q] = Lp[q]; g[q] = -Ln[q]; box3.push(e, g); });
    // Giro: el segmento OM bien visible (no de frente) y lejos de los ejes en pantalla.
    var az = -35, best = -1;
    [-35, -55, -15, -75, 5, 25, 45, 65, -100, -125, 90, 120, 150, 180, -150].some(function (g) {
      var V0 = view3({ cx: 0, cy: 0, s: 1, az: g }), q = V0(M), d = Math.hypot(q[0], q[1]) / dM, am = 180;
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(function (e) {
        var w = V0(e), c = Math.abs(w[0] * q[0] + w[1] * q[1]) / ((Math.hypot(w[0], w[1]) || 1) * (Math.hypot(q[0], q[1]) || 1));
        am = Math.min(am, Math.acos(Math.min(1, c)) / RAD);
      });
      // …y la recta no se ve encimada con OM (en 3D son perpendiculares; en pantalla, que lo parezcan).
      var w = V0(u), cu = Math.abs(w[0] * q[0] + w[1] * q[1]) / ((Math.hypot(w[0], w[1]) || 1e-9) * (Math.hypot(q[0], q[1]) || 1e-9));
      var sc = Math.min(d / 0.85, am / 20, Math.acos(Math.min(1, cu)) / RAD / 50);
      if (sc > best) { best = sc; az = g; }
      return sc >= 1;
    });
    var F = c2exFit(box3, [40, 30, 520, 332], az), P = F.P, pts = [], labs = [], o = '';
    // Los dos planos, solo con relleno: donde se enciman se ve más oscuro, a lo largo de la recta.
    [p1, p2].forEach(function (pp) { o += fill('area-fill', pp.map(P)); });
    o += c2exAxes(P, Lp, Ln, pts, labs);
    var a0 = P(A0), a1 = P(A1), O = P([0, 0, 0]), Ms = P(M);
    o += seg('trace', a0[0], a0[1], a1[0], a1[1], 3.2);
    o += seg('error', O[0], O[1], Ms[0], Ms[1], 2.6, '8 5');
    o += dot('dot-ref', O[0], O[1], 4.5) + dot('dot-error', Ms[0], Ms[1], 6);
    pts.push.apply(pts, segPts(a0[0], a0[1], a1[0], a1[1]).concat(segPts(O[0], O[1], Ms[0], Ms[1]), [O, Ms]));
    var mid = [(O[0] + Ms[0]) / 2, (O[1] + Ms[1]) / 2];
    o += c2exPlace([around(Ms[0], Ms[1], 'M'), around(O[0], O[1], 'O'), around(mid[0], mid[1], 'd')].concat(labs), pts, 18, [0, 0, 560, 360]);
    return svgBox('0 0 560 360', 'Dos planos que se cortan en una recta; el segmento d une el origen O con M, el punto de la recta más cercano a O.', o);
  };


  /* ══════════════════════ fin Examen ══════════════════════ */
})();
