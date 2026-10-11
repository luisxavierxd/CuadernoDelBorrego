/* =====================================================================
   Diagramas de Física 2: window.Diagrams[id](state) → SVG (string).
   Roles: campo o trazo real .ref · componentes y elementos dq .aux ·
   fuerza, campo resultante o error .error · recorrido .trace · lo del alumno .student.
   Cargas: + con .box-err y «+» dentro, − con .box-aux y «−» dentro (como en la
   portada); la carga de prueba, chica, con .dot-trace.
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
  // Carga dibujada: positiva con box-err y «+», negativa con box-aux y «−».
  function f2s01Q(x, y, s, r) {
    r = r || 14;
    return '<circle class="' + (s > 0 ? 'box-err' : 'box-aux') + '" cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r + '"/>' +
      text(x, y + r * 0.45, s > 0 ? '+' : '−', ' text-anchor="middle" font-size="' + Math.floor(r * 1.4) + '"');
  }
  // k cargas en fila centrada en (x, y) con separación dx.
  function f2s01Row(x, y, k, s, dx, r) {
    var o = '';
    for (var i = 0; i < k; i++) o += f2s01Q(x + (i - (k - 1) / 2) * dx, y, s, r);
    return o;
  }

  /* ---------- S01 · Iguales se repelen, opuestas se atraen ---------- */
  D['f2s01-charges'] = function () {
    var body = '';
    [[1, 1, 'iguales: se repelen'], [-1, -1, 'iguales: se repelen'], [1, -1, 'opuestas: se atraen']].forEach(function (r, i) {
      var y = 55 + i * 85, a = 150, b = 320;
      body += f2s01Q(a, y, r[0], 20) + f2s01Q(b, y, r[1], 20);
      if (r[0] === r[1]) body += arrow('error', a - 26, y, -62, 0) + arrow('error', b + 26, y, 62, 0);
      else body += arrow('error', a + 26, y, 52, 0) + arrow('error', b - 26, y, -52, 0);
      body += text(430, y + 6, r[2], ' font-size="19"');
    });
    return svgBox('0 15 640 250', 'Dos cargas positivas se repelen, dos negativas también; una positiva y una negativa se atraen. Las flechas son las fuerzas sobre cada carga.', body);
  };

  /* ---------- S01 · Frotar: los electrones cambian de lugar, el total no ---------- */
  D['f2s01-rubbing'] = function () {
    function wool(x, nNeg) {
      return '<rect class="box-base" x="' + x + '" y="95" width="80" height="90" rx="10"/>' +
        f2s01Row(x + 40, 122, 3, 1, 22, 9) + f2s01Row(x + 40, 160, nNeg, -1, 22, 9);
    }
    function balloon(cx, extra) {
      var o = '<ellipse class="ref" fill="none" stroke-width="2.5" cx="' + cx + '" cy="140" rx="62" ry="72"/>' +
        seg('axis', cx, 212, cx + 4, 226, 1.6) + f2s01Row(cx, 116, 3, 1, 22, 9) + f2s01Row(cx, 150, 3 + Math.min(extra, 1), -1, 22, 9);
      if (extra > 1) o += f2s01Row(cx, 178, extra - 1, -1, 22, 9);
      return o;
    }
    var body = seg('axis', 310, 30, 310, 270, 1.4, '4 7') +
      text(160, 42, 'antes', ' text-anchor="middle" font-size="19"') + wool(40, 3) + balloon(215, 0) +
      text(80, 212, 'lana', ' text-anchor="middle" font-size="18"') + text(215, 250, 'globo', ' text-anchor="middle" font-size="18"') +
      text(160, 280, 'total: 0', ' text-anchor="middle" font-size="18"') +
      text(485, 42, 'después de frotar', ' text-anchor="middle" font-size="19"') + wool(350, 1) + balloon(555, 2) +
      arrow('aux', 438, 140, 48, 0, 2.5) + text(460, 126, 'e⁻', ' text-anchor="middle" font-size="18"') +
      text(390, 212, 'lana: +2e', ' text-anchor="middle" font-size="18"') + text(555, 250, 'globo: −2e', ' text-anchor="middle" font-size="18"') +
      text(485, 280, 'total: +2e − 2e = 0', ' text-anchor="middle" font-size="18"');
    return svgBox('0 15 640 280', 'Antes de frotar, la lana y el globo tienen tantas cargas positivas como negativas. Al frotar pasan dos electrones de la lana al globo: la lana queda con +2e, el globo con −2e y el total sigue siendo cero.', body);
  };

  /* ---------- S01 · Conductor contra aislante ---------- */
  D['f2s01-materials'] = function () {
    var body = '<rect class="box-ref" x="60" y="40" width="460" height="44" rx="8"/>';
    for (var i = 0; i < 8; i++) body += f2s01Q(88 + i * 58, 62, -1, 11);
    body += text(60, 114, 'metal: la carga se reparte por toda la superficie', ' font-size="18"');
    body += '<rect class="box-base" x="60" y="150" width="460" height="44" rx="8"/>';
    for (var j = 0; j < 5; j++) body += f2s01Q(406 + j * 26, 172, -1, 11);
    body += text(60, 224, 'plástico: la carga se queda donde frotaste', ' font-size="18"');
    body += text(540, 68, 'conductor', ' font-size="18"') + text(540, 178, 'aislante', ' font-size="18"');
    return svgBox('0 20 640 220', 'Una barra de metal cargada reparte sus electrones por toda la superficie; una barra de plástico los conserva solo en la punta que se frotó.', body);
  };

  /* ---------- S01 · Carga por contacto (explainer) ----------
     state.t: 0 = separadas (A = +6, B = −2) · 1 = se tocan · 2 = separadas otra vez (+2 y +2). */
  D['f2s01-contact'] = function (s) {
    var t = Math.max(0, Math.min(2, num(s, 't', 0))), R = 58, CY = 150;
    var close = t <= 1 ? t : 2 - t, xa = 200 + 60 * close, xb = 440 - 60 * close;
    var after = t >= 0.5;
    function ring(cx, k, sg) {
      var o = '';
      for (var i = 0; i < k; i++) { var a = (90 + i * 360 / k) * RAD; o += f2s01Q(cx + 32 * Math.cos(a), CY - 32 * Math.sin(a), sg, 11); }
      return o;
    }
    var body = '<circle class="ref" fill="none" stroke-width="2.5" cx="' + r1(xa) + '" cy="' + CY + '" r="' + R + '"/>' +
      '<circle class="ref" fill="none" stroke-width="2.5" cx="' + r1(xb) + '" cy="' + CY + '" r="' + R + '"/>';
    body += after ? ring(xa, 2, 1) + ring(xb, 2, 1) : ring(xa, 6, 1) + ring(xb, 2, -1);
    var cap = t < 0.5 ? 'antes: A = +6 nC, B = −2 nC' : t < 1.5 ? 'se tocan: total = +6 − 2 = +4 nC' : 'después: cada una con la mitad, +2 nC';
    body += text(320, 40, cap, ' text-anchor="middle" font-size="19"');
    body += text(xa, CY + R + 30, 'A', ' text-anchor="middle" font-size="19"') + text(xb, CY + R + 30, 'B', ' text-anchor="middle" font-size="19"');
    if (t > 0.5 && t < 1.5) body += arrow('aux', 400, 80, -150, 0, 2.5) + text(325, 66, '4 nC de electrones pasan de B a A', ' text-anchor="middle" font-size="17"');
    if (t >= 1.5) body += text(320, CY + R + 60, 'q = (q₁ + q₂)/2 = (6 − 2)/2 = +2 nC', ' text-anchor="middle" font-size="18"');
    return svgBox('0 15 640 290', 'Dos esferas metálicas idénticas: A con +6 nC y B con −2 nC. Al tocarse se reparten el total de +4 nC y al separarse cada una queda con +2 nC.', body);
  };

  /* ---------- S01 · Carga por inducción (explainer) ----------
     state: rod (0 lejos, 1 cerca) · pol (polarización 0–1) · g (tierra conectada 0/1) ·
     q (electrones que subieron 0–1) · out (0 agrupados, 1 repartidos) · flow (flecha de e⁻) · cap (texto). */
  D['f2s01-induction'] = function (s) {
    var rod = clamp01(num(s, 'rod', 0)), pol = clamp01(num(s, 'pol', 0)), g = num(s, 'g', 0) > 0.5, q = clamp01(num(s, 'q', 0));
    var out = clamp01(num(s, 'out', 0)), flow = num(s, 'flow', 0) > 0.5, cap = (s && s.cap) || 'esfera de metal neutra';
    var CX = 420, CY = 150, R = 66, body = '';
    if (rod > 0.02) {
      var tip = 300 - (1 - rod) * 230, x0 = Math.max(10, tip - 200), inner = '';
      inner += '<rect class="box-err" x="' + r1(x0) + '" y="' + (CY - 16) + '" width="' + r1(tip - x0) + '" height="32" rx="6"/>';
      for (var i = 0; i < Math.floor((tip - x0 - 6) / 28); i++) inner += text(tip - 15 - i * 28, CY + 7, '+', ' text-anchor="middle" font-size="21"');
      inner += text((x0 + tip) / 2, CY + 48, 'barra +', ' text-anchor="middle" font-size="18"');
      body += fade(inner, Math.min(1, rod * 1.5));
    }
    body += '<circle class="ref" fill="none" stroke-width="3" cx="' + CX + '" cy="' + CY + '" r="' + R + '"/>';
    var nNeg = Math.round(5 * Math.max(pol, q)), nPos = Math.round(5 * pol * (1 - q)), rr = R - 17;
    for (var k = 0; k < nNeg; k++) {
      var aC = 180 + (k - (nNeg - 1) / 2) * 26, aU = 180 + k * 360 / Math.max(1, nNeg), a = (aC + (aU - aC) * out) * RAD;
      body += f2s01Q(CX + rr * Math.cos(a), CY - rr * Math.sin(a), -1, 10);
    }
    for (var m = 0; m < nPos; m++) {
      var b = ((m - (nPos - 1) / 2) * 26) * RAD;
      body += f2s01Q(CX + rr * Math.cos(b), CY - rr * Math.sin(b), 1, 10);
    }
    if (!nNeg && !nPos) body += text(CX, CY + 6, 'neutra', ' text-anchor="middle" font-size="18"');
    var w0 = CY + R, gy = 300;
    if (g) body += seg('ref', CX, w0, CX, gy, 2.5);
    else body += seg('ref', CX, w0, CX, w0 + 20, 2.5) + seg('ref', CX, gy - 20, CX, gy, 2.5) + seg('ref', CX, gy - 20, CX + 16, gy - 38, 2.5);
    body += seg('axis', CX - 22, gy, CX + 22, gy, 2.5) + seg('axis', CX - 14, gy + 8, CX + 14, gy + 8, 2.5) + seg('axis', CX - 6, gy + 16, CX + 6, gy + 16, 2.5);
    body += text(CX - 32, gy + 12, g ? 'tierra (conectada)' : 'tierra', ' text-anchor="end" font-size="18"');
    if (flow) body += arrow('aux', CX + 22, gy - 8, 0, -48, 2.5) + text(CX + 36, gy - 26, 'e⁻ suben', ' font-size="18"');
    body += text(620, 40, cap, ' text-anchor="end" font-size="19"');
    return svgBox('0 15 640 320', 'Carga por inducción: una barra positiva polariza una esfera de metal; al conectarla a tierra suben electrones; se desconecta la tierra y se retira la barra, y la esfera queda negativa.', body);
  };

  /* ---------- S01 · Polarización: el globo y la pared ---------- */
  D['f2s01-polarization'] = function () {
    var body = '<ellipse class="ref" fill="none" stroke-width="2.5" cx="200" cy="145" rx="70" ry="86"/>' +
      '<path class="axis" fill="none" stroke-width="1.6" d="M200 231C194 242 208 250 202 262"/>';
    for (var i = 0; i < 5; i++) body += f2s01Q(244, 97 + i * 24, -1, 10);
    body += '<rect class="box-base" x="330" y="40" width="270" height="210" rx="4"/>';
    for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++) {
      var x = 385 + c * 80, y = 75 + r * 47;
      body += '<ellipse class="axis" fill="none" stroke-width="1.4" cx="' + x + '" cy="' + y + '" rx="22" ry="11"/>' +
        f2s01Q(x - 11, y, 1, 8) + f2s01Q(x + 11, y, -1, 8);
    }
    body += arrow('trace', 150, 32, 90, 0, 3) + text(140, 38, 'atracción', ' text-anchor="end" font-size="18"');
    body += text(200, 290, 'globo frotado (−)', ' text-anchor="middle" font-size="18"') +
      text(465, 280, 'pared (aislante): cada molécula', ' text-anchor="middle" font-size="18"') +
      text(465, 302, 'pone su lado + hacia el globo', ' text-anchor="middle" font-size="18"');
    return svgBox('0 12 640 300', 'Un globo cargado negativamente cerca de una pared: las moléculas de la pared se polarizan, con su lado positivo hacia el globo, y el globo es atraído.', body);
  };

  /* ══════════════════════ fin S01 ══════════════════════ */

  /* ══════════════════════ S02 ══════════════════════ */
  // Carga puntual: positiva roja con «+», negativa azul con «−».
  function f2s02Charge(x, y, q, r) {
    r = r || 20;
    return '<circle class="' + (q > 0 ? 'box-err' : 'box-aux') + '" cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r + '"/>' +
      text(x, y + 7, q > 0 ? '+' : '−', ' text-anchor="middle" font-size="22"');
  }

  /* ---------- S02 · Repulsión y atracción ---------- */
  D['f2s02-pair'] = function () {
    var body = '';
    // Signos iguales: cada fuerza se aleja de la otra carga.
    body += f2s02Charge(150, 70, 1) + f2s02Charge(330, 70, 1);
    body += arrow('ref', 128, 70, -62, 0, 3.2) + arrow('ref', 352, 70, 62, 0, 3.2);
    body += text(97, 52, 'F₂₁', ' text-anchor="middle" font-size="17"') + text(383, 52, 'F₁₂', ' text-anchor="middle" font-size="17"');
    body += text(150, 112, 'q₁', ' text-anchor="middle" font-size="17"') + text(330, 112, 'q₂', ' text-anchor="middle" font-size="17"');
    body += text(530, 76, 'se repelen', ' text-anchor="middle" font-size="18"');
    // Signos opuestos: cada fuerza apunta hacia la otra carga.
    body += f2s02Charge(150, 180, 1) + f2s02Charge(330, 180, -1);
    body += arrow('ref', 172, 180, 58, 0, 3.2) + arrow('ref', 308, 180, -58, 0, 3.2);
    body += text(201, 162, 'F₂₁', ' text-anchor="middle" font-size="17"') + text(279, 162, 'F₁₂', ' text-anchor="middle" font-size="17"');
    body += text(530, 186, 'se atraen', ' text-anchor="middle" font-size="18"');
    // Distancia entre centros.
    body += seg('axis', 150, 222, 330, 222, 1.4) + seg('axis', 150, 214, 150, 230, 1.4) + seg('axis', 330, 214, 330, 230, 1.4);
    body += text(240, 248, 'r', ' text-anchor="middle" font-size="18"');
    body += text(530, 130, 'F = k|q₁q₂| / r²', ' text-anchor="middle" font-size="18"');
    return svgBox('0 20 640 240', 'Dos cargas del mismo signo se repelen y dos de signo opuesto se atraen. Las dos fuerzas de cada par tienen la misma magnitud y sentidos opuestos; r es la distancia entre centros.', body);
  };

  /* ---------- S02 · Superposición en un triángulo (explainer) ----------
     q1 = +3 μC en el origen, q2 = −4 μC a 5 cm en x, q3 = +2 μC a 4 cm en y.
     state.step ∈ [0, 4]: 0 cargas · 1 F₂ · 2 F₃ · 3 componentes · 4 resultante. */
  D['f2s02-superpos'] = function (s) {
    var k = num(s, 'step', 0), O = [200, 230], cm = 44, sc = 2.3;
    var F2 = 8.99e9 * 12e-12 / 0.0025, F3 = 8.99e9 * 6e-12 / 0.0016;
    var R = Math.hypot(F2, F3), th = 360 - Math.atan2(F3, F2) / RAD;
    var q2 = [O[0] + 5 * cm, O[1]], q3 = [O[0], O[1] - 4 * cm];
    var a2 = F2 * sc, a3 = F3 * sc;
    // Las líneas y flechas arrancan en el borde de las cargas para no tapar el signo.
    var rn = Math.hypot(a2, a3), ux = a2 / rn, uy = a3 / rn;
    var body = seg('axis', O[0] + 20, O[1], q2[0] - 20, q2[1], 1.3, '5 6') + seg('axis', O[0], O[1] - 20, q3[0], q3[1] + 20, 1.3, '5 6');
    body += text(360, 218, '5 cm', ' text-anchor="middle" font-size="16"') + text(188, 142, '4 cm', ' text-anchor="end" font-size="16"');
    body += f2s02Charge(O[0], O[1], 1, 18) + f2s02Charge(q2[0], q2[1], -1, 18) + f2s02Charge(q3[0], q3[1], 1, 18);
    body += text(172, 236, 'q₁ +3 μC', ' text-anchor="end" font-size="16"') + text(q2[0], q2[1] + 44, 'q₂ −4 μC', ' text-anchor="middle" font-size="16"') +
      text(q3[0] + 28, q3[1] + 6, 'q₃ +2 μC', ' font-size="16"');
    // F₂: q₂ atrae a q₁ (hacia +x). F₃: q₃ repele a q₁ (hacia −y).
    body += fade(arrow('aux', O[0] + 20, O[1], a2 - 20, 0, 3.2) + text(245, 214, 'F₂', ' text-anchor="middle" font-size="17"'), clamp01(k));
    body += fade(arrow('aux', O[0], O[1] + 20, 0, a3 - 20, 3.2) + text(188, 288, 'F₃', ' text-anchor="end" font-size="17"'), clamp01(k - 1));
    body += fade(text(540, 112, 'Fx = +' + F2.toFixed(2) + ' N', ' text-anchor="middle" font-size="17"') +
      text(540, 138, 'Fy = −' + F3.toFixed(2) + ' N', ' text-anchor="middle" font-size="17"'), clamp01(k - 2));
    body += fade(seg('axis', O[0] + a2, O[1], O[0] + a2, O[1] + a3, 1.3, '4 5') + seg('axis', O[0], O[1] + a3, O[0] + a2, O[1] + a3, 1.3, '4 5') +
      arrow('ref', O[0] + 20 * ux, O[1] + 20 * uy, a2 - 20 * ux, a3 - 20 * uy, 4) + text(O[0] + a2 + 12, O[1] + a3 + 6, 'F neta', ' font-size="17"') +
      text(540, 172, '|F| = ' + R.toFixed(2) + ' N', ' text-anchor="middle" font-size="17"') +
      text(540, 198, 'θ = ' + th.toFixed(1) + '°', ' text-anchor="middle" font-size="17"'), clamp01(k - 3));
    return svgBox('0 30 640 300', 'Tres cargas en un triángulo rectángulo. La carga q2, negativa, atrae a q1 hacia la derecha; q3, positiva, la repele hacia abajo. La fuerza neta es la suma de las dos flechas por componentes.', body);
  };

  /* ---------- S02 · Dónde la fuerza neta es cero ---------- */
  D['f2s02-equilibrium'] = function () {
    var body = '';
    // Mismo signo: el punto queda entre las dos, más cerca de la carga chica (escala 40 px/cm).
    body += text(320, 34, 'Mismo signo: entre las dos, más cerca de la más chica', ' text-anchor="middle" font-size="17"');
    body += seg('axis', 70, 80, 80, 80, 1.2) + seg('axis', 120, 80, 480, 80, 1.2) + seg('axis', 520, 80, 530, 80, 1.2);
    body += f2s02Charge(100, 80, 1, 18) + f2s02Charge(500, 80, 1, 18);
    body += '<circle class="dot-trace" cx="260" cy="80" r="6"/>';
    body += arrow('ref', 260, 80, -48, 0, 3) + arrow('ref', 260, 80, 48, 0, 3);
    body += text(100, 122, 'q₁ = +4 μC', ' text-anchor="middle" font-size="15"') + text(500, 122, 'q₂ = +9 μC', ' text-anchor="middle" font-size="15"') +
      text(260, 112, 'x = 4 cm', ' text-anchor="middle" font-size="15"');
    // Signos opuestos: afuera, del lado de la más chica (escala 20 px/cm).
    body += text(320, 168, 'Signos opuestos: afuera, del lado de la más chica', ' text-anchor="middle" font-size="17"');
    body += seg('axis', 70, 214, 320, 214, 1.2) + seg('axis', 360, 214, 420, 214, 1.2) + seg('axis', 460, 214, 530, 214, 1.2);
    body += f2s02Charge(340, 214, 1, 18) + f2s02Charge(440, 214, -1, 18);
    body += '<circle class="dot-trace" cx="140" cy="214" r="6"/>';
    body += arrow('ref', 140, 214, -48, 0, 3) + arrow('ref', 140, 214, 48, 0, 3);
    body += text(340, 256, 'q₁ = +4 μC', ' text-anchor="middle" font-size="15"') + text(450, 256, 'q₂ = −9 μC', ' text-anchor="middle" font-size="15"') +
      text(140, 246, 'x = −10 cm', ' text-anchor="middle" font-size="15"');
    return svgBox('0 10 640 260', 'Arriba, dos cargas positivas de 4 y 9 microcoulombs separadas 10 cm: la carga de prueba queda en equilibrio a 4 cm de la chica. Abajo, cargas de signo opuesto separadas 5 cm: el punto queda afuera, a 10 cm del lado de la chica.', body);
  };

  /* ---------- S02 · Eléctrica contra gravitacional ---------- */
  D['f2s02-gravity'] = function () {
    var body = f2s02Charge(170, 110, 1, 22) + f2s02Charge(470, 110, -1, 14);
    body += text(170, 160, 'protón', ' text-anchor="middle" font-size="16"') + text(470, 160, 'electrón', ' text-anchor="middle" font-size="16"');
    body += arrow('ref', 196, 110, 120, 0, 4) + arrow('ref', 452, 110, -120, 0, 4);
    body += text(320, 88, 'atracción eléctrica', ' text-anchor="middle" font-size="16"');
    body += text(320, 200, 'Fe / Fg ≈ 2.27 × 10³⁹', ' text-anchor="middle" font-size="19"');
    body += text(320, 228, 'la gravitacional ni se ve a esta escala', ' text-anchor="middle" font-size="16"');
    return svgBox('0 60 640 185', 'Entre un protón y un electrón la fuerza eléctrica es unas 2.27 por 10 a la 39 veces mayor que la gravitacional; a la misma escala, la flecha de la gravedad sería invisible.', body);
  };

  /* ══════════════════════ fin S02 ══════════════════════ */

  /* ══════════════════════ S03 ══════════════════════ */
  /* Campo eléctrico: carga de prueba, carga puntual, superposición, punto nulo,
     líneas de campo y electrón entre placas. Cargas: + con box-err, − con box-aux. */
  function f2s03Charge(x, y, q, r) {
    r = r || 20;
    return '<circle class="' + (q > 0 ? 'box-err' : 'box-aux') + '" cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r + '"/>' +
      text(x, y + r * 0.36, q > 0 ? '+' : '−', ' text-anchor="middle" font-size="' + Math.round(r * 1.05) + '"');
  }
  // Líneas de campo en píxeles (cs: [{ x, y, q }]); RK2 sobre la dirección de E, paso fijo.
  function f2s03Dir(cs, x, y) {
    var ex = 0, ey = 0;
    for (var i = 0; i < cs.length; i++) {
      var dx = x - cs[i].x, dy = y - cs[i].y, r2 = dx * dx + dy * dy;
      if (r2 < 1e-6) return null;
      var m = cs[i].q / (r2 * Math.sqrt(r2)); ex += m * dx; ey += m * dy;
    }
    var L = Math.hypot(ex, ey);
    return L > 0 ? [ex / L, ey / L] : null;
  }
  function f2s03Trace(cs, x, y, dir, vb, rs) {
    var pts = [[x, y]], h = 3;
    for (var n = 0; n < 500; n++) {
      var a = f2s03Dir(cs, x, y); if (!a) break;
      var b = f2s03Dir(cs, x + dir * a[0] * h / 2, y + dir * a[1] * h / 2); if (!b) break;
      x += dir * b[0] * h; y += dir * b[1] * h; pts.push([x, y]);
      if (x < vb[0] + 4 || x > vb[2] - 4 || y < vb[1] + 4 || y > vb[3] - 4) break;
      if (cs.some(function (c) { return Math.hypot(x - c.x, y - c.y) < rs + 2; })) break;
    }
    return pts;
  }
  function f2s03Lines(cs, vb, per, rs) {
    var o = '';
    cs.forEach(function (c, i) {
      if (c.q === 0) return;
      var n = Math.round(per * Math.abs(c.q)), dir = c.q > 0 ? 1 : -1;
      // Las negativas solo trazan sus líneas si no hay positivas (si las hay, ya llegan a ellas).
      if (dir < 0 && cs.some(function (d) { return d.q > 0; }) && Math.abs(c.q) <= cs.filter(function (d) { return d.q > 0; }).reduce(function (s, d) { return s + d.q; }, 0)) return;
      for (var k = 0; k < n; k++) {
        var t = (k + 0.5) * 2 * Math.PI / n + i * 0.2;
        var pts = f2s03Trace(cs, c.x + (rs + 3) * Math.cos(t), c.y + (rs + 3) * Math.sin(t), dir, vb, rs);
        if (dir < 0) pts.reverse();
        o += poly('ref', pts, 1.8);
        // Flecha de sentido a unos 70 px del arranque (o a la mitad si es corta).
        var j = Math.min(Math.floor(pts.length / 2), dir > 0 ? 24 : pts.length - 24);
        if (j > 1 && j < pts.length - 1) {
          var p = pts[j], q = pts[j + 1], dx = q[0] - pts[j - 1][0], dy = q[1] - pts[j - 1][1], L = Math.hypot(dx, dy) || 1;
          var ux = dx / L, uy = dy / L;
          o += poly('ref', [[p[0] - 8 * ux - 5 * uy, p[1] - 8 * uy + 5 * ux], p, [p[0] - 8 * ux + 5 * uy, p[1] - 8 * uy - 5 * ux]], 1.8);
        }
      }
    });
    return o;
  }

  // Concepto: el campo es la fuerza por unidad de carga de prueba.
  D['f2s03-test-charge'] = function () {
    var o = '';
    o += f2s03Charge(140, 170, 1, 28);
    o += text(140, 232, 'Q', ' text-anchor="middle" font-size="21"');
    o += seg('axis', 172, 170, 418, 170, 1.5, '5 6');
    o += text(295, 158, 'r', ' text-anchor="middle" font-size="20"');
    o += dot('dot-trace', 430, 170, 7);
    o += text(430, 202, 'q₀', ' text-anchor="middle" font-size="20"');
    o += arrow('error', 440, 170, 120, 0, 3.5);
    o += text(500, 156, 'F', ' text-anchor="middle" font-size="21"');
    o += text(320, 52, 'E = F / q₀', ' text-anchor="middle" font-size="24"');
    o += text(320, 86, 'E = k Q / r², sin importar el valor de q₀', ' text-anchor="middle" font-size="18"');
    o += text(320, 286, 'q₀ chica y positiva: solo «mide», no mueve a Q', ' text-anchor="middle" font-size="17"');
    return svgBox('0 0 640 310', 'Una carga fuente Q y una carga de prueba q₀ a distancia r; la fuerza F sobre q₀ dividida entre q₀ es el campo E.', o);
  };

  // Explainer: campo de una carga puntual (r, r̂, magnitud, sentido, distancia doble).
  D['f2s03-point'] = function (s) {
    var d = num(s, 'd', 200), neg = !!(s && s.neg), show = (s && s.show) || 'r';
    var Q = [120, 230], a = 22 * RAD, ux = Math.cos(a), uy = -Math.sin(a);
    var P = [Q[0] + d * ux, Q[1] + d * uy];
    var order = ['r', 'rhat', 'mag', 'dir', 'double'], k = order.indexOf(show);
    var o = '', pts = [];
    o += seg('axis', Q[0] + 26 * ux, Q[1] + 26 * uy, P[0] - 9 * ux, P[1] - 9 * uy, 1.5, '5 6');
    pts = pts.concat(segPts(Q[0] + 26 * ux, Q[1] + 26 * uy, P[0], P[1]));
    o += f2s03Charge(Q[0], Q[1], neg ? -1 : 1, 24);
    o += text(Q[0], Q[1] + 52, neg ? '−Q' : 'Q', ' text-anchor="middle" font-size="20"');
    var mid = [(Q[0] + P[0]) / 2 - 16 * Math.sin(a), (Q[1] + P[1]) / 2 - 16 * Math.cos(a) + 4];
    o += text(mid[0], mid[1], 'r', ' text-anchor="middle" font-size="20"');
    if (k >= 1 && k < 2) {
      o += arrow('aux', P[0], P[1], 46 * ux, 46 * uy, 2.5);
      pts = pts.concat(arrowPts(P[0], P[1], 46 * ux, 46 * uy));
      o += label(spot([[P[0] + 30 * ux + 6, P[1] + 30 * uy + 24, 'r̂', 'start'], [P[0] + 30 * ux, P[1] + 30 * uy - 12, 'r̂', 'middle']], pts, 20, [0, 0, 640, 330]), 20);
    }
    if (k >= 2) {
      var L = 110 * Math.pow(200 / d, 2) * (neg ? -1 : 1);
      o += arrow('error', P[0], P[1], L * ux, L * uy, 3.5);
      pts = pts.concat(arrowPts(P[0], P[1], L * ux, L * uy));
      o += label(spot([[P[0] + L * ux / 2 - 4, P[1] + L * uy / 2 - 14, 'E', 'end'], [P[0] + L * ux / 2 + 8, P[1] + L * uy / 2 + 26, 'E', 'start'], [P[0] + L * ux + 12, P[1] + L * uy + 6, 'E', 'start']], pts, 21, [0, 0, 640, 330]), 21);
    }
    o += dot('dot-trace', P[0], P[1], 6);
    o += label(spot([[P[0] + 4, P[1] + 30, 'P', 'middle'], [P[0] - 6, P[1] - 14, 'P', 'end'], [P[0] + 14, P[1] + 22, 'P', 'start']], pts, 20, [0, 0, 640, 330]), 20);
    var msg = ['r: distancia de la carga al punto P', 'r̂: vector unitario de Q hacia P', '|E| = k|Q| / r²', 'Q negativa: E apunta hacia Q', 'r al doble → E a la cuarta parte'][Math.max(0, k)];
    o += text(620, 312, msg, ' text-anchor="end" font-size="19"');
    return svgBox('0 0 640 330', 'Carga puntual Q y punto P a distancia r; el campo E en P apunta a lo largo de r̂, alejándose de una carga positiva y hacia una negativa.', o);
  };

  // Explainer: superposición con el triángulo 3-4-5 del ejemplo 2 (q₁ = +4 nC, q₂ = −2 nC).
  D['f2s03-superposition'] = function (s) {
    var show = (s && s.show) || 'e1', order = ['e1', 'e2', 'comp', 'sum'], k = Math.max(0, order.indexOf(show));
    var sc = 22, O = [110, 306], q1 = O, q2 = [O[0] + 6 * sc, O[1]], P = [O[0], O[1] - 8 * sc];
    var f = 0.019, E1 = [0, 5618.75], E2 = [1078.8, -1438.4], E = [E1[0] + E2[0], E1[1] + E2[1]];
    var px = function (v) { return [v[0] * f, -v[1] * f]; };
    var a1 = px(E1), a2 = px(E2), aE = px(E);
    var o = '', pts = [];
    o += seg('axis', q1[0], q1[1] - 22, P[0], P[1] + 8, 1.4, '4 6');
    o += seg('axis', q2[0] - 13, q2[1] - 17, P[0] + 6, P[1] + 8, 1.4, '4 6');
    pts = pts.concat(segPts(q1[0], q1[1] - 22, P[0], P[1]), segPts(q2[0], q2[1], P[0], P[1]));
    o += f2s03Charge(q1[0], q1[1], 1, 18) + f2s03Charge(q2[0], q2[1], -1, 18);
    o += dot('dot-trace', P[0], P[1], 5) + text(P[0] - 12, P[1] + 22, 'P', ' text-anchor="end" font-size="19"');
    o += text(q1[0] - 26, q1[1] + 6, 'q₁', ' text-anchor="end" font-size="19"');
    o += text(q2[0] + 26, q2[1] + 6, 'q₂', ' font-size="19"');
    o += text((q1[0] + q2[0]) / 2, q1[1] + 6, '6 cm', ' text-anchor="middle" font-size="16"');
    o += text(P[0] - 10, (q1[1] + P[1]) / 2 + 30, '8 cm', ' text-anchor="end" font-size="16"');
    o += text((q2[0] + P[0]) / 2 + 12, (q2[1] + P[1]) / 2 + 4, '10 cm', ' font-size="16"');
    o += arrow('aux', P[0], P[1], a1[0], a1[1], 3);
    pts = pts.concat(arrowPts(P[0], P[1], a1[0], a1[1]));
    o += text(P[0] - 12, P[1] + a1[1] / 2, 'E₁', ' text-anchor="end" font-size="20"');
    if (k >= 1) {
      o += arrow('trace', P[0], P[1], a2[0], a2[1], 3);
      pts = pts.concat(arrowPts(P[0], P[1], a2[0], a2[1]));
      o += text(P[0] + a2[0] / 2 + 16, P[1] + a2[1] / 2 - 6, 'E₂', ' font-size="20"');
    }
    if (k === 2) {
      o += seg('trace', P[0], P[1] + a2[1], P[0] + a2[0], P[1] + a2[1], 1.5, '4 5');
      o += seg('trace', P[0] + a2[0], P[1], P[0] + a2[0], P[1] + a2[1], 1.5, '4 5');
    }
    if (k >= 3) {
      o += arrow('trace', P[0] + a1[0], P[1] + a1[1], a2[0], a2[1], 2);
      o += arrow('error', P[0], P[1], aE[0], aE[1], 4);
      o += text(P[0] + aE[0] / 2 + 14, P[1] + aE[1] / 2 + 6, 'E', ' font-size="21"');
    }
    var lines = [['P en (0, 8) cm', 'q₁ = +4 nC en el origen', 'q₂ = −2 nC en (6, 0) cm'],
      ['E₁ = kq₁/r₁² = 5619 N/C, arriba', 'E₂ = k|q₂|/r₂² = 1798 N/C,', 'hacia q₂ (es negativa)'],
      ['E₁ = (0, 5619) N/C', 'E₂ = 1798 (0.6, −0.8)', '    = (1079, −1438) N/C'],
      ['E = (1079, 4180) N/C', '|E| = 4317 N/C', 'θ = 75.5° sobre +x']][k];
    lines.forEach(function (t, i) { o += text(300, 70 + i * 32, t, ' font-size="19"'); });
    return svgBox('0 0 640 340', 'Dos cargas, q₁ positiva y q₂ negativa, y el punto P; el campo de cada una en P y su suma vectorial.', o);
  };

  // Explainer: dónde se anula E sobre la recta de dos cargas.
  D['f2s03-null'] = function (s) {
    var mode = (s && s.mode) || 'same';
    var y0 = 150, x1 = 200, x2 = 440, cm = 8;                    // 30 cm entre las cargas
    var Q = { same: [1, 4], opposite: [1, -9], equal: [1, -1] }[mode] || [1, 4];
    var xs = { same: [100, 280, 540], opposite: [80, 320, 540], equal: [100, 320, 540] }[mode];
    var rq2 = Q[1] === 4 || Q[1] === -9 ? 24 : 16;
    var o = seg('axis', 20, y0, x1 - 16, y0, 1.4) + seg('axis', x1 + 16, y0, x2 - rq2, y0, 1.4) + seg('axis', x2 + rq2, y0, 620, y0, 1.4);
    function Ex(q, xc, x) { var r = (x - xc) / cm; return q * Math.sign(r) / (r * r); }
    var ref = Math.abs(Ex(Q[0], x1, xs[1])) || 1;
    function len(v) { var L = 34 * Math.sqrt(Math.abs(v) / ref); return Math.sign(v) * Math.max(10, Math.min(78, L)); }
    xs.forEach(function (x, i) {
      var e1 = Ex(Q[0], x1, x), e2 = Ex(Q[1], x2, x), isNull = mode !== 'equal' && i === (mode === 'same' ? 1 : 0);
      o += arrow('aux', x, y0 - 24, len(e1), 0, 2.6);
      o += arrow('trace', x, y0 + 24, len(e2), 0, 2.6);
      o += dot(isNull ? 'dot-ref' : 'dot-trace', x, y0, isNull ? 7 : 5);
      if (isNull) o += text(x, y0 - 50, 'E = 0', ' text-anchor="middle" font-size="19"');
    });
    o += f2s03Charge(x1, y0, Q[0], 16) + f2s03Charge(x2, y0, Q[1], rq2);
    o += text(x1, y0 + 44, 'q', ' text-anchor="middle" font-size="19"');
    o += text(x2, y0 + 52, { same: '4q', opposite: '−9q', equal: '−q' }[mode], ' text-anchor="middle" font-size="19"');
    var msg = {
      same: ['Mismo signo: los campos se oponen ENTRE las cargas.', 'El punto nulo queda entre ellas, más cerca de la menor.'],
      opposite: ['Signos opuestos: entre ellas los campos se suman.', 'El punto nulo queda AFUERA, del lado de la menor.'],
      equal: ['Iguales y opuestas: E no se anula en ningún punto', 'de la recta (solo infinitamente lejos).']
    }[mode];
    o += text(320, 258, msg[0], ' text-anchor="middle" font-size="18"') + text(320, 284, msg[1], ' text-anchor="middle" font-size="18"');
    o += arrow('aux', 40, 306, 26, 0, 2.6) + text(72, 311, 'campo de q', ' font-size="16"');
    o += arrow('trace', 250, 306, 26, 0, 2.6) + text(282, 311, 'campo de la otra carga', ' font-size="16"');
    return svgBox('0 0 640 324', 'Dos cargas sobre una recta y, en tres puntos, el campo de cada una; donde son iguales y opuestos el campo total se anula.', o);
  };

  // Explainer: líneas de campo de varias configuraciones (trazadas aquí, sin texto que estorbe).
  D['f2s03-lines'] = function (s) {
    var kind = (s && s.kind) || 'pos', vb = [0, 0, 640, 340], rs = 17;
    var cs = {
      pos: [{ x: 320, y: 170, q: 1 }],
      neg: [{ x: 320, y: 170, q: -1 }],
      dipole: [{ x: 230, y: 170, q: 1 }, { x: 410, y: 170, q: -1 }],
      pair: [{ x: 230, y: 170, q: 1 }, { x: 410, y: 170, q: 1 }],
      unequal: [{ x: 230, y: 170, q: 2 }, { x: 410, y: 170, q: -1 }]
    }[kind] || [{ x: 320, y: 170, q: 1 }];
    var o = f2s03Lines(cs, vb, kind === 'unequal' ? 8 : 12, rs);
    cs.forEach(function (c) { o += f2s03Charge(c.x, c.y, c.q, rs); });
    return svgBox('0 0 640 340', 'Líneas de campo eléctrico: salen de las cargas positivas, entran a las negativas y su número es proporcional a la carga.', o);
  };

  // Explainer: electrón que entra horizontal entre dos placas (campo uniforme hacia abajo).
  D['f2s03-plates'] = function (s) {
    var u = clamp01(num(s, 'u', 0)), show = (s && s.show) || 'field';
    var order = ['field', 'enter', 'force', 'path', 'exit'], k = Math.max(0, order.indexOf(show));
    var x0 = 140, x1 = 500, yc = 170, Dy = 60, o = '';
    var yAt = function (x) { var t = (x - x0) / (x1 - x0); return yc - Dy * t * t; };
    // Placas.
    o += '<rect class="box-err" x="' + x0 + '" y="66" width="' + (x1 - x0) + '" height="20"/>';
    o += '<rect class="box-aux" x="' + x0 + '" y="254" width="' + (x1 - x0) + '" height="20"/>';
    for (var i = 0; i < 6; i++) {
      var sx = x0 + 30 + i * 60;
      o += text(sx, 82, '+', ' text-anchor="middle" font-size="18"') + text(sx, 270, '−', ' text-anchor="middle" font-size="18"');
    }
    // Campo uniforme: de la placa + a la −.
    for (var j = 0; j < 5; j++) {
      var fx = x0 + 60 + j * 60;
      var xe0 = x0 + u * (x1 - x0);
      if (k === 2 && fx > xe0 - 26 && fx < xe0 + 150) continue;   // deja libre la zona del electrón
      o += arrow('aux', fx, 92, 0, 154, 1.6);
    }
    o += text(x1 + 18, 222, 'E', ' font-size="21"');
    var xe = x0 + u * (x1 - x0), ye = yAt(xe);
    if (k >= 3) {
      var pp = [];
      for (var t = 0; t <= 40; t++) { var xx = x0 + (x1 - x0) * t / 40; pp.push([xx, yAt(xx)]); }
      o += poly('trace', pp, 3);
      if (k >= 4) {
        var m = 2 * Dy / (x1 - x0);
        o += seg('trace', x1, yc - Dy, 610, yc - Dy - m * 110, 3, '7 6');
        o += seg('axis', x0 - 70, yc, 610, yc, 1.2, '3 6');
        o += seg('axis', 560, yc, 560, yc - Dy - m * 60, 1.4);
        o += text(572, (yc + yc - Dy - m * 60) / 2 + 6, 'y', ' font-size="20"');
        o += seg('axis', x0, 296, x1, 296, 1.4) + seg('axis', x0, 288, x0, 304, 1.4) + seg('axis', x1, 288, x1, 304, 1.4);
        o += text((x0 + x1) / 2, 322, 'L', ' text-anchor="middle" font-size="20"');
      }
    }
    if (k === 1) {
      o += arrow('trace', xe + 12, ye, 70, 0, 3);
      o += text(xe + 46, ye - 14, 'v₀', ' text-anchor="middle" font-size="20"');
      o += text(xe - 16, ye + 6, 'e⁻', ' text-anchor="end" font-size="20"');
    }
    if (k === 2) {
      o += arrow('error', xe, ye - 10, 0, -52, 3.5);
      o += text(xe + 12, ye - 44, 'F = eE', ' font-size="19"');
      o += text(xe + 12, ye + 30, 'F opuesta a E', ' font-size="17"');
    }
    o += dot('dot-trace', xe, ye, 7);
    if (k === 0) o += text(x0 - 12, yc + 6, 'campo uniforme', ' text-anchor="end" font-size="17"');
    if (k === 3) o += text(x0 - 10, 322, 'x = v₀t,  y = ½ a t²,  a = eE/m', ' font-size="19"');
    if (k === 4) o += text(x0 - 10, 30, 't = L / v₀  →  y = ½ a (L/v₀)²', ' font-size="19"');
    return svgBox('0 0 640 340', 'Dos placas paralelas, positiva arriba y negativa abajo, con campo uniforme hacia abajo; un electrón entra horizontal y se curva hacia la placa positiva.', o);
  };
  /* ══════════════════════ fin S03 ══════════════════════ */

  /* ══════════════════════ S04 ══════════════════════ */
  /* Distribuciones continuas. Cada explainer usa state.k = paso (1…6); lo que se anima entre
     pasos (largo de la varilla, ángulo del arco, radio del anillo o del disco) es numérico.
     Las anotaciones de cada paso se dibujan solo en su paso; la geometría se queda. */
  // Tamaños de letra: el que se pasa + 2 (las figuras se ven a media columna en PC).
  function s04plus(x, y, fs) { return text(x, y, '+', ' text-anchor="middle" font-size="' + ((fs || 17) + 1) + '"'); }
  function s04lab(x, y, s, anchor, fs) { return text(x, y, s, ' text-anchor="' + (anchor || 'middle') + '" font-size="' + ((fs || 19) + 2) + '"'); }
  function s04rect(cls, x0, y0, x1, y1) { return poly(cls, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 2.4, true); }
  // Cota con marcas en los extremos (horizontal o vertical).
  function s04dim(x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L * 7, ny = dx / L * 7;
    return seg('aux', x0, y0, x1, y1, 1.6) + seg('aux', x0 - nx, y0 - ny, x0 + nx, y0 + ny, 1.6) + seg('aux', x1 - nx, y1 - ny, x1 + nx, y1 + ny, 1.6);
  }
  // Puntos de una elipse (ángulos en grados, y hacia arriba).
  function s04ell(cx, cy, rx, ry, a0, a1, n) {
    var o = [];
    n = n || 60;
    for (var i = 0; i <= n; i++) { var a = (a0 + (a1 - a0) * i / n) * RAD; o.push([cx + rx * Math.cos(a), cy - ry * Math.sin(a)]); }
    return o;
  }
  // Banda (corona) entre dos elipses concéntricas, de a0 a a1: relleno de carga positiva.
  function s04band(cx, cy, rx0, ry0, rx1, ry1, a0, a1, cls) {
    var out = s04ell(cx, cy, rx1, ry1, a0, a1, 72), inn = s04ell(cx, cy, rx0, ry0, a1, a0, 72);
    return fill(cls || 'box-err', out.concat(inn));
  }
  function s04svg(h, label, body) { return svgBox('0 0 640 ' + h, label, body); }

  /* ---------- Densidades: λ, σ y ρ ---------- */
  D['f2s04-densities'] = function () {
    var b = '';
    // Línea
    b += '<rect class="box-err" x="25" y="88" width="160" height="22" rx="4"/>';
    [43, 67, 145, 168].forEach(function (x) { b += s04plus(x, 105); });
    b += s04rect('aux', 93, 81, 117, 117);
    b += s04dim(93, 128, 117, 128) + s04lab(105, 152, 'dx', 'middle', 18);
    b += s04lab(105, 58, 'λ = Q/L') + s04lab(105, 200, 'dq = λ dx');
    // Superficie
    b += fill('box-err', [[234, 132], [284, 80], [406, 80], [356, 132]]);
    b += s04plus(262, 127) + s04plus(375, 98) + s04plus(318, 98);
    b += poly('aux', [[332, 124], [346, 108], [372, 108], [358, 124]], 2.4, true);
    b += s04lab(295, 120, 'dA', 'middle', 18);
    b += s04lab(320, 58, 'σ = Q/A') + s04lab(320, 200, 'dq = σ dA');
    // Volumen
    b += fill('box-err', [[470, 92], [500, 72], [596, 72], [566, 92]]) + fill('box-err', [[566, 92], [596, 72], [596, 142], [566, 162]]);
    b += fill('box-err', [[470, 92], [566, 92], [566, 162], [470, 162]]);
    b += poly('aux', [[500, 120], [524, 120], [524, 144], [500, 144]], 2.2, true) + poly('aux', [[500, 120], [510, 113], [534, 113], [524, 120]], 2.2, true) + poly('aux', [[524, 120], [534, 113], [534, 137], [524, 144]], 2.2, true);
    b += s04plus(488, 112) + s04plus(552, 112) + s04plus(488, 154);
    b += s04lab(552, 152, 'dV', 'middle', 18);
    b += s04lab(533, 52, 'ρ = Q/V') + s04lab(533, 200, 'dq = ρ dV');
    return s04svg(220, 'Tres distribuciones de carga: una línea con densidad lambda, una superficie con densidad sigma y un volumen con densidad rho; en cada una se marca un elemento de carga dq.', b);
  };

  /* ---------- De la suma a la integral ---------- */
  D['f2s04-sum'] = function () {
    var b = '', P = [320, 140], n = 8, x0 = 120, w = 50, yR = 290, sx = 0, sy = 0, k = 1.3e6;
    b += '<rect class="box-err" x="' + x0 + '" y="' + (yR - 13) + '" width="' + n * w + '" height="26" rx="4"/>';
    for (var i = 0; i < n; i++) {
      var cx = x0 + (i + 0.5) * w;
      if (i) b += seg('error', x0 + i * w, yR - 13, x0 + i * w, yR + 13, 1.4);
      b += s04plus(cx, yR + 6);
      var dx = P[0] - cx, dy = P[1] - yR, r = Math.hypot(dx, dy), m = k / (r * r);
      b += seg('axis', cx, yR - 13, P[0], P[1], 1, '3 5');
      b += arrow('aux', P[0], P[1], dx / r * m, dy / r * m, 2.2);
      sx += dx / r * m; sy += dy / r * m;
    }
    b += arrow('ref', P[0], P[1], 0, -118, 3.6);
    b += dot('dot-trace', P[0], P[1], 6);
    b += s04lab(346, 150, 'P', 'start') + s04lab(334, 34, 'E = Σ dE', 'start');
    b += s04lab(x0 + 0.5 * w, yR + 46, 'Δq', 'middle', 18) + s04lab(470, 338, 'Δq → dq:  Σ → ∫', 'middle', 18);
    return s04svg(360, 'Una varilla partida en ocho trozos de carga; cada trozo produce en P una flecha dE y la suma de todas da el campo E, vertical.', b);
  };

  /* ---------- Varilla: punto en su eje ---------- */
  D['f2s04-rod-axis'] = function (s) {
    var k = num(s, 'k', 1), g = clamp01(num(s, 'g', 1)), b = '', Y = 170, cx = 200, half = Math.max(12, 140 * g), xa = cx - half, xb = cx + half, PX = 500, dq = 230;
    b += seg('axis', 24, Y, xa - 4, Y, 1.2, '4 6') + seg('axis', xb + 4, Y, 616, Y, 1.2, '4 6');
    b += '<rect class="box-err" x="' + r1(xa) + '" y="' + (Y - 11) + '" width="' + r1(xb - xa) + '" height="22" rx="4"/>';
    var whole = g > 0.98;
    if (whole) [80, 110, 140, 170, 200, 260, 290, 320].forEach(function (x) { if (k !== 3 || (x !== 110 && x !== 320)) b += s04plus(x, Y + 6, 16); });
    else b += s04plus(cx, Y + 6, 16);
    b += dot('dot-trace', PX, Y, 6) + s04lab(PX, Y - 22, 'P');
    if (whole && k <= 5) {
      b += s04rect('aux', dq - 10, Y - 17, dq + 10, Y + 17);
      if (k === 1 || k === 4) b += s04dim(60, 210, dq, 210) + s04lab(145, 234, 'x');
      b += s04dim(60, 262, 340, 262) + s04lab(200, 290, 'L') + s04dim(340, 262, PX, 262) + s04lab(420, 290, 'd');
      if (k <= 4) b += s04lab(dq, 136, 'dq = λ dx');
    }
    if (k === 2 || k === 3) {
      b += s04dim(dq, 104, PX, 104) + s04lab(365, 90, 'r = L + d − x');
      b += arrow('error', PX, Y, 84, 0, 3) + s04lab(552, Y - 18, 'dE');
    }
    if (k === 3) {
      b += s04rect('aux', 100, Y - 17, 120, Y + 17) + s04rect('aux', 310, Y - 17, 330, Y + 17);
      b += s04lab(470, 44, 'todas las dE apuntan a +x');
    }
    if (k === 4) b += s04dim(60, 112, 340, 112) + s04lab(200, 98, 'x de 0 a L') + arrow('error', PX, Y, 84, 0, 3) + s04lab(552, Y - 18, 'dE');
    if (k === 5) b += arrow('ref', PX, Y, 100, 0, 3.6) + s04lab(560, Y - 18, 'E') + s04lab(330, 70, 'E = kQ / [d (d + L)]');
    if (k >= 6) {
      b += arrow('ref', PX, Y, 100, 0, 3.6) + s04lab(560, Y - 18, 'E');
      b += s04lab(330, 70, 'd ≫ L:  E → kQ/d²');
    }
    return s04svg(310, 'Varilla con carga positiva sobre el eje x y un punto P en su mismo eje, a una distancia d del extremo; se marca un elemento dq y su campo dE en P.', b);
  };

  /* ---------- Varilla: punto en la bisectriz ---------- */
  D['f2s04-rod-bisector'] = function (s) {
    var k = num(s, 'k', 1), g = num(s, 'g', 1), b = '', Y = 290, C = 320, half = 220 * g, PY = 110, dq = 430, mq = 210;
    var whole = g < 1.02;
    b += seg('axis', C, Y - 11, C, 14, 1.2, '4 6');
    b += '<rect class="box-err" x="' + r1(C - half) + '" y="' + (Y - 11) + '" width="' + r1(2 * half) + '" height="22" rx="4"/>';
    for (var x = C - half + 18; x < C + half - 10; x += 32) {
      if (whole && k <= 4 && (Math.abs(x - dq) < 20 || (k === 3 && Math.abs(x - mq) < 20))) continue;
      b += s04plus(x, Y + 6, 16);
    }
    b += dot('dot-trace', C, PY, 6) + s04lab(304, PY - 6, 'P', 'end');
    var ux = (C - dq) / Math.hypot(C - dq, PY - Y), uy = (PY - Y) / Math.hypot(C - dq, PY - Y), A = 104;
    if (whole && k <= 4) {
      b += s04rect('aux', dq - 10, Y - 17, dq + 10, Y + 17);
      b += s04lab(dq, 346, 'dq = λ dx');
      if (k <= 2) b += s04dim(C, 252, dq, 252) + s04lab(375, 238, 'x') + s04lab(306, 210, 'y', 'end');
    }
    if (whole && k <= 3) b += s04dim(C - half, 322, C + half, 322) + s04lab(210, 346, 'L');
    if (k === 2 || k === 3) {
      b += seg('aux', dq, Y - 17, C, PY, 1.6, '5 5');
      b += arrow('error', C, PY, ux * A, uy * A, 3);
      b += s04lab(250, 64, 'dE', 'end');
    }
    if (k === 2) {
      b += s04lab(396, 196, 'r = √(x² + y²)', 'start');
      var ang = Math.atan2(-uy, ux) / RAD;
      b += arc(C, PY, 40, 90, ang, 'aux', 1.6) + s04lab(C + 54 * Math.cos(106 * RAD) - 2, PY - 54 * Math.sin(106 * RAD) + 4, 'θ');
    }
    if (k === 3) {
      b += s04rect('aux', mq - 10, Y - 17, mq + 10, Y + 17);
      b += seg('aux', mq, Y - 17, C, PY, 1.6, '5 5');
      b += arrow('error', C, PY, -ux * A, uy * A, 3);
      b += '<g opacity="0.55">' + seg('aux', C, PY, C + ux * A, PY, 2, '4 4') + seg('aux', C, PY, C - ux * A, PY, 2, '4 4') + '</g>';
      b += arrow('ref', C, PY, 0, uy * A, 3.4);
      b += s04lab(452, 118, 'las x se cancelan', 'start', 18) + s04lab(36, 44, 'las y se suman', 'start', 18);
    }
    if (k === 4) b += s04lab(C - half, 346, '−L/2') + s04lab(C + half, 346, 'L/2') + s04lab(36, 44, 'x de −L/2 a L/2', 'start', 18);
    if (k >= 5) b += arrow('ref', C, PY, 0, -90, 3.6) + s04lab(306, 40, 'E', 'end');
    if (k === 5) b += s04lab(340, 64, 'E = kQ / [y √(y² + L²/4)]', 'start', 18);
    if (k >= 6) b += s04lab(340, 64, 'L → ∞:  E → 2kλ/y', 'start', 18);
    return s04svg(360, 'Varilla horizontal con carga positiva y un punto P sobre su bisectriz, a una distancia y; se marcan un elemento dq, su distancia r a P y su campo dE.', b);
  };

  /* ---------- Arco (semicírculo): campo en el centro ---------- */
  D['f2s04-arc'] = function (s) {
    var k = num(s, 'k', 1), th = Math.max(10, Math.min(180, num(s, 'th', 180))), b = '', O = [320, 250], R = 160, a0 = 90 - th / 2, a1 = 90 + th / 2, dqA = 60, mqA = 120;
    var whole = th > 179;
    b += seg('axis', O[0], O[1], O[0], O[1] - R + 17, 1.2, '4 6');
    b += s04band(O[0], O[1], R - 13, R - 13, R + 13, R + 13, a0, a1);
    var nP = Math.max(1, Math.round(th / 24));
    for (var i = 0; i < nP; i++) {
      var a = a0 + (i + 0.5) * th / nP;
      if (whole && k <= 4 && (Math.abs(a - dqA) < 10 || (k === 3 && Math.abs(a - mqA) < 10))) continue;
      if (whole && k <= 4 && Math.abs(a - 90) < 6) continue;
      b += s04plus(O[0] + R * Math.cos(a * RAD), O[1] - R * Math.sin(a * RAD) + 6, 15);
    }
    function elem(aC) { return poly('aux', s04ell(O[0], O[1], R + 18, R + 18, aC - 6, aC + 6, 8).concat(s04ell(O[0], O[1], R - 18, R - 18, aC + 6, aC - 6, 8)), 2.2, true); }
    b += dot('dot-trace', O[0], O[1], 6) + s04lab(336, 272, 'P', 'start');
    var q = [O[0] + R * Math.cos(dqA * RAD), O[1] - R * Math.sin(dqA * RAD)], A = 80;
    if (whole && k <= 4) {
      b += elem(dqA) + s04lab(436, 62, 'dq = λ ds = λR dθ', 'start', 18);
      if (k === 1) {
        b += seg('aux', O[0], O[1], O[0] + R * Math.cos(150 * RAD), O[1] - R * Math.sin(150 * RAD), 1.6, '5 5') + s04lab(232, 238, 'R');
        b += arc(O[0], O[1], 48, 60, 90, 'aux', 1.6) + s04lab(338, 186, 'θ', 'start');
      }
    }
    if (k === 2 || k === 3) {
      b += seg('aux', q[0], q[1] + 16, O[0], O[1], 1.6, '5 5');
      b += arrow('error', O[0], O[1], -0.5 * A, 0.866 * A, 3) + s04lab(270, 324, 'dE', 'end');
    }
    if (k === 2) b += s04lab(372, 196, 'r = R', 'start');
    if (k === 3) {
      b += elem(mqA) + seg('aux', O[0] - (q[0] - O[0]), q[1] + 16, O[0], O[1], 1.6, '5 5');
      b += arrow('error', O[0], O[1], 0.5 * A, 0.866 * A, 3);
      b += '<g opacity="0.55">' + seg('aux', O[0], O[1], O[0] - 40, O[1], 2, '4 4') + seg('aux', O[0], O[1], O[0] + 40, O[1], 2, '4 4') + '</g>';
      b += s04lab(410, 324, 'las x se cancelan', 'start', 18) + s04lab(36, 324, 'las y se suman', 'start', 18);
    }
    if (k === 4) b += s04lab(O[0] + R, O[1] + 40, 'θ = −90°') + s04lab(O[0] - R, O[1] + 40, 'θ = 90°');
    if (k >= 5) b += arrow('ref', O[0], O[1], 0, 72, 3.6) + s04lab(306, 318, 'E', 'end');
    if (k === 5) b += s04lab(36, 40, 'E = 2kλ/R', 'start');
    if (k >= 6) b += s04lab(36, 40, 'arco chico:  E → kQ/R²', 'start');
    return s04svg(340, 'Arco de circunferencia con carga positiva y su centro P; se marcan un elemento dq a un ángulo theta del eje de simetría y su campo dE en el centro.', b);
  };

  /* ---------- Anillo: punto en su eje ---------- */
  D['f2s04-ring'] = function (s) {
    var k = num(s, 'k', 1), g = Math.max(0.08, Math.min(1, num(s, 'g', 1))), b = '', C = [170, 170], RX = 46 * g, RY = 130 * g, PX = 470, A = 108;
    var whole = g > 0.98, top = [C[0], C[1] - RY], bot = [C[0], C[1] + RY];
    b += seg('axis', 24, C[1], 616, C[1], 1.2, '4 6');
    b += s04band(C[0], C[1], RX - 9 * g, RY - 11 * g, RX + 9 * g, RY + 11 * g, 0, 360);
    if (whole) [35, 145, 215, 325].forEach(function (a) { b += s04plus(C[0] + RX * Math.cos(a * RAD), C[1] - RY * Math.sin(a * RAD) + 5, 14); });
    else b += s04lab(C[0] - 20, C[1] - 18, 'Q', 'end', 18);
    b += dot('dot-trace', PX, C[1], 6);
    var r = Math.hypot(PX - C[0], RY), ux = (PX - C[0]) / r, uy = RY / r;
    if (whole && k <= 4) {
      b += poly('aux', s04ell(C[0], C[1], RX + 12, RY + 14, 80, 100, 6).concat(s04ell(C[0], C[1], RX - 12, RY - 14, 100, 80, 6)), 2.2, true);
      b += s04lab(196, 26, 'dq', 'start');
    }
    if (whole && k === 1) b += seg('aux', C[0], C[1], C[0], top[1] + 10, 1.6, '5 5') + s04lab(156, 112, 'R', 'end') + s04dim(C[0], 214, PX, 214) + s04lab(320, 240, 'z');
    b += s04lab(456, 150, 'P', 'end');
    if (k === 2 || k === 3) {
      b += seg('aux', top[0], top[1], PX, C[1], 1.6, '5 5');
      b += arrow('error', PX, C[1], ux * A, uy * A, 3) + s04lab(612, 238, 'dE', 'end');
    }
    if (k === 2) {
      b += s04lab(340, 70, 'r = √(z² + R²)', 'start');
      b += arc(PX, C[1], 50, -Math.atan2(uy, ux) / RAD, 0, 'aux', 1.6) + s04lab(PX + 68 * Math.cos(11 * RAD), C[1] + 68 * Math.sin(11 * RAD) + 6, 'θ');
    }
    if (k === 3) {
      b += poly('aux', s04ell(C[0], C[1], RX + 12, RY + 14, 260, 280, 6).concat(s04ell(C[0], C[1], RX - 12, RY - 14, 280, 260, 6)), 2.2, true);
      b += seg('aux', bot[0], bot[1], PX, C[1], 1.6, '5 5');
      b += arrow('error', PX, C[1], ux * A, -uy * A, 3);
      b += '<g opacity="0.55">' + seg('aux', PX, C[1], PX, C[1] - uy * A, 2, '4 4') + seg('aux', PX, C[1], PX, C[1] + uy * A, 2, '4 4') + '</g>';
      b += s04lab(612, 60, 'las ⊥ se cancelan', 'end', 18) + s04lab(612, 300, 'las del eje se suman', 'end', 18);
    }
    if (k === 4) b += poly('aux', s04ell(C[0], C[1], RX + 12, RY + 14, 0, 360, 72), 2.2, true) + s04lab(236, 322, '∮ dq = Q', 'start');
    if (k >= 5) b += arrow('ref', PX, C[1], A, 0, 3.6) + s04lab(PX + A - 6, C[1] - 18, 'E');
    if (k === 5) b += s04lab(612, 300, 'E = kQz / r³', 'end');
    if (k >= 6) b += s04lab(612, 300, 'z ≫ R:  E → kQ/z²', 'end');
    return s04svg(340, 'Anillo con carga positiva visto en perspectiva y un punto P sobre su eje, a una distancia z del centro; se marcan un elemento dq, su distancia r y su campo dE.', b);
  };

  /* ---------- Disco: suma de anillos ---------- */
  D['f2s04-disk'] = function (s) {
    var k = num(s, 'k', 1), g = Math.max(1, Math.min(1.15, num(s, 'g', 1))), b = '', C = [170, 180], RX = 52 * g, RY = 150 * g, PX = 470, f = 0.6, A = 70;
    var whole = g < 1.01;
    b += fill('box-err', s04ell(C[0], C[1], RX, RY, 0, 360, 96));
    b += seg('axis', 24, C[1], 616, C[1], 1.2, '4 6');
    [50, 130, 230, 310].forEach(function (a) { b += s04plus(C[0] + 0.85 * RX * Math.cos(a * RAD), C[1] - 0.85 * RY * Math.sin(a * RAD) + 5, 15); });
    b += dot('dot-trace', PX, C[1], 6) + s04lab(488, 214, 'P', 'start');
    var ringEl = poly('aux', s04ell(C[0], C[1], RX * (f + 0.06), RY * (f + 0.06), 0, 360, 72), 2, true) + poly('aux', s04ell(C[0], C[1], RX * (f - 0.06), RY * (f - 0.06), 0, 360, 72), 2, true);
    if (whole && k <= 4) b += ringEl;
    if (whole && k <= 2) b += s04lab(232, 40, 'dq = σ · 2πr dr', 'start', 18);
    if (whole && k === 1) b += seg('aux', C[0], C[1], C[0], C[1] - RY * f, 1.6, '5 5') + s04lab(158, 150, 'r', 'end') + s04dim(C[0], 300, PX, 300) + s04lab(320, 326, 'z');
    if (k === 2) {
      b += seg('aux', C[0], C[1] - RY * f, PX, C[1], 1.4, '5 5') + seg('aux', C[0], C[1] + RY * f, PX, C[1], 1.4, '5 5');
      b += arrow('aux', PX, C[1], A, 0, 3) + s04lab(510, 162, 'dE');
      b += s04lab(620, 80, 'cada anillo: dE = k dq z / r³', 'end', 18);
    }
    if (k === 3) {
      [0.25, 0.4].forEach(function (ff) { b += poly('aux', s04ell(C[0], C[1], RX * ff, RY * ff, 0, 360, 72), 1.6, true, '4 4'); });
      b += arrow('aux', PX, C[1], A, 0, 3) + s04lab(510, 162, 'dE');
      b += s04lab(620, 80, 'todos los anillos empujan hacia +z', 'end', 18);
    }
    if (k === 4) b += seg('aux', C[0], C[1], C[0], C[1] - RY, 1.6, '5 5') + s04lab(240, 348, 'r de 0 a R', 'start', 18);
    if (k >= 5) b += arrow('ref', PX, C[1], 120, 0, 3.6) + s04lab(584, 162, 'E');
    if (k === 5) b += s04lab(620, 80, 'E = (σ/2ε₀) [1 − z/√(z² + R²)]', 'end', 18);
    if (k >= 6) b += s04lab(620, 80, 'R → ∞:  E → σ/2ε₀', 'end');
    return s04svg(360, 'Disco con carga positiva visto en perspectiva, partido en anillos de radio r y ancho dr, y un punto P sobre su eje a una distancia z.', b);
  };

  /* ══════════════════════ fin S04 ══════════════════════ */

  /* ══════════════════════ S05 ══════════════════════ */
  // Carga fija: + con box-err, − con box-aux, el signo dentro.
  function f2s05Q(x, y, sign, r, fs) {
    r = r || 18; fs = fs || 20;
    return '<circle class="' + (sign > 0 ? 'box-err' : 'box-aux') + '" cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r + '"/>' +
      text(x, y + fs * 0.35, sign > 0 ? '+' : '−', ' text-anchor="middle" font-size="' + fs + '"');
  }
  function f2s05Sub(main, sub) { return main + '<tspan baseline-shift="sub" font-size="70%">' + sub + '</tspan>'; }
  function f2s05Bez(p0, p1, p2, p3, n) {
    var o = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n, a = (1 - t) * (1 - t) * (1 - t), b = 3 * (1 - t) * (1 - t) * t, c = 3 * (1 - t) * t * t, d = t * t * t;
      o.push([a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]);
    }
    return o;
  }
  // Segmento entre los bordes de dos círculos de radio r.
  function f2s05Edge(a, b, r) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    return [a[0] + dx / L * r, a[1] + dy / L * r, b[0] - dx / L * r, b[1] - dy / L * r];
  }

  // La fuerza eléctrica es conservativa: dos caminos de A a B, el mismo trabajo.
  D['f2s05-paths'] = function () {
    var Q = [140, 180], A = [250, 120], B = [470, 220], vb = [0, 0, 560, 300];
    var curve = f2s05Bez(A, [270, 10], [520, 20], B, 60);
    var pts = segPts(A[0], A[1], B[0], B[1]).concat(polyPts(curve));
    var c1 = spot([[300, 190, 'camino 1', 'start'], [330, 200, 'camino 1', 'start'], [280, 175, 'camino 1', 'start']], pts, 15, vb);
    var c2 = spot([[505, 120, 'camino 2', 'start'], [480, 40, 'camino 2', 'start'], [330, 40, 'camino 2', 'middle']], pts, 15, vb);
    var body = f2s05Q(Q[0], Q[1], 1, 22) + text(108, 188, 'Q', ' text-anchor="end" font-size="18"') +
      seg('trace', A[0], A[1], B[0], B[1], 3) +
      poly('aux', curve, 2.5, false, '8 7') +
      dot('dot-trace', A[0], A[1], 7) + dot('dot-ref', B[0], B[1], 6) +
      text(A[0] - 12, A[1] - 8, 'A', ' text-anchor="end" font-size="18"') + text(B[0] + 12, B[1] + 18, 'B', ' font-size="18"') +
      label(c1, 15) + label(c2, 15) +
      text(540, 288, 'W por el camino 1 = W por el camino 2', ' text-anchor="end" font-size="15"');
    return svgBox('0 0 560 300', 'Una carga fija Q y dos caminos distintos de A a B para la carga de prueba', body);
  };

  // Del trabajo de la fuerza a la energía potencial U = kQq/r (explainer).
  D['f2s05-work'] = function (s) {
    var u = clamp01(num(s, 'u', 0)), inf = clamp01(num(s, 'inf', 0)), show = (s && s.show) || 'force';
    var rA = 1.5, rB = 3.5, rNow = rA + u * (rB - rA) + inf * (4.6 - rB);
    var xL = function (r) { return 50 + 40 * r; };
    var px = function (r) { return 300 + 68 * (r - 0.6); }, py = function (r) { return 250 - 190 * Math.pow(1.2 / r, 2); };
    var body = '';
    // Panel izquierdo: Q fija y q que se aleja.
    body += seg('axis', 72, 150, 255, 150, 1.4, '5 5') + f2s05Q(50, 150, 1, 18) + text(50, 194, 'Q', ' text-anchor="middle" font-size="16"');
    [[rA, 'r<tspan baseline-shift="sub" font-size="70%">A</tspan>']].concat(show === 'force' ? [] : [[rB, show === 'inf' ? '' : 'r<tspan baseline-shift="sub" font-size="70%">B</tspan>']]).forEach(function (t) {
      body += seg('axis', xL(t[0]), 143, xL(t[0]), 157, 1.4);
      if (t[1]) body += text(xL(t[0]), 206, t[1], ' text-anchor="middle" font-size="15"');
    });
    var xq = xL(rNow), Lf = 55 * Math.pow(rA / rNow, 2);
    body += arrow('error', xq + 9, 150, Lf, 0, 3) + dot('dot-trace', xq, 150, 7) +
      text(xq, 180, 'q', ' text-anchor="middle" font-size="16"') + text(xq + 9 + Math.max(Lf, 8) / 2, 134, 'F', ' text-anchor="middle" font-size="15"');
    // Panel derecho: F(r) y el área bajo la curva.
    body += arrow('axis', 300, 250, 315, 0, 1.6) + arrow('axis', 300, 250, 0, -210, 1.6) +
      text(630, 256, 'r', ' text-anchor="middle" font-size="16"') + text(300, 26, 'F', ' text-anchor="middle" font-size="16"');
    if (show !== 'force') {
      var area = [[px(rA), 250]];
      for (var i = 0; i <= 40; i++) { var r = rA + (rNow - rA) * i / 40; area.push([px(r), py(r)]); }
      area.push([px(rNow), 250]);
      if (rNow > rA + 0.01) body += fill('area-fill', area);
    }
    var curve = [];
    for (var j = 0; j <= 80; j++) { var rr = 1.2 + (5.2 - 1.2) * j / 80; curve.push([px(rr), py(rr)]); }
    body += poly('ref', curve, 3);
    body += seg('axis', px(rA), 250, px(rA), py(rA), 1.2, '4 4') + text(px(rA), 272, 'r<tspan baseline-shift="sub" font-size="70%">A</tspan>', ' text-anchor="middle" font-size="15"');
    if (show !== 'force') {
      body += seg('axis', px(rNow), 250, px(rNow), py(rNow), 1.2, '4 4');
      if (show === 'inf') body += text(px(rNow), 272, 'r → ∞', ' text-anchor="middle" font-size="15"');
      else if (rNow > rA + 0.6) body += text(px(rNow), 272, 'r<tspan baseline-shift="sub" font-size="70%">B</tspan>', ' text-anchor="middle" font-size="15"');
    }
    body += text(620, 70, 'F = kQq / r²', ' text-anchor="end" font-size="16"');
    var f = { area: 'W = área bajo F(r)', w: 'W = kQq (1/r<tspan baseline-shift="sub" font-size="70%">A</tspan> − 1/r<tspan baseline-shift="sub" font-size="70%">B</tspan>) = −ΔU', inf: 'U(r<tspan baseline-shift="sub" font-size="70%">A</tspan>) = kQq / r<tspan baseline-shift="sub" font-size="70%">A</tspan>' }[show];
    if (f) body += text(620, 100, f, ' text-anchor="end" font-size="16"');
    return svgBox('0 0 640 300', 'Una carga q se aleja de Q; a la derecha, la fuerza contra la distancia y el área bajo la curva', body);
  };

  // Armar un sistema de tres cargas trayéndolas una por una desde el infinito (explainer).
  D['f2s05-assemble'] = function (s) {
    var n = (s && s.n) || 'a', u2 = clamp01(num(s, 'u2', 0)), u3 = clamp01(num(s, 'u3', 0));
    var p1 = [150, 200], p2 = [330, 200], p3 = [240, 44], R = 18;
    var x2 = 600 - u2 * (600 - p2[0]), x3 = 600 - u3 * (600 - p3[0]);
    var has2 = n !== 'a', has3 = n === 'c' || n === 'd';
    var body = '';
    var pair = function (a, b, cls) { var e = f2s05Edge(a, b, R + 2); return seg(cls, e[0], e[1], e[2], e[3], 1.8, cls === 'ref' ? null : '5 5'); };
    var cls = n === 'd' ? 'ref' : 'aux';
    if (has2 && u2 > 0.999) body += pair(p1, p2, cls) + text(240, 224, f2s05Sub('r', '12'), ' text-anchor="middle" font-size="15"');
    if (has3 && u3 > 0.999) {
      body += pair(p1, p3, cls) + pair(p2, p3, cls) +
        text(183, 128, f2s05Sub('r', '13'), ' text-anchor="end" font-size="15"') + text(297, 128, f2s05Sub('r', '23'), ' font-size="15"');
    }
    if (n === 'b' || n === 'c') {
      var yy = n === 'b' ? p2[1] : p3[1], xx = n === 'b' ? x2 : x3;
      if (xx < 590) body += seg('trace', xx + R + 4, yy, 610, yy, 2, '6 6');
      body += text(610, n === 'b' ? yy + 32 : yy - 16, 'desde ∞', ' text-anchor="end" font-size="15"');
    }
    body += f2s05Q(p1[0], p1[1], 1, R) + text(p1[0], 240, f2s05Sub('q', '1'), ' text-anchor="middle" font-size="16"');
    if (has2) body += f2s05Q(x2, p2[1], 1, R) + text(x2, 240, f2s05Sub('q', '2'), ' text-anchor="middle" font-size="16"');
    if (has3) body += f2s05Q(x3, p3[1], -1, R) + text(x3 - 28, 50, f2s05Sub('q', '3'), ' text-anchor="end" font-size="16"');
    var k = function (a, b) { return 'q<tspan baseline-shift="sub" font-size="70%">' + a + '</tspan>q<tspan baseline-shift="sub" font-size="70%">' + b + '</tspan>/r<tspan baseline-shift="sub" font-size="70%">' + a + b + '</tspan>'; };
    var line = {
      a: f2s05Sub('q', '1') + ' sola: nada la empuja, ' + f2s05Sub('W', '1') + ' = 0',
      b: f2s05Sub('W', '2') + ' = k ' + k(1, 2),
      c: f2s05Sub('W', '3') + ' = k ' + f2s05Sub('q', '3') + ' (' + f2s05Sub('q', '1') + '/' + f2s05Sub('r', '13') + ' + ' + f2s05Sub('q', '2') + '/' + f2s05Sub('r', '23') + ')',
      d: 'U = k (' + k(1, 2) + ' + ' + k(1, 3) + ' + ' + k(2, 3) + ')'
    }[n];
    body += text(300, 284, line, ' text-anchor="middle" font-size="16"');
    return svgBox('0 0 620 300', 'Tres cargas que se traen una por una desde lejos; las líneas marcan los pares', body);
  };

  // El potencial es un escalar: V en P es la suma de kq/r de cada carga, con su signo.
  D['f2s05-superposition'] = function () {
    var vb = [0, 0, 560, 300], P = [440, 130], R = 18;
    var C = [[100, 210, 1, '1'], [300, 250, -1, '2'], [210, 70, 1, '3']];
    var body = '', pts = [], lines = [];
    C.forEach(function (c) {
      var e = f2s05Edge([c[0], c[1]], P, R + 2);
      e[2] = P[0] - (P[0] - e[0]) * 0.02; e[3] = P[1] - (P[1] - e[1]) * 0.02;
      lines.push(e); pts = pts.concat(segPts(e[0], e[1], P[0] - (P[0] - c[0]) * 0.03, P[1] - (P[1] - c[1]) * 0.03));
      body += seg('aux', e[0], e[1], P[0], P[1], 1.8, '6 5');
    });
    C.forEach(function (c, i) {
      var mx = (c[0] + P[0]) / 2, my = (c[1] + P[1]) / 2, lab = f2s05Sub('r', c[3]);
      var cand = [[mx, my + 24, lab, 'middle'], [mx + 16, my + 10, lab, 'start'], [mx, my - 12, lab, 'middle'], [mx - 16, my + 4, lab, 'end']];
      body += label(spot(cand, pts, 16, vb), 16);
    });
    body += f2s05Q(C[0][0], C[0][1], 1, R) + text(74, 216, f2s05Sub('q', '1'), ' text-anchor="end" font-size="16"') +
      f2s05Q(C[1][0], C[1][1], -1, R) + text(272, 256, f2s05Sub('q', '2'), ' text-anchor="end" font-size="16"') +
      f2s05Q(C[2][0], C[2][1], 1, R) + text(184, 76, f2s05Sub('q', '3'), ' text-anchor="end" font-size="16"') +
      dot('dot-ref', P[0], P[1], 6) + text(P[0] + 12, P[1] - 8, 'P', ' font-size="18"') +
      text(280, 292, f2s05Sub('V', 'P') + ' = k' + f2s05Sub('q', '1') + '/' + f2s05Sub('r', '1') + ' + k' + f2s05Sub('q', '2') + '/' + f2s05Sub('r', '2') + ' + k' + f2s05Sub('q', '3') + '/' + f2s05Sub('r', '3'), ' text-anchor="middle" font-size="16"');
    return svgBox('0 0 560 300', 'Tres cargas y un punto P; cada carga aporta kq/r al potencial en P, sin flechas', body);
  };

  // Un electrón acelerado desde el reposo por una diferencia de potencial.
  D['f2s05-accel'] = function (s) {
    var dv = num(s, 'dv', 2000);
    var body = seg('axis', 110, 50, 110, 236, 6) + seg('axis', 450, 50, 450, 236, 6) +
      text(110, 34, f2s05Sub('V', 'A') + ' = 0', ' text-anchor="middle" font-size="16"') +
      text(450, 34, f2s05Sub('V', 'B') + ' = +' + dv + ' V', ' text-anchor="middle" font-size="16"') +
      arrow('aux', 330, 86, -150, 0, 2) + arrow('aux', 330, 204, -150, 0, 2) + text(255, 74, 'E', ' text-anchor="middle" font-size="16"') +
      seg('trace', 158, 145, 362, 145, 2, '6 6') +
      '<circle class="aux" fill="none" stroke-width="2" stroke-dasharray="4 4" cx="380" cy="145" r="14"/>' +
      arrow('ref', 398, 145, 38, 0, 3) +
      f2s05Q(140, 145, -1, 14, 18) +
      text(140, 182, f2s05Sub('v', '0') + ' = 0', ' text-anchor="middle" font-size="15"') +
      text(380, 182, 'v = ?', ' text-anchor="middle" font-size="15"') +
      text(280, 266, 'el electrón va hacia el potencial más alto', ' text-anchor="middle" font-size="15"');
    return svgBox('0 0 560 280', 'Dos placas con una diferencia de potencial y un electrón que parte del reposo', body);
  };
  /* ══════════════════════ fin S05 ══════════════════════ */

  /* ══════════════════════ S06 ══════════════════════ */
  /* Potencial de distribuciones, equipotenciales y E = −∇V. Los explainers usan state.k = paso
     (1…6); f2s06-slope anima la posición z y f2s06-equip cambia de escena (state.scene). */
  function s06lab(x, y, s, anchor, fs) { return text(x, y, s, ' text-anchor="' + (anchor || 'middle') + '" font-size="' + (fs || 19) + '"'); }
  function s06Q(x, y, sign, r) {
    r = r || 18;
    return '<circle class="' + (sign > 0 ? 'box-err' : 'box-aux') + '" cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r + '"/>' +
      text(x, y + r * 0.4, sign > 0 ? '+' : '−', ' text-anchor="middle" font-size="' + Math.round(r * 1.15) + '"');
  }
  function s06rect(x0, y0, x1, y1) { return poly('aux', [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 2.4, true); }
  function s06dim(x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L * 7, ny = dx / L * 7;
    return seg('aux', x0, y0, x1, y1, 1.6) + seg('aux', x0 - nx, y0 - ny, x0 + nx, y0 + ny, 1.6) + seg('aux', x1 - nx, y1 - ny, x1 + nx, y1 + ny, 1.6);
  }
  function s06ell(cx, cy, rx, ry, a0, a1, n) {
    var o = [];
    n = n || 60;
    for (var i = 0; i <= n; i++) { var a = (a0 + (a1 - a0) * i / n) * RAD; o.push([cx + rx * Math.cos(a), cy - ry * Math.sin(a)]); }
    return o;
  }
  function s06svg(h, label, body) { return svgBox('0 0 640 ' + h, label, body); }
  // Curvas de nivel de f (en píxeles) con marching squares sobre una rejilla de paso h.
  function s06contour(f, x0, y0, x1, y1, h, level) {
    var nx = Math.ceil((x1 - x0) / h), ny = Math.ceil((y1 - y0) / h), d = '';
    var G = [];
    for (var j = 0; j <= ny; j++) { G.push([]); for (var i = 0; i <= nx; i++) G[j].push(f(x0 + i * h, y0 + j * h)); }
    var T = { 1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 5: [[3, 0], [1, 2]], 6: [[0, 2]], 7: [[3, 2]], 8: [[2, 3]], 9: [[0, 2]], 10: [[0, 1], [2, 3]], 11: [[1, 2]], 12: [[3, 1]], 13: [[0, 1]], 14: [[3, 0]] };
    for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) {
      var v = [G[j][i], G[j][i + 1], G[j + 1][i + 1], G[j + 1][i]];
      if (!v.every(isFinite)) continue;
      var c = (v[0] > level ? 1 : 0) | (v[1] > level ? 2 : 0) | (v[2] > level ? 4 : 0) | (v[3] > level ? 8 : 0);
      if (!T[c]) continue;
      var cx = [x0 + i * h, x0 + (i + 1) * h, x0 + (i + 1) * h, x0 + i * h], cy = [y0 + j * h, y0 + j * h, y0 + (j + 1) * h, y0 + (j + 1) * h];
      T[c].forEach(function (pr) {
        var p = pr.map(function (e) { var t = (e + 1) % 4, u = (level - v[e]) / (v[t] - v[e]); return [cx[e] + (cx[t] - cx[e]) * u, cy[e] + (cy[t] - cy[e]) * u]; });
        d += 'M' + r1(p[0][0]) + ' ' + r1(p[0][1]) + 'L' + r1(p[1][0]) + ' ' + r1(p[1][1]);
      });
    }
    return d;
  }

  /* ---------- Campo (vectores) contra potencial (números) ---------- */
  D['f2s06-scalar'] = function () {
    var b = '';
    b += seg('axis', 320, 20, 320, 290, 1.2, '4 6');
    [[0, 'Campo: flechas']].concat([[320, 'Potencial: números']]).forEach(function (t) { b += s06lab(160 + t[0], 36, t[1]); });
    [0, 320].forEach(function (o) {
      b += '<rect class="box-err" x="' + (40 + o) + '" y="219" width="240" height="22" rx="4"/>';
      b += s06rect(80 + o, 213, 100 + o, 247) + s06rect(220 + o, 213, 240 + o, 247);
      b += seg('axis', 90 + o, 213, 160 + o, 110, 1.2, '4 5') + seg('axis', 230 + o, 213, 160 + o, 110, 1.2, '4 5');
      b += dot('dot-trace', 160 + o, 110, 6);
    });
    // Izquierda: dos dE inclinadas que hay que proyectar.
    b += arrow('error', 160, 110, 0.504 * 46, -0.864 * 46, 3) + arrow('error', 160, 110, -0.504 * 46, -0.864 * 46, 3);
    b += s06lab(190, 82, 'dE₁', 'start', 17) + s06lab(130, 82, 'dE₂', 'end', 17);
    b += s06lab(160, 284, 'se proyectan (cos θ)', 'middle', 17);
    // Derecha: dos números que se suman tal cual.
    b += s06lab(434, 160, 'k dq₁/r₁', 'end', 17) + s06lab(530, 160, 'k dq₂/r₂', 'start', 17);
    b += s06lab(480, 76, 'V = V₁ + V₂ + …', 'middle', 17);
    b += s06lab(480, 284, 'se suman directo', 'middle', 17);
    return s06svg(300, 'A la izquierda, dos elementos de una varilla dan en P flechas dE que hay que proyectar; a la derecha, los mismos elementos aportan números k dq/r que se suman directo.', b);
  };

  /* ---------- Varilla: potencial en su eje ---------- */
  D['f2s06-rod'] = function (s) {
    var k = num(s, 'k', 1), b = '', Y = 170, xa = 60, xb = 340, PX = 500, dq = 230;
    b += seg('axis', 24, Y, xa - 4, Y, 1.2, '4 6') + seg('axis', xb + 4, Y, 616, Y, 1.2, '4 6');
    b += '<rect class="box-err" x="' + xa + '" y="' + (Y - 11) + '" width="' + (xb - xa) + '" height="22" rx="4"/>';
    [80, 110, 140, 170, 290, 320].forEach(function (x) { if (k !== 3 || (x !== 110 && x !== 290)) b += s06lab(x, Y + 6, '+', 'middle', 17); });
    b += dot('dot-trace', PX, Y, 6) + s06lab(PX, Y - 22, 'P');
    if (k <= 5) b += s06dim(xa, 262, xb, 262) + s06lab(200, 290, 'L') + s06dim(xb, 262, PX, 262) + s06lab(420, 290, 'd');
    if (k <= 4) b += s06rect(dq - 10, Y - 17, dq + 10, Y + 17) + s06lab(dq, 136, 'dq = λ dx');
    if (k === 1) b += s06dim(xa, 214, dq, 214) + s06lab(145, 238, 'x');
    if (k === 2 || k === 3) b += s06dim(dq, 104, PX, 104) + s06lab(365, 90, 'r = L + d − x');
    if (k === 2) b += s06lab(330, 44, 'dV = k dq / r  (un número)');
    if (k === 3) {
      b += s06rect(100, Y - 17, 120, Y + 17) + s06rect(280, Y - 17, 300, Y + 17);
      b += s06lab(330, 44, 'cada dq suma un número positivo');
    }
    if (k === 4) b += s06dim(xa, 112, xb, 112) + s06lab(200, 98, 'x de 0 a L');
    if (k === 5) b += s06lab(330, 70, 'V = (kQ/L) ln(1 + L/d)');
    if (k >= 6) b += s06lab(330, 70, 'd ≫ L:  V → kQ/d');
    return s06svg(310, 'Varilla con carga positiva sobre el eje x y un punto P en su mismo eje, a una distancia d del extremo; se marca un elemento dq y su distancia r a P.', b);
  };

  /* ---------- Anillo: potencial en su eje ---------- */
  D['f2s06-ring'] = function (s) {
    var k = num(s, 'k', 1), b = '', C = [170, 170], RX = 46, RY = 130, PX = 470;
    var top = [C[0], C[1] - RY], bot = [C[0], C[1] + RY];
    function band(a0, a1, w) { return fill('box-err', s06ell(C[0], C[1], RX + 9, RY + 11, a0, a1, 72).concat(s06ell(C[0], C[1], RX - 9, RY - 11, a1, a0, 72))); }
    function elem(a) { return poly('aux', s06ell(C[0], C[1], RX + 12, RY + 14, a - 10, a + 10, 6).concat(s06ell(C[0], C[1], RX - 12, RY - 14, a + 10, a - 10, 6)), 2.2, true); }
    b += seg('axis', 24, C[1], 616, C[1], 1.2, '4 6');
    b += band(0, 360);
    [35, 145, 215, 325].forEach(function (a) { b += s06lab(C[0] + RX * Math.cos(a * RAD), C[1] - RY * Math.sin(a * RAD) + 5, '+', 'middle', 15); });
    b += dot('dot-trace', PX, C[1], 6) + s06lab(490, 204, 'P', 'start');
    if (k <= 4) b += elem(90) + s06lab(196, 26, 'dq', 'start');
    if (k === 1) b += seg('aux', C[0], C[1], C[0], top[1] + 12, 1.6, '5 5') + s06lab(156, 112, 'R', 'end') + s06dim(C[0], 226, PX, 226) + s06lab(320, 252, 'z');
    if (k >= 2 && k <= 3) b += seg('aux', top[0], top[1], PX, C[1], 1.6, '5 5') + s06lab(340, 70, 'r = √(z² + R²)', 'start');
    if (k === 2) b += s06lab(612, 300, 'dV = k dq / r', 'end');
    if (k === 3) b += elem(270) + seg('aux', bot[0], bot[1], PX, C[1], 1.6, '5 5') + s06lab(612, 300, 'el de enfrente suma lo mismo', 'end', 18);
    if (k === 4) b += poly('aux', s06ell(C[0], C[1], RX + 14, RY + 16, 0, 360, 72), 2.2, true) + s06lab(240, 322, '∮ dq = Q', 'start');
    if (k === 5) b += s06lab(612, 300, 'V = kQ / √(z² + R²)', 'end');
    if (k >= 6) b += s06lab(612, 300, 'z ≫ R:  V → kQ/z', 'end');
    return s06svg(340, 'Anillo con carga positiva visto en perspectiva y un punto P sobre su eje, a una distancia z del centro; todos los elementos dq están a la misma distancia r de P.', b);
  };

  /* ---------- Disco: suma de anillos ---------- */
  D['f2s06-disk'] = function (s) {
    var k = num(s, 'k', 1), b = '', C = [170, 180], RX = 52, RY = 150, PX = 470, f = 0.6;
    b += fill('box-err', s06ell(C[0], C[1], RX, RY, 0, 360, 96));
    b += seg('axis', 24, C[1], 616, C[1], 1.2, '4 6');
    [50, 130, 230, 310].forEach(function (a) { b += s06lab(C[0] + 0.85 * RX * Math.cos(a * RAD), C[1] - 0.85 * RY * Math.sin(a * RAD) + 5, '+', 'middle', 15); });
    b += dot('dot-trace', PX, C[1], 6) + s06lab(488, 214, 'P', 'start');
    var ring = poly('aux', s06ell(C[0], C[1], RX * (f + 0.06), RY * (f + 0.06), 0, 360, 72), 2, true) + poly('aux', s06ell(C[0], C[1], RX * (f - 0.06), RY * (f - 0.06), 0, 360, 72), 2, true);
    if (k <= 4) b += ring;
    if (k <= 2) b += s06lab(232, 40, 'dq = σ · 2πr dr', 'start', 18);
    if (k === 1) b += seg('aux', C[0], C[1], C[0], C[1] - RY * f, 1.6, '5 5') + s06lab(158, 150, 'r', 'end') + s06dim(C[0], 300, PX, 300) + s06lab(320, 326, 'z');
    if (k === 2) {
      b += seg('aux', C[0], C[1] - RY * f, PX, C[1], 1.4, '5 5') + seg('aux', C[0], C[1] + RY * f, PX, C[1], 1.4, '5 5');
      b += s06lab(620, 300, 'dV = k dq / √(z² + r²)', 'end', 18);
    }
    if (k === 3) {
      [0.25, 0.4].forEach(function (ff) { b += poly('aux', s06ell(C[0], C[1], RX * ff, RY * ff, 0, 360, 72), 1.6, true, '4 4'); });
      b += s06lab(620, 300, 'todos los anillos suman', 'end', 18);
    }
    if (k === 4) b += seg('aux', C[0], C[1], C[0], C[1] - RY, 1.6, '5 5') + s06lab(240, 348, 'r de 0 a R', 'start', 18);
    if (k === 5) b += s06lab(620, 300, 'V = 2πkσ (√(z² + R²) − z)', 'end', 18);
    if (k >= 6) b += s06lab(620, 300, 'z ≫ R:  V → kQ/z', 'end');
    return s06svg(360, 'Disco con carga positiva visto en perspectiva, partido en anillos de radio r y ancho dr, y un punto P sobre su eje a una distancia z.', b);
  };

  /* ---------- De V a E: la pendiente de V(z) en el eje del anillo ---------- */
  D['f2s06-slope'] = function (s) {
    var z = Math.max(-2.8, Math.min(2.8, num(s, 'z', 0.9))), t = clamp01(num(s, 't', 0)), b = '';
    var X = function (u) { return 330 + 90 * u; }, Yv = function (u) { return 250 - 190 / Math.sqrt(u * u + 1); };
    b += arrow('axis', 40, 250, 580, 0, 1.6) + arrow('axis', 330, 250, 0, -222, 1.6);
    b += s06lab(624, 274, 'z', 'end', 18) + s06lab(342, 40, 'V', 'start', 18);
    var pts = [];
    for (var i = 0; i <= 120; i++) { var u = -3 + 6 * i / 120; pts.push([X(u), Yv(u)]); }
    b += poly('ref', pts, 3);
    b += s06lab(620, 40, 'V = kQ / √(z² + R²)', 'end', 18);
    var px = X(z), py = Yv(z);
    b += seg('axis', px, 250, px, py, 1.2, '4 4') + dot('dot-trace', px, py, 6);
    if (t > 0.5) {
      var m = 190 * z / Math.pow(z * z + 1, 1.5) / 90, dx = 60;     // pendiente en píxeles
      b += seg('trace', px - dx, py - m * dx, px + dx, py + m * dx, 2.4);
      var E = 120 * z / Math.pow(z * z + 1, 1.5);
      if (Math.abs(E) > 4) b += arrow('error', px, 278, E * 1.2, 0, 3) + s06lab(px + E * 1.2 + (E > 0 ? 10 : -10), 284, 'E', E > 0 ? 'start' : 'end', 18);
      else b += s06lab(px + 12, 290, 'E = 0', 'start', 18);
      b += s06lab(620, 70, 'E = −dV/dz', 'end', 18);
    }
    return s06svg(310, 'Gráfica del potencial sobre el eje de un anillo contra z, con la recta tangente en un punto; el campo es menos la pendiente.', b);
  };

  /* ---------- Equipotenciales: carga puntual, dipolo, placas y trabajo cero ---------- */
  D['f2s06-equip'] = function (s) {
    var sc = (s && s.scene) || 'point', b = '', C = [320, 170];
    if (sc === 'point' || sc === 'work') {
      [25, 30, 37.5, 50, 75, 150].forEach(function (r) { b += '<circle class="aux" fill="none" stroke-width="1.8" cx="' + C[0] + '" cy="' + C[1] + '" r="' + r + '"/>'; });
      if (sc === 'point') for (var i = 0; i < 12; i++) {
        var a = (15 + 30 * i) * RAD, c = Math.cos(a), sn = -Math.sin(a);
        b += seg('ref', C[0] + 22 * c, C[1] + 22 * sn, C[0] + 165 * c, C[1] + 165 * sn, 1.8);
        b += arrow('ref', C[0] + 100 * c, C[1] + 100 * sn, 12 * c, 12 * sn, 1.8);
      }
      b += s06Q(C[0], C[1], 1, 16);
      if (sc === 'point') b += s06lab(20, 325, 'equipotenciales', 'start', 17) + s06lab(620, 325, 'líneas de campo', 'end', 17);
      else {
        var A = 30 * RAD, p = [C[0] + 75 * Math.cos(A), C[1] - 75 * Math.sin(A)];
        b += arrow('error', p[0], p[1], 46 * Math.cos(A), -46 * Math.sin(A), 3) + arrow('trace', p[0], p[1], -46 * Math.sin(A), -46 * Math.cos(A), 3);
        var ux = Math.cos(A), uy = -Math.sin(A), tx = -Math.sin(A), ty = -Math.cos(A), q = 10;
        b += '<path class="axis" fill="none" stroke-width="1.5" d="M' + r1(p[0] + q * ux) + ' ' + r1(p[1] + q * uy) + 'l' + r1(q * tx) + ' ' + r1(q * ty) + 'l' + r1(-q * ux) + ' ' + r1(-q * uy) + '"/>';
        b += dot('dot-trace', p[0], p[1], 6);
        b += s06lab(p[0] + 52 * ux + 6, p[1] + 52 * uy + 2, 'E', 'start', 18) + s06lab(p[0] + 50 * tx - 4, p[1] + 50 * ty - 2, 'ds', 'end', 18);
        b += s06lab(20, 325, 'E ⟂ ds:  W = qE·ds = 0', 'start', 18);
      }
    } else if (sc === 'dipole') {
      var cs = [{ x: 220, y: 170, q: 1 }, { x: 420, y: 170, q: -1 }];
      var f = function (x, y) { return 1 / Math.hypot(x - 220, y - 170) - 1 / Math.hypot(x - 420, y - 170); };
      var d = '';
      [0.005, 0.01, 0.015, 0.02, 0.03].forEach(function (L) { d += s06contour(f, 0, 0, 640, 340, 4, L) + s06contour(f, 0, 0, 640, 340, 4, -L); });
      b += '<path class="aux" fill="none" stroke-width="1.8" d="' + d + '"/>';
      b += seg('aux', 320, 14, 320, 326, 2, '7 6');
      b += f2s03Lines(cs, [0, 0, 640, 340], 10, 18);
      b += s06Q(220, 170, 1) + s06Q(420, 170, -1);
      b += s06lab(326, 24, 'V = 0', 'start', 17);
    } else {
      b += '<rect class="box-err" x="130" y="50" width="20" height="250" rx="4"/><rect class="box-aux" x="490" y="50" width="20" height="250" rx="4"/>';
      [80, 140, 200, 260].forEach(function (y) { b += s06lab(140, y + 6, '+', 'middle', 17) + s06lab(500, y + 6, '−', 'middle', 17); });
      [218, 286, 354, 422].forEach(function (x) { b += seg('aux', x, 56, x, 294, 1.8); });
      [110, 175, 240].forEach(function (y) { b += seg('ref', 156, y, 484, y, 1.8) + arrow('ref', 300, y, 14, 0, 1.8); });
      b += s06lab(140, 36, 'V alto', 'middle', 17) + s06lab(500, 36, 'V bajo', 'middle', 17);
      b += s06lab(320, 326, 'planos igualmente separados', 'middle', 17);
    }
    return s06svg(340, 'Equipotenciales y líneas de campo: alrededor de una carga puntual, de un dipolo o entre placas paralelas; las líneas cruzan las equipotenciales en ángulo recto.', b);
  };

  /* ---------- Conductor en equilibrio con una punta ---------- */
  D['f2s06-conductor'] = function () {
    var b = '', cx = 280, cy = 170;
    var P = function (t) { return [cx + 170 * Math.cos(t), cy - 110 * Math.sin(t) * Math.pow(Math.abs(Math.sin(t / 2)), 0.9)]; };
    var pts = [];
    for (var i = 0; i <= 160; i++) pts.push(P(-Math.PI + 2 * Math.PI * i / 160));
    b += '<path class="box-base" d="' + pts.map(function (p, j) { return (j ? 'L' : 'M') + r1(p[0]) + ' ' + r1(p[1]); }).join('') + 'Z"/>';
    function normal(t) {
      var a = P(t - 0.01), c = P(t + 0.01), dx = c[0] - a[0], dy = c[1] - a[1], L = Math.hypot(dx, dy) || 1;
      return [-dy / L, dx / L];      // hacia afuera (t crece: de la punta hacia arriba, antihorario a la vista)
    }
    // Campo afuera: perpendicular a la superficie, más largo en la punta.
    [[0, 92], [0.35, 64], [-0.35, 64], [1.1, 40], [-1.1, 40], [2.0, 32], [-2.0, 32], [Math.PI, 30]].forEach(function (a) {
      var p = P(a[0]), n = a[0] === 0 ? [1, 0] : normal(a[0]);
      b += arrow('ref', p[0] + 3 * n[0], p[1] + 3 * n[1], a[1] * n[0], a[1] * n[1], 2.4);
    });
    // Cargas en la superficie: más juntas en la punta.
    [0.55, -0.55, 0.75, -0.75, 1.0, -1.0, 1.5, -1.5, 2.35, -2.35].forEach(function (t) {
      var p = P(t), n = normal(t);
      b += s06lab(p[0] - 11 * n[0], p[1] - 11 * n[1] + 5, '+', 'middle', 15);
    });
    b += s06lab(230, 160, 'E = 0', 'middle', 19) + s06lab(230, 196, 'V = cte', 'middle', 19);
    b += s06lab(620, 236, 'en la punta, E', 'end', 17) + s06lab(620, 258, 'es más fuerte', 'end', 17);
    return s06svg(340, 'Conductor metálico cargado con una punta: adentro el campo es cero y el potencial constante; afuera el campo sale perpendicular a la superficie y es más intenso en la punta, donde se juntan las cargas.', b);
  };

  /* ---------- Campo uniforme: ΔV = −E d cos θ ---------- */
  D['f2s06-uniform'] = function (s) {
    var plain = !!(s && s.plain), b = '';
    b += '<rect class="box-err" x="70" y="50" width="20" height="280" rx="4"/><rect class="box-aux" x="550" y="50" width="20" height="280" rx="4"/>';
    [100, 190, 280].forEach(function (y) { b += s06lab(80, y + 6, '+', 'middle', 17) + s06lab(560, y + 6, '−', 'middle', 17); });
    b += seg('ref', 98, 80, 542, 80, 1.8) + arrow('ref', 400, 80, 16, 0, 1.8) + s06lab(320, 66, 'E');
    if (plain) {
      b += s06lab(80, 36, '120 V', 'middle', 17) + s06lab(560, 36, '0 V', 'middle', 17);
      [176, 272, 368, 464].forEach(function (x) { b += seg('aux', x, 96, x, 300, 1.6, '6 5'); });
      b += s06dim(90, 312, 550, 312) + s06lab(320, 300, 'd = 5 mm', 'middle', 17);
      b += dot('dot-trace', 272, 230, 6) + s06lab(260, 236, 'P', 'end', 18);
      b += arrow('trace', 464, 250, 0, -110, 3) + s06lab(452, 196, 'paralelo:', 'end', 17) + s06lab(452, 218, 'W = 0', 'end', 17);
      return s06svg(340, 'Dos placas paralelas a 120 V y 0 V separadas 5 mm, con su campo uniforme, las equipotenciales paralelas a las placas y un desplazamiento paralelo a ellas.', b);
    }
    var A = [220, 230], th = 40 * RAD, L = 170, B = [A[0] + L * Math.cos(th), A[1] - L * Math.sin(th)];
    b += s06lab(320, 30, 'ΔV = −E d cos θ', 'middle', 19);
    b += seg('aux', A[0], 96, A[0], 300, 1.6, '6 5') + seg('aux', B[0], 96, B[0], 300, 1.6, '6 5');
    b += seg('axis', A[0], A[1], A[0] + 90, A[1], 1.4, '4 4');
    b += arrow('trace', A[0], A[1], B[0] - A[0], B[1] - A[1], 3);
    b += arc(A[0], A[1], 42, 0, 40, 'aux', 1.6) + s06lab(A[0] + 58 * Math.cos(20 * RAD) + 2, A[1] - 58 * Math.sin(20 * RAD) + 6, 'θ', 'start', 18);
    b += dot('dot-trace', A[0], A[1], 6) + s06lab(A[0] - 10, A[1] + 22, 'A', 'end', 18) + s06lab(B[0] + 12, B[1] - 4, 'B', 'start', 18);
    b += s06lab(268, 160, 'd', 'end', 19);
    b += s06dim(A[0], 268, B[0], 268) + s06lab((A[0] + B[0]) / 2, 296, 'd cos θ', 'middle', 17);
    b += s06lab(A[0] - 10, 322, f2s05Sub('V', 'A'), 'end', 17) + s06lab(B[0] + 10, 322, f2s05Sub('V', 'B'), 'start', 17);
    return s06svg(340, 'Campo uniforme entre placas; un desplazamiento d de A a B forma un ángulo theta con el campo y solo su parte d cos theta cambia el potencial.', b);
  };

  /* ══════════════════════ fin S06 ══════════════════════ */

  /* ══════════════════════ S07 ══════════════════════ */
  /* Flujo eléctrico. Las líneas de campo llenan la figura, así que las etiquetas que caen entre
     ellas abren un hueco en las líneas (f2s07Rows) en lugar de encimarse. */
  function f2s07Lab(x, y, s, fs, anchor) {
    var w = String(s).replace(/[̀-ͯ]/g, '').length * fs * 0.6, a = anchor || 'middle';
    var l = a === 'end' ? x - w : a === 'middle' ? x - w / 2 : x;
    return { svg: text(x, y, s, ' text-anchor="' + a + '" font-size="' + fs + '"'), gap: [l - 6, y - fs * 0.85 - 6, l + w + 6, y + fs * 0.3 + 6] };
  }
  // Líneas horizontales de campo (hacia +x) con huecos donde hay etiquetas; on(y) las resalta.
  function f2s07Rows(ys, x0, x1, gaps, on) {
    var b = '';
    ys.forEach(function (y) {
      var cuts = gaps.filter(function (g) { return y >= g[1] - 2 && y <= g[3] + 2; }).map(function (g) { return [g[0], g[2]]; }).sort(function (p, q) { return p[0] - q[0]; });
      var segs = [], x = x0;
      cuts.forEach(function (c) { if (c[1] <= x || c[0] >= x1) return; if (c[0] > x) segs.push([x, c[0]]); x = Math.max(x, c[1]); });
      if (x < x1) segs.push([x, x1]);
      var hi = on ? on(y) : true, w = hi ? 2.4 : 1.4, body = '';
      segs.forEach(function (s, i) {
        if (i === segs.length - 1 && s[1] === x1 && s[1] - s[0] > 16) body += seg('ref', s[0], y, s[1] - 2, y, w) + arrow('ref', s[1] - 12, y, 12, 0, w);
        else if (s[1] - s[0] > 2) body += seg('ref', s[0], y, s[1], y, w);
      });
      b += hi ? body : fade(body, 0.4);
    });
    return b;
  }
  function f2s07Ys(y0, y1, dy) { var o = []; for (var y = y0; y <= y1 + 1e-9; y += dy) o.push(y); return o; }
  // Llave del campo en una esquina: flecha y la letra E a su izquierda.
  function f2s07Key(x, y) { return arrow('ref', x + 28, y - 6, 52, 0, 3) + text(x + 14, y, 'E', ' text-anchor="middle" font-size="20"'); }

  /* ---------- Imagínalo: un aro bajo la lluvia ---------- */
  D['f2s07-hoop'] = function () {
    var b = '', cx = [110, 320, 530], tilt = [0, 52, 90], words = ['de frente: mucha', 'inclinado: menos', 'de canto: nada'];
    cx.forEach(function (c, i) {
      var f = tilt[i] * RAD, half = 60 * Math.abs(Math.cos(f)) + 14 * Math.abs(Math.sin(f)) * 0.2;
      for (var k = -6; k <= 6; k++) {
        var x = c + k * 14, on = Math.abs(x - c) <= half - 2;
        var l = seg('ref', x, 18, x, 236, on ? 2.4 : 1.4, '9 6');
        b += on ? l : fade(l, 0.35);
      }
      var u = [Math.cos(f), -Math.sin(f)], v = [Math.sin(f), Math.cos(f)], pts = [];
      for (var t = 0; t <= 48; t++) { var a = 2 * Math.PI * t / 48; pts.push([c + 60 * Math.cos(a) * u[0] + 14 * Math.sin(a) * v[0], 128 + 60 * Math.cos(a) * u[1] + 14 * Math.sin(a) * v[1]]); }
      b += poly('student', pts, 4.5, true);
      b += text(c, 272, words[i], ' text-anchor="middle" font-size="18"');
    });
    return svgBox('0 0 640 290', 'Tres aros bajo una lluvia vertical: de frente los cruzan muchas gotas, inclinado menos y de canto ninguna.', b);
  };

  /* ---------- Vector área: plana y cerrada ---------- */
  D['f2s07-area-vector'] = function () {
    var b = '', P = view3({ cx: 165, cy: 168, s: 48 }), Q = view3({ cx: 470, cy: 158, s: 50 });
    var R = [[-1.6, -1.1, 0], [1.6, -1.1, 0], [1.6, 1.1, 0], [-1.6, 1.1, 0]].map(P);
    b += fill('box-ref', R) + poly('ref', R, 2.2, true);
    var o = P([0, 0, 0]), t = P([0, 0, 2.1]);
    b += dot('dot-ref', o[0], o[1], 4) + arrow('error', o[0], o[1], t[0] - o[0], t[1] - o[1], 3.4);
    b += text(t[0] + 16, t[1] + 14, 'n̂', ' font-size="20"');
    b += text(165, 272, 'A = A n̂', ' text-anchor="middle" font-size="20"');
    // Caja cerrada: caras visibles y su normal hacia afuera.
    var faces3 = [
      { c: [1, 0, 0], v: [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]] },
      { c: [0, 1, 0], v: [[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]] },
      { c: [0, 0, 1], v: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]] }
    ];
    faces3.forEach(function (f) { var pts = f.v.map(Q); b += fill('box-ref', pts) + poly('ref', pts, 2, true); });
    faces3.forEach(function (f) {
      var a = Q(f.c), e = Q([f.c[0] * 1.95, f.c[1] * 1.95, f.c[2] * 1.95]);
      b += dot('dot-ref', a[0], a[1], 3.5) + arrow('error', a[0], a[1], e[0] - a[0], e[1] - a[1], 3);
    });
    b += text(470, 272, 'n̂ siempre hacia afuera', ' text-anchor="middle" font-size="18"');
    return svgBox('0 0 640 290', 'A la izquierda, un rectángulo con su vector normal n hat; el vector área es A por n hat. A la derecha, una caja cerrada con la normal de cada cara apuntando hacia afuera.', b);
  };

  /* ---------- Explainer: girar la superficie (vista de canto) ---------- */
  D['f2s07-tilt'] = function (s) {
    var th = num(s, 'th', 0), k = num(s, 'k', 1), C = [320, 175], L = 100, b = '', gaps = [], lab = [];
    var tr = th * RAD, n = [Math.cos(tr), -Math.sin(tr)], t = [Math.sin(tr), Math.cos(tr)];
    var reach = L * Math.abs(Math.cos(tr));
    function put(o) { lab.push(o.svg); gaps.push(o.gap); }
    put(f2s07Lab(C[0] + n[0] * 112, C[1] + n[1] * 112 + 7, 'n̂', 20));
    if (th > 4) put(f2s07Lab(C[0] + 60 * Math.cos(tr / 2), C[1] - 60 * Math.sin(tr / 2) + 7, 'θ', 20));
    if (k === 3) put(f2s07Lab(C[0] + 70 * Math.cos(-15 * RAD) + 6, C[1] - 70 * Math.sin(-15 * RAD) + 7, '30°', 18, 'start'));
    b += f2s07Rows(f2s07Ys(45, 305, 20), 20, 612, gaps, function (y) { return Math.abs(y - C[1]) <= reach - 1; });
    // Superficie de canto y su normal.
    b += seg('student', C[0] - L * t[0], C[1] - L * t[1], C[0] + L * t[0], C[1] + L * t[1], 7);
    b += arrow('error', C[0], C[1], n[0] * 88, n[1] * 88, 3.6);
    if (th > 4) b += arc(C[0], C[1], 40, 0, th, 'aux', 2.2);
    if (k === 3) b += arc(C[0], C[1], 52, -30, 0, 'error', 2.2);
    // Lo que «ve» el campo: la altura A cos θ, a la derecha.
    if (reach > 6) b += seg('aux', 627, C[1] - reach, 627, C[1] + reach, 2.4) + seg('aux', 621, C[1] - reach, 633, C[1] - reach, 2.4) + seg('aux', 621, C[1] + reach, 633, C[1] + reach, 2.4);
    b += lab.join('');
    var say = ['θ = 0°: todas las líneas cruzan, Φ = EA', 'θ = 60°: cruzan la mitad, Φ = EA cos 60°', 'Ojo: 30° es con la superficie; θ = 60°', 'θ = 90°: ninguna cruza, Φ = 0', 'θ = 135°: cruzan contra n̂, Φ < 0'][Math.max(0, Math.min(4, k - 1))];
    b += text(320, 352, say, ' text-anchor="middle" font-size="19"');
    b += f2s07Key(24, 26);
    return svgBox('0 0 640 370', 'Campo uniforme hacia la derecha y una superficie vista de canto que gira; la normal n hat forma el ángulo theta con el campo y se resaltan las líneas que la cruzan.', b);
  };

  /* ---------- Explainer: cubo en un campo uniforme ---------- */
  D['f2s07-cube'] = function (s) {
    var k = num(s, 'k', 1), P = view3({ cx: 330, cy: 180, s: 62 }), b = '';
    var F = {
      in: [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]],
      out: [[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]],
      xp: [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]],
      zp: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]],
      xm: [[-1, -1, -1], [-1, 1, -1], [-1, 1, 1], [-1, -1, 1]],
      zm: [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1]]
    };
    function face(id, cls, hi) { var p = F[id].map(P); return (hi ? fill(cls, p) : '') + poly(hi ? 'ref' : 'axis', p, hi ? 2.4 : 1.4, true, id === 'in' || id === 'xm' || id === 'zm' ? '6 5' : null); }
    var grid = [];
    [-0.55, 0.55].forEach(function (x) { [-0.55, 0.55].forEach(function (z) { grid.push([x, z]); }); });
    grid.forEach(function (g) { var a = P([g[0], -3, g[1]]), c = P([g[0], -1, g[1]]); b += seg('ref', a[0], a[1], c[0], c[1], 2.2); });
    b += face('xm', 'box-ref', k === 3) + face('zm', 'box-ref', k === 3) + face('in', 'box-aux', k === 1 || k === 4);
    grid.forEach(function (g) { var a = P([g[0], -1, g[1]]), c = P([g[0], 1, g[1]]); b += seg('ref', a[0], a[1], c[0], c[1], 1.4, '4 5'); });
    b += face('xp', 'box-ref', k === 3) + face('zp', 'box-ref', k === 3) + face('out', 'box-err', k === 2 || k === 4);
    grid.forEach(function (g) { var a = P([g[0], 1, g[1]]), c = P([g[0], 3, g[1]]); b += arrow('ref', a[0], a[1], c[0] - a[0], c[1] - a[1], 2.2); });
    function normal(c, d) { var a = P(c), e = P([c[0] + d[0], c[1] + d[1], c[2] + d[2]]); return arrow('error', a[0], a[1], e[0] - a[0], e[1] - a[1], 3); }
    if (k === 1 || k === 4) b += normal([0, -1, 0], [0, -0.9, 0]);
    if (k === 2 || k === 4) b += normal([0, 1, 0], [0, 0.9, 0]);
    if (k === 3) b += normal([1, 0, 0], [0.9, 0, 0]) + normal([0, 0, 1], [0, 0, 0.9]);
    var say = ['Cara de entrada: n̂ contra E, Φ = −EA', 'Cara de salida: n̂ con E, Φ = +EA', 'Las otras cuatro: E paralelo a la cara, Φ = 0', 'Total: −EA + EA + 0 = 0'][Math.max(0, Math.min(3, k - 1))];
    b += text(320, 340, say, ' text-anchor="middle" font-size="19"');
    b += f2s07Key(24, 30);
    return svgBox('0 0 640 360', 'Cubo en un campo eléctrico uniforme que lo atraviesa de izquierda a derecha; se resaltan la cara de entrada, la de salida y las cuatro caras paralelas al campo, con sus normales hacia afuera.', b);
  };

  /* ---------- Prisma triangular (de canto) ---------- */
  D['f2s07-prism'] = function () {
    var O = [200, 290], B = [440, 290], T = [200, 110], b = '', gaps = [], lab = [];
    function put(o) { lab.push(o.svg); gaps.push(o.gap); }
    put(f2s07Lab(150, 156, 'pared: Φ < 0', 18, 'end'));
    put(f2s07Lab(392, 128, 'inclinada: Φ > 0', 18, 'start'));
    b += f2s07Rows(f2s07Ys(70, 270, 20), 20, 612, gaps, function (y) { return y > T[1] && y < O[1]; });
    b += fill('box-ref', [O, B, T]) + poly('student', [O, B, T], 4, true);
    b += arrow('error', 200, 200, -46, 0, 3) + arrow('error', 320, 200, 0.6 * 52, -0.8 * 52, 3) + arrow('error', 320, 290, 0, 40, 3);
    b += lab.join('');
    b += text(338, 326, 'base: Φ = 0', ' font-size="18"');
    b += f2s07Key(24, 30);
    return svgBox('0 0 640 345', 'Prisma triangular visto de canto en un campo horizontal: el campo entra por la pared vertical, sale por la cara inclinada y corre paralelo a la base.', b);
  };

  /* ---------- Explainer: campo no uniforme, franjas ---------- */
  D['f2s07-strips'] = function (s) {
    var k = num(s, 'k', 1), b = '', x0 = 150, x1 = 430, yb = 290, yt = 60, ys = 168;
    b += arrow('axis', 120, 305, 0, -262, 1.8) + text(104, 52, 'y', ' text-anchor="middle" font-size="20"');
    b += arrow('axis', 120, 305, 340, 0, 1.8) + text(476, 312, 'z', ' font-size="20"');
    b += poly('student', [[x0, yb], [x1, yb], [x1, yt], [x0, yt]], 3, true);
    if (k >= 2) b += '<rect class="rect-fill" x="' + x0 + '" y="' + (ys - 10) + '" width="' + (x1 - x0) + '" height="20"/>';
    for (var r = 0; r < 5; r++) {
      var y = yb - 30 - r * 46, m = 2.5 + r * 2;
      for (var c = 0; c < 5; c++) {
        var x = x0 + 28 + c * 56;
        b += '<circle class="ref" fill="none" stroke-width="2" cx="' + x + '" cy="' + y + '" r="' + r1(m + 4) + '"/>' + dot('dot-ref', x, y, 2.5);
      }
    }
    if (k >= 2) b += text(440, ys + 7, 'dy', ' font-size="18"');
    b += text(80, 180, 's', ' text-anchor="middle" font-size="20"') + seg('aux', 92, yt, 92, yb, 1.6) + seg('aux', 86, yt, 98, yt, 1.6) + seg('aux', 86, yb, 98, yb, 1.6);
    b += text(290, 343, 'L', ' text-anchor="middle" font-size="20"') + seg('aux', x0, 316, x1, 316, 1.6);
    var rows = ['E = c y','dA = L dy', 'dΦ = c y L dy', 'Φ = c L s²/2'];
    for (var i = 0; i < Math.min(k, 4); i++) b += text(492, 96 + i * 44, rows[i], ' font-size="18"');
    return svgBox('0 0 640 350', 'Rectángulo en el plano de la hoja con un campo que sale de la hoja y crece con la altura y (círculos con punto cada vez más grandes); se marca una franja horizontal de alto dy.', b);
  };

  /* ---------- Adelanto de Gauss: dos esferas, las mismas líneas ---------- */
  D['f2s07-gauss'] = function () {
    var C = [250, 175], b = '';
    for (var i = 0; i < 12; i++) {
      var a = i * 30 * RAD, c = Math.cos(a), sn = -Math.sin(a);
      b += arrow('ref', C[0] + 20 * c, C[1] + 20 * sn, 140 * c, 140 * sn, 2);
    }
    b += poly('student', f2s07Circ(C, 62), 3, true) + poly('student', f2s07Circ(C, 124), 3, true, '8 6');
    b += '<circle class="box-err" cx="' + C[0] + '" cy="' + C[1] + '" r="14"/>' + text(C[0], C[1] + 7, '+', ' text-anchor="middle" font-size="22"');
    b += text(452, 150, 'Φ = q/ε₀', ' font-size="22"') + text(452, 190, 'en las dos', ' font-size="18"');
    return svgBox('0 0 640 350', 'Una carga positiva en el centro de dos esferas, una chica y otra del doble de radio; las mismas doce líneas de campo atraviesan las dos.', b);
  };
  function f2s07Circ(C, r) { var o = []; for (var i = 0; i < 72; i++) o.push([C[0] + r * Math.cos(i * Math.PI / 36), C[1] + r * Math.sin(i * Math.PI / 36)]); return o; }

  /* ══════════════════════ fin S07 ══════════════════════ */

  /* ══════════════════════ S08 ══════════════════════ */
  /* Ley de Gauss. Los explainers usan state.g (geometría), state.k (paso, texto '1'…'6', para que
     no se interpole) y state.r (tamaño de la superficie gaussiana en unidades de R; sí se anima). */
  function f2s08Q(x, y, sign, r, fs) {
    r = r || 14; fs = fs || 18;
    return '<circle class="' + (sign > 0 ? 'box-err' : 'box-aux') + '" cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r + '"/>' +
      text(x, y + fs * 0.35, sign > 0 ? '+' : '−', ' text-anchor="middle" font-size="' + fs + '"');
  }
  function f2s08Lab(x, y, s, anchor, fs) { return text(x, y, s, ' text-anchor="' + (anchor || 'start') + '" font-size="' + (fs || 22) + '"'); }
  function f2s08Plus(x, y, fs) { return text(x, y + (fs || 15) * 0.35, '+', ' text-anchor="middle" font-size="' + (fs || 15) + '"'); }
  var f2s08QE = 'q<tspan baseline-shift="sub" font-size="70%">enc</tspan>';
  function f2s08Ell(cx, cy, rx, ry, n) {
    var o = [];
    n = n || 64;
    for (var i = 0; i <= n; i++) { var a = 2 * Math.PI * i / n; o.push([cx + rx * Math.cos(a), cy - ry * Math.sin(a)]); }
    return o;
  }
  // Corona (anillo grueso) entre dos círculos: relleno de carga.
  function f2s08Ring(cls, cx, cy, a, b) {
    function c(r) { return 'M' + r1(cx - r) + ' ' + r1(cy) + 'A' + r + ' ' + r + ' 0 1 0 ' + r1(cx + r) + ' ' + r1(cy) + 'A' + r + ' ' + r + ' 0 1 0 ' + r1(cx - r) + ' ' + r1(cy) + 'Z'; }
    return '<path class="' + cls + '" fill-rule="evenodd" d="' + c(b) + c(a) + '"/>';
  }
  function f2s08Step(s) { var k = s && s.k != null ? parseInt(s.k, 10) : 1; return isFinite(k) ? k : 1; }
  // Dos renglones de anotación del paso, a la derecha.
  function f2s08Note(lines, x, y0) {
    var b = '';
    (lines || []).forEach(function (t, i) { if (t) b += f2s08Lab(x || 350, (y0 || 42) + i * 36, t, 'start', 26); });
    return b;
  }
  // Gráfica E contra r a la derecha: f(r) con E(R) = 1; marca R y el punto actual.
  function f2s08Plot(f, r, markR) {
    var O = [380, 300], sx = 100, sy = 90, top = 118, b = '';
    b += arrow('axis', O[0], O[1], 236, 0, 1.6) + arrow('axis', O[0], O[1], 0, -186, 1.6);
    b += f2s08Lab(370, 128, 'E', 'end') + f2s08Lab(606, 328, 'r', 'middle');
    if (markR) b += seg('axis', O[0] + sx, O[1] - 5, O[0] + sx, O[1] + 5, 1.6) + f2s08Lab(O[0] + sx, 328, 'R', 'middle', 20);
    var pts = [], prev = null;
    for (var i = 1; i <= 220; i++) {
      var t = 2.25 * i / 220, y = O[1] - sy * f(t);
      if (prev != null && Math.abs(f(t) - prev) > 0.3) { b += poly('ref', pts, 2.6); pts = []; }
      prev = f(t);
      if (y < top) { if (pts.length) b += poly('ref', pts, 2.6); pts = []; continue; }
      pts.push([O[0] + sx * t, y]);
    }
    if (pts.length) b += poly('ref', pts, 2.6);
    var yd = O[1] - sy * f(r);
    if (yd >= top) b += dot('dot-trace', O[0] + sx * r, yd, 6);
    return b;
  }
  function f2s08Svg(h, label, body) { return svgBox('0 0 640 ' + h, label, body); }

  /* ---------- La ley: solo cuenta lo de adentro ---------- */
  D['f2s08-law'] = function () {
    var b = '', C = [220, 170], q3 = [520, 60];
    var blob = [];
    for (var i = 0; i <= 96; i++) { var a = 2 * Math.PI * i / 96, m = 1 + 0.08 * Math.sin(3 * a); blob.push([C[0] + 150 * m * Math.cos(a), C[1] - 105 * m * Math.sin(a)]); }
    b += poly('trace', blob, 3, true, '10 7');
    // Líneas de campo de la carga de afuera: entran a la superficie y vuelven a salir.
    [200, 210, 220].forEach(function (deg) {
      var ux = Math.cos(deg * RAD), uy = -Math.sin(deg * RAD), t1 = 20, t2 = 1000;
      t2 = Math.min(t2, (q3[0] - 22) / -ux, (288 - q3[1]) / uy);
      b += seg('aux', q3[0] + ux * t1, q3[1] + uy * t1, q3[0] + ux * t2, q3[1] + uy * t2, 2);
      [0.25, 0.75].forEach(function (f) { var t = t1 + (t2 - t1) * f; b += arrow('aux', q3[0] + ux * (t - 10), q3[1] + uy * (t - 10), ux * 12, uy * 12, 2); });
    });
    b += f2s08Q(120, 130, 1) + f2s08Q(230, 120, -1) + f2s08Q(q3[0], q3[1], 1);
    b += f2s08Lab(120, 172, 'q₁', 'middle') + f2s08Lab(230, 96, 'q₂', 'middle') + f2s08Lab(544, 66, 'q₃');
    b += f2s08Lab(20, 30, 'q₃ queda afuera: lo que entra, sale');
    b += f2s08Lab(620, 284, 'Φ = (q₁ + q₂)/ε₀', 'end');
    return f2s08Svg(300, 'Superficie cerrada con dos cargas adentro y una afuera; las líneas de la carga de afuera entran a la superficie y vuelven a salir.', b);
  };

  /* ---------- Tres simetrías, tres superficies ---------- */
  D['f2s08-symmetry'] = function () {
    var b = '', i;
    // Esférica
    b += poly('trace', f2s08Ell(110, 110, 60, 60), 2.6, true, '8 6');
    for (i = 0; i < 8; i++) { var a = (22.5 + 45 * i) * RAD; b += arrow('ref', 110 + 60 * Math.cos(a), 110 - 60 * Math.sin(a), 22 * Math.cos(a), -22 * Math.sin(a), 2.4); }
    b += f2s08Q(110, 110, 1, 12, 16);
    // Cilíndrica
    b += '<rect class="box-err" x="315" y="14" width="10" height="190" rx="3"/>';
    b += poly('trace', [[280, 50], [280, 170]], 2.6, false, '8 6') + poly('trace', [[360, 50], [360, 170]], 2.6, false, '8 6');
    b += poly('trace', f2s08Ell(320, 50, 40, 9), 2, true, '6 5') + poly('trace', f2s08Ell(320, 170, 40, 9), 2, true, '6 5');
    [85, 110, 135].forEach(function (y) { b += arrow('ref', 280, y, -24, 0, 2.4) + arrow('ref', 360, y, 24, 0, 2.4); });
    // Plana
    b += '<rect class="box-err" x="524" y="14" width="12" height="190" rx="3"/>';
    b += f2s08Plus(530, 36, 13) + f2s08Plus(530, 182, 13);
    b += poly('trace', [[480, 80], [580, 80]], 2.6, false, '8 6') + poly('trace', [[480, 140], [580, 140]], 2.6, false, '8 6');
    b += poly('trace', f2s08Ell(480, 110, 8, 30), 2, true, '6 5') + poly('trace', f2s08Ell(580, 110, 8, 30), 2, true, '6 5');
    [100, 120].forEach(function (y) { b += arrow('ref', 472, y, -24, 0, 2.4) + arrow('ref', 588, y, 24, 0, 2.4); });
    // Nombres
    [[110, 'esférica', 'esfera'], [320, 'cilíndrica', 'cilindro'], [530, 'plana', 'cilindro o caja']].forEach(function (c) {
      b += f2s08Lab(c[0], 228, 'simetría ' + c[1], 'middle', 21) + f2s08Lab(c[0], 252, '→ ' + c[2], 'middle', 21);
    });
    return f2s08Svg(262, 'Tres simetrías: una carga puntual dentro de una esfera gaussiana, una línea dentro de un cilindro coaxial y un plano atravesado por un cilindro corto; en cada una el campo sale perpendicular a la superficie.', b);
  };

  /* ---------- Esferas: carga puntual, esfera sólida, cascarón y conductor ---------- */
  var F2S08_SPH = {
    point: [['simetría esférica:', 'E radial, igual a igual r'], ['esfera gaussiana', 'de radio r'], ['E ⊥ y constante:', 'Φ = E · 4πr²'],
      [f2s08QE + ' = q', 'toda la carga'], ['E · 4πr² = q/ε₀', 'E = q/(4πε₀r²)'], ['= kq/r²: Coulomb', 'de nuevo (S03)']],
    solid: [['ρ uniforme:', 'simetría esférica'], ['esfera gaussiana', 'adentro: r < R'], ['E ⊥ y constante:', 'Φ = E · 4πr²'],
      [f2s08QE + ' = Q r³/R³', 'solo lo sombreado'], ['E = kQr/R³', 'crece con r'], ['afuera: ' + f2s08QE + ' = Q', 'E = kQ/r²; en R, igual']],
    shell: [['carga solo en r = R:', 'simetría esférica'], ['esfera gaussiana', 'adentro: r < R'], ['E ⊥ y constante:', 'Φ = E · 4πr²'],
      [f2s08QE + ' = 0', 'la carga queda afuera'], ['E · 4πr² = 0', 'E = 0 adentro'], ['afuera: ' + f2s08QE + ' = Q', 'E = kQ/r²']],
    conductor: [['conductor en equilibrio:', 'la carga, en la orilla'], ['esfera gaussiana', 'dentro del metal'], ['E ⊥ y constante:', 'Φ = E · 4πr²'],
      [f2s08QE + ' = 0', 'el metal es neutro'], ['E = 0 en el metal', 'nada se mueve ya'], ['afuera: E = kQ/r²', 'como carga puntual']]
  };
  function f2s08SphF(g, t) {
    if (g === 'point') return 1 / (t * t);
    if (g === 'solid') return t < 1 ? t : 1 / (t * t);
    return t < 1 ? 0 : 1 / (t * t);
  }
  D['f2s08-sphere'] = function (s) {
    var g = (s && s.g) || 'point', k = f2s08Step(s), r = Math.max(0.3, Math.min(1.5, num(s, 'r', 1))), C = [180, 175], RP = 80, rp = r * RP, b = '', i, a;
    if (g === 'solid') b += '<circle class="box-err" cx="' + C[0] + '" cy="' + C[1] + '" r="' + RP + '"/>';
    if (g === 'shell') b += f2s08Ring('box-err', C[0], C[1], RP - 8, RP + 8);
    if (g === 'conductor') b += '<circle class="box-ref" cx="' + C[0] + '" cy="' + C[1] + '" r="' + RP + '"/>';
    // q_enc sombreada (otra capa encima de lo encerrado).
    if (k >= 4 && g === 'solid') b += '<circle class="box-err" cx="' + C[0] + '" cy="' + C[1] + '" r="' + r1(Math.min(rp, RP)) + '"/>';
    if (k >= 4 && g === 'shell' && r >= 1) b += f2s08Ring('box-err', C[0], C[1], RP - 8, RP + 8);
    if (g === 'point') b += f2s08Q(C[0], C[1], 1, 18, 22);
    if (g === 'solid') for (i = 0; i < 4; i++) { a = i * 90 * RAD; b += f2s08Plus(C[0] + 0.3 * RP * Math.cos(a), C[1] - 0.3 * RP * Math.sin(a)) + f2s08Plus(C[0] + 0.86 * RP * Math.cos(a), C[1] - 0.86 * RP * Math.sin(a)); }
    if (g === 'shell') for (i = 0; i < 4; i++) { a = i * 90 * RAD; b += f2s08Plus(C[0] + RP * Math.cos(a), C[1] - RP * Math.sin(a), 14); }
    if (g === 'conductor') for (i = 0; i < 8; i++) { a = i * 45 * RAD; b += f2s08Plus(C[0] + (RP - 11) * Math.cos(a), C[1] - (RP - 11) * Math.sin(a), 14); }
    if (k >= 2) b += '<circle class="trace" fill="none" stroke-width="3" stroke-dasharray="9 6" cx="' + C[0] + '" cy="' + C[1] + '" r="' + r1(rp) + '"/>';
    var f = f2s08SphF(g, r);
    if (k >= 3 && f > 0) for (i = 0; i < 8; i++) {
      a = (22.5 + 45 * i) * RAD;
      var L = 34 * Math.min(1, f);
      b += arrow('ref', C[0] + rp * Math.cos(a), C[1] - rp * Math.sin(a), L * Math.cos(a), -L * Math.sin(a), 2.6);
    }
    b += f2s08Note((F2S08_SPH[g] || F2S08_SPH.point)[Math.min(6, Math.max(1, k)) - 1]);
    if (k >= 5) b += f2s08Plot(function (t) { return f2s08SphF(g, t); }, r, g !== 'point');
    return f2s08Svg(340, 'Corte de una distribución con simetría esférica y una esfera gaussiana de radio r; a la derecha, la gráfica del campo E contra r.', b);
  };

  /* ---------- Línea y cilindro infinitos ---------- */
  var F2S08_CYL = {
    line: [['simetría cilíndrica:', 'E radial, ⊥ a la línea'], ['cilindro gaussiano:', 'radio r, largo L'], ['lado: Φ = E · 2πrL', 'tapas: Φ = 0'],
      [f2s08QE + ' = λL', 'lo que hay en el largo L'], ['E · 2πrL = λL/ε₀', 'E = λ/(2πε₀r)'], ['= 2kλ/r', 'igual que en S04']],
    cyl: [['cilindro sólido:', 'simetría cilíndrica'], ['cilindro gaussiano', 'adentro: r < R'], ['lado: Φ = E · 2πrL', 'tapas: Φ = 0'],
      [f2s08QE + ' = λL · r²/R²', 'solo lo sombreado'], ['E = λr/(2πε₀R²)', 'crece con r'], ['afuera: E = λ/(2πε₀r)', 'como la línea']]
  };
  function f2s08CylF(g, t) { return g === 'line' ? 1 / t : t < 1 ? t : 1 / t; }
  D['f2s08-line'] = function (s) {
    var g = (s && s.g) || 'line', k = f2s08Step(s), r = Math.max(0.3, Math.min(1.7, num(s, 'r', 1.6))), X = 170, RP = 45, rp = r * RP, y0 = 85, y1 = 265, b = '';
    if (g === 'line') {
      b += '<rect class="box-err" x="' + (X - 8) + '" y="18" width="16" height="314" rx="4"/>';
      if (k >= 4) b += '<rect class="box-err" x="' + (X - 8) + '" y="' + y0 + '" width="16" height="' + (y1 - y0) + '"/>';
      [45, 140, 215, 318].forEach(function (y) { b += f2s08Plus(X, y); });
    } else {
      b += '<rect class="box-err" x="' + (X - RP) + '" y="18" width="' + 2 * RP + '" height="314"/>';
      if (k >= 4) { var w = Math.min(rp, RP); b += '<rect class="box-err" x="' + r1(X - w) + '" y="' + y0 + '" width="' + r1(2 * w) + '" height="' + (y1 - y0) + '"/>'; }
      [45, 140, 215, 318].forEach(function (y) { b += f2s08Plus(X, y); });
      [45, 318].forEach(function (y) { b += f2s08Plus(X - 33, y) + f2s08Plus(X + 33, y); });
    }
    if (k >= 2) {
      b += poly('trace', [[X - rp, y0], [X - rp, y1]], 3, false, '9 6') + poly('trace', [[X + rp, y0], [X + rp, y1]], 3, false, '9 6');
      b += poly('trace', f2s08Ell(X, y0, rp, rp * 0.25), 2.2, true, '7 5') + poly('trace', f2s08Ell(X, y1, rp, rp * 0.25), 2.2, true, '7 5');
    }
    var f = f2s08CylF(g, r);
    if (k >= 3) [130, 175, 220].forEach(function (y) { var L = 34 * Math.min(1, f); b += arrow('ref', X - rp, y, -L, 0, 2.6) + arrow('ref', X + rp, y, L, 0, 2.6); });
    b += f2s08Note((F2S08_CYL[g] || F2S08_CYL.line)[Math.min(6, Math.max(1, k)) - 1]);
    if (k >= 5) b += f2s08Plot(function (t) { return f2s08CylF(g, t); }, r, g !== 'line');
    return f2s08Svg(340, 'Vista de lado de una distribución infinita a lo largo de un eje, rodeada por un cilindro gaussiano coaxial de radio r; a la derecha, la gráfica de E contra r.', b);
  };

  /* ---------- Plano infinito y placa conductora ---------- */
  var F2S08_PLA = {
    sheet: [['simetría plana:', 'E ⊥ al plano'], ['cilindro corto que', 'cruza el plano'], ['tapas: Φ = 2EA', 'lado: Φ = 0'],
      [f2s08QE + ' = σA', 'el círculo sombreado'], ['2EA = σA/ε₀', 'E = σ/(2ε₀)'], ['no depende de x:', 'el disco de S04, R → ∞']],
    plate: [['placa conductora:', 'σ en cada cara'], ['una tapa dentro', 'del metal'], ['adentro E = 0:', 'sale por una sola tapa'],
      [f2s08QE + ' = σA', 'la carga de esa cara'], ['EA = σA/ε₀', 'E = σ/ε₀'], ['el doble que una', 'hoja sola de carga']]
  };
  D['f2s08-plane'] = function (s) {
    var g = (s && s.g) || 'sheet', k = f2s08Step(s), b = '', Y0 = 95, Y1 = 205, xa = g === 'plate' ? 200 : 110, xb = 290;
    if (g === 'sheet') {
      b += '<rect class="box-err" x="194" y="15" width="12" height="270" rx="3"/>';
      if (k >= 4) b += '<rect class="box-err" x="194" y="' + Y0 + '" width="12" height="' + (Y1 - Y0) + '"/>';
      [40, 72, 228, 262].forEach(function (y) { b += f2s08Plus(200, y, 13); });
    } else {
      b += '<rect class="box-ref" x="170" y="15" width="60" height="270"/>';
      if (k >= 4) b += '<rect class="box-err" x="222" y="' + Y0 + '" width="8" height="' + (Y1 - Y0) + '"/>';
      [40, 72, 228, 262].forEach(function (y) { b += f2s08Plus(179, y, 14) + f2s08Plus(221, y, 14); });
    }
    if (k >= 2) {
      b += poly('trace', [[xa, Y0], [xb, Y0]], 3, false, '9 6') + poly('trace', [[xa, Y1], [xb, Y1]], 3, false, '9 6');
      b += poly('trace', f2s08Ell(xa, 150, 13, 55), 2.2, true, '7 5') + poly('trace', f2s08Ell(xb, 150, 13, 55), 2.2, true, '7 5');
    }
    if (k >= 3) [125, 150, 175].forEach(function (y) {
      b += arrow('ref', xb + 13, y, 34, 0, 2.6);
      if (g === 'sheet') b += arrow('ref', xa - 13, y, -34, 0, 2.6);
    });
    b += f2s08Note((F2S08_PLA[g] || F2S08_PLA.sheet)[Math.min(6, Math.max(1, k)) - 1]);
    return f2s08Svg(300, g === 'sheet' ? 'Plano infinito con carga positiva, de lado, atravesado por un cilindro gaussiano corto; el campo sale perpendicular por las dos tapas.' : 'Placa conductora gruesa con carga en sus caras y un cilindro gaussiano con una tapa dentro del metal; el campo solo sale por la tapa de afuera.', b);
  };

  /* ---------- Conductor con una cavidad ---------- */
  D['f2s08-conductor'] = function () {
    var b = '', C = [210, 150], cav = [200, 150], i, a;
    var out = f2s08Ell(C[0], C[1], 175, 128, 96);
    function ring(cx, cy, r, ccw) {
      var o = [];
      for (var j = 0; j <= 64; j++) { var t = (ccw ? -1 : 1) * 2 * Math.PI * j / 64; o.push([cx + r * Math.cos(t), cy - r * Math.sin(t)]); }
      return o;
    }
    var d = out.map(function (p, j) { return (j ? 'L' : 'M') + r1(p[0]) + ' ' + r1(p[1]); }).join('') + 'Z' +
      ring(cav[0], cav[1], 52, true).map(function (p, j) { return (j ? 'L' : 'M') + r1(p[0]) + ' ' + r1(p[1]); }).join('') + 'Z';
    b += '<path class="box-ref" fill-rule="evenodd" d="' + d + '"/>';
    b += f2s08Q(cav[0], cav[1], 1, 15, 18);
    for (i = 0; i < 6; i++) { a = (30 + 60 * i) * RAD; b += text(cav[0] + 64 * Math.cos(a), cav[1] - 64 * Math.sin(a) + 6, '−', ' text-anchor="middle" font-size="18"'); }
    for (i = 0; i < 10; i++) { a = (18 + 36 * i) * RAD; b += f2s08Plus(C[0] + 158 * Math.cos(a), C[1] - 112 * Math.sin(a), 15); }
    b += '<circle class="trace" fill="none" stroke-width="3" stroke-dasharray="9 6" cx="' + cav[0] + '" cy="' + cav[1] + '" r="88"/>';
    b += f2s08Lab(408, 52, 'E = 0 en el metal') + f2s08Lab(408, 84, 'gaussiana: Φ = 0');
    b += f2s08Lab(408, 116, '→ ' + f2s08QE + ' = 0') + f2s08Lab(408, 192, 'pared: −q') + f2s08Lab(408, 224, 'orilla de afuera: +q');
    return f2s08Svg(300, 'Conductor con una cavidad que tiene una carga positiva q; en la pared de la cavidad se acumula −q y en la orilla de afuera +q. Una superficie gaussiana dentro del metal encierra carga neta cero.', b);
  };


  /* ══════════════════════ fin S08 ══════════════════════ */

  /* ══════════════════════ S09 ══════════════════════ */
  function f2s09Sub(main, sub) { return main + '<tspan baseline-shift="sub" font-size="70%">' + sub + '</tspan>'; }
  // Flecha con la punta a la mitad (para líneas de campo curvas).
  function f2s09Mid(pts, cls) {
    var i = Math.floor(pts.length / 2), a = pts[i - 1], b = pts[i + 1];
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, c = pts[i], hh = 9;
    return '<path class="' + cls + '" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M' +
      r1(c[0] - ux * hh - uy * hh * 0.6) + ' ' + r1(c[1] - uy * hh + ux * hh * 0.6) + 'L' + r1(c[0]) + ' ' + r1(c[1]) + 'L' + r1(c[0] - ux * hh + uy * hh * 0.6) + ' ' + r1(c[1] - uy * hh - ux * hh * 0.6) + '"/>';
  }
  function f2s09Bez(p0, p1, p2, n) {
    var o = [];
    for (var i = 0; i <= n; i++) { var t = i / n, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t; o.push([a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1]]); }
    return o;
  }
  // Anillo (cascarón visto en corte) con regla par-impar.
  function f2s09Ring(cx, cy, r0, r1_, cls) {
    var c = function (r, sw) { return 'M' + r1(cx + r) + ' ' + r1(cy) + 'A' + r + ' ' + r + ' 0 1 ' + sw + ' ' + r1(cx - r) + ' ' + r1(cy) + 'A' + r + ' ' + r + ' 0 1 ' + sw + ' ' + r1(cx + r) + ' ' + r1(cy); };
    return '<path class="' + cls + '" fill-rule="evenodd" d="' + c(r1_, 0) + c(r0, 1) + 'Z"/>';
  }

  // Dos conductores cualesquiera con +Q y −Q y las líneas de campo entre ellos.
  D['f2s09-conductors'] = function () {
    var L = [[70, 150], [96, 92], [150, 84], [196, 112], [204, 168], [172, 222], [112, 226], [76, 196]];
    var R = [[436, 120], [480, 82], [540, 96], [566, 150], [548, 214], [490, 232], [446, 204]];
    var smooth = function (P) {
      var d = '';
      for (var i = 0; i < P.length; i++) {
        var p = P[i], q = P[(i + 1) % P.length], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
        if (i === 0) d += 'M' + r1((P[P.length - 1][0] + p[0]) / 2) + ' ' + r1((P[P.length - 1][1] + p[1]) / 2);
        d += 'Q' + r1(p[0]) + ' ' + r1(p[1]) + ' ' + r1(m[0]) + ' ' + r1(m[1]);
      }
      return d + 'Z';
    };
    var b = '';
    [[[204, 140], [320, 110], [440, 130]], [[206, 166], [320, 166], [446, 170]], [[190, 200], [320, 230], [452, 210]], [[150, 90], [300, 30], [470, 88]], [[150, 224], [300, 290], [490, 228]]]
      .forEach(function (c) { var pts = f2s09Bez(c[0], c[1], c[2], 40); b += poly('ref', pts, 2) + f2s09Mid(pts, 'ref'); });
    b += '<path class="box-err" d="' + smooth(L) + '"/>' + '<path class="box-aux" d="' + smooth(R) + '"/>';
    [[110, 130], [160, 120], [130, 185], [176, 175]].forEach(function (p) { b += text(p[0], p[1], '+', ' text-anchor="middle" font-size="20"'); });
    [[480, 130], [530, 135], [495, 190], [535, 185]].forEach(function (p) { b += text(p[0], p[1], '−', ' text-anchor="middle" font-size="20"'); });
    b += text(60, 80, '+Q', ' text-anchor="end" font-size="18"') + text(580, 80, '−Q', ' font-size="18"') +
      text(320, 300, 'V = V₊ − V₋     C = Q / V', ' text-anchor="middle" font-size="17"');
    return svgBox('0 0 640 320', 'Dos conductores de forma cualquiera, uno con carga +Q y otro con −Q, y las líneas de campo que van del positivo al negativo', b);
  };

  // Explainer: placas paralelas, de Q a C.
  D['f2s09-plates'] = function (s) {
    var k = num(s, 'k', 1), b = '', xl = 230, xr = 410, T = 14, top = 50, bot = 270;
    if (k === 2) b += '<rect class="aux" fill="none" stroke-width="2" stroke-dasharray="6 5" x="206" y="132" width="86" height="56"/>';
    var ys = k === 4 ? [80, 120, 200, 240] : [80, 120, 160, 200, 240];
    if (k >= 3) ys.forEach(function (y) { b += arrow('ref', xl + 6, y, xr - xl - 12, 0, 2); });
    if (k === 2) b += arrow('ref', 292, 160, 52, 0, 2.5) + text(318, 150, 'E', ' text-anchor="middle" font-size="17"');
    b += '<rect class="box-err" x="' + (xl - T) + '" y="' + top + '" width="' + T + '" height="' + (bot - top) + '"/>' +
      '<rect class="box-aux" x="' + xr + '" y="' + top + '" width="' + T + '" height="' + (bot - top) + '"/>';
    for (var i = 0; i < 7; i++) { var y = top + 22 + i * 30; b += text(xl - T / 2, y, '+', ' text-anchor="middle" font-size="15"') + text(xr + T / 2, y, '−', ' text-anchor="middle" font-size="15"'); }
    b += text(xl - T / 2, 38, '+Q', ' text-anchor="middle" font-size="17"') + text(xr + T / 2, 38, '−Q', ' text-anchor="middle" font-size="17"');
    if (k === 1) b += text(200, 165, 'área A', ' text-anchor="end" font-size="16"');
    if (k === 2) b += text(196, 126, 'caja gaussiana', ' text-anchor="end" font-size="16"');
    if (k === 3) b += text(150, 165, 'E = 0', ' text-anchor="middle" font-size="16"') + text(500, 165, 'E = 0', ' text-anchor="middle" font-size="16"');
    if (k === 4) b += arrow('trace', xl + 10, 160, xr - xl - 20, 0, 3) + text(320, 150, 'dx', ' text-anchor="middle" font-size="16"');
    if (k === 1 || k >= 4) b += seg('axis', xl, 288, xr, 288, 1.4) + seg('axis', xl, 281, xl, 295, 1.4) + seg('axis', xr, 281, xr, 295, 1.4) + text(320, 306, 'd', ' text-anchor="middle" font-size="16"');
    var f = {
      1: 'σ = Q / A en cada placa',
      2: 'E·A' + '<tspan baseline-shift="sub" font-size="70%">caja</tspan> = σA<tspan baseline-shift="sub" font-size="70%">caja</tspan> / ε₀  →  E = σ / ε₀',
      3: 'campo uniforme, de la placa + a la −',
      4: 'V = V₊ − V₋ = ∫ E dx, de 0 a d',
      5: 'V = E d = Q d / (ε₀ A)',
      6: 'C = Q / V = ε₀ A / d'
    }[k];
    if (f) b += text(320, 332, f, ' text-anchor="middle" font-size="17"');
    return svgBox('0 0 640 345', 'Dos placas paralelas vistas de lado, la izquierda con +Q y la derecha con −Q, separadas una distancia d, con el campo uniforme entre ellas.', b);
  };

  // Explainer: coaxial o esférico visto en corte, con la cadena a la derecha.
  function f2s09Radial(s, sph) {
    var k = num(s, 'k', 1), b = '', cx = 190, cy = 160, a = 38, B = 108, T = 24, rg = 74;
    if (sph) b += '<ellipse class="axis" fill="none" stroke-width="1.2" stroke-dasharray="4 5" cx="' + cx + '" cy="' + cy + '" rx="' + (B + T / 2) + '" ry="' + ((B + T / 2) * 0.3).toFixed(1) + '"/>';
    if (k >= 3) for (var j = 0; j < 8; j++) {
      var t = (j * 45 + 22.5) * RAD, ux = Math.cos(t), uy = Math.sin(t);
      if (k === 4 && j === 7) continue;
      b += arrow('ref', cx + ux * (a + 5), cy + uy * (a + 5), ux * (B - a - 12), uy * (B - a - 12), 2);
    }
    if (k === 2) b += '<circle class="trace" fill="none" stroke-width="2" stroke-dasharray="6 5" cx="' + cx + '" cy="' + cy + '" r="' + rg + '"/>' +
      seg('axis', cx + (a + 3) * Math.cos(-60 * RAD), cy + (a + 3) * Math.sin(-60 * RAD), cx + rg * Math.cos(-60 * RAD), cy + rg * Math.sin(-60 * RAD), 1.4) +
      text(cx + 14, cy - 50, 'r', ' text-anchor="end" font-size="16"');
    if (k === 4) { var t4 = 337.5 * RAD; b += arrow('trace', cx + Math.cos(t4) * (a + 5), cy + Math.sin(t4) * (a + 5), Math.cos(t4) * (B - a - 12), Math.sin(t4) * (B - a - 12), 3); }
    b += f2s09Ring(cx, cy, B, B + T, 'box-aux');
    [45, 135, 225, 315].forEach(function (d) { b += text(cx + (B + T / 2) * Math.cos(d * RAD), cy - (B + T / 2) * Math.sin(d * RAD) + 6, '−', ' text-anchor="middle" font-size="19"'); });
    b += '<circle class="box-err" cx="' + cx + '" cy="' + cy + '" r="' + a + '"/>' + text(cx, cy + 7, '+', ' text-anchor="middle" font-size="20"');
    if (k === 1) {
      b += seg('axis', cx, 300, cx + a, 300, 1.4) + seg('axis', cx, 294, cx, 306, 1.4) + seg('axis', cx + a, 294, cx + a, 306, 1.4) + text(cx + a + 10, 305, 'a', ' font-size="16"');
      b += seg('axis', cx, 322, cx + B, 322, 1.4) + seg('axis', cx, 316, cx, 328, 1.4) + seg('axis', cx + B, 316, cx + B, 328, 1.4) + text(cx + B + 10, 327, 'b', ' font-size="16"');
    }
    if (k === 3) b += text(360, 90 + 2 * 32, 'afuera del forro: E = 0'.replace('forro', sph ? 'cascarón' : 'forro'), ' font-size="17"');
    var Lc = sph ? [
      ['esfera interior: +Q', 'cascarón exterior: −Q'],
      ['Gauss: E·4πr² = Q / ε₀', 'E = kQ / r²'],
      ['campo radial, de a hacia b', 'como una carga puntual'],
      ['V = ∫ E dr, de a a b'],
      ['V = kQ (1/a − 1/b)', '   = kQ (b − a) / (ab)'],
      ['C = 4πε₀ ab / (b − a)', 'b → ∞:  C = 4πε₀ a']
    ] : [
      ['alambre: +Q', 'forro: −Q', 'largo L, λ = Q / L'],
      ['Gauss: E·2πrL = Q / ε₀', 'E = Q / (2πε₀ L r)'],
      ['campo radial, baja como 1/r'],
      ['V = ∫ E dr, de a a b'],
      ['∫ dr / r = ln (b/a)', 'V = Q ln(b/a) / (2πε₀ L)'],
      ['C = 2πε₀ L / ln(b/a)']
    ];
    (Lc[Math.max(0, Math.min(5, Math.round(k) - 1))] || []).forEach(function (l, i) { b += text(360, 90 + i * 32, l, ' font-size="17"'); });
    return svgBox('0 0 640 340', sph ? 'Capacitor esférico en corte: una esfera interior con +Q dentro de un cascarón con −Q; el campo es radial entre ellos.' :
      'Cable coaxial en corte: un alambre central con +Q dentro de un forro con −Q; el campo es radial entre ellos.', b);
  }
  D['f2s09-cylinder'] = function (s) { return f2s09Radial(s, false); };
  D['f2s09-sphere'] = function (s) { return f2s09Radial(s, true); };

  // Separar las placas al doble con la batería conectada o desconectada.
  D['f2s09-battery'] = function () {
    var b = '';
    function panel(x0, con) {
      var xl = x0 + 90, xr = x0 + 210, top = 60, bot = 190, T = 12, o = '';
      o += '<rect class="box-err" x="' + (xl - T) + '" y="' + top + '" width="' + T + '" height="' + (bot - top) + '"/>';
      o += '<rect class="box-aux" x="' + xr + '" y="' + top + '" width="' + T + '" height="' + (bot - top) + '"/>';
      o += '<rect class="aux" fill="none" stroke-width="1.6" stroke-dasharray="5 5" x="' + (xr - 60) + '" y="' + top + '" width="' + T + '" height="' + (bot - top) + '"/>';
      for (var i = 0; i < 4; i++) { var y = top + 22 + i * 30; o += text(xl - T / 2, y, '+', ' text-anchor="middle" font-size="14"') + text(xr + T / 2, y, '−', ' text-anchor="middle" font-size="14"'); }
      o += arrow('trace', xr - 44, 44, 40, 0, 2.5) + text(xr - 48, 48, 'd → 2d', ' text-anchor="end" font-size="15"');
      var yw = 228, xm = x0 + 150;
      o += '<path class="axis" fill="none" stroke-width="2" d="M' + (xl - T) + ' 125H' + (x0 + 40) + 'V' + yw + 'H' + (xm - 7) + '"/>';
      o += '<path class="axis" fill="none" stroke-width="2" d="M' + (xr + T) + ' 125H' + (x0 + 260) + 'V' + yw + 'H' + (con ? xm + 7 : xm + 50) + '"/>';
      if (!con) o += seg('axis', xm + 50, yw, xm + 80, yw - 18, 2.4);
      o += seg('axis', xm - 7, yw - 13, xm - 7, yw + 13, 2.5) + seg('axis', xm + 7, yw - 7, xm + 7, yw + 7, 4);
      o += text(x0 + 150, 18, con ? 'batería conectada' : 'batería desconectada', ' text-anchor="middle" font-size="16"');
      o += text(x0 + 150, 268, con ? 'V fija · C a la mitad' : 'Q fija · C a la mitad', ' text-anchor="middle" font-size="15"');
      o += text(x0 + 150, 290, con ? 'Q = CV baja a la mitad' : 'V = Q/C se duplica', ' text-anchor="middle" font-size="15"');
      o += text(x0 + 150, 312, con ? 'E = V/d baja a la mitad' : 'E = σ/ε₀ no cambia', ' text-anchor="middle" font-size="15"');
      return o;
    }
    b += panel(10, true) + seg('axis', 320, 20, 320, 310, 1, '3 6') + panel(330, false);
    return svgBox('0 0 640 325', 'Dos capacitores de placas a los que se les duplica la separación: a la izquierda con la batería conectada, a la derecha desconectada.', b);
  };
  /* ══════════════════════ fin S09 ══════════════════════ */

  /* ══════════════════════ S10 ══════════════════════ */
  function f2s10Sub(main, sub) { return main + '<tspan baseline-shift="sub" font-size="70%">' + sub + '</tspan>'; }
  function f2s10Name(id) { return f2s10Sub('C', id); }
  function f2s10Fmt(v) { return String(Number((+v).toPrecision(3))); }
  // Capacitor horizontal: placas verticales en x ± 6, alto 2·hh.
  function f2s10Cap(x, y, cls, hh) {
    hh = hh || 16;
    return seg(cls, x - 6, y - hh, x - 6, y + hh, 4) + seg(cls, x + 6, y - hh, x + 6, y + hh, 4);
  }
  // Batería horizontal: placa larga (+) a la izquierda, corta (−) a la derecha.
  function f2s10Bat(x, y) {
    return seg('ref', x - 6, y - 20, x - 6, y + 20, 3) + seg('ref', x + 6, y - 10, x + 6, y + 10, 6);
  }
  // Red como arreglo: hoja [id, C] · grupo ['s' | 'p', hijo, hijo, …].
  function f2s10IsLeaf(n) { return n[0] !== 's' && n[0] !== 'p'; }
  function f2s10Eq(n) {
    if (f2s10IsLeaf(n)) return n[1];
    var v = n.slice(1).map(f2s10Eq);
    return n[0] === 'p' ? v.reduce(function (s, x) { return s + x; }, 0) : 1 / v.reduce(function (s, x) { return s + 1 / x; }, 0);
  }
  function f2s10Split(n, V, out) {
    if (f2s10IsLeaf(n)) { out[n[0]] = { Q: n[1] * V, V: V }; return out; }
    var Q = f2s10Eq(n) * V;
    n.slice(1).forEach(function (k) { f2s10Split(k, n[0] === 'p' ? V : Q / f2s10Eq(k), out); });
    return out;
  }
  var F2S10 = { w: 104, h: 96, t: 40, stub: 22, gap: 4 };
  function f2s10Layout(n) {
    var L = F2S10;
    if (f2s10IsLeaf(n)) return { w: L.w, h: L.h, t: L.t, caps: [{ id: n[0], c: n[1], x: 0, y: 0 }], wires: [], dots: [] };
    var kids = n.slice(1).map(f2s10Layout), o = { caps: [], wires: [], dots: [] };
    function put(K, dx, dy) {
      K.caps.forEach(function (c) { o.caps.push({ id: c.id, c: c.c, x: c.x + dx, y: c.y + dy }); });
      K.wires.forEach(function (w) { o.wires.push([w[0] + dx, w[1] + dy, w[2] + dx, w[3] + dy]); });
      K.dots.forEach(function (d) { o.dots.push([d[0] + dx, d[1] + dy]); });
    }
    if (n[0] === 's') {
      var top = Math.max.apply(null, kids.map(function (K) { return K.t; })), bot = Math.max.apply(null, kids.map(function (K) { return K.h - K.t; })), x = 0;
      kids.forEach(function (K) { put(K, x, top - K.t); x += K.w; });
      o.w = x; o.t = top; o.h = top + bot;
      return o;
    }
    var mw = Math.max.apply(null, kids.map(function (K) { return K.w; })), W = mw + 2 * L.stub, y = 0, ys = [];
    kids.forEach(function (K, i) {
      var dx = L.stub + (mw - K.w) / 2, ty = y + K.t;
      put(K, dx, y);
      o.wires.push([0, ty, dx, ty], [dx + K.w, ty, W, ty]);
      if (i < kids.length - 1) o.dots.push([0, ty], [W, ty]);
      ys.push(ty); y += K.h + L.gap;
    });
    o.wires.push([0, ys[0], 0, ys[ys.length - 1]], [W, ys[0], W, ys[ys.length - 1]]);
    o.w = W; o.h = y - L.gap; o.t = ys[0];
    return o;
  }

  // Red de capacitores con su batería. state: { net, V, qv (muestra Q y V), hi: [ids], eq: [ids], vw, vh }.
  D['f2s10-net'] = function (s) {
    var net = (s && s.net) || ['s', ['1', 6], ['p', ['2', 1], ['3', 2]]], V = num(s, 'V', 12), qv = num(s, 'qv', 0) > 0.5;
    var hi = (s && s.hi) || [], eqs = (s && s.eq) || [];
    var L = f2s10Layout(net), side = 40, M = 14;
    var W = Math.max(num(s, 'vw', 480), L.w + 2 * (side + M)), ox = (W - L.w) / 2, oy = M;
    var bottom = oy + L.h + 30, H = Math.max(num(s, 'vh', 0), bottom + 48);
    var xl = ox - side, xr = ox + L.w + side, ty = oy + L.t, xc = W / 2;
    var sp = qv ? f2s10Split(net, V, {}) : null, body = '';
    L.wires.concat([[xl - ox, L.t, 0, L.t], [L.w, L.t, xr - ox, L.t]]).forEach(function (w) { body += seg('axis', w[0] + ox, w[1] + oy, w[2] + ox, w[3] + oy, 2.2); });
    body += seg('axis', xl, ty, xl, bottom, 2.2) + seg('axis', xr, ty, xr, bottom, 2.2) +
      seg('axis', xl, bottom, xc - 6, bottom, 2.2) + seg('axis', xc + 6, bottom, xr, bottom, 2.2);
    L.dots.forEach(function (d) { body += dot('dot-ref', d[0] + ox, d[1] + oy, 4.5); });
    L.caps.forEach(function (c) {
      var x0 = c.x + ox, cx = x0 + F2S10.w / 2, cy = c.y + oy + F2S10.t;
      var cls = hi.indexOf(c.id) >= 0 ? 'error' : (eqs.indexOf(c.id) >= 0 || c.id === 'eq') ? 'trace' : 'ref';
      body += seg('axis', x0, cy, cx - 6, cy, 2.2) + seg('axis', cx + 6, cy, x0 + F2S10.w, cy, 2.2) + f2s10Cap(cx, cy, cls);
      body += text(cx, cy - 25, f2s10Name(c.id) + ' = ' + f2s10Fmt(c.c) + ' μF', ' text-anchor="middle" font-size="15"');
      if (sp) {
        body += text(cx, cy + 36, 'Q = ' + f2s10Fmt(sp[c.id].Q) + ' μC', ' text-anchor="middle" font-size="14"') +
          text(cx, cy + 54, 'V = ' + f2s10Fmt(sp[c.id].V) + ' V', ' text-anchor="middle" font-size="14"');
      }
    });
    body += f2s10Bat(xc, bottom) + text(xc - 16, bottom - 10, '+', ' text-anchor="end" font-size="18"') +
      text(xc, bottom + 38, 'V = ' + f2s10Fmt(V) + ' V', ' text-anchor="middle" font-size="16"');
    return svgBox('0 0 ' + r1(W) + ' ' + r1(H), 'Red de capacitores conectada a una batería', body);
  };

  // Símbolos de un diagrama de circuito.
  D['f2s10-symbols'] = function () {
    var y1 = 62, y2 = 214, body = '';
    // Batería
    body += seg('axis', 70, y1, 124, y1, 2.4) + seg('axis', 136, y1, 190, y1, 2.4) + f2s10Bat(130, y1) +
      text(112, y1 - 26, '+', ' text-anchor="end" font-size="20"') + text(148, y1 - 22, '−', ' font-size="20"');
    // Capacitor
    body += seg('axis', 330, y1, 384, y1, 2.4) + seg('axis', 396, y1, 450, y1, 2.4) + f2s10Cap(390, y1, 'ref', 20);
    // Nodo
    body += seg('axis', 70, y2, 190, y2, 2.4) + seg('axis', 130, y2, 130, y2 + 30, 2.4) + dot('dot-ref', 130, y2, 6);
    // Cable
    body += seg('axis', 330, y2, 450, y2, 2.4);
    [[130, y1, 'batería', 'placa larga = +'], [390, y1, 'capacitor', 'dos placas iguales'], [130, y2, 'nodo', 'se unen 3 cables'], [390, y2, 'cable', 'mismo potencial']].forEach(function (c) {
      body += text(c[0], c[1] + 66, c[2], ' text-anchor="middle" font-size="21"') + text(c[0], c[1] + 92, c[3], ' text-anchor="middle" font-size="17"');
    });
    return svgBox('0 0 520 320', 'Símbolos: batería, capacitor, nodo y cable', body);
  };

  // Tres capacitores en paralelo: mismo V, las cargas se suman.
  D['f2s10-parallel'] = function () {
    var body = '', xl = 50, xr = 320, xc = 170, ys = [60, 140, 220], bot = 292;
    body += seg('axis', xl, ys[0], xl, bot, 2.4) + seg('axis', xr, ys[0], xr, bot, 2.4) +
      seg('axis', xl, bot, xc - 6, bot, 2.4) + seg('axis', xc + 6, bot, xr, bot, 2.4) + f2s10Bat(xc, bot) +
      text(xc - 16, bot - 14, '+', ' text-anchor="end" font-size="20"') + text(xc + 22, bot - 10, 'V', ' font-size="20"');
    ys.forEach(function (y, i) {
      var n = String(i + 1);
      body += seg('axis', xl, y, xc - 6, y, 2.4) + seg('axis', xc + 6, y, xr, y, 2.4) + f2s10Cap(xc, y, 'ref', 18) +
        text(xc - 18, y - 16, f2s10Name(n), ' text-anchor="end" font-size="20"') +
        text(xc + 18, y - 16, f2s10Sub('Q', n) + ' = ' + f2s10Name(n) + 'V', ' font-size="19"');
      if (i < 2) body += dot('dot-ref', xl, y, 5) + dot('dot-ref', xr, y, 5);
    });
    body += text(336, 118, 'los tres', ' font-size="18"') + text(336, 142, 'tienen', ' font-size="18"') + text(336, 166, 'el mismo V', ' font-size="18"') +
      text(240, 346, 'Q = ' + f2s10Sub('Q', '1') + ' + ' + f2s10Sub('Q', '2') + ' + ' + f2s10Sub('Q', '3'), ' text-anchor="middle" font-size="20"') +
      text(240, 376, f2s10Sub('C', 'eq') + ' = ' + f2s10Sub('C', '1') + ' + ' + f2s10Sub('C', '2') + ' + ' + f2s10Sub('C', '3'), ' text-anchor="middle" font-size="20"');
    return svgBox('0 0 480 390', 'Tres capacitores en paralelo conectados a una batería', body);
  };

  // Serie: por qué todos llevan la misma carga (explainer). state.n: 0 neutro · 1 extremos · 2 inducción · 3 voltajes.
  D['f2s10-series'] = function (s) {
    var n = num(s, 'n', 0), body = '', y = 96, xs = [200, 320, 440], bot = 240, xc = 320, hh = 28;
    body += seg('axis', 80, y, xs[0] - 6, y, 2.2) + seg('axis', xs[0] + 6, y, xs[1] - 6, y, 2.2) + seg('axis', xs[1] + 6, y, xs[2] - 6, y, 2.2) + seg('axis', xs[2] + 6, y, 560, y, 2.2) +
      seg('axis', 80, y, 80, bot, 2.2) + seg('axis', 560, y, 560, bot, 2.2) + seg('axis', 80, bot, xc - 6, bot, 2.2) + seg('axis', xc + 6, bot, 560, bot, 2.2) +
      f2s10Bat(xc, bot) + text(xc - 16, bot - 12, '+', ' text-anchor="end" font-size="18"') + text(xc, bot + 38, 'V', ' text-anchor="middle" font-size="17"');
    xs.forEach(function (x, i) { body += f2s10Cap(x, y, 'ref', hh) + text(x, y + 56, f2s10Name(String(i + 1)), ' text-anchor="middle" font-size="16"'); });
    function signs(x, side, sg) {
      var tx = x + side * 15, o = '';
      [y - 16, y + 24].forEach(function (yy) { o += text(tx, yy, sg, ' text-anchor="middle" font-size="18"'); });
      return o;
    }
    if (n >= 1) body += signs(xs[0] - 6, -1, '+') + signs(xs[2] + 6, 1, '−');
    if (n >= 2) {
      body += signs(xs[0] + 6, 1, '−') + signs(xs[1] - 6, -1, '+') + signs(xs[1] + 6, 1, '−') + signs(xs[2] - 6, -1, '+');
      body += poly('aux', [[xs[0] + 2, y - 46], [xs[1] - 2, y - 46], [xs[1] - 2, y + 40], [xs[0] + 2, y + 40]], 1.6, true, '5 5') +
        poly('aux', [[xs[1] + 2, y - 46], [xs[2] - 2, y - 46], [xs[2] - 2, y + 40], [xs[1] + 2, y + 40]], 1.6, true, '5 5') +
        text(260, 184, 'carga neta 0', ' text-anchor="middle" font-size="14"') + text(380, 184, 'carga neta 0', ' text-anchor="middle" font-size="14"');
    }
    if (n >= 3) xs.forEach(function (x, i) { body += text(x, 30, f2s10Sub('V', String(i + 1)) + ' = Q/' + f2s10Name(String(i + 1)), ' text-anchor="middle" font-size="15"'); });
    var cap = ['sin conectar: todas las placas están neutras', 'la batería solo toca las placas de los extremos: +Q y −Q',
      'cada pieza aislada sigue neutra: −Q de un lado, +Q del otro', 'misma Q en los tres; V = ' + f2s10Sub('V', '1') + ' + ' + f2s10Sub('V', '2') + ' + ' + f2s10Sub('V', '3')][Math.max(0, Math.min(3, Math.round(n)))];
    body += text(320, 306, cap, ' text-anchor="middle" font-size="16"');
    return svgBox('0 0 640 318', 'Tres capacitores en serie con una batería; cargas en cada placa', body);
  };

  // Energía: el trabajo de cargar es el área bajo v(q), un triángulo de área ½QV.
  D['f2s10-energy'] = function () {
    var ox = 70, oy = 250, X = function (u) { return ox + 360 * u; }, Y = function (u) { return oy - 170 * u; };
    var body = fill('area-fill', [[X(0), Y(0)], [X(1), Y(1)], [X(1), Y(0)]]);
    var u0 = 0.55, du = 0.05;
    body += fill('rect-fill', [[X(u0), Y(0)], [X(u0), Y(u0)], [X(u0 + du), Y(u0)], [X(u0 + du), Y(0)]]);
    body += arrow('axis', ox, oy, 420, 0, 1.6) + arrow('axis', ox, oy, 0, -215, 1.6) +
      text(ox + 432, oy + 6, 'q', ' font-size="20"') + text(ox, 22, 'v', ' text-anchor="middle" font-size="20"');
    body += poly('ref', [[X(0), Y(0)], [X(1.02), Y(1.02)]], 3);
    body += seg('axis', X(1), Y(1), X(1), oy, 1.2, '4 4') + seg('axis', ox, Y(1), X(1), Y(1), 1.2, '4 4') +
      text(X(1), oy + 24, 'Q', ' text-anchor="middle" font-size="19"') + text(ox - 10, Y(1) + 6, 'V', ' text-anchor="end" font-size="19"') +
      text(X(u0 + du / 2), oy + 24, 'dq', ' text-anchor="middle" font-size="18"');
    body += text(456, 150, 'U = área', ' font-size="20"') + text(456, 180, 'U = ½ QV', ' font-size="20"') +
      text(100, 42, 'v = q/C crece al cargar;', ' font-size="17"') + text(100, 64, 'cada dq cuesta v dq', ' font-size="17"');
    return svgBox('0 0 640 290', 'Voltaje contra carga al cargar un capacitor; el área bajo la recta es la energía', body);
  };

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
  /* Figuras de los problemas de examen (data/fisica-2/exam-problems.js). Reciben las vars del
     problema (al azar): todo se escala para caber y las etiquetas se colocan con spot. */
  function f2exQ(x, y, q, r, fs) {
    r = r || 18; fs = fs || 22;
    return '<circle class="' + (q > 0 ? 'box-err' : 'box-aux') + '" cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r + '"/>' +
      text(x, y + fs * 0.33, q > 0 ? '+' : '−', ' text-anchor="middle" font-size="' + fs + '"');
  }
  function f2exCirc(x, y, r) { var o = []; for (var i = 0; i < 48; i++) o.push([x + r * Math.cos(i * Math.PI / 24), y + r * Math.sin(i * Math.PI / 24)]); return o; }
  // Coloca la etiqueta con spot y agrega su caja a pts, para que las siguientes no la pisen.
  function f2exPut(cands, pts, fs, vb) {
    var c = spot(cands, pts, fs, vb), w = String(c[2]).replace(/<[^>]+>/g, '').length * fs * 0.6, a = c[3] || 'start';
    var x0 = a === 'end' ? c[0] - w : a === 'middle' ? c[0] - w / 2 : c[0], t = c[1] - fs * 0.85, b = c[1] + fs * 0.3;
    for (var x = x0; x <= x0 + w + 0.1; x += 3) pts.push([x, t], [x, (t + b) / 2], [x, b]);
    return label(c, fs);
  }
  // Cota horizontal de x1 a x2 a la altura y (con topes); agrega sus puntos a pts.
  function f2exDim(x1, x2, y, pts) {
    [[x1, y, x2, y], [x1, y - 7, x1, y + 7], [x2, y - 7, x2, y + 7]].forEach(function (s) { pts.push.apply(pts, segPts(s[0], s[1], s[2], s[3])); });
    return seg('axis', x1, y, x2, y, 1.3) + seg('axis', x1, y - 7, x1, y + 7, 1.3) + seg('axis', x2, y - 7, x2, y + 7, 1.3);
  }
  function f2exMu(n) { return (n > 0 ? '+' : '−') + Math.abs(n); }

  /* ---------- Dos esferas que se tocan (S01 + S02) ---------- */
  D['f2exam-esferas'] = function (s) {
    var q1 = num(s, 'q1', 5), q2 = num(s, 'q2', -3), d = Math.min(30, Math.max(5, num(s, 'd', 10)));
    var R = 24, y = 120, fs = 16, vb = [0, 20, 640, 240];
    var Ax = 100, Bx = Ax + 2 * R, Cx = 400, Dx = Cx + 80 + (d - 5) * 4.4;
    var pts = [].concat(f2exCirc(Ax, y, R), f2exCirc(Bx, y, R), f2exCirc(Cx, y, R), f2exCirc(Dx, y, R), segPts(320, 40, 320, 236));
    var body = seg('axis', 320, 40, 320, 236, 1.2, '5 6');
    body += f2exQ(Ax, y, 1, R) + f2exQ(Bx, y, -1, R) + f2exQ(Cx, y, 1, R) + f2exQ(Dx, y, 1, R);
    body += f2exPut([[(Ax + Bx) / 2, 56, 'antes: se tocan', 'middle']], pts, 17, vb);
    body += f2exPut([[(Cx + Dx) / 2, 56, 'después', 'middle']], pts, 17, vb);
    body += f2exPut([[Ax, y + R + 26, 'q₁ = ' + f2exMu(q1) + ' μC', 'middle'], [Ax - R - 8, y + 6, 'q₁ = ' + f2exMu(q1) + ' μC', 'end']], pts, fs, vb);
    body += f2exPut([[Bx, y + R + 52, 'q₂ = ' + f2exMu(q2) + ' μC', 'middle'], [Bx + R + 8, y + 6, 'q₂ = ' + f2exMu(q2) + ' μC', 'start']], pts, fs, vb);
    body += f2exPut([[Cx, y - R - 12, 'Q = ?', 'middle']], pts, fs, vb) + f2exPut([[Dx, y - R - 12, 'Q = ?', 'middle']], pts, fs, vb);
    var yd = y + R + 24;
    body += f2exDim(Cx, Dx, yd, pts) + f2exPut([[(Cx + Dx) / 2, yd + 26, d + ' cm', 'middle']], pts, fs, vb);
    return svgBox('0 20 640 220', 'Antes: dos esferas metálicas idénticas, una positiva y otra negativa, se tocan. Después: se separan ' + d + ' cm y cada una queda con la misma carga Q, que hay que calcular.', body);
  };

  /* ---------- Fuerza neta en una esquina (S02) ---------- */
  D['f2exam-triangulo'] = function (s) {
    var a = num(s, 'a', 2), b = num(s, 'b', 3), c = num(s, 'c', 4), s2 = num(s, 's2', 1) ? 1 : -1, s3 = num(s, 's3', 0) ? 1 : -1;
    var dx = Math.max(1, num(s, 'dx', 5)), dy = Math.max(1, num(s, 'dy', 4)), fs = 16, r = 18, vb = [0, 0, 640, 330];
    var sc = Math.min(400 / dx, 210 / dy, 40), O = [150, 290], X = O[0] + dx * sc, Y = O[1] - dy * sc;
    var body = '', pts = [].concat(f2exCirc(O[0], O[1], r), f2exCirc(X, O[1], r), f2exCirc(O[0], Y, r));
    // Ejes, cortados donde están las cargas.
    [[O[0] - 40, O[1], O[0] - r, O[1]], [O[0] + r, O[1], X - r, O[1]], [O[0], O[1] + 30, O[0], O[1] + r], [O[0], O[1] - r, O[0], Y + r]].forEach(function (q) {
      body += seg('axis', q[0], q[1], q[2], q[3], 1.4, q[1] === q[3] && q[0] > O[0] || q[0] === q[2] && q[1] < O[1] ? '5 6' : '');
      pts = pts.concat(segPts(q[0], q[1], q[2], q[3]));
    });
    body += arrow('axis', X + r, O[1], 50, 0, 1.4) + arrow('axis', O[0], Y - r, 0, -50, 1.4);
    pts = pts.concat(arrowPts(X + r, O[1], 50, 0), arrowPts(O[0], Y - r, 0, -50));
    body += f2exQ(O[0], O[1], 1, r) + f2exQ(X, O[1], s2, r) + f2exQ(O[0], Y, s3, r);
    body += f2exPut([[X + r + 58, O[1] + 6, 'x', 'start'], [X + r + 46, O[1] - 12, 'x', 'middle']], pts, 17, vb);
    body += f2exPut([[O[0] + 12, Y - r - 40, 'y', 'start'], [O[0] - 12, Y - r - 40, 'y', 'end']], pts, 17, vb);
    var lab = function (x, y, t) { return around(x, y, t).slice(16); };
    body += f2exPut(lab(O[0], O[1], 'q₁ = +' + a + ' μC'), pts, fs, vb);
    body += f2exPut(lab(X, O[1], 'q₂ = ' + f2exMu(s2 * b) + ' μC'), pts, fs, vb);
    body += f2exPut(lab(O[0], Y, 'q₃ = ' + f2exMu(s3 * c) + ' μC'), pts, fs, vb);
    var mx = (O[0] + X) / 2, my = (O[1] + Y) / 2;
    body += f2exPut([[mx, O[1] + 26, dx + ' cm', 'middle'], [mx, O[1] - 12, dx + ' cm', 'middle'], [mx + 30, O[1] + 26, dx + ' cm', 'middle'], [mx - 30, O[1] + 26, dx + ' cm', 'middle']], pts, fs, vb);
    body += f2exPut([[O[0] - 14, my + 6, dy + ' cm', 'end'], [O[0] + 14, my + 6, dy + ' cm', 'start'], [O[0] - 14, my + 30, dy + ' cm', 'end'], [O[0] - 14, my - 20, dy + ' cm', 'end']], pts, fs, vb);
    return svgBox('0 0 640 330', 'La carga q1 en la esquina, q2 sobre el eje x a ' + dx + ' cm y q3 sobre el eje y a ' + dy + ' cm.', body);
  };

  /* ---------- Campo entre dos cargas sobre una recta (S03 + S02) ---------- */
  D['f2exam-recta'] = function (s) {
    var a = num(s, 'a', 3), b = num(s, 'b', 2), sq = num(s, 's', 0) ? 1 : -1, d = Math.max(1, num(s, 'd', 10)), p = num(s, 'p', 4);
    var y = 150, x0 = 90, sc = 440 / d, X2 = x0 + d * sc, P = x0 + p * sc, r = 18, fs = 16, vb = [0, 80, 640, 270];
    var body = '', pts = [].concat(f2exCirc(x0, y, r), f2exCirc(X2, y, r), f2exCirc(P, y, 7));
    [[40, x0 - r], [x0 + r, X2 - r], [X2 + r, 600]].forEach(function (q) { body += seg('axis', q[0], y, q[1], y, 1.3); pts = pts.concat(segPts(q[0], y, q[1], y)); });
    body += f2exQ(x0, y, 1, r) + f2exQ(X2, y, sq, r) + dot('dot-trace', P, y, 6);
    body += f2exPut([[x0, y - 32, 'q₁ = +' + a + ' nC', 'middle'], [x0, y - 56, 'q₁ = +' + a + ' nC', 'middle']], pts, fs, vb);
    body += f2exPut([[X2, y - 32, 'q₂ = ' + f2exMu(sq * b) + ' nC', 'middle'], [X2, y - 56, 'q₂ = ' + f2exMu(sq * b) + ' nC', 'middle']], pts, fs, vb);
    body += f2exPut([[P, y - 16, 'P', 'middle'], [P, y - 34, 'P', 'middle'], [P + 12, y - 12, 'P', 'start']], pts, 17, vb);
    body += f2exDim(x0, P, y + 40, pts) + f2exPut([[(x0 + P) / 2, y + 62, p + ' cm', 'middle']], pts, fs, vb);
    body += f2exDim(x0, X2, y + 84, pts) + f2exPut([[(x0 + X2) / 2, y + 106, d + ' cm', 'middle']], pts, fs, vb);
    return svgBox('0 80 640 190', 'Dos cargas sobre el eje x separadas ' + d + ' cm; el punto P está entre ellas, a ' + p + ' cm de q1.', body);
  };

  /* ---------- Electrón entre placas (S03 + S05) ----------
     state: { L (cm), y (mm) }. Escala real: 7 px por mm en las dos direcciones. */
  D['f2exam-placas'] = function (s) {
    var L = Math.min(6, Math.max(1, num(s, 'L', 4))), ym = Math.min(9, Math.max(0, num(s, 'y', 3)));
    var x0 = 160, Lp = L * 70, x1 = x0 + Lp, yc = 170, dy = ym * 7, fs = 16, vb = [0, 50, 640, 330];
    var body = '', pts = [], n = Math.max(2, Math.floor(Lp / 36)), i;
    body += '<rect class="box-err" x="' + x0 + '" y="72" width="' + r1(Lp) + '" height="26"/>' + '<rect class="box-aux" x="' + x0 + '" y="242" width="' + r1(Lp) + '" height="26"/>';
    for (i = 0; i < n; i++) {
      var xs = x0 + (i + 0.5) * Lp / n;
      body += text(xs, 91, '+', ' text-anchor="middle" font-size="18"') + text(xs, 261, '−', ' text-anchor="middle" font-size="18"');
    }
    pts = pts.concat(polyPts([[x0, 72], [x1, 72], [x1, 98], [x0, 98], [x0, 72]]), polyPts([[x0, 242], [x1, 242], [x1, 268], [x0, 268], [x0, 242]]));
    body += seg('axis', x0, yc, x1, yc, 1, '4 6'); pts = pts.concat(segPts(x0, yc, x1, yc));
    var tr = [];
    for (i = 0; i <= 30; i++) { var u = i / 30; tr.push([x0 + u * Lp, yc - dy * u * u]); }
    var sl = 2 * dy / Lp, ext = [x1 + 50, yc - dy - 50 * sl];
    body += poly('trace', tr, 2.6) + seg('trace', x1, yc - dy, ext[0], ext[1], 2.6, '6 5');
    pts = pts.concat(polyPts(tr), segPts(x1, yc - dy, ext[0], ext[1]));
    body += f2exQ(70, yc, -1, 13, 16) + arrow('ref', 88, yc, 58, 0, 2.6);
    pts = pts.concat(f2exCirc(70, yc, 13), arrowPts(88, yc, 58, 0));
    body += f2exPut([[117, yc - 14, 'v₀', 'middle'], [117, yc + 28, 'v₀', 'middle']], pts, fs, vb);
    [0.3, 0.7].forEach(function (f) { var xa = x0 + Lp * f; body += arrow('aux', xa, 194, 0, 38, 2.4); pts = pts.concat(arrowPts(xa, 194, 0, 38)); });
    body += f2exPut([[x0 + Lp * 0.3 + 14, 222, 'E', 'start'], [x0 + Lp * 0.3 - 14, 222, 'E', 'end']], pts, 17, vb);
    if (dy >= 2) { body += seg('axis', x1 + 14, yc, x1 + 14, yc - dy, 1.3); pts = pts.concat(segPts(x1 + 14, yc, x1 + 14, yc - dy)); }
    body += f2exPut([[x1 + 22, yc - dy / 2 + 6, 'y', 'start'], [x1 + 22, yc + 22, 'y', 'start'], [x1 - 8, yc + 22, 'y', 'end']], pts, 17, vb);
    body += f2exDim(x0, x1, 292, pts) + f2exPut([[(x0 + x1) / 2, 316, L + ' cm', 'middle']], pts, fs, vb);
    return svgBox('0 50 640 280', 'Un electrón entra horizontal a la mitad de dos placas: la de arriba positiva, la de abajo negativa. El campo apunta hacia abajo y el electrón se desvía hacia la placa positiva una distancia y al salir.', body);
  };

  /* ---------- Varilla y punto en su eje (S04 + S02) ---------- */
  D['f2exam-varilla'] = function (s) {
    var Q = num(s, 'Q', 10), L = Math.max(1, num(s, 'L', 10)), d = Math.max(1, num(s, 'd', 4));
    var x0 = 60, sc = Math.min(480 / (L + d), 40), x1 = x0 + L * sc, P = x1 + d * sc, y = 160, fs = 16, vb = [0, 100, 640, 260];
    var body = '', pts = [], n = Math.max(2, Math.round(L * sc / 26)), i;
    body += '<rect class="box-err" x="' + x0 + '" y="' + (y - 11) + '" width="' + r1(L * sc) + '" height="22"/>';
    for (i = 0; i < n; i++) body += text(x0 + (i + 0.5) * L * sc / n, y + 5, '+', ' text-anchor="middle" font-size="15"');
    pts = pts.concat(polyPts([[x0, y - 11], [x1, y - 11], [x1, y + 11], [x0, y + 11], [x0, y - 11]]));
    body += seg('axis', x1, y, P + 40, y, 1.2, '5 6'); pts = pts.concat(segPts(x1, y, P + 40, y));
    body += dot('dot-trace', P, y, 6); pts = pts.concat(f2exCirc(P, y, 7));
    body += f2exPut([[(x0 + x1) / 2, y - 24, 'Q = +' + Q + ' nC', 'middle'], [x0, y - 24, 'Q = +' + Q + ' nC', 'start']], pts, fs, vb);
    body += f2exPut([[P, y - 18, 'P', 'middle'], [P + 12, y - 14, 'P', 'start']], pts, 17, vb);
    body += f2exDim(x0, x1, y + 36, pts) + f2exDim(x1, P, y + 36, pts);
    body += f2exPut([[(x0 + x1) / 2, y + 60, L + ' cm', 'middle']], pts, fs, vb);
    body += f2exPut([[(x1 + P) / 2, y + 60, d + ' cm', 'middle'], [(x1 + P) / 2, y + 84, d + ' cm', 'middle'], [P + 10, y + 60, d + ' cm', 'start']], pts, fs, vb);
    return svgBox('0 100 640 160', 'Una varilla de ' + L + ' cm con carga positiva uniforme; el punto P está sobre su misma línea, a ' + d + ' cm del extremo.', body);
  };

  /* ---------- Anillo y cuenta en su eje (S04 + S03) ---------- */
  D['f2exam-anillo'] = function (s) {
    var Q = num(s, 'Q', 20), R = Math.max(1, num(s, 'R', 5)), z = Math.max(1, num(s, 'z', 5));
    var C = [170, 170], sc = Math.min(110 / R, 400 / z, 40), ry = R * sc, rx = Math.max(14, ry * 0.32), Px = C[0] + z * sc, fs = 16, vb = [0, 20, 640, 340];
    var ring = [], i;
    for (i = 0; i <= 64; i++) { var t = i * Math.PI / 32; ring.push([C[0] + rx * Math.cos(t), C[1] + ry * Math.sin(t)]); }
    var body = seg('axis', 40, C[1], 620, C[1], 1.3) + poly('error', ring, 3, true);
    var pts = [].concat(segPts(40, C[1], 620, C[1]), polyPts(ring));
    body += seg('aux', C[0], C[1] - ry, Px, C[1], 2, '6 5'); pts = pts.concat(segPts(C[0], C[1] - ry, Px, C[1]));
    body += dot('dot-trace', Px, C[1], 7); pts = pts.concat(f2exCirc(Px, C[1], 8));
    // Cota del radio, a la izquierda del anillo.
    var xr = C[0] - rx - 16;
    body += seg('axis', xr, C[1], xr, C[1] - ry, 1.3) + seg('axis', xr - 6, C[1], xr + 6, C[1], 1.3) + seg('axis', xr - 6, C[1] - ry, xr + 6, C[1] - ry, 1.3);
    pts = pts.concat(segPts(xr, C[1], xr, C[1] - ry), segPts(xr - 6, C[1] - ry, xr + 6, C[1] - ry));
    body += f2exPut([[xr - 8, C[1] - ry / 2 + 6, 'R', 'end']], pts, 17, vb);
    // Cota de z, debajo del anillo.
    var yz = C[1] + ry + 20;
    body += f2exDim(C[0], Px, yz, pts) + f2exPut([[(C[0] + Px) / 2, yz + 24, 'z', 'middle']], pts, 17, vb);
    body += f2exPut([[C[0], C[1] - ry - 14, 'Q = +' + Q + ' nC', 'middle'], [C[0] + rx + 8, C[1] - ry + 4, 'Q = +' + Q + ' nC', 'start']], pts, fs, vb);
    // r: junto a la mitad de la línea punteada, del lado de arriba.
    var mx = (C[0] + Px) / 2, my = C[1] - ry / 2, ln = Math.hypot(Px - C[0], ry), nx = ry / ln, ny = -(Px - C[0]) / ln;
    body += f2exPut([[mx + nx * 14, my + ny * 14 + 6, 'r', 'start'], [mx + nx * 22, my + ny * 22 + 6, 'r', 'start'], [mx + nx * 32, my + ny * 32 + 6, 'r', 'middle']], pts, 17, vb);
    body += f2exPut([[Px, C[1] - 18, 'q', 'middle'], [Px + 14, C[1] - 12, 'q', 'start'], [Px + 14, C[1] + 22, 'q', 'start']], pts, 17, vb);
    return svgBox('0 20 640 320', 'Un anillo de radio R con carga positiva y, sobre su eje, una cuenta cargada a una distancia z del centro. Cada trozo del anillo está a la misma distancia r de la cuenta.', body);
  };

  /* ---------- Carga que va de A a B junto a Q (S05) ----------
     proton: el protón parte del reposo en A; si no, q (con su signo) va de A a B. */
  function f2exRadial(s, proton) {
    var Q = proton ? num(s, 'Q', 20) : num(s, 'a', 40), rA = Math.max(0.5, num(s, 'rA', 3)), rB = Math.max(0.5, num(s, 'rB', 8));
    var sq = proton ? 1 : (num(s, 's', 1) ? 1 : -1), y = 150, x0 = 70, sc = Math.min(500 / Math.max(rA, rB), 40), A = x0 + Math.max(rA * sc, 44), B = x0 + Math.max(rB * sc, 44), fs = 16, vb = [0, 76, 640, 298];
    var body = '', pts = [].concat(f2exCirc(x0, y, 18), f2exCirc(A, y, 13), f2exCirc(B, y, 6));
    [[x0 + 18, A - 13], [A + 13, 610]].forEach(function (q) { if (q[1] > q[0]) { body += seg('axis', q[0], y, q[1], y, 1.2, '5 6'); pts = pts.concat(segPts(q[0], y, q[1], y)); } });
    body += f2exQ(x0, y, 1, 18) + f2exQ(A, y, sq, 13, 16) + dot('dot-trace', B, y, 5);
    body += arrow('trace', A, y + 32, B - A, 0, 2.6); pts = pts.concat(arrowPts(A, y + 32, B - A, 0));
    // Q va en el renglón de arriba: el de abajo queda libre para A aunque A esté muy cerca de Q.
    body += f2exPut([[x0, y - 54, 'Q = +' + Q + ' nC', 'middle'], [x0, y - 30, 'Q = +' + Q + ' nC', 'middle']], pts, fs, vb);
    // «A (v₀ = 0)» si cabe; si no, solo «A» (el enunciado ya dice que parte del reposo).
    var ca = proton ? [[A, y - 22, 'A (v₀ = 0)', 'middle'], [A + 6, y - 22, 'A (v₀ = 0)', 'start'], [A, y - 46, 'A (v₀ = 0)', 'middle']] : [];
    body += f2exPut(ca.concat([[A, y - 22, 'A', 'middle'], [A + 16, y - 14, 'A', 'start'], [A, y - 46, 'A', 'middle'], [A - 16, y - 14, 'A', 'end']]), pts, 17, vb);
    body += f2exPut([[B, y - 18, 'B', 'middle'], [B + 10, y - 12, 'B', 'start'], [B, y - 40, 'B', 'middle'], [B + 10, y + 22, 'B', 'start']], pts, 17, vb);
    body += f2exDim(x0, A, y + 66, pts) + f2exPut([[(x0 + A) / 2, y + 90, rA + ' cm', 'middle']], pts, fs, vb);
    body += f2exDim(x0, B, y + 112, pts) + f2exPut([[(x0 + B) / 2, y + 136, rB + ' cm', 'middle']], pts, fs, vb);
    return svgBox('0 76 640 222', proton ? 'Un protón se suelta del reposo en A, a ' + rA + ' cm de la carga fija Q, y se aleja hasta B, a ' + rB + ' cm.' :
      'La carga q va del punto A, a ' + rA + ' cm de la carga fija Q, al punto B, a ' + rB + ' cm, sobre la misma recta.', body);
  }
  D['f2exam-trabajo'] = function (s) { return f2exRadial(s, false); };
  D['f2exam-proton'] = function (s) { return f2exRadial(s, true); };

  /* ═══ Bloque B (S06–S10) ═══ */
  // Cota vertical de y1 a y2 en x (con topes); agrega sus puntos a pts.
  function f2exDimV(x, y1, y2, pts) {
    [[x, y1, x, y2], [x - 7, y1, x + 7, y1], [x - 7, y2, x + 7, y2]].forEach(function (q) { pts.push.apply(pts, segPts(q[0], q[1], q[2], q[3])); });
    return seg('axis', x, y1, x, y2, 1.3) + seg('axis', x - 7, y1, x + 7, y1, 1.3) + seg('axis', x - 7, y2, x + 7, y2, 1.3);
  }
  function f2exNum(v) { return String(Number((+v).toPrecision(3))); }
  // Capacitor en un cable horizontal (placas verticales) o vertical (placas horizontales), centro (x, y).
  function f2exCapH(x, y, hh) { hh = hh || 16; return seg('ref', x - 6, y - hh, x - 6, y + hh, 4) + seg('ref', x + 6, y - hh, x + 6, y + hh, 4); }
  function f2exCapV(x, y, hh) { hh = hh || 16; return seg('ref', x - hh, y - 6, x + hh, y - 6, 4) + seg('ref', x - hh, y + 6, x + hh, y + 6, 4); }
  // Batería en un cable vertical: placa larga (+) arriba, corta (−) abajo.
  function f2exBatV(x, y) { return seg('ref', x - 20, y - 6, x + 20, y - 6, 3) + seg('ref', x - 10, y + 6, x + 10, y + 6, 6); }

  /* ---------- Disco y punto en su eje (S06) ---------- */
  D['f2exam-disco'] = function (s) {
    var Q = num(s, 'Q', 20), R = Math.max(1, num(s, 'R', 5)), z = Math.max(0.5, num(s, 'z', 5));
    var C = [170, 175], sc = Math.min(110 / R, 400 / z, 40), ry = R * sc, zp = z * sc, rx = Math.max(8, Math.min(ry * 0.28, zp - 28)), Px = C[0] + zp, fs = 16, vb = [0, 20, 640, 345];
    var disk = [], i;
    for (i = 0; i < 64; i++) { var t = i * Math.PI / 32; disk.push([C[0] + rx * Math.cos(t), C[1] + ry * Math.sin(t)]); }
    var body = fill('box-err', disk) + seg('axis', 40, C[1], C[0] - rx, C[1], 1.3) + seg('axis', C[0], C[1], 620, C[1], 1.3);
    var pts = [].concat(polyPts(disk.concat([disk[0]])), segPts(40, C[1], 620, C[1]));
    body += dot('dot-trace', Px, C[1], 6); pts = pts.concat(f2exCirc(Px, C[1], 8));
    var xr = C[0] - rx - 18;
    body += f2exDimV(xr, C[1] - ry, C[1], pts) + f2exPut([[xr - 10, C[1] - ry / 2 + 6, R + ' cm', 'end']], pts, fs, vb);
    var yz = C[1] + ry + 20;
    body += f2exDim(C[0], Px, yz, pts) + f2exPut([[(C[0] + Px) / 2, yz + 24, 'z = ' + z + ' cm', 'middle'], [Px + 12, yz + 6, 'z = ' + z + ' cm', 'start']], pts, fs, vb);
    body += f2exPut([[C[0], C[1] - ry - 14, 'Q = +' + Q + ' nC', 'middle'], [C[0] + rx + 10, C[1] - ry + 6, 'Q = +' + Q + ' nC', 'start']], pts, fs, vb);
    body += f2exPut([[Px, C[1] - 18, 'P', 'middle'], [Px + 14, C[1] - 12, 'P', 'start'], [Px + 14, C[1] + 22, 'P', 'start']], pts, 17, vb);
    return svgBox('0 20 640 325', 'Un disco de radio ' + R + ' cm con carga positiva repartida, visto en perspectiva, y el punto P sobre su eje a ' + z + ' cm del centro.', body);
  };

  /* ---------- Equipotencial de V(x, y) = A x² y + B y (S06) ---------- */
  D['f2exam-gradiente'] = function (s) {
    var A = Math.max(0.1, num(s, 'A', 2)), B = Math.max(0.1, num(s, 'B', 6)), x0 = Math.min(3, Math.max(0.2, num(s, 'x', 1.5))), y0 = Math.min(3, Math.max(0.2, num(s, 'y', 1)));
    var O = [80, 290], sc = 74, M = 3.4, X = function (x) { return O[0] + x * sc; }, Y = function (y) { return O[1] - y * sc; };
    var fs = 16, vb = [0, 0, 560, 340], body = '', pts = [], i, V0 = y0 * (A * x0 * x0 + B);
    body += arrow('axis', O[0], O[1], (M + 0.4) * sc, 0, 1.5) + arrow('axis', O[0], O[1], 0, -(M + 0.4) * sc, 1.5);
    pts = pts.concat(arrowPts(O[0], O[1], (M + 0.4) * sc, 0), arrowPts(O[0], O[1], 0, -(M + 0.4) * sc));
    for (i = 1; i <= 3; i++) {
      body += seg('axis', X(i), O[1] - 5, X(i), O[1] + 5, 1.3) + seg('axis', O[0] - 5, Y(i), O[0] + 5, Y(i), 1.3);
      pts = pts.concat(segPts(X(i), O[1] - 5, X(i), O[1] + 5), segPts(O[0] - 5, Y(i), O[0] + 5, Y(i)));
      body += f2exPut([[X(i), O[1] + 24, String(i), 'middle']], pts, 15, vb) + f2exPut([[O[0] - 12, Y(i) + 5, String(i), 'end']], pts, 15, vb);
    }
    body += f2exPut([[X(M + 0.4) + 8, O[1] + 6, 'x (m)', 'start'], [X(M + 0.4), O[1] + 26, 'x (m)', 'middle']], pts, 16, vb);
    body += f2exPut([[O[0] + 12, Y(M + 0.4) + 12, 'y (m)', 'start']], pts, 16, vb);
    // La equipotencial y = V₀/(A x² + B), recortada a la ventana.
    var cur = [];
    for (i = 0; i <= 160; i++) { var x = M * i / 160, y = V0 / (A * x * x + B); if (y <= M) cur.push([X(x), Y(y)]); }
    body += poly('ref', cur, 2.6); pts = pts.concat(polyPts(cur));
    body += seg('axis', X(x0), Y(y0), X(x0), O[1], 1.1, '4 5') + seg('axis', X(x0), Y(y0), O[0], Y(y0), 1.1, '4 5');
    pts = pts.concat(segPts(X(x0), Y(y0), X(x0), O[1]), segPts(X(x0), Y(y0), O[0], Y(y0)));
    body += dot('dot-trace', X(x0), Y(y0), 6); pts = pts.concat(f2exCirc(X(x0), Y(y0), 8));
    body += f2exPut(around(X(x0), Y(y0), 'P').slice(16), pts, 17, vb);
    var e = cur[cur.length - 1];
    body += f2exPut([[e[0] + 10, e[1] + 6, 'V = V(P)', 'start'], [e[0], e[1] - 14, 'V = V(P)', 'end'], [e[0], e[1] + 24, 'V = V(P)', 'end'], [e[0] + 10, e[1] - 16, 'V = V(P)', 'start']], pts, 16, vb);
    return svgBox('0 0 560 340', 'Plano xy con el punto P en (' + x0 + ', ' + y0 + ') m y la curva equipotencial que pasa por él.', body);
  };

  /* ---------- Cubo en E = c x î (S07 + S08) ---------- */
  D['f2exam-cubo'] = function (s) {
    var a = Math.max(1, num(s, 'a', 20)), x0 = Math.max(1, num(s, 'x0', 30)), c = num(s, 'c', 5);
    var sc = Math.min(470 / (x0 + 1.45 * a + 6), 150 / (1.3 * a), 7), ox = 60, oy = 238, fs = 16, vb = [0, 0, 640, 320];
    var P = function (x, y, z) { return [ox + (x + 0.45 * y) * sc, oy - (z + 0.3 * y) * sc]; };
    var body = '', pts = [], x1 = x0 + a;
    var V = [[x0, 0, 0], [x1, 0, 0], [x1, 0, a], [x0, 0, a], [x0, a, 0], [x1, a, 0], [x1, a, a], [x0, a, a]].map(function (p) { return P(p[0], p[1], p[2]); });
    var hid = [[0, 4], [4, 5], [4, 7]], vis = [[0, 1], [1, 2], [2, 3], [3, 0], [1, 5], [5, 6], [6, 7], [7, 3], [2, 6]];
    body += fill('area-fill', [V[0], V[1], V[5], V[6], V[7], V[3]]);
    hid.forEach(function (e) { body += seg('aux', V[e[0]][0], V[e[0]][1], V[e[1]][0], V[e[1]][1], 1.4, '5 5'); pts = pts.concat(segPts(V[e[0]][0], V[e[0]][1], V[e[1]][0], V[e[1]][1])); });
    vis.forEach(function (e) { body += seg('ref', V[e[0]][0], V[e[0]][1], V[e[1]][0], V[e[1]][1], 2.4); pts = pts.concat(segPts(V[e[0]][0], V[e[0]][1], V[e[1]][0], V[e[1]][1])); });
    // Eje x por la arista de enfrente, con el origen marcado.
    var o = P(0, 0, 0), xe = Math.max(V[5][0] + 30, V[1][0] + 60);
    body += seg('axis', o[0], oy, V[0][0], oy, 1.4) + arrow('axis', V[1][0], oy, xe - V[1][0], 0, 1.4) + seg('axis', o[0], oy - 7, o[0], oy + 7, 1.4);
    pts = pts.concat(segPts(o[0], oy, V[0][0], oy), arrowPts(V[1][0], oy, xe - V[1][0], 0), segPts(o[0], oy - 7, o[0], oy + 7));
    body += f2exPut([[xe + 8, oy + 6, 'x', 'start']], pts, 17, vb);
    body += f2exPut([[o[0], oy - 14, 'x = 0', 'middle'], [o[0] - 10, oy + 6, 'x = 0', 'end']], pts, 15, vb);
    // Campo: flechas sobre el cubo, más largas a la derecha.
    var top = Math.min(V[7][1], V[6][1]) - 30, xs = [0.2, 0.5, 0.8].map(function (f) { return o[0] + f * (V[5][0] - o[0]); });
    xs.forEach(function (x) { var L = 16 + 44 * (x - o[0]) / (V[5][0] - o[0]); body += arrow('aux', x, top, L, 0, 2.4); pts = pts.concat(arrowPts(x, top, L, 0)); });
    body += f2exPut([[xs[0] - 10, top + 6, 'E = cx î', 'end'], [xs[0], top - 16, 'E = cx î', 'start'], [xs[0], top + 24, 'E = cx î', 'start']], pts, 16, vb);
    body += f2exDim(o[0], V[0][0], oy + 32, pts) + f2exDim(V[0][0], V[1][0], oy + 32, pts);
    body += f2exPut([[(o[0] + V[0][0]) / 2, oy + 56, x0 + ' cm', 'middle'], [(o[0] + V[0][0]) / 2, oy + 78, x0 + ' cm', 'middle']], pts, fs, vb);
    body += f2exPut([[(V[0][0] + V[1][0]) / 2, oy + 56, 'a = ' + a + ' cm', 'middle'], [(V[0][0] + V[1][0]) / 2, oy + 78, 'a = ' + a + ' cm', 'middle'], [V[1][0] + 10, oy + 56, 'a = ' + a + ' cm', 'start']], pts, fs, vb);
    return svgBox('0 0 640 320', 'Un cubo de lado ' + a + ' cm con su cara izquierda a ' + x0 + ' cm del plano x = 0, en un campo que apunta en +x y crece con x.', body);
  };

  /* ---------- Prisma en un campo inclinado, vista de canto (S07) ---------- */
  D['f2exam-prisma'] = function (s) {
    var b = Math.max(1, num(s, 'b', 20)), h = Math.max(1, num(s, 'h', 20)), al = Math.min(80, Math.max(0, num(s, 'al', 30))), E = num(s, 'E', 500);
    var sc = Math.min(260 / b, 210 / h, 7), x0 = 300, yb = 250, Bx = x0 + b * sc, Ht = yb - h * sc, fs = 16, vb = [0, 0, 640, 320];
    var tri = [[x0, yb], [Bx, yb], [x0, Ht]], body = fill('area-fill', tri) + poly('ref', tri, 2.6, true), pts = polyPts(tri.concat([tri[0]]));
    // Normal de la cara inclinada, desde su punto medio.
    var mx = (x0 + Bx) / 2, my = (yb + Ht) / 2, L = Math.hypot(b, h), nx = h / L, ny = -b / L;
    body += arrow('trace', mx, my, nx * 56, ny * 56, 2.4); pts = pts.concat(arrowPts(mx, my, nx * 56, ny * 56));
    body += f2exPut([[mx + nx * 56 + 8, my + ny * 56 + 4, 'n̂', 'start'], [mx + nx * 56, my + ny * 56 - 12, 'n̂', 'middle'], [mx + nx * 56 + 8, my + ny * 56 + 20, 'n̂', 'start']], pts, 18, vb);
    // Campo: tres flechas paralelas a la izquierda de la pared, con el ángulo α en la de abajo.
    var ca = Math.cos(al * RAD), sa = Math.sin(al * RAD), La = 74, ys = [yb - 6, yb - 76, yb - 146];
    ys.forEach(function (y, i) {
      var xs = 60 + i * 12;
      body += arrow('aux', xs, y, La * ca, -La * sa, 2.4); pts = pts.concat(arrowPts(xs, y, La * ca, -La * sa));
    });
    body += seg('axis', 60, yb - 6, 60 + La + 8, yb - 6, 1.1, '4 4') + arc(60, yb - 6, 44, 0, al, 'axis', 1.4);
    pts = pts.concat(segPts(60, yb - 6, 60 + La + 8, yb - 6));
    for (var t = 0; t <= al; t += 3) pts.push([60 + 44 * Math.cos(t * RAD), yb - 6 - 44 * Math.sin(t * RAD)]);
    body += f2exPut([[60 + 52 * Math.cos(al * RAD / 2) + 4, yb - 6 - 52 * Math.sin(al * RAD / 2) + 6, 'α = ' + al + '°', 'start'], [60 + La + 12, yb, 'α = ' + al + '°', 'start'], [60, yb + 22, 'α = ' + al + '°', 'start']], pts, 15, vb);
    body += f2exPut([[60 + 24 + La * ca, ys[2] - La * sa - 4, 'E = ' + E + ' N/C', 'start'], [60, ys[2] - La * sa - 20, 'E = ' + E + ' N/C', 'start'], [60, 30, 'E = ' + E + ' N/C', 'start']], pts, fs, vb);
    // Cotas.
    body += f2exDim(x0, Bx, yb + 26, pts) + f2exPut([[(x0 + Bx) / 2, yb + 50, 'b = ' + b + ' cm', 'middle']], pts, fs, vb);
    body += f2exDimV(x0 - 20, Ht, yb, pts) + f2exPut([[x0 - 30, (Ht + yb) / 2 + 6, 'h = ' + h + ' cm', 'end'], [x0 - 30, Ht + 12, 'h = ' + h + ' cm', 'end'], [x0 + 10, Ht - 10, 'h = ' + h + ' cm', 'start']], pts, fs, vb);
    var tx = b / L, ty = h / L;
    body += f2exPut([[mx + nx * 22 + tx * 40, my + ny * 22 + ty * 40 + 6, 'cara inclinada', 'start'], [mx + nx * 22 + tx * 70, my + ny * 22 + ty * 70 + 6, 'cara inclinada', 'start'], [Bx + 14, yb - 10, 'cara inclinada', 'start'], [mx + nx * 56, my + ny * 56 - 30, 'cara inclinada', 'middle'], [Bx - 10, yb + 50, 'cara inclinada', 'end']], pts, 15, vb);
    return svgBox('0 0 640 320', 'Vista de canto del prisma: base de ' + b + ' cm, pared vertical de ' + h + ' cm y la cara inclinada con su normal hacia afuera. El campo uniforme apunta ' + al + ' grados sobre la horizontal.', body);
  };

  /* ---------- Esfera aislante y superficie gaussiana (S08) ---------- */
  D['f2exam-esfera'] = function (s) {
    var Q = num(s, 'Q', 40), R = Math.max(1, num(s, 'R', 6)), r = Math.min(R, Math.max(0.1, num(s, 'r', 3)));
    var C = [200, 165], Rp = 128, rp = Math.max(14, Rp * r / R), fs = 16, vb = [0, 20, 640, 310];
    var big = f2exCirc(C[0], C[1], Rp), g = f2exCirc(C[0], C[1], rp);
    var body = '<circle class="box-err" cx="' + C[0] + '" cy="' + C[1] + '" r="' + Rp + '"/>' + poly('trace', g.concat([g[0]]), 2.4, false, '7 6');
    var pts = [].concat(big, polyPts(g.concat([g[0]]))), A1 = 28 * RAD, A2 = -32 * RAD;
    body += dot('dot-ref', C[0], C[1], 4); pts = pts.concat(f2exCirc(C[0], C[1], 5));
    // Radios: R hacia arriba a la derecha, r hacia abajo a la derecha, con su etiqueta afuera de la esfera.
    var eR = [C[0] + Rp * Math.cos(A1), C[1] - Rp * Math.sin(A1)], er = [C[0] + rp * Math.cos(A2), C[1] - rp * Math.sin(A2)];
    body += seg('axis', C[0], C[1], eR[0], eR[1], 1.6) + seg('trace', C[0], C[1], er[0], er[1], 1.6);
    pts = pts.concat(segPts(C[0], C[1], eR[0], eR[1]), segPts(C[0], C[1], er[0], er[1]));
    var lx = C[0] + Rp + 34, lr = [lx, C[1] - (Rp + 34) * Math.sin(A2) * 0.9];
    body += seg('axis', er[0], er[1], lr[0] - 6, lr[1], 1, '3 4'); pts = pts.concat(segPts(er[0], er[1], lr[0] - 6, lr[1]));
    body += f2exPut([[lr[0], lr[1] + 6, 'r = ' + r + ' cm (gaussiana)', 'start']], pts, fs, vb);
    body += f2exPut([[eR[0] + 12, eR[1] + 2, 'R = ' + R + ' cm', 'start'], [eR[0] + 12, eR[1] - 16, 'R = ' + R + ' cm', 'start']], pts, fs, vb);
    body += f2exPut([[C[0] + Rp * 0.8 + 18, C[1] - Rp * 0.8 - 2, 'Q = +' + Q + ' nC', 'start'], [C[0], C[1] - Rp - 12, 'Q = +' + Q + ' nC', 'middle']], pts, fs, vb);
    return svgBox('0 20 640 290', 'Corte de una esfera aislante de radio ' + R + ' cm con carga positiva en todo su volumen y, adentro, una superficie gaussiana esférica de radio ' + r + ' cm, punteada.', body);
  };

  /* ---------- Capacitor de placas con batería (S09) ---------- */
  D['f2exam-capacitor'] = function (s) {
    var A = Math.max(1, num(s, 'A', 200)), d = Math.max(0.1, num(s, 'd', 2)), V = num(s, 'V', 100);
    var Lp = Math.min(260, 100 + (Math.sqrt(A) - 7) * 12), gap = Math.min(120, 34 + d * 16), x0 = 230, x1 = x0 + Lp, yc = 165, th = 16;
    var yt = yc - gap / 2, yb2 = yc + gap / 2, fs = 16, vb = [0, 20, 640, 300], body = '', pts = [], i;
    body += '<rect class="box-err" x="' + x0 + '" y="' + r1(yt - th) + '" width="' + r1(Lp) + '" height="' + th + '"/>' + '<rect class="box-aux" x="' + x0 + '" y="' + r1(yb2) + '" width="' + r1(Lp) + '" height="' + th + '"/>';
    pts = pts.concat(polyPts([[x0, yt - th], [x1, yt - th], [x1, yt], [x0, yt], [x0, yt - th]]), polyPts([[x0, yb2], [x1, yb2], [x1, yb2 + th], [x0, yb2 + th], [x0, yb2]]));
    var n = Math.max(3, Math.floor(Lp / 34));
    for (i = 0; i < n; i++) { var xs = x0 + (i + 0.5) * Lp / n; body += text(xs, yt - 3, '+', ' text-anchor="middle" font-size="16"') + text(xs, yb2 + 13, '−', ' text-anchor="middle" font-size="16"'); }
    // Campo entre las placas.
    if (gap >= 40) [0.25, 0.5, 0.75].forEach(function (f) { var xa = x0 + Lp * f; body += arrow('aux', xa, yt + 5, 0, gap - 10, 2.2); pts = pts.concat(arrowPts(xa, yt + 5, 0, gap - 10)); });
    // Cables y batería a la izquierda.
    var xbat = 110, yy1 = yt - th / 2, yy2 = yb2 + th / 2;
    [[x0, yy1, xbat, yy1], [xbat, yy1, xbat, yc - 6], [xbat, yc + 6, xbat, yy2], [xbat, yy2, x0, yy2]].forEach(function (q) { body += seg('axis', q[0], q[1], q[2], q[3], 2.2); pts = pts.concat(segPts(q[0], q[1], q[2], q[3])); });
    body += f2exBatV(xbat, yc); pts = pts.concat(segPts(xbat - 20, yc - 6, xbat + 20, yc - 6), segPts(xbat - 10, yc + 6, xbat + 10, yc + 6));
    body += f2exPut([[xbat - 26, yc - 4, '+', 'end']], pts, 18, vb);
    body += f2exPut([[xbat + 28, yc + 6, V + ' V', 'start'], [xbat - 26, yc + 22, V + ' V', 'end']], pts, fs, vb);
    // Cotas y área.
    body += f2exDimV(x1 + 22, yt, yb2, pts) + f2exPut([[x1 + 34, yc + 6, 'd = ' + d + ' mm', 'start']], pts, fs, vb);
    body += f2exPut([[(x0 + x1) / 2, yt - th - 12, 'A = ' + A + ' cm²', 'middle']], pts, fs, vb);
    return svgBox('0 20 640 280', 'Dos placas paralelas de ' + A + ' centímetros cuadrados separadas ' + d + ' mm, conectadas a una batería de ' + V + ' V; la de arriba queda positiva.', body);
  };

  /* ---------- Cable coaxial en corte (S09) ---------- */
  D['f2exam-coaxial'] = function (s) {
    var a = Math.max(0.1, num(s, 'a', 1)), b = Math.max(a * 1.2, num(s, 'b', 4)), r = Math.min(b, Math.max(a, num(s, 'r', 2))), L = num(s, 'L', 20);
    var C = [190, 168], Rb = 122, ra = Math.max(5, Rb * a / b), rr = Rb * r / b, fs = 16, vb = [0, 20, 640, 336];
    var outer = f2exCirc(C[0], C[1], Rb + 5), gs = f2exCirc(C[0], C[1], rr);
    var body = poly('aux', outer.concat([outer[0]]), 10) + poly('trace', gs.concat([gs[0]]), 2, false, '7 6') + '<circle class="box-err" cx="' + C[0] + '" cy="' + C[1] + '" r="' + r1(ra) + '"/>';
    var pts = [].concat(f2exCirc(C[0], C[1], Rb), f2exCirc(C[0], C[1], Rb + 10), polyPts(gs.concat([gs[0]])), f2exCirc(C[0], C[1], ra));
    // Llamadas: cada radio se señala con un punto en su círculo y una guía hacia la derecha.
    function call(rad, deg, y, t) {
      var p = [C[0] + rad * Math.cos(deg * RAD), C[1] - rad * Math.sin(deg * RAD)], q = [C[0] + Rb + 40, y];
      var o = seg('axis', p[0], p[1], q[0], q[1], 1, '3 4') + dot('dot-ref', p[0], p[1], 3.5);
      pts.push.apply(pts, segPts(p[0], p[1], q[0], q[1]));
      return o + f2exPut([[q[0] + 6, q[1] + 6, t, 'start']], pts, fs, vb);
    }
    body += call(Rb, 40, C[1] - 108, 'forro: b = ' + b + ' mm');
    body += call(rr, -10, C[1] + 14, 'r = ' + r + ' mm');
    body += call(ra, -60, C[1] + 98, 'alambre: a = ' + a + ' mm');
    body += f2exPut([[C[0], C[1] + Rb + 30, 'corte del cable (largo ' + L + ' m)', 'middle']], pts, 15, vb);
    return svgBox('0 20 640 316', 'Corte transversal de un cable coaxial: alambre central de radio ' + a + ' mm, forro de radio ' + b + ' mm y, punteado, el círculo de radio ' + r + ' mm donde se pide el campo.', body);
  };

  /* ---------- Red: C1 en serie con C2 ∥ C3 (S10) ---------- */
  D['f2exam-red'] = function (s) {
    var C1 = num(s, 'C1', 4), C2 = num(s, 'C2', 2), C3 = num(s, 'C3', 6), V = num(s, 'V', 12);
    var xl = 70, xa = 340, xb = 480, yt = 70, yb = 270, yc = 170, x1 = 210, fs = 16, vb = [0, 20, 640, 290], body = '', pts = [];
    var wires = [[xl, yt, x1 - 6, yt], [x1 + 6, yt, xb, yt], [xl, yb, xb, yb], [xl, yt, xl, yc - 6], [xl, yc + 6, xl, yb],
      [xa, yt, xa, yc - 6], [xa, yc + 6, xa, yb], [xb, yt, xb, yc - 6], [xb, yc + 6, xb, yb]];
    wires.forEach(function (w) { body += seg('axis', w[0], w[1], w[2], w[3], 2.2); pts = pts.concat(segPts(w[0], w[1], w[2], w[3])); });
    body += f2exCapH(x1, yt, 18) + f2exCapV(xa, yc, 18) + f2exCapV(xb, yc, 18) + f2exBatV(xl, yc);
    pts = pts.concat(segPts(x1 - 6, yt - 18, x1 - 6, yt + 18), segPts(x1 + 6, yt - 18, x1 + 6, yt + 18));
    [xa, xb].forEach(function (x) { pts = pts.concat(segPts(x - 18, yc - 6, x + 18, yc - 6), segPts(x - 18, yc + 6, x + 18, yc + 6)); });
    pts = pts.concat(segPts(xl - 20, yc - 6, xl + 20, yc - 6), segPts(xl - 10, yc + 6, xl + 10, yc + 6));
    body += dot('dot-ref', xa, yt, 4.5) + dot('dot-ref', xa, yb, 4.5);
    body += f2exPut([[x1, yt - 28, 'C₁ = ' + f2exNum(C1) + ' μF', 'middle']], pts, fs, vb);
    body += f2exPut([[xa - 28, yc + 6, 'C₂ = ' + f2exNum(C2) + ' μF', 'end']], pts, fs, vb);
    body += f2exPut([[xb + 28, yc + 6, 'C₃ = ' + f2exNum(C3) + ' μF', 'start']], pts, fs, vb);
    body += f2exPut([[xl - 26, yc - 2, '+', 'end']], pts, 18, vb);
    body += f2exPut([[xl + 28, yc + 6, f2exNum(V) + ' V', 'start']], pts, fs, vb);
    return svgBox('0 20 640 270', 'Circuito: una batería de ' + V + ' V, el capacitor C1 en el cable de arriba y, a la derecha, C2 y C3 en paralelo.', body);
  };

  /* ══════════════════════ fin Examen ══════════════════════ */
})();
