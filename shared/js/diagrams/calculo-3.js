/* =====================================================================
   Diagramas de Cálculo 3: window.Diagrams[id](state) → SVG (string).
   Roles: solución real .ref · campo de pendientes, familia o guía .aux ·
   error o lo que no es solución .error · recorrido .trace · lo del alumno .student.
   Solo clases de rol; los colores salen de tokens.css. El explainer interpola
   los campos numéricos de `state` entre pasos y vuelve a llamar a la función.
   Cada sesión escribe sus figuras dentro de su propio bloque (── SNN ──).
   Los ids no deben chocar con los de otros cursos (exam.test lo revisa).
   ===================================================================== */
(function () {
  var D = window.Diagrams = window.Diagrams || {};

  /* ------------------------- Ayudantes comunes ------------------------- */
  function r1(n) { return (+n).toFixed(1); }
  function num(s, k, d) { return s && typeof s[k] === 'number' && isFinite(s[k]) ? s[k] : d; }
  function fade(body, o) { return o <= 0.001 ? '' : '<g opacity="' + Math.min(1, o).toFixed(2) + '">' + body + '</g>'; }
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
    var d = '', pen = false;
    pts.forEach(function (p) {
      if (!p || !isFinite(p[0]) || !isFinite(p[1])) { pen = false; return; }
      d += (pen ? 'L' : 'M') + r1(p[0]) + ' ' + r1(p[1]); pen = true;
    });
    if (!d) return '';
    return '<path class="' + cls + '" fill="none" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') +
      ' d="' + d + (close ? 'Z' : '') + '"/>';
  }
  function fill(cls, pts, extra) {
    return '<path class="' + cls + '"' + (extra || '') + ' d="' + pts.map(function (p, i) { return (i ? 'L' : 'M') + r1(p[0]) + ' ' + r1(p[1]); }).join('') + 'Z"/>';
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

  /* ---------- Etiquetas que no chocan ----------
     spot(cands, pts, fs, vb): cands = [[x, y, texto, anchor]]; usa la primera cuya caja (ancho
     estimado) cabe en vb = [x0, y0, x1, y1] y no toca ningún punto de pts (trazos muestreados). */
  function boxOf(c, fs) {
    var w = String(c[2]).replace(/<[^>]+>/g, '').length * fs * 0.6, a = c[3] || 'start';
    var x0 = a === 'end' ? c[0] - w : a === 'middle' ? c[0] - w / 2 : c[0];
    return { l: x0 - 4, r: x0 + w + 4, t: c[1] - fs * 0.85 - 2, b: c[1] + fs * 0.3 + 2 };
  }
  function spot(cands, pts, fs, vb, taken) {
    for (var i = 0; i < cands.length; i++) {
      var q = boxOf(cands[i], fs);
      if (q.l < vb[0] + 2 || q.r > vb[2] - 2 || q.t < vb[1] + 2 || q.b > vb[3] - 2) continue;
      if (pts.some(function (p) { return p[0] > q.l && p[0] < q.r && p[1] > q.t && p[1] < q.b; })) continue;
      if (taken && taken.some(function (t) { return !(q.r < t.l || q.l > t.r || q.b < t.t || q.t > t.b); })) continue;
      if (taken) taken.push(q);
      return cands[i];
    }
    if (taken) taken.push(boxOf(cands[0], fs));
    return cands[0];
  }
  function around(x, y, s) {
    var c = [];
    [18, 30, 46, 64].forEach(function (r) { for (var i = 0; i < 16; i++) { var a = i * Math.PI / 8, cx = Math.cos(a), cy = Math.sin(a); c.push([x + r * cx, y + r * cy + 5, s, cx > 0.3 ? 'start' : cx < -0.3 ? 'end' : 'middle']); } });
    return c;
  }
  function label(c, fs) { return text(c[0], c[1], c[2], (c[3] ? ' text-anchor="' + c[3] + '"' : '') + ' font-size="' + fs + '"'); }
  function segPts(x1, y1, x2, y2) {
    var o = [], n = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 3) || 1;
    for (var i = 0; i <= n; i++) o.push([x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n]);
    return o;
  }
  function polyPts(pts) {
    var o = [];
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      if (a && b && isFinite(a[1]) && isFinite(b[1])) o = o.concat(segPts(a[0], a[1], b[0], b[1]));
    }
    return o;
  }

  /* ---------- Plano cartesiano en un cuadro ----------
     plane({ W, H, x: [a, b], y: [c, d], pad: [L, R, T, B] }) → { X, Y, axes(xl, yl), curve(fn) … }
     Todo lo que se dibuja deja sus puntos en `pts` para que las etiquetas los esquiven. */
  function plane(o) {
    var W = o.W || 600, H = o.H || 360, p = o.pad || [46, 24, 22, 40];
    var L = p[0], R = W - p[1], T = p[2], B = H - p[3];
    var X = function (x) { return L + (x - o.x[0]) / (o.x[1] - o.x[0]) * (R - L); };
    var Y = function (y) { return B - (y - o.y[0]) / (o.y[1] - o.y[0]) * (B - T); };
    var pts = [], keep = [], api = { X: X, Y: Y, pts: pts, L: L, R: R, T: T, B: B, W: W, H: H, vb: [0, 0, W, H] };
    var inside = function (q) { return q[1] >= T - 1 && q[1] <= B + 1; };
    api.axes = function (xl, yl, ticks) {
      var y0 = o.y[0] <= 0 && o.y[1] >= 0 ? Y(0) : B, x0 = o.x[0] <= 0 && o.x[1] >= 0 ? X(0) : L, s = '';
      s += arrow('axis', L - 6, y0, R - L + 14, 0, 1.6) + arrow('axis', x0, B + 6, 0, -(B - T + 14), 1.6);
      pts.push.apply(pts, segPts(L - 6, y0, R + 8, y0)); pts.push.apply(pts, segPts(x0, B + 6, x0, T - 8));
      if (xl) { s += text(R + 6, y0 + 22, xl, ' text-anchor="end" font-size="18"'); keep.push(boxOf([R + 6, y0 + 22, xl, 'end'], 18)); }
      // La letra del eje y va a la derecha de la flecha: a la izquierda se cortaba si es larga (T (°C)).
      if (yl) { s += text(x0 + 12, T + 4, yl, ' font-size="18"'); keep.push(boxOf([x0 + 12, T + 4, yl, 'start'], 18)); }
      (ticks && ticks.x || []).forEach(function (t) {
        s += seg('axis', X(t[0]), y0 - 4, X(t[0]), y0 + 4, 1.4) + text(X(t[0]), y0 + 20, t[1], ' text-anchor="middle" font-size="15"');
        keep.push(boxOf([X(t[0]), y0 + 20, t[1], 'middle'], 15));
      });
      (ticks && ticks.y || []).forEach(function (t) {
        s += seg('axis', x0 - 4, Y(t[0]), x0 + 4, Y(t[0]), 1.4) + text(x0 - 8, Y(t[0]) + 5, t[1], ' text-anchor="end" font-size="15"');
        keep.push(boxOf([x0 - 8, Y(t[0]) + 5, t[1], 'end'], 15));
      });
      return s;
    };
    // Curva y = fn(x) recortada al cuadro (se corta donde sale).
    api.curve = function (fn, cls, w, a, b, dash) {
      var A = a != null ? a : o.x[0], Bx = b != null ? b : o.x[1], out = [], n = 160;
      for (var i = 0; i <= n; i++) {
        var x = A + (Bx - A) * i / n, y = fn(x), q = [X(x), Y(y)];
        out.push(isFinite(y) && inside(q) ? q : null);
      }
      pts.push.apply(pts, polyPts(out));
      return poly(cls, out, w || 3, false, dash);
    };
    // Campo de pendientes de y′ = f(x, y): rayitas de largo fijo en pantalla.
    api.field = function (f, nx, ny, skip) {
      var d = '', len = 0.36 * Math.min((R - L) / nx, (B - T) / ny);
      for (var i = 0; i < nx; i++) for (var j = 0; j < ny; j++) {
        var x = o.x[0] + (i + 0.5) * (o.x[1] - o.x[0]) / nx, y = o.y[0] + (j + 0.5) * (o.y[1] - o.y[0]) / ny;
        if (skip && skip(x, y)) continue;
        var px = X(x), py = Y(y);
        if (keep.some(function (q) { return px > q.l - 12 && px < q.r + 12 && py > q.t - 12 && py < q.b + 12; })) continue;
        var m = f(x, y);
        if (!isFinite(m)) continue;
        var sx = (R - L) / (o.x[1] - o.x[0]), sy = (B - T) / (o.y[1] - o.y[0]);
        var vx = sx, vy = -m * sy, k = len / Math.hypot(vx, vy), cx = X(x), cy = Y(y);
        d += 'M' + r1(cx - vx * k) + ' ' + r1(cy - vy * k) + 'L' + r1(cx + vx * k) + ' ' + r1(cy + vy * k);
        pts.push([cx - vx * k, cy - vy * k], [cx, cy], [cx + vx * k, cy + vy * k]);
      }
      return '<path class="aux" fill="none" stroke-width="1.8" stroke-linecap="round" d="' + d + '"/>';
    };
    api.dot = function (x, y, cls, r) { pts.push([X(x), Y(y)]); return dot(cls || 'dot-ref', X(x), Y(y), r || 6); };
    api.hline = function (y, cls, dash) { pts.push.apply(pts, segPts(L, Y(y), R, Y(y))); return seg(cls || 'axis', L, Y(y), R, Y(y), 1.6, dash || '6 6'); };
    api.vline = function (x, cls, dash, y1, y2) {
      var a = y1 != null ? Y(y1) : B, b = y2 != null ? Y(y2) : T;
      pts.push.apply(pts, segPts(X(x), a, X(x), b)); return seg(cls || 'axis', X(x), a, X(x), b, 1.6, dash || '6 6');
    };
    // Etiqueta que esquiva lo ya dibujado; cands en coordenadas de pantalla.
    var taken = [];
    api.tag = function (cands, fs) { return label(spot(cands, pts, fs || 17, api.vb, taken), fs || 17); };
    api.tagNear = function (x, y, s, fs) { return api.tag(around(X(x), Y(y), s), fs); };
    return api;
  }

  /* ══════════════════════ S01 ══════════════════════ */
  // S01 · Campo de pendientes de y′ = x − y: el campo, el punto inicial, la solución y la familia.
  // state: { field, ic, sol, fam } en [0, 1].
  D['c3s01-field'] = function (st) {
    var P = plane({ W: 600, H: 380, x: [-0.5, 4], y: [-1, 3.4] });
    var fF = num(st, 'field', 1), fI = num(st, 'ic', 0), fS = num(st, 'sol', 0), fA = num(st, 'fam', 0);
    var f = function (x, y) { return x - y; };
    var s = P.axes('x', 'y');
    s += fade(P.field(f, 15, 11, function (x, y) { return x > 2.6 && y < -0.2; }), fF);
    var fam = '';
    [-1.5, -0.5, 0.6, 3.2].forEach(function (C) { fam += P.curve(function (x) { return x - 1 + C * Math.exp(-x); }, 'trace', 2.4, null, null, '6 6'); });
    s += fade(fam, fA);
    var sol = function (x) { return x - 1 + 2 * Math.exp(-x); };
    var xe = -0.5 + 4.5 * Math.max(0.02, fS);
    if (fS > 0) s += P.curve(sol, 'ref', 3.6, -0.5, xe);
    if (fI > 0) s += fade(P.dot(0, 1, 'dot-ref', 7) + P.tagNear(0, 1, '(0, 1)', 17), fI);
    if (fA > 0.5) s += fade(text(P.X(3.95), P.Y(-0.62), 'y = x − 1 + Ce^(−x)', ' text-anchor="end" font-size="16"'), fA);
    return svgBox('0 0 600 380', 'Campo de pendientes de y prima igual a x menos y, con la solución que pasa por (0, 1)', s);
  };

  // S01 · Sin unicidad: y′ = 3y^(2/3) tiene dos soluciones que salen de (0, 0).
  D['c3s01-nounique'] = function () {
    var P = plane({ W: 600, H: 320, x: [-1.6, 1.8], y: [-1.2, 5.4] });
    var s = P.axes('x', 'y');
    s += P.curve(function () { return 0; }, 'ref', 3.6);
    s += P.curve(function (x) { return x * x * x; }, 'error', 3.4, 0, 1.75);
    s += P.dot(0, 0, 'dot-ref', 7);
    s += P.tag([[P.X(-1.5), P.Y(0) - 14, 'y = 0', 'start'], [P.X(-1.5), P.Y(0) + 26, 'y = 0', 'start']], 18);
    s += P.tag([[P.X(1.55) - 10, P.Y(4.2), 'y = x³', 'end'], [P.X(0.9), P.Y(3.2), 'y = x³', 'end']], 18);
    s += P.tag([[P.X(0.05) + 8, P.Y(0) + 28, 'y(0) = 0', 'start'], [P.X(0.05) + 8, P.Y(0) - 16, 'y(0) = 0', 'start']], 16);
    return svgBox('0 0 600 320', 'Dos soluciones distintas de y prima igual a 3 y a la dos tercios con y de 0 igual a 0: la recta y = 0 y la cúbica y = x al cubo', s);
  };

  /* ══════════════════════ S02 ══════════════════════ */
  // S02 · Decaimiento: y = y0·e^(−kt) con la vida media marcada. state: { k } (decaimiento).
  D['c3s02-decay'] = function (st) {
    var k = num(st, 'k', 0.35), T = Math.log(2) / k;
    var P = plane({ W: 600, H: 340, x: [0, 10], y: [0, 110] });
    var s = P.axes('t', 'y', { y: [[100, 'y₀'], [50, 'y₀/2'], [25, 'y₀/4']] });
    s += P.curve(function (t) { return 100 * Math.exp(-k * t); }, 'ref', 3.6);
    if (T < 9.5) {
      s += P.vline(T, 'aux', '5 6', 0, 50) + seg('aux', P.X(0), P.Y(50), P.X(T), P.Y(50), 1.6, '5 6');
      s += P.dot(T, 50, 'dot-ref', 6);
      s += P.tag([[P.X(T) + 8, P.B - 8, 'vida media', 'start'], [P.X(T) - 8, P.B - 8, 'vida media', 'end']], 15);
    }
    if (2 * T < 9.5) { s += P.vline(2 * T, 'aux', '5 6', 0, 25) + seg('aux', P.X(0), P.Y(25), P.X(2 * T), P.Y(25), 1.6, '5 6') + P.dot(2 * T, 25, 'dot-ref', 5); }
    s += P.tag([[P.R - 6, P.T + 18, 'y = y₀·e⁻ᵏᵗ', 'end'], [P.R - 6, P.T + 60, 'y = y₀·e⁻ᵏᵗ', 'end']], 17);
    return svgBox('0 0 600 340', 'Decaimiento exponencial: cada vida media la cantidad se reduce a la mitad', s);
  };

  // S02 · Enfriamiento de Newton: T(t) se acerca a la temperatura del cuarto. state: { k }.
  D['c3s02-cooling'] = function (st) {
    var k = num(st, 'k', 0.12), Ta = 22;
    var P = plane({ W: 600, H: 330, x: [0, 40], y: [0, 100] });
    var s = P.axes('t (min)', 'T (°C)', { y: [[90, '90'], [22, '22']] });
    s += P.hline(Ta, 'aux');
    s += P.curve(function (t) { return Ta + 68 * Math.exp(-k * t); }, 'ref', 3.6);
    s += P.curve(function (t) { return Ta - 18 * Math.exp(-k * t); }, 'trace', 3, null, null, '7 6');
    s += P.tag([[P.R - 6, P.Y(Ta) - 10, 'cuarto: 22 °C', 'end'], [P.R - 6, P.Y(Ta) + 24, 'cuarto: 22 °C', 'end']], 15);
    s += P.tag([[P.X(6), P.Y(78), 'café que se enfría', 'start'], [P.X(9), P.Y(70), 'café que se enfría', 'start']], 15);
    s += P.tag([[P.X(3), P.Y(10), 'refresco que se calienta', 'start'], [P.X(12), P.Y(8), 'refresco que se calienta', 'start']], 15);
    return svgBox('0 0 600 330', 'Ley de enfriamiento de Newton: las dos temperaturas se acercan a la del cuarto, una desde arriba y otra desde abajo', s);
  };

  /* ══════════════════════ S03 ══════════════════════ */
  // S03 · Homogénea: la pendiente solo depende de y/x, así que es la misma en cada rayo.
  // state: { rays, sol } en [0, 1].
  D['c3s03-rays'] = function (st) {
    var P = plane({ W: 600, H: 360, x: [0, 4], y: [0, 4] });
    var fR = num(st, 'rays', 1), fS = num(st, 'sol', 0);
    var f = function (x, y) { return (x * x + y * y) / (2 * x * y); };
    var s = P.axes('x', 'y');
    var rays = '';
    [0.35, 0.75, 1.4, 2.6].forEach(function (m) {
      var xe = Math.min(4, 4 / m);
      rays += P.curve(function (x) { return m * x; }, 'trace', 1.6, 0.02, xe, '4 7');
    });
    s += fade(rays, fR);
    // Rayitas sobre cada rayo: todas paralelas entre sí.
    var d = '';
    [0.35, 0.75, 1.4, 2.6].forEach(function (m) {
      [0.6, 1.2, 1.8, 2.4, 3.0, 3.6].forEach(function (x) {
        var y = m * x; if (y > 3.8) return;
        var sl = f(x, y), sx = P.X(1) - P.X(0), sy = P.Y(0) - P.Y(1), vx = sx, vy = -sl * sy, kk = 13 / Math.hypot(vx, vy);
        var cx = P.X(x), cy = P.Y(y);
        d += 'M' + r1(cx - vx * kk) + ' ' + r1(cy - vy * kk) + 'L' + r1(cx + vx * kk) + ' ' + r1(cy + vy * kk);
        P.pts.push([cx - vx * kk, cy - vy * kk], [cx, cy], [cx + vx * kk, cy + vy * kk]);
      });
    });
    s += '<path class="aux" fill="none" stroke-width="2.4" stroke-linecap="round" d="' + d + '"/>';
    // Solución y² = x² + Cx con C = −0.6 (pasa por (1, 0.632…) y crece): y = √(x² − 0.6x).
    if (fS > 0) s += fade(P.curve(function (x) { return Math.sqrt(x * x - 0.6 * x); }, 'ref', 3.4, 0.62, 3.95), fS);
    s += P.tag([[P.R - 8, P.B - 12, 'misma y/x → misma pendiente', 'end'], [P.R - 8, P.B - 40, 'misma y/x → misma pendiente', 'end'], [P.R - 8, P.T + 16, 'misma y/x → misma pendiente', 'end']], 15);
    return svgBox('0 0 600 360', 'En una ecuación homogénea las rayitas del campo son paralelas a lo largo de cada recta que sale del origen', s);
  };

  /* ══════════════════════ S04 ══════════════════════ */
  // S04 · Tanque de mezclas: entra salmuera, sale la mezcla; A(t) = sal en el tanque.
  D['c3s04-tank'] = function () {
    var s = '';
    s += fill('area-fill', [[220, 90], [380, 90], [380, 260], [220, 260]]);
    s += poly('axis', [[220, 50], [220, 260], [380, 260], [380, 50]], 3.5);
    s += seg('axis', 220, 90, 380, 90, 1.6, '6 5');
    s += arrow('ref', 70, 70, 140, 0, 3.2) + text(70, 54, 'entra r L/min', ' font-size="17"') + text(70, 104, 'concentración cᵢₙ', ' font-size="17"');
    s += arrow('trace', 386, 236, 150, 0, 3.2) + text(400, 220, 'sale r L/min', ' font-size="17"') + text(400, 272, 'concentración A/V', ' font-size="17"');
    s += text(300, 170, 'V litros', ' text-anchor="middle" font-size="18"') + text(300, 196, 'A(t) gramos de sal', ' text-anchor="middle" font-size="16"');
    return svgBox('0 0 600 300', 'Tanque de mezclas: entra salmuera a una concentración fija y sale la mezcla a la misma razón', s);
  };

  // S04 · Solución = estado estacionario + transitorio. state: { parts } 0 solo total, 1 con partes.
  D['c3s04-steady'] = function (st) {
    var fp = num(st, 'parts', 1), Ainf = 60, A0 = 10, k = 0.08;
    var P = plane({ W: 600, H: 330, x: [0, 60], y: [-55, 75] });
    var s = P.axes('t', 'A', { y: [[60, '60'], [10, '10']] });
    s += fade(P.hline(Ainf, 'aux') + P.curve(function (t) { return (A0 - Ainf) * Math.exp(-k * t); }, 'trace', 2.6, null, null, '7 6'), fp);
    s += P.curve(function (t) { return Ainf + (A0 - Ainf) * Math.exp(-k * t); }, 'ref', 3.6);
    s += P.dot(0, A0, 'dot-ref', 6);
    if (fp > 0.5) {
      s += P.tag([[P.R - 6, P.Y(Ainf) - 10, 'estado estacionario', 'end'], [P.R - 6, P.Y(Ainf) + 24, 'estado estacionario', 'end']], 15);
      s += P.tag([[P.X(14), P.Y(-30), 'transitorio: se apaga', 'start'], [P.X(20), P.Y(-12), 'transitorio: se apaga', 'start']], 15);
    }
    s += P.tag([[P.X(16), P.Y(40), 'A(t) total', 'start'], [P.X(22), P.Y(46), 'A(t) total', 'start'], [P.X(8), P.Y(20), 'A(t) total', 'start']], 16);
    return svgBox('0 0 600 330', 'La solución de una lineal con coeficientes constantes es un estado estacionario más un transitorio que se apaga', s);
  };

  /* ══════════════════════ S05 ══════════════════════ */
  // S05 · Logística: P′ = rP(1 − P/K). Curvas desde varios P0; K atrae a todas. state: { many }.
  D['c3s05-logistic'] = function (st) {
    var fm = num(st, 'many', 1), K = 100, r = 0.5;
    var P = plane({ W: 600, H: 340, x: [0, 16], y: [0, 150] });
    var sol = function (P0) { return function (t) { return K / (1 + (K / P0 - 1) * Math.exp(-r * t)); }; };
    var s = P.axes('t', 'P', { y: [[100, 'K'], [50, 'K/2']] });
    s += P.hline(K, 'aux');
    s += P.hline(K / 2, 'axis', '3 7');
    var many = '';
    [3, 25, 140].forEach(function (P0) { many += P.curve(sol(P0), 'trace', 2.4, null, null, '7 6'); });
    s += fade(many, fm);
    s += P.curve(sol(8), 'ref', 3.6);
    var ti = Math.log(K / 8 - 1) / r;
    s += P.dot(ti, K / 2, 'dot-ref', 6);
    s += P.tag([[P.X(ti) + 12, P.Y(K / 2) + 22, 'inflexión en K/2', 'start'], [P.X(ti) + 12, P.Y(K / 2) - 12, 'inflexión en K/2', 'start']], 15);
    s += P.tag([[P.R - 6, P.Y(K) - 10, 'capacidad de carga K', 'end'], [P.R - 6, P.Y(K) + 24, 'capacidad de carga K', 'end']], 15);
    return svgBox('0 0 600 340', 'Curvas logísticas: todas las poblaciones positivas se acercan a la capacidad de carga K', s);
  };

})();
