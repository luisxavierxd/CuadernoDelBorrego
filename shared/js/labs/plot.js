/* =====================================================================
   LabPlot: gráficas SVG sencillas para los labs (ejes, rejilla, curvas,
   rectas, puntos y etiquetas). Solo clases de rol; los colores salen de
   tokens.css, así que un cambio de tema no requiere redibujar.
     var p = LabPlot(svg, { x: [x0, x1], y: [y0, y1], equal: false });
     p.clear(); p.grid(); p.axes(); p.curve(fn, 'ref', 3);
   ===================================================================== */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;

  function niceStep(span, target) {
    var raw = span / (target || 6), p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  function fmt(v) { return Math.abs(v) < 1e-10 ? '0' : Number(v.toPrecision(4)).toString().replace('-', '−'); }

  function LabPlot(svg, box) {
    var vb = (svg.getAttribute('viewBox') || '0 0 640 380').split(/\s+/).map(Number);
    var W = vb[2], H = vb[3], L = 46, R = 14, T = 14, B = 30;
    var xr = box.x.slice(), yr = box.y.slice();
    if (box.equal) {
      var kx = (W - L - R) / (xr[1] - xr[0]), ky = (H - T - B) / (yr[1] - yr[0]), k = Math.min(kx, ky);
      var cx = (xr[0] + xr[1]) / 2, cy = (yr[0] + yr[1]) / 2;
      xr = [cx - (W - L - R) / k / 2, cx + (W - L - R) / k / 2];
      yr = [cy - (H - T - B) / k / 2, cy + (H - T - B) / k / 2];
    }
    var X = function (x) { return L + (x - xr[0]) / (xr[1] - xr[0]) * (W - L - R); };
    var Y = function (y) { return H - B - (y - yr[0]) / (yr[1] - yr[0]) * (H - T - B); };
    var clipId = 'lp-clip-' + (++uid);
    var layer = null;

    function el(tag, attrs, parent, text) {
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (text != null) n.textContent = text;
      (parent || layer).appendChild(n);
      return n;
    }
    function clear() {
      svg.innerHTML = '';
      var defs = el('defs', {}, svg);
      el('rect', { x: L, y: T, width: W - L - R, height: H - T - B }, el('clipPath', { id: clipId }, defs));
      layer = el('g', { class: 'sketch' }, svg);
      return api;
    }
    function grid() {
      var sx = niceStep(xr[1] - xr[0]), sy = niceStep(yr[1] - yr[0]), d = '';
      for (var x = Math.ceil(xr[0] / sx) * sx; x <= xr[1]; x += sx) d += 'M' + X(x).toFixed(1) + ' ' + T + 'V' + (H - B);
      for (var y = Math.ceil(yr[0] / sy) * sy; y <= yr[1]; y += sy) d += 'M' + L + ' ' + Y(y).toFixed(1) + 'H' + (W - R);
      el('path', { d: d, class: 'plot-grid', fill: 'none' });
      return api;
    }
    function axes() {
      var ax = yr[0] <= 0 && yr[1] >= 0 ? Y(0) : H - B;
      var ay = xr[0] <= 0 && xr[1] >= 0 ? X(0) : L;
      el('path', { d: 'M' + L + ' ' + ax + 'H' + (W - R) + 'M' + ay + ' ' + T + 'V' + (H - B), class: 'axis', 'stroke-width': 1.5, fill: 'none' });
      var sx = niceStep(xr[1] - xr[0]), sy = niceStep(yr[1] - yr[0]);
      for (var x = Math.ceil(xr[0] / sx) * sx; x <= xr[1] + 1e-9; x += sx) {
        if (Math.abs(x) < sx / 2) continue;
        el('text', { x: X(x), y: Math.min(H - 6, ax + 18), class: 'lab-tick', 'text-anchor': 'middle' }, null, fmt(x));
      }
      for (var y = Math.ceil(yr[0] / sy) * sy; y <= yr[1] + 1e-9; y += sy) {
        if (Math.abs(y) < sy / 2) continue;
        el('text', { x: Math.max(L - 6, ay - 6), y: Y(y) + 4, class: 'lab-tick', 'text-anchor': 'end' }, null, fmt(y));
      }
      return api;
    }
    // Curva y = fn(x); se corta donde no está definida o salta fuera del cuadro.
    function curve(fn, cls, w, dash, from, to) {
      var a = from != null ? from : xr[0], b = to != null ? to : xr[1], n = 320, d = '', pen = false, span = yr[1] - yr[0], prev = null;
      for (var i = 0; i <= n; i++) {
        var x = a + (b - a) * i / n, y = fn(x);
        if (!isFinite(y) || y < yr[0] - 3 * span || y > yr[1] + 3 * span || (prev !== null && Math.abs(y - prev) > 2 * span)) { pen = false; prev = isFinite(y) ? y : null; continue; }
        d += (pen ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1);
        pen = true; prev = y;
      }
      if (d) el('path', { d: d, class: cls, fill: 'none', 'stroke-width': w || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': dash, 'clip-path': 'url(#' + clipId + ')' });
      return api;
    }
    function line(fn, cls, w, dash) { return curve(fn, cls, w, dash); }
    function segments(segs, cls, w) {
      var d = segs.map(function (s) { return 'M' + X(s[0][0]).toFixed(1) + ' ' + Y(s[0][1]).toFixed(1) + 'L' + X(s[1][0]).toFixed(1) + ' ' + Y(s[1][1]).toFixed(1); }).join('');
      el('path', { d: d, class: cls, fill: 'none', 'stroke-width': w || 3, 'stroke-linecap': 'round', 'clip-path': 'url(#' + clipId + ')' });
      return api;
    }
    function point(x, y, cls, r) {
      if (isFinite(x) && isFinite(y) && y >= yr[0] && y <= yr[1]) el('circle', { cx: X(x), cy: Y(y), r: r || 6, class: cls });
      return api;
    }
    function label(x, y, text, anchor, size, dx, dy) {
      var py = Math.max(T + 14, Math.min(H - B - 4, Y(y) + (dy || 0)));
      el('text', { x: X(x) + (dx || 0), y: py, class: 'ann', 'text-anchor': anchor || 'start', 'font-size': size || 16 }, null, text);
      return api;
    }
    var api = { clear: clear, grid: grid, axes: axes, curve: curve, line: line, segments: segments, point: point, label: label, X: X, Y: Y, xr: xr, yr: yr };
    return api;
  }

  // Rango y con percentiles 2–98, incluye el 0 y deja margen.
  LabPlot.range = function (values) {
    var ys = values.filter(function (v) { return isFinite(v); }).concat([0]).sort(function (a, b) { return a - b; });
    var lo = ys[Math.floor(ys.length * 0.02)], hi = ys[Math.ceil(ys.length * 0.98) - 1];
    lo = Math.min(lo, 0); hi = Math.max(hi, 0);
    if (hi - lo < 1) { hi += 0.5; lo -= 0.5; }
    var pad = (hi - lo) * 0.12;
    return [lo - pad, hi + pad];
  };

  window.LabPlot = LabPlot;
})();
