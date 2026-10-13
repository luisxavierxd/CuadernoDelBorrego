/* =====================================================================
   Diagramas de Física 3: window.Diagrams[id](state) → SVG (string).
   Mismos roles y reglas que fisica-2.js: campo o trazo real .ref ·
   componentes y elementos .aux · fuerza, campo resultante o error .error ·
   recorrido .trace · lo del alumno .student.
   Solo clases de rol; los colores salen de tokens.css. El explainer interpola
   los campos numéricos de `state` entre pasos y vuelve a llamar a la función.
   Cada sesión escribe sus figuras dentro de su propio bloque (══ SNN ══).
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
  // Imán de barra de largo w y alto hh centrado en (cx, cy); N rojo, S azul. flip = N a la izquierda.
  function f3Bar(cx, cy, w, hh, flip) {
    var a = flip ? 'box-aux' : 'box-err', b = flip ? 'box-err' : 'box-aux', fs = Math.round(hh * 0.62);
    return '<rect class="' + b + '" x="' + r1(cx - w / 2) + '" y="' + r1(cy - hh / 2) + '" width="' + r1(w / 2) + '" height="' + r1(hh) + '"/>' +
      '<rect class="' + a + '" x="' + r1(cx) + '" y="' + r1(cy - hh / 2) + '" width="' + r1(w / 2) + '" height="' + r1(hh) + '"/>' +
      text(cx + w / 4, cy + fs * 0.35, flip ? 'S' : 'N', ' text-anchor="middle" font-size="' + fs + '"') +
      text(cx - w / 4, cy + fs * 0.35, flip ? 'N' : 'S', ' text-anchor="middle" font-size="' + fs + '"');
  }
  // Trazado de una línea de campo de polos puntuales (px): poles = [{ x, y, s }], s = +1 (N) o −1 (S).
  function f3Dir(poles, x, y) {
    var bx = 0, by = 0;
    poles.forEach(function (p) { var dx = x - p.x, dy = y - p.y, r = Math.hypot(dx, dy) || 1; bx += p.s * dx / (r * r * r); by += p.s * dy / (r * r * r); });
    var m = Math.hypot(bx, by) || 1;
    return [bx / m, by / m];
  }
  function f3Trace(poles, x0, y0, box, stop) {
    var pts = [[x0, y0]], x = x0, y = y0, ds = 5, hit = false;
    for (var k = 0; k < 700; k++) {
      var a = f3Dir(poles, x, y), b = f3Dir(poles, x + ds / 2 * a[0], y + ds / 2 * a[1]), c = f3Dir(poles, x + ds / 2 * b[0], y + ds / 2 * b[1]), d = f3Dir(poles, x + ds * c[0], y + ds * c[1]);
      x += ds / 6 * (a[0] + 2 * b[0] + 2 * c[0] + d[0]); y += ds / 6 * (a[1] + 2 * b[1] + 2 * c[1] + d[1]);
      pts.push([x, y]);
      if (poles.some(function (p) { return p.s < 0 && Math.hypot(p.x - x, p.y - y) < stop; })) { hit = true; break; }
      if (x < box[0] || x > box[2] || y < box[1] || y > box[3]) break;
    }
    return { pts: pts, hit: hit };
  }
  // Punta de flecha en el punto k de una polilínea.
  function f3Head(pts, k, cls) {
    if (k < 1 || k >= pts.length - 1) return '';
    var a = pts[k - 1], b = pts[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, m = pts[k];
    return '<path class="' + cls + '" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M' + r1(m[0] - ux * 8 - uy * 5) + ' ' + r1(m[1] - uy * 8 + ux * 5) + 'L' + r1(m[0]) + ' ' + r1(m[1]) + 'L' + r1(m[0] - ux * 8 + uy * 5) + ' ' + r1(m[1] - uy * 8 - ux * 5) + '"/>';
  }
  // Líneas de campo de afuera de una barra horizontal con N a la derecha (op: opacidad; box: [x0, y0, x1, y1]).
  function f3Outer(cx, cy, half, box, op) {
    var nx = cx + half, body = '';
    var poles = [{ x: nx, y: cy, s: 1 }, { x: cx - half, y: cy, s: -1 }];
    [-165, -135, -105, -78, -52, -28, -9, 9, 28, 52, 78, 105, 135, 165].forEach(function (g) {
      var a = g * RAD, t = f3Trace(poles, nx + 14 * Math.cos(a), cy - 14 * Math.sin(a), box, 12);
      if (!t.hit) return;
      body += poly('ref', t.pts, 2.2) + f3Head(t.pts, Math.floor(t.pts.length * 0.5), 'ref');
    });
    return fade(body, op);
  }
  // Líneas de adentro (de S a N), a las alturas dys sobre el eje; se dibujan encima de la barra.
  function f3Inner(cx, cy, half, dys, op) {
    var ins = '';
    dys.forEach(function (dy) {
      ins += seg('ref', cx - half + 6, cy + dy, cx + half - 6, cy + dy, 2.2);
      ins += '<path class="ref" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M' + r1(cx + 2) + ' ' + r1(cy + dy - 5) + 'L' + r1(cx + 10) + ' ' + r1(cy + dy) + 'L' + r1(cx + 2) + ' ' + r1(cy + dy + 5) + '"/>';
    });
    return fade(ins, op);
  }

  /* ---------- S01 · Polos iguales se repelen, opuestos se atraen ---------- */
  D['f3s01-poles'] = function () {
    var body = '', xa = 110, xb = 290, w = 120, hh = 38;
    [
      { y: 55, lf: false, rf: false, att: true, cap: 'N frente a S: se atraen' },
      { y: 140, lf: false, rf: true, att: false, cap: 'N frente a N: se repelen' },
      { y: 225, lf: true, rf: false, att: false, cap: 'S frente a S: se repelen' }
    ].forEach(function (r) {
      // lf = true pone la N del imán izquierdo a la izquierda; rf = true pone la N del derecho a la izquierda.
      body += f3Bar(xa, r.y, w, hh, r.lf) + f3Bar(xb, r.y, w, hh, r.rf);
      if (r.att) body += arrow('error', xa + w / 2 + 6, r.y, 20, 0) + arrow('error', xb - w / 2 - 6, r.y, -20, 0);
      else body += arrow('error', xa - w / 2 - 6, r.y, -38, 0) + arrow('error', xb + w / 2 + 6, r.y, 38, 0);
      body += text(405, r.y + 6, r.cap, ' font-size="18"');
    });
    return svgBox('0 15 640 270', 'Dos imanes de barra. Si se enfrentan polos distintos (N con S) se atraen; si se enfrentan polos iguales (N con N, o S con S) se repelen. Las flechas son las fuerzas sobre cada imán.', body);
  };

  /* ---------- S01 · Si partes un imán, no separas los polos ---------- */
  D['f3s01-break'] = function () {
    var body = f3Bar(200, 45, 240, 38, false) + text(350, 51, 'un imán', ' font-size="19"');
    body += f3Bar(140, 130, 112, 38, false) + f3Bar(262, 130, 112, 38, false) + seg('axis', 201, 100, 201, 160, 1.4, '5 5') + text(350, 136, 'lo partes: dos imanes', ' font-size="19"');
    [0, 1, 2, 3].forEach(function (i) { body += f3Bar(62 + i * 66, 215, 56, 38, false); });
    body += text(350, 221, 'otra vez: cuatro imanes', ' font-size="19"');
    body += text(200, 275, 'cada pedazo vuelve a tener su N y su S', ' text-anchor="middle" font-size="18"');
    return svgBox('0 15 640 290', 'Un imán de barra se parte en dos y cada mitad es un imán completo con su polo N y su polo S; si se parte otra vez, salen cuatro imanes, siempre con dos polos cada uno.', body);
  };

  /* ---------- S01 · Líneas de campo de un imán; brújulas que las dibujan (explainer) ----------
     state: comp (brújulas 0–1) · lines (líneas 0–1) · inside (líneas por dentro 0–1). */
  D['f3s01-fieldmap'] = function (s) {
    var comp = clamp01(num(s, 'comp', 0)), lines = clamp01(num(s, 'lines', 1)), inside = clamp01(num(s, 'inside', 0));
    var cx = 320, cy = 150, half = 70, box = [20, 22, 620, 282], body = '';
    body += f3Outer(cx, cy, half, box, lines);
    body += f3Bar(cx, cy, 2 * half, 40, false);
    body += f3Inner(cx, cy, half, [-13, 13], inside);
    if (comp > 0) {
      var poles = [{ x: cx + half, y: cy, s: 1 }, { x: cx - half, y: cy, s: -1 }], n = '';
      [[-250, -90], [-250, 0], [-250, 90], [-170, -105], [-170, 105], [-80, -115], [-80, 115], [80, -115], [80, 115], [170, -105], [170, 105], [250, -90], [250, 0], [250, 90], [0, -115], [0, 115], [-170, 0], [170, 0]].forEach(function (o) {
        var x = cx + o[0], y = cy + o[1], d = f3Dir(poles, x, y), L = 17, W = 5, ux = d[0], uy = d[1], nx = -uy, ny = ux;
        n += '<circle class="axis" fill="none" stroke-width="1.4" cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + (L + 4) + '"/>' +
          '<path class="box-err" d="M' + r1(x + ux * L) + ' ' + r1(y + uy * L) + 'L' + r1(x + nx * W) + ' ' + r1(y + ny * W) + 'L' + r1(x - nx * W) + ' ' + r1(y - ny * W) + 'Z"/>' +
          '<path class="box-aux" d="M' + r1(x - ux * L) + ' ' + r1(y - uy * L) + 'L' + r1(x + nx * W) + ' ' + r1(y + ny * W) + 'L' + r1(x - nx * W) + ' ' + r1(y - ny * W) + 'Z"/>';
      });
      body += fade(n, comp);
    }
    return svgBox('0 10 640 290', 'Un imán de barra con su polo N a la derecha. ' + (comp > 0.5 ? 'Una brújula en cada punto del plano apunta en la dirección del campo. ' : '') + (lines > 0.5 ? 'Las líneas de campo salen del polo N, rodean al imán y entran por el polo S.' : ''), body);
  };

  /* ---------- S01 · La Tierra es un imán gigante ---------- */
  D['f3s01-earth'] = function () {
    var cx = 320, cy = 150, R = 86, body = '<circle class="box-base" cx="' + cx + '" cy="' + cy + '" r="' + R + '"/>';
    // El polo norte geográfico es un polo S magnético: arriba va la S del imán interno.
    var half = 40, poles = [{ x: cx, y: cy + half, s: 1 }, { x: cx, y: cy - half, s: -1 }], box = [20, 5, 620, 295];
    [-1, 1].forEach(function (side) {
      [20, 45, 75, 105, 140, 165].forEach(function (g) {
        var a = g * RAD, t = f3Trace(poles, cx + side * 14 * Math.sin(a), cy + half + 14 * Math.cos(a), box, 12);
        if (!t.hit) return;
        var out = t.pts.filter(function (p) { return Math.hypot(p[0] - cx, p[1] - cy) > R; });
        if (out.length < 4) return;
        body += poly('ref', out, 2) + f3Head(out, Math.floor(out.length * 0.5), 'ref');
      });
    });
    // Imán interno vertical: S arriba, N abajo.
    body += '<rect class="box-aux" x="' + (cx - 11) + '" y="' + (cy - 40) + '" width="22" height="40"/><rect class="box-err" x="' + (cx - 11) + '" y="' + cy + '" width="22" height="40"/>';
    body += text(cx, cy - 16, 'S', ' text-anchor="middle" font-size="16"') + text(cx, cy + 28, 'N', ' text-anchor="middle" font-size="16"');
    body += text(cx, 17, 'norte geográfico', ' text-anchor="middle" font-size="17"') + text(cx, 294, 'sur geográfico', ' text-anchor="middle" font-size="17"');
    return svgBox('0 0 640 300', 'La Tierra se comporta como un imán de barra enorme. Su polo sur magnético está cerca del polo norte geográfico, por eso el extremo N de una brújula apunta al norte.', body);
  };

  /* ---------- S01 · E nace y muere en cargas; B se cierra ---------- */
  D['f3s01-eb'] = function () {
    var body = '', box = [20, 10, 300, 270];
    var A = { x: 90, y: 140 }, Bq = { x: 230, y: 140 }, pe = [{ x: A.x, y: A.y, s: 1 }, { x: Bq.x, y: Bq.y, s: -1 }];
    [-150, -120, -90, -60, -30, 30, 60, 90, 120, 150].forEach(function (g) {
      var a = g * RAD, t = f3Trace(pe, A.x + 16 * Math.cos(a), A.y - 16 * Math.sin(a), box, 14);
      if (t.hit) body += poly('ref', t.pts, 2) + f3Head(t.pts, Math.floor(t.pts.length * 0.5), 'ref');
    });
    body += '<circle class="box-err" cx="' + A.x + '" cy="' + A.y + '" r="14"/>' + text(A.x, A.y + 8, '+', ' text-anchor="middle" font-size="22"');
    body += '<circle class="box-aux" cx="' + Bq.x + '" cy="' + Bq.y + '" r="14"/>' + text(Bq.x, Bq.y + 8, '−', ' text-anchor="middle" font-size="22"');
    body += text(160, 290, 'E: nace en +, muere en −', ' text-anchor="middle" font-size="18"');
    body += f3Outer(480, 140, 45, [340, 10, 620, 270], 1) + f3Bar(480, 140, 90, 36, false) + f3Inner(480, 140, 45, [-12, 12], 1);
    body += text(480, 290, 'B: se cierra sobre sí misma', ' text-anchor="middle" font-size="18"');
    body += seg('axis', 320, 20, 320, 270, 1.4, '4 7');
    return svgBox('0 0 640 300', 'A la izquierda, las líneas del campo eléctrico de una carga positiva y una negativa: empiezan en la positiva y terminan en la negativa. A la derecha, las líneas del campo magnético de un imán: salen del polo N, entran por el S y se cierran por dentro del imán, sin empezar ni terminar en ningún punto.', body);
  };

  /* ══════════════════════ fin S01 ══════════════════════ */

  /* ══════════════════════ S02 ══════════════════════ */
  // Flecha 3D proyectada con P = view3(...).
  function f3aArrow3(P, cls, a, b, w) { var A = P(a), B = P(b); return arrow(cls, A[0], A[1], B[0] - A[0], B[1] - A[1], w); }
  function f3aLabel3(P, p, s, fs) { var q = P(p); return text(q[0], q[1] + 6, s, ' text-anchor="middle" font-size="' + (fs || 20) + '"'); }
  // Campo B perpendicular a la hoja: rejilla de puntos (sale, out = true) o de cruces (entra).
  function f3aGrid(x0, y0, x1, y1, step, out, op) {
    var o = '';
    for (var x = x0; x <= x1 + 0.1; x += step) for (var y = y0; y <= y1 + 0.1; y += step) {
      if (out) o += '<circle class="aux" fill="none" stroke-width="1.6" cx="' + r1(x) + '" cy="' + r1(y) + '" r="6"/>' + dot('aux', x, y, 2);
      else o += seg('aux', x - 5, y - 5, x + 5, y + 5, 1.8) + seg('aux', x - 5, y + 5, x + 5, y - 5, 1.8);
    }
    return op == null ? o : fade(o, op);
  }
  function f3aCharge(x, y, pos, r) {
    r = r || 14;
    return '<circle class="' + (pos ? 'box-err' : 'box-aux') + '" cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r + '"/>' + text(x, y + r * 0.45, pos ? '+' : '−', ' text-anchor="middle" font-size="' + Math.round(r * 1.4) + '"');
  }

  /* ---------- S02 · v, B y F = qv×B en 3D (show: 0 v, 1 B, 2 θ, 3 F; sg: signo de q) ---------- */
  D['f3s02-rhr'] = function (s) {
    var show = num(s, 'show', 3), th = num(s, 'th', 60), sg = num(s, 'sg', 1) < 0 ? -1 : 1;
    var P = view3({ cx: 320, cy: 225, s: 52, az: -40, el: 35 }), body = '', O = [0, 0, 0];
    body += axes3(P, 4.2, 17);
    var plane = [[-1.5, -1.5, 0], [4, -1.5, 0], [4, 4, 0], [-1.5, 4, 0]].map(P);
    body += poly('axis', plane, 1, true, '4 6');
    var vE = [3.4, 0, 0], t = th * RAD, bE = [2.8 * Math.cos(t), 2.8 * Math.sin(t), 0];
    body += fade(f3aArrow3(P, 'ref', O, vE, 3.6) + f3aLabel3(P, [3.9, 0, 0.35], '<tspan font-style="italic">v</tspan>'), clamp01(show + 1));
    body += fade(f3aArrow3(P, 'aux', O, bE, 3.6) + f3aLabel3(P, [bE[0] * 1.18, bE[1] * 1.18, 0.35], '<tspan font-style="italic">B</tspan>'), clamp01(show));
    if (th > 0) {
      var pts = [];
      for (var i = 0; i <= 24; i++) { var a = t * i / 24; pts.push(P([1.4 * Math.cos(a), 1.4 * Math.sin(a), 0])); }
      body += fade(poly('trace', pts, 2) + f3aLabel3(P, [2.05 * Math.cos(t / 2), 2.05 * Math.sin(t / 2), 0], 'θ', 18), clamp01(show - 1));
    }
    var fm = 3 * Math.sin(t) * sg;
    if (Math.abs(fm) > 0.05) body += fade(f3aArrow3(P, 'error', O, [0, 0, fm], 4) + f3aLabel3(P, [0.45, 0, fm + (fm > 0 ? 0.35 : -0.45)], '<tspan font-style="italic">F</tspan>'), clamp01(show - 2));
    var o = P(O);
    body += f3aCharge(o[0], o[1], sg > 0, 12);
    body += fade(text(610, 40, sg > 0 ? 'q &gt; 0: F en el sentido de v × B' : 'q &lt; 0: F contra v × B', ' text-anchor="end" font-size="18"'), clamp01(show - 2));
    return svgBox('0 0 640 400', 'Una carga en el origen con su velocidad v sobre el eje x y el campo B en el plano xy a un ángulo θ de v. La fuerza F = q v × B sale perpendicular a ese plano, sobre el eje z: hacia arriba si la carga es positiva y hacia abajo si es negativa.', body);
  };

  /* ---------- S02 · Regla de la mano derecha en la hoja: B entra o sale y F en el plano ---------- */
  // cases: 4 viñetas con B ⊗ o ⊙, v → o ↑, y F resultante.
  D['f3s02-page'] = function () {
    var body = '', cases = [
      { out: false, v: [1, 0], pos: true, F: [0, 1], t: 'B entra, q > 0' },
      { out: true, v: [1, 0], pos: true, F: [0, -1], t: 'B sale, q > 0' },
      { out: false, v: [0, -1], pos: true, F: [1, 0], t: 'B entra, v hacia abajo' },
      { out: false, v: [1, 0], pos: false, F: [0, -1], t: 'B entra, q < 0' }
    ];
    // En pantalla y crece hacia abajo; los vectores v y F de arriba usan y hacia arriba.
    cases.forEach(function (c, i) {
      var x0 = 10 + i * 157, cx = x0 + 75, cy = 140;
      body += '<rect class="axis" fill="none" stroke-width="1.2" x="' + x0 + '" y="20" width="150" height="230" rx="8"/>';
      body += f3aGrid(x0 + 20, 40, x0 + 130, 230, 36.7, c.out, 0.4);
      body += arrow('ref', cx, cy, c.v[0] * 46, -c.v[1] * 46, 3.4) + arrow('error', cx, cy, c.F[0] * 50, -c.F[1] * 50, 3.8);
      body += f3aCharge(cx, cy, c.pos, 12);
      var vx = cx + c.v[0] * 58, vy = cy - c.v[1] * 62 + 6, fxp = cx + c.F[0] * 60, fyp = cy - c.F[1] * 66 + 6;
      body += text(vx + (c.v[0] === 0 ? 14 : 0), vy + (c.v[1] === 0 ? -14 : 0), '<tspan font-style="italic">v</tspan>', ' text-anchor="middle" font-size="18"');
      body += text(fxp + (c.F[0] === 0 ? 16 : 0), fyp + (c.F[1] === 0 ? -14 : 0), '<tspan font-style="italic">F</tspan>', ' text-anchor="middle" font-size="18"');
      body += text(cx, 278, c.t.replace('>', '&gt;').replace('<', '&lt;'), ' text-anchor="middle" font-size="15"');
    });
    return svgBox('0 0 640 300', 'Cuatro casos con el campo perpendicular a la hoja. Cruces: B entra a la hoja. Puntos: B sale de la hoja. Primer caso: B entra, carga positiva hacia la derecha, la fuerza va hacia arriba. Segundo: B sale, carga positiva hacia la derecha, la fuerza va hacia abajo. Tercero: B entra, carga positiva hacia abajo, la fuerza va a la derecha. Cuarto: B entra, carga negativa hacia la derecha, la fuerza va hacia abajo.', body);
  };

  /* ---------- S02 · F contra θ: F = |q|vB sin θ ---------- */
  D['f3s02-sin'] = function (s) {
    var th = num(s, 'th', 60), body = '', x0 = 70, y0 = 230, W = 520, Hh = 170;
    body += arrow('axis', x0, y0, W + 20, 0, 1.6) + arrow('axis', x0, y0, 0, -Hh - 25, 1.6);
    var pts = [];
    for (var i = 0; i <= 90; i++) { var a = i * 2; pts.push([x0 + W * a / 180, y0 - Hh * Math.sin(a * RAD)]); }
    body += poly('ref', pts, 3);
    [0, 90, 180].forEach(function (a) { body += seg('axis', x0 + W * a / 180, y0, x0 + W * a / 180, y0 + 6, 1.4) + text(x0 + W * a / 180, y0 + 26, a + '°', ' text-anchor="middle" font-size="16"'); });
    body += seg('axis', x0 - 6, y0 - Hh, x0 + W, y0 - Hh, 1, '4 6') + text(x0 - 10, y0 - Hh + 6, '|q|vB', ' text-anchor="end" font-size="16"');
    var px = x0 + W * th / 180, py = y0 - Hh * Math.sin(th * RAD);
    body += seg('trace', px, y0, px, py, 2, '5 4') + dot('error', px, py, 6);
    body += text(x0 + W + 34, y0 + 6, 'θ', ' text-anchor="middle" font-size="18"') + text(x0 + 10, y0 - Hh - 30, '<tspan font-style="italic">F</tspan>', ' font-size="18"');
    body += text(x0 - 20, y0 + 52, 'v ∥ B: F = 0', ' font-size="15"') + text(x0 + W + 20, y0 + 52, 'v antiparalela: F = 0', ' text-anchor="end" font-size="15"');
    return svgBox('0 0 640 295', 'Gráfica de la magnitud de la fuerza magnética contra el ángulo θ entre v y B. Es cero a 0° y a 180° y alcanza su máximo, |q|vB, a 90°.', body);
  };

  /* ---------- S02 · La fuerza magnética no hace trabajo: F ⊥ v en todo el camino ---------- */
  D['f3s02-nowork'] = function () {
    var body = '', cx = 320, cy = 150, R = 95;
    body += f3aGrid(140, 40, 485, 260, 45, false, 0.4);
    body += arc(cx, cy, R, 0, 359.9, 'trace', 2.4);
    [30, 150, 270].forEach(function (a) {
      var x = cx + R * Math.cos(a * RAD), y = cy - R * Math.sin(a * RAD), tx = -Math.sin(a * RAD), ty = -Math.cos(a * RAD);
      body += arrow('ref', x, y, 48 * tx, 48 * ty, 3.2) + arrow('error', x, y, (cx - x) * 0.45, (cy - y) * 0.45, 3.4) + f3aCharge(x, y, true, 10);
    });
    body += text(570, 120, 'F ⊥ v', ' text-anchor="middle" font-size="20"') + text(570, 150, 'W = 0', ' text-anchor="middle" font-size="20"') + text(570, 180, 'rapidez constante', ' text-anchor="middle" font-size="15"');
    return svgBox('0 0 640 300', 'Una carga positiva gira en un campo que entra a la hoja. En tres puntos del camino se ve su velocidad, tangente al círculo, y la fuerza magnética, que apunta al centro: siempre perpendiculares, así que la fuerza no hace trabajo y la rapidez no cambia.', body);
  };


  /* ══════════════════════ fin S02 ══════════════════════ */

  /* ══════════════════════ S03 ══════════════════════ */
  /* ---------- S03 · Órbita circular (show: 0 entra, 1 F, 2 círculo, 3 r y T) ---------- */
  D['f3s03-circle'] = function (s) {
    var show = num(s, 'show', 3), body = '', cx = 300, cy = 140, R = 100;
    body += f3aGrid(150, 25, 460, 265, 40, false, 0.35);
    var ex = cx, ey = cy + R;                                         // entra por abajo, hacia la derecha
    body += seg('trace', 40, ey, ex, ey, 2.2, '6 6');
    var arcPts = [];
    for (var i = 0; i <= 72; i++) { var a = -90 + 5 * i; arcPts.push([cx + R * Math.cos(a * RAD), cy - R * Math.sin(a * RAD)]); }
    body += fade(poly('trace', arcPts, 2.8), clamp01(show - 1));
    body += arrow('ref', ex, ey, 70, 0, 3.4) + text(ex + 76, ey + 22, '<tspan font-style="italic">v</tspan>', ' font-size="19"');
    body += fade(arrow('error', ex, ey, 0, -58, 3.6) + text(ex - 16, ey - 50, '<tspan font-style="italic">F</tspan>', ' text-anchor="end" font-size="19"'), clamp01(show));
    // Otros dos puntos con v y F (sale con show ≥ 2)
    var pts2 = '';
    [30, 150].forEach(function (a) {
      var x = cx + R * Math.cos(a * RAD), y = cy - R * Math.sin(a * RAD), tx = -Math.sin(a * RAD), ty = -Math.cos(a * RAD);
      pts2 += arrow('ref', x, y, 50 * tx, 50 * ty, 3) + arrow('error', x, y, (cx - x) * 0.5, (cy - y) * 0.5, 3.2) + f3aCharge(x, y, true, 10);
    });
    body += fade(pts2, clamp01(show - 1));
    var rx = cx + R * Math.cos(215 * RAD), ry = cy - R * Math.sin(215 * RAD);
    body += fade(seg('axis', cx, cy, rx, ry, 1.6, '4 5') + dot('axis', cx, cy, 3.5) + text((cx + rx) / 2 - 4, (cy + ry) / 2 - 8, '<tspan font-style="italic">r</tspan>', ' text-anchor="end" font-size="19"'), clamp01(show - 2));
    body += f3aCharge(ex, ey, true, 11);
    body += fade(text(620, 120, 'r = mv/|q|B', ' text-anchor="end" font-size="19"') + text(620, 150, 'T = 2πm/|q|B', ' text-anchor="end" font-size="19"'), clamp01(show - 2));
    body += text(620, 270, 'B entra a la hoja', ' text-anchor="end" font-size="15"');
    return svgBox('0 0 640 285', 'Una carga positiva entra moviéndose a la derecha en un campo que entra a la hoja. La fuerza magnética apunta hacia arriba, perpendicular a la velocidad, y hace que la carga describa un círculo de radio r en sentido antihorario.', body);
  };

  /* ---------- S03 · Hélice: v∥ a lo largo de B y v⊥ que gira ---------- */
  D['f3s03-helix'] = function () {
    // Proyección oblicua: el eje de la hélice (B) va a la derecha; el círculo ⊥ B se ve como elipse.
    var body = '', x0 = 80, cy = 150, Rr = 66, pitch = 115, turns = 3.6;
    function H(t) { return [x0 + pitch * t / (2 * Math.PI) + 0.75 * Rr * Math.sin(t), cy - Rr * Math.cos(t)]; }
    // La mitad de atrás de cada vuelta (cos t < 0 en la profundidad) va punteada.
    var run = [], back = null;
    for (var i = 0; i <= 480; i++) {
      var t = turns * 2 * Math.PI * i / 480, b = Math.cos(t) > 0;
      if (back !== null && b !== back) { body += back ? poly('trace', run, 1.6, false, '5 5') : poly('trace', run, 2.6); run = [run[run.length - 1]]; }
      back = b; run.push(H(t));
    }
    body += back ? poly('trace', run, 1.6, false, '5 5') : poly('trace', run, 2.6);
    body += arrow('aux', 40, 40, 560, 0, 2.6) + text(610, 46, '<tspan font-style="italic">B</tspan>', ' font-size="19"');
    var o = H(Math.PI / 2);
    body += arrow('ref', o[0], o[1], 70, 0, 3.2) + text(o[0] + 76, o[1] + 6, '<tspan font-style="italic">v</tspan><tspan font-size="13">∥</tspan>', ' font-size="18"');
    body += arrow('ref', o[0], o[1], 0, 56, 3.2) + text(o[0] + 8, o[1] + 66, '<tspan font-style="italic">v</tspan><tspan font-size="13">⊥</tspan>', ' font-size="18"');
    body += f3aCharge(o[0], o[1], true, 10);
    var a = H(4 * Math.PI), b = H(6 * Math.PI);
    body += seg('axis', a[0], a[1] - 14, b[0], b[1] - 14, 1.6) + seg('axis', a[0], a[1] - 20, a[0], a[1] - 8, 1.6) + seg('axis', b[0], b[1] - 20, b[0], b[1] - 8, 1.6);
    body += text((a[0] + b[0]) / 2, a[1] - 22, 'paso = v∥·T', ' text-anchor="middle" font-size="16"');
    return svgBox('0 0 640 280', 'Una carga con velocidad oblicua al campo avanza en hélice: la componente de la velocidad paralela a B la lleva a lo largo del campo sin cambiar, y la perpendicular la hace girar en círculos. El avance en cada vuelta es el paso, v paralela por el periodo.', body);
  };

  /* ---------- S03 · Selector de velocidades: E y B cruzados ---------- */
  D['f3s03-selector'] = function () {
    var body = '', x0 = 120, x1 = 470, yt = 60, yb = 220, ym = 140;
    body += f3aGrid(140, 90, 450, 200, 38, false, 0.35);
    body += '<rect class="box-err" x="' + x0 + '" y="' + (yt - 10) + '" width="' + (x1 - x0) + '" height="10"/><rect class="box-aux" x="' + x0 + '" y="' + yb + '" width="' + (x1 - x0) + '" height="10"/>';
    body += text((x0 + x1) / 2, yt - 18, '+ + + + + + + + +', ' text-anchor="middle" font-size="16"') + text((x0 + x1) / 2, yb + 32, '− − − − − − − − −', ' text-anchor="middle" font-size="16"');
    body += seg('trace', 30, ym, 610, ym, 2.4) + seg('trace', 150, ym, 470, ym - 0, 2.4);
    body += '<path class="trace" fill="none" stroke-width="2" stroke-dasharray="6 5" d="M300 140Q420 136 470 96"/><path class="trace" fill="none" stroke-width="2" stroke-dasharray="6 5" d="M300 140Q420 144 470 184"/>';
    body += text(478, 92, 'más rápida', ' font-size="14"') + text(478, 196, 'más lenta', ' font-size="14"');
    body += arrow('ref', 200, ym, 60, 0, 3.2) + text(266, ym + 24, '<tspan font-style="italic">v</tspan>', ' font-size="18"');
    body += arrow('error', 220, ym, 0, -48, 3.4) + text(228, ym - 44, '<tspan font-style="italic">qvB</tspan>', ' font-size="16"');
    body += arrow('aux', 240, ym, 0, 48, 3.4) + text(248, ym + 52, '<tspan font-style="italic">qE</tspan>', ' font-size="16"');
    body += f3aCharge(200, ym, true, 10);
    body += '<rect class="axis" fill="none" stroke-width="2" x="600" y="' + (ym - 30) + '" width="8" height="22"/><rect class="axis" fill="none" stroke-width="2" x="600" y="' + (ym + 8) + '" width="8" height="22"/>';
    body += text(604, ym + 58, 'rendija', ' text-anchor="middle" font-size="14"') + text(40, 30, 'v = E/B pasa recta', ' font-size="17"');
    return svgBox('0 0 640 270', 'Selector de velocidades: entre dos placas cargadas hay un campo eléctrico hacia abajo y un campo magnético que entra a la hoja. Sobre una carga positiva, la fuerza eléctrica empuja hacia abajo y la magnética hacia arriba. Solo la que tiene v = E/B pasa recta por la rendija; las más rápidas se desvían hacia arriba y las más lentas hacia abajo.', body);
  };

  /* ---------- S03 · Espectrómetro: acelerar, entrar a B y caer a 2r ---------- */
  D['f3s03-spectro'] = function () {
    var body = '', sx = 120, sy = 70;
    body += '<rect class="box-err" x="90" y="10" width="60" height="8"/><rect class="box-aux" x="90" y="48" width="60" height="8"/>' + text(160, 20, '+', ' font-size="16"') + text(160, 58, '−', ' font-size="16"') + text(84, 38, 'V', ' text-anchor="end" font-size="18"');
    body += arrow('ref', sx, 18, 0, 46, 3) + seg('axis', 30, sy, 610, sy, 2.2);
    body += f3aGrid(60, 95, 600, 260, 40, false, 0.35);
    [[80, 'trace', 'm₁'], [110, 'error', 'm₂']].forEach(function (c) {
      var r = c[0], pts = [];
      for (var i = 0; i <= 60; i++) { var a = Math.PI * i / 60; pts.push([sx + r - r * Math.cos(a), sy + r * Math.sin(a)]); }
      body += poly(c[1], pts, 2.8) + dot(c[1], sx + 2 * r, sy - 2, 5) + text(sx + 2 * r, sy - 12, c[2], ' text-anchor="middle" font-size="16"');
    });
    body += seg('axis', sx, sy + 126, sx + 220, sy + 126, 1.4) + seg('axis', sx, sy + 120, sx, sy + 132, 1.4) + seg('axis', sx + 220, sy + 120, sx + 220, sy + 132, 1.4) + text(sx + 110, sy + 148, '2r₂', ' text-anchor="middle" font-size="15"');
    body += text(620, 265, 'B entra a la hoja', ' text-anchor="end" font-size="15"');
    return svgBox('0 0 640 280', 'Espectrómetro de masas: los iones se aceleran por un voltaje V, entran por una rendija a un campo magnético que entra a la hoja y describen medio círculo. El ion más pesado tiene radio mayor y cae más lejos de la rendija, a una distancia de dos radios.', body);
  };

  /* ---------- S03 · Ciclotrón: dos des, hueco y espiral ---------- */
  D['f3s03-cyclotron'] = function () {
    var body = '', cx = 300, cy = 140, R = 120, g = 9;
    body += '<path class="axis" fill="none" stroke-width="2.2" d="M' + (cx - g) + ' ' + (cy - R) + 'A' + R + ' ' + R + ' 0 0 0 ' + (cx - g) + ' ' + (cy + R) + 'Z"/>';
    body += '<path class="axis" fill="none" stroke-width="2.2" d="M' + (cx + g) + ' ' + (cy - R) + 'A' + R + ' ' + R + ' 0 0 1 ' + (cx + g) + ' ' + (cy + R) + 'Z"/>';
    var pts = [], y = cy;
    for (var i = 1; i <= 16; i++) {
      var rn = 24 * Math.sqrt(i), side = i % 2 ? 1 : -1, yc = y + side * rn;
      if (rn + Math.abs(yc - cy) > R - 8) break;
      for (var k = 0; k <= 24; k++) { var a = Math.PI * k / 24; pts.push([cx + side * g + side * rn * Math.sin(a), yc - side * rn * Math.cos(a)]); }
      y = yc + side * rn;
    }
    body += poly('trace', pts, 2.2);
    body += text(cx - R / 2, cy - R - 8, 'D', ' text-anchor="middle" font-size="18"') + text(cx + R / 2, cy - R - 8, 'D', ' text-anchor="middle" font-size="18"');
    body += arrow('aux', cx - 8, cy + R + 12, 16, 0, 2.4) + text(cx, cy + R + 34, 'E alterno en el hueco', ' text-anchor="middle" font-size="15"');
    body += text(450, 100, 'f = |q|B/2πm', ' font-size="17"') + text(450, 130, 'K máx = q²B²R²/2m', ' font-size="17"');
    return svgBox('0 0 640 300', 'Ciclotrón: dos cajas metálicas en forma de D, separadas por un hueco con un campo eléctrico alterno, dentro de un campo magnético uniforme. La partícula gira media vuelta en cada D y gana energía en cada cruce del hueco, así que describe una espiral de radio creciente hasta salir por el borde.', body);
  };


  /* ══════════════════════ fin S03 ══════════════════════ */

  /* ══════════════════════ S04 ══════════════════════ */
  // Símbolo de un vector perpendicular a la hoja: punto (sale) o cruz (entra).
  function f3aPerp(cls, x, y, out, r) {
    r = r || 12;
    var o = '<circle class="' + cls + '" fill="none" stroke-width="2.4" cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r + '"/>';
    return o + (out ? dot(cls, x, y, 3.4) : seg(cls, x - r * 0.62, y - r * 0.62, x + r * 0.62, y + r * 0.62, 2.4) + seg(cls, x - r * 0.62, y + r * 0.62, x + r * 0.62, y - r * 0.62, 2.4));
  }

  /* ---------- S04 · De las cargas al alambre (show: 0 alambre, 1 portadores, 2 fuerzas, 3 total) ---------- */
  D['f3s04-carriers'] = function (s) {
    var show = num(s, 'show', 3), body = '', y = 150, x0 = 90, x1 = 530;
    body += f3aGrid(70, 40, 570, 260, 44, false, 0.35);
    body += '<rect class="box-aux" x="' + x0 + '" y="' + (y - 16) + '" width="' + (x1 - x0) + '" height="32" rx="6" opacity="0.5"/>';
    body += arrow('ref', x1 + 4, y, 50, 0, 3.2) + text(x1 + 62, y + 6, '<tspan font-style="italic">I</tspan>', ' font-size="19"');
    var car = '', frc = '';
    for (var k = 0; k < 6; k++) {
      var cx = x0 + 40 + k * 72;
      car += f3aCharge(cx, y, true, 9) + arrow('ref', cx + 10, y, 26, 0, 2.2);
      frc += arrow('error', cx, y - 12, 0, -34, 2.6);
    }
    body += fade(car + text(x0 + 4, y + 44, 'portadores con velocidad de deriva v', ' font-size="15"'), clamp01(show));
    body += fade(frc + text(x0 + 4, y - 60, 'cada uno siente q v × B', ' font-size="15"'), clamp01(show - 1) * (1 - clamp01(show - 2) * 0.6));
    body += fade(arrow('error', (x0 + x1) / 2, y - 20, 0, -100, 4.4) + text((x0 + x1) / 2 + 14, y - 104, 'F = I L B', ' font-size="19"'), clamp01(show - 2));
    body += seg('axis', x0, y + 70, x1, y + 70, 1.4) + seg('axis', x0, y + 64, x0, y + 76, 1.4) + seg('axis', x1, y + 64, x1, y + 76, 1.4) + text((x0 + x1) / 2, y + 92, '<tspan font-style="italic">L</tspan>', ' text-anchor="middle" font-size="18"');
    body += text(620, 22, 'B entra a la hoja', ' text-anchor="end" font-size="15"');
    return svgBox('0 0 640 270', 'Un tramo de alambre de largo L lleva una corriente I hacia la derecha en un campo que entra a la hoja. Las cargas que se mueven dentro del alambre sienten cada una la fuerza q v × B hacia arriba; sumadas dan la fuerza sobre el alambre, I L B, hacia arriba.', body);
  };

  /* ---------- S04 · Alambre oblicuo a B (en la hoja): F sale o entra ---------- */
  D['f3s04-angle'] = function (s) {
    var th = num(s, 'th', 40), body = '', cx = 300, cy = 160, L = 200;
    for (var y = 40; y <= 280; y += 48) body += arrow('aux', 40, y, 540, 0, 1.4);
    body += text(612, 30, '<tspan font-style="italic">B</tspan>', ' text-anchor="end" font-size="19"');
    var dx = L / 2 * Math.cos(th * RAD), dy = L / 2 * Math.sin(th * RAD);
    body += seg('ref', cx - dx, cy + dy, cx + dx, cy - dy, 5);
    body += arrow('ref', cx + dx * 0.55, cy - dy * 0.55, dx * 0.3, -dy * 0.3, 3) + text(cx + dx + 12, cy - dy, '<tspan font-style="italic">I</tspan>', ' font-size="19"');
    body += arc(cx, cy, 52, 0, th, 'trace', 2) + text(cx + 66 * Math.cos(th * RAD / 2), cy - 66 * Math.sin(th * RAD / 2) + 6, 'θ', ' text-anchor="middle" font-size="18"');
    body += f3aPerp('error', cx + 80, cy + 62, false, 14) + text(cx + 102, cy + 68, 'F entra a la hoja', ' font-size="16"');
    body += text(40, 300, 'F = I L B sin θ, perpendicular al alambre y a B', ' font-size="16"');
    return svgBox('0 0 640 315', 'Un alambre recto con corriente forma un ángulo θ con un campo magnético que apunta a la derecha, en el plano de la hoja. La fuerza, de magnitud I L B sin θ, es perpendicular al alambre y al campo: aquí entra a la hoja.', body);
  };

  /* ---------- S04 · Alambre doblado = segmento recto entre los extremos ---------- */
  D['f3s04-bent'] = function () {
    var body = '', cx = 320, cy = 200, R = 120, pts = [];
    body += f3aGrid(60, 40, 590, 280, 44, false, 0.35);
    for (var i = 0; i <= 48; i++) { var a = Math.PI - Math.PI * i / 48; pts.push([cx + R * Math.cos(a), cy - R * Math.sin(a)]); }
    body += poly('ref', pts, 4.5);
    [8, 16, 24, 32, 40].forEach(function (k) {
      var p = pts[k], ux = (p[0] - cx) / R, uy = (p[1] - cy) / R;
      body += arrow('error', p[0], p[1], ux * 34, uy * 34, 2.4);
    });
    var pI = pts[12];
    body += arrow('ref', pI[0] - 8, pI[1] + 8, 12, -12, 3) + text(pI[0] - 26, pI[1] + 2, '<tspan font-style="italic">I</tspan>', ' text-anchor="middle" font-size="18"');
    body += seg('trace', cx - R, cy, cx + R, cy, 2.4, '7 6') + text(cx, cy + 22, 'cuerda 2R', ' text-anchor="middle" font-size="16"');
    body += arrow('error', cx, cy - 12, 0, -62, 4.2) + text(cx + 12, cy - 44, 'F = I(2R)B', ' font-size="17"');
    body += text(620, 22, 'B entra a la hoja', ' text-anchor="end" font-size="15"');
    return svgBox('0 0 640 300', 'Un alambre en forma de semicírculo de radio R con corriente, en un campo que entra a la hoja. Cada trocito siente una fuerza hacia afuera del arco; las componentes horizontales se cancelan y la fuerza neta, hacia arriba, es la misma que sentiría el segmento recto de largo 2R que une los extremos.', body);
  };

  /* ---------- S04 · Varilla que flota: I L B = m g ---------- */
  D['f3s04-rod'] = function () {
    var body = '', y = 170;
    body += f3aGrid(80, 40, 560, 270, 44, false, 0.35);
    body += seg('axis', 110, 60, 110, 260, 3) + seg('axis', 530, 60, 530, 260, 3);
    body += '<rect class="box-err" x="110" y="' + (y - 7) + '" width="420" height="14" rx="4"/>';
    body += arrow('ref', 300, y - 24, 60, 0, 3) + text(368, y - 20, '<tspan font-style="italic">I</tspan>', ' font-size="18"');
    body += arrow('error', 250, y, 0, -70, 3.8) + text(260, y - 74, 'I L B', ' font-size="18"');
    body += arrow('aux', 410, y, 0, 70, 3.8) + text(420, y + 72, 'm g', ' font-size="18"');
    body += text(620, 22, 'B entra a la hoja', ' text-anchor="end" font-size="15"');
    return svgBox('0 0 640 290', 'Una varilla horizontal con corriente hacia la derecha descansa entre dos rieles verticales en un campo que entra a la hoja. La fuerza magnética I L B apunta hacia arriba y, si iguala al peso m g, la varilla flota.', body);
  };

  /* ---------- S04 · Detalle: efecto Hall ---------- */
  D['f3s04-hall'] = function () {
    var body = '', x0 = 120, x1 = 500, yt = 90, yb = 210;
    body += f3aGrid(140, 110, 480, 190, 40, false, 0.35);
    body += '<rect class="axis" fill="none" stroke-width="2.4" x="' + x0 + '" y="' + yt + '" width="' + (x1 - x0) + '" height="' + (yb - yt) + '"/>';
    body += arrow('ref', 40, 150, 70, 0, 3.2) + text(70, 140, '<tspan font-style="italic">I</tspan>', ' text-anchor="middle" font-size="18"');
    for (var k = 0; k < 6; k++) body += text(x0 + 30 + k * 62, yt + 22, '−', ' text-anchor="middle" font-size="20"') + text(x0 + 30 + k * 62, yb - 8, '+', ' text-anchor="middle" font-size="20"');
    body += f3aCharge(310, 150, false, 10) + arrow('ref', 320, 150, -50, 0, 2.6) + text(276, 172, 'v', ' text-anchor="middle" font-size="16"');
    body += arrow('error', 310, 138, 0, -26, 2.8);
    body += seg('axis', 560, yt, 560, yb, 1.6) + text(572, 156, 'V<tspan font-size="13">H</tspan>', ' font-size="18"');
    body += text(40, 260, 'Los electrones se desvían hacia arriba: arriba queda −, abajo +', ' font-size="15"');
    return svgBox('0 0 640 275', 'Efecto Hall: una placa conductora lleva corriente hacia la derecha en un campo que entra a la hoja. Los electrones, que se mueven hacia la izquierda, se desvían hacia el borde de arriba; ese borde queda negativo, el de abajo positivo, y aparece un voltaje de Hall entre ellos.', body);
  };


  /* ══════════════════════ fin S04 ══════════════════════ */

  /* ══════════════════════ S05 ══════════════════════ */
  /* ---------- S05 · Espira en 3D con las fuerzas en sus lados (show: 0 espira, 1 lados b, 2 lados a, 3 par) ---------- */
  D['f3s05-loop3d'] = function (s) {
    var show = num(s, 'show', 3), th = num(s, 'th', 60), body = '';
    var P = view3({ cx: 280, cy: 200, s: 50, az: 70, el: 20 });
    // B en +x; eje de giro y; normal n̂ = (cos θ, 0, sin θ); u = (−sin θ, 0, cos θ).
    var t = th * RAD, n = [Math.cos(t), 0, Math.sin(t)], u = [-Math.sin(t), 0, Math.cos(t)], a = 3.2, b = 2.4;
    function C(su, sy) { return [su * b / 2 * u[0], sy * a / 2, su * b / 2 * u[2]]; }
    var cs = [C(-1, -1), C(-1, 1), C(1, 1), C(1, -1)];
    for (var k = -2; k <= 2; k++) body += f3aArrow3(P, 'aux', [-3.2, k * 1.1, -1.9], [3.6, k * 1.1, -1.9], 1.4);
    body += f3aLabel3(P, [4.1, 2.2, -1.9], '<tspan font-style="italic">B</tspan>', 18);
    body += poly('ref', cs.concat([cs[0]]).map(P), 3.6);
    body += f3aArrow3(P, 'axis', [0, -2.6, 0], [0, 2.8, 0], 1.4) + f3aLabel3(P, [0, 3.1, 0.3], 'eje', 15);
    body += fade(f3aArrow3(P, 'ref', [0, 0, 0], [n[0] * 1.8, 0, n[2] * 1.8], 2.6) + f3aLabel3(P, [n[0] * 2.15, 0, n[2] * 2.15 + 0.2], 'n̂', 18), clamp01(show + 1));
    // Lados b (de C(−1, s) a C(1, s)): fuerzas a lo largo del eje y, opuestas y sobre la misma línea.
    var fb = 1.0 * Math.cos(t) + 0.0;
    var mTop = [0, a / 2, 0], mBot = [0, -a / 2, 0];
    body += fade(f3aArrow3(P, 'error', mTop, [0, a / 2 + 1.1 * Math.abs(fb) + 0.2, 0], 2.4) + f3aArrow3(P, 'error', mBot, [0, -a / 2 - 1.1 * Math.abs(fb) - 0.2, 0], 2.4), clamp01(show) * (Math.abs(fb) > 0.08 ? 1 : 0));
    // Lados a (en ±u b/2, a lo largo de y): fuerzas ±z que forman un par.
    var pA = [u[0] * b / 2, 0, u[2] * b / 2], pB = [-u[0] * b / 2, 0, -u[2] * b / 2];
    body += fade(f3aArrow3(P, 'error', pA, [pA[0], 0, pA[2] + 1.6], 3.4) + f3aArrow3(P, 'error', pB, [pB[0], 0, pB[2] - 1.6], 3.4) +
      f3aLabel3(P, [pA[0] + 0.3, 0, pA[2] + 1.9], '<tspan font-style="italic">F</tspan>', 18) + f3aLabel3(P, [pB[0] + 0.3, 0, pB[2] - 2.0], '<tspan font-style="italic">F</tspan>', 18), clamp01(show - 1));
    body += fade(text(620, 40, 'τ = N I A B sin θ', ' text-anchor="end" font-size="19"') + text(620, 68, 'F neta = 0', ' text-anchor="end" font-size="16"'), clamp01(show - 2));
    return svgBox('0 0 640 360', 'Una espira rectangular en un campo uniforme que apunta a la derecha, con su normal a un ángulo θ del campo. Las fuerzas sobre los dos lados cortos van a lo largo del eje de giro y se cancelan. Las fuerzas sobre los dos lados largos son iguales y opuestas pero no están sobre la misma línea: forman un par que hace girar la espira.', body);
  };

  /* ---------- S05 · Vista desde arriba: el par y su brazo (b/2) sin θ ---------- */
  D['f3s05-top'] = function (s) {
    var th = num(s, 'th', 60), body = '', cx = 300, cy = 150, R = 110, t = th * RAD;
    for (var y = 30; y <= 270; y += 48) body += arrow('aux', 40, y, 540, 0, 1.4);
    body += text(600, 36, '<tspan font-style="italic">B</tspan>', ' font-size="19"');
    var u = [-Math.sin(t), Math.cos(t)], P2 = [cx + u[0] * R, cy - u[1] * R], P1 = [cx - u[0] * R, cy + u[1] * R];
    body += seg('ref', P1[0], P1[1], P2[0], P2[1], 4.4);
    body += arrow('ref', cx, cy, Math.cos(t) * 80, -Math.sin(t) * 80, 2.6) + text(cx + Math.cos(t) * 98, cy - Math.sin(t) * 98 + 6, 'n̂', ' text-anchor="middle" font-size="19"');
    body += arc(cx, cy, 40, 0, th, 'trace', 2) + text(cx + 56 * Math.cos(t / 2), cy - 56 * Math.sin(t / 2) + 6, 'θ', ' text-anchor="middle" font-size="18"');
    body += f3aPerp('ref', P2[0], P2[1], true, 11) + f3aPerp('ref', P1[0], P1[1], false, 11);
    body += arrow('error', P2[0], P2[1], 0, -70, 3.4) + arrow('error', P1[0], P1[1], 0, 70, 3.4);
    body += text(P2[0] - 14, P2[1] - 60, 'F', ' text-anchor="end" font-size="18"') + text(P1[0] + 14, P1[1] + 66, 'F', ' font-size="18"');
    // Brazo: distancia horizontal del eje a la línea de acción, (b/2) sin θ.
    body += seg('trace', cx, cy + 4, P2[0], cy + 4, 2, '5 4') + text((cx + P2[0]) / 2, cy + 26, '(b/2) sin θ', ' text-anchor="middle" font-size="15"');
    body += dot('axis', cx, cy, 3.5) + text(30, 292, 'Vista desde arriba: los lados largos se ven de punta', ' font-size="14"');
    return svgBox('0 0 640 305', 'La espira vista desde arriba, de canto. La normal forma un ángulo θ con el campo. En un lado largo la corriente sale de la hoja y en el otro entra; las fuerzas son verticales, iguales y opuestas, y cada una tiene un brazo (b/2) sin θ respecto al eje.', body);
  };

  /* ---------- S05 · La espira como dipolo: μ con la mano derecha, como un imán ---------- */
  D['f3s05-dipole'] = function () {
    var body = '', cx = 170, cy = 150;
    body += '<ellipse class="ref" fill="none" stroke-width="3.6" cx="' + cx + '" cy="' + cy + '" rx="90" ry="30"/>';
    body += arrow('ref', cx + 10, cy + 30, -24, 0, 3) + text(cx - 26, cy + 56, '<tspan font-style="italic">I</tspan>', ' font-size="18"');
    body += arrow('error', cx, cy, 0, -100, 4) + text(cx + 12, cy - 92, 'μ = N I A', ' font-size="18"');
    body += text(cx, cy + 96, 'dedos con la corriente, pulgar: μ', ' text-anchor="middle" font-size="15"');
    body += '<rect class="box-err" x="445" y="80" width="50" height="70"/><rect class="box-aux" x="445" y="150" width="50" height="70"/>';
    body += text(470, 124, 'N', ' text-anchor="middle" font-size="26"') + text(470, 194, 'S', ' text-anchor="middle" font-size="26"');
    body += text(470, 270, 'se porta como un imán: N arriba', ' text-anchor="middle" font-size="15"');
    return svgBox('0 0 640 290', 'Una espira con corriente tiene un momento dipolar magnético μ perpendicular a su plano, en la dirección del pulgar derecho cuando los dedos siguen la corriente. Se comporta como un imán pequeño cuyo polo norte está del lado hacia donde apunta μ.', body);
  };

  /* ---------- S05 · Energía U(θ) = −μB cos θ: estable en 0°, inestable en 180° ---------- */
  D['f3s05-energy'] = function (s) {
    var th = num(s, 'th', 60), body = '', x0 = 70, y0 = 140, W = 500, A = 90;
    body += arrow('axis', x0, y0, W + 26, 0, 1.6) + arrow('axis', x0, y0 + A + 20, 0, -2 * A - 40, 1.6);
    var pts = [];
    for (var i = 0; i <= 90; i++) { var a = i * 4; pts.push([x0 + W * a / 360, y0 + A * Math.cos(a * RAD)]); }
    body += poly('trace', pts, 3);
    [0, 90, 180, 270, 360].forEach(function (a) { body += text(x0 + W * a / 360, y0 + 24 + (a === 0 ? 0 : 0), a + '°', ' text-anchor="middle" font-size="14"'); });
    body += dot('ref', x0, y0 + A, 6) + text(x0 + 12, y0 + A + 24, 'estable (mínimo)', ' font-size="14"');
    body += dot('error', x0 + W / 2, y0 - A, 6) + text(x0 + W / 2, y0 - A - 12, 'inestable (máximo)', ' text-anchor="middle" font-size="14"');
    var px = x0 + W * th / 360, py = y0 + A * Math.cos(th * RAD);
    body += dot('student', px, py, 5);
    body += text(x0 + W + 34, y0 + 6, 'θ', ' font-size="18"') + text(x0 - 10, y0 - A - 26, 'U = −μB cos θ', ' font-size="16"');
    return svgBox('0 0 640 260', 'Gráfica de la energía potencial de una espira en un campo: U = −μB cos θ. Es mínima con μ alineado con B (θ = 0°, equilibrio estable) y máxima con μ opuesto a B (θ = 180°, equilibrio inestable).', body);
  };

  /* ---------- S05 · Motor de cd: espira, imán y conmutador ---------- */
  D['f3s05-motor'] = function () {
    var body = '', cx = 300, cy = 120;
    body += '<rect class="box-err" x="60" y="60" width="70" height="120" rx="6"/>' + text(95, 128, 'N', ' text-anchor="middle" font-size="26"');
    body += '<rect class="box-aux" x="470" y="60" width="70" height="120" rx="6"/>' + text(505, 128, 'S', ' text-anchor="middle" font-size="26"');
    for (var k = 0; k < 3; k++) body += arrow('aux', 140, 80 + k * 40, 320, 0, 1.3);
    body += '<path class="ref" fill="none" stroke-width="3.6" d="M220 80L380 160M220 80L240 70M380 160L360 170M240 70L360 170" opacity="0.0"/>';
    body += '<path class="ref" fill="none" stroke-width="3.6" stroke-linejoin="round" d="M230 70L370 70L370 170L330 170M270 170L230 170Z"/>';
    // Conmutador: anillo partido y escobillas
    var ry = 230;
    body += seg('ref', 330, 170, 312, ry - 14, 2.4) + seg('ref', 270, 170, 288, ry - 14, 2.4);
    body += arc(cx, ry, 22, 100, 260, 'ref', 4) + arc(cx, ry, 22, -80, 80, 'ref', 4);
    body += '<rect class="box-base" x="246" y="' + (ry - 8) + '" width="20" height="16"/><rect class="box-base" x="334" y="' + (ry - 8) + '" width="20" height="16"/>';
    body += seg('axis', 246, ry, 200, ry, 2) + seg('axis', 354, ry, 400, ry, 2) + text(170, ry + 6, '+', ' text-anchor="middle" font-size="22"') + text(430, ry + 6, '−', ' text-anchor="middle" font-size="22"');
    body += text(cx, ry + 46, 'conmutador: invierte la corriente cada media vuelta', ' text-anchor="middle" font-size="15"');
    return svgBox('0 0 640 290', 'Motor de corriente directa: una espira entre los polos de un imán. Sus extremos van a un anillo partido, el conmutador, que toca dos escobillas conectadas a la batería. Cada media vuelta el conmutador invierte la corriente en la espira, y así el torque siempre la hace girar en el mismo sentido.', body);
  };


  /* ══════════════════════ fin S05 ══════════════════════ */

  /* ══════════════════════ S06 ══════════════════════ */
  // ⊙ (sale de la página) u ⊗ (entra), de radio r, con la clase de rol cls (ref, aux, error, trace).
  function f3bOut(x, y, r, out, cls) {
    var o = '<circle class="' + cls + '" fill="none" stroke-width="2.4" cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r + '"/>';
    if (out) return o + dot('dot-' + cls, x, y, Math.max(2.5, r * 0.24));
    var k = r * 0.6;
    return o + seg(cls, x - k, y - k, x + k, y + k, 2.4) + seg(cls, x - k, y + k, x + k, y - k, 2.4);
  }
  // Punta de flecha (chevrón) en (x, y) apuntando en la dirección (ux, uy) de pantalla.
  function f3bChev(cls, x, y, ux, uy, w) {
    var L = Math.hypot(ux, uy) || 1; ux /= L; uy /= L;
    return poly(cls, [[x - 11 * ux - 7 * uy, y - 11 * uy + 7 * ux], [x, y], [x - 11 * ux + 7 * uy, y - 11 * uy - 7 * ux]], w || 3);
  }
  // Elipse (círculo en perspectiva) con una flecha de sentido en el punto más cercano (abajo).
  function f3bRing(cx, cy, rx, ry, cls, w, dir) {
    var o = '<ellipse class="' + cls + '" fill="none" stroke-width="' + (w || 2) + '" cx="' + r1(cx) + '" cy="' + r1(cy) + '" rx="' + r1(rx) + '" ry="' + r1(ry) + '"/>';
    if (dir) { var x = cx, y = cy + ry; o += poly(cls, [[x - 9 * dir, y - 6], [x + 3 * dir, y], [x - 9 * dir, y + 6]], w || 2); }
    return o;
  }

  /* ---------- S06 · Oersted: una corriente rodeada de círculos de B ---------- */
  D['f3s06-oersted'] = function () {
    var b = '', cx = 190, cy = 175;
    b += f3bRing(cx, cy, 130, 34, 'axis', 1.2);
    // Antihorario visto desde arriba: en el punto derecho de cada anillo, B va hacia el fondo (arriba en pantalla).
    [50, 85, 120].forEach(function (r, i) { b += f3bRing(cx, cy, r, r * 0.32, 'aux', 2.2 - i * 0.3) + f3bChev('aux', cx + r, cy - 4, 0, -1, 2.2); });
    b += seg('ref', cx, 285, cx, cy + 6, 4) + arrow('ref', cx, cy - 6, 0, -150, 4);
    b += text(cx + 14, 40, 'I', ' font-size="20"') + text(cx + 128, cy + 52, 'B', ' font-size="20"');
    b += text(cx, 312, 'el pulgar con I; los dedos, con B', ' text-anchor="middle" font-size="16"');
    // Vista desde arriba: I sale de la página, B antihorario.
    var X0 = 500, Y0 = 160;
    [34, 66, 98].forEach(function (r) {
      b += '<circle class="aux" fill="none" stroke-width="2" cx="' + X0 + '" cy="' + Y0 + '" r="' + r + '"/>';
      // Sentido antihorario: arriba del círculo, la flecha apunta a la izquierda.
      b += f3bChev('aux', X0 - 2, Y0 - r, -1, 0, 2.2);
    });
    b += f3bOut(X0, Y0, 13, true, 'ref') + text(X0 + 20, Y0 + 30, 'I', ' font-size="18"');
    b += text(X0, 290, 'visto desde arriba:', ' text-anchor="middle" font-size="16"') + text(X0, 312, 'I sale (⊙), B gira antihorario', ' text-anchor="middle" font-size="16"');
    return svgBox('0 0 640 325', 'Un alambre vertical con corriente hacia arriba, rodeado de circunferencias de campo magnético que giran en el sentido de los dedos de la mano derecha cuando el pulgar apunta con la corriente. A la derecha, la vista desde arriba: la corriente sale de la página y el campo gira en sentido antihorario.', b);
  };

  /* ---------- S06 · Tramo recto: de dB a B (explainer, k = 1…5) ---------- */
  D['f3s06-segment'] = function (s) {
    var k = Math.round(num(s, 'k', 1)), b = '', y0 = 255, O = 300, P = [300, 95], a = y0 - P[1];
    var xL = 150, xR = 520, xe = 450;
    if (k >= 5) b += seg('ref', 20, y0, xL, y0, 5, '10 8') + seg('ref', xR, y0, 620, y0, 5, '10 8');
    b += seg('ref', xL, y0, xR, y0, 6) + arrow('ref', 205, y0 + 26, 50, 0, 2.6) + text(230, y0 + 52, 'I', ' text-anchor="middle" font-size="18"');
    b += seg('axis', O, y0, P[0], P[1], 1.4, '4 6') + text(O - 10, (y0 + P[1]) / 2 + 6, 'a', ' text-anchor="end" font-size="18"');
    b += dot('dot-trace', P[0], P[1], 5) + text(P[0] - 14, P[1] - 12, 'P', ' text-anchor="end" font-size="18"');
    if (k <= 3) {
      b += arrow('aux', xe - 20, y0 - 1, 40, 0, 3.2) + text(xe, y0 + 30, 'dl', ' text-anchor="middle" font-size="18"');
      b += arrow('aux', xe, y0, P[0] - xe, P[1] - y0, 2) + text((xe + P[0]) / 2 + 16, (y0 + P[1]) / 2, 'r', ' font-size="18"');
    }
    if (k === 1) b += f3bOut(P[0] + 52, P[1], 13, true, 'error') + text(P[0] + 72, P[1] + 6, 'dB sale', ' font-size="17"');
    if (k === 2) {
      b += arc(xe, y0, 30, 0, 180 - Math.atan2(y0 - P[1], xe - P[0]) * 180 / Math.PI, 'aux', 1.6) + text(xe + 10, y0 - 36, 'φ', ' font-size="18"');
      b += arrow('aux', 190, y0, P[0] - 190, P[1] - y0, 1.6) + f3bOut(P[0] + 52, P[1], 13, true, 'error');
      b += text(330, 30, 'dB = (μ₀/4π) I dl sen φ / r²', ' text-anchor="middle" font-size="18"');
      b += text(P[0] + 72, P[1] + 6, 'todos salen', ' font-size="17"');
    }
    if (k === 3) {
      var th = Math.atan2(xe - P[0], a) * 180 / Math.PI;
      b += arc(P[0], P[1], 46, -90 + th, -90, 'aux', 1.6) + text(P[0] + 26, P[1] + 70, 'θ', ' font-size="18"');
      b += text(330, 30, 'x = a tan θ,   r = a / cos θ', ' text-anchor="middle" font-size="18"');
      b += text(xe, y0 + 52, 'x', ' text-anchor="middle" font-size="18"');
    }
    if (k === 4) {
      b += seg('aux', P[0], P[1], xL, y0, 1.6, '5 5') + seg('aux', P[0], P[1], xR, y0, 1.6, '5 5');
      var t1 = Math.atan2(xL - P[0], a) * 180 / Math.PI, t2 = Math.atan2(xR - P[0], a) * 180 / Math.PI;
      b += arc(P[0], P[1], 54, -90 + t2, -90, 'aux', 1.6) + arc(P[0], P[1], 64, -90, -90 + t1, 'aux', 1.6);
      b += text(P[0] + 40, P[1] + 80, 'θ₂', ' font-size="17"') + text(P[0] - 54, P[1] + 84, 'θ₁', ' text-anchor="end" font-size="17"');
      b += text(330, 30, 'B = (μ₀I/4πa)(sen θ₂ − sen θ₁)', ' text-anchor="middle" font-size="18"');
      b += f3bOut(P[0] + 52, P[1], 13, true, 'error');
    }
    if (k >= 5) {
      b += text(330, 30, 'θ₁ → −90°, θ₂ → +90°:   B = μ₀I/2πa', ' text-anchor="middle" font-size="18"');
      b += f3bOut(P[0] + 52, P[1], 13, true, 'error') + text(P[0] + 72, P[1] + 6, 'B', ' font-size="18"');
    }
    return svgBox('0 0 640 320', 'Un tramo recto de alambre con corriente hacia la derecha y un punto P a una distancia a. Se marca un elemento dl, el vector r hacia P y los ángulos que miden la posición de los extremos; el campo en P sale de la página.', b);
  };

  /* ---------- S06 · Arco: campo en su centro (explainer, k = 1…4; ph en grados) ---------- */
  D['f3s06-arc'] = function (s) {
    var k = Math.round(num(s, 'k', 1)), ph = Math.max(20, Math.min(360, num(s, 'ph', 120))), b = '', C = [320, 200], R = 135;
    var a0 = 90 - ph / 2, a1 = 90 + ph / 2, pts = [];
    for (var i = 0; i <= 72; i++) { var t = (a0 + (a1 - a0) * i / 72) * RAD; pts.push([C[0] + R * Math.cos(t), C[1] - R * Math.sin(t)]); }
    b += poly('ref', pts, 5);
    // Sentido de la corriente: antihorario (visto de frente), flecha en la mitad del arco.
    var am = 90 * RAD;
    b += f3bChev('ref', C[0] - 4, C[1] - R, -1, 0) + text(C[0], C[1] - R - 18, 'I', ' text-anchor="middle" font-size="18"');
    b += dot('dot-trace', C[0], C[1], 5) + text(C[0] + 12, C[1] + 26, 'P', ' font-size="18"');
    var ea = (a0 + 0.22 * ph) * RAD, E = [C[0] + R * Math.cos(ea), C[1] - R * Math.sin(ea)];
    if (k <= 2) {
      b += arrow('aux', E[0] + 18 * Math.sin(ea), E[1] + 18 * Math.cos(ea), -36 * Math.sin(ea), -36 * Math.cos(ea), 3.2);
      b += text(E[0] + 26 * Math.cos(ea) + 6, E[1] - 26 * Math.sin(ea), 'dl', ' font-size="18"');
      b += arrow('aux', E[0], E[1], C[0] - E[0], C[1] - E[1], 1.8) + text((E[0] + C[0]) / 2 + 10, (E[1] + C[1]) / 2 + 18, 'r = R', ' font-size="17"');
    }
    if (k === 2) b += text(320, 365, 'dl ⟂ r: sen φ = 1,   dB = μ₀I dl / 4πR²', ' text-anchor="middle" font-size="18"');
    if (k === 3) b += text(320, 365, 'dl = R dθ:   B = (μ₀I/4πR) ∫ dθ = μ₀Iφ/4πR', ' text-anchor="middle" font-size="18"');
    if (k >= 4) b += text(320, 365, 'φ = 2π:   B = μ₀I/2R', ' text-anchor="middle" font-size="18"');
    b += f3bOut(C[0] - 46, C[1], 13, true, 'error') + text(C[0] - 66, C[1] + 6, k <= 2 ? 'dB' : 'B', ' text-anchor="end" font-size="18"');
    if (k >= 3 && ph < 359) b += arc(C[0], C[1], 34, a0, a1, 'aux', 1.6) + text(C[0], C[1] - 44, 'φ', ' text-anchor="middle" font-size="18"');
    return svgBox('0 0 640 380', 'Un arco de circunferencia de radio R con corriente en sentido antihorario y su centro P. Cada elemento dl es perpendicular al radio, así que todos los dB en el centro tienen la misma magnitud y salen de la página.', b);
  };

  /* ---------- S06 · Espira: punto en su eje (explainer, k = 1…5) ---------- */
  D['f3s06-loop'] = function (s) {
    var k = Math.round(num(s, 'k', 1)), b = '', O = [320, 262], rx = 150, ry = 42, P = [320, 92];
    b += seg('axis', O[0], 300, O[0], 26, 1.4, '4 6') + text(O[0] + 10, 34, 'z', ' font-size="18"');
    b += f3bRing(O[0], O[1], rx, ry, 'ref', 4, 1) + text(O[0] + rx + 10, O[1] + 30, 'I', ' font-size="18"');
    b += dot('dot-trace', P[0], P[1], 5) + text(P[0] - 14, P[1] - 4, 'P', ' text-anchor="end" font-size="18"');
    b += seg('axis', O[0], O[1], O[0] + rx, O[1], 1.2, '3 5') + text(O[0] + rx / 2, O[1] - 8, 'R', ' text-anchor="middle" font-size="17"');
    b += text(O[0] - 12, (O[1] + P[1]) / 2 + 30, 'z', ' text-anchor="end" font-size="17"');
    var E = [O[0] + rx, O[1]], F = [O[0] - rx, O[1]], r = [P[0] - E[0], P[1] - E[1]], L = Math.hypot(r[0], r[1]), u = [r[0] / L, r[1] / L];
    // dB ∝ R ẑ + z x̂ (perpendicular a r, en el plano de la figura): hacia arriba y hacia afuera.
    var A = 92, zs = O[1] - P[1], dB = [A * zs / Math.hypot(zs, rx), -A * rx / Math.hypot(zs, rx)];
    void u;
    if (k <= 3) {
      b += arrow('aux', E[0], E[1] + 2, 12, -26, 3) + text(E[0] + 18, E[1] - 18, 'dl', ' font-size="17"');
      b += arrow('aux', E[0], E[1], r[0], r[1], 1.8) + text((E[0] + P[0]) / 2 + 18, (E[1] + P[1]) / 2 + 4, 'r', ' font-size="18"');
    }
    if (k >= 2 && k <= 3) {
      b += arrow('error', P[0], P[1], dB[0], dB[1], 3) + text(P[0] + dB[0] + 8, P[1] + dB[1] + 4, 'dB', ' font-size="17"');
      b += seg('aux', P[0], P[1], P[0] + dB[0], P[1], 1.6, '5 4') + seg('aux', P[0], P[1], P[0], P[1] + dB[1], 1.6, '5 4');
    }
    if (k === 2) b += text(20, 360, 'dB ⟂ r y ⟂ dl: tiene parte a lo largo del eje y parte hacia afuera', ' font-size="17"');
    if (k === 3) {
      b += arrow('aux', F[0], F[1] + 2, -12, 26, 3) + arrow('aux', F[0], F[1], P[0] - F[0], P[1] - F[1], 1.4);
      b += arrow('error', P[0], P[1], -dB[0], dB[1], 3);
      b += text(20, 360, 'el trozo opuesto cancela la parte hacia afuera; las de z se suman', ' font-size="17"');
    }
    if (k >= 4) b += arrow('error', P[0], P[1], 0, -70, 3.6) + text(P[0] + 10, P[1] - 52, 'B', ' font-size="18"');
    if (k === 4) b += text(20, 360, 'B = μ₀IR² / 2(z² + R²)³ᐟ²', ' font-size="18"');
    if (k >= 5) b += text(20, 360, 'centro: μ₀I/2R     lejos: μ₀IR²/2z³', ' font-size="18"');
    return svgBox('0 0 640 380', 'Una espira circular de radio R con corriente y un punto P sobre su eje, a una altura z. El campo de cada elemento es perpendicular a la línea que lo une con P; al sumar los de lados opuestos, las partes hacia afuera se cancelan y queda un campo a lo largo del eje.', b);
  };

  /* ---------- S06 · Cuarto de círculo con dos tramos radiales ---------- */
  D['f3s06-radial'] = function () {
    var b = '', C = [230, 255], R = 170, pts = [];
    for (var i = 0; i <= 40; i++) { var t = (90 - 90 * i / 40) * RAD; pts.push([C[0] + R * Math.cos(t), C[1] - R * Math.sin(t)]); }
    b += seg('ref', C[0], C[1], C[0], C[1] - R, 5) + poly('ref', pts, 5) + seg('ref', C[0] + R, C[1], C[0], C[1], 5);
    var m = [C[0] + R * Math.cos(45 * RAD), C[1] - R * Math.sin(45 * RAD)];
    b += f3bChev('ref', C[0], C[1] - 86, 0, -1) + f3bChev('ref', m[0] + 4, m[1] + 4, 1, 1) + f3bChev('ref', C[0] + 80, C[1], -1, 0);
    b += text(m[0] + 18, m[1] - 10, 'I', ' font-size="18"') + text(C[0] + R / 2, C[1] + 26, 'R', ' text-anchor="middle" font-size="17"');
    b += f3bOut(C[0], C[1], 13, false, 'error') + text(C[0] - 20, C[1] + 6, 'C', ' text-anchor="end" font-size="18"');
    b += text(440, 120, 'tramos radiales:', ' font-size="17"') + text(440, 144, 'dl ∥ r, no aportan', ' font-size="17"');
    b += text(440, 190, 'cuarto de círculo:', ' font-size="17"') + text(440, 214, 'B = μ₀I(π/2) / 4πR', ' font-size="17"');
    return svgBox('0 0 640 290', 'Un circuito formado por dos tramos rectos que van al centro C y un cuarto de circunferencia de radio R. Los tramos rectos apuntan hacia C, así que no producen campo ahí; solo aporta el arco, y su campo en C entra a la página.', b);
  };

  /* ══════════════════════ fin S06 ══════════════════════ */

  /* ══════════════════════ S07 ══════════════════════ */
  // Línea de campo de alambres perpendiculares a la página (coordenadas de pantalla, ws = [{ x, y, I }],
  // I > 0 sale). Se sigue la dirección de B hasta cerrar la vuelta, salir de la caja o tocar un alambre.
  function f3bWireDir(ws, x, y) {
    var bx = 0, by = 0;
    ws.forEach(function (w) { var dx = x - w.x, dy = w.y - y, r2 = dx * dx + dy * dy || 1; bx += -w.I * dy / r2; by += w.I * dx / r2; });
    var m = Math.hypot(bx, by) || 1;
    return [bx / m, -by / m];                       // de vuelta a pantalla (y hacia abajo)
  }
  function f3bWireLine(ws, x0, y0, box) {
    var pts = [[x0, y0]], x = x0, y = y0, ds = 3, closed = false;
    for (var k = 0; k < 2500; k++) {
      var a = f3bWireDir(ws, x, y), b = f3bWireDir(ws, x + ds / 2 * a[0], y + ds / 2 * a[1]), c = f3bWireDir(ws, x + ds / 2 * b[0], y + ds / 2 * b[1]), d = f3bWireDir(ws, x + ds * c[0], y + ds * c[1]);
      x += ds / 6 * (a[0] + 2 * b[0] + 2 * c[0] + d[0]); y += ds / 6 * (a[1] + 2 * b[1] + 2 * c[1] + d[1]);
      pts.push([x, y]);
      if (k > 12 && Math.hypot(x - x0, y - y0) < ds * 1.2) { closed = true; break; }
      if (x < box[0] || x > box[2] || y < box[1] || y > box[3]) break;
      if (ws.some(function (w) { return Math.hypot(w.x - x, w.y - y) < 5; })) break;
    }
    return { pts: pts, closed: closed };
  }
  // Alambre perpendicular a la página: círculo con ⊙ o ⊗.
  function f3bWire(x, y, I, lbl) {
    return '<circle class="' + (I > 0 ? 'box-err' : 'box-aux') + '" cx="' + r1(x) + '" cy="' + r1(y) + '" r="13"/>' + f3bOut(x, y, 8, I > 0, I > 0 ? 'error' : 'aux') +
      (lbl ? text(x, y + 36, lbl, ' text-anchor="middle" font-size="17"') : '');
  }

  /* ---------- S07 · Superposición en un punto (explainer, k = 1…5) ---------- */
  D['f3s07-super'] = function (s) {
    var k = Math.round(num(s, 'k', 5)), b = '', W1 = [200, 250], W2 = [440, 250], P = [320, 130], A = 95;
    b += f3bWire(W1[0], W1[1], 1, 'I₁ (⊙)') + f3bWire(W2[0], W2[1], -1, 'I₂ (⊗)');
    b += dot('dot-trace', P[0], P[1], 5) + text(P[0] + 4, P[1] + 30, 'P', ' text-anchor="middle" font-size="18"');
    if (k <= 3) b += seg('aux', W1[0], W1[1], P[0], P[1], 1.4, '5 5') + seg('aux', W2[0], W2[1], P[0], P[1], 1.4, '5 5') +
      text(250, 180, 'r₁', ' text-anchor="end" font-size="18"') + text(390, 180, 'r₂', ' font-size="18"');
    var u = Math.SQRT1_2;
    if (k >= 2) b += arrow(k >= 4 ? 'aux' : 'error', P[0], P[1], -A * u, -A * u, 3) + text(P[0] - A * u - 8, P[1] - A * u - 4, 'B₁', ' text-anchor="end" font-size="18"');
    if (k >= 3) b += arrow(k >= 4 ? 'aux' : 'error', P[0], P[1], A * u, -A * u, 3) + text(P[0] + A * u + 8, P[1] - A * u - 4, 'B₂', ' font-size="18"');
    if (k === 2) b += text(20, 30, 'B₁ ⟂ r₁, antihorario (I₁ sale)', ' font-size="17"');
    if (k === 3) b += text(20, 30, 'B₂ ⟂ r₂, horario (I₂ entra)', ' font-size="17"');
    if (k === 4) {
      b += seg('aux', P[0] - A * u, P[1] - A * u, P[0], P[1] - A * u, 1.6, '4 4') + seg('aux', P[0] + A * u, P[1] - A * u, P[0], P[1] - A * u, 1.6, '4 4');
      b += text(20, 30, 'las x se cancelan; las y se suman', ' font-size="17"');
    }
    if (k >= 5) b += arrow('error', P[0], P[1], 0, -2 * A * u, 3.6) + text(P[0] + 10, P[1] - 2 * A * u + 6, 'B', ' font-size="19"') + text(20, 30, 'B = B₁ + B₂ (como vectores)', ' font-size="17"');
    return svgBox('0 0 640 300', 'Dos alambres perpendiculares a la página: el de la izquierda con corriente saliendo y el de la derecha entrando. En el punto P, arriba del punto medio, el campo de cada alambre es perpendicular a la línea que lo une con P; sus componentes horizontales se cancelan y las verticales se suman, y el campo total apunta hacia arriba.', b);
  };

  /* ---------- S07 · Líneas de campo de dos alambres: iguales y opuestas ---------- */
  D['f3s07-lines'] = function () {
    var b = '';
    [[160, 1, 'corrientes iguales'], [480, -1, 'corrientes opuestas']].forEach(function (pnl) {
      var cx = pnl[0], cy = 145, box = [cx - 150, 12, cx + 150, 270];
      var ws = [{ x: cx - 55, y: cy, I: 1 }, { x: cx + 55, y: cy, I: pnl[1] }];
      var seeds = pnl[1] > 0 ? [cx + 70, cx + 85, cx + 105, cx + 40, cx - 70, cx - 85, cx - 105, cx - 40, cx + 160, cx + 125] : [cx + 70, cx + 85, cx + 108, cx + 140, cx + 30, cx - 70, cx - 85, cx - 108, cx - 140, cx - 30];
      seeds.forEach(function (x0) {
        var t = f3bWireLine(ws, x0, cy, box);
        b += poly('ref', t.pts, 1.7, t.closed);
        b += f3Head(t.pts, Math.floor(t.pts.length * 0.25), 'ref');
      });
      b += '<rect class="axis" fill="none" stroke-width="1" x="' + box[0] + '" y="' + box[1] + '" width="300" height="258"/>';
      ws.forEach(function (w) { b += f3bWire(w.x, w.y, w.I); });
      b += text(cx, 294, pnl[2], ' text-anchor="middle" font-size="17"');
    });
    return svgBox('0 0 640 305', 'Líneas de campo magnético de dos alambres perpendiculares a la página. A la izquierda, con corrientes en el mismo sentido: cerca de cada alambre las líneas lo rodean, entre ellos el campo se cancela en el punto medio y lejos las líneas rodean a los dos juntos. A la derecha, con corrientes opuestas: las líneas rodean a cada alambre por separado y entre ellos el campo es más intenso.', b);
  };

  /* ---------- S07 · Fuerza entre conductores paralelos (explainer, k = 1…4) ---------- */
  D['f3s07-force'] = function (s) {
    var k = Math.round(num(s, 'k', 4)), opp = num(s, 'opp', 0) > 0.5, b = '', x1 = 220, x2 = 420, top = 40, bot = 280;
    b += seg('ref', x1, bot, x1, top, 4) + f3bChev('ref', x1, 110, 0, -1);
    b += seg('ref', x2, bot, x2, top, 4) + f3bChev('ref', x2, opp ? 210 : 110, 0, opp ? 1 : -1);
    b += text(x1 - 14, 64, 'I₁', ' text-anchor="end" font-size="18"') + text(x2 + 14, 64, 'I₂', ' font-size="18"');
    b += seg('axis', x1, 160, x2, 160, 1.2, '4 6') + text((x1 + x2) / 2, 152, 'd', ' text-anchor="middle" font-size="18"');
    if (k >= 1 && k <= 3) {
      // Campo de I₁ (hacia arriba) a la derecha: entra a la página; a la izquierda: sale.
      [100, 200].forEach(function (y) { b += f3bOut(x2 + 40, y, 9, false, 'aux'); });
      b += text(x2 + 58, 240, 'B₁ entra', ' font-size="16"');
    }
    if (k === 1) b += text(20, 316, 'B₁ = μ₀I₁/2πd, en el alambre 2', ' font-size="17"');
    var F = 58;
    if (k >= 2) b += arrow('trace', x2, 160, opp ? F : -F, 0, 3.4) + text(x2 + (opp ? F + 8 : -F - 8), 186, 'F₂', ' text-anchor="' + (opp ? 'start' : 'end') + '" font-size="18"');
    if (k === 2) b += text(20, 316, 'F₂ = I₂ L × B₁:  F/L = μ₀I₁I₂/2πd', ' font-size="17"');
    if (k >= 3) b += arrow('trace', x1, 160, opp ? -F : F, 0, 3.4) + text(x1 + (opp ? -F - 8 : F + 8), 186, 'F₁', ' text-anchor="' + (opp ? 'end' : 'start') + '" font-size="18"');
    if (k === 3) b += text(20, 316, 'tercera ley: F₁ = −F₂', ' font-size="17"');
    if (k >= 4) b += text(20, 316, opp ? 'corrientes opuestas: se repelen' : 'corrientes iguales: se atraen', ' font-size="18"');
    return svgBox('0 0 640 330', 'Dos alambres paralelos separados una distancia d. El campo del alambre 1 en el alambre 2 entra a la página; la fuerza sobre el alambre 2 es perpendicular a él. Con corrientes en el mismo sentido los alambres se atraen; con corrientes opuestas se repelen.', b);
  };

  /* ---------- S07 · Tres alambres en fila ---------- */
  D['f3s07-three'] = function () {
    var b = '', y = 130, xs = [140, 300, 520], Is = [1, 1, -1], lb = ['4.0 A (⊙)', '5.0 A (⊙)', '6.0 A (⊗)'];
    b += seg('axis', 60, y, 600, y, 1, '4 6');
    xs.forEach(function (x, i) { b += f3bWire(x, y, Is[i], lb[i]); });
    b += text(220, y - 16, '2.0 cm', ' text-anchor="middle" font-size="16"') + text(410, y - 16, '3.0 cm', ' text-anchor="middle" font-size="16"');
    b += arrow('trace', 300, y - 40, -60, 0, 3) + arrow('trace', 300, y - 58, -40, 0, 3);
    b += text(230, y - 64, 'atrae (1)', ' text-anchor="end" font-size="15"') + text(228, y - 30, 'repele (3)', ' text-anchor="end" font-size="15"');
    return svgBox('0 0 640 200', 'Tres alambres paralelos en una fila, perpendiculares a la página: 4.0 A saliendo, 5.0 A saliendo a 2.0 cm del primero, y 6.0 A entrando a 3.0 cm del segundo. Sobre el alambre de en medio, el primero lo atrae hacia la izquierda y el tercero lo repele también hacia la izquierda.', b);
  };

  /* ══════════════════════ fin S07 ══════════════════════ */

  /* ══════════════════════ S08 ══════════════════════ */
  // Circunferencia con flechas de recorrido (antihorario si dir > 0), en pantalla.
  function f3bLoop(cx, cy, r, cls, dir, n, w, dash) {
    var o = '<circle class="' + cls + '" fill="none" stroke-width="' + (w || 2.4) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + ' cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(r) + '"/>';
    for (var i = 0; i < (n || 4); i++) {
      var a = (45 + 360 * i / (n || 4)) * RAD, x = cx + r * Math.cos(a), y = cy - r * Math.sin(a);
      o += f3bChev(cls, x, y, -Math.sin(a) * (dir || 1), -Math.cos(a) * (dir || 1), w || 2.4);
    }
    return o;
  }

  /* ---------- S08 · Circulación alrededor de un alambre ---------- */
  D['f3s08-circ'] = function () {
    var b = '', C = [230, 160], R = 110;
    b += f3bLoop(C[0], C[1], R, 'trace', 1, 4, 2.4, '7 5');
    b += f3bWire(C[0], C[1], 1) + text(C[0] + 18, C[1] + 34, 'I', ' font-size="18"');
    [20, 110, 200, 290].forEach(function (d) {
      var a = d * RAD, x = C[0] + R * Math.cos(a), y = C[1] - R * Math.sin(a);
      b += arrow('error', x, y, -46 * Math.sin(a), -46 * Math.cos(a), 3);
    });
    b += seg('axis', C[0], C[1], C[0] + R * Math.cos(-40 * RAD), C[1] - R * Math.sin(-40 * RAD), 1.2, '3 5') + text(C[0] + 52, C[1] + 58, 'r', ' font-size="18"');
    b += text(400, 70, 'B es tangente y mide', ' font-size="17"') + text(400, 94, 'lo mismo en todo el círculo:', ' font-size="17"');
    b += text(400, 140, '∮B·dl = B·2πr', ' font-size="19"') + text(400, 172, '= μ₀I', ' font-size="19"');
    b += text(400, 220, 'B = μ₀I / 2πr', ' font-size="19"');
    return svgBox('0 0 640 290', 'Un alambre con corriente saliendo de la página y una trayectoria circular de radio r a su alrededor, recorrida en sentido antihorario. El campo es tangente a la trayectoria y tiene la misma magnitud en todos sus puntos, así que la circulación es B por 2πr.', b);
  };

  /* ---------- S08 · Corriente encerrada con signo ---------- */
  D['f3s08-sign'] = function () {
    var b = '', pts = [];
    for (var i = 0; i <= 80; i++) { var t = 2 * Math.PI * i / 80, r = 120 + 22 * Math.sin(3 * t) + 10 * Math.cos(2 * t); pts.push([250 + 1.25 * r * Math.cos(t), 150 - 0.95 * r * Math.sin(t)]); }
    b += poly('trace', pts, 2.6, true, '7 5');
    [5, 25, 45, 65].forEach(function (k) { var p = pts[k], q = pts[k + 1]; b += f3bChev('trace', p[0], p[1], q[0] - p[0], q[1] - p[1], 2.6); });
    b += f3bWire(200, 140, 1, '5 A') + f3bWire(310, 170, -1, '2 A') + f3bWire(530, 90, 1, '4 A');
    b += text(450, 210, 'afuera: no cuenta', ' font-size="16"');
    b += text(40, 300, 'recorrido antihorario: ⊙ cuenta +, ⊗ cuenta −', ' font-size="17"') + text(40, 326, 'I_enc = 5 − 2 = 3 A,   ∮B·dl = μ₀(3 A)', ' font-size="17"');
    return svgBox('0 0 640 340', 'Una trayectoria cerrada de forma irregular, recorrida en sentido antihorario, encierra un alambre con 5 A saliendo de la página y otro con 2 A entrando; un tercer alambre con 4 A queda afuera. La corriente encerrada es 5 menos 2, o sea 3 A.', b);
  };

  /* ---------- S08 · Por qué no cuentan las corrientes de afuera (explainer, k = 1…3) ---------- */
  D['f3s08-angle'] = function (s) {
    var k = Math.round(num(s, 'k', 1)), b = '', C = [300, 165], R = 105;
    b += f3bLoop(C[0], C[1], R, 'trace', 1, 4, 2.4, '7 5');
    if (k === 1) {
      b += f3bWire(C[0] - 20, C[1] + 10, 1, 'I');
      [0, 60, 120, 180, 240, 300].forEach(function (d) { var a = d * RAD; b += seg('aux', C[0] - 20, C[1] + 10, C[0] - 20 + 150 * Math.cos(a), C[1] + 10 - 150 * Math.sin(a), 1.2, '3 6'); });
      b += text(20, 320, 'adentro: al dar la vuelta, el ángulo visto desde el alambre recorre 2π', ' font-size="16"');
    } else {
      var W = [60, 150];
      b += f3bWire(W[0], W[1], 1, 'I');
      // Dos rayos tangentes desde el alambre: cortan un tramo cercano y uno lejano con el mismo dθ.
      var d = Math.hypot(C[0] - W[0], C[1] - W[1]), base = Math.atan2(W[1] - C[1], C[0] - W[0]), half = Math.asin(R / d);
      [-1, 1].forEach(function (sg) { var a = base + sg * half * 0.55; b += seg('aux', W[0], W[1], W[0] + 520 * Math.cos(a), W[1] - 520 * Math.sin(a), 1.4, '4 5'); });
      b += text(C[0] - 108, C[1] - 4, 'cerca', ' text-anchor="end" font-size="16"') + text(C[0] + 112, C[1] - 4, 'lejos', ' font-size="16"');
      if (k === 2) b += text(20, 320, 'el tramo cercano y el lejano subtienden el mismo dθ, recorridos al revés', ' font-size="16"');
      if (k >= 3) b += text(20, 320, 'B·dl = (μ₀I/2π) dθ: los aportes se cancelan; afuera, ∮B·dl = 0', ' font-size="16"');
    }
    return svgBox('0 0 640 335', 'Una trayectoria circular y un alambre. Cuando el alambre está adentro, el ángulo con que se ve cada punto del recorrido da una vuelta completa. Cuando está afuera, cada par de rayos desde el alambre corta un tramo cercano y uno lejano de la trayectoria, recorridos en sentidos opuestos, y sus aportes se cancelan.', b);
  };

  /* ---------- S08 · Alambre grueso: B adentro y afuera (explainer, k = 1…4) ---------- */
  D['f3s08-thick'] = function (s) {
    var k = Math.round(num(s, 'k', 4)), b = '', C = [160, 165], R = 80, rr = k === 1 ? 125 : 50;
    b += '<circle class="box-err" cx="' + C[0] + '" cy="' + C[1] + '" r="' + R + '"/>';
    for (var gx = -70; gx <= 70; gx += 28) for (var gy = -70; gy <= 70; gy += 28) if (Math.hypot(gx, gy) < R - 12) b += dot('dot-error', C[0] + gx, C[1] + gy, 2.6);
    if (k <= 3) {
      if (k >= 2) b += '<circle class="box-trace" cx="' + C[0] + '" cy="' + C[1] + '" r="' + rr + '"/>';
      b += f3bLoop(C[0], C[1], rr, 'trace', 1, 4, 2.6, '7 5');
      b += seg('axis', C[0], C[1], C[0] + rr * Math.cos(30 * RAD), C[1] - rr * Math.sin(30 * RAD), 1.4) + text(C[0] + rr * 0.45, C[1] - rr * 0.4, 'r', ' font-size="18"');
      b += seg('axis', C[0], C[1], C[0] - R * Math.cos(30 * RAD), C[1] + R * Math.sin(30 * RAD), 1.2, '3 4') + text(C[0] - 52, C[1] + 48, 'R', ' font-size="18"');
    }
    var gx0 = 340, gx1 = 620, gy0 = 290, gy1 = 70, GX = function (r) { return gx0 + (gx1 - gx0) * r / 3; }, GY = function (B) { return gy0 - (gy0 - gy1) * B; };
    if (k === 1) b += text(330, 120, 'afuera: I_enc = I', ' font-size="18"') + text(330, 150, 'B·2πr = μ₀I', ' font-size="18"') + text(330, 180, 'B = μ₀I / 2πr', ' font-size="18"');
    if (k === 2) b += text(330, 120, 'adentro: I_enc = I·(πr²/πR²)', ' font-size="18"') + text(330, 150, '= I r²/R²', ' font-size="18"');
    if (k === 3) b += text(330, 120, 'B·2πr = μ₀I r²/R²', ' font-size="18"') + text(330, 150, 'B = μ₀I r / 2πR²', ' font-size="18"') + text(330, 180, 'crece en línea recta', ' font-size="18"');
    if (k >= 4) {
      b += seg('axis', gx0, gy0, gx1, gy0, 1.4) + seg('axis', gx0, gy0, gx0, gy1 - 14, 1.4);
      b += seg('axis', GX(1), gy0, GX(1), gy1, 1, '3 5') + text(GX(1), gy0 + 22, 'R', ' text-anchor="middle" font-size="17"') + text(gx1, gy0 + 22, 'r', ' text-anchor="end" font-size="17"') + text(gx0 + 8, gy1 - 18, 'B', ' font-size="17"');
      var p = [];
      for (var i = 0; i <= 60; i++) { var r = 3 * i / 60; p.push([GX(r), GY(r < 1 ? r : 1 / r)]); }
      b += poly('ref', p, 2.6);
      b += text(GX(0.25), GY(0.62), '∝ r', ' font-size="17"') + text(GX(2), GY(0.62), '∝ 1/r', ' font-size="17"');
    }
    return svgBox('0 0 640 320', 'Corte de un alambre grueso de radio R con corriente uniforme saliendo de la página, y una trayectoria amperiana circular de radio r. Afuera encierra toda la corriente y B baja como 1/r; adentro encierra la fracción r²/R² y B crece en proporción a r. La gráfica de B contra r sube en línea recta hasta R y luego baja.', b);
  };

  /* ---------- S08 · Cable coaxial ---------- */
  D['f3s08-coax'] = function () {
    var b = '', C = [170, 160], a = 40, bb = 100, c = 120;
    b += '<circle class="box-aux" cx="' + C[0] + '" cy="' + C[1] + '" r="' + c + '"/><circle class="box-base" cx="' + C[0] + '" cy="' + C[1] + '" r="' + bb + '"/><circle class="box-err" cx="' + C[0] + '" cy="' + C[1] + '" r="' + a + '"/>';
    b += f3bOut(C[0], C[1], 9, true, 'error');
    [[25, '1'], [70, '2'], [140, '3']].forEach(function (q) { b += f3bLoop(C[0], C[1], q[0], 'trace', 1, 2, 2, '5 5') + text(C[0] + q[0] * 0.7 + 4, C[1] + q[0] * 0.7 + 18, q[1], ' font-size="17"'); });
    b += text(330, 60, 'núcleo: +I (sale)', ' font-size="17"') + text(330, 86, 'forro: −I (regresa)', ' font-size="17"');
    b += text(330, 140, '1 (r < a): I_enc = I r²/a²', ' font-size="17"') + text(330, 170, '2 (a < r < b): I_enc = I', ' font-size="17"') + text(330, 200, '3 (r > c): I_enc = I − I = 0', ' font-size="17"');
    b += text(330, 240, 'afuera del cable, B = 0', ' font-size="18"');
    return svgBox('0 0 640 300', 'Corte de un cable coaxial: un núcleo de radio a con corriente saliendo y un forro entre b y c con la misma corriente regresando. Tres trayectorias amperianas: dentro del núcleo, entre núcleo y forro, y afuera del cable, donde la corriente encerrada es cero y el campo también.', b);
  };

  /* ══════════════════════ fin S08 ══════════════════════ */

  /* ══════════════════════ S09 ══════════════════════ */
  // Corte lateral de un solenoide: n vueltas entre x0 y x1, arriba ⊙ (sale) y abajo ⊗ (entra).
  function f3bSol(x0, x1, yt, yb, n, r) {
    var o = seg('axis', x0 - 14, yt, x1 + 14, yt, 1, '3 5') + seg('axis', x0 - 14, yb, x1 + 14, yb, 1, '3 5');
    for (var i = 0; i < n; i++) {
      var x = x0 + (x1 - x0) * (i + 0.5) / n;
      o += f3bOut(x, yt, r || 9, true, 'ref') + f3bOut(x, yb, r || 9, false, 'ref');
    }
    return o;
  }

  /* ---------- S09 · Líneas de campo de un solenoide ---------- */
  D['f3s09-lines'] = function () {
    var b = '', x0 = 170, x1 = 470, yt = 95, yb = 225, cy = 160;
    // Afuera: lazos que regresan por arriba y por abajo (débiles).
    [40, 70].forEach(function (h) {
      var top = [], bot = [];
      for (var i = 0; i <= 40; i++) {
        var t = Math.PI * i / 40, x = 320 + 220 * Math.cos(t), y = cy - (65 + h) * Math.sin(t);
        top.push([x, y]); bot.push([x, 2 * cy - y]);
      }
      b += poly('ref', top, 1.4, false, '6 6') + poly('ref', bot, 1.4, false, '6 6');
      b += f3bChev('ref', 320, cy - 65 - h, -1, 0, 1.6) + f3bChev('ref', 320, cy + 65 + h, -1, 0, 1.6);
    });
    [-36, -12, 12, 36].forEach(function (d) { b += arrow('ref', x0 - 60, cy + d, x1 - x0 + 120, 0, 2.2); });
    b += f3bSol(x0, x1, yt, yb, 9);
    b += text(x1 + 70, cy - 54, 'N', ' text-anchor="middle" font-size="22"') + text(x0 - 70, cy - 54, 'S', ' text-anchor="middle" font-size="22"');
    b += text(320, 312, 'adentro: B casi uniforme · afuera: B muy débil', ' text-anchor="middle" font-size="17"');
    return svgBox('0 0 640 325', 'Corte lateral de un solenoide: arriba las corrientes salen de la página y abajo entran. Adentro las líneas de campo son rectas, paralelas y apretadas, de izquierda a derecha; afuera regresan en lazos amplios y espaciados. El extremo derecho, por donde salen las líneas, se comporta como un polo N.', b);
  };

  /* ---------- S09 · Ampère en un solenoide ideal (explainer, k = 1…4) ---------- */
  D['f3s09-ampere'] = function (s) {
    var k = Math.round(num(s, 'k', 4)), b = '', x0 = 120, x1 = 520, yt = 110, yb = 230, cy = 170;
    [-24, 0, 24].forEach(function (d) { b += arrow('ref', x0 + 10, cy + d, x1 - x0 - 20, 0, 1.8); });
    b += f3bSol(x0, x1, yt, yb, 10, 8);
    var A = [230, 150], Bp = [410, 150], Cp = [410, 60], Dp = [230, 60];
    var hl = function (p, q, on) { return seg(on ? 'error' : 'trace', p[0], p[1], q[0], q[1], on ? 4 : 2.4, on ? null : '7 5'); };
    b += hl(A, Bp, k === 4) + hl(Bp, Cp, k === 3) + hl(Cp, Dp, k === 2) + hl(Dp, A, k === 3);
    b += f3bChev('trace', 330, 150, 1, 0) + f3bChev('trace', 410, 105, 0, -1) + f3bChev('trace', 310, 60, -1, 0) + f3bChev('trace', 230, 105, 0, 1);
    b += text(220, 166, 'a', ' text-anchor="end" font-size="17"') + text(422, 166, 'b', ' font-size="17"') + text(422, 56, 'c', ' font-size="17"') + text(220, 56, 'd', ' text-anchor="end" font-size="17"');
    b += text(320, 176, 'ℓ', ' text-anchor="middle" font-size="18"');
    var msg = ['rectángulo abcd: un lado adentro, otro afuera', 'cd, afuera: B ≈ 0', 'bc y da: B ⟂ dl (o B ≈ 0)', 'ab, adentro: B ℓ = μ₀ (nℓ) I  →  B = μ₀ n I'][k - 1];
    b += text(320, 300, msg, ' text-anchor="middle" font-size="17"');
    return svgBox('0 0 640 315', 'Corte de un solenoide largo con una trayectoria amperiana rectangular abcd: el lado ab, de largo ℓ, está adentro y paralelo al eje; el lado cd está afuera; los lados bc y da cruzan las vueltas perpendiculares al eje.', b);
  };

  /* ---------- S09 · Perfil de B en el eje de solenoides finitos ---------- */
  D['f3s09-profile'] = function () {
    var b = '', gx0 = 70, gx1 = 590, gy0 = 260, gy1 = 50;
    var GX = function (u) { return (gx0 + gx1) / 2 + (gx1 - gx0) / 2 * u; }, GY = function (f) { return gy0 - (gy0 - gy1) * f / 1.1; };
    b += seg('axis', gx0, gy0, gx1, gy0, 1.4) + seg('axis', GX(0), gy0, GX(0), gy1 - 10, 1, '3 5');
    b += seg('aux', gx0, GY(1), gx1, GY(1), 2, '6 5') + text(gx1, GY(1) - 8, 'ideal μ₀nI', ' text-anchor="end" font-size="16"');
    [-0.5, 0.5].forEach(function (u) { b += seg('axis', GX(u), gy0, GX(u), gy1, 1, '2 5'); });
    b += text(GX(-0.5), gy0 + 22, '−L/2', ' text-anchor="middle" font-size="16"') + text(GX(0.5), gy0 + 22, 'L/2', ' text-anchor="middle" font-size="16"') + text(gx1, gy0 + 22, 'z', ' text-anchor="end" font-size="16"');
    [[20, 'ref', 'L/R = 20'], [5, 'trace', 'L/R = 5'], [2, 'error', 'L/R = 2']].forEach(function (c, j) {
      var LR = c[0], p = [];
      for (var i = 0; i <= 120; i++) {
        var u = -1 + 2 * i / 120, z = u, L = 1, R = 1 / LR, w1 = z + L / 2, w2 = z - L / 2;
        p.push([GX(u), GY(0.5 * (w1 / Math.hypot(w1, R) - w2 / Math.hypot(w2, R)))]);
      }
      b += poly(c[1], p, 2.4);
      b += text(GX(-0.95), GY(0.98 - 0.13 * j) - 4, c[2], ' font-size="16"');
      b += seg(c[1], GX(-0.95) - 34, GY(0.98 - 0.13 * j) - 9, GX(-0.95) - 8, GY(0.98 - 0.13 * j) - 9, 2.4);
    });
    b += text(GX(0.62), GY(0.5) - 6, '≈ ½ en el extremo', ' font-size="16"');
    return svgBox('0 0 640 290', 'Campo en el eje de tres solenoides con la misma n e I, de largo L y radio R, dividido entre el campo ideal μ₀nI. Con L/R = 20 la curva es plana y llega a casi 1 adentro, y baja a la mitad en los extremos; con L/R = 2 el campo en el centro es bastante menor que el ideal.', b);
  };

  /* ---------- S09 · Toroide con Ampère (explainer, k = 1…3) ---------- */
  D['f3s09-toroid'] = function (s) {
    var k = Math.round(num(s, 'k', 1)), b = '', C = [200, 165], a = 80, bb = 130, rr = [105, 50, 150][k - 1];
    b += '<circle class="box-ref" cx="' + C[0] + '" cy="' + C[1] + '" r="' + bb + '"/><circle class="box-base" cx="' + C[0] + '" cy="' + C[1] + '" r="' + a + '"/>';
    for (var i = 0; i < 24; i++) {
      var t = 2 * Math.PI * (i + 0.5) / 24;
      b += seg('ref', C[0] + a * Math.cos(t), C[1] - a * Math.sin(t), C[0] + bb * Math.cos(t), C[1] - bb * Math.sin(t), 1.6);
      b += dot('dot-ref', C[0] + (a - 9) * Math.cos(t), C[1] - (a - 9) * Math.sin(t), 2.4);
    }
    b += f3bLoop(C[0], C[1], rr, 'trace', 1, 4, 2.8, '7 5');
    b += text(C[0] - a + 4, C[1] + 6, 'a', ' font-size="16"') + text(C[0] + bb + 6, C[1] + 6, 'b', ' font-size="16"');
    var msg = [['adentro del núcleo (a < r < b):', 'la trayectoria atraviesan N vueltas,', 'B · 2πr = μ₀NI  →  B = μ₀NI/2πr'],
               ['en el hueco (r < a):', 'ninguna corriente atraviesa el círculo,', 'B = 0'],
               ['afuera (r > b):', 'cada vuelta cruza dos veces, en sentidos opuestos,', 'I_enc = NI − NI = 0  →  B = 0']][k - 1];
    msg.forEach(function (m, j) { b += text(370, 120 + 30 * j, m, ' font-size="16"'); });
    b += text(370, 230, '(los puntos son las corrientes', ' font-size="15"') + text(370, 252, 'del lado interior, que salen)', ' font-size="15"');
    return svgBox('0 0 640 320', 'Toroide visto desde arriba: un núcleo en forma de dona entre los radios a y b, enrollado con N vueltas. Una trayectoria amperiana circular de radio r: dentro del núcleo encierra N veces la corriente; en el hueco y afuera, la corriente neta encerrada es cero.', b);
  };

  /* ══════════════════════ fin S09 ══════════════════════ */

  /* ══════════════════════ S10 ══════════════════════ */
  /* ---------- S10 · Espira inclinada en un campo uniforme (th = ángulo entre B y la normal) ---------- */
  D['f3s10-flux'] = function (s) {
    var th = num(s, 'th', 30), b = '', P = view3({ cx: 250, cy: 190, s: 11, az: -30, el: 18 }), t = th * RAD, ct = Math.cos(t), st = Math.sin(t), h = 6;
    for (var gx = -10; gx <= 10; gx += 5) for (var gy = -8; gy <= 8; gy += 8) {
      var a0 = P([gx, gy, -11]), a1 = P([gx, gy, 12]);
      b += fade(arrow('ref', a0[0], a0[1], a1[0] - a0[0], a1[1] - a0[1], 1.6), 0.6);
    }
    var c = [[-h * ct, -h, h * st], [h * ct, -h, -h * st], [h * ct, h, -h * st], [-h * ct, h, h * st]].map(P);
    b += '<path class="box-trace" d="M' + c.map(function (p) { return r1(p[0]) + ' ' + r1(p[1]); }).join('L') + 'Z"/>';
    var sh = [[-h * ct, -h, -11], [h * ct, -h, -11], [h * ct, h, -11], [-h * ct, h, -11]].map(P);
    b += '<path class="box-aux" opacity="0.55" d="M' + sh.map(function (p) { return r1(p[0]) + ' ' + r1(p[1]); }).join('L') + 'Z"/>';
    var o = P([0, 0, 0]), n = P([7 * st, 0, 7 * ct]);
    b += arrow('error', o[0], o[1], n[0] - o[0], n[1] - o[1], 3.2) + text(n[0] + 8, n[1] - 2, 'n̂', ' font-size="19"');
    var top = P([10, 8, 12]);
    b += text(top[0] + 8, top[1] + 4, 'B', ' font-size="19"');
    b += text(440, 80, 'θ = ' + Math.round(th) + '°', ' font-size="19"');
    b += text(440, 112, 'Φ = BA cos θ', ' font-size="19"');
    b += text(440, 144, 'cos θ = ' + Number(Math.cos(t).toFixed(2)), ' font-size="18"');
    b += text(440, 176, Math.abs(Math.cos(t)) < 0.02 ? 'Φ = 0' : Math.cos(t) > 0 ? 'Φ > 0' : 'Φ < 0', ' font-size="18"');
    var sp = P([0, 0, -11]);
    b += text(sp[0], sp[1] + 46, 'sombra: A cos θ', ' text-anchor="middle" font-size="16"');
    return svgBox('0 0 640 330', 'Una espira cuadrada en un campo magnético uniforme vertical. La normal de la espira forma un ángulo θ con el campo. La sombra de la espira sobre un plano perpendicular al campo tiene área A cos θ, y el flujo es B A cos θ.', b);
  };

  /* ---------- S10 · Espira junto a un alambre: tiras dA ---------- */
  D['f3s10-wire'] = function () {
    var b = '', wx = 90, x0 = 200, x1 = 480, y0 = 70, y1 = 250;
    b += seg('ref', wx, 290, wx, 30, 4) + f3bChev('ref', wx, 90, 0, -1) + text(wx - 12, 50, 'I', ' text-anchor="end" font-size="18"');
    b += '<rect class="box-trace" x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0) + '" height="' + (y1 - y0) + '"/>';
    var xs = 300;
    b += '<rect class="box-err" x="' + xs + '" y="' + y0 + '" width="14" height="' + (y1 - y0) + '"/>';
    b += text(xs + 7, y0 - 10, 'dA = h dr', ' text-anchor="middle" font-size="16"');
    [230, 290, 380, 450].forEach(function (x) { [100, 160, 220].forEach(function (y) { b += f3bOut(x, y, 3 + 900 / (x - wx), false, 'aux'); }); });
    b += seg('axis', wx, 275, x0, 275, 1.2) + text((wx + x0) / 2, 296, 'a', ' text-anchor="middle" font-size="17"');
    b += seg('axis', wx, 305, x1, 305, 1.2) + text(x1 - 20, 324, 'b', ' text-anchor="middle" font-size="17"');
    b += seg('axis', x1 + 16, y0, x1 + 16, y1, 1.2) + text(x1 + 26, (y0 + y1) / 2, 'h', ' font-size="17"');
    b += text(520, 120, 'B = μ₀I/2πr', ' font-size="17"') + text(520, 150, 'baja con r', ' font-size="16"');
    return svgBox('0 0 640 335', 'Un alambre largo con corriente hacia arriba y, a su derecha, una espira rectangular de alto h entre las distancias a y b. El campo del alambre entra a la página y es más débil lejos del alambre; se parte la espira en tiras verticales de área h dr.', b);
  };

  /* ---------- S10 · Ley de Gauss: E contra B (k = 1…3) ---------- */
  D['f3s10-gauss'] = function (s) {
    var k = Math.round(num(s, 'k', 3)), b = '';
    // Izquierda: carga positiva dentro de una superficie: todo sale.
    var C1 = [150, 160];
    for (var i = 0; i < 12; i++) { var a = 2 * Math.PI * i / 12; b += arrow('ref', C1[0] + 16 * Math.cos(a), C1[1] - 16 * Math.sin(a), 100 * Math.cos(a), -100 * Math.sin(a), 1.8); }
    b += '<circle class="box-err" cx="' + C1[0] + '" cy="' + C1[1] + '" r="13"/>' + text(C1[0], C1[1] + 7, '+', ' text-anchor="middle" font-size="20"');
    b += '<circle class="trace" fill="none" stroke-width="2.6" stroke-dasharray="7 5" cx="' + C1[0] + '" cy="' + C1[1] + '" r="70"/>';
    b += text(C1[0], 300, 'E: todo sale → Φ = q/ε₀', ' text-anchor="middle" font-size="17"');
    // Derecha: imán y una superficie que solo encierra el polo N.
    var cx = 470, cy = 160, half = 45;
    b += f3Outer(cx, cy, half, [330, 20, 630, 290], 1) + f3Bar(cx, cy, 90, 36, false);
    if (k >= 2) b += f3Inner(cx, cy, half, [-11, 11], 1);
    b += '<circle class="trace" fill="none" stroke-width="2.6" stroke-dasharray="7 5" cx="' + (cx + half) + '" cy="' + cy + '" r="40"/>';
    var msg = ['afuera: las líneas salen', 'adentro del imán: entran', 'B: entra lo que sale → Φ = 0'][k - 1];
    b += text(cx, 300, msg, ' text-anchor="middle" font-size="17"');
    b += seg('axis', 320, 20, 320, 280, 1.2, '4 7');
    return svgBox('0 0 640 315', 'A la izquierda, una superficie cerrada alrededor de una carga positiva: todas las líneas del campo eléctrico salen y el flujo neto es q entre épsilon cero. A la derecha, una superficie cerrada alrededor del polo N de un imán: las líneas del campo magnético salen por afuera, pero las mismas líneas entran por dentro del imán, así que el flujo neto es cero.', b);
  };

  /* ---------- S10 · Dominios magnéticos (k = 0 sin campo, 1 con campo) ---------- */
  D['f3s10-domains'] = function (s) {
    var k = num(s, 'k', 0), b = '', angs = [20, 200, 110, 300, 250, 70, 160, 340, 45, 230, 135, 290];
    [[40, 300, 0], [340, 600, 1]].forEach(function (pn) {
      var x0 = pn[0], al = pn[2] ? Math.min(1, k) : 0, j = 0;
      b += '<rect class="box-base" x="' + x0 + '" y="40" width="' + (pn[1] - pn[0]) + '" height="210" rx="6"/>';
      for (var r = 0; r < 3; r++) for (var c = 0; c < 4; c++) {
        var x = x0 + 32 + c * 65, y = 75 + r * 70, a = angs[j++] * (1 - al), L = 22;
        b += seg('axis', x - 32, 40 + r * 70, x - 32, 110 + r * 70, 1, '3 4');
        b += arrow('error', x - L * Math.cos(a * RAD), y + L * Math.sin(a * RAD), 2 * L * Math.cos(a * RAD), -2 * L * Math.sin(a * RAD), 2.6);
      }
      b += text((pn[0] + pn[1]) / 2, 280, pn[2] ? 'con campo externo: dominios alineados' : 'sin campo: dominios al azar', ' text-anchor="middle" font-size="16"');
    });
    if (k >= 1) b += arrow('ref', 360, 22, 220, 0, 2.6) + text(590, 26, 'B₀', ' font-size="17"');
    return svgBox('0 0 640 295', 'Un trozo de material ferromagnético dividido en dominios, cada uno con su magnetización representada por una flecha. Sin campo externo, las flechas apuntan al azar y se cancelan. Con un campo externo hacia la derecha, los dominios se alinean con él y el material queda magnetizado.', b);
  };

  /* ---------- S10 · Ciclo de histéresis ---------- */
  D['f3s10-hyst'] = function () {
    var b = '', O = [320, 160], sx = 230, sy = 110;
    var X = function (u) { return O[0] + sx * u; }, Y = function (v) { return O[1] - sy * v; };
    b += seg('axis', X(-1.15), O[1], X(1.15), O[1], 1.4) + seg('axis', O[0], Y(-1.25), O[0], Y(1.25), 1.4);
    b += text(X(1.15), O[1] + 44, 'B₀ (campo aplicado)', ' text-anchor="end" font-size="16"') + text(O[0] + 8, Y(1.2), 'B en el material', ' font-size="16"');
    var up = [], dn = [], first = [];
    for (var i = 0; i <= 60; i++) {
      var u = -1 + 2 * i / 60;
      up.push([X(u), Y(Math.tanh(3.2 * (u - 0.25)))]); dn.push([X(-u), Y(Math.tanh(3.2 * (-u + 0.25)))]);
      if (i >= 30) first.push([X(u), Y(Math.tanh(3.2 * u) * 0.92)]);
    }
    b += poly('ref', up, 2.6) + poly('ref', dn, 2.6) + poly('aux', first, 2, false, '6 5');
    b += f3Head(up, 40, 'ref') + f3Head(dn, 40, 'ref');
    var Br = Math.tanh(3.2 * 0.25);
    b += dot('dot-error', O[0], Y(Br), 5) + text(O[0] - 10, Y(Br) - 8, 'remanencia', ' text-anchor="end" font-size="16"');
    b += dot('dot-error', X(0.25), O[1], 5) + text(X(0.25) + 8, O[1] + 22, 'coercitivo', ' font-size="16"');
    b += text(X(0.62), Y(0.35), 'primera', ' font-size="15"') + text(X(0.62), Y(0.2), 'magnetización', ' font-size="15"');
    return svgBox('0 0 640 320', 'Ciclo de histéresis de un material ferromagnético: el campo en el material contra el campo aplicado. La primera magnetización sube desde el origen; al regresar el campo aplicado a cero queda un campo remanente, y hace falta un campo opuesto, el coercitivo, para anularlo. El ciclo se recorre por dos ramas distintas.', b);
  };

  /* ══════════════════════ fin S10 ══════════════════════ */

  /* ══════════════════════ S11 ══════════════════════ */
  /* Ayudantes del bloque C (prefijo f3c). */
  function f3cSub(m, s) { return m + '<tspan baseline-shift="sub" font-size="70%">' + s + '</tspan>'; }
  function f3cSup(m, s) { return m + '<tspan baseline-shift="super" font-size="70%">' + s + '</tspan>'; }
  // Campo perpendicular a la página: ⊗ (entra) o ⊙ (sale).
  function f3cB(x, y, r, into, cls) {
    cls = cls || 'aux';
    var o = '<circle class="' + cls + '" fill="none" stroke-width="1.6" cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r + '"/>';
    if (into) return o + seg(cls, x - r * 0.62, y - r * 0.62, x + r * 0.62, y + r * 0.62, 1.6) + seg(cls, x + r * 0.62, y - r * 0.62, x - r * 0.62, y + r * 0.62, 1.6);
    return o + dot(cls === 'aux' ? 'dot-aux' : 'dot-ref', x, y, r * 0.28);
  }
  // Malla de ⊗/⊙ en [x0, x1] × [y0, y1] con paso dx.
  function f3cGrid(x0, y0, x1, y1, d, into, r, cls) {
    var o = '';
    for (var x = x0; x <= x1 + 0.1; x += d) for (var y = y0; y <= y1 + 0.1; y += d) o += f3cB(x, y, r || 7, into, cls);
    return o;
  }
  // Resistor en zigzag entre (x1, y1) y (x2, y2).
  function f3cZig(x1, y1, x2, y2, cls, n) {
    n = n || 6;
    var L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux, pts = [[x1, y1]];
    for (var i = 0; i < n; i++) { var t = (i + 0.5) / n, s = i % 2 ? -9 : 9; pts.push([x1 + ux * L * t + px * s, y1 + uy * L * t + py * s]); }
    pts.push([x2, y2]);
    return poly(cls || 'ref', pts, 2.6);
  }
  // Bobina vista de lado: n vueltas entre x0 y x1 alrededor de y = cy, radio aparente ry.
  function f3cCoil(x0, x1, cy, ry, n, cls) {
    var o = '', dx = (x1 - x0) / n;
    for (var i = 0; i < n; i++) {
      var x = x0 + dx * (i + 0.5);
      o += '<ellipse class="' + (cls || 'ref') + '" fill="none" stroke-width="2.4" cx="' + r1(x) + '" cy="' + r1(cy) + '" rx="' + r1(dx * 0.42) + '" ry="' + r1(ry) + '"/>';
    }
    return o;
  }
  // Galvanómetro: carátula en (cx, cy) con aguja girada g (−1 … 1).
  function f3cGalv(cx, cy, g) {
    var a = (90 - 55 * Math.max(-1, Math.min(1, g))) * RAD, L = 30;
    return '<circle class="axis" fill="none" stroke-width="2" cx="' + cx + '" cy="' + cy + '" r="36"/>' + arc(cx, cy + 8, 30, 35, 145, 'axis', 1.4) +
      seg('error', cx, cy + 8, cx + L * Math.cos(a), cy + 8 - L * Math.sin(a), 3) + dot('dot-ref', cx, cy + 8, 3.5) + text(cx, cy + 30, 'G', ' text-anchor="middle" font-size="15"');
  }

  /* ---------- S11 · El flujo por una espira inclinada: Φ = BA cos θ ---------- */
  D['f3s11-flux'] = function (s) {
    var th = num(s, 'th', 30), t = th * RAD, cx = 250, cy = 150, R = 95, o = '';
    for (var y = 50; y <= 250; y += 33) o += arrow('ref', 40, y, 400, 0, 2);
    // Espira de canto: un segmento perpendicular a su normal n̂.
    var nx = Math.cos(t), ny = -Math.sin(t);
    o += seg('aux', cx - R * ny, cy + R * nx, cx + R * ny, cy - R * nx, 7);
    o += arrow('error', cx, cy, 85 * nx, 85 * ny, 3.4) + text(cx + 98 * nx + 4, cy + 98 * ny + 8, 'n̂', ' font-size="22"');
    if (th > 3) o += arc(cx, cy, 46, 0, th, 'axis', 1.8) + text(cx + 58 * Math.cos(t / 2), cy - 58 * Math.sin(t / 2) + 6, 'θ', ' font-size="20"');
    o += text(452, 56, 'B', ' font-size="22"');
    o += text(470, 130, 'Φ = BA cos θ', ' font-size="21"') + text(470, 165, 'cos θ = ' + Math.cos(t).toFixed(2), ' font-size="19"');
    o += text(470, 200, th >= 89 ? 'B no la atraviesa' : th < 1 ? 'flujo máximo' : 'pasa una parte', ' font-size="18"');
    return svgBox('0 20 640 260', 'Una espira vista de canto en un campo uniforme B que va hacia la derecha. Su normal forma un ángulo theta con B; el flujo vale B por A por coseno de theta: máximo si la normal es paralela a B y cero si es perpendicular.', o);
  };

  /* ---------- S11 · Tres formas de cambiar el flujo ---------- */
  D['f3s11-ways'] = function () {
    var o = '';
    // 1) B crece: más ⊗ y más marcados.
    o += f3cGrid(45, 70, 165, 190, 40, true, 6) + '<circle class="ref" fill="none" stroke-width="3.5" cx="105" cy="130" r="58"/>';
    o += text(105, 238, 'cambia B', ' text-anchor="middle" font-size="19"') + text(105, 262, 'B sube o baja', ' text-anchor="middle" font-size="16"');
    // 2) El área crece.
    o += f3cGrid(255, 70, 375, 190, 40, true, 6) + '<circle class="ref" fill="none" stroke-width="3.5" cx="315" cy="130" r="38"/>' + '<circle class="student" fill="none" stroke-width="2.4" cx="315" cy="130" r="60"/>';
    o += text(315, 238, 'cambia A', ' text-anchor="middle" font-size="19"') + text(315, 262, 'la espira crece', ' text-anchor="middle" font-size="16"');
    // 3) La espira gira.
    o += f3cGrid(465, 70, 585, 190, 40, true, 6) + '<ellipse class="ref" fill="none" stroke-width="3.5" cx="525" cy="130" rx="24" ry="58"/>' + arc(525, 130, 70, 60, 120, 'axis', 1.8) + arrow('axis', 490, 70, -6, 5, 1.8);
    o += text(525, 238, 'cambia θ', ' text-anchor="middle" font-size="19"') + text(525, 262, 'la espira gira', ' text-anchor="middle" font-size="16"');
    o += text(320, 40, 'Φ = BA cos θ cambia si cambia cualquiera de los tres', ' text-anchor="middle" font-size="18"');
    return svgBox('0 15 640 260', 'Tres formas de cambiar el flujo magnético por una espira en un campo que entra en la página: cambiar la intensidad del campo, cambiar el área de la espira o girarla para cambiar el ángulo.', o);
  };

  /* ---------- S11 · El experimento de Faraday: imán y bobina (explainer) ----------
     state: m (posición del imán, 0 lejos … 1 cerca), v (velocidad: + se acerca, − se aleja), cap (texto). */
  D['f3s11-faraday'] = function (s) {
    var m = clamp01(num(s, 'm', 0.3)), v = num(s, 'v', 0), o = '';
    var mx = 70 + 120 * m;
    o += f3Bar(mx, 140, 120, 40, false);
    if (Math.abs(v) > 0.05) o += arrow('student', mx - 30, 92, v > 0 ? 60 : -60, 0, 3);
    o += f3cCoil(300, 430, 140, 52, 6);
    o += poly('axis', [[310, 192], [310, 250], [540, 250], [540, 186]], 2.2) + poly('axis', [[420, 88], [420, 60], [540, 60], [540, 94]], 2.2);
    o += f3cGalv(540, 140, v);
    o += text(320, 288, s && s.cap ? s.cap : (Math.abs(v) < 0.05 ? 'el imán está quieto: no hay corriente' : v > 0 ? 'el imán se acerca: la aguja se mueve a un lado' : 'el imán se aleja: la aguja se mueve al otro'), ' text-anchor="middle" font-size="18"');
    return svgBox('0 30 640 270', 'Un imán de barra frente a una bobina conectada a un galvanómetro. Solo hay corriente mientras el imán se mueve: al acercarlo la aguja se desvía hacia un lado y al alejarlo hacia el otro.', o);
  };

  /* ---------- S11 · Barra sobre rieles (fem de movimiento) ----------
     state: x (0–1, posición de la barra), area (0–1), cur (0–1: corriente), F (0–1: fuerza), cap. */
  D['f3s11-rails'] = function (s) {
    var x = clamp01(num(s, 'x', 0.5)), area = clamp01(num(s, 'area', 1)), cur = clamp01(num(s, 'cur', 1)), Fo = clamp01(num(s, 'F', 1));
    var x0 = 80, x1 = 600, yT = 70, yB = 210, bx = x0 + 60 + (x1 - x0 - 100) * x, o = '';
    o += fade('<rect class="area-fill" x="' + (x0 + 2) + '" y="' + (yT + 2) + '" width="' + r1(bx - x0 - 4) + '" height="' + (yB - yT - 4) + '"/>', area);
    o += f3cGrid(110, 95, 590, 190, 48, true, 7);
    o += seg('axis', x0, yT, x1, yT, 3) + seg('axis', x0, yB, x1, yB, 3);
    o += seg('axis', x0, yT, x0, yT + 40, 2.6) + f3cZig(x0, yT + 40, x0, yB - 40) + seg('axis', x0, yB - 40, x0, yB, 2.6) + text(x0 - 14, (yT + yB) / 2 + 7, 'R', ' text-anchor="end" font-size="21"');
    o += seg('ref', bx, yT - 14, bx, yB + 14, 7) + arrow('student', bx + 10, yT - 30, 60, 0, 3) + text(bx + 80, yT - 24, 'v', ' font-size="20"');
    o += text(bx + 14, yB + 34, 'L', ' font-size="20"') + text((x0 + bx) / 2, yB + 34, 'x', ' text-anchor="middle" font-size="20"');
    o += fade(arrow('trace', bx + 18, yB - 24, 0, -(yB - yT - 48), 3.2) + text(bx + 28, (yT + yB) / 2 + 6, 'I', ' font-size="20"') +
      arrow('trace', x0 + 14, yT + 50, 0, yB - yT - 100, 2.4), cur);
    o += fade(arrow('error', bx - 10, (yT + yB) / 2, -70, 0, 3.4) + text(bx - 30, (yT + yB) / 2 - 12, 'F', ' text-anchor="end" font-size="20"'), Fo);
    o += text(x0 + 4, 26, 'B ⊗ entra en la página', ' font-size="17"');
    if (s && s.cap) o += text(320, 282, s.cap, ' text-anchor="middle" font-size="18"');
    return svgBox('0 8 640 287', 'Vista desde arriba: dos rieles unidos por un resistor R y una barra de largo L que se desliza hacia la derecha con rapidez v, en un campo magnético que entra en la página. El área del circuito crece; la corriente inducida sube por la barra y la fuerza magnética sobre ella apunta hacia atrás.', o);
  };

  /* ---------- S11 · La fem es menos la pendiente del flujo ----------
     state: t (0–1, fracción de un periodo). Arriba Φ(t) = Φₘ sen(2πt); abajo ε = −dΦ/dt. */
  D['f3s11-slope'] = function (s) {
    var t = clamp01(num(s, 't', 0.15)), o = '';
    var X = function (u) { return 80 + 500 * u; }, Y1 = function (f) { return 85 - 50 * f; }, Y2 = function (f) { return 225 - 50 * f; };
    var top = [], bot = [];
    for (var i = 0; i <= 120; i++) { var u = i / 120; top.push([X(u), Y1(Math.sin(2 * Math.PI * u))]); bot.push([X(u), Y2(-Math.cos(2 * Math.PI * u))]); }
    o += arrow('axis', 80, 85, 520, 0, 1.4) + arrow('axis', 80, 225, 520, 0, 1.4) + seg('axis', 80, 25, 80, 145, 1.4) + seg('axis', 80, 165, 80, 285, 1.4);
    o += poly('ref', top, 3) + poly('trace', bot, 3);
    o += text(70, 40, 'Φ', ' text-anchor="end" font-size="20"') + text(70, 180, 'ε', ' text-anchor="end" font-size="20"');
    o += text(598, 80, 't', ' font-size="18"') + text(598, 220, 't', ' font-size="18"');
    var f = Math.sin(2 * Math.PI * t), d = Math.cos(2 * Math.PI * t), px = X(t), py = Y1(f), k = -50 * d * 2 * Math.PI / 500;
    o += seg('error', px - 70, py - 70 * k, px + 70, py + 70 * k, 2.4) + dot('dot-error', px, py, 6);
    o += seg('error', px, py, px, Y2(-d), 1.4, '5 5') + dot('dot-error', px, Y2(-d), 6);
    o += text(610, 30, 'ε = −N × (pendiente de Φ)', ' text-anchor="end" font-size="17"');
    return svgBox('0 15 640 280', 'Arriba, el flujo por una bobina contra el tiempo, con una recta tangente en el instante marcado. Abajo, la fem: vale menos la pendiente del flujo, así que es máxima donde el flujo cruza el cero y vale cero donde el flujo tiene un pico.', o);
  };


  /* ══════════════════════ fin S11 ══════════════════════ */

  /* ══════════════════════ S12 ══════════════════════ */
  // Flechas de circulación sobre un círculo: dir 'ccw' (antihorario en pantalla) o 'cw'.
  function f3cCirc(cx, cy, R, dir, cls) {
    var o = '', s = dir === 'ccw' ? 1 : -1;
    for (var k = 0; k < 4; k++) {
      var a0 = (k * 90 + 20) * RAD, a1 = a0 + 50 * RAD;
      var p0 = [cx + R * Math.cos(a0), cy - s * R * Math.sin(a0)], p1 = [cx + R * Math.cos(a1), cy - s * R * Math.sin(a1)];
      o += '<path class="' + cls + '" fill="none" stroke-width="3.2" stroke-linecap="round" d="M' + r1(p0[0]) + ' ' + r1(p0[1]) + 'A' + R + ' ' + R + ' 0 0 ' + (s > 0 ? 0 : 1) + ' ' + r1(p1[0]) + ' ' + r1(p1[1]) + '"/>';
      var tg = [-Math.sin(a1), -s * Math.cos(a1)], nr = [Math.cos(a1), -s * Math.sin(a1)];
      o += poly(cls, [[p1[0] - 11 * tg[0] + 6 * nr[0], p1[1] - 11 * tg[1] + 6 * nr[1]], p1, [p1[0] - 11 * tg[0] - 6 * nr[0], p1[1] - 11 * tg[1] - 6 * nr[1]]], 3);
    }
    return o;
  }

  /* ---------- S12 · El imán y la espira: la espira se opone (explainer) ----------
     state: m (posición del imán 0 lejos … 1 cerca), v (+1 se acerca, −1 se aleja, 0 quieto), ind (0–1: mostrar lo inducido). */
  D['f3s12-lenz'] = function (s) {
    var m = clamp01(num(s, 'm', 0.5)), v = num(s, 'v', 1), ind = clamp01(num(s, 'ind', 1)), o = '';
    var lx = 400, cy = 140, mx = 250 - 150 * (1 - m);
    // Imán con la N a la derecha (hacia la espira).
    o += f3Bar(mx, cy, 130, 40, false);
    if (Math.abs(v) > 0.05) o += arrow('student', mx - 25, cy - 42, v > 0 ? 50 : -50, 0, 3) + text(mx, cy - 56, v > 0 ? 'se acerca' : 'se aleja', ' text-anchor="middle" font-size="16"');
    // Campo del imán en la espira (hacia la derecha) y espira de canto.
    o += arrow('aux', lx - 70, cy + 70, 50, 0, 2.4) + text(lx - 45, cy + 96, f3cSub('B', 'imán'), ' text-anchor="middle" font-size="17"');
    o += '<ellipse class="ref" fill="none" stroke-width="4" cx="' + lx + '" cy="' + cy + '" rx="12" ry="62"/>';
    // Lo inducido: al acercarse el campo inducido apunta a la izquierda (cara N hacia el imán); al alejarse, a la derecha.
    if (Math.abs(v) > 0.05) {
      var left = v > 0;
      o += fade(arrow('trace', lx + (left ? 20 : -20), cy, left ? -60 : 60, 0, 3.4) + text(lx + (left ? -50 : 60), cy - 14, f3cSub('B', 'ind'), ' text-anchor="middle" font-size="17"') +
        text(lx + 30, cy - 76, left ? 'la espira presenta una cara N: repele' : 'la espira presenta una cara S: atrae', ' text-anchor="middle" font-size="16"'), ind);
    }
    // Vista de frente desde el imán (a la derecha).
    var fx0 = 560, fy = 140;
    o += text(fx0, 52, 'visto desde el imán', ' text-anchor="middle" font-size="15"');
    o += '<circle class="ref" fill="none" stroke-width="4" cx="' + fx0 + '" cy="' + fy + '" r="48"/>';
    if (Math.abs(v) > 0.05) o += fade(f3cCirc(fx0, fy, 60, v > 0 ? 'ccw' : 'cw', 'trace') + f3cB(fx0, fy, 10, v < 0, 'trace'), ind);
    o += text(320, 270, Math.abs(v) < 0.05 ? 'sin movimiento no hay cambio de flujo ni corriente' : v > 0 ? 'Φ crece → la corriente inducida se opone: empuja al imán' : 'Φ decrece → la corriente inducida lo “sostiene”: jala al imán', ' text-anchor="middle" font-size="17"');
    return svgBox('0 30 640 255', 'Un imán con su polo N hacia una espira. Al acercarlo, la corriente inducida produce un campo opuesto al del imán y la espira lo repele; al alejarlo, el campo inducido apunta igual que el del imán y la espira lo atrae. A la derecha, la corriente vista desde el imán: antihoraria al acercarse, horaria al alejarse.', o);
  };

  /* ---------- S12 · Regla de la mano derecha para una espira ---------- */
  D['f3s12-rhr'] = function () {
    var o = '';
    o += '<circle class="ref" fill="none" stroke-width="4" cx="160" cy="130" r="70"/>' + f3cCirc(160, 130, 84, 'ccw', 'trace') + f3cB(160, 130, 14, false, 'error');
    o += text(160, 246, 'antihoraria → B sale (⊙)', ' text-anchor="middle" font-size="18"');
    o += '<circle class="ref" fill="none" stroke-width="4" cx="480" cy="130" r="70"/>' + f3cCirc(480, 130, 84, 'cw', 'trace') + f3cB(480, 130, 14, true, 'error');
    o += text(480, 246, 'horaria → B entra (⊗)', ' text-anchor="middle" font-size="18"');
    o += text(320, 34, 'dedos en el sentido de la corriente; el pulgar da B en el centro', ' text-anchor="middle" font-size="17"');
    return svgBox('0 15 640 250', 'Regla de la mano derecha para una espira vista de frente: si la corriente circula en sentido antihorario, el campo en el centro sale de la página; si circula en sentido horario, entra.', o);
  };

  /* ---------- S12 · Los cuatro casos de Lenz ---------- */
  D['f3s12-cases'] = function () {
    var o = '', cases = [
      { x: 90, out: true, up: true }, { x: 250, out: true, up: false }, { x: 410, out: false, up: true }, { x: 570, out: false, up: false }
    ];
    cases.forEach(function (c) {
      var big = c.up ? 1 : 0.45;
      o += f3cB(c.x - 30, 80, 6 + 4 * big, !c.out) + text(c.x + 2, 86, '→', ' text-anchor="middle" font-size="20"') + f3cB(c.x + 34, 80, 6 + 4 * (c.up ? 1.6 : 0.2), !c.out);
      o += text(c.x, 48, (c.out ? 'sale' : 'entra') + ' y ' + (c.up ? 'crece' : 'decrece'), ' text-anchor="middle" font-size="16"');
      var indOut = c.out !== c.up;       // se opone al cambio
      o += '<circle class="ref" fill="none" stroke-width="3" cx="' + c.x + '" cy="170" r="44"/>' + f3cCirc(c.x, 170, 54, indOut ? 'ccw' : 'cw', 'trace') + f3cB(c.x, 170, 9, !indOut, 'trace');
      o += text(c.x, 252, f3cSub('B', 'ind') + (indOut ? ' sale' : ' entra'), ' text-anchor="middle" font-size="16"') + text(c.x, 274, indOut ? 'antihoraria' : 'horaria', ' text-anchor="middle" font-size="16"');
    });
    return svgBox('0 25 640 260', 'Cuatro casos: campo que sale y crece, sale y decrece, entra y crece, entra y decrece. El campo inducido se opone al cambio: si el flujo crece apunta al revés del campo externo; si decrece, apunta igual. La corriente inducida sale con la regla de la mano derecha.', o);
  };

  /* ---------- S12 · Campo eléctrico inducido en una región circular ---------- */
  D['f3s12-efield'] = function () {
    var o = '', cx = 160, cy = 150, R = 70;
    o += '<circle class="rect-fill" cx="' + cx + '" cy="' + cy + '" r="' + R + '"/>';
    for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) if (a * a + b * b <= 2) o += f3cB(cx + a * 32, cy + b * 32, 6, true);
    [40, 70, 110].forEach(function (r) { o += '<circle class="axis" fill="none" stroke-width="1.2" stroke-dasharray="5 6" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>'; });
    [40, 70, 110].forEach(function (r) {
      var L = r <= R ? 0.35 * r : 0.35 * R * R / r;
      [0, 90, 180, 270].forEach(function (g) {
        var t = g * RAD, px = cx + r * Math.cos(t), py = cy - r * Math.sin(t);
        o += arrow('error', px, py, -L * Math.sin(t), -L * Math.cos(t), 2.6);      // antihorario: B entra y crece
      });
    });
    o += text(cx, 290, 'B ⊗ crece: E da vueltas', ' text-anchor="middle" font-size="17"');
    // Gráfica E(r).
    var X = function (r) { return 360 + r * 2; }, Y = function (e) { return 250 - e * 2.4; };
    o += arrow('axis', 360, 250, 260, 0, 1.4) + arrow('axis', 360, 250, 0, -200, 1.4);
    var pts = [];
    for (var r = 0; r <= 125; r += 2.5) pts.push([X(r), Y(r <= R ? 0.85 * r : 0.85 * R * R / r)]);
    o += poly('error', pts, 3) + seg('axis', X(R), 250, X(R), Y(0.85 * R), 1.2, '5 5');
    o += text(X(R), 272, 'R', ' text-anchor="middle" font-size="18"') + text(616, 268, 'r', ' font-size="18"') + text(350, 64, 'E', ' text-anchor="end" font-size="19"');
    o += text(630, 44, 'adentro: E = (r/2)·dB/dt', ' text-anchor="end" font-size="16"') + text(630, 70, 'afuera: ' + f3cSup('E = R', '2') + '/(2r)·dB/dt', ' text-anchor="end" font-size="16"');
    return svgBox('0 25 640 280', 'Una región circular con un campo magnético que entra y crece. Fuera y dentro de ella aparece un campo eléctrico inducido que da vueltas en círculos. Su tamaño crece en línea recta con r dentro de la región y baja como 1 entre r fuera de ella.', o);
  };

  /* ---------- S12 · Generador: bobina que gira en B (explainer) ----------
     state: wt (ángulo ωt en grados). Φ = BA cos ωt, ε = NBAω sen ωt. */
  D['f3s12-generator'] = function (s) {
    var wt = num(s, 'wt', 60), t = wt * RAD, o = '', cx = 150, cy = 150, R = 80;
    for (var y = 70; y <= 230; y += 40) o += arrow('aux', 30, y, 250, 0, 1.8);
    o += text(290, 76, 'B', ' font-size="20"');
    // Bobina de canto que gira: su normal n̂ forma ωt con B.
    var nx = Math.cos(t), ny = -Math.sin(t);
    o += seg('ref', cx - R * ny, cy + R * nx, cx + R * ny, cy - R * nx, 8) + dot('dot-ref', cx, cy, 5);
    o += arrow('error', cx, cy, 70 * nx, 70 * ny, 3.2) + text(cx + 84 * nx, cy + 84 * ny + 6, 'n̂', ' text-anchor="middle" font-size="20"');
    o += arc(cx, cy, 34, 0, ((wt % 360) + 360) % 360, 'axis', 1.6) + text(cx + 54, cy - 10, 'ωt', ' font-size="18"');
    // Gráficas de Φ y ε contra ωt (0 a 360°).
    var X = function (a) { return 340 + a * 0.75; }, Yp = function (f) { return 95 - 45 * f; }, Ye = function (f) { return 225 - 45 * f; }, pp = [], pe = [];
    for (var a = 0; a <= 360; a += 6) { pp.push([X(a), Yp(Math.cos(a * RAD))]); pe.push([X(a), Ye(Math.sin(a * RAD))]); }
    o += seg('axis', 340, 95, 615, 95, 1.2) + seg('axis', 340, 225, 615, 225, 1.2) + poly('aux', pp, 2.6) + poly('trace', pe, 3);
    var aw = ((wt % 360) + 360) % 360;
    o += dot('dot-error', X(aw), Yp(Math.cos(aw * RAD)), 5) + dot('dot-error', X(aw), Ye(Math.sin(aw * RAD)), 6) + seg('error', X(aw), 45, X(aw), 275, 1.2, '4 5');
    o += text(332, 60, 'Φ = BA cos ωt', ' text-anchor="end" font-size="15"') + text(332, 190, 'ε = NBAω sen ωt', ' text-anchor="end" font-size="15"');
    o += text(620, 112, 'ωt', ' text-anchor="end" font-size="15"') + text(620, 242, 'ωt', ' text-anchor="end" font-size="15"');
    return svgBox('0 30 640 255', 'Una bobina gira en un campo magnético uniforme; su normal forma un ángulo omega t con el campo. El flujo va como coseno de omega t y la fem como seno de omega t: la fem es máxima cuando el plano de la bobina es paralelo al campo y el flujo es cero.', o);
  };


  /* ══════════════════════ fin S12 ══════════════════════ */

  /* ══════════════════════ S13 ══════════════════════ */
  // Inductor en zigzag de rizos (símbolo de bobina) de (x1, y) a (x2, y), con n rizos.
  function f3cInd(x1, x2, y, n, cls) {
    var d = '', w = (x2 - x1) / n;
    for (var i = 0; i < n; i++) { var a = x1 + i * w; d += (i ? '' : 'M' + r1(a) + ' ' + r1(y)) + 'A' + r1(w / 2) + ' ' + r1(w * 0.75) + ' 0 0 1 ' + r1(a + w) + ' ' + r1(y); }
    return '<path class="' + (cls || 'ref') + '" fill="none" stroke-width="2.6" d="' + d + '"/>';
  }

  /* ---------- S13 · La bobina se opone a su propio cambio (explainer) ----------
     state: c (−1 decrece, 0 constante, 1 crece), on (0–1 muestra la fem). */
  D['f3s13-self'] = function (s) {
    var c = num(s, 'c', 1), on = clamp01(num(s, 'on', 1)), o = '', cy = 130;
    o += f3cCoil(200, 440, cy, 50, 9);
    var big = 0.35 + 0.45 * (c > 0.5 ? 1 : c < -0.5 ? 0.3 : 0.65);
    [-26, 0, 26].forEach(function (dy) { o += fade(arrow('aux', 160, cy + dy, 320, 0, 2), big); });
    o += text(495, cy - 30, 'B propio', ' font-size="16"');
    o += poly('axis', [[120, cy], [200, cy - 2]], 2.4) + poly('axis', [[440, cy - 2], [520, cy]], 2.4);
    o += arrow('trace', 60, cy - 26, 52, 0, 3.2) + text(86, cy - 40, 'I', ' text-anchor="middle" font-size="20"');
    o += text(86, cy + 40, c > 0.5 ? 'I crece' : c < -0.5 ? 'I decrece' : 'I constante', ' text-anchor="middle" font-size="17"');
    if (Math.abs(c) > 0.5) {
      // La fem autoinducida empuja en contra del cambio de I.
      var against = c > 0;
      o += fade(arrow('error', against ? 420 : 220, cy + 82, against ? -200 : 200, 0, 3.4) + text(320, cy + 112, against ? 'la fem se opone al aumento de I' : 'la fem empuja para sostener I', ' text-anchor="middle" font-size="17"') +
        text(196, cy - 66, against ? '+' : '−', ' text-anchor="middle" font-size="24"') + text(444, cy - 66, against ? '−' : '+', ' text-anchor="middle" font-size="24"'), on);
    } else o += text(320, cy + 112, 'el flujo no cambia: no hay fem autoinducida', ' text-anchor="middle" font-size="17"');
    return svgBox('0 40 640 220', 'Una bobina con corriente produce su propio campo magnético. Si la corriente crece, la fem autoinducida se opone al aumento; si decrece, empuja para sostenerla; si es constante, no hay fem.', o);
  };

  /* ---------- S13 · Polaridad de la fem en un inductor ---------- */
  D['f3s13-polarity'] = function () {
    var o = '';
    [{ y: 70, up: true }, { y: 190, up: false }].forEach(function (r) {
      o += seg('axis', 60, r.y, 200, r.y, 2.4) + f3cInd(200, 360, r.y, 5) + seg('axis', 360, r.y, 420, r.y, 2.4);
      o += arrow('trace', 80, r.y - 22, 70, 0, 3) + text(115, r.y - 32, 'I', ' text-anchor="middle" font-size="19"');
      o += text(196, r.y + 30, r.up ? '+' : '−', ' text-anchor="middle" font-size="24"') + text(364, r.y + 30, r.up ? '−' : '+', ' text-anchor="middle" font-size="24"');
      o += text(280, r.y + 38, 'L', ' text-anchor="middle" font-size="19"');
      o += text(440, r.y - 6, r.up ? 'dI/dt > 0' : 'dI/dt < 0', ' font-size="18"') + text(440, r.y + 18, r.up ? 'el voltaje baja al cruzar L' : 'el voltaje sube al cruzar L', ' font-size="16"');
    });
    return svgBox('0 25 640 215', 'Un inductor en un circuito con la corriente hacia la derecha. Si la corriente crece, el lado por donde entra queda positivo y el voltaje baja al cruzar el inductor; si la corriente decrece, la polaridad se invierte.', o);
  };

  /* ---------- S13 · Solenoide: N vueltas, área A, largo ℓ ---------- */
  D['f3s13-solenoid'] = function () {
    var o = '', x0 = 150, x1 = 470, cy = 120, ry = 55;
    [-30, 0, 30].forEach(function (dy) { o += arrow('aux', 110, cy + dy, 410, 0, 2); });
    o += f3cCoil(x0, x1, cy, ry, 12);
    o += '<ellipse class="box-err" cx="' + (x0 + 6) + '" cy="' + cy + '" rx="12" ry="' + ry + '"/>' + text(x0 - 18, cy - ry - 8, 'A', ' text-anchor="middle" font-size="20"');
    o += arrow('axis', (x0 + x1) / 2 - 10, cy + ry + 24, x0 - (x0 + x1) / 2 + 12, 0, 1.6) + arrow('axis', (x0 + x1) / 2 + 10, cy + ry + 24, x1 - (x0 + x1) / 2 - 12, 0, 1.6) + text((x0 + x1) / 2, cy + ry + 30, 'ℓ', ' text-anchor="middle" font-size="20"');
    o += text(536, cy - 34, 'B = μ₀NI/ℓ', ' font-size="17"') + text(536, cy - 6, 'Φ = BA', ' font-size="17"') + text(536, cy + 22, 'NΦ = LI', ' font-size="17"');
    o += text((x0 + x1) / 2, 32, 'N vueltas', ' text-anchor="middle" font-size="18"');
    return svgBox('0 10 640 230', 'Un solenoide de N vueltas, largo l y área transversal A. Dentro el campo es uniforme, B igual a mu cero N I entre l; cada vuelta atraviesa el flujo B por A, y el enlace de flujo N por Phi es igual a L por I.', o);
  };

  /* ---------- S13 · La fem es −L por la pendiente de I(t) ---------- */
  D['f3s13-graphs'] = function () {
    var o = '', X = function (t) { return 90 + t * 100; }, Yi = function (v) { return 110 - v * 60; }, Ye = function (v) { return 230 - v * 30; };
    // I(t): sube de 0 a 1 entre t = 0 y 2, se queda en 1 hasta 3, baja a 0 en 4.
    var pts = [[0, 0], [2, 1], [3, 1], [4, 0], [5, 0]];
    o += arrow('axis', 90, 110, 530, 0, 1.4) + arrow('axis', 90, 230, 530, 0, 1.4) + seg('axis', 90, 40, 90, 120, 1.4) + seg('axis', 90, 170, 90, 290, 1.4);
    o += poly('ref', pts.map(function (p) { return [X(p[0]), Yi(p[1])]; }), 3);
    o += poly('trace', [[X(0), Ye(-0.5)], [X(2), Ye(-0.5)], [X(2), Ye(0)], [X(3), Ye(0)], [X(3), Ye(1)], [X(4), Ye(1)], [X(4), Ye(0)], [X(5), Ye(0)]], 3);
    o += text(80, 52, 'I', ' text-anchor="end" font-size="19"') + text(80, 182, 'ε', ' text-anchor="end" font-size="19"');
    o += text(X(1), Ye(-0.5) + 26, 'I crece: ε < 0', ' text-anchor="middle" font-size="15"') + text(X(2.5), Ye(0) - 10, 'ε = 0', ' text-anchor="middle" font-size="15"') + text(X(3.5), Ye(1) - 10, 'I baja: ε > 0', ' text-anchor="middle" font-size="15"');
    o += text(612, 106, 't', ' font-size="17"') + text(612, 226, 't', ' font-size="17"');
    return svgBox('0 25 640 285', 'Arriba, la corriente en un inductor: sube en línea recta, se queda constante y luego baja más rápido. Abajo, la fem autoinducida: negativa mientras sube, cero mientras es constante y positiva y más grande mientras baja rápido.', o);
  };

  /* ---------- S13 · Detalle: inductancia mutua entre dos bobinas ---------- */
  D['f3s13-mutual'] = function () {
    var o = '', cy = 120;
    o += f3cCoil(110, 270, cy, 50, 6) + f3cCoil(360, 520, cy, 50, 6, 'trace');
    [-24, 0, 24].forEach(function (dy) { o += arrow('aux', 80, cy + dy, 480, 0, 1.8); });
    o += text(190, 50, 'bobina 1: ' + f3cSub('N', '1') + ', ' + f3cSub('I', '1'), ' text-anchor="middle" font-size="17"') + text(440, 50, 'bobina 2: ' + f3cSub('N', '2'), ' text-anchor="middle" font-size="17"');
    o += text(320, 205, f3cSub('Φ', '21') + ': flujo de la bobina 1 en cada vuelta de la 2', ' text-anchor="middle" font-size="16"');
    o += text(320, 232, 'M = ' + f3cSub('N', '2') + f3cSub('Φ', '21') + '/' + f3cSub('I', '1') + ',   ' + f3cSub('ε', '2') + ' = −M d' + f3cSub('I', '1') + '/dt', ' text-anchor="middle" font-size="17"');
    return svgBox('0 25 640 225', 'Dos bobinas coaxiales. La corriente de la bobina 1 produce un flujo que atraviesa la bobina 2; si esa corriente cambia, se induce una fem en la bobina 2. La inductancia mutua M relaciona las dos.', o);
  };


  /* ══════════════════════ fin S13 ══════════════════════ */

  /* ══════════════════════ S14 ══════════════════════ */
  // Ejes de las gráficas de tiempo: t de 0 a 5τ en x = 100…600; y de 0 a 1 en y0…y0 − hy.
  function f3cAxes(y0, hy, ymark) {
    var o = arrow('axis', 100, y0, 520, 0, 1.6) + arrow('axis', 100, y0, 0, -(hy + 34), 1.6);
    for (var k = 1; k <= 5; k++) o += seg('axis', 100 + 100 * k, y0 - 5, 100 + 100 * k, y0 + 5, 1.4) + text(100 + 100 * k, y0 + 24, (k === 1 ? '' : k) + 'τ', ' text-anchor="middle" font-size="17"');
    o += text(92, y0 + 6, '0', ' text-anchor="end" font-size="16"') + text(614, y0 - 12, 't', ' text-anchor="end" font-size="18"');
    if (ymark) o += seg('axis', 95, y0 - hy, 105, y0 - hy, 1.4) + text(90, y0 - hy + 6, ymark, ' text-anchor="end" font-size="17"');
    return o;
  }
  function f3cCurve(f, y0, hy, t0, t1) {
    var p = [];
    for (var i = 0; i <= 100; i++) { var t = t0 + (t1 - t0) * i / 100; p.push([100 + 100 * t, y0 - hy * f(t)]); }
    return p;
  }

  /* ---------- S14 · Circuito RL con interruptor de dos posiciones ----------
     state: sw ('a' crece | 'b' decae | 'open'), x (t/τ, se anima), loop (0–1: recorrido de la malla), cap. */
  D['f3s14-circuit'] = function (s) {
    s = s || {};
    var sw = s.sw || 'a', x = Math.max(0, num(s, 'x', 0)), loop = num(s, 'loop', 0), d = sw === 'b';
    var cur = sw === 'open' ? 0 : d ? Math.exp(-x) : 1 - Math.exp(-x), vl = sw === 'open' ? 0 : Math.exp(-x);
    var yt = 50, yb = 190, xb = 70, xA = 200, xB = 210, yB = 86, xP = 250, xc = 480, cy = 120, o = '';
    o += poly('axis', [[xb, cy - 7], [xb, yt], [xA, yt]], 2.4) + seg('axis', xB, yB, xB, yb, 2.4);
    o += poly('axis', [[xP, yt], [310, yt]], 2.4) + poly('axis', [[370, yt], [xc, yt], [xc, cy - 40]], 2.4) + poly('axis', [[xc, cy + 40], [xc, yb], [xb, yb], [xb, cy + 7]], 2.4);
    o += seg('ref', xb - 20, cy - 7, xb + 20, cy - 7, 3) + seg('ref', xb - 10, cy + 7, xb + 10, cy + 7, 6);
    o += text(xb - 28, cy - 1, '+', ' text-anchor="end" font-size="20"') + text(xb + 28, cy + 7, 'ε', ' font-size="22"');
    o += dot('dot-ref', xA, yt, 4.5) + dot('dot-ref', xB, yB, 4.5) + dot('dot-ref', xP, yt, 4.5) + dot('dot-ref', xB, yb, 4.5);
    var tip = sw === 'a' ? [xA, yt] : sw === 'b' ? [xB, yB] : [xP - 40, yt - 28];
    o += seg('student', xP, yt, tip[0], tip[1], 3.4);
    o += text(xA - 4, yt - 14, 'a', ' text-anchor="end" font-size="18"') + text(xB - 10, yB + 22, 'b', ' text-anchor="end" font-size="18"');
    var zz = [[310, yt]];
    for (var i = 0; i < 6; i++) zz.push([315 + i * 10, yt + (i % 2 ? 9 : -9)]);
    zz.push([370, yt]);
    o += poly('ref', zz, 2.6) + text(340, yt - 20, 'R', ' text-anchor="middle" font-size="22"');
    // Inductor vertical de cy − 40 a cy + 40.
    var ind = 'M' + xc + ' ' + (cy - 40);
    for (var j = 0; j < 5; j++) ind += 'A9 12 0 0 1 ' + xc + ' ' + (cy - 40 + 16 * (j + 1));
    o += '<path class="ref" fill="none" stroke-width="2.6" d="' + ind + '"/>' + text(xc + 26, cy + 8, 'L', ' font-size="22"');
    if (cur > 0.005) {
      var op = Math.max(0.15, cur);
      o += fade(arrow('aux', 400, yt + 22, 50, 0, 3.2), op) + fade(text(425, yt + 48, 'I', ' text-anchor="middle" font-size="20"'), op);
    }
    if (loop > 0.01) {
      var lp = [];
      for (var m = 0; m <= 24; m++) { var a = (-100 + 300 * m / 24) * RAD; lp.push([330 + 26 * Math.cos(a), 128 + 26 * Math.sin(a)]); }
      o += fade(poly('trace', lp, 3) + arrow('trace', lp[22][0], lp[22][1], lp[24][0] - lp[22][0], lp[24][1] - lp[22][1], 3), loop);
    }
    var row = sw === 'open' ? 'interruptor abierto: no pasa corriente' : 'I = ' + cur.toFixed(2) + ' ε/R  ·  ' + f3cSub('V', 'L') + ' = ' + (d ? '−' : '') + vl.toFixed(2) + ' ε';
    o += text(320, 238, s.cap || row, ' text-anchor="middle" font-size="18"');
    return svgBox('0 0 640 256', 'Circuito RL: batería, interruptor con posiciones a y b, resistor R e inductor L', o);
  };

  /* ---------- S14 · Crecimiento y decaimiento de la corriente ---------- */
  D['f3s14-curves'] = function () {
    var y0 = 270, hy = 200, o = f3cAxes(y0, hy, 'ε/R');
    o += seg('axis', 100, y0 - hy, 600, y0 - hy, 1.4, '7 6');
    o += poly('ref', f3cCurve(function (t) { return 1 - Math.exp(-t); }, y0, hy, 0, 5), 3.4);
    o += poly('trace', f3cCurve(function (t) { return Math.exp(-t); }, y0, hy, 0, 5), 3, false, '9 7');
    o += dot('dot-ref', 200, y0 - hy * (1 - Math.exp(-1)), 6) + text(212, y0 - hy * (1 - Math.exp(-1)) + 22, '63 %', ' font-size="17"');
    o += dot('dot-trace', 200, y0 - hy * Math.exp(-1), 6) + text(212, y0 - hy * Math.exp(-1) - 10, '37 %', ' font-size="17"');
    o += text(116, 40, 'I', ' font-size="20"');
    o += text(600, 58, 'crece: I = (ε/R)(1 − ' + f3cSup('e', '−t/τ') + ')', ' text-anchor="end" font-size="17"') + text(600, 250, 'decae: I = ' + f3cSub('I', '0') + f3cSup('e', '−t/τ'), ' text-anchor="end" font-size="17"');
    return svgBox('0 20 640 285', 'La corriente en un circuito RL contra el tiempo. Al conectar la batería sube hacia épsilon entre R y en un tau llega al 63 por ciento; al quitar la batería decae y en un tau queda el 37 por ciento.', o);
  };

  /* ---------- S14 · Voltajes en R y en L al crecer ---------- */
  D['f3s14-volts'] = function () {
    var y0 = 270, hy = 200, o = f3cAxes(y0, hy, 'ε');
    o += seg('axis', 100, y0 - hy, 600, y0 - hy, 1.4, '7 6');
    o += poly('ref', f3cCurve(function (t) { return 1 - Math.exp(-t); }, y0, hy, 0, 5), 3.4);
    o += poly('trace', f3cCurve(function (t) { return Math.exp(-t); }, y0, hy, 0, 5), 3.4);
    var tx = 100 + 100 * Math.LN2;
    o += dot('dot-error', tx, y0 - hy / 2, 6) + seg('error', tx, y0 - hy / 2, tx, y0, 1.2, '4 5') + text(tx, y0 + 46, 'τ ln 2', ' text-anchor="middle" font-size="16"');
    o += text(116, 40, 'V', ' font-size="20"');
    o += text(560, y0 - hy * 0.93 + 28, f3cSub('V', 'R') + ' = IR', ' text-anchor="end" font-size="18"') + text(560, y0 - 22, f3cSub('V', 'L') + ' = ε' + f3cSup('e', '−t/τ'), ' text-anchor="end" font-size="18"');
    return svgBox('0 20 640 300', 'Al conectar la batería, el voltaje del inductor empieza en épsilon y decae, mientras el del resistor sube; siempre suman épsilon y se cruzan en tau por logaritmo de 2.', o);
  };

  /* ---------- S14 · RC contra RL ---------- */
  D['f3s14-compare'] = function () {
    var o = '', rows = [['', 'RC', 'RL'], ['τ', 'RC', 'L/R'], ['al conectar', 'C es un cable', 'L es un circuito abierto'], ['mucho después', 'C es circuito abierto', 'L es un cable'], ['lo que no salta', 'el voltaje de C', 'la corriente de L']];
    rows.forEach(function (r, i) {
      var y = 46 + i * 44;
      o += text(30, y, r[0], ' font-size="18"') + text(300, y, r[1], ' text-anchor="middle" font-size="18"') + text(510, y, r[2], ' text-anchor="middle" font-size="18"');
      if (i < rows.length - 1) o += seg('axis', 20, y + 18, 620, y + 18, 1, '3 6');
    });
    o += seg('axis', 175, 24, 175, 240, 1.2) + seg('axis', 410, 24, 410, 240, 1.2);
    return svgBox('0 15 640 235', 'Comparación entre los circuitos RC y RL: la constante de tiempo es RC en uno y L entre R en el otro; al conectar, el capacitor vacío es un cable y el inductor es un circuito abierto; mucho después es al revés. En el RC no salta el voltaje del capacitor; en el RL no salta la corriente del inductor.', o);
  };


  /* ══════════════════════ fin S14 ══════════════════════ */

  /* ══════════════════════ S15 ══════════════════════ */
  /* ---------- S15 · El trabajo para subir la corriente: área bajo LI (explainer) ----------
     state: I (0–1, la corriente actual como fracción de la final). */
  D['f3s15-build'] = function (s) {
    var f = clamp01(num(s, 'I', 1)), o = '', x0 = 100, y0 = 250, W = 420, H = 190;
    o += arrow('axis', x0, y0, W + 50, 0, 1.6) + arrow('axis', x0, y0, 0, -(H + 30), 1.6);
    o += text(x0 + W + 44, y0 + 26, 'I', ' text-anchor="end" font-size="20"') + text(x0 - 10, y0 - H - 14, 'LI', ' text-anchor="end" font-size="20"');
    o += seg('ref', x0, y0, x0 + W, y0 - H, 3);
    o += fill('area-fill', [[x0, y0], [x0 + W * f, y0], [x0 + W * f, y0 - H * f]]);
    if (f > 0.02) o += seg('error', x0 + W * f, y0, x0 + W * f, y0 - H * f, 1.6, '5 5') + dot('dot-error', x0 + W * f, y0 - H * f, 6);
    o += text(x0 + W * f * 0.62, y0 - H * f * 0.22 + 6, f > 0.25 ? 'U' : '', ' text-anchor="middle" font-size="20"');
    o += text(330, 40, 'dW = (LI) dI  →  U = ∫ LI dI = ½LI²', ' text-anchor="middle" font-size="18"');
    return svgBox('0 15 640 265', 'Gráfica de L por I contra la corriente: una recta. El trabajo para subir la corriente de cero a I es el área del triángulo bajo la recta, un medio de L por I al cuadrado.', o);
  };

  /* ---------- S15 · Densidad de energía en un solenoide ---------- */
  D['f3s15-density'] = function () {
    var o = '', x0 = 150, x1 = 470, cy = 125, ry = 60;
    o += '<rect class="area-fill" x="' + x0 + '" y="' + (cy - ry) + '" width="' + (x1 - x0) + '" height="' + (2 * ry) + '"/>';
    [-30, 0, 30].forEach(function (dy) { o += arrow('aux', 120, cy + dy, 380, 0, 2); });
    o += f3cCoil(x0, x1, cy, ry, 12);
    o += text(310, 40, 'u = B²/2μ₀ igual en todo el volumen Aℓ', ' text-anchor="middle" font-size="18"');
    o += text(310, 222, 'U = u · Aℓ = ½LI²', ' text-anchor="middle" font-size="19"');
    o += text(536, cy - 30, 'B = μ₀nI', ' font-size="17"') + text(536, cy - 2, 'adentro', ' font-size="15"') + text(536, cy + 34, 'afuera: B ≈ 0', ' font-size="15"');
    return svgBox('0 15 640 225', 'Un solenoide largo: dentro el campo es uniforme y la densidad de energía, B al cuadrado entre dos mu cero, es la misma en todo el volumen. Multiplicada por el volumen da un medio de L por I al cuadrado.', o);
  };

  /* ---------- S15 · Toroide: u cambia con r; capa de radio r y grosor dr ---------- */
  D['f3s15-toroid'] = function () {
    var o = '', cx = 200, cy = 140, a = 55, b = 115;
    for (var k = 0; k < 10; k++) {
      var r0 = a + (b - a) * k / 10, r1v = a + (b - a) * (k + 1) / 10, op = 0.75 * Math.pow(a / ((r0 + r1v) / 2), 2);
      o += '<path class="area-fill" opacity="' + op.toFixed(2) + '" fill-rule="evenodd" d="M' + (cx + r1v) + ' ' + cy + 'A' + r1v + ' ' + r1v + ' 0 1 0 ' + (cx - r1v) + ' ' + cy + 'A' + r1v + ' ' + r1v + ' 0 1 0 ' + (cx + r1v) + ' ' + cy + 'ZM' + (cx + r0) + ' ' + cy + 'A' + r0 + ' ' + r0 + ' 0 1 0 ' + (cx - r0) + ' ' + cy + 'A' + r0 + ' ' + r0 + ' 0 1 0 ' + (cx + r0) + ' ' + cy + 'Z"/>';
    }
    o += '<circle class="ref" fill="none" stroke-width="2.6" cx="' + cx + '" cy="' + cy + '" r="' + a + '"/><circle class="ref" fill="none" stroke-width="2.6" cx="' + cx + '" cy="' + cy + '" r="' + b + '"/>';
    o += '<circle class="error" fill="none" stroke-width="2" stroke-dasharray="5 4" cx="' + cx + '" cy="' + cy + '" r="85"/>';
    o += arrow('axis', cx, cy, a * 0.71, -a * 0.71, 1.4) + text(cx + 18, cy - 8, 'a', ' font-size="17"');
    o += arrow('axis', cx, cy, -b * 0.95, b * 0.31, 1.4) + text(cx - 70, cy + 40, 'b', ' font-size="17"');
    o += text(cx + 85 * 0.7 + 8, cy + 85 * 0.7 + 14, 'r', ' font-size="17"');
    o += text(360, 70, 'B = μ₀NI/2πr', ' font-size="18"') + text(360, 104, f3cSup('u = B', '2') + '/2μ₀ ∝ 1/' + f3cSup('r', '2'), ' font-size="18"');
    o += text(360, 146, 'capa: dV = 2πr h dr', ' font-size="17"') + text(360, 188, 'U = ∫u dV = (μ₀N²I²h/4π) ln(b/a)', ' font-size="17"');
    return svgBox('0 15 640 255', 'Toroide visto desde arriba, entre los radios a y b. La densidad de energía es mayor cerca del radio interior porque el campo baja como 1 entre r. Una capa delgada de radio r tiene volumen 2 pi r h dr; sumando las capas sale la energía.', o);
  };

  /* ---------- S15 · Potencias en el circuito RL al conectar ---------- */
  D['f3s15-powers'] = function () {
    var y0 = 270, hy = 200, o = f3cAxes(y0, hy, f3cSup('ε', '2') + '/R');
    o += poly('ref', f3cCurve(function (t) { return 1 - Math.exp(-t); }, y0, hy, 0, 5), 3.2);
    o += poly('aux', f3cCurve(function (t) { var i = 1 - Math.exp(-t); return i * i; }, y0, hy, 0, 5), 3);
    o += poly('trace', f3cCurve(function (t) { var i = 1 - Math.exp(-t); return i * Math.exp(-t); }, y0, hy, 0, 5), 3);
    o += text(560, y0 - hy * 0.97 - 10, 'batería: εI', ' text-anchor="end" font-size="17"') + text(600, y0 - hy * 0.86 + 26, 'resistor: ' + f3cSup('I', '2') + 'R', ' text-anchor="end" font-size="17"');
    o += text(160, y0 - hy * 0.25 - 14, 'inductor: LI dI/dt', ' font-size="17"');
    o += text(116, 40, 'P', ' font-size="20"');
    return svgBox('0 20 640 285', 'Potencias en un circuito RL al conectarlo. La batería entrega epsilon por I; una parte se disipa en el resistor y otra se guarda en el inductor. La del inductor sube y luego baja a cero cuando la corriente deja de cambiar.', o);
  };

  /* ---------- S15 · Detalle: circuito LC (la energía va y viene) ----------
     state: ph (fase en grados: 0 todo en C, 90 todo en L). */
  D['f3s15-lc'] = function (s) {
    var ph = num(s, 'ph', 45) * RAD, uc = Math.pow(Math.cos(ph), 2), ul = Math.pow(Math.sin(ph), 2), o = '';
    // Circuito: capacitor a la izquierda, inductor a la derecha.
    o += poly('axis', [[90, 100], [90, 40], [300, 40], [300, 70]], 2.4) + poly('axis', [[90, 120], [90, 190], [300, 190], [300, 160]], 2.4);
    o += seg('ref', 66, 100, 114, 100, 4) + seg('ref', 66, 120, 114, 120, 4) + text(56, 116, 'C', ' text-anchor="end" font-size="20"');
    var ind = 'M300 70';
    for (var j = 0; j < 5; j++) ind += 'A9 9 0 0 1 300 ' + (70 + 18 * (j + 1));
    o += '<path class="ref" fill="none" stroke-width="2.6" d="' + ind + '"/>' + text(322, 122, 'L', ' font-size="20"');
    // Barras de energía.
    o += '<rect class="box-err" x="400" y="' + (190 - 140 * uc).toFixed(1) + '" width="60" height="' + (140 * uc).toFixed(1) + '"/>' + '<rect class="box-aux" x="500" y="' + (190 - 140 * ul).toFixed(1) + '" width="60" height="' + (140 * ul).toFixed(1) + '"/>';
    o += seg('axis', 380, 190, 580, 190, 1.4) + text(430, 214, f3cSub('U', 'E') + ' (C)', ' text-anchor="middle" font-size="16"') + text(530, 214, f3cSub('U', 'B') + ' (L)', ' text-anchor="middle" font-size="16"');
    o += text(320, 248, 'ω = 1/√(LC): la energía pasa de C a L y de regreso', ' text-anchor="middle" font-size="17"');
    return svgBox('0 20 640 240', 'Un circuito LC: un capacitor y un inductor conectados. La energía pasa del campo eléctrico del capacitor al campo magnético del inductor y de regreso, con frecuencia angular uno entre raíz de L C.', o);
  };


  /* ══════════════════════ fin S15 ══════════════════════ */

  /* Figuras de los problemas de examen (data/fisica-3/exam-problems.js), ids f3exam-*. */
  /* ══════════════════════ Examen A ══════════════════════ */
  function f3aNum(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString().replace('-', '−'); }

  /* ---------- Brújula: Tierra al norte, imán A al este, imán B al sur ---------- */
  D['f3exam-brujula'] = function (s) {
    var a = num(s, 'a', 80), b = num(s, 'b', 20), body = '', cx = 300, cy = 150, k = 110 / Math.max(a, 50);
    body += '<circle class="axis" fill="none" stroke-width="1.6" cx="' + cx + '" cy="' + cy + '" r="22"/>';
    body += arrow('aux', cx, cy, 0, -50 * k, 3) + text(cx + 10, cy - 50 * k - 6, 'Tierra 50 µT', ' font-size="15"');
    body += arrow('ref', cx, cy, a * k, 0, 3) + text(cx + a * k + 8, cy + 20, 'A: ' + a + ' µT', ' font-size="15"');
    body += arrow('trace', cx, cy, 0, b * k, 3) + text(cx + 10, cy + b * k + 18, 'B: ' + b + ' µT', ' font-size="15"');
    body += text(560, 50, 'N', ' text-anchor="middle" font-size="18"') + arrow('axis', 560, 100, 0, -36, 1.6) + text(590, 104, 'E', ' font-size="18"') + arrow('axis', 560, 100, 26, 0, 1.6);
    return svgBox('0 0 640 290', 'Una brújula con tres campos: el de la Tierra de 50 microteslas hacia el norte, el del imán A de ' + a + ' microteslas hacia el este y el del imán B de ' + b + ' microteslas hacia el sur.', body);
  };

  /* ---------- Carga con v en el plano xy y B en +z ---------- */
  D['f3exam-lorentz'] = function (s) {
    var q = num(s, 'q', 2), vx = num(s, 'vx', 3), vy = num(s, 'vy', 2), body = '', cx = 280, cy = 160, k = 28;
    body += f3aGrid(80, 30, 500, 280, 46, true, 0.35);
    body += arrow('axis', 60, 270, 60, 0, 1.4) + text(128, 276, 'x', ' font-size="16"') + arrow('axis', 60, 270, 0, -60, 1.4) + text(56, 200, 'y', ' text-anchor="end" font-size="16"');
    body += arrow('ref', cx, cy, vx * k, -vy * k, 3.4) + text(cx + vx * k + 10, cy - vy * k, '<tspan font-style="italic">v</tspan>', ' font-size="18"');
    body += f3aCharge(cx, cy, q > 0, 12);
    body += text(620, 22, 'B en +z (sale de la hoja)', ' text-anchor="end" font-size="15"') + text(cx, cy + 40, 'q = ' + f3aNum(q, 0) + ' μC', ' text-anchor="middle" font-size="15"');
    return svgBox('0 0 640 300', 'Una carga de ' + q + ' microcoulombs con velocidad en el plano xy, de componentes ' + vx + ' y ' + vy + ' kilómetros por segundo, en un campo magnético que sale de la hoja.', body);
  };

  /* ---------- Espectrómetro con los datos ---------- */
  D['f3exam-espectro'] = function (s) {
    return D['f3s03-spectro']().replace('m₁', 'ion').replace(/<path class="error"[^>]*\/>/, '').replace(/<circle class="error"[^>]*\/>/, '').replace('m₂', '').replace('2r₂', 'd = 2r');
  };

  /* ---------- Selector y región de B2 ---------- */
  D['f3exam-selector'] = function (s) {
    var body = '', y = 110;
    body += '<rect class="box-err" x="60" y="60" width="220" height="8"/><rect class="box-aux" x="60" y="152" width="220" height="8"/>';
    body += f3aGrid(80, 85, 260, 140, 36, false, 0.35) + text(170, 50, 'E y B₁', ' text-anchor="middle" font-size="16"');
    body += seg('trace', 20, y, 300, y, 2.2) + arrow('ref', 30, y, 40, 0, 3) + f3aCharge(30, y, true, 9);
    body += seg('axis', 300, 20, 300, 280, 1.6, '5 5') + f3aGrid(330, 40, 610, 270, 40, false, 0.35) + text(470, 290, 'solo B₂', ' text-anchor="middle" font-size="16"');
    var pts = [];
    // Con B₂ entrando a la hoja, el protón que va a la derecha se curva hacia arriba.
    for (var i = 0; i <= 40; i++) { var a = Math.PI * i / 40; pts.push([300 + 45 * Math.sin(a), y - 45 + 45 * Math.cos(a)]); }
    body += poly('trace', pts, 2.4);
    return svgBox('0 0 640 300', 'Los protones pasan rectos por un selector con campos E y B1 cruzados y luego entran a una región con solo el campo B2, donde describen un arco de círculo.', body);
  };

  /* ---------- Ciclotrón ---------- */
  D['f3exam-ciclotron'] = function () { return D['f3s03-cyclotron'](); };

  /* ---------- Varilla entre rieles ---------- */
  D['f3exam-varilla'] = function () { return D['f3s04-rod'](); };

  /* ---------- Espira en D ---------- */
  D['f3exam-semicirculo'] = function (s) {
    var body = '', cx = 300, cy = 190, R = 120, pts = [];
    for (var i = 0; i <= 48; i++) { var a = Math.PI * i / 48; pts.push([cx - R * Math.cos(a), cy - R * Math.sin(a)]); }
    body += poly('ref', pts, 4) + seg('ref', cx - R, cy, cx + R, cy, 4);
    body += arrow('ref', cx - 10, cy - R, 20, 0, 3) + arrow('ref', cx + 10, cy, -20, 0, 3);
    body += text(cx, cy - R - 12, '<tspan font-style="italic">I</tspan>', ' text-anchor="middle" font-size="18"');
    body += seg('axis', cx, cy, cx + R * 0.7, cy - R * 0.7, 1.4, '4 4') + text(cx + R * 0.38, cy - R * 0.28, '<tspan font-style="italic">R</tspan>', ' font-size="18"');
    return svgBox('0 0 640 230', 'Una espira en forma de D: un semicírculo de radio R cerrado por su diámetro, con corriente I que recorre el arco y regresa por el diámetro.', body);
  };

  /* ---------- Bobina vista desde arriba, con el ángulo del plano ---------- */
  D['f3exam-espira'] = function (s) {
    var al = num(s, 'al', 30), body = '', cx = 300, cy = 150, R = 110, t = (90 - al) * RAD;
    for (var y = 40; y <= 260; y += 44) body += arrow('aux', 60, y, 480, 0, 1.4);
    body += text(560, 46, '<tspan font-style="italic">B</tspan>', ' font-size="18"');
    var u = [-Math.sin(t), Math.cos(t)];
    body += seg('ref', cx - u[0] * R, cy + u[1] * R, cx + u[0] * R, cy - u[1] * R, 4.4);
    body += arc(cx, cy, 50, 180 - al, 180, 'trace', 2) + text(cx - 70, cy - 14, al + '°', ' text-anchor="middle" font-size="16"');
    body += arrow('ref', cx, cy, Math.cos(t) * 70, -Math.sin(t) * 70, 2.6) + text(cx + Math.cos(t) * 86, cy - Math.sin(t) * 86 + 6, 'μ', ' text-anchor="middle" font-size="18"');
    return svgBox('0 0 640 290', 'La bobina vista desde arriba, de canto: su plano forma ' + al + ' grados con el campo, y su momento dipolar es perpendicular al plano.', body);
  };


  /* ══════════════════════ fin Examen A ══════════════════════ */

  /* ══════════════════════ Examen B ══════════════════════ */
  /* ---------- Examen B · Tramo recto ---------- */
  D['f3exam-tramo'] = function (s) {
    var a = num(s, 'a', 3), x1 = num(s, 'x1', -4), x2 = num(s, 'x2', 6), I = num(s, 'I', 5), b = '';
    var sc = Math.min(26, 250 / Math.max(-x1, x2, 1)), O = 320, y0 = 240, py = y0 - sc * a, X = function (x) { return O + sc * x; };
    b += seg('axis', 40, y0, 600, y0, 1, '4 6') + seg('ref', X(x1), y0, X(x2), y0, 5) + f3bChev('ref', X(x1) + 40, y0, 1, 0);
    b += text(X(x1) + 40, y0 + 26, 'I = ' + I + ' A', ' text-anchor="middle" font-size="16"');
    b += seg('axis', O, y0, O, py, 1.2, '3 5') + text(O + 8, (y0 + py) / 2 + 5, 'a = ' + a + ' cm', ' font-size="15"');
    b += seg('aux', O, py, X(x1), y0, 1.4, '5 5') + seg('aux', O, py, X(x2), y0, 1.4, '5 5');
    b += dot('dot-trace', O, py, 5) + text(O, py - 12, 'P', ' text-anchor="middle" font-size="18"');
    b += text(X(x1), y0 + 48, 'x₁ = ' + String(x1).replace('-', '−') + ' cm', ' text-anchor="middle" font-size="15"') + text(X(x2), y0 + 48, 'x₂ = ' + x2 + ' cm', ' text-anchor="middle" font-size="15"');
    return svgBox('0 0 640 300', 'Un tramo recto horizontal con corriente hacia la derecha, de x₁ = ' + x1 + ' cm a x₂ = ' + x2 + ' cm, y el punto P a ' + a + ' cm arriba del pie de la perpendicular, con líneas punteadas hacia los dos extremos.', b);
  };

  /* ---------- Examen B · Horquilla ---------- */
  D['f3exam-horquilla'] = function (s) {
    var R = num(s, 'R', 3), b = '', C = [400, 150], r = 80, pts = [];
    for (var i = 0; i <= 40; i++) { var t = (90 - 180 * i / 40) * RAD; pts.push([C[0] + r * Math.cos(t), C[1] - r * Math.sin(t)]); }
    b += seg('ref', 40, C[1] - r, C[0], C[1] - r, 4) + poly('ref', pts, 4) + seg('ref', C[0], C[1] + r, 40, C[1] + r, 4);
    b += f3bChev('ref', 200, C[1] - r, 1, 0) + f3bChev('ref', 200, C[1] + r, -1, 0) + f3bChev('ref', C[0] + r, C[1], 0, 1);
    b += dot('dot-trace', C[0], C[1], 5) + text(C[0] - 10, C[1] + 6, 'C', ' text-anchor="end" font-size="18"');
    b += seg('axis', C[0], C[1], C[0] + r * 0.71, C[1] - r * 0.71, 1.2, '3 5') + text(C[0] - 14, C[1] + 44, 'R = ' + R + ' cm', ' text-anchor="end" font-size="15"');
    b += seg('axis', C[0], C[1] - r - 10, C[0], C[1] + r + 10, 1, '2 5');
    b += text(120, 40, 'muy largos ←', ' font-size="15"');
    return svgBox('0 0 640 280', 'Un alambre en forma de horquilla: dos tramos rectos muy largos y paralelos, hacia la izquierda, unidos a la derecha por un semicírculo de radio ' + R + ' cm con centro C. Los tramos rectos terminan a la altura de C.', b);
  };

  /* ---------- Examen B · Bobina plana y punto en su eje ---------- */
  D['f3exam-bobina-eje'] = function (s) {
    var R = num(s, 'R', 5), z = num(s, 'z', 4), b = '', O = [300, 230], rx = 130, ry = 36, sz = Math.min(15, 170 / Math.max(z, 1)), P = [300, 230 - sz * z];
    b += seg('axis', O[0], 280, O[0], 20, 1.2, '4 6') + f3bRing(O[0], O[1], rx, ry, 'ref', 4, 1);
    b += seg('axis', O[0], O[1], O[0] + rx, O[1], 1.2, '3 5') + text(O[0] + rx / 2, O[1] - 8, 'R = ' + R + ' cm', ' text-anchor="middle" font-size="15"');
    b += dot('dot-trace', P[0], P[1], 5) + text(P[0] + 12, P[1] + 5, 'P', ' font-size="18"') + text(P[0] - 10, (O[1] + P[1]) / 2 + 5, 'z = ' + z + ' cm', ' text-anchor="end" font-size="15"');
    b += text(O[0] + rx + 14, O[1] + 10, 'N vueltas', ' font-size="15"');
    return svgBox('0 0 640 300', 'Una bobina plana circular de radio ' + R + ' cm vista en perspectiva, con su eje vertical, y un punto P en el eje a ' + z + ' cm del centro.', b);
  };

  /* ---------- Examen B · Dos alambres paralelos y P entre ellos ---------- */
  D['f3exam-paralelos'] = function (s) {
    var d = num(s, 'd', 8), x = Math.min(num(s, 'x', 2), d - 0.5), I1 = num(s, 'I1', 4), I2 = num(s, 'I2', 3), b = '', sc = 440 / d, X = function (u) { return 100 + sc * u; }, y = 150;
    b += seg('axis', 60, y, 580, y, 1, '4 6');
    b += f3bWire(X(0), y, 1, 'I₁ = ' + I1 + ' A') + f3bWire(X(d), y, -1, 'I₂ = ' + I2 + ' A');
    b += dot('dot-trace', X(x), y, 5) + text(X(x), y - 14, 'P', ' text-anchor="middle" font-size="18"');
    b += seg('axis', X(0), y + 60, X(x), y + 60, 1.2) + text((X(0) + X(x)) / 2, y + 80, x + ' cm', ' text-anchor="middle" font-size="15"');
    b += seg('axis', X(0), y - 50, X(d), y - 50, 1.2) + text((X(0) + X(d)) / 2, y - 58, 'd = ' + d + ' cm', ' text-anchor="middle" font-size="15"');
    return svgBox('0 0 640 260', 'Dos alambres perpendiculares a la página separados ' + d + ' cm: el 1 con corriente saliendo y el 2 entrando. El punto P está entre ellos, a ' + x + ' cm del alambre 1.', b);
  };

  /* ---------- Examen B · Dos alambres y un punto en la esquina ---------- */
  D['f3exam-esquina'] = function (s) {
    var d = num(s, 'd', 5), h = num(s, 'h', 4), I1 = num(s, 'I1', 4), I2 = num(s, 'I2', 3), b = '', sc = Math.min(50, 300 / Math.max(d, h)), O = [140, 250];
    var X = function (u) { return O[0] + sc * u; }, Y = function (u) { return O[1] - sc * u; };
    b += arrow('axis', X(0), Y(0), sc * d + 60, 0, 1.4) + arrow('axis', X(0), Y(0), 0, -sc * h - 40, 1.4);
    b += text(X(0) + sc * d + 70, Y(0) + 5, 'x', ' font-size="16"') + text(X(0) + 8, Y(0) - sc * h - 44, 'y', ' font-size="16"');
    b += seg('aux', X(d), Y(0), X(0), Y(h), 1.4, '5 5');
    b += f3bWire(X(0), Y(0), 1) + text(X(0) - 18, Y(0) + 30, 'I₁ = ' + I1 + ' A', ' text-anchor="middle" font-size="15"');
    b += f3bWire(X(d), Y(0), -1) + text(X(d), Y(0) + 34, 'I₂ = ' + I2 + ' A, (' + d + ', 0)', ' text-anchor="middle" font-size="15"');
    b += dot('dot-trace', X(0), Y(h), 5) + text(X(0) + 12, Y(h) - 8, 'P (0, ' + h + ')', ' font-size="16"');
    return svgBox('0 0 640 300', 'Ejes x e y en centímetros. En el origen, el alambre 1 con corriente saliendo; en (' + d + ', 0), el alambre 2 con corriente entrando; el punto P en (0, ' + h + ').', b);
  };

  /* ---------- Examen B · Coaxial ---------- */
  D['f3exam-coaxial'] = function (s) {
    var a = num(s, 'a', 2), bb = num(s, 'b', 6), c = bb + 1, r2 = num(s, 'r2', 4), body = '', C = [190, 155], k = 120 / c;
    body += '<circle class="box-aux" cx="' + C[0] + '" cy="' + C[1] + '" r="' + r1(c * k) + '"/><circle class="box-base" cx="' + C[0] + '" cy="' + C[1] + '" r="' + r1(bb * k) + '"/><circle class="box-err" cx="' + C[0] + '" cy="' + C[1] + '" r="' + r1(a * k) + '"/>';
    body += f3bOut(C[0], C[1], 7, true, 'error');
    [[a / 2, '1'], [r2, '2'], [bb + 0.5, '3']].forEach(function (q) { body += '<circle class="trace" fill="none" stroke-width="2" stroke-dasharray="5 5" cx="' + C[0] + '" cy="' + C[1] + '" r="' + r1(q[0] * k) + '"/>' + text(C[0] + q[0] * k * 0.71 + 3, C[1] + q[0] * k * 0.71 + 16, q[1], ' font-size="15"'); });
    body += text(360, 70, 'núcleo: a = ' + a + ' mm (sale I)', ' font-size="16"') + text(360, 98, 'forro: de ' + bb + ' a ' + c + ' mm (regresa I)', ' font-size="16"');
    body += text(360, 140, 'círculo 1: r = ' + fx3(a / 2) + ' mm', ' font-size="15"') + text(360, 164, 'círculo 2: r = ' + fx3(r2) + ' mm', ' font-size="15"') + text(360, 188, 'círculo 3: r = ' + fx3(bb + 0.5) + ' mm', ' font-size="15"');
    return svgBox('0 0 640 300', 'Corte de un cable coaxial: núcleo de radio ' + a + ' mm y forro de ' + bb + ' a ' + c + ' mm, con tres círculos punteados donde se pide el campo.', body);
  };
  function fx3(v) { return Number((+v).toFixed(2)).toString(); }

  /* ---------- Examen B · Solenoide ---------- */
  D['f3exam-solenoide-nucleo'] = function (s) {
    var N = num(s, 'N', 500), L = num(s, 'L', 20), R = num(s, 'R', 2), b = '', x0 = 140, x1 = 500, cy = 140, hh = Math.min(70, 20 + R * 18);
    b += seg('axis', 80, cy, 560, cy, 1.2, '4 6');
    for (var i = 0; i < 18; i++) { var x = x0 + (x1 - x0) * (i + 0.5) / 18; b += seg('ref', x - 4, cy - hh, x + 4, cy + hh, 2); }
    b += seg('axis', x0, cy - hh, x1, cy - hh, 1) + seg('axis', x0, cy + hh, x1, cy + hh, 1);
    b += seg('axis', x0, cy + hh + 24, x1, cy + hh + 24, 1.2) + text((x0 + x1) / 2, cy + hh + 44, 'L = ' + L + ' cm, ' + N + ' vueltas', ' text-anchor="middle" font-size="15"');
    b += seg('axis', x1 + 20, cy, x1 + 20, cy - hh, 1.2) + text(x1 + 28, cy - hh / 2, 'R = ' + fx3(R) + ' cm', ' font-size="15"');
    return svgBox('0 0 640 280', 'Un solenoide de ' + L + ' cm de largo y ' + fx3(R) + ' cm de radio con ' + N + ' vueltas, visto de lado.', b);
  };

  /* ---------- Examen B · Alambre y espira rectangular ---------- */
  D['f3exam-flujo'] = function (s) {
    var a = num(s, 'a', 2), w = num(s, 'w', 6), h = num(s, 'h', 10), I = num(s, 'I', 20), b = '', sc = Math.min(30, 420 / (a + w)), wx = 80, y0 = 60, y1 = 60 + Math.min(180, h * 12);
    var X = function (u) { return wx + sc * u; };
    b += seg('ref', wx, y1 + 6, wx, 30, 4) + f3bChev('ref', wx, 60, 0, -1) + text(wx - 10, 44, 'I = ' + I + ' A', ' text-anchor="end" font-size="15"');
    b += '<rect class="box-trace" x="' + r1(X(a)) + '" y="' + y0 + '" width="' + r1(sc * w) + '" height="' + r1(y1 - y0) + '"/>';
    b += seg('axis', wx, y1 + 20, X(a), y1 + 20, 1.2) + text((wx + X(a)) / 2, y1 + 38, 'a = ' + a + ' cm', ' text-anchor="middle" font-size="15"');
    b += seg('axis', X(a), y1 + 20, X(a + w), y1 + 20, 1.2, '4 3') + text((X(a) + X(a + w)) / 2, y1 + 38, 'w = ' + w + ' cm', ' text-anchor="middle" font-size="15"');
    b += seg('axis', X(a + w) + 14, y0, X(a + w) + 14, y1, 1.2) + text(X(a + w) + 22, (y0 + y1) / 2, 'h = ' + h + ' cm', ' font-size="15"');
    return svgBox('0 0 640 320', 'Un alambre vertical largo con corriente hacia arriba y, a su derecha en el mismo plano, una espira rectangular de ' + w + ' cm de ancho y ' + h + ' cm de alto, con su lado cercano a ' + a + ' cm del alambre.', b);
  };

  /* ══════════════════════ fin Examen B ══════════════════════ */

  /* ══════════════════════ Examen C ══════════════════════ */
  function f3cNum(v) { return Number((+v).toFixed(2)).toString(); }

  /* ---------- Examen C · Barra sobre rieles ---------- */
  D['f3exam-rieles'] = function (s) {
    var B = num(s, 'B', 0.5), L = num(s, 'L', 30), v = num(s, 'v', 2), R = num(s, 'R', 2), o = '';
    var x0 = 90, x1 = 600, yT = 70, yB = 210, bx = 400;
    o += f3cGrid(130, 95, 580, 190, 50, true, 7);
    o += seg('axis', x0, yT, x1, yT, 3) + seg('axis', x0, yB, x1, yB, 3);
    o += seg('axis', x0, yT, x0, yT + 40, 2.6) + f3cZig(x0, yT + 40, x0, yB - 40) + seg('axis', x0, yB - 40, x0, yB, 2.6);
    o += text(x0 - 14, (yT + yB) / 2 + 6, 'R = ' + f3cNum(R) + ' Ω', ' text-anchor="end" font-size="16"');
    o += seg('ref', bx, yT - 14, bx, yB + 14, 7) + arrow('student', bx + 12, yT - 30, 60, 0, 3) + text(bx + 82, yT - 24, 'v = ' + f3cNum(v) + ' m/s', ' font-size="16"');
    o += text(bx + 14, yB + 36, 'L = ' + f3cNum(L) + ' cm', ' font-size="16"');
    o += text(x0, 34, 'B = ' + f3cNum(B) + ' T (⊗ entra)', ' font-size="16"');
    return svgBox('0 15 640 250', 'Dos rieles unidos por un resistor de ' + f3cNum(R) + ' ohms y una barra de ' + f3cNum(L) + ' cm que se mueve a ' + f3cNum(v) + ' m/s en un campo de ' + f3cNum(B) + ' T que entra en la página.', o);
  };

  /* ---------- Examen C · Bobina en un campo que cambia ---------- */
  D['f3exam-c-bobina'] = function (s) {
    var N = num(s, 'N', 100), r = num(s, 'r', 3), B1 = num(s, 'B1', 0.2), B2 = num(s, 'B2', 0.8), dt = num(s, 'dt', 100), R = num(s, 'R', 10), o = '';
    var cx = 200, cy = 140;
    o += f3cGrid(90, 50, 310, 230, 44, true, 7);
    o += '<circle class="ref" fill="none" stroke-width="5" cx="' + cx + '" cy="' + cy + '" r="78"/>' + arrow('axis', cx, cy, 55, -55, 1.6) + text(cx + 34, cy - 14, 'r', ' font-size="17"');
    o += text(360, 70, 'N = ' + f3cNum(N) + ' vueltas', ' font-size="17"') + text(360, 100, 'r = ' + f3cNum(r) + ' cm', ' font-size="17"');
    o += text(360, 140, 'B: ' + f3cNum(B1) + ' T → ' + f3cNum(B2) + ' T', ' font-size="17"') + text(360, 168, 'en ' + f3cNum(dt) + ' ms', ' font-size="17"');
    o += text(360, 208, 'R total = ' + f3cNum(R) + ' Ω', ' font-size="17"');
    return svgBox('0 30 640 230', 'Una bobina de ' + N + ' vueltas y ' + r + ' cm de radio en un campo perpendicular que pasa de ' + B1 + ' a ' + B2 + ' teslas en ' + dt + ' milisegundos.', o);
  };

  /* ---------- Examen C · Generador ---------- */
  D['f3exam-generador'] = function (s) {
    var N = num(s, 'N', 100), a = num(s, 'a', 10), B = num(s, 'B', 0.5), rpm = num(s, 'rpm', 1800), R = num(s, 'R', 50), o = '';
    for (var y = 60; y <= 220; y += 40) o += arrow('aux', 40, y, 280, 0, 1.8);
    o += text(330, 66, 'B', ' font-size="18"');
    var cx = 180, cy = 140, w = 70, h = 70;
    o += poly('ref', [[cx - w * 0.45, cy - h], [cx + w * 0.45, cy - h * 0.8], [cx + w * 0.45, cy + h * 1.0], [cx - w * 0.45, cy + h * 0.8]], 4, true);
    o += seg('axis', cx, cy - h - 30, cx, cy + h + 26, 1.4, '6 5') + arc(cx, cy - h - 18, 18, 200, 340, 'axis', 1.6);
    o += text(380, 80, 'N = ' + f3cNum(N) + ' vueltas', ' font-size="17"') + text(380, 110, 'lado a = ' + f3cNum(a) + ' cm', ' font-size="17"');
    o += text(380, 140, 'B = ' + f3cNum(B) + ' T', ' font-size="17"') + text(380, 170, f3cNum(rpm) + ' rpm', ' font-size="17"');
    o += text(380, 200, 'carga R = ' + f3cNum(R) + ' Ω', ' font-size="17"');
    return svgBox('0 30 640 230', 'Una bobina cuadrada que gira alrededor de un eje perpendicular a un campo magnético uniforme, conectada a una carga.', o);
  };

  /* ---------- Examen C · Región con campo que cambia ---------- */
  D['f3exam-region'] = function (s) {
    var R = num(s, 'R', 4), r2 = num(s, 'r2', 10), k = num(s, 'k', 2), f = num(s, 'f', 0.5), o = '';
    var cx = 210, cy = 145, sc = 100 / Math.max(r2, 1), Rp = R * sc, r2p = r2 * sc, r1p = Math.round(f * R * 10) / 10 * sc;
    o += '<circle class="rect-fill" cx="' + cx + '" cy="' + cy + '" r="' + r1(Rp) + '"/>';
    if (Rp > 22) o += f3cB(cx, cy, 6, true);
    o += '<circle class="ref" fill="none" stroke-width="3" stroke-dasharray="7 5" cx="' + cx + '" cy="' + cy + '" r="' + r1(r2p) + '"/>';
    o += dot('dot-error', cx + r1p, cy, 5) + text(cx + r1p + 6, cy + 20, f3cSub('r', '1'), ' font-size="16"');
    o += arrow('axis', cx, cy, -Rp * 0.7, -Rp * 0.7, 1.4) + text(cx - Rp * 0.7 - 6, cy - Rp * 0.7 - 4, 'R', ' text-anchor="end" font-size="16"');
    o += text(cx + r2p * 0.72 + 6, cy + r2p * 0.72 + 14, f3cSub('r', '2'), ' font-size="16"');
    o += text(370, 80, 'R = ' + f3cNum(R) + ' cm', ' font-size="17"') + text(370, 110, 'dB/dt = ' + f3cNum(k) + ' T/s', ' font-size="17"');
    o += text(370, 140, f3cSub('r', '2') + ' = ' + f3cNum(r2) + ' cm (espira)', ' font-size="17"');
    return svgBox('0 30 640 240', 'Una región circular de radio ' + R + ' cm con un campo magnético que cambia; una espira circular más grande la rodea y un punto r1 está dentro de la región.', o);
  };

  /* ---------- Examen C · Solenoide ---------- */
  D['f3exam-c-solenoide'] = function (s) {
    var N = num(s, 'N', 500), r = num(s, 'r', 2), l = num(s, 'l', 20), I = num(s, 'I', 2), o = '', x0 = 120, x1 = 420, cy = 130, ry = 55;
    [-28, 0, 28].forEach(function (dy) { o += arrow('aux', 90, cy + dy, 360, 0, 1.8); });
    o += f3cCoil(x0, x1, cy, ry, 11);
    o += arrow('axis', 270, cy + ry + 22, -140, 0, 1.4) + arrow('axis', 270, cy + ry + 22, 140, 0, 1.4) + text(270, cy + ry + 44, 'ℓ = ' + f3cNum(l) + ' cm', ' text-anchor="middle" font-size="16"');
    o += text(470, 90, 'N = ' + f3cNum(N), ' font-size="17"') + text(470, 120, 'r = ' + f3cNum(r) + ' cm', ' font-size="17"') + text(470, 150, 'I = ' + f3cNum(I) + ' A', ' font-size="17"');
    return svgBox('0 50 640 210', 'Un solenoide de ' + N + ' vueltas, ' + r + ' cm de radio y ' + l + ' cm de largo con corriente ' + I + ' A.', o);
  };

  /* ---------- Examen C · Circuito RL ---------- */
  D['f3exam-rl'] = function (s) {
    var e = num(s, 'e', 12), R = num(s, 'R', 50), L = num(s, 'L', 200), sw = s && s.sw === 'b' ? 'b' : 'a';
    var st = D['f3s14-circuit']({ sw: sw, x: sw === 'b' ? 0.001 : 0, cap: 'ε = ' + f3cNum(e) + ' V,  R = ' + f3cNum(R) + ' Ω,  L = ' + f3cNum(L) + ' mH' });
    return st.replace('aria-label="Circuito RL: batería, interruptor con posiciones a y b, resistor R e inductor L"', 'aria-label="Circuito RL con batería de ' + e + ' V, resistor de ' + R + ' ohms e inductor de ' + L + ' mH"');
  };


  /* ══════════════════════ fin Examen C ══════════════════════ */

})();
