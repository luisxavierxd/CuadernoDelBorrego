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

  /* ══════════════════════ fin S06 ══════════════════════ */

  /* ══════════════════════ S07 ══════════════════════ */

  /* ══════════════════════ fin S07 ══════════════════════ */

  /* ══════════════════════ S08 ══════════════════════ */

  /* ══════════════════════ fin S08 ══════════════════════ */

  /* ══════════════════════ S09 ══════════════════════ */

  /* ══════════════════════ fin S09 ══════════════════════ */

  /* ══════════════════════ S10 ══════════════════════ */

  /* ══════════════════════ fin S10 ══════════════════════ */

  /* ══════════════════════ S11 ══════════════════════ */

  /* ══════════════════════ fin S11 ══════════════════════ */

  /* ══════════════════════ S12 ══════════════════════ */

  /* ══════════════════════ fin S12 ══════════════════════ */

  /* ══════════════════════ S13 ══════════════════════ */

  /* ══════════════════════ fin S13 ══════════════════════ */

  /* ══════════════════════ S14 ══════════════════════ */

  /* ══════════════════════ fin S14 ══════════════════════ */

  /* ══════════════════════ S15 ══════════════════════ */

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


  /* ══════════════════════ fin Examen ══════════════════════ */
})();
