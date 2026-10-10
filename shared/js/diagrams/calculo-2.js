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

  /* ══════════════════════ fin S01 ══════════════════════ */

  /* ══════════════════════ S02 ══════════════════════ */

  /* ══════════════════════ fin S02 ══════════════════════ */

  /* ══════════════════════ S03 ══════════════════════ */

  /* ══════════════════════ fin S03 ══════════════════════ */

  /* ══════════════════════ S04 ══════════════════════ */

  /* ══════════════════════ fin S04 ══════════════════════ */

  /* ══════════════════════ S05 ══════════════════════ */

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

  /* ══════════════════════ fin Examen ══════════════════════ */
})();
