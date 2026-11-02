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

  // Curva de nivel f(x, y) = c (cuadrados que marchan) → segmentos en pantalla [[px, py], [px, py]].
  function levelSegs(P, f, c, xr, yr, n) {
    n = n || 70;
    var dx = (xr[1] - xr[0]) / n, dy = (yr[1] - yr[0]) / n, out = [], v = [];
    for (var i = 0; i <= n; i++) { v.push([]); for (var j = 0; j <= n; j++) v[i].push(f(xr[0] + i * dx, yr[0] + j * dy) - c); }
    function cut(x1, y1, a, x2, y2, b) { var t = a / (a - b); return [P.X(x1 + t * (x2 - x1)), P.Y(y1 + t * (y2 - y1))]; }
    for (var I = 0; I < n; I++) for (var J = 0; J < n; J++) {
      var x0 = xr[0] + I * dx, y0 = yr[0] + J * dy, a = v[I][J], b = v[I + 1][J], cc = v[I + 1][J + 1], d = v[I][J + 1], e = [];
      if (![a, b, cc, d].every(isFinite)) continue;
      if ((a > 0) !== (b > 0)) e.push(cut(x0, y0, a, x0 + dx, y0, b));
      if ((b > 0) !== (cc > 0)) e.push(cut(x0 + dx, y0, b, x0 + dx, y0 + dy, cc));
      if ((cc > 0) !== (d > 0)) e.push(cut(x0 + dx, y0 + dy, cc, x0, y0 + dy, d));
      if ((d > 0) !== (a > 0)) e.push(cut(x0, y0 + dy, d, x0, y0, a));
      if (e.length >= 2) out.push([e[0], e[1]]);
      if (e.length === 4) out.push([e[2], e[3]]);
    }
    return out;
  }
  function segsPath(cls, segs, w, dash) {
    if (!segs.length) return '';
    return '<path class="' + cls + '" fill="none" stroke-width="' + (w || 2) + '" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') +
      ' d="' + segs.map(function (s) { return 'M' + r1(s[0][0]) + ' ' + r1(s[0][1]) + 'L' + r1(s[1][0]) + ' ' + r1(s[1][1]); }).join('') + '"/>';
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


  /* ══════════════ Más figuras del bloque A (S01–S05) ══════════════ */
  // S01 · Velocímetro: con la rapidez v(t) y el punto de salida se reconstruye la posición x(t).
  D['c3s01-speed'] = function () {
    var v = function (t) { return 60 + 30 * Math.sin(t / 1.3); }, x = function (t) { return 60 * t - 39 * (Math.cos(t / 1.3) - 1); };
    var A = plane({ W: 600, H: 340, x: [0, 8], y: [0, 100], pad: [46, 330, 26, 56] });
    var s = A.axes('t', 'v') + A.curve(v, 'aux', 3.2);
    s += text(158, 334, 'la regla: v(t)', ' text-anchor="middle" font-size="22"');
    var B = plane({ W: 600, H: 340, x: [0, 8], y: [0, 620], pad: [330, 20, 26, 56] });
    s += B.axes('t', 'x') + B.curve(x, 'ref', 3.4) + B.dot(0, 0, 'dot-ref', 6);
    s += text(455, 334, 'la historia: x(t)', ' text-anchor="middle" font-size="22"');
    s += arrow('error', 270, 170, 60, 0, 2.6);
    return svgBox('0 0 600 340', 'A la izquierda la rapidez v de t; a la derecha la posición x de t que se reconstruye a partir de ella y del punto de salida', s);
  };
  // S01 · Comprobación: y″ y 4y para y = cos 2x + sin 2x son opuestas; su suma es cero.
  D['c3s01-check'] = function () {
    var P = plane({ W: 600, H: 320, x: [0, 6.3], y: [-6.5, 8.5] });
    var y = function (x) { return Math.cos(2 * x) + Math.sin(2 * x); };
    var s = P.axes('x', '');
    s += P.curve(function (x) { return -4 * y(x); }, 'aux', 2.8, null, null, '7 6');
    s += P.curve(function (x) { return 4 * y(x); }, 'trace', 2.8);
    s += P.curve(function () { return 0; }, 'ref', 4);
    s += P.tag([[P.X(2.36) + 10, P.Y(5.66) + 6, 'y″ (punteada)', 'start'], [P.X(2.36), P.Y(5.66) - 8, 'y″ (punteada)', 'middle']], 17);
    s += P.tag([[P.X(0.39) + 14, P.Y(5.66) + 6, '4y', 'start'], [P.X(3.53), P.Y(5.66) - 8, '4y', 'middle']], 17);
    s += P.tag([[P.X(0.3), P.Y(0) + 24, 'suma: 0', 'start'], [P.X(0.3), P.Y(0) - 12, 'suma: 0', 'start']], 17);
    return svgBox('0 0 600 320', 'La segunda derivada y cuatro veces la función son opuestas en cada punto: su suma es la recta cero', s);
  };
  // S01 · y′ = y², y(0) = 1: la solución 1/(1 − x) explota en x = 1.
  D['c3s01-blowup'] = function () {
    var P = plane({ W: 600, H: 320, x: [-2, 2], y: [-6, 10] });
    var s = P.axes('x', 'y') + P.vline(1, 'error', '6 6');
    s += P.curve(function (x) { return 1 / (1 - x); }, 'ref', 3.4, -2, 0.9);
    s += P.curve(function (x) { return 1 / (1 - x); }, 'aux', 2.2, 1.12, 2, '5 6');
    s += P.dot(0, 1, 'dot-ref', 6);
    s += P.tag([[P.X(1) + 8, P.T + 18, 'x = 1: explota', 'start'], [P.X(1) - 8, P.T + 18, 'x = 1: explota', 'end']], 17);
    s += P.tag([[P.X(-1.9), P.Y(-4.5), 'intervalo de validez: x < 1', 'start']], 17);
    return svgBox('0 0 600 320', 'La solución de y prima igual a y al cuadrado con y de 0 igual a 1 crece sin límite al acercarse a x = 1', s);
  };
  // S02 · y′ = y²: la solución de equilibrio y = 0 y las curvas 1/(C − x).
  D['c3s02-equilibrium'] = function () {
    var P = plane({ W: 600, H: 320, x: [-3, 3], y: [-3, 3] });
    var s = P.axes('x', 'y') + P.field(function (x, y) { return y * y; }, 15, 11);
    [-1.5, 0.5, 2].forEach(function (C) {
      s += P.curve(function (x) { return 1 / (C - x); }, 'trace', 2.4, -3, C - 0.34, '6 6');
    });
    s += P.curve(function () { return 0; }, 'ref', 4);
    s += P.tag([[P.R - 6, P.Y(0) - 12, 'y = 0 también es solución', 'end'], [P.R - 6, P.Y(0) + 26, 'y = 0 también es solución', 'end']], 17);
    return svgBox('0 0 600 320', 'Campo de pendientes de y prima igual a y al cuadrado: la recta y = 0 es una solución que la fórmula 1 entre C menos x no incluye', s);
  };
  // S02 · Familia y = Ae^(x²): la condición y(0) = 3 elige A = 3; A = 0 es la de equilibrio.
  D['c3s02-gauss'] = function () {
    var P = plane({ W: 600, H: 320, x: [-1.3, 1.3], y: [-6, 14] });
    var s = P.axes('x', 'y');
    [-2, -1, 1, 2].forEach(function (A) { s += P.curve(function (x) { return A * Math.exp(x * x); }, 'aux', 2, null, null, '6 6'); });
    s += P.curve(function () { return 0; }, 'trace', 2.4);
    s += P.curve(function (x) { return 3 * Math.exp(x * x); }, 'ref', 3.6) + P.dot(0, 3, 'dot-ref', 6);
    s += text(P.X(0.06), P.Y(11.5), 'y(0) = 3 → A = 3', ' font-size="17"');
    s += text(P.L + 6, P.Y(0) - 10, 'A = 0', ' font-size="17"');
    return svgBox('0 0 600 320', 'Familia de soluciones y igual a A por e a la x cuadrada; la condición inicial elige A = 3', s);
  };
  // S02 · y² = x² + 4: dos ramas; y(0) = 2 elige la de arriba.
  D['c3s02-branch'] = function () {
    var P = plane({ W: 600, H: 320, x: [-3, 3], y: [-4.5, 4.5] });
    var s = P.axes('x', 'y');
    s += P.curve(function (x) { return Math.sqrt(x * x + 4); }, 'ref', 3.6);
    s += P.curve(function (x) { return -Math.sqrt(x * x + 4); }, 'error', 2.6, null, null, '7 6');
    s += P.dot(0, 2, 'dot-ref', 6);
    s += text(P.L + 6, P.Y(4.25), 'y(0) = 2: rama de arriba', ' font-size="17"');
    s += text(P.L + 6, P.Y(-4.1), 'rama de abajo: y(0) = −2', ' font-size="17"');
    return svgBox('0 0 600 320', 'La relación y cuadrada igual a x cuadrada más 4 tiene dos ramas; la condición inicial positiva elige la de arriba', s);
  };
  // S03 · Calles en diagonal contra calles alineadas: el mismo recorrido, descrito en otras coordenadas.
  D['c3s03-streets'] = function () {
    var s = '<g transform="rotate(45 150 140)">', i;
    for (i = 0; i <= 6; i++) { s += seg('axis', 60 + i * 30, 50, 60 + i * 30, 230, 1.2, '3 5'); s += seg('axis', 60, 50 + i * 30, 240, 50 + i * 30, 1.2, '3 5'); }
    s += arrow('ref', 90, 200, 90, 0, 3) + arrow('ref', 180, 200, 0, -60, 3) + '</g>';
    s += text(150, 292, 'en x, y: torcido', ' text-anchor="middle" font-size="22"');
    for (i = 0; i <= 6; i++) { s += seg('axis', 360, 50 + i * 30, 540, 50 + i * 30, 1.2, '3 5'); s += seg('axis', 360 + i * 30, 50, 360 + i * 30, 230, 1.2, '3 5'); }
    s += arrow('ref', 390, 200, 90, 0, 3) + arrow('ref', 480, 200, 0, -60, 3);
    s += text(450, 292, 'en u: recto', ' text-anchor="middle" font-size="22"');
    s += arrow('error', 285, 140, 45, 0, 2.6);
    return svgBox('0 0 600 300', 'El mismo recorrido descrito con calles en diagonal y con calles alineadas: cambiar de variable simplifica la descripción', s);
  };
  // S03 · Antes y después: y = tan x − x (no separable) y u = x + y = tan x (separable).
  D['c3s03-before-after'] = function () {
    var A = plane({ W: 600, H: 300, x: [-1.2, 1.2], y: [-2, 2], pad: [40, 320, 26, 36] });
    var s = A.axes('x', 'y') + A.curve(function (x) { return Math.tan(x) - x; }, 'ref', 3.4);
    s += text(A.R - 4, A.Y(-1.5), 'y = tan x − x', ' text-anchor="end" font-size="17"');
    var B = plane({ W: 600, H: 300, x: [-1.2, 1.2], y: [-2.8, 2.8], pad: [330, 20, 26, 36] });
    s += B.axes('x', 'u') + B.curve(Math.tan, 'trace', 3.4) + B.curve(function (x) { return x; }, 'aux', 1.6, null, null, '5 6');
    s += text(B.R - 4, B.Y(-2.2), 'u = tan x', ' text-anchor="end" font-size="17"');
    s += arrow('error', 285, 150, 40, 0, 2.6);
    return svgBox('0 0 600 300', 'A la izquierda la solución en la variable y; a la derecha la misma solución en la variable u = x + y, que resuelve una ecuación separable', s);
  };
  // S04 · La tina: entra a ritmo fijo y sale más rápido entre más agua hay; el nivel se estabiliza.
  D['c3s04-tub'] = function () {
    var s = '';
    s += fill('area-fill', [[60, 150], [220, 150], [220, 240], [60, 240]]) + poly('axis', [[60, 70], [60, 240], [220, 240], [220, 70]], 3);
    s += seg('axis', 60, 150, 220, 150, 1.6, '6 5') + arrow('ref', 100, 30, 0, 100, 3) + text(110, 46, 'entra fijo', ' font-size="21"');
    s += arrow('trace', 200, 244, 0, 40, 3) + text(212, 280, 'sale ∝ nivel', ' font-size="21"');
    var P = plane({ W: 600, H: 300, x: [0, 10], y: [0, 1.2], pad: [290, 20, 26, 36] });
    s += P.axes('t', 'nivel') + P.hline(1, 'aux') + P.curve(function (t) { return 1 - Math.exp(-0.5 * t); }, 'ref', 3.4);
    s += P.tag([[P.R - 4, P.Y(1) + 28, 'entra = sale', 'end'], [P.R - 4, P.Y(1) - 10, 'entra = sale', 'end']], 21);
    return svgBox('0 0 600 300', 'Una tina que se llena con la llave fija y se vacía más rápido entre más agua tiene: el nivel sube y se estabiliza', s);
  };
  // S04 · Carga de un capacitor con las marcas de τ, 2τ y 3τ (63 %, 86 %, 95 %).
  D['c3s04-tau'] = function () {
    var P = plane({ W: 600, H: 320, x: [0, 5.2], y: [0, 1.15] });
    var s = P.axes('t / τ', 'q / Cε') + P.hline(1, 'aux');
    s += P.curve(function (t) { return 1 - Math.exp(-t); }, 'ref', 3.6);
    [[1, '63 %'], [2, '86 %'], [3, '95 %']].forEach(function (m) {
      var q = 1 - Math.exp(-m[0]);
      s += P.vline(m[0], 'axis', '4 6', 0, q) + P.dot(m[0], q, 'dot-ref', 5);
      s += P.tag([[P.X(m[0]) + 8, P.Y(q) + 22, m[1], 'start'], [P.X(m[0]) - 8, P.Y(q) - 10, m[1], 'end']], 17);
    });
    return svgBox('0 0 600 320', 'Carga de un capacitor: a una constante de tiempo llega al 63 por ciento, a dos al 86 y a tres al 95', s);
  };
  // S05 · El freno de la logística: rapidez de crecimiento rP(1 − P/K) contra P; máximo en K/2.
  D['c3s05-brake'] = function () {
    var P = plane({ W: 600, H: 300, x: [0, 115], y: [-4, 15] });
    var s = P.axes('P', 'P′', { x: [[50, 'K/2'], [100, 'K']] });
    s += P.curve(function (p) { return 0.5 * p * (1 - p / 100); }, 'ref', 3.6);
    s += P.curve(function (p) { return 0.5 * p; }, 'aux', 2, 0, 30, '6 6');
    s += P.dot(50, 12.5, 'dot-ref', 6) + P.dot(0, 0, 'dot-ref', 5) + P.dot(100, 0, 'dot-ref', 5);
    s += P.tag([[P.X(50), P.Y(12.5) + 34, 'máximo en K/2', 'middle'], [P.X(56), P.Y(12.5) - 12, 'máximo en K/2', 'start']], 21);
    s += P.tag([[P.X(31), P.Y(14.4), 'sin freno: rP', 'start'], [P.X(4), P.Y(14.4), 'sin freno: rP', 'start']], 21);
    return svgBox('0 0 600 300', 'La rapidez de crecimiento logística es una parábola en P: crece con P al principio, es máxima en K medios y se anula en K', s);
  };
  // S05 · y = 1/(1 + eˣ) y v = 1/y = 1 + eˣ, lado a lado.
  D['c3s05-yv'] = function () {
    var A = plane({ W: 600, H: 300, x: [-3, 3], y: [0, 1.1], pad: [40, 320, 26, 36] });
    var s = A.axes('x', 'y') + A.curve(function (x) { return 1 / (1 + Math.exp(x)); }, 'ref', 3.4);
    s += A.tag([[A.R - 4, A.T + 14, 'y: Bernoulli', 'end']], 17);
    var B = plane({ W: 600, H: 300, x: [-3, 3], y: [0, 22], pad: [330, 20, 26, 36] });
    s += B.axes('x', 'v') + B.curve(function (x) { return 1 + Math.exp(x); }, 'trace', 3.4);
    s += B.tag([[B.L + 8, B.T + 14, 'v = 1/y: lineal', 'start']], 17);
    s += arrow('error', 285, 150, 40, 0, 2.6);
    return svgBox('0 0 600 300', 'La solución y de una ecuación de Bernoulli y la misma solución en la variable v igual a 1 entre y, que resuelve una lineal', s);
  };

  /* ══════════════ Más figuras de los bloques B y C (S06–S15) ══════════════ */
  // Curva paramétrica (x(t), y(t)) en el plano P; registra sus puntos para que las etiquetas la esquiven.
  function pcurve(P, fx, fy, t0, t1, cls, w, dash, n) {
    var out = [], i, t, q; n = n || 200;
    for (i = 0; i <= n; i++) { t = t0 + (t1 - t0) * i / n; q = [P.X(fx(t)), P.Y(fy(t))]; out.push(isFinite(q[0]) && isFinite(q[1]) ? q : null); }
    out.forEach(function (q) { if (q) P.pts.push(q); });
    return poly(cls, out, w || 3, false, dash);
  }
  // S06 · Mapa topográfico: caminar por una curva de nivel no cambia la altura.
  D['c3s06-hill'] = function () {
    var P = plane({ W: 600, H: 360, x: [-3.4, 3.4], y: [-1.9, 1.9], pad: [20, 20, 44, 44] }), s = '';
    [0.5, 1, 1.5, 2, 2.5].forEach(function (r, i) {
      s += pcurve(P, function (t) { return r * Math.cos(t) * 1.25; }, function (t) { return r * Math.sin(t) * 0.68; }, 0, 2 * Math.PI, i === 2 ? 'ref' : 'axis', i === 2 ? 3.6 : 1.6, i === 2 ? null : '5 6', 120);
    });
    s += P.dot(0, 0, 'dot-ref', 5) + text(P.X(0), P.Y(0) - 12, 'cima', ' text-anchor="middle" font-size="18"');
    var t1 = 0.35, t2 = 1.15, r = 1.5;
    s += arrow('error', P.X(r * 1.25 * Math.cos(t1)), P.Y(r * 0.68 * Math.sin(t1)), P.X(r * 1.25 * Math.cos(t2)) - P.X(r * 1.25 * Math.cos(t1)), P.Y(r * 0.68 * Math.sin(t2)) - P.Y(r * 0.68 * Math.sin(t1)), 3);
    s += text(300, 28, 'por la curva: F = constante', ' text-anchor="middle" font-size="22"');
    s += text(300, 350, 'subir o bajar: cruzar curvas', ' text-anchor="middle" font-size="22"');
    return svgBox('0 0 600 360', 'Curvas de nivel de un cerro: caminar sobre una de ellas mantiene la altura constante', s);
  };
  // S06 · x² + xy + y² = 3: la solución que pasa por (1, 1) llega a (0, √3) y tiene tangente vertical donde N = 0.
  D['c3s06-implicit'] = function () {
    var P = plane({ W: 600, H: 330, x: [-2.6, 2.6], y: [-2.3, 2.3] }), s = P.axes('x', 'y');
    var up = function (x) { return (-x + Math.sqrt(12 - 3 * x * x)) / 2; }, dn = function (x) { return (-x - Math.sqrt(12 - 3 * x * x)) / 2; };
    s += pcurve(P, function (t) { return 2 * Math.cos(t); }, function (t) { var x = 2 * Math.cos(t); return Math.sin(t) >= 0 ? up(x) : dn(x); }, Math.PI, 2 * Math.PI, 'aux', 2.2, '6 6');
    s += pcurve(P, function (t) { return 2 * Math.cos(t); }, function (t) { return up(2 * Math.cos(t)); }, 0, Math.PI, 'ref', 3.6);
    s += P.dot(1, 1, 'dot-ref', 6) + P.dot(0, Math.sqrt(3), 'dot-ref', 6) + P.dot(2, -1, 'dot-error', 6) + P.dot(-2, 1, 'dot-error', 6);
    s += P.tagNear(1, 1, '(1, 1)', 17) + P.tag([[P.X(0) - 12, P.Y(Math.sqrt(3)) - 12, 'y(0) = √3', 'end'], [P.X(0) - 12, P.Y(Math.sqrt(3)) + 26, 'y(0) = √3', 'end']], 17);
    s += P.tag([[P.X(2) - 14, P.Y(-1) + 34, 'N = 0: tangente vertical', 'end'], [P.X(2) - 14, P.Y(-1.9), 'N = 0: tangente vertical', 'end']], 17);
    return svgBox('0 0 600 330', 'La curva de nivel x cuadrada más x y más y cuadrada igual a 3: la rama de arriba pasa por (1, 1) y por (0, raíz de 3)', s);
  };
  // S07 · Antes y después de multiplicar por μ = x: la diferencia M_y − N_x a lo largo de y = 1.
  D['c3s07-gap'] = function () {
    var P = plane({ W: 600, H: 300, x: [0, 3.2], y: [-0.6, 4.6] }), s = P.axes('x', '');
    s += P.curve(function (x) { return x + 1; }, 'error', 3, null, null, '7 6');
    s += P.curve(function () { return 0; }, 'ref', 4);
    s += P.tag([[P.X(2.9), P.Y(3.9) - 12, 'antes: Mᵧ − Nₓ = x + y', 'end'], [P.X(1.2), P.Y(3.6), 'antes: Mᵧ − Nₓ = x + y', 'end']], 18);
    s += P.tag([[P.R - 4, P.Y(0) - 14, 'con μ = x: 0, exacta', 'end'], [P.R - 4, P.Y(0) + 28, 'con μ = x: 0, exacta', 'end']], 18);
    s += text(P.L + 8, P.T + 16, 'a lo largo de y = 1', ' font-size="17"');
    return svgBox('0 0 600 300', 'La diferencia entre las parciales cruzadas antes de multiplicar por x es x más y; después es cero', s);
  };
  // S07 · La solución x²y² + x³ = 2 que pasa por (1, 1), y el valor en x = 0.5.
  D['c3s07-curve'] = function () {
    var P = plane({ W: 600, H: 300, x: [0, 1.4], y: [0, 4.2] }), s = P.axes('x', 'y', { x: [[0.5, '0.5'], [1, '1']] });
    var f = function (x) { return Math.sqrt(2 - x * x * x) / x; };
    s += P.curve(f, 'ref', 3.6, 0.3, Math.cbrt(2));
    s += P.dot(1, 1, 'dot-ref', 6) + P.dot(0.5, f(0.5), 'dot-ref', 6) + P.vline(0.5, 'axis', '4 6', 0, f(0.5));
    s += P.tagNear(1, 1, 'y(1) = 1', 17) + P.tagNear(0.5, f(0.5), 'y(0.5) ≈ 2.74', 17);
    s += P.tag([[P.R - 4, P.T + 16, 'x²y² + x³ = 2', 'end']], 18);
    return svgBox('0 0 600 300', 'La curva x cuadrada y cuadrada más x cubo igual a 2, que pasa por (1, 1); en x = 0.5 vale cerca de 2.74', s);
  };
  // S08 · Corriente en un RL: i = (E/R)(1 − e^(−Rt/L)), con τ = L/R = 0.05 s.
  D['c3s08-rl'] = function () {
    var P = plane({ W: 600, H: 300, x: [0, 0.27], y: [0, 1.4] }), s = P.axes('t (s)', 'i (A)', { x: [[0.05, 'τ = 0.05'], [0.1, '0.1'], [0.2, '0.2']], y: [[1.2, '1.2']] });
    s += P.hline(1.2, 'aux') + P.curve(function (t) { return 1.2 * (1 - Math.exp(-20 * t)); }, 'ref', 3.6);
    var i1 = 1.2 * (1 - Math.exp(-1));
    s += P.vline(0.05, 'axis', '4 6', 0, i1) + P.dot(0.05, i1, 'dot-ref', 6) + P.tagNear(0.05, i1, '63 %: ' + i1.toFixed(2) + ' A', 17);
    s += P.tag([[P.R - 4, P.Y(1.2) - 12, 'máximo E/R', 'end']], 17);
    return svgBox('0 0 600 300', 'La corriente en un circuito R L sube hacia E entre R; a una constante de tiempo llega al 63 por ciento', s);
  };
  // S08 · Tanque que se llena: el modelo con volumen variable contra el de volumen fijo.
  D['c3s08-volume'] = function () {
    var P = plane({ W: 600, H: 310, x: [0, 80], y: [0, 230] }), s = P.axes('t (min)', 'sal (g)', { x: [[50, '50']] });
    var vary = function (t) { var V = 100 + t; return 2 * V - 2e6 / (V * V); };
    var fixed = function (t) { return 200 * (1 - Math.exp(-0.03 * t)); };
    s += P.curve(fixed, 'error', 2.6, null, null, '7 6') + P.curve(vary, 'ref', 3.6);
    s += P.vline(50, 'axis', '4 6', 0, vary(50)) + P.dot(50, vary(50), 'dot-ref', 6);
    s += P.tagNear(50, vary(50), vary(50).toFixed(0) + ' g', 17);
    s += P.tag([[P.X(78), P.Y(vary(78)) - 14, 'V = 100 + t', 'end'], [P.X(30), P.Y(vary(30)) - 14, 'V = 100 + t', 'end']], 17);
    s += P.tag([[P.X(78), P.Y(fixed(78)) + 26, 'si V fuera fijo', 'end'], [P.X(78), P.Y(fixed(78)) - 12, 'si V fuera fijo', 'end']], 17);
    return svgBox('0 0 600 310', 'Cantidad de sal en un tanque que se llena, comparada con el modelo equivocado de volumen fijo', s);
  };
  // S09 · Independientes contra dependientes: e^(2x), e^(−3x) frente a eˣ, 3eˣ.
  D['c3s09-indep'] = function () {
    var A = plane({ W: 600, H: 300, x: [-1, 1], y: [0, 6], pad: [36, 324, 26, 60] }), s = A.axes('x', '');
    s += A.curve(function (x) { return Math.exp(2 * x); }, 'ref', 3.2) + A.curve(function (x) { return Math.exp(-3 * x); }, 'trace', 3.2);
    s += A.tag([[A.R - 2, A.Y(5.2), 'e²ˣ', 'end']], 22) + A.tag([[A.L + 6, A.Y(5.2), 'e⁻³ˣ', 'start'], [A.L + 30, A.Y(3), 'e⁻³ˣ', 'start']], 22);
    s += text(162, 280, 'independientes: W ≠ 0', ' text-anchor="middle" font-size="21"');
    var B = plane({ W: 600, H: 300, x: [-1, 1], y: [0, 6], pad: [324, 36, 26, 60] });
    s += B.axes('x', '') + B.curve(function (x) { return Math.exp(x); }, 'ref', 3.2) + B.curve(function (x) { return 3 * Math.exp(x); }, 'trace', 3.2);
    s += B.tag([[B.R - 2, B.Y(2.4), 'eˣ', 'end'], [B.X(0.5), B.Y(1.2), 'eˣ', 'start']], 22) + B.tag([[B.X(-0.95), B.Y(2.3) - 12, '3eˣ', 'start'], [B.X(0.1), B.Y(5), '3eˣ', 'end']], 22);
    s += text(438, 280, 'una es múltiplo: W = 0', ' text-anchor="middle" font-size="21"');
    return svgBox('0 0 600 300', 'A la izquierda dos soluciones independientes; a la derecha dos que son múltiplo una de la otra, con Wronskiano cero', s);
  };
  // S09 · El PVI armado con el conjunto fundamental: y = e^(2x) + 3e^(−x).
  D['c3s09-pvi'] = function () {
    var P = plane({ W: 600, H: 300, x: [-1, 1.2], y: [0, 12] }), s = P.axes('x', 'y');
    s += P.curve(function (x) { return Math.exp(2 * x); }, 'aux', 2.4, null, null, '6 6') + P.curve(function (x) { return 3 * Math.exp(-x); }, 'trace', 2.4, null, null, '6 6');
    s += P.curve(function (x) { return Math.exp(2 * x) + 3 * Math.exp(-x); }, 'ref', 3.8) + P.dot(0, 4, 'dot-ref', 6);
    s += P.tag([[P.X(0.95), P.Y(Math.exp(1.9)) + 26, 'c₁e²ˣ', 'end'], [P.X(1.15), P.Y(7), 'c₁e²ˣ', 'end']], 18);
    s += P.tag([[P.X(-0.95), P.Y(3 * Math.exp(0.95)) + 28, 'c₂e⁻ˣ', 'start'], [P.X(-0.6), P.Y(3), 'c₂e⁻ˣ', 'start']], 18);
    s += P.tagNear(0, 4, 'y(0) = 4', 17);
    return svgBox('0 0 600 300', 'La solución del PVI es la suma de e a la 2x y 3 por e a la menos x; pasa por (0, 4)', s);
  };
  // S10 · La puerta con cierre hidráulico: sobreamortiguada, crítica y subamortiguada.
  D['c3s10-door'] = function () {
    var P = plane({ W: 600, H: 300, x: [0, 8], y: [-0.55, 1.1] }), s = P.axes('t', 'ángulo');
    var over = function (t) { var a = -0.27, b = -3.73; return (b * Math.exp(a * t) - a * Math.exp(b * t)) / (b - a); };
    var crit = function (t) { return (1 + 2 * t) * Math.exp(-2 * t); };
    var und = function (t) { return Math.exp(-0.35 * t) * (Math.cos(2 * t) + 0.175 * Math.sin(2 * t)); };
    s += P.curve(over, 'trace', 2.8, null, null, '7 6') + P.curve(und, 'error', 2.8) + P.curve(crit, 'ref', 3.8);
    s += P.tag([[P.X(4.4), P.Y(over(4.4)) - 12, 'muy duro: lenta', 'start']], 20);
    s += P.tag([[P.X(1.1), P.Y(crit(1.1)) + 4, 'justo: crítica', 'start'], [P.X(0.5), P.Y(0.2), 'justo: crítica', 'start']], 20);
    s += P.tag([[P.X(2.6), P.Y(-0.42), 'débil: rebota', 'start'], [P.X(5), P.Y(-0.3), 'débil: rebota', 'start']], 20);
    return svgBox('0 0 600 300', 'El ángulo de una puerta con tres amortiguadores: el fuerte la cierra lento, el débil la hace rebotar y el crítico la cierra lo más rápido sin rebotar', s);
  };
  // S10 · Fórmula de Euler: e^(iθ) en el círculo unitario; su sombra en los ejes es cos θ y sen θ.
  D['c3s10-euler'] = function () {
    var P = plane({ W: 600, H: 330, x: [-1.9, 1.9], y: [-1.66, 1.66], pad: [46, 230, 24, 24] }), s = P.axes('Re', 'Im'), th = 0.9;
    s += pcurve(P, Math.cos, Math.sin, 0, 2 * Math.PI, 'axis', 1.8, '5 6', 120);
    s += seg('ref', P.X(0), P.Y(0), P.X(Math.cos(th)), P.Y(Math.sin(th)), 3);
    s += seg('trace', P.X(Math.cos(th)), P.Y(Math.sin(th)), P.X(Math.cos(th)), P.Y(0), 2.4, '5 5');
    s += seg('aux', P.X(0), P.Y(Math.sin(th)), P.X(Math.cos(th)), P.Y(Math.sin(th)), 2.4, '5 5');
    s += P.dot(Math.cos(th), Math.sin(th), 'dot-ref', 7) + text(P.X(Math.cos(th)) + 10, P.Y(Math.sin(th)) - 8, 'eⁱᶿ', ' font-size="20"');
    s += text(P.X(Math.cos(th)) + 6, P.Y(0) + 24, 'cos θ', ' font-size="19"') + text(P.X(0) - 8, P.Y(Math.sin(th)) + 5, 'sen θ', ' text-anchor="end" font-size="19"');
    s += text(400, 120, 'eⁱᶿ = cos θ + i sen θ', ' font-size="21"');
    s += text(400, 170, 'al girar, la sombra', ' font-size="20"') + text(400, 195, 'en cada eje oscila', ' font-size="20"');
    return svgBox('0 0 600 330', 'El punto e a la i theta recorre el círculo unitario; sus sombras en los ejes son coseno y seno', s);
  };
  // S10 · Raíces complejas: y = e^(−x)(cos 2x + sen 2x) entre las envolventes ±√2·e^(−x).
  D['c3s10-envelope'] = function () {
    var P = plane({ W: 600, H: 300, x: [0, 5], y: [-1.3, 1.5] }), s = P.axes('x', 'y');
    s += P.curve(function (x) { return Math.SQRT2 * Math.exp(-x); }, 'aux', 2.2, null, null, '6 6') + P.curve(function (x) { return -Math.SQRT2 * Math.exp(-x); }, 'aux', 2.2, null, null, '6 6');
    s += P.curve(function (x) { return Math.exp(-x) * (Math.cos(2 * x) + Math.sin(2 * x)); }, 'ref', 3.6) + P.dot(0, 1, 'dot-ref', 6);
    s += P.tag([[P.X(0.8), P.Y(Math.SQRT2 * Math.exp(-0.8)) - 12, '±√2·e⁻ˣ', 'start'], [P.X(1.4), P.Y(0.9), '±√2·e⁻ˣ', 'start']], 17);
    s += P.tag([[P.R - 4, P.Y(-0.9), 'periodo 2π/β = π', 'end'], [P.R - 4, P.Y(1.1), 'periodo 2π/β = π', 'end']], 17);
    return svgBox('0 0 600 300', 'La solución oscila con periodo pi dentro de dos curvas que se apagan como e a la menos x', s);
  };
  // S11 · El acorde: cosh 2x y cos 2x suman la solución de y⁽⁴⁾ − 16y = 0.
  D['c3s11-chord'] = function () {
    var P = plane({ W: 600, H: 300, x: [-1.6, 1.6], y: [-1.5, 6] }), s = P.axes('x', 'y');
    s += P.curve(function (x) { return Math.cosh(2 * x); }, 'aux', 2.4, null, null, '6 6') + P.curve(function (x) { return Math.cos(2 * x); }, 'trace', 2.4, null, null, '6 6');
    s += P.curve(function (x) { return Math.cosh(2 * x) + Math.cos(2 * x); }, 'ref', 3.8) + P.dot(0, 2, 'dot-ref', 6);
    s += P.tag([[P.X(-0.12), P.Y(5.4), 'cosh 2x: raíces ±2', 'end'], [P.X(0.12), P.Y(4.4), 'cosh 2x: raíces ±2', 'start']], 17);
    s += P.tag([[P.X(0.1), P.Y(-1.15), 'cos 2x: raíces ±2i', 'start'], [P.X(-0.1), P.Y(-1.15), 'cos 2x: raíces ±2i', 'end'], [P.X(0.1), P.Y(-0.3) + 24, 'cos 2x: raíces ±2i', 'start']], 17);
    s += P.tagNear(0, 2, 'y(0) = 2', 17);
    return svgBox('0 0 600 300', 'La solución es la suma de coseno hiperbólico de 2x y coseno de 2x, cada uno de un par de raíces', s);
  };
  // S11 · Tres raíces reales: e^x − 2e^(2x) + e^(3x) y sus tres «notas».
  D['c3s11-notes'] = function () {
    var A = plane({ W: 600, H: 320, x: [-0.5, 3.8], y: [-0.6, 3.6], pad: [24, 380, 22, 34] }), s = A.axes('Re', 'Im');
    [1, 2, 3].forEach(function (r) { s += A.dot(r, 0, 'dot-ref', 7) + text(A.X(r), A.Y(0) + 26, 'r = ' + r, ' text-anchor="middle" font-size="16"'); });
    s += text(A.X(0.1), A.Y(2.6), 'r³ − 6r² + 11r − 6', ' font-size="16"') + text(A.X(0.1), A.Y(2.1), '= (r − 1)(r − 2)(r − 3)', ' font-size="16"');
    var B = plane({ W: 600, H: 320, x: [0, 1.25], y: [-1.5, 10], pad: [260, 20, 22, 34] });
    s += B.axes('x', 'y');
    s += B.curve(Math.exp, 'aux', 2.2, null, null, '5 6') + B.curve(function (x) { return -2 * Math.exp(2 * x); }, 'trace', 2.2, null, null, '5 6') + B.curve(function (x) { return Math.exp(3 * x); }, 'error', 2.2, null, null, '5 6');
    s += B.curve(function (x) { return Math.exp(x) - 2 * Math.exp(2 * x) + Math.exp(3 * x); }, 'ref', 3.8);
    s += B.tag([[B.R - 4, B.Y(Math.exp(1.25)) - 10, 'eˣ', 'end']], 17) + B.tag([[B.X(0.55), B.Y(-1.15), '−2e²ˣ', 'start']], 17) + B.tag([[B.X(0.7), B.Y(Math.exp(2.1)) - 8, 'e³ˣ', 'end']], 17);
    s += B.tag([[B.R - 4, B.Y(7.2), 'y: la suma', 'end'], [B.R - 4, B.Y(4), 'y: la suma', 'end']], 17);
    return svgBox('0 0 600 320', 'Las tres raíces reales 1, 2 y 3 dan tres exponenciales; la solución del PVI es su combinación', s);
  };
  // S12 · El columpio: la fuerza g y la respuesta y = y_h + y_p; el transitorio se apaga y queda y_p.
  D['c3s12-response'] = function (st) {
    var k = Math.max(0, Math.min(2, Math.round(num(st, 'k', 2))));
    var P = plane({ W: 600, H: 310, x: [0, 9], y: [-6.4, 7.2] }), s = P.axes('x', '');
    var g = function (x) { return 25 * Math.cos(2 * x) / 5; }, yp = function (x) { return -3 * Math.cos(2 * x) + 4 * Math.sin(2 * x); };
    var y = function (x) { return (3 - 5 * x) * Math.exp(-x) + yp(x); };
    s += fade(P.curve(g, 'aux', 2.2, null, null, '3 6') + P.tag([[P.R - 4, P.T + 14, 'fuerza: 25 cos 2x (÷5)', 'end']], 16), 1);
    s += fade(P.curve(yp, 'trace', 2.6, null, null, '8 6') + P.tag([[P.X(9), P.B - 6, 'y_p: misma frecuencia', 'end'], [P.L + 6, P.B - 6, 'y_p: misma frecuencia', 'start']], 16), k >= 1 ? 1 : 0);
    s += fade(P.curve(y, 'ref', 3.6) + P.dot(0, 0, 'dot-ref', 6) + P.tag([[P.X(0.25), P.Y(-5.6), 'y = y_h + y_p: el inicio se apaga', 'start'], [P.X(0.25), P.T + 34, 'y = y_h + y_p: el inicio se apaga', 'start']], 16), k >= 2 ? 1 : 0);
    return svgBox('0 0 600 310', 'La fuerza, la solución particular con la misma frecuencia y la solución completa del PVI, cuyo transitorio se apaga', s);
  };
  // S12 · PVI y″ − y = 2: y = 2cosh x − 2 y el error de imponer las condiciones a y_h sola.
  D['c3s12-pvi'] = function () {
    var P = plane({ W: 600, H: 300, x: [-1.8, 1.8], y: [-2.8, 4] }), s = P.axes('x', 'y', { x: [[1, '1']] });
    s += P.hline(-2, 'trace', '7 6') + P.curve(function (x) { return 2 * Math.cosh(x) - 2; }, 'ref', 3.8) + P.dot(0, 0, 'dot-ref', 6);
    s += P.dot(1, Math.E + 1 / Math.E - 2, 'dot-ref', 6) + P.tagNear(1, Math.E + 1 / Math.E - 2, 'y(1) ≈ 1.086', 17);
    s += P.tag([[P.R - 4, P.Y(-2) + 26, 'y_p = −2', 'end'], [P.R - 4, P.Y(-2) - 12, 'y_p = −2', 'end']], 17);
    s += P.tag([[P.X(-1.7), P.Y(3.5), 'y = 2cosh x − 2', 'start']], 17);
    return svgBox('0 0 600 300', 'La solución del PVI es 2 coseno hiperbólico de x menos 2; la particular es la constante menos 2', s);
  };
  // S13 · Por qué falla Aeˣ: al sustituir eˣ sale 0, y con x·eˣ sale −eˣ.
  D['c3s13-kill'] = function () {
    var P = plane({ W: 600, H: 300, x: [-1.5, 1.5], y: [-3.4, 4.8] }), s = P.axes('x', '');
    s += P.curve(function () { return 0; }, 'error', 4);
    s += P.curve(function (x) { return -Math.exp(x); }, 'ref', 3.6);
    s += P.curve(function (x) { return 4 * Math.exp(x); }, 'aux', 2.4, null, null, '6 6');
    s += P.tag([[P.L + 6, P.Y(0) - 12, 'con Aeˣ: L = 0, nunca 4eˣ', 'start'], [P.L + 6, P.Y(0) + 26, 'con Aeˣ: L = 0, nunca 4eˣ', 'start']], 17);
    s += P.tag([[P.X(0.2), P.Y(-2.9), 'con x eˣ: L = −eˣ', 'start'], [P.X(-1.45), P.Y(-1.4), 'con x eˣ: L = −eˣ', 'start']], 17);
    s += P.tag([[P.X(0.2), P.Y(4.2), 'meta 4eˣ: A = −4', 'end'], [P.X(-1.4), P.Y(3.6), 'meta 4eˣ: A = −4', 'start']], 17);
    return svgBox('0 0 600 300', 'Al sustituir A e a la x en la ecuación sale cero; con x por e a la x sale menos e a la x, y con A = −4 se llega a 4 e a la x', s);
  };
  // S13 · Resonancia en cuentas: y_p = x sen 2x crece entre las rectas ±x.
  D['c3s13-grow'] = function () {
    var P = plane({ W: 600, H: 300, x: [0, 12.6], y: [-13, 13] }), s = P.axes('x', 'y');
    s += P.curve(function (x) { return x; }, 'aux', 2, null, null, '6 6') + P.curve(function (x) { return -x; }, 'aux', 2, null, null, '6 6');
    s += P.curve(function (x) { return x * Math.sin(2 * x); }, 'ref', 3.2);
    s += P.tag([[P.X(1), P.T + 16, 'y_p = x sen 2x', 'start']], 18) + P.tag([[P.R - 4, P.Y(-11.5) , 'amplitud ∝ x', 'end'], [P.X(8), P.Y(-12.4), 'amplitud ∝ x', 'end']], 17);
    return svgBox('0 0 600 300', 'La solución particular x por seno de 2x oscila con amplitud que crece como x', s);
  };
  // S14 · Variación de parámetros para y″ + y = sec x: u₁ = ln cos x, u₂ = x y y_p.
  D['c3s14-vary'] = function (st) {
    var k = Math.max(0, Math.min(2, Math.round(num(st, 'k', 2))));
    var P = plane({ W: 600, H: 310, x: [-1.5, 1.5], y: [-2.6, 1.8] }), s = P.axes('x', '');
    var yp = function (x) { return x * Math.sin(x) + Math.cos(x) * Math.log(Math.cos(x)); };
    s += fade(P.curve(Math.cos, 'aux', 2.2, null, null, '5 6') + P.curve(Math.sin, 'aux', 2.2, null, null, '5 6') + P.tag([[P.X(0.1), P.Y(1.25), 'base: cos x, sen x', 'start'], [P.X(-1.45), P.Y(1.5), 'base: cos x, sen x', 'start']], 16), k === 0 ? 1 : 0.35);
    s += fade(P.curve(function (x) { return Math.log(Math.cos(x)); }, 'error', 2.8, -1.45, 1.45) + P.curve(function (x) { return x; }, 'trace', 2.8) +
      P.tag([[P.X(-1.45), P.Y(-2.2), 'u₁ = ln cos x', 'start'], [P.X(0.4), P.Y(-2.3), 'u₁ = ln cos x', 'start']], 16) + P.tag([[P.X(1.45), P.Y(1.45) + 22, 'u₂ = x', 'end'], [P.X(0.95), P.Y(1.4), 'u₂ = x', 'end']], 16), k >= 1 ? (k === 1 ? 1 : 0.35) : 0);
    s += fade(P.curve(yp, 'ref', 3.8, -1.48, 1.48) + P.tag([[P.X(0), P.Y(yp(0)) - 14, 'y_p = u₁cos x + u₂sen x', 'middle'], [P.X(0), P.Y(-0.6), 'y_p = u₁cos x + u₂sen x', 'middle']], 16), k >= 2 ? 1 : 0);
    return svgBox('0 0 600 310', 'Las constantes de la base se vuelven funciones u1 = ln cos x y u2 = x; con ellas se arma la solución particular', s);
  };
  // S14 · PVI con tangente: y = sen x − cos x · ln(sec x + tan x).
  D['c3s14-tan'] = function () {
    var P = plane({ W: 600, H: 300, x: [0, 1.55], y: [-1.6, 3] }), s = P.axes('x', 'y', { x: [[1, '1']] });
    var y = function (x) { return Math.sin(x) - Math.cos(x) * Math.log(1 / Math.cos(x) + Math.tan(x)); };
    s += P.curve(Math.tan, 'aux', 2.2, null, null, '6 6') + P.curve(y, 'ref', 3.8) + P.dot(0, 0, 'dot-ref', 6) + P.dot(1, y(1), 'dot-ref', 6);
    s += P.tagNear(1, y(1), 'y(1) ≈ ' + y(1).toFixed(4), 17);
    s += P.tag([[P.X(1.2), P.Y(2.6), 'g = tan x', 'end'], [P.X(1.5), P.Y(2.6), 'g = tan x', 'end']], 17);
    return svgBox('0 0 600 300', 'La solución del PVI con tangente empieza en cero sin pendiente y baja; el lado derecho tan x crece hacia pi medios', s);
  };
  // S15 · Los cuatro regímenes del movimiento libre, todos desde x = 1 en reposo.
  D['c3s15-regimes'] = function () {
    var P = plane({ W: 600, H: 320, x: [0, 9], y: [-1.15, 1.2] }), s = P.axes('t', 'x');
    var free = function (t) { return Math.cos(2 * t); };
    var und = function (t) { return Math.exp(-0.3 * t) * (Math.cos(1.977 * t) + 0.3 / 1.977 * Math.sin(1.977 * t)); };
    var crit = function (t) { return (1 + 2 * t) * Math.exp(-2 * t); };
    var over = function (t) { var a = -0.54, b = -7.46; return (b * Math.exp(a * t) - a * Math.exp(b * t)) / (b - a); };
    s += P.curve(free, 'axis', 1.8, null, null, '4 6') + P.curve(und, 'error', 2.8) + P.curve(over, 'trace', 2.8, null, null, '8 6') + P.curve(crit, 'ref', 3.8);
    s += P.tag([[P.R - 4, P.T + 14, 'c = 0: para siempre', 'end']], 19);
    s += P.tag([[P.X(3.6), P.Y(-0.85), 'sub: oscila y se apaga', 'start'], [P.X(5), P.Y(-0.7), 'sub: oscila y se apaga', 'start']], 19);
    s += P.tag([[P.X(3.5), P.Y(over(3.5)) - 12, 'sobre: regresa lento', 'start']], 19);
    s += P.tag([[P.R - 4, P.T + 40, 'crítico (gruesa): el más rápido', 'end']], 19);
    return svgBox('0 0 600 320', 'Posición de la masa en los cuatro regímenes: sin amortiguar, subamortiguado, crítico y sobreamortiguado', s);
  };
  // S15 · RLC que se carga: q = 1 − e^(−t)(cos 3t + sen 3t / 3) oscila alrededor de Cε = 1.
  D['c3s15-rlc'] = function () {
    var P = plane({ W: 600, H: 300, x: [0, 5], y: [0, 1.6], pad: [76, 24, 22, 40] }), s = P.axes('t (s)', 'q (C)', { y: [[1, 'Cε = 1']] });
    var q = function (t) { return 1 - Math.exp(-t) * (Math.cos(3 * t) + Math.sin(3 * t) / 3); };
    s += P.hline(1, 'aux') + P.curve(function (t) { return 1 - Math.exp(-t / 0.4); }, 'trace', 2.2, null, null, '6 6') + P.curve(q, 'ref', 3.8);
    s += P.dot(1, q(1), 'dot-ref', 6) + P.tagNear(1, q(1), 'q(1) ≈ ' + q(1).toFixed(3), 17);
    s += P.tag([[P.R - 4, P.Y(0.55), 'RC: sube sin pasarse', 'end'], [P.R - 4, P.Y(0.4), 'RC: sube sin pasarse', 'end']], 16);
    s += P.tag([[P.X(1.2), P.T + 16, 'RLC: se pasa y regresa', 'start'], [P.X(2.4), P.T + 16, 'RLC: se pasa y regresa', 'start']], 16);
    return svgBox('0 0 600 300', 'La carga de un circuito R L C se pasa de C por épsilon y oscila antes de estabilizarse; la de un R C sube sin pasarse', s);
  };
  // S15 · Plano fase del sistema x′ = y, y′ = −4x: el punto recorre una elipse.
  D['c3s15-phase'] = function () {
    var P = plane({ W: 600, H: 320, x: [-2.4, 2.4], y: [-2.5, 2.5], pad: [130, 130, 20, 20] }), s = P.axes('x', 'y');
    s += pcurve(P, function (t) { return Math.cos(2 * t); }, function (t) { return -2 * Math.sin(2 * t); }, 0, Math.PI, 'ref', 3.6);
    var t = 0.35;
    s += arrow('error', P.X(Math.cos(2 * t)), P.Y(-2 * Math.sin(2 * t)), -Math.sin(2 * t) * 40, 2 * Math.cos(2 * t) * 20, 3);
    s += P.dot(1, 0, 'dot-ref', 6) + P.tagNear(1, 0, 't = 0', 17);
    s += text(P.R + 12, P.Y(1.8), 'x = cos 2t', ' font-size="18"') + text(P.R + 12, P.Y(1.2), 'y = −2 sen 2t', ' font-size="18"');
    return svgBox('0 0 600 320', 'En el plano fase el punto x, y recorre una elipse en el sentido de las manecillas: así se ve una oscilación', s);
  };

  /* ══════════════════════ S06 ══════════════════════ */
  // S06 · Curvas de nivel de F = x² + xy + y²: cada una es una solución de (2x + y)dx + (x + 2y)dy = 0.
  // state: { curves, pick, grad } en [0, 1]. El gradiente (M, N) es perpendicular a la curva.
  D['c3s06-levels'] = function (st) {
    var fc = num(st, 'curves', 1), fp = num(st, 'pick', 0), fg = num(st, 'grad', 0);
    var P = plane({ W: 600, H: 380, x: [-2.6, 2.6], y: [-2, 2], pad: [46, 24, 22, 40] });
    var F = function (x, y) { return x * x + x * y + y * y; };
    var s = P.axes('x', 'y');
    var fam = '';
    [0.5, 1.5, 3, 4.5].forEach(function (c) {
      var sg = levelSegs(P, F, c, [-2.6, 2.6], [-2, 2]);
      sg.forEach(function (q) { P.pts.push(q[0], q[1]); });
      fam += segsPath('aux', sg, 2, '6 6');
    });
    s += fade(fam, fc);
    if (fp > 0) {
      var sg3 = levelSegs(P, F, 3, [-2.6, 2.6], [-2, 2]);
      s += fade(segsPath('ref', sg3, 3.6), fp);
      s += fade(P.dot(1, 1, 'dot-ref', 7), fp);
    }
    if (fg > 0) {
      var x0 = 1, y0 = 1, M = 2 * x0 + y0, N = x0 + 2 * y0, L = Math.hypot(M, N), k = 70 / L;
      var px = P.X(x0), py = P.Y(y0), gx = M * k, gy = -N * k;
      s += fade(arrow('error', px, py, gx, gy, 3), fg);
      s += fade(seg('trace', px - gy * 0.9, py + gx * 0.9, px + gy * 0.9, py - gx * 0.9, 3), fg);
      P.pts.push.apply(P.pts, segPts(px, py, px + gx, py + gy));
      if (fg > 0.5) s += P.tag(around(px + gx, py + gy, '(M, N)'), 16);
    }
    if (fp > 0.5) s += P.tag([[P.X(-2.5), P.Y(-1.75), 'x² + xy + y² = 3', 'start'], [P.X(-2.5), P.Y(1.8), 'x² + xy + y² = 3', 'start']], 16);
    return svgBox('0 0 600 380', 'Curvas de nivel de F de x y igual a x cuadrada más x y más y cuadrada; la que pasa por (1, 1) es la solución, y el vector (M, N) es perpendicular a ella', s);
  };

  /* ══════════════════════ S08 ══════════════════════ */
  // S08 · Caída con resistencia: lineal (v′ = g − cv) y cuadrática (v′ = g − kv²) hacia su velocidad terminal.
  // state: { quad } en [0, 1].
  D['c3s08-drag'] = function (st) {
    var fq = num(st, 'quad', 1), g = 9.81, c = 0.4, k = 0.04, vl = g / c, vq = Math.sqrt(g / k);
    var P = plane({ W: 600, H: 340, x: [0, 12], y: [0, 28] });
    var s = P.axes('t (s)', 'v (m/s)');
    s += P.curve(function (t) { return g * t; }, 'axis', 1.6, 0, 2.6, '3 6');
    s += P.hline(vl, 'aux') + P.curve(function (t) { return vl * (1 - Math.exp(-c * t)); }, 'ref', 3.6);
    if (fq > 0) s += fade(P.hline(vq, 'aux', '2 6') + P.curve(function (t) { return vq * Math.tanh(Math.sqrt(g * k) * t); }, 'trace', 3.4), fq);
    s += P.tag([[P.X(2.7), P.Y(27), 'caída libre', 'start'], [P.X(1.2), P.Y(14), 'caída libre', 'end']], 15);
    s += P.tag([[P.R - 6, P.Y(vl) + 22, 'lineal: g/c', 'end'], [P.R - 6, P.Y(vl) - 10, 'lineal: g/c', 'end']], 15);
    if (fq > 0.5) s += P.tag([[P.R - 6, P.Y(vq) - 10, 'cuadrática: √(g/k)', 'end'], [P.R - 6, P.Y(vq) + 22, 'cuadrática: √(g/k)', 'end']], 15);
    return svgBox('0 0 600 340', 'Velocidad de un objeto que cae con resistencia lineal y con resistencia cuadrática: las dos se acercan a su velocidad terminal', s);
  };

  /* ══════════════════════ S09 ══════════════════════ */
  // S09 · Superposición: y₁ = e^(−x/2)cos 2x, y₂ = e^(−x/2)sin 2x y la combinación c₁y₁ + c₂y₂.
  // state: { c1, c2, combo } (combo en [0, 1] muestra la combinación).
  D['c3s09-combo'] = function (st) {
    var c1 = num(st, 'c1', 1), c2 = num(st, 'c2', 0), fc = num(st, 'combo', 0);
    var P = plane({ W: 600, H: 340, x: [0, 6], y: [-1.6, 1.6] });
    var y1 = function (x) { return Math.exp(-x / 2) * Math.cos(2 * x); }, y2 = function (x) { return Math.exp(-x / 2) * Math.sin(2 * x); };
    var s = P.axes('x', 'y');
    s += P.curve(y1, 'aux', 2.4, null, null, '7 6') + P.curve(y2, 'trace', 2.4, null, null, '2 6');
    if (fc > 0) s += fade(P.curve(function (x) { return c1 * y1(x) + c2 * y2(x); }, 'ref', 3.6), fc);
    s += P.tag([[P.X(0.1), P.Y(1.45), 'y₁ = e⁻ˣᐟ² cos 2x', 'start'], [P.R - 6, P.Y(1.45), 'y₁ = e⁻ˣᐟ² cos 2x', 'end']], 15);
    s += P.tag([[P.R - 6, P.Y(-1.35), 'y₂ = e⁻ˣᐟ² sin 2x', 'end'], [P.X(0.1), P.Y(-1.35), 'y₂ = e⁻ˣᐟ² sin 2x', 'start']], 15);
    if (fc > 0.5) s += P.tag([[P.R - 6, P.Y(1.05), c1.toFixed(1) + 'y₁ + ' + c2.toFixed(1) + 'y₂', 'end'], [P.R - 6, P.Y(-0.9), c1.toFixed(1) + 'y₁ + ' + c2.toFixed(1) + 'y₂', 'end']], 15);
    return svgBox('0 0 600 340', 'Dos soluciones de una ecuación lineal homogénea y una combinación de ellas, que también es solución', s);
  };

  /* ══════════════════════ S10 ══════════════════════ */
  // S10 · Raíces de r² + ar + b = 0 en el plano complejo (izquierda) y la forma de la solución (derecha).
  // state: { c } 0 = reales distintas, 1 = raíz doble, 2 = complejas.
  D['c3s10-cases'] = function (st) {
    var c = Math.max(0, Math.min(2, Math.round(num(st, 'c', 0))));
    var cases = [
      { a: 3, b: 2, f: function (x) { return 2 * Math.exp(-x) - Math.exp(-2 * x); }, txt: 'y = c₁eʳ¹ˣ + c₂eʳ²ˣ' },
      { a: 2, b: 1, f: function (x) { return (1 + x) * Math.exp(-x); }, txt: 'y = (c₁ + c₂x)eʳˣ' },
      { a: 0.6, b: 9.09, f: function (x) { return Math.exp(-0.3 * x) * (Math.cos(3 * x) + 0.1 * Math.sin(3 * x)); }, txt: 'y = eᵅˣ(c₁cos βx + c₂sin βx)' }
    ][c];
    var disc = cases.a * cases.a - 4 * cases.b, roots = disc >= 0 ? [[(-cases.a - Math.sqrt(disc)) / 2, 0], [(-cases.a + Math.sqrt(disc)) / 2, 0]] : [[-cases.a / 2, -Math.sqrt(-disc) / 2], [-cases.a / 2, Math.sqrt(-disc) / 2]];
    var L = plane({ W: 600, H: 320, x: [-3, 1], y: [-3.6, 3.6], pad: [20, 330, 30, 40] });
    var s = L.axes('Re', 'Im');
    roots.forEach(function (q) { s += L.dot(q[0], q[1], 'dot-ref', 7); });
    if (c === 1) s += L.tag([[L.X(roots[0][0]), L.Y(0) - 16, 'doble', 'middle']], 15);
    var R = plane({ W: 600, H: 320, x: [0, 6], y: [-1.1, 1.2], pad: [330, 20, 30, 40] });
    s += R.axes('x', 'y') + R.curve(cases.f, 'ref', 3.4);
    s += text(445, 312, cases.txt, ' text-anchor="middle" font-size="15"');
    return svgBox('0 0 600 320', 'Raíces de la ecuación característica en el plano complejo y la forma de la solución que les corresponde', s);
  };

  /* ══════════════════════ S11 ══════════════════════ */
  // S11 · Cada raíz (con su multiplicidad) da sus funciones de la base. state: { p } índice del polinomio.
  D['c3s11-basis'] = function (st) {
    var k = Math.max(0, Math.min(2, Math.round(num(st, 'p', 0))));
    var cases = [
      { poly: '(r − 1)(r − 2)(r − 3)', roots: [[1, 0, '1'], [2, 0, '1'], [3, 0, '1']], basis: ['eˣ', 'e²ˣ', 'e³ˣ'] },
      { poly: '(r + 1)³ (r − 2)', roots: [[-1, 0, '3'], [2, 0, '1']], basis: ['e⁻ˣ', 'x e⁻ˣ', 'x² e⁻ˣ', 'e²ˣ'] },
      { poly: '(r² + 4)² (r + 1)', roots: [[0, 2, '2'], [0, -2, '2'], [-1, 0, '1']], basis: ['cos 2x', 'sin 2x', 'x cos 2x', 'x sin 2x', 'e⁻ˣ'] }
    ][k];
    var P = plane({ W: 600, H: 300, x: [-3, 3.6], y: [-3, 3], pad: [20, 250, 30, 30] });
    var s = P.axes('Re', 'Im');
    cases.roots.forEach(function (q) {
      s += P.dot(q[0], q[1], 'dot-ref', 7);
      if (q[2] !== '1') s += P.tag(around(P.X(q[0]), P.Y(q[1]), '×' + q[2]), 15);
    });
    s += text(360, 40, cases.poly + ' = 0', ' font-size="17"');
    s += text(360, 74, 'base de soluciones:', ' font-size="15"');
    cases.basis.forEach(function (b, i) { s += text(372, 104 + i * 30, '• ' + b, ' font-size="21"'); });
    return svgBox('0 0 600 300', 'Raíces de un polinomio característico con su multiplicidad y las funciones de la base que les corresponden', s);
  };

  /* ══════════════════════ S13 ══════════════════════ */
  // S13 · Resonancia: y″ + 4y = 4cos ωx con ω cerca de 2 (acotada) y con ω = 2 (crece como x sin 2x).
  // state: { res } en [0, 1].
  D['c3s13-resonance'] = function (st) {
    var fr = num(st, 'res', 0);
    var P = plane({ W: 600, H: 320, x: [0, 18], y: [-10, 10] });
    var s = P.axes('x', 'y');
    var near = function (x) { return 4 / (4 - 2.89) * (Math.cos(1.7 * x) - Math.cos(2 * x)); };
    s += P.curve(near, 'aux', 2.6);
    if (fr > 0) s += fade(P.curve(function (x) { return 0.5 * x; }, 'axis', 1.4, null, null, '4 6') + P.curve(function (x) { return -0.5 * x; }, 'axis', 1.4, null, null, '4 6') + P.curve(function (x) { return x * Math.sin(2 * x); }, 'error', 3), fr);
    s += P.tag([[P.X(0.3), P.Y(-8.6), 'ω = 1.7: la amplitud sube y baja (pulsaciones)', 'start']], 15);
    if (fr > 0.5) s += P.tag([[P.X(0.3), P.Y(8.8), 'ω = 2: resonancia, yₚ = x sin 2x crece sin parar', 'start']], 15);
    return svgBox('0 0 600 320', 'Respuesta de un oscilador forzado: acotada fuera de resonancia y creciente como x por seno de 2x en resonancia', s);
  };

  /* ══════════════════════ S15 ══════════════════════ */
  // S15 · Masa–resorte–amortiguador y su análogo RLC.
  D['c3s15-spring'] = function () {
    var s = '';
    s += seg('axis', 40, 40, 40, 200, 4);                                    // pared
    for (var i = 0; i < 8; i++) s += seg('axis', 40, 48 + i * 20, 28, 60 + i * 20, 1.6);
    // Resorte (arriba) y amortiguador (abajo) entre la pared y la masa.
    var z = [[40, 90]], n = 10;
    for (var k = 1; k < n; k++) z.push([40 + k * 18, 90 + (k % 2 ? -14 : 14)]);
    z.push([220, 90]);
    s += poly('ref', z, 2.6);
    s += seg('aux', 40, 150, 120, 150, 2.6) + poly('aux', [[110, 134], [110, 166]], 2.6) + poly('aux', [[100, 128], [160, 128], [160, 172], [100, 172]], 2.6) + seg('aux', 160, 150, 220, 150, 2.6);
    s += fill('area-fill', [[220, 70], [300, 70], [300, 170], [220, 170]]) + poly('axis', [[220, 70], [300, 70], [300, 170], [220, 170]], 2.6, true);
    s += text(260, 128, 'm', ' text-anchor="middle" font-size="26"');
    s += text(130, 66, 'k', ' text-anchor="middle" font-size="20"') + text(130, 198, 'c', ' text-anchor="middle" font-size="20"');
    s += arrow('error', 304, 120, 60, 0, 3) + text(372, 126, 'F(t)', ' font-size="18"');
    s += arrow('trace', 220, 225, 80, 0, 2.4) + text(310, 230, 'x(t)', ' font-size="18"');
    s += seg('axis', 20, 182, 330, 182, 2);
    s += text(510, 70, 'mecánico', ' text-anchor="middle" font-size="15"') + text(510, 150, 'eléctrico', ' text-anchor="middle" font-size="15"');
    s += text(510, 98, 'm x″ + c x′ + k x = F', ' text-anchor="middle" font-size="15"');
    s += text(510, 178, 'L q″ + R q′ + q/C = E', ' text-anchor="middle" font-size="15"');
    s += text(300, 275, 'm ↔ L    c ↔ R    k ↔ 1/C    F ↔ E    x ↔ q', ' text-anchor="middle" font-size="16"');
    return svgBox('0 0 600 295', 'Masa sujeta a un resorte y a un amortiguador con una fuerza externa, y su equivalencia con un circuito RLC', s);
  };
  // S15 · Amplitud del estado estacionario contra la frecuencia de la fuerza, para varios c.
  // state: { c } amortiguamiento destacado.
  D['c3s15-amplitude'] = function (st) {
    var cc = num(st, 'c', 0.5), m = 1, k = 4, F0 = 1;
    var A = function (c) { return function (w) { return F0 / Math.sqrt(Math.pow(k - m * w * w, 2) + Math.pow(c * w, 2)); }; };
    var P = plane({ W: 600, H: 320, x: [0, 4], y: [0, 3.2] });
    var s = P.axes('ω', 'amplitud', { x: [[2, 'ω₀']] });
    [0.3, 0.8, 2].forEach(function (c) { s += P.curve(A(c), 'aux', 1.8, null, null, '6 6'); });
    s += P.curve(A(cc), 'ref', 3.4);
    s += P.vline(2, 'axis', '3 6');
    s += P.tag([[P.R - 6, P.T + 18, 'c = ' + cc.toFixed(2), 'end']], 16);
    return svgBox('0 0 600 320', 'Amplitud de la respuesta forzada contra la frecuencia: el pico está cerca de la frecuencia natural y es más alto entre menos amortiguamiento', s);
  };

  /* ══════════════════════ S07 ══════════════════════ */
  // S07 · (3xy + y²)dx + (x² + xy)dy = 0 no es exacta; con μ = x sí. Las curvas solución no cambian:
  // el campo de pendientes es el mismo y las curvas de nivel de F = x³y + x²y²/2 caen sobre él.
  // state: { level } en [0, 1].
  D['c3s07-same'] = function (st) {
    var fl = num(st, 'level', 1);
    var P = plane({ W: 600, H: 360, x: [0, 2.4], y: [0, 2.4] });
    var s = P.axes('x', 'y');
    s += P.field(function (x, y) { return -(3 * x * y + y * y) / (x * x + x * y); }, 13, 11, function (x, y) { return x > 1.5 && y > 2.0; });
    var F = function (x, y) { return x * x * x * y + x * x * y * y / 2; }, lv = '';
    [0.4, 1.5, 4].forEach(function (c) {
      var sg = levelSegs(P, F, c, [0.02, 2.4], [0.02, 2.4]);
      sg.forEach(function (q) { P.pts.push(q[0], q[1]); });
      lv += segsPath('ref', sg, 3.2);
    });
    s += fade(lv, fl);
    if (fl > 0.5) s += P.tag([[P.R - 6, P.T + 18, 'x³y + x²y²/2 = C', 'end']], 16);
    return svgBox('0 0 600 360', 'Campo de pendientes de la ecuación original y curvas de nivel de la función potencial que sale después de multiplicar por mu igual a x: las curvas siguen las rayitas', s);
  };
})();
